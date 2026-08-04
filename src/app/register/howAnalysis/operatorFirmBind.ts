import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can bind house-authored evaluation, automation, and campaign packs under a firm's identity — so that the Consultant's book is worked without the firm authoring anything.",
    criteria: {
      when: "Firm reaching or already running.",
      conditions: ["Packs exist as **published** versions in Configuration libraries", "bind is per-tenancy identity."],
    },
    components: {},
    position: { x: 80, y: 0 },
  },
{
    id: "depth-1",
    parentId: "outcome",
    kind: "answer",
    depth: 1,
    question: "How do I bind house-authored evaluation, automation, and campaign packs under a firm's identity?",
    clarity: "Starting from Firm operations bind, I select a firm row in the firm-bind index, open Bind packs, choose three published pack versions from dropdowns, click Bind, then set Armed / Active — so the book is worked without firm authorship.",
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
    question: "How do I choose packs from Configuration libraries and bind them under this firm identity?",
    clarity: "Starting from Firm operations bind, click a firm row in the **firm-bind index** (left list). On that firm’s detail, click **Bind packs** (opens Bind packs modal). On Bind packs modal: 1. **Evaluation pack** — select one **published** Evaluation pack version from the dropdown (drafts omitted). 2. **Automation pack** — select one **published** Automation workflow version from the dropdown. 3. **Engagement template** — select one **published** Engagement template version from the dropdown. 4. Click **Bind** (primary button). Modal closes; the firm detail shows three bound-version chips (label + version id) sourced from Configuration libraries. Audit trail appends a Change event: firm id, three version ids, actor, timestamp.",
    criteria: {
      when: "Activating or changing what runs for a tenancy.",
      conditions: ["Dropdowns show published-only", "Bind disabled until all three slots have a selection", "no inline pack editor inside Bind packs."],
    },
    components: {
      ui: ["Firm operations bind", "Firm-bind index", "Bind packs", "Evaluation pack version", "Automation pack version", "Engagement template version", "Bind", "Bound-version chips", "Configuration libraries"],
    },
    isLeaf: true,
    position: { x: 80, y: 260 },
  },
{
    id: "leaf-1.2",
    parentId: "depth-1",
    kind: "leaf",
    depth: 2,
    question: "How do I arm so the book is worked without firm authorship?",
    clarity: "On Firm operations bind firm detail (selected firm), click **Armed** or **Active** on the **Armed / Active** segmented control — **Armed** = bound packs ready (no contact-facing sends); **Active** = execution on. Control is disabled until Bind packs has three bound versions. Consultant Board for that firm shows inhabited motion only — no pack editor on the firm desk.",
    criteria: {
      when: "After bind, when campaign should run.",
      conditions: ["Armed = ready", "Active = executing", "consultant does not author."],
    },
    components: {
      ui: ["Armed / Active", "Board"],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },

];

export const OPERATOR_FIRM_BIND_GRAPH: HowGraph = {
  id: "operator-firm-bind",
  label: "Firm operations bind",
  epicOrder: 18,
  personaId: "operator",
  outcomeId: "operator-firm-bind",
  nodes,
};
