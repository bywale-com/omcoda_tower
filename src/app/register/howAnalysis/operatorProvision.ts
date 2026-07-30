import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can provision a firm and its user through the assisted door — so that the Consultant reaches the same desk when ALG isn't the path.",
    criteria: {
      when: "OLG / assisted path chosen instead of ALG.",
      conditions: [
        "Intentional mint — not self-serve",
        "same application desk as ALG.",
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
    question: "How do I provision a firm and its user through the assisted door?",
    clarity: "Starting from Provision, I create the Firm tenancy and User, then hand the consultant the same Login path into the desk.",
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
    question: "How do I create the Firm tenancy and User?",
    clarity: "Starting from Provision (per-tenancy admin), open New firm; On New firm, enter firm and user seed fields and Provision. (Seed manifests remain a valid backend path — leaf process.)",
    criteria: {
      when: "Assisted onboarding.",
      conditions: [
        "Tenancy intentional",
        "user email will OTP.",
      ],
    },
    components: {
      ui: [
        "Provision",
        "New firm",
        "Firm / user fields",
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
    question: "How do I hand the consultant the same Login path into the desk?",
    clarity: "On Provision complete, the consultant uses Login (OTP) into the same Board — no separate assisted app.",
    criteria: {
      when: "After provision succeeds.",
      conditions: [
        "Same session matrix as ALG-provisioned firms.",
      ],
    },
    components: {
      ui: [
        "Login",
        "Board",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
];

export const OPERATOR_PROVISION_GRAPH: HowGraph = {
  id: "operator-provision",
  label: "Provision (assisted door)",
  epicOrder: 16,
  personaId: "operator",
  outcomeId: "operator-provision",
  nodes,
};
