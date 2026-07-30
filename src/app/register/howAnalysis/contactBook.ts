import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Engagement contact, I can book a meeting when invited and arrive where the firm already knows my current facts — so that the Consultant takes the meeting with a live brief.",
    criteria: {
      when: "When invited after eligibility warrants a meeting.",
      conditions: [
        "Invitation firm-branded",
        "facts already on the firm side for Live brief.",
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
    question: "How do I book a meeting when invited and arrive where the firm already knows my current facts?",
    clarity: "I open a firm-branded Meeting invitation, pick a time to book, and arrive so the firm already holds my current facts for the consultant's live brief.",
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
    question: "How do I open a firm-branded Meeting invitation and pick a time to book?",
    clarity: "Starting from Meeting invitation, open Booking and choose a slot; confirm to book.",
    criteria: {
      when: "Invitation sent (bound campaign toward meeting).",
      conditions: [
        "Eligible / invited",
        "contact not silenced.",
      ],
    },
    components: {
      ui: [
        "Meeting invitation",
        "Booking",
        "Slot picker",
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
    question: "How do I arrive so the firm already holds my current facts for the consultant's live brief?",
    clarity: "On Booking confirm (or a pending Loop-closer form before the meeting), I can fill outstanding self-reportable fields; those write back so On Live brief the consultant already sees current facts — I don't re-explain from scratch.",
    criteria: {
      when: "At book or pending meeting.",
      conditions: [
        "Loop-closer consolidates outstanding self-reportable",
        "write-back re-evaluates.",
      ],
    },
    components: {
      ui: [
        "Loop-closer form",
        "Booking confirm",
        "Live brief",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
];

export const CONTACT_BOOK_GRAPH: HowGraph = {
  id: "contact-book",
  label: "Book",
  epicOrder: 7,
  personaId: "engagement_contact",
  outcomeId: "contact-book",
  nodes,
};
