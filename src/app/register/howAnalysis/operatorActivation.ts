import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can stage a no-login prepared workspace for a captured firm from house templates and public facts, walk the firm through readiness, and secure its database authorization and escrow — so that the Consultant reaches a running desk.",
    criteria: {
      when: "After seed inputs land (ALG) for a captured firm.",
      conditions: [
        "House templates + public facts suffice for readiness proof",
        "hard inputs still earned.",
      ],
    },
    components: {},
    position: { x: 80, y: 0 },
  },
  {
    id: "depth-1",
    parentId: "outcome",
    kind: "answer",
    depth: 1,
    question: "How do I stage a no-login prepared workspace for a captured firm from house templates and public facts, walk the firm through readiness, and secure its database authorization and escrow?",
    clarity: "I forward-deploy a Prepared Workspace from house templates and public facts, walk readiness with the firm, and secure database authorization plus escrow acceptance.",
    criteria: {
      conditions: [],
    },
    components: {},
    position: { x: 80, y: 130 },
  },
  {
    id: "leaf-1.1",
    parentId: "depth-1",
    kind: "leaf",
    depth: 2,
    question: "How do I forward-deploy a Prepared Workspace from house templates and public facts?",
    clarity: "Starting from Activation & forward-deploy, open In-flight activations; On a captured firm row, run Forward-deploy to stage Prepared Workspace under the firm's identity from Configuration libraries templates plus public firm facts — no client PII required yet.",
    criteria: {
      when: "Seed inputs landed.",
      conditions: [
        "Templates available",
        "public facts readable",
        "no-login artifact staged.",
      ],
    },
    components: {
      ui: [
        "Activation & forward-deploy",
        "In-flight activations",
        "Forward-deploy control",
        "Prepared Workspace",
        "Configuration libraries",
      ],
    },
    isLeaf: true,
    position: { x: 80, y: 260 },
  },
  {
    id: "leaf-1.2",
    parentId: "depth-1",
    kind: "leaf",
    depth: 2,
    question: "How do I walk readiness with the firm?",
    clarity: "On Prepared Workspace, present Readiness walkthrough (agent presentation presents; fulfillment stays separate) so the consultant sees the staged campaign under their identity before hard inputs.",
    criteria: {
      when: "Prepared Workspace is staged.",
      conditions: [
        "Readiness proof, not value proof",
        "no-login still.",
      ],
    },
    components: {
      ui: [
        "Prepared Workspace",
        "Readiness walkthrough",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
  {
    id: "leaf-1.3",
    parentId: "depth-1",
    kind: "leaf",
    depth: 2,
    question: "How do I secure database authorization plus escrow acceptance?",
    clarity: "On Prepared Workspace, confirm Authorize book and Accept terms complete for that firm; On Activation state (per-tenancy), mark hard inputs landed so the desk can run.",
    criteria: {
      when: "After readiness is legible.",
      conditions: [
        "Both hard inputs required",
        "Commercial holds escrow terms.",
      ],
    },
    components: {
      ui: [
        "Prepared Workspace",
        "Authorize book / Accept terms",
        "Activation state",
        "Commercial",
      ],
    },
    isLeaf: true,
    position: { x: 560, y: 260 },
  },
];

export const OPERATOR_ACTIVATION_GRAPH: HowGraph = {
  id: "operator-activation",
  label: "Activation & forward-deploy",
  epicOrder: 9,
  personaId: "operator",
  outcomeId: "operator-activation",
  nodes,
};
