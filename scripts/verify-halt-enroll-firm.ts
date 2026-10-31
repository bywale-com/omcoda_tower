/**
 * PKT-015 against migrated Postgres.
 *
 * A contact halt blocks isHaltBlockingNew only when halt_records.firm_id
 * is the enroll firm. A lifted row does not block. A firm-book halt still
 * blocks that firm with no contact predicate. enrollAndActuate returns
 * blocked "halt" before insert, and an allowed enroll still reaches the
 * unscoped send gate.
 *
 * Ship CI runs this after migrate and seed, beside verify-click-attribution.
 */
import { randomUUID } from "node:crypto";
import { enrollAndActuate } from "../server/wire-service/cascade.ts";
import { getPool } from "../server/wire-service/db.ts";
import { isHaltBlockingNew } from "../server/wire-service/dispatchSend.ts";

delete process.env.RESEND_API_KEY;
delete process.env.RESEND_WEBHOOK_SECRET;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const pool = getPool();
const token = randomUUID().slice(0, 8);
const firmA = `firm-pkt015-a-${token}`;
const firmB = `firm-pkt015-b-${token}`;
const contact = `cr-pkt015-${token}`;
const firms = [firmA, firmB];
const sequenceId = "tpl.optin_launch.v1";

type EnrollResult = {
  enrollmentId: string;
  blocked?: string;
  send?: { ok: boolean; detail?: string; dryRun?: boolean; reason?: string };
};

function fail(name: string, detail?: unknown): never {
  console.error(`fail ${name}`, detail ?? "");
  throw new Error(name);
}

async function clearHalts() {
  await pool.query(
    `DELETE FROM halt_records WHERE firm_id = ANY($1::text[]) OR contact_id = $2`,
    [firms, contact],
  );
}

async function insertHalt(id: string, scope: "contact" | "firm-book", firmId: string, contactId: string | null) {
  await pool.query(
    `INSERT INTO halt_records (id, consultant_id, contact_id, firm_id, scope)
     VALUES ($1, 'pkt015', $2, $3, $4)`,
    [id, contactId, firmId, scope],
  );
}

async function enrollmentCount(): Promise<number> {
  const row = await pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM enrollment WHERE firm_id = $1 AND contact_id = $2`,
    [firmA, contact],
  );
  return row.rows[0]?.n ?? 0;
}

async function enrollmentIds(): Promise<string[]> {
  const row = await pool.query<{ id: string }>(
    `SELECT id FROM enrollment WHERE firm_id = $1 AND contact_id = $2 ORDER BY enrolled_at, id`,
    [firmA, contact],
  );
  return row.rows.map((item) => item.id);
}

async function enroll(): Promise<EnrollResult> {
  return enrollAndActuate({
    firmId: firmA,
    contactId: contact,
    agentRef: sequenceId,
    sequenceId,
    purpose: "opt-in",
    ownerChannel: "email",
    fireFirstStep: true,
  }) as Promise<EnrollResult>;
}

async function cleanup() {
  await pool.query(
    `DELETE FROM engagement_records WHERE firm_id = ANY($1::text[]) OR contact_id = $2`,
    [firms, contact],
  );
  await pool.query(
    `DELETE FROM active_attempts WHERE firm_id = ANY($1::text[]) OR contact_id = $2`,
    [firms, contact],
  );
  await pool.query(
    `DELETE FROM enrollment WHERE firm_id = ANY($1::text[]) OR contact_id = $2`,
    [firms, contact],
  );
  await pool.query(
    `DELETE FROM halt_records WHERE firm_id = ANY($1::text[]) OR contact_id = $2`,
    [firms, contact],
  );
  await pool.query(
    `DELETE FROM contact_records WHERE id = $1 OR firm_id = ANY($2::text[])`,
    [contact, firms],
  );
}

async function main() {
  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email) VALUES ($1, $2, 'pkt015@example.com')`,
    [contact, firmA],
  );

  const haltA = `hr-pkt015-${token}-a`;
  await insertHalt(haltA, "contact", firmA, contact);
  if (!(await isHaltBlockingNew(firmA, contact))) fail("case1-firm-a");

  await pool.query(`UPDATE halt_records SET lifted_at = now() WHERE id = $1`, [haltA]);
  const kept = await pool.query<{ lifted: boolean }>(
    `SELECT lifted_at IS NOT NULL AS lifted FROM halt_records WHERE id = $1`,
    [haltA],
  );
  if (!kept.rows[0]?.lifted) fail("case1-row-remains", kept.rows);
  await insertHalt(`hr-pkt015-${token}-b`, "contact", firmB, contact);
  if (await isHaltBlockingNew(firmA, contact)) fail("case1-other-firm");
  if (!(await isHaltBlockingNew(firmB, contact))) fail("case1-firm-b");
  if (await isHaltBlockingNew(firmA, contact)) fail("case1-lifted");

  await clearHalts();
  await insertHalt(`hr-pkt015-${token}-book-a`, "firm-book", firmA, null);
  if (!(await isHaltBlockingNew(firmA, contact))) fail("case2-book-a");
  if (!(await isHaltBlockingNew(firmA, "cr-pkt015-other"))) fail("case2-other-contact");
  await clearHalts();
  await insertHalt(`hr-pkt015-${token}-book-b`, "firm-book", firmB, null);
  if (await isHaltBlockingNew(firmA, contact)) fail("case2-book-b");

  await clearHalts();
  await insertHalt(`hr-pkt015-${token}-contact-only`, "contact", firmA, contact);
  if (await isHaltBlockingNew(firmA)) fail("case3-omitted");
  await insertHalt(`hr-pkt015-${token}-book-with`, "firm-book", firmA, null);
  if (!(await isHaltBlockingNew(firmA))) fail("case3-book");

  await clearHalts();
  await insertHalt(`hr-pkt015-${token}-one`, "contact", firmA, contact);
  await insertHalt(`hr-pkt015-${token}-two`, "contact", firmA, contact);
  if (!(await isHaltBlockingNew(firmA, contact))) fail("case4-block");
  const both = await pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM halt_records
     WHERE firm_id = $1 AND contact_id = $2 AND scope = 'contact' AND lifted_at IS NULL`,
    [firmA, contact],
  );
  if (both.rows[0]?.n !== 2) fail("case4-rows", both.rows);
  const unique = await pool.query(
    `SELECT 1 FROM pg_constraint WHERE conrelid = 'halt_records'::regclass AND contype = 'u'`,
  );
  if ((unique.rowCount ?? 0) !== 0) fail("case4-unique", unique.rows);

  await clearHalts();
  const priorEnrollment = `enr-pkt015-${token}-prior`;
  const priorAttempt = `att-pkt015-${token}-prior`;
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, payload)
     VALUES ($1, $2, $3, $4, $4, '{}'::jsonb)`,
    [priorEnrollment, firmA, contact, sequenceId],
  );
  await pool.query(
    `INSERT INTO active_attempts
       (id, firm_id, contact_id, enrollment_id, owner_channel, status, state, window_started_at, fired_criteria)
     VALUES ($1, $2, $3, $4, 'email', 'open', '{}'::jsonb, now(), '{}'::jsonb)`,
    [priorAttempt, firmA, contact, priorEnrollment],
  );
  await insertHalt(`hr-pkt015-${token}-block`, "contact", firmA, contact);
  const blocked = await enroll();
  if (blocked.blocked !== "halt" || blocked.enrollmentId !== "") fail("case5-blocked", blocked);
  if ((await enrollmentCount()) !== 1) fail("case5-count-held", await enrollmentCount());
  const attempt = await pool.query<{ status: string; enrollment_id: string }>(
    `SELECT status, enrollment_id FROM active_attempts WHERE id = $1`,
    [priorAttempt],
  );
  if (attempt.rows[0]?.status !== "open" || attempt.rows[0]?.enrollment_id !== priorEnrollment) {
    fail("case5-attempt", attempt.rows);
  }

  await clearHalts();
  await insertHalt(`hr-pkt015-${token}-cross`, "contact", firmB, contact);
  const beforeCross = await enrollmentIds();
  const crossed = await enroll();
  if (crossed.blocked === "halt") fail("case5-cross-blocked", crossed);
  const afterCross = await enrollmentIds();
  const addedCross = afterCross.filter((id) => !beforeCross.includes(id));
  if (addedCross.length !== 1) fail("case5-cross-insert", { beforeCross, afterCross });
  if (!crossed.send || crossed.send.ok !== false || crossed.send.detail !== "halt active") {
    fail("case5-send-deny", crossed.send);
  }
  if (!(await enrollmentIds()).includes(addedCross[0])) fail("case5-row-remains");

  await clearHalts();
  const beforeOpen = await enrollmentIds();
  const opened = await enroll();
  if (opened.blocked === "halt") fail("case5-open-blocked", opened);
  const afterOpen = await enrollmentIds();
  const addedOpen = afterOpen.filter((id) => !beforeOpen.includes(id));
  if (addedOpen.length !== 1) fail("case5-open-insert", { beforeOpen, afterOpen });
  if (!opened.send || opened.send.dryRun !== true || !opened.send.reason?.includes("SEND_MODE/cohort gate")) {
    fail("case5-dry-run", opened.send);
  }

  console.log("verify-halt-enroll-firm passed");
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
