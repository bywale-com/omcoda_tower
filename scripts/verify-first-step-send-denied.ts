/**
 * PKT-019 against migrated Postgres.
 *
 * A first step that returns ok: false appends send_denied.
 * Allowed results stay send_live and send_dry_run from the result.
 * enrollment.payload.dryRun stays !shouldLiveSend.
 * One empty-cells sequence_template makes sequence_id legal.
 *
 * Ship CI runs this after verify-send-denied-engagement.
 */
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { enrollAndActuate } from "../server/wire-service/cascade.ts";
import { getPool } from "../server/wire-service/db.ts";

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
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const token = randomUUID().slice(0, 8);
const firm = `firm-pkt019-${token}`;
const agentRef = `agt-pkt019-${token}`;
const contacts: string[] = [];

type SendBody = { ok?: boolean; deny?: string; detail?: string; dryRun?: boolean; reason?: string };
type Payload = Record<string, unknown> & { send?: SendBody };
type Eng = { id: string; event_kind: string; payload: Payload; firm_id: string; contact_id: string };
type EnrollResult = {
  enrollmentId: string;
  attemptId: string;
  dryRun: boolean;
  send?: SendBody;
  blocked?: string;
  engagementId?: string;
};

function fail(name: string, detail?: unknown): never {
  console.error(`fail ${name}`, detail ?? "");
  throw new Error(name);
}

function read(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

function sliceFn(source: string, start: string, end: string): string {
  const at = source.indexOf(start);
  if (at < 0) fail("slice", start);
  const to = source.indexOf(end, at + start.length);
  if (to <= at) fail("slice-end", end);
  return source.slice(at, to);
}

function objectAt(source: string, braceAt: number): string {
  let depth = 0;
  for (let i = braceAt; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    else if (source[i] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(braceAt, i + 1);
    }
  }
  fail("unbalanced");
}

function objectFor(source: string, kind: string): string {
  const at = source.indexOf(kind);
  if (at < 0) fail("object", kind);
  const brace = source.indexOf("{", at);
  if (brace < 0) fail("object-brace", kind);
  return objectAt(source, brace);
}

function asObject<T>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function absent(payload: Payload, keys: string[], name: string) {
  for (const key of keys) {
    if (key in payload) fail(name, { key, payload });
  }
}

function clearLive() {
  delete process.env.SEND_MODE;
  delete process.env.SEND_TEST_COHORT;
}

async function assertNoOutbound() {
  const result = await pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM outbound_messages WHERE firm_id = $1`,
    [firm],
  );
  if ((result.rows[0]?.n ?? 0) !== 0) fail("outbound", result.rows);
}

async function engs(contactId: string): Promise<Eng[]> {
  const result = await pool.query<Eng>(
    `SELECT id, event_kind, payload, firm_id, contact_id FROM engagement_records WHERE contact_id = $1`,
    [contactId],
  );
  return result.rows.map((item) => ({ ...item, payload: asObject(item.payload) }));
}

function kinds(rows: Eng[], kind: string): Eng[] {
  return rows.filter((item) => item.event_kind === kind);
}

async function enroll(suffix: string, input: {
  email?: string | null;
  phone?: string | null;
  consent?: { silenced: boolean; status?: string } | null;
  ownerChannel: string;
  purpose?: string;
  fireFirstStep?: boolean;
}): Promise<{ contactId: string; result: EnrollResult }> {
  const contactId = `cr-pkt019-${token}-${suffix}`;
  contacts.push(contactId);
  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, phone) VALUES ($1, $2, $3, $4)`,
    [contactId, firm, input.email ?? null, input.phone ?? null],
  );
  if (input.consent) {
    await pool.query(
      `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, status)
       VALUES ($1, $2, 'express', $3, $4)`,
      [contactId, firm, input.consent.silenced, input.consent.status ?? (input.consent.silenced ? "silenced" : "sequenced")],
    );
  }
  const result = await enrollAndActuate({
    firmId: firm,
    contactId,
    agentRef,
    ownerChannel: input.ownerChannel,
    ...(input.purpose ? { purpose: input.purpose } : {}),
    ...(input.fireFirstStep === undefined ? {} : { fireFirstStep: input.fireFirstStep }),
  }) as EnrollResult;
  await assertNoOutbound();
  return { contactId, result };
}

function assertNoEngagementId(result: EnrollResult, engId?: string) {
  const record = result as EnrollResult & Record<string, unknown>;
  if ("engagementId" in record) fail("engagement-key", result);
  for (const value of Object.values(record)) {
    if (typeof value === "string" && (value === engId || value.startsWith("eng-"))) fail("engagement-value", result);
  }
}

function assertStep(payload: Payload, channel: string, name: string) {
  if (payload.channel !== channel) fail(`${name}-channel`, payload);
  if (payload.templateId !== agentRef || payload.cellIndex !== 0) fail(`${name}-step`, payload);
  if ("cellId" in payload) fail(`${name}-cell`, payload);
  if (typeof payload.enrollmentId !== "string" || typeof payload.attemptId !== "string") fail(`${name}-ids`, payload);
}

async function enrollmentOf(id: string): Promise<{ sequence_id: string; dryRun: boolean; cellId: unknown }> {
  const result = await pool.query<{ sequence_id: string; payload: { dryRun?: boolean; cellId?: unknown } | string }>(
    `SELECT sequence_id, payload FROM enrollment WHERE id = $1`,
    [id],
  );
  const row = result.rows[0];
  if (!row) fail("enrollment-missing", id);
  const payload = asObject(row.payload);
  if (typeof payload.dryRun !== "boolean") fail("enrollment-dry", payload);
  if (payload.cellId !== null) fail("enrollment-cell", payload);
  if (row.sequence_id !== agentRef) fail("enrollment-sequence", row.sequence_id);
  return { sequence_id: row.sequence_id, dryRun: payload.dryRun, cellId: payload.cellId };
}

async function attemptOf(id: string): Promise<{ status: string; owner_channel: string; state: { delivered?: boolean } }> {
  const result = await pool.query<{ status: string; owner_channel: string; state: { delivered?: boolean } | string }>(
    `SELECT status, owner_channel, state FROM active_attempts WHERE id = $1`,
    [id],
  );
  const row = result.rows[0];
  if (!row) fail("attempt-missing", id);
  return { status: row.status, owner_channel: row.owner_channel, state: asObject(row.state) };
}

function assertShape() {
  const cascade = read("server/wire-service/cascade.ts");
  const enrollFn = sliceFn(cascade, "export async function enrollAndActuate", "export async function advanceTemplateCellIfDue");
  const slice = sliceFn(enrollFn, "send = await actuateChannelSend", "dryRun: !live");
  for (const bit of ['"send_denied"', '"send_live"', '"send_dry_run"', "send.ok && !send.dryRun", "send.ok && send.dryRun"]) {
    if (!slice.includes(bit)) fail("slice-bit", bit);
  }
  if (slice.includes('live ? "send_live" : "send_dry_run"') || slice.includes("send.detail") || slice.includes("send.deny")) {
    fail("slice-banned");
  }
  if ((slice.match(/writeEngagement/g) ?? []).length !== 3) fail("slice-writes");
  const denied = objectFor(slice, '"send_denied"');
  for (const key of ["enrollmentId", "attemptId", "channel", "templateId", "cellId", "cellIndex", "send"]) {
    if (!denied.includes(key)) fail("denied-key", key);
  }
  for (const banned of ["subject", "bodyText", "bodyHtml", "messageId", "reason"]) {
    if (denied.includes(banned)) fail("denied-banned", banned);
  }
  const live = objectFor(slice, '"send_live"');
  for (const key of ["messageId", "subject", "bodyText", "send", "enrollmentId", "attemptId", "channel", "templateId", "cellId", "cellIndex"]) {
    if (!live.includes(key)) fail("live-key", key);
  }
  const dry = objectFor(slice, '"send_dry_run"');
  for (const key of ["reason", "subject", "bodyText", "send", "enrollmentId", "attemptId", "channel", "templateId", "cellId", "cellIndex"]) {
    if (!dry.includes(key)) fail("dry-key", key);
  }
  if (!enrollFn.includes('purpose: input.purpose ?? "opt-in"') || !enrollFn.includes("subject") || !enrollFn.includes("bodyText")) {
    fail("call-shape");
  }
  if (!enrollFn.includes("const live = shouldLiveSend(input.contactId)") || !enrollFn.includes("dryRun: !live")) fail("live-flag");
  if (!enrollFn.includes("if (input.fireFirstStep !== false)") || !enrollFn.includes("INSERT INTO enrollment")) fail("guard");
  if (!enrollFn.includes('blocked: "halt"')) fail("halt-return");
  const projection = read("src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts");
  const title = sliceFn(projection, "function titleFor", "function waitMsFrom");
  if (title.includes('case "send_denied"')) fail("title");
  const kind = sliceFn(projection, "function kindOf", "function titleFor");
  if (!kind.includes('eventKind === "send_live" || eventKind === "send_dry_run"')) fail("kindOf");
  const prose = sliceFn(read("src/app/register/prototype-ant/operator/channelRuleGrain.ts"), "export function eventKindProse", "export function");
  if (!prose.includes('kind.includes("send")') || !prose.includes('return "Sent"') || prose.includes("send_denied")) fail("prose");
  const inbound = sliceFn(cascade, "async function hasInboundOverride", "function clockAnchor");
  const list = inbound.slice(inbound.indexOf("event_kind IN"), inbound.indexOf(")", inbound.indexOf("event_kind IN")));
  if (list.includes("send_denied")) fail("inbound");
  const callAgent = sliceFn(read("server/wire-service/workflowWalk.ts"), 'if (actionType === "call_agent")', "enrolled += 1");
  if (!callAgent.includes("enrollments.push(result.enrollmentId)") || callAgent.includes("result.engagementId")) fail("call-agent");
}

async function assertFixture() {
  const template = await pool.query<{ cells: unknown }>(
    `SELECT cells FROM sequence_template WHERE id = $1`,
    [agentRef],
  );
  const cells = template.rows[0]?.cells;
  const list = typeof cells === "string" ? JSON.parse(cells) : cells;
  if (!Array.isArray(list) || list.length !== 0) fail("template-cells", cells);
  const campaign = await pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM campaign WHERE sequence_id = $1`,
    [agentRef],
  );
  if ((campaign.rows[0]?.n ?? 0) !== 0) fail("campaign");
  const binding = await pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM firm_sequence_binding WHERE firm_id = $1 AND template_id = $2`,
    [firm, agentRef],
  );
  if ((binding.rows[0]?.n ?? 0) !== 0) fail("binding");
}

async function main() {
  assertShape();
  await pool.query(
    `INSERT INTO sequence_template (id, sequence_class, variant, label, cells)
     VALUES ($1, 'optin', 'v1', $2, '[]'::jsonb)`,
    [agentRef, `pkt019 ${token}`],
  );
  await assertFixture();

  const silenced = { silenced: true, status: "silenced" };
  const open = { silenced: false, status: "sequenced" };

  const first = await enroll("1", { email: `pkt019-${token}@example.com`, consent: silenced, ownerChannel: "email" });
  const rows1 = await engs(first.contactId);
  const denied1 = kinds(rows1, "send_denied");
  if (denied1.length !== 1 || kinds(rows1, "send_live").length || kinds(rows1, "send_dry_run").length) fail("case1-kind", rows1);
  const row1 = denied1[0];
  if (!row1.id.startsWith("eng-") || row1.firm_id !== firm || row1.contact_id !== first.contactId) fail("case1-id", row1);
  const send1 = row1.payload.send;
  if (!send1 || send1.ok !== false || send1.deny !== "policy" || send1.detail !== "silenced" || "dryRun" in send1) fail("case1-send", send1);
  assertStep(row1.payload, "email", "case1");
  absent(row1.payload, ["subject", "bodyText", "bodyHtml", "messageId", "reason", "cellId"], "case1-payload");
  const enrolled1 = await enrollmentOf(first.result.enrollmentId);
  if (enrolled1.dryRun !== true || first.result.dryRun !== true) fail("case1-dry", { enrolled1, result: first.result });
  assertNoEngagementId(first.result, row1.id);
  const attempt1 = await attemptOf(first.result.attemptId);
  if (attempt1.status !== "open" || attempt1.state.delivered !== true || attempt1.owner_channel !== "email") fail("case1-attempt", attempt1);

  const second = await enroll("2", { email: `pkt019-${token}-2@example.com`, consent: null, ownerChannel: "email", purpose: "cem" });
  const rows2 = await engs(second.contactId);
  const denied2 = kinds(rows2, "send_denied");
  if (denied2.length !== 1 || kinds(rows2, "send_live").length || kinds(rows2, "send_dry_run").length) fail("case2-kind", rows2);
  if (denied2[0].payload.send?.detail !== "consent missing") fail("case2-detail", denied2[0].payload);
  assertStep(denied2[0].payload, "email", "case2");
  absent(denied2[0].payload, ["subject", "bodyText", "bodyHtml", "messageId", "reason", "cellId"], "case2-payload");

  process.env.SEND_MODE = "live";
  process.env.SEND_TEST_COHORT = `cr-pkt019-${token}-3`;
  try {
    const third = await enroll("3", { email: `pkt019-${token}-3@example.com`, consent: silenced, ownerChannel: "email", purpose: "opt-in" });
    const rows3 = await engs(third.contactId);
    if (kinds(rows3, "send_denied").length !== 1 || kinds(rows3, "send_live").length || kinds(rows3, "send_dry_run").length) fail("case3-kind", rows3);
    const enrolled3 = await enrollmentOf(third.result.enrollmentId);
    if (enrolled3.dryRun !== false || third.result.dryRun !== false || third.result.send?.ok !== false) fail("case3-dry", third.result);
    absent(kinds(rows3, "send_denied")[0].payload, ["subject", "bodyText"], "case3-payload");
  } finally {
    clearLive();
  }

  process.env.SEND_MODE = "live";
  process.env.SEND_TEST_COHORT = `cr-pkt019-${token}-4`;
  try {
    const fourth = await enroll("4", { email: `pkt019-${token}-4@example.com`, consent: open, ownerChannel: "email", purpose: "opt-in" });
    const rows4 = await engs(fourth.contactId);
    const denied4 = kinds(rows4, "send_denied");
    if (denied4.length !== 1 || kinds(rows4, "send_live").length || kinds(rows4, "send_dry_run").length) fail("case4-kind", rows4);
    const send4 = denied4[0].payload.send;
    if (!send4 || send4.ok !== false || send4.deny !== "policy" || send4.detail !== "RESEND_API_KEY missing" || send4.dryRun !== false) {
      fail("case4-send", send4);
    }
    absent(denied4[0].payload, ["subject", "bodyText", "bodyHtml", "messageId", "reason"], "case4-payload");
    const enrolled4 = await enrollmentOf(fourth.result.enrollmentId);
    if (enrolled4.dryRun !== false) fail("case4-dry", enrolled4);
  } finally {
    clearLive();
  }

  const fifth = await enroll("5", { email: `pkt019-${token}-5@example.com`, consent: open, ownerChannel: "email" });
  const rows5 = await engs(fifth.contactId);
  const dry5 = kinds(rows5, "send_dry_run");
  if (dry5.length !== 1 || kinds(rows5, "send_denied").length) fail("case5-kind", rows5);
  const send5 = dry5[0].payload.send;
  if (!send5 || send5.ok !== true || send5.dryRun !== true || dry5[0].payload.reason !== "SEND_MODE/cohort gate — fail closed") {
    fail("case5-reason", dry5[0].payload);
  }
  if (typeof dry5[0].payload.subject !== "string" || typeof dry5[0].payload.bodyText !== "string" || !dry5[0].payload.send) fail("case5-copy", dry5[0].payload);
  if (dry5[0].payload.subject !== `Tower — ${agentRef}` || dry5[0].payload.bodyText !== `Sequence start via ${agentRef}`) fail("case5-fallback", dry5[0].payload);
  assertStep(dry5[0].payload, "email", "case5");
  absent(dry5[0].payload, ["messageId", "cellId"], "case5-payload");
  const enrolled5 = await enrollmentOf(fifth.result.enrollmentId);
  if (enrolled5.dryRun !== true) fail("case5-dry", enrolled5);

  process.env.SEND_MODE = "live";
  process.env.SEND_TEST_COHORT = `cr-pkt019-${token}-6`;
  try {
    const sixth = await enroll("6", { email: null, phone: null, consent: open, ownerChannel: "email" });
    const rows6 = await engs(sixth.contactId);
    const dry6 = kinds(rows6, "send_dry_run");
    if (dry6.length !== 1 || kinds(rows6, "send_denied").length || kinds(rows6, "send_live").length) fail("case6-kind", rows6);
    if (dry6[0].payload.reason !== "no email on contact — dry-run intent only") fail("case6-reason", dry6[0].payload);
    assertStep(dry6[0].payload, "email", "case6");
    if (typeof dry6[0].payload.subject !== "string" || typeof dry6[0].payload.bodyText !== "string" || !dry6[0].payload.send) fail("case6-copy", dry6[0].payload);
    const enrolled6 = await enrollmentOf(sixth.result.enrollmentId);
    if (enrolled6.dryRun !== false || sixth.result.dryRun !== false) fail("case6-dry", sixth.result);
  } finally {
    clearLive();
  }

  const seventh = await enroll("7", { email: `pkt019-${token}-7@example.com`, consent: open, ownerChannel: "call" });
  const rows7 = await engs(seventh.contactId);
  const dry7 = kinds(rows7, "send_dry_run");
  if (dry7.length !== 1 || kinds(rows7, "send_denied").length) fail("case7-kind", rows7);
  const send7 = dry7[0].payload.send;
  if (!send7 || send7.ok !== true || send7.dryRun !== true || typeof send7.reason !== "string" || !send7.reason.includes("no live dispatcher")) {
    fail("case7-send", send7);
  }
  assertStep(dry7[0].payload, "call", "case7");

  const eighth = await enroll("8", { email: `pkt019-${token}-8@example.com`, consent: open, ownerChannel: "email", fireFirstStep: false });
  const rows8 = await engs(eighth.contactId);
  if (rows8.length !== 0) fail("case8-kind", rows8);
  const enrolled8 = await enrollmentOf(eighth.result.enrollmentId);
  if (enrolled8.sequence_id !== agentRef) fail("case8-sequence", enrolled8);
  const attempt8 = await attemptOf(eighth.result.attemptId);
  if (attempt8.status !== "open" || eighth.result.send !== undefined || eighth.result.dryRun !== true) fail("case8-return", eighth.result);

  await pool.query(
    `INSERT INTO halt_records (id, consultant_id, contact_id, firm_id, scope)
     VALUES ($1, 'pkt019', NULL, $2, 'firm-book')`,
    [`hr-pkt019-${token}-book`, firm],
  );
  const ninth = await enroll("9", { email: `pkt019-${token}-9@example.com`, ownerChannel: "email" });
  if (ninth.result.blocked !== "halt" || ninth.result.enrollmentId !== "") fail("case9-return", ninth.result);
  const leftover = await pool.query<{ n: number }>(
    `SELECT
       (SELECT count(*) FROM enrollment WHERE contact_id = $1)
       + (SELECT count(*) FROM active_attempts WHERE contact_id = $1)
       + (SELECT count(*) FROM engagement_records WHERE contact_id = $1) AS n`,
    [ninth.contactId],
  );
  if (Number(leftover.rows[0]?.n ?? 0) !== 0) fail("case9-rows", leftover.rows);
  await assertFixture();

  console.log("verify-first-step-send-denied passed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const ids = contacts.length ? contacts : ["__none__"];
    await pool.query(`DELETE FROM engagement_records WHERE firm_id = $1 OR contact_id = ANY($2::text[])`, [firm, ids]);
    await pool.query(`DELETE FROM active_attempts WHERE firm_id = $1 OR contact_id = ANY($2::text[])`, [firm, ids]);
    await pool.query(`DELETE FROM enrollment WHERE firm_id = $1 OR contact_id = ANY($2::text[])`, [firm, ids]);
    await pool.query(`DELETE FROM halt_records WHERE firm_id = $1`, [firm]);
    await pool.query(`DELETE FROM consent_records WHERE firm_id = $1 OR contact_id = ANY($2::text[])`, [firm, ids]);
    await pool.query(`DELETE FROM contact_records WHERE firm_id = $1 OR id = ANY($2::text[])`, [firm, ids]);
    await pool.query(`DELETE FROM messaging_events WHERE firm_id = $1`, [firm]);
    await pool.query(`DELETE FROM outbound_messages WHERE firm_id = $1`, [firm]);
    await pool.query(`DELETE FROM sequence_template WHERE id = $1`, [agentRef]);
    await pool.end();
  });
