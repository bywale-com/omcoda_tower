import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can run the firm-acquisition Approach (feed → ad → capture, inside the click budget) and read who understood-but-didn't-tap versus didn't-understand — so that a captured firm can be staged for activation.",
    criteria: {
      when: "Continuously while ALG is the growth door.",
      conditions: [
        "Click budget held",
        "seed inputs only (name + website + channel).",
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
    question: "How do I run the firm-acquisition Approach (feed → ad → capture, inside the click budget) and read who understood-but-didn't-tap versus didn't-understand?",
    clarity: "I run Approach supply from feed through ad to capture inside the click budget, and I read Approach instrumentation for understood-but-didn't-tap versus didn't-understand.",
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
    question: "How do I run Approach supply from feed through ad to capture inside the click budget?",
    clarity: "Starting from Acquisition & ads, open Approach campaigns; On Approach campaign, set feed creative, ad, and Capture strip so seed inputs land in one tap — no database or payment inside the click budget.",
    criteria: {
      when: "Operating ALG acquisition.",
      conditions: [
        "Capture limited to name + website + phone/email",
        "continue-scroll allowed.",
      ],
    },
    components: {
      ui: [
        "Acquisition & ads",
        "Approach campaigns",
        "Capture strip",
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
    question: "How do I read Approach instrumentation for understood-but-didn't-tap versus didn't-understand?",
    clarity: "On Acquisition & ads, open Approach instrumentation and read don't-understand versus understand-don't-tap (and continue-scroll) counts.",
    criteria: {
      when: "After impressions / taps accumulate.",
      conditions: [
        "Instrumentation distinguishes the two disbelief modes.",
      ],
    },
    components: {
      ui: [
        "Acquisition & ads",
        "Approach instrumentation",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
];

export const OPERATOR_ACQUISITION_GRAPH: HowGraph = {
  id: "operator-acquisition",
  label: "Acquisition & ads",
  epicOrder: 8,
  personaId: "operator",
  outcomeId: "operator-acquisition",
  nodes,
};
