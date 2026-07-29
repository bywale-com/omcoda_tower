import type { NodeTypes } from "@xyflow/react";
import { ActionNode } from "./nodes/ActionNode";
import { BranchNode } from "./nodes/BranchNode";
import { ConstantNode } from "./nodes/ConstantNode";
import { ExitNode } from "./nodes/ExitNode";
import { RuleNode } from "./nodes/RuleNode";
import { TriggerNode } from "./nodes/TriggerNode";

export const automationNodeTypes: NodeTypes = {
  trigger: TriggerNode,
  constant: ConstantNode,
  branch: BranchNode,
  rule: RuleNode,
  action: ActionNode,
  exit: ExitNode,
};
