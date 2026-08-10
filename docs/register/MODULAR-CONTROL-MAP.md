# Modular → control map

**Law:** Everything non-fixed in the tables is modular. Left = modular item. Right = the control that modulates **that** item. No map = not done. Map to a control that does not change that value = **false map**.

**Loop:** map → create missing controls where they belong → connect → put each pair on trial (operate control → table holds that value).

**Source of modular set:** [`system-map/FROZEN-TABLES-v1.md`](./system-map/FROZEN-TABLES-v1.md) + [`system-map/MODULARITY-REPORT.md`](./system-map/MODULARITY-REPORT.md).

**Status key:** `mapped` · `false-map` · `missing-control` · `faceless-by-design` · `deferred` · `trial-pass` · `trial-fail`

**Trial script:** `npx tsx scripts/verify-modular-surfaces.ts` (stand-in API = same writes the surfaces call).

---

## Non-modular (not left-side work)

| Wall | Reason |
|------|--------|
| `wall.hard_gates` | hard-gate |
| `wall.must_nots` | must-not |
| `wall.click_budget` | immutable-wall |
| `wall.approach_scope` | immutable-wall |
| `wall.repeat_compression` | named-silence |

---

## Opening gap (closed)

| Modular (left) | Control (right) | Was → Now |
|----------------|-----------------|-----------|
| `reference_versions.payload.rows[*].value` | Reference data → **Reference row value** + **Publish version** | false-map (seed re-send) → **`trial-pass`** |

---

## Map (operator / CT product face — Ant primary)

| Modular (left) | Control (right) | Status |
|----------------|-----------------|--------|
| `reference_versions` row / payload / version | Reference data → grid Value + **Publish version** | `trial-pass` |
| `seq_eligibility_pipeline` order | Automations → Settings → **Eligibility pipeline** ↑↓ | `trial-pass` (was missing-control) |
| `rule_motion_precedence` enable + ord | Evaluation → Motion precedence Switch + ↑↓ | `trial-pass` |
| `rule_eligibility_pathway` enable | Evaluation → Eligibility pathways Switch | `mapped` (same enable API family) |
| `rule_field_class_routing` enable + `set_value` | Evaluation → Field-class inputs | `mapped` |
| `rule_reachability_checks` enable + params | Evaluation → Reachability inputs | `mapped` |
| `rule_attempt_criteria` thresholds / enable | Agents → Settings | `mapped` |
| `seq_channel_ownership_order` order | Agents → Settings reorder | `trial-pass` |
| `seq_phase_order` order | Agents → Settings reorder | `trial-pass` |
| `rule_cohort_scoring` enable / `set_value` | Agents → Settings | `trial-pass` |
| `rule_metrics_thresholds` enable / threshold | Agents → Settings | `trial-pass` |
| Evaluation pin → `constants_packs` | Config libraries → Evaluation **Publish version** | `trial-pass` |
| `campaign_states` | Firm ops Bind posture | `trial-pass` |
| `workflow` / `workflow_state` draft→active | Automations **Launch** / Bind Active | `mapped` |
| `workflow_run` / action walk | Automations Launch + Runs tab | `mapped` |
| `sequence_template` + `firm_sequence_binding` | **Agents Save** + Firm ops **Bind** (not Config Publish catalog) | `mapped` |
| `enrollment` | Agents Launch / workflow walk / onboarding fire | `mapped` + faceless |
| `contact_records` / `reachability_verdicts` / `sequence_ready` / `audit_runs` | Book → Start Audit / Upload CSV | `mapped` |
| `prepared_workspaces` | Activation & forward-deploy | `mapped` |
| `halt_records` | Board / Founder haltStore | `mapped` |
| `consent_records` | Contact consentSilence | `mapped` |
| `fact_writebacks` / `missing_fact_signals` | Contact forms submit | `mapped` |
| `eligibility_*` / `signals` / `motion_decisions` | Faceless from reference/fact; Board read | `faceless-by-design` |
| `active_attempts` / `engagement_records` | Firm Health read | `mapped` (read) |
| `escrow_acceptances` | Commercial | `deferred` |
| Meta campaign go-live | Acquisition | `deferred` |

---

## Surface gaps closed this pass

1. **`seq_eligibility_pipeline`** — created PUT `/machine/eligibility-pipeline` + Automations Settings ↑↓ (was read-only / missing-control).
2. **`rule_motion_precedence.ord`** — Evaluation Motion list now reorders (enable alone was incomplete modulation).
3. **Reference value** — already closed; kept in trial script.

## Explicit non-gaps

- Config libraries **Publish** for Automations/Agents packs updates the **local bind catalog**; template cells land via **Agents Save**, firm binding via **Bind Active**. Claiming Publish writes `sequence_template` would be a false map.
- Automations Settings “Enrollment summary” is local trigger chrome — not the `enrollment` table (Launch / cascade are the writers).

## Trial rule

Operate the named control; assert **that** modular field. Cascade/UI copy alone never counts.
