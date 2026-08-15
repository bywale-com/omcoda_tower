# Phase Two — log

**Purpose:** Running log for Phase Two thinking and decisions. Thesis stays in [`PHASE-TWO.md`](./PHASE-TWO.md).  
**Rule:** Unless the founder says “mark this as a separate entry/doc,” new Phase Two talk lands **here** as dated additions (newest at bottom).  
**Area:** Same register folder as the thesis — thesis + log, not scattered one-offs.

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
