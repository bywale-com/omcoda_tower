import type { Edge, Node } from "@xyflow/react";

import type { EventTriggerConfig, ManualTriggerConfig } from "./automationEvents";
import {
  emptyEventTriggerConfig,
  emptyManualTriggerConfig,
  isEventTriggerConfigured,
  isManualTriggerConfigured,
} from "./automationEvents";
import type { IfConditionConfig } from "./automationConditions";
import {
  emptyIfConditionConfig,
  formatIfConditionSummary,
  isIfConditionConfigured,
  normalizeIfConditionConfig,
} from "./automationConditions";
import type { IfBranchOutput } from "./automationConditions";
import { isIfBranchOutput } from "./automationConditions";
import type { RuleNodeConfig } from "./automationRules";
import {
  emptyRuleNodeConfig,
  formatRuleSummary,
  isRuleConfigured,
} from "./automationRules";
import type { NodeDataPayload, WorkflowNodeRunStatus } from "./automationNodeRuntime";
import { countPullItems } from "./automationNodeRuntime";

import type { AutomationBuildModule } from "./automationBuildModules";

export type WorkflowTarget = "audit" | "contact" | "import" | "client";

export type WorkflowStatus = "draft" | "active" | "paused";

export type WorkflowEditorTab = "workflow" | "runs" | "settings" | "enrollment";

export type WorkflowNodeType = "trigger" | "constant" | "branch" | "rule" | "action" | "exit";

export type WorkflowTriggerEvent =
  | "audit.completed"
  | "audit.failed"
  | "contact.created"
  | "contact.updated"
  | "import.created"
  | "eligibility.changed";

export type WorkflowActionType =
  | "enroll_sequence"
  | "manage_lists"
  | "assign_task"
  | "notify_consultant";

export type WorkflowBranchKind = "true_false" | "multi_split" | "delay" | "if";

export type WorkflowConstantKind = "data_reference" | "client" | "automation";

export type WorkflowOperationKind = "delay" | "exit" | "transform";

export type WorkflowTriggerKind = "event" | "schedule" | "manual" | "constant";

export type WorkflowNodeData = {
  label: string;
  configured: boolean;
  buildModule?: AutomationBuildModule;
  triggerKind?: WorkflowTriggerKind;
  target?: WorkflowTarget;
  triggerEvent?: WorkflowTriggerEvent;
  eventTriggerConfig?: EventTriggerConfig;
  manualTriggerConfig?: ManualTriggerConfig;
  scheduleSummary?: string;
  enrollmentHint?: string;
  constantKind?: WorkflowConstantKind;
  constantSummary?: string;
  branchKind?: WorkflowBranchKind;
  filterSummary?: string;
  operationKind?: WorkflowOperationKind;
  ruleId?: string;
  ruleSummary?: string;
  ruleConfig?: RuleNodeConfig;
  actionType?: WorkflowActionType;
  actionSummary?: string;
  delayLabel?: string;
  conditionConfig?: IfConditionConfig;
  runStatus?: WorkflowNodeRunStatus;
  lastInput?: NodeDataPayload | null;
  lastOutput?: NodeDataPayload | null;
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  status: WorkflowStatus;
  target: WorkflowTarget;
  updatedAt: string;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
};

export const WORKFLOW_TARGETS: { id: WorkflowTarget; label: string }[] = [
  { id: "audit", label: "Audits" },
  { id: "contact", label: "Contacts" },
  { id: "import", label: "Imports" },
  { id: "client", label: "Clients" },
];

export const TRIGGER_EVENTS_BY_TARGET: Record<
  WorkflowTarget,
  { id: WorkflowTriggerEvent; label: string }[]
> = {
  audit: [
    { id: "audit.completed", label: "Audit completed" },
    { id: "audit.failed", label: "Audit failed" },
  ],
  contact: [
    { id: "contact.created", label: "Contact created" },
    { id: "contact.updated", label: "Contact updated" },
  ],
  import: [{ id: "import.created", label: "Import created" }],
  client: [{ id: "eligibility.changed", label: "Eligibility changed" }],
};

export type PaletteBlock = {
  id: string;
  label: string;
  description: string;
  module: AutomationBuildModule;
  nodeType: WorkflowNodeType;
  defaultData: Partial<WorkflowNodeData>;
};

export type TriggerOption = {
  id: string;
  label: string;
  description: string;
  triggerKind: WorkflowTriggerKind;
};

export const WORKFLOW_TRIGGER_OPTIONS: TriggerOption[] = [
  {
    id: "trigger-event",
    label: "Event-based trigger",
    description: "Run when Tower data changes",
    triggerKind: "event",
  },
  {
    id: "trigger-schedule",
    label: "Schedule-based trigger",
    description: "Run on a recurring schedule",
    triggerKind: "schedule",
  },
  {
    id: "trigger-manual",
    label: "Manual trigger",
    description: "Run on demand from Tower",
    triggerKind: "manual",
  },
  {
    id: "trigger-constant",
    label: "Constant trigger",
    description: "Run when a constant value changes",
    triggerKind: "constant",
  },
];

export const WORKFLOW_PALETTE_BLOCKS: PaletteBlock[] = [
  {
    id: "constant-data-ref",
    label: "Data reference",
    description: "Reference a Tower data field",
    module: "constants",
    nodeType: "constant",
    defaultData: {
      label: "Data reference",
      constantKind: "data_reference",
      constantSummary: "Select data field…",
      configured: false,
    },
  },
  {
    id: "constant-client",
    label: "Client constant",
    description: "Client-scoped constant value",
    module: "constants",
    nodeType: "constant",
    defaultData: {
      label: "Client constant",
      constantKind: "client",
      constantSummary: "Select constant…",
      configured: false,
    },
  },
  {
    id: "constant-automation",
    label: "Constant",
    description: "Automation or environment constant",
    module: "constants",
    nodeType: "constant",
    defaultData: {
      label: "Constant",
      constantKind: "automation",
      constantSummary: "Select constant…",
      configured: false,
    },
  },
  {
    id: "condition-if",
    label: "If",
    description: "Branch true / false on a condition",
    module: "conditions",
    nodeType: "branch",
    defaultData: {
      label: "If",
      branchKind: "if",
      conditionConfig: emptyIfConditionConfig(),
      filterSummary: formatIfConditionSummary(emptyIfConditionConfig()),
      configured: true,
    },
  },
  {
    id: "condition-true-false",
    label: "True / false",
    description: "Branch on filter criteria",
    module: "conditions",
    nodeType: "branch",
    defaultData: {
      label: "Condition",
      branchKind: "true_false",
      filterSummary: "Add filter criteria",
      configured: false,
    },
  },
  {
    id: "condition-multi-split",
    label: "Multi split",
    description: "Split into multiple paths",
    module: "conditions",
    nodeType: "branch",
    defaultData: {
      label: "Multi split",
      branchKind: "multi_split",
      filterSummary: "Add split criteria",
      configured: false,
    },
  },
  {
    id: "operation-delay",
    label: "Delay",
    description: "Wait before the next step",
    module: "operations",
    nodeType: "branch",
    defaultData: {
      label: "Delay",
      operationKind: "delay",
      branchKind: "delay",
      delayLabel: "1 hour",
      configured: true,
    },
  },
  {
    id: "operation-transform",
    label: "Transform",
    description: "Map or reshape data between steps",
    module: "operations",
    nodeType: "branch",
    defaultData: {
      label: "Transform",
      operationKind: "transform",
      filterSummary: "Add transform…",
      configured: false,
    },
  },
  {
    id: "operation-exit",
    label: "Exit",
    description: "End this path",
    module: "operations",
    nodeType: "exit",
    defaultData: {
      label: "Exit",
      operationKind: "exit",
      configured: true,
    },
  },
  {
    id: "rule-immigration-service-eligibility",
    label: "Immigration · Service eligibility",
    description: "Toggle pathway, service, eligibility outcomes — conditions stay under the hood",
    module: "rules",
    nodeType: "rule",
    defaultData: {
      label: "Immigration · Service eligibility",
      ruleId: "immigration-service-eligibility",
      ruleConfig: emptyRuleNodeConfig("immigration-service-eligibility"),
      ruleSummary: formatRuleSummary(emptyRuleNodeConfig("immigration-service-eligibility")),
      configured: true,
    },
  },
  {
    id: "rule-pathway-detection",
    label: "Pathway detection",
    description: "Shortcut — Immigration pack with pathway outcome on",
    module: "rules",
    nodeType: "rule",
    defaultData: {
      label: "Pathway detection",
      ruleId: "immigration-service-eligibility",
      ruleConfig: {
        packId: "immigration-service-eligibility",
        enabledOutcomeIds: ["pathway"],
      },
      ruleSummary: "Pathway detection",
      configured: true,
    },
  },
  {
    id: "rule-service-detection",
    label: "Service detection",
    description: "Shortcut — ops + pathway for nudge/service signals",
    module: "rules",
    nodeType: "rule",
    defaultData: {
      label: "Service detection",
      ruleId: "immigration-service-eligibility",
      ruleConfig: {
        packId: "immigration-service-eligibility",
        enabledOutcomeIds: ["pathway", "ops", "gaps"],
      },
      ruleSummary: "Service detection",
      configured: true,
    },
  },
  {
    id: "rule-eligibility-check",
    label: "Draw competitiveness",
    description: "Shortcut — Immigration pack with draw outcome on",
    module: "rules",
    nodeType: "rule",
    defaultData: {
      label: "Draw competitiveness",
      ruleId: "immigration-service-eligibility",
      ruleConfig: {
        packId: "immigration-service-eligibility",
        enabledOutcomeIds: ["draw"],
      },
      ruleSummary: "Draw competitiveness",
      configured: true,
    },
  },
  {
    id: "action-sequence",
    label: "Manage sequences",
    description: "Enroll or remove from a sequence",
    module: "actions",
    nodeType: "action",
    defaultData: {
      label: "Manage sequences",
      actionType: "enroll_sequence",
      actionSummary: "Add to sequence…",
      configured: false,
    },
  },
  {
    id: "action-lists",
    label: "Manage lists",
    description: "Add or remove from a list",
    module: "actions",
    nodeType: "action",
    defaultData: {
      label: "Manage lists",
      actionType: "manage_lists",
      actionSummary: "Add to list…",
      configured: false,
    },
  },
  {
    id: "action-task",
    label: "Assign manual task",
    description: "Create a consultant task",
    module: "actions",
    nodeType: "action",
    defaultData: {
      label: "Assign task",
      actionType: "assign_task",
      actionSummary: "Assign to consultant…",
      configured: false,
    },
  },
  {
    id: "action-notify",
    label: "Send notification",
    description: "Notify a consultant in Tower",
    module: "actions",
    nodeType: "action",
    defaultData: {
      label: "Send notification",
      actionType: "notify_consultant",
      actionSummary: "Notify consultant…",
      configured: false,
    },
  },
];

const CANVAS_CENTER_X = 120;

function verticalNode(
  id: string,
  type: WorkflowNodeType,
  index: number,
  data: WorkflowNodeData,
): Node<WorkflowNodeData> {
  return {
    id,
    type,
    position: { x: CANVAS_CENTER_X, y: index * 148 },
    data,
  };
}

export const AUTOMATION_EDGE_TYPE = "automationInsert";

export type AutomationEdgeData = {
  branchRouted?: boolean;
  branchHandle?: "true" | "false";
};

export function applyIfBranchEdgeStyles(
  edges: Edge[],
  sourceNodeId: string,
  branchOutput: IfBranchOutput,
  colors: { true: string; false: string; idle: string },
): Edge[] {
  const trueHasData = countPullItems(branchOutput.branches.true) > 0;
  const falseHasData = countPullItems(branchOutput.branches.false) > 0;

  return edges.map((edge) => {
    if (edge.source !== sourceNodeId) return edge;
    const handle = edge.sourceHandle === "false" ? "false" : "true";
    const routed = handle === "true" ? trueHasData : falseHasData;
    const stroke = routed ? (handle === "true" ? colors.true : colors.false) : colors.idle;

    return {
      ...edge,
      animated: routed,
      data: {
        ...(edge.data as AutomationEdgeData | undefined),
        branchRouted: routed,
        branchHandle: handle,
      },
      style: {
        ...edge.style,
        stroke,
        strokeWidth: routed ? 2.5 : 1.5,
        opacity: routed ? 1 : 0.4,
        strokeDasharray: routed ? "6 4" : undefined,
      },
    };
  });
}

export function clearBranchEdgeStyles(edges: Edge[], sourceNodeId: string): Edge[] {
  return edges.map((edge) => {
    if (edge.source !== sourceNodeId) return edge;
    return {
      ...edge,
      animated: false,
      data: {
        ...(edge.data as AutomationEdgeData | undefined),
        branchRouted: false,
      },
      style: {
        ...edge.style,
        strokeWidth: 1.5,
        opacity: 1,
      },
    };
  });
}

/** Payload leaving a source node on a specific handle (e.g. If true/false). */
export function resolveOutputFromSourceNode(
  source: Node<WorkflowNodeData>,
  sourceHandle?: string | null,
): unknown | null {
  const output = source.data.lastOutput;
  if (output == null) {
    return source.data.lastInput ?? null;
  }
  if (isIfBranchOutput(output)) {
    const handle = sourceHandle === "false" ? "false" : "true";
    return output.branches[handle] ?? null;
  }
  return output;
}

/** Resolve input for a node from its upstream edge (branch-aware). */
export function resolveUpstreamInput(
  nodeId: string,
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
): unknown | null {
  const incoming = edges.filter((edge) => edge.target === nodeId);
  if (incoming.length === 0) return null;

  const edge = incoming[0];
  const source = nodes.find((node) => node.id === edge.source);
  if (!source) return null;

  return resolveOutputFromSourceNode(source, edge.sourceHandle);
}

/** Upstream nodes whose output can be inspected in the Input pane (n8n-style by-node). */
export type UpstreamDataSource = {
  nodeId: string;
  label: string;
  role: "direct" | "ancestor";
  data: unknown | null;
};

export function listUpstreamDataSources(
  nodeId: string,
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
): UpstreamDataSource[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const sources: UpstreamDataSource[] = [];
  const visited = new Set<string>();

  function walk(targetId: string, depth: number) {
    const incoming = edges.filter((edge) => edge.target === targetId);
    for (const edge of incoming) {
      if (visited.has(edge.source)) continue;
      visited.add(edge.source);
      const source = byId.get(edge.source);
      if (!source) continue;
      sources.push({
        nodeId: source.id,
        label: source.data.label || source.id,
        role: depth === 0 ? "direct" : "ancestor",
        data: resolveOutputFromSourceNode(source, edge.sourceHandle),
      });
      walk(source.id, depth + 1);
    }
  }

  walk(nodeId, 0);
  return sources;
}

export function withResolvedNodeInput(
  node: Node<WorkflowNodeData>,
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
): Node<WorkflowNodeData> {
  const hasIncoming = edges.some((edge) => edge.target === node.id);
  if (!hasIncoming) return node;
  const resolved = resolveUpstreamInput(node.id, nodes, edges);
  return {
    ...node,
    data: {
      ...node.data,
      lastInput: resolved,
    },
  };
}

function chainEdges(ids: string[]): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < ids.length - 1; i++) {
    edges.push({
      id: `e-${ids[i]}-${ids[i + 1]}`,
      source: ids[i],
      target: ids[i + 1],
      type: AUTOMATION_EDGE_TYPE,
    });
  }
  return edges;
}

function createEmptyWorkflow(id: string, name: string, target: WorkflowTarget): WorkflowDefinition {
  return {
    id,
    name,
    status: "draft",
    target,
    updatedAt: new Date().toISOString(),
    nodes: [],
    edges: [],
  };
}

const SEED_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: "auto-welcome",
    name: "Welcome sequence armer",
    status: "active",
    target: "audit",
    updatedAt: "2026-06-19T10:00:00.000Z",
    nodes: [
      verticalNode("trigger-1", "trigger", 0, {
        label: "Event-based trigger",
        configured: true,
        triggerKind: "event",
        target: "audit",
        triggerEvent: "audit.completed",
        enrollmentHint: "Reachable contacts from completed audit batches.",
      }),
      verticalNode("branch-1", "branch", 1, {
        label: "Filter",
        configured: true,
        branchKind: "true_false",
        filterSummary: "Reachable · score ≥ medium · not on active opt-in",
      }),
      verticalNode("action-1", "action", 2, {
        label: "Manage sequences",
        configured: true,
        actionType: "enroll_sequence",
        actionSummary: "Enroll in Opt-in · Standard v2",
      }),
      verticalNode("exit-1", "exit", 3, { label: "Exit", configured: true }),
    ],
    edges: chainEdges(["trigger-1", "branch-1", "action-1", "exit-1"]),
  },
  {
    id: "auto-crs-alert",
    name: "CRS threshold alert",
    status: "active",
    target: "client",
    updatedAt: "2026-06-18T14:30:00.000Z",
    nodes: [
      verticalNode("trigger-1", "trigger", 0, {
        label: "Event-based trigger",
        configured: true,
        triggerKind: "event",
        target: "client",
        triggerEvent: "eligibility.changed",
        enrollmentHint: "Clients with CRS within 5 points of latest draw threshold.",
      }),
      verticalNode("action-1", "action", 1, {
        label: "Send notification",
        configured: true,
        actionType: "notify_consultant",
        actionSummary: "Notify assigned consultant · CRS alert",
      }),
      verticalNode("exit-1", "exit", 2, { label: "Exit", configured: true }),
    ],
    edges: chainEdges(["trigger-1", "action-1", "exit-1"]),
  },
  {
    id: "auto-stale-file",
    name: "Stale file escalator",
    status: "paused",
    target: "client",
    updatedAt: "2026-06-17T09:00:00.000Z",
    nodes: [
      verticalNode("trigger-1", "trigger", 0, {
        label: "Schedule-based trigger",
        configured: false,
        triggerKind: "schedule",
        target: "client",
        scheduleSummary: "Add schedule",
        enrollmentHint: "Clients with no activity past the stale threshold.",
      }),
      verticalNode("exit-1", "exit", 1, { label: "Exit", configured: true }),
    ],
    edges: chainEdges(["trigger-1", "exit-1"]),
  },
];

const WORKFLOWS_STORAGE_KEY = "tower.automations.workflows";

function isWorkflowDefinition(value: unknown): value is WorkflowDefinition {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<WorkflowDefinition>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.status === "string" &&
    typeof candidate.target === "string" &&
    typeof candidate.updatedAt === "string" &&
    Array.isArray(candidate.nodes) &&
    Array.isArray(candidate.edges)
  );
}

export function loadPersistedWorkflows(): WorkflowDefinition[] | null {
  try {
    const raw = localStorage.getItem(WORKFLOWS_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const workflows = parsed.filter(isWorkflowDefinition);
    return workflows.length > 0 ? workflows : null;
  } catch {
    return null;
  }
}

export function savePersistedWorkflows(workflows: WorkflowDefinition[]): void {
  try {
    localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(workflows));
  } catch {
    // Ignore quota / private-mode failures; in-memory state still works for the session.
  }
}

export function getInitialWorkflows(): WorkflowDefinition[] {
  return loadPersistedWorkflows() ?? structuredClone(SEED_WORKFLOWS);
}

export function getWorkflowDefinition(id: string): WorkflowDefinition | undefined {
  return SEED_WORKFLOWS.find((w) => w.id === id);
}

export function getAllWorkflowDefinitions(): WorkflowDefinition[] {
  return SEED_WORKFLOWS;
}

export function createAutomationWorkflow(existingWorkflows: WorkflowDefinition[]): WorkflowDefinition {
  const untitledCount = existingWorkflows.filter((workflow) =>
    /^Untitled automation( \d+)?$/.test(workflow.name),
  ).length;
  const name =
    untitledCount === 0 ? "Untitled automation" : `Untitled automation ${untitledCount + 1}`;
  const id = `auto-${Date.now()}`;
  return createEmptyWorkflow(id, name, "contact");
}

export function normalizeAutomationName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, " ");
  return trimmed.length > 0 ? trimmed : "Untitled automation";
}

export function workflowStatusLabel(status: WorkflowStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "active":
      return "Active";
    case "paused":
      return "Paused";
  }
}

export function workflowHasTrigger(nodes: Node<WorkflowNodeData>[]): boolean {
  return nodes.some((node) => node.type === "trigger");
}

export function createTriggerNode(
  triggerKind: WorkflowTriggerKind,
  existingIds: string[],
  position = { x: CANVAS_CENTER_X, y: 80 },
): Node<WorkflowNodeData> {
  const id = createNodeId("trigger", existingIds);
  const labels: Record<WorkflowTriggerKind, string> = {
    event: "Event-based trigger",
    schedule: "Schedule-based trigger",
    manual: "Manual trigger",
    constant: "Constant trigger",
  };
  const enrollmentHints: Record<WorkflowTriggerKind, string> = {
    event: "Records matching enrollment criteria when the event fires.",
    schedule: "Records matching enrollment criteria on each scheduled run.",
    manual: "Records included when this automation is run manually.",
    constant: "Records evaluated when the constant value changes.",
  };

  return {
    id,
    type: "trigger",
    position,
    data: {
      label: labels[triggerKind],
      configured: false,
      triggerKind,
      enrollmentHint: enrollmentHints[triggerKind],
      runStatus: "idle",
      lastInput: null,
      lastOutput: null,
      ...(triggerKind === "event" ? { eventTriggerConfig: emptyEventTriggerConfig() } : {}),
      ...(triggerKind === "manual" ? { manualTriggerConfig: emptyManualTriggerConfig() } : {}),
      ...(triggerKind === "schedule" ? { scheduleSummary: "Add schedule" } : {}),
      ...(triggerKind === "constant"
        ? { constantKind: "automation", constantSummary: "Select constant…" }
        : {}),
    },
  };
}

export function isTriggerNodeConfigured(data: WorkflowNodeData): boolean {
  if (data.triggerKind === "event") {
    if (data.eventTriggerConfig) {
      return isEventTriggerConfigured(data.eventTriggerConfig);
    }
    return data.configured;
  }
  if (data.triggerKind === "manual") {
    if (data.manualTriggerConfig) {
      return isManualTriggerConfigured(data.manualTriggerConfig);
    }
    return data.configured;
  }
  return data.configured;
}

export function createNodeId(type: WorkflowNodeType, existingIds: string[]): string {
  let n = 1;
  while (existingIds.includes(`${type}-${n}`)) n++;
  return `${type}-${n}`;
}

export function createNodeFromBlock(
  block: PaletteBlock,
  existingIds: string[],
  position: { x: number; y: number },
): Node<WorkflowNodeData> | null {
  if (block.nodeType === "trigger") {
    return null;
  }

  const newId = createNodeId(block.nodeType, existingIds);
  return {
    id: newId,
    type: block.nodeType,
    position,
    data: {
      label: block.defaultData.label ?? block.label,
      configured: block.defaultData.configured ?? false,
      buildModule: block.module,
      branchKind: block.defaultData.branchKind,
      filterSummary: block.defaultData.filterSummary,
      operationKind: block.defaultData.operationKind,
      constantKind: block.defaultData.constantKind,
      constantSummary: block.defaultData.constantSummary,
      ruleId: block.defaultData.ruleId,
      ruleSummary: block.defaultData.ruleSummary,
      ruleConfig: block.defaultData.ruleConfig,
      actionType: block.defaultData.actionType,
      actionSummary: block.defaultData.actionSummary,
      delayLabel: block.defaultData.delayLabel,
      conditionConfig: block.defaultData.conditionConfig,
      runStatus: "idle",
      lastInput: null,
      lastOutput: null,
    },
  };
}

/** Place a palette block on the canvas without connecting it to the workflow. */
export function getDetachedNodePosition(nodes: Node<WorkflowNodeData>[]): { x: number; y: number } {
  if (nodes.length === 0) {
    return { x: CANVAS_CENTER_X, y: 80 };
  }

  const maxY = Math.max(...nodes.map((node) => node.position.y));
  const avgX = nodes.reduce((sum, node) => sum + node.position.x, 0) / nodes.length;
  return { x: avgX + 220, y: Math.max(80, maxY - 40) };
}

/** Insert a node between the endpoints of an existing edge. */
export function insertNodeOnEdge(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
  edgeId: string,
  newNode: Node<WorkflowNodeData>,
): { nodes: Node<WorkflowNodeData>[]; edges: Edge[] } {
  const edge = edges.find((item) => item.id === edgeId);
  if (!edge) {
    return { nodes, edges };
  }

  const sourceNode = nodes.find((node) => node.id === edge.source);
  const targetNode = nodes.find((node) => node.id === edge.target);
  const positionedNode: Node<WorkflowNodeData> =
    sourceNode && targetNode
      ? {
          ...newNode,
          position: {
            x: (sourceNode.position.x + targetNode.position.x) / 2,
            y: (sourceNode.position.y + targetNode.position.y) / 2,
          },
        }
      : newNode;

  return {
    nodes: [...nodes, positionedNode],
    edges: [
      ...edges.filter((item) => item.id !== edgeId),
      {
        id: `e-${edge.source}-${positionedNode.id}${edge.sourceHandle ? `-${edge.sourceHandle}` : ""}`,
        source: edge.source,
        target: positionedNode.id,
        type: AUTOMATION_EDGE_TYPE,
        ...(edge.sourceHandle ? { sourceHandle: edge.sourceHandle } : {}),
      },
      {
        id: `e-${positionedNode.id}-${edge.target}`,
        source: positionedNode.id,
        target: edge.target,
        type: AUTOMATION_EDGE_TYPE,
      },
    ],
  };
}

export function relayoutWorkflowNodes(nodes: Node<WorkflowNodeData>[]): Node<WorkflowNodeData>[] {
  const sorted = [...nodes].sort((a, b) => a.position.y - b.position.y);
  return sorted.map((node, index) => ({
    ...node,
    position: { x: CANVAS_CENTER_X, y: index * 148 },
  }));
}

export function rebuildChainEdges(nodeIds: string[]): Edge[] {
  return chainEdges(nodeIds);
}

/** Append a new node below a source and connect them. */
export function appendNodeAfter(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
  sourceNodeId: string,
  newNode: Node<WorkflowNodeData>,
  sourceHandle?: string,
): { nodes: Node<WorkflowNodeData>[]; edges: Edge[] } {
  const source = nodes.find((node) => node.id === sourceNodeId);
  if (!source) {
    return { nodes, edges };
  }

  const positioned: Node<WorkflowNodeData> = {
    ...newNode,
    position: {
      x: source.position.x,
      y: source.position.y + 160,
    },
  };

  const edge: Edge = {
    id: `e-${sourceNodeId}-${positioned.id}${sourceHandle ? `-${sourceHandle}` : ""}`,
    source: sourceNodeId,
    target: positioned.id,
    type: AUTOMATION_EDGE_TYPE,
    ...(sourceHandle ? { sourceHandle } : {}),
  };

  return {
    nodes: [...nodes, positioned],
    edges: [...edges, edge],
  };
}

export function isBranchIfNode(data: WorkflowNodeData): boolean {
  return data.branchKind === "if";
}

export function isBranchConditionConfigured(data: WorkflowNodeData): boolean {
  if (data.branchKind === "if") {
    return isIfConditionConfigured(data.conditionConfig);
  }
  return data.configured;
}

export function canDeleteWorkflowNode(nodeType: WorkflowNodeType | undefined): boolean {
  return nodeType != null;
}

export function canDuplicateWorkflowNode(nodeType: WorkflowNodeType | undefined): boolean {
  return nodeType !== "trigger";
}

/** Remove a node and bridge any edges that passed through it. */
export function deleteWorkflowNode(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
  nodeId: string,
): { nodes: Node<WorkflowNodeData>[]; edges: Edge[] } {
  const node = nodes.find((item) => item.id === nodeId);
  if (!node) {
    return { nodes, edges };
  }

  if (node.type === "trigger") {
    return {
      nodes: nodes.filter((item) => item.id !== nodeId),
      edges: edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    };
  }

  const incoming = edges.filter((edge) => edge.target === nodeId);
  const outgoing = edges.filter((edge) => edge.source === nodeId);
  const remainingEdges = edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);

  const bridgeEdges: Edge[] = [];
  for (const inEdge of incoming) {
    for (const outEdge of outgoing) {
      if (inEdge.source === outEdge.target) {
        continue;
      }
      const bridgeId = `e-${inEdge.source}-${outEdge.target}`;
      if (remainingEdges.some((edge) => edge.id === bridgeId)) {
        continue;
      }
      bridgeEdges.push({
        id: bridgeId,
        source: inEdge.source,
        target: outEdge.target,
        type: AUTOMATION_EDGE_TYPE,
      });
    }
  }

  return {
    nodes: nodes.filter((item) => item.id !== nodeId),
    edges: [...remainingEdges, ...bridgeEdges],
  };
}

/** Duplicate a node as an unconnected copy offset from the original. */
export function duplicateWorkflowNode(
  nodes: Node<WorkflowNodeData>[],
  nodeId: string,
): { nodes: Node<WorkflowNodeData>[]; newNodeId: string | null } {
  const source = nodes.find((item) => item.id === nodeId);
  if (!source?.type || source.type === "trigger") {
    return { nodes, newNodeId: null };
  }

  const existingIds = nodes.map((item) => item.id);
  const newId = createNodeId(source.type, existingIds);
  const duplicate: Node<WorkflowNodeData> = {
    ...source,
    id: newId,
    position: {
      x: source.position.x + 48,
      y: source.position.y + 32,
    },
    data: structuredClone(source.data),
  };

  return {
    nodes: [...nodes, duplicate],
    newNodeId: newId,
  };
}

/** Insert a node before the terminal exit node in the linear chain */
export function insertBeforeExit(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
  newNode: Node<WorkflowNodeData>,
): { nodes: Node<WorkflowNodeData>[]; edges: Edge[] } {
  const exitIndex = nodes.findIndex((n) => n.type === "exit");
  const withoutExit =
    exitIndex >= 0 ? nodes.filter((n) => n.id !== nodes[exitIndex]!.id) : [...nodes];
  const nextNodes = relayoutWorkflowNodes([...withoutExit, newNode, ...(exitIndex >= 0 ? [nodes[exitIndex]!] : [])]);
  const orderedIds = nextNodes.map((n) => n.id);
  return { nodes: nextNodes, edges: rebuildChainEdges(orderedIds) };
}
