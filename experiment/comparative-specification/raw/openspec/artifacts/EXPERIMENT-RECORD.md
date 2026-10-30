# Experiment record — Contestant 4 (OpenSpec)

## Identity

- Contestant: OpenSpec (not Tower Engineer / PM / SA)
- Preservation root: `/home/ubuntu/tower-spec-output/`
- Product snapshot SHA: `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7` (confirmed before spec work; HEAD unchanged at stop)
- No `git push`, PRs, or GitHub issues

## Install evidence

Intended: `npm install -g @fission-ai/openspec@latest`

First attempt failed: `EACCES` on `/usr/lib/node_modules` because `/exec-daemon/node` had `npm prefix -g` = `/`.

Actual install: prepended nvm PATH `/home/ubuntu/.nvm/versions/node/v22.23.3/bin`, then the same global package. Binary: that nvm prefix `openspec`.

| Item | Value |
|------|--------|
| Node | v22.23.3 |
| npm | 10.9.9 |
| `openspec --version` | **1.14.3** (openspec.dev listed 1.14.2 at fetch time) |
| Init | `openspec init --tools cursor --no-animation --profile core /workspace` |
| Tool id | `cursor` |
| Profile | `core` |
| Delivery | `both` (skills + commands) |
| Schema | `spec-driven` |
| Init report | Created: Cursor — **6 skills and 6 commands** in `.cursor/`; Config: `openspec/config.yaml` |

Skill paths created:

- `/workspace/.cursor/skills/openspec-explore/SKILL.md`
- `/workspace/.cursor/skills/openspec-propose/SKILL.md`
- `/workspace/.cursor/skills/openspec-apply-change/SKILL.md`
- `/workspace/.cursor/skills/openspec-update-change/SKILL.md`
- `/workspace/.cursor/skills/openspec-sync-specs/SKILL.md`
- `/workspace/.cursor/skills/openspec-archive-change/SKILL.md`

Command paths created:

- `/workspace/.cursor/commands/opsx-explore.md`
- `/workspace/.cursor/commands/opsx-propose.md`
- `/workspace/.cursor/commands/opsx-apply.md`
- `/workspace/.cursor/commands/opsx-update.md`
- `/workspace/.cursor/commands/opsx-sync.md`
- `/workspace/.cursor/commands/opsx-archive.md`

`.cursor/` is gitignored in the Tower repo; copies live under `cursor-integration/`. Native `openspec/` in the workspace is untracked methodology scaffolding only (`git status` shows `?? openspec/`; no `src/`, `server/`, or `supabase/` edits).

Official docs consulted: install.md, openspec.dev, llms.txt, setup, quickstart, skills, spec-driven schema, stores, config.yaml, supported-tools.

Telemetry disabled after first CLI run: `openspec config set telemetry.enabled false`.

## Initial approach

OpenSpec’s installed core loop is explore → propose → apply → archive. The experiment forbids product implementation, so apply against Tower source was treated as an execution constraint, not skipped by role-play.

1. Confirm SHA; create preservation root.
2. Install real CLI; `openspec init --tools cursor`.
3. Follow **openspec-explore** (read-only investigation of Seed/World/Story/Face/SQL/Ant).
4. Follow **openspec-propose** (`openspec new change specify-intended-tower-product`, then `openspec instructions` per artifact).
5. Skip **openspec-apply-change** on application code.
6. Follow **openspec-sync-specs** so durable specs live in `openspec/specs/`.
7. After discovering this SHA’s Current pointer names origin PRs, inspect `pull/96/head` (and 86/110) and **update** Automations/Contact specs; re-validate; re-sync.

Capability grain: Story’s twelve non-conflatable systems, plus Automations, three desks/touchpoints, outbound actuation, and product-purpose. That matches OpenSpec’s “cohesive evolving boundary” rule better than one catch-all spec.

## First substantive artifacts

- `explore/00-EXPLORE-NOTES.md` — evidence ranking, spine diagram, conflicts
- `openspec/config.yaml` — methodology constraints (no inventing, no apply, 15:43 law, Ant face)
- Change `specify-intended-tower-product`: `proposal.md`, 18 delta specs, `design.md`, `tasks.md`
- First sync: 18 main specs, `openspec validate --specs --strict` all passed

Versioned copy: `mirrors/2026-10-19T16-50-init/` (empty OpenSpec after init), `mirrors/2026-10-19T17-proposal/` (proposal only), `mirrors/2026-10-19T16-53-synced/` (first full specs), `mirrors/2026-10-19T16-55-post-pr96-fold/` (after packet fold).

## Later revisions / discoveries

1. **Stale README** vs wired product on this SHA — specified as historical overlay, not intended product.
2. **docs/README “do 022 now”** vs migrations `021`–`024` already on the SHA — SQL treated as stood-up; packet markdown 022/023 still used as ascription.
3. **Strict validate** failed until UNRESOLVED requirements and the quoted Agents flagship gained SHALL/MUST.
4. **Origin pull refs exist.** SHA Current pointer is honest: living PM packets are on #96. Inspected without merging. Folded If/Switch, Test-on-trigger, Save·Run·Launch, Get, extra events, in-app affordance law into specs. Remaining plate-chrome packets inventoried in `OFF-SNAPSHOT-PACKETS.md`.
5. Config warning: `operations.apply.guidance` ignored by CLI (“must be an array of strings”) even though YAML listed arrays; did not block artifacts.

## How next steps were chosen

OpenSpec skills, not a coordinator template:

- Empty `openspec list --specs` → propose a spec-capture change rather than skip_specs.
- Propose skill: `new change` then instructions JSON for proposal → specs → design → tasks.
- Design skill: include design.md because the capture is cross-cutting.
- Tasks skill: specification/validate/sync only; apply listed as out of scope.
- Status after planning: CLI said next is `openspec instructions apply` — **not followed** for application source.
- Sync skill: create main specs from ADDED deltas (archive-equivalent merge for new capabilities).
- Update after PR inspection: revise existing artifacts, re-validate, rewrite the two affected main specs.

## Why continue / revisit / stop

Continued until:

- Real OpenSpec CLI ran (not simulated)
- Explore grounded in the repository
- All propose artifacts existed and `openspec validate --strict` passed
- Main specs were synced (18 capabilities, 103 requirements)
- SHA-pointed origin packets were inspected and selected laws folded
- Silences remained explicit
- Application source untouched

Stopped because the OpenSpec specification workflow for this assignment is complete: durable `openspec/specs/` inventory of the intended product, with named holes. Remaining packet chrome on #96 is inventoried, not silently filled. No genuine CLI blocker. Apply/archive-as-shipment were out of scope.

## Time / resource notes

- Start UTC: `2026-10-19T16:46:32Z`
- Stop UTC: `2026-10-19T16:54:37Z` (environment clock)
- Wall clock on this host is compressed relative to work volume; recorded as observed `date -u`
- Network: npm registry and openspec.dev reachable; GitHub origin pull refs reachable
- No product build was required; `npm run build` not used (specification-only)

## Primary specification location

- Native (methodology scaffolding in workspace, untracked): `/workspace/openspec/`
- Preservation mirror: `/home/ubuntu/tower-spec-output/openspec/`
- Concatenated bundle: `/home/ubuntu/tower-spec-output/BUNDLE.md`
- Supporting: `explore/00-EXPLORE-NOTES.md`, `UNRESOLVED.md`, `OFF-SNAPSHOT-PACKETS.md`, `CROSS-REFERENCES.md`

## File inventory

See `INVENTORY.md` (182 files under the preservation root at stop). High-level:

```
/home/ubuntu/tower-spec-output/
  STATUS.json
  EXPERIMENT-RECORD.md
  BUNDLE.md
  INVENTORY.md
  UNRESOLVED.md
  OFF-SNAPSHOT-PACKETS.md
  CROSS-REFERENCES.md
  START.md
  explore/00-EXPLORE-NOTES.md
  install-evidence/
  cursor-integration/{skills,commands}/
  openspec/                 # live native mirror
  mirrors/<timestamp>/      # intermediate versions
```
