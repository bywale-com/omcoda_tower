# Next

## Established

Claims 1–49 stand in `docs/specification-pass/SPECIFICATION.md`. Claims 48 and 49 are the Get’s firm and the one-click silence.

Claim 48: a Get reads the walk’s firm. Contacts `every`, including a missing select, is every `contact_records` row of `ctx.firmId`, and that id list replaces the people, including when it is empty. Select uses `getClass1` only when it is that firm, then all of that firm’s contacts or the named ids that belong. A chip is the class on a select. It is not the result rows, and it does not apply while the select is `every`. Firms, audits, and imports follow the same firm. Agents `every` is the campaigns of sequences bound to the walk’s firm. Reference stays empty. Verdict and ready pointers stay claim 8’s latest row for that contact and that firm. Claim 6’s chain rebuild is still required.

Claim 49: List-Unsubscribe one-click on a `dispatchEmailLive` email is `handleConsentSilence` with source `list-unsubscribe`, for that email’s firm and contact, and it dispatches claim 15’s opt-out. The POST writes only when the binding checks. A send with no contact has no header. Hard bounce stays claim 42. The stand-in map is not the row.

Claim 45 still governs the later opt-in purpose. Claims 41 and 42 still govern the consent map and the status column. Claims 46 and 47 still govern the resumed wait and the schedule tick. The people those claims place are who the walk holds until a Get replaces them.

## Still worth investigating

`handleResendWebhook` maps `email.complained` to `complaint`, inserts `messaging_events`, and does not write `consent_records`. The silence leaf does not name that complaint. Claim 49 did not fold it into `list-unsubscribe`. The external-model note that a complaint takes a quarantine path was not read against this handler.

The day-3 guideline names email and SMS. The seeded cell `ol-d3-waitlist` is one email. The days 4–7 guideline names two emails and one text. The seeded cell is one email at day 4. The day-2 social cell stays channel `form` and still does not send.

The seed branch “Reactivation-worthy?” has no compares. `evalIfPick` returns false, and the edge has no `sourceHandle`, so activating `wf-eligibility-reactivation` enrolls nobody and also suppresses claim 43’s fallback. `any_pathway_pass` is still the constant true. The field chip’s `find`, and what `sequence_ready.ready` is derived from, remain open. `executeAuditRun` sets `ready` from email and phone and does not read `consent_records`.

`campaign_failure` does not store `enrollment_id`. Two enrollments can share a contact and a campaign. `handleContactImport` inserts `ON CONFLICT (id) DO UPDATE` and does not assign `firm_id`. `handleMachineProvision` also writes tables claim 16 leaves off the pointer. `handlePoolAllocate` updates the same `ct_firms` id and does not dispatch.

P1’s remainder is what a halt does to Engine 2’s “one client, one motion,” and to the attempt engine’s live-override. Claim 20 does not nullify the attempt. Claim 2 still allows two enrollments. Claims 43 through 49 did not add a one-motion refusal. Whether the founder kill-switch row can be lifted was not read.

## Founder question

Launch day stays the ask `docs/register/SYSTEMS-GOAL.md` already left open, and it still says not to fill it. The choice is who is placed on `camp.optin.day`: only contacts who were `waitlisted`, or the book that is already in the opt-in sequence. What changes is which contacts an enrollment cursor is allowed to move onto that campaign. Nothing in this pass writes `waitlisted`. An attempt already on class `optin` uses purpose `opt-in` while the cursor sits there. That is claim 45. It is not a decision about who is placed there.

## Next move

Start at `email.complained` in `handleResendWebhook`. The handler records `complaint` and does not write the consent pair. Decide whether that event is the silence commit, a quarantine that is not `consent_records`, or only the `messaging_events` row, and what each choice does to the next send. The one-click path is claim 49. Leave the launch-day audience ask recorded.
