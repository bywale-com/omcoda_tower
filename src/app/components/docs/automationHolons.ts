import type { NotionIconName } from "../../icons/notion-icon-urls";
import type { ContentChildHolon } from "./clientDataHolons";

export const AUTOMATION_WORKFLOW_ACTIONS_HOLON = {
  id: "automation-workflow-actions",
  label: "Workflow Actions",
  icon: "cursor-click" as NotionIconName,
  order: 0,
};

export const AUTOMATION_WORKFLOW_EDITOR_HOLON = {
  id: "automation-workflow-editor",
  label: "Workflow Editor",
  icon: "lightning-bolt" as NotionIconName,
  order: 0,
};

export const AUTOMATION_EDITOR_TABS_HOLON = {
  id: "automation-editor-tabs",
  label: "Editor Tabs",
  icon: "list-bullet" as NotionIconName,
  order: 0,
};

export const AUTOMATION_WORKFLOW_TAB_HOLON = {
  id: "automation-workflow-tab",
  label: "Workflow Tab",
  icon: "compass" as NotionIconName,
  order: 1,
};

export const AUTOMATION_RUNS_TAB_HOLON = {
  id: "automation-runs-tab",
  label: "Runs Tab",
  icon: "list" as NotionIconName,
  order: 2,
};

export const AUTOMATION_SETTINGS_TAB_HOLON = {
  id: "automation-settings-tab",
  label: "Settings Tab",
  icon: "gear" as NotionIconName,
  order: 3,
};

export const AUTOMATION_ENROLLMENT_TAB_HOLON = {
  id: "automation-enrollment-tab",
  label: "Enrollment Tab",
  icon: "people" as NotionIconName,
  order: 4,
};

export const AUTOMATION_RUN_ROW_HOLON = {
  id: "automation-run-row",
  label: "Run Row",
  icon: "circle-dashed" as NotionIconName,
  order: 0,
};

export const AUTOMATION_WORKFLOW_CANVAS_HOLON = {
  id: "automation-workflow-canvas",
  label: "Workflow Canvas",
  icon: "compass" as NotionIconName,
  order: 0,
};

export const AUTOMATION_BUILD_PALETTE_HOLON = {
  id: "automation-build-palette",
  label: "Build Palette",
  icon: "wrench" as NotionIconName,
  order: 1,
};

export const AUTOMATION_NODE_PATTERN_HOLONS = {
  trigger: {
    id: "automation-trigger-node",
    label: "Trigger Node",
    icon: "lightning-bolt" as NotionIconName,
    order: 0,
  },
  rule: {
    id: "automation-rule-node",
    label: "Rule Node",
    icon: "lightning-bolt" as NotionIconName,
    order: 2,
  },
  constant: {
    id: "automation-constant-node",
    label: "Constant Node",
    icon: "gear" as NotionIconName,
    order: 1,
  },
  branch: {
    id: "automation-branch-node",
    label: "Branch Node",
    icon: "filter" as NotionIconName,
    order: 3,
  },
  action: {
    id: "automation-action-node",
    label: "Action Node",
    icon: "directional-sign" as NotionIconName,
    order: 4,
  },
  exit: {
    id: "automation-exit-node",
    label: "Exit Node",
    icon: "dot-circle" as NotionIconName,
    order: 5,
  },
} as const;

export const AUTOMATION_EDGE_INSERT_HOLON = {
  id: "automation-edge-insert",
  label: "Edge Insert Control",
  icon: "plus" as NotionIconName,
  order: 4,
};

export const AUTOMATION_CANVAS_CHILD_HOLONS: ContentChildHolon[] = [
  ...Object.values(AUTOMATION_NODE_PATTERN_HOLONS),
  AUTOMATION_EDGE_INSERT_HOLON,
];

export const AUTOMATION_EDITOR_TAB_HOLONS = [
  AUTOMATION_WORKFLOW_TAB_HOLON,
  AUTOMATION_RUNS_TAB_HOLON,
  AUTOMATION_SETTINGS_TAB_HOLON,
  AUTOMATION_ENROLLMENT_TAB_HOLON,
] as const;
