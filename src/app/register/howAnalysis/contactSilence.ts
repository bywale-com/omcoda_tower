import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Engagement contact, I can silence or opt out at any point.",
    criteria: {
      when: "Any point in the journey.",
      conditions: [
        "Opt-out / silence stops automatic outreach.",
      ],
    },
    components: {},
    position: { x: 80, y: 0 },
  },
  {
    id: "depth-1",
    parentId: "outcome",
    kind: "leaf",
    depth: 1,
    question: "How do I silence or opt out at any point?",
    clarity: "On any firm-branded touchpoint (or Consent request), choose Silence / Opt out. Further automatic outreach stops.",
    criteria: {
      when: "Anytime a touchpoint is reachable.",
      conditions: [
        "Silenced state recorded",
        "bound sequences honor it.",
      ],
    },
    components: {
      ui: [
        "Silence / Opt out control",
        "Touchpoint footer",
      ],
    },
    isLeaf: true,
    position: { x: 80, y: 130 },
  },
];

export const CONTACT_SILENCE_GRAPH: HowGraph = {
  id: "contact-silence",
  label: "Silence",
  epicOrder: 6,
  personaId: "engagement_contact",
  outcomeId: "contact-silence",
  nodes,
};
