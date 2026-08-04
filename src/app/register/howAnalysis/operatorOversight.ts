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
      conditions: ["Cross-firm view with tenancy drill-down."],
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
    clarity: "Starting from Oversight, open Fleet health, scan firm rows with deliverability / sequence / engagement status chips, then click an unhealthy Firm row to open that tenancy's Firm health slice.",
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
    clarity: "Starting from Oversight, click **Fleet health**. View the firm table with deliverability, sequence, and engagement status chips plus last-run timestamp; use sort/filter dropdowns only as view chrome (unless a saved fleet filter is persisted for the operator session). Unhealthy chips are the drill cue into Firm health.",
    criteria: {
      when: "Ongoing agency ops.",
      conditions: ["Silent sequence failure is visible at fleet level."],
    },
    components: {
      ui: ["Oversight", "Fleet health", "Firm row"],
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
    clarity: "On Fleet health, click a Firm row with an unhealthy chip to land on Firm health (per-tenancy), preserving that firm filter for Sequence health, Engagement health, and Sequence detail.",
    criteria: {
      when: "A firm shows unhealthy signals.",
      conditions: ["Drill preserves firm scope", "Support can pick up from same context."],
    },
    components: {
      ui: ["Firm row", "Firm health"],
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
