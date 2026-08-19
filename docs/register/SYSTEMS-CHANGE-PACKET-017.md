# Systems — change packet 017 (available vs how many times it runs)

**Seat:** Systems Analyst.  
**When:** 2026-08-19 08:10 UTC.  
**What this is:** the grain for every later action. Implementer **only implements**. No analysis.  
**Why:** Founder: along the DAG **all outputs are available**. The **run count** is still the **last** output’s records (n8n). Every firm / one firm / a chip from the left = as many records as that set. Actions are next; this has to be stood up first.  
**Join:** 015 handle (last node **produces** `previousWrites`) · A29 Input tree · Test same walk. **Do not recut 015** into a stack of handles.  
**Flag:** 15:43 untouched.  
**Instructions:** founder only.

---

## Two facts. Do not collapse them.

| Fact | What | Live today |
|------|------|------------|
| **Available** | Every completed node’s writes, this run, canvas order. Input tree / chips. | **Silent.** Walker keeps **one** `previousWrites` (replace). `node_status.writes` already stored per node — unused as a stack. |
| **How many times this node runs** | **Last** output’s **record count**. Not once per everything in the tree. | Partial: loop `contactIds`. Mixed last output (1 batch + N people) is not named. Chips do not set grain. Get is not a kind. |

Same for Test and Launch.

Get is a **node on the DAG**. It is not a fallback. A19 stays who is enrolled — not this packet.

---

## Last output → record count (hard)

Last node’s writes are still **every table that run touched** (015). That list is mixed. **Count** is not `writes.length`.

| Last handle | Record count `N` | Next person-verb (tag, enroll, If on a person field) | Next set-verb (Audit, Get) |
|-------------|------------------|-----------------------------------------------------|----------------------------|
| Any writes with `contact_id` | Unique those `contact_id`s | **N times** (loop) | **Once**, over those N people |
| Only artifacts (`import_batch`, `audit_runs`, `ct_firms`, …) | **1** | Once, if it can; else it has no people | Once, on that artifact |

Do **not** run Audit N times because N people were on the handle. One `executeAuditRun` for the set. Do **not** run Tag once for the whole set when N people are on the handle.

**Chip from the left into a box:** `N` = records of **that** mapped write-set, not the whole last handle and not the whole tree.

- Chip `contact_records` / a person field → those people.
- Chip whole `import_batch` → 1 (the batch). Next Get/Audit **picks** people from that batch if the verb needs people (`contactsForAudit` already does).
- Chip top-level prior **node** → that node’s write-set, then the same person-vs-artifact rule.

No chip → last output’s `N` as the table above.

Every firm / Select firm (Get Parameters, Local): `N` = every firm this graph may hear, or that one firm’s children. **Not live.** Same rule when those nodes exist: the **set you specified** is the record set. Do not use A19 as this.

---

## Walker (no new table)

On `WalkContext`:

```ts
previousWrites: RunWrite[];                 // LAST node only. Cardinality default. 015.
chainWrites: Record<string, RunWrite[]>;    // nodeId → that node’s writes. Input / chips.
```

After each node succeeds: `chainWrites[nodeId] = writes` (same list you already put on `node_status`). **Replace** `previousWrites` with that list (015). Do not replace `chainWrites`.

If: still pass-through of `previousWrites` for children. Also keep `chainWrites` (If invents no writes). Person-split still splits `contactIds` / person records; `N` on then/else is that split.

Empty `contactIds` → `sequence_ready LIMIT 50` is **not** this grain. Stop using it when the last handle has records. If the last handle is empty, `N = 0`. Honest empty. Do not guess the book.

**Chips** persist on the node’s graph `data` (pointers: `fromNodeId`, `table`, optional field). Not a mapping table. Walker: if present, `N` from `chainWrites[fromNodeId]` (or last if `fromNodeId` omitted) filtered to that table. Same as pick, visible.

---

## Input (A29)

Tree = `chainWrites` in canvas order, writes nested under each node. Fields and values from those rows (Test/Launch). Drag any row including top-level. **Available ≠ N.**

Trigger Input may be empty (start of chain). Trigger Output **is** the first last-handle.

---

## Files

| File | Why |
|------|-----|
| `server/wire-service/workflowWalk.ts` | `chainWrites`; cardinality rule; drop LIMIT 50 as the grain; chip pointers |
| Ant Input (A29) | Render `chainWrites` / `node_status`, not last-only |
| Action nodes (this cut’s consumers) | Person-verb loops `N`; set-verb once over the set |

No SQL. 016 stays the event Test contract. This is the walk.

`npm run build`. Manual: import → Audit → Tag. Input on Tag shows **import + audit** writes. Tag still runs **once per person on Audit’s last handle**, not once per write in the tree. Chip a single contact from the left → Tag once.

---

## What this is not

- Not overwriting 15:43.
- Not recutting 015’s last-node **produce**.
- Not Get as trigger substitute.
- Not A19 on the trigger.
- Not N Audit runs for N people.
- Not `LIMIT 50`.
- Not a new table.
