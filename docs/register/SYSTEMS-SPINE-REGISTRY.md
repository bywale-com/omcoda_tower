# Systems — Spine Registry

**Seat:** Systems Analyst.  
**When:** 2026-08-24 18:15 UTC.  
**What this is:** the trigger list for **verify before stacking**. Not an inventory. Not an Engineer cut.  
**Why:** Change-severity ladder: 5 of 6 later recuts were additive (earlier tables stayed standing). The one spine-class event was **004 → 010**. Verification-before-stacking runs on **structural** contracts only. Additive stays in ordinary change management (next numbered packet; old contract keeps its job).  
**Flag:** 15:43 untouched. Do not recut 015 from this file.

---

## How to use this

A packet **touches Spine** when it remaps, drops, or changes the *meaning* of an object below (CHECK / UNIQUE / identity / core state / dispatch / handle) — not when it adds a column or table *alongside* and the promise still holds.

| If the packet… | Do this |
|----------------|---------|
| Touches a **Spine** object | Run that row’s **round-trip** first. Do not stack the next packet until it passes. |
| Only **Additive** | Existing change management. Next number. Do not mutate a numbered packet in place. |

**Additive (one line, not a list):** new table, new field, new door, new event_name row, `mappedSlots`, `collectible_fields`, `event_write_set` / `event_test_data`, `contact_access_links`, `workspace_opted_out`, `pursuit_state`, If/Switch kinds. Old contract keeps its job. Covered.

---

## Spine

### 1. Sequence ⊃ campaign

**Object:** `sequence_template` (`sequence_class` CHECK `optin` \| `reengagement` \| `reactivation`; `firm_id` NULL = platform) · `campaign` (`sequence_id`, `ord`) · `campaign_objective` (`UNIQUE (campaign_id)`; `kind` `click` \| `form` \| `meeting`; `completion_table`) · `firm_sequence_binding` (bind a **sequence**, not a class; unique **default** per `(firm_id, sequence_class)` only).

**Promises:** Agent = sequence. Campaigns are children, ordered. One objective per campaign. Class is not a sequence. Binding is `template_id`. Next campaign = next `ord` when **this** campaign’s objective is met — not a qualify FK.

**If incomplete:** A14 assign, enrollment cursor, 021 form occupancy, 022 met, Automations Call agent all inherit the wrong grain (class-as-sequence, `launch_day` as sibling, one binding per class). That is 004 → 010.

**Round-trip:** Two `optin` sequences on one firm both persist. Bind and Call **sequence_id** `tpl.A`, not class `optin`. Enroll → `enrollment.sequence_id = tpl.A`, `campaign_id` = that sequence’s `ord` 0. A second firm default for `optin` does not delete the first sequence. `launch_day` is a **campaign name**, not a class row.

---

### 2. Enrolled + cursor

**Object:** `enrollment` · `sequence_id` FK → `sequence_template` · `campaign_id` FK → `campaign` (cursor). Index `(firm_id, contact_id)`.

**Promises:** Enrolled = this row. Cursor = `campaign_id` (NULL only before first place / after last campaign). Advance = next `ord` on the **same** `sequence_id`. Halt is per `enrollment.firm_id`. Packets stack 022/023/024 token on this cursor, not on class.

**If incomplete:** Tick advances the wrong campaign or a class sibling. Seat `/c/` stamps the wrong `campaign_id`. Exhaustion (023) cannot tell “stop spending, still listening on **this** objective.”

**Round-trip:** Enroll contact C on sequence S. Row: `sequence_id=S`, `campaign_id=S.ord0`. Met on that campaign → `campaign_id` becomes `S.ord1` (same `enrollment.id`). Last campaign met → `campaign_id` NULL. Do **not** INSERT a second enrollment to move the cursor. Halt on C’s firm blocks a **new** enroll; it does not delete this row.

---

### 3. Action kinds

**Object:** `action.type` (widened past `call_agent`) · `action.agent_ref` **nullable** · CHECK `type <> 'call_agent' OR agent_ref IS NOT NULL`.

**Promises:** In-app kinds (`ascribe_tag`, `run_audit`, …) persist without a sequence. `call_agent` **is** enroll into `agent_ref` = `sequence_template.id`. Walker runs the type; it does not enroll because an action node exists.

**If incomplete:** Tag/Audit Save dies on NOT NULL `agent_ref`. Or every action enrolls. 018/A35 and Get-as-node inherit that.

**Round-trip:** Save `ascribe_tag` with `agent_ref` NULL → row exists → walk writes `contact_tag`, **zero** new `enrollment`. Save `call_agent` with `agent_ref` = a live `sequence_template.id` → walk INSERTs `enrollment` for that sequence. `call_agent` with NULL `agent_ref` **refused** by CHECK.

---

### 4. Dispatch (event = the write · house · grain)

**Object:** `workflow_trigger` (`event_name`, `firm_id` NULL = house, `grain` `global` \| `local`, `local_ref`, `local_firm_id`, `local_contact_ids`) · `workflow.firm_id` NULL = house · `dispatchEventToWorkflows` + `localAxesMatch`. Law: the INSERT **is** the event. No copy table.

**Promises:** A named trigger wakes because **that write** happened. House hears every firm (`t.firm_id=$1 OR t.firm_id IS NULL`). Global = every permutation. Local = only specified axes; **unspecified axis = every of that class** (012 CHECK `grain=global OR local_ref NOT NULL` is **dropped** — 016). Audience (`workflow.audience_*`) is who is enrolled, **not** Grain.

**If incomplete:** Automations miss writes or fire on the wrong instance. Local-without-instance is illegal again (012). House graphs never wake. Later event_names (024 `contact_uploaded`, 022 `objective_met`) stack on a matcher that still forces a ref.

**Round-trip:** INSERT the designated row (e.g. `fact_writebacks`) → `dispatchEventToWorkflows` with that `event_name` → active graph with matching `event_name` walks; a graph on a different name does not. House trigger (`firm_id` NULL) wakes on firm B’s write. Local, `local_firm_id=B`, `local_ref` NULL → fires for every instance at B, **CHECK allows the row**. Local `local_ref=this-form` → other forms at B do not wake it. Do not INSERT a second “event happened” row.

---

### 5. Walk handle

**Object:** `WalkContext.previousWrites` `{ table, id, contact_id? }[]` · persist `workflow_run.node_status.writes`. **015:** last **writer** replaces the handle. If/Switch pass-through. **017 `chainWrites` is Additive** (alongside; does not replace 015).

**Promises:** After a node, the next node’s last-handle is **that node’s writes** (or pass-through). Same pointers the desk would have written. Not Hub preview JSON. Not a stack in `previousWrites`.

**If incomplete:** 017/019/021/027 chips and `N` silently read the wrong set. Recutting 015 into a stack is the failure mode this registry exists to stop.

**Round-trip:** Import node writes `import_batch` + N `contact_records`. Next Audit’s `previousWrites` is **those** pointers (not a canned three-name list). A later Tag’s `previousWrites` is **Audit’s** writes, not the import. If does not replace the handle. `node_status` for the import still has the import writes after Audit ran (`chainWrites` / `node_status`, not `previousWrites`). Empty last handle → `N = 0`. No `LIMIT 50` book guess.

---

### 6. Objective met

**Object:** `campaign_objective.completion_table` · live matcher `campaignObjectiveMet` · completion writes `meeting_booked` · `fact_writebacks` · `messaging_events` (via send). 022 (not landed): instance axis `campaign_objective_id` / `form_ref` on those writes.

**Promises:** Met = **this** campaign’s objective completed, then cursor advances. Completions are the named writes (010). Packets that stack (023 exhaustion, seat Now, flagship “once met, met”) trust that “any row in the table” is **not** the contract.

**If incomplete:** Any past meeting/form/click completes every later campaign (live matcher today: `SELECT 1 … firm_id AND contact_id LIMIT 1`). 023 “keep listening” and escrow nullify have nothing honest to listen to.

**Round-trip (must pass before stacking on met):** Person has an old `meeting_booked`. New campaign objective `kind=meeting` on a **new** `campaign_id`. Tick must **not** advance. Book a meeting stamped to **that** `campaign_objective_id` (022) → advance **that** enrollment’s cursor only. Form: `fact_writebacks` without this objective’s axis does not complete it. **This round-trip fails on `origin/main` until 022 lands.** Do not cut 023 as if it passed.

---

### 7. Send halt (“opted out” for outbound)

**Object:** `consent_records.silenced` · `halt_records` (`scope` `contact` \| `firm-book`). `dispatchSend` / H1.

**Promises:** `silenced` = do not send. Halt = do not **new**-enroll (in-flight attempts continue). Workspace foot is **not** this contract (`workspace_opted_out` is Additive — 026).

**If incomplete:** Foot opt-out stops email, or email unsubscribe leaves the seat, or Contact ▾ is “opted in.” Downstream 024/025/C16 inherit the glue 026 had to split.

**Round-trip:** Foot workspace opt-out → `workspace_opted_out=true`, `silenced` **unchanged** → probe send **still accepted**. `handleConsentSilence` / `silenced=true` → send denied, seat still exists until foot. Halt contact → new enroll skipped; open `active_attempts` still tick.

---

## What this registry does not do

- Recut 015, 019, 021, or 026.
- Put Get modules, Rule packs, or Operator panes on the Spine list (Additive or 020).
- Mint an events table.
- Overwrite 15:43.
