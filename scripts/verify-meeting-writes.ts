/**
 * PKT-008 against migrated Postgres.
 *
 * A meeting firing stores the inserted mtg- id on payload.writes.
 * The machine payload keeps its scalars and does not gain firm_id.
 * The seat payload keeps firm_id. A blank contact or slot returns
 * before the insert. A machine call without a slot still books.
 * A meeting objective still advances that enrollment.
 *
 * Ship CI runs this after migrate and seed, beside verify-click-attribution.
 */
import { randomUUID } from "node:crypto";
import type { Context } from "hono";
import { sha256 } from "../server/auth-service/crypto.ts";
import { getPool } from "../server/wire-service/db.ts";
import { handleContactSeatMeeting } from "../server/wire-service/contactSeat.ts";
import { handleMeetingBook } from "../server/wire-service/machine.ts";
import { writesFromPayload } from "../server/wire-service/runWrites.ts";
import { materializeTriggersFromGraph } from "../server/wire-service/workflowWalk.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const pool = getPool();
const token = randomUUID().slice(0, 8);
const firm = `firm-pkt008-${token}`;
process.env.AUTH_DISABLED = "true";
process.env.DEV_SESSION_FIRM = firm;

const slot = "2026-11-02T15:00:00-08:00";
const machineContact = `contact-pkt008-${token}-machine`;
const seatContact = `contact-pkt008-${token}-seat`;
const noslotContact = `contact-pkt008-${token}-noslot`;
const advanceContact = `contact-pkt008-${token}-advance`;

type Write = { table: string; id: string; contact_id?: string | null };
type RunRow = {
  id: string;
  node_status: Record<string, { writes?: Write[] }>;
  counts: { contacts?: number };
};
type MeetingRow = {
  id: string;
  contact_id: string;
  source: string;
  slot: string | null;
};

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
  return (await handleMeetingBook(stub(body))) as unknown as {
    body: Record<string, unknown>;
    status: number;
  };
}

async function callSeat(body: unknown, rawToken: string) {
  return (await handleContactSeatMeeting(stub(body, { token: rawToken }))) as unknown as {
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

async function listener(name: string, grain: "global" | "local", localRef: string | null): Promise<string> {
  const id = `wf-pkt008-${token}-${name}`;
  const data: Record<string, unknown> = {
    configured: true,
    triggerKind: "event",
    triggerEvent: "meeting_booked",
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
  const id = `seq-pkt008-${token}-${suffix}`;
  await pool.query(
    `INSERT INTO sequence_template (id, sequence_class, variant, label, firm_id)
     VALUES ($1,'optin','v1',$2,$3)`,
    [id, `PKT-008 ${suffix}`, firm],
  );
  return id;
}

async function campaign(
  seq: string,
  suffix: string,
  ord: number,
  completion: "meeting_booked" | "fact_writebacks",
): Promise<{ id: string; objectiveId: string }> {
  const id = `camp-pkt008-${token}-${suffix}`;
  await pool.query(
    `INSERT INTO campaign (id, firm_id, sequence_id, name, ord) VALUES ($1,$2,$3,$4,$5)`,
    [id, firm, seq, suffix, ord],
  );
  const objectiveId = `obj-pkt008-${token}-${suffix}`;
  const kind = completion === "meeting_booked" ? "meeting" : "form";
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

async function meetings(contactId: string): Promise<MeetingRow[]> {
  const { rows } = await pool.query<MeetingRow>(
    `SELECT id, contact_id, source, slot FROM meeting_booked WHERE firm_id=$1 AND contact_id=$2 ORDER BY id`,
    [firm, contactId],
  );
  return rows;
}

async function meetingCount(): Promise<number> {
  const result = await pool.query(`SELECT id FROM meeting_booked WHERE firm_id=$1`, [firm]);
  return result.rowCount ?? 0;
}

try {
  await pool.query(`INSERT INTO ct_firms (id, name) VALUES ($1,'PKT-008')`, [firm]);
  await person(machineContact);
  await person(seatContact);
  await person(noslotContact);
  await person(advanceContact);

  const pointerSeq = await sequence("pointer");
  const pointerCamp = await campaign(pointerSeq, "pointer", 0, "fact_writebacks");
  const machineEnr = `enr-pkt008-${token}-machine`;
  const seatEnr = `enr-pkt008-${token}-seat`;
  const noslotEnr = `enr-pkt008-${token}-noslot`;
  await enroll(machineEnr, machineContact, pointerSeq, pointerCamp.id);
  await enroll(seatEnr, seatContact, pointerSeq, pointerCamp.id);
  await enroll(noslotEnr, noslotContact, pointerSeq, pointerCamp.id);

  const advanceSeq = await sequence("advance");
  const firstCamp = await campaign(advanceSeq, "first", 0, "meeting_booked");
  const secondCamp = await campaign(advanceSeq, "second", 1, "fact_writebacks");
  const advanceEnr = `enr-pkt008-${token}-advance`;
  await enroll(advanceEnr, advanceContact, advanceSeq, firstCamp.id);

  const globalMeeting = await listener("global", "global", null);
  const localMeeting = await listener("local", "local", slot);

  const decoy = `mtg-decoy-${token}`;
  await pool.query(
    `INSERT INTO meeting_booked
       (id, firm_id, contact_id, source, slot, campaign_objective_id, enrollment_id, booked_at)
     VALUES ($1,$2,$3,'decoy',NULL,NULL,NULL, now() + interval '1 day')`,
    [decoy, firm, machineContact],
  );

  const beforeGlobal = await runsOf(globalMeeting);
  const beforeLocal = await runsOf(localMeeting);
  const committed = await callMachine({ contactId: machineContact, slot });
  if (committed.status !== 200) fail("case1-status", committed);
  const meetingId = String(committed.body.id ?? "");
  if (!meetingId.startsWith("mtg-") || meetingId === decoy) fail("case1-id", meetingId);
  if (committed.body.table !== "meeting_booked") fail("case1-table", committed.body.table);
  if ("writes" in committed.body) fail("case1-http-writes", committed.body);
  const stored = (await meetings(machineContact)).find((row) => row.id === meetingId);
  if (!stored || stored.source !== "contact_portal" || stored.slot !== slot) fail("case1-row", await meetings(machineContact));
  if (stored.contact_id !== machineContact) fail("case1-row-contact", stored);

  const globalRuns = added(beforeGlobal, await runsOf(globalMeeting));
  if (globalRuns.length !== 1) fail("case1-runs", globalRuns.map((row) => row.id));
  const writes = triggerWrites(globalRuns[0]);
  if (writes.length !== 1) fail("case1-writes-len", writes);
  if (writes[0].table !== "meeting_booked" || writes[0].id !== meetingId) fail("case1-writes", writes);
  if (writes[0].id === decoy) fail("case1-decoy", writes);
  if (writes[0].contact_id !== stored.contact_id || writes[0].contact_id !== machineContact) fail("case1-contact", writes);
  if (globalRuns[0].counts?.contacts !== 1) fail("case1-counts", globalRuns[0].counts);
  for (const row of writes) {
    if (row.table === "engagement_records" || row.table === "contact_records") fail("case1-banned", row);
  }
  const localRuns = added(beforeLocal, await runsOf(localMeeting));
  if (localRuns.length !== 0) fail("case1-local", localRuns.length);

  const engagements = await pool.query<{ id: string; payload: { meetingId?: string } }>(
    `SELECT id, payload FROM engagement_records
      WHERE firm_id=$1 AND contact_id=$2 AND event_kind='meeting_booked'`,
    [firm, machineContact],
  );
  if (engagements.rowCount !== 1) fail("case5-count", engagements.rows);
  const engagementId = engagements.rows[0].id;
  if (!engagementId.startsWith("eng-")) fail("case5-id", engagementId);
  if (writes.some((row) => row.id === engagementId)) fail("case5-pointer", writes);
  if (engagements.rows[0].payload?.meetingId !== meetingId) fail("case5-payload", engagements.rows[0].payload);

  const rawToken = `tok-${token}`;
  await pool.query(
    `INSERT INTO contact_access_links
       (id, firm_id, contact_id, token_hash, enrollment_id, campaign_id, expires_at, invalidated_at)
     VALUES ($1,$2,$3,$4,$5,$6,NULL,NULL)`,
    [`cal-${token}`, firm, seatContact, sha256(rawToken), seatEnr, pointerCamp.id],
  );
  const beforeSeatGlobal = await runsOf(globalMeeting);
  const beforeSeatLocal = await runsOf(localMeeting);
  const seated = await callSeat({ slot }, rawToken);
  if (seated.status !== 200) fail("case3-status", seated);
  const seatRows = (await meetings(seatContact)).filter((row) => row.id.startsWith("mtg-"));
  if (seatRows.length !== 1 || seatRows[0].source !== "contact_workspace") fail("case3-row", seatRows);
  const seatGlobal = added(beforeSeatGlobal, await runsOf(globalMeeting));
  if (seatGlobal.length !== 1) fail("case3-runs", seatGlobal.length);
  const seatWrites = triggerWrites(seatGlobal[0]);
  if (seatWrites.length !== 1 || seatWrites[0].id !== seatRows[0].id) fail("case3-writes", seatWrites);
  if (seatWrites[0].table !== "meeting_booked") fail("case3-table", seatWrites);
  if (seatWrites[0].contact_id !== seatContact) fail("case3-contact", seatWrites);
  const seatLocalRuns = added(beforeSeatLocal, await runsOf(localMeeting));
  if (seatLocalRuns.length !== 0) fail("case3-local", seatLocalRuns.length);
  const pointer = { table: "meeting_booked", id: seatRows[0].id, contact_id: seatContact };
  const kept = writesFromPayload({ writes: [pointer], contactIds: [seatContact], meetingId: seatRows[0].id });
  if (kept.length !== 1 || kept[0].table !== "meeting_booked" || kept[0].id !== seatRows[0].id) fail("case3-from-writes", kept);
  if (kept.some((row) => row.table === "contact_records" || row.table === "engagement_records")) {
    fail("case3-extra", kept);
  }
  const absent = writesFromPayload({ meetingId: seatRows[0].id, contactId: seatContact });
  if (absent.some((row) => row.table === "meeting_booked")) fail("case3-no-array", absent);
  const seatEngagements = await pool.query(
    `SELECT id FROM engagement_records WHERE firm_id=$1 AND contact_id=$2`,
    [firm, seatContact],
  );
  if ((seatEngagements.rowCount ?? 0) !== 0) fail("case5-seat", seatEngagements.rowCount);

  const rowsBeforeRefuse = await meetingCount();
  const runsBeforeRefuse = await runsOf(globalMeeting);
  const noContact = await callMachine({});
  const blankContact = await callMachine({ contactId: "  " });
  for (const refused of [noContact, blankContact]) {
    if (refused.status !== 400 || refused.body.error !== "contactId required") fail("case8-machine", refused);
  }
  const noSlot = await callSeat({}, rawToken);
  const blankSlot = await callSeat({ slot: "  " }, rawToken);
  for (const refused of [noSlot, blankSlot]) {
    if (refused.status !== 400 || refused.body.error !== "slot required") fail("case8-seat", refused);
  }
  if ((await meetingCount()) !== rowsBeforeRefuse) fail("case8-rows", await meetingCount());
  if (added(runsBeforeRefuse, await runsOf(globalMeeting)).length !== 0) fail("case8-runs", "new run");

  const beforeNoslot = await runsOf(globalMeeting);
  const noslotRowsBefore = await meetings(noslotContact);
  const omitted = await callMachine({ contactId: noslotContact });
  if (omitted.status !== 200) fail("case9-status", omitted);
  const noslotRows = (await meetings(noslotContact)).filter((row) => !noslotRowsBefore.some((prior) => prior.id === row.id));
  if (noslotRows.length !== 1 || noslotRows[0].slot !== null || !noslotRows[0].id.startsWith("mtg-")) {
    fail("case9-row", noslotRows);
  }
  if (omitted.body.id !== noslotRows[0].id) fail("case9-id", omitted.body.id);
  const noslotRuns = added(beforeNoslot, await runsOf(globalMeeting));
  if (noslotRuns.length !== 1) fail("case9-runs", noslotRuns.length);
  const noslotWrites = triggerWrites(noslotRuns[0]);
  if (noslotWrites.length !== 1 || noslotWrites[0].id !== noslotRows[0].id) fail("case9-writes", noslotWrites);

  const beforeAdvance = await runsOf(globalMeeting);
  const advanced = await callMachine({ contactId: advanceContact, slot });
  if (advanced.status !== 200) fail("case10-status", advanced);
  const advancedId = String(advanced.body.id ?? "");
  if (!advancedId.startsWith("mtg-")) fail("case10-id", advancedId);
  const cursor = await pool.query<{ campaign_id: string | null }>(
    `SELECT campaign_id FROM enrollment WHERE id=$1`,
    [advanceEnr],
  );
  if (cursor.rows[0]?.campaign_id !== secondCamp.id) fail("case10-cursor", cursor.rows[0]);
  const advanceRuns = added(beforeAdvance, await runsOf(globalMeeting));
  const advanceHandle = advanceRuns.find((row) => triggerWrites(row)[0]?.id === advancedId);
  if (!advanceHandle || triggerWrites(advanceHandle)[0]?.table !== "meeting_booked") {
    fail("case10-writes", advanceRuns.map((row) => triggerWrites(row)));
  }

  console.log("verify-meeting-writes passed");
} finally {
  await pool.query(`DELETE FROM workflow_run WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM engagement_records WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM meeting_booked WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM active_attempts WHERE firm_id=$1`, [firm]);
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
