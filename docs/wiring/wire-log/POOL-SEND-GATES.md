# Wire log — Pool send + Send gates

**Status:** wired (stand-in)  
**Implementation:** Sending infrastructure pool allocate / auth chips / platform DNS fixture · Firm bind Send gates · Probe CEM leave  
**Stand-ins:** `sendingPool` · `warmup` · `ipPool` · `sendGate` · `espMailer` · `consentSilence` · fixture plane  
**Fixtures:** `dns_*` (pool path, platform-ops) · advisory `esp_account_provisioned` (founder)  
**Real cutover (out of scope):** Resend · house DNS zone · managed IP

## Behavior

1. **Allocate subdomain** → `sendingPool.allocate(firmId, slug)` → per-firm `*.mail.try-tower.com` identity (auth chips stay red).
2. **Mark platform DNS published** → explicit `markPlatformDnsPublished` → SPF/DKIM/DMARC/return-path fixtures → `sending_identity_ready`.
3. **Send gates chips** → `sendGate.chips(firmId)` including **ESP policy reject** (`policy`).
4. **Probe CEM leave** → `sendGate.decide` → on allow `espMailer.send` into stand-in sink (+ accepted event).
5. **Force ESP policy deny** → `setPolicyDenyForced(true)` for CT chip demo.
6. Founder ESP fixture is **advisory** on the fake path; required for real leave (see founder checklist).

## codeRefs

| Control | Plant | Ant |
|---|---|---|
| Sending infrastructure | `prototype/operator/SendingInfrastructureModule.tsx` | `prototype-ant/operator/SendingInfrastructureModule.tsx` |
| Send gates | `prototype/operator/FirmOperationsBindPanel.tsx` | `prototype-ant/operator/FirmOperationsBindModule.tsx` |
| Ports | `src/app/wire/ports.ts` | same |
| Registry | `src/app/wire/registry.ts` | same |
