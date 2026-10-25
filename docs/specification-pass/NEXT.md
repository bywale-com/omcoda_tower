# Next

## Established

Claims 1–45 stand in `docs/specification-pass/SPECIFICATION.md`. Claim 45 is the later opt-in actuation.

Claim 45: the three tick sends pass purpose `opt-in` when the attempt’s `sequence_template.sequence_class` is `optin`, and `cem` otherwise, including when no template row loads. The id is `state.templateId`, else `enrollment.sequence_id`. `call_agent` uses that same column for its first-step purpose. Claim 43’s fallback string stays `reactivation`. Silence still denies `opt-in`. A missing basis still allows the day-1 announcement. The announcement’s offset is its day minus the primer’s day, which is 0, so it is due at enrollment and the cell advance sends it on a later tick. The enroll call still sends only the primer. Reactivation’s day-0 first cell keeps its existing spacing. Launch day is not filled. Nothing writes `waitlisted`.

Claims 41 and 42 still govern the consent map and the status column. Claims 37 and 38 still govern the meeting. Claim 12 still governs the four eligibility pointers. Claim 43 still governs the reactivation fallback. Claim 44 still governs the no-workflow opt-in enroll, and its silence withhold stays on that loop. Claim 20 still keeps the attempt open when a tick send is denied.

## Still worth investigating

`resumeDueWaitingRuns` marks due `wait_occupancy` rows approved and `resumeWaitRun` re-enters `walkValidatedWorkflow` from the wait node, with those rows as `triggerPayload.writes`. A `call_agent` there is claim 18’s enroll check, then claim 22’s first step, and claim 45’s purpose when the resolved class is `optin`. Other actions a resumed graph can take were not followed. `dispatchScheduleTriggers` walks active schedule triggers with `{ schedule: true, anyPass: true }` and was not followed past that call.

The day-3 guideline names email and SMS. The seeded cell `ol-d3-waitlist` is one email. The days 4–7 guideline names two emails and one text. The seeded cell is one email at day 4. Claim 45 did not add a cell. The day-2 social cell stays channel `form` and still does not send.

`listUnsubscribe.accept` has no caller. No server handler writes the pair from a list-unsubscribe. The silence leaf names that control. Claim 41 did not add a route.

`SYSTEMS-GOAL` still asks whether launch day is only for contacts who were waitlisted, and it says not to fill that ask. Nothing writes `waitlisted`. The ask stays open. An attempt already on class `optin` uses purpose `opt-in` while the cursor sits on `camp.optin.day`. That is not a decision about who is placed there.

The seed branch “Reactivation-worthy?” has no compares. `evalIfPick` returns false, and the edge has no `sourceHandle`, so activating `wf-eligibility-reactivation` enrolls nobody and also suppresses claim 43’s fallback. The pick was not specified. `any_pathway_pass` is still the constant true. What a pathway rule would write was not specified. The field chip’s `find`, and what `sequence_ready.ready` is derived from, remain open. `executeAuditRun` sets `ready` from email and phone and does not read `consent_records`.

`campaign_failure` does not store `enrollment_id`. Two enrollments can share a contact and a campaign. Loading the attempt to find that enrollment was not specified.

`handleContactImport` inserts `ON CONFLICT (id) DO UPDATE` and does not assign `firm_id`. The id stays on the first firm’s book row, and the dispatch still passes that id for the importing firm. The conflict update was not specified.

`handleMachineProvision` also writes `firms`, `campaign_states`, and `users`, and it may insert `access_links` and `audit_events`. Claim 16 leaves them off the pointer. `website` and `role` are echoed and are not inserted. `handlePoolAllocate` updates the same `ct_firms` id and does not dispatch.

P1’s remainder is the abort H1 postponed: what a halt does to Engine 2’s “one client, one motion,” and to the attempt engine’s live-override. Claim 20 does not nullify the attempt and does not retune `hasInboundOverride`. Claim 2 still allows two enrollments. Claims 43, 44, and 45 did not add a one-motion refusal.

H1 also says the kill-switch is permanent in founder posture. Whether that founder row can be lifted was not read.

## Next move

Start at `resumeWaitRun` and the nodes `walkValidatedWorkflow` can reach after `resumeFromNodeId`, for a run the tick resumed. The occupancy pointers are already the `writes` on that re-entry. Name what a resumed graph is allowed to do past `call_agent`, which is already specified. The schedule walk is the other call `tickOnce` makes after the attempt loop, and it is the same walker with a different payload. Do not fill the launch-day audience ask. Do not add a day-3 or days 4–7 cell in order to match the guideline’s channel count until that grain has been read on its own.
