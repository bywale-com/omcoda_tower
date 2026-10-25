# Next

## Established

Claims 1–43 stand in `docs/specification-pass/SPECIFICATION.md`. Claim 43 is the no-workflow reactivation enroll.

Claim 43: when `eligibility.changed` fires no active workflow, the cascade enrolls reactivation only if the firm’s consent pair would allow a non-opt-in send. A missing row, `basis` `none`, `silenced` true, or `status` `silenced` does not enroll. An allowed pair enrolls the firm’s reactivation binding, or `tpl.reactivation.v1`, and the omitted `fireFirstStep` still sends. Those rows stay off the eligibility `writes`. The opt-in callers stay claim 22’s park.

Claims 41 and 42 still govern the consent map and the status column. Claims 37 and 38 still govern the meeting. Claim 12 still governs the four eligibility pointers.

## Still worth investigating

`handleOnboardingFire`, when `audit.completed` returns no workflows, calls `enrollAndActuate` with purpose `opt-in` and no `fireFirstStep`. The first step runs. The list is `sequence_ready` where `ready` is true. Claim 43’s missing-basis withhold does not apply. Whether silence stops that insert was not decided. The response counts `liveSends` from `!result.dryRun` and does not read `result.send`. The dispatch has no `writes` and no audit-run id.

`listUnsubscribe.accept` has no caller. No server handler writes the pair from a list-unsubscribe. The silence leaf names that control. Claim 41 did not add a route.

`SYSTEMS-GOAL` still asks whether launch day is only for contacts who were waitlisted, and it says not to fill that ask. Nothing writes `waitlisted`. The ask stays open.

The seed branch “Reactivation-worthy?” has no compares. `evalIfPick` returns false, and the edge has no `sourceHandle`, so activating `wf-eligibility-reactivation` enrolls nobody and also suppresses claim 43’s fallback. The pick was not specified. `any_pathway_pass` is still the constant true. What a pathway rule would write was not specified. The field chip’s `find`, and what `sequence_ready.ready` is derived from, remain open. `executeAuditRun` sets `ready` from email and phone and does not read `consent_records`.

`campaign_failure` does not store `enrollment_id`. Two enrollments can share a contact and a campaign. Loading the attempt to find that enrollment was not specified.

`handleContactImport` inserts `ON CONFLICT (id) DO UPDATE` and does not assign `firm_id`. The id stays on the first firm’s book row, and the dispatch still passes that id for the importing firm. The conflict update was not specified.

`handleMachineProvision` also writes `firms`, `campaign_states`, and `users`, and it may insert `access_links` and `audit_events`. Claim 16 leaves them off the pointer. `website` and `role` are echoed and are not inserted. `handlePoolAllocate` updates the same `ct_firms` id and does not dispatch.

P1’s remainder is the abort H1 postponed: what a halt does to Engine 2’s “one client, one motion,” and to the attempt engine’s live-override. Claim 20 does not nullify the attempt and does not retune `hasInboundOverride`. Claim 2 still allows two enrollments. Claim 43 did not add a one-motion refusal.

After the attempt loop, `tickOnce` calls `dispatchScheduleTriggers` and `resumeDueWaitingRuns`. A `call_agent` there is claim 18’s enroll check, then claim 22’s first step if the check passes. Other actions a resumed graph can take were not followed.

H1 also says the kill-switch is permanent in founder posture. Whether that founder row can be lifted was not read.

## Next move

Start at the no-workflow loop in `handleOnboardingFire` (`server/wire-service/machine.ts`) and the same `fireFirstStep !== false` branch in `enrollAndActuate`. The purpose is `opt-in`, so a missing basis is the send claim 23 already allows. See whether a silenced contact on `sequence_ready` is still enrolled, or whether the silence leaf stops that insert the way claim 43 stopped the reactivation insert. Claim 22 left this caller parked. Read the `ready` query and the first-step purpose before deciding. Do not fill the launch-day audience ask.
