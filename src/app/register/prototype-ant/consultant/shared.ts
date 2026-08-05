import { getClientMeta } from "../../../data/clients";

export const FIRM_NAME = "Cedar Pathways";
export const DEFAULT_LICENSEE = "Sarah Chen · RCIC R123456";
export const LICENSEES = ["Sarah Chen · RCIC R123456", "Marco Reyes · RCIC R654321"];

export type ConsultantModule =
  | "Board"
  | "Contacts"
  | "Meetings"
  | "Prepared Workspace"
  | "Login";

export type HaltScope = "contact" | "book";

export type HaltRetention = {
  scope: HaltScope;
  reason: string;
  at: string;
};

export type WorkspacePhase = "silent" | "in-motion" | "meeting-ready" | "halted";

export const PHASE_LABEL: Record<WorkspacePhase, string> = {
  silent: "Silent",
  "in-motion": "In motion",
  "meeting-ready": "Meeting-ready",
  halted: "Halted",
};

export function nowStamp(): string {
  return "Today · just now";
}

export function resolveWorkspacePhase(
  clientId: string,
  halted: boolean,
  meetingReadyIds: ReadonlySet<string>,
): WorkspacePhase {
  if (halted) return "halted";
  if (meetingReadyIds.has(clientId)) return "meeting-ready";
  const meta = getClientMeta(clientId);
  if (!meta.optedIn) return "silent";
  if (
    meta.reactivationPhase === "active" ||
    meta.reactivationPhase === "armed" ||
    meta.nudge.active
  ) {
    return "in-motion";
  }
  if (meta.status === "grey") return "silent";
  return "in-motion";
}

export function silenceCauseLabel(clientId: string, halt: HaltRetention | null): string {
  if (halt) return halt.scope === "book" ? "My Halt · firm book" : "My Halt · this contact";
  const meta = getClientMeta(clientId);
  if (!meta.optedIn) return "Contact opt-out";
  if (meta.status === "grey" && !meta.nudge.active) return "Sequence end · monitoring";
  return "—";
}

export function phaseTagColor(phase: WorkspacePhase): string {
  if (phase === "halted") return "error";
  if (phase === "meeting-ready") return "processing";
  if (phase === "silent") return "default";
  return "warning";
}

export const CLIENT_IDS = ["sarah", "marcus", "mark", "aisha", "priya", "james", "daniel", "fatima", "lin"];
