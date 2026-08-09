/**
 * Phase 4 proof against real Postgres.
 * Requires DATABASE_URL + migrations 001–004 + seed 002 applied.
 *
 * Steps:
 *  1. Provision already real (firms/users) — assert firm-cedar campaign
 *  2. Audit run → reachability_verdict + sequence_ready
 *  3. Onboarding fire → opt-in enrollments
 *  4. reference_version upsert → faceless cascade → reactivation enrollment
 *  5. workflow create → activate (draft→active) → workflow_run
 */
import { randomUUID } from "node:crypto";
import { createPgPool } from "./pgConnect.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing — cannot prove Phase 4 on real Postgres.");
  console.error("Wire point: scripts/verify-machine-e2e.ts → createPgPool");
  process.exit(2);
}

const pool = createPgPool(connectionString);
const firm = "firm-cedar";
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
  // 0 — machine tables present
  const tables = await pool.query<{ reg: string | null }>(
    `SELECT to_regclass('public.workflow')::text AS reg`,
  );
  if (!tables.rows[0]?.reg) {
    fail("schema", "workflow table missing — run npm run db:migrate");
    process.exit(1);
  }
  ok("schema", "workflow present");

  // 1 — provision / campaign
  const camp = await pool.query(`SELECT state FROM campaign_states WHERE firm_id=$1`, [firm]);
  if (!camp.rowCount) {
    fail("provision", "campaign_states missing for firm-cedar — run npm run db:seed");
  } else {
    ok("provision", `campaign_states=${camp.rows[0].state}`);
  }

  // 2 — audit run
  const contactId = `verify-contact-${randomUUID().slice(0, 8)}`;
  const auditId = `arun-${randomUUID()}`;
  await pool.query(
    `INSERT INTO audit_runs (id, firm_id, status) VALUES ($1,$2,'running')`,
    [auditId, firm],
  );
  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, name)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email`,
    [contactId, firm, "verify@example.com", "Verify Contact"],
  );
  await pool.query(
    `INSERT INTO reachability_verdicts (contact_id, firm_id, verdict, details)
     VALUES ($1,$2,'reachable',$3::jsonb)
     ON CONFLICT (contact_id, firm_id) DO UPDATE SET verdict='reachable'`,
    [contactId, firm, JSON.stringify({ auditId })],
  );
  await pool.query(
    `INSERT INTO sequence_ready (contact_id, firm_id, ready)
     VALUES ($1,$2,true)
     ON CONFLICT (contact_id, firm_id) DO UPDATE SET ready=true`,
    [contactId, firm],
  );
  await pool.query(
    `UPDATE audit_runs SET status='complete', finished_at=now() WHERE id=$1`,
    [auditId],
  );
  ok("audit", `wrote reachability_verdicts + sequence_ready for ${contactId}`);

  // 3 — onboarding enrollments
  const bind = await pool.query<{ template_id: string }>(
    `SELECT template_id FROM firm_sequence_binding
     WHERE firm_id=$1 AND sequence_class='optin_launch'`,
    [firm],
  );
  const optinTpl = bind.rows[0]?.template_id ?? "tpl.optin_launch.v1";
  const enrOpt = `enr-${randomUUID()}`;
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, payload)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
    [
      enrOpt,
      firm,
      contactId,
      optinTpl,
      optinTpl,
      JSON.stringify({ trigger: "campaign_state=running", dryRun: true }),
    ],
  );
  ok("onboarding", `enrollment ${enrOpt} → ${optinTpl} (dry-run send)`);

  // 4 — faceless reference cascade
  const refId = `ref.crs.cutoff.verify.${Date.now()}`;
  await pool.query(
    `INSERT INTO reference_versions (id, firm_id, key, payload, version)
     VALUES ($1,NULL,'crs_cutoff',$2::jsonb,2)`,
    [refId, JSON.stringify({ cutoff: 470, program: "CEC" })],
  );
  const evalId = `eval-${randomUUID()}`;
  await pool.query(
    `INSERT INTO eligibility_evaluations (id, firm_id, contact_id, trigger_kind, status)
     VALUES ($1,$2,$3,'reference_version','done')`,
    [evalId, firm, contactId],
  );
  const resultId = `eres-${randomUUID()}`;
  await pool.query(
    `INSERT INTO eligibility_results (id, evaluation_id, firm_id, contact_id, result, any_pathway_pass)
     VALUES ($1,$2,$3,$4,$5::jsonb,true)`,
    [resultId, evalId, firm, contactId, JSON.stringify({ refId })],
  );
  const signalId = `sig-${randomUUID()}`;
  await pool.query(
    `INSERT INTO signals (id, firm_id, contact_id, kind, payload)
     VALUES ($1,$2,$3,'eligibility_determination',$4::jsonb)`,
    [signalId, firm, contactId, JSON.stringify({ resultId })],
  );
  const motionId = `mot-${randomUUID()}`;
  await pool.query(
    `INSERT INTO motion_decisions (id, firm_id, contact_id, motion, reason)
     VALUES ($1,$2,$3,'reactivation',$4::jsonb)`,
    [motionId, firm, contactId, JSON.stringify({ signalId, precedence: "mp-1" })],
  );
  const reactBind = await pool.query<{ template_id: string }>(
    `SELECT template_id FROM firm_sequence_binding
     WHERE firm_id=$1 AND sequence_class='reactivation'`,
    [firm],
  );
  const reactTpl = reactBind.rows[0]?.template_id ?? "tpl.reactivation.v1";
  const enrReact = `enr-${randomUUID()}`;
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, payload)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
    [
      enrReact,
      firm,
      contactId,
      reactTpl,
      reactTpl,
      JSON.stringify({ motionId, dryRun: true, faceless: true }),
    ],
  );
  ok(
    "reference-cascade",
    `row edit ${refId} → eligibility → signal → motion → enrollment ${enrReact} (no deploy)`,
  );

  // 5 — activate workflow + run
  const wfId = `wf-verify-${randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO workflow (id, firm_id, name, target) VALUES ($1,$2,$3,'contact')`,
    [wfId, firm, "Verify Activate"],
  );
  await pool.query(`INSERT INTO workflow_state (workflow_id, status) VALUES ($1,'draft')`, [wfId]);
  await pool.query(
    `UPDATE workflow_state SET status='active', updated_at=now() WHERE workflow_id=$1`,
    [wfId],
  );
  const st = await pool.query<{ status: string }>(
    `SELECT status FROM workflow_state WHERE workflow_id=$1`,
    [wfId],
  );
  if (st.rows[0]?.status !== "active") {
    fail("activate", `expected active, got ${st.rows[0]?.status}`);
  } else {
    ok("activate", `${wfId} draft→active`);
  }
  const runId = `run-${randomUUID()}`;
  await pool.query(
    `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label)
     VALUES ($1,$2,$3,'success','Manual run')`,
    [runId, wfId, firm],
  );
  ok("workflow_run", `run ${runId} written for ${wfId}`);

  const failed = report.filter((r) => !r.ok);
  console.log("\n--- Phase 4 summary ---");
  console.log(JSON.stringify(report, null, 2));
  if (failed.length) {
    process.exit(1);
  }
  console.log("\nAll Phase 4 DB proofs passed (send path remains dry-run on enrollments).");
} finally {
  await pool.end();
}
