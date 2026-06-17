/** Sarah · 00f-nudge-001 — owner-based nudge tree + 7-day story */

import {
  ATTEMPT_BAR_COLORS,
  type ChannelBarSegment,
  type JourneyAttemptRow,
  type JourneyEscalation,
  type JourneyGanttData,
  type JourneyMarker,
  type JourneyTouchpoint,
  type JourneyFormVisitRow,
  type JourneyTreeNode,
} from "./journeyTree";

export type {
  ChannelBarSegment,
  JourneyAttemptRow as NudgeAttemptRow,
  JourneyFormVisitRow as NudgeFormVisitRow,
  JourneyEscalation as NudgeEscalation,
  JourneyGanttData as NudgeGanttData,
  JourneyMarker as NudgeMarker,
  JourneyTouchpoint as NudgeTouchpoint,
  JourneyTreeNode as NudgeTreeNode,
  ThoughtStep,
} from "./journeyTree";

export {
  ATTEMPT_BAR_COLORS,
  collectDefaultOpenIds,
  findTreePathToId,
  journeyTreeContainsId as nudgeTreeContainsId,
} from "./journeyTree";

type Channel = JourneyTouchpoint["channel"];

export const SARAH_NUDGE_GROUP_ID = "00f-nudge-001-sarah-j";

/** Jun 11 2026 — first send (day index from journey ORIGIN May 26) */
export const SARAH_NUDGE_BASE_DAY = 16;

const BASE = SARAH_NUDGE_BASE_DAY;
const ORIGIN_MONTH = 4; // May
const ORIGIN_DAY = 26;
const ORIGIN_YEAR = 2026;

export function nudgeAt(dayOffset: number, hour: number, minute = 0): number {
  return BASE + dayOffset + (hour * 60 + minute) / 1440;
}

export function formatNudgeTime(atDay: number): string {
  const offset = atDay - BASE;
  const dayOff = Math.floor(offset);
  const frac = offset - dayOff;
  const totalMin = Math.round(frac * 1440);
  const h24 = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const h12 = h24 % 12 || 12;
  const suffix = h24 < 12 ? "am" : "pm";
  const time = m === 0 ? `${h12}${suffix}` : `${h12}:${m.toString().padStart(2, "0")}${suffix}`;
  const d = new Date(ORIGIN_YEAR, ORIGIN_MONTH, ORIGIN_DAY + BASE + dayOff);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${date} · ${time}`;
}

export type NudgeMarkerKind = JourneyMarker["kind"];

const T = {
  a1_sent: nudgeAt(0, 9, 0),
  a1_delivered: nudgeAt(0, 9, 2),
  a1_open_fail: nudgeAt(0, 9, 32),
  a1_e_sent: nudgeAt(0, 9, 35),
  a1_e_delivered: nudgeAt(0, 9, 36),
  a1_e_opened: nudgeAt(0, 11, 36),
  a1_e_clicked: nudgeAt(1, 10, 8),

  f_v1_opened: nudgeAt(1, 10, 10),
  f_v1_started: nudgeAt(1, 10, 26),
  f_v1_ended: nudgeAt(1, 10, 52),
  f_att1_escalation: nudgeAt(2, 10, 10),

  f_att1_sent: nudgeAt(2, 11, 0),
  f_att1_delivered: nudgeAt(2, 11, 2),
  f_att1_opened: nudgeAt(2, 11, 18),
  f_att1_e_sent: nudgeAt(2, 14, 0),
  f_att1_e_delivered: nudgeAt(2, 14, 1),
  f_att1_e_opened: nudgeAt(2, 14, 22),

  f_att2_sent: nudgeAt(3, 9, 0),
  f_att2_delivered: nudgeAt(3, 9, 2),
  f_att2_window_end: nudgeAt(3, 10, 0),

  f_v2_opened: nudgeAt(3, 9, 38),
  f_v2_started: nudgeAt(3, 9, 50),
  f_v2_ended: nudgeAt(3, 10, 8),
  f_att3_escalation: nudgeAt(3, 10, 12),

  f_att3_sent: nudgeAt(3, 11, 0),
  f_att3_delivered: nudgeAt(3, 11, 2),
  f_att3_e_sent: nudgeAt(3, 14, 0),
  f_att3_e_delivered: nudgeAt(3, 14, 1),
  f_att3_e_opened: nudgeAt(3, 14, 18),
  f_att3_e_clicked: nudgeAt(3, 14, 28),

  f_v3_opened: nudgeAt(3, 14, 30),
  f_v3_started: nudgeAt(3, 14, 38),
  f_submitted: nudgeAt(3, 15, 10),
  f_reactivation_scheduled: nudgeAt(3, 15, 15),
};

const ESCALATIONS: JourneyEscalation[] = [
  {
    waitStartDay: T.a1_delivered,
    waitEndDay: T.a1_open_fail,
    rule: "Text delivered, not opened in 30min",
    scheduledLabel: "Email scheduled",
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
  {
    waitStartDay: T.a1_e_opened,
    waitEndDay: T.a1_e_clicked,
    rule: "Email opened, form link clicked",
    scheduledLabel: "Form active",
    thoughtChain: [
      {
        id: "esc-r1-e-s1",
        durationSec: 5,
        label: "Form link clicked",
        rationale: "Opened 11:36am. Link clicked Jun 12 10:08am. Form session opened — ownership transfers to Form node.",
      },
    ],
  },
  {
    waitStartDay: T.f_submitted,
    waitEndDay: T.f_reactivation_scheduled,
    rule: "Form submitted · nudge path complete",
    scheduledLabel: "Reactivation scheduled",
    thoughtChain: [
      {
        id: "esc-r1-f-s1",
        durationSec: 6,
        label: "Evaluating nudge outcome",
        rationale: "Form submitted Jun 14 3:10pm after Attempt 3. Nudge 00f-nudge-001 closes successfully.",
      },
      {
        id: "esc-r1-f-s2",
        durationSec: 3,
        label: "Reactivation scheduled",
        rationale: "Next engagement cycle armed: 00f-reactivation-001 template queued.",
      },
    ],
  },
];

const FORM_VISIT_ATT1_ESCALATION: JourneyEscalation = {
  waitStartDay: T.f_v1_started,
  waitEndDay: T.f_att1_escalation,
  rule: "Form started, not submitted in 24h",
  scheduledLabel: "Text scheduled",
  thoughtChain: [
    {
      id: "esc-f-v1-s1",
      durationSec: 6,
      label: "Monitoring start → submit window",
      rationale: "Sarah started the permit form Jun 12 10:26am. 24-hour submit window active. Re-entries do not reset the clock.",
    },
    {
      id: "esc-f-v1-s2",
      durationSec: 3,
      label: "Text scheduled",
      rationale: "Submit window expired Jun 13 10:10am. Text primer at 11:00am, then email if needed.",
    },
  ],
};

const FORM_VISIT_ATT3_ESCALATION: JourneyEscalation = {
  waitStartDay: T.f_v2_started,
  waitEndDay: T.f_att3_escalation,
  rule: "Priority form visit started, not submitted",
  scheduledLabel: "Text scheduled",
  thoughtChain: [
    {
      id: "esc-f-v2-s1",
      durationSec: 6,
      label: "Priority override · form visit",
      rationale: "Sarah opened Attempt 1 · Email during Attempt 2 text window. Form visit supersedes in-flight text. Started 9:50am, exited 10:08am without submitting.",
    },
    {
      id: "esc-f-v2-s2",
      durationSec: 3,
      label: "Text scheduled",
      rationale: "Attempt 2 nullified. Attempt 3 opens: fresh text + email sequence.",
    },
  ],
};

const FORM_ATT1_TEXT_ESCALATION: JourneyEscalation = {
  waitStartDay: T.f_att1_opened,
  waitEndDay: T.f_att1_e_sent,
  rule: "Text opened · next channel in attempt",
  scheduledLabel: "Email scheduled",
  thoughtChain: [
    {
      id: "esc-f-att1-t-s1",
      durationSec: 4,
      label: "Text criteria met",
      rationale: "Attempt 1 · Text opened Jun 13 11:18am. Proceeding to email in sequence.",
    },
    {
      id: "esc-f-att1-t-s2",
      durationSec: 3,
      label: "Email scheduled",
      rationale: "Queuing Attempt 1 · Email with resume link.",
    },
  ],
};

const FORM_ATT1_EMAIL_ESCALATION: JourneyEscalation = {
  waitStartDay: T.f_att1_e_opened,
  waitEndDay: nudgeAt(2, 18, 0),
  rule: "Email opened, link not clicked in 24h",
  scheduledLabel: "Text scheduled",
  thoughtChain: [
    {
      id: "esc-f-att1-e-s1",
      durationSec: 5,
      label: "Monitoring email click window",
      rationale: "Attempt 1 · Email opened Jun 13 2:22pm. No form link click within window.",
    },
    {
      id: "esc-f-att1-e-s2",
      durationSec: 3,
      label: "Text scheduled",
      rationale: "Email criteria unmet. Next path: text-only Attempt 2.",
    },
  ],
};

const FORM_ATT3_TEXT_ESCALATION: JourneyEscalation = {
  waitStartDay: T.f_att3_delivered,
  waitEndDay: T.f_att3_e_sent,
  rule: "Text opened · next channel in attempt",
  scheduledLabel: "Email scheduled",
  thoughtChain: [
    {
      id: "esc-f-att3-t-s1",
      durationSec: 4,
      label: "Text criteria met",
      rationale: "Attempt 3 · Text delivered. Email follows in attempt sequence.",
    },
    {
      id: "esc-f-att3-t-s2",
      durationSec: 3,
      label: "Email scheduled",
      rationale: "Queuing Attempt 3 · Email with permit reminder.",
    },
  ],
};

const FORM_ATT3_EMAIL_ESCALATION: JourneyEscalation = {
  waitStartDay: T.f_att3_e_clicked,
  waitEndDay: T.f_v3_opened,
  rule: "Email link clicked · form handoff",
  scheduledLabel: "Form active",
  thoughtChain: [
    {
      id: "esc-f-att3-e-s1",
      durationSec: 4,
      label: "Link clicked",
      rationale: "Attempt 3 · Email criteria met Jun 14 2:28pm. Ownership passes to Form.",
    },
    {
      id: "esc-f-att3-e-s2",
      durationSec: 3,
      label: "Form active",
      rationale: "Form subnode opens as third channel in Attempt 3.",
    },
  ],
};

/** @deprecated use FORM_VISIT_ATT1_ESCALATION */
export const FORM_SUBMIT_ESCALATION: JourneyEscalation = FORM_VISIT_ATT1_ESCALATION;

export const SARAH_NUDGE_GANTT: JourneyGanttData = {
  groupId: SARAH_NUDGE_GROUP_ID,
  startDay: T.a1_sent,
  endDay: nudgeAt(4, 9, 0),
  sectionStyle: "active",
  attemptBands: [
    { id: "n-001-r1-f-att1", colorIndex: 0, startDay: T.f_att1_sent, endDay: T.f_att1_e_opened },
    { id: "n-001-r1-f-att2", colorIndex: 1, startDay: T.f_att2_sent, endDay: T.f_att2_window_end },
    { id: "n-001-r1-f-att3", colorIndex: 2, startDay: T.f_att3_sent, endDay: T.f_reactivation_scheduled },
  ],
  escalations: ESCALATIONS,
  markers: [
    { id: "m1", kind: "text_sent", label: "Text sent", atDay: T.a1_sent },
    { id: "m2", kind: "text_delivered", label: "Text delivered", atDay: T.a1_delivered },
    { id: "m3", kind: "email_sent", label: "Email sent", atDay: T.a1_e_sent },
    { id: "m4", kind: "email_delivered", label: "Email delivered", atDay: T.a1_e_delivered },
    { id: "m5", kind: "email_opened", label: "Email opened", atDay: T.a1_e_opened },
    { id: "m6", kind: "email_clicked", label: "Form link clicked", atDay: T.a1_e_clicked },
    { id: "m7", kind: "form_opened", label: "Form opened", atDay: T.f_v1_opened },
    { id: "m8", kind: "text_sent", label: "Text sent (Att 1)", atDay: T.f_att1_sent },
    { id: "m9", kind: "email_sent", label: "Email sent (Att 1)", atDay: T.f_att1_e_sent },
    { id: "m10", kind: "text_sent", label: "Text sent (Att 2)", atDay: T.f_att2_sent },
    { id: "m11", kind: "form_opened", label: "Form opened (prior email)", atDay: T.f_v2_opened },
    { id: "m12", kind: "text_sent", label: "Text sent (Att 3)", atDay: T.f_att3_sent },
    { id: "m13", kind: "email_clicked", label: "Link clicked (Att 3)", atDay: T.f_att3_e_clicked },
    { id: "m14", kind: "form_submitted", label: "Form submitted", atDay: T.f_submitted },
  ],
  channelBars: {
    text: [
      { startDay: T.a1_sent, endDay: T.a1_delivered, colorIndex: 0 },
      { startDay: T.f_att1_sent, endDay: T.f_att1_opened, colorIndex: 0 },
      { startDay: T.f_att2_sent, endDay: T.f_att2_window_end, colorIndex: 1 },
      { startDay: T.f_att3_sent, endDay: T.f_att3_delivered, colorIndex: 2 },
    ],
    email: [
      { startDay: T.a1_e_sent, endDay: T.a1_e_clicked, colorIndex: 0 },
      { startDay: T.f_att1_e_sent, endDay: T.f_att1_e_opened, colorIndex: 0 },
      { startDay: T.f_att3_e_sent, endDay: T.f_att3_e_clicked, colorIndex: 2 },
    ],
    form: [
      /** Parent Form row: continuous ownership from link click through path resolution */
      { startDay: T.a1_e_clicked, endDay: T.f_reactivation_scheduled, colorIndex: 0 },
      { startDay: T.f_v2_opened, endDay: T.f_v2_ended, colorIndex: 1 },
      { startDay: T.f_v3_opened, endDay: T.f_submitted, colorIndex: 2 },
    ],
  },
};

function eventLeaf(
  id: string,
  label: string,
  channel: Channel,
  atDay: number,
): JourneyTouchpoint {
  return {
    id,
    label,
    channel,
    status: "done",
    startDay: atDay,
    spanDays: 0,
    dateLabel: formatNudgeTime(atDay),
  };
}

function channelTp(
  id: string,
  label: string,
  channel: Channel,
  segment: ChannelBarSegment,
  engagementSignals: JourneyTouchpoint["engagementSignals"],
  channelPhase: JourneyTouchpoint["channelPhase"],
  defaultOpen = false,
): JourneyTouchpoint {
  return {
    id,
    label,
    channel,
    status: "done",
    startDay: segment.startDay,
    spanDays: Math.max(segment.endDay - segment.startDay, 1 / 1440),
    defaultOpen,
    engagementSignals,
    channelPhase,
    barSegment: segment,
  };
}

function formVisitRow(
  id: string,
  visitNum: number,
  origin: JourneyFormVisitRow["origin"],
  startDay: number,
  endDay: number,
  signals: JourneyFormVisitRow["signals"],
  sourceEmailId?: string,
  sourceEmailLabel?: string,
): JourneyFormVisitRow {
  return {
    id,
    label: "Form visit",
    visitNum,
    origin,
    sourceEmailId,
    sourceEmailLabel,
    signals,
    startDay,
    endDay,
  };
}

/**
 * Owner-based tree:
 * Text (r1) → Email scheduled
 * Email (r1) → form link clicked (form ownership begins)
 * Form (r1) → form visit → Attempt 1 → Attempt 2 → form visit (prior email) → Attempt 3 → form visit (submitted)
 */
export const SARAH_NUDGE_TREE: JourneyTreeNode[] = [
  {
    kind: "channel",
    touchpoint: channelTp(
      "n-001-r1-t",
      "Text",
      "sms",
      SARAH_NUDGE_GANTT.channelBars.text[0],
      { show: ["sent", "opened", "replied"], sent: "met", opened: "inactive", replied: "inactive" },
      undefined,
      true,
    ),
    events: [
      eventLeaf("n-001-r1-t-sent", "Sent", "sms", T.a1_sent),
      eventLeaf("n-001-r1-t-delivered", "Delivered", "sms", T.a1_delivered),
    ],
    nested: [{ kind: "escalation", id: "esc-r1-t-email", escalation: ESCALATIONS[0] }],
  },
  {
    kind: "channel",
    touchpoint: channelTp(
      "n-001-r1-e",
      "Email",
      "email",
      SARAH_NUDGE_GANTT.channelBars.email[0],
      { show: ["sent", "opened", "clicked"], sent: "met", opened: "met", clicked: "met" },
      "complete",
      true,
    ),
    events: [
      eventLeaf("n-001-r1-e-sent", "Sent", "email", T.a1_e_sent),
      eventLeaf("n-001-r1-e-delivered", "Delivered", "email", T.a1_e_delivered),
      eventLeaf("n-001-r1-e-opened", "Opened", "email", T.a1_e_opened),
      eventLeaf("n-001-r1-e-clicked", "Link clicked", "email", T.a1_e_clicked),
    ],
    nested: [{ kind: "escalation", id: "esc-r1-e-form", escalation: ESCALATIONS[1] }],
  },
  {
    kind: "channel",
    touchpoint: channelTp(
      "n-001-r1-f",
      "Form",
      "form",
      SARAH_NUDGE_GANTT.channelBars.form[0],
      { show: ["opened", "started", "submitted"], opened: "met", started: "met", submitted: "met" },
      "complete",
      true,
    ),
    events: [
      eventLeaf("n-001-r1-f-opened", "Opened", "form", T.f_v1_opened),
      eventLeaf("n-001-r1-f-started", "Started", "form", T.f_v1_started),
    ],
    nested: [
      { kind: "escalation", id: "esc-f-v1-att1", escalation: FORM_VISIT_ATT1_ESCALATION },
      {
        kind: "attempt",
        attempt: {
          id: "n-001-r1-f-att1",
          label: "Attempt 1",
          attemptNum: 1,
          colorIndex: 0,
          defaultOpen: true,
          startDay: T.f_att1_sent,
          endDay: T.f_att1_e_opened,
        },
        nested: [
          {
            kind: "channel",
            touchpoint: channelTp(
              "n-001-r1-f-att1-t",
              "Text",
              "sms",
              SARAH_NUDGE_GANTT.channelBars.text[1],
              { show: ["sent", "opened", "replied"], sent: "met", opened: "met", replied: "inactive" },
              "complete",
              true,
            ),
            events: [
              eventLeaf("n-001-r1-f-att1-t-sent", "Sent", "sms", T.f_att1_sent),
              eventLeaf("n-001-r1-f-att1-t-delivered", "Delivered", "sms", T.f_att1_delivered),
              eventLeaf("n-001-r1-f-att1-t-opened", "Opened", "sms", T.f_att1_opened),
            ],
            nested: [{ kind: "escalation", id: "esc-f-att1-t-e", escalation: FORM_ATT1_TEXT_ESCALATION }],
          },
          {
            kind: "channel",
            touchpoint: channelTp(
              "n-001-r1-f-att1-e",
              "Email",
              "email",
              SARAH_NUDGE_GANTT.channelBars.email[1],
              { show: ["sent", "opened", "clicked"], sent: "met", opened: "met", clicked: "inactive" },
              "complete",
              true,
            ),
            events: [
              eventLeaf("n-001-r1-f-att1-e-sent", "Sent", "email", T.f_att1_e_sent),
              eventLeaf("n-001-r1-f-att1-e-delivered", "Delivered", "email", T.f_att1_e_delivered),
              eventLeaf("n-001-r1-f-att1-e-opened", "Opened", "email", T.f_att1_e_opened),
            ],
            nested: [{ kind: "escalation", id: "esc-f-att1-e-t2", escalation: FORM_ATT1_EMAIL_ESCALATION }],
          },
        ],
      },
      {
        kind: "attempt",
        attempt: {
          id: "n-001-r1-f-att2",
          label: "Attempt 2",
          attemptNum: 2,
          colorIndex: 1,
          defaultOpen: true,
          startDay: T.f_att2_sent,
          endDay: T.f_att2_window_end,
        },
        nested: [
          {
            kind: "channel",
            touchpoint: channelTp(
              "n-001-r1-f-att2-t",
              "Text",
              "sms",
              SARAH_NUDGE_GANTT.channelBars.text[2],
              { show: ["sent", "opened", "replied"], sent: "met", opened: "inactive", replied: "inactive" },
              "active",
              true,
            ),
            events: [
              eventLeaf("n-001-r1-f-att2-t-sent", "Sent", "sms", T.f_att2_sent),
              eventLeaf("n-001-r1-f-att2-t-delivered", "Delivered", "sms", T.f_att2_delivered),
            ],
            nested: [],
          },
        ],
      },
      {
        kind: "formVisit",
        visit: formVisitRow(
          "n-001-r1-f-v2",
          1,
          "prior_email",
          T.f_v2_opened,
          T.f_v2_ended,
          { opened: "met", started: "met", submitted: "unmet" },
          "n-001-r1-f-att1-e",
          "Attempt 1 · Email",
        ),
        nested: [{ kind: "escalation", id: "esc-f-v2-att3", escalation: FORM_VISIT_ATT3_ESCALATION }],
      },
      {
        kind: "attempt",
        attempt: {
          id: "n-001-r1-f-att3",
          label: "Attempt 3",
          attemptNum: 3,
          colorIndex: 2,
          defaultOpen: true,
          startDay: T.f_att3_sent,
          endDay: T.f_reactivation_scheduled,
        },
        nested: [
          {
            kind: "channel",
            touchpoint: channelTp(
              "n-001-r1-f-att3-t",
              "Text",
              "sms",
              SARAH_NUDGE_GANTT.channelBars.text[3],
              { show: ["sent", "opened", "replied"], sent: "met", opened: "met", replied: "inactive" },
              "complete",
              true,
            ),
            events: [
              eventLeaf("n-001-r1-f-att3-t-sent", "Sent", "sms", T.f_att3_sent),
              eventLeaf("n-001-r1-f-att3-t-delivered", "Delivered", "sms", T.f_att3_delivered),
            ],
            nested: [{ kind: "escalation", id: "esc-f-att3-t-e", escalation: FORM_ATT3_TEXT_ESCALATION }],
          },
          {
            kind: "channel",
            touchpoint: channelTp(
              "n-001-r1-f-att3-e",
              "Email",
              "email",
              SARAH_NUDGE_GANTT.channelBars.email[2],
              { show: ["sent", "opened", "clicked"], sent: "met", opened: "met", clicked: "met" },
              "complete",
              true,
            ),
            events: [
              eventLeaf("n-001-r1-f-att3-e-sent", "Sent", "email", T.f_att3_e_sent),
              eventLeaf("n-001-r1-f-att3-e-delivered", "Delivered", "email", T.f_att3_e_delivered),
              eventLeaf("n-001-r1-f-att3-e-opened", "Opened", "email", T.f_att3_e_opened),
              eventLeaf("n-001-r1-f-att3-e-clicked", "Link clicked", "email", T.f_att3_e_clicked),
            ],
            nested: [{ kind: "escalation", id: "esc-f-att3-e-f", escalation: FORM_ATT3_EMAIL_ESCALATION }],
          },
          {
            kind: "channel",
            touchpoint: channelTp(
              "n-001-r1-f-att3-f",
              "Form",
              "form",
              SARAH_NUDGE_GANTT.channelBars.form[2],
              { show: ["opened", "started", "submitted"], opened: "met", started: "met", submitted: "met" },
              "complete",
              true,
            ),
            events: [
              eventLeaf("n-001-r1-f-att3-f-opened", "Opened", "form", T.f_v3_opened),
              eventLeaf("n-001-r1-f-att3-f-started", "Started", "form", T.f_v3_started),
              eventLeaf("n-001-r1-f-att3-f-submitted", "Submitted", "form", T.f_submitted),
            ],
            nested: [{ kind: "escalation", id: "esc-r1-f-reactivation", escalation: ESCALATIONS[2] }],
          },
        ],
      },
    ],
  },
];
