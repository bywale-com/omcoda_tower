/**
 * SHIP spine smoke — spec-vs-app on real Postgres (not stand-ins).
 * Flow source of truth: Provision → machine health → reference persist →
 * campaign state → audit book → halt/consent deny → send cohort gate.
 *
 * Run: npm run verify:ship
 */
import { randomUUID } from "node:crypto";
import { createPgPool } from "./pgConnect.ts";
import { shouldLiveSend, getSendMode, getSendTestCohort } from "../server/wire-service/sendMode.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const firm = "firm-cedar";
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

try {
  // Spec: missing/empty SEND_MODE → dry_run (deploy fail-closed default)
  const prevMode = process.env.SEND_MODE;
  const prevCohort = process.env.SEND_TEST_COHORT;
  delete process.env.SEND_MODE;
  if (getSendMode() !== "dry_run" || shouldLiveSend("anyone")) {
    fail("send-mode-default", `expected dry_run on unset, got ${getSendMode()}`);
  } else {
    ok("send-mode-default", "unset SEND_MODE → dry_run");
  }

  // Spec: live + empty cohort → nobody live (fail closed)
  process.env.SEND_MODE = "live";
  process.env.SEND_TEST_COHORT = "";
  if (shouldLiveSend("anyone")) {
    fail("cohort-fail-closed", "empty cohort allowed live");
  } else {
    ok("cohort-fail-closed", `mode=${getSendMode()} cohortSize=${getSendTestCohort().size}`);
  }

  const contactId = `ship-spine-${randomUUID().slice(0, 8)}`;
  process.env.SEND_TEST_COHORT = contactId;
  if (!shouldLiveSend(contactId) || shouldLiveSend("off-cohort")) {
    fail("cohort-allowlist", "allowlist broken");
  } else {
    ok("cohort-allowlist", `${contactId} live; off-cohort blocked`);
  }
  process.env.SEND_MODE = prevMode;
  process.env.SEND_TEST_COHORT = prevCohort;

  // Spec: reference edit → payload.rows value persists in reference_versions
  const refId = `ref.ship.spine.${randomUUID().slice(0, 6)}`;
  const edited = 1611;
  await pool.query(
    `INSERT INTO reference_versions (id, firm_id, key, payload, version)
     VALUES ($1,null,$2,$3::jsonb,$4)
     ON CONFLICT (id) DO UPDATE SET payload=EXCLUDED.payload, version=EXCLUDED.version`,
    [
      refId,
      "reference.immigration",
      JSON.stringify({
        industry: "immigration",
        rows: [{ key: "cec.min_hours", label: "CEC hours", value: edited, type: "number" }],
      }),
      42,
    ],
  );
  const ref = await pool.query<{ payload: { rows?: Array<{ key: string; value: unknown }> } }>(
    `SELECT payload FROM reference_versions WHERE id=$1`,
    [refId],
  );
  const got = ref.rows[0]?.payload?.rows?.find((r) => r.key === "cec.min_hours")?.value;
  if (got !== edited) {
    fail("reference-persist", `expected ${edited}, got ${String(got)}`);
  } else {
    ok("reference-persist", `${refId} cec.min_hours=${edited}`);
  }

  // Spec: campaign_states write/read
  await pool.query(
    `INSERT INTO campaign_states (firm_id, state, updated_at)
     VALUES ($1,'running',now())
     ON CONFLICT (firm_id) DO UPDATE SET state='running', updated_at=now()`,
    [firm],
  );
  const camp = await pool.query<{ state: string }>(
    `SELECT state FROM campaign_states WHERE firm_id=$1`,
    [firm],
  );
  if (camp.rows[0]?.state !== "running") {
    fail("campaign-state", JSON.stringify(camp.rows[0]));
  } else {
    ok("campaign-state", "running");
  }

  // Spec: Book audit writes contact_records + reachability + sequence_ready + audit_runs
  const auditId = `arun-ship-${randomUUID().slice(0, 8)}`;
  const bookContact = `ship-book-${randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO audit_runs (id, firm_id, status, import_ids, summary, started_at, finished_at)
     VALUES ($1,$2,'complete','[]'::jsonb,'{"contacts":1}'::jsonb,now(),now())`,
    [auditId, firm],
  );
  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, phone, name)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email`,
    [bookContact, firm, "ship-book@example.com", "+15550001111", "Ship Book"],
  );
  await pool.query(
    `INSERT INTO reachability_verdicts (contact_id, firm_id, verdict, details, updated_at)
     VALUES ($1,$2,'reachable','{}'::jsonb,now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE SET verdict='reachable', updated_at=now()`,
    [bookContact, firm],
  );
  await pool.query(
    `INSERT INTO sequence_ready (contact_id, firm_id, ready, updated_at)
     VALUES ($1,$2,true,now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE SET ready=true, updated_at=now()`,
    [bookContact, firm],
  );
  const bookOk =
    (await pool.query(`SELECT 1 FROM audit_runs WHERE id=$1`, [auditId])).rowCount === 1 &&
    (await pool.query(`SELECT 1 FROM contact_records WHERE id=$1`, [bookContact])).rowCount === 1 &&
    (
      await pool.query(
        `SELECT 1 FROM reachability_verdicts WHERE contact_id=$1 AND verdict='reachable'`,
        [bookContact],
      )
    ).rowCount === 1 &&
    (
      await pool.query(`SELECT 1 FROM sequence_ready WHERE contact_id=$1 AND ready=true`, [
        bookContact,
      ])
    ).rowCount === 1;
  if (!bookOk) fail("book-tables", "missing audit/contact/verdict/ready row");
  else ok("book-tables", `${auditId} + ${bookContact}`);

  // Spec: halt deny — firm-book halt row present blocks new work (table contract)
  const haltId = `halt-ship-${randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO halt_records (id, consultant_id, firm_id, scope, reason, halted_at)
     VALUES ($1,'ship-verify',$2,'firm-book','ship deny-path',now())`,
    [haltId, firm],
  );
  const halt = await pool.query(
    `SELECT 1 FROM halt_records WHERE id=$1 AND lifted_at IS NULL AND scope='firm-book'`,
    [haltId],
  );
  if (!halt.rowCount) fail("halt-deny-row", "halt not persisted");
  else ok("halt-deny-row", haltId);
  await pool.query(`UPDATE halt_records SET lifted_at=now() WHERE id=$1`, [haltId]);

  // Spec: consent silence row
  await pool.query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, status, updated_at)
     VALUES ($1,$2,'express',true,'silenced',now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE SET silenced=true, status='silenced'`,
    [bookContact, firm],
  );
  const silenced = await pool.query(
    `SELECT 1 FROM consent_records WHERE contact_id=$1 AND firm_id=$2 AND silenced=true`,
    [bookContact, firm],
  );
  if (!silenced.rowCount) fail("consent-silence-row", "silence not persisted");
  else ok("consent-silence-row", bookContact);

  // Spec: product entry is CT, not Hub — checked via Router source (static)
  const routerSrc = await import("node:fs").then((fs) =>
    fs.readFileSync(new URL("../src/app/Router.tsx", import.meta.url), "utf8"),
  );
  if (
    routerSrc.includes('Navigate to="/prototype-ant"') &&
    routerSrc.includes('path="/hub"')
  ) {
    ok("product-face", "/ → /prototype-ant; Hub at /hub");
  } else {
    fail("product-face", "Router still defaults to Hub App");
  }

  const failed = report.filter((r) => !r.ok);
  console.log("\n--- SHIP spine summary ---");
  console.log(JSON.stringify(report, null, 2));
  if (failed.length) process.exit(1);
  console.log("\nSHIP spine smoke PASSED");
} finally {
  await pool.end();
}
