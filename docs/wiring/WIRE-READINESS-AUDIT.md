# Wiring — readiness audit (what is "sufficient," and where the pass stopped)

**Purpose:** Define the bar a node must reach to be legitimately *in the wiring*, find the exact categorical level where the wiring pass stopped, explain **why it stopped there**, and — because a stopping level is systemic, not local — list **everything else sitting at that same level**. This is the sprint input, not an ad-hoc build list.

**Companions:** [`NODE-DEFINITION.md`](./NODE-DEFINITION.md) · [`STANDIN-WIRING.md`](./STANDIN-WIRING.md) · [`external-models/00-INDEX.md`](./external-models/00-INDEX.md) · canonical nodes [`paper-trace/CANONICAL-NODES.md`](./paper-trace/CANONICAL-NODES.md)

---

## 1. Sufficiency — the maturity ladder

Every node moves through the same rungs. The bar to be "considered wired" is **M4**, not "there is a port" and not "the UI shows it."

| Rung | Name | What exists | Wire-ready? |
|---|---|---|---|
| **M0** | **Named** | Node in the canonical registry / external inventory. No port, no code. | No |
| **M1** | **Depicted** | Static UI / fixture data shows the *outcome* of the node, but nothing produces it; the app calls no port. | No |
| **M2** | **Contracted** | A port interface (`ports.ts`) names the `In → Out → Readers`. | No |
| **M3** | **Stubbed** | A stand-in implements the port *shallowly* — returns shaped values but does **not** satisfy the full `modelContract` (missing state transitions, event ingress, temporal behavior, or readers). The app calls it, so it *looks* wired. | **No — false green** |
| **M4** | **Sufficient (WIRE-READY)** | Stand-in fully satisfies the `modelContract`: all inputs, outputs, state transitions, and the readers the rest of the app depends on; human residue is fixture-gated and fails closed; the app runs production-real against it. | **Yes** |
| **M5** | **Real** | Real external swapped behind the same port (Resend/Twilio/Postgres). | Yes (beyond the bar) |

**Sufficiency = M4.** M3 is the dangerous rung: it passes a glance ("there's a port, the app calls it") while failing the contract. Escrow is the textbook M3.

The M4 definition is not new — it is `STANDIN-WIRING.md` ("the rest of the app is real against those contracts") + the fixture-honesty rule (fail closed, never fake a human act) + the `external-models` `modelContract` (In → Out → Readers) applied literally.

---

## 2. Where the pass stopped — one categorical line

Sort every node by **how its state changes**, and the entire pass falls into two piles with a hard line between them:

- **Callable nodes** — state changes *synchronously, in response to a call* on a user click-path (send this email, verify this OTP, commit this halt, store this row, decide this gate). **These reached M4/M5.**
- **Running nodes** — state changes *over time or in response to an inbound event*: a background runner fires on a schedule, a webhook arrives asynchronously, a stream is appended and later projected. **These stopped at M0/M1** — Named in the registry and Depicted as static Activity rows, but never Contracted.

The engagement system is not a special failure. It is simply **the most visible member of the running pile**, because its entire essence *is* the runtime loop.

### Why it stopped exactly there

`STANDIN-WIRING.md`'s unit of work is the **click-path**: *"Trace the click-path → wire in-app→in-app → at each external need create a stand-in."* A click-path is, by construction, **user-initiated and request→response**. That method can only ever reach callable nodes. It has **no unit of work for "a process that runs"** — no step that says "stand up a clock, append an event, and let a reducer react." So every node whose truth unfolds over time fell off the end of the pass. It got **Depicted** (static rows, so the UI reads correctly) and **Named** (in the node registry), and then there was no *click* that would have forced a port into existence — so it never reached M2.

The `external-models/01` doc even self-diagnoses this in bold — *"A CT-worthy fake engagement runtime is not a table of static Activity rows. It must mimic the fail-closed loop"* — and then lists the loop stand-ins as **gaps**. They were correctly named as missing and never built, because the method had no move that builds them.

---

## 3. The root cause — four missing substrate primitives

The running pile is not blocked node-by-node. It is blocked on **four in-app substrate stand-ins that do not exist**, and every running node needs them:

| Missing primitive | Canonical node it embodies | Without it… |
|---|---|---|
| **Clock / runner** | `attempt_job_queue` (+ every `queue-job`) | nothing fires on a schedule; no retries, no owner escalation, no cadence |
| **Event stream** | `messaging_event_stream` (+ `outcome_verification_event`) | there is nowhere for open/click/reply/delivery/booking events to live |
| **Event ingress (inject)** | `provider_webhook_receipt` | opens/clicks/replies/payment events can never *enter* the app to be reacted to |
| **Projection / reducer** | `engagement_record`, `metrics_materialization` | events can't be folded into the read-models the UI already depicts |

Build these four as stand-ins (in-process memory is fine — that is the doctrine) and **the entire running pile becomes buildable to M4**. Skip them and **not one** running node can reach sufficiency. This is why it felt like you had to "make things real": the only way anyone found to get *any* reactive truth (hard-bounce → silence) was to reach past the missing substrate to a real webhook — `server/wire-service/webhooks.ts`. And even there, note `mapClass()` returns `null` for `email.opened` and `email.clicked`: the two events the engagement loop most needs are **dropped on the floor**, real path included.

---

## 4. The gap map — everything at each level

Grouped by the callable/running line, using the canonical registry's own `altitude` column as the predictor.

### Reached M4/M5 — callable (wire-ready or real)

| Node (port) | Level | Note |
|---|---|---|
| `outbound_message` (`espMailer`) | M5 | Resend via `/wire/send/cem` |
| SMS send (`smsApi`) | M5 | Twilio via `/wire/send/sms` |
| `otp` challenge/session (`otpStore`) | M5 | `/auth` |
| `sending_domain` (`sendingPool`) | M4/M5 | allocate/verify (temporal warmup stays human) |
| `suppression_list` / halt (`haltStore`) | M4/M5 | commit/lift/list |
| `consent_record` (`consentSilence`) | M4/M5 | set/silence/get |
| `audit_trail` (`auditTrail`) | M4/M5 | append/list |
| `send_gate_decision` (`sendGate`) | M4* | composes halt/consent/oauth/warmup reads. *Shallow only because its inputs (live reputation/warmup/suppression events) are themselves M0. |
| CRM grant (`crmOAuth`) | M4/M5 | grant/revoke |
| `warmup_schedule` (`warmup`), `ip_pool_tier` (`ipPool`) | M4* | callable state machines that **never tick** — no runner advances them. |

### Stuck at M3 — false-green stubs (look wired, fail the contract)

| Node (port) | Missing to reach M4 |
|---|---|
| `escrow_ledger_entry` / `held_balance` (`escrow`) | only `get`/`hold` exist; missing capture, release/return/forfeit, disputes, `payment_webhook_receipt`, `escrow_status_machine`, `release_attempt` — i.e. its **entire event-driven half** (which is M0). Same fracture as §2, inside one node. |
| CEM mailer (`mailer`, legacy) | accept-only; no delivery/open/click events feeding criteria |
| `metaAds`, `enrichCrawl`, `listUnsubscribe` | one-dimensional stubs; contracts (webhooks, crawl responses, one-click POST) not modeled |

### Stuck at M0/M1 — running (Named + Depicted, never Contracted)

Every one of these is `queue-job`, `stream`, or a `table`/`ledger` that only changes via a runner or inbound event. This is the systematic backlog — the answer to *"what am I not thinking about."*

- **C2 engagement runtime (the visible one):** `attempt_job_queue`, `engagement_attempt`, `sequence_enrollment`, `sequence_instance`, `sequence_rule_set`, `campaign_calendar`, `criteria_window`, `sequence_finish_state`, `auto_reply_pause`, `runtime_tool_invocation`, `support_context_bundle`, `human_disposition`, `triage_context_snapshot`, `escalation_ticket`, `conversation_thread`, `intent_classification`, `engagement_record`, `messaging_event_stream`, `provider_webhook_receipt`
- **C1 reactive deliverability:** `provider_throttle_state`, `reputation_unit` (event-fed), `provider_reputation_feed`, open/click ingest (dropped today)
- **C3 reference cadence:** `ingestion_run`, `reference_detect_cursor`, `reference_diff`, `re_score_job`, `recheck_cadence`, `reconciliation_job`, `client_score_snapshot` (re-score-driven), `board_phase_signal`, `reference_freshness_state`
- **C5 hydrate:** `hydrate_job` (crawl→brand→prepared as a run, not a call)
- **C6 escrow reactive:** `payment_webhook_receipt`, `escrow_status_machine`, `release_attempt`, `release_evidence_package`, `dispute_freeze`, `measurement_window`, `outcome_verification_event`
- **C7 metrics:** `metrics_materialization`, `pipeline_health`, `correlation_envelope`, `producer_contract`, `event_taxonomy`, `funnel_definition` (all materialize *over the stream* that doesn't exist)

### Human-only residue (never climbs past a fixture — by design)

DNS (SPF/DKIM/DMARC/return-path/PTR), Postmaster/FBL, TCR/A2P, Meta Business verification, KYB/funding (`provider_payment_identity`), counsel MT/MSB (`counsel_gate`). These stay at "in-app chip + fail-closed fixture." Correct as-is; not a gap.

---

## 5. What "sufficient" therefore requires (sprint definition, not ad-hoc)

1. **Build the substrate first** (§3): `clock/runner`, `event_stream`, `event_ingress(inject)`, `projection/reducer` as in-app stand-in ports. Nothing in the running pile is wire-able before these.
2. **Stop dropping events:** `mapClass()` must ingest `email.opened` / `email.clicked` (real path) and the ingress stand-in must accept injected opens/clicks/replies/form-visits.
3. **Bring each running node to M4** on top of the substrate, in capability order (C2 engagement loop first — it is the product's heart — then C6 escrow reactive half, C1 reputation feedback, C3 cadence, C7 metrics).
4. **Drive the Activity panel from the stream**, not from `sarahNudgeTimeline.ts` — the same read-models the reducer produces. When "opened → clicked → no-reply after N → escalate → HITL ticket" happens in front of you, C2 is M4.
5. **Promote M3 stubs** (escrow, mailer, metaAds, enrichCrawl, listUnsubscribe) to their full contracts — escrow's reactive half comes free once the substrate + payment-ingress exist.

**One-line summary:** the pass wired everything you *call* and stopped at everything that *runs*; the fix is a four-part in-app runtime substrate, after which every reactive node — engagement, escrow, reputation, cadence, metrics — becomes sufficient the same way, in one systematic sprint.
