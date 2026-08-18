# Get packet — A22 canvas · A23 interior

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**. One pocket. Do not lose this in transition.  
**When:** 2026-08-18 17:50 UTC. Founder: A23 is good; we move forward; no new image.  
**Plates:** [`A22-get-canvas.png`](./automations-blueprint/A22-get-canvas.png) · [`A23-get-input-parameters.png`](./automations-blueprint/A23-get-input-parameters.png).  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Face **law 36**. [`PRIMITIVES.md`](./PRIMITIVES.md). Chrome: [`PLATE-CHROME-RULE.md`](./PLATE-CHROME-RULE.md).  
**Does not:** plant the workbench; recut SA **015** / PR #86; mint tables from the picture; treat Hub as the app.

---

## Paste — engineer

```text
You are building Get on CT Ant Automations. Product face = /prototype-ant. Hub is not the app.

Read docs/register/GET-PACKET.md all the way through. Plates: docs/register/automations-blueprint/A22-get-canvas.png and A23-get-input-parameters.png.

Get is a node kind. Not Action. Not Audit. Not a Contacts-only node.

Copy the interior of A23 and the canvas of A22. Then build the buckets in this file: (1) on the PNG but do not build, (2) not on the PNG but must build. Literal reading of the PNG will miss the product.

Do not freeze the left-side reference_versions tree as the schema of “reference pack updated.” That example is not a validated write-set. The preserved thing is the stacking shape. Fit write-sets we already know into that tree.

Do not plant a fake Hub Get. Do not recut 015. Do not overwrite 15:43.
```

## Paste — Systems Analyst

```text
You are Tower’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Log: docs/register/SYSTEMS-ANALYST-LOG.md. Product flags are read-only — 15:43 stands. Get face is docs/register/GET-PACKET.md plus Automations face law 36.

Do not mint tables from the picture. Do not freeze reference_versions / rv_01HZ… as a pack-update schema — we do not have a validated input shape for that event. Ascribe the shape.

Two questions, short:

A. Our system. Get is a new node kind (not in WorkflowNodeType today: trigger | constant | branch | rule | action | exit). It reads records that already exist in a module, at a grain. Writes it produces are those records. Same handle as law 33: every write that run made. Live workflowWalk is previous-node; Input must see every prior node in this chain. Where does a module-read-at-grain already live? What is silent?

B. The three-level selector is inherent: (1) every X / select X, (2) first class, (3) second class. Contacts example on A23 is Every firm / Firm / Contact. Name the equivalent three per module we already have (Contacts, Firms, Audits, Imports, Reference, Agents) from what those modules already write — or say silent. Do not invent a grain catalog.

Do not recut 015. Do not plant. Stamp SYSTEMS-ANALYST-LOG.
```

---

## Founder comments (preserve)

Do not generate a substitute flag. This is what was said, in this pocket:

- Get is a primitive: get data in a module, filter to a grain. Same kind across the app. Not Audit. Not Action. Module = Contacts is the old “who this applies to,” not a special node.
- Pack / criteria updated writes no people. Trigger is a justification. Get sits in the middle and makes the writes the rule needs. Canvas: Reference pack updated → Get → Rule. **A22**.
- Inside Get: n8n split. Input left, Parameters middle, Output its own pane (not drawn). **A23**.
- Do not reinvent Input. n8n: prior nodes in **canvas order**; this DAG chain / fork only; each node’s **outputs underneath that node**.
- Left exists so Parameters can **reference** those writes. First wrong turn: replacing Every firm with a mapped-only “Of” slot. Founder: left is good; Every firm was right; the change is one thing.
- Add contact already has Every firm / Select from, then a table of firms and contacts (**C8** / **C8b** / **A19**). Get is that cousin — not a new pattern.
- Selector is a **dropdown**, not a radio. Every firm is one option. Select firm opens the next dropdowns. Those dropdowns are also **input boxes**. Apply a left-side write **in those boxes**. Cascade until you have to pick.
- Not firm-only as law. Every module has the equivalent of those **three**: the every/select dropdown, then the first class, then the second class. Contacts shows Firm then Contact because that shape is inherent. Preserve it so we do not keep revising.
- Left is a **shape** of how inputs appear inside nodes. The pack-update tree is an example. We do not have a validated reference-pack-update input in the system. Do not build that example as the event’s schema. Nodes chain → they **stack in order**. Write-sets we already know: **fit** them to this shape. That is all.
- No new image this stamp. Move forward. Packet now, so nothing is lost. Engineer and SA. What is on the image but must not be built. What is not on the image but must be built.

---

## The shape that must not get revised away

### Parameters — three levels, every module

| Level | What it is | Contacts on A23 (example, not the only labels) |
|-------|------------|------------------------------------------------|
| **1** | Every *X* / Select *X*. A **dropdown**, not a radio. | Every firm / Select firm |
| **2** | First class. Dropdown that is also an **input box**. Appears when Select is on. | Firm |
| **3** | Second class. Same control. Next grain. | Contact |

Stopping mid-cascade is valid. Firm filled, Contact empty = that firm’s contacts. You do not have to pick a contact.

Every firm (level 1) = no level 2 or 3 on the glass. That state is **not** the PNG (the PNG is Select firm). Still build it.

Left-side writes apply **in** level 2 / 3 boxes when you are picking a specific one. Type, pick from the list, or apply a write that is already on the left. Same box.

**Module** sits above the three. Changing Module restamps the three to that module’s classes. One Get kind. Do not ship Contacts-Get, Audits-Get, …

SA names the three classes per module from what already exists. PM does not mint them here.

### Input — stack, do not freeze the example

Prior nodes in this chain, canvas order, outputs nested under each node. One ancestor on A23 because this chain has one. The shape is **N**.

The `reference_versions` / `id` / `pack` / `firm` / `received_at` tree is **example furniture**. We have not validated that that is what a pack-update writes. **Do not build it as the event’s schema.** Fit known write-sets (law 33 handle) into this tree.

Schema is the tree. Table / JSON on the PNG are other looks at the **same** stacked writes — not a second model. Search filters that tree.

---

## Click path

Operator → Configuration libraries → Automations → open **Reference pack updated → Get → Rule** (or new canvas, same chain).

1. **A22.** Palette includes **Get**. Chain: trigger → Get → rule. Click the **Get** node.
2. **A23.** Tabs **Input** | **Output**. Input is selected. Body is Input tree | Parameters.
3. Parameters: **Module** → level-1 dropdown. **Every firm** hides Firm and Contact. **Select firm** shows Firm, then Contact.
4. Focus Firm or Contact. Left-side `firm` (or whatever write) applies **in that box**.
5. **Output** tab exists. Not opened on this plate. Same Output law as **A20**: every write this run made; click one; preview below. Get’s writes are the records it read.

---

## On the PNG — copy

- Get is a kind. Palette. Purple cylinder on A22. Title Get · Contacts.
- Tabs Input | Output. Input selected.
- Left: Schema tree, nodes as groups, outputs nested. `firm` marked as the write in use.
- Parameters: Module **Contacts**. Level-1 dropdown open: Every firm · Select firm (selected). Firm combobox **Harbor RCIC** with a mapping mark. Contact combobox empty: Select contact.
- Cancel · Save.

## On the PNG — do not build

- The pack-update field list as a real schema (`reference_versions`, that id, `received_at` nested however it nested). **Example only.** Stale pixel: `received_at` may sit under the version object; do not freeze that nest.
- Teaching captions. There should be none. Do not add “drag from the left.”
- Catalog / workflow-title drift as types. “Reference pack updated → Get → Rule” is this example chain, not a workflow class.
- An “Of” mapped-only slot that **replaces** Every firm. Dead. First A23 revision. Do not revive.
- Radios for Every firm / Select from on Get. Dead. Selector is a dropdown.
- Immigration eligibility fields on Get (hours, CLB, …). Those belong on the **rule**.
- Audit inside Get. Get is not a people-pump.
- A third Get-per-module kind.
- Lightning bolt as a required icon system. The product is: the box holds a left-side write. The bolt is chrome.
- Green mapped pip as a required color. Same: shows which left field is in use.
- Fake localhost URL chrome if a generator drew a browser frame.
- Rule background title drift (“Eligibility change” vs Immigration · Service eligibility). Trust the chain on **A22**.

## Not on the PNG — must build

These are the three. If the rest of the packet vanished, these still would.

1. **Every firm.** Same first dropdown. Pick it → Firm and Contact **go away**. The PNG only shows Select firm. Both states are the product.
2. **The lists inside Firm and Contact.** Opening them shows **real records** (cousin of **C8b**: you get choices, by firm and by contact). The box is also an input: type to filter, pick a row, or apply a left-side write into it. Empty Contact on the PNG is stopping at firm — still a complete Get. Opening Contact is how you go one grain further.
3. **Change Module.** The same three dropdowns **restamp** to that module’s classes. Contacts is the example so the desk stays congruent. Do not hardcode firm / contact as Get’s only cascade. Do not wait for an Audits plate.

Also build (already named, not a fourth invention):

- **N ancestors on the left.** This chain has one. Two nodes before Get → two groups, canvas order, outputs under each.
- **Output tab.** A20 shape. Get’s writes = the records that run read. Not drawn; still build.
- **Input sees every prior node in this chain**, not only the last. Live handle today is previous-node. Name the gap. Do not recut 015 from this seat.
- **Get in `WorkflowNodeType`.** Live is `trigger | constant | branch | rule | action | exit`. Get is none of those. Kind, not an action kind.

---

## A22 — canvas (locked with this pocket)

**Copy:** Palette includes Get (with Trigger, Rule, Action, Condition (If), Exit). Chain: **Reference pack updated** → **Get** (Contacts · book) → **Immigration · Service eligibility**.

**Ignore:** Extra catalog rows if they drifted. Trust the three-node chain and the palette.

**Not this plate:** Interior (A23). Output of Get.

---

## Cousin plates (do not copy the wrong control)

| Plate | What to take | What not to take onto Get |
|-------|----------------|---------------------------|
| **C8** / **A19** | Every firm is a real choice. Select is the other. | Radios. “This starts the mission now.” Get does not enroll. |
| **C8b** | Select opens **actual records**. Search. Scroll. | A checkbox table as Get’s only UI. Get’s select is a **dropdown that is also an input box.** |
| **A20** | Output = every write this run made; click; preview. | Dumping Analysis + JSON. |
| n8n NDV | Left tree; map into a parameter box. | Teaching tooltips. Frozen pack-update JSON. |

---

## Live vs this packet (so nobody “ascribes” Hub)

| Live today | This packet |
|------------|-------------|
| No Get kind | Get is a node kind |
| `previousWrites` / last node | Input: every prior node in this chain |
| Pack update is a named **event** in primitives; write-set not drawn as a tree | Do not invent that tree from A23 |
| Add contact = Every firm / Select from radios + C8b list | Same product choice; Get uses dropdown + combobox |
| Dispatch with no `contactIds` loads the whole firm book | Every firm on Get is that idea, as a control |

Do not recut 015 to make Input-of-chain true. Name it. Engineer builds Get’s UI to **read** that handle when it exists.

---

## Do not

- Plant `AntAutomationWorkbench` from this file.
- Recut engineer SA packets 013+014+015.
- Overwrite 15:43.
- Build A10 / A13 as a screen.
- Ask the PM to restate this pocket. It is here.
