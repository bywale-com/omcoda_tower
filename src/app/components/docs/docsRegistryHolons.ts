import type { NotionIconName } from "../../icons/notion-icon-urls";

export const DOCS_HOME_BRANCH_HOLON = {
  id: "docs-home-branch",
  label: "Home",
  icon: "house" as NotionIconName,
  order: 0,
};

export const DOCS_PANELS_BRANCH_HOLON = {
  id: "docs-panels-branch",
  label: "Panels",
  icon: "grid-square-2x2" as NotionIconName,
  order: 1,
};

/** Repeating Console column row — one registry entry, many live instances */
export const DOCS_OUTLINE_ROW_HOLON = {
  id: "docs-outline-row",
  label: "Console Outline Row",
  icon: "list-bullet" as NotionIconName,
  order: 2,
};

/** Children of Console Outline Row — UI slots shared by every outline row */
export const DOCS_OUTLINE_ROW_CHILD_HOLONS = {
  name: {
    id: "docs-row-name",
    label: "Row Name",
    icon: "tag" as NotionIconName,
    order: 0,
  },
  inViewIndicator: {
    id: "docs-inview-indicator",
    label: "In-View Indicator",
    icon: "eye" as NotionIconName,
    order: 1,
  },
  rowActions: {
    id: "docs-row-actions",
    label: "Row Actions",
    lucideIcon: "more-horizontal" as const,
    order: 2,
  },
} as const;

export const DOCS_ROW_NAME_HOLON = DOCS_OUTLINE_ROW_CHILD_HOLONS.name;
export const DOCS_INVIEW_INDICATOR_HOLON = DOCS_OUTLINE_ROW_CHILD_HOLONS.inViewIndicator;
export const DOCS_ROW_ACTIONS_HOLON = DOCS_OUTLINE_ROW_CHILD_HOLONS.rowActions;

/** Placeholder Home entries — visual only, not registered holons (link to external docs later) */
export const DOCS_HOME_PLACEHOLDER_ENTRIES = [
  { id: "learning", label: "Learning", icon: "graduation-cap" as NotionIconName },
  { id: "softwares", label: "Softwares", icon: "cursor-click" as NotionIconName },
  { id: "tools", label: "Tools", icon: "wrench" as NotionIconName },
  { id: "inspiration", label: "Inspiration", icon: "cloud" as NotionIconName },
  { id: "brain-dump", label: "Brain Dump", icon: "pencil-list" as NotionIconName },
] as const;
