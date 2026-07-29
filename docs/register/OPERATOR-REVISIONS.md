# Operator revisions — shape bets that explain Tower’s open box

**As of:** 2026-07-28  
**Status:** Living notes — not World seats, not SME answers. Prefer under-claim.  
**Join:** [`SEED.md`](./SEED.md) · Console purpose popovers · `guidelines/Reactivation.md` · methodology gap §6

This file holds **operator-facing product shape bets** that are easy to miss if you only read seats and admission. They explain *why Hub looks modular and inspectable* — and where that tooling should eventually live.

---

## 1. Domain modularity bet (still on the table)

Tower’s evaluation stack was shaped so the **same software** could serve another vertical with a similar shape (always-on eligibility + engagement over a private book), by swapping industry packs rather than forking the product.

| Surface of the bet | What you see in product |
|--------------------|-------------------------|
| **Automations → Constants** | Industry folders (Immigration rich; Legal / Financial / Insurance placeholders) — versioned criteria, not hard-coded one-offs |
| **Automations → Rules** | Pre-packaged evaluators that compose constants + industry conditions (open, inspectable — not a sealed black box) |
| **Analysis** | Human-readable outcomes from those rules |

**Cosmetic / pack changes** may be required per segment; the **graph shape** (Trigger → If / Rules → Actions that enroll Agents) is meant to stay.

---

## 2. Open-box evaluation law (standing)

For any Om Coda product that **evaluates data to decide or analyze**, prefer an **open box**: operators can see and change the operations that produce answers without a code deploy for every tweak.

**Where it should sit:** not as everyday consultant chrome forever. Target shape is an **agency / operator / admin view** that configures evaluation for everyone under that tenancy. Today’s Hub (Audits, Agents, Automations) is historically parked inside the firm workspace because Tower was built under managed / OLG-style thinking — that placement is a **revision candidate**, not the destination.

---

## 3. Audit — what it actually is

Audit is **not** a vague “compliance sweep” and **not** sales ROI ceremony.

| In | Out |
|----|-----|
| On / after **import**: email valid, phone valid, channel match to intended sequence, dedupe, already-in-Tower, consent/silenced, name present | Pathway scoring, CRS, activation probability, PASS/FAIL sales theater |
| Answer: *can we reach them, and can we start a sequence?* | Minimum contact-count gates |

Checks are meant to connect to **external validation systems** where needed. Passed audits make contacts **sequence-ready** for Agents / Automations.

Console purpose for Audits Section should say this in plain language (data validity / sequence-ready).

---

## 4. Engagement chart — record, not decision surface

Activity / Engagement chart is a **record of events** that already fired (opt-in, nudge, reactivation sequences; channel rows; attempts; escalations). Channel order, attempt logic, and escalation rules are **authored in Agents** (and enrolled by Automations). Do not write purposes that smuggle “judge engagement” as if the chart were the decision brain — use **examine / view the record**.

---

## 5. Two different “sequencing” stories (don’t conflate)

### 5a. Campaign methodology (day calendar)

**Engine 2 precedence** (reactivation > nudge; one motion) is in Seed §5.8.

**Opt-in / reactivation day-by-day channel order** lives in [`guidelines/Reactivation.md`](../../guidelines/Reactivation.md). That is campaign *content* order — not the attempt machine below. Open: SMS non-reply escalation; no-login view as core vs static.

### 5b. Attempt / channel-ownership engine (what Sarah’s nudge shows)

Sarah Jenkins → nudge `00f-nudge-001` — **Text · Email · Form**, then **Attempt 1 / 2 / 3** under Form — is the **runtime sequencing brain** for one engagement sequence. Reference: `src/app/data/sarahNudgeTimeline.ts`. Logs: [`engagement-chart-gantt-decisions.md`](../product/engagement-chart-gantt-decisions.md), [`product-log-2026-06-13.md`](../product/product-log-2026-06-13.md). Intended authorship: Agents Settings (“channel rulesets, attempt logic”).

| Law (as encoded in Sarah + decision log) | Meaning |
|------------------------------------------|---------|
| **One owner at a time** | Exactly one channel owns the flow; waits / scheduled / attempts nest under that owner |
| **Happy path** | Text → Email → Form (forward-only when criteria met) |
| **Criteria windows (prototype)** | Text delivered not opened in **30min** → Email (R-01); Email opened, link not clicked in **24h** → next attempt; Form started not submitted in **24h** → Text (re-entries don’t reset clock) |
| **Attempts are local retries** | Attempt N = fresh Text→Email (→Form) under the channel that failed — **not** a top-level Attempt spanning all channels (deprecated) |
| **Inside an attempt** | “Text opened · next channel in attempt” → Email with resume / form link |
| **Priority override** | A live form visit can **nullify** an in-flight attempt and open the next |
| **Outcome** | Form submitted closes the nudge and can arm the next sequence (e.g. Reactivation scheduled) |

Activity = event record. Authorship = Agents. Windows / R-* labels may still be prototype vs product-locked.

---

## 6. Who finds what the product must contain (methodology gap — open)

**Want (stated):** The founder should be able to dump the idea as far as they know it. The Register should not require them to personally invent every surface that “apps like this” need (operator observability, product analytics, audit trails for operators, etc.). Missing that class of thing is currently too easy — and too often only caught when the founder notices.

**What Register already does well:** Domain and buyer truth come from Seed / World / personas / SMEs. PM and CTO are **not** SMEs in the Om Coda Register sense: they **do not get a turn to add** desiderata. Personas & Function, Enrichment, Furnish speak as the persona. Wiring / CT / Translation **build from what was laid out**. If it wasn’t put in, it doesn’t appear — by design.

**The hole that creates:** Platform and product-craft needs that no end-persona would ever name — “this product needs operator observability,” “we need product analytics,” “operator needs a way to see whether sequences are healthy” — have **no chair**. In a normal product org that is often the PM (sometimes with CTO on stack/ops). In Register today, the PM’s job is closer to *translate everyone’s ideas into a working product*, and the CTO’s job is closer to *given what was said, how do we achieve it on this stack* — **not** “what else do you want to put in the product?”

**BA assumptions vs this gap:** The World BA “underlying assumptions” pass produced useful pressure tests *and* stage-stale / context-poor items (e.g. “enough market share” after the bet has already been taken). Treating every assumption as an SME-style *consideration → solution worth building* would flood the PM with entries that are pointless to engage. **Do not** auto-promote the full BA assumption list into build work. Bound later; no closed filter rule yet — only the want: solutions should attach to considerations that still shape the product, not to archaeology of bets already decided.

**Not closed:** Whose Register seat (if any) owns platform craft / operator hygiene / analytics. Candidates to explore later: a deliberate **PM craft pass** or **operator-platform SME**, vs expanding Seed Known unknowns, vs keeping those notes here until a pass exists. Do **not** invent that seat in World by smuggling “analytics” as a consultant need.

**Standing instruction until a seat exists:** Capture founder-noticed platform gaps in this file (and Seed Known unknowns when they are product decisions). Agents and BAs must not invent closed solutions for stage-stale assumptions; they may flag *missing craft seats* as methodology debt.

---

## 7. Operator belief pass — what drives Tower (2026-07-28)

Founder restatement for PM/CTO questioning. Prefer this when it clarifies Seed/World; Seed still wins on conflict until validated otherwise.

### Om Coda shape → Tower

Om Coda (parent) has a repeatable **shape**: kinds of outcomes/insights chased → products; how people are acquired into those products; business-model shape. Tower is one birth of that shape (immigration consultancy desk + always-on eligibility/engagement). Operator preference for **all** Om Coda products: **modular where it matters**, **forward-deploy / configure-without-code** for the bets that run the product (rules, analysis, operations, data criteria) — like a CRM or data vendor’s admin config, not every cosmetic chrome. Hub is the main modular surface today; not every section of the app needs to be a config surface.

### Core viability belief — two sides of the detection coin

Tower is viable because **eligibility changes** are driven by:

1. **Law / public reference change** — scrapeable, storable, versionable criteria applied to client data (Canada immigration matrix / constants / rules).
2. **Life change on the contact** — facts that only the person (or firm file after collection) knows.

Storing the firm’s files alone and never reaching out solves **only side 1**. Side 2 requires asking / telling them what is needed when it is needed (nudges, forms) — which also fits **opt-in / PII / consent** posture: enrich on answer, re-evaluate, decide next motion (Engine 2). Detection → engagement → enriched data → re-detection is one loop, not “analytics on a static dump.”

### How PM/CTO should use this

~98% of *how Tower works* is already in Seed + World. This section + §§1–6 are the operator lens. **Job of the craft pass:** paraphrase understanding → state expert assumptions from the PM or CTO field → **ask the founder questions** (do not invent closed product decisions; do not flood with stage-stale BA archaeology).

---

## 8. How to use this file

- Console purpose popovers = verify *what each holon is for* in the running UI.  
- This file = Hub/open-box shape, attempt-engine DNA, methodology gaps, **and** operator belief lens for craft questions.  
- Do not mint World seats from these bets until a value-chain gap forces one.
