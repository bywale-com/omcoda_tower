/** Contract detail on a wire — API calls, payloads, not process narration. */
export type RegisterFlowWireMeta = {
  method?: string;
  path?: string;
  body?: string;
};

/** How a transfer crosses a wire — mechanism + code location for component auditability. */
export type RegisterFlowWireVia = {
  mechanism: string;
  location: string;
};

/**
 * Canvas wire between holons and/or system nodes on the register view canvas.
 * Shown when a flow step is hovered; metadata reveals on the wire.
 */
export type RegisterFlowCanvasWire = {
  id: string;
  sourceHolonId?: string;
  sourceSystemNodeId?: string;
  sourceTableNodeId?: string;
  targetHolonId?: string;
  targetSystemNodeId?: string;
  targetTableNodeId?: string;
  /** Payload crossing the wire */
  out: string;
  /** When the transfer is allowed */
  conditions?: string[];
  /** Target receives — omit when identical to out (no transform) */
  in?: string;
  via: RegisterFlowWireVia;
  /** dashed = single edge; solid = multiple / recurring (per register graph legend) */
  edgeStyle?: "solid" | "dashed";
  /** Position in the parent flow sequence — suffix marks parallel sister processes (3a, 3b). */
  flowOrder?: { step: number; suffix?: string };
};

export function formatFlowOrderLabel(order: { step: number; suffix?: string }): string {
  return `${order.step}${order.suffix ?? ""}`;
}

export type RegisterFlowNodeKind = "control" | "service" | "provider" | "store" | "view";

export type RegisterFlowGraphNode = {
  id: string;
  kind: RegisterFlowNodeKind;
  label: string;
  /** Where this node lives — e.g. Consultant Web App · Login Form */
  boundary?: string;
  holonId?: string;
  viewId?: string;
  /** Links to a reusable system node on the register canvas */
  systemNodeId?: string;
  /** Links to a register table node on the canvas */
  tableNodeId?: string;
  position: { x: number; y: number };
};

export type RegisterFlowGraphEdge = {
  id: string;
  source: string;
  target: string;
  /** Named connection — e.g. Authenticates via, Sends OTP via */
  label: string;
  wireMeta?: RegisterFlowWireMeta;
};

/** One graphed step — nodes + directed wires, not a metadata paragraph. */
export type RegisterFlowStep = {
  id: string;
  flowId: string;
  flowLabel: string;
  stepLabel: string;
  purpose: string;
  nodes: RegisterFlowGraphNode[];
  edges: RegisterFlowGraphEdge[];
  /** Wires drawn on the view canvas when this step is active */
  canvasWires?: RegisterFlowCanvasWire[];
};

export type RegisterFlow = {
  id: string;
  label: string;
  steps: RegisterFlowStep[];
};
