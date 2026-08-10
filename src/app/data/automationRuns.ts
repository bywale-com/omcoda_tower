import type { WorkflowTarget } from "./automationWorkflows";

export type AutomationRunStatus = "success" | "running" | "failed" | "waiting";

export type AutomationRunEntityKind = WorkflowTarget;

export type AutomationRun = {
  id: string;
  workflowId: string;
  entityKind: AutomationRunEntityKind;
  entityId: string;
  entityLabel: string;
  status: AutomationRunStatus;
  startedAt: string;
  finishedAt?: string;
  triggerLabel: string;
  durationMs?: number;
};

/** Seed chrome removed — Runs tab shows workflow_run rows from the machine walk. */
const SEED_RUNS: AutomationRun[] = [];

export function getAutomationRuns(workflowId: string): AutomationRun[] {
  return SEED_RUNS.filter((run) => run.workflowId === workflowId).sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
}

export function createManualAutomationRun(
  workflowId: string,
  options?: { entityLabel?: string },
): AutomationRun {
  return {
    id: `run-manual-${Date.now()}`,
    workflowId,
    entityKind: "contact",
    entityId: "manual-batch",
    entityLabel: options?.entityLabel ?? "Manual pull",
    status: "running",
    startedAt: new Date().toISOString(),
    triggerLabel: "Manual run",
  };
}

export function completeAutomationRun(
  run: AutomationRun,
  status: Extract<AutomationRunStatus, "success" | "failed"> = "success",
): AutomationRun {
  const finishedAt = new Date().toISOString();
  return {
    ...run,
    status,
    finishedAt,
    durationMs: Math.max(0, new Date(finishedAt).getTime() - new Date(run.startedAt).getTime()),
  };
}

export function automationRunStatusLabel(status: AutomationRunStatus): string {
  switch (status) {
    case "success":
      return "Success";
    case "running":
      return "Running";
    case "failed":
      return "Failed";
    case "waiting":
      return "Waiting";
  }
}

export function automationRunEntityKindLabel(kind: AutomationRunEntityKind): string {
  switch (kind) {
    case "client":
      return "Client";
    case "contact":
      return "Contact";
    case "import":
      return "Import";
    case "audit":
      return "Audit";
  }
}

export function formatRunDuration(durationMs?: number): string {
  if (durationMs == null) return "—";
  if (durationMs < 1000) return `${durationMs}ms`;
  const seconds = durationMs / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return `${minutes}m ${remainder}s`;
}

export function formatRunTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
