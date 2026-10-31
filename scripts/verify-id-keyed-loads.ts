/**
 * PKT-006 against migrated Postgres.
 *
 * fact_writebacks, meeting_booked, and wait_occupancy load by id.
 * A miss does not fall through to contact_id. The three append tables
 * person-split. The generic action pointer is the id writeEngagement
 * returned. call_agent, ascribe_tag, run_audit, and an in-app affordance
 * still return before that fallthrough.
 *
 * Ship CI runs this after migrate and seed, beside verify-click-attribution.
 */
import { randomUUID } from "node:crypto";
import { getPool } from "../server/wire-service/db.ts";
import { walkValidatedWorkflow, type NodeRunStatus } from "../server/wire-service/workflowWalk.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const pool = getPool();
const token = randomUUID().slice(0, 8);
const firm = `firm-pkt006-${token}`;
const contactA = `contact-pkt006-${token}-a`;
const contactB = `contact-pkt006-${token}-b`;

type Write = { table: string; id: string; contact_id?: string | null };
type TableName = "fact_writebacks" | "meeting_booked" | "wait_occupancy";

const tables: Array<{ table: TableName; field: string }> = [
  { table: "fact_writebacks", field: "field_key" },
  { table: "meeting_booked", field: "source" },
  { table: "wait_occupancy", field: "title" },
];

function fail(name: string, detail: unknown): never {
  console.error(`fail ${name}`, detail);
  process.exitCode = 1;
  throw new Error(name);
}

function node(id: string, type: string, data: Record<string, unknown>) {
  return { id, type, data: { configured: true, ...data } };
}

function ifGraph(table: string, field: string, pickValue: string) {
  return {
    nodes: [
      node("trig", "trigger", { triggerKind: "manual" }),
      node("iff", "if", {
        pickTable: table,
        pickField: field,
        pickOp: "eq",
        pickValue,
      }),
      node("tag", "action", { actionType: "ascribe_tag", tag: "pkt006" }),
      node("stop", "exit", {}),
    ],
    edges: [
      { id: `${table}-trig`, source: "trig", target: "iff" },
      { id: `${table}-true`, source: "iff", target: "tag", sourceHandle: "true" },
      { id: `${table}-false`, source: "iff", target: "stop", sourceHandle: "false" },
    ],
  };
}

function actionGraph(actionType: string, extra: Record<string, unknown> = {}) {
  return {
    nodes: [
      node("trig", "trigger", { triggerKind: "manual" }),
      node("act", "action", { actionType, ...extra }),
    ],
    edges: [{ id: `${actionType}-e`, source: "trig", target: "act" }],
  };
}

async function prepare(name: string, graph: unknown): Promise<{ workflowId: string; runId: string }> {
  const workflowId = `wf-pkt006-${token}-${name}`;
  const runId = `run-pkt006-${token}-${name}`;
  await pool.query(
    `INSERT INTO workflow (id, firm_id, name, target, graph) VALUES ($1,$2,$3,'contact',$4::jsonb)`,
    [workflowId, firm, workflowId, JSON.stringify(graph)],
  );
  await pool.query(
    `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label) VALUES ($1,$2,$3,'running',$4)`,
    [runId, workflowId, firm, "manual"],
  );
  return { workflowId, runId };
}

async function walk(workflowId: string, runId: string, writes: Write[], contactIds: string[]) {
  return walkValidatedWorkflow(pool, {
    workflowId,
    firmId: firm,
    runId,
    triggerLabel: "manual",
    triggerPayload: { writes },
    contactIds,
  });
}

async function insertRow(
  table: TableName,
  id: string,
  contactId: string,
  column: string,
  workflowId: string,
  runId: string,
  later: boolean,
  waitNodeId: string,
) {
  if (table === "fact_writebacks") {
    await pool.query(
      `INSERT INTO fact_writebacks (id, firm_id, contact_id, field_key, created_at)
       VALUES ($1,$2,$3,$4, CASE WHEN $5::bool THEN now() + interval '1 minute' ELSE now() END)`,
      [id, firm, contactId, column, later],
    );
    return;
  }
  if (table === "meeting_booked") {
    await pool.query(
      `INSERT INTO meeting_booked (id, firm_id, contact_id, source, created_at)
       VALUES ($1,$2,$3,$4, CASE WHEN $5::bool THEN now() + interval '1 minute' ELSE now() END)`,
      [id, firm, contactId, column, later],
    );
    return;
  }
  await pool.query(
    `INSERT INTO wait_occupancy (
       id, firm_id, workflow_id, wait_node_id, workflow_run_id,
       contact_id, title, approver, status, created_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,'consultant','open', CASE WHEN $8::bool THEN now() + interval '1 minute' ELSE now() END)`,
    [id, firm, workflowId, waitNodeId, runId, contactId, column, later],
  );
}

async function tagged(workflowId: string): Promise<string[]> {
  const { rows } = await pool.query<{ contact_id: string }>(
    `SELECT contact_id FROM contact_tag
      WHERE firm_id=$1 AND source_workflow_id=$2 AND tag='pkt006'
      ORDER BY contact_id`,
    [firm, workflowId],
  );
  return rows.map((row) => row.contact_id);
}

async function engagementId(contactId: string, eventKind: string): Promise<string[]> {
  const { rows } = await pool.query<{ id: string }>(
    `SELECT id FROM engagement_records WHERE firm_id=$1 AND contact_id=$2 AND event_kind=$3`,
    [firm, contactId, eventKind],
  );
  return rows.map((row) => row.id);
}

function detailOf(status: Record<string, NodeRunStatus> | undefined, id: string): string {
  return status?.[id]?.detail ?? "";
}

try {
  for (const spec of tables) {
    const name = `case1-${spec.table}`;
    const { workflowId, runId } = await prepare(name, ifGraph(spec.table, spec.field, "keep"));
    const idA = `${spec.table}-${token}-a-keep`;
    const decoy = `${spec.table}-${token}-a-decoy`;
    const idB = `${spec.table}-${token}-b-other`;
    await insertRow(spec.table, idA, contactA, "keep", workflowId, runId, false, "kept");
    await insertRow(spec.table, decoy, contactA, "decoy", workflowId, runId, true, "decoy");
    await insertRow(spec.table, idB, contactB, "other", workflowId, runId, false, "other");
    const result = await walk(
      workflowId,
      runId,
      [
        { table: spec.table, id: idA, contact_id: contactA },
        { table: spec.table, id: idB, contact_id: contactB },
      ],
      [contactA, contactB],
    );
    const expected = `if pick ${spec.table}.${spec.field} then=1 else=1`;
    if (detailOf(result.nodeStatus, "iff") !== expected) fail(`${name}-detail`, result.nodeStatus.iff);
    const tags = await tagged(workflowId);
    if (tags.length !== 1 || tags[0] !== contactA) fail(`${name}-tags`, tags);
  }

  for (const spec of tables) {
    const name = `case2-${spec.table}`;
    const { workflowId, runId } = await prepare(name, ifGraph(spec.table, spec.field, "keep"));
    const missA = `${spec.table}-${token}-a-miss`;
    const missB = `${spec.table}-${token}-b-miss`;
    await insertRow(spec.table, `${spec.table}-${token}-a-present`, contactA, "keep", workflowId, runId, false, "present-a");
    await insertRow(spec.table, `${spec.table}-${token}-b-present`, contactB, "keep", workflowId, runId, false, "present-b");
    const result = await walk(
      workflowId,
      runId,
      [
        { table: spec.table, id: missA, contact_id: contactA },
        { table: spec.table, id: missB, contact_id: contactB },
      ],
      [contactA, contactB],
    );
    const expected = `if pick ${spec.table}.${spec.field} then=0 else=2`;
    if (detailOf(result.nodeStatus, "iff") !== expected) fail(`${name}-detail`, result.nodeStatus.iff);
    const tags = await tagged(workflowId);
    if (tags.length !== 0) fail(`${name}-tags`, tags);
  }

  const firstId = `fact_writebacks-${token}-first`;
  const secondId = `fact_writebacks-${token}-second`;
  const firstPrep = await prepare("case5-first", ifGraph("fact_writebacks", "field_key", "first"));
  const secondPrep = await prepare("case5-second", ifGraph("fact_writebacks", "field_key", "second"));
  await insertRow("fact_writebacks", firstId, contactA, "first", firstPrep.workflowId, firstPrep.runId, false, "first");
  await insertRow("fact_writebacks", secondId, contactA, "second", firstPrep.workflowId, firstPrep.runId, false, "second");
  const ordered = [
    { table: "fact_writebacks", id: firstId, contact_id: contactA },
    { table: "fact_writebacks", id: secondId, contact_id: contactA },
  ];
  const firstWalk = await walk(firstPrep.workflowId, firstPrep.runId, ordered, [contactA]);
  const secondWalk = await walk(secondPrep.workflowId, secondPrep.runId, ordered, [contactA]);
  if (detailOf(firstWalk.nodeStatus, "iff") !== "if pick fact_writebacks.field_key then=1 else=0") {
    fail("case5-first", firstWalk.nodeStatus.iff);
  }
  if (detailOf(secondWalk.nodeStatus, "iff") !== "if pick fact_writebacks.field_key then=0 else=1") {
    fail("case5-second", secondWalk.nodeStatus.iff);
  }

  for (const actionType of ["manage_lists", "assign_task", "notify_consultant"] as const) {
    const { workflowId, runId } = await prepare(`case6-${actionType}`, actionGraph(actionType));
    const result = await walk(workflowId, runId, [], [contactA, contactB]);
    const writes = result.nodeStatus.act?.writes ?? [];
    if (result.nodeStatus.act?.status !== "success") fail(`case6-${actionType}-status`, result.nodeStatus.act);
    if (result.nodeStatus.act?.detail !== `${actionType}; contacts=2`) fail(`case6-${actionType}-detail`, result.nodeStatus.act);
    if (writes.length !== 2) fail(`case6-${actionType}-count`, writes);
    for (const contactId of [contactA, contactB]) {
      const pointer = writes.find((row) => row.contact_id === contactId);
      if (!pointer || pointer.table !== "engagement_records") fail(`case6-${actionType}-pointer`, writes);
      if (!pointer.id.startsWith("eng-") || pointer.id === contactId) fail(`case6-${actionType}-id`, pointer);
      const stored = await engagementId(contactId, actionType);
      if (stored.length !== 1 || stored[0] !== pointer.id) fail(`case6-${actionType}-row`, { pointer, stored });
    }
  }

  const tagWalk = await prepare("case7-tag", actionGraph("ascribe_tag", { tag: "pkt006" }));
  const taggedRun = await walk(tagWalk.workflowId, tagWalk.runId, [], [contactA]);
  const tagWrites = taggedRun.nodeStatus.act?.writes ?? [];
  if (taggedRun.nodeStatus.act?.status !== "success") fail("case7-tag-status", taggedRun.nodeStatus.act);
  if (tagWrites.length === 0 || tagWrites.some((row) => row.table !== "contact_tag")) fail("case7-tag-writes", tagWrites);
  if ((await engagementId(contactA, "ascribe_tag")).length !== 0) fail("case7-tag-engagement", await engagementId(contactA, "ascribe_tag"));

  const auditWalk = await prepare("case7-audit", actionGraph("run_audit"));
  const auditRun = await walk(auditWalk.workflowId, auditWalk.runId, [], [contactA]);
  if (detailOf(auditRun.nodeStatus, "act").includes("run_audit; contacts=")) fail("case7-audit-detail", auditRun.nodeStatus.act);
  if ((await engagementId(contactA, "run_audit")).length !== 0) fail("case7-audit-engagement", await engagementId(contactA, "run_audit"));

  const agentWalk = await prepare("case7-agent", actionGraph("call_agent"));
  const agentRun = await walk(agentWalk.workflowId, agentWalk.runId, [], [contactA]);
  if (detailOf(agentRun.nodeStatus, "act").includes("call_agent; contacts=")) fail("case7-agent-detail", agentRun.nodeStatus.act);
  if ((await engagementId(contactA, "call_agent")).length !== 0) fail("case7-agent-engagement", await engagementId(contactA, "call_agent"));

  await pool.query(`DELETE FROM engagement_records WHERE firm_id=$1`, [firm]);
  const silent = await prepare("case8-inapp", actionGraph("manage_lists", { inAppAffordance: "desk-note" }));
  const silentRun = await walk(silent.workflowId, silent.runId, [], [contactA]);
  if (silentRun.nodeStatus.act?.status !== "success") fail("case8-status", silentRun.nodeStatus.act);
  if ((silentRun.nodeStatus.act?.writes ?? []).length !== 0) fail("case8-writes", silentRun.nodeStatus.act);
  if (!detailOf(silentRun.nodeStatus, "act").includes("silent until wrap")) fail("case8-detail", silentRun.nodeStatus.act);
  const left = await pool.query(`SELECT id FROM engagement_records WHERE firm_id=$1`, [firm]);
  if (left.rows.length !== 0) fail("case8-engagement", left.rows);

  console.log("verify-id-keyed-loads passed");
} finally {
  await pool.query(`DELETE FROM engagement_records WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM fact_writebacks WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM meeting_booked WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM wait_occupancy WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM contact_tag WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM audit_runs WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM active_attempts WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM enrollment WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM action WHERE workflow_id IN (SELECT id FROM workflow WHERE firm_id=$1)`, [firm]);
  await pool.query(`DELETE FROM workflow_run WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM workflow WHERE firm_id=$1`, [firm]);
  await pool.end();
}

if (process.exitCode) process.exit(process.exitCode);
