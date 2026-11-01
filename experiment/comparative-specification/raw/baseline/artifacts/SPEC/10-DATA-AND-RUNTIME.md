# 10. Data, runtime, and wiring

## 10.1 Machine law

The machine is **tables + a dumb runtime**. Kinds: **state | rule | sequence**. Anything that should be modifiable is a table. Frozen-in-prose that should vary is a bug unless it is a hard-gate / must-not / immutable wall.

**Data in tables:** module records come from queries. Seed a reasonable row count when a table is minted. Never hard-code demo rows into React. If the table/field is unspecified, that is a silence — do not invent a store in the SPA.

## 10.2 Tenancy and identity tables

| Table | Role |
|-------|------|
| `firms`, `users` | Auth tenancy |
| `otp_challenges`, `sessions`, `otp_send_log` | Passwordless login |
| `access_links` | Consultant magic invite `/a/<token>` |
| `ct_firms` | CT/wire firm row (same UUID as `firms` after firm-binding) |
| `contact_records` | Firm book |
| `import_batch` | CSV/import batches |
| `contact_access_links`, `contact_uploads` | Contact seat |
| `consent_records`, `halt_records` | Consent / consultant halt |
| `crm_oauth_grants` | Book authorization |

## 10.3 Agents housing (sequence ⊃ campaigns)

| Table | Role |
|-------|------|
| `sequence_template` | Sequence container; class; cells |
| `firm_sequence_binding` | Per-firm template + overrides |
| `campaign` | One objective; ord; Override this; per-campaign attempt params |
| `campaign_objective` | kind click\|form\|meeting; completion table; template\|scratch |
| `campaign_channel` | Medium nodes + content |
| `campaign_channel_variation` | Attempt-N copy |
| `seq_attempt_cycle` | Attempt rules at sequence/global grain |
| `seq_channel_ownership_order`, `seq_phase_order` | Ladders |
| `seq_channel_rules` | Channel/escalation rules |
| `rule_attempt_criteria` | Faceless attempt windows |
| `campaign_failure` | Exhaustion event |
| `enrollment` | Cursor; `campaign_id`; `pursuit_state` |
| `active_attempts` | In-flight attempt |
| `engagement_records` | Chronology |
| `outbound_messages`, `messaging_events` | What went out / provider events |
| `sequence_ready`, `reachability_verdicts`, `audit_runs` | Book readiness |

## 10.4 Automations housing

| Table | Role |
|-------|------|
| `workflow`, `workflow_state`, `workflow_target`, `workflow_run` | Graph + runs |
| `workflow_trigger` | Event/schedule/manual/webhook/constant |
| `action` | call_agent / in-app types |
| `rule_pack` | Togglable families + named code |
| `event_write_set`, `event_test_data` | Test contract / write-set |
| `collectible_fields` | Form occupancy |
| `contact_tag` | Ascribe-tag action |
| `wait_occupancy` | Parked waits / approval notes |

## 10.5 Eligibility / motion housing

| Table | Role |
|-------|------|
| `reference_versions`, `constants_packs` | Law-side data |
| `rule_eligibility_pathway`, `rule_field_class_routing`, `rule_motion_precedence`, `rule_cohort_scoring`, `rule_metrics_thresholds`, `rule_reachability_checks` | Open-box rules as rows |
| `eligibility_evaluations`, `eligibility_results` | Runs and structured output |
| `signals`, `motion_decisions` | Engine 2 |
| `fact_writebacks`, `missing_fact_signals` | Collection |
| `meeting_booked` | Success event |
| `prepared_workspaces`, `escrow_acceptances` | Activation |
| `campaign_states` | Armed / running |
| `register_gaps` | House evolution |
| `audit_events` | Operator audit trail |
| `sending_domains` | Sending pool |
| `primary_store_rows` | Legacy CT bags — not the intended source of module records |

Map-only vs Postgres: some Story nodes (e.g. `state.finishing_event`) exist on `/system-map` without a first-class table. Name the split; do not pretend the map is stood up.

## 10.6 Runtime

| Process | Job |
|---------|-----|
| `workflowWalk.ts` | Automations walk. Ignition: payload writes, until-node, configured-break. Handle = previousWrites / chainWrites. |
| `cascade.ts` | Shared enroll / escalate / send; attempt criteria; channel ownership |
| `worker.ts` | Time path (tick) |
| `dispatchSend.ts` | Live send gates: consent / halt / silence / SEND_MODE |
| Auth service | OTP, session, access redeem |
| Wire routes | `/wire/*`, `/wire/machine/*`, `/wire/hook/:webhookId`, send CEM/SMS, Resend webhooks |

**SEND_MODE** gates live send. Default in later docs is live when secrets+DB are good; older actuation reports defaulted dry-run. **UNRESOLVED as product copy:** which default is intended for production vs sandbox. Gates themselves are required.

## 10.7 Live vs stand-in ports (as-built honesty, not a product shrink)

Live when secrets + DB are good: Resend CEM, Twilio SMS, Resend webhooks → messaging_events, OTP mailer, sending pool / sending_domains, Postgres halt/consent/CRM grant/audit/primary store, worker tick, access links.

Still stand-in / deferred: **Meta ads**, **escrow fulfillment**, enrich crawl, Postmaster, warmup counters, list-unsubscribe ingress.

Deferred is a product choice for Escrow · Meta unless Story already required the capability (it does require the *door*; it does not require the payment processor to be live).

## 10.8 Send identity

Outreach is **firm-branded**. House allocates a sending subdomain per firm. Custom domain attach deferred. Consultant halt and contact silence suppress new enroll+send.

## 10.9 Auth contract (intended login)

- `POST /auth/otp/send` — generic 200; no code if unprovisioned
- `POST /auth/otp/verify` — sets `tower_session` HttpOnly cookie; no token in JSON
- `GET /auth/session`, `POST /auth/logout`
- `POST /auth/access/redeem` for magic links

Rate limits and delivery failure (`503`) are specified in `docs/product/auth-service-contract.md`.
