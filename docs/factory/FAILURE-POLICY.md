# Failure policy

Classify before any repair dispatch. The classes are the `FailureClass` union in `.factory/controller/machine.ts`.

| Class | Examples from Travis that must not be recut as product bugs | Response |
| --- | --- | --- |
| `implementation` | Plant does not match the signed contract | One `factory-repair` proposal, then stop |
| `specification` | The packet contradicts itself or the initiative | `returned_architect`. No engineer label |
| `systems_contract` | The change packet cannot be cut as written | `returned_analyst`. No engineer label |
| `infrastructure` | Test harness, missing workflow secret, cancelled job treated as green | `blocked`. No engineer label |
| `external` | Cursor plan cap, spend hard limit, create timeout (Travis blockers 001–003), unset preview secret (blocker 004) | `blocked`. No engineer label |

A repeated fingerprint with no new justification becomes `duplicate_failure` and `blocked`. Clearing a blocker label does not resume a classified block and does not dispatch by itself. Travis’s unlabeled-blocker path raced a preview; this machine does not.

`maxAttempts` defaults to 1. That is one repair after the original candidate, which is the “recut once” rule, enforced in the controller rather than only in a prompt.

The Engineer prompt still says to stop after one repair so a sitting cannot outrun the controller. Both gates are required. The prompt is not the enforcement.

## Interrupted runs

A replacement execution starts only after the controller knows the previous run is not active, cannot be resumed, and its lease is free or expired. The handoff must name the work item, the revision, what is established, what is open, what is already committed, and the next authorized action. A missing handoff is not permission to start a twin.
