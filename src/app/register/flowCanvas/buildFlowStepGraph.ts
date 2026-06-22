import { MarkerType, type Edge, type Node } from "@xyflow/react";
import type { Tokens } from "../../components/tokens";
import type { RegisterFlowStep } from "../flows/types";
import { REGISTER_FLOW_GRAPH_NODE_TYPE } from "./registerFlowNodeTypes";
import { REGISTER_FLOW_WIRE_EDGE_TYPE } from "./registerFlowEdgeTypes";
import type { RegisterFlowGraphNodeData } from "./nodes/RegisterFlowGraphNode";

export function buildFlowStepGraph(
  step: RegisterFlowStep,
  t: Tokens,
): {
  nodes: Node<RegisterFlowGraphNodeData>[];
  edges: Edge[];
} {
  const nodes: Node<RegisterFlowGraphNodeData>[] = step.nodes.map((node) => ({
    id: node.id,
    type: REGISTER_FLOW_GRAPH_NODE_TYPE,
    position: node.position,
    draggable: true,
    selectable: true,
    data: {
      label: node.label,
      kind: node.kind,
      boundary: node.boundary,
      holonId: node.holonId,
      viewId: node.viewId,
      t,
    },
  }));

  const edges: Edge[] = step.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: REGISTER_FLOW_WIRE_EDGE_TYPE,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: t.textPrimary,
    },
    style: {
      stroke: t.textPrimary,
      strokeWidth: 2,
    },
    data: {
      label: edge.label,
      wireMeta: edge.wireMeta,
      t,
    },
  }));

  return { nodes, edges };
}
