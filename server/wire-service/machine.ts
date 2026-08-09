import type { Context } from "hono";
import { randomUUID } from "node:crypto";
import { getPool } from "./db.ts";

function json(c: Context, body: unknown, status = 200) {
  return c.json(body, status);
}

function firmId(c: Context): string {
  return (
    c.req.query("firmId") ||
    c.req.header("x-firm-id") ||
    "firm-cedar"
  );
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
  const firm = firmId(c);
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

/** Activate: draft → active (the proof transition). */
export async function handleWorkflowActivate(c: Context) {
  const workflowId = c.req.param("id");
  const pool = getPool();
  const cur = await pool.query<{ status: string }>(
    `SELECT status FROM workflow_state WHERE workflow_id=$1`,
    [workflowId],
  );
  if (!cur.rowCount) return json(c, { error: "workflow_state missing" }, 404);
  if (cur.rows[0].status === "active") {
    return json(c, { workflowId, status: "active", noop: true });
  }
  await pool.query(
    `UPDATE workflow_state SET status='active', updated_at=now() WHERE workflow_id=$1`,
    [workflowId],
  );
  return json(c, { workflowId, status: "active", transition: "draft→active" });
}

export async function handleWorkflowList(c: Context) {
  const firm = firmId(c);
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
  const firm = firmId(c);
  const body = await c.req.json<{ triggerLabel?: string }>().catch(() => ({}));
  const id = `run-${randomUUID()}`;
  const pool = getPool();
  await pool.query(
    `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label)
     VALUES ($1,$2,$3,'running',$4)`,
    [id, workflowId, firm, body.triggerLabel ?? "Manual run"],
  );
  return json(c, { id, workflowId, status: "running" });
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
  const firm = firmId(c);
  const body = await c.req.json<{
    contactId: string;
    agentRef: string;
    sequenceId?: string;
    workflowRunId?: string;
    payload?: unknown;
  }>();
  const id = `enr-${randomUUID()}`;
  const pool = getPool();
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, workflow_run_id, payload)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
    [
      id,
      firm,
      body.contactId,
      body.agentRef,
      body.sequenceId ?? null,
      body.workflowRunId ?? null,
      JSON.stringify(body.payload ?? {}),
    ],
  );
  return json(c, { id, enrolledAt: new Date().toISOString() });
}

/**
 * Faceless cascade: edit reference_version → eligibility_evaluation → result → signal → motion_decision.
 * No code deploy — row edit only.
 */
export async function handleReferenceUpsert(c: Context) {
  const firm = firmId(c);
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

  const cascade: unknown[] = [{ table: "reference_versions", id }];

  for (const contactId of contacts) {
    const evalId = `eval-${randomUUID()}`;
    await pool.query(
      `INSERT INTO eligibility_evaluations (id, firm_id, contact_id, trigger_kind, status)
       VALUES ($1,$2,$3,'reference_version','done')`,
      [evalId, firm, contactId],
    );
    const resultId = `eres-${randomUUID()}`;
    const anyPass = true;
    await pool.query(
      `INSERT INTO eligibility_results (id, evaluation_id, firm_id, contact_id, result, any_pathway_pass)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6)`,
      [
        resultId,
        evalId,
        firm,
        contactId,
        JSON.stringify({ trigger: "reference_version", refId: id }),
        anyPass,
      ],
    );
    const signalId = `sig-${randomUUID()}`;
    await pool.query(
      `INSERT INTO signals (id, firm_id, contact_id, kind, payload)
       VALUES ($1,$2,$3,'eligibility_determination',$4::jsonb)`,
      [signalId, firm, contactId, JSON.stringify({ resultId, anyPass })],
    );
    // Engine 2: reactivation-first when pass (simplification of mp-1)
    const motion = anyPass ? "reactivation" : "nudge";
    const motionId = `mot-${randomUUID()}`;
    await pool.query(
      `INSERT INTO motion_decisions (id, firm_id, contact_id, motion, reason)
       VALUES ($1,$2,$3,$4,$5::jsonb)`,
      [motionId, firm, contactId, motion, JSON.stringify({ signalId, precedence: "mp-1" })],
    );

    // Resolve binding + enroll
    const bind = await pool.query<{ template_id: string }>(
      `SELECT template_id FROM firm_sequence_binding
       WHERE firm_id=$1 AND sequence_class=$2`,
      [firm, motion === "reactivation" ? "reactivation" : "reengagement"],
    );
    const agentRef = bind.rows[0]?.template_id ?? "tpl.reactivation.v1";
    const enrId = `enr-${randomUUID()}`;
    await pool.query(
      `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, payload)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
      [
        enrId,
        firm,
        contactId,
        agentRef,
        agentRef,
        JSON.stringify({ motionId, dryRun: true }),
      ],
    );

    cascade.push({
      contactId,
      evaluationId: evalId,
      resultId,
      signalId,
      motionId,
      enrollmentId: enrId,
      agentRef,
    });
  }

  return json(c, {
    referenceId: id,
    cascade,
    note: "Faceless cascade wrote eligibility→signal→motion→enrollment; sequence send may be dry-run",
  });
}

export async function handleAuditRunCreate(c: Context) {
  const firm = firmId(c);
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
  for (const contact of contacts) {
    await pool.query(
      `INSERT INTO contact_records (id, firm_id, email, phone, name)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email, phone=EXCLUDED.phone, name=EXCLUDED.name, updated_at=now()`,
      [contact.id, firm, contact.email ?? null, contact.phone ?? null, contact.name ?? null],
    );
    const hasChannel = Boolean(contact.email || contact.phone);
    const verdict = hasChannel ? "reachable" : "unreachable";
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
      [contact.id, firm, verdict === "reachable"],
    );
  }

  await pool.query(
    `UPDATE audit_runs SET status='complete', finished_at=now(),
      summary=$2::jsonb WHERE id=$1`,
    [runId, JSON.stringify({ contacts: contacts.length })],
  );

  return json(c, { id: runId, status: "complete", contacts: contacts.length });
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
  const firm = firmId(c);
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
  const firm = firmId(c);
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
  const firm = firmId(c);
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

  const enrolled: string[] = [];
  for (const row of ready.rows) {
    const enrId = `enr-${randomUUID()}`;
    await pool.query(
      `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, payload)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
      [
        enrId,
        firm,
        row.contact_id,
        agentRef,
        agentRef,
        JSON.stringify({ trigger: "campaign_state=running", dryRun: true }),
      ],
    );
    enrolled.push(enrId);
  }

  return json(c, {
    firmId: firm,
    agentRef,
    enrollments: enrolled.length,
    ids: enrolled,
    note: "Opt-in enrollments written; send steps dry-run unless /wire/send used",
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
