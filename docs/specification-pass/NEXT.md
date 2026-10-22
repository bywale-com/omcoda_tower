# Next

## Established

Claims 1–42 stand in `docs/specification-pass/SPECIFICATION.md`. Claims 41 and 42 are the consent maps and the status column.

Claim 41: `standInConsentSilence` is one slot per contact. It is the stand-in of `POST /consent` and `POST /consent/silence`, not the pair, and not the seat. `setConsent` keeps the previous boolean. `silence` keeps the previous basis and sets the boolean true. `get` does not take a firm. `standInContactSeat` is a different map. Its Agree sets `silenced` false. Its workspace opt-out keeps the boolean. The send stand-in and the sms stand-in read the consent map. They do not read the seat slot.

Claim 42: the hard-bounce upsert and `handleContactSeatSilence` do not assign `consent_records.status`. The bounce still sets `silenced` true and does not dispatch. The seat opt-out still sets `workspace_opted_out` and does not set `silenced` true. An insert keeps `unsequenced`. A conflict keeps the previous `status`.

Claims 37 and 38 still govern the meeting. Claim 39 is the local meetings paint. Claim 40 is the operator activity column.

## Still worth investigating

`runContactEligibilityCascade`, when `dispatchEventToWorkflows` returns no workflows, calls `enrollAndActuate` without `fireFirstStep`. The function treats a missing flag as the first step, because the test is `!== false`, so that call still inserts `enrollment` and `active_attempts` and still enters the branch that writes `engagement_records`. It does not read `consent_records`. Claim 31 does not block it when the contact is silenced. The enroll was not specified.

`listUnsubscribe.accept` has no caller. No server handler writes the pair from a list-unsubscribe. The silence leaf names that control. Claim 41 did not add a route.

`SYSTEMS-GOAL` still asks whether launch day is only for contacts who were waitlisted, and it says not to fill that ask. Nothing writes `waitlisted`. The ask stays open.

`handleOnboardingFire` dispatches `audit.completed` with no `writes` and no audit-run id. The cascade stores `any_pathway_pass` true and `motion` reactivation because `anyPass` is the constant true. What a pathway rule would write was not specified. The seed branch “Reactivation-worthy?” has no pick. The field chip’s `find`, and what `sequence_ready.ready` is derived from, remain open. `executeAuditRun` sets `ready` from email and phone and does not read `consent_records`. Claim 11 puts two pointers with the same `contact_id` on one objective firing. A pick that names the table selects that table. A pick that matches only on `contact_id` still takes the first.

`campaign_failure` does not store `enrollment_id`. Two enrollments can share a contact and a campaign. Loading the attempt to find that enrollment was not specified.

`handleEnrollmentCreate` returns `dryRun` from `shouldLiveSend` and also returns `send`. `handleOnboardingFire`’s no-workflow loop counts `!result.dryRun` as `liveSends` and does not read `result.send`. Claim 22 leaves `result.dryRun` as the cohort flag. Those responses were not given a new formula.

`handleContactImport` inserts `ON CONFLICT (id) DO UPDATE` and does not assign `firm_id`. The id stays on the first firm’s book row, and the dispatch still passes that id for the importing firm. The conflict update was not specified.

`handleMachineProvision` also writes `firms`, `campaign_states`, and `users`, and it may insert `access_links` and `audit_events`. Claim 16 leaves them off the pointer. `website` and `role` are echoed and are not inserted. `handlePoolAllocate` updates the same `ct_firms` id and does not dispatch.

P1’s remainder is the abort H1 postponed: what a halt does to Engine 2’s “one client, one motion,” and to the attempt engine’s live-override. Claim 20 does not nullify the attempt and does not retune `hasInboundOverride`.

After the attempt loop, `tickOnce` calls `dispatchScheduleTriggers` and `resumeDueWaitingRuns`. A `call_agent` there is claim 18’s enroll check, then claim 22’s first step if the check passes. Other actions a resumed graph can take were not followed.

H1 also says the kill-switch is permanent in founder posture. Whether that founder row can be lifted was not read.

## Next move

Start at the `dispatched.length === 0` loop in `runContactEligibilityCascade` (`server/wire-service/machine.ts`) and the `fireFirstStep !== false` branch in `enrollAndActuate` (`server/wire-service/cascade.ts`). The call omits the flag, so the first step runs. See whether that fallback enroll is a send the silence and the consent basis already govern, or an enroll claim 12 left off the eligibility write-set. Claim 31 does not block it. Read the insert and the first-step send before deciding.
