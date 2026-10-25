# Next

## Established

Claims 1–55 stand in `docs/specification-pass/SPECIFICATION.md`. Claim 55 is the permanent-bounce address deny.

Claim 55: `email.bounced` is classified from `data.bounce.type`. `Permanent` is `bounce_hard`. `Temporary`, `Transient`, and `Undetermined` are `bounce_soft`. A missing type, any other string, and a payload with no `bounce` object stay `bounce_hard`. `bounce_hard` keeps claim 42’s pair, which silences that firm and contact and does not assign `status`, and it joins claim 50’s address deny. The detail stays `suppressed`. The join does not stop a text. `bounce_soft` only inserts the event. `email.delivery_delayed` stays `deferred` and does not join. Claim 54 stands. The complaint window was not reopened.

## Still worth investigating

`bounce_soft` has no retry bound. `deliv-10` says the soft bounce retries within a limit, and the paper path writes that limit on `engagement_attempt`. `cascade.ts` carries `window_started_at`. That field was not read as the bound.

`email.delivery_delayed` still only inserts `deferred`. `deliv-23` says the queue backs off when a provider defers, and it states no count and no duration. The payload names `to` and does not name the receiving server. One delay pausing the firm, and one delay pausing that address, were not chosen.

`email.suppressed` and `suppression.added` fall through `mapClass`. The permanent bounce and the complaint already feed the join.

What `sequence_ready.ready` is derived from remains the verdict-only writer in `executeAuditRun`. `SYSTEMS-REQUIREMENTS-FILLED.md` §5 says the flag is derived from the verdict and consent. The audit writer sets it from the verdict alone.

A halt still does not decide Engine 2’s “one client, one motion,” and it does not decide the attempt engine’s live-override. Claim 20 does not nullify the attempt. Claim 54 keeps this firing to one sequence and does not add a unique enrollment constraint. Whether the founder kill-switch row can be lifted was not read.

`any_pathway_pass` is still the constant `true`. What a pathway rule would write into `result` remains the derivation claim 12 left open. Until that write exists, the false side has nobody to enroll.

## Founder question

Launch day stays the ask `docs/register/SYSTEMS-GOAL.md` already left open, and it still says not to fill it. The choice is who is placed on `camp.optin.day`: only contacts who were `waitlisted`, or the book that is already in the opt-in sequence. What changes is which contacts an enrollment cursor is allowed to move onto that campaign. Nothing in this pass writes `waitlisted`. An attempt already on class `optin` uses purpose `opt-in` while the cursor sits there. That is claim 45. It is not a decision about who is placed there.

Repeat compression stays the question `docs/register/system-map/BUILD-system-map-v3-templates-and-binding.md` section C already marked named-silent. The choice is whether a later reactivation of a contact who already walked the days-1–3 nurture sends those two emails again, or walks a shorter cell. What changes is the cells that repeat enrollment’s cursor advances through. The first calendar is claim 51. The build said not to invent the repeat.

## Next move

Start at `bounce_soft` and the retry bound. Claim 55 stores that class and does not suppress it. `deliv-10` says the retry is bounded. Read `window_started_at` before inventing a count. Then `email.delivery_delayed`: the event is `deferred`, the payload has no receiving server, and `deliv-23` states no duration. Leave both founder questions recorded. The permanent-bounce join is claim 55. Do not redraw the false edge, and do not reopen the complaint window.
