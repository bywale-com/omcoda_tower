# If / Switch packet — two kinds. Four plates. Paths are wires.

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**. One pocket.  
**When:** Founder 2026-08-20 10:46. Plates 10:52. If interior revise 11:00. Packet same.  
**Plates:**  
- Canvas **If** (two doors): [`A36-if-canvas-true-false.png`](./automations-blueprint/A36-if-canvas-true-false.png)  
- Canvas **Switch** (many paths): [`A37-switch-canvas-paths.png`](./automations-blueprint/A37-switch-canvas-paths.png)  
- Interior **If:** [`A38-if-interior.png`](./automations-blueprint/A38-if-interior.png)  
- Interior **Switch:** [`A39-switch-interior.png`](./automations-blueprint/A39-switch-interior.png)  
**Prior:** [`A16-if-previous-result.png`](./automations-blueprint/A16-if-previous-result.png) — first If. Then/Else radios and teaching captions are **not** this build.  
**Shared:** Input [`INPUT-LOOK-PACKET.md`](./INPUT-LOOK-PACKET.md) **A29** / **A35** glyphs. Occupancy [`MAPPED-BOX-PACKET.md`](./MAPPED-BOX-PACKET.md) **A31**. Color / kind chip under title: [`ADD-TAG-PACKET.md`](./ADD-TAG-PACKET.md) **A35**.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Face **law 26 · 40 · 46**.  
**Does not:** plant; recut 015; collapse with Rule conditions; mix **⋯ Switch** (change kind, law 38) with the **Switch node**; put Then/Else radios in the modal.

---

## Do not miss

| Look at this (the product) | Do not look at this |
|----------------------------|---------------------|
| **A36:** If has **two wires** — true / false | A15 / A16 linear chain. Live IfPlateModal |
| **A37:** Switch has **many wires**. **+ Add path** adds a wire | Next-node titles on A37 (“Mark as reachable”) — examples |
| **A38 / A39:** drag from the left **into** the box. Chip **is** the box. Operator. Value. **A38: True is the mode.** Craft the argument. Anything else is false. | Then / Else radios. A False form. “This is not a rule.” Kind chip strip |
| Orange **If** / **Switch** chip **under the title** (A35 placement) | Teaching captions |
| Paths live on the **canvas** | Picking the next Action inside the modal |

If the If node is still one wire down, you missed A36. If Switch cannot add a path that becomes a wire, you missed A37. If the interior still has Then/Else radios, you missed A38. If left→right drag is missing, you missed law 40.

**Name collision:** **⋯ Switch** = change this node’s kind. **Switch** (palette / this packet) = the many-path node. Do not mix them.

---

## Paste — engineer

```text
Read docs/register/IF-SWITCH-PACKET.md ALL THE WAY THROUGH. Then INPUT-LOOK-PACKET.md, MAPPED-BOX-PACKET.md, ADD-TAG-PACKET.md (glyphs, color, kind chip under title), PLATE-READ.md.

You are building If and Switch on CT Ant Automations. Product face = /prototype-ant. Hub is not the app. Do not recut 015. Do not overwrite 15:43. Do not plant.

Two node kinds. Both. If = one split, two wires (true / false). Switch = add paths; each path is a wire. To do what one Switch does you need at least two Ifs. When there is only one separation, If is the choice — both are still the choice in that scenario.

Open:
- docs/register/automations-blueprint/A36-if-canvas-true-false.png
- docs/register/automations-blueprint/A37-switch-canvas-paths.png
- docs/register/automations-blueprint/A38-if-interior.png
- docs/register/automations-blueprint/A39-switch-interior.png

Canvas: wires ARE the paths. If: true and false leaving the node. Switch: multiple paths extending away; + Add path adds a wire underneath. A16 Then/Else radios inside the modal — do not build.

Interior If (A38): **True is the default mode.** Space to craft the argument (chip · operator · value, AND, add condition). Do not configure False in the node. Anything other than that argument is the false wire on the canvas. Interior Switch (A39): rows of paths. Kind chip under the title (orange If / Switch). No Kind · In the application strip. Color as A35. Type glyphs as A35.

Palette and wire +: If and Switch are both kinds (with Get · Rule · Action · Exit). No Trigger on the wire. ⋯ Switch still means change kind — different word from the Switch node.

A16 is prior. Do not freeze live IfPlateModal (table names, eq, teaching footer).

Read docs/register/PLATE-READ.md. Do not recut 015.
```

## Paste — Systems Analyst

```text
You are Tower’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Log: docs/register/SYSTEMS-ANALYST-LOG.md. 15:43 stands. If / Switch face is docs/register/IF-SWITCH-PACKET.md plus A36–A39. Law 46. Do not recut 015.

Do not mint a new graph store from the PNGs. Hub already has branch / if.

A. Two kinds vs one branchKind: if. Name the gap. Switch = N exits + fallback. If = two exits. Smallest existing walk. Silent if silent.

B. Paths are wires, not modal radios. If interior: true is the default mode; the argument is what you write; anything else is the false wire. Do not ascribe a False form. Walk today: pickTable / pickField / pickOp / pickValue plus ifThen / ifElse strings. Name that gap.

C. Drag-from-left is law 40 — already the handle. Condition reads a write already on the left. Name how If/Switch pick that write. Stamp SYSTEMS-ANALYST-LOG.
```

---

## Founder comments (preserve)

- List for today so nothing is forgotten. First issue: forgotten. Second: Test and Run — they will check Run; Run **literally means the automation runs**. Also: a way to see if it worked (backend, that person’s workspace). **Notification / login system** when table writes happen — not a replacement for the writes. Think later.
- Uses for **both** If and Switch. One Switch = at least two Ifs. Only one separation → If is the choice; both are the choice in that scenario. Both well built.
- Live If / Switch do not work like this yet. Primitive: drag left → right is **universal**. Then a figure, then it runs. Simplest node. Not that difficult.
- Switch: **add more paths** = wires showing underneath.
- Four mocks: If canvas (true/false), Switch canvas (multiple paths extending away), If interior, Switch interior.
- **11:00:** one revision to If interior. **Truth is the default mode** so there is space to craft the argument. Anything other than the argument stated in the node is false. (n8n If Parameters.)

---

## Law (plain)

**If and Switch are two node kinds.** Same interior primitive: drag from the left into the box. If = two wires (true / false). Switch = many wires; **+ Add path** adds one. The paths are on the canvas, not radios in the modal.

**If interior:** **True is the default mode.** Space to craft the argument. Anything other than that argument is false. Do not configure False in the node.

---

## Click path

Operator → Configuration libraries → Automations → open a workflow → palette or wire **+** → **If** or **Switch**. Click the node = configure (interior). Wires leaving the node are the paths.

---

## 1. Copy

**Canvas If (A36):** two outputs, labeled true / false. Two wires.

**Canvas Switch (A37):** several outputs. **+ Add path**. Each path is a wire extending away.

**Interior If (A38):** True is the mode. Craft the argument. Occupied chip · operator · value. AND. Add condition. No False form.

**Interior Switch (A39):** one row per path + fallback + Add path. Orange If / Switch chip under the title. Glyphs and color as A35.

**Palette / A28:** If and Switch both listed.

## 2. Do not build

- A False form / False tab / configuring the other wire inside If.
- Then / Else radios that pick the next Action (**A16**).
- Teaching: “This is not a rule.” Kind · In the application strip.
- Live IfPlateModal table-name picker as the face.
- Mixing **⋯ Switch** with the Switch node.
- Freezing A37’s example Action titles (“Mark as reachable”).
- A39 inventing `audit_result` as a table — left tree is the real audit writes (`sequence_ready`, `reachability_verdicts`, `audit_runs`).
- Fallback as `= fallback`. Fallback is the unmatched path.
- Recut 015. Notification system (parked).

## 3. Implied

- Empty box = picker. Occupied = chip is the box (A31).
- Output tab exists (A20).
- Close Input / resize (A32).
- Switch: remove a path removes that wire.
- If: only two exits. No + Add path on If.

## 4. Completes

- Wire **+** and palette include **Switch**, not only Condition (If).
- Kind chip under every node title (If orange, Switch amber) — A35 specimen was Action green.
- Type glyphs on this Input tree.

## 5. Out of scope this build

Rule interior conditions (law 26). A33. Audit field packet (A34) except as writes on the left. Test/Run/Launch (already packed). Notification system. Recut 015. Desk sider if a PNG drifted.

---

## Live vs this packet

| Live today | This packet |
|------------|-------------|
| One kind: Condition (If). Linear chain on A15 | **If** and **Switch**. Forks are wires (**A36** / **A37**) |
| A16 Then / Else radios. Teaching footer | **A38:** True is the mode. Craft the argument. False is everything else |
| IfPlateModal: SQL table names, eq, duplicate rows | Chip from the left · operator · value |
| Palette: Condition (If) | Palette: **If** · **Switch** |

---

## Cousin packets

| Packet | Take | Do not take |
|--------|------|-------------|
| **NODE-PLACE** | Wire + / ⋯. **⋯ Switch** = change kind | ⋯ Switch as this node |
| **INPUT-LOOK / MAPPED-BOX** | Tree, drag, occupancy | Get cascade on If |
| **ADD-TAG** | Glyphs, color, kind chip under title | Add tag Parameters |
| **A16** | If reads previous result | Radios and captions |

---

## Do not

- Recut 015. Overwrite 15:43. Plant.
- One kind only. Then/Else in the modal. Mix the two Switches.
