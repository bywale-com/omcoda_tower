import type { ChannelBarSegment, JourneyGanttData, JourneyTouchpoint, JourneyTreeNode } from "./journeyTree";

export const REACTIVATION_SEQUENCE_ID = "00f-reactivation-001-sarah-j";

/** @deprecated use REACTIVATION_SEQUENCE_ID */
export const REACTIVATION_GROUP_ID = REACTIVATION_SEQUENCE_ID;

/** Armed band — right edge of timeline (days 44–56) */
const R = {
  sms: 44,
  email: 44.2,
  nurture1: 46,
  nurture2: 48,
  slot: 50,
  follow: 51.5,
  task: 53.5,
};

function ghostSeg(startDay: number, spanDays: number): ChannelBarSegment {
  return { startDay, endDay: startDay + spanDays, colorIndex: 0, variant: "armed" };
}

function ghostEvent(
  id: string,
  label: string,
  channel: JourneyTouchpoint["channel"],
  startDay: number,
  spanDays = 0,
): JourneyTouchpoint {
  return { id, label, channel, status: "ghost", startDay, spanDays };
}

function ghostChannel(
  id: string,
  label: string,
  channel: JourneyTouchpoint["channel"],
  segment: ChannelBarSegment,
  events: JourneyTouchpoint[],
): JourneyTreeNode {
  return {
    kind: "channel",
    touchpoint: {
      id,
      label,
      channel,
      status: "ghost",
      startDay: segment.startDay,
      spanDays: Math.max(segment.endDay - segment.startDay, 0.5),
      defaultOpen: true,
      channelPhase: "idle",
      engagementSignals: {
        show: channel === "sms"
          ? ["sent", "opened", "replied"]
          : channel === "email"
            ? ["sent", "opened", "clicked"]
            : ["opened", "clicked", "submitted"],
        sent: "inactive",
        opened: "inactive",
        clicked: "inactive",
        replied: "inactive",
        submitted: "inactive",
      },
      barSegment: segment,
    },
    events,
    nested: [],
  };
}

export const REACTIVATION_GANTT: JourneyGanttData = {
  groupId: REACTIVATION_SEQUENCE_ID,
  startDay: R.sms,
  endDay: R.task + 2,
  sectionStyle: "armed",
  attemptBands: [],
  escalations: [],
  markers: [],
  channelBars: {
    text: [ghostSeg(R.sms, 1)],
    email: [ghostSeg(R.email, 4)],
    form: [ghostSeg(R.slot, 3.5)],
  },
};

export const REACTIVATION_TREE: JourneyTreeNode[] = [
  ghostChannel(
    "r-text",
    "Text",
    "sms",
    REACTIVATION_GANTT.channelBars.text[0],
    [ghostEvent("r-sms", "Day 0 · SMS primer", "sms", R.sms, 1)],
  ),
  ghostChannel(
    "r-email",
    "Email",
    "email",
    REACTIVATION_GANTT.channelBars.email[0],
    [
      ghostEvent("r-email", "Day 0 · Eligibility email", "email", R.email, 1.2),
      ghostEvent("r-n1", "Days 1–3 · Nurture email 1", "email", R.nurture1, 2),
      ghostEvent("r-n2", "Days 1–3 · Nurture email 2", "email", R.nurture2, 2),
    ],
  ),
  ghostChannel(
    "r-form",
    "Form",
    "form",
    REACTIVATION_GANTT.channelBars.form[0],
    [
      ghostEvent("r-slot", "Day 3 · Slot opens", "meeting", R.slot, 1.5),
      ghostEvent("r-follow", "Booking follow-ups", "sms", R.follow, 2),
    ],
  ),
  {
    kind: "taskEscalation",
    id: "r-task",
    touchpoint: {
      id: "r-task",
      label: "Human task · call client",
      channel: "task",
      status: "ghost",
      startDay: R.task,
      spanDays: 2,
      taskAssignee: "Consultant",
      barSegment: ghostSeg(R.task, 2),
    },
  },
];
