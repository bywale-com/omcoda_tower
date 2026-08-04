# Capability SME pass

**Axis:** not "who is *responsible* for X" (compliance) but "who knows **how to actually accomplish** X" (capability).
**Why it matters:** compliance considerations mostly *modify* (copy, gates, flags). Capability considerations mostly *add* — modules, pipelines, syncs — because "we will need this to work" surfaces product that isn't in the register yet.
**Residual rule (same engine, new axis):** a capability seat exists where the product committed to *doing* something whose **how** requires specialist depth a proficient generalist CTO would not own by default. Pure generalist wiring = CTO, not a seat.
**Densify:** [`../implementation/DENSIFY-LAW.md`](../implementation/DENSIFY-LAW.md) — affordance grain on every `implementation` block; prefer existing module shapes (Audit run → Verdict list, Workflow canvas nodes, Bind packs modal). Register twins via `scripts/sync-capability-sme-from-docs.py`.

Each seat: the capability · who holds the know-how · the residual · and the **revealed surfaces** (the payload) tagged `exists` / `partial` / `new` against the current register.

---

## C1 — Email / SMS deliverability & sending infrastructure  *(the trigger)*

**Capability:** actually land firm-branded messages in inboxes, at volume, without burning reputation.
**Who:** email-deliverability / messaging-infra engineer.
**Residual:** deliverability is a genuine specialty (domain auth, reputation, warmup, complaint economics) — not covered by "we use Resend/Twilio." Compliance seat gave consent; nobody gave *inbox placement*.

**Revealed surfaces:**
| Surface / capability | Status | Plugs into |
|---|---|---|
| Sending-domain pool + per-firm branded subdomains (SPF/DKIM/DMARC) | **new** | Operator house-global — "Sending infrastructure" module |
| Warmup scheduler (ramp new domains/firms before volume) | **new** | Sending infrastructure; gates Activation-state "ready to send" |
| Sender-reputation + bounce/complaint monitoring (Resend/Twilio webhooks) | **new** | Feeds Oversight deliverability + Firm health |
| Suppression list model (hard bounces, complaints, opt-outs) — global + per-tenancy | **new** | Consumed by **Firm operations bind · Send gates** before every send |
| From-address strategy (firm-branded vs shared) + reply-path | **partial** (sender identity named in CASL, mechanics unspecified) | Sending infrastructure |
| Dedicated-vs-shared IP decision + throttle | **new** | Sending infrastructure |

**Net:** one new operator module (**Sending infrastructure**) + a suppression model that Send gates must consult. This is the single biggest capability gap — the product's core motion is messaging and the inbox-reaching layer was never designed.

---

## C2 — Agentic engagement runtime (read → decide → act)

**Capability:** run a live sequence that reads replies, classifies intent, picks the next channel/attempt, and escalates — the thing that makes engagement *hands-free*, not a static drip.
**Who:** applied-AI / agent-systems engineer + conversation designer.
**Residual:** the attempt/channel state machine and reply-reading loop are specialist (LLM tool-use, intent classification, escalation policy) beyond generic backend.

**Revealed surfaces:**
| Surface / capability | Status | Plugs into |
|---|---|---|
| Inbound reply capture + intent classification (booked / question / stop / hostile) | **new** | Powers Engagement record; triggers Send-gate re-check |
| Attempt/channel state machine at runtime (one owner, forward-only, override on inbound) | **partial** (Sarah's-nudge model documented, not built) | Firm operations bind (armed/active) |
| Human-in-loop escalation queue (agent unsure / hostile / edge) | **new** | Customer support ticket queue |
| Reply inbox / triage for operator | **new** | Operator — new "Conversations" surface, distinct from the read-only Engagement record |

**Net:** the runtime that the whole "consultant does nothing" outcome depends on is documented as *behavior* but has no build home. Adds a Conversations/triage surface + escalation wiring.

---

## C3 — Eligibility evaluation + reference-data currency

**Capability:** keep versioned immigration criteria current and re-score clients as law/data moves — the "law side of detection."
**Who:** rules-engine engineer + the immigration domain SME (already rostered) working together.
**Residual:** the ingestion + versioning pipeline is a capability the domain SME can't build and a generalist wouldn't design for auditability.

**Revealed surfaces:**
| Surface / capability | Status | Plugs into |
|---|---|---|
| Reference-table ingestion (IRCC/CRS draws → versioned tables, scrape+verify) | **new** | Operator — Reference data (module shell exists; pipeline doesn't) |
| Rule-version diff + "what changed → who re-scores" | **partial** | Reference data / Evaluation packs |
| Re-evaluation trigger on write-back (form answer → re-score → next motion) | **partial** (named in outcomes, not built) | Client Data write-back → Board signal |
| Freshness/volatility flags + recheck cadence (from HANDOFF ref-23) | **new** | Reference data |

**Net:** the deterministic engine's *logic* is well-specified; the **pipeline that keeps it current** is the gap.

---

## C4 — Book ingestion, normalization & identity resolution

**Capability:** turn a firm's messy book (CSV / vertical CRM) into evaluable, reachable, deduped records mapped to Q-IDs.
**Who:** data-integration engineer.
**Residual:** field mapping, dedup/identity resolution, and incremental sync are specialist data work beyond the import-form the prototype has.

**Revealed surfaces:**
| Surface / capability | Status | Plugs into |
|---|---|---|
| Field → Q-ID mapping + normalization | **partial** (CSV import flow exists, shallow) | Imports |
| Dedup / identity resolution (same person, many rows) | **new** | Imports → Book readiness |
| Email/phone validation-class checks (reachability, from CRM seat crm-208) | **new** | Book readiness audit |
| Incremental sync + vertical CRM OAuth | **deferred** (KU #7) | Provision / Imports |

**Net:** ingestion is where "reachable book" is actually earned; today it's a thin import form.

---

## C5 — Forward-deploy generation (public facts → prepared workspace)

**Capability:** build a firm-branded, no-login prepared campaign from public facts *before* the firm connects anything — the thing that makes the Approach land.
**Who:** scraping/enrichment + templating engineer.
**Residual:** public-facts extraction, branding capture, and secure no-login token access are specialist and entirely unbuilt.

**Revealed surfaces:**
| Surface / capability | Status | Plugs into |
|---|---|---|
| Public firm-facts enrichment (site, Google, listings) | **new** | Activation & forward-deploy |
| Template hydration → Prepared Workspace instance | **partial** (Prepared Workspace surface exists, generator doesn't) | Prepared Workspace |
| No-login secure token access + expiry | **new** | Prepared Workspace / contact touchpoints |
| Branding extraction (logo, palette, voice) | **new** | Activation |

**Net:** the surface exists; the **generator behind it** is unbuilt. No enrichment engine = no forward-deploy.

---

## C6 — Escrow / contingent-payment mechanics

**Capability:** actually hold money and release it on a *verified* outcome (`meeting_booked` under an activated campaign).
**Who:** payments engineer + the escrow-law SME (partially rostered).
**Residual:** Stripe Connect/escrow flows and outcome-verified release triggers are specialist beyond generic Stripe checkout.

**Revealed surfaces:**
| Surface / capability | Status | Plugs into |
|---|---|---|
| Escrow ledger (held / released / refunded per firm) | **new** | Commercial · Escrow status |
| Outcome-verification → release trigger (booking confirmed → release) | **partial** (release unit defined esc-01, mechanic not built) | Release control ← Engagement runtime |
| Money-transmitter boundary handling (esc-21, counsel-gated) | **blocked** (counsel) | Commercial |

**Net:** Commercial surface exists; the ledger + verified-release wiring is new and partly counsel-gated.

---

## C7 — Instrumentation / analytics pipeline

**Capability:** the data behind the observability shells — events, metrics, funnels — actually flowing.
**Who:** data/observability engineer.
**Residual:** event pipeline + metrics store beyond a generalist's default logging.

**Revealed surfaces:**
| Surface / capability | Status | Plugs into |
|---|---|---|
| Event ingestion (sends, opens, replies, bookings, funnel steps) | **new** | Feeds Oversight / Firm health / Acquisition instrumentation |
| Metrics/aggregation store | **new** | Oversight, Activation-state, Approach instrumentation |
| Deliverability telemetry ingestion (webhooks → metrics) | **new** | shared with C1 |

**Net:** the dashboards were built as shells; the pipeline that fills them is the capability.

---

## What this pass changes (the pattern)

Compliance modified surfaces. **Capability adds them.** New homes this pass surfaces, none of which the compliance pass could have:

- **Sending infrastructure** (operator, house-global) — C1
- **Conversations / reply-triage** (operator) — C2
- **Reference-data ingestion pipeline** — C3
- **Enrichment / forward-deploy generator** — C5
- **Escrow ledger + release trigger** — C6
- **Event/metrics pipeline** — C7
- plus a **suppression model** that Send gates must consult across C1/C2.

And one cross-cut worth naming: **C1, C2, and C7 share the messaging event stream** (a send fires → deliverability telemetry → reply capture → runtime decision → metric). That stream is the connective tissue and it doesn't exist yet — it's the highest-leverage single build.

---

## Next (Pass1 depth)
This is the roster + revealed-surface payload. Pass1 per seat would source the *how* specifics (warmup schedules, DMARC alignment, dedup thresholds, escrow flow) the way the compliance pass sourced statutes — but the product-changing output is already here: the surfaces above are the ones to fold into personas/outcomes/how before build, the same way the customer-support miss got folded.

---

## Pass2 + implementation (paper) — status

**Done (awaiting human validation):** combined Pass2 considerations/solutions + PM implementation click-paths for C1–C7.

| Entry | Path |
|---|---|
| **Start here** | [`CAPABILITY-CONSIDERATIONS.md`](./CAPABILITY-CONSIDERATIONS.md) |
| C1–C7 bodies | `C1-…` … `C7-…` in this folder |
| **Register absorb** | **Not started** — validate paper first |
