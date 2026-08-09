/**
 * Callable send path shared by HTTP handlers, enrollment actuation, and the tick worker.
 * Consent / halt / silence hard-gates live here — same as /wire/send/*.
 *
 * Cascade/worker entrypoints check SEND_MODE + SEND_TEST_COHORT first (fail closed).
 * HTTP /wire/send/* uses the live dispatchers directly (explicit probe path).
 */
import { getPool } from "./db.ts";
import { getResend, mailRoot } from "./resendClient.ts";
import { getTwilio, twilioFromNumber } from "./twilioClient.ts";
import { getWireCapabilities } from "./capabilities.ts";
import { shouldLiveSend } from "./sendMode.ts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type DispatchEmailInput = {
  to: string;
  from?: string;
  subject: string;
  bodyText: string;
  html?: string;
  firmId: string;
  contactId?: string;
  purpose: string;
};

export type DispatchSmsInput = {
  to: string;
  body: string;
  firmId: string;
  contactId?: string;
  purpose?: string;
};

export type DispatchResult =
  | { ok: true; dryRun: false; messageId: string; acceptedAt: string; channel: "email" | "sms" }
  | { ok: true; dryRun: true; reason: string; channel: "email" | "sms" }
  | { ok: false; deny: string; detail?: string; dryRun?: boolean };

async function consentAndHaltGate(
  contactId: string | undefined,
  firmId: string,
  purpose: string,
): Promise<{ allow: true } | { allow: false; deny: string; detail: string }> {
  if (!contactId) return { allow: true };
  const pool = getPool();
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
  const halted = await pool.query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL
       AND ((scope = 'contact' AND contact_id = $1)
         OR (scope = 'firm-book' AND firm_id = $2))
     LIMIT 1`,
    [contactId, firmId],
  );
  if (halted.rowCount && halted.rowCount > 0) {
    return { allow: false, deny: "policy", detail: "halt active" };
  }
  return { allow: true };
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
      text: input.bodyText,
      html: input.html ?? `<p>${input.bodyText.replace(/\n/g, "<br/>")}</p>`,
    });
    if (error) {
      return { ok: false, deny: "policy", detail: error.message };
    }
    const messageId = data?.id ?? id("esp");
    const acceptedAt = new Date().toISOString();
    await pool.query(
      `INSERT INTO outbound_messages
        (id, firm_id, contact_id, channel, purpose, to_addr, from_addr, provider_message_id, status)
       VALUES ($1,$2,$3,'email',$4,$5,$6,$7,'accepted')`,
      [
        id("out"),
        input.firmId,
        input.contactId ?? null,
        input.purpose,
        input.to,
        from,
        messageId,
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
    const twilio = await getTwilio();
    const msg = await twilio.messages.create({
      to: input.to,
      from: twilioFromNumber(),
      body: input.body,
    });
    const messageSid = msg.sid;
    const pool = getPool();
    await pool.query(
      `INSERT INTO outbound_messages
        (id, firm_id, contact_id, channel, purpose, to_addr, from_addr, provider_message_id, status)
       VALUES ($1,$2,$3,'sms',$4,$5,$6,$7,'accepted')`,
      [
        id("out"),
        input.firmId,
        input.contactId ?? null,
        purpose,
        input.to,
        twilioFromNumber(),
        messageSid,
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

/** Gated send for cascade/worker — fail closed to dry-run. */
export async function dispatchEmail(input: DispatchEmailInput): Promise<DispatchResult> {
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
