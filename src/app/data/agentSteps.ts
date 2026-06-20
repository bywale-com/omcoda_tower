import type { AgentStepKind } from "./agentDefinitions";

export type AgentAddStepKind = Extract<AgentStepKind, "email" | "consultant_task">;

export type AgentStepEmailData = {
  subject: string;
  body: string;
  threadType: "new" | "reply";
};

export type AgentStepTaskData = {
  priority: "low" | "medium" | "high";
  note: string;
  skipAfterDays: number;
};

export type AgentStepTiming = {
  delayMinutes?: number;
  dueDays?: number;
};

export type AgentStep = {
  id: string;
  kind: AgentAddStepKind;
  order: number;
  timing: AgentStepTiming;
  email?: AgentStepEmailData;
  task?: AgentStepTaskData;
};

let stepIdCounter = 0;

function nextStepId(kind: AgentAddStepKind): string {
  stepIdCounter += 1;
  return `agent-step-${kind}-${stepIdCounter}`;
}

export function createAgentStep(kind: AgentAddStepKind, order: number): AgentStep {
  const id = nextStepId(kind);

  if (kind === "email") {
    return {
      id,
      kind,
      order,
      timing: { delayMinutes: 30 },
      email: { subject: "", body: "", threadType: "new" },
    };
  }

  return {
    id,
    kind,
    order,
    timing: { dueDays: 3 },
    task: { priority: "medium", note: "", skipAfterDays: 0 },
  };
}

export function insertAgentStep(
  steps: AgentStep[],
  kind: AgentAddStepKind,
  afterIndex: number | null,
): AgentStep[] {
  const insertAt = afterIndex === null ? 0 : afterIndex + 1;
  const next = [...steps];
  next.splice(insertAt, 0, createAgentStep(kind, insertAt));
  return next.map((step, index) => ({ ...step, order: index }));
}

export function agentStepKindLabel(kind: AgentAddStepKind): string {
  switch (kind) {
    case "email":
      return "Email";
    case "consultant_task":
      return "Task";
  }
}

export function agentStepTitle(step: AgentStep, index: number): string {
  return `Step ${index + 1}: ${agentStepKindLabel(step.kind)}`;
}

export function agentStepTimingLabel(step: AgentStep): string {
  if (step.kind === "email") {
    const minutes = step.timing.delayMinutes ?? 0;
    if (minutes <= 0) return "Send email immediately";
    if (minutes < 60) return `Send email in ${minutes} minutes`;
    const hours = Math.round(minutes / 60);
    return `Send email in ${hours} hour${hours === 1 ? "" : "s"}`;
  }

  const days = step.timing.dueDays ?? 0;
  if (days <= 0) return "Schedule task immediately";
  return `Schedule task with due date in ${days} day${days === 1 ? "" : "s"}`;
}

export function agentStepRailSummary(step: AgentStep): string {
  if (step.kind === "email") {
    const subject = step.email?.subject?.trim();
    return subject || "No subject yet";
  }

  const note = step.task?.note?.trim();
  return note || "No task note yet";
}

export function getInitialAgentSteps(agentId: string): AgentStep[] {
  if (agentId !== "agent-nudge") {
    return [];
  }

  return [
    {
      id: "agent-step-email-seed-1",
      kind: "email",
      order: 0,
      timing: { delayMinutes: 30 },
      email: {
        subject: "Reminder: complete your intake form",
        body: "",
        threadType: "new",
      },
    },
    {
      id: "agent-step-task-seed-2",
      kind: "consultant_task",
      order: 1,
      timing: { dueDays: 3 },
      task: {
        priority: "medium",
        note: "Follow up if the client has not submitted required documents.",
        skipAfterDays: 0,
      },
    },
  ];
}
