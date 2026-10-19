# Experiment record — Contestant 5 (BMad Method)

## Initial approach

Treated the assignment as a BMad Method specification of an **existing** product, not as Tower Engineer/PM/SA seating. Confirmed SHA `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7` at HEAD (`2026-10-19T16:46:33Z`). Created `/home/ubuntu/tower-spec-output/` immediately.

Intended line: stable `bmad-method@6.12.4` module `bmm`. Did **not** switch to v7 preview-alpha.

Top-level `npx bmad-method@6.12.4 --list-tools` failed (`unknown option`). Official `install --help` documents `--list-tools` on the **install** subcommand. Cursor tool ID is `cursor`.

Installed:

```
npx bmad-method@6.12.4 install --yes --action install --modules bmm --tools cursor
```

into `/workspace` as methodology tooling (`_bmad/`, `.agents/skills` 29 skills, `_bmad-output/`). Installed `uv` 0.13.1 because skills halt without `uv run`.

Then executed **bmad-help**: catalog CSV + `resolve_config.py`. Optional items first (brief/recon), next required **PRD**. Architecture and epics required later. Build required by catalog but forbidden by experiment.

## First substantive artifacts

1. `BMAD-HELP-ROUTING.md` — catalog gates and skip list.
2. Extract digests (`planning-artifacts/_extracts/`) — SHA key docs, PR #96 packets, PR #86/#110 SA logs, migrations index. BMad “extract, don’t ingest.”
3. `bmad-product-brief` Create, headless Fast path → `brief-Tower-2026-10-19`.
4. `bmad-prd` Create, headless → `prd-Tower-2026-10-19` (FR-1–FR-39).

Origin pull refs **#86, #96, #108, #110** were fetched because this SHA’s docs name them as live spec. History via `origin` is allowed; third-party commentary was not used as product requirements. `bmad-deep-recon` web market research was skipped (research firewall + experiment rule).

## Later revisions / discoveries

- **README vs register conflict:** root README still says UI prototype / mock clients / no backend. Register + `server/` + `supabase/migrations/001`–`024` describe a wired agency product. Ruled evidence-weighted toward register; tagged `[ASSUMPTION]`, not silently merged.
- **docs/README remap stale vs SQL on this SHA:** docs still say migrations `001`–`018` and Engineer cuts packet 022; tree contains `019_contact_seat.sql` … `024_wait_occupancy.sql`. Spec quotes filenames.
- **Live packets ahead of SHA FACE files:** PR #96 Current at fetch is Wait-note Approver; SHA Phase Two log Current is A40 / SA 021. Intended glass includes named packets; implementation status is a separate inventory.
- **15:43 vs 14:58:** flagship is operator sequencing / overrides / attempts / goal-as-escalation; 14:58 generated list including triggers-in-Agents is superseded.
- **Architecture lint:** `lint_spine.py --workspace …` → `ok: true`, 0 findings.
- **create-epics-and-stories:** step files halt for user Continue. Produced `epics.md` as **headless analog**, not a founder-approved backlog.
- **bmad-review:** `doc_standards` requested structure/prose lenses; this seat cannot spawn subagents. Parent sequential review written to `review-structure-prose.md`.
- **Ship skills** (`bmad-sprint-planning`, `bmad-build`) skipped — implementation forbidden. `bmad-project-context` skipped (would edit `AGENTS.md`).

No intermediate “v2 rewrite” of the brief/PRD after first distill; memlogs record decisions as they landed. Extracts are the intermediate source layer.

## How next steps were chosen

Always `bmad-help` catalog:

| Order | Skill | Why |
|-------|-------|-----|
| 0 | bmad-help | Installer “get started” |
| 1 | product-brief | precedes required PRD; committed concept (skip PRFAQ/forge/brainstorm) |
| 2 | prd | required planning |
| 3 | ux | UI is major; strongly recommended after PRD |
| 4 | architecture | required; brownfield ratify |
| 5 | spec | condense kernel for downstream |
| 6 | create-epics analog | required before ship; interactive blocked |
| 7 | skip build | experiment constraint |

Headless modes on brief/PRD/UX/architecture/spec: do not ask; tag assumptions; open questions stay open.

## Why continue / revisit / stop

Continued until the planning path that BMad requires for a project-sized existing product had artifacts on disk, plus a kernel spec and explicit uncertainty list. Stopped before Build. Did not ask the coordinator/founder for additional requirements.

**Stop condition:** assignment complete as specification-from-existing-material. Not a blocker (toolkit ran). Not budget_exhausted.

## Time / resource notes

- Start: `2026-10-19T16:46:33Z` (`START.md`)
- Stop: see `STOP-TIME.txt`
- Node v22.23.3, npm 10.9.9, Python 3.12.3, uv 0.13.1
- `rsync` absent; used `cp -a` to mirror
- No git push, no PRs, no GitHub issues
- BMad scaffolding left in `/workspace/_bmad`, `/workspace/.agents`, `/workspace/_bmad-output` as methodology tooling (not submitted as product)

## Install evidence

- Package version: **6.12.4**
- Modules: **core 6.12.4**, **bmm 6.12.4**
- Tool ID: **cursor**
- Installer log: `bmad-install.log`, `install-evidence/bmad-install.log`
- Status dump: `install-evidence/bmad-status.txt`
- Manifest: `install-evidence/manifest.yaml`
- Skills: `install-evidence/skills-list.txt` (29)
- Help catalog: `install-evidence/bmad-help.csv`
- Config: `install-evidence/config.toml`, `config.user.toml`
- Native output: `/workspace/_bmad-output` → `bmad-native/_bmad-output/`

## File inventory

See `FILE-INVENTORY.txt` (regenerated at stop). Primary specification:

- `primary/briefs/brief-Tower-2026-10-19/brief.md`
- `primary/prds/prd-Tower-2026-10-19/prd.md`
- `primary/ux-designs/ux-Tower-2026-10-19/DESIGN.md`
- `primary/ux-designs/ux-Tower-2026-10-19/EXPERIENCE.md`
- `primary/architecture/architecture-Tower-2026-10-19/ARCHITECTURE-SPINE.md`
- `primary/specs/spec-tower/SPEC.md`
- `primary/epics.md`
- Concatenated: `BUNDLE.md`
- Uncertainties: `UNRESOLVED-QUESTIONS.md`
