# Controls ↔ tables reconciliation (required output of the component pass)

**Status:** Declared now so it is not lost. **Do not build components in the System Map pass.**  
**Law source:** System Map v3 §D (`BUILD-system-map-v3-templates-and-binding.md`).

## Two control kinds

| Kind | Changes system-state table? | Owes a table? |
|---|---|---|
| **System control** | Yes — mutates a machine state/rule/sequence table | **Yes** |
| **App control** | No — local/presentational only | **No** (exempt) |

## Two gap lists (both directions)

### 1. Table → face

Every table (state / rule / sequence) must either:

- have a face (a control changes it, or a pane displays it), **or**
- be **faceless-by-design** (has a non-UI / faceless origin).

A table with **no face and no faceless-origin** → bug (`table-without-face` unless intentionally faceless).

Partly covered today by System Map coverage checks on ★ nodes.

### 2. Face → table (critical)

Every **system control** that exists in the UI must land on a table (the state it changes).

**A system control with no backing table means the table is MISSING** — the UI modeled a system change with no machine layer to receive it.

Flag: **`control-without-table`** — each flag is a table that needs to exist.

App controls are exempt.

## Component-pass outputs (required)

When the component / extrusion pass runs, produce:

1. `control-without-table` → missing tables the UI already implies (**create them** on the machine track).
2. `table-without-face` → intentionally faceless, or a missing face (later face work).

Example: per-firm sequence shaping already drawn in Agents/Automations must bind to `sequence_template` + `firm_sequence_binding` — if those controls exist without those tables, they surface here as `control-without-table` (v3 closed that specific gap by adding the binding table).
