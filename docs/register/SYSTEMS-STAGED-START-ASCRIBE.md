# Systems — staged Start / wait-for-approval (ascribe, not a packet)

**Seat:** Systems Analyst.  
**When:** 2026-08-26 10:15 UTC (recut). 10:10 below is the wrong two-canvas pass.  
**What this is:** machine ascribe. **Not an Engineer cut.** Plates still lock with the founder.  
**Join:** founder graph (this stamp) · plates [`CONSULTANT-STAGED-PLATES.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/CONSULTANT-STAGED-PLATES.md) · Form occupancy **021** (interior, not the kind) · law 41 (desk button completes) · Spine handle **015** (do not recut into a second walker).  
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

## Specified and clear

- New kind on the palette.
- Graph: audit → If valid → Wait → enroll.
- Popup = pane of Wait’s writes.
- Interior = occupancy (people + chip).

## Specified but not clear

- Await-row table (not `sequence_ready`).
- `workflow_run.status` waiting vs running.
- Start `event_name`.

---

## 2026-08-26 10:10 — Wrong pass (kept)

Two canvases, no Wait node, popup as a naked pane of `sequence_ready`. That hides the node the founder put on the graph. Retracted 10:15.

---

## Do not

- Stuff wait into `action.type` and recut Action’s visit.
- Overload `sequence_ready`.
- Recut 015’s handle type. Recut A40 into Start.
- Packet Confirm until they agree. Overwrite 15:43.
