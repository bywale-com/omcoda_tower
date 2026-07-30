import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can run the reachability gate over a firm's book — so that only reachable contacts enter engagement.",
    criteria: {
      when: "On / after import or book connect for a tenancy.",
      conditions: [
        "One operational question — can we reach them and start a sequence? Not pathway scoring.",
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
    question: "How do I run the reachability gate over a firm's book?",
    clarity: "Starting from Book readiness, I run an Audit batch for this firm's book and read Reachability verdicts so only sequence-ready contacts enter engagement.",
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
    question: "How do I run an Audit batch for this firm's book?",
    clarity: "Starting from Book readiness, open Audits; On Audit run, start a batch against this firm's import/book (email/phone validity, channel match, dedupe, consent/silenced, name present).",
    criteria: {
      when: "Import landed or book connected.",
      conditions: [
        "Data-validity / sequence-ready only — not CRS / sales ROI.",
      ],
    },
    components: {
      ui: [
        "Book readiness",
        "Audits / Audit run",
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
    question: "How do I read Reachability verdicts so only sequence-ready contacts enter engagement?",
    clarity: "On Audit run, open Verdict list (reachable / partial / unreachable); only reachable (sequence-ready) contacts are eligible to enter bound engagement.",
    criteria: {
      when: "Batch finishes.",
      conditions: [
        "Passed = sequence-ready",
        "silenced excluded from automatic motion.",
      ],
    },
    components: {
      ui: [
        "Verdict list",
        "Contacts reachability indicator",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
];

export const OPERATOR_BOOK_READINESS_GRAPH: HowGraph = {
  id: "operator-book-readiness",
  label: "Book readiness",
  epicOrder: 19,
  personaId: "operator",
  outcomeId: "operator-book-readiness",
  nodes,
};
