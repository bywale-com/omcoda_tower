# Systems — change packet 022 (Objective met is a Local event)

**Seat:** Systems Analyst.
**When:** 2026-08-21 09:30 UTC.
**What this is:** the cut that makes **“this sequence ran, the objective is met”** the same mechanism as a Local trigger. Implementer **only implements**. No analysis left.
**Why:** Founder: events/triggers already have a solid mechanism underneath — a write we designated as a trigger. Objective met must have that same underneath. *“This specific form is filled and submitted by this user… back into the system, so the system can detect it and say: oh, they submitted this form — what’s that sequence?”* That mapping-and-matching is this packet.
**Join:** 010 housing (`campaign`, `campaign_objective`) · 017 `event_write_set` / `event_test_data` · A26 Local axes (`triggerLocalRefFromPayload` / `triggerLocalAxesMatch`) · [`PRIMITIVES.md`](./PRIMITIVES.md) row **“An objective was met”** · [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md) · flagship [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43**.
**Flag:** 15:43 untouched. **Do not recut 015 / 019.** Do not reopen #108 — this stacks after it.
**UI:** none required. Founder: the UI that exists is all the UI this needs. This is backend.
**Instructions:** founder only.

---

## 1. The mechanism, stated once

A Local event today is **two** things, and Tower already has both:

1. A **write** we designated as a trigger (event = the INSERT — law 1).
2. An **instance axis on that row**, so “this one” is answerable — not just “one of these happened.”

`contact_import` is Local because `contact_records.import_batch_id` **is a column**. `campaign_failure` is Local because `campaign_failure.campaign_id` **is a column**. The matcher (`triggerLocalAxesMatch`) then tests only the axes the operator specified.

**Objective met is exactly that shape.** The completion write **is** the event. Nothing new is needed conceptually.

**And the axis comes from a binding.** When the operator picks the objective on the Automations Action, they are **binding** that objective to something concrete — the column is already called `action.payload_binding`. Authorship binds; the runtime carries that binding out on the wire (§2.1) so the return leg can be matched. The stamp is not new information — it is the binding, made physical. §2.6 decides what it binds to.

What is missing is only (2) — **the completion rows do not carry which campaign asked for them:**

| Objective kind | Completion write (010) | Instance axis on the row today | Local possible? |
|---|---|---|---|
| `meeting` | `meeting_booked` | `enrollment_id` (no FK) | **Nearly** — enrollment, not objective |
| `form` | `fact_writebacks` | **none.** `form_ref` is passed in the dispatch payload and **never persisted** (`004` has no such column) | **No** |
| `click` | `messaging_events` → `outbound_messages` | **none.** No enrollment / campaign / attempt column anywhere on the send | **No** |

That is the entire gap. It is not philosophical and it is not a missing Story must. **Two of the three objective kinds cannot be matched back to the sequence that asked.**

And so the current met-check is Global-shaped where it must be Local-shaped:

```
campaignHousing.campaignObjectiveMet()
  → SELECT 1 FROM <completion_table> WHERE firm_id=$1 AND contact_id=$2 LIMIT 1
```

**Any** meeting this person ever booked, **any** fact they ever submitted, **any** message event at all satisfies **any** campaign objective. A meeting booked last quarter completes today’s launch window. That is the bug the founder is pointing at.

**The fix is two halves: stamp the ask, then match the answer.**

---

## 2. Hard decisions

### 2.1 Stamp the ask (outbound carries the objective)

When a sequence deploys outreach **in pursuit of an objective**, the objective rides on what goes out. This is what makes the return leg matchable.

```sql
-- Sends carry the pursuit.
ALTER TABLE outbound_messages
  ADD COLUMN IF NOT EXISTS enrollment_id TEXT,
  ADD COLUMN IF NOT EXISTS campaign_id TEXT,
  ADD COLUMN IF NOT EXISTS campaign_objective_id TEXT,
  ADD COLUMN IF NOT EXISTS attempt_id TEXT;

CREATE INDEX IF NOT EXISTS outbound_messages_objective_idx
  ON outbound_messages (campaign_objective_id, contact_id);

-- The form is per-objective. Persist the instance axis that the payload already carries.
ALTER TABLE fact_writebacks
  ADD COLUMN IF NOT EXISTS form_ref TEXT,
  ADD COLUMN IF NOT EXISTS campaign_objective_id TEXT;

CREATE INDEX IF NOT EXISTS fact_writebacks_objective_idx
  ON fact_writebacks (campaign_objective_id, contact_id);

-- Meeting already knows the enrollment. Name the objective too.
ALTER TABLE meeting_booked
  ADD COLUMN IF NOT EXISTS campaign_objective_id TEXT;
```

No FK on these (TEXT tenancy, same posture as `meeting_booked.enrollment_id`; `campaign_objective` rows are firm-copied by `copySequence`). Nullable — a send outside a sequence (OTP, probe, house form) stamps nothing and is therefore never a completion.

**Who stamps:**

- `cascade.actuateChannelSend` / `enrollAndActuate` / the tick send path already hold `enrollment_id`, `attempt_id`, and (after 010) `enrollment.campaign_id`. Resolve the objective once — `SELECT id FROM campaign_objective WHERE campaign_id = <enrollment.campaign_id>` — and pass all four into `dispatchSend`. `dispatchSend` writes them on the `outbound_messages` INSERT (both email and SMS branches).
- `messaging_events` needs **no** new column: it already joins `outbound_messages` on `message_id`. The click resolves through that join. Do not duplicate the objective onto the event row (one fact, one write).
- Form: the form handed to the contact is the one the objective named. `POST /wire/machine/facts` (`machine.ts` ~418) already accepts `formRef` — persist it, and resolve `campaign_objective_id` from that contact's open enrollment's current campaign when the caller does not pass it.

### 2.2 Match the answer (Local, not any-row)

Replace `campaignObjectiveMet` with a matcher that is the same shape as `triggerLocalAxesMatch`: **test the axes that identify this objective.**

```
objectiveSatisfiedBy(enrollment, objective) =
  EXISTS a row in objective.completion_table where
    contact_id = enrollment.contact_id
    AND firm_id  = enrollment.firm_id
    AND (
      -- preferred: the stamped axis
      campaign_objective_id = objective.id
      -- click resolves through the send
      OR (completion_table = 'messaging_events'
          AND message_id IN (SELECT provider_message_id FROM outbound_messages
                             WHERE campaign_objective_id = objective.id)
          AND event_class IN ('clicked','opened'))   -- kind='click' → 'clicked'
    )
```

Rules the implementer must not soften:

- **No stamp → no match.** An unstamped legacy completion row does **not** satisfy an objective. Fail closed. This is the whole point.
- Fallback for in-flight rows written before this migration: `enrollment_id = enrollment.id` **and** `created_at >= enrollment.enrolled_at`. Never a bare contact match.
- `click` means `event_class = 'clicked'`. `accepted` / `delivered` is not a click. Today’s code accepts any `messaging_events` row — that is wrong and is part of this cut.

### 2.3 The latch is the cursor. **Do not mint a table.**

“Once met, met” needs to fire once. It does **not** need a new store, and a `campaign_objective_met` table would be a second copy of a fact the completion row and the cursor already carry (law 1 · 13:20 one fact, one write).

The latch is **`enrollment.campaign_id`** — the cursor 010 already advances. The transition *is* the endpoint:

- objective satisfied → `advanceEnrollmentCampaign` flips `campaign_id` from X to the next `ord`, or to **NULL** when X was the last campaign.
- The flip is once, by construction. Re-checking a campaign you already left is impossible.
- **NULL = the sequence ended.** That is the flagship “or it ends,” with no new column.

History is an **append**, not a current flag — same grade as `audit_events` on operations:

```
engagement_records (event_kind = 'objective_met', payload = {
  enrollmentId, sequenceId, campaignId, campaignObjectiveId,
  kind, completionTable, completionId, nextCampaignId
})
```

That append is also what finally gives Story 7b’s **`state.finishing_event`** a real runtime write. It has been map-only since the beginning (16:28 named that). Do not add a `finishing_event` table; this append **is** it.

### 2.4 Detect on the write, not only on the tick

This is the founder’s sentence, and it is the part today’s code cannot do at all.

`advanceEnrollmentCampaign` is called **only** from the tick, inside the `active_attempts` loop (`cascade.ts` ~982). So if the contact books or submits **after** the attempts closed, nothing advances. That is precisely the 16:55 walk-break (sequence deployed, criteria spent, objective later met).

**Cut:** on every completion INSERT, do the reverse lookup immediately.

```
onCompletionWrite(firmId, contactId, table, rowId):
  enr = SELECT * FROM enrollment
        WHERE firm_id=$1 AND contact_id=$2 AND campaign_id IS NOT NULL
        ORDER BY enrolled_at DESC          -- one open sequence per contact today
  obj = SELECT * FROM campaign_objective WHERE campaign_id = enr.campaign_id
  if obj.completion_table <> table: return              -- not this objective's answer
  if not objectiveSatisfiedBy(enr, obj): return         -- not stamped for this objective
  append engagement_records 'objective_met'
  advanceEnrollmentCampaign(enr.id)                     -- flips cursor / NULL
  close open active_attempts for enr  (status='met')    -- stop chasing; not 'nullified'
  dispatchEventToWorkflows('objective_met', { ... })    -- 2.5
```

Note the enrollment lookup does **not** filter on how the pursuit is going. An objective met after we stopped spending is a normal win — see 023 §3.3.

Call sites (all already exist, all already dispatch their own event first):

| Where | Existing dispatch | Add |
|---|---|---|
| `machine.ts` facts handler (~464) | `fact_writebacks` | `onCompletionWrite(..., 'fact_writebacks', writeId)` |
| `machine.ts` meetings handler (~1861) | `meeting_booked` | `onCompletionWrite(..., 'meeting_booked', id)` — it already closes attempts; fold that in, do not double-close |
| `webhooks.ts` (~106) after a `clicked` event | none | `onCompletionWrite(..., 'messaging_events', evtId)` |
| `cascade.ts` tick (~982) | — | keep the call; it becomes the catch-up path, not the only path |

The tick call stays so an objective met while offline still advances on the next tick. Both paths are idempotent because the cursor has already moved.

### 2.5 `objective_met` is a dispatchable event — and it closes the flagship

Dispatch it like every other event. Local axis = **the objective** (and its campaign).

```
eventName: "objective_met"
payload: { campaign_objective_id, campaign_id, sequence_id, enrollment_id,
           contact_id, kind, completion_table, completion_id }
contactIds: [contact_id]
```

`triggerLocalRefFromPayload("objective_met")` → `campaign_objective_id`, falling back to `campaign_id`. Register it in `workflowWalk.ts` alongside the existing cases. `workflow_trigger` needs **no** schema change: `type='event'`, `event_name='objective_met'`, `grain='local'`, `local_ref=<objective id>` all already exist (`006` + `012` + `016`).

**This is why the flagship needs no destination table.** 15:43 says the goal is itself an escalation point — to another agent, to another workflow, or it ends. Once objective-met is an event:

| Flagship destination | How it is housed — already |
|---|---|
| **another workflow** | a `workflow` whose trigger is `objective_met`, Local to that objective |
| **another agent** | that workflow’s `action.call_agent` → `enrollAndActuate` (the dual entry that has always existed) |
| **it ends** | no listener, and `enrollment.campaign_id` is NULL. Nothing chases. |

So the answer to “what would have to change in the model” — open since 16:28 — is **no destination column and no `goal` table.** Escalation is a subscription. Story §7 does not need promotion to *house* this; the housing is the event mechanism it already has. What Story would gain is a **must** naming objective-met as a first-class finishing event. That is a wording promotion, not a structural one — and it is not required for this cut to ship.

### 2.6 What the objective is bound to (the authorship half)

Picking the objective on Automations Action · Agents binds **three** things. Only one of them is resolved today.

| Bound to | Where it lives | State |
|---|---|---|
| **The agent** — which sequence pursues it | `action.agent_ref` → `enrollment.sequence_id` | **Resolved.** Works today |
| **The objective row** — what counts as done | `campaign_objective` on the campaign the enrollment lands on (`010`) | **Not resolved.** The Action's `objectiveKind` is never checked against it |
| **The instance** — *which* form / link / calendar is put in front of this contact | form: `mappedSlots.form` → `payload_binding.fieldKeys` (after #108) | **Bound, but has no id**, so nothing can be stamped |

**Decision 1 — the campaign owns the objective; the Action must agree.**

`campaign_objective.kind` is the authority on what completes a campaign. Agents authored it, and Agents stays agnostic of Automations (law 9 recut — do not filter sequences by the radio). The Action does **not** override it and does **not** INSERT it (021 stands).

So the Action's `objectiveKind` is a **declaration that must match**. At Save / walk, resolve the assigned sequence's current campaign objective and compare:

- kinds agree → configured; carry `campaign_objective_id` on `payload_binding`.
- kinds disagree → `configured = false`, honest block (#105: do not silent-success). The operator picked "Submit this form" against a campaign whose objective is a click.
- sequence has no campaign objective → `configured = false`. You cannot pursue what was never named.

Without this, the same enroll can claim two different objectives and §2.2 has no single id to match on.

**Decision 2 — the form instance is the binding, and its id is derived.**

For a `form` objective, Automations supplies the instance (the face law has always been *Automations owns the form*): the bound listing **is** the form. Give it the id A26 already expects — `form_ref` — and derive it. No table, no id column to allocate:

```
form_ref = `form.${enrollment_id}.${campaign_objective_id}`
```

- Minted at enroll, written onto `payload_binding.form_ref`, and stamped on what goes out (§2.1).
- The contact's submission returns it; `fact_writebacks.form_ref` persists it (§2.1); §2.2 matches on it.
- Anyone can recompute it, so it needs no store and cannot drift.

That is the founder's sentence end to end: *this* form, bound to *this* objective for *this* person, submitted, detected, matched back to the sequence. It is also exactly the Local axis `triggerLocalRefFromPayload("fact_writebacks")` already reads (`form_ref`) and that `TRIGGER_SELECT_EVENTS` already offers as **Form submitted → Select form** — a face that works only once this is persisted.

`click` and `meeting` instances stay unbound in this packet: the link is campaign content (Agents), and there is no calendar port. Their objective-level stamp (§2.1) is enough to match. Do not invent a link id or a calendar binding here.

### 2.7 Test contract (017) — same two tables, versioned

Add to `event_write_set` / `event_test_data` (never UPDATE a shipping version; these are new rows at `version = 1`):

```sql
INSERT INTO event_write_set (event_name, version, table_name, ord) VALUES
('objective_met', 1, 'engagement_records', 0),
('objective_met', 1, 'enrollment', 1);
```

One `event_test_data` specimen per kind (form / meeting / click) using existing Harbor practice values — `campaign_objective_id` from the seeded objectives (`obj.optin.day`, `obj.react.meeting`, `obj.optin.window`). Mirror in `src/app/data/eventTestContract.ts`. Do not INSERT from a live fire.

### 2.8 Seeds (data in tables)

`supabase/seeds/` — stamp the existing seeded people so the walk is not empty and so a query returns rows:

- `enr-cedar-1` / `enr-cedar-2` are already on `camp.optin.window`. Stamp their `outbound_messages` / engagement rows with `enrollment_id` + `campaign_id` + `campaign_objective_id = obj.optin.window`.
- One satisfied objective end-to-end: a stamped `fact_writebacks` row for one Harbor contact carrying `campaign_objective_id = obj.optin.day` and `form_ref`, plus the `engagement_records` `objective_met` append and the advanced cursor. Reasonable count. Not a thick fake world.

---

## 3. What this packet does not do

- Does **not** mint `campaign_objective_met`, `goal`, `goal_destination`, `finishing_event`, or an `events` table.
- Does **not** add a column to `messaging_events` (the join answers it).
- Does **not** recut 015, 019, or #108. Does not touch `campaign_objective` DDL (010 stands).
- Does **not** INSERT `campaign_objective` from Automations (021 stands). The Action **binds and must agree**; it does not author (§2.6).
- Does **not** mint a form table, a `form_ref` column on the action, or a link/calendar instance id. `form_ref` is derived (§2.6 decision 2).
- Does **not** require new UI. If the founder later wants **“An objective was met”** on the A26 trigger list (PRIMITIVES already promises it, with Local = this objective / campaign), that is one row in `TRIGGER_SELECT_EVENTS` with an `instance` layer — a line in an existing named list, not a plate. The machine works without it.
- Does **not** decide **failure** (objective never met after the whole campaign). Founder answered that on 2026-08-21 and it is cut separately: [`SYSTEMS-CHANGE-PACKET-023.md`](./SYSTEMS-CHANGE-PACKET-023.md) — failure stops the **outbound** only; the objective stays claimable. **023 depends on this packet**, because detect-on-the-write is what lets attempts close without going deaf. Cut 022 first.

## 4. Migration filename

Next free on `origin/main`. `017` is taken. **#108 lands `018_collectible_fields.sql`** — so this is **`019_objective_local_axis.sql`**. If #108 has not merged when this is cut, this is `018` and #108 rebases. Do not renumber a landed file.

## 5. Verify

`npm run build`. Then, on `/prototype-ant` with the wire up:

1. Enroll a contact on the opt-in sequence. Confirm the send row carries `enrollment_id` / `campaign_id` / `campaign_objective_id`.
2. Submit the form for that contact with that `form_ref`. Confirm: `fact_writebacks` stamped → `engagement_records` `objective_met` appended → `enrollment.campaign_id` moved to `camp.optin.day` → open attempts closed.
2b. On the Action, pick **Submit this form** against a sequence whose current campaign objective is `click`. Confirm the node is **not configured** and says so (§2.6 decision 1).
3. Submit a **second** form for the same contact. Confirm it does **not** re-advance (cursor already moved).
4. Book a meeting for a contact whose current objective is `click`. Confirm **no** advance (wrong completion table).
5. Point a workflow trigger at `objective_met` Local to `obj.optin.day`, Launch it, repeat (2). Confirm that workflow runs — that is the flagship escalation, with no destination column.
