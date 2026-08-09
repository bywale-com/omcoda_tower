# FROZEN TABLES v1 — materialization set

**Status: FROZEN after Phase 0 + Phase 1 append.**  
Nothing else is added in this build. Further discoveries → [`V2-BACKLOG.md`](./V2-BACKLOG.md).

**Sources:** `src/app/system-map/data/tables.ts` (62 MACHINE_TABLES) + `templates.ts` + Phase 1 automations objects + already-in-Postgres (`001–003`).

## Legend

| Status | Meaning |
|---|---|
| **already-in-Postgres** | Exists in `supabase/migrations/001–003` — extend if needed, do not recreate |
| **new** | Create in `004_machine_tables.sql` |
| **non-materialized** | Wall / silence — not a Postgres table (constraint stays in code/docs) |
| **maps-to** | System-map id maps onto an existing physical table |

---

## A. Already in Postgres (do not duplicate)

| Physical table | System-map twin | Kind | Notes |
|---|---|---|---|
| `firms` | `state.firm_tenancy` | state | Auth UUID tenancy |
| `users` | `state.user_account` | state | |
| `otp_challenges` | `state.otp_challenge` | state | |
| `sessions` | `state.session` | state | |
| `otp_send_log` | (adjacent) | — | Rate log |
| `applied_seeds` | (ops) | — | |
| `ct_firms` | `state.firm_tenancy` / `state.campaign_state` | state | CT TEXT firm + posture |
| `halt_records` | *(no map id — Phase 1 notes gap)* | state | Board halt/lift — **PG exists** |
| `consent_records` | `state.consent_state` | state | **Extend** with `waitlisted` / status enum |
| `crm_oauth_grants` | `state.database_authorization` | state | |
| `audit_events` | (change log) | — | Not reachability audit runs |
| `primary_store_rows` | generic bag | — | Not used as primary for frozen set |
| `outbound_messages` | send plane / attempt | state | |
| `messaging_events` | `state.engagement_record` (partial) | state | |
| `provider_webhook_receipts` | infra | — | |
| `sending_domains` | infra | — | |

---

## B. Automations objects (Phase 0 — missing; NEW)

| Physical table | Kind | Notes |
|---|---|---|
| `workflow` | state | id, firm_id, name, target, graph jsonb, created_at, updated_at |
| `workflow_state` | state | workflow_id → draft \| active \| paused (**Activate writes draft→active**) |
| `workflow_target` | state | workflow_id → audit \| contact \| import \| client |
| `workflow_run` | state | run log + per-node status jsonb + counts |
| `action` | state | v1: `{ type: call_agent, agent_ref, payload_binding }` |
| `enrollment` | state | contact_id, agent_ref/sequence_id, payload, enrolled_at |

---

## C. Template / binding (v3 — NEW first-class tables)

| Physical table | Map / source | Kind |
|---|---|---|
| `sequence_template` | `SEQUENCE_TEMPLATES` / `seq.*_calendar` | template |
| `firm_sequence_binding` | `FIRM_SEQUENCE_BINDINGS` / `bind.firm_sequence` | binding |

---

## D. Rule / sequence data tables (NEW — runtime reads rows)

| Physical table | Map id | Kind |
|---|---|---|
| `rule_attempt_criteria` | `rule.attempt_criteria` | rule |
| `rule_motion_precedence` | `rule.motion_precedence` | rule |
| `rule_field_class_routing` | `rule.field_class_routing` | rule |
| `rule_reachability_checks` | `rule.reachability_checks` | rule |
| `rule_eligibility_pathway` | `rule.eligibility_pathway` | rule |
| `rule_cohort_scoring` | `rule.cohort_scoring` | rule |
| `rule_metrics_thresholds` | `rule.metrics_thresholds` | rule |
| `seq_channel_ownership_order` | `seq.channel_ownership_order` | sequence |
| `seq_phase_order` | `seq.phase_order` | sequence |
| `seq_eligibility_pipeline` | `seq.eligibility_pipeline` | sequence |

*(Templated calendars live in `sequence_template.cells` jsonb — not separate seq_* calendar tables.)*

---

## E. Core-loop state tables (NEW)

| Physical table | Map id | Kind |
|---|---|---|
| `contact_records` | `state.contact_record` | state |
| `reachability_verdicts` | `state.reachability_verdict` | state |
| `sequence_ready` | `state.sequence_ready` | state |
| `campaign_states` | `state.campaign_state` | state |
| `cohort_tiers` | `state.cohort_tier` | state |
| `metrics_flags` | `state.metrics_flag` | state |
| `reference_versions` | `state.reference_version` | state (versioned) |
| `constants_packs` | `state.constants_pack` | state (versioned) |
| `eligibility_evaluations` | `state.eligibility_evaluation` | state |
| `eligibility_results` | `state.eligibility_result` | state |
| `signals` | `state.signal` | state |
| `motion_decisions` | `state.motion_decision` | state |
| `active_attempts` | `state.active_attempt` | state |
| `engagement_records` | `state.engagement_record` | state |
| `fact_writebacks` | `state.fact_writeback` | state |
| `missing_fact_signals` | `state.missing_fact_signal` | state |
| `audit_runs` | *(Phase 1 append)* | state | Hub Audit batch run |
| `sequence_definitions` | `state.sequence_definition` | state |

---

## F. Deferred / mapped lightly (NEW thin or backlog)

| Physical / disposition | Map id | Notes |
|---|---|---|
| `prepared_workspaces` | `state.prepared_workspace` | NEW thin row |
| `escrow_acceptances` | `state.escrow_acceptance` + terms | NEW |
| Columns on `ct_firms` / backlog | seed_capture, approach, analysis_readout, evaluation_ruleset, meeting_booked, pending_capture, live_brief, fact_ask, field_class_routing result, optin_phase, phase_state, content_order pointer, inbound_override, finishing_event, reactivation_arm_state | Prefer columns/json on existing rows or **V2** if not needed for Phase 4 loop |

Phase 4 loop needs: campaign_states, contact_records, reachability, sequence_ready, reference_versions, eligibility_*, signals, motion_decisions, enrollment, workflow*, sequence_template, firm_sequence_binding, rule tables, engagement_records.

---

## G. Non-materialized (walls — not tables)

| Map id | Reason |
|---|---|
| `wall.hard_gates` | hard-gate |
| `wall.must_nots` | must-not |
| `wall.click_budget` | immutable-wall |
| `wall.approach_scope` | immutable-wall |
| `wall.repeat_compression` | named-silence |

---

## H. Phase 1 appends (from reconciliation — final)

| Table | Source control | Status |
|---|---|---|
| `audit_runs` | Audit → Run audit | **new** (appended) |
| `halt_records` | Board Halt/Lift | already-in-Postgres (map twin deferred to V2) |
| `workflow` + `workflow_state` | Automations Create / Activate | **new** (already in §B) |

**Table list is FINAL after this document.**
