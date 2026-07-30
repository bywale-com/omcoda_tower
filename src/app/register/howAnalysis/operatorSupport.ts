import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can answer a running firm's questions and work its tickets with that firm's bind, health, and commercial context — so that the Consultant's firm keeps running.",
    criteria: {
      when: "Running firm asks or operational ticket opens.",
      conditions: [
        "Agency queue + firm-scoped context",
        "not a firm-desk persona.",
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
    question: "How do I answer a running firm's questions and work its tickets with that firm's bind, health, and commercial context?",
    clarity: "Starting from Customer support, I work the Ticket queue, open a Ticket with that firm's Support context (bind, health, commercial), and resolve so the Consultant's firm keeps running.",
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
    question: "How do I work the Ticket queue?",
    clarity: "Starting from Customer support, open Ticket queue and pick an open Ticket for a running firm.",
    criteria: {
      when: "Tickets exist.",
      conditions: [
        "House-global queue",
        "firm identity on each row.",
      ],
    },
    components: {
      ui: [
        "Customer support",
        "Ticket queue",
        "Ticket row",
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
    question: "How do I open a Ticket with that firm's Support context (bind, health, commercial)?",
    clarity: "On Ticket, open Support context pane to see Firm operations bind, Firm health, Commercial / escrow, Activation state, and recent Audit trail events for that tenancy — without leaving the ticket.",
    criteria: {
      when: "Ticket selected.",
      conditions: [
        "Context is read/ops for this firm only",
        "no cross-firm leak in the pane.",
      ],
    },
    components: {
      ui: [
        "Ticket",
        "Support context",
        "Firm operations bind / Firm health / Commercial / Activation state / Audit trail",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
  {
    id: "leaf-1.3",
    parentId: "depth-1",
    kind: "leaf",
    depth: 2,
    question: "How do I resolve so the Consultant's firm keeps running?",
    clarity: "On Ticket, apply the fix via the linked per-tenancy controls (re-bind, restore health, commercial unblock) and set Resolve; Consultant Access / Board / Meetings keep working without the firm authoring packs.",
    criteria: {
      when: "Root cause addressed.",
      conditions: [
        "Resolution auditable",
        "Consultant remains receive/govern only.",
      ],
    },
    components: {
      ui: [
        "Resolve control",
        "Linked per-tenancy actions",
        "Audit trail",
      ],
    },
    isLeaf: true,
    position: { x: 560, y: 260 },
  },
];

export const OPERATOR_SUPPORT_GRAPH: HowGraph = {
  id: "operator-support",
  label: "Customer support / success",
  epicOrder: 22,
  personaId: "operator",
  outcomeId: "operator-support",
  nodes,
};
