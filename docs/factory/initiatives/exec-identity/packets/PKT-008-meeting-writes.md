# PKT-008 — A meeting firing places that booking’s id on payload.writes

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 11, the `meeting_booked` array, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The fact array is PKT-007. The `objective_met` array is PKT-004.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes

## Intended behavior

`handleMeetingBook` and `handleContactSeatMeeting` each insert one `meeting_booked` row, then dispatch `meeting_booked` once. The dispatch payload gains

`writes: [{ table: "meeting_booked", id: <the mtg- id the insert stored>, contact_id: <the contact on the row> }]`.

The keys already on the payload stay, including `meetingId`, `slot`, and `campaign_objective_id`. The seat payload also keeps `firm_id` and `contactId`. The machine payload does not gain `firm_id`. This packet does not unify those scalars.

`contactIds` stays the one contact. `writesFromPayload` gains no reader for `meetingId`. With `writes` present it returns that one pointer and does not add `contact_records`.

`localRefFromPayload` gains no case for `meeting_booked`.

`handleMeetingBook` still inserts an `engagement_records` row of kind `meeting_booked` after the dispatch. That id is still generated inside the SQL. `event_write_set` names `meeting_booked` only. The side row is not a pointer. This packet does not move the insert. `handleContactSeatMeeting` still does not insert that row.

The open-attempt nullify stays on both handlers. `onCompletionWrite` still receives the meeting row id.

A machine call without `contactId`, and a seat call without `slot`, still return before the insert and do not dispatch.

## Existing behavior

The machine dispatch has no `writes`. The side engagement is inserted after it, with the id inside the statement:

```1926:1954:server/wire-service/machine.ts
  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: firm,
    eventName: "meeting_booked",
    payload: { meetingId: id, contactId, slot: body.slot ?? null, campaign_objective_id: campaignObjectiveId },
    contactIds: [contactId],
  });
  // ...
  await pool.query(
    `INSERT INTO engagement_records (id, firm_id, contact_id, event_kind, payload)
     VALUES ($1,$2,$3,'meeting_booked',$4::jsonb)`,
    [
      `eng-${randomUUID()}`,
```

The seat dispatch has `firm_id` and no `writes`, and it does not insert an engagement row:

```653:664:server/wire-service/contactSeat.ts
  await dispatchEventToWorkflows(resolved.pool, {
    firmId: resolved.link.firm_id,
    eventName: "meeting_booked",
    payload: {
      meetingId: id,
      contactId: resolved.link.contact_id,
      firm_id: resolved.link.firm_id,
      slot,
      campaign_objective_id: campaignObjectiveId,
    },
    contactIds: [resolved.link.contact_id],
  });
```

`event_write_set` version 1 names `meeting_booked` only (`supabase/migrations/017_event_test_contract.sql`). `meeting_booked.id` is `TEXT PRIMARY KEY` (`supabase/migrations/007_meeting_booked.sql`).

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof.

1. A machine booking that commits stores one `mtg-` id on the row and on `writes[0]`. `writes` has length 1. `contact_id` is the contact on the row.
2. The machine payload still has `meetingId`, `contactId`, `slot`, and `campaign_objective_id`. It does not gain `firm_id`.
3. The seat payload still has `firm_id`, and its `writes[0].id` is the seat insert’s id.
4. `writesFromPayload` of either payload returns that one pointer and does not add `contact_records` or `engagement_records`.
5. The machine path still inserts one `engagement_records` row after the dispatch. That row’s id is not an element of `writes`.
6. The seat path still inserts no engagement row for the booking.
7. `localRefFromPayload("meeting_booked")` is still absent.
8. A machine call without `contactId`, and a seat call without `slot`, do not dispatch.

## Dependencies

PKT-006 loads `meeting_booked` by id. This packet does not add that loader.

PKT-004’s `objective_met` array is a different firing. A meeting that also completes an objective still gets that second dispatch from `advanceEnrollmentCampaign`. This packet does not add the enrollment pointer here.

## Out of scope

Moving or deleting the side engagement insert. The fact array. Stripping `anyPass`. The attempt-nullify statement. Launch Agent. No plate.

## Plates

None.
