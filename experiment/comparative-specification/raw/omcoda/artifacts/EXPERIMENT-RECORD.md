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
