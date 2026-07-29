import type { HowGraph, HowNode } from "./types";

const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity:
      "Tower automatically detects eligible candidates and initiates a campaign to get them to book a meeting.",
    criteria: {
      when: "Continuously, while the firm has contacts in Tower and hands-free operation is enabled",
      conditions: [
        "Eligible = service-eligible candidates",
        "Campaign = launch, nudge, or reactivation",
        "Core outcome = meeting booked",
      ],
    },
    components: {},
    position: { x: 420, y: 0 },
  },
  {
    id: "n-core",
    parentId: "outcome",
    kind: "answer",
    depth: 1,
    question:
      "How does Tower automatically detect eligible candidates and initiate a campaign to get them to book a meeting?",
    clarity:
      "Tower automatically detects eligible candidates by using rules, triggers, and schedules created in the Automations modal to assess Client Data, and triggers Agents to campaign candidates into booking a meeting.",
    criteria: {
      when: "While the firm has contacts in Tower and hands-free operation is enabled",
      conditions: [
        "Rules, triggers, and schedules defined in Automations",
        "Client Data available to assess",
        "Agents configured to campaign toward booking",
      ],
    },
    components: {
      ui: ["Hub Automations", "Client Data", "Hub Agents", "Engagement chart"],
    },
    position: { x: 420, y: 130 },
  },
  {
    id: "n-assess-client-data",
    parentId: "n-core",
    kind: "answer",
    depth: 2,
    question:
      "How does Tower use rules, triggers, and schedules in the Automations modal to assess Client Data and detect eligible candidates?",
    clarity:
      "In the Automations modal, a consultant configures a trigger (event, schedule, or manual run) that enrolls contacts, then uses filters and rule outcomes to assess Client Data against eligibility criteria; contacts that pass are detected as eligible.",
    criteria: {
      when: "When an automation trigger fires or a scheduled / manual run starts",
      conditions: [
        "Trigger and enrollment criteria defined in Automations",
        "Filter or rule outcomes evaluate Client Data (and related fields)",
        "Contacts that pass continue as eligible",
      ],
    },
    components: {
      ui: [
        "Hub Automations",
        "Trigger node",
        "Filter / If node",
        "Rule node",
        "Client Data",
        "Enrollment criteria",
      ],
    },
    position: { x: 160, y: 270 },
  },
  {
    id: "n-configure-trigger",
    parentId: "n-assess-client-data",
    kind: "leaf",
    depth: 3,
    question:
      "How does a consultant configure a trigger (event, schedule, or manual run) that enrolls contacts?",
    clarity:
      "In Hub Automations, the consultant adds a Trigger node, chooses event, schedule, or manual run, and sets enrollment criteria for which contacts enter the workflow.",
    criteria: {
      when: "When consultant authors or edits an automation trigger",
      conditions: [
        "Trigger kind is event, schedule, or manual",
        "Enrollment criteria define who enters",
      ],
    },
    components: {
      ui: ["Hub Automations", "Trigger node", "Enrollment criteria"],
      runtime: ["Automation trigger"],
    },
    isLeaf: true,
    position: { x: 40, y: 410 },
  },
  {
    id: "n-filter-rule-assess",
    parentId: "n-assess-client-data",
    kind: "leaf",
    depth: 3,
    question:
      "How do filters and rule outcomes assess Client Data against eligibility criteria so contacts that pass are detected as eligible?",
    clarity:
      "Filter and Rule nodes on the Automations canvas evaluate enrolled contacts' Client Data against eligibility criteria; contacts that pass continue on the eligible path.",
    criteria: {
      when: "When enrolled contacts reach a filter or rule step",
      conditions: [
        "Filter and/or rule outcomes assess Client Data",
        "Eligible contacts are detected on the pass path",
      ],
    },
    components: {
      ui: ["Filter / If node", "Rule node", "Client Data"],
      runtime: ["Automation evaluator"],
    },
    isLeaf: true,
    position: { x: 280, y: 410 },
  },
  {
    id: "n-trigger-agents",
    parentId: "n-core",
    kind: "answer",
    depth: 2,
    question: "How does Tower trigger Agents to campaign candidates into booking a meeting?",
    clarity:
      "Automations trigger the reactivation agent, which is a composite sequencing of channels and copy, when criteria for a reactivation are met.",
    criteria: {
      when: "When criteria for a reactivation are met",
      conditions: [
        "Automation fires from Hub Automations",
        "Reactivation agent selected",
        "Campaign progresses toward booking",
      ],
    },
    components: {
      ui: ["Hub Automations", "Hub Agents", "Engagement chart"],
    },
    position: { x: 680, y: 270 },
  },
  {
    id: "n-automation-triggers-reactivation",
    parentId: "n-trigger-agents",
    kind: "leaf",
    depth: 3,
    question:
      "How do Automations trigger the reactivation agent when criteria for a reactivation are met?",
    clarity:
      "In Hub Automations, the consultant defines a trigger, a rule, and an action; the action selects the reactivation agent. When trigger and rule criteria are met, the automation runs that action and enrolls the contact in the agent.",
    criteria: {
      when: "When criteria for a reactivation are met",
      conditions: [
        "Automation has trigger, rule, and action configured",
        "Action references the reactivation agent",
        "Trigger event and rule evaluate true for the contact",
      ],
    },
    components: {
      ui: ["Hub Automations", "Trigger node", "Rule node", "Action node"],
      runtime: ["Automation evaluator", "Sequence runner"],
      stores: ["enrollments"],
    },
    isLeaf: true,
    position: { x: 560, y: 410 },
  },
  {
    id: "n-reactivation-agent-composite",
    parentId: "n-trigger-agents",
    kind: "leaf",
    depth: 3,
    question: "How is the reactivation agent a composite sequencing of channels and copy?",
    clarity:
      "The reactivation agent is authored in Hub Agents as an ordered list of steps; each step defines a channel and copy. The composite sequence is the agent's step list — communication channels today, extensible to other action types later.",
    criteria: {
      when: "When consultant authors or Tower runs the reactivation agent",
      conditions: [
        "Agent has one or more steps in sequence order",
        "Each step specifies channel and copy",
        "Engagement chart reflects channel rows per step",
      ],
    },
    components: {
      ui: ["Hub Agents editor", "Agent step list", "Engagement chart"],
    },
    isLeaf: true,
    position: { x: 800, y: 410 },
  },
];

export const TOWER_CORE_OUTCOME_GRAPH: HowGraph = {
  id: "tower-core-outcome",
  label: "Core Outcome",
  epicOrder: 2,
  personaId: "consultant",
  outcomeId: "consultant-core",
  nodes,
};

export function getHowNode(graph: HowGraph, nodeId: string): HowNode | undefined {
  return graph.nodes.find((node) => node.id === nodeId);
}

export function getHowNodeChildren(graph: HowGraph, nodeId: string): HowNode[] {
  return graph.nodes
    .filter((node) => node.parentId === nodeId)
    .sort((a, b) => a.position.x - b.position.x);
}
