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
      conditions: ["One consolidated form (Engine 2)", "self-reportable only — never document-dependent fields."],
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
    clarity: "Starting from the firm-branded Nudge message, click the form link to open **Nudge form**, type/select each outstanding self-reportable field, and click **Submit**; later, reply in a firm-branded thread or click **Update facts** / Change update link to edit changed fields and click **Submit** again.",
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
    clarity: "Starting from the firm-branded Nudge message, click the form link to open **Nudge form**. On Nudge form, type/select each outstanding self-reportable field (text, dropdown, checkbox, or date as shown) and click **Submit** (primary button). Submit writes fact updates read by re-evaluate / Analysis and later Live brief. Document-dependent asks never appear as fields here.",
    criteria: {
      when: "When a nudge motion fires (nothing reactivation-worthy).",
      conditions: ["One form consolidates outstanding needs", "self-reportable only."],
    },
    components: {
      ui: ["Nudge message", "Nudge form", "Self-reportable fields", "Submit"],
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
    clarity: "On a firm-branded channel thread, reply in the message field and send; or click **Update facts** / Change update link to open Update facts, edit the changed self-reportable fields, and click **Submit**. That write is read by re-evaluate the same way as Nudge form. Silenced contacts do not get new automatic asks.",
    criteria: {
      when: "Life change after prior collection.",
      conditions: ["Contact still not silenced", "update path firm-branded."],
    },
    components: {
      ui: ["Channel thread", "Update facts / Change update link", "Update fields", "Submit"],
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
