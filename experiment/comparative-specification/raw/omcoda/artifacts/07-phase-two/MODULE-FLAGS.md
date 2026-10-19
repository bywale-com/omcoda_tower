# Pass 7 — Phase Two (same method, micro scale)

**Sources:** `docs/register/PHASE-TWO.md` · `docs/register/PHASE-TWO-LOG.md` · `docs/register/AGENTS-FACE.md` · `docs/register/AUTOMATIONS-FACE.md` · `docs/register/PRIMITIVES.md` · `docs/register/SYSTEMS-GOAL.md` · `docs/register/SYSTEMS-OBJECTIVE-ESCROW.md` · `docs/register/SYSTEMS-CHANGE-PACKET-022.md` (header/status as present at SHA)

Phase Two is **not** a second Seed/World. The app is largely there; founder prompts “I should be able to …” map to missing **component** and/or missing **system**. Module-by-module, with perimeter.

## Flagship — what Agents is (2026-08-15 15:43 UTC)

**Founder wording. Do not enrich into a generated list.**

Agents is the place where the **operator** defines:

- **Outreach sequencing** — not only the sequence itself, the **order in which outreach is deployed**.
- That sequencing **per firm or as a default**, and other kinds of **overrides**.
- **Escalations** between attempts (retry / attempt rules). “Nodes” is the weaker phrasing.
- A **goal / goal criteria**. The goal is itself an **escalation point**: to **other agents**, to **other workflows**, or **it ends there**. Once it is met, it is met. That is the **endpoint**.
- Everything in the middle of that is **modular**.

Author seat = **operator**. Firm / default / overrides = **scope of application**, not the nature of the module.

The 14:58 numbered list (including triggers as Agents interior) is **not** the flag.

## App-facing Agents grain (AGENTS-FACE — law of the face)

This is PM face law for the operator authorship module. It does not overwrite 15:43. It does not mint tables.

- A **sequence** is a blank container. It can hold **multiple campaigns**. Each campaign = **one objective**.
- Two objectives → two campaigns. When a campaign’s objective is met, you may string the next. That distance is **not** a qualify node. Captions on plates are not spec.
- **Objective ≠ sequence.** Opt-in / re-engagement / reactivation are **sequence templates**, not objective picker labels.
- First thing on a campaign is the **objective**. Untemplated objective = **binary event** (click this link / book this calendar / submit this form). Then name it.
- Channels are the **medium**. Channel rules = escalation on that medium. Attempt rules are **not** at the channel. An attempt is a **cycle** of the same sequence.
- Sequencing (how many channels, order) lives at **campaign** level.
- Content lives **inside** the channel node (Override content).
- **Override this** on a campaign reveals channel nodes as wires. Toggles do not migrate.
- Rules nest like CSS: global (Agents Settings) → sequence Settings → campaign override → channel. No override → fall back up.
- Empty world: no templates until authored.
- Enroll on this sequence’s Contacts **starts the mission now**. Automations enroll is the other door (on an event).
- Engagement chart is a tree of outreach. It does **not** draw lineage to the creating trigger. Lineage is queryable (Automations).

**Spoken ladder in mocks includes call.** Stood-up machine still has **form**. Do not silently drop form. Call-on-face is enrichment; form-in-machine remains Seed/World/Story 7b.

**Hub vs Ant:** product face = `/prototype-ant`. Hub is not the app. How trees still mark Hub as existing-wrong-seat for authorship; Ant workbenches are the translation of operator Configuration libraries.

## Automations — entered from Agents outskirts (AUTOMATIONS-FACE)

Automations is the **brain / operations**. Agents is where people are sent to a goal.

Definite middle: **On this event** (schedule or trigger) → **perform this operation** → **on this kind of result do X / on that kind do Y**. DAG-like. Smallest legal workflow = trigger · rule · action. Canvas can **chain**.

Join laws that are specified:

- Forms (data requests) are created in **Automations**, not Agents.
- A data request is already an event of origin for Agents (recursive).
- Automations does **not** create agents. Assign existing, or create from a template.
- Select an agent = the whole sequence. Campaigns live inside sequences.
- A rule is a composite of conditions + constants; togglable outcome families; GUI default, named code escape.
- Rule may emit re-engagement and/or reactivation signals — one, the other, or both. Engine 2 still chooses one motion.
- **Required data** is a missing output class (listing, not a flag). Forms bind to that listing. Deterministic — no AI to decide required fields.
- Two grains of condition: inside the rule (field · operator · constant) vs If node after previous result. Do not collapse.
- Events have **global** and **local** grain. That is not “Settings.”
- All objectives are events. The write-back **is** the event. No special return wire.
- Campaign failure is an event; in-app action may ascribe a tag.
- After a node: **every write that run made**. Next node picks. (`PRIMITIVES.md`; SA 015 is the walk — this experiment does not recut it.)

## Primitives (listen / do)

**Listen:** in-app event (Global or Local) · Schedule · Manual · Webhook (in from outside — not an action).

Named in-app events (shape so far — not “any row changed”): form submitted · campaign failed · opted out · firm created · audit finished · contact file imported · objective met.

**Do:**

1. **Agents** — assign existing sequence, or from a template. Do not author a new agent in Automations.
2. **In the application** — ascribe a tag · run an audit · who this applies to · make a form · provision a firm (later). Not “write whatever table.”

## Three layers any inhabited Agents description must name

1. **Authorship** — operator defines sequence, order, content, attempt rules, firm/default/overrides, campaign composition, goal as completion, success destination, failure.
2. **Record** — Board / Client Data Activity show what actually ran.
3. **Unattended** — tick, inbound, send, completion, exhausted-campaign failure. Nobody present. Panes must stay true after the operator leaves.

Layer 3 is still app-facing. It is not Automations’ graph.

## Parked founder expansions (not Story musts)

### Goal / class-as-objective (`SYSTEMS-GOAL.md`)

Goal = completion of an objective. Sequence classes = classes of objective (opt-in, re-engagement = data request, reactivation = meeting request). Mini-goals are checkmarks inside a class. Escalation already has levels; **goals as escalation events** emerge between campaigns. Reactivation’s completion **is** meeting booked.

**2026-08-21 mechanism note (does not change the wording rule):** objective met is akin to a Local event; housing is the event mechanism Tower already has; 15:43 escalation destinations need **no destination column and no `goal` table** — escalation is a **subscription** to `objective_met`. Story §7 promotion remains a **wording** must, not a structural one.

### Objectives as billable unit (`SYSTEMS-OBJECTIVE-ESCROW.md`)

Direction, **not a build order**. Objective is the billable unit. Pursuing / Exhausted (stop spending, keep listening) / Nullified (firm withdraws money; inbound refused). Exhaustion is ours; nullification is theirs. Do not extract Requirements until Story §3 is promoted.

## Perimeter opened from Agents (not fully redesigned here)

Automations (when / motion / structured info / forms / in-app actions) · firm/contact bind · what goes out (send) · book-in · Activity record · meeting_booked (system 12) as loop win, distinct from authored goal-criteria.

## Open tinkering (do not fill)

From AUTOMATIONS-FACE “Open”: full operations list; full exit-point list; form-as-node vs embedded (lean embedded); remaining rule output classes besides required data; queryable lineage not minted as a table from a sentence; spoken “call” vs form on the machine.

From AGENTS-FACE: window’s named “one thing” left open as a name; mix types; deeper-than-channel grain.

These are **named opens**, not catch-all TBD.
