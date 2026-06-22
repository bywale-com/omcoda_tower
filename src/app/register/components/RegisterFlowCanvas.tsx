import { useCallback, useEffect, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Tokens } from "../../components/tokens";
import { createRegisterCanvasNodes } from "../canvas/createRegisterCanvasNodes";
import { RegisterCanvasFlowWires } from "../canvas/RegisterCanvasFlowWires";
import { registerCanvasNodeTypes } from "../canvas/registerCanvasNodeTypes";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import type { RegisterSystemNodeData } from "../canvas/RegisterSystemNode";
import {
  loadRegisterSystemPositions,
  saveRegisterSystemPosition,
} from "../systems/registerSystemLayout";
import {
  loadRegisterViewPositions,
  saveRegisterViewPosition,
} from "../canvas/registerViewLayout";
import type { RegisterViewFrameNodeData } from "../canvas/RegisterViewFrameNode";
import type { RegisterTableNodeData } from "../canvas/RegisterTableNode";
import {
  loadRegisterTablePositions,
  saveRegisterTablePosition,
} from "../tables/registerTableLayout";

type RegisterCanvasNodeData = RegisterViewFrameNodeData | RegisterSystemNodeData | RegisterTableNodeData;

type RegisterFlowCanvasProps = {
  t: Tokens;
  isDark: boolean;
};

function RegisterFlowCanvasInner({ t, isDark }: RegisterFlowCanvasProps) {
  const { selectFlowStep, selectFlow } = useRegisterSelection();
  const savedViewPositions = useMemo(() => loadRegisterViewPositions(), []);
  const savedSystemPositions = useMemo(() => loadRegisterSystemPositions(), []);
  const savedTablePositions = useMemo(() => loadRegisterTablePositions(), []);
  const hasSavedLayout =
    Object.keys(savedViewPositions).length > 0 ||
    Object.keys(savedSystemPositions).length > 0 ||
    Object.keys(savedTablePositions).length > 0;

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<RegisterCanvasNodeData>>(
    createRegisterCanvasNodes(t, savedViewPositions, savedSystemPositions, savedTablePositions),
  );

  const nodeTypes = useMemo(() => registerCanvasNodeTypes, []);

  useEffect(() => {
    setNodes((current) =>
      current.map((node) => ({
        ...node,
        data: { ...node.data, t },
      })),
    );
  }, [t, setNodes]);

  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: Node<RegisterCanvasNodeData>) => {
    if (node.type === "registerViewFrame" && "viewId" in node.data) {
      saveRegisterViewPosition(node.data.viewId, node.position);
      return;
    }
    if (node.type === "registerSystemNode" && "systemId" in node.data) {
      saveRegisterSystemPosition(node.data.systemId, node.position);
      return;
    }
    if (node.type === "registerTableNode" && "tableId" in node.data) {
      saveRegisterTablePosition(node.data.tableId, node.position);
    }
  }, []);

  const onPaneClick = useCallback(() => {
    selectFlowStep(null);
    selectFlow(null);
  }, [selectFlowStep, selectFlow]);

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        background: isDark ? t.bgSecondary : t.hoverBg,
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        panOnScroll
        zoomOnScroll
        minZoom={0.25}
        maxZoom={2}
        fitView={!hasSavedLayout}
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
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
        <RegisterCanvasFlowWires t={t} />
      </ReactFlow>
    </div>
  );
}

export function RegisterFlowCanvas(props: RegisterFlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <RegisterFlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
