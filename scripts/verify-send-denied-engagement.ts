/**
 * PKT-018 against migrated Postgres.
 *
 * A tick send that returns ok: false appends send_denied.
 * send_live and send_dry_run stay the allowed results.
 * The attempt stays open. window_fired and cell_advanced stay.
 *
 * Ship CI runs this after migrate and seed, beside verify-click-attribution.
 */
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  advanceTemplateCellIfDue,
  escalateAttemptWindow,
  type ActiveAttemptRow,
  type CriteriaRow,
  type TickFire,
} from "../server/wire-service/cascade.ts";
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
const firm = `firm-pkt018-${token}`;
const contact = `cr-pkt018-${token}`;
const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const emailTemplate = `tpl-pkt018-email-${token}`;
const formTemplate = `tpl-pkt018-form-${token}`;
const waitTemplate = `tpl-pkt018-wait-${token}`;
const campaignId = `camp-pkt018-${token}`;
const waitEnrollment = `enr-pkt018-wait-${token}`;
const templates = [emailTemplate, formTemplate, waitTemplate];

type SendBody = { ok?: boolean; deny?: string; detail?: string; dryRun?: boolean; reason?: string };
type Payload = Record<string, unknown> & { send?: SendBody };
type Eng = { id: string; event_kind: string; payload: Payload; firm_id: string; contact_id: string };
type AttemptStored = {
  status: string;
  fired_criteria: Record<string, string> | string;
  state: Record<string, unknown> | string;
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

function bareSend(text: string): boolean {
  if (text.includes("send,")) return true;
  return text.split("\n").some((line) => line.trim() === "send");
}

function asObject<T>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function absent(payload: Payload, keys: string[], name: string) {
  for (const key of keys) {
    if (key in payload) fail(name, { key, payload });
  }
}

function criteria(id: string, setValue: string): CriteriaRow {
  return {
    id,
    label: `Pkt 018 ${id}`,
    enabled: true,
    when_clause: null,
    condition_clause: null,
    set_value: setValue,
    threshold: null,
    threshold_unit: null,
    channel_token: null,
  };
}

function cells(second: "email" | "form") {
  return [
    { id: "c0", label: "First", token: "c0", channel: "email", offsetMinutes: 0, subject: "first subject", bodyText: "first body" },
    { id: "c1", label: "Second", token: "c1", channel: second, offsetMinutes: 0, subject: "second subject", bodyText: "second body" },
  ];
}

async function insertAttempt(row: ActiveAttemptRow) {
  await pool.query(
    `INSERT INTO active_attempts
       (id, firm_id, contact_id, enrollment_id, owner_channel, status, state, window_started_at, fired_criteria)
     VALUES ($1,$2,$3,$4,$5,'open',$6::jsonb,$7::timestamptz,'{}'::jsonb)`,
    [
      row.id,
      row.firm_id,
      row.contact_id,
      row.enrollment_id,
      row.owner_channel,
      JSON.stringify(row.state ?? {}),
      row.window_started_at,
    ],
  );
}

function row(id: string, extra: Partial<ActiveAttemptRow> = {}): ActiveAttemptRow {
  return {
    id,
    firm_id: firm,
    contact_id: contact,
    enrollment_id: null,
    owner_channel: "email",
    status: "open",
    state: {},
    window_started_at: past,
    fired_criteria: {},
    created_at: past,
    ...extra,
  };
}

async function engs(attemptId: string): Promise<Eng[]> {
  const result = await pool.query<Eng>(
    `SELECT id, event_kind, payload, firm_id, contact_id
     FROM engagement_records
     WHERE firm_id = $1 AND contact_id = $2 AND payload->>'attemptId' = $3`,
    [firm, contact, attemptId],
  );
  return result.rows.map((item) => ({ ...item, payload: asObject(item.payload) }));
}

async function stored(attemptId: string): Promise<AttemptStored> {
  const result = await pool.query<AttemptStored>(
    `SELECT status, fired_criteria, state FROM active_attempts WHERE id = $1`,
    [attemptId],
  );
  const item = result.rows[0];
  if (!item) fail("attempt-missing", attemptId);
  return {
    status: item.status,
    fired_criteria: asObject(item.fired_criteria),
    state: asObject(item.state),
  };
}

async function assertNoOutbound() {
  const result = await pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM outbound_messages WHERE firm_id = $1`,
    [firm],
  );
  if ((result.rows[0]?.n ?? 0) !== 0) fail("outbound", result.rows);
}

function kinds(rows: Eng[], kind: string): Eng[] {
  return rows.filter((item) => item.event_kind === kind);
}

function assertDeny(payload: Payload, detail: string, name: string) {
  const send = payload.send;
  if (!send || send.ok !== false || send.deny !== "policy" || send.detail !== detail) fail(name, payload);
  absent(payload, ["subject", "bodyText", "bodyHtml", "messageId", "reason"], name);
}

async function escalate(attempt: ActiveAttemptRow, rule: CriteriaRow): Promise<TickFire> {
  await insertAttempt(attempt);
  const fire = await escalateAttemptWindow(pool, attempt, rule, ["email"], new Date(), 0);
  if (!fire) fail("escalate-null", attempt.id);
  await assertNoOutbound();
  return fire;
}

function assertShape() {
  const cascade = read("server/wire-service/cascade.ts");
  const advance = sliceFn(cascade, "export async function advanceTemplateCellIfDue", "async function loadTemplateCellsCached");
  if (advance.includes("shouldLiveSend") || advance.includes("const live")) fail("case5-live");
  if (!advance.includes('"send_denied"') || !advance.includes("send.ok && !send.dryRun") || !advance.includes("send.ok && send.dryRun")) {
    fail("case5-kind");
  }
  for (const body of [
    sliceFn(cascade, "export async function escalateAttemptWindow", "export type ChannelSendInput"),
    advance,
    cascade.slice(cascade.indexOf("export async function tickOnce")),
  ]) {
    for (const bit of ["firmId: attempt.firm_id", "contactId: attempt.contact_id", 'purpose: "cem"']) {
      if (!body.includes(bit)) fail("case5-call", bit);
    }
  }

  const tick = cascade.slice(cascade.indexOf("export async function tickOnce"));
  const armAt = tick.indexOf('if (owner === "email" || owner === "text")');
  const arm = tick.slice(armAt, tick.indexOf("for (const row of criteria)", armAt));
  if (!arm.includes("send = await actuateChannelSend")) fail("case6-assign");
  for (const bit of [
    '"send_denied"',
    '"send_live"',
    '"send_dry_run"',
    "send.ok && !send.dryRun",
    "send.ok && send.dryRun",
    "messageId: send.messageId",
    "reason: send.reason",
    "attempt_n",
  ]) {
    if (!arm.includes(bit)) fail("case6-bit", bit);
  }
  if (arm.includes("send.detail") || arm.includes("send.deny") || arm.includes("shouldLiveSend")) fail("case6-banned");
  const deniedAt = arm.indexOf('"send_denied"');
  const denied = arm.slice(deniedAt, arm.indexOf("writeEngagement", deniedAt));
  for (const banned of ["subject", "bodyText", "bodyHtml", "messageId", "reason"]) {
    if (denied.includes(banned)) fail("case6-deny-key", banned);
  }
  if (!denied.includes("send") || !denied.includes("attempt_n")) fail("case6-deny");
  const live = arm.slice(arm.indexOf('"send_live"'), arm.indexOf('"send_dry_run"'));
  if (!live.includes("messageId") || !live.includes("subject") || !live.includes("bodyText")) fail("case6-live");
  if (live.includes("reason:") || bareSend(live)) fail("case6-live-extra");
  const dry = arm.slice(arm.indexOf('"send_dry_run"'));
  if (!dry.includes("reason") || !dry.includes("subject") || !dry.includes("bodyText")) fail("case6-dry");
  if (dry.includes("messageId") || bareSend(dry)) fail("case6-dry-extra");

  const projection = read("src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts");
  const title = sliceFn(projection, "function titleFor", "function waitMsFrom");
  if (title.includes('case "send_denied"') || !title.includes('eventKind.replace(/_/g, " ")')) fail("case7-title");
  const kind = sliceFn(projection, "function kindOf", "function titleFor");
  if (!kind.includes('eventKind === "send_live" || eventKind === "send_dry_run"') || kind.includes("send_denied")) {
    fail("case7-kind");
  }
  const outcome = sliceFn(projection, "function outcomeFrom", "function signalsFrom");
  if (!outcome.includes('kind === "send"')) fail("case7-outcome");
  const thought = sliceFn(projection, "function thoughtFrom", "function outcomeFrom");
  if (!thought.includes("payload.reason") || thought.includes("send_denied")) fail("case7-thought");
  const signals = sliceFn(projection, "function signalsFrom", "function chronologyStatusFor");
  if (!signals.includes('kind === "send"')) fail("case7-signals");
  const prose = sliceFn(read("src/app/register/prototype-ant/operator/channelRuleGrain.ts"), "export function eventKindProse", "export function channelFromPayload");
  if (!prose.includes('kind.includes("send")') || !prose.includes('return "Sent"') || prose.includes("send_denied")) {
    fail("case7-prose");
  }
  const inbound = sliceFn(cascade, "async function hasInboundOverride", "function clockAnchor");
  const list = inbound.slice(inbound.indexOf("event_kind IN"), inbound.indexOf(")", inbound.indexOf("event_kind IN")));
  if (list.includes("send_denied")) fail("case7-inbound");
  const gate = sliceFn(read("server/wire-service/dispatchSend.ts"), "async function consentAndHaltGate", "export async function isHaltBlockingNew");
  if (gate.includes("send_denied")) fail("case7-gate");
}

async function cleanup() {
  await pool.query(`DELETE FROM engagement_records WHERE firm_id = $1 OR contact_id = $2`, [firm, contact]);
  await pool.query(`DELETE FROM workflow_run WHERE firm_id = $1 OR workflow_id = $2`, [firm, `wf-tick-${firm}`]);
  await pool.query(`DELETE FROM workflow_state WHERE workflow_id = $1`, [`wf-tick-${firm}`]);
  await pool.query(`DELETE FROM workflow WHERE id = $1`, [`wf-tick-${firm}`]);
  await pool.query(`DELETE FROM active_attempts WHERE firm_id = $1 OR contact_id = $2`, [firm, contact]);
  await pool.query(`DELETE FROM enrollment WHERE firm_id = $1 OR contact_id = $2`, [firm, contact]);
  await pool.query(`DELETE FROM campaign WHERE id = $1`, [campaignId]);
  await pool.query(`DELETE FROM sequence_template WHERE id = ANY($1::text[])`, [templates]);
  await pool.query(`DELETE FROM halt_records WHERE firm_id = $1 OR contact_id = $2`, [firm, contact]);
  await pool.query(`DELETE FROM consent_records WHERE contact_id = $1 OR firm_id = $2`, [contact, firm]);
  await pool.query(`DELETE FROM contact_records WHERE id = $1 OR firm_id = $2`, [contact, firm]);
  await pool.query(`DELETE FROM messaging_events WHERE firm_id = $1 OR contact_id = $2`, [firm, contact]);
  await pool.query(`DELETE FROM outbound_messages WHERE firm_id = $1 OR contact_id = $2`, [firm, contact]);
}

async function main() {
  assertShape();
  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, phone) VALUES ($1, $2, 'pkt018@example.com', NULL)`,
    [contact, firm],
  );
  await pool.query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced) VALUES ($1, $2, 'express', false)`,
    [contact, firm],
  );
  await pool.query(
    `INSERT INTO halt_records (id, consultant_id, contact_id, firm_id, scope)
     VALUES ($1, 'pkt018', $2, $3, 'contact')`,
    [`hr-pkt018-${token}-a`, contact, firm],
  );

  const haltRule = criteria(`ac-pkt018-${token}-halt`, "return_to_sequence_head");
  const haltAttempt = row(`att-pkt018-${token}-halt`);
  await escalate(haltAttempt, haltRule);
  const haltRows = await engs(haltAttempt.id);
  const denied = kinds(haltRows, "send_denied");
  if (denied.length !== 1 || kinds(haltRows, "send_live").length || kinds(haltRows, "send_dry_run").length) {
    fail("case1-kinds", haltRows.map((item) => item.event_kind));
  }
  const deny = denied[0];
  if (!deny.id.startsWith("eng-") || deny.firm_id !== firm || deny.contact_id !== contact) fail("case1-row", deny);
  const payload = deny.payload;
  if (payload.attemptId !== haltAttempt.id || payload.channel !== "email" || payload.criteriaId !== haltRule.id) {
    fail("case1-keys", payload);
  }
  if (typeof payload.runId !== "string" || payload.criteriaLabel !== haltRule.label) fail("case1-label", payload);
  assertDeny(payload, "halt active", "case1-send");
  if (kinds(haltRows, "window_fired").length !== 1) fail("case1-window", haltRows);
  const haltStored = await stored(haltAttempt.id);
  if (haltStored.status !== "open" || !(haltRule.id in haltStored.fired_criteria)) fail("case1-attempt", haltStored);

  await pool.query(`DELETE FROM halt_records WHERE firm_id = $1 OR contact_id = $2`, [firm, contact]);
  await pool.query(`UPDATE consent_records SET silenced = true WHERE contact_id = $1`, [contact]);
  const silenceRule = criteria(`ac-pkt018-${token}-silence`, "return_to_sequence_head");
  const silenceAttempt = row(`att-pkt018-${token}-silence`);
  await escalate(silenceAttempt, silenceRule);
  const silenceRows = await engs(silenceAttempt.id);
  const silenceDenied = kinds(silenceRows, "send_denied");
  if (silenceDenied.length !== 1 || kinds(silenceRows, "send_live").length || kinds(silenceRows, "send_dry_run").length) {
    fail("case2-kinds", silenceRows.map((item) => item.event_kind));
  }
  if (silenceDenied[0].payload.channel !== "email" || silenceDenied[0].payload.criteriaId !== silenceRule.id) {
    fail("case2-keys", silenceDenied[0].payload);
  }
  assertDeny(silenceDenied[0].payload, "silenced", "case2-send");

  await pool.query(`UPDATE consent_records SET silenced = false, basis = 'express' WHERE contact_id = $1`, [contact]);
  await pool.query(
    `INSERT INTO sequence_template (id, sequence_class, variant, label, cells)
     VALUES ($1, 'optin', 'v1', 'pkt018 wait', '[]'::jsonb)`,
    [waitTemplate],
  );
  await pool.query(
    `INSERT INTO campaign (id, firm_id, sequence_id, name, ord, attempt_count, wait_after_last_failed_seconds)
     VALUES ($1, $2, $3, 'pkt018 wait', 0, 3, 3600)`,
    [campaignId, firm, waitTemplate],
  );
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, campaign_id, payload)
     VALUES ($1, $2, $3, $4, $4, $5, '{}'::jsonb)`,
    [waitEnrollment, firm, contact, waitTemplate, campaignId],
  );
  const waitRule = criteria(`ac-pkt018-${token}-wait`, "hold");
  const waitAttempt = row(`att-pkt018-${token}-wait`, {
    enrollment_id: waitEnrollment,
    state: { attempt_n: 1 },
  });
  const now = new Date();
  await insertAttempt(waitAttempt);
  const waited = await escalateAttemptWindow(pool, waitAttempt, waitRule, ["email"], now, 0);
  if (!waited) fail("case2-wait-null");
  await assertNoOutbound();
  const waitRows = await engs(waitAttempt.id);
  if (kinds(waitRows, "window_fired").length !== 1) fail("case2-wait-window", waitRows);
  if (kinds(waitRows, "send_denied").length || kinds(waitRows, "send_live").length || kinds(waitRows, "send_dry_run").length) {
    fail("case2-wait-send", waitRows.map((item) => item.event_kind));
  }
  const waitStored = await stored(waitAttempt.id);
  const until = waitStored.state.attempt_wait_until;
  if (waitStored.status !== "open" || Object.keys(waitStored.fired_criteria).length !== 0) fail("case2-wait-attempt", waitStored);
  if (typeof until !== "string" || new Date(until).getTime() <= now.getTime()) fail("case2-wait-until", waitStored.state);

  await pool.query(`UPDATE contact_records SET email = NULL, phone = NULL WHERE id = $1`, [contact]);
  const quietRule = criteria(`ac-pkt018-${token}-quiet`, "return_to_sequence_head");
  const quietAttempt = row(`att-pkt018-${token}-quiet`);
  await escalate(quietAttempt, quietRule);
  const quietRows = await engs(quietAttempt.id);
  const dry = kinds(quietRows, "send_dry_run");
  if (dry.length !== 1 || kinds(quietRows, "send_denied").length) fail("case3-kinds", quietRows.map((item) => item.event_kind));
  const quietPayload = dry[0].payload;
  if (quietPayload.reason !== "no email on contact — dry-run intent only") fail("case3-reason", quietPayload);
  if (typeof quietPayload.subject !== "string" || typeof quietPayload.bodyText !== "string" || "send" in quietPayload) {
    fail("case3-copy", quietPayload);
  }
  const quietStored = await stored(quietAttempt.id);
  if (quietStored.status !== "open" || !(quietRule.id in quietStored.fired_criteria)) fail("case3-attempt", quietStored);
  if (kinds(quietRows, "window_fired").length !== 1) fail("case3-window");

  await pool.query(`UPDATE contact_records SET email = 'pkt018@example.com', phone = NULL WHERE id = $1`, [contact]);
  await pool.query(
    `INSERT INTO halt_records (id, consultant_id, contact_id, firm_id, scope)
     VALUES ($1, 'pkt018', $2, $3, 'contact')`,
    [`hr-pkt018-${token}-cell`, contact, firm],
  );
  await pool.query(
    `INSERT INTO sequence_template (id, sequence_class, variant, label, cells)
     VALUES ($1, 'optin', 'v1', 'pkt018 email', $2::jsonb), ($3, 'optin', 'v1', 'pkt018 form', $4::jsonb)`,
    [emailTemplate, JSON.stringify(cells("email")), formTemplate, JSON.stringify(cells("form"))],
  );

  async function advance(templateId: string, id: string): Promise<TickFire> {
    const attempt = row(id, {
      state: { templateId, cellIndex: 0, enrolledAt: past, delivered: true },
    });
    await insertAttempt(attempt);
    const fire = await advanceTemplateCellIfDue(pool, attempt, new Date());
    if (!fire) fail("cell-null", id);
    await assertNoOutbound();
    return fire;
  }

  const cellAttempt = `att-pkt018-${token}-cell`;
  await advance(emailTemplate, cellAttempt);
  const cellRows = await engs(cellAttempt);
  const cellDenied = kinds(cellRows, "send_denied");
  if (cellDenied.length !== 1 || kinds(cellRows, "send_live").length || kinds(cellRows, "send_dry_run").length) {
    fail("case4-kinds", cellRows.map((item) => item.event_kind));
  }
  const cellPayload = cellDenied[0].payload;
  if (
    cellPayload.attemptId !== cellAttempt ||
    cellPayload.cellId !== "c1" ||
    cellPayload.cellLabel !== "Second" ||
    cellPayload.channel !== "email" ||
    typeof cellPayload.runId !== "string"
  ) {
    fail("case4-keys", cellPayload);
  }
  assertDeny(cellPayload, "halt active", "case4-send");
  if (kinds(cellRows, "cell_advanced").length !== 1) fail("case4-advanced");
  const cellStored = await stored(cellAttempt);
  if (cellStored.status !== "open" || cellStored.state.cellIndex !== 1 || cellStored.state.delivered !== true) {
    fail("case4-state", cellStored);
  }
  if (Object.keys(cellStored.fired_criteria).length !== 0) fail("case4-fired", cellStored);

  process.env.SEND_MODE = "live";
  process.env.SEND_TEST_COHORT = contact;
  try {
    const liveAttempt = `att-pkt018-${token}-live`;
    await advance(emailTemplate, liveAttempt);
    const liveRows = await engs(liveAttempt);
    if (kinds(liveRows, "send_denied").length !== 1 || kinds(liveRows, "send_live").length || kinds(liveRows, "send_dry_run").length) {
      fail("case4-live", liveRows.map((item) => item.event_kind));
    }
    await assertNoOutbound();
  } finally {
    delete process.env.SEND_MODE;
    delete process.env.SEND_TEST_COHORT;
  }

  const formAttempt = `att-pkt018-${token}-form`;
  const formFire = await advance(formTemplate, formAttempt);
  const formRows = await engs(formAttempt);
  if (kinds(formRows, "send_denied").length || kinds(formRows, "send_live").length || kinds(formRows, "send_dry_run").length) {
    fail("case4-form-send", formRows.map((item) => item.event_kind));
  }
  if (kinds(formRows, "cell_advanced").length !== 1 || formFire.send !== undefined) fail("case4-form", formFire);

  await pool.query(`UPDATE contact_records SET email = NULL, phone = NULL WHERE id = $1`, [contact]);
  const missingAttempt = `att-pkt018-${token}-missing`;
  await advance(emailTemplate, missingAttempt);
  const missingRows = await engs(missingAttempt);
  const missingDry = kinds(missingRows, "send_dry_run");
  if (missingDry.length !== 1 || kinds(missingRows, "send_denied").length) {
    fail("case4-missing-kinds", missingRows.map((item) => item.event_kind));
  }
  const missingPayload = missingDry[0].payload;
  if (typeof missingPayload.subject !== "string" || typeof missingPayload.bodyText !== "string") fail("case4-missing-copy", missingPayload);
  if (!missingPayload.send || missingPayload.send.ok !== true || missingPayload.send.dryRun !== true) fail("case4-missing-send", missingPayload);
  if (typeof missingPayload.reason !== "string") fail("case4-missing-reason", missingPayload);

  console.log("verify-send-denied-engagement passed");
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
