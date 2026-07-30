import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can author and version the evaluation packs, automation workflows, and engagement templates that run the product — so that a firm's operations can be bound from house-authored packs rather than built per firm.",
    criteria: {
      when: "Continuously as methodology and rules evolve.",
      conditions: [
        "House authors",
        "firms do not",
        "open-box without code deploy for ops tweaks.",
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
    question: "How do I author and version the evaluation packs, automation workflows, and engagement templates that run the product?",
    clarity: "Starting from Configuration libraries, I author Evaluation packs, Automation workflows, and Engagement templates as versioned libraries firms will bind — not build per firm.",
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
    question: "How do I author Evaluation packs?",
    clarity: "Starting from Configuration libraries, open Evaluation packs; On Evaluation pack editor, define open-box rules / analysis against Reference data and publish a pack version.",
    criteria: {
      when: "Rules or analysis read-outs must change.",
      conditions: [
        "Inspectable and changeable without code deploy",
        "consumes published reference tables.",
      ],
    },
    components: {
      ui: [
        "Configuration libraries",
        "Evaluation packs",
        "Evaluation pack editor",
        "Reference data",
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
    question: "How do I author Automation workflows?",
    clarity: "Starting from Configuration libraries, open Automation workflows; On Workflow canvas, author trigger → conditions/rules → actions (including enroll into an engagement template) and publish.",
    criteria: {
      when: "Enrollment / eligibility motion graph must change.",
      conditions: [
        "Graph shape holds across verticals",
        "packs swap underneath.",
      ],
    },
    components: {
      ui: [
        "Automation workflows",
        "Workflow canvas",
        "Trigger / Rule / Action nodes",
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
    question: "How do I author Engagement templates?",
    clarity: "Starting from Configuration libraries, open Engagement templates; On Template / Agent editor, author ordered channel + copy steps (opt-in, nudge, reactivation composites) and publish for bind.",
    criteria: {
      when: "Sequence methodology changes.",
      conditions: [
        "Authorship upstream of engagement record",
        "firm does not author.",
      ],
    },
    components: {
      ui: [
        "Engagement templates",
        "Agent / sequence editor",
        "Step rail / Sequence canvas",
      ],
    },
    isLeaf: true,
    position: { x: 560, y: 260 },
  },
];

export const OPERATOR_CONFIGURATION_LIBRARIES_GRAPH: HowGraph = {
  id: "operator-configuration-libraries",
  label: "Configuration libraries",
  epicOrder: 11,
  personaId: "operator",
  outcomeId: "operator-configuration-libraries",
  nodes,
};
