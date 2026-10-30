# PKT-009 — An eligibility.changed firing places each inserted id on payload.writes

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 12, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes

## Intended behavior

`runContactEligibilityCascade` still loops `opts.contactIds` and still inserts one row of each write-set table per contact, then dispatches `eligibility.changed` once. The dispatch payload gains `writes` for every row that loop inserted.

`event_write_set` version 1 names `eligibility_evaluations`, `eligibility_results`, `signals`, and `motion_decisions` at ord 0 through 3. The array follows that table order. Inside one table the pointers follow `opts.contactIds`. One contact yields

`writes: [{ table: "eligibility_evaluations", id: <eval- id>, contact_id }, { table: "eligibility_results", id: <eres- id>, contact_id }, { table: "signals", id: <sig- id>, contact_id }, { table: "motion_decisions", id: <mot- id>, contact_id }]`.

Two contacts yield both evaluation pointers, then both result pointers, then both signal pointers, then both motion pointers. The ids are the variables the inserts already bind. Each pointer’s `contact_id` is the contact of that iteration. `firm_id` stays off the pointer.

The keys already on the payload stay. The cascade still sets them to `{ ...opts.eventPayload, anyPass: true, motion: "reactivation" }`. `writesFromPayload` gains no reader for `evaluationId`, `resultId`, `signalId`, or `motionId`. With `writes` present it returns those pointers and does not add `contact_records`.

An empty `opts.contactIds` inserts nothing. `writes` is an empty array. This packet does not change what the dispatcher does with an empty contact list.

The loop does not dedupe `opts.contactIds`. A repeated contact inserts a second quartet, and both ids are on the array. The existing `find` is not retuned.

`loadWriteRow` loads each of the four tables with `SELECT * FROM <table> WHERE id = pointer.id`. No `firm_id`, no `contact_id`, no `ORDER BY`, no “latest”. No row with that id returns null. A miss does not try `contact_id`. That is the predicate claim 10 locked. This packet adds the four branches. It does not change the predicate.

These four tables stay out of `PERSON_WRITE_TABLES`. Claim 52 puts them in the set the split consults. This packet does not.

The inserted `any_pathway_pass` stays the constant `true`. The motion expression stays `anyPass ? "reactivation" : "nudge"` with `anyPass` fixed true. Claim 7’s refusal of `anyPass` is not recut: the payload still sets `anyPass: true`.

The value returned to the caller stays `{ contactId, evaluationId, resultId, signalId, motionId, motion }` per contact. That object is the response. The dispatch does not receive it.

When `dispatched.length === 0`, the reactivation enroll stays. `enrollment`, `active_attempts`, and `engagement_records` from that enroll are not elements of `writes`. The enroll itself is not specified here.

## Existing behavior

The loop binds the four ids, then the dispatch omits `writes`:

```289:338:server/wire-service/machine.ts
  for (const contactId of opts.contactIds) {
    const evalId = `eval-${randomUUID()}`;
    // ... eligibility_results eres-, signals sig-, motion_decisions mot- ...
    cascade.push({
      contactId,
      evaluationId: evalId,
      resultId,
      signalId,
      motionId,
      motion,
    });
  }

  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: opts.firm,
    eventName: "eligibility.changed",
    payload: { ...opts.eventPayload, anyPass: true, motion: "reactivation" },
    contactIds: opts.contactIds,
  });
```

`loadWriteRow` returns null for all four (`server/wire-service/workflowWalk.ts`). Each table is `id TEXT PRIMARY KEY` (`supabase/migrations/004_machine_tables.sql`). The registered write-set names the four tables in that ord (`supabase/migrations/017_event_test_contract.sql`). `PERSON_WRITE_TABLES` does not contain them.

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof.

1. One contact produces `writes` of length 4, in the order evaluation, result, signal, motion. Each `id` is the id stored on that row. Each `contact_id` is that contact.
2. Two contacts produce eight pointers: both evaluations in `contactIds` order, then both results, then both signals, then both motions.
3. An empty `contactIds` list inserts none of the four rows and dispatches `writes: []`.
4. The payload still has `anyPass: true` and `motion: "reactivation"`, plus the caller’s `eventPayload` keys. A fact caller’s `writebackId`, `fieldKey`, `form_ref`, and `campaign_objective_id` remain. A reference caller’s `referenceId` remains.
5. `writesFromPayload` returns those pointers and does not add `contact_records`.
6. The returned `cascade` entries still use `evaluationId`, `resultId`, `signalId`, and `motionId`. Those keys are not how the dispatch names the rows.
7. When no workflow fires, the enroll still runs, and `writes` still does not name `enrollment`, `active_attempts`, or `engagement_records`.
8. `loadWriteRow` for each of the four tables returns the row with `pointer.id`, or null when that id is absent. It does not select by contact or by recency.
9. `PERSON_WRITE_TABLES` does not gain these four names.
10. A repeated contact id inserts a second quartet. Both ids of each table are on `writes`.

## Dependencies

PKT-007 does not put these four rows on the fact payload. The fact dispatch stays after this function returns.

Claim 52 adds the four tables to the person split. Until that packet, `evalIfPick` does not split them, and a table pick with no contact still reads the first pointer of that table.

Claim 17 specifies the empty-contact audience. This packet does not add `contact_records` to `writes`.

Claim 43 specifies the enroll. Claim 60 specifies `any_pathway_pass` and the pathways array. Neither is this packet.

## Out of scope

`handleBoardDetections`. Door 1’s newest-eight specimen. `scripts/verify-automations-alive.ts`. Stripping `anyPass`. Adding `fact_writebacks`, `missing_fact_signals`, or `reference_versions` to this array. Launch Agent. No plate.

## Plates

None.
