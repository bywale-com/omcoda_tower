import { useCallback, useEffect, useRef, useState } from "react";
import type { Edge, Node } from "@xyflow/react";
import { useAutomations } from "../../../context/AutomationContext";
import type { WorkflowNodeData } from "../../../data/automationWorkflows";
import { HolonBoundary } from "../../docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "../../docs/shellHolonOrder";
import type { Tokens } from "../../tokens";
import { AutomationWorkflowEditor, type AutomationWorkflowEditorHandle } from "./AutomationWorkflowEditor";
import { AutomationWorkflowHeader } from "./AutomationWorkflowHeader";
import type { AutomationConstantIndustryId } from "../../../data/automationConstants";

type AutomationDetailViewProps = {
  automationId: string;
  t: Tokens;
  isDark: boolean;
  onOpenConstantsIndustry?: (industryId: AutomationConstantIndustryId) => void;
};

type GraphSnapshot = {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
};

export function AutomationDetailView({
  automationId,
  t,
  isDark,
  onOpenConstantsIndustry,
}: AutomationDetailViewProps) {
  const { getWorkflowById, renameAutomation, updateWorkflow } = useAutomations();
  const workflow = getWorkflowById(automationId);
  const [savedFlash, setSavedFlash] = useState(false);
  const editorRef = useRef<AutomationWorkflowEditorHandle>(null);
  const latestGraphRef = useRef<GraphSnapshot | null>(null);
  const automationIdRef = useRef(automationId);
  const updateWorkflowRef = useRef(updateWorkflow);

  automationIdRef.current = automationId;
  updateWorkflowRef.current = updateWorkflow;

  const persistGraph = useCallback(
    (nodes: Node<WorkflowNodeData>[], edges: Edge[]) => {
      latestGraphRef.current = { nodes, edges };
      updateWorkflow(automationId, { nodes, edges });
    },
    [automationId, updateWorkflow],
  );

  const handleRename = useCallback(
    (name: string) => {
      renameAutomation(automationId, name);
    },
    [automationId, renameAutomation],
  );

  const handleSave = useCallback(() => {
    const graph = editorRef.current?.getGraph() ?? latestGraphRef.current;
    if (graph) {
      persistGraph(graph.nodes, graph.edges);
    }
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1500);
  }, [persistGraph]);

  const handleLaunch = useCallback(() => {
    // Launch wiring will connect to workflow runtime later.
  }, []);

  useEffect(() => {
    latestGraphRef.current = workflow
      ? { nodes: structuredClone(workflow.nodes), edges: structuredClone(workflow.edges) }
      : null;
  }, [automationId]);

  useEffect(() => {
    return () => {
      const graph = latestGraphRef.current;
      if (!graph) return;
      updateWorkflowRef.current(automationIdRef.current, {
        nodes: graph.nodes,
        edges: graph.edges,
      });
    };
  }, []);

  if (!workflow) {
    return (
      <div style={{ padding: 28, color: t.textDim, fontSize: 13 }}>
        Automation not found.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minWidth: 0,
        background: t.bgPrimary,
      }}
    >
      <HolonBoundary
        id="hub-tool-header"
        label="Hub Tool Header"
        icon="lightning-bolt"
        order={SHELL_HOLON_ORDER["hub-tool-header"]}
        t={t}
        style={{
          padding: "8px 16px",
          flexShrink: 0,
          background: t.bgPrimary,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <AutomationWorkflowHeader
          workflow={workflow}
          t={t}
          savedFlash={savedFlash}
          onRename={handleRename}
          onSave={handleSave}
          onLaunch={handleLaunch}
        />
      </HolonBoundary>

      <HolonBoundary
        id="hub-tool-body"
        label="Hub Tool Body"
        icon="list-bullet"
        order={SHELL_HOLON_ORDER["hub-tool-body"]}
        t={t}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AutomationWorkflowEditor
          ref={editorRef}
          workflow={workflow}
          t={t}
          isDark={isDark}
          onGraphChange={persistGraph}
          onOpenConstantsIndustry={onOpenConstantsIndustry}
        />
      </HolonBoundary>
    </div>
  );
}
