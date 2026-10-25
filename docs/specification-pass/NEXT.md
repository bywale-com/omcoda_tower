# Next

## Established

Claims 1–47 stand in `docs/specification-pass/SPECIFICATION.md`. Claims 46 and 47 are the resumed wait and the schedule tick.

Claim 46: `resumeWaitRun` continues the same `workflow_run` from the wait’s outgoing edges and does not execute the wait again. The tick resumes a duration, whose writes are `counts.waitWrites` and whose people are `counts.waitContactIds`, and an approval whose `resume_at` the desk set, whose writes are the occupancy rows it marks approved. Approve now enters the same function with those occupancy pointers. Both callers pass the run’s `trigger_label`. Past `call_agent`, the outgoing nodes are the operations already on the graph: tag, audit, the three engagement actions, rule, Get, If, Switch, a further wait, constant, exit. Claim 6’s chain rebuild is still required. Claims 43 and 44’s silence withhold stays on the two enroll loops.

Claim 47: a schedule tick starts one new run for a workflow and firm when `schedule.cron` matches that UTC minute, and not otherwise. The people are claim 17’s audience for the trigger’s firm. The payload is `{ schedule: true }` with no `anyPass` and no writes. `call_agent` on it is claims 18, 22, and 45. A later minute may enroll again.

Claim 45 still governs the later opt-in purpose. Claims 41 and 42 still govern the consent map and the status column. Claims 37 and 38 still govern the meeting. Claim 12 still governs the four eligibility pointers. Claim 43 still governs the reactivation fallback. Claim 44 still governs the no-workflow opt-in enroll. Claim 20 still keeps the attempt open when a tick send is denied. Claim 17 still governs an event firing that passed no contact ids. The schedule dispatcher is claim 47, not a second reading of that event function.

## Still worth investigating

`executeGet` for module `contacts` and select `every` loads `contact_records` with no `firm_id` predicate and, when the Get has no mapped slots, replaces `ctx.contactIds`. Claim 46’s waited contacts and claim 47’s audience are what the walk held until that node. Claim 8 left the missing predicate because it was not the audit-grain question. A select other than `every` already filters on `getClass1` as the firm.

`listUnsubscribe.accept` has no caller. No server handler writes the pair from a list-unsubscribe. The silence leaf names that control. Claim 41 did not add a route.

The day-3 guideline names email and SMS. The seeded cell `ol-d3-waitlist` is one email. The days 4–7 guideline names two emails and one text. The seeded cell is one email at day 4. The day-2 social cell stays channel `form` and still does not send.

The seed branch “Reactivation-worthy?” has no compares. `evalIfPick` returns false, and the edge has no `sourceHandle`, so activating `wf-eligibility-reactivation` enrolls nobody and also suppresses claim 43’s fallback. `any_pathway_pass` is still the constant true. The field chip’s `find`, and what `sequence_ready.ready` is derived from, remain open. `executeAuditRun` sets `ready` from email and phone and does not read `consent_records`.

`campaign_failure` does not store `enrollment_id`. Two enrollments can share a contact and a campaign. `handleContactImport` inserts `ON CONFLICT (id) DO UPDATE` and does not assign `firm_id`. `handleMachineProvision` also writes tables claim 16 leaves off the pointer. `handlePoolAllocate` updates the same `ct_firms` id and does not dispatch.

P1’s remainder is what a halt does to Engine 2’s “one client, one motion,” and to the attempt engine’s live-override. Claim 20 does not nullify the attempt. Claim 2 still allows two enrollments. Claims 43 through 47 did not add a one-motion refusal. Whether the founder kill-switch row can be lifted was not read.

## Founder question

Launch day stays the ask `docs/register/SYSTEMS-GOAL.md` already left open, and it still says not to fill it. The choice is who is placed on `camp.optin.day`: only contacts who were `waitlisted`, or the book that is already in the opt-in sequence. What changes is which contacts an enrollment cursor is allowed to move onto that campaign. Nothing in this pass writes `waitlisted`. An attempt already on class `optin` uses purpose `opt-in` while the cursor sits there. That is claim 45. It is not a decision about who is placed there.

## Next move

Start at `executeGet` when the module is `contacts` and the select is `every`. The query has no firm. A Get with no mapped slots replaces the people claim 46 or claim 47 just placed, including with contacts of other firms. Decide whether that select is the walk’s firm or a real every-row read, and what a mapped Get on the same walk keeps. Do not fill the launch-day audience ask. Do not add a day-3 or days 4–7 cell in order to match the guideline’s channel count until that grain has been read on its own.
