# Next

## Established

Claims 1–34 stand in `docs/specification-pass/SPECIFICATION.md`. Claims 29–31 still govern the fact landing’s consent and its silence: a missing row or `basis` `none` does not insert, and `silenced` true does not stop a write the basis already allows.

Claim 32 is the key on that allowed path. Both handlers store a posted key only when `collectible_fields` has it, `capture` is `self_reportable`, and `employer_directed` is false. A missing row, a document-dependent key, and an employer-directed key do not insert `fact_writebacks`, do not clear `missing_fact_signals`, do not re-evaluate, do not dispatch, and do not complete. The seat skips that answer and still returns `projectSeat`. The fact route does not return `writebackId`. `body.source` does not keep the key. The painted slugs from Nudge form, Loop-closer form, and Update facts are not catalog rows, so they fail the class. A catalog key such as `language_clb` still stores. The seat’s field query and the walker’s listing set use the same class. The `if (!silenced)` around the seat query is not the class.

Claim 33 is the form pane when `basis` is `express` or `implied`, `silenced` is true, and the objective kind is `form`. `now.state` stays `form`. The title and instruction stay. The field query is not skipped. The list is claim 32’s class. `now.state` `silenced` stays unassigned.

Claim 34 is the missing-signal route. `handleMissingFactSignalCreate` does not read `consent_records`. A missing row, `basis` `none`, and `silenced` true do not withhold the insert. The insert is not `fact_writebacks` and does not complete `obj.optin.day`. The Ignore contact’s three seeded signals stay.

## Still worth investigating

`handleMissingFactSignalCreate` still inserts any `fieldKey`. It does not read `collectible_fields`. Loop-closer posts `validity_still_valid`, which has no catalog row. Claim 32 will not store that string as a fact and will not clear a signal for it. The walker inserts only the claim 32 class. No Manage table was found. `docs/register/how/contact-book.md` still says document-dependent asks stay Manage on the consultant desk. Whether this route refuses a key the fact class refuses, or whether a document-dependent or employer-directed key is a gap the form join hides, was not specified. It is the next move.

`writeBackContactFacts` still calls `applyFactsToMeetingsStore` when `writeFact` rejects. That local list is not the signal and not the fact. It was not retuned.

`handleContactSeatUpload` inserts `contact_uploads` for the link and dispatches `contact_uploaded`. It does not read `consent_records` or `collectible_fields`. The seed already stores a called-in note and a question note for `cr-harbor-4`. Whether that insert is inside the opt-in gate was not specified. It is not the signal class.

When the objective kind is `meeting`, `projectSeat` still sets `now.state` to `meeting` after the consent test, including the Ignore row and including `silenced` true. `docs/register/how/contact-book.md` asks for an invitation and a contact who is not silenced. That surface was not specified. It is not the signal class.

`SYSTEMS-GOAL` draws sign-up met as the campaign goal that lands on consent sequenced, and the same row says the cascade does not write that status. Claim 27 says that drawing is not this event. `obj.optin.day` still completes on `fact_writebacks` and still dispatches `objective_met`. A second formula for what that objective writes onto `consent_records` was not specified.

The same file asks whether launch day is only for contacts who were waitlisted, and it says not to fill that ask. Nothing writes `waitlisted`, so the fork has no stored signal on `consent_records.status`. The ask stays open.

`standInConsentSilence` keeps one slot per `contactId`. `setConsent` and `silence` store `firmId` on the slot and replace the previous firm. `get` does not take a firm. `setConsent` keeps the previous boolean. `silence` keeps the previous basis and sets the boolean true. `standInContactSeat.consent` also keeps the previous boolean, while the server seat statement clears it. Claims 29–33 name the mirror’s fact and form behavior and do not retune that boolean. `standInSendGate` calls `get` only when a contact is passed. The `decide` calls in `FirmOperationsBindModule.tsx` pass the firm and do not pass a contact. `registry.ts` keeps `sendGate` on `standInSendGate` even when `consentSilence` is real, so those calls do not hit `GET /consent/:contactId`. `standInSmsApi` calls `get` when it has a contact and denies on `basis` `none` with no opt-in exemption. That map is not `consent_records`.

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

Start at `handleMissingFactSignalCreate` in `server/wire-service/machine.ts` and at `signalMissingFact` in `src/app/wire/standins/machineApi.ts`. Claim 34 already says consent does not withhold the insert. The body is `contactId` and `fieldKey`. The handler does not read `collectible_fields`. `writeBackContactFacts` calls it with `validity_still_valid` after the fact loop, including when `writeFact` rejects. That string is not a `collectible_fields` row. Claim 32 refuses it as a fact and does not delete a matching signal, so the fact landing cannot answer it. `executeRuleWrites` inserts only a key whose `capture` is `self_reportable` and whose `employer_directed` is false. `projectSeat` shows the contact only that class. Decide whether this route uses that same class, or whether a `document_dependent` key or an `employer_directed` key is recorded here while the form join keeps it off the form. An unclassed key is the third case. `validity_still_valid` is that case. See `docs/register/how/contact-book.md` on Manage, and see whether any leaf names `missing_fact_signals` as that desk, before treating this table as the tracked work item. No Manage table was found under `supabase/`. Do not invent one in order to place the key. Do not withhold the insert for a missing consent row, for `basis` `none`, or for `silenced` true. Do not store the string as `fact_writebacks` in order to give the signal an answer.
