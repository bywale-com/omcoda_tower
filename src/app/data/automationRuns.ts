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

const SEED_RUNS: AutomationRun[] = [
  {
    id: "run-welcome-1",
    workflowId: "auto-welcome",
    entityKind: "contact",
    entityId: "contact-marcus",
    entityLabel: "Marcus Webb",
    status: "success",
    startedAt: "2026-07-09T14:02:00.000Z",
    finishedAt: "2026-07-09T14:02:04.200Z",
    triggerLabel: "Audit completed",
    durationMs: 4200,
  },
  {
    id: "run-welcome-2",
    workflowId: "auto-welcome",
    entityKind: "contact",
    entityId: "contact-sarah",
    entityLabel: "Sarah Jenkins",
    status: "running",
    startedAt: "2026-07-09T14:18:00.000Z",
    triggerLabel: "Audit completed",
  },
  {
    id: "run-welcome-3",
    workflowId: "auto-welcome",
    entityKind: "contact",
    entityId: "contact-aisha",
    entityLabel: "Aisha Khan",
    status: "failed",
    startedAt: "2026-07-09T13:40:00.000Z",
    finishedAt: "2026-07-09T13:40:01.100Z",
    triggerLabel: "Audit completed",
    durationMs: 1100,
  },
  {
    id: "run-crs-1",
    workflowId: "auto-crs-alert",
    entityKind: "client",
    entityId: "sarah",
    entityLabel: "Sarah Jenkins",
    status: "success",
    startedAt: "2026-07-09T12:05:00.000Z",
    finishedAt: "2026-07-09T12:05:00.800Z",
    triggerLabel: "Eligibility changed",
    durationMs: 800,
  },
  {
    id: "run-crs-2",
    workflowId: "auto-crs-alert",
    entityKind: "client",
    entityId: "marcus",
    entityLabel: "Marcus Webb",
    status: "waiting",
    startedAt: "2026-07-09T14:22:00.000Z",
    triggerLabel: "Eligibility changed",
  },
  {
    id: "run-crs-3",
    workflowId: "auto-crs-alert",
    entityKind: "client",
    entityId: "priya",
    entityLabel: "Priya Nair",
    status: "success",
    startedAt: "2026-07-08T09:15:00.000Z",
    finishedAt: "2026-07-08T09:15:01.400Z",
    triggerLabel: "Eligibility changed",
    durationMs: 1400,
  },
];

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
