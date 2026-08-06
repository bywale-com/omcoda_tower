import type { HaltCommitInput, HaltRecord, HaltStorePort } from "../ports";
import { standInAuditTrail } from "./auditTrail";

const halts = new Map<string, HaltRecord>();

export const standInHaltStore: HaltStorePort = {
  tag: "stand-in",
  async commit(input: HaltCommitInput): Promise<HaltRecord> {
    const id = `halt-${Date.now()}-${halts.size + 1}`;
    const record: HaltRecord = {
      id,
      consultantId: input.consultantId,
      contactId: input.contactId,
      firmId: input.firmId,
      scope: input.scope,
      reason: input.reason,
      haltedAt: new Date().toISOString(),
    };
    // Firm-book halt supersedes prior active firm-book for same firm.
    if (input.scope === "firm-book") {
      for (const [key, existing] of halts) {
        if (
          existing.firmId === input.firmId &&
          existing.scope === "firm-book" &&
          !existing.liftedAt
        ) {
          halts.set(key, { ...existing, liftedAt: record.haltedAt });
        }
      }
    }
    halts.set(id, record);
    await standInAuditTrail.append({
      actorId: input.consultantId,
      kind: input.scope === "firm-book" ? "halt.firm-book" : "halt.contact",
      subjectType: input.scope === "firm-book" ? "firm" : "contact",
      subjectId: input.scope === "firm-book" ? input.firmId : (input.contactId ?? input.firmId),
      payload: { haltId: id, reason: input.reason },
    });
    return record;
  },
  async lift(haltId: string): Promise<HaltRecord | null> {
    const existing = halts.get(haltId);
    if (!existing || existing.liftedAt) return existing ?? null;
    const lifted: HaltRecord = { ...existing, liftedAt: new Date().toISOString() };
    halts.set(haltId, lifted);
    await standInAuditTrail.append({
      actorId: existing.consultantId,
      kind: "halt.lift",
      subjectType: existing.scope === "firm-book" ? "firm" : "contact",
      subjectId:
        existing.scope === "firm-book" ? existing.firmId : (existing.contactId ?? existing.firmId),
      payload: { haltId },
    });
    return lifted;
  },
  async listActive(firmId?: string): Promise<HaltRecord[]> {
    return [...halts.values()].filter(
      (h) => !h.liftedAt && (firmId == null || h.firmId === firmId),
    );
  },
  async isContactHalted(contactId: string): Promise<boolean> {
    for (const h of halts.values()) {
      if (h.liftedAt) continue;
      if (h.scope === "contact" && h.contactId === contactId) return true;
      // firm-book halt covers all contacts of that firm — callers pass firm separately
    }
    return false;
  },
  async isFirmBookHalted(firmId: string): Promise<boolean> {
    return [...halts.values()].some(
      (h) => !h.liftedAt && h.scope === "firm-book" && h.firmId === firmId,
    );
  },
};

export function clearStandInHalts(): void {
  halts.clear();
}
