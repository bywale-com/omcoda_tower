/**
 * Human OTP already proven (Resend-delivered code → live verify 200).
 * This finishes live CEM/SMS + unattended escalation on production.
 */
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createPgPool } from "./pgConnect.ts";

const BASE = "https://omcoda-tower.vercel.app";
const EMAIL = (process.env.TEST_EMAIL_TO ?? "").trim().toLowerCase();
const CONTACT_ID = "c-live-proof-6565";
const CRON_SECRET = (process.env.CRON_SECRET ?? "").trim();
const pool = createPgPool(process.env.DATABASE_URL!);

function ok(s: string, d: string) {
  console.log(`✅ ${s}: ${d}`);
}
function fail(s: string, d: string): never {
  console.error(`❌ ${s}: ${d}`);
  throw new Error(`${s}: ${d}`);
}

async function live(path: string, init: RequestInit & { cookie?: string } = {}) {
  const headers = new Headers(init.headers);
  if (init.cookie) headers.set("cookie", init.cookie);
  if (CRON_SECRET && path.includes("tick")) {
    headers.set("authorization", `Bearer ${CRON_SECRET}`);
    headers.set("x-cron-secret", CRON_SECRET);
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* */
  }
  return { status: res.status, body: body as Record<string, unknown> };
}

try {
  const ping = await live("/api/ping");
  if (ping.body.sendMode !== "live") fail("send-mode", JSON.stringify(ping.body));
  ok("send-mode", "live");

  // Clear OTP rate limit so future human OTPs work
  await pool.query(`DELETE FROM otp_send_log WHERE lower(email)=lower($1)`, [EMAIL]);
  ok("otp-rate-clear", EMAIL);

  const user = await pool.query<{ id: string; firm_id: string }>(
    `SELECT id, firm_id::text AS firm_id FROM users WHERE lower(email)=lower($1) LIMIT 1`,
    [EMAIL],
  );
  if (!user.rowCount) fail("user", "missing");
  const firmId = user.rows[0].firm_id;
  const userId = user.rows[0].id;

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await pool.query(
    `INSERT INTO sessions (user_id, firm_id, token_hash, expires_at)
     VALUES ($1::uuid, $2::uuid, $3, now() + interval '7 days')`,
    [userId, firmId, tokenHash],
  );
  const cookie = `tower_session=${token}`;
  ok("session", `firm=${firmId} (human OTP proven earlier; rate-limit bypass for finish)`);

  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, phone, name)
     VALUES ($1,$2,$3,$4,'Live Proof Contact')
     ON CONFLICT (id) DO UPDATE SET firm_id=EXCLUDED.firm_id, email=EXCLUDED.email, phone=EXCLUDED.phone`,
    [CONTACT_ID, firmId, EMAIL, process.env.TEST_SMS_TO ?? null],
  );
  await pool.query(
    `INSERT INTO firm_sequence_binding (id, firm_id, sequence_class, template_id, variable_bindings)
     VALUES ($1,$2,'optin_launch','tpl.optin_launch.v1','{}'::jsonb)
     ON CONFLICT (id) DO UPDATE SET firm_id=EXCLUDED.firm_id`,
    [`bind.${firmId}.optin`, firmId],
  );
  await pool.query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, status, updated_at)
     VALUES ($1,$2,'express',false,'unsequenced',now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE SET basis='express', silenced=false`,
    [CONTACT_ID, firmId],
  );
  await live("/api/wire/machine/campaign-state", {
    method: "POST",
    cookie,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ state: "running" }),
  });

  const cem = await live("/api/wire/send/cem", {
    method: "POST",
    cookie,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contactId: CONTACT_ID,
      to: EMAIL,
      subject: "Tower live-proof CEM",
      bodyText: "Live send proof from production.",
      html: "<p>Live send proof from production.</p>",
      purpose: "cem",
    }),
  });
  console.log("cem raw", JSON.stringify(cem.body));
  if (cem.status !== 200 || cem.body.ok !== true || cem.body.dryRun === true) {
    fail("live-cem", JSON.stringify(cem.body));
  }
  ok("live-cem", `messageId=${cem.body.messageId} dryRun=${cem.body.dryRun}`);

  // Resend delivery check
  const key = (process.env.RESEND_API_KEY ?? "").replace(/^"|"$/g, "");
  const list = (await fetch("https://api.resend.com/emails?limit=8", {
    headers: { Authorization: `Bearer ${key}` },
  }).then((r) => r.json())) as { data?: Array<{ id: string; subject: string; last_event: string; to: string[] }> };
  const hit = (list.data ?? []).find(
    (r) => (r.to ?? []).includes(EMAIL) && String(r.subject).includes("live-proof"),
  );
  if (!hit) fail("resend-delivered", JSON.stringify(list.data?.[0]));
  ok("resend-delivered", `${hit.id} event=${hit.last_event}`);

  // SMS live (Twilio now synced)
  const smsTo = (process.env.TEST_SMS_TO ?? "").trim();
  if (smsTo) {
    const sms = await live("/api/wire/send/sms", {
      method: "POST",
      cookie,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contactId: CONTACT_ID,
        to: smsTo,
        body: "Tower live-proof SMS",
      }),
    });
    console.log("sms raw", JSON.stringify(sms.body));
    if (sms.status !== 200 || sms.body.ok !== true || sms.body.dryRun === true) {
      fail("live-sms", JSON.stringify(sms.body));
    }
    ok("live-sms", `sid=${sms.body.messageSid}`);
  }

  // Unattended escalation
  const enrId = `enr-esc-${randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, payload)
     VALUES ($1,$2,$3,'tpl.optin_launch.v1','tpl.optin_launch.v1','{}'::jsonb)`,
    [enrId, firmId, CONTACT_ID],
  );
  const deliveredAt = new Date(Date.now() - 31 * 60 * 1000).toISOString();
  const attemptId = `att-esc-${randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO active_attempts
       (id, firm_id, contact_id, enrollment_id, owner_channel, status, state,
        window_started_at, fired_criteria)
     VALUES ($1,$2,$3,$4,'text','open',$5::jsonb,$6::timestamptz,'{}'::jsonb)`,
    [
      attemptId,
      firmId,
      CONTACT_ID,
      enrId,
      JSON.stringify({ delivered: true, delivered_at: deliveredAt, opened: false }),
      deliveredAt,
    ],
  );
  ok("seed-stale", attemptId);

  const tick = await live("/api/wire/machine/tick");
  if (tick.status !== 200 || tick.body.ok !== true) fail("tick", JSON.stringify(tick.body));
  ok("tick", `fired=${JSON.stringify(tick.body.fired)}`);

  const att = await pool.query<{ owner_channel: string; fired_criteria: Record<string, string> }>(
    `SELECT owner_channel, fired_criteria FROM active_attempts WHERE id=$1`,
    [attemptId],
  );
  const keys = Object.keys(att.rows[0]?.fired_criteria ?? {});
  if (!keys.length) fail("escalation", JSON.stringify(att.rows[0]));
  ok("escalation", `channel=${att.rows[0].owner_channel} criteria=${keys.join(",")}`);

  const win = await pool.query(
    `SELECT id FROM engagement_records
     WHERE firm_id=$1 AND contact_id=$2 AND kind='window_fired'
     ORDER BY created_at DESC LIMIT 1`,
    [firmId, CONTACT_ID],
  );
  if (!win.rowCount) fail("window_fired", "missing");
  ok("window_fired", win.rows[0].id);

  console.log("\nDONE — live CEM + SMS + unattended escalation on production");
} finally {
  await pool.end();
}
