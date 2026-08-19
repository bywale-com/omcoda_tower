# Input look packet — A29

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**.  
**When:** Look locked 2026-08-18 22:53. Packet cut 22:56.  
**Plate:** [`A29-variable-chip.png`](./automations-blueprint/A29-variable-chip.png). A23 **left** stays **prior** for stacking law; **A29 is the look**.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Face **law 37 · 40**. Shared pane: [`NODE-INTERIOR.md`](./NODE-INTERIOR.md). Trigger data that lets you map before Run: [`TEST-PACKET.md`](./TEST-PACKET.md). Run: [`RUN-PACKET.md`](./RUN-PACKET.md). Type glyphs / A35 color: [`ADD-TAG-PACKET.md`](./ADD-TAG-PACKET.md).  
**Does not:** plant; recut 015; put Get Parameters on every node; treat A23 lightning-on-text as canon.

---

## Paste — engineer

```text
Read docs/register/NODE-INTERIOR.md first. A29 left is every node’s Input look, not Get-only. Get Parameters (Module / Every firm / Select firm / Firm / Contact) stay Get-only — GET-PACKET.md.

You are building Input + mapping chips on CT Ant Automations. Product face = /prototype-ant. Hub is not the app.

Read docs/register/INPUT-LOOK-PACKET.md. Plate: docs/register/automations-blueprint/A29-variable-chip.png. A23 left is prior.

Copy A29 for the tree: type control in front of the field name. **Glyphs: A35** ([`ADD-TAG-PACKET.md`](./ADD-TAG-PACKET.md)). Drag any row including the top-level node into any open box. Chip *look* (color, origin, x) is A29. **How the box occupies** when mapped is docs/register/MAPPED-BOX-PACKET.md — empty = picker, mapped = chip fills the box, no leftover Select. Do not ship tags above a still-open dropdown.

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
- 12:17: A35 is great. Prioritize Input **field icons** (more appropriate than live). **Kind · In the application** chips — if no purpose, teaching labels. Green **Action** chip under the title looks great; they do not see it on the app.
- 12:30: they **like** the color in the image. More lively than live. Opposite of “desk color = live.”
- Drag **each** entry — **up to the top-level item** — into any box. It looks like its **own separate element** in the box, not text.
- That is A29, those facets. Locked.
- A30: only agree Test **sits** (Save · Test · Launch). Purpose of the rest of A30 was unclear. Filling is [`TEST-PACKET.md`](./TEST-PACKET.md), not another field PNG.
- 2026-08-19: pull from the left **is the value**, not a suggestion. Live tags-plus-dropdown is wrong. Close Input. Resize the interior modal. [`MAPPED-BOX-PACKET.md`](./MAPPED-BOX-PACKET.md).

---

## The look that must not get revised away

This is **Input on every node that has Input.** Specimen **A29 left**. Get’s right column is still Get Parameters ([`GET-PACKET.md`](./GET-PACKET.md)).

| Facet | What it is |
|-------|------------|
| **Tree** | Prior nodes in this chain, canvas order, that node’s outputs nested. Contact import example: `import_batch` · `contact_records` (A24 write-set). Fit known writes. Do not freeze extra invented fields. |
| **Row** | Type control **in front of** the name. **Glyphs as A35** ([`ADD-TAG-PACKET.md`](./ADD-TAG-PACKET.md)). Still a control, not a caption. |
| **Schema / Table / JSON** | Same writes, other looks. Search searches. |
| **Drag** | Any row, including the **top-level** node, into **any** open box (Parameters, Outcomes, any variable slot). |
| **Chip** | The mapped item is its **own element** **inside the box** — that **is** the value. Empty box = picker. Mapped = no leftover dropdown. **A31**. A pointer at a **table write**, not an n8n in-memory item (law 42). Not tags above a Select. Not `{{firm}}`. Not A23 lightning. A box may hold several chips. |

---

## Click path

Operator → Configuration libraries → Automations → open a workflow with a prior node → click a downstream node (Get is the PNG) → Input.

1. Left is A29. After Test, the tree has fields **and** values ([`TEST-PACKET.md`](./TEST-PACKET.md)).
2. Drag `firm` (or `import_batch`, or the whole **Contact import** row) into Firm (or any open box).
3. The box shows a chip. Remove with x. Drag another row into the same box → another chip.

---

## 1. Copy

- Modal Get · Contacts as **example**. Tabs Input \| Output. Input on.
- Left: Schema \| Table \| JSON. Search. Nested **Contact import** → `import_batch` (id, filename, row_count, source, firm) · `contact_records` (name, email, firm, id). Type glyph/control **before** each name. **Glyph look = A35** (priority over live).
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

Outside the modal. Canvas **Run / Launch** are [`RUN-PACKET.md`](./RUN-PACKET.md). Trigger test-data is [`TEST-PACKET.md`](./TEST-PACKET.md). **A30** Test is prior. Get Parameters law remains [`GET-PACKET.md`](./GET-PACKET.md).

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
