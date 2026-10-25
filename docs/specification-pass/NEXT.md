# Next

## Established

Claims 1–59 stand in `docs/specification-pass/SPECIFICATION.md`. Claim 58 is what `sequence_ready.ready` stores. Claim 59 is the founder kill-switch lift.

Claim 58: the audit still classifies reachable, partial, and unreachable from email and phone. `ready` on that run’s row is true only when the verdict is reachable or partial and the consent row for that contact and firm is not a silence. A missing row and `basis` `none` stay ready. `basis` is not an input. A later silence does not rewrite the run. Claim 44 still filters that later silence at enroll time. A contact already silenced when the audit wrote is not on the onboarding list.

Claim 59: the kill-switch is a firm-book `halt_records` row with `consultant_id` `founder`. `POST /halt/:haltId/lift` sets `lifted_at` on it, including when the consultant resume holds that id. The founder desk does not call lift. There is no expiry. A later firm-book commit still replaces the active row and does not return the firm to standby. One firm’s lift does not lift the fleet. The attempt is not nullified.

## Still worth investigating

`email.delivery_delayed` still only inserts `deferred`. Whether the next email to that address waits, and for how long, is the founder question below. Do not reopen it unless this session’s evidence answers it.

A halt still does not decide Engine 2’s “one client, one motion,” and it does not decide the attempt engine’s live-override. Claim 20 postponed that abort. Claim 59 does not nullify the attempt. Claim 54 keeps one firing to one sequence and does not add a unique enrollment constraint.

`any_pathway_pass` is still the constant `true`. What a pathway rule would write into `result` remains the derivation claim 12 left open. Until that write exists, the false side has nobody to enroll.

## Founder question

Launch day stays the ask `docs/register/SYSTEMS-GOAL.md` already left open, and it still says not to fill it. The choice is who is placed on `camp.optin.day`: only contacts who were `waitlisted`, or the book that is already in the opt-in sequence. What changes is which contacts an enrollment cursor is allowed to move onto that campaign. Nothing in this pass writes `waitlisted`. An attempt already on class `optin` uses purpose `opt-in` while the cursor sits there. That is claim 45. It is not a decision about who is placed there.

Repeat compression stays the question `docs/register/system-map/BUILD-system-map-v3-templates-and-binding.md` section C already marked named-silent. The choice is whether a later reactivation of a contact who already walked the days-1–3 nurture sends those two emails again, or walks a shorter cell. What changes is the cells that repeat enrollment’s cursor advances through. The first calendar is claim 51. The build said not to invent the repeat.

A `deferred` event’s hold stays open. The choice is whether the next email to that same address waits, and for how long, or whether the row is only a record and the due cell still sends. What changes is whether one temporary delay holds that address’s later mail. `deliv-23` wants the backoff inside a provider window. The payload does not name the receiving server and does not name a retry time, so a full inbox and a transient receiving server are the same event. One delay does not pause the firm. That part is claim 56. Parsing the recipient domain was not chosen, because a custom domain is not the receiving server and one full inbox would then hold every recipient at that domain.

## Next move

Start at `any_pathway_pass`. The inserted value is the constant `true`, and claim 12 left open what a pathway rule would write into `result`. Read the cascade’s motion expression and the eligibility rule output before inventing a second flag. Leave the three founder questions recorded. Claims 58 and 59 stand. Do not reopen the deferral hold, and do not recut the ready flag or the kill-switch lift.
