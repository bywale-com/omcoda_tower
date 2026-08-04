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
      conditions: ["Work email known", "firm tenancy provisioned (ALG or assisted)."],
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
    clarity: "On Login I complete OTP; Board becomes the signed-in landing with Client rows / Phase signals; Meetings shows booked rows I can open with Live brief.",
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
    clarity: "Starting from Login, type work email in the Email field and click **Send code**. On Login verify, type the one-time code in the Code field and click **Verify** (primary button). Session cookie lands; Board becomes the next screen. Typed-but-unverified characters are view-only until Verify.",
    criteria: {
      when: "Not already signed in.",
      conditions: ["Email provisioned to a firm user", "code valid and unexpired."],
    },
    components: {
      ui: ["Login", "Email field", "Send code", "Code field", "Verify"],
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
    clarity: "After Verify succeeds, land on Board (signed-in default). View Client rows with Phase signal chips for the firm book — inhabit only. Click a Client row to open Client workspace; selection is view chrome (nothing downstream reads selectedId). No pack-authorship controls appear on Board.",
    criteria: {
      when: "Immediately after successful sign-in.",
      conditions: ["Session valid", "Board is signed-in landing."],
    },
    components: {
      ui: ["Board", "Client row", "Phase signal", "Client workspace", "Primary navigation"],
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
    clarity: "Starting from Board, click **Meetings** in primary nav (or open Meetings directly). On Meetings, view Meeting rows booked for me; click a Meeting row to open Meeting. On Meeting, click **Live brief** panel to view current fact rows before joining. Booking rows are written by bound engagement (operator packs) — consultant does not enroll sequences here.",
    criteria: {
      when: "When meetings exist or I check for them.",
      conditions: ["Bookings created by bound engagement (requirement)", "consultant is recipient."],
    },
    components: {
      ui: ["Meetings", "Meeting row", "Meeting", "Live brief"],
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
