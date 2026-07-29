export type ClientStatus = "teal" | "amber" | "grey";

export type NudgeBriefing = {
  triggerTags: { label: string; urgency: "teal" | "amber" }[];
  hiddenTagCount: number;
  nudgeCurrent: number;
  nudgeTotal: number;
  liveForm: { question: string; inputValue: string };
  qaFeed: { question: string; answer: string; isCurrent?: boolean }[];
};

export type ClientMeta = {
  id: string;
  name: string;
  initials: string;
  status: ClientStatus;
  badge?: { label: string; type: "eligible" | "close" | "booked" };
  optedIn: boolean;
  nudge: { active: boolean; label?: string; briefing?: NudgeBriefing };
  /** Armed = template ready (Activity ghost band). Active = reactivation sequence executing. */
  reactivationPhase: "armed" | "active" | null;
  /** Structured content for the phase tooltip card. */
  phaseSnapshot?: {
    nodeRef?: string;
    headline?: string;
    detail?: string;
    /** Legacy single-line fallback when headline/detail omitted. */
    currentState?: string;
    activityNodeId: string;
  };
};

export type ClientEngagementPhase = "opt-in" | "re-engagement" | "reactivation";

export type ClientPhaseSnapshot = {
  phase: ClientEngagementPhase;
  phaseLabel: string;
  status: "ACTIVE" | "ARMED" | "COMPLETE" | "PENDING";
  headline: string;
  detail: string;
  nodeRef?: string;
  activityNodeId: string;
};

const PHASE_LABELS: Record<ClientEngagementPhase, string> = {
  "opt-in": "OPT-IN LAUNCH",
  "re-engagement": "RE-ENGAGEMENT",
  reactivation: "REACTIVATION",
};

function parseLegacyState(state: string): { headline: string; detail: string; nodeRef?: string } {
  const parts = state.split(" · ").map((s) => s.trim());
  const nodeRefMatch = parts[0]?.match(/^[A-Z]-\d{3}$/);
  if (nodeRefMatch) {
    return {
      nodeRef: parts[0],
      headline: parts[1] ?? parts[0],
      detail: parts.slice(2).join(" · "),
    };
  }
  if (parts.length >= 2) {
    return { headline: parts[0], detail: parts.slice(1).join(" · ") };
  }
  return { headline: state, detail: "" };
}

function resolvePhaseContent(
  client: ClientMeta,
  fallbackState: string,
): Pick<ClientPhaseSnapshot, "headline" | "detail" | "nodeRef" | "activityNodeId"> {
  const snap = client.phaseSnapshot;
  const activityNodeId = snap?.activityNodeId ?? "opt-in";

  if (snap?.headline) {
    return {
      headline: snap.headline,
      detail: snap.detail ?? "",
      nodeRef: snap.nodeRef,
      activityNodeId,
    };
  }

  const legacy = parseLegacyState(snap?.currentState ?? fallbackState);
  return {
    headline: legacy.headline,
    detail: legacy.detail,
    nodeRef: snap?.nodeRef ?? legacy.nodeRef,
    activityNodeId,
  };
}

/** Current engagement phase for sidebar icon + tooltip. */
export function getClientPhaseSnapshot(client: ClientMeta): ClientPhaseSnapshot {
  if (client.reactivationPhase === "active") {
    const content = resolvePhaseContent(client, "Reactivation sequence executing");
    return {
      phase: "reactivation",
      phaseLabel: PHASE_LABELS.reactivation,
      status: "ACTIVE",
      ...content,
      activityNodeId: content.activityNodeId || "reactivation",
    };
  }

  if (client.nudge.active) {
    const content = resolvePhaseContent(
      client,
      client.nudge.label ?? "Nudge sequence in progress",
    );
    return {
      phase: "re-engagement",
      phaseLabel: PHASE_LABELS["re-engagement"],
      status: "ACTIVE",
      ...content,
      activityNodeId: content.activityNodeId || "nudges",
    };
  }

  if (client.reactivationPhase === "armed") {
    const content = resolvePhaseContent(client, "Reactivation armed · one nudge away");
    return {
      phase: "reactivation",
      phaseLabel: PHASE_LABELS.reactivation,
      status: "ARMED",
      ...content,
      activityNodeId: content.activityNodeId || "reactivation",
    };
  }

  const content = resolvePhaseContent(
    client,
    client.optedIn
      ? "Launch completed · Tower monitoring"
      : "Awaiting opt-in · no engagement started",
  );
  return {
    phase: "opt-in",
    phaseLabel: PHASE_LABELS["opt-in"],
    status: client.optedIn ? "COMPLETE" : "PENDING",
    ...content,
    activityNodeId: content.activityNodeId || "opt-in",
  };
}

export type NudgeStep = {
  time: string;
  label: string;
  detail?: string;
  outcome: "sent" | "delivered" | "no-response" | "queued" | "replied";
};

export type NudgeEntry = {
  id: string;
  date: string;
  trigger: string;
  channel: string[];
  success: boolean;
  steps: NudgeStep[];
  nextStep: string;
};

export type ActivationLogEntry = {
  id: string;
  timestamp: string;
  status: "active" | "complete" | "failed";
  outcome: string;
  actions: string[];
};

/** Engine-readable eligibility fields on the client record (Directive 1 plumbing). */
export type EcaStatus = "valid" | "expired" | "missing" | "not_required";

export type ClientEligibility = {
  eca_status: EcaStatus;
  ee_profile_exists: boolean;
  /** ISO date YYYY-MM-DD when EE profile was last updated */
  ee_profile_last_updated: string | null;
  foreign_work_years: number | null;
  /** FST / PNP helpers already on the record for pathway evaluation */
  foreign_trade_hours: number | null;
  has_qualifying_job_offer: boolean;
  has_trade_certificate: boolean;
  has_ontario_job_offer: boolean;
  oinp_student_context: boolean;
};

export type ClientDetail = {
  id: string;
  initials: string;
  name: string;
  pathway: string;
  addedDate: string;
  status: "eligible" | "close" | "pending";
  statusLabel: string;
  crs: number;
  workPermitExpiry: string;
  workPermitWarn: boolean;
  daysInSystem: string;
  billingRef: string;
  narrative: string;
  profile: Record<string, string>;
  eligibility: ClientEligibility;
  nudges: NudgeEntry[];
  activationLogs: ActivationLogEntry[];
};

export const clientList: ClientMeta[] = [
  {
    id: "sarah", name: "Sarah Jenkins", initials: "SJ", status: "teal",
    badge: { label: "eligible", type: "eligible" },
    optedIn: true,
    nudge: {
      active: true,
      label: "Nudge 3 of 5 · awaiting response",
      briefing: {
        triggerTags: [
          { label: "Work Permit Expiry", urgency: "amber" },
          { label: "Policy Anniversary", urgency: "teal" },
        ],
        hiddenTagCount: 3,
        nudgeCurrent: 3,
        nudgeTotal: 5,
        liveForm: {
          question: "How many months of Canadian work experience do you currently have?",
          inputValue: "14 m",
        },
        qaFeed: [
          {
            question: "What is your current TEER category?",
            answer: "TEER 1 — Software engineer",
          },
          {
            question: "Which province is your primary residence?",
            answer: "British Columbia",
          },
          {
            question: "How many months of Canadian work experience do you currently have?",
            answer: "14 months",
            isCurrent: true,
          },
        ],
      },
    },
    reactivationPhase: "armed",
    phaseSnapshot: {
      nodeRef: "N-001",
      headline: "Task created",
      detail: "Awaiting consultant follow-up",
      activityNodeId: "n-001-r1-f",
    },
  },
  {
    id: "marcus",
    name: "Marcus Webb",
    initials: "MW",
    status: "amber",
    badge: { label: "eligible", type: "eligible" },
    optedIn: true,
    nudge: { active: false },
    reactivationPhase: "active",
    phaseSnapshot: {
      nodeRef: "R-001",
      headline: "Reactivation executing",
      detail: "Day 0 SMS delivered · eligibility email opened",
      activityNodeId: "m-r-email",
    },
  },
  {
    id: "mark", name: "Mark Zhao", initials: "MZ", status: "grey",
    optedIn: true, nudge: { active: false }, reactivationPhase: null,
    phaseSnapshot: {
      nodeRef: "OI-5",
      headline: "Launch completed",
      detail: "Tower monitoring · Mar 2024",
      activityNodeId: "opt-in",
    },
  },
  {
    id: "aisha", name: "Aisha Khan", initials: "AK", status: "amber",
    optedIn: false, nudge: { active: false }, reactivationPhase: null,
    phaseSnapshot: {
      headline: "Awaiting opt-in",
      detail: "No engagement started",
      activityNodeId: "opt-in",
    },
  },
  {
    id: "priya", name: "Priya Nair", initials: "PN", status: "grey",
    badge: { label: "close", type: "close" },
    optedIn: true,
    nudge: {
      active: true,
      label: "Nudge 2 of 3 · SMS delivered",
      briefing: {
        triggerTags: [
          { label: "CRS Threshold", urgency: "teal" },
          { label: "Language Reassessment", urgency: "amber" },
        ],
        hiddenTagCount: 1,
        nudgeCurrent: 2,
        nudgeTotal: 3,
        liveForm: {
          question: "What is your current CLB score for English?",
          inputValue: "CLB ",
        },
        qaFeed: [
          {
            question: "Have you completed a language test in the last two years?",
            answer: "Yes — IELTS in March 2024",
          },
          {
            question: "What is your current CRS score?",
            answer: "415 points",
          },
          {
            question: "What is your current CLB score for English?",
            answer: "CLB 8 across all bands",
            isCurrent: true,
          },
        ],
      },
    },
    reactivationPhase: null,
    phaseSnapshot: {
      nodeRef: "N-002",
      headline: "SMS delivered",
      detail: "Awaiting response",
      activityNodeId: "nudges",
    },
  },
  {
    id: "daniel", name: "Daniel Osei", initials: "DO", status: "teal",
    optedIn: true, nudge: { active: false }, reactivationPhase: null,
    phaseSnapshot: {
      nodeRef: "OI-5",
      headline: "Launch completed",
      detail: "Eligibility monitoring active",
      activityNodeId: "opt-in",
    },
  },
  {
    id: "fatima", name: "Fatima Al-Hassan", initials: "FA", status: "grey",
    badge: { label: "close", type: "close" },
    optedIn: false, nudge: { active: false }, reactivationPhase: null,
    phaseSnapshot: {
      headline: "Not opted in",
      detail: "Close to eligibility threshold",
      activityNodeId: "opt-in",
    },
  },
  {
    id: "james", name: "James Okonkwo", initials: "JO", status: "amber",
    optedIn: true,
    nudge: {
      active: true,
      label: "Nudge 1 of 2 · no response",
      briefing: {
        triggerTags: [
          { label: "Document Gap", urgency: "amber" },
          { label: "Profile Incomplete", urgency: "teal" },
        ],
        hiddenTagCount: 0,
        nudgeCurrent: 1,
        nudgeTotal: 2,
        liveForm: {
          question: "Please upload your employment reference letter.",
          inputValue: "",
        },
        qaFeed: [
          {
            question: "When did you start your current role?",
            answer: "September 2023",
          },
          {
            question: "Is your employer willing to provide a reference letter?",
            answer: "Yes, but HR needs two weeks' notice",
          },
          {
            question: "Do you have an employment reference letter from your current employer?",
            answer: "Not yet — still waiting on my manager",
            isCurrent: true,
          },
        ],
      },
    },
    reactivationPhase: null,
    phaseSnapshot: {
      nodeRef: "N-001",
      headline: "Document request sent",
      detail: "Criteria not met · escalating",
      activityNodeId: "nudges",
    },
  },
  {
    id: "lin", name: "Lin Wei", initials: "LW", status: "grey",
    badge: { label: "booked", type: "booked" },
    optedIn: true, nudge: { active: false }, reactivationPhase: null,
    phaseSnapshot: {
      nodeRef: "OI-5",
      headline: "Launch completed",
      detail: "Consultation booked",
      activityNodeId: "opt-in",
    },
  },
  {
    id: "task",
    name: "Task",
    initials: "T",
    status: "grey",
    optedIn: true,
    nudge: { active: false },
    reactivationPhase: null,
    phaseSnapshot: {
      headline: "Monitoring",
      detail: "No active engagement",
      activityNodeId: "opt-in",
    },
  },
];

export const clientDetails: Record<string, ClientDetail> = {
  sarah: {
    id: "sarah", initials: "SJ", name: "Sarah Jenkins",
    pathway: "Express Entry · CEC", addedDate: "14 Mar 2024",
    status: "eligible", statusLabel: "Eligible",
    crs: 447, workPermitExpiry: "47 days", workPermitWarn: true,
    daysInSystem: "454 days", billingRef: "b-52",
    narrative: "Sarah meets all CEC conditions. Work permit expires in 47 days — activation window is now.",
    profile: {
      "Immigration status": "Work permit",
      "Canadian work exp.": "14 months",
      "TEER category": "TEER 1",
      "Language": "CLB 9",
      "Province": "British Columbia",
      "NOC": "21222 · Software engineer",
    },
    eligibility: {
      eca_status: "not_required",
      ee_profile_exists: true,
      ee_profile_last_updated: "2026-05-12",
      foreign_work_years: 0.5,
      foreign_trade_hours: null,
      has_qualifying_job_offer: false,
      has_trade_certificate: false,
      has_ontario_job_offer: false,
      oinp_student_context: false,
    },
    nudges: [
      {
        id: "N-001", date: "11 Jun 2026",
        trigger: "Work permit expiry < 60 days",
        channel: ["email", "sms"], success: true,
        steps: [
          { time: "09:14", label: "Email sent", detail: "Subject: Your Express Entry update · sarah.jenkins@gmail.com", outcome: "delivered" },
          { time: "09:31", label: "No response (30m window)", detail: "Escalation rule triggered", outcome: "no-response" },
          { time: "10:02", label: "SMS queued", detail: "+1 604 555 0192 via Twilio", outcome: "queued" },
          { time: "10:02", label: "SMS delivered", detail: "Delivery confirmed", outcome: "delivered" },
        ],
        nextStep: "Await response · reassess in 48h",
      },
      {
        id: "N-002", date: "14 May 2024",
        trigger: "First nudge — 60-day onboarding check",
        channel: ["email"], success: false,
        steps: [
          { time: "10:00", label: "Email sent", detail: "Subject: Your pathway update · sarah.jenkins@gmail.com", outcome: "delivered" },
          { time: "10:31", label: "No response (30m window)", detail: "No escalation rule active", outcome: "no-response" },
        ],
        nextStep: "Scheduled follow-up in 14 days",
      },
    ],
    activationLogs: [
      {
        id: "ACT-0042", timestamp: "11 Jun 2026 · 09:14",
        status: "active", outcome: "In progress",
        actions: ["Eligibility confirmed", "Email draft generated", "Email delivered", "SMS queued"],
      },
    ],
  },
  mark: {
    id: "mark", initials: "MZ", name: "Mark Zhao",
    pathway: "Federal Skilled Worker", addedDate: "02 Jan 2024",
    status: "close", statusLabel: "Close",
    crs: 421, workPermitExpiry: "6 months", workPermitWarn: false,
    daysInSystem: "526 days", billingRef: "b-38",
    narrative: "Mark is approaching CRS threshold. Canadian work experience still accumulating — reassess in 42 days.",
    profile: {
      "Immigration status": "Study permit",
      "Canadian work exp.": "8 months",
      "TEER category": "TEER 2",
      "Language": "CLB 8",
      "Province": "Ontario",
      "NOC": "41200 · Civil engineer",
    },
    eligibility: {
      eca_status: "missing",
      ee_profile_exists: true,
      ee_profile_last_updated: "2025-01-10",
      foreign_work_years: 3.5,
      foreign_trade_hours: null,
      has_qualifying_job_offer: false,
      has_trade_certificate: false,
      has_ontario_job_offer: false,
      oinp_student_context: true,
    },
    nudges: [
      {
        id: "N-001", date: "15 Jan 2024",
        trigger: "Onboarding check",
        channel: ["email"], success: true,
        steps: [
          { time: "09:00", label: "Email sent", detail: "Subject: Welcome to Tower · mark.zhao@mail.ca", outcome: "delivered" },
          { time: "09:45", label: "Client replied", detail: "Confirmed details", outcome: "replied" },
        ],
        nextStep: "Quarterly review scheduled",
      },
    ],
    activationLogs: [],
  },
  aisha: {
    id: "aisha", initials: "AK", name: "Aisha Khan",
    pathway: "Provincial Nominee Program", addedDate: "18 Feb 2024",
    status: "pending", statusLabel: "Under review",
    crs: 398, workPermitExpiry: "11 months", workPermitWarn: false,
    daysInSystem: "479 days", billingRef: "b-44",
    narrative: "Aisha's PNP nomination is under review. Language scores may benefit from reassessment before the next draw.",
    profile: {
      "Immigration status": "PGWP",
      "Canadian work exp.": "22 months",
      "TEER category": "TEER 3",
      "Language": "CLB 7",
      "Province": "Ontario",
      "NOC": "32102 · Medical lab tech",
    },
    eligibility: {
      eca_status: "valid",
      ee_profile_exists: false,
      ee_profile_last_updated: null,
      foreign_work_years: 1,
      foreign_trade_hours: null,
      has_qualifying_job_offer: true,
      has_trade_certificate: false,
      has_ontario_job_offer: true,
      oinp_student_context: true,
    },
    nudges: [],
    activationLogs: [],
  },
  marcus: {
    id: "marcus",
    initials: "MW",
    name: "Marcus Webb",
    pathway: "Express Entry · FSW",
    addedDate: "8 Mar 2024",
    status: "eligible",
    statusLabel: "Eligible",
    crs: 439,
    workPermitExpiry: "62 days",
    workPermitWarn: true,
    daysInSystem: "462 days",
    billingRef: "b-61",
    narrative: "Marcus opted in Mar 2024, completed two nudge cycles (Jan and Apr 2026), and is now in active reactivation after permit window tightened.",
    profile: {
      "Immigration status": "Work permit",
      "Canadian work exp.": "11 months",
      "TEER category": "TEER 1",
      "Language": "CLB 8",
      "Province": "Ontario",
      "NOC": "21231 · Data scientist",
    },
    eligibility: {
      eca_status: "expired",
      ee_profile_exists: true,
      ee_profile_last_updated: "2026-04-02",
      foreign_work_years: 4,
      foreign_trade_hours: 1800,
      has_qualifying_job_offer: false,
      has_trade_certificate: true,
      has_ontario_job_offer: false,
      oinp_student_context: false,
    },
    nudges: [
      {
        id: "N-M01",
        date: "14 Jan 2026",
        trigger: "Profile incomplete · 90-day check",
        channel: ["email", "sms"],
        success: true,
        steps: [
          { time: "09:10", label: "Email sent", outcome: "delivered" },
          { time: "09:42", label: "Form submitted", outcome: "replied" },
        ],
        nextStep: "Closed · criteria met",
      },
      {
        id: "N-M02",
        date: "3 Apr 2026",
        trigger: "CRS within 5 of threshold",
        channel: ["email", "sms"],
        success: true,
        steps: [
          { time: "08:55", label: "Email sent", outcome: "delivered" },
          { time: "10:12", label: "Link clicked", outcome: "replied" },
        ],
        nextStep: "Closed · booked follow-up",
      },
    ],
    activationLogs: [
      {
        id: "ACT-M042",
        timestamp: "9 Jun 2026 · 09:02",
        status: "active",
        outcome: "Reactivation in progress",
        actions: ["SMS primer delivered", "Eligibility email sent", "Email opened"],
      },
    ],
  },
};

export function getClientDetail(id: string): ClientDetail {
  return clientDetails[id] ?? clientDetails["sarah"];
}

export function getClientMeta(id: string): ClientMeta {
  return clientList.find((c) => c.id === id) ?? clientList[0];
}
