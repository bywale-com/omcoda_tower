# Node place packet — A27 options · A28 wire +

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**. One pocket.  
**When:** Look locked 2026-08-18 20:09. Packet cut 20:12.  
**Plates:** [`A27-node-options-popover.png`](./automations-blueprint/A27-node-options-popover.png) · [`A28-add-node-on-wire.png`](./automations-blueprint/A28-add-node-on-wire.png). A6 stays **prior**.  
**Trigger select (same lock, other packet):** [`TRIGGER-SELECT-PACKET.md`](./TRIGGER-SELECT-PACKET.md) — **A26**.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Face **law 38**. Read: [`PLATE-READ.md`](./PLATE-READ.md).  
**Does not:** plant; recut 015; send body click to Switch; put Trigger on insert-on-wire.

---

## Paste — engineer

```text
Read docs/register/NODE-INTERIOR.md first. Click a placed node = configure that node (Input / Parameters / Outcomes / Output as that kind). Title-rename on click is fine — leave it.

You are building canvas place/options on CT Ant Automations. Product face = /prototype-ant. Hub is not the app.

Read docs/register/NODE-PLACE-PACKET.md. Plates: docs/register/automations-blueprint/A27-node-options-popover.png and A28-add-node-on-wire.png. A6 is prior.

⋯ on a placed node: Duplicate · Add node · Switch · Delete. Switch is not click. Switch on a Trigger opens A26 (TRIGGER-SELECT-PACKET.md).

Wire hover +: Add node — Get · Rule · Action · **If** · **Switch** · Exit. No Trigger on the wire. Palette still has Trigger for starting the graph. Condition (If) only is prior. Packet [`IF-SWITCH-PACKET.md`](./IF-SWITCH-PACKET.md). **⋯ Switch** = change kind. **Switch** on the palette = the many-path node.

Read docs/register/PLATE-READ.md. Do not recut 015. Do not overwrite 15:43.
```

## Paste — Systems Analyst

```text
You are Tower’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Log: docs/register/SYSTEMS-ANALYST-LOG.md. 15:43 stands. Canvas place face is docs/register/NODE-PLACE-PACKET.md plus Automations face law 38.

Do not mint graph tables from the picture.

A. Our system. Hub already duplicates / inserts on edge / has a node menu. What does Ant graph already do on click (configure vs retarget vs rename)? What is silent?

B. Switch on a Trigger changes the named event (same node). Switch on another kind — does the system already replace a node type in place, or is that silent? Duplicate = copy the node on the canvas. Wire + = insert between two existing nodes. Do not invent a new graph store. Ascribe.

Do not recut 015. Stamp SYSTEMS-ANALYST-LOG.
```

---

## Founder comments (preserve)

- When you add a node and click it, it oscillates: configure vs switch the trigger. That is the problem. Title-edit on click is **not** a real issue — leave it.
- Click into the node = **configure**. Switch is **not** click. If you want to switch, you do not click into it.
- Hub had an **options** popover on nodes: duplicate, add a node, reposition. Wire hover already shows **+** to add on the connection. **Switch** belongs on that options popover.
- Canvas add-trigger already looks good. Selecting triggers (the list) is A26.

---

## Click path

Operator → Configuration libraries → Automations → open a workflow with nodes on the canvas.

1. **Click the body** of a placed node → **configure** (kind interior). Not A26. Not Switch.
2. **⋯** on that node → **A27**: Duplicate · Add node · Switch · Delete.
3. **Switch** (Trigger) → **A26**. Switch on other kinds: change that kind / retarget — SA ascribes; do not invent a picker we have not drawn.
4. Hover the **wire** → **+** → **A28**: Get · Rule · Action · **If** · **Switch** · Exit. Inserts **between**. No Trigger.
5. **Add node** on ⋯ is the same add-kind idea as the wire, from the node. Palette **Trigger** still starts a graph; it is not on the wire menu.

---

## A27 — 1. Copy

- Canvas. House chain as context. Palette includes **Get**.
- Trigger **Contact import** selected. **⋯** open to the side.
- Menu: **Duplicate** · **Add node** · **Switch** · **Delete** (Delete destructive / red as drawn).

## A27 — 2. Do not build

- Switch as the destination of a **body click**.
- Teaching captions.
- Replacing Duplicate with a different word if the PNG says Duplicate. Founder: Hub duplicate = copy.
- Extra menu rows we did not name (share, notes, …). **Reposition** was spoken as Hub; if the canvas already drags the node, do not add a menu item we did not draw. Drag stays drag.

## A27 — 3. Implied

- **⋯** exists on **every** placed kind, not only Trigger. Same four rows. Switch means switch **that** node (event on Trigger; kind/retarget on others as SA maps).
- Click outside closes the popover.
- **Delete** asks if the product already confirms elsewhere; do not invent a new confirm pattern. Follow existing Ant destructive confirm if one exists.
- **Duplicate** places a copy on the canvas.

## A27 — 4. Completes

- **Add node** from ⋯ opens the same kind list as A28 (no Trigger if inserting after an existing start; Trigger still only from palette / empty start).
- Selected node keeps a selected ring as drawn.

## A27 — 5. Out of scope

Desk chrome, catalog, Launch. Wire **+** menu is A28. Event list is A26.

---

## A28 — 1. Copy

- Wire between Trigger and the next node. **+** on the wire.
- Popover **Add node**: **Get** · **Rule** · **Action** · **If** · **Switch** · **Exit**. Condition (If) only is prior.
- **No Trigger** in this list.
- Palette on the left still includes **Trigger**.

## A28 — 2. Do not build

- **Trigger** on insert-on-wire.
- Teaching captions as UI copy if the generator wrote “Retrieve data” etc. as law. Kinds + icons are spec. One-line hints may ship as muted subtitles if they match the kind; do not invent extra kinds from them.
- Freezing A6’s Exit **without** If. A28 has both.
- A6 insert-menu helper block as canon.

## A28 — 3. Implied

- **+** also at the **end** of a chain (PNG may show more than one). Same menu.
- Hover wire → **+** appears. Not a permanent billboard on every edge if that fights the canvas; it must be discoverable. A6 already had insert on the wire.
- Choosing a kind **inserts** that node on that edge and selects it. Then **configure** (body click law).

## A28 — 4. Completes

- Palette add vs wire insert: same kinds except Trigger is palette/start only.
- Get is on this menu (A6 did not have Get). A22 palette law stands.

## A28 — 5. Out of scope

Node **⋯** (A27). Event picker (A26). Interior of the inserted node.

---

## Live vs this packet

| Live today | This packet |
|------------|-------------|
| Click oscillates configure / switch | Click = configure. Switch = ⋯ |
| A6 add-node look | A28 Assist look. Get on the wire. No Trigger on the wire |
| Hub node options | A27 four rows |

---

## Do not

- Plant. Recut 015. Overwrite 15:43.
- Ask the PM to restate this pocket. It is here.
