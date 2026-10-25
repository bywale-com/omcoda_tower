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

### Revision — claim 48

The sentence that `executeGet` for contacts still does not constrain `firm_id`, and that the omission was left alone because it is not this key, stands. Claim 48 constrains which contacts that node reads to the walk’s firm. The verdict pointer and the ready pointer stay this claim’s latest row for that contact and that firm. The key is not retuned.

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

### Revision — claim 17

The empty-list sentence stands as what the function does when `opts.contactIds` is empty: `writes` is an empty array, and the dispatcher’s audience branch is what puts people on the walk. Claim 17 specifies that branch. It does not add `contact_records` to this firing’s `writes`, and it does not change the four pointers.

### Revision — claim 43

The sentence that the enroll itself is not specified stands as the gap. Claim 43 specifies that enroll. The four pointers stay this firing’s `writes`. `enrollment`, `active_attempts`, and `engagement_records` stay off that array. A contact the pair would deny is not enrolled, and that absence is still not a pointer.

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

### Revision — claim 17

The sentence that a contact-scope body with no `contactId` reaches the empty-list walk stands. Claim 17 specifies that walk. The pointer on that body is still this insert’s id. The firm-book branch still does not dispatch. The contact arm of the halt gate was not decided.

### Revision — claim 18

The sentence above stands as what claim 14 left open. Claim 18 decides the contact arm of `isHaltBlockingNew`: an active contact halt blocks the enroll only when that row’s `firm_id` is the firm the enroll is stamped with. The same contact id is one `contact_records` row, so it is one firm on the book, and the pair keys on consent, verdict, and sequence-ready already keep a second firm’s state apart from the first. `consentAndHaltGate`’s contact arm and `handleHaltIsContact` still omit `firm_id`. Claim 18 does not retune them. The pointer is unchanged.

### Revision — claim 19

The sentence that those two readers omit `firm_id` stands as the live query. Claim 19 decides them. A contact halt denies the send, and makes `handleHaltIsContact` true, only when the row’s `firm_id` is the firm that caller is acting as. The pointer is unchanged.

---

## Claim 15 — A live firing of `consent_records.opt_out` places the current consent pair on `payload.writes`

**Standing:** technical decision made in this session.

The listening run’s handle is still `previousWrites`, built from `payload.writes` by `writesFromPayload` (claim 11). This table has no column named `id`. Claim 10’s `WHERE id = pointer.id` does not apply. Claim 8’s audit pair does not transfer. This claim is the array on the dispatch in `handleConsentSilence`. `writesFromPayload` gains no reader for `contactId` or `source`. `handleConsentSet` does not dispatch. That route stays the basis write the send gate reads. It is not a second copy of this array.

`handleConsentSilence` reads `contactId`, `firmId`, and `source`. It upserts `consent_records` on `(contact_id, firm_id)`:

`INSERT … (contact_id, firm_id, basis, silenced, source, updated_at) VALUES (contactId, firmId, 'none', true, source, now()) ON CONFLICT (contact_id, firm_id) DO UPDATE SET silenced = true, source = EXCLUDED.source, updated_at = now()`.

The conflict clause does not assign `basis` and does not assign `status`. A row this statement inserts stores `basis` `none` and `silenced` true. `status` takes the column default `unsequenced` (`supabase/migrations/004_machine_tables.sql`). `workspace_opted_out` takes the column default false (`supabase/migrations/020_workspace_opt_out.sql`). A conflict leaves the existing `basis`, `status`, and `workspace_opted_out`, and sets `silenced` true and `source` to this call’s source. Then it dispatches once:

`eventName: "consent_records.opt_out"`, `firmId: body.firmId`, `payload: { contactId: body.contactId, source: body.source }`, `contactIds: [body.contactId]`. There is no `writes`.

`consent_records` has `PRIMARY KEY (contact_id, firm_id)` (`supabase/migrations/003_ct_wire_stores.sql`). There is no `id` column. One contact in one firm is one row. Every writer of this table upserts that pair. A later call replaces columns on that row. It does not insert a second decision.

That is the grain the readers already use. `consentAndHaltGate` denies a send when `silenced` is true or `status` is `silenced`, and, unless `purpose` is `opt-in`, when the row is missing or `basis` is `none` (`dispatchSend.ts`). `projectSeat` reads `basis`, `silenced`, and `source` for that contact and firm (`contactSeat.ts`). `handleConsentGet` reads the same three by `contact_id`. `isWorkspaceOut` and `handleContactWorkspacesList` read `workspace_opted_out` on that pair. `docs/register/how/contact-silence.md` says the Silence commit writes silenced state that runners, send gates, and Book readiness read. `docs/register/how/contact-consent.md` says Agree writes consented state and Ignore writes the no-deeper state, both read by runners. `docs/register/SYSTEMS-STORY.md` §6 treats a contact as sequenced, silenced, or unsequenced. Those are states of the contact at the firm. They are not a log of decisions. The specimen body has no `id` (`supabase/migrations/017_event_test_contract.sql`, `etd-consent-haddad`).

Claim 8 split the audit tables because a later audit must not erase what an earlier run wrote, and the desk still asks who is ready now. Those are two questions the product already asks, and the old upsert answered only the second. Consent’s readers ask for the current row. A later write to the same pair is an update of that state. A listening run that already holds this firing’s pointer re-reads the same pair and sees the later columns, the way claim 14’s re-read sees `lifted_at`. A history of consent decisions would be a second stored fact. This claim does not add a table and does not add an `id` column. No migration.

`event_write_set` version 1 names `consent_records` alone, at ord 0. The dispatch payload gains

`writes: [{ table: "consent_records", id: <body.contactId>, contact_id: <body.contactId> }]`.

That is the only element. `writesFromPayload` drops an element with no string `id`. This table has no other column to put there. The person half of the primary key is `contact_id`. The firm half is the walk’s firm. `handleConsentSilence` passes `firmId: body.firmId`, which is the firm the upsert wrote. `dispatchEventToWorkflows` inserts `workflow_run.firm_id` as that `opts.firmId` and walks with the same firm. `loadWriteRow` already receives that firm as its `firmId` argument. `RunWrite` has no `firm_id` field. Claim 10 left firm off the pointer for tables whose primary key is `id`. Here firm is half the key, and it is already the walk. The pointer’s `id` and `contact_id` are both the contact. Both are required. They are the same string.

`consent_records` is not in `PERSON_WRITE_TABLES`. This firing has one pointer and it carries `contact_id`. `personIdsFromWrites` uses that field. This claim does not add the table to the set.

The keys already on the payload stay: `contactId` and `source`. `contactIds` stays that one contact.

**Who hears it.** The primitives table names “Someone opted out / unsubscribed” with Global “all of those” and Local “—” (`docs/register/PRIMITIVES.md`). There is no instance axis. The A26 row is firm and contact (`TRIGGER_SELECT_EVENTS` in `src/app/data/automationTriggerSelect.ts`). The contact control stores `localContactIds`. It does not store `localRef` (`TriggerSelectModal.tsx`). `localAxesMatch` compares `local_contact_ids` to `payload.contactId`, which this dispatch already sends, and falls back to `opts.firmId` for the firm. `localRefFromPayload("consent_records.opt_out")` and `triggerLocalRefFromPayload` return `contact_id` or `contactId`. The compare against `local_ref` runs only when `local_ref` is set. The product face for this event does not set it. A stored `local_ref` matches when it equals this contact id. This claim does not add a payload key and does not remove the case. `WORKFLOW_EVENTS_WITH_LOCAL` does not include `consent_records.opt_out`. `consent_records.sequenced` is in that set and in the Hub catalog. It is not on the A26 list, it is not in `event_write_set`, and no handler dispatches it. This claim does not add that firing.

`dispatchEventToWorkflows` copies the payload onto the trigger and still sets `anyPass: true`. `writes` has to be on the object passed in. Claim 7’s refusal of `anyPass` is not recut.

`loadWriteRow` has no branch for `consent_records` and returns null. The re-read for this pointer is `SELECT * FROM consent_records WHERE contact_id = pointer.contact_id AND firm_id = <the walk’s firm>`. No `ORDER BY`. No “latest”. No `silenced` filter. A miss returns null. The loader does not drop `firm_id`, and it does not look for a column named `id`. On this firing `pointer.contact_id` and `pointer.id` are the same contact. The predicate uses `contact_id` and the walk firm, which together are the primary key. This claim does not retune the function. It does not revise claim 10’s predicate. It does not revise claim 8’s `(audit_run_id, contact_id)` load.

A later node reads `basis`, `silenced`, `source`, `status`, `workspace_opted_out`, and `updated_at` from that row. On an insert from this firing, `basis` is `none`, `silenced` is true, `source` is the body’s source, `status` is `unsequenced`, and `workspace_opted_out` is false. On a conflict, `silenced` is true, `source` is this call’s source, and `basis`, `status`, and `workspace_opted_out` are whatever the row already held. Those columns are not added to the dispatch. The specimen also carries `contact_name` and `firm`. The upsert does not store those keys. This claim does not enrich the row and does not retune door 1.

Door 1 for this event is the newest ten `consent_records` rows for the firm with `silenced` true, ordered by `updated_at` (`eventTest.ts`). `writeId` uses `body.contact_id` when `body.id` is absent. The version 1 body is one row, Haddad, source `unsubscribe.email`, and it has no `id`. Those rows are the specimen reader. This firing has this contact and this firm in hand. The ten rows are not this firing’s cardinality.

The HTTP body is `{ ok: true }`. The dispatch does not receive a row. The statement does not use `RETURNING`. The pair is the body’s `contactId` and `firmId`. The in-memory stand-in `silence` records the flag and does not call the dispatcher (`src/app/wire/standins/consentSilence.ts`). This firing is the server handler.

**`handleConsentSet` does not start this listener.** `POST /consent` upserts the same primary key. A new row stores `basis` as express, implied, or none, and `silenced` false. On conflict it updates `basis`, keeps `source` when the body omits it (`COALESCE`), updates `updated_at`, and leaves `silenced` as it was. It returns `{ ok: true }`. It does not call `dispatchEventToWorkflows`. `handleContactSeatConsent` upserts the same pair, sets `basis` from Agree or Ignore, sets `silenced` false, and does not dispatch. There is no `event_write_set` for a basis write. The event the primitives table and the A26 list name is opted out / unsubscribed. The send gate reads `basis` before it will send, unless the purpose is `opt-in`. That read does not need a listening run. Dispatching `consent_records.opt_out` from Agree would start this listener on a consent. The handler already withholds the call. This claim does not add it.

**Rows and writers that this array does not carry.**

`handleContactSeatSilence` sets `workspace_opted_out` true on the same pair and does not set `silenced` and does not dispatch. Migration 020 calls that flag a field, not email silence. A listening run that already holds this firing’s pointer and later re-reads the pair sees the flag. That seat call is not this firing. This claim does not place a pointer on it.

The hard-bounce branch in `webhooks.ts` upserts the same pair with `silenced` true and `source` `hard-bounce`, and it does not dispatch. The event class is `bounce_hard`. The primitives row is opt-out / unsubscribe. A bounce updates the current row the gate reads. It does not start this listener. If a bounce lands on the pair this firing already pointed at, the re-read sees `source` `hard-bounce` and `silenced` true. This claim does not add a bounce dispatch.

`consentAndHaltGate` selects `consent_records` with `WHERE contact_id = $1 LIMIT 1`. It does not constrain `firm_id`. The handle’s predicate is the primary key, contact and the walk’s firm. Whether one contact id can exist in two firms was not investigated. That gate is not this pointer.

The silence statement’s refusal to assign `status` is not this pointer. The story’s three-way word sits on `status`. The handler this event is wired to writes `silenced`. The gate denies when either is set. A branch that reads `status` on a row this firing inserted sees `unsequenced` while `silenced` is true. This claim names the row. It does not retune the `UPDATE`.

**Rejected alternatives.**

- Point at a new `id` the way `campaign_failure` points at `cfail-`. This table has no `id` column. The primary key is the pair. A surrogate would be a new column, and a decision log would be a new grain. The writers upsert. The readers read the current row. Claim 8 refused a surrogate on the audit tables because the pointer already had two fields and a column named `id` would become the specimen identity. This specimen has no `id`. `writeId` already uses `contact_id`. No migration.

- Change the primary key to a history of decisions, and put that decision’s id in the pointer, leaving “current consent” as a latest-row read. That is the audit split. Consent does not have a reader that asks what an earlier opt-out wrote after a later write to the same pair. The silence leaf, the consent leaf, the send gate, the seat projection, and the story’s sequenced / silenced / unsequenced words ask for the current state. A later update of this pair is the state. The re-read has to see it. A second table would be a shadow copy. Claim 8 refused that. The CASL regime silence in `SYSTEMS-STORY.md` §6 (geography, firm→client and the first agent→consultant text) is not a choice this pointer needs. The pair is named without it.

- Put `firm_id` in `pointer.id` and keep the contact in `contact_id`. The walk’s firm is already `body.firmId`. Claim 10 and claim 11 left firm off the pointer. Using the `id` slot for the firm would make `id` a firm, while `writeId` for this specimen is the contact and the contact axis compares the contact. The half of the key that is not already the walk is the contact.

- Encode `contactId` and `firmId` into one string. Claim 8 refused an encoding. `writesFromPayload` keeps `table`, `id`, and `contact_id`. The firm is the walk. The loader would have to parse a private format.

- Teach `writesFromPayload` to map `contactId` onto `consent_records` when `writes` is absent. Claim 7 refused a second channel. The function already returns when `writes` is an array, and the contact-list fallback builds `contact_records`, not this table. The caller holds the contact the upsert used.

- Leave the row off the handle and let the If read `contactId` and `source` on `triggerPayload`. Rejected under claim 7. The established pick is `mappedWrites` and `loadWriteField`.

- Have the listener select the newest silenced row for the firm, or any silenced row for the contact. Door 1’s ten rows are the specimen. The gate’s `LIMIT 1` is the send check. Two contacts are two pairs. This firing has this pair in hand. “Latest” is the guess claim 7 and claim 8 already refused, and this key has only one row to find.

- Load by `contact_id` alone, copying the send gate. The primary key includes `firm_id`. The walk has that firm. Dropping it would read some other firm’s row when the contact id is not unique to the firm. That uniqueness was not investigated. The pointer does not inherit the gate’s predicate.

- Load with `silenced = true`, or require `status = 'silenced'`. A later writer can clear `silenced` (`handleContactSeatConsent` sets it false) or leave `status` unmoved. The re-read has to see the current columns. Door 1’s silenced filter is the specimen.

- Dispatch `handleConsentSet`, or the seat Agree / Ignore, as `consent_records.opt_out`. The named event is the opt-out. The basis write is what the gate reads before a send. Agree sets `silenced` false. Starting this listener there would treat a consent as an unsubscribe. The handlers already omit the call.

- Add the hard-bounce upsert, or the workspace opt-out, as a second element or a second firing of this event. The write-set is this opt-out dispatch. The bounce does not call it. The workspace flag is a different column, and migration 020 separates it from email silence. The shared pair is why a later re-read can see those columns. It is not why those writers become this dispatch.

- Add `contact_records` because `contactIds` is passed beside the payload. The write-set does not name that table. The separate argument is the person list. With `writes` present, the contact fallback does not run.

- Add `consent_records` to `PERSON_WRITE_TABLES`. This firing has one pointer and it carries `contact_id`. The set was not required to name the person.

- Drop `contactId` and `source` once `writes` exists. `contactId` is the contact-axis key, and it is what `localRefFromPayload` returns when `local_ref` is set. `source` is already on the payload. Claim 11 kept scalars that are not the handle. The two stay.

- Add `basis`, `status`, `firmId`, or the specimen’s `contact_name` as new root scalars. The firm compare already uses `opts.firmId`. The other fields are columns on the row, or display keys the upsert does not store.

- Copy the row onto the pointer. `writesFromPayload` keeps `table`, `id`, and `contact_id`. `loadWriteField` re-reads. Claim 8 rejected the snapshot. A second opt-out replaces `source` on the row. This run’s payload still has the source this call passed. The If reads the row.

- Require `INSERT … RETURNING` as a different product result. The statement returns no id. The identity is the pair the body already passed, and the conflict updates that same pair.

- Retune `status` inside this claim so the inserted row’s `status` is `silenced`. The pointer names the row either way. The handler already writes the boolean the silence leaf and the gate’s first arm read. Changing `status` is a different write.

No founder question. The If reads a field of the consent row this opt-out upserted for this contact at this firm. The write-set chose the table. The primary key chose the pair. The walk already holds the firm, so the pointer’s `id` is the contact, and `contact_id` is the same contact. A basis write, a workspace opt-out, and a hard bounce stay off this dispatch. A listener that is already subscribed starts from this pair, and a later update of that pair is visible on the re-read.

**Evidence:** `stores.ts` `handleConsentSilence`, `handleConsentSet`, `handleConsentGet`. `routes.ts` `POST /consent`, `POST /consent/silence`. `dispatchSend.ts` `consentAndHaltGate`. `contactSeat.ts` `projectSeat`, `handleContactSeatConsent`, `handleContactSeatSilence`, `isWorkspaceOut`, `handleContactWorkspacesList`. `webhooks.ts` the `bounce_hard` upsert. `runWrites.ts` `writesFromPayload`, `RunWrite`. `workflowWalk.ts` `localRefFromPayload`, `localAxesMatch`, `dispatchEventToWorkflows`, `loadWriteRow`, `PERSON_WRITE_TABLES`, `personIdsFromWrites`. `eventTest.ts` `door1`, `writeId`. `src/app/data/automationTriggerSelect.ts` `TRIGGER_SELECT_EVENTS`, `triggerLocalRefFromPayload`. `src/app/data/automationWorkflows.ts` `WORKFLOW_EVENTS_WITH_LOCAL`, `WORKFLOW_EVENT_CATALOG`. `TriggerSelectModal.tsx`. `src/app/wire/standins/consentSilence.ts`. `supabase/migrations/003_ct_wire_stores.sql`. `supabase/migrations/004_machine_tables.sql`. `supabase/migrations/017_event_test_contract.sql`. `supabase/migrations/020_workspace_opt_out.sql`. `docs/register/PRIMITIVES.md`. `docs/register/how/contact-silence.md`. `docs/register/how/contact-consent.md`. `docs/register/SYSTEMS-STORY.md` §6. `origin/pr-96:docs/register/TRIGGER-SELECT-PACKET.md`.

**Live.** The silence dispatch is still `{ contactId, source }` with no `writes`. `previousWrites` for that event is still empty when a listener starts. `loadWriteRow` still returns null for `consent_records`. `handleConsentSet` still does not dispatch. The primary key is still `(contact_id, firm_id)`. No migration was written.

### Revision — claim 25

The sentence that this statement does not assign `status`, and that a branch reading `status` on an insert sees `unsequenced` while `silenced` is true, stands. Claim 25 specifies that write. The default on insert and the previous `status` on conflict stand. The boolean arm still denies. This revision does not retune the pointer.

### Revision — claim 26

The rejected alternative that a later writer can leave `status` unmoved described the live seat SQL. Claim 26 specifies that conflict. When the stored value is `silenced`, the seat consent sets `unsequenced`. The re-read still sees the current columns. This revision does not retune the pointer.

### Revision — claim 27

The sentence that `consent_records.sequenced` is in the Hub catalog and in `WORKFLOW_EVENTS_WITH_LOCAL`, is not on the A26 list, is not in `event_write_set`, and has no handler, stands. Claim 27 specifies that name. The absence of a dispatch, and the absence of an ongoing writer of `waitlisted` and `sequenced`, is the specification of the event. This revision does not add the firing and does not retune the opt-out pointer.

---

## Claim 16 — A live firing of `ct_firms` places the current firm id on `payload.writes`

**Standing:** technical decision made in this session.

The listening run’s handle is still `previousWrites`, built from `payload.writes` by `writesFromPayload` (claim 11). `ct_firms` has `id TEXT PRIMARY KEY`. That is the whole key. Claim 10’s `WHERE id = pointer.id` is the re-read. Claim 15’s pair does not transfer: that table has no `id` column, and both pointer fields there are the contact because the firm half is only the walk. This claim is the array on the dispatch in `handleMachineProvision`. `writesFromPayload` gains no reader for `firmId`, `firmName`, or `email`.

`handleMachineProvision` reads `firmId`, `firmName`, `email`, and optional `website` and `role`. `firm` is `body.firmId` trimmed, or `randomUUID()` when the body omits it. The comment on the handler says that one id binds auth, CT, and the machine: `session.firm_id`, `ct_firms.id`, and the machine firm id are the same string. It upserts `ct_firms`:

`INSERT INTO ct_firms (id, name, posture, updated_at) VALUES (firm, firmName, 'Idle', now()) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = now()`.

The conflict clause assigns `name` and `updated_at`. It does not assign `posture`, `pool_slug`, `pool_domain`, or `sending_identity_id`. A row this statement inserts stores `name` as this call’s `firmName` and `posture` `Idle`. The pool columns stay null. `created_at` takes the column default. A conflict replaces `name` and `updated_at` and leaves `posture` and the pool columns as they were. Then it dispatches once:

`eventName: "ct_firms"`, `firmId: firm`, `payload: { firmId: firm, firmName, email }`. There is no `writes`. There is no `contactIds` argument.

`ct_firms` is declared in `supabase/migrations/003_ct_wire_stores.sql`. The primary key is `id`. The columns are `id`, `name`, `posture` (check `Idle`, `Armed`, `Active`, default `Idle`), `pool_slug`, `pool_domain`, `sending_identity_id`, `created_at`, `updated_at`. There is no `contact_id`. One id is one row. A later provision that passes the same id updates that row. A call that omits `firmId` mints a new id and inserts a new row. Neither path inserts a second row for an id that already exists.

That is the grain the readers already use. Door 1 for this event is `SELECT * FROM ct_firms WHERE id = $1 LIMIT 1` with the session firm (`eventTest.ts`). `executeGet` for module `firms` returns `{ table: "ct_firms", id }` and does not set `contact_id` (`workflowWalk.ts`). The client preview does the same (`previewGetWrites` in `src/app/data/automationGet.ts`). `projectSeat` reads `id, name` from `ct_firms` by that id. `operatorPanes.ts` checks the row by id. None of those queries read an earlier provision after a later update of the same id.

`docs/register/PRIMITIVES.md` names the event “A firm was created / provisioned,” Global “All new firms,” Local “—”. It calls a person-row the split and a run-row the artifact, and it says the next step points at the writes this run made. The same page says a firm that was created is already there, and the listener then does the inside. The firm row is that artifact. `docs/register/how/operator-provision.md` says the Provision commit writes tenancy and user state that Login OTP reads. That is the current firm, not a log of earlier names.

Claim 8 split the audit tables because a later audit must not erase what an earlier run wrote, and the desk still asks who is ready now. Those are two questions, and the old upsert answered only the second. The firm readers ask for the current row of this id. A later provision of the same id is that row changing. A listening run that already holds this firing’s pointer re-reads the same id and sees the later `name`, the way claim 14’s re-read sees `lifted_at` and claim 15’s re-read sees a later `source`. A history of firm rows would be a second stored fact. The chronology the product already appends is `audit_events`, and `appendFirmAudit` says that append is history, not a second boolean. `event_write_set` does not name `audit_events`. This claim does not add a table and does not add a column. No migration.

`event_write_set` version 1 names `ct_firms` alone, at ord 0 (`supabase/migrations/017_event_test_contract.sql`). The dispatch payload gains

`writes: [{ table: "ct_firms", id: <firm> }]`.

That is the only element. `writesFromPayload` drops an element with no string `id`. This id is the primary key the upsert wrote. The element does not carry `contact_id`. There is no person on the row. `RunWrite.contact_id` is optional. When the field is absent, `writesFromPayload` stores null. `personIdsFromWrites` uses `contact_id` when it is set, and otherwise uses `id` only for tables in `PERSON_WRITE_TABLES`. `ct_firms` is not in that set. This firing’s pointer contributes no person. This claim does not add the table to the set. Adding it would make `personIdsFromWrites` treat the firm id as a contact whenever `contact_id` is null.

The walk’s firm is the same string. `handleMachineProvision` passes `firmId: firm`, and `dispatchEventToWorkflows` stores that value on `workflow_run.firm_id`. Claim 15 put the contact in `pointer.id` because the consent key is a pair, the table has no `id` column, and the firm half is already the walk. Here the key is `id`, the column exists, and the column is the firm. The pointer carries that id. The walk storing the same string does not remove the element. `executeGet` already points at firm rows by `ct_firms.id` inside a walk whose firm may be a different id when the Get is “every.” The load that claim 10 already states uses `pointer.id`. This firing does not invent a second predicate that substitutes the walk’s firm.

The keys already on the payload stay: `firmId`, `firmName`, and `email`. `firmId` is the firm-axis key. `firmName` is the name this call wrote. `email` is the address this call passed. It is not a column of `ct_firms`.

**Who hears it.** The primitives table gives this event no Local instance. The A26 row is firm only (`TRIGGER_SELECT_EVENTS` in `src/app/data/automationTriggerSelect.ts`). There is no contact layer and no instance layer. `TriggerSelectModal.tsx`, when the operator selects a firm on this event, stores that firm id in both `localFirmId` and `localRef`. Choosing “Every firm” clears `localRef` for this event. `localAxesMatch` compares `local_firm_id` to `payload.firmId` or, when that key is absent, to `opts.firmId`. This dispatch sends both, and they are the same id. `localRefFromPayload("ct_firms")` and `triggerLocalRefFromPayload` return `id`, `firm_id`, or `firmId`. The compare against `local_ref` runs only when `local_ref` is set. The root `firmId` already equals the firm the modal stored. This claim does not add a payload key and does not remove the case. `WORKFLOW_EVENTS_WITH_LOCAL` includes `ct_firms` because that modal writes `localRef`. That slot holds the selected firm. It is not a second axis beside the firm.

`dispatchEventToWorkflows` copies the payload onto the trigger and still sets `anyPass: true`. `writes` has to be on the object passed in. Claim 7’s refusal of `anyPass` is not recut. With `writes` present, the function does not build a `contact_records` pointer. This payload has no contact list inside it.

`loadWriteRow` has no branch for `ct_firms` and returns null. The re-read for this pointer is `SELECT * FROM ct_firms WHERE id = pointer.id`. No firm predicate. No contact predicate. No `ORDER BY`. No “latest”. No `posture` filter. A miss returns null. The loader does not substitute the walk’s firm, and it does not fall through to `firms`. On this firing `pointer.id` and the walk’s firm are the same string. The predicate uses the pointer. This claim does not retune the function. It does not revise claim 10’s predicate. It does not revise claim 15’s pair. It applies the id predicate claim 10 already stated for a table whose primary key is `id`.

A later node reads `name`, `posture`, `pool_slug`, `pool_domain`, `sending_identity_id`, `created_at`, and `updated_at` from that row. On an insert from this firing, `name` is `firmName`, `posture` is `Idle`, and the three pool columns are null. On a conflict, `name` is this call’s `firmName`, `updated_at` is now, and `posture` and the pool columns are whatever the row already held. Those columns are not added to the dispatch. The specimen body (`etd-ct_firms-harbor`) also carries `consultant_name` and `consultant_email`, and its `posture` is `Armed`. The upsert does not store the consultant keys. This claim does not enrich the row and does not retune door 1. `writeId` uses `body.id` when it is present. The specimen’s `id` is `firm-standin-harbor`. This firing’s `id` is the uuid string the handler upserted. Both are the `id` column. Door 1’s one row is the specimen reader. This firing has this id in hand.

The HTTP body returns `firmId`, `firmName`, `email`, `website`, `role`, `ctFirm`, `authUser`, `campaignState`, `loginPath`, `accessPath`, `bound`, and `workflowsFired`. The dispatch does not receive that body. The `ct_firms` statement does not use `RETURNING`. The id is the `firm` variable the handler already bound. `website` and `role` are echoed on that HTTP body. This handler does not insert them.

**Rows and writers that this array does not carry.**

The same handler, before the dispatch, also writes `firms` (`INSERT … ON CONFLICT (id) DO UPDATE SET name`), `campaign_states` (state `armed-for-activation` on insert and again on conflict), and `users` (insert `(firm_id, email)`, or `UPDATE users SET firm_id` when the email already exists). When that user insert or update yields an id, it calls `mintAccessLink`, which inserts `access_links`. After the dispatch, `appendFirmAudit` inserts `audit_events` with kind `firm.provisioned`, subject the firm, and payload `{ firmName, email }`. `event_write_set` names none of those tables. The auth user block is in a try/catch. A failure there still reaches the `ct_firms` dispatch. The firm pointer does not depend on the user row. Login’s tenancy read is the how-leaf. It is not this listener. This claim does not place those rows on `writes`.

`handlePoolAllocate` upserts the same `ct_firms` id and sets `pool_slug`, `pool_domain`, `sending_identity_id`, and `updated_at`. It does not assign `posture`. It does not call `dispatchEventToWorkflows`. It also upserts `sending_domains` and appends an audit of kind `domain.allocated`. A listening run that already holds this firing’s pointer and later re-reads the id sees the pool columns. That allocate call is not this firing. This claim does not place a pointer on it. Seed inserts in `supabase/seeds/002_machine_tables.sql` and `supabase/migrations/013_operator_book_people.sql` set `posture` and, on their own conflict clauses, assign `posture`. They are not this dispatch. No handler under `server/wire-service` assigns `ct_firms.posture` after the provision insert. This claim does not retune the provision `UPDATE`.

`projectSeat`’s firm read is `ct_firms` by id, unioned with `firms` by the same text, `LIMIT 1`. The union is how the seat finds a display name. The handle’s predicate is `ct_firms.id` alone. A miss on `ct_firms` returns null. It does not load `firms`.

This dispatch does not pass `contactIds`. `dispatchEventToWorkflows`, for an every-firm audience with no contact ids, selects every `contact_records` id for the firm and walks those contacts. A `select_from` audience uses the workflow’s own list and skips the workflow when that list yields none. The firm pointer has no `contact_id`, so this firing does not supply a person for that fill to copy. Claim 12 recorded the every-firm fill for an empty eligibility list. Claim 14 recorded that a contact-scope halt body with no `contactId` reaches the same branch. Neither specified it. This claim does not specify it. The person list is not an element of `writes`.

**Rejected alternatives.**

- Put the contact id in both pointer fields, as claim 15 does for `consent_records`. That table has no `id` column, and its key is `(contact_id, firm_id)`. `ct_firms` has `id`, and that column is the whole key. There is no contact on the row. Copying the pair would invent a person.

- Put the firm id in `contact_id` as well as in `id`. `contact_id` is the person on every prior pointer. `personIdsFromWrites` returns `contact_id` whenever it is a string, before it consults `PERSON_WRITE_TABLES`. A firm id in that field would split the walk on a firm. The Get pointers for this table already omit `contact_id`.

- Omit the pointer and let the listener treat the walk’s `firm_id` as the row. Rejected under claim 7. The established pick is `mappedWrites` and `loadWriteField`. The walk’s firm is which tenancy the run is in. The pointer names the row. On this firing they are the same string. A firms Get of every firm already emits ids that are not that substitution.

- Load `WHERE id = <the walk’s firm>` instead of `WHERE id = pointer.id`. Claim 10’s id loads use the pointer. Door 1 uses the session firm because the specimen reader is the firm the tester is in. This firing has the upserted id in hand. Substituting the walk would make a pointer at another firm id, which `executeGet` already produces, load the walk’s firm instead.

- Change the primary key to one row per provision, and put that provision’s id in the pointer, leaving “the firm now” as a latest-row read. That is the audit split. The firm readers, the Get, door 1, and the primitives’ “the firm is already there” ask for the current row of this id. A later update of this id is the firm. The re-read has to see it. `appendFirmAudit` is the history, on `audit_events`, and the write-set does not name it. A second `ct_firms` row for one id would break the primary key the handler upserts. No migration.

- Point at `firms`, `campaign_states`, `users`, `access_links`, or `audit_events` because this handler writes them in the same request. The write-set names `ct_firms` alone. The same refusal covers the meeting side row (claim 11), the eligibility enroll (claim 12), and the halt audit (claim 14). `email` stays on the payload because the firm row does not store it. The user row is not the handle.

- Teach `writesFromPayload` to map `firmId` onto `ct_firms` when `writes` is absent. Claim 7 refused a second channel. The function already returns when `writes` is an array. The fallback builds `import_batch` and `contact_records`, not this table. The caller holds the id the upsert used.

- Leave the row off the handle and let the If read `firmId`, `firmName`, and `email` on `triggerPayload`. Rejected under claim 7. `firmName` on this run’s payload stays the string this call passed. A later provision replaces `name` on the row. The If reads the row.

- Have the listener select the only firm for the walk, or the newest `ct_firms` row. This firing has the id. Door 1 is already one row by id. “Latest” is the guess claim 7 and claim 8 already refused. Two ids are two firms.

- Load with `posture = 'Idle'`, or retune the conflict clause so a later provision sets `posture` back to `Idle`. The conflict clause already leaves `posture`. A seed or a later writer can hold `Armed` or `Active`. The re-read has to see the current column. Changing the `UPDATE` is a different write. The `campaign_states` statement in this same handler does reset `state` to `armed-for-activation` on conflict. That table is not the pointer.

- Dispatch `handlePoolAllocate` as `ct_firms`, or add `sending_domains` as a second element. The write-set is this provision dispatch. The allocate handler does not call it. The shared id is why a later re-read can see pool columns. It is not why allocate becomes this dispatch.

- Add `contact_records` because the dispatcher may fill a book after this call returns. Those rows are not writes of this firing. The write-set does not name that table. The fill is the separate `contactIds` argument, and this call does not pass one. With `writes` present, the contact fallback does not run.

- Add `ct_firms` to `PERSON_WRITE_TABLES`. The primitives call this row the artifact. The Get already emits it without a person. The set would turn the firm id into a contact.

- Drop `firmId` once `writes` exists. It is the firm-axis key, and it is what `localRefFromPayload` returns when `local_ref` is set. The modal stores the selected firm in that slot. Claim 13 had to add `campaign_id` because the dispatch omitted the key the matcher reads. This dispatch already sends `firmId`.

- Drop `firmName` or `email`. Both are already on the payload. `email` is not on the row, so the payload is the only place this firing carries it. Claim 11 kept scalars that are not the handle.

- Add `posture`, `website`, `role`, or the specimen’s `consultant_email` as new root scalars. `posture` is a column on the row. `website` and `role` are not stored by this handler. The specimen’s consultant keys are not stored.

- Copy the row onto the pointer. `writesFromPayload` keeps `table`, `id`, and `contact_id`. `loadWriteField` re-reads. Claim 8 rejected the snapshot. A second provision of this id replaces `name`. This run’s payload still has this call’s `firmName`. The If reads the row.

- Require `INSERT … RETURNING` as a different product result. The statement returns no id. The identity is the `firm` string the handler already used as the primary key.

- Filter the re-read through `projectSeat`’s union with `firms`. The write-set names `ct_firms`. A missing CT row is a miss. The auth row is a different table this array does not carry.

No founder question. The If reads a field of the firm row this provision upserted. The write-set chose the table. The primary key chose `id`. That id is the firm, so the pointer carries it and does not carry a person. Claim 15’s pair stays on the consent table, which has no `id` column. A later provision of the same id, and a later pool allocation of the same id, are visible on the re-read. The auth firm, the user, the campaign state, the access link, and the audit append stay off this dispatch. The person list the dispatcher builds when `contactIds` is omitted stays unspecified.

**Evidence:** `machine.ts` `handleMachineProvision`. `pool.ts` `handlePoolAllocate`. `stores.ts` `appendFirmAudit`. `auth-service/accessLinks.ts` `mintAccessLink`. `runWrites.ts` `writesFromPayload`, `RunWrite`. `workflowWalk.ts` `executeGet`, `localRefFromPayload`, `localAxesMatch`, `dispatchEventToWorkflows`, `loadWriteRow`, `PERSON_WRITE_TABLES`, `personIdsFromWrites`. `eventTest.ts` `door1`, `writeId`, `toWrites`. `contactSeat.ts` `projectSeat`. `operatorPanes.ts`. `src/app/data/automationGet.ts` `previewGetWrites`. `src/app/data/automationTriggerSelect.ts` `TRIGGER_SELECT_EVENTS`, `triggerLocalRefFromPayload`. `src/app/data/automationWorkflows.ts` `WORKFLOW_EVENTS_WITH_LOCAL`. `TriggerSelectModal.tsx`. `supabase/migrations/001_auth_tables.sql` (`firms`, `users`). `supabase/migrations/003_ct_wire_stores.sql` (`ct_firms`). `supabase/migrations/004_machine_tables.sql` (`campaign_states`). `supabase/migrations/017_event_test_contract.sql`. `supabase/seeds/002_machine_tables.sql`. `supabase/migrations/013_operator_book_people.sql`. `docs/register/PRIMITIVES.md`. `docs/register/how/operator-provision.md`.

**Live.** The provision dispatch is still `{ firmId, firmName, email }` with no `writes` and no `contactIds`. `previousWrites` for that event is still empty when a listener starts. `loadWriteRow` still returns null for `ct_firms`. The primary key is still `id`. No migration was written.

### Revision — claim 17

The sentences that this dispatch passes no `contactIds`, and that the dispatcher then fills a person list, stand as a description of the live call. Claim 17 specifies that fill. It does not add `contact_records` to this array, and it does not put a person on this pointer.

---

## Claim 17 — A firing that passes no contact ids walks that automation’s audience inside the firing firm

**Standing:** technical decision made in this session.

The listening run’s handle stays `previousWrites` (claim 11). Claim 16’s `ct_firms` pointer stays one element, the firm id, with no `contact_id`. This claim is the person list on the walk when `dispatchEventToWorkflows` is called with no `contactIds`. That is an omitted argument or an empty array. `handleMachineProvision` omits it. `runContactEligibilityCascade` passes `opts.contactIds`, which is empty when the loop inserted nothing. `handleHaltCommit` omits it when a contact-scope body has no `contactId`. One branch covers all three. The branch does not read the event name.

The audience is who the automation applies to. It is stored on `workflow`, and it does not start a mission when it is saved. `handleWorkflowCreate` writes `audience_scope` and `audience_contact_ids`. The Automations Add-contact footer is “Who this automation applies to. It does not start a mission now.” `docs/register/PRIMITIVES.md` names the same action: contacts on the automation, and it does not start a mission now. `docs/register/AUTOMATIONS-FACE.md` law 31 puts that scope on events, and says the event does not start a mission now. The founder’s provision example is this firing: a firm was just created, then run an audit on the contacts, then a condition, then agents. `PRIMITIVES.md` states the same pattern: the firm is already there, and the listener does the inside (audit, agents).

`ct_firms` cannot supply those contacts. The call passes no `contactIds`. The pointer has no `contact_id`. `ct_firms` is not in `PERSON_WRITE_TABLES`. `personIdsFromWrites` therefore contributes nobody. `walkValidatedWorkflow` replaces an empty `contactIds` from `personIdsFromWrites` only. It does not query `contact_records`. The only list left is the audience, resolved in `dispatchEventToWorkflows` after `localAxesMatch` and before the run is inserted.

**The branch.** `localAxesMatch` reads the firing’s own `contactIds` and the payload’s `contactId`. It does not read the list this branch is about to build. A trigger with `local_contact_ids` set does not match a firing that named no person. That workflow does not start, and it does not receive the audience. The audience is not a way through the contact axis.

For a workflow that matched, `audience_scope` comes from `workflow`, not from `workflow_trigger.scope`. The trigger insert in `materializeTriggersFromGraph` stores `scope` `every_firm` and an empty `scope_contact_ids`. The dispatcher does not read those columns. `select_from` is the only scope that narrows. Null and every other value are `every_firm`, which is also the column default (`supabase/migrations/012_grain_audience_one_timer.sql`).

When the firing passed no contact ids:

- `select_from`. The people are the stored `audience_contact_ids` that are `contact_records` rows with `firm_id` equal to the firing firm (`opts.firmId`, the firm stored on `workflow_run`). An id with no such row is not a person on this run. When none remain, the workflow does not start. There is no `workflow_run`.
- `every_firm`. The people are every `contact_records.id` with `firm_id` equal to that same firing firm. The statement that does this today has no `ORDER BY`. This claim does not add one. An empty book is an empty list, and the run still starts.

When the firing passed a non-empty list, this claim leaves the other arm as it is. `every_firm` walks that list and does not query the book. `select_from` walks the intersection with `audience_contact_ids` and does not start when the intersection is empty. This claim does not add a firm predicate to that arm. The firing already named the people.

The list is the `contactIds` argument of `walkValidatedWorkflow`. It becomes `ctx.contactIds`. It is not copied onto `triggerPayload`. `writesFromPayload` reads `payload.writes`, then `import_batch_id`, then `contact_ids` / `contactIds` on the payload. It does not read the walk argument. With claim 16’s `writes` present, the contact fallback does not run. The book is not an element of `writes`, and it is not a `contact_records` pointer beside `ct_firms`. `call_agent` enrolls each id in `ctx.contactIds` under `opts.firmId` and passes `fireFirstStep: true`. `ascribe_tag`, when it has no chip and no `pickTable`, tags that same list. `contactsForAudit` uses `ctx.contactIds` when the list is non-empty, and its query also requires `firm_id` of the walk. A firm-row If does not split the list: `ct_firms` has no `contact_id` and is not a person table, so `evalIfPick` takes one branch and leaves `ctx.contactIds` as it was.

**Why the list is this firm’s contacts.** The run is one firm. `dispatchEventToWorkflows` inserts `workflow_run.firm_id` as `opts.firmId`. The inside the primitives name is the inside of the firm that was just provisioned. The every-firm arm already queries `WHERE firm_id = opts.firmId`. `contactsForAudit` uses the same predicate. `call_agent` passes that firm into `enrollAndActuate`. A contact of another firm on this run would be enrolled, and the first step asked, under the firing firm.

The Add-contact picker is a different read. `handleContactRecordsList` with `scope=every_firm` is the operator book, no firm predicate, and the modal is firms first. Every firm on that modal means “All contacts, every firm.” Select from stores the ids the operator left checked, and those ids may belong to several firms. `handleWorkflowCreate` stores that array as given. This claim does not change the save. The stored list remains who the automation applies to. Each firing resolves the subset whose `contact_records.firm_id` is the firing firm. A later firing of another firm resolves again. Agents’ Every firm is the other door: `handleSequenceEnrollContacts` selects every `contact_records` row with no firm predicate and enrolls each under `row.firm_id`, and the footer says that starts the mission now. A listening run has one `firmId`. It cannot repeat that per-contact firm. The helper sentence is the picker. It is not a second firm on `workflow_run`.

**Why an empty every-firm book still starts.** The firm row is the handle. A first provision mints an id and inserts no `contact_records`. There is nobody to audit yet. `contactsForAudit` returns no rows when `ctx.contactIds` is empty and the writes include no `contact_records`. The run is how the listener holds the firm pointer. Skipping it would drop that listen. `select_from` skips because the operator named people and none of them are in this firm, so this firing has nobody the automation applies to. `every_firm` did not name a list.

**The same branch on the other two callers.** An `eligibility.changed` whose `contactIds` is empty inserts none of the four rows. `writes` is empty (claim 12). The people are still this audience. They are not those four rows. A contact-scope `halt_records` body that omits `contactId` still dispatches, with `contact_id` null on the pointer (claim 14). The people are this audience. They are not a person the halt row forgot. The firm-book halt still does not dispatch. A firing that already passed people is the other arm: a fact’s one contact, a reference list, a halt that included `contactId`. Those lists are not replaced by the book.

A later provision of the same firm id still dispatches (claim 16). This branch runs again, on the contacts that firm has then. The audience rule does not distinguish the insert from the conflict. `call_agent` enrolls each walked contact and asks for the first step. This claim does not stop that dispatch and does not retune `fireFirstStep`.

The in-memory dispatcher in `src/app/wire/standins/machineApi.ts` does not run the book query. For `select_from` it uses the stored ids, unfiltered, and skips when that array is empty. For `every_firm` it starts a run and does not pass a person list. `startRun` does not walk `ctx.contactIds`. That stand-in is not this branch.

**The halt check this walk enters.** `call_agent` calls `enrollAndActuate` per walked contact. That function returns before the enrollment insert when `isHaltBlockingNew` is true. The contact arm of that query is `scope = 'contact' AND contact_id = $2`. It does not constrain `firm_id`. The firm-book arm does. Whether a contact halt in another firm blocks this run’s enroll was not decided. That predicate is not the audience.

**Rejected alternatives.**

- Walk nobody whenever the firing passed no contact ids. The provision workflow audits the contacts and then assigns agents. This firing has no person on the call and none on the pointer. `walkValidatedWorkflow` will not query the book on its own. An empty person list leaves that audit with no contacts. The audience is the list the operator stored for the moment the event fires.

- Treat Every firm as every `contact_records` row, with no firm predicate, the way `handleSequenceEnrollContacts` does. That door starts now, and each enroll uses the contact’s own `firm_id`. This run’s enroll uses the firing firm for every id. The operator-book query would put another firm’s contact on this firm’s run. Firm isolation is already housed: `workflow_run.firm_id` is the firing firm. The every-firm arm’s `WHERE firm_id = $1` is the list that matches the inside of that firm.

- Leave `select_from` as the stored array with no firm cut, which is what the live branch does when `contactIds` is empty. The picker saves ids from the whole book. On this empty arm those ids become the walk. `call_agent` would enroll another firm’s contact under `opts.firmId` and ask for the first step. The every-firm arm and `contactsForAudit` already refuse that. The stored array stays the operator’s selection. The walk takes the subset in the firing firm. When that subset is empty, the workflow does not start.

- Skip the every-firm workflow when the book is empty, the way `select_from` skips. The firm listen is the run. An empty book means there is nobody to audit yet. It does not mean the firm row has no listener. `select_from` is the scope that named people and found none in this firm.

- Fill the book only for `ct_firms`, and walk nobody for an empty eligibility list or a contact halt that omitted `contactId`. The dispatcher has one audience branch. It does not read the event name. Claim 12 and claim 14 already enter it. The handle stays the writes of that firing: an empty array, the halt id, or the firm id. The person list is the audience. It is not a repair of a missing person on the row. An If that needs a row this firing did not write still fails closed (claim 7).

- Satisfy `local_contact_ids` with the filled audience. The match runs on the firing’s list, before the fill. A trigger that named contacts does not hear a firing that named none.

- Read `workflow_trigger.scope` instead of `workflow.audience_scope`. The materialized trigger scope is hardcoded `every_firm`. The save path writes the operator’s choice on `workflow`. The dispatcher already joins that column.

- Put the filled ids on `payload.writes` as `contact_records`, or on the `ct_firms` element as `contact_id`. The write-set for this firing names `ct_firms` alone (claim 16). The eligibility write-set names the four tables (claim 12). The halt write-set names `halt_records` (claim 14). `writesFromPayload` does not see the walk argument. A firm id in `contact_id` is the person split claim 16 refused.

- Copy the audience onto the payload as `contactIds` so the contact fallback in `writesFromPayload` builds `contact_records` pointers. That fallback runs only when `writes` is absent, and it would make the book the handle. The handle is the firing’s rows. The audience is the walk’s person list.

- Use the stand-in’s missing book query as the rule that every-firm walks nobody. The stand-in records a started run. It does not walk the contacts the server enrolls, tags, and audits.

- Give the every-firm query an `ORDER BY`, or dedupe the stored array, as a new product rule. The live book query has no order. `contact_records.id` is the primary key, so that query does not repeat an id. This claim names the set. It does not add a sort.

No founder question. Who the automation applies to is already the audience, and it already waits for the event. The firing firm is already the run. A firing that names people keeps those people, narrowed by Select from. A firing that names none walks the audience inside that firm: every contact of the firm, or the saved ids that belong to the firm. Select from with none in the firm does not start. Every firm with an empty book starts, and the person list is empty. The three callers share that branch. The book is not a write.

**Evidence:** `workflowWalk.ts` `dispatchEventToWorkflows`, `localAxesMatch`, `walkValidatedWorkflow`, `personIdsFromWrites`, `PERSON_WRITE_TABLES`, `evalIfPick`, `contactsForAudit`, `materializeTriggersFromGraph`. `machine.ts` `handleMachineProvision`, `runContactEligibilityCascade`, `handleWorkflowCreate`, `handleSequenceEnrollContacts`, `handleContactRecordsList`. `stores.ts` `handleHaltCommit`. `cascade.ts` `enrollAndActuate`. `dispatchSend.ts` `isHaltBlockingNew`. `runWrites.ts` `writesFromPayload`. `ContactPickModal.tsx`. `AntAutomationWorkbench.tsx` the audience save and the footer “Who this automation applies to. It does not start a mission now.” `AntAgentWorkbench.tsx` the footer “This starts the mission now.” `src/app/wire/standins/machineApi.ts` the in-memory event fan-out. `supabase/migrations/012_grain_audience_one_timer.sql`. `docs/register/PRIMITIVES.md`. `docs/register/AUTOMATIONS-FACE.md` law 31 and the provision quotation. `docs/register/AUTOMATIONS-UI-BLUEPRINT.md` A19. `docs/register/IMPLEMENTER-FACE-PASS.md` (Global/Local is not “who this applies to”).

**Live.** `dispatchEventToWorkflows` still loads every `contact_records.id` for the firing firm when the scope is not `select_from` and the firing passed no contact ids, and it still starts the run when that query is empty. `select_from` with no incoming ids still walks `audience_contact_ids` with no `firm_id` predicate, and it skips only when that array is empty. The filled ids are still not written onto the payload. `workflow_trigger.scope` is still hardcoded `every_firm` and still unread by this function. No migration was written.

### Revision — claim 18

The halt paragraph above stands as the live query. Claim 18 decides it. A contact halt blocks this enroll only when the row’s `firm_id` is the walk’s firm. The audience branch is unchanged.

---

## Claim 18 — A contact halt blocks a new enroll only in the firm stored on that halt row

**Standing:** technical decision made in this session.

A contact halt in another firm does not block an enroll this firm’s listening run is about to make. `call_agent` calls `enrollAndActuate` once per contact on the walk, with `firmId` set to the walk’s firm (`opts.firmId`). That function calls `isHaltBlockingNew` and returns `blocked: "halt"` before the `enrollment` insert when the check is true. The contact arm of the check blocks only an active `halt_records` row whose `scope` is `contact`, whose `contact_id` is the contact being enrolled, and whose `firm_id` is that same enroll firm. `lifted_at` is still null. The firm-book arm is unchanged: an active `scope = 'firm-book'` row for that same firm, with no contact predicate. `LIMIT 1` stays an existence check. There is no `ORDER BY`. Two active contact halts in this firm for this contact are still one block. This claim does not add a unique constraint.

The live contact arm is `scope = 'contact' AND contact_id = $2` inside an `OR` with the firm-book arm. It does not constrain `firm_id`. A row stamped with another firm and this contact id makes the check true, and the insert does not happen. That is the gap.

**What a contact id is.** `contact_records.id` is `TEXT PRIMARY KEY` (`supabase/migrations/004_machine_tables.sql`). `firm_id` is required and is not part of the key. One id is one row, and that row has one firm. Migrations 014 and 015 add `import_batch_id` and `notes`. They do not change the key. `handleContactImport` and `executeAuditRun` insert `ON CONFLICT (id) DO UPDATE` and the update does not assign `firm_id`, so a second firm that supplies an existing id does not create a second row and does not move the first. An import row that omits an id is minted `cr-` plus a uuid. The seed book uses distinct ids per firm (`cr-cedar-1`, `cr-harbor-1` in `supabase/seeds/002_machine_tables.sql`). Email and phone are not unique. The same person on two books is two ids. This predicate does not join them.

The same id can still carry a second firm’s state on the tables whose key is the pair. `consent_records`, `reachability_verdicts`, `sequence_ready`, and `cohort_tiers` use `PRIMARY KEY (contact_id, firm_id)`. A second firm can hold its own consent or verdict for an id whose book row remains the first firm. Claim 15 already keeps the firm on the consent re-read for that reason. Halt is the same shape of state. Every `halt_records` row stores `firm_id NOT NULL`. The contact reader is the one that drops it.

**What the halt row stores, and who writes it.** The columns are `id`, `consultant_id`, nullable `contact_id`, `firm_id`, `scope` (`contact` or `firm-book`), `reason`, `halted_at`, and `lifted_at` (`supabase/migrations/003_ct_wire_stores.sql`). There is no foreign key from `contact_id` to `contact_records`. There is no unique constraint on an active contact halt, so two commits for one person in one firm are two primary keys (claim 14). The contact partial index is on `contact_id` alone, for active contact-scope rows. It matches the live query. It is not a second key.

`confirmHalt` writes `firmId` from `wireFirmId()` and, for This contact, `contactId` from the active client (`ConsultantAntScene.tsx`). That client is loaded by `listContactRecords()` with no scope argument, which is the session book: `contact_records` of the session firm. Firm book writes the same firm and omits the contact. The board restores active halts with `listActive(firmId)`, and `handleHaltList` with a firm id keeps `firm_id = $1`. A contact halt stamped with another firm is not on this firm’s board. The founder kill-switch writes one `scope: "firm-book"` commit per target firm and passes no `contactId` (`FounderAgencyControlsModule.tsx`). The firm-book arm is that control. A fleet stop is one row per firm, not one contact id.

**What a halt already means.** Governance leaf 1.2: Confirm halt writes the state runners and send gates read, further automatic firm→client sends stop, and the halt is refusal under the consultant’s license (`docs/register/how/consultant-governance.md`). The modal states the two scopes inside that refusal. This contact stops automatic sends for this contact only. Firm book stops automatic firm→client sends across the book (`HaltOutreachModal.tsx`). Desk-13 names those two scopes as firm responsibility rather than platform policy, both of them firm→client (`src/app/register/theory/sme/seats/04-consultancy-desk-ops.ts`). Desk-14 is the prospective stop: new motion stops, and the chronology of what already fired stays. The comment on `enrollAndActuate` matches the enroll side of that stop. In-flight attempts are not aborted. `scripts/verify-deny-gates.ts` and `docs/register/SHIP-READINESS.md` exercise the firm-book arm. They do not exercise a contact halt that ignores firm.

The enroll firm on this path is the walk’s firm. Claim 17’s empty firing walks contacts of that firm, and the desk’s halt of such a client stores that firm, so the live arm and this predicate agree on the pair the product writes. They diverge on a `halt_records` row whose `contact_id` is the person being enrolled and whose `firm_id` is some other firm. That row is not a second book entry for the person. The board of the enroll’s firm does not list it. Treating it as a block would stop this firm’s insert for a refusal this firm’s desk does not show, and it would let this firm’s halt stop another firm’s insert of the same id. The license the leaves name is this firm’s firm→client refusal. The control that does cross firms already writes a firm-book row per firm, and the firm-book arm already requires `firm_id`.

`call_agent` does not pass `fireFirstStep`. `enrollAndActuate` fires the first step when the flag is not false, so an enroll this predicate allows still reaches `consentAndHaltGate`. That function’s contact arm is still the unscoped select. This claim does not retune it. The same is true of `handleHaltIsContact`, which is the real `isContactHalted`, and of the stand-in’s `isContactHalted`, which returns true on `contactId` alone. Those readers remain.

The predicate lives on `isHaltBlockingNew`, so every `enrollAndActuate` caller inherits it. `call_agent` is the listening caller this question names. `handleEnrollmentCreate`, `handleSequenceEnrollContacts`, the onboarding fallback, and the eligibility fallback call the same function. This claim does not specify those enrolls. `handleSequenceEnrollContacts` already passes `row.firm_id`, which is the book firm of that id. The onboarding fallback and the eligibility fallback stay unspecified.

**Rejected alternatives.**

- Leave the contact arm as `contact_id` alone. That is the live SQL, the contact partial index, `consentAndHaltGate`’s contact select, `handleHaltIsContact`, and the stand-in’s `isContactHalted`. They were written without `firm_id`. The index follows the query. It does not decide that one firm’s refusal binds another firm’s enroll. The row already stores the firm. The firm-book arm, the board list, the desk commit, and the pair keys on consent and the audit flags already use it.

- Match the halt to `contact_records.firm_id` instead of the enroll firm. On a desk-written halt those two firms are the same, because the client was listed from the session book and the book row has one firm. They differ when a firing names an id whose book row is another firm and `call_agent` stamps the walk’s firm on it. Claim 17 left that on the non-empty arm. Using this gate to catch it would turn the halt into the audience cut, and it would still miss the same person under a second id. The firm the run is acting as is the enroll firm. The halt that binds that enroll is a halt of that firm.

- Require `halt.firm_id` to equal both the enroll firm and `contact_records.firm_id`. The second conjunct is true for every desk-written pair, because the book row cannot sit in two firms. It adds a read of `contact_records` to an existence check the halt row already answers. The predicate stays on `halt_records`.

- Join another firm’s contact by email or phone and honor that firm’s halt. There is no such key. Two books are two ids. That join would be a platform-wide stop, which desk-13 sets the two scopes against. This claim does not add a person table.

- Treat the founder kill-switch as a contact-id match. Each commit is `firm-book` for one target firm, with no `contactId`. The firm-book arm is that control. This claim does not move it onto the contact arm.

- Drop the contact arm and leave only firm-book. This contact is the surgical scope inside the firm. A book halt of another firm is not how one client is refused. The contact arm stays, with the firm.

- Retune `consentAndHaltGate` and `handleHaltIsContact` in this claim. They are the same missing predicate, and the first-step send can still deny on another firm’s row after this predicate has allowed the insert. They are the neighbouring readers. This claim names them and does not rewrite them.

No founder question. A halt that followed the contact id into every firm would change whose license binds the motion. The id is not a cross-firm person: the book row has one firm, and the same human on another book is another id. Per-firm state for one id is already how consent and the audit flags are keyed. The refusal the leaves describe is firm→client under this license. The board shows this firm’s rows. The control that crosses firms writes a firm-book row per firm. Another firm’s contact halt does not block this enroll.

**Evidence:** `dispatchSend.ts` `isHaltBlockingNew`, `consentAndHaltGate`. `cascade.ts` `enrollAndActuate`. `workflowWalk.ts` `call_agent` inside `walkValidatedWorkflow`, `dispatchEventToWorkflows`. `stores.ts` `handleHaltCommit`, `handleHaltList`, `handleHaltIsContact`, `handleHaltIsFirmBook`. `machine.ts` `handleContactImport`, `handleContactRecordsList`, `handleEnrollmentCreate`, `handleSequenceEnrollContacts`, `handleOnboardingFire`. `auditRun.ts` `executeAuditRun`. `ConsultantAntScene.tsx` `confirmHalt`. `HaltOutreachModal.tsx`. `FounderAgencyControlsModule.tsx` `onConfirmHalt`. `src/app/wire/reals/machineApi.ts` `listContactRecords`. `src/app/wire/reals/haltStore.ts` `isContactHalted`. `src/app/wire/standins/haltStore.ts` `isContactHalted`. `src/app/wire/standins/sendGate.ts`. `src/app/wire/standins/machineApi.ts` `createEnrollment`. `supabase/migrations/003_ct_wire_stores.sql`. `supabase/migrations/004_machine_tables.sql` `contact_records`, `reachability_verdicts`, `sequence_ready`, `cohort_tiers`. `supabase/migrations/014_contact_import.sql`. `supabase/migrations/015_house_notes_handle.sql`. `supabase/seeds/002_machine_tables.sql`. `docs/register/how/consultant-governance.md` leaf 1.2. `docs/register/how/operator-founder-controls.md` leaf 1.2. `src/app/register/theory/sme/seats/04-consultancy-desk-ops.ts` desk-13 and desk-14. `scripts/verify-deny-gates.ts`. `docs/register/SHIP-READINESS.md`.

**Live.** The contact arm of `isHaltBlockingNew` still has no `firm_id`. `consentAndHaltGate` and `handleHaltIsContact` still match `contact_id` alone. The stand-in’s `isContactHalted` still does. No migration was written.

### Revision — claim 19

The enroll predicate stands. One sentence in the body does not match the call that was re-read for the send. `call_agent` passes `fireFirstStep: true` (`workflowWalk.ts`). The body said the flag is omitted. `enrollAndActuate` fires the first step when the flag is not false, so an omitted flag would also fire, and this call passes true. An enroll the predicate allows still reaches the send. Claim 19 decides the contact arm of that send, and `handleHaltIsContact`. This revision does not retune the enroll predicate.

---

## Claim 19 — A contact halt denies a send, and answers the contact check, only in the firm on that row

**Standing:** technical decision made in this session.

Another firm’s contact halt does not deny a send this firm is about to make, and it does not make the contact check true. The enroll predicate is claim 18. These two readers ask the same question about the firm the caller is acting as. The moment is different: the enroll check can refuse the insert, and the send check can refuse the message.

**The send.** `consentAndHaltGate(contactId, firmId, purpose)` is the gate (`dispatchSend.ts`). The firm-book arm is unchanged. It matches an active `scope = 'firm-book'` row for that `firmId`, and it still runs when the send names no contact. When `contactId` is present, the contact arm matches an active `halt_records` row whose `scope` is `contact`, whose `contact_id` is that contact, and whose `firm_id` is that same `firmId`. `lifted_at` is null. `LIMIT 1` stays an existence check. There is no `ORDER BY`. Two active contact halts in this firm for this contact are one deny. A lifted row does not deny. The arm does not read `purpose`.

A deny is `{ allow: false, deny: "policy", detail: "halt active" }`. `dispatchEmail` and `dispatchSms` return that before the cohort short-circuit, so the deny is not reported as a dry-run success. `dispatchEmailLive` and `dispatchSmsLive` call the same gate again and return before Resend or Twilio. The message is not handed to the provider.

The firm on the gate is the firm the caller already passed. `enrollAndActuate` passes its `firmId` into `actuateChannelSend`, and that function passes it to `dispatchEmail` or `dispatchSms`. `call_agent` calls `enrollAndActuate` with `firmId: opts.firmId` and `fireFirstStep: true`, so the first step of an enroll claim 18 allows is this gate, with the walk’s firm. `handleCemSend` and `handleSmsSend` set `firmId` from `requireSessionFirm` and do not use `body.firmId`. The tick’s escalation, cell advance, and wait-until send pass `attempt.firm_id`. Those callers were read to see which firm the gate holds. Which of them H1 counts as a new send was not decided.

**The check.** `handleHaltIsContact` is the same contact match: active, `scope = 'contact'`, that `contact_id`, and `firm_id` of the firm the caller is acting as. The route is `GET /halt/contact/:contactId`. The real `isContactHalted` requests that path and passes no firm (`src/app/wire/reals/haltStore.ts`). The stand-in’s `isContactHalted` walks active rows with `scope === "contact"` and `contactId` (`src/app/wire/standins/haltStore.ts`). The specified match reads the firm. Firm-book stays a separate question. The stand-in’s comment says callers pass the firm separately, and `isFirmBookHalted` is that call. The contact function does not treat a firm-book row as a contact halt.

The board does not call this check. `ConsultantAntScene` hydrates from `listActive(firmId)` with `peekActiveFirmId()`. `handleHaltList`, given a firm id, keeps `firm_id = $1`. `haltByContact` is built from the contact-scope rows in that list. A contact halt stamped with another firm is already absent from this firm’s board. The live boolean still answers true for that row. That is the gap.

The callers that act on the boolean are in the stand-in. `standInSendGate` calls `isFirmBookHalted(input.firmId)` and, when `contactId` is set, `isContactHalted(contactId)`. A true contact result pushes reason `halt`, and `decide` returns `allow: false`. The firm that result uses is `input.firmId`. Firm operations bind calls `decide` and `chips` with the row’s firm and no contact, so those calls do not ask the contact question. `registry.ts` keeps `sendGate` on the stand-in when the halt store is real, and the stand-in send reads the in-memory halt map. `createEnrollment` throws before the insert when `isFirmBookHalted(standInFirm())` or `isContactHalted(input.contactId)` is true. `standInFirm()` is `getActiveFirmId()`, and `firm-cedar` when that read throws. The firm that contact result uses is `standInFirm()`. Claim 18 stays on `isHaltBlockingNew`. The real `handleEnrollmentCreate` calls `enrollAndActuate` and does not call `isContactHalted`.

**Why this is claim 18’s predicate.** The enroll check asks whether this firm refuses a new enrollment of this contact. The send asks whether this firm may send to this contact. The boolean asks whether this contact is halted for the firm the caller is acting as. Governance leaf 1.2 says Confirm halt writes the state runners and send gates read, further automatic firm→client sends stop, and the halt is refusal under the consultant’s license (`docs/register/how/consultant-governance.md`). The modal says This contact stops automatic sends for this contact only (`HaltOutreachModal.tsx`). Desk-13 names the two scopes as firm responsibility (`src/app/register/theory/sme/seats/04-consultancy-desk-ops.ts`). The firm-book arm of this gate already requires `firm_id`. The board already lists by firm. Claim 18 already requires `firm_id` on the enroll. One contact id is one `contact_records` row and one book firm. The halt row already stores `firm_id NOT NULL`. These contact readers are the ones that drop it.

On the path the desk writes, This contact is committed under `wireFirmId()` for a client of the session book, and the send of that client uses that firm. The live arm and this predicate agree on that pair. They diverge on a `halt_records` row whose `contact_id` is the person and whose `firm_id` is some other firm. That row is not on the sending firm’s board. Denying the send would stop this firm’s message for a refusal this firm’s desk does not show, after claim 18 had allowed the enroll. A true check would disagree with the board the operator is looking at.

The contact partial index is `halt_records_contact_active_idx` on `contact_id`, for active contact-scope rows (`supabase/migrations/003_ct_wire_stores.sql`). It matches the live query. It is not a second key. `scripts/verify-deny-gates.ts` inserts a firm-book row and expects the enroll to block. It does not insert a contact halt of another firm.

**What stays outside this predicate.** The consent select in the same function is `WHERE contact_id = $1 LIMIT 1` on `consent_records`, and it runs before the contact arm. That select was not specified. A consent deny still returns before this arm is reached. The silence upsert’s `status` and `consent_records.sequenced` were not specified. `actuateChannelSend` loads `contact_records` with `id` and `firm_id`. Email and text call the gate when that row has an address, or when a live send falls back to `TEST_EMAIL_TO` or `TEST_SMS_TO`. A missing address with no fallback, and any other channel, returns a dry-run without calling the gate. That return does not consult this arm. H1 says a halt stops new enrollments and new sends and leaves in-flight attempts to finish naturally (`docs/register/PROTOTYPE-COHESION-ANALYSIS.md`, `docs/register/PROTOTYPE-COHESION-PLAN.md`). The live tick still calls this gate for an open attempt. Whether that call is a new send or the attempt finishing was not decided. The engagement kind stored when a deny comes back was not decided.

**Rejected alternatives.**

- Leave both readers on `contact_id` alone. That is the live SQL, the contact partial index, the route with no firm, and the stand-in loop. `call_agent` passes `fireFirstStep: true`, so an enroll claim 18 allows reaches this gate. Another firm’s row denies that send with `halt active`, and the boolean answers true. The sending firm’s board does not list the row. The license the leaf names is this firm’s. The index follows the query. It does not decide that one firm’s refusal binds another firm’s send.

- Firm-scope the send and leave the boolean unscoped. The stand-in send and the stand-in enroll are the callers that act on a true boolean, and each already holds a firm. An unscoped true makes those actions follow another firm’s row. The board would still omit the row. One refusal would have two answers.

- Firm-scope the boolean and leave the send unscoped. The check would agree with the board, and the message would still stop on another firm’s row after an enroll this firm was allowed to make. The leaf says the send gate reads the halt. The firm-book arm of the same function already requires the firm.

- Match `contact_records.firm_id` instead of the firm on the call. The address lookup already uses the send’s firm. On a desk-written halt the book firm and the send firm are the same. They differ when a firing names an id whose book row is another firm and the enroll is stamped with the walk’s firm. Claim 18 matches the halt to that enroll firm. Claim 17 left the non-empty list in place. Using the book firm would deny a send of an enroll claim 18 allowed, or allow a send when the walk’s firm holds the halt and the book row does not. The firm the send is acting as is the firm already passed in.

- Require the halt’s firm to equal both the send’s firm and the book firm. The second conjunct holds for every desk-written pair, because the book row has one firm. It adds a `contact_records` read to an existence check the halt row already answers, and it makes the gate do the audience cut. The predicate stays on `halt_records`.

- Treat the send as stricter than the enroll, so a contact halt follows the contact id into every firm’s send. That applies one firm’s license to another firm’s message. Claim 18 closed that reading for the enroll. The id is one book row. The same person on another book is another id. The kill-switch that crosses firms writes a firm-book row per firm, and the firm-book arm already requires `firm_id`. The leaf describes one state, read by runners and by send gates.

- Drop the contact arm and rely on the enroll gate. A halt committed after the enroll is not seen by `isHaltBlockingNew` again. The comment on that check says it does not abort in-flight attempts. H1 still stops new sends. The contact arm is how a send reads the row. The arm stays. The in-flight split was not decided here.

- Read the session firm inside `handleHaltIsContact` instead of the firm the caller is acting as. The route does not call `requireSessionFirm`. The send path does not call the route. It queries with the firm it was given. Firm operations bind can `decide` for `row.firmId`. The stand-in enroll’s firm is `standInFirm()`. A session read inside the route would answer a firm the caller did not ask about.

No founder question. Claim 18 already scoped this refusal to the firm on the row. The send is the stop the leaf names. The check is the same match. The board lists that firm. Another firm’s contact halt does not deny this send and does not make the check true.

**Evidence:** `dispatchSend.ts` `consentAndHaltGate`, `dispatchEmail`, `dispatchSms`, `dispatchEmailLive`, `dispatchSmsLive`. `cascade.ts` `enrollAndActuate`, `actuateChannelSend`, `escalateAttemptWindow`, `advanceTemplateCellIfDue`, `tickOnce`. `workflowWalk.ts` `call_agent` inside `walkValidatedWorkflow`. `send.ts` `handleCemSend`, `handleSmsSend`, `requireSessionFirm`. `stores.ts` `handleHaltIsContact`, `handleHaltList`, `handleHaltIsFirmBook`. `routes.ts` `GET /halt/contact/:contactId`. `src/app/wire/reals/haltStore.ts` `isContactHalted`. `src/app/wire/standins/haltStore.ts` `isContactHalted`. `src/app/wire/standins/sendGate.ts`. `src/app/wire/standins/machineApi.ts` `createEnrollment`, `standInFirm`. `src/app/wire/registry.ts` `sendGate`. `src/app/wire/ports.ts` `HaltStorePort`, `SendGateDecideInput`. `ConsultantAntScene.tsx` `listActive`. `FirmOperationsBindModule.tsx` `decide`, `chips`. `HaltOutreachModal.tsx`. `supabase/migrations/003_ct_wire_stores.sql` `halt_records_contact_active_idx`. `docs/register/how/consultant-governance.md` leaf 1.2. `docs/register/PROTOTYPE-COHESION-ANALYSIS.md` H1. `docs/register/PROTOTYPE-COHESION-PLAN.md` the halt row. `src/app/register/theory/sme/seats/04-consultancy-desk-ops.ts` desk-13. `scripts/verify-deny-gates.ts`.

**Live.** The contact arm of `consentAndHaltGate` still has no `firm_id`. `handleHaltIsContact` still matches `contact_id` alone. The real `isContactHalted` still passes no firm. The stand-in’s `isContactHalted` still ignores `firmId`. No migration was written.

### Revision — claim 20

The sentence that the tick’s firm was read and that H1’s classification of that send was not decided stands as the gap. Claim 20 decides the classification. The escalation, the cell advance, and the wait-until send are new sends. The halt gate denies them. The attempt stays open. This revision does not retune the firm predicate. The engagement kind stored when the deny comes back was still not decided.

---

## Claim 20 — A tick send on an open attempt is a new send the halt stops; the attempt is not aborted

**Standing:** technical decision made in this session.

A message the tick is about to hand off for an attempt that is already `open` is one of H1’s new sends. `consentAndHaltGate` denies it. The attempt is not aborted. `tickOnce` keeps loading that row and keeps running the attempt engine. Halt does not set `active_attempts.status`, does not take the inbound nullify path, and does not undo the attempt writes that function already made before the send.

**What the later lock already chose.** H1, resolved 2026-08-10, is suppression only: stop new enrollments and new sends immediately, and leave in-flight attempts alone so they finish naturally. Kill is that same mechanism, firm-wide. Do not block Active on Gap #2’s mid-motion abort. Refine abort later if ever needed (`docs/register/PROTOTYPE-COHESION-ANALYSIS.md`). The plan’s non-negotiable repeats the suppression sentence. Its status line records the contract as new enrollments and new sends blocked, in-flight not aborted (`docs/register/PROTOTYPE-COHESION-PLAN.md`). The analysis index says the component map parked Gap #2 and H1 chooses suppression-only.

P1 had parked the behavior a consultant halt forces on an in-flight motion — the interaction with Engine 2’s “one client, one motion” and the attempt engine’s live-override — and named a founder or systems-analyst write into `SYSTEMS-STORY` as the unblock (`docs/register/SYSTEM-COMPONENT-MAP.md`, `docs/register/OUTCOME-SYSTEM-MAP.md` Gap #2). That write is not in `SYSTEMS-STORY`. §7b still says the attempt engine must run one in-flight sequence, escalate when criteria are met, accept a live inbound that can nullify the attempt, and close on a finishing event. It does not name halt. H1 is the later lock, and the piece it locked is suppression rather than abort. The abort, and that Engine 2 / live-override interaction, stay the refinement H1 postponed. This claim does not write them, and it does not retune `hasInboundOverride`.

**The three sends.** `tickOnce` selects `active_attempts` with `status = 'open'`. It does not read `halt_records`. For an open attempt it can reach `actuateChannelSend` with `firmId: attempt.firm_id` and `contactId: attempt.contact_id` from three places, each with `purpose: "cem"` (`cascade.ts`):

- `advanceTemplateCellIfDue`, after the cell cursor update, when the next cell’s channel is `email` or `text`.
- The wait-until arm, after `attempt_wait_until` has been deleted and `window_started_at` moved, when the owner channel is `email` or `text`.
- `escalateAttemptWindow`, after the attempt update, when `toChannel` is `email` or `text` and the queued next attempt is not still waiting.

`actuateChannelSend` calls `dispatchEmail` or `dispatchSms`. The comment on `dispatchEmail` calls that function the gated send for the cascade and the worker, and says halt still denies. Both functions call `consentAndHaltGate` and return the deny before the cohort short-circuit. A halt deny is `{ ok: false, deny: "policy", detail: "halt active" }`. `dispatchEmailLive` and `dispatchSmsLive` call the same gate again and return before Resend or Twilio. The message is not handed to the provider. Claim 19 is the firm on the contact arm. On these three calls that firm is `attempt.firm_id`. The firm-book arm is unchanged: an active firm-book row for that same firm denies as well. The halt arm does not read `purpose`, so `cem` is not an exemption. A cell or a channel that is neither email nor text does not call `actuateChannelSend`. A missing address with no live test fallback returns the dry-run claim 19 already recorded, without the gate. This claim does not widen the gate to those returns.

**What staying open means.** The comment on `enrollAndActuate` says a firm-book or contact halt blocks new enrollments and does not abort in-flight attempts. The tick never calls `isHaltBlockingNew`. The only status write to `nullified` on this path is `hasInboundOverride`. Halt does not call it. The attempt’s own endings stay the engine’s: that inbound path, the campaign cursor `tickOnce` already runs, and `recordCampaignFailure` when an escalation has no next channel. Those were not retuned.

The writes before the send stay taken. The cell advance sets the next cell, `delivered: true`, `delivered_at`, a `workflow_run`, and a `cell_advanced` engagement before it sends. `criteriaDue` treats `state.delivered` as the delivered condition and `delivered_at` as a clock anchor. The escalation writes `owner_channel`, `fired_criteria`, `state`, a `workflow_run`, and a `window_fired` engagement before it decides whether to send. The send runs only when `toChannel` is email or text and the queued next attempt is not still waiting. On that waiting branch `fired_criteria` is written as `{}` for this fire, `attempt_wait_until` stays set, and the send is the later wait arm. The wait arm clears `attempt_wait_until` before it sends. A deny does not restore any of those. Where the escalation stored `fired_criteria[criteria.id]`, the next pass returns before firing that criteria again. That early return is the engine’s idempotency. The waiting branch did not store the id. This claim does not add a second fire.

The kill-switch copy says the firm-book row suppresses new enrollments and new sends, and that in-flight attempts are left alone (`src/app/register/prototype-ant/operator/FounderAgencyControlsModule.tsx`, and the same sentence in `src/app/register/prototype/operator/FounderAgencyControlsModule.tsx`). The consultant modal says This contact stops automatic sends for this contact only, and Firm book stops automatic firm→client sends across the book (`HaltOutreachModal.tsx`). Governance leaf 1.2 says further automatic firm→client sends stop (`docs/register/how/consultant-governance.md`). Desk-14 defines halt as a prospective stop of automatic outreach, with the chronology of what already fired preserved. The failure it names is a halt that only flags the UI while runners keep sending (`src/app/register/theory/sme/seats/04-consultancy-desk-ops.ts`). Desk-15 says halt stops further automatic outreach. Its meeting half was not reopened. A tick message that has not reached the provider has not fired. Stopping it is that prospective stop. The attempt row remaining `open`, with the engine still stepping, is the in-flight half of the same lock.

**The first step is not this send.** `enrollAndActuate` returns `blocked: "halt"` before the enrollment insert when `isHaltBlockingNew` is true. The first `actuateChannelSend` runs only after that check has passed and the attempt row exists. A halt already stored for this firm and this contact does not reach that first step. A row written between the two queries would be seen by the first step’s gate and missed by the enroll check. That ordering was read. It is not a second rule, and it is not an open attempt’s later tick. The first step remains the start of an enrollment the enroll check allowed.

After the attempt loop, `tickOnce` calls `dispatchScheduleTriggers` and `resumeDueWaitingRuns`. Both enter the walker. A `call_agent` on those walks is `enrollAndActuate`, which is claim 18’s check and then, if the check passes, the first step above. Those calls are not the three sends. This claim does not follow any other action a resumed graph can take.

**Rejected alternatives.**

- Let the open attempt’s remaining messages leave, and count as new sends only a send that has no open attempt. The contact would stay on the cadence after the refusal. The modal says automatic sends stop. The leaf says further automatic sends stop. Desk-14’s failure is runners that keep sending. Desk-15’s outreach half is the same stop. H1 says stop new sends immediately, and the plan’s status line glosses the in-flight half as not aborted, not as sends that continue. `dispatchEmail` is the worker’s send, and its H1 comment says halt still denies. There is no branch in `tickOnce` that skips the gate because the attempt is open. The attempt finishing is the row staying open until the engine ends it.

- Nullify or close the attempt when the halt commits, so the tick no longer loads it. That is the mid-motion abort H1 postponed. P1 named the interaction with one client, one motion and with the live-override as the parked behavior. `SYSTEMS-STORY` still has no halt rule. The inbound nullify path stays that path. This claim does not set `status`.

- Freeze the tick for a halted firm or contact, or roll back the cell, the fired criteria, and the cleared wait when the gate denies, so a later lift replays the step. That is a hold on the attempt engine. H1 did not add one. The postponed refinement is abort, not a pause. The engine already commits the window before it knows the send result, on this gate and on every other deny that returns from the same function. A halt-only undo would be an attempt rule this lock does not write. The step that was taken stays taken. The message the gate denied does not leave.

- Deny tick sends for a firm-book halt and let a contact halt’s attempt keep sending. H1 says kill is the same mechanism, firm-wide. The modal uses the same stop for both scopes. The three paths call one gate. Claim 19 already requires the contact row’s firm to be the firm on the call, which here is `attempt.firm_id`.

- Skip the gate on the tick and rely on the enroll check. A halt committed after the enroll is not seen by `isHaltBlockingNew` again. The comment on that check says it does not abort the open attempt. The sends after that moment are the new sends. The gate is how they stop.

No founder question. A contact who is mid-sequence either receives the next message or does not, and those are different experiences. The lock already chooses the stop. Suppression is the send. The attempt staying open, and the engine neither aborted nor rewound, is the other half of that lock. The abort P1 parked remains later, if it is ever written. It is not required to know whether this message leaves.

**Evidence:** `docs/register/PROTOTYPE-COHESION-ANALYSIS.md` H1 and the index row for `SYSTEM-COMPONENT-MAP.md`. `docs/register/PROTOTYPE-COHESION-PLAN.md` the halt non-negotiable and the status line “in-flight not aborted.” `docs/register/SYSTEM-COMPONENT-MAP.md` P1. `docs/register/OUTCOME-SYSTEM-MAP.md` Gap #2. `docs/register/SYSTEMS-STORY.md` §7 the in-flight sequence, with no halt rule. `docs/register/how/consultant-governance.md` leaf 1.2. `src/app/register/theory/sme/seats/04-consultancy-desk-ops.ts` desk-14 and desk-15. `src/app/register/prototype-ant/operator/FounderAgencyControlsModule.tsx`. `src/app/register/prototype/operator/FounderAgencyControlsModule.tsx`. `src/app/register/prototype-ant/consultant/HaltOutreachModal.tsx`. `server/wire-service/dispatchSend.ts` `consentAndHaltGate`, `dispatchEmail`, `dispatchSms`. `server/wire-service/cascade.ts` `enrollAndActuate`, `tickOnce`, `advanceTemplateCellIfDue`, `escalateAttemptWindow`, `actuateChannelSend`, `criteriaDue`, `clockAnchor`, `hasInboundOverride`. `server/wire-service/workflowWalk.ts` `dispatchScheduleTriggers`, `resumeDueWaitingRuns`, `resumeWaitRun`.

**Live.** The three paths already call `actuateChannelSend`. `dispatchEmail` and `dispatchSms` already return the halt deny before the cohort short-circuit. `tickOnce` already does not read `halt_records`, already does not call `isHaltBlockingNew`, and already does not nullify because of a halt. The pre-send attempt writes already stand after a deny. No migration was written. The contact arm’s missing `firm_id` is claim 19’s live gap. The engagement kind stored for the deny was not specified.

### Revision — claim 21

The sentence that the engagement kind stored for the deny was not specified stands as the gap. Claim 21 decides that row. The send is still denied. The attempt stays open. The cell, `fired_criteria`, the cleared wait, and `delivered` stay taken. This revision does not retune the firm predicate and does not retune `hasInboundOverride`.

### Revision — claim 45

The sentence that the three sends each use purpose `cem` stands as the live literal. Claim 45 keeps `cem` when the attempt’s sequence class is not `optin`, and when no template row loads. When `sequence_template.sequence_class` for that attempt is `optin`, those three calls pass `opt-in`. The halt arm still does not read purpose. The deny, the open attempt, and the writes made before the send are unchanged.

---

## Claim 21 — A denied tick send is its own engagement row

**Standing:** technical decision made in this session.

A tick send that comes back `ok: false` appends one `engagement_records` row of kind `send_denied`. That row is how a later reader tells the refusal from a dry run and from a message that went out. `send_live` stays the provider accept. `send_dry_run` stays the fail-closed stage. The attempt writes claim 20 left in place stay in place. This claim does not abort the attempt, does not roll the cell, `fired_criteria`, or the cleared wait back, and does not retune `hasInboundOverride`.

**What the chronology is for.** `engagement_records` is the append log the consultant reads as the engagement record: one row per thing that occurred, `event_kind` plus `payload`, `id` `eng-` plus a uuid (`supabase/migrations/004_machine_tables.sql`, `writeEngagement` in `cascade.ts`). `SYSTEMS-STORY` §7 says that record is a chronology of events that already fired and that it authors nothing. Leaf 1.1 names the same panel: chronology rows, record only (`docs/register/how/consultant-governance.md`). Desk-14 says halt is a prospective stop and the file of what already fired stays complaint-ready (`src/app/register/theory/sme/seats/04-consultancy-desk-ops.ts`). Claim 20 already kept the earlier rows. The message the gate refused has not reached the provider, so it is not one of those earlier sends. The refusal itself occurred, and the log is where that fact is stored. The kind is free text. There is no check constraint on `event_kind`. A new kind is a row. No migration.

**The three results the dispatcher already returns.** `DispatchResult` is three shapes (`dispatchSend.ts`): `ok: true` and `dryRun: false` with `messageId`; `ok: true` and `dryRun: true` with `reason`; `ok: false` with `deny` and an optional `detail`. `dispatchEmail` and `dispatchSms` return the gate’s deny before the cohort short-circuit. The comment on `dispatchEmail` calls the cohort path fail-closed to dry-run, and says halt still denies. `ACTUATION-REPORT` defines that dry run: live only when `SEND_MODE=live` and the contact is in the cohort; otherwise the send is staged and the book is not blasted. A missing address inside `actuateChannelSend` returns the dry-run claim 20 already left outside the gate. Those allowed results are not this row.

**The kind the escalation already uses for an allowed send.** `escalateAttemptWindow` writes `send_live` only when `send.ok && !send.dryRun`, and stores `messageId`. It writes `send_dry_run` only when `send.ok && send.dryRun`, and stores `reason`. Both payloads also carry `attemptId`, `channel`, `runId`, `criteriaId`, `criteriaLabel`, `subject`, and `bodyText`. A result with `ok: false` writes neither row, so the chronology keeps `window_fired` and has no send row. The cell advance writes `send_live` only when `shouldLiveSend` is true and the result is a live success, and otherwise writes `send_dry_run`, including a deny, and it stores the whole `send` object. `reason` on that payload is set only for a dry run, so a deny has no `reason` and no `messageId`. The wait-until arm discards the `DispatchResult` and always writes `send_dry_run` with `attemptId`, `channel`, `subject`, `bodyText`, and `attempt_n`. A deny, a dry run, and a live success are the same row there, and the body is present.

**What the desk reads off the kind.** The consultant chronology titles `send_live` as `Send · {channel} (live)` and `send_dry_run` as `Send · {channel} (dry-run)` (`titleFor` in `engagementProjection.ts`). The outcome line says `Outcome · dry-run ({reason})` when `payload.reason` is set, and `Outcome · accepted` when `payload.messageId` is set. The inspector replays `subject` / `bodyText` / `bodyHtml` whenever one of them is present, and the bind says a body shown there is what was sent or dry-run staged (`docs/register/HUB-STRUCTURE-SYSTEM-BIND.md` item 76; `docs/register/CLIENT-DATA-BIND.md`). `eventKindProse` on the operator Agents table returns `Sent` for any kind that contains `send` (`channelRuleGrain.ts`). A deny labeled `send_dry_run` is the dry-run title. A deny labeled `send_live` is the live title. A `window_fired` with no send row does not say the send was refused: the same absence is a channel that never called `actuateChannelSend`, or a window that was still waiting. The wait arm has no `window_fired` of its own for that later send, so omitting the row leaves that moment out of the log. `attempt_nullified` is the existing stop that the log records as its own kind, beside the rows that were already there, and it does not reuse `send_dry_run`.

**The row.** Each of the three tick writers, when `actuateChannelSend` returns `ok: false`, appends one row through `writeEngagement`:

- `event_kind` is `send_denied`.
- `firm_id` is `attempt.firm_id`. `contact_id` is `attempt.contact_id`. The id is the `eng-` id that function already returns.
- The payload carries `attemptId` (`attempt.id`), `channel` (the channel passed into `actuateChannelSend`), and `send` (that `DispatchResult`: `ok: false`, and `deny`, `detail`, and `dryRun` as the value already has them).
- The escalation also keeps `runId`, `criteriaId`, and `criteriaLabel`. The cell advance also keeps `cellId`, `cellLabel`, and `runId`. The wait arm also keeps `attempt_n`.
- `subject`, `bodyText`, `bodyHtml`, `messageId`, and `reason` are not on this payload. The inspector would replay a body as a send or a staged dry run. The authored copy stays on the template and the campaign content the tick already read. The refusal is the kind and the `send` object. `detail` is stored because it is already on the result. This claim does not interpret it and does not specify the consent select. A silenced deny, a consent-missing deny, a halt deny, and a throughput deny are the same kind, because the writers branch on `send.ok`.

An allowed result uses the escalation’s two kinds. `send.ok && !send.dryRun` is `send_live` with `messageId`. `send.ok && send.dryRun` is `send_dry_run` with `reason`. Subject and body stay on those two, as that function already stores them, so a dry run and a live send still replay. The cell’s `shouldLiveSend && send.ok && !send.dryRun` conjunction is not the label. The label is the result. The wait arm keeps the `DispatchResult` and uses the same three branches. It does not write `send_dry_run` for a deny or for a live success.

`window_fired` and `cell_advanced` stay the rows claim 20 already required, written before the send. The deny row is a later append. It is not an update of those rows. Engagement is an append log (claim 10). The tick send does not dispatch, so this row is not an element of `payload.writes` and it is not a listening pointer. `hasInboundOverride` still reads only `inbound_reply`, `form_visit`, and `inbound_override`. A deny does not nullify the attempt.

The Activity tags `Sent` and `Delivered` stay a reading of `active_attempts.state`, which is what `CLIENT-DATA-BIND` binds them to. Claim 20 left `delivered` true on the cell. Those tags still light on the cell row and on this row. They are the attempt flag. They are not this kind. This claim does not retune `signalsFrom` or the inspector milestones.

**The first step is not this row.** `enrollAndActuate` writes its engagement only after `isHaltBlockingNew` has passed. The kind there is `send_live` or `send_dry_run` from `shouldLiveSend`, and the payload stores `send` even when `ok` is false. A halt already stored does not reach that write. A later deny on that first step is a different call. This claim does not label it.

**Rejected alternatives.**

- Label the deny `send_dry_run`, and rely on `payload.send.ok` or `payload.reason` to carry the refusal. The list title is the kind. `send_dry_run` titles as a dry run, and `eventKindProse` titles any `send` kind as `Sent`. The dry run is the cohort and `SEND_MODE` stage, and the missing-address return. The dispatcher returns that shape with `ok: true`. A policy deny is the other shape. The escalation already refuses `send_dry_run` unless `send.ok && send.dryRun`. Putting the withheld subject and body on that kind makes the inspector replay a message the bind treats as sent or staged. The wait arm’s copy of this alternative stores neither `send` nor `reason`, so the raw payload cannot tell the three results apart.

- Write no send row, as the escalation does today. `window_fired` with no following send row is also a non-message channel and a window that was still waiting. The wait arm’s send has no companion row at that moment, so the refusal would be absent from the log. Desk-14’s file is the chronology of what occurred. `attempt_nullified` records a stop by appending a kind, not by leaving a hole. The bind’s cinch is that a halt is visible as the worker skipping the send (`HUB-STRUCTURE-SYSTEM-BIND` item 68). Absence does not say skipped.

- Stamp the deny onto `window_fired` or `cell_advanced` after the send returns. Those inserts run before the result. The table is appended, not updated, and claim 10 already refused collapsing two facts onto one engagement key. The wait arm has no such row for the send it is about to make. The step row and the refusal are different facts. The step row stays.

- File the deny only on the tick `workflow_run`. The consultant engagement record reads `engagement_records`. Leaf 1.1 and `CLIENT-DATA-BIND` bind Activity to that table. A result that never lands there is not the file.

- Mint a table, or add a check constraint, for the kind. The chronology table is this one. `event_kind` is already unconstrained text. `HUB-STRUCTURE-SYSTEM-BIND` treats a new kind as a row, not a new relation. No migration.

- Name the kind so it avoids the substring `send`, so `eventKindProse` does not return `Sent`. The two allowed outcomes are already `send_live` and `send_dry_run`. `send_denied` is the third result of that same send, and it sits in that pair’s family. A name outside the pair splits one dispatcher result across unrelated words, and a name that says `policy` is wrong for a throughput deny. The writers branch on `send.ok`, not on `detail`. The operator helper is a second reader. The complaint desk titles an unknown kind by replacing underscores with spaces, so `send_denied` reads as `send denied` there (`titleFor`’s default). The helper was not retuned.

- Treat the deny as `attempt_nullified`. That kind is the inbound override, which sets `status` to `nullified`. Claim 20 leaves the attempt `open`. Halt does not take that path.

No founder question. A label the licensee reads as a test send, and a label they read as a refusal, are different files. The dispatcher, the escalation’s two `send.ok` branches, the dry-run definition, the desk titles, and the replay sentence already separate the refusal from the test and from the message that went out. The third result gets the third kind. The words on the complaint desk are the kind. Choosing them does not change whose license applies, and it does not change the suppression claim 20 already locked.

**Evidence:** `supabase/migrations/004_machine_tables.sql` `engagement_records` (`event_kind TEXT NOT NULL`, no check). `server/wire-service/cascade.ts` `writeEngagement`, `escalateAttemptWindow` (the `send.ok` branches and the absent else), `advanceTemplateCellIfDue` (the `shouldLiveSend` conjunction and the stored `send`), `tickOnce` (the wait arm’s discarded `DispatchResult` and the unconditional `send_dry_run`), `attempt_nullified`, `hasInboundOverride`. `server/wire-service/dispatchSend.ts` `DispatchResult`, `dispatchEmail`, `dispatchSms`. `docs/register/system-map/ACTUATION-REPORT.md` the fail-closed dry run. `docs/register/HUB-STRUCTURE-SYSTEM-BIND.md` the chronology kinds, item 68, item 76. `docs/register/CLIENT-DATA-BIND.md` the Activity bind and the subject/body replay. `docs/register/SYSTEMS-STORY.md` §7. `docs/register/how/consultant-governance.md` leaf 1.1. `src/app/register/theory/sme/seats/04-consultancy-desk-ops.ts` desk-14. `src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts` `kindOf`, `titleFor`, `outcomeFrom`, `signalsFrom`. `src/app/register/prototype-ant/consultant/clientData/ActivityInspectDrawer.tsx` replay and the raw payload. `src/app/register/prototype-ant/operator/channelRuleGrain.ts` `eventKindProse`.

**Live.** The escalation still writes a send row only when `send.ok`. The cell advance still writes `send_dry_run` for a deny and still stores `subject`, `bodyText`, and `send`. The wait arm still drops the result and still writes `send_dry_run` with `subject` and `bodyText` and no `send` object. `titleFor` still has no `send_denied` case. `kindOf` would bucket that kind as `other`. `eventKindProse` would still return `Sent` because the kind contains `send`. The Sent and Delivered tags still follow attempt state. No migration was written. `enrollAndActuate` still labels from `shouldLiveSend`.

### Revision — claim 22

The sentence that this claim does not label the first step stands as the gap. Claim 22 decides that row. The tick row is unchanged. `shouldLiveSend` is still not the tick’s label. This revision does not retune `eventKindProse` or the Activity tags, and it does not decide whether the enroll insert should have been blocked.

---

## Claim 22 — A denied first step is the same refusal the tick already records

**Standing:** technical decision made in this session.

When `enrollAndActuate` runs its first `actuateChannelSend` and that call returns `ok: false`, it appends one `engagement_records` row of kind `send_denied`. That is the refusal claim 21 already required of a tick send. The call is the same dispatcher. The kind is the `DispatchResult`. `shouldLiveSend` is not the kind. A halt already stored still returns before the insert, so it still produces no row. This claim does not decide whether the insert should have been blocked.

**What the write stores today.** `enrollAndActuate` sets `live` from `shouldLiveSend(input.contactId)` before it sends. The enrollment insert stores the caller’s payload, then `dryRun: !live`, `templateId`, `cellId`, and `campaignId`. The attempt insert stores `status` `open` and `state.delivered` true. When `fireFirstStep` is not false, the function calls `actuateChannelSend` with `purpose: input.purpose ?? "opt-in"` and then `writeEngagement` with kind `live ? "send_live" : "send_dry_run"`. The payload always carries `enrollmentId`, `attemptId`, `channel` (the owner channel), `templateId`, `cellId`, `cellIndex` `0`, `subject`, `bodyText`, and `send`. `messageId` is set only when `send.ok && !send.dryRun`. `reason` is set only when `send.ok && send.dryRun`. A live-cohort deny is therefore `send_live` with no `messageId`, with the copy present, and with `send.ok` false. A deny for any other contact is `send_dry_run` with the copy present, with no `reason`, and with `send.ok` false. The function returns `dryRun: !live` whether or not the send was denied.

**Why this is the same refusal.** `actuateChannelSend` returns the `DispatchResult` claim 21 already split into three shapes. `dispatchEmail` and `dispatchSms` return the gate’s deny before the cohort short-circuit, so a silenced contact is `ok: false` even when `shouldLiveSend` is false. A deny may also carry `dryRun: false`. The missing-Resend return does. That flag does not make the result a live accept. Claim 21 already requires the branch to be `send.ok`, and it already puts halt, silence, consent missing, and throughput on one kind because the writers do not read `detail`. This writer is the caller that still branches on `shouldLiveSend`. The chronology is the same table. `titleFor` would title the live-cohort deny as `Send · {channel} (live)` and the other deny as `Send · {channel} (dry-run)`. `outcomeFrom` reads `payload.reason` and `payload.messageId` only when `kindOf` returns `send`, and it does not read `payload.send`. `kindOf` has no `send_denied` case, so that kind is `other` and the outcome line stays empty. `titleFor` has no case for it either, so the title is the kind with the underscores turned into spaces. The inspector replays when `subject`, `bodyText`, or `bodyHtml` is on the row (`ActivityInspectDrawer`, `projectEngagementRows`). Item 76 of the bind says a body shown there is what was sent or dry-run staged. There is no `window_fired` and no `cell_advanced` beside this write. The enrollment row and the attempt row are other tables. Leaving the engagement out would leave the refusal out of the file desk-14 keeps complaint-ready. The opening of the enrollment is the step keys. The result is the kind.

**The row.** When the first step runs and `actuateChannelSend` returns `ok: false`, `writeEngagement` appends:

- `event_kind` is `send_denied`.
- `firm_id` is `input.firmId`. `contact_id` is `input.contactId`. The id is the `eng-` id that function returns.
- The payload carries `enrollmentId` (the enrollment just inserted), `attemptId`, `channel` (the owner channel passed into `actuateChannelSend`), `templateId`, `cellId`, `cellIndex` (`0`), and `send` (that `DispatchResult`: `ok: false`, and `deny`, `detail`, and `dryRun` as the value already has them).
- `subject`, `bodyText`, `bodyHtml`, `messageId`, and `reason` are not on this payload. This writer does not store `bodyHtml` today. Subject and body come off so the inspector does not replay a withheld message. The authored copy stays on the template and the campaign content the function already read.

An allowed result uses claim 21’s two kinds, from the result. `send.ok && !send.dryRun` is `send_live` with `messageId`, `subject`, `bodyText`, and `send`, plus the same step keys. `send.ok && send.dryRun` is `send_dry_run` with `reason`, `subject`, `bodyText`, and `send`, plus the same step keys. A missing address with no live test fallback, and a channel that is neither email nor text, are that dry run (`actuateChannelSend`). A live-cohort contact whose result is that dry run is `send_dry_run`. The cohort flag is not the label.

`enrollment.payload.dryRun` stays `!shouldLiveSend`, written before the send returns. The return’s `dryRun` is that same boolean. A denied live-cohort enroll keeps `dryRun` false on the enrollment and `send_denied` on the engagement. The flag is the cohort posture `shouldLiveSend` already computed. The row is the refusal. Rewriting the flag from `send.ok` would store the refusal as a dry run on the enrollment. This claim does not rewrite it. `fireFirstStep === false` writes no engagement row. When `isHaltBlockingNew` is already true, the function returns `blocked: "halt"` and writes no engagement row. A deny the gate returns after the insert, including a halt the enroll check did not see, is this row. Claim 20 already read that ordering and left it as ordering. This claim does not make it a second rule.

The attempt stays `open`. `delivered` stays as the insert wrote it. The deny does not nullify the attempt and does not enter `hasInboundOverride`. The Activity tags stay a reading of attempt state. `eventKindProse`, `titleFor`, `outcomeFrom`, `thoughtFrom`, and `kindOf` were not retuned. Claim 21 already names what those readers do with `send_denied`. This row is not a dispatch, so it is not an element of `payload.writes`. `writeEngagement`’s id is not on the function’s return. `call_agent` still pushes the enrollment id. This claim does not add the engagement id to that array. The consent select inside the gate was not specified. The branch does not read `detail`.

**Rejected alternatives.**

- Keep the kind as `shouldLiveSend`, and rely on `payload.send.ok` to carry the refusal. The list title is the kind. A live-cohort deny titles as a live send, and the body replays. A deny for any other contact titles as a dry run. `outcomeFrom` does not read `payload.send`. Claim 21 already refused this file on the tick. A deny that also carries `dryRun: false` would still be `send_live` under the cohort flag. The missing-address dry run on a live-cohort contact would stay `send_live` as well. The label is the result on the allowed arms for the same reason.

- Write no engagement row when `ok` is false. The first step has no companion chronology row. The enrollment and the attempt are other tables, and the consultant file reads `engagement_records`. Desk-14’s chronology is what occurred. `attempt_nullified` records a stop by appending a kind. Claim 21 already refused a hole on the wait arm, which is the tick path with no companion row. This path is that case.

- Use a different kind because a halt already stored never reaches this write, so the denies that do are silence, consent, and throughput rather than the tick’s halt. The branch is `send.ok`. Claim 21 already put those denies on `send_denied` without reading `detail`. A halt the gate sees after the insert has the same shape. The step keys say it is the first step of this enrollment. A second kind would make one dispatcher result two files.

- Set `enrollment.payload.dryRun` true when the send is denied, or return `dryRun` from the result, so the enrollment agrees with the refusal. The flag is written from `shouldLiveSend` before the send returns. It is the cohort posture. The refusal is the engagement row. Folding the refusal into the flag would call a live-cohort denial a dry run on the enrollment, which is the label claim 21 refused. The insert itself was not reopened.

- Block the insert so a deny never has a first step to record. The enroll check is halt. The send gate is the later call. Whether silence or a missing consent should have stopped the insert is a different obligation. This session does not decide it. The row is the record of a first step that ran.

No founder question. The chronology the licensee reads is the kind. Claim 21, the dispatcher’s three shapes, the desk titles, and the replay sentence already separate a refusal from a dry run and from a message that went out. The first step is that call, with this writer’s step keys. The cohort flag on the enrollment stays the flag it already is. Choosing the kind does not change whose license applies, and it does not change the enroll check.

**Evidence:** `server/wire-service/cascade.ts` `enrollAndActuate` (the `live` flag, the enrollment payload, the attempt insert, the `writeEngagement` arguments, the return `dryRun: !live`), `actuateChannelSend` (the missing-address dry run and the channel with no dispatcher), `writeEngagement`. `server/wire-service/dispatchSend.ts` `DispatchResult`, `dispatchEmail`, `dispatchSms`, including the missing-Resend deny that sets `dryRun: false`. `server/wire-service/sendMode.ts` `shouldLiveSend`. `docs/register/system-map/ACTUATION-REPORT.md` the shared path through `enrollAndActuate` and the gated dispatch. `src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts` `kindOf`, `titleFor`, `outcomeFrom`, `thoughtFrom`, `projectEngagementRows`. `src/app/register/prototype-ant/consultant/clientData/ActivityInspectDrawer.tsx` `hasReplay` and the raw payload. `docs/register/HUB-STRUCTURE-SYSTEM-BIND.md` item 76. `docs/register/CLIENT-DATA-BIND.md` the Activity bind. `src/app/register/theory/sme/seats/04-consultancy-desk-ops.ts` desk-14. `server/wire-service/workflowWalk.ts` `call_agent` (the enrollment pointer, `fireFirstStep: true`).

**Live.** The writer still chooses `send_live` or `send_dry_run` from `shouldLiveSend` and still stores `subject` and `bodyText` on a deny. The enrollment payload still stores `dryRun: !live` before the send returns. `titleFor` still has no `send_denied` case. No migration was written.

### Revision — claim 23

The sentence that the consent select was not specified stands as the gap. Claim 23 decides which row that select returns. The deny is still `send_denied`. This revision does not read `detail`, does not retune the kind, and does not assign `status` on the silence upsert.

### Revision — claim 43

The sentence that whether the enroll insert should have been blocked was not decided stands for `call_agent`, `handleEnrollmentCreate`, `handleOnboardingFire`, and `handleSequenceEnrollContacts`. Claim 43 decides the no-workflow reactivation enroll. When the pair would deny a non-opt-in send, that call is not made, so there is no first-step row. A first step that does run is still this claim.

### Revision — claim 44

The park for `handleOnboardingFire` stands for a first step that runs, and for `call_agent`, `handleEnrollmentCreate`, and `handleSequenceEnrollContacts`. Claim 44 decides the no-workflow opt-in enroll. A silenced pair is not passed to `enrollAndActuate`, so there is no first-step row. A missing basis still enrolls, and a first step that runs is still this claim.

---

## Claim 23 — The send reads the consent row for the firm it was given

**Standing:** technical decision made in this session.

The consent query inside `consentAndHaltGate` returns the `consent_records` row for the contact and for the firm the send was given. It does not return another firm’s row for that contact id. Claim 15’s pair is that row. Claim 19’s contact halt arm still runs after this query, so a silence or consent deny still returns first. Claim 22 still records that deny as `send_denied` and still does not read `detail`. This claim does not assign `status` on the silence upsert, and it does not specify `consent_records.sequenced`.

**The live query.** After the firm-book halt check, and only when `contactId` is present, the function runs `SELECT basis, silenced, status FROM consent_records WHERE contact_id = $1 LIMIT 1` (`dispatchSend.ts`). There is no `firm_id` and no `ORDER BY`. The firm-book arm above it already uses the `firmId` argument. The contact halt arm below it is claim 19, and the live SQL of that arm still omits `firm_id`. This claim does not retune that arm.

`consent_records` has `PRIMARY KEY (contact_id, firm_id)` (`supabase/migrations/003_ct_wire_stores.sql`). There is no foreign key to `contact_records`. Two rows for one contact id are two firms. The query names one contact and no order, so it does not name which of those rows it returns. A silenced row in another firm can be the row that denies this send. This firm’s own row can be the one it misses. An `express` basis in another firm can be the row that lets a non-opt-in purpose through. That is the gap.

**What a contact id is.** `contact_records.id` is `TEXT PRIMARY KEY`, and `firm_id` is not part of that key (`supabase/migrations/004_machine_tables.sql`). One id is one book row and one firm. Claim 18 already recorded that the same person on two books is two ids, and that the same id can still hold a second firm’s consent because this table’s key is the pair. Claim 15 already re-reads that pair for the opt-out listener: `contact_id` plus the walk’s firm. The send gate is the reader that still drops the firm.

**The firm the send was given.** The gate’s second argument is that firm. `dispatchEmail` and `dispatchSms` pass `input.firmId` before the cohort short-circuit. `dispatchEmailLive` and `dispatchSmsLive` call the gate again with the same argument. `actuateChannelSend` passes `input.firmId` into those functions, and it loads the address with `contact_records.id` and that same `firm_id`. The first step passes `enrollAndActuate`’s `input.firmId`. On `call_agent` that is the walk’s firm. The escalation, the cell advance, and the wait arm each pass `attempt.firm_id`. `handleCemSend` and `handleSmsSend` pass `requireSessionFirm` and do not use `body.firmId`. Those are the firms already on the call. This claim does not reclassify which of them are new sends.

**The row.** The select is `SELECT basis, silenced, status FROM consent_records WHERE contact_id = $1 AND firm_id = $2 LIMIT 1`. `$2` is the `firmId` the gate was given. The primary key makes that pair one row. `LIMIT 1` stays. There is no `ORDER BY`. A row whose `firm_id` is some other firm is not this row.

The arms already on the function stay, and they read this row only. `silenced` true, or `status` equal to `silenced`, returns `{ allow: false, deny: "policy", detail: "silenced" }`, including when `purpose` is `opt-in`. When `purpose` is not `opt-in`, a missing row or `basis` `none` returns `{ allow: false, deny: "policy", detail: "consent missing" }`. `docs/register/system-map/ACTUATION-REPORT.md` already states those two arms: an opt-in purpose may proceed without a prior consent basis, and silence always blocks. A missing pair is the missing-row arm. Another firm’s row does not fill it, so another firm’s silence does not deny this send, and another firm’s `express` basis does not satisfy it. When the send names no contact, the function still returns after the firm-book check and does not run this select.

This claim does not decide what the silence upsert writes into `status`. An insert from `handleConsentSilence` still leaves the column default, and the `silenced` arm still sees the boolean that statement sets. Reading `status` on the firm’s row is not an assignment to that column. `consent_records.sequenced` still has a matcher case and a catalog label, and no dispatch. This claim does not add one.

**Why this is the pair the product already writes.** `SYSTEMS-STORY` §6 requires firm→client consent, and it forbids treating firm database authority as the end-client’s consent. The silence that follows is CASL and SMS by geography, for firm→client and for the first agent→consultant text. The select does not need that silence. The columns and the opt-in exemption are already the gate. The question is which row those arms see. `docs/register/how/contact-consent.md` is a firm-branded request; Agree and Ignore are read by the runners of that request. `docs/register/how/contact-silence.md` says the commit stops further automatic firm→client outreach, and that send gates read the state. The writers upsert the pair: `handleConsentSet` and `handleConsentSilence` take `firmId` from the body, and the silence dispatch walks that firm (claim 15); `handleContactSeatConsent` and `handleContactSeatSilence` use the link’s firm; the hard-bounce upsert uses the outbound message’s `firm_id`. `projectSeat`, `isWorkspaceOut`, and `handleContactWorkspacesList` read the pair. Door 1 lists silenced rows of the firm. The seat of the sending firm shows this pair. It does not show the other firm’s row. Allowing or denying from that other row would govern this firm’s message by a state this firm’s seat does not show. Claim 18 closed that split for a contact halt on the enroll. Claim 19 closed it for a contact halt on the send. Consent is the same shape, and the pair key is how this table already keeps the second firm’s state apart.

`scripts/verify-deny-gates.ts` inserts the silenced pair for `firm-cedar` and dispatches with that firm. It does not insert a second firm’s row, so it does not decide the split. It does agree with the pair on the path it writes.

**Rejected alternatives.**

- Leave `WHERE contact_id = $1 LIMIT 1`. That is the live SQL. Two firms are two rows, and the query does not name which one returns. Another firm’s silence denies this send, including an opt-in, and this firm’s silence can be missed. Another firm’s `express` basis can satisfy a non-opt-in purpose when this firm has no row or `basis` `none`. The seat that shows consent for this send’s firm is the pair. The board argument claim 18 used for halt is this seat. The index is not the reason: this table’s primary key is already the pair.

- Treat any denying row for the contact id as the deny, and any `express` row as the basis. That still applies another firm’s consent to this firm’s message. Claim 18 already refused a halt that followed the contact id into every firm. The id is one book row. The same person on another book is another id. The second consent row is the other firm’s state for this id, which is why the key is a pair.

- Add `ORDER BY updated_at DESC` and still omit `firm_id`. The query would name a row. The row would be the newest write across firms. A later silence in the other firm would deny this firm’s send, and a later `express` there would satisfy it. Claim 15’s readers ask for the current row of the pair, not the newest pair for the contact. Claim 7 and claim 8 already refused “latest” as the way to name a row this run is acting on.

- Match `contact_records.firm_id` instead of the firm on the call. The address lookup already uses the send’s firm. On a desk-written pair the book firm and the send firm are the same, because the book row has one firm. They differ when a firing names an id whose book row is another firm and the send is stamped with the walk’s firm. Claim 19 rejected this match for the halt. Using the book firm would let the book firm’s consent govern a send the walk’s firm is making, or would ignore a silence stored for the walk’s firm. The firm the send is acting as is the firm already passed in.

- Require the consent firm to equal both the send’s firm and the book firm. The second conjunct holds for every pair written for a client of that book. It adds a `contact_records` read to a lookup the consent key already answers, and it makes a walked id whose book sits in another firm fail the gate for want of a book match. That is the audience cut. The predicate stays on `consent_records`.

- Join another firm’s contact by email or phone and honor that firm’s consent. Claim 18 refused that join for halt. Email and phone are not unique. Two books are two ids. This claim does not add a person table.

- Read the stand-in map as the product’s choice of “one row per contact.” `standInConsentSilence` keeps one slot per `contactId`, stores `firmId` on the slot, and `get` does not take a firm. A second firm’s `silence` or `setConsent` replaces the slot. The table keeps both pairs. The map cannot. `standInSendGate` calls `get(input.contactId)` only when `contactId` is set. The `decide` calls in `FirmOperationsBindModule.tsx` pass the firm and do not pass a contact, so that consent arm does not run there. The map is the same dropped firm, in a store that is not this table. It does not settle the select.

- Fill the CASL silence in order to choose the row. `SYSTEMS-STORY` §6 leaves geography and the first agent→consultant text unnamed. The gate already has `basis`, `silenced`, `status`, and the opt-in exemption. Which row those arms see is the pair. Choosing express against implied, or a country, is not required to name it.

- Assign `status` `silenced` on the silence upsert so the selected row’s `status` matches the boolean. The select names the row either way. The boolean arm already denies an insert that set `silenced`. Changing `status` is a different write. `consent_records.sequenced` is a different event. Neither is this predicate.

- Retune claim 22 so a consent deny from the wrong firm is a different kind from a halt deny. The writers branch on `send.ok`. Claim 22 does not read `detail`. Which row produced the deny is this claim. The file stays one kind.

No founder question. Another firm’s consent row denying or allowing this firm’s send is the split claim 18 and claim 19 already closed for halt. The book id is one firm. The consent key is the pair so a second firm’s state stays on its own row. The send was given a firm, and every writer of the row the seat shows already stores that firm. The regime silence in the story is not which row the gate loads.

**Evidence:** `dispatchSend.ts` `consentAndHaltGate`, `dispatchEmail`, `dispatchSms`, `dispatchEmailLive`, `dispatchSmsLive`. `cascade.ts` `actuateChannelSend` (the address lookup and `firmId: input.firmId`), `enrollAndActuate` (the first step’s `firmId`), `escalateAttemptWindow`, `advanceTemplateCellIfDue`, and the wait arm in `tickOnce` (`firmId: attempt.firm_id`). `send.ts` `handleCemSend`, `handleSmsSend` (`requireSessionFirm`). `stores.ts` `handleConsentSet`, `handleConsentSilence`, `handleConsentGet`. `contactSeat.ts` `projectSeat`, `isWorkspaceOut`, `handleContactWorkspacesList`, `handleContactSeatConsent`, `handleContactSeatSilence`. `webhooks.ts` the `bounce_hard` upsert. `eventTest.ts` door 1 for `consent_records.opt_out`. `src/app/wire/standins/consentSilence.ts`. `src/app/wire/standins/sendGate.ts`. `src/app/wire/ports.ts` `ConsentSilencePort`. `src/app/register/prototype-ant/operator/FirmOperationsBindModule.tsx` the `decide` calls. `supabase/migrations/003_ct_wire_stores.sql` `consent_records`. `supabase/migrations/004_machine_tables.sql` `contact_records` and the `status` column. `scripts/verify-deny-gates.ts`. `docs/register/SYSTEMS-STORY.md` §6. `docs/register/how/contact-consent.md`. `docs/register/how/contact-silence.md`. `docs/register/system-map/ACTUATION-REPORT.md`.

**Live.** The select is still `WHERE contact_id = $1 LIMIT 1` with no `firm_id` and no `ORDER BY`. Another firm’s row can still be the row that denies or allows. No migration was written.

### Revision — claim 24

The sentence that `handleConsentGet` was seen and not specified stands as the gap. Claim 24 specifies that route. It returns one row for the contact id, or the defaults, because no caller of it is acting as a firm. This claim’s select is unchanged. The live send query still omits `firm_id`. The arms on `silenced`, `status`, `basis`, and `purpose` were not retuned. The silence upsert still does not assign `status`.

### Revision — claim 25

The sentence that this claim does not decide what the silence upsert writes into `status` stands as the gap. Claim 25 decides that write. The insert keeps the default `unsequenced`. The conflict keeps the previous `status`. The arms on `silenced`, `status`, `basis`, and `purpose` were not retuned.

### Revision — claim 26

The status arm was not retuned. Claim 26 is the seat write. After that conflict, a row whose `status` was `silenced` holds `unsequenced`, so the arm does not deny it. A row that still holds `silenced` is still denied. The compare stays equality to that literal.

---

## Claim 24 — The consent get returns one row for the contact id

**Standing:** technical decision made in this session.

`handleConsentGet` returns `basis`, `silenced`, and `source` from one `consent_records` row whose `contact_id` is the path parameter, or the defaults when no such row exists. It does not return the row for a firm the caller is acting as. No caller of `GET /consent/:contactId` is acting as a firm, and the handler does not resolve one. The route has no firm argument because of that. Claim 23’s pair is the row a send reads. This route does not send. This claim does not retune that select or its arms, and it does not assign `status` on the silence upsert.

**The route.** `routes.ts` maps `GET /consent/:contactId` to `handleConsentGet`. The handler reads `contactId` from the path. The query is `SELECT basis, silenced, source FROM consent_records WHERE contact_id = $1 LIMIT 1`. There is no `firm_id` and no `ORDER BY`. It does not call `requireSessionFirm`. The body is `{ basis: row?.basis ?? "none", silenced: row?.silenced ?? false, source: row?.source ?? null }`. A missing row and a stored row of basis `none`, silenced false, and a null source are the same body. `consent_records` is still `PRIMARY KEY (contact_id, firm_id)`. Two firms are two rows. `LIMIT 1` does not name which of them returns.

**Who calls it.** `realConsentSilence.get` is the function that requests that path. It passes the contact id and no firm. `ConsentSilencePort.get` is typed `get(contactId: string)` and the promised value is `basis` and `silenced`. The HTTP body also carries `source`. The port type does not. `wireFetch` sends the session cookie on every wire request. The comment there says the cookie carries `firm_id` for binding. This handler does not read the cookie, the `x-firm-id` header, or a `firmId` query.

The only call of `wirePorts.consentSilence.get` is `ContactPrototypeScene`. On mount it passes `DEMO_CONTACT_ID`, the string `sarah`, and copies `state.silenced` into the scene’s local state. The scene’s `setConsent` and `silence` pass `FIRM_BRAND.firmId`, which is `firm-cedar`. The get does not. The register canvas renders that scene when `ctDesk` is `contact` and the click-through is the DS-I canvas. The default desk is `consultant`. The default design system is `dsi`. The ant branch of the same panel renders `ContactAntScene`, which does not call `consentSilence.get`. `/register` is `RegisterPage`. The product face is `/prototype-ant`.

The product-face contact workspace calls `consentContactSeat` and `consentContactWorkspace`. Those post to the seat routes. `projectSeat` reads `basis`, `silenced`, and `source` with `WHERE contact_id=$1 AND firm_id=$2`. That firm is the link’s firm. The operator bind screen calls `wirePorts.sendGate.decide` with `firmId`, channel, purpose, and posture, and with no contact. `registry.ts` sets `sendGate` to `standInSendGate` even when `consentSilence` is `realConsentSilence`. Those `decide` calls do not request this path. `realSmsApi.send` posts `/send/sms`, which is the send of claim 23. No script requests `GET /consent/:contactId`. `scripts/verify-modular-surfaces.ts` calls `standInConsentSilence.get`, which does not query this table.

`sarah` is a client id in `src/app/data/clients.ts`. It is not a `contact_id` in `supabase/seeds`. A table with no row for that id returns the defaults. A later `silence` or `setConsent` from the same scene inserts `(sarah, firm-cedar)`. Another firm’s row for `sarah`, when one exists, remains a row this query can return.

**What the read is for.** It is the real adapter of `ConsentSilencePort.get`. It answers the basis and the silenced flag stored against that contact id, and it puts `source` on the HTTP body. The register prototype uses the flag to paint its Silence / Opt out surface for the demo id. It does not decide a send. It does not paint the product-face seat. It does not paint the operator bind screen. Those surfaces already read a firm: the seat by the link, the send by the firm the send was given.

**Rejected alternatives.**

- Add `firm_id` and return the row for a firm the caller is acting as, the way claim 23 names the send and the way `projectSeat` names the link. No caller of this route is acting as a firm. The port’s `get` does not take a firm. The handler does not resolve a session. The product-face read of these three columns for a firm is already `projectSeat`. Adding a firm on this route would invent that caller.

- Read `requireSessionFirm` from the cookie `wireFetch` already sends. The cookie is on every wire call because binding needs it. This handler is not that binding. The register scene passes a demo contact id and does not present itself as the session firm. An operator session does not call this route. Requiring the session would refuse a get that today returns the defaults with no session, and it would answer `sarah` from whatever firm the cookie names. That firm is not the `firm-cedar` the scene writes on `setConsent` and `silence`.

- Use `FIRM_BRAND.firmId` (`firm-cedar`) because the same scene writes with that constant. The get does not receive the constant. The route is not the scene. A request for some other contact id would then return only Cedar’s row. The scene is the register prototype. It is not an operator on the product face acting as Cedar.

- Treat any silenced row for the contact as the flag, or any `express` row as the basis. Claim 23 refused that for a send, because another firm’s state would govern this firm’s message. This route does not send. The query is `LIMIT 1`, not a search for a denying row. A rule that any firm’s silence wins would be a new cross-firm obligation for a paint the product face does not show.

- Add `ORDER BY updated_at DESC` and still omit `firm_id`. The newest write across firms would become the contact’s answer. The caller did not ask for a firm, and did not ask for the newest firm. Claim 23 already refused “latest” as the name of the row a send acts on. This get is not that send.

- Read the stand-in map as the row this query returns. `standInConsentSilence` keeps one slot per `contactId`, stores `firmId` on the slot, and replaces the slot when another firm writes. `get` does not take a firm. `standInSendGate` calls that `get` only when a contact is passed, and the bind screen’s `decide` calls do not pass one. `standInSmsApi` calls it when it has a contact. The map is not `consent_records`. It was not retuned. It does not choose the SQL row.

- Assign `status` on the silence upsert, specify `consent_records.sequenced`, or fill the CASL silence in `SYSTEMS-STORY` §6, in order to name this row. This select does not read `status`. The upsert and the sequenced event are other writes. The story’s geography is not which row an unscoped get returns.

No founder question. Whose consent binds a send, and whose consent the seat shows, are already the pair. This get sits outside those reads because the caller is not acting as a firm. When two rows exist, which one `LIMIT 1` returns can change the boolean the register prototype paints for `sarah`. It does not change the operator’s desk, the send, or the client seat.

**Evidence:** `stores.ts` `handleConsentGet`. `routes.ts` `GET /consent/:contactId`. `src/app/wire/reals/consentSilence.ts` `get`. `src/app/wire/ports.ts` `ConsentSilencePort`. `src/app/wire/http.ts` `wireFetch`. `server/wire-service/sessionFirm.ts` `requireSessionFirm`. `src/app/register/prototype/ContactPrototypeScene.tsx` the mount effect, `DEMO_CONTACT_ID`, `applyConsent`, `applySilence`. `src/app/wire/firmBrand.ts` `FIRM_BRAND`. `src/app/wire/demoIds.ts` `CT_DEMO.firmId`. `src/app/register/prototype/RegisterPrototypeCanvas.tsx`. `src/app/register/context/RegisterShellContext.tsx` `ctDesk` default `consultant`, `loadCtDesignSystem` default `dsi`. `src/app/register/components/RegisterClickThroughPanel.tsx`. `src/app/register/prototype-ant/AntCtHost.tsx` `ContactAntScene`. `src/app/Router.tsx` `/register` and `/prototype-ant`. `src/app/register/prototype-ant/contact/ContactWorkspace.tsx`. `src/app/wire/reals/machineApi.ts` `consentContactWorkspace`, `consentContactSeat`. `src/app/wire/reals/smsApi.ts` `realSmsApi.send`. `contactSeat.ts` `projectSeat`. `src/app/register/prototype-ant/operator/FirmOperationsBindModule.tsx` the `decide` calls. `src/app/wire/registry.ts` `sendGate` and `consentSilence`. `src/app/data/clients.ts` id `sarah`. `supabase/migrations/003_ct_wire_stores.sql` `consent_records`. `scripts/verify-modular-surfaces.ts` `trialConsent`.

**Live.** The query is still `WHERE contact_id = $1 LIMIT 1` with no `firm_id` and no `ORDER BY`. No firm argument was added. No migration was written.

### Revision — claim 25

The sentence that this claim does not assign `status` on the silence upsert stands as the gap. Claim 25 specifies that statement. This get is unchanged. It still does not read `status`.

---

## Claim 25 — The silence upsert does not assign `status`

**Standing:** technical decision made in this session.

`handleConsentSilence` does not assign `consent_records.status`. An insert keeps the column default `unsequenced`. A conflict keeps the `status` the row already held. The statement still sets `silenced` true. Claim 23’s boolean arm denies that row. No reader treats `status` `unsequenced` as the contact’s silence, so the default does not let the send through. This claim does not retune that arm, does not add a firm to `handleConsentGet`, and does not specify `consent_records.sequenced`.

**The statement.** The insert in `handleConsentSilence` lists `contact_id`, `firm_id`, `basis`, `silenced`, `source`, and `updated_at`. The values are the body’s contact, the body’s firm, `basis` `none`, `silenced` true, the body’s source, and `now()`. The conflict update sets `silenced` true, `source` to this call’s source, and `updated_at` to `now()`. Neither clause names `status`. `supabase/migrations/004_machine_tables.sql` defines the column `TEXT NOT NULL DEFAULT 'unsequenced'` with a check of `unsequenced`, `waitlisted`, `sequenced`, and `silenced`. A new pair stores `status` `unsequenced` and `silenced` true. A pair that already exists keeps its `status`, including a previous `sequenced` or `waitlisted`.

**What the one-time update was.** The same migration, after the `ADD COLUMN`, runs one `UPDATE`. When `silenced` is true it sets `status` to `silenced`. When `basis` is `express` or `implied` it sets `status` to `sequenced`. Otherwise it sets `unsequenced`. The `WHERE` is `status = 'unsequenced'` and (`silenced` is true or that basis). The comment says `consent_records` is extended for waitlisted. The statement runs with the migration. It is not a trigger, and it does not run when `handleConsentSilence` inserts. Rows written after the migration keep the default unless the insert names the column. The silence route does not name it. The seat seeds insert `basis` and `silenced` and do not name it (`supabase/seeds/004_contact_seat.sql`, `supabase/seeds/005_contact_workspace_fill.sql`). `docs/register/SYSTEMS-GOAL.md` already records that the cascade does not write `waitlisted` or `sequenced`.

**Readers of `status`.** The only product query that reads `consent_records.status` is the select inside `consentAndHaltGate`: `SELECT basis, silenced, status`, then deny when `silenced` is true or `status` equals `silenced`, including when `purpose` is `opt-in`. The status compare is equality to the literal `silenced`. The value `unsequenced` does not deny, and it does not allow a row whose `silenced` is true. When this upsert has set `silenced` true, the boolean arm denies whether `status` is the default or a previous `sequenced` or `waitlisted`. Claim 23 left that arm as it is. This claim does not retune it.

`projectSeat` selects `basis`, `silenced`, and `source` for the pair and does not select `status`. The boolean skips the form fields and is returned on the payload. `now.state` is set from the basis and the objective. The payload type allows `now.state` `silenced`, and this function does not assign it. `handleConsentGet` selects the same three columns by `contact_id` and does not select `status`. Door 1 selects every column of `consent_records` where `silenced` is true. The filter is the boolean, so a row this upsert inserted is in that set, and the returned `status` is `unsequenced`. That reader does not compare `status`. `isWorkspaceOut` and `handleContactWorkspacesList` read `workspace_opted_out`. `loadWriteRow` has no branch for `consent_records` and returns null, so a configured If does not currently receive the column. Claim 15’s re-read is `SELECT *`. On an insert it sees `status` `unsequenced` and `silenced` true. No seeded graph picks `consent_records.status`. `ConsentStatus` in `src/app/wire/machineTypes.ts` is not imported. The contact indicator in `src/app/data/contacts.ts` is `client.optedIn`. It does not read this column. `executeAuditRun` sets `sequence_ready.ready` from the presence of email and phone. It does not read `consent_records`. `standInSendGate` denies when the stand-in boolean is true. That row has no `status`. It was not retuned.

`scripts/verify-deny-gates.ts` and `scripts/verify-ship-spine.ts` insert `status` `silenced` beside `silenced` true. That is the script’s row. It is not this upsert. Other verify scripts insert `status` `unsequenced` with `basis` `express` and `silenced` false. They do not derive `status` from the boolean.

**Why the default stands.** A reader that treated `status` as the silence would see `unsequenced` and treat this contact as unsequenced. That reader is not in the send, the seat, the get, door 1, the loader, or the audit. The boolean is the silence those readers use. The status arm denies only when the stored value is already `silenced`. This upsert does not store that value. Leaving the default, and leaving a previous `sequenced` or `waitlisted` on conflict, does not open the send.

**Rejected alternatives.**

- Assign `status` `silenced` on the insert and on the conflict, copying the migration’s `WHEN silenced THEN 'silenced'`. That `UPDATE` aligned rows that already existed when the column was added, so they would not all sit at the new default. It is not this statement. No later reader classifies the contact from `unsequenced`. The boolean arm already denies. Writing `silenced` on conflict would replace a `sequenced` or `waitlisted` value this call did not come to change. `SYSTEMS-GOAL` already says those two values are not written by the cascade. This route is not the writer that starts them.

- Assign `status` `silenced` only on the insert, and leave the conflict’s previous `status`. The insert’s default is safe for the same reason the conflict’s previous value is safe. The two clauses store one silence. No reader asks a new row and a repeated silence to carry different words.

- Copy the migration’s full `CASE`, including `basis` `express` or `implied` to `sequenced`. This statement sets `basis` `none` on insert and does not assign `basis` on conflict, and it sets `silenced` true, so the `silenced` arm of that `CASE` would win on every row this call touches. The `sequenced` arm would not run. `consent_records.sequenced` is still a catalog event with a matcher and no dispatch. It is not this column write.

- Treat `SYSTEMS-STORY` §6’s sequenced / silenced / unsequenced word as a reason to write `status` although no reader classifies from it. Claim 15 located that word on this column. The readers that treat silence read the boolean, which `supabase/migrations/003_ct_wire_stores.sql` stored before the column existed. The seat, the send, and the get do not show `status`. Leaving the default does not change which firm’s row the send reads, and it does not choose a consent regime. The CASL silence in that section stays unnamed.

- Retune claim 23 so the gate stops reading `status`. The arm stays. It denies a row whose `status` is already `silenced`. This upsert does not produce that row. Changing the arm is a different read.

- Specify `handleContactSeatSilence` or the hard-bounce upsert as this same omission. Both write the pair and both omit `status`. They are other statements. This claim names the silence route.

No founder question. The two writes were assign `status` `silenced`, or leave the default and the previous value. The boolean already denies, and no reader treats `unsequenced` as the silence. The operator does not see the column. The distinction does not change which firm’s consent binds the send. The values `waitlisted` and `sequenced` stay the write `SYSTEMS-GOAL` already says the cascade does not do.

**What this leaves.** `handleContactSeatConsent` sets `silenced` false and does not assign `status`. `handleConsentSet` on conflict does not assign `silenced` or `status`. The gate still denies when `status` equals `silenced` and the boolean is false. The migration’s one-time `UPDATE` is the production statement that stores that value. A row it marked `silenced` stays denied after a later Agree clears the boolean. That interaction was not specified. It is not this upsert.

**Evidence:** `stores.ts` `handleConsentSilence`, `handleConsentSet`, `handleConsentGet`. `dispatchSend.ts` `consentAndHaltGate`. `contactSeat.ts` `projectSeat`, `handleContactSeatConsent`, `handleContactSeatSilence`, `isWorkspaceOut`, `handleContactWorkspacesList`. `webhooks.ts` the `bounce_hard` upsert. `eventTest.ts` door 1 for `consent_records.opt_out`. `workflowWalk.ts` `loadWriteRow`. `auditRun.ts` `executeAuditRun`. `src/app/wire/machineTypes.ts` `ConsentStatus`. `src/app/data/contacts.ts` `contactIndicatorFromClient`. `src/app/wire/standins/sendGate.ts`. `src/app/wire/standins/consentSilence.ts`. `supabase/migrations/003_ct_wire_stores.sql` `consent_records`. `supabase/migrations/004_machine_tables.sql` the `status` column and the one-time `UPDATE`. `supabase/seeds/004_contact_seat.sql`. `supabase/seeds/005_contact_workspace_fill.sql`. `scripts/verify-deny-gates.ts`. `scripts/verify-ship-spine.ts`. `docs/register/SYSTEMS-STORY.md` §6. `docs/register/SYSTEMS-GOAL.md`. `docs/register/system-map/SCHEMA-REPORT.md`.

**Live.** The insert still omits `status`. The conflict update still omits `status`. No migration was written.

### Revision — claim 26

The sentence that a row the migration marked `silenced` stays denied after a later Agree clears the boolean stands as the gap. Claim 26 decides that seat write. When the stored `status` is `silenced`, the conflict sets `unsequenced`. The silence upsert still does not assign `status`. The arms were not retuned.

### Revision — claim 42

The rejected alternative that `handleContactSeatSilence` and the hard-bounce upsert were other statements stands as the scope of this route. Claim 42 specifies their `status`. Neither assigns it. This silence upsert is unchanged.

---

## Claim 26 — The seat consent that clears the boolean moves `status` off `silenced`

**Standing:** technical decision made in this session.

`handleContactSeatConsent` clears `silenced` and, on conflict, when `consent_records.status` is `silenced`, sets that column to `unsequenced`. An insert still omits `status` and keeps the default `unsequenced`. A conflict whose `status` is `waitlisted`, `sequenced`, or `unsequenced` keeps that value. The contact who has agreed is not denied by claim 23’s status arm. Claim 23’s compare is unchanged. Claim 25’s silence upsert still does not assign `status`. This claim does not write `waitlisted` or `sequenced`, and it does not dispatch `consent_records.sequenced`.

**The statement.** `routes.ts` mounts the handler at `POST /contact-seat/:token/consent` and `POST /machine/contact-workspaces/:contactId/consent`. The body action `agree` stores `basis` `express` and `source` `contact_workspace`. Any other action, including `ignore`, stores `basis` `none` and `source` `ignored`. Both go through one upsert. The insert lists `contact_id`, `firm_id`, `basis`, `silenced`, `source`, and `updated_at`, with `silenced` false. The conflict of `(contact_id, firm_id)` sets `basis`, `silenced` false, `source`, and `updated_at`. The pair is the link’s contact and the link’s firm. The handler then returns `projectSeat` for that link. It does not dispatch.

The conflict also assigns `status`:

`status = CASE WHEN consent_records.status = 'silenced' THEN 'unsequenced' ELSE consent_records.status END`.

The insert does not name the column. A new pair takes the default `unsequenced` from `supabase/migrations/004_machine_tables.sql`. That default is already off the deny word. The `CASE` runs only on a pair that already exists. It moves the literal `silenced` and leaves the other three checked values where they are.

**What Agree is for.** `docs/register/how/contact-consent.md` leaf 1.2 says Agree writes the consented state that engagement runners read, and that this unlocks later nudges. Ignore writes the no-deeper state. The same leaf says a silenced contact does not receive the opt-in send. The seat route still accepts the click. `projectSeat` does not read `status`. It treats `basis` `express` as the consent ask finished, and it loads form fields when `silenced` is false. After Agree the seat already shows a contact who is not silenced. The runner that still blocks the nudge is `consentAndHaltGate`. Claim 23 denies when `silenced` is true or `status` equals `silenced`, including an opt-in purpose. With the boolean cleared and `basis` `express`, the basis arm allows a purpose that is not `opt-in`. The status arm is the deny that remains if the word stays `silenced`. A nudge is that later send. `workflowWalk.ts` passes purpose `opt-in` for an opt-in class and `cem` otherwise. `cem` is not exempt. Leaving the word denies it with detail `silenced`.

**What the one-time update was.** `supabase/migrations/004_machine_tables.sql` adds `status` for the waitlist rung. The comment says `consent_records` is extended for waitlisted. One `UPDATE` then copies rows that were still `unsequenced`: `silenced` true becomes `status` `silenced`, and `basis` `express` or `implied` becomes `sequenced`, with silence winning when both match. It runs with the migration. It is not a trigger. Claim 25 already recorded that it is not the silence upsert. It is not a writer on this Agree. Seeds inserted after it omit `status` and keep the default. No later production statement assigns `consent_records.status`. The word `silenced` on a live row is that backfill, or a script that built the row. `scripts/verify-deny-gates.ts`, when it wants the silence deny to stop, sets `silenced` false and `status` `unsequenced` together. That is the script’s row. It is not this route. It agrees that the word alone keeps the deny.

A contact silenced after the migration, through `handleConsentSilence`, has `silenced` true and, on an insert, `status` `unsequenced`. Agree already unlocks that row, because the boolean clear is enough and the word was never `silenced`. The row this claim changes is the one the backfill marked, including a later silence that kept that previous `status` under claim 25. After Agree the boolean is false and the word would still say `silenced`. The seat would show the consent as given. The send would still be denied.

**Why that contact is not blocked.** The backfill labeled the boolean as it stood when the column appeared, so a reader of the new word would not see every existing row as `unsequenced`. It did not leave a latch. Consent is the current row of the pair, which claim 15 already treated as one state rather than a log. Agree replaces `basis`, `silenced`, and `source` on that row. The status arm denies the stored word. It does not ignore a later write that changes the word. After this conflict the word is `unsequenced` whenever it had been `silenced`. The boolean is false. `basis` is `express`. Claim 23’s consent arms allow the send. A halt on the same contact is still claim 19. This claim does not retune that arm.

Ignore is the same statement. It also clears the boolean, so the same `CASE` moves a stored `silenced` to `unsequenced`. The basis arm then denies a purpose that is not `opt-in`, because `basis` is `none`. An opt-in purpose is the exemption claim 23 already kept. A post-migration Ignore on a default `unsequenced` row already had that shape. The `CASE` makes the backfilled row the same shape. It does not turn Ignore into a silence.

**What stays put.** `handleConsentSet` on conflict updates `basis`, keeps `source` with `COALESCE`, and does not assign `silenced` or `status`. Its insert sets `silenced` false, and a new pair takes the default `unsequenced`. The conflict is the basis write claim 15 left off the opt-out dispatch. `ContactPrototypeScene` calls it. `standInConsentSilence.setConsent` keeps the previous boolean. Neither is the product-face Agree. `ContactWorkspace.tsx` posts the seat routes. A conflict that leaves `silenced` true stays denied by the boolean arm. If that row’s `status` is also `silenced`, the status arm denies it too. Moving the word there would not open the send. This claim does not assign `status` on that conflict.

`handleConsentSilence`, `handleContactSeatSilence`, and the hard-bounce upsert are other writers of the pair. They are not this clear. Claim 25 stands. `standInContactSeat.consent` keeps the previous boolean. That map is not this row.

**Rejected alternatives.**

- Leave `status` `silenced` on the seat conflict, and let the arm keep denying because it does not read the boolean. That is the live SQL. The contact who agreed has `basis` `express` and `silenced` false, and the seat already shows the consent as given. The send still returns detail `silenced`, including the nudge the consent leaf says the runners unlock. The word was copied from the boolean once, at column-add. No production statement assigns `status` after that, so the word would outlast every later Agree. The arm stays a deny of whatever value is stored. This write changes the value.

- Set `status` `sequenced` on Agree, copying the backfill’s second arm. After Agree the boolean is false and `basis` is `express`, which is the row that arm would have labeled `sequenced`. `docs/register/SYSTEMS-GOAL.md` says the cascade does not write `waitlisted` or `sequenced`. Sign-up met is the campaign goal that lands on `sequenced`. The system map’s opt-in phase says success goes to `consent_state` sequenced. Agree is the consent button that unlocks nudges. It is not that completion. The gate treats `unsequenced`, `waitlisted`, and `sequenced` alike. Writing `sequenced` would not change the send, the seat, or which firm’s row binds it. It would claim the rung this statement does not own.

- Set `status` `unsequenced` on every seat conflict, including a stored `sequenced` or `waitlisted`. Those two values are the rungs the goal says this class of write does not own. Claim 25 refused to replace them when silence ran. Replacing them here would drop a completion the seat consent did not come to record. The deny word is the literal `silenced`. The `CASE` moves that literal and leaves the other three.

- Set `status` `waitlisted`. Waitlisted is the launch-day rung in the same goal. Agree is not that signal. The same non-write applies.

- Retune claim 23 so `status` `silenced` does not deny when `silenced` is false. The compare stays. A row that still holds the word is still denied, including a backfilled row that has not been through this seat consent. Changing the arm would make the backfill’s word invisible. This claim moves the word on the consent that cleared the boolean.

- Assign `status` on `handleConsentSilence` so a later Agree has a matching word to clear. Claim 25 leaves the silence upsert without that assignment. The boolean arm denies that route. The backfill is the production statement that stored `silenced`. This consent does not rewrite that route in order to meet it.

- Treat `handleConsentSet`’s conflict as the same clear. It does not assign `silenced`. A previous silence stays, and the boolean arm denies. The product-face Agree is the seat statement, which already sets the boolean false.

- Copy the backfill’s full `CASE` onto this conflict, as an ongoing rule. The `UPDATE` is not a writer on Agree. Its `sequenced` arm is the writer the goal does not give this statement. Its `silenced` arm would put the word back on a statement that just cleared the boolean.

- Fill the CASL silence in `SYSTEMS-STORY` §6 in order to decide whether an agreed contact may be sent to. The leaf already says the runners unlock later nudges. The seat statement already clears the boolean. The regime, the geography, and the first agent→consultant text stay unnamed. They are not which word this conflict stores.

- Write a migration that rewrites every current `status` `silenced` to `unsequenced`. Rows that never come back through this seat stay as the backfill left them, and claim 23’s arm still denies those. The consent that clears the boolean is the write that moves the word. No migration.

No founder question. Blocked and not blocked are different sends, and the consent leaf already chooses the second for a contact who agreed. The seat already clears the boolean and already shows that contact as consented. The status word is the backfill’s copy of the boolean, not a second silence the seat is forbidden to move. `unsequenced` is the checked value that is off that word and is not the opt-in rung. `sequenced` and `waitlisted` would not change the send. The silence route stays as claim 25 wrote it.

**Evidence:** `contactSeat.ts` `handleContactSeatConsent`, `projectSeat`. `routes.ts` the two consent posts. `stores.ts` `handleConsentSet`, `handleConsentSilence`. `dispatchSend.ts` `consentAndHaltGate`. `workflowWalk.ts` the purpose passed on `call_agent`. `webhooks.ts` the `bounce_hard` upsert. `src/app/register/prototype-ant/contact/ContactWorkspace.tsx` `consent("agree")`. `src/app/wire/standins/contactSeatMirror.ts` `consent`. `src/app/wire/standins/consentSilence.ts` `setConsent`. `src/app/register/prototype/ContactPrototypeScene.tsx` the `setConsent` call. `supabase/migrations/004_machine_tables.sql` the `status` column and the one-time `UPDATE`. `scripts/verify-deny-gates.ts`. `docs/register/how/contact-consent.md` leaf 1.2. `docs/register/SYSTEMS-GOAL.md` the opt-in row and “Sign-up met = CAMPAIGN GOAL → consent sequenced”. `src/app/system-map/data/nodes.ts` `optin_phase`. `docs/register/SYSTEMS-STORY.md` §6.

**Live.** The seat conflict still sets `basis`, `silenced` false, `source`, and `updated_at`, and it still omits `status`. A backfilled `silenced` stays denied after Agree. No migration was written.

### Revision — claim 27

The sentence that this claim does not write `waitlisted` or `sequenced`, and does not dispatch `consent_records.sequenced`, stands. Claim 27 is that event. The seat conflict remains the move off `silenced`, and it remains off those two values.

### Revision — claim 41

The sentence that `standInContactSeat.consent` keeps the previous boolean, and that that map is not this row, stands as a description of the live mirror. The server statement remains this claim. Claim 41 is the mirror’s Agree. It sets `silenced` false. This conflict’s `CASE` on `status` was not retuned.

---

## Claim 27 — `consent_records.sequenced` is not a firing

**Standing:** technical decision made in this session.

No production statement dispatches `consent_records.sequenced`. No production statement sets `consent_records.status` to `waitlisted`. The only statement that sets `status` to `sequenced` is the one-time `UPDATE` in `supabase/migrations/004_machine_tables.sql`, and that statement does not dispatch this event. The catalog label and the matcher remain. They do not start a run. Claim 26 does not become this writer. Claim 25 does not assign `status`. This claim does not add a dispatch, does not add an `event_write_set` row, and does not write a migration.

**The name.** `localRefFromPayload` in `server/wire-service/workflowWalk.ts` returns `sequence_id` or `sequenceId` when the event name is `consent_records.sequenced`. `triggerLocalRefFromPayload` in `src/app/data/automationTriggerSelect.ts` is the same case. `WORKFLOW_EVENT_CATALOG` in `src/app/data/automationWorkflows.ts` labels the name “Consent sequenced”. `WORKFLOW_EVENTS_WITH_LOCAL` includes the name, and nothing imports that set. `TRIGGER_SELECT_EVENTS` does not list it. `TriggerSelectModal.tsx` builds the product-face picker from that list. `origin/pr-86:docs/register/SYSTEMS-TRIGGER-PLACE-ASCRIBE.md` says the event is not on A26 and is not to be sneaked in. Hub’s `AutomationEventTriggerConfigPanel` and `AutomationNodeConfigModal` still render `WORKFLOW_EVENT_CATALOG`, so the Hub list still shows the label. Hub is not the product face. `event_write_set` names `consent_records` for `consent_records.opt_out` only (`supabase/migrations/017_event_test_contract.sql`). The later inserts name `contact_uploaded` (`019_contact_seat.sql`) and `objective_met` (`021_objective_local_axis.sql`). None name this event. `door1` in `eventTest.ts` has no branch for it. `supabase/seeds/003_canonical_workflows.sql` does not subscribe a trigger to it. `docs/register/PRIMITIVES.md` lists “Someone opted out / unsubscribed” and “An objective was met”. It does not list consent sequenced.

**What the goal already said the write was.** `docs/register/SYSTEMS-GOAL.md` puts `waitlisted` and `sequenced` on the opt-in row and says the cascade does not write those statuses. Sign-up met is the campaign goal drawn as landing on `sequenced`, and that landing sits in the column that is not stood up. The same file leaves open whether launch day is only for contacts who were waitlisted. `origin/pr-86:docs/register/SYSTEMS-CHANGE-PACKET.md` maps a `consent_records` update of `status` to `sequenced` onto this event, and it says the picker is yes if the launch-day objective points here. The same packet says the production path is the write, and that `handleMachineEvent` stays a probe. `origin/pr-86:docs/register/SYSTEMS-CHANGE-PACKET-012.md` maps the local axis of this event to `sequence_template.id` on `payload.sequence_id`, in the table of writes to connect. The teaching launch-day objective `obj.optin.day` is kind `form`, name “They opt in”, completion table `fact_writebacks` (`supabase/seeds/002_machine_tables.sql`). `campaign_objective.completion_table` allows `messaging_events`, `fact_writebacks`, and `meeting_booked` (`supabase/migrations/010_sequence_campaign_housing.sql`). The objective does not point at this event, and the check does not allow that pointer. The condition for adding the dispatch is not met.

`advanceEnrollmentCampaign` dispatches `objective_met`. The payload carries `sequence_id` from the enrollment (`campaignHousing.ts`). `dispatchEventToWorkflows` loads triggers whose `event_name` equals the name it was given (`workflowWalk.ts`). `objective_met` does not enter the sequenced case of `localRefFromPayload`. That call does not update `consent_records`.

**Writers of the column.** The migration `UPDATE` sets `sequenced` when `basis` is `express` or `implied`, the silenced arm does not win, and `status` is still `unsequenced`. It sets `silenced` when the boolean is true. It does not set `waitlisted`. It runs with the migration. It is not a trigger. It does not call `dispatchEventToWorkflows`. Claim 25 and claim 26 already left it off the silence route and off Agree. No later statement in `server/` assigns `consent_records.status`. Seeds that insert consent omit the column. Scripts that name `status` store `silenced` or `unsequenced` (`scripts/verify-deny-gates.ts`, `scripts/close-walk-gaps.ts`). They do not store `waitlisted` or `sequenced`, and they do not dispatch this event. `cs-waitlist` in `src/app/system-map/data/tables.ts` writes the cohort value `intent_waitlist`. It is not an update of `consent_records`, and `supabase/seeds/` does not contain that row. The map edge “Day3 waitlist → waitlisted” and the `optin_phase` line “On success → consent_state sequenced” are labels (`tables.ts`, `nodes.ts`). They are not statements that run. `ConsentStatus` in `src/app/wire/machineTypes.ts` is not imported. The send gate compares `status` to the literal `silenced`. `unsequenced`, `waitlisted`, and `sequenced` do not change that allow.

**The probe.** `handleMachineEvent` forwards `body.eventName` to `dispatchEventToWorkflows` and does not write `consent_records` (`machine.ts`, `POST /machine/events`). No caller in `src/` invokes `fireEvent`. A body that already contains this name would start a stored trigger of this name. That forward does not record that consent became sequenced, and it does not set `status`.

**Why the absence is the specification.** A listener on this name would be a different run from `objective_met`. The goal already says the cascade does not write `waitlisted` or `sequenced`. The launch-day objective already completes on `fact_writebacks`, and the completion that carries `sequence_id` is `objective_met`. The product face does not list this name, and the A26 ascribe says not to add it. Storing `sequenced` and dispatching this event would start a listener the operator cannot select on that face, on a rung the goal says this class of write does not own. The matcher remains, so a stored `local_ref` would compare `sequence_id` if a probe posted the name. No production statement posts it. A listening run of this event does not start.

**Rejected alternatives.**

- Treat the migration `UPDATE` as the firing. It stores `sequenced` from `basis` for rows that were still `unsequenced` when the column was added. It does not pass `sequence_id`. It does not dispatch. A row inserted after the migration with `basis` `express` keeps the default `unsequenced` unless a later statement names the column. No later statement does.

- Assign `sequenced` or `waitlisted` on `handleContactSeatConsent`. Claim 26 refused that assignment. Agree clears the boolean and, when the stored word is `silenced`, stores `unsequenced`. That unlocks the nudge the consent leaf names. It is not the sign-up landing. The gate treats `unsequenced`, `waitlisted`, and `sequenced` alike.

- Dispatch this event from `advanceEnrollmentCampaign` beside `objective_met`, because that payload already has `sequence_id`. The event name on that call is `objective_met`. The launch-day completion table is `fact_writebacks`. Packet 012 mapped a local axis for a write that would be connected when the objective pointed here. The objective points at `fact_writebacks`. The later A26 ascribe keeps the name off the product face. One completion stays one event.

- Treat `handleMachineEvent` as the production firing. It forwards a name the caller already supplied. It does not read `consent_records` and does not set `status`. No product caller posts this name. The change packet already calls that route a probe.

- Treat the system-map labels, or `cs-waitlist`, as the writer of `waitlisted` or `sequenced`. The edge and the ramification are diagram copy. The rule row’s write target is the cohort tier, and the seed does not contain the row.

- Fill the CASL silence in `SYSTEMS-STORY` §6, or decide whether launch day is only for waitlisted, in order to say whether this event fires. The regime and the audience fork are not which statement dispatches this name. Nothing writes `waitlisted`, so that fork has no stored signal on this column. The event is specified without choosing either.

- Add the name to `TRIGGER_SELECT_EVENTS` so the absent firing has a product-face row. The ascribe says not to sneak it in. This claim does not add the row.

No founder question. A firing and the absence of a firing are different listeners. The goal, the launch-day completion table, and the A26 list already choose the absence. `waitlisted` and `sequenced` stay values the check allows. No ongoing statement stores them. The one-time `UPDATE` remains the backfill claim 25 and claim 26 already named. It is not this event.

**What this leaves.** The sentence “Sign-up met = CAMPAIGN GOAL → consent sequenced” remains in `SYSTEMS-GOAL`. This claim says that sentence is not a dispatch and not a status write. It does not retune `obj.optin.day`. When that objective advances the cursor, the dispatch is still `objective_met`. Whether launch day is only for waitlisted stays the open ask that file already marked and said not to fill. It is not this event. `projectSeat` showing a form after Ignore stays the separate paint claim 26 left unnamed.

**Evidence:** `workflowWalk.ts` `localRefFromPayload`, `dispatchEventToWorkflows`, `materializeTriggersFromGraph`. `src/app/data/automationTriggerSelect.ts` `TRIGGER_SELECT_EVENTS`, `triggerLocalRefFromPayload`. `src/app/data/automationWorkflows.ts` `WORKFLOW_EVENT_CATALOG`, `WORKFLOW_EVENTS_WITH_LOCAL`. `TriggerSelectModal.tsx`. `src/app/components/hub/automation/AutomationEventTriggerConfigPanel.tsx`. `src/app/components/hub/automation/AutomationNodeConfigModal.tsx`. `campaignHousing.ts` `advanceEnrollmentCampaign`. `machine.ts` `handleMachineEvent`. `stores.ts` `handleConsentSilence`. `contactSeat.ts` `handleContactSeatConsent`. `dispatchSend.ts` `consentAndHaltGate`. `eventTest.ts` `door1`. `supabase/migrations/004_machine_tables.sql` the `status` column and the one-time `UPDATE`. `supabase/migrations/010_sequence_campaign_housing.sql` `completion_table`. `supabase/migrations/017_event_test_contract.sql`. `supabase/migrations/019_contact_seat.sql`. `supabase/migrations/021_objective_local_axis.sql`. `supabase/seeds/002_machine_tables.sql` `obj.optin.day`. `supabase/seeds/003_canonical_workflows.sql`. `scripts/verify-deny-gates.ts`. `scripts/close-walk-gaps.ts`. `src/app/system-map/data/tables.ts` `cs-waitlist`, the waitlist edge. `src/app/system-map/data/nodes.ts` `optin_phase`. `src/app/wire/machineTypes.ts` `ConsentStatus`. `docs/register/SYSTEMS-GOAL.md` the opt-in row and “Sign-up met = CAMPAIGN GOAL → consent sequenced”. `docs/register/PRIMITIVES.md`. `origin/pr-86:docs/register/SYSTEMS-CHANGE-PACKET.md` the dispatch table. `origin/pr-86:docs/register/SYSTEMS-CHANGE-PACKET-012.md` the local-axis row. `origin/pr-86:docs/register/SYSTEMS-TRIGGER-PLACE-ASCRIBE.md` the A26 exclusion. `docs/register/SYSTEMS-STORY.md` §6.

**Live.** No handler dispatches `consent_records.sequenced`. No statement sets `waitlisted`. The migration `UPDATE` still sets `sequenced` once for the backfill and still does not dispatch. The seat conflict still does not write those two values. No migration was written.

### Revision — claim 28

The sentence that `projectSeat` showing a form after Ignore stays the separate paint claim 26 left unnamed stands as the gap. Claim 28 decides that pane. This event is unchanged. No dispatch was added. `waitlisted` and `sequenced` were not assigned. The seat conflict’s `CASE` was not retuned.

---

## Claim 28 — After Ignore the seat does not open the form

**Standing:** technical decision made in this session.

When the consent row for the link’s contact and firm is the Ignore row claim 26 writes — `basis` `none`, `source` `ignored`, `silenced` false — and the objective kind on the campaign the seat is reading is `form`, `projectSeat` does not set `now.state` to `form` and does not include form fields. `now.state` stays `empty`. The title stays `Nothing needed right now`. The instruction stays the firm name plus `will put the next ask here.` Agree is unchanged: `basis` `express` still takes the form branch. This claim does not set `silenced` true, does not assign `status`, does not write `waitlisted` or `sequenced`, and does not dispatch.

**The pane.** `handleContactSeatConsent` returns `projectSeat` after the upsert. `handleContactSeatGet` returns the same function. `ContactWorkspace` renders the form, the field inputs, and Submit only when `now.state` is `form`. The empty state renders the title and the instruction and does not render those controls. The payload includes `formFields` only when `now.state` is `form`, so withholding that state withholds the fields. The consent ask stays finished: `source` `ignored` is already not the branch that sets `now.state` to `consent`, and the history row for consent stays not outstanding. Ignore remains a completed choice. It does not put Agree and Ignore back on the page.

**What the product already required.** `docs/register/SEED.md` §8.2 says opt-in before deep collection. `docs/register/SYSTEMS-STORY.md` §6 extracts that as a must: gate deep data collection on opt-in, and consent state gates fact-refresh. `docs/register/OUTCOMES.md` states the contact agrees or ignores before any deeper collection. `docs/register/how/contact-consent.md` leaf 1.2 says Ignore writes the no-deeper state and deeper collection forms do not open, and that Agree is what unlocks the later nudge. `docs/register/how/contact-refresh.md` places the consolidated form after consent, entered from the nudge message. `docs/register/OUTCOME-SYSTEM-MAP.md` binds consent to system 6 and the form to fact-refresh. `docs/register/furnish/contact-furnish.md` says the Ignore policy row does not change that core function: no express consent, and deeper forms stay closed. The plant in `ContactPrototypeScene` repeats the same sentence on the Ignore click. That plant is not the wired seat. It matches the leaf. The wired seat is the implementation that does not.

**What the seat does instead.** The consent select is `basis`, `silenced`, and `source` for the link’s contact and firm. The consent branch requires a missing row, or `basis` `none` with `source` other than `ignored`. Ignore fails that test. The next branch sets `now.state` to `form` when `campaign_objective.kind` is `form`. The field query runs because `silenced` is false, and the return attaches those rows because the state is `form`. `obj.optin.day` is that kind, on `camp.optin.day`, completion `fact_writebacks`. The seed contact `cr-harbor-4` at `firm-harbor` is `basis` `none`, `source` `ignored`, `silenced` false, enrolled on that campaign, with self-reportable missing facts. The live projection therefore shows that contact the form. The file note on that contact’s upload is not a specification of the pane. `standInContactSeat`’s `project` uses the same consent test and then sets `form` for `camp.optin.day` and `camp.reeng.nudge`, and it attaches that contact’s questions. This claim is both projections. Neither was edited.

**Why the empty Now is the no-deeper pane.** The leaf does not name a further block after Ignore. The workspace already has `empty` for a Now that is not the consent ask, not a form, and not a meeting. Furnish’s confirmation sentence is clarify copy. It does not add a state. Withholding `form` is the form not opening. The shared empty instruction is the copy that state already uses. This claim does not replace it.

**What stays.** The cursor does not move. History still lists the current form campaign as outstanding, because that list follows campaign order and the current `campaign_id`, not `source`. Open in Now calls `projectSeat` again, so it also does not render the form. Claim 4’s write of `campaign_id` on that click was not reopened. `handleContactSeatFacts` still inserts `fact_writebacks` without reading this row. The workspace calls that route from the form’s submit, which this pane does not render. The route itself was not specified. A meeting objective still takes the meeting branch after the same consent test. Book is a separate outcome. That branch was not specified.

**Rejected alternatives.**

- Keep `now.state` `form` after Ignore, and treat “forms do not open” as only the later send. Claim 26 already has the basis arm deny a purpose that is not `opt-in` when `basis` is `none`. That arm stops a nudge from being sent. It does not stop this response from rendering the fields. The leaf’s click path is Agree or Ignore before any deeper form, and the refresh leaf opens the form after consent. Seed §8.2 and Story §6 gate the collection on opt-in. The seat is the collection pane. The campaign cursor sitting on a form objective is not that opt-in. `basis` `none` is not opted in.

- Leave `now.state` on `consent` so the contact can still Agree. The leaf says Ignore is a valid choice that writes the no-deeper state. The projection already treats `source` `ignored` as the ask not outstanding, and the history row is already not outstanding. Putting the buttons back would make the click a dismiss that did not stick. The no-deeper pane is the finished choice with the form withheld, not an unfinished ask.

- Set `silenced` true so the field query skips, and call that the closed form. Claim 26 clears the boolean on this statement and does not turn Ignore into a silence. The silence leaf and the furnish distinction are a different control. Story §6’s “silenced when not opted in” is the indicator sentence those claims already left off this write. The collection gate is met by not opening the form. The boolean stays false. The `CASE` on `status` stays the move off `silenced` and is not how the pane is chosen. `projectSeat` does not read `status`.

- Add a `now.state` for the prototype sentence “Deeper collection stays closed.” The leaf’s affordance is the button that writes the state. It does not list that confirmation as a block. The workspace has no such state. A new state would be a screen this session does not mint. Empty is the pane that already means there is no ask on Now.

- Hide the form for every row whose `source` is `ignored`, including a later `basis` of `express`. The Ignore click writes `basis` `none` and `source` `ignored` together. Opt-in is the basis that unlocks the form. A mixed row is another writer. This claim withholds the form for the Ignore pair, not for every leftover source string.

- Treat the stand-in as a second rule, or retune its kept boolean. The mirror’s `project` is this same pane. Its `consent` keeping the previous boolean is the discrepancy claim 26 already left. This claim does not retune that store.

- Move the cursor off the form campaign, or mark that history row not outstanding, in order to hide the form. The pursuit’s campaign is claim 4’s latch. Ignore is not a completion of `obj.optin.day`. The history row can still name the current ask. Now does not open it.

No founder question. Showing the form and withholding it are different pages for the contact. Seed §8.2, Story §6, the consent outcome, the consent leaf, and the refresh leaf’s “after consent” already choose the second. The seat’s branch is the implementation that still takes the first. Empty is the state the pane already uses when it is not that form. The status word, the sequenced event, and the silence boolean stay as claims 25, 26, and 27 wrote them.

**What this leaves.** `handleContactSeatFacts` still accepts answers for this contact and firm and does not read `consent_records`. Whether that write is inside the opt-in gate, or a door the withheld pane does not close, was not specified. It is not this pane. When the objective kind is `meeting`, the same consent test still sets `now.state` to `meeting`. Book’s criteria are an invitation and not silenced. Whether that surface is deep collection was not specified. It is not the form.

**Evidence:** `contactSeat.ts` `projectSeat`, `handleContactSeatConsent`, `handleContactSeatGet`, `handleContactSeatFacts`. `src/app/register/prototype-ant/contact/ContactWorkspace.tsx` the `now.state` branches. `src/app/wire/standins/contactSeatMirror.ts` `project`. `src/app/register/prototype/ContactPrototypeScene.tsx` the Ignore outcome. `supabase/seeds/002_machine_tables.sql` `obj.optin.day`. `supabase/seeds/005_contact_workspace_fill.sql` `cr-harbor-4`. `supabase/migrations/018_collectible_fields.sql` `self_reportable`. `docs/register/SEED.md` §8.2. `docs/register/SYSTEMS-STORY.md` §6. `docs/register/OUTCOMES.md` the consent statement. `docs/register/how/contact-consent.md` leaf 1.2. `docs/register/how/contact-refresh.md` the root criteria and leaf 1.1. `docs/register/how/contact-book.md` leaf 1.1. `docs/register/OUTCOME-SYSTEM-MAP.md` the consent and refresh rows. `docs/register/furnish/contact-furnish.md` `contact-furnish-08`. `docs/register/PASS-FORK-MAP.md` the face track beside the machine track.

**Live.** `projectSeat` still sets `now.state` to `form` when `source` is `ignored` and the objective kind is `form`, and it still attaches the fields because `silenced` is false. The mirror still does the same for `camp.optin.day` and `camp.reeng.nudge`. No migration was written.

### Revision — claim 29

The sentence that `handleContactSeatFacts` still accepts answers for this contact and firm, and that whether that write is inside the opt-in gate was not specified, stands as the gap. Claim 29 decides the write. The pane is unchanged. `now.state` is not set from this claim. The meeting branch is unchanged.

### Revision — claim 41

The rejected alternative that this claim does not retune the mirror’s kept boolean stands as the scope of the pane. Claim 41 clears that boolean on the mirror’s Agree. Ignore still does not open the form. This projection is unchanged.

---

## Claim 29 — The seat facts write refuses a contact who has not opted in

**Standing:** technical decision made in this session.

`handleContactSeatFacts` reads the `consent_records` row for the link’s contact and firm. When that row is missing, or `basis` is `none`, the handler does not insert `fact_writebacks`, does not delete `missing_fact_signals`, does not run `runContactEligibilityCascade`, does not dispatch `fact_writebacks`, and does not call `onCompletionWrite`. It returns `projectSeat`. The Ignore row claim 26 writes is that case: `basis` `none` and `source` `ignored`. A missing row, and a `basis` of `none` whose `source` is not `ignored`, are the same case. The contact has not opted in. This claim does not set `now.state`, does not assign `status`, does not set `silenced`, and does not move the cursor.

**The write.** The paragraph that follows is the path the handler takes when it does not read consent. The withhold above stops that path for a missing row and for `basis` `none`. Both routes call this function. `POST /contact-seat/:token/facts` resolves the link from the token. `POST /machine/contact-workspaces/:contactId/facts` resolves it from the session firm and a contact on that firm’s book, and the caller is a platform admin. The body is `{ answers: [{ fieldKey, value }] }`. The handler does not take a consent action. Inside the answer loop the cascade’s `resultPayload.source` is the literal `contact_workspace`. Each non-empty `fieldKey` inserts one `fact_writebacks` row, deletes the matching `missing_fact_signals` row, runs the eligibility cascade, dispatches `fact_writebacks`, and calls `onCompletionWrite`. `resolveFormStamp` stores `campaign_objective_id` from the newest enrollment that has a campaign. `onCompletionWrite` advances that enrollment when the objective’s `completion_table` is `fact_writebacks` and a fact row carries that objective id. It does not skip `pursuit_state` `exhausted`. `obj.optin.day` is that completion, on `camp.optin.day`. The seed contact `cr-harbor-4` at `firm-harbor` is the Ignore row, enrolled on that campaign, with missing self-reportable facts. A post of those keys stores the collection, clears the signal, re-evaluates, and can advance the cursor claim 28 left unmoved.

**Who sends it.** `ContactWorkspace` calls `facts` only from the form `onFinish`, and that form renders only when `now.state` is `form`. The token seat and the contact-id seat are that same component. `ContactAntScene` passes `contactId`. `docs/register/SYSTEM-COMPONENT-MAP.md` names View as Client a read of the client workspace. The handler has no branch on which route called. The body cannot rename the write. Claim 28 withholds the form on the Ignore row, so that page does not submit. The route still accepts the post. `standInContactSeat.facts` and `factsContact` are the same submit on the mirror. The mirror keeps one consent slot per `contactId`. The slot for `cr-harbor-4` is the Ignore row. `cr-harbor-2` and `cr-cedar-3` have no slot. The live methods drop the answered keys and do not read the slot. This claim covers those methods. When the slot is missing, or `basis` is `none`, they do not remove the answered keys, and they return `project`. When `basis` is `express` or `implied`, they still remove the answered keys. This claim does not add a firm to the slot and does not retune the boolean `consent` keeps.

**What the product already required.** `docs/register/SEED.md` §8.2 says opt-in before deep collection. `docs/register/SYSTEMS-STORY.md` §6 says gate deep data collection on opt-in, and that consent state gates fact-refresh. `docs/register/OUTCOMES.md` says the contact agrees or ignores before any deeper collection. `docs/register/how/contact-consent.md` leaf 1.2 says Ignore writes the no-deeper state and deeper collection forms do not open, and that Agree unlocks the later form. `docs/register/how/contact-refresh.md` places the consolidated form after consent. The seat facts write is that collection: the row, the cleared signal, the re-evaluation, and the completion. The withheld button is claim 28. It does not close the writer.

**What still writes.** `basis` `express` is Agree. Claim 28 still takes the form branch. The loop runs. A later `basis` of `express` still writes when `source` remains `ignored`, because the Ignore click writes the two together and a mixed row is another writer. `basis` `implied` is not `none`. `projectSeat` does not put that basis on the consent ask. The history row already treats `implied` as the ask done. The send’s basis arm does not treat `implied` as the consent-missing deny. This claim does not refuse `implied` and does not recut it. The one-time `UPDATE` is not this write.

**The pair.** The select is `basis` and `source` for the link’s `contact_id` and `firm_id`, the pair `projectSeat` and the seat consent already use. Another firm’s row does not withhold this firm’s write, and it does not allow it. The check is once, before any answer is inserted. The body is withheld together. There is no new refuse code and no new `now.state`. `run` in `ContactWorkspace` replaces the seat with an `ok` payload. The page that comes back is the projection claim 28 already specified for Ignore, and the consent ask the projection already specifies when the row is missing or the ask is still outstanding. A link refuse and `workspace_opted_out` still return before this read. This claim does not retune them.

**Rejected alternatives.**

- Leave the route accepting the post, and treat the withheld form as the whole gate. Claim 28 already keeps the button off the Ignore page. Story §6 gates fact-refresh, which is this insert, the signal delete, the cascade, the dispatch, and the completion. A post of `cr-harbor-4`’s missing keys still does those. Seed §8.2, the consent outcome, and the refresh leaf’s “after consent” already forbid that collection. Hiding Submit meets the pane. It does not meet the gate on the write.

- Treat the admin route as consultant hand-entry and leave the handler open so that route can still store facts. The handler does not read which route called. The cascade source is `contact_workspace`. View as Client renders `ContactWorkspace`. There is no second submit on that page. Leaving the handler open keeps the contact’s token route open with it. Consultant hand-entry is `handleFactWriteback`.

- Refuse only `source` `ignored`, and still insert when the row is missing or `basis` is `none` with another source. Those rows are the consent ask. `OUTCOMES.md` places that ask before any deeper collection. A source-only refuse would keep this route collecting for every contact who has not chosen, which is the state the opt-in sentence does not exempt. The Ignore row is inside the gate because it is not opt-in. The unanswered row is the same predicate.

- Refuse `basis` `implied` because Agree is the only seat write of `express`. The projection, the history done-test, and the send’s basis arm already treat `implied` as past the consent-missing case. Refusing the write while the pane shows the form would split that basis. The CASL meaning of `implied` stays unfilled. This claim does not fill it.

- Return a new refuse, or put Ignore back on the consent ask, so the post has a visible failure. The leaf does not name that page. Ignore already has a workspace. The projection is the response the seat’s other successful posts return. Claim 28 leaves it empty. This claim does not replace the title or the instruction.

- Set `silenced` true so a later send stops, and call that the closed collection. Claim 26 stores `silenced` false on Ignore. The leaf’s “silenced-from-deeper” wording is the indicator sentence claims 25, 26, and 28 already left off this row. The collection stops because the facts are not stored. The boolean stays. The `status` `CASE` stays.

- Specify `handleFactWriteback` as this withhold. That function is `POST /machine/fact-writebacks`. `writeBackContactFacts` calls it. `ContactPrototypeScene` calls `writeBackContactFacts`. The body carries `contactId`, `fieldKey`, `value`, and `source`. It does not read `consent_records`. Story §8 and Seed §5.8 name consultant hand-entry as a write-back. It is not this handler, and it is not the token submit.

- Specify the meeting book, the upload, or a field-class filter as this withhold. `handleContactSeatMeeting` is the meeting branch claim 28 left open. This function does not book. The facts loop does not read `collectible_fields.capture`. That filter is not the consent predicate.

No founder question. A stored answer after Ignore and a refused post are different collections. The first clears a missing signal, re-evaluates, and can advance `obj.optin.day`. The second returns the seat and leaves those rows. Seed §8.2, Story §6, the consent outcome, the consent leaf, and the refresh leaf already choose the second. The admin path is the same seat. Splitting it off would invent a writer this function does not have. `implied` stays the basis the pane already lets past the ask.

**What this leaves.** `handleFactWriteback` still inserts `fact_writebacks` for the session firm and the body contact and does not read this row. Whether that acceptor refuses a missing row or `basis` `none` was not specified. It is not this route. When `basis` is `express` or `implied` and `silenced` is true, this handler still inserts. Seed §8.2 says respect silence. The Ignore row this claim refuses already has `silenced` false. The boolean arm was not specified. It is not this predicate. An allowed answer still inserts whatever non-empty `fieldKey` was posted. The loop does not read `collectible_fields.capture`. Whether a key that is not self-reportable is refused was not specified. It is not the consent predicate. An allowed write still dispatches `fact_writebacks` without `writes`, and the cascade enroll when no workflow fires stays unspecified. Claim 11 and claim 12 are unchanged. When the objective kind is `meeting`, the seat can still book. That branch was not specified.

**Evidence:** `contactSeat.ts` `handleContactSeatFacts`, `seatFromContext`, `seatFromToken`, `seatFromAdminContact`, `projectSeat`. `routes.ts` the two facts routes. `src/app/register/prototype-ant/contact/ContactWorkspace.tsx` `seatApi`, the form `onFinish`, `run`. `src/app/register/prototype-ant/contact/ContactAntScene.tsx`. `src/app/wire/reals/machineApi.ts` `submitContactSeatFacts`, `submitContactWorkspaceFacts`. `src/app/wire/standins/contactSeatMirror.ts` `facts`, `factsContact`, the consent slot for `cr-harbor-4`. `src/app/wire/standins/machineApi.ts` the two submit wrappers. `campaignHousing.ts` `resolveFormStamp`, `onCompletionWrite`, `objectiveSatisfiedBy`, `campaignObjectiveIdForCampaign`. `machine.ts` `handleFactWriteback`. `src/app/register/prototype/shared/meetingsStore.ts` `writeBackContactFacts`. `src/app/register/prototype/ContactPrototypeScene.tsx` the `writeBackContactFacts` calls. `supabase/seeds/002_machine_tables.sql` `obj.optin.day`. `supabase/seeds/005_contact_workspace_fill.sql` `cr-harbor-4`, `enr-harbor-4`. `docs/register/SEED.md` §8.2 and §5.8. `docs/register/SYSTEMS-STORY.md` §6 and §8. `docs/register/OUTCOMES.md` the consent statement. `docs/register/how/contact-consent.md` leaf 1.2. `docs/register/how/contact-refresh.md` the root criteria. `docs/register/SYSTEM-COMPONENT-MAP.md` `board-view-as-client`. `dispatchSend.ts` the basis arm inside `consentAndHaltGate`.

**Live.** `handleContactSeatFacts` still does not read `consent_records` and still inserts for the Ignore row. `standInContactSeat.facts` and `factsContact` still drop answered keys for `cr-harbor-4` and for a contact with no consent slot. No migration was written.

### Revision — claim 30

The sentence that `handleFactWriteback` still inserts for the session firm and the body contact, and that whether it refuses a missing row or `basis` `none` was not specified, stands as the gap. Claim 30 decides that acceptor. The seat write is unchanged. A missing row or `basis` `none` still does not insert on `handleContactSeatFacts`.

---

## Claim 30 — The fact write-back refuses a contact who has not opted in

**Standing:** technical decision made in this session.

`handleFactWriteback` reads the `consent_records` row for the session firm and the body `contactId`. When that row is missing, or `basis` is `none`, the handler does not insert `fact_writebacks`, does not delete `missing_fact_signals`, does not insert `missing_fact_signals` from `missingFieldKeys`, does not run `runContactEligibilityCascade`, does not dispatch `fact_writebacks`, and does not call `onCompletionWrite`. It does not return `writebackId`. The HTTP response is not ok, so `wireFetch` does not yield a `FactWritebackResult`. The Ignore row claim 26 writes is that case: `basis` `none` and `source` `ignored`. A missing row, and a `basis` of `none` whose `source` is not `ignored`, are the same case. `body.source` does not select a second door. This claim does not set `now.state`, does not assign `status`, does not set `silenced`, and does not move the cursor.

**The write.** The paragraph that follows is the path the handler takes when it does not read consent. The withhold above stops that path for a missing row and for `basis` `none`. `POST /machine/fact-writebacks` takes the firm from `requireSessionFirm`. The body is `contactId`, `fieldKey`, `value`, and optional `source`, `missingFieldKeys`, and `formRef`. An empty `contactId` or `fieldKey` remains the existing 400 whose message says those fields are required. That message is the empty-body case. The consent withhold does not reuse it. Past that check the handler stamps the form, inserts one `fact_writebacks` row, deletes the matching `missing_fact_signals` row, and may insert further missing-fact rows for `missingFieldKeys`. The cascade’s `resultPayload.source` is `body.source`, or the literal `contact` when the body omits it. The insert column list has no `source`. `fact_writebacks` has no source column. The handler then dispatches `fact_writebacks` and calls `onCompletionWrite`. `resolveFormStamp` stores `campaign_objective_id` from the newest enrollment that has a campaign. `onCompletionWrite` advances that enrollment when the objective’s `completion_table` is `fact_writebacks` and a fact row carries that objective id. `obj.optin.day` is that completion, on `camp.optin.day`, name “They opt in”. The seed contact `cr-harbor-4` at `firm-harbor` is the Ignore row, enrolled on that campaign, with missing self-reportable facts. A post of those keys under that firm stores the collection, clears the signal, re-evaluates, and can advance the cursor claim 28 left unmoved and claim 29 withheld on the seat.

**Who sends it.** `writeBackContactFacts` posts through `machineApi.writeFact`. `ContactPrototypeScene` is the caller. Submit on Nudge form posts `source` `Nudge form`. Submit on Loop-closer form posts `source` `Loop-closer form`. Submit on Update facts posts `source` `Update facts`. The helper’s comment calls that the contact portal’s self-reportable submit. The contact id on those three calls is `sarah`. `ContactWorkspace` does not call `writeFact`. No consultant module calls `writeFact`. Client Data’s Information tab reads `fact_writebacks`. It does not post this route. `docs/register/how/consultant-core.md` and `docs/register/how/consultant-access.md` describe Live brief as a panel that reads the contact’s write-back. `docs/register/OUTCOMES.md` gives the consultant the verbs hand over, authorize, and receive. `standInMachineApi.writeFact` is the same post when the wire is the stand-in. It unshifts a write-back, splices the answered missing signal, pushes an eligibility result, a signal, and a motion, and returns a `writebackId`. It does not read a consent row.

**What the product already required.** `docs/register/SEED.md` §8.2 says opt-in before deep collection, and that firm database authorization is not end-client consent. `docs/register/SYSTEMS-STORY.md` §6 says gate deep data collection on opt-in, and that consent state gates fact-refresh. `docs/register/OUTCOMES.md` says the contact agrees or ignores before any deeper collection. `docs/register/how/contact-consent.md` says Agree or Ignore comes before any Nudge or deeper form, and that Ignore writes the no-deeper state. `docs/register/how/contact-refresh.md` places Nudge form and Update facts after consent. Those three submits are the forms that post this route. `docs/register/SYSTEMS-STORY.md` §8 and `docs/register/SEED.md` §5.8 accept an answer from the client or from consultant hand-entry, and any such write-back re-evaluates. `docs/register/SYSTEMS-REQUIREMENTS-FILLED.md` and the `fact_writeback` node in `src/app/system-map/data/nodes.ts` name client submit, a system-received answer, and consultant hand-entry as transitions into that one landing. The landing is this insert, the cleared signal, the re-evaluation, and the completion. The session firm is the firm’s authorization. It is not the contact’s opt-in. Hand-entry is the other named origin of the same landing. It is not a sentence that this post may store the fact before that opt-in. No production caller of this function is a consultant control. The system-received label has no caller of this function.

**The pair.** The select is `basis` for the session firm and the body `contactId`, the pair a send and the seat already use for the firm they are acting as. Another firm’s row does not withhold this firm’s write, and it does not allow it. The check is once, before the insert, the signal delete, the missing-signal inserts, the cascade, the dispatch, and `onCompletionWrite`. There is no new page and no new `now.state`. `writeBackContactFacts` already treats a rejected `writeFact` as no machine result. This claim does not retune the local meetings-store paint in that catch, and it does not retune the later `signalMissingFact` call.

**The mirror.** `standInMachineApi.writeFact` is this post on the stand-in. `standInConsentSilence.get` returns `basis` `none` when the contact has no slot and when the stored basis is `none`. For that return the stand-in does not unshift a write-back, does not splice `missingFactSignals`, does not push an eligibility result, a signal, or a motion, and does not resolve a `FactWritebackResult`. `basis` `express` and `basis` `implied` still record the write. This claim does not change `get`, does not add a firm to it, does not retune the boolean that map keeps, and does not read the seat mirror’s consent slot. Those maps stay separate.

**What still writes.** `basis` `express` is Agree. The insert runs. A later `basis` of `express` still writes when `source` on the consent row remains `ignored`, because the Ignore click writes the two together and a mixed row is another writer. `basis` `implied` is not `none`. This claim does not refuse `implied` and does not recut it. The one-time `UPDATE` is not this write. When `basis` is `express` or `implied` and `silenced` is true, the handler still inserts. That boolean was not this predicate.

**Rejected alternatives.**

- Leave the route accepting the post, and treat it as the consultant door claim 29 did not close. The three callers are the contact forms `contact-refresh.md` places after consent. Story §6 gates fact-refresh, which is this insert, the signal delete, the missing-signal inserts, the cascade, the dispatch, and the completion. A post for `cr-harbor-4` under `firm-harbor` still does those, and can still advance `obj.optin.day`. No consultant control calls `writeFact`. Client Data reads the rows. The consultant how leaves read the contact’s write-back. OUTCOMES does not give the consultant a collection verb. Seed §8.2 already refuses to treat the firm’s authorization as the contact’s consent. The session firm is that authorization. Leaving the function open keeps the contact’s Nudge, Loop-closer, and Update submits as writers after Ignore.

- Branch on `body.source`, refuse the three form names, and still insert when the string says consultant. The column does not exist. The string is whatever the post sends. The handler’s default is `contact`. The three callers send form names, not a role. A post can name itself consultant. The handler does not read a user role. A source split would be a hole the opt-in sentence does not draw.

- Refuse only `source` `ignored` on the consent row, and still insert when the row is missing or `basis` is `none` with another source. Those rows are the consent ask. `OUTCOMES.md` places that ask before any deeper collection. The Ignore row is inside the gate because it is not opt-in. The unanswered row is the same predicate on the same function.

- Refuse `basis` `implied`. The seat projection, the history done-test, the send’s basis arm, and claim 29 already treat `implied` as past the consent-missing case. The CASL meaning of `implied` stays unfilled. This claim does not fill it.

- Return `projectSeat`, or put the contact back on Agree and Ignore. This route is not the seat. Claim 29’s response is that projection. This handler’s success body is a `writebackId`. Returning that id without a row would say the write happened. The consent leaf does not name a failure page for this post. The response is not ok, and it has no `writebackId`. The empty-field 400 stays the empty-field 400.

- Set `silenced` true so a later send stops. Claim 26 stores `silenced` false on Ignore. The collection stops because the facts are not stored. The boolean stays. The `status` `CASE` stays.

- Specify the seat facts write, the meeting book, the upload, or a field-class filter as this withhold. Claim 29 is the seat. This function is the other insert. `handleContactSeatMeeting` is the meeting branch claim 28 left open. `handleContactSeatUpload` inserts `contact_uploads` and does not read `consent_records`. The seed already holds a called-in note and a question note for `cr-harbor-4` on that table. That insert is not `fact_writebacks`, and it does not complete `obj.optin.day`. This handler does not read `collectible_fields.capture`. Seed §5.4’s employer-directed routing is that field class, not an exemption on this post.

No founder question. A stored answer for a contact who has not opted in, and a refused post, are different collections. The first clears a missing signal, re-evaluates, and can advance “They opt in”. The second leaves those rows. The two origins Story §8 names are two ways onto that one landing. Seed §8.2, Story §6, the consent outcome, the consent leaf, and the refresh leaf already put the landing after opt-in. They do not exempt the firm session. D-02 asks which module is the in-meeting fallback for an unresolved form. It does not say that fallback runs before opt-in. This claim does not choose the module.

**What this leaves.** When `basis` is `express` or `implied` and `silenced` is true, this handler still inserts, and `handleContactSeatFacts` still inserts. Seed §8.2 says respect silence. The Ignore row this claim refuses already has `silenced` false. The boolean on an allowed write was not specified. It is the next predicate. An allowed answer still inserts whatever `fieldKey` was posted. Neither writer reads `collectible_fields.capture`. Whether a key that is not self-reportable is refused was not specified. `writeBackContactFacts` still calls `signalMissingFact` after `writeFact`, including when `writeFact` rejects, and `handleMissingFactSignalCreate` does not read `consent_records`. That signal insert was not specified. The catch still calls `applyFactsToMeetingsStore`. That local list is not `fact_writebacks`. `handleContactSeatUpload` still inserts for the link without reading this row. When the objective kind is `meeting`, the seat can still book. That branch was not specified. An allowed write still dispatches `fact_writebacks` without `writes`. Claim 11 and claim 12 are unchanged.

**Evidence:** `machine.ts` `handleFactWriteback`, `firmId`, `handleMissingFactSignalCreate`. `routes.ts` `POST /machine/fact-writebacks`. `sessionFirm.ts` `requireSessionFirm`. `campaignHousing.ts` `resolveFormStamp`, `onCompletionWrite`. `src/app/wire/reals/machineApi.ts` `writeFact`. `src/app/wire/http.ts` `wireFetch`. `src/app/wire/standins/machineApi.ts` `writeFact`. `src/app/wire/standins/consentSilence.ts` `get`. `src/app/register/prototype/shared/meetingsStore.ts` `writeBackContactFacts`. `src/app/register/prototype/ContactPrototypeScene.tsx` the three `writeBackContactFacts` calls, `DEMO_CONTACT_ID`, `applyConsent`. `contactSeat.ts` `handleContactSeatFacts`, `handleContactSeatUpload`. `supabase/migrations/004_machine_tables.sql` `fact_writebacks`. `supabase/seeds/002_machine_tables.sql` `obj.optin.day`. `supabase/seeds/005_contact_workspace_fill.sql` `cr-harbor-4`, `enr-harbor-4`, the `contact_uploads` rows for that contact. `docs/register/SEED.md` §5.4, §5.8, and §8.2. `docs/register/SYSTEMS-STORY.md` §6, §8, and §12. `docs/register/SYSTEMS-REQUIREMENTS-FILLED.md` `fact_writeback`. `src/app/system-map/data/nodes.ts` `fact_writeback`. `docs/register/OUTCOMES.md` the consultant core and the consent statement. `docs/register/how/contact-consent.md`. `docs/register/how/contact-refresh.md`. `docs/register/how/consultant-core.md` the Live brief row. `docs/register/how/consultant-access.md` the Live brief row. `docs/register/CLIENT-DATA-BIND.md` the Information tab.

**Live.** `handleFactWriteback` still does not read `consent_records` and still inserts for the Ignore row. `standInMachineApi.writeFact` still records the write without reading `standInConsentSilence`. No migration was written.

### Revision — claim 31

The sentence that when `basis` is `express` or `implied` and `silenced` is true, this handler still inserts, and `handleContactSeatFacts` still inserts, and that the boolean was not specified, stands as the gap. The same sentence in claim 29 stands as that gap. Claim 31 decides the boolean. Both inserts stand. A missing row or `basis` `none` still does not insert. `body.source` still does not keep that withhold. `implied` was not recut.

---

## Claim 31 — Silence does not stop a fact write the opt-in already allows

**Standing:** technical decision made in this session.

When the `consent_records` row for the firm and the contact is `basis` `express` or `basis` `implied`, and `silenced` is true, `handleContactSeatFacts` and `handleFactWriteback` still insert `fact_writebacks`. Each still deletes the answered `missing_fact_signals` row. The fact route still inserts further missing-fact rows from `missingFieldKeys`. Both still run `runContactEligibilityCascade`, still dispatch `fact_writebacks`, and still call `onCompletionWrite`. The seat still returns `projectSeat`. The fact route still returns `writebackId` and the response is still ok. `silenced` true is not a withhold on either handler. Claim 29 and claim 30 are unchanged: a missing row, or `basis` `none`, including the Ignore row, still does not insert. `body.source` still does not keep that withhold, and it does not create a second door on this allowed row. This claim does not set `now.state`, does not assign `status`, does not set `silenced`, and does not move the cursor in order to store the fact. `onCompletionWrite` may still advance the enrollment, because the fact landed. That advance is the completion claims 27, 29, and 30 already named. It is not a send.

**The row this boolean is on.** The Ignore row claim 26 writes is `basis` `none`, `source` `ignored`, and `silenced` false. Claims 29 and 30 already refuse it. It is not this arm. No seed row is `basis` `express` or `implied` with `silenced` true. `cr-harbor-1` at `firm-harbor` is `express` and `silenced` false. The combination is a later write on a row that already holds `express` or `implied`. `handleConsentSilence` sets `basis` `none` on the insert and, on conflict, sets `silenced` true, `source`, and `updated_at`, and does not assign `basis`. A prior `express` or `implied` remains, and `silenced` becomes true. The hard-bounce upsert is the same shape: the insert stores `basis` `none` and `silenced` true, and the conflict sets `silenced` true and `source` `hard-bounce` and does not assign `basis`. Those two statements are not this write. They are how this row can exist. `handleContactSeatConsent` sets `silenced` false, so Agree is not this arm until a later writer sets the boolean. `standInConsentSilence.silence` keeps the previous `basis` and sets `silenced` true. `get` returns both. That map is not the row. It is the same shape.

**What silence already does.** `consentAndHaltGate` denies the send when `silenced` is true, including when `purpose` is `opt-in`, with detail `silenced`. `docs/register/system-map/ACTUATION-REPORT.md` states that silence always blocks. `docs/register/how/contact-silence.md` says the commit stops automatic firm→client outreach, and that the readers are engagement runners, send gates, and book readiness. The contact is not sequence-ready for new automatic motion. `docs/register/how/contact-consent.md` leaf 1.1 says a silenced contact does not receive the opt-in send. `docs/register/furnish/contact-furnish.md` `contact-furnish-03` puts Silence on Nudge form, Update facts, and Loop-closer form, and says the core stop is still automatic outreach. `contact-furnish-14` says the receipt is that automatic firm messages will stop. `contact-furnish-08` puts Ignore beside Silence: Ignore is no express consent and no deeper forms; Silence is the other control. Claim 26 stores Ignore as `basis` `none` and `silenced` false. Claims 28, 29, and 30 close the form and the fact for that row. They do not close this one.

**What the collection gate already is.** `docs/register/SEED.md` §8.2 says opt-in before deep collection, and, as a second clause, respect silence / opted-out. `docs/register/SYSTEMS-STORY.md` §6 lists those as two musts: gate deep data collection on opt-in, and respect silence. The chain says consent state gates Engagement and Fact-refresh. The collection half is the opt-in claims 29 and 30 already applied. The silence half is the outreach stop the send already applies. `docs/register/how/contact-refresh.md` leaf 1.1 is the consolidated submit. Its conditions do not mention silence. Leaf 1.2 says the later write is read by re-evaluate the same way, and then says silenced contacts do not get new automatic asks. The condition on that leaf is “Contact still not silenced.” The leaf’s own sentence about silence is the ask, which is the send. `docs/register/SYSTEMS-STORY.md` §8 says a write-back from the client or from consultant hand-entry re-evaluates. It does not add a silence exception. The session firm remains the firm’s authorization. It is still not a substitute for the contact’s basis. This claim does not reopen that.

**Both handlers.** The seat reads `basis` for the link’s contact and firm, the pair claim 29 already uses. The fact route reads `basis` for the session firm and the body `contactId`, the pair claim 30 already uses. Another firm’s `silenced` true does not withhold this firm’s write, and it does not allow a missing row or `basis` `none` in this firm. The boolean is not a second predicate on top of that basis. When the basis is `express` or `implied`, the allowed path runs whether `silenced` is true or false. `basis` `implied` is not recut. The one-time `UPDATE` is not this write. There is no new refuse code and no new `now.state`. The empty-field 400 stays the empty-field 400.

**The mirrors.** `standInContactSeat.facts` and `factsContact` still remove the answered keys when the slot’s `basis` is `express` or `implied`, including when that slot’s `silenced` is true. Claim 29’s withhold for a missing slot or `basis` `none` stands. `standInMachineApi.writeFact` still records the write when `standInConsentSilence.get` returns `basis` `express` or `implied`, including when that return’s `silenced` is true. Claim 30’s withhold when `get` returns `basis` `none` stands. This claim does not change `get`, does not add a firm to it, does not retune the boolean that map keeps, and does not read the seat mirror’s slot from `writeFact`.

**Rejected alternatives.**

- Withhold both inserts when `silenced` is true, and treat Seed §8.2’s “respect silence” and Story §6’s chain as a second collection gate. The silence leaf names the readers. They are runners, send gates, and book readiness. The fact inserts are not in that list. The send already denies. Leaf 1.1 does not condition the submit on silence. Leaf 1.2’s silence sentence is that the contact does not get a new automatic ask. Story §8 requires the write-back to re-evaluate and does not except a silenced row whose basis is still `express` or `implied`. Refusing the fact would make Silence close deeper collection. That sentence is Ignore’s, and furnish-08 keeps the two controls apart. Ignore is `basis` `none`. This row is not.

- Withhold the seat and still insert on `handleFactWriteback`, or the reverse. Both functions are the one landing claims 29 and 30 already specified. The seat’s cascade source is `contact_workspace`. The fact route’s cascade source is the body string or `contact`. Neither string is a consent. Stopping one handler would open the door the other claim closed, using the boolean instead of a source string.

- Branch on `source`. A consent `source` of `hard-bounce`, or the silence route’s source, would refuse, and another source would insert. The send does not read `source` to decide the boolean arm. The fact table has no source column. The post can name itself anything. Claim 30 already refused that split for `basis` `none`. It is the same hole on an allowed basis.

- Treat `projectSeat`’s skipped field query as the reason to refuse the write. When `silenced` is true the live projection does not load `formFields`, and when `basis` is `express` or `implied` and the objective kind is `form` it still sets `now.state` to `form`, so the attached list is empty. The mirror’s `project` still attaches that contact’s questions when `silenced` is true. The two projections do not agree, and claim 28 did not specify this pane. A field list is not the writer. Claim 29 already refused to treat a withheld control as the whole gate. This claim does not specify the pane, and it does not refuse the post in order to match either projection.

- Skip `onCompletionWrite`, or skip the cascade, and still insert the fact, so the file changes and the pursuit does not. The allowed path in claims 29 and 30 is the insert, the signal changes, the cascade, the dispatch, and the completion together. Story §8 says the write-back re-evaluates. A stored fact that does not re-evaluate is not that landing. The send a later motion might attempt is still claim 23. The enroll the cascade inserts when no workflow fires stays the enroll that was already left unspecified. It is not a reason to drop the fact.

- Assign `basis` `none` on the silence conflict, or on the hard-bounce conflict, so claims 29 and 30 already refuse the later fact. Those conflicts keep `basis`. Claim 25’s silence statement does not assign it. The bounce upsert is another writer of the pair. This claim does not retune either statement. The fact handlers read the row those writers leave.

- Fill the CASL silence in `SYSTEMS-STORY` §6 in order to decide whether `implied` plus `silenced` true may store a fact. `implied` stays the basis claims 29 and 30 already let past the consent-missing case. The boolean is not a basis. The send deny does not choose a geography. Storing the fact does not choose one either.

No founder question. A stored fact and a refused post are different collections. The leaves already separate them from the send. Silence stops the ask. Opt-in is what opens the landing, and this row still holds that basis because the silence conflict does not clear it. Ignore is the row that closes the landing, and it is `silenced` false. The operator sees the fact because the contact who had opted in submitted one. The operator does not get a new automatic send from this claim. The pair stays this firm’s row. No commercial obligation turns on the boolean. The regime stays unnamed.

**What this leaves.** An allowed answer on both handlers still inserts any non-empty `fieldKey`. Neither loop reads `collectible_fields`. `projectSeat`’s field query keeps `capture` `self_reportable`. `supabase/migrations/018_collectible_fields.sql` checks `capture` as `self_reportable` or `document_dependent`, and `employer_directed` is a separate boolean. Seed §5.4 routes self-reportable fields to the form, document-dependent fields off the form, and employer-directed asks to the firm. Whether a key that fails that class is refused was not specified. It is the next predicate. It is not this boolean. When `basis` is `express` or `implied` and `silenced` is true and the objective kind is `form`, the live seat still sets `now.state` to `form` and still skips the field query, and the mirror still attaches questions. The payload type allows `now.state` `silenced`, and neither projection assigns it. That pane was not specified. It is not this write. The cascade’s enroll when no workflow fires was already unspecified. This claim does not block that enroll for a silenced contact. `writeBackContactFacts` still calls `signalMissingFact` after `writeFact`, including when `writeFact` rejects, and the catch still paints `applyFactsToMeetingsStore`. `handleContactSeatUpload` still inserts without reading this row. When the objective kind is `meeting`, the seat can still book. Those were not specified.

**Evidence:** `contactSeat.ts` `handleContactSeatFacts`, `projectSeat` (the `silenced` field query and the `now.state` branches). `machine.ts` `handleFactWriteback`. `stores.ts` `handleConsentSilence`. `webhooks.ts` the `bounce_hard` upsert. `dispatchSend.ts` the `silenced` arm inside `consentAndHaltGate`. `src/app/wire/standins/contactSeatMirror.ts` `project`, `facts`, `factsContact`. `src/app/wire/standins/machineApi.ts` `writeFact`. `src/app/wire/standins/consentSilence.ts` `silence`, `get`. `supabase/seeds/005_contact_workspace_fill.sql` `cr-harbor-1`, `cr-harbor-4`. `supabase/migrations/018_collectible_fields.sql`. `docs/register/SEED.md` §8.2. `docs/register/SYSTEMS-STORY.md` §6 and §8. `docs/register/how/contact-silence.md`. `docs/register/how/contact-refresh.md` leaf 1.1 and leaf 1.2. `docs/register/how/contact-consent.md` leaf 1.1 and leaf 1.2. `docs/register/furnish/contact-furnish.md` `contact-furnish-03`, `contact-furnish-08`, `contact-furnish-14`. `docs/register/system-map/ACTUATION-REPORT.md`.

**Live.** Both handlers still do not read `silenced`, and both still insert when `basis` is `express` or `implied` and `silenced` is true. That is this claim. They still insert for a missing row and for `basis` `none`, which claims 29 and 30 withhold. `standInMachineApi.writeFact` still records without reading `standInConsentSilence`. The seat mirror still removes answered keys without reading `silenced`. No migration was written.

### Revision — claim 32

The sentence that an allowed answer on both handlers still inserts any non-empty `fieldKey`, and that whether a key that fails the class is refused was not specified, stands as the gap. The same sentence in claims 29 and 30 stands as that gap. Claim 32 decides the class. Silence is unchanged. A key the class allows still inserts when `silenced` is true. A missing row or `basis` `none` still does not insert.

### Revision — claim 43

The sentence that this claim does not block the cascade’s enroll for a silenced contact stands as the gap. Claim 43 blocks that fallback enroll when the pair would deny a non-opt-in send, including `silenced` true on a basis of `express` or `implied`. The fact insert is unchanged. The quartet and the `fact_writebacks` dispatch still run.

---

## Claim 32 — A fact write stores only a self-reportable field that is not aimed at the firm

**Standing:** necessary implication of what the product already requires, and a technical decision made in this session.

On the path claims 29, 30, and 31 already allow, `handleContactSeatFacts` and `handleFactWriteback` store a posted key only when `collectible_fields` has that `field_key`, `capture` is `self_reportable`, and `employer_directed` is false. A key with no row, a key whose `capture` is `document_dependent`, and a key whose `employer_directed` is true do not insert `fact_writebacks`. They do not delete `missing_fact_signals`. They do not run `runContactEligibilityCascade`, do not dispatch `fact_writebacks`, and do not call `onCompletionWrite`. `body.source` does not keep a key the class refuses. `silenced` true does not refuse a key the class allows, and it does not allow a key the class refuses. This claim does not set `now.state`, does not assign `status`, does not set `silenced`, and does not move the cursor in order to test the class.

**The class.** `supabase/migrations/018_collectible_fields.sql` defines `collectible_fields`. `field_key` is unique. `capture` is `self_reportable` or `document_dependent`. `employer_directed` is a separate boolean, default false. The fifteen seeded rows are the same list as `COLLECTIBLE_FIELDS` in `src/app/data/collectibleFields.ts`. Nine are `self_reportable` and `employer_directed` false: `foreign_work_years`, `ee_profile_exists`, `ee_profile_last_updated`, `canadian_skilled_hours`, `language_clb`, `crs_score`, `noc`, `teer_category`, `foreign_trade_hours`. Two are `document_dependent` and `employer_directed` false: `eca_status`, `has_trade_certificate`. Four are `document_dependent` and `employer_directed` true: `has_qualifying_job_offer`, `has_ontario_job_offer`, `oinp_employer_revenue`, `lmia_paperwork`. No seeded row is `self_reportable` and `employer_directed` true. The check allows that combination. `fact_writebacks.field_key` is text and has no foreign key, so the insert accepts any string. The class is a read of `collectible_fields` before the insert. This claim does not add a constraint.

**The seat.** The consent read claim 29 already specified still comes first. A missing row or `basis` `none` still withholds the whole body. Past that, including when `silenced` is true, each answer is its own key. An empty `fieldKey` is still skipped. A non-empty key that fails the class is skipped the same way: that answer does not insert, does not clear a signal, and does not re-evaluate. A key that passes still inserts, still deletes the matching `missing_fact_signals` row, still runs the cascade with source `contact_workspace`, still dispatches `fact_writebacks`, and still calls `onCompletionWrite`. The handler still returns `projectSeat`. There is no new refuse code and no new `now.state`. A body of only refused keys returns that projection and stores nothing.

**The fact route.** The consent read claim 30 already specified still comes first. A missing row or `basis` `none` still withholds the post, and `body.source` still does not open that door. An empty `contactId` or `fieldKey` remains the existing 400. The class withhold does not reuse that 400. Past those checks, including when `silenced` is true, the trimmed `fieldKey` is the class test. When it fails, the handler does not insert, does not delete the signal, does not insert `missing_fact_signals` from `missingFieldKeys`, does not run the cascade, does not dispatch, and does not call `onCompletionWrite`. It does not return `writebackId`. The response is not ok. When the key passes, that path runs. A key inside `missingFieldKeys` that fails the class is not inserted. A key inside that array that passes still inserts. The refused sibling does not drop the fact that passed, and it does not replace the 400.

**The list the form already builds.** `projectSeat` loads `formFields` from `missing_fact_signals` joined to `collectible_fields` where `capture` is `self_reportable`. This claim adds `employer_directed` false to that keep. A firm-directed row is not a field on that list. The join already drops a key with no row and a key whose `capture` is `document_dependent`. The `if (!silenced)` around that query is not this class. This claim does not remove it. `executeRuleWrites` already keeps listing keys that are in the `self_reportable` set, and it already drops a key that is not in that set when the set is non-empty. The set is the same class: `capture` `self_reportable` and `employer_directed` false. The test is positive. An empty catalog does not let the listing keys through. The live `if (selfReportable.size)` skip is that gap. The `email` and `phone` continues in that function stay. Those strings are not rows of this table. `RULE_LEFT_FIELD_MAP` stays, including the paths that map to `eca_status`, `has_trade_certificate`, and the job-offer keys. The class filter already drops those captures, and it drops the employer-directed boolean with them.

**Who posts a key that is not a row.** `ContactWorkspace` submits the `formFields` on the seat, which are the joined list. `writeBackContactFacts` posts `labelToFieldKey` of the painted label. Nudge form therefore posts `still_in_pool`, `clb_lowest`, `test_date`, `approximate_last_ee_update`, `language_test_product`, and `validity_still_valid_through`. Loop-closer form posts `work_permit_end`, `hours_week`, `teer_guess`, and `test_date`. Update facts posts the same kind of slug, including `what_changed` and `updated_clb_target`. None of those strings is a `collectible_fields.field_key`. The comment on `COLLECTIBLE_FIELDS` says the form unfolds a listing write, not that array. Those three submits remain the callers claim 30 named. Their source strings remain `Nudge form`, `Loop-closer form`, and `Update facts`. The class does not read the source. A post of `language_clb` for an opted-in contact still stores. A post of `still_in_pool` does not. `obj.optin.day` still completes on `fact_writebacks`. A refused key does not call `onCompletionWrite`, so it does not advance that objective.

**The mirrors.** `standInContactSeat.facts` and `factsContact` still apply claims 29 and 31 first. They do not remove a missing key that fails this class. A key that passes is still removed when `basis` is `express` or `implied`, including when `silenced` is true. `standInMachineApi.writeFact` still applies claim 30 first. When `get` returns `basis` `none`, it still does not record. When the basis allows the write and the key fails this class, it does not unshift a write-back, does not splice `missingFactSignals`, does not push an eligibility result, a signal, or a motion, and does not resolve a `writebackId`. It does not push `missingFieldKeys` for that refused fact. When the key passes, it still records, including when `silenced` is true, and it does not push a `missingFieldKeys` entry that fails the class. The stand-in of the catalog is `COLLECTIBLE_FIELDS`. `employerDirected` omitted is false. This claim does not change `get`, does not add a firm to it, and does not read the seat mirror’s slot from `writeFact`.

**What the product already required.** `docs/register/SEED.md` §5.4 is the classification. Self-reportable fields are eligible for forms and pre-meeting capture. Document-dependent fields never enter a form and become tracked Manage items. Employer-directed asks are aimed at the firm, not the client. `docs/register/SYSTEMS-STORY.md` §8 says route answers by field class, and it must not put document-dependent needs into forms. `docs/register/how/contact-refresh.md` leaf 1.1 says the consolidated form is self-reportable only, and document-dependent asks never appear as fields. `docs/register/how/contact-book.md` says the same for the loop-closer form, and that those asks stay Manage on the consultant desk. Seed assumption 9 says the self-reportable versus document-dependent split drives forms versus Manage. It does not put an employer-directed ask on the form. These two handlers are the form landing claims 29 and 30 already named. The seat list is already the inner join. The walker already refuses to signal a key outside the self-reportable catalog when that catalog is non-empty. An unclassed string is not that catalog. Storing it would clear a signal, re-evaluate, and can advance `obj.optin.day`, which is the collection the class exists to route.

**Rejected alternatives.**

- Refuse `document_dependent` and still accept a key with no `collectible_fields` row, so the painted slugs keep landing. The table is the class. The seat list is an inner join to it. The walker signals from it. `fact_writebacks.field_key` has no foreign key, so the live insert treats `still_in_pool` and `language_clb` as the same shape. Story §8 routes by field class. A string with no row has no class, so it is not the self-reportable route. The painted labels are not a second catalog. `body.source` naming the form does not make the slug a row. Claim 30 already refused to let that string open a door.

- Treat `employer_directed` as not this withhold, because every seeded true row is already `document_dependent`. The boolean is its own column. The check allows `self_reportable` with `employer_directed` true, and the seed simply has no such row. Seed §5.4 routes that flag to the firm, not the client. A capture-only test would accept that combination on both client landings. Assumption 9 separates forms from Manage. It does not send a firm ask to the form.

- Withhold the key on the seat and still insert it on `handleFactWriteback`, calling the fact route hand-entry. Both functions are the one landing. The three callers of `writeFact` are the contact forms. No consultant module calls it. The cascade source is `contact_workspace`, or the body string, or `contact`. None of those is a role. A split would store `eca_status` or `still_in_pool` through the route claim 30 already put behind the same opt-in.

- Delete the matching `missing_fact_signals` row for a refused key, and skip only the insert. Clearing the signal says the need was answered. A document-dependent key, a firm ask, and an unclassed string are not an answer on this landing. The signal stays. How that signal is recorded is not this insert.

- Add a foreign key, or reuse the empty-field 400, so the database or that message is the class. The empty 400 is the empty body. The class is a read. A missing row is a withhold, not a constraint failure. This claim does not write a migration.

- Specify `handleMissingFactSignalCreate`, `handleContactSeatUpload`, or the meeting book as this class. The signal route is another insert into `missing_fact_signals`. The upload inserts `contact_uploads`. The meeting handler books. None of them is this fact insert.

No founder question. A stored fact and a refused key are different collections. The first clears a signal, re-evaluates, and can advance “They opt in”. The second returns the seat, or a fact response that is not ok, and leaves those rows. Seed §5.4, Story §8, and the refresh and booking leaves already choose which keys are the form. The catalog is that choice. The painted slugs are not in it. The firm-directed boolean is a separate routing, and it is the same withhold on both handlers because both handlers are the client landing.

**What this leaves.** When `basis` is `express` or `implied` and `silenced` is true and the objective kind is `form`, `projectSeat` still sets `now.state` to `form` and still skips the field query, so the attached list is empty. The mirror’s `project` still attaches that contact’s questions. The payload type allows `now.state` `silenced`, and neither projection assigns it. That pane was not specified. It is not this class. `handleMissingFactSignalCreate` still inserts any non-empty `fieldKey` and does not read `consent_records` or `collectible_fields`. `writeBackContactFacts` still calls `signalMissingFact` after `writeFact`, including when `writeFact` rejects, and the catch still calls `applyFactsToMeetingsStore`. Loop-closer posts `signalMissingFieldKey` `validity_still_valid`, which is not a catalog row. Whether that signal insert is inside the opt-in gate was not specified. Whether a key that fails this class may still be that signal was not specified. `handleContactSeatUpload` still inserts without this read. When the objective kind is `meeting`, the seat can still book. Those were not specified.

**Evidence:** `contactSeat.ts` `handleContactSeatFacts`, `projectSeat` (the field query and `if (!silenced)`). `machine.ts` `handleFactWriteback`. `workflowWalk.ts` `executeRuleWrites`, `RULE_LEFT_FIELD_MAP`. `supabase/migrations/018_collectible_fields.sql`. `supabase/migrations/004_machine_tables.sql` `fact_writebacks.field_key`. `src/app/data/collectibleFields.ts` `COLLECTIBLE_FIELDS`. `src/app/register/prototype/shared/meetingsStore.ts` `labelToFieldKey`, `writeBackContactFacts`. `src/app/register/prototype/ContactPrototypeScene.tsx` the three `writeBackContactFacts` calls. `src/app/wire/standins/contactSeatMirror.ts` `facts`, `factsContact`. `src/app/wire/standins/machineApi.ts` `writeFact`. `docs/register/SEED.md` §5.4 and assumption 9. `docs/register/SYSTEMS-STORY.md` §8. `docs/register/how/contact-refresh.md` leaf 1.1. `docs/register/how/contact-book.md` the loop-closer leaf. `docs/register/AUTOMATIONS-FACE.md` law 25.

**Live.** Both handlers still insert any non-empty `fieldKey` and still do not read `collectible_fields`. `projectSeat` still keeps `capture` `self_reportable` and does not read `employer_directed`. `executeRuleWrites` still skips the catalog filter when the self-reportable set is empty, and when the set is non-empty it still does not read `employer_directed`. The mirrors still drop or record the posted key without this class. No migration was written.

### Revision — claim 33

The sentence that when `basis` is `express` or `implied` and `silenced` is true and the objective kind is `form`, the live seat still sets `now.state` to `form` and still skips the field query, and that the pane was not specified, stands as the gap. Claim 33 decides that pane. The class is unchanged. Claim 31 is unchanged.

---

## Claim 33 — Silence does not empty the form the opt-in already opened

**Standing:** necessary implication of claim 31 and of the refresh leaf, and a technical decision made in this session.

When the `consent_records` row for the link’s contact and firm is `basis` `express` or `basis` `implied`, `silenced` is true, and the objective kind is `form`, `projectSeat` still sets `now.state` to `form`. The title stays `A few facts so we can continue`. The instruction stays the firm’s form instruction. The field query is not skipped because `silenced` is true. The attached `formFields` are the class claim 32 already keeps: `missing_fact_signals` joined to `collectible_fields` where `capture` is `self_reportable` and `employer_directed` is false. This claim does not assign `now.state` `silenced`. The payload’s top-level `silenced` boolean stays the boolean the projection already returns. This claim does not replace the title or the instruction, does not put the contact back on the consent ask, and does not move the cursor.

**What the page is.** `ContactWorkspace` renders the form when `now.state` is `form`, including a Submit, from `seat.now.formFields`. It has no branch for `now.state` `silenced` and no branch on the top-level `silenced` flag. The Opt out control in the sider calls `silence` on every Now page. It is not this state’s replacement. The live query sits inside `if (!silenced)`, so this row gets `now.state` `form` and an empty list. Submit then posts no keys. The mirror’s `project` does not skip `questions` when `silenced` is true. When its state is `form`, it attaches them. This claim is that list. The mirror already attaches it. The live guard is the gap.

**What silence already is.** Claim 31 stores the fact when this row posts a key the class allows. `docs/register/how/contact-silence.md` says the commit stops automatic outreach. The readers are engagement runners, send gates, and book readiness. `docs/register/how/contact-refresh.md` leaf 1.1 does not condition the consolidated form on silence. Leaf 1.2’s condition “Contact still not silenced”, and its sentence that silenced contacts do not get new automatic asks, are the ask claim 31 already read as the send. `docs/register/furnish/contact-furnish.md` `contact-furnish-03` puts Silence on the open Nudge form, Update facts, and Loop-closer form, and says the core stop is still automatic outreach. `contact-furnish-14` is the receipt after the click, that automatic firm messages will stop. It is not a replacement of the form. The Ignore row is not this arm. Claims 28 and 29 still keep `now.state` off `form` when `basis` is `none` and `source` is `ignored`.

**The mirror.** `standInContactSeat.project` keeps attaching that contact’s questions when the state is `form` and the slot’s `silenced` is true. This claim does not add a skip. It does not assign `now.state` `silenced` on the mirror.

**Rejected alternatives.**

- Leave the query inside `if (!silenced)`, so the page shows the form title and an empty Submit. Claim 31 allows the write. Leaf 1.1 is a form that lists the outstanding self-reportable fields. An empty list is not that form. The route would still store a direct post of `language_clb`, and the page would offer nothing to submit. Claim 29 already refused to treat a withheld control as the gate. This is the other side: the write is allowed, and the list is the form.

- Assign `now.state` `silenced` and hide the form. The type allows the value. Neither projection assigns it. The workspace has no render for it. Furnish-03 keeps the form and puts Silence on it. The sider already has Opt out. A new state would replace the form with whatever title this claim would have to invent. This claim does not invent that page.

- Hide the fields because leaf 1.2 says the contact is still not silenced. That condition is on the later update leaf, beside the sentence that silenced contacts do not get new automatic asks. Claim 31 already read that sentence as the send. The send stays denied. The open form does not become the send.

- Specify the meeting branch in order to give silence one pane. When the objective kind is `meeting`, `projectSeat` still sets `now.state` to `meeting` after the consent test, including when `silenced` is true, and including the Ignore row. `docs/register/how/contact-book.md` asks for an invitation and a contact who is not silenced. That surface stays open.

No founder question. The contact who had opted in and was later silenced still sees the outstanding self-reportable fields that are not aimed at the firm, and can submit them. Automatic outreach stays stopped by the send. The empty list is the live guard, not the form the leaves describe.

**What this leaves.** When the objective kind is `meeting`, the seat still sets `now.state` to `meeting` for this silenced row, and for the Ignore row. That branch was not specified. `handleMissingFactSignalCreate` still inserts any key and does not read `consent_records`. `handleContactSeatUpload` still inserts without this read. Those were not specified.

**Evidence:** `contactSeat.ts` `projectSeat` (the `silenced` field query, the `now.state` branches, the payload `silenced`). `ContactSeatPayload` `now.state`. `src/app/register/prototype-ant/contact/ContactWorkspace.tsx` the `now.state` branches and the Opt out control. `src/app/wire/standins/contactSeatMirror.ts` `project`. `docs/register/how/contact-silence.md`. `docs/register/how/contact-refresh.md` leaf 1.1 and leaf 1.2. `docs/register/furnish/contact-furnish.md` `contact-furnish-03`, `contact-furnish-14`. Claim 31.

**Live.** `projectSeat` still skips the field query when `silenced` is true, and a form objective still sets `now.state` to `form`, so the list is empty. The mirror still attaches the questions. Neither projection assigns `now.state` `silenced`. No migration was written.

### Revision — claim 34

The sentence that `handleMissingFactSignalCreate` inserts `missing_fact_signals` and does not read `consent_records`, and that whether that post is inside the opt-in gate was not specified, stands as the gap. Claim 34 decides that gate. The fact class is unchanged. A refused fact still does not insert the fact handler’s own `missingFieldKeys`.

---

## Claim 34 — Recording a missing fact is not the opt-in gate

**Standing:** necessary implication of Seed §5.8 and of the rows the earlier claims left in place.

`handleMissingFactSignalCreate` does not read `consent_records`. A missing consent row, `basis` `none`, and `silenced` true do not withhold the insert. The handler inserts one `missing_fact_signals` row for the session firm, the body `contactId`, and the body `fieldKey`. It does not insert `fact_writebacks`, does not dispatch `fact_writebacks`, does not run the eligibility cascade, and does not call `onCompletionWrite`. It does not complete `obj.optin.day`. An empty `contactId` or `fieldKey` remains the existing 400. This claim does not set `now.state`, does not assign `status`, and does not set `silenced`.

**Why the signal is already allowed before opt-in.** `docs/register/SEED.md` §5.8 says every detection, including missing data, is recorded as a signal when found, and that outreach is decided separately. The send is that outreach. Claim 23 already denies it. The answer is the fact write. Claims 29, 30, and 32 already withhold that answer. `supabase/seeds/005_contact_workspace_fill.sql` inserts `missing_fact_signals` for `cr-harbor-4` at `firm-harbor` — `canadian_skilled_hours`, `language_clb`, and `foreign_work_years` — on the Ignore row claims 26, 28, and 29 left in place. Those signals are not deleted by the fact withhold. `executeRuleWrites` inserts `missing_fact_signals` and does not read `consent_records`. Gating this route on opt-in would refuse a detection the seed already stores for the contact who has not opted in, and would refuse it on a route the walker does not consent-check.

**What this route is not.** Claim 30 stops `missingFieldKeys` inside `handleFactWriteback` when the fact itself is withheld. That array is part of the fact landing. This function is `POST /machine/missing-fact-signals`. `writeBackContactFacts` calls `signalMissingFact` when `signalMissingFieldKey` is set, after the `writeFact` loop, including when `writeFact` rejects. The loop-closer submit passes `validity_still_valid`. The catch still calls `applyFactsToMeetingsStore`. That local list is not `missing_fact_signals`. This claim does not retune the paint. A refused fact does not, by itself, refuse this insert. Consent is not the reason it would be refused.

**The mirror.** `standInMachineApi.signalMissingFact` pushes a `missing_fact_signals` row and does not read `standInConsentSilence`. This claim leaves that push in place. It does not add a consent read.

**Rejected alternatives.**

- Withhold the insert when the consent row is missing or `basis` is `none`, because claims 29 and 30 stopped the fact handler’s `missingFieldKeys`. Those keys ride the fact post. Stopping them is stopping that landing. This route does not store the answer and does not advance “They opt in”. The Ignore contact already has three missing-fact rows. The withhold would specify a deletion the earlier claims did not make.

- Withhold the insert when `silenced` is true, so a silenced contact grows no new gap. Seed §5.8 separates the detection from the outreach. Claim 31 already separated the fact write from the send. The signal is the detection. The send remains the stop.

- Treat the call after a rejected `writeFact` as a bypass that must be closed in order to keep claim 30. The helper signals a different route. Claim 30 did not retune that call. Consent on the fact is not consent on the signal. Closing the helper would make the signal a side effect of a successful fact, which is not what §5.8 says a detection is.

No founder question. The gap can be recorded before the contact has opted in, and while the contact is silenced. The ask is still the send. The answer is still the fact. The Ignore row’s three signals stay.

**What this leaves.** This handler still inserts whatever `fieldKey` was posted. It does not read `collectible_fields`. `validity_still_valid` has no row. Claim 32 refuses that string as a fact and does not clear a signal for it, so a signal of that key cannot be answered by the fact landing. `executeRuleWrites` inserts only the claim 32 class and was not the question of an unclassed signal. Whether a key with no `collectible_fields` row, a `document_dependent` key, or an `employer_directed` key may be inserted here was not specified. No Manage table was found. `contact-book.md` still names Manage as the consultant desk. That store was not specified. The local meetings-store paint was not retuned. `handleContactSeatUpload` and the meeting branch were not specified.

**Evidence:** `machine.ts` `handleMissingFactSignalCreate`. `routes.ts` `POST /machine/missing-fact-signals`. `src/app/wire/reals/machineApi.ts` `signalMissingFact`. `src/app/wire/standins/machineApi.ts` `signalMissingFact`. `src/app/register/prototype/shared/meetingsStore.ts` `writeBackContactFacts`. `src/app/register/prototype/ContactPrototypeScene.tsx` the loop-closer `signalMissingFieldKey`. `workflowWalk.ts` `executeRuleWrites`. `supabase/seeds/005_contact_workspace_fill.sql` the `cr-harbor-4` missing-fact rows. `docs/register/SEED.md` §5.8. `docs/register/how/contact-book.md` the Manage sentence.

**Live.** `handleMissingFactSignalCreate` still does not read `consent_records` and still inserts any `fieldKey`. `signalMissingFact` still pushes without reading consent. That is this claim for the opt-in question. The class of the key on this route is still unread. No migration was written.

### Revision — claim 35

The sentence that this handler still inserts whatever `fieldKey` was posted, and that whether a key with no `collectible_fields` row, a `document_dependent` key, or an `employer_directed` key may be inserted here was not specified, stands as the gap. Claim 35 decides that key. Consent is unchanged. A missing row, `basis` `none`, and `silenced` true still do not withhold a key the class allows. The fact class is unchanged. A refused fact still does not insert the fact handler’s own `missingFieldKeys`. `validity_still_valid` still is not stored as `fact_writebacks`.

---

## Claim 35 — A missing-fact signal is a form field, not the consultant’s tracked ask

**Standing:** necessary implication of claim 32 and of the form-occupancy ascription, and a technical decision made in this session.

`handleMissingFactSignalCreate` inserts `missing_fact_signals` only when `collectible_fields` has the body `fieldKey`, `capture` is `self_reportable`, and `employer_directed` is false. A key with no row, a key whose `capture` is `document_dependent`, and a key whose `employer_directed` is true do not insert. The handler does not return `id`. The response is not ok. An empty `contactId` or `fieldKey` remains the existing 400. The class withhold does not reuse that 400. Claim 34 is unchanged: a missing consent row, `basis` `none`, and `silenced` true do not withhold a key the class allows. The insert still does not write `fact_writebacks`, does not dispatch, does not run the eligibility cascade, and does not call `onCompletionWrite`. It still does not complete `obj.optin.day`. This claim does not set `now.state`, does not assign `status`, and does not set `silenced`.

**Why this table is the form.** `missing_fact_signals.field_key` is text and has no foreign key, in `supabase/migrations/004_machine_tables.sql`. The live insert accepts any string. The class is a read of `collectible_fields` before the insert. This claim does not add a constraint. `projectSeat` already joins the table to `collectible_fields` and keeps `capture` `self_reportable`. Claim 32 already adds `employer_directed` false to that keep, and already makes `executeRuleWrites` use the same positive test, including when the catalog is empty. A key this route stored outside that class would sit on the form’s required-data table and would not become a field. Claim 32 would not clear it, because a refused fact does not delete the signal. `src/app/data/eventTestContract.ts` names the folder for this table `Required data`. The Systems Analyst log on `origin/pr-86`, stamp 2026-08-20 19:20 UTC, says form occupancy is this run’s `missing_fact_signals`, and the 2026-08-21 08:55 UTC stamp says the rule insert is self-reportable `missing_fact_signals` only. The same sentences are in the working-tree copy of that log. No leaf in `docs/register/how/` names `missing_fact_signals` as Manage. `docs/register/how/contact-book.md` says document-dependent asks stay Manage on the consultant desk and does not name this table. No `CREATE TABLE` under `supabase/` is that desk. `ClientDataPanel` prints every listed `field_key` as a tag. That is a dump of the rows. It is not a module named Manage.

**The three refusals.** `validity_still_valid` has no `collectible_fields` row. Loop-closer still posts it through `signalMissingFact` after `writeFact`, including when `writeFact` rejects. The route refuses it. The helper still calls. The catch still swallows a response that is not ok. `applyFactsToMeetingsStore` still runs. This claim does not retune that paint and does not stop the call. `eca_status` and `has_trade_certificate` are `document_dependent`. The four employer-directed keys are the same capture and `employer_directed` true. No seeded row is `self_reportable` and `employer_directed` true. The check allows it. All of those fail this route. Seed §5.4 and Story §8 route document-dependent needs off the form and employer-directed asks to the firm. Putting them on this table would be the form occupancy the join then hides. The seeded signals in `supabase/seeds/005_contact_workspace_fill.sql` are `canadian_skilled_hours`, `language_clb`, `foreign_work_years`, `ee_profile_last_updated`, `crs_score`, `noc`, and `ee_profile_exists`. Those pass. The Ignore contact’s three signals stay.

**The list.** `handleMissingFactSignalsList` still returns the stored rows for the firm, or for the contact, and does not apply this class. This claim does not delete a row that would now fail. The form join still drops it. `GET` is not the insert.

**The mirror.** `standInMachineApi.signalMissingFact` pushes only when `COLLECTIBLE_FIELDS` has the key, `capture` is `self_reportable`, and `employerDirected` is not true. An omitted `employerDirected` is false. When the key fails, it does not push and it does not resolve an id. It still does not read `standInConsentSilence`. A missing slot, `basis` `none`, and `silenced` true still do not withhold a key that passes.

**Rejected alternatives.**

- Record a `document_dependent` key or an `employer_directed` key here, and let the form join hide it, so this table is the tracked gap. The join is a filter on the form, not a second desk. No leaf names the table as Manage. The walker claim 32 already refuses to signal outside the class. A second writer that plants `eca_status` would store a need the form does not show and the fact landing does not answer. Seed §5.4’s Manage item is not given a table by that hide.

- Accept a key with no row, so `validity_still_valid` still lands. The string has no class. Story §8 routes by field class. The painted loop-closer key is the same family as the slugs claim 32 refused as facts. Storing it makes a signal the fact landing cannot clear.

- Withhold the class-legal key when consent is missing, `basis` is `none`, or `silenced` is true, in order to keep the new rows inside opt-in. Claim 34 already separated the detection from the opt-in. The Ignore contact already has three class-legal signals. The class is which key, not whether the contact has agreed.

- Stop `writeBackContactFacts` from calling `signalMissingFact` when `writeFact` rejects, so the unclassed key never arrives. Claim 34 already left that call in place. The route refuses the key. Closing the helper would make the signal a side effect of a successful fact.

- Reuse the empty-field 400, or add a foreign key. The 400 is the empty body. A missing row is a withhold. This claim does not write a migration.

No founder question. The form’s required-data row is the class claim 32 already uses for the answer and for the walker. The consultant desk for a document-dependent ask is still unnamed. This table is not that desk. `validity_still_valid` does not become a signal in order to give the loop-closer a place to put it.

**What this leaves.** No table is named Manage. `contact_uploads` in the same seed stores kinds such as `ECA` and `job offer` with `field_key` null. Those rows are not `eca_status`. This claim does not call that table the desk. `handleContactSeatUpload` still inserts without reading `consent_records` or `collectible_fields`. The meeting branch was not specified. The local meetings-store paint was not retuned.

**Evidence:** `machine.ts` `handleMissingFactSignalCreate`, `handleMissingFactSignalsList`. `routes.ts` `POST /machine/missing-fact-signals`. `src/app/wire/standins/machineApi.ts` `signalMissingFact`. `src/app/wire/reals/machineApi.ts` `signalMissingFact`. `src/app/data/collectibleFields.ts`. `src/app/data/eventTestContract.ts` the Required data folder. `src/app/register/prototype-ant/consultant/clientData/ClientDataPanel.tsx` the missing-fact tags. `workflowWalk.ts` `executeRuleWrites`. `contactSeat.ts` the field join. `supabase/migrations/004_machine_tables.sql` `missing_fact_signals`. `supabase/seeds/005_contact_workspace_fill.sql` the signal rows. `docs/register/SEED.md` §5.4. `docs/register/SYSTEMS-STORY.md` §8. `docs/register/how/contact-book.md` the Manage sentence. `origin/pr-86` `docs/register/SYSTEMS-ANALYST-LOG.md` 2026-08-20 19:20 UTC and 2026-08-21 08:55 UTC. Claim 32. Claim 34.

**Live.** `handleMissingFactSignalCreate` still inserts any non-empty `fieldKey` and still does not read `collectible_fields`. `signalMissingFact` still pushes any key. The list still returns every stored row. No migration was written.

### Revision — claim 36

The sentence that `handleContactSeatUpload` still inserts without this read, and that whether that insert is inside the opt-in gate was not specified, stands as the gap. The same sentence in claims 32, 33, and 34 stands as that gap. Claim 36 decides that insert. The signal class is unchanged. The fact class is unchanged.

---

## Claim 36 — An upload lands before opt-in, and a question note names only a form field

**Standing:** necessary implication of the rows the seed already stores, and a technical decision made in this session.

`handleContactSeatUpload` does not read `consent_records`. A missing consent row, `basis` `none`, and `silenced` true do not withhold the insert. The handler still inserts one `contact_uploads` row for the link’s firm and contact when the origin checks already pass, and it still dispatches `contact_uploaded` with `writes` of that row. It does not insert `fact_writebacks`, does not delete or insert `missing_fact_signals`, and does not call `onCompletionWrite`. It does not complete `obj.optin.day`. It still returns `projectSeat`. An origin other than `kind`, `custom`, `question`, or `any` remains the existing 400. A `custom` origin with no kind, and a `question` origin with no field key, remain the existing 400s. This claim does not set `now.state`, does not assign `status`, and does not set `silenced`.

**The question key.** When `origin` is `question`, `field_key` is stored only when `collectible_fields` has it, `capture` is `self_reportable`, and `employer_directed` is false. That is claim 32’s class. A key with no row, a `document_dependent` key, and an `employer_directed` key do not insert, do not dispatch, and do not return the seat. The response is not ok. The class withhold does not reuse the empty-field 400. `kind`, `custom`, and `any` do not read `collectible_fields`. Their `field_key` stays null, as the insert already sets it. A kind of `ECA` or `job offer` still stores. `language_clb` as a question still stores.

**Why consent does not gate it.** `supabase/seeds/005_contact_workspace_fill.sql` inserts four `contact_uploads` for `cr-harbor-4`, the Ignore row claims 26, 28, and 29 left at `basis` `none` and `source` `ignored`: a pay stub, a passport, an `any` note `Called in; asked to hold the file.`, and a `question` on `language_clb`. The same file inserts four uploads for `cr-cedar-3`, including `Has not Agreed yet; sent the docs ahead.` The consent insert in that file has no row for `cr-cedar-3`. Gating this route on opt-in would refuse files the seed already keeps for a contact who has not agreed and for the contact who ignored. `projectSeat` loads `files` for the link with no consent predicate. `ContactWorkspace` puts Upload on the sider beside Now and History, on every seat, including when `now.state` is `consent`. The upload is not the form. `docs/register/furnish/contact-furnish.md` says the Nudge form, Update facts, and Loop-closer form have no upload controls. Those forms stay the fact landing. This handler is the other write.

**What the question is.** The seat search builds question hits from `missing_fact_signals` union `fact_writebacks`, and uses `collectible_fields` only for the label. After claims 32 and 35, new rows in those two tables are the form class. A direct question post is still the catalog test, not a requirement that a signal already exist. `language_clb` passes with or without a signal. `validity_still_valid` and `eca_status` do not. A document can still arrive as `kind` or `custom` with `field_key` null. The seed already does that for `ECA` and `job offer`. Those kinds are not `collectible_fields.field_key` values. This claim does not name `contact_uploads` as Manage.

**The mirror.** `standInContactSeat.upload` and `uploadContact` still refuse when `isOut` is set. That refuse stays. They do not gain a read of `basis`. A missing slot, `basis` `none`, and `silenced` true still upload. A `question` whose key fails the class does not unshift a row and does not resolve the seat as a stored upload. The stand-in of the catalog is `COLLECTIBLE_FIELDS`. `kind`, `custom`, and `any` still unshift without that test.

**Rejected alternatives.**

- Withhold the insert when the consent row is missing or `basis` is `none`, because claims 29 and 30 stopped the fact. The fact is the answer that can advance “They opt in”. This insert does not write that table and does not call `onCompletionWrite`. The seed already stores the Ignore contact’s files and Priya Shah’s note that the docs went ahead of Agree.

- Withhold the insert when `silenced` is true, so a silenced contact files nothing. Silence stops the send. The Upload control is on the seat the contact opened. Claim 31 already let that contact store a class-legal fact. The file is the same kind of contact write. It is not an automatic ask.

- Apply claim 32’s class to `kind`, `custom`, and `any`, so `ECA` must be `eca_status` or it is refused. Those origins store a free-text kind and a null `field_key`. The seed’s document rows are that shape. Collapsing them onto the catalog would refuse `passport` and `pay stub`, which are not collectible fields, and would treat the upload table as the form.

- Accept any question `field_key`, so a note can name `validity_still_valid` or `eca_status`. The question hit is a field the form can carry. A string with no row is not that field. A document-dependent key is the ask Story §8 keeps off the form. The file for that ask is still a `kind` or `custom` row, which this claim stores.

- Call `contact_uploads` the Manage desk because the seed has an `ECA` file. Manage, in the booking leaf, is where document-dependent asks stay. `eca_status` is not the `kind` `ECA`. No column here is that field. Naming the table would invent the desk claim 35 refused to invent.

No founder question. A file can land before the contact has opted in, and after the contact is silenced. A question note can name only a self-reportable field that is not aimed at the firm. A document kind is not that test. The opt-in objective still completes on `fact_writebacks`, not on this insert.

**What this leaves.** When the objective kind is `meeting`, `projectSeat` still sets `now.state` to `meeting` after the consent test, including the Ignore row and including `silenced` true. `handleContactSeatBook` still inserts `meeting_booked` and still dispatches. `docs/register/how/contact-book.md` leaf 1.1 still asks for an invitation and a contact who is not silenced. That surface was not specified. `writeBackContactFacts` still calls `applyFactsToMeetingsStore` when `writeFact` rejects. That local list was not retuned. No table is named Manage.

**Evidence:** `contactSeat.ts` `handleContactSeatUpload`, `projectSeat` the file query, `seatFromContext` via the two routes. `routes.ts` `POST /contact-seat/:token/uploads` and `POST /machine/contact-workspaces/:contactId/uploads`. `supabase/migrations/019_contact_seat.sql` `contact_uploads`. `supabase/seeds/005_contact_workspace_fill.sql` the `cr-harbor-4` and `cr-cedar-3` upload rows, and the consent insert that omits `cr-cedar-3`. `src/app/register/prototype-ant/contact/ContactWorkspace.tsx` the Upload nav and `putIn`. `src/app/wire/standins/contactSeatMirror.ts` `upload`, `uploadContact`, `isOut`. `docs/register/furnish/contact-furnish.md` the no-upload legend. `docs/register/how/contact-book.md` leaf 1.1 and leaf 1.2. Claims 32 and 35.

**Live.** `handleContactSeatUpload` still does not read `consent_records` or `collectible_fields`, and a `question` still stores whatever `fieldKey` was posted. The mirror still unshifts that key and still does not read `basis`. No migration was written.

### Revision — claim 37

The sentence that when the objective kind is `meeting`, `projectSeat` still sets `now.state` to `meeting` after the consent test, including the Ignore row and including `silenced` true, and that `handleContactSeatBook` still inserts, stands as the gap. The function that inserts is `handleContactSeatMeeting`. There is no `handleContactSeatBook`. Claim 37 decides that pane and that insert. The upload is unchanged. A missing consent row, `basis` `none`, and `silenced` true still do not withhold `contact_uploads`.

---

## Claim 37 — A meeting books from the invitation, and not while the contact is silenced

**Standing:** necessary implication of the booking leaf, and a technical decision made in this session.

When `projectSeat` has already passed the consent ask, and the objective kind it reads is `meeting`, and `silenced` is false, `now.state` is `meeting`. The title stays `Book a time`. The instruction stays the firm’s meeting instruction. `meetingSlots` are attached. That includes `basis` `express`, `basis` `implied`, and the Ignore row claim 26 writes (`basis` `none`, `source` `ignored`, `silenced` false). When that same ask is passed, the kind is `meeting`, and `silenced` is true, `now.state` stays `empty`. The empty title and the empty instruction stay. `meetingSlots` are not attached. The payload’s top-level `silenced` boolean stays the boolean the projection already returns. This claim does not assign `now.state` `silenced`, does not put that contact back on the consent ask, and does not move the cursor.

`handleContactSeatMeeting` reads `consent_records` for the link’s contact and firm, and it reads the same objective kind `projectSeat` reads. It inserts `meeting_booked`, dispatches `meeting_booked`, calls `onCompletionWrite`, and nullifies open `active_attempts` only when `silenced` is false, the consent ask is not outstanding, and that kind is `meeting`. A `silenced` true row does none of those. A missing row, or `basis` `none` whose `source` is not `ignored`, does none of those. A kind other than `meeting` does none of those. The handler returns `projectSeat` on that withhold. It does not return an id. The response is ok because the projection is ok. The withhold does not reuse the empty-slot 400. An empty `slot` remains that 400 only on the path that is allowed to insert. This claim does not assign `status`, does not set `silenced`, and does not write `fact_writebacks`.

**The invitation.** `projectSeat` takes the newest `enrollment` for the link’s firm and contact, ordered by `enrolled_at`. The campaign is that row’s `campaign_id`, or `link.campaign_id` when the enrollment has none. The kind is `campaign_objective.kind` for that campaign. `meeting` is the bound campaign the booking leaf calls the invitation. `cr-harbor-3` at `firm-harbor` and `cr-cedar-2` at `firm-cedar` are that kind, on `camp.react.meeting`, and both consent rows are `basis` `express`, `silenced` false. The pane is booking. The post of a slot inserts. `cr-harbor-4` is the Ignore row on `camp.optin.day`, whose kind is `form`. Claim 28 still leaves that Now empty. A post of a slot for that contact does not insert a meeting and does not nullify attempts. No seeded contact is Ignore on a meeting campaign. The rule still allows that pair when it exists: the ask is finished, the kind is `meeting`, and `silenced` is false, so the pane is booking and the post inserts.

**The outstanding ask.** The consent branch is unchanged. A missing row, or `basis` `none` with `source` other than `ignored`, still sets `now.state` to `consent`, including when the kind is `meeting` and including when `silenced` is true. That contact is not on the invitation. The write refuses for the same reason. Ignore is not that branch. `source` `ignored` already finished the ask. This claim does not put Agree and Ignore back on that page.

**What the page and the post are.** `ContactWorkspace` renders `MeetingBook` and **Confirm booking** only when `now.state` is `meeting`. Confirm calls `book` with the slot, which posts `POST /contact-seat/:token/meeting` or `POST /machine/contact-workspaces/:contactId/meeting`. Both routes are `handleContactSeatMeeting`. The body is `{ slot }`. The handler does not read which route called. On the allowed path the insert is the one already written: `mtg-` plus a uuid, `source` `contact_workspace`, `consultant_name` null, `enrollment_id` from the link, `campaign_objective_id` from the handler’s own campaign lookup, then the dispatch, `onCompletionWrite`, and the nullify of `status` `open` for that firm and contact. Claim 9 is that nullify, and it runs only after a row was inserted. A refused book does not stop the attempts. The empty-slot 400 stays `slot required` and does not insert. A link refuse and `workspace_opted_out` still return before this read. The seat Opt out control is `handleContactSeatSilence`. That statement sets `workspace_opted_out` and does not set `silenced` true. It is not this boolean.

**Why silence closes the booking and not the form.** `docs/register/how/contact-book.md` leaf 1.1 says the commit writes the meeting and the contact must not be silenced. The conditions are eligible or invited, and not silenced. `docs/register/how/contact-silence.md` says the silenced state is read by runners, send gates, and book readiness. Claim 33 kept a silenced, opted-in contact on the form because the refresh leaf does not condition that form on silence. The same claim left this branch open. This claim does not empty that form. A form objective with `basis` `express` or `implied` and `silenced` true still sets `now.state` to `form`. A meeting objective with `silenced` true does not set `now.state` to `meeting`.

**Why Ignore can still book.** The booking leaf does not say the contact must have agreed. It says the contact was invited, which this seat already reads as the meeting kind, and that the contact is not silenced. Claim 28 kept Ignore off the form because that pane is deeper collection. The booking leaf is a different outcome. Agree unlocking later nudges is the send. `consentAndHaltGate` still denies a purpose that is not `opt-in` when `basis` is `none`. This claim does not retune that send. A contact who ignored is not sent a new invitation by that arm. When the enrollment they already have is a meeting campaign, the seat they opened is the booking the leaf describes.

**The mirror.** `standInContactSeat.project` still sets `consent` when the slot is missing or `basis` is `none` and `source` is not `ignored`. When the campaign is `camp.react.meeting` and `silenced` is false, including the Ignore slot, `state` is `meeting` and the slots are attached. When that campaign is the one and `silenced` is true, `state` stays `empty` and the slots are omitted. `book` and `bookContact` return that projection. They still do not record a meeting. This claim does not add a `meeting_booked` store to the mirror.

**Rejected alternatives.**

- Leave `now.state` `meeting` when `silenced` is true, and treat the leaf’s “not silenced” as only the invitation send. The sentence sits on the commit that writes the meeting, beside the slot and **Confirm booking**. Book readiness is the send’s reader. The commit is this insert, the dispatch, the completion, and the nullify. A silenced contact who posts a slot would still put a meeting on the consultant’s list and stop open attempts. Claim 33 already refused to decide this pane by the form rule. The booking leaf decides it.

- Refuse the Ignore row the way claim 29 refuses a fact. The fact is deeper collection. Seed §8.2 and Story §6 gate that collection on opt-in. The booking leaf’s conditions are the invitation and not silenced. `cr-harbor-4` is not invited: the kind is `form`, so the post already refuses. Adding `basis` `express` or `implied` as a third condition would refuse a meeting campaign the leaf allows once the contact is not silenced.

- Treat the withheld **Confirm booking** button as the whole gate. Claim 29 already refused that for the fact. A direct post of a slot for a silenced contact, for `cr-harbor-4`, or for a missing consent row, still inserts, dispatches, completes, and nullifies. The pane is the page. The handler is the write.

- Return the empty-slot 400 when the book is withheld, or invent a refuse code. The 400 is the empty slot on a book that would otherwise insert. A silenced contact with no slot is not missing a slot. The projection is the response the seat’s other withheld posts return. Empty is the Now this claim already uses when the meeting does not open. The outstanding ask still returns the consent projection.

- Read `consent_records.status`, or set `silenced` from this post. `projectSeat` does not read `status`. Claim 28 left that. The send’s status arm stays the send. This post does not change the row.

- Specify `handleMeetingBook` as this withhold. That function is `POST /machine/meetings`. The seat does not call it. `ContactWorkspace` calls `handleContactSeatMeeting`. The machine post was the next writer of the same table. It is claim 38.

- Hide the history row for the meeting campaign in order to hide the booking. The history list follows campaign order and the current `campaign_id`. Claim 28 left the form campaign outstanding in history while Now stayed empty. This claim does the same for a silenced meeting. Now does not open the slots.

No founder question. The leaf already chooses an invited contact who is not silenced. The seat’s meeting kind is the invitation it already computes. Silence closes that pane and that write. It does not close the form claim 33 opened. Ignore is not a second opt-in test on a meeting campaign. The opt-in send gate is unchanged.

**What this leaves.** `handleMeetingBook` still inserts `meeting_booked` for the session firm and the body contact, still dispatches, still calls `onCompletionWrite`, still nullifies open attempts, and still inserts the side `engagement_records` row, without reading `consent_records` and without reading `campaign_objective.kind`. The plant’s Booking calls that route through `confirmContactBooking`. `writeBackContactFacts` still calls `applyFactsToMeetingsStore` when `writeFact` rejects. That local list was not retuned. No table is named Manage.

**Evidence:** `contactSeat.ts` `projectSeat` (the consent branch, the `meeting` branch, `meetingSlots`), `handleContactSeatMeeting`, `handleContactSeatSilence`. `routes.ts` the two meeting posts. `src/app/register/prototype-ant/contact/ContactWorkspace.tsx` `MeetingBook` and `book`. `src/app/wire/reals/machineApi.ts` `bookContactSeat`, `bookContactWorkspace`. `src/app/wire/standins/contactSeatMirror.ts` `project`, `book`, `bookContact`. `src/app/wire/standins/machineApi.ts` `bookContactSeat`, `bookContactWorkspace`. `supabase/seeds/002_machine_tables.sql` `camp.react.meeting`, `obj.react.meeting`. `supabase/seeds/005_contact_workspace_fill.sql` `cr-harbor-3`, `cr-cedar-2`, `cr-harbor-4`. `docs/register/how/contact-book.md` leaf 1.1. `docs/register/how/contact-silence.md`. `docs/register/how/contact-consent.md` leaf 1.2. Claims 9, 28, 33, and 36.

**Live.** `projectSeat` still sets `now.state` to `meeting` when the kind is `meeting` and the consent ask is passed, including when `silenced` is true and including the Ignore row. `handleContactSeatMeeting` still does not read `consent_records` or the objective kind. The mirror still sets `meeting` for `camp.react.meeting` without reading `silenced`. No migration was written.

### Revision — claim 38

The sentence that `handleMeetingBook` still inserts without this read, and that the plant’s Booking calls that route, stands as the gap. Claim 38 decides that post. The seat pane and the seat insert are unchanged. A silenced contact still does not book through `handleContactSeatMeeting`. An uninvited contact still does not. `contact_uploads` are unchanged.

---

## Claim 38 — The machine meeting post is the same invitation

**Standing:** necessary implication of claim 37, and a technical decision made in this session.

`handleMeetingBook` reads `consent_records` for the session firm and the body `contactId`, and it reads `campaign_objective.kind` for the newest `enrollment` of that firm and contact. It inserts `meeting_booked`, dispatches `meeting_booked`, calls `onCompletionWrite`, nullifies open `active_attempts`, and inserts the side `engagement_records` row only when `silenced` is false, the consent ask is not outstanding, and that kind is `meeting`. A `silenced` true row does none of those. A missing row, or `basis` `none` whose `source` is not `ignored`, does none of those. No enrollment, a null `campaign_id`, and a kind other than `meeting` do none of those. The handler does not return `id`. The response is not ok. An empty `contactId` remains the existing 400. The withhold does not reuse that 400. This claim does not assign `status`, does not set `silenced`, and does not require a slot. A null `slot` on an allowed book still stores, as the insert already does.

**The same commit.** `POST /machine/meetings` is this function. The body is `contactId`, and optionally `slot`, `consultantName`, `source`, and `contactName`. `source` defaults to `contact_portal`. `confirmContactBooking` in `meetingsStore.ts` calls `bookMeeting` with that source and is the only caller in `src/`. The plant’s Booking in `ContactPrototypeScene` calls `confirmContactBooking` and does not receive `silenced`. `ContactWorkspace` does not call this route. It calls the seat. Claim 37 is that button. This route is the other writer of the same table, the same dispatch, the same completion, and the same nullify. Leaf 1.1’s commit is not two doors. A silenced contact who cannot book on the seat cannot book here either. `cr-harbor-3` and `cr-cedar-2` pass: `express`, not silenced, kind `meeting`. `cr-harbor-4` does not: the kind is `form`. A missing consent row does not. The walk script that posts the first contact of a firm is this route. When that contact fails the test, the response is not ok. This claim does not change the script.

**What stays on the allowed path.** The newest enrollment is the one the handler already loads, `ORDER BY enrolled_at DESC LIMIT 1`, without requiring `campaign_id`. The kind is read from that row’s campaign. The insert still stores that enrollment’s id, the objective id `campaignObjectiveIdForCampaign` already returns, the body’s source, and the body’s consultant name. The dispatch payload stays `meetingId`, `contactId`, `slot`, and `campaign_objective_id`. Claim 11’s `writes` array is unchanged, and the live dispatch still omits it. The side `engagement_records` row of kind `meeting_booked` still inserts after the dispatch, and only on this allowed path. Claim 10 left that side row off the handle. A refused book does not insert it, and it does not nullify attempts. Claim 9 runs only after a meeting row exists.

**The pair.** The firm is `firmId` on the session, the same firm the insert already uses. The contact is the body. Another firm’s consent row does not allow this book and does not withhold it. `workspace_opted_out` is the seat’s earlier refuse. This route does not read it. This claim does not add that read. `status` stays unread, as on the seat.

**The mirror.** `standInMachineApi.bookMeeting` reads `standInConsentSilence.get` for the body contact. That map has no `source`. A missing slot is `basis` `none` and `silenced` false. `basis` `none` does not push a meeting and does not nullify attempts, and the call does not resolve an id. `silenced` true does not either. This claim does not add `source` to the map and does not make `get` take a firm. Ignore cannot be represented there, so the live row’s `source` `ignored` exemption is not copied onto the map. When `basis` is `express` or `implied` and `silenced` is false, the invitation is the seat link’s `campaignId` for that contact. `camp.react.meeting` pushes and nullifies as the method already does. No link, or any other campaign, does not push and does not nullify. The painted contact `sarah` has no slot and no link. The plant still calls. This claim does not store that meeting. The seat mirror’s own consent map is not this read.

**Rejected alternatives.**

- Leave the route open because the plant is not the product face. The plant is the caller. The insert, the dispatch, the completion, and the nullify are the commit leaf 1.1 names. Claim 37 closed that commit on the seat. An open machine post is the same commit with the gate removed. `ContactWorkspace` not calling it does not make the row a different event.

- Treat `consultantName` as a consultant desk booking that may ignore silence. No consultant module calls `bookMeeting`. The stored source on the plant’s call is `contact_portal`. The seat’s source is `contact_workspace`. Those are two contact confirms. A desk booking that the product does not have is not a reason to keep this post open.

- Require `basis` `express` and refuse `source` `ignored`. Claim 37 already allows Ignore when the kind is `meeting` and `silenced` is false. This route uses that rule. The map’s missing `source` is the stand-in’s gap. It is not a recut of the live row.

- Require a slot, or reuse the empty-contact 400 for a silenced contact. The machine insert already stores a null slot. The 400 is the empty `contactId`. A withhold is not that body.

- Stop the side engagement by deleting it on the allowed path, or add it to `payload.writes`. Claim 11 left it off the meeting handle because the write-set names `meeting_booked` only, and because the row does not exist yet at the dispatch. This claim only stops the insert when the book itself does not happen.

- Merge `standInConsentSilence` with the seat mirror’s slot so `cr-harbor-3` books in the stand-in before `setConsent`. The two maps are the discrepancy already left beside claim 31. This post reads the machine map. The seat projection reads the seat slot. Making one map is not the invitation.

No founder question. The machine post writes a meeting under the same invitation and the same silence rule as the seat. The plant’s button is not a second policy. The local meetings list that `confirmContactBooking` pushes after a successful call is the caller’s mirror of a row this route stored. A refused response does not give it an id.

**What this leaves.** `confirmContactBooking` still pushes a `StoredMeeting` only after `bookMeeting` returns an id. This claim does not retune that local shape. `writeBackContactFacts` still calls `applyFactsToMeetingsStore` when `writeFact` rejects. That list is not `meeting_booked`. It was not retuned. No table is named Manage. `standInConsentSilence` is still one slot per contact, and `get` still does not take a firm.

**Evidence:** `machine.ts` `handleMeetingBook`. `routes.ts` `POST /machine/meetings`. `campaignHousing.ts` `campaignObjectiveIdForCampaign`, `onCompletionWrite`. `src/app/register/prototype/shared/meetingsStore.ts` `confirmContactBooking`. `src/app/register/prototype/ContactPrototypeScene.tsx` `confirmBooking`, the Booking surface, `DEMO_CONTACT_ID`. `src/app/wire/standins/machineApi.ts` `bookMeeting`. `src/app/wire/standins/consentSilence.ts` `get`. `src/app/wire/standins/contactSeatMirror.ts` the link `campaignId`s. `scripts/close-walk-gaps.ts` the meeting post. `docs/register/how/contact-book.md` leaf 1.1. Claims 9, 11, and 37.

**Live.** `handleMeetingBook` still does not read `consent_records` or `campaign_objective.kind`. `standInMachineApi.bookMeeting` still pushes and still nullifies without that read. The plant’s Booking still calls through. No migration was written.

### Revision — claim 39

The sentence that `writeBackContactFacts` still calls `applyFactsToMeetingsStore` when `writeFact` rejects, and that the local list was not retuned, stands as the gap. The same sentence in claims 30, 34, 35, and 37 stands as that gap. Claim 39 decides the paint. The meeting insert is unchanged. A refused book still does not add a `StoredMeeting`. `meeting_booked` is unchanged. `signalMissingFact` is unchanged.

---

## Claim 39 — A refused fact does not paint the local meetings list

**Standing:** necessary implication of Live brief reading the write-back, and of the booking mirror in claim 38, and a technical decision made in this session.

`writeBackContactFacts` calls `applyFactsToMeetingsStore` only when every `writeFact` in its loop returned. The facts it applies are the ones that helper already chooses on that path: `mergeFactsPreferMachine` of the listed write-backs and the submitted facts when `listFactWritebacks` returns at least one fact, and the submitted facts when that list throws or returns none. The apply updates a `StoredMeeting` already in the array whose `clientId` matches. It does not call `addMeeting`. When any `writeFact` throws, the helper does not call `applyFactsToMeetingsStore`. The array is unchanged by that call. `signalMissingFact` still runs when `signalMissingFieldKey` is set, including when the loop threw. Claims 34 and 35 are that call. This claim does not stop it. It does not insert `fact_writebacks` and it does not insert `meeting_booked`.

**One array.** `meetings` in `src/app/register/prototype/shared/meetingsStore.ts` is the only list. It starts as `SEED_MEETINGS`: `m1` for `sarah`, status Upcoming, phase Meeting-ready; `m2` for `james`, the same status and phase; `m3` for `priya`, status Tentative, phase In motion. `applyFactsToMeetingsStore` maps that array. On a match it replaces facts whose labels collide, sets `asOf` to a write-back clock, and appends the observation that the source refreshed Live brief facts. When nothing matches and the fact list is non-empty, the live function calls `addMeeting` with id `m-facts-` plus the client id, status Tentative, phase In motion, purpose `Facts write-back`. `confirmContactBooking` calls `addMeeting` on that same array, and only after `bookMeeting` returns an id. A throw from `bookMeeting` is rethrown and does not add. Claim 38 already said a refused response does not give the caller an id. This claim does not retune the `StoredMeeting` that function builds. The purpose, the pathway sentence, the observation, and the two painted facts stay. The fact paint and the booking push are not two lists.

**Who reads it.** `useMeetings` is what `src/app/register/prototype/MeetingsModule.tsx` renders, and what `src/app/register/prototype/ConsultantPrototypeScene.tsx` uses for the today chips and the meeting-ready ids. Those modules are the plant. `src/app/register/prototype-ant/consultant/MeetingsModule.tsx` loads `listMeetings` and does not call `useMeetings`. The brief on that module comes from `hydrateFactsFromMachine`, which lists `fact_writebacks`. The mapped meeting row does not set `facts`. `src/app/register/prototype-ant/consultant/meetingsData.ts` snapshots `getMeetings()` at import. No other file under `src/` imports it. A paint of this array does not appear on the product-face Meetings list. `LiveBriefPanel` hydrates the same way, and `mergeFactsPreferMachine` keeps snapshot labels the machine list does not have. A refused label put on the snapshot is a label that survives that hydrate.

**What a throw paints today.** `factsToApply` starts as `input.facts`. The `writeFact` loop is inside the try. `wireFetch` throws when the response is not ok. That response is the withhold in claims 30 and 32. The catch skips `listFactWritebacks`. `applyFactsToMeetingsStore` still runs with the submitted facts. The three submits in `ContactPrototypeScene` use `DEMO_CONTACT_ID`, which is `sarah`, so they match `m1`. Nudge form posts source `Nudge form`. Loop-closer form posts source `Loop-closer form`. Update facts posts source `Update facts`. A refused loop still rewrites `sarah`’s facts, stamps `asOf`, and appends the refresh sentence. A client id with no row takes the `m-facts-` insert. That id is not a `meeting_booked` id. `selectConsultantTodayMeetings` keeps status Upcoming, so the invented row is not a today chip. `selectMeetingReadyClientIds` keeps phase Meeting-ready, so it is not that set. It is still a row on the plant Meetings list. The three live callers hit `m1`. The insert is still the function.

**Why a throw does not paint.** `docs/register/how/consultant-core.md`, `docs/register/how/consultant-access.md`, `docs/register/how/contact-book.md`, and `docs/register/how/contact-refresh.md` say Live brief reads the contact’s write-back. Claim 30 says a rejected `writeFact` is no machine result. The observation string says the write-back refreshed. A refused post did not. The product-face list never shows the refused label, because it does not read this array and because the row was not inserted. The plant brief would, through the snapshot merge. The booking caller on this same array already waits for an id. The fact caller waits for `writeFact` to return.

**A fact does not add a meeting.** Leaf 1.1 of `docs/register/how/contact-book.md` writes the meeting on Confirm booking. Claims 37 and 38 are that insert. The invented row’s overview says the source wrote facts before booking, and the function then adds a meeting. A stored fact is `fact_writebacks`. When the loop returns and no local row has that `clientId`, the helper does not add one. The stored facts stay on the table. `hydrateFactsFromMachine` still reads them when a meeting for that contact is open. The product face already does that read off `listMeetings`.

**A throw after an earlier success.** The loop posts one fact at a time. A later throw means an earlier call may have stored. The list call sits after the loop, inside the same try, so the catch does not have the partial set. This claim does not paint `input.facts` from that catch. That array includes the call that threw. The stored earlier rows stay in `fact_writebacks`. The next hydrate reads them. The local observation does not say the batch refreshed. This claim does not add a second list call inside the catch.

**The signal and the seeds.** Loop-closer still passes `signalMissingFieldKey` `validity_still_valid` after the loop, including when the loop threw. Claim 35 refuses that key. The helper still calls. The paint is not that insert. This claim does not delete `SEED_MEETINGS` and does not make the product-face module read the array. The three rows are the plant’s starting list. A refused submit does not replace `sarah`’s facts. A loop that returned may replace matching labels on that row. Unmatched seed labels stay, because the apply keeps them. Stripping the seed is not this withhold.

**Rejected alternatives.**

- Keep painting `input.facts` when `writeFact` throws, because the catch comment says the UI store still updates. The comment is the behavior this claim stops. The update would record a write-back the handler refused. The product face already shows the query. The plant brief’s hydrate does too, except the snapshot merge keeps a label the query does not have.

- List write-backs inside the catch, so a partial success shows and the thrown fact does not. The list call is inside the try that just failed. A failed batch does not get the refresh sentence. The stored rows are still listed when the brief opens.

- `addMeeting` when the contact has no local row, so facts submitted before a booking have a card. The card is a meeting on the plant list. Claims 37 and 38 already say which post stores a meeting. A fact is not that post. The product face does not show the card.

- Treat the array as `meeting_booked` and withhold that table again. The table is claims 37 and 38. `confirmContactBooking` already adds only after an id. This claim does not change `handleMeetingBook` and does not change `handleContactSeatMeeting`.

- Delete `SEED_MEETINGS` so the plant list is empty until a book returns an id. The product-face module already lists `meeting_booked`. Emptying the plant array is not what makes a refused fact absent. The refused submit is absent because the apply does not run.

- Stop `signalMissingFact` in the same catch. Claims 34 and 35 left that call. Claim 35 refuses `validity_still_valid` on the route. The paint is not the signal.

- Mint a Manage table so document-dependent asks have a desk instead of this list. No `CREATE TABLE` under `supabase/` is that desk. This list is not that desk. This claim does not name one.

No founder question. A write-back the machine stored, and a label painted after the machine refused, are different briefs. The leaves already say the brief reads the write-back. The booking caller already waits for an id on this same array. A fact waits for `writeFact` to return, and it does not add a meeting.

**What this leaves.** `eventKindProse` returns `Sent` for every kind that contains `send`, so `send_denied` and `send_dry_run` read as `Sent` on the operator activity column. `titleFor` has no `send_denied` case. Claim 21 already names that default, the kind with underscores turned into spaces, as the complaint-desk title. The operator column was not retuned. It is the next reader.

**Evidence:** `src/app/register/prototype/shared/meetingsStore.ts` `SEED_MEETINGS`, `applyFactsToMeetingsStore`, `writeBackContactFacts`, `confirmContactBooking`, `mergeFactsPreferMachine`, `hydrateFactsFromMachine`, `selectConsultantTodayMeetings`, `selectMeetingReadyClientIds`. `src/app/register/prototype/ContactPrototypeScene.tsx` the three `writeBackContactFacts` calls, `DEMO_CONTACT_ID`, `confirmBooking`. `src/app/register/prototype/MeetingsModule.tsx`. `src/app/register/prototype/ConsultantPrototypeScene.tsx`. `src/app/register/prototype/LiveBriefPanel.tsx`. `src/app/register/prototype-ant/consultant/MeetingsModule.tsx` `listMeetings`. `src/app/register/prototype-ant/consultant/meetingsData.ts`. `src/app/wire/http.ts` `wireFetch`. `src/app/wire/reals/machineApi.ts` `writeFact`, `listFactWritebacks`, `listMeetings`. `docs/register/how/consultant-core.md`. `docs/register/how/consultant-access.md`. `docs/register/how/contact-book.md` leaf 1.1. `docs/register/how/contact-refresh.md`. `docs/register/DATA-IN-TABLES.md`. Claims 30, 32, 34, 35, 37, and 38.

**Live.** The catch still calls `applyFactsToMeetingsStore` with the submitted facts. A client with no local row and a non-empty fact list still gets `m-facts-` plus that id. `confirmContactBooking` still adds only after an id. The product-face module still lists `meeting_booked` and does not subscribe to the array. No migration was written.

### Revision — claim 40

The sentence that `eventKindProse` returns `Sent` for a kind that contains `send`, and that the operator column was not retuned, stands as the gap. Claim 40 decides that column. The local meetings paint is unchanged. `titleFor` is not given a new case. `kindOf` and the Activity tags stay as claim 21 left them.

---

## Claim 40 — A denied send does not read as Sent on the operator activity column

**Standing:** necessary implication of claim 21, and a technical decision made in this session.

`eventKindProse` does not return `Sent` for `send_denied` or for `send_dry_run`. Those two kinds do not enter the arm that tests `includes("send")` or equality with `sent`. They do not match the later arms, which test `open`, `click`, `deliver`, `nullif`, `halt`, `window`, `escalat`, `fail`, `answer`, and `complete`. The function’s last line is their prose. Underscores become spaces, so the column reads `send denied` and `send dry run`. `send_live` and the exact kind `sent` still return `Sent`. This claim does not add a case to `titleFor`. Claim 21 already names that function’s default, the kind with underscores turned into spaces, as the complaint-desk title of an uncased kind. `kindOf` still has no `send_denied` case, so that kind stays `other`. `outcomeFrom` therefore still has an empty outcome line for it. `signalsFrom` and the Activity Sent and Delivered tags stay a reading of attempt state. Claim 21 left those. This claim does not retune them.

**The column.** The activity tab in `src/app/register/prototype-ant/operator/AntAgentWorkbench.tsx` renders `engagement_records` from `listEngagementRecords`. The column title is What happened. The cell is `eventKindProse(row.event_kind)`. The search haystack includes that prose. The channel is a separate column, `channelFromPayload`. This is the operator Agents surface on the product face. The consultant chronology is `titleFor` in `src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts`. That function is not this column. Its default for `send_denied` is already `send denied`. Its case for `send_dry_run` is `Send · {channel} (dry-run)`. Its case for `send_live` is `Send · {channel} (live)`.

**Why those two leave the send arm.** Claim 21 splits one dispatcher result into three kinds. `send_live` is the provider accept. `send_dry_run` is the fail-closed stage, `ok: true`. `send_denied` is `ok: false`. The same claim refused to rename the denial so that it would avoid the substring `send`, and it left this helper unretuned. The live helper returns `Sent` for every kind that contains `send`, and that test sits before the `fail` test. `send_denied` contains `send`. `send_dry_run` contains `send`. `send_live` contains `send`. The column then calls a refusal a send, and it calls a staged dry run a send. The complaint desk does not. The operator column has no channel inside the prose. The spaced kind is the line the function already uses for a kind it does not recognize. Using it does not invent a fourth label. A search for the word sent no longer matches those two rows. A search for the spaced kind does.

**What stays Sent.** A row whose kind is `send_live` went out. A row whose kind is `sent` is the exact word that arm already returns. Those stay `Sent`. Kinds that do not contain `send` are unchanged.

**Rejected alternatives.**

- Return `Sent` for `send_denied` because claim 21 said the helper was not retuned. That sentence is the gap. The rejected alternative in claim 21 was renaming the kind to dodge the substring. The kind stays `send_denied`. The column is the reader that still treats the substring as a send. Claim 21 already says a refusal and a message that went out are different files.

- Return `Failed` for `send_denied`, by folding `denied` into the `fail` arm. `Failed` is the arm for a kind that contains `fail`. A policy deny, a halt deny, a silence deny, and a throughput deny are one kind because the writers do not read `detail`. `Failed` would be a second file. The spaced kind is the file the complaint desk already uses.

- Add a `titleFor` case so the chronology says `Send denied` or `Send · {channel} (denied)`. Claim 21 already specified the default. The chronology title of an uncased `send_denied` is `send denied`. The operator column is the reader that said `Sent`.

- Bucket `send_denied` as `send` inside `kindOf`, so the outcome line and the Sent tag follow the kind. Claim 21 left `kindOf` as `other` and left the tags on attempt state. A denial lighting Sent from the kind would be the collapse this column just lost.

- Return `Sent` for `send_dry_run` because the worker staged the message. `docs/register/system-map/ACTUATION-REPORT.md` and claim 21 call that result a dry run, `ok: true`, not the provider accept. The complaint desk already titles it as a dry run. The operator column saying `Sent` puts the stage in the same cell as `send_live`. The spaced kind keeps them apart. The channel column still says the channel.

No founder question. The three results are already three kinds. The operator column is a reader of the kind. `Sent` stays the result that went out. The other two use the function’s own leftover line.

**What this leaves.** `standInConsentSilence` is still one slot per `contactId`. `get` still does not take a firm. `setConsent` and `silence` still store `firmId` on that slot and replace the previous firm. `setConsent` still keeps the previous boolean. `silence` still keeps the previous basis and sets the boolean true. `standInContactSeat.consent` still keeps the previous boolean, while the server seat statement clears it. Claims 29 through 40 do not retune that map. `SYSTEMS-GOAL` still asks whether launch day is only for contacts who were waitlisted, and it still says not to fill that ask. Nothing writes `waitlisted`. Claim 27 already says the sign-up drawing is not a dispatch and not a status write. `advanceEnrollmentCampaign` is not a writer of `consent_records`. That absence is not a second formula.

**Evidence:** `src/app/register/prototype-ant/operator/channelRuleGrain.ts` `eventKindProse`. `src/app/register/prototype-ant/operator/AntAgentWorkbench.tsx` the activity table, `listEngagementRecords`, the What happened column. `src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts` `kindOf`, `titleFor`, `outcomeFrom`, `signalsFrom`. `server/wire-service/cascade.ts` the `send_live`, `send_dry_run` writers. `docs/register/system-map/ACTUATION-REPORT.md` the fail-closed dry run. Claims 21 and 22.

**Live.** `eventKindProse` still returns `Sent` when the kind contains `send`, so `send_denied` and `send_dry_run` still read as `Sent`. `titleFor` still has no `send_denied` case, and its default still spaces the kind. `kindOf` still returns `other` for `send_denied`. No migration was written.

### Revision — claim 41

The sentence that `standInConsentSilence` is one slot per contact, and that `standInContactSeat.consent` keeps the previous boolean, stands as the live maps. Claim 41 specifies both. `get` still does not take a firm. The operator column is unchanged.

### Revision — claim 42

The hard-bounce upsert and `handleContactSeatSilence` still omit `status`. Claim 42 specifies that omission. This column is unchanged.

---

## Claim 41 — The one-slot consent map is the consent routes, and the seat mirror’s Agree clears the boolean

**Standing:** technical decision made in this session.

`standInConsentSilence` and `standInContactSeat` are two maps. They do not share a slot, and they do not share a boolean rule. The one-slot map is the stand-in of `POST /consent` and `POST /consent/silence`, collapsed onto `contactId`. It is not the pair `(contact_id, firm_id)`, and it is not the seat. `standInContactSeat.consent` and `consentContact` set `silenced` false. That is the seat statement claim 26 already specified. Keeping the previous boolean on those two functions is not a second Agree.

**The consent map.** `byContact` in `src/app/wire/standins/consentSilence.ts` is `Map<string, { firmId, basis, silenced }>`. The key is `contactId`. `setConsent` stores the call’s `firmId` and `basis`, and sets `silenced` to the previous boolean, or false when the slot is new. `silence` stores the call’s `firmId`, keeps the previous `basis`, or `none` when the slot is new, and sets `silenced` true. The `source` argument is unused. `get` takes the contact id and returns `basis` and `silenced`, or `none` and false. It does not take a firm and does not return `source` or `firmId`. A second firm’s `setConsent` or `silence` replaces the slot. The table keeps both pairs. This map cannot.

That boolean is the consent routes, not the seat. `handleConsentSet` inserts `silenced` false and, on conflict, does not assign `silenced`. `setConsent` is that keep. Claim 26 already said this function is not the product-face Agree. `handleConsentSilence` inserts `basis` `none` and `silenced` true and, on conflict, sets `silenced` true and does not assign `basis`. `silence` is that keep. Claim 25 is that route’s `status`. This claim does not assign `status` on the map. The row has no `status` and no `source`. `get` would not return a stored source. The send stand-in and the sms stand-in do not read one. This claim does not add the field.

`get` stays without a firm. Claim 24 already specified `GET /consent/:contactId` as one row for the contact id because no caller of that route is acting as a firm. `ConsentSilencePort.get` is typed `get(contactId)`. `realConsentSilence.get` requests that path and passes no firm. The stand-in `get` is that route when the wire is off. Adding a firm argument would invent the caller claim 24 refused. A pair key under a firm-less `get` would still have to choose a slot. The send that needs the pair is `consentAndHaltGate`, claim 23, which does not read this map.

**Who reads and writes the slot.** `standInSendGate.collectReasons` calls `get` only when `contactId` is set and `purpose` is `cem`, `opt-in`, `nudge`, or `reactivation`. `silenced` true pushes `silence`. `basis` `none` pushes `consent` unless `purpose` is `opt-in`. `chips` calls `collectReasons` with firm, channel `email`, purpose `cem`, and posture `Active`, and with no contact, so that arm does not run. `FirmOperationsBindModule` and `FirmOperationsBindPanel` call `decide` with `firmId`, `channel`, `purpose`, and `posture`, and they do not pass `contactId`. `registry.ts` sets `sendGate` to `standInSendGate` even when `consentSilence` is `realConsentSilence`. Those calls do not read `consent_records`, and they do not read a slot the real writer fills. `standInSmsApi.send` calls `get` when `contactId` is set. `silenced` true returns deny `STOP`. `basis` `none` returns deny `consent`. The input has no `purpose`, so there is no opt-in exemption on that function. When the wire is real, `smsApi` is `realSmsApi`, which posts `/send/sms`. That post is claim 23’s gate, which exempts `purpose` `opt-in`. This claim does not add a purpose to the stand-in. A contactless stand-in send does not call `get`. `listUnsubscribe.accept` and `espMailer.injectEvent` on `bounce_hard` call `silence`. Nothing in `src/` calls `accept`. No handler under `server/` writes a list-unsubscribe. The bounce stand-in writes this map only when `espMailer` is the stand-in. `contactSeatMirror.ts` does not import this module.

**The seat mirror.** `consent` in `contactSeatMirror.ts` is a different `Map`, keyed by `contactId`, holding `basis`, `silenced`, `source`, and `workspaceOptedOut`. The header says the stand-in mirrors the seat. The six seeded slots that exist are `silenced` false. `cr-harbor-2` and `cr-cedar-3` have no slot. No function in that file sets `silenced` true. `consent` and `consentContact` currently copy `prev?.silenced ?? false`. `handleContactSeatConsent` sets `silenced` false on the insert and on the conflict. Claim 26 is that statement. The product-face Agree posts the seat routes. When the wire is off, `standInMachineApi` calls `consent` and `consentContact`. Those two functions set `silenced` false. `basis` and `source` stay the action’s values: Agree is `express` and `contact_workspace`, Ignore is `none` and `ignored`. `workspaceOptedOut` stays the previous value, or false when the slot is new. The server seat consent does not assign `workspace_opted_out`. This claim does not assign it either. A slot that was silenced becomes not silenced, and the payload’s `silenced` flag follows `project`. The seeds do not show the split, because none of them are silenced and nothing in the file sets the boolean. The write is still the seat statement. A slot that arrives silenced does not survive Agree.

`silence` and `silenceContact` stay `markWorkspaceOut`. They set `workspaceOptedOut` true, keep `basis`, and keep `silenced`. That is `handleContactSeatSilence`’s conflict, which sets `workspace_opted_out` and does not assign `silenced` or `basis`. The server insert of a new pair sets `basis` `none` and `silenced` false. The mirror’s new slot uses those same defaults. This claim does not retune that function. Workspace-out is not email silence. The file already says that. Claim 42 is the `status` those statements omit.

**Rejected alternatives.**

- Key `byContact` by `contactId` and `firmId` so the stand-in keeps both pairs. `get` cannot name a firm. Claim 24 refused to add a firm to the route. The port matches that route. The bind screen does not pass a contact. Claim 23 already refused to let this map choose the send’s select. A second firm replacing the slot is the stand-in’s limit. It is not a product rule that one contact has one consent across firms.

- Clear `silenced` on `setConsent` so the register scene’s Agree matches the seat. `setConsent` is `POST /consent`. Claim 26 left that conflict as the basis write that does not assign `silenced`. `ContactPrototypeScene.applyConsent` calls it with `express`. It does not post the seat. Clearing the boolean here would lift a silence the server conflict keeps.

- Leave `consent` and `consentContact` copying the previous boolean because no seed is silenced. The live copy is the discrepancy claim 26 named and claims 28 and 29 left inside their own scope. The mirror is the seat when the wire is off. The server Agree already clears the boolean. A kept true would leave `project` reporting `silenced` after Agree. The empty seed is not a second Agree.

- Have the seat mirror write `standInConsentSilence`, or have `standInSendGate` read the seat slot, so one boolean governs both. Claim 38 already refused to merge them for the meeting post. The send stand-in reads the consent map. The seat projection reads the seat slot. A register silence of `sarah` would change `cr-harbor-1`, or a seat Agree would clear the sms stand-in’s `STOP`. The product already keeps those writes on different statements.

- Add an opt-in exemption to `standInSmsApi`, or store `source` on the consent map, in order to finish the boolean. The sms input has no purpose. The product exemption is claim 23. The map’s `get` does not return `source`. Neither change decides whether Agree clears `silenced`.

No founder question. The pair stays the table. The firm-less get stays the route whose caller is not a firm. The consent map’s keep is `POST /consent` and `POST /consent/silence`. The seat mirror’s Agree is the clear claim 26 already chose. The two maps stay two maps.

**What this leaves.** `runContactEligibilityCascade`, when `dispatchEventToWorkflows` returns no workflows, calls `enrollAndActuate` without `fireFirstStep`. Inside that function a missing flag still enters the first-step branch, because the test is `!== false`. That call does not read `consent_records`. Claim 31 does not block it. The enroll was not specified. `listUnsubscribe.accept` still has no caller, and no server handler writes the pair from a list-unsubscribe. The leaf names that control. This claim does not add a route. `SYSTEMS-GOAL` still asks whether launch day is only for contacts who were waitlisted, and it still says not to fill that ask. Nothing writes `waitlisted`.

**Evidence:** `src/app/wire/standins/consentSilence.ts` `setConsent`, `silence`, `get`. `src/app/wire/ports.ts` `ConsentSilencePort`. `src/app/wire/reals/consentSilence.ts`. `src/app/wire/registry.ts` `sendGate`, `consentSilence`, `smsApi`, `listUnsubscribe`. `src/app/wire/standins/sendGate.ts` `collectReasons`, `chips`. `src/app/wire/standins/smsApi.ts` `send`. `src/app/wire/standins/listUnsubscribe.ts` `accept`. `src/app/wire/standins/espMailer.ts` the `bounce_hard` call. `src/app/wire/standins/contactSeatMirror.ts` the consent `Map`, `consent`, `consentContact`, `markWorkspaceOut`. `src/app/wire/standins/machineApi.ts` `consentContact`, `consent`. `src/app/register/prototype-ant/operator/FirmOperationsBindModule.tsx` the `decide` calls. `src/app/register/prototype/operator/FirmOperationsBindPanel.tsx` the `decide` calls. `src/app/register/prototype/ContactPrototypeScene.tsx` `applyConsent`. `stores.ts` `handleConsentSet`, `handleConsentSilence`. `contactSeat.ts` `handleContactSeatConsent`. Claims 23, 24, 25, 26, and 38.

**Live.** `setConsent` still keeps the previous boolean. `silence` still keeps the previous basis and sets the boolean true, and it still ignores `source`. `get` still does not take a firm. `standInContactSeat.consent` and `consentContact` still copy `prev?.silenced`. The server seat statement still sets `silenced` false. No migration was written.

### Revision — claim 49

The sentence that `listUnsubscribe.accept` has no caller, and that this claim does not add a route, stands as the gap. Claim 49 is that commit. It uses the silence statement this claim already kept as `POST /consent/silence`, with source `list-unsubscribe`. The stand-in map is still not that row.

---

## Claim 42 — The hard bounce and the workspace opt-out do not assign `status`

**Standing:** necessary implication of claim 25, and a technical decision made in this session.

The hard-bounce upsert and `handleContactSeatSilence` do not assign `consent_records.status`. An insert keeps the column default `unsequenced`. A conflict keeps the `status` the row already held. Claim 25 is the silence route. These are the other two statements that claim left unnamed. This claim does not assign `status` on `handleConsentSilence`, does not dispatch `consent_records.opt_out` from either statement, and does not set `silenced` true on the workspace opt-out.

**The bounce.** When `eventClass` is `bounce_hard` and the outbound row supplied a `contact_id`, `webhooks.ts` upserts `consent_records` for that contact and that row’s `firm_id`. The insert lists `contact_id`, `firm_id`, `basis` `none`, `silenced` true, `source` `hard-bounce`, and `updated_at`. The conflict sets `silenced` true, `source` `hard-bounce`, and `updated_at`. Neither clause names `status`, `basis` on the conflict, or `workspace_opted_out`. `outbound_messages.firm_id` is `TEXT NOT NULL`. `contact_id` on that table is nullable. The consent statement runs only when `contactId` is set. The `?? "unknown"` firm is the miss of the outbound row, and that same miss leaves `contactId` unset, so the consent statement does not run. The pair this upsert writes is the outbound message’s firm and contact. It does not call `dispatchEventToWorkflows`. Claim 15 already left this write off the opt-out firing. A conflict can leave `basis` `express` or `implied` with `silenced` true. Claim 31 already reads that row as a fact the opt-in still allows. Claim 23’s boolean arm denies the send. Assigning `status` `silenced` would replace a `sequenced` or `waitlisted` value this call did not come to change. Claim 25 refused that assignment on the silence route, because the boolean already denies and no reader treats `unsequenced` as the silence. The bounce is that same boolean. The default and the previous `status` stand.

**The workspace opt-out.** `handleContactSeatSilence` inserts `basis` `none`, `silenced` false, `source` `contact_workspace.workspace_opt_out`, and `workspace_opted_out` true. The conflict sets `workspace_opted_out` true and `updated_at`. It does not assign `basis`, `silenced`, `source`, or `status`. It does not dispatch. The handler returns the workspace-out refuse. `supabase/migrations/020_workspace_opt_out.sql` says the flag is a field, not email silence. `isWorkspaceOut` reads the flag for the pair. `consentAndHaltGate` reads `basis`, `silenced`, and `status`. It does not read the flag. Claim 15 left this call off the opt-out firing. Claim 37 already said the seat Opt out control is this statement and is not the `silenced` boolean. Assigning `status` `silenced` would make claim 23’s status arm deny a row whose boolean this insert set false, or whose boolean this conflict did not set. That would turn the flag into the silence word migration 020 separated. Leaving `status` does not change the refuse, and it does not open a send the boolean had already closed. A previous `sequenced` or `waitlisted` stays, which is the non-write claim 25 and claim 26 already kept for a statement that does not own those rungs.

**The mirrors.** `espMailer.injectEvent` on `bounce_hard` calls `standInConsentSilence.silence`. Claim 41 keeps that as the previous basis and `silenced` true. It does not set `workspaceOptedOut`. `markWorkspaceOut` sets the seat flag and does not call the consent map. The two stand-ins stay the two statements. This claim does not add `status` to either map.

**Rejected alternatives.**

- Assign `status` `silenced` on the bounce insert and on the bounce conflict, because `silenced` is true. That is the assignment claim 25 refused for the silence route. The boolean arm already denies. The conflict’s previous `basis` is why claim 31 still allows the fact. The status word is not that fact and it is not that deny.

- Assign `status` `silenced` on the workspace opt-out so the seat Opt out stops sends. The send does not read the flag. The flag’s migration says it is not email silence. Claim 37 already kept this control off the `silenced` boolean. A status word of `silenced` would deny through the arm that reads the word, including an opt-in purpose, on a row this insert stored as `silenced` false. That is a second silence. This claim does not add it.

- Set `silenced` true on the seat conflict so Opt out matches the silence leaf’s button. Claim 15, claim 37, and migration 020 already split the flag from the boolean. This claim is the `status` column. It does not recut that split.

- Dispatch `consent_records.opt_out` from the bounce or from the seat opt-out so a listener sees the row. Claim 15 left both off that firing. The bounce updates the pair the gate re-reads. The seat call updates the flag `isWorkspaceOut` reads. Neither becomes the dispatch by omitting `status`.

- Retune the `?? "unknown"` firm. The consent insert does not run on the miss that produces that fallback, because `contactId` is unset with it. `firm_id` on `outbound_messages` is not null. The pair that is written already has a firm.

No founder question. The boolean already denies the bounce. The flag already closes the workspace. `status` `unsequenced` is not either of those reads. Writing `silenced` into the column would replace a rung these statements do not own, or would make the workspace flag into the send’s silence word. The omission is the specification.

**What this leaves.** `runContactEligibilityCascade`, when no workflow is dispatched, still calls `enrollAndActuate` without `fireFirstStep`, and that function still treats a missing flag as the first step. The call does not read `consent_records`. A silenced contact is not withheld there. Claim 31 does not block the enroll. It was not specified. Nothing writes `waitlisted`. The launch-day audience ask in `SYSTEMS-GOAL` stays the ask that file said not to fill.

**Evidence:** `webhooks.ts` the `bounce_hard` upsert, the outbound lookup. `contactSeat.ts` `handleContactSeatSilence`, `isWorkspaceOut`. `supabase/migrations/003_ct_wire_stores.sql` `outbound_messages.firm_id`. `supabase/migrations/004_machine_tables.sql` the `status` default. `supabase/migrations/020_workspace_opt_out.sql`. `dispatchSend.ts` `consentAndHaltGate`. `src/app/wire/standins/espMailer.ts` the `bounce_hard` call. `src/app/wire/standins/contactSeatMirror.ts` `markWorkspaceOut`. `machine.ts` `runContactEligibilityCascade` the `dispatched.length === 0` loop. `cascade.ts` `enrollAndActuate` the `fireFirstStep !== false` branch. Claims 15, 23, 25, 31, and 37.

**Live.** The bounce conflict still sets `silenced` and `source` and still omits `status`. The seat silence conflict still sets `workspace_opted_out` and still omits `status`. Neither dispatches. No migration was written.

### Revision — claim 43

The sentence that the no-workflow enroll was not specified stands as the gap. Claim 43 specifies it. Nothing in that claim writes `waitlisted`. The launch-day audience ask in `SYSTEMS-GOAL` stays the ask that file said not to fill.

---

## Claim 43 — When no workflow is active, reactivation enrolls only a contact the non-opt-in send would allow

**Standing:** necessary implication of the silence leaf and of claim 23, and a technical decision made in this session.

When `dispatchEventToWorkflows` returns no workflow for `eligibility.changed`, `runContactEligibilityCascade` enrolls reactivation for a contact only when the `consent_records` row for that contact and for `opts.firm` would allow a send whose purpose is not `opt-in`. A missing row, `basis` `none`, `silenced` true, or `status` `silenced` does not enroll. A row with `basis` `express` or `implied`, `silenced` false, and `status` other than `silenced` does enroll, and the first step runs. Those rows are not elements of this firing’s `writes`. Claim 12 stands. Claim 2 still allows a second enrollment when the call is made. This claim does not assign `status`, does not set `silenced`, and does not read `workspace_opted_out`.

**When the loop runs.** The dispatch loads triggers with `t.enabled` true, `t.type` `event`, `t.event_name` `eligibility.changed`, `s.status` `active`, and `t.firm_id` the firing firm or null. `wf-eligibility-reactivation` is seeded with `workflow_state` `draft`, so that graph does not make `dispatched.length` greater than zero. The fallback is the path a seeded firm takes. An active workflow that matches is a listening run. The loop does not run, even when that run’s If enrolls nobody. The seed branch “Reactivation-worthy?” has no compares. `evalIfPick` then returns false, and `outgoingHandle` follows `sourceHandle` `false`. The seed edge from that branch has no `sourceHandle`, so the action does not run. Activating that graph stops this fallback and does not itself enroll. This claim does not give that branch a pick.

The quartet is already inserted, for every contact in `opts.contactIds`, before the dispatch. A contact this loop skips still has that evaluation, result, signal, and motion. Claim 31’s fact insert, its signal changes, its `fact_writebacks` dispatch, and its `onCompletionWrite` still run. The withhold is the enroll after an empty dispatch. An empty `opts.contactIds` enrolls nobody. The loop does not dedupe. A repeated id that passes the pair is two enrollments. Claim 2 already allows that. This claim does not add a one-motion refusal.

**The pair.** The read is claim 23’s select: `basis`, `silenced`, and `status` where `contact_id` is the contact and `firm_id` is `opts.firm`. Another firm’s row is not this row. The arms are the arms that function already uses when `purpose` is not `opt-in`. `silenced` true or `status` `silenced` denies, including a prior `express` or `implied`. A missing row or `basis` `none` denies. Those are the contacts this loop does not pass to `enrollAndActuate`. The cascade entry is `{ contactId, blocked: "consent", fallback: true }`. There is no `enrollmentId`, no `active_attempts` row, and no `engagement_records` row. Halt is not consulted for that contact, because the call is not made. A contact who is both silenced and firm-halted still gets no enrollment. The label on the response is `consent`.

**The enroll that is allowed.** The agent and the sequence are the template `resolveAgentRef` already returns for sequence class `reactivation`: `firm_sequence_binding.template_id` for `opts.firm` and that class, `is_default` first, then `created_at`, or `tpl.reactivation.v1` when the firm has no row. `call_agent` resolves that way before it enrolls. `scripts/verify-machine-e2e.ts` stores the reference-cascade enrollment under that same lookup. The payload stays `{ faceless: true, fallback: true, trigger: opts.triggerKind }`. The purpose stays the string `reactivation`. `fireFirstStep` stays omitted. Inside `enrollAndActuate` the test is `!== false`, so the first step runs. `isHaltBlockingNew` still returns before the insert. The cascade entry is then `{ contactId, blocked: "halt", fallback: true }`. Past that check the function inserts `enrollment` and an open `active_attempts` row, then `actuateChannelSend` with that purpose and the owner channel the function already chooses. An allowed result is claim 22’s `send_live` or `send_dry_run`. A deny the gate returns after the insert, including a halt or a silence written between the two reads, is claim 22’s `send_denied`. The return’s `dryRun` stays `!shouldLiveSend`. The cascade entry for an enroll that inserted is `{ contactId, enrollmentId, fallback: true }`. That object is the HTTP cascade. It is not a dispatch, and it is not `payload.writes`.

**Why the insert is the motion.** `docs/register/how/contact-silence.md` says the silenced state is read by engagement runners, send gates, and book readiness, and that the contact is not sequence-ready for new automatic motion. `docs/register/how/operator-book-readiness.md` says enrollment is the autonomous entry into engagement, and that silenced contacts are excluded from automatic motion. `docs/register/SYSTEMS-STORY.md` §6 says consent state gates Engagement. This purpose is `reactivation`, not `opt-in`, so claim 23’s exemption does not apply. A missing basis is the same deny as silence. Leaving the insert and relying on the later deny would open an attempt. Claim 20’s tick would keep sending, and each deny would be another row. That is new automatic motion after the pair has already refused the send. The withhold is the same predicate, applied before the call, so the attempt does not start. Claim 22 remains the record of a first step that does run. This caller does not run it for a pair the gate would deny.

**The mirror.** `standInMachineApi.upsertReference` has no workflow dispatch. It is this no-workflow path. It still pushes the eligibility result, the signal, and the motion for each contact. It pushes the enrollment only when `standInConsentSilence.get` returns `basis` `express` or `implied` and `silenced` false. A missing slot is `none` and false, and that slot does not enroll. The map has no `status`. This claim does not add one. The function does not read the seat mirror. It does not actuate a channel. This claim does not add a first-step send to it. The agent on that row stays `tpl.reactivation.v1`, the unbound default. The server lookup is `resolveAgentRef`.

**Rejected alternatives.**

- Put `enrollment`, `active_attempts`, or `engagement_records` on this firing’s `writes`. Claim 12 already refused that. The write-set names the four eligibility tables. These rows exist only when no workflow fired, so there is no listening run to hand them to. The HTTP cascade object is the response. It is not the dispatch argument.

- Enroll every contact and let claim 23 deny the first step. That is the live call. The send does not go out. The enrollment and the open attempt do. Book readiness treats that entry as the motion. The silence leaf says the contact is not sequence-ready for a new one. Claim 20 then keeps the attempt sending. The chronology of those denies is claim 22, which is the record of a step that ran. The step this pair refuses does not run.

- Withhold only `silenced` true, and still enroll a missing row or `basis` `none`. The purpose is not `opt-in`. Claim 23 denies that send for a missing basis. Story §6 gates Engagement on consent, and the opt-in phase is the purpose this call did not use. An open reactivation for a contact who has not opted in is the motion the non-opt-in arm already refuses. The two denies are one predicate.

- Put the withhold inside `enrollAndActuate` for every caller. `handleOnboardingFire` and an opt-in `call_agent` pass purpose `opt-in`. Claim 23 allows that send with no prior basis. A shared insert-block would stop the opt-in phase. The withhold is this loop, whose purpose is `reactivation`. The other callers stay claim 22’s park.

- Use `sequence_ready.ready` as the list. Book readiness says only sequence-ready contacts enter engagement, and `executeAuditRun` sets `ready` from email and phone and does not read `consent_records`. A ready contact with `basis` `none` would still be a reactivation the non-opt-in arm denies. An opted-in contact the fact just stored, who was never audited, would be skipped. The cascade’s list is `opts.contactIds`. The pair is the gate on that list. This claim does not derive `ready`.

- Pass `fireFirstStep: false` so the row exists and nothing sends. Seed §5.3 names reactivation armed as a ghost template with nothing sending, and active as the sequence executing. This function does not write an armed flag. The omitted flag is the first step. `docs/register/system-map/END-TO-END-REPORT.md` names the reference edit’s result as the enrollment. The branch that runs is the send. An armed row with no attempt would be a second state.

- Keep the platform id `tpl.reactivation.v1` when the firm has bound another reactivation template. `firm_sequence_binding` holds the firm’s template for the class. `call_agent` and the e2e reference enrollment already resolve it. The live fallback passes the platform id for both arguments. `resolveBoundTemplate` then matches a binding only when `template_id` equals that id, so a firm copy is not the sequence the no-workflow path starts. The class lookup is the one the active graph’s action already uses. The unbound firm still gets `tpl.reactivation.v1`.

- Treat `workspace_opted_out` as this withhold. Claim 42 keeps that flag off the send. The seat Opt out does not set `silenced` true. This loop reads the same columns the non-opt-in send reads.

- Copy this withhold onto `handleOnboardingFire`. That loop’s purpose is `opt-in`, and its list is `sequence_ready` where `ready` is true. The missing-basis arm does not deny that purpose. Whether silence stops that insert is still claim 22’s park. This claim does not decide it.

No founder question. A stored eligibility quartet and a reactivation enrollment are different writes. The quartet is claim 12, and it still happens. The enrollment is new automatic motion, and the pair that would deny the reactivation send is the pair that does not start it. The firm’s bound reactivation template is the sequence. The first step of an enroll that starts is the send claim 22 already records. Another firm’s consent does not decide it. The operator does not get a second pursuit from a contact the send would have refused, and a contact the send would allow can still hold more than one pursuit, which claim 2 already settled.

**What this leaves.** `handleOnboardingFire`, when `audit.completed` fires no workflow, still calls `enrollAndActuate` with purpose `opt-in` and with `fireFirstStep` omitted, for each `sequence_ready` row with `ready` true. The first step still runs. Claim 43’s missing-basis withhold does not apply to that purpose. Whether silence stops that insert was not decided. The response still counts `liveSends` from `!result.dryRun` and does not read `result.send`. `listUnsubscribe.accept` still has no caller. The launch-day audience ask stays unfilled. The seed branch still has no pick.

**Evidence:** `machine.ts` `runContactEligibilityCascade` the `dispatched.length === 0` loop, `handleOnboardingFire`. `cascade.ts` `enrollAndActuate` the halt return and the `fireFirstStep !== false` branch, `actuateChannelSend`. `dispatchSend.ts` `consentAndHaltGate` the non-opt-in arms, `isHaltBlockingNew`. `workflowWalk.ts` `dispatchEventToWorkflows` the `s.status='active'` predicate, `resolveAgentRef`, `evalIfPick`, `allComparesPass`, `outgoingHandle`, `call_agent`. `templateWalk.ts` `resolveBoundTemplate`. `supabase/seeds/003_canonical_workflows.sql` `wf-eligibility-reactivation` and its `workflow_state`. `supabase/seeds/002_machine_tables.sql` `bind.demo-firm.reactivation`. `supabase/migrations/010_sequence_campaign_housing.sql` `firm_sequence_binding_default_idx`. `scripts/verify-machine-e2e.ts` the reference-cascade template lookup. `src/app/wire/standins/machineApi.ts` `upsertReference`. `src/app/wire/standins/consentSilence.ts` `get`. `docs/register/how/contact-silence.md`. `docs/register/how/operator-book-readiness.md` leaf 1.2. `docs/register/SYSTEMS-STORY.md` §6. `docs/register/SEED.md` §5.3. `docs/register/system-map/END-TO-END-REPORT.md`. Claims 2, 12, 20, 22, 23, and 31.

**Live.** The loop still calls `enrollAndActuate` for every contact id, still passes `tpl.reactivation.v1` for the agent and the sequence, and still does not read `consent_records`. The omitted flag still fires the first step. `upsertReference` still pushes the enrollment for every contact. No migration was written.

### Revision — claim 44

The sentence that whether silence stops the no-workflow opt-in insert was not decided stands as the gap. Claim 44 decides that insert. The missing-basis arm still does not apply. `liveSends` stays the cohort count. Nothing in that claim writes `waitlisted`.

---

## Claim 44 — When no workflow is active, the opt-in enroll skips a silenced contact

**Standing:** necessary implication of the silence leaf and of claim 23, and a technical decision made in this session.

When `dispatchEventToWorkflows` returns no workflow for the `audit.completed` firing in `handleOnboardingFire`, that handler enrolls the firm’s opt-in sequence for a contact on its ready list only when the `consent_records` row for that contact and for the session firm is not silenced. `silenced` true, or `status` `silenced`, does not enroll. A missing row, and `basis` `none`, do enroll, and the first step runs. This firing inserts no row before the dispatch, so `payload.writes` stays absent and the payload has no audit-run id. Claim 8 still names which ready row is current. Claim 43’s missing-basis withhold does not move onto this purpose. Claim 2 still allows a second enrollment when the call is made.

**When the loop runs.** The handler reads `campaign_states` for the session firm from `requireSessionFirm`. A missing row, or a `state` other than `running`, returns `{ skipped: true, reason: "campaign_state not running" }` and does not dispatch and does not enroll. Past that, the list is the contacts claim 8 already named: the latest `sequence_ready` row for that firm has `ready` true, and the contact is included once. The dispatch is `audit.completed` with payload `{ trigger: "campaign_state=running", onboarding: true }`, `contactIds` that list, and no `writes`. `wf-optin-launch` is seeded with `workflow_state` `draft`, so that graph does not make `dispatched.length` greater than zero. The fallback is the path a seeded firm takes. An active workflow that matches is a listening run. The loop does not run. The seed rule “Scope book (eligibility)” does not read `consent_records` and does not replace `contactIds`. `executeRuleWrites` writes missing-fact rows, and the walk then follows every outgoing edge. `call_agent` on that graph enrolls the dispatched ids with purpose `opt-in`. Activating `wf-optin-launch` stops this fallback and enrolls through that action, including a silenced contact. This claim does not give the rule a silence compare, and it does not move the withhold into `enrollAndActuate`.

The dispatch’s `contactIds` stay the ready list, silenced contacts included. The silence filter is the enroll after an empty dispatch. A listening run can still see the contact. Removing the contact from the firing would hide them from every listener. `handleAuditRunCreate` is the other `audit.completed`. It passes `auditRunId` and `result.writes`. The walker’s `run_audit` path does the same when the trigger label does not already contain `audit.completed`. This handler did not insert `audit_runs`, `contact_records`, `reachability_verdicts`, or `sequence_ready`. Those rows are not this firing’s writes. Copying the newest audit’s pointers onto this payload would be the latest-row read claim 7 and claim 8 already refused.

**The pair.** The read is claim 23’s select: `basis`, `silenced`, and `status` where `contact_id` is the contact and `firm_id` is the session firm. Another firm’s row is not this row. The arms are the silence arms that function already uses, including when `purpose` is `opt-in`. `silenced` true or `status` `silenced` does not pass the contact to `enrollAndActuate`. A missing row, and `basis` `none` with `silenced` false and `status` other than `silenced`, do pass. `workspace_opted_out` is not read. Claim 42 already kept that flag off the send. The withheld contact is not an element of the `enrolled` array. There is no `enrollmentId`, no `active_attempts` row, and no `engagement_records` row. Halt is not consulted for that contact, because the call is not made.

**The enroll that is allowed.** The agent and the sequence are the template `resolveAgentRef` already returns for `tpl.optin_launch.v1`: `firm_sequence_binding.template_id` for the session firm and sequence class `optin`, `is_default` first, then `created_at`, or `tpl.optin_launch.v1` when the firm has no row. `call_agent` resolves that way before it enrolls. `sequenceClassForAgent` maps that platform id to class `optin`. The live onboarding query is the same class and the same default order, and it has no `created_at` tiebreak. The payload stays `{ trigger: "campaign_state=running" }`. The purpose stays the string `opt-in`. `fireFirstStep` stays omitted. Inside `enrollAndActuate` the test is `!== false`, so the first step runs. `isHaltBlockingNew` still returns before the insert. The handler still pushes `{ id: "", dryRun: true, blocked: "halt" }` for that return. Past that check the function inserts `enrollment` and an open `active_attempts` row, then `actuateChannelSend` with purpose `opt-in`. An allowed result is claim 22’s `send_live` or `send_dry_run`. A deny the gate returns after the insert is claim 22’s `send_denied`. The return’s `dryRun` stays `!shouldLiveSend`.

**The counts.** `enrollments`, `ids`, `dryRuns`, and `liveSends` are computed from the `enrolled` array, which holds only the calls that were made. A withheld contact increments none of them and is not in `ids`. `liveSends` is the count of those returns whose `dryRun` is false. That boolean is the cohort posture claim 22 already named. It is not `send.ok`. A denied first step for a live-cohort contact who was enrolled still counts. The refusal is the engagement row. The response note names the `SEND_MODE` gate. `docs/register/AUTHOR-RUNTIME-CLOSED.md` reads `liveSends=0` as that allowlist. `MachineApi.fireOnboarding` types `skipped`, `enrollments`, and `agentRef`. `AuditContext` calls it after a real audit whose `contacts` is greater than zero, and it discards the body. This claim does not add a field for the withheld contact.

**Why the insert is the motion.** `docs/register/how/contact-silence.md` says the silenced state is read by engagement runners, send gates, and book readiness, and that the contact is not sequence-ready for new automatic motion. The same leaf names the opt-in touchpoint as one of the places the contact can silence. `docs/register/how/operator-book-readiness.md` says enrollment is how a contact enters engagement, and that silenced contacts are excluded from automatic motion. This loop is that entry. The operator does not pick the contacts. Claim 23 denies the opt-in send when the pair is silenced, and it allows the same purpose when the basis is missing. Leaving the insert and relying on the later deny would open an attempt. Claim 20’s tick would keep sending. The escalation, the cell advance, and the wait arm each call `actuateChannelSend` with purpose `cem`, which the silence arms also deny. That is new automatic motion after the pair has already refused the send. The withhold is those silence arms, applied before the call. The missing-basis arm is not one of them. A contact who has not opted in is who this purpose exists to ask. Claim 22 remains the record of a first step that does run.

**The mirror.** `standInMachineApi.fireOnboarding` returns `{ enrollments: 0, agentRef: "tpl.optin_launch.v1", skipped: false }`. It does not read `sequence_ready` or `consent_records`, and it does not insert an enrollment. `AuditContext` calls `fireOnboarding` only when `wireRealEnabled()` is true. The stand-in is not this path. This claim does not make it enroll.

**Rejected alternatives.**

- Enroll every ready contact and let claim 23 deny the first step. That is the live call. The send does not go out. The enrollment and the open attempt do. Book readiness treats that entry as the motion. The silence leaf says the contact is not sequence-ready for a new one, and it says further automatic firm→client outreach stops. The tick then keeps the attempt sending, as purpose `cem`. The chronology of those denies is claim 22, which is the record of a step that ran. The step this pair refuses does not run.

- Copy claim 43’s full predicate, and withhold a missing row or `basis` `none`. The purpose is `opt-in`. Claim 23 allows that send with no prior basis. `docs/register/SYSTEMS-STORY.md` §6 and `docs/register/SEED.md` §5.3 name an opt-in phase whose job is firm→client consent. An empty basis is the contact this loop is for. The silence arms are the predicate the opt-in send already uses. The basis arm is the one it does not use.

- Put the withhold inside `enrollAndActuate` for every caller. An opt-in `call_agent`, including the action on an active `wf-optin-launch`, would then skip a silenced contact too. Claim 43 already refused a shared insert-block, because the reactivation predicate is not the opt-in predicate. This withhold is this loop. `call_agent`, `handleEnrollmentCreate`, and `handleSequenceEnrollContacts` stay claim 22’s park.

- Drop a silenced contact from the dispatch’s `contactIds`. The fallback would still be right, and an active listener would never see the contact. The rule on the seed graph does not enroll by itself. Some other action on a firm’s own graph could. The firing’s audience stays the ready list. The enroll is the motion.

- Put `audit_runs` or `sequence_ready` on this firing’s `writes`, copying `handleAuditRunCreate`. This handler did not insert those rows. The write-set for `audit.completed` names the rows the audit run wrote. A second firing that points at the newest run is the latest-row handle claim 7 and claim 8 refused. The ready ids are already the `contactIds` argument.

- Push `{ id: "", dryRun: true, blocked: "consent" }` the way halt is pushed. Halt is a call that returned. The return’s `dryRun` true is the function’s blocked result. A contact who was not called has no cohort flag. Putting `dryRun` true on them would count a withhold as a dry-run enrollment. `enrollments` and `dryRuns` would both grow. The contact is absent from the array.

- Count `liveSends` from `send.ok && !send.dryRun`. The two counts are the two sides of `result.dryRun`, and that flag is the cohort. The handler’s note names the `SEND_MODE` gate. A live-cohort denial would leave `liveSends` and become neither count, while the engagement row is already the refusal. The closed runtime note uses `liveSends=0` for the allowlist. This claim does not retune the formula.

- Pass `fireFirstStep: false` so the row exists and nothing sends. The omitted flag is the first step. The handler’s note is the opt-in enrollment under the send gate. An armed row with no attempt would be a second state. Seed §5.3’s armed ghost is the reactivation phase, and this function does not write an armed flag.

- Keep the platform id when the firm has bound another opt-in template, or leave the live query’s missing `created_at`. `firm_sequence_binding` holds the firm’s template for the class. `call_agent` already orders `is_default DESC, created_at ASC`. Two default `optin` rows are otherwise unordered. The unbound firm still gets `tpl.optin_launch.v1`.

- Treat `workspace_opted_out` as this withhold. Claim 42 keeps that flag off the send. The seat Opt out does not set `silenced` true. This loop reads the silence arms the opt-in send reads.

**What this leaves.** The escalation, the cell advance, and the wait arm each pass purpose `cem` for a later actuation of the attempt this loop opened. Claim 23’s exemption is the purpose on that send. For sequence class `optin`, `cem` and `opt-in` are not the same gate: a missing basis allows the first step and denies the later cell. `tpl.optin_launch.v1` puts the day-1 text on the first cell and the day-1 announcement email on the next. `docs/register/SEED.md` §5.3 names the opt-in phase as consent and first channel open. `docs/register/SYSTEMS-STORY.md` §7a says that phase holds content order across days, and §6 leaves the CASL regime for firm→client unnamed. Which purpose a later cell of this enrollment uses was not decided. `listUnsubscribe.accept` still has no caller. The launch-day audience ask stays unfilled. The reactivation seed branch still has no pick.

No founder question on the silence withhold. A ready contact and an opt-in enrollment are different writes. The ready list is claim 8, and it still includes a silenced contact. The enrollment is new automatic motion, and the pair that would deny the opt-in send is the pair that does not start it. A contact with no basis still starts, and the first step of that enroll is the send claim 22 already records. Another firm’s consent does not decide it.

**Evidence:** `machine.ts` `handleOnboardingFire`, `firmId`, `handleAuditRunCreate`. `cascade.ts` `enrollAndActuate` the halt return and the `fireFirstStep !== false` branch, `escalateAttemptWindow`, `advanceTemplateCellIfDue`, the wait arm in `tickOnce`. `dispatchSend.ts` `consentAndHaltGate` the silence arms and the `purpose !== "opt-in"` arm. `workflowWalk.ts` `dispatchEventToWorkflows`, `resolveAgentRef`, `sequenceClassForAgent`, `executeRuleWrites`, the `type === "rule"` branch, `call_agent`, the `run_audit` dispatch. `auditRun.ts` `executeAuditRun`. `supabase/seeds/003_canonical_workflows.sql` `wf-optin-launch` and its `workflow_state`. `supabase/seeds/002_machine_tables.sql` `tpl.optin_launch.v1`, `bind.demo-firm.optin`, `camp.optin.window`, `camp.optin.day`. `src/app/context/AuditContext.tsx` `persistAuditRun`. `src/app/wire/ports.ts` `fireOnboarding`. `src/app/wire/reals/machineApi.ts` `fireOnboarding`. `src/app/wire/standins/machineApi.ts` `fireOnboarding`. `docs/register/how/contact-silence.md`. `docs/register/how/operator-book-readiness.md` leaf 1.2. `docs/register/system-map/ACTUATION-REPORT.md`. `docs/register/AUTHOR-RUNTIME-CLOSED.md`. `docs/register/SYSTEMS-STORY.md` §6 and §7a. `docs/register/SEED.md` §5.3. Claims 2, 8, 20, 22, 23, 42, and 43.

**Live.** The loop still calls `enrollAndActuate` for every ready contact, still does not read `consent_records`, and still counts `liveSends` from `!result.dryRun`. The dispatch still omits `writes` and the audit-run id. The binding query still has no `created_at`. `fireOnboarding` on the stand-in still returns zero enrollments. No migration was written.

### Revision — claim 45

The sentence that which purpose a later cell of this enrollment uses was not decided stands as the gap. Claim 45 decides it. A later actuation of sequence class `optin` passes `opt-in`, so a missing basis still allows the day-1 announcement. Silence still denies it. The launch-day audience ask stays unfilled. Nothing in that claim writes `waitlisted`, and the silence withhold does not move into `enrollAndActuate`.

---

## Claim 45 — A later actuation of an opt-in sequence keeps purpose `opt-in`

**Standing:** necessary implication of the opt-in phase’s day calendar and of claim 23’s exemption, and a technical decision made in this session.

When `tickOnce` reaches `actuateChannelSend` for an open attempt whose sequence template has `sequence_class` `optin`, that send’s purpose is `opt-in`. When the class is `reengagement` or `reactivation`, or when no template row loads, the purpose stays `cem`. Claim 23’s missing-basis arm therefore allows the later cells of an opt-in enrollment, and it still denies the later cells of the other two classes. `silenced` true or `status` `silenced` still denies every one of those sends, including `opt-in`. Claim 20’s halt deny is unchanged, because that arm does not read purpose. Claim 44’s first step is unchanged. `call_agent` uses the same class for its first-step purpose: `opt-in` when the resolved template’s class is `optin`, and `cem` otherwise. Claim 43’s fallback purpose stays the string `reactivation`. This claim does not place a contact on launch day and does not write `waitlisted`.

**Which template.** The id is `attempt.state.templateId` when that value is a string. Otherwise it is `enrollment.sequence_id` for `attempt.enrollment_id`. The class is `sequence_template.sequence_class` on that id. `enrollAndActuate` stores `templateId` on the attempt state from the resolved template and stores `sequence_id` on the enrollment, so a missing state key still has the enrollment column. `sequenceClassForAgent` is not this lookup. It returns `optin` for any ref that does not contain `reactivation`, `reengagement`, or `nudge`. A firm copy whose id lacks those words would take the exemption from the heuristic and would not take it from the column. Migration `010_sequence_campaign_housing.sql` constrains the column to `optin`, `reengagement`, and `reactivation`, and it folds the old `optin_launch` and `launch_day` classes into `optin`. If neither id has a row, the purpose stays `cem`. An attempt that cannot name an opt-in template does not receive the exemption.

**The three calls.** They are the three claim 20 named, in `cascade.ts`. `advanceTemplateCellIfDue` passes the purpose after the cell cursor update, when the next cell’s channel is `email` or `text`. The wait arm passes it after `attempt_wait_until` is cleared, when the owner channel is `email` or `text`. `escalateAttemptWindow` passes it when `toChannel` is `email` or `text` and the queued next attempt is not still waiting. A channel that is neither email nor text still does not call `actuateChannelSend`. The seeded day-2 cell `ol-d2-social` has channel `form`. The cursor still advances onto it. This claim does not add a send for that cell.

**Why the announcement is the same exemption.** `docs/register/SEED.md` §5.3 and `docs/register/SYSTEMS-STORY.md` §6 name the opt-in phase as firm→client consent and first channel open. §7a says that phase holds content order across days, and that this order must not be collapsed into the attempt ladder. The seeded cells of `tpl.optin_launch.v1` are that order: day-1 text primer, day-1 announcement email, day-2 social follow, day-3 waitlist, days 4–7 nurture. `guidelines/Reactivation.md` says the primer signals that an important email is coming today, and that the announcement is the partnership send. `docs/register/system-map/BUILD-system-map-v3-templates-and-binding.md` treats that calendar as resolved: the primer’s Y-reply is a tier signal, not a gate, and the email comes as scheduled. `docs/register/SYSTEMS-GOAL.md` repeats that the primer is not a gate. Sign-up, not the primer, is the completion that sequences consent (`docs/register/SYSTEMS-REQUIREMENTS-FILLED.md` `optin_phase`; the guideline’s Launch Day; SYSTEMS-GOAL). A contact claim 44 enrolled has no basis. Purpose `cem` denies that contact the announcement for `consent missing`. Purpose `opt-in` is the exemption claim 23 already gives this phase’s own send. The later cell is still the phase. It is not a nudge, and it is not the reactivation ask.

Story §6 still leaves CASL and SMS regimes by geography unnamed. The gate already implements the exemption as the purpose string, and the first step of this class already passes `opt-in`. Using that string on the rest of the class is the calendar the story already required. Choosing a country, or express against implied, is not required to name the purpose.

**The clock.** `normalizeTemplateCells` sets `offsetMs` to `day × 24h` when the cell has no minute offset. Both day-1 cells store `"day": 1`, so the live announcement offset is 24 hours. The primer is not sent by that offset. The first step sends cell index 0 at enroll. The guideline’s “today” and the shared day number are one calendar day. The offset of a cell is its day minus the first cell’s day, in days, times 24 hours, and not below zero. `dayFromToken` is still how a cell’s day is read: the numeric `day`, else `dayOffset`, else the number in the token, else 0. On this template the announcement’s day equals the primer’s day, so the offset is 0 and the cell is due at `enrolledAt`. `advanceTemplateCellIfDue` sends it on a tick at or after that time. The enroll call still sends only the first cell. Day 2 is one day after the first cell’s day, day 3 is two days, and the days 4–7 cell, stored as day 4, is three days. Reactivation’s first cell is day 0 from the token `day0_text_primer`, so its later cells keep the spacing the absolute formula already gives them: the day-0 email at 0, `days1_3_nurture` at one day, and `day3_slot_opens` at three days. The templates whose first day is not 0 are the ones that move.

The announcement send is the cell advance of `ol-d1-email`. It is not the channel ladder. §7a does not decide attempt retries. The ladder can still escalate inside the current cell, and a ladder send or a wait-arm send for this class uses the same purpose. The scheduled email BUILD names is the cell.

**Launch day.** The same migration makes `camp.optin.day` the next campaign on `tpl.optin_launch.v1`, objective “They opt in,” completion `fact_writebacks`. An open attempt that is still class `optin` while the cursor sits on that campaign uses purpose `opt-in` on these three sends. That is the class of the template the attempt is already running. It does not place a contact on the campaign. `docs/register/SYSTEMS-GOAL.md` asks whether launch day is only for contacts who were waitlisted, and it says not to fill that ask. Nothing here writes `waitlisted`. `advanceEnrollmentCampaign` still moves the cursor when the current objective is satisfied. Who holds the enrollment is the earlier enroll. The day-1 announcement is `ol-d1-email` on the launch-window cells, not that later campaign.

**`call_agent`.** `walkValidatedWorkflow` resolves the template, then passes purpose `opt-in` when `sequenceClassForAgent(agentRef) === "optin"` and `cem` otherwise. `copySequenceFromTemplate` mints `tpl.${sequenceClass}.${firm prefix}.${uuid}`, so a copy made on that path still contains the class word and the heuristic agrees with the column. A binding whose `template_id` does not contain the word does not. The purpose follows the row `resolveAgentRef` returned: class `optin` passes `opt-in`, any other stored class passes `cem`, and a missing row passes `cem`. The first step still runs. Claim 22 still records it. This does not change claim 43’s string `reactivation` on the no-workflow fallback. `reactivation` and `cem` are the same gate. Both are not `opt-in`.

**Rejected alternatives.**

- Keep `cem` on the three calls for an opt-in attempt. That is the live literal. The primer goes out under claim 44. The announcement, the waitlist email, the nurture cell, and any ladder or wait-arm send are denied for a missing basis. The phase’s audience is that absence. The day calendar would not run for the contact the phase exists to ask, and the primer would be a consent gate. The guideline and the build instruction say the email comes as scheduled.

- Pass `opt-in` on every tick send, including reactivation and re-engagement. Those classes are not the exemption. Claim 23 denies a purpose other than `opt-in` when the basis is missing. Claim 43 already treats the reactivation enroll as that deny. A later cell of a reactivation attempt stays `cem`, so a contact who has not opted in does not receive the meeting ask on the strength of this calendar.

- Classify the tick with `sequenceClassForAgent`. The default arm returns `optin`. A renamed reactivation template would be exempt. The column is the class. The heuristic is the helper this claim stops using for the purpose.

- Leave `call_agent` on the heuristic while the tick reads the column. The two sends of one enrollment would then disagree for a template id that does not contain the class word. The first reactivation step could go out with no basis, and the tick would deny the next cell. The class is one row. Both call sites read it.

- Treat `day × 24h` as the calendar, so the announcement waits a day. Both cells are day 1. The primer says the email is coming today. An offset of one day makes the shared day number a wait. Reactivation already uses day 0 for its first day, which is why the absolute formula matches that template and misses this one. The difference from the first cell’s day is the same rule for both.

- Send the announcement inside `enrollAndActuate` beside the primer. The first step is cell 0. The cell advance is the cursor. Due at enrollment means the next tick, not a second send in the enroll function. Claim 22 stays the record of the first step.

- Fill the launch-day audience so the day-1 email can send. The announcement is a cell of the launch window on the enrollment claim 44 already started. The audience ask is who is placed on `camp.optin.day`. This claim does not read `status` `waitlisted` and does not create that enrollment.

- Move claim 44’s silence withhold into `enrollAndActuate`. A silenced pair still does not start on the onboarding fallback. An attempt that is already open stays claim 20: the tick send is denied, and the attempt is not aborted. Silence denies `opt-in`. The withhold stays on that loop.

**What this leaves.** `listUnsubscribe.accept` still has no caller, and no server handler writes the pair from a list-unsubscribe. The silence leaf still names that control. The launch-day audience ask stays unfilled. The reactivation seed branch still has no pick. The day-3 guideline names email and SMS, and the seeded cell `ol-d3-waitlist` is one email. The days 4–7 guideline names two emails and one text, and the seeded cell is one email at day 4. This claim does not add a cell. `resumeDueWaitingRuns` selects `workflow_run` rows with `status` `waiting` and `resume_at` due, marks the matching `wait_occupancy` rows `approved`, and calls `resumeWaitRun`. That function sets the run back to `running` and calls `walkValidatedWorkflow` with `resumeFromNodeId` the wait node and `triggerPayload` `{ writes: previousWrites }`. The actions that walk takes after the wait were not followed. A `call_agent` on it remains claim 18’s enroll check and claim 22’s first step. `dispatchScheduleTriggers` still inserts a run labelled `schedule` and walks with `{ schedule: true, anyPass: true }`. The nodes that walk reaches were not followed.

No founder question. The day calendar of the opt-in phase is the motion that runs before sign-up sequences the contact. The purpose that already lets the primer ask is the purpose on the rest of that class. A contact with no basis receives the day-1 announcement. A silenced contact does not. A reactivation or re-engagement attempt does not borrow the exemption. Another firm’s consent does not decide it, which claim 23 already settled. Who is placed on launch day stays the question SYSTEMS-GOAL said not to fill.

**Evidence:** `cascade.ts` `escalateAttemptWindow`, `advanceTemplateCellIfDue`, the wait arm in `tickOnce`, `enrollAndActuate` the attempt `state.templateId`. `templateWalk.ts` `dayFromToken`, `normalizeTemplateCells`. `workflowWalk.ts` `sequenceClassForAgent`, `resolveAgentRef`, the `call_agent` purpose, `resumeDueWaitingRuns`, `resumeWaitRun`, `dispatchScheduleTriggers`. `campaignHousing.ts` `copySequenceFromTemplate` the minted id, `advanceEnrollmentCampaign`. `dispatchSend.ts` `consentAndHaltGate` the `purpose !== "opt-in"` arm. `supabase/seeds/002_machine_tables.sql` `tpl.optin_launch.v1` cells, `camp.optin.window`, `camp.optin.day`. `supabase/migrations/010_sequence_campaign_housing.sql` the class fold and the check. `guidelines/Reactivation.md` Day 1 text primer, Day 1 announcement, Launch Day. `docs/register/system-map/BUILD-system-map-v3-templates-and-binding.md` the launch calendar and the non-reply rule. `docs/register/SYSTEMS-GOAL.md` the primer is not a gate, and the unfilled launch-day audience. `docs/register/SEED.md` §5.3 and §5.5. `docs/register/SYSTEMS-STORY.md` §6, §7a, and §7b. `docs/register/SYSTEMS-REQUIREMENTS-FILLED.md` `optin_phase`. Claims 20, 22, 23, 43, and 44.

**Live.** The three calls still pass the literal `cem`. `call_agent` still uses `sequenceClassForAgent`. `offsetMs` is still `day × 24h`, so the announcement is still due one day after enroll. No migration was written.

### Revision — claims 46 and 47

The sentence that the actions after the wait were not followed stands as the gap. Claim 46 names them. The occupancy pointers are the re-entry writes when the due update returns rows. A duration wait inserts none, and that re-entry uses `counts.waitWrites`. The sentence that the schedule walk was not followed past `{ schedule: true, anyPass: true }` stands as the other gap. Claim 47 names who that walk is about, and which minute starts it.

---

## Claim 46 — A resumed wait continues that same run, and the nodes after it are the operations already on the graph

**Standing:** necessary implication of a Wait being a park on this run, and a technical decision made in this session.

`resumeWaitRun` does not insert a `workflow_run`. It sets the existing row back to `running`, clears `waiting_node_id` and `resume_at`, and calls `walkValidatedWorkflow` with `resumeFromNodeId` set to the wait. That call marks the wait visited, copies the stored `node_status`, writes this node’s status as success with detail `wait resumed`, and follows every outgoing edge. It does not execute the wait again. `call_agent` on that walk remains claim 18’s enroll check, claim 22’s first step, and claim 45’s purpose. This claim is every other node that walk can reach.

**Which runs the tick resumes.** `resumeDueWaitingRuns` selects `workflow_run` where `status` is `waiting`, `resume_at` is not null, and `resume_at` is due. A duration wait is that row: the park stored `resume_at` from `durationAmount` and `durationUnit`, and it did not insert `wait_occupancy`. An approval wait parks with `resume_at` null, so the tick does not select it. Approve later, in `handleWaitOccupancyApprove`, sets the group’s open occupancy to `scheduled` and sets `resume_at` on those runs. The tick then selects them. Approve now does not wait for the tick. It calls `resumeWaitRun` itself. Both doors enter the same function. The outgoing operations are one set.

**What the re-entry is holding.** The tick updates `wait_occupancy` to `approved` for that run and that wait node where `status` is `open` or `scheduled`. It does not filter `approver`. The node has one approver, so the rows are the note the desk scheduled, plus any open row for that same run and node. When that update returns rows, the people are those `contact_id`s and the writes are those occupancy pointers. `counts.waitWrites` is not the handle. When the update returns nothing, which is the duration park, the people are `counts.waitContactIds` and the writes are `counts.waitWrites`. Those writes are `ctx.previousWrites` from the moment the walk parked, which is the previous node’s list, not an occupancy row. Approve now always passes the occupancy pointers it just approved, and the contacts on them. Claim 6 still requires `chainWrites` to be rebuilt from the stored `node_status` before the outgoing nodes run. The live resume still starts that map empty. A chip that names a node from before the wait still falls through to this re-entry’s writes. This claim does not retune that find.

**The label.** `run_audit` skips its `audit.completed` dispatch when `opts.triggerLabel` contains `audit.completed`. The tick passes the run’s `trigger_label`, or `wait-resume` when the column is null. Approve now omits the argument, and `resumeWaitRun` then defaults the walk to `wait-resume`. The column on the row is the label of this run. Both callers pass it. A null column stays `wait-resume`. The walk does not rewrite the column.

**What those nodes may do.** The firm is the run’s `firm_id`. The people and the writes are the re-entry above. Each node does the work that node already does on a walk. None of them is a second graph. The resume function does not dispatch.

- `ascribe_tag` inserts `contact_tag` for the contacts the node already resolves: a contact chip when that chip matches these writes, otherwise the `pickTable` slice of these writes, otherwise `ctx.contactIds`. `notesFromVerdict` updates `contact_records.notes` only when these writes include a `reachability_verdicts` pointer for that contact and the load returns a rationale or a verdict. An occupancy re-entry has no verdict pointer. A duration re-entry has one only when the parked list had one. The tag is an in-app write. It does not read `consent_records`. It is not a send.
- `run_audit` takes `ctx.contactIds` when that list is non-empty, and `contactsForAudit` keeps the rows whose `firm_id` is the walk’s firm. It then runs `executeAuditRun`. The dispatch of `audit.completed` remains that action’s dispatch, skipped when the label rule above matches. It is not a second copy of this graph. The approve handler still does not dispatch.
- `manage_lists`, `assign_task`, and `notify_consultant` are the fallthrough claim 10 already specified: one `engagement_records` insert per contact, and the pointer’s `id` is the `eng-` id `writeEngagement` returns. An in-app affordance other than `run_audit` or `ascribe_tag` still returns with an empty write list and does not insert.
- A rule inserts `missing_fact_signals` for the resumed contacts, the same writer as a fresh walk. `directContactIds` on the node still replaces the list when that array is non-empty.
- A Get with mapped slots filters these writes. A Get with no mapped slots calls `executeGet` and that result replaces the handle and, when it returns contact ids, the people. The contacts module with select `every` still has no `firm_id` predicate. Claim 8 left that predicate. This claim does not add it.
- An If or a Switch reads the writes this re-entry placed. Claim 6’s rebuild is still what a chip from before the wait needs. This claim does not make the occupancy row stand in for a write the wait did not hold.
- A further Wait may park the same run. A duration stores a new `resume_at`. An approval inserts occupancy and parks with `resume_at` null, so the tick does not select it until the desk sets that column. The walk does not continue past the new park.
- A constant loads the pack into `ctx.constants` and continues. An exit ends the run. A node with `configured` false fails and does not continue. An unknown type is skipped and the outgoing edges still run.

**Why these are the operations.** `docs/register/AUTOMATIONS-FACE.md` law 2 says the middle does not change: on this event, perform this operation. A Wait is a park inside that middle. Law 13 says actions are not only outreach. Law 19 names the two kinds: in the application, and agents. The agent kind is `call_agent`, already specified. The in-app kinds are the other action types the check constraint already allows (`action_type_check` in `supabase/migrations/010_sequence_campaign_housing.sql`). `waitNote.ts` says the desk resumes this run’s outgoing and does not dispatch a second graph. That sentence is the approve handler. It is not a ban on `run_audit`’s own event.

**What this does not withhold.** Claims 43 and 44 withhold a silenced contact from the two no-workflow enroll loops. They do not read the pair on a tag, an audit, a rule, or an engagement append. A resumed `call_agent` is still the enroll those claims left in place: halt is claim 18, and a first step that runs is claim 22. This claim does not move the silence withhold onto the outgoing nodes, and it does not add the one-motion refusal P1 left open.

**Rejected alternatives.**

- Treat the occupancy pointers as the writes of every tick resume. That is the approval-later path, and it is Approve now. A duration wait never inserts occupancy. Journal 001 already recorded that the duration park stashes `ctx.previousWrites` on `counts.waitWrites`. Using the occupancy update for that run would hand the outgoing nodes an empty list and drop the people the wait was holding.
- Start a new `workflow_run` from the wait’s outgoing edges. The row id is the parked run. `resumeWaitRun` updates that id. A second run would be the dispatch `waitNote.ts` says not to make.
- Re-execute the wait on resume. The walker adds the wait to `visited` before `goOn`. Executing it again would park the same node without having run anything after it.
- Leave Approve now on the default label `wait-resume`. The tick already passes `trigger_label`. A `run_audit` after Approve now would then dispatch `audit.completed` for a run the tick would have skipped. The column is one label.
- Extend claims 43 and 44 so a silenced contact is not tagged, audited, or appended on resume. Those claims are the two enroll loops. The silence leaf is read by send gates and by book readiness for a new enrollment. These nodes are the in-app half of law 19. A send still goes through `consentAndHaltGate` when the node is `call_agent`.
- Fill claim 6 by treating the occupancy row as every earlier write. The occupancy row is this wait’s pointer. A chip that names the rule or the audit from before the wait is the rebuild claim 6 already required. One pointer does not become that map.

No founder question. The wait holds this run. The tick and the desk both continue it. The nodes after the wait do the work the graph already named, for the contacts that park was holding. A silenced pair still does not, by this claim, stop a tag or an audit. Another firm’s contact is not added by the tag or by the audit query. Who is placed on launch day stays unfilled.

**Evidence:** `workflowWalk.ts` `resumeDueWaitingRuns`, `resumeWaitRun`, the `resumeFromNodeId` branch, the `type === "action"` arms, the `type === "wait"` park, `contactsForAudit`, `noteFromVerdict`, `executeGet`. `waitNote.ts` `handleWaitOccupancyApprove`. `cascade.ts` the call after the attempt loop. `supabase/migrations/024_wait_occupancy.sql`. `supabase/migrations/010_sequence_campaign_housing.sql` `action_type_check`. `docs/register/AUTOMATIONS-FACE.md` laws 2, 13, and 19. Claims 6, 8, 10, 18, 22, 43, 44, and 45.

**Live.** The tick already splits duration and occupancy the way this claim says, and the outgoing nodes already run. Approve now still omits `triggerLabel`, so that walk is still `wait-resume`. `chainWrites` is still empty. `executeGet` for every contact still has no firm predicate. No migration was written.

### Revision — claim 48

The sentence that a contacts Get with select `every` still has no `firm_id` predicate, and that this claim does not add it, stands as the gap. Claim 48 adds that predicate, and it says a mapped Get keeps the module read rather than the chip’s source rows.

---

## Claim 47 — A schedule tick walks this automation’s audience, and only in a minute the stored cron matches

**Standing:** necessary implication of schedule being an event-of-origin and of claim 17’s audience, and a technical decision made in this session.

`dispatchScheduleTriggers` is the other call `tickOnce` makes after the attempt loop. It selects enabled `workflow_trigger` rows of type `schedule` whose workflow is `active` and whose `firm_id` is not null. It inserts one new `workflow_run` labelled `schedule` and walks from the trigger. It does not resume a parked run. Claim 46 does not apply to it. The people on that walk are claim 17’s audience for the trigger’s firm. The walk starts only when `schedule.cron` matches the tick’s UTC minute, and only once in that minute.

**Why it is the audience.** `docs/register/AUTOMATIONS-FACE.md` law 2 names schedule as the event the middle starts from. Law 31 puts Add-contact on events: Every firm or Select from, and the automation does not start a mission now. The footer on the product face is the same sentence claim 17 already used: who this automation applies to, and it does not start a mission now. A schedule firing passes no contact ids and no writes. `writesFromPayload` of `{ schedule: true }` is an empty list. `personIdsFromWrites` of that list is nobody. `walkValidatedWorkflow` does not query the book. Without the audience, `call_agent` enrolls nobody, `contactsForAudit` audits nobody, and the middle the operator saved does not run. Claim 17 already decided that a firing with no contact ids walks `workflow.audience_scope` inside the firing firm. The schedule dispatcher never calls `dispatchEventToWorkflows`, so that branch does not run today. The firing firm is `workflow_trigger.firm_id`, which is the firm the run insert already stamps.

The branch is the one claim 17 specified, not a second copy of the rule. `select_from` walks the stored `audience_contact_ids` that are `contact_records` of that firm, and does not start when none remain. `every_firm`, including a null scope, walks every `contact_records.id` of that firm, and an empty book still starts. The list is the `contactIds` argument. It is not copied onto the payload. `previousWrites` stays empty. There is no row on this firing, so there is nothing to put in `writes`. A repeated minute enrolls again when the graph reaches `call_agent`. Claim 17 already left a later firing of the same firm free to enroll again. This claim does not add the one-motion refusal.

**Which minute.** The worker tick is the clock. `handleMachineTick` calls `tickOnce`, and the route comment says the production host runs that route every minute. The time the operator named is `scheduleCron` on the trigger, materialized as `workflow_trigger.schedule` jsonb `{ summary, cron }`. The modal writes the same string into both keys. The matcher reads `cron`. The value is a five-field cron: minute, hour, day of month, month, day of week, evaluated in UTC against the tick’s time, including `*`, lists, and steps. An empty string or a string that does not parse does not fire. A tick does not catch up a minute it missed. The next matching minute is the next run.

The live query is `DISTINCT` on `workflow_id` and `firm_id`, so one firm’s workflow is one row. One such pair starts at most one schedule run in a UTC minute. The guard is an existing `workflow_run` for that workflow and that firm with `trigger_label` `schedule` and `started_at` in that same minute. `started_at` is already the column. A second schedule trigger on the same workflow and firm does not start a second run. The walker still begins at the graph’s first trigger. A draft workflow does not fire. The three seeded workflows are `draft`, and none of their triggers is `schedule`.

**The payload.** It is `{ schedule: true }`. It does not set `anyPass`. Claim 7 refused that flag on an event dispatch because absence of a write is not a pass. A schedule firing did not evaluate a pathway. With the flag set, `ctx.eligibilityPass` is already true and the rule does not assign it from whether it wrote missing facts. Without the flag, a rule may still assign it, and a legacy branch that has not seen a failure still falls through to true. The If does not read the flag. The handle stays empty, so an If that needs a row still fails closed.

`call_agent` on this walk is claim 18, then claim 22, then claim 45 when the resolved class is `optin`. A Get with no mapped slots may still replace the audience. That replacement is the open `executeGet` predicate claim 46 left where claim 8 left it. This claim does not firm-scope that query.

**Rejected alternatives.**

- Keep firing every enabled schedule on every tick and ignore `schedule`. That is the live function. The glass is the cron the operator typed. The tick is the minute-check. Firing the audience on every worker minute would enroll on every minute, including for a cron of `0 * * * *`.
- Walk nobody, which is what an empty `contactIds` does today. The audience is who the automation applies to, and schedule is the event it was waiting for. The middle would not run. Claim 17 already rejected this for a firing that names no one.
- Put the book on `payload.writes` as `contact_records`. Claim 17 already refused that. The handle is the firing’s rows. This firing has none. The audience is the person list.
- Set `anyPass` so a branch passes. The flag is not a pathway result. The branch’s own fallthrough already returns true when nothing has failed. The pin only stops the rule from recording its own result.
- Read `workflow_trigger.scope`. Claim 17 already refused that. Materialize writes `every_firm` on that column for every trigger. The operator’s choice is `workflow.audience_scope`.
- Skip contacts who already have an open enrollment. A later event firing enrolls again. Claim 2 allows two enrollments. P1’s one-motion refusal is still the abort that was not specified. This clock does not add it.
- Catch up missed minutes after a quiet tick. One match per tick that lands in the minute. A backlog would enroll once per skipped slot.

No founder question. Schedule is the event-of-origin the face already named. The people are the audience claim 17 already walks when a firing names none. The minute is the cron the trigger already stores. Another firm’s contacts are not on the run. Who is placed on launch day stays unfilled.

**Evidence:** `workflowWalk.ts` `dispatchScheduleTriggers`, `materializeTriggersFromGraph` the schedule jsonb and the grain forced to `global`, `dispatchEventToWorkflows` the audience arms, `writesFromPayload`. `cascade.ts` the call after the attempt loop. `machine.ts` `handleMachineTick`. `TriggerSelectModal.tsx` the cron input. `supabase/migrations/006_workflow_trigger.sql` `schedule`. `supabase/migrations/004_machine_tables.sql` `workflow_run.started_at`. `supabase/migrations/012_grain_audience_one_timer.sql` `audience_scope`. `supabase/seeds/003_canonical_workflows.sql` the three draft workflows. `docs/register/AUTOMATIONS-FACE.md` laws 2 and 31. `docs/register/AUTOMATIONS-UI-BLUEPRINT.md` A5. Claims 2, 7, 8, 17, 18, 22, 45, and 46.

**Live.** The function still inserts a run for every enabled schedule trigger on every tick, still passes `{ schedule: true, anyPass: true }`, and still passes no contact ids. `schedule.cron` is still unread. No migration was written.

### Revision — claim 48

The sentence that a Get with no mapped slots may still replace the audience, and that this claim does not firm-scope that query, stands as the gap. Claim 48 is that scope. The people claim 47 placed are who the walk holds until that node. The Get then replaces them with the records it read.

---

## Claim 48 — A Get reads this run’s firm, and a mapped slot is the class that read uses

**Standing:** necessary implication of Get being a module read on a one-firm run, and a technical decision made in this session.

`executeGet` is the read a Get takes when `mappedWrites` returns null. For module `contacts` and select `every`, the live statement is `SELECT id, firm_id FROM contact_records` with no predicate. The ids become `contact_records` pointers, and, when the list is non-empty, the walk replaces `ctx.contactIds`. Claim 46’s waited contacts and claim 47’s audience are who the walk held until that node. Claim 8 left the missing predicate because it was not the audit-grain question. This claim is that read, the same door on the other modules in the function, and what a mapped Get keeps.

**The firm.** The walk’s firm is `ctx.firmId`, which `walkValidatedWorkflow` sets from `opts.firmId`. Resume and the schedule tick already pass the run’s `firm_id`. A contacts read is `contact_records` whose `firm_id` is that firm. Select `every`, and a missing `getSelect` (the function’s default is `every`), are that whole book. There is no `ORDER BY`. An empty book is an empty id list. A missing `getModule` stays `contacts`, so the same predicate applies.

Select other than `every` still needs a firm. That firm is `getClass1` when the firm slot has no chip. The read is empty unless `getClass1` is the walk’s firm. When it is, `getClass2All` or an empty `getClass2` is every contact of that firm, and a non-empty `getClass2` is those ids that are contacts of that firm. An id from another firm does not match. The live select path already filters `firm_id = getClass1` and, when class 2 is narrowed, `id = ANY(getClass2)`. This claim adds the requirement that `getClass1` be the walk’s firm.

**Why it is this firm and not every row.** `origin/pr-96:docs/register/GET-PACKET.md` says Every firm on Get is the same idea as a dispatch that loads the whole firm book, and law 36 of `AUTOMATIONS-FACE.md` on that pull says select a firm and the contacts are that firm’s. `origin/pr-86:docs/register/SYSTEMS-GET-RULE-ASCRIBE.md` names the contacts cascade as firm then contact, and it calls the audits cascade the same tenancy door. The book query it lists, `contact_records WHERE firm_id = $1`, is marked audience and enroll rather than the Get node. That sentence keeps Get from being a second copy of Add contact. It does not give Get a house-wide book. Claim 17 already refused “every `contact_records` row, no firm predicate” on a run, because `call_agent` enrolls each id under `opts.firmId`. A Get that replaced the people with another firm’s contacts would do that. `handleSequenceEnrollContacts` can enroll each row under `row.firm_id` because that door starts now. This run has one firm. The operator-book helper “All contacts, every firm” stays the picker, which claim 17 already separated from the run.

**The people and the audit pointers.** When the module is `contacts`, the id list replaces `ctx.contactIds`, including when the list is empty. The live guard `if (result.contactIds?.length)` leaves the previous people in place when the read returns nobody, and a select with no `getClass1` returns `{ writes: [] }` and no `contactIds` at all. An empty read is zero people. The next `call_agent` enrolls that list. The writes are the `contact_records` pointers, then claim 8’s latest `reachability_verdicts` row and latest `sequence_ready` row for that contact and the walk’s firm. No such row means omit. The live attach still selects both tables by `contact_id` only and still stores the contact id as the pointer `id`. This claim does not retune that key. Law 45’s “Get contact always includes it” is those two pointers. Firms, audits, imports, agents, and reference do not return `contactIds`. They do not replace the people. Their writes still replace `previousWrites` through `commitWrites`.

**The other modules in the same function.** Each `every` arm that omits `firm_id` is the same door.

- Firms. Every is one write, `ct_firms` and the walk’s firm. Select is that write when `getClass1` is the walk’s firm, and empty otherwise. The live every arm is `SELECT id FROM ct_firms`. The live select arm returns `getClass1` with no check. Auth `firms` stays silent as the picker key, which the ascribe already said.
- Audits. Every is `audit_runs` whose `firm_id` is the walk’s firm. Select is empty unless `getClass1` is that firm, then every audit of that firm, or the `getClass2` ids that are audits of that firm.
- Imports. The same, and the live `kind = 'contact'` stays. Select is empty unless `getClass1` is the walk’s firm.
- Agents. The glass labels are Every sequence and Select sequence (`automationGet.ts`). The ascribe’s first class is `sequence_template` via `firm_sequence_binding` for this firm, and the second class is `campaign` of that sequence. Every is the campaigns whose `sequence_id` is a `template_id` bound to the walk’s firm. Select is empty unless `getClass1` is one of those template ids, then every campaign of that sequence, or the `getClass2` ids that are campaigns of that sequence. The live every arm is `SELECT id FROM campaign`. The live narrowed arm returns `getClass2` with no query. `campaign.firm_id` is not the predicate. A platform campaign of a bound sequence stays in the set.
- Reference. The function already returns `{ writes: [] }`. It stays empty. It does not replace the people. The ascribe already called that module silent.

**What a mapped Get keeps.** `mappedSlots` comment in `automationWorkflows.ts` says a chip, when present, is that slot’s value, and the class field for that slot is ignored. Law 40 says the chip is the box. The Get packet says a left-side write applies in the firm or contact box, and that replacing Every firm with a mapped-only slot was the first wrong turn. The writes are the records the module read. They are not the chip’s source rows.

When `getSelect` is `every`, or is missing, chips are not the read. Stale `mappedSlots` do not skip `executeGet`. The live branch treats any chip as the whole result and never queries the module.

When `getSelect` is `select`, a chip is the class value for its slot, and the module is still read inside the walk’s firm.

- A firm chip resolves the way `mappedWrites` already finds a chip: `chainWrites[fromNodeId]` when that node was filled, otherwise `previousWrites`, filtered by the chip’s table and id. The firm id is the chip’s `id` when that string is set, otherwise the `id` of the matched `ct_firms` write. If the slot does not resolve to an id, `getClass1` is not the fallback. The read is empty. If the id is not the walk’s firm, the read is empty.
- No firm chip: `getClass1`, and it still has to be the walk’s firm.
- A contact chip’s ids are the chip `id` when set, otherwise the matched write’s `contact_id`, otherwise that write’s `id` when the table is a person table. Those ids are then the contacts of the walk’s firm. A contact slot that does not resolve is an empty contact list, not every child of the firm.
- No contact chip: the closed-contact default. `getClass2All`, or an empty `getClass2`, is every contact of the walk’s firm. A non-empty `getClass2` is those ids that belong to that firm.

The same slot rule is the class value on firms, audits, imports, and agents. A firm chip that is not the walk’s firm, or a sequence chip that is not bound to the walk’s firm, is an empty read. Earlier nodes keep their own writes. Claim 6 still rebuilds `chainWrites` on resume. This node’s `previousWrites` are the records just read. On contacts, the people are that id list. The waited list and the schedule audience are not kept beside it.

**Rejected alternatives.**

- Leave contacts `every` as every row of `contact_records`. That is the live statement. Claim 17 already refused it for a run whose enroll uses one `firmId`. The packet’s “whole firm book” is the firm-scoped dispatch, not `handleSequenceEnrollContacts`.
- Let Select firm of another firm return that firm’s contacts, and let `call_agent` enroll them under the walk’s firm. The three-level selector names a firm. On this run the firm is already `ctx.firmId`. Another firm’s book is the harm the unscoped `every` has. The read is empty.
- Enroll a foreign Get under each contact’s own `firm_id`. That is the Agents door claim 17 separated. This walk does not grow a second firm.
- Treat any `mappedSlots` chip as the Get’s writes, which is the live branch. A firm chip would put a `ct_firms` pointer on the handle and, with no `contact_id`, would leave the people unchanged. The packet’s firm box selects that firm’s records. The chip is the class, not the result.
- Let a chip that fails to resolve fall back to `getClass1` or to every contact. The chip is the box. An unresolved box is an empty read. `getClass1` is the value when the slot has no chip.
- Let `every` honor stale chips and skip the book. Every hides the boxes. A leftover chip would be the mapped-only slot the packet rejected.
- Keep the previous people when the contacts read is empty. The set the node named has nobody. The length guard would enroll the people the Get replaced.
- Add `ORDER BY`, or retune claim 8’s pointer `id` to `audit_run_id` inside this claim. The book has no order. The key is claim 8. This claim names which contacts are read and which latest row is attached.
- Read `reference_versions` because the teaching chain is pack update, Get, rule. The module is silent. The example tree is not a write-set.

No founder question. Get is the module read on this run’s firm. Every contacts is that firm’s book. A mapped slot picks the class inside that firm. The people become the contacts that read returned, including none. Another firm’s contacts are not added. Who is placed on launch day stays unfilled.

**Evidence:** `workflowWalk.ts` `executeGet`, `mappedWrites`, the `type === "get"` branch, `ctx.firmId`. `automationGet.ts` `GET_MODULES`, `previewGetWrites`. `automationWorkflows.ts` `mappedSlots`. `GetParametersPane.tsx` the every/select dropdown. `origin/pr-96:docs/register/GET-PACKET.md`. `origin/pr-96:docs/register/AUTOMATIONS-FACE.md` laws 36, 40, and 45. `origin/pr-86:docs/register/SYSTEMS-GET-RULE-ASCRIBE.md` the contacts cascade and the tenancy door. `supabase/migrations/004_machine_tables.sql` `audit_runs.firm_id`, `firm_sequence_binding`. `supabase/migrations/010_sequence_campaign_housing.sql` `campaign`. `supabase/migrations/014_contact_import.sql` `import_batch.firm_id`. Claims 6, 8, 17, 46, and 47.

**Live.** Contacts `every` still has no `firm_id` predicate. Any chip still skips the module read and returns the matched source rows. An empty contacts read still does not clear `ctx.contactIds`. Firms, audits, imports, and agents `every` are still unscoped. No migration was written.

---

## Claim 49 — A one-click list-unsubscribe is the silence commit, for that email’s firm and contact

**Standing:** necessary implication of the silence leaf’s one-click being that same commit, and a technical decision made in this session.

`docs/register/how/contact-silence.md` says Silence, Opt out, and List-Unsubscribe one-click, where the channel provides it, are one commit. That commit writes the silenced state the runners, the send gates, and Book readiness read. `listUnsubscribe.accept` calls `standInConsentSilence.silence` with source `list-unsubscribe` and returns `{ accepted: true }`. Nothing in `src/` calls `accept`. No route under `server/` mentions list-unsubscribe. `dispatchEmailLive` sends the CEM without a List-Unsubscribe header. Claim 41 left the route unwritten. This claim is that commit.

**The write.** It is `handleConsentSilence`’s statement, with `source` `list-unsubscribe`. The pair is the firm and the contact the email was sent to. The insert stores `basis` `none`, `silenced` true, and that source. `status` takes the column default `unsequenced`. A conflict sets `silenced` true, `source`, and `updated_at`, and does not assign `basis`, `status`, or `workspace_opted_out`. That is claims 15 and 25 on this source. The dispatch is the one claim 15 specified: `consent_records.opt_out`, that firm, that contact, and the `writes` array whose `id` and `contact_id` are both the contact. The live silence handler still omits `writes`. This claim does not draw a second array.

**How the email carries it.** `dispatchEmailLive` is the firm-branded CEM. When `input.contactId` is set, that send includes `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click`. The URI is bound to that `firmId` and that `contactId`. The POST writes only when the binding checks. A failed check does not upsert and does not dispatch. The Resend webhook’s fail-open, when `RESEND_WEBHOOK_SECRET` is unset, is not this check. A public URI that accepted an unbound pair would silence a contact the email was not sent to. When `contactId` is null, the send has no header and there is no pair to write. SMS is not this header. The OTP mailer is not `dispatchEmailLive`.

A second POST runs the same statement and dispatches again. `handleConsentSilence` already does that on a second call. This claim does not add a receipt table.

**What is not this commit.** `handleResendWebhook` maps `email.complained` to event class `complaint`, inserts `messaging_events`, and does not touch `consent_records`. The leaf does not name that complaint. This claim does not silence it. The hard-bounce upsert stays claim 42: same pair, source `hard-bounce`, no dispatch. The stand-in `silence` ignores its source argument and keeps the previous basis. That map is not the row the gate reads. `registry.ts` still tags `listUnsubscribe` as the stand-in.

**Rejected alternatives.**

- Leave `accept` with no server writer. The leaf already named the control, and the stand-in already calls silence with the firm, the contact, and the source. The pair the gate reads is the server statement.
- Write a third upsert that does not dispatch, the way the bounce does. The leaf calls one-click the same commit as Silence / Opt out. That commit is `POST /consent/silence`, which dispatches. Claim 15 left the bounce off that event because a bounce is not the opt-out. One-click is the opt-out.
- Look the pair up only after Resend returns `provider_message_id`, and put that id in the header. The header is on the send. The provider id does not exist yet. The binding is the firm and the contact the function already has.
- Accept the POST with no binding check, matching the webhook when the secret is unset. The webhook URL is the provider’s callback. This URI is on the message. An unbound POST is not the email’s contact.
- Mint a receipt table so a retry does not dispatch twice. The silence route has no such table. A repeated silence is the same upsert and another dispatch. Claim 2 already allows a later firing to enroll again.
- Fold `email.complained` into this source. The handler records `complaint` and stops. The leaf’s control is the one-click. Whether that complaint is a silence, a quarantine, or only the event row was not decided.

No founder question. One-click is the silence commit the leaf already named, for the firm and contact on that email. A silenced pair is what the gates already deny. A complaint event is not this write. Who is placed on launch day stays unfilled.

**Evidence:** `src/app/wire/standins/listUnsubscribe.ts` `accept`. `src/app/wire/standins/consentSilence.ts` `silence`. `src/app/wire/registry.ts` `listUnsubscribe`. `stores.ts` `handleConsentSilence`. `routes.ts` `POST /consent/silence`, `POST /webhooks/resend`. `webhooks.ts` `mapClass`, the `bounce_hard` upsert, the `complaint` class. `dispatchSend.ts` `dispatchEmailLive`. `docs/register/how/contact-silence.md`. Claims 15, 25, 41, and 42.

**Live.** `accept` still has no caller. `dispatchEmailLive` still sets no List-Unsubscribe header. `handleResendWebhook` still does not write `consent_records` for `email.complained`. No migration was written.

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
- `loadWriteRow` as the reader of the handle (claim 7). The earlier sentence was that several tables the product already puts on a handle come back as null. Claim 10 specifies the load for `engagement_records`, `fact_writebacks`, `meeting_booked`, and `wait_occupancy` as `WHERE id = pointer.id`. The live function still returns null for them. The generic action still pushes the contact id. `PERSON_WRITE_TABLES` still omits the three append tables, so the If does not yet split them per contact. The same function also returns null for `eligibility_evaluations`, `eligibility_results`, `signals`, and `motion_decisions`. Claim 12 applies that same id predicate to those four. The live function still has no branch for them. It also returns null for `campaign_failure`. Claim 13 applies that same id predicate. The live function still has no branch for it. It also returns null for `halt_records`. Claim 14 applies that same id predicate to the contact-scope firing. The live function still has no branch for it. It also returns null for `consent_records`. Claim 15 does not apply that id predicate. The table has no `id` column. The specified re-read is `contact_id` plus the walk’s firm, the primary key. The live function still has no branch for it. It also returns null for `ct_firms`. Claim 16 applies the id predicate. The primary key is `id`. The live function still has no branch for it.
- `resolveFormStamp` and `onCompletionWrite` as the attribution of a completion (claim 3). They answer “newest pursuit for this person.” The live send does persist the click’s stamp. The click path does not read it back as the enrollment to advance.

**Individually reasonable, cannot work together**

- Packet 022 §2.4’s newest-enrollment detection, and packet 022 §2.5’s escalation, which inserts a second enrollment (claims 2 and 3).
- `event_write_set` naming `engagement_records` for `objective_met`, and `loadWriteRow` not loading that table (claim 7). Claim 10 specifies the load. Claim 11 specifies the handoff: `payload.writes` carries the engagement id and the enrollment id. The live function still returns null, and the live dispatch still omits `writes`. The write-set and the listener still do not meet in the running code.
- `event_write_set` naming `eligibility_evaluations`, `eligibility_results`, `signals`, and `motion_decisions` for `eligibility.changed`, and `runContactEligibilityCascade` dispatching that event with no `writes` (claim 12). The cascade does insert those four rows before the dispatch. Claim 12 specifies the array. The live dispatch still omits it, and `loadWriteRow` still returns null for the four, so the write-set and the listener still do not meet in the running code.
- That same function, when the dispatch fires no workflow, inserting `enrollment`, `active_attempts`, and `engagement_records`, which this write-set does not name (claim 12). Those inserts are not the listening pointer. The enroll was not specified.

### Revision — claim 43

The sentence that the enroll was not specified stands as the gap. Claim 43 specifies who is enrolled and which template. The three tables stay off `eligibility.changed`’s `writes`. The live loop still enrolls every contact into `tpl.reactivation.v1` and still does not read `consent_records`.

- `handleOnboardingFire`, when `audit.completed` fires no workflow, calling `enrollAndActuate` for every ready contact, and claim 44, which does not call it when that contact’s pair for the session firm has `silenced` true or `status` `silenced`. The live loop still does not read `consent_records`. A silenced ready contact still gets an enrollment and an open attempt. The dispatch still omits `writes`.

- The three tick sends passing purpose `cem` for every open attempt, and claim 45, which passes `opt-in` when that attempt’s `sequence_template.sequence_class` is `optin`. The live calls still pass `cem`. A contact with no basis still receives the day-1 primer and is still denied the day-1 announcement. `normalizeTemplateCells` still offsets that announcement by `day × 24h`. Claim 45’s offset is the difference from the first cell’s day, which is 0 for the two day-1 cells. The live announcement is still due one day after enroll. `call_agent` still classifies the purpose with `sequenceClassForAgent`.

- `dispatchScheduleTriggers` inserting a `schedule` run on every tick with no contact ids and `anyPass: true`, and claim 47, which starts one run in a UTC minute `schedule.cron` matches, walks claim 17’s audience for the trigger’s firm, and does not set `anyPass`. The live function still ignores the cron and still walks nobody.

- `executeGet` for contacts `every` selecting `contact_records` with no `firm_id`, and any `mappedSlots` chip skipping that read, and claim 48, which reads the walk’s firm and uses a chip as the class value of a select. The live query is still unscoped. A chip still replaces the module read. An empty contacts read still leaves `ctx.contactIds` in place. Firms, audits, imports, and agents `every` are still unscoped.

- `listUnsubscribe.accept` having no caller, and claim 49, which writes the silence statement for the email’s firm and contact with source `list-unsubscribe` and dispatches `consent_records.opt_out`. The live send still has no List-Unsubscribe header. The complaint class still does not write the pair.

- Approve now calling `resumeWaitRun` without the run’s `trigger_label`, and claim 46, which passes that column the way the tick already does. The live desk call still defaults the walk to `wait-resume`. The outgoing nodes themselves already run.

- `event_write_set` naming `campaign_failure`, and `escalateAttemptWindow` dispatching that event with no `writes` (claim 13). The insert already stored the `cfail-` id. Claim 13 specifies the array. The live dispatch still omits it, and `loadWriteRow` still returns null, so the write-set and the listener still do not meet in the running code.
- `localRefFromPayload("campaign_failure")` reading `campaign_id`, and that dispatch not carrying `campaign_id` (claim 13). The column is on the row the insert wrote. Claim 13 puts that column’s value on the payload. The live payload still omits it, so a trigger that selected a campaign still does not match.
- `event_write_set` naming `halt_records`, and the contact-scope dispatch in `handleHaltCommit` omitting `writes` (claim 14). The insert already stored the `halt-` id. Claim 14 specifies the array. The live dispatch still omits it, and `loadWriteRow` still returns null, so the write-set and the listener still do not meet in the running code. The firm-book branch does not dispatch. Claim 14 leaves that branch as the gate. It is not a second missing array.
- `event_write_set` naming `consent_records` for `consent_records.opt_out`, and `handleConsentSilence` dispatching that event with no `writes` (claim 15). The upsert already stored the pair. Claim 15 specifies the array: `id` and `contact_id` are both that contact, and the walk’s firm is the other half of the key. The live dispatch still omits `writes`, and `loadWriteRow` still returns null, so the write-set and the listener still do not meet in the running code. `handleConsentSet` does not dispatch. Claim 15 leaves that route as the basis write. It is not a second missing array.
- `event_write_set` naming `ct_firms`, and `handleMachineProvision` dispatching that event with no `writes` (claim 16). The upsert already stored the firm id. Claim 16 specifies the array: one element, `ct_firms` and that id, no `contact_id`. The live dispatch still omits `writes`, and `loadWriteRow` still returns null, so the write-set and the listener still do not meet in the running code. The same handler also writes `firms`, `campaign_states`, `users`, sometimes `access_links`, and an `audit_events` row. Claim 16 leaves those off the array. They are not a second missing `ct_firms` element.
- `select_from` on a firing that passed no contact ids, and the live branch walking `audience_contact_ids` with no `firm_id` predicate (claim 17). The specified people are the stored ids that are `contact_records` of the firing firm. The live arm does not apply that cut. The every-firm arm’s `WHERE firm_id = $1` already matches claim 17.
- The contact arm of `isHaltBlockingNew`, which matches any active contact halt for that `contact_id`, and claim 18, which also requires that row’s `firm_id` to be the enroll’s firm. The live query still omits `firm_id`. Another firm’s row still blocks the insert.
- The contact arm of `consentAndHaltGate`, and `handleHaltIsContact`, which match any active contact halt for that `contact_id`, and claim 19, which also requires that row’s `firm_id` to be the firm the caller is acting as. The live queries still omit `firm_id`. The real `isContactHalted` still passes no firm. The stand-in’s `isContactHalted` still ignores `firmId`. Another firm’s row still denies the send and still makes the boolean true.
- `writeEngagement` returning the inserted id, and the generic action pushing `id: contactId` (claim 10). The row exists. The pointer names the contact. The specified load looks up the pointer id.
- `chainWrites` for every node (the in-memory walker), and resume forwarding only the wait’s writes (claim 6).
- The cursor as a once-only latch (packet 022 §2.3), and “Open in Now” writing `campaign_id` (claim 4).
- Re-reading the module’s row (the primitive), and upserting that row on the next audit (claim 8).
- `handleAuditRunGet` filtering verdicts by `details.auditRunId`, and `auditRun.ts` replacing `details` on the next audit (claim 8).
- A click predicate that treats `campaign_objective_id` as enough, and two enrollments on one campaign sharing that id (claims 2 and 3). The tick then advances both while both attempts are open.
- The escalation writing a send engagement only when `send.ok`, the cell advance filing a deny as `send_dry_run` with the `send` object stored, and the wait arm filing every result as `send_dry_run` with no `send` object (claim 21). The same `DispatchResult` is three files. Claim 21 names one row, kind `send_denied`, for `ok: false`. The live writers still do not write it.
- `enrollAndActuate` choosing that same kind from `shouldLiveSend` and storing `subject` and `bodyText` on a result with `ok: false` (claim 22). Claim 22 names `send_denied` for that result and takes the copy off the payload. An allowed result takes its kind from the `DispatchResult`. The live writer still labels from `shouldLiveSend`.
- `consentAndHaltGate` selecting `consent_records` by `contact_id` alone with `LIMIT 1`, and claim 23, which also requires `firm_id` of the firm the send was given. The live query still omits `firm_id`. Another firm’s row can still deny or allow the send. This firm’s row can still be missed.
- `handleContactSeatConsent` leaving `status` unassigned on conflict, and claim 26, which sets `unsequenced` when the stored value is `silenced`. The live statement still omits `status`. A backfilled row stays denied after Agree until that assignment is written.
- `projectSeat` setting `now.state` to `form` and attaching form fields when `source` is `ignored`, `basis` is `none`, and the objective kind is `form`, and claim 28, which leaves that Now `empty` and omits the fields. The live branch still sets `form`. The mirror still sets `form` for `camp.optin.day` and `camp.reeng.nudge`.
- `handleContactSeatFacts` inserting `fact_writebacks`, deleting the matching `missing_fact_signals` row, running the eligibility cascade, dispatching `fact_writebacks`, and calling `onCompletionWrite` without reading `consent_records`, and claim 29, which does none of those when the row for the link’s contact and firm is missing or `basis` is `none`. The live handler still does not read the row. `standInContactSeat.facts` and `factsContact` still drop the answered keys, including for `cr-harbor-4`.
- `handleFactWriteback` inserting `fact_writebacks`, deleting the answered `missing_fact_signals` row, inserting further missing-fact rows from `missingFieldKeys`, running the eligibility cascade, dispatching `fact_writebacks`, and calling `onCompletionWrite` without reading `consent_records`, and claim 30, which does none of those when the row for the session firm and the body contact is missing or `basis` is `none`. The live handler still does not read the row. `standInMachineApi.writeFact` still records the write.
- `projectSeat` setting `now.state` to `meeting` when the objective kind is `meeting` and the consent ask is passed, including when `silenced` is true, and `handleContactSeatMeeting` inserting, dispatching, completing, and nullifying without reading `consent_records` or that kind, and claim 37, which does none of those unless the contact is invited and not silenced. The live projection still sets `meeting`. The live handler still inserts. The mirror still sets `meeting` for `camp.react.meeting` without reading `silenced`.
- `handleMeetingBook` inserting `meeting_booked`, dispatching, completing, nullifying, and writing the side engagement without reading `consent_records` or `campaign_objective.kind`, and claim 38, which does none of those unless the same invitation test passes. The live handler still inserts. `standInMachineApi.bookMeeting` still pushes.
- `writeBackContactFacts` calling `applyFactsToMeetingsStore` with the submitted facts when `writeFact` throws, and calling `addMeeting` for a client the local array does not already hold, and claim 39, which does not paint on that throw and does not add a meeting from a fact. The live catch still paints. The live function still adds `m-facts-` plus the client id.
- `eventKindProse` returning `Sent` for `send_denied` and for `send_dry_run` because both contain `send`, and claim 40, which leaves those two to the function’s spaced leftover. The live helper still returns `Sent`. `titleFor` still has no `send_denied` case. Claim 21 already names that default.
- `standInContactSeat.consent` and `consentContact` copying `prev?.silenced`, and claim 41, which sets `silenced` false on both. The live functions still copy the previous boolean. The server seat statement already sets it false. Claim 26 is that statement.

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

### Revision — claim 43

The sentence that the reactivation enroll remains unspecified stands as the gap. Claim 43 specifies it. The live dispatch still omits `writes`. The live fallback still enrolls every contact into the platform template.

**Onboarding’s `audit.completed`.** `handleOnboardingFire` dispatches that event name with no `writes` and no audit-run id. The audit module’s own completion does pass `result.writes`. The onboarding payload was seen while checking that pattern. It was not specified.

### Revision — claim 44

The sentence that the onboarding payload was not specified stands as the gap. Claim 44 specifies it. This firing inserts none of the audit tables, so `writes` stays absent and the payload keeps no audit-run id. The ready contact ids stay the `contactIds` argument, including a silenced contact. The silence filter is the fallback enroll, not this array. The live dispatch still omits `writes`.

**What the eligibility row’s pass is derived from.** `runContactEligibilityCascade` sets `anyPass` to the constant `true`, stores that on `eligibility_results.any_pathway_pass`, and stores `motion` `reactivation`. It does not read `rule_eligibility_pathway` or the in-memory eligibility pack. Claim 12 names the row that insert wrote. It does not decide the derivation. Same shape as the parked `sequence_ready.ready` derivation, and a different writer.

**The reactivation branch on the seed graph.** `wf-eligibility-reactivation` (`supabase/seeds/003_canonical_workflows.sql`) has a branch labelled “Reactivation-worthy?” with `filterSummary` `reactivation-worthy`, and with no compare and no `pickTable`. `evalIfPick` with no compares returns false. `evalBranch` reads `eligibilityPass` and `triggerPayload.motion`, and the walker does not call it. Claim 12’s pointers are what a configured If reads. Placing them does not make this branch read `motion_decisions.motion`. That pick was not specified.

**An empty eligibility firing and the firm book.** When `opts.contactIds` is empty, claim 12’s `writes` is an empty array. `dispatchEventToWorkflows`, for an every-firm audience with no contact ids, selects every `contact_records` id for the firm and walks those contacts. That list is not the four inserted rows. It was seen while reading the dispatch. It was not specified.

### Revision — claim 14

Claim 14 specifies the contact-scope `halt_records` array: one pointer, `halt_records` and the `halt-` id the insert stored, `contact_id` from that row’s column. The live contact dispatch still omits `writes`. The firm-book branch, including the founder kill-switch, stays the gate and does not dispatch. Lift updates the same row and does not start a second firing. The contact-scope gate’s missing firm predicate was seen on `consentAndHaltGate`, `isHaltBlockingNew`, and `handleHaltIsContact`. It is another reader of `halt_records`. It was not specified. The paragraph above stands for the empty-list walk. A contact-scope halt body that omits `contactId` still reaches that walk. Claim 14 does not specify it.

### Revision — claim 17

Claim 17 specifies the empty-list walk the paragraph above left open. The people are the audience inside the firing firm. They are not the four eligibility rows, and they are not a `contact_records` write. The contact-scope halt gate’s missing `firm_id` predicate stays unspecified.

### Revision — claim 18

Claim 18 specifies that predicate for `isHaltBlockingNew`. A contact halt blocks the enroll when the row is active, `scope` is `contact`, `contact_id` is the person, and `firm_id` is the enroll’s firm. The live contact arm still omits `firm_id`. `consentAndHaltGate` and `handleHaltIsContact` were not retuned. The paragraph above stands for the empty-list walk.

### Revision — claim 19

Claim 19 specifies the contact arm of `consentAndHaltGate` and `handleHaltIsContact`. A contact halt denies the send, and makes the check true, when the row is active, `scope` is `contact`, `contact_id` is the person, and `firm_id` is the firm the caller is acting as. The live queries still omit `firm_id`. The empty-list walk is unchanged.

### Revision — claim 15

Claim 15 specifies the `consent_records.opt_out` array: one pointer, `consent_records`, `id` and `contact_id` both the contact the upsert used, and the walk’s firm as the other half of `(contact_id, firm_id)`. The live silence dispatch still omits `writes`. `handleConsentSet` and the seat Agree / Ignore stay off this event. The hard-bounce upsert and the workspace opt-out write the same pair and do not dispatch. They were not specified as firings. The send gate’s consent read still has no `firm_id` predicate. The silence upsert still does not assign `status`. Those two are other readers and another write of the row the pointer names. They were not specified. `consent_records.sequenced` still has no dispatch.

### Revision — claim 16

Claim 16 specifies the `ct_firms` array: one pointer, `ct_firms` and the firm id the upsert stored, with no `contact_id`. The re-read is `WHERE id = pointer.id`. The live provision dispatch still omits `writes`. `firms`, `campaign_states`, `users`, `access_links`, and the `firm.provisioned` audit stay off that array. `handlePoolAllocate` still updates the same id and does not dispatch. `website` and `role` are still echoed on the HTTP body and still not inserted. The paragraph above stands for the empty-list walk. This provision dispatch does not pass `contactIds`, and the pointer has no person, so the every-firm fill is the only person list a listening run of this event can get. Claim 16 does not specify that fill.

**The person list on a firing that passes no contact.** `handleMachineProvision` does not pass `contactIds`. Claim 16’s pointer has no `contact_id`. `dispatchEventToWorkflows` then fills the walk’s person list from the firm’s `contact_records`, or from the workflow’s `select_from` audience. Claim 12 saw that fill when an eligibility list was empty. Claim 14 saw it when a contact-scope halt body omitted `contactId`. The firm firing is the same branch, and it is the one whose write has no person of its own. That fill was not specified. It is not an extra element of `writes`.

### Revision — claim 17

Claim 17 specifies that fill. Every firm walks `contact_records` of the firing firm, and the run starts even when the book is empty. Select from walks the stored ids that are contacts of that firm, and does not start when none are. The live `select_from` arm still does not apply the firm cut. The list is still not an element of `writes`.

**Provision’s other stores.** The same request writes `firms`, `campaign_states`, and `users`, and it may insert `access_links` and `audit_events`. Claim 16 leaves them off the pointer because `event_write_set` names `ct_firms` alone. `website` and `role` are on the HTTP body and are not inserted by this handler. `handlePoolAllocate` updates pool columns on the firm id this pointer names, and it does not dispatch. Those are other writers of the provision, and of the row the listener re-reads. They were not specified as firings.

**The other contact-halt readers.** Claim 18 specifies the contact arm of `isHaltBlockingNew`. `consentAndHaltGate` still selects an active contact halt by `contact_id` alone, after the firm-book check and the consent check. `handleHaltIsContact` is the same contact select, and the real `isContactHalted` calls it with no firm. The stand-in’s `isContactHalted` matches `contactId` and does not read `firmId`. `call_agent` omits `fireFirstStep`, and `enrollAndActuate` fires the first step when that flag is not false, so an enroll claim 18 allows still reaches the send gate. Those readers were not specified.

### Revision — claim 19

The paragraph above is the gap as session 012 left it. The sentence that `call_agent` omits `fireFirstStep` does not match the call: `walkValidatedWorkflow` passes `fireFirstStep: true`. An omitted flag would also fire, because the condition is `!== false`. Claim 19 specifies the two readers. The contact arm denies the send only when the halt’s `firm_id` is the firm the send was given. `handleHaltIsContact` and the stand-in’s `isContactHalted` are true only for a halt of the firm that caller is acting as: `input.firmId` on the stand-in send, `standInFirm()` on the stand-in enroll. The live queries still omit the firm. The consent select in the same function was not specified.

**A send of an attempt that is already open.** H1 stops new enrollments and new sends, and leaves in-flight attempts to finish naturally (`docs/register/PROTOTYPE-COHESION-ANALYSIS.md`, `docs/register/PROTOTYPE-COHESION-PLAN.md`). The component map parked the behavior a consultant halt forces on an in-flight motion (`docs/register/SYSTEM-COMPONENT-MAP.md` P1). The live tick still calls `consentAndHaltGate` from the escalation, the cell advance, and the wait-until send, each with `attempt.firm_id`. Claim 19 is the firm on that contact arm. It does not decide whether that tick send is a new send or the attempt finishing. The engagement kind stored when the gate denies was seen on those writers and was not specified.

### Revision — claim 20

The paragraph above is the gap as session 013 left it. Claim 20 decides the send. The cell advance, the wait-until send, and the escalation are new sends. The gate denies them. The attempt stays `open`. The tick does not abort it and does not roll back the attempt writes made before the send. The engagement kind on that deny is still unspecified. P1’s abort, and its interaction with one client, one motion and the live-override, stays the refinement H1 postponed. `SYSTEMS-STORY` still has no halt rule. Claim 20 does not write that abort. The consent select in the gate was not specified.

### Revision — claim 21

The sentence that the engagement kind on that deny is still unspecified stands as the gap session 014 left. Claim 21 specifies the row: `send_denied`, with the `DispatchResult` on the payload, and with no subject and no body. The live three writers still disagree. The first step inside `enrollAndActuate` still labels from `shouldLiveSend` and still stores a deny on that row. Claim 21 does not label that write. The operator helper `eventKindProse` still returns `Sent` for any kind that contains `send`. That helper was not retuned. The Activity Sent and Delivered tags still read attempt state.

### Revision — claim 40

The sentence that `eventKindProse` still returns `Sent` for any kind that contains `send` stands as the live helper. Claim 40 decides the operator column. `send_denied` and `send_dry_run` do not take that arm. `send_live` and `sent` still return `Sent`. `titleFor` is not given a `send_denied` case. Claim 21’s default remains the complaint-desk title. The Activity tags still read attempt state.

### Revision — claim 22

The sentence that the first step still labels from `shouldLiveSend` stands as the gap session 015 left. Claim 22 specifies that row. `ok: false` is `send_denied`, with this writer’s step keys and the `DispatchResult`, and with no subject and no body. An allowed result is `send_live` or `send_dry_run` from the result. `enrollment.payload.dryRun` stays `!shouldLiveSend`, written before the send returns. The live writer still uses the cohort flag as the kind. The consent select was not specified. Whether the enroll insert should have been blocked was not decided.

### Revision — claim 23

The sentence that the consent select was not specified stands as the gap session 016 left. Claim 23 specifies the row: `contact_id` and the `firmId` the gate was given. The live query still omits `firm_id`. The arms on `silenced`, `status`, `basis`, and `purpose` were not retuned. The silence upsert still does not assign `status`. `consent_records.sequenced` still has no dispatch. `handleConsentGet` still selects by `contact_id` alone. The stand-in map is still one slot per contact id. Those reads were not specified.

### Revision — claim 24

The sentence that `handleConsentGet` still selects by `contact_id` alone stands as the description of the live query, and claim 24 makes that the specification of the route. The get returns one row for the contact id, or the defaults `none`, false, and null. It is not the send’s pair. No caller of the route is acting as a firm. The live query is unchanged, and it matches this claim. The send’s live query still omits `firm_id`. The silence upsert still does not assign `status`. `consent_records.sequenced` still has no dispatch. The stand-in map is still one slot per contact id. Those were not specified.

### Revision — claim 25

The sentence that the silence upsert still does not assign `status` stands as the live statement, and claim 25 makes that the specification. An insert keeps `unsequenced`. A conflict keeps the previous `status`. The boolean arm still denies. The live statement already matches this claim. `consent_records.sequenced` still has no dispatch. A later consent that clears `silenced` and leaves a `status` of `silenced` was not specified.

### Revision — claim 26

The sentence that a later consent can clear `silenced` and leave `status` `silenced` stands as the gap session 019 left. Claim 26 specifies the seat conflict. When the stored value is `silenced`, it becomes `unsequenced`. The live conflict still omits `status`. The silence upsert is unchanged. `consent_records.sequenced` still has no dispatch.

**An import that reuses a contact id.** `handleContactImport` inserts `ON CONFLICT (id) DO UPDATE` and does not assign `firm_id` on the update. The id stays on the first firm’s book row. The dispatch still puts that id in `contactIds` for the importing firm. Claim 17 keeps a non-empty list. Claim 18 judges the enroll by the importing firm’s halt, not by the first firm’s. The conflict update was not specified.

**Ignore and the deeper form.** Claim 26’s statement also stores Ignore: `basis` `none`, `silenced` false, `source` `ignored`, and the same `status` move when the word was `silenced`. `projectSeat` then treats `source` `ignored` as not the consent ask. When the enrollment’s objective kind is `form`, `now.state` becomes `form`, and the form fields are included because `silenced` is false. `docs/register/how/contact-consent.md` says Ignore writes the no-deeper state and deeper collection forms do not open. That paint was seen while reading what the seat shows after the statement. It was not specified. It is not the status word.

### Revision — claim 28

The paragraph above is the gap session 021 left. Claim 28 specifies the Now pane. For that Ignore row, when the objective kind is `form`, `now.state` stays `empty` and the form fields are not included. The live branch still sets `form`. The status word is unchanged.

### Revision — claim 27

The sentences that `consent_records.sequenced` still has no dispatch stand as the live call, and claim 27 makes that absence the specification of the event. No ongoing statement sets `waitlisted` or `sequenced`. The one-time migration `UPDATE` still sets `sequenced` from `basis` and still does not dispatch. The seat consent is still not that writer.

**Sign-up met and the consent rung.** `SYSTEMS-GOAL` draws sign-up met as the campaign goal that lands on `consent sequenced`, and the same row says the cascade does not write that status. Claim 27 says that drawing is not a dispatch and not a status write. `obj.optin.day` still completes on `fact_writebacks`, and the cursor advance still dispatches `objective_met`. What that objective would write onto `consent_records`, beyond the absence claim 27 records, was not given a second formula. It is not this event.

### Revision — claim 27, re-read

The sentence that what `obj.optin.day` would write onto `consent_records`, beyond the absence claim 27 records, was not given a second formula, stands as the question the previous handoff still listed. The writers of `consent_records` under `server/` are the seat, the send’s select, the event-test sample, the silence and consent stores, the hard-bounce upsert, and the sequenced matcher in `workflowWalk.ts`. `advanceEnrollmentCampaign` is not among them. Claim 27 already says the goal sentence is not a status write. There is no second formula. The launch-day audience ask stays the question that file said not to fill. It was not answered.

**Who receives launch day.** `SYSTEMS-GOAL` already asks whether launch day is only for contacts who were waitlisted, and it says not to fill that ask. Claim 27 found no writer of `waitlisted`, so the fork has no stored signal on `consent_records.status`. The ask stays open. It was not answered. It is not this event.

### Revision — claim 29

The sentence in claim 28 that `handleContactSeatFacts` still accepts answers and was not specified stands as the gap session 022 left. Claim 29 specifies the write. A missing consent row, or `basis` `none`, including `source` `ignored`, does not insert `fact_writebacks` and does not run the cascade, the dispatch, or `onCompletionWrite`. The live handler still inserts. The pane and the status word are unchanged.

### Revision — claim 30

The sentence in claim 29 that `handleFactWriteback` still inserts for the session firm and the body contact, and that the consent predicate was not specified, stands as the gap session 023 left. Claim 30 specifies that acceptor. A missing consent row, or `basis` `none`, does not insert `fact_writebacks`, does not change `missing_fact_signals`, and does not run the cascade, the dispatch, or `onCompletionWrite`. `body.source` does not keep the write. The live handler still inserts. The seat write, the pane, and the status word are unchanged.
