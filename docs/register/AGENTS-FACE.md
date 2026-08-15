# Agents — app-facing form (canvas, defaults, objective types)

**Seat:** Product Manager.  
**Status:** Founder expansion 2026-08-15 (tinkering). App-facing first. Not a second Agents flag — flag stays [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC**.  
**Why this file:** the log + SYSTEMS-GOAL still felt **insufficient as a comprehensive Agents document**. This is the face: what you place, what has a default, how deep you go. Systems extract from here; they do not invent a different module.  
**Join:** 15:43 flagship · [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md) (PR #84, campaign grain) · Phase Two log 17:25 (one description → prototype and systems).

---

## Founder excerpts (do not paraphrase away)

> There's a default of every single rule, that is, every single rule, escalation rule, failure rule, or… which is also part of escalation rules.

> I want us to specify everything we just said. … I feel like it's still not yet specified as its most comprehensive self, comprehensive document. I feel like it's still insufficient, the way it's organized for agents.

> Imagine the canvas. What you're placing on the canvas is both campaign and node. If it's just one campaign, it's when you add more campaigns that you see it consolidate into a canvas of campaigns. When it's just one campaign, like one thing, then it's like a canvas of nodes.

> You can always go that deep.

> It's really a node canvas.

> Let's look at a canonical two-campaign sequence. It's different from two-node sequence.

> The natural place I could see this being in is in one of the opt-in style campaigns. … opt-in style campaigns, you can have even a launch goal of it in the sequence.

> It's not one objective or one sequence. I'll call it objective type, right? Which are opt-in, reactivation, re-engagement. You can have multiple of them, I think. Technically, you should be able to have multiple inside the same sequence.

> In the first campaign, what is the first thing in there? You have the sequencing, like the order. You can choose a default. Everything is an override. There's always a default on everything. So you can decide to override the typical campaign sequencing, which is three, text, email, whatever. And even within them, there are escalation rules per node. Down to like, if it's not open. Down even to the attempt rules. … You can define every single rule that can exist. And everything can just be overridden.

> I want to see a UI of this. That's what I'm missing.

---

## Law of the face (short)

1. **Node canvas.** One canvas component. What you place is a **node**. A node is either a **campaign** or a **channel node** (text / email / form / …). Same place, same gesture.
2. **Grain follows count.** One campaign on the package → the canvas **is** nodes (email, text, …). Add a second campaign → the canvas **consolidates** to campaigns. You can always drill into a campaign and get the node canvas again.
3. **Two-campaign sequence ≠ two-node sequence.** Opt-in launch window → launch day is the canonical **two-campaign** picture. Text → email is a **two-node** picture inside one campaign.
4. **Objective type** (not “one sequence = one objective” as a prison): opt-in, reactivation, re-engagement. A package can hold **more than one** campaign, including more than one objective type, inside the same authored sequence/package.
5. **Launch goal can sit in the sequence** (opt-in style): completion is a node/campaign on the canvas, not only an inspector checkbox.
6. **Default on every rule. Authorship is override.** House/platform default exists for sequencing, escalation (failure is this family), attempt rules, every rule that can exist. The operator never starts from a blank law. They override where this package/campaign/node differs.
7. **Modular.** Every overridable thing is a row the dumb runtime can read. The canvas is the face of that modularity — not a drawing that invents a second law.

---

## What you are authoring (the package)

An **agent** is still the 15:43 thing: operator-authored outreach (sequencing, order deployed, firm/default/overrides, attempt/retry/escalation, goal as completion / escalation point).

The **canvas** is how that authorship looks.

```
PACKAGE  (the agent)
│
├─ objective type(s)     opt-in | re-engagement | reactivation   (can be more than one)
├─ campaigns[]           1 → node canvas; 2+ → campaign canvas
│    └─ nodes[]          channel nodes + optional goal node
│         └─ rules       sequencing, attempt, escalation (= includes failure)
│              └─ each:  Default  |  Override
└─ package goal          completion → other agent | workflow | end
```

**Canonical two-campaign (opt-in style):**

```
PACKAGE  objective type = opt-in
│
├─ Campaign “Launch window”     nodes: text → email → waitlist/form
│                                 mini-goal: waitlist (escalates inside the package)
└─ Campaign “Launch day”        nodes: sign-up …
                                  launch goal can sit here (sign-up = campaign/package completion)
```

That is **not** four nodes in one flat list. It is two campaigns. Flattening it to a Timeline of emails (today’s Ant editor) is the miss.

---

## Defaults and overrides (every rule)

**There is a default on every single rule.** Failure rules are **part of escalation rules** — not a separate authored family that splits the 15:43 flag into “actions on goals.”

| Rule family | Default (house) already smells like | Override grain |
|-------------|--------------------------------------|----------------|
| Campaign / channel **sequencing** (order deployed) | `seq_channel_ownership_order` text → email → form | package, campaign, or node |
| **Attempt** rules (windows, retries, what counts) | `rule_attempt_criteria` (30 min / 24 h / …) | package, campaign, or node |
| **Escalation** (includes failure): if not opened, if not clicked, if not replied → next | same criteria rows + channel ladder | **per node** (“down to if it's not open”) |
| **Goal / completion** | Story chain / `meeting_booked` / consent sequenced — not authored on the template today | package or campaign (launch goal on the sequence) |
| Content on a node | template cell / variable bindings | node |

`firm_sequence_binding` + `rule_*.firm_id` NULL is the **firm vs platform** default. This face adds **in-package** override: this campaign, this node, without forking a new law engine.

**Three control layers (founder — this is every control):**

| Layer | What | Lives in the UI |
|-------|------|-----------------|
| **Global** | House defaults for every rule family | **Settings** tab only |
| **Sequence** | This agent/package: override the typical sequencing, attempt, escalation | **On the canvas** (sequence chrome — not a modal far from the nodes) |
| **Campaign** | This campaign inside the sequence | **On the campaign node**, on the canvas |

**Channel node rules never move.** Every time you place that channel node (text / email / form), those attempt/escalation (“if not opened”) controls are **on the node**. They are not a fourth Settings page. They are the node’s law. Values still default from global (or sequence/campaign override); the **controls stay on the node**.

Failure is part of escalation at whatever layer you are on.

**Settings is global only.** Overrides do not live in Settings. If it is not global, it is on the canvas.

---

## Canvas behaviour

| On the package | Canvas shows | Place |
|----------------|--------------|--------|
| 0 campaigns | empty; first place is a campaign **or** a node (a node implies one campaign) | Campaign · Node |
| 1 campaign | **Node canvas** — text, email, form, goal chip | Node (drill is already here) |
| 2+ campaigns | **Campaign canvas** — each campaign is a node; arrow is goal/mini-goal met | Campaign; double-click / drill → node canvas |

Same React-flow-class surface as Automations, **not** Automations’ graph (triggers / conditions / call_agent). Agents canvas authors **engagement packages**. Automations canvas authors **when/motion**. Do not merge the two canvases.

**Today (honest, 2026-08-15 screenshot):** Operator → Configuration libraries → Agents → **Nudge / re-engagement**. Editor = Timeline of Email / Consultant-task cards + Step toolbar. Settings tab holds **all** attempt criteria (`rule_attempt_criteria`) and channel order — the global list sitting far from the steps. That is the opposite of “overrides on the canvas.”

---

## What this is not

- Not overwriting the 15:43 flag.
- Not putting Automations **triggers** on this canvas.
- Not restoring 14:58 “actions on goals” as a seventh list item — failure is **inside escalation**.
- Not a fourth objective type. `launch_day` is a **campaign** (or a goal sitting on the opt-in sequence), not a new objective type.
- Not minting tables in this file. Table-first extract is SA, after Story promotion where needed. Modularity law still: if it can be overridden, it must be a row.

---

## Open (tinkering — do not fill)

1. Plant this canvas on Ant (Type B) vs keep specifying.
2. May one package mix objective types in practice, or only “technically”?
3. Is the launch goal a **node** on the campaign canvas, a **campaign**, or a completion chip on Launch day?
4. Override inheritance: **campaign > sequence > global**. Channel-node controls always show; they display the winning value. Not five UIs.
5. Plant the canvas in `AntAgentWorkbench` (this module, this chrome) vs keep overlaying pictures.
