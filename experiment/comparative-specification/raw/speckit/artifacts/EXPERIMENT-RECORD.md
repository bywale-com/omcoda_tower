# Experiment record — Contestant 3 (GitHub Spec Kit)

## Identifiers

- contestant_id: `speckit`
- started_at_utc: `2026-10-19T16:46:38Z`
- stopped_at_utc: `2026-10-19T16:53:52Z`
- confirmed_sha: `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7` (HEAD already matched; no checkout)
- git working branch created locally for methodology only: `cursor/speckit-methodology-fa8c` (not pushed)
- framework: GitHub Spec Kit CLI `specify-cli` **1.2.1** from `git+https://github.com/github/spec-kit.git@v1.2.1` (resolved commit `9dca9bf42a031765ee5e5f2371137f2f26967e11`)
- integration: `cursor-agent` (invoke separator `-`; skills in `.cursor/skills/`)
- extensions added: **none**. Git/GitHub extensions skipped (experiment forbids issues/PRs/push). Community brownfield extensions are discovery-only; not installed.
- uv: `0.13.1` installed via `https://astral.sh/uv/install.sh` because it was missing
- bundled workflow `speckit` (specify→plan→tasks→implement) was **not** executed; it would have implemented. Skills were run by hand with implement omitted.

## Initial approach

1. Create `/home/ubuntu/tower-spec-output/` and confirm SHA.
2. Install genuine toolkit as prescribed; record `specify version` and `specify init`.
3. Let installed skills decide sequence. Official existing-project guide: constitution from evidence, then SDD. Documenting the entire intended system **is** the assignment, so that was the specify feature (`001-tower-product`).
4. Do not seat as Tower Engineer/PM/SA. Read those files only as product evidence.
5. Do not push, open PRs/issues, or ask the founder for new requirements.
6. Stop before `/speckit-implement` / `/speckit-converge` / `/speckit-taskstoissues`.

## Install evidence

See `install/specify-version.txt`, `install/specify-init.txt`, `install/init-options.json`, `install/integration.json`.

Init output (abridged): Project ready; skills in `.cursor/skills`; next steps constitution → specify → plan → tasks → implement → converge; optional clarify / analyze / checklist. Script type `sh`. `--here --force --non-interactive --ignore-agent-tools`.

## First substantive artifacts

1. `.specify/memory/constitution.md` v1.0.0 — five principles from register/AGENTS evidence (Ant face, data-in-tables, tables+dumb runtime, named silences, write-set handle) plus boundaries and verification honesty. Snapshot: `versions/constitution/constitution-v1.0.0.md`.
2. `specs/001-tower-product/spec.md` — full intended-product spec (north-star consultant outcome, operator authorship, ten stories, FR-001–037, entities, success criteria, assumptions, named silences). Snapshot: `versions/spec/spec-v1-after-specify.md`.
3. `analysis/EVIDENCE-INDEX.md` — source map and conflict handling (stale README vs later register).

## Later revisions / discoveries

- Origin pull refs named by the snapshot were fetched: `pull/96` (PM packets: Test/Run/If-Switch/Get/Plate-read/…), `pull/86` (SA ascribes 013–028), `pull/110` (022/023 pocket). Used as product evidence, not as other contestants’ work.
- SHA migrations include `019`–`024`; docs/README still says `001`–`018`. Data-model follows SQL on this SHA; drift recorded as U-018.
- Clarify could not ask the founder. Session 2026-10-19 recorded “No” to inventing CASL / reactivation-worthy / escrow-release. Spec v2: `versions/spec/spec-v2-after-clarify.md`.
- Plan produced research, data-model, HTTP+primitives contracts, quickstart (validation, not implementation).
- Custom checklists: `product-coherence.md`, `honesty-and-silences.md` (reviewer-owned, left unchecked).
- Tasks T001–T056 are a remaining-work ledger against the brownfield tree. Banner forbids executing them in this experiment.
- Analyze report: no CRITICAL constitution hits; HIGH = remaining NEEDS CLARIFICATION by design; FR-032 lineage gap closed with T056 after first pass.

## How next steps were chosen

Spec Kit installed workflow + skills:

constitution → specify → (optional) clarify → plan → (optional) checklist → tasks → (optional) analyze → implement → converge.

Full quality-gate path used through analyze. Implement/converge/taskstoissues skipped as execution constraints (no product implementation; no GitHub issues). Bundled `specify workflow run speckit` skipped because it includes implement.

## Why continued / revisited / stopped

Continued until the assignment’s specification deliverable existed and Spec Kit’s pre-implement quality gates had been run. Revisited spec after clarify (session bullets) and tasks after analyze (T056). Stopped because:

- Intended product is specified from available material.
- Uncertainties are explicit rather than invented.
- Next Spec Kit step is implementation, which this experiment forbids.

## Time / resource notes

- Wall clock ~7 minutes of recorded timestamps from start file to bundle (16:46:38Z–16:53:52Z), plus prior reading inside that window.
- Network used for: uv installer, specify-cli git install, official Spec Kit docs, `git fetch` of origin pull refs 86/96/110.
- No other contestant directories were searched.

## File inventory

See `INVENTORY.md`. Primary bundle: `BUNDLE.md`.

Live Spec Kit native dirs (also mirrored under `native-mirrors/final/`):

- `/workspace/.specify/`
- `/workspace/.cursor/skills/speckit-*`
- `/workspace/specs/001-tower-product/`
- `/workspace/.specify/feature.json`
- `/workspace/.specify/memory/constitution.md`

Preservation root also holds `STATUS.json`, this record, `START.md`, `analysis/`, `versions/`, `install/`, `primary/`.
