/**
 * PKT-001 against migrated Postgres.
 *
 * A click on a message stamped for enrollment A advances A. A newer enrollment
 * B that shares A's objective does not advance. No enrollment stamp advances
 * nobody. A null objective id matches A only at or after A's enrolled_at.
 * A null campaign_id does not advance.
 *
 * Unsets RESEND_WEBHOOK_SECRET for the fixture call so this script is not a
 * signature test. Ship CI runs it after migrate and seed.
 */
import { randomUUID } from "node:crypto";
import type { Context } from "hono";
import { getPool } from "../server/wire-service/db.ts";
import { handleResendWebhook } from "../server/wire-service/webhooks.ts";
import { advanceEnrollmentCampaign } from "../server/wire-service/campaignHousing.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

delete process.env.RESEND_WEBHOOK_SECRET;

const pool = getPool();
const run = randomUUID().slice(0, 8);
const firm = `firm-pkt001-${run}`;
const created: { sequences: string[]; enrollments: string[]; messages: string[]; providers: string[] } = {
  sequences: [],
  enrollments: [],
  messages: [],
  providers: [],
};

function fail(name: string, detail: unknown): never {
  console.error(`fail ${name}`, detail);
  process.exitCode = 1;
  throw new Error(name);
}

async function housing(suffix: string) {
  const seq = `seq-pkt001-${run}-${suffix}`;
  const camp1 = `camp-pkt001-${run}-${suffix}-1`;
  const camp2 = `camp-pkt001-${run}-${suffix}-2`;
  const obj = `obj-pkt001-${run}-${suffix}`;
  await pool.query(
    `INSERT INTO sequence_template (id, sequence_class, variant, label, firm_id)
     VALUES ($1, 'optin', 'v1', $2, $3)`,
    [seq, `PKT-001 ${suffix}`, firm],
  );
  await pool.query(
    `INSERT INTO campaign (id, firm_id, sequence_id, name, ord)
     VALUES ($1,$2,$3,'first',0), ($4,$2,$3,'second',1)`,
    [camp1, firm, seq, camp2],
  );
  await pool.query(
    `INSERT INTO campaign_objective (id, campaign_id, kind, name, completion_table)
     VALUES ($1,$2,'click','Click this link','messaging_events')`,
    [obj, camp1],
  );
  created.sequences.push(seq);
  return { seq, camp1, camp2, obj };
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
  created.enrollments.push(opts.id);
}

async function message(opts: {
  id: string;
  contact: string;
  provider: string;
  enrollmentId: string | null;
  campaignId: string | null;
  objectiveId: string | null;
  createdAt: string;
}) {
  await pool.query(
    `INSERT INTO outbound_messages
       (id, firm_id, contact_id, channel, purpose, to_addr, provider_message_id,
        enrollment_id, campaign_id, campaign_objective_id, created_at)
     VALUES ($1,$2,$3,'email','cem',$4,$5,$6,$7,$8,$9::timestamptz)`,
    [
      opts.id,
      firm,
      opts.contact,
      `${opts.contact}@example.com`,
      opts.provider,
      opts.enrollmentId,
      opts.campaignId,
      opts.objectiveId,
      opts.createdAt,
    ],
  );
  created.messages.push(opts.id);
  created.providers.push(opts.provider);
}

async function click(provider: string) {
  const raw = JSON.stringify({ type: "email.clicked", data: { email_id: provider } });
  const headers = new Headers();
  const ctx = {
    req: {
      text: async () => raw,
      raw: { headers },
      header: (name: string) => headers.get(name),
    },
    json: (body: unknown, status = 200) => ({ body, status }),
  };
  const result = (await handleResendWebhook(ctx as unknown as Context)) as { status?: number; body?: unknown };
  if ((result.status ?? 200) >= 400) fail("webhook", result);
}

async function campaignOf(id: string): Promise<string | null> {
  const row = await pool.query<{ campaign_id: string | null }>(
    `SELECT campaign_id FROM enrollment WHERE id=$1`,
    [id],
  );
  return row.rows[0]?.campaign_id ?? null;
}

async function cleanup() {
  await pool.query(`DELETE FROM engagement_records WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM active_attempts WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM messaging_events WHERE firm_id=$1`, [firm]);
  if (created.providers.length) {
    await pool.query(`DELETE FROM provider_webhook_receipts WHERE provider_event_id = ANY($1::text[])`, [
      created.providers.map((id) => `email.clicked:${id}`),
    ]);
  }
  if (created.messages.length) {
    await pool.query(`DELETE FROM outbound_messages WHERE id = ANY($1::text[])`, [created.messages]);
  }
  if (created.enrollments.length) {
    await pool.query(`DELETE FROM enrollment WHERE id = ANY($1::text[])`, [created.enrollments]);
  }
  if (created.sequences.length) {
    await pool.query(`DELETE FROM sequence_template WHERE id = ANY($1::text[])`, [created.sequences]);
  }
}

try {
  {
    const h = await housing("same");
    const contact = `cr-${run}-same`;
    const a = `enr-${run}-a`;
    const b = `enr-${run}-b`;
    await enroll({ id: a, contact, seq: h.seq, campaignId: h.camp1, enrolledAt: "2026-08-01T00:00:00Z" });
    await enroll({ id: b, contact, seq: h.seq, campaignId: h.camp1, enrolledAt: "2026-09-01T00:00:00Z" });
    await message({
      id: `msg-${run}-same`,
      contact,
      provider: `prov-${run}-same`,
      enrollmentId: a,
      campaignId: h.camp1,
      objectiveId: h.obj,
      createdAt: "2026-08-02T00:00:00Z",
    });
    await click(`prov-${run}-same`);
    if ((await campaignOf(a)) !== h.camp2) fail("stamped A advances", await campaignOf(a));
    if ((await campaignOf(b)) !== h.camp1) fail("newer B stays", await campaignOf(b));
    const tickB = await advanceEnrollmentCampaign(pool, b, {
      completionTable: "messaging_events",
      completionId: "tick-b",
    });
    if (tickB.advanced) fail("tick of B must not advance", tickB);
    if ((await campaignOf(b)) !== h.camp1) fail("B after tick", await campaignOf(b));
    const met = await pool.query(
      `SELECT id FROM engagement_records
        WHERE firm_id=$1 AND contact_id=$2 AND event_kind='objective_met'
          AND payload->>'enrollmentId'=$3`,
      [firm, contact, a],
    );
    if (!met.rowCount) fail("A records objective_met", met.rowCount);
    console.log("ok  stamped click advances A and not newer B");
  }

  {
    const h = await housing("null-stamp");
    const contact = `cr-${run}-null`;
    const a = `enr-${run}-null-a`;
    const b = `enr-${run}-null-b`;
    await enroll({ id: a, contact, seq: h.seq, campaignId: h.camp1, enrolledAt: "2026-08-01T00:00:00Z" });
    await enroll({ id: b, contact, seq: h.seq, campaignId: h.camp1, enrolledAt: "2026-09-01T00:00:00Z" });
    await message({
      id: `msg-${run}-null`,
      contact,
      provider: `prov-${run}-null`,
      enrollmentId: null,
      campaignId: h.camp1,
      objectiveId: h.obj,
      createdAt: "2026-08-02T00:00:00Z",
    });
    await click(`prov-${run}-null`);
    if ((await campaignOf(a)) !== h.camp1) fail("unstamped leaves A", await campaignOf(a));
    if ((await campaignOf(b)) !== h.camp1) fail("unstamped leaves newest B", await campaignOf(b));
    console.log("ok  missing enrollment stamp advances nobody");
  }

  {
    const h = await housing("null-obj");
    const contact = `cr-${run}-obj`;
    const a = `enr-${run}-obj`;
    await enroll({ id: a, contact, seq: h.seq, campaignId: h.camp1, enrolledAt: "2026-08-01T00:00:00Z" });
    await message({
      id: `msg-${run}-obj`,
      contact,
      provider: `prov-${run}-obj`,
      enrollmentId: a,
      campaignId: h.camp1,
      objectiveId: null,
      createdAt: "2026-08-02T00:00:00Z",
    });
    await click(`prov-${run}-obj`);
    if ((await campaignOf(a)) !== h.camp2) fail("null objective after enroll advances A", await campaignOf(a));
    console.log("ok  null objective id matches at or after enrolled_at");
  }

  {
    const h = await housing("early");
    const contact = `cr-${run}-early`;
    const a = `enr-${run}-early`;
    await enroll({ id: a, contact, seq: h.seq, campaignId: h.camp1, enrolledAt: "2026-08-10T00:00:00Z" });
    await message({
      id: `msg-${run}-early`,
      contact,
      provider: `prov-${run}-early`,
      enrollmentId: a,
      campaignId: h.camp1,
      objectiveId: null,
      createdAt: "2026-08-01T00:00:00Z",
    });
    await click(`prov-${run}-early`);
    if ((await campaignOf(a)) !== h.camp1) fail("early null objective must not advance", await campaignOf(a));
    console.log("ok  null objective id before enrolled_at does not match");
  }

  {
    const h = await housing("nocamp");
    const contact = `cr-${run}-nocamp`;
    const a = `enr-${run}-nocamp`;
    await enroll({ id: a, contact, seq: h.seq, campaignId: null, enrolledAt: "2026-08-01T00:00:00Z" });
    await message({
      id: `msg-${run}-nocamp`,
      contact,
      provider: `prov-${run}-nocamp`,
      enrollmentId: a,
      campaignId: null,
      objectiveId: h.obj,
      createdAt: "2026-08-02T00:00:00Z",
    });
    await click(`prov-${run}-nocamp`);
    if ((await campaignOf(a)) !== null) fail("null campaign_id must not advance", await campaignOf(a));
    console.log("ok  null campaign_id does not advance");
  }

  console.log("\nClick attribution PASSED");
} finally {
  try {
    await cleanup();
  } catch (error) {
    console.error("cleanup", error);
  }
  await pool.end();
}

if (process.exitCode) process.exit(process.exitCode);
