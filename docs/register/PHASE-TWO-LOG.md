# Phase Two — log

**Purpose:** Running log so a new agent can start where we stopped. Thesis stays in [`PHASE-TWO.md`](./PHASE-TWO.md). Nothing is more important than this file staying current.

**Current (read first, then the newest stamp at the bottom):** Agents **flagship** = 2026-08-15 15:43 UTC. Seats (PM vs Systems Analyst) = 2026-08-15 16:01 UTC. The 14:58 numbered list is an agent restatement, **not** the founder flag.

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
