# Next

## Established

Claims 1–67 stand in `docs/specification-pass/SPECIFICATION.md`. Claim 66 is the qualify arm: when `advanceEnrollmentCampaign` flips to a non-null next campaign, it still sets the attempts that were `open` to `met`, then inserts one new `open` attempt on that same enrollment. Launch day’s first step is the sign-up email, a cell on `tpl.optin_launch.v1` marked `campaignOrd` 1 so the day walker does not index it. The null flip inserts nothing. Claim 67 is the confirmation email on that form completion. It stamps the campaign that just cleared, and it does not leave an attempt `open`.

Claim 64’s `met` on every flip stands. Claim 65’s withhold on `status='open'` stands. After the window flip the new row is `open`, so the withhold applies during launch day. After the launch-day form, nothing is left `open` by these two claims.

Claim 60 stands. The column is the OR of this evaluation’s enabled pathway entries. The per-family `pass` is still the founder question below. The live insert is still the constant `true`.

## Still worth investigating

The sign-up email is now a send. Nothing in this session traced the address inside that email, or which route the contact opens. Start there. Read the outbound body and the seat URL the product already builds, and specify the address from those. Claims 28 and 29 stay the gate on `obj.optin.day`’s form. They already treated that objective as the form they withhold while `basis` is `none`.

D-01 and D-02 stay Seed §5.8’s open decisions: where pre-meeting capture sits, and which module is the in-meeting fallback. Claim 63 does not place them.

## Founder question

Launch day stays the ask `docs/register/SYSTEMS-GOAL.md` already left open, and it still says not to fill it. The choice is who is placed on `camp.optin.day`: only contacts who were `waitlisted`, or the book that is already in the opt-in sequence. What changes is which contacts an enrollment cursor is allowed to move onto that campaign. Nothing in this pass writes `waitlisted`. Claim 66 arms the enrollment whose cursor the flip already moved. It does not choose the audience. An attempt already on class `optin` uses purpose `opt-in`. That is claim 45. It is not a decision about who is placed there.

Repeat compression stays the question `docs/register/system-map/BUILD-system-map-v3-templates-and-binding.md` section C already marked named-silent. The choice is whether a later reactivation of a contact who already walked the days-1–3 nurture sends those two emails again, or walks a shorter cell. What changes is the cells that repeat enrollment’s cursor advances through. The first calendar is claim 51. The build said not to invent the repeat. Claim 65 allows a later enroll after the attempt is `met`, `exhausted`, or `nullified`, and that enroll walks the sequence’s own cells. It does not choose a shorter cell.

A `deferred` event’s hold stays open. The choice is whether the next email to that same address waits, and for how long, or whether the row is only a record and the due cell still sends. What changes is whether one temporary delay holds that address’s later mail. `deliv-23` wants the backoff inside a provider window. The payload does not name the receiving server and does not name a retry time, so a full inbox and a transient receiving server are the same event. One delay does not pause the firm. That part is claim 56. Parsing the recipient domain was not chosen, because a custom domain is not the receiving server and one full inbox would then hold every recipient at that domain.

What makes one enabled family’s `pass` true stays open. The choice is which encoder fills it. The client pack’s current assertion would store `reactivation` whenever CEC or FSW clears the constants already in `pack.immigration.criteria` (hours, CLB, TEER), including on a later cascade that sees the same assertion, and would store `nudge` when neither family clears. The SME note in `docs/sme/pass2/01-immigration-pathway-eligibility.md` elig-04 would store `reactivation` only for a material change — a minimum newly met, a cutoff newly crossed, a nomination or offer or certificate newly held, or a time-critical ops loss — and would keep a stable pass and a pure missing self-reportable off that motion. The seed clauses are null. Treating that emptiness as “no assertion” would store `nudge` for every contact. Treating `epath-any.enabled` as the pass would store `reactivation` for every contact, which is the live constant claim 60 refuses. What changes is who claim 52 enrolls and who claim 54 enrolls. Seed §5.7 settles the OR. Seed §5.8 names the worthy predicate a silence. The pack, the SME note, and the empty clauses are three fillings, and the motion expression does not take a second flag. Claim 61 does not fill it from a missing fact. Claim 63 does not paint pathway failures onto the brief in order to avoid asking. Claim 65 does not fill it either: the withhold reads the attempt, not the family’s `pass`. Claims 66 and 67 do not fill it either.

## Next move

Start at the sign-up email’s address. Claim 66 sends `ld-signup-email` with the pursuit stamp of `camp.optin.day`. Read where that message’s link is built, and which seat route it opens, before specifying either. Leave the four founder questions recorded. Claims 66 and 67 stand.
