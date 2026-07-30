import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Engagement contact, I can receive a firm-branded consent request and agree or ignore before any deeper collection.",
    criteria: {
      when: "First firm→client engagement after the contact is sequence-ready.",
      conditions: [
        "Firm-branded",
        "before deeper collection",
        "agree or ignore both valid.",
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
    question: "How do I receive a firm-branded consent request and agree or ignore before any deeper collection?",
    clarity: "I get a firm-branded opt-in touchpoint on a channel I can reach, then I agree or ignore before any deeper form.",
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
    question: "How do I get a firm-branded opt-in touchpoint on a channel I can reach?",
    clarity: "Starting from the firm-branded Opt-in message (email/SMS as bound), I open the Consent request. Branding is the firm's — not Om Coda's.",
    criteria: {
      when: "When opt-in launch fires for a sequence-ready contact.",
      conditions: [
        "Reachability gate passed",
        "contact not silenced",
        "pack bound under firm identity.",
      ],
    },
    components: {
      ui: [
        "Opt-in message",
        "Consent request",
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
    question: "How do I agree or ignore before any deeper form?",
    clarity: "On Consent request, choose Agree or Ignore (dismiss / no action). Deeper collection forms do not open until Agree.",
    criteria: {
      when: "Consent request is open.",
      conditions: [
        "Ignore leaves contact silenced-from-deeper or unconsented per policy",
        "Agree unlocks later nudges.",
      ],
    },
    components: {
      ui: [
        "Consent request",
        "Agree control",
        "Ignore / dismiss",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
];

export const CONTACT_CONSENT_GRAPH: HowGraph = {
  id: "contact-consent",
  label: "Consent",
  epicOrder: 4,
  personaId: "engagement_contact",
  outcomeId: "contact-consent",
  nodes,
};
