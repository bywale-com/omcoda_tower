# Register orchestration — fail-closed

Update checkboxes as gates clear. Method reference: omcoda-hq `register-manual/` + skill `omcoda-register`.

---

## Gates

- [x] `seed-complete` → World — [`SEED.md`](./SEED.md)
- [x] `world-complete` → Systems Story — [`WORLD.md`](./WORLD.md) + `admits()` twin
- [x] `systems-story-complete` → Systems Requirements — [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md) (**substance pass** — immutable musts from Seed+World; founder challenge open)
- [x] `systems-requirements-complete` → bind extrusions / CTO machine handoff — [`SYSTEMS-REQUIREMENTS-FILLED.md`](./SYSTEMS-REQUIREMENTS-FILLED.md) + Interactive System Map `/system-map` ([`system-map/`](./system-map/)) — **filled + simulable; founder challenge open**
- [x] `outcomes-locked` → face track — [`OUTCOMES.md`](./OUTCOMES.md)
- [x] `outcome-system-map-complete` → congruence only (after Requirements) — [`OUTCOME-SYSTEM-MAP.md`](./OUTCOME-SYSTEM-MAP.md)
- [x] `system-component-map-complete` → gated outskirts bind — [`SYSTEM-COMPONENT-MAP.md`](./SYSTEM-COMPONENT-MAP.md) (not machine discovery)
- [x] `sme-graph-ready` → Pass1 spawn — [`../sme/SME-GRAPH.md`](../sme/SME-GRAPH.md) · law [`../sme/METHODOLOGY.md`](../sme/METHODOLOGY.md)
- [x] `sme-pass1-locked` → SME Pass2 — combined Pass1+Pass2 per human instruction 2026-07-30 ([`../sme/ROSTER.md`](../sme/ROSTER.md))
- [x] `sme-handoff-ready` → Function ∥ Wiring Function (sync on CROSS-CUTTING) — [`../sme/HANDOFF.md`](../sme/HANDOFF.md) · [`../sme/CROSS-CUTTING.md`](../sme/CROSS-CUTTING.md)
- [x] `function-complete` → Enrichment
- [x] `enrichment-complete` → Furnish
- [x] `furnish-written` → CT plant of Furnish
- [ ] `wiring-synced` → deep CT on cross-cutting surfaces
- [ ] `ct-verify-green` → Translation

---

## Tower-specific status (2026-07-27)

| Pass | Status |
|------|--------|
| Register shell | Left panel restructured to pass order |
| **Seed** | **Validated 2026-07-27** — `SEED.md` §0–§17 (product + ALG + Engine 2 + honesty); Audit/Agents/Automations refinements + channel DNA pointers 2026-07-27 |
| **World** | **Dense, derived from validated Seed** — `WORLD.md` + `world.ts` (seats, facets, admission) |
| **Systems Story** | **Substance pass landed** — 12 systems as immutable must / must-not / chain / silence from Seed+World; Story locks substance — [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md) |
| **Systems Requirements** | **Filled + Interactive System Map** — [`SYSTEMS-REQUIREMENTS-FILLED.md`](./SYSTEMS-REQUIREMENTS-FILLED.md) · `/system-map` ([`system-map/`](./system-map/)) — corpus-resolved, fractal, simulable |
| Operator revisions | Living shape bets (open box, domain packs, Audit vs compliance, channel DNA) — [`OPERATOR-REVISIONS.md`](./OPERATOR-REVISIONS.md) — not a World pass |
| Console purposes | Holon purpose popovers; validate branch-by-branch (Audit + Activity refined) |
| Personas & Function | How graphs exist (`consultantOnTower`, `towerCoreOutcome`) — surface join pending |
| **Outcome↔System map** | **Module-grain scan landed** — 22 outcomes × 12 systems; 1 Gap (Consultant Governance/halt); 0 Faceless — [`OUTCOME-SYSTEM-MAP.md`](./OUTCOME-SYSTEM-MAP.md) |
| **System↔Component map** | **Binding + priors triage landed** — system ↔ surfaceCatalog modules both ways; 111 Priors tagged Extension/Authorship/Chrome/Parked; P1 halt Gap · P2 unhealthy threshold · P3 KUs parked — [`SYSTEM-COMPONENT-MAP.md`](./SYSTEM-COMPONENT-MAP.md) |
| Wiring | Paper Function traces + **Pass A externals** — 67 (47 modelable · 15 human-only · 5 defer); human-only framed with fixtures / by-design vs by-provisioning / sending-identity runbook; control reconciliation ([`../wiring/external-models/`](../wiring/external-models/)) |
| Components | Holon tree live |
| SME | **Pass2 + handoff + densified PM implementations CT-planted** — 325 written twins `implementationPlant: planted` (10 NV practice items remain without impl blocks) · ([`../sme/implementation/DENSIFY-LAW.md`](../sme/implementation/DENSIFY-LAW.md)) |
| Enrichment / Furnish | **CT-planted** — 60 Can't Needs closed + 60 Furnish affordances on Register prototypes ([`enrichment/`](./enrichment/) · [`furnish/`](./furnish/)) |
| **Priors** | **Full-app priors inventory** — 111 priors; **Weak** — 32; `codeRefs` CTO joins ([`priors/`](./priors/) · [`weak/`](./weak/)) |
| **Wiring (stand-ins)** | **Build slice started** — Login OTP + Halt wired ([`../wiring/STANDIN-WIRING.md`](../wiring/STANDIN-WIRING.md) · [`../wiring/wire-log/`](../wiring/wire-log/)). Pass A externals inventory guides Pass B models ([`../wiring/external-models/`](../wiring/external-models/)) |
| CT Plant | **Board plant pass landed** — How + SME densify + Furnish; stand-in wiring + Pass B model build in progress |
| **Prototype cohesion initiative** | **Plan + analysis locked 2026-08-10 — not executing yet** — [`PROTOTYPE-COHESION-PLAN.md`](./PROTOTYPE-COHESION-PLAN.md) · [`PROTOTYPE-COHESION-ANALYSIS.md`](./PROTOTYPE-COHESION-ANALYSIS.md). Product face = CT prototype; live send; Settings/Evaluation modulate modular tables; deferred only Meta / Register & evolution / Escrow |
| **Phase Two (micro-pass tuning)** | **Declared 2026-08-13 — opening now** — founder in-app “I should be able to …” → map → UI component and/or table/field. Thesis: [`PHASE-TWO.md`](./PHASE-TWO.md) · running log: [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md). Seats: [`../README.md`](../README.md) (PM + Systems Analyst). SA log: [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md) |
| Verify scripts | Not shipped |

---

## Anti-pattern check (instant fail)

- [ ] SME is not ~1 consideration per seat (Trim)
- [ ] HowUiRef has `surfaceId` join when CT exists
- [ ] Wiring exists (not a comment)
- [ ] Product owns `docs/register/` (not only omcoda-hq.vercel.app)
- [ ] No Translation before CT verify
- [ ] CT nav follows production principles (no Trim-style clunky module reveal)

---

## Verify (when scripts ship)

```bash
npm run verify-ct-surfaces
npm run verify-sme-implementations   # if present
npx tsx scripts/audit-sme-plant-gap.ts
```
