# Systems — change packet 019 (If + Switch: two kinds, paths are wires)

**Seat:** Systems Analyst.  
**When:** 2026-08-20 11:45 UTC.  
**What this is:** the cut for PM [`IF-SWITCH-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/IF-SWITCH-PACKET.md) (A36–A39, law 46). Implementer **only implements**. No analysis.  
**Why:** Two node kinds. If = two wires (true / false). Switch = N wires + fallback. Interior: True is the mode; craft the argument; anything else is the false wire. Both sides of a compare (and any text box) = chip from the left **or** typed text. Always text.  
**Join:** 015 handle · 017 `chainWrites` / `mappedSlots` / `N` · Input A29 · occupancy A31. Face: `git fetch origin pull/96/head`.  
**Flag:** 15:43 untouched. **Do not recut 015.** No SQL. No compare-type table. No events log.  
**Instructions:** founder only.

---

## What this is / is not

| This | Not this |
|------|----------|
| Two kinds on the graph + walker that follows **labeled wires** | One Condition (If) with Then/Else radios (A16) |
| Compare operands on **graph `data`** (chip pointer or string) | A new PG table for operators / path catalogs |
| If invents **no writes** (pass-through, already) | Recutting 015 into a second handle |
| Switch first-match path, else **fallback** handle | Hub `multi_split` / `delay` as the face |
| Legacy house If (`pickTable` / `pickField` / `pickOp` / `pickValue`) still walks | Freezing live IfPlateModal as the product |

**Name collision (do not mix):** **⋯ Switch** = change this node’s kind (law 38). **Switch** (this packet) = the many-path node.

---

## Live (quote `origin/main` — do not guess)

| Live | Gap |
|------|-----|
| Node type **`branch`**. Palette “Condition (If)”. | No **Switch** kind. |
| Walker `type === "branch"` → `evalIfPick` → `outgoingHandle(..., "true"\|"false")`. Unlabeled edges = all outgoing. | Switch N handles + fallback **silent**. |
| `evalIfPick`: `pickTable` + `pickField` + `pickOp` + `pickValue`. Person-split on `PERSON_WRITE_TABLES`. | Left is a **table-name picker**, not a chip. Right is typed only. |
| `ifThen` / `ifElse` strings saved on the node. | Unread by the walk. A16 radios. **Kill as the fork.** |
| Hub `branchKind`: `if` / `true_false` / `multi_split` / `delay`. Walker non-if kinds return `"true"`. | Do not reuse `multi_split` or `delay` as Switch. |
| `mappedSlots` already resolves chips to `RunWrite[]` (017 / A31). | Compare sides do not use it yet. |

---

## Hard decisions

### 1. No new table

Paths are React Flow **edges**. `sourceHandle` **is** the path. Persist on `workflow.graph` (already JSONB). Do not mint `workflow_path` / `compare_op` / `switch_case`.

### 2. Two kinds on the graph

| Face | Graph `type` | Walker |
|------|----------------|--------|
| **If** | keep live **`branch`** (also accept `if`) | today’s true/false visit |
| **Switch** | **`switch`** (new `WorkflowNodeType`) | N path handles + `fallback` |

Palette + wire **+**: **If** and **Switch** both listed (with Get · Rule · Action · Exit). No Trigger on the wire. If has **no** + Add path.

Legacy `type === "branch"` remains If so the house seed still walks. Do not migrate every old node.

### 3. If — two wires only

Handles: **`true`** · **`false`**. Exactly those.

Interior (A38): **True is the mode.** One argument (compare, plus AND rows). Do **not** configure False in the node. Walker: compare passes → visit `true`; else → visit `false`. Empty argument (neither chip nor text on a required side) → **false**. Honest. Do not guess.

Person-split already exists: if the compare reads a person-write (`contact_records` / `reachability_verdicts` / `sequence_ready` / `contact_tag` / `enrollment`), split `contactIds` onto the two wires (live `evalIfPick.personSplit`). Keep that. If invents no writes: `chainWrites[nodeId] = previousWrites` (already).

Kill Then/Else radios. Stop saving `ifThen` / `ifElse` as the fork. `previousResultFrom` unread — leave unread; do not make it the compare.

### 4. Switch — many wires + fallback

`data.paths`: `{ id, sourceHandle, compare }[]` in canvas order.  
`data.fallbackHandle`: `"fallback"` (unmatched). Fallback is **not** `= fallback`.

**+ Add path** appends a path **and** an edge with that `sourceHandle`. Remove path deletes that edge.

Walker: evaluate paths **in order**. First match → visit that handle. None match → visit `fallback`. If fallback has no edge, stop that branch (honest empty). Do not fall through to unlabeled outgoing (that was If’s old safety).

Person-split: if any path’s compare is a person-write, split people; each person takes **one** path (first match). Set-verb after Switch still 017 (`N` from last handle / chip).

### 5. Compare — both sides chip or text. Always text. No compare table.

Store on the node (If: one compare + `and: Compare[]`. Switch: per path):

```ts
type Operand =
  | { mode: "chip"; slot: string }   // mappedSlots[slot] — 017 pointer
  | { mode: "text"; value: string };

type Compare = { left: Operand; op: "eq" | "neq" | "exists"; right: Operand };
```

**Resolve** to text this run:

- **chip:** `mappedSlotWrites` → `loadWriteField(chip.field)` → `String`. Occupied chip **is** the value (A31). X clears the slot; box accepts type or drop again.
- **text:** the string.
- **exists:** left resolves / non-empty.

`op` default **`eq`** (A39 `=`). AND = every compare in `and` plus the main row.

**Any input box** (Get / Tag / If / Switch) already follows chip-or-type. Do not invent a special compare widget type.

**Legacy If:** if `mappedSlots` left is empty and `pickTable` + `pickField` are set, treat as chip of that table.field on `previousWrites` / `chainWrites`. House `sequence_ready.ready eq false` still walks. New interiors write operands, not the table-name Select as the face.

Do not freeze A39’s example `audit_result`. Left tree = real writes (`sequence_ready`, `reachability_verdicts`, `audit_runs`, …).

### 6. Chrome (silent in the machine)

Kind chip under the title (If orange / Switch amber) — A35 placement. Type glyphs as A35. Close Input / resize (A32). Output tab exists. Teaching “This is not a rule” / Kind · In the application strip — **do not build**.

---

## Walker (no new table, no recut 015)

`workflowWalk.ts`:

- `type === "branch" || type === "if"` → existing true/false visit, compare from operands (legacy pick* fallback).
- `type === "switch"` → path loop + fallback as above.
- `configured === false` → stop (Run packet / PR #105). Do not mark silent success.
- After If/Switch: **do not replace** `previousWrites` with a new list. Pass-through (015 produce stays on the last **writer**).

---

## Files

| File | Why |
|------|-----|
| `server/wire-service/workflowWalk.ts` | If operands; Switch paths + fallback; keep person-split |
| `src/app/data/automationWorkflows.ts` | `WorkflowNodeType` += `"switch"`; palette blocks |
| `src/app/data/automationTriggerSelect.ts` | `WIRE_ADD_KINDS`: If · Switch (not only Condition) |
| `src/app/register/prototype-ant/operator/AntAutomationWorkbench.tsx` | sourceHandles true/false; Switch N + Add path; palette |
| `src/app/register/prototype-ant/operator/automationPlates/IfPlateModal.tsx` | A38: True mode, chip-or-type both sides, AND. Kill radios |
| Switch interior (new or same folder) | A39: one row per path + fallback + Add path |
| `plateChrome.ts` / `canvasOps.ts` | Kind colors. **⋯ Switch** ≠ Switch node |

No migration. `npm run build`. Manual: If two wires; Switch + Add path is a wire; typed **or** chip on both compare sides; house import → If on `sequence_ready` still forks.

---

## What this is not

- Not overwriting 15:43.
- Not recutting 015.
- Not Rule interior conditions (law 26).
- Not mixing ⋯ Switch with the Switch node.
- Not a False form.
- Not notification / login when writes happen (founder: later).
- Not A33. Not recutting 018.
