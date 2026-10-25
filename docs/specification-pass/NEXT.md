# Next

## Established

Claims 1–44 stand in `docs/specification-pass/SPECIFICATION.md`. Claim 44 is the no-workflow opt-in enroll.

Claim 44: when `handleOnboardingFire` fires no active workflow, the fallback enrolls the firm’s opt-in binding, or `tpl.optin_launch.v1`, only if the contact’s consent pair for the session firm is not silenced. `silenced` true or `status` `silenced` does not enroll. A missing row or `basis` `none` does enroll, and the omitted `fireFirstStep` still sends. The ready list stays claim 8, silenced contacts included, and they stay on the dispatch’s `contactIds`. This firing inserts nothing, so `writes` stays absent and there is no audit-run id. `liveSends` stays the count of returns whose `dryRun` is false, the cohort flag, not `send.ok`. A withheld contact is absent from that array.

Claims 41 and 42 still govern the consent map and the status column. Claims 37 and 38 still govern the meeting. Claim 12 still governs the four eligibility pointers. Claim 43 still governs the reactivation fallback. `call_agent` on an active `wf-optin-launch` stays claim 22’s park.

## Still worth investigating

The escalation, the cell advance, and the wait arm each send purpose `cem`. The first step of this enroll sends purpose `opt-in`. For sequence class `optin` those strings are different gates. `tpl.optin_launch.v1` puts the day-1 announcement email on the cell after the text primer, so a contact with no basis does not receive it. Seed §5.3 calls the phase consent and first channel open. Story §7a gives that phase a day calendar. Story §6 leaves the firm→client CASL regime unnamed. Which purpose a later cell uses is the open choice.

`listUnsubscribe.accept` has no caller. No server handler writes the pair from a list-unsubscribe. The silence leaf names that control. Claim 41 did not add a route.

`SYSTEMS-GOAL` still asks whether launch day is only for contacts who were waitlisted, and it says not to fill that ask. Nothing writes `waitlisted`. The ask stays open.

The seed branch “Reactivation-worthy?” has no compares. `evalIfPick` returns false, and the edge has no `sourceHandle`, so activating `wf-eligibility-reactivation` enrolls nobody and also suppresses claim 43’s fallback. The pick was not specified. `any_pathway_pass` is still the constant true. What a pathway rule would write was not specified. The field chip’s `find`, and what `sequence_ready.ready` is derived from, remain open. `executeAuditRun` sets `ready` from email and phone and does not read `consent_records`.

`campaign_failure` does not store `enrollment_id`. Two enrollments can share a contact and a campaign. Loading the attempt to find that enrollment was not specified.

`handleContactImport` inserts `ON CONFLICT (id) DO UPDATE` and does not assign `firm_id`. The id stays on the first firm’s book row, and the dispatch still passes that id for the importing firm. The conflict update was not specified.

`handleMachineProvision` also writes `firms`, `campaign_states`, and `users`, and it may insert `access_links` and `audit_events`. Claim 16 leaves them off the pointer. `website` and `role` are echoed and are not inserted. `handlePoolAllocate` updates the same `ct_firms` id and does not dispatch.

P1’s remainder is the abort H1 postponed: what a halt does to Engine 2’s “one client, one motion,” and to the attempt engine’s live-override. Claim 20 does not nullify the attempt and does not retune `hasInboundOverride`. Claim 2 still allows two enrollments. Claim 43 and claim 44 did not add a one-motion refusal.

After the attempt loop, `tickOnce` calls `dispatchScheduleTriggers` and `resumeDueWaitingRuns`. A `call_agent` there is claim 18’s enroll check, then claim 22’s first step if the check passes. Other actions a resumed graph can take were not followed.

H1 also says the kill-switch is permanent in founder posture. Whether that founder row can be lifted was not read.

## Next move

Start at the three `purpose: "cem"` calls in `tickOnce`’s path (`escalateAttemptWindow`, `advanceTemplateCellIfDue`, and the wait arm in `server/wire-service/cascade.ts`) for an attempt whose template is sequence class `optin`. The first step already passed `opt-in`. Read Seed §5.3, Story §7a, and the cells on `tpl.optin_launch.v1` before deciding whether a later cell keeps purpose `opt-in` or stays `cem`. That choice changes whether the day-1 announcement email sends to a contact who has no basis. Do not fill the launch-day audience ask. Do not move claim 44’s silence withhold into `enrollAndActuate`.
