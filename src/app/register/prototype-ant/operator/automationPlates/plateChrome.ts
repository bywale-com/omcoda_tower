import type { WorkflowNodeType } from "../../../../data/automationWorkflows";

/** Node-type chips as they appear on A1 / A15 / A16. */
export const PLATE_NODE_TAG: Record<
  WorkflowNodeType,
  { label: string; bg: string; color: string }
> = {
  get: { label: "Get", bg: "#7c3aed", color: "#fff" },
  trigger: { label: "Trigger", bg: "#2f54eb", color: "#fff" },
  rule: { label: "Rule", bg: "#fa8c16", color: "#fff" },
  action: { label: "Action", bg: "#52c41a", color: "#fff" },
  branch: { label: "Condition (If)", bg: "#faad14", color: "#fff" },
  exit: { label: "Exit", bg: "#595959", color: "#fff" },
  constant: { label: "Constant", bg: "#7c3aed", color: "#fff" },
};

export const PLATE_CARD = {
  border: "1px solid #e5e7eb",
  radius: 8,
  selected: "#1677ff",
};

export function formatConstantEnvName(key: string): string {
  return key.replace(/\./g, "_").toUpperCase();
}

export const DEFAULT_NAMED_CODE = `function workPermitUrgency(client) {
  const days = daysUntil(client.work_permit_expiry);
  return days != null && days < 60;
}`;
