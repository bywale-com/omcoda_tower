# Launch checkpoint — 2026-10-19T16:46:24Z

Coordinator observation only. No contestant was judged or steered after launch.

## What launched

Five Cursor Cloud subagents, each `generalPurpose`, `environment=cloud`, `run_in_background=true`, `cloud_base_branch=main`, requested build `bld-20261019-7931bd05-bcbc-4c3b-8d64-3614b0865425`.

| Lane | Agent | bcId | URL | Status at listing |
| --- | --- | --- | --- | --- |
| 1 Baseline | [Baseline spec contestant](bc-1afeb59a-6ec2-5eff-8f49-a771bc53008a) | `bc-1afeb59a-6ec2-5eff-8f49-a771bc53008a` | https://cursor.com/agents/bc-1afeb59a-6ec2-5eff-8f49-a771bc53008a | RUNNING |
| 2 Omcoda | [Omcoda spec contestant](bc-ee3cbe37-62b7-5cc2-a3ac-661ce56ddae8) | `bc-ee3cbe37-62b7-5cc2-a3ac-661ce56ddae8` | https://cursor.com/agents/bc-ee3cbe37-62b7-5cc2-a3ac-661ce56ddae8 | RUNNING |
| 3 Spec Kit | [Spec Kit spec contestant](bc-f2e15d0c-16e9-5031-b73b-8807264bfa8c) | `bc-f2e15d0c-16e9-5031-b73b-8807264bfa8c` | https://cursor.com/agents/bc-f2e15d0c-16e9-5031-b73b-8807264bfa8c | RUNNING |
| 4 OpenSpec | [OpenSpec spec contestant](bc-2f4bb108-382f-5feb-bd41-5cd214b9f10e) | `bc-2f4bb108-382f-5feb-bd41-5cd214b9f10e` | https://cursor.com/agents/bc-2f4bb108-382f-5feb-bd41-5cd214b9f10e | RUNNING |
| 5 BMad | [BMad Method spec contestant](bc-decf0743-dd37-5788-8f85-57e2a49ae456) | `bc-decf0743-dd37-5788-8f85-57e2a49ae456` | https://cursor.com/agents/bc-decf0743-dd37-5788-8f85-57e2a49ae456 | RUNNING |

CreatedAtMs for all five is ~1792428378082–1792428378100 (near-simultaneous).

## Uncontrolled listing notes

- Contestant `originalModelName` was `null` in the launch listing; coordinator is `cursor-grok-4.6-high-fast`. Intended model was `inherit`. Actual child model must be confirmed from each run after execution.
- `branchName` was `null` at listing time. Cloud subagents may later attach a working branch.
- No spending/time budget was imposed.
- Coordinator did not follow up into contestant chats after spawn.
- Exact prompts preserved under `prompts/`.

## Next coordinator action

Wait for natural completion notifications or a founder roundup request. Then collect untouched outputs via final Task results plus `cursor-cloud-batch-fetch-details`, without rewriting specifications into a common format.
