# Phase Two — micro-pass tuning (founder thesis)

**Status:** Declared 2026-08-13 — Phase Two starts now.  
**Seat:** Founder prompts from inside the live app; agent runs the same methodology at micro scale.  
**Companion:** Phase One spine = [`PASS-FORK-MAP.md`](./PASS-FORK-MAP.md) · machine table law = [`system-map/BUILD-system-map-v2-table-inventory.md`](./system-map/BUILD-system-map-v2-table-inventory.md).  
**Running log:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) — dated additions (newest at bottom). Thesis stays here; talk lands in the log unless marked as a separate entry. **Agents flagship** is the 2026-08-15 15:43 UTC stamp in that log — not the 14:58 numbered list. **App-facing:** [`AGENTS-FACE.md`](./AGENTS-FACE.md) · UI blueprint [`AGENTS-UI-BLUEPRINT.md`](./AGENTS-UI-BLUEPRINT.md) · Automations face [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md) · Automations images [`AUTOMATIONS-UI-BLUEPRINT.md`](./AUTOMATIONS-UI-BLUEPRINT.md) · Contact workspace [`CONTACT-FACE.md`](./CONTACT-FACE.md). **Confirm look (plates, not a packet):** [`WAIT-NOTE-PLATES.md`](./WAIT-NOTE-PLATES.md). Reminder: [`CONFIRM-READY-DEFERRED.md`](./CONFIRM-READY-DEFERRED.md). **Planning (not a packet):** [`LAUNCH-TERRAIN.md`](./LAUNCH-TERRAIN.md) · §1 [`LAUNCH-1-NOTHING-TO-OPT-IN.md`](./LAUNCH-1-NOTHING-TO-OPT-IN.md). **Seats:** Product Manager, Systems Analyst, Engineer — paste prompts in [`docs/README.md`](../README.md). SA log: [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md). PM always-on: [`../../AGENTS.md`](../../AGENTS.md). Engineer paste: PR [#106](https://github.com/bywale-com/omcoda_tower/pull/106) until merged. Packets (how Automations gets built): [`NODE-INTERIOR.md`](./NODE-INTERIOR.md).

---

## Thesis

### Phase One — get most of the app

Phase One is everything up through identifying the systems and crossing into the first machine artifacts (Story → Requirements → System Map → table inventory → materialize → plant/wire/cohesion). It is **not** “systems-first instead of UI.”

**UI-first is still the right build order for Phase One** — you need a face to inhabit. That does **not** mean the system side was optional or postponed forever. Phase One works when:

- the **face track** grows the app you can click, and  
- the **machine track** is planned and locked in parallel (Seed → World → Story → Requirements → map → tables),

so that by the time the plant is dense, there is already a table-first spine to bind to — not a pile of screens with no ledger.

Phase One’s job: **most of the app exists** — structure, desks, machine tables, workers, honesty contracts, major Client Data / Agents / Automations faces.

### Phase Two — flip: tune / prune by micro-passes

Phase Two is the flip. The app is largely there; work becomes **tuning and pruning** — closing what you actually feel missing when you sit in the product.

**Same pass, micro scale.** Founder enters the app and prompts fixes as **use-case scenarios**:

> “I should be able to …”

The agent’s job is to **map** that sentence the way Phase One mapped the whole product:

| If the gap is… | Phase Two produces… |
|----------------|---------------------|
| Missing face / interaction | New or restored **UI component** (control, pane leaf, inspector, chronology chrome, …) bound to existing ledger when possible |
| Missing machine | New **table**, or **field / column / JSONB key / event_kind / denser rows** — same table-first law as System Map v2 |
| Both | Component **and** system write — never chrome that invents Sarah, never a table with no face if the use case needs one |

**Diagnosis rule (keep it binary):** an in-app fix is almost always either a **missing component** or a **missing system** (table / field / write). Run the pass over that grain. Do not invent a third category called “just polish” that skips the map.

Phase Two does **not** throw away Story / Requirements / System Map. It **re-enters** them at the scale of one use case at a time, with the founder’s lived “I should be able to” as the entry door instead of Seed/World alone.

---

## Micro-pass ritual (how we work Phase Two)

For each founder prompt:

1. **Capture the use case** as one or more outcome sentences (“I should be able to view X / do Y”).  
2. **Classify:** missing component · missing system · both · already exists (honesty / deploy / access).  
3. **Map to spine:** which System Map table(s) / Requirements state(s) / existing Ant surface?  
4. **Decide writes:** reuse table · enrich field/payload · new table (rare — justify) · new UI leaf.  
5. **Ship thin vertical:** empty-or-personalized; no demo scenery.  
6. **Log the pass** in [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) (append-only, dated).

Prompt shape the founder will use (canonical):

```text
I should be able to <verb> <object> [when <condition>].
(Optional: seat = consultant | operator | contact | admin.)
```

Agent response shape (canonical):

```text
Use case: …
Class: component | system | both | already-exists
Bind: <table/field or “none — UI only”> · <surface file>
Ship: …
```

---

## Where we are (Phase Two readiness map)

Snapshot so micro-passes have ground to stand on. Update when a pass lands.

### Machine spine (Phase One — keep using)

| Layer | Artifact | Phase Two use |
|-------|----------|----------------|
| Substance | [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md) | Don’t invent musts; name silence if use case exceeds Story |
| Spec | [`SYSTEMS-REQUIREMENTS-FILLED.md`](./SYSTEMS-REQUIREMENTS-FILLED.md) | Name the state the use case touches |
| Table-first law | [`system-map/BUILD-system-map-v2-table-inventory.md`](./system-map/BUILD-system-map-v2-table-inventory.md) | state \| rule \| sequence; modular ⇒ table |
| Inventory / sim | `/system-map` · `src/app/system-map/data/tables.ts` | Find or declare the table |
| Frozen → Postgres | [`system-map/FROZEN-TABLES-v1.md`](./system-map/FROZEN-TABLES-v1.md) · migrations `001–009` | Prefer enrich existing; new table only with freeze discipline |
| Actuation | worker / `cascade.ts` · [`system-map/ACTUATION-REPORT.md`](./system-map/ACTUATION-REPORT.md) | Time/event paths that must write for the use case |

### Product face bind (Phase One late → Phase Two ground)

| Concern | Artifact |
|---------|----------|
| Empty vs demo honesty | [`PLACEHOLDER-REAL-MAP.md`](./PLACEHOLDER-REAL-MAP.md) |
| Hub structures ↔ ledger (not chrome) | [`HUB-STRUCTURE-SYSTEM-BIND.md`](./HUB-STRUCTURE-SYSTEM-BIND.md) |
| Client Data Activity chronology | [`CLIENT-DATA-BIND.md`](./CLIENT-DATA-BIND.md) |
| Hub leaf gaps (what face still thin) | Hub gap maps (PR #76 if merged) · else Plant embed vs Ant rewrite |
| Cohesion initiative | [`PROTOTYPE-COHESION-PLAN.md`](./PROTOTYPE-COHESION-PLAN.md) |

### Desks / seats to probe in Phase Two

| Seat | Primary surfaces | Ledger already dense enough to start? |
|------|------------------|----------------------------------------|
| Consultant | Board, Client Brief, **Client Data** (Information / History / Activity), Meetings, Contacts | Yes on Cedar-class books; thin on Apex-class |
| Operator | Config libraries (Agents / Automations), Bind, Reference, Firm health | Agents Save/Settings + Automations graph mostly wired; depth gaps remain |
| Contact | Access link / portal facts | Access links exist; portal densify still Pass-C class |
| Admin | Consultant ▾ view-as, Operator | OTP/pool fix on main; Cedar has no auth user — view-as / Live-Proof for login |

### Known Phase Two starter gaps (not a backlog promise — orientation)

| Area | Likely class when founder hits it |
|------|-----------------------------------|
| Activity depth vs Hub chrome (zoom tiers, signal icons parity, form replay density) | mostly **component** on existing `engagement_records` / attempts / outbound content |
| CRS History sparse | **system** — denser `fact_writebacks` (or later snapshot table) |
| Email/SMS replay empty on old rows | **system** — content fields exist (`009`); need rows written going forward |
| `form_visit` rare in ledger | **system** — inbound write path |
| Agent Launch / Contacts tabs thin | **both** — enroll list vs template id; Launch already book-bound |
| Automations node-config depth | mostly **component** on `workflow.graph` |
| Login / access to densest firm | **already-exists / ops** — pool, user binding (Cedar has no user) |

---

## Phase Two ledger

Shipped micro-passes and booth notes append in [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) — not here.

---

## What Phase Two is not

- Not a second Seed/World rewrite.  
- Not “embed Hub seeds to look finished.”  
- Not skipping the map because the ask is small.  
- Not only UI and not only schema — always classify.

---

## Index

- **Running log:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md)  
- Phase One forks: [`PASS-FORK-MAP.md`](./PASS-FORK-MAP.md)  
- Gates: [`ORCHESTRATION.md`](./ORCHESTRATION.md)  
- Table-first birth: System Map v2 (`BUILD-system-map-v2-table-inventory.md`) — table-first was a **pass on the map**, not Story-native.
