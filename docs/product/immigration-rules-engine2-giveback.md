# Immigration rules & Engine 2 — Build give-back

**Status:** Directives 1–2 implemented in evaluator (2026-07-10); Directive 3 seed tables landed; classification module landed. Engine 2 outreach / loop-closer / D-01–D-02 still open.  
**As of:** 2026-07-10  
**Context PSD:** [`PSD-tower-v0.4.0`](./psd/tower/PSD-tower-v0.4.0.md)  
**Problem statement:** Matrix catalog (R-* / B-*) and Analysis UI are largely complete; the evaluator previously mostly only ran a **CEC + CRS draw** slice. Most other R-* codes were declared destinations with no path that could assert them.

This document is self-contained. No prior chat required.

### Implementation status (repo)

| Item | Status |
|------|--------|
| D1 field pull (`eca_status`, `ee_profile_*`, `foreign_work_years`) | **Done** — `ClientEligibility` + `automationDataPull` |
| D1 assertions R-GAP-04/02/05, R-OPS-02/03, partial FSW | **Done** — `automationRules.ts` |
| D2 FSW / FST / PNP + any-pathway pass | **Done** |
| D3 versioned category / trades / cutoffs / OINP IDS tables | **Seeded** — `immigrationReferenceTables.ts`; category asserts against active rows |
| Collectible field classification | **Done** — `collectibleFields.ts` |
| Engine 2 precedence / loop-closer / D-01 / D-02 | **Open** (not built) |

---

## Scope split (read first)

| Work | Touches Automations UI? | Can start now? |
|------|-------------------------|----------------|
| **Directive 1** — wire existing fields → gap/ops/partial FSW | No — evaluator + pull mapping only | **Yes** |
| **Directive 2** — FSW / FST / PNP + overall-pass fix | No — evaluator only | **Yes** |
| **Directive 3** — versioned IRCC reference tables | Data/platform; Category asserts depend on it | After table pattern exists |
| **Engine 2 law** — signal/action precedence | Orchestration / sequences | After classification lands |
| **Field classification** | Data model + forms / Manage | Prerequisite for Engine 2 nudges |
| **Loop-closer** — `meeting_booked` form + live brief | Sequences + brief | After open decisions D-01 / D-02 |

Directives 1–2 are **pure evaluator work**. They do not wait on sequence-builder decisions. Precedence + field classification are **upstream of any Engine 2 nudge/orchestration contractor scope**.

---

## Current miss (one line)

We have the immigration matrix scoreboard and service map; we only play the **CEC + CRS-cutoff** game. Pathway “pass” today means CEC asserts — a strong FSW-only candidate is a **false negative**.

---

## Directive 1 — Wire the plumbing (bucket one)

**Priority:** Highest value / lowest effort. Do first.

**Goal:** Engine reads fields that already belong on the client record (expose into the automation pull if not already path-addressable). **No new data collection. No schema change.** Condition logic + field mapping only.

### Fields to read

| Field | Unlocks |
|-------|---------|
| `eca_status` | **R-GAP-04** (ECA missing or expired) |
| `ee_profile_exists` | **R-OPS-02** (no Express Entry profile) |
| `ee_profile_last_updated` | **R-OPS-03** (stale/expired profile), **R-GAP-05** (profile freshness gap) |
| `foreign_work_years` | **R-GAP-02** (foreign work shortfall), **partial FSW** evaluation |

### Done when

- Conditions assert the R-* IDs above when field values warrant it
- Partial FSW path can run on `foreign_work_years` + existing language/TEER-style gates (full FSW pack still completes under Directive 2)
- Analysis / B-* fire from newly asserted results (existing billing map)

### Explicitly out of scope for D1

- New IRCC lists, category draws, FST/PNP full packs
- Outreach / nudge / reactivation behavior

---

## Directive 2 — Wire the missing pathways

**Priority:** Immediately after (or in parallel with) Directive 1. Fixes a false negative in the core product claim — **unacceptable past this version**.

### Requirements

1. Write **FSW**, **FST**, and **PNP** conditions against the matrix (not CEC-only).
2. Change **overall pathway pass**: pathway pass means **any** pathway result asserts (`R-CEC-01` **or** `R-FSW-01` **or** `R-FST-01` **or** `R-PNP-*`), **not** “CEC asserts.”
3. Headlines / summary copy must not hardcode “CEC” when another pathway is the asserting signal.

### Done when

- A strong FSW-only candidate evaluates as pathway **pass** (when FSW conditions clear)
- FST and PNP packs assert their R-* IDs under matrix-aligned conditions
- Overall rule pass still combines pathway (any) + draw policy as product defines — but pathway is no longer CEC-only

### Explicitly out of scope for D2

- Category list matching (blocked on Directive 3)
- Engine 2 outreach precedence

---

## Directive 3 — Reference data is Tower’s homework (bucket three)

**Goal:** IRCC category-draw lists, designated trades list, and draw cutoffs **by type** become **versioned tables Tower maintains** — same pattern as `pathway_rule`: rows, versions, superseded flags, **no code deploy to update**.

### Depends

- Category results **R-CAT-01 … R-CAT-05** can never assert until these tables exist
- Therefore **B-09** (category strategy services) is **dead until this ships**

### Done when

- Versioned tables exist and are readable by the evaluator
- NOC (and French thresholds where applicable) can assert R-CAT-* against current non-superseded rows
- Cutoffs-by-type replace or extend the single `draw.latest_crs_cutoff` constant where product requires it

---

## Engine 2 law — Signal / action decoupling with strict precedence

**Law:** Every detection — including a **missing-data** detection — is recorded as a **signal** the moment it is found. Whether it becomes outreach is decided **separately**, by fixed precedence:

1. **Reactivation first, always** — if anything is reactivation-worthy, that is the motion.
2. **Nudge only when nothing is reactivation-worthy.**
3. When a nudge fires, it consolidates **every** outstanding data need for that client into **one form** — never one nudge per field.
4. When a reactivation fires, all secondary signals (other eligibilities, closing gaps, missing fields) generate **no parallel outreach**. They **attach to the reactivation as agenda** and surface in the consultant’s **pre-meeting brief**.
5. **One client, one motion, ever.**

This law is a prerequisite for Engine 2 nudge/orchestration work. Contractors building sequences must receive this document.

---

## Classification requirement — Collectible fields

Every collectible field gets a flag:

| Flag | Meaning | Downstream |
|------|---------|------------|
| **Self-reportable** | Scores, dates, statuses the client knows offhand | Eligible for pre-meeting form |
| **Document-dependent** | ECA reports, employer revenue, LMIA paperwork, etc. | **Never** enter a form; exit meetings as tracked **Manage** items |

**Employer-detail fields** carry a second flag: the ask is directed at the **firm**, not the client.

This classification drives forms, Manage items, and Engine 2 consolidation. Land it before building nudge forms.

---

## Loop-closer — Live brief on `meeting_booked`

1. On **`meeting_booked`** with outstanding **self-reportable** fields → a data-capture form goes out pending the meeting.
2. Any write-back (form submit **or** consultant entering answers) → **immediate re-evaluation**.
3. New assertions flow into the **brief before the sit-down**.
4. The brief is **live**, not a snapshot.

Behavior above is **settled**. Builder representation is **not** (see open decisions).

---

## Open decisions (logged deliberately open)

Use Notion “Decide on…” tasks under Build Tower V1. Repo IDs for cross-link:

### D-01 — Decide on: pre-meeting capture representation

**Settled behavior:** Form goes out on `meeting_booked` when self-reportable fields are outstanding; write-back re-evaluates; brief stays live.

**Open:** Is pre-meeting capture the **tail segment of the reactivation sequence**, or a **standalone `meeting_booked`-triggered sequence**?

### D-02 — Decide on: in-meeting fallback surface

**Settled behavior:** Consultant must see what the form did not capture and resolve what can be resolved live.

**Open:** Which **module / surface** is that in-meeting fallback (where it lives in the product shell)?

---

## Implementation notes for Directive 1 (prototype)

Seed / pull today may expose some of these under profile labels rather than snake_case paths. Directive 1 still means:

1. Map or expose `eca_status`, `ee_profile_exists`, `ee_profile_last_updated`, `foreign_work_years` on the pulled client record paths the evaluator already uses (`client_data.*`).
2. Add conditions + assertion branches for the listed R-* IDs.
3. Do **not** invent a new collection UX in this slice.

If a named field is absent from a seed client, evaluation returns `insufficient_data` for that check — still a recorded signal under Engine 2 law once orchestration lands.

---

## Related

- Gap analysis (conversation → product): CEC+draw makes; FSW/FST/PNP/category mostly miss — see PSD-tower-v0.4.0 §4.5.6 / §8
- Evaluator: `src/app/data/automationRules.ts`
- Matrix catalog: `src/app/data/immigrationMatrixOutcomes.ts`
- Pull: `src/app/data/automationDataPull.ts`
