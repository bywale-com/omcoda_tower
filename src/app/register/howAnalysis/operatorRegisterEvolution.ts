import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can document friction from running firms and regenerate the methodology into house build tooling — so that the next authored operations reach the configuration libraries.",
    criteria: {
      when: "Running-firm friction appears.",
      conditions: [
        "House build tooling only",
        "shipped firm product contains no Register.",
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
    question: "How do I document friction from running firms and regenerate the methodology into house build tooling?",
    clarity: "Starting from Register & evolution, I log a Gap from running-firm friction, then regenerate methodology so Configuration libraries can take the next authored operations.",
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
    question: "How do I log a Gap from running-firm friction?",
    clarity: "Starting from Register & evolution, open Gaps; On Gap, document the friction (and optional Support ticket link) as a methodology gap — not a firm-desk ticket UI.",
    criteria: {
      when: "Friction found via Support or Oversight.",
      conditions: [
        "Gap is house-only",
        "never exposed on Consultant Board.",
      ],
    },
    components: {
      ui: [
        "Register & evolution",
        "Gaps",
        "Gap",
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
    question: "How do I regenerate methodology so Configuration libraries can take the next authored operations?",
    clarity: "On Gap, mark Affordance / backend facet written; On Register & evolution, run Regenerate handoff so the next authoring work lands in Configuration libraries — still never on the firm desk.",
    criteria: {
      when: "Gap resolved into written affordance.",
      conditions: [
        "Output is house config evolution, not firm Register chrome.",
      ],
    },
    components: {
      ui: [
        "Regenerate handoff",
        "Configuration libraries",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
];

export const OPERATOR_REGISTER_EVOLUTION_GRAPH: HowGraph = {
  id: "operator-register-evolution",
  label: "Register & evolution",
  epicOrder: 14,
  personaId: "operator",
  outcomeId: "operator-register-evolution",
  nodes,
};
