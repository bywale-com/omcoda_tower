# Systems — Add tag ascribe (A35). Do not recut 015. Do not pad A33.

**Seat:** Systems Analyst.  
**When:** 2026-08-20 11:45 UTC.  
**What this is:** answers to PM [`ADD-TAG-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/ADD-TAG-PACKET.md). Shape ascribe. **No tag catalog table.** Face interior already cut on main (PR **#103**). Flag **15:43**.  
**Inventory stays** [`SYSTEMS-IN-APP-ACTION-ASCRIBE.md`](./SYSTEMS-IN-APP-ACTION-ASCRIBE.md) **A33**. This plate is Parameters, not a picker row.

---

## A. Contact (who) + Tag (which)

Live walker `ascribe_tag` (`origin/main`):

| Slot | Live | Packet |
|------|------|--------|
| **Contact** | `mappedSlotWrites(..., "contact")` then `contactIds` / last handle | Occupied chip. **Already.** Empty chip → `N = 0` (017). Do not implicit-book. |
| **Tag** | `data.tag` TEXT → INSERT `contact_tag` | Picker of **which** string to write. Still that column. |

**Tag picker store:** `SELECT DISTINCT tag FROM contact_tag WHERE firm_id=$1` (existing writes). Typed new string is allowed — next INSERT adds it. **Do not mint a tags table.** Visual of Tag = Contacts **Tag** column (`contact_tag`). Do not spec this picker from A34 Audit chips.

`notesFromVerdict`: house leftover. Not A35. Do not build on this interior.

Person-verb: loop unique `contact_id`s on the Contact slot (017). One INSERT per person.

---

## B. Chrome — silent

Type glyphs (every Input tree). A35 color. Green **Action** chip under the title. Kill Kind · In the application strip (⋯ Switch is law 38). No tables.

---

## Do not

Pad A33 from this PNG. Recut 015. Mix A34 into this picker. Mint `tags`.
