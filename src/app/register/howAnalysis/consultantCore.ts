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
      conditions: [
        "Book can be handed over",
        "license authorization possible",
        "meetings can land without consultant-authored engagement.",
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
    question: "How do I hand my private book to Tower and authorize it to work under my license, and get eligible clients booked onto my calendar without setting up, configuring, or running any of the engagement myself?",
    clarity: "I hand over my private book and authorize Tower to work under my license; then eligible clients appear booked on my calendar without me setting up, configuring, or running engagement.",
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
    clarity: "On the prepared activation path I connect my contact book and accept that outreach runs under my license and escrow; once those hard inputs land, the book is handed over.",
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
    clarity: "Starting from Prepared Workspace, open Authorize book and grant database access (or the equivalent that makes the campaign real). When the assisted path already holds the list, Starting from Contacts I confirm the imported book is the one Tower will work.",
    criteria: {
      when: "During activation (ALG) or after assisted provision when the book must be confirmed.",
      conditions: [
        "Prepared Workspace is staged",
        "Authorize book is available",
        "or Contacts already holds the assisted import.",
      ],
    },
    components: {
      ui: [
        "Prepared Workspace",
        "Authorize book",
        "Contacts",
        "Imports",
      ],
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
    clarity: "On Prepared Workspace, open Accept terms and confirm outreach under my license plus escrow / contingent cost. That acceptance is the money-and-license door — not a settings screen I maintain later.",
    criteria: {
      when: "At the activation hard-input step, after readiness is legible.",
      conditions: [
        "Escrow terms presented",
        "license acknowledgement explicit",
        "consultant completes Accept terms.",
      ],
    },
    components: {
      ui: [
        "Prepared Workspace",
        "Accept terms",
        "License acknowledgement",
        "Escrow terms",
      ],
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
    clarity: "Once authorized, house-authored packs bound to my firm keep the book worked; I receive booked meetings on Meetings and open each with a live brief — I never set up Automations, Agents, or engagement templates to make that happen.",
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
    clarity: "They don't live in my workspace. On Firm operations bind (operator), packs from Configuration libraries are already bound under my firm identity; engagement and eligibility run from those packs without me authoring them. On Board I only see the inhabited result — clients progressing — not the authorship.",
    criteria: {
      when: "Continuously after the firm is running.",
      conditions: [
        "Firm operations bind has active packs",
        "Configuration libraries authored upstream",
        "consultant is not editing Hub Automations / Agents to produce motion.",
      ],
    },
    components: {
      ui: [
        "Firm operations bind",
        "Configuration libraries",
        "Board",
        "Client row / Phase signal",
      ],
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
    clarity: "Starting from Meetings, open a booked Meeting row; On Meeting, open Live brief to see current facts before I join. On Board, the same client shows ready-for-meeting without me having sequenced them.",
    criteria: {
      when: "When an eligible contact books.",
      conditions: [
        "Meeting invitation was sent by bound engagement packs",
        "Live brief re-computes on write-back",
        "consultant did not manually enroll the sequence.",
      ],
    },
    components: {
      ui: [
        "Meetings",
        "Meeting row",
        "Live brief",
        "Board",
        "Client Brief",
      ],
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
    clarity: "My firm workspace has no authorship entry for those. Starting from Board or Meetings I work clients and briefs only; Configuration libraries and Firm operations bind stay on the operator desk. (Today's Hub list inside the firm shell is the wrong seat — treat as revision debt, not as my outcome.)",
    criteria: {
      when: "Always under ALG application.",
      conditions: [
        "Consultant nav does not expose pack authorship as a required job",
        "operator bind is what arms the firm.",
      ],
    },
    components: {
      ui: [
        "Board",
        "Meetings",
        "Configuration libraries",
        "Hub Automations / Hub Agents",
      ],
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
