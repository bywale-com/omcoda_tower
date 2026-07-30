import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can set cross-firm bounds, kill-switches, and agency policy — so that many tenancies are overseen without leaking controls into any firm's workspace.",
    criteria: {
      when: "Agency-wide policy or emergency control needed.",
      conditions: [
        "Controls stay house-global — never appear as firm-desk settings.",
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
    question: "How do I set cross-firm bounds, kill-switches, and agency policy?",
    clarity: "Starting from Founder & agency controls, I set Agency policy and Bounds, and I can throw a Kill-switch that stops motion across or within tenancies without putting those controls on a firm workspace.",
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
    question: "How do I set Agency policy and Bounds?",
    clarity: "Starting from Founder & agency controls, open Agency policy and edit Bounds (cross-firm limits, what may bind, what may send).",
    criteria: {
      when: "Policy change.",
      conditions: [
        "Changes audit-logged",
        "not visible in Consultant nav.",
      ],
    },
    components: {
      ui: [
        "Founder & agency controls",
        "Agency policy",
        "Bounds",
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
    question: "How do I throw a Kill-switch?",
    clarity: "On Founder & agency controls, open Kill-switch and halt motion fleet-wide or for selected tenancies.",
    criteria: {
      when: "Emergency or policy enforcement.",
      conditions: [
        "Honor by engagement runners",
        "Audit trail records actor.",
      ],
    },
    components: {
      ui: [
        "Kill-switch",
        "Audit trail",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
];

export const OPERATOR_FOUNDER_CONTROLS_GRAPH: HowGraph = {
  id: "operator-founder-controls",
  label: "Founder & agency controls",
  epicOrder: 15,
  personaId: "operator",
  outcomeId: "operator-founder-controls",
  nodes,
};
