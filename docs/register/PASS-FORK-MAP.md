# Register pass map — the forks behind the pipeline

**What this is.** The relationship between Seed, World, and every register module — read as a *fork map*. Each pass exists because a specific fork was hit; several passes produced a "handmade" doc that resolved the fork. This is the front door for *why the pipeline has the shape it has*, companion to the pass sequence in [`THREE-SURFACE-MODEL.md`](./THREE-SURFACE-MODEL.md) and [`../product/systems-register.md`](../product/systems-register.md).

**Two path reconciliations** (label → real file): `OUTCOMES-CLEAN` → [`OUTCOMES.md`](./OUTCOMES.md); `CAPABILITY-SME-PASS` → the folder [`../sme/capability/`](../sme/capability/) (`CAPABILITY-CONSIDERATIONS.md` + `00-ROSTER.md` + `C1–C7`), not a single file.

---

## Canonical spine

```text
Seed → World → Systems Story → Systems Requirements → (∥ Personas & Function) → bind extrusions (controls + panes) → SME → Enrichment → Furnish → (Priors / Weak / Flows) → Wiring → CT Plant → Translation
```

**Systems-analyst seat** owns **Systems Story → Systems Requirements** (machine track). **Story locks substance** (immutable musts); **Requirements are spec extraction** from Story — not a second invention pass. Outcome↔System and System↔Component maps are **congruence tools after Requirements**, not discovery of the machine. Faces (Personas & Function, controls, panes) run **in parallel** and only **extrude** onto states the machine already requires. Authoritative law: [`SYSTEMS-REQUIREMENTS.md`](./SYSTEMS-REQUIREMENTS.md) · substance: [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md). Pass string also in [`THREE-SURFACE-MODEL.md`](./THREE-SURFACE-MODEL.md).

Wiring here is the **paper** trace (design-invariant, can run ∥ Function once capability handoff exists); the **build** side of wiring (Pass B stand-ins → GO cutover) lands after the CT plant. **CTO primary wiring handoff = Systems Requirements** (extracted from Story); component map is not the handoff.

---

## The handmade fork docs

### 1. Outcomes cleanup — [`OUTCOMES.md`](./OUTCOMES.md)
- **Step:** Personas & Function (outcomes / How subjects); early Seed commitments already set.
- **Fork:** Outcomes were written "As Tower…" — engagement machinery (opt-in → nudge → …) wore a Consultant *outcome* wrapper.
- **Solved:** Lock human subjects only; machinery becomes **leaf requirements**, not fake outcomes — so Function decomposes cleanly.

### 2. Systems Story — [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md)
- **Step:** After World, on the **machine track** (before Requirements). Seat: **systems-analyst**.
- **Fork:** Click-path / How framing buries faceless initiators; the engagement *record* gets mistaken for the system; a thin initiation sketch left “what must the system be able to do?” unmet — so Requirements risked inventing substance.
- **Solved:** Derive twelve systems from Seed + World **alone** as immutable **must / must-not / chain / silence** statements — technology-free; OPERATOR densifiers labeled, not smuggled. **Story locks substance.** Requirements only extract — see §2b.

### 2b. Systems Requirements — [`SYSTEMS-REQUIREMENTS.md`](./SYSTEMS-REQUIREMENTS.md)
- **Step:** Immediately after Systems Story; **hard-gate before** any system↔component bind. Seat: **systems-analyst** (any competent technical professional could extract if Story is finished).
- **Fork:** Story + outcome/component maps were treated as if they *were* the wiring spec. UI (controls/panes) was used — or about to be used — to justify internals. Faceless machine triggers vanished because outskirts maps cannot see them. Requirements were invented as compensation for underbuilt Story.
- **Solved (doctrine):** Tower = machine; UI = controls + panes only — **never adds** system substance. Machine ∥ faces from Seed+World. **Shift name = spec extraction:** Requirements rearrange Story into states, transitions, ramifications — invent nothing Story did not claim. Components bind late as extrusions. Filled specs = next writing pass after Story substance holds.

### 3. Outcome ↔ System map — [`OUTCOME-SYSTEM-MAP.md`](./OUTCOME-SYSTEM-MAP.md)
- **Step:** **Congruence audit after Requirements** (not discovery). Seat: **systems-analyst**.
- **Fork:** Outcomes and systems were written on separate rails — unclear Constrained / Free / Gap and Owned / Faceless at module grain.
- **Solved:** Two-way module-grain scan. **Re-ranked by §2b:** does not invent the machine; checks faces against Requirements once they exist.

### 4. System ↔ Component map — [`SYSTEM-COMPONENT-MAP.md`](./SYSTEM-COMPONENT-MAP.md)
- **Step:** **Gated** until Requirements name states. Seat: **systems-analyst**.
- **Fork:** Story reverse-inferred from screens; priors had no owning system.
- **Solved as outskirts bind:** module ↔ system + priors triage. **Re-ranked by §2b:** premature as discovery; valid only as extrusion bind after Requirements.

### 4b. Controls ledger — [`CONTROLS-LEDGER.md`](./CONTROLS-LEDGER.md)
- **Step:** Face-track inventory (∥ machine track). Seat: **systems-analyst**.
- **Fork:** No single enumerable set of interactive controls (Latticed never filed as a ledger).
- **Solved:** Union Latticed ∪ Weak ∪ Prior. **Re-ranked by §2b:** still outskirts; needs sibling **Panes** ledger; bind to Requirements states only after those states exist — not a path to discover the machine.

### 5. Capability SME pass — [`../sme/capability/`](../sme/capability/) ([`CAPABILITY-CONSIDERATIONS.md`](../sme/capability/CAPABILITY-CONSIDERATIONS.md))
- **Step:** After practice SME (World → SME), before/alongside deep Function hardening.
- **Fork:** The single SME question ("whose knowledge?") returned only **regimes** (CASL, Meta, escrow…). Deliverability and the like vanished into "CTO handles it."
- **Solved:** A second axis — who knows how to *accomplish* it — surfaced ~six capability modules (Sending infra, agent runtime, …) to fold into personas/How before build.

### 6. SME/CTO implementation doctrine — [`../sme/DOCTRINE-sme-cto-implementation.md`](../sme/DOCTRINE-sme-cto-implementation.md)
- **Step:** After Capability + the first Wiring confusion; generalizes Tower failures into standing method.
- **Fork:** The same bottlenecks kept recurring — compliance-skewed SME, CTO as a sink, face vs no-face, catch-all buckets.
- **Solved:** Named the org rules (two SME axes, no "CTO handles it," capability *adds* / compliance *modifies*, the handoff fork, Think Stack, decision constitution) so every later product inherits the fork instead of rediscovering it.

### 7. Wiring method (paper) — [`../wiring/WIRING-METHOD.md`](../wiring/WIRING-METHOD.md)
- **Step:** Wiring (can run ∥ Function once capability handoff exists — doctrine §3/§9).
- **Fork:** Instinct was organize-first (declare flows/triggers/categories), which breaks because **trigger-ness is path-relative**.
- **Solved:** Trace one densified implementation at a time in **event language**; structure accretes; labels are read off later. Also justifies paper Wiring before Design.

### 8. Node definition — [`../wiring/NODE-DEFINITION.md`](../wiring/NODE-DEFINITION.md)
- **Step:** Same Wiring fork — the altitude prerequisite before tracing.
- **Fork:** The graph drifted into code/infra nouns ("Supabase paused") instead of product-state events.
- **Solved:** Node = **named unit of state at event altitude** — keeps paper Wiring design-invariant.

### 9. Click-path densification — [`../sme/implementation/CLICKPATH-DENSIFICATION.md`](../sme/implementation/CLICKPATH-DENSIFICATION.md)
- **Step:** Inside Personas & Function / SME implementation writing — *before* Wiring can eat the leaf.
- **Fork:** Clarity said "use module X"; Wiring was starved for per-control requirements; relationships (who reads what) were invisible.
- **Solved:** Affordance grain + downstream readers → densify is **requirement-gathering for Wiring**, not polish. (Criticality is labeled after.)

### 10. Critical interaction — [`../wiring/WIRING-CRITICAL-INTERACTION.md`](../wiring/WIRING-CRITICAL-INTERACTION.md)
- **Step:** After Densify, when Wiring selects what to connect.
- **Fork:** Fear of enumerating every click; unclear which interactions are load-bearing origins on the graph.
- **Solved:** Critical = a **user-originated interaction whose target is read elsewhere** (dependency test). Connect those; ignore cosmetics. Pairs to Node Definition (state ↔ interaction).

### 11. GO cutover / real ports — [`../wiring/wire-log/GO-CUTOVER.md`](../wiring/wire-log/GO-CUTOVER.md)
- **Step:** After CT plant + Pass B stand-ins; founder accounts live; past paper Wiring / Pass A.
- **Fork:** Stand-ins + fixtures were still the path while Resend/Twilio/DB were actually provisioned — false "wired" vs live.
- **Solved:** Explicit cutover checklist — real ports, Canada SMS gate fix, durable Postgres for CT stores — swap contracts without reopening method.

---

## Extra steps (no standalone handmade MD)

| Extra step | Hangs off | Fork in one line |
|---|---|---|
| **Engagement Manager** | [`../sme/METHODOLOGY.md`](../sme/METHODOLOGY.md) · [`../sme/SME-GRAPH.md`](../sme/SME-GRAPH.md) | Before SME Pass1 — stop minting wrong seats |
| **Priors / Weak** | [`priors/`](./priors/00-INDEX.md) · [`weak/`](./weak/00-INDEX.md) (after Furnish / CT plant) | Controls exist in CT but aren't latticed — inventory the gap |
| **Flows** | [`THREE-SURFACE-MODEL.md`](./THREE-SURFACE-MODEL.md) · `src/app/register/flows/` (after densified How) | Appearance isn't enough — journey proof on CT |
| **Pass A / hand-back** | [`../wiring/external-models/00-PASS-BRIEF.md`](../wiring/external-models/00-PASS-BRIEF.md) · [`HUMAN-ONLY.md`](../wiring/external-models/HUMAN-ONLY.md) (after Wiring Method + densify) | Externals + human residue named so stand-ins don't false-green |
| **Pass B** | [`../wiring/STANDIN-WIRING.md`](../wiring/STANDIN-WIRING.md) (after Pass A) | Wire CT against contracts; fixture honesty |
| **CT plant / Ant** | `src/app/register/prototype-ant/` (after densify + Furnish) | Theory → clickable board (Ant = translate surface) |
| **Translation** | live `/` (after CT verify) | Hi-fi product — not opened by these handmade MDs |

---

## Dependency chain (short)

```text
Seed + World → SYSTEMS-STORY → SYSTEMS-REQUIREMENTS (machine)
Seed + World → OUTCOMES / Personas & Function (faces, parallel)
SYSTEMS-REQUIREMENTS → bind controls + panes as extrusions
  → (optional congruence) OUTCOME-SYSTEM-MAP / SYSTEM-COMPONENT-MAP
  → practice SME + CAPABILITY pass → DOCTRINE
  → DENSIFY → CRITICAL-INTERACTION + NODE-DEFINITION → WIRING-METHOD (paper)
  → Pass A / hand-back → Pass B
  → GO cutover
```
