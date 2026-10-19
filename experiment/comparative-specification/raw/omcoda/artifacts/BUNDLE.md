# Omcoda contestant bundle

Reconstructed from transcript diffs after VM output dir was gone.


===== STATUS.json =====

{
  "contestant_id": "omcoda",
  "sha": "c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7",
  "framework": "omcoda",
  "framework_version": "pinned SHA c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7; operating docs: docs/README.md, docs/method/00-INDEX.md, docs/method/DECISION-CONSTITUTION.md, docs/method/TWO-COLUMN-SYNTHESIS.md, docs/sme/DOCTRINE-sme-cto-implementation.md, docs/sme/METHODOLOGY.md, docs/sme/SURFACE-INTENT.md, docs/sme/AGENT-VS-HUMAN-PROVISIONING.md, docs/register/PASS-FORK-MAP.md, docs/register/THREE-SURFACE-MODEL.md, docs/register/ORCHESTRATION.md, docs/register/SYSTEMS-REQUIREMENTS.md, docs/register/SEED.md, docs/register/WORLD.md, docs/register/OUTCOMES.md, docs/register/how/00-INDEX.md, docs/build-foundation/01-ui-first-and-how.md, docs/build-foundation/cursor-rules/how-analysis.mdc, docs/sme/capability/00-ROSTER.md, docs/wiring/WIRING-METHOD.md, docs/wiring/NODE-DEFINITION.md, docs/register/PHASE-TWO.md",
  "status": "complete",
  "completion_claim": "Walked Om Coda's Register spine on the pinned snapshot without implementing Tower or inventing founder decisions. Seed and World are confirmed as locked dump/derivation. Machine track (twelve systems, fused states, table-first) and face track (human outcomes, How DNA, operator authorship/bind) are joined. Practice SME modifies existing commitments; capability SME additions (Sending infrastructure, Conversations, pipelines) are folded into intended product and marked as in-repo Register-absorb not started. Phase Two Agents flagship 15:43 and Automations definite-middle/primitives are included without overwriting Seed or promoting parked expansions (SYSTEMS-GOAL, OBJECTIVE-ESCROW, attempt windows) into Story. Remaining holes sit in named silences, KUs, BLOCKED(counsel), and the founder-only class. Under this method that is a complete specification of the intended product, not a claim that KUs are closed or that the snapshot is shipped.",
  "blocker": null,
  "artifact_root": "/home/ubuntu/tower-spec-output/"
}


===== EXPERIMENT-RECORD.md =====

# Experiment record — Contestant 2 (Omcoda)

## Identity

- Contestant: **omcoda** (Contestant 2)
- Isolated: did not look for other contestants’ work
- Tower application code: read-only; no product implementation; no `git push`; no PRs/issues
- Preservation root: `/home/ubuntu/tower-spec-output/`
- Confirmed SHA (HEAD at start): `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7` (`c5bd617 package changes, nothing crazy` on `main`)
- Start (UTC, recorded): `2026-10-19T16:46:41Z`
- Stop (UTC, recorded): `2026-10-19T16:52:15Z`

## Initial approach

The assignment named Omcoda methodology and forbade substituting Spec Kit / OpenSpec / BMad. The repository’s own front door (`docs/README.md` orientation path) and `docs/register/PASS-FORK-MAP.md` already state the operating spine:

```
Seed → World → Systems Story → Systems Requirements → (∥ Personas & Function)
  → bind extrusions → SME → Enrichment → Furnish → Wiring → CT Plant → Translation
```

Two-column synthesis (`docs/method/TWO-COLUMN-SYNTHESIS.md`) is the join. Decision constitution forbids catch-all TBD and names a short founder-only class — so the pass could proceed without asking the coordinator for requirements.

I did **not** treat “complete specification” as rewriting Seed/World (they are validated/derived) or as filling known unknowns. I treated it as walking the spine, stating the **intended** product those locked passes already commit to, folding capability *additions* that practice could not see, including Phase Two founder wording without overwriting 15:43 or promoting parked expansions, and putting every remaining hole in a named gate.

Phase Two was read **after** Phase One spine so module flags could not replace Seed.

## First substantive artifacts

1. `00-session/SESSION-START.md` — SHA, constraints, sequence.
2. `00-session/METHODOLOGY-INVENTORY.md` (+ `.v1.md` freeze) — method docs actually used, by path.
3. `00-session/WORKING-PLAN.md` — method-determined order and stop rule.
4. `01-seed/SEED-CONFIRMATION.md` — dump confirmation, never-invent, KUs.
5. `02-world/WORLD-CONFIRMATION.md` — ecosystem sentence, finish lines, quarantine of WORLD-CRAFT-ARCHIVE.

These exist so evolution can be examined: later specs cite them rather than silently mutating Seed.

## Later revisions / discoveries

- **Outcomes fork already solved.** Consultant core is hand-over · authorize · receive; engagement machinery is leaf requirement on operator modules. Re-deriving “consultant engages” would violate How law.
- **Story vs Phase Two tension is already named in-repo.** 15:43 goal-as-escalation is founder wording (face). `SYSTEMS-GOAL.md` is durable expansion **not** Story must until promoted. Packet 022 settles a *mechanism* (objective_met as Local event; escalation as subscription) without changing the wording rule. The spec records both and does not promote.
- **Capability Register absorb is not started** (`docs/sme/capability/00-ROSTER.md`, `CAPABILITY-CONSIDERATIONS.md`). Doctrine says capability *adds* and must be folded before build. Folding those homes into *this* specification (Sending infrastructure, Conversations, pipelines) while marking in-repo How as unabsorbed is the method-correct move. Omitting them would recreate the CTO sink.
- **Hub vs Ant vs Configuration libraries** looks like a conflict and is not, if Ant is the translation of operator libraries and Hub is plant/reference. Treating Hub as the app would violate Phase Two law.
- **Prototype honesty ≠ intended product.** Seed §11 and GO-CUTOVER describe as-built. Using them to shrink ALG/escrow/eligibility intent would violate Seed §14 (never claim shipped, and never delete the bet).
- **v2 of the primary spec** only added §13 (Enrichment / Furnish / Wiring / Operator-revisions grade). v1 preserved at `SPEC/TOWER-INTENDED-PRODUCT.v1.md`.

## How I decided what to do next

At each step the next artifact was the next spine node, not a coordinator checklist:

| After | Next because |
|---|---|
| Method inventory | Seed (dump) |
| Seed | World (derivation) |
| World | Parallel: Story/Requirements **and** Outcomes/How |
| Both tracks | Bind / two-column join |
| Bind | Practice SME absorb (modifies) then capability absorb (adds) |
| SME | Phase Two module flags (same method, micro) |
| Flags | Named gates/silences (decision constitution) |
| Silences | Downstream Enrichment/Furnish/Wiring (spine remainder that does not change identity) |
| Downstream | Primary spec + bundle + STATUS |

I revisited after capability/Phase Two reads because leaving capability homes out, or generating a 7-item Agents list, would be method failures already documented in Doctrine and the Phase Two log (14:58 overwrite).

I did not fetch unpinned pull refs as product law. `docs/README.md` points at PRs #86/#96/#110 for live packets; the experiment pins SHA `c5bd617`. Product facts used are those **in the snapshot**. Mentions of those PRs in-repo are recorded as in-document pointers, not as fetched extra founder decisions.

## Why I continued / stopped

**Continued** until every spine layer had a specification artifact and the two columns were joined, including Phase Two grain and named residuals.

**Stopped** because the method’s completeness condition was met: remaining work is (a) implementation, forbidden; (b) founder-only promotions and counsel blocks; (c) specialist numeric depth that does not change product identity; (d) in-repo How absorb of capability modules, which this spec already states as intended. Filling escrow release, D-01/D-02, multi-consultant roles, or a `goal` table from chrome would invent founder decisions.

Not budget_exhausted. Not blocked.

## Time / resource notes (observable)

- Environment already at the pinned SHA; no checkout required.
- Work was read-only against `/workspace` plus writes under `/home/ubuntu/tower-spec-output/`.
- No application build, no tests (repo has no tsc/eslint/playwright for this job), no browser verification (no UI change).
- Wall clock from recorded start to STATUS write is on the order of minutes of agent time after SHA confirm; reading was concentrated on method + Seed/World/Story/Requirements/Outcomes/How indexes/Phase Two faces/SME handoff/capability roster rather than every Pass2 item body. Practice absorb uses HANDOFF.md (the room-holder synthesis), not a re-run of 177 Pass1 questions.
- I did not open other contestant directories.

## File inventory

```
/home/ubuntu/tower-spec-output/
  STATUS.json
  EXPERIMENT-RECORD.md
  BUNDLE.md
  CROSS-REFERENCES.md
  00-session/
    SESSION-START.md
    WORKING-PLAN.md
    METHODOLOGY-INVENTORY.md
    METHODOLOGY-INVENTORY.v1.md
  01-seed/SEED-CONFIRMATION.md
  02-world/WORLD-CONFIRMATION.md
  03-machine/MACHINE-EXTRACT.md
  04-faces/FUNCTION-EXTRACT.md
  04-faces/HOW-LATTICE.md
  05-bind/TWO-COLUMN-JOIN.md
  06-sme/PRACTICE-ABSORB.md
  06-sme/CAPABILITY-ABSORB.md
  07-phase-two/MODULE-FLAGS.md
  08-uncertainty/GATES-AND-SILENCES.md
  09-revisions/DOWNSTREAM-PASSES.md
  SPEC/TOWER-INTENDED-PRODUCT.md          (v2 — includes §13)
  SPEC/TOWER-INTENDED-PRODUCT.v1.md       (intermediate)
```

Primary specification: `SPEC/TOWER-INTENDED-PRODUCT.md`. Concatenated bundle: `BUNDLE.md`.


===== CROSS-REFERENCES.md =====

# Cross-references — specification artifacts ↔ repository sources

Pinned SHA: `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`

| Spec artifact | Primary sources |
|---|---|
| `00-session/WORKING-PLAN.md` | `docs/register/PASS-FORK-MAP.md`, `docs/method/TWO-COLUMN-SYNTHESIS.md` |
| `01-seed/SEED-CONFIRMATION.md` | `docs/register/SEED.md` |
| `02-world/WORLD-CONFIRMATION.md` | `docs/register/WORLD.md` (not WORLD-CRAFT-ARCHIVE) |
| `03-machine/MACHINE-EXTRACT.md` | `SYSTEMS-STORY.md`, `SYSTEMS-REQUIREMENTS.md`, `SYSTEMS-REQUIREMENTS-FILLED.md`, `BUILD-system-map-v2-table-inventory.md`, `DATA-IN-TABLES.md` |
| `04-faces/FUNCTION-EXTRACT.md` | `OUTCOMES.md`, `personas.md`, `how/`, `01-ui-first-and-how.md` |
| `04-faces/HOW-LATTICE.md` | `how/00-INDEX.md` + each tree |
| `05-bind/TWO-COLUMN-JOIN.md` | `TWO-COLUMN-SYNTHESIS.md`, `SURFACE-INTENT.md`, Requirements fused nodes |
| `06-sme/PRACTICE-ABSORB.md` | `sme/METHODOLOGY.md`, `HANDOFF.md`, `CROSS-CUTTING.md`, `ROSTER.md` |
| `06-sme/CAPABILITY-ABSORB.md` | `sme/capability/00-ROSTER.md`, Doctrine §1–3 |
| `07-phase-two/MODULE-FLAGS.md` | `PHASE-TWO.md`, `PHASE-TWO-LOG.md` 15:43, `AGENTS-FACE.md`, `AUTOMATIONS-FACE.md`, `PRIMITIVES.md`, `SYSTEMS-GOAL.md`, `SYSTEMS-OBJECTIVE-ESCROW.md` |
| `08-uncertainty/GATES-AND-SILENCES.md` | Seed §13–14, Story silences, `DECISION-CONSTITUTION.md`, `ORCHESTRATION.md` |
| `SPEC/TOWER-INTENDED-PRODUCT.md` | Union of the above |

## Method documents used (paths)

See `00-session/METHODOLOGY-INVENTORY.md`. Extended during later passes with: `docs/sme/SURFACE-INTENT.md`, `docs/sme/AGENT-VS-HUMAN-PROVISIONING.md`, `docs/sme/HANDOFF.md`, `docs/sme/CROSS-CUTTING.md`, `docs/sme/ROSTER.md`, `docs/register/AGENTS-FACE.md`, `docs/register/AUTOMATIONS-FACE.md`, `docs/register/PRIMITIVES.md`, `docs/register/DATA-IN-TABLES.md`, `docs/register/PHASE-TWO.md`, `docs/register/PHASE-TWO-LOG.md`, `docs/register/SYSTEMS-GOAL.md`, `docs/register/SYSTEMS-OBJECTIVE-ESCROW.md`, `docs/wiring/wire-log/GO-CUTOVER.md`, `docs/register/system-map/FROZEN-TABLES-v1.md`.


===== 00-session/SESSION-START.md =====

# Contestant 2 (Omcoda) — session start

- **Contestant:** omcoda (Contestant 2)
- **Start (UTC):** 2026-10-19T16:46:41Z
- **Confirmed SHA:** `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`
- **HEAD at confirmation:** `c5bd617 package changes, nothing crazy` on `main`
- **Framework:** Omcoda Register method as documented in the supplied Tower repository
- **Writable root:** `/home/ubuntu/tower-spec-output/`
- **Constraint:** Tower application source is read-only. No product implementation. No git push. No PRs. No founder/coordinator requirements requests.

## Assignment (compressed)

Establish a complete, coherent specification of the **intended** Tower product from information already in the repository, using Omcoda Seed → World → How Analysis / Function, systems (Story → Requirements), capability, and related method. Where the material does not establish an answer, name the uncertainty. Do not invent a founder decision.

## Initial approach

Follow the repository’s own operating spine rather than a generic spec outline:

```
Seed → World → Systems Story → Systems Requirements → (∥ Personas & Function)
  → bind extrusions → SME (practice ∥ capability) → Enrichment → Furnish
  → Wiring → (CT / Translation are build, not this assignment)
```

Two-column synthesis (`docs/method/TWO-COLUMN-SYNTHESIS.md`) is the join: machine track and face track in parallel; SME handoff forks practice vs capability; founder-only class is enumerated and otherwise the pass proceeds.

Phase Two is in-method micro-scale of the same spine, not a different product. It is read after the Phase One spine is assembled so module flags do not overwrite Seed/World.

Stopping is method-determined: proceed until the spine is walked, intended product is stated as far as Seed+World+locked passes allow, and remaining items sit in named silences / known unknowns / founder-only gates — not in catch-all “TBD later.”


===== 00-session/WORKING-PLAN.md =====

# Working plan — Contestant 2 follows the Register spine

**Method source:** `docs/register/PASS-FORK-MAP.md` · `docs/method/TWO-COLUMN-SYNTHESIS.md` · `docs/register/ORCHESTRATION.md`

## Sequence (not a coordinator checklist)

1. Confirm Seed as the dump (validated). Do not rewrite. Extract intended-product claims, never-invent, KUs.
2. Confirm World as derivation from Seed only. Quarantine WORLD-CRAFT-ARCHIVE. Extract ecosystem + gates.
3. Machine track: Systems Story (substance) → Systems Requirements (states/transitions) → table-first law. Do not invent musts. Do not promote OPERATOR-REVISIONS / SYSTEMS-GOAL / SYSTEMS-OBJECTIVE-ESCROW into Story.
4. Face track in parallel: Outcomes (human subjects) → Personas → How trees (DNA, visibility, leaf stop).
5. Bind: controls/panes extrude onto named states. Congruence maps are audits, not discovery.
6. Practice SME: Handoff modifies existing commitments. Capability SME: additions that Register absorb has not started — fold here as specification, mark absorb status.
7. Phase Two: same method at micro scale. 15:43 Agents flagship is founder wording. Do not overwrite with generated lists. Automations entered from Agents outskirts.
8. Name founder-only gates (`DECISION-CONSTITUTION.md`). Proceed on everything else.
9. Stop when the intended product is specified as far as locked passes allow, remaining holes sit in named silences/KUs/founder-only class, and further work would invent founder decisions or implement the product.

## What this experiment will not do

- Implement Tower.
- Mint tables, rewrite Story, or promote expansions.
- Ask the founder for missing requirements.
- Treat prototype honesty (Seed §11) as the intended product.
- Treat Hub as the app (Phase Two law). Hub remains plant / reference for Automations Rules grain.
- Fill silences (escrow release, DB-auth shape, D-01/D-02, multi-consultant roles, …).


===== 00-session/METHODOLOGY-INVENTORY.md =====

# Methodology documents actually used

**Pinned SHA:** `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`

This inventory is the operating framework for Contestant 2. Paths are repository paths at the pinned commit. Additional source-evidence files consulted for product facts are listed in later pass folders; this file is method, not the whole corpus.

## Operating spine (how we think / how we specify)

| Path | Role in this experiment |
|---|---|
| `docs/README.md` | Front door; seat identities; orientation path; product-face law |
| `docs/method/00-INDEX.md` | Portable method map |
| `docs/method/DECISION-CONSTITUTION.md` | Named gates only; no catch-all buckets |
| `docs/method/TWO-COLUMN-SYNTHESIS.md` | Practice column ∥ capability/machine column |
| `docs/sme/DOCTRINE-sme-cto-implementation.md` | Doctrine spine (two SME axes; capability adds; CTO sink forbidden) |
| `docs/sme/METHODOLOGY.md` | Practice SME Engagement Manager → Pass1 → Pass2 → Handoff |
| `docs/sme/HANDOFF-ROUTING.md` | `pm` / `both` / `cto` crossing tokens (read as needed) |
| `docs/sme/SURFACE-INTENT.md` | Initiation vs view vs none |
| `docs/sme/AGENT-VS-HUMAN-PROVISIONING.md` | Agent-codeable vs human residue |
| `docs/register/PASS-FORK-MAP.md` | Why each pass exists; canonical spine |
| `docs/register/THREE-SURFACE-MODEL.md` | Register vs Product vs Console; pass sequence |
| `docs/register/ORCHESTRATION.md` | Fail-closed gates and Tower status at this SHA |
| `docs/register/SYSTEMS-REQUIREMENTS.md` | Machine-track doctrine (Tower is the machine; UI = control/pane) |
| `docs/build-foundation/README.md` | How we build (context) |
| `docs/build-foundation/00-rudiments.md` | Rudiments |
| `docs/build-foundation/01-ui-first-and-how.md` | How Analysis DNA / visibility / leaf stop |
| `docs/build-foundation/cursor-rules/how-analysis.mdc` | How Analysis authoring rules |
| `docs/sme/implementation/CLICKPATH-DENSIFICATION.md` | Affordance grain for Wiring |
| `docs/wiring/WIRING-METHOD.md` | Paper wiring (event language) |
| `docs/wiring/NODE-DEFINITION.md` | Node = named unit of state at event altitude |
| `docs/wiring/WIRING-CRITICAL-INTERACTION.md` | Critical = user-originated interaction whose target is read elsewhere |
| `docs/wiring/CTO-THINK-STACK.md` | Technical column facets |

## Seed / World / How / systems / capability (what the method produces)

| Path | Role |
|---|---|
| `docs/register/SEED.md` | Dense provision; bets; never-invent; known unknowns |
| `docs/register/WORLD.md` | Ecosystem derived from Seed only |
| `docs/register/WORLD-CRAFT-ARCHIVE.md` | Quarantined craft; not an input (consulted only to obey that rule) |
| `docs/register/OUTCOMES.md` | Human-subject molecular outcomes |
| `docs/register/personas.md` | Subjects / seats |
| `docs/register/how/00-INDEX.md` | How-tree law + index |
| `docs/register/how/*.md` | Per-outcome How trees |
| `docs/register/SYSTEMS-STORY.md` | Machine substance (must / must-not / chain / silence) |
| `docs/register/SYSTEMS-REQUIREMENTS-FILLED.md` | Spec extraction from Story |
| `docs/sme/capability/00-ROSTER.md` | Capability axis roster |
| `docs/sme/capability/CAPABILITY-CONSIDERATIONS.md` | Capability considerations |
| `docs/sme/capability/C1–C7` | Capability modules |
| `docs/register/PHASE-TWO.md` | Micro-pass of the same method |
| `docs/register/PHASE-TWO-LOG.md` | Product flags (15:43 Agents flagship is law) |

## Opened on later passes (still method / law, not third-party commentary)

| Path | Role |
|---|---|
| `docs/sme/SURFACE-INTENT.md` | initiation / view / none |
| `docs/sme/AGENT-VS-HUMAN-PROVISIONING.md` | residue vs agent-codeable |
| `docs/sme/HANDOFF.md` · `CROSS-CUTTING.md` · `ROSTER.md` · `SME-GRAPH.md` | practice absorb |
| `docs/sme/capability/CAPABILITY-CONSIDERATIONS.md` | 158 capability items; Register absorb not started |
| `docs/register/PHASE-TWO.md` · `PHASE-TWO-LOG.md` | micro-pass + 15:43 flag |
| `docs/register/AGENTS-FACE.md` · `AUTOMATIONS-FACE.md` · `PRIMITIVES.md` | operator module grain |
| `docs/register/SYSTEMS-GOAL.md` · `SYSTEMS-OBJECTIVE-ESCROW.md` | parked expansions |
| `docs/register/DATA-IN-TABLES.md` | records from tables |
| `docs/register/enrichment/00-INDEX.md` · `furnish/00-INDEX.md` | Can’ts / supporting UI |
| `docs/register/OPERATOR-REVISIONS.md` | unpromoted shape bets |
| `docs/wiring/WIRING-METHOD.md` · `NODE-DEFINITION.md` · `WIRING-CRITICAL-INTERACTION.md` | paper wiring |
| `docs/wiring/wire-log/GO-CUTOVER.md` | as-built ports honesty |
| `docs/register/system-map/FROZEN-TABLES-v1.md` | materialized vs map-only |

A frozen copy of the first write is `00-session/METHODOLOGY-INVENTORY.v1.md`.


===== 01-seed/SEED-CONFIRMATION.md =====

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


===== 02-world/WORLD-CONFIRMATION.md =====

# Pass 2 — World confirmation

**Source:** `docs/register/WORLD.md` at the pinned SHA.  
**Derived from:** `SEED.md` and nothing else.  
**Posture:** under-claim. Where Seed leaves a hole, World does not fill it.  
**Quarantine:** `WORLD-CRAFT-ARCHIVE.md` is **not** an input.

## World sentence (verbatim job)

Tower is the always-on immigration-consultancy workspace that acquires a stranger consultant through a one-tap Meta Approach (name + website + channel within a click budget), activates by forward-deploying a no-login prepared campaign under their firm identity until they authorize database access and accept escrow, then runs the firm desk loop — keep the private contact book reachable, engage through opt-in → nudge → reactivation, refresh contact facts through touchpoints, re-evaluate service eligibility as facts and IRCC-shaped rules move, and campaign eligible people toward a booked meeting — without the consultant rechecking every file by hand, and without inventing public-before-contact detection of end-client eligibility. Om Coda runs this as an **agency** product: the operations that keep eligibility and engagement running are **house-configured**, not left for the firm to invent alone.

## Facet doctrine (World §0.3)

1. Activation sets the target; acquisition fulfills the seed quota.
2. Finish lines are input sets.
3. Click budget lives in acquisition only.
4. Forward-deploy lives in activation.
5. Entry paths are product paths.
6. One Approach per acquired non-house party. House is never acquired. Engagement contact is never acquired via Approach.
7. Application does not reshape to make the growth bet cheaper.
8. The desk is the same desk either door (ALG or assisted).

## Finish lines

| Facet | Ends when |
|---|---|
| Acquisition | Name + website + phone **or** email land |
| Activation | Database authorization **and** escrow acceptance land, campaign can **run** |
| Application | Continuously: detect → engage → collect → re-detect toward **meeting booked** |
| Evolution | Not a client lifecycle. Register-driven product change from running-firm friction |

## Entity inventory (World §1.1) — no treatment here

Firm (tenancy) · Consultant / firm operator · Engagement contact (Client) · Om Coda house · Approach / ads supply · reference-data upkeep · Register / internal tooling · Agent presentation layer.

**Not invented:** household entities; extra firm-side parties for multi-consultant roles (open).

## Shape necessities (World §2)

1. **Operator/house layer** exists because Om Coda is an agency, not self-serve config by each firm.
2. **Two sides of detection:** law/public-reference change (versioned data) vs life change on the contact (engagement must ask).
3. **Vertical modularity:** same graph; industry packs swap.

## Operational laws (World §3)

- Reachability gate (Audit): can we reach them and start a sequence? Not scoring, not sales ceremony.
- Engagement record is a record, not a decision brain.
- Two sequencing layers never conflated: campaign calendar (Engine 2) vs attempt / channel-ownership.
- Open-box evaluation: inspectable and changeable without a code deploy.

## Hard human gates (World §4)

Seed capture · assisted provision · OTP · database authorization · escrow acceptance · client consent / not silenced · meeting booking · refusing illegal/unethical outreach.

Not Tower: officer POA, finder licensure, public-fund disbursement.

## Treatment is a later pass

World names the **class** of house/operator paths. `personas.md` names the **members**. This experiment treats Personas as the craft ruling on seats (one acquired persona: Consultant; Operator is one house human, many surfaces; Engagement contact is referenced, not a persona).

## Pass result

World is locked as ecosystem assembly. Next parallel tracks: Systems Story (machine) and Outcomes / How (faces).


===== 03-machine/MACHINE-EXTRACT.md =====

# Pass 3 — Machine track extract

**Sources:** `docs/register/SYSTEMS-STORY.md` · `docs/register/SYSTEMS-REQUIREMENTS.md` · `docs/register/SYSTEMS-REQUIREMENTS-FILLED.md` · `docs/register/system-map/BUILD-system-map-v2-table-inventory.md` · `docs/register/DATA-IN-TABLES.md`  
**Seat law:** Systems analyst locks substance in Story. Requirements **extract**; they do not invent.  
**This pass does not promote:** `OPERATOR-REVISIONS.md`, `SYSTEMS-GOAL.md`, `SYSTEMS-OBJECTIVE-ESCROW.md` — denser than Seed/World, not Story musts until founder promotion.

## Doctrine (from SYSTEMS-REQUIREMENTS.md)

Tower is the **machine**. UI is only:

| Extrusion | Job |
|---|---|
| **Control** | Injects a change into a state that already exists |
| **Pane** | Displays a state the machine already has |

Faceless triggers (email opened, window elapsed, reference version published) are native to this track. Outskirts maps cannot see them.

## Spine the whole machine must continuously do

While a firm has contacts and hands-free is armed:

1. Keep engaging dormant and active contacts.
2. Keep immigration-relevant facts fresh via firm→client touchpoints.
3. Re-evaluate **service eligibility** as IRCC-shaped reference and client facts move.
4. Surface campaign-worthy people so consultants book meetings without manually rechecking every file.

Core pursuit: detect service-eligible candidates and initiate the right campaign motion (launch / nudge / reactivation) whose success event is **meeting booked**.

Cross-cutting: Agent presentation ≠ fulfillment. House/open-box: evaluation, analysis, operational logic, and reference upkeep stay inspectable and changeable without a code deploy.

## The twelve systems

| # | System | Must fulfill |
|---|---|---|
| 1 | Acquisition (seed-capture) | Three cheap inputs inside click budget; return to scroll |
| 2 | Provision / forward-deploy | No-login prepared workspace proving readiness, not value |
| 3 | Commercial / hard-input | DB authorization + escrow; flip campaign to **running** |
| 4 | Tenancy & access | Versioned manifests; OTP session; one desk either door |
| 5 | Reachability / audit | Can we reach them and start a sequence? |
| 6 | Consent / suppression | Opt-in; silenced when not opted in; DB auth ≠ consent |
| 7 | Engagement / sequencing | **7a** campaign calendar · **7b** attempt / channel-ownership — never conflated |
| 8 | Fact-refresh / data-collection | Nudges collect; field-class routing; write-back re-evaluates |
| 9 | Reference-currency | Versioned IRCC-shaped tables as data; faceless trigger on move |
| 10 | Eligibility re-evaluation | Private book; any-pathway; Analysis readout; every determination is a signal |
| 11 | Signal / motion (Engine 2) | Record every detection; one motion by fixed precedence |
| 12 | Meeting / loop-closer | meeting_booked → pending capture + live brief |

## Must-not walls (selected, not exhaustive)

- Pull DB auth or escrow into click budget; treat forward-deploy as acquisition; cold email V1 Approach.
- Credits/sales-call as peer activation door; hold immigrant settlement funds.
- Operator as firm Board login; Agent seat in admission.
- Audit as scoring / ROI / sales ceremony.
- Skip opt-in because ALG.
- Document-dependent facts in forms.
- Code deploy to update reference facts.
- Public-before-contact end-client eligibility as Core.
- Parallel motions for one client; Engine 2 replacing 7b inside a sequence.
- Engagement record authoring motion.

## Engine 2 precedence (system 11) — immutable

1. Reactivation first, always, if anything is reactivation-worthy.
2. Nudge only when nothing is reactivation-worthy.
3. One nudge consolidates **every** outstanding self-reportable need into **one** form.
4. When reactivation fires, secondary signals ride as **agenda** on the pre-meeting brief — never parallel outreach.
5. **One client, one motion, ever.**

**Silence inside this law:** what makes a signal **reactivation-worthy**. SME Handoff `elig-04` proposes a practice mechanism (material service-posture change). That is absorb, not a Story promotion. See `06-sme/` and `08-uncertainty/`.

## Chain web (Story)

```
Acquisition --seed land--> Provision --prepared--> Commercial --running--> Application (5–12)
Audit --sequence-ready--> Engagement enrollment
7b finishing event --> arm next sequence
Engagement nudge --> Fact-refresh
Fact write-back --> Eligibility
Reference move --> Eligibility
Every determination --> Engine 2 signal --> motion --> Engagement
meeting_booked --> pending capture write-back --> Eligibility (live brief)
```

Heartbeat: *seed → forward-deploy → run*, then self-feeding *detect → engage → collect → re-detect*, with Reference-currency injecting faceless external triggers.

## Named states (Requirements extract, fused)

Faceless-origin nodes (★) are first-class.

`firm_tenancy` · `user_account` · `session` · `otp_challenge` · `firm_identity_binding` · `seed_capture` · `approach_impression`★ · `session_attribution` · `firm_public_facts`★ · `prepared_workspace` · `database_authorization` · `escrow_acceptance` / `escrow_terms` · `campaign_state`★ · `contact_record` · `reachability_verdict`★ · `sequence_ready` · `reachability_issue` · `consent_state`★ · `optin_phase` · `sequence_definition` · `phase_state` · `reactivation_arm_state` · `content_order` · `active_attempt`★ · `inbound_override`★ · `finishing_event`★ · `engagement_record`★ · `fact_ask` · `field_class_routing` · `fact_writeback`★ · `missing_fact_signal`★ · `reference_version`★★ · `constants_pack` · `eligibility_evaluation`★ · `eligibility_result`★ · `analysis_readout` · `evaluation_ruleset` · `signal`★ · `motion_decision`★ · `meeting_booked` · `pending_capture` · `live_brief`★

Archetype faceless trigger: `reference_version` (a draw cutoff shifts with nobody present).

## Table-first law (v2 inventory)

The machine is **tables + a dumb runtime**.

| Kind | Holds |
|---|---|
| **State** | Values/status the machine tracks |
| **Rule** | When [trigger] + [condition] → change [target] to [value], as rows |
| **Sequence / order** | Ordered, rearrangeable lists |

Anything that should be modifiable must be a table. Frozen-in-prose that should vary is a bug unless it is a hard-gate / must-not / immutable wall.

**Data in tables (Phase Two law, 18:44):** records that show in a module come from tables. Never hard-code data into the app. Missing table/field is Systems Analyst ascribe — do not invent a store in the SPA.

## What Requirements must not extract yet

- A `goal` state from `SYSTEMS-GOAL.md` until Story §7 carries a promoted must. Packet 022 later settled a **mechanism** (objective met as Local event; escalation as subscription) without changing that wording rule.
- Escrow-as-billable-objective from `SYSTEMS-OBJECTIVE-ESCROW.md` until Story §3 is promoted. Direction: objective is the billable unit; not a build order.
- OPERATOR-REVISIONS attempt windows (30 min / 24 h) as Seed/World law.

These sit in `07-phase-two/` as **founder expansions parked**, and in `08-uncertainty/` as promotion gates — not as invented closures.

## Pass result

Machine substance and spec extraction exist. Bind faces onto these states; do not discover more machine from screens.


===== 04-faces/FUNCTION-EXTRACT.md =====

# Pass 4 — Face track extract (Outcomes · Personas · How)

**Sources:** `docs/register/OUTCOMES.md` · `docs/register/personas.md` · `docs/register/how/` · `docs/build-foundation/01-ui-first-and-how.md` · `docs/build-foundation/cursor-rules/how-analysis.mdc`  
**Fork solved:** Outcomes were once written “As Tower…”; engagement machinery wore a Consultant wrapper. Cleanup locked human subjects only; machinery is **leaf requirements**.

## How Analysis laws applied (not re-derived)

- One molecular outcome per tree; first How mirrors it.
- Child questions **cut DNA** from the parent answer.
- Sibling order = clause order.
- User-visible language until a true leaf; process language only at leaves.
- Stop when the next How would repeat the parent or need invisible language too early.
- Subjects only: Consultant · Engagement contact · Operator. Never “As Tower” / “As House.”
- Consultant core stays short: hand-over · authorize · receive. Do not pull Automations/Agents authorship back under the consultant desk.
- Hub placement is a revision, not destination. Authorship rightful home = Operator Configuration libraries. Hub parking = **existing-wrong-seat** when relevant.
- Product face later (Phase Two): `/prototype-ant`. Hub is plant/reference, not the app. That does not restore authorship to the consultant.

## One acquired persona

**Consultant** is the only workspace-owning persona. Firm is the tenancy boundary. Engagement contact is referenced / delivery-only. Operator/house is one human, many surfaces — not a second acquired persona.

**Craft split of the house layer** (`personas.md`):

- **House-global console:** Acquisition & ads · Activation & forward-deploy · Reference data · Configuration libraries · Oversight · Audit trail · Register & evolution (prototype-time only; **shipped product contains no Register**) · Founder & agency controls · Customer support queue.
- **Per-tenancy admin:** Provision · Commercial · Firm operations bind · Book readiness · Firm health · Activation state · Support context.

**Agency architecture (ratified):** Configuration libraries are **authored house-globally** and **bound per-tenancy**. Firms do not author packs.

## Outcomes lattice

### North star (Consultant · Core)

> As Consultant, I can hand my private book to Tower and authorize it to work under my license, and get eligible clients booked onto my calendar — without setting up, configuring, or running any of the engagement myself — so that an eligible contact arrives at a booked meeting already re-engaged and current.

**DNA cut (consultant-core.md):**

1. Hand over the book and authorize under license + escrow (Prepared Workspace: Authorize book · Accept terms).
2. Receive booked meetings + live brief without opening Configuration libraries / Hub Automations / Agents.

**Build-side requirements at those leaves:** operator bind + libraries + book readiness + engagement machinery (opt-in → nudge → reactivation · refresh · re-evaluate · send). Those are **not** consultant How children.

### Consultant secondary

| Outcome | So that |
|---|---|
| Governance | Book worked lawfully in my name (see / halt) |
| Access | Sign in; land in firm workspace; take meetings |

### Engagement contact (loop closure)

Consent · Refresh facts (one consolidated self-reportable form) · Silence · Book (success hop back onto Consultant).

### Operator house-global

Acquisition & ads · Activation & forward-deploy (candidate co-core) · Reference data · Configuration libraries · Oversight · Audit trail · Register & evolution (house tooling) · Founder & agency controls.

### Operator per-tenancy

Provision · Commercial · Firm operations bind · Book readiness · Firm health · Activation state.

### Operator support

Keep the firm running.

## Configuration libraries How (authorship)

Operator authors and versions: **Evaluation packs** · **Automation workflows** · **Engagement templates**. Publish version → later selectable in Firm operations bind. No firm picker on the libraries module.

**Existing-wrong-seat:** Hub Automations / Agents as the consultant-facing authorship home.

## Firm operations bind How

Select firm → Bind packs (three published dropdowns: evaluation · automation · engagement) → Bind → Armed / Active. Audit trail appends the change. Firms do not author.

## Contact consent How (visibility stop)

User-visible: firm-branded opt-in message → Agree or Ignore before deeper collection. Process (CASL ledger, send gates) belongs at the leaf / Wiring, not in the outcome sentence.

## Consultant workspace inhabit (from personas §4)

- **Book** — private contacts; reachability as inhabited, not authored
- **Engagement** — armed / active / silenced; record as chronology
- **Eligibility** — service candidates and Analysis readout the desk acts on
- **Meetings / brief** — live pre-meeting brief; loop-closer capture
- **Session** — passwordless entry for known users

Board phase chips are **inhabit**, never pack editors.

## Closure (OUTCOMES.md)

Consultant core → Engagement contact arrives re-engaged → Book → Consultant takes the meeting. Operator so-thats forward to the next surface or to the Consultant reaching / staying running. No so-that lands on “the system.”

## Pass result

Face lattice is locked. Bind only onto machine states from Pass 3. Phase Two later densifies Operator Configuration libraries (Agents / Automations workbenches) without changing the consultant core DNA.


===== 04-faces/HOW-LATTICE.md =====

# How lattice — all molecular outcomes (index + DNA)

**Method:** `docs/build-foundation/01-ui-first-and-how.md` · `docs/register/how/00-INDEX.md`  
**Trees (source of truth for leaves):** `docs/register/how/*.md` at the pinned SHA.  
This file is the lattice a world-builder / Function pass must not lose. It does not replace leaf click-paths.

## Laws (repeat)

Subjects: Consultant · Engagement contact · Operator. Engagement machinery is requirement, not outcome. Consultant core hands most leaves across to operator modules. Leaf click-path uses most-relative container. Affordance grain names control + downstream reader.

## Consultant

| Outcome | File | First DNA cut |
|---|---|---|
| Core | `consultant-core.md` | Authorize book + Accept terms → receive Meetings/Live brief without authoring |
| Governance | `consultant-governance.md` | See armed/active chronology → Halt outreach |
| Access | `consultant-access.md` | OTP verify → land on Board |

## Engagement contact

| Outcome | File | First DNA cut |
|---|---|---|
| Consent | `contact-consent.md` | Firm-branded opt-in → Agree or Ignore before deeper collection |
| Refresh facts | `contact-refresh.md` | One consolidated self-reportable form; reply when situation changes |
| Silence | `contact-silence.md` | Opt out / silence at any point; runners honor |
| Book | `contact-book.md` | Book when invited; arrive into live brief |

## Operator — house-global

| Outcome | File | First DNA cut |
|---|---|---|
| Acquisition & ads | `operator-acquisition.md` | Approach strip inside click budget; instrument understand-vs-tap |
| Activation & forward-deploy | `operator-activation.md` | Hydrate prepared workspace → readiness walk → hard inputs land |
| Reference data | `operator-reference-data.md` | Version tables as data; publish without code deploy |
| Configuration libraries | `operator-configuration-libraries.md` | Author evaluation / automation / engagement; Publish version |
| Oversight | `operator-oversight.md` | Fleet health; drill to tenancy |
| Audit trail | `operator-audit-trail.md` | Who changed which operation, when, on which firm |
| Register & evolution | `operator-register-evolution.md` | Document friction; regenerate methodology (house tooling) |
| Founder & agency controls | `operator-founder-controls.md` | Cross-firm bounds / kill-switches |

## Operator — per-tenancy

| Outcome | File | First DNA cut |
|---|---|---|
| Provision | `operator-provision.md` | Assisted firm/user mint |
| Commercial | `operator-commercial.md` | Hold/oversee escrow terms |
| Firm operations bind | `operator-firm-bind.md` | Bind three published packs → Armed/Active |
| Book readiness | `operator-book-readiness.md` | Reachability gate; sequence-ready |
| Firm health | `operator-firm-health.md` | Tenancy-scoped engagement health |
| Activation state | `operator-activation-state.md` | Progress toward running |

## Operator — support

| Outcome | File | First DNA cut |
|---|---|---|
| Keep the firm running | `operator-support.md` | Tickets with bind/health/commercial context |

## Capability homes not yet How-treed in-repo

Sending infrastructure · Conversations/reply-triage · (pipelines behind Reference / Activation / Commercial / Oversight). Specified in `06-sme/CAPABILITY-ABSORB.md`. Folding them into How is remaining Register absorb — not a new persona.


===== 05-bind/TWO-COLUMN-JOIN.md =====

# Pass 5 — Two-column join (bind extrusions)

**Method:** `docs/method/TWO-COLUMN-SYNTHESIS.md` · `docs/register/SYSTEMS-REQUIREMENTS.md` §1.3 · `docs/sme/HANDOFF-ROUTING.md` · `docs/sme/SURFACE-INTENT.md`

Practice column (faces) and capability/machine column (no face required) join by **shared events / outcomes / states**, not by forcing one roster into the other’s shape.

## Bind rule

Each control or pane is an extrusion onto a state Pass 3 already named. A control that lands on nothing is an orphan. A node with no faceless origin **and** no control is dead or missing an origin.

## Join table (intended product)

| Outcome / surface | Machine states touched | Initiation vs view | Column |
|---|---|---|---|
| Approach one-tap | `seed_capture`, `approach_impression`★, `session_attribution` | Initiation (stranger) | both |
| Prepared Workspace walk | `firm_public_facts`★, `prepared_workspace`, `firm_identity_binding` | View + route (agent presents) | both |
| Authorize book | `database_authorization` | Initiation (hard gate) | pm + cto ledger |
| Accept terms | `escrow_acceptance`, `escrow_terms` | Initiation (hard gate) | both |
| OTP / session | `otp_challenge`, `session`, `firm_tenancy` | Initiation | cto (generic wiring) |
| Book readiness Audit | `contact_record`, `reachability_verdict`★, `sequence_ready` | Initiation (run) + pane (verdicts) | both |
| Consent touchpoint | `optin_phase`, `consent_state`★ | Initiation (contact) | both |
| Halt outreach | `consent_state` / silence / halt | Initiation (consultant governance) | both |
| Configuration libraries — engagement templates (Agents) | `sequence_definition`, `content_order`, `reactivation_arm_state` | Initiation (operator authorship) | pm face; cto tables |
| Configuration libraries — automation workflows | `eligibility_evaluation`, `evaluation_ruleset`, `constants_pack`, `workflow` shape | Initiation (operator authorship) | both |
| Firm operations bind | bindings onto 7/10 packs; `campaign_state` | Initiation | both |
| Attempt runtime | `active_attempt`★, `inbound_override`★, `finishing_event`★ | **none** (faceless) | cto |
| Nudge / form | `fact_ask`, `field_class_routing`, `fact_writeback`★ | Initiation (contact) | both |
| Reference publish | `reference_version`★★ | Initiation (operator) + faceless ramification | both |
| Eligibility / Analysis | `eligibility_result`★, `analysis_readout` | Pane | pm pane; cto eval |
| Engine 2 | `signal`★, `motion_decision`★ | **none** | cto |
| Meeting booked | `meeting_booked`, `pending_capture`, `live_brief`★ | Initiation (contact) + pane (consultant) | both |
| Engagement record / Activity | `engagement_record`★ | Pane (record only) | pm pane |
| Board phase chips | `phase_state`, `reactivation_arm_state` | Pane | pm |

## Do not invent UI for CTO-only

Capability may complete with zero Register surface: warmup scheduler internals, event pipeline, DKIM provisioning residue, suppression consult before send. Surface intent = `none` until a view/initiation is actually required (`SURFACE-INTENT.md`).

## Do not invent Wiring fiction for PM-only

A How leaf without a named event/state path is theater. Consultant Core “receive booked meetings” requires `meeting_booked` and `live_brief`, not a painted calendar.

## Congruence maps (re-ranked)

`OUTCOME-SYSTEM-MAP.md` and `SYSTEM-COMPONENT-MAP.md` are **audits after Requirements**, not discovery. This experiment does not re-run them as if the machine were unknown. Known congruence notes from those files: Consultant Governance/halt was a Gap; priors exist as Extension/Authorship/Chrome/Parked. They do not add musts.

## Product north star both columns serve

Outside habitat: ad → phone → inbox (ALG). Inside habitat: always-on loop toward meeting booked. Not a substitute for either lattice.


===== 06-sme/PRACTICE-ABSORB.md =====

# Pass 6a — Practice SME absorb (modifies existing commitments)

**Method:** `docs/sme/METHODOLOGY.md` · `docs/sme/DOCTRINE-sme-cto-implementation.md` §3 (compliance *modifies*)  
**Sources:** `docs/sme/SME-GRAPH.md` · `docs/sme/ROSTER.md` · `docs/sme/HANDOFF.md` · `docs/sme/CROSS-CUTTING.md` · `docs/sme/pass2/`  
**Status in-repo:** `sme-handoff-ready` checked. 7 seats, 177 Pass2 considerations.  
**This experiment does not re-run Pass1.** Roster is residual-selected, not Seed §15 rubber-stamp.

## Seats (practice axis)

1. Immigration pathway / service-eligibility ops  
2. IRCC reference-data currency  
3. Canadian privacy / CASL / SMS & email consent  
4. Immigration consultancy desk operations  
5. Platform ads / Meta policy & feed trust  
6. Payments / escrow (firm↔Om Coda)  
7. Consultancy CRM / book-connection  

Explicit non-seats remain: Engagement-methodology SME, analytics-as-SME, selector-as-domain-SME, Agent-as-persona.

## Intended-product constraints this axis **modifies** (not new World seats)

These are Handoff absorb targets. They are **not** founder-invented Seed closures. They **are** the practice residual Seed already crossed. Where Handoff still says NEEDS VERIFICATION, this spec keeps that marker.

### Service eligibility (seat 1) — language the product must use

- **Service-eligible** = firm-offered service family with positive B-* **and** a confidence tier — never “will get ITA” / CRS-competitive (`elig-03`).
- Pathway pass may assert only after published version encodes program minima; non–EE base PNP is out-of-pack until stream rules are versioned (`elig-01`, `elig-02`).
- Analysis never-sees: province-would-nominate; arranged-employment CRS boost unless MI republishes; Tower-as-IRCC-determination (`elig-02`, `elig-11`, `elig-15`).
- Forms = offhand self-reportables only; PDFs/letters/certs/bank/medical → Manage (`elig-05`) — same DNA as Seed field-class law.
- **Reactivation-worthy (practice proposal for Story silence):** material service-posture change (new minima/category/draw clear, nomination/offer/cert, time-critical ops windows); missing self-reportables = nudge-only unless those windows fire (`elig-04`).  
  **Promotion status:** this fills a Story **silence** with SME mechanism. It is **not** automatically Story must. Named in `08-uncertainty/` as absorb-vs-promotion.
- Every assertion carries confidence tier (insufficient / provisional / document-backed) (`elig-14`).
- Firm overlays = catalog mapping, reactivation thresholds, province-stream add-ons; IRCC minima/CRS arithmetic house-locked (`elig-16`).
- Unknown program-minimum → hard-fail pathway-pass; emit insufficient-facts (`elig-22`).
- Stale/missing reference → suppress draw/category reactivation (`elig-25` ↔ XC-01).

### Reference currency (seat 2)

- V1 table families: NOC+TEER, category membership, round/cutoff ledger, CRS+FSW grids, language equivalency (`ref-01`).
- Canonical sources = Canada.ca (+ MI round ledger); third-party = discovery only.
- New publish = current for subsequent evals; prior signals retain pin; cutoff publish enqueues re-eval deltas — **never auto-fire outreach solely on a number move** (`ref-11`/`ref-12`).
- Wrong public-reference constants = house ops liability; pathway advice = firm (`ref-18`).
- Packs reference table keys/version pins only; reject numeric public-criteria literals (`ref-26`).

### Consent (seat 3) — Seed “do not skip opt-in” densified

- CEM triad (consent + ID + unsubscribe) hard-gates every firm-branded email **and** SMS (`casl-01`).
- Express consent = affirmative, unchecked-by-default Agree (`casl-03`).
- Cold “email the book for consent” forbidden (`casl-04`).
- DB authorization is **orthogonal** to client CEM consent (`casl-20`) — Seed §8.2 restated as ledger law.
- Silenced = hard enrollment inhibitor across phases until new affirmative express (`casl-15`).
- Agent first-text = CEM by default (`casl-16`). Website-harvested addresses are non-sendable without independent basis (`casl-18`).
- Reachable ≠ permission-to-send (`casl-25`).

**Geography regimes (Seed KU #14):** SME gives Canadian CASL/PIPEDA mechanisms. Other geographies remain KU. Expanding geography is a **founder-only** class item (`DECISION-CONSTITUTION.md`).

### Desk ops (seat 4)

Accountability minimum: send-identity, armed/active, per-contact phase/silence, chronology of fired. Board never-sees vanity-as-governance. Live brief is screening-for-discussion, not advice/guarantee (XC-02).

### Ads / Meta (seat 5)

Approach remains product surface. Ad = legibility. Outsized-but-true claims must survive platform review. This axis **modifies** copy/gates on Approach; it does not replace ALG.

### Escrow (seat 6)

Commercial surface exists; **release unit** remains a Seed KU. Counsel-gated money-transmitter boundary (`esc-21`) is `BLOCKED (counsel)` — a named founder/counsel gate, not a catch-all TBD.

### CRM / book-connect (seat 7)

Ingestion earns the reachable book. Bidirectional CRM sync remains Seed KU #7 (deferred). Field mapping / dedup are capability-adjacent (C4).

## Cross-cuts that must stay joined (do not split columns)

| Id | Edge |
|---|---|
| XC-01 | Pack assertions ↔ reference currency |
| XC-02 | License-defensible Analysis / forms / brief |
| XC-03 | Consentful send + templates + halt |
| Others in CROSS-CUTTING.md | ads↔first-text; escrow↔book-connect; eligibility↔desk |

## Absorb vs redesign

Handoff forbids new World seats without room sign-off. This specification **does not mint seats**. Practice findings land as criteria, never-sees, gates, and How-leaf requirements on the existing lattice.


===== 06-sme/CAPABILITY-ABSORB.md =====

# Pass 6b — Capability SME absorb (adds product that practice could not see)

**Method:** `docs/sme/DOCTRINE-sme-cto-implementation.md` §1–§3 · `docs/sme/capability/00-ROSTER.md` · `docs/sme/capability/CAPABILITY-CONSIDERATIONS.md`  
**In-repo status:** Capability paper done; **Register absorb not started** (`capability/00-ROSTER.md` last line).  
**This experiment’s job:** fold the revealed surfaces into the intended-product specification as **additions**, tagged exists / partial / new, without pretending they were in Seed as modules.

Capability *adds*. Compliance *modifies*. A proficient generalist CTO does not own these depths by default — they are not “CTO handles it.”

## Revealed homes (must appear in the intended product)

| Id | Capability | Revealed home | Status vs register |
|---|---|---|---|
| C1 | Email/SMS deliverability | Operator house-global **Sending infrastructure** + suppression model consulted by send gates | **new** (from-address strategy partial) |
| C2 | Agentic engagement runtime | Attempt/channel state machine (partial, documented) + **Conversations / reply-triage** + human-in-loop escalation into support | **new** / runtime **partial** |
| C3 | Eligibility + reference pipeline | Ingestion + version-diff + re-eval on write-back + freshness flags | pipeline **new**; module shell exists |
| C4 | Book ingestion / identity | Field→Q-ID mapping, dedup, validation-class checks | **partial** / incremental CRM **deferred** (KU #7) |
| C5 | Forward-deploy generation | Public-facts enrichment + template hydration + no-login token + branding extraction | generator **new**; Prepared Workspace surface **partial** |
| C6 | Escrow mechanics | Escrow ledger + outcome-verified release | ledger **new**; release **partial**; money-transmitter **BLOCKED (counsel)** |
| C7 | Instrumentation | Event ingestion + metrics store + deliverability telemetry | **new** (dashboards as shells) |

## Highest-leverage connective tissue (C1 ∩ C2 ∩ C7)

A send fires → deliverability telemetry → reply capture → runtime decision → metric. That **messaging event stream** is named as not existing yet in the capability roster. Intended product requires it. Surface intent for the stream itself is `none` until Oversight / Firm health / Conversations **view** it.

## How this folds without minting World parties

| Addition | Lands on existing World/Persona surface |
|---|---|
| Sending infrastructure | House-global (operator) — personas already folded deliverability into bind + health; capability says that collapse **under-specified the specialty**. Fold as its own module under house-global, not a new persona. |
| Conversations / reply-triage | Operator — distinct from read-only Engagement record (World §3.2 still holds: record is not the brain). |
| Reference ingestion | Operator · Reference data (shell exists). |
| Forward-deploy generator | Operator · Activation & forward-deploy (surface exists; generator does not). |
| Escrow ledger | Operator · Commercial (surface exists). |
| Event/metrics pipeline | Feeds Oversight / Firm health / Acquisition instrumentation (shells exist). |
| Suppression model | Consulted by Firm operations bind · Send gates (no new persona). |

## Agent-codeable vs human residue (`AGENT-VS-HUMAN-PROVISIONING.md`)

Every technical handoff splits:

- **Agent-codeable:** wire Resend/Twilio, consult suppression, enqueue re-eval, hydrate templates from stored public facts.
- **Human-provisioning residue (true per-firm onboarding cost):** DNS for branded sending domains, escrow account setup, CRM OAuth grant at a real practice, Meta ad account, counsel on transmitter boundary.

Residue must not vanish into “CTO handles it.” It is activation/ops cost, not a Seed click-budget item.

## Register absorb status (honest)

This specification **does** fold the additions into the intended product (method: fold before build). The in-repo How trees / Outcomes files at this SHA have **not** all been rewritten to name Sending infrastructure / Conversations. That is a named remaining Register-absorb job, not a reason to omit the additions from “intended.”

Capability Pass1 depth (warmup schedules, DMARC alignment numbers, dedup thresholds) is **not** required to specify that those homes exist. Unfilled numeric practice is KU / specialist paper, not a founder-only gate — except C6 counsel block.


===== 07-phase-two/MODULE-FLAGS.md =====

# Pass 7 — Phase Two (same method, micro scale)

**Sources:** `docs/register/PHASE-TWO.md` · `docs/register/PHASE-TWO-LOG.md` · `docs/register/AGENTS-FACE.md` · `docs/register/AUTOMATIONS-FACE.md` · `docs/register/PRIMITIVES.md` · `docs/register/SYSTEMS-GOAL.md` · `docs/register/SYSTEMS-OBJECTIVE-ESCROW.md` · `docs/register/SYSTEMS-CHANGE-PACKET-022.md` (header/status as present at SHA)

Phase Two is **not** a second Seed/World. The app is largely there; founder prompts “I should be able to …” map to missing **component** and/or missing **system**. Module-by-module, with perimeter.

## Flagship — what Agents is (2026-08-15 15:43 UTC)

**Founder wording. Do not enrich into a generated list.**

Agents is the place where the **operator** defines:

- **Outreach sequencing** — not only the sequence itself, the **order in which outreach is deployed**.
- That sequencing **per firm or as a default**, and other kinds of **overrides**.
- **Escalations** between attempts (retry / attempt rules). “Nodes” is the weaker phrasing.
- A **goal / goal criteria**. The goal is itself an **escalation point**: to **other agents**, to **other workflows**, or **it ends there**. Once it is met, it is met. That is the **endpoint**.
- Everything in the middle of that is **modular**.

Author seat = **operator**. Firm / default / overrides = **scope of application**, not the nature of the module.

The 14:58 numbered list (including triggers as Agents interior) is **not** the flag.

## App-facing Agents grain (AGENTS-FACE — law of the face)

This is PM face law for the operator authorship module. It does not overwrite 15:43. It does not mint tables.

- A **sequence** is a blank container. It can hold **multiple campaigns**. Each campaign = **one objective**.
- Two objectives → two campaigns. When a campaign’s objective is met, you may string the next. That distance is **not** a qualify node. Captions on plates are not spec.
- **Objective ≠ sequence.** Opt-in / re-engagement / reactivation are **sequence templates**, not objective picker labels.
- First thing on a campaign is the **objective**. Untemplated objective = **binary event** (click this link / book this calendar / submit this form). Then name it.
- Channels are the **medium**. Channel rules = escalation on that medium. Attempt rules are **not** at the channel. An attempt is a **cycle** of the same sequence.
- Sequencing (how many channels, order) lives at **campaign** level.
- Content lives **inside** the channel node (Override content).
- **Override this** on a campaign reveals channel nodes as wires. Toggles do not migrate.
- Rules nest like CSS: global (Agents Settings) → sequence Settings → campaign override → channel. No override → fall back up.
- Empty world: no templates until authored.
- Enroll on this sequence’s Contacts **starts the mission now**. Automations enroll is the other door (on an event).
- Engagement chart is a tree of outreach. It does **not** draw lineage to the creating trigger. Lineage is queryable (Automations).

**Spoken ladder in mocks includes call.** Stood-up machine still has **form**. Do not silently drop form. Call-on-face is enrichment; form-in-machine remains Seed/World/Story 7b.

**Hub vs Ant:** product face = `/prototype-ant`. Hub is not the app. How trees still mark Hub as existing-wrong-seat for authorship; Ant workbenches are the translation of operator Configuration libraries.

## Automations — entered from Agents outskirts (AUTOMATIONS-FACE)

Automations is the **brain / operations**. Agents is where people are sent to a goal.

Definite middle: **On this event** (schedule or trigger) → **perform this operation** → **on this kind of result do X / on that kind do Y**. DAG-like. Smallest legal workflow = trigger · rule · action. Canvas can **chain**.

Join laws that are specified:

- Forms (data requests) are created in **Automations**, not Agents.
- A data request is already an event of origin for Agents (recursive).
- Automations does **not** create agents. Assign existing, or create from a template.
- Select an agent = the whole sequence. Campaigns live inside sequences.
- A rule is a composite of conditions + constants; togglable outcome families; GUI default, named code escape.
- Rule may emit re-engagement and/or reactivation signals — one, the other, or both. Engine 2 still chooses one motion.
- **Required data** is a missing output class (listing, not a flag). Forms bind to that listing. Deterministic — no AI to decide required fields.
- Two grains of condition: inside the rule (field · operator · constant) vs If node after previous result. Do not collapse.
- Events have **global** and **local** grain. That is not “Settings.”
- All objectives are events. The write-back **is** the event. No special return wire.
- Campaign failure is an event; in-app action may ascribe a tag.
- After a node: **every write that run made**. Next node picks. (`PRIMITIVES.md`; SA 015 is the walk — this experiment does not recut it.)

## Primitives (listen / do)

**Listen:** in-app event (Global or Local) · Schedule · Manual · Webhook (in from outside — not an action).

Named in-app events (shape so far — not “any row changed”): form submitted · campaign failed · opted out · firm created · audit finished · contact file imported · objective met.

**Do:**

1. **Agents** — assign existing sequence, or from a template. Do not author a new agent in Automations.
2. **In the application** — ascribe a tag · run an audit · who this applies to · make a form · provision a firm (later). Not “write whatever table.”

## Three layers any inhabited Agents description must name

1. **Authorship** — operator defines sequence, order, content, attempt rules, firm/default/overrides, campaign composition, goal as completion, success destination, failure.
2. **Record** — Board / Client Data Activity show what actually ran.
3. **Unattended** — tick, inbound, send, completion, exhausted-campaign failure. Nobody present. Panes must stay true after the operator leaves.

Layer 3 is still app-facing. It is not Automations’ graph.

## Parked founder expansions (not Story musts)

### Goal / class-as-objective (`SYSTEMS-GOAL.md`)

Goal = completion of an objective. Sequence classes = classes of objective (opt-in, re-engagement = data request, reactivation = meeting request). Mini-goals are checkmarks inside a class. Escalation already has levels; **goals as escalation events** emerge between campaigns. Reactivation’s completion **is** meeting booked.

**2026-08-21 mechanism note (does not change the wording rule):** objective met is akin to a Local event; housing is the event mechanism Tower already has; 15:43 escalation destinations need **no destination column and no `goal` table** — escalation is a **subscription** to `objective_met`. Story §7 promotion remains a **wording** must, not a structural one.

### Objectives as billable unit (`SYSTEMS-OBJECTIVE-ESCROW.md`)

Direction, **not a build order**. Objective is the billable unit. Pursuing / Exhausted (stop spending, keep listening) / Nullified (firm withdraws money; inbound refused). Exhaustion is ours; nullification is theirs. Do not extract Requirements until Story §3 is promoted.

## Perimeter opened from Agents (not fully redesigned here)

Automations (when / motion / structured info / forms / in-app actions) · firm/contact bind · what goes out (send) · book-in · Activity record · meeting_booked (system 12) as loop win, distinct from authored goal-criteria.

## Open tinkering (do not fill)

From AUTOMATIONS-FACE “Open”: full operations list; full exit-point list; form-as-node vs embedded (lean embedded); remaining rule output classes besides required data; queryable lineage not minted as a table from a sentence; spoken “call” vs form on the machine.

From AGENTS-FACE: window’s named “one thing” left open as a name; mix types; deeper-than-channel grain.

These are **named opens**, not catch-all TBD.


===== 08-uncertainty/GATES-AND-SILENCES.md =====

# Pass 8 — Named gates, silences, and what this specification will not invent

**Method:** Seed §13–§14 · Story silences master list · `docs/method/DECISION-CONSTITUTION.md` · SME Handoff NEEDS VERIFICATION / BLOCKED (counsel)

Catch-all “TBD later” is forbidden. Every hole is a **named** silence, KU, Blocked(counsel), or founder-only class item.

## Founder-only class (proceed autonomously except here)

From Decision Constitution (portable list; product may refine; this experiment does not expand it):

- World / persona seat minting or retirement
- Hard-stop / never-invent doctrine changes
- Money-door / escrow release unit changes that alter the commercial bet
- Geography / regulatory regime expansion that reopens SME seats
- Explicit `BLOCKED (counsel)` adjudication

**Not founder-only:** How-leaf densify, capability module folding, table-first extraction, Phase Two component/system classification, SME absorb of existing commitments.

## Story silences (not filled)

| Silence | System | Notes |
|---|---|---|
| Escrow **release** definition | 3 | Seed KU #1. C6 / OBJECTIVE-ESCROW propose direction (objective met). Not promoted. Counsel block on transmitter boundary. |
| Shape of database authorization | 3 | Seed KU #2. CRM OAuth vs CSV. Must not migrate into click budget. |
| Ongoing SaaS packaging vs escrow peer door | 3 | SaaS later allowed as KU; not a peer door at activation. |
| Email earns Meta entry; Meta CAC | 1 | Seed KU #3, #8 |
| CASL/SMS consent regimes **beyond Canada V1** | 6, 1 | Canadian mechanisms exist via SME; other geos = founder-only expansion |
| Reactivation-worthy criteria | 11 | SME `elig-04` proposes; **not Story-promoted** |
| Attempt criteria windows (product lock) | 7b | OPERATOR-REVISIONS 30 min / 24 h not Seed/World law |
| SMS reply-failure escalation | 7b | Seed KU #15 |
| Event-trigger set; Operations & Actions stubs | 10 | Phase Two primitives name a **shape list**, not a complete catalog |
| Import fully mutates living list | 5 | Honesty + C4 |
| D-01 / D-02 loop-closer builder | 12, 11 | Seed KU #5 |
| Client desk depth | 8, 12 | Seed KU #4. V1 = touchpoint-only. Full console is never-invent until KU closes |
| Multi-consultant roles | 4 | Seed KU #6. World did not mint parties |
| Rule-pack IP/liability; Constants beyond Immigration | 9, 10 | Seed KU #9, #16 |
| Workflow persistence target | 10 | Seed KU #12 |
| Rules UI toggles vs condition trees | 10 | Seed KU #13. Automations-FACE looks at Hub toggles as end-goal grain — alignment later, do not silently kill either |

## Parked expansions (durable, not law)

| File | Grade | What would promote it |
|---|---|---|
| `SYSTEMS-GOAL.md` | OPERATOR-REVISIONS grade | Story §7 wording must (mechanism of 022 may already house it) |
| `SYSTEMS-OBJECTIVE-ESCROW.md` | same | Story §3; founder said not a build order |
| OPERATOR-REVISIONS attempt windows | same | Story 7b product-lock of windows |
| Call channel on Agents face | face enrichment | Do not drop form from machine; call not mocked as full |

## SME / capability named blocks

- `BLOCKED (counsel)` money-transmitter boundary (C6 / esc-21).
- NEEDS VERIFICATION items remaining in Handoff — do not silently close.
- Capability Register absorb not started in-repo How/Outcomes files — specified here as intended additions.

## Orchestration gates still open at this SHA (`ORCHESTRATION.md`)

- [ ] `wiring-synced` → deep CT on cross-cutting surfaces
- [ ] `ct-verify-green` → Translation

Those are **build/verify** gates. This experiment is specification of the intended product, not CT verify. They do not block stating the intended product. They **do** block claiming the product is shipped.

## Never invent (repeat of Seed §14 as experiment law)

This specification will not: public-before-contact Core detection; Agent persona; Client operator console; Operator as Board login; credits/sales-call peer doors; DB auth inside click budget; skip opt-in because ALG; cold email V1 Approach; fill escrow release; mint a `goal` table from chrome; treat Hub as the app; treat captions as nodes; recut walker 015; hard-code desk rows as spec.

## Conflicts named, not adjudicated beyond method

1. **Hub vs Ant vs Configuration libraries.** How: authorship = operator libraries; Hub = wrong-seat. Phase Two: product face = Ant; Hub = plant for Rules grain. **Not a contradiction** if Ant is the translation of operator libraries. It **is** a contradiction if someone treats Hub as the consultant desk or as the app.
2. **15:43 goal-as-escalation vs Story 12 meeting_booked.** Meeting booked is the loop win / reactivation class completion. Authored goal-criteria on a campaign is a **different grain**. 022 says escalate by subscription to `objective_met`, not a destination row. Story promotion of wording still open.
3. **Seed Automations stub Operations/Actions vs Automations-FACE in-app actions.** Face names a shape list (tag, audit, form, …). Catalog is not complete. Do not kill Seed stub honesty or the named primitives.
4. **Capability Conversations surface vs World “record is not the brain.”** Conversations is triage of inbound for operator; the engagement record remains chronology. Do not merge them.
5. **Consultant does nothing vs Phase Two operator Agents density.** Consistent under ALG: consultant does not author; operator/house does. If a firm-operator were to author, that would be a **persona/World seat change** (founder-only). Current law: firms do not author packs.

## Pass result

Uncertainty is explicit. The specification can complete without filling these holes.


===== 09-revisions/DOWNSTREAM-PASSES.md =====

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


===== SPEC/TOWER-INTENDED-PRODUCT.md =====

# Tower — Intended Product Specification

**Contestant:** Omcoda (Contestant 2)  
**Framework:** Om Coda Register method (Seed → World → Systems Story → Systems Requirements ∥ Personas & Function → bind → SME practice ∥ capability → Enrichment/Furnish context → Phase Two micro-pass)  
**Source SHA:** `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`  
**Posture:** under-claim. Intended product, not as-built honesty. Where Seed/World/Story are silent, this document names the silence. It does not invent a founder decision.  
**Companion extracts:** `01-seed/` … `08-uncertainty/` in this artifact root.

This is a Register-shaped specification of **what Tower must be**. It is not a generic PRD, not an implementation plan, and not a claim that the pinned snapshot is shipped.

---

## 0. Method pins (how this document was produced)

1. **Seed is the dump.** Business facts come from `docs/register/SEED.md`. Nothing outside that dump plus later locked Register/SME/Phase Two founder wording is treated as product truth.
2. **World is derived, not filled.** Ecosystem, hops, and gates only. Treatment of seats is Personas craft, still from World.
3. **Two columns.** Machine (Story → Requirements → tables + dumb runtime) runs parallel to faces (Outcomes → How). Bind is late: controls change existing states; panes show existing states.
4. **How Analysis.** Human subjects only. DNA cuts. User-visible until leaf. Consultant core = hand-over · authorize · receive. Engagement machinery is requirement, not outcome.
5. **Practice SME modifies; capability SME adds.** Neither mints World seats. “CTO handles it” is not a terminal classification.
6. **Phase Two** is the same method at module grain. Agents flagship **15:43 UTC** is founder wording and is not replaced by a generated list.
7. **Decision constitution.** Work proceeds except at named founder-only gates. Catch-all TBD is a method failure.

---

## 1. What Tower is

**Company:** Om Coda. **Buyer:** immigration consultancies (B2B firm operators). **V1 geography/program shape:** Canadian immigration pathways (Express Entry / CEC / FSW / FST / PNP and related). Other countries are not forbidden later; they are a founder-only geography expansion.

**Product bet:** Firms pay for an always-on system that engages dormant and active contacts, keeps immigration facts fresh through firm→client touchpoints, re-evaluates **service eligibility** as IRCC-shaped rules and client facts move, and surfaces when someone is campaign-worthy — so consultants book meetings without manually rechecking every file.

Tower is **proactive eligibility wrapped in engagement**. It is not a reactive CRM, not a public finder of end-clients, not a money transmitter of immigrant funds, not an Agent desk (Agent is a feature), not a full end-client operator console in V1.

**Growth bet (ALG):** One tap in a Meta feed yields name + website + phone/email inside a click budget; the system forward-deploys a no-login prepared campaign under the firm’s identity; an agent (presentation only) earns database authorization and escrow; then the campaign **runs**. Assisted / operator-led entry (OLG) remains a real second door into the **same** application.

**Agency shape:** Om Coda runs Tower across firms. Evaluation rules, analysis, operational logic, engagement templates, and reference upkeep belong to an **operator/house** layer — inspectable and changeable without a code deploy (open box). The firm inhabits the book and the meetings. Firms do **not** author packs. House authors; tenancy binds.

**One-line value:** Give us your contacts; we engage them, keep their immigration picture current, and surface when eligibility changes — without manually rechecking every file.

---

## 2. Facets and finish lines

| Facet | Meaning | Finish line |
|---|---|---|
| **Acquisition** | Cheap inputs to *provision*, inside click budget | Name + website + one channel (phone **or** email) |
| **Activation** | Path from provisioned stranger to *run* | Database authorization **and** escrow acceptance |
| **Application** | Desk performing once running | Continuously toward **meeting booked** |
| **Evolution** | Register-driven product change | Not a client lifecycle phase |

**Immutable walls:** Click budget cannot pull hard inputs backward. Forward-deploy is activation, not acquisition. Application desk is not shrunk to make ALG cheaper. One Approach per acquired non-house party (V1: Consultant). Engagement contacts are never acquired via Approach. House is never acquired via Approach.

**Contingent cost:** First ALG money door is **escrow** (firm↔Om Coda). Credits and sales-call are not peer doors at that moment. End-clients pay Tower nothing. Detection is free to the contact. **Escrow release definition is unspecified** (named silence).

---

## 3. Parties

| Party | Role in the intended product |
|---|---|
| **Firm** | Tenancy. Owns users and the private book. |
| **Consultant** | Sole acquired **persona**. Hands over the book, authorizes, takes meetings, may halt what they will not stand behind. Does not author engagement/eligibility operations under ALG. |
| **Engagement contact** | Referenced participant. Consents or silences, answers self-reportable facts, books. No payment to Om Coda. No V1 branded Tower operator console. |
| **Operator** | One house human, many surfaces (house-global + per-tenancy). Authors packs, binds tenancies, oversees, supports. Not a firm Board login persona. |
| **Agent presentation** | Feature across Approach, prepared workspace, and routing. Never fulfillment. Not a seat. |

Multi-consultant roles/permissions inside a firm are **open**. This spec does not mint extra firm-side personas.

---

## 4. Molecular outcomes (face track)

**North star — Consultant Core**

> As Consultant, I can hand my private book to Tower and authorize it to work under my license, and get eligible clients booked onto my calendar — without setting up, configuring, or running any of the engagement myself — so that an eligible contact arrives at a booked meeting already re-engaged and current.

**How DNA (leaf grain):**

1. On **Prepared Workspace**, complete **Authorize book** and **Accept terms** (license + escrow). Those two commits are the activation hard inputs.
2. After running, **Meetings** receives booked rows with a **Live brief**. Board shows phase chips as inhabit. The consultant never opens Configuration libraries to produce motion.

**Secondary outcomes (complete lattice):**

- Consultant: **Governance** (see / halt) · **Access** (OTP → firm workspace).
- Engagement contact: **Consent** · **Refresh facts** (one consolidated self-reportable form) · **Silence** · **Book**.
- Operator house-global: **Acquisition & ads** · **Activation & forward-deploy** (candidate co-core) · **Reference data** · **Configuration libraries** · **Oversight** · **Audit trail** · **Register & evolution** (prototype-time house tooling; **shipped product contains no Register**) · **Founder & agency controls**.
- Operator per-tenancy: **Provision** · **Commercial** · **Firm operations bind** · **Book readiness** · **Firm health** · **Activation state**.
- Operator support: **Keep the firm running**.

**Closure:** Consultant core → contact arrives re-engaged → Book → Consultant takes the meeting. No outcome is subjected to Tower.

How trees for every outcome exist at `docs/register/how/`. This spec does not rewrite them. Index: `04-faces/HOW-LATTICE.md`.

---

## 5. The machine (twelve systems)

UI is not the system. The system must pre-exist the UI. Faceless events are first-class.

### 5.1 What the whole machine must continuously do

While a firm has contacts and hands-free is armed: engage · refresh facts · re-evaluate service eligibility · surface campaign-worthy people toward **meeting booked**.

### 5.2 Systems

1. **Acquisition** — Meta Approach; one-click constraint; legible output; continue-scroll; persist/attribute capture. Must not pull DB auth or escrow into the click budget; must not treat forward-deploy as acquisition; no cold-email V1 Approach.
2. **Provision / forward-deploy** — On seed land, scrape **public** firm facts, instantiate **Om Coda** methodology templates (launch → re-engagement → reactivation), serve no-login prepared workspace. Must not derive the campaign from the private book before authorization.
3. **Commercial / hard-input** — Land DB authorization + escrow; flip `campaign_state` to **running**. Escrow only as peer door. No immigrant settlement funds.
4. **Tenancy & access** — Versioned seed manifests; passwordless OTP; unprovisioned email → generic 200, no code; ALG and OLG land in one session matrix.
5. **Reachability / audit** — One question: can we reach them and start a sequence? Verdicts reachable / partial / unreachable. Sequence-ready gates enrollment. Not scoring, not ROI, not sales ceremony.
6. **Consent / suppression** — Opt-in before deep collection; silenced when not opted in or when opted out. Firm DB auth ≠ end-client consent.
7. **Engagement / sequencing** — Two engines, never conflated:
   - **7a Campaign calendar** — day-ordered content under Engine 2 precedence.
   - **7b Attempt / channel-ownership** — one owning channel at a time; waits nest under the failed owner; forward-only when criteria met; live inbound can override; finishing event closes and can arm the next. Engagement **record** authors nothing.
8. **Fact-refresh** — Nudges collect. Field class: self-reportable → forms; document-dependent → **never** a form (Manage); employer-directed → firm. Any write-back → immediate re-evaluation. Missing fact → signal.
9. **Reference-currency** — Versioned IRCC-shaped tables as **data**. A reference move is a faceless trigger. No code deploy to update facts.
10. **Eligibility re-evaluation** — Private book only. Trigger → Constants → Conditions → Rules → structured output. Pathway pass = **any** pathway assertion, not one favoured pathway. Analysis readout with machine output retained. Every determination (including missing-data) is a signal. Open-box.
11. **Engine 2 (signal / motion)** — Record every detection. Decide outreach separately: reactivation first; nudge only otherwise; one form consolidating all outstanding self-reportables; secondary signals as brief agenda; **one client, one motion, ever**.
12. **Meeting / loop-closer** — `meeting_booked` is the success event. Outstanding self-reportables → pending capture. Write-back → re-evaluate. Brief is **live**, not a snapshot.

### 5.3 Self-feeding ring

```
seed_capture → firm_public_facts → prepared_workspace
  → (database_authorization + escrow_acceptance) → campaign_state=running
      → reachability → sequence_ready → engagement
      → fact_ask / fact_writeback ─┐
      reference_version ───────────┼→ eligibility_evaluation → signal → motion_decision
                                   │                              ↓
                                   └──────── missing_fact_signal ←┘
meeting_booked → pending_capture → fact_writeback → live_brief (recompute)
```

Faceless injectors: `reference_version`, `fact_writeback` / `missing_fact_signal`, time/threshold criteria inside `active_attempt`, inbound override.

### 5.4 Table-first

The machine is **tables + a dumb runtime**. Kinds: **state | rule | sequence**. Anything that should be modifiable is a table. Runtime holds no content. Records that appear in a module come from tables — never hard-coded into the app.

### 5.5 Hard human gates the machine must not automate away

Seed capture · assisted provision · OTP · database authorization · escrow accept · client consent / not silenced · meeting booking · firm refusal of illegal/unethical outreach.

---

## 6. Workspaces and modules (faces)

### 6.1 Consultant firm desk (inhabit)

- **Board** — client list, phase signals (`view`)
- **Contacts** — directory, import confirm (assisted path)
- **Client Data** — profile, Q&A, forms, eligibility facts (`view` + capture)
- **Activity / Journey** — chronology of fired events (`view`; not authorship)
- **Meetings / Live brief** — take the meeting; brief recomputes
- **Halt** — governance initiation
- **Session** — OTP access

Hub inside the firm shell **today** is **existing-wrong-seat** for authorship. Intended authorship is operator Configuration libraries. Product face for operator translation = `/prototype-ant`. Hub is plant/reference, not the app.

### 6.2 Operator house-global

Acquisition & ads · Activation & forward-deploy · Reference data · **Configuration libraries** (Evaluation packs · Automation workflows · Engagement templates) · Oversight · Audit trail · Register & evolution (house tooling only) · Founder & agency controls · Customer support queue · *(capability additions: Sending infrastructure · Conversations/reply-triage)*

### 6.3 Operator per-tenancy

Provision · Commercial · **Firm operations bind** (published-only dropdowns: evaluation · automation · engagement; then Armed / Active) · Book readiness · Firm health · Activation state · Support context

Authorship → publish → bind → arm is the spine that lets the consultant “do nothing” after hard inputs.

---

## 7. Operator authorship grain (Phase Two, without overwriting Seed)

### 7.1 Agents (engagement authorship) — flagship 15:43

The operator defines outreach **sequencing** (sequence **and** the order it is deployed), **per firm or as a default** plus overrides; **escalation between attempts** (retry / attempt rules); and a **goal / goal criteria** that is itself an **escalation point** — to another agent, to a workflow, or it ends. Once met, met. Everything in the middle is modular.

App-facing container (does not replace the flag):

- **Sequence** = blank canvas that can hold multiple **campaigns**.
- **Campaign** = one **objective**. First thing on a campaign is the objective.
- Untemplated objective = binary event (happened or it didn’t), then named. Templated objective populates the campaign.
- Sequence templates (opt-in / re-engagement / reactivation) ≠ objective templates.
- Channels = medium. Channel rules = escalation on that medium. Attempt = cycle of the same sequence. Attempt rules are not at the channel.
- Sequencing (how many channels, order) at campaign level. Content inside the channel node.
- **Override this** reveals channel nodes as wires. Rules nest like CSS (global → sequence → campaign → channel).
- Empty world: no templates until authored.
- Agents enroll **starts the mission now**. Automations enroll waits on an event.

Three layers that must all be specified: **authorship** · **record** · **unattended runtime**. A pretty editor whose Activity pane lies after the operator leaves has failed.

**Parked (not Story must):** goal = completion of an objective; classes of sequence are classes of objective; goals-as-escalation-events between campaigns. Packet 022’s mechanism (objective met as Local event; escalation as **subscription** to `objective_met`; no destination column / no `goal` table required) is **settled as mechanism** and still awaits Story §7 **wording** promotion. This spec records both facts and does not promote.

**Call** appears on the face because the founder asked to see the node. The machine still has **form**. Do not drop form.

### 7.2 Automations (operations brain) — entered from Agents outskirts

On this **event** (schedule or trigger, Global or Local) → perform this **operation** → on this kind of result do X / on that kind do Y. DAG. Smallest workflow = trigger · rule · action. Canvas can chain.

- Forms / data requests are created **here**, not in Agents.
- A data request is already an origin event for Agents (recursive join).
- Automations does **not** author a new agent. Assign existing, or from a template. Select agent = whole sequence.
- Rule = composite of conditions + constants; togglable outcome families; GUI default, named-code escape; industry-modular.
- Rule output may include re-engagement and/or reactivation **signals** and a **required-data listing**. Forms bind to that listing. Deterministic: no AI to decide required fields.
- Two condition grains: inside the rule vs If node on previous result. Do not collapse.
- All objectives are events. Write-back **is** the event. No special return wire.
- Campaign failure is an event. In-app actions include ascribe a tag, run an audit, make a form (shape list — not a complete catalog).
- After a node: **every write that run made**. Next node picks. That is the primitive. Walker 015 is the live walk; this spec does not recut it.

### 7.3 Primitives (what can happen / what we can do)

**Listen:** in-app event (Global or Local) · Schedule · Manual · Webhook (ingress, not an action).

Named events so far: form submitted · campaign failed · opted out · firm created · audit finished · contact file imported · objective met. Not “any row changed.”

**Do:** send people to a goal (Agents) · do a named in-app thing (tag, audit, form, …). Not “write whatever table.”

---

## 8. Practice constraints that modify the lattice

SME Pass2 + Handoff densify how committed work is done. They do not mint seats. Selected load-bearing modifications:

- **Service-eligible** is a firm-offered service family with B-* and a **confidence tier**. Never “will get ITA.”
- Analysis never-sees: province-would-nominate; Tower-as-IRCC-determination; arranged-employment CRS boost unless republished.
- Forms stay self-reportable; documents stay Manage.
- Reference tables pin evaluations; cutoff moves enqueue re-eval and **must not** auto-fire outreach solely on a number move.
- CASL CEM triad on every firm-branded email and SMS. Express consent unchecked-by-default. Cold “email the book for consent” forbidden. Reachable ≠ permission-to-send. Agent first-text is CEM by default.
- Board accountability minimum: send-identity, armed/active, phase/silence, chronology of fired — not vanity.
- **Reactivation-worthy** has a **practice proposal** (`elig-04`: material service-posture change) that would fill a Story silence. It is **not** promoted into Story in this document.

Counsel-gated: money-transmitter boundary. Named `BLOCKED (counsel)`.

---

## 9. Capability additions (not visible on the practice axis)

These homes are **intended**. In-repo How absorb was not started; omitting them would repeat the CTO-sink failure.

| Addition | Why the product cannot work without it |
|---|---|
| **Sending infrastructure** | Core motion is messaging; inbox placement is a specialty (domain auth, warmup, reputation, suppression). |
| **Conversations / reply-triage** | Hands-free attempt engine must read inbound; distinct from the engagement **record**. |
| **Reference ingestion pipeline** | Open-box reference module without a currency pipeline is a shell. |
| **Book identity / dedup** | Reachable book is earned at ingestion, not only at Audit chrome. |
| **Forward-deploy generator** | Prepared Workspace without public-facts hydration cannot prove readiness. |
| **Escrow ledger + verified release** | Commercial surface without ledger cannot hold contingent cost. Release **unit** still a silence. |
| **Event / metrics pipeline** | Oversight and Approach instrumentation are otherwise empty shells. |

Connective tissue: messaging event stream shared by C1, C2, C7.

Human-provisioning residue (DNS, escrow accounts, real CRM OAuth, Meta ad account, counsel) is per-firm cost, not click-budget work, not “CTO handles it.”

---

## 10. Intended vs as-built (honesty, not a reduction of the bet)

Seed §11 and the GO cutover log are honesty about **progress**, not a rewrite of intended product.

**Went real (when secrets + DB are good):** Resend CEM, Twilio SMS, OTP mailer, sending domains, Postgres halt/consent/CRM grant/audit/primary store, Resend webhooks → messaging_events, worker tick, access links.

**Still stand-in / deferred:** Meta ads, escrow fulfillment, enrich crawl, Postmaster, warmup counters, list-unsubscribe ingress.

**Map-only vs Postgres:** some Story nodes (e.g. `state.finishing_event`) live on `/system-map` without being first-class PG tables. Name the split; do not confuse map, migrations, and named silence.

**Product face:** `/prototype-ant`. Hub is not the app.

Claiming production ALG Approach, live escrow, or full always-on eligibility as **shipped** would violate Seed §14.

---

## 11. Never invent

Public-before-contact end-client eligibility as Core · Agent seat · full Client operator console (until KU #4 closes) · Operator as firm Board login · credits/sales-call as peer activation doors · DB auth or escrow inside click budget · forward-deploy as acquisition · skip client opt-in because ALG · cold email V1 Approach · treating sales HTML as Audit · minting tables from pictures · treating plate captions as nodes · overwriting the 15:43 flag with a generated list · filling escrow release · promoting parked expansions into Story.

---

## 12. Completeness of this specification

**Specified and clear (intended product):**

- Why Tower exists, who it is for, ALG vs OLG, agency/open-box shape.
- Finish lines, hard gates, never-invent walls.
- Human outcomes and How DNA for the north star and the operator authorship/bind spine.
- Twelve systems, Engine 2 precedence, two sequencing layers, field-class routing, faceless ring.
- Table-first / data-in-tables.
- Agents flagship + Automations definite middle + primitives (listen/do/handle).
- Practice modifications that Handoff already wrote.
- Capability homes that must be added.
- As-built honesty vs intended.

**Specified but not closed (named, not invented):**

- Escrow release unit; DB-auth shape per stack; SaaS later packaging.
- Reactivation-worthy as Story must (practice proposal exists).
- Attempt window product-lock; SMS Y-reply escalation.
- D-01 / D-02 loop-closer builder representation.
- Client desk depth; multi-consultant roles; CRM bidirectional sync.
- Rule-pack IP/liability; Constants beyond Immigration; geography beyond Canada.
- Full Automations operations / exit catalogs; form-node vs embedded (lean embedded).
- Story wording promotion for goal/objective; Story §3 promotion for billable objectives.
- `BLOCKED (counsel)` transmitter boundary.
- Capability Register absorb into in-repo How/Outcomes files (specified here; not edited in Tower source).
- Build/verify gates `wiring-synced` and `ct-verify-green`.

Under Omcoda method, a specification is **complete** when remaining holes sit in those named classes — not when every KU is filled. Filling them here would be inventing founder or counsel decisions.

**This assignment therefore stops:** the intended Tower product is specified coherently on the Register spine; residuals are explicit; further work is either implementation (forbidden here), Story promotion (founder-only), counsel adjudication, or specialist numeric depth that does not change product identity.

---

## 13. Downstream passes (do not change identity)

**Enrichment** (60 persona Can’ts) names design gaps (“Right now I can’t…”) after Function. **Furnish** (60 items) is supporting UI that does not change Core Function. Neither may smuggle a new World seat or Story must.

**Wiring** traces implementations in event language; trigger-ness is path-relative; a node is a named unit of state one rung above its operating language. Critical interactions are user-originated writes whose targets are read elsewhere. Paper wiring is design-invariant and may run parallel once capability handoff exists. Build cutover (Resend/Twilio/Postgres) is honesty about ports, not a reduction of ALG/escrow/eligibility intent.

**Operator-revisions** remain a grade below Seed/World: domain modularity and open-box are already World-supported; numeric attempt windows and Hub-as-everyday-consultant-chrome are not destinations.

v1 of this file is preserved at `SPEC/TOWER-INTENDED-PRODUCT.v1.md`. This section is the only addition in v2.
