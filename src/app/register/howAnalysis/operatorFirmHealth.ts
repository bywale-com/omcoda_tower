import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can see engagement health scoped to one firm — so that support can restore it and the Consultant keeps getting meetings.",
    criteria: {
      when: "Investigating or monitoring one tenancy.",
      conditions: [
        "Firm-scoped slice of fleet oversight.",
      ],
    },
    components: {},
    position: { x: 80, y: 0 },
  },
  {
    id: "depth-1",
    parentId: "outcome",
    kind: "leaf",
    depth: 1,
    question: "How do I see engagement health scoped to one firm?",
    clarity: "Starting from Firm health, read Sequence health and Engagement health for this tenancy; open a failing Sequence to see what's stuck, then hand context to Support if needed.",
    criteria: {
      when: "Drill from Oversight or direct per-tenancy open.",
      conditions: [
        "Scoped to one firm",
        "actionable for Support restore.",
      ],
    },
    components: {
      ui: [
        "Firm health",
        "Sequence health",
        "Engagement health",
        "Sequence detail",
        "Customer support",
      ],
    },
    isLeaf: true,
    position: { x: 80, y: 130 },
  },
];

export const OPERATOR_FIRM_HEALTH_GRAPH: HowGraph = {
  id: "operator-firm-health",
  label: "Firm health",
  epicOrder: 20,
  personaId: "operator",
  outcomeId: "operator-firm-health",
  nodes,
};
