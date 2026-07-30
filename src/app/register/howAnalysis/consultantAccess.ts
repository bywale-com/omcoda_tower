import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Consultant, I can sign in and land in my firm workspace to see what's being done in my name and take the meetings booked for me.",
    criteria: {
      when: "When a provisioned consultant opens Tower.",
      conditions: [
        "Work email known",
        "firm tenancy provisioned (ALG or assisted).",
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
    question: "How do I sign in and land in my firm workspace to see what's being done in my name and take the meetings booked for me?",
    clarity: "I verify a one-time code on Login, then land on Board to see what's in motion under my name and open Meetings for what's booked.",
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
    question: "How do I verify a one-time code on Login?",
    clarity: "Starting from Login, enter work email, then On Login verify enter the one-time code to open the firm session.",
    criteria: {
      when: "Not already signed in.",
      conditions: [
        "Email provisioned to a firm user",
        "code valid and unexpired.",
      ],
    },
    components: {
      ui: [
        "Login",
        "Email field / Send code",
        "Verify code",
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
    question: "How do I land on Board to see what's in motion under my name?",
    clarity: "After verify succeeds, Starting from Board I see Client rows and Phase signals for the firm book — inhabit only.",
    criteria: {
      when: "Immediately after successful sign-in.",
      conditions: [
        "Session valid",
        "Board is signed-in landing.",
      ],
    },
    components: {
      ui: [
        "Board",
        "Clients section / Client row",
        "Primary navigation",
      ],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },
  {
    id: "leaf-1.3",
    parentId: "depth-1",
    kind: "leaf",
    depth: 2,
    question: "How do I open Meetings for what's booked?",
    clarity: "Starting from Meetings, scan Meeting rows booked for me and open one to take it with Live brief.",
    criteria: {
      when: "When meetings exist or I check for them.",
      conditions: [
        "Bookings created by bound engagement (requirement)",
        "consultant is recipient.",
      ],
    },
    components: {
      ui: [
        "Meetings",
        "Meeting row",
        "Live brief",
      ],
    },
    isLeaf: true,
    position: { x: 560, y: 260 },
  },
];

export const CONSULTANT_ACCESS_GRAPH: HowGraph = {
  id: "consultant-access",
  label: "Access",
  epicOrder: 3,
  personaId: "consultant",
  outcomeId: "consultant-access",
  nodes,
};
