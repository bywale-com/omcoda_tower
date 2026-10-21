# Next

## Established

Inside one firm, a result has to name its execution. Agents may hold more than one enrollment for the same contact. A completion belongs to the enrollment stamped on the send. Claim 3 is locked against the email click. The form path and the meeting path were not re-walked. A parked run rebuilds its pointers from that `workflow_run`’s `node_status`. A listening run has to start from this firing’s rows. “Open in Now” must not write `enrollment.campaign_id`. A meeting still stops every open attempt for the contact (packet 023).

The per-person verdict and the sequence-ready flag are one row per contact per audit run. The primary key on both `reachability_verdicts` and `sequence_ready` is `(audit_run_id, contact_id)`. `firm_id` stays on the row and is not what separates two runs. A later audit inserts. It does not update the earlier row. There is no column named `id`. The pointer’s `id` is the `audit_run_id`, and `contact_id` is the person. `loadWriteRow` loads that pair. It does not apply “latest”.

“Who is ready now” is the latest row of that same table for `(firm_id, contact_id)`: greatest `updated_at`, then later `audit_runs.started_at` on a tie. A contact a later audit does not mention keeps the earlier row. `handleContactRecordsList`, `handleOnboardingFire`, and `executeGet` follow that read. `handleAuditRunGet` and `eventTest.ts` `door1` for `audit.completed` follow `audit_run_id`, not the contact’s current flag and not `details.auditRunId`. The verdict values and the contact upsert were not retuned. No migration was written. The live primary key is still `(contact_id, firm_id)`.

## Still worth investigating

`loadWriteRow` returns null for `engagement_records`, `fact_writebacks`, `meeting_booked`, and `wait_occupancy`. The generic action pushes an engagement pointer whose `id` is the contact, while `writeEngagement` returns a different id. That is the open handle gap. It is not the audit key.

Distinct from that, and not the next move: what `sequence_ready.ready` is derived from (the requirements sentence includes consent; the audit writer does not), and the input pane copying `sample.id` onto a field chip. The house If matches `contact_id` and does not use that chip. Failure, lineage, the click, the form, and the meeting stay closed.

## Next move

Specify how `loadWriteRow` loads `engagement_records`, `fact_writebacks`, `meeting_booked`, and `wait_occupancy` by the pointer it is given. Start from the null return at the bottom of that function, and from the generic action in `workflowWalk.ts` that calls `writeEngagement` and then pushes `id: contactId`. The inserted id and the pointer id have to be the same id, or the re-read cannot see the row. Do not reopen the audit key. Do not reopen the click, failure, or lineage. Do not re-walk the form or the meeting. Do not write a migration in that pass.
