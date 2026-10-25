# Next

## Established

Claims 1–52 stand in `docs/specification-pass/SPECIFICATION.md`. Claim 52 is the active eligibility graph.

Claim 52: when `wf-eligibility-reactivation` is active, the branch “Reactivation-worthy?” passes a contact whose `motion_decisions.motion` on this firing is `reactivation`. The edge to the reactivation agent is `sourceHandle` `true`. There is no false edge. `call_agent` enrolls that contact only when claim 43’s non-opt-in pair would allow the send. A missing basis or a silence does not open the attempt. Opt-in `call_agent` is unchanged. The constant `anyPass` is unchanged. A `nudge` motion is not enrolled by this graph.

Claims 50 and 51 stand. The address deny is still one complaint. The day calendar is still claim 51.

## Still worth investigating

The complaint rate’s window and denominator are still open. `deliv-11` already names the bars: throttle as the rate approaches a target at or under 0.1 percent, quarantine when a ceiling of about 0.3 percent is breached. The cited Google sender page states those bars as Postmaster Tools spam rates and does not state the window or what the rate divides. There is no `reputation_unit` table. `email.delivery_delayed` still only inserts `deferred`. Whether `bounce_hard` should also deny by the address join, beside claim 42’s pair, was not decided.

Nothing on a seeded graph enrolls `tpl.reengagement.v1` when the motion is `nudge`. The template and the `firm-cedar` binding exist. The false handle of this branch has no edge. `any_pathway_pass` is still the constant `true`. What `sequence_ready.ready` is derived from remains the verdict-only writer in `executeAuditRun`.

`campaign_failure` does not store `enrollment_id`. `handleContactImport` inserts `ON CONFLICT (id) DO UPDATE` and does not assign `firm_id`. `handleMachineProvision` also writes tables claim 16 leaves off the pointer. `handlePoolAllocate` updates the same `ct_firms` id and does not dispatch.

P1’s remainder is what a halt does to Engine 2’s “one client, one motion,” and to the attempt engine’s live-override. Claim 20 does not nullify the attempt. Claim 2 still allows two enrollments. Claims 43 through 52 did not add a one-motion refusal. Whether the founder kill-switch row can be lifted was not read.

## Founder question

Launch day stays the ask `docs/register/SYSTEMS-GOAL.md` already left open, and it still says not to fill it. The choice is who is placed on `camp.optin.day`: only contacts who were `waitlisted`, or the book that is already in the opt-in sequence. What changes is which contacts an enrollment cursor is allowed to move onto that campaign. Nothing in this pass writes `waitlisted`. An attempt already on class `optin` uses purpose `opt-in` while the cursor sits there. That is claim 45. It is not a decision about who is placed there.

Repeat compression stays the question `docs/register/system-map/BUILD-system-map-v3-templates-and-binding.md` section C already marked named-silent. The choice is whether a later reactivation of a contact who already walked the days-1–3 nurture sends those two emails again, or walks a shorter cell. What changes is the cells that repeat enrollment’s cursor advances through. The first calendar is claim 51. The build said not to invent the repeat.

## Next move

Start at the complaint-rate window and denominator. The bars are already the 0.1 percent target and the 0.3 percent ceiling in `deliv-11`, and the fetched Google sender page states them as Postmaster rates without a formula. Decide what the rate divides, and over what window, before any quarantine is applied. The “Learn more about spam rates” link on that page was not fetched. Leave both founder questions recorded. If that rate settles, the open enroll for a `nudge` motion is the gap claim 52 left on the false handle.
