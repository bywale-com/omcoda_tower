# Tower — Systems Requirements (doctrine + placement)

**Seat:** Systems analyst.  
**Status:** Doctrine / placement. Filled machine-spec extraction lives in [`SYSTEMS-REQUIREMENTS-FILLED.md`](./SYSTEMS-REQUIREMENTS-FILLED.md). Interactive, corpus-resolved System Map (data-driven + simulable) at `/system-map` — see [`system-map/`](./system-map/).  
**Provenance:** Founder discovery (2026-08-09): the recent systems-analyst maps were working the **outskirts**; the missing center is the **machine** itself. Refined same day: **Systems Story** locks that machine as immutable musts; **Systems Requirements** is **spec extraction** from Story — not where substance is invented.

---

## 1. The discovery (stated as law)

### 1.1 Tower is the machine

Treat Tower as a large computer (mainframe image): one machine, **N sides** = persona workspaces.

On each side, UI is only two extrusion kinds:

| Extrusion | Job | Does **not** |
|---|---|---|
| **Control** | Injects a **change** into a state that **already exists** in the machine | Create system substance |
| **Pane** | **Displays** a state / status the machine **already has** | Create system substance |

The UI is **complementary, all around**. It is **not** the system.

### 1.2 The system must pre-exist the UI

For a control to change something, or a pane to show something, the **state must already exist** in the system — including the **ramifications** of changing it. Those consequential transitions are specified in the machine **before** (or in parallel with) any ability for a human to press a key.

Components **never add** into the system. They only **touch** or **show** what requirements already named.

### 1.3 Two parallel builds from Seed + World

From Seed + World we build **two things in parallel**, not one pipeline that discovers the machine from screens:

```text
                    Seed + World
                   /            \
                  /              \
     Systems Story →          Personas & Function
     Systems Requirements       (faces / How / CT)
     (the machine)              (controls + panes)
                  \              /
                   \            /
              Bind extrusions only AFTER
              the machine states exist
```

- **Machine track:** what the system must **do** to fulfill its purpose — **nobody present**.  
- **Face track:** workspaces, modules, controls, panes.  
- **Bind** is late and narrow: each control/pane is an extrusion onto an already-required state — not a way to invent the system.

### 1.4 What fails if we skip this

If purpose or architecture is read **out of components**, the product’s purpose has already been diluted.  
Using outcome↔system or system↔component maps to **discover** the internals is **periphery justifying the core** — backwards.

**Concrete proof of the miss:** “someone opens an email” is a **machine trigger** (faceless; no control; no pane). It did not appear in the recent component/controls maps **by structure** — those maps only see outskirts. A Systems Requirements pass is where that class of initiation is native.

---

## 2. Methodical fit against what we already have

Read each existing artifact as **kept**, **re-ranked**, or **gated**. Nothing below deletes prior work; it **reorders obligation**.

### 2.1 Still upstream and necessary

| Artifact | Role under this law | Fit |
|---|---|---|
| [`SEED.md`](./SEED.md) · [`WORLD.md`](./WORLD.md) | Foundation. Both tracks derive from here. | Unchanged |
| [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md) | **Machine substance** — immutable must / must-not / chain / silence statements of what Tower must be able to do; technology-free; Seed+World only. | **Kept and elevated.** Story **locks substance**. Requirements do **not** invent new musts — they **extract** Story into states, transitions, and ramifications. If Story is thin, Requirements will fake discovery; fix Story first. |

### 2.2 Face track (parallel — not the machine)

| Artifact | Role under this law | Fit |
|---|---|---|
| [`OUTCOMES.md`](./OUTCOMES.md) · [`how/`](./how/) · Personas & Function | Human subjects, click-paths, face lattice. | **Parallel track.** Must not be used to invent machine internals. |
| [`CONTROLS-LEDGER.md`](./CONTROLS-LEDGER.md) | Enumerable **controls** (Latticed ∪ Weak ∪ Prior). | **Kept as face-track inventory.** Incomplete vs this law until **Panes** (view-only displays of machine state) are ledgered the same way. Still **not** Systems Requirements. |
| surfaceCatalog / How / Furnish | Vocab and densified faces. | Face track only. |

### 2.3 Outskirts maps — congruence later, discovery never

| Artifact | Role under this law | Fit |
|---|---|---|
| [`OUTCOME-SYSTEM-MAP.md`](./OUTCOME-SYSTEM-MAP.md) | Module-grain outcome ↔ system tags. | **Re-ranked:** useful as a **congruence audit** after Requirements exist — not as a path to discover the machine. |
| [`SYSTEM-COMPONENT-MAP.md`](./SYSTEM-COMPONENT-MAP.md) | System ↔ Register modules + priors triage. | **Re-ranked / gated:** valid only **after** Requirements name the states that controls/panes extrude onto. Doing this **before** Requirements was the backwards step that made email-open invisible. Park further join work until Requirements land. |

### 2.4 Downstream consumers

| Artifact | Role under this law | Fit |
|---|---|---|
| Wiring / CTO Think Stack | Build/wire the machine. | **Primary wiring handoff = Systems Requirements** (extracted from Story). Story is the substance any competent technical professional should be able to formalize; Requirements are that formalization — not a second invention surface. Component map is not the handoff. |
| SME / Enrichment / Furnish | Practice + capability densify on faces; Can’ts on mechanism. | Faces continue; mechanism Can’ts must reconcile to Requirements states, not invent them from UI. |
| CT Plant / Translation | Plant and ship faces. | Still late; must not redefine the machine. |

### 2.5 Where Systems Requirements sits on the spine

**Insert immediately after Systems Story; hard-gate before any system↔component bind.**

```text
Seed → World → Systems Story → Systems Requirements
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            (machine track)                  (face track, parallel)
            Requirements                     Personas & Function → …
                    │                               │
                    └─────────── bind ──────────────┘
                         controls + panes
                         as extrusions only
                         → then Wiring / CTO
```

Authoritative short string (machine-first):

```text
Seed → World → Systems Story → Systems Requirements → (∥ Personas & Function) → bind extrusions → Wiring → CT Plant → Translation
```

Outcome↔System and System↔Component maps remain **optional congruence tools after Requirements**, not spine discovery steps.

---

## 3. What a Systems Requirements document contains (when filled)

Per system named in [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md) (and any analyst-named unconstrained path that must still be a real machine path):

1. **Purpose** — one sentence: what this subsystem exists to fulfill (from Story).  
2. **States** — named machine states (exist whether or not any UI shows them).  
3. **Initiations / triggers** — including **faceless** ones (email opened, criteria window elapsed, reference moved, webhook inbound, clock, …). Nobody required.  
4. **Transitions** — trigger × state → new state.  
5. **Ramifications** — consequential changes that fire because a transition fired (the “already created before the key existed” layer).  
6. **Inputs / outputs** — data the machine consumes/emits (not screen widgets).  
7. **Silences / KUs** — named, not filled (same honesty as Story).  
8. **Extrusion index (late)** — which controls change which states; which panes show which states — **filled only after** states exist; never used to invent states.

Grain: **machine**, technology-light enough to stay design-invariant, hard enough that CTO can wire without reverse-inferring from screens.

---

## 4. Relationship to Systems Story (do not collapse)

| | Systems Story | Systems Requirements |
|---|---|---|
| Question | What must the system be able to do? (substance) | How is that substance formalized for wiring? (spec) |
| Unit | Must / must-not / chain / silence | State → transition → ramification |
| Shift name | — | **Spec extraction** — rearrange Story; invent nothing Story did not claim |
| UI | Explicitly out of scope | Extrusions listed only late, never generative |
| Faceless events | Named as musts when Seed/World seed them (criteria elapsed, reference moved, inbound, …) | Same events as transitions — still native here, not invented here |
| Who can write it | Systems-analyst locks substance | Any competent technical professional *could* extract; systems-analyst usually authors so nothing is smuggled in |
| Status today | **Substance pass landed** | Filled spec + Interactive System Map `/system-map` landed |

**Law:** If a CTO (or any technical professional) cannot write Requirements from Story alone, Story is unfinished — do not “enrich” Requirements to compensate.

---

## 5. Immediate obligations (ordered)

1. **Challenge Systems Story substance** — missing musts, false musts, silences wrongly filled (`SYSTEMS-STORY.md`).  
2. **Extract Systems Requirements** from Story (start with engagement runtime: systems 7, 11, 8, 12 — faceless opens/clicks/windows). Invent nothing.  
3. **Extend the face inventory** with a **Panes** ledger (view-only displays of machine state), sibling to controls — still face track.  
4. **Only then** bind control/pane → required state (replace premature system↔component discovery).  
5. Hand CTO **Requirements** as the primary build surface (Story remains the substance proof).

---

## 6. Related

- Story: [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md)  
- Fork map: [`PASS-FORK-MAP.md`](./PASS-FORK-MAP.md)  
- Pass sequence: [`THREE-SURFACE-MODEL.md`](./THREE-SURFACE-MODEL.md)  
- Premature outskirts (gated): [`OUTCOME-SYSTEM-MAP.md`](./OUTCOME-SYSTEM-MAP.md) · [`SYSTEM-COMPONENT-MAP.md`](./SYSTEM-COMPONENT-MAP.md) · [`CONTROLS-LEDGER.md`](./CONTROLS-LEDGER.md)  
- Face law (control vs view): [`how/00-INDEX.md`](./how/00-INDEX.md) §7  
