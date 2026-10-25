# Next

## Established

Claims 1–53 stand in `docs/specification-pass/SPECIFICATION.md`. Claim 53 is the complaint rate on the firm’s email.

Claim 53: for one firm and one UTC day, the rate is distinct `messaging_events.message_id` values with `event_class` `complaint` divided by distinct `message_id` values with `event_class` `delivered`, using `at` as the receipt time. The rate exists only when that day has at least one delivery. At or over 0.10 percent, and under 0.30 percent, throttles the rest of that UTC day. At or over 0.30 percent on any of the seven UTC dates ending today quarantines the firm’s email until that date ages out. The check is in `dispatchEmailLive`, after consent, halt, and claim 50’s address deny. Text, the login code, and the enroll loops are not this rate. There is no `reputation_unit` row and no volume floor. `accepted` is not the denominator.

Claim 52 stands. A `nudge` motion is still not enrolled by the eligibility graph. Claim 50 stands. One complaint is still the address deny, and it quarantines the firm only when the day’s ratio meets the ceiling.

## Still worth investigating

Nothing under `server/` passes `tpl.reengagement.v1` into `enrollAndActuate` unless the caller already holds that ref. The eligibility action’s ref is `tpl.reactivation.v1`. `wf-webhook-reeval` says “nudge” in the label and stores the same reactivation ref. `actionAgentRef` prefers `agentRef` over the summary, so the label does not select the reengagement template. Seed §5.8 says a nudge fires when nothing is reactivation-worthy, and it marks the orchestration open. The false handle still has no edge. The fallback when the graph is inactive still enrolls reactivation, because `anyPass` is the constant `true`.

`email.delivery_delayed` still only inserts `deferred`. Whether `bounce_hard` should also deny by claim 50’s address join, beside claim 42’s pair, was not decided. What `sequence_ready.ready` is derived from remains the verdict-only writer in `executeAuditRun`.

P1’s remainder is what a halt does to Engine 2’s “one client, one motion,” and to the attempt engine’s live-override. Claim 20 does not nullify the attempt. Claim 2 still allows two enrollments. Claims 43 through 53 did not add a one-motion refusal. Whether the founder kill-switch row can be lifted was not read.

## Founder question

Launch day stays the ask `docs/register/SYSTEMS-GOAL.md` already left open, and it still says not to fill it. The choice is who is placed on `camp.optin.day`: only contacts who were `waitlisted`, or the book that is already in the opt-in sequence. What changes is which contacts an enrollment cursor is allowed to move onto that campaign. Nothing in this pass writes `waitlisted`. An attempt already on class `optin` uses purpose `opt-in` while the cursor sits there. That is claim 45. It is not a decision about who is placed there.

Repeat compression stays the question `docs/register/system-map/BUILD-system-map-v3-templates-and-binding.md` section C already marked named-silent. The choice is whether a later reactivation of a contact who already walked the days-1–3 nurture sends those two emails again, or walks a shorter cell. What changes is the cells that repeat enrollment’s cursor advances through. The first calendar is claim 51. The build said not to invent the repeat.

## Next move

Start at where a `nudge` motion enrolls `tpl.reengagement.v1`. The template, the `firm-cedar` binding, and `camp.reeng.nudge` exist. No seeded edge carries the false handle, and §5.8 calls the orchestration open, so the first read is whether some other firing already names that template, not whether to draw the edge claim 52 refused. `actionAgentRef` and the two seeded actions are the places that look like they might and do not. Leave both founder questions recorded. The complaint rate is claim 53. Do not reopen the window.
