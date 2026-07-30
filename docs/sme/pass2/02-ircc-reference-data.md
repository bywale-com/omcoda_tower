# Pass1+Pass2 — IRCC reference-data currency

| Field | Value |
|---|---|
| **Seat** | 2 — IRCC reference-data currency |
| **Domain lane** | Maintaining Canadian immigration public-reference criteria as versioned data (categories, trades, cutoffs, provincial identifiers, draw-shaped constants) |
| **Focus** | Minimum V1 Canada table set; authoritative sources + currency cadence; publish/version with mid-flight firm evaluations; what must not be hardcoded in evaluators; wrong-cutoff handoff risks/liability (sync seat 1) |
| **Item count** | 26 |
| **Boundaries** | Not pathway interpretation (seat 1). Not UI chrome. Not non-Canada V1 tables. Adjacent sync with seat 1 only on which tables unlock which assertions. |
| **Anchors** | Seed §5.7 Directive 3; World §0.4 / §1.1 reference-data upkeep / §2.2 law-public-reference side; How `operator-reference-data.md`; SME-GRAPH seat 2 |
| **Handoff default** | both (PM: Reference data outcomes/criteria; CTO: versioned store, publish pipeline, pack pin) |
| **As of** | 2026-07-30 |

---

### ref-01
**Question:** What is the minimum V1 Canada reference-table set Tower must ship so evaluation packs can score CEC / FSW / FST / PNP-* / category / draw outcome families without inventing constants in code?
**References:**
- Express Entry: Category-based selection — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html
- Express Entry: Rounds of invitations — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html
- National Occupational Classification (NOC) — https://noc.esdc.gc.ca/
- Comprehensive Ranking System (CRS) criteria — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html
**Thesis gap:** Seed §5.7 names “categories, trades, cutoffs, OINP IDS, etc.” as examples, not a closed inventory; without a V1 minimum, house packs either hardcode thresholds or leave draw/category assertions unscoreable.
**Solution:** `Ship seven house-owned table families as the V1 Canada pack inputs — (1) NOC unit-group + TEER map, (2) EE category membership (category id → NOC codes + experience/language predicates), (3) FST eligible-trade / major-group membership, (4) round/cutoff history (round #, date, round type, invitations, CRS floor, tie-break), (5) CRS factor grids + FSW 67-point selection grid as versioned constants, (6) language test→CLB/NCLC equivalency charts, (7) provincial Express Entry identifier / stream-draw tables scoped to programs packs actually assert — so that every V1 outcome family consumes published data, not evaluator literals.`
**Handoff:** both

### ref-02
**Question:** Which of those tables are must-have for V1 desk-defensible scoring versus nice-to-have / defer?
**References:**
- Federal Skilled Worker Program — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html
- Express Entry: Language test results — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-test.html
- Seed §5.7 outcome families (pathway, gaps, ops, category, draw)
**Thesis gap:** Treating every provincial stream table as V1-critical bloates currency ops; omitting CLB charts or CRS grids silently forces hardcoding.
**Solution:** `Treat NOC+TEER, category membership, round/cutoff ledger, CRS+FSW grids, and language equivalency as V1 must-have; treat multi-province deep stream catalogs and settlement-fund tables as deferrable until a pack asserts them; treat a single provincial EE identifier table (e.g. Ontario) as optional only if no V1 pack asserts that PNP-* pathway — so that currency effort matches what packs actually score.`
**Handoff:** pm

### ref-03
**Question:** What is the authoritative source of truth for Express Entry invitation rounds and CRS cutoffs (vs secondary immigration blogs)?
**References:**
- Express Entry: Rounds of invitations — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html
- Ministerial instructions — Express Entry rounds table — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html
**Thesis gap:** Secondary sites republish draws within hours but are not authoritative; house import from blogs creates unprovable currency and silent transcription error.
**Solution:** `Bind the round/cutoff table’s canonical source to Canada.ca rounds-of-invitations plus the ministerial-instructions round ledger (round #, date, type, invitations, CRS of lowest-ranked invited); treat third-party draw pages as discovery alerts only, never as publishable truth — so that every cutoff version cites a government page and scrape/import provenance.`
**Handoff:** both

### ref-04
**Question:** What currency cadence should house reference-data upkeep run for draw/cutoff tables?
**References:**
- Express Entry: Rounds of invitations (IRCC holds rounds throughout the year; historically ~biweekly cadence in MI narrative) — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html
- Ministerial instructions respecting Express Entry rounds — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html
**Thesis gap:** “Keep current” without a SLA becomes aspirational; mid-week multi-draw weeks (common in 2025–2026 practice) break a weekly-only review.
**Solution:** `Run a same-business-day publish SLA for new IRCC rounds (detect → import → dual-check CRS floor + round type → publish), with a scheduled Canada.ca poll at least daily and an on-alert path when a round appears; retain prior round versions immutable — so that draw-shaped Analysis never sits more than one business day behind the official ledger.`
**Handoff:** both

### ref-05
**Question:** What is the authoritative source and cadence for Express Entry category membership (occupation lists and French NCLC thresholds)?
**References:**
- Express Entry: Category-based selection (current categories + NOC tables; page dated 2026-06-22) — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html
- 2024–2025 Report to Parliament – Category-Based Selection — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/report-parliament-cbs-2024-25.html
**Thesis gap:** Category NOC lists and experience windows change (e.g. occupation lists expand/contract; experience predicates have shifted across reporting years); a one-time seed CSV goes stale while packs keep scoring.
**Solution:** `Version category tables from the live Canada.ca category-based selection page (category id, eligibility predicates, NOC+TEER rows); re-check on every IRCC page change and at least on each annual category re-establishment / Report-to-Parliament cycle; never merge historical category lists into the “current” version — so that category assertions always pin to a dated ministerial category definition.`
**Handoff:** both

### ref-06
**Question:** What must the NOC/TEER reference table contain, and who is authoritative when ESDC NOC and IRCC program text diverge in timing?
**References:**
- National Occupational Classification — https://noc.esdc.gc.ca/
- NOC 2021 Version 1.0 (Statistics Canada) — https://www.statcan.gc.ca/en/subjects/standard/noc/2021/indexV1
- NOC structure / TEER — https://noc.esdc.gc.ca/Structure/Noc2021
**Thesis gap:** Evaluators need 5-digit unit group + TEER; NOC structural revisions (e.g. research toward NOC 2026) can land on a different schedule than IRCC program adoption.
**Solution:** `Store NOC code, title, TEER, classification version (e.g. NOC 2021 v1.0), and IRCC-effective-from date as data; when ESDC publishes a new structural NOC before IRCC adopts it for EE, keep dual versions and let packs pin the IRCC-effective version — so that TEER gates do not silently flip on an ESDC publish the programs have not yet adopted.`
**Handoff:** cto

### ref-07
**Question:** Must CRS factor grids and the FSW 67-point selection grid live as reference data (vs pack logic)?
**References:**
- CRS criteria (incl. job-offer points removal as of 2025-03-25) — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html
- Ministerial Instructions respecting the Express Entry system — current — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-application-management-system/current.html
- Federal Skilled Worker Program selection factors — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html
**Thesis gap:** CRS factor changes (e.g. arranged-employment points removed) are law/public-reference moves; hardcoding point tables in evaluator code makes Directive 3 fiction and freezes wrong scoring after MI changes.
**Solution:** `Publish CRS factor grids and the FSW 67/100 selection-factor tables as versioned constant packs with effective dates sourced from Canada.ca CRS criteria + current MI + FSW pages; evaluators read the version effective on evaluation time (or pack pin) — so that point-table changes ship without a code deploy.`
**Handoff:** both

### ref-08
**Question:** Must language test→CLB/NCLC equivalency charts be house reference data?
**References:**
- Express Entry: Language test results (CELPIP / IELTS GT / PTE Core; TEF / TCF; program minima) — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-test.html
**Thesis gap:** Accepted tests and band→CLB maps change (PTE Core addition; possible future tests); embedding maps in code mis-scores language gates and CRS language points.
**Solution:** `Maintain versioned equivalency charts per approved test and ability, plus program minimum CLB/NCLC rows (FSW/CEC/FST/French category), sourced only from the IRCC language-test page; re-verify when IRCC announces a new approved test — so that language gates and CRS language points move as data.`
**Handoff:** both

### ref-09
**Question:** How should Tower treat “OINP IDS” named in Seed when Ontario’s Express Entry streams have been redesigned/closed?
**References:**
- 2026 Ontario Immigrant Nominee Program Updates (former EE streams closed) — https://www.ontario.ca/page/2026-ontario-immigrant-nominee-program-updates
- OINP Express Entry Notifications of Interest (historical NOI ledger) — https://www.ontario.ca/page/oinp-express-entry-notifications-interest
- Ontario’s Express Entry System streams — https://www.ontario.ca/page/ontarios-express-entry-system-streams
**Thesis gap:** Seed’s “OINP IDS” example can freeze a closed-stream shape into the V1 table set; publishing HCP/FSSW/Skilled Trades NOI cutoffs as “current” after stream closure is a wrong-cutoff class failure.
**Solution:** `Treat provincial identifier tables as program-lifecycle-aware: each stream/draw row carries status (open | closed | superseded), source URL, and last-verified-at; do not ship closed OINP EE streams as current eligibility inputs; if a V1 pack needs Ontario PNP-*, pin to the live ontario.ca program shape (e.g. Workforce Priority / EOI when open) and keep historical NOI ledgers only for audit/replay — so that Seed’s example does not outrank the provincial authority.`
**Handoff:** both

### ref-10
**Question:** What provenance metadata must every published reference version carry?
**References:**
- How `operator-reference-data.md` (edit/import + publish version)
- World §1.1 Om Coda reference-data upkeep; §2.2 law/public-reference change
**Thesis gap:** Without provenance, house cannot prove what was current when Analysis fired; liability disputes collapse into “the system said so.”
**Solution:** `Require each published version to store source URL(s), source retrieved-at, importer identity, dual-check attestation, effective-from, supersedes-version-id, and content hash — so that any mid-flight or post-hoc evaluation can show which government page backed the constants used.`
**Handoff:** cto

### ref-11
**Question:** What publish/version semantics apply when firm evaluations are mid-flight (sequences armed, Analysis already shown, meetings booked on prior scores)?
**References:**
- How `operator-reference-data.md` Leaf 1.2 — publish version packs consume
- World value-chain hop “reference-data upkeep → Firm book evaluations”
- Seed §5.7 / Engine 2 re-evaluation on fact write-back
**Thesis gap:** “Packs read current published version” can silently rewrite eligibility under a consultant’s license mid-campaign; pinning forever never reflects new draws.
**Solution:** `Separate draft → published-current from evaluation pins: new publishes become current for subsequent evaluations; every evaluation result records the exact reference-version ids used; already-emitted signals/Analysis retain their pin for audit; re-evaluation jobs (house or on fact change) explicitly adopt current or stay pinned per pack policy — so that mid-flight firms get explainable deltas rather than silent rewrite.`
**Handoff:** both

### ref-12
**Question:** Should a new draw cutoff automatically re-score the entire book the moment it publishes?
**References:**
- Express Entry rounds of invitations — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html
- Seed Core bet: re-evaluate as IRCC-shaped rules move
**Thesis gap:** Immediate book-wide rescore is the product bet; uncontrolled fan-out without delta surfacing creates consultant distrust and false reactivation storms.
**Solution:** `On cutoff publish, enqueue book re-evaluation that adopts the new round ledger version; emit eligibility deltas (was below / now at-or-above observed floors by round type) as signals under Engine 2 precedence — never auto-fire outreach solely because a number moved — so that law-side change drives detection while engagement law still owns motion.`
**Handoff:** both

### ref-13
**Question:** Can packs pin to a non-current reference version (freeze), and when is that practice-safe?
**References:**
- How `operator-reference-data.md` — published version becomes what packs score against
- Seed KU #9 ownership/IP/liability of packs (adjacent)
**Thesis gap:** Always-latest without pin loses replay; forever-pin loses currency; firm-configured freezes without house oversight recreate stale-cutoff liability.
**Solution:** `Default house packs to follow published-current per table family; allow explicit pack pins only with expiry + reason (audit/replay, incident hold, supervised A/B); surface pin age in operator oversight — so that freeze is a controlled exception, not the default currency model.`
**Handoff:** both

### ref-14
**Question:** What must not be hardcoded in evaluators for V1 Canada scoring?
**References:**
- Seed §5.7 Directive 3 — reference tables versioned data; no code deploy to update
- World §2.1 operator/house layer; §2.2 law/public-reference change
**Thesis gap:** Even with a Reference data module, engineers embed “last known” CRS floors, category NOC lists, CLB maps, or TEER thresholds in condition code “temporarily.”
**Solution:** `Forbid evaluator literals for: CRS round floors, category→NOC sets, FST trade sets, TEER thresholds used as program gates, CLB equivalency bands, CRS/FSW point grids, provincial stream identifiers/cutoffs, and settlement-fund amounts when asserted; evaluators may only hardcode structural operators (comparisons, any/all pathway logic, Engine 2 precedence) — so that Directive 3 is enforceable in review, not aspirational.`
**Handoff:** cto

### ref-15
**Question:** What may remain in evaluator/pack logic without living in reference tables?
**References:**
- Seed §5.7 outcome families; Directive 2 pathway any-of law
- SME-GRAPH seat 1 vs seat 2 boundary (interpretation vs currency)
**Thesis gap:** Pushing pathway *interpretation* into reference tables either invents law or conflates seats; pushing everything into code re-breaks currency.
**Solution:** `Keep in packs/evaluators: which outcome families are toggled, how client fields combine (e.g. any pathway assertion), missing-data signal shapes, and narrative templates that *cite* reference rows; keep in reference tables: all scrapeable public-criteria values and membership sets — so that seat 1 owns interpretation and seat 2 owns currency of inputs.`
**Handoff:** both

### ref-16
**Question:** How should import criteria handle scraped Canada.ca tables that are incomplete or HTML-shifted?
**References:**
- Rounds of invitations — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html
- Category-based selection occupation tables — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html
**Thesis gap:** Auto-publish from a broken scrape can ship empty category sets or swapped CRS columns — a worse failure than being one day stale.
**Solution:** `Require schema validation + dual-human or human+checksum gate before publish (row counts, required columns, CRS floor sanity bands, category NOC cardinality checks); failed imports stay draft and alert house upkeep — so that freshness never outranks correctness.`
**Handoff:** cto

### ref-17
**Question:** Who notices when a wrong cutoff or category list ships, and what detection practice is required?
**References:**
- World hard-gate posture: inspectable open-box evaluation
- Rounds ledger — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html
**Thesis gap:** Firms inhabit Analysis; they are not paid to QA Om Coda’s Canada.ca mirror. Silent wrong data becomes consultant license risk before house notices.
**Solution:** `Run house-side reconciliation: published cutoff/category rows vs live Canada.ca snapshot on a fixed cadence; alert on drift; sample firm evaluations that flipped on the last publish for spot-check; expose reference-version id on Analysis read-outs for seat-1/desk sync — so that wrong data is caught by upkeep ops, not by a client complaint after outreach.`
**Handoff:** both

### ref-18
**Question:** Who is liable when house-shipped wrong reference data causes mis-scored eligibility and firm outreach under license?
**References:**
- Seed KU #9 ownership/IP/liability of packs that consume this data
- World §1.1–1.2 reference-data upkeep → firm book evaluations (liability open)
- SME-GRAPH seat 1 ↔ seat 2 edge
**Thesis gap:** “Versioned data Tower maintains” without a liability split leaves Om Coda and the RCIC/firm each assuming the other owns the error.
**Solution:** `Treat wrong public-reference constants as house (Om Coda) operational liability for currency and provenance; treat pathway advice, file strategy, and whether to act on a signal as firm/desk license liability (seat 1/4); require Analysis to label scores as system evaluations against cited reference versions — not as IRCC determinations — so that handoff risk is explicit: house owns rotten tables; firm owns professional judgment on motion.`
**Handoff:** both

### ref-19
**Question:** What incident hold is required when a bad publish is detected while campaigns are live?
**References:**
- How publish version leaf; consultant governance Halt (adjacent desk practice)
- World open-box / agency operator layer
**Thesis gap:** Rolling forward without rollback leaves poisoned scores in motion; silent rollback without delta confuses consultants mid-meeting.
**Solution:** `Support publish rollback to last-known-good reference versions with an operator incident flag; pause draw/category-dependent reactivation enrollment until reconcile completes; re-score and emit corrective deltas with “reference correction” cause — so that wrong-cutoff blast radius is contained without pretending the bad version never existed.`
**Handoff:** both

### ref-20
**Question:** How should “current CRS competitiveness” be modeled — latest general draw only, or by round type/category?
**References:**
- Rounds of invitations (general, program-specific, category-based) — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html
- Category-based selection — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html
**Thesis gap:** A single “latest CRS cutoff” scalar misleads when recent rounds are CEC-only, PNP-only, or category-based with floors that are not comparable.
**Solution:** `Store and score against round-type-scoped floors (and category id when category-based); never collapse all rounds into one “current cutoff” constant; Analysis comparisons must name the round type/category of the floor used — so that wrong-cutoff handoffs of the “you’re above/below the draw” kind cannot form from incomparable rounds.`
**Handoff:** both

### ref-21
**Question:** Are pool CRS distribution snapshots reference data Tower must version for V1?
**References:**
- Rounds of invitations page (CRS score distribution table in pool) — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html
**Thesis gap:** Distribution tables help narrative “competitiveness” but are not required to assert pathway/category/draw eligibility gates.
**Solution:** `Defer pool distribution snapshots as nice-to-have narrative inputs; do not block V1 table set on them; if shipped later, version with same provenance rules and never use distribution alone as an eligibility gate — so that V1 currency focus stays on decisioning tables.`
**Handoff:** pm

### ref-22
**Question:** How should ECA designated-organization lists and ECA→education-level maps be treated for V1?
**References:**
- Educational credential assessment — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/education-assessed.html
- FSW education points — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html
**Thesis gap:** ECA org lists and equivalency→points maps change rarely but unlock FSW/CRS education scoring; inventing them in packs creates silent education mis-scores.
**Solution:** `Include designated ECA organizations + assessment-result→profile-level/FSW-points maps as a V1 versioned constants table sourced from the ECA Canada.ca page; cadence = on IRCC page change + quarterly verify — so that education points stay data-driven without weekly scrape pressure.`
**Handoff:** both

### ref-23
**Question:** What proof-of-funds / settlement-funds amounts belong in reference data for V1?
**References:**
- Federal Skilled Worker Program (proof of funds requirements live on program pages; amounts update periodically) — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/who-can-apply/federal-skilled-workers.html
  — NEEDS VERIFICATION: confirm current proof-of-funds table URL/subsection on each publish cycle (IRCC relocates amount tables).
**Thesis gap:** Funds thresholds are classic hardcoded traps; they are not needed for every V1 outcome family.
**Solution:** `If any V1 pack asserts FSW funds adequacy, ship the official funds-by-family-size table as versioned data with quarterly+on-change verify; otherwise defer — so that unused funds tables do not dilute upkeep while asserted ones never live in code.`
**Handoff:** pm

### ref-24
**Question:** How do category experience predicates (months required, continuity, Canada-vs-abroad) get versioned when IRCC wording changes?
**References:**
- Category-based selection eligibility (e.g. healthcare/STEM/trades: ≥12 months full-time or equivalent part-time in past 3 years; physicians/senior managers/researchers: Canadian experience) — https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations/category-based-selection.html
- Express Entry Year-End Report 2024 fact sheet (historical 6-month framing in prior year reporting) — https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/express-entry-year-end-report-2024/fact-sheet-2024.html
**Thesis gap:** Older secondary guidance still cites six-month category experience; scoring against stale predicates is a silent false-positive/negative class.
**Solution:** `Store category eligibility predicates as versioned structured fields (min months, lookback years, continuity flag, location scope) copied from the live category page—not from year-end reports or blogs; invalidate prior predicate versions when the live page changes — so that category assertions track IRCC’s current instructions, not folklore.`
**Handoff:** both

### ref-25
**Question:** What operator cadence and staffing practice keeps “no code deploy” real for reference upkeep?
**References:**
- World §1.1 Om Coda reference-data upkeep entity
- How `operator-reference-data.md` edit/import + publish
**Thesis gap:** Without a named house duty and SLA, currency collapses into engineering tickets—the exact anti-pattern Directive 3 forbids.
**Solution:** `Staff reference-data upkeep as a house ops function with on-call for draw days, dual-check publish rights, and a written SLA matrix (draws: same business day; categories/NOC/CRS/language: on-change + scheduled verify); engineering only builds the store/import pipeline — so that currency remains an operations practice, not a release train.`
**Handoff:** both

### ref-26
**Question:** What must the handoff to eligibility ops (seat 1) include so packs do not re-encode reference values?
**References:**
- SME-GRAPH edge: [2 IRCC reference data] ——consumes/freshness—— [1 Eligibility ops]
- Seed §5.7 fields unlocking gaps/ops (CRS/draw constants among them)
**Thesis gap:** Seat 1 packs that embed “example” cutoffs for narrative demos become production literals; seat 2 currency then cannot heal mis-scores.
**Solution:** `Contract that seat-1 packs reference table keys/version pins only (category ids, round-type floor lookups, NOC membership checks, CLB chart ids); any demo fixture cutoffs stay in non-prod seeds; shared review rejects PRs/pack publishes that introduce numeric public-criteria literals — so that wrong-cutoff liability stays with the reference layer and eligibility interpretation stays with seat 1.`
**Handoff:** both

---

## Cross-cuts (for HANDOFF / CROSS-CUTTING)

| Edge | Items |
|---|---|
| Seat 1 eligibility packs consume tables; must not hardcode | ref-01, ref-02, ref-14, ref-15, ref-26 |
| Publish mid-flight + delta/re-score | ref-11, ref-12, ref-13, ref-19 |
| Wrong-cutoff notice + liability split | ref-17, ref-18, ref-19, ref-20 |
| Provincial lifecycle (OINP closure) | ref-09 |
| CTO store/provenance/import gates | ref-06, ref-10, ref-14, ref-16 |

## Explicit non-goals (this seat)

- Pathway pass/fail interpretation, service-eligible language, form field legitimacy → seat 1
- Hub/Reference data UI chrome → PM
- Non-Canada reference packs for V1 → out of scope
