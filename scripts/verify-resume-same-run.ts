/**
 * PKT-003 against migrated Postgres.
 *
 * A resumed wait rebuilds chainWrites and previousWrites from this run's
 * workflow_run.node_status before it walks the waited node's outgoing edges.
 * Occupancy rows and counts.waitWrites are not the handle.
 *
 * Ship CI runs this after migrate and seed.
 */
import { randomUUID } from "node:crypto";
import { getPool } from "../server/wire-service/db.ts";
import {
  resumeDueWaitingRuns,
  resumeWaitRun,
  walkValidatedWorkflow,
  type NodeRunStatus,
} from "../server/wire-service/workflowWalk.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const pool = getPool();
const run = randomUUID().slice(0, 8);
const firm = `firm-pkt003-${run}`;
const contactA = `contact-a-${run}`;
const contactB = `contact-b-${run}`;
const contactC = `contact-c-${run}`;

type Write = { table: string; id: string; contact_id?: string | null };

function fail(name: string, detail: unknown): never {
  console.error(`fail ${name}`, detail);
  process.exitCode = 1;
  throw new Error(name);
}

function key(row: Write): string {
  return `${row.table}|${row.id}|${row.contact_id ?? ""}`;
}

function sameWrites(actual: Write[] | undefined, expected: Write[]): boolean {
  const left = (actual ?? []).map(key).sort();
  const right = expected.map(key).sort();
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function node(id: string, type: string, data: Record<string, unknown>) {
  return { id, type, data: { configured: true, ...data } };
}

function edge(source: string, target: string) {
  return { id: `${source}-${target}`, source, target };
}

function approvalGraph() {
  return {
    nodes: [
      node("t", "trigger", {}),
      node("n", "get", {
        getModule: "contacts",
        getSelect: "one",
        getClass1: firm,
        getClass2: [contactA],
        getClass2All: false,
      }),
      node("e", "action", { inAppAffordance: "note", actionType: "call_agent" }),
      node("c", "constant", { constantSummary: `pkt003-${run}` }),
      node("w", "wait", { shape: "approval", title: "Approve resume", approver: "consultant" }),
      node("tag", "action", { actionType: "ascribe_tag", tag: `pkt003-${run}` }),
      node("chipN", "get", { getModule: "contacts", mappedSlots: { row: [{ fromNodeId: "n", table: "contact_records" }] } }),
      node("chipE", "get", { getModule: "contacts", mappedSlots: { row: [{ fromNodeId: "e" }] } }),
      node("chipC", "get", { getModule: "contacts", mappedSlots: { row: [{ fromNodeId: "c" }] } }),
      node("chipW", "get", { getModule: "contacts", mappedSlots: { row: [{ fromNodeId: "w", table: "wait_occupancy" }] } }),
    ],
    edges: [
      edge("t", "n"),
      edge("n", "e"),
      edge("e", "c"),
      edge("c", "w"),
      edge("w", "tag"),
      edge("w", "chipN"),
      edge("w", "chipE"),
      edge("w", "chipC"),
      edge("w", "chipW"),
    ],
  };
}

function durationGraph() {
  return {
    nodes: [
      node("t", "trigger", {}),
      node("n", "get", {
        getModule: "contacts",
        getSelect: "one",
        getClass1: firm,
        getClass2: [contactA],
        getClass2All: false,
      }),
      node("w", "wait", { shape: "duration", durationAmount: 5, durationUnit: "minutes" }),
      node("chipN", "get", { getModule: "contacts", mappedSlots: { row: [{ fromNodeId: "n", table: "contact_records" }] } }),
    ],
    edges: [edge("t", "n"), edge("n", "w"), edge("w", "chipN")],
  };
}

async function insertWorkflow(id: string, graph: unknown) {
  await pool.query(
    `INSERT INTO workflow (id, firm_id, name, target, graph) VALUES ($1,$2,$3,'contact',$4::jsonb)`,
    [id, firm, id, JSON.stringify(graph)],
  );
}

async function insertRun(id: string, workflowId: string) {
  await pool.query(
    `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label) VALUES ($1,$2,$3,'running',$4)`,
    [id, workflowId, firm, "pkt003"],
  );
}

async function statusOf(runId: string): Promise<Record<string, NodeRunStatus>> {
  const row = await pool.query<{ node_status: Record<string, NodeRunStatus> }>(
    `SELECT node_status FROM workflow_run WHERE id=$1`,
    [runId],
  );
  return row.rows[0]?.node_status ?? {};
}

async function park(workflowId: string, runId: string) {
  await insertRun(runId, workflowId);
  const walked = await walkValidatedWorkflow(pool, {
    workflowId,
    firmId: firm,
    runId,
    triggerLabel: "pkt003",
    contactIds: [contactA],
  });
  if (!walked.parked) fail("park", walked);
  return statusOf(runId);
}

async function tagsFor(contactId: string): Promise<number> {
  const row = await pool.query<{ n: string }>(
    `SELECT count(*)::text AS n FROM contact_tag WHERE firm_id=$1 AND contact_id=$2 AND tag=$3`,
    [firm, contactId, `pkt003-${run}`],
  );
  return Number(row.rows[0]?.n ?? 0);
}

try {
  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, name) VALUES ($1,$2,$3,$4), ($5,$2,$6,$7), ($8,$2,$9,$10)`,
    [contactA, firm, `${contactA}@example.com`, "A", contactB, `${contactB}@example.com`, "B", contactC, `${contactC}@example.com`, "C"],
  );
  const approval = `wf-pkt003-${run}`;
  const duration = `wf-pkt003-dur-${run}`;
  await insertWorkflow(approval, approvalGraph());
  await insertWorkflow(duration, durationGraph());

  const otherRun = `run-other-${run}`;
  await insertRun(otherRun, approval);
  await pool.query(
    `UPDATE workflow_run SET node_status=$2::jsonb, status='success' WHERE id=$1`,
    [otherRun, JSON.stringify({ n: { status: "success", at: new Date().toISOString(), writes: [{ table: "contact_records", id: contactC, contact_id: contactC }] } })],
  );
  const otherBefore = JSON.stringify(await statusOf(otherRun));

  const run1 = `run1-${run}`;
  const parked = await park(approval, run1);
  const pointerP = (parked.n?.writes ?? []).filter((row) => row.table === "contact_records");
  const pointerW = parked.w?.writes ?? [];
  if (!pointerP.length || !pointerW.length) fail("park-writes", parked);
  if (pointerP.some((row) => pointerW.some((wait) => wait.id === row.id))) fail("p-equals-w", { pointerP, pointerW });
  if (!Array.isArray(parked.e?.writes) || parked.e.writes.length !== 0) fail("action-empty", parked.e);
  if (parked.c?.writes) fail("constant-writes", parked.c);

  const decoy = [{ table: "contact_records", id: contactB, contact_id: contactB }];
  await pool.query(
    `UPDATE workflow_run
     SET resume_at = now() - interval '1 minute',
         counts = jsonb_set(counts, '{waitWrites}', $2::jsonb)
     WHERE id=$1`,
    [run1, JSON.stringify(decoy)],
  );
  const resumed = await resumeDueWaitingRuns(pool);
  if (resumed < 1) fail("due-tick", resumed);
  const after1 = await statusOf(run1);
  if (!sameWrites(after1.chipN?.writes, pointerP)) fail("case1-chipN", after1.chipN?.writes);
  if (!sameWrites(after1.w?.writes, pointerW)) fail("case1-wait", after1.w?.writes);
  if (!sameWrites(after1.chipW?.writes, pointerW)) fail("case1-chipW", after1.chipW?.writes);
  if (!sameWrites(after1.chipE?.writes, [])) fail("case1-chipE", after1.chipE?.writes);
  if (!sameWrites(after1.chipC?.writes, pointerW)) fail("case1-chipC", { actual: after1.chipC?.writes, expected: pointerW });
  if ((await tagsFor(contactA)) !== 1) fail("case1-tag-a", await tagsFor(contactA));
  if ((await tagsFor(contactB)) !== 0) fail("case1-tag-b", await tagsFor(contactB));
  if (JSON.stringify(await statusOf(otherRun)) !== otherBefore) fail("case5-other-run", await statusOf(otherRun));

  const run2 = `run2-${run}`;
  const parked2 = await park(approval, run2);
  const w2 = parked2.w?.writes ?? [];
  const p2 = (parked2.n?.writes ?? []).filter((row) => row.table === "contact_records");
  await pool.query(`DELETE FROM wait_occupancy WHERE workflow_run_id=$1`, [run2]);
  await pool.query(
    `UPDATE workflow_run
     SET resume_at = now() - interval '1 minute',
         counts = jsonb_set(jsonb_set(counts, '{waitWrites}', $2::jsonb), '{waitContactIds}', $3::jsonb)
     WHERE id=$1`,
    [run2, JSON.stringify(decoy), JSON.stringify([contactA])],
  );
  await resumeDueWaitingRuns(pool);
  const after2 = await statusOf(run2);
  if (!sameWrites(after2.w?.writes, w2)) fail("case2-wait", { actual: after2.w?.writes, expected: w2 });
  if (!sameWrites(after2.chipN?.writes, p2)) fail("case2-chipN", after2.chipN?.writes);
  if ((await tagsFor(contactA)) < 2) fail("case2-tag", await tagsFor(contactA));

  const run3 = `run3-${run}`;
  const parked3 = await park(approval, run3);
  const w3 = parked3.w?.writes ?? [];
  const p3 = (parked3.n?.writes ?? []).filter((row) => row.table === "contact_records");
  await resumeWaitRun(pool, {
    runId: run3,
    workflowId: approval,
    firmId: firm,
    waitNodeId: "w",
    contactIds: [contactA],
    previousWrites: decoy,
    triggerLabel: "direct",
  });
  const after3 = await statusOf(run3);
  if (!sameWrites(after3.w?.writes, w3)) fail("case3-wait", after3.w?.writes);
  if (!sameWrites(after3.chipN?.writes, p3)) fail("case3-chipN", after3.chipN?.writes);
  if (!sameWrites(after3.chipE?.writes, [])) fail("case3-chipE", after3.chipE?.writes);
  if (!sameWrites(after3.chipC?.writes, w3)) fail("case3-chipC", after3.chipC?.writes);

  const run4 = `run4-${run}`;
  await insertRun(run4, duration);
  const walked4 = await walkValidatedWorkflow(pool, {
    workflowId: duration,
    firmId: firm,
    runId: run4,
    triggerLabel: "pkt003-duration",
    contactIds: [contactA],
  });
  if (!walked4.parked) fail("duration-park", walked4);
  const before4 = await statusOf(run4);
  const w4 = before4.w?.writes ?? [];
  await pool.query(
    `UPDATE workflow_run
     SET resume_at = now() - interval '1 minute',
         counts = jsonb_set(counts, '{waitWrites}', $2::jsonb)
     WHERE id=$1`,
    [run4, JSON.stringify(decoy)],
  );
  await resumeDueWaitingRuns(pool);
  const after4 = await statusOf(run4);
  if (!sameWrites(after4.w?.writes, w4)) fail("case4-wait", { actual: after4.w?.writes, expected: w4, decoy });
  if (sameWrites(after4.w?.writes, decoy)) fail("case4-decoy", after4.w?.writes);

  console.log("verify-resume-same-run passed");
} finally {
  await pool.query(`DELETE FROM contact_tag WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM workflow WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM contact_records WHERE firm_id=$1`, [firm]);
  await pool.end();
}
