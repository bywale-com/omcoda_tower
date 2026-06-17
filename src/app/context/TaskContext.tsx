import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import { consultantTasks as taskSeed, type ConsultantTask, type TaskStatus } from "../data/tasks";

type TaskContextValue = {
  tasks: ConsultantTask[];
  openTaskCount: number;
  getTaskById: (id: string) => ConsultantTask | undefined;
  getTaskByTouchpointId: (touchpointId: string) => ConsultantTask | undefined;
  setTaskStatus: (taskId: string, status: TaskStatus) => void;
  toggleTaskStatus: (taskId: string) => void;
};

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<ConsultantTask[]>(() =>
    taskSeed.map((task) => ({ ...task })),
  );

  const setTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
  }, []);

  const toggleTaskStatus = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "open" ? "done" : "open" }
          : task,
      ),
    );
  }, []);

  const getTaskById = useCallback(
    (id: string) => tasks.find((task) => task.id === id),
    [tasks],
  );

  const getTaskByTouchpointId = useCallback(
    (touchpointId: string) => tasks.find((task) => task.touchpointId === touchpointId),
    [tasks],
  );

  const openTaskCount = useMemo(
    () => tasks.filter((task) => task.status === "open").length,
    [tasks],
  );

  const value = useMemo(
    () => ({
      tasks,
      openTaskCount,
      getTaskById,
      getTaskByTouchpointId,
      setTaskStatus,
      toggleTaskStatus,
    }),
    [tasks, openTaskCount, getTaskById, getTaskByTouchpointId, setTaskStatus, toggleTaskStatus],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
}
