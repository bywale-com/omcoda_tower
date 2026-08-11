export const FIRM_NAME = "Firm desk";
export const DEFAULT_LICENSEE = "Licensee · pending terms";
export const LICENSEES = ["Licensee · pending terms", "Alternate licensee"];

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
  /** Stand-in haltStore record id — used by Lift/Resume. */
  haltId?: string;
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

/** Phase from halt + meeting-ready only — no seed client meta / Sarah fallback. */
export function resolveWorkspacePhase(
  clientId: string,
  halted = false,
  meetingReadyIds: ReadonlySet<string> = new Set(),
): WorkspacePhase {
  if (halted) return "halted";
  if (meetingReadyIds.has(clientId)) return "meeting-ready";
  return "silent";
}

export function silenceCauseLabel(_clientId: string, halt: HaltRetention | null): string {
  if (halt) return halt.scope === "book" ? "My Halt · firm book" : "My Halt · this contact";
  return "—";
}

export function phaseTagColor(phase: WorkspacePhase): string {
  if (phase === "halted") return "error";
  if (phase === "meeting-ready") return "processing";
  if (phase === "silent") return "default";
  return "warning";
}

export type BookContact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

export function contactDisplayName(c: {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}): string {
  return c.name?.trim() || c.email || c.phone || c.id;
}
