# JOURNEY — table of contents and cycle contracts

**Version:** 3  
**Mutability:** Versioned. Split or merge with a version stamp and a reason. Do not silently rewrite.  
**Not this file:** lessons, exercises, finished code.

Each heading below is a **contract** for a future chapter. The agent generating TC-N reads this contract, [`RULES.md`](./RULES.md), [`MASTERY.md`](./MASTERY.md), [`DESTINATION.md`](./DESTINATION.md), [`TECHNOLOGY-MAP.md`](./TECHNOLOGY-MAP.md), and the learner’s validated TC-(N−1) work.

**Advance:** never because the next heading exists. Advance when that cycle’s **Exit capability** is met and **Next pressure** is visible.

**Chapter path:** `book/epoch-<k>/tc-<n>.md`. Epoch 0 contains TC-0–4. `constructions/` and `my-work/` stay `tc-<n>`.

**Stable already generated:** TC-0, TC-1, and TC-2. Do not regenerate them. TC-2 remains the CSS **rudiment**. Layout is TC-3. Tailwind is TC-4.

**Practices, not a logo sequence.** v3 is locked on direction. Seams below (persistence/HTTP, CI+Postgres, Compose growth, transfer must ship, TC-39 synthetic) are the last architecture corrections. Do not add another wave of technologies.

**Cycle count is not a product.** v3 maps TC-0–72. Split if a cycle smuggles two constructions. Merge if the split is ceremonial.

---

## How to read a contract

| Field | Meaning |
|---|---|
| **Destination** | The capability this cycle exists to cause. |
| **Prerequisites** | Prior cycles whose exit must be stable. |
| **Construction** | What is built. |
| **Forces** | Why the previous system is insufficient. |
| **Concepts expected** | Industry names attached **after** the phenomenon. |
| **Technologies touched** | Allowed representations. Absence means “none yet.” |
| **Syntax families** | Fluency targets for this cycle. Spines may add more when the construction repeats a shape. |
| **Production bridge** | The production technology this cycle earns — or **not this cycle**. |
| **Bridge proof** | How the learner shows the tool is not magic. Omit if there is no bridge yet. |
| **Must produce** | Observable outcome. |
| **Must NOT introduce** | Hard boundary. |
| **Exit capability** | The mastery bar. |
| **Next pressure** | Why the following cycle is necessary. |

**Law:** rudiment → mechanism → production bridge → production fluency.

**Node law:** Node as **toolchain host** ≠ Node as **application runtime**. The first is how tools run (TC-10, deepened at TC-13). The second is when the Node process *is* the product (TC-27).

---

## Continuing spines (not extra chapters)

Forced when a construction needs them. Never “today’s lesson is generics / bash / Git.”

- **JavaScript** from TC-5.
- **TypeScript** arrives TC-12; never finishes there.
- **SQL** from the first table (TC-20); not done at `SELECT`. Pagination/filter/sort is a later *vertical* (TC-33). Schema evolution is TC-25.
- **Tests** from TC-10, growing: Vitest → RTL → MSW → Playwright smoke (TC-38) → serious E2E (TC-63).
- **CI** from TC-18, growing: unit/UI → **Postgres ledger invariants (TC-20–22)** → API integration (TC-27) → smoke e2e (TC-38) → worker/Redis as needed (TC-42) → full-system prove (TC-65) → CD (TC-66).
- **Compose** from TC-27 (Postgres + API as local orchestration), growing Redis + worker at TC-42. TC-64 is the **image**, not “discover Compose.”
- **DevTools** from TC-0.
- **Security** attached to the threat the construction creates.
- **Accessibility** from semantic HTML (TC-1); hardens at forms, dialogs, errors; RTL queries by role.
- **Git** from the envelope (push); craft grows: branch before an intentional break, read a diff, conflict, bisect a regression, revert vs rollback.
- **Systems / tooling:** terminal, PATH, env, process, PID, exit code, signal, port, stdio, `curl`, who owns this port, what env this process reads — when those facts become the construction.
- **Networking:** host, port, IP, DNS, origin, TCP at useful grain, TLS, certificate, reverse proxy, localhost, CORS, caching headers, CDN at useful grain — when the construction leaves one machine.
- **Time as data** (TC-40) before time as *cause* (TC-41).

---

## Epoch 0 — Appearance

Destination fragment: a browser page whose look is a construction, then the production vocabulary for that construction — **without smuggling a package toolchain**.

### TC-0 — Smallest causal chain

**Destination:** The smallest causal chain from something you author to something a browser produces.

**Prerequisites:** None. Operating grain: [`../TC-0-OPERATION.md`](../TC-0-OPERATION.md).

**Construction:** An empty HTML file, opened from disk, producing a blank page.

**Forces:** Nothing authored is being interpreted into a page.

**Concepts expected:** source · HTML file (as a *kind*) · interpret / render · page · extension · refresh / reload

**Technologies touched:** HTML (file kind only — no tags)

**Syntax families:** empty `*.html` file

**Production bridge:** Not this cycle.

**Must produce:** A blank page caused by the learner’s empty source. Notes that state the chain.

**Must NOT introduce:** tags · document skeleton · occupant · CSS · JS · TS · React · Vite · a server · computer-literacy drills · Tower source · npm

**Exit capability:** Can state and re-cause: author file → browser interprets → page. File ≠ page.

**Next pressure:** Something in the head should exist *on* the page.

---

### TC-1 — Occupant

**Destination:** One intended thing exists on the page because the source says so.

**Prerequisites:** TC-0

**Construction:** Put one occupant in the source so the rendered page is no longer empty.

**Forces:** Empty source renders empty.

**Concepts expected:** tag · element · document · body · head · **Spine (a11y):** a heading is a heading because of the tag, not because it looks big

**Technologies touched:** HTML

**Syntax families:** element tags · `html` / `head` / `body` · a text-bearing element

**Production bridge:** Not this cycle.

**Must produce:** One visible occupant. Removing the element removes the occupant.

**Must NOT introduce:** CSS · JS · classes as design system · React · multiple competing occupants as the point

**Exit capability:** Cause a *different* occupant than the chapter used, without being shown that tag first.

**Next pressure:** The occupant cannot be placed or distinguished by appearance.

---

### TC-2 — Appearance

**Destination:** Control where / how the occupant appears, without changing what the occupant *is*.

**Prerequisites:** TC-0 → TC-1

**Construction:** Rules attached to the occupant that affect place, size, or color.

**Forces:** HTML names the thing. It does not place it.

**Concepts expected:** CSS · rule · selector · property · declaration

**Technologies touched:** CSS · HTML

**Syntax families:** a style rule · a few layout/color properties the construction needs

**Production bridge:** **Not this cycle.** Rudiment only. Tailwind is TC-4, after layout mechanisms. No Node, no packages.

**Must produce:** The same occupant, different place or look, caused by rules.

**Must NOT introduce:** a design system · Tailwind · a component library · JS · npm · box-model/flex/grid as a course (TC-3)

**Exit capability:** Change one rule; predict what moves; do it. Appearance is a second construction attached to the first.

**Next pressure:** One property on one occupant is not layout.

---

### TC-3 — Layout

**Destination:** Several occupants, arranged, from CSS mechanisms.

**Prerequisites:** TC-0 → TC-2

**Construction:** Repeated elements, then rules that control box, flow, alignment, wrapping.

**Forces:** A color rule cannot be a page.

**Concepts expected:** tree · parent / child · sibling · box model · flex · grid · positioning · cascade / specificity · responsive constraint as CSS

**Technologies touched:** HTML · CSS

**Syntax families:** repeated elements · flex / grid as required · box properties · a media query if two widths are required

**Production bridge:** Not yet. Build once in CSS. Rebuild in Tailwind at TC-4.

**Must produce:** Arrangement caused by CSS layout, not spacer elements.

**Must NOT introduce:** Tailwind · a component library · JS · npm · Vite

**Exit capability:** Construct a row, a stack, and a wrapping grid from CSS, and name which mechanism did the work.

**Next pressure:** Production UI is not lovingly hand-authored selectors after the mechanisms are understood.

---

### TC-4 — Production appearance

**Destination:** The same layout, in the production vocabulary. The learner knows what the tool is buying.

**Prerequisites:** TC-0 → TC-3

**Construction:** Recreate the TC-3 layout with **Tailwind CSS 4** compiled by the **standalone CLI** (binary that reads source and writes CSS). **Explicit decision:** this cycle is utilities pointing at CSS. It is **not** a package-manager course. Tailwind’s usual Vite plugin install is named as the production default and is **deferred to TC-13**, when Node-as-toolchain-host and Vite exist.

**Forces:** Remaining on raw CSS after the mechanisms are understood is refusing the abstraction. Jumping to Tailwind before TC-3 is the bootcamp failure. Smuggling `package.json` into appearance would hide a second construction.

**Concepts expected:** utility class · standalone compile · (named, not used) package install / Vite plugin as “how production usually obtains this compiler”

**Technologies touched:** Tailwind CSS 4 **standalone CLI** · CSS · HTML

**Syntax families:** utility classes the reconstructed layout needs · a CSS drop-through when a utility is insufficient

**Production bridge:** **Tailwind CSS 4 (standalone CLI).** Vite-plugin Tailwind is a later toolchain fluency, not a second styling bridge.

**Bridge proof:** Point each important utility at the CSS mechanism. Drop to CSS once. Say what the standalone CLI is (a compiler) and is not (Node-as-product). Notes name that production apps typically install Tailwind via the package toolchain — that path is TC-13.

**Must produce:** The TC-3 layout, rebuilt. Learner can produce the utilities without guessing as the method.

**Must NOT introduce:** npm / pnpm · `package.json` · `node_modules` · Vite · PostCSS-as-a-course · React · a component library as a way to avoid layout

**Exit capability:** Construct the layout in Tailwind without guessing classes, and drop to CSS when the utility is insufficient, **without** a Node project.

**Next pressure:** Occupants only sit there. One of them should do something.

---

## Epoch 1 — Information

### TC-5 — Behavior

**Destination:** One occupant responds. A click causes something to run.

**Prerequisites:** TC-0 → TC-4

**Construction:** A listen and a response attached to one occupant.

**Forces:** A desk that cannot act is a picture.

**Concepts expected:** event · listener · handler · script

**Technologies touched:** HTML · CSS/Tailwind as already owned · JavaScript (first arrival)

**Syntax families:** attaching a listener · a function body that runs on the event

**Production bridge:** Not this cycle.

**Must produce:** Remove the listener: the thing still exists; the behavior is gone.

**Must NOT introduce:** frameworks · state as a named object yet · TypeScript · React · npm

**Exit capability:** Add behavior to a *different* occupant, and explain listen + run.

**Next pressure:** The click always does the same thing.

---

### TC-6 — Behavior reads information

**Destination:** The response depends on a value, not only on the fact of the click.

**Prerequisites:** TC-0 → TC-5

**Construction:** A value the handler reads. Change the value, not the listener; the outcome changes.

**Forces:** Fixed behavior cannot be a desk.

**Concepts expected:** value · variable · read vs write

**Technologies touched:** JavaScript · HTML

**Syntax families:** declaration and assignment · reading a value in a handler

**Production bridge:** Not this cycle.

**Must produce:** Two outcomes from the same listener, caused only by different information.

**Must NOT introduce:** React · `useState` · TypeScript · persistence

**Exit capability:** Change the value, not the listener, and predict the page.

**Next pressure:** The value can change and the page can still show the old world.

---

### TC-7 — State

**Destination:** The page is built from current information. When information changes, appearance changes.

**Prerequisites:** TC-0 → TC-6

**Construction:** Information → appearance. Then name it **state**.

**Forces:** A value that nothing re-reads is a dead fact.

**Concepts expected:** state · current value · the page as a view of information

**Technologies touched:** JavaScript · HTML · CSS/Tailwind as needed

**Syntax families:** updating a value · causing the page to reflect it (manual is allowed)

**Production bridge:** Not this cycle. `useState` is TC-13’s representation of *this* relationship.

**Must produce:** Change information; the page shows the new world without hand-editing HTML as a second book.

**Must NOT introduce:** React · `useState` · Redux · persistence

**Exit capability:** Name this relationship “state” and point at it. Name one piece of information that should *not* affect the page.

**Next pressure:** One value cannot be a book.

---

### TC-8 — List and selection

**Destination:** A list of people. Select one. See that one.

**Prerequisites:** TC-0 → TC-7

**Construction:** A collection. Identity. Selected identity. Detail is a function of selection.

**Forces:** A single value is not a book.

**Concepts expected:** collection / array · identity · selection · index vs identity

**Technologies touched:** JavaScript · HTML · CSS/Tailwind

**Syntax families:** arrays · identity · rendering a list · **Spine (JS):** `map` / `filter` if a transform repeats

**Production bridge:** Not this cycle.

**Must produce:** Add a person; they appear; they can be selected; detail matches.

**Must NOT introduce:** a database · React · hardcoded “Sarah Jenkins” as the product · a server

**Exit capability:** Add a person without being given the next line. Say what had to exist that “one name” did not need.

**Next pressure:** Copy-paste drifts. Also: “I know what this should do” is still a thought.

---

## Epoch 2 — Named constructions

Destination fragment: reuse, software that verifies software, named shapes, a renderer, production UI systems, **then the first machine that runs the proofs**.

### TC-9 — Named construction

**Destination:** Repeated structures expressed once and reused.

**Prerequisites:** TC-0 → TC-8

**Construction:** Take a repeated construction and give it a reusable form.

**Forces:** Change in one place, forget the other: the desk lies.

**Concepts expected:** function · parameters · arguments · return · scope

**Technologies touched:** JavaScript

**Syntax families:** function declarations · calls · parameters · return

**Production bridge:** Not this cycle.

**Must produce:** One definition used at least twice. Change the definition; every use changes.

**Must NOT introduce:** React · components · TypeScript · a test runner (TC-10) · npm as a lifestyle

**Exit capability:** Recognize a repeated construction and extract it **without** being instructed to “make a function.”

**Next pressure:** Changing the function later is unprotected.

---

### TC-10 — Software that verifies software

**Destination:** An invariant becomes a test that catches a broken implementation. **Node.js appears as toolchain host**, not as the product.

**Prerequisites:** TC-0 → TC-9

**Construction:** State what a function must keep true. Encode it. Break the impl. The test fails. Restore. **Vitest** is the runner. Running it requires: a Node binary, a `package.json`, a script, a lockfile, `node_modules`, a CLI. Those are constructions of **how tools run**. The desk is still a page.

**Forces:** Learner-proofs are not how the software knows. A runner is a program. That program is not the browser.

**Concepts expected:** invariant · test · assertion · runner · **Node as toolchain host** · package · `package.json` · script · lockfile · `node_modules` · CLI / binary · **exit code** · **Spine (Git):** branch before the intentional break; the test file is a commit, not a screenshot

**Technologies touched:** **Vitest** · **Node.js (toolchain host)** · JavaScript · pnpm or npm as the minimum to obtain the runner

**Syntax families:** a test file · assertions on the TC-9 function · `package.json` `scripts.test` · running the script and reading the exit code

**Production bridge:** **Vitest.** Side-bridge: **Node-as-toolchain-host** (not Node-as-product).

**Bridge proof:** Break the impl; the test catches it. Kill the runner process; the page still opens from disk. Say: Node executed the tool; Node is not yet the application.

**Must produce:** At least one test that would catch a real lie. Learner can point at `package.json`, the lockfile, and the exit code.

**Must NOT introduce:** React · Vite as the product bundler (that is TC-13) · RTL · Playwright · a server · treating Node as “my app”

**Exit capability:** State an invariant, encode it, break the impl, watch the test catch them. Can say what Node was doing (hosting the tool).

**Next pressure:** Functions that compute text do not stop *markup* from drifting.

---

### TC-11 — Component

**Destination:** The same page-construction appears in two places without forking.

**Prerequisites:** TC-0 → TC-10

**Construction:** A construction that is itself a thing-on-the-page.

**Forces:** Functions that compute text do not stop markup from drifting.

**Concepts expected:** component · composition · props (plain sense)

**Technologies touched:** JavaScript · HTML · CSS/Tailwind as owned

**Syntax families:** functions that build page structure · passing values into them

**Production bridge:** Not yet. React’s function component is TC-13.

**Must produce:** A second list from the same row construction. Vitest still passes or is extended.

**Must NOT introduce:** React · JSX · a component library · TypeScript

**Exit capability:** Build a second list from the same row construction; say what must stay shared.

**Next pressure:** Wrong-shaped information silently becomes a lying row.

---

### TC-12 — Named shapes

**Destination:** Information cannot silently be the wrong shape. TypeScript **arrives**. It does not finish.

**Prerequisites:** TC-0 → TC-11

**Construction:** A named shape. Checking at construction. A person without identity is refused.

**Forces:** Silent wrong shape makes the desk lie.

**Concepts expected:** type · interface · annotation · check-time vs run-time · strictness

**Technologies touched:** **TypeScript strict** (first arrival) · JavaScript as it exists

**Syntax families:** `type` / `interface` for person and selection · annotations · **Spine (TS):** strict nullability when a value may be missing · a `typecheck` script once `tsc` exists

**Production bridge:** **TypeScript strict.** Fluency continues for the rest of the book.

**Bridge proof:** A broken person is refused. `any` that makes the desk lie is a fail.

**Must produce:** Broken person refused before the page lies. Strict check is how the learner knows.

**Must NOT introduce:** React · generics encyclopedia · Zod · `any` as the chapter’s escape

**Exit capability:** Refuse a broken person and say which constraint failed. Can say: these types disappear at runtime.

**Next pressure:** The page is still patched by hand. Types that vanish cannot check JSON from outside.

---

### TC-13 — Renderer and toolchain

**Destination:** The page stays true when information changes. The **development/build environment** is a construction. Mechanical quality is a script, not a personality.

**Prerequisites:** TC-0 → TC-12

**Construction:** A renderer: **React 19** + **Vite 8+** (cohort pin: [`DESTINATION.md`](./DESTINATION.md)). JSX. pnpm. **Formatter + ESLint + `typecheck` scripts.** Tailwind moves from standalone CLI onto the **Vite plugin** (the production install named at TC-4). Causal, not encyclopedic: `package.json`, dependency vs devDependency, script, lockfile, package manager, binary, `node_modules`, ES module, build, dev server, environment.

**Forces:** Manual DOM patching misses a node. Opening an `.html` from disk cannot be this renderer. Formatting/lint as human attention will not survive TypeScript.

**Concepts expected:** render · React · JSX · `useState` as TC-7’s relationship · package · entry point · HMR · env var · **dev server** · **port** · build output · lint · format

**Technologies touched:** **React 19** · **Vite 8+** · TypeScript · **pnpm** · **ESLint + formatter** · Tailwind Vite plugin · Node as toolchain host

**Syntax families:** function component · JSX for the owned desk · `useState` · imports · Vite scripts · `.env` as required · lint/format/typecheck scripts

**Production bridge:** **React 19 + Vite 8+ + pnpm + lint/format/typecheck.** Tailwind-via-Vite is toolchain completion of TC-4, not a new styling idea.

**Bridge proof:** Remove the renderer; name the bugs that return. Point at `useState` as TC-7. Run format/lint/typecheck as scripts; a lint error is an exit code, not a vibe. Say what the Vite dev server is (a process on a port serving a build).

**Must produce:** The TC-8 desk, true after adds/selects. A production build. Green lint/format/typecheck scripts.

**Must NOT introduce:** Ant · React Router · React Flow · Next.js · TanStack Query · GitHub Actions (TC-18) · Node as a product HTTP server

**Exit capability:** Produce the React/JSX this desk needs. Start, env-configure, and build with Vite. Run format/lint/typecheck without being reminded they exist.

**Next pressure:** Effects and composition will be used as decoration unless they earn their keep.

---

### TC-14 — Composition and effects only where warranted

**Destination:** Compose. Reach for an effect only to sync with something outside React.

**Prerequisites:** TC-0 → TC-13

**Construction:** Lift or push state. Derived data is not state. One warranted effect; one mistaken effect deleted.

**Forces:** A pile of `useEffect` is not a desk.

**Concepts expected:** composition · lifting state · derived data · effect as synchronization · cleanup

**Technologies touched:** React 19 · TypeScript · Vitest for non-UI logic

**Syntax families:** props down · callbacks up · `useEffect` only when warranted · **Spine (TS):** function types for callbacks

**Production bridge:** React fluency continues.

**Must produce:** One derived value that is *not* state. One effect with a reason. One effect written and **deleted**.

**Must NOT introduce:** TanStack Query · React Router · a component library yet

**Exit capability:** Refuse an effect that duplicates render. Say where state should live.

**Next pressure:** Accessible, composable controls are a research project if rebuilt from `div`s.

---

### TC-15 — Accessible primitives

**Destination:** Consume a real primitive system. **Construction default: shadcn/ui + Base UI.** The mechanism is headless accessible primitives. **Not** equal fluency in Base UI + Radix + React Aria + Ant.

**Prerequisites:** TC-0 → TC-14

**Construction:** Replace one homegrown control with **shadcn/ui on Base UI**. Keyboard, focus, unstyled behavior. **Radix:** existing-system *literacy* — recognize/read it (Tower still has Radix in places); do not require a second primitive stack.

**Forces:** A `div` that looks like a dialog is not a dialog.

**Concepts expected:** primitive · accessible name / role · focus trap · headless vs skin · **Spine (a11y):** label/control, keyboard, focus, roles only when semantics don’t exist

**Technologies touched:** **shadcn/ui** · **Base UI** · React · Tailwind · Radix only as a reading contrast if a snippet is shown

**Syntax families:** composing a Base UI / shadcn control · open state the learner already understands

**Production bridge:** **shadcn/ui + Base UI.**

**Bridge proof:** Keyboard-operate the control. Remove the primitive; say what CSS cannot fake. Point at skin vs behavior. If a Radix snippet is shown: name it as the same *class* of mechanism, not homework to rebuild.

**Must produce:** One real control (dialog, dropdown, or tabs) used by the desk.

**Must NOT introduce:** Ant (TC-16) · React Aria as a third mandatory base · copying Tower’s Ant tree · becoming “fluent in every primitive vendor”

**Exit capability:** Compose a primitive without forking it. Say what the primitive owns vs the skin. Can *read* a Radix tree without having built one.

**Next pressure:** A product that standardized on a vendor library is a different literacy.

---

### TC-16 — Vendor system literacy

**Destination:** Consume **Ant Design** as a comprehensive vendor system. Literacy, not a rewrite of the desk.

**Prerequisites:** TC-0 → TC-15

**Construction:** One region uses Ant. Configure; do not fork. Contrast with the primitive already owned.

**Forces:** Tower’s product face uses Ant. Primitive-only fluency will bounce off an existing Ant tree.

**Concepts expected:** design system · token / theme as the vendor exposes it · ConfigProvider as needed

**Technologies touched:** **Ant Design** (cohort pin) · React

**Syntax families:** the Ant components the region needs — not the catalog

**Production bridge:** **Ant Design literacy.**

**Bridge proof:** Same intention, two representations (primitive vs Ant). Do not restyle Ant into shadcn as a flex.

**Must produce:** One working region in Ant. The rest may stay on primitives.

**Must NOT introduce:** Ant as the only legal UI forever · React Flow

**Exit capability:** Consume a vendor system without forking it blindly. Choose primitive vs vendor for a reason.

**Next pressure:** Tests still only cover functions. The rendered desk can lie while Vitest is green.

---

### TC-17 — Rendered behavior as tests

**Destination:** Test what a user can do with the rendered UI. Querying by role is the accessibility spine made executable.

**Prerequisites:** TC-0 → TC-16

**Construction:** **React Testing Library** on the list/selection desk. Query by role and text. Interact. Assert the document.

**Forces:** A green helper test does not mean the row is on the screen.

**Concepts expected:** user-centric query · role · user event · **Spine (a11y):** if you cannot find it by role/name, the user may not be able to either

**Technologies touched:** **React Testing Library** · Vitest · React

**Syntax families:** `render` · `getByRole` / text · user event · **no** tests that poke internals

**Production bridge:** **React Testing Library.**

**Bridge proof:** Break a visible label; the test fails. Refactor internals; the test stays quiet.

**Must produce:** Tests for select-a-person and add-a-person as the user experiences them.

**Must NOT introduce:** Playwright yet · MSW · snapshot-everything · GitHub Actions yet (next)

**Exit capability:** Write a test that fails if the desk stops selecting, without importing the component’s state variable.

**Next pressure:** The proofs exist. A human still decides whether to run them.

---

### TC-18 — The proofs run without you

**Destination:** Every push typechecks, lints, and runs unit/UI tests on a machine that is not the laptop. **CI phase 1.** This is not “discover CI” at the end of the book.

**Prerequisites:** TC-0 → TC-17

**Construction:** **GitHub Actions** workflow: install → typecheck → lint → Vitest (including RTL). The scripts from TC-13 are what CI runs.

**Forces:** Forty cycles of “software can verify software” while a human remembers to run it violates the bridge law.

**Concepts expected:** CI · workflow · job · status check · **Spine (Git):** the check is on a commit; a red X is an exit code on someone else’s machine

**Technologies touched:** **GitHub Actions** · existing pnpm scripts

**Syntax families:** a workflow YAML · the same scripts the learner already runs locally

**Production bridge:** **GitHub Actions (phase 1).** Later cycles *grow* this workflow. They do not replace it.

**Bridge proof:** Break a test on a branch; CI goes red. Fix; it goes green. CI is not a badge.

**Must produce:** A workflow on push. Local scripts and CI agree.

**Must NOT introduce:** deploying from CI · Playwright · a database service in CI yet · CD

**Exit capability:** Can make unit/UI proofs run on every commit without sitting at the terminal.

**Next pressure:** The book lives in the page. Refresh, a second window, and tomorrow do not share it.

---

## Epoch 3 — A book that outlives the page

The SPA does **not** talk to Postgres until TC-27. Do not invent a browser driver or smuggle an HTTP server to preserve order.

### TC-19 — Persistence

**Destination:** Change a name, reload, the change is still there. The causal fact is: **page state can outlive the page.**

**Prerequisites:** TC-0 → TC-18

**Construction:** Durable information in a store **the browser owns**. **`localStorage`** (or an equivalent deliberately browser-owned durable store — not a disk file the SPA cannot honestly reach, not IndexedDB-as-a-course).

**Forces:** State in the page dies with the page. Refresh, a second tab, tomorrow.

**Concepts expected:** persistence · source of truth · serialize / deserialize · **Spine (DevTools):** Application → Storage

**Technologies touched:** `localStorage` (or equivalent browser store) · TypeScript · **Spine (TS):** types for the serialized shape; they still vanish at runtime

**Syntax families:** `getItem` / `setItem` (or equivalent) · JSON as the durable representation if used

**Production bridge:** Not yet. Postgres is the **ledger**, from the terminal, at TC-20. The desk does not talk to it until TC-27.

**Must produce:** Kill the page; open again; the change survived; the learner can say *where* (a browser store, not “a file next to the HTML”).

**Must NOT introduce:** Postgres · HTTP · a server · Node-as-product · a local file pretending the browser can write the repo · painted rows as the method

**Exit capability:** Point at the browser-owned store. The page is a view of it — or it is a lie.

**Next pressure:** A blob cannot be asked a precise question. Many people, one fact each, identity, relations.

---

### TC-20 — Identity, rows, relations

**Destination:** Find one person among many. Attach a second fact to them. **PostgreSQL is the ledger**, reached from the **terminal / one-shot tooling** — not from the SPA.

**Prerequisites:** TC-0 → TC-19

**Construction:** Identity. Rows. A table. A relation. **PostgreSQL** because the browser blob cannot be queried without reading everything. Work happens in `psql` (or equivalent). The React desk **still** reads `localStorage`. Two books exist; that tension is named, not secretly wired.

**Forces:** `localStorage` JSON cannot be asked “this person, this fact” without hoping.

**Concepts expected:** identity · row · column · table · relation · foreign key · SQL · ledger vs page store

**Technologies touched:** **PostgreSQL** · SQL · **Spine (CI):** grow TC-18 — CI **boots/migrates Postgres** (service container or equivalent). Ledger work must not be laptop-only.

**Syntax families:** `CREATE TABLE` · `INSERT` · `SELECT` by id · a second table keyed to the first · a migration as the way that schema enters CI

**Production bridge:** **PostgreSQL + SQL** as the ledger. Not an ORM. Not an API.

**Must produce:** Delete a person in SQL; related facts are gone or uninterpretable; the learner can say which. CI brings Postgres up. Notes: the SPA is still the old book.

**Must NOT introduce:** HTTP · a listening Node process · a browser Postgres driver · RLS · an ORM · Drizzle · wiring the desk to SQL · `SELECT *` as the product query forever

**Exit capability:** Explain why a table is a construction without being told “we’re learning SQL.” Can say the desk does not yet see this ledger.

**Next pressure:** A painted row (or a leftover localStorage person) is a different product from a query.

---

### TC-21 — Query is the only source (of the ledger)

**Destination:** The **ledger** is only what the query returned. An empty table is honest. The SPA is **not** this ledger yet.

**Prerequisites:** TC-0 → TC-20

**Construction:** Query as the only source of the book-in-Postgres. Seeds — a reasonable count, not a fake world. Proven from the terminal: `SELECT` after removing the seed is empty. **Do not** make the React desk query Postgres (no process boundary yet). Name the second book in `localStorage` as a lie-in-waiting, not as the law of this cycle.

**Forces:** A painted person is a different product (Hub failure mode). Data-in-tables must be lived **on the ledger** first. Pretending the SPA already shows the query would smuggle TC-27.

**Concepts expected:** query · seed · empty state (honest) — of the *table*, not yet of the *desk*

**Technologies touched:** Postgres · SQL · CI already booting Postgres

**Syntax families:** the select that *is* the book · a seed file

**Production bridge:** Data-in-tables as **ledger** law. The same law becomes the **desk** law at TC-27, when a conversation exists.

**Must produce:** Remove the seed; `SELECT` is empty. If a SQL script still invents a person, a second book was invented. Notes state: the SPA may still show localStorage people — that is **not** this ledger.

**Must NOT introduce:** HTTP · wiring the desk to Postgres · Hub · “just for the screenshot” rows in SQL

**Exit capability:** Will not paint a person into the ledger to finish a plate. Can say the desk is not yet a view of this query.

**Next pressure:** Application caution is not a constraint. Two writers will disagree.

---

### TC-22 — Constraints

**Destination:** The ledger refuses impossible facts.

**Prerequisites:** TC-0 → TC-21

**Construction:** Unique, not-null, foreign keys. A migration file as the way the schema changes (rudiment).

**Forces:** Two writers will disagree. Application code that “tries to be careful” is not a constraint.

**Concepts expected:** constraint · `UNIQUE` · `NOT NULL` · foreign key · schema as law · migration (create-time)

**Technologies touched:** PostgreSQL · SQL · GitHub Actions already owned (ledger invariant on push)

**Syntax families:** `ALTER` / `CREATE` with constraints · a migration

**Production bridge:** Migrations as the way a schema changes.

**Bridge proof:** Insert the illegal row through SQL. The database refuses.

**Must produce:** At least three refusals the application did not have to remember. **CI encodes at least one:** insert the illegal row; the job goes red if the database accepts it. Postgres is already in CI (TC-20); this cycle adds **ledger invariants**, not “first database.”

**Must NOT introduce:** Drizzle · “ORM will handle this” · HTTP · the SPA as the thing that “handles” constraints

**Exit capability:** Name which constraint failed from the error. Add one without being told “add a unique index.” A push proves a refusal.

**Next pressure:** Two writes that must both happen or neither.

---

### TC-23 — Transactions

**Destination:** Several writes become one fact. Partial success is a bug.

**Prerequisites:** TC-0 → TC-22

**Construction:** A transaction. Commit. Rollback.

**Forces:** Two inserts without a transaction can orphan a row.

**Concepts expected:** transaction · atomicity · commit · rollback · isolation at useful grain

**Technologies touched:** PostgreSQL · SQL

**Syntax families:** `BEGIN` / `COMMIT` / `ROLLBACK`

**Production bridge:** Fluency in the mechanism production tools wrap.

**Must produce:** Force a failure after the first write; with a transaction the first write is gone.

**Must NOT introduce:** distributed transactions · an ORM hiding the transaction

**Exit capability:** Say what “atomic” meant on *this* ledger.

**Next pressure:** Correct and slow. Also: changing a populated schema is not `CREATE TABLE`.

---

### TC-24 — Indexes, plans, N+1, pools

**Destination:** Reason about how a query will be answered.

**Prerequisites:** TC-0 → TC-23

**Construction:** An index earned by a query. `EXPLAIN`. An N+1. A connection pool.

**Forces:** Ten rows hide the lie.

**Concepts expected:** index · query plan · N+1 · connection pool

**Technologies touched:** PostgreSQL · SQL

**Syntax families:** `CREATE INDEX` · `EXPLAIN` / `EXPLAIN ANALYZE` · join or `IN` instead of a loop

**Production bridge:** Operations literacy for data.

**Must produce:** Plan before and after an index. An N+1 (a loop of queries in a **one-shot script**, not a secret HTTP client) and its repair.

**Must NOT introduce:** Drizzle yet · an HTTP server to “have a desk query path”

**Exit capability:** Read a simple plan well enough to say why a query is expensive.

**Next pressure:** Existing *rows* make the next schema change different from creating a schema. Also: `SELECT * FROM people` is not a book.

---

### TC-25 — Schema evolution

**Destination:** Existing data makes schema changes a different construction from creating a schema.

**Prerequisites:** TC-0 → TC-24

**Construction:** A required column (or equivalent) on a table that already has many rows. You cannot simply add `NOT NULL`. **Backfill. Dual-compatible period. Constraint later.** Expand/contract.

**Forces:** `phone_country` must become `NOT NULL` on 50,000 people. `ADD CONSTRAINT` on empty theory is a toy.

**Concepts expected:** backfill · expand/contract · dual write / dual read as needed · migration safety · locking a hot table at useful grain

**Technologies touched:** PostgreSQL · SQL · migrations

**Syntax families:** nullable add → backfill → tighten · a reversible-enough migration the learner can explain

**Production bridge:** Production database engineering — not a phrase under “migration safety.”

**Bridge proof:** Apply the unsafe “just add NOT NULL” on a copy; show it fail or lock. Then do it the long way. Rows survive.

**Must produce:** A populated table evolved. Notes name the dual-compatible window.

**Must NOT introduce:** Drizzle as a way to skip the SQL · a 50k-row fake world denser than needed (enough rows that the naive constraint fails is enough)

**Exit capability:** Refuse “just add the constraint” on a live table, and perform expand → backfill → constrain.

**Next pressure:** String SQL at the TypeScript boundary repeats the shape by hand — now that SQL is actually known.

---

### TC-26 — Drizzle

**Destination:** A typed production abstraction over SQL the learner can still see.

**Prerequisites:** TC-0 → TC-25

**Construction:** Recreate owned queries with **Drizzle** in a **one-shot Node script** (toolchain host, TC-10 — not a listening server). One query both ways.

**Forces:** Hiding SQL behind a magic ORM would undo TC-20–25.

**Concepts expected:** schema-in-code · typed query · SQL-like ORM · emitted SQL

**Technologies touched:** **Drizzle ORM** · PostgreSQL · TypeScript · Node as **toolchain host** (script, not product)

**Syntax families:** Drizzle schema · owned select/insert · reading emitted SQL

**Production bridge:** **Drizzle.**

**Bridge proof:** Point at emitted SQL. Drop to SQL once. The script is not an API.

**Must produce:** The same ledger queries, typed. Types refuse a wrong column. The SPA is still not this ledger.

**Must NOT introduce:** “never write SQL again” · `app.listen` · `fetch` from the desk to Postgres · pretending Drizzle *is* the server

**Exit capability:** Look through Drizzle and see the SQL. Can say this process is a tool, not the product.

**Next pressure:** Two programs do not share memory. The desk cannot honestly be a view of this ledger until something **listens**.

---

## Epoch 4 — Ask / answer

### TC-27 — The process is the product

**Destination:** A process that is not the browser **is the application**. Raw request/response. **Node as application runtime.** Only now may the desk honestly be a live view of the ledger.

**Prerequisites:** TC-0 → TC-26

**Construction:** A Node HTTP listener. Request. Response. The desk calls it with `fetch`. SQL on the **server** side of that conversation. **Data-in-tables becomes the desk law:** remove the seed; the desk goes empty. Discard `localStorage` as the book (or leave it as a named leftover you refuse to read). **Spine (systems):** PID, **port**, env, stdio, signal. `localhost:PORT` is not an incantation. **Spine (network):** host, port, loopback. **Spine (Compose):** Vite + app process + Postgres is already multi-process. **Docker Compose begins here as dependency/local-system orchestration — Postgres + API.** Not a Docker class. Redis/worker grow the **same** file at TC-42. **Spine (CI):** DB is already in CI (TC-20–22). This cycle **adds API integration** to that workflow.

**Forces:** Two programs do not share memory. Toolchain-Node built software. This Node *is* software. A weird “SPA talks to Postgres” architecture would have been a lie to preserve cycle order.

**Concepts expected:** process · application runtime · server · request · response · HTTP · status · JSON payload · PID · port · bind · env · compose service (Postgres + API)

**Technologies touched:** **Node.js (application runtime)** · raw `node:http` · PostgreSQL · `fetch` · **Docker Compose** (Postgres + API only) · GitHub Actions grown to hit the API

**Syntax families:** listen · read URL/method · write status and body · `fetch` · **Spine (JS/TS):** `async`/`await`, `Promise<T>` · `curl` once as a second client · a small `compose.yaml` for Postgres + the API process

**Production bridge:** **Node as product.** Compose as *start the local system*, not as the shipping artifact. Hono is TC-28.

**Bridge proof:** Kill the Node **app** process; Vite can still start; the **book on the desk** is gone. Kill Vitest; the product remains. Remove the seed; the desk is empty — if it is not, a second book was invented. `compose up` starts Postgres + API without a remembered `psql` ritual as the method.

**Must produce:** One GET the desk needs, from the ledger. Empty seed → empty desk. Compose for Postgres + API. CI proves an API+DB path (not first-time Postgres).

**Must NOT introduce:** Hono yet · 90 routes · auth · Next.js · `useState` as the book’s cache · Redis · a production image (TC-64) · browser-to-Postgres

**Exit capability:** Describe an API as a conversation between constructions that do not share memory. Write the ask with `fetch` and a raw Node listener. Say what a process dying means. The desk shows only what that conversation returned.

**Next pressure:** Raw `http` will be rewritten by hand for every route.

**Security attach:** XSS if rendering untrusted strings. SQL injection if concatenated input.

---

### TC-28 — Hono, and logs that are data

**Destination:** The same conversation in the production server framework. **Structured application logs** exist before tracing.

**Prerequisites:** TC-0 → TC-27

**Construction:** Rebuild the route on **Hono**. Routing, context, a little middleware. **Pino** (or equivalent) JSON logs with request ids — not `console.log` prose. OpenTelemetry is later correlation, not the logger.

**Forces:** Remaining on raw `http` is refusing the abstraction. TC-67 cannot correlate logs that do not exist.

**Concepts expected:** router · middleware · context · structured log · log level · correlation / request id

**Technologies touched:** **Hono + Node** · **Pino** (or equivalent) · TypeScript · Postgres/Drizzle

**Syntax families:** `app.get` / `app.post` · `c.json` · one middleware · a JSON log line the learner can grep

**Production bridge:** **Hono** + **Pino (or equivalent).**

**Bridge proof:** Point each Hono piece at raw request/response. Remove Pino; say what you lost that `console.log('oops')` never gave you.

**Must produce:** The desk talking to Hono. One middleware. Structured logs for ask and error. The TC-27 Compose file still starts Postgres + API (the API process is now Hono) — do not rediscover Compose.

**Must NOT introduce:** OpenTelemetry yet · OpenAPI yet · GraphQL · auth as a Hono tutorial · Redis · a second orchestrator

**Exit capability:** Write a route and a middleware. Drop to raw HTTP facts when sugar hides a status. Emit a log that is data.

**Next pressure:** TypeScript disappeared at the wire.

---

### TC-29 — Runtime validation

**Destination:** Untrusted input is parsed. Types at the boundary are inferred from a schema that still exists at runtime.

**Prerequisites:** TC-0 → TC-28

**Construction:** **Zod** at the HTTP boundary. Infer TS from the schema.

**Forces:** TC-12’s types are erased. `as Person` is a lie.

**Concepts expected:** runtime validation · schema · parse vs infer · `unknown` · type guard

**Technologies touched:** **Zod** · Hono · TypeScript

**Syntax families:** Zod schema · `parse` / `safeParse` · `z.infer<>`

**Production bridge:** **Zod.**

**Bridge proof:** Illegal JSON refused. Inferred type matches schema.

**Must produce:** Boundary validation on the ask and on one write.

**Must NOT introduce:** Zod as a replacement for SQL constraints · a form library yet

**Exit capability:** Say why TypeScript was insufficient at the wire.

**Next pressure:** `fetch` + `useState` for the book is a second cache that lies.

---

### TC-30 — Server state

**Destination:** Client owns UI state. Server owns the book.

**Prerequisites:** TC-0 → TC-29

**Construction:** **TanStack Query** for the list and the write. Invalidate after mutation.

**Forces:** `useState` + `useEffect(fetch)` duplicates TC-7 for information the client does not own.

**Concepts expected:** server state · cache · invalidation · mutation · query key

**Technologies touched:** **TanStack Query** · React 19 · `fetch` / Hono

**Syntax families:** `useQuery` · `useMutation` · query keys · invalidation

**Production bridge:** **TanStack Query.**

**Bridge proof:** Client state (selection) vs server state (rows). Mutate; list updates because of invalidation.

**Must produce:** The book comes from the query cache.

**Must NOT introduce:** Redux as the book · OpenAPI yet · MSW yet

**Exit capability:** Say why a `useState` for the book is a lie.

**Next pressure:** The conversation has no published contract.

---

### TC-31 — Contract

**Destination:** The API is a document another program can consume.

**Prerequisites:** TC-0 → TC-30

**Construction:** Resources and verbs honestly. **OpenAPI** for owned routes.

**Forces:** Informal JSON is a hallway conversation.

**Concepts expected:** REST as this conversation uses it · resource · contract · OpenAPI

**Technologies touched:** **OpenAPI** · Hono · Zod if it already matches

**Syntax families:** OpenAPI description of existing routes

**Production bridge:** **OpenAPI.**

**Bridge proof:** Change a field in the route xor the contract; name the lie.

**Must produce:** A contract file that matches the running API.

**Must NOT introduce:** GraphQL as a detour

**Exit capability:** Publish and consume a contract for routes they already run.

**Next pressure:** Tests that hit the live net are a dependency, not a proof. Also: `SELECT *` through this contract is still not a book.

---

### TC-32 — The network as a test double

**Destination:** Tests do not depend on the live net.

**Prerequisites:** TC-0 → TC-31

**Construction:** **MSW** for desk tests. Grow CI if needed so these tests run on push.

**Forces:** CI that needs a live API, or tests that skip fetch, will not protect the desk.

**Concepts expected:** mock service worker · handler

**Technologies touched:** **MSW** · RTL · Vitest · TanStack Query · Actions already owned

**Syntax families:** an MSW handler · test setup · one error-path test

**Production bridge:** **MSW.**

**Bridge proof:** Change the handler; the UI test follows. Production server is not running.

**Must produce:** Happy path and one network failure, user-visible.

**Must NOT introduce:** Playwright yet

**Exit capability:** Make the network a test construction, and still say what the real conversation is.

**Next pressure:** One GET of everyone will not survive a real book. Filter/sort/page must exist as *one* intention across layers.

---

### TC-33 — The book as a query

**Destination:** Filter, sort, limit, and paginate — one intention crossing SQL, API, contract, client cache, and URL.

**Prerequisites:** TC-0 → TC-32

**Construction:** A list that cannot load everyone. **Stable ordering.** `limit` + **cursor** (or honest keyset; offset only if the learner can say why it is a lie at scale). Filter and sort as query parameters. OpenAPI names them. TanStack Query keys include them. The location (even before RR7, as search params on this face) records them.

**Forces:** `SELECT * FROM contacts` is not production. A consultant book grows.

**Concepts expected:** filter · sort · pagination · cursor / keyset · stable order · query string · query key as cache identity

**Technologies touched:** PostgreSQL · Hono · OpenAPI · TanStack Query · the desk

**Syntax families:** `WHERE` / `ORDER BY` / `LIMIT` + cursor · API query params · Query keys that change with the query · URL state for the same facts

**Production bridge:** Cross-layer list query. Full-text search is **not** required.

**Bridge proof:** Change filter in the URL; the SQL, the API, the cache key, and the desk agree. A second page does not duplicate or skip under a stable order. `SELECT *` is gone.

**Must produce:** Filter + sort + paginated list, all layers named in notes.

**Must NOT introduce:** Elasticsearch · React Router as a requirement yet (search params on this face are enough) · “load more” that is just `SELECT *` in disguise

**Exit capability:** Refuse `SELECT *` as the product query. Point at the same intention in SQL, API, OpenAPI, Query, and URL.

**Next pressure:** One URL, one question. The contact is not the consultant.

---

## Epoch 5 — Two faces, prove the loop, ship a slice

### TC-34 — Two questions, one ledger

**Destination:** A second location in the same React app asks the same table a different question.

**Prerequisites:** TC-0 → TC-33

**Construction:** Two views. One ledger. **React Router 7.** **Spine (network):** origin if faces and API split; CORS as a constraint, not `*`.

**Forces:** One face cannot be both seats without lying.

**Concepts expected:** view · face · ledger · location · route

**Technologies touched:** **React Router 7** · Hono · tables · React

**Syntax families:** a router · two routes · navigation that is a location

**Production bridge:** **React Router 7.**

**Bridge proof:** A field the consultant needs and the contact must not see — constraint is the query, not CSS `hidden`.

**Must produce:** Two faces. Shared ledger. Secret field does not leak.

**Must NOT introduce:** OTP · halt · tokens (TC-35) · Next.js file routing as the first router

**Exit capability:** A desk is a question; the record is not owned by the question.

**Next pressure:** A URL that shows the whole book is the wrong key for the contact.

---

### TC-35 — Token

**Destination:** The contact opens only their seat.

**Prerequisites:** TC-0 → TC-34

**Construction:** A token that means this person, not this program.

**Forces:** Knowing the desk URL is not authorization.

**Concepts expected:** token · authorization as a constraint on which rows a face may ask for

**Technologies touched:** Hono + token check

**Syntax families:** a secret in the path or equivalent · server refusal

**Production bridge:** Constraint on the ask. Consultant sessions are later.

**Must produce:** Steal-the-token thought experiment written.

**Must NOT introduce:** OTP · sessions for consultants · OAuth (TC-54)

**Exit capability:** Explain a token as a constraint, not as “login.”

**Next pressure:** Writes that stay on the contact page are a second book.

---

### TC-36 — One write, two readings

**Destination:** The contact writes. The consultant’s desk changes.

**Prerequisites:** TC-0 → TC-35

**Construction:** One write. Two readings. First close-the-loop.

**Forces:** The meeting did not happen if only one face knows.

**Concepts expected:** write · read · meeting booked as a row

**Technologies touched:** table + both faces + Query invalidation

**Syntax families:** a POST that inserts the row both faces query · Zod at that boundary

**Production bridge:** Fluency of ask/answer.

**Must produce:** Book as contact; name the row and the appearance that must change on the consultant face.

**Must NOT introduce:** live email · halt · enrollment · a walker

**Exit capability:** Close the loop and say which write caused the other desk to change.

**Next pressure:** The write is becoming a real form.

---

### TC-37 — Production forms

**Destination:** A nontrivial form is owned as a construction. **Spine (a11y):** label/control, errors announced as data not `alert()`.

**Prerequisites:** TC-0 → TC-36

**Construction:** The contact write rebuilt with **React Hook Form + Zod**.

**Forces:** Field `useState` will not hold validation, errors, and dirty state.

**Concepts expected:** field state · validation at submit vs change · error as data

**Technologies touched:** **React Hook Form** · **Zod** · React

**Syntax families:** `useForm` · resolver on the owned Zod schema

**Production bridge:** **React Hook Form + Zod.**

**Bridge proof:** Bypass the UI and POST garbage; server still refuses.

**Must produce:** Close-the-loop write through RHF, with a visible validation error that is not `alert()`.

**Must NOT introduce:** a form-builder product · live send · Playwright yet (next)

**Exit capability:** Own a real form without reinventing it. Point at the server schema as law.

**Next pressure:** Unit/RTL/MSW never saw the cookie, the navigation, and both faces in one user motion.

---

### TC-38 — The loop in a real browser

**Destination:** One encoded end-to-end invariant on the close-the-loop path. **Playwright smoke.** Not the late full-system suite.

**Prerequisites:** TC-0 → TC-37

**Construction:** **Playwright** drives: contact writes → consultant sees. Chromium is enough. Wire it into CI (grow TC-18). Keep it small and user-visible.

**Forces:** Routing, auth token, forms, and two faces already exist. Waiting until the ops epoch to first touch e2e would leave the loop unprotected.

**Concepts expected:** end-to-end smoke · browser automation · locator as user-visible grain

**Technologies touched:** **Playwright** · the running Vite + API + DB · GitHub Actions

**Syntax families:** a Playwright spec · locators by role/text · assertion on the other face

**Production bridge:** **Playwright (smoke).** Deepening (multiple processes, browsers, failure paths) is TC-63.

**Bridge proof:** Break the write path; the smoke fails. A CSS-class rename the user does not see must not be what the test loved.

**Must produce:** One e2e path that would have caught a broken close-the-loop. CI runs it.

**Must NOT introduce:** testing every future workflow here · sleep-based flake · dropping Vitest/RTL/MSW

**Exit capability:** Protect a cross-face workflow the way a user experiences it, as a *small* invariant that now exists for the rest of the book.

**Next pressure:** The program still only runs on this laptop.

---

### TC-39 — Someone else’s machine

**Destination:** A small slice runs on someone else’s machine. **Early deploy.** Not full production delivery. **Synthetic / non-sensitive.**

**Prerequisites:** TC-0 → TC-38

**Construction:** Deploy **one web app, one API, one database, one environment.** A URL that is not localhost. Secrets not in git. **Spine (network):** DNS at useful grain for this URL; TLS as “the browser’s lock is a certificate,” not a PKI course. Firm/session auth does not exist until TC-53 — so this slice must not be a pre-auth SaaS.

**Forces:** If first deploy waits until workers, Redis, object storage, staging, CD, and rollback arrive together, too much machinery lands at once. The construction here is: *my program runs where I am not.*

**Concepts expected:** environment · secret · deploy · hosted URL · DNS · TLS as a fact of that URL · synthetic data

**Technologies touched:** **Vercel** (or equivalent) for the web face · a hosted API runtime · managed Postgres · existing app

**Syntax families:** env-specific config · secret references · a deploy the learner did not drag a folder to do

**Production bridge:** **Early deploy.** Full delivery (worker, Redis, object storage, staging, CD, rollback, observability) is TC-66.

**Bridge proof:** Open the URL on a machine that is not the laptop (or a private window after killing local servers). Client still does not contain the DB secret.

**Must produce:** A non-localhost desk against a real environment, *this slice only*.

**Must NOT introduce:** pretending this is production operations · shipping workers/queues here · Kubernetes · **real client data** · **live send capability** · a **sensitive unauthenticated surface** (no secrets, no PII, no “anyone on the internet writes the book”)

**Exit capability:** Can ship a simple **synthetic** slice and say what is *not* yet true of production delivery. Can say why this URL must not be treated as a product.

**Next pressure:** “Tuesday at 9 AM” is about to become a send. That is not an instant until you know where Tuesday is.

---

## Epoch 6 — Time, pursuit, goal

### TC-40 — Time as information

**Destination:** An instant, a timezone, a wall-clock, a duration, and a deadline are different constructions. Tower is temporal; `setInterval` is not time.

**Prerequisites:** TC-0 → TC-39

**Construction:** Store instants in **Postgres `timestamptz`**. Display “9 AM Toronto” vs “9 AM UTC.” A duration. A deadline. DST as a felt failure (a date that skips or repeats an hour). **Intl** and/or date-fns / timezone tooling as warranted. Native `Temporal` is **not** the sole production answer (availability). Do not treat epoch milliseconds in the client as “the time.”

**Forces:** Campaigns, meetings, delayed sends, and retries will lie if “Tuesday at 9 AM” is a string or a local `Date`.

**Concepts expected:** instant · wall-clock / local time · timezone · duration · deadline · `scheduled_at` · `created_at` · UTC storage · DST

**Technologies touched:** PostgreSQL `timestamptz` · `Intl` and/or a date/timezone library as needed · TypeScript

**Syntax families:** timestamptz round-trip · format in a named zone · a duration not stored as a wall clock

**Production bridge:** UTC-in-the-ledger, zone-at-the-edge.

**Bridge proof:** The same instant is 9:00 in Toronto and a different civil time in UTC. A DST boundary does not silently skip a meeting the learner cannot explain.

**Must produce:** A scheduled_at that survives a timezone change in display. Notes distinguish instant vs civil time vs duration.

**Must NOT introduce:** the tick/worker yet (TC-41) · Temporal-only as a mandate · storing local strings as truth

**Exit capability:** Refuse “Tuesday at 9 AM” without a zone. Point at what the database stored vs what the desk showed.

**Next pressure:** Something must *happen* later, not only be *recorded* as later.

---

### TC-41 — Time as a cause

**Destination:** Something happens later, not only when someone clicks.

**Prerequisites:** TC-0 → TC-40

**Construction:** A control that means “time passed.” A loop that checks due rows (`scheduled_at`). In-process timer is correct. Due-ness uses TC-40’s instants.

**Forces:** “Send” is always now. Pursuit cannot exist.

**Concepts expected:** tick · worker / loop · schedule · due

**Technologies touched:** Node **application** process · in-process timer — not a production queue

**Syntax families:** a timer or tick action · a due query against timestamptz

**Production bridge:** **Not this cycle.** Feel why the in-process timer is not enough.

**Must produce:** If the process dies, say what still works and what quietly never happens again.

**Must NOT introduce:** Redis · BullMQ · live SMS · cron products

**Exit capability:** Treat time as a cause. Name the failure mode of the in-process tick.

**Next pressure:** Restart loses “later.” Two instances double-send.

---

### TC-42 — Durable work

**Destination:** Work outside a request survives process death. **Compose grows:** the TC-27 file (Postgres + API) gains **Redis + worker**. CI understands worker/Redis as needed.

**Prerequisites:** TC-0 → TC-41

**Construction:** Jobs on **Redis + BullMQ**. Retries, backoff, idempotency. Add services to the **existing** Compose file — do not invent Compose here. Production image layering remains TC-64.

**Forces:** The learner has felt why the timer was insufficient. Redis + worker are new processes; orchestration already existed for Postgres + API.

**Concepts expected:** queue · job · worker process · retry · backoff · idempotency · **Spine (systems):** a worker dying is a process dying

**Technologies touched:** **Redis** · **BullMQ** · Docker Compose **already owned** · Node · GitHub Actions grown if a job invariant belongs on push

**Syntax families:** enqueue · worker handler · retry/backoff · idempotency key · compose services for Redis + worker added to the existing file

**Production bridge:** **Redis + BullMQ.** Compose fluency continues (growth, not discovery).

**Bridge proof:** Kill the API process; the job still exists to run. `compose up` still starts the system — now including Redis + worker. Point at the in-process timer and say what it could not do. Point at TC-27 Compose and say what was added.

**Must produce:** A due reminder after restart. A failure that retries. Notes: this is not a production image lesson.

**Must NOT introduce:** live Twilio as the job body · Kubernetes · multi-stage image fluency (TC-64) · a second compose stack as a personality

**Exit capability:** Explain why the timer was insufficient. Make a job idempotent. Grow Compose instead of rediscovering it.

**Next pressure:** One later send is not a mission.

---

### TC-43 — Attempt ownership

**Destination:** One person, one attempt, one owning channel.

**Prerequisites:** TC-0 → TC-42

**Construction:** Ownership. A ladder. Send may still be a row that means we would have sent.

**Forces:** Shouting on every medium at once lies.

**Concepts expected:** attempt · channel · ownership · ladder

**Technologies touched:** tables · the durable worker

**Syntax families:** the write that changes owner · the job that consults it

**Production bridge:** Domain fluency.

**Must produce:** Two channels must not send at once.

**Must NOT introduce:** live Twilio/Resend · faceless tick workflows

**Exit capability:** Keep one owner and move the owner for a reason.

**Next pressure:** Time will keep escalating after success unless a goal can stop this attempt.

---

### TC-44 — Binary goal

**Destination:** The goal was met — stop this attempt. A goal is a write.

**Prerequisites:** TC-0 → TC-43

**Construction:** Binary completion pointed at a real write.

**Forces:** Captions are not goals. Time does not know success.

**Concepts expected:** objective / goal as binary event · completion table

**Technologies touched:** the close-the-loop write reused · the worker

**Syntax families:** the check the job runs · the stop

**Production bridge:** None new.

**Must produce:** Meet the goal; fire the job; no further send for this campaign.

**Must NOT introduce:** a qualify node · next-campaign sequencing (TC-45)

**Exit capability:** Point at the write that stopped pursuit.

**Next pressure:** One campaign cannot be two objectives.

---

### TC-45 — Sequence ⊃ campaigns

**Destination:** After this goal, the next campaign, or it ends.

**Prerequisites:** TC-0 → TC-44

**Construction:** Sequence contains campaigns. Each campaign has one objective.

**Forces:** Two objectives in one campaign are unsayable.

**Concepts expected:** sequence · campaign · objective · escalation

**Technologies touched:** tables · **Spine (TS):** if three write types share a relationship, generics have a reason — here or at write-set

**Syntax families:** advancing campaign when objective is met

**Production bridge:** None new.

**Must produce:** Two objectives as one campaign must fail / be unsayable. Then split.

**Must NOT introduce:** Automations canvas · live send · caption-nodes

**Exit capability:** Refuse a qualify node; place the next campaign instead.

**Next pressure:** Pursuit is hardcoded.

---

## Epoch 7 — When → do → handle → data

### TC-46 — When → do

**Destination:** When a write of a certain kind happens, do one named thing.

**Prerequisites:** TC-0 → TC-45

**Construction:** Event → action. Hardcoded is correct. Hear ≠ start now.

**Forces:** Missions only start because someone enrolled by hand.

**Concepts expected:** event · trigger · action · Automations vs Agents as this split

**Technologies touched:** existing writes + a hardcoded reaction

**Syntax families:** dispatch on a write kind · one action

**Production bridge:** None new.

**Must produce:** Fire twice — what must not happen twice. Fire a different write — what must not happen at all.

**Must NOT introduce:** a graph editor · React Flow · write-set as a type · a second walker

**Exit capability:** Hear ≠ start now, without a menu that taught the words.

**Next pressure:** The second step needs what the first produced.

---

### TC-47 — Handle / write-set

**Destination:** Two actions in order. The second uses what the first produced. Every write **this run** made.

**Prerequisites:** TC-0 → TC-46

**Construction:** A bundle of writes from this run. Not a field catalog. Not “latest for firm.”

**Forces:** Interleaved runs. Wrong people enrolled.

**Concepts expected:** write-set · handle · run · pick · two doors

**Technologies touched:** walk-in-embryo · `{ table, id, contact_id }` or equivalent · **Spine (TS):** discriminated unions and/or generics

**Syntax families:** passing the list · selecting one write · types that keep the relationship without `any`

**Production bridge:** TypeScript fluency from “three copy-pasted write types.”

**Bridge proof (TS spine):** The generic or discriminated union the construction forced. `Record<string, any>` that enrolls the wrong person is a fail.

**Must produce:** First action writes three rows; second uses one; a fourth is a fail.

**Must NOT introduce:** a field catalog in the client · Hub `lastOutput` · If/Switch (TC-48)

**Exit capability:** Will not guess latest-for-firm. Can type the write-set without erasing shapes.

**Next pressure:** A straight chain cannot mean “only if.”

---

### TC-48 — Fork

**Destination:** Sometimes continue, sometimes take the other path. A condition is not an action.

**Prerequisites:** TC-0 → TC-47

**Construction:** If reads a write. Switch when two sides are a lie. Vitest on which path is taken.

**Forces:** One next step is a lie.

**Concepts expected:** condition · branch · If · Switch (the many-path node — not `⋯` Switch)

**Technologies touched:** the chain · Vitest

**Syntax families:** reading a write’s field · choosing a path

**Production bridge:** Tests on the walker-in-embryo.

**Must produce:** Point the If at the wrong grain; predict; run; a test encodes that.

**Must NOT introduce:** graph as editable data (TC-49) · React Flow

**Exit capability:** Fork on a write, not on a guess. Person-row vs run-row.

**Next pressure:** The chain is in the program.

---

### TC-49 — Chain as data

**Destination:** The operator changes the chain without a code deploy. A walk reads nodes and edges. **One walker.**

**Prerequisites:** TC-0 → TC-48

**Construction:** The chain becomes data. Configured-break. Until-node. Tests protect the walk.

**Forces:** Frozen-in-code operations are a deploy.

**Concepts expected:** graph · node · edge · walk · configured-break · until-node

**Technologies touched:** JSON for the graph · TypeScript walker · Vitest · **Spine (TS):** `never` on an impossible node kind if earned

**Syntax families:** the data shape · visiting nodes · stopping

**Production bridge:** None as a graph library.

**Must produce:** Add a node by changing data, not code. Unconfigured node fails and does not continue. Until-node: downstream has not run.

**Must NOT introduce:** React Flow · a second walker · copying `workflowWalk.ts`

**Exit capability:** Add a step without shipping a function. The walk reads data.

**Next pressure:** Editing JSON is not operating the house.

---

## Epoch 8 — Authoring faces

### TC-50 — Click = configure

**Destination:** An operator desk edits the graph as a list of steps. Click a step to configure it.

**Prerequisites:** TC-0 → TC-49

**Construction:** Selected node. Interior writes back into graph data. List editor. RHF if the interior is a real form.

**Forces:** Raw JSON is not the house.

**Concepts expected:** configure · selected node · interior · list editor (not canvas)

**Technologies touched:** React desk · RHF/Zod as owned

**Syntax families:** selection state · a form that writes node data

**Production bridge:** Configure-as-write.

**Must produce:** `configured === false` fails the walk; configuring lets it continue.

**Must NOT introduce:** React Flow · Agents canvas

**Exit capability:** The canvas (later) is not the walk; configure writes data.

**Next pressure:** A list cannot show a fork.

---

### TC-51 — Spatial canvas

**Destination:** The same graph as a drawing, because a list cannot represent branching.

**Prerequisites:** TC-0 → TC-50

**Construction:** Nodes, edges, handles as a drawing of the **same** data. **React Flow.**

**Forces:** Switch paths are invisible in a list.

**Concepts expected:** canvas · handle (UI) vs handle (write-set) · library as someone else’s construction

**Technologies touched:** **React Flow** (cohort pin) · existing walker

**Syntax families:** mapping graph data to the library · not a second graph

**Production bridge:** **React Flow.**

**Bridge proof:** Draw a path the walk cannot take; say which construction is lying.

**Must produce:** A branching graph that is the same data the walker reads.

**Must NOT introduce:** a second walker · plate-interior encyclopedia

**Exit capability:** The library is an editor for a graph they already had.

**Next pressure:** A mission that starts now is not a fake trigger on this canvas.

---

### TC-52 — Agents as a different authoring

**Destination:** Sequence ⊃ campaigns ⊃ channels, authored on a different face. Enroll now.

**Prerequisites:** TC-0 → TC-51 and TC-45

**Construction:** A second authoring face. Header enroll. Not Publish.

**Forces:** Stuffing “start now” into an event-graph lies.

**Concepts expected:** Agents vs Automations · enroll now · `⋯` Switch (kind) vs Switch (node)

**Technologies touched:** sequence tables + a desk · Router

**Syntax families:** enroll without an event · assign-from-automation remains the other door

**Production bridge:** None new.

**Must produce:** Enroll from the header with no event. Then fire an automation that assigns the same sequence. Name the door twice.

**Must NOT introduce:** live send · Launch/Run/Test as one button

**Exit capability:** Will not mix the words. Will not author a new agent inside Automations.

**Next pressure:** Anyone who can open the page can edit any firm.

---

## Epoch 9 — Tenancy, gates, outside world

### TC-53 — Firm boundary

**Destination:** Two firms, two books, two operators who must not see each other. First-party session, not a vendor.

**Prerequisites:** TC-0 → TC-52

**Construction:** Identity. Session. Firm on every ask. Cookie session. OTP or access link when a bookmarkable secret URL is the wrong shape for a returning consultant.

**Forces:** A contact token is the wrong tool for a consultant who returns tomorrow.

**Concepts expected:** user · session · firm · authentication · tenancy · cookie

**Technologies touched:** auth tables · cookie/session · OTP mailer only as required

**Syntax families:** session check on ask · refusal across firms

**Production bridge:** Sessions/cookies as consultant identity.

**Must produce:** Log in as firm A; ask for firm B’s person; server refuses; desk does not paint a stand-in.

**Must NOT introduce:** platform-admin view-as as the first model · OAuth as the first auth (next is contrast) · dual tenancy leftover as “how identity works”

**Exit capability:** Auth is a ledger boundary, not a login-screen tutorial.

**Next pressure:** The rest of the industry will show you Google / Microsoft / Auth0 / Clerk / SSO. You should know the class of mechanism.

**Security attach:** cookie flags, CSRF, session theft, rate limit on login.

---

### TC-54 — Federated identity contrast

**Destination:** An external identity provider asserts identity. Map that assertion onto **our** user/firm boundary. Not auth-vendor tourism.

**Prerequisites:** TC-0 → TC-53

**Construction:** One **OAuth 2 / OIDC** sign-in (a single provider is enough). The session you already own is still the product session. The provider is not the firm ledger.

**Forces:** A product engineer who meets Clerk, Auth.js, Better Auth, or enterprise SSO should recognize the class: federated assertion mapped inward.

**Concepts expected:** OAuth 2 · OpenID Connect · authorization server · ID token / assertion · mapping external subject → internal user

**Technologies touched:** one OIDC provider or a local stand-in that speaks the protocol honestly · existing session tables

**Syntax families:** the callback · storing provider subject on the user · session issuance remains ours

**Production bridge:** **OIDC contrast.** Not a Clerk course. Not six vendors.

**Bridge proof:** Remove the provider; first-party session auth still makes sense as TC-53. The firm boundary is still our table. Notes name what the provider asserted vs what we authorized.

**Must produce:** Sign in via the provider; land in firm A; still cannot read firm B.

**Must NOT introduce:** replacing TC-53 with a vendor as the only auth · social-login gallery · “enterprise SSO product tour”

**Exit capability:** Look at a vendor auth widget and say: assertion in, our session and firm out.

**Next pressure:** A send that can leave the building has no gate.

---

### TC-55 — May send

**Destination:** A send that can leave, and a way to forbid it. Live ports last.

**Prerequisites:** TC-0 → TC-54

**Construction:** Consent. Halt. Send mode. Then **Twilio + Resend** after gates exist.

**Forces:** Dry-run rows are no longer honest once a provider exists.

**Concepts expected:** consent · halt · live vs dry-run · idempotency of send

**Technologies touched:** **Twilio** · **Resend** · consent/halt tables · the worker

**Syntax families:** the gate on the send path · halt blocking **new** enrollments · SDK only on the worker side

**Production bridge:** **Twilio + Resend.**

**Bridge proof:** Opt out; tick; no live send. Retry does not double-send. Credentials not in the client.

**Must produce:** One real send on a test destination, and one forbidden send.

**Must NOT introduce:** warmup pools · Meta · sending from React

**Exit capability:** Forbid a send and show the row that forbids it.

**Next pressure:** The outside world writes back.

---

### TC-56 — Webhooks

**Destination:** Ingest an event the outside emitted. Verify. Retry is safe.

**Prerequisites:** TC-0 → TC-55

**Construction:** Signed webhook. Signature check. Idempotency key.

**Forces:** Providers speak in webhooks. Polling is the in-process timer mistake again.

**Concepts expected:** webhook · signature · replay · idempotency

**Technologies touched:** Hono · ledger · the provider’s signing scheme

**Syntax families:** raw body + signature header · reject bad signatures · upsert-by-event-id

**Production bridge:** Real webhook ingestion.

**Bridge proof:** Replay; one apply. Tamper; reject.

**Must produce:** An outside-shaped payload that becomes a write both faces can read.

**Must NOT introduce:** a second walker

**Exit capability:** Verify, retry, not double-apply.

**Next pressure:** One button that “does the automation” conflates specimen writes, a walk, and a subscription.

---

### TC-57 — Three ignitions

**Destination:** Test data on the trigger. Run walks now. Launch arms and must not walk.

**Prerequisites:** TC-0 → TC-56

**Construction:** Three ignitions. Event-test contract as **tables**.

**Forces:** Launch that walks ruins the world. Run without writes is a guess.

**Concepts expected:** Test · Run · Launch · until-node as ignition · event-test contract

**Technologies touched:** equivalent of `event_write_set` / `event_test_data` · the one walker

**Syntax families:** activate without walk · walk with payload writes · run-to-here

**Production bridge:** Three named ignitions, not one “play” button.

**Must produce:** Launch; do not Run; nothing walks until a real event. Run-to-here; downstream has not run.

**Must NOT introduce:** a Test *tab* · a second walker

**Exit capability:** Refuse a single “do the automation” button.

**Next pressure:** The walk cannot fetch, judge from tables, or pause. Global listen over-fires.

---

### TC-58 — Get, Rule, Wait

**Destination:** Fetch existing records; evaluate a rule whose rows live in a table; wait for time or a person.

**Prerequisites:** TC-0 → TC-57

**Construction:** Get as a query that becomes writes. Rule as data. Wait as park / resume.

**Forces:** Hardcoded judgment is a deploy. The walk cannot pause.

**Concepts expected:** Get · Rule · Wait · park / resume

**Technologies touched:** same walker · rule table · wait row · the queue for resume-later

**Syntax families:** Get → writes on the handle · rule rows · wait then continue

**Production bridge:** Tests must cover fetch / judge / pause as separate invariants.

**Must produce:** Change a rule row; next walk judges differently. Approve a wait; only then downstream runs.

**Must NOT introduce:** a second walker · a SPA rule catalog

**Exit capability:** Tell fetch / judge / pause apart.

**Next pressure:** “Any form” over-fires.

**Split flag:** If Get, Rule, and Wait are three unfelt constructions in validated TC-57 work, split before generating.

---

### TC-59 — Local vs Global

**Destination:** This form / this objective / this campaign — not every event of that kind.

**Prerequisites:** TC-0 → TC-58

**Construction:** Grain. Local axis. Some events have no Local. Still an event.

**Forces:** Global listen over-fires.

**Concepts expected:** Global · Local · grain

**Technologies touched:** trigger grain on existing dispatch

**Syntax families:** local ids on the write and on the trigger

**Production bridge:** None new.

**Must produce:** Submit form B; automation for form A does not walk.

**Must NOT introduce:** “any row changed” as a trigger kind

**Exit capability:** Constrain a listen without being told “add a Local radio.”

**Next pressure:** The house still cannot change evaluation/bind without shipping the walker. Uploads are still pretending to be rows.

---

## Epoch 10 — House, files, framework contrast

### TC-60 — House

**Destination:** The house changes evaluation, binding, sending, and provision without shipping the walker again.

**Prerequisites:** TC-0 → TC-59

**Construction:** Operator modules as panes and controls. Evaluation packs as tables. Bind per firm / default / override.

**Forces:** Pursuit and eligibility still half-program.

**Concepts expected:** house · pane vs control · bind · default / override

**Technologies touched:** tables + operator desk

**Syntax families:** whatever the house modules actually require — no new framework

**Production bridge:** Tower’s open-box construction.

**Must produce:** Point at a module: control or pane? Which table? Change bind without a deploy.

**Must NOT introduce:** Hub as the finish · inventing unspecified stores · rebuilding the book in Next.js

**Exit capability:** Change evaluation/bind from the house and say which table the walker read.

**Next pressure:** A seat must upload a file.

---

### TC-61 — Bytes that are not rows

**Destination:** Upload lives in object storage. The table stores a reference. Access is a signed URL.

**Prerequisites:** TC-0 → TC-60

**Construction:** **S3-compatible** + signed URLs.

**Forces:** Files in `public/`, bytea, or React state will not be the product.

**Concepts expected:** object storage · key · signed URL · grant that expires

**Technologies touched:** **S3-compatible object storage** · signed URLs

**Syntax families:** signed put · store the key · signed get

**Production bridge:** **S3-compatible + signed URLs.**

**Bridge proof:** The database has no file bytes. Expire the URL; access fails. Firm A cannot sign firm B’s key.

**Must produce:** An upload that survives reload and is forbidden across the firm/token boundary.

**Must NOT introduce:** AWS keys in the client

**Exit capability:** Refuse blobs-in-state and blobs-in-Postgres as the store.

**Next pressure:** Next.js in the wild. Meeting it as the first stack would hide the machinery just constructed.

---

### TC-62 — Framework contrast

**Destination:** Reconstruct **one vertical slice** in **Next.js App Router**, as comparison.

**Prerequisites:** TC-0 → TC-61

**Construction:** Same slice already owned on Vite + Hono. `app/`, `page.tsx`, `route.ts`, Server Component, Client Component, Server Function — each pointed at the explicit construction it replaces or hides.

**Forces:** If Next had been first, routing, server execution, data fetching, and the client/server boundary would have been rituals.

**Concepts expected:** App Router · Server Component · Client Component · Server Function · file-system routing

**Technologies touched:** **Next.js App Router** (cohort pin) · the same Postgres

**Syntax families:** the App Router files the slice needs

**Production bridge:** **Next.js — contrast only.** The book is not rewritten in Next.

**Bridge proof:** A table: Vite+Hono fact vs Next fact.

**Must produce:** One working vertical slice. The rest stays on Vite + Hono.

**Must NOT introduce:** “from now on we are a Next shop” · using Next to avoid Hono

**Exit capability:** Compare a framework’s decisions to architecture already understood.

**Next pressure:** Several real pieces work together — worker, queue, live send, webhooks — not only the first loop.

---

## Epoch 11 — The software works

Late cycles **deepen practices already lived**. They do not introduce CI, tests, Compose, or deploy as first encounters.

### TC-63 — E2E of the production system

**Destination:** Playwright becomes serious: multiple processes, browsers, failure paths. The smoke from TC-38 remains.

**Prerequisites:** TC-0 → TC-62

**Construction:** E2E that includes worker/queue (and a send-or-webhook path as dry-run or test provider). Chromium plus a second engine if cheap. Failure: stop the worker; the test says so.

**Forces:** Smoke on two faces is not the whole machine.

**Concepts expected:** e2e of a distributed local system · trace on failure

**Technologies touched:** **Playwright** · Compose stack · CI

**Syntax families:** specs that wait on user-visible outcomes, not sleeps

**Production bridge:** **Playwright (full).**

**Bridge proof:** Worker down → e2e red. Smoke from TC-38 still green on the smaller path.

**Must produce:** One serious path and one failure path.

**Must NOT introduce:** e2e as the only tests

**Exit capability:** Protect a cross-process workflow, including the worker.

**Next pressure:** Compose starts the system. A **production image** is a different construction.

---

### TC-64 — The image is the artifact

**Destination:** Production container fluency: image, layers, build/runtime separation, health. Compose remains how you *start locally*.

**Prerequisites:** TC-0 → TC-63

**Construction:** A **Dockerfile** for the Node app. Multi-stage if it earns it. Non-root if cheap. `HEALTHCHECK` or a health route the platform can hit. Runtime vs build dependencies.

**Forces:** `compose up` with a bind mount is not “what we ship.”

**Concepts expected:** image · layer · build vs runtime · health · artifact

**Technologies touched:** **Docker** · Compose already owned

**Syntax families:** Dockerfile · ignore file · health

**Production bridge:** **Docker as production artifact.**

**Bridge proof:** Run the API from the image without the laptop’s `node_modules`. Point at what Compose was (orchestration) vs what the image is (the unit you could ship).

**Must produce:** An image that serves the API. Notes: early Compose vs this artifact.

**Must NOT introduce:** Kubernetes · a ten-service mesh

**Exit capability:** Package the runtime as an image, and say what Compose is not.

**Next pressure:** The CI system has lived with you since TC-18. It does not yet prove *this* system.

---

### TC-65 — CI proves the full system

**Destination:** The workflow from TC-18 now typechecks, lints, unit/UI tests, MSW, Playwright (smoke + serious as honest), against Compose/services. **Not “discover CI.”**

**Prerequisites:** TC-0 → TC-64

**Construction:** Grow GitHub Actions to the production-shaped stack. Cache. Artifacts on failure (Playwright trace).

**Forces:** Manual full-stack verify is skippable. Phase-1 CI would go green while the worker is a lie.

**Concepts expected:** pipeline stages · service containers / compose in CI · artifacts

**Technologies touched:** **GitHub Actions** · Compose/image already owned

**Syntax families:** the grown workflow · secrets for tests that need them (not production secrets)

**Production bridge:** **Full-system CI.**

**Bridge proof:** Break the worker path; CI fails. A unit-only change still uses the fast jobs.

**Must produce:** A push that proves the system you actually run.

**Must NOT introduce:** CD yet if environments/rollback are unfelt (TC-66) — a dry build-only deploy job is allowed if cheap

**Exit capability:** Every commit proves the full system, not only helpers.

**Next pressure:** Proving is not shipping repeatedly with staging, rollback, and the whole runtime.

---

### TC-66 — Production delivery

**Destination:** Ship the **real** system repeatedly: web, worker, Redis, Postgres, object storage, secrets, staging, CD, rollback. DNS/TLS/custom-domain reality — not merely “here is a URL” (that was TC-39).

**Prerequisites:** TC-0 → TC-65

**Construction:** CD from the pipeline or the platform. Staging vs production. Worker-capable runtime. **Spine (network):** DNS, TLS certificate, maybe a reverse proxy / platform edge, hostnames. Rollback of a bad deploy.

**Forces:** Early deploy was “it runs where I am not.” This is “we can ship the engagement machine without a laptop.”

**Concepts expected:** staging · production · CD · rollback · secret management · custom domain · TLS · reverse proxy / edge at useful grain

**Technologies touched:** **Vercel** (web) · managed Postgres · worker-capable runtime · Redis as hosted or equivalent · object storage · GitHub Actions if it deploys

**Syntax families:** env-per-environment · secret refs · a rollback the learner performs

**Production bridge:** **Full delivery.**

**Bridge proof:** Deploy twice; go back. Staging can break without being production. Early-deploy URL from TC-39 is named as the slice, not this.

**Must produce:** The desk + a worker path in a real environment. A domain/TLS fact the learner can explain.

**Must NOT introduce:** Kubernetes novels · shipping without TC-55 gates

**Exit capability:** Ship the real system repeatedly, with secrets in the environment, and explain DNS/TLS for that URL.

**Next pressure:** A worker/API fails where nobody is staring at a terminal. Logs already exist (Pino). They are not yet traces.

---

### TC-67 — Know why it broke

**Destination:** Correlate the structured logs you already emit. Traces/metrics. Optionally Sentry on the backend.

**Prerequisites:** TC-0 → TC-66

**Construction:** **OpenTelemetry** over Pino/request ids already owned. A trace across API → worker if earned.

**Forces:** OTel is not the application logger. JSON logs without correlation are still a pile.

**Concepts expected:** trace · span · metric · correlation id · (logs you already have)

**Technologies touched:** **OpenTelemetry** · existing Pino · optionally **Sentry** (backend)

**Syntax families:** trace context · an error that appears in the tool with a request/job id

**Production bridge:** **OpenTelemetry** (Sentry if used).

**Bridge proof:** Break a job; find it from logs *and* a trace without SSH-guessing. Point at a Pino line OTel correlated, not replaced.

**Must produce:** One real failure, found from telemetry.

**Must NOT introduce:** a metrics religion · observing instead of fixing the invariant

**Exit capability:** Find a failure they are not watching happen.

**Next pressure:** Finding it is not recovering.

---

### TC-68 — Recover

**Destination:** Health checks, backups, rollback (already tasted at TC-66), retries already owned. The system can come back.

**Prerequisites:** TC-0 → TC-67

**Construction:** `/health` that checks DB (and queue if honest). Backup/restore of Postgres into scratch. **Spine (Git):** revert a commit vs rollback a deploy — name both.

**Forces:** A red trace that ends in “we restored from a teammate’s laptop” is not operations.

**Concepts expected:** health check · backup · restore · rollback · revert · degraded vs down

**Technologies touched:** deployed stack · Postgres backup as the platform provides

**Syntax families:** a health route · a restore actually performed once in non-production

**Production bridge:** Operations fluency.

**Must produce:** A bad deploy rolled back. A restore that still reads a person. Notes: revert ≠ rollback.

**Must NOT introduce:** a fake “we would restore” paragraph

**Exit capability:** Recover a ledger and a deploy.

**Next pressure:** Correct at one user. Slow or down at many. The *desk* can also be slow.

---

### TC-69 — Survive load (data and desk)

**Destination:** Indexes, caching, queues, profiling — and **frontend/browser performance** — used on purpose.

**Prerequisites:** TC-0 → TC-68

**Construction:** A slow list or a hot tick: `EXPLAIN`, cache, or queue as the diagnosis says. **And** an intentionally slow desk: bundle, waterfall, lazy/code-split if earned, render churn, React Profiler, Performance panel, LCP/INP/CLS at useful depth. Measure; fix the actual reason. Not a web-vitals certification.

**Forces:** Feature-complete and unusable is not product engineering. TC-24 was the query. The SPA can still be the reason.

**Concepts expected:** profiling · cache · hot path · bundle · waterfall · code splitting · LCP / INP / CLS at useful grain

**Technologies touched:** Postgres · Redis if earned · Vite bundle analysis as needed · browser Performance + React Profiler

**Syntax families:** a measurement · one server repair · one client repair · before/after

**Production bridge:** Fluency of tools already earned.

**Bridge proof:** Say whether the problem was query, chatty loops, worker, bundle, or render. A cache that can go stale has a named invalidation.

**Must produce:** Two measured improvements if both sides were actually slow — or an honest “the desk was fine; the query was not” with evidence.

**Must NOT introduce:** “add Redis” as a personality · load-test theater without a question

**Exit capability:** Diagnose which layer was slow and apply one repair there.

**Next pressure:** Another engineer cannot work in this repo without a tour.

---

### TC-70 — Another engineer can work in it

**Destination:** Repo boundaries and conventions. Lint/format already exist (TC-13) and already run in CI (TC-18). Workspaces only if pressure is real.

**Prerequisites:** TC-0 → TC-69

**Construction:** README that starts the stack (`compose up`, scripts, CI). **pnpm workspaces** if apps/packages actually need them; **Turborepo** only if orchestration pressure is real.

**Forces:** “Which package do I run” is not construction. A premature monorepo is a bootcamp failure. Mechanical standards should already be automatic.

**Concepts expected:** workspace · package boundary · lockfile · onboarding

**Technologies touched:** **pnpm** · workspaces / Turborepo **only if earned** · ESLint/formatter already owned

**Syntax families:** workspace `package.json` if split

**Production bridge:** Repo as a place another engineer can enter.

**Bridge proof:** Lint already fails CI (from TC-18). A workspace exists only with two real packages.

**Must produce:** An evaluator playing a second engineer can start from the README.

**Must NOT introduce:** a monorepo because “serious repos have one”

**Exit capability:** Mechanical standards automatic; split a package when coordination pressure exists — not before.

**Next pressure:** “The stack changed and I didn’t collapse” is part of the graduation bar and has not been *done*.

---

### TC-71 — The stack changed

**Destination:** One deliberate, meaningful dependency upgrade in the **pinned cohort toolchain**. Not silent drift. Not “always current stable.”

**Prerequisites:** TC-0 → TC-70

**Construction:** Upgrade one real dependency (React, Vite, Hono, Tailwind, or similar — not a patch of a comment). Read the changelog. Fix what broke. Tests/CI catch what they can. Notes: what the abstraction hid, what leaked.

**Forces:** DESTINATION pins a cohort. Six months later a major version exists. TC-42 must not silently regenerate on a different stack than TC-13. Upgrades are amendments — this cycle *practices* one.

**Concepts expected:** changelog · breaking change · pin · lockfile · upgrade as a project

**Technologies touched:** the Construction repo’s actual pins

**Syntax families:** whatever the upgrade requires

**Production bridge:** The graduation clause “when the stack changes, I do not collapse.”

**Bridge proof:** Before/after versions. A test or typecheck that failed mid-upgrade. The system still ships in CI.

**Must produce:** A merged (or PR-ready) upgrade with notes on what broke and why.

**Must NOT introduce:** upgrading everything at once as theater · chasing newest-every-chapter

**Exit capability:** Change a foundational dependency on purpose, prove the system, and say what leaked through the abstraction.

**Next pressure:** Reproduction of this building is not graduation.

---

### TC-72 — Convergence and transfer

**Destination:** Account for current Tower as a **behavioral / architectural** class. Then construct a small product that is not in Tower.

**Prerequisites:** TC-0 → TC-71

**Construction:** (1) Convergence against [`DESTINATION.md`](./DESTINATION.md) — mechanisms, not lockfile archaeology. (2) Transfer: foreign intention; name information / state / relationships / behavior / boundaries / mechanisms **before** writing; choose and wield a stack; **construct it, encode its important invariants, run them in CI, and deploy at least one working environment that is not localhost.** Demonstrate one observable failure or operational signal appropriate to its scope (a log line, a health check, a red CI, a trace — whatever the product actually has). If the product does not need a worker, do not invent one. If it does not need Redis, do not add Redis to pass the exam.

**Forces:** Fluency in one building is not the bar. “I know how I would deploy this” is not shipping. By TC-72 the learner has deployed twice, grown CI, built images, and operated logs.

**Concepts expected:** convergence · transfer · class of system

**Technologies touched:** whatever the transfer product honestly needs from the map — no new fashion

**Syntax families:** whatever the transfer requires

**Production bridge:** Graduation.

**Must produce:** Written convergence. Then a small product not in Tower: tests, CI green on those tests, **a non-localhost URL (or equivalent running environment)**, and one operational signal. “A named deploy path” without a deploy does **not** pass.

**Must NOT introduce:** Hub as the finish · matching Tower’s React 18 / Vite 6 pins · “I would use Next for everything” as a personality · Kubernetes/Kafka/GraphQL as competence theater · inventing Tower’s whole infrastructure for a product that does not need it

**Exit capability:**

```
I can work below the abstraction.
I can work fluently at the abstraction.
I can tell when the abstraction is wrong.
I can debug the system around it.
I can replace it.
I can ship what I built.
I can prove it works.
I can see when it doesn't.
I can change it without fear.
```

Determines what needs to exist. The agent is no longer the source of the construction.

**Next pressure:** None in this map. Remaining gaps: two buckets only.

---

## Amendment log

| Version | Date | Change |
|---|---|---|
| 1 | 2026-10-04 | Initial map. TC-0–35. |
| 1 | 2026-10-05 | Chapter path: `book/epoch-<k>/tc-<n>.md`. |
| 2 | 2026-10-05 | Production Bridge law. TECHNOLOGY-MAP. TC-0–2 stable. ~65 cycles. |
| 3 | 2026-10-05 | Founder review of PR #123. Node toolchain ≠ Node application; Tailwind TC-4 = standalone CLI. CI/lint/Playwright/Compose/deploy as growing practices, not late discoveries. Git, systems, networking, accessibility spines. Time-as-data (TC-40). Pagination vertical (TC-33). Schema evolution (TC-25). OIDC contrast (TC-54). Base UI default. Pino before OTel. Frontend performance (TC-69). Early deploy (TC-39) then full delivery (TC-66). Cohort pin + upgrade exam (TC-71). Audits at TC-72. |
| 3 | 2026-10-05 | **Seams locked.** TC-19 = browser persistence (`localStorage`). TC-20–26 = Postgres ledger from terminal/one-shot; SPA does not talk to it. Desk-as-query operational at TC-27. CI gains Postgres at TC-20–22 (ledger invariants); TC-27 adds API integration. Compose begins TC-27 (Postgres+API); TC-42 grows Redis+worker. TC-39 synthetic/non-sensitive. TC-72 transfer must actually leave localhost. |
