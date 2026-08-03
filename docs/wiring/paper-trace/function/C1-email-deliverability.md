# Function traces — C1 Email / SMS deliverability
**Pass:** Think Stack Wiring Function (paper)
**Source:** ../../sme/capability/C1-email-deliverability.md
**Items:** 24

## Local node list (discovered)

- `sending_domain`
- `dkim_keyset`
- `dmarc_policy`
- `return_path_domain`
- `sending_identity_binding`
- `from_identity`
- `reply_route`
- `ip_pool_tier`
- `reputation_unit`
- `warmup_schedule`
- `send_gate_decision`
- `outbound_message`
- `engagement_attempt`
- `provider_webhook_receipt`
- `messaging_event_stream`
- `provider_reputation_feed`
- `provider_throttle_state`
- `suppression_list`
- `book_readiness`
- `reachability_class`
- `contact_identity`
- `consent_record`
- `conversation_thread`
- `intent_classification`
- `audit_trail`
- `firm_tenancy`
- `sms_sender_registration`
- `sms_reputation_unit`
- `carrier_throughput_tier`

### `deliv-01` — `SPF authorizes every ESP hop`
**Implementation (source):** Sending infrastructure exposes SPF authorization for each domain and Send gates block Armed / Active volume until the ESP and return-path hop pass.
**Start:** `Starting from sending_domain (new)`
**Path:**
1. When SPF authorization verification occurs at `sending_domain`, domain readiness predicate update occurs at `send_gate_decision`.
2. When return-path SPF verification occurs at `sending_domain`, bounce-hop authorization update occurs at `return_path_domain`.
3. When firm identity binding for volume occurs at `sending_identity_binding`, SPF-ready requirement attachment occurs at `send_gate_decision`.
4. When CEM leave request occurs at `engagement_attempt`, provider-accept eligibility update occurs at `outbound_message`.
5. When SPF missing or misaligned status occurs at `sending_domain`, domain-not-ready denial append occurs at `audit_trail`.
**Nodes touched:**
- `sending_domain`
- `return_path_domain`
- `sending_identity_binding`
- `send_gate_decision`
- `engagement_attempt`
- `outbound_message`
- `audit_trail`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Identity/Security/Compliance, Infra/Ops

### `deliv-02` — `DKIM signs with aligned per-firm keys`
**Implementation (source):** Sending infrastructure provisions per-firm branded DKIM keys and Send gates require aligned signing before Opt-in or Nudge messages leave.
**Start:** `Starting from dkim_keyset (new)`
**Path:**
1. When per-firm DKIM key provisioning occurs at `dkim_keyset`, signing identity link occurs at `sending_domain`.
2. When DKIM d= alignment verification occurs at `dkim_keyset`, authentication predicate update occurs at `send_gate_decision`.
3. When firm sending identity selection occurs at `sending_identity_binding`, aligned-key requirement update occurs at `from_identity`.
4. When Opt-in or Nudge leave request occurs at `engagement_attempt`, DKIM alignment stamp occurs at `outbound_message`.
5. When aligned signing unavailable status occurs at `dkim_keyset`, CEM leave denial occurs at `send_gate_decision`.
6. When CEM leave denial occurs at `send_gate_decision`, denial record append occurs at `audit_trail`.
**Nodes touched:**
- `dkim_keyset`
- `sending_domain`
- `sending_identity_binding`
- `from_identity`
- `send_gate_decision`
- `engagement_attempt`
- `outbound_message`
- `audit_trail`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Identity/Security/Compliance, Infra/Ops

### `deliv-03` — `DMARC is mandatory on From domains`
**Implementation (source):** Sending infrastructure shows DMARC record, policy, rua, and alignment status, and Activation stays closed until the bound identity is DMARC-ready.
**Start:** `Starting from dmarc_policy (new)`
**Path:**
1. When DMARC discovery occurs at `dmarc_policy`, policy and rua state update occurs at `sending_domain`.
2. When SPF or DKIM From-domain alignment evaluation occurs at `dmarc_policy`, aligned-domain predicate update occurs at `send_gate_decision`.
3. When firm From identity binding occurs at `sending_identity_binding`, DMARC activation-gate attachment occurs at `firm_tenancy`.
4. When Activation ready-to-send evaluation occurs at `firm_tenancy`, DMARC predicate read occurs at `send_gate_decision`.
5. When DMARC missing or below-minimum status occurs at `dmarc_policy`, ready-to-send closure occurs at `send_gate_decision`.
6. When ready-to-send closure occurs at `send_gate_decision`, denial record append occurs at `audit_trail`.
**Nodes touched:**
- `dmarc_policy`
- `sending_domain`
- `sending_identity_binding`
- `firm_tenancy`
- `send_gate_decision`
- `audit_trail`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Identity/Security/Compliance, Infra/Ops

### `deliv-04` — `Per-firm branded subdomains isolate tenants`
**Implementation (source):** Sending infrastructure allocates a per-firm branded subdomain from the managed pool and Firm operations bind attaches it as that firm's sending identity.
**Start:** `Starting from sending_domain (existing)`
**Path:**
1. When managed subdomain allocation occurs at `sending_domain`, tenant ownership update occurs at `firm_tenancy`.
2. When allocated subdomain authentication occurs at `sending_domain`, auth-dependency update occurs at `send_gate_decision`.
3. When firm subdomain choice occurs at `sending_identity_binding`, firm-scoped From update occurs at `from_identity`.
4. When new-subdomain warmup initialization occurs at `warmup_schedule`, ramp and cap attachment occurs at `sending_domain`.
5. When tenant-scoped send occurs at `outbound_message`, separate reputation accounting occurs at `reputation_unit`.
**Nodes touched:**
- `sending_domain`
- `firm_tenancy`
- `send_gate_decision`
- `sending_identity_binding`
- `from_identity`
- `warmup_schedule`
- `outbound_message`
- `reputation_unit`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Identity/Security/Compliance, Infra/Ops, Cost/FinOps

### `deliv-05` — `Reputation blast radius is isolated`
**Implementation (source):** Sending infrastructure exposes reputation units by subdomain and IP tier, quarantines units on bounce or complaint threshold trips, and gates only the affected firm.
**Start:** `Starting from reputation_unit (new)`
**Path:**
1. When per-firm subdomain and IP-tier pairing occurs at `reputation_unit`, domain and tier binding occurs at `sending_domain`.
2. When delivery outcome receipt occurs at `provider_webhook_receipt`, hard-bounce and complaint counter update occurs at `reputation_unit`. idempotent
3. When threshold evaluation occurs at `reputation_unit`, quarantine or throttle state change occurs at `send_gate_decision`.
4. When one-unit quarantine application occurs at `reputation_unit`, peer gate preservation occurs at `send_gate_decision`.
5. When blocked-firm enrollment attempt occurs at `engagement_attempt`, quarantine denial occurs at `outbound_message`.
6. When quarantine denial occurs at `outbound_message`, cause append occurs at `audit_trail`.
**Nodes touched:**
- `reputation_unit`
- `sending_domain`
- `ip_pool_tier`
- `provider_webhook_receipt`
- `send_gate_decision`
- `engagement_attempt`
- `outbound_message`
- `audit_trail`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Infra/Ops, Cost/FinOps

### `deliv-06` — `New domains and IPs warm up before volume`
**Implementation (source):** Warmup shows a daily recipient and volume ramp for each new domain/IP, and Activation blocks full-book blasts until the stage permits them.
**Start:** `Starting from warmup_schedule (new)`
**Path:**
1. When new domain or IP tier assignment occurs at `sending_domain`, ramp-plan opening occurs at `warmup_schedule`.
2. When daily unique-recipient and absolute-volume cap setting occurs at `warmup_schedule`, allowed-cap update occurs at `send_gate_decision`.
3. When Activation planned-volume check occurs at `firm_tenancy`, warmup-stage comparison occurs at `engagement_attempt`.
4. When planned sequence over-cap status occurs at `engagement_attempt`, full-book block or cap occurs at `send_gate_decision`.
5. When provider acceptance and complaint signal receipt occurs at `provider_webhook_receipt`, warmup advancement or hold update occurs at `warmup_schedule`. idempotent
**Nodes touched:**
- `sending_domain`
- `ip_pool_tier`
- `warmup_schedule`
- `send_gate_decision`
- `firm_tenancy`
- `engagement_attempt`
- `provider_webhook_receipt`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Infra/Ops, Cost/FinOps

### `deliv-07` — `Ready-to-send includes deliverability readiness`
**Implementation (source):** Activation Progress shows deliverability readiness beside consent and commercial readiness, and Send gates require the full conjunction for Armed / Active state.
**Start:** `Starting from send_gate_decision (existing)`
**Path:**
1. When SPF, DKIM, and DMARC predicate refresh occurs at `send_gate_decision`, authentication readiness combination occurs at `sending_identity_binding`.
2. When warmup capacity refresh occurs at `warmup_schedule`, volume-readiness change occurs at `send_gate_decision`.
3. When reputation quarantine status change occurs at `reputation_unit`, deliverability readiness change occurs at `send_gate_decision`.
4. When consent or silence status change occurs at `consent_record`, legal send eligibility change occurs at `send_gate_decision`.
5. When Activation ready-to-send evaluation occurs at `firm_tenancy`, Armed or Active eligibility update occurs at `engagement_attempt`.
6. When readiness conjunction failure occurs at `send_gate_decision`, blocked-reason append occurs at `audit_trail`.
**Nodes touched:**
- `send_gate_decision`
- `sending_identity_binding`
- `warmup_schedule`
- `reputation_unit`
- `consent_record`
- `firm_tenancy`
- `engagement_attempt`
- `audit_trail`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Identity/Security/Compliance, Infra/Ops

### `deliv-08` — `Warmup caps bind the sequencer`
**Implementation (source):** Send gates expose remaining warmup and throttle capacity, enrollment beyond the cap queues or blocks, and Warmup shows consumed versus allowed volume.
**Start:** `Starting from warmup_schedule (existing)`
**Path:**
1. When daily cap window opening occurs at `warmup_schedule`, remaining-capacity update occurs at `send_gate_decision`.
2. When sequence enrollment request occurs at `engagement_attempt`, capacity reservation occurs at `warmup_schedule`. within the daily throttle window
3. When reservation-fit check occurs at `warmup_schedule`, allowed-recipient advancement occurs at `outbound_message`.
4. When reservation-over-cap check occurs at `warmup_schedule`, overflow queue or denial occurs at `send_gate_decision`.
5. When ESP accept event receipt occurs at `provider_webhook_receipt`, consumed-capacity update occurs at `warmup_schedule`. idempotent
6. When cap state change occurs at `warmup_schedule`, shared-budget visibility update occurs at `send_gate_decision`.
**Nodes touched:**
- `warmup_schedule`
- `send_gate_decision`
- `engagement_attempt`
- `outbound_message`
- `provider_webhook_receipt`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Infra/Ops, Cost/FinOps

### `deliv-09` — `Identity changes trigger re-warmup`
**Implementation (source):** Warmup reopens on domain change, IP tier change, ESP migration, or long idle, and Activation and Send gates hold tightened caps until re-warmup completes.
**Start:** `Starting from sending_identity_binding (existing)`
**Path:**
1. When domain change occurs at `sending_identity_binding`, re-warmup marker update occurs at `sending_domain`.
2. When IP tier change occurs at `ip_pool_tier`, reputation-reset marker update occurs at `reputation_unit`.
3. When ESP migration or idle-window expiry occurs at `sending_domain`, re-warmup phase opening occurs at `warmup_schedule`.
4. When re-warmup start occurs at `warmup_schedule`, tightened-cap update occurs at `send_gate_decision`.
5. When prior-volume reactivation request occurs at `firm_tenancy`, old-volume denial occurs at `send_gate_decision`.
6. When re-warmup completion occurs at `warmup_schedule`, tightened-cap lift occurs at `send_gate_decision`.
**Nodes touched:**
- `sending_identity_binding`
- `sending_domain`
- `ip_pool_tier`
- `reputation_unit`
- `warmup_schedule`
- `send_gate_decision`
- `firm_tenancy`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Infra/Ops, Cost/FinOps

### `deliv-10` — `Bounce classification drives eligibility`
**Implementation (source):** Provider webhooks classify hard and soft bounces, hard bounces add suppressions, and soft bounces retry only within bounded attempts visible on firm health.
**Start:** `Starting from provider_webhook_receipt (new)`
**Path:**
1. When provider bounce webhook receipt occurs at `provider_webhook_receipt`, duplicate-processing prevention occurs at `provider_webhook_receipt`. idempotent
2. When bounce classification occurs at `messaging_event_stream`, hard-or-soft outcome normalization occurs at `outbound_message`.
3. When hard-bounce classification occurs at `messaging_event_stream`, scoped address suppression occurs at `suppression_list`.
4. When soft-bounce classification occurs at `messaging_event_stream`, bounded retry-attempt update occurs at `engagement_attempt`.
5. When future send request for that address occurs at `engagement_attempt`, hard-suppression or soft-retry eligibility update occurs at `send_gate_decision`.
6. When bounce eligibility change occurs at `send_gate_decision`, reason append occurs at `audit_trail`.
**Nodes touched:**
- `provider_webhook_receipt`
- `messaging_event_stream`
- `outbound_message`
- `suppression_list`
- `engagement_attempt`
- `send_gate_decision`
- `audit_trail`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Infra/Ops, Cost/FinOps

### `deliv-11` — `Complaint rate is a kill switch`
**Implementation (source):** Oversight and Firm health show complaint rate by reputation unit, and threshold approach or breach throttles or quarantines the affected unit.
**Start:** `Starting from reputation_unit (existing)`
**Path:**
1. When spam-complaint event receipt occurs at `provider_webhook_receipt`, complaint-count update occurs at `reputation_unit`. idempotent
2. When complaint-rate calculation occurs at `reputation_unit`, target and ceiling posture update occurs at `provider_reputation_feed`.
3. When operating-target approach occurs at `reputation_unit`, throttle state change occurs at `send_gate_decision`.
4. When complaint-ceiling breach occurs at `reputation_unit`, quarantine state change occurs at `send_gate_decision`.
5. When new-volume attempt occurs at `engagement_attempt`, complaint kill-switch block or cap occurs at `outbound_message`.
6. When throttle or quarantine change occurs at `send_gate_decision`, threshold-reason append occurs at `audit_trail`.
**Nodes touched:**
- `provider_webhook_receipt`
- `reputation_unit`
- `provider_reputation_feed`
- `send_gate_decision`
- `engagement_attempt`
- `outbound_message`
- `audit_trail`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Infra/Ops, Cost/FinOps

### `deliv-12` — `Postmaster and FBL feeds surface reputation`
**Implementation (source):** Sending infrastructure shows Postmaster and feedback-loop registration, and Oversight / Firm health consume provider spam-rate and reputation signals alongside ESP webhooks.
**Start:** `Starting from provider_reputation_feed (new)`
**Path:**
1. When Postmaster, FBL, or sender-intelligence registration recording occurs at `provider_reputation_feed`, coverage-state update occurs at `sending_domain`.
2. When provider spam-rate or reputation signal ingest occurs at `provider_reputation_feed`, health-indicator update occurs at `reputation_unit`.
3. When complaint feed event receipt occurs at `provider_webhook_receipt`, provider-event normalization occurs at `messaging_event_stream`. idempotent
4. When degraded reputation signal occurs at `provider_reputation_feed`, gate-posture change occurs at `send_gate_decision`.
5. When provider-grade reputation state change occurs at `reputation_unit`, fleet and firm health materialization occurs at `provider_reputation_feed`.
**Nodes touched:**
- `provider_reputation_feed`
- `sending_domain`
- `reputation_unit`
- `provider_webhook_receipt`
- `messaging_event_stream`
- `send_gate_decision`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Identity/Security/Compliance, Infra/Ops, Cost/FinOps

### `deliv-13` — `One-click List-Unsubscribe feeds suppression`
**Implementation (source):** Opt-in and Nudge CEMs emit List-Unsubscribe and List-Unsubscribe-Post headers, and one-click POSTs honor the same withdrawal path as in-body unsubscribe.
**Start:** `Starting from outbound_message (existing)`
**Path:**
1. When marketing CEM composition occurs at `outbound_message`, one-click header attachment occurs at `outbound_message`.
2. When message From identity resolution occurs at `from_identity`, unsubscribe endpoint scoping occurs at `outbound_message`.
3. When mailbox-provider one-click POST receipt occurs at `provider_webhook_receipt`, withdrawal-path acceptance occurs at `provider_webhook_receipt`. idempotent
4. When one-click withdrawal normalization occurs at `messaging_event_stream`, silence state update occurs at `consent_record`.
5. When silence state change occurs at `consent_record`, technical-deny mirror occurs at `suppression_list`.
6. When future CEM enrollment occurs at `engagement_attempt`, suppression-deny gate closure occurs at `send_gate_decision`.
**Nodes touched:**
- `outbound_message`
- `from_identity`
- `provider_webhook_receipt`
- `messaging_event_stream`
- `consent_record`
- `suppression_list`
- `engagement_attempt`
- `send_gate_decision`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Identity/Security/Compliance, Infra/Ops

### `deliv-14` — `Provider webhooks control reputation state`
**Implementation (source):** Delivery-event ingest normalizes accepted, deferred, bounce, complaint, delivered, and rejected events into Warmup, Suppression list, reputation-unit health, and audit explanations.
**Start:** `Starting from provider_webhook_receipt (existing)`
**Path:**
1. When ESP or SMS provider webhook receipt occurs at `provider_webhook_receipt`, duplicate-receipt ignore occurs at `provider_webhook_receipt`. idempotent
2. When provider event normalization occurs at `messaging_event_stream`, delivery outcome attachment occurs at `outbound_message`.
3. When accepted or delivered outcome occurs at `messaging_event_stream`, ramp-progress change occurs at `warmup_schedule`.
4. When hard-bounce or complaint outcome occurs at `messaging_event_stream`, deny-entry change occurs at `suppression_list`.
5. When deferred, rejected, bounce, or complaint outcome occurs at `messaging_event_stream`, health-counter change occurs at `reputation_unit`.
6. When delivery-state eligibility change occurs at `messaging_event_stream`, synchronous gate update occurs at `send_gate_decision`.
7. When delivery-event gate change occurs at `send_gate_decision`, explanation append occurs at `audit_trail`.
**Nodes touched:**
- `provider_webhook_receipt`
- `messaging_event_stream`
- `outbound_message`
- `warmup_schedule`
- `suppression_list`
- `reputation_unit`
- `send_gate_decision`
- `audit_trail`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Infra/Ops, Cost/FinOps

### `deliv-15` — `Hard bounces and complaints suppress globally`
**Implementation (source):** House-global Suppression list applies hard bounces and spam complaints across every tenancy, and Send gates block even when a firm's book marks the contact reachable.
**Start:** `Starting from suppression_list (existing)`
**Path:**
1. When hard-bounce or spam-complaint normalization occurs at `messaging_event_stream`, address-level global deny write occurs at `suppression_list`.
2. When same-person import or refresh occurs at `contact_identity`, suppression address match occurs at `suppression_list`.
3. When reachable contact verdict occurs at `book_readiness`, global toxic-address override occurs at `send_gate_decision`.
4. When cross-tenant enrollment attempt occurs at `engagement_attempt`, global suppression block occurs at `outbound_message`.
5. When cross-tenant suppression block occurs at `send_gate_decision`, privacy-preserving deny reason append occurs at `audit_trail`.
**Nodes touched:**
- `messaging_event_stream`
- `suppression_list`
- `contact_identity`
- `book_readiness`
- `send_gate_decision`
- `engagement_attempt`
- `outbound_message`
- `audit_trail`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Identity/Security/Compliance, Infra/Ops, Cost/FinOps

### `deliv-16` — `Per-tenancy suppression mirrors legal silence`
**Implementation (source):** Send gates show ordered denies from consent basis through per-tenancy and global suppressions, with opt-out, silence, complaints, and hard bounces represented as technical denies.
**Start:** `Starting from consent_record (existing)`
**Path:**
1. When opt-out or silence change occurs at `consent_record`, per-tenancy withdrawal mirror occurs at `suppression_list`.
2. When complaint or hard-bounce outcome occurs at `messaging_event_stream`, per-tenancy or global deny-scope change occurs at `suppression_list`.
3. When permission-to-send evaluation occurs at `book_readiness`, reachability separation occurs at `send_gate_decision`.
4. When CEM enrollment request occurs at `engagement_attempt`, ordered deny evaluation occurs at `send_gate_decision`.
5. When ordered deny closure occurs at `send_gate_decision`, single visible reason append occurs at `audit_trail`.
**Nodes touched:**
- `consent_record`
- `suppression_list`
- `messaging_event_stream`
- `book_readiness`
- `engagement_attempt`
- `send_gate_decision`
- `audit_trail`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Identity/Security/Compliance, Infra/Ops

### `deliv-17` — `Suppression is mandatory before provider accept`
**Implementation (source):** Every automated and manual firm-branded email/SMS path consults Suppression list before provider accept, with blocked-suppressed visible where enrollment would target denied addresses.
**Start:** `Starting from send_gate_decision (existing)`
**Path:**
1. When automated sequence enrollment occurs at `engagement_attempt`, pre-send suppression check occurs at `suppression_list`.
2. When manual retry or operator resend occurs at `engagement_attempt`, suppression-check update occurs at `send_gate_decision`.
3. When activation first-message path occurs at `engagement_attempt`, provider-before-block check occurs at `suppression_list`.
4. When suppressed address match occurs at `suppression_list`, provider-bound message denial occurs at `outbound_message`.
5. When blocked-suppressed state change occurs at `send_gate_decision`, attempted-path deny append occurs at `audit_trail`.
**Nodes touched:**
- `send_gate_decision`
- `engagement_attempt`
- `suppression_list`
- `outbound_message`
- `audit_trail`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Identity/Security/Compliance, Infra/Ops, Cost/FinOps

### `deliv-18` — `Idle and non-engaging addresses age out`
**Implementation (source):** Book readiness and Firm health show sunsetting or chronic non-engagement flags, and Send gates block reactivation bursts unless a new engagement path re-permissions the address.
**Start:** `Starting from book_readiness (existing)`
**Path:**
1. When engagement-age evaluation occurs at `book_readiness`, stale or chronic non-engagement update occurs at `reachability_class`.
2. When role, invalid, abandoned, or chronic non-engagement signal attachment occurs at `contact_identity`, hygiene-status change occurs at `suppression_list`.
3. When reactivation burst proposal occurs at `engagement_attempt`, hygiene-deny read occurs at `suppression_list`.
4. When re-permission requirement occurs at `send_gate_decision`, normal sequence volume block occurs at `engagement_attempt`.
5. When permitted new engagement change occurs at `consent_record`, hygiene-state review occurs at `suppression_list`.
6. When sunsetting volume prevention occurs at `send_gate_decision`, stale-list risk append occurs at `audit_trail`.
**Nodes touched:**
- `book_readiness`
- `reachability_class`
- `contact_identity`
- `suppression_list`
- `engagement_attempt`
- `send_gate_decision`
- `consent_record`
- `audit_trail`
**Facets swept:** Core App/Runtime, Data Storage, Identity/Security/Compliance, Infra/Ops, Cost/FinOps

### `deliv-19` — `Visible From is firm-branded and alignable`
**Implementation (source):** Sending infrastructure sets the firm's From identity to the authenticated branded subdomain, and firm-branded CEMs no longer offer a shared platform From.
**Start:** `Starting from from_identity (new)`
**Path:**
1. When firm-branded From identity creation occurs at `from_identity`, display-name and local-part binding occurs at `sending_domain`.
2. When From-domain authentication occurs at `sending_domain`, alignment requirement update occurs at `send_gate_decision`.
3. When CEM identity binding occurs at `sending_identity_binding`, shared-platform From removal occurs at `outbound_message`.
4. When Opt-in or Nudge message composition occurs at `outbound_message`, firm-branded From application occurs at `from_identity`.
5. When selected-From nonalignment occurs at `from_identity`, CEM leave denial occurs at `send_gate_decision`.
6. When CEM leave denial occurs at `send_gate_decision`, denial append occurs at `audit_trail`.
**Nodes touched:**
- `from_identity`
- `sending_domain`
- `send_gate_decision`
- `sending_identity_binding`
- `outbound_message`
- `audit_trail`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Identity/Security/Compliance, Infra/Ops

### `deliv-20` — `Return-Path is platform-controlled`
**Implementation (source):** Sending infrastructure separates platform-controlled custom MAIL FROM / Return-Path from firm header From, and audit events correlate bounces through that return path.
**Start:** `Starting from return_path_domain (existing)`
**Path:**
1. When platform bounce subdomain configuration occurs at `return_path_domain`, SPF authorization link occurs at `sending_domain`.
2. When firm From identity binding occurs at `from_identity`, envelope MAIL FROM separation occurs at `return_path_domain`.
3. When provider email accept occurs at `outbound_message`, Return-Path token mapping occurs at `engagement_attempt`.
4. When custom MAIL FROM bounce receipt occurs at `provider_webhook_receipt`, return-token correlation occurs at `outbound_message`. idempotent
5. When bounce classification occurs at `messaging_event_stream`, suppression update occurs at `suppression_list`.
6. When bounce classification occurs at `messaging_event_stream`, reputation update occurs at `reputation_unit`.
7. When bounce-correlation eligibility change occurs at `send_gate_decision`, deliverability-event append occurs at `audit_trail`.
**Nodes touched:**
- `return_path_domain`
- `sending_domain`
- `from_identity`
- `outbound_message`
- `engagement_attempt`
- `provider_webhook_receipt`
- `messaging_event_stream`
- `suppression_list`
- `reputation_unit`
- `send_gate_decision`
- `audit_trail`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Identity/Security/Compliance, Infra/Ops

### `deliv-21` — `Reply-To lands on monitored capture`
**Implementation (source):** Sending infrastructure sets Reply-To to a platform-captured or firm-monitored address per bind policy while From stays firm-branded and replies feed Conversations.
**Start:** `Starting from reply_route (new)`
**Path:**
1. When Reply-To strategy selection occurs at `reply_route`, monitored-address binding occurs at `sending_identity_binding`.
2. When platform capture policy occurs at `reply_route`, incoming reply routing occurs at `conversation_thread`.
3. When firm-monitored policy selection occurs at `reply_route`, monitored-mailbox expectation update occurs at `conversation_thread`.
4. When outbound CEM composition occurs at `outbound_message`, firm-branded From read occurs at `from_identity`.
5. When outbound CEM composition occurs at `outbound_message`, Reply-To read occurs at `reply_route`.
6. When reply arrival occurs at `conversation_thread`, reply intent classification update occurs at `intent_classification`.
7. When STOP, booked, or question classification occurs at `intent_classification`, downstream conversation eligibility update occurs at `conversation_thread`.
**Nodes touched:**
- `reply_route`
- `sending_identity_binding`
- `conversation_thread`
- `outbound_message`
- `from_identity`
- `intent_classification`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Identity/Security/Compliance, Infra/Ops

### `deliv-22` — `IP tier follows reputation economics`
**Implementation (source):** Sending infrastructure shows shared versus dedicated IP tier and promotion criteria, while Warmup requires a dedicated-IP ramp and PTR/rDNS hygiene before volume.
**Start:** `Starting from ip_pool_tier (existing)`
**Path:**
1. When shared-pool or dedicated-IP assignment occurs at `ip_pool_tier`, tier binding occurs at `reputation_unit`.
2. When sustained-volume and clean-metric evaluation occurs at `reputation_unit`, promotion eligibility change occurs at `ip_pool_tier`.
3. When dedicated IP assignment occurs at `ip_pool_tier`, dedicated ramp opening occurs at `warmup_schedule`.
4. When PTR or rDNS hygiene recording occurs at `ip_pool_tier`, infrastructure readiness update occurs at `send_gate_decision`.
5. When premature dedicated-volume request occurs at `engagement_attempt`, volume denial or cap occurs at `send_gate_decision`.
6. When IP strategy change occurs at `ip_pool_tier`, cost and warmup opportunity-cost visibility occurs at `ip_pool_tier`.
**Nodes touched:**
- `ip_pool_tier`
- `reputation_unit`
- `warmup_schedule`
- `send_gate_decision`
- `engagement_attempt`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Infra/Ops, Cost/FinOps

### `deliv-23` — `Provider deferrals drive adaptive throttle`
**Implementation (source):** Sending infrastructure exposes per-provider throttle state from deferral or reject signals, and Send gates pause or back off enrollment when ISPs defer.
**Start:** `Starting from provider_throttle_state (new)`
**Path:**
1. When 4xx deferral or rate-reject receipt occurs at `provider_webhook_receipt`, provider and unit outcome normalization occurs at `messaging_event_stream`. idempotent
2. When deferral pressure recognition occurs at `messaging_event_stream`, adaptive backoff state change occurs at `provider_throttle_state`.
3. When backoff state change occurs at `provider_throttle_state`, capacity and pause update occurs at `send_gate_decision`.
4. When calendar-due enrollment occurs at `engagement_attempt`, provider-backoff consult occurs at `send_gate_decision`.
5. When active throttle state occurs at `provider_throttle_state`, retry delay occurs at `engagement_attempt`. within provider backoff window
6. When deferral clear and acceptance improvement occurs at `provider_webhook_receipt`, throttle relaxation occurs at `provider_throttle_state`.
7. When throttle relaxation occurs at `provider_throttle_state`, gradual capacity reopen occurs at `send_gate_decision`.
**Nodes touched:**
- `provider_throttle_state`
- `provider_webhook_receipt`
- `messaging_event_stream`
- `send_gate_decision`
- `engagement_attempt`
- `outbound_message`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Infra/Ops, Cost/FinOps

### `deliv-24` — `SMS has separate carrier reputation`
**Implementation (source):** Sending infrastructure shows SMS brand and campaign registration plus throughput tier, and Send gates require SMS registration, carrier capacity, and STOP/suppression clearance separately from email Warmup.
**Start:** `Starting from sms_sender_registration (new)`
**Path:**
1. When A2P brand or campaign registration status change occurs at `sms_sender_registration`, SMS-ready state update occurs at `send_gate_decision`.
2. When carrier throughput tier assignment occurs at `carrier_throughput_tier`, per-window SMS capacity change occurs at `send_gate_decision`. under carrier throughput window
3. When SMS delivery, undelivered, or complaint event receipt occurs at `provider_webhook_receipt`, carrier reputation state update occurs at `sms_reputation_unit`. idempotent
4. When STOP or opt-out event receipt occurs at `provider_webhook_receipt`, phone-number deny change occurs at `suppression_list`.
5. When firm-branded SMS send request occurs at `engagement_attempt`, SMS eligibility conjunction update occurs at `send_gate_decision`.
6. When email Warmup green status occurs at `warmup_schedule`, SMS eligibility non-authorizing record occurs at `send_gate_decision`.
7. When SMS denial occurs at `send_gate_decision`, denial reason append occurs at `audit_trail`.
**Nodes touched:**
- `sms_sender_registration`
- `carrier_throughput_tier`
- `send_gate_decision`
- `provider_webhook_receipt`
- `sms_reputation_unit`
- `suppression_list`
- `engagement_attempt`
- `warmup_schedule`
- `audit_trail`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Identity/Security/Compliance, Infra/Ops, Cost/FinOps
