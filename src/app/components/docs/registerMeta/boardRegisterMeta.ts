import {
  CLIENT_NAME_HOLON,
  CLIENT_ROW_HOLON,
  PHASE_SIGNAL_HOLON,
  ROW_ACTIONS_HOLON,
  TASK_LABEL_HOLON,
  TASK_META_HOLON,
  TASK_ROW_HOLON,
  TASK_STATUS_TOGGLE_HOLON,
  TASKS_SECTION_HOLON,
} from "../boardBodyHolons";
import { SHELL_HOLON_ORDER } from "../shellHolonOrder";
import type { RegisterHolonMeta } from "./types";

const BOARD_CLIENTS = "board-clients";

export const BOARD_REGISTER_HOLONS: RegisterHolonMeta[] = [
  {
    id: "primary-navigation",
    label: "Primary Navigation",
    icon: "compass",
    order: SHELL_HOLON_ORDER["primary-navigation"],
    parentId: null,
    views: [BOARD_CLIENTS],
    render: "primary-navigation",
  },
  {
    id: "clients-section",
    label: "Clients Section",
    icon: "people",
    order: SHELL_HOLON_ORDER["clients-section"],
    parentId: null,
    views: [BOARD_CLIENTS],
    render: "clients-section",
  },
  {
    id: "board-body",
    label: "Board Body",
    icon: "list-bullet",
    order: SHELL_HOLON_ORDER["board-body"],
    parentId: null,
    views: [BOARD_CLIENTS],
    render: "board-body",
  },
  {
    ...CLIENT_ROW_HOLON,
    parentId: "board-body",
    views: [BOARD_CLIENTS],
    render: "client-row",
    patternInstances: { [BOARD_CLIENTS]: 2 },
  },
  {
    ...PHASE_SIGNAL_HOLON,
    parentId: CLIENT_ROW_HOLON.id,
    views: [BOARD_CLIENTS],
    render: "phase-signal",
  },
  {
    ...CLIENT_NAME_HOLON,
    parentId: CLIENT_ROW_HOLON.id,
    views: [BOARD_CLIENTS],
    render: "client-name",
  },
  {
    ...ROW_ACTIONS_HOLON,
    parentId: CLIENT_ROW_HOLON.id,
    views: [BOARD_CLIENTS],
    render: "row-actions",
  },
  {
    ...TASKS_SECTION_HOLON,
    order: SHELL_HOLON_ORDER["tasks-section"],
    parentId: null,
    views: [BOARD_CLIENTS],
    render: "tasks-section",
  },
  {
    ...TASK_ROW_HOLON,
    parentId: TASKS_SECTION_HOLON.id,
    views: [BOARD_CLIENTS],
    render: "task-row",
    patternInstances: { [BOARD_CLIENTS]: 1 },
  },
  {
    ...TASK_STATUS_TOGGLE_HOLON,
    parentId: TASK_ROW_HOLON.id,
    views: [BOARD_CLIENTS],
    render: "task-status-toggle",
  },
  {
    ...TASK_LABEL_HOLON,
    parentId: TASK_ROW_HOLON.id,
    views: [BOARD_CLIENTS],
    render: "task-label",
  },
  {
    ...TASK_META_HOLON,
    parentId: TASK_ROW_HOLON.id,
    views: [BOARD_CLIENTS],
    render: "task-meta",
  },
];
