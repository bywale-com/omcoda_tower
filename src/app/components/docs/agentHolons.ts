import type { NotionIconName } from "../../icons/notion-icon-urls";
import type { ContentChildHolon } from "./clientDataHolons";

export const AGENT_HEADER_ACTIONS_HOLON = {
  id: "agent-header-actions",
  label: "Agent Actions",
  icon: "cursor-click" as NotionIconName,
  order: 0,
};

export const AGENT_EDITOR_HOLON = {
  id: "agent-editor",
  label: "Agent Editor",
  icon: "user" as NotionIconName,
  order: 0,
};

export const AGENT_EDITOR_TABS_HOLON = {
  id: "agent-editor-tabs",
  label: "Editor Tabs",
  icon: "list-bullet" as NotionIconName,
  order: 0,
};

export const AGENT_EDITOR_TAB_HOLON = {
  id: "agent-editor-tab",
  label: "Editor Tab",
  icon: "compass" as NotionIconName,
  order: 1,
};

export const AGENT_CONTACTS_TAB_HOLON = {
  id: "agent-contacts-tab",
  label: "Contacts Tab",
  icon: "people" as NotionIconName,
  order: 2,
};

export const AGENT_ACTIVITY_TAB_HOLON = {
  id: "agent-activity-tab",
  label: "Activity Tab",
  icon: "clock" as NotionIconName,
  order: 3,
};

export const AGENT_REPORT_TAB_HOLON = {
  id: "agent-report-tab",
  label: "Report Tab",
  icon: "chart-bar-horizontal" as NotionIconName,
  order: 4,
};

export const AGENT_SETTINGS_TAB_HOLON = {
  id: "agent-settings-tab",
  label: "Settings Tab",
  icon: "gear" as NotionIconName,
  order: 5,
};

export const AGENT_STEP_TOOLBAR_HOLON = {
  id: "agent-step-toolbar",
  label: "Step Toolbar",
  icon: "dependency" as NotionIconName,
  order: 0,
};

export const AGENT_EMPTY_STATE_HOLON = {
  id: "agent-empty-state",
  label: "Empty Agent State",
  icon: "directional-sign" as NotionIconName,
  order: 1,
};

export const AGENT_STEP_RAIL_HOLON = {
  id: "agent-step-rail",
  label: "Step Rail",
  icon: "list" as NotionIconName,
  order: 2,
};

export const AGENT_SEQUENCE_CANVAS_HOLON = {
  id: "agent-sequence-canvas",
  label: "Sequence Canvas",
  icon: "compass" as NotionIconName,
  order: 3,
};

export const AGENT_STEP_NODE_PATTERN_HOLONS = {
  email: {
    id: "agent-email-step-node",
    label: "Email Step Node",
    icon: "document" as NotionIconName,
    order: 0,
  },
  task: {
    id: "agent-task-step-node",
    label: "Task Step Node",
    icon: "checkmark-list" as NotionIconName,
    order: 1,
  },
} as const;

export const AGENT_STEP_CONDITION_HOLON = {
  id: "agent-step-condition",
  label: "Step Condition",
  icon: "clock" as NotionIconName,
  order: 2,
};

export const AGENT_ADD_STEP_HOLON = {
  id: "agent-add-step",
  label: "Add Step Control",
  icon: "plus" as NotionIconName,
  order: 3,
};

export const AGENT_SEQUENCE_CANVAS_CHILD_HOLONS: ContentChildHolon[] = [
  ...Object.values(AGENT_STEP_NODE_PATTERN_HOLONS),
  AGENT_STEP_CONDITION_HOLON,
  AGENT_ADD_STEP_HOLON,
];

export const AGENT_EDITOR_TAB_HOLONS = [
  AGENT_EDITOR_TAB_HOLON,
  AGENT_CONTACTS_TAB_HOLON,
  AGENT_ACTIVITY_TAB_HOLON,
  AGENT_REPORT_TAB_HOLON,
  AGENT_SETTINGS_TAB_HOLON,
] as const;

export const AGENT_EMPTY_STATE_CHILD_HOLONS: ContentChildHolon[] = [AGENT_ADD_STEP_HOLON];
