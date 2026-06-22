import { useEffect, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Tokens } from "../../components/tokens";
import { getRegisterFlowStep } from "../flows";
import { buildFlowStepGraph } from "./buildFlowStepGraph";
import { registerFlowEdgeTypes } from "./registerFlowEdgeTypes";
import { registerFlowNodeTypes } from "./registerFlowNodeTypes";
import type { RegisterFlowGraphNodeData } from "./nodes/RegisterFlowGraphNode";

type RegisterFlowStepCanvasProps = {
  stepId: string;
  t: Tokens;
  isDark: boolean;
};

export function RegisterFlowStepCanvas({ stepId, t, isDark }: RegisterFlowStepCanvasProps) {
  const step = getRegisterFlowStep(stepId);
  const graph = useMemo(() => (step ? buildFlowStepGraph(step, t) : null), [step, t]);

  const [nodes, setNodes, onNodesChange] = useNodesState(graph?.nodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph?.edges ?? []);

  useEffect(() => {
    if (!graph) return;
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [graph, setNodes, setEdges]);

  useEffect(() => {
    setNodes((current) =>
      current.map((node) => ({
        ...node,
        data: { ...(node.data as RegisterFlowGraphNodeData), t },
      })),
    );
    setEdges((current) =>
      current.map((edge) => ({
        ...edge,
        markerEnd:
          typeof edge.markerEnd === "object" && edge.markerEnd
            ? { ...edge.markerEnd, color: t.textPrimary }
            : edge.markerEnd,
        style: { ...edge.style, stroke: t.textPrimary },
        data: edge.data ? { ...edge.data, t } : edge.data,
      })),
    );
  }, [t, setNodes, setEdges]);

  if (!step || !graph) {
    return null;
  }

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        background: isDark ? t.bgSecondary : t.hoverBg,
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          borderBottom: `1px solid ${t.border}`,
          background: t.bgSecondary,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, letterSpacing: "-0.01em" }}>
          {step.flowLabel} · {step.stepLabel}
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: t.textMuted }}>{step.purpose}</div>
      </div>
      <div style={{ height: "calc(100% - 57px)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={registerFlowNodeTypes}
          edgeTypes={registerFlowEdgeTypes}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          panOnScroll
          zoomOnScroll
          fitView
          fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
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
              borderRadius: 0,
              overflow: "hidden",
              boxShadow: "none",
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
