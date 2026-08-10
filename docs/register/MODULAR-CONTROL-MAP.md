# Modular → control map

**Law:** Everything non-fixed in the tables is modular. Left = modular item. Right = the control that modulates **that** item. No map = not done. Map to a control that does not change that value = **false map**.

**Loop:** map → create missing controls where they belong → connect → put each pair on trial (operate control → table holds that value).

**Source of modular set:** [`system-map/FROZEN-TABLES-v1.md`](./system-map/FROZEN-TABLES-v1.md) + [`system-map/MODULARITY-REPORT.md`](./system-map/MODULARITY-REPORT.md). Walls (`wall.*`) are non-modular.

**Status key:** `mapped` · `false-map` · `missing-control` · `faceless-by-design` · `deferred` · `trial-pass` · `trial-fail`

---

## Opening gap (why this map exists)

| Modular (left) | Claimed control (right) | Was | Now |
|----------------|-------------------------|-----|-----|
| `reference_versions.payload.rows[*].value` | Reference data → grid Value + **Publish version** | **false-map** — Publish re-sent seed constants; cascade/success without persisting the edited value | **mapped** — grid edits draft; Confirm upserts those rows; read-back must match before success |

**How this solves the gap:** the trial is no longer “did cascade fire?” It is “did **my** edited modular value land in `reference_versions`?” Publish fails closed if read-back disagrees.

---

## Map (operator / CT product face)

| Modular (left) | Control (right) | Status |
|----------------|-----------------|--------|
| `reference_versions` row / payload / version | Reference data → **Reference row value** + **Publish version** Confirm | `mapped` · trial: edit→publish→`listReferenceVersions` holds value |
| `reference_versions` import into draft | Reference data → **Import criteria** modal | `mapped` (draft stage only; values still via grid) |
| Evaluation pin `referenceVersionId` + `rulesetId` | Config libraries → Evaluation → pin fields + **Publish version** | `mapped` |
| `rule_eligibility_pathway` enable/params | Evaluation pack editor toggles | `mapped` |
| `rule_motion_precedence` enable/order | Evaluation / Agents Settings | check on trial |
| `rule_field_class_routing` enable + `setValue` | Evaluation editor | `mapped` |
| `rule_reachability_checks` enable + params | Evaluation editor | `mapped` |
| `rule_attempt_criteria` thresholds / enable | Agents → Settings | `mapped` |
| `seq_channel_ownership_order` order | Agents → Settings reorder | `mapped` |
| `seq_phase_order` order | Agents → Settings | `mapped` |
| `rule_cohort_scoring` enable / `set_value` | Agents → Settings | `mapped` |
| `rule_metrics_thresholds` enable / threshold | Agents → Settings | `mapped` |
| `seq_eligibility_pipeline` order | Automations Settings / Evaluation | `missing-control` |
| `workflow` / `workflow_state` draft→active | Automations Activate | check on trial |
| `workflow_run` / `action` | Automations Runs / graph | check on trial |
| `sequence_template` + `firm_sequence_binding` | Config Publish + Firm ops Bind | check on trial |
| `enrollment` | Bind / cascade / onboarding fire | faceless + control paths — check on trial |
| `contact_records` | Book / Contacts upload + audit | check on trial |
| `reachability_verdicts` / `sequence_ready` / `audit_runs` | Book audit run | check on trial |
| `campaign_states` | Activation posture | check on trial |
| `prepared_workspaces` | Activation & forward-deploy stage/hydrate | `mapped` |
| `halt_records` | Board halt/lift | check on trial |
| `consent_records` | Contact consent | check on trial |
| `fact_writebacks` / `missing_fact_signals` | Contact Nudge/Loop-closer/Update submit | `mapped` |
| `eligibility_*` / `signals` / `motion_decisions` | Faceless from reference/fact; Board read | `faceless-by-design` (+ Board read face) |
| `active_attempts` / `engagement_records` | Firm Health read | `mapped` (read) |
| `constants_packs` | Config libraries Publish | check on trial |
| `escrow_acceptances` | Commercial | `deferred` |
| Meta campaign go-live | Acquisition | `deferred` |

---

## Trial rule (no invented tests)

For each `mapped` row: operate the named control; assert **that** modular field on the table. Cascade/UI copy alone never counts.
