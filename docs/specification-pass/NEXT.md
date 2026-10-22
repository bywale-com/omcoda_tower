# Next

## Established

Claims 1–38 stand in `docs/specification-pass/SPECIFICATION.md`. Claims 29–36 still govern the fact landing, the silenced form, the signal’s key, and the upload.

Claim 37 is the seat meeting. The writer is `handleContactSeatMeeting`. There is no `handleContactSeatBook`. After the consent ask is passed, objective kind `meeting` and `silenced` false set `now.state` to `meeting` and attach slots, including the Ignore row. `silenced` true leaves that Now empty and attaches no slots. The post inserts, dispatches, completes, and nullifies open attempts only when the kind is `meeting`, the ask is not outstanding, and `silenced` is false. `cr-harbor-3` and `cr-cedar-2` book. `cr-harbor-4` does not, because the kind is `form`. The form claim 33 kept stays. The upload claim 36 kept stays.

Claim 38 is `handleMeetingBook` on `POST /machine/meetings`. The same invitation and the same silence rule gate that insert, the dispatch, `onCompletionWrite`, the attempt nullify, and the side `engagement_records` row. A refused book returns no id. The plant’s Booking still calls this route. `standInConsentSilence` still has no `source`.

## Still worth investigating

`writeBackContactFacts` still calls `applyFactsToMeetingsStore` when `writeFact` rejects. `confirmContactBooking` pushes a local `StoredMeeting` only after `bookMeeting` returns an id. That list is not `meeting_booked` and not the fact. It was not retuned.

No table is named Manage. Document-dependent asks stay off the form, off the fact, and off the signal. Upload kinds such as `ECA` are a different grain. The desk was not given a store.

`SYSTEMS-GOAL` draws sign-up met as the campaign goal that lands on consent sequenced, and the same row says the cascade does not write that status. Claim 27 says that drawing is not this event. `obj.optin.day` still completes on `fact_writebacks` and still dispatches `objective_met`. A second formula for what that objective writes onto `consent_records` was not specified.

The same file asks whether launch day is only for contacts who were waitlisted, and it says not to fill that ask. Nothing writes `waitlisted`, so the fork has no stored signal on `consent_records.status`. The ask stays open.

`standInConsentSilence` keeps one slot per `contactId`. `setConsent` and `silence` store `firmId` on the slot and replace the previous firm. `get` does not take a firm. `setConsent` keeps the previous boolean. `silence` keeps the previous basis and sets the boolean true. `standInContactSeat.consent` also keeps the previous boolean, while the server seat statement clears it. Claims 29–38 name the fact, the form, the signal, the upload, and the meeting, and do not retune that boolean. `standInSendGate` calls `get` only when a contact is passed. The `decide` calls in `FirmOperationsBindModule.tsx` pass the firm and do not pass a contact. `registry.ts` keeps `sendGate` on `standInSendGate` even when `consentSilence` is real, so those calls do not hit `GET /consent/:contactId`. `standInSmsApi` calls `get` when it has a contact and denies on `basis` `none` with no opt-in exemption. That map is not `consent_records`.

The hard-bounce upsert and `handleContactSeatSilence` write the same pair and do not assign `status` and do not dispatch. The seat silence route sets `workspace_opted_out` and does not set `silenced` true. The bounce conflict can leave `basis` `express` or `implied` with `silenced` true. Claim 31 reads that row. They were not specified as the silence route’s `status`.

When the eligibility dispatch fires no workflow, `enrollAndActuate` inserts `enrollment`, `active_attempts`, and, because `fireFirstStep` is omitted, an `engagement_records` row. The write-set does not name those tables. Claim 31 does not block that enroll when the contact is silenced. The enroll was not specified.

Distinct from that: `handleOnboardingFire` dispatches `audit.completed` with no `writes` and no audit-run id. The cascade stores `any_pathway_pass` true and `motion` reactivation because `anyPass` is the constant true. What a pathway rule would write was not specified. The seed branch “Reactivation-worthy?” has no pick. The field chip’s `find`, and what `sequence_ready.ready` is derived from, remain open. `executeAuditRun` sets `ready` from email and phone and does not read `consent_records`. Claim 11 puts two pointers with the same `contact_id` on one objective firing. A pick that names the table selects that table. A pick that matches only on `contact_id` still takes the first.

`campaign_failure` does not store `enrollment_id`. Two enrollments can share a contact and a campaign. Loading the attempt to find that enrollment was not specified.

`handleEnrollmentCreate` returns `dryRun` from `shouldLiveSend` and also returns `send`. `handleOnboardingFire`’s no-workflow loop counts `!result.dryRun` as `liveSends` and does not read `result.send`. Claim 22 leaves `result.dryRun` as the cohort flag. Those responses were not given a new formula.

`handleContactImport` inserts `ON CONFLICT (id) DO UPDATE` and does not assign `firm_id`. The id stays on the first firm’s book row, and the dispatch still passes that id for the importing firm. The conflict update was not specified.

`handleMachineProvision` also writes `firms`, `campaign_states`, and `users`, and it may insert `access_links` and `audit_events`. Claim 16 leaves them off the pointer. `website` and `role` are echoed and are not inserted. `handlePoolAllocate` updates the same `ct_firms` id and does not dispatch.

P1’s remainder is the abort H1 postponed: what a halt does to Engine 2’s “one client, one motion,” and to the attempt engine’s live-override. Claim 20 does not nullify the attempt and does not retune `hasInboundOverride`.

After the attempt loop, `tickOnce` calls `dispatchScheduleTriggers` and `resumeDueWaitingRuns`. A `call_agent` there is claim 18’s enroll check, then claim 22’s first step if the check passes. Other actions a resumed graph can take were not followed.

H1 also says the kill-switch is permanent in founder posture. Whether that founder row can be lifted was not read.

`eventKindProse` returns `Sent` for every kind that contains `send`, so a `send_denied` row would read as `Sent` on the operator Agents table. The consultant chronology’s `titleFor` has no case for that kind.

## Next move

Start at `applyFactsToMeetingsStore` in `src/app/register/prototype/shared/meetingsStore.ts`, from the call in `writeBackContactFacts` that still runs when `writeFact` rejects. Claims 30 and 34 left that paint. Claim 37’s meeting row and claim 38’s machine post are a different store. See what the local list holds, whether a rejected fact still paints it, and whether `confirmContactBooking`’s `StoredMeeting` is that same list or a second one. Do not withhold `meeting_booked` again in order to answer the paint. Do not mint a Manage table from the booking leaf’s sentence about document-dependent asks.
