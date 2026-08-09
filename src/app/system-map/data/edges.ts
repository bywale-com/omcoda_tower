import type { MapEdge } from "./types";

/** Causation edges — skeleton §14 ring + spine. */
export const SYSTEM_MAP_EDGES: MapEdge[] = [
  // Spine
  { id: "e-seed-facts", source: "seed_capture", target: "firm_public_facts", label: "seed inputs land", faceless: true },
  { id: "e-facts-ws", source: "firm_public_facts", target: "prepared_workspace", label: "instantiate", faceless: true },
  { id: "e-db-campaign", source: "database_authorization", target: "campaign_state", label: "hard input" },
  { id: "e-escrow-campaign", source: "escrow_acceptance", target: "campaign_state", label: "hard input" },
  { id: "e-campaign-contact", source: "campaign_state", target: "contact_record", label: "opens Application" },

  // Audit → engage
  { id: "e-contact-verdict", source: "contact_record", target: "reachability_verdict", label: "audit", faceless: true, ring: true },
  { id: "e-consent-verdict", source: "consent_state", target: "reachability_verdict", label: "consent gate", ring: true },
  { id: "e-verdict-ready", source: "reachability_verdict", target: "sequence_ready", label: "verdict", ring: true },
  { id: "e-ready-attempt", source: "sequence_ready", target: "active_attempt", label: "enroll gate", ring: true },

  // Ring heartbeat
  { id: "e-ref-eval", source: "reference_version", target: "eligibility_evaluation", label: "reference move ★★", faceless: true, ring: true },
  { id: "e-wb-eval", source: "fact_writeback", target: "eligibility_evaluation", label: "write-back", faceless: true, ring: true },
  { id: "e-eval-result", source: "eligibility_evaluation", target: "eligibility_result", label: "determination", faceless: true, ring: true },
  { id: "e-result-signal", source: "eligibility_result", target: "signal", label: "every determination", faceless: true, ring: true },
  { id: "e-missing-signal", source: "missing_fact_signal", target: "signal", label: "absence", faceless: true, ring: true },
  { id: "e-signal-motion", source: "signal", target: "motion_decision", label: "outstanding set", faceless: true, ring: true },
  { id: "e-motion-attempt", source: "motion_decision", target: "active_attempt", label: "chosen motion", faceless: true, ring: true },
  { id: "e-attempt-ask", source: "active_attempt", target: "fact_ask", label: "touchpoint", ring: true },
  { id: "e-ask-class", source: "fact_ask", target: "field_class_routing", label: "route", ring: true },
  { id: "e-ask-missing", source: "fact_ask", target: "missing_fact_signal", label: "if absent", faceless: true, ring: true },
  { id: "e-inbound-attempt", source: "inbound_override", target: "active_attempt", label: "nullify / next", faceless: true, ring: true },
  { id: "e-attempt-finish", source: "active_attempt", target: "finishing_event", label: "criteria terminal", faceless: true, ring: true },
  { id: "e-finish-arm", source: "finishing_event", target: "reactivation_arm_state", label: "arms next", faceless: true, ring: true },
  { id: "e-finish-record", source: "finishing_event", target: "engagement_record", label: "append", faceless: true },

  // Meeting close re-enters ring
  { id: "e-book-capture", source: "meeting_booked", target: "pending_capture", label: "outstanding fields" },
  { id: "e-capture-wb", source: "pending_capture", target: "fact_writeback", label: "write-back" },
  { id: "e-wb-brief", source: "fact_writeback", target: "live_brief", label: "recompute ★", faceless: true },
  { id: "e-result-analysis", source: "eligibility_result", target: "analysis_readout", label: "derive" },
  { id: "e-motion-brief", source: "motion_decision", target: "live_brief", label: "agenda on reactivation", faceless: true },

  // Support
  { id: "e-otp-session", source: "otp_challenge", target: "session", label: "verify" },
  { id: "e-content-attempt", source: "content_order", target: "active_attempt", label: "supplies content" },
  { id: "e-const-eval", source: "constants_pack", target: "eligibility_evaluation", label: "criteria pack" },
  { id: "e-ruleset-eval", source: "evaluation_ruleset", target: "eligibility_evaluation", label: "open-box rules" },
];
