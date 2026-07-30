import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can hold and oversee a firm's escrow and contingent terms — so that the Consultant can accept the terms and reach running.",
    criteria: {
      when: "Around activation money door and while contingent terms remain open.",
      conditions: [
        "Escrow is firm↔Om Coda contingent cost — not immigrant settlement funds.",
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
    question: "How do I hold and oversee a firm's escrow and contingent terms?",
    clarity: "Starting from Commercial, I set Escrow terms for the firm and oversee Escrow status through acceptance and release.",
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
    question: "How do I set Escrow terms for the firm?",
    clarity: "Starting from Commercial, open Escrow terms and set contingent cost / release terms this firm will Accept on Prepared Workspace.",
    criteria: {
      when: "Before or during activation for that tenancy.",
      conditions: [
        "Terms presentable on Accept terms.",
      ],
    },
    components: {
      ui: [
        "Commercial",
        "Escrow terms",
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
    question: "How do I oversee Escrow status through acceptance and release?",
    clarity: "On Commercial, open Escrow status to see pending / accepted / released for this firm; act on release when terms met.",
    criteria: {
      when: "After terms offered.",
      conditions: [
        "Consultant acceptance is the hard gate",
        "operator oversees.",
      ],
    },
    components: {
      ui: [
        "Escrow status",
        "Release control",
        "Accept terms",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
];

export const OPERATOR_COMMERCIAL_GRAPH: HowGraph = {
  id: "operator-commercial",
  label: "Commercial (escrow / contingent terms)",
  epicOrder: 17,
  personaId: "operator",
  outcomeId: "operator-commercial",
  nodes,
};
