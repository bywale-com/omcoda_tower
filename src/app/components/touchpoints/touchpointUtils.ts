import type { TaskTouchpointData } from "./TaskTouchpointPanel";
import type { ConsultantTask } from "../../data/tasks";

export type TouchpointNode = {
  id: string;
  label: string;
  channel: string;
  dateLabel?: string;
  addedAt?: string;
  taskNote?: string;
  taskAssignee?: string;
  children?: TouchpointNode[];
};

export function findTouchpointById(nodes: TouchpointNode[], id: string): TouchpointNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findTouchpointById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Touchpoints with a detail panel implemented */
export function isTouchpointClickable(id: string): boolean {
  return id === "n-001-task";
}

export function toTaskTouchpointData(node: TouchpointNode, consultantTask: ConsultantTask): TaskTouchpointData {
  return {
    taskId: consultantTask.id,
    id: node.id,
    label: node.label,
    dateLabel: node.dateLabel,
    addedAt: node.addedAt,
    taskNote: node.taskNote ?? consultantTask.label,
    taskAssignee: node.taskAssignee,
    taskStatus: consultantTask.status,
  };
}
