import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  completeAutomationRun,
  createManualAutomationRun,
  getAutomationRuns,
  type AutomationRun,
} from "../data/automationRuns";
import {
  createAutomationWorkflow,
  getInitialWorkflows,
  normalizeAutomationName,
  savePersistedWorkflows,
  workflowStatusLabel,
  type WorkflowDefinition,
} from "../data/automationWorkflows";
import type { HubAutomation } from "../data/hub";

type WorkflowPatch = Partial<
  Pick<WorkflowDefinition, "name" | "status" | "target" | "nodes" | "edges">
>;

type AutomationContextValue = {
  automations: HubAutomation[];
  workflows: WorkflowDefinition[];
  createAutomation: () => WorkflowDefinition;
  renameAutomation: (id: string, name: string) => void;
  updateWorkflow: (id: string, patch: WorkflowPatch) => void;
  getWorkflowById: (id: string) => WorkflowDefinition | undefined;
  getRunsForWorkflow: (workflowId: string) => AutomationRun[];
  startManualRun: (workflowId: string) => AutomationRun;
  stopManualRun: (runId: string) => void;
  getActiveManualRunId: (workflowId: string) => string | null;
};

const AutomationContext = createContext<AutomationContextValue | null>(null);

function workflowsToAutomations(workflows: WorkflowDefinition[]): HubAutomation[] {
  return workflows.map((workflow) => ({
    id: workflow.id,
    label: workflow.name,
    meta: workflowStatusLabel(workflow.status),
  }));
}

export function AutomationProvider({ children }: { children: ReactNode }) {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>(() => getInitialWorkflows());
  const [sessionRuns, setSessionRuns] = useState<AutomationRun[]>([]);

  useEffect(() => {
    savePersistedWorkflows(workflows);
  }, [workflows]);

  const automations = useMemo(() => workflowsToAutomations(workflows), [workflows]);

  const createAutomation = useCallback(() => {
    const workflow = createAutomationWorkflow(workflows);
    setWorkflows((prev) => [workflow, ...prev]);
    return workflow;
  }, [workflows]);

  const updateWorkflow = useCallback((id: string, patch: WorkflowPatch) => {
    setWorkflows((prev) =>
      prev.map((workflow) => {
        if (workflow.id !== id) return workflow;
        const nextName =
          patch.name !== undefined ? normalizeAutomationName(patch.name) : workflow.name;
        return {
          ...workflow,
          ...patch,
          name: nextName,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }, []);

  const renameAutomation = useCallback(
    (id: string, name: string) => {
      updateWorkflow(id, { name });
    },
    [updateWorkflow],
  );

  const getWorkflowById = useCallback(
    (id: string) => workflows.find((workflow) => workflow.id === id),
    [workflows],
  );

  const getRunsForWorkflow = useCallback(
    (workflowId: string) => {
      const seeded = getAutomationRuns(workflowId);
      const extra = sessionRuns.filter((run) => run.workflowId === workflowId);
      return [...extra, ...seeded].sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      );
    },
    [sessionRuns],
  );

  const getActiveManualRunId = useCallback(
    (workflowId: string) => {
      const active = sessionRuns.find(
        (run) =>
          run.workflowId === workflowId &&
          run.triggerLabel === "Manual run" &&
          run.status === "running",
      );
      return active?.id ?? null;
    },
    [sessionRuns],
  );

  const startManualRun = useCallback((workflowId: string) => {
    const run = createManualAutomationRun(workflowId);
    setSessionRuns((prev) => [run, ...prev]);
    window.setTimeout(() => {
      setSessionRuns((prev) =>
        prev.map((item) =>
          item.id === run.id && item.status === "running"
            ? completeAutomationRun(item, "success")
            : item,
        ),
      );
    }, 1800);
    return run;
  }, []);

  const stopManualRun = useCallback((runId: string) => {
    setSessionRuns((prev) =>
      prev.map((run) =>
        run.id === runId && run.status === "running" ? completeAutomationRun(run, "failed") : run,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      automations,
      workflows,
      createAutomation,
      renameAutomation,
      updateWorkflow,
      getWorkflowById,
      getRunsForWorkflow,
      startManualRun,
      stopManualRun,
      getActiveManualRunId,
    }),
    [
      automations,
      workflows,
      createAutomation,
      renameAutomation,
      updateWorkflow,
      getWorkflowById,
      getRunsForWorkflow,
      startManualRun,
      stopManualRun,
      getActiveManualRunId,
    ],
  );

  return <AutomationContext.Provider value={value}>{children}</AutomationContext.Provider>;
}

export function useAutomations() {
  const ctx = useContext(AutomationContext);
  if (!ctx) throw new Error("useAutomations must be used within AutomationProvider");
  return ctx;
}
