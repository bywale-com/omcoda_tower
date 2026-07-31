# Pass2+implementation — C7 Instrumentation / analytics pipeline

| Field | Value |
|---|---|
| **Seat** | C7 — Instrumentation / analytics pipeline |
| **Axis** | Capability (how events, metrics, and funnels actually flow) — not vanity dashboard craft |
| **Domain lane** | Event ingestion + metrics/aggregation store + deliverability telemetry join |
| **Who** | Data / observability engineer |
| **Residual** | Event pipeline + metrics store beyond a generalist’s default logging — justified because **Oversight / Firm health shells were committed** and the pipeline that fills them is the missing how (classic methodology rejected pure observability as SME without practice residual; here the residual is the *fill path*, not “apps need charts”) |
| **Focus** | Messaging-stream connective tissue and shell-backed rates/funnels — not decorative product analytics |
| **Revealed** | Event ingestion **new**; Metrics/aggregation store **new**; Deliverability telemetry shared with C1 **new** |
| **Plugs** | **Oversight** / **Fleet health** / **Firm row**; **Firm health** / **Sequence health** / **Engagement health** / **Sequence detail**; **Acquisition & ads** / **Approach instrumentation**; **Activation state** / **Progress**; messaging stream shared with **C1** / **C2** |
| **Item count** | 22 (`obs-01`…`obs-22`) |
| **Boundaries** | Not ESP reputation control logic (C1 owns send-path suppress/warmup/quarantine). Not reply-intent runtime (C2). Not Meta claim/creative law (seat 5) beyond first-party join for Approach instrumentation. Not UI chrome or vanity KPI theater. **Paper only — not Register-integrated.** |
| **Vocab** | [`../implementation/00-SURFACE-VOCAB.md`](../implementation/00-SURFACE-VOCAB.md) |
| **Roster** | [`00-ROSTER.md`](./00-ROSTER.md) §C7 |
| **Handoff default** | both (PM: shell signals / reading rules; CTO: ingest, store, jobs, SLOs) |
| **Status** | Paper only — `implementationPlant: not_done` on every item |
| **As of** | 2026-07-31 |

### Focus gaps

1. **Messaging event stream** as connective tissue (send → deliverability → reply → act → metric) shared with C1/C2  
2. **Event ingestion** (taxonomy, idempotency, webhooks, ordering)  
3. **Metrics / aggregation store** that materializes rates without high-cardinality collapse  
4. **Shell fill contracts** for Oversight, Firm health, Activation state, Approach / Acquisition instrumentation  
5. **Pipeline integrity** (freshness SLOs, late/out-of-order, multi-tenant isolation, definition audit)

---

### obs-01 — Messaging stream is the connective tissue, not a side log

**Question:** What single practice spine must exist so C1 deliverability, C2 runtime decisions, and operator shells read the same occurrence history?  
**References:**
- OpenTelemetry Events semantic conventions — https://opentelemetry.io/docs/specs/semconv/general/events/
- Segment Spec: Event types / Track — https://segment.com/docs/connections/spec/track/
- Capability roster C7 net: “C1, C2, and C7 share the messaging event stream”
**Thesis gap:** Oversight / Firm health shells imply a live record; without one house stream, deliverability webhooks, reply capture, and funnel counters become three disconnected truths.  
**Solution:** Establish one append-only **messaging event stream** as the system of record for send, delivery, engage, reply, classify, act, and booking-path steps so that C1 control loops, C2 runtime, and C7 aggregations consume the same occurrences.  
**Handoff:** cto  
**Revealed:** new (event ingestion)

**implementationProblem:**  
Oversight and Firm health can render empty or invent counts from ad-hoc logs while Sending infrastructure and Conversations keep private side channels — shells never agree with send-path reality.

**implementation:**  
On Oversight Fleet health and Firm health, you can now read rates and timelines sourced only from the messaging event stream — not from orphan ESP dashboard screenshots.  
On Audit trail, you can now open Change event rows that cite stream event ids for send / delivery / reply / act transitions.

**implementationAdds:** `["messaging-event-stream", "stream-system-of-record", "stream-event-id"]`  
**implementationPlant:** not_done

---

### obs-02 — Versioned event taxonomy before any shell KPI

**Question:** How must product occurrences be named and versioned so shells do not invent incompatible counters?  
**References:**
- Segment Spec: Spec / Track / Identify / Page — https://segment.com/docs/connections/spec/
- OpenTelemetry semantic conventions — https://opentelemetry.io/docs/specs/semconv/
- OpenTelemetry metric naming — https://opentelemetry.io/docs/specs/semconv/general/metrics/
**Thesis gap:** Committed shells (Fleet health, Sequence health, Approach instrumentation) imply named steps; without a versioned taxonomy, each producer invents strings and aggregations silently diverge.  
**Solution:** Publish a **versioned event taxonomy** (name, required properties, allowed producers, compatibility rules) and reject ingest of unknown or breaking names so that every shell metric maps to stable event classes.  
**Handoff:** both  
**Revealed:** new (event ingestion)

**implementationProblem:**  
Producers can emit free-text “opened” / “clicked” / “replied” variants; Firm health and Approach instrumentation count different things under the same label.

**implementation:**  
On Oversight, you can now open the Event taxonomy version in force and see which event names feed Fleet health and Firm row metrics.  
On Approach instrumentation and Firm health Sequence detail, you can now see metric → taxonomy-name bindings; unknown names never increment shell counters.

**implementationAdds:** `["event-taxonomy", "taxonomy-version", "unknown-name-reject"]`  
**implementationPlant:** not_done

---

### obs-03 — Required correlation dimensions on every stream event

**Question:** Which identity dimensions must every messaging-path event carry for tenancy, sequence, and attempt join?  
**References:**
- Segment Spec: Common fields / context — https://segment.com/docs/connections/spec/common/
- OpenTelemetry resource / attribute reuse — https://opentelemetry.io/docs/specs/semconv/resource/
- Funnel analytics join practice (ordered steps share a subject key) — Amplitude / Mixpanel funnel docs pattern
**Thesis gap:** Shells show Firm row / Sequence detail; events without firm, sequence, contact, attempt, and channel keys cannot roll up or drill down honestly.  
**Solution:** Require **firm_id, contact_id (or anonymous approach subject), sequence_id / campaign_id, attempt_id (when sequenced), channel, and occurred_at** on every messaging-stream event so that Oversight and Firm health joins are deterministic.  
**Handoff:** cto  
**Revealed:** new (event ingestion)

**implementationProblem:**  
Delivery webhooks or reply captures land without attempt/sequence keys; Sequence health cannot attribute bounce or reply to the attempt that caused them.

**implementation:**  
On Firm health Sequence detail, you can now drill a rate cell to stream events that carry sequence_id + attempt_id + channel.  
On Oversight Firm row, you can now filter fleet metrics by firm_id without orphan events collapsing into “unknown firm.”

**implementationAdds:** `["firm-id", "contact-id", "sequence-id", "attempt-id", "channel", "occurred-at"]`  
**implementationPlant:** not_done

---

### obs-04 — Idempotent ingest with stable event keys

**Question:** How should the pipeline absorb at-least-once webhooks and retries without double-counting shell rates?  
**References:**
- Webhook idempotency patterns (Stripe / ESP: event id + upsert) — https://stripe.com/docs/webhooks#handle-duplicate-events  
- Resend webhooks — https://resend.com/docs/dashboard/webhooks/introduction
- Twilio Event Webhook — https://www.twilio.com/docs/sendgrid/for-developers/tracking-events/event
**Thesis gap:** Provider and internal producers retry; naive append doubles complaint/bounce/open rates that Oversight treats as truth.  
**Solution:** Ingest with a **stable idempotency key** (provider event id or hash of producer + type + subject + occurred_at bucket) and upsert into the stream so that retries do not inflate aggregations.  
**Handoff:** cto  
**Revealed:** new (event ingestion)

**implementationProblem:**  
ESP retries can land the same complaint twice; Fleet health complaint rate spikes and quarantine logic (C1) or operator panic fires on a duplicate.

**implementation:**  
On Oversight Fleet health, you can now trust complaint/bounce rates as deduped stream counts.  
On Audit trail, you can now see ingest outcomes Accepted vs Duplicate-suppressed for a provider delivery event.

**implementationAdds:** `["idempotency-key", "upsert-ingest", "duplicate-suppressed"]`  
**implementationPlant:** not_done

---

### obs-05 — Producer contracts: emit on the path, not scrape later

**Question:** Who must emit which events, and when, so shells are not reverse-engineered from ESP UIs?  
**References:**
- Segment Spec: Track (emit at moment of action) — https://segment.com/docs/connections/spec/track/
- OpenTelemetry instrumentation scope / producer ownership — https://opentelemetry.io/docs/concepts/instrumentation/
- C1 `deliv-14` delivery-event schema adjacency
**Thesis gap:** Register committed observability shells; if producers do not emit at send/reply/book time, C7 cannot invent truth from provider dashboards.  
**Solution:** Bind each taxonomy name to an **owning producer contract** (Sending infrastructure, Conversations / runtime, Booking path, Capture strip) that emits synchronously with the domain action so that stream completeness is a build requirement, not a scrape hope.  
**Handoff:** both  
**Revealed:** new (event ingestion)

**implementationProblem:**  
Firm health Sequence health can show “sends” guessed from ESP exports hours later; Activation state Progress and Oversight disagree with live Send gates.

**implementation:**  
On Firm operations bind / send path adjacency, you can now require stream emit of send-accepted before the attempt is treated as sent for Firm health.  
On Oversight, you can now see producer coverage (which taxonomy names have live emitters vs missing) as a pipeline health signal — not a vanity chart.

**implementationAdds:** `["producer-contract", "emit-on-path", "producer-coverage"]`  
**implementationPlant:** not_done

---

### obs-06 — Signed webhook ingress for deliverability telemetry (shared with C1)

**Question:** What ingress practice must accept ESP/SMS provider webhooks into the house stream safely?  
**References:**
- Resend webhooks verify — https://resend.com/docs/dashboard/webhooks/introduction
- Twilio request validation — https://www.twilio.com/docs/usage/security#validating-requests
- Generic webhook ingestion: verify signature → normalize → enqueue (industry pattern)
**Thesis gap:** C1 owns which delivery outcomes gate sends; C7 owns durable ingest into the stream/metrics store — unsigned or ad-hoc webhook dumps are neither control nor analytics.  
**Solution:** Expose a **signed webhook ingress** that verifies provider signatures, normalizes payloads into the delivery-event schema, and appends to the messaging stream so that deliverability telemetry is shared fact for C1 gates and C7 shells.  
**Handoff:** cto  
**Revealed:** new (deliverability telemetry shared with C1)

**implementationProblem:**  
Without verified ingress, operators paste ESP CSVs into Oversight mental models; Send gates and Firm health never share one delivery timeline.

**implementation:**  
On Sending infrastructure, you can now see Webhook ingress status (signature verify pass/fail, last event) feeding the messaging stream.  
On Oversight Fleet health and Firm health, you can now read delivery outcomes from that shared ingest — same events C1 uses for Suppression list / Warmup counters.

**implementationAdds:** `["webhook-ingress", "signature-verify", "normalize-enqueue"]`  
**implementationPlant:** not_done

---

### obs-07 — Delivery-event schema join into the stream (C1 contract)

**Question:** How does C7 warehouse the C1 delivery-event schema without becoming a second bounce/complaint brain?  
**References:**
- C1 `deliv-14` — delivery-event schema (accepted, deferred, hard/soft bounce, complaint, delivered, rejected)
- M3AAWG sending best practices — https://www.m3aawg.org/sites/default/files/m3aawg-sending-best-practices-3.1.pdf
- Resend / Twilio event catalogs (above)
**Thesis gap:** Dual schemas (control path vs analytics path) recreate divergent rates; shells must project the same classes C1 uses to gate.  
**Solution:** Ingest C1’s **delivery-event schema as first-class stream types** and materialize Oversight / Firm health deliverability rates only from those types so that telemetry is one contract with two consumers (gates + shells).  
**Handoff:** both  
**Revealed:** new (deliverability telemetry shared with C1)

**implementationProblem:**  
Analytics invents “bounce_rate” from mixed soft/hard labels while Send gates suppress only hard bounces — Firm health lies relative to control.

**implementation:**  
On Firm health Sequence health, you can now see hard-bounce, soft-bounce, complaint, deferred, delivered as distinct stream-backed rates aligned with C1 classes.  
On Oversight Fleet health, you can now see reputation-unit rollups built from the same delivery-event types — not a parallel ESP metric dialect.

**implementationAdds:** `["delivery-event-schema", "hard-bounce", "soft-bounce", "complaint", "deferred", "delivered", "rejected"]`  
**implementationPlant:** not_done

---

### obs-08 — Funnel-step events beyond vanity opens

**Question:** Which engagement and outcome steps must be stream events so funnels are practice, not open-rate theater?  
**References:**
- Funnel analytics practice (ordered conversion steps, windows) — https://amplitude.com/docs/analytics/charts/funnel-analysis  
- Segment Spec Track for product funnels — https://segment.com/docs/connections/spec/track/
- Seat 5 Approach proxy pair (ads-15) adjacency — first-party steps after capture
**Thesis gap:** Shells and Approach instrumentation need progression (capture → opt-in → reply → book); optimizing ESP open rate alone is vanity and often unreliable.  
**Solution:** Emit **funnel-step events** for capture submit, opt-in send/accept, nudge send, reply classified, meeting invited, meeting booked (path-membership) as stream facts so that funnels measure motion the product committed to, not vanity opens.  
**Handoff:** both  
**Revealed:** new (event ingestion)

**implementationProblem:**  
Approach instrumentation and Firm health can obsess over open/click while Activation and escrow care about meeting_booked — shells reward the wrong signal.

**implementation:**  
On Approach instrumentation and Firm health Engagement health, you can now read funnel steps from stream events (capture → opt-in → reply → meeting booked) with opens as optional diagnostics only.  
On Activation state Progress, you can now see outcome-step coverage (e.g. first meeting_booked path events) without treating open rate as activation success.

**implementationAdds:** `["funnel-step", "capture-submit", "opt-in", "reply-classified", "meeting-booked", "open-diagnostic-only"]`  
**implementationPlant:** not_done

---

### obs-09 — End-to-end correlation: send → delivery → reply → act

**Question:** How must the stream stitch one attempt’s life so Sequence detail is a chronology, not four tables?  
**References:**
- OpenTelemetry trace / span context propagation concepts — https://opentelemetry.io/docs/concepts/context-propagation/
- Segment Spec: `messageId` / `anonymousId` / `userId` join — https://segment.com/docs/connections/spec/common/
- Roster C7: “a send fires → deliverability telemetry → reply capture → runtime decision → metric”
**Thesis gap:** C2 runtime and C1 webhooks arrive on different clocks; without a correlation spine, Firm health Sequence detail cannot explain what happened to an attempt.  
**Solution:** Propagate a **correlation / attempt envelope** (attempt_id + send message_id) from outbound emit through delivery webhooks and inbound reply/act events so that Sequence detail reconstructs one attempt timeline.  
**Handoff:** cto  
**Revealed:** new (event ingestion)

**implementationProblem:**  
Operators see a bounce and a reply in the same hour with no join; Sequence detail and Conversations cannot prove they belong to one attempt.

**implementation:**  
On Firm health Sequence detail, you can now open an attempt timeline that stitches send → delivery outcomes → reply classified → act from correlated stream events.  
On Engagement record, you can now see the same chronology sourced from the stream (read-only), not a second write model.

**implementationAdds:** `["attempt-envelope", "message-id", "correlated-timeline"]`  
**implementationPlant:** not_done

---

### obs-10 — Metrics store distinct from raw event log

**Question:** What store shape separates durable occurrences from queryable rates that fill shells?  
**References:**
- OpenTelemetry metrics vs logs/events — https://opentelemetry.io/docs/concepts/signals/metrics/
- Metrics aggregation / TSDB practice (rollups, retention tiers) — Prometheus / industry metrics-store patterns
- Segment Profiles / warehouses: raw tracks vs aggregated traits (practice split)
**Thesis gap:** Querying raw events for every Oversight refresh either times out or forces pre-baked vanity summaries with no lineage.  
**Solution:** Maintain a **metrics/aggregation store** fed by stream consumers (counters, rates, funnel completions) with retention separate from raw events so that shells read aggregations while audits can still drill to stream ids.  
**Handoff:** cto  
**Revealed:** new (metrics/aggregation store)

**implementationProblem:**  
Oversight Fleet health either scans the whole event log (unusable) or shows hard-coded mock numbers left from shell construction.

**implementation:**  
On Oversight Fleet health and Firm health, you can now read from the metrics store (rates, funnel completions) with drill-through to underlying stream event ids.  
On Approach instrumentation, you can now read aggregated step rates from the same store — not a browser-only counter.

**implementationAdds:** `["metrics-store", "rollup-consumer", "drill-through-event-id"]`  
**implementationPlant:** not_done

---

### obs-11 — Cardinality discipline: no contact_id as metric label

**Question:** Which dimensions are legal on metrics so the aggregation store survives multi-tenant volume?  
**References:**
- OpenTelemetry metrics: high-cardinality attribute guidance — https://opentelemetry.io/docs/specs/semconv/general/metrics/
- Prometheus / SRE practice: avoid unbounded label sets (contact email, message body hashes)
- Segment Protocols: planned event properties vs trait explosion
**Thesis gap:** Naive “metric per contact” or label-by-email collapses the store; shells go dark under load and teams “fix” with sampled vanity charts.  
**Solution:** Restrict metric labels to **low-cardinality dimensions** (firm, sequence, channel, event class, outcome class, reputation unit) and keep contact/attempt detail in the event stream for drill-down so that fleet aggregations stay operable.  
**Handoff:** cto  
**Revealed:** new (metrics/aggregation store)

**implementationProblem:**  
A metrics design that labels by contact_id or raw email makes Firm health expensive or empty; operators fall back to ESP vanity dashboards.

**implementation:**  
On Oversight Fleet health, you can now aggregate by firm / reputation unit / channel — not by contact.  
On Firm health Sequence detail, you can now drill from a rate to stream events for contacts without those contacts existing as metric label series.

**implementationAdds:** `["low-cardinality-labels", "contact-in-stream-only", "reputation-unit-label"]`  
**implementationPlant:** not_done

---

### obs-12 — Oversight Fleet health materializations

**Question:** Which fleet-level rates must the metrics store materialize so Oversight is not an empty shell?  
**References:**
- SRE / SLI practice for user-facing aggregates — https://sre.google/sre-book/service-level-objectives/
- C1 complaint/bounce ceilings adjacency (`deliv-*` reputation economics)
- OpenTelemetry metrics instruments (counters/histograms) — https://opentelemetry.io/docs/specs/semconv/general/metrics/
**Thesis gap:** Oversight Fleet health was committed as an operator surface; without named materializations, it stays mock UI.  
**Solution:** Materialize **fleet SLI rollups** — send volume, delivery success, hard-bounce rate, complaint rate, quarantine count, stream ingest lag — per firm and fleet so that Oversight Fleet health and Firm row are stream-backed.  
**Handoff:** both  
**Revealed:** new (metrics/aggregation store)

**implementationProblem:**  
Oversight shows placeholder tiles; house cannot see which Firm row is burning reputation until consultants complain.

**implementation:**  
On Oversight Fleet health, you can now see fleet SLIs (volume, delivery success, hard-bounce, complaint, quarantine count, ingest lag) from the metrics store.  
On Oversight Firm row, you can now open the same SLIs scoped to one firm and jump to Firm health.

**implementationAdds:** `["fleet-sli", "delivery-success", "quarantine-count", "ingest-lag"]`  
**implementationPlant:** not_done

---

### obs-13 — Firm health Sequence / Engagement materializations

**Question:** What per-tenancy sequence metrics must flow so Firm health is operational, not decorative?  
**References:**
- Funnel / retention analytics for sequenced messaging (step completion, drop-off)
- Desk-ops adjacency: Firm health as ops brain (seat 4) — read-only chronology + health
- OpenTelemetry + SRE: error budgets / rates over windows
**Thesis gap:** Firm health Sequence health / Engagement health / Sequence detail shells exist; residual is the aggregation path that fills them from the stream.  
**Solution:** Materialize **per-sequence rates** (enqueued, sent, delivered, replied, classified-stop, booked, suppressed-block) over explicit time windows so that Firm health is a projection of the messaging stream.  
**Handoff:** both  
**Revealed:** new (metrics/aggregation store)

**implementationProblem:**  
Sequence health tiles stay zero or hand-waved; operators cannot tell Armed sequences from silently failing ones.

**implementation:**  
On Firm health Sequence health and Engagement health, you can now see windowed rates (sent, delivered, replied, stop, booked, suppressed-block) from the metrics store.  
On Firm health Sequence detail, you can now open drop-off between those steps and drill to correlated attempt timelines.

**implementationAdds:** `["sequence-rates", "suppressed-block", "windowed-rate", "drop-off"]`  
**implementationPlant:** not_done

---

### obs-14 — Activation state Progress as readiness SLIs, not vanity

**Question:** How should Activation state consume pipeline metrics without turning Progress into a marketing scorecard?  
**References:**
- SRE SLI/SLO: indicators tied to user journeys — https://sre.google/sre-book/service-level-objectives/
- C1 warmup / domain-ready gates adjacency
- Seed activation posture: ready-to-send is a gate stack, not a growth dashboard
**Thesis gap:** Activation state Progress is a committed shell; stuffing it with open rates or CAC cosplay invents a second commercial brain.  
**Solution:** Bind Activation state Progress metrics to **readiness SLIs** (taxonomy producer coverage, sending-identity delivery health, book-audit pass rate, stream freshness) so that Progress reflects gate truth, not vanity engagement.  
**Handoff:** both  
**Revealed:** new (metrics/aggregation store)

**implementationProblem:**  
Progress can show “engagement up” while Warmup, SPF, or ingest lag mean the firm is not actually ready — Activation lies.

**implementation:**  
On Activation state Progress, you can now see readiness SLIs (producer coverage, delivery health, book-audit pass, stream freshness) sourced from the metrics store.  
On Activation state Progress, vanity open/CTR tiles are not offered as readiness substitutes.

**implementationAdds:** `["readiness-sli", "producer-coverage", "stream-freshness", "not-vanity-ctr"]`  
**implementationPlant:** not_done

---

### obs-15 — Approach instrumentation: first-party join to Meta proxies

**Question:** How must the pipeline join ad-platform proxies to first-party capture/activation steps without inventing psychometrics?  
**References:**
- Seat 5 `ads-15` proxy pair (impression→no open vs open→abandon/silence)
- Meta funnel / standard events practice — https://www.facebook.com/business/help/435270316658768
- Segment Spec: campaign context + first-party Track join
**Thesis gap:** Approach instrumentation is committed; without C7 join, Operator reads Meta CTR vanity or unjoined first-party counts.  
**Solution:** Ingest Approach / Capture strip first-party funnel-step events with **campaign and creative keys**, join to platform proxy aggregates in the metrics store, and expose both legs on Approach instrumentation so that don’t-understand vs don’t-commit stays measurable.  
**Handoff:** both  
**Revealed:** new (event ingestion + metrics store)

**implementationProblem:**  
Approach instrumentation can show Meta CTR while Capture strip submits never enter the stream — creative tests cannot falsify understanding.

**implementation:**  
On Approach instrumentation, you can now see proxy pair A/B alongside first-party steps (form open, intro complete, capture submit, first-text answered) joined by campaign/creative keys.  
On Acquisition & ads / Approach campaigns, you can now require those keys on Capture strip emits before a variant is scoreable.

**implementationAdds:** `["campaign-key", "creative-key", "proxy-pair-join", "first-party-steps"]`  
**implementationPlant:** not_done

---

### obs-16 — Acquisition instrumentation reading rules reject vanity CTR

**Question:** What reading rules must the metrics layer enforce so Acquisition & ads does not optimize empty clicks?  
**References:**
- Seat 5 `ads-16` / `ads-17` — score form-open / intro-complete; continue-scroll as self-selection
- Funnel analytics: primary conversion ≠ click-through
- SRE: choose SLIs that reflect user outcomes, not easy counters
**Thesis gap:** Pipeline can still materialize CTR because it is easy; practice residual is refusing vanity as the Acquisition instrumentation primary.  
**Solution:** Define Acquisition / Approach instrumentation **primary metrics** as form-open, intro-complete, qualified capture, first-text answered, prepared-workspace open — and demote CTR/open to diagnostic-only series so that the store does not privilege vanity.  
**Handoff:** pm  
**Revealed:** new (metrics/aggregation store)

**implementationProblem:**  
Default aggregations surface CTR first; operators scale spend on legible-looking clicks that never become captures.

**implementation:**  
On Approach instrumentation, you can now see primary metrics (form-open, intro-complete, qualified capture, first-text answered, prepared-workspace open) ahead of diagnostic CTR/open.  
On Acquisition & ads, kill/continue criteria bind to those primaries — not CTR alone.

**implementationAdds:** `["primary-metric", "diagnostic-ctr", "qualified-capture", "prepared-workspace-open"]`  
**implementationPlant:** not_done

---

### obs-17 — Versioned funnel definitions as operable objects

**Question:** How are multi-step funnels defined so shell drop-offs stay comparable across time?  
**References:**
- Funnel analysis: ordered steps + conversion windows — https://amplitude.com/docs/analytics/charts/funnel-analysis  
- Segment Protocols / Tracking Plans as versioned contracts
- OpenTelemetry: stable names before consumers depend on them
**Thesis gap:** Ad-hoc “funnel” SQL in each shell diverges; Approach vs Firm health vs Activation disagree on what “converted” means.  
**Solution:** Store **versioned funnel definitions** (ordered taxonomy steps, conversion window, subject key, primary vs diagnostic) and compute completions only from those versions so that shell drop-offs are reproducible.  
**Handoff:** both  
**Revealed:** new (metrics/aggregation store)

**implementationProblem:**  
Each surface invents its own step list; a “reply rate” on Firm health is incomparable to Approach instrumentation “answered.”

**implementation:**  
On Approach instrumentation and Firm health, you can now select a Funnel definition version and see step drop-off computed from that version.  
On Oversight, you can now see which funnel versions feed Firm row summary chips — changing a definition creates a new version rather than rewriting history silently.

**implementationAdds:** `["funnel-definition", "conversion-window", "funnel-version"]`  
**implementationPlant:** not_done

---

### obs-18 — Freshness SLO for shell fill (lag budget)

**Question:** How fresh must stream→metrics materialization be for operator shells to be operable?  
**References:**
- Google SRE: SLIs/SLOs and error budgets — https://sre.google/sre-book/service-level-objectives/
- Data pipeline freshness / lag monitoring practice (warehouse SLO patterns)
- Webhook ingestion: process within a declared budget or alert
**Thesis gap:** Empty shells and hour-late shells are both failures; without a lag SLO, house treats stale Firm health as truth.  
**Solution:** Publish a **freshness SLO** (e.g. p95 ingest-to-shell lag budget for delivery and funnel events) and surface ingest lag on Oversight so that stale projections are visible and alerting, not silent.  
**Handoff:** cto  
**Revealed:** new (metrics/aggregation store)

**implementationProblem:**  
Firm health can show yesterday’s complaint rate as current; operators arm volume into an already-burning reputation unit.

**implementation:**  
On Oversight Fleet health, you can now see stream ingest lag against the freshness SLO and alert when the lag budget burns.  
On Firm health, you can now see Freshness state (within SLO / stale) beside Sequence health rates.

**implementationAdds:** `["freshness-slo", "ingest-lag", "stale", "lag-budget"]`  
**implementationPlant:** not_done

---

### obs-19 — Late, duplicate, and out-of-order event handling

**Question:** How should aggregations treat provider events that arrive late or reordered relative to send?  
**References:**
- Stream processing: event-time vs processing-time, watermarks (industry practice)
- Webhook retries / delayed ESP events (Twilio/Resend at-least-once)
- Funnel windows: late conversions inside vs outside window
**Thesis gap:** Naive increment-at-process-time mis-orders Sequence detail and double-applies under retries even after idempotent raw ingest.  
**Solution:** Aggregate on **event time** with an explicit late-arrival watermark and funnel window rules, applying idempotent upserts so that out-of-order delivery/reply still corrects rates within policy.  
**Handoff:** cto  
**Revealed:** new (event ingestion + metrics store)

**implementationProblem:**  
A deferred→delivered correction never updates Firm health; or a late reply falls into the wrong day and Sequence detail lies.

**implementation:**  
On Firm health Sequence detail, you can now see timelines ordered by event time, with late corrections applied inside the watermark.  
On Approach instrumentation funnels, you can now see completions counted inside the Funnel definition window even when the step event arrives late.

**implementationAdds:** `["event-time", "watermark", "late-correction", "processing-time-not-truth"]`  
**implementationPlant:** not_done

---

### obs-20 — Multi-tenant isolation in the metrics store

**Question:** What isolation rules prevent cross-firm metric leakage in house-global Oversight vs per-tenancy Firm health?  
**References:**
- Multi-tenant SaaS telemetry isolation practice (tenant key on every series)
- OpenTelemetry resource attributes for tenants — https://opentelemetry.io/docs/specs/semconv/resource/
- Capability blast-radius adjacency (C1 reputation units)
**Thesis gap:** A shared metrics store without firm scoping can leak Sequence health across Firm rows or pollute fleet rollups.  
**Solution:** Key every metric series by **firm_id (and reputation unit where deliverability)** and enforce query scopes — Oversight fleet may roll up, per-tenancy Firm health may not read peer series — so that isolation matches product tenancy.  
**Handoff:** cto  
**Revealed:** new (metrics/aggregation store)

**implementationProblem:**  
A query bug or missing tenant key can show Firm B’s complaint spike on Firm A’s Firm health — or leak contact-level drill into the wrong tenancy.

**implementation:**  
On Firm health, you can now read only the bound firm’s metric series and stream drills.  
On Oversight Fleet health, you can now roll up across firms deliberately; Firm row drill stays scoped when descending into Firm health.

**implementationAdds:** `["tenant-keyed-series", "fleet-rollup", "peer-series-deny"]`  
**implementationPlant:** not_done

---

### obs-21 — Metric definition audit: formula behind every shell tile

**Question:** How do operators and builders know what a shell number means months later?  
**References:**
- Segment Protocols / Tracking Plans — documented metrics contracts
- SRE: SLI definition clarity (what is measured) — https://sre.google/sre-book/service-level-objectives/
- dbt / metrics layer practice: versioned metric definitions with owners
**Thesis gap:** Shells without published formulas become folklore; PM/CTO “fix” vanity when definitions drift.  
**Solution:** Attach each shell tile to a **versioned metric definition** (taxonomy inputs, filters, window, unit, owner) stored beside the metrics store so that Oversight / Firm health / Approach instrumentation numbers are auditable.  
**Handoff:** both  
**Revealed:** new (metrics/aggregation store)

**implementationProblem:**  
Two operators argue whether Sequence health “reply rate” includes stops or only positive intent — no definition artifact exists.

**implementation:**  
On Oversight, Firm health, and Approach instrumentation, you can now open Metric definition for any tile (inputs, window, unit, taxonomy version, owner).  
On Audit trail, you can now see Change event when a metric definition version ships.

**implementationAdds:** `["metric-definition", "definition-version", "tile-binding"]`  
**implementationPlant:** not_done

---

### obs-22 — Pipeline SLIs: ingest health is first-class (not a vanity dashboard)

**Question:** What meta-telemetry proves the observability pipeline itself is working so empty shells are caught as incidents?  
**References:**
- Google SRE: monitoring the monitoring / pipeline SLOs — https://sre.google/sre-book/monitoring-distributed-systems/
- Dead-letter / poison-message patterns for webhook consumers
- OpenTelemetry: collector / exporter health metrics practice
**Thesis gap:** Classic methodology rejected dashboards-for-their-own-sake; the residual here is **operable fill** — if ingest dies, committed shells must scream.  
**Solution:** Emit **pipeline SLIs** (ingress accept rate, verify-fail count, normalize-fail/dead-letter depth, consumer lag, materialization success) to Oversight so that a dark Firm health is an incident, not a quiet empty UI.  
**Handoff:** cto  
**Revealed:** new (event ingestion + metrics store)

**implementationProblem:**  
Webhook secret rotates or a consumer stalls; Oversight still paints zeros as if the fleet were healthy — the worst vanity failure mode.

**implementation:**  
On Oversight Fleet health, you can now see Pipeline health (ingress accept, verify-fail, dead-letter depth, consumer lag, materialization success) beside fleet deliverability SLIs.  
On Oversight, you can now alert when Pipeline health burns its SLO even if vanity tiles still render.

**implementationAdds:** `["pipeline-sli", "verify-fail", "dead-letter-depth", "consumer-lag", "materialization-success"]`  
**implementationPlant:** not_done

---

## Handoff summary (C7)

| Owner | Absorb |
|---|---|
| **PM** | Shell reading rules (primary vs diagnostic); Approach / Acquisition primaries; Activation Progress = readiness SLIs; Funnel definition visibility; Metric definition on tiles; no vanity CTR as success |
| **CTO** | Messaging event stream; taxonomy enforcement; webhook ingress; idempotency; correlation envelope; metrics store + cardinality; materializations; freshness/pipeline SLOs; tenant isolation; late/event-time handling |
| **Shared with C1** | Delivery-event schema types; signed webhook → stream; rates that match suppress/warmup/quarantine classes (`obs-06`, `obs-07`, `obs-12`) |
| **Shared with C2** | Reply/classify/act emits on producer contracts; attempt correlation into Sequence detail (`obs-05`, `obs-08`, `obs-09`, `obs-13`) |
| **Not this seat** | Reputation quarantine logic (C1); intent classification policy (C2); Meta claim law (seat 5); CASL silence law (seat 3); decorative product-analytics wishlist |

## Revealed-surface coverage

| Revealed surface | Status | Items |
|---|---|---|
| Event ingestion (sends, opens, replies, bookings, funnel steps) | **new** | `obs-01`…`obs-05`, `obs-08`, `obs-09`, `obs-15`, `obs-19` |
| Metrics/aggregation store | **new** | `obs-10`…`obs-14`, `obs-16`…`obs-18`, `obs-20`…`obs-22` |
| Deliverability telemetry (webhooks → metrics), shared with C1 | **new** | `obs-06`, `obs-07`, `obs-12`, `obs-18`, `obs-22` |

## Cross-cutting watch

| Edge | Items |
|---|---|
| **C1** delivery-event schema / webhook control path | `obs-06`, `obs-07`, `obs-12` |
| **C2** reply → classify → act on same stream | `obs-01`, `obs-05`, `obs-08`, `obs-09`, `obs-13` |
| **Seat 5** Approach proxy pair / kill-continue | `obs-15`, `obs-16`, `obs-17` |
| Messaging stream as connective tissue (roster net) | `obs-01`…`obs-09` spine |

## Counts

| Metric | Count |
|---|---|
| Items (`obs-01`…`obs-22`) | **22** |
| With Solution (`<mechanism> so that <purpose>`) | **22** |
| With implementation bridge | **22** |
| Surfaces named | **Oversight** / **Fleet health** / **Firm row** · **Firm health** / **Sequence health** / **Engagement health** / **Sequence detail** · **Acquisition & ads** / **Approach campaigns** / **Capture strip** / **Approach instrumentation** · **Activation state** / **Progress** · **Sending infrastructure** (ingress adjacency) · **Engagement record** · **Audit trail** / **Change event** |
| Register integration | **Not done** — paper only, awaiting validation |

**Path:** `/workspace/docs/sme/capability/C7-instrumentation-analytics.md`
