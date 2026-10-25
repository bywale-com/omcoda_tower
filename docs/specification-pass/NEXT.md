# Next

## Established

Claims 1–70 stand in `docs/specification-pass/SPECIFICATION.md`. Claim 70 is the day-3 waitlist email. It sends only while the window attempt is open, stamped with `camp.optin.window` and `obj.optin.window`. A live send appends the contact seat for that enrollment. The seat has no join control: a click objective is the empty Now, or the consent ask when claims 28 and 29 already require it. The launch-day form is not that page. The email click is “Click this link”, the same completion as a click on any other window email, and it qualifies under claims 64 and 66. An earlier click means this email does not send. Open is not the click. A text open is not the click. The click does not write `waitlisted` or `cohort_tiers`.

Claims 68 and 69 still govern the sign-up address and the empty launch-day submit. Claim 51’s day list is unchanged.

## Still worth investigating

When the window attempt’s `cellIndex` is already the last day cell, `advanceTemplateCellIfDue` returns without a send, and `tickOnce` still evaluates the attempt ladder on that open row. Read `escalateAttemptWindow` against that row before deciding whether those later sends are part of campaign A or the day calendar is the whole of the window’s outreach. `docs/register/SYSTEMS-GOAL.md` says a mini-goal miss continues the campaign, and that class failure is after both campaigns. Those sentences were not applied to this return.

D-01 and D-02 stay Seed §5.8’s open decisions: where pre-meeting capture sits, and which module is the in-meeting fallback. Claim 70 does not place them.

## Founder question

Launch day stays the ask `docs/register/SYSTEMS-GOAL.md` already left open, and it still says not to fill it. The choice is who is placed on `camp.optin.day`: only contacts who were `waitlisted`, or the book that is already in the opt-in sequence. What changes is which contacts an enrollment cursor is allowed to move onto that campaign. Nothing in this pass writes `waitlisted`. Claim 66 arms the enrollment whose cursor the flip already moved. It does not choose the audience. Claim 70’s click is that flip when the message is a window email. It does not choose the audience either, and it does not store the status the fork would read.

Repeat compression stays the question `docs/register/system-map/BUILD-system-map-v3-templates-and-binding.md` section C already marked named-silent. The choice is whether a later reactivation of a contact who already walked the days-1–3 nurture sends those two emails again, or walks a shorter cell. What changes is the cells that repeat enrollment’s cursor advances through. The first calendar is claim 51. The build said not to invent the repeat. Claim 65 allows a later enroll after the attempt is `met`, `exhausted`, or `nullified`, and that enroll walks the sequence’s own cells. It does not choose a shorter cell.

A `deferred` event’s hold stays open. The choice is whether the next email to that same address waits, and for how long, or whether the row is only a record and the due cell still sends. What changes is whether one temporary delay holds that address’s later mail. `deliv-23` wants the backoff inside a provider window. The payload does not name the receiving server and does not name a retry time, so a full inbox and a transient receiving server are the same event. One delay does not pause the firm. That part is claim 56. Parsing the recipient domain was not chosen, because a custom domain is not the receiving server and one full inbox would then hold every recipient at that domain.

What makes one enabled family’s `pass` true stays open. The choice is which encoder fills it. The client pack’s current assertion would store `reactivation` whenever CEC or FSW clears the constants already in `pack.immigration.criteria` (hours, CLB, TEER), including on a later cascade that sees the same assertion, and would store `nudge` when neither family clears. The SME note in `docs/sme/pass2/01-immigration-pathway-eligibility.md` elig-04 would store `reactivation` only for a material change — a minimum newly met, a cutoff newly crossed, a nomination or offer or certificate newly held, or a time-critical ops loss — and would keep a stable pass and a pure missing self-reportable off that motion. The seed clauses are null. Treating that emptiness as “no assertion” would store `nudge` for every contact. Treating `epath-any.enabled` as the pass would store `reactivation` for every contact, which is the live constant claim 60 refuses. What changes is who claim 52 enrolls and who claim 54 enrolls. Seed §5.7 settles the OR. Seed §5.8 names the worthy predicate a silence. The pack, the SME note, and the empty clauses are three fillings, and the motion expression does not take a second flag. Claim 61 does not fill it from a missing fact. Claim 63 does not paint pathway failures onto the brief in order to avoid asking. Claim 65 does not fill it either: the withhold reads the attempt, not the family’s `pass`. Claims 66 through 70 do not fill it either.

## Next move

Start at the window attempt whose cell cursor is already on the last day cell. Claim 70 settled the day-3 address and the click. Read what `tickOnce` still does with that open row, and apply the campaign-continues sentence and the class-failure sentence before specifying either. Leave the four founder questions recorded. Claim 70 stands.
