import { useCallback, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
  type OnSelectionChangeFunc,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { PaletteBlock, WorkflowNodeData } from "../../../data/automationWorkflows";
import { AUTOMATION_EDGE_TYPE } from "../../../data/automationWorkflows";
import { AUTOMATION_CANVAS_CHILD_HOLONS } from "../../docs/automationHolons";
import { RegisterContentChildHolonsFromConfig } from "../../docs/RegisterContentChildHolons";
import type { Tokens } from "../../tokens";
import { AutomationEditorProvider } from "./AutomationEditorContext";
import { automationEdgeTypes } from "./automationEdgeTypes";
import { automationNodeTypes } from "./automationNodeTypes";

type AutomationWorkflowCanvasProps = {
  t: Tokens;
  isDark: boolean;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onInsertBlockOnEdge: (edgeId: string, block: PaletteBlock) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onNodesChange: OnNodesChange<Node<WorkflowNodeData>>;
  onEdgesChange: OnEdgesChange;
};

export function AutomationWorkflowCanvas({
  t,
  isDark,
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onInsertBlockOnEdge,
  onDeleteNode,
  onDuplicateNode,
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
      selectedNodeId={selectedNodeId}
      hoveredEdgeId={hoveredEdgeId}
      onSelectNode={onSelectNode}
      onEdgeHover={handleEdgeHover}
      onInsertBlockOnEdge={onInsertBlockOnEdge}
      onDeleteNode={onDeleteNode}
      onDuplicateNode={onDuplicateNode}
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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onSelectionChange={onSelectionChange}
          onEdgeMouseEnter={(_, edge) => handleEdgeHover(edge.id)}
          onEdgeMouseLeave={() => handleEdgeHover(null)}
          nodeTypes={automationNodeTypes}
          edgeTypes={automationEdgeTypes}
          defaultEdgeOptions={{ type: AUTOMATION_EDGE_TYPE }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          fitView
          fitViewOptions={{ padding: 0.35, maxZoom: 1 }}
          proOptions={{ hideAttribution: true }}
          style={{ width: "100%", height: "100%", background: "transparent" }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={18}
            size={1}
            color={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}
          />
          <Controls
            showInteractive={false}
            style={{
              border: `1px solid ${t.border}`,
              borderRadius: 6,
              overflow: "hidden",
              boxShadow: "none",
            }}
          />
        </ReactFlow>
      </div>
    </AutomationEditorProvider>
  );
}
