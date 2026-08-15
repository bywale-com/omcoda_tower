# Phase Two — log

**Purpose:** Running log so a new agent can start where we stopped. Thesis stays in [`PHASE-TWO.md`](./PHASE-TWO.md). Nothing is more important than this file staying current.

**Current (read first, then the newest stamp at the bottom):** Agents **flagship** = 2026-08-15 15:43 UTC. Before building: unclosed loops **23:07**. Events: form completion; **global vs local** (not Settings) **23:16**. SA packages waiting. Do not plant.

**How we maintain this log**

- Unless the founder says “mark this as a separate entry/doc,” talk lands **here** — append-only, newest at bottom. Do not scatter one-offs.
- **Flagship / definition statements:** capture **founder wording**. Do not generate a substitute list that overwrites the flag. If you enrich, label it as agent alignment — never as the flag.
- **Cadence floor** while in session: **at least four times a day**; denser conversation → denser stamps.
- Agent **notices inflection** (flag restated, Type A/B split, module enter/exit, perimeter newly opened, founder correction of an agent restatement) and **asks** whether to stamp. When in doubt, stamp here.
- Area: same register folder as the thesis.

---

## 2026-08-15 14:49 UTC — Entry posture: module-by-module with perimeter

**Context:** Last ~25% of the product. Stop trying to target every Phase Two problem at once. Speed = pick a spot and move.

**What we’re doing:** Start **module by module**. Founder can see in a module whether it’s ready — obvious when you look. Ideas already communicated (especially Agents) show the lean.

**What we’re not doing:** Hunting for one master entry that solves the whole Phase Two surface in one shot.

**Nuance (important):** “Module by module” is not isolation. If we enter **Agents**, we still have to **map the perimeter** — Automations and the other natural nodes that Agents connect to (firm/contact bind, what goes out, book-in, Activity record). You can’t truly engage Agents’ problems and solutions without saying how/when Automations (and neighbors) get worked. That perimeter map also tells us **what’s next**, and often we’ll **enter the next module from those outskirts**.

**Implication for workflow:** Enter a module → deepen its Type A/B gaps → explicitly list perimeter modules/outcomes touched → those become the natural next entries (possibly entered from the edge that Agents already forced open).

---

## 2026-08-15 14:49 UTC — Agents ↔ Automations ↔ what goes out (core relation)

**Kind:** Type A (relationship / authorship structure), core Tower.

### Agents = engagement authorship stack (depth order)

1. **Rules (first)** — Attempt rules: what counts as an attempt; windows/thresholds; escalation into the next attempt; failure rules (same family as escalation); channel ownership / forward-only handoff. Modular law already partially in `rule_*` / `seq_*` tables + worker.
2. **Sequencing (second)** — Sequence *within* attempts: nodes, order, add/insert steps; **defaults by attempt** (e.g. default for all attempts except X; attempt-1 shape vs attempt-2+). Not one anonymous flat step list pretending to be attempt-aware.
3. **Content (last)** — Two sides:
   - Copy on each node (what actually goes out when that cell fires).
   - **Information shape** — how structured outputs from Automations (eligibility, pathway, missing facts, motion reason, etc.) embed into or feed that content.

Collapse the stack (content-only UI, or Settings without sequence/content bind) and Agents is lost.

### Automations = when / motion / structured info

Faceless/graph side: eligibility, reference moves, motion (nudge / reactivation / none), triggers, pipelines. Gates and initiates work; produces **structured outcomes** Agents’ content layer should be able to consume — not only “fire enroll.”

### What goes out = actuation plane

Enrollment → `active_attempts` → channel send → `engagement_records` / `outbound_messages` (+ messaging events). Board / Client Data Activity / Meetings = **record and consequence**, not the author of outreach.

Causal story:

**Automations** decide whether / when / which motion → **Agents** define how engagement behaves (rules → sequence → content) → **worker/cascade** applies firm-bound template+rules to a contact → **desks** show the record → **meeting booked** is the win.

### Entry points (not one implied door)

Today the product *smells* like **Automations → Agent** only. Required:

| Entry | Meaning |
|--------|--------|
| **From Automations** | Motion/eligibility (or graph action) hands contact(s) into an agent/sequence |
| **From Agents itself** | Create/launch an agent for a task from the Agents seat (Contacts tab is the UI smell of this door) |

Agents = both a **library** the machine can call and a **place to start engagement**.

### Firm / contact binding

- Agent authored/bound in **firm** context.  
- Run against **existing book contacts** vs involving **new contacts**.  
- **Authorize book / Imports** (Contacts) is the left door of the core loop — consultant dead “authorize book” (no upload/connect) starves Agents of real enrollments. Same Type A family as Agents–Automations: relationship not housed.

### Full ring (plain)

**Book in → firm-bound agent (rules / sequence / content) ↔ automations (when / motion / info shape) → enroll / attempt → what goes out → Activity / Board → meeting.**

### App faces (where the relation shows)

| Face | Role |
|------|------|
| Operator Agents | Author rules, sequence, content |
| Operator Automations | Triggers/graph; hand into agents |
| Agents Contacts / Activity / Report | Agent-native entry + runtime visibility |
| Consultant Board / Client Data | See attempts, windows, sends, criteria |
| Meetings | Success event |
| Authorize book / Imports / Contacts | Supply side |

### Failure modes if undefined

Pretty Agents editor + pretty Automations canvas + sends that don’t clearly inherit rules/sequence/content; or enrollments that don’t feel like “this agent”; or dual entry missing so Automations is fake-single funnel.

**Type B note:** Engagement-chart leaf parity sits *on* this spine — the chart only tells truth if Type A writes the ledger correctly.

### Phase Two lean from this entry

Starting module **Agents** means building out this stack and dual entry — which **forces perimeter work** on Automations (hand-off + info shape into content), firm/contact bind, book-in, and Activity as the record. Next modules are likely entered from those outskirts, not as a disconnected menu pick.

---

## 2026-08-15 14:58 UTC — Creation stance + Agents module definition (flag plant)

**Stance:** Phase Two here is **creation**, not audit/prune. No separate “module audit system” required for this. Founder defines scope; agent builds via existing click-path / build methodology. Founder does not need to hunt the UI to authorize changes.

**Flag plant — Agents module definition** (founder order preserved; lightly enriched where essential):

The **Agents** module is where the **operator** authors an **outreach package** — **per firm** or as a **default** (house/platform default that firms can inherit). It is **not** “the firm’s module” and not defined by firm choice as its nature; firm is a **scope of application** (this firm vs default), not the author-seat.

It lets us define:

1. **Outreach sequence** — the engagement package itself (the unit that can run against contacts).
2. **Ordering / sequencing of outreach** — nodes and order inside that package; including **attempt-aware defaults** (e.g. default for all attempts except X; attempt-1 vs later-attempt shapes).
3. **Triggers for the outreach** — what starts this package (Agent-native launch and/or Automations hand-off; existing book contacts and/or new contacts).
4. **Attempt and retry rules** — what counts as an attempt; windows; retries inside an attempt.
5. **Escalation rules within attempts** — channel/ownership handoff and failure→next step inside the attempt ladder.
6. **A goal** — what this outreach is trying to achieve (success condition for the package / attempt family).
7. **Actions on goals** — connect outreach and escalations to the goal: what happens on goal **success** and goal **failure**, on orthogonal axes (e.g. per attempt default vs per event), including defaults when a goal fails.

**Essential enrichments (kept short):**

- **Content** sits on the sequence nodes: copy that goes out, plus ability to embed/use **structured information** (often from Automations) inside that content — otherwise “sequence” has nothing real to send.
- **Scope of application** — operator applies the package **per firm** or as **default**; runtime enrollments/sends then run in the firm context that package was bound to — without making Agents “a firm product.”
- **Record** — what runs should leave a consultant-visible engagement record (Activity), not a black box.

**Out of this definition (perimeter, not Agents’ interior):** Automations’ graph authorship, book import/authorize UI, Board chrome — except as **triggers**, **info into content**, and **record** touchpoints named above.

**Correction (same stamp):** Do **not** define Agents as “where a firm defines…”. Author seat = **operator**; firm = optional/default **scope**, not the nature of the module.

---

## 2026-08-15 14:49 UTC — Two problem kinds (booth reminder)

Recorded so the log carries the split without only living in chat:

1. **Type A — relationship / authorship structure** — hierarchy, housing, entry points, bindings (Agents example above).  
2. **Type B — face outcome parity** — Canonical leaves restated as granular “I should be able to … so that …” and rebuilt in Ant (e.g. engagement chart).

Same Phase Two thesis; different grain. Don’t mix methods.

---

## 2026-08-15 15:43 UTC — Agents flagship (founder wording) + log discipline

**Why this stamp:** Founder correction. The 14:58 “flag plant” did **not** drop the exact flag. It generated a 7-item list (including **triggers** as Agents interior, and splitting the goal into “a goal” + “actions on goals”) that overwrote the flagship and messed a huge portion of the definition. This stamp **is** the flag. Do not enrich it into another generated stack.

**Log discipline (same conversation):** Keep this log so new agents start where we stopped. Stamp here unless told to mark a separate entry. Cadence floor ≥4/day in session; agent asks at inflections. Capture founder wording on flags.

**Module-by-module (how Type A vs Type B get seen):**

- We go **module by module**. That is how Type A and Type B become identifiable.
- Autonomous module-by-module audit is an **open feeling** — founder does not yet know if we can audit that way. Not a blocker: we still enter module by module.
- **Rigor in decomposing a module makes it impossible not to come upon other modules.** Do not sweep interactions under the rug. Ask exactly how this module should interact.
- Do **not** define app-level stuff yet. Define **what the system does**.
- That definition gives **starting points on neighboring modules** = next on the map, in addition to the module just decomposed. Then align with how it currently works today.

---

### Flagship — what Agents is

Agents is the place where the **operator** defines:

- **Outreach sequencing** — not only the sequence itself, the **order in which outreach is deployed**.
- That sequencing **per firm or as a default**, and other kinds of **overrides**.
- **Escalations** between nodes — or better: escalation between **attempts**; **retry rules**; **attempt rules**.
- Very importantly: a **goal / goal criteria**. The goal is itself an **escalation point**: to **other agents**, to **other workflows**, or **it ends there**. Once it is met, it is met. That is the **endpoint**.
- Everything in the middle of that is **modular**.

Author seat = **operator**. Firm / default / overrides = **scope of application**, not the nature of the module.

---

### Alignment with systems as they exist today (looked; not invented)

Machine law is already the one the flagship assumes: **tables + a dumb runtime** ([`system-map/BUILD-system-map-v2-table-inventory.md`](./system-map/BUILD-system-map-v2-table-inventory.md)). Anything that should be modifiable is a table. Story system **7** is the Agents interior: **7a** campaign calendar (order of outreach) · **7b** attempt / channel-ownership (attempt rules, retries, escalate when criteria are met, finishing event). System **11** (signal / motion) and Automations tables (`workflow`, `workflow_trigger`, `action` type `call_agent`) are **perimeter**, not Agents’ interior. System **12** `meeting_booked` is the loop win — not the authored goal-criteria on an agent.

| Flagship piece | Housed today? |
|----------------|---------------|
| Outreach sequence / order deployed | Partial — `sequence_template.cells` (cells by class); `seq_phase_order`. Not attempt-aware sequence defaults. |
| Per firm or default + overrides | Partial — `firm_sequence_binding` (firm → template + `overrides`); `rule_*.firm_id` NULL = platform default. |
| Attempt / retry rules | Partial — `rule_attempt_criteria` + worker. |
| Escalation between nodes / attempts | Partial — `seq_channel_ownership_order` (channel ladder **inside** an attempt). Authored escalation **between attempts**, and node-to-node as data, thin. |
| **Goal / goal criteria as escalation point** (→ other agent · → other workflow · or end; once met, met) | **Not housed as operator-authored modular data on the agent.** Map has `state.finishing_event` (close + arm next) as a Story **chain**, not a goal table. `action` is Automations → `call_agent` only. `meeting_booked` is system-12. **This is the flagship hole.** |

If goal criteria is operator-defined and can vary, the modularity law already says it must eventually be a **table** (rule or state) — not prose. This stamp **names the silence**; it does not mint the table.

**Perimeter this flagship opens (starting points, not those modules defined):**

- **Automations** — a goal can escalate into a workflow.
- **Another Agent** — a goal can escalate into another agent.
- **Terminal** — goal met = end.

Do **not** put **triggers** inside this flagship (that was the 14:58 error). Triggers stay on the Automations / dual-entry perimeter already logged 14:49.

The 14:49 relational picture remains Type A **context**. It is not this flagship. The 14:58 numbered list is **superseded** as the Agents definition.

---

## 2026-08-15 16:01 UTC — Two seats + what belongs on main

**Inflection:** Founder asked to spin a **Systems Analyst** child (they design/live with the systems) while this chat remains **Product Manager**. Both seats keep logs. Prompts live on the docs front door [`docs/README.md`](../README.md). SA log: [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md).

**PM vs SA:** PM owns Type A/B, module-by-module, founder flags, Phase Two log. SA owns Story / Requirements / table-first law / Postgres-as-stood-up / live vs stand-in ports. SA’s first question is the Agents flagship vs the systems model (inventory, then delta) — not a rewrite of the flag.

**What should be current on main (this turn):** Phase Two thesis + this log + seat prompts + SA log. Not Hub-gap maps, Apex honesty code, or other draft product PRs.

**Ask:** seats live in `docs/README.md` (not a separate entry). Stamp here because spinning a second seat is an inflection.

---

## 2026-08-15 17:25 UTC — App-facing first: one description → prototype and systems

**Why:** Founder continues in the **PM** chat because the Agents module shape is now **app-facing first**. Systems still get worked; the question is whether the **same** description of the UI / the way the module works can produce **both** the UI prototype **and** the systems requirements (tables, other systems, runtime nodes, workers — data and worker architecture).

**SA context (not this stamp’s job):** PR [#84](https://github.com/bywale-com/omcoda_tower/pull/84) has the inventory + `SYSTEMS-GOAL.md` handoff (goal = completion; campaign grain; failure mode). Not on main. Flag stays **15:43**. Do not overwrite.

**Answer (PM):**

**Yes — if the description is the inhabited module, not the chrome.** Operator authorship + consultant record + what continues when nobody is present. That one spec has two extrusions:

| Output | What it is |
|--------|------------|
| **UI prototype** | Controls that **write** authorship; panes that **show** the record |
| **Systems requirements** | The **tables** those write/show, plus the **faceless** transitions the runtime/worker must perform so the panes stay true after the operator leaves |

**No — if “UI” means only clicks.** “Someone opens an email,” a window elapses, inbound nullifies an attempt — no control. That is why Phase One said you cannot discover the machine from screens. An app-facing Agents description that omits unattended runtime will ship a pretty editor whose Activity pane lies.

So the description must name **three layers**, not two:

1. **Authorship** — what the operator defines (sequence, order, content, attempt rules, firm/default/overrides, campaign composition, goal as completion, success destination, failure).
2. **Record** — what Board / Client Data Activity must show because (1) actually ran.
3. **Unattended** — tick, inbound, send, completion, exhausted-campaign failure. Nobody present.

Layer 3 is still **app-facing**: it is what the panes must be able to display, and what must happen for “once met, met” to be true. It is not Automations’ graph (that engine stays perimeter). It is Agents’ **data + worker** so authored rows actually run.

**What that description extracts (architecture, not a mint):**

| Kind | Agents interior already / missing |
|------|-----------------------------------|
| **Sequence / rule / binding tables** | `sequence_template.cells`, `seq_channel_ownership_order`, `rule_attempt_criteria`, `firm_sequence_binding` — Save already writes some of this |
| **State tables the worker writes** | `enrollment`, `active_attempts`, `engagement_records`, `outbound_messages` |
| **Runtime (two paths, dumb)** | **Time:** `worker.ts` tick reads rule tables. **Event:** cascade / webhooks / inbound. Runtime holds **no** content |
| **Completion / campaign / failure** | **Not housed as authored data.** Story chain + `meeting_booked` + Engine 2. This is what an app-facing goal + campaign grain would force SA to extract — after Story promotion, not from chrome |

**What else besides tables and workers:** campaign composition (sequences toward one class objective); destinations on completion (other agent · workflow · end); failure writes (cannot be silent); event kinds on the record. Not a fourth engine.

**Seats:** PM writes/holds that inhabited description (prototype + the “I should be able to” that implies unattended). SA extracts Requirements / table-first / worker jobs from it and from Story — does not invent a second Agents flag. Same description, two outputs. Bind still late: a control does not create substance; if the description names a state the machine lacks, that is a **missing system** (Phase Two), not an excuse to fake it in the prototype.

**Do not:** treat Hub JourneyTab as the description; put Automations triggers inside Agents; mint a `goal` table in this stamp.

---

## 2026-08-15 17:32 UTC — Agents canvas: campaign+node, default on every rule

**Why:** Founder: still not specified as its most comprehensive document. Final form is modular. Canvas: you place **campaign and node**. One campaign → node canvas; add campaigns → consolidates to campaign canvas; you can always go that deep. Canonical **two-campaign sequence ≠ two-node sequence** (opt-in style; launch goal can sit in the sequence). **Objective type** = opt-in / reactivation / re-engagement; technically multiple inside the same sequence. First campaign: sequencing/order; **choose a default; everything is an override; always a default on everything** — including typical text→email→… Escalation rules **per node**, down to if-not-open, down to attempt rules. Failure is **part of escalation**. Every rule that can exist can be defined and overridden. **The UI is what is missing.** Tinkering continues.

**Doc (this is the comprehensive face, not a second flag):** [`AGENTS-FACE.md`](./AGENTS-FACE.md)

**Today’s Ant editor** is a Timeline of email/task steps. That is not this canvas.

**Ask:** plant the canvas next, or keep specifying while you tinker?

---

## 2026-08-15 17:45 UTC — Work from the real Agents UI; three layers; overrides on canvas

**Why:** Founder: abstract mockups waste the fact the module already exists. Screenshot the Ant Agents UI and work on **that**. Fractal canvas. Grain of images: channel-node rules that **never move**; more at campaign; actually **three** layers for every control — **global**, **the sequence**, **each campaign inside the sequence**. UI: modular, obvious, **on the canvas** — not a Settings modal far from it. **Only global** lives in Settings. **Override lives on the canvas.**

**Today (screenshotted):** Editor = Email/Task timeline. Settings = the whole `rule_attempt_criteria` list. That list is the global default. It is currently also the only place those rules exist.

**Placement:**

| Layer | UI |
|-------|-----|
| Global | Settings tab |
| Sequence | Canvas (sequence chrome) |
| Campaign | On the campaign node, on the canvas |
| Channel node rules | On the node, always — they never move to Settings |

**Ask:** plant this in `AntAgentWorkbench` next (same chrome), or keep specifying?

---

## 2026-08-15 18:08 UTC — Sequence is blank; two opt-in objectives; Override this reveals the graph

**Why:** Founder enriching, not circling. Sequence = **blank**, multiple goals. Opt-in = **two clear objectives** → **two campaigns**. Launch window builds desire (why we don’t start at reactivation). Launch day **is opt-in day**. First objective met → **qualify** for phase 2 — that is the edge between campaigns.

**Channels are not objectives.** They are the **medium**. Channel rules + attempt rules on the node. **Sequencing and content defaults live at campaign.** Content 1:1 with nodes; override by opening the node.

**The first toggle on a campaign: Override this.** Opens that campaign; **reveals channel nodes as wires** connected to it. Campaign toggles stay on the campaign. Channel toggles live on those nodes. Open a channel → deeper, still wired = **full graph**.

Spoken “email, text, and call”: ladder stood up is text / email / form — do not mint call here.

**Doc:** [`AGENTS-FACE.md`](./AGENTS-FACE.md) updated. Flag 15:43 untouched.

---

## 2026-08-15 18:25 UTC — Planted Override this on the real Agents editor

**Why:** Founder: the shape is locked; enrich further; Override this reveals channel nodes as wires; campaign toggles stay on the campaign; node toggles live on the node. They asked to see the graph, not another overlay.

**Plant:** Editor tab on Ant Agents (`AntAgentWorkbench`) now has **Canvas** (default) and **Timeline (today)**. Canvas is local prototype — not the save path. Opt-in sequence seeds **Launch window** (Override this on, Text open) → qualify → **Launch day** (closed). Channels = text / email / form. Settings tab banner: global defaults only.

**Enrichment (agent alignment, not a flag):** toggle locality; agent = blank sequence; qualify-edge = 15:43 goal-as-escalation drawn between campaigns; channels = sequencing method. In [`AGENTS-FACE.md`](./AGENTS-FACE.md).

**Still open:** window’s one objective (waitlist?); mix types in one sequence; deeper-than-channel grain; spoken “call”.

**Ask:** is Launch window’s one thing the waitlist, or still unnamed?

---

## 2026-08-15 18:40 UTC — Objective is the first thing on a campaign; binary event; two template layers

**Why:** Founder answering the waitlist question, then the real grain. Mock **not** this turn — “if you recorded the revision, that’s great.” 18:08 Override-this / two-campaign / channel-as-medium **is** in this log and [`AGENTS-FACE.md`](./AGENTS-FACE.md).

**Waitlist:** not the most important thing. Leave the window’s named “one thing” open. What matters is **how an objective is created**.

**Empty world:** if no one has created templates, there are no templates. Keep that in the open.

**Two template layers (do not mix):**
- **Sequence templates** = the full canvas. Opt-in, re-engagement, reactivation **are sequences**, not objectives. You would not see “opt-in” in an objective picker.
- **Objective templates** = a **single campaign**. In the opt-in sequence, examples already named: **launch window**, **launch day**. There are **additional** objectives in that sequence — unnamed here.

**Creating a campaign:** the first thing you define is the **objective**. Hub Automations analogy (`/hub`): you start with a trigger; on that node the first thing is **Add configuration** (event configuration). Same idea — not “put Automations triggers on the Agents canvas.”

**Untemplated objective:** looks like an **event** (maybe not called events; can expand). Binary. Direct. Everyone enrolled in this campaign is campaigned to do **one thing**. Yes or no. It happened or it didn’t. Then you **name** it (e.g. meeting booked).

Spoken examples: click this link · book a meeting in this calendar · submit / complete this form. Launch window as a from-scratch event: probably **click this link**. Down the line: a webhook / table query (did they follow us / is their name in this). System should not be so complicated that that is impossible. Do not mint that now.

Picking a **templated** objective populates everything related to that template.

**Doc:** [`AGENTS-FACE.md`](./AGENTS-FACE.md). Flag 15:43 untouched. No mock this stamp.

---

## 2026-08-15 18:50 UTC — Mock: five beats so everything said is visible

**Why:** Founder: not one mock. Distinct things; some as open modals, some their own beat. Should be able to see everything just said.

**Five beats on Editor → Mock** (Timeline remains the save path):

1. Sequence templates (empty world toggle; opt-in / re-engagement / reactivation as sequence templates — not objectives)
2. Add objective — **modal** (template: launch window / launch day / additional; from scratch: click / calendar / form, then name it)
3. Two campaigns + qualify
4. Override this → wired channels; campaign toggles stay
5. Open a channel → deeper nodes still wired

Webhook / table not mocked. Call channel not mocked. Flag 15:43 untouched.

---

## 2026-08-15 18:55 UTC — “Mock” = generated images

Founder: when they said mock they meant **generate the image**, not plant an in-app prototype. Distinct beats: sequence templates · add objective (template + from scratch) · two campaigns · Override this · open channel. Images: `agents-mock-1` … `agents-mock-5` plus `2b` from-scratch.

---

## 2026-08-15 19:10 UTC — Placement only: content inside the channel; attempt is a cycle

**Why:** Founder: not adding. Changing **where** things live so it is natural. Image in question = beat 5 (campaign Override this ON + a channel open). Perfect recreation of that frame, then move the pieces.

**Place 1 (that graph):**
- **Override content** is a **small button inside the channel node**, not a wired sibling. Click → editor opens **in the node** (text box, or the email composer).
- **Channel rules = escalation** on that medium (not opened, not clicked in time, …). Those stay the channel’s deeper grain.
- **Attempt rules are not at the channel.**

**Attempt vs channel:**
- Attempt = **container / cycle** of the **same** sequence (unless nth-attempt uses a different sequence). Last node fails → next attempt. Attempt rules = count, distance after the failed last node, those parameters.
- Channel / escalation rules = what that medium has to deal with.

**Nesting:** every rule can be global, sequence, or campaign. No override → fall back up (CSS). **Two Settings:** Agents **module** = global. **That sequence** = sequence rules. Attempt is **not** that layer. Content at attempt = **variation on the same channel node**. UI does not grow: attempts are cycles of the same sequence.

Flag 15:43 untouched. Recreate beat 5 image; second image = attempt as cycle + two Settings.

---

## 2026-08-15 19:30 UTC — Attempt is per campaign; sequence/global attempt rules live in Settings modals

**Why:** Founder: do **not** generate the middle-of-canvas attempt-cycles image. Attempts are **per campaign**. Sequence-grain attempt rules do not sit in the middle of the graph — that canvas is the sequence. They live in the **settings modal**.

**Where attempt rules live (no gray area):**
- **Campaign** → on that campaign
- **Sequence** → Sequence Settings modal
- **Agents** → Agents Settings (global)

**Ask:** generate those two Settings modals — they now hold a bunch, given everything discussed (attempt rules, channel/escalation rules, content, sequencing defaults). Mock = generate the image.

---

## 2026-08-15 19:45 UTC — Settings images locked; Override content is a toggle; call node (ElevenLabs)

**Why:** Founder: the Settings images are canonical — “perfect,” nothing to add. Do not regenerate those.

**Last change, different image:** the Override content **button** inside the channel should have been a **toggle**. Toggle on → the **node expands** to contain that medium’s **content-creation block**. Richer than a thin text box. Show **text, email, and call** overridden. Call will exist; **via ElevenLabs**.

Mock = generate the image. Settings untouched. Flag 15:43 untouched.

---

## 2026-08-15 19:50 UTC — Canon image lineup + UI blueprint (last pass before systems)

**Why:** Founder: enough to talk to Systems Analyst. Same chat holds thinking, mocks, excerpts. Some images are revisions of others — line up **canon**, map each plate to the log stamp that birthed it, then spec the plates as a **UI blueprint**. Not a systems blueprint. Do not go into where it touches Postgres. If anything is under-specified, that is this pass.

**Doc:** [`AGENTS-UI-BLUEPRINT.md`](./AGENTS-UI-BLUEPRINT.md). Canon C1–C7 (+ C2b, C5b). Discarded: open-channel siblings, content-as-button, attempt-cycles-in-the-middle.

**Under-specified (named in the blueprint, not filled):** attempt rules on the campaign card (said, not drawn); attempt-N content variation control; additional opt-in objectives; word “event”; campaign Settings modal; Call vs Form on the machine.

Flag 15:43 untouched. Settings plates still locked.

---

## 2026-08-15 20:00 UTC — Systems Analyst package committed (ascribe the plates)

**Why:** Founder: the SA already has the context. The prompt should stay small. This is what we’re thinking; these are the systems traversing. For **our** system (tables, workers, runtime): what are we looking at? For **external** systems the mock is clearly calling — especially because the image is going to look like this — look at the configurations we are implying, is this possible, does the UI have to change, do we have the affordances we’re hoping for? Commit that as a **package prompt in time** so the next thing can start.

**Doc:** [`AGENTS-SA-PACKAGE.md`](./AGENTS-SA-PACKAGE.md). Paste-block in that file. Same two questions on every canon plate, then a rollup. Indexed from README SA identity + FACE + blueprint.

Flag 15:43 untouched. Settings plates still locked. Blueprint not rewritten.

---

## 2026-08-15 20:24 UTC — Agents creation-place complete enough; enter Automations from the outskirts

**Why:** Founder: Agents as its own module — as a place things get created — is probably complete. Current shape redefines Agents as where you **create campaigns**; that feels great. Automations is the **brain / operations**. Use the join as the **bridge** into Automations. Always clean up where we’re working.

**Capture (founder wording, not a second Agents flag):**

- Connection: a variable operation can trigger an agent. It does **not** trigger a “re-engagement objective.” **Re-engagement is not an objective** — it is a **campaign** (the name of a campaign). The objective is more than likely a **data request** (and maybe other types).
- Automation may **trigger creation of a campaign** when that campaign is already **templated**.
- When we create an objective: click this / fill this form. A **trigger would not trigger click-this**. It would trigger **fill this form** — a data request is kind of a form, with these specific questions.
- **Where is the form created?** Not cleaned up, then decided: **Automations creates the form.** Agents is **not** about creating forms or creating what is needed. Agents is about **sending people to accomplish the goal**. How Automations works the form has nothing to do with Agents.
- **Automations shape:** perform **on this event** (schedule or trigger) → perform **this operation** → **nothing in the middle changes; it is definite** → on this kind of result do X, on that kind do Y. **Binary** (or the binaries we’ve defined). More **DAG-like**. Those are **exit points** at the end of each instance that ran.
- **Recursive:** the data request is already an **event of origin for Agents**. Data request = a form, handled by Automations. Endpoints (this was the action of an agent) **mirror** the beginning of Agents (defining the objective). Uncanny resemblance.
- Form creation as its own graph node vs **embedded with calling an agent** — not locked; founder leans **embedded**. Same end node: start an agent **or** select an existing one, **and** declare the objective right there; if data request, **create the form there**.
- Select an **agent** (sequences — same thing). **No separate campaign pick** — campaigns live inside sequences. Selecting the agent = selecting the entire campaign. Campaigns can be templated. **Choice of agent/campaign is limited by the objective** — can be enforced.

**Doc:** [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md). 14:49 perimeter map said we would enter the next module from these outskirts. That is this stamp.

**Do not:** overwrite 15:43; put Automations triggers on Agents; treat re-engagement as an objective; move form-building into Agents; plant an Automations editor this stamp; mint tables; silently kill Seed §5.6.

Flag 15:43 untouched. SA Agents package still waiting; this is PM module enter, not SA rewrite.

---

## 2026-08-15 20:44 UTC — Automations: Hub is the complete plant; look at Rules

**Why:** Founder: Automations is the most under-rated, under-built module — supposed to be more. The **Hub** Automations module (how the nodes are and look) was **more complete**. Everything in the current-app Automations was **born from Hub**. Current app = poor rendition of **quality**, great kind of **translation**. Focus on Hub.

**Look at Rules** (the immigration one — the one with **toggles**). Open the rule: toggle things on and off. That is the idea. What a rule is, what a constant is, what a condition is: **rules are composites of conditions and constants**; within a rule you turn outcomes on and off. If you look at rules you see the **end goal**: rules are creatable; more rules as you want; **modular across industries**.

**Easy to miss:** Automations touches more of the app. Something comes in (outreach, existing data, other sources) → perform an operation → **actions are not just outreach**. Outcomes also **change stuff inside the system**.

**Plate already on the glass (Hub, light):** New firm → opt-in launch → Rule **Immigration · Service eligibility** → config modal **Outcomes** with five toggles (Pathway detection, Gaps, Profile & operations, Category draws, Draw competitiveness). Input / Outcomes / Output. Build palette already names Constants, Conditions, Rules.

**Doc:** [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md) law 11–13.

**Do not:** overwrite 15:43; treat CT Ant Automations as the source; throw away Hub node kinds; invent a new in-system-outcomes catalog this stamp; mint tables.

Flag 15:43 untouched.

---

## 2026-08-15 20:54 UTC — Rule GUI vs Custom; smallest workflow; from-scratch images

**Why:** Founder: likes that there is code to build it, does **not** want to be limited to code. Two options: **Custom** (code, like JSON) and **GUI** where the logic is simple enough. If it really isn’t simple enough, say so. This entire Rule part **does not exist in the Ant translation** — that’s a problem. Mocks = images; **building from scratch**. A rule lets us create the **smallest workflow**: trigger · rule · action. Fewer pieces; then build those pieces.

**PM verdict:** the authored logic **is simple enough for a GUI**. Condition = field · operator · constant. Rule = togglable families of those. Evaluator stays under the hood. GUI default; Custom when GUI isn’t enough.

**Images:** [`AUTOMATIONS-UI-BLUEPRINT.md`](./AUTOMATIONS-UI-BLUEPRINT.md) A1–A3. Not planted in the app.

**Do not:** overwrite 15:43; plant AntAutomationWorkbench this stamp; say it all has to be code.

Flag 15:43 untouched.

---

## 2026-08-15 21:10 UTC — Named code beside GUI; insides of trigger and action; rule-output gap

**Why:** Founder: even inside prepared outcomes, some are GUI (maybe only the constant), some have no constant and must be **named code** — still created in the rules module, JS or Python, still **on or off**, you **name it**. Side-by-side. Prefer a constant when possible; across industries some things aren’t constants. Not satisfied with canvas-only: see **inside trigger**, **add a node**, **inside action**. At least two kinds of actions: **in the application** vs **agents**. Agents as action: select/create objective (creating it creates the form).

**Rule output (do not get lost, do not miss):** implying the operation creates both a re-engagement **and** a reactivation event — or both as **signals**. Separate them? **No — no need.** One, the other, or both at once is why we can have **different actions**. We do **not** yet have a congruent complete idea of **what a rule outputs** — and that output is supposedly what we use to create a form, and maybe enrich many other things.

**Hub today (not the accepted complete idea):** `RuleEvaluationSummary` already carries headline, pass, pathway/gap signals, recommended services, **nudge** signal, **reactivation** signal. Engine 2: every detection is a signal; one client, one motion.

**Images:** A4–A9 in [`AUTOMATIONS-UI-BLUEPRINT.md`](./AUTOMATIONS-UI-BLUEPRINT.md). Law 17–22 in [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md).

**Do not:** invent the output catalog; split the rule to separate re-engagement from reactivation; plant the editor; overwrite 15:43.

Flag 15:43 untouched.

---

## 2026-08-15 21:28 UTC — Output classes are a lattice; missing class is required data

**Why:** Start from the end. Founder: the output classes are excellent — they all need to exist. Each is a **lattice**: a simple condition on a class **forks actions**. Example on the same data: if re-engagement signal · if **only** re-engagement · if **anything other than that** → three kinds of actions.

**Missing class (at least one): required data.** The system is **deterministic** — it does not need AI to know what data is required (Seed field-class + missing-data as signal + one form of outstanding self-reportable needs). When data is required, that is a re-engagement signal **and** it must be an output class. Forms are generated from that set (questions = required fields). Do **not** lock an objective type to a given signal.

**Image:** A10. Law 22–24.

**Do not:** invent the rest of the class catalog; lock form-objective to re-engagement; overwrite 15:43.

Flag 15:43 untouched.

---

## 2026-08-15 21:36 UTC — Does a listing of requested data exist (model + UI + rule output)?

**Why (founder, before any new images):** Precisely — does that generate any new images / refinements of the images we have? **Before answering that:** does the data model **and** the UI support a **listing of data requests** — the data being requested, more than one; **referencing that listing inside a form**; and does it **show up in the data output of the rule node**.

**Answer (honest, not a catalog invent):** **Partial / no on the glass.** Three questions:

1. **Listing of the data being requested (more than one).**  
   - **Catalog exists:** `COLLECTIBLE_FIELDS` in `src/app/data/collectibleFields.ts` — many rows (id, label, path, capture `self_reportable` | `document_dependent`, optional `employerDirected`, optional `signalHints` to R-* ids). Helper `selfReportableOutstandingPaths(presentPaths)` returns the outstanding self-reportable subset. **Nothing in the repo imports this file.** The join `signalHints` is declared and unwired.  
   - **Map names, not an instance listing:** `state.fact_ask` = “outstanding asks”; `state.pending_capture` = `closed|open` (a door, not field rows); `state.missing_fact_signal` = absent|present. Postgres `rule_field_class_routing` is enable-toggle **rule** rows (when/condition/set_value), not a per-run list of requested fields.  
   - **UI:** Hub Rule Analysis / Output does not list requested fields. Ant rule config is null (no Rule GUI). Contact / Nudge / Loop-closer demos use **hardcoded** outstanding counts and painted fields — not this catalog. No Automations picker of “these fields are the request.”

2. **Referencing that listing inside a form.**  
   **Law yes. Stood-up authoring: no.** Seed / Engine 2 / FACE 23: one form of outstanding self-reportables; questions **are** the required fields; document-dependent never enter a form. There is **no** form builder in Automations (or Agents) that binds collectible field ids as questions. Inspector `NodeFormField` is engagement **replay**, not authoring from a request listing. Nothing to point a form at, because there is no instance listing.

3. **Show up in the data output of the rule node.**  
   **No as a class.** Hub `RuleEvaluationSummary` is: headline, pass, `pathwaySignals[]` (R-CEC / R-FSW / …), `gapSignals[]` (**R-GAP-\*** result ids, not field ids), recommended services, nudge `{needed, kind, reason}` (a sentence like “Gaps asserted (R-GAP-01, …)”), reactivation `{warranted, reason}`. Analysis pane shows those. JSON dump is the same object. Checks carry `leftField` (what the condition **inspected**), not “what we now need from the client.” `evaluateRulePack` never reads `COLLECTIBLE_FIELDS`. Ant: no output pane for rules.

**This is the missing required-data class (21:28) named as a listing.** A boolean “data required” is not enough. The class is **the set of requested fields** (more than one), which is what a form would reference and what a condition on the lattice would fork from.

**Would have to exist (name, do not fill, do not mint tables):** rule output emits that listing; form questions reference those ids; rule Output pane **shows the list**. Document-dependent stays off the form.

**Images this stamp:** **none generated.** A9/A10 already name the missing class. Refinement would be warranted **if** we mock next: the class as a **list of field rows** on Output (not a flag), and a form whose questions **are those rows**. Do not generate until asked.

**Do not:** invent the catalog; mint tables; plant the editor; overwrite 15:43.

Flag 15:43 untouched.

---

## 2026-08-15 21:48 UTC — Images that should exist: required data as a listing

**Why:** Founder: anyway, let me see the images that clearly should exist now. After 21:36 (listing not stood up in model/UI/output).

**Plates (from scratch, Ant chrome, not planted):**
- **A11** — Rule Output. Required data is **field rows**, not a flag. Catalog fields only. Document-dependent never a form.
- **A12** — Form questions **are those rows**. Bound “from listing.” Not a blank Add-field builder. Re-engagement stays a campaign/template.
- **A13** — Lattice with required data as a **solid listing class**. If listing not empty → create form from those rows. A10 still names the gap; A13 is the class when it exists.

**Still not stood up in code.** These are mocks of what the glass should be. Do not mint tables. Do not invent the rest of the output catalog.

**Do not:** plant `AntAutomationWorkbench`; overwrite 15:43; lock objective type to a signal.

Flag 15:43 untouched.

---

## 2026-08-15 22:17 UTC — Automations chosen lineup + Systems Analyst package

**Why:** Founder: terrain is enclosed enough. A13 is a **different kind of picture** — not the condition node. **Don't forget** the node after rule output: a **condition node** that says “if this,” already **calling from the previous results**. Rules have constants and their own conditioning. Spec everything from **logs** (transcripts inaccessible). Line up **chosen images in order**; if a plate is a revision, **keep the prior**, revision is **canonical**, say why it evolved. Spec down to detail. Then the SA package: tables, workers, fields, relationships, externals — UI should look like these plates so when built it works as wanted.

**Chosen lineup** (priors kept): A1–A8 · **A12 revises A8 form** · A9 · **A11 revises A9 Output** · A10 (diagram) · **A13 revises A10** (still a diagram, not chrome). Spec: [`AUTOMATIONS-UI-BLUEPRINT.md`](./AUTOMATIONS-UI-BLUEPRINT.md). Law 26: two grains of condition.

**Package:** [`AUTOMATIONS-SA-PACKAGE.md`](./AUTOMATIONS-SA-PACKAGE.md). Same two questions as Agents (our machine vs externals/configs/affordances), then rollup. Indexed from README SA identity.

**Do not:** plant the editor; mint tables; treat A13 as a screen; overwrite 15:43; collapse the two condition grains.

Flag 15:43 untouched. Agents SA package still waiting; this is a **second** package, not a replacement.

---

## 2026-08-15 23:07 UTC — Before building: the loops still open between Agents and Automations

**Why:** Founder: keep the images (pristine, design system); can live with the cost. Natural question: if we built both modules to spec, could we **create an agent and enroll contacts**? Still more to discuss — connections / loops that should be closed, not remembered in the moment. State them directly. Do not plant.

**Image regen (correction):** cut **re-generating** the same plates. Do **not** cut using the canon images to build. Cut **rereading the entire log** every turn.

**If we only built the two UIs:** you would have two editors. You would **not** yet be able to create an agent and enroll contacts as a working loop. That is systems: bind, enroll, send, goal-done, write-back.

**Loops still open (the connections, not a new flag):**

1. **The other direction (15:43).** We specified Automations → start/select an agent. We did **not** specify what happens when the agent’s **goal is met**: escalate to **other agents**, to **other workflows**, or **it ends**. That is the flagship endpoint. Without it, Automations can throw people in; Agents cannot throw work back.

2. **Create + enroll is one loop, not two screens.** Author the sequence in Agents. Automations action selects that sequence (or creates the objective/form and then selects). Someone has to **bind** it to a firm and **enroll a contact**. Dual entry: operator enroll from Contacts **and** workflow `call_agent`. If only the canvas exists, enroll is fake.

3. **What goes out.** Enrollment that does not send (Resend/Twilio, consent, halt, silence) is a dark agent. Activity is the **record**, not the author.

4. **Form write-back.** Automations owns the data-request form. Fill → facts land → eligibility re-evaluates → that can **fire Automations again**. Required-data listing is **not stood up**; the form cannot bind yet. Without write-back, the form is scenery.

5. **Book-in.** Contacts have to exist (authorize book / import). The loop win is still **meeting booked** — an objective Agents can campaign toward; not Automations’ trigger word “event.” Named 14:49; not closed.

6. **Instantiate vs enroll.** Automation may “create a campaign” only when a **template** already exists. Still open: new sequence row vs enroll into the existing one.

**Do not:** start building the editors this stamp; overwrite 15:43; invent a COO; mint tables.

Flag 15:43 untouched.

---

## 2026-08-15 23:16 UTC — Form completion is an event; events are global or local (not Settings)

**Why:** Founder on loop 1 (goal → other workflow): same thing, different angle — **what events actually trigger an automation**. Form completion **is** an event. What they were trying to remember: there are no quote-unquote **Settings**. It is **global versus local**. That is why Automations needs that divide — it matches everything.

**Capture (founder wording):**

- On **all kinds of form submissions** — anytime a form is submitted — whoever submitted, **run this evaluation** on them. That is **global**.
- On **this specific form** — every time **this** form is submitted — run this evaluation. That is **local**.
- The same divide applies elsewhere. Do not fill the catalog. It expands **what counts as an event**.

**Hub today (do not pretend):** `WORKFLOW_EVENT_CATALOG` is eligibility.changed / contact created|updated / import.created / audit completed|failed. **No form_submitted.** Map `finishing_event` can be `form_submitted` as an **attempt terminal**, not this trigger. Journey trees paint `form_submitted`. Not stood up as Automations event-of-origin.

**Law 27** in [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md). Not a Settings modal. Not a new plate this stamp.

**Do not:** invent the event list; copy Agents C6/C7 into Automations; plant; overwrite 15:43; collapse Agents C2b “event” with this trigger.

Flag 15:43 untouched.

