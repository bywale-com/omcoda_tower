/**
 * PKT-016 against migrated Postgres and the stand-in halt store.
 *
 * A contact halt denies dispatchEmail and dispatchSms only when
 * halt_records.firm_id is the send firm. The contact check reads the
 * same firm. A missing address still returns before that gate.
 *
 * Ship CI runs this after migrate and seed, beside verify-click-attribution.
 */
import { randomUUID } from "node:crypto";
import type { Context } from "hono";
import { clearStandInHalts, standInHaltStore } from "../src/app/wire/standins/haltStore.ts";
import { actuateChannelSend } from "../server/wire-service/cascade.ts";
import { getPool } from "../server/wire-service/db.ts";
import { dispatchEmail, dispatchSms, type DispatchResult } from "../server/wire-service/dispatchSend.ts";
import { handleHaltIsContact } from "../server/wire-service/stores.ts";

delete process.env.RESEND_API_KEY;
delete process.env.RESEND_WEBHOOK_SECRET;
delete process.env.TWILIO_ACCOUNT_SID;
delete process.env.TWILIO_AUTH_TOKEN;
delete process.env.TWILIO_FROM_NUMBER;
delete process.env.TWILIO_PHONE_NUMBER;
delete process.env.SEND_MODE;
delete process.env.SEND_TEST_COHORT;
delete process.env.TEST_EMAIL_TO;
delete process.env.TEST_SMS_TO;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const pool = getPool();
const token = randomUUID().slice(0, 8);
const firmA = `firm-pkt016-a-${token}`;
const firmB = `firm-pkt016-b-${token}`;
const contact = `cr-pkt016-${token}`;
const firms = [firmA, firmB];

type HaltBody = { halted?: boolean };

function fail(name: string, detail?: unknown): never {
  console.error(`fail ${name}`, detail ?? "");
  throw new Error(name);
}

function isDeny(result: DispatchResult): boolean {
  return result.ok === false && result.deny === "policy" && result.detail === "halt active";
}

function isDry(result: DispatchResult): boolean {
  return result.ok === true && result.dryRun === true && result.reason.includes("SEND_MODE/cohort gate");
}

async function assertNoOutbound() {
  const row = await pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM outbound_messages WHERE firm_id = ANY($1::text[])`,
    [firms],
  );
  if ((row.rows[0]?.n ?? 0) !== 0) fail("outbound", row.rows);
}

async function email(firmId: string, purpose: string, withContact: boolean): Promise<DispatchResult> {
  const result = await dispatchEmail({
    to: "pkt016@example.com",
    subject: "pkt016",
    bodyText: "pkt016",
    firmId,
    ...(withContact ? { contactId: contact } : {}),
    purpose,
  });
  await assertNoOutbound();
  return result;
}

async function sms(firmId: string, withContact: boolean): Promise<DispatchResult> {
  const result = await dispatchSms({
    to: "+15555550116",
    body: "pkt016",
    firmId,
    ...(withContact ? { contactId: contact } : {}),
    purpose: "cem",
  });
  await assertNoOutbound();
  return result;
}

async function insertHalt(id: string, scope: "contact" | "firm-book", firmId: string, contactId: string | null) {
  await pool.query(
    `INSERT INTO halt_records (id, consultant_id, contact_id, firm_id, scope)
     VALUES ($1, 'pkt016', $2, $3, $4)`,
    [id, contactId, firmId, scope],
  );
}

async function clearHalts() {
  await pool.query(
    `DELETE FROM halt_records WHERE firm_id = ANY($1::text[]) OR contact_id = $2`,
    [firms, contact],
  );
}

function haltContext(contactId: string, firmId?: string) {
  return {
    req: {
      param: (name: string) => (name === "contactId" ? contactId : ""),
      query: (name: string) => (name === "firmId" ? firmId : undefined),
    },
    json: (body: unknown, status = 200) => ({ body, status }),
  };
}

async function probe(firmId?: string): Promise<HaltBody> {
  const result = (await handleHaltIsContact(haltContext(contact, firmId) as unknown as Context)) as {
    body: HaltBody;
    status: number;
  };
  if (typeof result.body?.halted !== "boolean") fail("case5-body", result);
  return result.body;
}

async function cleanup() {
  clearStandInHalts();
  await pool.query(
    `DELETE FROM outbound_messages WHERE firm_id = ANY($1::text[]) OR contact_id = $2`,
    [firms, contact],
  );
  await pool.query(
    `DELETE FROM messaging_events WHERE firm_id = ANY($1::text[]) OR contact_id = $2`,
    [firms, contact],
  );
  await pool.query(
    `DELETE FROM halt_records WHERE firm_id = ANY($1::text[]) OR contact_id = $2`,
    [firms, contact],
  );
  await pool.query(
    `DELETE FROM consent_records WHERE contact_id = $1 OR firm_id = ANY($2::text[])`,
    [contact, firms],
  );
  await pool.query(
    `DELETE FROM contact_records WHERE id = $1 OR firm_id = ANY($2::text[])`,
    [contact, firms],
  );
}

async function main() {
  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, phone) VALUES ($1, $2, NULL, NULL)`,
    [contact, firmA],
  );
  await pool.query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced) VALUES ($1, $2, 'express', false)`,
    [contact, firmA],
  );

  const haltA = `hr-pkt016-${token}-a`;
  await insertHalt(haltA, "contact", firmA, contact);
  if (!isDeny(await email(firmA, "cem", true))) fail("case1-email-a");
  if (!isDeny(await sms(firmA, true))) fail("case1-sms-a");

  await pool.query(`UPDATE halt_records SET lifted_at = now() WHERE id = $1`, [haltA]);
  const kept = await pool.query<{ lifted: boolean }>(
    `SELECT lifted_at IS NOT NULL AS lifted FROM halt_records WHERE id = $1`,
    [haltA],
  );
  if (!kept.rows[0]?.lifted) fail("case1-row-remains");
  await insertHalt(`hr-pkt016-${token}-b`, "contact", firmB, contact);
  if (!isDry(await email(firmA, "cem", true))) fail("case1-email-other");
  if (!isDeny(await email(firmB, "cem", true))) fail("case1-email-b");
  if (!isDry(await sms(firmA, true))) fail("case1-sms-other");
  if (!isDeny(await sms(firmB, true))) fail("case1-sms-b");
  if (!isDry(await email(firmA, "cem", true))) fail("case1-email-lifted");

  await clearHalts();
  await insertHalt(`hr-pkt016-${token}-book-a`, "firm-book", firmA, null);
  if (!isDeny(await email(firmA, "cem", false))) fail("case2-email-book");
  if (!isDeny(await sms(firmA, false))) fail("case2-sms-book");
  await clearHalts();
  await insertHalt(`hr-pkt016-${token}-book-b`, "firm-book", firmB, null);
  if (!isDry(await email(firmA, "cem", false))) fail("case2-email-other-book");
  if (!isDry(await sms(firmA, false))) fail("case2-sms-other-book");

  await clearHalts();
  await pool.query(`DELETE FROM consent_records WHERE contact_id = $1`, [contact]);
  await insertHalt(`hr-pkt016-${token}-optin`, "contact", firmA, contact);
  if (!isDeny(await email(firmA, "opt-in", true))) fail("case3-optin-deny");
  await insertHalt(`hr-pkt016-${token}-optin-2`, "contact", firmA, contact);
  if (!isDeny(await email(firmA, "opt-in", true))) fail("case3-two");
  const both = await pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM halt_records
     WHERE firm_id = $1 AND contact_id = $2 AND scope = 'contact' AND lifted_at IS NULL`,
    [firmA, contact],
  );
  if (both.rows[0]?.n !== 2) fail("case3-rows", both.rows);
  const unique = await pool.query(
    `SELECT 1 FROM pg_constraint WHERE conrelid = 'halt_records'::regclass AND contype = 'u'`,
  );
  if ((unique.rowCount ?? 0) !== 0) fail("case3-unique", unique.rows);
  await clearHalts();
  const open = await email(firmA, "opt-in", true);
  if (!isDry(open) || (open.ok === false && open.detail === "consent missing")) fail("case3-open", open);

  await insertHalt(`hr-pkt016-${token}-probe`, "contact", firmA, contact);
  if ((await probe(firmA)).halted !== true) fail("case5-true");
  if ((await probe(firmB)).halted !== false) fail("case5-other");
  if ((await probe()).halted !== false) fail("case5-missing");
  await pool.query(
    `UPDATE halt_records SET lifted_at = now() WHERE id = $1`,
    [`hr-pkt016-${token}-probe`],
  );
  if ((await probe(firmA)).halted !== false) fail("case5-lifted");
  await clearHalts();
  await insertHalt(`hr-pkt016-${token}-probe-book`, "firm-book", firmA, null);
  if ((await probe(firmA)).halted !== false) fail("case5-book");

  clearStandInHalts();
  const committed = await standInHaltStore.commit({
    consultantId: "pkt016",
    contactId: contact,
    firmId: firmA,
    scope: "contact",
  });
  if (!(await standInHaltStore.isContactHalted(contact, firmA))) fail("case6-a");
  if (await standInHaltStore.isContactHalted(contact, firmB)) fail("case6-b");
  if (await standInHaltStore.isContactHalted("cr-pkt016-other", firmA)) fail("case6-other");
  await standInHaltStore.lift(committed.id);
  if (await standInHaltStore.isContactHalted(contact, firmA)) fail("case6-lifted");
  await standInHaltStore.commit({
    consultantId: "pkt016",
    firmId: firmA,
    scope: "firm-book",
  });
  if (await standInHaltStore.isContactHalted(contact, firmA)) fail("case6-book");

  await clearHalts();
  await insertHalt(`hr-pkt016-${token}-address`, "contact", firmA, contact);
  const quiet = await actuateChannelSend({
    firmId: firmA,
    contactId: contact,
    channel: "email",
    purpose: "cem",
  });
  if (quiet.ok !== true || quiet.dryRun !== true || !quiet.reason.includes("no email on contact")) {
    fail("case7-address", quiet);
  }
  if (quiet.ok === false && quiet.detail === "halt active") fail("case7-deny", quiet);

  console.log("verify-halt-send-firm passed");
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
