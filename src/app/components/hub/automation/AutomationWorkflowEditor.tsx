import { useEdgesState, useNodesState, type Connection, type Edge, type Node } from "@xyflow/react";
import { PanelRight } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutomations } from "../../../context/AutomationContext";
import type { AutomationConstantIndustryId } from "../../../data/automationConstants";
import {
  isManualTriggerConfigured,
  type AutomationDataClassId,
} from "../../../data/automationEvents";
import {
  appendNodeAfter,
  applyIfBranchEdgeStyles,
  AUTOMATION_EDGE_TYPE,
  clearBranchEdgeStyles,
  createNodeFromBlock,
  createTriggerNode,
  deleteWorkflowNode,
  duplicateWorkflowNode,
  getDetachedNodePosition,
  insertNodeOnEdge,
  isTriggerNodeConfigured,
  resolveOutputFromSourceNode,
  resolveUpstreamInput,
  withResolvedNodeInput,
  workflowHasTrigger,
  type PaletteBlock,
  type WorkflowDefinition,
  type WorkflowEditorTab,
  type WorkflowNodeData,
  type WorkflowTriggerKind,
} from "../../../data/automationWorkflows";
import { isIfBranchOutput } from "../../../data/automationConditions";
import {
  AUTOMATION_BUILD_PALETTE_HOLON,
  AUTOMATION_EDITOR_TABS_HOLON,
  AUTOMATION_ENROLLMENT_TAB_HOLON,
  AUTOMATION_RUNS_TAB_HOLON,
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
import { AutomationManualClassFilterPanel } from "./AutomationManualClassFilterPanel";
import {
  AutomationNodeConfigModal,
  runIfConditionNode,
  runManualTriggerNode,
  runRuleNode,
} from "./AutomationNodeConfigModal";
import { AutomationRunsTab } from "./AutomationRunsTab";
import { AutomationWorkflowCanvas } from "./AutomationWorkflowCanvas";

const EDITOR_TABS: { id: WorkflowEditorTab; label: string }[] = [
  { id: "workflow", label: "Workflow" },
  { id: "runs", label: "Runs" },
  { id: "settings", label: "Settings" },
  { id: "enrollment", label: "Enrollment" },
];

const GRAPH_PERSIST_DEBOUNCE_MS = 400;

export type AutomationWorkflowEditorHandle = {
  getGraph: () => { nodes: Node<WorkflowNodeData>[]; edges: Edge[] };
};

type AutomationWorkflowEditorProps = {
  workflow: WorkflowDefinition;
  t: Tokens;
  isDark: boolean;
  onGraphChange?: (nodes: Node<WorkflowNodeData>[], edges: Edge[]) => void;
  onOpenConstantsIndustry?: (industryId: AutomationConstantIndustryId) => void;
};

export const AutomationWorkflowEditor = forwardRef<
  AutomationWorkflowEditorHandle,
  AutomationWorkflowEditorProps
>(function AutomationWorkflowEditor({ workflow, t, isDark, onGraphChange, onOpenConstantsIndustry }, ref) {
  const { startManualRun, stopManualRun, getActiveManualRunId } = useAutomations();
  const [tab, setTab] = useState<WorkflowEditorTab>("workflow");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<WorkflowNodeData>>(
    structuredClone(workflow.nodes),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(structuredClone(workflow.edges));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [configPanelNodeId, setConfigPanelNodeId] = useState<string | null>(null);
  const [filterPanel, setFilterPanel] = useState<{
    nodeId: string;
    classId: AutomationDataClassId;
  } | null>(null);
  const [buildPanelOpen, setBuildPanelOpen] = useState(true);
  const skipPersistRef = useRef(true);
  const activeManualRunId = getActiveManualRunId(workflow.id);
  const manualRunActive = activeManualRunId != null;
  const hasTrigger = useMemo(() => workflowHasTrigger(nodes), [nodes]);
  const edgesRef = useRef(edges);
  edgesRef.current = edges;

  const configNode = useMemo(() => {
    if (!configPanelNodeId) return undefined;
    const node = nodes.find((item) => item.id === configPanelNodeId);
    if (!node) return undefined;
    return withResolvedNodeInput(node, nodes, edges);
  }, [configPanelNodeId, nodes, edges]);
  const filterNode = useMemo(
    () => (filterPanel ? nodes.find((node) => node.id === filterPanel.nodeId) : undefined),
    [filterPanel, nodes],
  );
  const modalOpen = Boolean(configPanelNodeId && !filterPanel);


  useImperativeHandle(
    ref,
    () => ({
      getGraph: () => ({
        nodes: structuredClone(nodes),
        edges: structuredClone(edges),
      }),
    }),
    [nodes, edges],
  );

  useEffect(() => {
    skipPersistRef.current = true;
    setNodes(structuredClone(workflow.nodes));
    setEdges(structuredClone(workflow.edges));
    setSelectedNodeId(null);
    setConfigPanelNodeId(null);
    setFilterPanel(null);
  }, [workflow.id, setNodes, setEdges]);

  useEffect(() => {
    if (!onGraphChange) return;
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      onGraphChange(structuredClone(nodes), structuredClone(edges));
    }, GRAPH_PERSIST_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [nodes, edges, onGraphChange]);

  const handleAddTrigger = useCallback(
    (triggerKind: WorkflowTriggerKind) => {
      if (workflowHasTrigger(nodes)) {
        return;
      }

      const existingIds = nodes.map((node) => node.id);
      const newNode = createTriggerNode(triggerKind, existingIds);
      setNodes([newNode]);
      setEdges([]);
      setSelectedNodeId(newNode.id);
      if (triggerKind === "event" || triggerKind === "manual") {
        setConfigPanelNodeId(newNode.id);
        setBuildPanelOpen(true);
      }
    },
    [nodes, setNodes, setEdges],
  );

  const propagateOutputToDownstream = useCallback(
    (sourceNodeId: string, output: WorkflowNodeData["lastOutput"], edgeList = edgesRef.current) => {
      setNodes((current) => {
        const outgoing = edgeList.filter((edge) => edge.source === sourceNodeId);
        const downstreamIds = new Map<string, unknown>();
        for (const edge of outgoing) {
          let payload: unknown = output ?? null;
          if (isIfBranchOutput(output)) {
            const handle = edge.sourceHandle === "false" ? "false" : "true";
            payload = output.branches[handle] ?? null;
          }
          downstreamIds.set(edge.target, payload);
        }
        return current.map((node) => {
          if (!downstreamIds.has(node.id)) return node;
          const payload = downstreamIds.get(node.id) ?? null;
          return {
            ...node,
            data: {
              ...node.data,
              lastInput: payload,
            },
          };
        });
      });
    },
    [setNodes],
  );

  const handleUpdateNodeData = useCallback(
    (nodeId: string, patch: Partial<WorkflowNodeData>) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...patch } } : node,
        ),
      );
    },
    [setNodes],
  );

  const handleToggleManualRun = useCallback(
    (nodeId: string) => {
      const node = nodes.find((item) => item.id === nodeId);
      if (!node || node.data.triggerKind !== "manual") return;
      if (!isTriggerNodeConfigured(node.data)) return;

      if (activeManualRunId || node.data.runStatus === "running") {
        if (activeManualRunId) stopManualRun(activeManualRunId);
        handleUpdateNodeData(nodeId, { runStatus: "failed" });
        return;
      }

      startManualRun(workflow.id);
      handleUpdateNodeData(nodeId, { runStatus: "running" });

      window.setTimeout(() => {
        const result = runManualTriggerNode(node.data);
        handleUpdateNodeData(nodeId, result);
        if (result.lastOutput) {
          propagateOutputToDownstream(nodeId, result.lastOutput);
        }
      }, 900);
    },
    [
      nodes,
      activeManualRunId,
      stopManualRun,
      startManualRun,
      workflow.id,
      propagateOutputToDownstream,
      handleUpdateNodeData,
    ],
  );

  const handleOpenNodeConfig = useCallback((nodeId: string) => {
    setFilterPanel(null);
    setConfigPanelNodeId(nodeId);
    setSelectedNodeId(nodeId);
  }, []);

  const handleCloseNodeConfig = useCallback(() => {
    setConfigPanelNodeId(null);
    setFilterPanel(null);
  }, []);

  const handleOpenClassFilter = useCallback((nodeId: string, classId: AutomationDataClassId) => {
    setConfigPanelNodeId(nodeId);
    setSelectedNodeId(nodeId);
    setFilterPanel({ nodeId, classId });
  }, []);

  const handleCloseClassFilter = useCallback(() => {
    setFilterPanel(null);
  }, []);

  const applyIfEdgeRouting = useCallback(
    (ifNodeId: string, output: unknown) => {
      if (!isIfBranchOutput(output)) return;
      setEdges((current) =>
        applyIfBranchEdgeStyles(current, ifNodeId, output, {
          true: t.success,
          false: t.red,
          idle: t.border,
        }),
      );
    },
    [setEdges, t.success, t.red, t.border],
  );

  const handleRunConfigNode = useCallback(() => {
    if (!configPanelNodeId) return;

    setNodes((currentNodes) => {
      const node = currentNodes.find((item) => item.id === configPanelNodeId);
      if (!node) return currentNodes;

      if (node.type === "branch" && node.data.branchKind === "if") {
        setEdges((current) => clearBranchEdgeStyles(current, configPanelNodeId));
      }

      const resolvedInput = resolveUpstreamInput(configPanelNodeId, currentNodes, edgesRef.current);

      window.setTimeout(() => {
        setNodes((latestNodes) => {
          const latest = latestNodes.find((item) => item.id === configPanelNodeId);
          if (!latest) return latestNodes;

          const input =
            resolveUpstreamInput(configPanelNodeId, latestNodes, edgesRef.current) ??
            resolvedInput ??
            latest.data.lastInput ??
            null;

          if (latest.type === "trigger" && latest.data.triggerKind === "manual") {
            const result = runManualTriggerNode(latest.data);
            propagateOutputToDownstream(configPanelNodeId, result.lastOutput);
            if (!activeManualRunId) {
              startManualRun(workflow.id);
            }
            return latestNodes.map((item) =>
              item.id === configPanelNodeId
                ? { ...item, data: { ...item.data, ...result, runStatus: result.runStatus ?? "success" } }
                : item,
            );
          }

          if (latest.type === "branch" && latest.data.branchKind === "if") {
            const result = runIfConditionNode({ ...latest.data, lastInput: input });
            if (result.lastOutput) {
              applyIfEdgeRouting(configPanelNodeId, result.lastOutput);
              propagateOutputToDownstream(configPanelNodeId, result.lastOutput);
            }
            return latestNodes.map((item) =>
              item.id === configPanelNodeId
                ? {
                    ...item,
                    data: {
                      ...item.data,
                      ...result,
                      lastInput: input,
                      runStatus: result.runStatus ?? "success",
                    },
                  }
                : item,
            );
          }

          if (latest.type === "rule") {
            const result = runRuleNode({ ...latest.data, lastInput: input });
            if (result.lastOutput) {
              propagateOutputToDownstream(configPanelNodeId, result.lastOutput);
            }
            return latestNodes.map((item) =>
              item.id === configPanelNodeId
                ? {
                    ...item,
                    data: {
                      ...item.data,
                      ...result,
                      lastInput: input,
                      runStatus: result.runStatus ?? "success",
                    },
                  }
                : item,
            );
          }

          return latestNodes.map((item) =>
            item.id === configPanelNodeId
              ? { ...item, data: { ...item.data, runStatus: "idle" as const } }
              : item,
          );
        });
      }, 700);

      return currentNodes.map((item) =>
        item.id === configPanelNodeId
          ? {
              ...item,
              data: {
                ...item.data,
                runStatus: "running" as const,
                lastInput: resolvedInput ?? item.data.lastInput ?? null,
              },
            }
          : item,
      );
    });
  }, [
    configPanelNodeId,
    propagateOutputToDownstream,
    activeManualRunId,
    startManualRun,
    workflow.id,
    applyIfEdgeRouting,
    setEdges,
    setNodes,
  ]);

  const handleConnectNodes = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (connection.source === connection.target) return;

      const source = nodes.find((node) => node.id === connection.source);
      if (!source) return;

      const edgeId = `e-${connection.source}-${connection.target}${
        connection.sourceHandle ? `-${connection.sourceHandle}` : ""
      }`;
      if (edges.some((edge) => edge.id === edgeId)) return;

      const seededInput = resolveOutputFromSourceNode(source, connection.sourceHandle);
      const nextEdge: Edge = {
        id: edgeId,
        source: connection.source,
        target: connection.target,
        type: AUTOMATION_EDGE_TYPE,
        ...(connection.sourceHandle ? { sourceHandle: connection.sourceHandle } : {}),
        ...(connection.targetHandle ? { targetHandle: connection.targetHandle } : {}),
      };

      setEdges((current) => [...current, nextEdge]);
      setNodes((current) =>
        current.map((node) =>
          node.id === connection.target
            ? {
                ...node,
                data: {
                  ...node.data,
                  lastInput: seededInput,
                },
              }
            : node,
        ),
      );
    },
    [nodes, edges, setEdges, setNodes],
  );

  const handleAttachBlockAfterNode = useCallback(
    (nodeId: string, block: PaletteBlock, sourceHandle?: string) => {
      if (!workflowHasTrigger(nodes)) return;
      const source = nodes.find((node) => node.id === nodeId);
      const existingIds = nodes.map((node) => node.id);
      const newNode = createNodeFromBlock(block, existingIds, { x: 0, y: 0 });
      if (!newNode) return;

      const seededInput = source
        ? resolveOutputFromSourceNode(source, sourceHandle)
        : null;
      const newNodeWithInput: Node<WorkflowNodeData> = {
        ...newNode,
        data: {
          ...newNode.data,
          lastInput: seededInput,
        },
      };

      const { nodes: nextNodes, edges: nextEdges } = appendNodeAfter(
        nodes,
        edges,
        nodeId,
        newNodeWithInput,
        sourceHandle,
      );
      setNodes(nextNodes);
      setEdges(nextEdges);
      setSelectedNodeId(newNodeWithInput.id);
    },
    [nodes, edges, setNodes, setEdges],
  );

  const handleAddBlock = useCallback(
    (block: PaletteBlock) => {
      if (!workflowHasTrigger(nodes)) {
        return;
      }

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
      if (!workflowHasTrigger(nodes)) {
        return;
      }

      const edge = edges.find((item) => item.id === edgeId);
      const source = edge ? nodes.find((node) => node.id === edge.source) : undefined;
      const existingIds = nodes.map((node) => node.id);
      const newNode = createNodeFromBlock(block, existingIds, { x: 0, y: 0 });
      if (!newNode) {
        return;
      }

      const seededInput = source
        ? resolveOutputFromSourceNode(source, edge?.sourceHandle)
        : null;
      const newNodeWithInput: Node<WorkflowNodeData> = {
        ...newNode,
        data: {
          ...newNode.data,
          lastInput: seededInput,
        },
      };

      const { nodes: nextNodes, edges: nextEdges } = insertNodeOnEdge(
        nodes,
        edges,
        edgeId,
        newNodeWithInput,
      );
      setNodes(nextNodes);
      setEdges(nextEdges);
      setSelectedNodeId(newNodeWithInput.id);
    },
    [nodes, edges, setNodes, setEdges],
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      const { nodes: nextNodes, edges: nextEdges } = deleteWorkflowNode(nodes, edges, nodeId);
      setNodes(nextNodes);
      setEdges(nextEdges);
      setSelectedNodeId((current) => (current === nodeId ? null : current));
      setConfigPanelNodeId((current) => (current === nodeId ? null : current));
      if (!workflowHasTrigger(nextNodes)) {
        setConfigPanelNodeId(null);
        setBuildPanelOpen(true);
      }
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
    if (tab === "enrollment") {
      return "Enrollment criteria for who enters this workflow when the trigger fires — shared with trigger configuration at runtime.";
    }
    return "";
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

      {tab !== "runs" && (
        <HolonBoundary
          id={AUTOMATION_RUNS_TAB_HOLON.id}
          label={AUTOMATION_RUNS_TAB_HOLON.label}
          icon={AUTOMATION_RUNS_TAB_HOLON.icon}
          order={AUTOMATION_RUNS_TAB_HOLON.order}
          registerOnly
          inView={false}
          onFocus={() => setTab("runs")}
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
              workflowId={workflow.id}
              nodes={nodes}
              edges={edges}
              selectedNodeId={selectedNodeId}
              configPanelNodeId={configPanelNodeId}
              manualRunActive={manualRunActive}
              onSelectNode={setSelectedNodeId}
              onInsertBlockOnEdge={handleInsertBlockOnEdge}
              onDeleteNode={handleDeleteNode}
              onDuplicateNode={handleDuplicateNode}
              onAttachBlockAfterNode={handleAttachBlockAfterNode}
              onConnectNodes={handleConnectNodes}
              onAddTrigger={handleAddTrigger}
              onOpenNodeConfig={handleOpenNodeConfig}
              onCloseNodeConfig={handleCloseNodeConfig}
              onOpenClassFilter={handleOpenClassFilter}
              onToggleManualRun={handleToggleManualRun}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
            />
          </HolonBoundary>
          {filterPanel && filterNode?.type === "trigger" ? (
            <AutomationManualClassFilterPanel
              classId={filterPanel.classId}
              config={
                filterNode.data.manualTriggerConfig ?? {
                  scopes: {},
                  filters: {},
                }
              }
              t={t}
              onChange={(nextConfig) =>
                handleUpdateNodeData(filterPanel.nodeId, {
                  manualTriggerConfig: nextConfig,
                  configured: isManualTriggerConfigured(nextConfig),
                })
              }
              onClose={handleCloseClassFilter}
            />
          ) : (
            buildPanelOpen && (
              <HolonBoundary
                id={AUTOMATION_BUILD_PALETTE_HOLON.id}
                label={AUTOMATION_BUILD_PALETTE_HOLON.label}
                icon={AUTOMATION_BUILD_PALETTE_HOLON.icon}
                order={AUTOMATION_BUILD_PALETTE_HOLON.order}
                t={t}
                style={{ display: "flex", minHeight: 0 }}
              >
                <AutomationBuildPalette
                  t={t}
                  hasTrigger={hasTrigger}
                  onAddBlock={handleAddBlock}
                  onAddTrigger={handleAddTrigger}
                  onOpenConstantsIndustry={onOpenConstantsIndustry}
                />
              </HolonBoundary>
            )
          )}
        </HolonBoundary>
      ) : tab === "runs" ? (
        <AutomationRunsTab workflowId={workflow.id} t={t} />
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

      <AutomationNodeConfigModal
        open={modalOpen}
        node={configNode ?? null}
        nodes={nodes}
        edges={edges}
        t={t}
        onClose={handleCloseNodeConfig}
        onUpdate={(patch) => {
          if (configPanelNodeId) handleUpdateNodeData(configPanelNodeId, patch);
        }}
        onEditClassFilter={(classId) => {
          if (configPanelNodeId) handleOpenClassFilter(configPanelNodeId, classId);
        }}
        onRunNode={handleRunConfigNode}
      />
    </HolonBoundary>
  );
});
