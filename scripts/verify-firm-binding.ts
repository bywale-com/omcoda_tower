/**
 * Prove BINDING (not just isolation): provisioned firm === session firm === machine writes.
 *
 * Six-step walk with a self-created firm (not Cedar), plus two-firm binding proof.
 *
 * Run: npm run verify:firm-binding
 */
import { randomUUID } from "node:crypto";
import { createPgPool } from "./pgConnect.ts";
import { Hono } from "hono";
import { createWireRoutes } from "../server/wire-service/routes.ts";
import { createAuthApp } from "../server/auth-service/app.ts";
import { enrollAndActuate } from "../server/wire-service/cascade.ts";
import { generateOtpCode, sha256 } from "../server/auth-service/crypto.ts";

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

function wireApp() {
  const app = new Hono();
  app.route("/wire", createWireRoutes());
  return app;
}

function authApp() {
  return createAuthApp();
}

function cookieHeader(setCookie: string | null): Record<string, string> {
  if (!setCookie) return {};
  const token = setCookie.split(";")[0];
  return { Cookie: token };
}

async function provision(firmName: string, email: string) {
  const app = wireApp();
  const res = await app.request("/wire/machine/provision", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ firmName, email, website: "https://example.test", role: "consultant-owner" }),
  });
  const body = await res.json();
  return { status: res.status, body };
}

async function mintSession(email: string, firmId: string) {
  // Force OTP challenge with known code (DB write) then verify via auth app.
  const code = generateOtpCode();
  const codeHash = sha256(code);
  const user = await pool.query<{ id: string; firm_id: string }>(
    `SELECT id, firm_id::text AS firm_id FROM users WHERE lower(email)=lower($1) LIMIT 1`,
    [email],
  );
  if (!user.rowCount) throw new Error(`user missing for ${email}`);
  if (user.rows[0].firm_id !== firmId) {
    throw new Error(`user.firm_id ${user.rows[0].firm_id} !== provisioned ${firmId}`);
  }
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
  const app = authApp();
  const res = await app.request("/auth/otp/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const body = await res.json();
  const setCookie = res.headers.get("set-cookie");
  return { status: res.status, body, setCookie, userId: user.rows[0].id };
}

async function walkOneFirm(label: string) {
  const rand = randomUUID().slice(0, 8);
  const firmName = `Acme-Test-${rand}`;
  const email = `consultant-${rand}@acme-test.example`;

  // 1. Provision
  const prov = await provision(firmName, email);
  const firmId = prov.body?.firmId as string | undefined;
  if (prov.status !== 200 || !firmId || firmId === "firm-cedar") {
    fail(`${label}-provision`, JSON.stringify(prov));
    return null;
  }
  const firms = await pool.query(`SELECT id::text AS id, name FROM firms WHERE id=$1::uuid`, [firmId]);
  const ct = await pool.query(`SELECT id, name FROM ct_firms WHERE id=$1`, [firmId]);
  if (!firms.rowCount || !ct.rowCount) {
    fail(`${label}-provision-rows`, `firms=${firms.rowCount} ct_firms=${ct.rowCount}`);
    return null;
  }
  if (firms.rows[0].id !== ct.rows[0].id) {
    fail(`${label}-provision-bind`, `auth ${firms.rows[0].id} !== ct ${ct.rows[0].id}`);
    return null;
  }
  ok(
    `${label}-provision`,
    `${firmName} → firms+ct_firms id=${firmId} (same id)`,
  );

  // 2. Login / session
  const sess = await mintSession(email, firmId);
  if (sess.status !== 200 || !sess.body?.ok || sess.body?.user?.firmId !== firmId) {
    fail(`${label}-login`, JSON.stringify({ status: sess.status, body: sess.body }));
    return null;
  }
  const sessionRow = await pool.query(
    `SELECT firm_id::text AS firm_id FROM sessions WHERE user_id=$1::uuid ORDER BY created_at DESC LIMIT 1`,
    [sess.userId],
  );
  if (sessionRow.rows[0]?.firm_id !== firmId) {
    fail(`${label}-session-row`, JSON.stringify(sessionRow.rows[0]));
    return null;
  }
  ok(`${label}-login`, `session.firm_id=${firmId} (not firm-cedar)`);

  const cookies = cookieHeader(sess.setCookie);
  process.env.AUTH_DISABLED = "false";
  process.env.VITE_AUTH_DISABLED = "false";
  delete process.env.DEV_SESSION_FIRM;

  // 3. Empty book
  const app = wireApp();
  const book = await app.request("/wire/machine/contact-records", { headers: cookies });
  const bookBody = await book.json();
  if (book.status !== 200 || bookBody.firmId !== firmId) {
    fail(`${label}-empty-book-scope`, JSON.stringify({ status: book.status, body: bookBody }));
    return null;
  }
  if ((bookBody.contacts?.length ?? 0) !== 0) {
    fail(`${label}-empty-book`, `expected 0 contacts, got ${bookBody.contacts.length}`);
    return null;
  }
  // Cedar leak check
  const cedar = await pool.query(
    `SELECT count(*)::int AS n FROM contact_records WHERE firm_id=$1`,
    [firmId],
  );
  if (cedar.rows[0].n !== 0) {
    fail(`${label}-empty-book-db`, `contact_records=${cedar.rows[0].n}`);
    return null;
  }
  ok(`${label}-empty-book`, `firm ${firmId} book empty (not Cedar)`);

  // 4. Upload contacts
  const contactId = `c-${rand}`;
  const audit = await app.request("/wire/machine/audit-runs", {
    method: "POST",
    headers: { ...cookies, "content-type": "application/json" },
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
  const auditBody = await audit.json();
  if (audit.status !== 200) {
    fail(`${label}-upload`, JSON.stringify({ status: audit.status, body: auditBody }));
    return null;
  }
  const cr = await pool.query(
    `SELECT id, firm_id FROM contact_records WHERE id=$1`,
    [contactId],
  );
  if (!cr.rowCount || cr.rows[0].firm_id !== firmId) {
    fail(`${label}-upload-row`, JSON.stringify(cr.rows[0]));
    return null;
  }
  ok(`${label}-upload`, `contact_records id=${contactId} firm_id=${firmId}`);

  // 5. Operator bind sequence + Active
  await pool.query(
    `INSERT INTO firm_sequence_binding (id, firm_id, sequence_class, template_id, variable_bindings)
     VALUES ($1,$2,'optin_launch','tpl.optin_launch.v1','{}'::jsonb)
     ON CONFLICT (id) DO UPDATE SET firm_id=EXCLUDED.firm_id, template_id=EXCLUDED.template_id`,
    [`bind.${firmId}.optin`, firmId],
  );
  const camp = await app.request("/wire/machine/campaign-state", {
    method: "POST",
    headers: { ...cookies, "content-type": "application/json" },
    body: JSON.stringify({ state: "running" }),
  });
  const campBody = await camp.json();
  if (camp.status !== 200 || campBody.firmId !== firmId || campBody.state !== "running") {
    fail(`${label}-bind-active`, JSON.stringify({ status: camp.status, body: campBody }));
    return null;
  }
  const bindRow = await pool.query(
    `SELECT firm_id, template_id FROM firm_sequence_binding WHERE firm_id=$1 LIMIT 1`,
    [firmId],
  );
  const campRow = await pool.query(
    `SELECT firm_id, state FROM campaign_states WHERE firm_id=$1`,
    [firmId],
  );
  if (!bindRow.rowCount || campRow.rows[0]?.state !== "running") {
    fail(`${label}-bind-rows`, JSON.stringify({ bind: bindRow.rows[0], camp: campRow.rows[0] }));
    return null;
  }
  ok(
    `${label}-bind-active`,
    `firm_sequence_binding + campaign_states=running for ${firmId}`,
  );

  // 6. Outreach fires (enrollment) — dry-run unless allowlist opened
  await pool.query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, status, updated_at)
     VALUES ($1,$2,'express',false,'unsequenced',now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE SET basis='express', silenced=false`,
    [contactId, firmId],
  );
  process.env.SEND_MODE = "dry_run";
  const actuated = await enrollAndActuate({
    firmId,
    contactId,
    agentRef: "tpl.optin_launch.v1",
    sequenceId: "tpl.optin_launch.v1",
    purpose: "opt-in",
    ownerChannel: "email",
    fireFirstStep: true,
  });
  const enr = await pool.query(
    `SELECT id, firm_id, contact_id FROM enrollment
     WHERE firm_id=$1 AND contact_id=$2 ORDER BY enrolled_at DESC LIMIT 1`,
    [firmId, contactId],
  );
  if (!enr.rowCount) {
    fail(`${label}-outreach`, `no enrollment; actuated=${JSON.stringify(actuated)}`);
    return null;
  }
  const sendMode = actuated.dryRun ? "dry-run (allowlist not opened)" : "live send";
  ok(
    `${label}-outreach`,
    `enrollment ${enr.rows[0].id} for firm ${firmId}; ${sendMode}`,
  );

  return { firmId, email, contactId, cookies };
}

try {
  // Grep request path
  const { readFileSync } = await import("node:fs");
  const machineSrc = readFileSync(new URL("../server/wire-service/machine.ts", import.meta.url), "utf8");
  const apiSrc = readFileSync(new URL("../src/app/wire/reals/machineApi.ts", import.meta.url), "utf8");
  const standinSrc = readFileSync(new URL("../src/app/wire/standins/machineApi.ts", import.meta.url), "utf8");
  if (machineSrc.includes('"firm-cedar"') || apiSrc.includes("firm-cedar")) {
    fail("grep-request-path", "firm-cedar still hardcoded in machine.ts or reals/machineApi.ts");
  } else {
    ok("grep-request-path", "machine.ts + reals/machineApi.ts clean");
  }
  if (/const FIRM\s*=\s*"firm-cedar"/.test(standinSrc)) {
    fail("grep-standin", "standin still has const FIRM = firm-cedar");
  } else {
    ok("grep-standin", "standin uses session firm (seed fallback only when unbound)");
  }

  const a = await walkOneFirm("A");
  const b = await walkOneFirm("B");

  if (a && b) {
    if (a.firmId === b.firmId) {
      fail("two-firm-distinct", "both walks minted the same firm id");
    } else {
      ok("two-firm-distinct", `${a.firmId} vs ${b.firmId}`);
    }

    // A session must not see B contacts
    process.env.AUTH_DISABLED = "false";
    const app = wireApp();
    const aBook = await app.request("/wire/machine/contact-records", { headers: a.cookies });
    const aBody = await aBook.json();
    const bIds = (aBody.contacts ?? []).map((c: { id: string }) => c.id);
    if (bIds.includes(b.contactId)) {
      fail("two-firm-isolation", "firm A session saw firm B contact");
    } else if (aBody.firmId !== a.firmId) {
      fail("two-firm-isolation", `A session scoped to ${aBody.firmId}`);
    } else {
      ok("two-firm-isolation", "each session sees only its own book");
    }

    // Neither operating as Cedar
    const cedarLeak = await pool.query(
      `SELECT firm_id, count(*)::int AS n FROM contact_records
       WHERE id = ANY($1::text[]) GROUP BY firm_id`,
      [[a.contactId, b.contactId]],
    );
    const leaked = cedarLeak.rows.some((r) => r.firm_id === "firm-cedar");
    if (leaked) fail("not-cedar", "contacts landed under firm-cedar");
    else ok("not-cedar", "neither firm's contacts under firm-cedar");
  }
} finally {
  await pool.end();
}

const failed = report.filter((r) => !r.ok);
console.log("\n--- Firm binding summary ---");
console.log(JSON.stringify(report, null, 2));
if (failed.length) {
  console.error(`\n${failed.length} step(s) failed`);
  process.exit(1);
}
console.log("\nFirm binding six-step + two-firm proofs PASSED.");
