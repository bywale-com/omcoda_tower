# Systems — Test fill + Input look (A29 · A30)

**Seat:** Systems Analyst.  
**When:** 2026-08-18 23:10 UTC.  
**What this is:** plays for [`TEST-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/TEST-PACKET.md) and [`INPUT-LOOK-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/INPUT-LOOK-PACKET.md). How values get into Input/Output. **No new tables. Do not recut 015.** Flag **15:43**.  
**Look:** A29 supersedes A23 left. **A30 is only Save · Test · Launch.** Filling is this file, not another PNG.

AI does **not** generate values.

---

## Founder thesis (locked)

You do **not** need independently sourced values on every node.

The chain is already the machine: previous Output **is** the next Input (015 handle). A node does not invent a second write-set and live on it. It **picks** from what came in, then its Output is what **that module** would write from that Input.

The only place you **source** values is **Trigger Output**. Test walks the same DAG as Launch. It is not a different machine.

Get is **a node on that DAG**. It is not a fallback when the trigger is “empty.” If the trigger fired, there was a write — that write **is** the event. Get’s Input is that handle (chip into Firm, etc.). Get’s Output is the records it **reads**. Same then-this as Audit.

**Retracted (23:07):** “if the trigger wrote no people, Get / Direct Input is the seed.” Wrong. That treated Get as a substitute for the trigger. It is not. Why would a trigger fire with no data? An event is a write. Schedule / silent pack-update does not make Get the source. If those are on the canvas, the trigger still has an Output; Get still consumes it.

Downstream Output (Audit / Rule / Tag / If / Get) is **from that Input**, uncommitted. You do not fill those nodes with their own specimen lists.

---

## How Test gets the values (the system — not a hardcoded list)

Most Automations work from here is **a new event as a trigger**, not a new node kind. An event **is** the writes. If we connected it, we already know those tables. Therefore we already know what Test data **is**. We never add a trigger without that. We never paint fields in Ant.

**Viable.** Not a second primitive. Not an `events` table. Not AI.

| Law | What |
|-----|------|
| **Connect-time** | When SA names an `event_name`, the packet **names the write-set** (which tables that fire INSERTs/UPDATEs). That list **is** the Test shape. If we cannot name it, the event is **silent** — it does not go on A26. Pack-update today: silent. |
| **Source of truth** | The **handler** that already dispatches (`handleContactImport` → `writes`, `executeAuditRun` → `writes`). Test calls that path with **`commit: false`**, or loads rows those pointers name. When the module grows a write, Test grows. The client does **not** keep a field list. |
| **Fields** | Columns of those tables (Postgres already has them). Not `COLLECTIBLE_FIELDS`. Not A24 copied into React. |
| **Values, door 1** | An instance of that event already exists → load those rows (`import_batch` id + its `contact_records`). Pick which if many (Local cousin). |
| **Values, door 2** | No instance yet → same **fields**, specimen/empty values of those columns. Still that write-set. Last similar event, if it exists, is door 1 — you left door 2. |
| **Then-this** | Only Trigger Output is sourced this way. Every later node: Input = that handle; Output = **that** module on it, uncommitted. Get included. |

Do **not** mint `event_write_set` / a test-rows table. That would copy the handler and drift. The systems job when a new event lands: dispatch + `writes[]` + this named set in the packet. Test has nothing else to invent.

**Incomplete today:** `contact.created` is on the picker and does not dispatch. Pack-update is on the picker with no write-set. Those are **not** Test-ready. Do not stub them in the client.

---

## Test — A. Door 1: the write already exists

No new store. Read the row.

| Already there | What Test reads | Not this |
|---------------|-----------------|----------|
| Book | `contact_records` | Enrollment (Agents mission) |
| Past import | `import_batch` + contacts with that `import_batch_id` | Hub `lastOutput` demo pull |
| Past form | `fact_writebacks` (`form_ref`) | A18 leftover box |
| Past audit | `audit_runs` + verdicts / `sequence_ready` for that run | Guess “latest audit for this firm” |
| Past walk | `workflow_run.node_status.writes` (pointers) then load those rows | An events copy table |
| Get | `SELECT` at the grain **this Get node** authored, using the **previous handle** (chips). Records that already exist. | INSERT. A fallback for the trigger. Audit as people-pump |

Pick which instance if many — **cousin of Local**, not a third grain kit on A30. Honest empty if none.

Test of Get = this door. A read is not Launch.

---

## Test — B. Door 2: the write does not exist yet

Must **not INSERT**. Must **not enroll / send**.

**Trigger never fired:** same write-set as connect-time (above). Contact import = `import_batch` + `contact_records`. Not a toy list. Not extra fields. Shape from the **handler**, not from a PNG.

Where specimen **values** come from (still not AI):

| Prefer | What |
|--------|------|
| Last similar event exists | Door 1. Pick that instance. You are not in door 2. |
| None exists | Project **shape** from the module (columns the handler writes). Values may be empty or labeled specimen of those columns. Operator can see it is not a commit. |

**Later nodes, door 2 Output:** do **not** author a second specimen. Run the module as a **function of Input**, skip persist.

| Module | Project honestly? | Silent |
|--------|-------------------|--------|
| Contact import (trigger) | Yes — batch + contact columns | |
| New contact (trigger) | Yes — `contact_records` columns | Dispatch of `contact.created` still silent live; Test shape is still that row |
| **`executeAuditRun`** | **Yes** — verdict / ready are a function of email+phone. Return `writes` **without** INSERT (or insert in a transaction and roll back — prefer **no write**). Do not fake a score. Do not skip projection. | |
| `ascribe_tag` | Yes — tag string is authored; notes from projected verdict | |
| If | No writes. Pass-through handle. Pick still runs on projected fields | |
| Rule | **Partial.** Stub today `pass: true`. Do not paint lattice chips as if evaluated. `missing_fact_signals` only if the evaluator actually would emit them. Else Output honest-empty / silent | Do not mint a results table |
| Get | Yes as a **read from Input** (door 1 on the records it points at). Not a second specimen. | Not a trigger substitute |
| Pack-update trigger | **Silent** (no write-set) | Do not freeze `reference_versions` |
| `call_agent` | Do not enroll on Test | Silent as live send |

Chain: Trigger Output fills first → next Input = that handle → that Output = what **it** would write from that Input → repeat. Never “latest audit in the firm.”

Launch = live walk (015). Test does not recut it. Test may share the same functions with `commit: false`.

---

## Input look — A. Where a mapped chip already lives

Chips are **references** to a write (or a field of a write) already on the handle. Not a mapping table. Not `{{firm}}`.

| Already | What a box holds | Ant |
|---------|------------------|-----|
| 015 handle | `{ table, id, contact_id? }` | Live walk uses `pickTable` / `pickField` on node `data`. `previousResultFrom` saved, **unread** |
| Graph jsonb | `pickTable`, `pickField`, Get Firm box, If pick, action pick | Silent as **chip element** (A29). A23 lightning-on-text is dead |
| Hub `lastOutput` → `lastInput` | Smell of the handle | Wrong data. Not the store |
| `cells` jsonb | Sequence composers | Not Automations Input |

Persist a chip as: which prior **node**, which **write** (`table`+`id` or whole table class), optional **field**. Same as pick, visible. Several chips in one box = several pointers. No new table.

---

## Input look — B. Top-level drag vs a leaf

Same handle. Coarser pick.

| Drag | What it is | Next node uses |
|------|------------|----------------|
| Whole **Contact import** (top-level) | That node’s entire write-set | Pick any of those writes |
| Whole `import_batch` | All batch rows this run | Audit’s usual pick |
| Leaf `firm` / `import_batch.firm` | One field of a write | Fills a Get/Local box |
| Leaf `contact_records.email` | One field on person writes | If / Outcomes |

Do not invent a mapping table. Do not freeze extra import fields. Write-set = what that node wrote (A24 for import).

---

## Engineer pickup

1. A29 look on **every** Input. Get Parameters stay Get-only.
2. Test button: Save · Test · Launch. No Test tab. No commit.
3. Source values **once**, on **Trigger Output**, from that event’s **connected write-set** (handler `writes`, table columns). No trigger ships without that. Test walks the **same DAG** as Launch. Get is a node on that DAG, not a fallback.
4. Door 1 = pick an existing instance of **that event**. Door 2 = specimen of those same columns if none has fired. Not AI. Not a field list in Ant.
5. Every later node (including Get): Input = previous Output. Output = what **that** node does with it, uncommitted.
6. Audit Test = `executeAuditRun` without persist. Rule Test does not fake an evaluation we cannot run.
7. Chips = pointers into the handle. Graph `data`, not a table.

**Do not:** recut 015; mint a test/results/mapping table; collapse door 1 and 2; generate values with a model; treat Get as the trigger’s substitute; overwrite 15:43.
