/**
 * In-browser stand-in for machine tables when VITE_WIRE_REAL=false.
 * Mirrors the Postgres transitions so UI can be exercised without the wire service.
 */
import type { MachineApiPort } from "../ports";
import { getActiveFirmId } from "../sessionFirm";
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
  SeqChannelRulesRow,
  SignalRow,
  WorkflowRow,
  WorkflowRunRow,
} from "../machineTypes";
import { standInHaltStore } from "./haltStore";

/** Mirrors supabase/seeds/002_machine_tables.sql seq_eligibility_pipeline. */
const eligibilityPipeline = new Map<string, EligibilityPipelineRow>(
  [
    { id: "ep-trig", firm_id: null, token: "trigger", label: "Trigger (scoped pull)", ord: 0 },
    { id: "ep-const", firm_id: null, token: "constants", label: "Constants", ord: 1 },
    { id: "ep-cond", firm_id: null, token: "conditions", label: "Conditions (If)", ord: 2 },
    { id: "ep-rules", firm_id: null, token: "rules", label: "Rules", ord: 3 },
    { id: "ep-out", firm_id: null, token: "output", label: "Structured output", ord: 4 },
  ].map((row) => [row.id, row]),
);


const workflows = new Map<string, WorkflowRow & { status: "draft" | "active" | "paused" }>();
const runs = new Map<string, WorkflowRunRow>();
const enrollments: EnrollmentRow[] = [
  {
    id: "enr-cedar-1",
    firm_id: "firm-cedar",
    contact_id: "cr-cedar-1",
    agent_ref: "tpl.optin_launch.v1",
    sequence_id: "tpl.optin_launch.v1",
    campaign_id: "camp.optin.window",
    workflow_run_id: null,
    payload: { source: "seed" },
    enrolled_at: "2026-08-10T00:00:00.000Z",
  },
  {
    id: "enr-cedar-2",
    firm_id: "firm-cedar",
    contact_id: "cr-cedar-2",
    agent_ref: "tpl.optin_launch.v1",
    sequence_id: "tpl.optin_launch.v1",
    campaign_id: "camp.optin.window",
    workflow_run_id: null,
    payload: { source: "seed" },
    enrolled_at: "2026-08-10T00:00:00.000Z",
  },
];
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
  [
    "acr-text-not-opened",
    {
      id: "acr-text-not-opened",
      firm_id: null,
      label: "not opened",
      enabled: true,
      when_clause: "channel=text",
      condition_clause: "not opened",
      set_value: "escalate_forward",
      threshold: null,
      threshold_unit: null,
      ord: 10,
      source: "C6",
      version: 1,
      channel_token: "text",
    },
  ],
  [
    "acr-text-not-delivered",
    {
      id: "acr-text-not-delivered",
      firm_id: null,
      label: "not delivered",
      enabled: true,
      when_clause: "channel=text",
      condition_clause: "not delivered",
      set_value: "escalate_forward",
      threshold: null,
      threshold_unit: null,
      ord: 11,
      source: "C6",
      version: 1,
      channel_token: "text",
    },
  ],
  [
    "acr-email-not-opened",
    {
      id: "acr-email-not-opened",
      firm_id: null,
      label: "not opened",
      enabled: true,
      when_clause: "channel=email",
      condition_clause: "not opened",
      set_value: "escalate_forward",
      threshold: null,
      threshold_unit: null,
      ord: 12,
      source: "C6",
      version: 1,
      channel_token: "email",
    },
  ],
  [
    "acr-email-link",
    {
      id: "acr-email-link",
      firm_id: null,
      label: "link not clicked",
      enabled: true,
      when_clause: "channel=email",
      condition_clause: "link not clicked",
      set_value: "escalate_forward",
      threshold: null,
      threshold_unit: null,
      ord: 13,
      source: "C6",
      version: 1,
      channel_token: "email",
    },
  ],
  [
    "acr-call-not-answered",
    {
      id: "acr-call-not-answered",
      firm_id: null,
      label: "not answered",
      enabled: true,
      when_clause: "channel=call",
      condition_clause: "not answered",
      set_value: "escalate_forward",
      threshold: null,
      threshold_unit: null,
      ord: 14,
      source: "C6",
      version: 1,
      channel_token: "call",
    },
  ],
  [
    "acr-call-not-completed",
    {
      id: "acr-call-not-completed",
      firm_id: null,
      label: "not completed",
      enabled: true,
      when_clause: "channel=call",
      condition_clause: "not completed",
      set_value: "escalate_forward",
      threshold: null,
      threshold_unit: null,
      ord: 15,
      source: "C6",
      version: 1,
      channel_token: "call",
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
const campaignStates = new Map<string, CampaignState>();
const provisionedFirms = new Map<string, ProvisionResult>();
const standInHousing = new Map<string, import("../machineTypes").CampaignHousingRow[]>();
const standInRulePacks = new Map<string, unknown>();
const standInAttemptCycle = new Map<string, import("../machineTypes").AttemptCycleRow>([
  [
    "sac-global",
    {
      id: "sac-global",
      firm_id: null,
      sequence_id: null,
      attempt_count: 3,
      wait_after_last_failed_seconds: 86400,
      nth_exception: {},
    },
  ],
]);

/** Book audit stand-in tables — createAuditRun persists so trials can read back. */
const bookAuditRuns = new Map<
  string,
  {
    id: string;
    firm_id: string;
    status: "running" | "complete" | "failed";
    import_ids: unknown[];
    summary: Record<string, unknown>;
    started_at: string;
    finished_at: string | null;
  }
>();
const seqChannelRules = new Map<string, SeqChannelRulesRow>([
  ["scr-global-text", { id: "scr-global-text", firm_id: null, sequence_id: null, token: "text", within_seconds: 1800 }],
  ["scr-global-email", { id: "scr-global-email", firm_id: null, sequence_id: null, token: "email", within_seconds: 86400 }],
  ["scr-global-call", { id: "scr-global-call", firm_id: null, sequence_id: null, token: "call", within_seconds: 1800 }],
]);

const bookContacts = new Map<
  string,
  {
    id: string;
    firmId: string;
    email: string | null;
    phone: string | null;
    name: string | null;
    notes?: string | null;
    tags?: string[];
    firmName?: string | null;
    createdAt?: string;
  }
>([
  [
    "cr-cedar-1",
    {
      id: "cr-cedar-1",
      firmId: "firm-cedar",
      email: "ana.ruiz@example.com",
      phone: null,
      name: "Ana Ruiz",
      firmName: "Cedar Immigration",
      createdAt: "2026-08-10T00:00:00.000Z",
    },
  ],
  [
    "cr-cedar-2",
    {
      id: "cr-cedar-2",
      firmId: "firm-cedar",
      email: "jon.hale@example.com",
      phone: null,
      name: "Jon Hale",
      firmName: "Cedar Immigration",
      createdAt: "2026-08-10T00:00:00.000Z",
    },
  ],
  [
    "cr-cedar-3",
    {
      id: "cr-cedar-3",
      firmId: "firm-cedar",
      email: "priya.shah@example.com",
      phone: null,
      name: "Priya Shah",
      firmName: "Cedar Immigration",
      createdAt: "2026-08-11T00:00:00.000Z",
    },
  ],
  [
    "cr-harbor-1",
    {
      id: "cr-harbor-1",
      firmId: "firm-standin-harbor",
      email: "daniel.okonkwo@example.com",
      phone: null,
      name: "Daniel Okonkwo",
      firmName: "Harbor RCIC",
      createdAt: "2026-08-10T00:00:00.000Z",
    },
  ],
  [
    "cr-harbor-2",
    {
      id: "cr-harbor-2",
      firmId: "firm-standin-harbor",
      email: "amina.cole@example.com",
      phone: null,
      name: "Amina Cole",
      firmName: "Harbor RCIC",
      createdAt: "2026-08-10T00:00:00.000Z",
    },
  ],
  [
    "cr-harbor-3",
    {
      id: "cr-harbor-3",
      firmId: "firm-standin-harbor",
      email: "wei.chen@example.com",
      phone: null,
      name: "Wei Chen",
      firmName: "Harbor RCIC",
      createdAt: "2026-08-11T00:00:00.000Z",
    },
  ],
  [
    "cr-harbor-4",
    {
      id: "cr-harbor-4",
      firmId: "firm-standin-harbor",
      email: "samira.haddad@example.com",
      phone: null,
      name: "Samira Haddad",
      firmName: "Harbor RCIC",
      createdAt: "2026-08-12T00:00:00.000Z",
    },
  ],
]);
const bookVerdicts = new Map<string, string>();
const bookSequenceReady = new Map<string, boolean>();

/** Trial read-back for Book audit tables (stand-in only). */
export function getStandInBookSnapshot() {
  return {
    audit_runs: [...bookAuditRuns.values()],
    contact_records: [...bookContacts.values()],
    reachability_verdicts: [...bookVerdicts.entries()].map(([contactId, verdict]) => ({
      contactId,
      verdict,
    })),
    sequence_ready: [...bookSequenceReady.entries()].map(([contactId, ready]) => ({
      contactId,
      ready,
    })),
  };
}

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
    firm_id: prev.firm_id ?? standInFirm(),
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
    firm_id: standInFirm(),
    contact_id: "sarah",
    enrollment_id: null,
    owner_channel: "email",
    status: "open",
    state: { step: 2, waitingOn: "24h_open_window" },
    created_at: now(),
    updated_at: now(),
  },
];
const standInMeetings: Array<{
  id: string;
  firmId: string;
  contactId: string;
  bookedAt: string;
  source: string;
  slot: string | null;
  consultantName: string | null;
}> = [];

const engagementRecordsLocal: import("../machineTypes").EngagementRecordRow[] = [
  {
    id: "eng-cedar-1",
    firm_id: "firm-cedar",
    contact_id: "cr-cedar-1",
    event_kind: "sent",
    payload: { channel: "email" },
    created_at: "2026-08-10T00:00:00.000Z",
  },
  {
    id: "eng-cedar-2",
    firm_id: "firm-cedar",
    contact_id: "cr-cedar-1",
    event_kind: "opened",
    payload: { channel: "email" },
    created_at: "2026-08-10T00:05:00.000Z",
  },
  {
    id: "eng-cedar-3",
    firm_id: "firm-cedar",
    contact_id: "cr-cedar-2",
    event_kind: "sent",
    payload: { channel: "text" },
    created_at: "2026-08-10T00:10:00.000Z",
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
        firm_id: standInFirm(),
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

const HOUSE_CONTACT_IMPORT_GRAPH = {
  nodes: [
    {
      id: "trigger-1",
      type: "trigger",
      position: { x: 120, y: 0 },
      data: {
        label: "Contact import",
        configured: true,
        triggerKind: "event",
        triggerEvent: "contact_import",
        grain: "global",
      },
    },
    {
      id: "action-audit",
      type: "action",
      position: { x: 120, y: 148 },
      data: {
        label: "Audit the contacts",
        configured: true,
        actionType: "run_audit",
        pickTable: "import_batch",
      },
    },
    {
      id: "if-failed",
      type: "branch",
      position: { x: 120, y: 296 },
      data: {
        label: "If this contact failed",
        configured: true,
        branchKind: "if",
        pickTable: "sequence_ready",
        pickField: "ready",
        pickOp: "eq",
        pickValue: "false",
      },
    },
    {
      id: "action-invalid",
      type: "action",
      position: { x: 0, y: 444 },
      data: {
        label: "Tag invalid",
        configured: true,
        actionType: "ascribe_tag",
        tag: "invalid",
        notesFromVerdict: true,
      },
    },
    {
      id: "action-valid",
      type: "action",
      position: { x: 240, y: 444 },
      data: { label: "Tag valid", configured: true, actionType: "ascribe_tag", tag: "valid" },
    },
  ],
  edges: [
    { id: "e-t-a", source: "trigger-1", target: "action-audit" },
    { id: "e-a-if", source: "action-audit", target: "if-failed" },
    { id: "e-if-inv", source: "if-failed", target: "action-invalid", sourceHandle: "true" },
    { id: "e-if-val", source: "if-failed", target: "action-valid", sourceHandle: "false" },
  ],
};

workflows.set("wf-house-contact-import", {
  id: "wf-house-contact-import",
  firm_id: null,
  name: "Contact file → audit → tag",
  target: "contact",
  graph: HOUSE_CONTACT_IMPORT_GRAPH,
  created_at: "2026-08-17T00:00:00.000Z",
  updated_at: "2026-08-17T00:00:00.000Z",
  status: "draft",
  audience_scope: "every_firm",
  audience_contact_ids: [],
});


function standInFirm(): string {
  try {
    return getActiveFirmId();
  } catch {
    // Seed/demo only — never a real-session default.
    return "firm-cedar";
  }
}

runs.set("run-cedar-1", {
  id: "run-cedar-1",
  workflow_id: "wf-optin-launch",
  firm_id: "firm-cedar",
  status: "success",
  trigger_label: "event:audit.completed",
  node_status: {},
  counts: {},
  started_at: "2026-08-10T00:00:00.000Z",
  finished_at: "2026-08-10T00:00:01.000Z",
});

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
    const prev = workflows.get(id);
    const row = {
      id,
      firm_id: prev?.firm_id ?? standInFirm(),
      name: input.name,
      target: (input.target ?? "contact") as WorkflowRow["target"],
      graph: (input.graph as WorkflowRow["graph"]) ?? { nodes: [], edges: [] },
      created_at: prev?.created_at ?? now(),
      updated_at: now(),
      status: prev?.status ?? ("draft" as const),
      audience_scope: input.audienceScope === "select_from" ? "select_from" : (prev?.audience_scope ?? "every_firm"),
      audience_contact_ids: input.audienceContactIds ?? prev?.audience_contact_ids ?? [],
    };
    workflows.set(id, row);
    return { id, status: row.status, name: row.name, target: row.target };
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
      firm_id: standInFirm(),
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
      (await standInHaltStore.isFirmBookHalted(standInFirm())) ||
      (await standInHaltStore.isContactHalted(input.contactId))
    ) {
      throw new Error("halt active — new enrollments suppressed (H1)");
    }
    const id = `enr-local-${Date.now()}`;
    const row: EnrollmentRow = {
      id,
      firm_id: standInFirm(),
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
    const payload =
      input.payload && typeof input.payload === "object"
        ? (input.payload as Record<string, unknown>)
        : {};
    referenceVersions.set(referenceId, {
      id: referenceId,
      firm_id: null,
      key: input.key,
      payload,
      version: input.version ?? 1,
    });
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
        firm_id: standInFirm(),
        contact_id: contactId,
        result: { trigger: "reference_version", refId: referenceId },
        any_pathway_pass: true,
        created_at: now(),
      });
      signals.push({
        id: signalId,
        firm_id: standInFirm(),
        contact_id: contactId,
        kind: "eligibility_determination",
        payload: { resultId, anyPass: true },
        created_at: now(),
      });
      motionDecisions.push({
        id: motionId,
        firm_id: standInFirm(),
        contact_id: contactId,
        motion: "reactivation",
        reason: { signalId, precedence: "mp-1" },
        created_at: now(),
      });
      enrollments.push({
        id: enrId,
        firm_id: standInFirm(),
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
    const id = `arun-local-${Date.now()}`;
    const started = now();
    bookAuditRuns.set(id, {
      id,
      firm_id: standInFirm(),
      status: "complete",
      import_ids: input.importIds ?? [],
      summary: { contacts: contacts.length, ready: verdicts.filter((v) => v.ready).length },
      started_at: started,
      finished_at: started,
    });
    for (const contact of contacts) {
      bookContacts.set(contact.id, {
        id: contact.id,
        firmId: standInFirm(),
        email: contact.email ?? null,
        phone: contact.phone ?? null,
        name: contact.name ?? null,
        notes: bookContacts.get(contact.id)?.notes ?? null,
        tags: bookContacts.get(contact.id)?.tags ?? [],
      });
    }
    for (const v of verdicts) {
      bookVerdicts.set(v.contactId, v.verdict);
      bookSequenceReady.set(v.contactId, v.ready);
    }
    return {
      id,
      firm_id: standInFirm(),
      status: "complete" as const,
      import_ids: input.importIds ?? [],
      summary: { contacts: contacts.length, ready: verdicts.filter((v) => v.ready).length },
      started_at: started,
      finished_at: started,
      contacts: contacts.length,
      verdicts,
    };
  },

  async listAuditRuns() {
    return [...bookAuditRuns.values()]
      .filter((row) => row.firm_id === standInFirm())
      .sort((a, b) => b.started_at.localeCompare(a.started_at));
  },

  async getAuditRun(id) {
    const run = bookAuditRuns.get(id);
    if (!run) throw new Error("audit run missing");
    const importIds = Array.isArray(run.import_ids) ? run.import_ids.map(String) : [];
    const verdicts = [...bookContacts.values()]
      .filter((c) => c.firmId === standInFirm())
      .filter((c) => importIds.length === 0 || true)
      .map((c) => {
        const verdict = bookVerdicts.get(c.id) ?? "unreachable";
        return {
          contactId: c.id,
          verdict,
          ready: bookSequenceReady.get(c.id) ?? verdict !== "unreachable",
          email: c.email,
          phone: c.phone,
          name: c.name,
        };
      })
      .filter((v) => bookVerdicts.has(v.contactId));
    return { run, verdicts };
  },

  async importContactBook(input) {
    const contacts = input.contacts ?? [];
    const batchId = `imp-local-${Date.now()}`;
    const writes: Array<{ table: string; id: string; contact_id?: string | null }> = [
      { table: "import_batch", id: batchId },
    ];
    for (const contact of contacts) {
      const id = contact.id ?? `cr-local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const prev = bookContacts.get(id);
      bookContacts.set(id, {
        id,
        firmId: standInFirm(),
        email: contact.email ?? prev?.email ?? null,
        phone: contact.phone ?? prev?.phone ?? null,
        name: contact.name ?? prev?.name ?? null,
        notes: prev?.notes ?? null,
        tags: prev?.tags ?? [],
        createdAt: prev?.createdAt ?? now(),
      });
      writes.push({ table: "contact_records", id, contact_id: id });
    }

    const workflowsFired: unknown[] = [];
    for (const w of workflows.values()) {
      if (w.status !== "active") continue;
      const nodes = (w.graph?.nodes ?? []) as Array<{
        id: string;
        type?: string;
        data?: Record<string, unknown>;
        sourceHandle?: string;
      }>;
      const trigger = nodes.find((n) => n.type === "trigger");
      const event = String(trigger?.data?.triggerEvent ?? "");
      if (event !== "contact_import") continue;
      const audit = await standInMachineApi.createAuditRun({
        importIds: [batchId],
        contactIds: contacts.map((c, i) => ({
          id: c.id ?? writes[i + 1]?.id ?? `cr-${i}`,
          email: c.email,
          phone: c.phone,
          name: c.name,
        })),
      });
      const ifNode = nodes.find((n) => n.type === "branch");
      const pickValue = String(ifNode?.data?.pickValue ?? "false");
      const pickOp = String(ifNode?.data?.pickOp ?? "eq");
      const failedIsThen = pickOp === "eq" && (pickValue === "false" || pickValue === "0");
      for (const v of audit.verdicts ?? []) {
        const failed = !v.ready;
        const thenSide = failedIsThen ? failed : !failed;
        const tagNode = thenSide
          ? nodes.find((n) => n.data?.actionType === "ascribe_tag" && n.data?.tag === "invalid") ??
            nodes.find((n) => n.id === "action-invalid")
          : nodes.find((n) => n.data?.actionType === "ascribe_tag" && n.data?.tag === "valid") ??
            nodes.find((n) => n.id === "action-valid");
        const tag = String(tagNode?.data?.tag ?? (thenSide ? "invalid" : "valid"));
        const person = bookContacts.get(v.contactId);
        if (!person) continue;
        const tags = [...(person.tags ?? []).filter((t) => t !== tag), tag];
        let notes = person.notes ?? null;
        if (tagNode?.data?.notesFromVerdict === true) {
          notes = v.verdict === "unreachable" ? "missing email and phone" : v.verdict;
        }
        bookContacts.set(v.contactId, { ...person, tags, notes });
      }
      workflowsFired.push({ workflowId: w.id, auditRunId: audit.id });
    }

    return {
      import_batch_id: batchId,
      imported: contacts.length,
      writes,
      workflowsFired,
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
    const id = `bind.${standInFirm()}.${input.sequenceClass}`;
    bindings.set(id, {
      id,
      firm_id: standInFirm(),
      sequence_class: input.sequenceClass,
      template_id: input.templateId,
      overrides: [],
      variable_bindings: input.variableBindings ?? {},
      is_default: input.isDefault ?? true,
      override_attempt: Boolean(input.overrideAttempt),
      override_channel: Boolean(input.overrideChannel),
      override_content: Boolean(input.overrideContent),
      override_sequencing: Boolean(input.overrideSequencing),
    });
    return { id, sequenceClass: input.sequenceClass, templateId: input.templateId };
  },

  async listSequenceHousing(sequenceId) {
    const rows = standInHousing.get(sequenceId) ?? [];
    return { sequenceId, campaigns: rows };
  },

  async saveSequenceHousing(sequenceId, campaigns) {
    const rows = campaigns.map((draft, index) => ({
      id: draft.id ?? `camp-local-${sequenceId}-${index}`,
      firm_id: standInFirm(),
      sequence_id: sequenceId,
      name: draft.name,
      ord: draft.ord,
      override_this: Boolean(draft.overrideThis),
      attempt_count: draft.attemptCount ?? null,
      wait_after_last_failed_seconds: draft.waitAfterLastFailedSeconds ?? null,
      nth_exception: draft.nthException ?? {},
      objective: draft.objective
        ? {
            id: draft.objective.id ?? `obj-local-${index}`,
            kind: draft.objective.kind,
            name: draft.objective.name,
            completion_table: draft.objective.completionTable,
            source: draft.objective.source ?? "scratch",
          }
        : null,
      channels: (draft.channels ?? []).map((ch, i) => {
        const variations = (ch.variations?.length
          ? ch.variations
          : [{ ord: 0, applyMode: "every" as const, attemptN: null, content: ch.content ?? {} }]
        ).map((v, vi) => ({
          id: v.id ?? `var-local-${index}-${ch.token}-${vi}`,
          ord: v.ord ?? vi,
          apply_mode: (v.applyMode ?? "every") as "every" | "only_this" | "every_except",
          attempt_n: v.applyMode === "every" || !v.applyMode ? null : (v.attemptN ?? 1),
          content: v.content ?? {},
        }));
        return {
          id: ch.id ?? `ch-local-${index}-${ch.token}`,
          token: ch.token,
          ord: ch.ord ?? i,
          override_content: Boolean(ch.overrideContent),
          content: variations[0]?.content ?? ch.content ?? {},
          variations,
          rules_override: Boolean(ch.rulesOverride),
          within_seconds: ch.withinSeconds ?? null,
          rules: ch.rulesOverride
            ? (ch.rules ?? [])
                .filter((r) => r.key !== "within_time")
                .map((r, ri) => ({
                id: r.id ?? `acr-local-${index}-${ch.token}-${r.key ?? ri}`,
                label: r.label ?? `${ch.token} · ${r.key ?? ri}`,
                enabled: Boolean(r.enabled),
                when_clause: `channel=${ch.token}`,
                condition_clause: r.condition ?? null,
                threshold: null,
                threshold_unit: null,
                ord: r.ord ?? ri,
              }))
            : [],
        };
      }),
    }));
    standInHousing.set(sequenceId, rows);
    return { sequenceId, campaigns: rows };
  },

  async getAttemptCycle(sequenceId) {
    if (sequenceId) {
      const hit = standInAttemptCycle.get(`sac-seq-${sequenceId}`);
      if (hit) return { cycle: hit };
    }
    return {
      cycle: standInAttemptCycle.get("sac-global") ?? {
        id: "sac-global",
        firm_id: null,
        sequence_id: null,
        attempt_count: 3,
        wait_after_last_failed_seconds: 86400,
        nth_exception: {},
      },
    };
  },

  async saveAttemptCycle(input) {
    const sequenceId = input.sequenceId || null;
    const id = sequenceId ? `sac-seq-${sequenceId}` : "sac-global";
    const prev = standInAttemptCycle.get(id);
    const cycle = {
      id,
      firm_id: sequenceId ? standInFirm() : null,
      sequence_id: sequenceId,
      attempt_count: input.attemptCount ?? prev?.attempt_count ?? 3,
      wait_after_last_failed_seconds:
        input.waitAfterLastFailedSeconds ?? prev?.wait_after_last_failed_seconds ?? 86400,
      nth_exception: input.nthException ?? prev?.nth_exception ?? {},
    };
    standInAttemptCycle.set(id, cycle);
    return { cycle };
  },

  async enrollSequenceContacts(sequenceId, input) {
    const scope = input.scope === "select_from" ? "select_from" : "every_firm";
    const contacts =
      scope === "select_from"
        ? input.contactIds ?? []
        : [...bookContacts.values()].map((c) => c.id);
    for (const contactId of contacts) {
      const person = bookContacts.get(contactId);
      enrollments.push({
        id: `enr-local-${Date.now()}-${contactId}`,
        firm_id: person?.firmId ?? standInFirm(),
        contact_id: contactId,
        agent_ref: input.agentRef ?? sequenceId,
        sequence_id: sequenceId,
        campaign_id: null,
        workflow_run_id: null,
        payload: { source: "c8_add_contact", scope },
        enrolled_at: now(),
      });
    }
    return {
      sequenceId,
      scope,
      enrolled: contacts.length,
      blocked: 0,
      ids: contacts,
    };
  },

  async upsertRulePack(input) {
    const id = input.id ?? `rpack-local-${Date.now()}`;
    standInRulePacks.set(id, input);
    return { id, table: "rule_pack" };
  },

  async listAttemptCriteria() {
    return [...attemptCriteria.values()].sort((a, b) => a.ord - b.ord);
  },

  async upsertAttemptCriteria(id, patch) {
    const prev = attemptCriteria.get(id);
    const next: AttemptCriteriaRow = {
      id,
      firm_id: prev?.firm_id ?? standInFirm(),
      label: patch.label ?? prev?.label ?? id,
      enabled: patch.enabled ?? prev?.enabled ?? true,
      threshold: patch.threshold !== undefined ? patch.threshold : (prev?.threshold ?? null),
      threshold_unit:
        patch.thresholdUnit !== undefined ? patch.thresholdUnit : (prev?.threshold_unit ?? null),
      when_clause: patch.whenClause !== undefined ? patch.whenClause : (prev?.when_clause ?? null),
      condition_clause:
        patch.conditionClause !== undefined ? patch.conditionClause : (prev?.condition_clause ?? null),
      set_value: patch.setValue !== undefined ? patch.setValue : (prev?.set_value ?? "escalate_forward"),
      ord: patch.ord ?? prev?.ord ?? 0,
      source: prev?.source ?? "c6",
      version: (prev?.version ?? 0) + 1,
      sequence_id: patch.sequenceId !== undefined ? patch.sequenceId : (prev?.sequence_id ?? null),
      channel_token: patch.channelToken !== undefined ? patch.channelToken : (prev?.channel_token ?? null),
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
        firm_id: prev.firm_id ?? standInFirm(),
      });
    }
    return [...channelOrder.values()].sort((a, b) => a.ord - b.ord);
  },

  async listSeqChannelRules(sequenceId) {
    const seq = sequenceId?.trim() || null;
    const rows = [...seqChannelRules.values()].filter((row) =>
      seq ? row.sequence_id === seq : row.sequence_id == null && row.firm_id == null,
    );
    if (seq && !rows.length) {
      return [...seqChannelRules.values()].filter((row) => row.sequence_id == null && row.firm_id == null);
    }
    return rows;
  },

  async saveSeqChannelRules(input) {
    const sequenceId = input.sequenceId?.trim() || null;
    const out: SeqChannelRulesRow[] = [];
    for (const rule of input.rules) {
      const id = sequenceId ? `scr-seq-${sequenceId}-${rule.token}` : `scr-global-${rule.token}`;
      const row: SeqChannelRulesRow = {
        id,
        firm_id: sequenceId ? standInFirm() : null,
        sequence_id: sequenceId,
        token: rule.token,
        within_seconds: rule.withinSeconds,
      };
      seqChannelRules.set(id, row);
      out.push(row);
    }
    return out;
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
      const grain = String(trig.data?.grain ?? "global") === "local" ? "local" : "global";
      if (grain === "local") {
        const localRef = String(trig.data?.localRef ?? trig.data?.local_ref ?? "");
        const writeRef = String(
          input.payload?.form_ref ??
            input.payload?.campaign_id ??
            input.payload?.sequence_id ??
            input.payload?.id ??
            "",
        );
        if (!localRef || writeRef !== localRef) continue;
      }
      const audienceScope = w.audience_scope === "select_from" ? "select_from" : "every_firm";
      if (audienceScope === "select_from") {
        const audience = w.audience_contact_ids ?? [];
        const ids = input.contactIds?.length ? input.contactIds.filter((id) => audience.includes(id)) : audience;
        if (!ids.length) continue;
      }
      const started = await standInMachineApi.startRun(w.id, `event:${input.eventName}`);
      fired.push({ workflowId: w.id, runId: started.id, enrollments: started.enrollments?.length ?? 0 });
    }
    return { eventName: input.eventName, workflowsFired: fired };
  },

  async listEligibilityPipeline() {
    return [...eligibilityPipeline.values()].sort((a, b) => a.ord - b.ord);
  },

  async upsertEligibilityPipeline(stages) {
    for (const item of stages) {
      const prev = eligibilityPipeline.get(item.id);
      if (!prev) continue;
      eligibilityPipeline.set(item.id, {
        ...prev,
        token: item.token ?? prev.token,
        label: item.label ?? prev.label,
        ord: item.ord,
        version: (prev.version ?? 0) + 1,
        firm_id: prev.firm_id ?? standInFirm(),
      });
    }
    return [...eligibilityPipeline.values()].sort((a, b) => a.ord - b.ord);
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
        firm_id: prev.firm_id ?? standInFirm(),
      });
    }
    return [...phaseOrder.values()].sort((a, b) => a.ord - b.ord);
  },

  async writeFact(input) {
    const writebackId = `fwb-local-${Date.now()}`;
    factWritebacks.unshift({
      id: writebackId,
      firm_id: standInFirm(),
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
        firm_id: standInFirm(),
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
      firm_id: standInFirm(),
      contact_id: input.contactId,
      result: { trigger: "fact_writeback", writebackId, fieldKey: input.fieldKey },
      any_pathway_pass: true,
      created_at: now(),
    });
    signals.push({
      id: signalId,
      firm_id: standInFirm(),
      contact_id: input.contactId,
      kind: "eligibility_determination",
      payload: { resultId, anyPass: true, writebackId },
      created_at: now(),
    });
    motionDecisions.push({
      id: motionId,
      firm_id: standInFirm(),
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
      firm_id: standInFirm(),
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
    const id = input.id ?? `pw-${standInFirm()}`;
    const row: import("../machineTypes").PreparedWorkspaceRow = {
      id,
      firm_id: standInFirm(),
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
    const state = campaignStates.get(standInFirm()) ?? "armed-for-activation";
    return { firmId: standInFirm(), state, missing: !campaignStates.has(standInFirm()) };
  },

  async setCampaignState(state) {
    campaignStates.set(standInFirm(), state);
    return { firmId: standInFirm(), state };
  },

  async listContactRecords(opts) {
    const scope = opts?.scope === "every_firm" ? "every_firm" : "session";
    const f = standInFirm();
    return [...bookContacts.values()]
      .filter((c) => (scope === "every_firm" ? true : c.firmId === f))
      .map((c) => ({
        id: c.id,
        firmId: c.firmId,
        email: c.email ?? null,
        phone: c.phone ?? null,
        name: c.name ?? null,
        notes: c.notes ?? null,
        tags: c.tags ?? [],
        firmName: c.firmName ?? "Firm",
        createdAt: c.createdAt ?? now(),
      }));
  },

  async provisionFirm(input) {
    const firmId =
      input.firmId?.trim() ||
      (globalThis.crypto?.randomUUID?.() ?? `firm-standin-${Date.now()}`);
    const email = input.email.trim().toLowerCase();
    // Stand-in token is not redeemable — real path mints via access_links.
    const accessPath = `/a/standin-${firmId.slice(0, 8)}`;
    const result: ProvisionResult = {
      firmId,
      firmName: input.firmName.trim(),
      email,
      ctFirm: true,
      authUser: true,
      campaignState: "armed-for-activation",
      loginPath: accessPath,
      accessPath,
    };
    provisionedFirms.set(firmId, result);
    campaignStates.set(firmId, "armed-for-activation");
    return result;
  },

  async listConsultants() {
    return [
      {
        userId: "standin-u-1",
        email: "consultant@harbor.test",
        firmId: "firm-standin-harbor",
        firmName: "Harbor RCIC",
      },
      {
        userId: "standin-u-2",
        email: "owner@cedar.test",
        firmId: "firm-cedar",
        firmName: "Cedar Immigration",
      },
    ];
  },

  async issueAccessInvite(input) {
    const email = input.email.trim().toLowerCase();
    const accessPath = `/a/standin-invite-${email.split("@")[0] || "user"}`;
    return {
      ok: true,
      accessPath,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      emailed: input.sendEmail !== false,
    };
  },

  async bookMeeting(input) {
    const f = standInFirm();
    const id = `mtg-standin-${Date.now()}`;
    standInMeetings.push({
      id,
      firmId: f,
      contactId: input.contactId,
      bookedAt: new Date().toISOString(),
      source: input.source ?? "contact_portal",
      slot: input.slot ?? null,
      consultantName: input.consultantName ?? null,
    });
    let stopped = 0;
    for (let i = 0; i < activeAttempts.length; i++) {
      const a = activeAttempts[i];
      if (a.firm_id === f && a.contact_id === input.contactId && a.status === "open") {
        activeAttempts[i] = { ...a, status: "nullified" };
        stopped += 1;
      }
    }
    return {
      id,
      firmId: f,
      contactId: input.contactId,
      slot: input.slot ?? null,
      attemptsStopped: stopped,
      table: "meeting_booked",
    };
  },

  async listMeetings() {
    const f = standInFirm();
    const meetings = standInMeetings.filter((m) => m.firmId === f);
    return { firmId: f, count: meetings.length, meetings };
  },
};
