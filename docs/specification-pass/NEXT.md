# Next

## Established

Claims 1–36 stand in `docs/specification-pass/SPECIFICATION.md`. Claims 29–34 still govern the fact landing, the silenced form, and the signal’s consent.

Claim 35 is the key on `handleMissingFactSignalCreate`. The route inserts only when `collectible_fields` has the `fieldKey`, `capture` is `self_reportable`, and `employer_directed` is false. A missing row, a document-dependent key, and an employer-directed key do not insert, do not return `id`, and the response is not ok. The empty-body 400 stays the empty body. Consent does not change the class: a missing row, `basis` `none`, and `silenced` true still allow a key that passes. The insert still does not write a fact and still does not complete `obj.optin.day`. `validity_still_valid` fails. The loop-closer still calls, and the meetings-store paint still runs. The list still returns stored rows. `missing_fact_signals` is the form’s required data. No leaf names it as Manage. The Ignore contact’s three seeded signals stay.

Claim 36 is the upload. `handleContactSeatUpload` does not read `consent_records`. A missing row, `basis` `none`, and `silenced` true do not withhold `contact_uploads` or the `contact_uploaded` dispatch. The insert does not write a fact, does not touch a missing signal, and does not call `onCompletionWrite`. A `question` stores `field_key` only when it passes claim 32’s class. `kind`, `custom`, and `any` do not read the catalog. The seed’s `ECA` file is a kind with a null field key. It is not `eca_status`, and the table is not Manage. `cr-harbor-4` and `cr-cedar-3` already have uploads, including the note that the docs went ahead of Agree.

## Still worth investigating

When the objective kind is `meeting`, `projectSeat` still sets `now.state` to `meeting` after the consent test, including the Ignore row and including `silenced` true. `handleContactSeatBook` still inserts `meeting_booked`, still dispatches, still calls `onCompletionWrite`, and still nullifies open attempts. `docs/register/how/contact-book.md` leaf 1.1 asks for an invitation and a contact who is not silenced. That surface was not specified.

`writeBackContactFacts` still calls `applyFactsToMeetingsStore` when `writeFact` rejects. That local list is not the signal and not the fact. It was not retuned.

No table is named Manage. Document-dependent asks stay off the form, off the fact, and off the signal. Upload kinds such as `ECA` are a different grain. The desk was not given a store.

`SYSTEMS-GOAL` draws sign-up met as the campaign goal that lands on consent sequenced, and the same row says the cascade does not write that status. Claim 27 says that drawing is not this event. `obj.optin.day` still completes on `fact_writebacks` and still dispatches `objective_met`. A second formula for what that objective writes onto `consent_records` was not specified.

The same file asks whether launch day is only for contacts who were waitlisted, and it says not to fill that ask. Nothing writes `waitlisted`, so the fork has no stored signal on `consent_records.status`. The ask stays open.

`standInConsentSilence` keeps one slot per `contactId`. `setConsent` and `silence` store `firmId` on the slot and replace the previous firm. `get` does not take a firm. `setConsent` keeps the previous boolean. `silence` keeps the previous basis and sets the boolean true. `standInContactSeat.consent` also keeps the previous boolean, while the server seat statement clears it. Claims 29–36 name the fact, the form, the signal, and the upload, and do not retune that boolean. `standInSendGate` calls `get` only when a contact is passed. The `decide` calls in `FirmOperationsBindModule.tsx` pass the firm and do not pass a contact. `registry.ts` keeps `sendGate` on `standInSendGate` even when `consentSilence` is real, so those calls do not hit `GET /consent/:contactId`. `standInSmsApi` calls `get` when it has a contact and denies on `basis` `none` with no opt-in exemption. That map is not `consent_records`.

The hard-bounce upsert and `handleContactSeatSilence` write the same pair and do not assign `status` and do not dispatch. The bounce conflict can leave `basis` `express` or `implied` with `silenced` true. Claim 31 reads that row. They were not specified as the silence route’s `status`.

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

Start at `projectSeat` in `server/wire-service/contactSeat.ts` where `objectiveKind === "meeting"`, and at `handleContactSeatBook` in the same file. Claim 28 keeps the Ignore row off `form` and off a booking that was never specified. Claim 33 keeps a silenced, opted-in contact on the form and does not pull the meeting branch in with it. The live seat still sets `now.state` to `meeting` for both of those rows once the objective kind is `meeting`. Leaf 1.1 of `docs/register/how/contact-book.md` asks for a firm-branded invitation and a contact who is not silenced, and the commit writes the meeting. See whether the handler reads `consent_records` before the insert, the dispatch, `onCompletionWrite`, and the attempt nullify. The upload in claim 36 is a different write. Do not withhold `contact_uploads` in order to answer the meeting. Do not mint a Manage table from the booking leaf’s sentence about document-dependent asks.
