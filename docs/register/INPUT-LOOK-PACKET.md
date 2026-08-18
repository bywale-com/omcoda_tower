# Input look packet — A29

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**.  
**When:** Look locked 2026-08-18 22:53. Packet cut 22:56.  
**Plate:** [`A29-variable-chip.png`](./automations-blueprint/A29-variable-chip.png). A23 **left** stays **prior** for stacking law; **A29 is the look**.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Face **law 37 · 40**. Shared pane: [`NODE-INTERIOR.md`](./NODE-INTERIOR.md). How Test *fills* this tree: [`TEST-PACKET.md`](./TEST-PACKET.md).  
**Does not:** plant; recut 015; put Get Parameters on every node; treat A23 lightning-on-text as canon.

---

## Paste — engineer

```text
Read docs/register/NODE-INTERIOR.md first. A29 left is every node’s Input look, not Get-only. Get Parameters (Module / Every firm / Select firm / Firm / Contact) stay Get-only — GET-PACKET.md.

You are building Input + mapping chips on CT Ant Automations. Product face = /prototype-ant. Hub is not the app.

Read docs/register/INPUT-LOOK-PACKET.md. Plate: docs/register/automations-blueprint/A29-variable-chip.png. A23 left is prior.

Copy A29 exactly for the tree and the chips: type control in front of the field name, icons as drawn, drag any row including the top-level node into any open box as its own colored chip (not typed text). A box may hold more than one chip.

Read docs/register/PLATE-READ.md. Do not recut 015. Do not overwrite 15:43.
```

## Paste — Systems Analyst

```text
You are Tower’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Log: docs/register/SYSTEMS-ANALYST-LOG.md. 15:43 stands. Input look is docs/register/INPUT-LOOK-PACKET.md plus law 40. Filling values is docs/register/TEST-PACKET.md — do not collapse those.

Do not mint tables. The tree is law 33 writes nested under prior nodes. Chips are references to those writes (or a field of a write), not a new store.

A. Our system — expressions / lastOutput / cells jsonb: where does a mapped field already live when a node box holds a write from the left? What is silent on Ant?

B. Top-level drag (whole node, whole import_batch) vs a leaf (firm). Same handle, coarser pick. Ascribe. Do not invent a mapping table.

Do not recut 015. Stamp SYSTEMS-ANALYST-LOG.
```

---

## Founder comments (preserve)

- A29 is the look. It **supersedes** the current Input side inside **every** node. Perfect down to the icons, down to the dropdown **in front of the text**.
- Drag **each** entry — **up to the top-level item** — into any box. It looks like its **own separate element** in the box, not text.
- That is A29, those facets. Locked.
- A30: only agree Test **sits** (Save · Test · Launch). Purpose of the rest of A30 was unclear. Filling is [`TEST-PACKET.md`](./TEST-PACKET.md), not another field PNG.

---

## The look that must not get revised away

This is **Input on every node that has Input.** Specimen **A29 left**. Get’s right column is still Get Parameters ([`GET-PACKET.md`](./GET-PACKET.md)).

| Facet | What it is |
|-------|------------|
| **Tree** | Prior nodes in this chain, canvas order, that node’s outputs nested. Contact import example: `import_batch` · `contact_records` (A24 write-set). Fit known writes. Do not freeze extra invented fields. |
| **Row** | Type control **in front of** the name. Icons as drawn. |
| **Schema / Table / JSON** | Same writes, other looks. Search searches. |
| **Drag** | Any row, including the **top-level** node, into **any** open box (Parameters, Outcomes, any variable slot). |
| **Chip** | The mapped item is its **own element**: color, label, origin, remove-x. Not `{{firm}}`. Not A23 lightning on plain text. A box may hold **several** chips. |

---

## Click path

Operator → Configuration libraries → Automations → open a workflow with a prior node → click a downstream node (Get is the PNG) → Input.

1. Left is A29. After Test, the tree has fields **and** values ([`TEST-PACKET.md`](./TEST-PACKET.md)).
2. Drag `firm` (or `import_batch`, or the whole **Contact import** row) into Firm (or any open box).
3. The box shows a chip. Remove with x. Drag another row into the same box → another chip.

---

## 1. Copy

- Modal Get · Contacts as **example**. Tabs Input \| Output. Input on.
- Left: Schema \| Table \| JSON. Search. Nested **Contact import** → `import_batch` (id, filename, row_count, source, firm) · `contact_records` (name, email, firm, id). Type glyph/control **before** each name.
- `firm` highlighted as the row in use.
- Right (this PNG is Get): Module Contacts. Select firm. **Firm** box contains chip `firm` / `import_batch.firm` with x. Contact empty.

## 2. Do not build

- A23 lightning-on-Harbor-RCIC-text as the mapping look. **Prior.**
- Typed `{{ }}` as the face.
- Invented extra import fields (phone, job_title, imported_by, …). Write-set is **A24**.
- Teaching captions.
- Get’s Module cascade on Rule / Trigger / If.
- Desk chrome as this packet (bucket 5).

## 3. Implied

- **Table** and **JSON** work.
- **Search** searches the tree.
- Chip **x** unmaps.
- Drag from Table/JSON as well as Schema — same writes.
- Highlight on the source row when that chip is selected.

## 4. Completes

- **Every node’s Input** is this look. No extra PNG per kind.
- **Several chips** in one box.
- **Top-level** chip (whole node / whole write class).
- Empty tree **before Test** is valid. After Test, fields and values ([`TEST-PACKET.md`](./TEST-PACKET.md)).
- Trigger Input may still be empty (start of chain).

## 5. Out of scope this build

Outside the modal. Canvas Test button is [`TEST-PACKET.md`](./TEST-PACKET.md) / **A30** (buttons only). Get Parameters law remains [`GET-PACKET.md`](./GET-PACKET.md).

---

## Cousin

| Plate | Take | Do not take |
|-------|------|-------------|
| **A23** | Stacking. Get Parameters right. Every firm / Select firm. | Lightning mapping look. Pack-update example tree as schema. |
| **A20 / A24** | Write-set identity. | Output chrome on Input. |
| **A30** | Test sits Save · Test · Launch. | The rest of that PNG. |

---

## Do not

- Plant. Recut 015. Overwrite 15:43.
- Ask the PM to restate this pocket. It is here.
