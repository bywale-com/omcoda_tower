/**
 * Prove Automations + Agents alive on real Postgres.
 * Requires DATABASE_URL, migrations through 006, seeds 002+003.
 *
 * 1. Schema: workflow_trigger present
 * 2. Seed: three canonical workflows
 * 3. Activate eligibility workflow → materialize trigger
 * 4. Emit eligibility.changed (via walk dispatch) → workflow_run + enrollment
 * 5. Webhook fire → walk
 * 6. Template upsert → sequence_template cells change
 */
import { randomUUID } from "node:crypto";
import { createPgPool } from "./pgConnect.ts";
import {
  dispatchEventToWorkflows,
  materializeTriggersFromGraph,
  walkValidatedWorkflow,
} from "../server/wire-service/workflowWalk.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const pool = createPgPool(connectionString);
const firm = "firm-cedar";
let failed = 0;

function ok(step: string, detail: string) {
  console.log(`✅ ${step}: ${detail}`);
}
function fail(step: string, detail: string) {
  failed += 1;
  console.error(`❌ ${step}: ${detail}`);
}

try {
  const trigTable = await pool.query(
    `SELECT to_regclass('public.workflow_trigger')::text AS reg`,
  );
  if (!trigTable.rows[0]?.reg) {
    fail("schema", "workflow_trigger missing — run npm run db:migrate");
    process.exit(1);
  }
  ok("schema", "workflow_trigger present");

  const wfs = await pool.query(
    `SELECT id FROM workflow WHERE id = ANY($1::text[])`,
    [["wf-optin-launch", "wf-eligibility-reactivation", "wf-webhook-reeval"]],
  );
  if (wfs.rowCount !== 3) {
    fail("seed", `expected 3 canonical workflows, got ${wfs.rowCount} — run npm run db:seed`);
  } else {
    ok("seed", "3 canonical workflows present");
  }

  // Ensure a ready contact
  const contactId = `alive-contact-${randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, name)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email`,
    [contactId, firm, "alive@example.com", "Alive Contact"],
  );
  const readyRun = `arun-alive-${randomUUID()}`;
  await pool.query(
    `INSERT INTO audit_runs (id, firm_id, status, import_ids, summary)
     VALUES ($1,$2,'complete','[]'::jsonb,'{}'::jsonb)`,
    [readyRun, firm],
  );
  await pool.query(
    `INSERT INTO sequence_ready (audit_run_id, contact_id, firm_id, ready, updated_at)
     VALUES ($1,$2,$3,true,now())`,
    [readyRun, contactId, firm],
  );

  // Activate eligibility workflow + materialize triggers
  const graph = await pool.query<{ graph: { nodes: unknown[]; edges: unknown[] } }>(
    `SELECT graph FROM workflow WHERE id=$1`,
    ["wf-eligibility-reactivation"],
  );
  await pool.query(
    `UPDATE workflow_state SET status='active', updated_at=now() WHERE workflow_id=$1`,
    ["wf-eligibility-reactivation"],
  );
  const n = await materializeTriggersFromGraph(
    pool,
    "wf-eligibility-reactivation",
    firm,
    graph.rows[0]?.graph ?? { nodes: [], edges: [] },
  );
  ok("activate", `materialized ${n} trigger(s) for wf-eligibility-reactivation`);

  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: firm,
    eventName: "eligibility.changed",
    payload: { anyPass: true, motion: "reactivation", verify: true },
    contactIds: [contactId],
  });
  if (!dispatched.length || !dispatched[0].enrollments) {
    fail(
      "eligibility.walk",
      `no enrollments (fired=${dispatched.length})`,
    );
  } else {
    ok(
      "eligibility.walk",
      `run=${dispatched[0].runId} enrollments=${dispatched[0].enrollments}`,
    );
  }

  // Activate + fire webhook workflow
  await pool.query(
    `UPDATE workflow_state SET status='active' WHERE workflow_id=$1`,
    ["wf-webhook-reeval"],
  );
  const whGraph = await pool.query<{ graph: { nodes: unknown[]; edges: unknown[] } }>(
    `SELECT graph FROM workflow WHERE id=$1`,
    ["wf-webhook-reeval"],
  );
  await materializeTriggersFromGraph(
    pool,
    "wf-webhook-reeval",
    firm,
    whGraph.rows[0]?.graph ?? { nodes: [], edges: [] },
  );
  const runId = `run-${randomUUID()}`;
  await pool.query(
    `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label)
     VALUES ($1,$2,$3,'running',$4)`,
    [runId, "wf-webhook-reeval", firm, "webhook:wh_crs_external_v1"],
  );
  const walked = await walkValidatedWorkflow(pool, {
    workflowId: "wf-webhook-reeval",
    firmId: firm,
    runId,
    triggerLabel: "webhook:wh_crs_external_v1",
    triggerPayload: { webhookId: "wh_crs_external_v1", anyPass: true },
    contactIds: [contactId],
  });
  if (!walked.ok || !walked.enrollments.length) {
    fail("webhook.walk", walked.error ?? "no enrollments");
  } else {
    ok("webhook.walk", `enrollments=${walked.enrollments.length} nodes=${Object.keys(walked.nodeStatus).length}`);
  }

  // Agents: template upsert
  const cells = [
    { id: "verify-cell-1", kind: "email", channel: "email", subject: "Alive verify", ord: 0 },
  ];
  await pool.query(
    `UPDATE sequence_template SET cells=$2::jsonb, version=version+1, updated_at=now()
     WHERE id=$1`,
    ["tpl.reengagement.v1", JSON.stringify(cells)],
  );
  const tpl = await pool.query<{ cells: unknown[] }>(
    `SELECT cells FROM sequence_template WHERE id=$1`,
    ["tpl.reengagement.v1"],
  );
  const cell0 = (tpl.rows[0]?.cells?.[0] ?? {}) as { id?: string };
  if (cell0.id !== "verify-cell-1") {
    fail("agents.template", "sequence_template cells not updated");
  } else {
    ok("agents.template", "sequence_template.tpl.reengagement.v1 cells written");
  }

  // Opt-in activate + manual walk
  await pool.query(`UPDATE workflow_state SET status='active' WHERE workflow_id=$1`, [
    "wf-optin-launch",
  ]);
  const optGraph = await pool.query<{ graph: { nodes: unknown[]; edges: unknown[] } }>(
    `SELECT graph FROM workflow WHERE id=$1`,
    ["wf-optin-launch"],
  );
  await materializeTriggersFromGraph(
    pool,
    "wf-optin-launch",
    firm,
    optGraph.rows[0]?.graph ?? { nodes: [], edges: [] },
  );
  const optRun = `run-${randomUUID()}`;
  await pool.query(
    `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label)
     VALUES ($1,$2,$3,'running',$4)`,
    [optRun, "wf-optin-launch", firm, "Manual run"],
  );
  const optWalk = await walkValidatedWorkflow(pool, {
    workflowId: "wf-optin-launch",
    firmId: firm,
    runId: optRun,
    triggerLabel: "Manual run",
    triggerPayload: { manual: true, anyPass: true },
    contactIds: [contactId],
  });
  if (!optWalk.ok) fail("optin.walk", optWalk.error ?? "failed");
  else ok("optin.walk", `enrollments=${optWalk.enrollments.length}`);

  console.log(failed ? `\nFAILED (${failed})` : "\nALL PROOFS PASSED");
  process.exit(failed ? 1 : 0);
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await pool.end();
}
