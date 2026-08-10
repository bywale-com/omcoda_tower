import type { MachineApiPort } from "../ports";
import { wireFetch } from "../http";
import type {
  AuditRunRow,
  EligibilityResultRow,
  EnrollmentRow,
  FirmSequenceBindingRow,
  MotionDecisionRow,
  SequenceTemplateRow,
  SignalRow,
  WorkflowRow,
  WorkflowRunRow,
} from "../machineTypes";

const FIRM = "firm-cedar";

function firmHeader(): HeadersInit {
  return { "x-firm-id": FIRM };
}

export const realMachineApi: MachineApiPort = {
  tag: "real",

  async health() {
    return wireFetch<{ ok: boolean; machineTables: boolean }>("/machine/health");
  },

  async listWorkflows() {
    const res = await wireFetch<{ workflows: WorkflowRow[] }>(
      `/machine/workflows?firmId=${encodeURIComponent(FIRM)}`,
      { headers: firmHeader() },
    );
    return res.workflows;
  },

  async createWorkflow(input) {
    return wireFetch<{ id: string; status: string; name: string; target: string }>(
      `/machine/workflows?firmId=${encodeURIComponent(FIRM)}`,
      {
        method: "POST",
        headers: firmHeader(),
        body: JSON.stringify(input),
      },
    );
  },

  async activateWorkflow(workflowId) {
    return wireFetch<{
      workflowId: string;
      status: string;
      transition?: string;
      triggersMaterialized?: number;
    }>(`/machine/workflows/${encodeURIComponent(workflowId)}/activate`, {
      method: "POST",
      headers: firmHeader(),
      body: "{}",
    });
  },

  async pauseWorkflow(workflowId) {
    return wireFetch<{ workflowId: string; status: string }>(
      `/machine/workflows/${encodeURIComponent(workflowId)}/pause`,
      { method: "POST", headers: firmHeader(), body: "{}" },
    );
  },

  async startRun(workflowId, triggerLabel, opts) {
    return wireFetch<{
      id: string;
      workflowId: string;
      status: string;
      nodeStatus?: Record<string, unknown>;
      enrollments?: string[];
      error?: string;
    }>(
      `/machine/workflows/${encodeURIComponent(workflowId)}/runs?firmId=${encodeURIComponent(FIRM)}`,
      {
        method: "POST",
        headers: firmHeader(),
        body: JSON.stringify({
          triggerLabel: triggerLabel ?? "Manual run",
          contactIds: opts?.contactIds,
          payload: opts?.payload,
        }),
      },
    );
  },

  async completeRun(runId, body) {
    return wireFetch<{ id: string; status: string }>(
      `/machine/runs/${encodeURIComponent(runId)}/complete`,
      {
        method: "POST",
        headers: firmHeader(),
        body: JSON.stringify(body ?? { status: "success" }),
      },
    );
  },

  async listRuns(workflowId) {
    const res = await wireFetch<{ runs: WorkflowRunRow[] }>(
      `/machine/workflows/${encodeURIComponent(workflowId)}/runs`,
      { headers: firmHeader() },
    );
    return res.runs;
  },

  async createEnrollment(input) {
    return wireFetch<{ id: string; enrolledAt: string }>(
      `/machine/enrollments?firmId=${encodeURIComponent(FIRM)}`,
      {
        method: "POST",
        headers: firmHeader(),
        body: JSON.stringify(input),
      },
    );
  },

  async upsertReference(input) {
    return wireFetch<{ referenceId: string; cascade: unknown[] }>(
      `/machine/reference?firmId=${encodeURIComponent(FIRM)}`,
      {
        method: "POST",
        headers: firmHeader(),
        body: JSON.stringify(input),
      },
    );
  },

  async createAuditRun(input) {
    return wireFetch<AuditRunRow & { contacts: number }>(
      `/machine/audit-runs?firmId=${encodeURIComponent(FIRM)}`,
      {
        method: "POST",
        headers: firmHeader(),
        body: JSON.stringify(input),
      },
    );
  },

  async fireOnboarding() {
    return wireFetch<{ skipped?: boolean; enrollments?: number; agentRef?: string }>(
      `/machine/onboarding/fire?firmId=${encodeURIComponent(FIRM)}`,
      { method: "POST", headers: firmHeader(), body: "{}" },
    );
  },

  async boardDetections() {
    return wireFetch<{
      eligibilityResults: EligibilityResultRow[];
      signals: SignalRow[];
      motionDecisions: MotionDecisionRow[];
      enrollments: EnrollmentRow[];
    }>(`/machine/board?firmId=${encodeURIComponent(FIRM)}`, { headers: firmHeader() });
  },

  async listTemplates() {
    return wireFetch<{
      templates: SequenceTemplateRow[];
      bindings: FirmSequenceBindingRow[];
    }>(`/machine/templates?firmId=${encodeURIComponent(FIRM)}`, { headers: firmHeader() });
  },

  async upsertTemplate(input) {
    return wireFetch<{ id: string; cells: number; table: string }>(
      `/machine/templates/${encodeURIComponent(input.id)}`,
      {
        method: "PUT",
        headers: firmHeader(),
        body: JSON.stringify({
          sequenceClass: input.sequenceClass,
          label: input.label,
          cells: input.cells,
          variant: input.variant,
        }),
      },
    );
  },

  async upsertBinding(input) {
    return wireFetch<{ id: string; sequenceClass: string; templateId: string }>(
      `/machine/bindings?firmId=${encodeURIComponent(FIRM)}`,
      {
        method: "POST",
        headers: firmHeader(),
        body: JSON.stringify(input),
      },
    );
  },

  async fireEvent(input) {
    return wireFetch<{ eventName: string; workflowsFired: unknown[] }>(
      `/machine/events?firmId=${encodeURIComponent(FIRM)}`,
      {
        method: "POST",
        headers: firmHeader(),
        body: JSON.stringify(input),
      },
    );
  },
};
