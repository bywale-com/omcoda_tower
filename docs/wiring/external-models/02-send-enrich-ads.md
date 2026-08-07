# External systems — Send / Enrich / Ads (Pass A)

**Audience:** CTO  
**Think Stack facets:** External Systems (+ Infrastructure & Operations where noted)  
**Zone:** Deliverability / ESP / SMS · Forward-deploy enrichment / scrape · Meta ads · CEM send  
**Status:** Inventory + model contracts only — no stand-in code, no app wiring  
**Parent brief:** [`00-PASS-BRIEF.md`](./00-PASS-BRIEF.md)

## Scope

Accomplishment paths that leave Tower for:

| Zone | Core outcomes that require externals |
|---|---|
| **CEM send + deliverability** | Firm-branded Opt-in / Nudge / reactivation leave through ESP or SMS; Send gates stay honest under auth, warmup, bounce/complaint, suppression |
| **Forward-deploy enrichment** | Public firm URL → robots-honored crawl → firm-facts + brand package → Prepared Workspace hydrate |
| **Meta Approach** | Feed → Instant Form capture → lead ingress → Activation staging; Account hygiene / Arm ads gates |

**Not this zone:** payments/escrow processors, IRCC reference ingest, book-file storage, SSO — other facet files.

## Tag rules (applied here)

| Tag | Meaning in this zone |
|---|---|
| `modelable` | Stand-in can fake the external I/O (send accept, webhook events, crawl responses, Meta lead payloads) before the real system exists |
| `human-only` | Irreducible human / real-world residue (firm DNS publish, TCR filing, Meta Business verification, firm site-admin robots change). Model **only** the in-app side of the contract (readiness chips, deny reasons) |
| `defer` | Not densified enough for V1 CT / KU-blocked (named explicitly) |

**Hard split:** DNS records on a **firm zone** are always `human-only`. ESP/SMS **send + event APIs** are `modelable`. Enrollment in Postmaster/FBL/TCR/Meta Business is `human-only`; ingested feeds/webhooks after enrollment are `modelable`.

---

## Canonical inventory

| id | system | facet | why | sources | modelTag | modelContract |
|---|---|---|---|---|---|---|
| `ext-esp-mailer` | ESP / transactional+bulk mailer (Resend-class) | External Systems | Accepts firm-branded CEM leave after Send gates; returns provider message id; emits delivery lifecycle | C1 `deliv-08/10/14/17/19/20/23`; paper C1; How firm-bind Active / contact Opt-in | `modelable` | **In:** `to`, `from`, `replyTo`, headers (incl. List-Unsubscribe), HTML/text, `firmId`, `sendingIdentityId`, idempotency key. **Out:** `messageId`, `acceptedAt` \| deny (`auth`/`throttle`/`policy`). **Events (push):** accepted, deferred, delivered, hard/soft bounce, complaint, rejected. **Readers:** `outbound_message`, `provider_webhook_receipt`, `warmup_schedule`, `reputation_unit`, `suppression_list`, `send_gate_decision` |
| `ext-dns-spf` | Firm-zone SPF DNS | External Systems + Infra | Authorizes ESP + return-path hops before Armed/Active volume | C1 `deliv-01`; HUMAN `sending_domain` | `human-only` | **Human publishes** SPF TXT (ESP + return-path includes) on firm/pool zone. **In-app only:** probe/readiness → `spf-authorized` \| `domain-not-ready` on `sending_domain` / `send_gate_decision`. No in-app DNS editor. **humanKind:** `by-provisioning` · **fixture:** `dns_spf_published` · **runbook:** `sending-identity` |
| `ext-dns-dkim` | Firm-zone DKIM DNS | External Systems + Infra | Publishes per-firm aligned DKIM selectors so From d= aligns | C1 `deliv-02`; HUMAN `dkim_keyset` | `human-only` | **Human publishes** DKIM TXT/CNAME from generated keys. **In-app:** generate keyset; verify `dkim-aligned` / `from-d-align`; gate CEM leave. Raw private key never leaves signing path. **humanKind:** `by-provisioning` · **fixture:** `dns_dkim_published` · **runbook:** `sending-identity` |
| `ext-dns-dmarc` | Firm-zone DMARC DNS | External Systems + Infra | Bulk-provider bar (≥ p=none + rua + alignment) on From domain | C1 `deliv-03/07`; HUMAN `dmarc_policy` | `human-only` | **Human publishes** `_dmarc` policy + rua. **In-app:** discover/verify record, policy floor, alignment; Activation ready-to-send + Send gates read chips. **humanKind:** `by-provisioning` · **fixture:** `dns_dmarc_published` · **runbook:** `sending-identity` |
| `ext-dns-return-path` | Platform bounce / custom MAIL FROM DNS | External Systems + Infra | Separates envelope Return-Path from firm header From for bounce correlation | C1 `deliv-01/20`; HUMAN `return_path_domain` | `human-only` | **Human/platform ops** publish bounce-subdomain SPF (and MX/delegation as required). **In-app:** bind Return-Path token → `outbound_message`; correlate bounces into `suppression_list` / `reputation_unit`. **humanKind:** `by-provisioning` · **fixture:** `dns_return_path_published` · **runbook:** `sending-identity` |
| `ext-dns-ptr-rdns` | Dedicated-IP PTR / rDNS | Infra + External Systems | Required before dedicated-IP volume; not an in-app DNS surface | C1 `deliv-22`; HUMAN `ip_pool_tier` | `human-only` | **Human/provider** sets PTR at IP host. **In-app:** `ptr-rdns` readiness chip on `ip_pool_tier`; deny dedicated volume until green. **humanKind:** `by-provisioning` · **fixture:** `dns_ptr_published` · **runbook:** `sending-identity` |
| `ext-esp-ip-pool` | ESP shared/dedicated IP pool | External Systems + Infra | Reputation-unit isolation and promotion/demotion economics | C1 `deliv-04/05/22`; paper C1 | `modelable` | **In:** assign tier (`shared`\|`dedicated`), firm/reputation-unit id. **Out:** pool id, warmup binding, promotion eligibility signals. **Readers:** `ip_pool_tier`, `reputation_unit`, `warmup_schedule`. Dedicated procurement approval remains human (see HUMAN set) — stand-in fakes assignment + hygiene flags |
| `ext-warmup-signals` | Warmup acceptance / complaint signal plane (via ESP events) | External Systems + Infra | Advances or holds warmup ramp; binds sequencer caps | C1 `deliv-06/08/09`; HUMAN `warmup_schedule` | `modelable` | **In:** daily caps, stage, identity change/idle triggers. **Out:** consumed vs allowed, stage complete/hold, re-warmup open. Driven by `ext-esp-mailer` / SMS events — no separate vendor required in stand-in. Calendar-time residue is human; counters are modelable |
| `ext-postmaster-fbl` | Google Postmaster / FBL / SNDS-class reputation feeds | External Systems | Provider-grade spam/reputation before total filtering | C1 `deliv-11/12`; HUMAN `provider_reputation_feed` | `human-only` | **Human enrolls** domains in Postmaster/FBL/sender programs. **In-app model of feed after enrollment:** ingest spam-rate / reputation samples → `provider_reputation_feed` → throttle/quarantine on `send_gate_decision`. Stand-in may emit synthetic feed rows; enrollment itself is not faked as “done without human”. **humanKind:** `by-provisioning` · **fixture:** `postmaster_enrolled` · **runbook:** `sending-identity` |
| `ext-list-unsubscribe-ingress` | One-click List-Unsubscribe POST endpoint (mailbox → Tower) | External Systems | RFC 8058 one-click withdrawal into silence/suppression | C1 `deliv-13` | `modelable` | **In:** signed/one-click POST for message/recipient. **Out:** withdrawal accepted → mirror `consent_record` silence + `suppression_list`. Not an ESP product — external actor is the mailbox provider hitting Tower URL |
| `ext-sms-api` | SMS / A2P messaging API (Twilio-class) | External Systems | Firm-branded SMS leave, STOP, delivery/undelivered/complaint events | C1 `deliv-14/17/24`; contact Opt-in/Nudge SMS paths | `modelable` | **In:** `to`, `from`/messaging service, body, `firmId`, idempotency key. **Out:** `messageSid`, accepted \| deny (registration/throughput/STOP). **Events:** queued, sent, delivered, undelivered, failed, `STOP`/opt-out. **Readers:** `outbound_message`, `sms_reputation_unit`, `suppression_list`, `send_gate_decision`. Email warmup green does **not** authorize SMS |
| `ext-tcr-a2p` | TCR / brand / campaign / carrier registration | External Systems + Identity | Carrier-lawful A2P identity + throughput tier before SMS volume | C1 `deliv-24`; HUMAN `sms_sender_registration`, `carrier_throughput_tier` | `human-only` | **Human files** brand/campaign with TCR/carriers. **In-app only:** registration status + throughput remaining chips; SMS Send gates fail closed until approved. Stand-in may simulate status transitions for CT after a human-marked “filed” fixture — does not invent real TCR approval. **humanKind:** `by-provisioning` · **fixture:** `tcr_filed` · **runbook:** `sending-identity` |
| `ext-webhook-ingress-messaging` | Signed ESP/SMS webhook ingress | External Systems + Infra | Spine of reputation control + shared C1/C7 stream | C1 `deliv-10/14`; C7 `obs-06`; paper C1/C7 | `modelable` | **In:** provider-signed payload + idempotency key. **Out:** `provider_webhook_receipt` (accept/reject signature) → normalized classes on `messaging_event_stream` (accepted, deferred, bounce hard/soft, complaint, delivered, rejected, SMS STOP). Synchronous-enough updates to Warmup, Suppression, reputation units, Send gates |
| `ext-public-web-crawl` | Public-web crawl / scrape host (firm origins) | External Systems + Infra | Fetches public pages for firm-facts enrichment at Approach scale | C5 `fwd-01/05/06/07`; How activation forward-deploy | `modelable` | **In:** verified `enrichment_root` URL, enrichment UA + contact URI, per-host rate, cache TTL. **Out:** HTTP status, body, headers (ETag/Last-Modified), fetched-at. **Readers:** `enrichment_fact`, `public_fetch_cache`, `crawl_budget`, `fact_freshness`. Stand-in serves fixture sites; polite backoff + cache mandatory |
| `ext-robots-txt` | robots.txt / crawl-directive host | External Systems | Fail-closed path permission before content fetch | C5 `fwd-02`; HUMAN `crawl_permission` | `modelable` | **In:** root + enrichment UA. **Out:** allow/deny path set recorded on `crawl_permission`. Disallowed paths never populate `enrichment_fact`. **Human-only residue:** when required public paths are blocked, firm/site-admin must change robots (HUMAN set) — in-app shows enrichment-blocked, does not bypass |
| `ext-brand-asset-fetch` | Public brand asset fetch (logo/OG/icons/CSS theme) | External Systems | Logo chain, palette surfaces, attributable assets for brand package | C5 `fwd-08/09/11` | `modelable` | **In:** candidate asset URLs from allowlisted public pages. **Out:** bytes/metadata, content-type, source-in-chain tag, or fail-soft placeholder. **Readers:** `brand_extract`, `brand_package`. Never fabricates marks; Om Coda marks forbidden as firm face |
| `ext-listing-places-api` | GBP / Places / public listing API | External Systems | Secondary public facts with provenance vs firm site | C5 `fwd-04` | `modelable` | **In:** place/listing id bound to `enrichment_root`. **Out:** listing-native fields (hours, pin, phone, photos) + provenance. Prefer firm-site on conflict except listing-native. Optional in CT if fixtures cover site-only path; contract kept because densified |
| `ext-meta-marketing-api` | Meta Marketing API (campaigns, ads, Instant Forms, delivery) | External Systems | Publishes Approach supply configured in Tower; no Meta UI inside Tower | Impl `05` ads-01…25; How `operator-acquisition` | `modelable` | **In:** creative/claim-bound copy, Capture strip (name, website, channel), privacy URL, Instant Form config, destination freeze pin, performance goal intent, arm/pause. **Out:** campaign/ad/form ids, review/delivery state, impression/form-open proxies (or link to insights). **Readers:** Approach campaigns, Account hygiene chips, Arm ads gate (`outbound-ready`). Stand-in refuses forbidden claim shapes / never-ask fields locally before “publish” |
| `ext-meta-lead-webhook` | Meta leadgen webhook / lead pull ingress | External Systems + Infra | Near-real-time seed capture → Activation In-flight | Impl ads-06/14/25; How acquisition → activation | `modelable` | **In:** signed lead payload (name, website, channel) + lead id; or pull-by-id. **Out:** seed row for Activation staging; purpose-lock = activation-walkthrough-only. **Readers:** In-flight activations, first-agent-text readiness. Arm ads stays dark while lead pull path offline |
| `ext-meta-business-verification` | Meta Business / Page verification & account hygiene | External Systems + Identity | Scam-category watch; Arm ads blocked on inconsistent identity | Impl ads-21; HUMAN adjacency via real Meta Settings | `human-only` | **Human completes** Business/Page verification in Meta. **In-app:** sync verification chips + Creative/Domain identity match; deep link “Open in Meta Business Settings”; Arm ads fail closed on mismatch. Stand-in can fixture chip states; cannot mint real Meta verification. **humanKind:** `by-provisioning` · **fixture:** `meta_business_verified` · **runbook:** `sending-identity` |
| `ext-meta-insights-export` | Meta insights / proxy aggregate export | External Systems | don’t-understand vs understand-don’t-commit instrumentation | Impl ads-15/16/17/19; C7 `campaign_proxy_aggregate` | `modelable` | **In:** campaign/creative ids, time window, authorized export. **Out:** impression, form-open, intro-complete, abandon, submit, continue-scroll aggregates joined first-party. **Human residue:** ad-account export authorization when required (HUMAN `campaign_proxy_aggregate`). Stand-in emits proxy tables for CT |
| `ext-reply-mailbox-ingress` | Inbound reply capture (platform mailbox / provider inbound) | External Systems | Reply-To monitored path for Conversations / intent (STOP, booked, question) | C1 `deliv-21`; C2 adjacency | `modelable` | **In:** inbound MIME/SMS reply to platform-captured address. **Out:** append to `conversation_thread` → `intent_classification`. **Human-only when** firm-monitored Reply-To: firm must authorize forwarding/delegation (HUMAN `reply_route`); in-app records policy only |
| `ext-mailbox-provider-plane` | Gmail/Yahoo/Microsoft receive & deferral plane | External Systems | Adaptive throttle from 4xx deferrals/rejects; complaint economics | C1 `deliv-11/23` | `defer` | Not a direct Tower integration — experienced via ESP webhooks + Postmaster feeds. No separate stand-in vendor in V1; covered by `ext-esp-mailer` event dialect + `ext-postmaster-fbl`. Named so throttle/complaint accomplishments are not forgotten |

---

## Sections by system

### 1. ESP / mailer — `ext-esp-mailer` (`modelable`)

**Accomplishment:** After Send gates clear (auth + warmup + suppression + consent), CEM Opt-in / Nudge / sequence steps call the mailer; Tower must not treat “queued in sequencer” as delivered.

**Contract sketch (stand-in):**

```
sendEmail(req) → { messageId } | { error: auth|throttle|policy|validation }
webhooks → delivery-event-schema
```

**Must exercise in CT:** hard-bounce → global suppress; complaint → quarantine path; deferred → adaptive throttle; List-Unsubscribe headers present on marketing CEMs.

---

### 2. DNS auth (SPF / DKIM / DMARC / Return-Path / PTR) — human-only cluster

| id | Human publishes | In-app models |
|---|---|---|
| `ext-dns-spf` | SPF includes | pass/fail readiness |
| `ext-dns-dkim` | DKIM TXT/CNAME | keygen + alignment verify |
| `ext-dns-dmarc` | `_dmarc` ≥ p=none + rua | policy/alignment chips |
| `ext-dns-return-path` | bounce subdomain auth | Return-Path bind + bounce correlate |
| `ext-dns-ptr-rdns` | PTR at IP provider | dedicated-volume gate |

**Rule:** CT may fixture “DNS green/red” chips and deny Armed volume; it must never pretend Tower wrote firm-zone records.

---

### 3. Warmup + reputation feeds

| id | Tag | Notes |
|---|---|---|
| `ext-warmup-signals` | `modelable` | Caps bind sequencer (`deliv-08`); re-warmup on identity change/idle |
| `ext-postmaster-fbl` | `human-only` | Enrollment human; feed samples modelable after fixture “enrolled” |
| `ext-esp-ip-pool` | `modelable` | Shared default; dedicated + PTR gated |

---

### 4. SMS + TCR

| id | Tag | Notes |
|---|---|---|
| `ext-sms-api` | `modelable` | Parallel reputation domain; STOP → suppression |
| `ext-tcr-a2p` | `human-only` | Brand/campaign/throughput filing — irreducible |

SMS send is **not** `defer`: densified in C1 `deliv-24` and contact How leaves. TCR filing remains human-only.

---

### 5. Messaging webhook ingress — `ext-webhook-ingress-messaging` (`modelable`)

Shared spine for ESP + SMS. Signature verify → idempotent receipt → normalize → `messaging_event_stream`. C1 control plane and C7 rollups consume the **same** facts (`obs-06`).

Also covers mailbox one-click POST via `ext-list-unsubscribe-ingress` (Tower-owned URL, external caller).

---

### 6. Forward-deploy crawl / robots / brand assets

| id | Tag | Accomplishment |
|---|---|---|
| `ext-public-web-crawl` | `modelable` | Origin fetch under rate/cache/UA |
| `ext-robots-txt` | `modelable` (+ human if site blocks needed paths) | Fail-closed path gate |
| `ext-brand-asset-fetch` | `modelable` | Logo/palette/voice surfaces |
| `ext-listing-places-api` | `modelable` | Secondary GBP/listing facts |

Hydrate job, tokens, Prepared Workspace immutability are **in-app** (not externals). Token **delivery** rides `ext-sms-api` / `ext-esp-mailer`.

---

### 7. Meta ads + lead ingress

| id | Tag | Accomplishment |
|---|---|---|
| `ext-meta-marketing-api` | `modelable` | Publish/arm Approach from Tower config |
| `ext-meta-lead-webhook` | `modelable` | Seed → In-flight activations; outbound-ready gate |
| `ext-meta-business-verification` | `human-only` | Real Business/Page verification |
| `ext-meta-insights-export` | `modelable` | Instrumentation proxies / kill-continue |

**Defer notes (not separate externals):** `ads-09` (phone vs email channel on Meta) and `ads-18` (targeting realism / Special Ad) remain NEEDS VERIFICATION — do not invent How leaves or targeting APIs here.

---

### 8. Reply path

| id | Tag | Notes |
|---|---|---|
| `ext-reply-mailbox-ingress` | `modelable` | Platform-captured Reply-To |
| Firm-monitored Reply-To | `human-only` (via HUMAN `reply_route`) | Mailbox forward/delegation |

---

## Counts by `modelTag`

| modelTag | Count | ids |
|---|---|---|
| `modelable` | **14** | `ext-esp-mailer`, `ext-esp-ip-pool`, `ext-warmup-signals`, `ext-list-unsubscribe-ingress`, `ext-sms-api`, `ext-webhook-ingress-messaging`, `ext-public-web-crawl`, `ext-robots-txt`, `ext-brand-asset-fetch`, `ext-listing-places-api`, `ext-meta-marketing-api`, `ext-meta-lead-webhook`, `ext-meta-insights-export`, `ext-reply-mailbox-ingress` |
| `human-only` | **8** | `ext-dns-spf`, `ext-dns-dkim`, `ext-dns-dmarc`, `ext-dns-return-path`, `ext-dns-ptr-rdns`, `ext-postmaster-fbl`, `ext-tcr-a2p`, `ext-meta-business-verification` |
| `defer` | **1** | `ext-mailbox-provider-plane` |
| **Total** | **23** | |

Human-only rows still carry an **in-app contract** (readiness/deny chips); Pass B stand-ins must not claim the human publish/filing step succeeded without a fixture marked human-provided.

---

## Proposed stand-in module names (Pass B hint — not built here)

| External id | Suggested stand-in |
|---|---|
| `ext-esp-mailer` + webhook | `standin.esp` |
| `ext-sms-api` + webhook | `standin.sms` |
| DNS readiness cluster | `standin.dns-readiness` (fixture chips only) |
| `ext-postmaster-fbl` | `standin.reputation-feed` |
| Crawl + robots + assets | `standin.public-crawl` |
| `ext-listing-places-api` | `standin.listings` |
| Meta marketing + leads + insights | `standin.meta-ads` |
| Reply ingress | `standin.reply-inbox` |

---

## Source index

| Source | Use |
|---|---|
| [`../CTO-THINK-STACK.md`](../CTO-THINK-STACK.md) | Facet landing: deliverability → External + Infra |
| [`../../sme/capability/C1-email-deliverability.md`](../../sme/capability/C1-email-deliverability.md) | ESP/SMS/auth/warmup/suppression |
| [`../../sme/capability/C5-forward-deploy-generation.md`](../../sme/capability/C5-forward-deploy-generation.md) | Crawl/robots/brand |
| [`../../sme/implementation/05-platform-ads-meta-trust.md`](../../sme/implementation/05-platform-ads-meta-trust.md) | Meta Approach / Instant Form / Arm ads |
| [`../paper-trace/function/C1-email-deliverability.md`](../paper-trace/function/C1-email-deliverability.md) | Send-path nodes |
| [`../paper-trace/function/C5-forward-deploy-generation.md`](../paper-trace/function/C5-forward-deploy-generation.md) | Enrichment nodes |
| [`../paper-trace/HUMAN-PROVISIONING-SET.md`](../paper-trace/HUMAN-PROVISIONING-SET.md) | DNS, TCR, Postmaster, robots, Meta export auth |
| [`../../register/how/operator-acquisition.md`](../../register/how/operator-acquisition.md) | Meta external intent |
| [`../../register/how/operator-activation.md`](../../register/how/operator-activation.md) | Enrich/scrape after Hydrate |
| [`../../register/how/operator-firm-bind.md`](../../register/how/operator-firm-bind.md) | Armed/Active → CEM execution |
| [`../../register/how/contact-consent.md`](../../register/how/contact-consent.md) | Firm-branded Opt-in send channel |

---

## Human-only annotations

Framing only — Pass A tags unchanged. Canonical table + sending-identity runbook: [`HUMAN-ONLY.md`](./HUMAN-ONLY.md).

| id | humanKind | fixture | runbook |
|---|---|---|---|
| `ext-dns-spf` | `by-provisioning` | `dns_spf_published` | `sending-identity` |
| `ext-dns-dkim` | `by-provisioning` | `dns_dkim_published` | `sending-identity` |
| `ext-dns-dmarc` | `by-provisioning` | `dns_dmarc_published` | `sending-identity` |
| `ext-dns-return-path` | `by-provisioning` | `dns_return_path_published` | `sending-identity` |
| `ext-dns-ptr-rdns` | `by-provisioning` | `dns_ptr_published` | `sending-identity` |
| `ext-postmaster-fbl` | `by-provisioning` | `postmaster_enrolled` | `sending-identity` |
| `ext-tcr-a2p` | `by-provisioning` | `tcr_filed` | `sending-identity` |
| `ext-meta-business-verification` | `by-provisioning` | `meta_business_verified` | `sending-identity` |

**Sequence (one per-firm runbook):** DNS auth (SPF→DKIM→DMARC) → return-path/PTR → reputation enrollment (Postmaster/FBL) → registration/verification (TCR, Meta Business).
