# Tasks

## 1. Specification capture

- [x] 1.1 Write `proposal.md` listing eighteen new capabilities and stating that application-code apply is out of scope; verify the file exists at `openspec/changes/specify-intended-tower-product/proposal.md`
- [x] 1.2 Write delta specs for every proposal capability under `openspec/changes/specify-intended-tower-product/specs/<capability>/spec.md`; verify eighteen `spec.md` files exist
- [x] 1.3 Write `design.md` recording evidence ranking, capability grain, and named tensions; verify the file exists and contains Decisions plus Risks
- [x] 1.4 Confirm no Tower application source was edited for this change; verify `git status` shows only `openspec/` (and gitignored `.cursor/` OpenSpec skills)

## 2. Validate

- [x] 2.1 Run `openspec validate specify-intended-tower-product --strict` and verify it reports valid (fix delta format or requirement length if it fails)
- [x] 2.2 Run `openspec list --specs` after sync and verify all eighteen capabilities appear (this task waits on 3.1; if run before sync, expect empty main specs)

## 3. Land main specs (no product implementation)

- [x] 3.1 Sync delta specs into `openspec/specs/` using the OpenSpec sync-specs workflow and verify each capability has `openspec/specs/<capability>/spec.md`
- [x] 3.2 Mirror `openspec/` (including this change and any synced main specs) into `/home/ubuntu/tower-spec-output/` and verify the mirror contains proposal, eighteen deltas, design, tasks, and main specs
- [x] 3.3 Confirm `/opsx-apply` against Tower application source was not run; verify no `src/`, `server/`, or `supabase/` files were modified

## Workflow follow-up

- Do not run `/opsx-apply` on Tower application source.
- Archive is optional after main specs exist; archive MUST NOT be claimed as product shipment.
- Named Story silences and Face “Open” items stay UNRESOLVED.
