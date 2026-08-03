# Can'ts + Furnish — paper (Think Stack Enrichment & Furnishing)
**Pass:** over the union Function topology from C1–C7
**Status:** paper only; hung on nodes/edges; no canvas

## A. Can'ts (Enrichment)

### `cant-01` — webhook replay double-counts outcomes
- **Failure mode:** ESP, SMS, payment, or internal retry deliveries are processed twice, inflating rates, suppressions, held balances, or release completions.
- **Where it hangs:** `provider_webhook_receipt` -> `messaging_event_stream`; `payment_webhook_receipt` -> `escrow_ledger_entry`; `release_attempt` -> `payment_webhook_receipt`; `metrics_materialization`
- **Guard to add:** Stable receipt idempotency keys, deterministic fallback keys, duplicate-suppressed receipts, and replay audit entries before any stream append, ledger mutation, or rollup update.
- **Seats implicated:** C1, C2, C6, C7

### `cant-02` — warmup stalls or premature volume opens
- **Failure mode:** A domain/IP sits in stalled warmup without operator visibility, or Activation treats authenticated identity as permission for full-book send volume.
- **Where it hangs:** `sending_domain` -> `warmup_schedule`; `warmup_schedule` -> `send_gate_decision`; `provider_webhook_receipt` -> `warmup_schedule`; `firm_tenancy` -> `engagement_attempt`
- **Guard to add:** Warmup stage SLO, consumed-cap reconciliation, provider-signal advancement rules, and hard cap enforcement before sequence enrollment or provider accept.
- **Seats implicated:** C1, C2, C7

### `cant-03` — stale reference tables used mid-sequence
- **Failure mode:** A sequence continues acting on a score snapshot whose reference version is past freshness or superseded by a current publish.
- **Where it hangs:** `reference_freshness_state` -> `evaluation_pack`; `reference_table_version` -> `re_score_job`; `client_score_snapshot` -> `send_gate_decision`; `sequence_instance`
- **Guard to add:** Freshness-gated evaluation read, version-pin display on score snapshots, and gate recheck when the pack requires published-current freshness.
- **Seats implicated:** C2, C3, C7

### `cant-04` — release on unverified booking
- **Failure mode:** A booked signal opens payment release without attribution, measurement-window stability, or evidence-package validation.
- **Where it hangs:** `outcome_verification_event` -> `attribution_path`; `attribution_path` -> `measurement_window`; `measurement_window` -> `release_evidence_package`; `release_evidence_package` -> `release_attempt`
- **Guard to add:** Require a validated `release_evidence_package` containing outcome, attribution, window, frozen terms, and instrument refs before any provider transfer request.
- **Seats implicated:** C2, C6, C7

### `cant-05` — reputation bleed crosses tenants
- **Failure mode:** Bounce, complaint, quarantine, or throttle state from one firm affects peer firms on a different reputation unit, or hides a global toxic-address block as a firm-local fact.
- **Where it hangs:** `firm_tenancy` -> `reputation_unit`; `outbound_message` -> `reputation_unit`; `reputation_unit` -> `send_gate_decision`; `suppression_list` -> `audit_trail`
- **Guard to add:** Reputation unit keys must include firm/domain/IP tier scope; peer preservation must be auditable; global suppression reasons must be privacy-preserving.
- **Seats implicated:** C1, C4, C7

### `cant-06` — provider outage creates unsafe motion
- **Failure mode:** Email, SMS, enrichment, reference, analytics, or payment provider downtime is interpreted as success, leaving sends, hydrates, re-scores, or releases to proceed on stale or missing external state.
- **Where it hangs:** `provider_throttle_state`; `provider_webhook_receipt`; `payment_webhook_receipt`; `crawl_budget`; `reference_detect_cursor`; `pipeline_health`; `release_attempt`
- **Guard to add:** Outage state closes dependent gates, records provider-class health, distinguishes unavailable from negative outcomes, and requires recovery replay before reopening motion.
- **Seats implicated:** C1, C3, C5, C6, C7

### `cant-07` — suppression race with in-flight send
- **Failure mode:** Opt-out, STOP, hard bounce, complaint, or pass-through suppression lands while a scheduled attempt is already queued, and the provider-bound send still leaves.
- **Where it hangs:** `consent_record` -> `suppression_list`; `provider_webhook_receipt` -> `messaging_event_stream` -> `suppression_list`; `suppression_list` -> `send_gate_decision`; `attempt_job_queue` -> `outbound_message`
- **Guard to add:** Race-boundary cancellation on suppression writes, mandatory final suppression read immediately before provider accept, and nullified attempt chronology.
- **Seats implicated:** C1, C2, C4, C7

### `cant-08` — identity false merge inherits wrong channels
- **Failure mode:** Weak identity hints or concurrent imports merge two people, carrying suppressions, reachable channels, or Q-ID facts across contacts.
- **Where it hangs:** `contact_identity` -> `identity_review_cluster`; `identity_review_cluster` -> `merge_survivorship_policy`; `merge_survivorship_policy` -> `suppression_list`; `book_readiness`
- **Guard to add:** Probabilistic hints create review clusters only; deterministic conflicts hold readiness; confirmed merges use explicit survivorship with suppression OR and provenance.
- **Seats implicated:** C1, C4

### `cant-09` — crawl robots or rate abuse
- **Failure mode:** Forward-deploy enrichment fetches disallowed paths, ignores robots directives, or hammers firm origins and blocks the customer's public site.
- **Where it hangs:** `enrichment_root` -> `crawl_permission`; `crawl_budget` -> `public_fetch_cache`; `crawl_budget` -> `enrichment_fact`; `audit_trail`
- **Guard to add:** Fail-closed robots state, declared crawler identity, per-host rate and backoff, cache reuse inside TTL, and source-visible audit receipts.
- **Seats implicated:** C5

### `cant-10` — late or out-of-order delivery events corrupt timelines
- **Failure mode:** Provider delivery, reply, or booking events arrive after later runtime actions and overwrite current state or produce impossible funnel/order metrics.
- **Where it hangs:** `messaging_event_stream`; `provider_webhook_receipt` -> `correlation_envelope`; `metrics_materialization`; `pipeline_health`; `engagement_record`
- **Guard to add:** Store event time separately from processing time, apply watermarks, recompute within policy, audit late drops/corrections, and present chronology by occurrence time.
- **Seats implicated:** C1, C2, C7

### `cant-11` — escrow dispute freeze ignored
- **Failure mode:** Buyer dispute, chargeback, or provider dispute arrives while a release job is pending, but the release attempt still executes money motion.
- **Where it hangs:** `payment_webhook_receipt` -> `dispute_freeze`; `dispute_freeze` -> `release_attempt`; `release_attempt` -> `provider_payment_identity`; `escrow_ledger_entry`
- **Guard to add:** Active freeze cancels pending release jobs, forces disputed ledger status, and requires evidence/window re-evaluation after clearance before any provider request.
- **Seats implicated:** C6

### `cant-12` — metric definition drifts from shell meaning
- **Failure mode:** A shell tile keeps its label while the formula, taxonomy inputs, window, or primary/diagnostic role changes underneath it.
- **Where it hangs:** `metric_definition` -> `metrics_materialization`; `event_taxonomy` -> `metric_definition`; `funnel_definition`; `audit_trail`
- **Guard to add:** Version every metric and funnel definition, bind materialized values to definition versions, and keep historical shell values on the prior formula.
- **Seats implicated:** C7

### `cant-13` — intent misclassification acts without HITL
- **Failure mode:** Low-confidence, policy-edge, hostile, or ambiguous replies are classified as safe next actions and continue automated sends.
- **Where it hangs:** `conversation_thread` -> `intent_classification`; `intent_classification` -> `engagement_attempt`; `intent_classification` -> `escalation_ticket`; `runtime_tool_invocation`
- **Guard to add:** Confidence floor with `unsure`, automatic pause, escalation ticket creation, and human disposition before resume, reclassify, close, or keep suppression.
- **Seats implicated:** C1, C2

### `cant-14` — token redeem replay opens workspace repeatedly
- **Failure mode:** A no-login workspace token is reused from browser history, referers, or forwarded links after the intended redeem.
- **Where it hangs:** `access_token` -> `redeem_session`; `token_policy`; `prepared_workspace`; `audit_trail`
- **Guard to add:** One-time redeem into short session, hash-only verifier storage, purpose and TTL enforcement, raw secret stripped from navigation, and replay-deny audit.
- **Seats implicated:** C5

### `cant-15` — counsel-blocked MT rail accidentally armed
- **Failure mode:** Engineering rail configuration or provider account setup is mistaken for legal clearance, enabling production MT/MSB posture or client-fund intake.
- **Where it hangs:** `counsel_gate` -> `firm_tenancy`; `provider_payment_identity`; `escrow_ledger_entry`; `audit_trail`
- **Guard to add:** Production rail activation requires explicit `counsel_gate` clearance; pending counsel blocks MT/MSB posture and rejects client-fund intake paths.
- **Seats implicated:** C6

### `cant-16` — reference schema drift publishes bad current
- **Failure mode:** A public reference source changes shape, parse still succeeds partially, and bad rows become published-current.
- **Where it hangs:** `reference_source_binding` -> `ingestion_run`; `ingestion_run` -> `schema_contract`; `schema_contract` -> `reference_table_version`; `audit_trail`
- **Guard to add:** Versioned shape and sanity contracts, draft-side failure on validation mismatch, required provenance, and no publish advancement until dual-check passes.
- **Seats implicated:** C3

### `cant-17` — dependent reference tables publish half a change
- **Failure mode:** Co-dependent table families move at different times, leaving evaluation packs to see a mixed ministerial state.
- **Where it hangs:** `publish_group` -> `reference_table_version`; `reference_table_version` -> `evaluation_pack`; `reference_diff`
- **Guard to add:** Atomic publish groups for dependent families, all-member readiness, group lineage in audit, and pins that never point to partial groups.
- **Seats implicated:** C3

### `cant-18` — re-score collision loses provenance
- **Failure mode:** Fact-write-back and reference-publish triggers collide, creating duplicate signals or one result that hides one trigger cause.
- **Where it hangs:** `client_data_record` -> `re_score_job`; `reference_table_version` -> `re_score_job`; `re_score_job` -> `client_score_snapshot`; `audit_trail`
- **Guard to add:** Contact plus trigger-event idempotency keys, merge-window coalescing, multi-cause result write, and all-cause audit append.
- **Seats implicated:** C3, C4

### `cant-19` — mapping confidence silently mutates facts
- **Failure mode:** Medium/low-confidence field maps or changed Q-ID mappings publish into readiness without human confirmation or map version lineage.
- **Where it hangs:** `source_header_inventory` -> `field_mapping`; `field_mapping` -> `import_batch`; `field_mapping` -> `fact_lineage`; `book_readiness`
- **Guard to add:** Confirm-required state below confidence floor, batch-bound map versions, immutable lineage on promoted facts, and blocked readiness until mapping is published.
- **Seats implicated:** C4

### `cant-20` — channel conflict overwrites armed outreach channel
- **Failure mode:** A new import changes the email or phone on an existing contact and silently replaces the active channel used by pending attempts.
- **Where it hangs:** `contact_identity` -> `channel_conflict`; `channel_conflict` -> `book_readiness`; `merge_survivorship_policy`; `engagement_attempt`
- **Guard to add:** Open channel conflicts hold sequence-ready for affected rows; accept/reject/keep-both decisions are explicit and audit-stamped before channel promotion.
- **Seats implicated:** C2, C4

### `cant-21` — auto-reply finishes a human thread
- **Failure mode:** OOO or machine replies get treated as human intent, closing sequences or triggering next-owner decisions incorrectly.
- **Where it hangs:** `provider_webhook_receipt` -> `messaging_event_stream`; `messaging_event_stream` -> `intent_classification`; `auto_reply_pause`; `sequence_finish_state`
- **Guard to add:** Machine-reply class writes `auto_reply_pause`, holds current owner, and requires resume-window gate recheck rather than finish predicates.
- **Seats implicated:** C2, C7

### `cant-22` — live inbound fails to nullify scheduled motion
- **Failure mode:** A live reply or form visit happens during the retry window, but an already armed send job still fires.
- **Where it hangs:** `messaging_event_stream` -> `engagement_attempt`; `form_activity_event` -> `engagement_attempt`; `engagement_attempt` -> `attempt_job_queue`; `engagement_record`
- **Guard to add:** Race-boundary nullification on live inbound/form evidence, scheduled-send cancellation before policy continuation, and idempotent nullify chronology.
- **Seats implicated:** C2, C7

### `cant-23` — runtime tool bypasses send gates
- **Failure mode:** Agentic decide-to-act selects a send-like or state-changing tool that creates an outbound message without consent, suppression, posture, or deliverability checks.
- **Where it hangs:** `intent_classification` -> `runtime_tool_invocation`; `runtime_tool_invocation` -> `send_gate_decision`; `send_gate_decision` -> `outbound_message`; `audit_trail`
- **Guard to add:** Closed tool set with preconditions, mandatory gate re-entry for send-like actions, no `outbound_message` creation on deny, and tool audit state.
- **Seats implicated:** C1, C2

### `cant-24` — public enrichment stores private or sensitive content
- **Failure mode:** Pre-connect crawl captures authenticated, person-sensitive, or non-public page content and hydrates it into Prepared Workspace.
- **Where it hangs:** `enrichment_fact` -> `public_fact_policy`; `public_fact_policy` -> `prepared_workspace`; `source_provenance`; `audit_trail`
- **Guard to add:** Versioned public-fact allowlist, reject-without-retain for private classes, provenance on accepted facts, and scope enforcement during hydrate.
- **Seats implicated:** C5

### `cant-25` — stale facts or brand package presented as ready
- **Failure mode:** A Prepared Workspace is marked ready even though facts are stale, branding is unconfirmed, or hydration used outdated template/fact bindings.
- **Where it hangs:** `fact_freshness` -> `hydrate_job`; `brand_package` -> `prepared_workspace`; `workspace_readiness`; `engagement_template_version`
- **Guard to add:** Readiness gate must require current fact TTL, accepted or explicit fallback branding, pinned template/fact/brand identifiers, and regenerate lineage.
- **Seats implicated:** C5, C7

### `cant-26` — required merge fields pass as blanks
- **Failure mode:** Hydration silently treats missing required facts as empty copy, producing a workspace that looks complete but is factually hollow.
- **Where it hangs:** `hydrate_job` -> `merge_field_contract`; `merge_field_contract` -> `prepared_workspace`; `workspace_readiness`; `audit_trail`
- **Guard to add:** Merge-field contract fails closed, records missing key names, keeps ready closed, and prevents scoped blocks from rendering as successful content.
- **Seats implicated:** C5

### `cant-27` — high-cardinality metrics explode cost or expose identity
- **Failure mode:** Contact ids, email addresses, message bodies, or raw attempt identifiers become metric labels, creating expensive series and privacy leakage.
- **Where it hangs:** `metric_definition` -> `metrics_materialization`; `messaging_event_stream`; `pipeline_health`
- **Guard to add:** Bounded metric label contract, validation failure before materialization, and high-cardinality detail retained only as stream drill-through ids.
- **Seats implicated:** C7

### `cant-28` — missing producers leave empty shells
- **Failure mode:** A required Sending, Conversations, Booking, Capture, or Prepared Workspace producer never emits, and empty metrics are read as healthy zeroes.
- **Where it hangs:** `event_taxonomy` -> `producer_contract`; `producer_contract` -> `messaging_event_stream`; `pipeline_health`; `metrics_materialization`
- **Guard to add:** Producer coverage by taxonomy owner, required emit-on-path contracts, missing/stale producer incidents, and shell fill marked telemetry-unhealthy.
- **Seats implicated:** C1, C2, C5, C7

### `cant-29` — SMS eligibility inherits email readiness
- **Failure mode:** Email warmup, DKIM, or domain readiness is treated as SMS permission, allowing sends without A2P, carrier throughput, STOP, or phone reachability clearance.
- **Where it hangs:** `sms_sender_registration`; `carrier_throughput_tier`; `sms_reputation_unit`; `warmup_schedule` -> `send_gate_decision`; `reachability_class`
- **Guard to add:** Separate SMS-ready conjunction for registration, throughput, phone validation, STOP/suppression, and carrier reputation; email warmup is non-authorizing.
- **Seats implicated:** C1, C2, C4

### `cant-30` — payment webhook signature failure mutates money state
- **Failure mode:** Spoofed or unverifiable payment callbacks write holds, disputes, refunds, or release completions.
- **Where it hangs:** `payment_webhook_receipt` -> `provider_payment_identity`; `payment_webhook_receipt` -> `held_balance`; `payment_webhook_receipt` -> `dispute_freeze`; `audit_trail`
- **Guard to add:** Signed ingress verification, tenant correlation, idempotency key match, and failure DLQ before provider refs, balances, or ledger status can change.
- **Seats implicated:** C6

### `cant-31` — cap or collar bypass on release/refund
- **Failure mode:** Release, return, or forfeit action moves more money than held principal, remaining cap, or frozen terms allow.
- **Where it hangs:** `held_balance` -> `release_attempt`; `escrow_ledger_entry` -> `release_evidence_package`; `release_attempt` -> `provider_payment_identity`
- **Guard to add:** Amount comparison against held principal and remaining releasable cap before provider request, cap-block state, and no provider ref creation on block.
- **Seats implicated:** C6

### `cant-32` — tenant isolation failure in analytics or money projections
- **Failure mode:** Firm health, Fleet drill-down, escrow status, or stream ids expose another firm's events, balances, or reputation unit facts.
- **Where it hangs:** `firm_tenancy` -> `messaging_event_stream`; `firm_tenancy` -> `metrics_materialization`; `firm_tenancy` -> `escrow_status_read_model`; `audit_trail`
- **Guard to add:** Tenant key required on ingest and materialization, deliberate fleet-rollup scope only, peer-firm drill denial, and rejected access audit.
- **Seats implicated:** C1, C6, C7

### `cant-33` — provider throttle reopens too fast
- **Failure mode:** Deferral pressure clears for one mailbox provider or reputation unit, and the system restores full capacity across unrelated units.
- **Where it hangs:** `provider_webhook_receipt` -> `provider_throttle_state`; `provider_throttle_state` -> `send_gate_decision`; `warmup_schedule`; `reputation_unit`
- **Guard to add:** Provider/unit-scoped backoff, gradual capacity reopen, independent warmup cap respect, and audit of throttle relaxation cause.
- **Seats implicated:** C1, C7

### `cant-34` — cancel/reopen event arrives after release
- **Failure mode:** Meeting canceled or reopened event arrives after measurement-window close or provider release attempt, leaving release state inconsistent.
- **Where it hangs:** `outcome_verification_event` -> `measurement_window`; `measurement_window` -> `release_evidence_package`; `release_attempt`; `escrow_status_read_model`
- **Guard to add:** Event-time window policy, late cancel/reopen audit, release-attempt hold until evidence finality, and explicit exception/dispute state after terminal money motion.
- **Seats implicated:** C2, C6, C7

### `cant-35` — proxy campaign metrics treated as truth
- **Failure mode:** Ad-platform aggregates drive success/kill criteria without first-party capture, workspace, or booking path events.
- **Where it hangs:** `campaign_proxy_aggregate` -> `metrics_materialization`; `producer_contract` -> `messaging_event_stream`; `funnel_definition`; `pipeline_health`
- **Guard to add:** First-party join required for scoreable variants, proxy-only metrics diagnostic, missing campaign/creative keys marked unscoreable.
- **Seats implicated:** C7

### `cant-36` — workspace token authorizes later book motion
- **Failure mode:** A Prepared Workspace preview token is reused to authorize touchpoint continuation, book connection, or sequence motion.
- **Where it hangs:** `access_token` -> `token_policy`; `prepared_workspace`; `sequence_enrollment`; `audit_trail`
- **Guard to add:** Purpose-scoped tokens, distinct touchpoint tokens, preview-only authority after workspace redeem, and deny events when token purpose exceeds scope.
- **Seats implicated:** C2, C5

## B. Furnish (ops nodes that inhabit wiring without changing Function)

### `furnish-01` — webhook dead-letter and replay desk
- **Ops node:** `webhook_dead_letter_replay`
- **Purpose:** DLQ + replay for signed provider ingress, normalization failures, duplicate/replay review, and poison payload isolation.
- **Attaches to Function nodes:** `provider_webhook_receipt`, `payment_webhook_receipt`, `messaging_event_stream`, `pipeline_health`, `audit_trail`
- **Does not change Function:** It observes and replays failed ingress through the same receipt gates; it adds no new domain transition.

### `furnish-02` — re-score job health
- **Ops node:** `re_score_job_health`
- **Purpose:** Job health for queue depth, coalescing collisions, retry age, stuck contacts, and publish/fact-write-back cause coverage.
- **Attaches to Function nodes:** `re_score_job`, `reference_table_version`, `client_data_record`, `client_score_snapshot`, `audit_trail`
- **Does not change Function:** It reports and re-drives existing re-score work without changing evaluation rules or score state.

### `furnish-03` — hydrate job health
- **Ops node:** `hydrate_job_health`
- **Purpose:** Job health for hydrate failures, missing merge keys, stale fact inputs, brand-package waits, and regenerate backlog.
- **Attaches to Function nodes:** `hydrate_job`, `merge_field_contract`, `fact_freshness`, `brand_package`, `prepared_workspace`, `workspace_readiness`
- **Does not change Function:** It watches hydration readiness and retry posture without creating new workspace versions outside `hydrate_job`.

### `furnish-04` — warmup job health
- **Ops node:** `warmup_health_glance`
- **Purpose:** Job health for stage stalls, consumed-vs-allowed cap drift, provider signal absence, and premature reopen attempts.
- **Attaches to Function nodes:** `warmup_schedule`, `provider_webhook_receipt`, `provider_throttle_state`, `send_gate_decision`, `reputation_unit`
- **Does not change Function:** It surfaces warmup posture and anomalies without changing cap logic or send eligibility.

### `furnish-05` — release job health
- **Ops node:** `release_job_health`
- **Purpose:** Job health for pending release, return, forfeit, dispute-canceled, idempotency-key reuse, and provider completion lag.
- **Attaches to Function nodes:** `release_attempt`, `release_evidence_package`, `payment_webhook_receipt`, `dispute_freeze`, `escrow_ledger_entry`, `held_balance`
- **Does not change Function:** It monitors existing release attempts and replay posture without adding release predicates or money states.

### `furnish-06` — reference reconciliation glance
- **Ops node:** `reference_reconciliation_glance`
- **Purpose:** Reconciliation glance for canonical-source drift, sampled replay deltas, stale reference families, and missed verify cadence.
- **Attaches to Function nodes:** `reconciliation_job`, `reference_source_binding`, `reference_table_version`, `reference_freshness_state`, `client_score_snapshot`, `audit_trail`
- **Does not change Function:** It summarizes existing reconciliation and freshness state without publishing tables or changing scores.

### `furnish-07` — per-firm send cost glance
- **Ops node:** `per_firm_send_cost_glance`
- **Purpose:** Per-firm cost / FinOps glance for email/SMS send volume, retries, provider throttle waste, dedicated IP posture, and warmup opportunity cost.
- **Attaches to Function nodes:** `firm_tenancy`, `outbound_message`, `ip_pool_tier`, `carrier_throughput_tier`, `warmup_schedule`, `metrics_materialization`
- **Does not change Function:** It reads existing send and provider-state facts for cost visibility; it does not alter gates, throttles, or sends.

### `furnish-08` — producer coverage glance
- **Ops node:** `producer_coverage_glance`
- **Purpose:** Producer coverage for `messaging_event_stream` by taxonomy event, owner, emitting path, last seen time, and required shell readiness.
- **Attaches to Function nodes:** `producer_contract`, `event_taxonomy`, `messaging_event_stream`, `pipeline_health`, `metrics_materialization`
- **Does not change Function:** It reports missing or stale emitters without inventing events or bypassing producer contracts.

### `furnish-09` — escrow reconciliation glance
- **Ops node:** `escrow_reconciliation_glance`
- **Purpose:** Escrow reconciliation glance for ledger-vs-provider refs, held balance, release/refund/forfeit attempts, dispute freezes, and counsel gate visibility.
- **Attaches to Function nodes:** `escrow_status_read_model`, `escrow_ledger_entry`, `held_balance`, `provider_payment_identity`, `payment_webhook_receipt`, `counsel_gate`
- **Does not change Function:** It compares and displays existing escrow facts without changing ledger status or provider rails.

### `furnish-10` — crawl budget health
- **Ops node:** `crawl_budget_health`
- **Purpose:** Crawl budget health for robots failures, host backoff, cache hit rate, origin errors, blocked paths, and enrichment freshness risk.
- **Attaches to Function nodes:** `crawl_budget`, `crawl_permission`, `public_fetch_cache`, `enrichment_root`, `enrichment_fact`, `fact_freshness`
- **Does not change Function:** It observes crawler posture and retry pressure without changing public-fact policy or hydrate readiness.

### `furnish-11` — pipeline freshness SLO glance
- **Ops node:** `pipeline_freshness_slo_glance`
- **Purpose:** Pipeline freshness SLO glance for producer time, receipt time, stream append lag, materialization lag, late drops, DLQ depth, and stale shell scopes.
- **Attaches to Function nodes:** `pipeline_health`, `messaging_event_stream`, `provider_webhook_receipt`, `metrics_materialization`, `metric_definition`, `audit_trail`
- **Does not change Function:** It displays telemetry health from existing pipeline state without changing metric definitions or materialized values.

### `furnish-12` — identity review backlog glance
- **Ops node:** `identity_review_backlog_glance`
- **Purpose:** Review health for ambiguous identity clusters, channel conflicts, false-merge risk, stuck readiness rows, and survivor-policy decisions.
- **Attaches to Function nodes:** `identity_review_cluster`, `channel_conflict`, `contact_identity`, `merge_survivorship_policy`, `book_readiness`, `audit_trail`
- **Does not change Function:** It surfaces review load and risk without merging, splitting, or promoting identity state.

## Missing seat flags (one-liners)

- C6 remains blocked on counsel for MT/MSB rail posture; `counsel_gate` is a stop, not a substitute for legal clearance.
- C4's deferred incremental sync / vertical CRM OAuth leaves no V1 node for continuous post-land book freshness; future work must not bypass `import_batch`.
- C7's shared `messaging_event_stream` is the cross-cut build that keeps C1/C2/C7 from becoming separate side logs; absence of producer coverage is a capability gap, not only an ops gap.
