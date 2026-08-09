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

function now() {
  return new Date().toISOString();
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
    const row: WorkflowRunRow = {
      id,
      workflow_id: workflowId,
      firm_id: FIRM,
      status: "running",
      trigger_label: triggerLabel ?? "Manual run",
      node_status: {},
      counts: {},
      started_at: now(),
      finished_at: null,
    };
    runs.set(id, row);
    return { id, workflowId, status: "running" };
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
    return { templates: [], bindings: [] };
  },
};
