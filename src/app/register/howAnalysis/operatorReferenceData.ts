import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can keep the immigration reference tables versioned and current as data, without a code deploy — so that house-authored evaluation packs score eligibility on today's rules.",
    criteria: {
      when: "When law / public-reference criteria move.",
      conditions: [
        "Versioned as data inside operator layer",
        "no code deploy required.",
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
    question: "How do I keep the immigration reference tables versioned and current as data, without a code deploy?",
    clarity: "Starting from Reference data, open a Reference table, edit or import the current criteria, and publish a new version that evaluation packs consume.",
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
    question: "How do I open a Reference table and edit or import the current criteria?",
    clarity: "Starting from Reference data, open Reference tables; On a table (categories, trades, cutoffs, provincial identifiers), edit rows or run Import criteria.",
    criteria: {
      when: "Criteria change known.",
      conditions: [
        "Tables are data, not hard-coded deploys.",
      ],
    },
    components: {
      ui: [
        "Reference data",
        "Reference tables",
        "Import criteria",
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
    question: "How do I publish a new version that evaluation packs consume?",
    clarity: "On Reference table, open Publish version; published version becomes what Configuration libraries evaluation packs score against.",
    criteria: {
      when: "Edits ready to go live.",
      conditions: [
        "Version retained",
        "packs read current published version.",
      ],
    },
    components: {
      ui: [
        "Publish version",
        "Configuration libraries",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
];

export const OPERATOR_REFERENCE_DATA_GRAPH: HowGraph = {
  id: "operator-reference-data",
  label: "Reference data",
  epicOrder: 10,
  personaId: "operator",
  outcomeId: "operator-reference-data",
  nodes,
};
