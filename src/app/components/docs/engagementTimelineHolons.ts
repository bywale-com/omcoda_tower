import type { NotionIconName } from "../../icons/notion-icon-urls";
import type { ContentChildHolon } from "./clientDataHolons";

/**
 * Timeline holons — one entry per gantt primitive in NudgeGantt.tsx
 * (not grid/zoom chrome, not duplicate labels for the same renderer)
 */
export const ENGAGEMENT_TIMELINE_CHILD_HOLONS = {
  sequenceBar: {
    id: "engagement-sequence-bar",
    label: "Sequence Bar",
    icon: "chart-bar-horizontal" as NotionIconName,
    order: 0,
  },
  attemptBand: {
    id: "engagement-attempt-band",
    label: "Attempt Band",
    icon: "circle-dashed" as NotionIconName,
    order: 1,
  },
  segmentBar: {
    id: "engagement-segment-bar",
    label: "Segment Bar",
    icon: "directional-sign" as NotionIconName,
    order: 2,
  },
  eventMarker: {
    id: "engagement-event-marker",
    label: "Event Marker",
    icon: "bell" as NotionIconName,
    order: 3,
  },
  escalationBand: {
    id: "engagement-escalation-band",
    label: "Escalation Band",
    icon: "lightning-bolt" as NotionIconName,
    order: 4,
  },
} as const;

export const ENGAGEMENT_SEQUENCE_BAR_HOLON = ENGAGEMENT_TIMELINE_CHILD_HOLONS.sequenceBar;
export const ENGAGEMENT_ATTEMPT_BAND_HOLON = ENGAGEMENT_TIMELINE_CHILD_HOLONS.attemptBand;
/** ChannelMiniGanttBar — channel rows and form-visit rows share this renderer */
export const ENGAGEMENT_SEGMENT_BAR_HOLON = ENGAGEMENT_TIMELINE_CHILD_HOLONS.segmentBar;
export const ENGAGEMENT_EVENT_MARKER_HOLON = ENGAGEMENT_TIMELINE_CHILD_HOLONS.eventMarker;
export const ENGAGEMENT_ESCALATION_BAND_HOLON = ENGAGEMENT_TIMELINE_CHILD_HOLONS.escalationBand;

export const ENGAGEMENT_TIMELINE_CHILD_HOLONS_LIST: ContentChildHolon[] = [
  ENGAGEMENT_TIMELINE_CHILD_HOLONS.sequenceBar,
  ENGAGEMENT_TIMELINE_CHILD_HOLONS.attemptBand,
  ENGAGEMENT_TIMELINE_CHILD_HOLONS.segmentBar,
  ENGAGEMENT_TIMELINE_CHILD_HOLONS.eventMarker,
  ENGAGEMENT_TIMELINE_CHILD_HOLONS.escalationBand,
];
