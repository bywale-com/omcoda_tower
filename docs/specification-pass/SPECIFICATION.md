# Specification — which execution a result belongs to

This file is the standing specification for the behaviour under investigation. A later session edits it. Claims that were revised stay in the record with the reason.

Investigation: Operator Configuration Libraries, Agents and Automations. The behaviour under test is whether one execution’s result stays distinguishable from another’s, from the moment an agent is pursuing an objective through to a later automation that consumes the result.

Firm isolation is already housed. `workflow.firm_id`, `workflow_run.firm_id`, and `enrollment.firm_id` exist (`supabase/migrations/004_machine_tables.sql`). `dispatchEventToWorkflows` only loads triggers for the firing firm or a platform trigger (`server/wire-service/workflowWalk.ts`). The hole that remains is inside one firm.

---

## Claim 1 — Agents starts a pursuit; Automations hears that something happened

**Standing:** already established by the product.

An agent sequence is a mission started now, for the contacts enrolled on that sequence. It is not waiting on an event. An automation is the other door: on this event, do this operation, and on this kind of result do one thing or another. An objective being met is an event. The goal is an escalation point to another agent, to a workflow, or it ends.

**Evidence:** `docs/README.md` (15:43 flag). `docs/register/AGENTS-FACE.md` law 14. `docs/register/AUTOMATIONS-FACE.md` laws 2, 28, 32. `docs/register/PRIMITIVES.md` (two doors; event “An objective was met”). `docs/register/SYSTEMS-CHANGE-PACKET-022.md` §2.5.

---

## Claim 2 — A contact may be in more than one pursuit at once

**Standing:** necessary implication of what the product already does.

Enroll is per sequence. `enrollAndActuate` always inserts a new `enrollment` row. There is no unique constraint on `(firm_id, contact_id)`. When an objective is met, `advanceEnrollmentCampaign` moves that enrollment’s `campaign_id` to the next campaign, or to NULL if it was the last. It does not close other enrollments. A listener on `objective_met` may call the agent action, which inserts another enrollment while the first is still open.

Packet 022’s detection SQL comments “one open sequence per contact today.” That describes the shortcut in the query. It is not a product limit. The same packet’s escalation is what creates the second enrollment.

**Evidence:** `docs/register/AGENTS-FACE.md` laws 1–2 and 14. `server/wire-service/cascade.ts` `enrollAndActuate` (INSERT, no existing-enrollment refusal). `supabase/migrations/004_machine_tables.sql` `enrollment` (index only). `server/wire-service/campaignHousing.ts` `advanceEnrollmentCampaign`. `docs/register/SYSTEMS-CHANGE-PACKET-022.md` §2.4 and §2.5.

**Rejected alternative:** refuse a second enrollment, or close the first when the second starts. That would restrict the operator to one mission per contact. Nothing in the face or the flagship says the first mission ends when another agent is assigned.

---

## Claim 3 — A completion belongs to the pursuit that asked for it

**Standing:** necessary implication, and a technical decision made in this session.

The completion row, or the send it hangs off, already carries the identity of the pursuit. Matching must use that identity. Matching must not choose the newest open enrollment for the contact and then ask whether that one happens to be satisfied.

A form completion’s identity is `form_ref` of the shape `form.${enrollmentId}.${campaignObjectiveId}` (packet 022 decision 2). A click’s identity is the `outbound_messages` row for that message (`enrollment_id`, `campaign_objective_id`). A meeting’s identity is the `enrollment_id` and `campaign_objective_id` on `meeting_booked`. The enrollment that advances is the one named there, and only if its current `campaign_id` still asks for that objective. After the cursor has moved, the same stamp does not advance it again. That is the latch packet 022 already specified, applied to the correct row.

No stamp means no match. A fact write that arrives with neither `form_ref` nor `campaign_objective_id` does not complete an objective. The matcher must not invent a stamp from the newest enrollment.

**Why this and not the other approach that was considered.** The other approach is the code: `ORDER BY enrolled_at DESC LIMIT 1`, then test that enrollment’s objective. It is what packet 022 §2.4 wrote down, with the comment that only one sequence is open. Claim 2 makes that comment false as soon as escalation works. Under two open enrollments the newest-enrollment pick is a false negative: the stamped completion does not match the other pursuit, and the pursuit that asked is never considered. `resolveFormStamp`, called with only firm and contact, is the false positive: it writes the newest pursuit’s objective onto a bare fact, so a write that was not asked for completes that pursuit.

The false-negative sentence is the case where the two pursuits do not share an objective id. Walking the click found a second case, recorded under “Locked against the send”: the same objective id advances the newer enrollment and still leaves the stamped one unadvanced on the click. The rule in the standing text did not change.

**Evidence of the product rule:** `docs/register/SYSTEMS-CHANGE-PACKET-022.md` §2.2 (“No stamp → no match”; fallback is `enrollment_id` plus time, never a bare contact), §2.3 (the latch is `enrollment.campaign_id`), §2.6 decision 2 (`form_ref`).

**Evidence that the code does not do it:**

- `onCompletionWrite` selects the newest enrollment with a campaign (`campaignHousing.ts`).
- `objectiveSatisfiedBy` for `fact_writebacks` matches `campaign_objective_id` only. It does not read `form_ref`.
- `resolveFormStamp` fills objective and `form_ref` from that same newest enrollment when the caller did not pass them.
- `handleContactSeatFacts` calls `resolveFormStamp` with firm and contact only (`contactSeat.ts`). The access link’s `enrollment_id` is not passed.
- `handleMeetingBook` stamps `meeting_booked` from the newest enrollment (`machine.ts`).
- The click webhook reads `firm_id, contact_id` from `outbound_messages` and does not read `enrollment_id` or `campaign_objective_id`, then calls `onCompletionWrite` (`webhooks.ts`). The send row has those columns (`supabase/migrations/021_objective_local_axis.sql`). `objectiveSatisfiedBy` can see them only after the newest enrollment has already been chosen.

### Locked against the send

The identity sentence stands. A live sequence send writes it. The click does not use it to choose the enrollment, so enrollment A does not advance on the click.

`actuateChannelSend` does not insert the row. It passes `enrollmentId`, `campaignId`, `campaignObjectiveId`, and `attemptId` into `dispatchEmail` or `dispatchSms` (`cascade.ts`). Those two return a dry-run result before any insert when `shouldLiveSend` is false (`dispatchSend.ts`, `sendMode.ts`). `SEND_MODE` defaults to dry-run, and a live send also requires the contact in `SEND_TEST_COHORT`. A dry-run leaves no `outbound_messages` row and no Resend id to click.

`dispatchEmailLive` and `dispatchSmsLive` insert `enrollment_id`, `campaign_id`, `campaign_objective_id`, and `attempt_id`. The sequence callers fill them. `enrollAndActuate` passes the new enrollment id, `firstCampaignId`, and `campaignObjectiveIdForCampaign` of that campaign. The tick’s channel send, `advanceTemplateCellIfDue`, and the wait-until send pass `pursuitStampForEnrollment`, which reads that enrollment’s `campaign_id` and the objective id for that campaign. `handleCemSend` and `handleSmsSend` pass no stamp. Those are the outside-a-sequence rows packet 022 already excluded from completion.

A click that reaches `onCompletionWrite` is `handleResendWebhook` on `email.clicked`. The lookup key is the code’s own: the live email insert stores Resend `data.id` as `provider_message_id`, and the webhook selects by `event.data.email_id`. The walked message M has `enrollment_id = A`, `campaign_objective_id = ObjA`, and `provider_message_id = P`. Enrollment B has a later `enrolled_at` and `campaign_id` still set, which is the row `onCompletionWrite` will take.

The webhook selects `firm_id, contact_id` only, inserts `messaging_events` with `message_id = P` and `event_class = 'clicked'`, and calls `onCompletionWrite` with firm, contact, table `messaging_events`, and the new event id. The stamp is not in that call. The event id is written onto the engagement payload only after a match. The match does not filter to that event id.

`onCompletionWrite` then selects B. It loads B’s objective. When that objective’s `completion_table` is not `messaging_events`, it returns. When it is, `objectiveSatisfiedBy` runs the click query, which does read `outbound_messages.campaign_objective_id` and `enrollment_id`, as predicates on B. M satisfies those predicates only when B’s objective id equals ObjA, or when M’s objective id is null and M’s `enrollment_id` is B and the row is at least as new as B’s `enrolled_at`. A stamped message takes the first arm. Different objective ids miss, and the function returns. Equal objective ids match, and the function calls `advanceEnrollmentCampaign` with B.

A is not loaded on this path. The click does not advance A.

`campaign_objective` is `UNIQUE (campaign_id)` (`supabase/migrations/010_sequence_campaign_housing.sql`). `enrollAndActuate` can insert a second enrollment on the same first campaign, so equal objective ids are a real pair, not a hypothetical. The earlier false-negative sentence (the stamp does not match B, and A is never considered) is the different-objective case, including B’s objective living on another completion table. It was re-walked and it holds. The equal-id case is the same SQL: A still fails on the click, and B advances.

The tick is a separate door, and it is why “A fails on the click” is not “A can never advance.” `tickOnce` calls `advanceEnrollmentCampaign` with the attempt’s `enrollment_id` while `active_attempts.status` is `open` (`cascade.ts`). That load is by id. The same click query then sees A’s stamp, so a later tick can advance A while that attempt remains open. Packet 022 §2.4 already made the tick the catch-up and the write the path that remains after spending stops. Once A’s attempt is not `open`, the tick no longer loads A, and the click has not advanced A either.

The preferred arm of that query is `campaign_objective_id = $3` alone. `enrollment_id` is consulted only when `campaign_objective_id` is null. So a tick that still finds B on the same campaign also matches M, and B advances from A’s send. The standing rule already names the enrollment on the row. Objective id alone does not name it.

**How that rule is met.** Change the click entry so it loads M and calls the advance for M’s `enrollment_id`, and change the click predicate so a stamped row matches enrollment E only when `enrollment_id = E` and `campaign_objective_id` is E’s current objective. Packet 022’s fallback stays for a null objective id: `enrollment_id = E` and `created_at >= E.enrolled_at`.

Changing only `onCompletionWrite`’s select, and leaving the predicate, was considered and rejected. The webhook would advance A. The tick would still advance every open enrollment that shares the objective id. Refusing the second enrollment was already rejected under claim 2.

No SMS handler calls `onCompletionWrite`. This lock is the email click. The form path and the meeting path were not re-walked.

---

## Claim 4 — Opening an ask does not move the cursor

**Standing:** technical decision made in this session.

`enrollment.campaign_id` moves in `advanceEnrollmentCampaign`, when the stamped objective of that enrollment is satisfied, and only then. It is the latch (packet 022 §2.3).

`handleContactSeatGet` treats a `campaignId` query as `UPDATE enrollment SET campaign_id` on the newest enrollment. The contact workspace “Open in Now” calls that load (`src/app/register/prototype-ant/contact/ContactWorkspace.tsx`, `src/app/wire/reals/machineApi.ts` `loadContactWorkspace`). The operator action is to display an ask. The write retargets whichever pursuit is newest. Those two contracts cannot work together.

**Rejected alternative:** treat “Open in Now” as an operator override of the pursuit. The face does not describe a control that retargets a sequence. The button sits on a history row whose job is to show the ask.

**Evidence:** `server/wire-service/contactSeat.ts` `handleContactSeatGet`. `docs/register/SYSTEMS-CHANGE-PACKET-022.md` §2.3.

---

## Claim 5 — Inside one walk, the handle is the writes of that invocation

**Standing:** already established in the code. This revises an earlier reading of the documents.

`WalkContext` keeps `previousWrites` (last node) and `chainWrites` (every completed node, keyed by node id). A later node picks with `mappedWrites` / `fromNodeId`. The pointer is `{ table, id, contact_id }` (`server/wire-service/runWrites.ts`). The rows stay in the module tables. `workflow_run.id` is the run.

`docs/register/SYSTEMS-AUTOMATIONS-NODE-OUTPUT.md` says the walker does not pass module output to the next node. That was true when the packet was written. It is not true of the walker as it stands for a single invocation that does not park.

**Evidence:** `server/wire-service/workflowWalk.ts` `WalkContext`, `commitWrites`, `mappedWrites`. `docs/register/PRIMITIVES.md` (“every write that run made”; not the whole database; not “latest audit for this firm”). `docs/register/AUTOMATIONS-FACE.md` law 33.

### Revision

Earlier in this session claim 5 was read off `SYSTEMS-AUTOMATIONS-NODE-OUTPUT.md`: the live walker had no handle, so the investigation was going to re-specify the handle from scratch. Reading `workflowWalk.ts` showed the in-memory handle. The gap moved to the boundaries in claims 6–8. The node-output document remains the product statement of the handle. It is not a description of the current walker.

---

## Claim 6 — A parked run must come back as the same run

**Standing:** necessary implication, and a technical decision made in this session.

A Wait parks the walk. The process memory, including `chainWrites`, is gone. The pointers are already stored on `workflow_run.node_status[nodeId].writes` when the run is saved. Resume must rebuild `chainWrites` from that object for this `workflow_run.id` before it walks the outgoing edges. `previousWrites` for the resumed node are that node’s own writes.

What the code does instead: `resumeDueWaitingRuns` passes occupancy rows, or `counts.waitWrites`, into a new walk whose `chainWrites` starts empty. A chip that names an earlier node falls through to those wait writes. That is a different set.

**Rejected alternatives:**

- A new table of run writes. The pointers are already on `node_status`. The primitive keeps the rows in the module. Another table would be a second copy of the handle.
- Forwarding only the wait’s writes. That is the current resume, and it drops every earlier node. Packet 017’s reason for `chainWrites` is that a later node may name an earlier node, not only the last one.

**Evidence:** `workflowWalk.ts` `walkValidatedWorkflow` (park UPDATE; `resumeFromNodeId` path), `resumeWaitRun`, `resumeDueWaitingRuns`. `supabase/migrations/024_wait_occupancy.sql` (`waiting_node_id`, `resume_at`). `NodeRunStatus.writes`.

---

## Claim 7 — A listening run starts from this firing’s rows, not from an empty handle and not from “latest”

**Standing:** technical decision made in this session.

Hearing `objective_met` creates a new `workflow_run`. That is the other door (claim 1). Its trigger handle is the write-set packet 022 registered: the `engagement_records` row just inserted, and the `enrollment` row. Both as pointers of this firing.

The engagement append is the fact that was met (`campaignId` of the campaign that cleared, `completionId`, `nextCampaignId`). The enrollment row is a different fact: `advanceEnrollmentCampaign` flips `campaign_id` before the dispatch, so a reader of the enrollment sees the next campaign, or NULL. The listener must not treat the enrollment row as a substitute for the engagement row.

The engagement id is generated (`eng-${randomUUID()}`) and is not put on the dispatch payload. `writesFromPayload` only builds pointers from `payload.writes`, an import batch id, or `contact_ids` / `contactIds`. The objective payload carries `contact_id` singular and no `writes`, so `previousWrites` is empty. `contactIds` is passed separately and becomes `ctx.contactIds`, which is the person, not the handle.

`dispatchEventToWorkflows` also sets `anyPass: true` on every event. `evalBranch` treats `eligibilityPass === true` as the true branch. A legacy branch therefore passes without reading this firing. The If node does not use that flag; it reads writes, which are empty, so it fails closed for lack of a row rather than because it saw this firing. Do not set `anyPass` on an event dispatch. Absence of a write is not a pass.

`loadWriteRow` returns null for `engagement_records`, `fact_writebacks`, `meeting_booked`, and `wait_occupancy`. A pointer the reader cannot load is not a handle. Any table that appears on a handle must be loaded by that pointer’s id.

**Rejected alternatives:**

- Let the listener query the latest `objective_met` engagement for the contact. Two firings close together, or two pursuits, cross.
- Keep the ids only on `triggerPayload` and let the If read the payload. The established pick is a write pointer (`mappedWrites`, `loadWriteField`). A second channel would split the handle.

**Evidence:** `supabase/migrations/021_objective_local_axis.sql` (`event_write_set` for `objective_met`). `campaignHousing.ts` `advanceEnrollmentCampaign` (flip, then insert engagement, then dispatch without the engagement id). `runWrites.ts` `writesFromPayload`. `workflowWalk.ts` `dispatchEventToWorkflows`, `evalBranch`, `loadWriteRow`. `docs/register/PRIMITIVES.md` (the handle is not a substitute for the event, and the event is not a substitute for the handle).

---

## Claim 8 — A row that later executions overwrite cannot be “what this run wrote”

**Standing:** necessary implication, and a technical decision made in this session.

`reachability_verdicts` and `sequence_ready` are keyed by `(contact_id, firm_id)`. Audit upserts them (`server/wire-service/auditRun.ts`). The handle records `id: contact.id`. `loadWriteRow` ignores that id and selects by contact and firm with no order. A later audit replaces the verdict and the ready flag. An If that runs after a Wait, or a later node that re-reads, sees the other execution.

The primitive forbids both a shadow copy in the walker and “latest for this firm.” The remaining housing is a row the module owns that later audits do not overwrite: the per-person result belongs to the `audit_runs` id that produced it. The desk’s current verdict, and the enroll gate that asks who is ready now (`machine.ts`, `SELECT contact_id FROM sequence_ready WHERE firm_id=$1 AND ready=true`), read the latest row per contact. That query is a view of the same facts, not a second stored fact.

`audit_runs` itself is already one row per run. This claim is about the per-person results, not about the run header.

**Rejected alternative:** copy the verdict onto the pointer at commit time so the If does not re-read. `PRIMITIVES.md` and `SYSTEMS-AUTOMATIONS-NODE-OUTPUT.md` forbid an automation-owned copy that replaces the module’s row. The live reader re-reads the table (`loadWriteField`), so a snapshot on the pointer would also be a second mechanism.

**Evidence:** `supabase/migrations/004_machine_tables.sql` (primary keys). `server/wire-service/auditRun.ts` (upsert). `workflowWalk.ts` `loadWriteRow`. `docs/register/PRIMITIVES.md`. `docs/register/SYSTEMS-AUTOMATIONS-NODE-OUTPUT.md` (this node’s run, not the latest audit).

### Readers confirmed

An earlier sentence of this claim put four readers in one basket: they mean “current,” and once the grain changes they follow the latest row. The queries were read. The basket splits. The grain was not changed.

**Who is ready now, and the current verdict.** No run id. After the grain change, the latest row per contact.

- `handleContactRecordsList` left-joins `reachability_verdicts` and `sequence_ready` on `contact_id` and `firm_id` (`machine.ts`).
- `handleOnboardingFire` selects `contact_id FROM sequence_ready WHERE firm_id=$1 AND ready=true` and enrolls those contacts.
- `executeGet`, when the module is `contacts`, selects both tables by `contact_id` and adds the pointers to the Get’s writes (`workflowWalk.ts`). The query does not constrain `firm_id`. That was seen and left alone. It is not the grain question.

**The run in the URL.** `handleAuditRunGet` loads `audit_runs` by the path id, then verdicts with `rv.firm_id` and `details->>'auditRunId'` equal to that id. The `ready` value on the same response is `sequence_ready` joined only on contact and firm. `auditRun.ts` writes `details` as `{ auditRunId, rationale }` and upserts on `(contact_id, firm_id)`, so a later audit replaces the id and this page loses the contact. The ready join has nothing to name a run. This reader sits in `machine.ts` beside the two that were listed. It asks what that run wrote. The latest row per contact would answer the desk’s question on a past run’s page.

**The live specimen of the newest run.** `eventTest.ts` `door1`, for `audit.completed`, takes `audit_runs` where `status='complete'` ordered by `started_at` descending, limit 1, then verdicts whose `details.auditRunId` is that id, then `sequence_ready` for those contacts with no run predicate. The file calls door 1 the live instance. After the grain change this door reads that newest run’s own rows. It is not the enroll gate.

`loadWriteRow` stays the handle re-read already stated above. It was not reclassified.

---

## Claim 9 — A meeting response stops chasing for the contact

**Standing:** already established by the product. Recorded so a later session does not “fix” it into per-enrollment scope while applying claim 3.

Booking a meeting nullifies remaining `active_attempts` in status `open` for that firm and contact. Packet 023 names that status: they responded, stop chasing, this is a win. It is not exhaustion, and it is not the escrow-era refusal. `onCompletionWrite` may already have set the matched enrollment’s attempts to `met`; the meeting handler then nullifies whatever is still open. Detection of objective-met does not depend on the attempt still being open (packet 022 and 023).

Claim 3 still applies to which enrollment the meeting row is stamped with. The spending stop is a separate, already-specified contact-wide consequence of a meeting. This session does not reopen it.

**Evidence:** `server/wire-service/machine.ts` `handleMeetingBook`. `server/wire-service/contactSeat.ts` `handleContactSeatMeeting`. `docs/register/SYSTEMS-CHANGE-PACKET-023.md` §3.4.

---

## What has no home, what cannot fulfill, what cannot work together

**No home**

- The id of the `objective_met` engagement row on the dispatch that starts the listening run (claim 7). The insert allocates it and drops it. This is a missing field on an existing payload, not a new table.
- A per-audit-run home for a contact’s verdict and sequence-ready flag (claim 8). The current primary keys cannot hold two runs.

**Exists but cannot fulfill the responsibility**

- `enrollment` as the thing a listener reads to learn which objective was met (claim 7). After the flip it answers a different question.
- `reachability_verdicts` and `sequence_ready` as the handle of a particular audit (claim 8).
- `reachability_verdicts.details.auditRunId` as the way `handleAuditRunGet` names a run (claim 8). The next audit overwrites `details`.
- `loadWriteRow` as the reader of the handle (claim 7). Several tables the product already puts on a handle come back as null.
- `resolveFormStamp` and `onCompletionWrite` as the attribution of a completion (claim 3). They answer “newest pursuit for this person.” The live send does persist the click’s stamp. The click path does not read it back as the enrollment to advance.

**Individually reasonable, cannot work together**

- Packet 022 §2.4’s newest-enrollment detection, and packet 022 §2.5’s escalation, which inserts a second enrollment (claims 2 and 3).
- `event_write_set` naming `engagement_records` for `objective_met`, and `loadWriteRow` not loading that table (claim 7).
- `chainWrites` for every node (the in-memory walker), and resume forwarding only the wait’s writes (claim 6).
- The cursor as a once-only latch (packet 022 §2.3), and “Open in Now” writing `campaign_id` (claim 4).
- Re-reading the module’s row (the primitive), and upserting that row on the next audit (claim 8).
- `handleAuditRunGet` filtering verdicts by `details.auditRunId`, and `auditRun.ts` replacing `details` on the next audit (claim 8).
- A click predicate that treats `campaign_objective_id` as enough, and two enrollments on one campaign sharing that id (claims 2 and 3). The tick then advances both while both attempts are open.

---

## Distinct work, not this investigation

**Queryable lineage.** Automations face law 29: who created the objective, the path, the completion, the time. The `objective_met` engagement append is one fact that query would read. Building the query is a separate capability.

**Failure.** Packet 023: exhaustion stops spending and keeps listening. Claim 9 records only the meeting nullify, so it is not mistaken for a hole in attribution. The failure event’s own handle has the same shape as claim 7 and was not walked.

**Form authoring.** Whether the form is its own graph node or embedded in the agent action is still open on `AUTOMATIONS-FACE.md`. Attribution assumes the derived `form_ref` once a form exists. It does not decide where the form is authored.
