import type { ManualTriggerConfig } from "./automationEvents";
import {
  buildManualPullOutput,
  readPullPath,
  type AutomationPullOutput,
} from "./automationDataPull";

export type WorkflowNodeRunStatus = "idle" | "running" | "success" | "failed";

/** @deprecated Use AutomationPullOutput — kept for node data compatibility */
export type NodeDataPayload = AutomationPullOutput & Record<string, unknown>;

export function buildManualPullPayload(config: ManualTriggerConfig): AutomationPullOutput {
  return buildManualPullOutput(config);
}

export function countPullItems(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "object" && value != null && "itemCount" in value) {
    return Number((value as { itemCount: number }).itemCount) || 0;
  }
  if (typeof value === "object" && value != null && Array.isArray((value as { items?: unknown[] }).items)) {
    return (value as { items: unknown[] }).items.length;
  }
  return value ? 1 : 0;
}

export { readPullPath };
