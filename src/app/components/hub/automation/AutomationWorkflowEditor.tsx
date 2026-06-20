import { useEdgesState, useNodesState } from "@xyflow/react";
import { PanelRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createNodeFromBlock,
  deleteWorkflowNode,
  duplicateWorkflowNode,
  getDetachedNodePosition,
  insertNodeOnEdge,
  type PaletteBlock,
  type WorkflowDefinition,
  type WorkflowEditorTab,
  type WorkflowNodeData,
} from "../../../data/automationWorkflows";
import {
  AUTOMATION_BUILD_PALETTE_HOLON,
  AUTOMATION_EDITOR_TABS_HOLON,
  AUTOMATION_ENROLLMENT_TAB_HOLON,
  AUTOMATION_SETTINGS_TAB_HOLON,
  AUTOMATION_WORKFLOW_CANVAS_HOLON,
  AUTOMATION_WORKFLOW_EDITOR_HOLON,
  AUTOMATION_WORKFLOW_TAB_HOLON,
} from "../../docs/automationHolons";
import { HolonBoundary } from "../../docs/HolonBoundary";
import { DOCS_TREE_LABEL_SIZE } from "../../docs/treeLayout";
import { cn } from "../../ui/utils";
import type { Tokens } from "../../tokens";
import { AutomationBuildPalette } from "./AutomationBuildPalette";
import { AutomationWorkflowCanvas } from "./AutomationWorkflowCanvas";

const EDITOR_TABS: { id: WorkflowEditorTab; label: string }[] = [
  { id: "workflow", label: "Workflow" },
  { id: "settings", label: "Settings" },
  { id: "enrollment", label: "Enrollment" },
];

type AutomationWorkflowEditorProps = {
  workflow: WorkflowDefinition;
  t: Tokens;
  isDark: boolean;
};

export function AutomationWorkflowEditor({ workflow, t, isDark }: AutomationWorkflowEditorProps) {
  const [tab, setTab] = useState<WorkflowEditorTab>("workflow");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<WorkflowNodeData>>(
    structuredClone(workflow.nodes),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(structuredClone(workflow.edges));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [buildPanelOpen, setBuildPanelOpen] = useState(true);

  useEffect(() => {
    setNodes(structuredClone(workflow.nodes));
    setEdges(structuredClone(workflow.edges));
    setSelectedNodeId(null);
  }, [workflow.id, setNodes, setEdges]);

  const handleAddBlock = useCallback(
    (block: PaletteBlock) => {
      const existingIds = nodes.map((node) => node.id);
      const position = getDetachedNodePosition(nodes);
      const newNode = createNodeFromBlock(block, existingIds, position);
      if (!newNode) {
        return;
      }

      setNodes((current) => [...current, newNode]);
      setSelectedNodeId(newNode.id);
    },
    [nodes, setNodes],
  );

  const handleInsertBlockOnEdge = useCallback(
    (edgeId: string, block: PaletteBlock) => {
      const existingIds = nodes.map((node) => node.id);
      const newNode = createNodeFromBlock(block, existingIds, { x: 0, y: 0 });
      if (!newNode) {
        return;
      }

      const { nodes: nextNodes, edges: nextEdges } = insertNodeOnEdge(nodes, edges, edgeId, newNode);
      setNodes(nextNodes);
      setEdges(nextEdges);
      setSelectedNodeId(newNode.id);
    },
    [nodes, edges, setNodes, setEdges],
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      const { nodes: nextNodes, edges: nextEdges } = deleteWorkflowNode(nodes, edges, nodeId);
      setNodes(nextNodes);
      setEdges(nextEdges);
      setSelectedNodeId((current) => (current === nodeId ? null : current));
    },
    [nodes, edges, setNodes, setEdges],
  );

  const handleDuplicateNode = useCallback(
    (nodeId: string) => {
      const { nodes: nextNodes, newNodeId } = duplicateWorkflowNode(nodes, nodeId);
      setNodes(nextNodes);
      if (newNodeId) {
        setSelectedNodeId(newNodeId);
      }
    },
    [nodes, setNodes],
  );

  const openWorkflowTab = useCallback(() => {
    setTab("workflow");
  }, []);

  const openBuildPalette = useCallback(() => {
    setTab("workflow");
    setBuildPanelOpen(true);
  }, []);

  const placeholderCopy = useMemo(() => {
    if (tab === "settings") {
      return "Workflow settings — name, target entity, and publish controls will live here.";
    }
    return "Enrollment criteria for who enters this workflow when the trigger fires — shared with trigger configuration at runtime.";
  }, [tab]);

  return (
    <HolonBoundary
      id={AUTOMATION_WORKFLOW_EDITOR_HOLON.id}
      label={AUTOMATION_WORKFLOW_EDITOR_HOLON.label}
      icon={AUTOMATION_WORKFLOW_EDITOR_HOLON.icon}
      order={AUTOMATION_WORKFLOW_EDITOR_HOLON.order}
      t={t}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
      }}
    >
      {tab !== "workflow" && (
        <HolonBoundary
          id={AUTOMATION_WORKFLOW_TAB_HOLON.id}
          label={AUTOMATION_WORKFLOW_TAB_HOLON.label}
          icon={AUTOMATION_WORKFLOW_TAB_HOLON.icon}
          order={AUTOMATION_WORKFLOW_TAB_HOLON.order}
          registerOnly
          inView={false}
          onFocus={openWorkflowTab}
          t={t}
        >
          {null}
        </HolonBoundary>
      )}

      {tab !== "settings" && (
        <HolonBoundary
          id={AUTOMATION_SETTINGS_TAB_HOLON.id}
          label={AUTOMATION_SETTINGS_TAB_HOLON.label}
          icon={AUTOMATION_SETTINGS_TAB_HOLON.icon}
          order={AUTOMATION_SETTINGS_TAB_HOLON.order}
          registerOnly
          inView={false}
          onFocus={() => setTab("settings")}
          t={t}
        >
          {null}
        </HolonBoundary>
      )}

      {tab !== "enrollment" && (
        <HolonBoundary
          id={AUTOMATION_ENROLLMENT_TAB_HOLON.id}
          label={AUTOMATION_ENROLLMENT_TAB_HOLON.label}
          icon={AUTOMATION_ENROLLMENT_TAB_HOLON.icon}
          order={AUTOMATION_ENROLLMENT_TAB_HOLON.order}
          registerOnly
          inView={false}
          onFocus={() => setTab("enrollment")}
          t={t}
        >
          {null}
        </HolonBoundary>
      )}

      {!buildPanelOpen && tab === "workflow" && (
        <HolonBoundary
          id={AUTOMATION_BUILD_PALETTE_HOLON.id}
          label={AUTOMATION_BUILD_PALETTE_HOLON.label}
          icon={AUTOMATION_BUILD_PALETTE_HOLON.icon}
          order={AUTOMATION_BUILD_PALETTE_HOLON.order}
          registerOnly
          inView={false}
          onFocus={openBuildPalette}
          t={t}
        >
          {null}
        </HolonBoundary>
      )}

      <HolonBoundary
        id={AUTOMATION_EDITOR_TABS_HOLON.id}
        label={AUTOMATION_EDITOR_TABS_HOLON.label}
        icon={AUTOMATION_EDITOR_TABS_HOLON.icon}
        order={AUTOMATION_EDITOR_TABS_HOLON.order}
        t={t}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          padding: "0 16px",
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 0 }}>
          {EDITOR_TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 4px",
                  marginRight: 20,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: DOCS_TREE_LABEL_SIZE,
                  fontWeight: active ? 600 : 500,
                  color: active ? t.textPrimary : t.textMuted,
                  borderBottom: active ? `2px solid ${t.accent}` : "2px solid transparent",
                  letterSpacing: "-0.01em",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === "workflow" && (
          <button
            type="button"
            title={buildPanelOpen ? "Hide build panel" : "Show build panel"}
            aria-label={buildPanelOpen ? "Hide build panel" : "Show build panel"}
            aria-pressed={buildPanelOpen}
            onClick={() => setBuildPanelOpen((open) => !open)}
            className={cn(
              "tower-chrome-menu-item ml-auto inline-flex h-8 w-8 items-center justify-center rounded-sm outline-none",
              "cursor-pointer hover:bg-accent hover:text-accent-foreground",
            )}
            style={{
              color: buildPanelOpen ? t.accent : t.textMuted,
              marginLeft: "auto",
            }}
          >
            <PanelRight size={15} strokeWidth={2} />
          </button>
        )}
      </HolonBoundary>

      {tab === "workflow" ? (
        <HolonBoundary
          id={AUTOMATION_WORKFLOW_TAB_HOLON.id}
          label={AUTOMATION_WORKFLOW_TAB_HOLON.label}
          icon={AUTOMATION_WORKFLOW_TAB_HOLON.icon}
          order={AUTOMATION_WORKFLOW_TAB_HOLON.order}
          t={t}
          style={{ flex: 1, minHeight: 0, display: "flex" }}
        >
          <HolonBoundary
            id={AUTOMATION_WORKFLOW_CANVAS_HOLON.id}
            label={AUTOMATION_WORKFLOW_CANVAS_HOLON.label}
            icon={AUTOMATION_WORKFLOW_CANVAS_HOLON.icon}
            order={AUTOMATION_WORKFLOW_CANVAS_HOLON.order}
            t={t}
            style={{ flex: 1, minHeight: 0, minWidth: 0, display: "flex" }}
          >
            <AutomationWorkflowCanvas
              t={t}
              isDark={isDark}
              nodes={nodes}
              edges={edges}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onInsertBlockOnEdge={handleInsertBlockOnEdge}
              onDeleteNode={handleDeleteNode}
              onDuplicateNode={handleDuplicateNode}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
            />
          </HolonBoundary>
          {buildPanelOpen && (
            <HolonBoundary
              id={AUTOMATION_BUILD_PALETTE_HOLON.id}
              label={AUTOMATION_BUILD_PALETTE_HOLON.label}
              icon={AUTOMATION_BUILD_PALETTE_HOLON.icon}
              order={AUTOMATION_BUILD_PALETTE_HOLON.order}
              t={t}
              style={{ display: "flex", minHeight: 0 }}
            >
              <AutomationBuildPalette t={t} onAddBlock={handleAddBlock} />
            </HolonBoundary>
          )}
        </HolonBoundary>
      ) : tab === "settings" ? (
        <HolonBoundary
          id={AUTOMATION_SETTINGS_TAB_HOLON.id}
          label={AUTOMATION_SETTINGS_TAB_HOLON.label}
          icon={AUTOMATION_SETTINGS_TAB_HOLON.icon}
          order={AUTOMATION_SETTINGS_TAB_HOLON.order}
          t={t}
          style={{
            flex: 1,
            padding: 24,
            color: t.textMuted,
            fontSize: DOCS_TREE_LABEL_SIZE,
            lineHeight: 1.5,
          }}
        >
          <p style={{ margin: 0, maxWidth: 480 }}>{placeholderCopy}</p>
        </HolonBoundary>
      ) : (
        <HolonBoundary
          id={AUTOMATION_ENROLLMENT_TAB_HOLON.id}
          label={AUTOMATION_ENROLLMENT_TAB_HOLON.label}
          icon={AUTOMATION_ENROLLMENT_TAB_HOLON.icon}
          order={AUTOMATION_ENROLLMENT_TAB_HOLON.order}
          t={t}
          style={{
            flex: 1,
            padding: 24,
            color: t.textMuted,
            fontSize: DOCS_TREE_LABEL_SIZE,
            lineHeight: 1.5,
          }}
        >
          <p style={{ margin: 0, maxWidth: 480 }}>{placeholderCopy}</p>
        </HolonBoundary>
      )}
    </HolonBoundary>
  );
}
