# Operating protocol

## Sessions

| Rule | Policy |
| --- | --- |
| Minimum duration | None |
| Checkpoint | Every 10–15 minutes, or at a significant milestone. The agent keeps working afterward. |
| Uncheckpointed cap | 60 minutes. This is policy. It is not a measured Cursor limit. |
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

Then the release itself is a second act:

- The packet Markdown contains the whole line `**Wake:** sa`.
- The manifest contains `"wake": "sa"` and `"release": "released"`.
- `.factory/manifests/factory.json` has `"activation": "active"`.
- The founder has authorized dispatch, as [SECRETS.md](./SECRETS.md) describes.

Until that act, a packet may be `releaseEligible: true` and still `**Wake:** hold`. PKT-001 is in that state. Saving the Markdown does not wake the Analyst.

## Batching

Related released packets may share one Analyst execution or one Engineer branch when they share architectural context. Their ids, acceptance checks, and manifests stay separate. Do not delay an unrelated ready packet in order to fill a batch.

## Concurrency

One Architect, one Analyst, and one Engineer at most. One implementation batch in engineering or verification at a time. `engineeringBusy` on the controller world enforces the slot. Two investigations of different components may exist only after this single-batch path has been observed for real. That observation has not happened.

## Verification evidence

Every released packet names the checks that prove its requirements. A green build is not that proof. A passing check proves only the SHA it ran against. The controller refuses a pass whose SHA is not `candidateSha`.

Product packets use Tower’s existing checks (`npm run build`, `npm run verify:ship`, and any script the systems-change packet names). They do not import Travis phone walks or `runtime-doors`.

The factory’s own check is `npm run factory:check`. It proves the controller and the PKT-001 oracle. It does not prove the production click path, because that path has not been planted.

## Plates

When a packet changes the glass, the plate is a screenshot of `/prototype-ant` with only the new hole painted. Read it with the five buckets in `docs/register/PLATE-READ.md`: copy, do not build, implied, completes, out of scope. PKT-001 changes no glass and has no plate.

## Two buckets

Specified and clear: do it. Specified but not clear: name the missing grain and stop. There is no third bucket.
