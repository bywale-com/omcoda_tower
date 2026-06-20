import type { NotionIconName } from "../icons/notion-icon-urls";
import type { Audit } from "./audits";
import { getAudit } from "./audits";

export type HubAgent = {
  id: string;
  label: string;
  meta: string;
};

export type HubAutomation = {
  id: string;
  label: string;
  meta: string;
};

export const hubAgentList: HubAgent[] = [
  { id: "agent-intake", label: "Intake triage", meta: "Idle" },
  { id: "agent-nudge", label: "Nudge composer", meta: "Running" },
  { id: "agent-reactivation", label: "Reactivation scout", meta: "Idle" },
];

export const hubAutomationList: HubAutomation[] = [
  { id: "auto-welcome", label: "Welcome sequence armer", meta: "Active" },
  { id: "auto-crs-alert", label: "CRS threshold alert", meta: "Active" },
  { id: "auto-stale-file", label: "Stale file escalator", meta: "Paused" },
];

export function getHubAudit(id: string, audits: Audit[]): Audit | undefined {
  return getAudit(audits, id);
}

export function getHubAgent(id: string): HubAgent | undefined {
  return hubAgentList.find((item) => item.id === id);
}

export function getHubAutomation(id: string): HubAutomation | undefined {
  return hubAutomationList.find((item) => item.id === id);
}

export type HubToolKind = "audit" | "agent" | "automation";

export type HubToolRef = {
  kind: HubToolKind;
  id: string;
};

export function hubToolTabId(ref: HubToolRef): string {
  return `hub-${ref.kind}-${ref.id}`;
}

export function parseHubToolTabId(tabId: string): HubToolRef | null {
  const match = /^hub-(audit|agent|automation)-(.+)$/.exec(tabId);
  if (!match) return null;
  return { kind: match[1] as HubToolKind, id: match[2] };
}

export function hubToolSectionLabel(kind: HubToolKind): string {
  switch (kind) {
    case "audit":
      return "Audits";
    case "agent":
      return "Agents";
    case "automation":
      return "Automations";
  }
}

export function getHubToolLabel(ref: HubToolRef, audits: Audit[] = []): string {
  switch (ref.kind) {
    case "audit":
      return getHubAudit(ref.id, audits)?.label ?? ref.id;
    case "agent":
      return getHubAgent(ref.id)?.label ?? ref.id;
    case "automation":
      return getHubAutomation(ref.id)?.label ?? ref.id;
  }
}

export function hubToolIcon(kind: HubToolKind): NotionIconName {
  switch (kind) {
    case "audit":
      return "document";
    case "agent":
      return "user";
    case "automation":
      return "circle-dashed";
  }
}
