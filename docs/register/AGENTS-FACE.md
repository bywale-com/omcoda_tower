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

> A sequence is a blank sequence — you can have multiple goals in there.

> Even just in the opt-in, two clear objectives. Because the first one is met, it justifies the second phase.

> There's a reason why we launch and don't just start reactivating: we want them to opt-in. The launch window is to build up that desire. Launch day is actually the opt-in day.

> If there are two things that we want to meet — two objectives — they require their own campaign. If they meet that objective, they qualify for the second phase. That's the objective criteria between those two.

> Channels are the nodes by which we run our outreach. Forget about [channel] objectives — they have their own rules: channel rules, attempt rules. Sequencing is more so at the campaign level, not at the channel level. Sequencing is: how many channels we have here.

> Content is at the campaign level as a default. Content is 1 and 1 with nodes. You can override content if you're going down to modifying the nodes.

> Channels are the medium. A sequencing method. Channels come with channel rules — those are escalation rules per nodes. Campaigns come with defaults for channel rules. They come with defaults for attempt rules.

> There's really only one first toggle that sits at the bottom of a campaign node: Override this. When you click Override this, it opens up that node. It reveals those nodes as wires connected to the one that was just overridden.

> The toggles that live at the campaign level always remain at the campaign level. The toggles that now open up the lower nodes … live in those nodes. You go through the node, open it up, and then it reveals something deeper about that node with a wire that connects it. Now you're seeing a real full graph.

---

## Law of the face (short)

1. **Sequence is blank.** An agent sequence is a container. It can hold **multiple goals** (multiple campaigns). Not one-objective-or-nothing.
2. **Two objectives → two campaigns.** If you want two things met, each requires its own campaign. The first campaign’s goal **qualifies** them for the second. That qualification **is** the objective criteria between the two.
3. **Opt-in (the obvious two):** Launch window builds desire (why we don’t just start reactivating). Launch day **is opt-in day**. Window objective met → qualify for opt-in day.
4. **Campaigns have objectives. Channels do not.** Channels are the **medium** — the nodes outreach runs on. They have **channel rules** and **attempt rules**, not channel-objectives.
5. **Sequencing lives at campaign level** (“how many channels here, in what order”) — not at the channel node.
6. **Content defaults at campaign** (preset campaigns). Content is 1:1 with nodes; override content by opening the node.
7. **Override this** is the first toggle on a campaign. It **opens the campaign** and **reveals channel nodes as wires** connected to it. Campaign-level toggles **stay on the campaign**. Channel-level toggles **live on those revealed nodes**. Open a channel node → deeper still, still wired. That is the full graph.
8. **Settings = global only.** Defaults exist for every rule. Authorship is override. Modular: overridable ⇒ a row.

---

## What you are authoring (the package)

An **agent** is still the 15:43 thing. The **sequence** is a **blank container** for campaigns (goals). The **canvas** is how that looks.

```
SEQUENCE  (blank — can hold multiple goals)
│
├─ Campaign  (has a campaign objective)
│    sequencing (channel order / how many channels)     ← campaign level
│    content defaults                                   ← campaign level
│    defaults for channel rules + attempt rules
│    [ Override this ]  → reveals wired CHANNEL nodes
│         └─ Channel node  (medium: text / email / form)
│              channel rules (escalation per node)      ← on the node, never move
│              attempt rules                            ← on the node
│              content override                         ← on the node
│              [open] → deeper, still wired  = full graph
└─ next Campaign  (only if prior campaign objective met → qualify)
```

**Opt-in — two clear objectives, two campaigns:**

| Campaign | Objective | Why it exists |
|----------|-----------|----------------|
| **Launch window** | One thing that raises the chance of opt-in (build desire) | We don’t start at reactivation. Window first. |
| **Launch day = opt-in day** | They opt in | Justified only because the first objective was met — they **qualify** for this phase |

Between them: **goal accomplished → qualify for phase 2.** That is the edge on the canvas, not a Settings row.

Spoken “email, text, and call”: **stood-up ladder is text → email → form.** Call is not a fourth medium unless Story says so. Capture the wording; do not mint a call channel here.

That is **not** four emails in one Timeline. Flattening it is the miss.

---

## Defaults and overrides (every rule)

**There is a default on every single rule.** Failure rules are **part of escalation rules** — not a separate authored family that splits the 15:43 flag into “actions on goals.”

| Rule family | Default lives | Override lives |
|-------------|---------------|----------------|
| **Sequencing** (how many channels, order) | Campaign (from global) | **On the campaign** — not the channel |
| **Content** | Campaign (preset campaigns) | Channel node if you go down |
| **Channel rules** (escalation per node, incl. failure) | Campaign brings defaults | **On the channel node** (never move) |
| **Attempt rules** | Campaign brings defaults | **On the channel node** |
| **Campaign objective** | The campaign itself | Qualify-edge to the next campaign |

`firm_sequence_binding` + `rule_*.firm_id` NULL remains firm vs platform. In-package override is this graph, not a second Settings list.

**Where toggles sit (after Override this):**

| Layer | UI |
|-------|-----|
| **Global** | Settings tab only |
| **Campaign** | Always on the campaign node (sequencing, content defaults, Override this) |
| **Channel** | On the revealed channel node (channel rules, attempt rules, content override). Open again → deeper, wired. |

**Settings is global only.**

---

## Canvas behaviour — Override this (the graph)

Closed: you see **campaign** nodes on the sequence (blank sequence, as many goals as you place). Between campaigns: **qualify** (first objective met → second phase).

On each campaign, **one first toggle at the bottom: Override this.**

| Click | What happens |
|-------|----------------|
| **Override this** | Opens that campaign. **Reveals channel nodes as wires** connected to it. Campaign-level toggles **remain on the campaign**. |
| Open a **channel** node | Reveals that node’s channel rules / attempt rules / content **on the node**, still wired. Full graph. |

Do not jump to a Settings modal. Do not replace the campaign with a Timeline. The campaign stays; the channels **hang off it**.

**Today (honest, screenshot):** Editor = Email/Task Timeline. Settings = all `rule_attempt_criteria`. Opposite of this graph.

---

## What this is not

- Not overwriting the 15:43 flag.
- Not putting Automations **triggers** on this canvas.
- Not restoring 14:58 “actions on goals” as a seventh list item — failure is **inside escalation**.
- Not assigning **objectives** to channels. Channels = medium + rules.
- Not putting **sequencing** on the channel node. Sequencing = campaign.
- Spoken “call” as a third channel: not stood up; ladder is text / email / form until Story says otherwise.
- Not minting tables in this file. Table-first extract is SA, after Story promotion where needed. Modularity law still: if it can be overridden, it must be a row.

---

## Open (tinkering — do not fill)

1. Plant this canvas on Ant (Type B) vs keep specifying.
2. May one package mix objective types in practice, or only “technically”?
3. Launch day = opt-in day: confirm the window’s single objective (the “one thing” that raises opt-in chance) — waitlist, or still unnamed?
4. Plant `Override this` reveal in `AntAgentWorkbench` vs keep pictures.
