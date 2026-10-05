# JOURNEY — table of contents and cycle contracts

**Version:** 2  
**Mutability:** Versioned. Split or merge with a version stamp and a reason. Do not silently rewrite.  
**Not this file:** lessons, exercises, finished code, explanations of functions / React / SQL / Tailwind.

Each heading below is a **contract** for a future chapter. The agent generating TC-N reads this contract, [`RULES.md`](./RULES.md), [`MASTERY.md`](./MASTERY.md), [`DESTINATION.md`](./DESTINATION.md), [`TECHNOLOGY-MAP.md`](./TECHNOLOGY-MAP.md), and the learner’s validated TC-(N−1) work.

**Advance:** never because the next heading exists. Advance when that cycle’s **Exit capability** is met and **Next pressure** is visible.

**Chapter path:** `book/epoch-<k>/tc-<n>.md` where `<k>` is the epoch, not the cycle number. Epoch 0 contains TC-0–4. `constructions/` and `my-work/` stay `tc-<n>`.

**Stable already generated:** TC-0, TC-1, and TC-2. Do not regenerate them. TC-2 remains the CSS **rudiment**. Layout mechanisms are TC-3. Tailwind is TC-4.

**Cycle count is not a product.** v1 froze at 36 because the map stopped at the house. v2 continues until production competence. Split if a cycle smuggles two constructions. Merge if the split is ceremonial.

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
| **Syntax families** | Fluency targets for this cycle only. Continuing spines (TS / JS / SQL / tests / security) may add more when the construction repeats a shape — see TECHNOLOGY-MAP. |
| **Production bridge** | The production technology this cycle earns — or **not this cycle**. Encountering the mechanism is not fluency in the tool. |
| **Bridge proof** | How the learner shows the tool is not magic (point back at the mechanism). Omit if there is no bridge yet. |
| **Must produce** | Observable outcome. |
| **Must NOT introduce** | Hard boundary. Violating this is a RULES break. |
| **Exit capability** | The mastery bar (see MASTERY). |
| **Next pressure** | The limitation that makes the following cycle necessary. |

**Law:** rudiment → mechanism → production bridge → production fluency. See [`RULES.md`](./RULES.md) §2b and [`TECHNOLOGY-MAP.md`](./TECHNOLOGY-MAP.md).

---

## Continuing spines (not extra chapters)

These are **not** “TC-10B — today’s lesson is generics.” A later chapter forces them when the construction repeats a shape that needs them. Generators read [`TECHNOLOGY-MAP.md`](./TECHNOLOGY-MAP.md) spines and attach here.

- **JavaScript** from first script (TC-5): modules, closures, arrays/objects, destructuring, spread, higher-order functions, `Promise` / `async`/`await`, errors — when the construction needs them, not because a later Tower mechanism would like them assumed.
- **TypeScript** arrives at TC-12. It does not finish there. Unions, narrowing, discriminated unions, generics, utility types, `unknown` / `never`, function types, `Promise<T>`, modules, type-only imports, inference, strict nullability — each when a construction gives them a reason.
- **SQL** from the first table (TC-19). Not done at `SELECT`. Schema, constraints, transactions, indexes, `EXPLAIN`, N+1, pools, migration safety, useful isolation.
- **Tests** from TC-10. Invariant → encoded test → break the impl → the test catches you. Then RTL, then MSW, then Playwright, each when the thing being protected has that grain.
- **DevTools** from TC-0. Standing practice, not a chapter.
- **Security** attached to the construction that creates the threat. Not a security week.

---

## Epoch 0 — Appearance

Destination fragment: a browser page whose look is a construction, then the production vocabulary for that construction.

### TC-0 — Smallest causal chain

**Destination:** The smallest causal chain from something you author to something a browser produces.

**Prerequisites:** None. Operating grain: [`../TC-0-OPERATION.md`](../TC-0-OPERATION.md).

**Construction:** An empty HTML file, opened from disk, producing a blank page.

**Forces:** Nothing authored is being interpreted into a page. Later Tower is still this chain under machinery.

**Concepts expected:** source · HTML file (as a *kind*) · interpret / render · page · extension (as kind-signal) · refresh / reload

**Technologies touched:** HTML (file kind only — no tags)

**Syntax families:** empty `*.html` file

**Production bridge:** Not this cycle.

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

**Production bridge:** Not this cycle.

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

**Production bridge:** **Not this cycle.** This is the rudiment: a rule is a second construction attached to an occupant. Tailwind arrives at TC-4, after layout mechanisms have been constructed. Skipping the rudiment to “just use Tailwind” is the bootcamp failure. Staying on raw selectors forever after TC-4 is the v1 failure.

**Must produce:** The same occupant, different place or look, caused by rules — not by changing the words inside the element.

**Must NOT introduce:** a design system · Tailwind · a component library · JS · responsive frameworks · box-model/flex/grid as a course (that is TC-3)

**Exit capability:** Change one rule; predict what moves; do it. Can say: appearance is a second construction attached to the first.

**Next pressure:** One property on one occupant is not layout. Box, flex, grid, cascade, and responsive constraints have not been constructed. Tailwind would still be vocabulary without a language.

---

### TC-3 — Layout

**Destination:** Several occupants, arranged. The learner can cause a layout from CSS mechanisms, not from guessing properties.

**Prerequisites:** TC-0 → TC-2

**Construction:** Repeated elements in a tree, then rules that control **box, flow, alignment, and wrapping**. Sequence in the source is no longer the only arrangement.

**Forces:** A single occupant cannot be a desk. A color rule cannot be a page. “Several things that just sit there” is not yet layout.

**Concepts expected:** tree · parent / child · sibling · box model · margin / padding / border · flex · grid · positioning · cascade / specificity (as this construction needs) · responsive constraint / breakpoint (as a CSS mechanism, not a framework)

**Technologies touched:** HTML · CSS

**Syntax families:** repeated elements · `display: flex` / `grid` as required · box properties · a media query if the construction needs two widths · cascade when two rules compete

**Production bridge:** Not yet. Build the layout **once in CSS**. The rebuild in Tailwind is TC-4.

**Must produce:** Several distinguishable occupants whose arrangement is caused by CSS layout, not by empty spacer elements. Reorder in source *or* change the layout rule; predict which.

**Must NOT introduce:** Tailwind · a component library · JS · a design-token system · “just use Bootstrap”

**Exit capability:** Can construct a row, a stack, and a wrapping grid from CSS, and say which mechanism did the work. Can diagnose a broken layout by naming the box/flex/grid/cascade fact that is false.

**Next pressure:** Production UI is not lovingly hand-authored selectors after the mechanisms are understood. The vocabulary for these same mechanisms exists.

---

### TC-4 — Production appearance

**Destination:** The same layout, in the production vocabulary. The learner knows what the tool is buying.

**Prerequisites:** TC-0 → TC-3

**Construction:** Recreate the TC-3 layout with **Tailwind CSS 4** (current stable). Each important utility maps back to a CSS mechanism already constructed.

**Forces:** Remaining on raw CSS after the mechanisms are understood is refusing the abstraction. Jumping to Tailwind before TC-3 is the bootcamp failure.

**Concepts expected:** utility class · design constraint in class names · `@layer` / cascade as Tailwind uses it · breakpoint prefixes as the same responsive constraints

**Technologies touched:** Tailwind CSS 4 · CSS (drop-through) · HTML

**Syntax families:** utility classes required by the reconstructed layout (`flex`, spacing, sizing, breakpoints as needed) · a custom CSS drop-through when a utility is insufficient

**Production bridge:** **Tailwind CSS 4.**

**Bridge proof:** Point from each important utility back to the CSS mechanism it manipulates. Drop to CSS for one thing Tailwind should not be forced to express. Say what Tailwind is buying (vocabulary, constraint, speed) and what it is not (a different layout engine).

**Must produce:** The TC-3 layout, rebuilt. Same arrangement. Learner can produce the utilities without guessing from a cheatsheet as the method.

**Must NOT introduce:** a component library as the way to avoid layout · React · “never write CSS again” as a law · copying Tower’s stylesheet

**Exit capability:** Can construct the layout in Tailwind without guessing classes, and can drop to CSS when the utility abstraction is insufficient.

**Next pressure:** Occupants only sit there. One of them should do something.

---

## Epoch 1 — Information

Destination fragment: a list, a selection, a detail — the consultant board in primitive form. Appearance stays on the Tailwind/CSS already earned.

### TC-5 — Behavior

**Destination:** One occupant responds. A click (or equivalent) causes something to run.

**Prerequisites:** TC-0 → TC-4

**Construction:** A listen and a response attached to one occupant.

**Forces:** A desk that cannot act is a picture.

**Concepts expected:** event · listener · handler · script

**Technologies touched:** HTML · CSS/Tailwind as already owned · JavaScript (first arrival)

**Syntax families:** attaching a listener · a function body that runs on the event (minimal)

**Production bridge:** Not this cycle. The production form of “behavior on a control” is a later component. First: listen + run.

**Must produce:** An occupant that does something visible or inspectable when the event happens. Remove the listener: the thing still exists; the behavior is gone.

**Must NOT introduce:** frameworks · state as a named curriculum object yet · `addEventListener` encyclopedia · TypeScript · React

**Exit capability:** Can add behavior to a *different* occupant than the chapter used, and explain listen + run.

**Next pressure:** The click always does the same thing. Behavior cannot depend on information.

---

### TC-6 — Behavior reads information

**Destination:** The response depends on a value, not only on the fact of the click.

**Prerequisites:** TC-0 → TC-5

**Construction:** A value the handler reads. Change the value, not the listener; the outcome changes.

**Forces:** Fixed behavior cannot be a desk. Information is not the page.

**Concepts expected:** value · variable · read vs write (ordinary sense)

**Technologies touched:** JavaScript · HTML

**Syntax families:** variable declaration and assignment · reading a value in a handler

**Production bridge:** Not this cycle.

**Must produce:** Two different outcomes from the same listener, caused only by different information.

**Must NOT introduce:** React · `useState` · TypeScript · persistence

**Exit capability:** Change the value, not the listener, and predict what on the page changes and what does not.

**Next pressure:** The value can change and the page can still show the old world.

---

### TC-7 — State

**Destination:** The page is built from the current information. When the information changes, appearance changes.

**Prerequisites:** TC-0 → TC-6

**Construction:** A relationship: information → appearance. After the phenomenon is understood, name it **state**.

**Forces:** A value that nothing re-reads is a dead fact. The page lies.

**Concepts expected:** state · current value · the page as a view of information

**Technologies touched:** JavaScript · HTML · CSS/Tailwind as needed

**Syntax families:** updating a value · causing the page to reflect it (still manual is allowed — that pain is the renderer)

**Production bridge:** Not this cycle. `useState` is the production representation of *this* relationship, after a renderer exists (TC-13).

**Must produce:** Change information; the page shows the new world without editing the HTML by hand as if it were a second book.

**Must NOT introduce:** React · `useState` · Redux · persistence

**Exit capability:** Can name this relationship “state” and point at it. Can name one piece of information whose change should *not* affect the page, and why.

**Next pressure:** One value cannot be a book. We need many occupants and a selection.

---

### TC-8 — List and selection

**Destination:** A list of people (or equivalent). Select one. See that one.

**Prerequisites:** TC-0 → TC-7

**Construction:** A collection. An identity for each occupant. Selected identity. Detail is a function of selection.

**Forces:** A single value is not a book. The consultant board is already this construction.

**Concepts expected:** collection / array · identity · selection · index vs identity

**Technologies touched:** JavaScript · HTML · CSS/Tailwind as needed

**Syntax families:** arrays · reading an item by identity · rendering a list (still by hand if needed) · **Spine (JS):** `map` / `filter` if the construction repeats a transform

**Production bridge:** Not this cycle.

**Must produce:** Add a person; they appear in the list; they can be selected; detail matches selection.

**Must NOT introduce:** a database · React · hardcoded “Sarah Jenkins” as the product · a server

**Exit capability:** Add a person without being given the next line of code. Can say what had to exist that did not exist for “one name on a page.”

**Next pressure:** The page is a pile of repeated constructions. Copy-paste drifts.

---

## Epoch 2 — Named constructions

Destination fragment: reuse, software that verifies software, named shapes, a renderer, then production UI systems.

### TC-9 — Named construction

**Destination:** Repeated structures can be expressed once and reused.

**Prerequisites:** TC-0 → TC-8

**Construction:** Take a repeated construction and give it a reusable form.

**Forces:** Repetition / drift in the previous system. Change in one place, forget the other: the desk lies.

**Concepts expected:** function · parameters · arguments · return value · scope

**Technologies touched:** JavaScript

**Syntax families:** function declarations · function calls · parameters · return · **Spine (JS):** higher-order use if a function is passed, not as a tour

**Production bridge:** Not this cycle.

**Must produce:** One definition used at least twice. Change the definition; every use changes. If many page-places must still be edited by hand, the name failed.

**Must NOT introduce:** React · components · TypeScript · modules-as-a-course · arrow-function encyclopedia beyond what the construction uses · a test runner (that is TC-10)

**Exit capability:** Can recognize a repeated construction and extract it **without** being instructed to “make a function.”

**Next pressure:** “I know what this should do” is still a thought. Changing the function later is unprotected. Also: reusable construction still permits information of unintended shapes. Functions that print text still leave *page structure* duplicated.

---

### TC-10 — Software that verifies software

**Destination:** An invariant the learner can state becomes a test that catches a broken implementation.

**Prerequisites:** TC-0 → TC-9

**Construction:** State what a function must keep true. Encode that as a test. Break the implementation. The test fails. Restore it. **Vitest** arrives because the construction is now “the program checks the program,” and Vitest is Vite-native later.

**Forces:** Predict → Explain → Transform is how *the learner* knows. It is not how *the software* knows. A product engineer who can build a walker and cannot change it because nothing verifies it is not finished.

**Concepts expected:** invariant · test · assertion · fail · runner · regression

**Technologies touched:** **Vitest** (current stable) · JavaScript

**Syntax families:** a test file · `expect` / equivalent assertions on the TC-9 function · a npm/pnpm script that runs the runner

**Production bridge:** **Vitest.** The rudiment is “I know what this should do.” The mechanism is an encoded invariant. The tool is the runner.

**Bridge proof:** Break the implementation on purpose; the test catches it. Change a name the invariant does not care about; the test stays quiet. Say what the test is *not* (a second copy of the implementation).

**Must produce:** At least one test that would have caught a real lie in the list/selection or the named construction. The learner runs it; it is not a screenshot of a green tick copied from a tutorial.

**Must NOT introduce:** React Testing Library · Playwright · mocking the world · coverage-as-the-goal · testing implementation internals of a future component

**Exit capability:** Can state an invariant, encode it, break the impl, and watch the test catch them — without being told “write a unit test” as the intention.

**Next pressure:** Functions that compute text do not stop the *markup* from drifting.

---

### TC-11 — Component

**Destination:** The same page-construction (row, button, region) appears in two places without forking.

**Prerequisites:** TC-0 → TC-10

**Construction:** A construction that is itself a thing-on-the-page — composed, reused.

**Forces:** Functions that compute text do not stop the markup from drifting. A desk is composed. Chrome is reusable; the record is not.

**Concepts expected:** component · composition · props / inputs to a page-construction (plain sense)

**Technologies touched:** JavaScript · HTML · CSS/Tailwind as already owned

**Syntax families:** functions that return / build page structure · passing values into them

**Production bridge:** Not yet. React’s function component is the production representation of *this*, at TC-13. First: page-construction as a reusable form.

**Must produce:** A second list (e.g. meetings) from the same row construction. Shared chrome. Different records. Existing Vitest tests still pass or are extended for the extract.

**Must NOT introduce:** React · JSX · a component library · TypeScript

**Exit capability:** Build a second list from the same row construction and say what must stay shared and what must not.

**Next pressure:** Information of the wrong shape still silently becomes a lying row.

---

### TC-12 — Named shapes

**Destination:** Information cannot silently be the wrong shape. TypeScript **arrives**. It does not finish.

**Prerequisites:** TC-0 → TC-11

**Construction:** A named shape. Checking at the moment of construction. A person without identity, or a selected id not in the list, is refused.

**Forces:** Silent wrong shape makes the desk lie. The learner has already been bitten or can predict the bite.

**Concepts expected:** type · interface · annotation · compile-time / check-time vs run-time (only as this construction needs) · strictness

**Technologies touched:** **TypeScript strict mode** (first arrival) · JavaScript as it already exists

**Syntax families:** `type` / `interface` for the person and the selection · annotating the values the desk reads · **Spine (TS):** strict nullability the moment a value may be missing

**Production bridge:** **TypeScript strict.** The rudiment is “this value must be a person.” The mechanism is a named constraint checked before runtime. Fluency **continues** for the rest of the book — not as “today’s lesson is generics,” but when a construction repeats a relationship across shapes.

**Bridge proof:** A broken person is refused. An `any` escape that makes the desk lie is a fail, not a convenience.

**Must produce:** A broken person is refused before the page lies. `tsc --strict` (or the project’s strict check) is part of how the learner knows.

**Must NOT introduce:** React · a type-system course · generics encyclopedia · `any` as the escape hatch of the chapter · Zod (runtime validation is later, when untrusted input exists)

**Exit capability:** Given a broken person, refuse it and say which constraint failed — without being told “add a type.” Can say: these types disappear at runtime.

**Next pressure:** The page is still patched by hand when information changes. Miss a node; the desk lies. Types that vanish at runtime cannot check a JSON string from outside.

---

### TC-13 — Renderer

**Destination:** The page stays true when information changes, without the learner rewriting the tree by hand.

**Prerequisites:** TC-0 → TC-12

**Construction:** A renderer that rebuilds appearance from information. **React 19** (current stable) arrives because that is the mechanism. **Vite 8+** and JSX arrive as the representation that renderer needs. **pnpm** (after npm fundamentals if needed) is the repo tool. Packages arrive as “someone else’s construction.”

**Forces:** Manual DOM / HTML patching misses a node. The desk lies. The tree is too large to patch.

**Concepts expected:** render · React · component (now as React’s representation) · JSX · hook · `useState` as this library’s syntax for state already understood · dependency · package · entry point · HMR · env var as build-time information · DevTools Elements/Console as standing practice

**Technologies touched:** **React 19** · **Vite 8+** · TypeScript · **pnpm** (or npm first, then pnpm as the production repo tool) · Tailwind as already owned

**Syntax families:** a function component · JSX for the list + detail already owned · `useState` · importing a package · `vite` scripts · `.env` as required

**Production bridge:** **React 19 + Vite 8+ + pnpm.** The rudiment was manual render from state. The mechanism is a renderer. The tools are the production representation and the development/build environment.

**Bridge proof:** Remove the renderer (or stop using it for one update); name the bugs that return. Change information; HMR / refresh still shows the truth. Point at `useState` and say it is TC-7’s relationship, not a new idea.

**Must produce:** The TC-8 desk, still true after adds/selects, without hand-patching nodes. A production build the learner can point at.

**Must NOT introduce:** Ant Design · React Router · React Flow · Tower’s `package.json` / React 18 pin · Redux · Next.js · TanStack Query

**Exit capability:** Can say what bugs return if the renderer is removed. Can produce the required React/JSX syntax for this desk. Can start, env-configure, and build with Vite.

**Next pressure:** Effects, composition, and “this library wants a lifetime hook” will be used as decoration unless the next cycle makes them earn their keep.

---

### TC-14 — Composition and effects only where warranted

**Destination:** Compose components. Reach for an effect only when the construction is synchronization with something outside React, not when the learner wanted “run this.”

**Prerequisites:** TC-0 → TC-13

**Construction:** Lift or push state to the place that owns it. Compose. An effect that is actually a sync (document title, a non-React widget), and an effect that is a mistake (derived data, a fetch-as-first-fetch — the latter is later, TC-28).

**Forces:** A pile of `useEffect` is not a desk. Derived information stored as state lies.

**Concepts expected:** composition · lifting state · derived data · effect as synchronization · cleanup

**Technologies touched:** React 19 · TypeScript · Vitest still for non-UI logic

**Syntax families:** props down · callbacks up · `useEffect` only for the warranted case · **Spine (TS):** function types for callbacks

**Production bridge:** Fluency in React, not a new product. The bridge from TC-13 continues.

**Must produce:** One derived value that is *not* state. One effect with a reason. One effect the learner writes and then **deletes** because it was a second source of truth.

**Must NOT introduce:** TanStack Query as “how you fetch” · React Router · a component library yet

**Exit capability:** Can refuse an effect that duplicates render, and say where state should live.

**Next pressure:** Accessible, composable controls (dialog, menu, focus) are a research project if rebuilt from `div`s.

---

### TC-15 — Accessible primitives

**Destination:** Consume a real primitive system. Composition and accessibility are the construction, not a skin.

**Prerequisites:** TC-0 → TC-14

**Construction:** Replace one homegrown control with **shadcn/ui** on **Radix / Base UI-style primitives** (current stable). Keyboard, focus, and unstyled behavior matter.

**Forces:** A `div` that looks like a dialog is not a dialog. Tower already depends on Radix-style primitives. Production UI is composed, not forked blindly.

**Concepts expected:** primitive · accessible name / role · focus trap · slot / `asChild` (as this library uses it) · unstyled behavior vs skin

**Technologies touched:** **shadcn/ui** · **Radix or Base UI primitives** · React · Tailwind as already owned

**Syntax families:** composing a primitive · wiring the open state the learner already understands

**Production bridge:** **shadcn/ui + Radix/Base UI primitives.**

**Bridge proof:** Operate the control from the keyboard. Remove the primitive and say what accessibility/behavior disappeared that CSS cannot fake. Point at the skin (Tailwind) vs the behavior (primitive).

**Must produce:** One real control (dialog, dropdown, or tabs) used by the desk, not a gallery.

**Must NOT introduce:** Ant Design yet (that is TC-16 — a different consumption problem) · copying Tower’s Ant tree

**Exit capability:** Can compose a primitive without forking it, and can say what the primitive owns vs what the skin owns.

**Next pressure:** A product that already standardized on a vendor library is a different literacy: consume, do not restyle from zero.

---

### TC-16 — Vendor system literacy

**Destination:** Consume **Ant Design** as a real component system. Literacy, not a rewrite of the desk into Ant for its own sake.

**Prerequisites:** TC-0 → TC-15

**Construction:** One region of the desk uses Ant because that is how a large existing system is consumed. Configure; do not fork the library. Contrast with the primitive already owned.

**Forces:** Tower’s product face uses Ant. A product engineer who can only assemble shadcn will bounce off an existing Ant tree. This is literacy of consumption.

**Concepts expected:** design system · token / theme as the vendor exposes it · composition inside a vendor component · ConfigProvider (as needed)

**Technologies touched:** **Ant Design** (current stable, not “whatever Tower pinned”) · React

**Syntax families:** the Ant components the region actually needs — not the catalog

**Production bridge:** **Ant Design literacy.**

**Bridge proof:** Same intention, two representations (primitive vs Ant). Say what each owns. Do not restyle Ant into shadcn as a flex.

**Must produce:** One working region in Ant. The rest of the desk may stay on primitives. Notes name the consumption difference.

**Must NOT introduce:** Ant as the only legal UI forever · rewriting the whole book in Ant · React Flow

**Exit capability:** Can consume a vendor system without forking it blindly, and can choose primitive vs vendor for a reason.

**Next pressure:** Tests still only cover functions. The rendered desk can lie while Vitest is green.

---

### TC-17 — Rendered behavior as tests

**Destination:** Test what a user can do with the rendered UI, not the component’s internals.

**Prerequisites:** TC-0 → TC-16

**Construction:** **React Testing Library** on the list/selection desk. Query by role and text. Interact. Assert the page the user would see.

**Forces:** A green unit test on a helper does not mean the row is on the screen. Implementation-detail tests lock the wrong construction.

**Concepts expected:** user-centric query · role · user event · render · assertion on the document

**Technologies touched:** **React Testing Library** · Vitest as the runner · React

**Syntax families:** `render` · `screen.getByRole` / text queries · a user event · **no** tests that poke state internals

**Production bridge:** **React Testing Library.**

**Bridge proof:** Break a visible label; the test fails. Refactor internals without changing behavior; the test stays quiet.

**Must produce:** Tests for select-a-person and add-a-person as the user experiences them.

**Must NOT introduce:** Playwright (real browsers, later) · MSW (network, later) · snapshot-everything

**Exit capability:** Can write a test that would fail if the desk stopped selecting, without importing the component’s state variable.

**Next pressure:** The book lives in the page. Refresh, a second window, and tomorrow do not share it.

---

## Epoch 3 — A book that outlives the page

Destination fragment: data-in-tables. SQL as a real language. Then a typed abstraction that does not hide SQL.

### TC-18 — Persistence

**Destination:** Change a name, reload, the change is still there.

**Prerequisites:** TC-0 → TC-17

**Construction:** Durable information in a second place the page is not. First: a file (or equivalent) the page reads.

**Forces:** State in the page dies with the page. Two windows disagree.

**Concepts expected:** persistence · source of truth · serialize / deserialize (if the file is text)

**Technologies touched:** whatever writes/reads the durable file (still local is correct) · TypeScript · **Spine (TS):** types for the serialized shape; they still vanish at runtime

**Syntax families:** read/write of the durable representation already in play (JSON if that is the file)

**Production bridge:** Not yet. Postgres is the production ledger after a blob fails (TC-19+).

**Must produce:** Kill the page; open again; the change survived; the learner can say *where*.

**Must NOT introduce:** Postgres · HTTP · a server · 24 migrations · “so the module isn’t empty” painted rows

**Exit capability:** Can point at the second place and say the page is a view of it — or it is a lie.

**Next pressure:** A blob cannot be asked a precise question. Many people, one fact each, no identity.

---

### TC-19 — Identity, rows, relations

**Destination:** Find one person among many. Attach a second fact to them.

**Prerequisites:** TC-0 → TC-18

**Construction:** Identity. Rows. A table. A relation (this fact belongs to this person). **PostgreSQL** arrives because the blob has failed.

**Forces:** A file-blob cannot be queried without reading everything and hoping.

**Concepts expected:** identity · row · column · table · relation · foreign key · SQL as the language of the table

**Technologies touched:** **PostgreSQL** · SQL · the desk from TC-13

**Syntax families:** `CREATE TABLE` · `INSERT` · `SELECT` by id · a second table keyed to the first — only as forced

**Production bridge:** **PostgreSQL + SQL** as the ledger. Not an ORM. Drizzle is TC-24.

**Must produce:** Delete a person; related facts are gone or uninterpretable; the learner can say which.

**Must NOT introduce:** a second server · RLS · ~90 routes · dual tenancy · an ORM · Drizzle

**Exit capability:** Can explain why a table is a construction (same shape, many occupants, identity, relations) without being told “we’re learning SQL.”

**Next pressure:** The desk is tempted to keep a pretty list in the page so it is not empty.

---

### TC-20 — Query is the only source

**Destination:** The desk shows only what the query returned. An empty module is honest.

**Prerequisites:** TC-0 → TC-19

**Construction:** Query as the only source the desk may read. Seeds so the table is not empty — a reasonable count, not a fake world.

**Forces:** A painted person is a different product (Hub failure mode). Data-in-tables must be lived.

**Concepts expected:** query · seed · empty state (honest)

**Technologies touched:** Postgres · SQL · the React desk · Vitest/RTL as they still protect client logic

**Syntax families:** the select the desk actually runs

**Production bridge:** Fluency of TC-19. Data-in-tables is the law, not a slogan.

**Must produce:** Remove the seed; the desk goes empty. If it does not, a second book was invented.

**Must NOT introduce:** a second catalog in the client · Hub · “just for the screenshot”

**Exit capability:** Will not paint a person to finish a plate. Can say what the query returned and what the desk showed, as the same fact.

**Next pressure:** `SELECT` and `INSERT` are not a database education. Constraints and time will lie without the next SQL constructions. Also: the page opening a local table cannot be a second face later.

---

### TC-21 — Constraints

**Destination:** The ledger refuses impossible facts. Nullability, uniqueness, and foreign keys are constructions, not decorations.

**Prerequisites:** TC-0 → TC-20

**Construction:** Tighten the schema. A duplicate identity fails. A fact without a person fails. A required column cannot be empty.

**Forces:** Application code that “tries to be careful” is not a constraint. Two writers will disagree.

**Concepts expected:** constraint · `UNIQUE` · `NOT NULL` · foreign key · referential action (as needed) · schema as law

**Technologies touched:** PostgreSQL · SQL · **Spine (SQL)** as listed

**Syntax families:** `ALTER` / `CREATE` with constraints · a migration file as the way the schema changes (rudiment of migrations)

**Production bridge:** Migrations as the production way to change a schema. Not a GUI click on a live table as the method.

**Bridge proof:** Insert the illegal row through SQL, not through the UI. The database refuses. The desk never sees a lying row.

**Must produce:** At least three refusals the application did not have to remember.

**Must NOT introduce:** Drizzle · an “ORM will handle this” skip · RLS as the first constraint story

**Exit capability:** Can name which constraint failed from the error, and can add one without being told “add a unique index.”

**Next pressure:** Two writes that must both happen or neither: a check then an insert can leave the world half-done.

---

### TC-22 — Transactions

**Destination:** Several writes become one fact. Partial success is a bug.

**Prerequisites:** TC-0 → TC-21

**Construction:** A transaction. Commit. Rollback. A crash in the middle leaves nothing.

**Forces:** Two inserts without a transaction can orphan a row. Time-path later will need this or the ledger lies.

**Concepts expected:** transaction · atomicity · commit · rollback · isolation (useful grain, not a textbook of levels) · locking as it appears

**Technologies touched:** PostgreSQL · SQL

**Syntax families:** `BEGIN` / `COMMIT` / `ROLLBACK` · the same through the client library in use

**Production bridge:** Not a product name. Fluency in the mechanism production tools wrap.

**Must produce:** Force a failure after the first write; the first write is gone. Repeat with a transaction.

**Must NOT introduce:** distributed transactions · an ORM hiding the transaction

**Exit capability:** Can say what “atomic” meant on *this* ledger, and can hold a transaction around a real two-write intention.

**Next pressure:** Correct and slow. A query that worked at ten rows lies at ten thousand. The planner has not been seen.

---

### TC-23 — Indexes, plans, N+1, pools

**Destination:** The learner can reason about how a query will be answered, and why a loop of queries is a different construction than a join.

**Prerequisites:** TC-0 → TC-22

**Construction:** An index earned by a query. `EXPLAIN`. An N+1 the desk is doing. A connection pool as “we do not open a process per click.”

**Forces:** Full-table scans and chatty loops will not survive a real book. “Works on my laptop” is not a plan.

**Concepts expected:** index · query plan · sequential scan vs index · N+1 · connection pool · migration safety (expand/contract, locking a hot table)

**Technologies touched:** PostgreSQL · SQL · the desk’s query path

**Syntax families:** `CREATE INDEX` · `EXPLAIN` / `EXPLAIN ANALYZE` · rewriting an N+1 into a join or an `IN`

**Production bridge:** Operations literacy for data. Caching/queues later reuse this diagnosis.

**Must produce:** Show a plan before and after an index. Show an N+1 and its repair. Notes say what an index is *not* (a second table of people).

**Must NOT introduce:** Drizzle yet · a cloud performance product as the teacher

**Exit capability:** Can read a simple plan well enough to say why a query is expensive, and can refuse an N+1 they introduced.

**Next pressure:** SQL is fluent enough that a typed, SQL-like abstraction would help — and would be magic if it had arrived at TC-19.

---

### TC-24 — Drizzle

**Destination:** A typed production abstraction over SQL the learner can still see.

**Prerequisites:** TC-0 → TC-23

**Construction:** Recreate the queries already owned with **Drizzle**. Schema in code. Migrations as Drizzle emits or as already practiced. One query written both ways.

**Forces:** String SQL at the boundary of TypeScript repeats the shape by hand. Hiding SQL behind a magic ORM would undo TC-19–23.

**Concepts expected:** schema-in-code · typed query · SQL-like ORM · generated / emitted SQL

**Technologies touched:** **Drizzle ORM** · PostgreSQL · TypeScript · **Spine (TS):** inference from schema; `infer` types as earned

**Syntax families:** Drizzle schema for the existing tables · the select/insert already owned · reading the SQL Drizzle emits

**Production bridge:** **Drizzle.**

**Bridge proof:** Point at the emitted SQL and the query already understood. Drop to SQL for one thing. Say what Drizzle is buying (types, composition) and what it is not (a different database).

**Must produce:** The desk still shows the query. Types refuse a wrong column. The learner can write the SQL Drizzle would emit.

**Must NOT introduce:** a second ORM · “never write SQL again”

**Exit capability:** Can look through Drizzle and see the SQL. Can drop to SQL when the abstraction is the wrong grain.

**Next pressure:** The page opening a local table cannot be a second face, cannot enforce rules as a conversation between programs.

---

## Epoch 4 — Ask / answer

Destination fragment: a process that is not the browser. HTTP. Then production server, validation, client cache, contract, and network tests.

### TC-25 — Another process

**Destination:** A process that is not the browser answers. Raw request/response first. **Node.js** is explicit.

**Prerequisites:** TC-0 → TC-24

**Construction:** A Node HTTP listener. A request. A response. The desk calls it. SQL stays on the server side of this conversation.

**Forces:** Two programs do not share memory. A second face (later) needs a conversation, not a shared variable.

**Concepts expected:** process · runtime · server · request · response · HTTP · status code · JSON as a payload if used · env on the server

**Technologies touched:** **Node.js** · `node:http` or equivalent **raw** server · PostgreSQL · the React desk · `fetch`

**Syntax families:** listen on a port · read a URL / method · write a status and body · `fetch` in the desk · **Spine (JS/TS):** `async`/`await`, `Promise<T>`

**Production bridge:** **Node.js** as the runtime. Hono is TC-26. TanStack Query is TC-28. Do not skip the raw conversation.

**Must produce:** Draw the ask and the answer. Break the answer’s shape; the desk must not invent a person. Kill Node; the desk cannot pretend the book is still in React state.

**Must NOT introduce:** Hono yet as the way to avoid HTTP · 90 routes · auth · OTP · Next.js · putting the book in `useState` as the cache

**Exit capability:** Can describe an API as a conversation between constructions that do not share memory, and write the one ask this desk needs with `fetch` and a raw Node listener.

**Next pressure:** Raw `http` will be rewritten by hand for every route. Middleware, routing, and context are real constructions — then a small framework.

**Security attach:** XSS if the desk renders untrusted strings. Do not skip.

---

### TC-26 — Hono

**Destination:** The same conversation, in the production server framework.

**Prerequisites:** TC-0 → TC-25

**Construction:** Rebuild the raw route on **Hono** running on Node. Routing, context, a little middleware (logging or JSON).

**Forces:** Remaining on raw `http` after the conversation is understood is refusing the abstraction.

**Concepts expected:** router · middleware · context · handler

**Technologies touched:** **Hono + Node** · TypeScript · Postgres/Drizzle as already owned

**Syntax families:** `app.get` / `app.post` as needed · `c.json` / equivalent · one middleware

**Production bridge:** **Hono.**

**Bridge proof:** Point each Hono piece at the raw request/response it wraps. Add a route without inventing a second server.

**Must produce:** The TC-25 desk, now talking to Hono. One middleware the learner can remove to show what it owned.

**Must NOT introduce:** 90 routes · auth as a Hono tutorial · OpenAPI yet · GraphQL

**Exit capability:** Can write a route and a middleware, and can drop to the raw HTTP facts when Hono’s sugar hides a status code.

**Next pressure:** TypeScript types disappeared at the wire. A JSON body of `{ "id": 1 }` is not a person yet.

**Security attach:** injection if SQL is concatenated from the request. Secrets not in the client.

---

### TC-27 — Runtime validation

**Destination:** Untrusted input is parsed. Types at the boundary are inferred from a schema that still exists at runtime.

**Prerequisites:** TC-0 → TC-26

**Construction:** **Zod** at the HTTP (and any other untrusted) boundary. Infer the TypeScript type from the schema. Reject bad payloads before the table sees them.

**Forces:** TC-12’s types are erased. The network does not honor them. `as Person` is a lie.

**Concepts expected:** runtime validation · schema · parse vs infer · `unknown` · type guard

**Technologies touched:** **Zod** · Hono · TypeScript · **Spine (TS):** `unknown`, narrowing, inferred types — **this** is why they exist

**Syntax families:** a Zod schema for the person / write · `parse` / `safeParse` · `z.infer<>`

**Production bridge:** **Zod.**

**Bridge proof:** Send illegal JSON; the route refuses. The inferred type matches the schema. A type assertion that skipped parse is named as a bug.

**Must produce:** Boundary validation on the ask the desk already makes, and on one write.

**Must NOT introduce:** Zod as a replacement for SQL constraints (both exist) · a form library yet

**Exit capability:** Can say why TypeScript was insufficient at the wire, and can infer types from a schema they wrote.

**Next pressure:** `fetch` in the component, plus `useState` for the book, is a second cache that lies. Client state ≠ server state.

---

### TC-28 — Server state

**Destination:** The client owns UI state. The server owns the book. Fetching, cache, invalidation, mutation, synchronization are explicit.

**Prerequisites:** TC-0 → TC-27

**Construction:** **TanStack Query** for the person list and the write. Invalidate after mutation. Do not store the book in `useState` as the source.

**Forces:** `useState` + `useEffect(fetch)` duplicates TC-7 for information the client does not own. Stale list after a write is a lying desk.

**Concepts expected:** server state · cache · invalidation · mutation · stale · query key

**Technologies touched:** **TanStack Query** · React 19 · `fetch` / Hono as already owned

**Syntax families:** `useQuery` · `useMutation` · query keys · invalidation after the write

**Production bridge:** **TanStack Query.**

**Bridge proof:** Point at what is client state (selection, open dialog) vs server state (the rows). Mutate; the list updates because of invalidation, not because a local array was edited as truth.

**Must produce:** The desk’s book comes from the query cache. A write invalidates. Killing the query (or forcing stale) has a visible, understood effect.

**Must NOT introduce:** Redux as the book · OpenAPI yet · MSW yet

**Exit capability:** Can say why a `useState` for the book is a lie, and can invalidate on purpose.

**Next pressure:** The conversation has no published contract. Another program (or a future you) guesses the shape.

---

### TC-29 — Contract

**Destination:** The API is a document another program can consume. HTTP + REST, then **OpenAPI**.

**Prerequisites:** TC-0 → TC-28

**Construction:** Name resources and verbs honestly. Publish an OpenAPI document for the routes already owned. Optionally generate a type or a client — only if it points back at the document.

**Forces:** Informal JSON is a hallway conversation. Two faces and a worker will multiply the hallway.

**Concepts expected:** REST (as this conversation uses it) · resource · contract · OpenAPI

**Technologies touched:** **OpenAPI** · Hono routes already owned · Zod schemas as a source if they already match

**Syntax families:** an OpenAPI description of existing routes · status codes already used, now named in the contract

**Production bridge:** **OpenAPI.**

**Bridge proof:** Change a field in the route and not in the contract (or the reverse); name the lie. The contract is not a blog post.

**Must produce:** A contract file that matches the running API. One intentional mismatch, diagnosed.

**Must NOT introduce:** GraphQL as a detour · a second API style for fashion

**Exit capability:** Can publish and consume a contract for the routes they already run.

**Next pressure:** Tests that hit the real server (or the real net) are a dependency, not a proof.

---

### TC-30 — The network as a test double

**Destination:** Tests do not depend on the live net. The handler *is* the network.

**Prerequisites:** TC-0 → TC-29

**Construction:** **MSW** for the desk tests. A handler returns the person list. A handler returns a failure. RTL + Query still test the user-visible result.

**Forces:** CI that needs a live API, or tests that skip fetch, will not protect the desk.

**Concepts expected:** mock service worker · handler · test dependency vs production dependency

**Technologies touched:** **MSW** · RTL · Vitest · TanStack Query

**Syntax families:** an MSW handler · starting the worker in test setup · one error-path test

**Production bridge:** **MSW.**

**Bridge proof:** Change the handler; the UI test follows. The production server is not running; the test still means something.

**Must produce:** Happy path and one network failure, both as user-visible behavior.

**Must NOT introduce:** Playwright yet · intercepting as the way to avoid writing a contract

**Exit capability:** Can make the network a test construction, and can still say what the real conversation is.

**Next pressure:** One URL, one question. The contact is not the consultant.

---

## Epoch 5 — Two faces, same records

Destination fragment: consultant desk vs contact seat. Routing, token, close-the-loop, then production forms.

### TC-31 — Two questions, one ledger

**Destination:** A second location in the same React app asks the same table a different question.

**Prerequisites:** TC-0 → TC-30

**Construction:** Two views. One ledger. Consultant: who is in the book. Contact: what must I do now. **React Router 7** arrives because one application now has multiple locations/faces — not because two HTML files were insufficient as a thought experiment.

**Forces:** One face cannot be both seats without lying. Two Vite entry HTML files would fork the app.

**Concepts expected:** view · face / desk · ledger · location · route · nested route (if earned)

**Technologies touched:** **React Router 7** · the existing Hono + tables + React desk

**Syntax families:** a router · two routes · links / navigation that are locations, not `if (tab)` pretending to be a second product · loaders only if the construction earns them

**Production bridge:** **React Router 7.**

**Bridge proof:** Each location is a question. The record is not owned by the URL. A field the consultant needs and the contact must not see — constraint lives somewhere the learner can name (query, not CSS `hidden`).

**Must produce:** Two faces. Shared ledger. A secret field that does not leak to the contact face by omission of a query, not by hope.

**Must NOT introduce:** OTP · halt · tokens (TC-32) · Next.js file routing as the first router

**Exit capability:** Can say: a desk is a question; the record is not owned by the question. Can add a location without forking the app.

**Next pressure:** A URL that shows the whole book is the wrong key for the contact.

**Security attach:** CORS if faces and API origins split. Do not “allow *” as architecture.

---

### TC-32 — Token

**Destination:** The contact opens only their seat.

**Prerequisites:** TC-0 → TC-31

**Construction:** A token that means this person, not this program. Server refusal when it does not match.

**Forces:** Knowing the desk URL is not authorization.

**Concepts expected:** token · authorization (as a constraint on which rows a face may ask for)

**Technologies touched:** Hono + whatever issues/checks the token (not OTP)

**Syntax families:** a secret in the path or equivalent · server refusal

**Production bridge:** Not a vendor. The production form is still “constraint on the ask.” Sessions for returning consultants are later (TC-47).

**Must produce:** Steal-the-token thought experiment written: what became possible that must not be.

**Must NOT introduce:** OTP · sessions for consultants · platform admin · OAuth

**Exit capability:** Can explain a token as a constraint, not as “login.”

**Next pressure:** Writes that stay on the contact page are a second book.

---

### TC-33 — One write, two readings

**Destination:** The contact writes (consent, an answer, or a meeting). The consultant’s desk changes.

**Prerequisites:** TC-0 → TC-32

**Construction:** One write. Two readings. First close-the-loop.

**Forces:** Two books. The meeting did not happen if only one face knows.

**Concepts expected:** write · read · meeting booked (as a row, not a feeling)

**Technologies touched:** table + both faces + Query invalidation already owned

**Syntax families:** a POST that inserts the row both faces query · Zod at that boundary

**Production bridge:** Fluency of the ask/answer spine. No new product.

**Must produce:** Book as contact; before reloading consultant, the learner names the row that must exist and the appearance that must change.

**Must NOT introduce:** live email · halt · enrollment · a walker

**Exit capability:** Can close the loop and say which write caused the other desk to change.

**Next pressure:** The contact’s write is becoming a real form. Uncontrolled inputs and ad-hoc `useState` per field will not hold validation, errors, and dirty state.

---

### TC-34 — Production forms

**Destination:** A nontrivial form is owned as a construction. Schema, errors, submit, and field state are not a pile of inputs.

**Prerequisites:** TC-0 → TC-33

**Construction:** The contact write (or consultant equivalent) rebuilt with **React Hook Form + Zod**.

**Forces:** Tower already uses RHF. A meeting / consent / fact form is nontrivial. Reinventing field state is the raw-CSS mistake at a different layer.

**Concepts expected:** field state · default values · validation at submit vs change · error as data

**Technologies touched:** **React Hook Form** · **Zod** · React

**Syntax families:** `useForm` · a resolver wired to the Zod schema already owned · register / controller as required

**Production bridge:** **React Hook Form + Zod.**

**Bridge proof:** The Zod schema is the same law as TC-27, now at the form. Bypass the UI and POST garbage; server still refuses. The form is not the only constraint.

**Must produce:** The close-the-loop write, through RHF, with a visible validation error that is not `alert()`.

**Must NOT introduce:** a form-builder product · live send

**Exit capability:** Can own a real form without reinventing it, and can still point at the server schema as law.

**Next pressure:** We can record a meeting. We cannot pursue someone over time.

---

## Epoch 6 — Time, pursuit, goal

Destination fragment: enrollment, one attempt, one clock at a time, goal as escalation. First a tick; then a durable queue.

### TC-35 — Time as a cause

**Destination:** Something happens later, not only when someone clicks.

**Prerequisites:** TC-0 → TC-34

**Construction:** First: a control that means “time passed.” Then a loop that checks. A worker-in-embryo that asks “is it time?” when no one is looking. `setInterval` / a manual tick is correct.

**Forces:** “Send” (or “remind”) is always now. Pursuit cannot exist.

**Concepts expected:** time · tick · worker / loop · schedule (ordinary sense)

**Technologies touched:** Node process already owned · in-process timer — **not** a production queue

**Syntax families:** a timer or a “tick” action · a record of “due”

**Production bridge:** **Not this cycle.** Feel why an in-process timer is not enough; the bridge is TC-36.

**Must produce:** If the loop stops (process killed, tab closed if they mistakenly put it in the browser), the learner can say what still works and what quietly never happens again.

**Must NOT introduce:** cron products · Redis · BullMQ · three clocks · live SMS · `rule_attempt_criteria`

**Exit capability:** Can treat time as a cause, not as a UI animation. Can name the failure mode of the in-process tick.

**Next pressure:** A Node process that sleeps is not a worker. Restart loses the “later.” Two instances double-send.

---

### TC-36 — Durable work

**Destination:** Work outside a request survives process death, retries, and concurrency with a name.

**Prerequisites:** TC-0 → TC-35

**Construction:** The tick’s job becomes a job on **Redis + BullMQ** (or equivalent durable queue). Retries, backoff, idempotency keys.

**Forces:** The learner has personally experienced why the timer was insufficient.

**Concepts expected:** queue · job · worker process · retry · backoff · idempotency · at-least-once vs exactly-once (as honesty, not magic)

**Technologies touched:** **Redis** · **BullMQ** (or equivalent) · Node

**Syntax families:** enqueue · a worker handler · retry/backoff config · an idempotency key on the send-or-remind row

**Production bridge:** **Redis + BullMQ (or equivalent durable queue).**

**Bridge proof:** Kill the API process; the job still runs (or still exists to run). Retry a handler that failed; it does not double-apply if idempotent. Point at the in-process timer and say what it could not do.

**Must produce:** A due reminder that still fires after restart. A failure that retries. A double-delivery the learner can explain.

**Must NOT introduce:** live Twilio as the job body yet · three clocks · a cloud queue product as the first queue

**Exit capability:** Can explain why the timer was insufficient, and can make a job idempotent on purpose.

**Next pressure:** One later send is not a mission.

---

### TC-37 — Attempt ownership

**Destination:** One person, one attempt, one owning channel; then the next channel when this one failed.

**Prerequisites:** TC-0 → TC-36

**Construction:** Ownership. A ladder. Only one channel owns the flow. Send may still be a *row that means we would have sent*.

**Forces:** Shouting on every medium at once is not Tower’s constraint and lies to the consultant.

**Concepts expected:** attempt · channel · ownership · ladder / escalation (as next owner)

**Technologies touched:** tables for attempt + channel owner · the durable worker already owned

**Syntax families:** the write that changes owner · the job that consults it

**Production bridge:** Domain fluency. Queue already earned.

**Must produce:** Two channels must not send at once. The learner can say what law that would break.

**Must NOT introduce:** live Twilio/Resend · criteria layering · template-cell clock · faceless tick workflows

**Exit capability:** Can keep one owner and move the owner for a reason, without being told “make a state machine.”

**Next pressure:** Time will keep escalating after success unless a goal can stop this attempt.

---

### TC-38 — Binary goal

**Destination:** The goal was met — stop this attempt. A goal is a write that makes further pursuit of *this* campaign impossible.

**Prerequisites:** TC-0 → TC-37

**Construction:** A binary completion pointed at a real write (booked / answered / clicked).

**Forces:** Captions are not goals. Feelings are not goals. Time does not know success.

**Concepts expected:** objective / goal (as binary event) · completion table

**Technologies touched:** the write from TC-33 reused as completion · the worker

**Syntax families:** the check the job runs · the stop

**Production bridge:** None new.

**Must produce:** Meet the goal; fire the job; no further send for this campaign. If another send leaves, the goal was decoration.

**Must NOT introduce:** a qualify node · teaching-copy campaigns as types · next-campaign sequencing (TC-39)

**Exit capability:** Can point at the write that stopped pursuit and say why a caption could not.

**Next pressure:** One campaign cannot be two objectives. After this goal, the next campaign — or it ends.

---

### TC-39 — Sequence ⊃ campaigns

**Destination:** After this goal, the next campaign, or it ends. Goal as escalation.

**Prerequisites:** TC-0 → TC-38

**Construction:** Sequence contains campaigns. Each campaign has one objective. Distance between campaigns is not a node.

**Forces:** Two objectives stuffed into one campaign are unsayable. 15:43 constructed.

**Concepts expected:** sequence · campaign · objective · escalation (goal as the point)

**Technologies touched:** tables that express the containment · **Spine (TS):** if three write types share a relationship, **generics** have a reason — force them here or at TC-41, not as a lecture

**Syntax families:** advancing `campaign` (or equivalent cursor) when objective is met

**Production bridge:** None new.

**Must produce:** Author two objectives as one campaign (must fail / be unsayable). Then split. The second starts only after the first write.

**Must NOT introduce:** Automations canvas · `call_agent` · live send · caption-nodes

**Exit capability:** Can refuse a qualify node and place the next campaign instead.

**Next pressure:** Pursuit is hardcoded. The operator cannot say “when that was booked, start this other thing” without changing the program.

---

## Epoch 7 — When → do → handle → data

Destination fragment: Automations, write-set, walker as data.

### TC-40 — When → do

**Destination:** When a write of a certain kind happens, do one named thing.

**Prerequisites:** TC-0 → TC-39

**Construction:** Event → action. The first automation. Hardcoded is correct. Hear ≠ start now.

**Forces:** Missions only start because someone enrolled by hand. The house cannot react.

**Concepts expected:** event · trigger · action · Automations vs Agents (as this split)

**Technologies touched:** existing writes + a hardcoded reaction · the queue if the action is “later”

**Syntax families:** dispatch on a write kind · one action (e.g. enroll or tag)

**Production bridge:** None new.

**Must produce:** Fire the event twice — what must not happen twice. Fire a different write — what must not happen at all.

**Must NOT introduce:** a graph editor · React Flow · write-set as a type (TC-41) · a second walker

**Exit capability:** Can say hear ≠ start now without a menu that taught the words.

**Next pressure:** The second step needs what the first produced. Guessing “latest for this firm” selects the wrong person.

---

### TC-41 — Handle / write-set

**Destination:** Two actions in order. The second uses what the first produced. Every write **this run** made. The next step picks.

**Prerequisites:** TC-0 → TC-40

**Construction:** A bundle of writes from this run. Not a field catalog. Not “latest for firm.”

**Forces:** Interleaved runs. Wrong people enrolled.

**Concepts expected:** write-set · handle · run · pick (not guess) · two doors (handle on this canvas vs hear completion elsewhere)

**Technologies touched:** the walk-in-embryo · `{ table, id, contact_id }` or equivalent · **Spine (TS):** discriminated unions and/or generics — the same relationship across write shapes, without destroying their individual shapes

**Syntax families:** passing the list · selecting one write · types that keep the relationship without `any`

**Production bridge:** None as a library. TypeScript fluency is the bridge from “three copy-pasted write types.”

**Bridge proof (TS spine):** Show the generic or discriminated union the construction forced. A `Record<string, any>` that compiles and enrolls the wrong person is a fail.

**Must produce:** First action writes three rows; second uses one of them; a fourth is a fail.

**Must NOT introduce:** a field catalog in the client · Hub `lastOutput` as truth · If/Switch (TC-42)

**Exit capability:** Will not guess latest-for-firm. Can name the other door as a different construction. Can type the write-set without erasing shapes.

**Next pressure:** A straight chain cannot mean “only if.”

---

### TC-42 — Fork

**Destination:** Sometimes continue, sometimes take the other path. A condition is not an action.

**Prerequisites:** TC-0 → TC-41

**Construction:** A fork that reads a write (If). Several named paths (Switch) when two sides are a lie.

**Forces:** One next step is a lie.

**Concepts expected:** condition · branch · If · Switch (the many-path node — not `⋯` Switch)

**Technologies touched:** the chain from TC-41 · Vitest on the fork (invariants on which path is taken)

**Syntax families:** reading a write’s field · choosing a path

**Production bridge:** Tests on the walker-in-embryo. Not a library.

**Must produce:** Point the If at the wrong grain; predict who walks which path; run it. A test encodes that prediction.

**Must NOT introduce:** the graph as editable data (TC-43) · React Flow · kind-switch vocabulary confusion left unnamed

**Exit capability:** Can fork on a write, not on a guess, and say person-row vs run-row.

**Next pressure:** The chain is in the program. The house cannot change it without a deploy.

---

### TC-43 — Chain as data

**Destination:** The operator changes the chain without a code deploy. A walk reads nodes and edges.

**Prerequisites:** TC-0 → TC-42

**Construction:** The chain becomes data. A small walker. Configured-break. Until-node. **One walker.** Tests protect the walk.

**Forces:** House / open-box. Frozen-in-code operations are a deploy.

**Concepts expected:** graph · node · edge · walk · configured-break · until-node

**Technologies touched:** JSON (or equivalent) for the graph · TypeScript for a small walker — **one walker** · Vitest

**Syntax families:** the data shape · visiting nodes · stopping · **Spine (TS):** `never` on an impossible node kind if it earns its keep

**Production bridge:** None as a graph library. React Flow is the editor, later.

**Must produce:** Add a node by changing data, not code. Unconfigured node fails and does not continue. Until-node: downstream has not run. Tests fail if the walk continues past a configured-break.

**Must NOT introduce:** React Flow · plate interiors · a second walker · copying `workflowWalk.ts`

**Exit capability:** Can add a step without shipping a function, and say the walk reads data.

**Next pressure:** Editing JSON is not operating the house.

---

## Epoch 8 — Authoring faces

Destination fragment: click = configure; then a canvas; then Agents as a different face.

### TC-44 — Click = configure

**Destination:** An operator desk edits the graph as a list of steps. Click a step to configure it. The walk reads what the interior stored.

**Prerequisites:** TC-0 → TC-43

**Construction:** Selected node. Interior writes back into graph data. List editor. RHF if the interior is a real form.

**Forces:** Raw JSON is not the house.

**Concepts expected:** configure · selected node · interior · list editor (not canvas)

**Technologies touched:** the React desk already owned · RHF/Zod as already owned

**Syntax families:** selection state · a form that writes node data

**Production bridge:** Fluency of configure-as-write. Not React Flow.

**Must produce:** `configured === false` fails the walk; configuring it lets the walk continue.

**Must NOT introduce:** React Flow · Ant Design as a new requirement · Agents canvas

**Exit capability:** Can say: the canvas (later) is not the walk; configure writes data.

**Next pressure:** A list cannot show a fork. Topology is lying or invisible.

---

### TC-45 — Spatial canvas

**Destination:** The same graph as a drawing, because a list cannot represent branching.

**Prerequisites:** TC-0 → TC-44

**Construction:** Nodes, edges, handles as a drawing of the **same** data. **React Flow** arrives because the list failed — somebody else’s construction for this class of problem.

**Forces:** Switch paths are invisible in a list. The drawing and the walk must not disagree.

**Concepts expected:** canvas · handle (UI) vs handle (write-set) — keep the words unmixed · library (as someone else’s construction)

**Technologies touched:** **React Flow** (current stable) · existing walker

**Syntax families:** mapping graph data to the library · not a second graph

**Production bridge:** **React Flow.**

**Bridge proof:** Draw a path the walk cannot take; the learner says which construction is lying. The library is an editor, not a second machine.

**Must produce:** A branching graph that is the same data the walker already reads.

**Must NOT introduce:** a second walker · plate-interior encyclopedia · Ant as mandatory for the canvas

**Exit capability:** Treats the library as an editor for a graph they already had — not as “today we learn React Flow.”

**Next pressure:** A mission that starts now is not a fake trigger on this canvas.

---

### TC-46 — Agents as a different authoring

**Destination:** Sequence ⊃ campaigns ⊃ channels, authored on a different face. Enroll now. Automations may assign an existing sequence; they do not author a new agent.

**Prerequisites:** TC-0 → TC-45 and TC-39 (sequence already exists as machine)

**Construction:** A second authoring face. Header enroll. Not Publish.

**Forces:** Stuffing “start now” into an event-graph lies.

**Concepts expected:** Agents vs Automations · enroll now · `⋯` Switch (kind) vs Switch (node)

**Technologies touched:** existing sequence tables + a desk · Router already owned

**Syntax families:** enroll without an event · assign-from-automation remains the other door

**Production bridge:** None new.

**Must produce:** Enroll from the header with no event. Then fire an automation that assigns the same sequence. Name the door twice.

**Must NOT introduce:** live send · OTP · Launch/Run/Test as one button (TC-50)

**Exit capability:** Will not mix the words. Will not author a new agent inside Automations.

**Next pressure:** Anyone who can open the page can edit any firm. Run and Launch feel like the same button. A send that can leave has no gate.

---

## Epoch 9 — Tenancy, gates, outside world

Destination fragment: firm boundary, live send under consent, webhooks, three ignitions, Get/Rule/Wait, Local.

### TC-47 — Firm boundary

**Destination:** Two firms, two books, two operators who must not see each other.

**Prerequisites:** TC-0 → TC-46

**Construction:** Identity. Session. Firm on every ask. OTP or access link when a bookmarkable secret URL is the wrong shape for a returning consultant.

**Forces:** A contact token is the wrong tool for a consultant who returns tomorrow.

**Concepts expected:** user · session · firm · authentication · tenancy · cookie

**Technologies touched:** auth tables · cookie/session · OTP mailer only as required

**Syntax families:** session check on ask · refusal across firms

**Production bridge:** Sessions/cookies as the production consultant identity. Not a vendor auth course.

**Must produce:** Log in as firm A; ask for firm B’s person; server refuses; desk does not paint a stand-in.

**Must NOT introduce:** platform-admin view-as as the first model · dual tenancy leftover as “how identity works”

**Exit capability:** Treats auth as a ledger boundary, not as a login screen tutorial.

**Next pressure:** A send that can leave the building has no gate.

**Security attach:** cookie flags, CSRF, session theft. CORS already earned if origins split. Rate limit on login.

---

### TC-48 — May send

**Destination:** A send that can leave the building, and a way to forbid it. “We can send” ≠ “we may send.” Live ports last.

**Prerequisites:** TC-0 → TC-47

**Construction:** Consent. Halt (this person / this book). Send mode. Then **Twilio + Resend** as the production ports — after the gates exist.

**Forces:** Dry-run rows are no longer honest once a provider exists. Tower already depends on these ports.

**Concepts expected:** consent · halt · silence · live vs dry-run · idempotency of send

**Technologies touched:** **Twilio** · **Resend** · consent/halt tables · the durable worker

**Syntax families:** the gate on the send path · halt blocking **new** enrollments · provider SDK only on the worker side

**Production bridge:** **Twilio + Resend.**

**Bridge proof:** Opt out; tick; no live send. Halt the book; enroll; no new attempt. A retry does not double-send (idempotency). Credentials are not in the client.

**Must produce:** One real send on a test destination, and one forbidden send, both as rows plus (for the live one) an outside artifact.

**Must NOT introduce:** warmup pools · Meta · escrow · sending from React

**Exit capability:** Can forbid a send and show the row that forbids it. Can send without putting secrets in the SPA.

**Next pressure:** The outside world writes back. A provider retry is not “the user clicked twice.”

---

### TC-49 — Webhooks

**Destination:** Ingest an event the outside emitted. Verify it. Retry is safe. Double-apply is a bug.

**Prerequisites:** TC-0 → TC-48

**Construction:** A signed webhook endpoint. Signature check. Idempotency key. A retry from the provider does not enroll twice.

**Forces:** Twilio/Resend (and later billing, calendar) speak in webhooks. Polling the provider is the in-process timer mistake again.

**Concepts expected:** webhook · signature · replay · idempotency · retry

**Technologies touched:** Hono · the existing ledger · the provider’s signing scheme as required

**Syntax families:** raw body + signature header · reject bad signatures · upsert-by-event-id

**Production bridge:** Real webhook ingestion — not a fake `POST` from the same app pretending to be Twilio.

**Bridge proof:** Replay the same payload; one apply. Tamper the body; reject. Notes name at-least-once delivery.

**Must produce:** An outside-shaped payload that becomes a write both faces can read.

**Must NOT introduce:** a second walker · treating the webhook as the Automations canvas

**Exit capability:** Can verify, retry, and not double-apply.

**Next pressure:** One button that “does the automation” conflates specimen writes, a walk, and a subscription.

---

### TC-50 — Three ignitions

**Destination:** Test data on the trigger. Run walks now. Launch arms and must not walk.

**Prerequisites:** TC-0 → TC-49

**Construction:** Three ignitions. Event-test contract as **tables**, not a client fixture.

**Forces:** Launch that walks ruins the world. Run without writes is a guess.

**Concepts expected:** Test · Run · Launch · until-node (as ignition) · event-test contract

**Technologies touched:** `event_write_set` / `event_test_data` or Construction’s equivalent tables · the one walker

**Syntax families:** activate without walk · walk with payload writes · run-to-here

**Production bridge:** None as a library. The production form is three named ignitions, not one “play” button.

**Must produce:** Launch; do not Run; nothing walks until a real event. Run-to-here; downstream has not run.

**Must NOT introduce:** a Test *tab* (destination law: test data lives on the trigger) · a second walker

**Exit capability:** Can refuse a single “do the automation” button and name which ignition they used.

**Next pressure:** The walk can only use what the trigger held, cannot fetch, cannot judge from tables, cannot pause. Global listen over-fires.

---

### TC-51 — Get, Rule, Wait

**Destination:** Fetch existing records; evaluate a rule whose rows live in a table; wait for time or a person.

**Prerequisites:** TC-0 → TC-50

**Construction:** Get as a query that becomes writes. Rule as data, not an `if` in the walker. Wait as park / resume.

**Forces:** Hardcoded judgment is a deploy. The walk cannot pause. The trigger does not hold everything.

**Concepts expected:** Get · Rule · Wait · park / resume · occupancy (if approval)

**Technologies touched:** walker extension (**same walker**) · rule table · wait row · the queue for resume-later

**Syntax families:** Get → writes on the handle · rule rows · wait then continue

**Production bridge:** None new. Tests must cover fetch / judge / pause as separate invariants.

**Must produce:** Change a rule row, not a function; next walk judges differently. Approve a wait; only then downstream runs.

**Must NOT introduce:** a second walker · a SPA rule catalog

**Exit capability:** Can tell fetch / judge / pause apart, and keep all three out of one magic node.

**Next pressure:** “Any form” over-fires. This form / this objective.

**Split flag:** If Get, Rule, and Wait are three unfelt constructions in validated TC-50 work, split before generating.

---

### TC-52 — Local vs Global

**Destination:** This form / this objective / this campaign — not every event of that kind.

**Prerequisites:** TC-0 → TC-51

**Construction:** Grain. Local axis. Some events have no Local (one-time audit). Still an event.

**Forces:** Global listen over-fires.

**Concepts expected:** Global · Local · grain

**Technologies touched:** trigger grain on the existing event dispatch

**Syntax families:** local ids on the write and on the trigger

**Production bridge:** None new.

**Must produce:** Submit form B; automation for form A does not walk. Submit form A; it does.

**Must NOT introduce:** “any row changed” as a trigger kind

**Exit capability:** Can constrain a listen without being told “add a Local radio.”

**Next pressure:** The house still cannot change evaluation, bind, and provision without shipping the walker. Uploads are still pretending to be rows or React state. Shipping and operating have not started.

---

## Epoch 10 — House, files, framework contrast

Destination fragment: operator house as tables; bytes that are not rows; Next.js as comparison, not as a rewrite of the book.

### TC-53 — House

**Destination:** The house changes evaluation, binding, sending, and provision without shipping the walker again.

**Prerequisites:** TC-0 → TC-52

**Construction:** Operator modules as panes and controls on states already named. Evaluation packs as tables. Bind per firm / default / override.

**Forces:** Pursuit and eligibility still half-program.

**Concepts expected:** house · pane vs control · bind · default / override

**Technologies touched:** tables + operator desk already owned

**Syntax families:** whatever the house modules actually require — no new framework

**Production bridge:** None new. This is Tower’s open-box construction.

**Must produce:** Point at a module: control or pane? Which table? Change bind without a deploy; the next walk/enroll behaves differently.

**Must NOT introduce:** Hub as the finish · inventing unspecified stores · treating stand-ins as the system · rebuilding the whole book in Next.js

**Exit capability:** Can change evaluation/bind from the house and say which table the walker read.

**Next pressure:** A seat must upload a file. Blobs are not rows and not React state.

---

### TC-54 — Bytes that are not rows

**Destination:** Upload lives in object storage. The table stores a reference. Access is a signed URL, not a public bucket of everyone’s files.

**Prerequisites:** TC-0 → TC-53

**Construction:** **S3-compatible** storage + signed URLs. Contact (or consultant) uploads. The other face can read with a grant that expires.

**Forces:** Files in `public/` or in Postgres bytea, or in React state, will not be the product.

**Concepts expected:** object storage · key · signed URL · content type · grant that expires

**Technologies touched:** **S3-compatible object storage** · signed URLs · existing auth/token constraints

**Syntax families:** upload to a signed put · store the key · signed get

**Production bridge:** **S3-compatible + signed URLs.**

**Bridge proof:** The database has no file bytes. Expire the URL; access fails. Firm A cannot sign firm B’s key.

**Must produce:** An upload that survives reload and is forbidden across the firm/token boundary.

**Must NOT introduce:** “just use a File object in React as the store” · putting AWS keys in the client

**Exit capability:** Can refuse blobs-in-state and blobs-in-Postgres as the store, and can explain a signed URL as a time-bounded ask.

**Next pressure:** A serious engineer will meet Next.js in the wild. Meeting it as the *first* stack would hide the machinery just constructed.

---

### TC-55 — Framework contrast

**Destination:** Reconstruct **one vertical slice** (one face, one route, one write) in **Next.js App Router**, as comparison to architecture already understood.

**Prerequisites:** TC-0 → TC-54

**Construction:** The same slice the learner already has on Vite + Hono: a page, a mutation, a server boundary. `app/`, `page.tsx`, `route.ts`, Server Component, Client Component, Server Function — each pointed at the explicit construction it replaces or hides.

**Forces:** Next describes itself as a full-stack React framework. If it had been first, routing, server execution, data fetching, and the client/server boundary would have been rituals.

**Concepts expected:** App Router · Server Component · Client Component · Server Function · file-system routing

**Technologies touched:** **Next.js App Router** (current stable) · the same Postgres

**Syntax families:** the App Router files the slice needs — not the marketing tour

**Production bridge:** **Next.js — contrast only.**

**Bridge proof:** A table in notes: Vite+Hono fact vs Next fact, for routing, server execution, data fetching, client/server boundary, rendering. The Construction book itself is **not** rewritten in Next.

**Must produce:** One working vertical slice. The rest of Construction stays on Vite + Hono.

**Must NOT introduce:** “from now on we are a Next shop” · rebuilding Automations in Next · using Next to avoid learning Hono (too late, and forbidden anyway)

**Exit capability:** Can compare a framework’s decisions to architecture they already understand, and can choose Vite+Hono or Next for a reason.

**Next pressure:** Several real pieces work together. Unit/RTL/MSW do not prove a browser, a cookie, and a job in one user-visible workflow.

---

## Epoch 11 — The software works

Destination fragment: another machine can run it; every commit can prove it; it can ship; it can be observed; it can recover; it can survive load; another engineer can work in it; then two audits.

Building the feature is not the end of product engineering. Shipping and operating the feature is.

### TC-56 — End to end in a real browser

**Destination:** One user-visible workflow, real browsers, several pieces together.

**Prerequisites:** TC-0 → TC-55 (the Vite+Hono system is the thing protected; the Next slice may be included or not)

**Construction:** **Playwright** for one close-the-loop path (or enroll → tick → desk changes). Chromium at minimum; a second engine if the construction is cheap.

**Forces:** RTL never saw the cookie, the worker, or the real navigation.

**Concepts expected:** end-to-end test · browser automation · selector as user-visible grain

**Technologies touched:** **Playwright** · the running stack

**Syntax families:** a Playwright spec · locators by role/text · an assertion on the other face

**Production bridge:** **Playwright.**

**Bridge proof:** Break a real integration (stop the worker, or fail the gate); the e2e fails. A CSS-class rename that the user does not see should not be the thing the test loved.

**Must produce:** One e2e path that would have caught a broken close-the-loop.

**Must NOT introduce:** e2e as the only tests (Vitest/RTL/MSW remain) · recording a flaky sleep-fest

**Exit capability:** Can protect a cross-process workflow the way a user experiences it.

**Next pressure:** “Works on my machine” now includes Node, Postgres, Redis, and a worker.

---

### TC-57 — Another machine can run it

**Destination:** Runtime, database, and worker are a repeatable environment.

**Prerequisites:** TC-0 → TC-56

**Construction:** **Docker + Docker Compose** for API + Postgres + Redis + worker (and whatever the e2e needs).

**Forces:** Version drift and “install Postgres locally” will not be how another engineer, or CI, starts.

**Concepts expected:** image · container · compose service · volume · port

**Technologies touched:** **Docker** · **Docker Compose**

**Syntax families:** a `Dockerfile` for the Node app · compose for the dependencies · one command that brings the stack up

**Production bridge:** **Docker + Compose.**

**Bridge proof:** A clean environment (or compose down/up) runs the desk and one job. Notes say what is in the image vs what is a volume.

**Must produce:** Another process on the same machine, started from compose, running the system.

**Must NOT introduce:** Kubernetes as the first orchestrator · a ten-service mesh

**Exit capability:** Can package the runtime so “works on my machine” is a compose file, not a memory.

**Next pressure:** Humans re-running tests and deploys by hand will skip a check.

---

### TC-58 — Every commit proves itself

**Destination:** Push → typecheck, test, (and e2e as earned) run on a machine that is not the laptop.

**Prerequisites:** TC-0 → TC-57

**Construction:** **GitHub Actions** CI. pnpm, strict TS, Vitest, RTL, MSW, Playwright as the pipeline can honestly run.

**Forces:** Manual verification became repetitive and skippable.

**Concepts expected:** CI · workflow · job · artifact · status check

**Technologies touched:** **GitHub Actions** · the Dockerized or service-based test stack

**Syntax families:** a workflow YAML · install · typecheck · test · cache as needed

**Production bridge:** **GitHub Actions.**

**Bridge proof:** Break a test on a branch; CI goes red. Fix; it goes green. CI is not a badge.

**Must produce:** A workflow the learner can point at, running on a push.

**Must NOT introduce:** deploying from CI yet if secrets/environments are unfelt (that is TC-59) — unless a dry “build only” is cheap

**Exit capability:** Can make every commit prove itself without sitting at the terminal.

**Next pressure:** Proving is not shipping. Environments, secrets, and repeatable deploy are a different construction.

---

### TC-59 — Ship repeatedly

**Destination:** Deploy is a construction. Environments, secrets, and a worker-capable runtime exist. **Vercel** for the web face; managed DB; a runtime that can run the worker (or an equivalent the learner can name).

**Prerequisites:** TC-0 → TC-58

**Construction:** CD from the same pipeline or the platform’s production path. Staging vs production. Secrets not in git.

**Forces:** Tower already contains Vercel build machinery. A laptop is not an environment. Construction should actually ship the system.

**Concepts expected:** environment · secret · deploy · rollback as a button or a previous deploy · preview (if the platform gives it)

**Technologies touched:** **Vercel** · managed Postgres · worker-capable runtime (platform worker, a small VM, or a container — name it) · GitHub Actions if it deploys

**Syntax families:** env-specific config · secret references · a deploy the learner did not drag a folder to do

**Production bridge:** **Vercel + managed DB + worker-capable runtime.**

**Bridge proof:** Change a secret; the client still does not contain it. Deploy twice; name how to go back. Staging can break without being production.

**Must produce:** A URL that is not localhost, serving the desk against a real environment.

**Must NOT introduce:** a custom Kubernetes novel · shipping without the gates from TC-48

**Exit capability:** Can ship repeatedly, with secrets in the environment, and can say which runtime runs the worker.

**Next pressure:** A worker/API fails where nobody is staring at a terminal.

---

### TC-60 — Know why it broke

**Destination:** Structured logs, then traces/metrics. A failure in production is findable.

**Prerequisites:** TC-0 → TC-59

**Construction:** Structured logs on the API and worker. **OpenTelemetry** for traces (and metrics as earned). Optionally **Sentry** on the backend for crashes.

**Forces:** `console.log` on a laptop is not observability. OTel standardizes traces, metrics, and logs.

**Concepts expected:** structured log · trace · span · metric · correlation id

**Technologies touched:** **OpenTelemetry** · optionally **Sentry** (backend) · the running services

**Syntax families:** JSON logs with request/job ids · a trace across API → worker if earned · an error that appears in the tool

**Production bridge:** **OpenTelemetry** (and Sentry if used).

**Bridge proof:** Break a job in the deployed (or compose) environment; find it from logs/traces without SSH-guessing. Point at a log line that would have been useless as a string of prose.

**Must produce:** One real failure, found from telemetry, with a correlation the learner can follow.

**Must NOT introduce:** a metrics religion · observing instead of fixing the invariant

**Exit capability:** Can find a failure they are not watching happen.

**Next pressure:** Finding it is not recovering.

---

### TC-61 — Recover

**Destination:** Health checks, retries already owned, backups, rollback. The system can come back.

**Prerequisites:** TC-0 → TC-60

**Construction:** `/health` that means something. A backup/restore of Postgres. Rollback of a bad deploy. Retries/backoff already from the queue, now named as recovery.

**Forces:** A red trace that ends in “we restored from a teammate’s laptop dump” is not operations.

**Concepts expected:** health check · backup · restore · rollback · degraded vs down

**Technologies touched:** the deployed stack · Postgres backup as the platform provides it

**Syntax families:** a health route that checks DB (and queue if honest) · a documented restore the learner actually performed once in a non-production environment

**Production bridge:** Operations fluency. No new vendor required.

**Must produce:** A bad deploy rolled back. A restore into a scratch database that still reads a person.

**Must NOT introduce:** a fake “we would restore” paragraph without doing it

**Exit capability:** Can recover a ledger and a deploy, not only a process restart.

**Next pressure:** Correct at one user. Slow or down at many.

---

### TC-62 — Survive load

**Destination:** Indexes, caching, queues, and profiling used on purpose when load is the problem.

**Prerequisites:** TC-0 → TC-61

**Construction:** A slow list or a hot tick. Profile it. An index, a cache, or a queue already owned — applied as the diagnosis says, not as a stack to install.

**Forces:** Feature-complete and unusable is not product engineering.

**Concepts expected:** profiling · cache · hot path · backpressure (ordinary sense)

**Technologies touched:** Postgres `EXPLAIN` already owned · a cache only if earned (Redis already present) · existing queue

**Syntax families:** a measurement · one repair · a before/after

**Production bridge:** Fluency of tools already earned. Not a new APM unless OTel already shows the hot span.

**Must produce:** A measured improvement the learner can explain. A cache that can go stale — and a named invalidation.

**Must NOT introduce:** “add Redis” as a personality · load-test theater without a question

**Exit capability:** Can say whether the problem was query, chatty loops, or the worker, and can apply one repair.

**Next pressure:** Another engineer cannot work in this repo without a tour from the author.

---

### TC-63 — Another engineer can work in it

**Destination:** Mechanical standards, repo boundaries, and conventions do not consume human attention. Workspaces only if pressure is real.

**Prerequisites:** TC-0 → TC-62

**Construction:** **ESLint + formatter** (or a deliberate modern replacement). **pnpm** fluency. **pnpm workspaces** if apps/packages actually need them; **Turborepo** only if orchestration pressure is real. README that starts the stack.

**Forces:** Style nits and “which package do I run” are not construction. A premature monorepo is a bootcamp failure.

**Concepts expected:** lint · format · workspace · package boundary · lockfile

**Technologies touched:** **ESLint** · formatter · **pnpm** · workspaces / Turborepo **only if earned**

**Syntax families:** lint config · format on check in CI · workspace `package.json` if split

**Production bridge:** **ESLint + formatter + pnpm** (workspaces if earned).

**Bridge proof:** A lint error fails CI. A workspace exists only with two real packages. Notes say what the split bought.

**Must produce:** CI checks format/lint. A second engineer (the evaluator playing one) can start from the README.

**Must NOT introduce:** a monorepo because “serious repos have one” · rewriting history into apps/packages as busywork

**Exit capability:** Can keep mechanical standards automatic, and can split a package when coordination pressure exists — not before.

**Next pressure:** Reproduction of this building is not graduation. Convergence and transfer have not been audited.

---

### TC-64 — Convergence and transfer

**Destination:** Account for current Tower as a **behavioral / architectural** class. Then construct a small product that is not in Tower. The agent is no longer the source of the construction.

**Prerequisites:** TC-0 → TC-63

**Construction:** Two audits. (1) Convergence against [`DESTINATION.md`](./DESTINATION.md) — mechanisms, not dependency versions. (2) Transfer: a foreign intention; name information / state / relationships / behavior / boundaries / mechanisms **before** writing; choose and wield a modern production stack; construct, verify, ship-or-say-how-to-ship.

**Forces:** Fluency in one building is not the bar. The bar is competence that survives a stack change.

**Concepts expected:** convergence · transfer · class of system

**Technologies touched:** whatever the transfer product honestly needs from the map — no new fashion

**Syntax families:** whatever the transfer requires

**Production bridge:** Graduation. Not a library.

**Must produce:** Written convergence: each DESTINATION spine item, where it lives in *their* construction, or why a leftover is not the system. Then: a small product not in Tower, constructed from intention, with tests, with a named deploy path.

**Must NOT introduce:** Hub as the finish · inventing unspecified Tower stores · treating stand-ins as the system · “I would use Next for everything” as a personality · matching Tower’s React 18 / Vite 6 pins as if that were convergence

**Exit capability:** Determines what needs to exist. Can sit down with an intended product, choose and wield a modern production stack, construct it across browser/server/data/workers/integrations, verify it, ship it, observe it, and change it safely — and understands enough underneath those tools that when the stack changes, they do not collapse with it.

**Next pressure:** None in this map. Remaining gaps: two buckets only (specified-and-clear vs specified-but-not-clear).

---

## Amendment log

| Version | Date | Change |
|---|---|---|
| 1 | 2026-10-04 | Initial map. TC-0–35. Split flags on TC-15 and TC-33. |
| 1 | 2026-10-05 | Chapter path: `book/epoch-<k>/tc-<n>.md` (epoch folder, not cycle-number folder). No contract change. |
| 2 | 2026-10-05 | Production Bridge law. `TECHNOLOGY-MAP.md` added. TC-0–2 **stable** (TC-2 remains CSS rudiment). Inserted CSS layout (TC-3) and Tailwind (TC-4). Distributed TypeScript, JavaScript, SQL, testing, security as spines. Added production UI/data/testing/runtime/operations technologies and a late ops band. Next.js is a contrast slice (TC-55), not the book’s stack. Destination audits moved to TC-64. Thirty-six is not the product. ~65 cycles (TC-0–64). |
