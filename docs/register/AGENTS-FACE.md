# Agents — app-facing form (canvas, defaults, objective types)

**Seat:** Product Manager.  
**Why this file:** law and excerpts. The **image lineup + spec** is [`AGENTS-UI-BLUEPRINT.md`](./AGENTS-UI-BLUEPRINT.md). Systems extract from both; they do not invent a different module.  
**Join:** 15:43 flagship · [`AGENTS-UI-BLUEPRINT.md`](./AGENTS-UI-BLUEPRINT.md) · SA ascribe package [`AGENTS-SA-PACKAGE.md`](./AGENTS-SA-PACKAGE.md) · Automations face (entered from here) [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md) · [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md) (PR #84) · Phase Two log 17:25.  
**Status:** Settings plates locked. UI blueprint lined up 2026-08-15 19:50. SA package [`AGENTS-SA-PACKAGE.md`](./AGENTS-SA-PACKAGE.md) 20:00. **Creation place complete enough to leave** (20:24) — Automations is next: [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md). Flag stays [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC**.

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

> Override content should live as a small button inside of the channel. It shouldn't live outside as a connect. Once you override content you're giving yourself access to modify the content … a text box would open up or if it's an email the email [editor] would open up inside of that channel node.

> Attempt rules are not at the channel level. Attempt rules are different from channel / escalation rules. What are attempt rules? Number of attempts. Attempt is a cycle of the exact same sequence — unless you've specified that on nth attempt you want a different sequence. An attempt is a container. At the end of the sequence when it fails, that's when it moves to the next attempt. The distance between attempts, after the failed last node of an attempt, can also be a rule. Those are the parameters for your attempt.

> Escalation rules are what should be called channel rules … like with text, someone doesn't open … email, someone doesn't click a link in a specific amount of time.

> Every single rule, whether it's an escalation rule or a channel rule … can also be set globally, but they can also exist at the campaign layer, or even at the sequence layer. Everything is always an override. If you do not override, it's gonna fall back up … sequence … then global. Like CSS nesting.

> Attempts are per campaign. … It can live at the campaign level. We already know it lives at the deepest in the sequence level or it lives in the settings modal. When it's at Agents, it's global. When it's at sequence, it's for the sequence. Attempt rules can live at the Agents and Sequence settings modal. When it's in the campaign, it's per campaign. If it's per sequence it lives in the settings modal. It wouldn't live [in the middle of the canvas] because this is essentially per sequence.

---

## Law of the face (short)

1. **Sequence is blank.** An agent sequence is a container. It can hold **multiple goals** (multiple campaigns). Not one-objective-or-nothing.
2. **Two objectives → two campaigns.** If you want two things met, each requires its own campaign. The first campaign’s goal **qualifies** them for the second. That qualification **is** the objective criteria between the two.
3. **Opt-in (the obvious two):** Launch window builds desire (why we don’t just start reactivating). Launch day **is opt-in day**. Window objective met → qualify for opt-in day.
4. **Campaigns have objectives. Channels do not.** Channels are the **medium**. **Channel rules = escalation on that medium** (not opened, not clicked, …). **Attempt rules are not at the channel.** An attempt is a **container / cycle** of the same sequence.
5. **Sequencing lives at campaign level** (“how many channels here, in what order”) — not at the channel node.
6. **Content lives inside the channel node** as an **Override content toggle**. On → the node **expands** to contain that medium’s content-creation block (SMS composer, email composer, call script). Not a wired sibling. Not a small button. Attempt-specific copy is a **variation on that same node**.
7. **Override this** is the first toggle on a campaign. It **opens the campaign** and **reveals channel nodes as wires**. Campaign-level toggles **stay on the campaign**. Open a channel → **channel rules** (escalation) hang off as the channel’s deeper grain. Content stays inside.
8. **Rules nest like CSS.** Global (Agents module Settings) → sequence Settings → campaign if overridden → channel. If you do not override, fall back up.
9. **Attempt rules sit where their grain is.** Per **campaign** → on that campaign (visible, no gray area). Per **sequence** → **Sequence Settings** modal, not in the middle of the canvas. **Global** → **Agents Settings**. Do not draw attempt cycles between campaigns.
10. **Empty world:** no templates until someone authors them. Opt-in / re-engagement / reactivation are **sequence templates** (the full canvas), not objective names.
11. **Objective ≠ sequence.** Objective = **one campaign**. Sequences have templates; objectives have templates. You do not put “opt-in” in the objective picker.
12. **First thing on a campaign is the objective.** Hub Automations: trigger node → **Add configuration**. Same seat, not the same module — do not import Automations triggers onto this canvas.
13. **Untemplated objective is a binary event** (word “event” may change). One yes/no: everyone enrolled is campaigned to do **this one thing**. Happened or it didn’t. Then you name it. Templated objective populates the rest of that campaign.

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
│    rules fall back: campaign override → sequence Settings → Agents Settings
│    attempt rules when per-campaign live ON this campaign
│    [ Override this ]  → reveals wired CHANNEL nodes
│         └─ Channel node  (medium: text / email / form)
│              [ Override content ]  ← TOGGLE INSIDE the node; on → node expands
│                   to the content-creation block for that medium
│                   variation at attempt N  (same node, same sequence cycle)
│              channel rules = escalation (not opened, not clicked, …)
│                   hang off this node when you open the channel
│              attempt rules do NOT live here
│
│    Attempt = a cycle of this campaign’s sequence work
│         after last node fails → next attempt
│         attempt rules at sequence/global → Settings modals, not the canvas middle
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

Spoken ladder in this mock: **text → email → call** (call via ElevenLabs). Stood-up machine still has form; do not silently drop form from the machine. Call is now on the face because the founder asked to see the node.

That is **not** four emails in one Timeline. Flattening it is the miss.

---

## Defaults and overrides (every rule)

**There is a default on every single rule.** Failure rules are **part of escalation rules** — not a separate authored family that splits the 15:43 flag into “actions on goals.”

| Rule family | What it is | Where it lives |
|-------------|------------|----------------|
| **Channel rules** | Escalation on that medium (not opened, not clicked, …) | Channel node when opened. Fallback: campaign → sequence Settings → Agents Settings (global) |
| **Attempt rules** | Number of attempts; cycle; distance after the failed last node; optional nth-attempt exception | **Per campaign:** on that campaign. **Per sequence:** Sequence Settings. **Global:** Agents Settings. Never in the middle of the canvas. Never on the channel. |
| **Content** | What goes out on that medium | **Button inside the channel node.** Editor opens in the node. Sequence / global possible via that sequence’s Settings / Agents Settings. Attempt = a variation on the same node. |
| **Sequencing** | How many channels, order | Campaign |
| **Campaign objective** | The one yes/no | The campaign itself → qualify-edge |

`firm_sequence_binding` + `rule_*.firm_id` NULL remains firm vs platform. In-package override is this graph, not a second Settings list.

**Where toggles sit (after Override this):**

| Layer | UI |
|-------|-----|
| **Global** | Agents **module** Settings |
| **Sequence** | **That sequence’s** Settings |
| **Campaign** | On the campaign node (sequencing, Override this). Campaign can override sequence/global. |
| **Channel** | Channel rules (escalation) hang off the open channel. **Override content** is a button **inside** the node. |
| **Attempt** | Not that stack. A cycle of the same sequence. Content variation on the channel node. |

Fallback is CSS-like: no override → sequence → global.

---

## Canvas behaviour — Override this (the graph)

Closed: campaign nodes on the sequence. Between campaigns: **qualify**.

On each campaign, **one first toggle at the bottom: Override this.**

| Click | What happens |
|-------|----------------|
| **Override this** | Opens that campaign. **Reveals channel nodes as wires**. Campaign-level toggles **remain on the campaign**. |
| Open a **channel** | **Channel rules** (escalation) hang off as wired deeper grain. **Override content** is a small button **inside** the channel — editor opens in the node (text, or the email composer). **Attempt rules do not appear here.** |

Do not replace the campaign with a Timeline. The campaign stays; the channels **hang off it**.

**Today:** generated images. Beat 5 revised: content inside the node; attempt rules off the channel.

---

## Mock map (what you said → what you can see)

Not one picture. Five beats, one labeled mock. Objective is a **modal** on the canvas (same idea as Hub Add configuration). Sequence templates are their own beat because that picker is a different layer.

| Beat | What you said | Same mock or own |
|------|----------------|------------------|
| **1. Sequence templates** | Empty world; opt-in / re-engagement / reactivation are sequence templates, not objectives | Own beat (different picker) |
| **2. Add objective** | First thing on a campaign. Template (launch window, launch day, additional) vs from scratch (click / calendar / form, then name it) | **Modal** on the canvas |
| **3. Two campaigns** | Two objectives → two campaigns. Qualify. Launch day = opt-in day | Canvas |
| **4. Override this** | First toggle. Reveals text / email / form as wires. Campaign toggles stay | Canvas |
| **5. Open a channel** | Channel rules (escalation) hang off. Content = button inside. Attempt rules are not here | Canvas expand |

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
| The campaign as a whole (sequencing, the objective, Override this) | On the campaign node | **Still on the campaign** |
| Escalation on that medium (channel rules) | Does not exist until the node exists | **Wired off the open channel** |
| Content for that medium | **Override content toggle** inside the channel node | On → node expands to the composer |
| Attempt (cycle count, gap after failed last node) | **Not the channel** | Attempt is a container around the sequence |

So Override this is not “show more fields on this card.” It **materializes the child layer**. The campaign stays. Channel nodes **hang off it on wires**. Open a channel → **channel rules** hang off; **content** stays inside as a **toggle** that expands the node.

**Channels are a sequencing method, not a goal layer.** Choosing how many channels, which, in what order **is** campaign sequencing. Channel rules = escalation on that medium. Attempt rules = parameters of the **cycle**, not of the medium.

**Content is inside the channel node.** **Override content** is a toggle. On → the node expands to the composer. Sequence / global content is possible (sequence Settings / Agents Settings). Attempt copy is a **variation on that same node** for that cycle.

**Closed campaign = accepting defaults** (sequence, then global). Open Override this only to author at the channel grain.

**Two Settings surfaces — same families, different grain.**

| Surface | Grain |
|---------|--------|
| **Agents Settings** | Global defaults for every rule family below |
| **Sequence Settings** | This sequence. Inherit from Agents unless overridden |

What belongs in both (the bunch, given everything said):

- **Attempt rules** — number of attempts; wait / distance after the failed last node; same sequence unless nth-attempt is different
- **Channel rules (escalation)** — per medium: text not opened / not delivered; email not opened / not clicked in time; form not submitted
- **Content** — per-medium defaults (possible at global and at sequence)
- **Sequencing** — default channel order (text → email → form)

Per-campaign attempt rules stay **on the campaign**. They do not appear as a strip in the middle of the sequence canvas.

**Deeper than a channel** for escalation is still a wire off that channel. Content is not that wire. Attempt rules are not that wire.

---

## What this is not

- Not overwriting the 15:43 flag.
- Not putting Automations **triggers** on this canvas. The Hub analogy is the **seat** (first thing on the node is configuration), not a copied trigger picker.
- Not treating “opt-in” as an objective template. Opt-in is a **sequence** template.
- Not minting webhook / table-query completion now. Named as possible later.
- Not restoring 14:58 “actions on goals” as a seventh list item — failure is **inside escalation**.
- Not putting **attempt rules** on the channel node. Attempt is a cycle of the sequence.
- Not hanging **content override** off the channel as a connected sibling. It is a **toggle inside** the node; on → the node expands to the content-creation block.
- Not assigning **objectives** to channels. Channels = medium + escalation rules.
- Not putting **sequencing** on the channel node. Sequencing = campaign.
- Spoken “call”: now on the face as a channel node (ElevenLabs). Machine still has form until Story/SA extract. Do not mint tables here.
- Not minting tables in this file. Table-first extract is SA, after Story promotion where needed. Modularity law still: if it can be overridden, it must be a row.
- Not creating **forms** here. A data-request form is Automations. Agents sends people to accomplish the goal. See [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md).

---

## Open (tinkering — do not fill)

1. Additional objectives inside the opt-in sequence besides launch window and launch day — unnamed.
2. What we call the untemplated objective (“event” vs another word).
3. May one sequence mix objective types in practice, or only “technically”?
4. Call via ElevenLabs — face only for now; machine still form.
5. Where campaign-level rule overrides sit besides attempt-on-campaign (sequencing already on the campaign).
6. Settings images locked canonical.
