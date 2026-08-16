# Systems — Events (a change in the table, detectable)

**Seat:** Systems Analyst.  
**Status:** Founder expansion 2026-08-16 01:25 UTC. Same grade as [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md) / OPERATOR-REVISIONS: **denser than Seed/World, not Seed/World law until Story is promoted.** Founder: the pattern is emerging; will not be taken back as a trial balloon.  
**Does not:** mint an events table; overwrite PHASE-TWO-LOG **15:43**; fill an operator event catalog; rewrite Seed/World.  
**Join:** [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md) (objectives already defined) · FACE laws 27–32 on PR [#87](https://github.com/bywale-com/omcoda_tower/pull/87) · SA paper 01:10 (objectives are events; write-back **is** the event) · `workflow_trigger` / `dispatchEventToWorkflows`.

Requirements must **not** extract an `event` state or a CDC bus from this file until Story carries a promoted **must**. Until then this file is the substance so the detail is not background.

---

## Founder excerpts (do not paraphrase away)

Spoken 2026-08-16, before / as PR #87 landed. Kept specific.

> creating a new PR, but before you even see that PR, I think the pattern is really emerging very cleanly. And once you see that new PR, it'll just click perfectly.

> System events, which are, if you boil it down to the basics, are just … what is a system event anyway? It's just a change in the table, if you boil it down to the basics, a change inside of the table, which is detectable, and it should be detectable. All changes inside every single table should be detectable. And those are events. Boom, those are events, triggers.

> And objectives, right? Objectives, we've already defined objectives. We've made all kinds of examples of objectives. So I think it's really boiling down to events and objectives.

**#87 (PM, 01:17 — the PR that clicks):** Automations is a blank canvas. You can chain. Teaching walk: **firm created / provisioned** → **audit the contacts** → **if X** → **agents**. Provisioning a firm is not only creating the firm — things inside still have to happen. Completion of a step is also an event, so the same chain can be one canvas or two automations listening.

---

## The boil-down (alignment, not a substitute flag)

Two primitives. Not a third engine. Not a return wire.

| Primitive | What it is | What it is not |
|-----------|------------|----------------|
| **Event** | A **change inside a table** that is **detectable**. Those detections **are** the triggers. | Not a special catalog we invent first. Not a row that copies the write. The write **is** the event (FACE 28 / 23:16). |
| **Objective** | Already defined ([`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md)). A named completion of a campaign / class. Completions **are** events (FACE 28). | Not every table change. Enrollment, send, authorship Save, halt — writes, therefore events **if detectable**. Not objectives. |

**All objectives are events. Not all events are objectives.**

“All changes inside every single table should be detectable” is a **capability**. It is not an operator catalog of every UPDATE. Global / local (FACE 27) already scopes who listens: all of that kind, or this one. C8 / A14 contact scope (Every firm · Select from) is the same divide on **which rows** the listener sees.

Do **not** mint an `events` table that copies the write. Listeners (`workflow_trigger`) point at **table + kind + global/local**. The row that changed is the fact.

---

## Why #87 clicks

Each step in the teaching walk is a write (or a read of a prior write):

| Step | Table change (stood up or named) | Event? | Objective? |
|------|----------------------------------|--------|------------|
| Firm created / provisioned | INSERT `firms` (UUID) and/or `ct_firms` (TEXT). Dual tenancy ununified. “Things inside still have to happen” = more writes after the firm row | Yes — if detectable | No |
| Audit the contacts | Named in-app action (01:17). Closest rows: `audit_events`, eligibility writes, `eligibility_evaluations` | The **result write** is the event | No |
| If X | Not a write. Reads the previous result (rule or action output) | No. Condition on a prior event | No |
| Agents | INSERT `enrollment` (then cascade / send) | Yes | No. Enroll is start, not completion |
| Later: form in / meeting booked / signed up | `fact_writebacks` · `meeting_booked` · `consent_records.status` | Yes | **Yes** — these are the named objectives |

Same chain as **one canvas** (event → action → if → action) or **two automations listening** because the action’s completion write **is** an event (FACE 32 + 28). Do not collapse those.

---

## Stood up today (do not pretend)

**Listener row:** `workflow_trigger` (`006`): `type IN ('event','schedule','manual','webhook','constant')`, `event_name` TEXT. UNIQUE `(workflow_id, node_id)`. Index `(firm_id, type, event_name)`.

**Dispatch:** `dispatchEventToWorkflows` matches `firm_id` + `type='event'` + `event_name` string + `workflow_state.status='active'`. Then walks. **Not** “any table change.”

**Hardcoded fire sites in `machine.ts`:** `eligibility.changed` (after eligibility writes) · `audit.completed` (onboarding when `campaign_states` is running). Generic `handleMachineEvent` takes a **name** in the body — a push, not a detect. Webhook is a **different trigger type**, not a table-change detect.

**Hub catalog** (`WORKFLOW_EVENT_CATALOG`): `eligibility.changed` · `contact.created` · `contact.updated` · `import.created` · `audit.completed` · `audit.failed`. **No** `form_submitted`. **No** firm-provisioned. **No** campaign-failure. **No** meeting-booked. **No** opt-out.

**Writes that already exist and do not dispatch:** `fact_writebacks`, `meeting_booked`, `messaging_events`, `consent_records`, `enrollment`, `halt_records`, `firms` / `ct_firms`. Completions are rows. They are **not** triggers until something detects them.

**`audit_events`** is an append log, not the listener bus. Do not promote it to “the events table.”

Schedule / manual / webhook / constant remain **trigger types**. They are not table-change events. Do not wash them into this boil-down until Story says they are also “just writes.”

---

## Capability vs catalog (name the split; do not fill)

| Grain | Law | Do not |
|-------|-----|--------|
| **Capability** | Every table’s INSERT / UPDATE / DELETE **can be heard**. That is what “should be detectable” means. | Do not mint a copy-row per write. Do not require LISTEN/NOTIFY tonight. |
| **Operator catalog** | Named events the picker shows (FACE open 12): form completion, campaign failure, opt-out, **firm created / provisioned**, plus the Hub six. | Do not invent the rest this stamp. The catalog is a **subset** of detectable writes, scoped global/local. |

If this is true, and every table change is detectable, **what happens with authorship Save** (`sequence_template` / `workflow.graph` UPDATE)? Capability: yes, detectable. Catalog: probably not an operator trigger. Ask — do not fill.

If this is true, and “firm provisioned” is the teaching event, **which table** — `firms` or `ct_firms` — is the write? Dual tenancy is still ununified. Name it; do not pick in paper.

---

## Confirmed 2026-08-16 01:35 — founder answers (do not re-ask)

**1.** Event = detectable table change. Objective = named completion (a kind). Not every write is an objective. Every objective is an event; not all events are objectives. **Yes.**

**2.** Capability vs catalog: every table **can** be heard. Do not fill the catalog tonight — **or in advance.** It becomes obvious when a workflow hits a block: “how do we create an automation for this?” The table already supports it (detectable). Then: UI for that, connect to that table. Boom.

**3.** Authorship Save as a picker row **builds from 2.** Do not pre-fill. Uncovered when a workflow needs it.

**Watch (new law, same stamp):** not everything is watched **by default**. Not everything needs to be watched needlessly. Detectable ≠ subscribed. No UI picker / pointer for every table until a workflow needs that write.

**4.** Schedule / manual / webhook stay **separate trigger types** (for events). Are they non-table? Unsure — they may have tables. Cross that bridge later. Systems should not need a large change even if something must be built.

Do not treat this confirmation as a mint or a filled catalog.

**01:44 (PM):** Starts (events / objectives) stay open forever — connect when a workflow needs that table. **Middle** = hear the write → run the graph → If → assign / enroll. The connect slice is that middle, once. Do not spin “build every event and every objective.”

**02:03:** Dispatch list and new writes (`campaign_failure`, `contact_tag`, `ct_firms` as provisioned) are specified in [`SYSTEMS-CHANGE-PACKET.md`](./SYSTEMS-CHANGE-PACKET.md). Still no events table that copies the write.

---

## Do not

- Mint `events`, `event_log`, or a lineage table from this sentence.
- Dispatch by inventing names that are not writes (`form_submitted` with no `fact_writebacks` / form row).
- Put `workflow_trigger` on the Agents canvas.
- Collapse objectives with events (FACE 28 already said objectives **are** events; this file says the converse is false).
- Overwrite 15:43. Treat #87 as Story. Cement tonight.

---

## 2026-08-16 19:25 — Global/Local is not Contacts

**Correction.** The boil-down above said FACE 27 global/local and C8 Every-firm / Select-from were “the same divide.” **They are not.** A18 vs A19 (PR #89 18:53).

| Control | What it scopes | Column |
|---------|----------------|--------|
| **A18 Global / Local** | The **event instance** — all form submissions vs **this** form; all campaign failures vs **this** campaign | `workflow_trigger.grain` + `local_ref` (012) |
| **A19 / C8 audience** | **Which people** the workflow / sequence applies to | `workflow.audience_*` (Automations) · `enrollment` (Agents) |

`workflow_trigger.scope` from 010 was the C8 lump on the trigger. Leftover. Packet: [`SYSTEMS-CHANGE-PACKET-012.md`](./SYSTEMS-CHANGE-PACKET-012.md).

Audit is Global-only as a **trigger** (one-time). Same-canvas chain uses If, not Local audit.

---

## 2026-08-16 21:22 — How we know a flow worked (monitor, not a second bus)

**Founder:** systems are events. To see if a flow works, name the events it should create, connect (maybe email), and watch whether those events show up — so you are not stuck inside the systems.

**Yes.** The unit of “did it work” is the **write**. Same law: the write is the event. Do not mint an `events` table that copies it.

**Tighten (do not wash):**

| Thing | What it is |
|-------|------------|
| **Did the flow work?** | Did the **expected writes** for **this** flow happen, in order. That list is a **per-flow checklist**, not the operator catalog. |
| **Product email** (CEM to a contact) | Only some events send. Enroll, audit, If, form, call composer, cursor advance — **writes**, often **no** contact email. “I got the outreach email” proves send. It does not prove the rest. |
| **Monitor email** (to you) | A **pane** on the same dispatch. After the write, CEM `TEST_EMAIL_TO` / notify. You are not sitting in Postgres. This is not a second event system. |

How: list the tables this flow must INSERT/UPDATE. Those writes must **dispatch** (today many still do not). Then either read the rows (Activity) or hang a tiny automation on those `event_name`s that mails you. Same `dispatchEventToWorkflows` Automations already uses.

**Not:** “almost everything emails.” **Not:** filling the catalog so we can monitor. **Not:** an events table. If a write is not dispatched, email cannot see it — that is the honesty hole, not a reason to copy the row.

**Do not:** overwrite 15:43; treat inbox as the machine.

---

## 2026-08-16 22:25 — Why the first authored workflow looks expensive

**Founder:** look how much is required just to make this work. Deeper reason, given where the app is going (canvas is the app; you do not go into code for the next listen).

**The pile is not new housing.** Audit, tags, contacts, triggers, workflows already exist. Book readiness **already** does import+audit in one HTTP function. That is the hardcoded version of the workflow they want on the canvas.

**The hole is not three small patches.** Those three facts are symptoms:

1. **A write is heard.** INSERT does not dispatch unless someone coded that fire. The trigger node is a subscription row, not a table watch.
2. **An action is that action’s write.** The walker treats every action as enroll. `run_audit` / `ascribe_tag` are allowed on `action.type` and do not run.
3. **House can hear.** Dispatch is one firm. “Anyone in any firm” is `workflow.firm_id` NULL plus dispatch including those rows.

**Deeper (22:26, founder: it is a lot; not as simple as why; especially given where the app is going):** Destination = **the graph is the app**. Today the app **is TypeScript** (`handleAuditRunCreate`, `handleMachineProvision`, `fireOnboarding`). The canvas is a second, incomplete runtime that only enrolls. Cut 014 is the first product path that must live in the graph **instead of** in a handler. That is a regime change.

The founder drawing file → audit → tag is drawing **writes**. The machine needs **named events + action types**. Edges on the canvas are not FKs and are not LISTEN. Someone has to **compile** the picture into `workflow_trigger.event_name` + walker cases. Every new verb is a compiler extension until the catalog is closed. Dual-running both runtimes until the graph can do what the handler already does is why it feels like a lot. **It is a lot.** Hardcoding the path in TypeScript is less now and goes **backwards** from no-code-the-app.

Do not mint an events table to skip this. Do not LISTEN/NOTIFY as the answer. Do not hardcode audit on upload and call it modular.

**Do not:** overwrite 15:43.

