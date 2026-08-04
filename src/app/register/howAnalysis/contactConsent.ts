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
      conditions: ["Firm-branded", "before deeper collection", "agree or ignore both valid."],
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
    clarity: "Starting from the firm-branded Opt-in message, click the consent link / **Review request** control to open Consent request, then click **Agree** or **Ignore** before any Nudge / deeper form.",
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
    clarity: "Starting from the firm-branded Opt-in message (email/SMS as bound under firm identity), click the consent link / **Review request** control to open Consent request. Branding chrome is the firm's — not Om Coda's. Reachability was gated upstream by Book readiness; silenced contacts do not receive this send.",
    criteria: {
      when: "When opt-in launch fires for a sequence-ready contact.",
      conditions: ["Reachability gate passed", "contact not silenced", "pack bound under firm identity."],
    },
    components: {
      ui: ["Opt-in message", "Consent link / Review request", "Consent request"],
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
    clarity: "On Consent request, click **Agree** (primary button) or **Ignore** / dismiss. Agree writes consented state that unlocks later Nudge form / deeper collection (read by bound engagement runners). Ignore writes unconsented / no-deeper state — deeper collection forms do not open. Either choice is valid; neither opens Configuration libraries.",
    criteria: {
      when: "Consent request is open.",
      conditions: ["Ignore leaves contact silenced-from-deeper or unconsented per policy", "Agree unlocks later nudges."],
    },
    components: {
      ui: ["Consent request", "Agree", "Ignore / dismiss"],
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
