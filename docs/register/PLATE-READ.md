# How to read a plate when we build

**Seat:** Product Manager.  
**Why:** Founder 2026-08-18 17:56. Once a pocket is locked, read the image for what we **did not say** but the build still has to do — and for what is **in the picture but out of this build**. Specimen: Get [`GET-PACKET.md`](./GET-PACKET.md) / **A23**.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite.  
**With:** [`IMAGE-CAPTION-AUDIT.md`](./IMAGE-CAPTION-AUDIT.md) says what a mark *is* (spec / example name / caption). [`PLATE-CHROME-RULE.md`](./PLATE-CHROME-RULE.md) locks desk chrome when generating. **This file says what the engineer does with a locked pocket.**

Do not invent a thirteenth bucket. These five are the read.

---

## Five buckets

The plate is one state of one example. Literal reading misses the product.

| Bucket | What it is | What you do |
|--------|------------|-------------|
| **1. Copy** | Inside **this** modal / node. We talked about it. It is on the glass. | Build it. |
| **2. Do not build** | On the glass. Example furniture, teaching caption, remnant of a dead revision, stale nest. | Do not freeze it as the system. |
| **3. Implied** | A **control** is on the glass. We never discussed it. It still has to **work**. | Build the function. Same data, that control. |
| **4. Completes** | Not this state of the PNG. The module is unfinished without it. | Build it. No extra PNG. |
| **5. Out of scope this build** | On the PNG, **outside this modal**. Sider, catalog, Launch, other nodes. | Do not rebuild the desk from this packet. Chrome stays. This pocket is the modal (or the canvas idea named in the packet). |

Caption audit **C** (teaching sentence) is always bucket 2. Caption audit **E** (example name) is bucket 2 unless the packet says the name is the product. Caption audit **S** still splits across 1 / 3 / 5 — a real control outside the modal is 5 for *this* build.

**Field chips (law 44 · 45):** pills on a Contacts row **are that column**. **A34** is the **Audit** field — composite, hardcoded when audit runs, not an Action. Packet [`AUDIT-FIELD-PACKET.md`](./AUDIT-FIELD-PACKET.md). Live **Tag** is a different column. Leave it. Do not spec Tag from A34.

---

## Implied (bucket 3) — how you catch it

If the plate shows a segmented control, a search field, a second tab, a closed dropdown — and we only talked about the state that is **open** — the other states and the control’s function are implied.

Get **A23** specimen:

| On the glass | We showed | Still build |
|--------------|-----------|-------------|
| Schema · Table · JSON | Schema | Table and JSON are the same stacked writes, other looks |
| Search | The bar | It **searches** that tree |
| Input \| Output | Input | Output exists (packet: A20 shape) |
| Contact closed | Placeholder | Open it: the list. Default: **all selected** |

Do not treat a closed control as “does not exist.” Do not treat a selected segment as “the other segments are decoration.”

---

## Completes (bucket 4) — how you catch it

If the shape has two values and the PNG shows one, the other value is the rest of the module.

Get specimen: **Every firm** is in the open dropdown. The PNG is **Select firm**. Both states. **Module** is Contacts; changing it restamps the three levels. **Select a firm** (from the left or from the list) → all that firm’s contacts are selected; deselect all to pick a few.

Trigger specimen (**A26**): PNG is **Global**. **Local** is nested dropdowns of that event’s existing shape. No extra plate. [`TRIGGER-SELECT-PACKET.md`](./TRIGGER-SELECT-PACKET.md).

No extra plate. Completes the module.

---

## Out of scope (bucket 5)

Everything on A23 **outside the Get modal** is out of scope for the Get interior build: House-global sider, catalog, Save / Launch workflow, the canvas behind except as **A22** names it.

A22’s pocket is the canvas (palette + chain). A23’s pocket is the modal. Do not mix.

---

## Packet rule

When we lock a pocket, the packet fills buckets 1–5 **in that order**. Founder comments stay in the packet. Do not wait for a second chat to notice Search, Table, JSON, or the other value of a dropdown.

**Shared vs kind:** [`NODE-INTERIOR.md`](./NODE-INTERIOR.md). A control drawn on Get’s left is still Input on Rule. A control drawn on Get’s right is Get Parameters.
