# If / Switch packet — two kinds. Four plates. Paths are wires.

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**. One pocket.  
**When:** Founder 2026-08-20 10:46. Plates 10:52. If interior revise 11:00. Compare boxes 11:03 (packet only, no PNG).  
**Plates:**  
- Canvas **If** (two doors): [`A36-if-canvas-true-false.png`](./automations-blueprint/A36-if-canvas-true-false.png)  
- Canvas **Switch** (many paths): [`A37-switch-canvas-paths.png`](./automations-blueprint/A37-switch-canvas-paths.png)  
- Interior **If:** [`A38-if-interior.png`](./automations-blueprint/A38-if-interior.png)  
- Interior **Switch:** [`A39-switch-interior.png`](./automations-blueprint/A39-switch-interior.png)  
**Prior:** [`A16-if-previous-result.png`](./automations-blueprint/A16-if-previous-result.png) — first If. Then/Else radios and teaching captions are **not** this build.  
**Shared:** Input [`INPUT-LOOK-PACKET.md`](./INPUT-LOOK-PACKET.md) **A29** / **A35** glyphs. Occupancy [`MAPPED-BOX-PACKET.md`](./MAPPED-BOX-PACKET.md) **A31**. Color / kind chip under title: [`ADD-TAG-PACKET.md`](./ADD-TAG-PACKET.md) **A35**.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Face **law 26 · 40 · 46**.  
**Does not:** plant; recut 015; collapse with Rule conditions; mix **⋯ Switch** (change kind, law 38) with the **Switch node**; put Then/Else radios in the modal. **No new PNG for 11:03** — comparison boxes; put it in this packet.

---

## Do not miss

| Look at this (the product) | Do not look at this |
|----------------------------|---------------------|
| **A36:** If has **two wires** — true / false | A15 / A16 linear chain. Live IfPlateModal |
| **A37:** Switch has **many wires**. **+ Add path** adds a wire | Next-node titles on A37 (“Mark as reachable”) — examples |
| **A38 / A39:** drag from the left **into** the box. Chip **is** the box. Operator. Value. **A38: True is the mode.** Craft the argument. Anything else is false. | Then / Else radios. A False form. “This is not a rule.” Kind chip strip |
| Orange **If** / **Switch** chip **under the title** (A35 placement) | Teaching captions |
| **Compare (If and Switch):** both sides of the comparison are **text boxes**. Drop a variable from the left **or** type. Same box. Always text — a literal, or a variable that holds that text. **Any** input box works this way. | Left locked as chip-only, right locked as type-only. Two kinds of box. |
| **Exists (If):** the argument can be a **class** (required data). Operator exists = listing not empty. Same If. A38 still: true is the mode. | A new If kind. Then/Else. |

If the If node is still one wire down, you missed A36. If Switch cannot add a path that becomes a wire, you missed A37. If the interior still has Then/Else radios, you missed A38. If left→right drag is missing, you missed law 40. If a compare side cannot take a chip **or** typed text, you missed 11:03.

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

Interior If (A38): **True is the default mode.** Space to craft the argument. Do not configure False in the node. Anything other than that argument is the false wire on the canvas. Interior Switch (A39): rows of paths. Kind chip under the title (orange If / Switch). No Kind · In the application strip. Color as A35. Type glyphs as A35.

Compare (If argument and every Switch path): **both sides** are the same kind of box. Drag a piece of data from the left into either side, or type. It is always text: typed text, or a variable that contains that text. This is every text / input box, not Switch only. Do not make a special “compare widget.” Do not regenerate a PNG for this — it is this paragraph.

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

C. Drag-from-left is law 40. Both sides of a compare (and any text box): chip from the left **or** typed literal. Always text. Name whether the walk already stores left/right as write-ref vs string. Silent if silent. Do not mint a compare-type table.
```

---

## Founder comments (preserve)

- List for today so nothing is forgotten. First issue: forgotten. Second: Test and Run — they will check Run; Run **literally means the automation runs**. Also: a way to see if it worked (backend, that person’s workspace). **Notification / login system** when table writes happen — not a replacement for the writes. Think later.
- Uses for **both** If and Switch. One Switch = at least two Ifs. Only one separation → If is the choice; both are the choice in that scenario. Both well built.
- Live If / Switch do not work like this yet. Primitive: drag left → right is **universal**. Then a figure, then it runs. Simplest node. Not that difficult.
- Switch: **add more paths** = wires showing underneath.
- Four mocks: If canvas (true/false), Switch canvas (multiple paths extending away), If interior, Switch interior.
- **11:00:** one revision to If interior. **Truth is the default mode** so there is space to craft the argument. Anything other than the argument stated in the node is false. (n8n If Parameters.)
- **11:03:** Switch comparison — and If, and **any text box**. Left side of the compare: drop a variable **or** type. Right side: same. Always text — typed, or a variable that contains that text. Do not regenerate. Put it in the packet so the engineer is not confused.

---

## Law (plain)

**If and Switch are two node kinds.** Same interior primitive: drag from the left into the box. If = two wires (true / false). Switch = many wires; **+ Add path** adds one. The paths are on the canvas, not radios in the modal.

**Compare:** both sides of If / Switch (and **any** input box) are text. Type a literal, or drop a variable from the left that holds that text. Same box. Occupied chip **is** the value (A31). Empty, you can type.

---

## Click path

Operator → Configuration libraries → Automations → open a workflow → palette or wire **+** → **If** or **Switch**. Click the node = configure (interior). Wires leaving the node are the paths.

---

## 1. Copy

**Canvas If (A36):** two outputs, labeled true / false. Two wires.

**Canvas Switch (A37):** several outputs. **+ Add path**. Each path is a wire extending away.

**Interior If (A38):** True is the mode. Craft the argument. **Both sides** of the compare: chip from the left **or** typed text. AND. Add condition. No False form.

**Interior Switch (A39):** one row per path + fallback + Add path. Same boxes on each side of `=`. Orange If / Switch chip under the title. Glyphs and color as A35.

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
- A compare side that only accepts a chip, or only accepts typing. Both. Any text box.

## 3. Implied

- Empty box = you can **type** or **drop**. Occupied chip = the box is that text (A31). X returns empty (type or drop again).
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
| Chip from the left · operator · value (right type-only) | **Both sides:** chip **or** type. Always text. Any input box |
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
- A compare side that cannot take a dropped variable **and** typed text.
