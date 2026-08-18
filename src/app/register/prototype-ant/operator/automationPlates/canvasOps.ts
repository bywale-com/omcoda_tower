import { createContext, useContext } from "react";
import type { WorkflowNodeType } from "../../../../data/automationWorkflows";

export type CanvasOps = {
  onDuplicate: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddAfter: (nodeId: string, blockId: string) => void;
  onSwitch: (nodeId: string) => void;
  onInsertOnEdge: (edgeId: string, blockId: string) => void;
};

export const CanvasOpsContext = createContext<CanvasOps | null>(null);

export function useCanvasOps(): CanvasOps | null {
  return useContext(CanvasOpsContext);
}

export function switchableKind(type: WorkflowNodeType | undefined): boolean {
  return type === "trigger" || type === "action";
}
