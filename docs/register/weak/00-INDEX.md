# Register Weak — full-app inventory

**Class:** Weak (own Register class)  
**Companion:** Priors inventory at [`../priors/`](../priors/)

**Definition:** An interactive CT control with a **lattice foothold** (How / SME / Enrichment / Furnish names a parent surface, nearby path, or sibling) but the **control itself is NOT named**. Not invisible. Not Prior. Not Latticed.

**Entry = control.** Purposes empty this pass (`—` / `[]`).

## Method

1. Full CT app scan (plant + Ant translate host)
2. Desk seat → lattice check (How / SME / Enrichment / Furnish / theory twin / surfaceCatalog)
3. Keep only controls where lattice names a parent / nearby / sibling foothold, but **not** this control’s Title Case click-path → Weak
4. Exclude Priors (no foothold), Latticed (control named), and invisible/display-only
5. Dedupe by `id` (one row per control; `where` notes plant / Ant / both)

## Scope

- Full CT: consultant desk, contact desk, operator libraries (Automations / Agents / Audits / Config), operator house / tenancy / support
- No Global CT chrome weaks in this inventory
- Interactive only (commit / open / nav / toggle / …). Skip pure display

## Totals

| Zone file | Twin zones | Count |
|---|---|---|
| [`consultant.md`](./consultant.md) | Consultant | 9 |
| [`contact.md`](./contact.md) | Contact | 2 |
| [`operator-libraries.md`](./operator-libraries.md) | Automations · Agents · Audits | 15 |
| [`operator-house.md`](./operator-house.md) | Operator house | 6 |
| **Total** | | **32** |

**Register twin:** `src/app/register/theory/priors/` (`ALL_WEAK_ENTRIES` in `weakItems.ts`)  
**CTO join:** every entry has `codeRefs[]` → `{ era, file, symbol, locator }` pointing at the concrete plant/Ant control in source.

## Next (not this pass)

1. Purpose pass — click-path language under each Weak  
2. Promote to Latticed (name the control) or leave Weak with documented foothold
