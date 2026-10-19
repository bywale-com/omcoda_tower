# Downstream passes (Enrichment · Furnish · Wiring · Operator-revisions grade)

Read after the primary spec. These passes exist on the spine; they do not rewrite Seed/World/Story.

## Enrichment (persona Can’ts)

**Source:** `docs/register/enrichment/` — 60 Can’ts (20 Consultant · 20 Operator · 20 Contact).  
**Job:** “Right now I can’t…” design gaps from personas. **Not** SME facts, **not** Wiring Can’ts.

Intended-product implication: Function leaves that were thin get supporting Needs. They do not add outcomes or systems. If a Can’t would require a new World seat or a new Story must, that is a promotion gate — Enrichment must not smuggle it.

Status at SHA: paper + CT plant of Needs on Register prototypes.

## Furnish (supporting affordances)

**Source:** `docs/register/furnish/` — 60 items, CT-planted.  
**Job:** Supporting UI that does **not** change Core Function. Relative click-path. Not pack authorship.

Intended-product implication: chrome around locked outcomes (filters, empty-state honesty, attribution windows). Parametric elimination still applies: prospecting chrome, not placating.

## Wiring method (paper, no-face column)

**Sources:** `docs/wiring/WIRING-METHOD.md` · `NODE-DEFINITION.md` · `WIRING-CRITICAL-INTERACTION.md`

- Connect first, classify later. Trigger-ness is **path-relative**.
- Unit of work = one traced implementation in **event language**.
- **Node** = smallest named unit of state an event can happen to, one layer above its operating language. Noun, not verb. Not “Supabase.”
- **Critical interaction** = a user-originated interaction whose **target is read elsewhere**. Connect those; ignore cosmetics.
- Primary wiring handoff = Systems Requirements (extracted from Story), not the component map.

As-built cutover honesty: `docs/wiring/wire-log/GO-CUTOVER.md` (real CEM/SMS/OTP/Postgres vs stand-in Meta/escrow/enrich/warmup).

CTO Think Stack instance: paper traces exist; capability absorb awaiting human validation (`CAPABILITY-CONSIDERATIONS.md`).

## Operator-revisions grade (not World)

`docs/register/OPERATOR-REVISIONS.md` holds shape bets (domain modularity, open-box, Audit vs compliance, channel DNA, Hub placement as revision). Story labels denser clarifiers **OPERATOR-REVISIONS** and will not extract them as musts until promoted.

This specification already treated Hub-as-revision and domain-modularity (graph holds; packs swap) as **World §2.3 / personas craft**, which Seed+World do support. Attempt **windows** remain unpromoted.

## Priors / Weak

Controls that exist in CT but are not fully latticed. Inventory, not new product identity. Bind to Requirements states; do not discover machine from them.
