# Capability SME — considerations · solutions · implementation

**Status:** Paper only — **not** absorbed into Register twins, HANDOFF, or CT plant.  
**Downstream (paper Wiring):** CTO Think Stack steps 1–4 filed under [`../../wiring/paper-trace/`](../../wiring/paper-trace/) — Function traces / Can’ts / Furnish / node buckets. Still awaiting human validation before absorb.  
**Axis:** Capability (“who knows **how to accomplish** X”), not compliance (“who is responsible for X”).  
**Roster source:** [`00-ROSTER.md`](./00-ROSTER.md) (C1–C7)  
**Methodology:** [`../METHODOLOGY.md`](../METHODOLOGY.md) — Pass2 `<mechanism> so that <purpose>` + PM implementation bridge (`implementationProblem` / `implementation` / `implementationAdds`)  
**Surface vocab:** [`../implementation/00-SURFACE-VOCAB.md`](../implementation/00-SURFACE-VOCAB.md)  
**Compliance seats (do not confuse):** [`../ROSTER.md`](../ROSTER.md) seats 1–7 — already shipped; this package **adds** capability seats beside them.

---

## How to validate

1. Read [`00-ROSTER.md`](./00-ROSTER.md) for why each seat exists and which surfaces it reveals (`exists` / `partial` / `new`).
2. Review each seat file below (Pass2 + implementation interleaved per item — same shape as compliance CASL combined writing).
3. Check: external references · thesis gap vs current Register · solution is practice mechanism not UI · click-path uses vocab (new modules named only where roster said **new**).
4. After sign-off: fold into personas/outcomes/how + operator modules, then Register twin sync — **not started**.

---

## Quantity (quality bar ≈ compliance seats)

| Seat | File | Prefix | Items | Notes |
|---|---|---|---|---|
| C1 Email / SMS deliverability & sending infra | [`C1-email-deliverability.md`](./C1-email-deliverability.md) | `deliv-` | **24** | New module: **Sending infrastructure**; suppression model for Send gates |
| C2 Agentic engagement runtime | [`C2-agentic-engagement-runtime.md`](./C2-agentic-engagement-runtime.md) | `agent-` | **24** | New: **Conversations** / escalation → Customer support |
| C3 Eligibility + reference-data **pipeline** | [`C3-eligibility-reference-pipeline.md`](./C3-eligibility-reference-pipeline.md) | `pipe-` | **22** | Extends seats 1–2; ingestion/version/re-score machinery |
| C4 Book ingestion & identity resolution | [`C4-book-ingestion-identity.md`](./C4-book-ingestion-identity.md) | `ingest-` | **22** | Extends seat 7; 2× **DEFERRED (KU #7)** |
| C5 Forward-deploy generation | [`C5-forward-deploy-generation.md`](./C5-forward-deploy-generation.md) | `fwd-` | **22** | Generator behind Prepared Workspace |
| C6 Escrow / contingent-payment **mechanics** | [`C6-escrow-payment-mechanics.md`](./C6-escrow-payment-mechanics.md) | `escmech-` | **22** | Extends seat 6; 1× **BLOCKED (counsel)** |
| C7 Instrumentation / analytics pipeline | [`C7-instrumentation-analytics.md`](./C7-instrumentation-analytics.md) | `obs-` | **22** | Fills Oversight / Firm health shells; shares stream with C1/C2 |
| | | | **158** | |

Compliance package was 177 across 7 seats; this capability package is **158** at the same depth (~22–24/seat).

---

## What this pass adds (vs compliance)

Compliance mostly **modified** surfaces (copy, gates, flags). Capability mostly **adds**:

| New / deepened home | From |
|---|---|
| **Sending infrastructure** (operator house-global) | C1 |
| **Conversations** / reply-triage (+ escalation → Ticket queue) | C2 |
| Reference-data **ingestion pipeline** (beyond table shells) | C3 |
| Dedup / identity / validation-class on Imports → Book readiness | C4 |
| Enrichment / forward-deploy **generator** | C5 |
| Escrow **ledger** + verified-release trigger | C6 |
| Event / metrics **pipeline** behind Oversight shells | C7 |
| **Suppression list** consulted by Send gates | C1 (+ C2 honor) |

**Highest-leverage cross-cut:** C1 + C2 + C7 share the **messaging event stream** (send → deliverability telemetry → reply capture → runtime decision → metric). That stream does not exist yet; treat it as one connective build, not three silos.

---

## Explicit non-overlap with compliance seats

| Capability | Stays out of | Leaves to compliance / counsel |
|---|---|---|
| C1 deliverability | CEM consent law | Seat 3 CASL triad / silence clocks |
| C2 runtime | Stop **law** | Honors seat-3 ledger; owns intent→action machine |
| C3 pipeline | Pathway pass/fail language | Seats 1–2 table meaning & sources |
| C4 ingestion | Authorize-book hard-input law | Seat 7 stack / cohort authorization |
| C5 forward-deploy | Meta claim dictionary | Seat 5 ads trust |
| C6 mechanics | MT legal opinion | Seat 6 release unit + **BLOCKED counsel** |
| C7 pipeline | Vanity KPI craft | Fills shells already committed |

---

## Deferred / blocked inside this package

- `ingest-21`, `ingest-22` — **DEFERRED (KU #7)** incremental sync / vertical OAuth  
- `escmech-20` — **BLOCKED (counsel)** money-transmitter boundary  
- All items: `implementationPlant: not_done` (paper click-paths only)

---

## Seat files (full text)

Open these for the full consideration → solution → implementation bodies:

1. [`C1-email-deliverability.md`](./C1-email-deliverability.md)  
2. [`C2-agentic-engagement-runtime.md`](./C2-agentic-engagement-runtime.md)  
3. [`C3-eligibility-reference-pipeline.md`](./C3-eligibility-reference-pipeline.md)  
4. [`C4-book-ingestion-identity.md`](./C4-book-ingestion-identity.md)  
5. [`C5-forward-deploy-generation.md`](./C5-forward-deploy-generation.md)  
6. [`C6-escrow-payment-mechanics.md`](./C6-escrow-payment-mechanics.md)  
7. [`C7-instrumentation-analytics.md`](./C7-instrumentation-analytics.md)  

---

## After you validate

Say the word and we will: update `SME-GRAPH` / roster · write capability HANDOFF / CROSS-CUTTING · absorb into Register theory + operator modules · sync TS twins. **None of that is done in this PR.**
