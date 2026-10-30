# PKT-014 — A firing with no contact ids walks that automation’s audience inside the firing firm

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 17, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`. The revision under claim 18 leaves this audience branch unchanged.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes  
**UI:** none

## Intended behavior

`dispatchEventToWorkflows` still matches triggers before it builds a person list. `localAxesMatch` still reads the firing’s own `contactIds` and `payload.contactId`. It does not read the list this branch is about to build. A trigger with `local_contact_ids` set does not match a firing that named no person. That workflow does not start, and it does not receive the audience.

For a workflow that matched, `audience_scope` still comes from `workflow`. `select_from` is still the only scope that narrows. Null and every other value stay `every_firm`. The dispatcher still does not read `workflow_trigger.scope` or `scope_contact_ids`. `materializeTriggersFromGraph` still stores `scope` `every_firm` and an empty `scope_contact_ids`.

No contact ids means the argument was omitted or the array is empty. `handleMachineProvision` omits it. `runContactEligibilityCascade` passes `opts.contactIds`, which is empty when the loop inserted nothing. `handleHaltCommit` omits it when a contact-scope body has no `contactId`. One branch covers all three. The branch does not read the event name.

When the firing passed no contact ids:

- `select_from`. The people are the stored `audience_contact_ids` that are `contact_records` rows with `firm_id` equal to `opts.firmId`. An id with no such row is not a person on this run. When none remain, the workflow does not start. There is no `workflow_run`.
- `every_firm`. The people are every `contact_records.id` with `firm_id` equal to that same firing firm. The statement has no `ORDER BY`. This packet does not add one. An empty book is an empty list, and the run still starts.

When the firing passed a non-empty list, both arms stay as they are. `every_firm` walks that list and does not query the book. `select_from` walks the intersection with `audience_contact_ids` and does not start when the intersection is empty. This packet does not add a firm predicate to that arm.

The list is the `contactIds` argument of `walkValidatedWorkflow`. It becomes `ctx.contactIds`. It is not copied onto `triggerPayload`. It is not an element of `payload.writes`. `writesFromPayload` does not read the walk argument. With a `writes` array present, the contact fallback does not run. Claim 16’s `ct_firms` pointer stays one element, the firm id, with no `contact_id`. An empty eligibility `writes` stays empty. A contact-scope halt pointer stays the halt row. This packet does not add `contact_records` beside those writes.

`call_agent` still enrolls each id in `ctx.contactIds` under `opts.firmId` and still passes `fireFirstStep: true`. `ascribe_tag`, when it has no chip and no `pickTable`, still tags that same list. `contactsForAudit` still uses `ctx.contactIds` when the list is non-empty, and its query still requires the walk’s `firm_id`. `evalIfPick` is not edited. A firm-row If still takes one branch, because `ct_firms` is not in `PERSON_WRITE_TABLES`, and leaves `ctx.contactIds` as it was.

`handleWorkflowCreate` still stores `audience_scope` and `audience_contact_ids` as given. This packet does not change that save. `handleSequenceEnrollContacts` still selects every `contact_records` row with no firm predicate and still enrolls each under `row.firm_id`. The in-memory fan-out in `src/app/wire/standins/machineApi.ts` still does not run the book query. For `select_from` it still uses the stored ids, unfiltered, and skips when that array is empty. For `every_firm` it still starts a run and does not pass a person list. `isHaltBlockingNew` is not edited. Claim 18 owns the contact arm’s firm predicate.

A later provision of the same firm id still dispatches. This branch runs again, on the contacts that firm has then. The audience rule does not distinguish the insert from the conflict.

## Existing behavior

The live branch fills `every_firm` from the firing firm and leaves `select_from` unfiltered when the firing passed no ids:

```1950:1962:server/wire-service/workflowWalk.ts
    let contactIds = opts.contactIds;
    const scope = row.audience_scope === "select_from" ? "select_from" : "every_firm";
    if (scope === "select_from") {
      const audience = row.audience_contact_ids ?? [];
      contactIds = (contactIds?.length ? contactIds : audience).filter((id) => audience.includes(id));
      if (!contactIds.length) continue;
    } else if (!contactIds?.length) {
      const book = await pool.query<{ id: string }>(
        `SELECT id FROM contact_records WHERE firm_id=$1`,
        [opts.firmId],
      );
      contactIds = book.rows.map((r) => r.id);
    }
```

The run insert is after that branch (`server/wire-service/workflowWalk.ts`). `triggerPayload` is `{ ...(opts.payload ?? {}), eventName, anyPass: true }`. `materializeTriggersFromGraph` writes `scope` `every_firm` and `ARRAY[]::text[]` (`server/wire-service/workflowWalk.ts`). `handleWorkflowCreate` stores the operator’s scope and ids (`server/wire-service/machine.ts`). `handleMachineProvision` omits `contactIds` (`server/wire-service/machine.ts`). `runContactEligibilityCascade` passes `opts.contactIds` (`server/wire-service/machine.ts`). `handleHaltCommit` passes `contactIds` only when `body.contactId` is set (`server/wire-service/stores.ts`). `call_agent` passes `fireFirstStep: true` (`server/wire-service/workflowWalk.ts`). The stand-in `select_from` arm uses the stored array with no firm predicate (`src/app/wire/standins/machineApi.ts`). `audience_scope` defaults to `every_firm` (`supabase/migrations/012_grain_audience_one_timer.sql`).

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof.

1. A firing that omits `contactIds`, and a firing that passes `[]`, use the same branch. The branch does not read the event name. `handleMachineProvision`, an `eligibility.changed` dispatch whose `contactIds` is empty, and a contact-scope `handleHaltCommit` whose body has no `contactId` all enter it.
2. `select_from` with no incoming ids walks the stored `audience_contact_ids` whose `contact_records.firm_id` is `opts.firmId`. An id from another firm, and an id with no `contact_records` row, are not on the run. When none remain, there is no `workflow_run`.
3. `every_firm` with no incoming ids walks every `contact_records.id` for `opts.firmId` and no other firm. The query has no `ORDER BY`. An empty book still inserts `workflow_run`, and that run’s person list is empty.
4. A non-empty incoming list is not replaced by the book. `every_firm` walks that list. `select_from` walks the intersection with `audience_contact_ids` and does not filter those ids by `firm_id`. An empty intersection does not start.
5. A trigger with `local_contact_ids` set does not match a firing that named no person. The filled audience is not used to satisfy that axis.
6. The walked ids are `ctx.contactIds`. They are not copied onto `triggerPayload`. They are not elements of `payload.writes`. Claim 16’s pointer is still one `ct_firms` id with no `contact_id`.
7. `call_agent` still passes `fireFirstStep: true` and `firmId: opts.firmId`. `handleWorkflowCreate` still stores the audience as given. `materializeTriggersFromGraph` still writes `scope` `every_firm`. The dispatcher still does not read that column.
8. `handleSequenceEnrollContacts` still selects `contact_records` with no firm predicate on the every-firm door. The stand-in fan-out is unchanged. `isHaltBlockingNew` is unchanged. No migration is added.

## Dependencies

The handle stays the firing’s writes. PKT-013’s firm pointer, PKT-009’s eligibility array, and PKT-011’s halt pointer are not repaired by this list. A listener that needs a row this firing did not write still fails closed.

PKT-004 still must not delete `writes` from a caller payload. This packet does not edit `dispatchEventToWorkflows`’s `anyPass` copy.

Claim 18 decides the contact arm of `isHaltBlockingNew`. This packet does not implement that predicate. Claim 47 is the schedule tick’s audience. This packet does not implement the cron.

## Out of scope

Putting the filled ids on `payload.writes` or on `payload.contactIds`. Adding `contact_id` to the `ct_firms` pointer. Adding `ct_firms` to `PERSON_WRITE_TABLES`. An `ORDER BY` on the book query. Satisfying `local_contact_ids` with the filled audience. Reading `workflow_trigger.scope`. Changing the audience save. The Agents every-firm enroll. The stand-in fan-out. The halt firm predicate (claim 18). The schedule tick (claim 47). Stripping `anyPass`. Launch Agent. No plate.

## Plates

None.
