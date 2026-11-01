# Pass 1 — Seed confirmation

**Source:** `docs/register/SEED.md` at `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`  
**Law of Seed:** Everything we know, every assumption, every bet — product *and* how they get in. World is derived from this dump. Agents must not invent business facts outside it.  
**Status in-repo:** Validated 2026-07-27. This pass **confirms**; it does not rewrite.

## Product sentence (Seed §0.1)

Immigration firms pay for an always-on system that engages dormant and active contacts, keeps immigration facts fresh through firm→client touchpoints, re-evaluates service eligibility as IRCC-shaped rules and client facts move, and surfaces when someone is campaign-worthy — so consultants book meetings without manually rechecking every file.

Tower is **not** a reactive CRM. It is **proactive eligibility wrapped in engagement**.

**One-line value:** Give us your contacts; we engage them, keep their immigration picture current, and surface when eligibility changes — without manually rechecking every file.

## Growth sentence (Seed §0.2)

Immigration consultancies convert into *running* Tower clients through **ALG** — not sales calls as the primary door, not self-serve onboarding forms — if one tap in a Meta feed makes a prepared campaign workspace legible, cheap public seed inputs provision that workspace, and an agent earns the hard inputs (database authorization + escrow) before the campaign actually runs.

## Money posture (Seed §0.3, §7)

Contingent cost. First ALG money door = **escrow** (firm↔Om Coda). End-clients pay Tower nothing. Credits and sales-call are **not** peer doors at activation. Escrow **release definition is a known unknown**.

## Agent bet (Seed §0.4)

Agent = presentation only (ask / explain / route). Automations and Wiring fulfill: scrape, instantiate, persist, fire, evaluate, OTP, money.

## Core molecular outcomes already in Seed (application language)

- **Core:** Tower automatically detects eligible candidates and initiates a campaign to get them to book a meeting. Eligible = service-eligible. Campaign = launch / nudge / reactivation. Success = meeting booked. Continuously while the firm has contacts and hands-free is armed.
- **Access:** A consultant signs in and lands in their firm workspace.

Later Function rewrote the consultant *outcome* so the consultant's verbs are hand-over · authorize · receive; machinery becomes leaf requirements. That is Outcomes cleanup (fork 1), not a Seed rewrite. Seed DNA stays.

## Core loop (Seed §5)

```
Contacts / import
  → Audit (reachability / sequence-start gate)
  → Standard engagement (opt-in → re-engagement nudges → …)
  → Collect & refresh Client Data via touchpoints
  → Rule engine / Automations (re-evaluate eligibility)
  → Nudges / escalations / reactivation / consultant signals
  → Meeting booked
  → (repeat as facts & rules move)
```

## Doctrine pins (Seed §16) — not dilutable

1. Product bet = always-on eligibility + engagement → meeting booked.
2. Growth bet = ALG Approach → forward-deploy activation → running desk.
3. Activation sets target; acquisition fulfills seed quota.
4. Finish lines are **input sets**.
5. Forward-deploy ∈ activation; click budget ∈ acquisition only.
6. Entry surfaces are product surfaces (Approach).
7. One Approach per acquired non-operator persona.
8. Ad = legibility; never persuade.
9. Nudges = data collection; not spam.
10. Audit = reachability; not sales ceremony.
11. Engine 2: reactivation > nudge; one client, one motion.
12. Agent presents; automation executes.
13. Escrow-only door at activation payment moment.
14. seed → world → acquisition → application → wiring (single Wiring).

## Never invent (Seed §14) — hard stops for this experiment

Public-before-contact end-client eligibility as Core. Agent seat. Full Client operator console. Operator as firm Board login. Credits/sales-call as peer activation doors. DB auth or escrow inside click budget. Forward-deploy as acquisition. Skip client opt-in because ALG. Cold email V1 Approach. Escrow as the only money forever. Officer POA / finder licensure / state disbursement as Tower gates. Sales assessment HTML as in-app Audit. Claiming live backend persistence or production ALG Approach as shipped.

## Known unknowns the specification must keep open (Seed §13)

1. Exact escrow terms / release outcome.  
2. What “database authorization” means per practice stack.  
3. Meta targeting / CAC.  
4. Client desk depth.  
5. D-01, D-02 (loop-closer builder).  
6. Multi-consultant / roles / permissions.  
7. CRM sync bidirectional.  
8. When/whether email earns Meta entry.  
9. Rule-pack IP / liability.  
10. Production onboarding beyond seed manifests.  
11. Evolution instrumentation.  
12. Persistence target for workflows.  
13. Rules UI: outcomes-toggle vs condition trees.  
14. SMS/email consent regimes by geography.  
15. Channel-order escalations when SMS Y-reply fails; no-login eligibility view.  
16. Constants packs beyond Immigration.

SME Pass2 later supplies *mechanisms* for several of these (especially 1, 2, 9, 14). Those are practice/capability residual, not silent Seed closures. They are absorbed as constraints in `06-sme/`, not treated as founder-invented product.

## Prototype honesty (Seed §11) — as-built is not the spec

Always-on loop, Automations evaluation, Operations/Actions, ALG Approach/forward-deploy/escrow, Engine 2 orchestration, and Systems Register were (at Seed date) mock, stub, or bet. This specification states the **intended** product. As-built at the pinned SHA is evidence of progress and remaining honesty, not a reduction of the bet.

## Pass result

Seed is locked. Next method step is World derivation (already exists; confirm, do not fill holes).
