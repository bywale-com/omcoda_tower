# Node union draft — Function traces

**Scope read:** Function traces under `docs/wiring/paper-trace/function/` for C1, C2, C3, C4, C5, and C7. `_SEED-NODES.md` was not counted as a trace source. C6 was absent.

**Counting rule:** path counts are rough counts of trace sections whose explicit **Nodes touched** list included the node. A node is counted at most once per path.

**Altitude vocabulary:** `table`, `provider-state`, `queue-job`, `stream`, `ledger`, `engine/platform`. No engine/platform nodes were discovered in this pass.

## Union registry

| Canonical name | One-line definition | Altitude | Seats touching | Path mentions |
|---|---|---:|---|---:|
| `access_token` | Opaque no-login capability token verifier, purpose, expiry, redeem, and revoke state. | table | C5 | 5 |
| `attempt_job_queue` | Scheduled attempt jobs and cancellation state for same-owner retries or escalations. | queue-job | C2 | 4 |
| `audit_trail` | Append-only event log for provenance, gate outcomes, definition changes, and operator-reviewable decisions. | ledger | C1, C2, C3, C4, C5, C7 | 89 |
| `auto_reply_pause` | Out-of-office or machine-reply pause window and resume eligibility state. | table | C2 | 1 |
| `board_phase_signal` | Board-grade eligibility signal state carrying motion class, confidence, and version pins. | table | C3 | 4 |
| `book_readiness` | Authorize-book readiness verdict state for reachable, partial, blocked, or audit-ready rows. | table | C1, C3, C4 | 20 |
| `brand_contrast_result` | Accessibility result for candidate text-on-brand color pairs. | table | C5 | 1 |
| `brand_extract` | Public brand extraction state for logo, palette, and sourced voice candidates. | table | C5 | 4 |
| `brand_package` | Versioned firm-facing brand package of logo, palette, voice, source, and confirmation state. | table | C5 | 7 |
| `campaign_calendar` | Day-ordered campaign phase and content eligibility state before runtime sequence ownership. | table | C2 | 1 |
| `campaign_proxy_aggregate` | Imported ad-platform proxy aggregate keyed for first-party campaign and creative joining. | table | C7 | 1 |
| `canonical_contact_record` | Normalized contact-layer row holding identity fields, channels, display labels, and opaque slots before identity effects. | table | C4 | 9 |
| `carrier_throughput_tier` | SMS carrier throughput window and capacity tier state. | provider-state | C1 | 1 |
| `channel_conflict` | Pending accept, reject, or keep-both state for conflicting email or phone values on one identity. | table | C4 | 1 |
| `client_data_record` | Committed client fact record from forms or consultant entry that can trigger re-score work. | table | C3 | 2 |
| `client_score_snapshot` | Per-contact eligibility evaluation result pinned to pack and reference versions. | table | C3 | 9 |
| `consent_record` | Legal consent, silence, opt-out, and channel-scope permission state. | table | C1, C2 | 7 |
| `contact_identity` | Deduped stable person identity and deterministic match-key/upsert state. | table | C1, C4 | 16 |
| `conversation_thread` | Live reply thread, triage status, and channel conversation state. | table | C1, C2, C7 | 14 |
| `correlation_envelope` | Attempt, message, campaign, channel, firm, and subject identity used to stitch one occurrence timeline. | table | C7 | 4 |
| `crawl_budget` | Per-host crawler identity, rate limit, backoff, and fetch posture state. | table | C5 | 1 |
| `crawl_permission` | Robots.txt and crawl-directive allow/deny state per root and path set. | provider-state | C5 | 1 |
| `criteria_window` | Authored evidence window state for non-reply escalation or owner transition criteria. | table | C2 | 3 |
| `deliverable_scope` | Pre-connect public-facts promise that allows or removes template blocks during hydration. | table | C5 | 1 |
| `dkim_keyset` | Per-firm DKIM signing key and alignment state. | provider-state | C1 | 1 |
| `dmarc_policy` | From-domain DMARC discovery, policy, rua, and alignment state. | provider-state | C1 | 1 |
| `engagement_attempt` | One-owner attempt, retry, handoff, pause, nullify, and gate-result state. | table | C1, C2, C7 | 43 |
| `engagement_record` | Read-only chronology and attribution record for runtime, classification, gate, escalation, and finish events. | ledger | C2, C7 | 24 |
| `engagement_template_version` | Pinned house template contract used for forward-deploy workspace hydration. | table | C5 | 4 |
| `enrichment_fact` | Public-facts crawl result and typed fact snapshot for a firm. | table | C5 | 13 |
| `enrichment_root` | Verified public URL and secondary listing identities that root enrichment for one firm. | table | C5 | 4 |
| `escalation_ticket` | Human-in-the-loop queue item for unsure, hostile, policy-edge, or support escalation work. | table | C2 | 10 |
| `evaluation_pack` | Pack policy, table-key references, version pins, and follow-current behavior for eligibility evaluation. | table | C3 | 6 |
| `event_taxonomy` | Versioned event names, required properties, compatibility rules, and allowed producer contracts. | table | C7 | 6 |
| `fact_freshness` | Fetched-at, TTL, stale flag, and refresh gate state for firm public-fact snapshots. | table | C5 | 2 |
| `fact_lineage` | Source, batch, map version, raw value, transform, and normalized-value provenance for imported Q-ID facts. | ledger | C4 | 3 |
| `fact_schema` | Typed public firm-fact keys and extraction-method confidence contract. | table | C5 | 1 |
| `field_mapping` | Source-column to canonical contact or Q-ID map version, confidence, and publish state. | table | C4 | 8 |
| `firm_operations_bind` | Armed/Active firm operations binding and posture state that controls runtime motion. | table | C2 | 3 |
| `firm_tenancy` | Tenant boundary, firm ownership, and firm posture scope for state and query isolation. | table | C1, C2, C3, C4, C5, C7 | 20 |
| `form_activity_event` | Form visit, start, submit, and activity evidence state used by runtime criteria. | stream | C2 | 3 |
| `from_identity` | Firm-branded visible From display name, local part, and alignable domain binding. | provider-state | C1 | 6 |
| `funnel_definition` | Versioned ordered funnel steps, conversion window, subject key, and primary/diagnostic role state. | table | C7 | 3 |
| `human_disposition` | Explicit human resolution outcome that resumes, reclassifies, closes, or keeps suppression. | table | C2 | 2 |
| `hydrate_job` | Template, public-fact, and brand binding run that emits a Prepared Workspace snapshot. | queue-job | C5 | 6 |
| `identity_review_cluster` | Possible same-person review cluster and resolution state for ambiguous identity matches. | table | C4 | 4 |
| `import_batch` | Book upload, parse, land, commit, and row-quarantine batch state. | table | C4, C7 | 8 |
| `ingestion_run` | Staged reference-data detect, fetch, parse, validate, draft, dual-check, and publish run state. | queue-job | C3 | 6 |
| `intent_classification` | Closed-set reply intent result, confidence, and terminal/unsure classification state. | table | C1, C2 | 17 |
| `ip_pool_tier` | Shared or dedicated IP tier, promotion, PTR/rDNS, and warmup assignment state. | provider-state | C1 | 4 |
| `merge_field_contract` | Required merge-key contract and validation result for template hydration. | table | C5 | 2 |
| `merge_survivorship_policy` | Field-level survivor rules for confirmed same-person merges and later upserts. | table | C4 | 4 |
| `messaging_event_stream` | Shared append-only send, delivery, reply, classify, act, and booking-path event stream. | stream | C1, C2, C7 | 37 |
| `metric_definition` | Versioned metric contract with inputs, filters, windows, unit, owner, labels, and shell binding. | table | C7 | 9 |
| `metrics_materialization` | Rollup and glance store for shell metrics, funnels, rates, freshness, and drill-through ids. | table | C7 | 21 |
| `normalized_contact_staging` | Cleaned value layer and transform outcomes for imported contact rows before identity and validation. | table | C4 | 4 |
| `opaque_attribute_store` | Retained non-evaluable imported attributes with source header, raw value, and provenance. | table | C4 | 2 |
| `outbound_message` | Message instance requested, accepted, denied, or sent through the outbound channel path. | table | C1, C2, C7 | 20 |
| `pipeline_health` | Producer coverage, ingress failures, lag, dead-letter, freshness SLO, and materialization health state. | table | C7 | 10 |
| `prepared_workspace` | Hydrated firm workspace instance, snapshot version, preview access boundary, and readiness-facing state. | table | C5, C7 | 23 |
| `producer_contract` | Owner-to-taxonomy emission contract for send path, conversations/runtime, booking path, and capture producers. | table | C7 | 3 |
| `provider_reputation_feed` | Postmaster, feedback-loop, spam-rate, sender-intelligence, and provider reputation signal state. | provider-state | C1 | 2 |
| `provider_throttle_state` | Adaptive provider backoff, pause, and gradual-capacity reopen state from deferrals or rejects. | provider-state | C1 | 1 |
| `provider_webhook_receipt` | Signed provider ingress receipt, normalization outcome, and idempotency key state. | table | C1, C2, C7 | 20 |
| `public_fact_policy` | Versioned allowlist of pre-connect public fact classes and rejection rules. | table | C5 | 1 |
| `public_fetch_cache` | Public response body and metadata cache reused within a TTL. | table | C5 | 1 |
| `publish_group` | Atomic co-publish set for dependent reference table families. | table | C3 | 1 |
| `quarantine_row` | Failed imported row with reason code, repair, and re-entry state. | table | C4 | 1 |
| `re_score_job` | Durable impact-scoped eligibility re-evaluation job with cause and idempotency state. | queue-job | C3 | 6 |
| `reachability_class` | Email or phone validation class result for syntax, MX/domain, mailbox, line type, or reachability. | table | C1, C4 | 7 |
| `recheck_cadence` | House-visible next-due, last-verified, and SLA breach state for reference verification work. | queue-job | C3 | 2 |
| `reconciliation_job` | Post-publish drift check and sampled replay job state for reference-data reconciliation. | queue-job | C3 | 1 |
| `redeem_session` | Short no-login session issued after one-time token exchange, without carrying raw secrets in URLs. | table | C5 | 2 |
| `reference_detect_cursor` | Last-seen hash, ETag, Last-Modified, and retrieved marker for a canonical source binding. | table | C3 | 3 |
| `reference_diff` | Structured version-to-version reference-data change set by row, field, key, and change class. | table | C3 | 3 |
| `reference_freshness_state` | Volatility class, last-verified time, freshness deadline, and past-freshness flag for reference tables. | table | C3 | 4 |
| `reference_source_binding` | Canonical and discovery-only source bindings per reference table family. | table | C3 | 3 |
| `reference_table_version` | Immutable published or draft criteria set with content hash, lineage, effective date, and current pointer. | table | C3 | 11 |
| `reply_route` | Reply-To strategy and monitored capture or firm-monitored mailbox routing state. | provider-state | C1 | 1 |
| `reputation_unit` | Bounce, complaint, quarantine, and throttle reputation accounting unit for a firm/domain/IP tier. | provider-state | C1, C7 | 12 |
| `return_path_domain` | Platform-controlled custom MAIL FROM / Return-Path domain and bounce correlation state. | provider-state | C1 | 2 |
| `runtime_tool_invocation` | Constrained runtime tool choice, precondition, gate result, and tool-audit state. | table | C2 | 4 |
| `schema_contract` | Versioned table-family shape, required columns, types, cardinality, and sanity validation contract. | table | C3 | 1 |
| `send_gate_decision` | Allow/deny and reason state for outbound motion, CEM leave, posture, consent, suppression, and deliverability gates. | table | C1, C2, C3, C7 | 43 |
| `sending_domain` | Branded sending domain or subdomain authentication, ownership, warmup, and reputation binding state. | provider-state | C1, C7 | 11 |
| `sending_identity_binding` | Firm-to-sending-domain/from-identity binding and readiness dependency state. | provider-state | C1 | 8 |
| `sequence_enrollment` | Enrollment and next-sequence armed state under campaign or runtime policy. | table | C2 | 4 |
| `sequence_finish_state` | Booked, stop, form-submitted, no-reply, or human-close predicate state that closes a sequence. | table | C2 | 3 |
| `sequence_instance` | Runtime sequence instance with active owner, close/arm, and posture-scoped state. | table | C2 | 5 |
| `sequence_rule_set` | Authored owner order, criteria rules, successor, and attempt law loaded by runtime. | table | C2 | 3 |
| `sms_reputation_unit` | SMS delivery, undelivered, complaint, and carrier reputation state. | provider-state | C1 | 1 |
| `sms_sender_registration` | A2P brand or campaign registration status and SMS-ready state. | provider-state | C1 | 1 |
| `source_header_inventory` | Captured arrived headers, sample cells, source label, file digest, and landed-at provenance. | table | C4 | 1 |
| `source_provenance` | Field-level source, confidence, conflict, and selected winner state for public firm facts. | table | C5 | 2 |
| `support_context_bundle` | Escalation context bundle containing thread, intent, owner, pending attempt, consent, and gate posture. | table | C2 | 2 |
| `suppression_list` | Hard-bounce, complaint, opt-out, silence, hostile, hygiene, and pass-through do-not-contact deny entries. | table | C1, C2, C4, C7 | 19 |
| `token_policy` | Purpose, TTL, redeem count, rotation, revoke, and verifier rules for no-login tokens. | table | C5 | 2 |
| `triage_context_snapshot` | Read projection of intent, owner, pending/nullified attempt, gate posture, and escalation status for triage. | table | C2 | 1 |
| `voice_excerpt` | Sourced public copy excerpt with URL and hash used for brand voice fields. | table | C5 | 1 |
| `warmup_schedule` | Domain/IP ramp plan, daily caps, phase, consumed capacity, and re-warmup state. | provider-state | C1, C7 | 9 |
| `workspace_readiness` | Hydration, freshness, branding, merge-field, and issue gate state for prepared-workspace-ready. | table | C5 | 5 |

## Obvious duplicate / fusion candidates

| Current names | Recommended canonical name | Why fuse |
|---|---|---|
| `firm_operations_bind`, `firm_tenancy` | `firm_tenancy` | The seed vocabulary already includes tenant boundary plus firm bind state; C2's bind posture reads as a narrower name for the same Armed/Active firm posture unless later design splits operations binding into a separate lifecycle. |
| `workspace_readiness`, `prepared_workspace` | `prepared_workspace` | The seed node describes hydrated workspace readiness, and all `workspace_readiness` mentions are gate state on the Prepared Workspace rather than an independent object. |
| `form_activity_event`, `messaging_event_stream` | `messaging_event_stream` | C2 treats form activity as event evidence, while C7's shared stream is the canonical event altitude for booking/capture path events. Keep `form_activity_event` only if form events need a separate pre-stream source ledger. |

## Names that look similar but should not fuse yet

| Names | Keep separate because |
|---|---|
| `fact_freshness`, `reference_freshness_state` | One governs public firm-fact enrichment snapshots; the other governs external reference table volatility and criteria freshness. |
| `fact_lineage`, `source_provenance`, `audit_trail` | Fact lineage and source provenance are domain-local evidence state; `audit_trail` is the cross-cut append-only review log. |
| `brand_extract`, `brand_package` | Extraction candidates and the versioned workspace-bound package have different lifecycle events. |
| `canonical_contact_record`, `contact_identity`, `client_data_record` | These represent imported contact rows, deduped people, and committed evaluable client facts at different altitudes. |
| `criteria_window`, `funnel_definition`, `metric_definition` | Runtime owner-transition evidence windows, analytics funnel definitions, and shell metric contracts are adjacent but not interchangeable. |
