# Systems — cut assessment (packets vs PRs #88–#96)

**Seat:** Systems Analyst.  
**When:** 2026-08-18 18:50 UTC.  
**What this is:** thorough ratify of recent packets against what actually merged. Implementer leftovers are named. Do not recut 015. Flag **15:43** untouched.  
**Walked:** PR [#88](https://github.com/bywale-com/omcoda_tower/pull/88)–[#96](https://github.com/bywale-com/omcoda_tower/pull/96) on `origin/main` @ `7dffeef` (through #95). #96 is **open** (docs). SA packets 010–015. Code: `workflowWalk.ts`, `auditRun.ts`, `runWrites.ts`, `machine.ts`, migrations `010`–`015`, Ant Contacts / Book readiness / Automations.  
**Join:** packets [`SYSTEMS-CHANGE-PACKET-012.md`](./SYSTEMS-CHANGE-PACKET-012.md) · [`013`](./SYSTEMS-CHANGE-PACKET-013.md) · [`014`](./SYSTEMS-CHANGE-PACKET-014.md) · [`015`](./SYSTEMS-CHANGE-PACKET-015.md) · Get/Rule ascribe [`SYSTEMS-GET-RULE-ASCRIBE.md`](./SYSTEMS-GET-RULE-ASCRIBE.md).

Do not mint an `events` table. Do not freeze Audit as three named writes. Do not merge Consultant / Operator desks. Do not treat Hub inspector as live.

---

## Verdict (one screen)

| Packet | PR that cut it | Status |
|--------|----------------|--------|
| **010** housing (sequence ⊃ campaigns, dispatch, Ant Save) | **#88** merged | **Landed.** Do not reopen. |
| **011** variations + Agents C0/C9/C11/C13 | **#90** merged | **Landed.** Do not reopen. |
| **012** one timer · A18 `grain`+`local_ref` · A19 audience · seed | **#92** merged | **Landed.** C8b on that PR was a **stub**; **#93** built the firm-first plate. |
| Logout chrome | **#91** merged | Not an SA packet. Chrome only. |
| **013 + 014 + 015** together | **#94** merged 2026-08-17 | **The cut landed.** Filenames remapped. Leftovers below — none of them reopen the handle primitive. |
| PM walked off Audit=three named writes | **#89** merged as “every write that run made”; **#95** seated new PM on **13:07** | Do not recut 015 from the PM seat. |
| Get + Rule Output / Outcomes (A20–A23) | **#96** **OPEN** | Extends the handle (full-chain Input, Get kind, rule emit listing). **Not** evidence 015 failed. Ascribe: [`SYSTEMS-GET-RULE-ASCRIBE.md`](./SYSTEMS-GET-RULE-ASCRIBE.md). |

**Engineer can ship:** leftover list in this file (draft house, If proxy, pick chrome, LIMIT 50, `import.created` type ghost). **Engineer must not:** recut 015, mint copy-row events, freeze Audit outputs, plant Get from `reference_versions`.

---

## Per PR (what they actually did)

### #88 — 010 housing

Sequence is `sequence_template` with campaigns as children. Ant Save materializes. Walker dispatch exists. Extra `run_audit` on the CHECK was **accepted** in the parent packet (17:05). Done.

### #90 — 011 variations + Agents face

`campaign_channel_variation` + migrate-one-`every`. C0/C9/C11/C13 face. `enrollment.sequence_id` SET NOT NULL after backfill — leftover we named, **accept**. Done.

### #91 — Log out

Operator + Consultant chrome. No machine. Ignore for packets.

### #92 — 012 grain / audience / one timer

`012_grain_audience_one_timer.sql`: `campaign_channel.rules_override` + `within_seconds`; `seq_channel_rules`; `workflow_trigger.local_ref`; `workflow.audience_*`; seed people. Dispatch matches A18 then A19.

**Honest miss on that same PR:** C8b shipped as two radios + search + checkbox stack. **Not the plate.** Founder: Select from is **firms first**. Implementer miss, not a missing SA spec.

Also on #92: a second migration `013_operator_book_people.sql` (Operator book across firms). That **consumed the 013 filename** before SA-013 existed.

### #93 — C8b for real

Firm-first Add contact. Same modal: Agents = INSERT `enrollment` (starts the mission); Automations = audience only. Chrome: firm dropdown, nav icons, canvas scroll. **This is the 012 C8b cut**, late. Do not reopen 012 DDL.

Get packet (#96) later: deselect-all on Get; fix Add contact **there** later. C8b on main still may lack “Deselect all” as a control — chrome leftover, not 012 SQL.

### #89 then #95 — PM law, not a recut

#89 started as Audit pipe = run / verdict / sequence-ready (wrong freeze). Merged title is the correction: **every write that run made**. #95 holds **13:07** so a new PM does not pick up the old Current. Engineer owns 013+014+015. **Do not recut 015 from those seats.**

### #94 — 013+014+015 in one ship

This is the systems cut. Code facts on `origin/main`:

| Spec | Landed |
|------|--------|
| Confirm book / Prepared upload\|file → land book | `handleContactImport`: INSERT `import_batch` `kind='contact'` + UPSERT `contact_records` + `dispatchEventToWorkflows('contact_import')` **with `writes`**. CRM radio stays grant. **No auto-audit.** |
| Event name | Picker **Contact import** = `contact_import`. Type union still lists Hub `import.created` (ghost). |
| `run_audit` | Walker calls **`executeAuditRun`** (extracted from the old handler). `handleAuditRunCreate` is the HTTP door around the same function. Returns `{ id, verdicts, summary, writes }`. |
| Handle | `WalkContext.previousWrites: { table, id, contact_id? }[]`. Trigger fills from payload. **Action replaces** the handle with that module’s writes. If **pass-through** for children (saves/restores writes). Persist on `workflow_run.node_status`. |
| House | `workflow.firm_id` NULL. Dispatch `WHERE (t.firm_id=$1 OR t.firm_id IS NULL)` and `status='active'`. Seed `wf-house-contact-import` is **`draft`**. |
| If | `evalIfPick` on authored `pickTable` / `pickField` / `pickOp` / `pickValue`. Seed: `sequence_ready.ready eq false`. |
| Tag + notes | `ascribe_tag` INSERT `contact_tag`; `notesFromVerdict` UPDATE `contact_records.notes`. Contacts columns show tags + notes. |
| Book readiness | `listAuditRuns` / `getAuditRun` — pane of `audit_runs`. Start Audit stays manual. |
| Delete node | Backspace / Delete + Remove. |
| `call_agent` | Still enrolls. Unchanged. |
| `fireOnboarding` after audit | **Gone** from Book readiness on main. `AuditContext` / ports still have the method (dead door). |

**Filename remap (do not recut SQL under the packet names):**

| Packet said | On main |
|-------------|---------|
| `013_contact_import.sql` | **`014_contact_import.sql`** (`013_operator_book_people.sql` already existed from #92) |
| `014_house_audit_tag_notes.sql` | **`015_house_notes_handle.sql`** (DDL + house graph seed; handle itself is walker) |

### #96 — OPEN — Get + Rule interiors

PM packets on `cursor/node-interior-a11-4b9f`. **Do not recut 015.** They name gaps 015 did not claim:

- Input sees **every prior node** in this chain (live is last-node handle).
- **Get** is a new node kind (not Action).
- Rule Output = this run’s writes, click → preview. Required data is a **write** (`missing_fact_signals` named; rule node does not emit it). Do not mint a listing table.
- Rule Outcomes: Input / Outcomes / Output. Rule runs for re-engagement or reactivation only.

Ascribe answers: [`SYSTEMS-GET-RULE-ASCRIBE.md`](./SYSTEMS-GET-RULE-ASCRIBE.md). In-app Action / A31 (08:40): [`SYSTEMS-IN-APP-ACTION-ASCRIBE.md`](./SYSTEMS-IN-APP-ACTION-ASCRIBE.md). 017 grain stands.

---

## Leftovers vs 013–015 (honesty holes)

None of these mean “015 failed.” They are the next small cuts or chrome. **016 is the event Test contract, not a handle.** **017** is available vs run count (`chainWrites` + `N`) — still not a recut of 015.

| # | Leftover | Kind | What to do |
|---|----------|------|------------|
| 1 | House seed **`draft`** | Product path | Packet manual said one house automation **active**. Dispatch requires `active`. Operator must **Activate** (Activate already `materializeTriggersFromGraph`). Optional: seed `active` if founder wants it live without a click. |
| 2 | House If = `sequence_ready.ready eq false` | Proxy | `executeAuditRun` sets `ready=true` for **reachable and partial**. “Failed” on the canvas is **unreachable only**. Partial gets the **valid** tag. Founder said failed contacts. Prefer If on `reachability_verdicts.verdict` if they meant not-reachable. Do not freeze Audit’s output list to get there — it is a **pick**. |
| 3 | Handle is **last-node replace**, not a stack | 015 boundary · **017 cut** | Last-node `previousWrites` stays. Full-chain Input is `chainWrites` on the same walk — [`SYSTEMS-CHANGE-PACKET-017.md`](./SYSTEMS-CHANGE-PACKET-017.md). Do not recut 015 into a stack. |
| 4 | `previousResultFrom` on If UI | Chrome | Saved on the node. Walker **does not read it**. Live pick is `pickTable`+`pickField`. |
| 5 | Pick UI is an enum + text | Chrome | If: `sequence_ready` \| `reachability_verdicts`. Audit `pickTable` defaults `import_batch`. Not a live list of **this run’s** writes. |
| 6 | Empty `contactIds` → `sequence_ready ready=true LIMIT 50` | Risk · **017 cut** | Stop using LIMIT 50 as grain. Empty last handle → `N = 0`. Honest empty. Get is a DAG node, not this fallback. [`SYSTEMS-CHANGE-PACKET-017.md`](./SYSTEMS-CHANGE-PACKET-017.md). |
| 7 | Wrap language | Docs | Say **`executeAuditRun`**. `handleAuditRunCreate` is the HTTP wrapper. Packets that only name the handler are stale wrap-talk. |
| 8 | `import.created` | Ghost | Still on the TypeScript event union. Picker lists `contact_import`. Drop the Hub name from the union when touching that file. |
| 9 | `fireOnboarding` | Dead door | Not on Book readiness. Still on `AuditContext` / `ports`. Do not revive as the product path after audit. |
| 10 | House seed has **no** `workflow_trigger` row until Activate | OK if Activate | Graph has the trigger node. Materialize runs on Activate (and Save). Draft + no trigger row = import will not walk. Documented by leftover 1. |

---

## What 015 is / is not (so #96 does not reopen it)

**015 is:** on the walk, after a node, `previousWrites` = the rows **that module wrote this run**. Next node **picks**. No copy table. No frozen Audit catalog.

**015 is not:** n8n Input of every ancestor; Get as a kind; Rule emitting `missing_fact_signals`; Output chips. Those **use** the handle. They do not replace it. Full-chain Input + run-count `N` is **017**, not a recut of this produce.

---

## Do not

- Recut 015.
- Mint `events` / a listing table / `reference_versions` as pack-update schema.
- Hardcode audit on upload.
- Enroll because an action node exists.
- Merge desks.
- Overwrite 15:43.
- Treat #96 as proof the house graph failed.
