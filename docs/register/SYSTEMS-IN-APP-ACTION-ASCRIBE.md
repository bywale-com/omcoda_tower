# Systems — in-app Action + mapped box (PR #96). 017 stands.

**Seat:** Systems Analyst.  
**When:** 2026-08-19 08:40 UTC.  
**What this is:** answers to PM [`IN-APP-ACTION-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/IN-APP-ACTION-PACKET.md) (law 41) and [`MAPPED-BOX-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/MAPPED-BOX-PACKET.md) (law 40 / A31 · A32). Shape ascribe. **No new tables.** **017 is not recut.** **Do not recut 015.** Flag **15:43**.  
**Join:** grain [`SYSTEMS-CHANGE-PACKET-017.md`](./SYSTEMS-CHANGE-PACKET-017.md) · Get/Rule [`SYSTEMS-GET-RULE-ASCRIBE.md`](./SYSTEMS-GET-RULE-ASCRIBE.md). Face on open PR [#96](https://github.com/bywale-com/omcoda_tower/pull/96).

Do not spec the picker. Do not block the face.

---

## Enable (017 is the grain; this is the inventory)

Law 41: **can we automate X = does that module already have that write-button.** Automations consumes. It does not author a second Start Audit.

017 still names **how many times** the picked button runs (`N`, person-verb vs set-verb). It does **not** author the list. Face list = desks. Walker tokens = existing handlers.

A31 occupancy: the mapped chip **is** the box. That chip is already 017’s pointer (`MappedChip`: `fromNodeId`, `table`, `field`, `id` on graph `mappedSlots`). **One source** for the slot.

A32 close-Input / resize the interior: **chrome. Silent** in the machine.

Agents stays A14 / `call_agent`. Do not collapse into in-app.

---

## A. Write-buttons we already have (quote the desk)

Walked live `/prototype-ant` on `origin/main` + walker `workflowWalk.ts`. Hub leftovers are not desks.

| Module | Desk control | Worker / table | In-app inventory | 017 verb |
|--------|--------------|----------------|------------------|----------|
| **Book readiness** | **Start Audit run** | `machineApi.createAuditRun` → `executeAuditRun` → `audit_runs` (+ verdicts / `sequence_ready`) | **Yes.** Walker `run_audit` already. | **Set.** Once over the set. |
| Book readiness | Upload book CSV | parse CSV then **the same** `createAuditRun` (auto-audit) | **No.** Confirm book is the import door (013). Do not list a second Audit. | — |
| **Contacts** | **Confirm book for Tower** (file) | `machineApi.importContactBook` → `import_batch` + `contact_records` | **Yes** as that write-button. **No** `action.type` yet. Same wrap pattern as 014 (`run_audit` = `executeAuditRun`). | **Set** (the batch). People land on the handle. |
| Contacts | Tag chips on the table | Display of `contact_tag` | **No button.** Walker `ascribe_tag` stays for graphs that already use it (house). Do **not** pad the picker. | Person, when that type runs |
| **Automations** | Add contact | C8b audience (`workflow.audience_*`) | **No.** Audience is who is enrolled, not a write-action. A19 stays off this pocket. | — |
| **Agents** | Add contact | `createEnrollment` → `enrollment` | **No.** That is **Agents** Action (A14 / `call_agent`). | Person (Agents path) |
| **Firms / Provision** | Provision | `provisionFirm` → `ct_firms` | Desk **yes.** `action.type` **silent.** 014 already named wrap-later. Face may show it; walk is silent until the wrap. | Set. `N = 1` artifact |
| **Reference** | Publish / upsert | `upsertReference` | Config write. Pack-update still **silent** as an event (016: no v1). Do not freeze as in-app this pass. | — |
| **Agents** | Save template / bind | `upsertTemplate` · `upsertBinding` | Authorship. Not an in-app Action. Enroll is Agents. | — |
| **Automations** | Save · Activate | graph jsonb + `activateWorkflow` | Meta. Do not automate Save-this-graph. Honest empty on this module. | — |
| Hub radio | `manage_lists` · `assign_task` · `notify_consultant` | Walker fallback → `engagement_records.event_kind` | **Kill on the face.** No desk write-button. 010 parked them. Do not lengthen the inventory from Hub. | — |

**PM paste “`action` is still `call_agent` only” is stale.** On main the walker already runs:

- `call_agent` → enroll
- `run_audit` → `executeAuditRun`
- `ascribe_tag` → `contact_tag` (+ optional notes)
- anything else in the CHECK → `engagement_records` (the Hub leftovers)

Do not block the UI pass on a gap that is not the gap. The real gap: **desk buttons with no `action.type`** (Confirm book, Provision). Face may list them. Walk stays silent until named as a wrap. Do not invent generic “write any table.”

Live face `ActionInAppModal` radios the five hardcoded kinds. That is **not** the inventory. Kill it as the catalog.

---

## B. HolonBoundary analog — silent

There is **no** place a module write is declared once and Automations lists it.

What exists, copied three times:

| Copy | Where |
|------|--------|
| SQL CHECK | `action.type` |
| Walker | `ACTION_TYPES` + switch |
| Face | `IN_APP_KINDS` / `ACTION_TYPE_DEFAULT_LABELS` |

That smell is not a missing wrapper table. **Do not mint** `action_affordance` / a registry / a HolonBoundary-for-writes API.

**Smallest:** `action.type` **is** the token. New in-app row = wrap the handler you already have (014). Face walks **desks**, not the CHECK. Walker/CHECK stay the machine. Do not keep a third hardcoded radio.

---

## Mapped box (A31) — one source

Live (`GetParametersPane` `ChipBox`): `mappedSlots[slot]` **and** `getClass1` / the Select **both** paint. `isGetConfigured` is `Boolean(data.getClass1)` — a Firm chip does not count. Wrong.

**When `mappedSlots[slot].length ≥ 1`:** that chip list **is** the value. Ignore `getClass1` / `getClass2` for that slot (walker + configured). List-pick with no drag still writes `getClass1` / `getClass2` as today.

Empty → picker. Mapped → chips occupy the same field (A31 chrome). Several chips = 017 `N` from that mapped set.

Do not invent a second store. `mappedSlots` already sits on node `data`.

**A32:** close Input, resize the interior modal. No column. No saved-size table.

---

## 017 — what this does not change

Two facts stay. `previousWrites` last-node replace stays. `chainWrites` for Input stays. Person-verb loops `N`. Set-verb once. Empty handle → `N = 0`. No `LIMIT 50`. No SQL. No recut of 015.

Revision on the packet: Action **consumers** of 017 are **desk write-buttons**, not the Hub radio. Mapped chip **is** `N` for that box.

---

## Do not

- Recut 015 or 017’s two facts.
- Mint a registry table from the Holon analog.
- Pad the picker with Hub leftovers or with walker types that have no desk button.
- Put Get’s Module / Every / Select cascade on Action Parameters.
- Collapse Agents into in-app.
- Treat Get as a trigger substitute.
- Overwrite 15:43.
- Block the face until every desk button has a walker case.
