# Next

## Established

Claims 1–57 stand in `docs/specification-pass/SPECIFICATION.md`. Claim 56 is the soft-bounce budget. Claim 57 is Resend’s suppression list.

Claim 56: `window_started_at` is the attempt-window clock. The soft-retry bound is the attempt budget `escalateAttemptWindow` already reads: `campaign.attempt_count`, else `sac-global` (seeded `3`), else `1`. Distinct `bounce_soft` messages for that `attemptId` and address fill it. The next email on that attempt then returns detail `soft-retry`. The attempt stays open. The address is not globally suppressed. The webhook does not resend the body. `deferred` does not count.

Claim 57: `email.suppressed`, `suppression.added`, and `suppression.removed` are stored. An add or a skip denies that address with detail `suppressed` until a later removal is the newest list event. A `bounce_hard` row and a `complaint` row stay denied after a removal. Origin `bounce` on an add also runs claim 42’s pair when the outbound row named the contact. `complaint`, `manual`, and any other origin deny the address only. `data.to` is still not the binding. Claim 55’s classification stands. One `deferred` event does not pause the firm.

## Still worth investigating

`email.delivery_delayed` still only inserts `deferred`. The payload carries `to` and `from`. `from` is the sender. There is no receiving server and no retry time. `deliv-23` asks for a per-provider backoff and states no duration. `wait_after_last_failed_seconds` and the email `within_seconds` are the attempt machine. The cell advance runs before that wait. Whether the next email to that address waits, and for how long, is the founder question below.

What `sequence_ready.ready` is derived from remains the verdict-only writer in `executeAuditRun`. `SYSTEMS-REQUIREMENTS-FILLED.md` §5 says the flag is derived from the verdict and consent. The audit writer sets it from the verdict alone.

A halt still does not decide Engine 2’s “one client, one motion,” and it does not decide the attempt engine’s live-override. Claim 20 does not nullify the attempt. Claim 54 keeps this firing to one sequence and does not add a unique enrollment constraint. Whether the founder kill-switch row can be lifted was not read.

`any_pathway_pass` is still the constant `true`. What a pathway rule would write into `result` remains the derivation claim 12 left open. Until that write exists, the false side has nobody to enroll.

## Founder question

Launch day stays the ask `docs/register/SYSTEMS-GOAL.md` already left open, and it still says not to fill it. The choice is who is placed on `camp.optin.day`: only contacts who were `waitlisted`, or the book that is already in the opt-in sequence. What changes is which contacts an enrollment cursor is allowed to move onto that campaign. Nothing in this pass writes `waitlisted`. An attempt already on class `optin` uses purpose `opt-in` while the cursor sits there. That is claim 45. It is not a decision about who is placed there.

Repeat compression stays the question `docs/register/system-map/BUILD-system-map-v3-templates-and-binding.md` section C already marked named-silent. The choice is whether a later reactivation of a contact who already walked the days-1–3 nurture sends those two emails again, or walks a shorter cell. What changes is the cells that repeat enrollment’s cursor advances through. The first calendar is claim 51. The build said not to invent the repeat.

A `deferred` event’s hold stays open. The choice is whether the next email to that same address waits, and for how long, or whether the row is only a record and the due cell still sends. What changes is whether one temporary delay holds that address’s later mail. `deliv-23` wants the backoff inside a provider window. The payload does not name the receiving server and does not name a retry time, so a full inbox and a transient receiving server are the same event. One delay does not pause the firm. That part is claim 56. Parsing the recipient domain was not chosen, because a custom domain is not the receiving server and one full inbox would then hold every recipient at that domain.

## Next move

Start at the `deferred` hold only if this session’s evidence is being used to answer the founder question above. Otherwise start at `sequence_ready.ready`. The audit writer sets the flag from the verdict alone. `SYSTEMS-REQUIREMENTS-FILLED.md` §5 says the flag is derived from the verdict and consent. Read that writer and the consent row before inventing a third input. Leave the three founder questions recorded. Claims 56 and 57 stand. Do not reopen the complaint window, and do not recut the soft budget.
