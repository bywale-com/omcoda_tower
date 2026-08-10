import type { MachineApiPort } from "../ports";
import { wireFetch } from "../http";
import { getActiveFirmId } from "../firmContext";
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

function firm(): string {
  return getActiveFirmId();
}

function firmHeader(): HeadersInit {
  return { "x-firm-id": firm() };
}

function withFirm(path: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}firmId=${encodeURIComponent(firm())}`;
}

export const realMachineApi: MachineApiPort = {
  tag: "real",

  async health() {
    return wireFetch<{ ok: boolean; machineTables: boolean }>("/machine/health");
  },

  async listWorkflows() {
    const res = await wireFetch<{ workflows: WorkflowRow[] }>(withFirm("/machine/workflows"), {
      headers: firmHeader(),
    });
    return res.workflows;
  },

  async createWorkflow(input) {
    return wireFetch<{ id: string; status: string; name: string; target: string }>(
      withFirm("/machine/workflows"),
      {
        method: "POST",
        headers: firmHeader(),
        body: JSON.stringify(input),
      },
    );
  },

  async activateWorkflow(workflowId) {
    return wireFetch<{ workflowId: string; status: string; transition?: string }>(
      `/machine/workflows/${encodeURIComponent(workflowId)}/activate`,
      { method: "POST", headers: firmHeader(), body: "{}" },
    );
  },

  async pauseWorkflow(workflowId) {
    return wireFetch<{ workflowId: string; status: string }>(
      `/machine/workflows/${encodeURIComponent(workflowId)}/pause`,
      { method: "POST", headers: firmHeader(), body: "{}" },
    );
  },

  async startRun(workflowId, triggerLabel) {
    return wireFetch<{ id: string; workflowId: string; status: string }>(
      withFirm(`/machine/workflows/${encodeURIComponent(workflowId)}/runs`),
      {
        method: "POST",
        headers: firmHeader(),
        body: JSON.stringify({ triggerLabel: triggerLabel ?? "Manual run" }),
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
    return wireFetch<{ id: string; enrolledAt: string }>(withFirm("/machine/enrollments"), {
      method: "POST",
      headers: firmHeader(),
      body: JSON.stringify(input),
    });
  },

  async upsertReference(input) {
    return wireFetch<{ referenceId: string; cascade: unknown[] }>(withFirm("/machine/reference"), {
      method: "POST",
      headers: firmHeader(),
      body: JSON.stringify(input),
    });
  },

  async createAuditRun(input) {
    return wireFetch<AuditRunRow & { contacts: number }>(withFirm("/machine/audit-runs"), {
      method: "POST",
      headers: firmHeader(),
      body: JSON.stringify(input),
    });
  },

  async fireOnboarding() {
    return wireFetch<{ skipped?: boolean; enrollments?: number; agentRef?: string }>(
      withFirm("/machine/onboarding/fire"),
      { method: "POST", headers: firmHeader(), body: "{}" },
    );
  },

  async boardDetections() {
    return wireFetch<{
      eligibilityResults: EligibilityResultRow[];
      signals: SignalRow[];
      motionDecisions: MotionDecisionRow[];
      enrollments: EnrollmentRow[];
    }>(withFirm("/machine/board"), { headers: firmHeader() });
  },

  async listTemplates() {
    return wireFetch<{
      templates: SequenceTemplateRow[];
      bindings: FirmSequenceBindingRow[];
    }>(withFirm("/machine/templates"), { headers: firmHeader() });
  },

  async journeyStatus() {
    return wireFetch<{
      firmId: string;
      authorized: boolean;
      contactCount: number;
      reachableCount: number;
      signalCount: number;
      enrollmentCount: number;
    }>(withFirm("/machine/journey/status"), { headers: firmHeader() });
  },

  async authorizeBook() {
    return wireFetch<{ firmId: string; authorized: boolean; table: string }>(
      withFirm("/machine/journey/authorize"),
      { method: "POST", headers: firmHeader(), body: "{}" },
    );
  },

  async listContacts() {
    const res = await wireFetch<{ contacts: import("../ports").MachineContactRow[] }>(
      withFirm("/machine/contacts"),
      { headers: firmHeader() },
    );
    return res.contacts;
  },

  async importContacts(input) {
    return wireFetch<{
      importId: string;
      firmId: string;
      written: number;
      contactIds: string[];
      table: string;
    }>(withFirm("/machine/contacts/import"), {
      method: "POST",
      headers: firmHeader(),
      body: JSON.stringify(input),
    });
  },

  async journeyDetect() {
    return wireFetch<{
      auditRunId: string;
      contacts: number;
      signals: number;
      table: string;
    }>(withFirm("/machine/journey/detect"), {
      method: "POST",
      headers: firmHeader(),
      body: "{}" ,
    });
  },

  async journeyOutreach() {
    return wireFetch<{
      firmId: string;
      agentRef: string;
      enrollments: number;
      results: Array<{ contactId: string; enrollmentId: string; dryRun: boolean }>;
      table: string;
    }>(withFirm("/machine/journey/outreach"), {
      method: "POST",
      headers: firmHeader(),
      body: "{}",
    });
  },
};
