import type { MachineApiPort } from "../ports";
import { wireFetch } from "../http";
import type {
  AttemptCriteriaRow,
  AuditRunRow,
  CampaignState,
  ChannelOwnershipOrderRow,
  EligibilityPathwayRow,
  EligibilityPipelineRow,
  EligibilityResultRow,
  EnrollmentRow,
  EvaluationPin,
  FieldClassRoutingRow,
  FirmSequenceBindingRow,
  MotionDecisionRow,
  MotionPrecedenceRow,
  ProvisionResult,
  ReferenceVersionRow,
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

  async listAttemptCriteria() {
    const res = await wireFetch<{ criteria: AttemptCriteriaRow[] }>(
      `/machine/rules/attempt-criteria?firmId=${encodeURIComponent(FIRM)}`,
      { headers: firmHeader() },
    );
    return res.criteria;
  },

  async upsertAttemptCriteria(id, patch) {
    return wireFetch<AttemptCriteriaRow>(
      `/machine/rules/attempt-criteria/${encodeURIComponent(id)}?firmId=${encodeURIComponent(FIRM)}`,
      {
        method: "PUT",
        headers: firmHeader(),
        body: JSON.stringify(patch),
      },
    );
  },

  async listChannelOrder() {
    const res = await wireFetch<{ order: ChannelOwnershipOrderRow[] }>(
      `/machine/seq/channel-order?firmId=${encodeURIComponent(FIRM)}`,
      { headers: firmHeader() },
    );
    return res.order;
  },

  async upsertChannelOrder(order) {
    const res = await wireFetch<{ order: ChannelOwnershipOrderRow[] }>(
      `/machine/seq/channel-order?firmId=${encodeURIComponent(FIRM)}`,
      {
        method: "PUT",
        headers: firmHeader(),
        body: JSON.stringify({ order }),
      },
    );
    return res.order;
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

  async listEligibilityPipeline() {
    const res = await wireFetch<{ stages: EligibilityPipelineRow[] }>(
      `/machine/eligibility-pipeline?firmId=${encodeURIComponent(FIRM)}`,
      { headers: firmHeader() },
    );
    return res.stages;
  },

  async upsertEligibilityPipeline(stages) {
    const res = await wireFetch<{ stages: EligibilityPipelineRow[] }>(
      `/machine/eligibility-pipeline?firmId=${encodeURIComponent(FIRM)}`,
      {
        method: "PUT",
        headers: firmHeader(),
        body: JSON.stringify({ stages }),
      },
    );
    return res.stages;
  },

  async listEligibilityPathways() {
    const res = await wireFetch<{ pathways: EligibilityPathwayRow[] }>(
      `/machine/rules/eligibility-pathways?firmId=${encodeURIComponent(FIRM)}`,
      { headers: firmHeader() },
    );
    return res.pathways;
  },

  async upsertEligibilityPathway(id, patch) {
    return wireFetch<EligibilityPathwayRow>(
      `/machine/rules/eligibility-pathways/${encodeURIComponent(id)}?firmId=${encodeURIComponent(FIRM)}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify(patch) },
    );
  },

  async listMotionPrecedence() {
    const res = await wireFetch<{ rules: MotionPrecedenceRow[] }>(
      `/machine/rules/motion-precedence?firmId=${encodeURIComponent(FIRM)}`,
      { headers: firmHeader() },
    );
    return res.rules;
  },

  async upsertMotionPrecedence(id, patch) {
    return wireFetch<MotionPrecedenceRow>(
      `/machine/rules/motion-precedence/${encodeURIComponent(id)}?firmId=${encodeURIComponent(FIRM)}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify(patch) },
    );
  },

  async listFieldClassRouting() {
    const res = await wireFetch<{ rules: FieldClassRoutingRow[] }>(
      `/machine/rules/field-class-routing?firmId=${encodeURIComponent(FIRM)}`,
      { headers: firmHeader() },
    );
    return res.rules;
  },

  async upsertFieldClassRouting(id, patch) {
    return wireFetch<FieldClassRoutingRow>(
      `/machine/rules/field-class-routing/${encodeURIComponent(id)}?firmId=${encodeURIComponent(FIRM)}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify(patch) },
    );
  },

  async listCohortScoring() {
    const res = await wireFetch<{ rules: import("../machineTypes").CohortScoringRow[] }>(
      `/machine/rules/cohort-scoring?firmId=${encodeURIComponent(FIRM)}`,
      { headers: firmHeader() },
    );
    return res.rules;
  },

  async upsertCohortScoring(id, patch) {
    return wireFetch<import("../machineTypes").CohortScoringRow>(
      `/machine/rules/cohort-scoring/${encodeURIComponent(id)}?firmId=${encodeURIComponent(FIRM)}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify(patch) },
    );
  },

  async listMetricsThresholds() {
    const res = await wireFetch<{ rules: import("../machineTypes").MetricsThresholdRow[] }>(
      `/machine/rules/metrics-thresholds?firmId=${encodeURIComponent(FIRM)}`,
      { headers: firmHeader() },
    );
    return res.rules;
  },

  async upsertMetricsThreshold(id, patch) {
    return wireFetch<import("../machineTypes").MetricsThresholdRow>(
      `/machine/rules/metrics-thresholds/${encodeURIComponent(id)}?firmId=${encodeURIComponent(FIRM)}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify(patch) },
    );
  },

  async listReachabilityChecks() {
    const res = await wireFetch<{ rules: import("../machineTypes").ReachabilityCheckRow[] }>(
      `/machine/rules/reachability-checks?firmId=${encodeURIComponent(FIRM)}`,
      { headers: firmHeader() },
    );
    return res.rules;
  },

  async upsertReachabilityCheck(id, patch) {
    return wireFetch<import("../machineTypes").ReachabilityCheckRow>(
      `/machine/rules/reachability-checks/${encodeURIComponent(id)}?firmId=${encodeURIComponent(FIRM)}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify(patch) },
    );
  },

  async listPhaseOrder() {
    const res = await wireFetch<{ order: import("../machineTypes").PhaseOrderRow[] }>(
      `/machine/seq/phase-order?firmId=${encodeURIComponent(FIRM)}`,
      { headers: firmHeader() },
    );
    return res.order;
  },

  async upsertPhaseOrder(order) {
    const res = await wireFetch<{ order: import("../machineTypes").PhaseOrderRow[] }>(
      `/machine/seq/phase-order?firmId=${encodeURIComponent(FIRM)}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify({ order }) },
    );
    return res.order;
  },

  async writeFact(input) {
    return wireFetch<import("../machineTypes").FactWritebackResult>(
      `/machine/fact-writebacks?firmId=${encodeURIComponent(FIRM)}`,
      { method: "POST", headers: firmHeader(), body: JSON.stringify(input) },
    );
  },

  async listFactWritebacks(contactId) {
    const q = contactId
      ? `?firmId=${encodeURIComponent(FIRM)}&contactId=${encodeURIComponent(contactId)}`
      : `?firmId=${encodeURIComponent(FIRM)}`;
    const res = await wireFetch<{ writebacks: import("../machineTypes").FactWritebackRow[] }>(
      `/machine/fact-writebacks${q}`,
      { headers: firmHeader() },
    );
    return res.writebacks;
  },

  async listMissingFactSignals(contactId) {
    const q = contactId
      ? `?firmId=${encodeURIComponent(FIRM)}&contactId=${encodeURIComponent(contactId)}`
      : `?firmId=${encodeURIComponent(FIRM)}`;
    const res = await wireFetch<{ signals: import("../machineTypes").MissingFactSignalRow[] }>(
      `/machine/missing-fact-signals${q}`,
      { headers: firmHeader() },
    );
    return res.signals;
  },

  async signalMissingFact(input) {
    return wireFetch<{ id: string; contactId: string; fieldKey: string }>(
      `/machine/missing-fact-signals?firmId=${encodeURIComponent(FIRM)}`,
      { method: "POST", headers: firmHeader(), body: JSON.stringify(input) },
    );
  },

  async listPreparedWorkspaces() {
    const res = await wireFetch<{ workspaces: import("../machineTypes").PreparedWorkspaceRow[] }>(
      `/machine/prepared-workspaces?firmId=${encodeURIComponent(FIRM)}`,
      { headers: firmHeader() },
    );
    return res.workspaces;
  },

  async upsertPreparedWorkspace(input) {
    const id = input.id ?? `pw-${FIRM}`;
    return wireFetch<import("../machineTypes").PreparedWorkspaceRow>(
      `/machine/prepared-workspaces/${encodeURIComponent(id)}?firmId=${encodeURIComponent(FIRM)}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify({ ...input, id }) },
    );
  },

  async listActiveAttempts() {
    const res = await wireFetch<{ attempts: import("../machineTypes").ActiveAttemptRow[] }>(
      `/machine/active-attempts?firmId=${encodeURIComponent(FIRM)}`,
      { headers: firmHeader() },
    );
    return res.attempts;
  },

  async listEngagementRecords() {
    const res = await wireFetch<{ records: import("../machineTypes").EngagementRecordRow[] }>(
      `/machine/engagement-records?firmId=${encodeURIComponent(FIRM)}`,
      { headers: firmHeader() },
    );
    return res.records;
  },

  async listReferenceVersions() {
    const res = await wireFetch<{ versions: ReferenceVersionRow[] }>(
      `/machine/reference-versions?firmId=${encodeURIComponent(FIRM)}`,
      { headers: firmHeader() },
    );
    return res.versions;
  },

  async getEvaluationPin(packId) {
    return wireFetch<{
      packId: string;
      referenceVersionId: string | null;
      rulesetId: string | null;
      missing?: boolean;
    }>(`/machine/evaluation-pins/${encodeURIComponent(packId)}`, { headers: firmHeader() });
  },

  async putEvaluationPin(packId, pin) {
    return wireFetch<EvaluationPin & { table?: string; id?: string }>(
      `/machine/evaluation-pins/${encodeURIComponent(packId)}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify(pin) },
    );
  },

  async getCampaignState() {
    return wireFetch<{ firmId: string; state: CampaignState; missing?: boolean }>(
      `/machine/campaign-state?firmId=${encodeURIComponent(FIRM)}`,
      { headers: firmHeader() },
    );
  },

  async setCampaignState(state) {
    return wireFetch<{ firmId: string; state: CampaignState }>(
      `/machine/campaign-state?firmId=${encodeURIComponent(FIRM)}`,
      { method: "POST", headers: firmHeader(), body: JSON.stringify({ state }) },
    );
  },

  async provisionFirm(input) {
    return wireFetch<ProvisionResult>(`/machine/provision`, {
      method: "POST",
      headers: firmHeader(),
      body: JSON.stringify(input),
    });
  },
};
