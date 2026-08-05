export type LiveBriefFact = {
  label: string;
  value: string;
  signal: string;
  signalHint?: string;
};

export type LiveBriefMeeting = {
  id: string;
  clientId: string;
  contactName: string;
  time: string;
  status: "Upcoming" | "Tentative" | "In progress";
  phase: string;
  purpose: string;
  highlight?: string;
  startsIn?: string;
  asOf?: string;
  overview: string;
  pathway: string;
  observation: string;
  facts?: LiveBriefFact[];
};

export const DEMO_MEETINGS: LiveBriefMeeting[] = [
  {
    id: "m1",
    clientId: "sarah",
    contactName: "Sarah Chen",
    time: "Thu 2:00 PM",
    status: "Upcoming",
    phase: "Meeting-ready",
    purpose: "Discovery · Express Entry / CEC",
    highlight: "Work permit · 47 days",
    startsIn: "in 2h 14m",
    asOf: "As of · write-back 11:02",
    overview:
      "Sarah is a software engineer on a Canadian work permit pursuing PR through Express Entry CEC. File is clean; CRS sits above the recent CEC draw line. Activation window is now.",
    pathway:
      "Qualifies under CEC on 12+ months skilled work (TEER 1), CLB 9, and valid TR status. Primary risk is timing — permit lapse before ITA would break CEC eligibility until status is renewed.",
    observation:
      "Meeting-grade brief for take-meeting. Close the loop on permit timing; she does not need chasing — she needs a consultant decision in session.",
    facts: [
      {
        label: "Work permit end",
        value: "Sep 15, 2026",
        signal: "Timing risk",
        signalHint: "Permit window may close before ITA",
      },
      {
        label: "CRS estimate",
        value: "487",
        signal: "Above CEC line",
        signalHint: "Score above recent CEC draw cutoff",
      },
      {
        label: "CLB lowest",
        value: "CLB 9",
        signal: "Language met",
        signalHint: "Language threshold satisfied",
      },
      {
        label: "EE pool",
        value: "In pool · Jan refresh",
        signal: "Current",
        signalHint: "Profile refreshed in current pool window",
      },
    ],
  },
  {
    id: "m2",
    clientId: "james",
    contactName: "James Okonkwo",
    time: "Fri 10:30 AM",
    status: "Upcoming",
    phase: "Meeting-ready",
    purpose: "Pathway review · FSW → CEC",
    highlight: "CRS 421 · below recent FSW",
    startsIn: "Fri · 10:30 AM",
    asOf: "As of · write-back yesterday",
    overview:
      "James is accumulating Canadian work experience toward the 12-month CEC mark. Current FSW CRS sits below recent draws; stream switch is the forward path.",
    pathway:
      "Language meets both streams. TEER-eligible occupation. Reassessment triggers at the work-history milestone — not a chase activation today.",
    observation:
      "Use the session to confirm documentation readiness for the stream switch and set expectations on timing. No illegal/unethical motion on this file.",
    facts: [
      {
        label: "Canadian work months",
        value: "9 of 12",
        signal: "CEC pending",
        signalHint: "CEC eligibility pending work months",
      },
      {
        label: "CRS (FSW)",
        value: "421",
        signal: "Below FSW draw",
        signalHint: "Below recent FSW cutoffs",
      },
      {
        label: "Language",
        value: "CLB 8",
        signal: "Meets both streams",
        signalHint: "Language meets FSW and CEC",
      },
    ],
  },
  {
    id: "m3",
    clientId: "priya",
    contactName: "Priya Nair",
    time: "Next week · TBD",
    status: "Tentative",
    phase: "In motion",
    purpose: "Brief follow-up · PNP nomination",
    highlight: "Nomination under review",
    startsIn: "Next week · TBD",
    asOf: "As of · pre-book snapshot",
    overview:
      "Priya's provincial nomination remains under review. Federal profile alone is not competitive; nomination is the critical path item.",
    pathway:
      "Monitor nomination decision. Language reassessment (CLB step-up) is the hedge if processing continues to slip.",
    observation:
      "Tentative booking — confirm attendance before deep prep. Live brief still loads so the desk can refuse or proceed with eyes open.",
    facts: [
      {
        label: "PNP status",
        value: "Under review",
        signal: "Critical path",
        signalHint: "Nomination is the blocking item",
      },
      {
        label: "Federal CRS alone",
        value: "Not competitive",
        signal: "Needs nomination",
        signalHint: "Federal score needs nomination lift",
      },
    ],
  },
];

export const CONSULTANT_TODAY_MEETINGS = DEMO_MEETINGS
  .filter((m) => m.status === "Upcoming")
  .map((m) => ({
    id: m.id,
    contactName: m.contactName,
    time: m.time,
    clientId: m.clientId,
  }));

export const MEETING_READY_CLIENT_IDS = new Set(
  DEMO_MEETINGS.filter((m) => m.phase === "Meeting-ready").map((m) => m.clientId),
);
