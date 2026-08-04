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
      conditions: ["Escrow is firm↔Om Coda contingent cost — not immigrant settlement funds."],
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
    clarity: "Starting from Commercial, open the firm instrument list, select a firm row, set the scoped escrow terms, then use Escrow status and Release control on that instrument through hold, window, release, return, or dispute.",
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
    clarity: "Starting from Commercial, click a firm row in the instrument list. On the scoped record, click **Escrow terms**; type contingent cost, cap, release predicate, and measurement window fields; click **Save terms version** (primary button). That published terms version is what Prepared Workspace → Accept terms presents to the consultant — drafts do not appear there.",
    criteria: {
      when: "Before or during activation for that tenancy.",
      conditions: ["Terms presentable on Accept terms."],
    },
    components: {
      ui: ["Commercial", "Instrument list / firm row", "Escrow terms", "Save terms version"],
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
    clarity: "On Commercial, click a firm/instrument row in the instrument list. Click **Escrow status** to view held / release_pending_window / released / returned / disputed status chips. On **Release control**, click **Execute release**, **Execute return**, or **Open dispute** only when the scoped instrument's terms and evidence enable the action.",
    criteria: {
      when: "After terms offered.",
      conditions: ["Consultant acceptance is the hard gate", "operator oversees."],
    },
    components: {
      ui: ["Escrow status", "Release control", "Accept terms"],
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
