/**
 * PKT-002 against migrated Postgres.
 *
 * Opening an ask does not write enrollment.campaign_id. The seat GET keeps
 * the cursor projectSeat already reads: the newest enrollment's campaign_id,
 * or the token link's campaign_id when that enrollment has none. Now and the
 * outstanding history row follow that stored cursor. advanceEnrollmentCampaign
 * still moves only the enrollment whose stamped objective is already satisfied.
 *
 * Ship CI runs this after migrate and seed.
 */
import { randomUUID } from "node:crypto";
import type { Context } from "hono";
import { sha256 } from "../server/auth-service/crypto.ts";
import { advanceEnrollmentCampaign } from "../server/wire-service/campaignHousing.ts";
import { handleContactSeatGet } from "../server/wire-service/contactSeat.ts";
import { getPool } from "../server/wire-service/db.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const pool = getPool();
const run = randomUUID().slice(0, 8);
const firm = `firm-pkt002-${run}`;

type CursorRow = { id: string; campaign_id: string | null };

function fail(name: string, detail: unknown): never {
  console.error(`fail ${name}`, detail);
  process.exitCode = 1;
  throw new Error(name);
}

async function housing(suffix: string) {
  const seq = `seq-pkt002-${run}-${suffix}`;
  const form = `camp-pkt002-${run}-${suffix}-form`;
  const meeting = `camp-pkt002-${run}-${suffix}-meeting`;
  const other = `camp-pkt002-${run}-${suffix}-other`;
  const formObj = `obj-pkt002-${run}-${suffix}-form`;
  const meetingObj = `obj-pkt002-${run}-${suffix}-meeting`;
  const otherObj = `obj-pkt002-${run}-${suffix}-other`;
  await pool.query(
    `INSERT INTO sequence_template (id, sequence_class, variant, label, firm_id)
     VALUES ($1, 'optin', 'v1', $2, $3)`,
    [seq, `PKT-002 ${suffix}`, firm],
  );
  await pool.query(
    `INSERT INTO campaign (id, firm_id, sequence_id, name, ord)
     VALUES ($1,$4,$5,'Form ask',0), ($2,$4,$5,'Meeting ask',1), ($3,$4,$5,'Other ask',2)`,
    [form, meeting, other, firm, seq],
  );
  await pool.query(
    `INSERT INTO campaign_objective (id, campaign_id, kind, name, completion_table)
     VALUES ($1,$2,'form','Form ask','fact_writebacks'),
            ($3,$4,'meeting','Meeting ask','meeting_booked'),
            ($5,$6,'form','Other ask','fact_writebacks')`,
    [formObj, form, meetingObj, meeting, otherObj, other],
  );
  return { seq, form, meeting, other, formObj, meetingObj };
}

async function enroll(opts: {
  id: string;
  contact: string;
  seq: string;
  campaignId: string | null;
  enrolledAt: string;
}) {
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, campaign_id, enrolled_at)
     VALUES ($1,$2,$3,$4,$4,$5,$6::timestamptz)`,
    [opts.id, firm, opts.contact, opts.seq, opts.campaignId, opts.enrolledAt],
  );
}

async function consent(contact: string) {
  await pool.query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, source)
     VALUES ($1,$2,'express',false,'contact_workspace')`,
    [contact, firm],
  );
}

async function link(opts: { id: string; contact: string; token: string; campaignId: string | null }) {
  await pool.query(
    `INSERT INTO contact_access_links (id, firm_id, contact_id, token_hash, campaign_id)
     VALUES ($1,$2,$3,$4,$5)`,
    [opts.id, firm, opts.contact, sha256(opts.token), opts.campaignId],
  );
}

async function cursors(contact: string): Promise<CursorRow[]> {
  const rows = await pool.query<CursorRow>(
    `SELECT id, campaign_id FROM enrollment
      WHERE firm_id=$1 AND contact_id=$2
      ORDER BY enrolled_at ASC, id ASC`,
    [firm, contact],
  );
  return rows.rows;
}

async function linkCampaign(id: string): Promise<string | null> {
  const row = await pool.query<{ campaign_id: string | null }>(
    `SELECT campaign_id FROM contact_access_links WHERE id=$1`,
    [id],
  );
  return row.rows[0]?.campaign_id ?? null;
}

function same(actual: CursorRow[], expected: CursorRow[], name: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) fail(name, { actual, expected });
}

type SeatBody = {
  ok?: boolean;
  now?: { state?: string };
  history?: Array<{ outstanding?: boolean; campaignId?: string | null }>;
};

async function seatGet(token: string, campaignId?: string): Promise<SeatBody> {
  const ctx = {
    req: {
      param: (name: string) => (name === "token" ? token : ""),
      query: (name: string) => (name === "campaignId" ? campaignId : undefined),
    },
    json: (body: unknown, status = 200) => ({ body, status }),
  };
  const result = (await handleContactSeatGet(ctx as unknown as Context)) as { body?: SeatBody; status?: number };
  if ((result.status ?? 200) >= 400 || !result.body?.ok) fail("seat get", result);
  return result.body;
}

function expectCursor(body: SeatBody, state: "form" | "meeting", campaignId: string, name: string) {
  if (body.now?.state !== state) fail(`${name} now`, body.now);
  const outstanding = (body.history ?? []).filter((row) => row.outstanding && row.campaignId);
  if (outstanding.length !== 1 || outstanding[0]?.campaignId !== campaignId) {
    fail(`${name} outstanding`, outstanding);
  }
}

async function cleanup() {
  await pool.query(`DELETE FROM engagement_records WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM active_attempts WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM fact_writebacks WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM meeting_booked WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM contact_access_links WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM consent_records WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM enrollment WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM sequence_template WHERE id LIKE $1`, [`seq-pkt002-${run}-%`]);
}

try {
  {
    const h = await housing("open");
    const contact = `cr-${run}-open`;
    const older = `enr-${run}-open-older`;
    const newer = `enr-${run}-open-newer`;
    const linkId = `cal-${run}-open`;
    const token = `tok-${run}-open`;
    await enroll({
      id: older,
      contact,
      seq: h.seq,
      campaignId: h.meeting,
      enrolledAt: "2026-08-01T00:00:00Z",
    });
    await enroll({
      id: newer,
      contact,
      seq: h.seq,
      campaignId: h.form,
      enrolledAt: "2026-09-01T00:00:00Z",
    });
    await consent(contact);
    await link({ id: linkId, contact, token, campaignId: h.form });
    const before = await cursors(contact);
    const linkBefore = await linkCampaign(linkId);

    const olderAsk = await seatGet(token, h.meeting);
    same(await cursors(contact), before, "older campaign writes nothing");
    if ((await linkCampaign(linkId)) !== linkBefore) fail("older campaign link", await linkCampaign(linkId));
    expectCursor(olderAsk, "form", h.form, "older campaign");

    const sameAsk = await seatGet(token, h.form);
    same(await cursors(contact), before, "newest campaign writes nothing");
    if ((await linkCampaign(linkId)) !== linkBefore) fail("newest campaign link", await linkCampaign(linkId));
    expectCursor(sameAsk, "form", h.form, "newest campaign");

    const absent = await seatGet(token);
    same(await cursors(contact), before, "absent query writes nothing");
    if ((await linkCampaign(linkId)) !== linkBefore) fail("absent query link", await linkCampaign(linkId));
    expectCursor(absent, "form", h.form, "absent query");

    const blank = await seatGet(token, "   ");
    same(await cursors(contact), before, "whitespace query writes nothing");
    if ((await linkCampaign(linkId)) !== linkBefore) fail("whitespace query link", await linkCampaign(linkId));
    expectCursor(blank, "form", h.form, "whitespace query");

    const otherAsk = await seatGet(token, h.other);
    same(await cursors(contact), before, "other campaign writes nothing");
    if ((await linkCampaign(linkId)) !== linkBefore) fail("other campaign link", await linkCampaign(linkId));
    expectCursor(otherAsk, "form", h.form, "other campaign");
    console.log("ok  a campaignId query leaves both enrollment cursors and the link");
  }

  {
    const h = await housing("null");
    const contact = `cr-${run}-null`;
    const older = `enr-${run}-null-older`;
    const newer = `enr-${run}-null-newer`;
    const linkId = `cal-${run}-null`;
    const token = `tok-${run}-null`;
    await enroll({
      id: older,
      contact,
      seq: h.seq,
      campaignId: h.form,
      enrolledAt: "2026-08-01T00:00:00Z",
    });
    await enroll({
      id: newer,
      contact,
      seq: h.seq,
      campaignId: null,
      enrolledAt: "2026-09-01T00:00:00Z",
    });
    await consent(contact);
    await link({ id: linkId, contact, token, campaignId: h.meeting });
    const before = await cursors(contact);
    const body = await seatGet(token, h.other);
    same(await cursors(contact), before, "null cursor stays null");
    if ((await linkCampaign(linkId)) !== h.meeting) fail("null arm link", await linkCampaign(linkId));
    expectCursor(body, "meeting", h.meeting, "null cursor");
    const newest = (await cursors(contact)).find((row) => row.id === newer);
    if (newest?.campaign_id !== null) fail("newest stays null", newest);
    console.log("ok  a null enrollment cursor follows the token link and still writes nothing");
  }

  {
    const h = await housing("latch");
    const contact = `cr-${run}-latch`;
    const satisfied = `enr-${run}-latch-form`;
    const waiting = `enr-${run}-latch-meeting`;
    await enroll({
      id: satisfied,
      contact,
      seq: h.seq,
      campaignId: h.form,
      enrolledAt: "2026-08-01T00:00:00Z",
    });
    await enroll({
      id: waiting,
      contact,
      seq: h.seq,
      campaignId: h.meeting,
      enrolledAt: "2026-09-01T00:00:00Z",
    });
    await pool.query(
      `INSERT INTO fact_writebacks (id, firm_id, contact_id, field_key, value, campaign_objective_id)
       VALUES ($1,$2,$3,'note','"ready"'::jsonb,$4)`,
      [`fwb-${run}-latch`, firm, contact, h.formObj],
    );
    const held = await advanceEnrollmentCampaign(pool, waiting);
    if (held.advanced) fail("unsatisfied enrollment advanced", held);
    const afterHold = await cursors(contact);
    const heldSatisfied = afterHold.find((row) => row.id === satisfied);
    const heldWaiting = afterHold.find((row) => row.id === waiting);
    if (heldSatisfied?.campaign_id !== h.form || heldWaiting?.campaign_id !== h.meeting) {
      fail("unsatisfied call leaves both", afterHold);
    }
    const moved = await advanceEnrollmentCampaign(pool, satisfied);
    if (!moved.advanced || moved.campaignId !== h.meeting) fail("satisfied enrollment advances", moved);
    const after = await cursors(contact);
    const nextSatisfied = after.find((row) => row.id === satisfied);
    const nextWaiting = after.find((row) => row.id === waiting);
    if (nextSatisfied?.campaign_id !== h.meeting) fail("satisfied cursor", nextSatisfied);
    if (nextWaiting?.campaign_id !== h.meeting) fail("other enrollment stays", nextWaiting);
    console.log("ok  the latch moves only the enrollment whose objective is already satisfied");
  }

  console.log("Open ask cursor PASSED");
} finally {
  await cleanup();
  await pool.end();
}

if (process.exitCode) process.exit(process.exitCode);
