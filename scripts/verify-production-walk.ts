/**
 * Live-URL production walk against https://omcoda-tower.vercel.app
 *
 * Uses the same DATABASE_URL as Production to mint OTP (Resend may refuse
 * @example.test). All provision / session / machine calls go to the live API.
 *
 * Run: npx tsx --env-file=.env scripts/verify-production-walk.ts
 */
import { randomUUID } from "node:crypto";
import { createPgPool } from "./pgConnect.ts";
import { generateOtpCode, sha256 } from "../server/auth-service/crypto.ts";

const BASE = (process.env.PRODUCTION_BASE_URL ?? "https://omcoda-tower.vercel.app").replace(
  /\/$/,
  "",
);
const CRON_SECRET = (process.env.CRON_SECRET ?? "").trim();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const pool = createPgPool(connectionString);
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
    /* keep text */
  }
  return { status: res.status, body, setCookie: res.headers.get("set-cookie") };
}

function cookieFrom(setCookie: string | null): string {
  if (!setCookie) return "";
  return setCookie.split(";")[0] ?? "";
}

async function mintOtp(email: string, firmId: string): Promise<string> {
  const code = generateOtpCode();
  const codeHash = sha256(code);
  await pool.query(
    `UPDATE otp_challenges SET invalidated_at=now()
     WHERE firm_id=$1::uuid AND lower(email)=lower($2) AND consumed_at IS NULL`,
    [firmId, email],
  );
  await pool.query(
    `INSERT INTO otp_challenges (firm_id, email, code_hash, expires_at)
     VALUES ($1::uuid, $2, $3, now() + interval '10 minutes')`,
    [firmId, email, codeHash],
  );
  return code;
}

async function walkOne(label: string) {
  const rand = randomUUID().slice(0, 8);
  const firmName = `Prod-Walk-${rand}`;
  const email = `prod-walk-${rand}@example.test`;

  // 1. Provision on live API
  const prov = await live("/api/wire/machine/provision", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      firmName,
      email,
      website: "https://example.test",
      role: "consultant-owner",
    }),
  });
  const firmId = prov.body?.firmId as string | undefined;
  if (prov.status !== 200 || !firmId || firmId === "firm-cedar" || !prov.body?.bound) {
    fail(`${label}-provision`, JSON.stringify(prov));
    return null;
  }
  const firms = await pool.query(`SELECT id::text AS id FROM firms WHERE id=$1::uuid`, [firmId]);
  const ct = await pool.query(`SELECT id FROM ct_firms WHERE id=$1`, [firmId]);
  if (!firms.rowCount || !ct.rowCount || firms.rows[0].id !== ct.rows[0].id) {
    fail(`${label}-provision-rows`, JSON.stringify({ firms: firms.rows, ct: ct.rows }));
    return null;
  }
  ok(`${label}-provision`, `${firmName} → ${firmId} (live API + same auth/CT id)`);

  // 2. Login via live OTP verify (code minted in shared Postgres)
  const code = await mintOtp(email, firmId);
  const verify = await live("/api/auth/otp/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const cookie = cookieFrom(verify.setCookie);
  if (
    verify.status !== 200 ||
    !verify.body?.ok ||
    verify.body?.user?.firmId !== firmId ||
    !cookie
  ) {
    fail(`${label}-login`, JSON.stringify({ status: verify.status, body: verify.body, cookie }));
    return null;
  }
  ok(`${label}-login`, `session firmId=${firmId} cookie set`);

  // 3. Empty book on live
  const book = await live("/api/wire/machine/contact-records", { cookie });
  if (book.status !== 200 || book.body?.firmId !== firmId) {
    fail(`${label}-empty-book-scope`, JSON.stringify(book));
    return null;
  }
  if ((book.body?.contacts?.length ?? 0) !== 0) {
    fail(`${label}-empty-book`, `expected 0, got ${book.body.contacts.length}`);
    return null;
  }
  ok(`${label}-empty-book`, `live book empty for ${firmId}`);

  // 4. Upload list
  const contactId = `c-prod-${rand}`;
  const upload = await live("/api/wire/machine/audit-runs", {
    method: "POST",
    cookie,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contactIds: [
        {
          id: contactId,
          email: `lead-${rand}@example.com`,
          phone: "+15550001111",
          name: `Lead ${rand}`,
        },
      ],
    }),
  });
  if (upload.status !== 200) {
    fail(`${label}-upload`, JSON.stringify(upload));
    return null;
  }
  const cr = await pool.query(`SELECT id, firm_id FROM contact_records WHERE id=$1`, [contactId]);
  if (!cr.rowCount || cr.rows[0].firm_id !== firmId) {
    fail(`${label}-upload-row`, JSON.stringify(cr.rows[0]));
    return null;
  }
  ok(`${label}-upload`, `contact ${contactId} → firm ${firmId}`);

  // 5. Bind + Active
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
  if (camp.status !== 200 || camp.body?.firmId !== firmId || camp.body?.state !== "running") {
    fail(`${label}-bind-active`, JSON.stringify(camp));
    return null;
  }
  ok(`${label}-bind-active`, `campaign running for ${firmId}`);

  // 6. Enroll (outreach) via live onboarding fire or enrollments
  await pool.query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, status, updated_at)
     VALUES ($1,$2,'express',false,'unsequenced',now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE SET basis='express', silenced=false`,
    [contactId, firmId],
  );
  const enr = await live("/api/wire/machine/enrollments", {
    method: "POST",
    cookie,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contactId,
      agentRef: "tpl.optin_launch.v1",
      sequenceId: "tpl.optin_launch.v1",
      purpose: "opt-in",
      ownerChannel: "email",
      fireFirstStep: true,
    }),
  });
  if (enr.status !== 200 && enr.status !== 201) {
    // Fallback: onboarding/fire
    const fire = await live("/api/wire/machine/onboarding/fire", {
      method: "POST",
      cookie,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contactId, sequenceId: "tpl.optin_launch.v1" }),
    });
    if (fire.status !== 200 && fire.status !== 201) {
      fail(`${label}-outreach`, JSON.stringify({ enr, fire }));
      return null;
    }
  }
  const enrRow = await pool.query(
    `SELECT id, firm_id FROM enrollment WHERE firm_id=$1 AND contact_id=$2
     ORDER BY enrolled_at DESC LIMIT 1`,
    [firmId, contactId],
  );
  if (!enrRow.rowCount) {
    fail(`${label}-outreach-row`, "no enrollment row");
    return null;
  }
  ok(`${label}-outreach`, `enrollment ${enrRow.rows[0].id} (dry_run gate)`);

  return { firmId, email, contactId, cookie };
}

try {
  console.log(`Live base: ${BASE}`);

  const healthWire = await live("/api/wire/health");
  const healthAuth = await live("/api/auth/health");
  if (healthWire.status !== 200 || !healthWire.body?.ok) {
    fail("health-wire", JSON.stringify(healthWire));
  } else ok("health-wire", JSON.stringify(healthWire.body));
  if (healthAuth.status !== 200 || !healthAuth.body?.ok) {
    fail("health-auth", JSON.stringify(healthAuth));
  } else ok("health-auth", JSON.stringify(healthAuth.body));

  if (CRON_SECRET) {
    const tick = await live("/api/wire/machine/tick");
    if (tick.status !== 200 || !tick.body?.ok) fail("tick", JSON.stringify(tick));
    else ok("tick", `scanned=${tick.body.scanned} host=${tick.body.host}`);
  } else {
    fail("tick", "CRON_SECRET not in env — skip unattended proof");
  }

  const a = await walkOne("A");
  const b = await walkOne("B");

  if (a && b) {
    if (a.firmId === b.firmId) fail("two-firm-distinct", "same firm id");
    else ok("two-firm-distinct", `${a.firmId} vs ${b.firmId}`);

    const aBook = await live("/api/wire/machine/contact-records", { cookie: a.cookie });
    const ids = (aBook.body?.contacts ?? []).map((c: { id: string }) => c.id);
    if (aBook.body?.firmId !== a.firmId || ids.includes(b.contactId)) {
      fail("two-firm-isolation", JSON.stringify(aBook.body));
    } else ok("two-firm-isolation", "A session does not see B contact");

    const leak = await pool.query(
      `SELECT firm_id FROM contact_records WHERE id = ANY($1::text[])`,
      [[a.contactId, b.contactId]],
    );
    if (leak.rows.some((r) => r.firm_id === "firm-cedar")) fail("not-cedar", "leak");
    else ok("not-cedar", "contacts not under firm-cedar");
  }
} finally {
  await pool.end();
}

const failed = report.filter((r) => !r.ok);
console.log("\n--- PRODUCTION WALK ---");
for (const r of report) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.step}: ${r.detail}`);
process.exit(failed.length ? 1 : 0);
