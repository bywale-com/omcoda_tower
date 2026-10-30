# PKT-007 — A fact firing places that write-back’s id on payload.writes

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 11, the `fact_writebacks` array, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The `objective_met` array is PKT-004. The meeting array is PKT-008.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes

## Intended behavior

`handleFactWriteback` and `handleContactSeatFacts` each insert one `fact_writebacks` row, then dispatch `fact_writebacks` once for that insert. The seat handler stays inside the answer loop, so each answer is its own firing.

The dispatch payload gains

`writes: [{ table: "fact_writebacks", id: <the writeId the insert stored>, contact_id: <the contact on the row> }]`.

The id is the `fwb-` variable the insert already uses. The keys already on the payload stay, including `writebackId`, `fieldKey`, `form_ref`, and `campaign_objective_id`. The seat payload also keeps `firm_id` and `contactId`. The machine payload does not gain `firm_id`. This packet does not unify those scalars.

`contactIds` stays the person list, one contact. `writesFromPayload` gains no reader for `writebackId`. With `writes` present it returns that one pointer and does not add `contact_records`.

`missing_fact_signals` ids are not elements. The eligibility rows the cascade inserts are not elements. Those belong to `eligibility.changed` (PKT-009). The HTTP `cascade` array still begins with `{ table: "fact_writebacks", id: writeId }`. That object is the response. The dispatch does not receive it.

A missing `contactId` or `fieldKey` on the machine route still returns before the insert and does not dispatch. A blank seat answer still skips that iteration.

## Existing behavior

The machine handler holds `writeId`, inserts it, and dispatches without `writes`:

```489:500:server/wire-service/machine.ts
  const factDispatched = await dispatchEventToWorkflows(pool, {
    firmId: firm,
    eventName: "fact_writebacks",
    payload: {
      writebackId: writeId,
      fieldKey,
      contactId,
      form_ref: stamp.formRef,
      campaign_objective_id: stamp.campaignObjectiveId,
    },
    contactIds: [contactId],
  });
```

The response cascade is separate. It is not the dispatch argument:

```509:514:server/wire-service/machine.ts
  return json(c, {
    writebackId: writeId,
    contactId,
    fieldKey,
    missingSignalIds: missingIds,
    cascade: [{ table: "fact_writebacks", id: writeId }, ...cascade],
```

The seat handler dispatches once per answer, with `firm_id` on the payload and still no `writes`:

```599:611:server/wire-service/contactSeat.ts
    await dispatchEventToWorkflows(resolved.pool, {
      firmId: resolved.link.firm_id,
      eventName: "fact_writebacks",
      payload: {
        writebackId: writeId,
        fieldKey,
        contactId: resolved.link.contact_id,
        firm_id: resolved.link.firm_id,
        form_ref: stamp.formRef,
        campaign_objective_id: stamp.campaignObjectiveId,
      },
      contactIds: [resolved.link.contact_id],
    });
```

`event_write_set` version 1 names `fact_writebacks` only (`supabase/migrations/017_event_test_contract.sql`). `writesFromPayload` already returns when `payload.writes` is an array (`server/wire-service/runWrites.ts`). This payload has no such array, so the trigger handle is empty.

Both handlers call `runContactEligibilityCascade` before the fact dispatch. That dispatch is unchanged by this packet.

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof.

1. A machine fact that commits stores one `fwb-` id on the row and on `writes[0]`. `writes` has length 1. `contact_id` is the contact on the row.
2. The machine payload still has `writebackId`, `fieldKey`, `contactId`, `form_ref`, and `campaign_objective_id`. It does not gain `firm_id`.
3. Two seat answers dispatch twice. Each payload’s `writes[0].id` is that answer’s `writeId` and not the other answer’s.
4. The seat payload still has `firm_id`.
5. `writesFromPayload` of either payload returns that one pointer and does not add `contact_records`.
6. Inserted or deleted `missing_fact_signals` ids are absent from `writes`.
7. The fact payload does not contain `eligibility_evaluations`, `eligibility_results`, `signals`, or `motion_decisions`.
8. The HTTP `cascade` array still begins with `{ table: "fact_writebacks", id: writeId }`.
9. A machine call without `contactId` or `fieldKey` does not dispatch.

## Dependencies

PKT-006 loads `fact_writebacks` by id. This packet does not add that loader. A listener’s field read stays null until PKT-006 is present. The array is still this firing’s handle.

PKT-009 places the eligibility quartet on `eligibility.changed`. This packet does not add `writes` to that dispatch.

`onCompletionWrite` still receives the same `rowId`. This packet does not change the completion match.

## Out of scope

The meeting array. The `objective_met` array. A `meeting_booked` case on `localRefFromPayload`. Stripping `anyPass` from the eligibility cascade. Launch Agent. No plate.

## Plates

None.
