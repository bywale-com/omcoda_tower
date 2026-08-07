import type { Context } from "hono";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getPool } from "./db.ts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type ResendEvent = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string[];
    bounce?: { message?: string };
    click?: unknown;
  };
};

function mapClass(type: string): string | null {
  switch (type) {
    case "email.sent":
    case "email.delivered":
      return type === "email.sent" ? "accepted" : "delivered";
    case "email.delivery_delayed":
      return "deferred";
    case "email.bounced":
      return "bounce_hard";
    case "email.complained":
      return "complaint";
    case "email.failed":
      return "rejected";
    default:
      return null;
  }
}

/** Optional Svix-style verify when RESEND_WEBHOOK_SECRET is set. */
function verifyResendSignature(rawBody: string, headers: Headers): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) return true; // accept when secret not configured (fail-open for ingress setup)
  const svixId = headers.get("svix-id");
  const svixTimestamp = headers.get("svix-timestamp");
  const svixSignature = headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) return false;
  const toSign = `${svixId}.${svixTimestamp}.${rawBody}`;
  const key = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice(6), "base64")
    : Buffer.from(secret);
  const expected = createHmac("sha256", key).update(toSign).digest("base64");
  const candidates = svixSignature.split(" ").map((part) => part.replace(/^v1,/, ""));
  return candidates.some((sig) => {
    try {
      const a = Buffer.from(sig);
      const b = Buffer.from(expected);
      return a.length === b.length && timingSafeEqual(a, b);
    } catch {
      return false;
    }
  });
}

export async function handleResendWebhook(c: Context) {
  const raw = await c.req.text();
  const signatureOk = verifyResendSignature(raw, c.req.raw.headers);
  if (!signatureOk) {
    return c.json({ ok: false, detail: "bad signature" }, 401);
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(raw) as ResendEvent;
  } catch {
    return c.json({ ok: false, detail: "invalid json" }, 400);
  }

  const providerEventId =
    c.req.header("svix-id") ||
    `${event.type ?? "unknown"}:${event.data?.email_id ?? id("resend")}`;

  const pool = getPool();
  try {
    await pool.query(
      `INSERT INTO provider_webhook_receipts (provider, provider_event_id, signature_ok, payload)
       VALUES ('resend', $1, $2, $3)`,
      [providerEventId, signatureOk, raw],
    );
  } catch {
    // unique violation = replay
    return c.json({ ok: true, deduped: true });
  }

  const eventClass = event.type ? mapClass(event.type) : null;
  const messageId = event.data?.email_id ?? "unknown";

  if (eventClass) {
    // Resolve firm from outbound_messages when possible
    const out = await pool.query(
      `SELECT firm_id, contact_id FROM outbound_messages WHERE provider_message_id = $1 LIMIT 1`,
      [messageId],
    );
    const firmId = (out.rows[0]?.firm_id as string) ?? "unknown";
    const contactId = out.rows[0]?.contact_id as string | null;

    await pool.query(
      `INSERT INTO messaging_events
        (id, at, firm_id, message_id, event_class, contact_id, provider_event_id, raw)
       VALUES ($1,now(),$2,$3,$4,$5,$6,$7::jsonb)`,
      [
        id("evt"),
        firmId,
        messageId,
        eventClass,
        contactId,
        providerEventId,
        raw,
      ],
    );

    if (eventClass === "bounce_hard" && contactId) {
      await pool.query(
        `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, source, updated_at)
         VALUES ($1,$2,'none',true,'hard-bounce',now())
         ON CONFLICT (contact_id, firm_id) DO UPDATE
           SET silenced = true, source = 'hard-bounce', updated_at = now()`,
        [contactId, firmId],
      );
    }
  }

  return c.json({ ok: true });
}

export async function handleListEvents(c: Context) {
  const firmId = c.req.query("firmId");
  const result = await getPool().query(
    `SELECT id, at, firm_id, message_id, event_class, contact_id
     FROM messaging_events
     WHERE ($1::text IS NULL OR firm_id = $1)
     ORDER BY at DESC
     LIMIT 200`,
    [firmId ?? null],
  );
  return c.json({
    events: result.rows.map((r) => ({
      id: r.id,
      at: new Date(r.at).toISOString(),
      firmId: r.firm_id,
      messageId: r.message_id,
      class: r.event_class,
      contactId: r.contact_id ?? undefined,
    })),
  });
}
