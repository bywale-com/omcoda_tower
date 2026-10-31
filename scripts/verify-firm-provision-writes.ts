/**
 * PKT-013 against migrated Postgres.
 *
 * A ct_firms firing stores the provisioned firm id on payload.writes.
 * The element has no contact_id. The id load is WHERE id=$1.
 * firms, campaign_states, users, access_links, and the provision audit
 * stay off that array. A blank name or email returns 400 before dispatch.
 * handlePoolAllocate updates pool columns and does not dispatch.
 *
 * Ship CI runs this after migrate and seed, beside verify-click-attribution.
 */
import { randomUUID } from "node:crypto";
import { handleMachineProvision } from "../server/wire-service/machine.ts";
import { handlePoolAllocate } from "../server/wire-service/pool.ts";
import { getPool } from "../server/wire-service/db.ts";
import { writesFromPayload } from "../server/wire-service/runWrites.ts";
import { materializeTriggersFromGraph, walkValidatedWorkflow } from "../server/wire-service/workflowWalk.ts";

delete process.env.RESEND_API_KEY;
delete process.env.RESEND_WEBHOOK_SECRET;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const pool = getPool();
const token = randomUUID().slice(0, 8);
const provision = randomUUID();
const other = randomUUID();
const fallthrough = randomUUID();
const bookA = `contact-pkt013-${token}-a`;
const bookB = `contact-pkt013-${token}-b`;
const email = "pkt013@example.com";

const firmIds = new Set<string>([provision, other, fallthrough]);
const emails = new Set<string>([email]);
const workflowIds = new Set<string>();

type Write = { table?: string; id?: string; contact_id?: string | null };
type RunRow = {
  id: string;
  workflow_id: string;
  node_status: { trig?: { writes?: Write[]; detail?: string }; gate?: { detail?: string } };
  counts: { contacts?: number };
};
type HttpResult = { body: Record<string, unknown>; status: number };
type Listeners = {
  global: string;
  unset: string;
  ref: string;
  otherAxis: string;
  thisFirm: string;
  otherFirm: string;
  contact: string;
  matching: string[];
  quiet: string[];
};

const bannedTables = ["firms", "campaign_states", "users", "access_links", "audit_events", "contact_records"];

function fail(name: string, detail?: unknown): never {
  console.error(`fail ${name}`, detail ?? "");
  throw new Error(name);
}

function httpContext(body: unknown) {
  return {
    req: { json: async () => body },
    json(payload: unknown, status = 200): HttpResult {
      return { body: payload as Record<string, unknown>, status };
    },
  };
}

async function provisionCall(body: Record<string, unknown>): Promise<HttpResult> {
  return handleMachineProvision(httpContext(body) as never) as Promise<HttpResult>;
}

function assertPointer(run: RunRow, firmId: string) {
  const writes = run.node_status?.trig?.writes;
  if (!Array.isArray(writes) || writes.length !== 1) fail("writes-length", { run: run.id, writes });
  const pointer = writes[0];
  if (pointer.table !== "ct_firms") fail("writes-table", pointer);
  if (pointer.id !== firmId) fail("writes-id", pointer);
  if (pointer.contact_id !== null) fail("writes-contact", pointer);
  for (const row of writes) {
    if (row.table && bannedTables.includes(row.table)) fail("writes-banned", row);
  }
}

async function listenerGraph(name: string, data: Record<string, unknown>) {
  return {
    nodes: [
      { id: "trig", type: "trigger", data: { configured: true, triggerKind: "event", triggerEvent: "ct_firms", ...data } },
      { id: "stop", type: "exit", data: { configured: true } },
    ],
    edges: [{ id: `${name}-e`, source: "trig", target: "stop" }],
  };
}

async function plantListeners(firmId: string, label: string): Promise<Listeners> {
  const specs: Array<{ key: keyof Omit<Listeners, "matching" | "quiet">; data: Record<string, unknown> }> = [
    { key: "global", data: { grain: "global" } },
    { key: "unset", data: { grain: "local" } },
    { key: "ref", data: { grain: "local", localRef: firmId } },
    { key: "otherAxis", data: { grain: "local", localRef: "other-axis" } },
    { key: "thisFirm", data: { grain: "local", localFirmId: firmId } },
    { key: "otherFirm", data: { grain: "local", localFirmId: other } },
    { key: "contact", data: { grain: "local", localContactIds: [bookA] } },
  ];
  const ids = {} as Listeners;
  for (const spec of specs) {
    const id = `wf-pkt013-${token}-${label}-${spec.key}`;
    workflowIds.add(id);
    const graph = await listenerGraph(id, spec.data);
    await pool.query(
      `INSERT INTO workflow (id, firm_id, name, target, graph) VALUES ($1,$2,$3,'contact',$4::jsonb)`,
      [id, firmId, id, JSON.stringify(graph)],
    );
    await pool.query(`INSERT INTO workflow_state (workflow_id, status) VALUES ($1,'active')`, [id]);
    await materializeTriggersFromGraph(pool, id, firmId, graph);
    ids[spec.key] = id;
  }
  ids.matching = [ids.global, ids.unset, ids.ref, ids.thisFirm];
  ids.quiet = [ids.otherAxis, ids.otherFirm, ids.contact];
  return ids;
}

async function eventRuns(): Promise<RunRow[]> {
  const ids = [...workflowIds];
  if (!ids.length) return [];
  const { rows } = await pool.query<RunRow>(
    `SELECT id, workflow_id, node_status, counts
     FROM workflow_run
     WHERE trigger_label='event:ct_firms' AND workflow_id = ANY($1::text[])
     ORDER BY started_at ASC, id ASC`,
    [ids],
  );
  return rows;
}

let loadSeq = 0;

async function fieldWalk(input: {
  walkFirm: string;
  pointerId: string;
  pickField: string;
  pickOp: "eq" | "exists";
  pickValue?: string;
  contactId?: string;
}): Promise<string> {
  loadSeq += 1;
  const workflowId = `wf-pkt013-${token}-load-${loadSeq}`;
  const runId = `run-pkt013-${token}-load-${loadSeq}`;
  workflowIds.add(workflowId);
  firmIds.add(input.walkFirm);
  const data: Record<string, unknown> = {
    configured: true,
    pickTable: "ct_firms",
    pickField: input.pickField,
    pickOp: input.pickOp,
  };
  if (input.pickValue != null) data.pickValue = input.pickValue;
  const graph = {
    nodes: [
      { id: "trig", type: "trigger", data: { configured: true, triggerKind: "event", triggerEvent: "ct_firms" } },
      { id: "gate", type: "if", data },
      { id: "stop", type: "exit", data: { configured: true } },
    ],
    edges: [
      { id: `e-${loadSeq}-1`, source: "trig", target: "gate" },
      { id: `e-${loadSeq}-2`, source: "gate", target: "stop", sourceHandle: "true" },
    ],
  };
  await pool.query(
    `INSERT INTO workflow (id, firm_id, name, target, graph) VALUES ($1,$2,$3,'contact',$4::jsonb)`,
    [workflowId, input.walkFirm, workflowId, JSON.stringify(graph)],
  );
  await pool.query(
    `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label) VALUES ($1,$2,$3,'running','load')`,
    [runId, workflowId, input.walkFirm],
  );
  const pointer: Record<string, unknown> = { table: "ct_firms", id: input.pointerId };
  if (input.contactId != null) pointer.contact_id = input.contactId;
  const walked = await walkValidatedWorkflow(pool, {
    workflowId,
    firmId: input.walkFirm,
    runId,
    triggerLabel: "load",
    triggerPayload: { writes: [pointer] },
    contactIds: [provision],
  });
  if (!walked.ok && !walked.nodeStatus.gate) fail("load-walk", { workflowId, error: walked.error, status: walked.nodeStatus });
  const { rows } = await pool.query<RunRow>(
    `SELECT id, workflow_id, node_status, counts FROM workflow_run WHERE id=$1`,
    [runId],
  );
  const detail = rows[0]?.node_status?.gate?.detail ?? walked.nodeStatus.gate?.detail ?? "";
  if (detail.startsWith("if pick ")) fail("person-split", detail);
  return detail;
}

async function directWalk(contactId?: string): Promise<RunRow> {
  loadSeq += 1;
  const workflowId = `wf-pkt013-${token}-direct-${loadSeq}`;
  const runId = `run-pkt013-${token}-direct-${loadSeq}`;
  workflowIds.add(workflowId);
  const graph = {
    nodes: [
      { id: "trig", type: "trigger", data: { configured: true, triggerKind: "event", triggerEvent: "ct_firms" } },
      { id: "stop", type: "exit", data: { configured: true } },
    ],
    edges: [{ id: `d-${loadSeq}`, source: "trig", target: "stop" }],
  };
  await pool.query(
    `INSERT INTO workflow (id, firm_id, name, target, graph) VALUES ($1,$2,$3,'contact',$4::jsonb)`,
    [workflowId, provision, workflowId, JSON.stringify(graph)],
  );
  await pool.query(
    `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label) VALUES ($1,$2,$3,'running','direct')`,
    [runId, workflowId, provision],
  );
  const pointer: Record<string, unknown> = { table: "ct_firms", id: provision };
  if (contactId != null) pointer.contact_id = contactId;
  await walkValidatedWorkflow(pool, {
    workflowId,
    firmId: provision,
    runId,
    triggerLabel: "direct",
    triggerPayload: { writes: [pointer] },
  });
  const { rows } = await pool.query<RunRow>(
    `SELECT id, workflow_id, node_status, counts FROM workflow_run WHERE id=$1`,
    [runId],
  );
  if (!rows[0]) fail("direct-missing", runId);
  return rows[0];
}

async function firmRow(id: string) {
  const { rows } = await pool.query<{
    name: string;
    posture: string;
    pool_slug: string | null;
    pool_domain: string | null;
    sending_identity_id: string | null;
  }>(`SELECT name, posture, pool_slug, pool_domain, sending_identity_id FROM ct_firms WHERE id=$1`, [id]);
  return rows[0] ?? null;
}

async function countRows(table: string, column: string, value: string): Promise<number> {
  const { rows } = await pool.query<{ n: number }>(`SELECT count(*)::int AS n FROM ${table} WHERE ${column}=$1`, [value]);
  return rows[0]?.n ?? 0;
}

let usersRenamedTo: string | null = null;

async function restoreUsers() {
  if (!usersRenamedTo) return;
  const scratch = usersRenamedTo;
  usersRenamedTo = null;
  await pool.query(`ALTER TABLE ${scratch} RENAME TO users`);
}

async function cleanup() {
  await restoreUsers();
  const firms = [...firmIds];
  const flows = [...workflowIds];
  const mail = [...emails];
  if (flows.length) {
    await pool.query(`DELETE FROM workflow_run WHERE workflow_id = ANY($1::text[]) OR firm_id = ANY($2::text[])`, [
      flows,
      firms,
    ]);
    await pool.query(`DELETE FROM workflow_trigger WHERE workflow_id = ANY($1::text[])`, [flows]);
    await pool.query(`DELETE FROM workflow_state WHERE workflow_id = ANY($1::text[])`, [flows]);
    await pool.query(`DELETE FROM workflow WHERE id = ANY($1::text[])`, [flows]);
  }
  if (mail.length) {
    await pool.query(`DELETE FROM access_links WHERE email = ANY($1::text[]) OR firm_id = ANY($2::uuid[])`, [mail, firms]);
    await pool.query(`DELETE FROM users WHERE email = ANY($1::text[])`, [mail]);
  }
  if (firms.length) {
    await pool.query(`DELETE FROM audit_events WHERE firm_id = ANY($1::text[])`, [firms]);
    await pool.query(`DELETE FROM sending_domains WHERE firm_id = ANY($1::text[])`, [firms]);
    await pool.query(`DELETE FROM campaign_states WHERE firm_id = ANY($1::text[])`, [firms]);
    await pool.query(`DELETE FROM contact_records WHERE firm_id = ANY($1::text[])`, [firms]);
    await pool.query(`DELETE FROM ct_firms WHERE id = ANY($1::text[])`, [firms]);
    await pool.query(`DELETE FROM firms WHERE id = ANY($1::uuid[])`, [firms]);
  }
}

async function main() {
  await pool.query(`INSERT INTO firms (id, name) VALUES ($1::uuid, $2)`, [other, "Other Firm"]);
  await pool.query(`INSERT INTO ct_firms (id, name) VALUES ($1, $2)`, [other, "Other Firm"]);
  await pool.query(`INSERT INTO firms (id, name) VALUES ($1::uuid, $2)`, [fallthrough, "Fallthrough"]);
  await pool.query(`INSERT INTO contact_records (id, firm_id, name) VALUES ($1,$2,$3), ($4,$2,$5)`, [
    bookA,
    provision,
    "Book A",
    bookB,
    "Book B",
  ]);
  const listeners = await plantListeners(provision, "prov");

  const before = await fieldWalk({
    walkFirm: other,
    pointerId: provision,
    pickField: "name",
    pickOp: "exists",
  });
  if (before !== "branch → false") fail("case1", before);

  const created = await provisionCall({
    firmId: provision,
    firmName: "Pkt Thirteen",
    email,
    website: "https://pkt013.example",
    role: "consultant",
  });
  if (created.status !== 200) fail("case2-status", created);
  const body = created.body;
  if (body.firmId !== provision) fail("case2-firm", body.firmId);
  if (body.firmName !== "Pkt Thirteen") fail("case2-name", body.firmName);
  if (body.email !== email) fail("case2-email", body.email);
  if (body.website !== "https://pkt013.example") fail("case2-website", body.website);
  if (body.role !== "consultant") fail("case2-role", body.role);
  if (body.ctFirm !== true) fail("case2-ct", body.ctFirm);
  if (body.campaignState !== "armed-for-activation") fail("case2-state", body.campaignState);
  if (body.bound !== true) fail("case2-bound", body.bound);
  if (body.authUser !== true) fail("case2-auth", body.authUser);
  if (typeof body.accessPath !== "string" || !body.accessPath) fail("case2-access", body.accessPath);
  if (body.loginPath !== body.accessPath) fail("case2-login", body.loginPath);
  const fired = body.workflowsFired as Array<{ workflowId: string }>;
  const firedIds = new Set(fired.map((row) => row.workflowId));
  if (firedIds.size !== listeners.matching.length) fail("case2-fired-count", [...firedIds]);
  for (const id of listeners.matching) if (!firedIds.has(id)) fail("case2-fired-missing", id);
  for (const id of listeners.quiet) if (firedIds.has(id)) fail("case2-fired-extra", id);

  const row = await firmRow(provision);
  if (!row) fail("case2-row");
  if (row.name !== "Pkt Thirteen" || row.posture !== "Idle") fail("case2-posture", row);
  if (row.pool_slug != null || row.pool_domain != null || row.sending_identity_id != null) fail("case2-pool", row);
  if ((await countRows("firms", "id", provision)) !== 1) fail("case2-firms");
  if ((await countRows("campaign_states", "firm_id", provision)) !== 1) fail("case2-campaign");
  if ((await countRows("users", "email", email)) !== 1) fail("case2-users");
  if ((await countRows("access_links", "email", email)) !== 1) fail("case2-links");
  if ((await countRows("audit_events", "firm_id", provision)) < 1) fail("case2-audit");
  const { rows: audits } = await pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM audit_events WHERE firm_id=$1 AND kind='firm.provisioned'`,
    [provision],
  );
  if (audits[0]?.n !== 1) fail("case2-audit-kind", audits[0]);

  const runs = await eventRuns();
  const byWorkflow = new Map<string, RunRow[]>();
  for (const run of runs) {
    const list = byWorkflow.get(run.workflow_id) ?? [];
    list.push(run);
    byWorkflow.set(run.workflow_id, list);
  }
  for (const id of listeners.matching) {
    const list = byWorkflow.get(id) ?? [];
    if (list.length !== 1) fail("case2-runs", { id, n: list.length });
    assertPointer(list[0], provision);
    if (list[0].counts?.contacts !== 2) fail("case2-counts", list[0].counts);
  }
  for (const id of listeners.quiet) {
    if ((byWorkflow.get(id) ?? []).length !== 0) fail("case2-quiet", id);
  }

  const withWrites = writesFromPayload({
    writes: [{ table: "ct_firms", id: provision }],
    firmId: provision,
    firmName: "Pkt Thirteen",
    email,
  });
  if (withWrites.length !== 1 || withWrites[0].table !== "ct_firms" || withWrites[0].id !== provision) {
    fail("case3-pointer", withWrites);
  }
  if (withWrites[0].contact_id !== null) fail("case3-contact", withWrites);
  if (withWrites.some((row) => row.table === "contact_records")) fail("case3-people", withWrites);
  const without = writesFromPayload({ firmId: provision, firmName: "Pkt Thirteen", email });
  if (without.some((row) => row.table === "ct_firms" || row.table === "contact_records")) fail("case3-absent", without);

  const expectTrue: Array<[string, "eq" | "exists", string?]> = [
    ["name", "eq", "Pkt Thirteen"],
    ["posture", "eq", "Idle"],
    ["created_at", "exists"],
    ["updated_at", "exists"],
  ];
  for (const [field, op, value] of expectTrue) {
    const detail = await fieldWalk({
      walkFirm: other,
      pointerId: provision,
      pickField: field,
      pickOp: op,
      pickValue: value,
    });
    if (detail !== "branch → true") fail(`case4-${field}`, detail);
  }
  for (const field of ["pool_slug", "pool_domain", "sending_identity_id"]) {
    const detail = await fieldWalk({
      walkFirm: other,
      pointerId: provision,
      pickField: field,
      pickOp: "exists",
    });
    if (detail !== "branch → false") fail(`case4-${field}`, detail);
  }
  const absent = randomUUID();
  firmIds.add(absent);
  const miss = await fieldWalk({
    walkFirm: other,
    pointerId: absent,
    pickField: "name",
    pickOp: "exists",
  });
  if (miss !== "branch → false") fail("case4-miss", miss);
  const fell = await fieldWalk({
    walkFirm: other,
    pointerId: fallthrough,
    pickField: "name",
    pickOp: "exists",
  });
  if (fell !== "branch → false") fail("case4-firms", fell);

  const decoy = randomUUID();
  firmIds.add(decoy);
  await pool.query(
    `INSERT INTO ct_firms (id, name, updated_at) VALUES ($1, 'decoy', now() + interval '1 day')`,
    [decoy],
  );
  const kept = await fieldWalk({
    walkFirm: other,
    pointerId: provision,
    pickField: "name",
    pickOp: "eq",
    pickValue: "Pkt Thirteen",
  });
  if (kept !== "branch → true") fail("case5", kept);

  await pool.query(`UPDATE ct_firms SET name='later-name', posture='Active' WHERE id=$1`, [provision]);
  const laterName = await fieldWalk({
    walkFirm: other,
    pointerId: provision,
    pickField: "name",
    pickOp: "eq",
    pickValue: "later-name",
  });
  if (laterName !== "branch → true") fail("case6-name", laterName);
  const laterPosture = await fieldWalk({
    walkFirm: other,
    pointerId: provision,
    pickField: "posture",
    pickOp: "eq",
    pickValue: "Active",
  });
  if (laterPosture !== "branch → true") fail("case6-posture", laterPosture);
  const stored = await eventRuns();
  const case2Run = stored.find((run) => run.workflow_id === listeners.global);
  if (case2Run?.node_status?.trig?.writes?.[0]?.id !== provision) fail("case6-stored", case2Run?.node_status?.trig?.writes);

  await pool.query(
    `UPDATE ct_firms
        SET posture='Armed', pool_slug='keep-slug', pool_domain='keep-domain', sending_identity_id='keep-sid'
      WHERE id=$1`,
    [provision],
  );
  const beforeRepeat = new Set((await eventRuns()).map((run) => run.id));
  const again = await provisionCall({
    firmId: provision,
    firmName: "Pkt Thirteen Again",
    email,
  });
  if (again.status !== 200 || again.body.firmId !== provision) fail("case7-http", again);
  if ((await countRows("ct_firms", "id", provision)) !== 1) fail("case7-count");
  const againRow = await firmRow(provision);
  if (!againRow || againRow.name !== "Pkt Thirteen Again" || againRow.posture !== "Armed") fail("case7-row", againRow);
  if (againRow.pool_slug !== "keep-slug" || againRow.pool_domain !== "keep-domain" || againRow.sending_identity_id !== "keep-sid") {
    fail("case7-pool", againRow);
  }
  if ((await countRows("users", "email", email)) !== 1) fail("case7-users");
  const repeated = (await eventRuns()).filter((run) => !beforeRepeat.has(run.id));
  const repeatedIds = new Set(repeated.map((run) => run.workflow_id));
  for (const id of listeners.matching) {
    if (!repeatedIds.has(id)) fail("case7-missing", id);
  }
  for (const run of repeated) {
    if (!listeners.matching.includes(run.workflow_id)) fail("case7-extra", run.workflow_id);
    assertPointer(run, provision);
  }
  const still = (await eventRuns()).find((run) => run.id === case2Run?.id);
  if (still?.node_status?.trig?.writes?.[0]?.id !== provision) fail("case7-old", still?.node_status?.trig?.writes);

  const mintEmail = `pkt013-mint-${token}@example.com`;
  emails.add(mintEmail);
  const minted = await provisionCall({ firmName: "Pkt Thirteen Mint", email: mintEmail });
  if (minted.status !== 200) fail("case8-status", minted);
  const mintedId = String(minted.body.firmId ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(mintedId) || mintedId === provision) fail("case8-id", mintedId);
  firmIds.add(mintedId);
  const mintedRow = await firmRow(mintedId);
  if (!mintedRow || mintedRow.name !== "Pkt Thirteen Mint" || mintedRow.posture !== "Idle") fail("case8-row", mintedRow);
  if ((await countRows("ct_firms", "id", mintedId)) !== 1) fail("case8-count");

  const blankEmail = `pkt013-blank-${token}@example.com`;
  emails.add(blankEmail);
  const blanked = await provisionCall({ firmId: "", firmName: "Pkt Thirteen Blank", email: blankEmail });
  if (blanked.status !== 200) fail("case8-blank-status", blanked);
  const blankId = String(blanked.body.firmId ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(blankId) || blankId === provision || blankId === mintedId) fail("case8-blank-id", blankId);
  firmIds.add(blankId);
  if ((await countRows("ct_firms", "id", blankId)) !== 1) fail("case8-blank-count");
  const blankRow = await firmRow(blankId);
  if (!blankRow || blankRow.name !== "Pkt Thirteen Blank") fail("case8-blank-row", blankRow);

  const runsBeforeBlank = (await eventRuns()).length;
  const firmsBeforeBlank = (await pool.query<{ n: number }>(`SELECT count(*)::int AS n FROM ct_firms`)).rows[0]?.n ?? 0;
  for (const bodyIn of [
    { firmName: "   ", email: `pkt013-space-name-${token}@example.com` },
    { firmName: "Pkt Thirteen Space", email: "   " },
  ]) {
    const refused = await provisionCall(bodyIn);
    if (refused.status !== 400) fail("case9-status", refused);
    if (refused.body.error !== "firmName and email required") fail("case9-body", refused.body);
  }
  if ((await eventRuns()).length !== runsBeforeBlank) fail("case9-runs");
  const firmsAfterBlank = (await pool.query<{ n: number }>(`SELECT count(*)::int AS n FROM ct_firms`)).rows[0]?.n ?? 0;
  if (firmsAfterBlank !== firmsBeforeBlank) fail("case9-rows", { firmsBeforeBlank, firmsAfterBlank });

  const authFirm = randomUUID();
  const authEmail = `pkt013-auth-${token}@example.com`;
  firmIds.add(authFirm);
  emails.add(authEmail);
  const authListeners = await plantListeners(authFirm, "auth");
  const beforeAuth = new Set((await eventRuns()).map((run) => run.id));
  const scratch = `users_pkt013_${token}`;
  usersRenamedTo = scratch;
  let authResult: HttpResult;
  try {
    await pool.query(`ALTER TABLE users RENAME TO ${scratch}`);
    authResult = await provisionCall({
      firmId: authFirm,
      firmName: "Pkt Thirteen Auth",
      email: authEmail,
    });
  } finally {
    await restoreUsers();
  }
  if (authResult!.status !== 200) fail("case10-status", authResult!);
  if (authResult!.body.authUser !== false) fail("case10-auth", authResult!.body.authUser);
  if (authResult!.body.accessPath !== null) fail("case10-access", authResult!.body.accessPath);
  if (typeof authResult!.body.loginPath !== "string" || !authResult!.body.loginPath.startsWith("/login?tenancy=assisted")) {
    fail("case10-login", authResult!.body.loginPath);
  }
  const authRow = await firmRow(authFirm);
  if (!authRow) fail("case10-row");
  const authRuns = (await eventRuns()).filter((run) => !beforeAuth.has(run.id));
  const authRunIds = new Set(authRuns.map((run) => run.workflow_id));
  for (const id of authListeners.matching) {
    if (!authRunIds.has(id)) fail("case10-missing", id);
  }
  for (const run of authRuns) {
    if (!authListeners.matching.includes(run.workflow_id)) fail("case10-extra", run.workflow_id);
    assertPointer(run, authFirm);
  }
  if ((await countRows("access_links", "email", authEmail)) !== 0) fail("case10-links");

  const beforePool = (await eventRuns()).length;
  const allocated = (await handlePoolAllocate(
    httpContext({ firmId: provision, slug: "pkt013" }) as never,
  )) as HttpResult;
  if (allocated.status !== 200) fail("case11-status", allocated);
  const pooled = await firmRow(provision);
  if (!pooled) fail("case11-row");
  const root = process.env.MAIL_ROOT_DOMAIN?.trim() || "mail.try-tower.com";
  if (pooled.pool_slug !== "pkt013") fail("case11-slug", pooled);
  if (pooled.pool_domain !== `pkt013.${root}`) fail("case11-domain", pooled);
  if (pooled.sending_identity_id !== `sid-${provision}`) fail("case11-sid", pooled);
  if (pooled.posture !== "Armed" || pooled.name !== "Pkt Thirteen Again") fail("case11-kept", pooled);
  if (pooled.pool_slug === "keep-slug" || pooled.pool_domain === "keep-domain" || pooled.sending_identity_id === "keep-sid") {
    fail("case11-unchanged", pooled);
  }
  for (const [field, value] of [
    ["pool_slug", pooled.pool_slug],
    ["pool_domain", pooled.pool_domain],
    ["sending_identity_id", pooled.sending_identity_id],
  ] as const) {
    const detail = await fieldWalk({
      walkFirm: other,
      pointerId: provision,
      pickField: field,
      pickOp: "eq",
      pickValue: value,
    });
    if (detail !== "branch → true") fail(`case11-${field}`, detail);
  }
  if ((await eventRuns()).length !== beforePool) fail("case11-runs", { beforePool, after: (await eventRuns()).length });

  const empty = await directWalk();
  if (empty.counts?.contacts !== 0) fail("case12-empty", empty.counts);
  assertPointer(empty, provision);
  const one = await directWalk(bookA);
  if (one.counts?.contacts !== 1) fail("case12-one", one.counts);
  const oneWrites = one.node_status?.trig?.writes;
  if (oneWrites?.[0]?.contact_id !== bookA || oneWrites?.[0]?.id !== provision) fail("case12-pointer", oneWrites);

  console.log("verify-firm-provision-writes passed");
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
