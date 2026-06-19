import type { NotionIconName } from "../../icons/notion-icon-urls";
import type { ContentChildHolon } from "./clientDataHolons";

/** Pattern row types in the engagement list column — flat under Engagement List */
export const ENGAGEMENT_LIST_ROW_HOLONS = {
  sequenceRow: {
    id: "engagement-sequence-row",
    label: "Sequence Row",
    icon: "tag" as NotionIconName,
    order: 0,
  },
  channelRow: {
    id: "engagement-channel-row",
    label: "Channel Row",
    icon: "directional-sign" as NotionIconName,
    order: 1,
  },
  formVisitRow: {
    id: "engagement-form-visit-row",
    label: "Form Visit Row",
    icon: "computer-window" as NotionIconName,
    order: 2,
  },
  eventRow: {
    id: "engagement-event-row",
    label: "Event Row",
    icon: "bell" as NotionIconName,
    order: 3,
  },
  escalationRow: {
    id: "engagement-escalation-row",
    label: "Escalation Row",
    icon: "lightning-bolt" as NotionIconName,
    order: 4,
  },
  attemptRow: {
    id: "engagement-attempt-row",
    label: "Attempt Row",
    icon: "circle-dashed" as NotionIconName,
    order: 5,
  },
} as const;

export const ENGAGEMENT_SEQUENCE_ROW_HOLON = ENGAGEMENT_LIST_ROW_HOLONS.sequenceRow;
export const ENGAGEMENT_CHANNEL_ROW_HOLON = ENGAGEMENT_LIST_ROW_HOLONS.channelRow;
export const ENGAGEMENT_FORM_VISIT_ROW_HOLON = ENGAGEMENT_LIST_ROW_HOLONS.formVisitRow;
export const ENGAGEMENT_EVENT_ROW_HOLON = ENGAGEMENT_LIST_ROW_HOLONS.eventRow;
export const ENGAGEMENT_ESCALATION_ROW_HOLON = ENGAGEMENT_LIST_ROW_HOLONS.escalationRow;
export const ENGAGEMENT_ATTEMPT_ROW_HOLON = ENGAGEMENT_LIST_ROW_HOLONS.attemptRow;

export const ENGAGEMENT_LIST_ROW_HOLONS_LIST: ContentChildHolon[] = [
  ENGAGEMENT_LIST_ROW_HOLONS.sequenceRow,
  ENGAGEMENT_LIST_ROW_HOLONS.channelRow,
  ENGAGEMENT_LIST_ROW_HOLONS.formVisitRow,
  ENGAGEMENT_LIST_ROW_HOLONS.eventRow,
  ENGAGEMENT_LIST_ROW_HOLONS.escalationRow,
  ENGAGEMENT_LIST_ROW_HOLONS.attemptRow,
];

/** Pattern holon inView — true only when at least one row of that type is in the live list */
export function engagementRowInViewFromKinds(kinds: Iterable<string>): Record<string, boolean> {
  const set = new Set(kinds);
  return {
    [ENGAGEMENT_SEQUENCE_ROW_HOLON.id]: set.has("nudgeGroup"),
    [ENGAGEMENT_CHANNEL_ROW_HOLON.id]: set.has("nudgeChannel") || set.has("journeyStandalone"),
    [ENGAGEMENT_FORM_VISIT_ROW_HOLON.id]: set.has("nudgeFormVisit"),
    [ENGAGEMENT_EVENT_ROW_HOLON.id]: set.has("nudgeEvent"),
    [ENGAGEMENT_ESCALATION_ROW_HOLON.id]: set.has("nudgeEscalation"),
    [ENGAGEMENT_ATTEMPT_ROW_HOLON.id]: set.has("nudgeAttempt"),
  };
}
