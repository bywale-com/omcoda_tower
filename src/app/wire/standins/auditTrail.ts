import type { AuditAppendInput, AuditEvent, AuditTrailPort } from "../ports";

const events: AuditEvent[] = [];

export function getStandInAuditEvents(): ReadonlyArray<AuditEvent> {
  return events;
}

export function clearStandInAuditEvents(): void {
  events.length = 0;
}

export const standInAuditTrail: AuditTrailPort = {
  tag: "stand-in",
  async append(input: AuditAppendInput): Promise<AuditEvent> {
    const event: AuditEvent = {
      id: `audit-${Date.now()}-${events.length + 1}`,
      at: new Date().toISOString(),
      actorId: input.actorId,
      kind: input.kind,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      payload: input.payload,
    };
    events.push(event);
    return event;
  },
  async list(filter) {
    return events.filter((e) => {
      if (filter?.subjectId && e.subjectId !== filter.subjectId) return false;
      if (filter?.kind && e.kind !== filter.kind) return false;
      return true;
    });
  },
};
