# Operating protocol

## Sessions

| Rule | Policy |
| --- | --- |
| Minimum duration | None |
| Checkpoint | Every 10–15 minutes, or at a significant milestone. The agent keeps working afterward. |
| Uncheckpointed cap | 60 minutes. This is policy. It is not a measured Cursor limit. No timer enforces this interval. |
| Continuation | Resume the eligible run. |
| New run | Only when continuation is unavailable, inappropriate, or the repair budget is exhausted. |
| Early completion | Stop. |
| Blocker | Checkpoint, record the blocker, stop. |

Checkpointing is a durability write. It is not a session boundary and it is not a stage transition.

## Decision classes

| Class | Who may settle it |
| --- | --- |
| Necessary implication of established behavior | The seat that is investigating. Do not escalate the absence of a sentence. |
| Technical design with more than one sound implementation of an established requirement | Architect, or Analyst when it is a consequence of a released requirement and does not change product behavior |
| Founder decision | Only when product principles and the existing record cannot settle a consequential product choice. Name the alternatives, the consequences, and the evidence. |

The four open questions on `exec-identity` are founder decisions. They do not block PKT-001.

## Packet-release gates

All seven must be true before `wake` may become `sa`:

1. Required behavior is established.
2. Functional scope is bounded.
3. Relevant dependencies are understood.
4. Acceptance criteria are defined.
5. Unresolved questions do not force the Engineer to invent product behavior.
6. The packet does not contradict another authoritative specification.
7. The work is independently implementable, or its dependencies are declared.

Release is the ledger scope being `active`, plus those gates. The Architect writes `**Wake:** sa` and `"release": "released"` together. The founder does not edit that line per packet. A scope that is `inactive` or `suspended` keeps the line at `hold`.

PKT-001 is `verified` manual evidence. Its Wake stays `hold`. `markReleased` refuses `execution: "manual"`. Saving a file does not wake the Analyst. The dispatch record does.

## Batching

Related released packets may share one Analyst execution or one Engineer branch when they share architectural context. Their ids, acceptance checks, and manifests stay separate. Do not delay an unrelated ready packet in order to fill a batch.

## Concurrency

One Architect, one Analyst, and one Engineer at most. One implementation batch at a time. `controlStep` treats the slot as taken when an engineer dispatch is outstanding, an engineering lease is live, or a repair for the current fingerprint was already woken. One pass proposes at most one `wake_engineer` or `wake_repair`. Packet wakes are preferred over another architect session. Two investigations of different components may exist only after this single-batch path has been observed for real. That observation has not happened.

## Verification evidence

Every released packet names the checks that prove its requirements. A green build is not that proof. A passing check proves only the SHA it ran against. The controller refuses a pass whose SHA is not `candidateSha`.

A passing check moves the packet to `verified`. Acceptance is later: `integration_authorized`, then `integrated` with a merge SHA, then `reconciled`, then `accepted`. A green result on one commit does not mean the commit is on the target branch.

Product packets use Tower’s existing checks (`npm run build`, `npm run verify:ship`, and any script the systems-change packet names). They do not import Travis phone walks or `runtime-doors`.

The factory’s own check is `npm run factory:check`. It proves the controller, the PKT-001 oracle, and the manual-evidence record. The production click path is proved by `scripts/verify-click-attribution.ts` on the ship workflow, against the SHA named in the ledger.

## Plates

When a packet changes the glass, the plate is a screenshot of `/prototype-ant` with only the new hole painted. Read it with the five buckets in `docs/register/PLATE-READ.md`: copy, do not build, implied, completes, out of scope. PKT-001 changes no glass and has no plate.

## Two buckets

Specified and clear: do it. Specified but not clear: name the missing grain and stop. There is no third bucket.
