# Travis adoption

Source: `bywale-com/travis` default branch, cloned 2026-10-29. The tree’s last push was 2026-10-18. Protocols below were read from that tree, not from memory.

## Reused

| Mechanism | Travis source | Tower form |
| --- | --- | --- |
| Three seats, jobs not swapped | `docs/BUILD-PROTOCOL.md`, `docs/seats/*.md` | Architect, Analyst, Engineer. The Architect absorbs the old Technical PM packet cut. |
| Two buckets only | Build protocol and Engineer seat | `OPERATING-PROTOCOL.md` |
| Exact wake line | `**Wake:** hold` and `**Wake:** sa` | Same lines. Filename is not the hold. Prose is not the hold. |
| Cheap gate before any model | `.github/workflows/wake-packet-seats.yml` | `.github/workflows/factory-dispatch.yml`. The pull-request job runs the controller and stays disarmed. It does not boot a model. There is no schedule. |
| Label actor must be the connected user | `WAKE_GITHUB_TOKEN`, not `github-actions[bot]` | `SECRETS.md`. Not configured |
| One wake label at a time | `strip_seats_except` in the wake workflow | Documented. Not wired |
| Blocker strips wakes and boots nobody | Blocker path in the wake workflow; blockers 001–004 | `factory-blocked` plus failure class `external` / `infrastructure` |
| Prompt gate before the seat is accepted | `house-now/automations/packet-sa.prompt.md`, `sa-complete-engineer.prompt.md` | `docs/factory/prompts/` |
| Checkout the PR head before reading | Engineer prompt: automations boot on the default branch | Copied into both worker prompts |
| Systems-change shape | SA seat: Intent, Must, Stores, Runtime, Ports, Verify, Out of scope | Those seven, plus impact manifest and dependency reconciliation |
| Same PR for one packet’s production chain | Build protocol “One PR” | Kept as the default. Batching may share a branch; it may not merge packet identities |
| Plate chrome and five buckets | `PLATE-CHROME-RULE.md`, `PLATE-READ.md` | Pointed at `/prototype-ant` and the Tower copies of those rules. No plate for PKT-001 |
| Compose, don’t invent | Build protocol | Standing rule. The controller is new only where Travis’s label machine was not safe to copy verbatim |
| Recut once | Engineer prompt and hotfix 092 notes | `maxAttempts: 1` in the machine, and the prompt |
| Memories off, pull request creation off | Automation chain | Required on any future automation. Not saved |

## Changed

| Travis behavior | Why it changed |
| --- | --- |
| Ten-minute sessions that end the run | Tower’s investigation proved persistence. Ending every ten minutes paid for a new boot. Checkpoints stay; the run continues. Cap is 60 minutes uncheckpointed, as policy. |
| PM look automation (`wake-pm-look`) | Travis hotfix 090 turned it off. Tower verification is deterministic and SHA-bound. No look agent. |
| Preview mutex and Vercel `runtime-doors` as the sensor | Those walks are Travis’s phone app. Tower already verifies with `verify:ship` against ephemeral Postgres. Idle “no labels” must not start a preview. Hotfix 093 existed because that inference was wrong. |
| File write equals the next stage | Release is `wake: sa` plus manifest `released` plus `activation: active`. The machine refuses prose completion. |
| One packet, one PR, as an immutable law | Default remains one branch. Sharing a branch is allowed only under the batch rules. |
| `green_light` on any `src/` or handoff push | A candidate SHA plus a verification result for that SHA. A push is not a pass. |
| Fourth red starts `outside-look` | Same fingerprint blocks. A new agent needs new evidence or an explicit justification. |
| Emerge email as the human test | Not part of Tower’s factory. No Resend secrets. |
| SA number and PM number as global house counters in `docs/register/` | Factory packets live under the initiative. They do not consume Tower’s product SA packet numbers (015, 022, and the rest). |

## Rejected

| Piece | Why |
| --- | --- |
| Travis product code, `src/runtime/walks`, Voice/Log/Backlog chrome | Different product |
| `runtime-doors.yml` and preview-when-clear | Boots a product deploy sensor Tower does not use, and it re-wakes engineers from red product walks |
| Cursor-in-Vercel as proof | Travis’s own protocol already forbids it |
| Copying `PHASE-ONE-LOG` or `SYSTEMS-ANALYST-LOG` into Tower | Tower’s product logs stay where they are. The factory has its own handoff |
| A database for workflow state in this change | GitHub plus a pure machine is enough until an actuator needs a transaction GitHub cannot give |
| Activating automations because the prompt files exist | Travis’s own chain says a cloud agent cannot Save + Activate, and 009 showed the cost of booting early |

## Failure record used

Read in full: `BLOCKER-001` through `BLOCKER-004`, the wake workflow header and the blocker/preview guards, `AUTOMATION-PACKET-CHAIN.md` including the 009 boot count, and `PR-AUTOMATION-RULES.md` sections 2–3 (fresh versus update, preview mutex, gated preview). September 2026 is the window of those blockers (12–15 September) and of the packet-009 measurement (5 September).
