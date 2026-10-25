# Next

## Established

Claims 1–54 stand in `docs/specification-pass/SPECIFICATION.md`. Claim 54 is the nudge enroll.

Claim 54: a contact whose `motion_decisions.motion` on this firing is `nudge` enrolls the firm’s re-engagement sequence, and this firing does not also enroll that contact in reactivation. On an active `wf-eligibility-reactivation` the enroll is node `action-nudge`, `agentRef` `tpl.reengagement.v1`, reached by `sourceHandle` `false` from “Reactivation-worthy?”. When the graph is inactive, claim 43’s loop uses that class instead of reactivation. The purpose is `cem`. Claim 52’s non-opt-in pair withholds. The cursor lands on `camp.reeng.nudge`, whose form is the one self-reportable form the seat already lists. `anyPass` stays the constant `true`, so the inserted motion is still `reactivation` until the pathway predicate is specified. The webhook label, the rule’s nudge flag, and the Agents Launch button do not read the column. Claim 52’s true side stands. Claim 2 still allows a second enrollment from another caller.

Claim 53 stands. The complaint rate was not reopened.

## Still worth investigating

`email.delivery_delayed` still only inserts `deferred`. Whether `bounce_hard` should also deny by claim 50’s address join, beside claim 42’s pair, was not decided.

What `sequence_ready.ready` is derived from remains the verdict-only writer in `executeAuditRun`. `SYSTEMS-REQUIREMENTS-FILLED.md` §5 says the flag is derived from the verdict and consent. The audit writer sets it from the verdict alone.

A halt still does not decide Engine 2’s “one client, one motion,” and it does not decide the attempt engine’s live-override. Claim 20 does not nullify the attempt. Claim 54 keeps this firing to one sequence and does not add a unique enrollment constraint. Whether the founder kill-switch row can be lifted was not read.

`any_pathway_pass` is still the constant `true`. What a pathway rule would write into `result` remains the derivation claim 12 left open. Until that write exists, the false side has nobody to enroll.

## Founder question

Launch day stays the ask `docs/register/SYSTEMS-GOAL.md` already left open, and it still says not to fill it. The choice is who is placed on `camp.optin.day`: only contacts who were `waitlisted`, or the book that is already in the opt-in sequence. What changes is which contacts an enrollment cursor is allowed to move onto that campaign. Nothing in this pass writes `waitlisted`. An attempt already on class `optin` uses purpose `opt-in` while the cursor sits there. That is claim 45. It is not a decision about who is placed there.

Repeat compression stays the question `docs/register/system-map/BUILD-system-map-v3-templates-and-binding.md` section C already marked named-silent. The choice is whether a later reactivation of a contact who already walked the days-1–3 nurture sends those two emails again, or walks a shorter cell. What changes is the cells that repeat enrollment’s cursor advances through. The first calendar is claim 51. The build said not to invent the repeat.

## Next move

Start at `email.delivery_delayed` and the hard bounce. Claim 42’s bounce upsert silences the contact and does not assign `status`. Claim 50’s address deny is the complaint joined to `outbound_messages.to_addr`. The open choice is whether `bounce_hard` also suppresses that address, beside the consent pair. Leave both founder questions recorded. The nudge enroll is claim 54. Do not redraw the false edge, and do not reopen the complaint window.
