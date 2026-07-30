# PM implementation — Seat 2 IRCC reference-data currency

| Field | Value |
|---|---|
| **Source** | [`pass2/02-ircc-reference-data.md`](../pass2/02-ircc-reference-data.md) |
| **Skipped** | `ref-23` (NEEDS VERIFICATION) |
| **Written** | 25 |
| **Surfaces** | **Reference data**, **Reference tables**, **Import criteria**, **Publish version**; pack pin on **Evaluation packs** / **Evaluation pack editor** |
| **As of** | 2026-07-30 |

---

### ref-01
**implementationProblem:**
Without a closed V1 Canada table inventory, house Evaluation packs invent CRS floors, category NOC sets, and CLB maps in evaluator code — Directive 3 fails before first publish.

**implementation:**
On Reference data, you can now open Reference tables for seven house-owned Canada families: NOC+TEER, EE category membership, FST eligible trades, round/cutoff ledger, CRS+FSW grids, language CLB/NCLC equivalency, and provincial EE identifiers scoped to programs packs assert.
On Reference tables, you can now edit or Import criteria so every V1 outcome family consumes published rows, not evaluator literals.

**implementationAdds:** ["NOC+TEER", "EE category membership", "FST eligible trades", "round/cutoff ledger", "CRS+FSW grids", "language CLB/NCLC equivalency", "provincial EE identifiers"]

---

### ref-02
**implementationProblem:**
Treating every provincial stream catalog as V1-critical bloats currency ops; omitting CLB charts or CRS grids silently forces hardcoding. Currency effort must match what packs actually score.

**implementation:**
On Reference tables, you can now see V1 must-have families marked current-required: NOC+TEER, category membership, round/cutoff ledger, CRS+FSW grids, language equivalency.
On Reference tables, you can now defer multi-province deep stream catalogs until a pack asserts them; a single provincial EE identifier table appears only when an Evaluation pack asserts that PNP-* pathway.

**implementationAdds:** ["must-have", "deferrable", "optional-until-asserted"]

---

### ref-03
**implementationProblem:**
Secondary draw blogs republish within hours but are not authoritative — house import from blogs creates unprovable currency and silent transcription error.

**implementation:**
On Import criteria for the round/cutoff table, you can now bind canonical source to Canada.ca rounds-of-invitations plus the ministerial-instructions round ledger.
On Import criteria, you can now mark third-party draw pages as discovery alerts only — never as publishable truth.
On Publish version, you can now require each cutoff version cite a government page and scrape/import provenance.

**implementationAdds:** ["canada.ca", "ministerial-instructions", "discovery-alert-only"]

---

### ref-04
**implementationProblem:**
“Keep current” without an SLA is aspirational; mid-week multi-draw weeks break weekly-only review and leave draw-shaped Analysis a day-plus stale.

**implementation:**
On Reference data, you can now run a same-business-day publish SLA for new IRCC rounds (detect → import → dual-check CRS floor + round type → Publish version).
On Reference data, you can now schedule a Canada.ca poll at least daily and take an on-alert path when a round appears.
On Publish version, prior round versions stay immutable.

**implementationAdds:** ["same-business-day", "daily-poll", "on-alert"]

---

### ref-05
**implementationProblem:**
Category NOC lists and experience windows change; a one-time seed CSV goes stale while packs keep scoring against folklore.

**implementation:**
On Reference tables for EE category membership, you can now version category id, eligibility predicates, and NOC+TEER rows from the live Canada.ca category-based selection page.
On Import criteria, you can now re-check on every IRCC page change and at least on each annual category re-establishment cycle.
On Publish version, you can now refuse merging historical category lists into the current version — category assertions pin to a dated ministerial definition.

**implementationAdds:** ["category-id", "dated-ministerial-definition"]

---

### ref-06
**implementationProblem:**
Evaluators need 5-digit unit group + TEER; ESDC structural NOC revisions can land before IRCC adopts them for Express Entry — silent TEER flips poison gates.

**implementation:**
On Reference tables for NOC+TEER, you can now store NOC code, title, TEER, classification version, and IRCC-effective-from date.
On Reference tables, when ESDC publishes a new structural NOC before IRCC adopts it, you can now keep dual versions.
On Evaluation pack editor, you can now pin the IRCC-effective NOC version so TEER gates do not flip on an ESDC-only publish.

**implementationAdds:** ["classification-version", "IRCC-effective-from", "dual-version"]

---

### ref-07
**implementationProblem:**
CRS factor changes (e.g. arranged-employment points removed) are law/public-reference moves; hardcoding point tables in evaluator code freezes wrong scoring after MI changes.

**implementation:**
On Reference tables, you can now publish CRS factor grids and the FSW 67/100 selection-factor tables as versioned constant packs with effective dates from Canada.ca CRS criteria + current MI + FSW pages.
On Evaluation packs, evaluators can now read the version effective on evaluation time (or pack pin) — point-table changes ship via Publish version, not a code deploy.

**implementationAdds:** ["CRS factor grids", "FSW 67/100", "effective-from"]

---

### ref-08
**implementationProblem:**
Accepted tests and band→CLB maps change (PTE Core; future tests); embedding maps in code mis-scores language gates and CRS language points.

**implementation:**
On Reference tables, you can now maintain versioned equivalency charts per approved test and ability, plus program minimum CLB/NCLC rows (FSW/CEC/FST/French category), sourced only from the IRCC language-test page.
On Import criteria, you can now re-verify when IRCC announces a new approved test.
On Publish version, language gates and CRS language points move as published data.

**implementationAdds:** ["CELPIP", "IELTS-GT", "PTE-Core", "TEF", "TCF", "CLB", "NCLC"]

---

### ref-09
**implementationProblem:**
Seed’s “OINP IDS” example can freeze closed-stream shape into V1; publishing HCP/FSSW/Skilled Trades NOI cutoffs as current after stream closure is a wrong-cutoff class failure.

**implementation:**
On Reference tables for provincial EE identifiers, you can now set each stream/draw row to open, closed, or superseded with source URL and last-verified-at.
On Reference tables, you can now refuse shipping closed OINP EE streams as current eligibility inputs.
On Evaluation pack editor, when a pack needs Ontario PNP-*, you can now pin to the live ontario.ca program shape; historical NOI ledgers stay audit/replay only.

**implementationAdds:** ["open", "closed", "superseded", "last-verified-at", "audit-replay-only"]

---

### ref-10
**implementationProblem:**
Without provenance, house cannot prove what was current when Analysis fired; liability disputes collapse into “the system said so.”

**implementation:**
On Publish version, you can now require source URL(s), source retrieved-at, importer identity, dual-check attestation, effective-from, supersedes-version-id, and content hash before a version goes live.
On Evaluation packs, any mid-flight or post-hoc evaluation can now show which government page backed the constants used.

**implementationAdds:** ["source-retrieved-at", "dual-check attestation", "supersedes-version-id", "content-hash"]

---

### ref-11
**implementationProblem:**
“Packs read current published version” can silently rewrite eligibility under a consultant’s license mid-campaign; pinning forever never reflects new draws.

**implementation:**
On Publish version, you can now separate draft from published-current — new publishes become current for subsequent evaluations only.
On Evaluation packs, every evaluation result can now record the exact reference-version ids used; already-emitted signals/Analysis retain their pin for audit.
On Evaluation pack editor, re-evaluation jobs can now explicitly adopt current or stay pinned per pack policy — mid-flight firms get explainable deltas, not silent rewrite.

**implementationAdds:** ["draft", "published-current", "reference-version-ids", "adopt-current", "stay-pinned"]

---

### ref-12
**implementationProblem:**
Immediate book-wide rescore is the product bet; uncontrolled fan-out without delta surfacing creates consultant distrust and false reactivation storms.

**implementation:**
On Publish version for a cutoff ledger, you can now enqueue book re-evaluation that adopts the new round ledger version.
On Evaluation packs, you can now emit eligibility deltas (was below / now at-or-above observed floors by round type) as signals under Engine 2 precedence.
You never auto-fire outreach solely because a number moved — engagement law still owns motion.

**implementationAdds:** ["was-below", "at-or-above", "round-type floor", "no-auto-outreach"]

---

### ref-13
**implementationProblem:**
Always-latest without pin loses replay; forever-pin loses currency; firm-configured freezes without house oversight recreate stale-cutoff liability.

**implementation:**
On Evaluation pack editor, house packs can now default to follow published-current per table family.
On Evaluation pack editor, you can now set an explicit pack pin only with expiry + reason (audit/replay, incident hold, supervised A/B).
On Evaluation packs (and Oversight), you can now see pin age — freeze is a controlled exception, not the default currency model.

**implementationAdds:** ["follow-published-current", "pin-expiry", "pin-reason", "pin-age"]

---

### ref-14
**implementationProblem:**
Even with Reference data, engineers embed “last known” CRS floors, category NOC lists, CLB maps, or TEER thresholds in condition code “temporarily” — Directive 3 becomes aspirational.

**implementation:**
On Evaluation pack editor, you can now author only structural operators (comparisons, any/all pathway logic, Engine 2 precedence) — public-criteria values resolve from Reference tables.
On Reference tables, CRS round floors, category→NOC sets, FST trade sets, TEER program gates, CLB equivalency bands, CRS/FSW point grids, provincial stream identifiers/cutoffs, and asserted settlement-fund amounts live as published data only — review rejects evaluator literals for those.

**implementationAdds:** ["no-evaluator-literals", "structural-operators-only"]

---

### ref-15
**implementationProblem:**
Pushing pathway interpretation into reference tables invents law or conflates seats; pushing everything into code re-breaks currency.

**implementation:**
On Evaluation pack editor, you can now keep outcome-family toggles, client-field combine logic (any pathway assertion), missing-data signal shapes, and narrative templates that cite reference rows.
On Reference tables, you can now own all scrapeable public-criteria values and membership sets — seat 1 owns interpretation; seat 2 owns currency of inputs.

**implementationAdds:** ["outcome-family toggles", "cite-reference-rows"]

---

### ref-16
**implementationProblem:**
Auto-publish from a broken scrape can ship empty category sets or swapped CRS columns — worse than being one day stale.

**implementation:**
On Import criteria, you can now require schema validation plus dual-human or human+checksum gate before Publish version (row counts, required columns, CRS floor sanity bands, category NOC cardinality checks).
On Import criteria, failed imports stay draft and alert house upkeep — freshness never outranks correctness.

**implementationAdds:** ["schema-validation", "dual-human", "human+checksum", "draft-hold"]

---

### ref-17
**implementationProblem:**
Firms inhabit Analysis; they are not paid to QA Om Coda’s Canada.ca mirror. Silent wrong data becomes consultant license risk before house notices.

**implementation:**
On Reference data, you can now run house-side reconciliation of published cutoff/category rows vs live Canada.ca snapshot on a fixed cadence and alert on drift.
On Reference data, you can now sample firm evaluations that flipped on the last Publish version for spot-check.
On Analysis, you can now see the reference-version id for seat-1/desk sync — wrong data is caught by upkeep ops, not by a client complaint after outreach.

**implementationAdds:** ["reconciliation", "drift-alert", "reference-version-id"]

---

### ref-18
**implementationProblem:**
“Versioned data Tower maintains” without a liability split leaves Om Coda and the RCIC/firm each assuming the other owns the error.

**implementation:**
On Publish version / Reference data provenance, wrong public-reference constants stay house (Om Coda) operational liability for currency and provenance.
On Analysis, you can now label scores as system evaluations against cited reference versions — not as IRCC determinations; pathway advice and whether to act remain firm/desk license liability.

**implementationAdds:** ["system-evaluation", "cited-reference-version", "not-IRCC-determination"]

---

### ref-19
**implementationProblem:**
Rolling forward without rollback leaves poisoned scores in motion; silent rollback without delta confuses consultants mid-meeting.

**implementation:**
On Publish version, you can now roll back to last-known-good reference versions with an operator incident flag.
On Reference data, you can now pause draw/category-dependent reactivation enrollment until reconcile completes.
On Evaluation packs, you can now re-score and emit corrective deltas with reference-correction cause — wrong-cutoff blast radius is contained without pretending the bad version never existed.

**implementationAdds:** ["incident-flag", "last-known-good", "reference-correction", "pause-reactivation"]

---

### ref-20
**implementationProblem:**
A single “latest CRS cutoff” scalar misleads when recent rounds are CEC-only, PNP-only, or category-based with incomparable floors.

**implementation:**
On Reference tables for the round/cutoff ledger, you can now store and score against round-type-scoped floors (and category id when category-based).
On Publish version / Evaluation packs, you can now refuse collapsing all rounds into one current-cutoff constant.
On Analysis, comparisons can now name the round type/category of the floor used — wrong-cutoff “above/below the draw” handoffs cannot form from incomparable rounds.

**implementationAdds:** ["round-type-scoped", "category-id floor", "no-single-current-cutoff"]

---

### ref-21
**implementationProblem:**
Pool CRS distribution tables help narrative competitiveness but are not required to assert pathway/category/draw eligibility gates — shipping them as V1 dilutes currency focus.

**implementation:**
On Reference tables, you can now defer pool distribution snapshots as nice-to-have narrative inputs — they do not block the V1 table set.
If shipped later on Reference tables, you can now version them with the same Publish version provenance rules and never use distribution alone as an eligibility gate.

**implementationAdds:** ["defer-distribution", "narrative-only", "never-eligibility-gate"]

---

### ref-22
**implementationProblem:**
ECA org lists and equivalency→points maps change rarely but unlock FSW/CRS education scoring; inventing them in packs creates silent education mis-scores.

**implementation:**
On Reference tables, you can now include designated ECA organizations plus assessment-result→profile-level/FSW-points maps as a V1 versioned constants table sourced from the ECA Canada.ca page.
On Import criteria, cadence is on IRCC page change plus quarterly verify — education points stay data-driven without weekly scrape pressure.

**implementationAdds:** ["ECA organizations", "assessment-result map", "quarterly-verify"]

---

### ref-23
**Skipped:** NEEDS VERIFICATION — confirm current proof-of-funds table URL/subsection on each publish cycle.

---

### ref-24
**implementationProblem:**
Older secondary guidance still cites six-month category experience; scoring against stale predicates is a silent false-positive/negative class.

**implementation:**
On Reference tables for EE category membership, you can now store category eligibility predicates as versioned structured fields (min months, lookback years, continuity flag, location scope) copied from the live category page — not from year-end reports or blogs.
On Publish version, you can now invalidate prior predicate versions when the live page changes — category assertions track IRCC’s current instructions.

**implementationAdds:** ["min-months", "lookback-years", "continuity", "location-scope"]

---

### ref-25
**implementationProblem:**
Without a named house duty and SLA, currency collapses into engineering tickets — the exact anti-pattern Directive 3 forbids.

**implementation:**
On Reference data, you can now staff upkeep as a house ops function with on-call for draw days, dual-check publish rights, and a written SLA matrix (draws: same business day; categories/NOC/CRS/language: on-change + scheduled verify).
Engineering only builds the store/Import criteria pipeline — currency remains an operations practice on Reference data / Publish version, not a release train.

**implementationAdds:** ["house-ops on-call", "dual-check publish rights", "SLA matrix"]

---

### ref-26
**implementationProblem:**
Seat 1 packs that embed “example” cutoffs for narrative demos become production literals; seat 2 currency then cannot heal mis-scores.

**implementation:**
On Evaluation pack editor, you can now reference table keys and version pins only (category ids, round-type floor lookups, NOC membership checks, CLB chart ids).
On Evaluation packs, demo fixture cutoffs stay in non-prod seeds; shared review rejects pack publishes that introduce numeric public-criteria literals — wrong-cutoff liability stays with Reference data; eligibility interpretation stays with seat 1.

**implementationAdds:** ["table-keys-only", "version-pins-only", "reject-numeric-literals"]

---

## Counts

| Metric | Count |
|---|---|
| Source items | 26 |
| Skipped (NEEDS VERIFICATION) | 1 (`ref-23`) |
| Written | 25 |
| With `implementationAdds` | 25 |
