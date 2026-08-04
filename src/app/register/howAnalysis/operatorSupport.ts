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
      conditions: ["Agency queue + firm-scoped context", "not a firm-desk persona."],
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
    clarity: "Starting from Customer support, open Ticket queue, select a Ticket row, inspect Support context tabs for bind, health, commercial, activation, and audit facts, then click Resolve after the linked per-tenancy control is fixed.",
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
    clarity: "Starting from Customer support, click **Ticket queue** and click an open Ticket row for a running firm; row chips show firm, severity, source, and current owner.",
    criteria: {
      when: "Tickets exist.",
      conditions: ["House-global queue", "firm identity on each row."],
    },
    components: {
      ui: ["Customer support", "Ticket queue", "Ticket row"],
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
    clarity: "On Ticket, click **Support context** to open the pane. Click tabs for Firm operations bind, Firm health, Commercial / escrow, Activation state, and recent Audit trail events for that tenancy — view scoped context rows without leaving the ticket. Tab selection is view chrome; click **Jump to** on a linked control to open the scoped per-tenancy module when a fix is needed.",
    criteria: {
      when: "Ticket selected.",
      conditions: ["Context is view-only for this firm only", "no cross-firm leak in the pane."],
    },
    components: {
      ui: ["Ticket", "Support context", "Jump to scoped module", "Firm operations bind / Firm health / Commercial / Activation state / Audit trail"],
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
    clarity: "On Ticket, click the linked per-tenancy **Jump to** control (re-bind, restore health, commercial unblock), apply the fix on that scoped control, return to the Ticket, and click **Resolve** (primary button); Consultant Access / Board / Meetings keep working without the firm authoring packs.",
    criteria: {
      when: "Root cause addressed.",
      conditions: ["Resolution auditable", "Consultant remains receive/govern only."],
    },
    components: {
      ui: ["Linked per-tenancy actions", "Resolve", "Audit trail"],
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
