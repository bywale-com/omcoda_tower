import type { EdgeTypes } from "@xyflow/react";
import { AUTOMATION_EDGE_TYPE } from "../../../data/automationWorkflows";
import { AutomationInsertEdge } from "./edges/AutomationInsertEdge";

export const automationEdgeTypes: EdgeTypes = {
  [AUTOMATION_EDGE_TYPE]: AutomationInsertEdge,
};
