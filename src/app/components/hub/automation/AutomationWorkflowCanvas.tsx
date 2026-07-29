import { useCallback, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
  type OnSelectionChangeFunc,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { AutomationDataClassId } from "../../../data/automationEvents";
import type { PaletteBlock, WorkflowNodeData, WorkflowTriggerKind } from "../../../data/automationWorkflows";
import { AUTOMATION_EDGE_TYPE } from "../../../data/automationWorkflows";
import { AUTOMATION_CANVAS_CHILD_HOLONS } from "../../docs/automationHolons";
import { RegisterContentChildHolonsFromConfig } from "../../docs/RegisterContentChildHolons";
import type { Tokens } from "../../tokens";
import { AutomationEditorProvider } from "./AutomationEditorContext";
import { AutomationEmptyCanvas } from "./AutomationEmptyCanvas";
import { automationEdgeTypes } from "./automationEdgeTypes";
import { automationNodeTypes } from "./automationNodeTypes";

type AutomationWorkflowCanvasProps = {
  t: Tokens;
  isDark: boolean;
  workflowId: string;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  configPanelNodeId: string | null;
  manualRunActive: boolean;
  onSelectNode: (id: string | null) => void;
  onInsertBlockOnEdge: (edgeId: string, block: PaletteBlock) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onAttachBlockAfterNode: (nodeId: string, block: PaletteBlock, sourceHandle?: string) => void;
  onConnectNodes: (connection: Connection) => void;
  onAddTrigger: (triggerKind: WorkflowTriggerKind) => void;
  onOpenNodeConfig: (nodeId: string) => void;
  onCloseNodeConfig: () => void;
  onOpenClassFilter: (nodeId: string, classId: AutomationDataClassId) => void;
  onToggleManualRun: (nodeId: string) => void;
  onNodesChange: OnNodesChange<Node<WorkflowNodeData>>;
  onEdgesChange: OnEdgesChange;
};

export function AutomationWorkflowCanvas({
  t,
  isDark,
  workflowId,
  nodes,
  edges,
  selectedNodeId,
  configPanelNodeId,
  manualRunActive,
  onSelectNode,
  onInsertBlockOnEdge,
  onDeleteNode,
  onDuplicateNode,
  onAttachBlockAfterNode,
  onConnectNodes,
  onAddTrigger,
  onOpenNodeConfig,
  onCloseNodeConfig,
  onOpenClassFilter,
  onToggleManualRun,
  onNodesChange,
  onEdgesChange,
}: AutomationWorkflowCanvasProps) {
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const hideEdgeTimerRef = useRef<number | null>(null);

  const clearHideEdgeTimer = useCallback(() => {
    if (hideEdgeTimerRef.current !== null) {
      window.clearTimeout(hideEdgeTimerRef.current);
      hideEdgeTimerRef.current = null;
    }
  }, []);

  const handleEdgeHover = useCallback(
    (edgeId: string | null) => {
      clearHideEdgeTimer();
      if (edgeId) {
        setHoveredEdgeId(edgeId);
        return;
      }
      hideEdgeTimerRef.current = window.setTimeout(() => {
        setHoveredEdgeId(null);
        hideEdgeTimerRef.current = null;
      }, 120);
    },
    [clearHideEdgeTimer],
  );

  const onSelectionChange: OnSelectionChangeFunc = ({ nodes: selectedNodes }) => {
    onSelectNode(selectedNodes[0]?.id ?? null);
  };

  return (
    <AutomationEditorProvider
      t={t}
      isDark={isDark}
      workflowId={workflowId}
      selectedNodeId={selectedNodeId}
      hoveredEdgeId={hoveredEdgeId}
      configPanelNodeId={configPanelNodeId}
      manualRunActive={manualRunActive}
      onSelectNode={onSelectNode}
      onEdgeHover={handleEdgeHover}
      onInsertBlockOnEdge={onInsertBlockOnEdge}
      onDeleteNode={onDeleteNode}
      onDuplicateNode={onDuplicateNode}
      onAttachBlockAfterNode={onAttachBlockAfterNode}
      onOpenNodeConfig={onOpenNodeConfig}
      onCloseNodeConfig={onCloseNodeConfig}
      onOpenClassFilter={onOpenClassFilter}
      onToggleManualRun={onToggleManualRun}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          height: "100%",
          background: isDark ? t.bgSecondary : t.hoverBg,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <RegisterContentChildHolonsFromConfig
          children={AUTOMATION_CANVAS_CHILD_HOLONS}
          inView={nodes.length > 0}
          t={t}
        />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={automationNodeTypes}
          edgeTypes={automationEdgeTypes}
          defaultEdgeOptions={{ type: AUTOMATION_EDGE_TYPE }}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnectNodes}
          onSelectionChange={onSelectionChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable
          nodesConnectable
          elementsSelectable
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={18}
            size={1.5}
            color={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}
          />
          <Controls showInteractive={false} />
          {nodes.length === 0 && (
            <AutomationEmptyCanvas t={t} onAddTrigger={onAddTrigger} />
          )}
        </ReactFlow>
      </div>
    </AutomationEditorProvider>
  );
}
