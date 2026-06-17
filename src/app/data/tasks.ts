export type ConsultantTask = {
  id: string;
  clientId: string;
  /** Journey touchpoint id this task links to */
  touchpointId: string;
  label: string;
  clientName: string;
  status: "open" | "done";
  createdAt: string;
};

export type TaskStatus = "open" | "done";

export const consultantTasks: ConsultantTask[] = [
  {
    id: "task-sarah-001",
    clientId: "sarah",
    touchpointId: "n-001-task",
    label: "Follow up manually",
    clientName: "Sarah Jenkins",
    status: "open",
    createdAt: "Jun 11 · 12:00",
  },
];

export const INITIAL_CONSULTANT_TASKS = consultantTasks;
