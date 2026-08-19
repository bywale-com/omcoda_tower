import type { Context } from "hono";
import { randomUUID } from "node:crypto";
import { mintAccessLink } from "../auth-service/accessLinks.ts";
import { resolveUserByEmail } from "../auth-service/db.ts";
import { sendAccessLinkEmail } from "../auth-service/email.ts";
import { isValidEmail, normalizeEmail } from "../auth-service/crypto.ts";
import { getPool } from "./db.ts";
import { executeAuditRun } from "./auditRun.ts";
import { enrollAndActuate, tickOnce } from "./cascade.ts";
import { sendGateSnapshot } from "./sendMode.ts";
import { isPlatformAdminEmail } from "../auth-service/platformAdmin.ts";
import { FirmScopeError, requireSessionActor, requireSessionFirm } from "./sessionFirm.ts";
import {
  dispatchEventToWorkflows,
  materializeTriggersFromGraph,
  walkValidatedWorkflow,
  type RfNode,
} from "./workflowWalk.ts";
import type { RunWrite } from "./runWrites.ts";
import {
  loadHousing,
  saveHousing,
  type CampaignDraft,
} from "./campaignHousing.ts";

function json(c: Context, body: unknown, status = 200) {
  return c.json(body, status);
}

/** Firm scope from authenticated session only — never a demo-tenant constant. */
async function firmId(c: Context): Promise<string> {
  return requireSessionFirm(c);
}

/** Create workflow (draft). */
export async function handleWorkflowCreate(c: Context) {
  const body = await c.req.json<{
    id?: string;
    name: string;
    target?: string;
    graph?: unknown;
    audienceScope?: "every_firm" | "select_from";
    audienceContactIds?: string[];
  }>();
  const id = body.id ?? `wf-${randomUUID()}`;
  const firm = await firmId(c);
  const target = body.target ?? "contact";
  const audienceScope = body.audienceScope === "select_from" ? "select_from" : "every_firm";
  const audienceIds = Array.isArray(body.audienceContactIds) ? body.audienceContactIds.map(String) : [];
  const pool = getPool();
  await pool.query(
    `INSERT INTO workflow (id, firm_id, name, target, graph, audience_scope, audience_contact_ids)
     VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7::text[])
     ON CONFLICT (id) DO UPDATE SET
       name=EXCLUDED.name,
       graph=EXCLUDED.graph,
       audience_scope=EXCLUDED.audience_scope,
       audience_contact_ids=EXCLUDED.audience_contact_ids,
       updated_at=now()`,
    [id, firm, body.name, target, JSON.stringify(body.graph ?? { nodes: [], edges: [] }), audienceScope, audienceIds],
  );
  await pool.query(
    `INSERT INTO workflow_state (workflow_id, status) VALUES ($1,'draft')
     ON CONFLICT (workflow_id) DO NOTHING`,
    [id],
  );
  await pool.query(
    `INSERT INTO workflow_target (workflow_id, target) VALUES ($1,$2)
     ON CONFLICT (workflow_id) DO UPDATE SET target=EXCLUDED.target`,
    [id, target],
  );
  const existing = await pool.query<{ firm_id: string | null }>(
    `SELECT firm_id FROM workflow WHERE id=$1`,
    [id],
  );
  const triggerFirm = existing.rowCount ? existing.rows[0].firm_id : firm;
  const graph = (body.graph ?? { nodes: [], edges: [] }) as { nodes?: RfNode[]; edges?: unknown[] };
  const triggersMaterialized = await materializeTriggersFromGraph(pool, id, triggerFirm, {
    nodes: graph.nodes ?? [],
    edges: (graph.edges ?? []) as never,
  });
  for (const node of graph.nodes ?? []) {
    if (node.type !== "rule") continue;
    const data = (node.data ?? {}) as Record<string, unknown>;
    const cfg =
      data.ruleConfig && typeof data.ruleConfig === "object"
        ? (data.ruleConfig as Record<string, unknown>)
        : {};
    const packId = String(cfg.packId ?? `rpack-${id}-${node.id}`);
    await pool.query(
      `INSERT INTO rule_pack
         (id, firm_id, workflow_id, name, families, custom_json, named_code, named_code_on, updated_at)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8,now())
       ON CONFLICT (id) DO UPDATE SET
         families=EXCLUDED.families,
         custom_json=EXCLUDED.custom_json,
         named_code=EXCLUDED.named_code,
         named_code_on=EXCLUDED.named_code_on,
         updated_at=now()`,
      [
        packId,
        firm,
        id,
        String(data.label ?? data.ruleSummary ?? "Rule"),
        JSON.stringify(cfg.enabledOutcomeIds ?? cfg.families ?? []),
        JSON.stringify(cfg.customJson ?? null),
        typeof cfg.namedCode === "string" ? cfg.namedCode : null,
        Boolean(cfg.namedCodeOn),
      ],
    );
  }
  return json(c, {
    id,
    firmId: firm,
    name: body.name,
    status: "draft",
    target,
    triggersMaterialized,
  });
}

/** Activate: draft → active + materialize workflow_trigger rows from graph. */
export async function handleWorkflowActivate(c: Context) {
  const workflowId = c.req.param("id");
  const firm = await firmId(c);
  const pool = getPool();
  const cur = await pool.query<{ status: string }>(
    `SELECT status FROM workflow_state WHERE workflow_id=$1`,
    [workflowId],
  );
  if (!cur.rowCount) return json(c, { error: "workflow_state missing" }, 404);

  const wf = await pool.query<{ graph: { nodes: RfNode[]; edges: unknown[] }; firm_id: string | null }>(
    `SELECT graph, firm_id FROM workflow WHERE id=$1`,
    [workflowId],
  );
  if (!wf.rowCount) return json(c, { error: "workflow missing" }, 404);

  await pool.query(
    `UPDATE workflow_state SET status='active', updated_at=now() WHERE workflow_id=$1`,
    [workflowId],
  );
  const triggers = await materializeTriggersFromGraph(
    pool,
    workflowId,
    wf.rows[0].firm_id,
    wf.rows[0].graph ?? { nodes: [], edges: [] },
  );
  return json(c, {
    workflowId,
    status: "active",
    transition: cur.rows[0].status === "active" ? "active→active" : "draft→active",
    triggersMaterialized: triggers,
  });
}

export async function handleWorkflowList(c: Context) {
  const firm = await firmId(c);
  const pool = getPool();
  const rows = await pool.query(
    `SELECT w.*, s.status
     FROM workflow w
     JOIN workflow_state s ON s.workflow_id = w.id
     WHERE w.firm_id=$1 OR w.firm_id IS NULL
     ORDER BY w.updated_at DESC`,
    [firm],
  );
  return json(c, { workflows: rows.rows });
}

export async function handleWorkflowRunStart(c: Context) {
  const workflowId = c.req.param("id");
  const firm = await firmId(c);
  const body = await c.req
    .json<{
      triggerLabel?: string;
      contactIds?: string[];
      payload?: Record<string, unknown>;
    }>()
    .catch(() => ({}));
  const id = `run-${randomUUID()}`;
  const pool = getPool();
  await pool.query(
    `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label)
     VALUES ($1,$2,$3,'running',$4)`,
    [id, workflowId, firm, body.triggerLabel ?? "Manual run"],
  );
  // Walk the saved graph (validated shape) — real execution, not a client timer
  const walked = await walkValidatedWorkflow(pool, {
    workflowId,
    firmId: firm,
    runId: id,
    triggerLabel: body.triggerLabel ?? "Manual run",
    triggerPayload: body.payload ?? { manual: true },
    contactIds: body.contactIds,
  });
  return json(c, {
    id,
    workflowId,
    status: walked.ok ? "success" : "failed",
    nodeStatus: walked.nodeStatus,
    enrollments: walked.enrollments,
    error: walked.error,
  });
}

export async function handleWorkflowRunComplete(c: Context) {
  const runId = c.req.param("runId");
  const body = await c.req.json<{
    status?: string;
    nodeStatus?: unknown;
    counts?: unknown;
  }>();
  const pool = getPool();
  await pool.query(
    `UPDATE workflow_run
     SET status=$2, node_status=$3::jsonb, counts=$4::jsonb, finished_at=now()
     WHERE id=$1`,
    [
      runId,
      body.status ?? "success",
      JSON.stringify(body.nodeStatus ?? {}),
      JSON.stringify(body.counts ?? {}),
    ],
  );
  return json(c, { id: runId, status: body.status ?? "success" });
}

export async function handleEnrollmentCreate(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{
    contactId: string;
    agentRef: string;
    sequenceId?: string;
    workflowRunId?: string;
    payload?: Record<string, unknown>;
    purpose?: string;
    fireFirstStep?: boolean;
  }>();
  const result = await enrollAndActuate({
    firmId: firm,
    contactId: body.contactId,
    agentRef: body.agentRef,
    sequenceId: body.sequenceId,
    workflowRunId: body.workflowRunId,
    payload: body.payload,
    purpose: body.purpose ?? "opt-in",
    fireFirstStep: body.fireFirstStep,
  });
  if (result.blocked === "halt") {
    return json(c, {
      deny: "policy",
      detail: "halt active",
      blocked: "halt",
      gate: sendGateSnapshot(),
    }, 403);
  }
  return json(c, {
    id: result.enrollmentId,
    attemptId: result.attemptId,
    dryRun: result.dryRun,
    send: result.send,
    enrolledAt: new Date().toISOString(),
    gate: sendGateSnapshot(),
  });
}

/**
 * Shared re-eval ring: eligibility_evaluation → result → signal → motion_decision
 * → eligibility.changed (workflows) / fallback enroll.
 */
async function runContactEligibilityCascade(opts: {
  firm: string;
  contactIds: string[];
  triggerKind: string;
  resultPayload: Record<string, unknown>;
  eventPayload: Record<string, unknown>;
}): Promise<{ cascade: unknown[]; workflowsFired: unknown[] }> {
  const pool = getPool();
  const cascade: unknown[] = [];
  for (const contactId of opts.contactIds) {
    const evalId = `eval-${randomUUID()}`;
    await pool.query(
      `INSERT INTO eligibility_evaluations (id, firm_id, contact_id, trigger_kind, status)
       VALUES ($1,$2,$3,$4,'done')`,
      [evalId, opts.firm, contactId, opts.triggerKind],
    );
    const resultId = `eres-${randomUUID()}`;
    const anyPass = true;
    await pool.query(
      `INSERT INTO eligibility_results (id, evaluation_id, firm_id, contact_id, result, any_pathway_pass)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6)`,
      [
        resultId,
        evalId,
        opts.firm,
        contactId,
        JSON.stringify({ trigger: opts.triggerKind, ...opts.resultPayload }),
        anyPass,
      ],
    );
    const signalId = `sig-${randomUUID()}`;
    await pool.query(
      `INSERT INTO signals (id, firm_id, contact_id, kind, payload)
       VALUES ($1,$2,$3,'eligibility_determination',$4::jsonb)`,
      [signalId, opts.firm, contactId, JSON.stringify({ resultId, anyPass })],
    );
    const motion = anyPass ? "reactivation" : "nudge";
    const motionId = `mot-${randomUUID()}`;
    await pool.query(
      `INSERT INTO motion_decisions (id, firm_id, contact_id, motion, reason)
       VALUES ($1,$2,$3,$4,$5::jsonb)`,
      [motionId, opts.firm, contactId, motion, JSON.stringify({ signalId, precedence: "mp-1" })],
    );
    cascade.push({
      contactId,
      evaluationId: evalId,
      resultId,
      signalId,
      motionId,
      motion,
    });
  }

  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: opts.firm,
    eventName: "eligibility.changed",
    payload: { ...opts.eventPayload, anyPass: true, motion: "reactivation" },
    contactIds: opts.contactIds,
  });

  if (dispatched.length === 0) {
    for (const contactId of opts.contactIds) {
      const enrolled = await enrollAndActuate({
        firmId: opts.firm,
        contactId,
        agentRef: "tpl.reactivation.v1",
        sequenceId: "tpl.reactivation.v1",
        payload: { faceless: true, fallback: true, trigger: opts.triggerKind },
        purpose: "reactivation",
      });
      if (enrolled.blocked === "halt") {
        cascade.push({ contactId, blocked: "halt", fallback: true });
        continue;
      }
      cascade.push({
        contactId,
        enrollmentId: enrolled.enrollmentId,
        fallback: true,
      });
    }
  }

  return { cascade, workflowsFired: dispatched };
}

/**
 * Faceless cascade: edit reference_version → eligibility_evaluation → result → signal → motion_decision.
 * No code deploy — row edit only.
 */
export async function handleReferenceUpsert(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{
    id?: string;
    key: string;
    payload: unknown;
    version?: number;
    contactIds?: string[];
  }>();
  const pool = getPool();
  const id = body.id ?? `ref.${body.key}.v${body.version ?? Date.now()}`;
  await pool.query(
    `INSERT INTO reference_versions (id, firm_id, key, payload, version)
     VALUES ($1,$2,$3,$4::jsonb,$5)
     ON CONFLICT (id) DO UPDATE SET payload=EXCLUDED.payload, version=EXCLUDED.version`,
    [id, null, body.key, JSON.stringify(body.payload), body.version ?? 1],
  );

  const contacts =
    body.contactIds ??
    (
      await pool.query<{ id: string }>(
        `SELECT id FROM contact_records WHERE firm_id=$1 LIMIT 50`,
        [firm],
      )
    ).rows.map((r) => r.id);

  const { cascade, workflowsFired } = await runContactEligibilityCascade({
    firm,
    contactIds: contacts,
    triggerKind: "reference_version",
    resultPayload: { refId: id },
    eventPayload: { referenceId: id },
  });

  return json(c, {
    referenceId: id,
    cascade: [{ table: "reference_versions", id }, ...cascade],
    workflowsFired,
    gate: sendGateSnapshot(),
    note: "eligibility.changed emitted; active workflows walked when subscribed",
  });
}

/**
 * Contact fact answer → fact_writebacks (+ clear missing_fact_signals) → immediate re-eval cascade.
 */
export async function handleFactWriteback(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{
    contactId: string;
    fieldKey: string;
    value: unknown;
    source?: string;
    missingFieldKeys?: string[];
    formRef?: string;
  }>();
  if (!body.contactId?.trim() || !body.fieldKey?.trim()) {
    return json(c, { error: "contactId and fieldKey required" }, 400);
  }
  const pool = getPool();
  const contactId = body.contactId.trim();
  const fieldKey = body.fieldKey.trim();
  const writeId = `fwb-${randomUUID()}`;
  await pool.query(
    `INSERT INTO fact_writebacks (id, firm_id, contact_id, field_key, value)
     VALUES ($1,$2,$3,$4,$5::jsonb)`,
    [writeId, firm, contactId, fieldKey, JSON.stringify(body.value ?? null)],
  );
  // Answered fact clears its missing signal
  await pool.query(
    `DELETE FROM missing_fact_signals WHERE firm_id=$1 AND contact_id=$2 AND field_key=$3`,
    [firm, contactId, fieldKey],
  );
  const missingIds: string[] = [];
  for (const missingKey of body.missingFieldKeys ?? []) {
    const existing = await pool.query(
      `SELECT id FROM missing_fact_signals WHERE firm_id=$1 AND contact_id=$2 AND field_key=$3 LIMIT 1`,
      [firm, contactId, missingKey],
    );
    if (existing.rowCount) {
      missingIds.push(existing.rows[0].id as string);
      continue;
    }
    const mid = `mfs-${randomUUID()}`;
    await pool.query(
      `INSERT INTO missing_fact_signals (id, firm_id, contact_id, field_key)
       VALUES ($1,$2,$3,$4)`,
      [mid, firm, contactId, missingKey],
    );
    missingIds.push(mid);
  }

  const { cascade, workflowsFired } = await runContactEligibilityCascade({
    firm,
    contactIds: [contactId],
    triggerKind: "fact_writeback",
    resultPayload: { writebackId: writeId, fieldKey, source: body.source ?? "contact" },
    eventPayload: { writebackId: writeId, fieldKey, contactId, form_ref: body.formRef ?? null },
  });

  const factDispatched = await dispatchEventToWorkflows(pool, {
    firmId: firm,
    eventName: "fact_writebacks",
    payload: { writebackId: writeId, fieldKey, contactId, form_ref: body.formRef ?? null },
    contactIds: [contactId],
  });

  return json(c, {
    writebackId: writeId,
    contactId,
    fieldKey,
    missingSignalIds: missingIds,
    cascade: [{ table: "fact_writebacks", id: writeId }, ...cascade],
    workflowsFired: [...factDispatched, ...workflowsFired],
    gate: sendGateSnapshot(),
    note: "fact_writebacks dispatched; eligibility.changed also emitted",
  });
}

export async function handleFactWritebacksList(c: Context) {
  const firm = await firmId(c);
  const contactId = c.req.query("contactId");
  const pool = getPool();
  const rows = contactId
    ? await pool.query(
        `SELECT * FROM fact_writebacks WHERE firm_id=$1 AND contact_id=$2 ORDER BY created_at DESC LIMIT 100`,
        [firm, contactId],
      )
    : await pool.query(
        `SELECT * FROM fact_writebacks WHERE firm_id=$1 ORDER BY created_at DESC LIMIT 200`,
        [firm],
      );
  return json(c, { writebacks: rows.rows });
}

export async function handleMissingFactSignalsList(c: Context) {
  const firm = await firmId(c);
  const contactId = c.req.query("contactId");
  const pool = getPool();
  const rows = contactId
    ? await pool.query(
        `SELECT * FROM missing_fact_signals WHERE firm_id=$1 AND contact_id=$2 ORDER BY created_at DESC`,
        [firm, contactId],
      )
    : await pool.query(
        `SELECT * FROM missing_fact_signals WHERE firm_id=$1 ORDER BY created_at DESC LIMIT 200`,
        [firm],
      );
  return json(c, { signals: rows.rows });
}

export async function handleMissingFactSignalCreate(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{ contactId: string; fieldKey: string }>();
  if (!body.contactId || !body.fieldKey) {
    return json(c, { error: "contactId and fieldKey required" }, 400);
  }
  const pool = getPool();
  const id = `mfs-${randomUUID()}`;
  await pool.query(
    `INSERT INTO missing_fact_signals (id, firm_id, contact_id, field_key)
     VALUES ($1,$2,$3,$4)`,
    [id, firm, body.contactId, body.fieldKey],
  );
  return json(c, { id, firmId: firm, contactId: body.contactId, fieldKey: body.fieldKey });
}

export async function handleAuditRunCreate(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{
    importIds?: string[];
    contactIds?: Array<{ id: string; email?: string; phone?: string; name?: string }>;
  }>();
  const pool = getPool();
  const result = await executeAuditRun(pool, {
    firmId: firm,
    importIds: body.importIds ?? [],
    contacts: body.contactIds ?? [],
  });

  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: firm,
    eventName: "audit.completed",
    payload: {
      auditRunId: result.id,
      contacts: result.summary.contacts,
      writes: result.writes,
      summary: result.summary,
    },
    contactIds: result.verdicts.map((v) => v.contactId),
  });

  return json(c, {
    id: result.id,
    firm_id: firm,
    status: "complete",
    import_ids: body.importIds ?? [],
    summary: result.summary,
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
    contacts: result.summary.contacts,
    verdicts: result.verdicts,
    writes: result.writes,
    workflowsFired: dispatched,
  });
}

export async function handleAuditRunList(c: Context) {
  const firm = await firmId(c);
  const pool = getPool();
  const rows = await pool.query(
    `SELECT * FROM audit_runs WHERE firm_id=$1 ORDER BY started_at DESC LIMIT 50`,
    [firm],
  );
  return json(c, { firmId: firm, runs: rows.rows });
}

export async function handleAuditRunGet(c: Context) {
  const firm = await firmId(c);
  const runId = c.req.param("id");
  const pool = getPool();
  const run = await pool.query(`SELECT * FROM audit_runs WHERE id=$1 AND firm_id=$2`, [runId, firm]);
  if (!run.rowCount) return json(c, { error: "audit run missing" }, 404);
  const verdicts = await pool.query<{
    contact_id: string;
    verdict: string;
    details: Record<string, unknown>;
    email: string | null;
    phone: string | null;
    name: string | null;
    ready: boolean | null;
  }>(
    `SELECT rv.contact_id, rv.verdict, rv.details, cr.email, cr.phone, cr.name, sr.ready
     FROM reachability_verdicts rv
     LEFT JOIN contact_records cr ON cr.id = rv.contact_id
     LEFT JOIN sequence_ready sr ON sr.contact_id = rv.contact_id AND sr.firm_id = rv.firm_id
     WHERE rv.firm_id=$1 AND COALESCE(rv.details->>'auditRunId', '') = $2
     ORDER BY cr.name ASC NULLS LAST, rv.contact_id ASC`,
    [firm, runId],
  );
  return json(c, {
    run: run.rows[0],
    verdicts: verdicts.rows.map((row) => ({
      contactId: row.contact_id,
      verdict: row.verdict,
      ready: row.ready ?? row.verdict !== "unreachable",
      email: row.email,
      phone: row.phone,
      name: row.name,
    })),
  });
}

export async function handleContactImport(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{
    filename?: string;
    source?: string;
    contacts?: Array<{ id?: string; email?: string; phone?: string; name?: string }>;
  }>().catch(() => ({}));
  const rows = Array.isArray(body.contacts) ? body.contacts : [];
  const filename = String(body.filename ?? "upload.csv");
  const source = ["file", "crm", "assisted"].includes(String(body.source))
    ? String(body.source)
    : "file";
  const pool = getPool();
  const batchId = `imp-${randomUUID()}`;
  await pool.query(
    `INSERT INTO import_batch (id, firm_id, kind, filename, row_count, source)
     VALUES ($1, $2, 'contact', $3, $4, $5)`,
    [batchId, firm, filename, rows.length, source],
  );
  const writes: RunWrite[] = [{ table: "import_batch", id: batchId }];
  const contactIds: string[] = [];
  for (const row of rows) {
    const id = String(row.id ?? `cr-${randomUUID()}`);
    await pool.query(
      `INSERT INTO contact_records (id, firm_id, email, phone, name, import_batch_id)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET
         email=COALESCE(EXCLUDED.email, contact_records.email),
         phone=COALESCE(EXCLUDED.phone, contact_records.phone),
         name=COALESCE(EXCLUDED.name, contact_records.name),
         import_batch_id=EXCLUDED.import_batch_id,
         updated_at=now()`,
      [id, firm, row.email ?? null, row.phone ?? null, row.name ?? null, batchId],
    );
    writes.push({ table: "contact_records", id, contact_id: id });
    contactIds.push(id);
  }

  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: firm,
    eventName: "contact_import",
    payload: {
      import_batch_id: batchId,
      writes,
      filename,
      source,
      contact_ids: contactIds,
    },
    contactIds,
  });

  return json(c, {
    import_batch_id: batchId,
    imported: contactIds.length,
    writes,
    workflowsFired: dispatched,
  });
}

export async function handleWorkflowRunsList(c: Context) {
  const workflowId = c.req.param("id");
  const pool = getPool();
  const rows = await pool.query(
    `SELECT * FROM workflow_run WHERE workflow_id=$1 ORDER BY started_at DESC LIMIT 100`,
    [workflowId],
  );
  return json(c, { runs: rows.rows });
}

export async function handlePauseWorkflow(c: Context) {
  const workflowId = c.req.param("id");
  const pool = getPool();
  await pool.query(
    `UPDATE workflow_state SET status='paused', updated_at=now() WHERE workflow_id=$1`,
    [workflowId],
  );
  return json(c, { workflowId, status: "paused", transition: "active→paused" });
}

export async function handleBoardDetections(c: Context) {
  const firm = await firmId(c);
  const pool = getPool();
  const [results, signals, motions, enrollments] = await Promise.all([
    pool.query(
      `SELECT DISTINCT ON (contact_id) *
       FROM eligibility_results WHERE firm_id=$1
       ORDER BY contact_id, created_at DESC`,
      [firm],
    ),
    pool.query(
      `SELECT DISTINCT ON (contact_id) *
       FROM signals WHERE firm_id=$1
       ORDER BY contact_id, created_at DESC`,
      [firm],
    ),
    pool.query(
      `SELECT DISTINCT ON (contact_id) *
       FROM motion_decisions WHERE firm_id=$1
       ORDER BY contact_id, created_at DESC`,
      [firm],
    ),
    pool.query(
      `SELECT * FROM enrollment WHERE firm_id=$1 ORDER BY enrolled_at DESC LIMIT 200`,
      [firm],
    ),
  ]);
  return json(c, {
    eligibilityResults: results.rows,
    signals: signals.rows,
    motionDecisions: motions.rows,
    enrollments: enrollments.rows,
  });
}

export async function handleTemplatesList(c: Context) {
  const pool = getPool();
  const templates = await pool.query(`SELECT * FROM sequence_template ORDER BY sequence_class`);
  const firm = await firmId(c);
  const bindings = await pool.query(
    `SELECT * FROM firm_sequence_binding WHERE firm_id=$1`,
    [firm],
  );
  return json(c, { templates: templates.rows, bindings: bindings.rows });
}

/**
 * Onboarding automation: when campaign_state=running, Action calls opt-in agent → enrollments.
 */
export async function handleOnboardingFire(c: Context) {
  const firm = await firmId(c);
  const pool = getPool();
  const camp = await pool.query<{ state: string }>(
    `SELECT state FROM campaign_states WHERE firm_id=$1`,
    [firm],
  );
  if (!camp.rowCount || camp.rows[0].state !== "running") {
    return json(c, { skipped: true, reason: "campaign_state not running" });
  }

  const bind = await pool.query<{ template_id: string }>(
    `SELECT template_id FROM firm_sequence_binding
     WHERE firm_id=$1 AND sequence_class='optin'
     ORDER BY is_default DESC LIMIT 1`,
    [firm],
  );
  const agentRef = bind.rows[0]?.template_id ?? "tpl.optin_launch.v1";

  const ready = await pool.query<{ contact_id: string }>(
    `SELECT contact_id FROM sequence_ready WHERE firm_id=$1 AND ready=true`,
    [firm],
  );

  const contactIds = ready.rows.map((r) => r.contact_id);
  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: firm,
    eventName: "audit.completed",
    payload: { trigger: "campaign_state=running", onboarding: true },
    contactIds,
  });
  if (dispatched.length > 0) {
    return json(c, {
      firmId: firm,
      agentRef,
      enrollments: dispatched.reduce((n, d) => n + d.enrollments, 0),
      workflowsFired: dispatched,
      gate: sendGateSnapshot(),
      note: "Onboarding via workflow walk (audit.completed)",
    });
  }

  const enrolled: Array<{ id: string; dryRun: boolean; blocked?: string }> = [];
  for (const row of ready.rows) {
    const result = await enrollAndActuate({
      firmId: firm,
      contactId: row.contact_id,
      agentRef,
      sequenceId: agentRef,
      payload: { trigger: "campaign_state=running" },
      purpose: "opt-in",
    });
    if (result.blocked === "halt") {
      enrolled.push({ id: "", dryRun: true, blocked: "halt" });
      continue;
    }
    enrolled.push({ id: result.enrollmentId, dryRun: result.dryRun });
  }

  return json(c, {
    firmId: firm,
    agentRef,
    enrollments: enrolled.length,
    ids: enrolled.map((e) => e.id),
    dryRuns: enrolled.filter((e) => e.dryRun).length,
    liveSends: enrolled.filter((e) => !e.dryRun).length,
    gate: sendGateSnapshot(),
    note: "Opt-in enrollments (no subscribed workflow); SEND_MODE gate",
  });
}

/** Fire a named machine event into subscribed workflows. */
export async function handleMachineEvent(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{
    eventName: string;
    payload?: Record<string, unknown>;
    contactIds?: string[];
  }>();
  if (!body.eventName) return json(c, { error: "eventName required" }, 400);
  const pool = getPool();
  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: firm,
    eventName: body.eventName,
    payload: body.payload,
    contactIds: body.contactIds,
  });
  return json(c, { eventName: body.eventName, workflowsFired: dispatched });
}

/** Webhook trigger: POST /wire/hook/:webhookId */
export async function handleWebhookTrigger(c: Context) {
  const webhookId = c.req.param("webhookId");
  const body = await c.req.json().catch(() => ({}));
  const pool = getPool();
  const trig = await pool.query<{
    workflow_id: string;
    firm_id: string;
  }>(
    `SELECT t.workflow_id, t.firm_id
     FROM workflow_trigger t
     JOIN workflow_state s ON s.workflow_id = t.workflow_id
     WHERE t.webhook_id=$1 AND t.enabled=true AND t.type='webhook' AND s.status='active'
     LIMIT 1`,
    [webhookId],
  );
  if (!trig.rowCount) return json(c, { error: "webhook trigger not found or inactive" }, 404);

  const runId = `run-${randomUUID()}`;
  const workflowId = trig.rows[0].workflow_id;
  const firm = trig.rows[0].firm_id;
  await pool.query(
    `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label)
     VALUES ($1,$2,$3,'running',$4)`,
    [runId, workflowId, firm, `webhook:${webhookId}`],
  );
  const walked = await walkValidatedWorkflow(pool, {
    workflowId,
    firmId: firm,
    runId,
    triggerLabel: `webhook:${webhookId}`,
    triggerPayload: { webhookId, body, anyPass: true },
    contactIds: Array.isArray((body as { contactIds?: string[] }).contactIds)
      ? (body as { contactIds: string[] }).contactIds
      : undefined,
  });
  return json(c, {
    webhookId,
    workflowId,
    runId,
    status: walked.ok ? "success" : "failed",
    nodeStatus: walked.nodeStatus,
    enrollments: walked.enrollments,
  });
}

/** Upsert sequence_template cells (Agents editor save). */
export async function handleTemplateUpsert(c: Context) {
  const id = c.req.param("id");
  const body = await c.req.json<{
    sequenceClass?: string;
    label?: string;
    cells: unknown[];
    variant?: string;
  }>();
  const pool = getPool();
  await pool.query(
    `INSERT INTO sequence_template (id, sequence_class, variant, label, cells, version)
     VALUES ($1,$2,$3,$4,$5::jsonb,1)
     ON CONFLICT (id) DO UPDATE SET
       cells=EXCLUDED.cells,
       label=COALESCE(EXCLUDED.label, sequence_template.label),
       updated_at=now(),
       version=sequence_template.version + 1`,
    [
      id,
      body.sequenceClass ?? "reengagement",
      body.variant ?? "v1",
      body.label ?? id,
      JSON.stringify(body.cells ?? []),
    ],
  );
  return json(c, { id, cells: body.cells?.length ?? 0, table: "sequence_template" });
}

/** Upsert firm_sequence_binding (Agents assign template to firm). */
export async function handleBindingUpsert(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{
    sequenceClass: string;
    templateId: string;
    variableBindings?: Record<string, unknown>;
    isDefault?: boolean;
    overrideAttempt?: boolean;
    overrideChannel?: boolean;
    overrideContent?: boolean;
    overrideSequencing?: boolean;
  }>();
  const id = `bind.${firm}.${body.sequenceClass}`;
  const pool = getPool();
  await pool.query(
    `INSERT INTO firm_sequence_binding
       (id, firm_id, sequence_class, template_id, variable_bindings, is_default,
        override_attempt, override_channel, override_content, override_sequencing)
     VALUES ($1,$2,$3,$4,$5::jsonb,COALESCE($6,true),$7,$8,$9,$10)
     ON CONFLICT (id) DO UPDATE SET
       template_id=EXCLUDED.template_id,
       variable_bindings=EXCLUDED.variable_bindings,
       override_attempt=EXCLUDED.override_attempt,
       override_channel=EXCLUDED.override_channel,
       override_content=EXCLUDED.override_content,
       override_sequencing=EXCLUDED.override_sequencing,
       updated_at=now()`,
    [
      id,
      firm,
      body.sequenceClass,
      body.templateId,
      JSON.stringify(body.variableBindings ?? {}),
      body.isDefault ?? true,
      Boolean(body.overrideAttempt),
      Boolean(body.overrideChannel),
      Boolean(body.overrideContent),
      Boolean(body.overrideSequencing),
    ],
  );
  return json(c, { id, firmId: firm, table: "firm_sequence_binding" });
}

/** List rule_attempt_criteria (platform defaults + firm rows). */
export async function handleAttemptCriteriaList(c: Context) {
  const firm = await firmId(c);
  const pool = getPool();
  const rows = await pool.query(
    `SELECT * FROM rule_attempt_criteria
     WHERE firm_id IS NULL OR firm_id = $1
     ORDER BY CASE WHEN firm_id = $1 THEN 0 ELSE 1 END, ord ASC`,
    [firm],
  );
  return json(c, { criteria: rows.rows });
}

/** Upsert a single rule_attempt_criteria row by id. */
export async function handleAttemptCriteriaUpsert(c: Context) {
  const firm = await firmId(c);
  const id = c.req.param("id");
  const body = await c.req.json<{
    label?: string;
    enabled?: boolean;
    threshold?: number | null;
    thresholdUnit?: string | null;
    whenClause?: string | null;
    conditionClause?: string | null;
    setValue?: string | null;
    ord?: number;
    sequenceId?: string | null;
    channelToken?: "text" | "email" | "call" | "form" | null;
  }>();
  const pool = getPool();
  const existing = await pool.query(`SELECT * FROM rule_attempt_criteria WHERE id=$1`, [id]);
  if (!existing.rowCount) {
    await pool.query(
      `INSERT INTO rule_attempt_criteria
         (id, firm_id, label, enabled, when_clause, condition_clause, set_value,
          threshold, threshold_unit, ord, source, sequence_id, channel_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'c6',$11,$12)`,
      [
        id,
        firm,
        body.label ?? id,
        body.enabled ?? true,
        body.whenClause ?? null,
        body.conditionClause ?? null,
        body.setValue ?? "escalate_forward",
        body.threshold ?? null,
        body.thresholdUnit ?? null,
        body.ord ?? 0,
        body.sequenceId ?? null,
        body.channelToken ?? null,
      ],
    );
    const created = await pool.query(`SELECT * FROM rule_attempt_criteria WHERE id=$1`, [id]);
    return json(c, created.rows[0]);
  }
  const prev = existing.rows[0] as Record<string, unknown>;
  const next = {
    label: body.label ?? prev.label,
    enabled: body.enabled ?? prev.enabled,
    threshold: body.threshold !== undefined ? body.threshold : prev.threshold,
    threshold_unit:
      body.thresholdUnit !== undefined ? body.thresholdUnit : prev.threshold_unit,
    when_clause: body.whenClause !== undefined ? body.whenClause : prev.when_clause,
    condition_clause:
      body.conditionClause !== undefined ? body.conditionClause : prev.condition_clause,
    set_value: body.setValue !== undefined ? body.setValue : prev.set_value,
    ord: body.ord ?? prev.ord,
    firm_id: (prev.firm_id as string | null) ?? firm,
    sequence_id: body.sequenceId !== undefined ? body.sequenceId : prev.sequence_id,
    channel_token: body.channelToken !== undefined ? body.channelToken : prev.channel_token,
  };
  await pool.query(
    `UPDATE rule_attempt_criteria SET
       label=$2, enabled=$3, threshold=$4, threshold_unit=$5,
       when_clause=$6, condition_clause=$7, set_value=$8, ord=$9,
       firm_id=$10, sequence_id=$11, channel_token=$12, version=version+1
     WHERE id=$1`,
    [
      id,
      next.label,
      next.enabled,
      next.threshold,
      next.threshold_unit,
      next.when_clause,
      next.condition_clause,
      next.set_value,
      next.ord,
      next.firm_id,
      next.sequence_id,
      next.channel_token,
    ],
  );
  const updated = await pool.query(`SELECT * FROM rule_attempt_criteria WHERE id=$1`, [id]);
  return json(c, updated.rows[0]);
}

export async function handleSeqChannelRulesList(c: Context) {
  const sequenceId = c.req.query("sequenceId") || null;
  const pool = getPool();
  if (sequenceId) {
    const rows = await pool.query(
      `SELECT id, firm_id, sequence_id, token, within_seconds
       FROM seq_channel_rules WHERE sequence_id=$1 ORDER BY token ASC`,
      [sequenceId],
    );
    if (rows.rowCount) return json(c, { rules: rows.rows });
  }
  const global = await pool.query(
    `SELECT id, firm_id, sequence_id, token, within_seconds
     FROM seq_channel_rules WHERE sequence_id IS NULL AND firm_id IS NULL
     ORDER BY token ASC`,
  );
  return json(c, { rules: global.rows });
}

export async function handleSeqChannelRulesSave(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{
    sequenceId?: string | null;
    rules: Array<{ token: "text" | "email" | "call"; withinSeconds: number }>;
  }>();
  const sequenceId = body.sequenceId?.trim() || null;
  const pool = getPool();
  const saved: unknown[] = [];
  for (const rule of body.rules ?? []) {
    const token = rule.token;
    const within = Number.isFinite(rule.withinSeconds) ? Math.max(1, Math.round(rule.withinSeconds)) : 1800;
    const id = sequenceId ? `scr-seq-${sequenceId}-${token}` : `scr-global-${token}`;
    await pool.query(
      `INSERT INTO seq_channel_rules (id, firm_id, sequence_id, token, within_seconds, updated_at)
       VALUES ($1,$2,$3,$4,$5,now())
       ON CONFLICT (id) DO UPDATE SET
         within_seconds=EXCLUDED.within_seconds,
         updated_at=now()`,
      [id, sequenceId ? firm : null, sequenceId, token, within],
    );
    const row = await pool.query(
      `SELECT id, firm_id, sequence_id, token, within_seconds FROM seq_channel_rules WHERE id=$1`,
      [id],
    );
    if (row.rows[0]) saved.push(row.rows[0]);
  }
  return json(c, { rules: saved });
}

/** List seq_channel_ownership_order ladder. */
export async function handleChannelOrderList(c: Context) {
  const firm = await firmId(c);
  const pool = getPool();
  const rows = await pool.query(
    `SELECT * FROM seq_channel_ownership_order
     WHERE firm_id IS NULL OR firm_id = $1
     ORDER BY CASE WHEN firm_id = $1 THEN 0 ELSE 1 END, ord ASC`,
    [firm],
  );
  return json(c, { order: rows.rows });
}

/** Replace ord for the full channel ladder (Agents Settings reorder). */
export async function handleChannelOrderUpsert(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{
    order: Array<{ id: string; token?: string; label?: string; ord: number }>;
  }>();
  const items = body.order ?? [];
  if (!items.length) return json(c, { error: "order required" }, 400);
  const pool = getPool();
  for (const item of items) {
    await pool.query(
      `UPDATE seq_channel_ownership_order SET
         ord=$2,
         token=COALESCE($3, token),
         label=COALESCE($4, label),
         firm_id=COALESCE(firm_id, $5),
         version=version+1
       WHERE id=$1`,
      [item.id, item.ord, item.token ?? null, item.label ?? null, firm],
    );
  }
  const rows = await pool.query(
    `SELECT * FROM seq_channel_ownership_order
     WHERE firm_id IS NULL OR firm_id = $1
     ORDER BY CASE WHEN firm_id = $1 THEN 0 ELSE 1 END, ord ASC`,
    [firm],
  );
  return json(c, { order: rows.rows });
}

/** List seq_eligibility_pipeline stages (Automations Settings). */
export async function handleEligibilityPipelineList(c: Context) {
  const firm = await firmId(c);
  const pool = getPool();
  const rows = await pool.query(
    `SELECT id, firm_id, token, label, ord, version
     FROM seq_eligibility_pipeline
     WHERE firm_id IS NULL OR firm_id = $1
     ORDER BY CASE WHEN firm_id = $1 THEN 0 ELSE 1 END, ord ASC`,
    [firm],
  );
  return json(c, { stages: rows.rows });
}

/** Replace ord for the eligibility pipeline ladder (Automations Settings reorder). */
export async function handleEligibilityPipelineUpsert(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{
    stages: Array<{ id: string; token?: string; label?: string; ord: number }>;
  }>();
  const items = body.stages ?? [];
  if (!items.length) return json(c, { error: "stages required" }, 400);
  const pool = getPool();
  for (const item of items) {
    await pool.query(
      `UPDATE seq_eligibility_pipeline SET
         ord=$2,
         token=COALESCE($3, token),
         label=COALESCE($4, label),
         firm_id=COALESCE(firm_id, $5),
         version=COALESCE(version, 0)+1
       WHERE id=$1`,
      [item.id, item.ord, item.token ?? null, item.label ?? null, firm],
    );
  }
  const rows = await pool.query(
    `SELECT id, firm_id, token, label, ord, version
     FROM seq_eligibility_pipeline
     WHERE firm_id IS NULL OR firm_id = $1
     ORDER BY CASE WHEN firm_id = $1 THEN 0 ELSE 1 END, ord ASC`,
    [firm],
  );
  return json(c, { stages: rows.rows });
}

const MODULAR_RULE_TABLES = {
  rule_eligibility_pathway: "rule_eligibility_pathway",
  rule_motion_precedence: "rule_motion_precedence",
  rule_field_class_routing: "rule_field_class_routing",
  rule_cohort_scoring: "rule_cohort_scoring",
  rule_reachability_checks: "rule_reachability_checks",
  rule_metrics_thresholds: "rule_metrics_thresholds",
} as const;

type ModularRuleTable = keyof typeof MODULAR_RULE_TABLES;

type ModularRulePatch = {
  enabled?: boolean;
  label?: string;
  ord?: number;
  whenClause?: string | null;
  conditionClause?: string | null;
  setValue?: string | null;
  threshold?: number | null;
};

async function listModularRules(table: ModularRuleTable, firm: string) {
  const pool = getPool();
  const safe = MODULAR_RULE_TABLES[table];
  const rows = await pool.query(
    `SELECT * FROM ${safe}
     WHERE firm_id IS NULL OR firm_id = $1
     ORDER BY CASE WHEN firm_id = $1 THEN 0 ELSE 1 END, ord ASC`,
    [firm],
  );
  return rows.rows;
}

async function upsertModularRuleEnabled(
  table: ModularRuleTable,
  id: string,
  firm: string,
  body: ModularRulePatch,
) {
  const pool = getPool();
  const safe = MODULAR_RULE_TABLES[table];
  const existing = await pool.query(`SELECT * FROM ${safe} WHERE id=$1`, [id]);
  if (!existing.rowCount) return null;
  const prev = existing.rows[0] as Record<string, unknown>;
  const enabled = body.enabled ?? prev.enabled;
  const label = body.label ?? prev.label;
  const ord = body.ord ?? prev.ord;
  const whenClause =
    body.whenClause !== undefined ? body.whenClause : (prev.when_clause as string | null);
  const conditionClause =
    body.conditionClause !== undefined
      ? body.conditionClause
      : (prev.condition_clause as string | null);
  const setValue =
    body.setValue !== undefined ? body.setValue : (prev.set_value as string | null);
  const firmIdNext = (prev.firm_id as string | null) ?? firm;
  const hasThreshold = "threshold" in prev;
  if (hasThreshold) {
    const threshold =
      body.threshold !== undefined ? body.threshold : (prev.threshold as number | null);
    await pool.query(
      `UPDATE ${safe} SET enabled=$2, label=$3, ord=$4, firm_id=$5,
         when_clause=$6, condition_clause=$7, set_value=$8, threshold=$9, version=version+1
       WHERE id=$1`,
      [id, enabled, label, ord, firmIdNext, whenClause, conditionClause, setValue, threshold],
    );
  } else {
    await pool.query(
      `UPDATE ${safe} SET enabled=$2, label=$3, ord=$4, firm_id=$5,
         when_clause=$6, condition_clause=$7, set_value=$8, version=version+1
       WHERE id=$1`,
      [id, enabled, label, ord, firmIdNext, whenClause, conditionClause, setValue],
    );
  }
  const updated = await pool.query(`SELECT * FROM ${safe} WHERE id=$1`, [id]);
  return updated.rows[0];
}

/** List rule_eligibility_pathway rows. */
export async function handleEligibilityPathwaysList(c: Context) {
  const firm = await firmId(c);
  return json(c, { pathways: await listModularRules("rule_eligibility_pathway", firm) });
}

export async function handleEligibilityPathwayUpsert(c: Context) {
  const firm = await firmId(c);
  const id = c.req.param("id");
  const body = await c.req.json<ModularRulePatch>();
  const row = await upsertModularRuleEnabled("rule_eligibility_pathway", id, firm, body);
  if (!row) return json(c, { error: "eligibility pathway not found", id }, 404);
  return json(c, row);
}

/** List rule_motion_precedence rows. */
export async function handleMotionPrecedenceList(c: Context) {
  const firm = await firmId(c);
  return json(c, { rules: await listModularRules("rule_motion_precedence", firm) });
}

export async function handleMotionPrecedenceUpsert(c: Context) {
  const firm = await firmId(c);
  const id = c.req.param("id");
  const body = await c.req.json<ModularRulePatch>();
  const row = await upsertModularRuleEnabled("rule_motion_precedence", id, firm, body);
  if (!row) return json(c, { error: "motion precedence not found", id }, 404);
  return json(c, row);
}

/** List rule_field_class_routing rows. */
export async function handleFieldClassRoutingList(c: Context) {
  const firm = await firmId(c);
  return json(c, { rules: await listModularRules("rule_field_class_routing", firm) });
}

export async function handleFieldClassRoutingUpsert(c: Context) {
  const firm = await firmId(c);
  const id = c.req.param("id");
  const body = await c.req.json<ModularRulePatch>();
  const row = await upsertModularRuleEnabled("rule_field_class_routing", id, firm, body);
  if (!row) return json(c, { error: "field class routing not found", id }, 404);
  return json(c, row);
}

export async function handleCohortScoringList(c: Context) {
  const firm = await firmId(c);
  return json(c, { rules: await listModularRules("rule_cohort_scoring", firm) });
}

export async function handleCohortScoringUpsert(c: Context) {
  const firm = await firmId(c);
  const id = c.req.param("id");
  const body = await c.req.json<ModularRulePatch>();
  const row = await upsertModularRuleEnabled("rule_cohort_scoring", id, firm, body);
  if (!row) return json(c, { error: "cohort scoring not found", id }, 404);
  return json(c, row);
}

export async function handleMetricsThresholdsList(c: Context) {
  const firm = await firmId(c);
  return json(c, { rules: await listModularRules("rule_metrics_thresholds", firm) });
}

export async function handleMetricsThresholdsUpsert(c: Context) {
  const firm = await firmId(c);
  const id = c.req.param("id");
  const body = await c.req.json<ModularRulePatch>();
  const row = await upsertModularRuleEnabled("rule_metrics_thresholds", id, firm, body);
  if (!row) return json(c, { error: "metrics threshold not found", id }, 404);
  return json(c, row);
}

export async function handleReachabilityChecksList(c: Context) {
  const firm = await firmId(c);
  return json(c, { rules: await listModularRules("rule_reachability_checks", firm) });
}

export async function handleReachabilityChecksUpsert(c: Context) {
  const firm = await firmId(c);
  const id = c.req.param("id");
  const body = await c.req.json<ModularRulePatch>();
  const row = await upsertModularRuleEnabled("rule_reachability_checks", id, firm, body);
  if (!row) return json(c, { error: "reachability check not found", id }, 404);
  return json(c, row);
}

/** List seq_phase_order ladder. */
export async function handlePhaseOrderList(c: Context) {
  const firm = await firmId(c);
  const pool = getPool();
  const rows = await pool.query(
    `SELECT * FROM seq_phase_order
     WHERE firm_id IS NULL OR firm_id = $1
     ORDER BY CASE WHEN firm_id = $1 THEN 0 ELSE 1 END, ord ASC`,
    [firm],
  );
  return json(c, { order: rows.rows });
}

/** Replace ord for the full phase ladder (Agents Settings reorder). */
export async function handlePhaseOrderUpsert(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{
    order: Array<{ id: string; token?: string; label?: string; ord: number }>;
  }>();
  const items = body.order ?? [];
  if (!items.length) return json(c, { error: "order required" }, 400);
  const pool = getPool();
  for (const item of items) {
    await pool.query(
      `UPDATE seq_phase_order SET ord=$2, token=COALESCE($3,token), label=COALESCE($4,label),
         firm_id=COALESCE(firm_id,$5), version=version+1
       WHERE id=$1`,
      [item.id, item.ord, item.token ?? null, item.label ?? null, firm],
    );
  }
  const rows = await pool.query(
    `SELECT * FROM seq_phase_order
     WHERE firm_id IS NULL OR firm_id = $1
     ORDER BY CASE WHEN firm_id = $1 THEN 0 ELSE 1 END, ord ASC`,
    [firm],
  );
  return json(c, { order: rows.rows });
}

export async function handlePreparedWorkspacesList(c: Context) {
  const firm = await firmId(c);
  const pool = getPool();
  const rows = await pool.query(
    `SELECT * FROM prepared_workspaces WHERE firm_id=$1 ORDER BY created_at DESC`,
    [firm],
  );
  return json(c, { workspaces: rows.rows });
}

export async function handlePreparedWorkspaceUpsert(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{
    id?: string;
    status?: string;
    body?: Record<string, unknown>;
  }>();
  const pool = getPool();
  const id = c.req.param("id") || body.id || `pw-${firm}`;
  await pool.query(
    `INSERT INTO prepared_workspaces (id, firm_id, status, body)
     VALUES ($1,$2,$3,$4::jsonb)
     ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, body=EXCLUDED.body`,
    [id, firm, body.status ?? "staged", JSON.stringify(body.body ?? {})],
  );
  const row = await pool.query(`SELECT * FROM prepared_workspaces WHERE id=$1`, [id]);
  return json(c, row.rows[0]);
}

export async function handleActiveAttemptsList(c: Context) {
  const firm = await firmId(c);
  const pool = getPool();
  const rows = await pool.query(
    `SELECT * FROM active_attempts WHERE firm_id=$1 ORDER BY updated_at DESC LIMIT 100`,
    [firm],
  );
  return json(c, { attempts: rows.rows });
}

export async function handleEngagementRecordsList(c: Context) {
  const firm = await firmId(c);
  const pool = getPool();
  const rows = await pool.query(
    `SELECT * FROM engagement_records WHERE firm_id=$1 ORDER BY created_at DESC LIMIT 100`,
    [firm],
  );
  return json(c, { records: rows.rows });
}

/** List reference_versions for Evaluation pack pin picker. */
export async function handleReferenceVersionsList(c: Context) {
  const firm = await firmId(c);
  const pool = getPool();
  const rows = await pool.query(
    `SELECT id, firm_id, key, payload, version
     FROM reference_versions
     WHERE firm_id IS NULL OR firm_id = $1
     ORDER BY key ASC, version DESC`,
    [firm],
  );
  return json(c, { versions: rows.rows });
}

function evalPinPackId(packId: string) {
  return `eval.pin.${packId}`;
}

/** GET evaluation pack pin from constants_packs id eval.pin.{packId}. */
export async function handleEvaluationPinGet(c: Context) {
  const packId = c.req.param("packId");
  const pool = getPool();
  const id = evalPinPackId(packId);
  const rows = await pool.query(`SELECT id, payload FROM constants_packs WHERE id=$1`, [id]);
  if (!rows.rowCount) {
    return json(c, {
      packId,
      referenceVersionId: null,
      rulesetId: null,
      missing: true,
    });
  }
  const payload = (rows.rows[0].payload ?? {}) as Record<string, unknown>;
  return json(c, {
    packId,
    referenceVersionId: typeof payload.referenceVersionId === "string" ? payload.referenceVersionId : null,
    rulesetId: typeof payload.rulesetId === "string" ? payload.rulesetId : null,
    missing: false,
  });
}

/** PUT evaluation pack pin → constants_packs eval.pin.{packId}. */
export async function handleEvaluationPinPut(c: Context) {
  const packId = c.req.param("packId");
  const body = await c.req.json<{
    referenceVersionId: string;
    rulesetId: string;
  }>();
  if (!body.referenceVersionId || !body.rulesetId) {
    return json(c, { error: "referenceVersionId and rulesetId required" }, 400);
  }
  const pool = getPool();
  const id = evalPinPackId(packId);
  const payload = {
    referenceVersionId: body.referenceVersionId,
    rulesetId: body.rulesetId,
    packId,
  };
  await pool.query(
    `INSERT INTO constants_packs (id, firm_id, name, payload, version)
     VALUES ($1, NULL, $2, $3::jsonb, 1)
     ON CONFLICT (id) DO UPDATE SET payload=EXCLUDED.payload, version=constants_packs.version+1, name=EXCLUDED.name`,
    [id, id, JSON.stringify(payload)],
  );
  return json(c, { packId, ...payload, table: "constants_packs", id });
}

/** GET/POST campaign_states for Bind Armed/Active. */
export async function handleCampaignStateGet(c: Context) {
  const firm = await firmId(c);
  const pool = getPool();
  const rows = await pool.query(`SELECT firm_id, state, updated_at FROM campaign_states WHERE firm_id=$1`, [
    firm,
  ]);
  if (!rows.rowCount) {
    return json(c, { firmId: firm, state: "armed-for-activation", missing: true });
  }
  return json(c, {
    firmId: rows.rows[0].firm_id,
    state: rows.rows[0].state,
    updatedAt: rows.rows[0].updated_at,
    missing: false,
  });
}

export async function handleCampaignStatePost(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{ state: "running" | "armed-for-activation" }>();
  if (body.state !== "running" && body.state !== "armed-for-activation") {
    return json(c, { error: "state must be running | armed-for-activation" }, 400);
  }
  const pool = getPool();
  await pool.query(
    `INSERT INTO campaign_states (firm_id, state, updated_at)
     VALUES ($1,$2,now())
     ON CONFLICT (firm_id) DO UPDATE SET state=EXCLUDED.state, updated_at=now()`,
    [firm, body.state],
  );
  return json(c, { firmId: firm, state: body.state });
}

/**
 * Assisted Provision — write ct_firms + campaign_states; also mint auth firms/users
 * when the UUID auth tables are present so Login OTP can resolve the email.
 */
export async function handleMachineProvision(c: Context) {
  const body = await c.req.json<{
    firmId?: string;
    firmName: string;
    email: string;
    website?: string;
    role?: string;
  }>();
  const firmName = (body.firmName ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  if (!firmName || !email) {
    return json(c, { error: "firmName and email required" }, 400);
  }
  // One id binds auth + CT + machine: session.firm_id === ct_firms.id === machine firm_id.
  // Never mint a separate auth UUID and a TEXT firm-* slug.
  const firm = body.firmId?.trim() || randomUUID();
  const pool = getPool();

  await pool.query(
    `INSERT INTO firms (id, name) VALUES ($1::uuid, $2)
     ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name`,
    [firm, firmName],
  );
  await pool.query(
    `INSERT INTO ct_firms (id, name, posture, updated_at)
     VALUES ($1,$2,'Idle',now())
     ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, updated_at=now()`,
    [firm, firmName],
  );
  await pool.query(
    `INSERT INTO campaign_states (firm_id, state, updated_at)
     VALUES ($1,'armed-for-activation',now())
     ON CONFLICT (firm_id) DO UPDATE SET state='armed-for-activation', updated_at=now()`,
    [firm],
  );

  let authUser = false;
  let userId: string | null = null;
  try {
    const existing = await pool.query<{ id: string }>(
      `SELECT id FROM users WHERE lower(email)=lower($1) LIMIT 1`,
      [email],
    );
    if (existing.rowCount) {
      // Rebind consultant to the firm just provisioned (binding, not orphan CT row).
      await pool.query(`UPDATE users SET firm_id=$1::uuid WHERE id=$2`, [
        firm,
        existing.rows[0].id,
      ]);
      userId = existing.rows[0].id;
      authUser = true;
    } else {
      const inserted = await pool.query<{ id: string }>(
        `INSERT INTO users (firm_id, email) VALUES ($1::uuid, $2) RETURNING id`,
        [firm, email],
      );
      userId = inserted.rows[0]?.id ?? null;
      authUser = Boolean(userId);
    }
  } catch (err) {
    console.error("provision.authUser.failed", err);
    authUser = false;
  }

  // Direct access path (product entry) — one-time token; OTP login remains fallback.
  let accessPath: string | null = null;
  let loginPath = `/login?tenancy=assisted&email=${encodeURIComponent(email)}`;
  if (authUser && userId) {
    try {
      const minted = await mintAccessLink(pool, {
        id: userId,
        firm_id: firm,
        email,
      });
      accessPath = minted.accessPath;
      loginPath = minted.accessPath;
    } catch (err) {
      console.error("provision.accessLink.failed", err);
    }
  }

  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: firm,
    eventName: "ct_firms",
    payload: { firmId: firm, firmName, email },
  });

  return json(c, {
    firmId: firm,
    firmName,
    email,
    website: body.website ?? null,
    role: body.role ?? null,
    ctFirm: true,
    authUser,
    campaignState: "armed-for-activation",
    loginPath,
    accessPath,
    bound: true,
    workflowsFired: dispatched,
  });
}

/**
 * Mint (and optionally email) a direct access link for a provisioned consultant.
 * Used from Provision handoff — product entry is /a/<token>, not the OTP portal.
 */
export async function handleMachineAccessInvite(c: Context) {
  const body = await c.req.json<{ email?: string; sendEmail?: boolean }>().catch(() => ({}));
  const email = normalizeEmail(body.email ?? "");
  const sendEmail = body.sendEmail !== false;

  if (!isValidEmail(email)) {
    return json(c, { error: "email required" }, 400);
  }

  const pool = getPool();
  const user = await resolveUserByEmail(pool, email);
  if (!user) {
    return json(c, { error: "unprovisioned", message: "No user for that email." }, 404);
  }

  try {
    const minted = await mintAccessLink(pool, user);
    const origin = (
      process.env.PUBLIC_APP_URL ??
      process.env.APP_ORIGIN ??
      c.req.header("origin") ??
      "https://omcoda-tower.vercel.app"
    )
      .trim()
      .replace(/\/$/, "");
    const accessUrl = `${origin}${minted.accessPath}`;

    let emailed = false;
    if (sendEmail) {
      try {
        await sendAccessLinkEmail(email, accessUrl);
        emailed = true;
      } catch (err) {
        console.error("accessInvite.email.failed", err);
        return json(
          c,
          {
            ok: false,
            error: "delivery_failed",
            accessPath: minted.accessPath,
            expiresAt: minted.expiresAt.toISOString(),
            message: "Link minted but email failed — copy accessPath.",
          },
          503,
        );
      }
    }

    return json(c, {
      ok: true,
      accessPath: minted.accessPath,
      expiresAt: minted.expiresAt.toISOString(),
      emailed,
    });
  } catch (err) {
    console.error("accessInvite.failed", err);
    return json(c, { error: "server_error", message: String(err) }, 500);
  }
}

/**
 * Single tick (same as worker once).
 * Production host: Vercel Cron GET /api/wire/machine/tick every minute
 * (Authorization: Bearer $CRON_SECRET or WORKER_CRON_SECRET).
 */
export async function handleMachineTick(c: Context) {
  const secret =
    (process.env.CRON_SECRET ?? process.env.WORKER_CRON_SECRET ?? "").trim();
  if (secret) {
    const auth = (c.req.header("authorization") ?? "").trim();
    const bearer = auth.toLowerCase().startsWith("bearer ")
      ? auth.slice(7).trim()
      : "";
    const headerSecret = (c.req.header("x-cron-secret") ?? "").trim();
    if (bearer !== secret && headerSecret !== secret) {
      return json(c, { ok: false, error: "cron secret required" }, 401);
    }
  }
  const result = await tickOnce(new Date());
  return json(c, {
    ok: true,
    host: "vercel-cron-or-manual",
    ...result,
    fired: result.fired,
    gate: sendGateSnapshot(),
  });
}

export async function handleMachineHealth(c: Context) {
  const pool = getPool();
  try {
    const r = await pool.query(`SELECT to_regclass('public.workflow') AS workflow`);
    return json(c, {
      ok: true,
      machineTables: Boolean(r.rows[0]?.workflow),
      service: "tower-machine",
    });
  } catch (e) {
    return json(c, { ok: false, error: String(e) }, 500);
  }
}

/** List contact_records. session = this firm. every_firm = operator book (Add contact). */
export async function handleContactRecordsList(c: Context) {
  const firm = await firmId(c);
  const scope = c.req.query("scope") === "every_firm" ? "every_firm" : "session";
  const pool = getPool();
  const rows = await pool.query<{
    id: string;
    firm_id: string;
    email: string | null;
    phone: string | null;
    name: string | null;
    notes: string | null;
    firm_name: string | null;
    created_at: string;
    tags: unknown;
    reachability: "reachable" | "partial" | "unreachable" | null;
    sequence_ready: boolean | null;
  }>(
    scope === "every_firm"
      ? `SELECT c.id, c.firm_id, c.email, c.phone, c.name, c.notes, f.name AS firm_name, c.created_at,
            COALESCE((
              SELECT json_agg(ct.tag ORDER BY ct.created_at)
              FROM contact_tag ct WHERE ct.contact_id = c.id AND ct.firm_id = c.firm_id
            ), '[]'::json) AS tags,
            rv.verdict AS reachability,
            sr.ready AS sequence_ready
         FROM contact_records c
         LEFT JOIN ct_firms f ON f.id = c.firm_id
         LEFT JOIN reachability_verdicts rv ON rv.contact_id = c.id AND rv.firm_id = c.firm_id
         LEFT JOIN sequence_ready sr ON sr.contact_id = c.id AND sr.firm_id = c.firm_id
         ORDER BY f.name ASC NULLS LAST, c.name ASC NULLS LAST, c.id ASC`
      : `SELECT c.id, c.firm_id, c.email, c.phone, c.name, c.notes, f.name AS firm_name, c.created_at,
            COALESCE((
              SELECT json_agg(ct.tag ORDER BY ct.created_at)
              FROM contact_tag ct WHERE ct.contact_id = c.id AND ct.firm_id = c.firm_id
            ), '[]'::json) AS tags,
            rv.verdict AS reachability,
            sr.ready AS sequence_ready
         FROM contact_records c
         LEFT JOIN ct_firms f ON f.id = c.firm_id
         LEFT JOIN reachability_verdicts rv ON rv.contact_id = c.id AND rv.firm_id = c.firm_id
         LEFT JOIN sequence_ready sr ON sr.contact_id = c.id AND sr.firm_id = c.firm_id
         WHERE c.firm_id=$1 ORDER BY c.updated_at DESC NULLS LAST, c.id ASC`,
    scope === "every_firm" ? [] : [firm],
  );
  return json(c, {
    firmId: firm,
    contacts: rows.rows.map((r) => ({
      id: r.id,
      firmId: r.firm_id,
      email: r.email,
      phone: r.phone,
      name: r.name,
      notes: r.notes,
      tags: Array.isArray(r.tags) ? r.tags : [],
      firmName: r.firm_name,
      createdAt: r.created_at,
      reachability: r.reachability ?? null,
      sequenceReady: r.sequence_ready == null ? null : Boolean(r.sequence_ready),
    })),
  });
}

/**
 * Book a meeting — durable machine outcome. Stops open sequence chase for that contact.
 */
export async function handleMeetingBook(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{
    contactId: string;
    slot?: string;
    consultantName?: string;
    source?: string;
    contactName?: string;
  }>();
  const contactId = (body.contactId ?? "").trim();
  if (!contactId) return json(c, { error: "contactId required" }, 400);

  const pool = getPool();
  const id = `mtg-${randomUUID()}`;
  const source = (body.source ?? "contact_portal").trim();
  const enr = await pool.query<{ id: string }>(
    `SELECT id FROM enrollment WHERE firm_id=$1 AND contact_id=$2
     ORDER BY enrolled_at DESC LIMIT 1`,
    [firm, contactId],
  );
  const enrollmentId = enr.rows[0]?.id ?? null;

  await pool.query(
    `INSERT INTO meeting_booked
       (id, firm_id, contact_id, booked_at, source, slot, consultant_name, enrollment_id, payload)
     VALUES ($1,$2,$3,now(),$4,$5,$6,$7,$8::jsonb)`,
    [
      id,
      firm,
      contactId,
      source,
      body.slot ?? null,
      body.consultantName ?? null,
      enrollmentId,
      JSON.stringify({
        contactName: body.contactName ?? null,
        slot: body.slot ?? null,
      }),
    ],
  );

  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: firm,
    eventName: "meeting_booked",
    payload: { meetingId: id, contactId, slot: body.slot ?? null },
    contactIds: [contactId],
  });

  // Close the loop: stop chasing this contact
  const stopped = await pool.query(
    `UPDATE active_attempts
     SET status='nullified', updated_at=now(),
         state = state || jsonb_build_object('meeting_booked', true, 'meeting_id', $3::text, 'nullified_at', now()::text)
     WHERE firm_id=$1 AND contact_id=$2 AND status='open'
     RETURNING id`,
    [firm, contactId, id],
  );

  await pool.query(
    `INSERT INTO engagement_records (id, firm_id, contact_id, event_kind, payload)
     VALUES ($1,$2,$3,'meeting_booked',$4::jsonb)`,
    [
      `eng-${randomUUID()}`,
      firm,
      contactId,
      JSON.stringify({
        meetingId: id,
        slot: body.slot ?? null,
        source,
        attemptsStopped: stopped.rows.map((r) => r.id),
      }),
    ],
  );

  return json(c, {
    id,
    firmId: firm,
    contactId,
    slot: body.slot ?? null,
    source,
    enrollmentId,
    attemptsStopped: stopped.rowCount ?? 0,
    table: "meeting_booked",
    workflowsFired: dispatched,
  });
}

export async function handleMeetingsList(c: Context) {
  const firm = await firmId(c);
  const pool = getPool();
  const rows = await pool.query<{
    id: string;
    firm_id: string;
    contact_id: string;
    booked_at: string;
    source: string;
    slot: string | null;
    consultant_name: string | null;
    enrollment_id: string | null;
    payload: Record<string, unknown>;
  }>(
    `SELECT id, firm_id, contact_id, booked_at, source, slot, consultant_name, enrollment_id, payload
     FROM meeting_booked WHERE firm_id=$1 ORDER BY booked_at DESC`,
    [firm],
  );
  return json(c, {
    firmId: firm,
    count: rows.rowCount ?? 0,
    meetings: rows.rows.map((r) => ({
      id: r.id,
      firmId: r.firm_id,
      contactId: r.contact_id,
      bookedAt: r.booked_at,
      source: r.source,
      slot: r.slot,
      consultantName: r.consultant_name,
      enrollmentId: r.enrollment_id,
      payload: r.payload,
    })),
  });
}

/**
 * Platform admin: list consultants (users↔firms) for the Consultant ▾ dropdown.
 * Non-admins get 403.
 */
export async function handleConsultantsList(c: Context) {
  const actor = await requireSessionActor(c);
  if (!isPlatformAdminEmail(actor.email)) {
    throw new FirmScopeError(403, "platform admin only");
  }
  const pool = getPool();
  const rows = await pool.query<{
    user_id: string;
    email: string;
    firm_id: string;
    firm_name: string;
  }>(
    `SELECT u.id AS user_id, u.email, u.firm_id::text AS firm_id, f.name AS firm_name
     FROM users u
     INNER JOIN firms f ON f.id = u.firm_id
     WHERE lower(u.email) <> lower($1)
     ORDER BY f.name ASC, u.email ASC`,
    [actor.email],
  );
  return json(c, {
    consultants: rows.rows.map((r) => ({
      userId: r.user_id,
      email: r.email,
      firmId: r.firm_id,
      firmName: r.firm_name,
    })),
  });
}

export async function handleSequenceHousingGet(c: Context) {
  const sequenceId = c.req.param("id");
  const pool = getPool();
  const campaigns = await loadHousing(pool, sequenceId);
  return json(c, { sequenceId, campaigns });
}

export async function handleSequenceHousingPut(c: Context) {
  const sequenceId = c.req.param("id");
  const firm = await firmId(c);
  const body = await c.req.json<{
    firmId?: string | null;
    campaigns: CampaignDraft[];
  }>();
  const pool = getPool();
  const campaigns = await saveHousing(
    pool,
    sequenceId,
    body.firmId === undefined ? firm : body.firmId,
    body.campaigns ?? [],
  );
  return json(c, { sequenceId, campaigns });
}

export async function handleAttemptCycleGet(c: Context) {
  const sequenceId = c.req.query("sequenceId") || null;
  const pool = getPool();
  if (sequenceId) {
    const row = await pool.query(
      `SELECT id, firm_id, sequence_id, attempt_count, wait_after_last_failed_seconds, nth_exception
       FROM seq_attempt_cycle WHERE sequence_id=$1 LIMIT 1`,
      [sequenceId],
    );
    if (row.rows[0]) return json(c, { cycle: row.rows[0] });
  }
  const global = await pool.query(
    `SELECT id, firm_id, sequence_id, attempt_count, wait_after_last_failed_seconds, nth_exception
     FROM seq_attempt_cycle WHERE id='sac-global' LIMIT 1`,
  );
  return json(c, {
    cycle: global.rows[0] ?? {
      id: "sac-global",
      firm_id: null,
      sequence_id: null,
      attempt_count: 3,
      wait_after_last_failed_seconds: 86400,
      nth_exception: {},
    },
  });
}

export async function handleAttemptCyclePut(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{
    sequenceId?: string | null;
    attemptCount?: number;
    waitAfterLastFailedSeconds?: number;
    nthException?: Record<string, unknown>;
  }>();
  const sequenceId = body.sequenceId || null;
  const id = sequenceId ? `sac-seq-${sequenceId}` : "sac-global";
  const pool = getPool();
  await pool.query(
    `INSERT INTO seq_attempt_cycle
       (id, firm_id, sequence_id, attempt_count, wait_after_last_failed_seconds, nth_exception, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,now())
     ON CONFLICT (id) DO UPDATE SET
       attempt_count=EXCLUDED.attempt_count,
       wait_after_last_failed_seconds=EXCLUDED.wait_after_last_failed_seconds,
       nth_exception=EXCLUDED.nth_exception,
       updated_at=now()`,
    [
      id,
      sequenceId ? firm : null,
      sequenceId,
      body.attemptCount ?? 3,
      body.waitAfterLastFailedSeconds ?? 86400,
      JSON.stringify(body.nthException ?? {}),
    ],
  );
  const row = await pool.query(`SELECT * FROM seq_attempt_cycle WHERE id=$1`, [id]);
  return json(c, { cycle: row.rows[0] });
}

export async function handleSequenceEnrollContacts(c: Context) {
  const sequenceId = c.req.param("id");
  await firmId(c);
  const body = await c.req.json<{
    scope?: "every_firm" | "select_from";
    contactIds?: string[];
    agentRef?: string;
  }>();
  const pool = getPool();
  const scope = body.scope === "select_from" ? "select_from" : "every_firm";
  let contactRows: Array<{ id: string; firm_id: string }>;
  if (scope === "select_from") {
    const ids = (body.contactIds ?? []).filter(Boolean);
    if (!ids.length) {
      contactRows = [];
    } else {
      const picked = await pool.query<{ id: string; firm_id: string }>(
        `SELECT id, firm_id FROM contact_records WHERE id = ANY($1::text[])`,
        [ids],
      );
      contactRows = picked.rows;
    }
  } else {
    const all = await pool.query<{ id: string; firm_id: string }>(
      `SELECT id, firm_id FROM contact_records`,
    );
    contactRows = all.rows;
  }

  const agentRef = body.agentRef ?? sequenceId;
  const enrolled: string[] = [];
  const blocked: string[] = [];
  for (const row of contactRows) {
    const result = await enrollAndActuate({
      firmId: row.firm_id,
      contactId: row.id,
      agentRef,
      sequenceId,
      payload: { source: "c8_add_contact", scope },
      purpose: "opt-in",
    });
    if (result.blocked === "halt") {
      blocked.push(row.id);
      continue;
    }
    enrolled.push(result.enrollmentId);
  }
  return json(c, {
    sequenceId,
    scope,
    enrolled: enrolled.length,
    blocked: blocked.length,
    ids: enrolled,
  });
}

export async function handleRulePackUpsert(c: Context) {
  const firm = await firmId(c);
  const body = await c.req.json<{
    id?: string;
    workflowId?: string;
    name: string;
    families?: unknown;
    customJson?: unknown;
    namedCode?: string | null;
    namedCodeOn?: boolean;
    enabled?: boolean;
  }>();
  const id = body.id ?? `rpack-${randomUUID()}`;
  const pool = getPool();
  await pool.query(
    `INSERT INTO rule_pack
       (id, firm_id, workflow_id, name, families, custom_json, named_code, named_code_on, enabled, updated_at)
     VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8,$9,now())
     ON CONFLICT (id) DO UPDATE SET
       name=EXCLUDED.name,
       families=EXCLUDED.families,
       custom_json=EXCLUDED.custom_json,
       named_code=EXCLUDED.named_code,
       named_code_on=EXCLUDED.named_code_on,
       enabled=EXCLUDED.enabled,
       updated_at=now()`,
    [
      id,
      firm,
      body.workflowId ?? null,
      body.name,
      JSON.stringify(body.families ?? []),
      JSON.stringify(body.customJson ?? null),
      body.namedCode ?? null,
      Boolean(body.namedCodeOn),
      body.enabled !== false,
    ],
  );
  return json(c, { id, table: "rule_pack" });
}
