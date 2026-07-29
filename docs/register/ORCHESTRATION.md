# Register orchestration — fail-closed

Update checkboxes as gates clear. Method reference: omcoda-hq `register-manual/` + skill `omcoda-register`.

---

## Gates

- [x] `seed-complete` → World — [`SEED.md`](./SEED.md)
- [x] `world-complete` → SME — [`WORLD.md`](./WORLD.md) + `admits()` twin
- [ ] `sme-pass1-locked` → SME Pass2
- [ ] `sme-handoff-ready` → Function ∥ Wiring Function (sync on CROSS-CUTTING)
- [ ] `function-complete` → Enrichment
- [ ] `enrichment-complete` → Furnish
- [ ] `furnish-written` → CT plant of Furnish
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
| SME / Enrichment / Furnish | Stubs — do not start until you say; Seed chairs named |
| CT Plant | Not started — lo-fi click-through placeholder |
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
