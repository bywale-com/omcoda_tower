# Register Priors — desk→lattice census

**Class:** Priors (own Register class)  
**Definition:** Interactive controls on the CT desk that exist **prior to / without** a lattice statement (How / SME implementation / Enrichment / Furnish).  
**Entry = control.** Purposes later (empty this pass).  
**Status:** Identification census filed · Register twin + left-panel pass live

## Marks

| Mark | Meaning |
|---|---|
| `latticed` | How / SME implementation / Enrichment / Furnish (or theory twin) names this control |
| `weak` | Lattice names the surface or nearby authorship/inhabit, but not this control |
| `prior` | Control exists on desk; no lattice statement |

## Scope rules

- **Interactive only:** commit / open / nav controls. Skip pure display (chips, static tags, copy).
- **Dedup DS-I + Ant:** one row per control; `where` notes plant / Ant / both.
- **Lattice refs:** `docs/register/how/`, `docs/sme/implementation/`, `docs/register/enrichment/`, `docs/register/furnish/`, `src/app/register/theory/`, `src/app/register/trace/surfaceCatalog.ts`.
- **Not a retrofit:** do not fold Priors into How / SME / Can'ts / Furnish in this pass.

## Module / zone censuses

| Slice | Desk seats (deduped) | File | Listed | Prior |
|---|---|---|---|---|
| Automations | Config libraries → Automation workflows | [`automations.md`](./automations.md) | 37 | 22 |
| Agents · Audits · Activity | Config libraries Agents · Book readiness Audits · Engagement record | [`agents-audits-activity.md`](./agents-audits-activity.md) | 58 | 33 |
| Desk zones | Board · Contacts · Meetings · Prepared · Login · Contact · Operator leftovers · Global CT chrome | [`desk-zones.md`](./desk-zones.md) | 40 (prior+weak) | 30 |
| **Register twin** | All zones above | `src/app/register/theory/priors/` | **135** | **89** (+ 28 weak · 18 latticed) |

**Register twin:** `src/app/register/theory/priors/`  
**Register UI:** left pass **Priors** (after Furnish) · tree by zone · theory pane

## Hottest priors (identification)

- **Launch / Stop** (Automations) · **Launch agent** (Agents)
- **Save / Rename / Share** editor chrome (Automations / Agents)
- **Sort / Inspect / Download records** (Audits)
- **Zoom / Scroll to Today / pane resize / Show reasoning** (Activity)
- **Halt inverses** (Lift / Resume)
- **CT tooling:** DS-I \| Ant toggle · theme · Meetings empty-state demo · Contact Link-state flipper · View as Client

## Next (not this pass)

1. Purpose pass — click-path language under each Prior entry  
2. Weak review — promote / demote  
3. Cosmetic vs critical-candidate probe before extending How
