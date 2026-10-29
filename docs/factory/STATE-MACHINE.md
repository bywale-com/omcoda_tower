# Factory state machine

The functions in `.factory/controller/machine.ts` are the authority for transitions. This page is the readable copy. `npm run factory:check` fails if an id below is missing from this table or missing from `TRANSITION_IDS`.

A wake is a proposal from `decide`. It is not a label. `acknowledgeDispatch` runs only after the label API has added the label. A failed add leaves the proposal in place so a later pass can retry the label. It does not let a second worker start.

Absence of `factory-wake-sa`, `factory-wake-engineer`, or `factory-repair` is not permission to advance.

`github-actions[bot]` is not a valid label actor. The actuator, when it is later wired, must use `WAKE_GITHUB_TOKEN` for the GitHub user connected to the Cursor automation. That actuator is not wired. See `.github/workflows/factory-dispatch.yml`.

## Packet stages

`draft` → `released` → `analysis` → `change_specified` → `engineering` → `candidate` → `verifying` → `verified` → `accepted`

Side stages: `blocked`, `returned_architect`, `returned_analyst`.

`hold` and `blockerId` are flags. A founder hold does not erase the stage.

## Transitions

| id | observation | result |
| --- | --- | --- |
| T01 | `release` with gates passing and `wake: hold` | Stay `draft`. `releaseEligible` becomes true. No wake. |
| T02 | `release` with gates passing and `wake: sa` | Stage `released`. Revision updates. No label yet. |
| T03 | `decide` while `activation` is `inactive` | Effect `none`, reason `inactive`. |
| T04 | `decide` on an active, unleased `released` packet whose SA dispatch is not acknowledged | Effect `wake_sa`, label `factory-wake-sa`. |
| T05 | `acknowledgeDispatch(wake_sa)` after the label exists | A second `decide` returns `none`. |
| T06 | Event `prose_complete` | Refused. Reason `prose_is_not_evidence`. Stage unchanged. |
| T07 | Event `hold` | `hold` is true. `decide` returns `hold`. |
| T08 | Event `blocker` | `blockerId` is set. The stage is kept. `decide` returns `blocked`. |
| T09 | Event `clear_blocker` | The id is cleared. The event itself does not dispatch. |
| T10 | `acquire_lease` while another worker’s lease is unexpired | Refused. Reason `lease_held`. |
| T11 | Analyst `acquire_lease` on `released` | Stage `analysis`. |
| T12 | `sign_change` missing a required section | Refused. Reason `sections_incomplete`. |
| T13 | `sign_change` whose revision is not the packet revision | Refused. Reason `revision_mismatch`. |
| T14 | `sign_change` with the lease, the revision, and all nine sections | Stage `change_specified`. Lease cleared. |
| T15 | `decide` on active `change_specified` with no engineering slot busy | Effect `wake_engineer`, label `factory-wake-engineer`. |
| T16 | Same, with `engineeringBusy` | Effect `none`, reason `concurrency`. |
| T17 | Any wake while `budgetUsd` is `0` | Effect `none`, reason `budget_exhausted`. |
| T18 | `budgetUsd: null` | The controller does not pretend a hard limit exists. Other gates still apply. |
| T19 | `start_verification` whose SHA is not `candidateSha` | Refused. Reason `sha_mismatch`. |
| T20 | Passing `verification_result` whose SHA is not `candidateSha` | Refused. Reason `sha_mismatch`. Stage stays `verifying`. |
| T21 | Passing `verification_result` for `candidateSha` | Stage `verified`. `verifiedSha` is that SHA. |
| T22 | `accept` for `verifiedSha` | Stage `accepted`. |
| T23 | Failing result class `specification` | Stage `returned_architect`. No engineer wake. |
| T24 | Failing result class `systems_contract` | Stage `returned_analyst`. No engineer wake. |
| T25 | Failing result class `external` or `infrastructure` | Stage `blocked`. No repair wake. |
| T26 | Failing result class `implementation`, new fingerprint, attempts remaining | Stage `engineering`. `decide` proposes `factory-repair`. |
| T27 | The same fingerprint again, without `justification` | Stage `blocked`. Reason `duplicate_failure`. |
| T28 | A further implementation failure after `maxAttempts` (default 1 repair) | Stage `blocked`. Reason `attempts_exhausted`. |
| T29 | `clear_blocker` after a classified `blocked` stage | The id may clear. The stage stays `blocked`. `decide` does not resume it. |
| T30 | `deriveInitiative` | The initiative summary is computed from investigation status and packet stages. It is not a second copy stored beside them. |

## Required systems-change sections

`intent`, `must`, `stores`, `runtime`, `ports`, `verify`, `out_of_scope`, `impact_manifest`, `dependency_reconciliation`.

## Initiative summary

`deriveInitiative` uses this order:

1. Investigation `discovered` → `discovered`.
2. Investigation `scoped` and no packets → `scoped`.
3. Every required packet `accepted` and investigation `closed` → `complete`.
4. Every required packet `accepted` and investigation still open → `reconciling`.
5. Any packet `verifying` or `verified` → `verifying`.
6. Any packet in analysis, change specification, engineering, candidate, or an upstream return → `in_production`.
7. Any packet `released` or `accepted` → `packets_ready`.
8. Otherwise the investigation status: `specifying`, `investigating`, or `scoped`.

One packet in production does not make the initiative complete. One complete initiative does not make the module complete. One complete specification does not make the component implemented.

## Labels

| Label | Cursor automation | Who may add it |
| --- | --- | --- |
| `factory-wake-sa` | Systems Analyst prompt, when a human later activates it | The unwired actuator, only after `decide` returns `wake_sa` and the label API succeeds |
| `factory-wake-engineer` | Engineer prompt | Same, for `wake_engineer` |
| `factory-repair` | Engineer prompt | Same, for `wake_repair` |
| `factory-blocked` | None | Actuator or founder. Strips wake labels. No agent. |
| `factory-hold` | None | Founder or Architect. Strips wake labels. No agent. |

One wake label at a time. Adding one removes the other two. `factory-blocked` and `factory-hold` prevent every wake.

There is no `factory-wake-architect` label. Investigation is a seated execution, not a label loop. There is no PM-look label. Verification is the deterministic check named by the packet.

## What is not implemented

`reopen` from `returned_architect` or `returned_analyst` is not an event yet. Those stages stay where they are until a later controller change names the evidence that may move them.
