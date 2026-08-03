# C7 Instrumentation / analytics pipeline — Function wiring traces

**Seat:** C7 — Instrumentation / analytics pipeline  
**Status:** Paper only. Function traces for `obs-01`...`obs-22`.  
**Binding:** [`../../WIRING-METHOD.md`](../../WIRING-METHOD.md) · [`../../NODE-DEFINITION.md`](../../NODE-DEFINITION.md) · [`../../CTO-THINK-STACK.md`](../../CTO-THINK-STACK.md) · [`./_SEED-NODES.md`](./_SEED-NODES.md) · [`../../../sme/capability/C7-instrumentation-analytics.md`](../../../sme/capability/C7-instrumentation-analytics.md)

## Local node list

### Required fused nodes

- `messaging_event_stream` — shared append-only event state for C1 delivery control, C2 reply/runtime decisions, and C7 aggregation.
- `provider_webhook_receipt` — signed provider ingress receipt and idempotency state.
- `metric_definition` — versioned metric contract: inputs, filters, windows, unit, owner, and shell binding.
- `metrics_materialization` — rollup / glance state read by Oversight, Firm health, Approach instrumentation, and Activation Progress.
- `pipeline_health` — producer coverage, ingress lag, consumer lag, dead-letter, and materialization SLO state.
- `firm_tenancy` — tenant boundary and query-scope state for firm-level and fleet-level reads.
- `audit_trail` — append-only audit adjacency for ingest outcomes, stream ids, taxonomy versions, and definition changes.

### C7-local nodes

- `event_taxonomy` — versioned event names, required properties, compatibility rules, and allowed producers.
- `producer_contract` — owner-to-event emission contract for send path, conversations/runtime, booking path, and capture strip producers.
- `correlation_envelope` — attempt/message/campaign subject identity used to stitch one occurrence path across producers.
- `funnel_definition` — versioned ordered funnel steps, conversion window, subject key, and primary/diagnostic role.
- `campaign_proxy_aggregate` — imported ad-platform proxy aggregate keyed for first-party joining.

### Existing adjacent nodes touched

- `outbound_message`
- `engagement_attempt`
- `conversation_thread`
- `engagement_record`
- `sending_domain`
- `reputation_unit`
- `suppression_list`
- `warmup_schedule`
- `send_gate_decision`
- `prepared_workspace`
- `import_batch`

---

### `obs-01` — Messaging stream is the connective tissue

**Implementation (source):** Oversight, Firm health, and Audit trail read occurrence history only from the shared stream, not orphan ESP or runtime side logs.  
**Start:** `messaging_event_stream` (new)
**Path:**
1. When send, delivery, reply, classify, act, or booking-path events occur at `messaging_event_stream`, C1, C2, and C7 consume the same append-only occurrence state. [shared stream identity: C1/C2/C7]
2. When those stream events include stable ids and event classes, `metrics_materialization` rolls shell rates and timelines from the stream rather than side-channel counters.
3. When an operator drills from a shell value, `audit_trail` records or exposes the cited stream event ids behind the send / delivery / reply / act transition.
**Nodes touched:**
- `messaging_event_stream`
- `metrics_materialization`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Infrastructure & Operations; Identity / Security / Compliance

### `obs-02` — Versioned event taxonomy before shell KPI

**Implementation (source):** Shell metrics bind to a published taxonomy version, and unknown or breaking event names do not increment counters.  
**Start:** `event_taxonomy` (new)
**Path:**
1. When an event name or required-property contract is published at `event_taxonomy`, allowed producers and compatibility rules become named ingest state.
2. When a producer emits into `messaging_event_stream`, ingest checks the event name and required dimensions against the active `event_taxonomy` version. [reject unknown names; reject breaking versions]
3. When a shell metric is defined, `metric_definition` binds the tile to taxonomy names and versions before `metrics_materialization` can roll it.
4. When a taxonomy version changes, `audit_trail` receives the definition-change row so later shell numbers cite the contract in force.
**Nodes touched:**
- `event_taxonomy`
- `messaging_event_stream`
- `metric_definition`
- `metrics_materialization`
- `audit_trail`
**Facets swept:** Data Storage & Management; Core Application & Runtime; Identity / Security / Compliance; Infrastructure & Operations

### `obs-03` — Required correlation dimensions on every stream event

**Implementation (source):** Every messaging-path event carries tenant, subject, sequence/campaign, attempt, channel, and occurrence time so rollups and drills join deterministically.  
**Start:** `firm_tenancy` (new)
**Path:**
1. When a firm-bound or campaign-bound occurrence starts at `firm_tenancy`, tenant and subject scope become required event dimensions.
2. When an event is appended to `messaging_event_stream`, the active `event_taxonomy` requires `firm_id`, subject identity, sequence or campaign identity, attempt identity where present, channel, and `occurred_at`. [tenant key required; event time required]
3. When those dimensions are present, `correlation_envelope` can stitch sequence, attempt, and channel state without collapsing orphan events into unknown scope.
4. When metrics roll, `metrics_materialization` scopes Firm row and Sequence detail by firm and attempt while preserving drill-through to the stream.
**Nodes touched:**
- `firm_tenancy`
- `event_taxonomy`
- `messaging_event_stream`
- `correlation_envelope`
- `metrics_materialization`
**Facets swept:** Identity / Security / Compliance; Data Storage & Management; Core Application & Runtime

### `obs-04` — Idempotent ingest with stable event keys

**Implementation (source):** Provider retries and internal replays are accepted once by stable event key so complaint, bounce, and reply rates are not double-counted.  
**Start:** `provider_webhook_receipt` (new)
**Path:**
1. When a provider webhook or internal retry lands at `provider_webhook_receipt`, the receipt records provider event id or deterministic fallback key.
2. When the receipt key has already been accepted, `messaging_event_stream` suppresses a second append and marks the receipt duplicate-suppressed. [idempotent; at-least-once safe]
3. When the receipt key is new, `messaging_event_stream` accepts or upserts the normalized occurrence under the stable stream id.
4. When ingest accepts or suppresses a duplicate, `audit_trail` records the outcome for later operator review.
5. When `metrics_materialization` consumes stream events, it sees one logical event per idempotency key and does not inflate shell rates.
**Nodes touched:**
- `provider_webhook_receipt`
- `messaging_event_stream`
- `metrics_materialization`
- `audit_trail`
**Facets swept:** External Systems; Data Storage & Management; Infrastructure & Operations; Identity / Security / Compliance

### `obs-05` — Producer contracts emit on the path

**Implementation (source):** Each taxonomy event has an owning producer that emits during the domain action, and missing emitters surface as pipeline health.  
**Start:** `producer_contract` (new)
**Path:**
1. When a taxonomy name becomes required at `event_taxonomy`, `producer_contract` binds it to the Sending infrastructure, Conversations/runtime, Booking path, or Capture strip owner.
2. When a domain action occurs at `outbound_message`, `conversation_thread`, `engagement_attempt`, or `prepared_workspace`, the owning producer emits the matching event to `messaging_event_stream` before the action is treated as observable. [emit on path; no scrape-later truth]
3. When required producers are missing, stale, or not emitting, `pipeline_health` records producer coverage gaps by taxonomy name and owner.
4. When producer coverage is available, `metrics_materialization` exposes readiness and shell-fill signals without inventing counts from ESP exports.
**Nodes touched:**
- `event_taxonomy`
- `producer_contract`
- `outbound_message`
- `conversation_thread`
- `engagement_attempt`
- `prepared_workspace`
- `messaging_event_stream`
- `pipeline_health`
- `metrics_materialization`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Infrastructure & Operations; External Systems

### `obs-06` — Signed webhook ingress for deliverability telemetry

**Implementation (source):** Provider webhooks verify signatures, normalize delivery payloads, and append shared telemetry to the stream C1 and C7 both consume.  
**Start:** `provider_webhook_receipt` (existing)
**Path:**
1. When an ESP or SMS provider delivery callback lands at `provider_webhook_receipt`, the receipt stores provider, signature status, received time, and idempotency key. [signed ingress; reject unverifiable payloads]
2. When the signature is valid, provider payload classes normalize into C1 delivery-event classes before append to `messaging_event_stream`.
3. When normalized delivery events reach `messaging_event_stream`, C1 send gates and C7 rollups read the same delivery fact.
4. When signature verify fails or normalization fails, `pipeline_health` records ingress failure and `audit_trail` preserves the receipt outcome.
**Nodes touched:**
- `provider_webhook_receipt`
- `messaging_event_stream`
- `send_gate_decision`
- `metrics_materialization`
- `pipeline_health`
- `audit_trail`
**Facets swept:** External Systems; Identity / Security / Compliance; Data Storage & Management; Infrastructure & Operations

### `obs-07` — Delivery-event schema joins into the stream

**Implementation (source):** C1 delivery classes are first-class stream event types so gates and shells use one bounce, complaint, deferred, delivered, and rejected vocabulary.  
**Start:** `event_taxonomy` (existing)
**Path:**
1. When C1 delivery-event classes are registered at `event_taxonomy`, hard bounce, soft bounce, complaint, deferred, delivered, and rejected become first-class stream types.
2. When provider delivery telemetry is accepted at `provider_webhook_receipt`, normalization maps the provider dialect to those event taxonomy classes.
3. When normalized events append to `messaging_event_stream`, `suppression_list`, `reputation_unit`, and `send_gate_decision` read the same classes C7 materializes.
4. When `metrics_materialization` rolls deliverability rates, it uses only those stream classes and preserves drill-through to the source events.
**Nodes touched:**
- `event_taxonomy`
- `provider_webhook_receipt`
- `messaging_event_stream`
- `suppression_list`
- `reputation_unit`
- `send_gate_decision`
- `metrics_materialization`
**Facets swept:** External Systems; Data Storage & Management; Core Application & Runtime; Infrastructure & Operations

### `obs-08` — Funnel-step events beyond vanity opens

**Implementation (source):** Capture, opt-in, reply, invite, booking, and path-membership steps are stream facts, while opens remain diagnostic only.  
**Start:** `event_taxonomy` (existing)
**Path:**
1. When practice funnel steps are defined at `event_taxonomy`, capture submit, opt-in send/accept, nudge send, reply classified, meeting invited, and meeting booked become stream event classes.
2. When those actions occur at `engagement_attempt`, `conversation_thread`, or `prepared_workspace`, the owning `producer_contract` emits the step to `messaging_event_stream`. [opens diagnostic-only]
3. When steps arrive in `messaging_event_stream`, `funnel_definition` determines which ordered path and conversion window the step belongs to.
4. When `metrics_materialization` computes funnel rates, it promotes practice outcomes and keeps vanity open/click events out of primary completion metrics.
**Nodes touched:**
- `event_taxonomy`
- `producer_contract`
- `engagement_attempt`
- `conversation_thread`
- `prepared_workspace`
- `messaging_event_stream`
- `funnel_definition`
- `metrics_materialization`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Infrastructure & Operations

### `obs-09` — End-to-end correlation from send to act

**Implementation (source):** The attempt envelope propagates across outbound send, provider delivery, inbound reply, classification, and act events to reconstruct one timeline.  
**Start:** `correlation_envelope` (new)
**Path:**
1. When an attempt is created at `engagement_attempt`, `correlation_envelope` records attempt id, outbound message id, channel, firm, sequence, and subject keys.
2. When `outbound_message` emits send accepted to `messaging_event_stream`, the envelope travels with the stream event.
3. When provider delivery events arrive at `provider_webhook_receipt`, provider message ids resolve back to `correlation_envelope` before append to `messaging_event_stream`.
4. When `conversation_thread` emits reply classified or act events, the same envelope joins runtime decisions to the attempt.
5. When Sequence detail or `engagement_record` reads chronology, it orders one send -> delivery -> reply -> act path from correlated stream events.
**Nodes touched:**
- `engagement_attempt`
- `correlation_envelope`
- `outbound_message`
- `provider_webhook_receipt`
- `conversation_thread`
- `messaging_event_stream`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; External Systems; Infrastructure & Operations

### `obs-10` — Metrics store distinct from raw event log

**Implementation (source):** Durable raw occurrences stay in the stream, while rollups and glance queries live in a separate materialization with drill-through to stream ids.  
**Start:** `metrics_materialization` (new)
**Path:**
1. When raw occurrence events accumulate at `messaging_event_stream`, consumers read them as the durable event log rather than querying shells directly against raw history.
2. When rollup consumers apply `metric_definition`, counters, rates, funnel completions, and windows update in `metrics_materialization`. [separate retention; drill-through preserved]
3. When Oversight, Firm health, Approach instrumentation, or Activation Progress reads a shell value, it reads `metrics_materialization` and cites underlying stream event ids.
4. When a metric value is questioned, `audit_trail` and `messaging_event_stream` provide lineage back to source events and definitions.
**Nodes touched:**
- `messaging_event_stream`
- `metric_definition`
- `metrics_materialization`
- `audit_trail`
**Facets swept:** Data Storage & Management; Core Application & Runtime; Infrastructure & Operations; Cost / FinOps

### `obs-11` — Cardinality discipline for metric labels

**Implementation (source):** Metric series use bounded labels, while contact and attempt detail remains in stream drill-down rather than exploding the aggregation store.  
**Start:** `metric_definition` (existing)
**Path:**
1. When a metric is registered at `metric_definition`, allowed dimensions are constrained to low-cardinality labels such as firm, sequence, channel, event class, outcome class, and reputation unit.
2. When stream events carry contact or attempt detail at `messaging_event_stream`, those high-cardinality values remain drill-down state, not metric labels. [no contact_id, email, body hash, or raw message as metric label]
3. When `metrics_materialization` rolls fleet and sequence rates, it creates bounded series and keeps contact-level evidence reachable through stream event ids.
4. When a proposed metric violates label rules, `pipeline_health` records definition validation failure before the series is materialized.
**Nodes touched:**
- `metric_definition`
- `messaging_event_stream`
- `metrics_materialization`
- `pipeline_health`
**Facets swept:** Data Storage & Management; Infrastructure & Operations; Cost / FinOps; Identity / Security / Compliance

### `obs-12` — Oversight Fleet health materializations

**Implementation (source):** Fleet health and Firm rows receive named stream-backed rollups for volume, delivery success, bounce, complaint, quarantine, and lag.  
**Start:** `metrics_materialization` (existing)
**Path:**
1. When delivery and send events arrive at `messaging_event_stream`, rollup consumers apply fleet SLI `metric_definition` contracts.
2. When those consumers materialize send volume, delivery success, hard-bounce rate, complaint rate, and quarantine count, `metrics_materialization` stores fleet and firm-scoped series.
3. When C1 updates `suppression_list` or `reputation_unit` state from the same delivery classes, Fleet health and Send gates remain aligned.
4. When ingest lag affects freshness, `pipeline_health` adds lag state beside delivery SLIs so Oversight can distinguish reputation health from telemetry health.
**Nodes touched:**
- `messaging_event_stream`
- `metric_definition`
- `metrics_materialization`
- `suppression_list`
- `reputation_unit`
- `pipeline_health`
**Facets swept:** Data Storage & Management; Infrastructure & Operations; Core Application & Runtime; External Systems

### `obs-13` — Firm health Sequence and Engagement materializations

**Implementation (source):** Firm health reads windowed sequence and engagement rates from stream-backed materializations with correlated attempt drill-down.  
**Start:** `firm_tenancy` (existing)
**Path:**
1. When a firm-scoped sequence emits enqueued, sent, delivered, replied, classified-stop, booked, or suppressed-block events to `messaging_event_stream`, every event carries `firm_tenancy` and correlation keys.
2. When `metric_definition` defines sequence windows and step rates, rollup consumers update `metrics_materialization` per firm, sequence, channel, and event class. [tenant-scoped; windowed]
3. When a suppressed-block event comes from C1 send decisions, `send_gate_decision` and `suppression_list` feed the same event path as delivered or replied outcomes.
4. When Sequence detail opens a drop-off cell, `correlation_envelope` and `engagement_record` reconstruct the affected attempt timelines from stream ids.
**Nodes touched:**
- `firm_tenancy`
- `messaging_event_stream`
- `metric_definition`
- `metrics_materialization`
- `send_gate_decision`
- `suppression_list`
- `correlation_envelope`
- `engagement_record`
**Facets swept:** Identity / Security / Compliance; Data Storage & Management; Core Application & Runtime; Infrastructure & Operations

### `obs-14` — Activation Progress as readiness SLIs

**Implementation (source):** Activation Progress shows readiness signals such as producer coverage, delivery health, book-audit pass, and freshness rather than vanity engagement counters.  
**Start:** `metric_definition` (existing)
**Path:**
1. When readiness SLIs are registered at `metric_definition`, each one binds to operational inputs: producer coverage, delivery health, book-audit pass rate, and stream freshness.
2. When C1 readiness state changes at `sending_domain` or `warmup_schedule`, related delivery-health events reach `messaging_event_stream`.
3. When book ingestion or audit events arrive from `import_batch`, readiness materializations update without treating marketing engagement as send readiness.
4. When `pipeline_health` records producer coverage or freshness state, `metrics_materialization` exposes that readiness state to Activation Progress.
**Nodes touched:**
- `metric_definition`
- `sending_domain`
- `warmup_schedule`
- `import_batch`
- `messaging_event_stream`
- `pipeline_health`
- `metrics_materialization`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Infrastructure & Operations; External Systems

### `obs-15` — Approach instrumentation joins first-party steps to proxies

**Implementation (source):** First-party capture and activation steps carry campaign and creative keys so Approach instrumentation can join them to platform proxy aggregates.  
**Start:** `campaign_proxy_aggregate` (new)
**Path:**
1. When ad-platform proxy data is imported at `campaign_proxy_aggregate`, campaign and creative keys become joinable aggregate state rather than a standalone vanity source.
2. When Capture strip and activation steps occur at `prepared_workspace` or `engagement_attempt`, the owning `producer_contract` emits first-party funnel events with the same campaign and creative keys to `messaging_event_stream`.
3. When `funnel_definition` identifies proxy-pair and first-party steps, rollup consumers join `campaign_proxy_aggregate` to stream-backed steps inside `metrics_materialization`. [first-party join required; proxy is not truth alone]
4. When a campaign or creative lacks required keys, `pipeline_health` records producer/key coverage failure and the variant is not scoreable.
**Nodes touched:**
- `campaign_proxy_aggregate`
- `prepared_workspace`
- `engagement_attempt`
- `producer_contract`
- `messaging_event_stream`
- `funnel_definition`
- `metrics_materialization`
- `pipeline_health`
**Facets swept:** External Systems; Data Storage & Management; Core Application & Runtime; Infrastructure & Operations

### `obs-16` — Acquisition reading rules reject vanity CTR

**Implementation (source):** Approach and Acquisition metrics promote form-open, intro-complete, qualified capture, first-text answered, and workspace open ahead of CTR/open diagnostics.  
**Start:** `metric_definition` (existing)
**Path:**
1. When Acquisition or Approach shell metrics are registered at `metric_definition`, primary metrics are marked as form-open, intro-complete, qualified capture, first-text answered, and prepared-workspace open.
2. When CTR or open events enter `messaging_event_stream`, `metric_definition` marks them diagnostic-only so they cannot satisfy primary success or kill/continue criteria.
3. When `metrics_materialization` rolls campaign and approach series, it orders primary outcome series ahead of diagnostic click/open series.
4. When PM-facing reading rules change, `audit_trail` records the metric definition version so older decisions remain interpretable.
**Nodes touched:**
- `metric_definition`
- `messaging_event_stream`
- `metrics_materialization`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance

### `obs-17` — Versioned funnel definitions as operable objects

**Implementation (source):** Shell drop-offs are computed from versioned funnel definitions rather than ad-hoc per-surface step lists.  
**Start:** `funnel_definition` (new)
**Path:**
1. When a funnel is published at `funnel_definition`, ordered taxonomy steps, conversion window, subject key, and primary/diagnostic roles become versioned state.
2. When matching stream events arrive at `messaging_event_stream`, the active `funnel_definition` selects eligible steps by event time and subject key.
3. When completions and drop-offs are computed, `metrics_materialization` stores values tagged to the funnel definition version.
4. When a funnel definition changes, `audit_trail` records the new version and existing historical values keep their prior version binding.
**Nodes touched:**
- `funnel_definition`
- `event_taxonomy`
- `messaging_event_stream`
- `metrics_materialization`
- `audit_trail`
**Facets swept:** Data Storage & Management; Core Application & Runtime; Identity / Security / Compliance; Infrastructure & Operations

### `obs-18` — Freshness SLO for shell fill

**Implementation (source):** Stream-to-shell lag has a declared SLO, and stale Oversight or Firm health projections surface as telemetry health, not current truth.  
**Start:** `pipeline_health` (existing)
**Path:**
1. When freshness budgets are declared at `metric_definition`, delivery and funnel event paths receive ingest-to-materialization lag targets.
2. When events land at `messaging_event_stream`, `pipeline_health` measures producer time, provider receipt time, stream append time, and materialization time. [freshness SLO; p95 lag budget]
3. When lag exceeds budget, `pipeline_health` marks stale state for the affected firm, stream class, or shell scope.
4. When `metrics_materialization` serves shell values, it includes freshness state so operators do not treat stale rates as current.
**Nodes touched:**
- `metric_definition`
- `messaging_event_stream`
- `pipeline_health`
- `metrics_materialization`
- `firm_tenancy`
**Facets swept:** Infrastructure & Operations; Data Storage & Management; Core Application & Runtime; Identity / Security / Compliance

### `obs-19` — Late, duplicate, and out-of-order event handling

**Implementation (source):** Aggregations use event time, watermarks, and idempotent upserts so late or reordered provider and reply events correct shell rates within policy.  
**Start:** `messaging_event_stream` (existing)
**Path:**
1. When provider or runtime events append to `messaging_event_stream`, each event stores occurred time separately from processing time.
2. When duplicate retries land through `provider_webhook_receipt`, stream ids and receipt idempotency keys prevent double application before aggregation.
3. When out-of-order events arrive within a watermark, `metrics_materialization` recomputes affected windows and funnel completions by event time. [event-time truth; late-arrival watermark]
4. When late events arrive outside the policy window, `pipeline_health` records the late-drop or late-audit state and `audit_trail` preserves the correction decision.
5. When Sequence detail reads timelines, `correlation_envelope` orders attempt history by event time while showing late corrections where applied.
**Nodes touched:**
- `messaging_event_stream`
- `provider_webhook_receipt`
- `metrics_materialization`
- `pipeline_health`
- `audit_trail`
- `correlation_envelope`
**Facets swept:** Data Storage & Management; Infrastructure & Operations; External Systems; Identity / Security / Compliance

### `obs-20` — Multi-tenant isolation in the metrics store

**Implementation (source):** Every stream event and metric series is firm-scoped, with fleet rollups allowed only through deliberate Oversight scope.  
**Start:** `firm_tenancy` (existing)
**Path:**
1. When an event is emitted or received, `firm_tenancy` supplies the required tenant key before the event can append to `messaging_event_stream`. [tenant key required]
2. When `metrics_materialization` creates a series, the series is keyed by firm and, for deliverability, reputation unit where applicable.
3. When Firm health queries materialized rates or stream drills, `firm_tenancy` denies peer-firm series and event ids.
4. When Oversight reads Fleet health, `firm_tenancy` allows deliberate fleet rollup while preserving scoped descent into Firm row and Firm health.
5. When an event or metric lacks tenant scope, `pipeline_health` records isolation failure and `audit_trail` preserves the rejected access or ingest outcome.
**Nodes touched:**
- `firm_tenancy`
- `messaging_event_stream`
- `metrics_materialization`
- `reputation_unit`
- `pipeline_health`
- `audit_trail`
**Facets swept:** Identity / Security / Compliance; Data Storage & Management; Core Application & Runtime; Infrastructure & Operations

### `obs-21` — Metric definition audit for every shell tile

**Implementation (source):** Every shell number opens to a versioned metric definition and definition changes are auditable.  
**Start:** `metric_definition` (existing)
**Path:**
1. When a shell tile is made operable, `metric_definition` stores its taxonomy inputs, filters, window, unit, owner, and shell binding.
2. When rollup consumers compute that tile, `metrics_materialization` stores values with the metric definition version and source stream ids.
3. When a user opens the definition behind a shell number, `metric_definition` returns the current formula and `audit_trail` returns the change history.
4. When a metric formula changes, a new definition version is written and historical materializations keep their prior version reference.
**Nodes touched:**
- `metric_definition`
- `metrics_materialization`
- `messaging_event_stream`
- `audit_trail`
**Facets swept:** Data Storage & Management; Identity / Security / Compliance; Core Application & Runtime

### `obs-22` — Pipeline SLIs make ingest health first-class

**Implementation (source):** Oversight sees ingest accept, verify fail, dead-letter, consumer lag, and materialization success so empty shells become incidents.  
**Start:** `pipeline_health` (existing)
**Path:**
1. When provider receipts, stream appends, consumer reads, and rollup writes occur, each producer emits pipeline SLI events to `messaging_event_stream` or updates `pipeline_health` directly at the same event/state altitude.
2. When webhook verification fails at `provider_webhook_receipt`, normalize fails before stream append, or a consumer dead-letters an event, `pipeline_health` records the failed class and affected producer.
3. When consumers lag or materialization writes fail, `pipeline_health` records lag, dead-letter depth, and materialization success state against the freshness SLO.
4. When Oversight Fleet health reads shell-fill state, `metrics_materialization` surfaces Pipeline health beside fleet deliverability SLIs so zeroes are not mistaken for healthy silence.
5. When pipeline SLI thresholds burn, `audit_trail` records the incident-relevant state transitions and source event ids.
**Nodes touched:**
- `pipeline_health`
- `provider_webhook_receipt`
- `messaging_event_stream`
- `metrics_materialization`
- `audit_trail`
**Facets swept:** Infrastructure & Operations; Data Storage & Management; External Systems; Core Application & Runtime
