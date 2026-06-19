import type { HolonId } from "../../context/DocsHighlightContext";
import type { NotionIconName } from "../../icons/notion-icon-urls";
import {
  ENGAGEMENT_ATTEMPT_ROW_HOLON,
  ENGAGEMENT_CHANNEL_ROW_HOLON,
  ENGAGEMENT_EVENT_ROW_HOLON,
  ENGAGEMENT_ESCALATION_ROW_HOLON,
  ENGAGEMENT_FORM_VISIT_ROW_HOLON,
  ENGAGEMENT_SEQUENCE_ROW_HOLON,
} from "./engagementListHolons";
import { ENGAGEMENT_SEQUENCE_BAR_HOLON } from "./engagementTimelineHolons";
import { CLIENT_DATA_TAB_HOLONS, ENGAGEMENT_LIST_HOLON } from "./clientDataHolons";

export type HolonDetailLink = {
  id: HolonId;
  label: string;
};

export type HolonDetailSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  links?: HolonDetailLink[];
};

export type HolonDetailContent = {
  id: HolonId;
  label: string;
  icon: NotionIconName;
  summary: string;
  sections: HolonDetailSection[];
};

const ENGAGEMENT_CHART = CLIENT_DATA_TAB_HOLONS.logs.content;
const ENGAGEMENT_LIST = ENGAGEMENT_LIST_HOLON;

export const HOLON_DETAIL_CONTENT: Partial<Record<HolonId, HolonDetailContent>> = {
  [ENGAGEMENT_SEQUENCE_ROW_HOLON.id]: {
    id: ENGAGEMENT_SEQUENCE_ROW_HOLON.id,
    label: ENGAGEMENT_SEQUENCE_ROW_HOLON.label,
    icon: ENGAGEMENT_SEQUENCE_ROW_HOLON.icon,
    summary:
      "One row per nudge sequence in the engagement list — the top anchor for a sequence’s tree and its matching timeline lane.",
    sections: [
      {
        title: "Role",
        paragraphs: [
          "Sequence Row is the collapsible header for a single nudge sequence (e.g. 00f-optin-001-sarah-j). It names the sequence, shows its step badge, and toggles whether the attempt/channel/event tree beneath it is visible.",
        ],
      },
      {
        title: "How derived",
        paragraphs: [
          "Each row is emitted once per NudgeGroup when buildRows walks the client’s journey sequences. The live surface is NudgeGroupHeader — one pattern holon, many instances when multiple sequences are on screen.",
        ],
        links: [
          { id: ENGAGEMENT_LIST.id, label: ENGAGEMENT_LIST.label },
          { id: ENGAGEMENT_CHART.id, label: ENGAGEMENT_CHART.label },
        ],
      },
      {
        title: "What it enables",
        bullets: [
          "Expanding a sequence row renders its nested attempt, channel, form visit, event, and escalation rows in the list.",
          "The same sequence id drives a Sequence Bar in the engagement timeline — list row and gantt lane stay aligned.",
          "Collapse hides downstream row types from both the list and their in-view indicators in Console.",
        ],
        links: [
          { id: ENGAGEMENT_ATTEMPT_ROW_HOLON.id, label: ENGAGEMENT_ATTEMPT_ROW_HOLON.label },
          { id: ENGAGEMENT_CHANNEL_ROW_HOLON.id, label: ENGAGEMENT_CHANNEL_ROW_HOLON.label },
          { id: ENGAGEMENT_FORM_VISIT_ROW_HOLON.id, label: ENGAGEMENT_FORM_VISIT_ROW_HOLON.label },
          { id: ENGAGEMENT_EVENT_ROW_HOLON.id, label: ENGAGEMENT_EVENT_ROW_HOLON.label },
          { id: ENGAGEMENT_ESCALATION_ROW_HOLON.id, label: ENGAGEMENT_ESCALATION_ROW_HOLON.label },
          { id: ENGAGEMENT_SEQUENCE_BAR_HOLON.id, label: ENGAGEMENT_SEQUENCE_BAR_HOLON.label },
        ],
      },
    ],
  },
};

export function getHolonDetailContent(id: HolonId): HolonDetailContent | null {
  return HOLON_DETAIL_CONTENT[id] ?? null;
}
