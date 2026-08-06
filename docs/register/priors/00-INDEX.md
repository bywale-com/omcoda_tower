# Register Priors — desk→lattice census

**Class:** Priors (own Register class)  
**Definition:** Interactive controls on the CT desk that exist **prior to / without** a lattice statement (How / SME implementation / Enrichment / Furnish).  
**Entry = control.** Purposes later (empty).

## Marks

| Mark | Meaning |
|---|---|
| `latticed` | How / SME implementation / Enrichment / Furnish (or theory twin) names this control |
| `weak` | Lattice names the surface or nearby authorship/inhabit, but not this control |
| `prior` | Control exists on desk; no lattice statement |

## Scope rules

- **Interactive only:** commit / open / nav controls. Skip pure display (chips, static tags, copy).
- **Dedup DS-I + Ant:** one row per control; `where` notes plant / Ant / both.
- **Lattice refs:** `docs/register/how/`, `docs/sme/implementation/`, `docs/register/enrichment/`, `docs/register/furnish/`, `src/app/register/theory/`.

## Module censuses

| Module | Desk seats (deduped) | File |
|---|---|---|
| Agents | Config libraries → Agents / Engagement templates (+ Agent workbench) | [`agents-audits-activity.md`](./agents-audits-activity.md#agents) |
| Audits | Book readiness → Audits / Audit run | [`agents-audits-activity.md`](./agents-audits-activity.md#audits) |
| Activity | Client workspace → Engagement record | [`agents-audits-activity.md`](./agents-audits-activity.md#activity) |

**Theory twin:** `src/app/register/theory/priors/`
