import type { NotionIconName } from "../../icons/notion-icon-urls";

export type PanelTab = "read" | "data" | "logs";

/** Tab chips — single source for labels shown in UI and docs tree */
export const PANEL_CHIPS: { id: PanelTab; label: string }[] = [
  { id: "read", label: "Information" },
  { id: "data", label: "History" },
  { id: "logs", label: "Activity" },
];

type TabHolonMeta = {
  icon: NotionIconName;
  order: number;
  content: { id: string; label: string; icon: NotionIconName };
};

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
    content: { id: "crs-history", label: "CRS History", icon: "chart-bar-vertical" },
  },
  logs: {
    icon: "lightning-bolt",
    order: 2,
    content: { id: "activity-panel", label: "Engagement Chart", icon: "lightning-bolt" },
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
