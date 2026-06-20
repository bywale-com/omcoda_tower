import { createContext, useContext, type ReactNode } from "react";
import type { PaletteBlock } from "../../../data/automationWorkflows";
import type { Tokens } from "../../tokens";

type AutomationEditorContextValue = {
  t: Tokens;
  isDark: boolean;
  selectedNodeId: string | null;
  hoveredEdgeId: string | null;
  onSelectNode: (id: string | null) => void;
  onEdgeHover: (edgeId: string | null) => void;
  onInsertBlockOnEdge: (edgeId: string, block: PaletteBlock) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
};

const AutomationEditorContext = createContext<AutomationEditorContextValue | null>(null);

export function AutomationEditorProvider({
  t,
  isDark,
  selectedNodeId,
  hoveredEdgeId,
  onSelectNode,
  onEdgeHover,
  onInsertBlockOnEdge,
  onDeleteNode,
  onDuplicateNode,
  children,
}: AutomationEditorContextValue & { children: ReactNode }) {
  return (
    <AutomationEditorContext.Provider
      value={{
        t,
        isDark,
        selectedNodeId,
        hoveredEdgeId,
        onSelectNode,
        onEdgeHover,
        onInsertBlockOnEdge,
        onDeleteNode,
        onDuplicateNode,
      }}
    >
      {children}
    </AutomationEditorContext.Provider>
  );
}

export function useAutomationEditor() {
  const ctx = useContext(AutomationEditorContext);
  if (!ctx) {
    throw new Error("useAutomationEditor must be used within AutomationEditorProvider");
  }
  return ctx;
}
