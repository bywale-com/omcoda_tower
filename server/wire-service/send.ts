import type { Context } from "hono";
import { getPool } from "./db.ts";
import { getResend, mailRoot } from "./resendClient.ts";
import { getTwilio, twilioFromNumber } from "./twilioClient.ts";
import { getWireCapabilities } from "./capabilities.ts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function handleCemSend(c: Context) {
  const caps = getWireCapabilities();
  if (!caps.resend) {
    return c.json({ ok: false, deny: "policy", detail: "RESEND_API_KEY missing" }, 503);
  }

  const body = await c.req.json<{
    to: string;
    from?: string;
    subject: string;
    bodyText: string;
    html?: string;
    firmId: string;
    sendingIdentityId?: string;
    contactId?: string;
    purpose: string;
    forceDeny?: "auth" | "throttle" | "policy";
  }>();

  if (body.forceDeny) {
    return c.json({ ok: false, deny: body.forceDeny, detail: `forced ${body.forceDeny}` });
  }

  // Consent / halt fail-closed when contact known
  if (body.contactId) {
    const consent = await getPool().query(
      `SELECT basis, silenced FROM consent_records WHERE contact_id = $1 LIMIT 1`,
      [body.contactId],
    );
    const row = consent.rows[0];
    if (row?.silenced) {
      return c.json({ ok: false, deny: "policy", detail: "silenced" });
    }
    if (
      body.purpose !== "opt-in" &&
      (!row || row.basis === "none")
    ) {
      return c.json({ ok: false, deny: "policy", detail: "consent missing" });
    }
    const halted = await getPool().query(
      `SELECT 1 FROM halt_records
       WHERE lifted_at IS NULL
         AND ((scope = 'contact' AND contact_id = $1)
           OR (scope = 'firm-book' AND firm_id = $2))
       LIMIT 1`,
      [body.contactId, body.firmId],
    );
    if (halted.rowCount! > 0) {
      return c.json({ ok: false, deny: "policy", detail: "halt active" });
    }
  }

  const domainRow = await getPool().query(
    `SELECT full_domain, status FROM sending_domains WHERE firm_id = $1`,
    [body.firmId],
  );
  const poolDomain = domainRow.rows[0]?.full_domain as string | undefined;
  const childVerified = domainRow.rows[0]?.status === "verified";
  // Prefer verified child subdomain; else RESEND_FROM_EMAIL / root (already verified).
  const from =
    body.from ||
    (poolDomain && childVerified
      ? `Tower <noreply@${poolDomain}>`
      : caps.fromEmail || `Tower <send@${mailRoot()}>`);

  try {
    const { data, error } = await getResend().emails.send({
      from,
      to: body.to,
      subject: body.subject,
      text: body.bodyText,
      html: body.html ?? `<p>${body.bodyText.replace(/\n/g, "<br/>")}</p>`,
    });
    if (error) {
      return c.json({ ok: false, deny: "policy", detail: error.message });
    }
    const messageId = data?.id ?? id("esp");
    const acceptedAt = new Date().toISOString();
    const outboundId = id("out");
    await getPool().query(
      `INSERT INTO outbound_messages
        (id, firm_id, contact_id, channel, purpose, to_addr, from_addr, provider_message_id, status)
       VALUES ($1,$2,$3,'email',$4,$5,$6,$7,'accepted')`,
      [
        outboundId,
        body.firmId,
        body.contactId ?? null,
        body.purpose,
        body.to,
        from,
        messageId,
      ],
    );
    await getPool().query(
      `INSERT INTO messaging_events (id, at, firm_id, message_id, event_class, contact_id)
       VALUES ($1,$2,$3,$4,'accepted',$5)`,
      [id("evt"), acceptedAt, body.firmId, messageId, body.contactId ?? null],
    );
    return c.json({ ok: true, messageId, acceptedAt });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "send failed";
    return c.json({ ok: false, deny: "policy", detail });
  }
}

export async function handleSmsSend(c: Context) {
  const caps = getWireCapabilities();
  if (!caps.twilio) {
    return c.json({ ok: false, deny: "ca-number", detail: "Twilio secrets / FROM missing" }, 503);
  }

  const body = await c.req.json<{
    to: string;
    body: string;
    firmId: string;
    contactId?: string;
  }>();

  if (body.contactId) {
    const consent = await getPool().query(
      `SELECT basis, silenced FROM consent_records WHERE contact_id = $1 LIMIT 1`,
      [body.contactId],
    );
    const row = consent.rows[0];
    if (row?.silenced) return c.json({ ok: false, deny: "STOP" });
    if (!row || row.basis === "none") return c.json({ ok: false, deny: "consent" });
  }

  try {
    const twilio = await getTwilio();
    const msg = await twilio.messages.create({
      to: body.to,
      from: twilioFromNumber(),
      body: body.body,
    });
    const messageSid = msg.sid;
    await getPool().query(
      `INSERT INTO outbound_messages
        (id, firm_id, contact_id, channel, purpose, to_addr, from_addr, provider_message_id, status)
       VALUES ($1,$2,$3,'sms','cem',$4,$5,$6,'accepted')`,
      [
        id("out"),
        body.firmId,
        body.contactId ?? null,
        body.to,
        twilioFromNumber(),
        messageSid,
      ],
    );
    return c.json({ ok: true, messageSid });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "sms failed";
    return c.json({ ok: false, deny: "throughput", detail });
  }
}
