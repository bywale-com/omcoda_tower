import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Operator, I can stage a no-login prepared workspace for a captured firm from house templates and public facts, walk the firm through readiness, and secure its database authorization and escrow — so that the Consultant reaches a running desk.",
    criteria: {
      when: "After seed inputs land (ALG) for a captured firm.",
      conditions: ["House templates + public facts suffice for readiness proof", "hard inputs still earned."],
    },
    components: {},
    position: { x: 80, y: 0 },
  },
{
    id: "depth-1",
    parentId: "outcome",
    kind: "answer",
    depth: 1,
    question: "How do I stage a no-login prepared workspace for a captured firm from house templates and public facts, walk the firm through readiness, and secure its database authorization and escrow?",
    clarity: "Starting from Activation & forward-deploy, click **In-flight activations**; on a captured firm row, click **Forward-deploy**, select a published Engagement template version, type public firm-facts and brand package fields, click **Hydrate**, then click **Readiness walkthrough** on Prepared Workspace; view Authorize book and Accept terms completion chips on Activation state **Progress** before the firm is running.",
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
    question: "How do I forward-deploy a Prepared Workspace from house templates and public facts?",
    clarity: "Starting from Activation & forward-deploy, click **In-flight activations**. On a captured firm row, click **Forward-deploy**. On the forward-deploy form, select a published Engagement template version from the **Template version** dropdown, type public firm-facts and brand package fields, then click **Hydrate** (primary button). Hydrate writes staged Prepared Workspace state read by Prepared Workspace and Activation state Progress (forward-deployed row). Backend enriches/scrapes public facts autonomously after Hydrate — no Meta/ESP affordances in Tower; view staging status chips on In-flight activations if shown. No client PII required yet.",
    criteria: {
      when: "Seed inputs landed.",
      conditions: ["Templates available", "public facts readable", "no-login artifact staged."],
    },
    components: {
      ui: ["Activation & forward-deploy", "In-flight activations", "Forward-deploy", "Template version", "Public firm-facts / brand fields", "Hydrate", "Staging status chips", "Prepared Workspace", "Configuration libraries"],
    },
    isLeaf: true,
    position: { x: 80, y: 260 },
  },
{
    id: "leaf-1.2",
    parentId: "depth-1",
    kind: "leaf",
    depth: 2,
    question: "How do I walk readiness with the firm?",
    clarity: "On Prepared Workspace, click **Readiness walkthrough**. Step through template preview, public facts, brand state, and next-step chips (Next / Back); chips are view/progress chrome unless a step commits a staged fact. Agent presentation presents and routes only — fulfillment stays separate while the consultant sees the staged campaign under their identity before Authorize book / Accept terms.",
    criteria: {
      when: "Prepared Workspace is staged.",
      conditions: ["Readiness proof, not value proof", "no-login still."],
    },
    components: {
      ui: ["Prepared Workspace", "Readiness walkthrough", "Next-step chips"],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
{
    id: "leaf-1.3",
    parentId: "depth-1",
    kind: "leaf",
    depth: 2,
    question: "How do I secure database authorization plus escrow acceptance?",
    clarity: "On Prepared Workspace, view Authorize book and Accept terms completion chips (green only after consultant primary-button commits). Operator does not fake-complete those chips. On Activation state, click **Progress** and view authorize-book / escrow-held / running checklist rows; on a stalled row, click **Jump to** the blocking module. Running opens only when both hard-input rows are green — Commercial holds the escrow terms the consultant accepted.",
    criteria: {
      when: "After readiness is legible.",
      conditions: ["Both hard inputs required", "Commercial holds escrow terms."],
    },
    components: {
      ui: ["Prepared Workspace", "Authorize book / Accept terms", "Activation state", "Progress", "Commercial"],
    },
    isLeaf: true,
    position: { x: 560, y: 260 },
  },

];

export const OPERATOR_ACTIVATION_GRAPH: HowGraph = {
  id: "operator-activation",
  label: "Activation & forward-deploy",
  epicOrder: 9,
  personaId: "operator",
  outcomeId: "operator-activation",
  nodes,
};
