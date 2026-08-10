/**
 * In-browser stand-in for machine tables when VITE_WIRE_REAL=false.
 * Mirrors the Postgres transitions so UI can be exercised without the wire service.
 */
import type { MachineApiPort } from "../ports";
import type {
  AttemptCriteriaRow,
  CampaignState,
  ChannelOwnershipOrderRow,
  EligibilityPathwayRow,
  EligibilityPipelineRow,
  EligibilityResultRow,
  EnrollmentRow,
  EvaluationPin,
  FieldClassRoutingRow,
  ModularRuleRow,
  MotionDecisionRow,
  MotionPrecedenceRow,
  ProvisionResult,
  ReferenceVersionRow,
  SignalRow,
  WorkflowRow,
  WorkflowRunRow,
} from "../machineTypes";
import { standInHaltStore } from "./haltStore";

/** Mirrors supabase/seeds/002_machine_tables.sql seq_eligibility_pipeline. */
const ELIGIBILITY_PIPELINE: EligibilityPipelineRow[] = [
  { id: "ep-trig", firm_id: null, token: "trigger", label: "Trigger (scoped pull)", ord: 0 },
  { id: "ep-const", firm_id: null, token: "constants", label: "Constants", ord: 1 },
  { id: "ep-cond", firm_id: null, token: "conditions", label: "Conditions (If)", ord: 2 },
  { id: "ep-rules", firm_id: null, token: "rules", label: "Rules", ord: 3 },
  { id: "ep-out", firm_id: null, token: "output", label: "Structured output", ord: 4 },
];

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

const attemptCriteria = new Map<string, AttemptCriteriaRow>([
  [
    "acr-text",
    {
      id: "acr-text",
      firm_id: null,
      label: "Text delivered, not opened → escalate next channel",
      enabled: true,
      when_clause: "channel=text AND delivered",
      condition_clause: "not opened within threshold",
      set_value: "escalate_forward",
      threshold: 30,
      threshold_unit: "minutes",
      ord: 0,
      source: "OPERATOR-REVISIONS §5b",
      version: 1,
    },
  ],
  [
    "acr-email",
    {
      id: "acr-email",
      firm_id: null,
      label: "Email opened, link not clicked → next attempt",
      enabled: true,
      when_clause: "channel=email AND opened",
      condition_clause: "link not clicked within threshold",
      set_value: "next_attempt_or_forward",
      threshold: 24,
      threshold_unit: "hours",
      ord: 1,
      source: "OPERATOR-REVISIONS §5b",
      version: 1,
    },
  ],
  [
    "acr-form",
    {
      id: "acr-form",
      firm_id: null,
      label: "Form started, not submitted → back to first channel",
      enabled: true,
      when_clause: "channel=form AND started",
      condition_clause: "not submitted; re-entries do not reset clock",
      set_value: "return_to_sequence_head",
      threshold: 24,
      threshold_unit: "hours",
      ord: 2,
      source: "OPERATOR-REVISIONS §5b",
      version: 1,
    },
  ],
  [
    "acr-sms-nonreply",
    {
      id: "acr-sms-nonreply",
      firm_id: null,
      label: "SMS-primer non-reply → proceed to email; low tier-signal",
      enabled: true,
      when_clause: "channel=sms AND primer_sent AND non_reply",
      condition_clause: "Y-reply is priming not gate",
      set_value: "tier_signal_low_nonreply",
      threshold: null,
      threshold_unit: null,
      ord: 6,
      source: "guidelines/Reactivation.md",
      version: 1,
    },
  ],
]);

const channelOrder = new Map<string, ChannelOwnershipOrderRow>([
  ["ch-text", { id: "ch-text", firm_id: null, token: "text", label: "Text", ord: 0, version: 1 }],
  ["ch-email", { id: "ch-email", firm_id: null, token: "email", label: "Email", ord: 1, version: 1 }],
  ["ch-form", { id: "ch-form", firm_id: null, token: "form", label: "Form", ord: 2, version: 1 }],
]);

function seedRule(
  id: string,
  label: string,
  enabled: boolean,
  ord: number,
  setValue: string,
): ModularRuleRow {
  return {
    id,
    firm_id: null,
    label,
    enabled,
    when_clause: null,
    condition_clause: null,
    set_value: setValue,
    ord,
    source: "stand-in",
    version: 1,
  };
}

const eligibilityPathways = new Map<string, EligibilityPathwayRow>([
  ["epath-any", seedRule("epath-any", "Pass if any of CEC|FSW|FST|PNP-* asserts", true, 0, "any_pathway_pass")],
  ["epath-cec", seedRule("epath-cec", "CEC pathway assert", true, 1, "pathway_cec")],
  ["epath-fsw", seedRule("epath-fsw", "FSW pathway assert", true, 2, "pathway_fsw")],
  ["epath-pnp", seedRule("epath-pnp", "PNP-* pathway assert", false, 3, "pathway_pnp")],
]);

const motionPrecedence = new Map<string, MotionPrecedenceRow>([
  ["mp-1", seedRule("mp-1", "Reactivation first if anything reactivation-worthy", true, 0, "reactivation")],
  ["mp-2", seedRule("mp-2", "Nudge only when nothing reactivation-worthy", true, 1, "nudge")],
  ["mp-3", seedRule("mp-3", "Nudge consolidates every self-reportable need into one form", true, 2, "one_consolidated_form")],
]);

const fieldClassRouting = new Map<string, FieldClassRoutingRow>([
  ["fcr-identity", seedRule("fcr-identity", "Identity facts → contact_records", true, 0, "route_contact_records")],
  ["fcr-eligibility", seedRule("fcr-eligibility", "Eligibility facts → evaluation inputs", true, 1, "route_eligibility_inputs")],
  ["fcr-agenda", seedRule("fcr-agenda", "Agenda / secondary → live_brief", true, 2, "route_live_brief")],
]);

const referenceVersions = new Map<string, ReferenceVersionRow>([
  [
    "ref.crs.cutoff.v1",
    {
      id: "ref.crs.cutoff.v1",
      firm_id: null,
      key: "crs_cutoff",
      payload: { cutoff: 480, program: "CEC" },
      version: 1,
    },
  ],
]);

const evaluationPins = new Map<string, EvaluationPin>();
const campaignStates = new Map<string, CampaignState>([["firm-cedar", "running"]]);
const provisionedFirms = new Map<string, ProvisionResult>();

function now() {
  return new Date().toISOString();
}

function patchRuleRow<T extends ModularRuleRow>(
  map: Map<string, T>,
  id: string,
  patch: {
    enabled?: boolean;
    label?: string;
    ord?: number;
    whenClause?: string | null;
    conditionClause?: string | null;
    setValue?: string | null;
    threshold?: number | null;
  },
): T {
  const prev = map.get(id);
  if (!prev) throw new Error(`rule missing: ${id}`);
  const next = {
    ...prev,
    enabled: patch.enabled ?? prev.enabled,
    label: patch.label ?? prev.label,
    ord: patch.ord ?? prev.ord,
    when_clause: patch.whenClause !== undefined ? patch.whenClause : prev.when_clause,
    condition_clause:
      patch.conditionClause !== undefined ? patch.conditionClause : prev.condition_clause,
    set_value: patch.setValue !== undefined ? patch.setValue : prev.set_value,
    version: prev.version + 1,
    firm_id: prev.firm_id ?? FIRM,
  } as T & { threshold?: number | null };
  if (patch.threshold !== undefined && "threshold" in (prev as object)) {
    (next as { threshold: number | null }).threshold = patch.threshold;
  }
  map.set(id, next as T);
  return next as T;
}

const cohortScoring = new Map<string, ModularRuleRow>([
  ["cs-open-click", seedRule("cs-open-click", "open+click > open only > no open", true, 0, "tier_from_open_click")],
  ["cs-top-tier", seedRule("cs-top-tier", "Y-reply + view-click + nurture-open + booking = top tier", true, 1, "top_tier")],
]);

const metricsThresholds = new Map<string, ModularRuleRow & { threshold: number | null }>([
  [
    "mt-ann-open",
    {
      ...seedRule("mt-ann-open", "Announcement open <30% → deliverability/relationship flag", true, 0, "flag_deliverability_or_relationship"),
      threshold: 30,
    },
  ],
  [
    "mt-email-open",
    {
      ...seedRule("mt-email-open", "Email open <35% → cooled relationship flag", true, 1, "flag_cooled"),
      threshold: 35,
    },
  ],
]);

const reachabilityChecks = new Map<string, ModularRuleRow>([
  ["rc-email", seedRule("rc-email", "email valid", true, 0, "check_email")],
  ["rc-phone", seedRule("rc-phone", "phone valid", true, 1, "check_phone")],
  ["rc-channel", seedRule("rc-channel", "≥1 channel matching intended sequence", true, 2, "check_channel")],
  ["rc-consent", seedRule("rc-consent", "consent/silenced", true, 5, "check_consent")],
]);

const phaseOrder = new Map<string, ChannelOwnershipOrderRow>([
  ["ph-optin", { id: "ph-optin", firm_id: null, token: "optin", label: "Opt-in", ord: 0, version: 1 }],
  ["ph-nudge", { id: "ph-nudge", firm_id: null, token: "reengagement", label: "Re-engagement (nudges)", ord: 1, version: 1 }],
  ["ph-react", { id: "ph-react", firm_id: null, token: "reactivation", label: "Reactivation", ord: 2, version: 1 }],
]);

const factWritebacks: import("../machineTypes").FactWritebackRow[] = [];
const missingFactSignals: import("../machineTypes").MissingFactSignalRow[] = [];
const preparedWorkspaces = new Map<string, import("../machineTypes").PreparedWorkspaceRow>();
const activeAttempts: import("../machineTypes").ActiveAttemptRow[] = [
  {
    id: "aa-local-1",
    firm_id: FIRM,
    contact_id: "sarah",
    enrollment_id: null,
    owner_channel: "email",
    status: "open",
    state: { step: 2, waitingOn: "24h_open_window" },
    created_at: now(),
    updated_at: now(),
  },
];
const engagementRecordsLocal: import("../machineTypes").EngagementRecordRow[] = [
  {
    id: "eng-local-1",
    firm_id: FIRM,
    contact_id: "sarah",
    event_kind: "email_opened",
    payload: { step: 2 },
    created_at: now(),
  },
];

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
    if (
      (await standInHaltStore.isFirmBookHalted(FIRM)) ||
      (await standInHaltStore.isContactHalted(input.contactId))
    ) {
      throw new Error("halt active — new enrollments suppressed (H1)");
    }
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
    const verdicts = contacts.map((contact) => {
      const hasEmail = Boolean(contact.email);
      const hasPhone = Boolean(contact.phone);
      const verdict =
        hasEmail && hasPhone ? ("reachable" as const) : hasEmail || hasPhone ? ("partial" as const) : ("unreachable" as const);
      return {
        contactId: contact.id,
        verdict,
        ready: verdict === "reachable" || verdict === "partial",
        email: contact.email ?? null,
        phone: contact.phone ?? null,
        name: contact.name ?? null,
      };
    });
    return {
      id: `arun-local-${Date.now()}`,
      firm_id: FIRM,
      status: "complete" as const,
      import_ids: input.importIds ?? [],
      summary: { contacts: contacts.length, ready: verdicts.filter((v) => v.ready).length },
      started_at: now(),
      finished_at: now(),
      contacts: contacts.length,
      verdicts,
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

  async listAttemptCriteria() {
    return [...attemptCriteria.values()].sort((a, b) => a.ord - b.ord);
  },

  async upsertAttemptCriteria(id, patch) {
    const prev = attemptCriteria.get(id);
    if (!prev) throw new Error(`attempt criteria missing: ${id}`);
    const next: AttemptCriteriaRow = {
      ...prev,
      label: patch.label ?? prev.label,
      enabled: patch.enabled ?? prev.enabled,
      threshold: patch.threshold !== undefined ? patch.threshold : prev.threshold,
      threshold_unit:
        patch.thresholdUnit !== undefined ? patch.thresholdUnit : prev.threshold_unit,
      when_clause: patch.whenClause !== undefined ? patch.whenClause : prev.when_clause,
      condition_clause:
        patch.conditionClause !== undefined ? patch.conditionClause : prev.condition_clause,
      set_value: patch.setValue !== undefined ? patch.setValue : prev.set_value,
      ord: patch.ord ?? prev.ord,
      version: prev.version + 1,
      firm_id: prev.firm_id ?? FIRM,
    };
    attemptCriteria.set(id, next);
    return next;
  },

  async listChannelOrder() {
    return [...channelOrder.values()].sort((a, b) => a.ord - b.ord);
  },

  async upsertChannelOrder(order) {
    for (const item of order) {
      const prev = channelOrder.get(item.id);
      if (!prev) continue;
      channelOrder.set(item.id, {
        ...prev,
        token: item.token ?? prev.token,
        label: item.label ?? prev.label,
        ord: item.ord,
        version: prev.version + 1,
        firm_id: prev.firm_id ?? FIRM,
      });
    }
    return [...channelOrder.values()].sort((a, b) => a.ord - b.ord);
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

  async listEligibilityPipeline() {
    return [...ELIGIBILITY_PIPELINE].sort((a, b) => a.ord - b.ord);
  },

  async listEligibilityPathways() {
    return [...eligibilityPathways.values()].sort((a, b) => a.ord - b.ord);
  },

  async upsertEligibilityPathway(id, patch) {
    return patchRuleRow(eligibilityPathways, id, patch);
  },

  async listMotionPrecedence() {
    return [...motionPrecedence.values()].sort((a, b) => a.ord - b.ord);
  },

  async upsertMotionPrecedence(id, patch) {
    return patchRuleRow(motionPrecedence, id, patch);
  },

  async listFieldClassRouting() {
    return [...fieldClassRouting.values()].sort((a, b) => a.ord - b.ord);
  },

  async upsertFieldClassRouting(id, patch) {
    return patchRuleRow(fieldClassRouting, id, patch);
  },

  async listCohortScoring() {
    return [...cohortScoring.values()].sort((a, b) => a.ord - b.ord);
  },

  async upsertCohortScoring(id, patch) {
    return patchRuleRow(cohortScoring, id, patch);
  },

  async listMetricsThresholds() {
    return [...metricsThresholds.values()].sort((a, b) => a.ord - b.ord);
  },

  async upsertMetricsThreshold(id, patch) {
    return patchRuleRow(metricsThresholds, id, patch) as import("../machineTypes").MetricsThresholdRow;
  },

  async listReachabilityChecks() {
    return [...reachabilityChecks.values()].sort((a, b) => a.ord - b.ord);
  },

  async upsertReachabilityCheck(id, patch) {
    return patchRuleRow(reachabilityChecks, id, patch);
  },

  async listPhaseOrder() {
    return [...phaseOrder.values()].sort((a, b) => a.ord - b.ord);
  },

  async upsertPhaseOrder(order) {
    for (const item of order) {
      const prev = phaseOrder.get(item.id);
      if (!prev) continue;
      phaseOrder.set(item.id, {
        ...prev,
        token: item.token ?? prev.token,
        label: item.label ?? prev.label,
        ord: item.ord,
        version: prev.version + 1,
        firm_id: prev.firm_id ?? FIRM,
      });
    }
    return [...phaseOrder.values()].sort((a, b) => a.ord - b.ord);
  },

  async writeFact(input) {
    const writebackId = `fwb-local-${Date.now()}`;
    factWritebacks.unshift({
      id: writebackId,
      firm_id: FIRM,
      contact_id: input.contactId,
      field_key: input.fieldKey,
      value: input.value,
      created_at: now(),
    });
    for (let i = missingFactSignals.length - 1; i >= 0; i--) {
      if (
        missingFactSignals[i].contact_id === input.contactId &&
        missingFactSignals[i].field_key === input.fieldKey
      ) {
        missingFactSignals.splice(i, 1);
      }
    }
    const missingSignalIds: string[] = [];
    for (const key of input.missingFieldKeys ?? []) {
      const id = `mfs-local-${Date.now()}-${key}`;
      missingFactSignals.push({
        id,
        firm_id: FIRM,
        contact_id: input.contactId,
        field_key: key,
        created_at: now(),
      });
      missingSignalIds.push(id);
    }
    const resultId = `eres-fwb-${Date.now()}`;
    const signalId = `sig-fwb-${Date.now()}`;
    const motionId = `mot-fwb-${Date.now()}`;
    eligibilityResults.push({
      id: resultId,
      evaluation_id: null,
      firm_id: FIRM,
      contact_id: input.contactId,
      result: { trigger: "fact_writeback", writebackId, fieldKey: input.fieldKey },
      any_pathway_pass: true,
      created_at: now(),
    });
    signals.push({
      id: signalId,
      firm_id: FIRM,
      contact_id: input.contactId,
      kind: "eligibility_determination",
      payload: { resultId, anyPass: true, writebackId },
      created_at: now(),
    });
    motionDecisions.push({
      id: motionId,
      firm_id: FIRM,
      contact_id: input.contactId,
      motion: "reactivation",
      reason: { signalId, precedence: "mp-1", writebackId },
      created_at: now(),
    });
    return {
      writebackId,
      contactId: input.contactId,
      fieldKey: input.fieldKey,
      missingSignalIds,
      cascade: [
        { table: "fact_writebacks", id: writebackId },
        { contactId: input.contactId, resultId, signalId, motionId, motion: "reactivation" },
      ],
      workflowsFired: [],
      note: "fact_writeback → re-eval (stand-in)",
    };
  },

  async listFactWritebacks(contactId) {
    return contactId
      ? factWritebacks.filter((w) => w.contact_id === contactId)
      : [...factWritebacks];
  },

  async listMissingFactSignals(contactId) {
    return contactId
      ? missingFactSignals.filter((s) => s.contact_id === contactId)
      : [...missingFactSignals];
  },

  async signalMissingFact(input) {
    const id = `mfs-local-${Date.now()}`;
    missingFactSignals.push({
      id,
      firm_id: FIRM,
      contact_id: input.contactId,
      field_key: input.fieldKey,
      created_at: now(),
    });
    return { id, contactId: input.contactId, fieldKey: input.fieldKey };
  },

  async listPreparedWorkspaces() {
    return [...preparedWorkspaces.values()];
  },

  async upsertPreparedWorkspace(input) {
    const id = input.id ?? `pw-${FIRM}`;
    const row: import("../machineTypes").PreparedWorkspaceRow = {
      id,
      firm_id: FIRM,
      status: input.status ?? "staged",
      body: input.body ?? {},
      created_at: preparedWorkspaces.get(id)?.created_at ?? now(),
    };
    preparedWorkspaces.set(id, row);
    return row;
  },

  async listActiveAttempts() {
    return [...activeAttempts];
  },

  async listEngagementRecords() {
    return [...engagementRecordsLocal];
  },

  async listReferenceVersions() {
    return [...referenceVersions.values()];
  },

  async getEvaluationPin(packId) {
    const pin = evaluationPins.get(packId);
    if (!pin) {
      return { packId, referenceVersionId: null, rulesetId: null, missing: true };
    }
    return { ...pin, missing: false };
  },

  async putEvaluationPin(packId, pin) {
    const next: EvaluationPin = { packId, ...pin };
    evaluationPins.set(packId, next);
    return next;
  },

  async getCampaignState() {
    const state = campaignStates.get(FIRM) ?? "armed-for-activation";
    return { firmId: FIRM, state, missing: !campaignStates.has(FIRM) };
  },

  async setCampaignState(state) {
    campaignStates.set(FIRM, state);
    return { firmId: FIRM, state };
  },

  async provisionFirm(input) {
    const slug = input.firmName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    const firmId = input.firmId?.trim() || `firm-${slug || Date.now()}`;
    const email = input.email.trim().toLowerCase();
    const result: ProvisionResult = {
      firmId,
      firmName: input.firmName.trim(),
      email,
      ctFirm: true,
      authUser: true,
      campaignState: "armed-for-activation",
      loginPath: `/login?tenancy=assisted&email=${encodeURIComponent(email)}`,
    };
    provisionedFirms.set(firmId, result);
    campaignStates.set(firmId, "armed-for-activation");
    return result;
  },
};
