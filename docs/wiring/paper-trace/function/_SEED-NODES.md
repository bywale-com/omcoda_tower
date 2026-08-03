# Seed fusion vocabulary (not a designed systems list)

Written so parallel seat traces land on the **same nouns** when they mean the same state.  
If a seat needs a genuinely new unit of state, **add it** and name it at table-equivalent altitude ([`../../NODE-DEFINITION.md`](../../NODE-DEFINITION.md)).

Prefer these names when the event acts here:

| Candidate node | Typical altitude |
|---|---|
| `sending_domain` | provider table-equivalent (auth/warmup/bind state) |
| `dkim_keyset` | per-firm signing identity state |
| `dmarc_policy` | From-domain policy state |
| `ip_pool_tier` | reputation / throttle unit |
| `reputation_unit` | bounce/complaint quarantine unit |
| `warmup_schedule` | ramp plan + phase state |
| `suppression_list` | hard-bounce / complaint / opt-out entries |
| `send_gate_decision` | armed/active allow/deny state per CEM leave |
| `outbound_message` | message instance about to leave / left |
| `messaging_event_stream` | named event classes for send/delivery/reply |
| `provider_webhook_receipt` | ingress receipt / idempotency key |
| `engagement_attempt` | one-owner attempt/channel state |
| `intent_classification` | reply intent result |
| `conversation_thread` | triage / reply inbox state |
| `escalation_ticket` | HITL queue item |
| `engagement_record` | chronology / attribution record |
| `reference_table_version` | immutable published criteria set |
| `reference_diff` | version-to-version change set |
| `client_score_snapshot` | evaluation result at a criteria version |
| `re_score_job` | impact-scoped re-evaluation job |
| `import_batch` | book upload / parse batch |
| `field_mapping` | CSV/CRM → Q-ID map |
| `contact_identity` | deduped person identity |
| `reachability_class` | email/phone validation class |
| `book_readiness` | authorize-book readiness state |
| `enrichment_fact` | public-facts crawl result |
| `brand_extract` | branding assets/tokens from site |
| `prepared_workspace` | hydrated firm workspace readiness |
| `access_token` | no-login workspace token |
| `escrow_ledger_entry` | contingent payment ledger row |
| `held_balance` | held funds state |
| `release_evidence_package` | verified-release evidence |
| `payment_webhook_receipt` | Stripe/Connect ingress receipt |
| `metric_definition` | named metric contract |
| `metrics_materialization` | rollup / glance store |
| `pipeline_health` | producer coverage / lag SLO state |
| `consent_record` | (existing adjacency — fuse, don't redesign) |
| `firm_tenancy` | tenant boundary |
| `audit_trail` | append-only event log adjacency |

Shared cross-cut expected: **C1 + C2 + C7 → `messaging_event_stream`**.
