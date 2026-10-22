# Next

## Established

Claims 1–40 stand in `docs/specification-pass/SPECIFICATION.md`. Claims 37 and 38 still govern the meeting. The seat books from the invitation when the contact is not silenced. `POST /machine/meetings` is that same invitation. A refused book does not return an id.

Claim 39 is the local meetings array in `src/app/register/prototype/shared/meetingsStore.ts`. It is one list. `applyFactsToMeetingsStore` runs only when every `writeFact` in the loop returned, and it updates an existing `clientId`. It does not `addMeeting`. A throw leaves the array unchanged. `confirmContactBooking` still adds only after `bookMeeting` returns an id, and the card it builds was not retuned. The product-face Meetings module lists `meeting_booked` and does not subscribe to this array. `signalMissingFact` still runs after the loop, including when the loop threw.

Claim 40 is `eventKindProse` on the operator activity column. `send_denied` and `send_dry_run` do not return `Sent`. They fall through to the spaced kind. `send_live` and `sent` still return `Sent`. `titleFor` has no new `send_denied` case. Claim 21’s default remains the complaint-desk title. `kindOf` still returns `other` for `send_denied`.

Claim 27 already says the sign-up drawing is not a dispatch and not a status write. The writers of `consent_records` under `server/` do not include `advanceEnrollmentCampaign`. There is no second formula for what `obj.optin.day` writes onto that table.

## Still worth investigating

`standInConsentSilence` keeps one slot per `contactId`. `setConsent` and `silence` store `firmId` on the slot and replace the previous firm. `get` does not take a firm. `setConsent` keeps the previous boolean. `silence` keeps the previous basis and sets the boolean true. `standInContactSeat.consent` also keeps the previous boolean, while the server seat statement clears it. Claims 29–40 name the fact, the form, the signal, the upload, the meeting, the paint, and the operator column, and do not retune that boolean. `standInSendGate` calls `get` only when a contact is passed. The `decide` calls in `FirmOperationsBindModule.tsx` pass the firm and do not pass a contact. `registry.ts` keeps `sendGate` on `standInSendGate` even when `consentSilence` is real, so those calls do not hit `GET /consent/:contactId`. `standInSmsApi` calls `get` when it has a contact and denies on `basis` `none` with no opt-in exemption. That map is not `consent_records`. This session did not open the file.

No table is named Manage. Document-dependent asks stay off the form, off the fact, and off the signal. Upload kinds such as `ECA` are a different grain. The desk was not given a store.

`SYSTEMS-GOAL` still asks whether launch day is only for contacts who were waitlisted, and it says not to fill that ask. Nothing writes `waitlisted`, so the fork has no stored signal on `consent_records.status`. The ask stays open.

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

## Next move

Start at `get` in `src/app/wire/standins/consentSilence.ts`. The live `consent_records` key is `(contact_id, firm_id)`. Claims 15, 23, and 24 already split the send’s pair from a get that has no firm. See whether this map’s one slot per contact is the stand-in’s mirror of that pair, or a second rule the seat mirror and the send stand-in are still sharing. The previous handoff described `setConsent`, `silence`, and `standInContactSeat.consent`. This session did not open the file. Read those three before deciding the boolean.
