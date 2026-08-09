# RECONCILIATION v1 — button-first (Automations · Agents · Board · Audit)

**One pass. Four modules only. Then frozen list is final.**

## Method

For each button: app-local → ignore; system write → name object → exhaust transitions → table exists?

---

## Automations

| Control | Object | Transition | Table |
|---|---|---|---|
| New / Add automation | `workflow` | ∅ → draft | ✅ `workflow` + `workflow_state=draft` (**new**) |
| Save | `workflow` | graph/name patch | ✅ `workflow` |
| **Activate** (Launch → status active) | `workflow_state` | draft → **active** | ✅ `workflow_state` (**new** — proof button) |
| Pause | `workflow_state` | active → paused | ✅ `workflow_state` |
| Run manually | `workflow_run` | start → running → done | ✅ `workflow_run` (**new**) |
| Action enroll / call_agent | `action` → `enrollment` | determination → enroll | ✅ `action`, `enrollment` (**new**) |
| Event trigger eligibility.changed | faceless | reference/fact → eval | ✅ faceless (no button) |

🔴 `control-without-table` appended: `workflow`, `workflow_state`, `workflow_target`, `workflow_run`, `action`, `enrollment` (Phase 0).

`missing-control`: explicit **Activate** label (UI says Launch; maps to draft→active). Faceless reference change — fine.

---

## Agents

| Control | Object | Transition | Table |
|---|---|---|---|
| New template / Save | `sequence_template` | draft cells | ✅ `sequence_template` |
| Publish / bind firm | `firm_sequence_binding` | firm → template | ✅ `firm_sequence_binding` |
| Launch agent | `enrollment` + `active_attempts` | enroll → attempt | ✅ `enrollment`, `active_attempts` |
| Add contacts | `enrollment` | contact → sequence | ✅ `enrollment` |

🔴 none beyond templates/bindings already frozen.  
`missing-control`: wired Launch on hub was stub — Phase 3 wires.

---

## Board

| Control | Object | Transition | Table |
|---|---|---|---|
| Halt / Confirm halt | halt record | active → halted | ✅ `halt_records` (already-in-Postgres) |
| Lift / Resume | halt record | halted → lifted | ✅ `halt_records` |

🔴 system-map twin `state.halt` not added (PG exists; twin → V2-BACKLOG).  
App-local: client row selection, filters — ignore.

---

## Audit

| Control | Object | Transition | Table |
|---|---|---|---|
| Run audit | `audit_runs` | ∅ → running → complete | ✅ `audit_runs` (**appended**) |
| Check toggles | `rule_reachability_checks` | which checks enabled | ✅ `rule_reachability_checks` |
| Verdicts written | `reachability_verdicts` / `sequence_ready` | check → verdict | ✅ both (**new**) |

🔴 `audit_runs` appended to frozen list.  
`missing-control`: Import mutate living list still named-silent (Seed) — V2.

---

## Summary

| ✅ Mapped | 🔴 Appended missing tables | missing-control notes |
|---|---|---|
| Halt/Lift → halt_records; Activate → workflow_state; templates/bindings; reachability rules | automations six + audit_runs | Hub Launch label; Import→book incomplete |

**Frozen list closed.** See [`FROZEN-TABLES-v1.md`](./FROZEN-TABLES-v1.md).
