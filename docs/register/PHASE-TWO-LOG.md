# Phase Two — log

**Purpose:** Running log so a new agent can start where we stopped. Thesis stays in [`PHASE-TWO.md`](./PHASE-TWO.md). Nothing is more important than this file staying current.

**Current (read first, then the newest stamp at the bottom):** Agents **flagship** = 2026-08-15 15:43 UTC. **Override this** graph = 2026-08-15 18:08 UTC. Objective = binary event (18:40). Mock beats on Editor → Mock (18:50). Face [`AGENTS-FACE.md`](./AGENTS-FACE.md).

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

