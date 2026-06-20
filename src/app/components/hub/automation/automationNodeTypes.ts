import type { NodeTypes } from "@xyflow/react";
import { ActionNode } from "./nodes/ActionNode";
import { BranchNode } from "./nodes/BranchNode";
import { ExitNode } from "./nodes/ExitNode";
import { TriggerNode } from "./nodes/TriggerNode";

export const automationNodeTypes: NodeTypes = {
  trigger: TriggerNode,
  branch: BranchNode,
  action: ActionNode,
  exit: ExitNode,
};
