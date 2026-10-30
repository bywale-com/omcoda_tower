# PKT-004 — An objective_met listener starts from this firing’s rows

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 7, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The `objective_met` array is the shape claim 11 locked for this firing. The engagement load is claim 10’s id predicate for this table only.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes

## Intended behavior

Hearing `objective_met` creates a new `workflow_run`. Its trigger handle is this firing’s write-set: the `engagement_records` row just inserted, then the `enrollment` row, both as pointers.

The engagement row is the fact that was met. Its payload names the campaign that cleared, the completion, and `nextCampaignId`. The enrollment row is the cursor after `advanceEnrollmentCampaign` flips `campaign_id`. A listener must not treat the enrollment row as a substitute for the engagement row. A listener must not select the latest `objective_met` for the contact.

The dispatch payload gains, in that order:

`writes: [{ table: "engagement_records", id: <the id stored on the insert>, contact_id: <enrollment.contact_id> }, { table: "enrollment", id: <enrollment.id>, contact_id: <enrollment.contact_id> }]`

The engagement id is `eng-` plus a uuid, held in a variable the insert uses. The string stored on the row is the string on the pointer. No new enrollment is minted. A return before the flip does not dispatch.

The scalar keys already on the dispatch stay, including `campaign_objective_id`, `enrollment_id`, and `completion_id`. They are the local axis. They are not the handle. `writesFromPayload` does not gain a reader for `enrollment_id`. The completion row is not a third pointer.

`dispatchEventToWorkflows` does not set `anyPass`. Absence of a write is not a pass. A caller that already placed `anyPass` on its payload keeps that field. This packet does not strip it.

`loadWriteRow` loads `engagement_records` with `SELECT * FROM engagement_records WHERE id = pointer.id`. No `firm_id`, no `contact_id`, no `ORDER BY`, no “latest”. No row with that id returns null. `enrollment` already loads that way.

## Existing behavior

The insert builds the id inside the statement, and the dispatch never sees it. The payload has no `writes`:

```851:895:server/wire-service/campaignHousing.ts
  await pool.query(
    `INSERT INTO engagement_records (id, firm_id, contact_id, event_kind, payload)
     VALUES ($1,$2,$3,'objective_met',$4::jsonb)`,
    [
      `eng-${randomUUID()}`,
      row.firm_id,
      row.contact_id,
      JSON.stringify({
        enrollmentId: row.id,
        sequenceId: row.sequence_id,
        campaignId: currentCampaignId,
        campaignObjectiveId: obj.id,
        kind: obj.kind,
        completionTable,
        completionId,
        nextCampaignId: next,
      }),
    ],
  );
  // ...
  await dispatchEventToWorkflows(pool, {
    firmId: row.firm_id,
    eventName: "objective_met",
    payload: {
      campaign_objective_id: obj.id,
      campaign_id: currentCampaignId,
      sequence_id: row.sequence_id,
      enrollment_id: row.id,
      contact_id: row.contact_id,
      kind: obj.kind,
      completion_table: completionTable,
      completion_id: completionId,
    },
    contactIds: [row.contact_id],
  });
```

`writesFromPayload` only builds pointers from `payload.writes`, an import batch id, or `contact_ids` / `contactIds`. This payload has `contact_id` singular and no `writes`, so the trigger handle is empty (`server/wire-service/runWrites.ts`).

Every event dispatch then forces a pass:

```1970:1976:server/wire-service/workflowWalk.ts
    const walked = await walkValidatedWorkflow(pool, {
      workflowId: row.workflow_id,
      firmId: opts.firmId,
      runId,
      triggerLabel: `event:${opts.eventName}`,
      triggerPayload: { ...(opts.payload ?? {}), eventName: opts.eventName, anyPass: true },
      contactIds,
```

The walk treats that flag as the branch pass:

```1106:1110:server/wire-service/workflowWalk.ts
    eligibilityPass:
      opts.triggerPayload?.anyPass === true ||
      opts.triggerPayload?.eligibilityPass === true ||
      opts.triggerLabel.includes("eligibility") ||
      undefined,
```

`loadWriteRow` returns null for `engagement_records`. The function ends at `return null` after the tables it knows (`workflowWalk.ts`). `engagement_records.id` is `TEXT PRIMARY KEY` (`supabase/migrations/004_machine_tables.sql`). The registered write-set names `engagement_records` at ord 0 and `enrollment` at ord 1 (`supabase/migrations/021_objective_local_axis.sql`).

The eligibility cascade puts `anyPass: true` on its own payload before dispatch (`server/wire-service/machine.ts`, `eligibility.changed`). That caller field stays. Claim 12 said this refusal is not recut there.

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof.

1. A flip that commits stores one `eng-` id on the engagement row and on `writes[0]`. `writes[1]` is that enrollment’s id. Both pointers carry the enrollment’s `contact_id`. Order is engagement, then enrollment.
2. A return before the flip does not dispatch `objective_met`.
3. `writesFromPayload` of that payload returns those two pointers and does not add `contact_records`.
4. The new run’s `previousWrites` is that array. It is not empty. It is not the newest `objective_met` engagement for the contact.
5. Two firings close together produce two engagement ids. Each listening run carries the id its firing inserted.
6. `dispatchEventToWorkflows` does not add `anyPass`. A payload that already has `anyPass: true` still has it after the copy. A payload without it does not gain it.
7. `loadWriteRow` for `engagement_records` returns the row with `pointer.id`, or null when that id is absent. It does not select by contact or by recency.
8. Re-reading the enrollment pointer shows `campaign_id` after the flip, including NULL on the last campaign.

## Dependencies

Claim 2: two pursuits may be open. This packet does not close the other one.

PKT-001 attributes a click to the stamped enrollment. The engagement payload still names that completion. This packet does not change the click match.

Claim 11’s fact and meeting arrays are not this packet. Claim 10’s loads of `fact_writebacks`, `meeting_booked`, and `wait_occupancy` are not this packet.

## Out of scope

Schedule’s own `anyPass` (`dispatchScheduleTriggers`). The webhook walk’s own `anyPass` (`machine.ts` webhook path). Stripping `anyPass` off `eligibility.changed`. A second channel from scalar keys. Copying the row body onto the pointer. `firm_id` on the pointer. Launch Agent. No plate.

## Plates

None.
