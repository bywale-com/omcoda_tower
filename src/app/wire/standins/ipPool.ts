import { isFixturePresent } from "../fixtures/store";
import type { IpPoolPort, IpPoolTier } from "../ports";

const tiers = new Map<string, IpPoolTier>();

export const standInIpPool: IpPoolPort = {
  tag: "stand-in",
  async getTier(firmId) {
    const tier = tiers.get(firmId) ?? "shared";
    const ptrReady =
      tier === "shared" ? true : isFixturePresent("dns_ptr_published", firmId) || isFixturePresent("dns_ptr_published");
    return { tier, ptrReady };
  },
  async assignShared(firmId) {
    tiers.set(firmId, "shared");
  },
};

export function clearStandInIpPool(): void {
  tiers.clear();
}
