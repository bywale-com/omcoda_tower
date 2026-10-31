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

An assignment is the schedulable unit. It may name one packet or several. The Architect records a sibling only for a shared contract, dependency, component, runtime behavior, or implementation boundary. Adjacent ids are not a sibling link. The controller builds one Analyst assignment from eligible released packets in that graph. A packet whose sibling is not yet eligible is dispatched alone. The assignment does not wait to grow. Each packet keeps its own identity, revision, nine-section specification, checks, and history. One execution may sign several of them.

## Concurrency

One Architect, one Analyst, and one Engineer at most. One implementation batch at a time. The engineer slot is taken by a live lease, a repair fingerprint that was already woken, or a pending engineer dispatch whose reservation has not expired. A dispatched execution that never starts, a refused execution, and an expired lease leave the slot. One pass proposes at most one `wake_engineer` or `wake_repair`. Packet wakes are preferred over another architect session. A new architect launch waits while the engineering queue is two or more packets deep. A running architect execution is not stopped by that hold. Two investigations of different components may exist only after this single-batch path has been observed for real. That observation has not happened.

## Release

A release is the smallest set that is true on its own. Sibling basis `dependency` closes the set. Every dependency is already accepted or inside the set, and every packet still open in the set is `verified`. An assignment is not a release. An initiative is not a release.

When that set is verified, `scripts/factory-emerge.ts` opens one pull request whose base is `main` and whose diff is the product paths in those verified commits. It mails that sheet when `EMERGE_EMAIL`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL` are set. It does not merge. Merging that pull request is the founder's conclusion. The next pass records the merge SHA and accepts the packets in the release. The factory branch is not the branch that lands on `main`.

## Verification evidence

Every released packet names the checks that prove its requirements. A green build is not that proof. A passing check proves only the SHA it ran against. The controller refuses a pass whose SHA is not `candidateSha`.

A passing check moves the packet to `verified`. Acceptance is later: `integration_authorized`, then `integrated` with a merge SHA, then `reconciled`, then `accepted`. A green result on one commit does not mean the commit is on the target branch.

Product packets use Tower’s existing checks (`npm run build`, `npm run verify:ship`, and any script the systems-change packet names). They do not import Travis phone walks or `runtime-doors`.

The factory’s own check is `npm run factory:check`. It proves the controller, the PKT-001 oracle, and the manual-evidence record. The production click path is proved by `scripts/verify-click-attribution.ts` on the ship workflow, against the SHA named in the ledger.

## Plates

Every packet classifies the glass before release. The line is `**UI:** none` or `**UI:** changes`, and the manifest field `"ui"` matches it.

`none` keeps `## Plates` as `None`. No screenshot is required. PKT-001 changes no glass and has no plate. Packets already released with that empty plates section stay released. `markReleased` is not run on them again.

`changes` requires a screenshot of `/prototype-ant` with only the new hole painted. `readPlateArtifacts` reads that file from disk. It accepts a non-empty `.png`, `.jpg`, `.jpeg`, `.webp`, or `.gif` whose bytes are a PNG, JPEG, GIF, or WEBP image. A byte count written by hand is not an artifact. The same section carries all five buckets in `docs/register/PLATE-READ.md`: Copy, Do not build, Implied, Completes, Out of scope.

`markReleased` refuses to write `**Wake:** sa` when the classification is missing, the line and the manifest disagree, a no-UI packet's plates section is not `None`, the artifact is missing or unreadable, or any of the five buckets is missing or empty. The seven gates above still all have to pass. These plate checks sit beside those gates. They do not replace one. Founder approval is not a plate gate.

## Two buckets

Specified and clear: do it. Specified but not clear: name the missing grain and stop. There is no third bucket.
