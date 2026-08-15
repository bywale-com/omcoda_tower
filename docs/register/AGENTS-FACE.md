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

> If no one has created any templates, then there are no templates. Opt-in sequence, re-engagement sequence, reactivation sequence — they're just templates.

> When you're creating a campaign the first thing you define is the objective. … If you look at /hub … automations … you start with the trigger … the first thing you do is you actually have to add the event configuration. It just sits inside of like that's where node. So that's the same idea.

> Objective is different from sequence. A sequence houses the full … sequences have templates. But objectives also have templates. You wouldn't see opt-in in objectives. Opt-in is a sequence. Re-engagement is a sequence … the full canvas. Objective is like a single campaign. Two perfect examples … in the opt-in sequence are the launch window … launch day. Some additional ones.

> There is an absolute way to create an objective. Very binary. Very direct.

> What is selecting an objective that has not been templated? It looks like an event. … Everyone that we enroll into this … campaigned … to do this one thing … yes or no. He didn't happen. Do we want them to click this link? We want them to book a meeting in this calendar. … Submit this form … complete this form. … You name it, as like … meeting booked. … Launch window … that would probably be something like we wanted to click this link.

> Where does a webhook that searches if their name is inside of something … if it is that event is completed for them. … That's down the line. … Our system should not be so complicated that that's not possible.

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
9. **Empty world:** no templates until someone authors them. Opt-in / re-engagement / reactivation are **sequence templates** (the full canvas), not objective names.
10. **Objective ≠ sequence.** Objective = **one campaign**. Sequences have templates; objectives have templates. You do not put “opt-in” in the objective picker.
11. **First thing on a campaign is the objective.** Hub Automations: trigger node → **Add configuration**. Same seat, not the same module — do not import Automations triggers onto this canvas.
12. **Untemplated objective is a binary event** (word “event” may change). One yes/no: everyone enrolled is campaigned to do **this one thing**. Happened or it didn’t. Then you name it. Templated objective populates the rest of that campaign.

---

## What you are authoring (the package)

An **agent** is still the 15:43 thing. The **sequence** is a **blank container** for campaigns (goals). The **canvas** is how that looks.

```
SEQUENCE TEMPLATE  (blank canvas — opt-in / re-engagement / reactivation)
│
├─ Campaign  = one OBJECTIVE
│    [ first thing: the objective ]
│         pick a template  → populates the campaign
│         or from scratch  → binary event (yes/no), then name it
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

**Opt-in — campaigns (objectives) on the sequence template:**

| Campaign (objective template) | Binary event (from-scratch shape) | Why it exists |
|----------|-----------|----------------|
| **Launch window** | Spoken: probably **click this link**. Not “waitlist vs unnamed” as the important question. | Build desire. Why we don’t start at reactivation. |
| **Launch day = opt-in day** | They opt in (yes/no) | Justified only because the first objective was met — they **qualify** |
| **Additional** | Unnamed here | Founder: there are a couple more in this sequence |

Between campaigns: **goal accomplished → qualify for the next.** That is the edge on the canvas.

Picking a **templated** objective populates everything related to that template. From scratch: configure the binary event, then name it.

Spoken “email, text, and call”: **stood-up ladder is text → email → form.** Call is not a fourth medium unless Story says so.

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

**Today:** Editor → **Mock** (five beats, objective as a modal). Timeline (today) is the save path. Settings is global defaults.

---

## Mock map (what you said → what you can see)

Not one picture. Five beats, one labeled mock. Objective is a **modal** on the canvas (same idea as Hub Add configuration). Sequence templates are their own beat because that picker is a different layer.

| Beat | What you said | Same mock or own |
|------|----------------|------------------|
| **1. Sequence templates** | Empty world; opt-in / re-engagement / reactivation are sequence templates, not objectives | Own beat (different picker) |
| **2. Add objective** | First thing on a campaign. Template (launch window, launch day, additional) vs from scratch (click / calendar / form, then name it) | **Modal** on the canvas |
| **3. Two campaigns** | Two objectives → two campaigns. Qualify. Launch day = opt-in day | Canvas |
| **4. Override this** | First toggle. Reveals text / email / form as wires. Campaign toggles stay | Canvas |
| **5. Open a channel** | Node toggles live on the node. Deeper grain still wired | Canvas expand |

Webhook / table lookup is named, not mocked. Call channel is not mocked.

---

## Objective first (binary event) — two template layers

Hub Automations (`/hub`): empty canvas → add a trigger → on that node, **Add configuration** (event configuration). Campaign authorship uses the same *seat*: the first thing on a campaign is the **objective**. That is not a license to put Automations triggers on the Agents canvas.

**From scratch:** the untemplated objective looks like an event (name may change). Everyone enrolled in this campaign is campaigned to do **one thing**. Yes or no. Then you name it.

| Spoken from-scratch | Binary |
|---------------------|--------|
| Click this link | Did they, or not |
| Book a meeting in this calendar | Did they, or not |
| Submit / complete this form | Did they, or not |
| Later: webhook / table (name in a list) | Did they, or not — do not mint now |

**From a template:** pick an **objective template** (a campaign, e.g. launch window). It populates everything related to that template. You do not pick “opt-in” here — that is a **sequence template**.

Empty world: no templates exist until authored. Keep that in the open.

---

## Further enrichment (agent alignment — not a second flag)

Founder: “I’m not circling, I’m enriching, and I think you can even further enrich.” This section is that enrichment. It does not replace 15:43 or the excerpts above.

**The agent is a sequence, not a campaign.** The list item (Opt-in, Nudge, Reactivation) is a **blank sequence**. Campaigns live inside it. Opt-in is the teaching case because it already needs **two** objectives, therefore **two** campaigns.

**Why a launch window exists (the meta-reason).** We do not start at reactivation. The window’s job is to **build desire** for opt-in. Launch day **is** opt-in day. Phase 2 is justified only because phase 1’s objective was met — they **qualify**. That qualify-edge is the 15:43 “goal is itself an escalation point,” drawn as a wire between campaigns, not as a Settings row and not as a fourth channel.

**One thing in the window.** Not the waitlist question. The window’s objective is still **one binary event** — everyone enrolled is campaigned to do that one yes/no. Spoken from-scratch for the window: probably **click this link**. Do not split the window into two campaigns unless there are two objectives.

**Two template layers.** Sequence templates = the full canvas (opt-in, re-engagement, reactivation). Objective templates = a single campaign (launch window, launch day, plus additional unnamed in opt-in). Empty world: no templates until authored. Keep that in the open.

**First thing on a campaign is the objective.** Same *seat* as Hub Automations (`/hub`): you add a trigger, then on that node **Add configuration**. Here you add a campaign, then the first thing on it is the objective. Do **not** put Automations triggers on this canvas.

**Untemplated objective = binary event** (the word “event” may change). Click this link · book this calendar · submit this form. Happened or it didn’t. Then you name it. Webhook / table lookup (name in a list → completed) is down the line; the system should not be so complicated that it is impossible. Do not mint that now.

**Toggle locality (law of the graph).** A toggle lives at the layer it governs and **does not migrate** when the graph opens.

| If the toggle is about… | It lives… | After Override this |
|-------------------------|-----------|---------------------|
| The campaign as a whole (sequencing, content defaults, the objective, Override this) | On the campaign node | **Still on the campaign** |
| One medium (channel rules, attempt rules, content for that node) | Does not exist until the node exists | **On that channel node** |

So Override this is not “show more fields on this card.” It **materializes the child layer**. The campaign stays. Channel nodes **hang off it on wires**. Open a channel → that node’s toggles appear **on it**, still wired. That is the full graph.

**Channels are a sequencing method, not a goal layer.** Choosing how many channels, which, in what order **is** campaign sequencing. After Override this, those choices are visible as the hanging nodes. Reordering them is still a campaign-level fact; the nodes are the display of that method. Channels come with **defaults** for channel rules (escalation per node) and attempt rules (retries). Campaigns **bring** those defaults. You override them on the node.

**Content is 1:1 with nodes.** Campaign holds the default pack. Opening a node is how you override that node’s copy. There is no separate content canvas.

**Closed campaign = accepting defaults.** Most of the time Override this stays off. Open it only to author at the channel grain.

**Settings never receives these overrides.** Global defaults only. If a control is specific to a campaign or a node, it is already on the graph.

**Deeper than a channel** is still a wire off that channel, not a jump. What that next grain *is* (attempt rows as nodes vs rules listed on the node) is still open — do not mint attempt-nodes until the founder names them.

---

## What this is not

- Not overwriting the 15:43 flag.
- Not putting Automations **triggers** on this canvas. The Hub analogy is the **seat** (first thing on the node is configuration), not a copied trigger picker.
- Not treating “opt-in” as an objective template. Opt-in is a **sequence** template.
- Not minting webhook / table-query completion now. Named as possible later.
- Not restoring 14:58 “actions on goals” as a seventh list item — failure is **inside escalation**.
- Not assigning **objectives** to channels. Channels = medium + rules.
- Not putting **sequencing** on the channel node. Sequencing = campaign.
- Spoken “call” as a third channel: not stood up; ladder is text / email / form until Story says otherwise.
- Not minting tables in this file. Table-first extract is SA, after Story promotion where needed. Modularity law still: if it can be overridden, it must be a row.

---

## Open (tinkering — do not fill)

1. Additional objectives inside the opt-in sequence besides launch window and launch day — unnamed.
2. What we call the untemplated objective (“event” vs another word).
3. May one sequence mix objective types in practice, or only “technically”?
4. Opening a channel: rules listed on the node vs a further wired grain. Founder said “reveals something deeper with a wire” — grain unnamed.
5. Spoken “call” as a third channel vs stood-up ladder text / email / form.
6. Mock of this shape — five beats on Editor → **Mock** (sequence templates · add objective modal · two campaigns · Override this · open a channel).
