import {
  isSendingIdentityReady,
  markPoolDnsProvisioned,
  sendingIdentityChipState,
} from "../fixtures/store";
import type { PoolSubdomain, SendingPoolPort } from "../ports";

const HOUSE_ROOT = "mail.omcoda.test";
const pool = new Map<string, PoolSubdomain>();

function slugify(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export const standInSendingPool: SendingPoolPort = {
  tag: "stand-in",
  async allocate(firmId, slug) {
    const existing = pool.get(firmId);
    if (existing) return existing;
    const sub = slugify(slug) || firmId.replace(/^firm-/, "");
    const row: PoolSubdomain = {
      firmId,
      subdomain: sub,
      fullDomain: `${sub}.${HOUSE_ROOT}`,
      path: "pool",
      allocatedAt: new Date().toISOString(),
      identityId: `sid-${firmId}`,
    };
    pool.set(firmId, row);
    return row;
  },
  async get(firmId) {
    return pool.get(firmId) ?? null;
  },
  async list() {
    return [...pool.values()];
  },
  async authChips(firmId) {
    const { chips } = sendingIdentityChipState(firmId);
    return chips.map((c) => ({
      id: c.id,
      label: c.label,
      present: c.present,
      fixture: c.id,
    }));
  },
  async markPlatformDnsPublished(firmId) {
    markPoolDnsProvisioned(firmId, "platform-ops");
  },
};

export function isPoolIdentityReady(firmId: string): boolean {
  return isSendingIdentityReady(firmId);
}

export function clearStandInSendingPool(): void {
  pool.clear();
}
