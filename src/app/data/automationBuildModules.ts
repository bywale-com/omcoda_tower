import type { NotionIconName } from "../icons/notion-icon-urls";
import type { PaletteBlock } from "./automationWorkflows";

/** Peer build modules in the automations editor — triggers are separate. */
export const AUTOMATION_BUILD_MODULES = [
  "constants",
  "conditions",
  "operations",
  "rules",
  "actions",
] as const;

export type AutomationBuildModule = (typeof AUTOMATION_BUILD_MODULES)[number];

export const AUTOMATION_BUILD_MODULE_LABELS: Record<AutomationBuildModule, string> = {
  constants: "Constants",
  conditions: "Conditions",
  operations: "Operations",
  rules: "Rules",
  actions: "Actions",
};

export const AUTOMATION_BUILD_MODULE_HINTS: Record<AutomationBuildModule, string> = {
  constants: "Constants — values, references, and environment variables",
  conditions: "Branching, filters, and predicates",
  operations: "Transforms, waits, and flow control",
  rules: "Pre-built packages of constants, conditions, and operations",
  actions: "Side effects executed in Tower",
};

export function paletteBlocksByModule(blocks: PaletteBlock[]): Record<AutomationBuildModule, PaletteBlock[]> {
  const grouped: Record<AutomationBuildModule, PaletteBlock[]> = {
    constants: [],
    conditions: [],
    operations: [],
    rules: [],
    actions: [],
  };
  for (const block of blocks) {
    grouped[block.module].push(block);
  }
  return grouped;
}

export function paletteBlockIcon(block: PaletteBlock): NotionIconName {
  switch (block.module) {
    case "constants":
      return "gear";
    case "conditions":
      return "filter";
    case "operations":
      return block.nodeType === "exit" ? "dot-circle" : "clock";
    case "rules":
      return "lightning-bolt";
    case "actions":
      return "directional-sign";
  }
}
