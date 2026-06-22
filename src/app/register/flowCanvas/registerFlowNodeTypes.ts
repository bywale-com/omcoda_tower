import type { NodeTypes } from "@xyflow/react";
import { RegisterFlowGraphNode } from "./nodes/RegisterFlowGraphNode";

export const registerFlowNodeTypes: NodeTypes = {
  registerFlowGraph: RegisterFlowGraphNode,
};

export const REGISTER_FLOW_GRAPH_NODE_TYPE = "registerFlowGraph";
