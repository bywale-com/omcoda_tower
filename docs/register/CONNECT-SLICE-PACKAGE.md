# Connect slice — implementation package (SA recommendation, 2026-08-16)

**What this is:** a dated prompt for **two implementation agents** on **one slice**. Not Story. Not a second flag. Not “build Agents.” Not “build Automations.”  
**Seat that wrote it:** Systems Analyst (recommendation). Founder asked whether to spin; this is the brief **if** they spin.  
**Law:** PHASE-TWO-LOG **15:43** untouched. Events: [`SYSTEMS-EVENTS.md`](./SYSTEMS-EVENTS.md). Objectives: [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md). Ascribe: [`SYSTEMS-AGENTS-ASCRIBE.md`](./SYSTEMS-AGENTS-ASCRIBE.md) · [`SYSTEMS-AUTOMATIONS-ASCRIBE.md`](./SYSTEMS-AUTOMATIONS-ASCRIBE.md).  
**Product face:** prototype Ant. Hub is **reference only**.

---

## The slice (one vertical)

**Listen to one existing objective write → assign an existing agent.**

That is the connect. The write **is** the event. The action **is** today’s `call_agent` / enroll.

| Side | Does | Does not |
|------|------|----------|
| **Systems agent** | Persist Ant Automations Save into `workflow` + `workflow.graph` + `materializeTriggersFromGraph`. When `fact_writebacks` **or** `meeting_booked` is inserted, `dispatchEventToWorkflows` (name = that table/kind, not a invented synonym). Action stays `call_agent` → `enrollAndActuate` into the **existing** `firm_sequence_binding`. | Mint `events`. Widen `action.type` CHECK. Drop `launch_day`. Campaign child table. Every firm. Call/ElevenLabs. Rule-pack table. Teaching walk (provision → audit → if). LISTEN/NOTIFY bus. Fill a catalog. |
| **UI agent** | Ant A1 canvas **Save is real** (not the flash tag). A5 picker offers **only** the one or two completions this slice listens to (form in / meeting booked) — not a filled catalog. A14 **assign existing**: three sequence radios, no chevron. Look like the pictures. | Plant Rule GUI. Plant Call. Plant C8 Every firm. Plant the four-node teaching walk. Plant A13 as a screen. Invent more picker rows “while we’re here.” Continue Hub. |

**Order:** not UI-then-systems. Not mint-then-paint. Same package. Systems names the door (persist + dispatch on the existing write). UI paints the pictured control against that door. Parallel after the door is named (already named here: `workflow` / `workflow_trigger` / `fact_writebacks` or `meeting_booked` / `enrollment`).

**Watch law (founder 01:31):** not everything is watched by default. Not everything needs to be watched needlessly. No picker row until a workflow needs that table. This slice needs **one** completion table. Connect that. Stop.

**01:44 (PM + founder):** This slice **is** the Automations middle, once — not a smaller idea. Founder spec is the pictures + FACE. They do not specify persist. Save means the picture is true. Do not ask them for SQL. Do not build every plate because the pictures exist.

---

## Paste this — Systems agent

```text
You implement the connect slice. You are not the Product Manager. You are not minting Agents housing.

Read: docs/register/CONNECT-SLICE-PACKAGE.md, docs/register/SYSTEMS-EVENTS.md, docs/register/SYSTEMS-AUTOMATIONS-ASCRIBE.md (01:10 + 01:25), docs/register/SYSTEMS-ANALYST-LOG.md Current.

Do this only:
1. Ant Automations Save must persist workflow + graph JSONB and call materializeTriggersFromGraph (see workflowWalk.ts / machine.ts). Today Ant handleSave is in-memory flash. Hub persist path is the reference, not the product.
2. On INSERT into fact_writebacks or meeting_booked, dispatchEventToWorkflows for subscribed workflow_trigger rows (type=event, event_name pointing at that write). The write is the event. Do not create an events table. Do not copy the row.
3. Action remains CHECK type = 'call_agent'. Enroll via enrollAndActuate into the existing firm_sequence_binding. A14 assign-existing only.

Do not: drop launch_day; mint campaign rows; widen action types; Every firm; ElevenLabs; rule-pack table; JS evaluator; teaching walk; fill WORKFLOW_EVENT_CATALOG; put triggers on the Agents canvas; overwrite PHASE-TWO-LOG 15:43; continue Hub as the app.

Verify: npm run build. Manual: Save an A1 graph in Ant, insert one completion row, see a workflow_run + enrollment. If VITE_WIRE_REAL needs the backend, say so — do not fake dispatch in the browser.
```

---

## Paste this — UI agent

```text
You implement the connect slice on prototype Ant. You are not the Product Manager. You do not mint tables. Hub is reference only — do not continue work in Hub.

Read: docs/register/CONNECT-SLICE-PACKAGE.md, docs/register/AUTOMATIONS-FACE.md laws 27–32, docs/register/AUTOMATIONS-UI-BLUEPRINT.md A1 / A5 / A14, docs/register/SYSTEMS-EVENTS.md.

Do this only:
1. Ant Automations A1: trigger · rule · action can look like the picture. Save writes through the systems door (not a Saved flash). Launch/activate already named — do not invent Publish.
2. A5 event picker: only the completion(s) the systems agent dispatches this slice (form write-back / meeting booked). Global/local if the picture already has it; do not invent Settings. Do not list every table.
3. A14: assign existing sequence. Three radios (opt-in / re-engagement / reactivation). No chevron. No create-agent. Create-from-template is not this slice.

Do not: plant Rule GUI (A2–A4); plant Call; plant C3 qualify / C5 composer / C8 Every firm; plant the provision→audit→if teaching walk; treat A13 as a screen; fill an event catalog; put Automations triggers on the Agents canvas; overwrite 15:43.

Verify: npm run build. Manual against the running SPA. If Save has no systems door yet, wait — do not stand-in a second store.
```

---

## Not this spin (still paper)

- Agents housing (campaigns as rows; CHECK drops `launch_day`; qualify). Needs **system time** on Story 7.
- C8 **Every firm** (cross-tenant). This-firm Add contact can be a **later** slice — enroll already exists.
- Teaching walk #87 (firm provisioned → audit → if X → agents). Audit is not an `action.type`. If is too thin. Dual tenancy ununified.
- Send, book-in door, listing bind, lineage screen, failure → tag, named JS.
- Schedule / manual / webhook as table-change events — founder: cross that bridge later.

---

## What this is not

- Not overwriting 15:43.
- Not promoting Story.
- Not two agents splitting “all Agents” vs “all Automations.”
- Not UI first, then systems.
- Not system time on the whole paper.
