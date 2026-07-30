import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can see who changed which operation, when, and on which firm — so that support and founder oversight can account for every change over real client books.",
    criteria: {
      when: "After any open-box or bind change over firm books.",
      conditions: [
        "Who / what / when / which firm accountable.",
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
    question: "How do I see who changed which operation, when, and on which firm?",
    clarity: "Starting from Audit trail, filter by firm or actor, and open a Change event to see what operation changed.",
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
    question: "How do I filter by firm or actor?",
    clarity: "Starting from Audit trail, use Firm filter and Actor filter to scope the log.",
    criteria: {
      when: "Investigating or reviewing house changes.",
      conditions: [
        "Tenancy-scoped events visible",
        "cross-firm when unfiltered.",
      ],
    },
    components: {
      ui: [
        "Audit trail",
        "Firm filter / Actor filter",
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
    question: "How do I open a Change event to see what operation changed?",
    clarity: "On Audit trail, open Change event to read operation, before/after or summary, timestamp, and firm.",
    criteria: {
      when: "A row is selected.",
      conditions: [
        "Open-box and bind changes both appear.",
      ],
    },
    components: {
      ui: [
        "Change event",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
];

export const OPERATOR_AUDIT_TRAIL_GRAPH: HowGraph = {
  id: "operator-audit-trail",
  label: "Audit trail",
  epicOrder: 13,
  personaId: "operator",
  outcomeId: "operator-audit-trail",
  nodes,
};
