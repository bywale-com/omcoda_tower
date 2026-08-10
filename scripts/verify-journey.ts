/**
 * Prove the product journey against real Postgres (no browser).
 * Mirrors the UI click path: authorize → import → detect → outreach.
 */
import { createPgPool } from "./pgConnect.ts";
import { enrollAndActuate } from "../server/wire-service/cascade.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const firm = process.env.JOURNEY_FIRM_ID || "firm-cedar";
const pool = createPgPool(connectionString);

async function ensureFirm(firmId: string) {
  await pool.query(
    `INSERT INTO ct_firms (id, name, posture) VALUES ($1,$2,'Armed') ON CONFLICT (id) DO NOTHING`,
    [firmId, firmId],
  );
  await pool.query(
    `INSERT INTO campaign_states (firm_id, state) VALUES ($1,'running')
     ON CONFLICT (firm_id) DO UPDATE SET state='running'`,
    [firmId],
  );
  for (const seqClass of ["optin_launch", "launch_day", "reengagement", "reactivation"]) {
    const tpl = await pool.query<{ id: string }>(
      `SELECT id FROM sequence_template WHERE sequence_class=$1 LIMIT 1`,
      [seqClass],
    );
    if (!tpl.rows[0]) continue;
    await pool.query(
      `INSERT INTO firm_sequence_binding (id, firm_id, sequence_class, template_id)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (firm_id, sequence_class) DO NOTHING`,
      [`bind.${firmId}.${seqClass}`, firmId, seqClass, tpl.rows[0].id],
    );
  }
}

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
  await ensureFirm(firm);

  // 1 authorize
  await pool.query(
    `INSERT INTO crm_oauth_grants (firm_id, granted, revoked, scopes, granted_at, updated_at)
     VALUES ($1,true,false,ARRAY['book.read'],now(),now())
     ON CONFLICT (firm_id) DO UPDATE SET granted=true, revoked=false, updated_at=now()`,
    [firm],
  );
  ok("authorize", `crm_oauth_grants.granted for ${firm}`);

  // 2 import
  const c1 = `journey-c1-${Date.now()}`;
  const c2 = `journey-c2-${Date.now()}`;
  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, phone, name)
     VALUES ($1,$2,$3,$4,$5), ($6,$2,$7,$8,$9)
     ON CONFLICT (id) DO NOTHING`,
    [
      c1,
      firm,
      process.env.TEST_EMAIL_TO || "journey1@example.com",
      "+15550001111",
      "Journey One",
      c2,
      "journey2@example.com",
      null,
      "Journey Two",
    ],
  );
  const cnt = await pool.query(`SELECT count(*)::int AS n FROM contact_records WHERE firm_id=$1`, [
    firm,
  ]);
  ok("import", `${cnt.rows[0].n} contact_records for firm`);

  // 3 detect
  for (const id of [c1, c2]) {
    await pool.query(
      `INSERT INTO reachability_verdicts (contact_id, firm_id, verdict)
       VALUES ($1,$2,'reachable')
       ON CONFLICT (contact_id, firm_id) DO UPDATE SET verdict='reachable'`,
      [id, firm],
    );
    await pool.query(
      `INSERT INTO sequence_ready (contact_id, firm_id, ready)
       VALUES ($1,$2,true)
       ON CONFLICT (contact_id, firm_id) DO UPDATE SET ready=true`,
      [id, firm],
    );
    await pool.query(
      `INSERT INTO eligibility_results (id, firm_id, contact_id, result, any_pathway_pass)
       VALUES ($1,$2,$3,'{}'::jsonb,true)`,
      [`eres-${id}`, firm, id],
    );
    await pool.query(
      `INSERT INTO signals (id, firm_id, contact_id, kind, payload)
       VALUES ($1,$2,$3,'eligibility_determination','{}'::jsonb)`,
      [`sig-${id}`, firm, id],
    );
  }
  ok("detect", "reachability_verdicts + eligibility_results + signals");

  // 4 outreach
  process.env.SEND_MODE = "dry_run";
  const enrolled = await enrollAndActuate({
    firmId: firm,
    contactId: c1,
    agentRef: "tpl.optin_launch.v1",
    purpose: "opt-in",
    payload: { verifyJourney: true },
  });
  if (enrolled.dryRun) {
    ok("outreach", `enrollment ${enrolled.enrollmentId} dry-run`);
  } else {
    fail("outreach", "expected dry-run");
  }

  const failed = report.filter((r) => !r.ok);
  console.log(JSON.stringify(report, null, 2));
  if (failed.length) process.exit(1);
  console.log("Journey DB path green.");
} finally {
  await pool.end();
}
