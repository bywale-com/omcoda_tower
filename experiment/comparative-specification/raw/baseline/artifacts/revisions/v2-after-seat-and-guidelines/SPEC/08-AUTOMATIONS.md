# 8. Automations (operations brain)

Entered from Agents outskirts. Author seat: Operator (Configuration libraries → Automation workflows).

## 8.1 What Automations is

Automations is the **brain / operations**: **on this event** (schedule or trigger) → **perform this operation** (definite middle) → **on this kind of result do X / on that kind do Y**. Results are binary (or the binaries defined). More DAG-like than Agents’ sequence canvas.

**Smallest legal workflow:** trigger · rule · action.

**Canvas is blank and may chain:** event → action → If on that output → another action. Teaching walk: firm provisioned → audit contacts → if X → agents.

Agents sends people to accomplish a goal. Automations performs operations, creates data-request forms, changes things **inside the system**, and can assign an agent.

## 8.2 Two kinds of listen (triggers)

| Kind | What it is |
|------|------------|
| Something happened in the app | An **event**. Global = all of that kind. Local = this specific one. |
| Not an in-app event | **Schedule** (time). **Manual** (pressed). **Webhook** (outside told us). |

Webhook is a way **in**. It is not an action.

Trigger types in SQL: `event | schedule | manual | webhook | constant`.

### Named in-app events (shape list)

Do not treat “any row changed” as an event.

| Event | Global | Local |
|-------|--------|-------|
| Form submitted | All forms | **This form** |
| Campaign failed | All campaign failures | **This campaign** |
| Opted out / unsubscribed | All | (contact grain exists in later select list) |
| Firm created / provisioned | All new firms | — |
| Audit finished | All audits | probably none (one-time) |
| Contact file imported | All imports | This batch / later |
| An objective was met | Completions of that kind | **This** objective / campaign |

Later trigger-select list on this SHA also names: **New contact**, **Contact uploaded information**, and a silent **Reference pack updated** (row may show, nothing fires until wired). A26 named list: do not add eligibility / halt / meeting as trigger-select rows unless a packet recuts that list.

Global vs local is **not** an Automations “Settings” modal. It matches Agents’ CSS nesting without copying that modal. Global/local of the event also depends on **which contacts are enrolled**.

## 8.3 Two kinds of actions

**1. Agents** — send people to a goal  
- Assign an **existing** sequence  
- Create **from a template**  
- Do **not** author a new agent here  
- Selecting an agent = the **whole sequence** (campaigns live inside). Which agents may be selected can be limited by the objective.

**2. In the application** — do a thing the app already does

Named in primitives:

| Action | Plain |
|--------|--------|
| Ascribe a tag | Put a tag on the person |
| Run an audit | Same audit the desk runs |
| Who this applies to | Contacts on the automation; does not start a mission now |
| Make a form | Automations owns the form; questions are the required data |
| Provision a firm | Later idea in primitives; canonical Automations **hears** firm created |

SQL `action.type` also includes `manage_lists`, `assign_task`, `notify_consultant` besides `call_agent`, `ascribe_tag`, `run_audit`. **UNRESOLVED:** whether those extra types are intended product actions or housing ahead of face. Primitives list is the face-named catalog; do not invent “write whatever into whatever table.”

If / Switch is **not** an action. It is a fork after a result.

## 8.4 Handle after a node (primitive)

When a node finishes, the next step has **every write that run made**. The action sends work to the **real** module. The next node **picks** which of those writes it is about. Not a boolean “done.” Not a short field catalog baked into the client.

Two doors, do not collapse:

| Door | Meaning |
|------|---------|
| On this canvas | Event → action → If on **that** run’s writes |
| A different automation | Hear the completion as an event (Global/Local) |

Hub `lastOutput` → `lastInput` is the smell of the handle, not the live path. Live walk is `workflowWalk.ts` (`previousWrites` / `chainWrites`). Do not recut that walker into a second machine.

## 8.5 Rules (interior of the operation)

Look at Hub Rules grain (Immigration · Service eligibility) as the plant:

- A **rule** is a composite of **conditions** and **constants**.
- Operator toggles outcome families on/off (pathway, gaps, profile & operations, category draws, draw competitiveness — Hub plate).
- Creatable; modular across industries.
- Two options: **GUI** (field · operator · constant) default where possible; **Custom** (named code / JSON) when GUI is not enough. Named code still toggles on/off.
- Prefer always defining a constant when possible.

**Two grains of condition — do not collapse:**

1. Inside the rule: field · operator · constant (or named code).
2. After the rule, on the DAG: **If** (two wires: true/false) or **Switch** (many paths + fallback) calling from the **previous result**.

A rule can emit re-engagement and/or reactivation **signals** — one, the other, or both. Do not split the rule to separate them. Engine 2 still chooses one outbound motion.

**Required data** is a missing output **class** and a **listing**, not a flag. Forms are built from that listing. Do not lock an objective type to a given signal. Collectible fields belong in tables (`collectible_fields`), not a unused code catalog.

## 8.6 Palette (product-face add-node)

On the Ant canvas, add-node kinds present in this snapshot:

| Node | Hint |
|------|------|
| Get | Retrieve data |
| Rule | Branch logic / evaluation |
| Action | Run a task or update |
| If | Two wires — true / false |
| Switch | Many paths plus fallback |
| Wait | Park until approval or a duration |
| Exit | End the workflow |

Click node = configure. `⋯` **Switch** on a Trigger/Action means **change this node’s kind** — that is not the Switch node. Do not mix those words.

Get maps previous writes into slots (`mappedSlots`). Direct input vs mapped box is plate law (INPUT-LOOK / MAPPED-BOX packets on PR #96).

## 8.7 Test, Run, Launch (later packets on origin #96)

- Provide **test data on the trigger** (not a Test tab).
- Canvas: **Save · Run · Launch**.
- Run walks now with those writes.
- Launch arms only.

## 8.8 Forms

The form for a **data request** is created in Automations (lean: **embedded** in the start-agent / objective node; form-as-own-graph-node is **not locked**). Agents does not create forms. Form occupancy / collectible fields (A40 / packet 021) bind questions to required-data listings.

## 8.9 Campaign failure

Failure of a campaign is an event (global and local). In-app action: ascribe a tag (named example: subscription bell). Packet **023**: failure mode is **stop spending, keep listening**. Exhaustion closes outbound attempts; the objective remains claimable if it later completes. Only **nullification** (firm pulls money — escrow era, not built) closes inbound.

## 8.10 Lineage

Queryable at minimum: what created the objective (agent vs hand); path to completion; completion event; time it took. Not a new module. **UNRESOLVED:** exact query UI.

## 8.11 What Automations is not

- Not overwriting 15:43.
- Not treating re-engagement / opt-in / reactivation as objectives (those are sequence templates / campaign names).
- Not creating agents.
- Not Hub as the app.
- Not a full catalog of operations or exit points (named silence).
- Not n8n-for-its-own-sake. The product is the handle after the node.

## 8.12 Older Seed §5.6 sketch (do not silently kill)

Seed named peer modules: Trigger, Constants, Conditions (If), Operations (stub), Rules, Actions (stub), plus a v1 walker shape `Trigger → Constants → Conditions/Branch → Rules → Action → Exit` (`V2-BACKLOG.md`). Phase Two recasts the face as a blank DAG with Get/Rule/Action/If/Switch. **Intended now:** Phase Two + packets. **Still required:** Constants packs, Rules toggles, structured eligibility output. Do not delete Constants/Rules because the smallest workflow is three nodes.

Arbitrary graph walk (cycles, parallel fan-in/out, multi-trigger join) is **deferred to a later walker generation** in `V2-BACKLOG.md` (repo root). Whether that backlog still binds after If/Switch shipped is **UNRESOLVED**; If/Switch did ship as a packet on this SHA’s ancestry.
