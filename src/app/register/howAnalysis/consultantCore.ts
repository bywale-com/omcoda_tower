import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Consultant, I can hand my private book to Tower and authorize it to work under my license, and get eligible clients booked onto my calendar — without setting up, configuring, or running any of the engagement myself — so that an eligible contact arrives at a booked meeting already re-engaged and current.",
    criteria: {
      when: "After the firm has been acquired and while the consultant is activating or already running.",
      conditions: ["Book can be handed over", "license authorization possible", "meetings can land without consultant-authored engagement."],
    },
    components: {},
    position: { x: 80, y: 0 },
  },
{
    id: "depth-1",
    parentId: "outcome",
    kind: "answer",
    depth: 1,
    question: "How do I hand my private book to Tower and authorize it to work under my license, and get eligible clients booked onto my calendar without setting up, configuring, or running any of the engagement myself?",
    clarity: "On Prepared Workspace I complete Authorize book + Accept terms; afterward Meetings receives booked rows with Live brief — without me opening Configuration libraries or Hub Automations / Agents.",
    criteria: {
      conditions: [],
    },
    components: {},
    position: { x: 80, y: 130 },
  },
{
    id: "depth-2a",
    parentId: "depth-1",
    kind: "answer",
    depth: 2,
    question: "How do I hand over my private book and authorize Tower to work under my license?",
    clarity: "On Prepared Workspace, complete Authorize book (database grant or confirm import) and Accept terms (license + escrow). Those two commits are the hard inputs Activation state / Commercial read.",
    criteria: {
      conditions: [],
    },
    components: {},
    position: { x: 80, y: 260 },
  },
{
    id: "leaf-2a.1",
    parentId: "depth-2a",
    kind: "leaf",
    depth: 3,
    question: "How do I connect my contact book?",
    clarity: "Starting from Prepared Workspace, click **Authorize book**. On Authorize book modal, click Connect CRM / grant database access (or Upload / confirm assisted import), then click **Authorize** (primary button). That commit writes book-handover state read by Book readiness Audits and Activation state Progress (authorize-book row). When the assisted path already holds the list: Starting from Contacts, click **Imports**, click the imported batch row, and click **Confirm book for Tower** so the same handover state is set — without authoring sequences.",
    criteria: {
      when: "During activation (ALG) or after assisted provision when the book must be confirmed.",
      conditions: ["Prepared Workspace is staged", "Authorize book is available", "or Contacts already holds the assisted import."],
    },
    components: {
      ui: ["Prepared Workspace", "Authorize book", "Authorize", "Contacts", "Imports"],
    },
    isLeaf: true,
    position: { x: 80, y: 390 },
  },
{
    id: "leaf-2a.2",
    parentId: "depth-2a",
    kind: "leaf",
    depth: 3,
    question: "How do I accept that outreach runs under my license and escrow?",
    clarity: "On Prepared Workspace, click **Accept terms**. On Accept terms modal, click **License acknowledgement** to expand it, select the authorizing licensee from the identity dropdown (or confirm the named licensee), view Escrow terms panel rows, check the acknowledgment checkbox, then click **Accept** (primary button). That commit writes license+escrow acceptance read by Commercial (instrument held) and Activation state Progress (escrow-held / running gates). Not a settings screen I maintain later.",
    criteria: {
      when: "At the activation hard-input step, after readiness is legible.",
      conditions: ["Escrow terms presented", "license acknowledgement explicit", "consultant completes Accept terms."],
    },
    components: {
      ui: ["Prepared Workspace", "Accept terms", "License acknowledgement", "Escrow terms", "Accept"],
    },
    isLeaf: true,
    position: { x: 320, y: 390 },
  },
{
    id: "depth-2b",
    parentId: "depth-1",
    kind: "answer",
    depth: 2,
    question: "How do eligible clients appear booked on my calendar without me setting up, configuring, or running engagement?",
    clarity: "Bound packs (operator Firm operations bind) keep the book worked; I only receive Meeting rows and open Live brief — Board shows Phase signal chips as inhabit, never pack editors.",
    criteria: {
      conditions: [],
    },
    components: {},
    position: { x: 320, y: 260 },
  },
{
    id: "leaf-2b.1",
    parentId: "depth-2b",
    kind: "leaf",
    depth: 3,
    question: "How do house-authored packs bound to my firm keep the book worked?",
    clarity: "They don't live in my workspace. On the operator desk, Firm operations bind already has packs picked from Bind packs dropdowns and set Armed / Active — engagement and eligibility proceed from those published versions without me authoring them. On Board I only click Client rows and view Phase signal chips (inhabit result). I never open Configuration libraries or Hub Automations / Agents to produce motion.",
    criteria: {
      when: "Continuously after the firm is running.",
      conditions: ["Firm operations bind has active packs", "Configuration libraries authored upstream", "consultant is not editing Hub Automations / Agents to produce motion."],
    },
    components: {
      ui: ["Firm operations bind", "Configuration libraries", "Board", "Client row / Phase signal"],
    },
    isLeaf: true,
    position: { x: 560, y: 390 },
  },
{
    id: "leaf-2b.2",
    parentId: "depth-2b",
    kind: "leaf",
    depth: 3,
    question: "How do I receive booked meetings on Meetings and open each with a live brief?",
    clarity: "Starting from Meetings, click a booked Meeting row to open Meeting. On Meeting, click **Live brief** panel to view current fact rows and evaluative signal chips before I join. On Board, the same Client row shows a ready-for-meeting Phase signal chip without me having enrolled a sequence. Booking was written by contact Booking confirm (bound packs) — consultant only receives.",
    criteria: {
      when: "When an eligible contact books.",
      conditions: ["Meeting invitation was sent by bound engagement packs", "Live brief re-computes on write-back", "consultant did not manually enroll the sequence."],
    },
    components: {
      ui: ["Meetings", "Meeting row", "Live brief", "Board", "Client Brief"],
    },
    isLeaf: true,
    position: { x: 800, y: 390 },
  },
{
    id: "leaf-2b.3",
    parentId: "depth-2b",
    kind: "leaf",
    depth: 3,
    question: "How do I never set up Automations, Agents, or engagement templates?",
    clarity: "Firm primary nav exposes Board, Meetings, Contacts, Client workspace — not Configuration libraries, Bind packs, or pack editors. Starting from Board or Meetings I only click Client / Meeting rows and click **Live brief** / **Halt outreach**. Pack authorship stays on the operator desk (Configuration libraries → Publish version; Firm operations bind → Bind). Today's Hub Automations / Hub Agents inside the firm shell is **existing-wrong-seat** revision debt — not this outcome's path.",
    criteria: {
      when: "Always under ALG application.",
      conditions: ["Consultant nav does not expose pack authorship as a required job", "operator bind is what arms the firm."],
    },
    components: {
      ui: ["Board", "Meetings", "Configuration libraries", "Hub Automations / Hub Agents"],
    },
    isLeaf: true,
    position: { x: 1040, y: 390 },
  },

];

export const CONSULTANT_CORE_GRAPH: HowGraph = {
  id: "consultant-core",
  label: "Core",
  epicOrder: 1,
  personaId: "consultant",
  outcomeId: "consultant-core",
  nodes,
};
