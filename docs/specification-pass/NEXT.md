# Next

## Established

Inside one firm, a result has to name its execution. Agents may hold more than one enrollment for the same contact, because enroll always inserts and objective-met escalation inserts again. A completion belongs to the enrollment stamped on the form, the send, or the meeting — not to the newest enrollment. A bare fact matches nothing. The in-memory walker already keeps every node’s write pointers for a single invocation. A parked run must rebuild those pointers from that `workflow_run`’s `node_status`. A listening run must start from this firing’s `engagement_records` row and enrollment row, and must be able to load them by id. The engagement row is the objective that was met; the enrollment row has already moved on. Verdicts and sequence-ready flags keyed only by contact cannot be a particular audit’s result; that result has to be a row later audits do not overwrite, and “who is ready now” is the latest row. “Open in Now” displays an ask and must not write `enrollment.campaign_id`. A meeting still stops every open attempt for the contact; that is packet 023, not an attribution bug.

## Still worth investigating

Confirm claim 3 on the send side: `actuateChannelSend` persists `enrollment_id` and `campaign_objective_id`, and the click matcher still never sees them because `onCompletionWrite` picks the enrollment first. Confirm each reader listed under claim 8 really means “current” before the verdict grain changes. Do not reopen failure (packet 023) or lineage (Automations law 29) in that pass.

## Next move

Take one outbound message that was stamped for enrollment A, with enrollment B newer and still open, and follow the click from `webhooks.ts` through `onCompletionWrite` and `objectiveSatisfiedBy`. Write down whether A fails to advance. That either locks claim 3 against the send or revises it. Do not start the audit primary-key change in that same pass.
