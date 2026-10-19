# Evidence index — Tower intended-product specification

Contestant: speckit. Source SHA: `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`.
Fetched origin pull refs named by that snapshot: `pull/96` (PM packets), `pull/86` (SA ascribes/log), `pull/110` (SA 022/023 pocket).

## How claims were sourced

| Claim class | Primary sources |
|-------------|-----------------|
| Why Tower exists | `docs/register/SEED.md` §0.1–0.4 |
| Ecosystem / terms | `docs/register/WORLD.md` |
| Machine must / must-not / silence | `docs/register/SYSTEMS-STORY.md` |
| Human outcomes | `docs/register/OUTCOMES.md` + `docs/register/how/` |
| Personas / seats | `docs/register/personas.md` |
| Agents flagship (founder wording) | `docs/register/PHASE-TWO-LOG.md` 2026-08-15 15:43 UTC |
| Agents face law | `docs/register/AGENTS-FACE.md` |
| Automations face law | `docs/register/AUTOMATIONS-FACE.md` |
| Listen / do primitives | `docs/register/PRIMITIVES.md` |
| Data-in-tables | `docs/register/DATA-IN-TABLES.md` |
| Product face / standing laws | `AGENTS.md`, `docs/README.md` |
| Phase Two method | `docs/register/PHASE-TWO.md` |
| Deferred vs live ports | `docs/wiring/wire-log/GO-CUTOVER.md`, `MODULES-ALIVE.md` |
| PM interior packets | origin `pull/96` (`TEST-PACKET`, `RUN-PACKET`, `IF-SWITCH-PACKET`, `GET-PACKET`, `PLATE-READ`, …) |
| SA machine cuts | origin `pull/86` / `pull/110`; packets 015, 022, 023 on snapshot docs |
| Stood-up stores | `supabase/migrations/001`–`024` |

## Conflicts treated as evidence, not invented resolution

1. Root `README.md` still describes a mock-data UI prototype with no auth/API. Later register, `AGENTS.md`, migrations, and wire-service contradict that. **Intended product follows Seed/World/Story/Phase Two + Ant face**, not the stale README status line.
2. Story parks goal-as-escalation until promotion; Phase Two flagship and packets 022/023 specify objective-met as Local event and failure as stop-spending/keep-listening. Spec records both: flagship/packets as specified machine behavior; Story “not promoted” as a remaining governance tension.
3. `docs/README.md` inventory of migrations (`001`–`018`) is behind this SHA (`019`–`024` exist). Spec uses SQL on this SHA as stood-up truth.
4. Hub is “complete Automations” as plant; Ant is the product face. Spec does not treat Hub as the app.

## What was not used as product requirements

- Third-party Spec Kit commentary
- Other contestants’ work
- Founder questions (forbidden by experiment)
- Invented defaults for Story silences (CASL geography, reactivation-worthy, escrow release)
