# Modular → control map

**Law:** Everything non-fixed in the tables is modular. Left = modular item. Right = the control that modulates **that** item. No map = not done. Map to a control that does not change that value = **false map**.

**Loop:** map → create missing controls where they belong → connect → put each pair on trial (operate control → table holds that value).

**Source of modular set:** [`system-map/FROZEN-TABLES-v1.md`](./system-map/FROZEN-TABLES-v1.md) + [`system-map/MODULARITY-REPORT.md`](./system-map/MODULARITY-REPORT.md).

**Trial script:** `npx tsx scripts/verify-modular-surfaces.ts` — same APIs the CT surfaces call; read-back must hold the mutated value.

**Status key:** `trial-pass` · `faceless-by-design` · `deferred`

---

## Non-modular (walls — not left-side work)

| Wall | Reason |
|------|--------|
| `wall.hard_gates` | hard-gate |
| `wall.must_nots` | must-not |
| `wall.click_budget` | immutable-wall |
| `wall.approach_scope` | immutable-wall |
| `wall.repeat_compression` | named-silence |

---

## Map (closed left→right — Ant primary)

| Modular (left) | Control (right) | Status |
|----------------|-----------------|--------|
| `reference_versions.payload.rows[*].value` | Reference data → Value + **Publish version** | `trial-pass` |
| `seq_eligibility_pipeline` order | Automations → Settings ↑↓ | `trial-pass` |
| `rule_motion_precedence` enable + ord | Evaluation → Motion Switch + ↑↓ | `trial-pass` |
| `rule_eligibility_pathway` enable | Evaluation → Pathways Switch | `trial-pass` |
| `rule_field_class_routing` enable + `set_value` | Evaluation → Field-class | `trial-pass` |
| `rule_reachability_checks` enable + `set_value` | Evaluation → Reachability | `trial-pass` |
| `rule_attempt_criteria` enable + threshold | Agents → Settings | `trial-pass` |
| `seq_channel_ownership_order` order | Agents → Settings ↑↓ | `trial-pass` |
| `seq_phase_order` order | Agents → Settings ↑↓ | `trial-pass` |
| `rule_cohort_scoring` enable / `set_value` | Agents → Settings | `trial-pass` |
| `rule_metrics_thresholds` enable / threshold | Agents → Settings | `trial-pass` |
| Evaluation pin → `constants_packs` | Config → Evaluation **Publish** | `trial-pass` |
| `campaign_states` | Firm ops Bind posture | `trial-pass` |
| `workflow` / `workflow_state` draft→active | Automations **Launch** / Bind Active | `trial-pass` |
| `workflow_run` | Automations Launch → `startRun` | `trial-pass` |
| `sequence_template` cells | Agents **Save** | `trial-pass` |
| `firm_sequence_binding` | Agents Save / Bind **Active** | `trial-pass` |
| `enrollment` | Agents **Launch agent** | `trial-pass` |
| `audit_runs` + `contact_records` + `reachability_verdicts` + `sequence_ready` | Book → Start Audit / Upload | `trial-pass` |
| `prepared_workspaces` | Activation & forward-deploy | `trial-pass` |
| `halt_records` | Board / Founder haltStore | `trial-pass` |
| `consent_records` | Contact consentSilence | `trial-pass` |
| `fact_writebacks` / `missing_fact_signals` | Contact form fields + Submit (editable values) | `trial-pass` |
| `eligibility_*` / `signals` / `motion_decisions` | Faceless from reference/fact; Board read | `faceless-by-design` |
| `active_attempts` / `engagement_records` | Firm Health read | `trial-pass` (read) |
| `escrow_acceptances` | Commercial | `deferred` |
| Meta campaign go-live | Acquisition | `deferred` |

---

## False maps closed this pass

1. Reference Publish re-sent seeds → grid edits persist.
2. `seq_eligibility_pipeline` read-only → reorder API + Settings ↑↓.
3. Motion enable-only → ord reorder.
4. Contact form write-backs used hard-coded readOnly values → fields editable; Submit writes edited values.
5. Book audit stand-in now persists the four tables for read-back trial.

## Explicit non-gaps (do not false-map)

- Config **Publish** Automations/Agents packs → local bind catalog only; templates via **Agents Save**.
- Bind packs modal OK → local pack ids; wire bind via **Active** / Agents Save.
- Automations Settings “Enrollment summary” → local trigger chrome, not `enrollment` rows.
- Firm Health “Engagement health” metrics table → synthetic; real `engagement_records` is the records strip.

## Closed when

No modular (non-wall, non-deferred, non-faceless) left item remains `mapped` / `false-map` / `missing-control`. **Current: closed.** `verify-modular-surfaces.ts` green.
