# Factory state machine

The functions in `.factory/controller/machine.ts` are the authority for transitions. This page is the readable copy. `npm run factory:check` fails if an id below is missing from this table or missing from `TRANSITION_IDS`.

A wake is a proposal from `decide`. It is not a label. `acknowledgeDispatch` runs only after the label API has added the label. A failed add leaves the proposal in place so a later pass can retry the label. It does not let a second worker start.

Absence of `factory-wake-sa`, `factory-wake-engineer`, or `factory-repair` is not permission to advance.

`github-actions[bot]` is not a valid label actor. When the actuator is armed it sets `GH_TOKEN` and `GITHUB_TOKEN` from `WAKE_GITHUB_TOKEN`, the GitHub user connected to the Cursor automation. It is connected and disarmed. See `.github/workflows/factory-dispatch.yml`.

## Packet stages

`draft` → `released` → `analysis` → `change_specified` → `engineering` → `candidate` → `verifying` → `verified` → `integration_authorized` → `integrated` → `reconciled` → `accepted`

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
| T17 | Active `decide` while `authorizedDispatches` is null or `0` | Effect `none`, reason `dispatch_not_authorized`. Illustrative `budgetUsd` does not grant the wake. |
| T18 | Active `decide` when `usedDispatches` has reached `authorizedDispatches` | Effect `none`, reason `dispatch_authorization_exhausted`. |
| T19 | `start_verification` whose SHA is not `candidateSha` | Refused. Reason `sha_mismatch`. |
| T20 | Passing `verification_result` whose SHA is not `candidateSha` | Refused. Reason `sha_mismatch`. Stage stays `verifying`. |
| T21 | Passing `verification_result` for `candidateSha` | Stage `verified`. `verifiedSha` is that SHA. |
| T22 | `accept` before `reconciled` | Refused. Reason `wrong_stage`. A passing SHA is not acceptance. |
| T23 | Failing result class `specification` | Stage `returned_architect`. No engineer wake. |
| T24 | Failing result class `systems_contract` | Stage `returned_analyst`. No engineer wake. |
| T25 | Failing result class `external` or `infrastructure` | Stage `blocked`. No repair wake. |
| T26 | Failing result class `implementation`, new fingerprint, attempts remaining | Stage `engineering`. `decide` proposes `factory-repair`. |
| T27 | The same fingerprint again, without `justification` | Stage `blocked`. Reason `duplicate_failure`. |
| T28 | A further implementation failure after `maxAttempts` (default 1 repair) | Stage `blocked`. Reason `attempts_exhausted`. |
| T29 | `clear_blocker` after a classified `blocked` stage | The id may clear. The stage stays `blocked`. `decide` does not resume it. |
| T30 | `deriveInitiative` | The initiative summary is computed from investigation status and packet stages. It is not a second copy stored beside them. |
| T31 | `acquire_lease` for a role the stage does not admit | Refused. Reason `role_not_admitted`. An Engineer lease on `released`, or an Analyst lease after the change is signed, does not stick. |
| T32 | `sign_change` or `commit_candidate` with `lease.until` at or before `now` | Refused. Reason `lease_expired`. |
| T33 | `accept` from `verified` | Refused. Reason `wrong_stage`. |
| T34 | `authorize_integration` for `verifiedSha` | Stage `integration_authorized`. |
| T35 | `integrate` with a non-empty merge SHA for that candidate | Stage `integrated`. `integratedSha` is the merge evidence. |
| T36 | `reconcile` with a reconciliation id for `verifiedSha` | Stage `reconciled`. |
| T37 | `accept` from `reconciled` for `verifiedSha` | Stage `accepted`. |
| T38 | `workerMayRun` | Requires the dispatch record's packet id, revision, pull-request head, and label. A mismatch refuses. |
| T39 | Label actuator returns failure | The ledger is not acknowledged. `usedDispatches` stays. `decide` still proposes the wake. |
| T40 | A second `dispatchWake` after acknowledgement | Effect `none`. The actuator is not called again. |
| T41 | `compareAndSwap` whose expected revision is stale | Returns false and leaves the stored ledger unchanged. |
| T42 | `record_manual_evidence` from `draft` with `wake: hold`, no dispatch record, a non-empty SHA, all nine sections, and at least one passing check that names a run id | Stage `verified`. `candidateSha` and `verifiedSha` are that SHA. `execution.mode` is `manual`. `dispatch` stays null. Wake stays `hold`. `usedDispatches` stays. `decide` does not propose a wake. |
| T43 | `record_manual_evidence` with an empty SHA, a missing section, no passing check, a failed check, a stage other than `draft`, `wake: sa`, or an existing dispatch record | Refused. Stage unchanged. No dispatch record is written. |
| T44 | `authorize_scope` with modules and a positive `authorizedDispatches` | Scope `active`. A non-positive count is refused. Null remains not unlimited. |
| T45 | `select_next` inside an active scope | The lowest priority, then the lowest id, among eligible initiatives whose dependencies are `completed`. A module with no initiatives is not complete. |
| T46 | Architect session `continue` or `interrupted` | Revision bumps, dispatch clears, session `continuation_due`. The next control pass proposes `factory-wake-architect`. An ordinary ending does not complete the initiative. |
| T47 | `suspend`, scope `complete`, or a founder decision | No wake. `decide` and `decideScope` return `suspended`, `scope_complete`, or `founder_decision`. |
| T48 | Accepted packets and `coverageComplete: true`, then `close_initiative` | That initiative is `completed`. The next control pass selects the next eligible initiative without a second scope authorization. Coverage still open refuses the close. |
| T49 | `adopt_existing_change` on `released` with wake `sa`, a recorded `ran` Analyst dispatch for this revision, no open dispatch, and all nine sections | Stage `change_specified`. No lease and no new dispatch are written. History stays. `usedDispatches` stays. A packet with no `ran` record is refused. |
| T50 | `interrupt_analysis` by the Analyst who holds the live lease | Stage returns to `released`. The lease and `dispatchedSaRevision` clear. The open Analyst dispatch, when it is this revision, moves to history as `ran`. A later pass may wake the Analyst again. |
| T51 | Architect session `checkpoint` | Session stays `running`. Dispatch and revision stay. `checkpointAt` is the caller's clock. The next control pass does not propose `factory-wake-architect`. |
| T52 | Architect session ended, with an agent id, resume supported, and fewer than four runs on that agent | Effect `wake_architect`, delivery `resume`, no label. A follow-up uses `POST /v1/agents/{id}/runs`. No agent id, a saturated context, a fourth run already stored, or resume unsupported proposes a fresh `factory-wake-architect` label instead. |
| T53 | Several eligible released packets linked by a recorded sibling | One `wake_sa`. One execution. One dispatch spend. Each packet keeps its revision and is signed by its own `sign_change`. |
| T54 | A released packet whose recorded sibling is not eligible | The assignment contains that packet alone. The pass does not wait. |
| T55 | `refuse_execution` on an engineer dispatch with no candidate SHA | Execution phase `refused`. Dispatch moves to history. `dispatchedEngineerRevision` clears. The slot is free. A packet that already has `candidateSha` is refused with `candidate_recorded` and the SHA stays. |
| T56 | Engineer or Analyst dispatch still `dispatched` after its reservation | Phase `refused`, reason `reservation_expired`. The slot is free. History stays. An Analyst who never started is refunded the way an absent Analyst dispatch is refunded. An engineer spend is not refunded. |
| T57 | `started` or `running` execution whose lease is at or before `now` | Phase `interrupted`, reason `lease_expired`. The lease clears. The slot is free. A recorded candidate SHA is not cleared. |
| T58 | `record_candidate_checks` whose SHA is `candidateSha`, with at least one passing check that names a run id | Stage `verified`. `verifiedSha` is that SHA. A different SHA is `sha_mismatch` and the stage stays. A failing check is `verification_failed` and the stage stays. |
| T59 | Engineering queue depth of two or more (`change_specified`, `engineering`, `candidate`, `verifying`) | `decideScope` returns `backpressure`. No architect wake and no new packet release from a fresh architect launch. Analyst and engineer wakes are unchanged. A running architect execution is left in place. |
| T60 | `workerMayRun` with an execution id | A supplied id that is not the dispatch record's `executionId` is `execution_mismatch`. A dispatch without an execution id stays authorized by packet, revision, head, and label. |

## Required systems-change sections

`intent`, `must`, `stores`, `runtime`, `ports`, `verify`, `out_of_scope`, `impact_manifest`, `dependency_reconciliation`.

## Initiative summary

`deriveInitiative` uses this order:

1. Investigation `discovered` → `discovered`.
2. Investigation `scoped` and no packets → `scoped`.
3. Every required packet `accepted` and investigation `closed` → `complete`.
4. Every required packet `accepted` and investigation still open → `reconciling`.
5. Any packet `verifying` or `verified` → `verifying`.
6. Any packet in analysis, change specification, engineering, candidate, integration, or an upstream return → `in_production`. Integration is not acceptance. |
7. Any packet `released` or `accepted` → `packets_ready`.
8. Otherwise the investigation status: `specifying`, `investigating`, or `scoped`.

One packet in production does not make the initiative complete. One complete initiative does not make the module complete. One complete specification does not make the component implemented.

## Labels

| Label | Cursor automation | Who may add it |
| --- | --- | --- |
| `factory-wake-architect` | Technical Product Architect prompt | The actuator, only after `decideScope` returns `wake_architect` and the label API succeeds. `packetId` on that dispatch record is the initiative id. |
| `factory-wake-sa` | Systems Analyst prompt, when a human later activates it | The actuator, only after `decide` returns `wake_sa` and the label API succeeds |
| `factory-wake-engineer` | Engineer prompt | Same, for `wake_engineer` |
| `factory-repair` | Same Engineer prompt. Not a fourth role. | Same, for `wake_repair` |
| `factory-blocked` | None | Founder. The worker prompt stops. No agent is started by this label. |
| `factory-hold` | None | Founder or Architect. The worker prompt stops. |

The controller proposes one wake per pass, and at most one engineer or repair wake while an implementation slot is taken. `factory-blocked` and `factory-hold` prevent every wake. There is no PM-look label. Verification is the deterministic check named by the packet. The actuator adds a label. It does not remove the others.

## Persistence

`.factory/controller/dispatch.ts` loads the ledger shape and compare-and-swaps on `stateRevision`. A live runner uses `GitHubContentsStore`: the Contents API blob sha is the compare token, and a stale PUT is a 409. `FileStore` locks a directory on one machine only. A failed label add does not bump the revision and does not increment `usedDispatches`. The committed ledger records PKT-001 as `verified` by manual evidence: execution mode `manual`, dispatch null, Wake `hold`. `integratedSha` is null. Its scope is `inactive` and its `authorizedDispatches` is null, so a control pass does not select an initiative. Tests that are not that record use their own ledger.

`projectFactory` in `.factory/controller/queue.ts` is the read model for a later Trigger view. It is derived from the ledger. It is not a second store and it does not admit transitions.

## What is not implemented

`reopen` from `returned_architect` or `returned_analyst` is not an event yet. The label actuator can spawn `gh pr edit` and stays disarmed until spending confirmation, saved Cursor automations, and a positive `authorizedDispatches`. It does not start a Cursor agent by itself. Checkpoint times are not observed by a scheduler. A provider spending limit is not configured from this repository. Manual evidence does not replace the integration gate: `accept` still requires `reconciled` and a merge SHA. The controller does not merge a pull request. Integration policy is `merge_sha_required`.
