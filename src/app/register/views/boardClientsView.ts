import { DEFAULT_SIDEBAR_WIDTH } from "../../constants/layout";
import type { RegisterViewManifest } from "./types";

/** Board sidebar when Board nav is active — clients list + tasks. */
export const BOARD_CLIENTS_VIEW: RegisterViewManifest = {
  id: "board-clients",
  title: "Board · Clients",
  subtitle: "Left sidebar — Board nav active",
  width: DEFAULT_SIDEBAR_WIDTH,
  region: "board-sidebar",
  activeNav: "board",
  contains: [
    { holonId: "primary-navigation", state: { activeNav: "board" } },
    { holonId: "clients-section" },
    {
      holonId: "board-body",
      children: [{ holonId: "client-row", pattern: true, instances: 2 }],
    },
    {
      holonId: "tasks-section",
      children: [{ holonId: "task-row", pattern: true, instances: 1 }],
    },
  ],
};
