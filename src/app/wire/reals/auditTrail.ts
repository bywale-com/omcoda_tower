import type { AuditEvent, AuditTrailPort } from "../ports";
import { wireFetch } from "../http";

export const realAuditTrail: AuditTrailPort = {
  tag: "real",
  async append(input) {
    return wireFetch<AuditEvent>("/audit", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  async list(filter) {
    const params = new URLSearchParams();
    if (filter?.subjectId) params.set("subjectId", filter.subjectId);
    if (filter?.kind) params.set("kind", filter.kind);
    const q = params.toString() ? `?${params}` : "";
    const res = await wireFetch<{ events: AuditEvent[] }>(`/audit${q}`);
    return res.events;
  },
};
