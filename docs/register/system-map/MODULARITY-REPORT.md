# System Map v2 — table inventory + modularity audit

**Law:** Anything that should be modifiable must be a table (state | rule | sequence). Frozen without a structural reason = `frozen-should-be-table` bug.

**Code source of truth:** `src/app/system-map/data/tables.ts` (+ v3 `templates.ts`, `corpusSources.ts`)  
**Build instruction:** v2 [`BUILD-system-map-v2-table-inventory.md`](./BUILD-system-map-v2-table-inventory.md) → v3 [`BUILD-system-map-v3-templates-and-binding.md`](./BUILD-system-map-v3-templates-and-binding.md)  
**v3 report:** [`V3-REPORT.md`](./V3-REPORT.md) · reconciliation: [`CONTROLS-TABLES-RECONCILIATION.md`](./CONTROLS-TABLES-RECONCILIATION.md)

## Summary

| Metric | Value |
|---|---|
| Tables | **53** (`MACHINE_TABLES`) |
| Kinds | **40** state · **9** rule · **4** sequence |
| Relations | **39** (reads / writes / triggers) |
| Worked example | `seq.channel_ownership_order` = `["text","email","form"]` — reorderable; sim reads the list, not prose |
| `frozen-should-be-table` bugs | **0** — non-modular entries all carry hard-gate / must-not / immutable-wall |

## Sequence tables (reorderable)

| Table | Node | Default order |
|---|---|---|
| `seq.channel_ownership_order` | `active_attempt` | text → email → form |
| `seq.content_order` | `content_order` | optin → nudge → reactivation |
| `seq.phase_order` | `phase_state` | optin → reengagement → reactivation |
| `seq.eligibility_pipeline` | `eligibility_evaluation` | trigger → constants → conditions → rules → output |

## Rule tables (rows: when + condition → write)

| Table | Node | What rows hold |
|---|---|---|
| `rule.attempt_criteria` | `active_attempt` | 30 min / 24 h / 24 h + local retry + inbound + form-submit |
| `rule.motion_precedence` | `motion_decision` | Engine 2 ladder (5 rows, toggleable / reorderable) |
| `rule.field_class_routing` | `field_class_routing` | self / document / employer routes |
| `rule.reachability_checks` | `reachability_verdict` | full audit check set |
| `rule.eligibility_pathway` | `eligibility_evaluation` | any-pathway pass |

## Non-modular (stated structural reasons — not bugs)

| Table | Reason |
|---|---|
| `wall.hard_gates` | **hard-gate** — Seed §9 / World §4 human gates |
| `wall.must_nots` | **must-not** — Seed/World immutable constraints |
| `wall.click_budget` | **immutable-wall** — one-click until finding |
| `wall.approach_scope` | **immutable-wall** — Approach = Consultant only |

## Runtime

`simulateCascadeFromTables` in `src/app/system-map/sim/engine.ts` is **content-free**: it fires a trigger, walks `TABLE_RELATIONS` (reads / writes / triggers), and applies **enabled** rule rows. Channel ladder interior is built from `seq.channel_ownership_order` + `rule.attempt_criteria` — reorder or change thresholds and the cascade/interior re-drives.

## How to verify on `/system-map`

1. Open **Tables** panel — confirm channel order list.
2. Reorder channels (e.g. Email first) → open `active_attempt` interior → ladder follows new order.
3. Toggle a motion-precedence row off → fire reference cascade → applied rule ids skip disabled row.
4. Change 30 → 15 on attempt criteria → ladder edge label updates.
