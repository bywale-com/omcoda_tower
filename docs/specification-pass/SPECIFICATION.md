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

### Revision — the four null tables

The sentence that `loadWriteRow` returns null for `engagement_records`, `fact_writebacks`, `meeting_booked`, and `wait_occupancy` stands. It is what the function does. Claim 10 says how that function loads a pointer it is given, and how the generic action’s pointer has to carry the id `writeEngagement` already returns. The listening run’s empty handle, the enrollment row as a substitute, and `anyPass` are unchanged.

### Revision — where the firing places the pointer

The sentences above describe the live `objective_met` dispatch: no `writes`, no engagement id, `previousWrites` empty. Claim 11 specifies the array that firing places, and the same array on the fact and meeting dispatches. It does not change the refusal of a second channel, the refusal of “latest”, the two-row objective write-set, or `anyPass`.

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

### Revision — the key

The paragraphs above stand, including the rejection of a copy on the pointer and the rejection of `details.auditRunId` as the name of the run. They said the per-person result belongs to the `audit_runs` id, and that “who is ready now” is a read of the latest row per contact. They did not say which columns keep two runs apart, what the pointer’s `id` is, or which row is latest when a later audit does not mention that contact. This session does. The verdict values are not retuned. `auditRun.ts` still classifies reachable / partial / unreachable from email and phone, and `ready` is still true for reachable or partial. The file header says the walker calls this module and must not recode that grain. The commit that added the header is the walker calling the real Audit module rather than a second verdict. It is not a specification of the primary key. `contact_records` in the same loop stays one row per contact, upserted. This key is only the two result tables.

**The key.** On `reachability_verdicts` and on `sequence_ready`, one row is one contact in one audit run. The primary key is `(audit_run_id, contact_id)`. `audit_run_id` is `audit_runs.id` of the run that wrote the row. `firm_id` stays a required column, set from that run’s firm. It is not what separates two runs. `(contact_id, firm_id)` is no longer unique. A later audit inserts a new row. It does not update the earlier run’s row. `details` on the verdict keeps the rationale (`noteFromVerdict` reads `details.rationale`). `details.auditRunId` is not the key, and `sequence_ready` has no `details` column. Readers name the run with the column.

There is no column named `id` on these tables. `RunWrite` is `{ table, id, contact_id }`. For these two tables the pointer’s `id` is the `audit_run_id` and `contact_id` is the person. Both are required. `loadWriteRow` loads that pair for the walk’s firm. It does not select by contact and firm and take an arbitrary row, and it does not apply “latest”.

**Who is ready now** is the latest row of that same table for `(firm_id, contact_id)`, not a second stored flag, and not the firm’s newest `audit_runs` header. Latest means the greatest `updated_at`. When two rows share that timestamp, the row whose `audit_runs.started_at` is later wins. A contact with no row is not ready, and the verdict is null. A contact a later audit does not mention keeps the earlier row, which is still the latest. The writer today only upserts contacts in the loop, and the enroll query does not join the newest run header. That omission is the behaviour the latest-per-contact read keeps. The desk and the enroll gate do not wait for `status = 'complete'`. Rows are inserted before the run is marked complete, and the current upsert is already visible then.

How each named reader follows that key:

- `handleContactRecordsList` shows one verdict and one ready flag per contact: the latest row of each table for that contact and firm. Both list scopes. Packet 018 (`origin/pr-86:docs/register/SYSTEMS-CHANGE-PACKET-018.md`) already said the verdict is the latest if several exist, and that sequence-ready is the current row. Once several ready rows exist, “current” is that same latest read. A join on `(contact_id, firm_id)` alone would repeat the contact.
- `handleOnboardingFire` enrolls a contact when that contact’s latest `sequence_ready` row for the firm has `ready` true. A historical `ready = true` that is not the latest does not enroll them. The contact is included once.
- `executeGet`, module `contacts`, emits a pointer only to that latest verdict row and that latest ready row. The pointer’s `id` is that row’s `audit_run_id`, and `contact_id` is the person. No row means omit, which the audit-field ascribe already said (`origin/pr-86:docs/register/SYSTEMS-AUDIT-FIELD-ASCRIBE.md` §B). The select still does not constrain `firm_id`. That was left alone. It is not this key.
- `handleAuditRunGet` loads verdicts and ready rows whose `audit_run_id` is the id on the path and whose `firm_id` is the session firm. Ready joins on `audit_run_id` and `contact_id`. It is not the contact’s current flag. It does not read `details->>'auditRunId'`. Book readiness paints this response (`BookReadinessModule` calls `getAuditRun` for the selected run). The create handler’s immediate `verdicts` array is the in-memory result of the run just finished. The page’s later load is this re-read.
- `eventTest.ts` `door1` for `audit.completed` still takes the newest `audit_runs` row with `status = 'complete'` for the firm (`started_at` descending, limit 1). It then reads both person tables for that `audit_run_id`. The ready query is not “those contacts, whatever is ready now”. Each emitted write uses `id` = that run id and `contact_id` = the person, the same pointer as the walker.
- `loadWriteRow` is the case above. `evalIfPick` still splits on `contact_id`. `personIdsFromWrites` prefers `contact_id`. These pointers always carry it. The run id is not a person.

**Rejected alternatives.**

- Keep the primary key `(contact_id, firm_id)` and treat `details.auditRunId` as the run. The upsert replaces `details`. `sequence_ready` has nowhere to store a run. `handleAuditRunGet` already loses the contact on the next audit. The ready join never had a run to name.
- A current-row table, or a current column kept beside history. “Who is ready now” would be a second stored fact. Packet 018 says no new table. The primitive forbids a shadow copy. `eligibility_results` is already the other shape in this database: many rows, and `handleBoardDetections` reads the latest per contact with `DISTINCT ON (contact_id) … created_at DESC`. That settled the read. It did not settle a surrogate for these two tables.
- Define “now” as every person row of the firm’s newest `audit_runs` header. A second audit that does not include a contact would drop that contact from the enroll gate and clear the Contacts mark. The upsert does not do that. The enroll query does not do that. Packet 018 is per contact (`origin/pr-86:docs/register/SYSTEMS-CHANGE-PACKET-018.md`).
- A surrogate `id` column as the handle, with `audit_run_id` only as a foreign attribute. The pointer already has two fields, and the row’s uniqueness is exactly the run and the contact. `eventTest.ts` `writeId` prefers `body.id`, and the input pane copies `sample.id` onto the field chip (`InputPane`). A column named `id` would become that specimen identity. These tables have no such column. `loadWriteRow` already does not load them with `WHERE id = $1`. The specified load uses the two fields the pointer already has.
- Encode the pair into one string, or recover the run from a sibling `audit_runs` pointer in the same write list. `executeGet`’s latest rows are not one run: a contact the later audit skipped still points at the older run. `loadWriteRow` receives one write. A second channel beside the pointer was already rejected under claim 7.
- Copy the verdict onto the pointer. Unchanged from the earlier rejection. `loadWriteField` still re-reads the table.

No founder question. Contacts still shows the latest mark. Book readiness still shows the run that was opened. The enroll gate still enrolls whoever is ready now, including a contact a later batch did not mention. The surrogate would not change those three. The pointer shape and the missing `id` column already pick the pair.

---

## Claim 9 — A meeting response stops chasing for the contact

**Standing:** already established by the product. Recorded so a later session does not “fix” it into per-enrollment scope while applying claim 3.

Booking a meeting nullifies remaining `active_attempts` in status `open` for that firm and contact. Packet 023 names that status: they responded, stop chasing, this is a win. It is not exhaustion, and it is not the escrow-era refusal. `onCompletionWrite` may already have set the matched enrollment’s attempts to `met`; the meeting handler then nullifies whatever is still open. Detection of objective-met does not depend on the attempt still being open (packet 022 and 023).

Claim 3 still applies to which enrollment the meeting row is stamped with. The spending stop is a separate, already-specified contact-wide consequence of a meeting. This session does not reopen it.

**Evidence:** `server/wire-service/machine.ts` `handleMeetingBook`. `server/wire-service/contactSeat.ts` `handleContactSeatMeeting`. `docs/register/SYSTEMS-CHANGE-PACKET-023.md` §3.4.

---

## Claim 10 — These four tables load by the pointer’s id, which is the row’s primary key

**Standing:** technical decision made in this session.

`engagement_records`, `fact_writebacks`, `meeting_booked`, and `wait_occupancy` each have `id TEXT PRIMARY KEY`. They are not the audit pair. There is no second column in the key. `loadWriteRow` loads `SELECT * FROM <table> WHERE id = pointer.id`. The walk’s firm is not part of that predicate. `contact_id` is not part of that predicate. There is no `ORDER BY` and no “latest”. No row with that id returns null. The loader does not try the contact id when the id misses.

That is the same predicate the function already uses for `enrollment`, `contact_tag`, `missing_fact_signals`, `audit_runs`, `import_batch`, and `contact_records`. Claim 8’s pair stays on the two audit tables, which have no `id` column. These four have one. A later node reads a field with `loadWriteField`, which is this row passed through `nestedField`. A dotted path walks `payload` or `value`. The load returns the module row. It does not project a field list.

**The pointer’s `id` is that primary key.** `contact_id` stays the person. The inserted id and the pointer id are the same string. Otherwise the re-read misses the row.

The generic action is the writer that breaks it. After `call_agent`, `ascribe_tag`, and `run_audit`, and after the in-app early return, `workflowWalk.ts` calls `writeEngagement` and ignores the string it returns. It pushes `{ table: "engagement_records", id: contactId, contact_id: contactId }`. `writeEngagement` inserts `eng-` plus a uuid and returns that id (`cascade.ts`). The contact id is a different string. `WHERE id = contactId` finds nothing. The action types that reach this fallthrough are `manage_lists`, `assign_task`, and `notify_consultant` (`ACTION_TYPES` in `workflowWalk.ts`, `action_type_check` in `supabase/migrations/010_sequence_campaign_housing.sql`). One contact, one insert, one pointer. The pointer’s `id` is the returned `eng-` id. `contact_id` remains the contact. An in-app affordance other than `run_audit` or `ascribe_tag` returns earlier with an empty write list and does not call `writeEngagement`.

`engagement_records`, `fact_writebacks`, and `meeting_booked` are per person and are not in `PERSON_WRITE_TABLES`. `wait_occupancy`, `enrollment`, and `contact_tag` are. A person-row write splits people (`docs/register/PRIMITIVES.md`). These three join that split the way enrollment already does: the If tests each contact against the pointer whose `contact_id` is that contact, then this load reads that pointer’s id. The row id is not a person. The pointers keep `contact_id`, as enrollment’s pointer does. The live set still omits the three, so `evalIfPick` evaluates one write and, on a pass, sends every `ctx.contactIds` down the true branch. When several pointers share one contact, the existing `find` still takes the first. Choosing among those rows is the chip filter already parked under distinct work. This session does not retune that find.

The other writers that already emit a pointer store the primary key:

- `fact_writebacks`. `handleFactWriteback` and `handleContactSeatFacts` insert `fwb-` plus a uuid as `id`. The fact response’s cascade entry is `{ table: "fact_writebacks", id: writeId }`. `eventTest.ts` `toWrites` uses `body.id`, and the specimen bodies use that column. There is no walker insert.
- `meeting_booked`. `handleMeetingBook` and `handleContactSeatMeeting` insert `mtg-` plus a uuid as `id`. Door 1’s `toWrites` uses `body.id`. `handleMeetingBook` also inserts an `engagement_records` row and discards that `eng-` id. `event_write_set` for `meeting_booked` names `meeting_booked` only. That side row is not a pointer.
- `wait_occupancy`. The approval wait inserts `wo-` plus a uuid, `ON CONFLICT (workflow_run_id, wait_node_id, contact_id) DO NOTHING`, and pushes a pointer only when `RETURNING id` yields a row. That id is the primary key. `resumeDueWaitingRuns` and `waitNote.ts` push `id: row.id` with `contact_id`. The unique triple is how those writers find the occupancy. It is not on the pointer. The row is updated in place (`status`, `approved_at`, title). Re-read by id sees the current row. A copy of `status` on the pointer was already rejected under claim 8.

`engagement_records`, `fact_writebacks`, and `meeting_booked` append. A later insert for the same contact is a new id. Re-read by the first id is the first row. The desk list `handleEngagementRecordsList` (`ORDER BY created_at DESC LIMIT 100`) and the rule operand in `resolveRuleOperand` (`fact_writebacks` by firm, contact, and `field_key`, latest `created_at`) are other readers. They are not this load. `objectiveSatisfiedBy`’s latest matching stamp on fact and meeting is the completion matcher. It was not re-walked.

**Rejected alternatives.**

- Load these four the way the audit tables load, as a pair, or by `contact_id` and firm. The primary key is `id` alone. The audit tables have no such column. Claim 8 does not transfer.
- Keep the generic pointer as the contact id and teach the loader to select that contact’s latest engagement. Two nodes of the same action type, or a later append before a Wait re-reads, are different rows. Latest is the guess claim 7 and claim 8 already refused. `writeEngagement` already returns the row’s id. The index on `(firm_id, contact_id, created_at DESC)` is the inbound scan in `hasInboundOverride`, not the handle.
- Load `fact_writebacks` by `(contact_id, field_key)` latest, or `meeting_booked` by the newest row for the contact. Those are the rule operand and the completion matcher. A later answer, or a later meeting, would replace the row this firing wrote. The insert id is already `fwb-` or `mtg-`.
- Load `wait_occupancy` by `(workflow_run_id, wait_node_id, contact_id)`. That unique key finds the row for resume. The pointer does not carry the run id or the node id. It carries `id`, which the insert returns and the resume writers copy. A second pointer shape was rejected under claim 7.
- Filter the id lookup by `firm_id`. The six id-keyed loads already in `loadWriteRow` do not. These ids are the primary key. Firm isolation stays on the insert and on which walk holds the pointer.
- Fall back from a missing id to `contact_id`. That recreates the generic action’s miss inside the loader, or it selects some other row for the person.
- Upsert so the contact id becomes the key, or add a column. The id column is already the key. No migration. An upsert on contact would collapse the append log (`objective_met`, `window_fired`, `send_live`, and these action kinds are different rows).
- Copy the row onto the pointer at insert time. Unchanged from claim 8. `loadWriteField` re-reads.
- Treat A7’s “silent in the walker” as deleting this insert. `origin/pr-96:docs/register/SYSTEMS-AUTOMATIONS-ASCRIBE.md` A7 says `manage_lists`, `assign_task`, and `notify_consultant` are named and not executed, and `actionAgentRef` returns null unless the type is `call_agent`. That is still true of `actionAgentRef`. The fallthrough underneath it inserts `engagement_records` and pushes a pointer. This session does not mint a list, a task, or a notify table, and it does not remove the insert. The pointer names the row that insert created. A pointer that names the contact is not that row.

No founder question. The If still reads a field of the write this node made. Latest-by-contact would show a different row once two writes exist, which the primitive already forbids. The id column, the return value of `writeEngagement`, and the wait writers’ `row.id` already pick the predicate.

**Evidence:** `supabase/migrations/004_machine_tables.sql` (`engagement_records`, `fact_writebacks`). `supabase/migrations/007_meeting_booked.sql`. `supabase/migrations/024_wait_occupancy.sql`. `supabase/migrations/005_actuation.sql` (engagement index). `supabase/migrations/021_objective_local_axis.sql` (`form_ref`, `campaign_objective_id`). `cascade.ts` `writeEngagement`. `workflowWalk.ts` `loadWriteRow`, `loadWriteField`, `nestedField`, the action fallthrough, the wait insert, `resumeDueWaitingRuns`, `PERSON_WRITE_TABLES`. `waitNote.ts`. `machine.ts` `handleFactWriteback`, `handleMeetingBook`, `handleEngagementRecordsList`. `contactSeat.ts` `handleContactSeatFacts`, `handleContactSeatMeeting`. `eventTest.ts` `writeId`, `toWrites`. `docs/register/PRIMITIVES.md` (person-row versus artifact; no field catalog).

---

## Claim 11 — A live firing places this firing’s primary keys on `payload.writes`

**Standing:** technical decision made in this session.

The listening run’s handle is `previousWrites`. `walkValidatedWorkflow` sets it from `writesFromPayload(triggerPayload)`, and the trigger node commits that list. `dispatchEventToWorkflows` copies the event payload onto the trigger payload. When `payload.writes` is an array, `writesFromPayload` returns one pointer per element that has a string `table` and a string `id`. `contact_id` on the pointer comes from `contact_id` or `contactId` on that element. The function then returns. It does not also build an import-batch pointer or a `contact_records` pointer. An element with no table or no id is dropped.

That array is the channel claim 7 already required. The pointer’s `id` is the primary key claim 10 already required. This claim is what each of these three firings puts in the array. `writesFromPayload` gains no reader for `writebackId`, `meetingId`, or `enrollment_id`.

Two live completions already use the channel. `handleAuditRunCreate` dispatches `audit.completed` with `writes` set to the `RunWrite` list `executeAuditRun` built. The walker’s `run_audit` path does the same, and that dispatch is skipped when `opts.triggerLabel` already contains `audit.completed`. `handleContactSeatUpload` dispatches `contact_uploaded` with `writes: [{ table: "contact_uploads", id, contact_id }]`. `writesFromPayload` keeps `table`, `id`, and `contact_id` from those elements. `handleOnboardingFire` dispatches the event name `audit.completed` with `{ trigger: "campaign_state=running", onboarding: true }` and no `writes`. That payload is not this pattern.

**`fact_writebacks`.** `event_write_set` version 1 names that table only (`supabase/migrations/017_event_test_contract.sql`). `handleFactWriteback` and `handleContactSeatFacts` each insert one row whose `id` is `fwb-` plus a uuid, then dispatch. The seat handler dispatches inside the answer loop, so each firing is one insert. The dispatch payload gains

`writes: [{ table: "fact_writebacks", id: <that primary key>, contact_id: <the contact on the row> }]`.

The id is the `writeId` the insert already stores. The keys already on the payload stay, including `writebackId`, `fieldKey`, `form_ref`, and `campaign_objective_id`. `localRefFromPayload("fact_writebacks")` reads `form_ref`. The separate `contactIds` argument stays the person list. The seat payload also carries `firm_id`. The machine payload does not. This claim does not unify those scalars.

**`meeting_booked`.** `event_write_set` version 1 names that table only. `handleMeetingBook` and `handleContactSeatMeeting` each insert one row whose `id` is `mtg-` plus a uuid, then dispatch. The dispatch payload gains

`writes: [{ table: "meeting_booked", id: <that primary key>, contact_id: <the contact on the row> }]`.

The id is the variable the insert already stores. The keys already on the payload stay, including `meetingId`, `slot`, and `campaign_objective_id`. `localRefFromPayload` has no case for `meeting_booked`. This claim does not add one. The seat payload carries `firm_id`. The machine payload does not. Those scalars stay as they are.

**`objective_met`.** `event_write_set` version 1 names `engagement_records` at ord 0 and `enrollment` at ord 1 (`supabase/migrations/021_objective_local_axis.sql`). `advanceEnrollmentCampaign` is the only dispatch. `onCompletionWrite` and the tick in `cascade.ts` call that function. They do not build a payload. Pointers are placed on the path that flips the cursor, inserts the engagement row, and dispatches. A return before the flip does not dispatch.

The dispatch payload gains, in that ord,

`writes: [{ table: "engagement_records", id: <the id stored on the insert>, contact_id: <enrollment.contact_id> }, { table: "enrollment", id: <enrollment.id>, contact_id: <enrollment.contact_id> }]`.

The engagement id is `eng-` plus a uuid, the primary key of the row this firing inserts. The insert writes that expression inside the SQL, and the dispatch cannot see it. The string stored on the row is the string on the pointer. The fact and meeting handlers, and `writeEngagement`, already hold that kind of id in a variable the insert uses and still have afterwards. This insert holds the same kind of variable.

The enrollment id is `enrollment.id` of the row the flip updated (`supabase/migrations/004_machine_tables.sql`, `id TEXT PRIMARY KEY`). No new enrollment is minted. `contact_id` is that row’s `contact_id`. The flip has already set `campaign_id` to the next campaign, or to NULL. A re-read of this pointer sees that cursor. The engagement row’s `payload` names the campaign that cleared, the completion, and `nextCampaignId`. The dispatch scalars include `campaign_id` of the campaign that cleared and do not include `nextCampaignId`. The listener reads `nextCampaignId` from the engagement row.

The keys already on the dispatch stay, including `campaign_objective_id`, `enrollment_id`, and `completion_id`. `localRefFromPayload("objective_met")` reads `campaign_objective_id`, then `campaign_id`. The completion row is not a third pointer. `completionTable` and `completionId` are fields of the engagement payload. This write-set does not name `fact_writebacks`, `meeting_booked`, or `messaging_events`.

`pickWrites` filters by table. A node that names `engagement_records` or `enrollment` does not depend on array order. The array still follows the registered ord. `personIdsFromWrites` uses `contact_id` when it is set. When it is missing, and the table is in `PERSON_WRITE_TABLES`, it treats `id` as a person. `enrollment` is in that set. Both pointers carry `contact_id`, so the enrollment id is not taken as a person.

**Rows the same handlers write that these arrays do not carry.**

`handleFactWriteback` deletes the answered `missing_fact_signals` row and may insert others (`mfs-` plus a uuid) for `missingFieldKeys`. The seat handler deletes the answered row. `event_write_set` for `fact_writebacks` does not name `missing_fact_signals`. Those ids are not elements of this firing’s `writes`. `executeRuleWrites` already pushes `{ table: "missing_fact_signals", id, contact_id }` when that walk inserts a signal. That pointer belongs to the node. It is not this event.

Both fact handlers call `runContactEligibilityCascade` before the fact dispatch. That function inserts `eligibility_evaluations` (`eval-`), `eligibility_results` (`eres-`), `signals` (`sig-`), and `motion_decisions` (`mot-`), then dispatches `eligibility.changed`. The payload is the fact event payload spread, plus `anyPass: true` and `motion: "reactivation"`. It has no `writes`. `event_write_set` for `eligibility.changed` names those four tables, in that ord. They belong to that event. They are not elements of the `fact_writebacks` array. When that dispatch fires no workflow, the same function enrolls `tpl.reactivation.v1`. That fallback was seen and is not specified here.

### Revision — claim 12

The paragraph above describes the live `eligibility.changed` dispatch. Claim 12 specifies the array that firing places. It leaves those four rows off the `fact_writebacks` array. It does not specify the reactivation enroll.

`handleMeetingBook` inserts an `engagement_records` row of kind `meeting_booked` after the meeting dispatch. The id is generated inside the SQL. `handleContactSeatMeeting` does not insert that row. `event_write_set` for `meeting_booked` names `meeting_booked` only. Claim 10 already left the side row off the handle. It stays off. This claim does not move the insert.

`handleFactWriteback`’s HTTP body includes `cascade: [{ table: "fact_writebacks", id: writeId }, …]`. That object is the response. The dispatch does not receive it.

**Rejected alternatives.**

- Teach `writesFromPayload` to map `writebackId` onto `fact_writebacks` and `meetingId` onto `meeting_booked`. Claim 7 refused a second channel. The function already returns when `writes` is an array, and it never reads those keys. `objective_met` has no engagement-id key to map. `enrollment_id` is a scalar the function does not turn into a pointer. One array carries both objective rows. The audit completion and the upload already use that array.

- Leave the ids on the scalar keys and let the If read `triggerPayload`. Rejected under claim 7. The established pick is `mappedWrites` and `loadWriteField`.

- Have the listener select the newest row of the write-set table for the contact. Rejected under claim 7 and claim 10. Door 1’s fact query is the newest twenty for the firm, its meeting query the newest ten, and its objective query the newest ten `objective_met` engagements plus the newest ten enrollments, not paired to those engagements. Those queries are the test specimen. This firing has the inserted id in hand.

- Attach every recent specimen, or every answer in the seat loop, to one dispatch. Each handler already dispatches once per insert. The seat loop fires once per answer. This firing’s handle is that insert. A batch would put another answer’s row on this run. `PRIMITIVES.md` is every write this run made, not the firm’s recent rows.

- Add `contact_records` because `contactIds` is passed beside the payload. The write-sets do not name that table. The separate argument is the person list (claim 7). These payloads use `contactId` or `contact_id` singular, which `writesFromPayload` does not read. With `writes` present, the contact fallback does not run. The handle is the named rows.

- Add `missing_fact_signals`, the eligibility rows, or the meeting’s side engagement to these arrays. The registered write-sets do not name them. Eligibility is already its own dispatch. The meeting side row is absent on the seat path, and on the book path it does not exist yet at the dispatch.

- Add the completion row as a third `objective_met` pointer. The registered set is the engagement row and the enrollment row. The fact event and the meeting event already point at their own rows on their own firings. A click’s `messaging_events` row is named by `completionId` on the engagement payload.

- Drop the scalar keys once `writes` exists. `localRefFromPayload` would then miss `form_ref` for a fact and `campaign_objective_id` for an objective. A local trigger subscribed to one form or one objective would not match. Packet 022 §2.5 already put those keys on the objective payload for that axis. The scalars stay. They are the local grain. They are not the handle.

- Point the enrollment pointer at a new id, or at `nextCampaignId`. The row that moved is the enrollment already loaded. Its primary key is `id`. `nextCampaignId` is the campaign the cursor moved to. It lives on the engagement payload. It is NULL when the sequence ended. It is not an enrollment id.

- Require a call to `writeEngagement`, or require `INSERT … RETURNING`, as a different product result. Both yield the id the row stores. `writeEngagement` binds `eng-` plus a uuid, inserts, and returns it. `RETURNING` would read that column back. The fact and meeting dispatches already hold the id in the variable the insert used. The objective insert holds that same kind of variable. Which function text performs the insert is the same pointer. The generic action’s call stays claim 10.

- Copy the row body onto the pointer. `writesFromPayload` keeps `table`, `id`, and `contact_id`. `loadWriteField` re-reads the table. Door 1’s `toWrites` spreads the specimen body for the test HTTP response. The walker does not use that spread. Claim 8 rejected the snapshot.

- Put `firm_id` on the pointer. `RunWrite` has no such field. Claim 10 left firm off the id predicate.

No founder question. The If reads a field of a row this firing named. The write-set already chose the tables. The primary key already chose the pointer id. The audit completion and the upload already chose `payload.writes`. Keeping `form_ref` and `campaign_objective_id` is the local axis those triggers already match. A listener on one objective starts from this firing’s engagement row and this firing’s enrollment row, and the enrollment re-read shows the cursor after the flip.

**Evidence:** `runWrites.ts` `writesFromPayload`. `workflowWalk.ts` `dispatchEventToWorkflows`, `walkValidatedWorkflow`, `localRefFromPayload`, `pickWrites`, `personIdsFromWrites`, `PERSON_WRITE_TABLES`, the `run_audit` dispatch. `machine.ts` `handleFactWriteback`, `handleMeetingBook`, `handleAuditRunCreate`, `runContactEligibilityCascade`, `handleOnboardingFire`. `contactSeat.ts` `handleContactSeatFacts`, `handleContactSeatMeeting`, `handleContactSeatUpload`. `campaignHousing.ts` `advanceEnrollmentCampaign`, `onCompletionWrite`. `cascade.ts` `writeEngagement` and the tick’s call to `advanceEnrollmentCampaign`. `auditRun.ts` `executeAuditRun`. `eventTest.ts` `door1`. `supabase/migrations/004_machine_tables.sql` (`enrollment`). `supabase/migrations/017_event_test_contract.sql`. `supabase/migrations/021_objective_local_axis.sql`. `docs/register/SYSTEMS-CHANGE-PACKET-022.md` §2.5 and §2.7. `docs/register/PRIMITIVES.md`.

**Live.** `handleFactWriteback`, `handleContactSeatFacts`, `handleMeetingBook`, `handleContactSeatMeeting`, and `advanceEnrollmentCampaign` still omit `writes`. `previousWrites` for those events is still empty. No migration was written.

---

## Claim 12 — A live firing of `eligibility.changed` places each inserted primary key on `payload.writes`

**Standing:** technical decision made in this session.

The listening run’s handle is still `previousWrites`, built from `payload.writes` by `writesFromPayload` (claim 11). The pointer’s `id` is still the row’s primary key (claim 10). This claim is the array on the one `eligibility.changed` dispatch inside `runContactEligibilityCascade`. `writesFromPayload` gains no reader for `evaluationId`, `resultId`, `signalId`, or `motionId`.

The function loops `opts.contactIds`. For each contact it inserts one row of each table the write-set names, in that order. After the loop it dispatches once:

| Table | Primary key stored | Pointer `id` |
|---|---|---|
| `eligibility_evaluations` | `eval-` plus a uuid | that `id` |
| `eligibility_results` | `eres-` plus a uuid | that `id` |
| `signals` | `sig-` plus a uuid | that `id` |
| `motion_decisions` | `mot-` plus a uuid | that `id` |

Each of those tables is `id TEXT PRIMARY KEY` (`supabase/migrations/004_machine_tables.sql`). There is no second column in the key. `contact_id` on the pointer is the contact of that loop iteration, which is the `contact_id` the insert stored. `firm_id` stays off the pointer. `RunWrite` has no such field.

`event_write_set` version 1 names those four tables at ord 0 through 3 (`supabase/migrations/017_event_test_contract.sql`). The dispatch payload gains `writes` in that table order. Inside one table the pointers follow `opts.contactIds`. One contact therefore yields

`writes: [{ table: "eligibility_evaluations", id: <eval- id>, contact_id }, { table: "eligibility_results", id: <eres- id>, contact_id }, { table: "signals", id: <sig- id>, contact_id }, { table: "motion_decisions", id: <mot- id>, contact_id }]`.

Two contacts yield the two evaluation pointers, then the two result pointers, then the two signal pointers, then the two motion pointers. The ids are the variables the inserts already bind (`evalId`, `resultId`, `signalId`, `motionId`). The dispatch sits after the loop, so the array is every row that loop inserted.

The keys already on the payload stay. The cascade sets them to `{ ...opts.eventPayload, anyPass: true, motion: "reactivation" }`. `handleFactWriteback` and `handleContactSeatFacts` pass one contact and the fact scalars (`writebackId`, `fieldKey`, `contactId`, `form_ref`, `campaign_objective_id`). The seat handler calls the cascade inside the answer loop, so each answer is its own firing and its own quartet. `handleReferenceUpsert` passes the body `contactIds`, or up to 50 `contact_records` ids for the firm when the body omits them, and `eventPayload: { referenceId }`. `localRefFromPayload` has no case for `eligibility.changed`. This claim does not add one. `dispatchEventToWorkflows` still copies that payload and still sets `anyPass: true`. Claim 7’s refusal of `anyPass` is not recut.

**How a later node tells two rows of the same table apart.** One firing inserts one row of each table per entry of `opts.contactIds`. A fact firing has one contact, so each table appears once. A reference firing has one row of each table per contact in that list. Two rows of `eligibility_evaluations`, or of any of the other three, belong to one firing when that list has two contacts.

`pickWrites` filters by table, so a node that names `motion_decisions` does not read the evaluation row. The four tables are four facts. They share `contact_id`. They do not share a primary key. The result row’s `evaluation_id` is the evaluation’s id. The signal row’s `payload.resultId` is the result’s id. The motion row’s `reason.signalId` is the signal’s id. Those are columns on the row the pointer loads. They are not extra pointer fields.

A person-row write splits people (`docs/register/PRIMITIVES.md`). These four rows are one per contact. They join that split the way claim 10 joined `engagement_records`, `fact_writebacks`, and `meeting_booked`: the If tests each contact on the run against the pointer of the named table whose `contact_id` is that contact, then loads that pointer’s id. The row id is not a person. Every pointer carries `contact_id`. `personIdsFromWrites` uses `contact_id` when it is set. These tables are not in `PERSON_WRITE_TABLES` today. Putting them in that set and omitting `contact_id` would publish `eval-` as a person. The live set still omits them, so `evalIfPick` does not split them, and a table pick with no contact reads the first pointer of that table.

The loop does not dedupe `opts.contactIds`. A repeated contact id inserts a second quartet. Two pointers of one table then share `contact_id`. The existing `find` still takes the first. A pick that names the primary key selects that row (`pickWrites` on id, and `mappedWrites` when the chip id equals `w.id`). That find stays the parked chip. This firing’s id is the new primary key. A chip that stored a specimen id does not name it.

`loadWriteRow` has no branch for these four tables and returns null. Claim 10 already requires an `id` primary key to load `SELECT * FROM <table> WHERE id = pointer.id`, with no firm predicate, no contact predicate, and no “latest”. That is the re-read. This claim does not retune the function. The Board’s `DISTINCT ON (contact_id) … created_at DESC` in `handleBoardDetections` stays the desk’s current row. It is not this load.

**Rows this function writes that the array does not carry.** On the path that reaches a listening workflow, the inserts are those four tables, one row each per contact. The write-set names those four. Nothing named is skipped. No fifth table is inserted before the dispatch.

When `dispatched.length === 0`, the function then calls `enrollAndActuate` for `tpl.reactivation.v1`. That call inserts `enrollment` and `active_attempts`, and because `fireFirstStep` is omitted it also calls `writeEngagement`, which inserts `engagement_records`. A halt returns before those inserts. `event_write_set` for `eligibility.changed` does not name `enrollment`, `active_attempts`, or `engagement_records`. Those rows exist only when no workflow fired, so there is no listening run to hand them to. They are not elements of this firing’s `writes`. The enroll itself is not specified.

Callers write other rows before the cascade. `handleFactWriteback` writes `fact_writebacks` and may write `missing_fact_signals`. `handleReferenceUpsert` writes `reference_versions`. Those tables are not in this write-set. `referenceId` and the fact scalars stay on the payload. They are not pointers. The fact event’s own array is claim 11, and that dispatch happens after this one returns.

The value the cascade returns, and that `handleFactWriteback` spreads into the HTTP `cascade` array, is `{ contactId, evaluationId, resultId, signalId, motionId, motion }` per contact. That object is the response. The dispatch does not receive it. `scripts/verify-automations-alive.ts` dispatches the event name with `anyPass`, `motion`, and a contact id, and without these inserts. That script is not this firing.

Door 1 for `eligibility.changed` takes the newest eight `eligibility_evaluations` for the firm, the `eligibility_results` whose `evaluation_id` is in that set, every `signals` row of kind `eligibility_determination` for those contacts, and every `motion_decisions` row for those contacts. The signal query does not match `payload.resultId`. The motion query does not match `reason.signalId`. Those queries are the test specimen. This firing has the inserted ids in hand. Door 1 was not retuned.

The inserted `any_pathway_pass` is the constant `true`, and the inserted `motion` is `reactivation`, because `anyPass` is fixed true before the motion expression `anyPass ? "reactivation" : "nudge"`. The payload’s `motion` is the same string, also fixed. A configured If reads the motion column of the motion row this firing named. This claim does not change the constant. What a pathway rule would write into `result` was not specified.

**Rejected alternatives.**

- Teach `writesFromPayload` to map `evaluationId`, `resultId`, `signalId`, and `motionId`. Claim 7 refused a second channel. The function already returns when `writes` is an array. The HTTP cascade object uses those key names and is not the dispatch argument. The cascade holds the four ids in variables at the dispatch, which is how the fact and meeting handlers already hold `fwb-` and `mtg-`. One array carries every row.

- Leave the ids on the returned cascade object, or on `anyPass` and `motion`, for the If to read. Rejected under claim 7. The established pick is `mappedWrites` and `loadWriteField`. `evalBranch` reads `eligibilityPass` and `triggerPayload.motion`, and the walker does not call it.

- Have the listener select the newest rows of the four tables. Rejected under claim 7 and claim 10. Door 1’s eight evaluations are the specimen. `handleBoardDetections` is the desk’s latest row per contact. This firing has the inserted id in hand. A later cascade inserts a new id. Re-read by the first id is the first row.

- Dispatch once per contact so each run has a single row of each table. The function already dispatches once, after the loop, with the whole `contactIds` list. `contact_import` and `audit.completed` already place many person rows on one `payload.writes`. The version 1 specimen places two contacts on one `eligibility.changed` (`etd-elig-eval-okonkwo`, `etd-elig-eval-alvarez`, and the paired result, signal, and motion bodies). The primitive splits person-rows inside that run. A dispatch per contact would be a second firing model. The list order inside each table is the run’s way of keeping the registered table ord.

- Put the quartet in contact order (evaluation, result, signal, motion, then the next contact). `pickWrites` by table does not depend on cross-table order. The registered ord is a table order, and the specimen groups by table. The array follows that ord. For one contact the two orders are the same four pointers.

- Point only at `motion_decisions`, or only at the evaluation, and let the listener join the children. The write-set names four tables. The result, the signal, and the motion are different rows. Claim 7 already refused treating one row of a write-set as a substitute for another. The foreign keys stay columns.

- Add `fact_writebacks`, `missing_fact_signals`, `reference_versions`, `enrollment`, `active_attempts`, or `engagement_records` to this array. The write-set does not name them. The fact row is the other event. The reference row is the caller’s scalar `referenceId`. The enroll rows are written only when no workflow fired.

- Add every prior signal or motion for the contact, because door 1 selects them. This firing inserted one signal and one motion per contact. The handle is those rows. `PRIMITIVES.md` is every write this run made, not the contact’s history.

- Filter the signal pointer by `kind = 'eligibility_determination'` as a condition of membership. The insert writes that kind. The write-set names the table. The kind is a column of the row. The pointer is the inserted id.

- Use `evaluation_id` as the result pointer’s id, or `payload.resultId` as the signal pointer’s id. Each row’s primary key is its own `id`. The foreign key is readable after the load. The same refusal as the wait triple under claim 10.

- Load these four as the audit pair, or by latest `(firm_id, contact_id)`. The primary key is `id` alone. These tables have that column. The audit tables did not. The contact index on `eligibility_results` is the Board scan, not the handle.

- Copy the row body onto the pointer, or put `firm_id` on it. `writesFromPayload` keeps `table`, `id`, and `contact_id`. Claim 8 rejected the snapshot. Claim 10 left firm off the id predicate.

- Drop `anyPass`, `motion`, `form_ref`, `campaign_objective_id`, or `referenceId` once `writes` exists. Claim 7’s `anyPass` refusal is not recut here. `localRefFromPayload` does not read this event. The scalars already on the three callers’ payloads stay, the way claim 11 left the fact and meeting scalars. They are not the handle.

- One pointer per firing when `opts.contactIds` is empty. The loop inserts nothing. `writes` is an empty array. That is this firing’s handle. `dispatchEventToWorkflows`, when `contactIds` is empty and the audience is the whole firm, loads every `contact_records` id for the firm onto the walk. That substitution is not these four rows. It was seen and is not specified.

No founder question. The If reads a field of a row this firing named. The write-set already chose the four tables. The primary key already chose the pointer id. One dispatch already carries every contact in the list, and a person-row already splits those contacts. A listener on this firing starts from this loop’s evaluation, result, signal, and motion rows. Two contacts are two ids of the same table, and the contact on the pointer is how the later node tells them apart.

**Evidence:** `machine.ts` `runContactEligibilityCascade`, `handleFactWriteback`, `handleReferenceUpsert`, `handleBoardDetections`. `contactSeat.ts` `handleContactSeatFacts`. `runWrites.ts` `writesFromPayload`. `workflowWalk.ts` `dispatchEventToWorkflows`, `walkValidatedWorkflow`, `pickWrites`, `mappedWrites`, `personIdsFromWrites`, `PERSON_WRITE_TABLES`, `evalIfPick`, `resolveOperandText`, `loadWriteRow`, `localRefFromPayload`, `evalBranch`. `cascade.ts` `enrollAndActuate`, `writeEngagement`. `eventTest.ts` `door1`. `supabase/migrations/004_machine_tables.sql`. `supabase/migrations/017_event_test_contract.sql`. `docs/register/PRIMITIVES.md`. `supabase/seeds/003_canonical_workflows.sql` (`wf-eligibility-reactivation`).

**Live.** `runContactEligibilityCascade` still dispatches with no `writes`. `previousWrites` for that event is still empty. `loadWriteRow` still returns null for the four tables. `PERSON_WRITE_TABLES` still omits them. No migration was written.

---

## Claim 13 — A live firing of `campaign_failure` places the inserted primary key on `payload.writes`, and the payload carries that row’s `campaign_id`

**Standing:** technical decision made in this session.

The listening run’s handle is still `previousWrites`, built from `payload.writes` by `writesFromPayload` (claim 11). The pointer’s `id` is still the row’s primary key (claim 10). This claim is the array on the one `campaign_failure` dispatch in `escalateAttemptWindow`, and the `campaign_id` scalar that dispatch has to carry so the local matcher already written for this event can see the column the insert stored. `writesFromPayload` gains no reader for `campaignFailureId`. Packet 023’s meaning is unchanged: exhaustion stops spending and keeps listening, and a meeting is a win rather than a failure.

The dispatch runs only in the `!toChannel` branch, after `recordCampaignFailure` returns. When that function queues another attempt, it sets `toChannel` and this branch does not run. One call inserts one row and dispatches once.

`recordCampaignFailure` inserts `campaign_failure` with `id` = `cfail-` plus a uuid and returns that string. The columns stored are `firm_id`, `contact_id`, `campaign_id`, `sequence_id`, and `payload`. On this path `contact_id` is the attempt’s contact. `campaign_id` and `sequence_id` are the second read of that attempt’s enrollment (`SELECT sequence_id, campaign_id FROM enrollment`), or null when the attempt has no enrollment. The jsonb stored is `{ attemptId, criteriaId, setValue }` with `attemptId` equal to `attempt.id`. The same transaction sets that attempt to `status='exhausted'` when it is still `open`, and sets that enrollment’s `pursuit_state` to `exhausted`. It does not change `enrollment.campaign_id`.

`campaign_failure.id` is `TEXT PRIMARY KEY` (`supabase/migrations/010_sequence_campaign_housing.sql`). There is no second column in the key. `campaign_id` references `campaign` and is not the failure’s key. The specimen rows for one campaign (`camp.optin.harbor.v1`) are two different ids, Alvarez and Tanaka.

`event_write_set` version 1 names `campaign_failure` alone, at ord 0 (`supabase/migrations/017_event_test_contract.sql`). The dispatch payload gains

`writes: [{ table: "campaign_failure", id: <the id recordCampaignFailure returned and stored>, contact_id: <the contact stored on the row> }]`.

That is the only element. The id is the same string as `campaignFailureId`. `contact_id` on the pointer is the contact column, which is the one contact in `contactIds`. The row id is not a person. `firm_id` stays off the pointer. `RunWrite` has no such field. `campaign_failure` is not in `PERSON_WRITE_TABLES`. This firing places one pointer, so this claim does not add the table to that set. `personIdsFromWrites` uses `contact_id` when it is set.

The keys already on the payload stay: `campaignFailureId` and `attemptId`. The payload also gains `campaign_id` set to the `campaign_id` column just stored, including null. That is the second enrollment read, the value passed into `recordCampaignFailure`, not the earlier `campaignId` peek. The peek is what decides whether another attempt is queued. The failure branch reads the enrollment again, and that later value is the column.

`localRefFromPayload("campaign_failure")` and the client `triggerLocalRefFromPayload` both return `payload.campaign_id` or `payload.campaignId`, and nothing else. `localAxesMatch` compares that string to `workflow_trigger.local_ref` only when `local_ref` is set. The operator’s Select campaign stores `campaign.id` as `local_ref` (`AntAutomationWorkbench` builds the options from `listSequenceHousing`, `value: camp.id`). Every campaign clears `local_ref` and leaves `grain` local, so the compare does not run. A null column is not a string, `payloadString` returns null, and a trigger that selected a campaign does not match. A trigger that left the axis unset still matches.

The firm axis and the contact axis already resolve without new payload keys. `localAxesMatch` uses `payload.firm_id` or `payload.firmId`, and otherwise `opts.firmId`, which this dispatch already passes as `attempt.firm_id`. This event’s layers are firm and campaign, not contact (`TRIGGER_SELECT_EVENTS`). When `local_contact_ids` is set, the matcher uses `payload.contact_id` or, if that key is absent, `opts.contactIds`. This payload has no root `contact_id`. The separate `contactIds` argument is that one contact. This claim does not add `firm_id` or `contact_id` to the payload root.

`dispatchEventToWorkflows` copies the payload onto the trigger and still sets `anyPass: true`. The match reads the dispatch payload, before that copy. `campaign_id` has to be on the object passed into the dispatch. Claim 7’s refusal of `anyPass` is not recut.

`loadWriteRow` has no branch for `campaign_failure` and returns null. Claim 10 already requires an `id` primary key to load `SELECT * FROM <table> WHERE id = pointer.id`, with no firm predicate, no contact predicate, and no “latest”. That is the re-read. This claim does not retune the function. A later node reads `sequence_id`, and `payload.attemptId`, `payload.criteriaId`, and `payload.setValue`, from that row. `sequence_id` is not added to the dispatch. The specimen jsonb also carries `attemptN`, `channel`, `to`, `subject`, `reason`, and `lastAttemptAt`. The insert does not store those keys. This claim does not enrich the jsonb and does not retune door 1. Door 1 for this event is the newest ten `campaign_failure` rows for the firm. Those rows are the specimen reader. This firing has the inserted id in hand.

**Rows this path writes that the array does not carry.**

Before the branch, `escalateAttemptWindow` updates the open attempt’s channel and state, inserts a `workflow_run` labelled `window:` plus the criteria id, and inserts an `engagement_records` row of kind `window_fired`. The engagement id comes back as `engagementId` and is not put on this dispatch. That run is the tick’s record. The listening run is the one `dispatchEventToWorkflows` inserts. A forward channel may also insert `send_live` or `send_dry_run`. Those rows are written when this dispatch does not run. The write-set does not name `engagement_records` or `workflow_run`.

Inside `recordCampaignFailure`, the attempt update and the enrollment update are the spending stop packet 023 already specified. `event_write_set` does not name `active_attempts` or `enrollment`. The attempt id is the existing scalar and `payload.attemptId` on the failure row. `enrollment_id` is the id the update uses. It is not a column of `campaign_failure` and it is not in the jsonb. This claim does not add it to the row or to `writes`.

**Rejected alternatives.**

- Teach `writesFromPayload` to map `campaignFailureId` onto `campaign_failure`. Claim 7 refused a second channel. The function already returns when `writes` is an array and it never reads that key. The caller holds the returned id, which is the primary key the insert stored.

- Leave the id on `campaignFailureId` and let the If read `triggerPayload`. Rejected under claim 7. The established pick is `mappedWrites` and `loadWriteField`.

- Have the listener select the newest `campaign_failure` for the contact or the firm. Rejected under claim 7 and claim 10. Door 1’s ten rows are the specimen. Two exhaustions are two primary keys. The seed row `cfail-harbor-4-exhausted` is another reader’s row.

- Point the handle at `active_attempts` or at `enrollment`. The write-set names `campaign_failure`. Those updates are the spending stop. The attempt id is already a field of the failure row. Packet 023 already listed the failure row’s columns and did not name the enrollment as this event’s write.

- Use `campaign_id` as the pointer id. The primary key is `id`. One campaign has many failure rows. The specimen pair shares `camp.optin.harbor.v1` and does not share an id. `WHERE id = campaign_id` finds nothing. The operator’s `local_ref` is the campaign. It is not the failure row.

- Change `localRefFromPayload` to load the failure row and read the column, and omit the scalar. The matcher is a payload read, in the walker and in `triggerLocalRefFromPayload`. Packet 022 §2.5 put `objective_met`’s axis on the payload and registered that function. This event’s case already asks for `campaign_id`. The caller holds the column it just stored. A row load would be a second mechanism, and it would still need the id. Select campaign compares `local_ref` to that payload string. The match the operator already configured is that compare.

- Put `campaign_id` only on the `writes` element. `writesFromPayload` keeps `table`, `id`, and `contact_id`. `localRefFromPayload` reads the payload root. The axis has to be a root scalar. It is not a second pointer.

- Add `firm_id` or `contact_id` to the payload root so the other axes match. The firm compare already falls back to `opts.firmId`. The contact compare already falls back to `opts.contactIds`. This event’s trigger layers do not offer a contact axis. Those keys are not the instance axis.

- Drop `campaignFailureId` and `attemptId` once `writes` exists. They are already on the payload. `attemptId` is also the jsonb field. Claim 11 kept scalars the matcher does not read when they were already present. Dropping `campaign_id` would make a selected campaign miss. The two existing scalars stay. They are not the handle.

- Add `sequence_id`, `criteriaId`, `setValue`, or the specimen’s `reason` and `channel` as new root scalars. The matcher does not read them. `criteriaId` and `setValue` are already on the row. `sequence_id` is a column of the row the pointer loads. The specimen’s extra keys are not this insert.

- Add the `window_fired` engagement, the tick `workflow_run`, or a send engagement to this array. The write-set does not name them. They are written for windows that still have a forward channel and do not dispatch this event.

- Treat the specimen’s two bodies as one firing’s cardinality. The live branch inserts one row for one attempt and dispatches once. The specimen ords are two test bodies. This is not the eligibility loop.

- Load the row as the audit pair, or by latest `(firm_id, contact_id)`. The primary key is `id`. The index on `(firm_id, contact_id)` is not the handle.

- Copy the row onto the pointer, or put `firm_id` on it. `writesFromPayload` keeps `table`, `id`, and `contact_id`. Claim 8 rejected the snapshot. Claim 10 left firm off the id predicate.

- Require `INSERT … RETURNING` as a different product result. `recordCampaignFailure` already returns the id it stored. Claim 11 treated that as the same pointer.

No founder question. The If reads a field of the failure row this firing inserted. The write-set chose the table. The primary key chose the pointer id. The matcher and Select campaign already chose `campaign_id`, and the insert already stores that column. A listener subscribed to one campaign starts when that column equals the campaign the operator selected, and the run’s pointer is this insert’s `cfail-` id. A listener that left the campaign axis unset still starts, and it starts from that same id.

**Evidence:** `cascade.ts` `escalateAttemptWindow`. `campaignHousing.ts` `recordCampaignFailure`. `runWrites.ts` `writesFromPayload`. `workflowWalk.ts` `localRefFromPayload`, `localAxesMatch`, `dispatchEventToWorkflows`, `loadWriteRow`, `PERSON_WRITE_TABLES`, `personIdsFromWrites`. `eventTest.ts` `door1`. `src/app/data/automationTriggerSelect.ts` `triggerLocalRefFromPayload`, `TRIGGER_SELECT_EVENTS`. `AntAutomationWorkbench.tsx` the `campaign_failure` options. `TriggerSelectModal.tsx` Every campaign clears `local_ref`. `supabase/migrations/010_sequence_campaign_housing.sql`. `supabase/migrations/017_event_test_contract.sql`. `supabase/seeds/007_pursuit_exhausted.sql`. `docs/register/SYSTEMS-CHANGE-PACKET-022.md` §1. `docs/register/SYSTEMS-CHANGE-PACKET-023.md` §3.1, §3.2, §3.5.

**Live.** `escalateAttemptWindow` still dispatches `{ campaignFailureId, attemptId }` with no `writes` and no `campaign_id`. `previousWrites` for that event is still empty. A trigger with `local_ref` set still does not match. `loadWriteRow` still returns null for `campaign_failure`. No migration was written.

---

## Claim 14 — A contact-scope firing of `halt_records` places the inserted primary key on `payload.writes`

**Standing:** technical decision made in this session.

The listening run’s handle is still `previousWrites`, built from `payload.writes` by `writesFromPayload` (claim 11). The pointer’s `id` is still the row’s primary key (claim 10). This claim is the array on the contact-scope dispatch in `handleHaltCommit`. `writesFromPayload` gains no reader for `haltId`. The firm-book branch does not dispatch. That branch stays the gate. It is not a second copy of this array.

`handleHaltCommit` builds `haltId` with `id("halt")`, which returns `halt-` followed by `Date.now()`, a hyphen, and `Math.random().toString(36).slice(2, 8)`, and inserts one `halt_records` row with that string as `id`. The other columns stored are `consultant_id`, `contact_id` (`body.contactId`, or null), `firm_id`, `scope`, `reason` (or null), and `halted_at`. `lifted_at` is left null. The same handler then inserts one `audit_events` row. When `scope` is `contact`, it dispatches once:

`eventName: "halt_records"`, `firmId: body.firmId`, `payload: { haltId, contactId: body.contactId ?? null }`, and `contactIds` of that one contact when `body.contactId` is set. There is no `writes`.

`halt_records.id` is `TEXT PRIMARY KEY` (`supabase/migrations/003_ct_wire_stores.sql`). There is no second column in the key. `contact_id` is nullable. `scope` is `contact` or `firm-book`. Neither is the key. There is no unique constraint on an active contact halt, so two contact commits for one person are two primary keys.

`event_write_set` version 1 names `halt_records` alone, at ord 0 (`supabase/migrations/017_event_test_contract.sql`). The contact-scope dispatch payload gains

`writes: [{ table: "halt_records", id: <the haltId the insert stored>, contact_id: <the contact_id column> }]`.

That is the only element. The id is the same string as `haltId`. `contact_id` on the pointer is the column. When the column is a string, `contactIds` is that one contact and `personIdsFromWrites` uses `contact_id`. When the column is null, `contact_id` on the element is null and `contactIds` is omitted. `halt_records` is not in `PERSON_WRITE_TABLES`. A null `contact_id` does not publish the `halt-` id as a person. `firm_id` stays off the pointer. `RunWrite` has no such field. This firing places one pointer, so this claim does not add the table to that set.

The desk path stores a string. `confirmHalt` returns before the commit when the scope is this contact and there is no active client, and the commit then passes that client as `contactId` (`ConsultantAntScene.tsx`). A contact-scope body that omits `contactId` still inserts and still dispatches. `dispatchEventToWorkflows`, for an every-firm audience with no contact ids, loads every `contact_records` id for the firm. That substitution is the empty-list walk claim 12 left unspecified. This claim does not specify it. The pointer on that body is still this insert’s id.

The keys already on the payload stay: `haltId` and `contactId`. `localRefFromPayload` has no case for `halt_records` and returns null. `triggerLocalRefFromPayload` is the same. `localAxesMatch` compares `local_ref` only when `local_ref` is set, so a trigger with no `local_ref` still matches. A trigger that has `local_ref` set does not match, because null is not that string. This claim does not add a case.

Halt is not an instance axis the operator selects. `TRIGGER_SELECT_EVENTS` is the A26 list, and its comment says not to add halt. `WORKFLOW_EVENTS_WITH_LOCAL` does not include `halt_records`. The primitives event table does not include Halt (`docs/register/PRIMITIVES.md`). The trigger-select packet says that list is the named events, and that extra events are not built (`origin/pr-96:docs/register/TRIGGER-SELECT-PACKET.md`). The seed graphs do not subscribe to `halt_records` (`supabase/seeds/003_canonical_workflows.sql`). Hub’s catalog still has the label Halt. Hub is not the product face. This claim does not add the row to A26. The dispatcher still starts an active event trigger whose `event_name` is `halt_records` for this firm, or a platform trigger (`firm_id` null), when `localAxesMatch` passes (`dispatchEventToWorkflows`). That stored row is who hears this firing.

The firm axis and the contact axis already resolve without new payload keys. The dispatch passes `firmId: body.firmId`, and `localAxesMatch` falls back to `opts.firmId`. The payload already has `contactId`, which is the key the contact compare reads, and `contactIds` carries the same person when the column is a string. This claim does not add `firm_id` or `scope` to the payload root.

`dispatchEventToWorkflows` copies the payload onto the trigger and still sets `anyPass: true`. `writes` has to be on the object passed in, because the copy is what `writesFromPayload` reads. Claim 7’s refusal of `anyPass` is not recut.

`loadWriteRow` has no branch for `halt_records` and returns null. Claim 10 already requires an `id` primary key to load `SELECT * FROM <table> WHERE id = pointer.id`, with no firm predicate, no contact predicate, no `lifted_at` predicate, and no “latest”. That is the re-read. This claim does not retune the function. A later node reads `consultant_id`, `scope`, `reason`, `halted_at`, and `lifted_at` from that row. On this firing `scope` is `contact` and `lifted_at` is null. `reason` is the optional text, or null. Those columns are not added to the dispatch. The specimen bodies also carry `consultant_name`, `contact_name`, and `firm`. The insert does not store those keys. This claim does not enrich the row and does not retune door 1.

Door 1 for this event is the newest ten `halt_records` rows for the firm with `lifted_at` null, both scopes (`eventTest.ts`). `toWrites` uses `body.id`. Those rows are the specimen reader. This firing has the inserted id in hand. The version 1 bodies are two rows: Moreau, scope `contact`, id `halt-harbor-moreau-contact`, and a firm-book row, id `halt-harbor-book-ircc-outage`, `contact_id` null. The live contact branch inserts one row and dispatches once. The two bodies are not this firing’s cardinality.

**The firm-book branch.** When `scope` is `firm-book`, the handler first sets `lifted_at` on every other active firm-book row for that firm, then inserts the new row with `contact_id` null, then inserts `audit_events` with kind `halt.firm-book`. It does not call `dispatchEventToWorkflows`. The consultant’s Firm book control is that scope: the modal says it stops automatic firm→client sends across the book, and `confirmHalt` omits `contactId` (`HaltOutreachModal.tsx`, `ConsultantAntScene.tsx`). The founder kill-switch is the same scope, one commit per target firm, with no contact (`FounderAgencyControlsModule.tsx`). The copy on that desk says the write suppresses new enrollments and new sends, and leaves in-flight attempts alone.

That is what the runners already do. `consentAndHaltGate` denies a send when an active firm-book row exists for the firm, including a send with no contact id (`dispatchSend.ts`). `enrollAndActuate` calls `isHaltBlockingNew` and returns `blocked: "halt"` before inserting an enrollment. The comment on that check says a firm-book or contact halt blocks new enrollments and does not abort in-flight attempts (`cascade.ts`). `handleHaltIsFirmBook` is the same active-row check. Those readers do not need a listening run. The governance leaf and the kill-switch leaf name the same readers: runners and send gates (`docs/register/how/consultant-governance.md` leaf 1.2, `docs/register/how/operator-founder-controls.md` leaf 1.2).

A dispatch on this branch would start every subscribed workflow with no `contactIds`. The every-firm audience would then load the firm’s contacts, which is the empty-list walk this claim does not specify. The handler already withholds the call. The book specimen and door 1’s active-row query are not that call. This claim does not add it.

**Lift.** `handleHaltLift` sets `lifted_at` on the row with this id and inserts `audit_events` kind `halt.lift`. It does not dispatch. There is no `event_write_set` for a lift. After the lift, the gates stop treating the row as active. A listening run that already holds this firing’s pointer re-reads the same id and sees `lifted_at`. The load does not require `lifted_at` null, so the row remains the handle. This claim does not add a lift event.

**Rows this path writes that the array does not carry.**

The contact-scope `audit_events` insert uses `id("aud")` and does not keep that string. The kind is `halt.contact`. The subject is the contact, or the firm id when `contactId` was omitted. The jsonb is `{ haltId, reason }`. `event_write_set` does not name `audit_events`. That row is not an element of `writes`.

The contact-scope path does not update any other `halt_records` row. The firm-book supersede, and the rows it lifts, belong to the branch that does not dispatch.

The contact-scope gate is a different reader. `consentAndHaltGate`, `isHaltBlockingNew`, and `handleHaltIsContact` treat an active `scope = 'contact'` row for that `contact_id` as halted. The contact arm of those checks does not also constrain `firm_id`. The handle’s predicate is claim 10’s `WHERE id = pointer.id`. Whether one contact id can exist in two firms was not investigated. That gate is not this pointer.

The HTTP body returned by `handleHaltCommit` is the halt record. The dispatch does not receive it. The in-memory stand-in commit does not call the dispatcher. This firing is the server handler.

**Rejected alternatives.**

- Teach `writesFromPayload` to map `haltId` onto `halt_records`. Claim 7 refused a second channel. The function already returns when `writes` is an array and it never reads that key. The caller holds the id the insert stored.

- Leave the id on `haltId` and let the If read `triggerPayload`. Rejected under claim 7. The established pick is `mappedWrites` and `loadWriteField`.

- Have the listener select the newest active `halt_records` for the contact or the firm. Rejected under claim 7 and claim 10. Door 1’s ten rows are the specimen. The gate’s `LIMIT 1` is an existence check with no `ORDER BY`. Two contact commits are two primary keys. Re-read by the first id is the first row, including after a later commit for the same person.

- Use `contact_id` as the pointer id. The primary key is `id`. The gate looks up the person. `WHERE id = contactId` finds nothing. The `halt-` string is the row this firing inserted.

- Add a `localRefFromPayload` case, or put `scope` on the payload as an instance axis. A26 does not offer Halt, and the primitives list does not name it. There is no Select control whose stored id this payload fails to carry. `scope` on this firing is the column `contact`. A book-versus-contact axis would be a new control, and the book branch does not dispatch.

- Dispatch the firm-book branch with the same array, using a null `contact_id`. The product’s firm halt and the kill-switch are the gate: new sends and new enrollments stop, in-flight attempts stay. The handler already omits the dispatch. Starting workflows for a book commit would run the empty-list walk against a suppression, including a fleet kill-switch that writes one row per firm. The specimen’s book body is a test row of the table. It is not this firing.

- Add `audit_events` to the array. The write-set names `halt_records`. The audit id is not kept. The halt id is already inside the audit jsonb.

- Add the firm-book rows lifted by a book commit. That update is the other branch. The contact path does not lift earlier contact halts.

- Add `contact_records` because `contactIds` is passed beside the payload. The write-set does not name that table. The separate argument is the person list. With `writes` present, the contact fallback in `writesFromPayload` does not run.

- Add `halt_records` to `PERSON_WRITE_TABLES`. This firing has one pointer and it carries `contact_id` when the column is a string. The `halt-` id is not a person. Adding the table and omitting `contact_id` would publish that id as a person.

- Load the row as the audit pair, or by latest `(firm_id, contact_id)`, or with `lifted_at IS NULL`. The primary key is `id`. The partial indexes are the gate scans. A lift updates this row. The re-read has to see `lifted_at`. Door 1’s active filter is the specimen.

- Drop `haltId` and `contactId` once `writes` exists. They are already on the payload. `contactId` is also the contact-axis key. Claim 11 kept scalars the matcher does not use as the handle. The two stay. They are not the handle.

- Add `scope`, `reason`, `consultant_id`, or the specimen’s `consultant_name` as new root scalars. The matcher does not read them. The row the pointer loads already holds the columns the insert writes.

- Copy the row onto the pointer, or put `firm_id` on it. `writesFromPayload` keeps `table`, `id`, and `contact_id`. Claim 8 rejected the snapshot. Claim 10 left firm off the id predicate.

- Require `INSERT … RETURNING` as a different product result. `haltId` is the id the insert stored. Claim 11 treated that as the same pointer.

- Add Halt to the A26 list so the operator can subscribe. The named list and the primitives table already exclude it. The pointer is for the dispatch the handler already performs. A new event row would be a new listen, which the trigger-select packet refuses.

No founder question. The If reads a field of the halt row this contact-scope firing inserted. The write-set chose the table. The primary key chose the pointer id. The missing matcher case is the absence of an instance axis, not a selected campaign the payload forgot to carry. A firm halt and a kill-switch stay the gate the desk already describes, and they do not start this listening run. A listener that is already subscribed starts from this insert’s `halt-` id, and a later lift of that same id is visible on the re-read.

**Evidence:** `stores.ts` `id`, `handleHaltCommit`, `handleHaltLift`, `handleHaltIsContact`, `handleHaltIsFirmBook`. `dispatchSend.ts` `consentAndHaltGate`. `cascade.ts` `enrollAndActuate`, `isHaltBlockingNew`. `runWrites.ts` `writesFromPayload`. `workflowWalk.ts` `localRefFromPayload`, `localAxesMatch`, `dispatchEventToWorkflows`, `loadWriteRow`, `PERSON_WRITE_TABLES`, `personIdsFromWrites`. `eventTest.ts` `door1`, `writeId`. `src/app/data/automationTriggerSelect.ts` `TRIGGER_SELECT_EVENTS`, `triggerLocalRefFromPayload`. `src/app/data/automationWorkflows.ts` `WORKFLOW_EVENTS_WITH_LOCAL`, `WORKFLOW_EVENT_CATALOG`. `ConsultantAntScene.tsx` `confirmHalt`. `HaltOutreachModal.tsx`. `FounderAgencyControlsModule.tsx`. `supabase/migrations/003_ct_wire_stores.sql`. `supabase/migrations/017_event_test_contract.sql`. `supabase/seeds/003_canonical_workflows.sql`. `docs/register/PRIMITIVES.md`. `docs/register/how/consultant-governance.md` leaf 1.2. `docs/register/how/operator-founder-controls.md` leaf 1.2. `origin/pr-96:docs/register/TRIGGER-SELECT-PACKET.md`.

**Live.** The contact-scope dispatch is still `{ haltId, contactId }` with no `writes`. `previousWrites` for that event is still empty when a listener starts. `loadWriteRow` still returns null for `halt_records`. The firm-book branch still does not dispatch. No migration was written.

---

## What has no home, what cannot fulfill, what cannot work together

**No home**

- The id of the `objective_met` engagement row on the dispatch that starts the listening run (claim 7). The insert allocates it and drops it. This is a missing field on an existing payload, not a new table. Re-read this session: `advanceEnrollmentCampaign` still generates `eng-` plus a uuid inside the `INSERT` and the dispatch payload still has no `writes` and no engagement id. Claim 10 does not put it there.
- A listening pointer for `fact_writebacks` and for `meeting_booked`. The insert id is on the payload as `writebackId` or `meetingId`. `writesFromPayload` does not read those keys, and the payload has no `writes` array. Claim 7 already refused a second channel beside the pointer. Where that array sits is distinct work, not claim 10.

### Revision — claim 11

Those two bullets describe the live payloads. They still do. Claim 11 names the home: `payload.writes` on the five dispatches, the inserted primary key as `id`, and the enrollment pointer beside the engagement pointer. It is not a new table. The running dispatches still omit the array, so the listener still starts empty.

**Exists but cannot fulfill the responsibility**

- `enrollment` as the thing a listener reads to learn which objective was met (claim 7). After the flip it answers a different question.
- `reachability_verdicts` and `sequence_ready` while their primary key is `(contact_id, firm_id)` and `auditRun.ts` upserts on that pair (claim 8). The key that holds two runs is specified: `(audit_run_id, contact_id)`, insert, pointer `id` = that run. The live tables do not have that column yet.
- `reachability_verdicts.details.auditRunId` as the way `handleAuditRunGet` names a run (claim 8). The next audit overwrites `details`. The specified name is the `audit_run_id` column. The live query still reads the jsonb.
- `loadWriteRow` as the reader of the handle (claim 7). The earlier sentence was that several tables the product already puts on a handle come back as null. Claim 10 specifies the load for `engagement_records`, `fact_writebacks`, `meeting_booked`, and `wait_occupancy` as `WHERE id = pointer.id`. The live function still returns null for them. The generic action still pushes the contact id. `PERSON_WRITE_TABLES` still omits the three append tables, so the If does not yet split them per contact. The same function also returns null for `eligibility_evaluations`, `eligibility_results`, `signals`, and `motion_decisions`. Claim 12 applies that same id predicate to those four. The live function still has no branch for them. It also returns null for `campaign_failure`. Claim 13 applies that same id predicate. The live function still has no branch for it. It also returns null for `halt_records`. Claim 14 applies that same id predicate to the contact-scope firing. The live function still has no branch for it.
- `resolveFormStamp` and `onCompletionWrite` as the attribution of a completion (claim 3). They answer “newest pursuit for this person.” The live send does persist the click’s stamp. The click path does not read it back as the enrollment to advance.

**Individually reasonable, cannot work together**

- Packet 022 §2.4’s newest-enrollment detection, and packet 022 §2.5’s escalation, which inserts a second enrollment (claims 2 and 3).
- `event_write_set` naming `engagement_records` for `objective_met`, and `loadWriteRow` not loading that table (claim 7). Claim 10 specifies the load. Claim 11 specifies the handoff: `payload.writes` carries the engagement id and the enrollment id. The live function still returns null, and the live dispatch still omits `writes`. The write-set and the listener still do not meet in the running code.
- `event_write_set` naming `eligibility_evaluations`, `eligibility_results`, `signals`, and `motion_decisions` for `eligibility.changed`, and `runContactEligibilityCascade` dispatching that event with no `writes` (claim 12). The cascade does insert those four rows before the dispatch. Claim 12 specifies the array. The live dispatch still omits it, and `loadWriteRow` still returns null for the four, so the write-set and the listener still do not meet in the running code.
- That same function, when the dispatch fires no workflow, inserting `enrollment`, `active_attempts`, and `engagement_records`, which this write-set does not name (claim 12). Those inserts are not the listening pointer. The enroll was not specified.
- `event_write_set` naming `campaign_failure`, and `escalateAttemptWindow` dispatching that event with no `writes` (claim 13). The insert already stored the `cfail-` id. Claim 13 specifies the array. The live dispatch still omits it, and `loadWriteRow` still returns null, so the write-set and the listener still do not meet in the running code.
- `localRefFromPayload("campaign_failure")` reading `campaign_id`, and that dispatch not carrying `campaign_id` (claim 13). The column is on the row the insert wrote. Claim 13 puts that column’s value on the payload. The live payload still omits it, so a trigger that selected a campaign still does not match.
- `event_write_set` naming `halt_records`, and the contact-scope dispatch in `handleHaltCommit` omitting `writes` (claim 14). The insert already stored the `halt-` id. Claim 14 specifies the array. The live dispatch still omits it, and `loadWriteRow` still returns null, so the write-set and the listener still do not meet in the running code. The firm-book branch does not dispatch. Claim 14 leaves that branch as the gate. It is not a second missing array.
- `writeEngagement` returning the inserted id, and the generic action pushing `id: contactId` (claim 10). The row exists. The pointer names the contact. The specified load looks up the pointer id.
- `chainWrites` for every node (the in-memory walker), and resume forwarding only the wait’s writes (claim 6).
- The cursor as a once-only latch (packet 022 §2.3), and “Open in Now” writing `campaign_id` (claim 4).
- Re-reading the module’s row (the primitive), and upserting that row on the next audit (claim 8).
- `handleAuditRunGet` filtering verdicts by `details.auditRunId`, and `auditRun.ts` replacing `details` on the next audit (claim 8).
- A click predicate that treats `campaign_objective_id` as enough, and two enrollments on one campaign sharing that id (claims 2 and 3). The tick then advances both while both attempts are open.

---

## Distinct work, not this investigation

**Queryable lineage.** Automations face law 29: who created the objective, the path, the completion, the time. The `objective_met` engagement append is one fact that query would read. Building the query is a separate capability.

**Failure.** Packet 023: exhaustion stops spending and keeps listening. Claim 9 records only the meeting nullify, so it is not mistaken for a hole in attribution. The failure event’s own handle has the same shape as claim 7 and was not walked.

### Revision — claim 13

The sentence above is the meaning, and it stands. Claim 13 specifies the handle: `payload.writes` carries the inserted `cfail-` id, and `campaign_id` on that payload is the column the matcher already reads. The live dispatch still omits both. The spending stop and the meeting nullify were not reopened.

**Which enrollment a failure row names.** `recordCampaignFailure` updates `enrollment` by the `enrollmentId` the caller passed. That id is not a column of `campaign_failure` and it is not in the jsonb. Packet 023 lists the columns the row already carries and does not add it. The attempt id is on the row. Two enrollments can share a contact and a campaign (claims 2 and 3). This pointer does not name the enrollment. Loading the attempt to find it was not specified.

**Form authoring.** Whether the form is its own graph node or embedded in the agent action is still open on `AUTOMATIONS-FACE.md`. Attribution assumes the derived `form_ref` once a form exists. It does not decide where the form is authored.

**What `sequence_ready.ready` is derived from.** `SYSTEMS-REQUIREMENTS-FILLED.md` §5 says the flag is derived from the verdict and consent. `executeAuditRun` sets it from the verdict alone (reachable or partial). `enrollAndActuate` in `cascade.ts` does not mention consent. The key stores the boolean the writer produced. It does not decide that derivation. Consent on the send was not walked.

**The field chip’s copied id.** The input pane copies `sample.id` onto a field chip, and `mappedWrites` filters to that id. The house If (`pickTable` / `pickField`, `supabase/migrations/015_house_notes_handle.sql`) does not. It matches `contact_id`. The key says `door1`’s emitted write id is the run id. Live `writeId` does not do that yet: with no `id` column it uses `contact_id`. A chip that has stored a sample run id will not match a later walk, whose run id is new. Retuning the pane is not the key. The person split in claim 8 does not go through the chip id. Claim 10 uses the same find: several `fact_writebacks` or `engagement_records` rows for one contact, and the first pointer wins until the chip names the row id. That is still this item. It was not retuned. Claim 11 puts an engagement pointer and an enrollment pointer on one `objective_met` firing, both with that contact’s `contact_id`. A pick that names the table selects that table (`pickWrites`). A pick that matches only on `contact_id` still takes the first. That find was not retuned.

**The listening pointer.** Claim 10 loads a row only when the pointer’s `id` is the inserted id. `wait_occupancy` already pushes that id from the walk, the due-resume, and `waitNote.ts`. The generic action is specified to push `writeEngagement`’s return. Three live fires do not push a pointer at all. `handleFactWriteback` and `handleContactSeatFacts` dispatch `fact_writebacks` with `writebackId` set to the `fwb-` id and with no `writes`. `handleMeetingBook` and `handleContactSeatMeeting` dispatch `meeting_booked` with `meetingId` set to the `mtg-` id and with no `writes`. `advanceEnrollmentCampaign` still omits the `eng-` id (claim 7). `writesFromPayload` builds pointers from `payload.writes`, an import batch id, or `contact_ids` / `contactIds`. `dispatchEventToWorkflows` spreads that payload onto the trigger and passes `contactIds` as a separate argument, so `previousWrites` is empty. Door 1’s specimen pointers already use `body.id`. They are not this firing. Claim 7 refused a channel beside the pointer. This session does not specify the three payloads. `campaign_failure` carries `campaignFailureId` the same way and was not followed.

### Revision — claim 11

The paragraph above is the gap as session 004 left it. Claim 11 specifies the three payloads. The live five dispatches still omit `writes`. `campaign_failure` was still not followed. `recordCampaignFailure` inserts `cfail-` plus a uuid and returns that id. Its dispatch was not read.

### Revision — claim 12

Claim 12 does not change those three payloads. While the next site was being named, the `campaign_failure` dispatch in `cascade.ts` was visible: `payload` is `{ campaignFailureId: failId, attemptId: attempt.id }`, `contactIds` is that one contact, and there is no `writes`. That placement was not specified.

### Revision — claim 13

Claim 13 specifies that placement. The paragraph above stands as the description of the live payload.

**`eligibility.changed` from a fact write.** Both fact handlers call `runContactEligibilityCascade` before they dispatch `fact_writebacks`. That cascade inserts four rows (`eval-`, `eres-`, `sig-`, `mot-`) and dispatches `eligibility.changed` with the fact scalars, `anyPass: true`, and `motion: "reactivation"`, and with no `writes`. `event_write_set` version 1 names `eligibility_evaluations`, `eligibility_results`, `signals`, and `motion_decisions`. Claim 11 leaves those rows off the fact pointer because they are the other event. How that firing places its own ids on `payload.writes` is the same shape of hole, and it was not specified. When the dispatch fires no workflow, the function enrolls `tpl.reactivation.v1`. That enroll was seen and not specified.

### Revision — claim 12

Claim 12 specifies that array: one pointer per inserted row, table order from the write-set, `contact_id` on each pointer, person split across two contacts. The live dispatch still omits `writes`. The reactivation enroll remains unspecified. The paragraph above stands as the description of the live payload.

**Onboarding’s `audit.completed`.** `handleOnboardingFire` dispatches that event name with no `writes` and no audit-run id. The audit module’s own completion does pass `result.writes`. The onboarding payload was seen while checking that pattern. It was not specified.

**What the eligibility row’s pass is derived from.** `runContactEligibilityCascade` sets `anyPass` to the constant `true`, stores that on `eligibility_results.any_pathway_pass`, and stores `motion` `reactivation`. It does not read `rule_eligibility_pathway` or the in-memory eligibility pack. Claim 12 names the row that insert wrote. It does not decide the derivation. Same shape as the parked `sequence_ready.ready` derivation, and a different writer.

**The reactivation branch on the seed graph.** `wf-eligibility-reactivation` (`supabase/seeds/003_canonical_workflows.sql`) has a branch labelled “Reactivation-worthy?” with `filterSummary` `reactivation-worthy`, and with no compare and no `pickTable`. `evalIfPick` with no compares returns false. `evalBranch` reads `eligibilityPass` and `triggerPayload.motion`, and the walker does not call it. Claim 12’s pointers are what a configured If reads. Placing them does not make this branch read `motion_decisions.motion`. That pick was not specified.

**An empty eligibility firing and the firm book.** When `opts.contactIds` is empty, claim 12’s `writes` is an empty array. `dispatchEventToWorkflows`, for an every-firm audience with no contact ids, selects every `contact_records` id for the firm and walks those contacts. That list is not the four inserted rows. It was seen while reading the dispatch. It was not specified.

### Revision — claim 14

Claim 14 specifies the contact-scope `halt_records` array: one pointer, `halt_records` and the `halt-` id the insert stored, `contact_id` from that row’s column. The live contact dispatch still omits `writes`. The firm-book branch, including the founder kill-switch, stays the gate and does not dispatch. Lift updates the same row and does not start a second firing. The contact-scope gate’s missing firm predicate was seen on `consentAndHaltGate`, `isHaltBlockingNew`, and `handleHaltIsContact`. It is another reader of `halt_records`. It was not specified. The paragraph above stands for the empty-list walk. A contact-scope halt body that omits `contactId` still reaches that walk. Claim 14 does not specify it.
