# Tower Construction — methodology and iteration map

**Status:** Proposal for review. Not an implementation. Not a curriculum.  
**Seat:** Engineer, inspecting current Tower as destination/reference.  
**What this is not:** A plan to copy `omcoda_tower` line by line. A TypeScript → React → CSS syllabus. A simplified conceptual Tower. A repo.  
**What this is:** A construction path from absolute zero to the Tower that exists in this repository today, engineered so that each abstraction is encountered as a problem before it is handed over as a mechanism.

Inspected on this pass: product face (`/prototype-ant`, `PrototypeAntApp`, Operator / Consultant / Contact desks, Configuration libraries, Automations and Agents workbenches), runtime (`workflowWalk.ts`, `cascade.ts`, `worker.ts`, `runWrites.ts`, `dispatchSend.ts`, `eventTest.ts`, auth/session/firm), ledger (`supabase/migrations/001`–`024`, seeds), and the laws that make Tower unlike a generic app (`DATA-IN-TABLES.md`, `PRIMITIVES.md`, `SYSTEMS-STORY.md`, `AGENTS-FACE.md`, `AUTOMATIONS-FACE.md`, Phase Two thesis).

---

## 1. What Tower actually is today

### One paragraph

Tower is a firm-scoped engagement machine with three desks on one product face. The **operator** authors when-then operations (Automations) and start-now missions (Agents) as data the house can change without a code deploy. The **runtime** walks those graphs, enrolls contacts onto sequences, owns one attempt at a time, sends on a channel ladder, and treats a campaign objective as a binary event pointed at a real table (`messaging_events`, `fact_writebacks`, or `meeting_booked`). The **consultant** sees the book and the activity that those rows produced. The **contact** sits on a tokenized seat and writes consent, facts, uploads, and meetings. The desk shows what the query returns. Hub is not the app.

### In constructions, not in stack names

Current Tower is six constructions stacked on each other. Later cycles exist to make each of these necessary — not to name them early.

| Construction | What it actually is in the repo today |
|---|---|
| **A thing on a page that can change** | Isolated MPA at `/prototype-ant` (`prototype-ant.html` → `src/main-prototype-ant.tsx` → `PrototypeAntApp`). Almost no URL routing inside the desk: module, selected client, selected node, and desk track are information the page is reading. |
| **Three faces, one ledger** | Operator house / tenancy / support modules; Consultant board, contacts, meetings, prepared workspace, client activity; Contact Now / History / Upload / Opt out. Same records, different questions asked of them. |
| **A book that is not in the component** | `contact_records` and related rows. Modules call `wirePorts.machineApi`. Painted people in React are a law violation (`DATA-IN-TABLES.md`). Hub still contains that violation (`App.tsx` client tab labels). That is one reason Hub is a bad teacher. |
| **A walk that accumulates writes** | `walkValidatedWorkflow` visits trigger → get / rule / if / switch / wait / action / exit. `previousWrites` is the last node’s output. `chainWrites` is every completed node’s writes this run. The next step **picks**. It does not guess “latest audit for this firm.” |
| **A mission that keeps trying until a goal** | `enrollAndActuate` writes `enrollment` + `active_attempts`. Worker `tickOnce` advances template cells, escalates channel ownership from `rule_attempt_criteria`, and advances campaigns when `campaign_objective` is satisfied. Agents enroll **starts now**. Automations `call_agent` enrolls **because something was heard**. |
| **A close-the-loop write** | Contact seat or webhook writes a fact, a click, or `meeting_booked`. That write can satisfy an objective (Local event) and can be heard by another workflow (the other door). Consent and halt sit on the send path so “we can send” is not the same as “we may send.” |

### The causal ring that current Tower already runs

```
Operator authors a graph and/or a sequence
        ↓
Something ignites a walk (manual Run, event, webhook, schedule tick)
        ↓
A node does work in a real module and leaves writes
        ↓
An action may enroll a contact on a sequence (call_agent)
        ↓
Worker owns one attempt, one channel, and may send
        ↓
Contact or consultant writes back (fact / meeting / opt-out / halt)
        ↓
Objective may be met → next campaign, or it ends
        ↓
That completion may be heard as an event → another walk
```

Story’s spine is the same ring in product language: keep engaging, keep facts fresh, re-evaluate eligibility, surface people so a meeting can be booked. Presentation ≠ fulfillment. The house must stay inspectable without a deploy.

### What “current Tower” means as destination

Converging on current Tower means becoming able to reconstruct **this** product, not a generic CRM and not Hub:

- Product face `/prototype-ant` with Operator / Consultant / Contact.
- Configuration libraries: Evaluation, Automations, Agents.
- Click the node = configure. `⋯` Switch changes kind. Palette Switch is the many-path node.
- Write-set is the shape after a node.
- Save · Run · Launch. Test data lives on the trigger. Run walks now. Launch arms.
- Sequence ⊃ campaigns ⊃ binary objectives. Channel rules escalate the medium. Attempt rules sit at their grain.
- Enrollment, one active attempt, worker time-path, consent/halt gates.
- Contact seat as a different face on the same writes.
- Session + firm scoping.
- Records from tables; seeds so a module is not empty.

These exist in the repo and are **not** the destination spine (they may be named late, or named as “this is not the system”):

- Hub / holon inspector / planted Sarah Jenkins.
- Meta ads, escrow fulfillment, warmup, enrich crawl (stand-ins).
- Dual execution: in-browser `standins/machineApi` simulating the walk while `workflowWalk.ts` is the live walk.
- System Map as a product screen.
- Dual tenancy leftover: UUID `firms` for login vs TEXT CT `firm_id` on machine rows.

---

## 2. Working backward from that system toward absolute zero

If you strip current Tower until nothing remains that a person who knows no implementation could have constructed, you do not arrive at “a Vite app.” You arrive at:

**A blank page, and the intention that something should exist on it.**

Every later Tower mechanism is a solution to a problem that only appears after an earlier construction works.

Working backward, the necessity chain is:

1. **A sophisticated desk** requires **several things on a page, one selected, appearance controlled**.
2. **A desk that does not lie after a click** requires **information the page is reading**, and a way to change that information.
3. **A book that two windows, two days, and two seats can share** requires **information that outlives the page**.
4. **A book that can be found, related, and queried** requires **identity and tables**, not a blob in a file.
5. **A contact who is not the consultant** requires **a second face on the same records**, then **a token**, then **a write that appears on the other desk**.
6. **A mission that is not “send once”** requires **time**, then **another attempt**, then **another channel**, then **a goal that stops the attempt**, then **a next campaign**.
7. **“When that happened, do this”** requires **an event**, then **a second step that needs the first step’s result**, then **a fork**, then **the chain stored as data** so the house can change it without a deploy.
8. **Authoring that chain** requires **click = configure**, then **a canvas** (only after a list-of-steps editor has already failed to show branching).
9. **Two firms** require **identity**. **Live send** requires **consent and halt**. **Arming vs walking now** requires **Launch ≠ Run ≠ Test**.
10. **“This form, not any form”** requires **Local**. **Fetch / evaluate / pause** require **Get / Rule / Wait**. **Change the machine without shipping code** requires **the house layer**.

Read that list downward: that is the construction order.  
Read it upward: that is why current Tower looks the way it does.

The earliest constructions will look almost comically primitive next to `AntAutomationWorkbench.tsx`. That is correct. The workbench is what you get after you have already felt why a graph, a handle, a configured-break, and a Run exist.

---

## 3. Methodology — how complexity is allowed to arrive

### The governing law

**Control the order in which complexity becomes necessary.**

Do not simplify Tower conceptually. Do not hide a difficult idea because it is difficult. Do not introduce a production structure because the final repo uses it.

If Tower eventually requires a mechanism, the path must first produce the situation in which that mechanism is the thing that becomes possible — after a simpler construction has already failed in a way you can feel.

### Intention → problem → mechanism → syntax

Every cycle uses this order. Never the reverse.

1. **Intention.** What are we trying to construct?
2. **Problem.** The previous working system cannot satisfy that intention. You hit the wall. I do not name the wall first.
3. **What do you think needs to exist?** Asked before the solution is explained.
4. **Mechanism.** What this actually is, where it sits, what changes if you manipulate it, what becomes impossible if you remove it, what alternative construction would have produced a different result.
5. **Representation / syntax.** Only the syntax this construction requires, at the moment it is required.
6. **You construct it.** I do not generate the system for you.
7. **Observe.** What became possible. What new problem is now visible.

### Cycle contract

A cycle is legal only if all of the following are true:

- The previous cycle left a **working system** you can run.
- This cycle adds **one capability** (or one tightly bound pair that cannot be separated without lying).
- The new mechanism is **forced by a failure** of the previous construction, not by “professionals use this.”
- Syntax is introduced as **the representation of that mechanism**, not as a lesson.
- There is an **understanding test** that cannot be passed by reproducing the previous cycle’s characters.

Tower Construction 0 may barely qualify as software. Tower Construction 1 must do something. Every later cycle must still run.

### What I will do, and refuse to do

I will inspect current Tower, teach, create exercises, challenge reasoning, review what you build, expose consequences, and help diagnose misunderstandings.

I will not:

- Type the construction so you can watch an agent complete Tower.
- Hand you current files to copy.
- Introduce Vite, React, TypeScript, Ant Design, React Flow, Postgres, Hono, OTP, or React Router because “that is the stack.”
- Protect you from write-set, Local events, attempt ownership, or firm scoping by replacing them with toys.
- Introduce those same ideas in their production form before a simpler construction has failed.

### Two buckets, applied to learning

When something in current Tower is specified and clear, it is on the map as a destination construction.

When something is specified but not clear (PM packet incomplete, SA has not ascribed a store, or the live code and the law disagree), it is named as a **destination tension**, not resolved by inventing a teaching store. Example: `PRIMITIVES.md` still contains a historical honesty note that the walk did not hand module output forward; the live walker now carries `previousWrites` / `chainWrites`. Construction will follow the **law** (handle = writes that run made) and treat the leftover sentence as history.

---

## 4. Estimate: how many cycles

**Thirty-six cycles (TC-0 through TC-35), in ten epochs.**

That is a design estimate, not a schedule. A cycle that does not produce a felt problem should be split. Two cycles that cannot be separated without lying should be merged. The number is high on purpose: completing current Tower quickly is the failure mode.

Epochs are the major construction stages. Cycles are the working systems inside them.

```
TC-0 ………… blank page
        Epoch 0  Appearance
        Epoch 1  Information
        Epoch 2  Named constructions
        Epoch 3  A book that outlives the page
        Epoch 4  Two faces, same records
        Epoch 5  Time, pursuit, goal
        Epoch 6  When → do → handle → data
        Epoch 7  Authoring faces
        Epoch 8  Tenancy, gates, ignition kinds
        Epoch 9  Remaining Tower mechanisms
TC-35 ………… house layer + honest gap vs current Tower
```

---

## 5. Iteration map

Each cycle lists: the capability constructed, the problem that makes the next mechanism necessary, what you would actually learn (as cause, not as a course title), and a first-pass understanding probe.

Syntax names in parentheses are **arrivals**, not lesson titles. They show up when the construction requires them.

---

### Epoch 0 — Appearance

**Destination fragment:** A browser page on which a desk can later exist.

| Cycle | We construct | Previous system cannot | Mechanism that becomes necessary | You learn | Probe |
|---|---|---|---|---|---|
| **TC-0** | A blank page you can open | Nothing exists | A file the browser will show. A folder. A way to look at it. | A program is not a feeling. It is a construction the machine will read. | Close the file. What disappeared, and why? |
| **TC-1** | One thing on the page | The page has no occupants | A named element. A tag as “this is a thing.” | Existence on a screen is caused. Remove the element, the thing is gone. | Put a different thing on the page without being shown the tag first. What did you have to decide? |
| **TC-2** | Control where / how it appears | The thing exists but you cannot place it | Rules that apply to appearance. | Place is not the thing. Appearance is a second construction attached to the first. | Change one rule. Predict what moves. Then do it. |
| **TC-3** | Several things | One thing cannot be a desk | Repeated elements. Sequence on the page. | Order is a construction. The page is a tree of things, not a picture. | Reorder without changing the things themselves. What did you actually change? |
| **TC-4** | One of them has behavior | Things only sit there | An event. A response. | Click is not magic. Something listened, then something ran. | Remove the listener. What is still true, and what became impossible? |

**What must not arrive yet:** React, a bundler, a component library, a repository ritual beyond “files in a folder,” TypeScript.

---

### Epoch 1 — Information

**Destination fragment:** Consultant board: a list, a selection, a detail that depends on which row is selected. Today that is React state inside `ConsultantAntScene` / `BoardModule`. We will not start there.

| Cycle | We construct | Previous system cannot | Mechanism that becomes necessary | You learn | Probe |
|---|---|---|---|---|---|
| **TC-5** | Behavior that depends on information | The click always does the same thing | A value the response reads. | Information is not the page. The page is reading it. | Change the value, not the listener. What changed on the screen, and what did not? |
| **TC-6** | Changing the information changes what appears | You can change a value but the page still shows the old world | The page must be built from the current information. | This is the first state. Not `useState` — the relationship: information → appearance. | Name one piece of information whose change should not affect the page. Why? |
| **TC-7** | A list of people; select one; see that one | One value cannot be a book | A collection. An identity for each occupant. A selected identity. | Selection is information. Detail is a function of selection. The board is already this. | Add a person. What had to exist that did not exist for “one name on a page”? |

**Problem that Epoch 1 creates for Epoch 2:** The page is now a pile of repeated constructions. Changing the list in one place and forgetting the other place makes the desk lie.

---

### Epoch 2 — Named constructions

**Destination fragment:** Components, modules, files, types, a renderer that does not require you to patch the page by hand. Current Tower uses React 18, Vite, TypeScript, Ant Design. Those are **late representations** of problems that start here.

| Cycle | We construct | Previous system cannot | Mechanism that becomes necessary | You learn | Probe |
|---|---|---|---|---|---|
| **TC-8** | Name a construction and use it twice | Copy-paste drifts | A function: one definition, many uses. | A name is not a label. It is a reusable cause. | Change the named construction. How many places on the page must change? If the answer is “many,” the name failed. |
| **TC-9** | The same button / row in two regions without forking | Functions that print text still leave page-structure duplicated | A component: a construction that is itself a thing-on-the-page. | A desk is composed. Chrome is a construction you reuse; the record is not. | Build a second list (meetings) from the same row construction. What must stay shared, and what must not? |
| **TC-10** | Information that cannot silently be the wrong shape | A person without an identity, a selected id that is not in the list | A named shape. Checking at the moment of construction. **(TypeScript arrives here.)** | Types are constraints on what a construction is allowed to be. They are not vocabulary homework. | I hand you a broken person. You should refuse it before the page lies. |
| **TC-11** | The page stays true when information changes, without you rewriting the tree by hand | Manual page-patching misses a node and the desk lies | A renderer that rebuilds appearance from information. **(React, then Vite/JSX as the representation that renderer needs.)** | React is not “how UIs are written.” It is the mechanism that keeps appearance caused by information after the tree is too large to patch. | Turn the renderer off in your head. Which bugs return immediately? |

**What must not arrive yet:** Ant Design, React Router, React Flow, npm as a lifestyle, a `package.json` full of current Tower’s dependencies. Packages arrive the first time we need **someone else’s construction** (React). Only then: what a dependency is, why a lock exists, what “the program will not run” means when a package is missing.

**Problem Epoch 2 creates:** The book lives in the page. Refresh, a second window, and tomorrow do not share it.

---

### Epoch 3 — A book that outlives the page

**Destination fragment:** Data-in-tables. `contact_records`. A server that answers queries. The desk shows what the query returns.

This is where Tower stops being a drawing.

| Cycle | We construct | Previous system cannot | Mechanism that becomes necessary | You learn | Probe |
|---|---|---|---|---|---|
| **TC-12** | Change a name, reload, the change is still there | Information in the page dies with the page | Durable information. First: a file the page is not. | Persistence is a second place. The page is a view of it, or it is a lie. | Kill the page. Open it again. What survived, and where was it? |
| **TC-13** | Find one person among many; attach a second fact to them | A file-blob cannot be asked a precise question without reading everything and hoping | Identity. Rows. A table. A relation (this fact belongs to this person). | A table is not “a database product.” It is a construction: same shape, many occupants, identity, relations. | Delete a person. What else must disappear, or become impossible to interpret? |
| **TC-14** | The desk shows only what the query returned | You are tempted to keep a pretty list in the page “so it isn’t empty” | Query as the only source the desk may read. Seeds so the table is not empty. **This is the data-in-tables law, lived.** | An empty module is honest. A painted person is a different product. | I remove the seed. The desk must go empty. If it does not, you invented a second book. |
| **TC-15** | Another program, not the browser, answers questions about the table | The page opening a file cannot be shared safely, cannot enforce rules, cannot be a second face later | A process that listens. A request. A response. **(HTTP as ask/answer. A small server. Then SQL as the language of the table.)** | An API is not a genre. It is a conversation between constructions that do not share memory. | Draw the ask and the answer for “give me this person.” Then break the answer’s shape. What should the desk do? |

**What must not arrive yet:** 24 migrations, RLS, dual tenancy, ~90 `/wire/machine/*` routes, stand-in/real registry. One table. One process. One desk reading it.

**Problem Epoch 3 creates:** The consultant is not the contact. Same person-row, different questions.

---

### Epoch 4 — Two faces, same records

**Destination fragment:** Consultant workspace vs `/c/<token>` contact seat. `PrototypeAntApp` already short-circuits the header when a contact token is in the path. That split is a construction, not chrome.

| Cycle | We construct | Previous system cannot | Mechanism that becomes necessary | You learn | Probe |
|---|---|---|---|---|---|
| **TC-16** | A second page that asks the same table a different question (“what must I do now?” vs “who is in the book?”) | One face cannot be both seats without lying | Two views, one ledger. | A desk is a question. The record is not owned by the question. | Add a field the consultant needs and the contact must not see. Where does that constraint live? |
| **TC-17** | The contact opens only their seat | A URL that shows the whole book is the wrong key | A token that means this person, not this program. | Authorization is a constraint on which rows a face is allowed to ask for. Not a login screen yet. | Steal the token in a thought experiment. What became possible that must not be? |
| **TC-18** | The contact writes (consent, an answer, a meeting). The consultant’s desk changes | Writes that stay on the contact page are a second book | One write, two readings. | This is the first close-the-loop. Meeting booked as a row the other face can see. | Book a meeting as contact. Before reloading the consultant desk, say which row must now exist and which appearance must change. |

**What must not arrive yet:** OTP, platform admin view-as, `ViewAsProvider`, firm-book halt (halt arrives when send exists). Tokens before sessions, because a secret URL is the simpler construction and you should feel why it is the wrong tool for a consultant later.

**Problem Epoch 4 creates:** We can record a meeting, but we cannot pursue someone over time, and we cannot send.

---

### Epoch 5 — Time, pursuit, goal

**Destination fragment:** Story 7b + 12. `enrollment`, `active_attempts`, channel ownership, `campaign_objective`, worker tick, `meeting_booked` as loop-closer.

Current Tower has **three clocks** on one attempt (template cell offsets, criteria windows, campaign-objective advance). That is a historically accumulated production structure. Teaching all three at once would hide why any of them exist. We build **one clock at a time**.

| Cycle | We construct | Previous system cannot | Mechanism that becomes necessary | You learn | Probe |
|---|---|---|---|---|---|
| **TC-19** | Something happens later, not only when someone clicks | “Send” is always now | Time as a cause. First: a control that means “time passed.” Then a loop that checks. | A worker is a construction that asks “is it time?” when no one is looking. | If the loop stops, what still works, and what quietly never happens again? |
| **TC-20** | One person, one attempt, one channel; then the next channel when this one failed | One send is not a mission | Ownership. A ladder. Only one channel owns the flow. | Attempt ownership is a constraint: the machine is not shouting on every medium at once. | Two channels send at once. What law did you break, and what would a consultant see that is false? |
| **TC-21** | The goal was met — stop this attempt | Time will keep escalating after success | A binary completion pointed at a real write (they booked, they answered, they clicked). | A goal is not a feeling and not a caption. It is a write that makes further pursuit of **this** campaign impossible. | Meet the goal. Then tick time. If another send leaves, the goal was decoration. |
| **TC-22** | After this goal, the next campaign — or it ends | One campaign cannot be two objectives | Sequence ⊃ campaigns ⊃ objectives. Goal as escalation. | 15:43, constructed: the goal is an escalation point. Once met, met. Distance between campaigns is not a qualify node. Teaching copy is not a node. | Author two objectives as one campaign. What became unsayable? Then split them. What became possible? |

**What must not arrive yet:** `rule_attempt_criteria` layering (campaign override → firm binding → global), faceless `wf-tick-{firmId}` audit runs, `delivered: true` at enroll as a production quirk, live Twilio/Resend. Sending can be “a row that means we would have sent” until Epoch 8.

**Problem Epoch 5 creates:** Pursuit is hardcoded. The operator cannot say “when that meeting was booked, start this other thing” without changing the program.

---

### Epoch 6 — When → do → handle → data

**Destination fragment:** Automations + 015 walk + write-set. `workflow` graph JSON, `workflow_run`, `dispatchEventToWorkflows`, `RunWrite`.

This is the epoch where current Tower’s most important primitive is allowed to appear — **after** you have already built a chain by hand and felt it break.

| Cycle | We construct | Previous system cannot | Mechanism that becomes necessary | You learn | Probe |
|---|---|---|---|---|---|
| **TC-23** | When a write of a certain kind happens, do one named thing | The mission only starts because we enrolled by hand | Event → action. The first automation. Hardcoded is correct. | Automations hear. Agents start now. That split is a construction problem, not a menu. | Fire the event twice. What must not happen twice? Fire a different write. What must not happen at all? |
| **TC-24** | Two actions in order; the second uses what the first produced | Hardcoding “use the latest person for this firm” selects the wrong person | The handle: every write **this run** made. The next step picks. | Write-set is not a field catalog. If the next step has to guess, it is not this node. Two doors: handle on this canvas vs hearing completion as another automation’s trigger. | First action writes three rows. Second action must use one of them. If it uses a fourth, the handle failed. |
| **TC-25** | Sometimes continue, sometimes take the other path | A straight chain cannot mean “only if” | A fork that reads a write (If). Several named paths (Switch) when two sides are a lie. | A condition is not an action. It is a fork after a result. Person-row splits people. Run-row does not. | Point the If at the wrong grain. Predict who walks which path. Then run it. |
| **TC-26** | The operator changes the chain without a code deploy | The chain is in the program | The chain becomes data: nodes, edges, a walk that reads them. Configured-break: an unconfigured node fails and does not continue. Until-node: walk this far. | This is why `workflowWalk` exists. You will write a small walker. You will not recut the destination walker later; you will converge toward it. House/open-box arrives as a felt constraint. | Add a node by changing data, not code. If you had to ship a new function to add a step, the chain is still the program. |

**Walker teaching order vs current file comment.** `workflowWalk.ts` still describes itself as a v1 validated-shape walk and now also visits get / rule / branch / if / switch / wait. Construction order follows **necessity**: walk a list → accumulate writes → fork → store the list as data. Free-form canvas chrome waits for Epoch 7. Get / Rule / Wait wait for Epoch 9, after the handle exists.

---

### Epoch 7 — Authoring faces

**Destination fragment:** Configuration libraries → Automations workbench and Agents workbench. Click node = configure. React Flow. Plate interiors. Sequence canvas.

React Flow is a **better editor for a graph you already have**. It is a disastrous first representation of a graph.

| Cycle | We construct | Previous system cannot | Mechanism that becomes necessary | You learn | Probe |
|---|---|---|---|---|---|
| **TC-27** | An operator desk that edits the graph as a list of steps; click a step to configure it | Editing JSON by hand is not operating the house | Click = configure. A selected node. An interior that writes back into the graph data. | The canvas is not the walk. The walk reads the data the interior stored. | Configure a node so `configured === false` becomes true. Run. Then unconfigure it. The walk must stop there. |
| **TC-28** | The same graph as a spatial canvas, because a list cannot show a fork | List-of-steps hides Switch paths and lying about topology | Nodes, edges, handles as a drawing of the data. **(React Flow arrives because the list failed.)** | Drawing a graph does not create a second machine. If the drawing and the walk disagree, the drawing is decoration. | Draw a path the walk cannot take. You must be able to say which construction is lying. |
| **TC-29** | A second authoring face: sequence ⊃ campaigns ⊃ channels; enroll now | Stuffing a mission into an event-graph makes “start now” look like a fake trigger | Agents as a different construction. Header enroll. Not Publish. Automations may assign an existing sequence; they do not author a new agent. | Do not mix the words. `⋯` Switch changes this node’s kind. Palette Switch is the many-path node. | Enroll from the sequence header with no event. Then fire an automation that assigns the same sequence. Name which door you used, twice. |

**Ant Design** may arrive in this epoch or at the end of Epoch 4, and only as: we have rebuilt table / layout / modal chrome enough times that chrome is stealing attention from the machine. Tokens and a component library are a construction for **repeated desk chrome**. They are not “how you start an app.”

**Problem Epoch 7 creates:** Anyone who can open the page can edit any firm’s graph and send as anyone. Also: Run and Launch feel like the same button until they ruin something.

---

### Epoch 8 — Tenancy, gates, ignition kinds

**Destination fragment:** `firms` / `users` / `sessions` / OTP / access links; `requireSessionFirm`; `consent_records` / `halt_records`; `dispatchSend`; Test on trigger / Run / Launch.

| Cycle | We construct | Previous system cannot | Mechanism that becomes necessary | You learn | Probe |
|---|---|---|---|---|---|
| **TC-30** | Two firms, two books, two operators who must not see each other | A tokenized contact seat is the wrong tool for a consultant who returns tomorrow | Identity. Session. Firm on every ask. OTP (or access link) when a bookmarkable secret URL is the wrong shape. | Auth is a constraint on which ledger you are inside. Platform-admin view-as is a later exception, not the first model. | Log in as firm A. Ask for firm B’s person. The server must refuse. The desk must not paint a stand-in. |
| **TC-31** | A send that can leave the building — and a way to forbid it | Dry-run rows cannot be confused with live send once a provider exists | Consent. Halt (this person / this book). A send mode. **Live ports last.** | “We can send” and “we may send” are different constructions. Halt blocking **new** enrollments is a different constraint from silence on an in-flight attempt. | Opt out. Tick. If a live send leaves, the gate was chrome. Halt the book. Enroll. If a new attempt appears, you missed `isDeadBlockingNew`’s cousin. |
| **TC-32** | Test data on the trigger; Run walks now; Launch arms | One button that “does the automation” conflates specimen writes, a walk, and a subscription | Three ignitions. Event-test contract as **tables** (`event_write_set`, `event_test_data`), not a fixture in the client. | Run requires writes. Launch must not walk. Hearing `audit.completed` on another canvas is the other door, not a substitute for the handle. | Launch. Do not Run. Nothing may walk until a real event. Then Run-to-here (`untilNodeId`). Downstream nodes must not have run. |

---

### Epoch 9 — Remaining mechanisms, then an honest gap

**Destination fragment:** Get, Rule, Wait / `wait_occupancy`; Local vs Global; evaluation / motion tables; operator house modules; contact seat completeness.

| Cycle | We construct | Previous system cannot | Mechanism that becomes necessary | You learn | Probe |
|---|---|---|---|---|---|
| **TC-33** | Get existing records; evaluate a rule whose rows live in a table; wait for time or a person | The walk can only use what the trigger already held, and it cannot pause | Get as a query that becomes writes. Rule as data, not an `if` in the walker. Wait as park / resume. | Fetch, judge, and pause are different problems. A rule in code is a deploy. A rule in a table is the house. | Change a rule row, not a function. The next walk must judge differently. Approve a wait. Only then may the downstream node run. |
| **TC-34** | This form / this objective / this campaign — not every event of that kind | Global listen over-fires | Grain. Local axis. | Local is a constraint on which write a trigger is allowed to hear. Some events have no Local (a one-time audit). That is still an event. | Submit form B. The automation that listens to form A must not walk. Submit form A. It must. |
| **TC-35** | The house changes evaluation, binding, sending, and provision without shipping the walker again | Pursuit and eligibility are still half-program | Operator modules as panes and controls on states you already named. Evaluation packs as tables. Bind per firm / default / override. | Story’s house/open-box constraint, constructed. Then: walk current Tower and list what you still cannot reconstruct — stand-ins, silences, dual tenancy, three-clock leftover. Honesty is part of the construction ability. | Point at a current Operator module and say: control or pane? Which table? If you cannot, we are not at destination. |

TC-35 ends in a **convergence audit**, not a victory lap. You compare Tower Construction’s working system to this repository’s face + walk + tables, and you name remaining gaps in the two buckets: specified-and-clear (keep constructing) vs specified-but-not-clear (do not invent).

---

## 6. What you would understand after each epoch

Not skills. Causal possessions.

| After | You can reason |
|---|---|
| Epoch 0 | A screen occupant is caused. Appearance is a separate construction. Behavior is a listen plus a run. |
| Epoch 1 | The page is a view of information. Selection is information. A list requires identity. |
| Epoch 2 | Names prevent drift. Shapes prevent silent lies. A renderer exists because hand-patching the page fails. |
| Epoch 3 | The desk is not the book. A query is the only honest source. An API is a conversation between constructions that do not share memory. |
| Epoch 4 | A face is a question. A token is a constraint. A write on one face is a row the other face can read. |
| Epoch 5 | Time is a cause. One attempt owns one channel. A goal is a write that stops this campaign. The next campaign is an escalation, not a caption. |
| Epoch 6 | Hear ≠ start now. The next step picks from this run’s writes. A fork reads a write. A walk reads data so the house can change the chain. |
| Epoch 7 | Configure writes data; the walk reads data. A canvas is an editor. Agents and Automations are different constructions that meet at enroll. |
| Epoch 8 | Firm is a ledger boundary. Send is gated. Test, Run, and Launch are three ignitions. |
| Epoch 9 | Fetch / judge / pause are not one node. Local is a grain. The house is tables plus panes, not a redeploy. You can see where current Tower is still historically tangled. |

The **product** of Tower Construction is the ability to look at an intended capability and say:

> These things need to exist. This information needs to be represented. These relationships need to exist. This behavior belongs here. This event needs to cause this transition. This part needs to communicate with that part. Therefore I need these mechanisms.

If a cycle does not move you toward that sentence, it is a syntax drill and it should be cut.

---

## 7. Where current Tower would be a bad teaching order

These are not insults to the repo. They are places where **historical accumulation ≠ causal order**. Teaching current files in git order, or in folder order, would hide why the abstractions exist.

### 7.1 Hub first

`src/app/App.tsx` is an older plant: Radix/shadcn, hardcoded client tab labels, planted journeys. Product law: Hub is not the app. Teaching Hub teaches a second product and violates data-in-tables on day one.

**Better order:** `/prototype-ant` is the only destination face. Hub may be opened late as a historical artifact: “this is what a desk looks like when the book lives in the component.”

### 7.2 Stack first

Current boot is Vite + React + TypeScript + Ant Design + React Router (main app) + Hono + Postgres + a stand-in/real registry. That is a production assembly. None of those mechanisms are the first problem a blank page has.

**Better order:** file → element → appearance → event → information → named construction → renderer → durable table → server. Each tool arrives as the representation of a failure.

### 7.3 Workbench first

`AntAutomationWorkbench.tsx` + `automationPlates/*` + React Flow + write-set + If/Switch + Save/Run/Launch + test-data + `paintRunOntoNodes` is many state machines. Starting there makes “node” mean “a pretty box.”

**Better order:** a function that does one thing → two things in order → the second needs the first’s result → the list is data → a list editor (click = configure) → a canvas because branching cannot be a list.

### 7.4 Three clocks on one attempt

Current `tickOnce` advances template cells, escalates criteria windows, and advances campaign objectives. Plus a historical quirk: `delivered: true` at enroll, so some “opened” criteria are really time-thresholds.

**Better order:** one send → time → next channel → goal stops this campaign → next campaign. Rule tables appear when changing the ladder requires a deploy and that is no longer acceptable. Template-cell offsets appear only if a simpler campaign clock cannot say what Tower’s face requires.

### 7.5 Dual tenancy and dual walkers

Login `firms` are UUIDs. Machine rows use TEXT CT firm ids. When `VITE_WIRE_REAL=false`, a client stand-in simulates the walk.

**Better order:** one firm id, one walker, one book. Dual tenancy is named at convergence as a leftover, not as “how identity works.” A second walker is forbidden: it teaches that Automations is a preview.

### 7.6 Auth and live send first

OTP, session cookies, Resend, Twilio, SEND_MODE, and pool gates are real. They are also late constraints.

**Better order:** no auth → contact token → two firms need identity → then OTP. Dry-run send rows → then live ports, which **force** consent/halt to be real.

### 7.7 Sequence classes as archaeology

Migration `010` refactors older four-class templates into sequence ⊃ campaigns. Teaching the older class names as types freezes teaching copy.

**Better order:** two objectives = two campaigns from the first day a goal exists. Opt-in / re-engagement / reactivation are templates, not objective names. Captions are not nodes.

### 7.8 Field catalogs and client constants

`collectible_fields` exists so capture kind is not a SPA catalog. `event_write_set` exists so Test is table-driven. Client mirrors still exist in places.

**Better order:** the table is the catalog the first time a catalog is needed. A TypeScript list is allowed only as a mirror, and the understanding test is: delete the mirror, the desk still works.

### 7.9 UI-first Phase One as a learning path

Phase One correctly built a face so there was something to inhabit, with the machine locked in parallel. That is a **product-building** order. For a constructor who knows no implementation, UI-first without a ledger produces the Hub failure mode: a full-looking desk whose people are not records.

**Better order:** face until the face lies without a ledger; then ledger; then face again. Alternate. Never polish an empty module with a painted row.

### 7.10 Operator house and stand-in ports as “the app”

Provision, commercial, Meta, escrow, sending-pool chrome are real modules. They are not the causal ring.

**Better order:** ring first (author → walk → enroll → tick → contact write → objective → event). House modules when the house must change that ring without a deploy. Stand-ins labeled “not the system.”

---

## 8. How I would test that you understand the construction

A cycle is not done when the screen matches. It is done when you can do the following without looking at the syntax I typed last time.

### Battery (every cycle)

1. **Intention restated.** What were we constructing, in your words, without mechanism names?
2. **Prediction.** Before running: what will appear, what row will exist, what will not happen?
3. **Manipulation.** Change one value. Say what else must change, and what must not.
4. **Removal.** Delete the new mechanism. What becomes impossible? If the answer is “nothing,” we introduced it too early.
5. **Alternative.** Name a different construction that would produce a different result. Not “a worse style” — a different cause.
6. **Diagnosis.** I break one relationship (stale information, guessed handle, painted row, Global firing for the wrong Local, Launch that walks). You find the broken relationship, not the missing semicolon, unless the semicolon is the relationship.

### Battery (every epoch)

7. **Forward construction.** I give a near-neighbor intention. You name what must exist **before** writing. If you reach for a library name first, we rewind.
8. **No-look rebuild.** The next day, reconstruct the epoch’s working system from the intention. You may look at current Tower as destination/reference. You may not look at yesterday’s files.
9. **Law check.** Data-in-tables, write-set, click=configure, teaching-copy-is-not-a-node, Hub-is-not-the-app — only as each law has become live. You should be able to violate one on purpose and say what lie the product now tells.

### What I will treat as a fail

- The screen matches and you cannot say what write caused it.
- You reproduced a syntax pattern and cannot say what problem it is solving.
- You ask for the next library because it is familiar from current Tower, not because the current construction failed.
- You paint a person so a module is not empty.
- You build a second walker.

---

## 9. How my involvement decreases

The actual product is your construction ability. My usefulness should fall on a schedule.

| Cycles | My role | Your role | I should refuse |
|---|---|---|---|
| **TC-0 – TC-11** | Sit in the problem with you. Ask what you think must exist. Introduce the minimum syntax at the moment of need. Demonstrate a mechanism **once**. | Decide what should appear. Type the construction. Predict before we run. | Generating the page for you. Starting from a Vite template “to save time.” |
| **TC-12 – TC-22** | Name when a simpler construction is still available. Review. Let you sit in a broken persistence or a lying desk longer. | Propose the construction. Build the table, the ask/answer, the second face, the first clock. | Inventing a schema for you because Postgres is “how it’s done.” Introducing OTP so the contact seat feels grown-up. |
| **TC-23 – TC-29** | Confirm or refute the mechanisms you named against Tower’s actual laws (handle, two doors, enroll-now vs hear, click=configure). | Look at the intended capability and list what must exist **first**. Build the walker, then the editor. | Handing you `workflowWalk.ts` to copy. Opening React Flow before a list editor has failed. |
| **TC-30 – TC-34** | Inspector of reference Tower. I point at a destination constraint you have not yet felt (firm boundary, Local grain, Launch-must-not-walk). | You are the constructor. You choose representation. You diagnose. | Pair-programming the send gate “because it’s tricky.” |
| **TC-35 and after** | Packet-reader with you, same two buckets as the Engineer seat. | You can read an intended capability (or a PM/SA packet) and construct. You can look at current Tower and say what is load-bearing vs leftover. | Being the person who decides what needs to exist. |

A concrete fade rule: if I notice I am choosing the next mechanism, I stop and ask you what the current system cannot do. If I notice I am typing the construction, I stop. If you ask me to “just implement this cycle,” that request is out of scope for Tower Construction even when it would be in scope for the Engineer seat on `omcoda_tower`.

---

## 10. How Tower Construction would relate to this repository

- **This repo is the destination and the reference.** We inspect it. We do not rebuild inside it. We do not treat Hub as the destination. We do not recut `workflowWalk.ts` here as a teaching fork.
- **Tower Construction is a separate repository**, created only after you accept (or recut) this map. Each cycle is a working system in that repo. Early cycles may be a single HTML file. Later cycles grow toward this architecture because the problems require it, not because we paste these folders.
- **We do not import current source as the lesson.** At convergence we may *compare* a construction to the current file that holds the same mechanism (`workflowWalk.ts`, `cascade.ts`, `ContactWorkspace.tsx`, `001_auth_tables.sql`) to see what production residue is leftover vs load-bearing.
- **Seeds and empty modules.** Once a table exists, it is seeded enough to query. The Construction desk, like this one, shows what the query returns.
- **Docs in this repo stay as law**, not as reading homework. `PRIMITIVES.md`, `DATA-IN-TABLES.md`, Agents/Automations face laws, and Story spine are introduced **when the construction has already produced the problem they name.**

---

## 11. Worked example of the grain (not a cycle to implement)

This is the method, at the scale of one arrival, so you can reject the grain if it is wrong.

**We have (imagine end of TC-23):** when `meeting_booked` is written, the program enrolls that contact on a sequence. The enroll line names the contact id from the request.

**Intention:** After an audit runs, tag only the people **that audit** wrote, then enroll them.

**Problem you should hit:** The enroll line still says “latest contacts for this firm.” A second audit for someone else ran in between. The wrong people are enrolled.

**Question I ask before explaining:** What does the second step actually need to know, and where did that knowledge come from?

**Mechanism, only then:** The first step produced writes. The second step must be handed **those** writes. That bundle is the write-set. The next node picks. Guessing is the other product.

**Syntax, only then:** A value that is a list of `{ table, id, contact_id }`. A function argument. Later, `previousWrites` as a name for “last node,” `chainWrites` as a name for “this whole run,” when “last node only” has already dropped a write you needed.

**Removal test:** Delete the bundle and keep a `firmId`. What enrollment becomes possible that must not be?

**Alternative:** Hear `audit.completed` on a **different** automation (the other door). That is a legal different construction. It is not a substitute for the handle on this canvas.

That is one cycle. Current Tower’s `RunWrite` type is the destination representation, not the first sentence.

---

## 12. What I am asking you to review

Please recut any of the following before anything is created:

1. **Destination.** Is “current `/prototype-ant` + walk + tables + three desks” the right finish line, with Hub / stand-ins / system-map named as non-spine?
2. **Cycle count and grain.** 36 cycles in 10 epochs — too coarse (problems get skipped) or too fine (causality drowns in steps)?
3. **Epoch order.** The sharpest design choice: **durable book and two faces before Automations**, and **pursuit before the walker**. That is the opposite of opening Configuration libraries first. If you want authoring earlier, say so — I think that would teach boxes before writes.
4. **When React / types / packages / Ant / React Flow / Postgres arrive.** I have them arriving at first failure, which is later than a normal bootcamp and earlier than “write the walker in vanilla DOM.”
5. **Live send last.** Dry-run rows through Epoch 5–7, real providers only when consent/halt can be felt.
6. **Understanding tests.** Are prediction / removal / diagnosis / no-look rebuild the right proofs, or do you want a different kind of challenge?
7. **Fade.** Is the involvement schedule strict enough that this cannot collapse into an agent-builds-it project?

I will not create the Tower Construction repository, scaffold a cycle, or write exercises until you accept or recut this map.
