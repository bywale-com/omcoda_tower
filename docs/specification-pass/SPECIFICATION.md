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
- `loadWriteRow` as the reader of the handle (claim 7). The earlier sentence was that several tables the product already puts on a handle come back as null. Claim 10 specifies the load for `engagement_records`, `fact_writebacks`, `meeting_booked`, and `wait_occupancy` as `WHERE id = pointer.id`. The live function still returns null for them. The generic action still pushes the contact id. `PERSON_WRITE_TABLES` still omits the three append tables, so the If does not yet split them per contact.
- `resolveFormStamp` and `onCompletionWrite` as the attribution of a completion (claim 3). They answer “newest pursuit for this person.” The live send does persist the click’s stamp. The click path does not read it back as the enrollment to advance.

**Individually reasonable, cannot work together**

- Packet 022 §2.4’s newest-enrollment detection, and packet 022 §2.5’s escalation, which inserts a second enrollment (claims 2 and 3).
- `event_write_set` naming `engagement_records` for `objective_met`, and `loadWriteRow` not loading that table (claim 7). Claim 10 specifies the load. Claim 11 specifies the handoff: `payload.writes` carries the engagement id and the enrollment id. The live function still returns null, and the live dispatch still omits `writes`. The write-set and the listener still do not meet in the running code.
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

**Form authoring.** Whether the form is its own graph node or embedded in the agent action is still open on `AUTOMATIONS-FACE.md`. Attribution assumes the derived `form_ref` once a form exists. It does not decide where the form is authored.

**What `sequence_ready.ready` is derived from.** `SYSTEMS-REQUIREMENTS-FILLED.md` §5 says the flag is derived from the verdict and consent. `executeAuditRun` sets it from the verdict alone (reachable or partial). `enrollAndActuate` in `cascade.ts` does not mention consent. The key stores the boolean the writer produced. It does not decide that derivation. Consent on the send was not walked.

**The field chip’s copied id.** The input pane copies `sample.id` onto a field chip, and `mappedWrites` filters to that id. The house If (`pickTable` / `pickField`, `supabase/migrations/015_house_notes_handle.sql`) does not. It matches `contact_id`. The key says `door1`’s emitted write id is the run id. Live `writeId` does not do that yet: with no `id` column it uses `contact_id`. A chip that has stored a sample run id will not match a later walk, whose run id is new. Retuning the pane is not the key. The person split in claim 8 does not go through the chip id. Claim 10 uses the same find: several `fact_writebacks` or `engagement_records` rows for one contact, and the first pointer wins until the chip names the row id. That is still this item. It was not retuned. Claim 11 puts an engagement pointer and an enrollment pointer on one `objective_met` firing, both with that contact’s `contact_id`. A pick that names the table selects that table (`pickWrites`). A pick that matches only on `contact_id` still takes the first. That find was not retuned.

**The listening pointer.** Claim 10 loads a row only when the pointer’s `id` is the inserted id. `wait_occupancy` already pushes that id from the walk, the due-resume, and `waitNote.ts`. The generic action is specified to push `writeEngagement`’s return. Three live fires do not push a pointer at all. `handleFactWriteback` and `handleContactSeatFacts` dispatch `fact_writebacks` with `writebackId` set to the `fwb-` id and with no `writes`. `handleMeetingBook` and `handleContactSeatMeeting` dispatch `meeting_booked` with `meetingId` set to the `mtg-` id and with no `writes`. `advanceEnrollmentCampaign` still omits the `eng-` id (claim 7). `writesFromPayload` builds pointers from `payload.writes`, an import batch id, or `contact_ids` / `contactIds`. `dispatchEventToWorkflows` spreads that payload onto the trigger and passes `contactIds` as a separate argument, so `previousWrites` is empty. Door 1’s specimen pointers already use `body.id`. They are not this firing. Claim 7 refused a channel beside the pointer. This session does not specify the three payloads. `campaign_failure` carries `campaignFailureId` the same way and was not followed.

### Revision — claim 11

The paragraph above is the gap as session 004 left it. Claim 11 specifies the three payloads. The live five dispatches still omit `writes`. `campaign_failure` was still not followed. `recordCampaignFailure` inserts `cfail-` plus a uuid and returns that id. Its dispatch was not read.

**`eligibility.changed` from a fact write.** Both fact handlers call `runContactEligibilityCascade` before they dispatch `fact_writebacks`. That cascade inserts four rows (`eval-`, `eres-`, `sig-`, `mot-`) and dispatches `eligibility.changed` with the fact scalars, `anyPass: true`, and `motion: "reactivation"`, and with no `writes`. `event_write_set` version 1 names `eligibility_evaluations`, `eligibility_results`, `signals`, and `motion_decisions`. Claim 11 leaves those rows off the fact pointer because they are the other event. How that firing places its own ids on `payload.writes` is the same shape of hole, and it was not specified. When the dispatch fires no workflow, the function enrolls `tpl.reactivation.v1`. That enroll was seen and not specified.

**Onboarding’s `audit.completed`.** `handleOnboardingFire` dispatches that event name with no `writes` and no audit-run id. The audit module’s own completion does pass `result.writes`. The onboarding payload was seen while checking that pattern. It was not specified.
