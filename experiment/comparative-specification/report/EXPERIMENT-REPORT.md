# Tower comparative specification experiment — coordinator report

This is an observation report. It does not score quality, correctness, completeness, or coherence against Tower’s authoritative material. It does not name a winning methodology. Contestant completion claims are recorded as claims.

This copy lives in the repository at `experiment/comparative-specification/`. Raw evidence is under `raw/`. Exact prompts are under `prompts/`. Protocol is under `protocol/`. The coordinator also kept a run-local copy under `/cursor/stores/self/tower-spec-experiment/`.

Coordinator run: [Tower specification experiment](bc-734d1474-ae32-477d-92bd-9eb1b854c5b8)  
https://cursor.com/agents/bc-734d1474-ae32-477d-92bd-9eb1b854c5b8

---

## Setup actually used

| Item | Value |
|------|--------|
| Source repo | `bywale-com/omcoda_tower` |
| Pinned SHA | `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7` |
| Pin time | 2026-10-19T16:44:44Z after `git fetch origin main` |
| Launch time | 2026-10-19T16:46:24Z (five cloud VMs near-simultaneous) |
| Runtime | Cursor Cloud subagent, `generalPurpose`, `environment=cloud` |
| Intended model | inherit = coordinator `cursor-grok-4.6-high-fast` |
| Listed child `originalModelName` | `null` on every contestant (uncontrolled) |
| Environment build | `bld-20261019-7931bd05-bcbc-4c3b-8d64-3614b0865425` |
| Budget | none |
| Cadence | none imposed |
| Self-hosted workers | none available |
| Product PRs from contestants | none recorded |

Common assignment was delivered verbatim. Framework instructions were kept separate.

---

## 1. Baseline — general-purpose

Agent: [Baseline spec contestant](bc-1afeb59a-6ec2-5eff-8f49-a771bc53008a)  
https://cursor.com/agents/bc-1afeb59a-6ec2-5eff-8f49-a771bc53008a

| | |
|--|--|
| Elapsed (platform updatedAt − createdAt) | 335.7 s |
| Self-status | `complete` |
| Framework | none / general-purpose |
| Tools in transcript | `read_file` 76, `search_replace` 24, `run_terminal_cmd` 8, `grep` 6, `glob_file_search` 3 |

**What it did.** Confirmed the SHA. Mapped repository layers (Seed/World/Story/Outcomes/How, Phase Two, FACE, SQL, `/prototype-ant`) without accepting Engineer/PM/SA seating or installing another framework. Fetched `origin pull/96/head` as available history. Wrote a chaptered intended-product spec plus an uncertainty register.

**Evolution.** Approach/source-map first; identity and twelve systems; then Agents/Automations after seeing Phase Two contradict Seed Hub sketches; then desks, data/runtime, constraints; v1 snapshot then v2 edits on three SPEC files (actors, Agents, operator desk).

**Stop.** Self-claimed complete: end-to-end intended product stated; remaining holes classified as silences. Not a blocker.

**Artifacts (reconstructed).** `raw/baseline/artifacts/` — `SPEC/00`–`13`, `SUPPORTING/`, `revisions/v1` and `v2`, coordinator-built `BUNDLE.md`.

---

## 2. Omcoda

Agent: [Omcoda spec contestant](bc-ee3cbe37-62b7-5cc2-a3ac-661ce56ddae8)  
https://cursor.com/agents/bc-ee3cbe37-62b7-5cc2-a3ac-661ce56ddae8

| | |
|--|--|
| Elapsed | 384.6 s |
| Self-status | `complete` |
| Framework | Omcoda documents at the pinned SHA |
| Tools | `read_file` 52, `search_replace` 21, `glob_file_search` 7, `run_terminal_cmd` 5, `todo_write` 3, `grep` 2 |

**What it did.** Located Omcoda spine documents (`docs/README.md`, Seed/World, PASS-FORK-MAP, two-column synthesis, SME/capability doctrine, How, wiring, Phase Two) and walked that order: session inventory → Seed confirmation → World confirmation → machine extract → face/How → two-column join → practice and capability absorb → Phase Two flags → named gates → primary spec.

**Evolution.** Method inventory v1 freeze; spine pass extracts; primary `SPEC/TOWER-INTENDED-PRODUCT.md` with a preserved v1; capability homes folded as intended but marked unabsorbed in-repo. Did not fetch off-SHA PRs as product law (explicit in its record).

**Stop.** Self-claimed complete under the method’s completeness condition: remaining work is implementation, founder-only class, or named silences.

**Artifacts (reconstructed).** `raw/omcoda/artifacts/` — pass extracts `00`–`09`, primary spec, `CROSS-REFERENCES.md`, coordinator-built `BUNDLE.md`.

---

## 3. GitHub Spec Kit

Agent: [Spec Kit spec contestant](bc-f2e15d0c-16e9-5031-b73b-8807264bfa8c)  
https://cursor.com/agents/bc-f2e15d0c-16e9-5031-b73b-8807264bfa8c

| | |
|--|--|
| Elapsed | 499.1 s (~8.3 min) |
| Self-status | `complete` |
| Framework recorded | specify-cli **1.2.1** from tag `v1.2.1` (resolved `9dca9bf…`) |
| Integration | `cursor-agent` |
| uv | 0.13.1 installed because missing |
| Tools | `read_file` 57, `search_replace` 22, `run_terminal_cmd` 20, `glob_file_search` 5, `grep` 4, `web_search` 2, `todo_write` 3 |

**What it did.** Installed the genuine CLI, `specify init --here --force --integration cursor-agent` on a local methodology branch `cursor/speckit-methodology-fa8c` (not pushed). Followed installed SDD through constitution → specify → clarify (no founder answers) → plan (research, data-model, contracts, quickstart) → custom checklists → tasks → analyze. Did not run implement/converge. Fetched origin `pull/96`, `pull/86`, `pull/110`. Specified one feature `001-tower-product` as the whole intended product.

**Evolution.** Constitution from register evidence; large `spec.md`; clarify session left CASL/reactivation/escrow unfilled; plan artifacts; tasks T001–T056 as remaining-work ledger with a banner not to execute; analyze then T056 added.

**Stop.** Self-claimed complete because Spec Kit’s next step is implementation, which the experiment forbids.

**Artifacts (reconstructed).** `raw/speckit/artifacts/_workspace/specs/001-tower-product/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `tasks.md`, contracts, checklists), constitution, analyze/evidence notes. Native-mirrors from `cp` may be missing.

**Methodological notes (execution, not scores).** Genuine CLI ran. Bundled `specify workflow run speckit` was skipped because it includes implement. Community brownfield extensions were searched and not installed.

---

## 4. OpenSpec

Agent: [OpenSpec spec contestant](bc-2f4bb108-382f-5feb-bd41-5cd214b9f10e)  
https://cursor.com/agents/bc-2f4bb108-382f-5feb-bd41-5cd214b9f10e

| | |
|--|--|
| Elapsed | 548.5 s (~9.1 min) |
| Self-status | `complete` |
| Framework recorded | `@fission-ai/openspec` **1.14.3** |
| Init | `openspec init --tools cursor --profile core` |
| Tools | `read_file` 44, `search_replace` 44, `run_terminal_cmd` 26, `glob_file_search` 5, `grep` 4, `todo_write` 4 |

**What it did.** First global npm install failed (`EACCES`, npm prefix `/` via `/exec-daemon/node`). Installed the same package via nvm Node v22.23.3. Initialized Cursor skills/commands. Followed explore → propose change `specify-intended-tower-product` (18 capability specs) → skip apply → `openspec` validate/sync → update after inspecting `pull/96` (and 86/110) → re-sync. Claimed `openspec validate --strict` passed.

**Evolution.** Explore notes and config constraints; proposal/design/tasks plus 18 delta specs; first sync; later fold of living-packet laws into Automations and Contact specs.

**Stop.** Self-claimed complete; `/opsx-apply` not run because implementation is forbidden.

**Artifacts (reconstructed).** `raw/openspec/artifacts/_workspace/openspec/changes/specify-intended-tower-product/` (proposal, design, tasks, 18 spec deltas), explore notes, UNRESOLVED, OFF-SNAPSHOT-PACKETS, CROSS-REFERENCES. CLI-synced `openspec/specs/` main copies may be missing from reconstruction.

---

## 5. BMad Method

Agent: [BMad Method spec contestant](bc-decf0743-dd37-5788-8f85-57e2a49ae456)  
https://cursor.com/agents/bc-decf0743-dd37-5788-8f85-57e2a49ae456

| | |
|--|--|
| Elapsed | 509.2 s (~8.5 min) |
| Self-status | `complete` (headless artifacts also marked `partial` pending founder confirmation) |
| Framework recorded | `bmad-method@6.12.4`, modules core+bmm 6.12.4, tool `cursor` |
| uv | 0.13.1 installed because skills require `uv run` |
| Tools | `read_file` 60, `search_replace` 26, `run_terminal_cmd` 19, `glob_file_search` 7, `grep` 3, `todo_write` 2 |

**What it did.** `--list-tools` as a top-level flag failed; used `install --help` and `--tools cursor`. Installed genuine BMad into `/workspace` (`_bmad/`, 29 skills, `_bmad-output/`). Ran `bmad-help` catalog routing. Planning skills in headless mode: product brief → PRD (FR-1–FR-39) → UX DESIGN/EXPERIENCE → architecture (AD-1–AD-12, claimed lint 0) → spec kernel → headless analog of epics/stories. Skipped `bmad-build` / sprint-planning. Fetched origin PRs #86/#96/#108/#110. Skipped `bmad-deep-recon` web market research.

**Evolution.** Catalog-driven order. Extracts as an intermediate layer. Interactive `create-epics-and-stories` halted for Continue; analog `epics.md` written instead. `bmad-review` subagent spawn unavailable; sequential review note written.

**Stop.** Self-claimed assignment complete as specification-from-existing-material; ship phase skipped; headless status `partial` on open questions.

**Artifacts (reconstructed).** `raw/bmad/artifacts/_workspace/_bmad-output/planning-artifacts/` (brief, PRD, UX, architecture, spec kernel, epics analog, SKIP-BUILD) plus routing/unresolved notes. Install logs and extracts may be missing.

**Methodological notes (execution, not scores).** Genuine installer ran on the stable 6.12.4 line. Headless mode was used because there was no founder to answer Continue prompts. That is a deviation from interactive BMad, recorded by the contestant.

---

## Execution limitations (cross-cutting)

1. **Ephemeral `/home/ubuntu/tower-spec-output`.** Resume dumps for Baseline and Omcoda found that directory gone. Contestant file bodies were not in transcript `tool_args`; they were recovered from `search_replace` result diffs. Shell `cp`/CLI-generated trees are the main completeness hole in preservation.
2. **Resume VMs lost the working disk.** Every preservation dump came back empty: Baseline and Omcoda `/home/ubuntu/tower-spec-output`; Spec Kit `/workspace/specs`, `.specify`, `.cursor/skills`; BMad `/workspace/_bmad-output`, `_bmad`, `.agents`; OpenSpec `/workspace/openspec`. Reconstructed `search_replace` diffs remain the archive.
3. **No self-hosted dedicated machines.** Isolation is Cursor Cloud VMs.
4. **Child model id not listed.** Intended inherit of `cursor-grok-4.6-high-fast`; platform listing shows `originalModelName: null`.
5. **Repo `AGENTS.md` Engineer seat** is in the snapshot; contestants were told it is evidence, not automatic seating. Residual bias is possible.
6. **Implementation-shaped frameworks** (Spec Kit implement/converge, OpenSpec apply, BMad build) were constrained by the experiment. Each skipped those steps and said so.
7. **OpenSpec npm global install** needed nvm PATH because Cloud npm prefix was `/`.
8. **BMad `--list-tools`** as a top-level flag is not valid on 6.12.4; install-subcommand flags worked.
9. **Wall clocks are short** (about 5–9 minutes per lane). That is observed duration, not evidence that a methodology considers the work complete. No spending cap was imposed; contestants stopped themselves.
10. **No product PRs** and no application diffs recorded (`linesAdded` null).

---

## Where untouched / reconstructed outputs live

| Lane | Raw transcript | Reconstructed artifacts |
|------|----------------|-------------------------|
| Baseline | `raw/baseline/platform/` | `raw/baseline/artifacts/` |
| Omcoda | `raw/omcoda/platform/` | `raw/omcoda/artifacts/` |
| Spec Kit | `raw/speckit/platform/` | `raw/speckit/artifacts/` |
| OpenSpec | `raw/openspec/platform/` | `raw/openspec/artifacts/` |
| BMad | `raw/bmad/platform/` | `raw/bmad/artifacts/` |

`RECONSTRUCTION.md` in each artifacts directory marks coordinator-built concatenations vs contestant diffs.

Independent evaluation should read the reconstructed specification files and transcripts, not this report’s summaries, as the specification evidence.
