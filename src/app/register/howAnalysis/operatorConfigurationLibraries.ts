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
      conditions: ["House authors", "firms do not", "open-box without code deploy for ops tweaks."],
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
    clarity: "Starting from Configuration libraries, click **Evaluation packs**, **Automation workflows**, or **Engagement templates** in the Libraries nav (left list). On the chosen catalog, click a row (or **New**), edit in the editor/canvas, then click **Publish version** (primary button) — so firms can later pick that version in Firm operations bind dropdowns. No firm picker exists on this module.",
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
    clarity: "Starting from Configuration libraries, click **Evaluation packs** in the Libraries nav (left list). On Evaluation packs catalog, click a pack row (or **New pack**). On Evaluation pack editor, edit open-box rules / analysis against Reference data. Click **Publish version** (primary button). Catalog row shows status **Published** + version id; that version becomes selectable in Firm operations bind → Bind packs → Evaluation pack dropdown. Drafts stay **Draft** and do not appear in Bind dropdowns.",
    criteria: {
      when: "Rules or analysis read-outs must change.",
      conditions: ["Inspectable and changeable without code deploy", "consumes published reference tables", "no tenancy picker on this module."],
    },
    components: {
      ui: ["Configuration libraries", "Evaluation packs", "Evaluation pack editor", "Publish version", "Published / Draft status", "Reference data"],
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
    clarity: "Starting from Configuration libraries, click **Automation workflows** in the Libraries nav. On Automation workflows catalog, click a workflow row (or **New workflow**). On Workflow canvas, edit trigger → conditions/rules → actions (including enroll into an engagement template). Click **Publish version** (primary button). Catalog shows **Published** + version id; that version appears in Firm operations bind → Bind packs → Automation pack dropdown (published-only).",
    criteria: {
      when: "Enrollment / eligibility motion graph must change.",
      conditions: ["Graph shape holds across verticals", "packs swap underneath", "no firm bind from this screen."],
    },
    components: {
      ui: ["Automation workflows", "Workflow canvas", "Publish version", "Trigger / Rule / Action nodes"],
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
    clarity: "Starting from Configuration libraries, click **Engagement templates** in the Libraries nav. On Engagement templates catalog, click a template row (or **New template**). On Agent / sequence editor, edit ordered channel + copy steps (opt-in, nudge, reactivation composites). Click **Publish version** (primary button). Catalog shows **Published** + version id; that version appears in Firm operations bind → Bind packs → Engagement template dropdown (published-only).",
    criteria: {
      when: "Sequence methodology changes.",
      conditions: ["Authorship upstream of engagement record", "firm does not author", "no firm bind from this screen."],
    },
    components: {
      ui: ["Engagement templates", "Agent / sequence editor", "Publish version", "Step rail / Sequence canvas"],
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
