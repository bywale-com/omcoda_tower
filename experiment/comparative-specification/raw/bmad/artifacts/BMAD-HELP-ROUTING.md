# BMad Help routing — 2026-10-19T16:50Z

Contestant 5 executed `bmad-help` against the installed catalog (`_bmad/_config/bmad-help.csv`) and merged config.

## Where we are

- Fresh BMad Method 6.12.4 install; module **bmm** 6.12.4; tool **cursor**.
- No prior `_bmad-output/planning-artifacts`.
- Project knowledge path: `docs/` (217 markdown/json files).
- Assignment: complete coherent **specification** of intended Tower product. Implementation forbidden.

## Catalog gates (required=true)

| Phase | Skill | Status at routing |
|-------|-------|-------------------|
| 2-planning | `bmad-prd` (preceded-by `bmad-product-brief`) | not started |
| plan | `bmad-architecture` | not started |
| plan | `bmad-create-epics-and-stories` (preceded-by architecture) | not started |
| plan | `bmad-sprint-planning` | not started |
| ship | `bmad-build` | **will not run** — experiment forbids product implementation |

## Optional items considered first (per help ordering)

- `[RS] Deep Recon` (`bmad-deep-recon`) — useful for market/domain, but research firewall treats project files as inadmissible evidence unless the plan **grants named documents**. Third-party web commentary is forbidden as Tower product requirements. Decision: **do not use web recon as product truth**. Instead grant named Tower documents as the research corpus via extract files (product-brief Discovery / PRD extract-don't-ingest).
- `[BP] Brainstorm` — skip. Concept already committed in-repo.
- `[FI] Forge Idea` — skip. Committed product, not an untested idea.
- `[WB] PRFAQ` — skip. Catalog: brief is the gentler alternative when already committed to the concept.
- `[CB] Create Brief` (`bmad-product-brief`) — **run first**, headless, from repository evidence.
- `[SPC] Spec` (`bmad-spec`) — run after PRD/UX/architecture to condense the kernel.
- `[CU] Create UX` — strongly recommended; UI is a major part of the product. Run after PRD.
- `[PC] Project Context` — skip writing into `AGENTS.md` (application source change forbidden).

## Next required

1. `bmad-product-brief` Create, headless Fast path, sources = repo docs + code as evidence.
2. `bmad-prd` Create, headless.
3. `bmad-ux` Create, headless.
4. `bmad-architecture` Create (brownfield: ratify existing conventions), headless.
5. `bmad-spec` Create from the planning artifacts.
6. `bmad-create-epics-and-stories` — specification of remaining work vs stood-up machine; not an implementation license.
7. `bmad-sprint-planning` — generate tracking only if it does not imply starting Build. Experiment: produce readiness assessment; do not invoke `bmad-build`.

## Execution constraints treated as BMad persistent facts

- Isolated contestant; no other contestants' work.
- SHA `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`.
- No founder elicitation. Gaps → `open_questions[]` / `[NOTE FOR PM]`, not invented decisions.
- Git history / origin pull refs may be inspected when this SHA's docs point to them as live spec.
- Native BMad output under `/workspace/_bmad-output`; mirrored to `/home/ubuntu/tower-spec-output/`.

## Headless justification

No TTY / no founder. Skills with Headless Mode: do not ask; infer; tag assumptions; halt blocked only when topic cannot be inferred. Topic = Tower intended product from the supplied repository.
