# Trigger select packet — A26

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**. One pocket. Do not lose this in transition.  
**When:** Look locked 2026-08-18 20:09. Packet cut 20:12. Global / Local shape named in the same breath.  
**Plate:** [`A26-trigger-select-event.png`](./automations-blueprint/A26-trigger-select-event.png). A5 · A18 stay **prior**.  
**Canvas cousins (same lock, other packet):** [`NODE-PLACE-PACKET.md`](./NODE-PLACE-PACKET.md) — **A27** ⋯ · **A28** wire +.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Face **law 27** (this stamp) · **law 38**. [`PRIMITIVES.md`](./PRIMITIVES.md). Read: [`PLATE-READ.md`](./PLATE-READ.md). Chrome: [`PLATE-CHROME-RULE.md`](./PLATE-CHROME-RULE.md).  
**Does not:** plant; recut 015; mint an event catalog; invent a Local control per event; treat Hub as the app; collapse trigger Local with Automations Contacts (**A19**).

---

## Paste — engineer

```text
Read docs/register/NODE-INTERIOR.md and docs/register/NODE-PLACE-PACKET.md first. Click a placed node = configure. This modal is add-Trigger from the palette, or ⋯ → Switch. Not the destination of a body click.

You are building trigger select on CT Ant Automations. Product face = /prototype-ant. Hub is not the app.

Read docs/register/TRIGGER-SELECT-PACKET.md all the way through. Plate: docs/register/automations-blueprint/A26-trigger-select-event.png. A5 / A18 are prior — do not ship radios, do not ship A5’s old interior as canon.

Copy A26 exactly: Event | Schedule, Search events, the named-event list with those icons, Grain as a dropdown. Global on the PNG = no extra picker. Icons are spec.

Read the Global / Local shape in this file. Local is not “this form” as a hardcoded second box. Local opens that event’s existing shape as nested dropdowns — same primitive family as Get / Select firm. Sequential, not every dropdown at once. Do not invent a new control per event. The event already has a shape; Local maps onto it.

Read docs/register/PLATE-READ.md. Fill all five buckets in this file. Literal reading of the PNG will miss Local (not this state).

Do not plant. Do not recut 015. Do not overwrite 15:43.
```

## Paste — Systems Analyst

```text
You are Tower’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Log: docs/register/SYSTEMS-ANALYST-LOG.md. Product flags are read-only — 15:43 stands. Trigger-select face is docs/register/TRIGGER-SELECT-PACKET.md plus Automations face law 27 (2026-08-18 20:12) and law 38.

Do not mint tables from the picture. Do not invent a Local grain catalog. Do not freeze A18’s “this form” picker as the only Local UI.

Two questions, short:

A. Our system. Where does a workflow’s trigger already store Event vs Schedule, the named event, and Global vs Local (Hub / workflowWalk / tables)? What is silent on Ant?

B. Global = every firm + every permutation of this event. Local = nested dropdowns of axes that event already has (firm/contact Select-firm primitive, plus that event’s instance: this form, this campaign, this pack, this batch, …). Per named event in PRIMITIVES.md, name the cascade from what already exists — or say silent. Order is nested (next appears after this layer), not a dump. Stopping mid-cascade = all of the next class when that default already exists (cousin of Get: firm selected → all contacts). Some events may have no instance axis (audit one-time) — map, do not drop. Do not invent events. Do not collapse this with A19 Contacts enrollment.

Do not recut 015. Do not plant. Stamp SYSTEMS-ANALYST-LOG.
```

---

## Founder comments (preserve)

Do not generate a substitute flag. This is what was said, in this pocket:

- A26 is great. Icons: **build exactly to spec.**
- Packets now. Written spec + five buckets. Engineer and SA. SA still looks at the packet; SA names system requirements / modifications / revisions; those two things go to the engineer.
- Click vs Switch already locked (law 38). This packet is the **select** modal.
- **Global** as it relates to events / triggers: it means **every firm** and **every permutation of this trigger / this event**.
- **Local** is not understood if we leave it implicit. Local has **axes**. One axis is already a primitive: **Select firm** — Firm then Contact, firms selected the way Get / Add contact already work. Another axis depends on the event: a form can mean all forms or **this** form. Same idea on campaign, pack, batch, …
- **Global itself has a shape.** Everything just listed is a **layer** of that shape. When the event exists, that shape already maps to where it relates. The dropdowns — if those are the kinds listed — fit **without hardcoding or creating anything new**.
- Select **Local** → it **displays more dropdowns**. They are **nested**. It does **not** display every potential dropdown at once. There is still a **sequence**, because some layers depend on others.
- No extra PNG for Local. Completes the module. Same rule as Get’s Every firm vs Select firm.

---

## The shape that must not get revised away

### Grain — one dropdown, two values

| Value | What it means | On the glass |
|-------|----------------|--------------|
| **Global** | **Every firm** + **every permutation** of this event. All layers of the shape, unspecified. | A26. Grain = Global. **No** extra combobox. |
| **Local** | Specify down the **same** shape. Nested dropdowns. | **Not this PNG.** Still build. |

Do not ship A18 radios. Do not call it Settings. Do not put Automations **Contacts** (A19) on this modal — that tab is who is enrolled, not which event-instances fire.

### Local — nested layers, not a dump

The event **already has** a shape. Local **maps** onto it. Do not mint a new picker family per event. Changing which **event** is selected **restamps** the Local cascade the way changing **Module** restamps Get’s three levels.

Layers that already exist (not a catalog to invent):

| Layer | Primitive already named | What Local is specifying |
|-------|-------------------------|--------------------------|
| **Firm / contact** | Get / C8 / C8b: Every · Select → **Firm** (combobox + input) → **Contact** (same). Select a firm → all that firm’s contacts selected; deselect all to pick a few. | This event **at this firm** (or these contacts). |
| **Event instance** | The event’s identity. Form submitted → **this form**. Campaign failed → **this campaign**. Contact import → **this batch**. Reference pack updated → **this pack**. | This specific one of that kind. |

**Nested / sequential.** Open the next dropdown when this layer is Select, not Every. Do not paint Firm + Form + Campaign + Contact all at once.

**Stopping mid-cascade is valid** when the default is **all of the next class** — same product as Get (firm filled, Contact closed = all of that firm’s contacts). SA maps which events have that default. Do not freeze “you must pick the last box.”

**Some events may have no instance axis** (audit as one-time — already named). Local may still have the firm axis, or Local may be empty for that event. SA maps. Do not drop the idea. Do not invent a fake “this audit” if the system has no such identity.

**Cousin, not copy:** Get Parameters are **Get only**. This cascade is **Trigger grain**. Same *family* of control. Do not put Get’s Module dropdown on the trigger. Do not put this cascade on Rule / Get / If.

### Named events (the list on A26)

The list is the events already named in [`PRIMITIVES.md`](./PRIMITIVES.md). **Contact import** and **New contact** are two rows. Do not merge them. **Contact uploaded information** is a third, different seat — additive row, packet [`CONTACT-UPLOADED-EVENT-PACKET.md`](./CONTACT-UPLOADED-EVENT-PACKET.md) (**A41–A44**). Do not recut this packet as a replacement. Do not add “any row changed.” Search searches **this** list.

---

## Click path

Operator → Configuration libraries → Automations → open a workflow (or blank canvas).

1. Add **Trigger** from the palette, **or** ⋯ on a placed Trigger → **Switch**. That is **A26**. Body click on a placed node is **configure** ([`NODE-PLACE-PACKET.md`](./NODE-PLACE-PACKET.md)), not this modal.
2. Tab **Event** (default) or **Schedule**.
3. Search / pick a **named event**. Icons as drawn.
4. **Grain** dropdown. **Global** → stop. No extra boxes.
5. **Local** → nested dropdowns for **that** event’s shape. First layer, then the next. Comboboxes are also input boxes (same as Get).
6. Configure after the node is placed: Output of contact import = **A24**; new contact = **A25**. Not this packet.

---

## 1. Copy

- Middle modal. Title **Trigger**. Subtitle / tab **Event**. **X** to close. No teaching captions.
- Tabs **Event** | **Schedule**. Event selected.
- **Search events**.
- Named-event rows with **icons as drawn**: Form submitted · Campaign failed · Opted out / unsubscribed · Firm created / provisioned · Audit finished · **Contact import** (selected, check) · **New contact** (own row) · Reference pack updated.
- **Grain** dropdown, value **Global**. Nothing under it.

## 2. Do not build

- Teaching captions.
- Grain as **radios** (A18 prior).
- Footer **Cancel / Save** if a generator put one on an earlier recut. Pick is **live** like A23. **X** closes.
- An empty second **Select…** under Global. Dead leftover. Global has no extra picker.
- Mixing grain **into** the event list (Global as if it were an event).
- A hardcoded **This form** box as the only Local UI. That was A18’s example, not the shape.
- Automations Contacts table (**A19**) inside this modal.
- Get’s **Module** dropdown on the trigger.
- Extra events not in primitives.
- Catalog / “the real house workflow” behind the modal as a type. Stale pixel. Trust the modal.
- Fake browser chrome.

## 3. Implied (on the glass, we didn’t discuss, still build)

- **Search** — it searches the named-event list.
- **Schedule** tab — the other value. Time trigger. Not this PNG; the tab is on the glass.
- Closed **Grain** dropdown **opens**: **Global** · **Local**.
- Event rows are **selectable**. Click a row = that event. Check / highlight as drawn.
- **X** closes without a second confirm.

## 4. Completes (not this state of the PNG)

No extra PNG.

1. **Local.** Grain = Local → nested dropdowns for **this** event’s existing axes. Sequential. Firm/contact primitive where it applies. Event-instance where the event has one.
2. **Every / Select at each layer.** Every *X* hides the next boxes (like Get Every firm). Select *X* opens the next combobox. Combobox = dropdown **and** input box.
3. **Restamp on event change.** Pick a different named event → Local cascade restamps to that event’s classes. Do not hardcode Form-submitted’s cascade as every event’s Local.
4. **Stopping mid-cascade.** Default = all of the next class when that default already exists.
5. **Switch** from ⋯ opens this same modal, current event selected (PNG is that state: Contact import checked).

## 5. Out of scope this build

Everything on A26 **outside the Trigger modal**: House-global sider, libraries, catalog, canvas behind, Save / Launch, zoom. Canvas interaction is [`NODE-PLACE-PACKET.md`](./NODE-PLACE-PACKET.md). Output of the event is A24 / A25. Do not rebuild the desk from this interior.

---

## Cousin plates (do not copy the wrong control)

| Plate | What to take | What not to take onto Trigger select |
|-------|----------------|--------------------------------------|
| **A18** | Global vs Local as **event grain**, not Settings. | Radios. Disabled “this form” as the only Local control. |
| **A5** | Event \| Schedule. | Old interior as canon. |
| **A23** / Get | Nested dropdowns; combobox + input; Every hides the next; Select a firm → all contacts. | Module. Get Parameters on the trigger. |
| **C8** / **C8b** | Select firm primitive. | Radios. “Starts the mission now.” Enrollment table. |
| **A19** | Who this automation applies to. | That table on the trigger modal. |
| **A27** | Switch **opens** this modal. | Switch as body click. |

---

## Live vs this packet

| Live today | This packet |
|------------|-------------|
| Click a node oscillates configure / switch | Switch is ⋯. This modal is add / Switch |
| A18 radios + “this form” | Grain dropdown. Local = nested existing shape |
| Event list look is A5 | A26 icons + search + named list |
| Global ≈ “all of that kind” | Global = **every firm** + **every permutation** of this event |

Do not recut 015. Name the gap. Engineer builds the UI to the shape; SA ascribes where grain is stored.

---

## Do not

- Plant `AntAutomationWorkbench` from this file.
- Recut engineer SA packets 013+014+015.
- Overwrite 15:43.
- Invent events. Invent a Local UI kit per event.
- Collapse Local with A19.
- Ask the PM to restate this pocket. It is here.
