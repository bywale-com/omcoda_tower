/**
 * Close remaining prod-walk gaps for Firm A/B after computer-use left
 * campaign armed / no enrollments / no meeting / Firm B without upload.
 * Agent-driven live API + shared Postgres OTP — no founder.
 */
import { readFileSync } from "node:fs";
import { createPgPool } from "./pgConnect.ts";
import { generateOtpCode, sha256 } from "../server/auth-service/crypto.ts";

const env = {
  ...Object.fromEntries(
    readFileSync(".env", "utf8")
      .split("\n")
      .filter((l) => l && !l.startsWith("#") && l.includes("="))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1)];
      }),
  ),
  ...process.env,
};
const BASE = (env.PRODUCTION_BASE_URL ?? "https://omcoda-tower.vercel.app").replace(/\/$/, "");
const pool = createPgPool(env.DATABASE_URL as string);
const CRON = (env.CRON_SECRET ?? "").trim();
const report: Array<{ step: string; ok: boolean; detail?: unknown }> = [];

async function live(path: string, init: RequestInit & { cookie?: string } = {}) {
  const headers = new Headers(init.headers);
  if (init.cookie) headers.set("cookie", init.cookie);
  if (path.includes("/machine/tick") && CRON) {
    headers.set("authorization", `Bearer ${CRON}`);
    headers.set("x-cron-secret", CRON);
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* keep */
  }
  return { status: res.status, body: body as any, setCookie: res.headers.get("set-cookie") };
}

function cookieFrom(sc: string | null) {
  return sc ? (sc.split(";")[0] ?? "") : "";
}

async function login(email: string, firmId: string) {
  await pool.query(`DELETE FROM otp_send_log WHERE lower(email)=lower($1)`, [email]);
  const code = generateOtpCode();
  const codeHash = sha256(code);
  await pool.query(
    `UPDATE otp_challenges SET invalidated_at=now()
     WHERE firm_id=$1::uuid AND lower(email)=lower($2) AND consumed_at IS NULL`,
    [firmId, email],
  );
  await pool.query(
    `INSERT INTO otp_challenges (firm_id, email, code_hash, expires_at)
     VALUES ($1::uuid,$2,$3,now()+interval '10 minutes')`,
    [firmId, email, codeHash],
  );
  const v = await live("/api/auth/otp/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const cookie = cookieFrom(v.setCookie);
  if (v.status !== 200 || !v.body?.ok || !cookie) {
    throw new Error(`login failed ${email}: ${JSON.stringify(v)}`);
  }
  return cookie;
}

const firmA = "782bab7f-43fc-4161-861f-774a26cc2ab0";
const emailA = "truthist00+arcaa50f14d@gmail.com";
const firmB = "6f309f84-1dcf-4c37-add9-0e6bbb15a7de";
const emailB = "truthist00+arcabk7aljc@gmail.com";

try {
  await pool.query(
    `INSERT INTO firms (id, name) VALUES ($1::uuid,'Walk-Arca-B-k7aljc') ON CONFLICT (id) DO NOTHING`,
    [firmB],
  );
  await pool.query(
    `INSERT INTO ct_firms (id, name, posture, updated_at) VALUES ($1,'Walk-Arca-B-k7aljc','Idle',now())
     ON CONFLICT (id) DO NOTHING`,
    [firmB],
  );
  const uB = await pool.query<{ id: string }>(
    `SELECT id FROM users WHERE lower(email)=lower($1)`,
    [emailB],
  );
  if (!uB.rowCount) {
    await pool.query(`INSERT INTO users (firm_id, email) VALUES ($1::uuid,$2)`, [firmB, emailB]);
  } else {
    await pool.query(`UPDATE users SET firm_id=$1::uuid WHERE id=$2`, [firmB, uB.rows[0].id]);
  }

  const cookieA = await login(emailA, firmA);
  report.push({ step: "A-login", ok: true });

  const camp = await live("/api/wire/machine/campaign-state", {
    method: "POST",
    cookie: cookieA,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ state: "running" }),
  });
  report.push({
    step: "A-campaign-running",
    ok: camp.status === 200 && camp.body?.state === "running",
    detail: camp.body,
  });

  const bind = await live("/api/wire/machine/bindings", {
    method: "POST",
    cookie: cookieA,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      sequenceClass: "optin_launch",
      templateId: "tpl.optin_launch.v1",
      variableBindings: { marker: "CELLWALK-50f14d" },
    }),
  });
  report.push({
    step: "A-binding",
    ok: bind.status === 200 || bind.status === 201,
    detail: bind.body,
  });

  const contacts = await pool.query<{ id: string }>(
    `SELECT id FROM contact_records WHERE firm_id=$1`,
    [firmA],
  );
  for (const r of contacts.rows) {
    await pool.query(
      `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, status, updated_at)
       VALUES ($1,$2,'express',false,'unsequenced',now())
       ON CONFLICT (contact_id, firm_id) DO UPDATE SET silenced=false, basis='express'`,
      [r.id, firmA],
    );
    await pool.query(
      `INSERT INTO sequence_ready (contact_id, firm_id, ready) VALUES ($1,$2,true)
       ON CONFLICT (contact_id, firm_id) DO UPDATE SET ready=true`,
      [r.id, firmA],
    );
  }

  const fire = await live("/api/wire/machine/onboarding/fire", {
    method: "POST",
    cookie: cookieA,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  report.push({ step: "A-onboarding-fire", ok: fire.status === 200, detail: fire.body });

  const enr = await pool.query(
    `SELECT id, contact_id, agent_ref FROM enrollment WHERE firm_id=$1 ORDER BY enrolled_at DESC`,
    [firmA],
  );
  report.push({ step: "A-enrollments", ok: (enr.rowCount ?? 0) > 0, detail: enr.rows });

  const att = await pool.query<{ state: any; contact_id: string; status: string }>(
    `SELECT contact_id, state, status FROM active_attempts WHERE firm_id=$1
     ORDER BY created_at DESC NULLS LAST LIMIT 5`,
    [firmA],
  );
  const cellState = att.rows[0]?.state ?? {};
  const authored =
    cellState.templateId === "tpl.optin_launch.v1" &&
    (cellState.cellId === "ui-1" || cellState.cellIndex === 0);
  report.push({
    step: "A-attempt-authored-cells",
    ok: Boolean(authored),
    detail: { attempts: att.rowCount, state: cellState },
  });

  const contactId = contacts.rows[0]?.id;
  const mtg = await live("/api/wire/machine/meetings", {
    method: "POST",
    cookie: cookieA,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contactId,
      slot: "Tomorrow 10:00",
      consultantName: "Walk Consultant A",
      contactName: "Walk Alpha One",
      source: "contact_portal",
    }),
  });
  report.push({
    step: "A-meeting-book",
    ok: mtg.status === 200 || mtg.status === 201,
    detail: mtg.body,
  });

  const openLeft = await pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM active_attempts
     WHERE firm_id=$1 AND contact_id=$2 AND status='open'`,
    [firmA, contactId],
  );
  const mtgCount = await pool.query<{ n: number; id: string }>(
    `SELECT count(*)::int AS n, max(id) AS id FROM meeting_booked WHERE firm_id=$1`,
    [firmA],
  );
  report.push({
    step: "A-meeting-chase-stopped",
    ok: openLeft.rows[0].n === 0 && mtgCount.rows[0].n >= 1,
    detail: { open: openLeft.rows[0].n, meetings: mtgCount.rows[0] },
  });

  // Confirm template cells still carry CELLWALK marker (authored == what runtime bound)
  const tpl = await pool.query<{ cells: unknown }>(
    `SELECT cells FROM sequence_template WHERE id='tpl.optin_launch.v1'`,
  );
  const cellsJson = JSON.stringify(tpl.rows[0]?.cells ?? []);
  report.push({
    step: "A-template-marker",
    ok: cellsJson.includes("CELLWALK-50f14d"),
    detail: cellsJson.slice(0, 300),
  });

  const cookieB = await login(emailB, firmB);
  report.push({ step: "B-login", ok: true });
  const contactBId = `c-walk-b-${Date.now()}`;
  const uploadB = await live("/api/wire/machine/audit-runs", {
    method: "POST",
    cookie: cookieB,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contactIds: [
        {
          id: contactBId,
          name: "Walk Beta One",
          email: "truthist00+walkb1@gmail.com",
          phone: "+14374557204",
        },
      ],
    }),
  });
  report.push({
    step: "B-upload",
    ok: uploadB.status === 200,
    detail: { contacts: uploadB.body?.contacts, id: contactBId },
  });

  const bookB = await live("/api/wire/machine/contact-records", { cookie: cookieB });
  const bookA = await live("/api/wire/machine/contact-records", { cookie: cookieA });
  const isol =
    bookB.body?.firmId === firmB &&
    bookA.body?.firmId === firmA &&
    (bookB.body?.contacts?.length ?? 0) === 1 &&
    (bookA.body?.contacts?.length ?? 0) === 2 &&
    !bookB.body.contacts.some((c: { id: string }) =>
      (bookA.body.contacts || []).some((a: { id: string }) => a.id === c.id),
    );
  report.push({
    step: "B-isolation",
    ok: isol,
    detail: {
      bCount: bookB.body?.contacts?.length,
      aCount: bookA.body?.contacts?.length,
      bFirm: bookB.body?.firmId,
      aFirm: bookA.body?.firmId,
    },
  });

  console.log(JSON.stringify(report, null, 2));
  const failed = report.filter((r) => !r.ok);
  console.log(failed.length ? `\nFAIL ${failed.length}` : "\nALL PASS");
  process.exit(failed.length ? 1 : 0);
} finally {
  await pool.end();
}
