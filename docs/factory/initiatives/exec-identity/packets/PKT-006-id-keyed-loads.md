# PKT-006 — Three id-keyed tables load by primary key, and the generic action stores that key

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 10, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The `engagement_records` load is PKT-004. This packet is the other three loads, the person split for the three append tables, and the generic action pointer.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes

## Intended behavior

`loadWriteRow` loads `fact_writebacks`, `meeting_booked`, and `wait_occupancy` with `SELECT * FROM <table> WHERE id = pointer.id`. No `firm_id`, no `contact_id`, no `ORDER BY`, no “latest”. No row with that id returns null. A miss does not try `contact_id`.

`engagement_records`, `fact_writebacks`, and `meeting_booked` join `PERSON_WRITE_TABLES`. `wait_occupancy` is already in that set and stays there. `personTableOf` already consults the set for the If and the Switch. This packet adds the three names. It does not add a second split. The If tests each contact against the pointer of that table whose `contact_id` is that contact, then this load reads that pointer’s id. The row id is not a person. When several pointers share one contact, the existing `find` still takes the first. This packet does not retune that find.

The action fallthrough that runs for `manage_lists`, `assign_task`, and `notify_consultant` keeps the `engagement_records` insert. The pointer’s `id` is the string `writeEngagement` returns. `contact_id` remains the contact. One contact, one insert, one pointer.

`call_agent`, `ascribe_tag`, and `run_audit` return before that fallthrough. An in-app affordance other than `run_audit` or `ascribe_tag` still commits an empty write list and does not call `writeEngagement`.

## Existing behavior

`loadWriteRow` returns null after the tables it already knows. The three tables are not among them:

```655:699:server/wire-service/workflowWalk.ts
async function loadWriteRow(
  pool: Pool,
  firmId: string,
  w: RunWrite,
): Promise<Record<string, unknown> | null> {
  const contactId = w.contact_id ?? w.id;
  // ... sequence_ready, reachability_verdicts, contact_records, contact_tag,
  // audit_runs, import_batch, enrollment, missing_fact_signals ...
  return null;
}
```

Each of the three tables is `id TEXT PRIMARY KEY` (`supabase/migrations/004_machine_tables.sql` for `fact_writebacks`, `supabase/migrations/007_meeting_booked.sql`, `supabase/migrations/024_wait_occupancy.sql`). `wait_occupancy` also has `UNIQUE (workflow_run_id, wait_node_id, contact_id)`. That triple is how the wait writers find the row. It is not the load predicate.

The person set omits the three append tables. `wait_occupancy` is already a member:

```199:206:server/wire-service/workflowWalk.ts
const PERSON_WRITE_TABLES = new Set([
  "sequence_ready",
  "reachability_verdicts",
  "contact_records",
  "contact_tag",
  "enrollment",
  "wait_occupancy",
]);
```

When the compared table is not in that set, `evalIfPick` evaluates once and, on a pass, sends every `ctx.contactIds` down the true branch (`workflowWalk.ts`). The contact pick is the first match:

```870:871:server/wire-service/workflowWalk.ts
    const w = contactId
      ? picked.find((row) => row.contact_id === contactId || row.id === contactId) ?? picked[0]
```

The rule operand’s latest fact, by firm, contact, and `field_key`, is a different reader (`resolveRuleOperand` in `workflowWalk.ts`). It is not this load.

The generic action ignores the id `writeEngagement` returns. `writeEngagement` inserts `eng-` plus a uuid and returns that string (`server/wire-service/cascade.ts`). The fallthrough pushes the contact id:

```1502:1511:server/wire-service/workflowWalk.ts
        for (const contactId of ctx.contactIds) {
          await writeEngagement(pool, opts.firmId, contactId, actionType, {
            workflowId: opts.workflowId,
            runId: opts.runId,
            label: data.label ?? null,
            formQuestionIds: data.formQuestionIds ?? [],
          });
          writes.push({ table: "engagement_records", id: contactId, contact_id: contactId });
```

The in-app early return is already an empty write list (`workflowWalk.ts`, `inAppAffordance`).

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof.

1. `loadWriteRow` for `fact_writebacks`, `meeting_booked`, and `wait_occupancy` returns the row whose `id` is `pointer.id`, or null when that id is absent. The statement has no `firm_id`, no `contact_id`, and no `ORDER BY`.
2. A pointer whose `id` misses does not load a row by `contact_id`.
3. `PERSON_WRITE_TABLES` contains `engagement_records`, `fact_writebacks`, and `meeting_booked`. `wait_occupancy` remains a member.
4. An If whose chip table is one of those three, with two contacts on the run, tests each contact against the pointer whose `contact_id` is that contact. A pass for one contact does not put the other contact on the true branch.
5. Two pointers of the same table and the same `contact_id` still resolve to the first. The find is unchanged.
6. For `manage_lists`, `assign_task`, and `notify_consultant`, each contact produces one `engagement_records` pointer. Its `id` is the string `writeEngagement` returned. Its `contact_id` is that contact.
7. `call_agent`, `ascribe_tag`, and `run_audit` do not take that fallthrough.
8. An in-app affordance other than `run_audit` or `ascribe_tag` still commits no writes and does not call `writeEngagement`.
9. `resolveRuleOperand`’s latest-fact query is unchanged.

## Dependencies

PKT-004 owns `SELECT * FROM engagement_records WHERE id = pointer.id`. This packet does not add that statement. Until that loader is present, an engagement field read is still null. The person split still routes contacts.

Claim 11’s fact and meeting arrays are PKT-007 and PKT-008. Claim 12’s four eligibility loads are PKT-009. This packet does not add those branches.

The approval wait already pushes `wait_occupancy.id` from `RETURNING id`. This packet does not change that insert.

## Out of scope

The desk list `handleEngagementRecordsList`. `objectiveSatisfiedBy`. Minting a list, a task, or a notify table. Removing the engagement insert. A `firm_id` predicate. The audit pair. The chip filter that would choose among several rows for one contact. Launch Agent. No plate.

## Plates

None.
