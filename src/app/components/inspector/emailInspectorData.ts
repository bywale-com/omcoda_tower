import type { ThoughtStep, FormVisitOrigin } from "../../data/journeyTree";
import type { ClientMessageThread } from "./clientMessageData";
import { marcusMessageThread, sarahMessageThread } from "./clientMessageData";
import { formatNudgeTime, nudgeAt } from "../../data/sarahNudgeTimeline";
import { MARCUS_REACTIVATION_ID } from "../../data/marcusJourney";
import { OPT_IN_SEQUENCE_ID } from "../../data/optInLaunchTree";
import { SARAH_NUDGE_GROUP_ID } from "../../data/sarahNudgeTimeline";
import { REACTIVATION_SEQUENCE_ID } from "../../data/reactivationTree";

export function buildTypingEvents(
  fieldLabel: string,
  text: string,
  startMs = 0,
  msPerChar = 75,
): FormTypingEvent[] {
  return text.split("").map((_, index) => ({
    atMs: startMs + index * msPerChar,
    fieldLabel,
    value: text.slice(0, index + 1),
  }));
}

export function mergeCaptureEvents(captures: NodeFormCapture[], gapMs = 900): FormTypingEvent[] {
  const merged: FormTypingEvent[] = [];
  let offset = 0;
  for (const capture of captures) {
    for (const event of capture.events) {
      merged.push({ ...event, atMs: offset + event.atMs });
    }
    const lastAt = capture.events[capture.events.length - 1]?.atMs ?? 0;
    offset += lastAt + gapMs;
  }
  return merged;
}

export type NodeInspectorTab = "overview" | "metadata";

export type NodeInspectorStatus = "complete" | "in_progress" | "armed" | "historical";

export type NodeTelemetryEvent = {
  label: string;
  timestamp: string;
  status: "complete" | "pending" | "inactive";
  durationFromPrev?: string;
};

export type NodeOutputContent = {
  from: string;
  to: string;
  subject: string;
  headline: string;
  body: string;
  ctaLabel: string;
  watermark?: string;
  progress?: {
    percent: number;
    steps: Array<{ label: string; done: boolean }>;
  };
};

export type NodeThreadKind = "reply" | "followup" | "sent" | "opened";

export type NodeThreadItem = {
  id: string;
  actor: string;
  target: string;
  at: string;
  subject: string;
  snippet: string;
  kind: NodeThreadKind;
  output: NodeOutputContent;
};

export type NodeDecision = {
  scheduledLabel: string;
  at: string;
};

export type NodeNavigationLink = {
  touchpointId: string;
  label: string;
};

export type FormTypingEvent = {
  atMs: number;
  fieldLabel: string;
  value: string;
};

export type FormCompositeTelemetry = {
  label: string;
  count: number;
  timestamps: string[];
  status: "complete" | "pending" | "inactive";
};

export type NodeFormSessionReplay = {
  durationSec: number;
  events: FormTypingEvent[];
};

export type NodeFormCapture = {
  id: string;
  actor: string;
  at: string;
  fieldLabel: string;
  snippet: string;
  durationSec: number;
  events: FormTypingEvent[];
};

export type NodeFormField = {
  label: string;
  value?: string;
  placeholder?: string;
  filled?: boolean;
};

export type NodeFormOutputContent = {
  title: string;
  description?: string;
  url?: string;
  watermark?: string;
  fields: NodeFormField[];
  submitLabel: string;
  progress?: {
    percent: number;
    steps: Array<{ label: string; done: boolean }>;
  };
};

export type NodeChannelType = "email" | "form" | "sms";

type NodeInspectorBase = {
  touchpointId: string;
  sequenceId: string;
  nodeTitle: string;
  channelLabel: string;
  channelType: NodeChannelType;
  status: NodeInspectorStatus;
  statusLabel: string;
  telemetry: NodeTelemetryEvent[];
  threads: NodeThreadItem[];
  decision?: NodeDecision;
  navigation?: {
    prev?: NodeNavigationLink;
    next?: NodeNavigationLink;
  };
  rules?: {
    rule: string;
    waitWindow?: string;
    scheduledAction?: string;
    thoughtChain: ThoughtStep[];
  };
};

export type EmailNodeInspectorPayload = NodeInspectorBase & {
  channelType: "email";
  output: NodeOutputContent;
};

export type FormNodeInspectorPayload = NodeInspectorBase & {
  channelType: "form";
  formScope: "core" | "session";
  visitOrigin?: FormVisitOrigin;
  sourceEmailLabel?: string;
  output: NodeFormOutputContent;
  captures: NodeFormCapture[];
  compositeTelemetry?: FormCompositeTelemetry[];
  sessionReplay?: NodeFormSessionReplay;
};

export type TextNodeInspectorPayload = NodeInspectorBase & {
  channelType: "sms";
  messageThread: ClientMessageThread;
};

export type NodeInspectorPayload =
  | EmailNodeInspectorPayload
  | FormNodeInspectorPayload
  | TextNodeInspectorPayload;

/** @deprecated use NodeInspectorPayload */
export type EmailInspectorPayload = NodeInspectorPayload;

const SARAH_TO = "Sarah J. <sarah.j@example.com>";
const MARCUS_TO = "Marcus W. <marcus.webb@example.com>";
const FROM = "Tower Immigration <noreply@tower.app>";

const PERMIT_OUTPUT: NodeOutputContent = {
  from: FROM,
  to: SARAH_TO,
  subject: "Reminder: complete your permit application",
  headline: "Your permit application is waiting",
  body: "Hi Sarah — you started your permit checklist but haven't finished the employment section. Pick up where you left off; it only takes a few minutes.",
  ctaLabel: "Resume application",
  progress: {
    percent: 68,
    steps: [
      { label: "Personal", done: true },
      { label: "Documents", done: true },
      { label: "Employment", done: false },
      { label: "Review", done: false },
    ],
  },
};

const SARAH_REPLY_OUTPUT: NodeOutputContent = {
  from: SARAH_TO,
  to: FROM,
  subject: "Re: Reminder: complete your permit application",
  headline: "",
  body: "Hi, thanks for the reminder! I just finished the employment section and uploaded my offer letter. Should I book a review call now or wait for your team to check the documents first?",
  ctaLabel: "",
};

const TOWER_FOLLOWUP_OUTPUT: NodeOutputContent = {
  from: FROM,
  to: SARAH_TO,
  subject: "Re: Reminder: complete your permit application",
  headline: "Documents received — you're almost there",
  body: "Hi Sarah — we received your employment documents. Your application is now at 92%. Book a 15-minute review call to finalize your submission.",
  ctaLabel: "Book review call",
};

const OPT_IN_OUTPUT = {
  from: FROM,
  to: SARAH_TO,
  subject: "You're on the list — Tower Immigration early access",
  headline: "Welcome to the waitlist",
  body: "Thanks for your interest. We'll notify you when your consultant slot opens. In the meantime, follow us for product updates.",
  ctaLabel: "View waitlist status",
};

const REACTIVATION_OUTPUT = {
  from: FROM,
  to: SARAH_TO,
  subject: "Let's get your file moving again",
  headline: "We saved your progress",
  body: "Your permit checklist is still on file. Book a short call or resume the form — we'll walk you through the remaining steps.",
  ctaLabel: "Book a call",
  watermark: "Armed template — not sent",
};

const MARCUS_REACTIVATION_OUTPUT = {
  from: FROM,
  to: MARCUS_TO,
  subject: "Your pathway is ready — view without logging in",
  headline: "Eligibility confirmed",
  body: "Hi Marcus — your CRS score is above the current threshold. Click below to see your summary and book a consultant slot.",
  ctaLabel: "View eligibility",
};

const NODE_INSPECTOR_BY_ID: Record<string, Omit<NodeInspectorPayload, "touchpointId" | "sequenceId">> = {
  "n-001-r1-e": {
    channelType: "email",
    nodeTitle: "Email",
    channelLabel: "Email · Round 1",
    status: "complete",
    statusLabel: "Completed",
    output: PERMIT_OUTPUT,
    threads: [],
    navigation: {
      prev: { touchpointId: "oi-email", label: "Opt-in" },
      next: { touchpointId: "n-001-r1-f", label: "Form" },
    },
    telemetry: [
      { label: "Triggered", timestamp: formatNudgeTime(nudgeAt(0, 9, 35)), status: "complete" },
      { label: "Sent", timestamp: formatNudgeTime(nudgeAt(0, 9, 35)), status: "complete", durationFromPrev: "0ms" },
      { label: "Delivered", timestamp: formatNudgeTime(nudgeAt(0, 9, 36)), status: "complete", durationFromPrev: "1.2s" },
      { label: "Opened", timestamp: formatNudgeTime(nudgeAt(0, 11, 36)), status: "complete", durationFromPrev: "2h 0m" },
      { label: "Clicked", timestamp: formatNudgeTime(nudgeAt(1, 10, 8)), status: "complete", durationFromPrev: "22h 32m" },
    ],
  },
  "n-001-r1-f-att1-e": {
    channelType: "email",
    nodeTitle: "Email",
    channelLabel: "Email · Attempt 1",
    status: "complete",
    statusLabel: "Completed",
    output: PERMIT_OUTPUT,
    navigation: {
      prev: { touchpointId: "n-001-r1-f-att1-t", label: "Text" },
      next: { touchpointId: "n-001-r1-f-v2", label: "Form visit" },
    },
    threads: [
      {
        id: "th-att1-2",
        actor: "Sarah J.",
        target: "Tower Immigration",
        at: formatNudgeTime(nudgeAt(1, 10, 22)),
        subject: "Re: Reminder: complete your permit application",
        snippet: "Hi, thanks for the reminder! I just finished the employment section and uploaded my offer letter...",
        kind: "reply",
        output: SARAH_REPLY_OUTPUT,
      },
      {
        id: "th-att1-3",
        actor: "You",
        target: "Sarah J.",
        at: formatNudgeTime(nudgeAt(1, 11, 5)),
        subject: "Re: Reminder: complete your permit application",
        snippet: "Hi Sarah — we received your employment documents. Your application is now at 92%...",
        kind: "followup",
        output: TOWER_FOLLOWUP_OUTPUT,
      },
    ],
    telemetry: [
      { label: "Triggered", timestamp: formatNudgeTime(nudgeAt(2, 14, 0)), status: "complete" },
      { label: "Sent", timestamp: formatNudgeTime(nudgeAt(2, 14, 0)), status: "complete", durationFromPrev: "0ms" },
      { label: "Delivered", timestamp: formatNudgeTime(nudgeAt(2, 14, 1)), status: "complete", durationFromPrev: "1.1s" },
      { label: "Opened", timestamp: formatNudgeTime(nudgeAt(2, 14, 22)), status: "complete", durationFromPrev: "21m" },
      { label: "Clicked", timestamp: "—", status: "inactive" },
    ],
  },
  "n-001-r1-f-att3-e": {
    channelType: "email",
    nodeTitle: "Email",
    channelLabel: "Email · Attempt 3",
    status: "complete",
    statusLabel: "Completed",
    output: PERMIT_OUTPUT,
    navigation: {
      prev: { touchpointId: "n-001-r1-f-att3-t", label: "Text" },
      next: { touchpointId: "n-001-r1-f-att3-f", label: "Form" },
    },
    threads: [
      {
        id: "th-att3-1",
        actor: "Sarah J.",
        target: "Tower Immigration",
        at: formatNudgeTime(nudgeAt(3, 14, 45)),
        subject: "Re: Reminder: complete your permit application",
        snippet: "Hi, thanks for the reminder! Uploading my offer letter now...",
        kind: "reply",
        output: SARAH_REPLY_OUTPUT,
      },
    ],
    telemetry: [
      { label: "Triggered", timestamp: formatNudgeTime(nudgeAt(3, 14, 0)), status: "complete" },
      { label: "Sent", timestamp: formatNudgeTime(nudgeAt(3, 14, 0)), status: "complete", durationFromPrev: "0ms" },
      { label: "Delivered", timestamp: formatNudgeTime(nudgeAt(3, 14, 1)), status: "complete", durationFromPrev: "1.1s" },
      { label: "Opened", timestamp: formatNudgeTime(nudgeAt(3, 14, 18)), status: "complete", durationFromPrev: "17m" },
      { label: "Clicked", timestamp: formatNudgeTime(nudgeAt(3, 14, 28)), status: "complete", durationFromPrev: "10m" },
    ],
  },
  "oi-email": {
    channelType: "email",
    nodeTitle: "Email",
    channelLabel: "Email · Opt-in launch",
    status: "historical",
    statusLabel: "Completed",
    output: OPT_IN_OUTPUT,
    threads: [],
    navigation: {
      next: { touchpointId: "n-001-r1-e", label: "Round 1" },
    },
    telemetry: [
      { label: "Triggered", timestamp: "Mar 15 · 9:22am", status: "complete" },
      { label: "Sent", timestamp: "Mar 15 · 9:22am", status: "complete", durationFromPrev: "0ms" },
      { label: "Delivered", timestamp: "Mar 15 · 9:22am", status: "complete", durationFromPrev: "0.8s" },
      { label: "Opened", timestamp: "Mar 15 · 10:04am", status: "complete", durationFromPrev: "42m" },
      { label: "Clicked", timestamp: "Mar 15 · 10:11am", status: "complete", durationFromPrev: "7m" },
    ],
  },
  "m-oi-email": {
    channelType: "email",
    nodeTitle: "Email",
    channelLabel: "Email · Opt-in launch",
    status: "historical",
    statusLabel: "Completed",
    output: { ...OPT_IN_OUTPUT, to: MARCUS_TO },
    threads: [],
    navigation: {
      next: { touchpointId: "m-r-email", label: "Reactivation" },
    },
    telemetry: [
      { label: "Triggered", timestamp: "Mar 8 '24 · 9:10am", status: "complete" },
      { label: "Sent", timestamp: "Mar 8 '24 · 9:10am", status: "complete", durationFromPrev: "0ms" },
      { label: "Delivered", timestamp: "Mar 8 '24 · 9:10am", status: "complete", durationFromPrev: "0.9s" },
      { label: "Opened", timestamp: "Mar 8 '24 · 9:48am", status: "complete", durationFromPrev: "38m" },
      { label: "Clicked", timestamp: "Mar 8 '24 · 9:51am", status: "complete", durationFromPrev: "3m" },
    ],
  },
  "r-email": {
    channelType: "email",
    nodeTitle: "Email",
    channelLabel: "Email · Reactivation",
    status: "armed",
    statusLabel: "Armed",
    output: REACTIVATION_OUTPUT,
    threads: [],
    telemetry: [
      { label: "Triggered", timestamp: "—", status: "inactive" },
      { label: "Sent", timestamp: "—", status: "inactive" },
      { label: "Delivered", timestamp: "—", status: "inactive" },
      { label: "Opened", timestamp: "—", status: "inactive" },
      { label: "Clicked", timestamp: "—", status: "inactive" },
    ],
    rules: {
      rule: "Form submitted without booking — reactivation sequence arms",
      scheduledAction: "Eligibility email on Day 0",
      thoughtChain: [
        {
          id: "r-thought-1",
          durationSec: 4,
          label: "Eligibility check",
          rationale: "Sarah submitted permit form Jun 13 2:30pm. Booking slot not claimed within 24h. Reactivation template armed.",
        },
      ],
    },
  },
  "m-r-email": {
    channelType: "email",
    nodeTitle: "Email",
    channelLabel: "Email · Reactivation",
    status: "in_progress",
    statusLabel: "In progress",
    output: MARCUS_REACTIVATION_OUTPUT,
    navigation: {
      prev: { touchpointId: "m-oi-email", label: "Opt-in" },
      next: { touchpointId: "m-r-form", label: "Form" },
    },
    threads: [
      {
        id: "m-r-th-1",
        actor: "Marcus W.",
        target: "Tower Immigration",
        at: "Jun 9 · 10:52am",
        subject: "Re: Your pathway is ready — view without logging in",
        snippet: "Thanks — I'll review this tonight and book a slot tomorrow.",
        kind: "reply",
        output: {
          from: MARCUS_TO,
          to: FROM,
          subject: "Re: Your pathway is ready — view without logging in",
          headline: "",
          body: "Thanks — I'll review this tonight and book a slot tomorrow.",
          ctaLabel: "",
        },
      },
    ],
    telemetry: [
      { label: "Triggered", timestamp: "Jun 9 · 9:18am", status: "complete" },
      { label: "Sent", timestamp: "Jun 9 · 9:18am", status: "complete", durationFromPrev: "0ms" },
      { label: "Delivered", timestamp: "Jun 9 · 9:18am", status: "complete", durationFromPrev: "1.0s" },
      { label: "Opened", timestamp: "Jun 9 · 10:41am", status: "complete", durationFromPrev: "1h 23m" },
      { label: "Clicked", timestamp: "—", status: "pending" },
    ],
    rules: {
      rule: "Permit window < 90 days · CRS above threshold",
      scheduledAction: "Nurture email on Day 1 if no booking",
      thoughtChain: [
        {
          id: "m-r-thought-1",
          durationSec: 5,
          label: "Reactivation sequence started",
          rationale: "Two prior nudges completed. Permit at 62 days. Eligibility email sent Day 0.",
        },
      ],
    },
  },
};

const PERMIT_FORM_OUTPUT: NodeFormOutputContent = {
  title: "Permit application checklist",
  description: "Complete each section to submit your work permit application.",
  url: "forms.tower.app/permit/checklist",
  fields: [
    { label: "Full legal name", value: "Sarah Johnson" },
    { label: "Passport number", value: "••••4821" },
    { label: "Current employer", value: "Northwind Analytics Inc." },
    { label: "Employment offer letter", value: "offer-letter.pdf · uploaded" },
    { label: "Intended start date", value: "Sep 1, 2026" },
  ],
  submitLabel: "Submit application",
  progress: {
    percent: 100,
    steps: [
      { label: "Personal", done: true },
      { label: "Documents", done: true },
      { label: "Employment", done: true },
      { label: "Review", done: true },
    ],
  },
};

const WAITLIST_FORM_OUTPUT: NodeFormOutputContent = {
  title: "Early access waitlist",
  description: "Join the Tower Immigration waitlist for consultant matching.",
  url: "forms.tower.app/waitlist",
  fields: [
    { label: "Full name", value: "Sarah Johnson" },
    { label: "Email", value: "sarah.j@example.com" },
    { label: "Pathway interest", value: "Work permit · Canada" },
    { label: "Consent", value: "Marketing and product updates accepted" },
  ],
  submitLabel: "Join waitlist",
  progress: {
    percent: 100,
    steps: [
      { label: "Contact", done: true },
      { label: "Pathway", done: true },
      { label: "Consent", done: true },
    ],
  },
};

const BOOKING_FORM_OUTPUT: NodeFormOutputContent = {
  title: "Book a consultant slot",
  description: "Select a time to review your eligibility summary with a consultant.",
  url: "forms.tower.app/booking",
  watermark: "Armed template — not live",
  fields: [
    { label: "Consultant", placeholder: "Select consultant", filled: false },
    { label: "Preferred date", placeholder: "Choose a date", filled: false },
    { label: "Time slot", placeholder: "Choose a time", filled: false },
  ],
  submitLabel: "Confirm booking",
  progress: {
    percent: 0,
    steps: [
      { label: "Consultant", done: false },
      { label: "Schedule", done: false },
      { label: "Confirm", done: false },
    ],
  },
};

const SARAH_PERMIT_CAPTURES: NodeFormCapture[] = [
  {
    id: "cap-f-1",
    actor: "Sarah J.",
    at: formatNudgeTime(nudgeAt(1, 10, 32)),
    fieldLabel: "Current employer",
    snippet: "Northwind Anal…",
    durationSec: 18,
    events: buildTypingEvents("Current employer", "Northwind Anal", 0, 75),
  },
  {
    id: "cap-f-2",
    actor: "Sarah J.",
    at: formatNudgeTime(nudgeAt(3, 9, 55)),
    fieldLabel: "Job title",
    snippet: "Senior Data Analyst",
    durationSec: 14,
    events: buildTypingEvents("Job title", "Senior Data Analyst", 0, 80),
  },
  {
    id: "cap-f-3",
    actor: "Sarah J.",
    at: formatNudgeTime(nudgeAt(3, 14, 44)),
    fieldLabel: "Current employer",
    snippet: "Northwind Analytics Inc.",
    durationSec: 28,
    events: buildTypingEvents("Current employer", "Northwind Analytics Inc."),
  },
  {
    id: "cap-f-4",
    actor: "Sarah J.",
    at: formatNudgeTime(nudgeAt(3, 14, 52)),
    fieldLabel: "Intended start date",
    snippet: "Sep 1, 2026",
    durationSec: 12,
    events: buildTypingEvents("Intended start date", "Sep 1, 2026", 0, 90),
  },
  {
    id: "cap-f-5",
    actor: "Sarah J.",
    at: formatNudgeTime(nudgeAt(3, 15, 2)),
    fieldLabel: "Employment offer letter",
    snippet: "offer-letter.pdf · uploaded",
    durationSec: 6,
    events: buildTypingEvents("Employment offer letter", "offer-letter.pdf · uploaded", 0, 55),
  },
];

const SARAH_WAITLIST_CAPTURES: NodeFormCapture[] = [
  {
    id: "cap-oi-1",
    actor: "Sarah J.",
    at: "Mar 15 · 10:14am",
    fieldLabel: "Pathway interest",
    snippet: "Work permit · Canada",
    durationSec: 15,
    events: buildTypingEvents("Pathway interest", "Work permit · Canada"),
  },
];

const MARCUS_WAITLIST_CAPTURES: NodeFormCapture[] = [
  {
    id: "cap-m-oi-1",
    actor: "Marcus W.",
    at: "Mar 8 '24 · 9:55am",
    fieldLabel: "Pathway interest",
    snippet: "Express Entry · Canada",
    durationSec: 18,
    events: buildTypingEvents("Pathway interest", "Express Entry · Canada"),
  },
];

const SARAH_SESSION_2_CAPTURES = SARAH_PERMIT_CAPTURES.slice(1, 2);
const SARAH_SESSION_3_CAPTURES = SARAH_PERMIT_CAPTURES.slice(2);

function sessionReplayFromCaptures(captures: NodeFormCapture[]): NodeFormSessionReplay {
  const events = mergeCaptureEvents(captures);
  const lastAt = events[events.length - 1]?.atMs ?? 0;
  return {
    durationSec: Math.max(1, Math.ceil(lastAt / 1000)),
    events,
  };
}

const FORM_INSPECTOR_BY_ID: Record<string, Omit<FormNodeInspectorPayload, "touchpointId" | "sequenceId">> = {
  "n-001-r1-f": {
    channelType: "form",
    formScope: "core",
    nodeTitle: "Form",
    channelLabel: "Form · Round 1",
    status: "complete",
    statusLabel: "Completed",
    output: PERMIT_FORM_OUTPUT,
    threads: [],
    captures: SARAH_PERMIT_CAPTURES,
    compositeTelemetry: [
      {
        label: "Opened",
        count: 3,
        timestamps: [
          formatNudgeTime(nudgeAt(1, 10, 10)),
          formatNudgeTime(nudgeAt(3, 9, 38)),
          formatNudgeTime(nudgeAt(3, 14, 30)),
        ],
        status: "complete",
      },
      {
        label: "Started",
        count: 3,
        timestamps: [
          formatNudgeTime(nudgeAt(1, 10, 26)),
          formatNudgeTime(nudgeAt(3, 9, 50)),
          formatNudgeTime(nudgeAt(3, 14, 38)),
        ],
        status: "complete",
      },
      {
        label: "Submitted",
        count: 1,
        timestamps: [formatNudgeTime(nudgeAt(3, 15, 10))],
        status: "complete",
      },
    ],
    navigation: {
      prev: { touchpointId: "n-001-r1-e", label: "Email" },
      next: { touchpointId: "n-001-r1-f-v2", label: "Form visit" },
    },
    telemetry: [
      { label: "Triggered", timestamp: formatNudgeTime(nudgeAt(1, 10, 8)), status: "complete" },
      { label: "Opened", timestamp: formatNudgeTime(nudgeAt(1, 10, 10)), status: "complete", durationFromPrev: "2m" },
      { label: "Started", timestamp: formatNudgeTime(nudgeAt(1, 10, 26)), status: "complete", durationFromPrev: "16m" },
      { label: "Submitted", timestamp: formatNudgeTime(nudgeAt(3, 15, 10)), status: "complete" },
    ],
  },
  "n-001-r1-f-att3-f": {
    channelType: "form",
    formScope: "session",
    visitOrigin: "funnel",
    sourceEmailLabel: "Attempt 3 · Email",
    nodeTitle: "Form",
    channelLabel: "Form · Attempt 3",
    status: "complete",
    statusLabel: "Submitted",
    output: PERMIT_FORM_OUTPUT,
    threads: [],
    captures: [],
    sessionReplay: sessionReplayFromCaptures(SARAH_SESSION_3_CAPTURES),
    decision: {
      scheduledLabel: "Reactivation scheduled",
      at: formatNudgeTime(nudgeAt(3, 15, 15)),
    },
    navigation: {
      prev: { touchpointId: "n-001-r1-f-att3-e", label: "Email" },
      next: { touchpointId: "n-001-r1-f", label: "Form" },
    },
    telemetry: [
      { label: "Opened", timestamp: formatNudgeTime(nudgeAt(3, 14, 30)), status: "complete" },
      { label: "Started", timestamp: formatNudgeTime(nudgeAt(3, 14, 38)), status: "complete", durationFromPrev: "8m" },
      { label: "Submitted", timestamp: formatNudgeTime(nudgeAt(3, 15, 10)), status: "complete", durationFromPrev: "32m" },
    ],
    rules: {
      rule: "Form submitted · nudge path complete",
      scheduledAction: "Reactivation sequence armed",
      thoughtChain: [
        {
          id: "esc-r1-f-s1",
          durationSec: 6,
          label: "Evaluating nudge outcome",
          rationale: "Form submitted Jun 14 3:10pm. Nudge 00f-nudge-001 closes successfully.",
        },
        {
          id: "esc-r1-f-s2",
          durationSec: 3,
          label: "Reactivation scheduled",
          rationale: "Next engagement cycle armed: 00f-reactivation-001 template queued.",
        },
      ],
    },
  },
  "n-001-r1-f-v2": {
    channelType: "form",
    formScope: "session",
    visitOrigin: "prior_email",
    sourceEmailLabel: "Attempt 1 · Email",
    nodeTitle: "Form",
    channelLabel: "Form · Priority visit",
    status: "in_progress",
    statusLabel: "Abandoned",
    output: PERMIT_FORM_OUTPUT,
    threads: [],
    captures: [],
    sessionReplay: sessionReplayFromCaptures(SARAH_SESSION_2_CAPTURES),
    navigation: {
      prev: { touchpointId: "n-001-r1-f", label: "Form" },
      next: { touchpointId: "n-001-r1-f-att3", label: "Attempt 3" },
    },
    telemetry: [
      { label: "Opened", timestamp: formatNudgeTime(nudgeAt(3, 9, 38)), status: "complete" },
      { label: "Started", timestamp: formatNudgeTime(nudgeAt(3, 9, 50)), status: "complete", durationFromPrev: "12m" },
      { label: "Submitted", timestamp: "—", status: "inactive" },
    ],
  },
  "oi-form": {
    channelType: "form",
    formScope: "core",
    nodeTitle: "Form",
    channelLabel: "Form · Opt-in launch",
    status: "historical",
    statusLabel: "Completed",
    output: WAITLIST_FORM_OUTPUT,
    threads: [],
    captures: SARAH_WAITLIST_CAPTURES,
    navigation: {
      next: { touchpointId: "oi-email", label: "Email" },
    },
    telemetry: [
      { label: "Triggered", timestamp: "Mar 15 · 10:11am", status: "complete" },
      { label: "Opened", timestamp: "Mar 15 · 10:12am", status: "complete", durationFromPrev: "1m" },
      { label: "Started", timestamp: "Mar 15 · 10:13am", status: "complete", durationFromPrev: "1m" },
      { label: "Submitted", timestamp: "Mar 16 · 9:22am", status: "complete", durationFromPrev: "23h 9m" },
    ],
  },
  "m-oi-form": {
    channelType: "form",
    formScope: "core",
    nodeTitle: "Form",
    channelLabel: "Form · Opt-in launch",
    status: "historical",
    statusLabel: "Completed",
    output: { ...WAITLIST_FORM_OUTPUT, fields: [
      { label: "Full name", value: "Marcus Webb" },
      { label: "Email", value: "marcus.webb@example.com" },
      { label: "Pathway interest", value: "Express Entry · Canada" },
      { label: "Consent", value: "Marketing and product updates accepted" },
    ] },
    threads: [],
    captures: MARCUS_WAITLIST_CAPTURES,
    navigation: {
      next: { touchpointId: "m-oi-email", label: "Email" },
    },
    telemetry: [
      { label: "Triggered", timestamp: "Mar 8 '24 · 9:51am", status: "complete" },
      { label: "Opened", timestamp: "Mar 8 '24 · 9:52am", status: "complete", durationFromPrev: "1m" },
      { label: "Started", timestamp: "Mar 8 '24 · 9:54am", status: "complete", durationFromPrev: "2m" },
      { label: "Submitted", timestamp: "Mar 9 '24 · 9:10am", status: "complete", durationFromPrev: "23h 16m" },
    ],
  },
  "r-form": {
    channelType: "form",
    formScope: "core",
    nodeTitle: "Form",
    channelLabel: "Form · Reactivation",
    status: "armed",
    statusLabel: "Armed",
    output: BOOKING_FORM_OUTPUT,
    threads: [],
    captures: [],
    telemetry: [
      { label: "Triggered", timestamp: "—", status: "inactive" },
      { label: "Opened", timestamp: "—", status: "inactive" },
      { label: "Started", timestamp: "—", status: "inactive" },
      { label: "Submitted", timestamp: "—", status: "inactive" },
    ],
    rules: {
      rule: "Booking slot opens Day 3 of reactivation",
      scheduledAction: "Consultant calendar unlocks",
      thoughtChain: [
        {
          id: "r-form-thought-1",
          durationSec: 4,
          label: "Booking form armed",
          rationale: "Reactivation Day 3 slot template prepared. Unlocks after nurture email sequence.",
        },
      ],
    },
  },
  "m-r-form": {
    channelType: "form",
    formScope: "core",
    nodeTitle: "Form",
    channelLabel: "Form · Reactivation",
    status: "in_progress",
    statusLabel: "Scheduled",
    output: {
      ...BOOKING_FORM_OUTPUT,
      watermark: undefined,
      description: "Opens after eligibility email engagement window.",
      fields: [
        { label: "Consultant", placeholder: "Unlocks Jun 12", filled: false },
        { label: "Preferred date", placeholder: "Not yet available", filled: false },
        { label: "Time slot", placeholder: "Not yet available", filled: false },
      ],
    },
    threads: [],
    captures: [],
    navigation: {
      prev: { touchpointId: "m-r-email", label: "Email" },
    },
    telemetry: [
      { label: "Triggered", timestamp: "Jun 9 · 9:18am", status: "complete" },
      { label: "Opened", timestamp: "—", status: "pending" },
      { label: "Started", timestamp: "—", status: "inactive" },
      { label: "Submitted", timestamp: "—", status: "inactive" },
    ],
  },
};

const TEXT_INSPECTOR_BY_ID: Record<string, Omit<TextNodeInspectorPayload, "touchpointId" | "sequenceId">> = {
  "n-001-r1-t": {
    channelType: "sms",
    nodeTitle: "Text",
    channelLabel: "Text · Round 1",
    status: "complete",
    statusLabel: "Delivered",
    messageThread: sarahMessageThread("msg-r1-text"),
    threads: [],
    navigation: {
      next: { touchpointId: "n-001-r1-e", label: "Email" },
    },
    telemetry: [
      { label: "Triggered", timestamp: formatNudgeTime(nudgeAt(0, 9, 0)), status: "complete" },
      { label: "Sent", timestamp: formatNudgeTime(nudgeAt(0, 9, 0)), status: "complete", durationFromPrev: "0ms" },
      { label: "Delivered", timestamp: formatNudgeTime(nudgeAt(0, 9, 2)), status: "complete", durationFromPrev: "2s" },
      { label: "Opened", timestamp: "—", status: "inactive" },
    ],
    decision: {
      scheduledLabel: "Email scheduled",
      at: formatNudgeTime(nudgeAt(0, 9, 35)),
    },
    rules: {
      rule: "Text delivered, not opened in 30min",
      waitWindow: "30 minutes",
      scheduledAction: "Email scheduled",
      thoughtChain: [
        {
          id: "esc-r1-t-s1",
          durationSec: 6,
          label: "Monitoring text open window",
          rationale: "Delivered 09:02. 30-minute open window active. No read receipt by 09:30. Rule R-01 applies.",
        },
        {
          id: "esc-r1-t-s2",
          durationSec: 3,
          label: "Email scheduled",
          rationale: "Channel switch: text → email. Queuing permit reminder with #permit tag for 09:35 send.",
        },
      ],
    },
  },
  "n-001-r1-f-att1-t": {
    channelType: "sms",
    nodeTitle: "Text",
    channelLabel: "Text · Attempt 1",
    status: "complete",
    statusLabel: "Opened",
    messageThread: sarahMessageThread("msg-att1-text"),
    threads: [],
    navigation: {
      next: { touchpointId: "n-001-r1-f-att1-e", label: "Email" },
    },
    telemetry: [
      { label: "Triggered", timestamp: formatNudgeTime(nudgeAt(2, 11, 0)), status: "complete" },
      { label: "Sent", timestamp: formatNudgeTime(nudgeAt(2, 11, 0)), status: "complete", durationFromPrev: "0ms" },
      { label: "Delivered", timestamp: formatNudgeTime(nudgeAt(2, 11, 2)), status: "complete", durationFromPrev: "2s" },
      { label: "Opened", timestamp: formatNudgeTime(nudgeAt(2, 11, 18)), status: "complete", durationFromPrev: "16m" },
    ],
  },
  "n-001-r1-f-att2-t": {
    channelType: "sms",
    nodeTitle: "Text",
    channelLabel: "Text · Attempt 2",
    status: "in_progress",
    statusLabel: "Delivered",
    messageThread: sarahMessageThread("msg-att2-text"),
    threads: [],
    telemetry: [
      { label: "Triggered", timestamp: formatNudgeTime(nudgeAt(3, 9, 0)), status: "complete" },
      { label: "Sent", timestamp: formatNudgeTime(nudgeAt(3, 9, 0)), status: "complete", durationFromPrev: "0ms" },
      { label: "Delivered", timestamp: formatNudgeTime(nudgeAt(3, 9, 2)), status: "complete", durationFromPrev: "2s" },
      { label: "Opened", timestamp: "—", status: "inactive" },
    ],
  },
  "n-001-r1-f-att3-t": {
    channelType: "sms",
    nodeTitle: "Text",
    channelLabel: "Text · Attempt 3",
    status: "complete",
    statusLabel: "Delivered",
    messageThread: sarahMessageThread("msg-att3-text"),
    threads: [],
    navigation: {
      next: { touchpointId: "n-001-r1-f-att3-e", label: "Email" },
    },
    telemetry: [
      { label: "Triggered", timestamp: formatNudgeTime(nudgeAt(3, 11, 0)), status: "complete" },
      { label: "Sent", timestamp: formatNudgeTime(nudgeAt(3, 11, 0)), status: "complete", durationFromPrev: "0ms" },
      { label: "Delivered", timestamp: formatNudgeTime(nudgeAt(3, 11, 2)), status: "complete", durationFromPrev: "2s" },
      { label: "Opened", timestamp: "—", status: "inactive" },
    ],
  },
  "oi-text": {
    channelType: "sms",
    nodeTitle: "Text",
    channelLabel: "Text · Opt-in launch",
    status: "historical",
    statusLabel: "Completed",
    messageThread: sarahMessageThread("msg-oi-sms"),
    threads: [],
    navigation: {
      next: { touchpointId: "oi-email", label: "Email" },
    },
    telemetry: [
      { label: "Triggered", timestamp: "Mar 15 · 9:00am", status: "complete" },
      { label: "Sent", timestamp: "Mar 15 · 9:00am", status: "complete", durationFromPrev: "0ms" },
      { label: "Delivered", timestamp: "Mar 15 · 9:00am", status: "complete", durationFromPrev: "0.6s" },
      { label: "Opened", timestamp: "Mar 15 · 9:18am", status: "complete", durationFromPrev: "18m" },
    ],
  },
  "m-oi-text": {
    channelType: "sms",
    nodeTitle: "Text",
    channelLabel: "Text · Opt-in launch",
    status: "historical",
    statusLabel: "Completed",
    messageThread: marcusMessageThread("msg-m-oi-sms"),
    threads: [],
    navigation: {
      next: { touchpointId: "m-oi-email", label: "Email" },
    },
    telemetry: [
      { label: "Triggered", timestamp: "Mar 8 '24 · 9:38am", status: "complete" },
      { label: "Sent", timestamp: "Mar 8 '24 · 9:38am", status: "complete", durationFromPrev: "0ms" },
      { label: "Delivered", timestamp: "Mar 8 '24 · 9:38am", status: "complete", durationFromPrev: "0.5s" },
      { label: "Opened", timestamp: "Mar 8 '24 · 9:45am", status: "complete", durationFromPrev: "7m" },
    ],
  },
  "m-r-text": {
    channelType: "sms",
    nodeTitle: "Text",
    channelLabel: "Text · Reactivation",
    status: "complete",
    statusLabel: "Opened",
    messageThread: marcusMessageThread("msg-m-r-sms"),
    threads: [],
    navigation: {
      next: { touchpointId: "m-r-email", label: "Email" },
    },
    telemetry: [
      { label: "Triggered", timestamp: "Jun 9 · 9:02am", status: "complete" },
      { label: "Sent", timestamp: "Jun 9 · 9:02am", status: "complete", durationFromPrev: "0ms" },
      { label: "Delivered", timestamp: "Jun 9 · 9:02am", status: "complete", durationFromPrev: "0.4s" },
      { label: "Opened", timestamp: "Jun 9 · 9:14am", status: "complete", durationFromPrev: "12m" },
    ],
  },
  "r-text": {
    channelType: "sms",
    nodeTitle: "Text",
    channelLabel: "Text · Reactivation",
    status: "armed",
    statusLabel: "Armed",
    messageThread: sarahMessageThread("msg-r-sms"),
    threads: [],
    navigation: {
      next: { touchpointId: "r-email", label: "Email" },
    },
    telemetry: [
      { label: "Triggered", timestamp: "—", status: "inactive" },
      { label: "Sent", timestamp: "—", status: "inactive" },
      { label: "Delivered", timestamp: "—", status: "inactive" },
      { label: "Opened", timestamp: "—", status: "inactive" },
    ],
    rules: {
      rule: "Reactivation Day 0 SMS primer",
      scheduledAction: "Eligibility email follows",
      thoughtChain: [
        {
          id: "r-text-thought-1",
          durationSec: 4,
          label: "SMS primer armed",
          rationale: "Day 0 reactivation opens with a short text before the eligibility email sequence.",
        },
      ],
    },
  },
};

const MERGED_INSPECTOR_BY_ID: Record<string, Omit<NodeInspectorPayload, "touchpointId" | "sequenceId">> = {
  ...NODE_INSPECTOR_BY_ID,
  ...FORM_INSPECTOR_BY_ID,
  ...TEXT_INSPECTOR_BY_ID,
};

const SEQUENCE_BY_TOUCHPOINT: Record<string, string> = {
  "n-001-r1-t": SARAH_NUDGE_GROUP_ID,
  "n-001-r1-e": SARAH_NUDGE_GROUP_ID,
  "n-001-r1-f": SARAH_NUDGE_GROUP_ID,
  "n-001-r1-f-v2": SARAH_NUDGE_GROUP_ID,
  "n-001-r1-f-att1-t": SARAH_NUDGE_GROUP_ID,
  "n-001-r1-f-att1-e": SARAH_NUDGE_GROUP_ID,
  "n-001-r1-f-att2-t": SARAH_NUDGE_GROUP_ID,
  "n-001-r1-f-att3-t": SARAH_NUDGE_GROUP_ID,
  "n-001-r1-f-att3-e": SARAH_NUDGE_GROUP_ID,
  "n-001-r1-f-att3-f": SARAH_NUDGE_GROUP_ID,
  "oi-text": OPT_IN_SEQUENCE_ID,
  "oi-email": OPT_IN_SEQUENCE_ID,
  "oi-form": OPT_IN_SEQUENCE_ID,
  "m-oi-text": "00f-optin-001-marcus-j",
  "m-oi-email": "00f-optin-001-marcus-j",
  "m-oi-form": "00f-optin-001-marcus-j",
  "r-text": REACTIVATION_SEQUENCE_ID,
  "r-email": REACTIVATION_SEQUENCE_ID,
  "r-form": REACTIVATION_SEQUENCE_ID,
  "m-r-text": MARCUS_REACTIVATION_ID,
  "m-r-email": MARCUS_REACTIVATION_ID,
  "m-r-form": MARCUS_REACTIVATION_ID,
};

const INSPECTABLE_CHANNELS = new Set(["email", "form", "sms"]);

export function isInspectableChannel(channel: string): boolean {
  return INSPECTABLE_CHANNELS.has(channel);
}

export function isEmailInspectableChannel(channel: string): boolean {
  return channel === "email";
}

export function getNodeInspectorPayload(
  touchpointId: string,
  sequenceId?: string,
): NodeInspectorPayload | null {
  const entry = MERGED_INSPECTOR_BY_ID[touchpointId];
  if (!entry) return null;
  return {
    touchpointId,
    sequenceId: sequenceId ?? SEQUENCE_BY_TOUCHPOINT[touchpointId] ?? "unknown",
    ...entry,
  };
}

export const getEmailInspectorPayload = getNodeInspectorPayload;
