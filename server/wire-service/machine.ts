import type { Context } from "hono";
import { randomUUID } from "node:crypto";
import { getPool } from "./db.ts";
import { enrollAndActuate, tickOnce } from "./cascade.ts";
import { sendGateSnapshot } from "./sendMode.ts";
import { requireSessionFirm } from "./sessionFirm.ts";
import {
  dispatchEventToWorkflows,
  materializeTriggersFromGraph,
  walkValidatedWorkflow,
  type RfNode,
} from "./workflowWalk.ts";

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
  }>();
  const id = body.id ?? `wf-${randomUUID()}`;
  const firm = await firmId(c);
  const target = body.target ?? "contact";
  const pool = getPool();
  await pool.query(
    `INSERT INTO workflow (id, firm_id, name, target, graph)
     VALUES ($1,$2,$3,$4,$5::jsonb)
     ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, graph=EXCLUDED.graph, updated_at=now()`,
    [id, firm, body.name, target, JSON.stringify(body.graph ?? { nodes: [], edges: [] })],
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
  return json(c, { id, firmId: firm, name: body.name, status: "draft", target });
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

  const wf = await pool.query<{ graph: { nodes: RfNode[]; edges: unknown[] }; firm_id: string }>(
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
    wf.rows[0].firm_id || firm,
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
     WHERE w.firm_id=$1
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
    eventPayload: { writebackId: writeId, fieldKey, contactId },
  });

  return json(c, {
    writebackId: writeId,
    contactId,
    fieldKey,
    missingSignalIds: missingIds,
    cascade: [{ table: "fact_writebacks", id: writeId }, ...cascade],
    workflowsFired,
    gate: sendGateSnapshot(),
    note: "fact_writeback → re-eval → eligibility.changed",
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
  const runId = `arun-${randomUUID()}`;
  await pool.query(
    `INSERT INTO audit_runs (id, firm_id, status, import_ids)
     VALUES ($1,$2,'running',$3::jsonb)`,
    [runId, firm, JSON.stringify(body.importIds ?? [])],
  );

  const contacts = body.contactIds ?? [];
  const verdicts: Array<{
    contactId: string;
    verdict: string;
    ready: boolean;
    email?: string | null;
    phone?: string | null;
    name?: string | null;
  }> = [];
  for (const contact of contacts) {
    await pool.query(
      `INSERT INTO contact_records (id, firm_id, email, phone, name)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email, phone=EXCLUDED.phone, name=EXCLUDED.name, updated_at=now()`,
      [contact.id, firm, contact.email ?? null, contact.phone ?? null, contact.name ?? null],
    );
    const hasEmail = Boolean(contact.email);
    const hasPhone = Boolean(contact.phone);
    const verdict =
      hasEmail && hasPhone ? "reachable" : hasEmail || hasPhone ? "partial" : "unreachable";
    const ready = verdict === "reachable" || verdict === "partial";
    await pool.query(
      `INSERT INTO reachability_verdicts (contact_id, firm_id, verdict, details)
       VALUES ($1,$2,$3,$4::jsonb)
       ON CONFLICT (contact_id, firm_id) DO UPDATE SET verdict=EXCLUDED.verdict, details=EXCLUDED.details, updated_at=now()`,
      [contact.id, firm, verdict, JSON.stringify({ auditRunId: runId })],
    );
    await pool.query(
      `INSERT INTO sequence_ready (contact_id, firm_id, ready)
       VALUES ($1,$2,$3)
       ON CONFLICT (contact_id, firm_id) DO UPDATE SET ready=EXCLUDED.ready, updated_at=now()`,
      [contact.id, firm, ready],
    );
    verdicts.push({
      contactId: contact.id,
      verdict,
      ready,
      email: contact.email ?? null,
      phone: contact.phone ?? null,
      name: contact.name ?? null,
    });
  }

  await pool.query(
    `UPDATE audit_runs SET status='complete', finished_at=now(),
      summary=$2::jsonb WHERE id=$1`,
    [runId, JSON.stringify({ contacts: contacts.length, ready: verdicts.filter((v) => v.ready).length })],
  );

  return json(c, {
    id: runId,
    firm_id: firm,
    status: "complete",
    import_ids: body.importIds ?? [],
    summary: { contacts: contacts.length, ready: verdicts.filter((v) => v.ready).length },
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
    contacts: contacts.length,
    verdicts,
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
     WHERE firm_id=$1 AND sequence_class='optin_launch'`,
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
  }>();
  const id = `bind.${firm}.${body.sequenceClass}`;
  const pool = getPool();
  await pool.query(
    `INSERT INTO firm_sequence_binding (id, firm_id, sequence_class, template_id, variable_bindings)
     VALUES ($1,$2,$3,$4,$5::jsonb)
     ON CONFLICT (firm_id, sequence_class) DO UPDATE SET
       template_id=EXCLUDED.template_id,
       variable_bindings=EXCLUDED.variable_bindings,
       updated_at=now()`,
    [
      id,
      firm,
      body.sequenceClass,
      body.templateId,
      JSON.stringify(body.variableBindings ?? {}),
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
  }>();
  const pool = getPool();
  const existing = await pool.query(`SELECT * FROM rule_attempt_criteria WHERE id=$1`, [id]);
  if (!existing.rowCount) {
    return json(c, { error: "attempt criteria not found", id }, 404);
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
  };
  await pool.query(
    `UPDATE rule_attempt_criteria SET
       label=$2, enabled=$3, threshold=$4, threshold_unit=$5,
       when_clause=$6, condition_clause=$7, set_value=$8, ord=$9,
       firm_id=$10, version=version+1
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
    ],
  );
  const updated = await pool.query(`SELECT * FROM rule_attempt_criteria WHERE id=$1`, [id]);
  return json(c, updated.rows[0]);
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
      authUser = true;
    } else {
      await pool.query(`INSERT INTO users (firm_id, email) VALUES ($1::uuid, $2)`, [firm, email]);
      authUser = true;
    }
  } catch (err) {
    console.error("provision.authUser.failed", err);
    authUser = false;
  }

  const loginPath = `/login?tenancy=assisted&email=${encodeURIComponent(email)}`;
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
    bound: true,
  });
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

/** List contact_records for the session firm — empty book when freshly provisioned. */
export async function handleContactRecordsList(c: Context) {
  const firm = await firmId(c);
  const pool = getPool();
  const rows = await pool.query<{
    id: string;
    firm_id: string;
    email: string | null;
    phone: string | null;
    name: string | null;
  }>(
    `SELECT id, firm_id, email, phone, name FROM contact_records
     WHERE firm_id=$1 ORDER BY updated_at DESC NULLS LAST, id ASC`,
    [firm],
  );
  return json(c, {
    firmId: firm,
    contacts: rows.rows.map((r) => ({
      id: r.id,
      firmId: r.firm_id,
      email: r.email,
      phone: r.phone,
      name: r.name,
    })),
  });
}
