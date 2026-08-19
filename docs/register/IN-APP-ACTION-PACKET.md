# In-app Action packet — module affordances as the inventory

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**. One pocket. Do not lose this.  
**When:** Locked 2026-08-19 08:29. UI pass. Founder does **not** spec the picker — you see the inventory, lay it out, they redesign after screenshots.  
**Redesign plate:** [`A33-in-app-action-inventory.png`](./automations-blueprint/A33-in-app-action-inventory.png) — grouped list from the SA **persist** walk, not the three-row first pass.  
**Add tag Parameters:** [`ADD-TAG-PACKET.md`](./ADD-TAG-PACKET.md) · [`A35-add-tag-parameters.png`](./automations-blueprint/A35-add-tag-parameters.png).  
**Live first pass (engineer, merged main #100):** [`in-app-action-pass/`](./automations-blueprint/in-app-action-pass/). Three modules only — **not** the inventory.  
**Kind split (already locked):** [`A7-action-two-kinds.png`](./automations-blueprint/A7-action-two-kinds.png) — **Agents** vs **in the application**. This packet is **only** the in-app path after that pick. Agents stays [`A14`](./automations-blueprint/A14-action-assign-or-template.png) / law 31.  
**Shared panes:** [`NODE-INTERIOR.md`](./NODE-INTERIOR.md) · [`INPUT-LOOK-PACKET.md`](./INPUT-LOOK-PACKET.md) · [`MAPPED-BOX-PACKET.md`](./MAPPED-BOX-PACKET.md) · [`TEST-PACKET.md`](./TEST-PACKET.md) · [`RUN-PACKET.md`](./RUN-PACKET.md) · [`ADD-TAG-PACKET.md`](./ADD-TAG-PACKET.md). Retrofit these onto Action. Do not invent a fourth interior.  
**Same pass also completes:** [`MAPPED-BOX-PACKET.md`](./MAPPED-BOX-PACKET.md) **A31 / A32** (chip **is** the box; close Input; resize the interior).  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Face **law 41**. [`PRIMITIVES.md`](./PRIMITIVES.md).  
**Does not:** plant; recut 015; invent a write that is not already a module affordance; spec the in-app picker layout; wire the walker; collapse Agents into this; freeze Hub `manage_lists` / `assign_task` / `notify_consultant` as the catalog.

---

## Do not miss

1. **Can we automate X = does that module already have that affordance.** If it does not, you are inventing. If it does, it belongs on the in-app Action list.
2. **An in-app action is a button that writes** — when there is a button. **Every critical interaction with a button** must be referenceable in Automations. **Not every critical interaction needs a button.** Tail: the **audit-specific mark** on the contact (reachable / sequence-ready). No ascribe control. Audit writes it. Visible on the person: [`A34-audit-tag-on-contact.png`](./automations-blueprint/A34-audit-tag-on-contact.png). Consultant-authored tags (many, forever) are later — not this.
3. **Actions live on the module, not in Automations.** Automations consumes them. Creating the affordance on the desk is what makes it available here. Analog: **HolonBoundary** (wrap so Console can see it). Do not spec a wrapper. One affordance, two seats.
4. **Do not spec the picker.** You will see the potential actions. Lay them out. Founder redesigns after looking. That is smarter than PM drawing a fake inventory.
5. **Input / Parameters / Output are already designed.** Retrofit. Mapped occupancy is **A31**. Close Input / resize is **A32**.
6. **Deliverable:** screenshots of **every distinct screen** from **click the Action node → select in the application → onward.** Not Agents. Not hover states. Distinct screens only.
7. **This is UI.** SA inspects whether the walk can actually run those writes (`action` is still `call_agent` only). Do not block the face on that.
8. **Add tag interior** is [`ADD-TAG-PACKET.md`](./ADD-TAG-PACKET.md) **A35**. Do not lose that pocket.

Live today: `ActionInAppModal` / `IN_APP_AFFORDANCES` on main (#100) is **three rows** (Start Audit · Confirm book · Provision). That followed SA 08:40’s filter. SA **09:35** walked the desks: persist-bound controls are the list. **A33** is that list. Kill three-rows as the face. Hub leftovers stay dead. `ascribe_tag` still has no desk button — do not pad.

---

## Paste — engineer

```text
Read docs/register/IN-APP-ACTION-PACKET.md ALL THE WAY THROUGH. Then NODE-INTERIOR.md, INPUT-LOOK-PACKET.md, MAPPED-BOX-PACKET.md. Add tag interior is docs/register/ADD-TAG-PACKET.md — read that before touching Action Parameters.

You are building in-app Action on CT Ant Automations. Product face = /prototype-ant. Hub is not the app. This is a UI pass. Do not recut 015. Do not overwrite 15:43. Do not plant.

Click a placed Action node = configure (law 38). First: two kinds (A7) — Agents vs in the application. Agents is A14. This packet is in-app only.

After in-app: the list is every write-button that already exists on a module. Group by module. SA persist walk (09:35, SYSTEMS-IN-APP-ACTION-ASCRIBE.md on PR #86) is the inventory. Do not freeze the three-row live picker (Start Audit / Confirm book / Provision). Do not freeze ActionInAppModal’s old radios. Walk the desks. If it is not a control that writes on a module, it is not an in-app Action.

Look: docs/register/automations-blueprint/A33-in-app-action-inventory.png — grouped list. Chrome may drift; desk = live /prototype-ant + A22.

Add tag Parameters: docs/register/ADD-TAG-PACKET.md and A35-add-tag-parameters.png.

Retrofit the primitives you already have:
- Input = A29 tree (every node). Close Input / resize = A32.
- Output = A20 (every write this run made).
- Parameters = this action’s own inputs (what that button needs) — not Get’s Module / Every / Select cascade.
- Mapped chip IS the box (A31). Kill ChipBox tags-plus-dropdown wherever it still exists.

Same pass also completes MAPPED-BOX-PACKET.md on Get and every mapped slot.

If retrofit breaks Action chrome, ship the primitives anyway. They will fix the UI.

Screenshots (required): from click Action node → select “in the application” → every distinct screen after that. Drop them in docs/register/automations-blueprint/in-app-action-pass/ with a one-line name each. Distinct screens only. Not Agents. Not the desk behind.

Read docs/register/PLATE-READ.md. Do not recut 015.
```

## Paste — Systems Analyst

```text
You are Tower’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Log: docs/register/SYSTEMS-ANALYST-LOG.md. 15:43 stands. In-app Action face is docs/register/IN-APP-ACTION-PACKET.md plus law 41.

Do not mint tables. Do not invent write-buttons. Do not recut 015.

This pass is UI. You inspect whether the machine can actually do those writes. Do not block the face.

A. Per module we already have (Book readiness / Audit, Contacts, Firms, Imports, Reference, Agents, Automations itself): which controls already write? Quote the desk + the table/worker. Silent if silent. Live SQL action is call_agent only — name that gap. Do not lengthen a catalog from Hub chrome (manage_lists / assign_task / notify_consultant) unless those writes already exist.

B. Registration analog (HolonBoundary): is there already a place a module write is declared once and Automations can list it, or silent? Smallest existing thing. Do not invent a wrapper table from the analog.

Stamp SYSTEMS-ANALYST-LOG.
```

---

## Founder comments (preserve)

- In-app Actions need a primitive. Audit is a **type** of action: pass data into a module without the **direct door**.
- Anything that is a **button that writes** is an action. Module is a container / label. Not every module is one function.
- **Can we automate X = does that affordance already exist on the module.** That’s literally it.
- Actions exist **beyond Automations**. Affordances of a module. Every time we create one, it should be available as an Action here. Analog: **HolonBoundary** — wrap a component so it registers. Is there an equivalent. Not a backend spec from this seat.
- Next pass, it should have **a lot of actions**. Ordered **by module** — why not.
- UI building, not making the walker possible. SA inspects that.
- Input / Parameters / Output should already be known — those primitives already have a design. Retrofit. Then: don’t assume it retrofits cleanly — **let it go**; if it breaks something they will fix the UI.
- Do **not** spec the in-app picker. The implementer is the one who will **see all the potential actions**, lay them out, then we redesign. That’s smarter.
- **Screenshots:** from click into the Action node, select **in the application**, then **every distinct screen** from that point.
- Enough of a packet to also **complete the last couple of packets** (A31 / A32 mapped box).
- 09:51: engineer built; SA enriched the list; they merged the engineer to **main**. Check both. Work on images.
- 12:12: see the inside of **Add tag**, elected. Only prior is contact import. Keep the design structure. That’s the parameter interior.
- 12:17: A35 is great. Prioritize Input **field icons** (more appropriate than live). **Kind · In the application** chips — if no purpose, teaching labels. Green **Action** chip under the title looks great; they do not see it on the app.
- 12:30: color was the opposite of what we wrote. They **like** the color in the image. More lively than live. That is the product.

---

## Law (plain)

**Automate only what the module already affords.** Creating that write-button on the desk is what makes it an in-app Action. Automations does not author a second Start Audit. **Every critical interaction with a button** is referenceable here. **Not every critical interaction needs a button** — the audit mark on the contact (**A34**) has none.

Two kinds of Action still (law 19 / **A7**): **in the application** (this file) · **Agents** (A14). Do not collapse them.

Get is the other door: **read** what is already in the module. Action **presses** the write-button. Same modules. Opposite doors.

---

## Click path

Operator → Configuration libraries → Automations → open a workflow → **click an Action node** (or add Action from palette / wire **+**).

1. **A7.** Kind: Agents | in the application. Pick **in the application**.
2. Inventory of write-affordances, **grouped by module**. Pick one (example: Book readiness → Start Audit).
3. Interior: **Input** (A29) · **Parameters** (that button’s inputs) · **Output** (A20). Mapped boxes = **A31**. Input can close; modal resizes = **A32**.
4. Screenshot every distinct screen in 1–3 after the in-app pick, plus the in-app pick itself if it is its own screen.

Desk chrome = live `/prototype-ant` + A22. Not Hub.

---

## 1. Copy

- Two kinds (**A7**). This pocket = in-app.
- The list = real module write-buttons. **By module.** SA persist table, not three rows. Look **A33**.
- Shared panes on that Action: Input · Parameters · Output, already specified elsewhere.
- **A31 / A32** on those interiors (and on Get, same pass).
- **Add tag** interior: [`ADD-TAG-PACKET.md`](./ADD-TAG-PACKET.md) **A35**. Contact occupied. Tag picker. Type glyphs. Color more lively. Green Action chip. Kind chips teaching — kill.

## 2. Do not build

- Teaching captions. “At least two kinds of actions” footer (A7 caption).
- **Kind** + **In the application** chip strip — teaching. Packet [`ADD-TAG-PACKET.md`](./ADD-TAG-PACKET.md).
- Three-row picker as the product. Hub leftovers: `manage_lists` · `assign_task` · `notify_consultant`. Do not pad Add tag onto **A33** because **A35** exists — A35 is Parameters, not the inventory.
- Get’s Module / Every firm / Select firm cascade on Action.
- Rule Outcomes on Action.
- Invented writes (“write any table”). Webhook-as-an-action.
- Agents assign / template / form (**A14 / A12**) inside this in-app path.
- Rebuilding the desk from A33’s background if it drifted. Desk = live `/prototype-ant` + **A22**.
- Agents Launch / Add contact on the **in-app** list (those are the **Agents** card).

## 3. Implied

- Search / scroll — the list is long. A33 clips later modules on purpose.
- Same worker, several doors (Confirm book · Prepared file · Book Upload) — all stay on the list.
- Switching kind (in-app ↔ Agents) is **⋯ Switch**, not a Kind chip strip.
- Several chips in a mapped Parameter box = A31.
- After **Run**, Input / Output are the writes (**RUN-PACKET**). Mapping before Run uses the trigger’s provided data (**TEST-PACKET**).

## 4. Completes

- Every persist-bound affordance SA named, not only Audit. No extra PNG per module.
- Input / Output on Action.
- **A31 / A32** everywhere a left write occupies a box.

## 5. Out of scope this build

- Making the walker execute every listed write (SA). Recutting 015.
- Spec of a HolonBoundary-for-writes API.
- Agents Action interior.
- Filling Open item 6 as a numbered catalog in FACE.

---

## Live vs this packet

| Live today (main #100) | This packet |
|------------------------|-------------|
| `IN_APP_AFFORDANCES` = three rows | SA persist walk, grouped by module. Look **A33** |
| Hub radios gone (good) | Stay gone |
| Input / Output tabs exist; Output empty until Test | Shared panes. Parameters = that button |
| A31 occupancy shipped on Get | Keep. Mapped slots on Action too |
| Walker: `run_audit` / `ascribe_tag` / `call_agent` | Face lists persist. Walk silent until wrap. Do not fake execution |

---

## Cousin packets

| Packet | Take | Do not take onto this pocket |
|--------|------|------------------------------|
| **A7** | Two kinds. | Captions. Drifted Branch canvas. Hub names as the list. |
| **A14 / A12** | Agents path. | Into in-app. |
| **GET-PACKET** | Module as a dropdown grain. Opposite door (read). | That cascade on Action Parameters. |
| **INPUT-LOOK / MAPPED-BOX** | Tree, chip look, occupancy, close Input, resize. | — |
| **TEST-PACKET** | Provide data on the trigger. Two doors. | A Test tab. Canvas Test. |
| **RUN-PACKET** | Execute now vs arm. | Recut 015. |
| **ADD-TAG** | A35 interior + four revisions | Onto A33 as a picker row |

---

## Screenshots

Live first pass (engineer): [`automations-blueprint/in-app-action-pass/`](./automations-blueprint/in-app-action-pass/) `01`–`07`. **02 is three rows — not the inventory.**

Redesign: [`A33-in-app-action-inventory.png`](./automations-blueprint/A33-in-app-action-inventory.png). Grouping + length. Chrome may drift — desk = live + A22.

**Add tag interior:** [`ADD-TAG-PACKET.md`](./ADD-TAG-PACKET.md) · [`A35-add-tag-parameters.png`](./automations-blueprint/A35-add-tag-parameters.png).

---

## Do not

- Freeze three rows because that is what shipped.
- Invent actions so the list looks full. The persist walk is already long.
- Pad **A33** with the audit mark — that has no button. It lives on the contact (**A34**).
- Collapse Agents into in-app.
- Recut 015. Overwrite 15:43. Plant.
