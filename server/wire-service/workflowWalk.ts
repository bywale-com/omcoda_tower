/**
 * v1 validated-shape walker: Trigger → Constants → Conditions → Rules → Action → Exit
 * Reuses enrollAndActuate from cascade. Does not walk arbitrary free-form graphs (v2).
 */
import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { enrollAndActuate } from "./cascade.ts";

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
  triggerPayload: Record<string, unknown>;
  constants: Record<string, unknown>;
  contactIds: string[];
  eligibilityPass?: boolean;
  branchTaken?: string;
};

export type NodeRunStatus = {
  status: "success" | "skipped" | "failed";
  detail?: string;
  at: string;
};

function now() {
  return new Date().toISOString();
}

function isValidatedPipeline(nodes: RfNode[]): boolean {
  const types = new Set(nodes.map((n) => n.type).filter(Boolean));
  // Must have trigger + action (or at least trigger); allow missing constant/branch/rule
  return types.has("trigger") && (types.has("action") || types.has("exit"));
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
  const actionType = String(data?.actionType ?? "enroll_sequence");
  if (actionType !== "enroll_sequence" && actionType !== "call_agent") {
    return null;
  }
  // Prefer explicit agent_ref on data; else parse class from summary heuristics
  if (typeof data?.agentRef === "string" && data.agentRef) return data.agentRef;
  if (typeof data?.agent_ref === "string" && data.agent_ref) return data.agent_ref as string;
  const lower = summary.toLowerCase();
  if (lower.includes("reactivation")) return "tpl.reactivation.v1";
  if (lower.includes("nudge") || lower.includes("re-engagement") || lower.includes("reengagement")) {
    return "tpl.reengagement.v1";
  }
  if (lower.includes("opt-in") || lower.includes("optin") || lower.includes("welcome")) {
    return "tpl.optin_launch.v1";
  }
  return "tpl.optin_launch.v1";
}

function sequenceClassForAgent(agentRef: string): string {
  if (agentRef.includes("reactivation")) return "reactivation";
  if (agentRef.includes("reengagement") || agentRef.includes("nudge")) return "reengagement";
  if (agentRef.includes("launch_day")) return "launch_day";
  return "optin_launch";
}

async function resolveAgentRef(
  pool: Pool,
  firmId: string,
  preferred: string,
): Promise<string> {
  const seqClass = sequenceClassForAgent(preferred);
  const bind = await pool.query<{ template_id: string }>(
    `SELECT template_id FROM firm_sequence_binding
     WHERE firm_id=$1 AND sequence_class=$2`,
    [firmId, seqClass],
  );
  return bind.rows[0]?.template_id ?? preferred;
}

function evalBranch(
  data: Record<string, unknown> | undefined,
  ctx: WalkContext,
): "true" | "false" {
  const kind = String(data?.branchKind ?? "true_false");
  if (kind === "if" || kind === "true_false") {
    // Prefer eligibility / reactivation-worthy from context
    if (ctx.eligibilityPass === false) return "false";
    if (ctx.eligibilityPass === true) return "true";
    const filter = String(data?.filterSummary ?? "").toLowerCase();
    if (filter.includes("reactivation") && ctx.triggerPayload.motion === "nudge") {
      return "false";
    }
    return "true";
  }
  return "true";
}

export async function materializeTriggersFromGraph(
  pool: Pool,
  workflowId: string,
  firmId: string,
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
    await pool.query(
      `INSERT INTO workflow_trigger
         (id, workflow_id, firm_id, node_id, type, event_name, condition, schedule, webhook_id, enabled)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,true)
       ON CONFLICT (workflow_id, node_id) DO UPDATE SET
         type=EXCLUDED.type,
         event_name=EXCLUDED.event_name,
         condition=EXCLUDED.condition,
         schedule=EXCLUDED.schedule,
         webhook_id=EXCLUDED.webhook_id,
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
  },
): Promise<{
  ok: boolean;
  nodeStatus: Record<string, NodeRunStatus>;
  enrollments: string[];
  error?: string;
}> {
  const wf = await pool.query<{ graph: { nodes: RfNode[]; edges: RfEdge[] } }>(
    `SELECT graph FROM workflow WHERE id=$1 AND firm_id=$2`,
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
  if (!contactIds.length) {
    const ready = await pool.query<{ contact_id: string }>(
      `SELECT contact_id FROM sequence_ready WHERE firm_id=$1 AND ready=true LIMIT 50`,
      [opts.firmId],
    );
    contactIds = ready.rows.map((r) => r.contact_id);
  }

  const ctx: WalkContext = {
    firmId: opts.firmId,
    triggerPayload: opts.triggerPayload ?? {},
    constants: {},
    contactIds,
    eligibilityPass:
      opts.triggerPayload?.anyPass === true ||
      opts.triggerPayload?.eligibilityPass === true ||
      opts.triggerLabel.includes("eligibility") ||
      undefined,
  };

  const nodeStatus: Record<string, NodeRunStatus> = {};
  const enrollments: string[] = [];
  const visited = new Set<string>();

  async function visit(nodeId: string): Promise<void> {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = byId.get(nodeId);
    if (!node) return;
    const data = node.data ?? {};
    const type = node.type ?? "";

    try {
      if (type === "trigger") {
        nodeStatus[nodeId] = {
          status: "success",
          detail: `trigger ${triggerKind(data)}`,
          at: now(),
        };
        for (const e of outgoing(edges, nodeId)) await visit(e.target);
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
        for (const e of outgoing(edges, nodeId)) await visit(e.target);
        return;
      }

      if (type === "branch") {
        const handle = evalBranch(data, ctx);
        ctx.branchTaken = handle;
        nodeStatus[nodeId] = {
          status: "success",
          detail: `branch → ${handle}`,
          at: now(),
        };
        const outs = outgoing(edges, nodeId, handle);
        const fallback = outs.length ? outs : outgoing(edges, nodeId);
        for (const e of fallback) await visit(e.target);
        return;
      }

      if (type === "rule") {
        const ruleId = String(data.ruleId ?? "eligibility");
        // Rules consume pathway tables when present; v1 marks pass from context
        const pathway = await pool.query(
          `SELECT id FROM rule_eligibility_pathway WHERE enabled=true LIMIT 1`,
        );
        nodeStatus[nodeId] = {
          status: "success",
          detail: `rule ${ruleId}; pathways=${pathway.rowCount ?? 0}`,
          at: now(),
        };
        if (ctx.eligibilityPass === undefined) ctx.eligibilityPass = true;
        for (const e of outgoing(edges, nodeId)) await visit(e.target);
        return;
      }

      if (type === "action") {
        const preferred = actionAgentRef(data) ?? "tpl.optin_launch.v1";
        const agentRef = await resolveAgentRef(pool, opts.firmId, preferred);
        let enrolled = 0;
        for (const contactId of ctx.contactIds) {
          const result = await enrollAndActuate({
            firmId: opts.firmId,
            contactId,
            agentRef,
            sequenceId: agentRef,
            workflowRunId: opts.runId,
            purpose: sequenceClassForAgent(agentRef) === "optin_launch" ? "opt-in" : "cem",
            payload: {
              workflowId: opts.workflowId,
              runId: opts.runId,
              constants: ctx.constants,
              trigger: opts.triggerPayload,
              dryRunBinding: true,
            },
            fireFirstStep: true,
          });
          if (result.blocked === "halt") {
            // H1: skip new enrollment; do not abort other contacts / in-flight attempts
            continue;
          }
          enrollments.push(result.enrollmentId);
          enrolled += 1;

          // Persist action row for this node (idempotent upsert by id)
          await pool.query(
            `INSERT INTO action (id, workflow_id, node_id, type, agent_ref, payload_binding)
             VALUES ($1,$2,$3,'call_agent',$4,$5::jsonb)
             ON CONFLICT (id) DO UPDATE SET agent_ref=EXCLUDED.agent_ref, payload_binding=EXCLUDED.payload_binding`,
            [
              `act-${opts.workflowId}-${nodeId}`,
              opts.workflowId,
              nodeId,
              agentRef,
              JSON.stringify({ contactId, enrollmentId: result.enrollmentId }),
            ],
          );
        }
        nodeStatus[nodeId] = {
          status: "success",
          detail: `action ${agentRef}; enrollments=${enrolled}`,
          at: now(),
        };
        for (const e of outgoing(edges, nodeId)) await visit(e.target);
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
      for (const e of outgoing(edges, nodeId)) await visit(e.target);
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
  const triggers = await pool.query<{ workflow_id: string; firm_id: string }>(
    `SELECT DISTINCT t.workflow_id, t.firm_id
     FROM workflow_trigger t
     JOIN workflow_state s ON s.workflow_id = t.workflow_id
     WHERE t.enabled=true AND t.type='schedule' AND s.status='active'`,
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
      firmId: row.firm_id,
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
  const triggers = await pool.query<{ workflow_id: string }>(
    `SELECT DISTINCT t.workflow_id
     FROM workflow_trigger t
     JOIN workflow_state s ON s.workflow_id = t.workflow_id
     WHERE t.firm_id=$1
       AND t.enabled=true
       AND t.type='event'
       AND t.event_name=$2
       AND s.status='active'`,
    [opts.firmId, opts.eventName],
  );

  const out: Array<{ workflowId: string; runId: string; enrollments: number }> = [];
  for (const row of triggers.rows) {
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
      contactIds: opts.contactIds,
    });
    out.push({
      workflowId: row.workflow_id,
      runId,
      enrollments: walked.enrollments.length,
    });
  }
  return out;
}
