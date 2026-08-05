/** Shared demo rows for Operator Ant desk — mirrors source plant data, not imported from prototype/. */

export const DEMO_FIRMS = [
  { id: "firm-northwind", name: "Northwind Immigration", stage: "Running", health: "Healthy" },
  { id: "firm-cedar", name: "Cedar Pathways", stage: "Prepared Workspace", health: "Watch" },
  { id: "firm-harbor", name: "Harbor RCIC Desk", stage: "Escrow held", health: "Healthy" },
  { id: "firm-atlas", name: "Atlas Mobility", stage: "Approach capture", health: "At risk" },
] as const;

export type DemoFirm = (typeof DEMO_FIRMS)[number];

export function firmById(id: string) {
  return DEMO_FIRMS.find((f) => f.id === id) ?? DEMO_FIRMS[0];
}

export function healthTagColor(health: string): "success" | "warning" | "error" | "default" {
  if (health === "Healthy" || health === "complete" || health === "Live" || health === "Published")
    return "success";
  if (health === "Watch" || health === "Paused" || health === "Draft" || health === "pending")
    return "warning";
  if (health === "At risk" || health === "disputed" || health === "High") return "error";
  return "default";
}
