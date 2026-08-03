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
1. When SPF authorization verification occurs at `sending_domain`, the domain readiness predicate updates at `send_gate_decision`.
2. When the return-path SPF check is included in that verification at `sending_domain`, bounce-hop authorization state updates at `return_path_domain`.
3. When a firm identity is bound for volume at `sending_identity_binding`, the SPF-ready requirement is attached to that firm's `send_gate_decision`.
4. When a CEM leave is requested at `engagement_attempt`, SPF readiness is consulted before an `outbound_message` can be accepted for send.
5. When SPF is missing or misaligned at `sending_domain`, a domain-not-ready denial is appended at `audit_trail`.
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
1. When per-firm DKIM key provisioning occurs at `dkim_keyset`, signing identity state is linked to the firm's `sending_domain`.
2. When the DKIM d= domain is aligned to the visible From domain at `dkim_keyset`, the authentication predicate updates at `send_gate_decision`.
3. When a firm sending identity is selected at `sending_identity_binding`, the aligned keyset is required for that identity's `from_identity`.
4. When an Opt-in or Nudge leave is requested at `engagement_attempt`, DKIM alignment is stamped onto the candidate `outbound_message`.
5. When aligned signing is unavailable at `dkim_keyset`, the CEM leave is denied at `send_gate_decision` and recorded at `audit_trail`.
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
1. When DMARC discovery occurs at `dmarc_policy`, policy presence, p=none-or-stronger, and rua state update on the associated `sending_domain`.
2. When SPF or DKIM alignment is evaluated for the From domain at `dmarc_policy`, the aligned-domain predicate changes at `send_gate_decision`.
3. When a firm binds a From identity at `sending_identity_binding`, DMARC readiness becomes part of that identity's activation gate at `firm_tenancy`.
4. When Activation requests ready-to-send status at `firm_tenancy`, the DMARC predicate is read from `send_gate_decision`.
5. When DMARC is missing, below minimum, or lacks usable reporting at `dmarc_policy`, ready-to-send remains closed and the denial is appended at `audit_trail`.
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
1. When managed subdomain allocation occurs at `sending_domain`, tenant ownership is written to `firm_tenancy`.
2. When the allocated subdomain is authenticated at `sending_domain`, its SPF, DKIM, and DMARC dependencies update `send_gate_decision`.
3. When the firm chooses that subdomain for sending at `sending_identity_binding`, the visible `from_identity` is scoped to that firm instead of a shared apex.
4. When warmup state is initialized for the new subdomain at `warmup_schedule`, ramp and cap state are attached to the same `sending_domain`.
5. When another firm sends on its own subdomain at `outbound_message`, reputation accounting remains separate at `reputation_unit`.
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
1. When a per-firm subdomain and IP tier are paired for sending at `reputation_unit`, the unit binds to `sending_domain` and `ip_pool_tier`.
2. When delivery outcomes arrive at `provider_webhook_receipt`, hard-bounce and complaint counts update the matching `reputation_unit`. idempotent
3. When threshold evaluation occurs at `reputation_unit`, quarantine or throttle state changes at `send_gate_decision`.
4. When quarantine is applied to one unit at `reputation_unit`, peer firms on other `reputation_unit` records retain their own gate state.
5. When a blocked firm attempts enrollment at `engagement_attempt`, the quarantine denial prevents new `outbound_message` creation and writes the cause to `audit_trail`.
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
1. When a new domain or IP tier is assigned at `sending_domain`, a ramp plan is opened at `warmup_schedule`.
2. When daily unique-recipient and absolute-volume caps are set at `warmup_schedule`, allowed-cap state updates at `send_gate_decision`.
3. When Activation asks whether a firm can send planned volume at `firm_tenancy`, warmup stage is compared with the requested `engagement_attempt` count.
4. When the planned sequence exceeds the current ramp at `engagement_attempt`, full-book enqueue is blocked or capped at `send_gate_decision`.
5. When provider acceptance and complaint signals arrive at `provider_webhook_receipt`, warmup advancement or hold state updates at `warmup_schedule`. idempotent
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
1. When SPF, DKIM, and DMARC predicates are refreshed at `send_gate_decision`, authentication readiness is combined for the firm's `sending_identity_binding`.
2. When warmup capacity is refreshed at `warmup_schedule`, volume-readiness changes at `send_gate_decision`.
3. When reputation quarantine status changes at `reputation_unit`, deliverability readiness changes at `send_gate_decision`.
4. When consent or silence status changes at `consent_record`, legal send eligibility changes at `send_gate_decision`.
5. When Activation evaluates ready-to-send at `firm_tenancy`, commercial readiness and the deliverability gate must both pass before an `engagement_attempt` can become Armed or Active.
6. When the conjunction fails at `send_gate_decision`, the blocked reason is appended at `audit_trail`.
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
1. When the daily cap window opens at `warmup_schedule`, remaining capacity is written to `send_gate_decision`.
2. When a sequence enrollment request occurs at `engagement_attempt`, intended recipients reserve capacity against `warmup_schedule`. within the daily throttle window
3. When reservation fits the remaining cap at `warmup_schedule`, allowed recipients advance toward `outbound_message`.
4. When reservation exceeds the cap at `warmup_schedule`, overflow enrollment is queued or denied at `send_gate_decision`.
5. When an ESP accept event arrives at `provider_webhook_receipt`, consumed capacity updates at `warmup_schedule`. idempotent
6. When the cap state changes at `warmup_schedule`, operators see the same budget from Sending infrastructure and the sequencer through `send_gate_decision`.
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
1. When a domain change occurs at `sending_identity_binding`, the associated `sending_domain` is marked as requiring re-warmup.
2. When an IP tier change occurs at `ip_pool_tier`, the matching `reputation_unit` receives a reputation-reset marker.
3. When an ESP migration or idle-window expiry occurs at `sending_domain`, re-warmup phase state opens at `warmup_schedule`.
4. When re-warmup starts at `warmup_schedule`, tightened volume caps update `send_gate_decision`.
5. When Activation or reactivation requests prior volume at `firm_tenancy`, the old volume right is denied until `warmup_schedule` reaches the required phase.
6. When re-warmup completion occurs at `warmup_schedule`, the tightened cap is lifted at `send_gate_decision`.
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
1. When a provider bounce webhook arrives at `provider_webhook_receipt`, the receipt key prevents duplicate processing. idempotent
2. When bounce classification occurs at `messaging_event_stream`, hard or soft outcome state is normalized for the affected `outbound_message`.
3. When a hard bounce is classified at `messaging_event_stream`, the address is added to `suppression_list` under the configured global or per-tenancy scope.
4. When a soft bounce is classified at `messaging_event_stream`, retry-attempt state changes at `engagement_attempt` within the configured bound.
5. When a future send is requested for that address at `engagement_attempt`, `send_gate_decision` blocks hard-suppressed recipients and permits only bounded soft-bounce retries.
6. When bounce outcomes change eligibility at `suppression_list` or `engagement_attempt`, the reason is appended at `audit_trail`.
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
1. When spam-complaint events arrive at `provider_webhook_receipt`, complaint counts update the matching `reputation_unit`. idempotent
2. When complaint-rate calculation occurs at `reputation_unit`, target and ceiling posture updates at `provider_reputation_feed`.
3. When the rate approaches the operating target at `reputation_unit`, throttle state changes at `send_gate_decision`.
4. When the rate exceeds the ceiling at `reputation_unit`, quarantine state changes at `send_gate_decision`.
5. When an operator or automation attempts new volume at `engagement_attempt`, the complaint kill switch blocks or caps `outbound_message` creation.
6. When throttle or quarantine changes at `send_gate_decision`, the threshold reason is appended at `audit_trail`.
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
1. When Postmaster, FBL, or sender-intelligence registration status is recorded at `provider_reputation_feed`, coverage state updates on the related `sending_domain`.
2. When provider spam-rate or reputation signals are ingested at `provider_reputation_feed`, health indicators update on the matching `reputation_unit`.
3. When a complaint feed event arrives through the provider feed at `provider_webhook_receipt`, the event is normalized at `messaging_event_stream`. idempotent
4. When degraded reputation appears at `provider_reputation_feed`, gate posture changes at `send_gate_decision` before total filtering arrives.
5. When provider-grade reputation state changes at `reputation_unit`, fleet and firm health materialize from the same state rather than from anecdotal complaints.
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
1. When a marketing CEM is composed at `outbound_message`, List-Unsubscribe and List-Unsubscribe-Post header requirements are attached to the message.
2. When the message's From identity is resolved at `from_identity`, the unsubscribe endpoint is scoped to the firm and recipient identity.
3. When a mailbox-provider one-click POST arrives at `provider_webhook_receipt`, the receipt is accepted into the withdrawal path. idempotent
4. When one-click withdrawal is normalized at `messaging_event_stream`, silence state updates at `consent_record`.
5. When silence changes at `consent_record`, a technical deny entry is mirrored at `suppression_list`.
6. When future CEM enrollment occurs at `engagement_attempt`, the suppression deny closes `send_gate_decision`.
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
1. When an ESP or SMS provider webhook arrives at `provider_webhook_receipt`, duplicate receipts are ignored before state changes. idempotent
2. When the provider event is normalized at `messaging_event_stream`, accepted, deferred, hard-bounce, soft-bounce, complaint, delivered, and rejected outcomes attach to the affected `outbound_message`.
3. When accepted or delivered outcomes occur at `messaging_event_stream`, ramp progress changes at `warmup_schedule`.
4. When hard-bounce or complaint outcomes occur at `messaging_event_stream`, deny entries change at `suppression_list`.
5. When deferred, rejected, bounce, or complaint outcomes occur at `messaging_event_stream`, health counters change at `reputation_unit`.
6. When those state changes alter eligibility, `send_gate_decision` updates synchronously enough to govern the next send.
7. When a gate changes because of a delivery event at `send_gate_decision`, the explanation is appended at `audit_trail`.
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
1. When a hard-bounce or spam-complaint outcome is normalized at `messaging_event_stream`, an address-level global deny is written to `suppression_list`.
2. When another firm imports or refreshes the same person at `contact_identity`, the address is matched against `suppression_list`.
3. When Book readiness marks the contact reachable at `book_readiness`, global toxic-address state still overrides at `send_gate_decision`.
4. When Firm B attempts enrollment at `engagement_attempt`, the global suppression prevents `outbound_message` creation.
5. When cross-tenant suppression blocks a send at `send_gate_decision`, the deny reason is appended at `audit_trail` without exposing another firm's private campaign details.
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
1. When opt-out or silence changes at `consent_record`, per-tenancy withdrawal state is mirrored at `suppression_list`.
2. When complaint or hard-bounce outcomes occur at `messaging_event_stream`, per-tenancy or global deny scope changes at `suppression_list`.
3. When Book readiness evaluates permission-to-send at `book_readiness`, reachability stays separate from consent and suppression state.
4. When a CEM enrollment request occurs at `engagement_attempt`, ordered evaluation happens at `send_gate_decision`: consent basis, legal silence, per-tenancy suppression, then global suppression.
5. When any ordered deny closes the gate at `send_gate_decision`, the single visible reason is appended at `audit_trail`.
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
1. When an automated sequence enrollment occurs at `engagement_attempt`, recipient eligibility is checked at `suppression_list` before any `outbound_message` is created.
2. When a manual retry or operator resend occurs at `engagement_attempt`, the same suppression check updates `send_gate_decision`.
3. When an activation first-message path occurs at `engagement_attempt`, the same pre-send gate checks `suppression_list` before provider accept.
4. When a suppressed address is found at `suppression_list`, no provider-bound `outbound_message` is emitted and no force-send override opens `send_gate_decision`.
5. When the blocked-suppressed state changes at `send_gate_decision`, the attempted path and deny reason are appended at `audit_trail`.
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
1. When engagement-age evaluation occurs at `book_readiness`, stale or chronically non-engaging status updates the recipient's `reachability_class`.
2. When role, invalid, abandoned, or chronic non-engagement signals are attached to `contact_identity`, hygiene status changes at `suppression_list` under the firm's scope.
3. When a reactivation burst is proposed at `engagement_attempt`, the hygiene deny is read from `suppression_list` before enrollment.
4. When re-permission is required at `send_gate_decision`, normal sequence volume is blocked until a permitted new engagement path changes `consent_record` or clears the hygiene state.
5. When sunsetting prevents volume at `send_gate_decision`, Firm health explains the stale-list risk through the same state and appends the decision at `audit_trail`.
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
1. When a firm-branded From identity is created at `from_identity`, it binds display name and local-part to the firm's `sending_domain`.
2. When the From domain is authenticated at `sending_domain`, SPF, DKIM, and DMARC alignment requirements update `send_gate_decision`.
3. When the firm binds the identity for CEM use at `sending_identity_binding`, platform shared From is removed from eligible choices for that firm's `outbound_message`.
4. When an Opt-in or Nudge message is composed at `outbound_message`, the firm-branded From identity is applied before Send gates evaluate.
5. When the selected From cannot align at `from_identity`, the CEM leave is denied at `send_gate_decision` and appended at `audit_trail`.
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
1. When a platform bounce subdomain is configured at `return_path_domain`, SPF authorization status links to the sending pool's `sending_domain`.
2. When a firm From identity is bound at `from_identity`, the envelope MAIL FROM remains separate at `return_path_domain`.
3. When a provider accepts an email at `outbound_message`, the Return-Path token maps the message to `engagement_attempt`.
4. When a bounce arrives through the custom MAIL FROM path at `provider_webhook_receipt`, the return token correlates the bounce to `outbound_message`. idempotent
5. When the bounce is classified at `messaging_event_stream`, suppression and reputation updates occur at `suppression_list` and `reputation_unit`.
6. When the correlation changes eligibility, the deliverability event is appended at `audit_trail`.
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
- `audit_trail`
**Facets swept:** Core App/Runtime, Data Storage, External Systems, Identity/Security/Compliance, Infra/Ops

### `deliv-21` — `Reply-To lands on monitored capture`
**Implementation (source):** Sending infrastructure sets Reply-To to a platform-captured or firm-monitored address per bind policy while From stays firm-branded and replies feed Conversations.
**Start:** `Starting from reply_route (new)`
**Path:**
1. When Reply-To strategy is selected at `reply_route`, the monitored address is bound to the firm's `sending_identity_binding`.
2. When a hands-free firm uses platform capture at `reply_route`, incoming replies are routed to `conversation_thread`.
3. When the firm-monitored policy is selected at `reply_route`, the route still records the monitored mailbox expected to feed `conversation_thread`.
4. When an outbound CEM is composed at `outbound_message`, firm-branded From is read from `from_identity` while Reply-To is read from `reply_route`.
5. When a reply arrives at `conversation_thread`, reply intent classification updates at `intent_classification`.
6. When STOP, booked, or question intent is classified at `intent_classification`, downstream conversation and silence paths can act without changing the deliverability From identity.
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
1. When a firm is assigned to a shared pool or dedicated IP at `ip_pool_tier`, the choice binds to that firm's `reputation_unit`.
2. When sustained volume and clean complaint or bounce metrics are evaluated at `reputation_unit`, promotion eligibility changes at `ip_pool_tier`.
3. When dedicated IP assignment occurs at `ip_pool_tier`, a dedicated ramp opens at `warmup_schedule`.
4. When PTR or rDNS hygiene is recorded for the dedicated tier at `ip_pool_tier`, infrastructure readiness updates at `send_gate_decision`.
5. When a firm requests dedicated volume before ramp or rDNS readiness at `engagement_attempt`, volume is denied or capped at `send_gate_decision`.
6. When the IP strategy changes at `ip_pool_tier`, cost exposure and warmup opportunity cost are visible through the same tier state.
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
1. When a 4xx deferral or rate reject arrives at `provider_webhook_receipt`, the provider and reputation-unit outcome is normalized at `messaging_event_stream`. idempotent
2. When deferral pressure is recognized at `messaging_event_stream`, adaptive backoff state changes at `provider_throttle_state`.
3. When backoff state changes at `provider_throttle_state`, capacity and pause state update at `send_gate_decision` for the affected provider, domain, and unit.
4. When calendar-due enrollment occurs at `engagement_attempt`, `send_gate_decision` consults provider backoff before creating `outbound_message`.
5. When the throttle is active at `provider_throttle_state`, retries are delayed instead of storming the provider. within provider backoff window
6. When deferrals clear and acceptance improves at `provider_webhook_receipt`, `provider_throttle_state` relaxes and `send_gate_decision` reopens capacity gradually.
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
1. When A2P brand or campaign registration status changes at `sms_sender_registration`, SMS-ready state updates at `send_gate_decision`.
2. When carrier throughput tier is assigned at `carrier_throughput_tier`, per-window SMS capacity changes at `send_gate_decision`. under carrier throughput window
3. When SMS delivery, undelivered, or complaint events arrive at `provider_webhook_receipt`, carrier reputation state updates at `sms_reputation_unit`. idempotent
4. When STOP or opt-out events arrive at `provider_webhook_receipt`, phone-number deny state changes at `suppression_list`.
5. When a firm-branded SMS send is requested at `engagement_attempt`, `send_gate_decision` requires registration-ready, throughput remaining, SMS reputation acceptable, and suppression clear.
6. When email Warmup is green at `warmup_schedule`, it does not change SMS eligibility at `send_gate_decision`; the SMS path reads only SMS registration, carrier capacity, and STOP/suppression state.
7. When an SMS denial occurs at `send_gate_decision`, the reason is appended at `audit_trail`.
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
