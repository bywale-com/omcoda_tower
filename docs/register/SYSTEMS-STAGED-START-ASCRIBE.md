# Systems — staged Start / wait-for-approval (ascribe, not a packet)

**Seat:** Systems Analyst.  
**When:** 2026-08-26 10:10 UTC.  
**What this is:** machine ascribe while the founder weighs new node vs embed. **Not an Engineer cut.** Confirm look is still plates-only until they agree.  
**Join:** PM [`LAUNCH-1-NOTHING-TO-OPT-IN.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/LAUNCH-1-NOTHING-TO-OPT-IN.md) · plates [`CONSULTANT-STAGED-PLATES.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/CONSULTANT-STAGED-PLATES.md) · law 41 [`SYSTEMS-IN-APP-ACTION-ASCRIBE.md`](./SYSTEMS-IN-APP-ACTION-ASCRIBE.md) · Form occupancy **021** (same occupancy idea, different write) · Spine Registry §5 handle.  
**Flag:** 15:43 untouched. Do not recut 015. Do not mint a Wait node.

---

## The decision (hard)

**Do not mint a Wait node.** PM §1 already: one canvas cannot be “new contact **and** wait for the consultant.” Waiting is not a walker pause. Canvas A finishes (audit → If `sequence_ready`). The people **sit as rows**. Canvas B starts when the consultant **Start** writes.

That Start is an **operation on the consultant workspace** (a desk button that writes). Automations **consumes** it (law 41). It does not paint a second popover.

Approve now / Approve later is the **same shell**, a **different desk write**, when that module has that button. Not a second graph kind.

---

## Two pieces. Do not collapse them.

| Piece | What it is | Not |
|-------|------------|-----|
| **Pane (the popover + the bar)** | The workspace **displays** writes that already exist. Occupancy, same idea as Form (A31): the listing **is** the interior. | A node that blocks the walk. Hardcoded “24 / Launch window / Click this link” |
| **Operation (Start / Approve / Start now)** | A **write** on that desk. Canvas B’s trigger. In-app Action = wrap that handler when the button exists. | A Wait kind. Teaching copy. |

Chrome that can swap labels (Start · Start later · Start now ↔ Approve · Approve later · Approve now) is **the same occupancy shell**. Silent in the machine except the **verb’s write**.

---

## How the interior knows what to show (replaceable)

Same law as Form occupancy. Do not bake campaign names into the SPA.

| Slot on the glass | Write it unfolds | This slice (§1 Start) |
|-------------------|------------------|------------------------|
| Count / who is staged | Person rows Canvas A already marked ready | `sequence_ready.ready = true` for that consultant’s book (If true on Canvas A). Not the whole book. |
| Sequence preview (campaigns + objectives still obvious) | The sequence **this operation will assign** | §1: opt-in `sequence_template` + its `campaign` / `campaign_objective` children. Not a three-sequence picker. |
| Later / other occupancy | Whatever listing you drop | Same shell; different chip (e.g. a required-data listing, a different sequence). Do not invent a content table. |

The plate’s Harbor / 24 / Launch window / Agree is **example**. Ignore as schema.

**Whose workspace:** the pane lives on the desk of the person who **has the button**. Waiting on the consultant → consultant workspace (T4). Waiting on the contact → contact seat, **if** that seat already has that write-button. Automations does not route a popover to a user. The row is on their book; their desk SELECTs it.

---

## Where it fits on the canvas (existing kinds)

**Canvas A** (already): trigger import **or** new contact → `run_audit` → If `sequence_ready`. Stop. Those writes **are** the staged set. No Wait.

**Canvas B** (already): trigger = consultant Start (the write). Action = `call_agent` / assign existing **opt-in**. Then Agents.

Start later = **schedule** that same Start write (PM: not snooze). Trigger type `schedule` already exists. **Store for the datetime:** silent. Do not mint `approval` / `staged_modal`. Name it when they lock the packet — likely a row on an existing table (enrollment not yet; these people are not enrolled). Until then: specified but not clear.

---

## Specified and clear

- No Wait node.
- Popover interior = occupancy of existing writes (`sequence_ready` people + the sequence Start assigns).
- Start / Approve chrome = one reusable shell; verb = desk write; Automations wraps it.
- Do not hardcode the preview.

## Specified but not clear (do not invent)

- Exact Start `event_name` (manual vs a started INSERT). SA maps when they lock.
- Where Start-later datetime lives.
- Whether Approve is a real desk button anywhere today (in-app inventory has Halt, not Approve). Until the module affords it, Automations cannot consume it (law 41).
- First appearance open vs bar — glass; silent in the machine.

---

## Do not

- Mint `wait` / `approval` / `staged` tables from the plates.
- Recut A40 Form occupancy into Start.
- Recut 015. Packet Confirm until they agree. Overwrite 15:43.
