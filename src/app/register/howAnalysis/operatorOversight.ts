import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can watch engagement and sequence health across every firm and drill into any one — so that a failing tenancy is caught before the Consultant loses meetings.",
    criteria: {
      when: "Continuously across the agency fleet.",
      conditions: [
        "Cross-firm view with tenancy drill-down.",
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
    question: "How do I watch engagement and sequence health across every firm and drill into any one?",
    clarity: "Starting from Oversight, I read Fleet health across firms, then drill into a Tenancy slice when one is failing.",
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
    question: "How do I read Fleet health across firms?",
    clarity: "Starting from Oversight, open Fleet health and scan deliverability / sequence / engagement signals across tenancies.",
    criteria: {
      when: "Ongoing agency ops.",
      conditions: [
        "Silent sequence failure is visible at fleet level.",
      ],
    },
    components: {
      ui: [
        "Oversight",
        "Fleet health",
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
    question: "How do I drill into a Tenancy slice when one is failing?",
    clarity: "On Fleet health, open a Firm row to land on Firm health (per-tenancy) for that tenancy's sequence and engagement detail.",
    criteria: {
      when: "A firm shows unhealthy signals.",
      conditions: [
        "Drill preserves firm scope",
        "Support can pick up from same context.",
      ],
    },
    components: {
      ui: [
        "Firm row",
        "Firm health",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
];

export const OPERATOR_OVERSIGHT_GRAPH: HowGraph = {
  id: "operator-oversight",
  label: "Oversight",
  epicOrder: 12,
  personaId: "operator",
  outcomeId: "operator-oversight",
  nodes,
};
