# Register pass map — the forks behind the pipeline

**What this is.** The relationship between Seed, World, and every register module — read as a *fork map*. Each pass exists because a specific fork was hit; several passes produced a "handmade" doc that resolved the fork. This is the front door for *why the pipeline has the shape it has*, companion to the pass sequence in [`THREE-SURFACE-MODEL.md`](./THREE-SURFACE-MODEL.md) and [`../product/systems-register.md`](../product/systems-register.md).

**Two path reconciliations** (label → real file): `OUTCOMES-CLEAN` → [`OUTCOMES.md`](./OUTCOMES.md); `CAPABILITY-SME-PASS` → the folder [`../sme/capability/`](../sme/capability/) (`CAPABILITY-CONSIDERATIONS.md` + `00-ROSTER.md` + `C1–C7`), not a single file.

---

## Canonical spine

```text
Seed → World → Systems Story → Personas & Function → Outcome↔System map → System↔Component map → SME → Enrichment → Furnish → (Priors / Weak / Flows) → Wiring → CT Plant → Translation
```

**Systems-analyst seat** owns Systems Story → Outcome↔System map → System↔Component map: *architects the system* (trigger-first, technology-free, then component-referencing); the CTO later builds/wires it. Authoritative pass string also lives in [`THREE-SURFACE-MODEL.md`](./THREE-SURFACE-MODEL.md).

Wiring here is the **paper** trace (design-invariant, can run ∥ Function once capability handoff exists); the **build** side of wiring (Pass B stand-ins → GO cutover) lands after the CT plant.

---

## The handmade fork docs

### 1. Outcomes cleanup — [`OUTCOMES.md`](./OUTCOMES.md)
- **Step:** Personas & Function (outcomes / How subjects); early Seed commitments already set.
- **Fork:** Outcomes were written "As Tower…" — engagement machinery (opt-in → nudge → …) wore a Consultant *outcome* wrapper.
- **Solved:** Lock human subjects only; machinery becomes **leaf requirements**, not fake outcomes — so Function decomposes cleanly.

### 2. Systems Story — [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md)
- **Step:** After World, before Personas & Function. Seat: **systems-analyst**.
- **Fork:** Click-path / How framing buries faceless initiators ("an IRCC fact moves," "a criteria window elapses," "a live inbound arrives"); the engagement *record* gets mistaken for the system.
- **Solved:** Derive the latent systems from Seed + World **alone** as a web of initiations (trigger → inputs → outputs), technology-free — silences named, never filled. CTO builds/wires later.

### 3. Outcome ↔ System map — [`OUTCOME-SYSTEM-MAP.md`](./OUTCOME-SYSTEM-MAP.md)
- **Step:** After Personas & Function (locked `OUTCOMES.md`), before SME deepens. Seat: **systems-analyst**.
- **Fork:** Outcomes and systems were written on separate rails — unclear which outcomes are Constrained vs Free vs Gap, and which systems are Owned vs Faceless at module grain.
- **Solved:** Two-way module-grain scan (outcome → system, system → outcome). Orphan **controls** stay out of scope (Priors/Weak). Confirms coarse skeleton integrity before SME/Wiring spend.

### 4. System ↔ Component map — [`SYSTEM-COMPONENT-MAP.md`](./SYSTEM-COMPONENT-MAP.md)
- **Step:** After Outcome↔System map, before CTO component wiring. Seat: **systems-analyst**.
- **Fork:** The story was still reverse-inferred from screens — systems didn't point at Register modules/surfaces, and the 111 Priors had no owning system (correct-bias missing).
- **Solved:** Two-way system ↔ surfaceCatalog Module binding + full Priors triage (Extension / Authorship / Chrome / Parked). Parks halt Gap, unhealthy-threshold watch-item, and inside-system KUs without fake-filling. CTO wiring becomes lookup.

### 4b. Controls ledger — [`CONTROLS-LEDGER.md`](./CONTROLS-LEDGER.md)
- **Step:** After (and correcting) System↔Component map. Seat: **systems-analyst**.
- **Fork:** Module-grain binding failed its own test — there was no single enumerable set of every interactive control (Latticed was never filed as a ledger; only Prior + Weak were).
- **Solved:** One union ledger = Latticed ∪ Weak ∪ Prior. **Does not assign systems** — that join is the next pass. This is the left column the composite map needs.

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
Seed + World → SYSTEMS-STORY
OUTCOMES (clean) → clean Function
SYSTEMS-STORY + OUTCOMES → OUTCOME-SYSTEM-MAP
OUTCOME-SYSTEM-MAP + surfaceCatalog + priors → SYSTEM-COMPONENT-MAP
  → practice SME + CAPABILITY pass → DOCTRINE
  → DENSIFY → CRITICAL-INTERACTION + NODE-DEFINITION → WIRING-METHOD (paper)
  → Pass A / hand-back → Pass B
  → GO cutover
```
