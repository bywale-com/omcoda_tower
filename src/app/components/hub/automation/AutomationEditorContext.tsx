import { createContext, useContext, type ReactNode } from "react";
import type { AutomationDataClassId } from "../../../data/automationEvents";
import type { PaletteBlock } from "../../../data/automationWorkflows";
import type { Tokens } from "../../tokens";

type AutomationEditorContextValue = {
  t: Tokens;
  isDark: boolean;
  workflowId: string;
  selectedNodeId: string | null;
  hoveredEdgeId: string | null;
  configPanelNodeId: string | null;
  manualRunActive: boolean;
  onSelectNode: (id: string | null) => void;
  onEdgeHover: (edgeId: string | null) => void;
  onInsertBlockOnEdge: (edgeId: string, block: PaletteBlock) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onAttachBlockAfterNode: (nodeId: string, block: PaletteBlock, sourceHandle?: string) => void;
  onOpenNodeConfig: (nodeId: string) => void;
  onCloseNodeConfig: () => void;
  onOpenClassFilter: (nodeId: string, classId: AutomationDataClassId) => void;
  onToggleManualRun: (nodeId: string) => void;
};

const AutomationEditorContext = createContext<AutomationEditorContextValue | null>(null);

export function AutomationEditorProvider({
  t,
  isDark,
  workflowId,
  selectedNodeId,
  hoveredEdgeId,
  configPanelNodeId,
  manualRunActive,
  onSelectNode,
  onEdgeHover,
  onInsertBlockOnEdge,
  onDeleteNode,
  onDuplicateNode,
  onAttachBlockAfterNode,
  onOpenNodeConfig,
  onCloseNodeConfig,
  onOpenClassFilter,
  onToggleManualRun,
  children,
}: AutomationEditorContextValue & { children: ReactNode }) {
  return (
    <AutomationEditorContext.Provider
      value={{
        t,
        isDark,
        workflowId,
        selectedNodeId,
        hoveredEdgeId,
        configPanelNodeId,
        manualRunActive,
        onSelectNode,
        onEdgeHover,
        onInsertBlockOnEdge,
        onDeleteNode,
        onDuplicateNode,
        onAttachBlockAfterNode,
        onOpenNodeConfig,
        onCloseNodeConfig,
        onOpenClassFilter,
        onToggleManualRun,
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
