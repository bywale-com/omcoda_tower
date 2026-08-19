# Systems — in-app Action + mapped box (PR #96). 017 stands.

**Seat:** Systems Analyst.  
**When:** 2026-08-19 08:40 UTC. **Corrected 09:35** — three YES was a filter. **Blessed 10:50** — PR #96 A33 / A34 / law 42. Evidence below.  
**What this is:** answers to PM [`IN-APP-ACTION-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/IN-APP-ACTION-PACKET.md) (law 41 · **A33** · **A34**) · [`MAPPED-BOX-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/MAPPED-BOX-PACKET.md) (A31 · A32) · law **42** (Input left = table writes). Shape ascribe. **No new tables.** **017 is not recut.** **Do not recut 015.** Flag **15:43**.  
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

## A. Evidence — persist-bound controls on `origin/main`

**08:40 was wrong as an inventory.** I kept three YES rows (Start Audit, Confirm book, Provision) and marked the rest “not in-app / authorship / meta / later.” That was taste. Law 41 is **the desk**. If it is a control that writes, it is on the list. Implementer lays it out by module. Founder redesigns after screenshots.

Walked `/prototype-ant` on `origin/main` (not Hub). **Persist** = a port that writes. **Paint** = React `setState` / `message.success` / DEMO rows — looks like a button, does not write. Duplicate doors = same worker, two desks; both are true.

**A7 pocket:** **in-app** = in-the-application Action list. **Agents** = A14 / enroll / Launch agent (still a write; other card). Not “doesn’t exist.”

### Persist (these are the list)

| Module | Control (label on glass) | Call | Writes | A7 |
|--------|--------------------------|------|--------|----|
| **Contacts** | Confirm book for Tower | `importContactBook` | `import_batch` + `contact_records` | in-app |
| **Prepared** | Authorize book (file path) | `importContactBook` | same as Confirm book | in-app |
| **Prepared** | Authorize book (CRM) | `crmOAuth.grant` | grant / book handover | in-app |
| **Prepared** | Revoke | `crmOAuth.revoke` | grant | in-app |
| **Book readiness** | Upload book CSV | `importContactBook` | same import door | in-app |
| **Book readiness** | Start Audit run | `createAuditRun` → `executeAuditRun` | `audit_runs` + verdicts / `sequence_ready` | in-app. Walker `run_audit` already |
| **Book readiness** | Re-audit remainder | **same** `startAuditRun` / `createAuditRun` | same | in-app (same button, second label) |
| **Consultant workspace** | Halt outreach / Halt book | `haltStore.commit` | halt | in-app |
| **Consultant workspace** | Lift / Resume | `haltStore.lift` | halt | in-app |
| **Provision** | Provision | `provisionFirm` | `ct_firms` (+ auth user when present) | in-app |
| **Provision** | Issue / send invite | `issueAccessInvite` | access token / invite | in-app |
| **Firm operations bind** | Active | `activateWorkflow` + `upsertBinding` + `putEvaluationPin` + `setCampaignState("running")` | workflow + binding + pin + `campaign_states` | in-app |
| **Firm operations bind** | Armed | `setCampaignState("armed-for-activation")` | `campaign_states` | in-app |
| **Reference data** | Publish version | `upsertReference` | `reference_versions` | in-app |
| **Configuration libraries** | Pathway / motion / field-class / reachability switches + reorder | `upsertEligibilityPathway` · `upsertMotionPrecedence` · `upsertFieldClassRouting` · `upsertReachabilityCheck` | those rule tables | in-app |
| **Configuration libraries** | Publish version (evaluation pack) | `putEvaluationPin` | evaluation pin | in-app |
| **Agents** (sequence) | Save | `saveSequenceHousing` + `upsertBinding` (+ `saveAttemptCycle` / `saveSeqChannelRules` / `upsertAttemptCriteria` when override) | `campaign` / sequence + binding + rules | in-app |
| **Agents** (house settings) | Attempt / channel / cohort / metrics / phase order | `upsertAttemptCriteria` · `upsertChannelOrder` · `upsertCohortScoring` · `upsertMetricsThreshold` · `upsertPhaseOrder` · `saveAttemptCycle` · `saveSeqChannelRules` | those tables | in-app |
| **Agents** | Add contact (ok) | `enrollSequenceContacts` | `enrollment` | **Agents** |
| **Agents** | Launch agent | `createEnrollment` | `enrollment` | **Agents** |
| **Automations** | Save | `createWorkflow` (graph + audience) | `workflow` + trigger materialize | in-app |
| **Automations** | Add contact (ok) | `createWorkflow` with `audienceScope` / `audienceContactIds` | same workflow row (A19) | in-app |
| **Automations** | Launch workflow | `activateWorkflow` then start run | `workflow_state` + `workflow_run` | in-app |
| **Automations** Settings | Eligibility pipeline reorder | `upsertEligibilityPipeline` | `seq_eligibility_pipeline` | in-app |
| **Sending infrastructure** | Allocate subdomain | `onAllocate` / pool-send port | pool subdomain (wire, not `action.type`) | in-app |
| **Contact portal** | Confirm booking | `bookMeeting` | `meeting_booked` | in-app (contact module) |
| **Contact portal** | Agree / Silence | `consentSilence.setConsent` / `.silence` | consent / silenced | in-app (contact module) |

Same worker, several doors: **`importContactBook`** = Contacts Confirm book · Prepared file · Book Upload. **`createAuditRun`** = Start Audit · Re-audit remainder.

### Paint / read — not inventory (so the list is not “every button in Ant”)

| Module | What you see | Evidence it does **not** write |
|--------|----------------|--------------------------------|
| **Commercial** | Save terms · Release · Return · Dispute | `setStatuses` / `setTermsDraft` on `DEMO_FIRMS`. No `machineApi` |
| **Acquisition & ads** | Save | `message.success("Saved draft · …")` — no port |
| **Configuration libraries** | Publish (automation / engagement pack) | `publishPackInCatalog` only — Bind dropdowns, no `machineApi` |
| **Contacts** | Tag chips | render `c.tags`. No ascribe control |
| **Meetings** | Copy brief | clipboard |
| **Audit trail / Oversight / Firm health / Register & evolution / Customer support / Activation state** | panes / jumps | list/get only (Activation state reads `getCampaignState`) |
| **ActionInAppModal** | five radios | Hub leftovers `manage_lists` / `assign_task` / `notify_consultant` have **no** desk control. Walker dumps `engagement_records`. **Kill as catalog.** `ascribe_tag` has **no** desk button either — walker exists for house graphs; do not pad a Tag row until Contacts has the button |

**Walker (stale PM line stays corrected):** `call_agent` · `run_audit` · `ascribe_tag` already run. Face list = **persist table above**, not those three CHECK tokens and not the five radios.

Do not block the UI. Walk stays silent until a listed persist has an `action.type` wrap (014). Do not invent generic “write any table.”

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

## Bless — PR #96 A33 / A34 / law 42 (2026-08-19 10:50)

This is the same architecture. Face named it. Do not recut 015 or 017.

| Face | Machine (already) |
|------|-------------------|
| **A33** grouped persist list | 09:35 table in this file. Kill main **#100** three-row picker as the product. Search/scroll. Same worker, several doors stay. Agents Launch stays the other A7 card. |
| **Law 42** — left is table writes, not n8n memory | 015 `previousWrites` + 017 `chainWrites`. Chip = pointer at `{ table, id, contact_id? }`. No in-memory item. Get is a read of rows already in a table. Test shows the **same write-shape** and still does not INSERT (law 39 · 016 door 2). |
| **A34** audit mark on the contact, no button | `executeAuditRun` already INSERT `reachability_verdicts` + `sequence_ready` keyed by `contact_id`. Those rows **are** the mark. On the handle after `run_audit`. If **picks** them (`pickTable`/`pickField`). Not `ascribe_tag`. Not an A33 row. Consultant multi-tag later. |
| New contact already wrote the person | Trigger Output **A25** = that `contact_records` write. This canvas does not INSERT the person. Tag (later) is `contact_tag` on the same id. |
| If-tagged after you just tagged them | Tautological on **this** canvas. If on the **audit** mark. Tag is so the system has the mark. Agents hang off that If, or hear the write as an event on another automation. |

**A34 glass gap (chrome, not a new write):** live Contacts shows `contact_tag` (house valid/invalid) + notes. It does **not** yet pane `reachability_verdicts` / `sequence_ready`. Book readiness does. Smallest: show those two writes on the person. Do not mint a tag. Do not route A34 through `ascribe_tag`.

PRIMITIVES still says live walk “does not send work to Audit.” **Stale glass.** Main walker already runs `run_audit`. Do not overwrite 15:43. Do not recut 015 from that paragraph.

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
- Pad A33 with the audit mark. That is A34 = Audit’s person writes.
- Treat tag as creating a `contact_records` row.
