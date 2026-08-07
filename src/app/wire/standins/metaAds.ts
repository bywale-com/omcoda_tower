import { isFixturePresent } from "../fixtures/store";
import type { MetaAdsPort, MetaCampaignState, MetaDeliveryState, MetaReviewState } from "../ports";

const campaigns = new Map<string, MetaCampaignState>();

function key(firmId: string, campaignId: string) {
  return `${firmId}::${campaignId}`;
}

function ensure(firmId: string, campaignId = "camp-default"): MetaCampaignState {
  const k = key(firmId, campaignId);
  let row = campaigns.get(k);
  if (!row) {
    row = {
      campaignId,
      firmId,
      review: "draft",
      delivery: "not_started",
      outboundReady: false,
    };
    campaigns.set(k, row);
  }
  const verified =
    isFixturePresent("meta_business_verified", firmId) || isFixturePresent("meta_business_verified");
  const linked =
    isFixturePresent("meta_ad_account_linked") || isFixturePresent("meta_ad_account_linked", firmId);
  // Go-live deferred — outboundReady stays false unless both fixtures + approved/active (still dark for Arm ads).
  row.outboundReady = false;
  void verified;
  void linked;
  return { ...row };
}

export const standInMetaAds: MetaAdsPort = {
  tag: "stand-in",
  async getCampaign(firmId, campaignId = "camp-default") {
    return ensure(firmId, campaignId);
  },
  async setReview(firmId, review: MetaReviewState) {
    const row = ensure(firmId);
    row.review = review;
    campaigns.set(key(firmId, row.campaignId), row);
    return { ...row, outboundReady: false };
  },
  async setDelivery(firmId, delivery: MetaDeliveryState) {
    const row = ensure(firmId);
    row.delivery = delivery;
    campaigns.set(key(firmId, row.campaignId), row);
    return { ...row, outboundReady: false };
  },
};

export function clearStandInMetaAds(): void {
  campaigns.clear();
}
