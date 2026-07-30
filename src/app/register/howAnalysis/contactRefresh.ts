import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Engagement contact, I can answer one consolidated form for outstanding self-reportable facts, and reply when my situation changes.",
    criteria: {
      when: "After consent, when outstanding self-reportable needs exist or life changes.",
      conditions: [
        "One consolidated form (Engine 2)",
        "self-reportable only — never document-dependent fields.",
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
    question: "How do I answer one consolidated form for outstanding self-reportable facts, and reply when my situation changes?",
    clarity: "I open one Nudge form that lists every outstanding self-reportable need, submit answers, and I can reply later when my situation changes.",
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
    question: "How do I open one Nudge form that lists every outstanding self-reportable need and submit answers?",
    clarity: "Starting from the firm-branded Nudge message, open Nudge form; On Nudge form, answer the consolidated self-reportable fields and submit. Document-dependent asks never appear here.",
    criteria: {
      when: "When a nudge motion fires (nothing reactivation-worthy).",
      conditions: [
        "One form consolidates outstanding needs",
        "self-reportable only.",
      ],
    },
    components: {
      ui: [
        "Nudge message",
        "Nudge form",
        "Self-reportable fields",
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
    question: "How do I reply later when my situation changes?",
    clarity: "On a firm-branded channel thread (or a Change update link), reply or open Update facts and submit what changed.",
    criteria: {
      when: "Life change after prior collection.",
      conditions: [
        "Contact still not silenced",
        "update path firm-branded.",
      ],
    },
    components: {
      ui: [
        "Channel thread / Update facts",
        "Update fields",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
];

export const CONTACT_REFRESH_GRAPH: HowGraph = {
  id: "contact-refresh",
  label: "Refresh facts",
  epicOrder: 5,
  personaId: "engagement_contact",
  outcomeId: "contact-refresh",
  nodes,
};
