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
  { id: "hub", icon: "compass", label: "Hub", shortcut: "Ctrl+Shift+G" },
];

/**
 * Register consultant desk primary nav (plan Q1) — Board / Contacts / Meetings.
 * Hub authorship stays off the Register firm desk; production App still uses PRIMARY_NAV.
 */
export const REGISTER_PRIMARY_NAV: PrimaryNavItem[] = [
  { id: "board", icon: "grid-square-2x2", label: "Board", shortcut: "Ctrl+Shift+E" },
  { id: "contacts", icon: "user-squares", label: "Contacts", shortcut: "Ctrl+Shift+U" },
  { id: "meetings", icon: "calendar", label: "Meetings", shortcut: "Ctrl+Shift+M" },
];

export const ALL_NAV: PrimaryNavItem[] = [
  ...PRIMARY_NAV,
  { id: "clients", icon: "people", label: "Clients", shortcut: "Ctrl+Shift+C" },
  { id: "account", icon: "user-circle", label: "Account", shortcut: "" },
  { id: "settings", icon: "gear", label: "Settings", shortcut: "Ctrl+," },
];

/** Register more-menu — Hub omitted; Meetings already in primary strip. */
export const REGISTER_ALL_NAV: PrimaryNavItem[] = [
  ...REGISTER_PRIMARY_NAV,
  { id: "clients", icon: "people", label: "Clients", shortcut: "Ctrl+Shift+C" },
  { id: "account", icon: "user-circle", label: "Account", shortcut: "" },
  { id: "settings", icon: "gear", label: "Settings", shortcut: "Ctrl+," },
];
export const CONSOLE_NAV_ICON: NotionIconName = "document";
export const MORE_NAV_ICON: NotionIconName = "chevrons-down";
