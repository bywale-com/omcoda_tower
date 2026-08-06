# Register Priors — full-app inventory

**Class:** Priors (own Register class)  
**This inventory is priors only.** Latticed taxonomy remains out of scope here.  
**Weak companion:** [`../weak/`](../weak/) — controls with a lattice foothold whose control itself is unnamed (32).

**Definition:** An interactive control on the CT desk (plant and/or Ant) with **no** lattice / click-path statement in How, SME implementation, Enrichment, Furnish, or theory.

**Entry = control.** Purposes empty this pass (`—` / `[]`).

## Method

1. Full CT app scan (plant + Ant translate host)
2. Desk seat → lattice check (How / SME / Enrichment / Furnish / theory twin / surfaceCatalog)
3. Keep only controls with **no** click-path statement → Prior
4. Dedupe by `id` (one row per control; `where` notes plant / Ant / both)

## Scope

- Full CT: consultant desk, contact desk, global Register CT chrome, operator libraries (Automations / Agents / Audits), operator house / tenancy / support
- Interactive only (commit / open / nav / toggle / …). Skip pure display
- Stub / unwired / demo flipper controls still count when they are interactive seats

## Totals

| Zone file | Twin zones | Count |
|---|---|---|
| [`consultant.md`](./consultant.md) | Consultant | 42 |
| [`contact-and-ct-chrome.md`](./contact-and-ct-chrome.md) | Contact · Global CT chrome | 12 |
| [`operator-libraries.md`](./operator-libraries.md) | Automations · Agents · Audits | 49 |
| [`operator-house.md`](./operator-house.md) | Operator house | 8 |
| **Total** | | **111** |

**Register twin:** `src/app/register/theory/priors/` (`ALL_PRIOR_ENTRIES`)  
**CTO join:** every entry has `codeRefs[]` → `{ era, file, symbol, locator }` pointing at the concrete plant/Ant control in source.

## Next (not this pass)

1. Purpose pass — click-path language under each Prior  
2. Cosmetic vs critical-candidate probe before extending How
