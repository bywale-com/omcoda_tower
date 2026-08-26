# Systems — staged Start / wait-for-approval (ascribe, not a packet)

**Seat:** Systems Analyst.  
**When:** 2026-08-26 10:21 UTC (function recut). 10:15 = new class. 10:10 = wrong two-canvas.  
**What this is:** machine ascribe. **Not an Engineer cut. Not plates.** Founder: talk function first; plates later.  
**Join:** founder wording this stamp · 017 (Available / N / person-verb vs set-verb) · 015 handle (do not recut) · Form occupancy **021** (interior pattern, not the kind).  
**Flag:** 15:43 untouched.

---

## The decision (hard)

**New node class. Not Action. Not If.**

The canonical graph:

```
Trigger (import | new contact)
  → Audit (that contact)
  → If sequence_ready              // only valids through
  → Wait (approval)                // NEW KIND. Writes occupancy. Walk stops.
  → Call agent (opt-in)            // only after Start / Approve completes this wait
```

That Wait node **is** why the popover/bar exists. The workspace SELECTs the rows **this node wrote**. Start / Approve now / later is the same occupancy shell; the verb completes **this** wait.

PM §1 “no Wait node / two canvases” is **retracted as the machine**. Founder is the instruction source.

---

## Why not embed in Action

Live Action: write, then **follow the outgoing edge in the same visit**. There is no park.

`action.type = await_approval` still requires `visit` to refuse outgoing until a later write. That is a new kind wearing Action’s name. We already refuse that collision (⋯ Switch ≠ Switch).

| Kind now | Visit |
|----------|--------|
| If / Switch | Compare, wires, no occupancy write |
| Get | Read, continue |
| Action | Write, continue |
| Exit | Stop forever |
| **Wait** | Write occupancy, **stop**, resume on the completion write |

`untilNodeId` is Run **up to** a node. It does not resume on Start.

---

## How the popover knows (replaceable)

Occupancy. Same idea as Form — different write.

| Glass | Unfolds |
|-------|---------|
| Count / who | The people on the handle when Wait ran (already If-filtered valids) |
| Preview (campaigns + objectives obvious) | Chip on the Wait node: what they are approving / starting. This slice: the opt-in sequence row + its campaigns. Not hardcoded Launch window / Agree. |
| Now / Later / bar | Chrome of this kind. Labels Start or Approve — same node. Later = **schedule this wait’s completion**. |

Whose desk: configured on the node (consultant vs contact). The pane is on **that** workspace because those rows are for that actor. Not a second kind per desk.

Harbor / 24 / Ana = example. Ignore.

---

## The write (gap)

`sequence_ready` is the **If**. Valid ≠ sitting on the consultant desk. Do not overload `ready`.

No table today for “parked at this Wait.” Without that write the pane is paint. **Named silence:** person-level await row (`contact_id`, this node/run, whose desk). Wait INSERTs it. Desk lists it. Start/Approve **completes** it. That completion INSERT/UPDATE **is** the event; dispatch resumes this run from Wait’s outgoing (person-split: approved people continue; others stay).

Law 41: workspace must have the Now/Later control. Wait produces the listing; the button completes it. Automations does not paint a second modal.

Do not mint the table until they lock a packet.

---

## Specified and clear (10:15)

- New kind on the palette. Graph: audit → If valid → Wait → enroll.
- Popup = pane of **this Wait’s** writes. Interior = occupancy (people + sequence chip).

## Specified but not clear (10:15)

- Await-row table (not `sequence_ready`).
- `workflow_run.status` waiting vs running.
- Start `event_name`.

---

## 2026-08-26 10:21 UTC — Two shapes · grain · coalesce (founder)

**Why we are here:** Founder came to SA with questions. Do not generate plates. Copy the function. Packet pass later reads this section.

### Founder (function, excerpt)

> There needs to be a new node … **Wait**. It has at least two shapes. Wait which is like a duration … There would be no pop-up or popover. It’s literally just a wait node. And then there’s a wait for approval … that’s another of its action types.
>
> Don’t forget we have to work with the exact same primitives … data coming in on the left side … also determined by local versus global … The wait node only runs once. So it takes everything … it’s like a distributor. It doesn’t run for each and every single data point … We should have that choice.
>
> Why: we want to give the consultant some control … start now or start later. Simple as that.
>
> If I upload just one contact … the pop-up shows. If they then upload another five contacts, I don’t want another pop-up below. It should add to that. Six new contacts ready for opt-in. Unless they are different sequences, or a different automation completely that is even queuing these contacts.

### Two shapes of one class

Not two unrelated nodes. One **Wait** kind. Shape is a setting on that node (same way Action has kinds — **except** these are not `action.type`; they share Wait’s visit: write occupancy / park, **stop**, resume on completion).

| Shape | What it does | Desk |
|-------|----------------|------|
| **Duration** | Park until the clock. Then the outgoing edge. | **No popover.** Node on the canvas. Duration in the interior. |
| **Approval** | Park until Start now / Start later (same shell). | Occupancy listing. Count + who + chip of what they are approving (this slice: that opt-in sequence). |

Both write occupancy (so the walker knows who is parked). Only **approval** is a workspace pane. Duration occupancy is the clock, not a consultant listing.

Why approval exists (founder): consultant control — start now or start later. Adoption. One known use case this slice: after If valid, before enroll. Other uses of Wait stay open; do not invent them.

### Primitives (do not invent a third)

Left handle = 017. **Available** = every completed node’s writes this run (`chainWrites`). **N** = last handle / mapped chip. **Local vs Global** = already the node’s scope (this run vs firm). Wait does not get a special Input.

The people who can sit on Wait are whoever the last handle actually is after If `sequence_ready` — already valids only.

### Grain — the question you asked SA

**You do not need a separate discussion.** Here is the ascribe.

017 already has the choice: **person-verb** (loop N) vs **set-verb** (run once over the handle). Wait should have that same setting. Default for **this** use case is set-verb: the node is a distributor. One visit. It takes everyone on the left. It does not fire a popup per contact.

Two layers — do not mix them:

| Layer | What |
|-------|------|
| **Walker grain** | Set-verb = one Wait visit, occupancy for the whole handle. Person-verb = N visits, one occupancy row per person. The **choice** you asked for is this setting. |
| **Desk coalesce** (approval only) | The pane is **not** 1:1 with visits. The workspace groups **open** occupancy rows by **(this workflow, this Wait node, this sequence / chip)**. One pane. Count = people in that group. |

That is why one contact then five more is **one** pane at six — even if the walker ran twice (two imports = two runs hitting the same Wait node). Coalesce is on the **listing**, not on “did the node run once in history.”

**Approval + person-verb** would still list in **one** pane if they share that group key. You still do not get stacked popups. Set-verb is cheaper and matches “distributor.” Lock set-verb as the default for approval in this slice.

**Duration + set-verb:** one clock for the people on that visit’s handle, then all continue. **Duration + person-verb:** each person’s own clock (they did not lock this; named not-clear). Either way: **no popover.**

### Coalesce key (vital — founder)

Same pane, add to the count, when **all** of:

1. Same automation / workflow.
2. Same Wait node.
3. Same sequence (the chip — what they are approving).
4. Occupancy still **open** (nobody hit Start on those rows yet).

**Split to a second pane** when any of: different sequence, different automation/workflow, or the previous occupancy already completed (they Started the first one; five new arrivals are a new listing of five, not mixed with people already walking enroll).

One contact → pane of 1. Five more, same sequence, not yet Started → pane of 6. Different sequence or a different automation queuing them → different pane.

Duration shape never coalesces on the desk. There is no pane.

### Still do not

- Stuff either shape into `action.type`.
- Overload `sequence_ready` as the listing.
- Generate plates this stamp.
- Mint the await-row table until they lock a packet (028-or-next). Packet pass: read **this 10:21 section** first.

---

## Specified and clear (10:21)

- Wait class, two shapes: duration (no pane) · approval (pane).
- Approval use: consultant Start now / later. Graph unchanged.
- Default grain this slice: **set-verb** (distributor). 017 choice still exists on the node.
- Coalesce: same workflow + same Wait node + same sequence + still open → one pane, count accumulates. Else split.

## Specified but not clear (10:21)

- Await-row table columns (group key must be able to SELECT the coalesce).
- Duration: one clock for the batch vs per-person clocks.
- Start-later datetime vs duration-wait (two different clocks? same column?).
- Whether an in-progress Start on *some* people in a group splits the pane (ascribed: completed rows leave; remaining stay).

---

## 2026-08-26 10:15 — New class (kept)

Wait is not Action. Graph: Trigger → Audit → If valid → Wait → enroll. Popup = occupancy of Wait’s writes. 10:10 retracted.

---

## 2026-08-26 10:10 — Wrong pass (kept)

Two canvases, no Wait node, popup as a naked pane of `sequence_ready`. That hides the node the founder put on the graph. Retracted 10:15.

---

## Do not

- Stuff wait into `action.type` and recut Action’s visit.
- Overload `sequence_ready`.
- Recut 015’s handle type. Recut A40 into Start.
- Packet Confirm until they agree. Overwrite 15:43.
