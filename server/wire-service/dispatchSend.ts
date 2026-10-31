/**
 * Callable send path shared by HTTP handlers, enrollment actuation, and the tick worker.
 * Consent / halt / silence hard-gates live here — same as /wire/send/*.
 *
 * Cascade/worker entrypoints check SEND_MODE + SEND_TEST_COHORT first (fail closed).
 * HTTP /wire/send/* uses the live dispatchers directly (explicit probe path).
 */
import { getPool } from "./db.ts";
import { contactAccessUrlForSend } from "./contactAccessMint.ts";
import { getResend, mailRoot } from "./resendClient.ts";
import { getTwilio, twilioFromNumber } from "./twilioClient.ts";
import { getWireCapabilities } from "./capabilities.ts";
import { shouldLiveSend } from "./sendMode.ts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type DispatchPursuitStamp = {
  enrollmentId?: string | null;
  campaignId?: string | null;
  campaignObjectiveId?: string | null;
  attemptId?: string | null;
};

export type DispatchEmailInput = {
  to: string;
  from?: string;
  subject: string;
  bodyText: string;
  html?: string;
  firmId: string;
  contactId?: string;
  purpose: string;
} & DispatchPursuitStamp;

export type DispatchSmsInput = {
  to: string;
  body: string;
  firmId: string;
  contactId?: string;
  purpose?: string;
} & DispatchPursuitStamp;

export type DispatchResult =
  | { ok: true; dryRun: false; messageId: string; acceptedAt: string; channel: "email" | "sms" }
  | { ok: true; dryRun: true; reason: string; channel: "email" | "sms" }
  | { ok: false; deny: string; detail?: string; dryRun?: boolean };

async function consentAndHaltGate(
  contactId: string | undefined,
  firmId: string,
  purpose: string,
): Promise<{ allow: true } | { allow: false; deny: string; detail: string }> {
  const pool = getPool();

  // H1: firm-book halt always blocks new sends (even without contactId).
  const firmHalted = await pool.query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL AND scope = 'firm-book' AND firm_id = $1
     LIMIT 1`,
    [firmId],
  );
  if (firmHalted.rowCount && firmHalted.rowCount > 0) {
    return { allow: false, deny: "policy", detail: "halt active" };
  }

  if (!contactId) return { allow: true };

  const consent = await pool.query<{ basis: string; silenced: boolean; status?: string }>(
    `SELECT basis, silenced, status FROM consent_records WHERE contact_id = $1 LIMIT 1`,
    [contactId],
  );
  const row = consent.rows[0];
  if (row?.silenced || row?.status === "silenced") {
    return { allow: false, deny: "policy", detail: "silenced" };
  }
  if (purpose !== "opt-in" && (!row || row.basis === "none")) {
    return { allow: false, deny: "policy", detail: "consent missing" };
  }
  const contactHalted = await pool.query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL AND scope = 'contact' AND contact_id = $1
     LIMIT 1`,
    [contactId],
  );
  if (contactHalted.rowCount && contactHalted.rowCount > 0) {
    return { allow: false, deny: "policy", detail: "halt active" };
  }
  return { allow: true };
}

/** Exported for enrollAndActuate — block NEW enrollments under firm-book / contact halt (H1). */
export async function isHaltBlockingNew(
  firmId: string,
  contactId?: string,
): Promise<boolean> {
  const pool = getPool();
  const halted = await pool.query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL
       AND ((scope = 'firm-book' AND firm_id = $1)
         OR ($2::text IS NOT NULL AND scope = 'contact' AND contact_id = $2 AND firm_id = $1))
     LIMIT 1`,
    [firmId, contactId ?? null],
  );
  return Boolean(halted.rowCount && halted.rowCount > 0);
}

/** Real Resend send + outbound_messages / messaging_events writeback. */
export async function dispatchEmailLive(input: DispatchEmailInput): Promise<DispatchResult> {
  const channel = "email" as const;
  const caps = getWireCapabilities();
  if (!caps.resend) {
    return { ok: false, deny: "policy", detail: "RESEND_API_KEY missing", dryRun: false };
  }

  const gate = await consentAndHaltGate(input.contactId, input.firmId, input.purpose);
  if (!gate.allow) {
    return { ok: false, deny: gate.deny, detail: gate.detail };
  }

  const pool = getPool();
  let bodyText = input.bodyText;
  let html = input.html;
  if (input.contactId) {
    try {
      const seatUrl = await contactAccessUrlForSend(pool, {
        firmId: input.firmId,
        contactId: input.contactId,
      });
      if (!bodyText.includes("/c/")) {
        bodyText = `${bodyText}\n\n${seatUrl}`;
      }
      if (html && !html.includes("/c/")) {
        html = `${html}<p><a href="${seatUrl}">${seatUrl}</a></p>`;
      }
    } catch {
      /* send still goes; token mint is not a send gate */
    }
  }
  const domainRow = await pool.query(
    `SELECT full_domain, status FROM sending_domains WHERE firm_id = $1`,
    [input.firmId],
  );
  const poolDomain = domainRow.rows[0]?.full_domain as string | undefined;
  const childVerified = domainRow.rows[0]?.status === "verified";
  const from =
    input.from ||
    (poolDomain && childVerified
      ? `Tower <noreply@${poolDomain}>`
      : caps.fromEmail || `Tower <send@${mailRoot()}>`);

  try {
    const { data, error } = await getResend().emails.send({
      from,
      to: input.to,
      subject: input.subject,
      text: bodyText,
      html: html ?? `<p>${bodyText.replace(/\n/g, "<br/>")}</p>`,
    });
    if (error) {
      return { ok: false, deny: "policy", detail: error.message };
    }
    const messageId = data?.id ?? id("esp");
    const acceptedAt = new Date().toISOString();
    const bodyHtml = html ?? `<p>${bodyText.replace(/\n/g, "<br/>")}</p>`;
    await pool.query(
      `INSERT INTO outbound_messages
        (id, firm_id, contact_id, channel, purpose, to_addr, from_addr, provider_message_id, status,
         subject, body_text, body_html, content,
         enrollment_id, campaign_id, campaign_objective_id, attempt_id)
       VALUES ($1,$2,$3,'email',$4,$5,$6,$7,'accepted',$8,$9,$10,$11::jsonb,$12,$13,$14,$15)`,
      [
        id("out"),
        input.firmId,
        input.contactId ?? null,
        input.purpose,
        input.to,
        from,
        messageId,
        input.subject,
        bodyText,
        bodyHtml,
        JSON.stringify({
          channel: "email",
          subject: input.subject,
          bodyText,
          bodyHtml,
        }),
        input.enrollmentId ?? null,
        input.campaignId ?? null,
        input.campaignObjectiveId ?? null,
        input.attemptId ?? null,
      ],
    );
    await pool.query(
      `INSERT INTO messaging_events (id, at, firm_id, message_id, event_class, contact_id)
       VALUES ($1,$2,$3,$4,'accepted',$5)`,
      [id("evt"), acceptedAt, input.firmId, messageId, input.contactId ?? null],
    );
    return { ok: true, dryRun: false, messageId, acceptedAt, channel };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "send failed";
    return { ok: false, deny: "policy", detail };
  }
}

/** Real Twilio send + outbound_messages / messaging_events writeback. */
export async function dispatchSmsLive(input: DispatchSmsInput): Promise<DispatchResult> {
  const channel = "sms" as const;
  const caps = getWireCapabilities();
  if (!caps.twilio) {
    return { ok: false, deny: "ca-number", detail: "Twilio secrets / FROM missing" };
  }

  const purpose = input.purpose ?? "cem";
  const gate = await consentAndHaltGate(input.contactId, input.firmId, purpose);
  if (!gate.allow) {
    return { ok: false, deny: gate.deny, detail: gate.detail };
  }

  try {
    const pool = getPool();
    let body = input.body;
    if (input.contactId) {
      try {
        const seatUrl = await contactAccessUrlForSend(pool, {
          firmId: input.firmId,
          contactId: input.contactId,
        });
        if (!body.includes("/c/")) body = `${body}\n${seatUrl}`;
      } catch {
        /* send still goes */
      }
    }
    const twilio = await getTwilio();
    const msg = await twilio.messages.create({
      to: input.to,
      from: twilioFromNumber(),
      body,
    });
    const messageSid = msg.sid;
    await pool.query(
      `INSERT INTO outbound_messages
        (id, firm_id, contact_id, channel, purpose, to_addr, from_addr, provider_message_id, status,
         body_text, content, enrollment_id, campaign_id, campaign_objective_id, attempt_id)
       VALUES ($1,$2,$3,'sms',$4,$5,$6,$7,'accepted',$8,$9::jsonb,$10,$11,$12,$13)`,
      [
        id("out"),
        input.firmId,
        input.contactId ?? null,
        purpose,
        input.to,
        twilioFromNumber(),
        messageSid,
        body,
        JSON.stringify({ channel: "sms", bodyText: body }),
        input.enrollmentId ?? null,
        input.campaignId ?? null,
        input.campaignObjectiveId ?? null,
        input.attemptId ?? null,
      ],
    );
    await pool.query(
      `INSERT INTO messaging_events (id, at, firm_id, message_id, event_class, contact_id)
       VALUES ($1,now(),$2,$3,'accepted',$4)`,
      [id("evt"), input.firmId, messageSid, input.contactId ?? null],
    );
    return {
      ok: true,
      dryRun: false,
      messageId: messageSid,
      acceptedAt: new Date().toISOString(),
      channel,
    };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "sms failed";
    return { ok: false, deny: "throughput", detail };
  }
}

/** Gated send for cascade/worker — fail closed to dry-run, but halt still denies (H1). */
export async function dispatchEmail(input: DispatchEmailInput): Promise<DispatchResult> {
  const halt = await consentAndHaltGate(input.contactId, input.firmId, input.purpose);
  if (!halt.allow) {
    return { ok: false, deny: halt.deny, detail: halt.detail };
  }
  if (!shouldLiveSend(input.contactId)) {
    return {
      ok: true,
      dryRun: true,
      reason: "SEND_MODE/cohort gate — fail closed",
      channel: "email",
    };
  }
  return dispatchEmailLive(input);
}

export async function dispatchSms(input: DispatchSmsInput): Promise<DispatchResult> {
  const purpose = input.purpose ?? "cem";
  const halt = await consentAndHaltGate(input.contactId, input.firmId, purpose);
  if (!halt.allow) {
    return { ok: false, deny: halt.deny, detail: halt.detail };
  }
  if (!shouldLiveSend(input.contactId)) {
    return {
      ok: true,
      dryRun: true,
      reason: "SEND_MODE/cohort gate — fail closed",
      channel: "sms",
    };
  }
  return dispatchSmsLive(input);
}
