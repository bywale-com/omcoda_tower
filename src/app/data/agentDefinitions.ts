import { getAllWorkflowDefinitions } from "./automationWorkflows";

export type AgentStatus = "idle" | "running" | "paused" | "draft";

export type AgentEditorTab = "editor" | "contacts" | "activity" | "report" | "settings";

export type AgentStepKind =
  | "sms"
  | "email"
  | "call"
  | "wait"
  | "portal_nudge"
  | "consultant_task"
  | "exit";

export type AgentStepType = {
  id: AgentStepKind;
  label: string;
  description: string;
};

export type AgentDefinition = {
  id: string;
  name: string;
  status: AgentStatus;
  active: boolean;
  starred: boolean;
  stepCount: number;
  linkedAutomationIds: string[];
  updatedAt: string;
};

export const AGENT_EDITOR_TABS: { id: AgentEditorTab; label: string }[] = [
  { id: "editor", label: "Editor" },
  { id: "contacts", label: "Contacts" },
  { id: "activity", label: "Activity" },
  { id: "report", label: "Report" },
  { id: "settings", label: "Settings" },
];

export const AGENT_STEP_TYPES: AgentStepType[] = [
  { id: "email", label: "Email", description: "Email touchpoint" },
  { id: "consultant_task", label: "Task", description: "Manual follow-up task" },
];

/** Hub agent id → sequence_template id / class (Agents ↔ machine tables). */
export const AGENT_TEMPLATE_BINDING: Record<
  string,
  { templateId: string; sequenceClass: "optin" | "reengagement" | "reactivation" }
> = {
  "agent-intake": { templateId: "tpl.optin_launch.v1", sequenceClass: "optin" },
  "agent-nudge": { templateId: "tpl.reengagement.v1", sequenceClass: "reengagement" },
  "agent-reactivation": { templateId: "tpl.reactivation.v1", sequenceClass: "reactivation" },
};

const SEED_AGENTS: AgentDefinition[] = [
  {
    id: "agent-intake",
    name: "Opt-in launch",
    status: "idle",
    active: false,
    starred: false,
    stepCount: 0,
    linkedAutomationIds: ["wf-optin-launch"],
    updatedAt: "2026-08-10T00:00:00.000Z",
  },
  {
    id: "agent-nudge",
    name: "Nudge / re-engagement",
    status: "running",
    active: true,
    starred: true,
    stepCount: 4,
    linkedAutomationIds: ["wf-webhook-reeval"],
    updatedAt: "2026-08-10T00:00:00.000Z",
  },
  {
    id: "agent-reactivation",
    name: "Reactivation",
    status: "idle",
    active: false,
    starred: false,
    stepCount: 0,
    linkedAutomationIds: ["wf-eligibility-reactivation"],
    updatedAt: "2026-08-10T00:00:00.000Z",
  },
];

export function getAgentDefinition(id: string): AgentDefinition | undefined {
  return SEED_AGENTS.find((agent) => agent.id === id);
}

export function getAllAgentDefinitions(): AgentDefinition[] {
  return SEED_AGENTS;
}

export function agentStatusLabel(status: AgentStatus): string {
  switch (status) {
    case "idle":
      return "Idle";
    case "running":
      return "Running";
    case "paused":
      return "Paused";
    case "draft":
      return "Draft";
  }
}

export function getLinkedAutomationSummaries(agent: AgentDefinition) {
  const workflows = getAllWorkflowDefinitions();
  return agent.linkedAutomationIds
    .map((automationId) => workflows.find((workflow) => workflow.id === automationId))
    .filter((workflow): workflow is NonNullable<typeof workflow> => !!workflow)
    .map((workflow) => ({ id: workflow.id, name: workflow.name, status: workflow.status }));
}
