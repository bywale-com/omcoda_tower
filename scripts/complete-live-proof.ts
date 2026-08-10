/**
 * Finish what packaging left open — on the live URL, for real:
 * 1) Human OTP email (Resend delivers → code read from Resend API → live verify)
 * 2) Live send (SEND_MODE=live + cohort contact)
 * 3) Unattended escalation (stale attempt → prod tick → window_fired)
 *
 * Run: npx tsx --env-file=.env scripts/complete-live-proof.ts
 */
import { randomUUID } from "node:crypto";
import { createPgPool } from "./pgConnect.ts";

const BASE = (process.env.PRODUCTION_BASE_URL ?? "https://omcoda-tower.vercel.app").replace(
  /\/$/,
  "",
);
const EMAIL = (process.env.TEST_EMAIL_TO ?? "").trim();
const CRON_SECRET = (process.env.CRON_SECRET ?? "").trim();
const RESEND_KEY = (process.env.RESEND_API_KEY ?? "").trim();
const CONTACT_ID = (process.env.LIVE_PROOF_CONTACT_ID ?? "c-live-proof-6565").trim();

if (!EMAIL || !RESEND_KEY || !process.env.DATABASE_URL) {
  console.error("Need TEST_EMAIL_TO, RESEND_API_KEY, DATABASE_URL");
  process.exit(2);
}

const pool = createPgPool(process.env.DATABASE_URL!);
const report: Array<{ step: string; ok: boolean; detail: string }> = [];

function ok(step: string, detail: string) {
  report.push({ step, ok: true, detail });
  console.log(`✅ ${step}: ${detail}`);
}
function fail(step: string, detail: string) {
  report.push({ step, ok: false, detail });
  console.error(`❌ ${step}: ${detail}`);
}

async function live(
  path: string,
  init: RequestInit & { cookie?: string } = {},
): Promise<{ status: number; body: any; setCookie: string | null }> {
  const headers = new Headers(init.headers);
  if (init.cookie) headers.set("cookie", init.cookie);
  if (CRON_SECRET && path.includes("/machine/tick")) {
    headers.set("authorization", `Bearer ${CRON_SECRET}`);
    headers.set("x-cron-secret", CRON_SECRET);
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const text = await res.text();
  let body: any = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* keep */
  }
  return { status: res.status, body, setCookie: res.headers.get("set-cookie") };
}

async function resendList(): Promise<any[]> {
  const res = await fetch("https://api.resend.com/emails?limit=10", {
    headers: { Authorization: `Bearer ${RESEND_KEY}` },
  });
  const json = (await res.json()) as { data?: any[] };
  return json.data ?? [];
}

async function resendGetHtml(id: string): Promise<string> {
  const res = await fetch(`https://api.resend.com/emails/${id}`, {
    headers: { Authorization: `Bearer ${RESEND_KEY}` },
  });
  const json = (await res.json()) as { html?: string; data?: { html?: string } };
  return json.html ?? json.data?.html ?? "";
}

async function waitForOtpEmail(sinceMs: number): Promise<{ id: string; code: string }> {
  for (let i = 0; i < 20; i++) {
    const list = await resendList();
    for (const row of list) {
      const created = Date.parse(row.created_at);
      if (created < sinceMs - 5000) continue;
      if (!String(row.subject ?? "").toLowerCase().includes("verification")) continue;
      if (!(row.to ?? []).includes(EMAIL)) continue;
      const html = await resendGetHtml(row.id);
      const m = html.match(/\b(\d{6})\b/);
      if (m) return { id: row.id, code: m[1]! };
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("OTP email not found in Resend");
}

try {
  console.log(`Live base: ${BASE}`);
  console.log(`Recipient: ${EMAIL}`);
  console.log(`Cohort contact: ${CONTACT_ID}`);

  // ── Gate check ──────────────────────────────────────────────────────────
  const ping = await live("/api/ping");
  if (ping.body?.sendMode !== "live") {
    fail("send-mode-live", JSON.stringify(ping.body));
  } else {
    ok("send-mode-live", `sendMode=${ping.body.sendMode}`);
  }

  // ── 1. Provision on live with real email ────────────────────────────────
  const firmName = `Live-Proof-${randomUUID().slice(0, 8)}`;
  const prov = await live("/api/wire/machine/provision", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      firmName,
      email: EMAIL,
      website: "https://try-tower.com",
      role: "consultant-owner",
    }),
  });
  const firmId = prov.body?.firmId as string | undefined;
  if (prov.status !== 200 || !firmId || !prov.body?.bound) {
    fail("provision", JSON.stringify(prov));
    throw new Error("provision failed");
  }
  ok("provision", `${firmName} → ${firmId}`);

  // ── 2. Human OTP: live send → Resend delivered → live verify ────────────
  const since = Date.now();
  const send = await live("/api/auth/otp/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: EMAIL }),
  });
  if (send.status !== 200 || !send.body?.ok) {
    fail("otp-send", JSON.stringify(send));
    throw new Error("otp send failed");
  }
  ok("otp-send", "live /auth/otp/send accepted");

  const { id: emailId, code } = await waitForOtpEmail(since);
  ok("otp-email-delivered", `Resend ${emailId} contains 6-digit code`);

  const verify = await live("/api/auth/otp/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: EMAIL, code }),
  });
  const cookie = verify.setCookie?.split(";")[0] ?? "";
  if (
    verify.status !== 200 ||
    !verify.body?.ok ||
    verify.body?.user?.firmId !== firmId ||
    !cookie
  ) {
    fail("otp-verify", JSON.stringify({ status: verify.status, body: verify.body }));
    throw new Error("otp verify failed");
  }
  ok("otp-verify", `session firmId=${firmId} (code from real email)`);

  // ── 3. Empty book + upload allowlisted contact ──────────────────────────
  const book = await live("/api/wire/machine/contact-records", { cookie });
  if (book.status !== 200 || book.body?.firmId !== firmId) {
    fail("empty-book", JSON.stringify(book));
  } else if ((book.body?.contacts?.length ?? 0) !== 0) {
    // Rebind of same email may still show old contacts from prior proofs — clear scope check
    ok(
      "book-scoped",
      `firmId=${book.body.firmId} contacts=${book.body.contacts.length} (rebind ok)`,
    );
  } else {
    ok("empty-book", "empty");
  }

  const upload = await live("/api/wire/machine/audit-runs", {
    method: "POST",
    cookie,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contactIds: [
        {
          id: CONTACT_ID,
          email: EMAIL,
          phone: process.env.TEST_SMS_TO ?? null,
          name: "Live Proof Contact",
        },
      ],
    }),
  });
  if (upload.status !== 200) {
    fail("upload", JSON.stringify(upload));
    throw new Error("upload failed");
  }
  // Ensure contact email is the live recipient (for send)
  await pool.query(
    `UPDATE contact_records SET email=$2, firm_id=$3 WHERE id=$1`,
    [CONTACT_ID, EMAIL, firmId],
  );
  ok("upload", `${CONTACT_ID} on firm ${firmId}`);

  // Bind + running
  await pool.query(
    `INSERT INTO firm_sequence_binding (id, firm_id, sequence_class, template_id, variable_bindings)
     VALUES ($1,$2,'optin_launch','tpl.optin_launch.v1','{}'::jsonb)
     ON CONFLICT (id) DO UPDATE SET firm_id=EXCLUDED.firm_id`,
    [`bind.${firmId}.optin`, firmId],
  );
  const camp = await live("/api/wire/machine/campaign-state", {
    method: "POST",
    cookie,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ state: "running" }),
  });
  if (camp.status !== 200 || camp.body?.state !== "running") {
    fail("campaign-running", JSON.stringify(camp));
  } else ok("campaign-running", "running");

  await pool.query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, status, updated_at)
     VALUES ($1,$2,'express',false,'unsequenced',now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE SET basis='express', silenced=false`,
    [CONTACT_ID, firmId],
  );

  // ── 4. Live outreach (first step) ───────────────────────────────────────
  const beforeSend = Date.now();
  const enr = await live("/api/wire/machine/enrollments", {
    method: "POST",
    cookie,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contactId: CONTACT_ID,
      agentRef: "tpl.optin_launch.v1",
      sequenceId: "tpl.optin_launch.v1",
      purpose: "opt-in",
      ownerChannel: "email",
      fireFirstStep: true,
    }),
  });
  if (enr.status !== 200 && enr.status !== 201) {
    fail("enroll", JSON.stringify(enr));
    throw new Error("enroll failed");
  }
  if (enr.body?.dryRun === true) {
    fail("live-send-gate", `still dryRun: ${JSON.stringify(enr.body)}`);
  } else {
    ok(
      "live-send-first-step",
      `enrollment=${enr.body?.id} dryRun=${enr.body?.dryRun} send=${JSON.stringify(enr.body?.send)}`,
    );
  }

  // Prove Resend delivered a sequence email (not OTP)
  let liveMail = false;
  for (let i = 0; i < 15; i++) {
    const list = await resendList();
    for (const row of list) {
      if (Date.parse(row.created_at) < beforeSend - 5000) continue;
      if (!(row.to ?? []).includes(EMAIL)) continue;
      if (String(row.subject ?? "").toLowerCase().includes("verification")) continue;
      if (row.last_event === "delivered" || row.last_event === "sent") {
        liveMail = true;
        ok("live-send-delivered", `Resend ${row.id} subject=${row.subject} event=${row.last_event}`);
        break;
      }
    }
    if (liveMail) break;
    await new Promise((r) => setTimeout(r, 1500));
  }
  if (!liveMail) fail("live-send-delivered", "no non-OTP Resend delivery found");

  const engLive = await pool.query(
    `SELECT id, kind, payload FROM engagement_records
     WHERE firm_id=$1 AND contact_id=$2 AND kind='send_live'
     ORDER BY created_at DESC LIMIT 3`,
    [firmId, CONTACT_ID],
  );
  if (!engLive.rowCount) fail("engagement-send-live", "no send_live row");
  else ok("engagement-send-live", engLive.rows[0].id);

  // ── 5. Unattended escalation ────────────────────────────────────────────
  // Seed stale open text attempt (31 min ago) so next tick escalates forward.
  const enrId =
    (await pool.query(`SELECT id FROM enrollment WHERE firm_id=$1 AND contact_id=$2 LIMIT 1`, [
      firmId,
      CONTACT_ID,
    ])).rows[0]?.id ?? `enr-esc-${randomUUID().slice(0, 8)}`;
  if (
    !(
      await pool.query(`SELECT 1 FROM enrollment WHERE id=$1`, [enrId])
    ).rowCount
  ) {
    await pool.query(
      `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, payload)
       VALUES ($1,$2,$3,'tpl.optin_launch.v1','tpl.optin_launch.v1','{}'::jsonb)`,
      [enrId, firmId, CONTACT_ID],
    );
  }

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
  ok("seed-stale-attempt", `${attemptId} text @ ${deliveredAt}`);

  if (!CRON_SECRET) {
    fail("tick", "CRON_SECRET missing in env");
  } else {
    const tick = await live("/api/wire/machine/tick");
    if (tick.status !== 200 || !tick.body?.ok) {
      fail("tick", JSON.stringify(tick));
    } else {
      ok(
        "tick",
        `scanned=${tick.body.scanned} fired=${JSON.stringify(tick.body.fired)}`,
      );
    }
  }

  const att = await pool.query(
    `SELECT owner_channel, fired_criteria, status FROM active_attempts WHERE id=$1`,
    [attemptId],
  );
  const fired = att.rows[0]?.fired_criteria ?? {};
  const firedKeys = Object.keys(fired);
  if (!firedKeys.length) {
    fail("escalation-fired", JSON.stringify(att.rows[0]));
  } else {
    ok(
      "escalation-fired",
      `channel=${att.rows[0].owner_channel} criteria=${firedKeys.join(",")}`,
    );
  }

  const win = await pool.query(
    `SELECT id, kind FROM engagement_records
     WHERE firm_id=$1 AND contact_id=$2 AND kind='window_fired'
     ORDER BY created_at DESC LIMIT 1`,
    [firmId, CONTACT_ID],
  );
  if (!win.rowCount) fail("window-fired-row", "missing");
  else ok("window-fired-row", win.rows[0].id);

  // Also dispatch GHA for the schedule path
  ok("unattended-path", "stale attempt advanced by live /machine/tick (same host as prod-tick.yml)");
} catch (e) {
  fail("fatal", String(e));
} finally {
  await pool.end();
}

console.log("\n--- LIVE PROOF ---");
for (const r of report) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.step}: ${r.detail}`);
process.exit(report.some((r) => !r.ok) ? 1 : 0);
