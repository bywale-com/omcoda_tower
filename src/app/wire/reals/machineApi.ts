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
import { getActiveFirmId } from "../sessionFirm";

function firm(): string {
  return getActiveFirmId();
}

function firmHeader(): HeadersInit {
  return { "x-firm-id": firm() };
}

export const realMachineApi: MachineApiPort = {
  tag: "real",

  async health() {
    return wireFetch<{ ok: boolean; machineTables: boolean }>("/machine/health");
  },

  async listWorkflows() {
    const res = await wireFetch<{ workflows: WorkflowRow[] }>(
      `/machine/workflows?firmId=${encodeURIComponent(firm())}`,
      { headers: firmHeader() },
    );
    return res.workflows;
  },

  async createWorkflow(input) {
    return wireFetch<{ id: string; status: string; name: string; target: string }>(
      `/machine/workflows?firmId=${encodeURIComponent(firm())}`,
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
      `/machine/workflows/${encodeURIComponent(workflowId)}/runs?firmId=${encodeURIComponent(firm())}`,
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
      `/machine/enrollments?firmId=${encodeURIComponent(firm())}`,
      {
        method: "POST",
        headers: firmHeader(),
        body: JSON.stringify(input),
      },
    );
  },

  async upsertReference(input) {
    return wireFetch<{ referenceId: string; cascade: unknown[] }>(
      `/machine/reference?firmId=${encodeURIComponent(firm())}`,
      {
        method: "POST",
        headers: firmHeader(),
        body: JSON.stringify(input),
      },
    );
  },

  async createAuditRun(input) {
    return wireFetch<AuditRunRow & { contacts: number }>(
      `/machine/audit-runs?firmId=${encodeURIComponent(firm())}`,
      {
        method: "POST",
        headers: firmHeader(),
        body: JSON.stringify(input),
      },
    );
  },

  async listAuditRuns() {
    const res = await wireFetch<{ runs: AuditRunRow[] }>(
      `/machine/audit-runs?firmId=${encodeURIComponent(firm())}`,
      { headers: firmHeader() },
    );
    return res.runs;
  },

  async getAuditRun(id) {
    return wireFetch<{
      run: AuditRunRow;
      verdicts: import("../machineTypes").AuditContactVerdict[];
    }>(`/machine/audit-runs/${encodeURIComponent(id)}?firmId=${encodeURIComponent(firm())}`, {
      headers: firmHeader(),
    });
  },

  async importContactBook(input) {
    return wireFetch<{
      import_batch_id: string;
      imported: number;
      writes?: Array<{ table: string; id: string; contact_id?: string | null }>;
      workflowsFired?: unknown[];
    }>(`/machine/contact-import?firmId=${encodeURIComponent(firm())}`, {
      method: "POST",
      headers: firmHeader(),
      body: JSON.stringify(input),
    });
  },

  async getEventTestContract(eventName) {
    try {
      return await wireFetch<import("../../data/eventTestContract").EventTestHandle>(
        `/machine/event-test-contract?eventName=${encodeURIComponent(eventName)}&firmId=${encodeURIComponent(firm())}`,
        { headers: firmHeader() },
      );
    } catch {
      const { handleFromContract } = await import("../../data/eventTestContract");
      return handleFromContract(eventName, 2);
    }
  },

  async fireOnboarding() {
    return wireFetch<{ skipped?: boolean; enrollments?: number; agentRef?: string }>(
      `/machine/onboarding/fire?firmId=${encodeURIComponent(firm())}`,
      { method: "POST", headers: firmHeader(), body: "{}" },
    );
  },

  async boardDetections() {
    return wireFetch<{
      eligibilityResults: EligibilityResultRow[];
      signals: SignalRow[];
      motionDecisions: MotionDecisionRow[];
      enrollments: EnrollmentRow[];
    }>(`/machine/board?firmId=${encodeURIComponent(firm())}`, { headers: firmHeader() });
  },

  async listTemplates() {
    return wireFetch<{
      templates: SequenceTemplateRow[];
      bindings: FirmSequenceBindingRow[];
    }>(`/machine/templates?firmId=${encodeURIComponent(firm())}`, { headers: firmHeader() });
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
      `/machine/bindings?firmId=${encodeURIComponent(firm())}`,
      {
        method: "POST",
        headers: firmHeader(),
        body: JSON.stringify(input),
      },
    );
  },

  async listSequenceHousing(sequenceId) {
    return wireFetch<{
      sequenceId: string;
      campaigns: import("../machineTypes").CampaignHousingRow[];
    }>(`/machine/sequences/${encodeURIComponent(sequenceId)}/housing`, {
      headers: firmHeader(),
    });
  },

  async saveSequenceHousing(sequenceId, campaigns) {
    return wireFetch<{
      sequenceId: string;
      campaigns: import("../machineTypes").CampaignHousingRow[];
    }>(`/machine/sequences/${encodeURIComponent(sequenceId)}/housing`, {
      method: "PUT",
      headers: firmHeader(),
      body: JSON.stringify({ campaigns }),
    });
  },

  async getAttemptCycle(sequenceId) {
    const q = sequenceId ? `?sequenceId=${encodeURIComponent(sequenceId)}` : "";
    return wireFetch<{ cycle: import("../machineTypes").AttemptCycleRow }>(
      `/machine/attempt-cycle${q}`,
      { headers: firmHeader() },
    );
  },

  async saveAttemptCycle(input) {
    return wireFetch<{ cycle: import("../machineTypes").AttemptCycleRow }>(`/machine/attempt-cycle`, {
      method: "PUT",
      headers: firmHeader(),
      body: JSON.stringify(input),
    });
  },

  async enrollSequenceContacts(sequenceId, input) {
    return wireFetch<{
      sequenceId: string;
      scope: string;
      enrolled: number;
      blocked: number;
      ids: string[];
    }>(`/machine/sequences/${encodeURIComponent(sequenceId)}/enroll`, {
      method: "POST",
      headers: firmHeader(),
      body: JSON.stringify(input),
    });
  },

  async upsertRulePack(input) {
    return wireFetch<{ id: string; table: string }>(`/machine/rule-packs`, {
      method: "PUT",
      headers: firmHeader(),
      body: JSON.stringify(input),
    });
  },

  async listAttemptCriteria() {
    const res = await wireFetch<{ criteria: AttemptCriteriaRow[] }>(
      `/machine/rules/attempt-criteria?firmId=${encodeURIComponent(firm())}`,
      { headers: firmHeader() },
    );
    return res.criteria;
  },

  async upsertAttemptCriteria(id, patch) {
    return wireFetch<AttemptCriteriaRow>(
      `/machine/rules/attempt-criteria/${encodeURIComponent(id)}?firmId=${encodeURIComponent(firm())}`,
      {
        method: "PUT",
        headers: firmHeader(),
        body: JSON.stringify(patch),
      },
    );
  },

  async listSeqChannelRules(sequenceId) {
    const q = sequenceId ? `?sequenceId=${encodeURIComponent(sequenceId)}` : "";
    const res = await wireFetch<{ rules: import("../machineTypes").SeqChannelRulesRow[] }>(
      `/machine/seq/channel-rules${q}`,
      { headers: firmHeader() },
    );
    return res.rules;
  },

  async saveSeqChannelRules(input) {
    const res = await wireFetch<{ rules: import("../machineTypes").SeqChannelRulesRow[] }>(
      `/machine/seq/channel-rules`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify(input) },
    );
    return res.rules;
  },

  async listChannelOrder() {
    const res = await wireFetch<{ order: ChannelOwnershipOrderRow[] }>(
      `/machine/seq/channel-order?firmId=${encodeURIComponent(firm())}`,
      { headers: firmHeader() },
    );
    return res.order;
  },

  async upsertChannelOrder(order) {
    const res = await wireFetch<{ order: ChannelOwnershipOrderRow[] }>(
      `/machine/seq/channel-order?firmId=${encodeURIComponent(firm())}`,
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
      `/machine/events?firmId=${encodeURIComponent(firm())}`,
      {
        method: "POST",
        headers: firmHeader(),
        body: JSON.stringify(input),
      },
    );
  },

  async listEligibilityPipeline() {
    const res = await wireFetch<{ stages: EligibilityPipelineRow[] }>(
      `/machine/eligibility-pipeline?firmId=${encodeURIComponent(firm())}`,
      { headers: firmHeader() },
    );
    return res.stages;
  },

  async upsertEligibilityPipeline(stages) {
    const res = await wireFetch<{ stages: EligibilityPipelineRow[] }>(
      `/machine/eligibility-pipeline?firmId=${encodeURIComponent(firm())}`,
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
      `/machine/rules/eligibility-pathways?firmId=${encodeURIComponent(firm())}`,
      { headers: firmHeader() },
    );
    return res.pathways;
  },

  async upsertEligibilityPathway(id, patch) {
    return wireFetch<EligibilityPathwayRow>(
      `/machine/rules/eligibility-pathways/${encodeURIComponent(id)}?firmId=${encodeURIComponent(firm())}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify(patch) },
    );
  },

  async listMotionPrecedence() {
    const res = await wireFetch<{ rules: MotionPrecedenceRow[] }>(
      `/machine/rules/motion-precedence?firmId=${encodeURIComponent(firm())}`,
      { headers: firmHeader() },
    );
    return res.rules;
  },

  async upsertMotionPrecedence(id, patch) {
    return wireFetch<MotionPrecedenceRow>(
      `/machine/rules/motion-precedence/${encodeURIComponent(id)}?firmId=${encodeURIComponent(firm())}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify(patch) },
    );
  },

  async listFieldClassRouting() {
    const res = await wireFetch<{ rules: FieldClassRoutingRow[] }>(
      `/machine/rules/field-class-routing?firmId=${encodeURIComponent(firm())}`,
      { headers: firmHeader() },
    );
    return res.rules;
  },

  async upsertFieldClassRouting(id, patch) {
    return wireFetch<FieldClassRoutingRow>(
      `/machine/rules/field-class-routing/${encodeURIComponent(id)}?firmId=${encodeURIComponent(firm())}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify(patch) },
    );
  },

  async listCohortScoring() {
    const res = await wireFetch<{ rules: import("../machineTypes").CohortScoringRow[] }>(
      `/machine/rules/cohort-scoring?firmId=${encodeURIComponent(firm())}`,
      { headers: firmHeader() },
    );
    return res.rules;
  },

  async upsertCohortScoring(id, patch) {
    return wireFetch<import("../machineTypes").CohortScoringRow>(
      `/machine/rules/cohort-scoring/${encodeURIComponent(id)}?firmId=${encodeURIComponent(firm())}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify(patch) },
    );
  },

  async listMetricsThresholds() {
    const res = await wireFetch<{ rules: import("../machineTypes").MetricsThresholdRow[] }>(
      `/machine/rules/metrics-thresholds?firmId=${encodeURIComponent(firm())}`,
      { headers: firmHeader() },
    );
    return res.rules;
  },

  async upsertMetricsThreshold(id, patch) {
    return wireFetch<import("../machineTypes").MetricsThresholdRow>(
      `/machine/rules/metrics-thresholds/${encodeURIComponent(id)}?firmId=${encodeURIComponent(firm())}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify(patch) },
    );
  },

  async listReachabilityChecks() {
    const res = await wireFetch<{ rules: import("../machineTypes").ReachabilityCheckRow[] }>(
      `/machine/rules/reachability-checks?firmId=${encodeURIComponent(firm())}`,
      { headers: firmHeader() },
    );
    return res.rules;
  },

  async upsertReachabilityCheck(id, patch) {
    return wireFetch<import("../machineTypes").ReachabilityCheckRow>(
      `/machine/rules/reachability-checks/${encodeURIComponent(id)}?firmId=${encodeURIComponent(firm())}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify(patch) },
    );
  },

  async listPhaseOrder() {
    const res = await wireFetch<{ order: import("../machineTypes").PhaseOrderRow[] }>(
      `/machine/seq/phase-order?firmId=${encodeURIComponent(firm())}`,
      { headers: firmHeader() },
    );
    return res.order;
  },

  async upsertPhaseOrder(order) {
    const res = await wireFetch<{ order: import("../machineTypes").PhaseOrderRow[] }>(
      `/machine/seq/phase-order?firmId=${encodeURIComponent(firm())}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify({ order }) },
    );
    return res.order;
  },

  async writeFact(input) {
    return wireFetch<import("../machineTypes").FactWritebackResult>(
      `/machine/fact-writebacks?firmId=${encodeURIComponent(firm())}`,
      { method: "POST", headers: firmHeader(), body: JSON.stringify(input) },
    );
  },

  async listFactWritebacks(contactId) {
    const q = contactId
      ? `?firmId=${encodeURIComponent(firm())}&contactId=${encodeURIComponent(contactId)}`
      : `?firmId=${encodeURIComponent(firm())}`;
    const res = await wireFetch<{ writebacks: import("../machineTypes").FactWritebackRow[] }>(
      `/machine/fact-writebacks${q}`,
      { headers: firmHeader() },
    );
    return res.writebacks;
  },

  async listMissingFactSignals(contactId) {
    const q = contactId
      ? `?firmId=${encodeURIComponent(firm())}&contactId=${encodeURIComponent(contactId)}`
      : `?firmId=${encodeURIComponent(firm())}`;
    const res = await wireFetch<{ signals: import("../machineTypes").MissingFactSignalRow[] }>(
      `/machine/missing-fact-signals${q}`,
      { headers: firmHeader() },
    );
    return res.signals;
  },

  async signalMissingFact(input) {
    return wireFetch<{ id: string; contactId: string; fieldKey: string }>(
      `/machine/missing-fact-signals?firmId=${encodeURIComponent(firm())}`,
      { method: "POST", headers: firmHeader(), body: JSON.stringify(input) },
    );
  },

  async listPreparedWorkspaces() {
    const res = await wireFetch<{ workspaces: import("../machineTypes").PreparedWorkspaceRow[] }>(
      `/machine/prepared-workspaces?firmId=${encodeURIComponent(firm())}`,
      { headers: firmHeader() },
    );
    return res.workspaces;
  },

  async upsertPreparedWorkspace(input) {
    const id = input.id ?? `pw-${firm()}`;
    return wireFetch<import("../machineTypes").PreparedWorkspaceRow>(
      `/machine/prepared-workspaces/${encodeURIComponent(id)}?firmId=${encodeURIComponent(firm())}`,
      { method: "PUT", headers: firmHeader(), body: JSON.stringify({ ...input, id }) },
    );
  },

  async listActiveAttempts() {
    const res = await wireFetch<{ attempts: import("../machineTypes").ActiveAttemptRow[] }>(
      `/machine/active-attempts?firmId=${encodeURIComponent(firm())}`,
      { headers: firmHeader() },
    );
    return res.attempts;
  },

  async listEngagementRecords() {
    const res = await wireFetch<{ records: import("../machineTypes").EngagementRecordRow[] }>(
      `/machine/engagement-records?firmId=${encodeURIComponent(firm())}`,
      { headers: firmHeader() },
    );
    return res.records;
  },

  async listReferenceVersions() {
    const res = await wireFetch<{ versions: ReferenceVersionRow[] }>(
      `/machine/reference-versions?firmId=${encodeURIComponent(firm())}`,
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
      `/machine/campaign-state?firmId=${encodeURIComponent(firm())}`,
      { headers: firmHeader() },
    );
  },

  async setCampaignState(state) {
    return wireFetch<{ firmId: string; state: CampaignState }>(
      `/machine/campaign-state?firmId=${encodeURIComponent(firm())}`,
      { method: "POST", headers: firmHeader(), body: JSON.stringify({ state }) },
    );
  },

  async provisionFirm(input) {
    // Bootstrap — no session firm required to mint a tenancy.
    return wireFetch<ProvisionResult>(`/machine/provision`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async issueAccessInvite(input) {
    return wireFetch<{
      ok: boolean;
      accessPath: string;
      expiresAt: string;
      emailed: boolean;
    }>(`/machine/access-invite`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async listContactRecords(opts) {
    const scope = opts?.scope === "every_firm" ? "every_firm" : "session";
    const res = await wireFetch<{
      contacts: Array<{
        id: string;
        firmId: string;
        email: string | null;
        phone: string | null;
        name: string | null;
        notes?: string | null;
        tags?: string[];
        firmName?: string | null;
        createdAt?: string | null;
        reachability?: "reachable" | "partial" | "unreachable" | null;
        sequenceReady?: boolean | null;
      }>;
    }>(`/machine/contact-records?scope=${encodeURIComponent(scope)}&firmId=${encodeURIComponent(firm())}`, {
      headers: firmHeader(),
    });
    return res.contacts;
  },

  async listConsultants() {
    // Admin-global list — firm header optional (view-as may not be chosen yet).
    const headers: Record<string, string> = {};
    try {
      headers["x-firm-id"] = firm();
    } catch {
      /* session firm not set yet */
    }
    const res = await wireFetch<{
      consultants: Array<{
        userId: string;
        email: string;
        firmId: string;
        firmName: string;
      }>;
    }>(`/machine/consultants`, { headers });
    return res.consultants;
  },

  async bookMeeting(input) {
    return wireFetch<{
      id: string;
      firmId: string;
      contactId: string;
      slot: string | null;
      attemptsStopped: number;
      table: string;
    }>(`/machine/meetings`, {
      method: "POST",
      headers: firmHeader(),
      body: JSON.stringify(input),
    });
  },

  async listMeetings() {
    return wireFetch<{
      firmId: string;
      count: number;
      meetings: Array<{
        id: string;
        firmId: string;
        contactId: string;
        bookedAt: string;
        source: string;
        slot: string | null;
        consultantName: string | null;
      }>;
    }>(`/machine/meetings?firmId=${encodeURIComponent(firm())}`, {
      headers: firmHeader(),
    });
  },
};
