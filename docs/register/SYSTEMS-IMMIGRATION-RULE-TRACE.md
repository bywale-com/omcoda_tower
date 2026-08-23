# Systems — Immigration rule trace (fields · outcomes · constants · versioning)

**Seat:** Systems Analyst.  
**When:** 2026-08-23 17:20 UTC.  
**What this is:** the field/outcome/constant inventory the founder asked for. **Not an Engineer cut.** Not UI. Founder + PM use this to see what exists before any new glass.  
**Source of truth walked:** pack `immigration-service-eligibility` v3 (`src/app/data/automationRules.ts`) · matrix `immigrationMatrixOutcomes.ts` · constants `automationConstants.ts` · Hub pull `automationDataPull.ts` · SPA reference `immigrationReferenceTables.ts` · `collectible_fields` (`018` on `origin/main`) · `fact_writebacks` / `constants_packs` / `reference_versions` (`004`).  
**Flag:** 15:43 untouched. Do not recut 015 / 019 / 027.

There was **no** field-to-store traceability matrix. The existing “matrix” is R-* results + B-* billings only (`immigrationMatrixOutcomes.ts`). This file is the missing one: **every variable the immigration Rule needs from a person** (or from a constant / reference), whether a per-client row can exist, and how outcomes actually fire.

---

## How to read this

Three stores. Do not collapse them.

| Store | What it is | Per client? |
|-------|------------|-------------|
| `collectible_fields` | Catalog of **names** (label, `field_key`, capture kind) | No |
| `fact_writebacks` | A **value** (`field_key` + `value`) | Only **after** that field is written for that person. No empty slot. |
| `missing_fact_signals` | The **ask** | Per client when the Rule asked and it is missing |

Hub `client_data.*` is **not a table**. It is the painted Client desk (`clients.ts`) pulled by `automationDataPull.ts`. `contact_records` is the person (name / email / firm / `body`). It does **not** have these fields as columns.

**Exists as a possible per-client record** = there is a `collectible_fields.field_key` whose write would land in `fact_writebacks`. Unfilled still means no row.

**Silent** = the pack reads a path that has **no** `field_key` and **no** first-class column. Get cannot query it. Do not invent it here.

---

## A. Every client variable the pack needs

Unique lefts. GUI condition **and** evaluator extra reads (the JS already walks more than the boxes show).

| # | Variable (what we need from the person) | Pack / Hub path | `collectible_fields` | Per-client row possible? | Capture | Used by |
|---|-----------------------------------------|-----------------|----------------------|--------------------------|---------|---------|
| 1 | Canadian skilled hours | `information.canadian_skilled_hours` | `canadian_skilled_hours` | Yes, after write | self-report | GUI + pathway + gaps. Hub **derives** from profile “Canadian work exp.” months × 1560 |
| 2 | Language CLB | `crs.language_clb` | `language_clb` | Yes | self-report | GUI + pathway + gaps + category (French proxy, unused) |
| 3 | TEER category | `crs.teer_category` | `teer_category` | Yes | self-report | GUI + pathway JS |
| 4 | Foreign work years | `information.foreign_work_years` | `foreign_work_years` | Yes | self-report | GUI + pathway + gaps |
| 5 | Foreign trade hours | `information.foreign_trade_hours` | `foreign_trade_hours` | Yes | self-report | GUI + pathway JS (FST) |
| 6 | Ontario job offer | `information.has_ontario_job_offer` | `has_ontario_job_offer` | Yes | document · **employer** | GUI + pathway JS (PNP-01/03) |
| 7 | Qualifying job offer | `information.has_qualifying_job_offer` | `has_qualifying_job_offer` | Yes | document · **employer** | **JS only** (FST offer-or-cert). No GUI box |
| 8 | Trade certificate | `information.has_trade_certificate` | `has_trade_certificate` | Yes | document | **JS only** (FST). No GUI box |
| 9 | ECA status | `information.eca_status` | `eca_status` | Yes | document | GUI exists + gaps JS (`missing` / `expired`) |
| 10 | EE profile exists | `information.ee_profile_exists` | `ee_profile_exists` | Yes | self-report | GUI + ops JS |
| 11 | EE profile last updated | `information.ee_profile_last_updated` | `ee_profile_last_updated` | Yes | self-report | GUI + gaps/ops JS (months-since) |
| 12 | NOC | `crs.noc` | `noc` | Yes | self-report | GUI + pathway JS (FST/PNP-03) + category JS |
| 13 | CRS score | `crs.score` | `crs_score` | Yes | self-report | GUI draw |
| 14 | OINP student context | `information.oinp_student_context` | **none** | **No** | — | GUI + pathway JS (PNP-02) |
| 15 | Province | `crs.province` | **none** | **No** | — | **JS only** (Ontario test for PNP) |
| 16 | Work-permit warn | `crs.work_permit_warn` | **none** | **No** | — | GUI + ops JS → R-OPS-05 + nudge |
| 17 | Work-permit expiry | `crs.work_permit_expiry` | **none** | **No** | — | **JS narrative only** |
| 18 | Days in system | `information.days_in_system` | **none** | **No** | — | GUI “Profile metadata present” → wrongly R-OPS-01 |
| 19 | Client status | `information.status` | **none** | **No** | — | GUI only. Builder **ignores** it. Hub paint (`eligible` / `close` / `pending`) |

**Catalog rows the pack never reads** (exist as names, not used by this Rule):

| `field_key` | Capture | Notes |
|-------------|---------|-------|
| `oinp_employer_revenue` | document · employer | Constant `oinp.employer_min_revenue_cad` exists. Evaluator does not read the field. |
| `lmia_paperwork` | document · employer | Constants for LMIA bonuses exist. No left. |

**Not on the person (right side / lists):** cutoff, TEER ineligible list, CLB minima, category NOC lists, designated trades, OINP IDS list. Those are constants / reference. See §C.

---

## B. Outcomes — families, orphans, JS vs GUI

Live families (toggles on the Rule): **Pathway detection · Gaps · Profile & operations · Category draws · Draw competitiveness.**

That grouping is already right as a **scoreboard**. What is wrong is: GUI boxes ≠ what asserts the R-*. Pathway / category / most gaps / most ops are **custom comparisons** already written in TS (`buildPathwayOutcome` etc.). The boxes are a partial, often unused, list.

### B1. Pathway (`pathway`) — keep this group

| R-* | Label | Client variables | Asserts today? | Kind |
|-----|-------|------------------|----------------|------|
| R-CEC-01 | CEC eligible | hours, language_clb, teer | Yes — **JS compound** (hours≥min ∧ CLB≥7 ∧ TEER not 4/5) | Custom |
| R-FSW-01 | FSW eligible | foreign_work_years, language_clb, teer | Yes — JS. **Missing vs matrix:** education, grid points, window years (constants exist, no lefts) | Custom |
| R-FST-01 | FST eligible | noc (trade list), language_clb, trade hours **or** offer **or** cert | Yes — JS. Uses `fst.min_clb_speaking_writing` only; listening/reading constant unused | Custom |
| R-PNP-01 | OINP Foreign Worker | province, Ontario offer, teer, language_clb | Yes — JS. Province **silent**. Employer years/staff/revenue constants unused | Custom |
| R-PNP-02 | OINP International Student | province, oinp_student_context, language_clb | Yes — JS. Student context **silent**. GUI constant wrongly `ee.profile_required_for_ita` | Custom |
| R-PNP-03 | OINP In-Demand Skills | province, Ontario offer, noc ∈ IDS list | Yes — JS | Custom |

GUI boxes under Pathway are a **flat bag** of those inputs. They do not themselves assert R-*. **JS is the real comparison.** That is correct for this family.

### B2. Gaps (`gaps`) — keep this group; two declared orphans

| R-* | Label | Client variable | Asserts today? | Kind |
|-----|-------|-----------------|----------------|------|
| R-GAP-01 | Canadian hours shortfall | canadian_skilled_hours | Yes — GUI fail + builder | Simple ≥ |
| R-GAP-02 | Foreign work shortfall | foreign_work_years | Yes — JS (builder re-reads; GUI `foreign-work-vs-fsw` is unused for the assert) | Simple ≥ |
| R-GAP-03 | Language gap | language_clb **exists** | Yes — GUI `exists` fail. Does **not** test CLB vs minimum (that is pathway) | Exists |
| R-GAP-04 | ECA missing or expired | eca_status | Yes — JS string `missing` \| `expired`. GUI is only `exists` | Custom (enum) |
| R-GAP-05 | Profile freshness | ee_profile_last_updated | Yes — JS months-since > `profile.stale_months`. GUI is only `exists` | Custom (date math) |
| R-GAP-06 | CRS foreign-exp window | **none wired** | **Never.** Constant `crs.foreign_exp_points_window_years` exists. Need a **date or years-in-window** on the person | Custom — orphan |
| R-GAP-07 | Document / continuity | **none wired** | **Never.** No field. Closest unused catalog: employer docs / LMIA | Custom — orphan |

### B3. Profile & operations (`ops`) — keep; several are the wrong variable or never fire

| R-* | Label | What it should need from the person | What it uses today | Asserts? |
|-----|-------|-------------------------------------|--------------------|----------|
| R-OPS-01 | Presence / status routing | In-Canada / status (silent `status`, maybe province) | `days_in_system` **exists** | Yes — **wrong left.** Days-in-system is not presence |
| R-OPS-02 | No EE profile | ee_profile_exists = false | that field | Yes |
| R-OPS-03 | Stale / expired profile | ee_profile_last_updated + stale/expire months | that field + JS date math | Yes |
| R-OPS-04 | Monitoring cadence | **none named** | nothing | **Never** |
| R-OPS-05 | Reactivation narrative | work-permit urgency | `work_permit_warn` (silent boolean) + expiry narrative | Yes, on Hub paint only |
| R-OPS-06 | Prior-app / filing conflict | pending application | GUI `status` exists; builder **ignores**. Constant `application.pending_blocks_new_filing` unused for assert | **Never** |

**Group these orphans belong in (do not invent a sixth family until PM says):**

| Orphan / misfit | Put with | Why |
|-----------------|----------|-----|
| work_permit_warn, work_permit_expiry | **ops** (already) | Urgency / reactivation. Need a real person field (expiry date), not a painted boolean |
| status / pending filing | **ops** (R-OPS-06) | Same family. Need a real field, not Hub `eligible/close/pending` |
| days_in_system | **Do not keep as R-OPS-01** | Desk chrome. Not a Rule left |
| oinp_student_context, province | **pathway** inputs | Not their own family |
| French NCLC | **category** (R-CAT-05) or a **Language** sub-group under gaps | Sibling of `language_clb`, not the same variable |
| R-GAP-06 window, R-GAP-07 continuity | **gaps** | Already declared. Need the person variable first |
| Employer revenue, LMIA | **pathway / documents** — **firm-directed**, not client | `collectible_fields.employer_directed`. Not a contact fact |

A sixth family (**Status / permit** or **Language**) is a PM call if ops stays overloaded. Machine: they are still person writes or silences. I do not mint a family table.

### B4. Category (`category`) — keep; French is the orphan

| R-* | Client variable | Asserts? | Kind |
|-----|-----------------|----------|------|
| R-CAT-01…04 | noc ∈ versioned stream list | Yes — **JS** vs SPA `CATEGORY_OCCUPATION_TABLE`. GUI only tests noc `exists` | Custom (list membership) |
| R-CAT-05 French | **French NCLC** (not on catalog) | **Never.** Code reads `language_clb` as a proxy and then **refuses** to assert | Custom — needs a new person variable |

### B5. Draw (`draw`) — keep; honest simple compare

| R-* | Left | Right | Kind |
|-----|------|-------|------|
| R-DRAW-01 | crs_score | `draw.latest_crs_cutoff` (SPA number 524). SPA `DRAW_CUTOFF_TABLE` has 524 / 515 / 486 **and is never read** | Simple ≥ |

Cutoff-by-type (Directive 3) is specified and **not** wired. Still one constant.

---

## C. Constants — where they live, which the pack actually uses

**House that should win:** `constants_packs.payload` (firm NULL = platform) and, for versioned lists / cutoffs, `reference_versions` (`004`: `key`, `payload`, `version`).

**Live right-hand read:** SPA `automationConstants.ts` → `getAutomationConstant`. Seed `003_canonical_workflows.sql` has three Hub packs (`cutoff:480`, pathways, firm name) — **not** these keys.

**Live list read:** SPA `immigrationReferenceTables.ts` (version / superseded **in TypeScript**). `latestCutoffForDrawType` is **dead code**. Walker does not SELECT `reference_versions`.

### C1. Keys the immigration Rule actually touches

| Key | Used as | In `constants_packs` today? |
|-----|---------|------------------------------|
| `cec.min_hours` | right + JS | No (SPA 1560) |
| `cec.min_clb_all` | right + JS | No |
| `teer.ineligible` | right + JS | No |
| `fsw.min_foreign_years` | right + JS | No |
| `fsw.min_clb_all` | JS | No |
| `fst.min_foreign_trade_hours` | right + JS | No |
| `fst.min_clb_speaking_writing` | JS only | No |
| `oinp.employer_streams_require_offer` | GUI right (PNP offer) | No |
| `oinp.fw_allowed_teers` | JS | No |
| `ee.profile_required_for_ita` | GUI right **reused** for student context **and** work-permit warn | No |
| `eca.required_for_foreign_credential` | GUI right (exists check — unused by builder) | No |
| `profile.stale_months` | GUI + JS date math | No |
| `profile.expire_months` | GUI + JS | No |
| `application.pending_blocks_new_filing` | GUI right (status exists — unused) | No |
| `ircc.category_occupation_list` | GUI right (noc exists — unused; real list is SPA table) | No |
| `draw.latest_crs_cutoff` | draw right | No (SPA 524; seed pack says 480) |
| `french.category_min_nclc_all` | JS, never asserts | No |

### C2. Keys in the SPA catalog this pack does **not** read (homework still on the shelf)

`cec.min_years` · `cec.window_years` · `cec.allowed_teers` · `cec.exclude_student_work_during_enrollment` · `cec.excluded_statuses` · `study.max_hours_per_week_during_study` · `fsw.eligibility_window_years` · `fsw.grid_min_points` · `fsw.allowed_teers` · `fsw.min_education` · `crs.foreign_exp_points_window_years` · `crs.foreign_exp_max_points` · `crs.french_bilingual_max_bonus` · `crs.sibling_bonus_points` · `crs.lmia_*` · `fst.foreign_trade_window_years` · `fst.min_clb_listening_reading` · `fst.requires_job_offer_OR_certificate` (logic is hardcoded `hasOffer \|\| hasCert`) · `language.test_validity_years` · `language.retake_urgency_months` · `eca.validity_years` · `work.fulltime_min_hours_week` · `province.ontario` · `province.quebec_excludes_federal_ee` · `oinp.employer_min_*` · `oinp.ids_eligible_occupation_list` (real IDS is SPA table) · `ee.designated_tests_required` · `ircc.fst_designated_trade_noc_list` · `score_to_clb_mapping` · `crs_education_points_table` · `crs_spouse_points_table` · `prevailing_wage_tables` · `draw.active_category_streams`.

Those imply **more person (or spouse / employer) variables** if they ever enter the Rule: education credential, test date, sibling in Canada, spouse scores, French NCLC, work-start/end for the 5-year window, student-work-during-enrollment, Quebec vs Ontario. **Not in `collectible_fields`.** I do not mint them in this file.

---

## D. Versioning — how it works today (not how Directive 3 described it)

| Thing | Version field | What actually happens |
|-------|---------------|------------------------|
| Pack | `IMMIGRATION_SERVICE_ELIGIBILITY_PACK.version = 3` | Frozen in the SPA. Bump the number in git. |
| Each GUI condition | `version: 1` | Unused by the walker |
| `constants_packs.version` | INT | Seed rows exist; evaluator does not read the table |
| `reference_versions` | `(firm_id, key, version)` UNIQUE | Table stood up. **No IRCC lists / cutoffs written here** |
| SPA `immigrationReferenceTables` | `version`, `effectiveFrom`, `superseded` | In-memory. Update = code deploy. Opposite of Directive 3 (“no code deploy to update”) |
| `collectible_fields` | none | Catalog replace |
| `fact_writebacks` | none | Latest write is just another INSERT. No “this value is for pack v3” |

So: **criteria versioning is TypeScript.** Postgres has the hooks (`constants_packs`, `reference_versions`) and they are unused for this pack. 027 already said fold keys into `constants_packs`; lists/cutoffs belong in `reference_versions` if we stop deploying to change a NOC list. That is not a new table.

---

## E. What is “new” (should be in the immigration Rule — named, not designed)

These are **holes in the pack that already claims the R-***, not a wish list.

**Person variables that must be able to exist** (catalog + writeback) before UI talk:

1. Already named in `collectible_fields` — **13** in §A (hours through CRS). Those **can** exist per client after write. They are not on Contacts / Get today.
2. **Silent but the pack already depends on them** — must exist as person (or firm) writes if those outcomes stay on:
   - `oinp_student_context`
   - `province` (or “Ontario intent”)
   - work-permit **expiry date** (warn is a derived compare, not a stored boolean)
   - **pending / prior application** (R-OPS-06)
   - **French NCLC** (R-CAT-05)
   - **foreign-experience in 5-year window** (R-GAP-06) — a date or years-in-window, not raw years
3. **Declared R-* with no variable at all:** R-OPS-04 (monitoring cadence), R-GAP-07 (document continuity). Either drop from the scoreboard or name the write.
4. **JS-only inputs already in catalog:** qualifying offer, trade certificate — they should appear as Rule lefts (or stay JS-only; they are still person facts).
5. **Wrong reuse:** `ee.profile_required_for_ita` as the right for student context and work-permit warn. Those are not that constant.
6. **Days in system / Hub status** — not Rule lefts.

**Do not mint tables from this list.** Catalog row + `fact_writebacks` is the store for person facts. Employer-directed stays a fact on the **firm** or a document ask — not a contact column. Constants / lists stay `constants_packs` / `reference_versions`.

---

## F. Two buckets (for the PM conversation)

**Specified and clear (machine already named):**

- 13 collectible keys ↔ this pack’s person lefts.
- Five outcome families stay.
- Pathway / category / stale-profile / ECA enum / FST offer-or-cert / PNP compound = **JS** (custom compare). Draw CRS≥cutoff and hours≥min = **GUI**.
- Constants belong in `constants_packs`; versioned lists/cutoffs in `reference_versions`. SPA catalogs are leftover.
- 027: Rule boxes are chips into those writes, not Hub path text.

**Specified but not clear (PM + you — I do not invent glass):**

- Whether silent fields (permit expiry, province, student context, French NCLC, pending app, window dates) become Contacts fields (then Get can offer them) or stay unnamed.
- Whether R-GAP-06/07, R-OPS-04/06, R-CAT-05 stay on the scoreboard.
- Whether ops splits (permit / status) or language becomes its own toggle.
- Cutoff-by-type vs one `draw.latest_crs_cutoff`.
- How a writeback is versioned against a pack (today: not).

---

## Do not

- Treat Hub `clients.ts` / `client_data` as the per-client store.
- Mint `work_permit_warn` as a boolean column (derive from expiry + a constant).
- Put employer revenue on the contact.
- Recut 019 / 027 from this file.
- Overwrite 15:43.
