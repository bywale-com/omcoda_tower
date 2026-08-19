# Mapped box packet — A31 value in the box · A32 close Input / resize

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**.  
**When:** 2026-08-19 07:55. Last implementation looked good except this.  
**Plates:** [`A31-mapped-box-is-the-value.png`](./automations-blueprint/A31-mapped-box-is-the-value.png) · [`A32-close-input-resize-modal.png`](./automations-blueprint/A32-close-input-resize-modal.png).  
**Allude:** [`INPUT-LOOK-PACKET.md`](./INPUT-LOOK-PACKET.md) **A29** (tree + chip). This packet is what happens **to the box**.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Face **law 40**.  
**Does not:** plant; recut 015; mint tables; treat A30 chrome as canon.

---

## Paste — engineer

```text
Read docs/register/MAPPED-BOX-PACKET.md. Plates A31 and A32. Product face = /prototype-ant. Hub is not the app.

Live bug (Ant GetParametersPane ChipBox): mapped chips render as Tags ABOVE the Select; the dropdown stays. Wrong. A drop from the left is THE value of that box, not a suggestion. Empty = picker (chevron). Mapped = chip fills the box; no leftover dropdown. X on the chip returns the empty picker.

Same for every parameter box that accepts a left-side write, not Get-only.

Input column can close (slim rail to reopen). The interior modal is resizable. Not the canvas node.

Read docs/register/PLATE-READ.md. Do not recut 015. Do not overwrite 15:43.
```

## Paste — Systems Analyst

```text
You are Tower’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Log: docs/register/SYSTEMS-ANALYST-LOG.md. 15:43 stands. Mapped-box face is docs/register/MAPPED-BOX-PACKET.md plus law 40.

Do not mint tables. mappedSlots already houses chips beside getClass1 on Get. That split is the live smell: chip AND select at once.

A. When a box is mapped from the left, is getClass1 / the picker value ignored? Should the mapped chip be the only source for that slot? Short. Do not invent a second store.

B. Close-Input and resize are chrome. Silent in the machine. Stamp that.

Do not recut 015. Stamp SYSTEMS-ANALYST-LOG.
```

---

## Founder comments (preserve)

- Last implementation came out well. Then this: when you pull from the left into a parameter box it should **be that thing**. Not a suggestion.
- Live: it does not stay inside the box. It looks like a **tag** with X. The **dropdown of the box is still available**. That does not make sense.
- Close the **Input** side. Some nodes need the width.
- The interior modal (click into the node) should be **resizable**. Not the canvas node.
- Packet this, then move on.

---

## Live (so the engineer cannot miss it)

`GetParametersPane` `ChipBox`: dashed wrap; if chips.length, paint `Tag closable` **then still render `children`** (the Select / Contact button). So: tags above, picker still there.

That is the problem. Do not keep ChipBox as tags-plus-select.

---

## The box

| State | What the box is |
|-------|-----------------|
| **Empty** | The picker. Dropdown / combobox. Chevron. Placeholder (Select firm, Select contact). |
| **Mapped from the left** | The chip **is** the value. Same outer box. Chip inside. **No chevron. No leftover Select.** X clears → empty picker again. |
| **Several chips** | All **inside** that box. Still no picker until the box is empty. |

Module / Every-vs-Select stay pickers — those are not mapped slots. Firm / Contact (and any other box that accepts a left write) are.

Picking from the dropdown (no drag) is still valid: then the box shows that **selected record** as the value, same as a filled Select today. Drag from the left is the other way to fill. Either way: one value-surface, not tags riding on a still-open dropdown.

---

## Click path

Open Get (or any node with a parameter box) after Test.

1. Empty Firm = dropdown.
2. Drag `firm` from Input into Firm → **A31**. Chip in the box. Contact still a dropdown.
3. X on the chip → Firm is a dropdown again.
4. Collapse Input → **A32** rail. Drag the modal corner → it resizes.

---

## A31 — 1. Copy

- Get · Contacts. Input tree (A29 look).
- **Firm** box: chip `firm` / `import_batch.firm` with x **inside** the field. No chevron.
- **Contact**: empty dropdown with chevron (contrast).

## A31 — 2. Do not build

- Tags **above** a still-open Select. Live ChipBox. Dead.
- Dashed extra wrapper as the product.
- Teaching captions.
- Invented extra import fields (`created_at` if a generator added them). Write-set remains A24.
- Desk chrome drift. Trust Firm vs Contact.

## A31 — 3. Implied

- Hover/focus the filled box still lets you **drop another** chip into it (several).
- Keyboard: Delete/Backspace on a selected chip clears, same as x.

## A31 — 4. Completes

- Every mapped slot, every kind — not Get Firm only.
- Dropdown-picked value (no drag) still fills the same box as a normal Select value.

## A31 — 5. Out of scope

Canvas. Launch. Test fill doors ([`TEST-PACKET.md`](./TEST-PACKET.md)).

---

## A32 — 1. Copy

- Input column **closed**. Slim **Input** rail + chevron to reopen.
- Parameters use the width.
- Interior modal **resize grip** (bottom-right). Not the canvas node.

## A32 — 2. Do not build

- Removing Input. Closed ≠ gone.
- Resizing the **canvas** node.
- Rest of generated chrome (sider labels). Trust rail + grip.

## A32 — 3. Implied

- Reopen Input = A29 tree again.
- Resize persists while the modal is open. Do not invent a saved size store unless one already exists.

## A32 — 4. Completes

- Every node interior that has Input, not Get-only.

## A32 — 5. Out of scope

Desk. A31 chip fill.

---

## Do not

- Plant. Recut 015. Overwrite 15:43.
- Ship tags-plus-dropdown. Ask the PM to restate this pocket.
