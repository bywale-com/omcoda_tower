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
Starting from Reference data, click Reference tables to open the tables catalog, then view seven house-owned Canada family rows: NOC+TEER, EE category membership, FST eligible trades, round/cutoff ledger, CRS+FSW grids, language CLB/NCLC equivalency, and provincial EE identifiers scoped to programs packs assert.
On Reference tables, click a family row to open its editor or click Import criteria to open the import panel; click Publish version only when every V1 outcome family consumes published rows, not evaluator literals.

**implementationAdds:** ["NOC+TEER", "EE category membership", "FST eligible trades", "round/cutoff ledger", "CRS+FSW grids", "language CLB/NCLC equivalency", "provincial EE identifiers"]

---

### ref-02
**implementationProblem:**
Treating every provincial stream catalog as V1-critical bloats currency ops; omitting CLB charts or CRS grids silently forces hardcoding. Currency effort must match what packs actually score.

**implementation:**
On Reference tables, view V1 must-have family rows marked with a current-required chip: NOC+TEER, category membership, round/cutoff ledger, CRS+FSW grids, and language equivalency.
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor; when a pack asserts a PNP-* pathway, set Provincial EE identifier requirement with the segmented control to On and click Publish version. On Reference tables, view multi-province deep stream catalog rows with a deferred chip until a published Evaluation pack requires them.

**implementationAdds:** ["must-have", "deferrable", "optional-until-asserted"]

---

### ref-03
**implementationProblem:**
Secondary draw blogs republish within hours but are not authoritative — house import from blogs creates unprovable currency and silent transcription error.

**implementation:**
Starting from Reference data, click Reference tables, click the round/cutoff ledger row, then click Import criteria. In the Import criteria panel, choose Canada.ca rounds-of-invitations plus ministerial-instructions round ledger from the Canonical source dropdown.
In the same Import criteria panel, set third-party draw pages with the Source use dropdown to Discovery alert only, never Publishable truth.
On Publish version, the publish button stays disabled until the version has a government page URL field and scrape/import provenance fields filled.

**implementationAdds:** ["canada.ca", "ministerial-instructions", "discovery-alert-only"]

---

### ref-04
**implementationProblem:**
“Keep current” without an SLA is aspirational; mid-week multi-draw weeks break weekly-only review and leave draw-shaped Analysis a day-plus stale.

**implementation:**
Starting from Reference data, click the round/cutoff ledger row, then use the SLA panel to run the same-business-day flow: detect row -> import button -> dual-check CRS floor and round type checklist -> Publish version button.
On Reference data, set the Canada.ca poll cadence with a schedule dropdown to at least daily, and click the on-alert action button when a round appears.
On Publish version, view prior round versions as immutable rows with locked chips.

**implementationAdds:** ["same-business-day", "daily-poll", "on-alert"]

---

### ref-05
**implementationProblem:**
Category NOC lists and experience windows change; a one-time seed CSV goes stale while packs keep scoring against folklore.

**implementation:**
Starting from Reference data, click Reference tables, then click the EE category membership row. In the table editor, fill category id fields, eligibility predicate fields, and NOC+TEER rows sourced from the live Canada.ca category-based selection page.
Click Import criteria and set the re-check trigger checkboxes to every IRCC page change and annual category re-establishment.
On Publish version, the merge checkbox for historical category lists into current stays unavailable; category assertions pin to a dated ministerial definition row.

**implementationAdds:** ["category-id", "dated-ministerial-definition"]

---

### ref-06
**implementationProblem:**
Evaluators need 5-digit unit group + TEER; ESDC structural NOC revisions can land before IRCC adopts them for Express Entry — silent TEER flips poison gates.

**implementation:**
Starting from Reference data, click Reference tables, then click the NOC+TEER row. In the table editor, fill NOC code, title, TEER, classification version, and IRCC-effective-from date form fields.
On Reference tables, when ESDC publishes a new structural NOC before IRCC adopts it, add a second version row and mark both rows with active/superseded chips.
Starting from Configuration libraries, click the Evaluation packs row and open Evaluation pack editor; choose the IRCC-effective NOC version from the NOC version pin dropdown, then click Publish version so TEER gates do not flip on an ESDC-only publish.

**implementationAdds:** ["classification-version", "IRCC-effective-from", "dual-version"]

---

### ref-07
**implementationProblem:**
CRS factor changes (e.g. arranged-employment points removed) are law/public-reference moves; hardcoding point tables in evaluator code freezes wrong scoring after MI changes.

**implementation:**
Starting from Reference data, click Reference tables, then click the CRS+FSW grids row. In the table editor, fill CRS factor grid rows and FSW 67/100 selection-factor rows with effective-date fields from Canada.ca CRS criteria, current MI, and FSW pages; click Publish version.
Starting from Configuration libraries, click the Evaluation packs row and open Evaluation pack editor; set Point-table read policy with a dropdown to Evaluation-time version or Explicit pack pin; click Publish version. Point-table changes ship via Publish version, not a code deploy.

**implementationAdds:** ["CRS factor grids", "FSW 67/100", "effective-from"]

---

### ref-08
**implementationProblem:**
Accepted tests and band→CLB maps change (PTE Core; future tests); embedding maps in code mis-scores language gates and CRS language points.

**implementation:**
Starting from Reference data, click Reference tables, then click the language CLB/NCLC equivalency row. In the table editor, maintain versioned chart rows per approved test and ability plus program-minimum CLB/NCLC rows for FSW, CEC, FST, and French category, sourced only from the IRCC language-test page.
Click Import criteria and turn on the New approved test announcement checkbox for re-verification.
On Publish version, language gates and CRS language points move as published data rows.

**implementationAdds:** ["CELPIP", "IELTS-GT", "PTE-Core", "TEF", "TCF", "CLB", "NCLC"]

---

### ref-09
**implementationProblem:**
Seed’s “OINP IDS” example can freeze closed-stream shape into V1; publishing HCP/FSSW/Skilled Trades NOI cutoffs as current after stream closure is a wrong-cutoff class failure.

**implementation:**
Starting from Reference data, click Reference tables, then click the provincial EE identifiers row. In the table editor, set each stream/draw row with the Status dropdown to Open, Closed, or Superseded and fill source URL plus last-verified-at fields.
On Reference tables, closed OINP EE streams show non-current chips and cannot be selected as current eligibility inputs.
Starting from Configuration libraries, click the Evaluation packs row and open Evaluation pack editor; when a pack needs Ontario PNP-*, choose the live ontario.ca program shape from the Ontario PNP-* pin dropdown, then click Publish version. Historical NOI ledger rows stay audit/replay only.

**implementationAdds:** ["open", "closed", "superseded", "last-verified-at", "audit-replay-only"]

---

### ref-10
**implementationProblem:**
Without provenance, house cannot prove what was current when Analysis fired; liability disputes collapse into “the system said so.”

**implementation:**
On Publish version, the publish button stays disabled until source URL fields, source retrieved-at field, importer identity dropdown, dual-check attestation checkbox, effective-from field, supersedes-version-id field, and content hash field are complete.
On Analysis, click Evaluation provenance to view the government page row backing the constants used for any mid-flight or post-hoc evaluation.

**implementationAdds:** ["source-retrieved-at", "dual-check attestation", "supersedes-version-id", "content-hash"]

---

### ref-11
**implementationProblem:**
“Packs read current published version” can silently rewrite eligibility under a consultant’s license mid-campaign; pinning forever never reflects new draws.

**implementation:**
On Publish version, view Draft and Published-current as separate status chips; clicking the Publish version button makes the new version current for subsequent evaluations only.
On Analysis, click Evaluation provenance to view exact reference-version id rows used; already-emitted signals/Analysis retain their pin for audit.
Starting from Configuration libraries, click the Evaluation packs row and open Evaluation pack editor; set Re-evaluation policy with a dropdown to Adopt current or Stay pinned, then click Publish version so mid-flight firms get explainable deltas, not silent rewrite.

**implementationAdds:** ["draft", "published-current", "reference-version-ids", "adopt-current", "stay-pinned"]

---

### ref-12
**implementationProblem:**
Immediate book-wide rescore is the product bet; uncontrolled fan-out without delta surfacing creates consultant distrust and false reactivation storms.

**implementation:**
On Publish version for a cutoff ledger, click the Enqueue book re-evaluation button to adopt the new round ledger version.
On Analysis, click Evaluation provenance to view eligibility delta rows such as was below or now at-or-above observed floors by round type, emitted as signals under Engine 2 precedence.
No outreach button or automatic enrollment fires solely because a number moved; engagement law still owns motion.

**implementationAdds:** ["was-below", "at-or-above", "round-type floor", "no-auto-outreach"]

---

### ref-13
**implementationProblem:**
Always-latest without pin loses replay; forever-pin loses currency; firm-configured freezes without house oversight recreate stale-cutoff liability.

**implementation:**
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. In the Reference pins panel, set Table-family policy with the dropdown to Follow published-current by default; choose Explicit pack pin only after filling Expiry and Reason fields for audit/replay, incident hold, or supervised A/B; click Publish version. On Oversight and on Analysis -> Evaluation provenance, view pin-age chips so freeze is a controlled exception, not the default currency model.

**implementationAdds:** ["follow-published-current", "pin-expiry", "pin-reason", "pin-age"]

---

### ref-14
**implementationProblem:**
Even with Reference data, engineers embed “last known” CRS floors, category NOC lists, CLB maps, or TEER thresholds in condition code “temporarily” — Directive 3 becomes aspirational.

**implementation:**
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. In the Rule structure panel, author only structural operators with comparison dropdowns, any/all pathway checkboxes, and Engine 2 precedence rows; click Publish version. Public-criteria values resolve from Reference tables.
On Reference tables, CRS round floors, category->NOC sets, FST trade sets, TEER program gates, CLB equivalency bands, CRS/FSW point grids, provincial stream identifiers/cutoffs, and asserted settlement-fund amounts appear as published data rows only; review rejects evaluator-literal chips for those families.

**implementationAdds:** ["no-evaluator-literals", "structural-operators-only"]

---

### ref-15
**implementationProblem:**
Pushing pathway interpretation into reference tables invents law or conflates seats; pushing everything into code re-breaks currency.

**implementation:**
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. Keep outcome-family toggles as checkboxes, client-field combine logic as any-pathway rows, missing-data signal shapes as dropdowns, and narrative templates with reference-row citation chips; click Publish version.
On Reference tables, view scrapeable public-criteria values and membership sets as table rows owned by seat 2; seat 1 owns interpretation in Evaluation pack editor.

**implementationAdds:** ["outcome-family toggles", "cite-reference-rows"]

---

### ref-16
**implementationProblem:**
Auto-publish from a broken scrape can ship empty category sets or swapped CRS columns — worse than being one day stale.

**implementation:**
On Import criteria, turn on schema validation checkboxes plus either the Dual-human gate checkbox or the Human+checksum gate checkbox before Publish version is available; validation rows include row counts, required columns, CRS floor sanity bands, and category NOC cardinality checks.
On Import criteria, failed imports remain Draft rows and show an alert chip for house upkeep; freshness never outranks correctness.

**implementationAdds:** ["schema-validation", "dual-human", "human+checksum", "draft-hold"]

---

### ref-17
**implementationProblem:**
Firms inhabit Analysis; they are not paid to QA Om Coda’s Canada.ca mirror. Silent wrong data becomes consultant license risk before house notices.

**implementation:**
On Reference data, open the reconciliation panel, choose a fixed cadence from the schedule dropdown, and click Run reconciliation to compare published cutoff/category rows against the live Canada.ca snapshot; drift appears as an alert chip.
On Reference data, click the last Publish version row and use the Spot-check sample button to inspect firm evaluations that flipped.
On Analysis, view the reference-version id chip for seat-1/desk sync so wrong data is caught by upkeep ops, not by a client complaint after outreach.

**implementationAdds:** ["reconciliation", "drift-alert", "reference-version-id"]

---

### ref-18
**implementationProblem:**
“Versioned data Tower maintains” without a liability split leaves Om Coda and the RCIC/firm each assuming the other owns the error.

**implementation:**
On Publish version and the Reference data provenance panel, view wrong public-reference constants as house (Om Coda) operational liability rows for currency and provenance.
On Analysis, view score rows labeled as system evaluations against cited reference-version chips, not IRCC determinations; pathway advice and whether to act remain firm/desk license liability.

**implementationAdds:** ["system-evaluation", "cited-reference-version", "not-IRCC-determination"]

---

### ref-19
**implementationProblem:**
Rolling forward without rollback leaves poisoned scores in motion; silent rollback without delta confuses consultants mid-meeting.

**implementation:**
On Publish version, click Roll back to last-known-good and set the operator incident flag checkbox before the rollback publish button enables.
On Reference data, click Pause reactivation enrollment for draw/category-dependent rows until reconciliation completes.
On Analysis, click Evaluation provenance to view re-score corrective delta rows with a reference-correction cause chip; wrong-cutoff blast radius is contained without pretending the bad version never existed.

**implementationAdds:** ["incident-flag", "last-known-good", "reference-correction", "pause-reactivation"]

---

### ref-20
**implementationProblem:**
A single “latest CRS cutoff” scalar misleads when recent rounds are CEC-only, PNP-only, or category-based with incomparable floors.

**implementation:**
Starting from Reference data, click Reference tables, then click the round/cutoff ledger row. In the table editor, store round-type-scoped floor rows and category id fields when category-based.
Starting from Configuration libraries, click the Evaluation packs row and open Evaluation pack editor; any current-cutoff constant that collapses all rounds into one value shows a rejected chip, and Publish version only enables when the pack reads round-type-scoped floor keys.
On Analysis, comparison rows name the round type/category of the floor used so wrong-cutoff "above/below the draw" handoffs cannot form from incomparable rounds.

**implementationAdds:** ["round-type-scoped", "category-id floor", "no-single-current-cutoff"]

---

### ref-21
**implementationProblem:**
Pool CRS distribution tables help narrative competitiveness but are not required to assert pathway/category/draw eligibility gates — shipping them as V1 dilutes currency focus.

**implementation:**
On Reference tables, view pool distribution snapshot rows with a Deferred narrative-only chip; they do not block the V1 table set.
If shipped later on Reference tables, click the pool distribution snapshot row and version it with the same Publish version provenance fields; distribution-alone remains unavailable as an eligibility-gate dropdown choice.

**implementationAdds:** ["defer-distribution", "narrative-only", "never-eligibility-gate"]

---

### ref-22
**implementationProblem:**
ECA org lists and equivalency→points maps change rarely but unlock FSW/CRS education scoring; inventing them in packs creates silent education mis-scores.

**implementation:**
Starting from Reference data, click Reference tables, then click the ECA constants row. In the table editor, include designated ECA organization rows plus assessment-result-to-profile-level/FSW-points map rows sourced from the ECA Canada.ca page.
Click Import criteria and set cadence with checkboxes for IRCC page change and quarterly verify; education points stay data-driven without weekly scrape pressure.

**implementationAdds:** ["ECA organizations", "assessment-result map", "quarterly-verify"]

---

### ref-23
**Skipped:** NEEDS VERIFICATION — confirm current proof-of-funds table URL/subsection on each publish cycle.

---

### ref-24
**implementationProblem:**
Older secondary guidance still cites six-month category experience; scoring against stale predicates is a silent false-positive/negative class.

**implementation:**
Starting from Reference data, click Reference tables, then click the EE category membership row. In the table editor, store category eligibility predicates as versioned structured fields for min months, lookback years, continuity flag, and location scope copied from the live category page, not from year-end reports or blogs.
On Publish version, use the Invalidate prior predicates checkbox when the live page changes so category assertions track IRCC's current instructions.

**implementationAdds:** ["min-months", "lookback-years", "continuity", "location-scope"]

---

### ref-25
**implementationProblem:**
Without a named house duty and SLA, currency collapses into engineering tickets — the exact anti-pattern Directive 3 forbids.

**implementation:**
On Reference data, open the upkeep panel and set house ops owner with an Owner dropdown, draw-day on-call with a schedule field, dual-check publish rights with checkboxes, and a written SLA matrix row for draws (same business day) plus categories/NOC/CRS/language (on-change + scheduled verify).
Engineering only owns the store and Import criteria pipeline rows; currency remains an operations practice on Reference data and Publish version, not a release train.

**implementationAdds:** ["house-ops on-call", "dual-check publish rights", "SLA matrix"]

---

### ref-26
**implementationProblem:**
Seat 1 packs that embed “example” cutoffs for narrative demos become production literals; seat 2 currency then cannot heal mis-scores.

**implementation:**
Starting from Configuration libraries, click the Evaluation packs row, then click an Evaluation pack row to open Evaluation pack editor. In the Reference pins panel, use reference table key dropdowns and version-pin dropdowns only for category ids, round-type floor lookups, NOC membership checks, and CLB chart ids; click Publish version only after the shared-review checklist rejects numeric public-criteria literals. Demo fixture cutoffs stay in non-prod seeds; wrong-cutoff liability stays with Reference data, and eligibility interpretation stays with seat 1.

**implementationAdds:** ["table-keys-only", "version-pins-only", "reject-numeric-literals"]

---

## Counts

| Metric | Count |
|---|---|
| Source items | 26 |
| Skipped (NEEDS VERIFICATION) | 1 (`ref-23`) |
| Written | 25 |
| With `implementationAdds` | 25 |
