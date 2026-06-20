/**
 * Shared shadcn chrome aligned with sidebar / Console tree typography.
 * CSS source of truth: `tower-chrome-*` classes in `src/styles/theme.css`
 * (sizes derive from `--tower-tree-scale`, must match `TREE_SCALE` in treeLayout.ts).
 */

/** Popover / flyout panel shell */
export const TOWER_POPOVER_CONTENT_CLASS =
  "tower-chrome-surface w-48 p-1 text-popover-foreground";

/** Nested flyout anchored to a parent popover row */
export const TOWER_POPOVER_SUBMENU_CLASS =
  "tower-chrome-surface absolute left-full top-0 z-50 ml-1 rounded-md border bg-popover p-1 text-popover-foreground shadow-md";

/** Full-width menu row (overrides global `button` base styles from theme.css) */
export const TOWER_POPOVER_MENU_ITEM_CLASS =
  "tower-chrome-menu-item flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left outline-none hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40";

/** Trailing meta in a menu row (date, phone, counts) */
export const TOWER_POPOVER_MENU_META_CLASS =
  "tower-chrome-meta shrink-0 text-muted-foreground";

/** Secondary hint line under a menu action */
export const TOWER_POPOVER_MENU_HINT_CLASS =
  "tower-chrome-hint px-2 py-1 text-muted-foreground";

/** Toolbar strip at top of a multi-step popover (select all, continue, etc.) */
export const TOWER_POPOVER_TOOLBAR_CLASS =
  "flex items-center gap-1 border-b border-border px-1 py-1";

/** Square icon-only control in a popover toolbar */
export const TOWER_POPOVER_ICON_BUTTON_CLASS =
  "inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground";

/** Primary action in a popover toolbar (e.g. Continue) */
export const TOWER_POPOVER_PRIMARY_ACTION_CLASS =
  "tower-chrome-menu-item shrink-0 rounded-sm px-2 py-1 outline-none enabled:cursor-pointer enabled:bg-primary enabled:text-primary-foreground enabled:hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60";

/** Dialog list rows — same profile as popover menus */
export const TOWER_DIALOG_MENU_ITEM_CLASS =
  "tower-chrome-menu-item cursor-pointer rounded-sm px-2 py-1.5 outline-none hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40";

/** Dialog title — matches tree label profile */
export const TOWER_DIALOG_TITLE_CLASS = "tower-chrome-surface text-foreground";

/** Dialog description / column headers */
export const TOWER_DIALOG_HINT_CLASS = "tower-chrome-hint text-muted-foreground";

/** Dialog body label cells */
export const TOWER_DIALOG_BODY_TEXT_CLASS = "tower-chrome-surface text-foreground";
