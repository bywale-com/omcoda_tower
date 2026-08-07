# Wire log — CRM OAuth grant/revoke · Meta review/delivery chips · Activation readiness

**Status:** wired (stand-in)  
**Implementations:** Authorize book · Campaign review/delivery chips · Activation Progress fail-closed  
**Stand-ins:** `crmOAuth` · `metaAds` · `escrow` · fixture plane  
**Fixtures:** `oauth_granted` (by-design via grant) · Meta Business / ad-account founder (deferred go-live)

## Behavior

1. **Authorize book** → `crmOAuth.grant(firmId)` → fixture `oauth_granted` · chips granted / not revoked.
2. **Revoke grant** → `crmOAuth.revoke` → `revoked: true` · bookAuthorized false.
3. **Meta chips** → `metaAds.setReview` / `setDelivery` · `outboundReady` stays false (ads deferred).
4. **Activation Progress** → reads `isSendingIdentityReady` · oauth · escrow — fail closed.

## codeRefs

| Control | Plant | Ant |
|---|---|---|
| Authorize book | `prototype/PreparedWorkspaceModule.tsx` | `prototype-ant/consultant/PreparedModule.tsx` |
| Meta chips | `prototype/operator/AcquisitionAdsModule.tsx` | `prototype-ant/operator/AcquisitionAdsModule.tsx` |
| Activation state | `prototype/operator/ActivationStateModule.tsx` | `prototype-ant/operator/ActivationStateModule.tsx` |
