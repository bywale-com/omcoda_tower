# Next

## Established

Claims 1–51 stand in `docs/specification-pass/SPECIFICATION.md`. Claims 50 and 51 are the spam complaint and the day calendar the seed had compressed.

Claim 50: `email.complained` inserts `messaging_events` with class `complaint`. When that `message_id` matches an `outbound_messages` row, the next `dispatchEmailLive` to the same `to_addr` is denied in every firm, after consent and halt have allowed it. The detail is `suppressed`. The event does not write `consent_records`, does not dispatch the opt-out, and does not quarantine the firm. One complaint is not the rate ceiling. SMS and the auth OTP mailer are not this address. The attempt stays open. Claims 43 and 44 still enroll from the pair. Claim 49 stays the one-click. Claim 42 stays the hard bounce.

Claim 51: days 4–7 of `tpl.optin_launch.v1` are an email on day 4, an email on day 5, and a text on day 6. `ol-d3-waitlist` stays one email. `ol-d2-social` stays channel `form` and does not send. The first reactivation calendar is two nurture emails, on day 1 and day 2, then a day-3 email and a day-3 text for the slot. Claim 45’s offset applies. A repeat reactivation is not compressed by that claim.

Claim 45 still governs the later opt-in purpose. The people claims 46 and 47 place are who the walk holds until a Get replaces them.

## Still worth investigating

The complaint-rate ceiling was not specified. `deliv-11` quarantines or throttles a reputation unit when the rate approaches about 0.3 percent. The handler does not count, and claim 50 does not. The window and the denominator are the open part of that path. `email.delivery_delayed` maps to `deferred` and only inserts the event. Whether `bounce_hard` should also deny by the address join, beside claim 42’s pair, was not decided.

The seed branch “Reactivation-worthy?” has no compares. `evalIfPick` returns false, and the edge has no `sourceHandle`, so activating `wf-eligibility-reactivation` enrolls nobody and also suppresses claim 43’s fallback. `any_pathway_pass` is still the constant true. The field chip’s `find`, and what `sequence_ready.ready` is derived from, remain open. `executeAuditRun` sets `ready` from email and phone and does not read `consent_records`.

`campaign_failure` does not store `enrollment_id`. Two enrollments can share a contact and a campaign. `handleContactImport` inserts `ON CONFLICT (id) DO UPDATE` and does not assign `firm_id`. `handleMachineProvision` also writes tables claim 16 leaves off the pointer. `handlePoolAllocate` updates the same `ct_firms` id and does not dispatch.

P1’s remainder is what a halt does to Engine 2’s “one client, one motion,” and to the attempt engine’s live-override. Claim 20 does not nullify the attempt. Claim 2 still allows two enrollments. Claims 43 through 51 did not add a one-motion refusal. Whether the founder kill-switch row can be lifted was not read.

## Founder question

Launch day stays the ask `docs/register/SYSTEMS-GOAL.md` already left open, and it still says not to fill it. The choice is who is placed on `camp.optin.day`: only contacts who were `waitlisted`, or the book that is already in the opt-in sequence. What changes is which contacts an enrollment cursor is allowed to move onto that campaign. Nothing in this pass writes `waitlisted`. An attempt already on class `optin` uses purpose `opt-in` while the cursor sits there. That is claim 45. It is not a decision about who is placed there.

Repeat compression stays the question `docs/register/system-map/BUILD-system-map-v3-templates-and-binding.md` section C already marked named-silent. The choice is whether a later reactivation of a contact who already walked the days-1–3 nurture sends those two emails again, or walks a shorter cell. What changes is the cells that repeat enrollment’s cursor advances through. The first calendar is claim 51. The build said not to invent the repeat.

## Next move

Start at the “Reactivation-worthy?” branch on `wf-eligibility-reactivation`. The compares are empty, `evalIfPick` returns false, and the edge has no `sourceHandle`, so the action does not run. Activating that graph stops claim 43’s fallback and enrolls nobody. Decide what that branch compares, and what an active graph then enrolls. Leave both founder questions recorded. The complaint-rate window is the other open end of claim 50, if that branch settles first.
