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
  type WorkflowNodeData,
} from "../data/automationWorkflows";
import type { HubAutomation } from "../data/hub";
import { wirePorts } from "../wire/registry";
import { wireRealEnabled } from "../wire/http";
import type { Edge, Node } from "@xyflow/react";

type WorkflowPatch = Partial<
  Pick<WorkflowDefinition, "name" | "status" | "target" | "nodes" | "edges">
>;

type AutomationContextValue = {
  automations: HubAutomation[];
  workflows: WorkflowDefinition[];
  createAutomation: () => WorkflowDefinition;
  renameAutomation: (id: string, name: string) => void;
  updateWorkflow: (id: string, patch: WorkflowPatch) => void;
  activateWorkflow: (id: string) => Promise<void>;
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

function mapDbRun(row: {
  id: string;
  workflow_id: string;
  status: string;
  trigger_label: string | null;
  started_at: string;
  finished_at: string | null;
  counts?: Record<string, unknown> | null;
}): AutomationRun {
  const enrollments =
    typeof row.counts?.enrollments === "number" ? row.counts.enrollments : undefined;
  return {
    id: row.id,
    workflowId: row.workflow_id,
    entityKind: "contact",
    entityId: "machine",
    entityLabel:
      enrollments != null ? `Machine run · ${enrollments} enrolled` : "Machine run",
    status: (row.status === "stopped" ? "failed" : row.status) as AutomationRun["status"],
    triggerLabel: row.trigger_label ?? "Run",
    startedAt: row.started_at,
    finishedAt: row.finished_at ?? undefined,
  };
}

function asGraphNodes(value: unknown): Node<WorkflowNodeData>[] | null {
  if (!Array.isArray(value)) return null;
  return value as Node<WorkflowNodeData>[];
}

function asGraphEdges(value: unknown): Edge[] | null {
  if (!Array.isArray(value)) return null;
  return value as Edge[];
}

export function AutomationProvider({ children }: { children: ReactNode }) {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>(() => getInitialWorkflows());
  const [sessionRuns, setSessionRuns] = useState<AutomationRun[]>([]);
  const [remoteRuns, setRemoteRuns] = useState<AutomationRun[]>([]);

  useEffect(() => {
    savePersistedWorkflows(workflows);
  }, [workflows]);

  // Hydrate workflows (including graph) from Postgres when real wire is on
  useEffect(() => {
    if (!wireRealEnabled()) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await wirePorts.machineApi.listWorkflows();
        if (cancelled || !rows.length) return;
        setWorkflows((prev) => {
          const byId = new Map(prev.map((w) => [w.id, w]));
          for (const row of rows) {
            const existing = byId.get(row.id);
            const graph = row.graph ?? { nodes: [], edges: [] };
            const nodes = asGraphNodes(graph.nodes);
            const edges = asGraphEdges(graph.edges);
            if (existing) {
              byId.set(row.id, {
                ...existing,
                name: row.name,
                status: (row.status as WorkflowDefinition["status"]) ?? existing.status,
                target: (row.target as WorkflowDefinition["target"]) ?? existing.target,
                updatedAt: row.updated_at ?? existing.updatedAt,
                ...(nodes && nodes.length ? { nodes } : {}),
                ...(edges && edges.length ? { edges } : {}),
              });
            } else if (nodes && edges) {
              byId.set(row.id, {
                id: row.id,
                name: row.name,
                status: (row.status as WorkflowDefinition["status"]) ?? "draft",
                target: (row.target as WorkflowDefinition["target"]) ?? "contact",
                updatedAt: row.updated_at,
                nodes,
                edges,
              });
            }
          }
          return [...byId.values()];
        });
      } catch {
        // Backend / tables may be absent in frontend-only envs
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const automations = useMemo(() => workflowsToAutomations(workflows), [workflows]);

  const createAutomation = useCallback(() => {
    const workflow = createAutomationWorkflow(workflows);
    setWorkflows((prev) => [workflow, ...prev]);
    void wirePorts.machineApi
      .createWorkflow({
        id: workflow.id,
        name: workflow.name,
        target: workflow.target,
        graph: { nodes: workflow.nodes, edges: workflow.edges },
      })
      .catch(() => {
        /* keep local draft if wire down */
      });
    return workflow;
  }, [workflows]);

  const updateWorkflow = useCallback((id: string, patch: WorkflowPatch) => {
    setWorkflows((prev) => {
      const next = prev.map((workflow) => {
        if (workflow.id !== id) return workflow;
        const nextName =
          patch.name !== undefined ? normalizeAutomationName(patch.name) : workflow.name;
        return {
          ...workflow,
          ...patch,
          name: nextName,
          updatedAt: new Date().toISOString(),
        };
      });
      if (wireRealEnabled() && (patch.name || patch.nodes || patch.edges || patch.target)) {
        const current = next.find((w) => w.id === id);
        if (current) {
          void wirePorts.machineApi
            .createWorkflow({
              id,
              name: current.name,
              target: current.target,
              graph: { nodes: current.nodes, edges: current.edges },
            })
            .catch(() => undefined);
        }
      }
      return next;
    });
  }, []);

  const activateWorkflow = useCallback(async (id: string) => {
    const current = workflows.find((w) => w.id === id);
    if (current && wireRealEnabled()) {
      // Persist latest graph before materializing workflow_trigger rows
      await wirePorts.machineApi
        .createWorkflow({
          id,
          name: current.name,
          target: current.target,
          graph: { nodes: current.nodes, edges: current.edges },
        })
        .catch(() => undefined);
    }
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: "active", updatedAt: new Date().toISOString() } : w,
      ),
    );
    try {
      await wirePorts.machineApi.activateWorkflow(id);
    } catch {
      // Local status already flipped; Postgres write retried on next activate
    }
  }, [workflows]);

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
      const remote = remoteRuns.filter((run) => run.workflowId === workflowId);
      // Prefer remote/session over seed chrome when wire is real
      if (wireRealEnabled() && (extra.length > 0 || remote.length > 0)) {
        return [...extra, ...remote].sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
        );
      }
      return [...extra, ...remote, ...seeded].sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      );
    },
    [sessionRuns, remoteRuns],
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

  const refreshRemoteRuns = useCallback(async (workflowId: string) => {
    try {
      const rows = await wirePorts.machineApi.listRuns(workflowId);
      setRemoteRuns((prev) => {
        const others = prev.filter((r) => r.workflowId !== workflowId);
        return [...rows.map(mapDbRun), ...others];
      });
    } catch {
      /* ignore */
    }
  }, []);

  const startManualRun = useCallback((workflowId: string) => {
    const run = createManualAutomationRun(workflowId);
    setSessionRuns((prev) => [run, ...prev]);

    void (async () => {
      try {
        const started = await wirePorts.machineApi.startRun(workflowId, "Manual run", {
          payload: { manual: true },
        });
        const finalStatus =
          started.status === "failed" || started.status === "success"
            ? started.status
            : "success";
        const enrollmentCount = started.enrollments?.length ?? 0;
        setSessionRuns((prev) =>
          prev.map((item) =>
            item.id === run.id
              ? completeAutomationRun(
                  {
                    ...item,
                    id: started.id,
                    entityLabel:
                      enrollmentCount > 0
                        ? `Machine run · ${enrollmentCount} enrolled`
                        : item.entityLabel,
                  },
                  finalStatus === "failed" ? "failed" : "success",
                )
              : item,
          ),
        );
        // Server already finished the walk — do not fake-complete with a timer
        if (started.status === "running") {
          void wirePorts.machineApi
            .completeRun(started.id, {
              status: "success",
              nodeStatus: started.nodeStatus,
              counts: { processed: 1, success: 1, enrollments: enrollmentCount },
            })
            .catch(() => undefined);
        }
        await refreshRemoteRuns(workflowId);
      } catch {
        setSessionRuns((prev) =>
          prev.map((item) =>
            item.id === run.id && item.status === "running"
              ? completeAutomationRun(item, "failed")
              : item,
          ),
        );
      }
    })();
    return run;
  }, [refreshRemoteRuns]);

  const stopManualRun = useCallback((runId: string) => {
    setSessionRuns((prev) =>
      prev.map((run) =>
        run.id === runId && run.status === "running" ? completeAutomationRun(run, "failed") : run,
      ),
    );
    if (wireRealEnabled()) {
      void wirePorts.machineApi.completeRun(runId, { status: "failed" }).catch(() => undefined);
    }
  }, []);

  const value = useMemo(
    () => ({
      automations,
      workflows,
      createAutomation,
      renameAutomation,
      updateWorkflow,
      activateWorkflow,
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
      activateWorkflow,
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
