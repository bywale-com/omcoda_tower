/**
 * PKT-004 against migrated Postgres.
 *
 * An objective_met firing stores one eng- id on the new engagement row and on
 * writes[0], then the flipped enrollment on writes[1]. The listener loads
 * those ids. A return before the flip does not dispatch. The newest
 * objective_met row for the contact is not the handle.
 *
 * ifEng is not a person table, so its detail is branch → true or branch → false.
 * ifEnr reads enrollment, which is already a person table. evalIfPick stays as
 * it is, so a passing enrollment compare reports
 * if pick enrollment.campaign_id then=1 else=0. That is the true edge.
 * Case 6 is the factory-check shape guard: this walk does not store triggerPayload.
 *
 * Ship CI runs this after migrate and seed.
 */
import { randomUUID } from "node:crypto";
import { getPool } from "../server/wire-service/db.ts";
import { advanceEnrollmentCampaign } from "../server/wire-service/campaignHousing.ts";
import { writesFromPayload } from "../server/wire-service/runWrites.ts";
import {
  dispatchEventToWorkflows,
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
const firm = `firm-pkt004-${run}`;
const contact = `contact-pkt004-${run}`;

type Write = { table: string; id: string; contact_id?: string | null };
type StatusMap = Record<string, NodeRunStatus>;

function fail(name: string, detail: unknown): never {
  console.error(`fail ${name}`, detail);
  process.exitCode = 1;
  throw new Error(name);
}

function node(id: string, type: string, data: Record<string, unknown>) {
  return { id, type, data: { configured: true, ...data } };
}

function listenerGraph(cleared: string, next: string) {
  return {
    nodes: [
      node("trig", "trigger", { triggerKind: "event", triggerEvent: "objective_met" }),
      node("ifEng", "if", {
        pickTable: "engagement_records",
        pickField: "payload.campaignId",
        pickOp: "eq",
        pickValue: cleared,
      }),
      node("ifEnr", "if", {
        pickTable: "enrollment",
        pickField: "campaign_id",
        pickOp: "eq",
        pickValue: next,
      }),
    ],
    edges: [
      { id: `${cleared}-trig-ifEng`, source: "trig", target: "ifEng" },
      { id: `${cleared}-ifEng-ifEnr`, source: "ifEng", target: "ifEnr", sourceHandle: "true" },
    ],
  };
}

function absentGraph() {
  return {
    nodes: [
      node("trig", "trigger", { triggerKind: "event", triggerEvent: "objective_met" }),
      node("ifKind", "if", {
        pickTable: "engagement_records",
        pickField: "event_kind",
        pickOp: "eq",
        pickValue: "objective_met",
      }),
    ],
    edges: [{ id: "trig-ifKind", source: "trig", target: "ifKind" }],
  };
}

async function insertWorkflow(id: string, graph: unknown) {
  await pool.query(
    `INSERT INTO workflow (id, firm_id, name, target, graph) VALUES ($1,$2,$3,'contact',$4::jsonb)`,
    [id, firm, id, JSON.stringify(graph)],
  );
  await pool.query(`INSERT INTO workflow_state (workflow_id, status) VALUES ($1,'active')`, [id]);
}

async function insertTrigger(workflowId: string) {
  await pool.query(
    `INSERT INTO workflow_trigger
       (id, workflow_id, firm_id, node_id, type, event_name, enabled)
     VALUES ($1,$2,$3,'trig','event','objective_met',true)`,
    [`wtrig-${workflowId}`, workflowId, firm],
  );
}

async function housing(suffix: string, campaignCount: number) {
  const seq = `seq-pkt004-${run}-${suffix}`;
  await pool.query(
    `INSERT INTO sequence_template (id, sequence_class, variant, label, firm_id)
     VALUES ($1,'optin','v1',$2,$3)`,
    [seq, `PKT-004 ${suffix}`, firm],
  );
  const camps: string[] = [];
  for (let ord = 0; ord < campaignCount; ord += 1) {
    const id = `camp-pkt004-${run}-${suffix}-${ord}`;
    await pool.query(
      `INSERT INTO campaign (id, firm_id, sequence_id, name, ord) VALUES ($1,$2,$3,$4,$5)`,
      [id, firm, seq, `camp ${ord}`, ord],
    );
    camps.push(id);
  }
  const obj = `obj-pkt004-${run}-${suffix}`;
  await pool.query(
    `INSERT INTO campaign_objective (id, campaign_id, kind, name, completion_table)
     VALUES ($1,$2,'form',$3,'fact_writebacks')`,
    [obj, camps[0], `Form ${suffix}`],
  );
  return { seq, camps, obj };
}

async function enroll(id: string, seq: string, campaignId: string | null) {
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, campaign_id)
     VALUES ($1,$2,$3,$4,$4,$5)`,
    [id, firm, contact, seq, campaignId],
  );
}

async function fact(id: string, objectiveId: string) {
  await pool.query(
    `INSERT INTO fact_writebacks (id, firm_id, contact_id, field_key, campaign_objective_id)
     VALUES ($1,$2,$3,'pkt004',$4)`,
    [id, firm, contact, objectiveId],
  );
}

async function runsFor(workflowId: string) {
  const row = await pool.query<{ id: string; node_status: StatusMap }>(
    `SELECT id, node_status FROM workflow_run WHERE workflow_id=$1 ORDER BY started_at ASC, id ASC`,
    [workflowId],
  );
  return row.rows;
}

async function engagementsFor(enrollmentId: string) {
  const row = await pool.query<{ id: string; payload: Record<string, unknown> }>(
    `SELECT id, payload FROM engagement_records
      WHERE firm_id=$1 AND payload->>'enrollmentId'=$2
      ORDER BY created_at ASC, id ASC`,
    [firm, enrollmentId],
  );
  return row.rows;
}

async function newestEngagement(): Promise<string | null> {
  const row = await pool.query<{ id: string }>(
    `SELECT id FROM engagement_records
      WHERE firm_id=$1 AND contact_id=$2 AND event_kind='objective_met'
      ORDER BY created_at DESC, id DESC
      LIMIT 1`,
    [firm, contact],
  );
  return row.rows[0]?.id ?? null;
}

async function campaignOf(id: string): Promise<string | null> {
  const row = await pool.query<{ campaign_id: string | null }>(
    `SELECT campaign_id FROM enrollment WHERE id=$1`,
    [id],
  );
  return row.rows[0]?.campaign_id ?? null;
}

function writesOf(status: StatusMap | undefined): Write[] {
  return status?.trig?.writes ?? [];
}

function assertHandle(name: string, writes: Write[] | undefined, engagementId: string, enrollmentId: string) {
  if (!writes || writes.length !== 2) fail(name, writes);
  if (writes.some((row) => row.table === "contact_records")) fail(`${name}-contact`, writes);
  if (writes[0].table !== "engagement_records" || writes[0].id !== engagementId) fail(`${name}-eng`, writes[0]);
  if (writes[1].table !== "enrollment" || writes[1].id !== enrollmentId) fail(`${name}-enr`, writes[1]);
  if (writes[0].contact_id !== contact || writes[1].contact_id !== contact) fail(`${name}-contact-id`, writes);
  if (!engagementId.startsWith("eng-") || engagementId === decoyId) fail(`${name}-id`, engagementId);
}

let decoyId = "";

try {
  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, name) VALUES ($1,$2,$3,$4)`,
    [contact, firm, `${contact}@example.com`, "PKT-004"],
  );

  const early = await housing("early", 2);
  const earlyEnr = `enr-pkt004-${run}-early`;
  const nullEnr = `enr-pkt004-${run}-null`;
  await enroll(earlyEnr, early.seq, early.camps[0]);
  await enroll(nullEnr, early.seq, null);

  const primary = await housing("primary", 2);
  const primaryEnr = `enr-pkt004-${run}-primary`;
  await enroll(primaryEnr, primary.seq, primary.camps[0]);
  const primaryWf = `wf-pkt004-${run}-primary`;
  await insertWorkflow(primaryWf, listenerGraph(primary.camps[0], primary.camps[1]));
  await insertTrigger(primaryWf);

  const beforeEarly = (await runsFor(primaryWf)).length;
  const missed = await advanceEnrollmentCampaign(pool, earlyEnr);
  if (missed.advanced !== false) fail("case2-advanced", missed);
  if ((await engagementsFor(earlyEnr)).length !== 0) fail("case2-engagement", await engagementsFor(earlyEnr));
  if ((await runsFor(primaryWf)).length !== beforeEarly) fail("case2-run", await runsFor(primaryWf));

  const missedNull = await advanceEnrollmentCampaign(pool, nullEnr);
  if (missedNull.advanced !== false || missedNull.campaignId !== null) fail("case2-null", missedNull);
  if ((await engagementsFor(nullEnr)).length !== 0) fail("case2-null-engagement", await engagementsFor(nullEnr));
  if ((await runsFor(primaryWf)).length !== beforeEarly) fail("case2-null-run", await runsFor(primaryWf));

  decoyId = `eng-decoy-${run}`;
  await pool.query(
    `INSERT INTO engagement_records (id, firm_id, contact_id, event_kind, payload, created_at)
     VALUES ($1,$2,$3,'objective_met',$4::jsonb, now() + interval '1 day')`,
    [
      decoyId,
      firm,
      contact,
      JSON.stringify({
        enrollmentId: `enr-decoy-${run}`,
        campaignId: `camp-decoy-${run}`,
        nextCampaignId: `camp-decoy-next-${run}`,
      }),
    ],
  );

  const primaryFact = `fwb-pkt004-${run}-primary`;
  await fact(primaryFact, primary.obj);
  const advanced = await advanceEnrollmentCampaign(pool, primaryEnr, {
    completionTable: "fact_writebacks",
    completionId: primaryFact,
  });
  if (!advanced.advanced || advanced.campaignId !== primary.camps[1]) fail("case1-advance", advanced);

  const fired = await engagementsFor(primaryEnr);
  if (fired.length !== 1) fail("case1-row-count", fired);
  const engagementId = fired[0].id;
  const payload = fired[0].payload;
  if (payload.campaignId !== primary.camps[0] || payload.nextCampaignId !== primary.camps[1]) {
    fail("case1-payload", payload);
  }
  if (payload.enrollmentId !== primaryEnr || payload.campaignObjectiveId !== primary.obj) fail("case1-scalars", payload);
  if (payload.completionTable !== "fact_writebacks" || payload.completionId !== primaryFact) fail("case1-completion", payload);

  const primaryRuns = await runsFor(primaryWf);
  if (primaryRuns.length !== beforeEarly + 1) fail("case1-run-count", primaryRuns.map((row) => row.id));
  const status = primaryRuns[primaryRuns.length - 1].node_status;
  const handle = writesOf(status);
  assertHandle("case1", handle, engagementId, primaryEnr);
  if (status.ifEng?.detail !== "branch → true") fail("case1-ifEng", status.ifEng);
  if (status.ifEnr?.detail !== "if pick enrollment.campaign_id then=1 else=0") fail("case1-ifEnr", status.ifEnr);
  if ((await campaignOf(primaryEnr)) !== primary.camps[1]) fail("case1-cursor", await campaignOf(primaryEnr));
  if ((await newestEngagement()) !== decoyId) fail("case4-newest", await newestEngagement());

  const scalars = {
    campaign_objective_id: primary.obj,
    campaign_id: primary.camps[0],
    sequence_id: primary.seq,
    enrollment_id: primaryEnr,
    contact_id: contact,
    kind: payload.kind,
    completion_table: "fact_writebacks",
    completion_id: primaryFact,
  };
  const fromWrites = writesFromPayload({ ...scalars, writes: handle });
  if (fromWrites.length !== 2) fail("case3-len", fromWrites);
  if (fromWrites[0].table !== "engagement_records" || fromWrites[0].id !== engagementId) fail("case3-eng", fromWrites);
  if (fromWrites[1].table !== "enrollment" || fromWrites[1].id !== primaryEnr) fail("case3-enr", fromWrites);
  if (fromWrites.some((row) => row.table === "contact_records")) fail("case3-contact", fromWrites);
  const fromScalars = writesFromPayload(scalars);
  if (fromScalars.some((row) => row.table === "enrollment" || row.id === primaryEnr)) fail("case3-reader", fromScalars);

  const pairA = await housing("pair-a", 2);
  const pairB = await housing("pair-b", 2);
  const enrA = `enr-pkt004-${run}-a`;
  const enrB = `enr-pkt004-${run}-b`;
  await enroll(enrA, pairA.seq, pairA.camps[0]);
  await enroll(enrB, pairB.seq, pairB.camps[0]);
  const wfA = `wf-pkt004-${run}-a`;
  const wfB = `wf-pkt004-${run}-b`;
  await insertWorkflow(wfA, listenerGraph(pairA.camps[0], pairA.camps[1]));
  await insertWorkflow(wfB, listenerGraph(pairB.camps[0], pairB.camps[1]));
  await insertTrigger(wfA);
  await insertTrigger(wfB);
  await fact(`fwb-pkt004-${run}-a`, pairA.obj);
  await fact(`fwb-pkt004-${run}-b`, pairB.obj);
  const advA = await advanceEnrollmentCampaign(pool, enrA);
  const advB = await advanceEnrollmentCampaign(pool, enrB);
  if (!advA.advanced || !advB.advanced) fail("case5-advance", { advA, advB });
  const rowsA = await engagementsFor(enrA);
  const rowsB = await engagementsFor(enrB);
  if (rowsA.length !== 1 || rowsB.length !== 1 || rowsA[0].id === rowsB[0].id) fail("case5-ids", { rowsA, rowsB });
  const runA = (await runsFor(wfA)).find((row) => writesOf(row.node_status)[1]?.id === enrA);
  const runB = (await runsFor(wfB)).find((row) => writesOf(row.node_status)[1]?.id === enrB);
  if (!runA || !runB) fail("case5-runs", { wfA: await runsFor(wfA), wfB: await runsFor(wfB) });
  assertHandle("case5-a", writesOf(runA.node_status), rowsA[0].id, enrA);
  assertHandle("case5-b", writesOf(runB.node_status), rowsB[0].id, enrB);
  if (rowsA[0].payload.enrollmentId !== enrA || rowsB[0].payload.enrollmentId !== enrB) fail("case5-owner", { rowsA, rowsB });
  if (runA.node_status.ifEng?.detail !== "branch → true") fail("case5-ifA", runA.node_status.ifEng);
  if (runB.node_status.ifEng?.detail !== "branch → true") fail("case5-ifB", runB.node_status.ifEng);
  if ((await newestEngagement()) !== decoyId) fail("case5-newest", await newestEngagement());

  const absentWf = `wf-pkt004-${run}-absent`;
  const directWf = `wf-pkt004-${run}-direct`;
  await insertWorkflow(absentWf, absentGraph());
  await insertTrigger(absentWf);
  await insertWorkflow(directWf, absentGraph());
  const absentPayload = {
    writes: [{ table: "engagement_records", id: "eng-absent", contact_id: contact }],
  };
  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: firm,
    eventName: "objective_met",
    payload: absentPayload,
    contactIds: [contact],
  });
  const absentHit = dispatched.find((row) => row.workflowId === absentWf);
  if (!absentHit) fail("case7-dispatch", dispatched);
  const absentStatus = (await runsFor(absentWf)).find((row) => row.id === absentHit.runId)?.node_status;
  if (absentStatus?.ifKind?.detail !== "branch → false") fail("case7-if", absentStatus?.ifKind);
  const directRun = `run-pkt004-${run}-direct`;
  await pool.query(
    `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label) VALUES ($1,$2,$3,'running',$4)`,
    [directRun, directWf, firm, "event:objective_met"],
  );
  const walked = await walkValidatedWorkflow(pool, {
    workflowId: directWf,
    firmId: firm,
    runId: directRun,
    triggerLabel: "event:objective_met",
    triggerPayload: { ...absentPayload, eventName: "objective_met" },
    contactIds: [contact],
  });
  if (walked.nodeStatus.ifKind?.detail !== "branch → false") fail("case7-walk", walked.nodeStatus.ifKind);

  const last = await housing("last", 1);
  const lastEnr = `enr-pkt004-${run}-last`;
  await enroll(lastEnr, last.seq, last.camps[0]);
  await fact(`fwb-pkt004-${run}-last`, last.obj);
  const advLast = await advanceEnrollmentCampaign(pool, lastEnr);
  if (!advLast.advanced || advLast.campaignId !== null) fail("case8-advance", advLast);
  if ((await campaignOf(lastEnr)) !== null) fail("case8-cursor", await campaignOf(lastEnr));
  const lastRows = await engagementsFor(lastEnr);
  if (lastRows.length !== 1 || lastRows[0].payload.nextCampaignId !== null) fail("case8-payload", lastRows);
  const lastRuns = await pool.query<{ node_status: StatusMap }>(
    `SELECT node_status FROM workflow_run WHERE firm_id=$1`,
    [firm],
  );
  const lastHandle = lastRuns.rows
    .map((row) => writesOf(row.node_status))
    .find((writes) => writes[1]?.id === lastEnr && writes[0]?.id === lastRows[0].id);
  if (!lastHandle) fail("case8-writes", lastRows[0].id);
  assertHandle("case8", lastHandle, lastRows[0].id, lastEnr);

  console.log("verify-firing-handle passed");
} finally {
  await pool.query(`DELETE FROM engagement_records WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM fact_writebacks WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM active_attempts WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM enrollment WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM workflow WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM campaign WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM sequence_template WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM contact_records WHERE firm_id=$1`, [firm]);
  await pool.end();
}
