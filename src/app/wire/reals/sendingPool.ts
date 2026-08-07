import type { PoolSubdomain, SendingPoolPort } from "../ports";
import { wireFetch } from "../http";
import { markPoolDnsProvisioned } from "../fixtures/store";

export const realSendingPool: SendingPoolPort = {
  tag: "real",
  async allocate(firmId, slug) {
    return wireFetch<PoolSubdomain>("/pool/allocate", {
      method: "POST",
      body: JSON.stringify({ firmId, slug }),
    });
  },
  async get(firmId) {
    const res = await wireFetch<{ domain: PoolSubdomain | null }>(`/pool/${encodeURIComponent(firmId)}`);
    return res.domain;
  },
  async list() {
    const res = await wireFetch<{ domains: PoolSubdomain[] }>("/pool");
    return res.domains;
  },
  async authChips(firmId) {
    const res = await wireFetch<{
      chips: Array<{ id: string; label: string; present: boolean; fixture: string }>;
      verified: boolean;
    }>(`/pool/${encodeURIComponent(firmId)}/auth-chips`);
    // Mirror real verification into fixtures so sendGate composite stays honest
    if (res.verified) {
      markPoolDnsProvisioned(firmId, "platform-ops");
    }
    return res.chips;
  },
  async markPlatformDnsPublished(firmId) {
    const res = await wireFetch<{ ok: boolean; verified?: boolean; detail?: string }>(
      `/pool/${encodeURIComponent(firmId)}/verify`,
      { method: "POST", body: "{}" },
    );
    if (res.verified) {
      markPoolDnsProvisioned(firmId, "platform-ops");
    } else if (!res.ok) {
      throw new Error(res.detail ?? "domain verify failed");
    }
  },
};
