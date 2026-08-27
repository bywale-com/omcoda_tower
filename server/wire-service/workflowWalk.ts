/**
 * v1 validated-shape walker: Trigger → Constants → Conditions → Rules → Action → Exit
 * Reuses enrollAndActuate from cascade. Does not walk arbitrary free-form graphs (v2).
 */
import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { executeAuditRun } from "./auditRun.ts";
import { enrollAndActuate, writeEngagement } from "./cascade.ts";
import {
  copySequenceFromTemplate,
  platformTemplateIdForClass,
} from "./campaignHousing.ts";
import { writesFromPayload, type RunWrite } from "./runWrites.ts";

export type RfNode = {
  id: string;
  type?: string;
  data?: Record<string, unknown>;
};

export type RfEdge = {
  id?: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
};

export type WalkContext = {
  firmId: string;
  workflowId?: string;
  runId?: string;
  triggerPayload: Record<string, unknown>;
  constants: Record<string, unknown>;
  contactIds: string[];
  /** Last node only. Cardinality default. 015. */
  previousWrites: RunWrite[];
  /** Every completed node’s writes this run. Input / chips. 017. */
  chainWrites: Record<string, RunWrite[]>;
  eligibilityPass?: boolean;
  branchTaken?: string;
  lastOutput?: Record<string, unknown>;
  listingFieldIds?: string[];
};

const ACTION_TYPES = [
  "call_agent",
  "ascribe_tag",
  "manage_lists",
  "assign_task",
  "notify_consultant",
  "run_audit",
] as const;

function normalizeActionType(data: Record<string, unknown> | undefined): string {
  const raw = String(data?.actionType ?? data?.type ?? "call_agent");
  if (raw === "enroll_sequence") return "call_agent";
  if ((ACTION_TYPES as readonly string[]).includes(raw)) return raw;
  return "call_agent";
}

export type NodeRunStatus = {
  status: "success" | "skipped" | "failed";
  detail?: string;
  at: string;
  writes?: RunWrite[];
};

function now() {
  return new Date().toISOString();
}

function isValidatedPipeline(nodes: RfNode[]): boolean {
  const types = new Set(nodes.map((n) => n.type).filter(Boolean));
  return (
    types.has("trigger") &&
    (types.has("action") ||
      types.has("exit") ||
      types.has("get") ||
      types.has("rule") ||
      types.has("branch") ||
      types.has("if") ||
      types.has("switch"))
  );
}

function outgoing(edges: RfEdge[], sourceId: string, handle?: string | null): RfEdge[] {
  return edges.filter((e) => {
    if (e.source !== sourceId) return false;
    if (handle == null || handle === "") return true;
    if (e.sourceHandle == null || e.sourceHandle === "") return true;
    return e.sourceHandle === handle;
  });
}

function triggerKind(data: Record<string, unknown> | undefined): string {
  return String(data?.triggerKind ?? "manual");
}

function actionAgentRef(data: Record<string, unknown> | undefined): string | null {
  const summary = String(data?.actionSummary ?? "");
  const actionType = normalizeActionType(data);
  if (actionType !== "call_agent") return null;
  if (typeof data?.agentRef === "string" && data.agentRef) return data.agentRef;
  if (typeof data?.agent_ref === "string" && data.agent_ref) return data.agent_ref as string;
  const copyClass = String(data?.copySequenceClass ?? data?.sequenceClass ?? "");
  if (copyClass === "reactivation" || copyClass === "reengagement" || copyClass === "optin") {
    return platformTemplateIdForClass(copyClass);
  }
  const lower = summary.toLowerCase();
  if (lower.includes("reactivation")) return "tpl.reactivation.v1";
  if (lower.includes("nudge") || lower.includes("re-engagement") || lower.includes("reengagement")) {
    return "tpl.reengagement.v1";
  }
  return "tpl.optin_launch.v1";
}

function sequenceClassForAgent(agentRef: string): string {
  if (agentRef.includes("reactivation")) return "reactivation";
  if (agentRef.includes("reengagement") || agentRef.includes("nudge")) return "reengagement";
  return "optin";
}

async function resolveAgentRef(
  pool: Pool,
  firmId: string,
  preferred: string,
): Promise<string> {
  const seqClass = sequenceClassForAgent(preferred);
  const bind = await pool.query<{ template_id: string }>(
    `SELECT template_id FROM firm_sequence_binding
     WHERE firm_id=$1 AND sequence_class=$2
     ORDER BY is_default DESC, created_at ASC
     LIMIT 1`,
    [firmId, seqClass],
  );
  return bind.rows[0]?.template_id ?? preferred;
}

function listingNotEmpty(ctx: WalkContext): boolean {
  const fromCtx = ctx.listingFieldIds ?? [];
  const fromOut = ctx.lastOutput?.listingFieldIds;
  const ids = Array.isArray(fromOut) ? (fromOut as unknown[]).map(String) : fromCtx;
  if (ids.length > 0) return true;
  if (ctx.lastOutput?.listingNotEmpty === true) return true;
  if (typeof ctx.lastOutput?.listingCount === "number") {
    return (ctx.lastOutput.listingCount as number) > 0;
  }
  return false;
}

function evalBranch(
  data: Record<string, unknown> | undefined,
  ctx: WalkContext,
): "true" | "false" {
  const kind = String(data?.branchKind ?? "true_false");
  if (kind === "if" || kind === "true_false") {
    const filter = String(data?.filterSummary ?? data?.label ?? "").toLowerCase();
    if (filter.includes("listing")) {
      return listingNotEmpty(ctx) ? "true" : "false";
    }
    if (ctx.lastOutput?.pass === false || ctx.lastOutput?.ok === false) return "false";
    if (ctx.lastOutput?.pass === true || ctx.lastOutput?.ok === true) return "true";
    if (ctx.eligibilityPass === false) return "false";
    if (ctx.eligibilityPass === true) return "true";
    if (filter.includes("reactivation") && ctx.triggerPayload.motion === "nudge") {
      return "false";
    }
    return listingNotEmpty(ctx) || Object.keys(ctx.lastOutput ?? {}).length > 0 ? "true" : "true";
  }
  return "true";
}

const PERSON_WRITE_TABLES = new Set([
  "sequence_ready",
  "reachability_verdicts",
  "contact_records",
  "contact_tag",
  "enrollment",
]);

function pickWrites(writes: RunWrite[], pickTable?: string, pickId?: string): RunWrite[] {
  if (pickId) return writes.filter((w) => w.id === pickId);
  if (pickTable) return writes.filter((w) => w.table === pickTable);
  return writes;
}

function uniqueIds(ids: Array<string | null | undefined>): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

function personIdsFromWrites(writes: RunWrite[]): string[] {
  return uniqueIds(
    writes.map((w) => w.contact_id ?? (PERSON_WRITE_TABLES.has(w.table) ? w.id : null)),
  );
}

function mappedSlotWrites(
  data: Record<string, unknown>,
  ctx: WalkContext,
  slot: string,
): RunWrite[] | null {
  const slots = data.mappedSlots;
  if (!slots || typeof slots !== "object") return null;
  const chips = (slots as Record<string, unknown>)[slot];
  if (!Array.isArray(chips) || !chips.length) return null;
  return mappedWrites({ mappedSlots: { [slot]: chips } }, ctx);
}

function mappedWrites(
  data: Record<string, unknown>,
  ctx: WalkContext,
): RunWrite[] | null {
  const slots = data.mappedSlots;
  if (!slots || typeof slots !== "object") return null;
  const chips = Object.values(slots as Record<string, unknown>).flatMap((row) =>
    Array.isArray(row) ? row : [],
  );
  if (!chips.length) return null;
  const out: RunWrite[] = [];
  for (const chip of chips) {
    if (!chip || typeof chip !== "object") continue;
    const rec = chip as Record<string, unknown>;
    const fromNode = typeof rec.fromNodeId === "string" ? rec.fromNodeId : "";
    const source = (fromNode && ctx.chainWrites[fromNode]) || ctx.previousWrites;
    const table = typeof rec.table === "string" ? rec.table : "";
    const id = typeof rec.id === "string" ? rec.id : "";
    let rows = table ? source.filter((w) => w.table === table) : source;
    if (id) rows = rows.filter((w) => w.id === id || w.contact_id === id);
    out.push(...rows);
  }
  return out;
}

function commitWrites(ctx: WalkContext, nodeId: string, writes: RunWrite[]): void {
  ctx.chainWrites[nodeId] = writes;
  ctx.previousWrites = writes;
}

async function executeGet(
  pool: Pool,
  data: Record<string, unknown>,
): Promise<{ writes: RunWrite[]; contactIds?: string[] }> {
  const module = String(data.getModule ?? "contacts");
  const select = String(data.getSelect ?? "every");
  const class1 = String(data.getClass1 ?? "");
  const class2 = Array.isArray(data.getClass2) ? data.getClass2.map(String) : [];
  const class2All = data.getClass2All !== false && class2.length === 0;

  if (module === "reference") return { writes: [] };

  if (module === "contacts") {
    let q = `SELECT id, firm_id FROM contact_records`;
    const params: unknown[] = [];
    if (select !== "every") {
      if (!class1) return { writes: [] };
      q += ` WHERE firm_id=$1`;
      params.push(class1);
      if (!class2All) {
        q += ` AND id = ANY($2::text[])`;
        params.push(class2);
      }
    }
    const { rows } = await pool.query<{ id: string }>(q, params);
    const ids = rows.map((r) => r.id);
    const writes: RunWrite[] = ids.map((id) => ({ table: "contact_records", id, contact_id: id }));
    if (ids.length) {
      const verdicts = await pool.query<{ contact_id: string }>(
        `SELECT contact_id FROM reachability_verdicts WHERE contact_id = ANY($1::text[])`,
        [ids],
      );
      for (const row of verdicts.rows) {
        writes.push({ table: "reachability_verdicts", id: row.contact_id, contact_id: row.contact_id });
      }
      const ready = await pool.query<{ contact_id: string }>(
        `SELECT contact_id FROM sequence_ready WHERE contact_id = ANY($1::text[])`,
        [ids],
      );
      for (const row of ready.rows) {
        writes.push({ table: "sequence_ready", id: row.contact_id, contact_id: row.contact_id });
      }
    }
    return { writes, contactIds: ids };
  }

  if (module === "firms") {
    if (select === "every") {
      const { rows } = await pool.query<{ id: string }>(`SELECT id FROM ct_firms`);
      return { writes: rows.map((r) => ({ table: "ct_firms", id: r.id })) };
    }
    return class1 ? { writes: [{ table: "ct_firms", id: class1 }] } : { writes: [] };
  }

  if (module === "audits") {
    let q = `SELECT id FROM audit_runs`;
    const params: unknown[] = [];
    if (select !== "every") {
      if (!class1) return { writes: [] };
      q += ` WHERE firm_id=$1`;
      params.push(class1);
      if (!class2All) {
        q += ` AND id = ANY($2::text[])`;
        params.push(class2);
      }
    }
    const { rows } = await pool.query<{ id: string }>(q, params);
    return { writes: rows.map((r) => ({ table: "audit_runs", id: r.id })) };
  }

  if (module === "imports") {
    let q = `SELECT id FROM import_batch WHERE kind='contact'`;
    const params: unknown[] = [];
    if (select !== "every") {
      if (!class1) return { writes: [] };
      q += ` AND firm_id=$1`;
      params.push(class1);
      if (!class2All) {
        q += ` AND id = ANY($2::text[])`;
        params.push(class2);
      }
    }
    const { rows } = await pool.query<{ id: string }>(q, params);
    return { writes: rows.map((r) => ({ table: "import_batch", id: r.id })) };
  }

  if (module === "agents") {
    if (select === "every") {
      const { rows } = await pool.query<{ id: string }>(`SELECT id FROM campaign`);
      return { writes: rows.map((r) => ({ table: "campaign", id: r.id })) };
    }
    if (!class1) return { writes: [] };
    if (class2All) {
      const { rows } = await pool.query<{ id: string }>(
        `SELECT id FROM campaign WHERE sequence_id=$1`,
        [class1],
      );
      return { writes: rows.map((r) => ({ table: "campaign", id: r.id })) };
    }
    return { writes: class2.map((id) => ({ table: "campaign", id })) };
  }

  return { writes: [] };
}

async function executeRuleWrites(
  pool: Pool,
  ctx: WalkContext,
  data: Record<string, unknown>,
): Promise<{ writes: RunWrite[]; lastOutput: Record<string, unknown> }> {
  const ruleConfig =
    data.ruleConfig && typeof data.ruleConfig === "object"
      ? (data.ruleConfig as Record<string, unknown>)
      : {};
  const listingFieldIds = Array.isArray(ruleConfig.listingFieldIds)
    ? (ruleConfig.listingFieldIds as unknown[]).map(String)
    : Array.isArray(data.listingFieldIds)
      ? (data.listingFieldIds as unknown[]).map(String)
      : [];
  const direct = Array.isArray(data.directContactIds)
    ? (data.directContactIds as unknown[]).map(String)
    : [];
  const contactIds = uniqueIds(direct.length ? direct : ctx.contactIds);
  const catalog = await pool.query<{ field_key: string; capture: string }>(
    `SELECT field_key, capture FROM collectible_fields ORDER BY ord`,
  );
  const selfReportable = new Set(
    catalog.rows.filter((row) => row.capture === "self_reportable").map((row) => row.field_key),
  );
  let keys = listingFieldIds.length
    ? listingFieldIds
    : catalog.rows.filter((row) => row.capture === "self_reportable").map((row) => row.field_key);
  if (selfReportable.size) keys = keys.filter((key) => selfReportable.has(key));
  const writes: RunWrite[] = [];
  const listingKeys = new Set<string>();
  for (const contactId of contactIds) {
    const rec = await pool.query<{ email: string | null; phone: string | null }>(
      `SELECT email, phone FROM contact_records WHERE id=$1`,
      [contactId],
    );
    for (const fieldKey of keys) {
      const filled = await pool.query(
        `SELECT 1 FROM fact_writebacks WHERE contact_id=$1 AND field_key=$2 LIMIT 1`,
        [contactId, fieldKey],
      );
      if (filled.rowCount) continue;
      if (fieldKey === "email" && rec.rows[0]?.email) continue;
      if (fieldKey === "phone" && rec.rows[0]?.phone) continue;
      const id = `mfs-${randomUUID()}`;
      await pool.query(
        `INSERT INTO missing_fact_signals (id, firm_id, contact_id, field_key)
         VALUES ($1,$2,$3,$4)`,
        [id, ctx.firmId, contactId, fieldKey],
      );
      writes.push({ table: "missing_fact_signals", id, contact_id: contactId });
      listingKeys.add(fieldKey);
    }
  }
  const listing = [...listingKeys];
  const lastOutput = {
    headline: writes.length ? "Required data" : "Pass",
    pass: writes.length === 0,
    requiredData: listing,
    listing,
    writes,
    nudge: Boolean(ruleConfig.nudgeSignalOn ?? true),
    reactivation: Boolean(ruleConfig.reactivationSignalOn ?? true),
  };
  return { writes, lastOutput };
}

function fieldMatches(val: unknown, op: string, expected: unknown): boolean {
  if (op === "exists") return val != null && val !== "";
  const eq =
    val === expected ||
    String(val) === String(expected) ||
    (val === false && (expected === "false" || expected === false)) ||
    (val === true && (expected === "true" || expected === true));
  if (op === "neq" || op === "not_equals") return !eq;
  return eq;
}

function nestedField(row: Record<string, unknown> | null, field: string): unknown {
  if (!row || !field) return undefined;
  const parts = field.split(".");
  let cur: unknown = row;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

async function loadWriteRow(
  pool: Pool,
  firmId: string,
  w: RunWrite,
): Promise<Record<string, unknown> | null> {
  const contactId = w.contact_id ?? w.id;
  if (w.table === "sequence_ready") {
    const { rows } = await pool.query(
      `SELECT * FROM sequence_ready WHERE contact_id=$1 AND firm_id=$2`,
      [contactId, firmId],
    );
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  if (w.table === "reachability_verdicts") {
    const { rows } = await pool.query(
      `SELECT * FROM reachability_verdicts WHERE contact_id=$1 AND firm_id=$2`,
      [contactId, firmId],
    );
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  if (w.table === "contact_records") {
    const { rows } = await pool.query(`SELECT * FROM contact_records WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  if (w.table === "contact_tag") {
    const { rows } = await pool.query(`SELECT * FROM contact_tag WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  if (w.table === "audit_runs") {
    const { rows } = await pool.query(`SELECT * FROM audit_runs WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  if (w.table === "import_batch") {
    const { rows } = await pool.query(`SELECT * FROM import_batch WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  if (w.table === "enrollment") {
    const { rows } = await pool.query(`SELECT * FROM enrollment WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  if (w.table === "missing_fact_signals") {
    const { rows } = await pool.query(`SELECT * FROM missing_fact_signals WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  return null;
}

async function loadWriteField(
  pool: Pool,
  firmId: string,
  w: RunWrite,
  field: string,
): Promise<unknown> {
  const row = await loadWriteRow(pool, firmId, w);
  return nestedField(row, field);
}

async function formFieldKeys(
  pool: Pool,
  ctx: WalkContext,
  data: Record<string, unknown>,
): Promise<string[]> {
  const slot = mappedSlotWrites(data, ctx, "form") ?? [];
  const keys: string[] = [];
  for (const w of slot.filter((row) => row.table === "missing_fact_signals")) {
    const rec = await loadWriteRow(pool, ctx.firmId, w);
    const key = rec && typeof rec.field_key === "string" ? rec.field_key.trim() : "";
    if (key) keys.push(key);
  }
  return uniqueIds(keys);
}

function outgoingHandle(edges: RfEdge[], sourceId: string, handle: string): RfEdge[] {
  return edges.filter((e) => e.source === sourceId && e.sourceHandle === handle);
}

async function contactsForAudit(
  pool: Pool,
  ctx: WalkContext,
  picked: RunWrite[],
): Promise<Array<{ id: string; email?: string | null; phone?: string | null; name?: string | null }>> {
  const importIds = uniqueIds(picked.filter((w) => w.table === "import_batch").map((w) => w.id));
  const pickedContactIds = uniqueIds(
    picked.filter((w) => w.table === "contact_records").map((w) => w.contact_id ?? w.id),
  );
  const ids = ctx.contactIds.length ? ctx.contactIds : pickedContactIds;
  if (ids.length) {
    const { rows } = await pool.query<{
      id: string;
      email: string | null;
      phone: string | null;
      name: string | null;
    }>(
      `SELECT id, email, phone, name FROM contact_records WHERE firm_id=$1 AND id = ANY($2::text[])`,
      [ctx.firmId, ids],
    );
    return rows;
  }
  if (importIds.length) {
    const { rows } = await pool.query<{
      id: string;
      email: string | null;
      phone: string | null;
      name: string | null;
    }>(
      `SELECT id, email, phone, name FROM contact_records
       WHERE firm_id=$1 AND import_batch_id = ANY($2::text[])`,
      [ctx.firmId, importIds],
    );
    return rows;
  }
  return [];
}

async function noteFromVerdict(
  pool: Pool,
  ctx: WalkContext,
  contactId: string,
): Promise<string | null> {
  const hit = ctx.previousWrites.find(
    (w) =>
      w.table === "reachability_verdicts" &&
      (w.contact_id === contactId || w.id === contactId),
  );
  if (!hit) return null;
  const row = await loadWriteRow(pool, ctx.firmId, hit);
  if (!row) return null;
  const details = row.details;
  if (details && typeof details === "object") {
    const rationale = (details as Record<string, unknown>).rationale;
    if (typeof rationale === "string" && rationale.trim()) return rationale.trim();
  }
  return typeof row.verdict === "string" ? row.verdict : null;
}

function chipTable(data: Record<string, unknown>, slot: string): string {
  const slots = data.mappedSlots;
  if (!slots || typeof slots !== "object") return "";
  const chips = (slots as Record<string, unknown>)[slot];
  if (!Array.isArray(chips) || !chips[0] || typeof chips[0] !== "object") return "";
  const table = (chips[0] as Record<string, unknown>).table;
  return typeof table === "string" ? table : "";
}

function chipField(data: Record<string, unknown>, slot: string): string {
  const slots = data.mappedSlots;
  if (!slots || typeof slots !== "object") return "";
  const chips = (slots as Record<string, unknown>)[slot];
  if (!Array.isArray(chips) || !chips[0] || typeof chips[0] !== "object") return "";
  const field = (chips[0] as Record<string, unknown>).field;
  return typeof field === "string" ? field : "";
}

type WalkOperand = { mode: "chip"; slot: string } | { mode: "text"; value: string };
type WalkCompare = { left: WalkOperand; op: string; right: WalkOperand };

function parseOperand(raw: unknown): WalkOperand | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  if (rec.mode === "chip" && typeof rec.slot === "string") return { mode: "chip", slot: rec.slot };
  if (rec.mode === "text") return { mode: "text", value: String(rec.value ?? "") };
  return null;
}

function parseCompare(raw: unknown): WalkCompare | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const left = parseOperand(rec.left);
  if (!left) return null;
  const right = parseOperand(rec.right) ?? { mode: "text" as const, value: "" };
  return { left, op: typeof rec.op === "string" ? rec.op : "eq", right };
}

function comparesForIf(data: Record<string, unknown>): WalkCompare[] {
  const main = parseCompare(data.compare);
  const extra = Array.isArray(data.and)
    ? (data.and.map(parseCompare).filter(Boolean) as WalkCompare[])
    : [];
  if (main) return [main, ...extra];
  const pickTable = String(data.pickTable ?? "").trim();
  const pickField = String(data.pickField ?? "").trim();
  if (pickTable && pickField) {
    return [
      {
        left: { mode: "chip", slot: "__legacy" },
        op: String(data.pickOp ?? "eq"),
        right: { mode: "text", value: String(data.pickValue ?? "") },
      },
    ];
  }
  return [];
}

function personTableOf(data: Record<string, unknown>, compares: WalkCompare[]): string | null {
  for (const cmp of compares) {
    if (cmp.left.mode !== "chip") continue;
    const table =
      cmp.left.slot === "__legacy" ? String(data.pickTable ?? "") : chipTable(data, cmp.left.slot);
    if (PERSON_WRITE_TABLES.has(table)) return table;
  }
  return null;
}

async function resolveOperandText(
  pool: Pool,
  ctx: WalkContext,
  data: Record<string, unknown>,
  operand: WalkOperand,
  contactId?: string,
): Promise<string | undefined> {
  if (operand.mode === "text") return operand.value;
  if (operand.slot === "__legacy") {
    const pickTable = String(data.pickTable ?? "").trim();
    const pickField = String(data.pickField ?? "").trim();
    const picked = pickWrites(ctx.previousWrites, pickTable);
    const w = contactId
      ? picked.find((row) => row.contact_id === contactId || row.id === contactId) ?? picked[0]
      : picked[0];
    if (!w) return undefined;
    const val = await loadWriteField(pool, ctx.firmId, w, pickField);
    return val == null ? undefined : String(val);
  }
  const writes = mappedSlotWrites(data, ctx, operand.slot) ?? [];
  const w = contactId
    ? writes.find((row) => row.contact_id === contactId || row.id === contactId) ?? writes[0]
    : writes[0];
  if (!w) return undefined;
  const field = chipField(data, operand.slot);
  if (!field) return writes.length ? String(w.id) : undefined;
  const val = await loadWriteField(pool, ctx.firmId, w, field);
  return val == null ? undefined : String(val);
}

async function comparePasses(
  pool: Pool,
  ctx: WalkContext,
  data: Record<string, unknown>,
  cmp: WalkCompare,
  contactId?: string,
): Promise<boolean> {
  const left = await resolveOperandText(pool, ctx, data, cmp.left, contactId);
  if (cmp.op === "exists") return left != null && left !== "";
  if (left == null || left === "") return false;
  const right = await resolveOperandText(pool, ctx, data, cmp.right, contactId);
  if (right == null || right === "") return false;
  return fieldMatches(left, cmp.op, right);
}

async function allComparesPass(
  pool: Pool,
  ctx: WalkContext,
  data: Record<string, unknown>,
  compares: WalkCompare[],
  contactId?: string,
): Promise<boolean> {
  if (!compares.length) return false;
  for (const cmp of compares) {
    if (!(await comparePasses(pool, ctx, data, cmp, contactId))) return false;
  }
  return true;
}

async function evalIfPick(
  pool: Pool,
  ctx: WalkContext,
  data: Record<string, unknown>,
): Promise<{ thenIds: string[]; elseIds: string[]; pass: boolean; personSplit: boolean }> {
  const compares = comparesForIf(data);
  const personTable = personTableOf(data, compares);
  if (personTable && ctx.contactIds.length) {
    const thenIds: string[] = [];
    const elseIds: string[] = [];
    for (const cid of ctx.contactIds) {
      if (await allComparesPass(pool, ctx, data, compares, cid)) thenIds.push(cid);
      else elseIds.push(cid);
    }
    return { thenIds, elseIds, pass: thenIds.length > 0, personSplit: true };
  }
  const pass = await allComparesPass(pool, ctx, data, compares);
  return {
    thenIds: pass ? ctx.contactIds : [],
    elseIds: pass ? [] : ctx.contactIds,
    pass,
    personSplit: false,
  };
}

function switchPathsOf(data: Record<string, unknown>): Array<{ sourceHandle: string; compare: WalkCompare | null }> {
  const raw = Array.isArray(data.paths) ? data.paths : [];
  return raw.map((row) => {
    if (!row || typeof row !== "object") return { sourceHandle: "", compare: null };
    const rec = row as Record<string, unknown>;
    const sourceHandle = String(rec.sourceHandle ?? rec.id ?? "");
    return { sourceHandle, compare: parseCompare(rec.compare) };
  }).filter((row) => row.sourceHandle);
}

export async function materializeTriggersFromGraph(
  pool: Pool,
  workflowId: string,
  firmId: string | null,
  graph: { nodes?: RfNode[]; edges?: RfEdge[] },
): Promise<number> {
  const nodes = graph.nodes ?? [];
  let n = 0;
  for (const node of nodes) {
    if (node.type !== "trigger") continue;
    const data = node.data ?? {};
    const kind = triggerKind(data);
    const eventName =
      kind === "event"
        ? String(data.triggerEvent ?? data.eventName ?? "eligibility.changed")
        : null;
    const webhookId =
      kind === "webhook"
        ? String(data.webhookId ?? `wh_${workflowId}_${node.id}`)
        : null;
    const id = `wtrig-${workflowId}-${node.id}`;
    const grain =
      kind === "schedule" || kind === "manual" || kind === "webhook"
        ? "global"
        : String(data.grain ?? "global") === "local"
          ? "local"
          : "global";
    const localRef =
      grain === "local" ? String(data.localRef ?? data.local_ref ?? "").trim() || null : null;
    const localFirmId =
      grain === "local" ? String(data.localFirmId ?? data.local_firm_id ?? "").trim() || null : null;
    const localContactIds =
      grain === "local"
        ? (Array.isArray(data.localContactIds)
            ? data.localContactIds
            : Array.isArray(data.local_contact_ids)
              ? data.local_contact_ids
              : []
          ).map(String)
        : [];
    await pool.query(
      `INSERT INTO workflow_trigger
         (id, workflow_id, firm_id, node_id, type, event_name, condition, schedule, webhook_id,
          enabled, grain, scope, scope_contact_ids, local_ref, local_firm_id, local_contact_ids)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,true,$10,'every_firm',ARRAY[]::text[],$11,$12,$13::text[])
       ON CONFLICT (workflow_id, node_id) DO UPDATE SET
         type=EXCLUDED.type,
         event_name=EXCLUDED.event_name,
         condition=EXCLUDED.condition,
         schedule=EXCLUDED.schedule,
         webhook_id=EXCLUDED.webhook_id,
         grain=EXCLUDED.grain,
         scope=EXCLUDED.scope,
         scope_contact_ids=EXCLUDED.scope_contact_ids,
         local_ref=EXCLUDED.local_ref,
         local_firm_id=EXCLUDED.local_firm_id,
         local_contact_ids=EXCLUDED.local_contact_ids,
         enabled=true,
         updated_at=now()`,
      [
        id,
        workflowId,
        firmId,
        node.id,
        kind === "webhook" ? "webhook" : kind,
        eventName,
        JSON.stringify(data.eventTriggerConfig ?? data.condition ?? {}),
        JSON.stringify({
          summary: data.scheduleSummary ?? null,
          cron: data.scheduleCron ?? null,
        }),
        webhookId,
        grain,
        localRef,
        localFirmId,
        localContactIds,
      ],
    );
    n += 1;
  }
  // Disable triggers for removed nodes
  const keep = nodes.filter((x) => x.type === "trigger").map((x) => x.id);
  if (keep.length) {
    await pool.query(
      `UPDATE workflow_trigger SET enabled=false, updated_at=now()
       WHERE workflow_id=$1 AND NOT (node_id = ANY($2::text[]))`,
      [workflowId, keep],
    );
  }
  return n;
}

export async function walkValidatedWorkflow(
  pool: Pool,
  opts: {
    workflowId: string;
    firmId: string;
    runId: string;
    triggerLabel: string;
    triggerPayload?: Record<string, unknown>;
    contactIds?: string[];
    untilNodeId?: string;
  },
): Promise<{
  ok: boolean;
  nodeStatus: Record<string, NodeRunStatus>;
  enrollments: string[];
  error?: string;
}> {
  const wf = await pool.query<{ graph: { nodes: RfNode[]; edges: RfEdge[] } }>(
    `SELECT graph FROM workflow WHERE id=$1 AND (firm_id=$2 OR firm_id IS NULL)`,
    [opts.workflowId, opts.firmId],
  );
  if (!wf.rowCount) {
    return { ok: false, nodeStatus: {}, enrollments: [], error: "workflow missing" };
  }
  const graph = wf.rows[0].graph ?? { nodes: [], edges: [] };
  const nodes = (graph.nodes ?? []) as RfNode[];
  const edges = (graph.edges ?? []) as RfEdge[];
  const byId = new Map(nodes.map((n) => [n.id, n]));

  if (!isValidatedPipeline(nodes)) {
    return {
      ok: false,
      nodeStatus: {},
      enrollments: [],
      error: "graph is not validated shape (need trigger + action/exit)",
    };
  }

  const triggers = nodes.filter((n) => n.type === "trigger");
  const start = triggers[0];
  if (!start) {
    return { ok: false, nodeStatus: {}, enrollments: [], error: "no trigger" };
  }

  let contactIds = opts.contactIds ?? [];
  const triggerWrites = writesFromPayload(opts.triggerPayload);
  if (!contactIds.length) {
    contactIds = personIdsFromWrites(triggerWrites);
  }

  const ctx: WalkContext = {
    firmId: opts.firmId,
    workflowId: opts.workflowId,
    runId: opts.runId,
    triggerPayload: opts.triggerPayload ?? {},
    constants: {},
    contactIds,
    previousWrites: triggerWrites,
    chainWrites: {},
    eligibilityPass:
      opts.triggerPayload?.anyPass === true ||
      opts.triggerPayload?.eligibilityPass === true ||
      opts.triggerLabel.includes("eligibility") ||
      undefined,
  };

  const nodeStatus: Record<string, NodeRunStatus> = {};
  const enrollments: string[] = [];
  const visited = new Set<string>();

  const goOn = async (fromId: string, list: RfEdge[]) => {
    if (opts.untilNodeId === fromId) return;
    for (const e of list) await visit(e.target);
  };

  async function visit(nodeId: string): Promise<void> {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = byId.get(nodeId);
    if (!node) return;
    const data = node.data ?? {};
    const type = node.type ?? "";

    try {
      if (type !== "trigger" && data.configured === false) {
        nodeStatus[nodeId] = {
          status: "failed",
          detail: "not configured",
          at: now(),
        };
        return;
      }
      if (type === "trigger") {
        commitWrites(ctx, nodeId, ctx.previousWrites);
        nodeStatus[nodeId] = {
          status: "success",
          detail: `trigger ${triggerKind(data)}`,
          at: now(),
          writes: ctx.previousWrites,
        };
        await goOn(nodeId, outgoing(edges, nodeId));
        return;
      }

      if (type === "constant") {
        const packId = String(data.constantSummary ?? data.packId ?? "default");
        const pack = await pool.query<{ payload: Record<string, unknown> }>(
          `SELECT payload FROM constants_packs WHERE id=$1 OR name=$2 LIMIT 1`,
          [packId, packId],
        );
        if (pack.rows[0]?.payload) {
          ctx.constants = { ...ctx.constants, ...pack.rows[0].payload };
        } else {
          ctx.constants = { ...ctx.constants, [packId]: true };
        }
        nodeStatus[nodeId] = { status: "success", detail: `constants ${packId}`, at: now() };
        await goOn(nodeId, outgoing(edges, nodeId));
        return;
      }

      if (type === "branch" || type === "if") {
        const picked = await evalIfPick(pool, ctx, data);
        ctx.branchTaken = picked.pass ? "true" : "false";
        ctx.chainWrites[nodeId] = ctx.previousWrites;
        nodeStatus[nodeId] = {
          status: "success",
          detail: picked.personSplit
            ? `if pick ${String(data.pickTable ?? "")}.${String(data.pickField ?? "")} then=${picked.thenIds.length} else=${picked.elseIds.length}`
            : `branch → ${ctx.branchTaken}`,
          at: now(),
          writes: ctx.previousWrites,
        };
        if (picked.personSplit) {
          const savedIds = ctx.contactIds;
          const savedWrites = ctx.previousWrites;
          ctx.contactIds = picked.thenIds;
          await goOn(nodeId, outgoingHandle(edges, nodeId, "true"));
          ctx.previousWrites = savedWrites;
          ctx.contactIds = picked.elseIds;
          await goOn(nodeId, outgoingHandle(edges, nodeId, "false"));
          ctx.contactIds = savedIds;
          ctx.previousWrites = savedWrites;
          return;
        }
        const handle = picked.pass ? "true" : "false";
        await goOn(nodeId, outgoingHandle(edges, nodeId, handle));
        return;
      }

      if (type === "switch") {
        const paths = switchPathsOf(data);
        const fallbackHandle =
          typeof data.fallbackHandle === "string" && data.fallbackHandle.trim()
            ? data.fallbackHandle.trim()
            : "fallback";
        ctx.chainWrites[nodeId] = ctx.previousWrites;
        const personSplit = paths.some(
          (path) => path.compare != null && personTableOf(data, [path.compare]),
        );
        nodeStatus[nodeId] = {
          status: "success",
          detail: personSplit ? `switch person-split paths=${paths.length}` : "switch",
          at: now(),
          writes: ctx.previousWrites,
        };

        const firstMatchHandle = async (contactId?: string): Promise<string> => {
          for (const path of paths) {
            const compares = path.compare ? [path.compare] : [];
            if (await allComparesPass(pool, ctx, data, compares, contactId)) {
              return path.sourceHandle;
            }
          }
          return fallbackHandle;
        };

        if (personSplit && ctx.contactIds.length) {
          const buckets = new Map<string, string[]>();
          for (const cid of ctx.contactIds) {
            const taken = await firstMatchHandle(cid);
            const list = buckets.get(taken) ?? [];
            list.push(cid);
            buckets.set(taken, list);
          }
          const savedIds = ctx.contactIds;
          const savedWrites = ctx.previousWrites;
          const order = [...paths.map((path) => path.sourceHandle), fallbackHandle];
          for (const taken of order) {
            const ids = buckets.get(taken);
            if (!ids?.length) continue;
            ctx.contactIds = ids;
            ctx.previousWrites = savedWrites;
            await goOn(nodeId, outgoingHandle(edges, nodeId, taken));
          }
          ctx.contactIds = savedIds;
          ctx.previousWrites = savedWrites;
          return;
        }

        const taken = await firstMatchHandle();
        await goOn(nodeId, outgoingHandle(edges, nodeId, taken));
        return;
      }

      if (type === "get") {
        const mapped = mappedWrites(data, ctx);
        const result = mapped
          ? { writes: mapped, contactIds: personIdsFromWrites(mapped) }
          : await executeGet(pool, data);
        commitWrites(ctx, nodeId, result.writes);
        if (result.contactIds?.length) ctx.contactIds = result.contactIds;
        ctx.lastOutput = { writes: result.writes, module: data.getModule ?? "contacts" };
        nodeStatus[nodeId] = {
          status: "success",
          detail: `get ${String(data.getModule ?? "contacts")}; writes=${result.writes.length}`,
          at: now(),
          writes: result.writes,
        };
        await goOn(nodeId, outgoing(edges, nodeId));
        return;
      }

      if (type === "rule") {
        const ruleId = String(data.ruleId ?? "eligibility");
        const result = await executeRuleWrites(pool, ctx, data);
        ctx.listingFieldIds = Array.isArray(result.lastOutput.listing)
          ? (result.lastOutput.listing as string[])
          : [];
        commitWrites(ctx, nodeId, result.writes.length ? result.writes : ctx.previousWrites);
        ctx.lastOutput = result.lastOutput;
        if (Array.isArray(data.directContactIds) && (data.directContactIds as unknown[]).length) {
          ctx.contactIds = uniqueIds((data.directContactIds as unknown[]).map(String));
        }
        nodeStatus[nodeId] = {
          status: "success",
          detail: `rule ${ruleId}; missing=${result.writes.length}`,
          at: now(),
          writes: result.writes,
          listing: result.lastOutput.listing,
          requiredData: result.lastOutput.requiredData,
          headline: result.lastOutput.headline,
          pass: result.lastOutput.pass,
          nudge: result.lastOutput.nudge,
          reactivation: result.lastOutput.reactivation,
        };
        if (ctx.eligibilityPass === undefined) ctx.eligibilityPass = result.writes.length === 0;
        await goOn(nodeId, outgoing(edges, nodeId));
        return;
      }

      if (type === "action") {
        const actionType = normalizeActionType(data);
        const inApp = String(data.inAppAffordance ?? "");
        const mapped = mappedWrites(data, ctx);
        if (mapped) {
          const people = personIdsFromWrites(mapped);
          if (people.length) ctx.contactIds = people;
        }
        const rawAction = String(data.actionType ?? "");
        if (inApp && rawAction !== "run_audit" && rawAction !== "ascribe_tag") {
          commitWrites(ctx, nodeId, []);
          ctx.lastOutput = { silent: true, inApp };
          nodeStatus[nodeId] = {
            status: "success",
            detail: `${inApp} silent until wrap`,
            at: now(),
            writes: [],
          };
          await goOn(nodeId, outgoing(edges, nodeId));
          return;
        }
        const actionId = `act-${opts.workflowId}-${nodeId}`;
        const persistAction = async (
          agentRef: string | null,
          payload: Record<string, unknown>,
        ) => {
          await pool.query(
            `INSERT INTO action (id, workflow_id, node_id, type, agent_ref, payload_binding)
             VALUES ($1,$2,$3,$4,$5,$6::jsonb)
             ON CONFLICT (id) DO UPDATE SET
               type=EXCLUDED.type,
               agent_ref=EXCLUDED.agent_ref,
               payload_binding=EXCLUDED.payload_binding`,
            [actionId, opts.workflowId, nodeId, actionType, agentRef, JSON.stringify(payload)],
          );
        };

        if (actionType === "call_agent") {
          let preferred = actionAgentRef(data) ?? "tpl.optin_launch.v1";
          if (String(data.assignMode ?? "existing") === "from_template") {
            const seqClass = sequenceClassForAgent(
              String(data.copySequenceClass ?? preferred),
            );
            preferred = await copySequenceFromTemplate(pool, {
              firmId: opts.firmId,
              sequenceClass: seqClass,
              sourceTemplateId: platformTemplateIdForClass(seqClass),
            });
          }
          const agentRef = await resolveAgentRef(pool, opts.firmId, preferred);
          let enrolled = 0;
          const writes: RunWrite[] = [];
          for (const contactId of ctx.contactIds) {
            const result = await enrollAndActuate({
              firmId: opts.firmId,
              contactId,
              agentRef,
              sequenceId: agentRef,
              workflowRunId: opts.runId,
              purpose: sequenceClassForAgent(agentRef) === "optin" ? "opt-in" : "cem",
              payload: {
                workflowId: opts.workflowId,
                runId: opts.runId,
                constants: ctx.constants,
                trigger: opts.triggerPayload,
                dryRunBinding: true,
              },
              fireFirstStep: true,
            });
            if (result.blocked === "halt") continue;
            enrollments.push(result.enrollmentId);
            writes.push({
              table: "enrollment",
              id: result.enrollmentId,
              contact_id: contactId,
            });
            enrolled += 1;
          }
          const fieldKeys =
            String(data.objectiveKind ?? "") === "form"
              ? await formFieldKeys(pool, ctx, data)
              : [];
          await persistAction(agentRef, {
            enrollments,
            label: data.label ?? null,
            objectiveKind: data.objectiveKind ?? null,
            fieldKeys,
            formQuestionIds: data.formQuestionIds ?? [],
          });
          commitWrites(ctx, nodeId, writes);
          ctx.lastOutput = { ok: true, actionType, agentRef, enrollments: enrolled, writes };
          nodeStatus[nodeId] = {
            status: "success",
            detail: `action ${agentRef}; enrollments=${enrolled}`,
            at: now(),
            writes,
          };
          await goOn(nodeId, outgoing(edges, nodeId));
          return;
        }

        if (actionType === "ascribe_tag") {
          const tag = String(data.tag ?? data.actionSummary ?? data.label ?? "tagged");
          const notesFromVerdict = data.notesFromVerdict === true;
          const fromContact = mappedSlotWrites(data, ctx, "contact");
          const chipPeople = fromContact ? personIdsFromWrites(fromContact) : [];
          const pickTable = String(data.pickTable ?? "").trim();
          const picked = pickWrites(ctx.previousWrites, pickTable || undefined);
          const contactIds = uniqueIds(
            (pickTable
              ? picked.map((w) => w.contact_id ?? (PERSON_WRITE_TABLES.has(w.table) ? w.id : null))
              : ctx.contactIds) as Array<string | null>,
          );
          const ids = chipPeople.length ? chipPeople : contactIds.length ? contactIds : ctx.contactIds;
          const writes: RunWrite[] = [];
          for (const contactId of ids) {
            const tagId = `tag-${randomUUID()}`;
            await pool.query(
              `INSERT INTO contact_tag (id, firm_id, contact_id, tag, source_workflow_id)
               VALUES ($1,$2,$3,$4,$5)`,
              [tagId, opts.firmId, contactId, tag, opts.workflowId],
            );
            writes.push({ table: "contact_tag", id: tagId, contact_id: contactId });
            if (notesFromVerdict) {
              const note = await noteFromVerdict(pool, ctx, contactId);
              if (note) {
                await pool.query(
                  `UPDATE contact_records SET notes=$1, updated_at=now() WHERE id=$2 AND firm_id=$3`,
                  [note, contactId, opts.firmId],
                );
                writes.push({ table: "contact_records", id: contactId, contact_id: contactId });
              }
            }
          }
          await persistAction(null, { tag, contacts: ids.length, notesFromVerdict });
          commitWrites(ctx, nodeId, writes);
          ctx.lastOutput = { ok: true, actionType, tag, contacts: ids.length, writes };
          nodeStatus[nodeId] = {
            status: "success",
            detail: `ascribe_tag ${tag}; contacts=${ids.length}`,
            at: now(),
            writes,
          };
          await goOn(nodeId, outgoing(edges, nodeId));
          return;
        }

        if (actionType === "run_audit") {
          const handle = mapped ?? ctx.previousWrites;
          const pickTable = String(data.pickTable ?? "import_batch").trim();
          const picked = pickWrites(handle, pickTable || undefined);
          const importIds = uniqueIds(
            (pickTable === "import_batch" ? picked : handle)
              .filter((w) => w.table === "import_batch")
              .map((w) => w.id),
          );
          const contacts = await contactsForAudit(pool, ctx, picked.length ? picked : handle);
          const result = await executeAuditRun(pool, {
            firmId: opts.firmId,
            importIds,
            contacts,
          });
          await persistAction(null, {
            auditRunId: result.id,
            label: data.label ?? "Audit the contacts",
            writes: result.writes,
          });
          commitWrites(ctx, nodeId, result.writes);
          ctx.contactIds = uniqueIds(contacts.map((c) => c.id));
          ctx.lastOutput = {
            ok: true,
            actionType,
            auditRunId: result.id,
            summary: result.summary,
            writes: result.writes,
          };
          if (!String(opts.triggerLabel).includes("audit.completed")) {
            await dispatchEventToWorkflows(pool, {
              firmId: opts.firmId,
              eventName: "audit.completed",
              payload: {
                auditRunId: result.id,
                workflowId: opts.workflowId,
                writes: result.writes,
                summary: result.summary,
              },
              contactIds: ctx.contactIds,
            });
          }
          nodeStatus[nodeId] = {
            status: "success",
            detail: `run_audit ${result.id}`,
            at: now(),
            writes: result.writes,
          };
          await goOn(nodeId, outgoing(edges, nodeId));
          return;
        }

        let n = 0;
        const writes: RunWrite[] = [];
        for (const contactId of ctx.contactIds) {
          await writeEngagement(pool, opts.firmId, contactId, actionType, {
            workflowId: opts.workflowId,
            runId: opts.runId,
            label: data.label ?? null,
            formQuestionIds: data.formQuestionIds ?? [],
          });
          writes.push({ table: "engagement_records", id: contactId, contact_id: contactId });
          n += 1;
        }
        await persistAction(null, { contacts: n, formQuestionIds: data.formQuestionIds ?? [] });
        commitWrites(ctx, nodeId, writes);
        ctx.lastOutput = { ok: true, actionType, contacts: n, writes };
        nodeStatus[nodeId] = {
          status: "success",
          detail: `${actionType}; contacts=${n}`,
          at: now(),
          writes,
        };
        await goOn(nodeId, outgoing(edges, nodeId));
        return;
      }

      if (type === "exit") {
        nodeStatus[nodeId] = { status: "success", detail: "exit", at: now() };
        return;
      }

      nodeStatus[nodeId] = {
        status: "skipped",
        detail: `unknown type ${type}`,
        at: now(),
      };
      await goOn(nodeId, outgoing(edges, nodeId));
    } catch (err) {
      nodeStatus[nodeId] = {
        status: "failed",
        detail: err instanceof Error ? err.message : String(err),
        at: now(),
      };
    }
  }

  await visit(start.id);

  const failed = Object.values(nodeStatus).some((s) => s.status === "failed");
  await pool.query(
    `UPDATE workflow_run
     SET status=$2, node_status=$3::jsonb, counts=$4::jsonb, finished_at=now()
     WHERE id=$1`,
    [
      opts.runId,
      failed ? "failed" : "success",
      JSON.stringify(nodeStatus),
      JSON.stringify({
        nodes: Object.keys(nodeStatus).length,
        enrollments: enrollments.length,
        contacts: ctx.contactIds.length,
      }),
    ],
  );

  return { ok: !failed, nodeStatus, enrollments };
}

/** Fire active schedule triggers (called from worker tick). */
export async function dispatchScheduleTriggers(
  pool: Pool,
): Promise<Array<{ workflowId: string; runId: string; enrollments: number }>> {
  const triggers = await pool.query<{ workflow_id: string; firm_id: string | null }>(
    `SELECT DISTINCT t.workflow_id, t.firm_id
     FROM workflow_trigger t
     JOIN workflow_state s ON s.workflow_id = t.workflow_id
     WHERE t.enabled=true AND t.type='schedule' AND s.status='active' AND t.firm_id IS NOT NULL`,
  );
  const out: Array<{ workflowId: string; runId: string; enrollments: number }> = [];
  for (const row of triggers.rows) {
    const runId = `run-${randomUUID()}`;
    await pool.query(
      `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label)
       VALUES ($1,$2,$3,'running',$4)`,
      [runId, row.workflow_id, row.firm_id, "schedule"],
    );
    const walked = await walkValidatedWorkflow(pool, {
      workflowId: row.workflow_id,
      firmId: row.firm_id as string,
      runId,
      triggerLabel: "schedule",
      triggerPayload: { schedule: true, anyPass: true },
    });
    out.push({
      workflowId: row.workflow_id,
      runId,
      enrollments: walked.enrollments.length,
    });
  }
  return out;
}

function payloadString(payload: Record<string, unknown> | undefined, keys: string[]): string | null {
  if (!payload) return null;
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function localRefFromPayload(
  eventName: string,
  payload: Record<string, unknown> | undefined,
): string | null {
  if (eventName === "fact_writebacks") return payloadString(payload, ["form_ref", "formRef"]);
  if (eventName === "campaign_failure") return payloadString(payload, ["campaign_id", "campaignId"]);
  if (eventName === "ct_firms") return payloadString(payload, ["id", "firm_id", "firmId"]);
  if (eventName === "consent_records.opt_out") return payloadString(payload, ["contact_id", "contactId"]);
  if (eventName === "contact_import") return payloadString(payload, ["import_batch_id", "importBatchId"]);
  if (eventName === "contact.created") return payloadString(payload, ["contact_id", "contactId", "id"]);
  if (eventName === "consent_records.sequenced") {
    return payloadString(payload, ["sequence_id", "sequenceId"]);
  }
  if (eventName === "contact_uploaded") return payloadString(payload, ["kind"]);
  if (eventName === "objective_met") {
    return payloadString(payload, ["campaign_objective_id", "campaignObjectiveId", "campaign_id", "campaignId"]);
  }
  return null;
}

function localAxesMatch(
  row: {
    grain: string;
    local_ref: string | null;
    local_firm_id: string | null;
    local_contact_ids: string[] | null;
  },
  opts: {
    firmId: string;
    eventName: string;
    payload?: Record<string, unknown>;
    contactIds?: string[];
  },
): boolean {
  if (row.grain !== "local") return true;
  if (row.local_firm_id) {
    const writeFirm = payloadString(opts.payload, ["firm_id", "firmId"]) ?? opts.firmId;
    if (writeFirm !== row.local_firm_id) return false;
  }
  const specified = (row.local_contact_ids ?? []).filter(Boolean);
  if (specified.length) {
    const cid = payloadString(opts.payload, ["contact_id", "contactId"]);
    const incoming = cid ? [cid] : (opts.contactIds ?? []);
    if (!incoming.some((id) => specified.includes(id))) return false;
  }
  if (row.local_ref) {
    if (localRefFromPayload(opts.eventName, opts.payload) !== row.local_ref) return false;
  }
  return true;
}

/** Dispatch event to all active workflows subscribed via workflow_trigger. */
export async function dispatchEventToWorkflows(
  pool: Pool,
  opts: {
    firmId: string;
    eventName: string;
    payload?: Record<string, unknown>;
    contactIds?: string[];
  },
): Promise<Array<{ workflowId: string; runId: string; enrollments: number }>> {
  const triggers = await pool.query<{
    workflow_id: string;
    grain: string;
    local_ref: string | null;
    local_firm_id: string | null;
    local_contact_ids: string[] | null;
    audience_scope: string | null;
    audience_contact_ids: string[] | null;
  }>(
    `SELECT DISTINCT ON (t.workflow_id)
            t.workflow_id, t.grain, t.local_ref, t.local_firm_id, t.local_contact_ids,
            w.audience_scope, w.audience_contact_ids
     FROM workflow_trigger t
     JOIN workflow_state s ON s.workflow_id = t.workflow_id
     JOIN workflow w ON w.id = t.workflow_id
     WHERE (t.firm_id=$1 OR t.firm_id IS NULL)
       AND t.enabled=true
       AND t.type='event'
       AND t.event_name=$2
       AND s.status='active'
     ORDER BY t.workflow_id, t.updated_at DESC`,
    [opts.firmId, opts.eventName],
  );

  const out: Array<{ workflowId: string; runId: string; enrollments: number }> = [];
  for (const row of triggers.rows) {
    if (
      !localAxesMatch(row, {
        firmId: opts.firmId,
        eventName: opts.eventName,
        payload: opts.payload,
        contactIds: opts.contactIds,
      })
    ) {
      continue;
    }
    let contactIds = opts.contactIds;
    const scope = row.audience_scope === "select_from" ? "select_from" : "every_firm";
    if (scope === "select_from") {
      const audience = row.audience_contact_ids ?? [];
      contactIds = (contactIds?.length ? contactIds : audience).filter((id) => audience.includes(id));
      if (!contactIds.length) continue;
    } else if (!contactIds?.length) {
      const book = await pool.query<{ id: string }>(
        `SELECT id FROM contact_records WHERE firm_id=$1`,
        [opts.firmId],
      );
      contactIds = book.rows.map((r) => r.id);
    }

    const runId = `run-${randomUUID()}`;
    await pool.query(
      `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label)
       VALUES ($1,$2,$3,'running',$4)`,
      [runId, row.workflow_id, opts.firmId, `event:${opts.eventName}`],
    );
    const walked = await walkValidatedWorkflow(pool, {
      workflowId: row.workflow_id,
      firmId: opts.firmId,
      runId,
      triggerLabel: `event:${opts.eventName}`,
      triggerPayload: { ...(opts.payload ?? {}), eventName: opts.eventName, anyPass: true },
      contactIds,
    });
    out.push({
      workflowId: row.workflow_id,
      runId,
      enrollments: walked.enrollments.length,
    });
  }
  return out;
}
