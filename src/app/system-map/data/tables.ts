import type { MachineTable, ModularityAuditRow, TableRelation } from "./tableTypes";

/**
 * Table inventory of the machine — every modular thing is a table.
 * Runtime reads these; it holds no content of its own.
 */
export const MACHINE_TABLES: MachineTable[] = [
  // ── Sequence tables (ordered, rearrangeable) ─────────────────────────
  {
    id: "seq.channel_ownership_order",
    kind: "sequence",
    label: "Owning-channel ladder",
    nodeId: "active_attempt",
    modular: true,
    source: "Seed §5.5; World §3.3; OPERATOR-REVISIONS §5b",
    sequence: [
      { id: "ch-text", label: "Text", token: "text" },
      { id: "ch-email", label: "Email", token: "email" },
      { id: "ch-form", label: "Form", token: "form" },
    ],
  },
  {
    id: "seq.content_order",
    kind: "sequence",
    label: "Campaign content order (day calendar)",
    nodeId: "content_order",
    modular: true,
    source: "Seed §5.5; World §3.3",
    sequence: [
      { id: "co-optin", label: "Opt-in content block", token: "optin" },
      { id: "co-nudge", label: "Nudge / re-engagement content block", token: "nudge" },
      { id: "co-react", label: "Reactivation content block", token: "reactivation" },
    ],
  },
  {
    id: "seq.phase_order",
    kind: "sequence",
    label: "Engagement phase order",
    nodeId: "phase_state",
    modular: true,
    source: "Seed §5.3; World §0.4",
    sequence: [
      { id: "ph-optin", label: "Opt-in", token: "optin" },
      { id: "ph-nudge", label: "Re-engagement (nudges)", token: "reengagement" },
      { id: "ph-react", label: "Reactivation", token: "reactivation" },
    ],
  },
  {
    id: "seq.eligibility_pipeline",
    kind: "sequence",
    label: "Eligibility automation shape order",
    nodeId: "eligibility_evaluation",
    modular: true,
    source: "Seed §5.6; World §0.4, §2.3",
    sequence: [
      { id: "ep-trig", label: "Trigger (scoped pull)", token: "trigger" },
      { id: "ep-const", label: "Constants", token: "constants" },
      { id: "ep-cond", label: "Conditions (If)", token: "conditions" },
      { id: "ep-rules", label: "Rules", token: "rules" },
      { id: "ep-out", label: "Structured output", token: "output" },
    ],
  },

  // ── Rule tables (when + condition → write) ───────────────────────────
  {
    id: "rule.attempt_criteria",
    kind: "rule",
    label: "Attempt criteria windows",
    nodeId: "active_attempt",
    modular: true,
    source: "OPERATOR-REVISIONS §5b",
    ruleRows: [
      {
        id: "acr-text",
        label: "Text delivered, not opened → escalate next channel",
        enabled: true,
        when: "channel=text AND delivered",
        condition: "not opened within threshold",
        writesStateTableId: "state.active_attempt",
        setValue: "escalate_forward",
        threshold: 30,
        thresholdUnit: "minutes",
        source: "OPERATOR-REVISIONS §5b",
        ord: 0,
      },
      {
        id: "acr-email",
        label: "Email opened, link not clicked → next attempt",
        enabled: true,
        when: "channel=email AND opened",
        condition: "link not clicked within threshold",
        writesStateTableId: "state.active_attempt",
        setValue: "next_attempt_or_forward",
        threshold: 24,
        thresholdUnit: "hours",
        source: "OPERATOR-REVISIONS §5b",
        ord: 1,
      },
      {
        id: "acr-form",
        label: "Form started, not submitted → back to first channel; clock holds",
        enabled: true,
        when: "channel=form AND started",
        condition: "not submitted within threshold; re-entries do not reset clock",
        writesStateTableId: "state.active_attempt",
        setValue: "return_to_sequence_head",
        threshold: 24,
        thresholdUnit: "hours",
        source: "OPERATOR-REVISIONS §5b",
        ord: 2,
      },
      {
        id: "acr-local-retry",
        label: "Attempts are local retries under failed owning channel",
        enabled: true,
        when: "owner_channel failed",
        condition: "retry = fresh walk of seq.channel_ownership_order under that owner",
        writesStateTableId: "state.active_attempt",
        setValue: "local_retry",
        source: "OPERATOR-REVISIONS §5b",
        ord: 3,
      },
      {
        id: "acr-inbound-form",
        label: "Live form visit nullifies in-flight wait / opens next",
        enabled: true,
        when: "inbound form_visit",
        condition: "attempt in flight",
        writesStateTableId: "state.active_attempt",
        setValue: "override_open_next",
        source: "World §3.3; OPERATOR-REVISIONS §5b",
        ord: 4,
      },
      {
        id: "acr-form-submit",
        label: "Form submitted closes nudge and can arm next",
        enabled: true,
        when: "form submitted",
        condition: "always",
        writesStateTableId: "state.finishing_event",
        setValue: "close_and_arm_next",
        source: "OPERATOR-REVISIONS §5b; World §3.3",
        ord: 5,
      },
    ],
  },
  {
    id: "rule.motion_precedence",
    kind: "rule",
    label: "Engine 2 motion precedence ladder",
    nodeId: "motion_decision",
    modular: true,
    source: "Seed §5.8; World §3.3",
    ruleRows: [
      {
        id: "mp-1",
        label: "Reactivation first if anything reactivation-worthy",
        enabled: true,
        when: "outstanding signals",
        condition: "any reactivation-worthy (criteria = named silence)",
        writesStateTableId: "state.motion_decision",
        setValue: "reactivation",
        source: "Seed §5.8",
        ord: 0,
      },
      {
        id: "mp-2",
        label: "Nudge only when nothing reactivation-worthy",
        enabled: true,
        when: "outstanding signals",
        condition: "no reactivation-worthy",
        writesStateTableId: "state.motion_decision",
        setValue: "nudge",
        source: "Seed §5.8",
        ord: 1,
      },
      {
        id: "mp-3",
        label: "Nudge consolidates every outstanding self-reportable need into one form",
        enabled: true,
        when: "motion=nudge",
        condition: "multiple self-reportable needs",
        writesStateTableId: "state.fact_ask",
        setValue: "one_consolidated_form",
        source: "Seed §5.8",
        ord: 2,
      },
      {
        id: "mp-4",
        label: "Reactivation: secondary signals → agenda on live_brief (never parallel outreach)",
        enabled: true,
        when: "motion=reactivation",
        condition: "secondary signals present",
        writesStateTableId: "state.live_brief",
        setValue: "attach_agenda",
        source: "Seed §5.8",
        ord: 3,
      },
      {
        id: "mp-5",
        label: "One client, one motion, ever",
        enabled: true,
        when: "motion chosen",
        condition: "always",
        writesStateTableId: "state.motion_decision",
        setValue: "single_motion_lock",
        source: "Seed §5.8, §16.11",
        ord: 4,
      },
    ],
  },
  {
    id: "rule.field_class_routing",
    kind: "rule",
    label: "Field class → route",
    nodeId: "field_class_routing",
    modular: true,
    source: "Seed §5.4; World §0.4",
    ruleRows: [
      {
        id: "fcr-self",
        label: "Self-reportable → forms / pre-meeting capture",
        enabled: true,
        when: "field_class=self_reportable",
        condition: "always",
        writesStateTableId: "state.pending_capture",
        setValue: "form_eligible",
        source: "Seed §5.4",
        ord: 0,
      },
      {
        id: "fcr-doc",
        label: "Document-dependent → never form; tracked work item",
        enabled: true,
        when: "field_class=document_dependent",
        condition: "always",
        writesStateTableId: "state.field_class_routing",
        setValue: "work_item_never_form",
        source: "Seed §5.4",
        ord: 1,
      },
      {
        id: "fcr-emp",
        label: "Employer-directed → ask firm, not client",
        enabled: true,
        when: "field_class=employer_directed",
        condition: "always",
        writesStateTableId: "state.field_class_routing",
        setValue: "ask_firm",
        source: "Seed §5.4",
        ord: 2,
      },
    ],
  },
  {
    id: "rule.reachability_checks",
    kind: "rule",
    label: "Reachability check set",
    nodeId: "reachability_verdict",
    modular: true,
    source: "Seed §5.2; World §3.1",
    ruleRows: [
      { id: "rc-email", label: "email valid", enabled: true, when: "audit run", condition: "email present", writesStateTableId: "state.reachability_verdict", setValue: "check_email", source: "Seed §5.2", ord: 0 },
      { id: "rc-phone", label: "phone valid", enabled: true, when: "audit run", condition: "phone present", writesStateTableId: "state.reachability_verdict", setValue: "check_phone", source: "Seed §5.2", ord: 1 },
      { id: "rc-channel", label: "≥1 channel matching intended sequence", enabled: true, when: "audit run", condition: "channel usable", writesStateTableId: "state.reachability_verdict", setValue: "check_channel", source: "Seed §5.2", ord: 2 },
      { id: "rc-typo", label: "typo/garbage", enabled: true, when: "audit run", condition: "format", writesStateTableId: "state.reachability_verdict", setValue: "check_typo", source: "Seed §5.2", ord: 3 },
      { id: "rc-dedupe", label: "dedupe / already-in-Tower", enabled: true, when: "audit run", condition: "identity", writesStateTableId: "state.reachability_verdict", setValue: "check_dedupe", source: "Seed §5.2", ord: 4 },
      { id: "rc-consent", label: "consent/silenced", enabled: true, when: "audit run", condition: "reads state.consent_state", writesStateTableId: "state.reachability_verdict", setValue: "check_consent", source: "Seed §5.2", ord: 5 },
      { id: "rc-name", label: "name present", enabled: true, when: "audit run", condition: "name", writesStateTableId: "state.reachability_verdict", setValue: "check_name", source: "Seed §5.2", ord: 6 },
    ],
  },
  {
    id: "rule.eligibility_pathway",
    kind: "rule",
    label: "Pathway pass = any assertion",
    nodeId: "eligibility_evaluation",
    modular: true,
    source: "Seed §5.7 Directive 2",
    ruleRows: [
      {
        id: "epath-any",
        label: "Pass if any of CEC|FSW|FST|PNP-* asserts",
        enabled: true,
        when: "rules evaluated",
        condition: "any pathway true",
        writesStateTableId: "state.eligibility_result",
        setValue: "any_pathway_pass",
        source: "Seed §5.7",
        ord: 0,
      },
    ],
  },

  // ── State tables (status the machine tracks) ─────────────────────────
  ...stateTable("state.seed_capture", "seed_capture", "Seed capture inputs", "name|website|phone|email", "Seed §6.2"),
  ...stateTable("state.approach_impression", "approach_impression", "Approach impression / non-tap", "saw|tapped|continue_scroll", "Seed §6.2"),
  ...stateTable("state.firm_public_facts", "firm_public_facts", "Public firm facts", "scraped facts blob", "Seed §6.3"),
  ...stateTable("state.prepared_workspace", "prepared_workspace", "Prepared workspace", "staged|ready", "Seed §6.3"),
  ...stateTable("state.database_authorization", "database_authorization", "DB authorization", "absent|granted", "Seed §6.3"),
  ...stateTable("state.escrow_acceptance", "escrow_acceptance", "Escrow acceptance", "absent|accepted", "Seed §7"),
  ...stateTable("state.escrow_terms", "escrow_terms", "Escrow terms held", "terms blob", "Seed §7"),
  ...stateTable("state.campaign_state", "campaign_state", "Campaign state", "armed-for-activation|running", "Seed §6.1"),
  ...stateTable("state.firm_tenancy", "firm_tenancy", "Firm tenancy", "provisioned firm", "Seed §5.10"),
  ...stateTable("state.user_account", "user_account", "User account", "provisioned user", "Seed §5.10"),
  ...stateTable("state.otp_challenge", "otp_challenge", "OTP challenge", "sent|verified|suppressed", "Seed §5.10"),
  ...stateTable("state.session", "session", "Session", "none|held", "Seed §5.10"),
  ...stateTable("state.contact_record", "contact_record", "Contact record", "contact row", "Seed §5.1"),
  ...stateTable("state.reachability_verdict", "reachability_verdict", "Reachability verdict", "reachable|partial|unreachable", "Seed §5.2"),
  ...stateTable("state.sequence_ready", "sequence_ready", "Sequence ready", "true|false", "Seed §5.2"),
  ...stateTable("state.consent_state", "consent_state", "Consent state", "sequenced|silenced|unsequenced", "Seed §5.3"),
  ...stateTable("state.optin_phase", "optin_phase", "Opt-in phase", "idle|running|complete", "Seed §5.3"),
  ...stateTable("state.sequence_definition", "sequence_definition", "Sequence definition", "steps blob", "Seed §5.5"),
  ...stateTable("state.phase_state", "phase_state", "Phase state", "current phase token", "Seed §5.3"),
  ...stateTable("state.reactivation_arm_state", "reactivation_arm_state", "Reactivation arm", "armed|active", "Seed §5.3"),
  ...stateTable("state.content_order", "content_order", "Content order pointer", "current content token", "Seed §5.5"),
  ...stateTable("state.active_attempt", "active_attempt", "Active attempt", "owner_channel|wait|closed", "Seed §5.5"),
  ...stateTable("state.inbound_override", "inbound_override", "Inbound override event", "none|form_visit|…", "World §3.3"),
  ...stateTable("state.finishing_event", "finishing_event", "Finishing event", "none|form_submitted|…", "World §3.3"),
  ...stateTable("state.engagement_record", "engagement_record", "Engagement record", "append-only event log", "World §3.2"),
  ...stateTable("state.fact_ask", "fact_ask", "Fact ask", "outstanding asks", "Seed §5.4"),
  ...stateTable("state.field_class_routing", "field_class_routing", "Field class routing result", "route decision", "Seed §5.4"),
  ...stateTable("state.fact_writeback", "fact_writeback", "Fact writeback", "answer landed", "Seed §5.8"),
  ...stateTable("state.missing_fact_signal", "missing_fact_signal", "Missing fact signal", "absent|present", "Seed §5.8"),
  ...stateTable("state.reference_version", "reference_version", "Reference version", "version id + facts", "Seed §5.7"),
  ...stateTable("state.constants_pack", "constants_pack", "Constants pack", "pack version", "Seed §5.6"),
  ...stateTable("state.eligibility_evaluation", "eligibility_evaluation", "Eligibility evaluation run", "idle|running|done", "Seed §5.6"),
  ...stateTable("state.eligibility_result", "eligibility_result", "Eligibility result", "structured determination", "Seed §5.7"),
  ...stateTable("state.analysis_readout", "analysis_readout", "Analysis readout", "headlines/deltas", "Seed §5.7"),
  ...stateTable("state.evaluation_ruleset", "evaluation_ruleset", "Evaluation ruleset", "open-box rules", "World §3.4"),
  ...stateTable("state.signal", "signal", "Signal", "detection record", "Seed §5.8"),
  ...stateTable("state.motion_decision", "motion_decision", "Motion decision", "none|nudge|reactivation", "Seed §5.8"),
  ...stateTable("state.meeting_booked", "meeting_booked", "Meeting booked", "absent|booked", "Seed §5.8"),
  ...stateTable("state.pending_capture", "pending_capture", "Pending capture", "closed|open", "Seed §5.8"),
  ...stateTable("state.live_brief", "live_brief", "Live brief", "recomputed brief", "Seed §5.8"),

  // ── Non-modular walls (stated structural reasons — not bugs) ─────────
  {
    id: "wall.hard_gates",
    kind: "rule",
    label: "Hard human gates (not automatable)",
    nodeId: "meeting_booked",
    modular: false,
    structuralReason: "hard-gate",
    structuralReasonDetail:
      "Seed §9 / World §4 — seed capture, OTP, DB auth, escrow accept, client opt-in, meeting book, refuse unethical outreach. Runtime must not replace these with table rows that auto-fire.",
    source: "Seed §9; World §4",
    ruleRows: [],
  },
  {
    id: "wall.must_nots",
    kind: "rule",
    label: "Must-not constraints (immutable walls)",
    nodeId: "campaign_state",
    modular: false,
    structuralReason: "must-not",
    structuralReasonDetail:
      "Examples: no DB-auth in click budget; escrow only peer door; no public cold-detect; record authors nothing; document-dependent never form. These are Seed/World walls — not reorderable content.",
    source: "Seed must-nots / World walls",
    ruleRows: [],
  },
  {
    id: "wall.click_budget",
    kind: "rule",
    label: "One-click acquisition budget",
    nodeId: "seed_capture",
    modular: false,
    structuralReason: "immutable-wall",
    structuralReasonDetail: "Forced at one click as design constraint; relax only as a finding (Seed §6.2).",
    source: "Seed §6.2; World §0.3.3",
    ruleRows: [],
  },
  {
    id: "wall.approach_scope",
    kind: "rule",
    label: "Approach acquires Consultant only",
    nodeId: "seed_capture",
    modular: false,
    structuralReason: "immutable-wall",
    structuralReasonDetail: "Engagement contacts and house never acquired via Approach (World §0.3.6).",
    source: "World §0.3.6",
    ruleRows: [],
  },
];

function stateTable(
  id: string,
  nodeId: string,
  label: string,
  valueDomain: string,
  source: string,
): MachineTable[] {
  return [
    {
      id,
      kind: "state",
      label,
      nodeId,
      modular: true,
      source,
      stateFields: [{ id: "value", label: "value", valueDomain }],
    },
  ];
}

/** Relationships between tables — reads / writes / triggers. */
export const TABLE_RELATIONS: TableRelation[] = [
  { id: "tr-seed-facts", fromTableId: "state.seed_capture", toTableId: "state.firm_public_facts", kind: "triggers", label: "seed inputs land", faceless: true, edgeId: "e-seed-facts" },
  { id: "tr-facts-ws", fromTableId: "state.firm_public_facts", toTableId: "state.prepared_workspace", kind: "triggers", label: "instantiate", faceless: true, edgeId: "e-facts-ws" },
  { id: "tr-db-camp", fromTableId: "state.database_authorization", toTableId: "state.campaign_state", kind: "writes", label: "hard input", edgeId: "e-db-campaign" },
  { id: "tr-esc-camp", fromTableId: "state.escrow_acceptance", toTableId: "state.campaign_state", kind: "writes", label: "hard input", edgeId: "e-escrow-campaign" },
  { id: "tr-camp-contact", fromTableId: "state.campaign_state", toTableId: "state.contact_record", kind: "triggers", label: "opens Application", edgeId: "e-campaign-contact" },
  { id: "tr-consent-verdict", fromTableId: "state.consent_state", toTableId: "rule.reachability_checks", kind: "reads", label: "consent feeds checks", edgeId: "e-consent-verdict" },
  { id: "tr-rc-verdict", fromTableId: "rule.reachability_checks", toTableId: "state.reachability_verdict", kind: "writes", label: "checks → verdict", faceless: true, edgeId: "e-contact-verdict" },
  { id: "tr-verdict-ready", fromTableId: "state.reachability_verdict", toTableId: "state.sequence_ready", kind: "writes", label: "verdict", edgeId: "e-verdict-ready" },
  { id: "tr-ready-attempt", fromTableId: "state.sequence_ready", toTableId: "state.active_attempt", kind: "triggers", label: "enroll gate", edgeId: "e-ready-attempt" },
  { id: "tr-seq-ch-attempt", fromTableId: "seq.channel_ownership_order", toTableId: "state.active_attempt", kind: "reads", label: "runtime consumes channel order" },
  { id: "tr-acr-attempt", fromTableId: "rule.attempt_criteria", toTableId: "state.active_attempt", kind: "writes", label: "criteria rows edit attempt", faceless: true },
  { id: "tr-ref-eval", fromTableId: "state.reference_version", toTableId: "state.eligibility_evaluation", kind: "triggers", label: "reference move ★★", faceless: true, edgeId: "e-ref-eval" },
  { id: "tr-wb-eval", fromTableId: "state.fact_writeback", toTableId: "state.eligibility_evaluation", kind: "triggers", label: "write-back", faceless: true, edgeId: "e-wb-eval" },
  { id: "tr-eval-reads-pipe", fromTableId: "state.eligibility_evaluation", toTableId: "seq.eligibility_pipeline", kind: "reads", label: "pipeline order" },
  { id: "tr-eval-reads-epath", fromTableId: "state.eligibility_evaluation", toTableId: "rule.eligibility_pathway", kind: "reads", label: "any-pathway rules" },
  { id: "tr-eval-result", fromTableId: "state.eligibility_evaluation", toTableId: "state.eligibility_result", kind: "writes", label: "determination", faceless: true, edgeId: "e-eval-result" },
  { id: "tr-epath-result", fromTableId: "rule.eligibility_pathway", toTableId: "state.eligibility_result", kind: "writes", label: "any-pathway", edgeId: "e-eval-result" },
  { id: "tr-result-signal", fromTableId: "state.eligibility_result", toTableId: "state.signal", kind: "triggers", label: "every determination", faceless: true, edgeId: "e-result-signal" },
  { id: "tr-result-analysis", fromTableId: "state.eligibility_result", toTableId: "state.analysis_readout", kind: "writes", label: "derive", edgeId: "e-result-analysis" },
  { id: "tr-missing-signal", fromTableId: "state.missing_fact_signal", toTableId: "state.signal", kind: "triggers", label: "absence", faceless: true, edgeId: "e-missing-signal" },
  { id: "tr-signal-reads-mp", fromTableId: "state.signal", toTableId: "rule.motion_precedence", kind: "reads", label: "outstanding set", faceless: true, edgeId: "e-signal-motion" },
  { id: "tr-signal-motion", fromTableId: "state.signal", toTableId: "state.motion_decision", kind: "triggers", label: "decide motion", faceless: true },
  { id: "tr-mp-motion", fromTableId: "rule.motion_precedence", toTableId: "state.motion_decision", kind: "writes", label: "precedence rows", faceless: true },
  { id: "tr-motion-reads-seq", fromTableId: "state.motion_decision", toTableId: "seq.channel_ownership_order", kind: "reads", label: "channel order for engage" },
  { id: "tr-motion-attempt", fromTableId: "state.motion_decision", toTableId: "state.active_attempt", kind: "triggers", label: "chosen motion", faceless: true, edgeId: "e-motion-attempt" },
  { id: "tr-attempt-reads-ch", fromTableId: "state.active_attempt", toTableId: "seq.channel_ownership_order", kind: "reads", label: "runtime consumes channel order" },
  { id: "tr-attempt-reads-acr", fromTableId: "state.active_attempt", toTableId: "rule.attempt_criteria", kind: "reads", label: "criteria rows" },
  { id: "tr-content-attempt", fromTableId: "seq.content_order", toTableId: "state.active_attempt", kind: "reads", label: "supplies content", edgeId: "e-content-attempt" },
  { id: "tr-attempt-ask", fromTableId: "state.active_attempt", toTableId: "state.fact_ask", kind: "triggers", label: "touchpoint", edgeId: "e-attempt-ask" },
  { id: "tr-ask-reads-fcr", fromTableId: "state.fact_ask", toTableId: "rule.field_class_routing", kind: "reads", label: "class → route", edgeId: "e-ask-class" },
  { id: "tr-fcr", fromTableId: "rule.field_class_routing", toTableId: "state.field_class_routing", kind: "writes", label: "class → route" },
  { id: "tr-ask-missing", fromTableId: "state.fact_ask", toTableId: "state.missing_fact_signal", kind: "triggers", label: "if absent", faceless: true, edgeId: "e-ask-missing" },
  { id: "tr-finish", fromTableId: "state.active_attempt", toTableId: "state.finishing_event", kind: "triggers", label: "criteria terminal", faceless: true, edgeId: "e-attempt-finish" },
  { id: "tr-finish-arm", fromTableId: "state.finishing_event", toTableId: "state.reactivation_arm_state", kind: "writes", label: "arms next", faceless: true, edgeId: "e-finish-arm" },
  { id: "tr-finish-record", fromTableId: "state.finishing_event", toTableId: "state.engagement_record", kind: "writes", label: "append", faceless: true, edgeId: "e-finish-record" },
  { id: "tr-book-capture", fromTableId: "state.meeting_booked", toTableId: "state.pending_capture", kind: "triggers", label: "outstanding fields", edgeId: "e-book-capture" },
  { id: "tr-capture-wb", fromTableId: "state.pending_capture", toTableId: "state.fact_writeback", kind: "writes", label: "write-back", edgeId: "e-capture-wb" },
  { id: "tr-wb-brief", fromTableId: "state.fact_writeback", toTableId: "state.live_brief", kind: "writes", label: "recompute ★", faceless: true, edgeId: "e-wb-brief" },
  { id: "tr-motion-brief", fromTableId: "state.motion_decision", toTableId: "state.live_brief", kind: "writes", label: "agenda on reactivation", faceless: true, edgeId: "e-motion-brief" },
];

/** Modularity law audit — flag frozen-should-be-table bugs. */
export function runModularityAudit(tables: MachineTable[] = MACHINE_TABLES): ModularityAuditRow[] {
  const rows: ModularityAuditRow[] = [];
  for (const t of tables) {
    const row: ModularityAuditRow = {
      tableId: t.id,
      nodeId: t.nodeId,
      kind: t.kind,
      modular: t.modular,
      structuralReason: t.structuralReason,
      structuralReasonDetail: t.structuralReasonDetail,
    };
    if (!t.modular && !t.structuralReason) {
      row.bug = "frozen-should-be-table";
      row.bugDetail = "Non-modular without stated structural reason";
    }
    if (t.modular && t.kind === "sequence" && (!t.sequence || t.sequence.length === 0)) {
      row.bug = "frozen-should-be-table";
      row.bugDetail = "Sequence table missing editable items";
    }
    if (t.modular && t.kind === "rule" && t.id.startsWith("rule.") && (!t.ruleRows || t.ruleRows.length === 0)) {
      row.bug = "frozen-should-be-table";
      row.bugDetail = "Rule table missing editable rows";
    }
    // Worked example: channel order must be sequence, not prose — already as seq.channel_ownership_order
    rows.push(row);
  }
  return rows;
}

export function tablesForNode(nodeId: string, tables: MachineTable[] = MACHINE_TABLES): MachineTable[] {
  return tables.filter((t) => t.nodeId === nodeId);
}

export function cloneTables(tables: MachineTable[] = MACHINE_TABLES): MachineTable[] {
  return structuredClone(tables);
}
