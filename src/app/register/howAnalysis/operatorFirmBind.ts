import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can bind house-authored evaluation, automation, and campaign packs under a firm's identity — so that the Consultant's book is worked without the firm authoring anything.",
    criteria: {
      when: "Firm reaching or already running.",
      conditions: [
        "Packs exist in Configuration libraries",
        "bind is per-tenancy identity.",
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
    question: "How do I bind house-authored evaluation, automation, and campaign packs under a firm's identity?",
    clarity: "Starting from Firm operations bind, I choose packs from Configuration libraries and bind them under this firm identity, then arm so the book is worked without firm authorship.",
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
    question: "How do I choose packs from Configuration libraries and bind them under this firm identity?",
    clarity: "Starting from Firm operations bind, open Bind packs; On Bind packs, select Evaluation pack, Automation pack, and Engagement template versions and Bind to this firm.",
    criteria: {
      when: "Activating or changing what runs for a tenancy.",
      conditions: [
        "Only house-authored versions selectable",
        "Audit trail records bind.",
      ],
    },
    components: {
      ui: [
        "Firm operations bind",
        "Bind packs",
        "Pack version pickers",
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
    question: "How do I arm so the book is worked without firm authorship?",
    clarity: "On Firm operations bind, set Armed / Active for the bound campaign under this identity. Consultant Board shows inhabited motion only — no pack editor required on the firm desk.",
    criteria: {
      when: "After bind, when campaign should run.",
      conditions: [
        "Armed = template ready",
        "Active = executing",
        "consultant does not author.",
      ],
    },
    components: {
      ui: [
        "Armed / Active controls",
        "Board",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
];

export const OPERATOR_FIRM_BIND_GRAPH: HowGraph = {
  id: "operator-firm-bind",
  label: "Firm operations bind",
  epicOrder: 18,
  personaId: "operator",
  outcomeId: "operator-firm-bind",
  nodes,
};
