# JOURNEY — table of contents and cycle contracts

**Version:** 1  
**Mutability:** Versioned. Split or merge with a version stamp and a reason. Do not silently rewrite.  
**Not this file:** lessons, exercises, finished code, explanations of functions / React / SQL.

Each heading below is a **contract** for a future chapter. The agent generating TC-N reads this contract, [`RULES.md`](./RULES.md), [`MASTERY.md`](./MASTERY.md), [`DESTINATION.md`](./DESTINATION.md), and the learner’s validated TC-(N−1) work.

**Advance:** never because the next heading exists. Advance when that cycle’s **Exit capability** is met and **Next pressure** is visible.

**Chapter path:** `book/epoch-<k>/tc-<n>.md` where `<k>` is the epoch, not the cycle number. Epoch 0 contains TC-0–4. `constructions/` and `my-work/` stay `tc-<n>`.

---

## How to read a contract

| Field | Meaning |
|---|---|
| **Destination** | The capability this cycle exists to cause. |
| **Prerequisites** | Prior cycles whose exit must be stable. |
| **Construction** | What is built. |
| **Forces** | Why the previous system is insufficient. |
| **Concepts expected** | Industry names attached **after** the phenomenon. Not a reading list. |
| **Technologies touched** | Allowed representations. Absence means “none yet.” |
| **Syntax families** | Fluency targets for this cycle only. |
| **Must produce** | Observable outcome. |
| **Must NOT introduce** | Hard boundary. Violating this is a RULES break. |
| **Exit capability** | The mastery bar (see MASTERY). |
| **Next pressure** | The limitation that makes the following cycle necessary. |

---

## Epoch 0 — Appearance

Destination fragment: a browser page on which a desk can later exist.

### TC-0 — Smallest causal chain

**Destination:** The smallest causal chain from something you author to something a browser produces.

**Prerequisites:** None. Operating grain: [`../TC-0-OPERATION.md`](../TC-0-OPERATION.md).

**Construction:** An empty HTML file, opened from disk, producing a blank page.

**Forces:** Nothing authored is being interpreted into a page. Later Tower is still this chain under machinery.

**Concepts expected:** source · HTML file (as a *kind*) · interpret / render · page · extension (as kind-signal) · refresh / reload

**Technologies touched:** HTML (file kind only — no tags)

**Syntax families:** empty `*.html` file

**Must produce:** A blank page caused by the learner’s empty source. Notes that state the chain in the learner’s words.

**Must NOT introduce:** tags · document skeleton · any occupant · CSS · JS · TS · React · Vite · a server · computer-literacy drills (folder, save, what is a browser) · Tower source

**Exit capability:** Can state and re-cause: author file → browser interprets → page. Can distinguish the file from the page.

**Next pressure:** Something in the head should exist *on* the page. This chain cannot cause an occupant.

---

### TC-1 — Occupant

**Destination:** One intended thing exists on the page because the source says so.

**Prerequisites:** TC-0

**Construction:** Put one occupant in the source so the rendered page is no longer empty.

**Forces:** Empty source renders empty. Intention (“I want that there”) has no representation.

**Concepts expected:** tag · element · document · body (as the place that appears) · head (as the place that does not)

**Technologies touched:** HTML

**Syntax families:** element tags · nesting of `html` / `head` / `body` · a text-bearing element (e.g. heading or paragraph)

**Must produce:** One visible occupant. Removing the element removes the occupant.

**Must NOT introduce:** CSS · JS · classes as design system · React · multiple competing occupants as the point of the cycle

**Exit capability:** Can cause a *different* occupant than the chapter used, by deciding what the source must contain — without being shown that tag first.

**Next pressure:** The occupant exists but cannot be placed or distinguished by appearance.

---

### TC-2 — Appearance

**Destination:** Control where / how the occupant appears, without changing what the occupant *is*.

**Prerequisites:** TC-0 → TC-1

**Construction:** Rules attached to the occupant that affect place, size, or color.

**Forces:** HTML names the thing. It does not place it. Intention (“there, not here”) has no representation.

**Concepts expected:** CSS · rule · selector · property · declaration

**Technologies touched:** CSS · HTML

**Syntax families:** a style rule · a few layout/color properties required by the construction (not a property encyclopedia)

**Must produce:** The same occupant, different place or look, caused by rules — not by changing the words inside the element.

**Must NOT introduce:** a design system · Tailwind · a component library · JS · responsive frameworks

**Exit capability:** Change one rule; predict what moves; do it. Can say: appearance is a second construction attached to the first.

**Next pressure:** One occupant cannot be a desk.

---

### TC-3 — Several things

**Destination:** Several occupants, in an order, on one page.

**Prerequisites:** TC-0 → TC-2

**Construction:** Repeated elements. Sequence in the source is sequence on the page.

**Forces:** A single occupant cannot be a list, a board, or a desk.

**Concepts expected:** tree · parent / child · order · sibling

**Technologies touched:** HTML · CSS (only as already needed)

**Syntax families:** repeated elements · lists if the construction requires them

**Must produce:** Several distinguishable things. Reorder in source → reorder on the page.

**Must NOT introduce:** JS · components · a data array as the source of truth (that is later)

**Exit capability:** Reorder without changing the things themselves, and say what actually changed (the tree / the order).

**Next pressure:** Things only sit there. One of them should do something.

---

### TC-4 — Behavior

**Destination:** One occupant responds. A click (or equivalent) causes something to run.

**Prerequisites:** TC-0 → TC-3

**Construction:** A listen and a response attached to one occupant.

**Forces:** A desk that cannot act is a picture.

**Concepts expected:** event · listener · handler · script

**Technologies touched:** HTML · JavaScript (first arrival)

**Syntax families:** attaching a listener · a function body that runs on the event (minimal)

**Must produce:** An occupant that does something visible or inspectable when the event happens. Remove the listener: the thing still exists; the behavior is gone.

**Must NOT introduce:** frameworks · state as a named curriculum object yet · `addEventListener` encyclopedia · TypeScript

**Exit capability:** Can add behavior to a *different* occupant than the chapter used, and explain listen + run.

**Next pressure:** The click always does the same thing. Behavior cannot depend on information.

---

## Epoch 1 — Information

Destination fragment: a list, a selection, a detail — the consultant board in primitive form.

### TC-5 — Behavior reads information

**Destination:** The response depends on a value, not only on the fact of the click.

**Prerequisites:** TC-0 → TC-4

**Construction:** A value the handler reads. Change the value, not the listener; the outcome changes.

**Forces:** Fixed behavior cannot be a desk. Information is not the page.

**Concepts expected:** value · variable · read vs write (ordinary sense)

**Technologies touched:** JavaScript · HTML

**Syntax families:** variable declaration and assignment · reading a value in a handler

**Must produce:** Two different outcomes from the same listener, caused only by different information.

**Must NOT introduce:** React · `useState` · TypeScript · persistence

**Exit capability:** Change the value, not the listener, and predict what on the page changes and what does not.

**Next pressure:** The value can change and the page can still show the old world.

---

### TC-6 — State

**Destination:** The page is built from the current information. When the information changes, appearance changes.

**Prerequisites:** TC-0 → TC-5

**Construction:** A relationship: information → appearance. After the phenomenon is understood, name it **state**.

**Forces:** A value that nothing re-reads is a dead fact. The page lies.

**Concepts expected:** state · current value · the page as a view of information

**Technologies touched:** JavaScript · HTML

**Syntax families:** updating a value · causing the page to reflect it (still manual is allowed — that pain is TC-11)

**Must produce:** Change information; the page shows the new world without editing the HTML by hand as if it were a second book.

**Must NOT introduce:** React · `useState` · Redux · persistence

**Exit capability:** Can name this relationship “state” and point at it. Can name one piece of information whose change should *not* affect the page, and why.

**Next pressure:** One value cannot be a book. We need many occupants and a selection.

---

### TC-7 — List and selection

**Destination:** A list of people (or equivalent). Select one. See that one.

**Prerequisites:** TC-0 → TC-6

**Construction:** A collection. An identity for each occupant. Selected identity. Detail is a function of selection.

**Forces:** A single value is not a book. The consultant board is already this construction.

**Concepts expected:** collection / array · identity · selection · index vs identity

**Technologies touched:** JavaScript · HTML · CSS as needed

**Syntax families:** arrays · reading an item by identity · rendering a list (still by hand if needed)

**Must produce:** Add a person; they appear in the list; they can be selected; detail matches selection.

**Must NOT introduce:** a database · React · hardcoded “Sarah Jenkins” as the product · a server

**Exit capability:** Add a person without being given the next line of code. Can say what had to exist that did not exist for “one name on a page.”

**Next pressure:** The page is a pile of repeated constructions. Copy-paste drifts.

---

## Epoch 2 — Named constructions

Destination fragment: reuse, shape, a renderer. Stack names arrive only as representations of failures.

### TC-8 — Named construction

**Destination:** Repeated structures can be expressed once and reused.

**Prerequisites:** TC-0 → TC-7

**Construction:** Take a repeated construction and give it a reusable form.

**Forces:** Repetition / drift in the previous system. Change in one place, forget the other: the desk lies.

**Concepts expected:** function · parameters · arguments · return value · scope

**Technologies touched:** JavaScript

**Syntax families:** function declarations · function calls · parameters · return

**Must produce:** One definition used at least twice. Change the definition; every use changes. If many page-places must still be edited by hand, the name failed.

**Must NOT introduce:** React · components · TypeScript · modules-as-a-course · arrow-function encyclopedia beyond what the construction uses

**Exit capability:** Can recognize a repeated construction and extract it **without** being instructed to “make a function.”

**Next pressure:** Reusable construction still permits information of unintended shapes. Also: functions that print text still leave *page structure* duplicated.

---

### TC-9 — Component

**Destination:** The same page-construction (row, button, region) appears in two places without forking.

**Prerequisites:** TC-0 → TC-8

**Construction:** A construction that is itself a thing-on-the-page — composed, reused.

**Forces:** Functions that compute text do not stop the markup from drifting. A desk is composed. Chrome is reusable; the record is not.

**Concepts expected:** component · composition · props / inputs to a page-construction (plain sense)

**Technologies touched:** JavaScript · HTML (still without React unless evidence already forced TC-11 early — do not pull React here)

**Syntax families:** functions that return / build page structure · passing values into them

**Must produce:** A second list (e.g. meetings) from the same row construction. Shared chrome. Different records.

**Must NOT introduce:** React · JSX · a component library · TypeScript

**Exit capability:** Build a second list from the same row construction and say what must stay shared and what must not.

**Next pressure:** Information of the wrong shape still silently becomes a lying row.

---

### TC-10 — Named shapes

**Destination:** Information cannot silently be the wrong shape.

**Prerequisites:** TC-0 → TC-9

**Construction:** A named shape. Checking at the moment of construction. A person without identity, or a selected id not in the list, is refused.

**Forces:** Silent wrong shape makes the desk lie. The learner has already been bitten or can predict the bite.

**Concepts expected:** type · interface (or equivalent named shape) · compile-time / check-time vs run-time (only as this construction needs)

**Technologies touched:** TypeScript (first arrival) · JavaScript as it already exists

**Syntax families:** type / interface for the person and the selection · annotating the values the desk reads

**Must produce:** A broken person is refused before the page lies.

**Must NOT introduce:** React · a type-system course · generics encyclopedia · `any` as the escape hatch of the chapter

**Exit capability:** Given a broken person, refuse it and say which constraint failed — without being told “add a type.”

**Next pressure:** The page is still patched by hand when information changes. Miss a node; the desk lies. (If TC-9’s “page structure as functions” has already failed loudly, this pressure may already be hot.)

---

### TC-11 — Renderer

**Destination:** The page stays true when information changes, without the learner rewriting the tree by hand.

**Prerequisites:** TC-0 → TC-10

**Construction:** A renderer that rebuilds appearance from information. React arrives because that is the mechanism; Vite / JSX arrive as the representation that renderer needs. Packages arrive as “someone else’s construction.”

**Forces:** Manual DOM / HTML patching misses a node. The desk lies. The tree is too large to patch.

**Concepts expected:** render · React · component (now as React’s representation) · JSX · dependency · package · entry point (when `main.tsx` / the boot file appears — name it immediately)

**Technologies touched:** React · Vite (or equivalent bundler, only as required) · TypeScript · npm as the minimum to obtain React

**Syntax families:** a function component · JSX for the list + detail already owned · `useState` *now*, as this library’s syntax for state already understood · importing a package

**Must produce:** The TC-7 desk, still true after adds/selects, without hand-patching nodes.

**Must NOT introduce:** Ant Design · React Router · React Flow · Tower’s `package.json` · Redux

**Exit capability:** Can say what bugs return if the renderer is removed. Can produce the required React/JSX syntax for this desk.

**Next pressure:** The book lives in the page. Refresh, a second window, and tomorrow do not share it.

---

## Epoch 3 — A book that outlives the page

Destination fragment: data-in-tables. One table. One process. One desk. **Likely split later.**

### TC-12 — Persistence

**Destination:** Change a name, reload, the change is still there.

**Prerequisites:** TC-0 → TC-11

**Construction:** Durable information in a second place the page is not. First: a file (or equivalent) the page reads.

**Forces:** State in the page dies with the page. Two windows disagree.

**Concepts expected:** persistence · source of truth · serialize / deserialize (if the file is text)

**Technologies touched:** whatever writes/reads the durable file (still local is correct)

**Syntax families:** read/write of the durable representation already in play (JSON if that is the file)

**Must produce:** Kill the page; open again; the change survived; the learner can say *where*.

**Must NOT introduce:** Postgres · HTTP · a server · 24 migrations · “so the module isn’t empty” painted rows

**Exit capability:** Can point at the second place and say the page is a view of it — or it is a lie.

**Next pressure:** A blob cannot be asked a precise question. Many people, one fact each, no identity.

---

### TC-13 — Identity, rows, relations

**Destination:** Find one person among many. Attach a second fact to them.

**Prerequisites:** TC-0 → TC-12

**Construction:** Identity. Rows. A table. A relation (this fact belongs to this person).

**Forces:** A file-blob cannot be queried without reading everything and hoping.

**Concepts expected:** identity · row · column · table · relation · foreign key (when the second fact needs it)

**Technologies touched:** a real table if the file has already failed (SQL / Postgres allowed *here* if the blob has failed; not a cloud course)

**Syntax families:** create a table · insert · select by id · a second table keyed to the first — only as forced

**Must produce:** Delete a person; related facts are gone or uninterpretable; the learner can say which.

**Must NOT introduce:** a second server · RLS · ~90 routes · dual tenancy · an ORM course

**Exit capability:** Can explain why a table is a construction (same shape, many occupants, identity, relations) without being told “we’re learning SQL.”

**Next pressure:** The desk is tempted to keep a pretty list in the page so it is not empty.

---

### TC-14 — Query is the only source

**Destination:** The desk shows only what the query returned. An empty module is honest.

**Prerequisites:** TC-0 → TC-13

**Construction:** Query as the only source the desk may read. Seeds so the table is not empty — a reasonable count, not a fake world.

**Forces:** A painted person is a different product (Hub failure mode). Data-in-tables must be lived.

**Concepts expected:** query · seed · empty state (honest)

**Technologies touched:** same table stack as TC-13 · the desk from TC-11

**Syntax families:** the select the desk actually runs

**Must produce:** Remove the seed; the desk goes empty. If it does not, a second book was invented.

**Must NOT introduce:** a second catalog in the client · Hub · “just for the screenshot”

**Exit capability:** Will not paint a person to finish a plate. Can say what the query returned and what the desk showed, as the same fact.

**Next pressure:** The page opening a file / a local table cannot be a second face later, cannot enforce rules, cannot be shared as a conversation between programs.

---

### TC-15 — Ask / answer

**Destination:** Another program, not the browser, answers questions about the table.

**Prerequisites:** TC-0 → TC-14

**Construction:** A process that listens. A request. A response. HTTP as ask/answer. SQL as the language of the table if not already fluent from TC-13.

**Forces:** Two programs do not share memory. A second face (later) needs a conversation, not a shared variable.

**Concepts expected:** process · server · request · response · HTTP · API (as this conversation) · JSON as a payload if used

**Technologies touched:** a small server (Hono is allowed if it is the representation, not because Tower uses it) · SQL as needed

**Syntax families:** one GET (or equivalent) for “give me this person” · the desk calling it

**Must produce:** Draw the ask and the answer. Break the answer’s shape; the desk must not invent a person.

**Must NOT introduce:** 90 routes · auth · OTP · stand-in/real registry · webhooks

**Exit capability:** Can describe an API as a conversation between constructions that do not share memory, and write the one ask this desk needs.

**Next pressure:** The consultant is not the contact. Same row, different question.

**Split flag:** If validated TC-14 work shows “server,” “SQL,” and “HTTP” as three unfelt constructions, split before generating this chapter.

---

## Epoch 4 — Two faces, same records

Destination fragment: consultant desk vs contact seat.

### TC-16 — Two questions, one ledger

**Destination:** A second page asks the same table a different question.

**Prerequisites:** TC-0 → TC-15

**Construction:** Two views. One ledger. Consultant: who is in the book. Contact: what must I do now.

**Forces:** One face cannot be both seats without lying.

**Concepts expected:** view · face / desk · ledger

**Technologies touched:** same server + tables + renderer

**Syntax families:** a second page / route-or-file that queries the same rows differently — **no React Router requirement**; a second file is enough

**Must produce:** A field the consultant needs and the contact must not see — constraint lives somewhere the learner can name.

**Must NOT introduce:** OTP · view-as admin · halt · tokens (that is TC-17)

**Exit capability:** Can say: a desk is a question; the record is not owned by the question.

**Next pressure:** A URL that shows the whole book is the wrong key for the contact.

---

### TC-17 — Token

**Destination:** The contact opens only their seat.

**Prerequisites:** TC-0 → TC-16

**Construction:** A token that means this person, not this program.

**Forces:** Knowing the desk URL is not authorization.

**Concepts expected:** token · authorization (as a constraint on which rows a face may ask for)

**Technologies touched:** server + whatever issues/checks the token (not OTP)

**Syntax families:** a secret in the path or equivalent · server refusal when the token does not match

**Must produce:** Steal-the-token thought experiment written: what became possible that must not be.

**Must NOT introduce:** OTP · sessions for consultants · platform admin · OAuth

**Exit capability:** Can explain a token as a constraint, not as “login.”

**Next pressure:** Writes that stay on the contact page are a second book.

---

### TC-18 — One write, two readings

**Destination:** The contact writes (consent, an answer, or a meeting). The consultant’s desk changes.

**Prerequisites:** TC-0 → TC-17

**Construction:** One write. Two readings. First close-the-loop.

**Forces:** Two books. The meeting did not happen if only one face knows.

**Concepts expected:** write · read · meeting booked (as a row, not a feeling)

**Technologies touched:** table + both faces

**Syntax families:** a POST (or equivalent) that inserts the row both faces query

**Must produce:** Book as contact; before reloading consultant, the learner names the row that must exist and the appearance that must change.

**Must NOT introduce:** live email · halt · enrollment · a walker

**Exit capability:** Can close the loop and say which write caused the other desk to change.

**Next pressure:** We can record a meeting. We cannot pursue someone over time.

---

## Epoch 5 — Time, pursuit, goal

Destination fragment: enrollment, one attempt, one clock at a time, goal as escalation.

### TC-19 — Time as a cause

**Destination:** Something happens later, not only when someone clicks.

**Prerequisites:** TC-0 → TC-18

**Construction:** First: a control that means “time passed.” Then a loop that checks. A worker is a construction that asks “is it time?” when no one is looking.

**Forces:** “Send” (or “remind”) is always now. Pursuit cannot exist.

**Concepts expected:** time · tick · worker / loop · schedule (ordinary sense)

**Technologies touched:** the existing server or a small loop in-process — not a production queue

**Syntax families:** a timer or a “tick” action · a record of “due”

**Must produce:** If the loop stops, the learner can say what still works and what quietly never happens again.

**Must NOT introduce:** cron products · three clocks · live SMS · `rule_attempt_criteria`

**Exit capability:** Can treat time as a cause, not as a UI animation.

**Next pressure:** One later send is not a mission.

---

### TC-20 — Attempt ownership

**Destination:** One person, one attempt, one owning channel; then the next channel when this one failed.

**Prerequisites:** TC-0 → TC-19

**Construction:** Ownership. A ladder. Only one channel owns the flow. Send may still be a *row that means we would have sent*.

**Forces:** Shouting on every medium at once is not Tower’s constraint and lies to the consultant.

**Concepts expected:** attempt · channel · ownership · ladder / escalation (as next owner)

**Technologies touched:** tables for attempt + channel owner

**Syntax families:** the write that changes owner · the tick that consults it

**Must produce:** Two channels must not send at once. The learner can say what law that would break.

**Must NOT introduce:** live Twilio/Resend · criteria layering · template-cell clock · faceless tick workflows

**Exit capability:** Can keep one owner and move the owner for a reason, without being told “make a state machine.”

**Next pressure:** Time will keep escalating after success unless a goal can stop this attempt.

---

### TC-21 — Binary goal

**Destination:** The goal was met — stop this attempt. A goal is a write that makes further pursuit of *this* campaign impossible.

**Prerequisites:** TC-0 → TC-20

**Construction:** A binary completion pointed at a real write (booked / answered / clicked).

**Forces:** Captions are not goals. Feelings are not goals. Time does not know success.

**Concepts expected:** objective / goal (as binary event) · completion table

**Technologies touched:** the write from TC-18 reused as completion

**Syntax families:** the check the tick runs · the stop

**Must produce:** Meet the goal; tick time; no further send for this campaign. If another send leaves, the goal was decoration.

**Must NOT introduce:** a qualify node · teaching-copy campaigns as types · next-campaign sequencing (TC-22)

**Exit capability:** Can point at the write that stopped pursuit and say why a caption could not.

**Next pressure:** One campaign cannot be two objectives. After this goal, the next campaign — or it ends.

---

### TC-22 — Sequence ⊃ campaigns

**Destination:** After this goal, the next campaign, or it ends. Goal as escalation.

**Prerequisites:** TC-0 → TC-21

**Construction:** Sequence contains campaigns. Each campaign has one objective. Distance between campaigns is not a node.

**Forces:** Two objectives stuffed into one campaign are unsayable. 15:43 constructed.

**Concepts expected:** sequence · campaign · objective · escalation (goal as the point)

**Technologies touched:** tables that express the containment

**Syntax families:** advancing `campaign` (or equivalent cursor) when objective is met

**Must produce:** Author two objectives as one campaign (must fail / be unsayable). Then split. The second starts only after the first write.

**Must NOT introduce:** Automations canvas · `call_agent` · live send · caption-nodes

**Exit capability:** Can refuse a qualify node and place the next campaign instead.

**Next pressure:** Pursuit is hardcoded. The operator cannot say “when that was booked, start this other thing” without changing the program.

---

## Epoch 6 — When → do → handle → data

Destination fragment: Automations, write-set, walker as data.

### TC-23 — When → do

**Destination:** When a write of a certain kind happens, do one named thing.

**Prerequisites:** TC-0 → TC-22

**Construction:** Event → action. The first automation. Hardcoded is correct. Hear ≠ start now.

**Forces:** Missions only start because someone enrolled by hand. The house cannot react.

**Concepts expected:** event · trigger · action · Automations vs Agents (as this split)

**Technologies touched:** existing writes + a hardcoded reaction

**Syntax families:** dispatch on a write kind · one action (e.g. enroll or tag)

**Must produce:** Fire the event twice — what must not happen twice. Fire a different write — what must not happen at all.

**Must NOT introduce:** a graph editor · React Flow · write-set as a type (that is TC-24) · a second walker

**Exit capability:** Can say hear ≠ start now without a menu that taught the words.

**Next pressure:** The second step needs what the first produced. Guessing “latest for this firm” selects the wrong person.

---

### TC-24 — Handle / write-set

**Destination:** Two actions in order. The second uses what the first produced. Every write **this run** made. The next step picks.

**Prerequisites:** TC-0 → TC-23

**Construction:** A bundle of writes from this run. Not a field catalog. Not “latest for firm.”

**Forces:** Interleaved runs. Wrong people enrolled.

**Concepts expected:** write-set · handle · run · pick (not guess) · two doors (handle on this canvas vs hear completion elsewhere)

**Technologies touched:** the walk-in-embryo · `{ table, id, contact_id }` or equivalent

**Syntax families:** passing the list · selecting one write

**Must produce:** First action writes three rows; second uses one of them; a fourth is a fail.

**Must NOT introduce:** a field catalog in the client · Hub `lastOutput` as truth · If/Switch (TC-25)

**Exit capability:** Will not guess latest-for-firm. Can name the other door as a different construction.

**Next pressure:** A straight chain cannot mean “only if.”

---

### TC-25 — Fork

**Destination:** Sometimes continue, sometimes take the other path. A condition is not an action.

**Prerequisites:** TC-0 → TC-24

**Construction:** A fork that reads a write (If). Several named paths (Switch) when two sides are a lie.

**Forces:** One next step is a lie.

**Concepts expected:** condition · branch · If · Switch (the many-path node — not `⋯` Switch)

**Technologies touched:** the chain from TC-24

**Syntax families:** reading a write’s field · choosing a path

**Must produce:** Point the If at the wrong grain; predict who walks which path; run it.

**Must NOT introduce:** the graph as editable data (TC-26) · React Flow · kind-switch vocabulary confusion left unnamed

**Exit capability:** Can fork on a write, not on a guess, and say person-row vs run-row.

**Next pressure:** The chain is in the program. The house cannot change it without a deploy.

---

### TC-26 — Chain as data

**Destination:** The operator changes the chain without a code deploy. A walk reads nodes and edges.

**Prerequisites:** TC-0 → TC-25

**Construction:** The chain becomes data. A small walker. Configured-break. Until-node.

**Forces:** House / open-box. Frozen-in-code operations are a deploy.

**Concepts expected:** graph · node · edge · walk · configured-break · until-node

**Technologies touched:** JSON (or equivalent) for the graph · TypeScript/JS for a small walker — **one walker**

**Syntax families:** the data shape · visiting nodes · stopping

**Must produce:** Add a node by changing data, not code. Unconfigured node fails and does not continue. Until-node: downstream has not run.

**Must NOT introduce:** React Flow · plate interiors · a second walker · copying `workflowWalk.ts`

**Exit capability:** Can add a step without shipping a function, and say the walk reads data.

**Next pressure:** Editing JSON is not operating the house.

---

## Epoch 7 — Authoring faces

Destination fragment: click = configure; then a canvas; then Agents as a different face.

### TC-27 — Click = configure

**Destination:** An operator desk edits the graph as a list of steps. Click a step to configure it. The walk reads what the interior stored.

**Prerequisites:** TC-0 → TC-26

**Construction:** Selected node. Interior writes back into graph data. List editor.

**Forces:** Raw JSON is not the house.

**Concepts expected:** configure · selected node · interior · list editor (not canvas)

**Technologies touched:** the React desk already owned

**Syntax families:** selection state · a form that writes node data

**Must produce:** `configured === false` fails the walk; configuring it lets the walk continue.

**Must NOT introduce:** React Flow · Ant Design as a requirement · Agents canvas

**Exit capability:** Can say: the canvas (later) is not the walk; configure writes data.

**Next pressure:** A list cannot show a fork. Topology is lying or invisible.

---

### TC-28 — Spatial canvas

**Destination:** The same graph as a drawing, because a list cannot represent branching.

**Prerequisites:** TC-0 → TC-27

**Construction:** Nodes, edges, handles as a drawing of the **same** data. React Flow arrives because the list failed — somebody else’s construction for this class of problem.

**Forces:** Switch paths are invisible in a list. The drawing and the walk must not disagree.

**Concepts expected:** canvas · handle (UI) vs handle (write-set) — keep the words unmixed · library (as someone else’s construction)

**Technologies touched:** React Flow (or equivalent) · existing walker

**Syntax families:** mapping graph data to the library · not a second graph

**Must produce:** Draw a path the walk cannot take; the learner says which construction is lying.

**Must NOT introduce:** a second walker · plate-interior encyclopedia · Ant as mandatory

**Exit capability:** Treats the library as an editor for a graph they already had — not as “today we learn React Flow.”

**Next pressure:** A mission that starts now is not a fake trigger on this canvas.

---

### TC-29 — Agents as a different authoring

**Destination:** Sequence ⊃ campaigns ⊃ channels, authored on a different face. Enroll now. Automations may assign an existing sequence; they do not author a new agent.

**Prerequisites:** TC-0 → TC-28 and TC-22 (sequence already exists as machine)

**Construction:** A second authoring face. Header enroll. Not Publish.

**Forces:** Stuffing “start now” into an event-graph lies.

**Concepts expected:** Agents vs Automations · enroll now · `⋯` Switch (kind) vs Switch (node)

**Technologies touched:** existing sequence tables + a desk

**Syntax families:** enroll without an event · assign-from-automation remains the other door

**Must produce:** Enroll from the header with no event. Then fire an automation that assigns the same sequence. Name the door twice.

**Must NOT introduce:** live send · OTP · Launch/Run/Test as one button (TC-32)

**Exit capability:** Will not mix the words. Will not author a new agent inside Automations.

**Next pressure:** Anyone who can open the page can edit any firm. Run and Launch feel like the same button.

---

## Epoch 8 — Tenancy, gates, ignition kinds

### TC-30 — Firm boundary

**Destination:** Two firms, two books, two operators who must not see each other.

**Prerequisites:** TC-0 → TC-29

**Construction:** Identity. Session. Firm on every ask. OTP or access link when a bookmarkable secret URL is the wrong shape for a returning consultant.

**Forces:** A contact token is the wrong tool for a consultant who returns tomorrow.

**Concepts expected:** user · session · firm · authentication · tenancy

**Technologies touched:** auth tables · cookie/session · OTP mailer only as required

**Syntax families:** session check on ask · refusal across firms

**Must produce:** Log in as firm A; ask for firm B’s person; server refuses; desk does not paint a stand-in.

**Must NOT introduce:** platform-admin view-as as the first model · dual tenancy leftover as “how identity works”

**Exit capability:** Treats auth as a ledger boundary, not as a login screen tutorial.

**Next pressure:** A send that can leave the building has no gate.

---

### TC-31 — May send

**Destination:** A send that can leave the building, and a way to forbid it. “We can send” ≠ “we may send.”

**Prerequisites:** TC-0 → TC-30

**Construction:** Consent. Halt (this person / this book). Send mode. Live ports **last**.

**Forces:** Dry-run rows are no longer honest once a provider exists.

**Concepts expected:** consent · halt · silence · live vs dry-run

**Technologies touched:** send provider only after gates exist · consent/halt tables

**Syntax families:** the gate on the send path · halt blocking **new** enrollments

**Must produce:** Opt out; tick; no live send. Halt the book; enroll; no new attempt.

**Must NOT introduce:** warmup pools · Meta · escrow

**Exit capability:** Can forbid a send and show the row that forbids it.

**Next pressure:** One button that “does the automation” conflates specimen writes, a walk, and a subscription.

---

### TC-32 — Three ignitions

**Destination:** Test data on the trigger. Run walks now. Launch arms and must not walk.

**Prerequisites:** TC-0 → TC-31

**Construction:** Three ignitions. Event-test contract as **tables**, not a client fixture.

**Forces:** Launch that walks ruins the world. Run without writes is a guess.

**Concepts expected:** Test · Run · Launch · until-node (as ignition) · event-test contract

**Technologies touched:** `event_write_set` / `event_test_data` or Construction’s equivalent tables

**Syntax families:** activate without walk · walk with payload writes · run-to-here

**Must produce:** Launch; do not Run; nothing walks until a real event. Run-to-here; downstream has not run.

**Must NOT introduce:** a Test *tab* (destination law: test data lives on the trigger) · a second walker

**Exit capability:** Can refuse a single “do the automation” button and name which ignition they used.

**Next pressure:** The walk can only use what the trigger held, cannot fetch, cannot judge from tables, cannot pause. Global listen over-fires.

---

## Epoch 9 — Remaining mechanisms and audits

### TC-33 — Get, Rule, Wait

**Destination:** Fetch existing records; evaluate a rule whose rows live in a table; wait for time or a person.

**Prerequisites:** TC-0 → TC-32

**Construction:** Get as a query that becomes writes. Rule as data, not an `if` in the walker. Wait as park / resume.

**Forces:** Hardcoded judgment is a deploy. The walk cannot pause. The trigger does not hold everything.

**Concepts expected:** Get · Rule · Wait · park / resume · occupancy (if approval)

**Technologies touched:** walker extension (same walker) · rule table · wait row

**Syntax families:** Get → writes on the handle · rule rows · wait then continue

**Must produce:** Change a rule row, not a function; next walk judges differently. Approve a wait; only then downstream runs.

**Must NOT introduce:** a second walker · a SPA rule catalog

**Exit capability:** Can tell fetch / judge / pause apart, and keep all three out of one magic node.

**Next pressure:** “Any form” over-fires. This form / this objective.

**Split flag:** If Get, Rule, and Wait are three unfelt constructions in validated TC-32 work, split before generating.

---

### TC-34 — Local vs Global

**Destination:** This form / this objective / this campaign — not every event of that kind.

**Prerequisites:** TC-0 → TC-33

**Construction:** Grain. Local axis. Some events have no Local (one-time audit). Still an event.

**Forces:** Global listen over-fires.

**Concepts expected:** Global · Local · grain

**Technologies touched:** trigger grain on the existing event dispatch

**Syntax families:** local ids on the write and on the trigger

**Must produce:** Submit form B; automation for form A does not walk. Submit form A; it does.

**Must NOT introduce:** “any row changed” as a trigger kind

**Exit capability:** Can constrain a listen without being told “add a Local radio.”

**Next pressure:** The house still cannot change evaluation, bind, and provision without shipping the walker. Convergence and transfer have not been audited.

---

### TC-35 — House, convergence, transfer

**Destination:** The house changes evaluation, binding, sending, and provision without shipping the walker again. Then two audits.

**Prerequisites:** TC-0 → TC-34

**Construction:** Operator modules as panes and controls on states already named. Evaluation packs as tables. Bind per firm / default / override. Then: convergence audit against [`DESTINATION.md`](./DESTINATION.md); transfer audit (a product not in Tower).

**Forces:** Pursuit and eligibility still half-program. Reproduction of Tower is not graduation.

**Concepts expected:** house · pane vs control · bind · default / override · convergence · transfer

**Technologies touched:** tables + operator desk already owned

**Syntax families:** whatever the house modules actually require — no new framework

**Must produce:** Point at a module: control or pane? Which table? Then: foreign intention; name information / state / relationships / behavior / boundaries / mechanisms **before** writing; construct it.

**Must NOT introduce:** Hub as the finish · inventing unspecified stores · treating stand-ins as the system

**Exit capability:** Determines what needs to exist. The agent is no longer the source of the construction. Transfer works without Tower as a template.

**Next pressure:** None in this map. Remaining gaps: two buckets only (specified-and-clear vs specified-but-not-clear).

---

## Amendment log

| Version | Date | Change |
|---|---|---|
| 1 | 2026-10-04 | Initial map. TC-0–35. Split flags on TC-15 and TC-33. |
| 1 | 2026-10-05 | Chapter path: `book/epoch-<k>/tc-<n>.md` (epoch folder, not cycle-number folder). No contract change. |
