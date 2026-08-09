# System Map v3 — templates, firm binding, guidelines corpus, reconciliation

**Build:** [`BUILD-system-map-v3-templates-and-binding.md`](./BUILD-system-map-v3-templates-and-binding.md)  
**Code:** `src/app/system-map/data/templates.ts`, `corpusSources.ts`, extended `tables.ts` / `nodes.ts`  
**UI:** `/system-map` → **Templates / binding**

## A. Corpus source set (permanent)

`guidelines/` is now in the corpus (`src/app/system-map/data/corpusSources.ts`):

- `guidelines/Reactivation.md`
- `guidelines/Activity.md`
- `guidelines/Guidelines.md`

plus Seed, World, Systems Story, filled Requirements, Operator-Revisions.

## B. Template / binding model

| Layer | What it is | Where |
|---|---|---|
| `sequence_template` | Reorderable shapes; content cells **templated** (`{firm_name}`, logos, copy…); multiple variants per class | `SEQUENCE_TEMPLATES` |
| `firm_sequence_binding` | **Missing table added** — `{firm_id, class, template_id, overrides}` | `FIRM_SEQUENCE_BINDINGS` + `bind.firm_sequence` |
| Resolved instance | Runtime reads binding → resolves template → runs | `resolveFirmSequence` / `resolveSequenceForFirm` |

Classes in map: **optin_launch**, **launch_day**, **reengagement**, **reactivation**.

Level-1 variation = reorder cells on the template. Level-2 = change binding row for a firm. No forking.

## C. Resolved decisions (built)

| Decision | Disposition |
|---|---|
| Opt-in launch calendar | `seq.optin_launch_calendar` + `tpl.optin_launch.v1` (templated) |
| Launch day sequence | `seq.launch_day_sequence` + `tpl.launch_day.v1` |
| Reactivation calendar | `seq.reactivation_calendar` + `tpl.reactivation.v1` (core) |
| Repeat-compression | **named-silent** — `wall.repeat_compression` |
| No-login client eligibility view | **Deferred** — existence check: **not found** as shipped client surface (`NO_LOGIN_CLIENT_VIEW_CHECK`); Day0 email holds `no_login_client_view_link` **slot only** |
| SMS non-reply | `acr-sms-nonreply` on `rule.attempt_criteria` → proceed to email; low tier-signal; no second text |
| Cohort scoring | `state.cohort_tier` + `rule.cohort_scoring` |
| Metrics thresholds | `state.metrics_flag` + `rule.metrics_thresholds` |
| Waitlist | value on `state.consent_state`: `unsequenced\|waitlisted\|sequenced\|silenced` |

## D. Controls ↔ tables

Declared as required component-pass output: [`CONTROLS-TABLES-RECONCILIATION.md`](./CONTROLS-TABLES-RECONCILIATION.md). Gap lists: `control-without-table`, `table-without-face`. Not built in this pass.

## Counts (re-run after v3)

See live `/system-map` Tables / audit and `modularityReport()` — expect higher table count than v2 (new calendars, binding, cohort, metrics, walls).

## How to verify

1. `/system-map` → Templates / binding — see `tpl.reactivation.v1` cells + `firm.demo` bindings
2. Resolve instance for `firm.demo` / `reactivation` — cells show bound variables + deferred `no_login_client_view_link` slot
3. Tables audit includes `seq.optin_launch_calendar`, `bind.firm_sequence`, `rule.cohort_scoring`, `acr-sms-nonreply`
4. Modularity bugs still **0**
