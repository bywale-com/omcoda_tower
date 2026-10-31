/**
 * PKT-007 against migrated Postgres.
 *
 * A fact firing stores the inserted fwb- id on payload.writes.
 * The machine payload keeps its scalars and does not gain firm_id.
 * Each seat answer is its own firing. A blank field key does not insert.
 * A missing contactId or fieldKey returns before the insert.
 * Eligibility writes stay empty. The completion cursor still advances
 * when the objective table is fact_writebacks.
 *
 * Ship CI runs this after migrate and seed, beside verify-click-attribution.
 */
import { randomUUID } from "node:crypto";
import type { Context } from "hono";
import { sha256 } from "../server/auth-service/crypto.ts";
import { derivedFormRef } from "../server/wire-service/campaignHousing.ts";
import { getPool } from "../server/wire-service/db.ts";
import { handleContactSeatFacts } from "../server/wire-service/contactSeat.ts";
import { handleFactWriteback } from "../server/wire-service/machine.ts";
import { writesFromPayload } from "../server/wire-service/runWrites.ts";
import { materializeTriggersFromGraph } from "../server/wire-service/workflowWalk.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const pool = getPool();
const token = randomUUID().slice(0, 8);
const firm = `firm-pkt007-${token}`;
process.env.AUTH_DISABLED = "true";
process.env.DEV_SESSION_FIRM = firm;

const machineContact = `contact-pkt007-${token}-machine`;
const seatContact = `contact-pkt007-${token}-seat`;
const advanceContact = `contact-pkt007-${token}-advance`;

type Write = { table: string; id: string; contact_id?: string | null };
type RunRow = {
  id: string;
  node_status: Record<string, { writes?: Write[] }>;
  counts: { contacts?: number };
};

const bannedTables = new Set([
  "eligibility_evaluations",
  "eligibility_results",
  "signals",
  "motion_decisions",
  "missing_fact_signals",
  "contact_records",
]);

function fail(name: string, detail: unknown): never {
  console.error(`fail ${name}`, detail);
  process.exitCode = 1;
  throw new Error(name);
}

function stub(body: unknown, params: Record<string, string> = {}) {
  return {
    json(payload: unknown, status = 200) {
      return { body: payload, status };
    },
    req: {
      json: async () => body,
      query: () => "",
      header: () => "",
      param: (name: string) => params[name] ?? "",
      raw: { headers: new Headers() },
    },
  } as unknown as Context;
}

async function callMachine(body: unknown) {
  return (await handleFactWriteback(stub(body))) as unknown as {
    body: Record<string, unknown>;
    status: number;
  };
}

async function callSeat(body: unknown, rawToken: string) {
  return (await handleContactSeatFacts(stub(body, { token: rawToken }))) as unknown as {
    body: Record<string, unknown>;
    status: number;
  };
}

function triggerWrites(row: RunRow): Write[] {
  const writes = row.node_status?.trig?.writes;
  return Array.isArray(writes) ? writes : [];
}

async function runsOf(workflowId: string): Promise<RunRow[]> {
  const { rows } = await pool.query<RunRow>(
    `SELECT id, node_status, counts FROM workflow_run WHERE workflow_id=$1 ORDER BY started_at ASC, id ASC`,
    [workflowId],
  );
  return rows;
}

function added(before: RunRow[], after: RunRow[]): RunRow[] {
  const seen = new Set(before.map((row) => row.id));
  return after.filter((row) => !seen.has(row.id));
}

async function listener(
  name: string,
  eventName: string,
  grain: "global" | "local",
  localRef: string | null,
): Promise<string> {
  const id = `wf-pkt007-${token}-${name}`;
  const data: Record<string, unknown> = {
    configured: true,
    triggerKind: "event",
    triggerEvent: eventName,
    grain,
  };
  if (localRef) data.localRef = localRef;
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

async function sequence(suffix: string): Promise<string> {
  const id = `seq-pkt007-${token}-${suffix}`;
  await pool.query(
    `INSERT INTO sequence_template (id, sequence_class, variant, label, firm_id)
     VALUES ($1,'optin','v1',$2,$3)`,
    [id, `PKT-007 ${suffix}`, firm],
  );
  return id;
}

async function campaign(
  seq: string,
  suffix: string,
  ord: number,
  completion: "meeting_booked" | "fact_writebacks",
): Promise<{ id: string; objectiveId: string }> {
  const id = `camp-pkt007-${token}-${suffix}`;
  await pool.query(
    `INSERT INTO campaign (id, firm_id, sequence_id, name, ord) VALUES ($1,$2,$3,$4,$5)`,
    [id, firm, seq, suffix, ord],
  );
  const objectiveId = `obj-pkt007-${token}-${suffix}`;
  const kind = completion === "fact_writebacks" ? "form" : "meeting";
  await pool.query(
    `INSERT INTO campaign_objective (id, campaign_id, kind, name, completion_table)
     VALUES ($1,$2,$3,$4,$5)`,
    [objectiveId, id, kind, suffix, completion],
  );
  return { id, objectiveId };
}

async function enroll(id: string, contactId: string, seq: string, campaignId: string) {
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, campaign_id)
     VALUES ($1,$2,$3,$4,$4,$5)`,
    [id, firm, contactId, seq, campaignId],
  );
}

async function person(id: string) {
  await pool.query(`INSERT INTO contact_records (id, firm_id, name) VALUES ($1,$2,$3)`, [id, firm, id]);
}

async function factRows(contactId: string) {
  const { rows } = await pool.query<{ id: string; contact_id: string; field_key: string | null }>(
    `SELECT id, contact_id, field_key FROM fact_writebacks WHERE firm_id=$1 AND contact_id=$2 ORDER BY id`,
    [firm, contactId],
  );
  return rows;
}

try {
  await pool.query(`INSERT INTO ct_firms (id, name) VALUES ($1,'PKT-007')`, [firm]);
  await person(machineContact);
  await person(seatContact);
  await person(advanceContact);

  const pointerSeq = await sequence("pointer");
  const machineCamp = await campaign(pointerSeq, "machine", 0, "meeting_booked");
  const seatCamp = await campaign(pointerSeq, "seat", 1, "meeting_booked");
  const machineEnr = `enr-pkt007-${token}-machine`;
  const seatEnr = `enr-pkt007-${token}-seat`;
  await enroll(machineEnr, machineContact, pointerSeq, machineCamp.id);
  await enroll(seatEnr, seatContact, pointerSeq, seatCamp.id);

  const advanceSeq = await sequence("advance");
  const firstCamp = await campaign(advanceSeq, "first", 0, "fact_writebacks");
  const secondCamp = await campaign(advanceSeq, "second", 1, "meeting_booked");
  const advanceEnr = `enr-pkt007-${token}-advance`;
  await enroll(advanceEnr, advanceContact, advanceSeq, firstCamp.id);

  const globalFact = await listener("fact-global", "fact_writebacks", "global", null);
  const machineLocal = await listener(
    "fact-machine",
    "fact_writebacks",
    "local",
    derivedFormRef(machineEnr, machineCamp.objectiveId),
  );
  const seatLocal = await listener(
    "fact-seat",
    "fact_writebacks",
    "local",
    derivedFormRef(seatEnr, seatCamp.objectiveId),
  );
  const eligibility = await listener("eligibility", "eligibility.changed", "global", null);

  const decoy = `fwb-decoy-${token}`;
  const preMissing = `mfs-pkt007-${token}-keep`;
  await pool.query(
    `INSERT INTO fact_writebacks (id, firm_id, contact_id, field_key, campaign_objective_id, created_at)
     VALUES ($1,$2,$3,'decoy',NULL, now() + interval '1 day')`,
    [decoy, firm, machineContact],
  );
  await pool.query(
    `INSERT INTO missing_fact_signals (id, firm_id, contact_id, field_key) VALUES ($1,$2,$3,'keep')`,
    [preMissing, firm, machineContact],
  );

  const beforeGlobal = await runsOf(globalFact);
  const beforeMachineLocal = await runsOf(machineLocal);
  const beforeEligibility = await runsOf(eligibility);
  const committed = await callMachine({
    contactId: machineContact,
    fieldKey: "keep",
    value: "yes",
    missingFieldKeys: ["fresh"],
  });
  if (committed.status !== 200) fail("case1-status", committed);
  const writebackId = String(committed.body.writebackId ?? "");
  if (!writebackId.startsWith("fwb-") || writebackId === decoy) fail("case1-id", writebackId);
  const stored = (await factRows(machineContact)).find((row) => row.id === writebackId);
  if (!stored || stored.field_key !== "keep") fail("case1-row", await factRows(machineContact));

  const globalRuns = added(beforeGlobal, await runsOf(globalFact));
  if (globalRuns.length !== 1) fail("case1-runs", globalRuns.map((row) => row.id));
  const writes = triggerWrites(globalRuns[0]);
  if (writes.length !== 1) fail("case1-writes-len", writes);
  if (writes[0].table !== "fact_writebacks" || writes[0].id !== writebackId) fail("case1-writes", writes);
  if (writes[0].id === decoy) fail("case1-decoy", writes);
  if (writes[0].contact_id !== stored.contact_id) fail("case1-contact", writes);
  if (globalRuns[0].counts?.contacts !== 1) fail("case1-counts", globalRuns[0].counts);
  const listed = new Set([preMissing, ...((committed.body.missingSignalIds as string[] | undefined) ?? [])]);
  for (const row of writes) {
    if (listed.has(row.id)) fail("case1-missing", { row, listed: [...listed] });
    if (bannedTables.has(row.table)) fail("case1-banned", row);
  }
  const eligibilityRuns = added(beforeEligibility, await runsOf(eligibility));
  if (eligibilityRuns.length !== 1 || triggerWrites(eligibilityRuns[0]).length !== 0) {
    fail("case1-eligibility", eligibilityRuns.map((row) => triggerWrites(row)));
  }
  const localRuns = added(beforeMachineLocal, await runsOf(machineLocal));
  if (localRuns.length !== 1) fail("case1-local", localRuns.length);
  const cascade = committed.body.cascade as Array<Record<string, unknown>> | undefined;
  if (!cascade || cascade[0]?.table !== "fact_writebacks" || cascade[0]?.id !== writebackId) {
    fail("case1-cascade", cascade?.[0]);
  }
  if (cascade[0] && "contact_id" in cascade[0]) fail("case1-cascade-contact", cascade[0]);

  const rawToken = `tok-${token}`;
  await pool.query(
    `INSERT INTO contact_access_links
       (id, firm_id, contact_id, token_hash, enrollment_id, campaign_id, expires_at, invalidated_at)
     VALUES ($1,$2,$3,$4,$5,$6,NULL,NULL)`,
    [`cal-${token}`, firm, seatContact, sha256(rawToken), seatEnr, seatCamp.id],
  );
  const beforeSeatGlobal = await runsOf(globalFact);
  const beforeSeatLocal = await runsOf(seatLocal);
  const seated = await callSeat(
    {
      answers: [
        { fieldKey: "one", value: "a" },
        { fieldKey: "two", value: "b" },
      ],
    },
    rawToken,
  );
  if (seated.status !== 200) fail("case3-status", seated);
  const seatFacts = await factRows(seatContact);
  const one = seatFacts.find((row) => row.field_key === "one");
  const two = seatFacts.find((row) => row.field_key === "two");
  if (!one || !two || !one.id.startsWith("fwb-") || !two.id.startsWith("fwb-")) fail("case3-rows", seatFacts);
  const seatGlobal = added(beforeSeatGlobal, await runsOf(globalFact));
  if (seatGlobal.length !== 2) fail("case3-runs", seatGlobal.length);
  const published = new Set(seatGlobal.map((row) => triggerWrites(row)[0]?.id));
  if (published.size !== 2 || !published.has(one.id) || !published.has(two.id)) fail("case3-ids", [...published]);
  for (const row of seatGlobal) {
    const handle = triggerWrites(row);
    if (handle.length !== 1) fail("case3-len", handle);
    if (handle[0].id !== one.id && handle[0].id !== two.id) fail("case3-other", handle);
    if (handle[0].contact_id !== seatContact) fail("case3-contact", handle);
  }
  const seatLocalRuns = added(beforeSeatLocal, await runsOf(seatLocal));
  if (seatLocalRuns.length !== 2) fail("case3-local", seatLocalRuns.length);
  const pointer = { table: "fact_writebacks", id: one.id, contact_id: seatContact };
  const kept = writesFromPayload({ writes: [pointer], contactIds: [seatContact], writebackId: one.id });
  if (kept.length !== 1 || kept[0].table !== "fact_writebacks" || kept[0].id !== one.id) fail("case3-from-writes", kept);
  if (kept.some((row) => row.table === "contact_records")) fail("case3-contact-records", kept);
  const absent = writesFromPayload({ writebackId: one.id, contactId: seatContact });
  if (absent.some((row) => row.table === "fact_writebacks")) fail("case3-no-array", absent);

  const beforeBlank = await factRows(seatContact);
  const beforeBlankRuns = await runsOf(globalFact);
  const blank = await callSeat(
    { answers: [{ fieldKey: "  " }, { fieldKey: "keep", value: "yes" }] },
    rawToken,
  );
  if (blank.status !== 200) fail("case5-status", blank);
  const afterBlank = await factRows(seatContact);
  const freshFacts = afterBlank.filter((row) => !beforeBlank.some((prior) => prior.id === row.id));
  if (freshFacts.length !== 1 || freshFacts[0].field_key !== "keep") fail("case5-row", freshFacts);
  const blankRuns = added(beforeBlankRuns, await runsOf(globalFact));
  if (blankRuns.length !== 1 || triggerWrites(blankRuns[0])[0]?.id !== freshFacts[0].id) {
    fail("case5-run", blankRuns.map((row) => triggerWrites(row)));
  }

  const factsBeforeRefuse = (await pool.query(`SELECT id FROM fact_writebacks WHERE firm_id=$1`, [firm])).rowCount;
  const runsBeforeRefuse = await runsOf(globalFact);
  const noContact = await callMachine({});
  const noField = await callMachine({ contactId: machineContact });
  for (const refused of [noContact, noField]) {
    if (refused.status !== 400 || refused.body.error !== "contactId and fieldKey required") fail("case6-status", refused);
  }
  const factsAfterRefuse = (await pool.query(`SELECT id FROM fact_writebacks WHERE firm_id=$1`, [firm])).rowCount;
  if (factsAfterRefuse !== factsBeforeRefuse) fail("case6-rows", { factsBeforeRefuse, factsAfterRefuse });
  if (added(runsBeforeRefuse, await runsOf(globalFact)).length !== 0) fail("case6-runs", "new run");

  const beforeAdvance = await runsOf(globalFact);
  const advanced = await callMachine({ contactId: advanceContact, fieldKey: "done", value: "yes" });
  if (advanced.status !== 200) fail("case7-status", advanced);
  const advancedId = String(advanced.body.writebackId ?? "");
  if (!advancedId.startsWith("fwb-")) fail("case7-id", advancedId);
  const cursor = await pool.query<{ campaign_id: string | null }>(
    `SELECT campaign_id FROM enrollment WHERE id=$1`,
    [advanceEnr],
  );
  if (cursor.rows[0]?.campaign_id !== secondCamp.id) fail("case7-cursor", cursor.rows[0]);
  const advanceRuns = added(beforeAdvance, await runsOf(globalFact));
  const advanceHandle = advanceRuns.find((row) => triggerWrites(row)[0]?.id === advancedId);
  if (!advanceHandle || triggerWrites(advanceHandle)[0]?.table !== "fact_writebacks") {
    fail("case7-writes", advanceRuns.map((row) => triggerWrites(row)));
  }

  console.log("verify-fact-writes passed");
} finally {
  await pool.query(`DELETE FROM workflow_run WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM engagement_records WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM eligibility_results WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM eligibility_evaluations WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM signals WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM motion_decisions WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM missing_fact_signals WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM fact_writebacks WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM contact_access_links WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM enrollment WHERE firm_id=$1`, [firm]);
  await pool.query(
    `DELETE FROM campaign_objective WHERE campaign_id IN (SELECT id FROM campaign WHERE firm_id=$1)`,
    [firm],
  );
  await pool.query(`DELETE FROM campaign WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM sequence_template WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM workflow_trigger WHERE firm_id=$1`, [firm]);
  await pool.query(
    `DELETE FROM workflow_state WHERE workflow_id IN (SELECT id FROM workflow WHERE firm_id=$1)`,
    [firm],
  );
  await pool.query(`DELETE FROM workflow WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM contact_records WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM ct_firms WHERE id=$1`, [firm]);
  await pool.end();
}

if (process.exitCode) process.exit(process.exitCode);
