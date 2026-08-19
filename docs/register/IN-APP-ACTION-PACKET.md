# In-app Action packet — module affordances as the inventory

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**. One pocket. Do not lose this.  
**When:** Locked 2026-08-19 08:29. UI pass. Founder does **not** spec the picker — you see the inventory, lay it out, they redesign after screenshots.  
**Kind split (already locked):** [`A7-action-two-kinds.png`](./automations-blueprint/A7-action-two-kinds.png) — **Agents** vs **in the application**. This packet is **only** the in-app path after that pick. Agents stays [`A14`](./automations-blueprint/A14-action-assign-or-template.png) / law 31.  
**Shared panes:** [`NODE-INTERIOR.md`](./NODE-INTERIOR.md) · [`INPUT-LOOK-PACKET.md`](./INPUT-LOOK-PACKET.md) · [`MAPPED-BOX-PACKET.md`](./MAPPED-BOX-PACKET.md) · [`TEST-PACKET.md`](./TEST-PACKET.md). Retrofit these onto Action. Do not invent a fourth interior.  
**Same pass also completes:** [`MAPPED-BOX-PACKET.md`](./MAPPED-BOX-PACKET.md) **A31 / A32** (chip **is** the box; close Input; resize the interior).  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Face **law 41**. [`PRIMITIVES.md`](./PRIMITIVES.md).  
**Does not:** plant; recut 015; invent a write that is not already a module affordance; spec the in-app picker layout; wire the walker; collapse Agents into this; freeze Hub `manage_lists` / `assign_task` / `notify_consultant` as the catalog.

---

## Do not miss

1. **Can we automate X = does that module already have that affordance.** If it does not, you are inventing. If it does, it belongs on the in-app Action list.
2. **An in-app action is a button that writes.** The module is the container / label. Group the list **by module**. Why not.
3. **Actions live on the module, not in Automations.** Automations consumes them. Creating the affordance on the desk is what makes it available here. Analog: **HolonBoundary** (wrap so Console can see it). Do not spec a wrapper. One affordance, two seats.
4. **Do not spec the picker.** You will see the potential actions. Lay them out. Founder redesigns after looking. That is smarter than PM drawing a fake inventory.
5. **Input / Parameters / Output are already designed.** Retrofit. If the retrofit fights the Action chrome, ship it; they will fix the UI. Mapped occupancy is **A31**. Close Input / resize is **A32**.
6. **Deliverable:** screenshots of **every distinct screen** from **click the Action node → select in the application → onward.** Not Agents. Not hover states. Distinct screens only.
7. **This is UI.** SA inspects whether the walk can actually run those writes (`action` is still `call_agent` only). Do not block the face on that.

Live today: `ActionInAppModal` is a radio of five hardcoded kinds (`run_audit`, `ascribe_tag`, plus Hub leftovers). That is **not** the inventory. Kill that as the face.

---

## Paste — engineer

```text
Read docs/register/IN-APP-ACTION-PACKET.md ALL THE WAY THROUGH. Then NODE-INTERIOR.md, INPUT-LOOK-PACKET.md, MAPPED-BOX-PACKET.md.

You are building in-app Action on CT Ant Automations. Product face = /prototype-ant. Hub is not the app. This is a UI pass. Do not recut 015. Do not overwrite 15:43. Do not plant.

Click a placed Action node = configure (law 38). First: two kinds (A7) — Agents vs in the application. Agents is A14. This packet is in-app only.

After in-app: the list is every write-button that already exists on a module. Group by module. Do not invent. Do not freeze ActionInAppModal’s radio list (run_audit / ascribe_tag / manage_lists / assign_task / notify_consultant) as the catalog. Walk the desks. If it is not a button that writes on a module, it is not an in-app Action.

Do not spec a pretty picker. You will see the inventory. Put it on the glass (by module). Founder redesigns after screenshots.

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

---

## Law (plain)

**Automate only what the module already affords.** Creating that write-button on the desk is what makes it an in-app Action. Automations does not author a second Start Audit.

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
- The list = real module write-buttons. **By module.**
- Shared panes on that Action: Input · Parameters · Output, already specified elsewhere.
- **A31 / A32** on those interiors (and on Get, same pass).
- Screenshots as named above.

## 2. Do not build

- A PM-drawn picker. Teaching captions. “At least two kinds of actions” footer (A7 caption).
- Hub leftovers as the catalog: `manage_lists` · `assign_task` · `notify_consultant` unless you can point at that write-button on a desk.
- Get’s Module / Every firm / Select firm cascade on Action.
- Rule Outcomes on Action.
- Invented writes (“write any table”). Webhook-as-an-action.
- Wiring `workflowWalk` to actually run Audit this packet. SA names the gap.
- Agents assign / template / form (**A14 / A12**) inside this in-app path.
- Rebuilding the desk from A7’s drifted background.

## 3. Implied

- Search / scroll if the list is long.
- Empty in-app list is honest if a module has no write-button — do not pad.
- Switching kind (in-app ↔ Agents) stays the Kind control you already have.
- Several chips in a mapped Parameter box = A31.
- Test fills without commit (**TEST-PACKET**). Door 2 on an Action that has not run = that module’s real write-set.

## 4. Completes

- Every in-app affordance you found, not only Audit and tag. No extra PNG per module.
- Input / Output on Action even though A7 / the live in-app modal never opened those tabs.
- **A31 / A32** everywhere a left write occupies a box.

## 5. Out of scope this build

- Making the walker execute those writes (SA). Recutting 015.
- Spec of a HolonBoundary-for-writes API.
- Redesign of the picker (founder, after screenshots).
- Agents Action interior.
- Filling Open item 6 as a numbered catalog in FACE.

---

## Live vs this packet

| Live today | This packet |
|------------|-------------|
| `ActionInAppModal` radios: run_audit, ascribe_tag, manage_lists, assign_task, notify_consultant | Inventory of **module write-buttons**, grouped by module |
| No Input / Output on that modal | Shared panes. Parameters = that button |
| `ChipBox` tags + leftover Select (Get) | **A31** occupancy, including Action mapped slots |
| SQL `action` `call_agent` only | Face still shows the inventory. Walker gap is SA. Do not fake execution |

---

## Cousin packets

| Packet | Take | Do not take onto this pocket |
|--------|------|------------------------------|
| **A7** | Two kinds. | Captions. Drifted Branch canvas. Hub names as the list. |
| **A14 / A12** | Agents path. | Into in-app. |
| **GET-PACKET** | Module as a dropdown grain. Opposite door (read). | That cascade on Action Parameters. |
| **INPUT-LOOK / MAPPED-BOX** | Tree, chip look, occupancy, close Input, resize. | — |
| **TEST-PACKET** | Fill without commit. Two doors. | A Test tab. |

---

## Screenshots (required)

Folder: [`automations-blueprint/in-app-action-pass/`](./automations-blueprint/in-app-action-pass/). Create it when you drop files.

From **click Action node** → **in the application** → stop when the operator would Save. One PNG per distinct screen. Names like `01-kind.png` · `02-in-app-by-module.png` · `03-book-readiness-start-audit.png`. No teaching banners on the shots.

---

## Do not

- Ask the PM to draw the picker. They will redesign after your screens.
- Invent actions so the list looks full.
- Collapse Agents into in-app.
- Recut 015. Overwrite 15:43. Plant.
