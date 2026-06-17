import {
  HISTORICAL_TEAL,
  type ChannelBarSegment,
  type JourneyGanttData,
  type JourneyTouchpoint,
  type JourneyTreeNode,
} from "./journeyTree";

export const OPT_IN_SEQUENCE_ID = "00f-optin-001-sarah-j";

/** @deprecated use OPT_IN_SEQUENCE_ID */
export const OPT_IN_GROUP_ID = OPT_IN_SEQUENCE_ID;

/** Mar 2024 history band — far left of the continuous timeline (days 0–4) */
const T = {
  sms: 0,
  email: 0.9,
  social: 2.2,
  waitlist: 2.4,
  consent: 3.5,
};

function seg(startDay: number, spanDays: number): ChannelBarSegment {
  return { startDay, endDay: startDay + spanDays, colorIndex: 0, variant: "historical" };
}

function historicalEvent(
  id: string,
  label: string,
  channel: JourneyTouchpoint["channel"],
  startDay: number,
  dateLabel: string,
): JourneyTouchpoint {
  return {
    id,
    label,
    channel,
    status: "historical",
    startDay,
    spanDays: 0,
    dateLabel,
  };
}

function historicalChannel(
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
      defaultOpen: true,
      channelPhase: "complete",
      engagementSignals: signals,
      barSegment: segment,
    },
    events,
    nested: [],
  };
}

export const OPT_IN_GANTT: JourneyGanttData = {
  groupId: OPT_IN_SEQUENCE_ID,
  startDay: T.sms,
  endDay: T.consent + 1,
  sectionStyle: "historical",
  attemptBands: [],
  escalations: [],
  markers: [
    { id: "oi-m1", kind: "text_sent", label: "SMS primer", atDay: T.sms },
    { id: "oi-m2", kind: "email_sent", label: "Announcement email", atDay: T.email },
    { id: "oi-m3", kind: "form_opened", label: "Waitlist signup", atDay: T.waitlist },
    { id: "oi-m4", kind: "form_submitted", label: "Consent logged", atDay: T.consent },
  ],
  channelBars: {
    text: [seg(T.sms, 0.8)],
    email: [seg(T.email, 1.2)],
    form: [seg(T.waitlist, 1.9)],
  },
};

export const OPT_IN_TREE: JourneyTreeNode[] = [
  historicalChannel(
    "oi-text",
    "Text",
    "sms",
    OPT_IN_GANTT.channelBars.text[0],
    { show: ["sent", "opened", "replied"], sent: "met", opened: "met", replied: "met" },
    [historicalEvent("oi-1", "SMS primer", "sms", T.sms, "Mar 15")],
  ),
  historicalChannel(
    "oi-email",
    "Email",
    "email",
    OPT_IN_GANTT.channelBars.email[0],
    { show: ["sent", "opened", "clicked"], sent: "met", opened: "met", clicked: "met" },
    [historicalEvent("oi-2", "Announcement email", "email", T.email, "Mar 15")],
  ),
  {
    kind: "standalone",
    touchpoint: {
      id: "oi-social",
      label: "Social follow",
      channel: "visit",
      status: "historical",
      startDay: T.social,
      spanDays: 0.8,
      defaultOpen: true,
      channelPhase: "complete",
      barSegment: { startDay: T.social, endDay: T.social + 0.8, colorIndex: 0, variant: "historical" },
    },
    events: [historicalEvent("oi-3", "Social follow", "visit", T.social, "Mar 16")],
    nested: [],
  },
  historicalChannel(
    "oi-form",
    "Form",
    "form",
    OPT_IN_GANTT.channelBars.form[0],
    { show: ["opened", "clicked", "submitted"], opened: "met", clicked: "met", submitted: "met" },
    [
      historicalEvent("oi-4", "Waitlist signup", "form", T.waitlist, "Mar 16"),
      historicalEvent("oi-5", "Consent logged", "task", T.consent, "Mar 16"),
    ],
  ),
];

export { HISTORICAL_TEAL };
