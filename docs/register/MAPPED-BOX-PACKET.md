# Mapped box packet — A31 value in the box · A32 close Input / resize

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**. One pocket. Do not lose this.  
**When:** Cut 2026-08-19 07:55. Strengthened twice the same morning: the **two images are the specimen for the ideas**; **background / sider / extra chrome on those PNGs is not the desk.**  
**Plates (open these; the interiors are strong):** [`A31-mapped-box-is-the-value.png`](./automations-blueprint/A31-mapped-box-is-the-value.png) · [`A32-close-input-resize-modal.png`](./automations-blueprint/A32-close-input-resize-modal.png).  
**Desk (the current design system — not those PNG backgrounds):** live `/prototype-ant` · [`A22-get-canvas.png`](./automations-blueprint/A22-get-canvas.png) · [`A23-get-input-parameters.png`](./automations-blueprint/A23-get-input-parameters.png) · [`A29-variable-chip.png`](./automations-blueprint/A29-variable-chip.png). Rule: [`PLATE-CHROME-RULE.md`](./PLATE-CHROME-RULE.md).  
**Input tree look:** [`INPUT-LOOK-PACKET.md`](./INPUT-LOOK-PACKET.md) **A29**. This packet is **what the parameter box does** when you drop, plus **close Input** and **resize the interior**.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Face **law 40**.  
**Does not:** plant; recut 015; mint tables; rebuild House-global from A31/A32.

---

## Do not miss

**These two images are strong. The ideas on them must not be missed.** Open the PNGs. Copy the interiors named below. The rest of each file is far off the current design system — ignore it.

| File | Look at this (the product) | Do not look at this (not the desk) |
|------|----------------------------|------------------------------------|
| **A31** | Inside the modal: **Firm** is a purple chip filling the field, **no chevron**. **Contact** is still an empty dropdown **with** a chevron. That contrast **is** the packet. | Everything behind the modal: sider, catalog, top bar, invented labels. Extra Input fields (`created_at`, `updated_at`, …). Chip origin copy is furniture; A29 + A24 own the tree. |
| **A32** | Inside the modal: **Input closed** to a slim vertical **Input** rail with a chevron to reopen. Parameters take the width. **Resize grip** on the **bottom-right of that modal**. | Same: sider / catalog / top bar. A “bug” icon. A wire from a tiny canvas card into the modal. Extra tabs. Resizing anything on the canvas. |

If you ship tags sitting on a still-open dropdown, you missed A31. If Input cannot close, or the canvas node resizes instead of the interior, you missed A32. If you rebuild Automations to look like those backgrounds, you missed the packet.

Live already missed A31. `GetParametersPane` `ChipBox` paints `Tag closable` **then still renders the Select**. Tags above, dropdown still there. Kill that pattern on **every** box that accepts a left-side write, not Get Firm only.

---

## Paste — engineer

```text
Read docs/register/MAPPED-BOX-PACKET.md ALL THE WAY THROUGH before touching ChipBox, GetParametersPane, NodeInteriorModal, or any parameter box that accepts a drag from Input.

Open the two plates. They are the specimen for the ideas. Do not miss them:

  docs/register/automations-blueprint/A31-mapped-box-is-the-value.png
  docs/register/automations-blueprint/A32-close-input-resize-modal.png

A31 — look ONLY at the modal interior: Firm = chip filling the field, NO chevron. Contact = empty picker WITH chevron. That contrast is the product.

A32 — look ONLY at the modal interior: Input collapsed to a slim “Input” rail + chevron to reopen. Resize grip on that modal (bottom-right). Not the canvas node.

Do NOT copy A31/A32 background, sider, catalog, top bar, invented fields, or any chrome outside the modal. Product face = /prototype-ant. Hub is not the app. Desk chrome = live Ant + A22 / A23 / A29.

Three facts. Do not miss them:

1. Mapped chip IS the box. Empty = Ant Select / combobox with chevron. After a drop from Input: the chip occupies that same control. No leftover Select. No chevron. No dashed wrapper with tags stacked above children. X on the chip restores the empty picker. Several chips = all inside that same box, still no picker until empty.

2. Input column can close. Slim “Input” rail + chevron reopens it. Closed ≠ gone. Every node interior that has Input.

3. The click-into-node modal is resizable (corner grip). Not the node on the canvas.

Live bug to delete: GetParametersPane ChipBox — if chips.length, Tags, then {children} (the Select). Wrong.

Read docs/register/INPUT-LOOK-PACKET.md for the tree and the chip *look* (color, origin, x). This file is occupancy of the box.

Get Parameters cascade (Module / Every / Select / Firm / Contact) is still GET-PACKET.md. Mapping into Firm/Contact follows THIS file.

Read docs/register/PLATE-READ.md. Do not recut 015. Do not overwrite 15:43.
```

## Paste — Systems Analyst

```text
You are Tower’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Log: docs/register/SYSTEMS-ANALYST-LOG.md. 15:43 stands. Mapped-box face is docs/register/MAPPED-BOX-PACKET.md plus law 40.

A31 and A32 interiors are the specimen. Chrome behind those modals is not a system. Do not ascribe sider labels or invented fields.

Do not mint tables. mappedSlots already sits beside getClass1 on Get. That split is the live smell: chip AND select at once.

A. When the box is mapped from the left, the mapped chip is the source for that slot. Is getClass1 then ignored, replaced, or duplicated? Smallest change so there is one source. Do not invent a second store.

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
- 07:49: write a **strong** packet. Background and other things on these two images are **pretty far off** the current design system. Trust the packet for what matters. The **two images are very strong** on those ideas — **should not miss them.**

---

## Chrome: current design system vs these two files

[`PLATE-CHROME-RULE.md`](./PLATE-CHROME-RULE.md) still stands. A31 / A32 **failed the chrome rule**. They did **not** fail as idea plates.

| On A31 / A32 | What you do |
|--------------|-------------|
| House-global / Libraries / catalog / top bar / canvas behind | **Ignore.** Build the live `/prototype-ant` desk. Specimen: **A22 · A23 · A29**. |
| Invented sider copy, “bug” icons, wires from a canvas card into the modal | **Do not build.** |
| Extra import fields a generator added (`created_at`, `updated_at`, …) | **Do not freeze.** Write-set is **A24**: `import_batch` (id, filename, row_count, source, firm) · `contact_records` (name, email, firm, id). Tree look is **A29**. |
| A31 **Firm chip inside the field, no chevron** vs **Contact still a dropdown** | **Copy. Do not miss.** |
| A32 **Input rail + reopen chevron** and **resize grip on the modal** | **Copy. Do not miss.** |

If an implementer “matches the screenshot” and rebuilds the shell, they failed this packet. If they skip the interiors because the backgrounds look wrong, they also failed this packet.

---

## Live (so the engineer cannot miss it)

File (on main): `src/app/register/prototype-ant/operator/automationPlates/GetParametersPane.tsx` — function `ChipBox`.

What it does today:

1. Outer dashed wrap.
2. If there are chips: a flex row of Ant `Tag closable` **above**.
3. Then **always** `{children}` — the `Select` (Firm) or the Contact button.

So the operator sees: tags that are not the field, **and** a working dropdown. Founder: that does not make sense. A drop is **the value it is going to use**.

**Delete that composition.** One surface per slot:

```
empty  →  Select / combobox (chevron, placeholder)
mapped →  same outer field, chip(s) inside, no Select, no chevron
clear  →  empty again
```

Same occupancy on **every** parameter / outcome / condition box that accepts `HANDLE_CHIP_MIME` (or whatever the Input drag uses). Not a Get-only wrapper.

---

## The box (must not get revised away)

| State | What the box is |
|-------|-----------------|
| **Empty** | The picker. Dropdown / combobox. Chevron. Placeholder (Select firm, Select contact). |
| **Mapped from the left** | The chip **is** the value. **Same** outer box as the Select (height, border, radius — Ant field, not a tag in the margin). Chip inside (color, label, origin, x — **A29** chip language). **No chevron. No leftover Select.** |
| **Several chips** | All **inside** that box. Still no picker until the box is empty. |
| **Picked from the list, no drag** | Still valid. Then it looks like a **filled Select** (the record’s name), not a chip — unless they dropped. Two ways to fill; **one** value-surface. Never tags riding on a still-open dropdown. |

**Still pickers (not mapped slots):** Module. Every firm / Select firm. Those stay dropdowns.

**Mapped slots (this packet):** Firm. Contact. Any other box that accepts a left-side write (Rule Outcomes fields, If left/right, Action parameters, …).

Get cascade law is unchanged ([`GET-PACKET.md`](./GET-PACKET.md)): Every firm hides Firm/Contact. Select firm shows them. Select a firm (from the **list** or from a **drop**) → all that firm’s contacts selected; deselect all to pick a few. The drop does not invent a new cascade. It **fills** the cascade box.

---

## Click path

Operator → Configuration libraries → Automations → open a workflow → click Get (or any node with a mappable box). Desk looks like **A22**, not A31’s background.

1. Empty Firm = dropdown.
2. Drag `firm` from Input (A29 tree) into Firm → **A31 occupancy**: chip in the field, Contact still a dropdown.
3. X on the chip → Firm is a dropdown again.
4. Collapse Input → **A32** rail. Parameters use the width. Chevron reopens Input.
5. Drag the **modal** corner → it resizes. The canvas Get node does not.

---

## A31 — 1. Copy

- **Occupancy contrast only.** Firm: chip in the field, **no** chevron. Contact: empty dropdown **with** chevron.
- Chip language from **A29**: own element, color, origin (`import_batch.firm` is example furniture), x to remove.
- Input tree from **A29** / A24 write-set — not from A31’s extra fields.

## A31 — 2. Do not build

- Tags **above** a still-open Select. Live ChipBox. **Dead.**
- Dashed extra wrapper as the face.
- Teaching captions.
- A31 sider / catalog / top bar / invented `created_at`.
- Typed `{{firm}}`. A23 lightning-on-text (prior).

## A31 — 3. Implied

- Drop another chip onto a filled box → several, still inside, still no picker.
- Delete / Backspace on a selected chip = x.
- Focus ring on the filled box is the field’s focus, not a tag’s.

## A31 — 4. Completes

- Every mapped slot on every kind. No extra PNG per node.
- List-picked value (no drag) still a normal filled Select.

## A31 — 5. Out of scope this build

Everything **outside the Firm/Contact (mapped slot) behavior**: whole desk, Launch, Test doors ([`TEST-PACKET.md`](./TEST-PACKET.md)), Get Module / Every-Select (those stay GET-PACKET).

---

## A32 — 1. Copy

- Input column **closed**. Slim vertical **Input** rail. Chevron **reopens**.
- Parameters use the freed width.
- Interior modal **resize grip**, bottom-right of **that** modal.

## A32 — 2. Do not build

- Removing Input. Closed ≠ gone.
- Resizing the **canvas** node.
- A32 sider / “bug” icon / wire from a mini node into the modal.
- A Test tab. Extra Parameters / Mapping / Advanced tabs.

## A32 — 3. Implied

- Reopen Input = **A29** tree, same data.
- Resize while the modal is open. Do not mint a saved-size table. If the live Modal already has a width, keep using it and make it user-resizable.

## A32 — 4. Completes

- Every node interior that has Input (`NodeInteriorModal` and cousins), not Get-only.

## A32 — 5. Out of scope this build

Desk. A31 chip occupancy. Output tab.

---

## Cousin plates

| Plate | Take | Do not take onto this pocket |
|-------|------|------------------------------|
| **A29** | Tree. Type control in front of the field name. Chip *look*. | Occupancy of the box if it still reads as tag-on-select. That’s **A31**. |
| **A23** | Get Parameters cascade. Combobox + input. | Lightning mapping. |
| **A22** | Desk + canvas chrome. | — |
| **A30** | Save · Test · Launch **buttons only**. | The rest of that PNG. |

---

## Live vs this packet

| Live today | This packet |
|------------|-------------|
| `ChipBox` = Tags + `{children}` Select | One surface: picker **or** chips in the field |
| Dashed drop wrap | Drop target **is** the field |
| `mappedSlots` plus `getClass1` both live | One source for the slot (SA ascribes; UI shows one) |
| Fixed-width `NodeInteriorModal` | Resizable. Input collapsible |

---

## Do not

- Skip the two images because the backgrounds look wrong. The interiors are the specimen.
- Plant `AntAutomationWorkbench` from A31/A32 chrome.
- Recut 015. Overwrite 15:43.
- Ship tags-plus-dropdown because “the PNG had a pill.” The pill **replaces** the picker.
- Ask the PM to restate this pocket. It is here.
