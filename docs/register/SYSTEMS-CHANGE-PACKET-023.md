# Systems — change packet 023 (Failure mode = stop spending, keep listening)

**Seat:** Systems Analyst.
**When:** 2026-08-21 09:50 UTC.
**What this is:** the cut for the failure mode that has been open since 2026-08-15 16:58. Implementer **only implements**.
**Why:** Founder: *“the failure mode is simple — it just means we're not gonna waste resources trying to make that objective happen. But if it happens, if it clears, then of course it's still a win… the objective is met.”*
**Join:** 022 (objective met is a Local event) — **read 022 first; this packet depends on its detect-on-the-write path.** 010 `campaign_failure` · `cascade.ts` ladder · [`SYSTEMS-OBJECTIVE-ESCROW.md`](./SYSTEMS-OBJECTIVE-ESCROW.md) (direction; not built).
**Flag:** 15:43 untouched. Do not recut 015 / 019 / #108.
**UI:** none required.
**Instructions:** founder only.

---

## 1. The law, stated once

Failure is **not** an ending. It is a **spending decision**.

| | Outbound (resources we spend) | Inbound (completion we listen for) |
|---|---|---|
| **Pursuing** | sends, attempts, channel ladder, escalation | listening |
| **Exhausted (failure mode)** | **stops** | **still listening** |
| **Nullified** (escrow era — not this packet) | stopped | **stops. The door refuses.** |

Two lines, not one. Exhaustion closes only the **outbound**. The objective stays claimable: if it clears later on its own, *“it still counts.”* Only **nullification** closes the inbound — and the only thing that nullifies is the firm pulling their money, which is [`SYSTEMS-OBJECTIVE-ESCROW.md`](./SYSTEMS-OBJECTIVE-ESCROW.md) and is **not built now**.

This is why 022 had to come first. Once detection happens **on the completion write** instead of inside the tick's open-attempt loop, closing attempts no longer blinds us. Before 022, "stop spending" and "keep listening" were the same switch. Now they are two.

## 2. The bug this fixes

`cascade.ts` (~533): when the channel ladder has no forward channel (`!toChannel`), it records `campaign_failure` and dispatches the event — then leaves `active_attempts.status = 'open'`.

So the tick picks that attempt up again. And again. Every subsequent due window with no forward channel writes **another** `campaign_failure` row and **re-dispatches** the event. That is:

- exactly the resource waste the founder is describing, and
- a duplicate-event bug — a workflow subscribed to `campaign_failure` fires repeatedly for one failure.

## 3. Hard decisions

### 3.1 Exhaustion is terminal for the attempt

```sql
-- 'exhausted' joins the existing status vocabulary.
-- DO NOT reuse 'nullified' — see 3.4.
UPDATE active_attempts
   SET status = 'exhausted', updated_at = now(),
       state = state || jsonb_build_object('exhausted_at', now()::text,
                                           'campaign_failure_id', $2::text)
 WHERE id = $1 AND status = 'open';
```

Cut in the `!toChannel` branch, immediately after `recordCampaignFailure`, **inside the same transaction as that INSERT** so a failure row can never exist with the attempt still open.

`campaign_failure` stays exactly one row per exhaustion, and `campaign_failure` dispatches exactly once.

The tick already selects `status='open'`, so an exhausted attempt drops out with no change to that query. No sends, no ladder, no escalation. Resources stop.

### 3.2 The pursuit is exhausted, not the enrollment

The attempt is spent; the **objective is not**. Record that on the cursor's pursuit so the desk can say why nothing is moving:

```sql
ALTER TABLE enrollment
  ADD COLUMN IF NOT EXISTS pursuit_state TEXT NOT NULL DEFAULT 'pursuing'
    CHECK (pursuit_state IN ('pursuing', 'exhausted')),
  ADD COLUMN IF NOT EXISTS exhausted_at TIMESTAMPTZ;
```

- Set `pursuit_state='exhausted'`, `exhausted_at=now()` when that enrollment's attempt exhausts.
- **Reset to `'pursuing'`, `exhausted_at=NULL` whenever `advanceEnrollmentCampaign` moves the cursor.** The next campaign is a fresh pursuit.
- `campaign_id` is **not** nulled by exhaustion. Only `advanceEnrollmentCampaign` (met) or the last campaign nulls it. Exhausted-with-a-cursor is the honest state: *we are not spending, we are still listening on this objective.*

Two states only. `met` is not a third — met **is** the cursor advancing (022 §2.3). Do not add it here.

### 3.3 Do not close the door

Explicitly forbidden on exhaustion, because each of these would silently kill the escrow angle:

- Do **not** null `enrollment.campaign_id`.
- Do **not** delete or advance past the `campaign_objective`.
- Do **not** `invalidate` / `consume` any `access_links` row, and do not disable a booking or form door.
- Do **not** unstamp or delete `outbound_messages` / listing rows — 022's stamps are the only evidence that a later completion belongs to this objective.
- Do **not** skip `onCompletionWrite` for an exhausted enrollment. **A completion on an exhausted pursuit is a normal win:** it appends `objective_met`, advances the cursor, and dispatches `objective_met` exactly as if we were still spending.

That last line is the packet. If the implementer gates 022's detection on `pursuit_state='pursuing'`, the whole thing is wrong.

### 3.4 Name collision — do not reuse `nullified`

`active_attempts.status='nullified'` **already exists** and already means *"they responded, stop chasing"*: inbound override (`cascade.ts` ~339, ~971) and meeting booked (`machine.ts` ~1871). That is a **win**, not a failure.

Objective-nullified (the firm withdrew the money; the door now refuses) is a **different fact** and belongs to the escrow era. Do not overload the word, and do not reuse that column for it.

| Word | Means | Where |
|---|---|---|
| `nullified` | they responded — stop chasing, this is a win | `active_attempts.status` today |
| `exhausted` | we stopped spending — still listening | this packet |
| *nullified objective* | money pulled — the door refuses | [`SYSTEMS-OBJECTIVE-ESCROW.md`](./SYSTEMS-OBJECTIVE-ESCROW.md), not built |

### 3.5 Failure does not force another campaign

Standing since 16:58, restated because this is where an implementer would guess: exhaustion does **not** enroll the next class, does **not** clone the campaign, and does **not** auto-ask again. It writes `campaign_failure`, stops spending, and stays put. A workflow may subscribe to `campaign_failure` and do something — that is authored, not automatic.

`campaign_failure` already carries `firm_id`, `contact_id`, `campaign_id`, `sequence_id`, `payload`. That is the campaign/node axis for the effectiveness score. `cohort_tiers` remains the per-contact axis. Neither is minted here.

## 4. Migration filename

Next free on `origin/main` after 022. If 022 cut as `019_objective_local_axis.sql`, this is **`020_pursuit_exhausted.sql`**. Do not renumber a landed file.

## 5. Seeds

One exhausted pursuit among the seeded Harbor people: a `campaign_failure` row, its `active_attempts` row at `status='exhausted'`, and that `enrollment` at `pursuit_state='exhausted'` with the cursor still on its campaign. Reasonable count — one is enough to prove the state.

## 6. Verify

`npm run build`. Then with the wire up:

1. Run a pursuit until the ladder has no forward channel. Confirm **one** `campaign_failure` row, attempt `status='exhausted'`, enrollment `pursuit_state='exhausted'`, `campaign_id` **unchanged**.
2. Tick repeatedly. Confirm **no** second `campaign_failure`, no further sends, no re-dispatch.
3. **The money test:** now submit the stamped form (or book) for that contact. Confirm it still lands — `objective_met` appended, cursor advanced, `objective_met` dispatched, `pursuit_state` back to `'pursuing'` on the new campaign. *Failure did not cost us the win.*
4. Confirm a workflow subscribed to `campaign_failure` fired exactly once in step 1.
