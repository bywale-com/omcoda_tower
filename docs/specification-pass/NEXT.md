# Next

## Established

Inside one firm, a result has to name its execution. Agents may hold more than one enrollment for the same contact. A completion belongs to the enrollment stamped on the send. Claim 3 is locked against the email click. The form path and the meeting path were not re-walked. A parked run rebuilds its pointers from that `workflow_run`’s `node_status`. A listening run has to start from this firing’s rows. “Open in Now” must not write `enrollment.campaign_id`. A meeting still stops every open attempt for the contact (packet 023).

The per-person verdict and the sequence-ready flag are one row per contact per audit run. The primary key on both `reachability_verdicts` and `sequence_ready` is `(audit_run_id, contact_id)`. `firm_id` stays on the row and is not what separates two runs. A later audit inserts. It does not update the earlier row. There is no column named `id`. The pointer’s `id` is the `audit_run_id`, and `contact_id` is the person. `loadWriteRow` loads that pair. It does not apply “latest”.

“Who is ready now” is the latest row of that same table for `(firm_id, contact_id)`: greatest `updated_at`, then later `audit_runs.started_at` on a tie. A contact a later audit does not mention keeps the earlier row. `handleContactRecordsList`, `handleOnboardingFire`, and `executeGet` follow that read. `handleAuditRunGet` and `eventTest.ts` `door1` for `audit.completed` follow `audit_run_id`, not the contact’s current flag and not `details.auditRunId`. The verdict values and the contact upsert were not retuned. No migration was written. The live primary key is still `(contact_id, firm_id)`.

`engagement_records`, `fact_writebacks`, `meeting_booked`, and `wait_occupancy` each have `id TEXT PRIMARY KEY`. `loadWriteRow` loads `SELECT * FROM <table> WHERE id = pointer.id`. No firm predicate, no contact predicate, no “latest”. A miss returns null and does not fall back to the contact. That is the same predicate as `enrollment`, `contact_tag`, `missing_fact_signals`, `audit_runs`, `import_batch`, and `contact_records`. It is not the audit pair. A later node reads a field with `loadWriteField` and `nestedField` on that row.

The pointer’s `id` is that primary key. `contact_id` stays the person. The generic action (`manage_lists`, `assign_task`, `notify_consultant`) must push the id `writeEngagement` returns (`eng-` plus a uuid), not the contact id. The wait insert, `resumeDueWaitingRuns`, and `waitNote.ts` already push `row.id`. Fact and meeting inserts already use `fwb-` and `mtg-` as `id`. Door 1 specimens already use `body.id`. `engagement_records`, `fact_writebacks`, and `meeting_booked` join the person split the way enrollment does. The live set still omits them. The live loader still returns null. No migration was written.

## Still worth investigating

A live firing of `fact_writebacks`, `meeting_booked`, or `objective_met` does not put a `writes` pointer on the dispatch. `writebackId` and `meetingId` are on the payload. The objective engagement id is not. `writesFromPayload` does not read those keys, so the listening run’s `previousWrites` is empty. Claim 7 already refused a second channel and already named the objective write-set as the engagement row plus the enrollment row. Claim 10 says the pointer id is the inserted primary key. The payloads are not specified.

Distinct from that, and not the next move: what `sequence_ready.ready` is derived from, and the input pane copying `sample.id` onto a field chip. Several rows for one contact still resolve with `find`’s first until that chip names the row id. `campaign_failure` carries `campaignFailureId` the same way and was not followed. Failure, lineage, the click, the form, and the meeting stay closed.

## Next move

Specify how a live firing places the inserted id on the listening run’s pointer for `fact_writebacks`, `meeting_booked`, and `objective_met`. Start from `writesFromPayload` and from the dispatches in `handleFactWriteback`, `handleContactSeatFacts`, `handleMeetingBook`, `handleContactSeatMeeting`, and `advanceEnrollmentCampaign`. The channel is already `payload.writes`. The id is already the primary key. Include the enrollment pointer claim 7 already required on `objective_met`. Do not reopen the load. Do not reopen the generic action’s pointer. Do not reopen the audit key, the click, failure, or lineage. Do not re-walk the form or the meeting. Do not follow `campaign_failure` in that pass.
