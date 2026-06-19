import type { NotionIconName } from "../../icons/notion-icon-urls";

export type PrimaryNavItem = {
  id: string;
  icon: NotionIconName;
  label: string;
  shortcut: string;
};

/** Visible strip — icons match Primary Navigation holon surfaces */
export const PRIMARY_NAV: PrimaryNavItem[] = [
  { id: "board", icon: "grid-square-2x2", label: "Board", shortcut: "Ctrl+Shift+E" },
  { id: "contacts", icon: "user-squares", label: "Contacts", shortcut: "Ctrl+Shift+U" },
  { id: "git", icon: "git", label: "Pipeline", shortcut: "Ctrl+Shift+G" },
];

export const ALL_NAV: PrimaryNavItem[] = [
  ...PRIMARY_NAV,
  { id: "clients", icon: "people", label: "Clients", shortcut: "Ctrl+Shift+C" },
  { id: "account", icon: "user-circle", label: "Account", shortcut: "" },
  { id: "settings", icon: "gear", label: "Settings", shortcut: "Ctrl+," },
];

export const DOCS_MODE_NAV_ICON: NotionIconName = "document";
export const MORE_NAV_ICON: NotionIconName = "chevrons-down";
