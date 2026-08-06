# Register orchestration — fail-closed

Update checkboxes as gates clear. Method reference: omcoda-hq `register-manual/` + skill `omcoda-register`.

---

## Gates

- [x] `seed-complete` → World — [`SEED.md`](./SEED.md)
- [x] `world-complete` → SME — [`WORLD.md`](./WORLD.md) + `admits()` twin
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
| **World** | **Dense, derived from validated Seed** — `WORLD.md` + `world.ts` (seats, facets, admission); awaiting your read before SME |
| Operator revisions | Living shape bets (open box, domain packs, Audit vs compliance, channel DNA) — [`OPERATOR-REVISIONS.md`](./OPERATOR-REVISIONS.md) — not a World pass |
| Console purposes | Holon purpose popovers; validate branch-by-branch (Audit + Activity refined) |
| Personas & Function | How graphs exist (`consultantOnTower`, `towerCoreOutcome`) — surface join pending |
| Wiring | Flow maps exist (login flows) — CTO twin pending |
| Components | Holon tree live |
| SME | **Pass2 + handoff + densified PM implementations CT-planted** — 325 written twins `implementationPlant: planted` (10 NV practice items remain without impl blocks) · ([`../sme/implementation/DENSIFY-LAW.md`](../sme/implementation/DENSIFY-LAW.md)) |
| Enrichment / Furnish | **CT-planted** — 60 Can't Needs closed + 60 Furnish affordances on Register prototypes ([`enrichment/`](./enrichment/) · [`furnish/`](./furnish/)) |
| **Priors** | **Full-app priors inventory** — 111 priors (interactive controls with no lattice click-path); **Weak companion** — 32 weaks (lattice foothold, control unnamed); purposes empty; twin ([`priors/`](./priors/) · [`weak/`](./weak/)) |
| CT Plant | **Board plant pass landed** — How + SME densify + Furnish on consultant / contact / operator prototypes; Wiring deep CT still open |
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
