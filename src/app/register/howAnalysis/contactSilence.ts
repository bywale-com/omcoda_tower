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
      conditions: ["Opt-out / silence stops automatic outreach."],
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
    clarity: "On any firm-branded touchpoint footer (Opt-in, Nudge, Meeting invitation) or on Consent request, click **Silence** / **Opt out** (or use List-Unsubscribe / one-click where the channel provides it). Confirm if prompted. That commit writes silenced state read by engagement runners, Send gates, and Book readiness (not sequence-ready for new automatic motion). Further automatic firm→client outreach stops; Consultant Halt must honor the same state.",
    criteria: {
      when: "Anytime a touchpoint is reachable.",
      conditions: ["Silenced state recorded", "bound sequences honor it."],
    },
    components: {
      ui: ["Touchpoint footer", "Silence / Opt out", "Consent request", "List-Unsubscribe / one-click"],
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
