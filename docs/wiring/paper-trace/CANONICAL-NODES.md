# Canonical nodes — Function paper traces

This registry is the fusion key for the Function paper traces (C1-C7). It fuses duplicate local nouns where the traces act on the same named state; classification of flows and triggers is deferred to `WIRING-METHOD`.

## Registry

| Node | Definition (one line) | Altitude | Seats | Existence bucket | Human-provisioning dependency (or —) |
|---|---|---|---|---|---|
| `sending_domain` | Branded sending domain or subdomain authentication, ownership, warmup, and reputation binding state. | provider-state | C1, C7 | mixed | DNS delegation on firm's zone, or pool subdomain attach, SPF/DKIM publish, warmup calendar-time — human |
| `dkim_keyset` | Per-firm DKIM signing key and alignment state. | provider-state | C1 | mixed | DNS TXT/CNAME publish or domain-control verification on the firm zone — human |
| `dmarc_policy` | From-domain DMARC discovery, policy, rua, and alignment state. | provider-state | C1 | mixed | DMARC DNS policy and reporting address publish on the firm From domain — human |
| `return_path_domain` | Platform-controlled custom MAIL FROM / Return-Path domain and bounce correlation state. | provider-state | C1 | mixed | Custom MAIL FROM / return-path DNS and bounce-domain delegation — human |
| `sending_identity_binding` | Firm-to-sending-domain/from-identity binding and readiness dependency state. | provider-state | C1 | mixed | Firm-approved sending domain and From identity, with completed domain authentication — human |
| `from_identity` | Firm-branded visible From display name, local part, and alignable domain binding. | provider-state | C1 | mixed | Firm-approved From name, local part, and alignable domain choice — human |
| `reply_route` | Reply-To strategy and monitored capture or firm-monitored mailbox routing state. | provider-state | C1 | mixed | Firm mailbox forwarding/delegation or monitored Reply-To authorization when not platform-captured — human |
| `ip_pool_tier` | Shared or dedicated IP tier, promotion, PTR/rDNS, and warmup assignment state. | provider-state | C1 | mixed | Dedicated IP procurement / provider approval when a dedicated tier is required — human |
| `reputation_unit` | Bounce, complaint, quarantine, and throttle reputation accounting unit for a firm/domain/IP tier. | provider-state | C1, C7 | agent-codeable | — |
| `warmup_schedule` | Domain/IP ramp plan, daily caps, phase, consumed capacity, and re-warmup state. | provider-state | C1, C7 | mixed | Calendar-time warmup and receiver acceptance signals — human |
| `send_gate_decision` | Allow/deny and reason state for outbound motion, CEM leave, posture, consent, suppression, and deliverability gates. | table | C1, C2, C3, C7 | agent-codeable | — |
| `outbound_message` | Message instance requested, accepted, denied, or sent through the outbound channel path. | table | C1, C2, C7 | agent-codeable | — |
| `engagement_attempt` | One-owner attempt, retry, handoff, pause, nullify, and gate-result state. | table | C1, C2, C7 | agent-codeable | — |
| `provider_webhook_receipt` | Signed messaging-provider ingress receipt, normalization outcome, and idempotency key state. | table | C1, C2, C7 | agent-codeable | — |
| `messaging_event_stream` | Shared append-only send, delivery, reply, form, classify, act, and booking-path event stream. | stream | C1, C2, C7 | agent-codeable | — |
| `provider_reputation_feed` | Postmaster, feedback-loop, spam-rate, sender-intelligence, and provider reputation signal state. | provider-state | C1 | mixed | Postmaster/FBL enrollment and domain verification where the provider requires it — human |
| `provider_throttle_state` | Adaptive provider backoff, pause, and gradual-capacity reopen state from deferrals or rejects. | provider-state | C1 | agent-codeable | — |
| `suppression_list` | Hard-bounce, complaint, opt-out, silence, hostile, hygiene, and pass-through do-not-contact deny entries. | table | C1, C2, C4, C7 | agent-codeable | — |
| `book_readiness` | Authorize-book readiness verdict state for reachable, partial, blocked, or audit-ready rows. | table | C1, C3, C4 | agent-codeable | — |
| `reachability_class` | Email or phone validation class result for syntax, MX/domain, mailbox, line type, or reachability. | table | C1, C4 | agent-codeable | — |
| `contact_identity` | Deduped stable person identity and deterministic match-key/upsert state. | table | C1, C4 | agent-codeable | — |
| `consent_record` | Legal consent, silence, opt-out, and channel-scope permission state. | table | C1, C2 | agent-codeable | — |
| `conversation_thread` | Live reply thread, triage status, and channel conversation state. | table | C1, C2, C7 | agent-codeable | — |
| `intent_classification` | Closed-set reply intent result, confidence, and terminal/unsure classification state. | table | C1, C2 | agent-codeable | — |
| `audit_trail` | Append-only event log for provenance, gate outcomes, definition changes, and operator-reviewable decisions. | ledger | C1, C2, C3, C4, C5, C6, C7 | agent-codeable | — |
| `firm_tenancy` | Tenant boundary, firm ownership, Armed/Active posture, and query isolation state. | table | C1, C2, C3, C4, C5, C6, C7 | agent-codeable | — |
| `sms_sender_registration` | A2P brand or campaign registration status and SMS-ready state. | provider-state | C1 | human-provisioning | TCR/brand/campaign registration — human |
| `sms_reputation_unit` | SMS delivery, undelivered, complaint, and carrier reputation state. | provider-state | C1 | agent-codeable | — |
| `carrier_throughput_tier` | SMS carrier throughput window and capacity tier state. | provider-state | C1 | mixed | Carrier/TCR throughput tier approval — human |
| `engagement_record` | Read-only chronology and attribution record for runtime, classification, gate, escalation, and finish events. | ledger | C2, C7 | agent-codeable | — |
| `escalation_ticket` | Human-in-the-loop queue item for unsure, hostile, policy-edge, or support escalation work. | table | C2 | agent-codeable | — |
| `sequence_enrollment` | Enrollment and next-sequence armed state under campaign or runtime policy. | table | C2 | agent-codeable | — |
| `sequence_instance` | Runtime sequence instance with active owner, close/arm, and posture-scoped state. | table | C2 | agent-codeable | — |
| `sequence_rule_set` | Authored owner order, criteria rules, successor, and attempt law loaded by runtime. | table | C2 | agent-codeable | — |
| `campaign_calendar` | Day-ordered campaign phase and content eligibility state before runtime sequence ownership. | table | C2 | agent-codeable | — |
| `criteria_window` | Authored evidence window state for non-reply escalation or owner transition criteria. | table | C2 | agent-codeable | — |
| `attempt_job_queue` | Scheduled attempt jobs and cancellation state for same-owner retries or escalations. | queue-job | C2 | agent-codeable | — |
| `sequence_finish_state` | Booked, stop, form-submitted, no-reply, or human-close predicate state that closes a sequence. | table | C2 | agent-codeable | — |
| `auto_reply_pause` | Out-of-office or machine-reply pause window and resume eligibility state. | table | C2 | agent-codeable | — |
| `runtime_tool_invocation` | Constrained runtime tool choice, precondition, gate result, and tool-audit state. | table | C2 | agent-codeable | — |
| `support_context_bundle` | Escalation context bundle containing thread, intent, owner, pending attempt, consent, and gate posture. | table | C2 | agent-codeable | — |
| `human_disposition` | Explicit human resolution outcome that resumes, reclassifies, closes, or keeps suppression. | table | C2 | agent-codeable | — |
| `triage_context_snapshot` | Read projection of intent, owner, pending/nullified attempt, gate posture, and escalation status for triage. | table | C2 | agent-codeable | — |
| `reference_table_version` | Immutable published or draft criteria set with content hash, lineage, effective date, and current pointer. | table | C3 | agent-codeable | — |
| `reference_diff` | Structured version-to-version reference-data change set by row, field, key, and change class. | table | C3 | agent-codeable | — |
| `client_score_snapshot` | Per-contact eligibility evaluation result pinned to pack and reference versions. | table | C3 | agent-codeable | — |
| `re_score_job` | Durable impact-scoped eligibility re-evaluation job with cause and idempotency state. | queue-job | C3 | agent-codeable | — |
| `ingestion_run` | Staged reference-data detect, fetch, parse, validate, draft, dual-check, and publish run state. | queue-job | C3 | agent-codeable | — |
| `reference_source_binding` | Canonical and discovery-only source bindings per reference table family. | table | C3 | agent-codeable | — |
| `reference_detect_cursor` | Last-seen hash, ETag, Last-Modified, and retrieved marker for a canonical source binding. | table | C3 | agent-codeable | — |
| `schema_contract` | Versioned table-family shape, required columns, types, cardinality, and sanity validation contract. | table | C3 | agent-codeable | — |
| `publish_group` | Atomic co-publish set for dependent reference table families. | table | C3 | agent-codeable | — |
| `evaluation_pack` | Pack policy, table-key references, version pins, and follow-current behavior for eligibility evaluation. | table | C3 | agent-codeable | — |
| `client_data_record` | Committed client fact record from forms or consultant entry that can trigger re-score work. | table | C3 | agent-codeable | — |
| `board_phase_signal` | Board-grade eligibility signal state carrying motion class, confidence, and version pins. | table | C3 | agent-codeable | — |
| `reference_freshness_state` | Volatility class, last-verified time, freshness deadline, and past-freshness flag for reference tables. | table | C3 | agent-codeable | — |
| `recheck_cadence` | House-visible next-due, last-verified, and SLA breach state for reference verification work. | queue-job | C3 | agent-codeable | — |
| `reconciliation_job` | Post-publish drift check and sampled replay job state for reference-data reconciliation. | queue-job | C3 | agent-codeable | — |
| `import_batch` | Book upload, parse, land, commit, and row-quarantine batch state. | table | C4, C7 | agent-codeable | — |
| `source_header_inventory` | Captured arrived headers, sample cells, source label, file digest, and landed-at provenance. | table | C4 | agent-codeable | — |
| `field_mapping` | Source-column to canonical contact or Q-ID map version, confidence, and publish state. | table | C4 | agent-codeable | — |
| `canonical_contact_record` | Normalized contact-layer row holding identity fields, channels, display labels, and opaque slots before identity effects. | table | C4 | agent-codeable | — |
| `normalized_contact_staging` | Cleaned value layer and transform outcomes for imported contact rows before identity and validation. | table | C4 | agent-codeable | — |
| `opaque_attribute_store` | Retained non-evaluable imported attributes with source header, raw value, and provenance. | table | C4 | agent-codeable | — |
| `fact_lineage` | Source, batch, map version, raw value, transform, and normalized-value provenance for imported Q-ID facts. | ledger | C4 | agent-codeable | — |
| `identity_review_cluster` | Possible same-person review cluster and resolution state for ambiguous identity matches. | table | C4 | agent-codeable | — |
| `merge_survivorship_policy` | Field-level survivor rules for confirmed same-person merges and later upserts. | table | C4 | agent-codeable | — |
| `channel_conflict` | Pending accept, reject, or keep-both state for conflicting email or phone values on one identity. | table | C4 | agent-codeable | — |
| `quarantine_row` | Failed imported row with reason code, repair, and re-entry state. | table | C4 | agent-codeable | — |
| `enrichment_fact` | Public-facts crawl result and typed fact snapshot for a firm. | table | C5 | agent-codeable | — |
| `brand_extract` | Public brand extraction state for logo, palette, and sourced voice candidates. | table | C5 | agent-codeable | — |
| `prepared_workspace` | Hydrated firm workspace instance, snapshot version, preview access boundary, and readiness-facing state. | table | C5, C7 | agent-codeable | — |
| `access_token` | Opaque no-login capability token verifier, purpose, expiry, redeem, and revoke state. | table | C5 | agent-codeable | — |
| `enrichment_root` | Verified public URL and secondary listing identities that root enrichment for one firm. | table | C5 | mixed | Firm-controlled public URL or public listing identity availability/verification when absent or disputed — human |
| `crawl_permission` | Robots.txt and crawl-directive allow/deny state per root and path set. | provider-state | C5 | mixed | Firm/site-admin crawl permission change when robots or directives block required public paths — human |
| `public_fact_policy` | Versioned allowlist of pre-connect public fact classes and rejection rules. | table | C5 | agent-codeable | — |
| `source_provenance` | Field-level source, confidence, conflict, and selected winner state for public firm facts. | table | C5 | agent-codeable | — |
| `crawl_budget` | Per-host crawler identity, rate limit, backoff, and fetch posture state. | table | C5 | agent-codeable | — |
| `public_fetch_cache` | Public response body and metadata cache reused within a TTL. | table | C5 | agent-codeable | — |
| `fact_schema` | Typed public firm-fact keys and extraction-method confidence contract. | table | C5 | agent-codeable | — |
| `fact_freshness` | Fetched-at, TTL, stale flag, and refresh gate state for firm public-fact snapshots. | table | C5 | agent-codeable | — |
| `brand_contrast_result` | Accessibility result for candidate text-on-brand color pairs. | table | C5 | agent-codeable | — |
| `voice_excerpt` | Sourced public copy excerpt with URL and hash used for brand voice fields. | table | C5 | agent-codeable | — |
| `brand_package` | Versioned firm-facing brand package of logo, palette, voice, source, and confirmation state. | table | C5 | agent-codeable | — |
| `engagement_template_version` | Pinned house template contract used for forward-deploy workspace hydration. | table | C5 | agent-codeable | — |
| `hydrate_job` | Template, public-fact, and brand binding run that emits a Prepared Workspace snapshot. | queue-job | C5 | agent-codeable | — |
| `merge_field_contract` | Required merge-key contract and validation result for template hydration. | table | C5 | agent-codeable | — |
| `deliverable_scope` | Pre-connect public-facts promise that allows or removes template blocks during hydration. | table | C5 | agent-codeable | — |
| `token_policy` | Purpose, TTL, redeem count, rotation, revoke, and verifier rules for no-login tokens. | table | C5 | agent-codeable | — |
| `redeem_session` | Short no-login session issued after one-time token exchange, without carrying raw secrets in URLs. | table | C5 | agent-codeable | — |
| `escrow_ledger_entry` | Contingent payment instrument state for a firm. | ledger | C6 | mixed | Signed or accepted contingent commercial terms for the firm — human |
| `held_balance` | Immobilized funds state keyed to the contingent payment instrument. | ledger | C6 | mixed | Firm payment authorization/funding and provider hold or capture settlement — human |
| `payment_webhook_receipt` | Verified payment-provider ingress receipt and idempotency key store. | table | C6 | agent-codeable | — |
| `release_evidence_package` | Validated outcome proof package for release, return, or forfeit decisions. | table | C6 | agent-codeable | — |
| `provider_payment_identity` | Tokenized customer, payment method, charge, account, transfer, and refund reference state. | provider-state | C6 | mixed | Payment processor account/KYB setup, firm payment method mandate, and Connect/bank reference provisioning — human |
| `escrow_status_machine` | Legal transition set and rejection state for ledger status changes. | table | C6 | agent-codeable | — |
| `release_attempt` | Idempotent release, return, or forfeit attempt keyed to instrument, evidence, and action. | table | C6 | agent-codeable | — |
| `outcome_verification_event` | Durable Engagement runtime event for meeting booked, canceled, or reopened. | stream | C6 | agent-codeable | — |
| `attribution_path` | Inspectable campaign, enrollment, contact, and meeting membership proof. | table | C6 | agent-codeable | — |
| `measurement_window` | Window clock state for release stability. | queue-job | C6 | agent-codeable | — |
| `dispute_freeze` | Freeze state that halts release jobs and provider money motion. | table | C6 | agent-codeable | — |
| `escrow_status_read_model` | Per-tenancy Commercial projection for instruments, balances, evidence, receipts, provider refs, and gate state. | table | C6 | agent-codeable | — |
| `counsel_gate` | Human counsel clearance state for MT/MSB rail posture. | table | C6 | human-provisioning | Counsel clearance for MT/MSB/payment rail posture — human |
| `metric_definition` | Versioned metric contract with inputs, filters, windows, unit, owner, labels, and shell binding. | table | C7 | agent-codeable | — |
| `metrics_materialization` | Rollup and glance store for shell metrics, funnels, rates, freshness, and drill-through ids. | table | C7 | agent-codeable | — |
| `pipeline_health` | Producer coverage, ingress failures, lag, dead-letter, freshness SLO, and materialization health state. | table | C7 | agent-codeable | — |
| `event_taxonomy` | Versioned event names, required properties, compatibility rules, and allowed producer contracts. | table | C7 | agent-codeable | — |
| `producer_contract` | Owner-to-taxonomy emission contract for send path, conversations/runtime, booking path, and capture producers. | table | C7 | agent-codeable | — |
| `correlation_envelope` | Attempt, message, campaign, channel, firm, and subject identity used to stitch one occurrence timeline. | table | C7 | agent-codeable | — |
| `funnel_definition` | Versioned ordered funnel steps, conversion window, subject key, and primary/diagnostic role state. | table | C7 | agent-codeable | — |
| `campaign_proxy_aggregate` | Imported ad-platform proxy aggregate keyed for first-party campaign and creative joining. | table | C7 | mixed | Per-firm ad-platform/export access authorization when proxy aggregate import is required — human |
