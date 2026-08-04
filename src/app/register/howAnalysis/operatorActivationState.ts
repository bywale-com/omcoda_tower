import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can see a firm's forward-deploy and hard-input progress toward running — so that a stalled firm is moved to a running desk.",
    criteria: {
      when: "Firm is between capture and running.",
      conditions: ["Shows forward-deploy + DB auth + escrow progress."],
    },
    components: {},
    position: { x: 80, y: 0 },
  },
{
    id: "depth-1",
    parentId: "outcome",
    kind: "leaf",
    depth: 1,
    question: "How do I see a firm's forward-deploy and hard-input progress toward running?",
    clarity: "Starting from Activation state, click **Progress**. View checklist rows for forward-deployed, authorize-book, escrow-held, and running with status chips. On a stalled row, click **Jump to Activation & forward-deploy** or **Jump to Commercial** to unblock the exact gate. Checklist rows read consultant/operator commits — Progress itself does not fake-complete hard inputs.",
    criteria: {
      when: "Monitoring in-flight activation.",
      conditions: ["Stalled steps actionable", "Support can use same context."],
    },
    components: {
      ui: ["Activation state", "Progress", "Jump to Activation & forward-deploy", "Jump to Commercial", "Activation & forward-deploy", "Commercial"],
    },
    isLeaf: true,
    position: { x: 80, y: 130 },
  },

];

export const OPERATOR_ACTIVATION_STATE_GRAPH: HowGraph = {
  id: "operator-activation-state",
  label: "Activation state",
  epicOrder: 21,
  personaId: "operator",
  outcomeId: "operator-activation-state",
  nodes,
};
