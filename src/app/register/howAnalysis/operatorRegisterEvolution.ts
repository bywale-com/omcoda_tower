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
      conditions: ["House build tooling only", "shipped firm product contains no Register."],
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
    clarity: "Starting from Register & evolution, click **Gaps**, click **New gap** (or an existing Gap row) and click **Save gap** on Gap modal, then on Gap toggle Affordance / backend facet to Written and click **Regenerate handoff** so Configuration libraries can take the next authored operations.",
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
    clarity: "Starting from Register & evolution, click **Gaps**. Click **New gap** (or an existing Gap row). On Gap modal, type the friction summary, optionally link a Support ticket id, and click **Save gap** (primary button). Gap is house-only methodology friction — never a firm-desk ticket UI on Consultant Board.",
    criteria: {
      when: "Friction found via Support or Oversight.",
      conditions: ["Gap is house-only", "never exposed on Consultant Board."],
    },
    components: {
      ui: ["Register & evolution", "Gaps", "Gap", "Save gap"],
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
    clarity: "On Gap, toggle Affordance / backend facet to Written; on Register & evolution, click **Regenerate handoff** (primary button). Regenerate writes handoff state read by Configuration libraries authoring path — still never on the firm desk.",
    criteria: {
      when: "Gap resolved into written affordance.",
      conditions: ["Output is house config evolution, not firm Register chrome."],
    },
    components: {
      ui: ["Regenerate handoff", "Configuration libraries"],
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
