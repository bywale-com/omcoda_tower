import type { NotionIconName } from "../../icons/notion-icon-urls";

/** Repeating holons under Board Body — one registry entry, many live instances */
export const CLIENT_ROW_HOLON = {
  id: "client-row",
  label: "Client Row",
  icon: "user" as NotionIconName,
  order: 0,
};

/** Children of Client Row — pattern holons co-located with row config */
export const CLIENT_ROW_CHILD_HOLONS = {
  phaseSignal: {
    id: "phase-signal",
    label: "Phase Signal",
    icon: "lightning-bolt" as NotionIconName,
    order: 0,
  },
  clientName: {
    id: "client-name",
    label: "Client Name",
    icon: "tag" as NotionIconName,
    order: 1,
  },
  rowActions: {
    id: "row-actions",
    label: "Row Actions",
    lucideIcon: "more-horizontal" as const,
    order: 2,
  },
} as const;

export const PHASE_SIGNAL_HOLON = CLIENT_ROW_CHILD_HOLONS.phaseSignal;
export const CLIENT_NAME_HOLON = CLIENT_ROW_CHILD_HOLONS.clientName;
export const ROW_ACTIONS_HOLON = CLIENT_ROW_CHILD_HOLONS.rowActions;

export const TASKS_SECTION_HOLON = {
  id: "tasks-section",
  label: "Tasks Section",
  icon: "checkmark-list" as NotionIconName,
  order: 1,
};

export const TASK_ROW_HOLON = {
  id: "task-row",
  label: "Task Row",
  icon: "pencil-list" as NotionIconName,
  order: 0,
};

/** Children of Task Row — pattern holons co-located with row config */
export const TASK_ROW_CHILD_HOLONS = {
  statusToggle: {
    id: "task-status-toggle",
    label: "Status Toggle",
    lucideIcon: "check-square" as const,
    order: 0,
  },
  taskLabel: {
    id: "task-label",
    label: "Task Label",
    icon: "document" as NotionIconName,
    order: 1,
  },
  taskMeta: {
    id: "task-meta",
    label: "Task Meta",
    icon: "information-circle" as NotionIconName,
    order: 2,
  },
} as const;

export const TASK_STATUS_TOGGLE_HOLON = TASK_ROW_CHILD_HOLONS.statusToggle;
export const TASK_LABEL_HOLON = TASK_ROW_CHILD_HOLONS.taskLabel;
export const TASK_META_HOLON = TASK_ROW_CHILD_HOLONS.taskMeta;
