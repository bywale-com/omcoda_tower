import type { HowGraph, HowNode } from "./types";

export function getHowNode(graph: HowGraph, nodeId: string): HowNode | undefined {
  return graph.nodes.find((node) => node.id === nodeId);
}

export function getHowNodeChildren(graph: HowGraph, nodeId: string): HowNode[] {
  return graph.nodes
    .filter((node) => node.parentId === nodeId)
    .sort((a, b) => a.position.x - b.position.x);
}
