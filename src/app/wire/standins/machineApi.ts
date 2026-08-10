/**
 * In-browser stand-in for machine tables when VITE_WIRE_REAL=false.
 * Mirrors the Postgres transitions so UI can be exercised without the wire service.
 */
import type { MachineApiPort } from "../ports";
import type {
  EligibilityResultRow,
  EnrollmentRow,
  MotionDecisionRow,
  SignalRow,
  WorkflowRow,
  WorkflowRunRow,
} from "../machineTypes";

const FIRM = "firm-cedar";

const workflows = new Map<string, WorkflowRow & { status: "draft" | "active" | "paused" }>();
const runs = new Map<string, WorkflowRunRow>();
const enrollments: EnrollmentRow[] = [];
const eligibilityResults: EligibilityResultRow[] = [];
const signals: SignalRow[] = [];
const motionDecisions: MotionDecisionRow[] = [];
const templates = new Map<
  string,
  {
    id: string;
    sequence_class: string;
    variant: string;
    label: string;
    cells: unknown[];
    source: string | null;
    silences: unknown[];
    version: number;
  }
>();
const bindings = new Map<
  string,
  {
    id: string;
    firm_id: string;
    sequence_class: string;
    template_id: string;
    overrides: unknown[];
    variable_bindings: Record<string, unknown>;
  }
>();

function now() {
  return new Date().toISOString();
}

function walkStandInGraph(
  workflowId: string,
  runId: string,
  triggerLabel: string,
): { nodeStatus: Record<string, unknown>; enrollments: string[]; ok: boolean } {
  const w = workflows.get(workflowId);
  const nodes = (w?.graph?.nodes ?? []) as Array<{
    id: string;
    type?: string;
    data?: Record<string, unknown>;
  }>;
  const edges = (w?.graph?.edges ?? []) as Array<{ source: string; target: string }>;
  const nodeStatus: Record<string, unknown> = {};
  const enrIds: string[] = [];
  const order: string[] = [];
  const start = nodes.find((n) => n.type === "trigger");
  if (!start) return { nodeStatus, enrollments: enrIds, ok: false };

  const bySource = new Map<string, string[]>();
  for (const e of edges) {
    const list = bySource.get(e.source) ?? [];
    list.push(e.target);
    bySource.set(e.source, list);
  }

  let cur: string | undefined = start.id;
  const seen = new Set<string>();
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    order.push(cur);
    const node = nodes.find((n) => n.id === cur);
    if (!node) break;
    if (node.type === "action") {
      const agentRef =
        (typeof node.data?.agentRef === "string" && node.data.agentRef) ||
        "tpl.optin_launch.v1";
      const id = `enr-local-${Date.now()}-${enrIds.length}`;
      enrollments.push({
        id,
        firm_id: FIRM,
        contact_id: "contact-local-1",
        agent_ref: agentRef,
        sequence_id: agentRef,
        workflow_run_id: runId,
        payload: { triggerLabel, dryRun: true },
        enrolled_at: now(),
      });
      enrIds.push(id);
    }
    nodeStatus[cur] = { status: "success", detail: node.type, at: now() };
    cur = bySource.get(cur)?.[0];
  }
  void triggerLabel;
  return { nodeStatus, enrollments: enrIds, ok: order.length > 0 };
}

export const standInMachineApi: MachineApiPort = {
  tag: "stand-in",

  async health() {
    return { ok: true, machineTables: false };
  },

  async listWorkflows() {
    return [...workflows.values()];
  },

  async createWorkflow(input) {
    const id = input.id ?? `wf-local-${Date.now()}`;
    const row = {
      id,
      firm_id: FIRM,
      name: input.name,
      target: (input.target ?? "contact") as WorkflowRow["target"],
      graph: (input.graph as WorkflowRow["graph"]) ?? { nodes: [], edges: [] },
      created_at: now(),
      updated_at: now(),
      status: "draft" as const,
    };
    workflows.set(id, row);
    return { id, status: "draft", name: row.name, target: row.target };
  },

  async activateWorkflow(workflowId) {
    const w = workflows.get(workflowId);
    if (!w) throw new Error("workflow missing");
    w.status = "active";
    w.updated_at = now();
    return { workflowId, status: "active", transition: "draft→active" };
  },

  async pauseWorkflow(workflowId) {
    const w = workflows.get(workflowId);
    if (!w) throw new Error("workflow missing");
    w.status = "paused";
    return { workflowId, status: "paused" };
  },

  async startRun(workflowId, triggerLabel) {
    const id = `run-local-${Date.now()}`;
    const walked = walkStandInGraph(workflowId, id, triggerLabel ?? "Manual run");
    const row: WorkflowRunRow = {
      id,
      workflow_id: workflowId,
      firm_id: FIRM,
      status: walked.ok ? "success" : "failed",
      trigger_label: triggerLabel ?? "Manual run",
      node_status: walked.nodeStatus,
      counts: { enrollments: walked.enrollments.length },
      started_at: now(),
      finished_at: now(),
    };
    runs.set(id, row);
    return {
      id,
      workflowId,
      status: row.status,
      nodeStatus: walked.nodeStatus,
      enrollments: walked.enrollments,
    };
  },

  async completeRun(runId, body) {
    const row = runs.get(runId);
    if (row) {
      row.status = (body?.status as WorkflowRunRow["status"]) ?? "success";
      row.finished_at = now();
      if (body?.nodeStatus) row.node_status = body.nodeStatus as Record<string, unknown>;
      if (body?.counts) row.counts = body.counts as Record<string, unknown>;
    }
    return { id: runId, status: body?.status ?? "success" };
  },

  async listRuns(workflowId) {
    return [...runs.values()]
      .filter((r) => r.workflow_id === workflowId)
      .sort((a, b) => b.started_at.localeCompare(a.started_at));
  },

  async createEnrollment(input) {
    const id = `enr-local-${Date.now()}`;
    const row: EnrollmentRow = {
      id,
      firm_id: FIRM,
      contact_id: input.contactId,
      agent_ref: input.agentRef,
      sequence_id: input.sequenceId ?? null,
      workflow_run_id: input.workflowRunId ?? null,
      payload: (input.payload as Record<string, unknown>) ?? {},
      enrolled_at: now(),
    };
    enrollments.push(row);
    return { id, enrolledAt: row.enrolled_at };
  },

  async upsertReference(input) {
    const referenceId = input.id ?? `ref.${input.key}.local`;
    const contactIds = input.contactIds ?? ["contact-local-1"];
    const cascade: unknown[] = [{ table: "reference_versions", id: referenceId }];
    for (const contactId of contactIds) {
      const resultId = `eres-local-${Date.now()}-${contactId}`;
      const signalId = `sig-local-${Date.now()}-${contactId}`;
      const motionId = `mot-local-${Date.now()}-${contactId}`;
      const enrId = `enr-local-${Date.now()}-${contactId}`;
      eligibilityResults.push({
        id: resultId,
        evaluation_id: null,
        firm_id: FIRM,
        contact_id: contactId,
        result: { trigger: "reference_version", refId: referenceId },
        any_pathway_pass: true,
        created_at: now(),
      });
      signals.push({
        id: signalId,
        firm_id: FIRM,
        contact_id: contactId,
        kind: "eligibility_determination",
        payload: { resultId, anyPass: true },
        created_at: now(),
      });
      motionDecisions.push({
        id: motionId,
        firm_id: FIRM,
        contact_id: contactId,
        motion: "reactivation",
        reason: { signalId, precedence: "mp-1" },
        created_at: now(),
      });
      enrollments.push({
        id: enrId,
        firm_id: FIRM,
        contact_id: contactId,
        agent_ref: "tpl.reactivation.v1",
        sequence_id: "tpl.reactivation.v1",
        workflow_run_id: null,
        payload: { motionId, dryRun: true },
        enrolled_at: now(),
      });
      cascade.push({ contactId, resultId, signalId, motionId, enrollmentId: enrId });
    }
    return { referenceId, cascade };
  },

  async createAuditRun(input) {
    const contacts = input.contactIds ?? [];
    return {
      id: `arun-local-${Date.now()}`,
      firm_id: FIRM,
      status: "complete" as const,
      import_ids: input.importIds ?? [],
      summary: { contacts: contacts.length },
      started_at: now(),
      finished_at: now(),
      contacts: contacts.length,
    };
  },

  async fireOnboarding() {
    return { enrollments: 0, agentRef: "tpl.optin_launch.v1", skipped: false };
  },

  async boardDetections() {
    return { eligibilityResults, signals, motionDecisions, enrollments };
  },

  async listTemplates() {
    return {
      templates: [...templates.values()] as never,
      bindings: [...bindings.values()] as never,
    };
  },

  async upsertTemplate(input) {
    const prev = templates.get(input.id);
    templates.set(input.id, {
      id: input.id,
      sequence_class: input.sequenceClass,
      variant: input.variant ?? "v1",
      label: input.label ?? input.id,
      cells: input.cells,
      source: prev?.source ?? "agent-editor",
      silences: prev?.silences ?? [],
      version: (prev?.version ?? 0) + 1,
    });
    return { id: input.id, cells: input.cells.length, table: "sequence_template" };
  },

  async upsertBinding(input) {
    const id = `bind.${FIRM}.${input.sequenceClass}`;
    bindings.set(id, {
      id,
      firm_id: FIRM,
      sequence_class: input.sequenceClass,
      template_id: input.templateId,
      overrides: [],
      variable_bindings: input.variableBindings ?? {},
    });
    return { id, sequenceClass: input.sequenceClass, templateId: input.templateId };
  },

  async fireEvent(input) {
    const fired: unknown[] = [];
    for (const w of workflows.values()) {
      if (w.status !== "active") continue;
      const nodes = (w.graph?.nodes ?? []) as Array<{
        type?: string;
        data?: Record<string, unknown>;
      }>;
      const trig = nodes.find(
        (n) =>
          n.type === "trigger" &&
          n.data?.triggerKind === "event" &&
          n.data?.triggerEvent === input.eventName,
      );
      if (!trig) continue;
      const started = await standInMachineApi.startRun(w.id, `event:${input.eventName}`);
      fired.push({ workflowId: w.id, runId: started.id, enrollments: started.enrollments?.length ?? 0 });
    }
    return { eventName: input.eventName, workflowsFired: fired };
  },
};
