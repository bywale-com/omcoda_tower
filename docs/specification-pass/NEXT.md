# Next

## Established

Inside one firm, a result has to name its execution. Agents may hold more than one enrollment for the same contact, because enroll always inserts and objective-met escalation inserts again. A completion belongs to the enrollment stamped on the form, the send, or the meeting — not to the newest enrollment. A bare fact matches nothing.

Claim 3 is locked against the send. `dispatchEmailLive` and `dispatchSmsLive` write `enrollment_id` and `campaign_objective_id` when the sequence caller passed them. `actuateChannelSend` only forwards those fields. A dry-run returns before the insert, so it has no row to click. On `email.clicked`, `handleResendWebhook` reads `firm_id` and `contact_id`, and `onCompletionWrite` selects the newest enrollment with a campaign. The click does not advance the enrollment named on the message. When the two enrollments share a `campaign_objective` id (`UNIQUE (campaign_id)`), the click advances the newer one. `objectiveSatisfiedBy` treats `campaign_objective_id` as sufficient and uses `enrollment_id` only when that column is null. While an `active_attempts` row for the stamped enrollment is still `open`, `tickOnce` can still advance it, because that call loads the enrollment by id. After the attempt is no longer open, the tick stops loading it. The predicate that meets the rule requires both `enrollment_id` and the current objective id. The form path and the meeting path were not re-walked.

The in-memory walker already keeps every node’s write pointers for a single invocation. A parked run must rebuild those pointers from that `workflow_run`’s `node_status`. A listening run must start from this firing’s `engagement_records` row and enrollment row, and must be able to load them by id. The engagement row is the objective that was met; the enrollment row has already moved on.

Verdicts and sequence-ready flags keyed only by contact cannot be a particular audit’s result. That result has to be a row later audits do not overwrite. The readers are not all the same question. `handleContactRecordsList`, `handleOnboardingFire`, and `executeGet` mean who is ready now, and they follow the latest row per contact. `handleAuditRunGet` means the run in the URL; `details.auditRunId` is overwritten by the next upsert, and the ready join on that response is the current flag. `eventTest.ts` door 1 for `audit.completed` means the newest complete run’s live specimen. `loadWriteRow` is the handle re-read and must see the row that run wrote. The grain was not changed.

“Open in Now” displays an ask and must not write `enrollment.campaign_id`. A meeting still stops every open attempt for the contact; that is packet 023, not an attribution bug.

## Still worth investigating

Specify the key of the per-person verdict and sequence-ready row, using the reader split above. Do not reopen the click. Do not reopen failure (packet 023) or lineage (Automations law 29). Do not re-walk the form or the meeting unless the key work turns up a contradiction. Do not implement.

## Next move

Specify the key so a later audit does not overwrite a contact’s verdict or ready flag. Read `server/wire-service/auditRun.ts` and the primary keys on `reachability_verdicts` and `sequence_ready` in `supabase/migrations/004_machine_tables.sql`. `handleContactRecordsList`, `handleOnboardingFire`, and `workflowWalk.ts` `executeGet` read the latest row per contact. `handleAuditRunGet` reads the run in the URL. `eventTest.ts` `door1` for `audit.completed` reads the newest complete run’s rows. `loadWriteRow` must load the row this run wrote. “Who is ready now” is a read of that same grain, not a second stored fact. Do not write a migration in that pass.
