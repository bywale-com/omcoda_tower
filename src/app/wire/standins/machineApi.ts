/**
 * In-browser stand-in for machine tables when VITE_WIRE_REAL=false.
 * Mirrors the Postgres transitions so UI can be exercised without the wire service.
 */
import type { MachineApiPort, MachineContactRow } from "../ports";
import { getActiveFirmId } from "../firmContext";
import type {
  EligibilityResultRow,
  EnrollmentRow,
  MotionDecisionRow,
  SignalRow,
  WorkflowRow,
  WorkflowRunRow,
} from "../machineTypes";

function firm() {
  return getActiveFirmId();
}

const workflows = new Map<string, WorkflowRow & { status: "draft" | "active" | "paused" }>();
const runs = new Map<string, WorkflowRunRow>();
const enrollments: EnrollmentRow[] = [];
const eligibilityResults: EligibilityResultRow[] = [];
const signals: SignalRow[] = [];
const motionDecisions: MotionDecisionRow[] = [];
const contacts = new Map<string, MachineContactRow>();
let authorized = false;

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
      firm_id: firm(),
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
      firm_id: firm(),
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
      firm_id: firm(),
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
        firm_id: firm(),
        contact_id: contactId,
        result: { trigger: "reference_version", refId: referenceId },
        any_pathway_pass: true,
        created_at: now(),
      });
      signals.push({
        id: signalId,
        firm_id: firm(),
        contact_id: contactId,
        kind: "eligibility_determination",
        payload: { resultId, anyPass: true },
        created_at: now(),
      });
      motionDecisions.push({
        id: motionId,
        firm_id: firm(),
        contact_id: contactId,
        motion: "reactivation",
        reason: { signalId, precedence: "mp-1" },
        created_at: now(),
      });
      enrollments.push({
        id: enrId,
        firm_id: firm(),
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
      firm_id: firm(),
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

  async journeyStatus() {
    return {
      firmId: firm(),
      authorized,
      contactCount: [...contacts.values()].filter((c) => c.firm_id === firm()).length,
      reachableCount: [...contacts.values()].filter(
        (c) => c.firm_id === firm() && c.verdict === "reachable",
      ).length,
      signalCount: signals.filter((s) => s.firm_id === firm()).length,
      enrollmentCount: enrollments.filter((e) => e.firm_id === firm()).length,
    };
  },

  async authorizeBook() {
    authorized = true;
    return { firmId: firm(), authorized: true, table: "crm_oauth_grants" };
  },

  async listContacts() {
    return [...contacts.values()].filter((c) => c.firm_id === firm());
  },

  async importContacts(input) {
    const ids: string[] = [];
    for (const row of input.contacts) {
      const id = row.id ?? `c-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      contacts.set(id, {
        id,
        firm_id: firm(),
        email: row.email ?? null,
        phone: row.phone ?? null,
        name: row.name ?? null,
        created_at: now(),
      });
      ids.push(id);
    }
    return {
      importId: `imp-local-${Date.now()}`,
      firmId: firm(),
      written: ids.length,
      contactIds: ids,
      table: "contact_records",
    };
  },

  async journeyDetect() {
    let signalsN = 0;
    for (const c of contacts.values()) {
      if (c.firm_id !== firm()) continue;
      const reachable = Boolean(c.email || c.phone);
      c.verdict = reachable ? "reachable" : "unreachable";
      c.ready = reachable;
      if (!reachable) continue;
      const resultId = `eres-local-${c.id}`;
      eligibilityResults.push({
        id: resultId,
        evaluation_id: null,
        firm_id: firm(),
        contact_id: c.id,
        result: { source: "journey_detect" },
        any_pathway_pass: true,
        created_at: now(),
      });
      signals.push({
        id: `sig-local-${c.id}`,
        firm_id: firm(),
        contact_id: c.id,
        kind: "eligibility_determination",
        payload: { resultId },
        created_at: now(),
      });
      motionDecisions.push({
        id: `mot-local-${c.id}`,
        firm_id: firm(),
        contact_id: c.id,
        motion: "reactivation",
        reason: {},
        created_at: now(),
      });
      c.latest_signal = "eligibility_determination";
      c.latest_motion = "reactivation";
      signalsN += 1;
    }
    return {
      auditRunId: `arun-local-${Date.now()}`,
      contacts: [...contacts.values()].filter((c) => c.firm_id === firm()).length,
      signals: signalsN,
      table: "eligibility_results",
    };
  },

  async journeyOutreach() {
    const results: Array<{ contactId: string; enrollmentId: string; dryRun: boolean }> = [];
    for (const c of contacts.values()) {
      if (c.firm_id !== firm() || !c.ready) continue;
      const id = `enr-local-${c.id}`;
      enrollments.push({
        id,
        firm_id: firm(),
        contact_id: c.id,
        agent_ref: "tpl.optin_launch.v1",
        sequence_id: "tpl.optin_launch.v1",
        workflow_run_id: null,
        payload: { dryRun: true },
        enrolled_at: now(),
      });
      c.latest_enrollment = "tpl.optin_launch.v1";
      results.push({ contactId: c.id, enrollmentId: id, dryRun: true });
    }
    return {
      firmId: firm(),
      agentRef: "tpl.optin_launch.v1",
      enrollments: results.length,
      results,
      table: "enrollment",
    };
  },
};
