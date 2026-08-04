import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity: "As Consultant, I can keep everything running under my license and halt anything I won't stand behind — so that the book is worked lawfully in my name.",
    criteria: {
      when: "Whenever outreach could fire under the firm identity.",
      conditions: ["License posture is active", "consultant can refuse illegal or unethical outreach (World hard gate)."],
    },
    components: {},
    position: { x: 80, y: 0 },
  },
{
    id: "depth-1",
    parentId: "outcome",
    kind: "answer",
    depth: 1,
    question: "How do I keep everything running under my license and halt anything I won't stand behind?",
    clarity: "On Board I read Phase signal / Engagement record chronology; when I refuse, Halt outreach commits a silence that runners honor — without opening Configuration libraries.",
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
    question: "How do I see what is armed or active under my name?",
    clarity: "Starting from Board, view Client rows with Phase signal chips for what is in motion. Click a Client row to open Client workspace; click **Engagement record** (Activity) panel and view chronology rows of what already fired — record only, not authorship. Armed / Active pack state is authored on Firm operations bind (operator); Board only shows the inhabited result.",
    criteria: {
      when: "Anytime after running.",
      conditions: ["Engagement record is a record, not a decision brain", "packs remain operator-authored."],
    },
    components: {
      ui: ["Board", "Client row / Phase signal", "Client workspace", "Engagement record (Activity)"],
    },
    isLeaf: true,
    position: { x: 80, y: 260 },
  },
{
    id: "leaf-1.2",
    parentId: "depth-1",
    kind: "leaf",
    depth: 2,
    question: "How do I halt any outreach I won't stand behind?",
    clarity: "On Board or Client workspace, click **Halt outreach**. On Halt outreach modal, click **This contact** or **Firm book** on the scope segmented control, optionally type a reason, then click **Confirm halt** (primary button). That commit writes halt/silence state read by engagement runners and Firm operations bind Send gates — further automatic firm→client sends stop. Halt is refusal under my license — not editing a house template in Configuration libraries.",
    criteria: {
      when: "When the consultant refuses illegal or unethical outreach (hard human gate).",
      conditions: ["Halt is available without opening Configuration libraries", "bound packs respect silence/halt."],
    },
    components: {
      ui: ["Board", "Client workspace", "Halt outreach", "Confirm halt"],
    },
    isLeaf: true,
    position: { x: 320, y: 260 },
  },

];

export const CONSULTANT_GOVERNANCE_GRAPH: HowGraph = {
  id: "consultant-governance",
  label: "Governance",
  epicOrder: 2,
  personaId: "consultant",
  outcomeId: "consultant-governance",
  nodes,
};
