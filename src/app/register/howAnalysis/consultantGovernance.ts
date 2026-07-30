import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Consultant, I can keep everything running under my license and halt anything I won't stand behind — so that the book is worked lawfully in my name.",
    criteria: {
      when: "Whenever outreach could fire under the firm identity.",
      conditions: [
        "License posture is active",
        "consultant can refuse illegal or unethical outreach (World hard gate).",
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
    question: "How do I keep everything running under my license and halt anything I won't stand behind?",
    clarity: "I see what is armed or active under my name, and I halt any outreach I won't stand behind without having to reconfigure the house packs.",
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
    question: "How do I see what is armed or active under my name?",
    clarity: "Starting from Board, scan Client rows and Phase signals for what is in motion. On a Client, open Engagement record to examine what already fired — chronology only, not authorship.",
    criteria: {
      when: "Anytime after running.",
      conditions: [
        "Engagement record is a record, not a decision brain",
        "packs remain operator-authored.",
      ],
    },
    components: {
      ui: [
        "Board",
        "Client row / Phase signal",
        "Engagement record (Activity)",
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
    question: "How do I halt any outreach I won't stand behind?",
    clarity: "On Board (or on Client), open Halt outreach and stop further automatic motion for that contact or for the firm book I won't stand behind. Halt is refusal under my license — not editing the house template.",
    criteria: {
      when: "When the consultant refuses illegal or unethical outreach (hard human gate).",
      conditions: [
        "Halt is available without opening Configuration libraries",
        "bound packs respect silence/halt.",
      ],
    },
    components: {
      ui: [
        "Board",
        "Halt outreach",
        "Client",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
];

export const CONSULTANT_GOVERNANCE_GRAPH: HowGraph = {
  id: "consultant-governance",
  label: "Governance",
  epicOrder: 2,
  personaId: "consultant",
  outcomeId: "consultant-governance",
  nodes,
};
