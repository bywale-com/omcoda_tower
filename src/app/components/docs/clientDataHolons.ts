import type { NotionIconName } from "../../icons/notion-icon-urls";
import type { HolonLucideIconName } from "./holonIcons";
import { ENGAGEMENT_LIST_ROW_HOLONS_LIST } from "./engagementListHolons";
import { ENGAGEMENT_TIMELINE_CHILD_HOLONS_LIST } from "./engagementTimelineHolons";

export type PanelTab = "read" | "data" | "logs";

/** Tab chips — single source for labels shown in UI and Console tree */
export const PANEL_CHIPS: { id: PanelTab; label: string }[] = [
  { id: "read", label: "Information" },
  { id: "data", label: "History" },
  { id: "logs", label: "Activity" },
];

export type ContentChildHolon = {
  id: string;
  label: string;
  icon?: NotionIconName;
  lucideIcon?: HolonLucideIconName;
  order: number;
  children?: ContentChildHolon[];
};

export type TabContentHolon = {
  id: string;
  label: string;
  icon: NotionIconName;
  children?: ContentChildHolon[];
};

type TabHolonMeta = {
  icon: NotionIconName;
  order: number;
  content: TabContentHolon;
};

export const CRS_HISTORY_CHILD_HOLONS = {
  scrubber: {
    id: "crs-scrubber",
    label: "CRS Scrubber",
    icon: "cursor-click" as NotionIconName,
    order: 0,
  },
  stats: {
    id: "crs-stats",
    label: "CRS Stats",
    icon: "chart-bar-horizontal" as NotionIconName,
    order: 1,
  },
  chart: {
    id: "crs-chart",
    label: "CRS Chart",
    icon: "chart-bar-line" as NotionIconName,
    order: 2,
  },
} as const;

export const ENGAGEMENT_CHILD_HOLONS = {
  list: {
    id: "engagement-list",
    label: "Engagement List",
    icon: "list" as NotionIconName,
    order: 0,
    children: ENGAGEMENT_LIST_ROW_HOLONS_LIST,
  },
  timeline: {
    id: "engagement-timeline",
    label: "Engagement Timeline",
    icon: "chart-bar-horizontal" as NotionIconName,
    order: 1,
    children: ENGAGEMENT_TIMELINE_CHILD_HOLONS_LIST,
  },
} as const;

export const CRS_SCRUBBER_HOLON = CRS_HISTORY_CHILD_HOLONS.scrubber;
export const CRS_STATS_HOLON = CRS_HISTORY_CHILD_HOLONS.stats;
export const CRS_CHART_HOLON = CRS_HISTORY_CHILD_HOLONS.chart;
export const ENGAGEMENT_LIST_HOLON = ENGAGEMENT_CHILD_HOLONS.list;
export const ENGAGEMENT_TIMELINE_HOLON = ENGAGEMENT_CHILD_HOLONS.timeline;

/** Per-tab holon metadata — extend here when tab bodies gain sub-panels */
export const CLIENT_DATA_TAB_HOLONS: Record<PanelTab, TabHolonMeta> = {
  read: {
    icon: "information-circle",
    order: 0,
    content: { id: "profile-table", label: "Profile Table", icon: "checkmark-list" },
  },
  data: {
    icon: "chart-bar-line",
    order: 1,
    content: {
      id: "crs-history",
      label: "CRS History",
      icon: "chart-bar-vertical",
      children: [
        CRS_HISTORY_CHILD_HOLONS.scrubber,
        CRS_HISTORY_CHILD_HOLONS.stats,
        CRS_HISTORY_CHILD_HOLONS.chart,
      ],
    },
  },
  logs: {
    icon: "lightning-bolt",
    order: 2,
    content: {
      id: "activity-panel",
      label: "Engagement Chart",
      icon: "lightning-bolt",
      children: [
        ENGAGEMENT_CHILD_HOLONS.list,
        ENGAGEMENT_CHILD_HOLONS.timeline,
      ],
    },
  },
};

export function tabHolonId(tab: PanelTab): string {
  return `data-panel-tab-${tab}`;
}

/** Header actions — sibling holons under Client Data Header */
export const CLIENT_DATA_OPEN_TAB_HOLON = {
  id: "client-data-open-tab",
  label: "Open in Tab",
  lucideIcon: "external-link" as const,
  order: -1,
};
