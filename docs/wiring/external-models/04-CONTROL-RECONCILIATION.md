# External models — Control reconciliation (hand-back §4)

**Status:** Pass A contract states vs lattice / priors / weak / CT  
**Parent:** [`00-INDEX.md`](./00-INDEX.md) · human-only framing [`HUMAN-ONLY.md`](./HUMAN-ONLY.md)  
**Sources:** [`01-runtime-and-engagement.md`](./01-runtime-and-engagement.md) · [`02-send-enrich-ads.md`](./02-send-enrich-ads.md) · [`03-data-identity-money.md`](./03-data-identity-money.md)

## Method

For every **in-app contract state** promised by Pass A rows (`modelable` **and** `human-only` — readiness chips, deny reasons, status fields named in `modelContract` / prose):

1. Search **lattice** — How · densified SME (`docs/sme/` + `implementationAdds`) · Furnish · Enrichment · surfaceCatalog  
2. Search **priors** — `docs/register/priors/` + `src/app/register/theory/priors/items.ts`  
3. Search **weak** — `docs/register/weak/` + `weakItems.ts`  
4. Search **CT** plant / Ant — note `ct-only` when UI exists but is not lattice-named  

| status | Meaning |
|---|---|
| `latticed` | Named in How / SME densify / Furnish (or Enrichment click-path) |
| `prior` | Interactive control only in Priors inventory |
| `weak` | Only in Weak inventory (lattice foothold, control unnamed) |
| `ct-only` | Rendered in CT plant/Ant; not latticed / prior / weak |
| `gap` | Promised; no control/chip anywhere |

`controlFound` prefers lattice path; else prior id / weak id / CT path / `NONE`.  
Defer-tagged externals are out of scope (no V1 in-app contract).

---

## Reconciliation table

| contractState | promisedBy (ext id) | controlFound (lattice path / CT path / prior id / weak id / NONE) | status | notes |
|---|---|---|---|---|
| `sending_identity_ready` (composite readiness) | `sending-identity-dns` | SME C1 `deliv-07` → Activation state Progress · ready-to-send / auth-green / deliverability-readiness; Send gates | `latticed` | Exact token from Pass A; densify uses `ready-to-send-conjunction` + `auth-green`. Fixture rollup in `HUMAN-ONLY.md`. **CT:** Progress planted; Send gates / Sending infrastructure **not** planted |
| `spf-authorized` | `ext-dns-spf` | SME C1 `deliv-01` → Sending infrastructure Authentication · SPF; Firm operations bind → Send gates Domain authentication | `latticed` | Fixture `dns_spf_published`. **CT:** no Sending infrastructure / Send gates UI |
| `domain-not-ready` (SPF deny) | `ext-dns-spf` | SME C1 `deliv-01` → Send gates SPF-not-ready / domain-not-ready deny chip | `latticed` | Blocks Armed/Active volume |
| `esp-include` / `return-path-spf` chips | `ext-dns-spf` · `ext-dns-return-path` | SME C1 `deliv-01` Authentication panel chips | `latticed` | Return-path SPF include on firm/pool zone |
| `dkim-aligned` | `ext-dns-dkim` | SME C1 `deliv-02` → Sending infrastructure DKIM; Send gates DKIM-aligned identity row | `latticed` | Fixture `dns_dkim_published` |
| `from-d-align` | `ext-dns-dkim` | SME C1 `deliv-02` implementationAdds | `latticed` | From d= alignment |
| `dkim-per-firm` keygen status | `ext-dns-dkim` | SME C1 `deliv-02` Generate DKIM keys + signing status chips | `latticed` | In-app keygen; human publishes DNS |
| `dmarc-present` / `dmarc-p-none-min` / `dmarc-alignment` / `rua` | `ext-dns-dmarc` | SME C1 `deliv-03` Authentication panel DMARC chips; Activation Progress ready-to-send | `latticed` | Fixture `dns_dmarc_published` |
| Return-Path bind / bounce correlate readiness | `ext-dns-return-path` | SME C1 `deliv-20` Envelope panel Return-Path / custom MAIL FROM row | `latticed` | Fixture `dns_return_path_published` |
| `ptr-rdns` readiness (dedicated volume gate) | `ext-dns-ptr-rdns` | SME C1 `deliv-22` → IP pool / ptr-rdns chip; deny dedicated volume until green | `latticed` | Fixture `dns_ptr_published`. **CT:** not planted |
| `postmaster-registered` / FBL feed readiness | `ext-postmaster-fbl` | SME C1 `deliv-12` implementationAdds `postmaster-registered`, `fbl-ingest`, `provider-spam-rate` | `latticed` | Fixture `postmaster_enrolled`; enrollment human; feed modelable after fixture |
| Quarantine / throttle from reputation feed | `ext-postmaster-fbl` · `ext-warmup-signals` · `ext-esp-ip-pool` | SME C1 `deliv-05/11` → Send gates quarantined-identity / complaint-rate deny; Oversight Fleet health chips | `latticed` | Shared readers with warmup / IP pool |
| Warmup stage complete / hold / re-warmup | `ext-warmup-signals` | SME C1 `deliv-06/08/09` → Warmup + Send gates throttle-remaining; Activation ready-to-send | `latticed` | Calendar-time residue human; counters modelable |
| `ip-shared-pool` / `ip-dedicated` / promotion | `ext-esp-ip-pool` | SME C1 `deliv-22` IP pool tier chips | `latticed` | Dedicated + PTR gated |
| ESP accept deny `auth` | `ext-esp-mailer` · `engagement-send-runtime` | SME C1 Send gates auth-green / domain-not-ready / DKIM-aligned deny rows | `latticed` | Maps provider auth reject → densified auth readiness denies |
| ESP accept deny `throttle` | `ext-esp-mailer` | SME C1 `deliv-08/23` Warmup/throttle remaining + adaptive-throttle chips | `latticed` | |
| ESP accept deny `policy` | `ext-esp-mailer` | SME C1 `deliv-10`/`deliv-23` `esp-policy-deny` → Send gates `policy` reason chip "ESP policy reject" | `latticed` | CT `standInSendGate` chips() names `policy` / "ESP policy reject" as a blocking reason distinct from `auth`/`throttle` |
| Delivery lifecycle event classes (accepted/deferred/delivered/bounce/complaint/rejected) | `ext-esp-mailer` · `messaging-provider-ingress` · `ext-webhook-ingress-messaging` | SME C1 `deliv-10/14` delivery-event-schema + webhook-normalize; C7 stream adjacency | `latticed` | Status readers on Firm health / Send gates; not all planted in CT |
| Hard-bounce → global suppress | `ext-esp-mailer` · `suppression-halt-plane` | SME C1 `deliv-10/15` hard-suppress + Send gates global suppression deny | `latticed` | |
| List-Unsubscribe → silence/suppression | `ext-list-unsubscribe-ingress` | How `contact-silence` List-Unsubscribe; SME C1 `deliv-13` one-click + Send gates suppressed deny | `latticed` | |
| SMS registration-ready / throughput remaining | `ext-tcr-a2p` · `ext-sms-api` | SME C1 `deliv-24` Sending infrastructure SMS identity row + Send gates registration-ready / throughput remaining | `latticed` | Fixture `tcr_filed`. **CT:** not planted |
| SMS deny registration / throughput / STOP | `ext-sms-api` | SME C1 `deliv-24` + CASL `sms-stop` / stop-to-suppression | `latticed` | Email warmup green ≠ SMS auth |
| STOP → suppression / silence | `ext-sms-api` · `messaging-provider-ingress` | How `contact-silence`; Furnish STOP instruction; SME casl-11 / deliv-24 | `latticed` | surfaceCatalog `STOP / Unsubscribe instruction` |
| `outbound-ready` / `outbound-dark` (Arm ads gate) | `ext-meta-lead-webhook` · `ext-meta-marketing-api` | SME ads-14 → Approach campaigns Outbound readiness; Arm ads enable | `latticed` | **CT:** Acquisition & ads planted without Arm ads / outbound-ready chips |
| Meta Business / Page verification chips | `ext-meta-business-verification` | SME ads-21 → Account hygiene `verified-business` / `verified-page`; Arm ads fail closed | `latticed` | Fixture `meta_business_verified`. **CT:** Account hygiene not planted |
| Creative / Domain identity match | `ext-meta-business-verification` | SME ads-21 Account hygiene identity rows | `latticed` | Arm ads blocks mismatch |
| Meta campaign review/delivery state chips | `ext-meta-marketing-api` | SME ads-22 `review-state-chip`/`delivery-state-chip` (destination-freeze phases named) → CT Acquisition & ads Campaign review state / Campaign delivery state | `latticed` | **CT:** planted — Review (draft\|in_review\|approved\|rejected) and Delivery (not_started\|scheduled\|active\|paused\|ended) chips + Select controls bound to `wirePorts.metaAds`; outbound-ready stays dark/deferred regardless (ads go-live out of scope) |
| Approach instrumentation proxy aggregates / don’t-understand vs don’t-commit | `ext-meta-insights-export` · `ext-ad-platform-export` | How Approach instrumentation; SME ads-15 + C7 `obs-15` proxy-pair-join | `latticed` | How leaf count cards; densify expands proxies |
| Ad-export coverage failure (keys missing) | `ext-ad-platform-export` | SME C7 `obs-06/15` producer-coverage Missing / proxy-pair key coverage | `latticed` | Fixture `ad_export_authorized`; human auth residue |
| `enrichment-blocked` | `ext-public-web-crawl` · `ext-robots-txt` | SME C5 `fwd-01` In-flight activations enrichment-blocked; How Staging status chips | `latticed` | How `operator-activation` Staging status chips; surfaceCatalog same |
| robots allow/deny path chips | `ext-robots-txt` | SME C5 `fwd-02` robots status chips (allowed/disallowed) | `latticed` | Human residue when site blocks needed paths |
| Brand asset fail-soft / placeholder | `ext-brand-asset-fetch` | SME C5 `fwd-08/09` logo-unconfirmed / neutral-placeholder chips | `latticed` | |
| Send-gate allow/deny + reason chips (consent · silence · suppression · posture · halt) | `send-gate-plane` | How Firm bind / Halt / Silence / Kill-switch readers; SME C1+C2+CASL Send gates panel | `latticed` | How names Send gates as readers; densify names panel + deny chips. **CT:** Armed/Active planted; Send gates panel **not** planted |
| Armed / Active posture | `engagement-send-runtime` · `send-gate-plane` | How `operator-firm-bind` Armed / Active; surfaceCatalog; CT FirmOperationsBind | `latticed` | Also SME desk-02 / C2 armed-prepare-only |
| Enrollment deny: readiness / halt / suppression | `template-enrollment-engine` | SME C2 Send gates enrollment-blocked / unsure-pending; CASL silenced enrollment-inhibitor; Book readiness sequence-ready | `latticed` | Automations Enrollment tab is prior/weak chrome, not the deny chips |
| Halt active (contact / firm-book) | `suppression-halt-plane` · `consultant-halt-refusal` | How `consultant-governance` Confirm halt; surfaceCatalog Halt outreach / Confirm halt; CT Halt modal + haltStore | `latticed` | Fixture `halt_confirmed`. Stand-in `haltStore` wired |
| Halt lift / resume (contact) | `suppression-halt-plane` | prior `board-lift-halt` · `board-resume-outreach` · CT Lift halt / Resume outreach | `prior` | surfaceCatalog labels Lift halt; priors note no How/SME/Furnish click-path |
| Halt resume (firm book) | `suppression-halt-plane` | prior `board-resume-book` · CT Resume book | `prior` | Inverse of firm-book Confirm halt |
| Founder kill-switch halted | `suppression-halt-plane` | How `operator-founder-controls` Kill-switch / Halt motion; Furnish op-furnish-14; CT FounderAgencyControls | `latticed` | prior `op-review-confirmation` is confirm chrome only |
| Stop / hostile / silence / suppress deny sets | `suppression-halt-plane` · `consent-silence-ledger` | How Silence / Opt out; SME C2 intent-stop / hostile-halt; CASL silenced deny; C1 Suppression list | `latticed` | haltStore stand-in does **not** yet unify ESP suppressions |
| Consent Agree / Ignore / Silence snapshot | `consent-silence-ledger` | How `contact-consent` Agree/Ignore; How `contact-silence`; surfaceCatalog | `latticed` | |
| Intent chips booked / question / stop / hostile / unsure | `intent-classifier` | SME C2 `agent-02` Conversations + Engagement record intent chips | `latticed` | **CT:** Engagement record chronology planted; Conversations surface densified, not a CT module yet |
| OOO pause class | `intent-classifier` | SME C2 `agent-06` ooo-pause / paused-OOTO chip | `latticed` | |
| Escalation disposition reclassify \| resume \| close \| keep-suppressed | `escalation-ticket-queue` | SME C2 `agent-19` Ticket / Escalation queue disposition buttons | `latticed` | How Ticket queue latticed; disposition verbs densified |
| Gate posture visible on triage | `send-gate-plane` · `escalation-ticket-queue` | SME C2 `agent-21` Conversations triage-context + Send gates mirror | `latticed` | |
| OTP challenge issued / verify → session | `otp-auth-challenge-store` · `ext-identity-otp-provider` · `ext-otp-mailer` | How `consultant-access` Send code / Verify; surfaceCatalog; CT Login; stand-in otpStore | `latticed` | Wire log LOGIN-OTP |
| OTP deny expired / invalid_code / rate_limited | `ext-identity-otp-provider` · `ext-session-credential-store` | How Login conditions; Enrichment cons-cant-14; Furnish Resend code; CT VerifyFailure expired/mismatch/locked; auth-service contract | `latticed` | Exact API errors in auth-service contract; CT maps distinct reasons |
| Book authorized / book-auth Progress | `ext-crm-oauth-grant` · `ext-crm-connector-api` | How Authorize book / Confirm book for Tower; Activation Progress authorize-book; SME crm-06 `book-authorized`; CT Prepared + ActivationState | `latticed` | Fixture `oauth_granted` for live grant path |
| Grant / Connection stack / Scope summary | `ext-crm-oauth-grant` | SME crm-01/15 Connection stack + Scope summary; How Authorize book Connect CRM | `latticed` | |
| OAuth / grant `revoked` flag | `ext-crm-oauth-grant` | How Authorize book; SME crm-06 `book-authorized`; CT Prepared (plant + Ant) granted/revoked chips + Revoke grant control; stand-in `crmOAuth` | `latticed` | **CT:** planted — Authorize calls `wirePorts.crmOAuth.grant(firmId)`; Revoke grant calls `revoke(firmId)`; Activation state Progress authorize-book row reads `crmOAuth.get(firmId)` (`granted && !revoked`), fail closed |
| Reachable / partial / unreachable verdict chips | `ext-email-validator` · `ext-phone-validator` · `ext-dns-mx-lookup` | How Book readiness Verdict list; Furnish verdict legend; SME C4 validation-class; CT BookReadiness | `latticed` | |
| Sequence-ready (post-audit) | `ext-email-validator` · `consent-silence-ledger` | How Verdict list sequence-ready; Furnish Sequence-ready glance | `latticed` | |
| Escrow `pending_accept` / `failed_hold` / `held` | `ext-payment-kyb-funding` · `ext-escrow-payment-rail` | SME C6 `escmech-03` Escrow status pending_accept / failed_hold / Held; Activation escrow hard-input | `latticed` | Fixture `payment_identity_provisioned`. **CT:** Commercial shows held/release_pending/disputed; pending_accept/failed_hold **not** planted |
| Escrow-held Activation Progress chip | `ext-payment-kyb-funding` · `ext-escrow-payment-rail` | How Activation Progress escrow-held; Accept terms; CT ActivationState + Provision glance | `latticed` | |
| Escrow status machine (release_pending_window · disputed · released · returned · forfeited) | `ext-escrow-payment-rail` | SME C6 status-machine + seat-6 Commercial Escrow status; CT CommercialModule STATUS_LABELS | `latticed` | CT subset of densified vocabulary |
| `counsel_gate` pending / cleared / blocked | `ext-counsel-mt-msb` | SME C6 `escmech-20` Counsel gate chips on Commercial firm row / Escrow status | `latticed` | Fixture `counsel_mt_msb_cleared`. **CT:** counsel_gate chip **not** planted |
| PCI tokenized PM refs only (no PAN) | `ext-pci-tokenization` | SME C6 escmech-19 / Accept custody; provider_payment_identity readers | `latticed` | Contract posture; not a readiness chip UI |
| Honor counsel silence law (ledger effects) | `counsel-silence-law` | How Silence + Send gates + Book readiness silenced; SME CASL silence sticky | `latticed` | No separate “counsel authored” chip; fixture `counsel_policy_authored` is human residue only |
| Publish version / pack immutable version id | `pack-library-store` | How Configuration libraries Publish version; CT Config libraries | `latticed` | |
| Audit trail append readable | `audit-trail-ledger` · `ext-audit-log-store` | How Audit trail Change event list; CT AuditTrail; stand-in auditTrail | `latticed` | |
| Hard-input status (Authorize book · Accept terms) | `ext-crm-oauth-grant` · `ext-payment-kyb-funding` | How Activation Hard-input status; surfaceCatalog; CT ActivationForwardDeploy | `latticed` | |
| Staging status chips (enrich/scrape) | `ext-public-web-crawl` | How Staging status chips; surfaceCatalog; C5 hydrate/enrichment run | `latticed` | |
| Reply-To platform-captured vs firm-monitored | `ext-reply-mailbox-ingress` | SME C1 `deliv-21` Reply-To strategy selector | `latticed` | Firm-monitored path human `reply_route` |

---

## Counts by status

| status | Count |
|---|---|
| `latticed` | **61** |
| `prior` | **2** |
| `weak` | **0** |
| `ct-only` | **0** |
| `gap` | **0** |
| **Total rows** | **63** |

### Focus cluster (requested)

| Cluster | Verdict |
|---|---|
| Sending-identity readiness | `latticed` (C1 ready-to-send / auth-green; composite fixture in HUMAN-ONLY) — **CT:** Activation state Progress ready-to-send row now reads `isSendingIdentityReady(firmId)` fail-closed; Send gates / Sending infrastructure panels still not planted |
| SPF / DKIM / DMARC chips | `latticed` (C1 densify) — not CT-planted |
| TCR / SMS registration + throughput | `latticed` (C1 `deliv-24`) — not CT-planted |
| Meta verification | `latticed` (ads-21 Account hygiene) — not CT-planted |
| Meta review/delivery state | `latticed` (ads-22) + CT Acquisition & ads Campaign review state / Campaign delivery state chips; outbound-ready stays dark |
| Halt | Confirm halt `latticed` + CT wired; lift/resume **`prior`** |
| Escrow held | `latticed` + CT Progress/Commercial; pending_accept/failed_hold densified only |
| Book authorized | `latticed` + CT Prepared/Progress; granted/revoked chips + Revoke grant control planted |
| OTP | `latticed` + CT Login + stand-in |

---

## Gaps

None open — the three §4 gaps below closed this pass (densify + CT wiring):

| contractState | promisedBy | resolution |
|---|---|---|
| ESP accept deny `policy` | `ext-esp-mailer` | C1 `deliv-10`/`deliv-23` name `esp-policy-deny`; CT `standInSendGate` chips() names `policy` reason "ESP policy reject" |
| Meta campaign review/delivery state | `ext-meta-marketing-api` | ads-22 names `review-state-chip`/`delivery-state-chip`; CT Acquisition & ads plants Campaign review state / Campaign delivery state chips + Select controls bound to `wirePorts.metaAds` |
| OAuth / grant `revoked` flag | `ext-crm-oauth-grant` | CT Prepared (plant + Ant) plants granted/revoked chips + Revoke grant control on `wirePorts.crmOAuth`; Activation state Progress reads `granted && !revoked` |

**Gap count: 0**

### Plant debt (not gaps — latticed but absent from CT)

Densified surfaces that Pass A chips hang on, but CT plant/Ant does not yet render:

- **Sending infrastructure** · **Warmup** · **Suppression list** · **Send gates** panel (Firm operations bind)  
- **Account hygiene** · **Arm ads** / outbound-ready  
- **Conversations** / Escalation disposition verbs (beyond Ticket queue shell)  
- Escrow **pending_accept** / **failed_hold** / **counsel_gate** chips on Commercial  
