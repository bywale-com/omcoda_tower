/** Marcus Webb — opt-in + 2 historical nudges + active reactivation */

import type {
  ChannelBarSegment,
  JourneyGanttData,
  JourneyGroup,
  JourneyTouchpoint,
  JourneyTreeNode,
} from "./journeyTree";

export const MARCUS_CLIENT_ID = "marcus";
export const MARCUS_OPT_IN_ID = "00f-optin-001-marcus-j";
export const MARCUS_NUDGE_1_ID = "00f-nudge-001-marcus-j";
export const MARCUS_NUDGE_2_ID = "00f-nudge-002-marcus-j";
export const MARCUS_REACTIVATION_ID = "00f-reactivation-001-marcus-j";

function histSeg(startDay: number, spanDays: number): ChannelBarSegment {
  return { startDay, endDay: startDay + spanDays, colorIndex: 0, variant: "historical" };
}

function histEvent(
  id: string,
  label: string,
  channel: JourneyTouchpoint["channel"],
  startDay: number,
  dateLabel: string,
): JourneyTouchpoint {
  return { id, label, channel, status: "historical", startDay, spanDays: 0, dateLabel };
}

function histChannel(
  id: string,
  label: string,
  channel: JourneyTouchpoint["channel"],
  segment: ChannelBarSegment,
  signals: JourneyTouchpoint["engagementSignals"],
  events: JourneyTouchpoint[],
): JourneyTreeNode {
  return {
    kind: "channel",
    touchpoint: {
      id,
      label,
      channel,
      status: "historical",
      startDay: segment.startDay,
      spanDays: Math.max(segment.endDay - segment.startDay, 0.5),
      defaultOpen: false,
      channelPhase: "complete",
      engagementSignals: signals,
      barSegment: segment,
    },
    events,
    nested: [],
  };
}

function buildHistoricalNudge(
  groupId: string,
  prefix: string,
  startDay: number,
  endDay: number,
  dateLabel: string,
): { tree: JourneyTreeNode[]; gantt: JourneyGanttData } {
  const tText = startDay;
  const tEmail = startDay + 0.6;
  const tForm = startDay + 1.4;

  const gantt: JourneyGanttData = {
    groupId,
    startDay,
    endDay,
    sectionStyle: "historical",
    attemptBands: [],
    escalations: [],
    markers: [
      { id: `${prefix}-m1`, kind: "text_sent", label: "Text sent", atDay: tText },
      { id: `${prefix}-m2`, kind: "email_sent", label: "Email sent", atDay: tEmail },
      { id: `${prefix}-m3`, kind: "form_submitted", label: "Form submitted", atDay: tForm + 0.8 },
    ],
    channelBars: {
      text: [histSeg(tText, 0.7)],
      email: [histSeg(tEmail, 0.9)],
      form: [histSeg(tForm, 1.1)],
    },
  };

  const tree: JourneyTreeNode[] = [
    histChannel(
      `${prefix}-t`,
      "Text",
      "sms",
      gantt.channelBars.text[0],
      { show: ["sent", "opened", "replied"], sent: "met", opened: "met", replied: "met" },
      [
        histEvent(`${prefix}-t-sent`, "Sent", "sms", tText, dateLabel),
        histEvent(`${prefix}-t-delivered`, "Delivered", "sms", tText + 0.05, dateLabel),
      ],
    ),
    histChannel(
      `${prefix}-e`,
      "Email",
      "email",
      gantt.channelBars.email[0],
      { show: ["sent", "opened", "clicked"], sent: "met", opened: "met", clicked: "met" },
      [
        histEvent(`${prefix}-e-sent`, "Sent", "email", tEmail, dateLabel),
        histEvent(`${prefix}-e-opened`, "Opened", "email", tEmail + 0.3, dateLabel),
      ],
    ),
    histChannel(
      `${prefix}-f`,
      "Form",
      "form",
      gantt.channelBars.form[0],
      { show: ["opened", "clicked", "submitted"], opened: "met", clicked: "met", submitted: "met" },
      [histEvent(`${prefix}-f-submitted`, "Submitted", "form", tForm + 0.8, dateLabel)],
    ),
  ];

  return { tree, gantt };
}

const OI = { sms: 0, email: 0.9, waitlist: 2.4, consent: 3.5 };

export const MARCUS_OPT_IN_GANTT: JourneyGanttData = {
  groupId: MARCUS_OPT_IN_ID,
  startDay: OI.sms,
  endDay: OI.consent + 1,
  sectionStyle: "historical",
  attemptBands: [],
  escalations: [],
  markers: [
    { id: "m-oi-m1", kind: "text_sent", label: "SMS primer", atDay: OI.sms },
    { id: "m-oi-m2", kind: "email_sent", label: "Announcement email", atDay: OI.email },
    { id: "m-oi-m3", kind: "form_submitted", label: "Consent logged", atDay: OI.consent },
  ],
  channelBars: {
    text: [histSeg(OI.sms, 0.8)],
    email: [histSeg(OI.email, 1.2)],
    form: [histSeg(OI.waitlist, 1.9)],
  },
};

export const MARCUS_OPT_IN_TREE: JourneyTreeNode[] = [
  histChannel(
    "m-oi-text",
    "Text",
    "sms",
    MARCUS_OPT_IN_GANTT.channelBars.text[0],
    { show: ["sent", "opened", "replied"], sent: "met", opened: "met", replied: "met" },
    [histEvent("m-oi-1", "SMS primer", "sms", OI.sms, "Mar 8 '24")],
  ),
  histChannel(
    "m-oi-email",
    "Email",
    "email",
    MARCUS_OPT_IN_GANTT.channelBars.email[0],
    { show: ["sent", "opened", "clicked"], sent: "met", opened: "met", clicked: "met" },
    [histEvent("m-oi-2", "Announcement email", "email", OI.email, "Mar 8 '24")],
  ),
  histChannel(
    "m-oi-form",
    "Form",
    "form",
    MARCUS_OPT_IN_GANTT.channelBars.form[0],
    { show: ["opened", "clicked", "submitted"], opened: "met", clicked: "met", submitted: "met" },
    [
      histEvent("m-oi-3", "Waitlist signup", "form", OI.waitlist, "Mar 9 '24"),
      histEvent("m-oi-4", "Consent logged", "task", OI.consent, "Mar 9 '24"),
    ],
  ),
];

const NUDGE_1 = buildHistoricalNudge(MARCUS_NUDGE_1_ID, "m-n1", 9, 11.5, "Jan 14 '26");
const NUDGE_2 = buildHistoricalNudge(MARCUS_NUDGE_2_ID, "m-n2", 20, 22.5, "Apr 3 '26");

export const MARCUS_NUDGE_1_TREE = NUDGE_1.tree;
export const MARCUS_NUDGE_1_GANTT = NUDGE_1.gantt;
export const MARCUS_NUDGE_2_TREE = NUDGE_2.tree;
export const MARCUS_NUDGE_2_GANTT = NUDGE_2.gantt;

const R = { sms: 44, email: 44.4, emailOpened: 44.7, form: 48.5 };

function activeSeg(startDay: number, spanDays: number): ChannelBarSegment {
  return { startDay, endDay: startDay + spanDays, colorIndex: 0, variant: "default" };
}

export const MARCUS_REACTIVATION_GANTT: JourneyGanttData = {
  groupId: MARCUS_REACTIVATION_ID,
  startDay: R.sms,
  endDay: R.form + 2,
  sectionStyle: "active",
  attemptBands: [],
  escalations: [],
  markers: [
    { id: "m-r-m1", kind: "text_sent", label: "SMS primer", atDay: R.sms },
    { id: "m-r-m2", kind: "text_delivered", label: "SMS delivered", atDay: R.sms + 0.05 },
    { id: "m-r-m3", kind: "email_sent", label: "Eligibility email", atDay: R.email },
    { id: "m-r-m4", kind: "email_opened", label: "Email opened", atDay: R.emailOpened },
  ],
  channelBars: {
    text: [activeSeg(R.sms, 0.9)],
    email: [activeSeg(R.email, 2.2)],
    form: [activeSeg(R.form, 2)],
  },
};

export const MARCUS_REACTIVATION_TREE: JourneyTreeNode[] = [
  {
    kind: "channel",
    touchpoint: {
      id: "m-r-text",
      label: "Text",
      channel: "sms",
      status: "done",
      startDay: R.sms,
      spanDays: 0.9,
      defaultOpen: true,
      channelPhase: "complete",
      engagementSignals: {
        show: ["sent", "opened", "replied"],
        sent: "met",
        opened: "met",
        replied: "inactive",
      },
      barSegment: MARCUS_REACTIVATION_GANTT.channelBars.text[0],
    },
    events: [
      { id: "m-r-t-sent", label: "Sent", channel: "sms", status: "done", startDay: R.sms, spanDays: 0, dateLabel: "Jun 9 · 9:02am" },
      { id: "m-r-t-delivered", label: "Delivered", channel: "sms", status: "done", startDay: R.sms + 0.05, spanDays: 0, dateLabel: "Jun 9 · 9:02am" },
    ],
    nested: [],
  },
  {
    kind: "channel",
    touchpoint: {
      id: "m-r-email",
      label: "Email",
      channel: "email",
      status: "active",
      startDay: R.email,
      spanDays: 2.2,
      defaultOpen: true,
      channelPhase: "active",
      engagementSignals: {
        show: ["sent", "opened", "clicked"],
        sent: "met",
        opened: "met",
        clicked: "inactive",
      },
      barSegment: MARCUS_REACTIVATION_GANTT.channelBars.email[0],
    },
    events: [
      { id: "m-r-e-sent", label: "Sent", channel: "email", status: "done", startDay: R.email, spanDays: 0, dateLabel: "Jun 9 · 9:18am" },
      { id: "m-r-e-delivered", label: "Delivered", channel: "email", status: "done", startDay: R.email + 0.02, spanDays: 0, dateLabel: "Jun 9 · 9:18am" },
      { id: "m-r-e-opened", label: "Opened", channel: "email", status: "done", startDay: R.emailOpened, spanDays: 0, dateLabel: "Jun 9 · 10:41am" },
    ],
    nested: [],
  },
  {
    kind: "channel",
    touchpoint: {
      id: "m-r-form",
      label: "Form",
      channel: "form",
      status: "scheduled",
      startDay: R.form,
      spanDays: 2,
      defaultOpen: true,
      channelPhase: "idle",
      engagementSignals: {
        show: ["opened", "clicked", "submitted"],
        opened: "inactive",
        clicked: "inactive",
        submitted: "inactive",
      },
      barSegment: MARCUS_REACTIVATION_GANTT.channelBars.form[0],
    },
    events: [],
    nested: [],
  },
];

export const MARCUS_JOURNEY_SEQUENCES: JourneyGroup[] = [
  {
    id: MARCUS_OPT_IN_ID,
    label: MARCUS_OPT_IN_ID,
    defaultOpen: false,
    badgeLetter: "O",
    status: "complete",
    sectionStyle: "historical",
    tree: MARCUS_OPT_IN_TREE,
    touchpoints: [],
  },
  {
    id: MARCUS_NUDGE_1_ID,
    label: MARCUS_NUDGE_1_ID,
    defaultOpen: false,
    badgeLetter: "N",
    status: "complete",
    sectionStyle: "historical",
    tree: MARCUS_NUDGE_1_TREE,
    touchpoints: [],
  },
  {
    id: MARCUS_NUDGE_2_ID,
    label: MARCUS_NUDGE_2_ID,
    defaultOpen: false,
    badgeLetter: "N",
    status: "complete",
    sectionStyle: "historical",
    tree: MARCUS_NUDGE_2_TREE,
    touchpoints: [],
  },
  {
    id: MARCUS_REACTIVATION_ID,
    label: MARCUS_REACTIVATION_ID,
    defaultOpen: true,
    badgeLetter: "R",
    status: "active",
    sectionStyle: "active",
    tree: MARCUS_REACTIVATION_TREE,
    touchpoints: [],
  },
];

export const MARCUS_GANTT_BY_GROUP: Record<string, JourneyGanttData> = {
  [MARCUS_OPT_IN_ID]: MARCUS_OPT_IN_GANTT,
  [MARCUS_NUDGE_1_ID]: MARCUS_NUDGE_1_GANTT,
  [MARCUS_NUDGE_2_ID]: MARCUS_NUDGE_2_GANTT,
  [MARCUS_REACTIVATION_ID]: MARCUS_REACTIVATION_GANTT,
};

export const MARCUS_SEQUENCE_ALIASES: Record<string, string> = {
  "opt-in": MARCUS_OPT_IN_ID,
  "nudges": MARCUS_NUDGE_2_ID,
  "reactivation": MARCUS_REACTIVATION_ID,
};
