/**
 * Operator fleet index — empty or personalized to real/session firms.
 * No DEMO_FIRMS densification. Prefer session firm; merge unique firms from
 * listConsultants when the admin API is available.
 */
import { peekActiveFirmId, wirePorts } from "../../../wire";

export type OperatorFirm = {
  id: string;
  name: string;
  stage?: string;
  health?: string;
};

function sessionFirmLabel(firmId: string, nameHint?: string | null): OperatorFirm {
  const name =
    nameHint?.trim() ||
    `Session firm · ${firmId.slice(0, 8)}…`;
  return {
    id: firmId,
    name,
    stage: "Prepared Workspace",
    health: "Watch",
  };
}

/** Sync snapshot from session firm only (no network). */
export function peekOperatorFirms(nameHint?: string | null): OperatorFirm[] {
  const sessionFirm = peekActiveFirmId();
  if (!sessionFirm) return [];
  return [sessionFirmLabel(sessionFirm, nameHint)];
}

/**
 * Resolve operator firm index: session firm + unique firms from listConsultants.
 * Returns [] when nothing is bound — honest empty, not DEMO_FIRMS.
 */
export async function resolveOperatorFirms(): Promise<OperatorFirm[]> {
  const byId = new Map<string, OperatorFirm>();

  const sessionFirm = peekActiveFirmId();
  if (sessionFirm) {
    byId.set(sessionFirm, sessionFirmLabel(sessionFirm));
  }

  try {
    const consultants = await wirePorts.machineApi.listConsultants();
    for (const c of consultants) {
      if (!c.firmId) continue;
      const existing = byId.get(c.firmId);
      byId.set(c.firmId, {
        id: c.firmId,
        name: c.firmName?.trim() || existing?.name || sessionFirmLabel(c.firmId).name,
        stage: existing?.stage ?? "Prepared Workspace",
        health: existing?.health ?? "Watch",
      });
    }
  } catch {
    /* non-admin / offline — session firm alone is enough */
  }

  // Prefer session firm first when present.
  const rows = [...byId.values()];
  if (sessionFirm && rows[0]?.id !== sessionFirm) {
    const session = byId.get(sessionFirm);
    if (session) {
      return [session, ...rows.filter((r) => r.id !== sessionFirm)];
    }
  }
  return rows;
}

export function firmDisplayName(
  firms: readonly OperatorFirm[],
  firmId: string,
): string {
  return firms.find((f) => f.id === firmId)?.name ?? `Firm · ${firmId.slice(0, 8)}…`;
}
