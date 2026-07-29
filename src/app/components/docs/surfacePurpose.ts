/**
 * Console surface purpose — keyed by holon id.
 * Purpose = why this surface exists (relational, not reductionist).
 * Context = top-level only: encompassing statement of children; use [[holon-id|Label]] for clickable refs.
 */
import { SURFACE_PURPOSE_BOARD } from "./surfacePurposeBoard";
import { SURFACE_PURPOSE_CONTACTS } from "./surfacePurposeContacts";
import { SURFACE_PURPOSE_HUB } from "./surfacePurposeHub";
import { SURFACE_PURPOSE_CLIENT_DATA } from "./surfacePurposeClientData";
import { SURFACE_PURPOSE_SHELL } from "./surfacePurposeShell";

export type SurfaceSeat = "consultant" | "operator" | "shared" | "unassigned";

export type SurfacePurposeEntry = {
  holonId: string;
  purpose: string;
  /** Topmost / section containers — how children hang together; may cite Seed/World lightly. */
  context?: string;
  seat?: SurfaceSeat;
};

export type SurfacePurposeRefPart =
  | { type: "text"; text: string }
  | { type: "ref"; holonId: string; label: string };

/** Parse `[[holon-id|Label]]` markers in context prose. */
export function parseSurfacePurposeContext(context: string): SurfacePurposeRefPart[] {
  const parts: SurfacePurposeRefPart[] = [];
  const re = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(context)) != null) {
    if (match.index > last) {
      parts.push({ type: "text", text: context.slice(last, match.index) });
    }
    parts.push({ type: "ref", holonId: match[1].trim(), label: match[2].trim() });
    last = match.index + match[0].length;
  }
  if (last < context.length) {
    parts.push({ type: "text", text: context.slice(last) });
  }
  return parts;
}

export function getSurfacePurpose(holonId: string): SurfacePurposeEntry | undefined {
  return SURFACE_PURPOSE[holonId];
}

export const SURFACE_PURPOSE: Record<string, SurfacePurposeEntry> = {
  ...SURFACE_PURPOSE_BOARD,
  ...SURFACE_PURPOSE_CONTACTS,
  ...SURFACE_PURPOSE_HUB,
  ...SURFACE_PURPOSE_CLIENT_DATA,
  ...SURFACE_PURPOSE_SHELL,
};
