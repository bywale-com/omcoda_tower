/**
 * PKT-010 against migrated Postgres.
 *
 * A campaign_failure firing stores the inserted cfail- id on payload.writes
 * and the enrollment campaign_id on the payload. The id load is WHERE id=$1.
 * A queued attempt and a forward send do not dispatch. A repeat criteria and
 * an inbound override return before the insert.
 *
 * sequence_template.sequence_class is optin. Migration 010 renamed
 * optin_launch to that class, and this packet writes no migration.
 *
 * Ship CI runs this after migrate and seed, beside verify-click-attribution.
 */
import { randomUUID } from "node:crypto";
import { escalateAttemptWindow, type ActiveAttemptRow, type CriteriaRow } from "../server/wire-service/cascade.ts";
import { getPool } from "../server/wire-service/db.ts";
import { writesFromPayload } from "../server/wire-service/runWrites.ts";
import { materializeTriggersFromGraph, walkValidatedWorkflow } from "../server/wire-service/workflowWalk.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const pool = getPool();
const token = randomUUID().slice(0, 8);
const firm = `firm-pkt010-${token}`;

type Write = { table?: string; id?: string; contact_id?: string | null; firm_id?: string };
type RunRow = {
  id: string;
  workflow_id: string;
  trigger_label: string | null;
  node_status: Record<string, { writes?: Write[]; detail?: string }>;
  counts: { contacts?: number };
};

const bannedTables = new Set([
  "active_attempts",
  "enrollment",
  "engagement_records",
  "workflow_run",
  "contact_records",
  "send_live",
  "send_dry_run",
]);

function fail(name: string, detail?: unknown): never {
  console.error(`fail ${name}`, detail ?? "");
  throw new Error(name);
}

function criteria(id: string, setValue: string): CriteriaRow {
  return {
    id,
    label: id,
    enabled: true,
    when_clause: null,
    condition_clause: null,
    set_value: setValue,
    threshold: 0,
    threshold_unit: "seconds",
    channel_token: null,
  };
}

async function listener(name: string, localRef: string | null): Promise<string> {
  const id = `wf-pkt010-${token}-${name}`;
  const data: Record<string, unknown> = {
    configured: true,
    triggerKind: "event",
    triggerEvent: "campaign_failure",
    grain: localRef === undefined ? "global" : "local",
  };
  if (localRef) data.localRef = localRef;
  if (name !== "global") data.grain = "local";
  if (name === "global") data.grain = "global";
  const graph = {
    nodes: [
      { id: "trig", type: "trigger", data },
      { id: "stop", type: "exit", data: { configured: true } },
    ],
    edges: [{ id: `${name}-e`, source: "trig", target: "stop" }],
  };
  await pool.query(
    `INSERT INTO workflow (id, firm_id, name, target, graph) VALUES ($1,$2,$3,'contact',$4::jsonb)`,
    [id, firm, id, JSON.stringify(graph)],
  );
  await pool.query(`INSERT INTO workflow_state (workflow_id, status) VALUES ($1,'active')`, [id]);
  await materializeTriggersFromGraph(pool, id, firm, graph);
  return id;
}

async function eventRuns(): Promise<RunRow[]> {
  const { rows } = await pool.query<RunRow>(
    `SELECT id, workflow_id, trigger_label, node_status, counts
     FROM workflow_run
     WHERE firm_id=$1 AND trigger_label='event:campaign_failure'
     ORDER BY started_at ASC, id ASC`,
    [firm],
  );
  return rows;
}

function added(before: RunRow[], after: RunRow[], workflowId?: string): RunRow[] {
  const seen = new Set(before.map((row) => row.id));
  return after.filter((row) => !seen.has(row.id) && (workflowId == null || row.workflow_id === workflowId));
}

function assertHandle(run: RunRow, rowId: string, contactId: string) {
  const writes = run.node_status?.trig?.writes;
  if (!Array.isArray(writes) || writes.length !== 1) fail("writes-length", { run: run.id, writes });
  const pointer = writes[0];
  if (pointer.table !== "campaign_failure") fail("writes-table", pointer);
  if (pointer.id !== rowId) fail("writes-id", pointer);
  if (pointer.contact_id !== contactId) fail("writes-contact", pointer);
  if ("firm_id" in pointer) fail("writes-firm", pointer);
  if (pointer.table && bannedTables.has(pointer.table)) fail("writes-banned", pointer);
  if (run.counts?.contacts !== 1) fail("counts", run.counts);
}

async function person(id: string) {
  await pool.query(`INSERT INTO contact_records (id, firm_id, name) VALUES ($1,$2,$3)`, [id, firm, id]);
}

async function attemptRow(id: string): Promise<ActiveAttemptRow> {
  const { rows } = await pool.query<ActiveAttemptRow>(
    `SELECT id, firm_id, contact_id, enrollment_id, owner_channel, status,
            state, window_started_at, fired_criteria, created_at
     FROM active_attempts WHERE id=$1`,
    [id],
  );
  const row = rows[0];
  if (!row) fail("attempt-missing", id);
  const started = row.window_started_at as unknown;
  return {
    ...row,
    window_started_at: started instanceof Date ? started.toISOString() : String(started),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    state: typeof row.state === "string" ? JSON.parse(row.state) : row.state,
    fired_criteria:
      typeof row.fired_criteria === "string" ? JSON.parse(row.fired_criteria) : (row.fired_criteria ?? {}),
  };
}

async function openAttempt(input: {
  id: string;
  contactId: string;
  enrollmentId: string | null;
  now: Date;
  fired?: Record<string, string>;
}) {
  await pool.query(
    `INSERT INTO active_attempts
       (id, firm_id, contact_id, enrollment_id, owner_channel, status, state, window_started_at, fired_criteria)
     VALUES ($1,$2,$3,$4,'text','open',$5::jsonb,$6::timestamptz,$7::jsonb)`,
    [
      input.id,
      firm,
      input.contactId,
      input.enrollmentId,
      JSON.stringify({ delivered: false, attempt_n: 1 }),
      input.now.toISOString(),
      JSON.stringify(input.fired ?? {}),
    ],
  );
  return attemptRow(input.id);
}

async function cleanup() {
  const tables = [
    "campaign_failure",
    "engagement_records",
    "active_attempts",
    "enrollment",
    "campaign",
    "workflow_trigger",
    "workflow_state",
    "workflow_run",
    "workflow",
    "contact_records",
  ];
  for (const table of tables) {
    if (table === "workflow_state" || table === "workflow_trigger") {
      await pool.query(
        `DELETE FROM ${table} WHERE workflow_id IN (SELECT id FROM workflow WHERE firm_id=$1)`,
        [firm],
      );
      continue;
    }
    await pool.query(`DELETE FROM ${table} WHERE firm_id=$1`, [firm]);
  }
  await pool.query(`DELETE FROM sequence_template WHERE id LIKE $1`, [`seq-pkt010-${token}%`]);
  await pool.query(`DELETE FROM ct_firms WHERE id=$1`, [firm]);
}

async function loadWalk(input: {
  workflowId: string;
  contactId: string;
  pointerId: string;
  pickField: string;
  pickValue: string;
}): Promise<string> {
  const graph = {
    nodes: [
      {
        id: "trig",
        type: "trigger",
        data: { configured: true, triggerKind: "event", triggerEvent: "campaign_failure" },
      },
      {
        id: "gate",
        type: "if",
        data: {
          configured: true,
          pickTable: "campaign_failure",
          pickOp: "eq",
          pickField: input.pickField,
          pickValue: input.pickValue,
        },
      },
      { id: "stop", type: "exit", data: { configured: true } },
    ],
    edges: [
      { id: "e1", source: "trig", target: "gate" },
      { id: "e2", source: "gate", target: "stop" },
    ],
  };
  await pool.query(`UPDATE workflow SET graph=$2::jsonb WHERE id=$1`, [input.workflowId, JSON.stringify(graph)]);
  const runId = `run-pkt010-${token}-${randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label)
     VALUES ($1,$2,$3,'running','load')`,
    [runId, input.workflowId, firm],
  );
  await walkValidatedWorkflow(pool, {
    workflowId: input.workflowId,
    firmId: firm,
    runId,
    triggerLabel: "load",
    triggerPayload: {
      writes: [{ table: "campaign_failure", id: input.pointerId, contact_id: input.contactId }],
    },
    contactIds: [input.contactId],
  });
  const { rows } = await pool.query<RunRow>(
    `SELECT id, workflow_id, trigger_label, node_status, counts FROM workflow_run WHERE id=$1`,
    [runId],
  );
  const detail = rows[0]?.node_status?.gate?.detail ?? "";
  if (detail.startsWith("if pick")) fail("person-split", detail);
  return detail;
}

async function main() {
  const now = new Date();
  const seq = `seq-pkt010-${token}`;
  const seqDecoy = `seq-pkt010-${token}-decoy`;
  const camp = `camp-pkt010-${token}`;
  const contact = `contact-pkt010-${token}`;
  const enr = `enr-pkt010-${token}`;
  const attemptId = `aa-pkt010-${token}`;
  const criteriaId = `ac-pkt010-${token}`;

  await pool.query(`INSERT INTO ct_firms (id, name) VALUES ($1,$2)`, [firm, "PKT-010"]);
  await pool.query(
    `INSERT INTO sequence_template (id, sequence_class, label) VALUES ($1,'optin',$2), ($3,'optin',$4)`,
    [seq, "PKT-010", seqDecoy, "PKT-010 decoy"],
  );
  await pool.query(
    `INSERT INTO campaign (id, firm_id, sequence_id, name, ord, attempt_count)
     VALUES ($1,$2,$3,$4,0,1)`,
    [camp, firm, seq, "PKT-010"],
  );
  await person(contact);
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, campaign_id)
     VALUES ($1,$2,$3,$4,$4,$5)`,
    [enr, firm, contact, seq, camp],
  );

  const globalId = await listener("global", null);
  const unsetId = await listener("unset", null);
  const matchId = await listener("match", camp);
  const otherId = await listener("other", "camp-other");

  const before = await eventRuns();
  const attempt = await openAttempt({ id: attemptId, contactId: contact, enrollmentId: enr, now });
  const fired = await escalateAttemptWindow(pool, attempt, criteria(criteriaId, "fail"), ["text", "email"], now, 0);
  if (!fired) fail("case1-null");

  const failures = await pool.query<{
    id: string;
    contact_id: string;
    campaign_id: string | null;
    sequence_id: string | null;
    payload: { attemptId?: string; criteriaId?: string; setValue?: string };
  }>(`SELECT id, contact_id, campaign_id, sequence_id, payload FROM campaign_failure WHERE firm_id=$1`, [firm]);
  if (failures.rows.length !== 1) fail("case1-row-count", failures.rows.length);
  const row = failures.rows[0];
  if (!row.id.startsWith("cfail-")) fail("case1-id", row.id);
  if (row.contact_id !== contact) fail("case1-contact", row);
  if (row.campaign_id !== camp) fail("case1-campaign", row);
  if (row.sequence_id !== seq) fail("case1-sequence", row);
  if (row.payload.attemptId !== attemptId || row.payload.criteriaId !== criteriaId || row.payload.setValue !== "fail") {
    fail("case1-payload", row.payload);
  }
  const spent = await attemptRow(attemptId);
  if (spent.status !== "exhausted") fail("case1-status", spent.status);
  if (!spent.fired_criteria?.[criteriaId]) fail("case1-fired", spent.fired_criteria);
  const enrollment = await pool.query<{ pursuit_state: string; campaign_id: string | null }>(
    `SELECT pursuit_state, campaign_id FROM enrollment WHERE id=$1`,
    [enr],
  );
  if (enrollment.rows[0]?.pursuit_state !== "exhausted") fail("case1-pursuit", enrollment.rows[0]);
  if (enrollment.rows[0]?.campaign_id !== camp) fail("case1-cursor", enrollment.rows[0]);
  const windowRun = await pool.query(
    `SELECT id FROM workflow_run WHERE firm_id=$1 AND trigger_label=$2`,
    [firm, `window:${criteriaId}`],
  );
  if (windowRun.rowCount !== 1) fail("case1-window", windowRun.rowCount);
  const windowEng = await pool.query(
    `SELECT id FROM engagement_records WHERE firm_id=$1 AND event_kind='window_fired' AND payload->>'criteriaId'=$2`,
    [firm, criteriaId],
  );
  if (windowEng.rowCount !== 1) fail("case1-engagement", windowEng.rowCount);

  const after = await eventRuns();
  const globalRuns = added(before, after, globalId);
  const unsetRuns = added(before, after, unsetId);
  const matchRuns = added(before, after, matchId);
  const otherRuns = added(before, after, otherId);
  if (globalRuns.length !== 1 || unsetRuns.length !== 1 || matchRuns.length !== 1) {
    fail("case1-listeners", {
      global: globalRuns.length,
      unset: unsetRuns.length,
      match: matchRuns.length,
    });
  }
  if (otherRuns.length !== 0) fail("case1-other", otherRuns.length);
  for (const run of [...globalRuns, ...unsetRuns, ...matchRuns]) assertHandle(run, row.id, contact);

  const again = await escalateAttemptWindow(pool, spent, criteria(criteriaId, "fail"), ["text", "email"], now, 0);
  if (again !== null) fail("case2-return", again);
  const still = await pool.query(`SELECT id FROM campaign_failure WHERE firm_id=$1`, [firm]);
  if (still.rowCount !== 1) fail("case2-rows", still.rowCount);
  const afterRepeat = await eventRuns();
  if (added(after, afterRepeat).length !== 0) fail("case2-runs", added(after, afterRepeat).length);

  const bareContact = `contact-pkt010-${token}-bare`;
  const bareAttempt = `aa-pkt010-${token}-bare`;
  await person(bareContact);
  const bare = await openAttempt({ id: bareAttempt, contactId: bareContact, enrollmentId: null, now });
  const enrollmentsBefore = await pool.query(`SELECT id, pursuit_state, campaign_id FROM enrollment WHERE firm_id=$1`, [firm]);
  const bareFire = await escalateAttemptWindow(pool, bare, criteria(`${criteriaId}-bare`, "fail"), ["text", "email"], now, 0);
  if (!bareFire) fail("case3-null");
  const bareRows = await pool.query<{
    id: string;
    campaign_id: string | null;
    sequence_id: string | null;
    payload: { attemptId?: string };
  }>(
    `SELECT id, campaign_id, sequence_id, payload FROM campaign_failure WHERE firm_id=$1 AND contact_id=$2`,
    [firm, bareContact],
  );
  if (bareRows.rows.length !== 1) fail("case3-row", bareRows.rows);
  if (bareRows.rows[0].campaign_id !== null || bareRows.rows[0].sequence_id !== null) fail("case3-null-columns", bareRows.rows[0]);
  if (bareRows.rows[0].payload.attemptId !== bareAttempt) fail("case3-attempt", bareRows.rows[0].payload);
  const bareSpent = await attemptRow(bareAttempt);
  if (bareSpent.status !== "exhausted") fail("case3-status", bareSpent.status);
  const enrollmentsAfter = await pool.query(`SELECT id, pursuit_state, campaign_id FROM enrollment WHERE firm_id=$1`, [firm]);
  if (JSON.stringify(enrollmentsAfter.rows) !== JSON.stringify(enrollmentsBefore.rows)) {
    fail("case3-enrollment", { before: enrollmentsBefore.rows, after: enrollmentsAfter.rows });
  }
  const afterBare = await eventRuns();
  if (added(afterRepeat, afterBare, matchId).length !== 0) fail("case3-match");
  const bareGlobal = added(afterRepeat, afterBare, globalId);
  const bareUnset = added(afterRepeat, afterBare, unsetId);
  if (bareGlobal.length !== 1 || bareUnset.length !== 1) fail("case3-listeners", { bareGlobal: bareGlobal.length, bareUnset: bareUnset.length });
  assertHandle(bareGlobal[0], bareRows.rows[0].id, bareContact);
  assertHandle(bareUnset[0], bareRows.rows[0].id, bareContact);

  await pool.query(
    `UPDATE campaign SET attempt_count=3, wait_after_last_failed_seconds=86400 WHERE id=$1`,
    [camp],
  );
  const queuedContact = `contact-pkt010-${token}-queued`;
  const queuedEnr = `enr-pkt010-${token}-queued`;
  const queuedAttempt = `aa-pkt010-${token}-queued`;
  await person(queuedContact);
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, campaign_id)
     VALUES ($1,$2,$3,$4,$4,$5)`,
    [queuedEnr, firm, queuedContact, seq, camp],
  );
  const queued = await openAttempt({ id: queuedAttempt, contactId: queuedContact, enrollmentId: queuedEnr, now });
  const beforeQueue = await eventRuns();
  const queuedFire = await escalateAttemptWindow(
    pool,
    queued,
    criteria(`${criteriaId}-queued`, "fail"),
    ["text", "email"],
    now,
    0,
  );
  if (queuedFire?.toChannel !== "text") fail("case4-channel", queuedFire);
  const queuedFail = await pool.query(
    `SELECT id FROM campaign_failure WHERE payload->>'attemptId'=$1`,
    [queuedAttempt],
  );
  if ((queuedFail.rowCount ?? 0) !== 0) fail("case4-row", queuedFail.rowCount);
  const queuedSpent = await attemptRow(queuedAttempt);
  if (queuedSpent.status !== "open") fail("case4-status", queuedSpent.status);
  if (added(beforeQueue, await eventRuns()).length !== 0) fail("case4-runs");

  const forwardContact = `contact-pkt010-${token}-forward`;
  const forwardEnr = `enr-pkt010-${token}-forward`;
  const forwardAttempt = `aa-pkt010-${token}-forward`;
  await person(forwardContact);
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, campaign_id)
     VALUES ($1,$2,$3,$4,$4,$5)`,
    [forwardEnr, firm, forwardContact, seq, camp],
  );
  const forward = await openAttempt({
    id: forwardAttempt,
    contactId: forwardContact,
    enrollmentId: forwardEnr,
    now,
  });
  const beforeForward = await eventRuns();
  const forwardFire = await escalateAttemptWindow(
    pool,
    forward,
    criteria(`${criteriaId}-forward`, "return_to_sequence_head"),
    ["text"],
    now,
    0,
  );
  if (!forwardFire) fail("case5-null");
  const forwardFail = await pool.query(`SELECT id FROM campaign_failure WHERE payload->>'attemptId'=$1`, [forwardAttempt]);
  if ((forwardFail.rowCount ?? 0) !== 0) fail("case5-row");
  if (added(beforeForward, await eventRuns()).length !== 0) fail("case5-runs");
  const dry = await pool.query(
    `SELECT id FROM engagement_records WHERE firm_id=$1 AND contact_id=$2 AND event_kind='send_dry_run'`,
    [firm, forwardContact],
  );
  if ((dry.rowCount ?? 0) < 1) fail("case5-dry", dry.rowCount);

  const inboundContact = `contact-pkt010-${token}-inbound`;
  const inboundEnr = `enr-pkt010-${token}-inbound`;
  const inboundAttempt = `aa-pkt010-${token}-inbound`;
  await person(inboundContact);
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, campaign_id)
     VALUES ($1,$2,$3,$4,$4,$5)`,
    [inboundEnr, firm, inboundContact, seq, camp],
  );
  const inbound = await openAttempt({
    id: inboundAttempt,
    contactId: inboundContact,
    enrollmentId: inboundEnr,
    now,
  });
  await pool.query(
    `INSERT INTO engagement_records (id, firm_id, contact_id, event_kind, created_at)
     VALUES ($1,$2,$3,'inbound_reply',$4::timestamptz)`,
    [`eng-pkt010-${token}-in`, firm, inboundContact, now.toISOString()],
  );
  const inboundFire = await escalateAttemptWindow(
    pool,
    inbound,
    criteria(`${criteriaId}-inbound`, "fail"),
    ["text", "email"],
    now,
    0,
  );
  if (inboundFire !== null) fail("case6-return", inboundFire);
  const inboundFail = await pool.query(`SELECT id FROM campaign_failure WHERE payload->>'attemptId'=$1`, [inboundAttempt]);
  if ((inboundFail.rowCount ?? 0) !== 0) fail("case6-row");
  const nullified = await attemptRow(inboundAttempt);
  if (nullified.status !== "nullified") fail("case6-status", nullified.status);
  const nullEng = await pool.query(
    `SELECT id FROM engagement_records WHERE firm_id=$1 AND contact_id=$2 AND event_kind='attempt_nullified'`,
    [firm, inboundContact],
  );
  if (nullEng.rowCount !== 1) fail("case6-engagement", nullEng.rowCount);

  const pointer = { table: "campaign_failure", id: row.id, contact_id: contact };
  const kept = writesFromPayload({
    writes: [pointer],
    contactIds: [contact],
    campaignFailureId: row.id,
  });
  if (kept.length !== 1 || kept[0].table !== "campaign_failure" || kept[0].id !== row.id) fail("case7-kept", kept);
  if (kept.some((item) => item.table === "contact_records")) fail("case7-contact", kept);
  const absent = writesFromPayload({ campaignFailureId: row.id, attemptId });
  if (absent.some((item) => item.table === "campaign_failure" || item.table === "contact_records")) {
    fail("case7-absent", absent);
  }

  const decoyId = `cfail-decoy-${token}`;
  await pool.query(
    `INSERT INTO campaign_failure (id, firm_id, contact_id, campaign_id, sequence_id, payload, created_at)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb, now() + interval '1 day')`,
    [decoyId, firm, contact, camp, seqDecoy, JSON.stringify({ attemptId: "decoy", criteriaId: "decoy", setValue: "fail" })],
  );
  const loadId = `wf-pkt010-${token}-load`;
  await pool.query(
    `INSERT INTO workflow (id, firm_id, name, target, graph) VALUES ($1,$2,$3,'contact','{}'::jsonb)`,
    [loadId, firm, loadId],
  );
  const hitSequence = await loadWalk({
    workflowId: loadId,
    contactId: contact,
    pointerId: row.id,
    pickField: "sequence_id",
    pickValue: seq,
  });
  if (hitSequence !== "branch → true") fail("case8-sequence", hitSequence);
  const hitCriteria = await loadWalk({
    workflowId: loadId,
    contactId: contact,
    pointerId: row.id,
    pickField: "payload.criteriaId",
    pickValue: criteriaId,
  });
  if (hitCriteria !== "branch → true") fail("case8-criteria", hitCriteria);
  await pool.query(`UPDATE campaign_failure SET sequence_id=$2 WHERE id=$1`, [decoyId, seq]);
  const miss = await loadWalk({
    workflowId: loadId,
    contactId: contact,
    pointerId: "cfail-absent",
    pickField: "sequence_id",
    pickValue: seq,
  });
  if (miss !== "branch → false") fail("case8-miss", miss);

  console.log("verify-campaign-failure-writes passed");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await cleanup();
    } catch (err) {
      console.error("cleanup", err);
      process.exitCode = 1;
    }
    await pool.end();
  });
