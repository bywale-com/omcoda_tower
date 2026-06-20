import type { Edge, Node } from "@xyflow/react";

export type WorkflowTarget = "audit" | "contact" | "import" | "client";

export type WorkflowStatus = "draft" | "active" | "paused";

export type WorkflowEditorTab = "workflow" | "settings" | "enrollment";

export type WorkflowNodeType = "trigger" | "branch" | "action" | "exit";

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

export type WorkflowBranchKind = "true_false" | "multi_split" | "delay";

export type WorkflowNodeData = {
  label: string;
  configured: boolean;
  target?: WorkflowTarget;
  triggerEvent?: WorkflowTriggerEvent;
  enrollmentHint?: string;
  branchKind?: WorkflowBranchKind;
  filterSummary?: string;
  actionType?: WorkflowActionType;
  actionSummary?: string;
  delayLabel?: string;
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
  category: "rules" | "actions";
  nodeType: WorkflowNodeType;
  defaultData: Partial<WorkflowNodeData>;
};

export const WORKFLOW_PALETTE_BLOCKS: PaletteBlock[] = [
  {
    id: "rule-branch",
    label: "True / false branch",
    description: "Filter split criteria",
    category: "rules",
    nodeType: "branch",
    defaultData: {
      label: "Filter",
      branchKind: "true_false",
      filterSummary: "Add filter criteria",
      configured: false,
    },
  },
  {
    id: "rule-delay",
    label: "Delay",
    description: "Wait before next step",
    category: "rules",
    nodeType: "branch",
    defaultData: {
      label: "Delay",
      branchKind: "delay",
      delayLabel: "1 hour",
      configured: true,
    },
  },
  {
    id: "rule-exit",
    label: "Exit",
    description: "End this path",
    category: "rules",
    nodeType: "exit",
    defaultData: { label: "Exit", configured: true },
  },
  {
    id: "action-sequence",
    label: "Manage sequences",
    description: "Enroll or remove from a sequence",
    category: "actions",
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
    category: "actions",
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
    category: "actions",
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
    category: "actions",
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
  const triggerId = "trigger-1";
  return {
    id,
    name,
    status: "draft",
    target,
    updatedAt: new Date().toISOString(),
    nodes: [
      verticalNode(triggerId, "trigger", 0, {
        label: "Event-based trigger",
        configured: false,
        target,
        enrollmentHint: "Saved records matching enrollment criteria when the event fires.",
      }),
      verticalNode("exit-1", "exit", 1, { label: "Exit", configured: true }),
    ],
    edges: chainEdges([triggerId, "exit-1"]),
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
  createEmptyWorkflow("auto-stale-file", "Stale file escalator", "client"),
];

SEED_WORKFLOWS[2]!.status = "paused";

export function getWorkflowDefinition(id: string): WorkflowDefinition | undefined {
  return SEED_WORKFLOWS.find((w) => w.id === id);
}

export function getAllWorkflowDefinitions(): WorkflowDefinition[] {
  return SEED_WORKFLOWS;
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
      branchKind: block.defaultData.branchKind,
      filterSummary: block.defaultData.filterSummary,
      actionType: block.defaultData.actionType,
      actionSummary: block.defaultData.actionSummary,
      delayLabel: block.defaultData.delayLabel,
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
        id: `e-${edge.source}-${positionedNode.id}`,
        source: edge.source,
        target: positionedNode.id,
        type: AUTOMATION_EDGE_TYPE,
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

export function canDeleteWorkflowNode(nodeType: WorkflowNodeType | undefined): boolean {
  return nodeType !== "trigger";
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
  if (!node || node.type === "trigger") {
    return { nodes, edges };
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
