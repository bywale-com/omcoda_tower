# Execution environment

Coordinator observations of controllable and uncontrollable conditions.

## Controllable (applied equally)

| Lever | Value |
| --- | --- |
| Contestant runtime | Cursor Cloud subagent (`Task` `environment=cloud`) — separate VM per contestant |
| Subagent type | `generalPurpose` |
| Model | `inherit` from coordinator = `cursor-grok-4.6-high-fast` |
| Base branch | `main` (remote) |
| Requested environment build | `bld-20261019-7931bd05-bcbc-4c3b-8d64-3614b0865425` |
| Coordinator environment public id | `dafc2fbe-bf91-11f1-bb68-864e54d14197` |
| Egress | Unrestricted on coordinator; child VMs expected to match unless platform differs |
| Source pin | `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7` |
| Spending / time budget | None imposed. Founder may later request a roundup. Budget expiration must not be treated as methodological completion. |
| Decomposition cadence | None imposed by coordinator |
| Common assignment | Identical verbatim block to every contestant |

## Uncontrollable / recorded differences

| Item | Status |
| --- | --- |
| Self-hosted workers | None connected. Could not give each contestant a physical dedicated worker pool. Cloud VMs are the isolation mechanism. |
| Platform auto-branching | Cloud subagents receive their own git branch on their VM. Contestants are forbidden to push or open PRs. If the platform still publishes a branch, that is an execution limitation, not a contestant method. |
| Injected repo `AGENTS.md` | Present in the snapshot. Contestants are told it is source evidence, not an automatic job seat, unless their assigned methodology independently uses it. Residual bias is possible. |
| Framework native install interactivity | Spec Kit, OpenSpec, and BMad installers have interactive modes. Contestants are given official non-interactive init flags where documented. Actual installed versions are recorded by each contestant. |
| Child VM environment.json | Coordinator personal environment JSON is owner-restricted and not fully inspectable. |

## Isolation rules

- Separate agent context and execution history (distinct cloud subagents).
- Separate filesystem / VM.
- Identical read-only application source at the pinned SHA.
- Separate writable output: `/home/ubuntu/tower-spec-output/` on each VM.
- Separate native methodology instructions (not shared across prompts).
- No cross-reading of contestant output.
- No founder product requirements added by the coordinator.
