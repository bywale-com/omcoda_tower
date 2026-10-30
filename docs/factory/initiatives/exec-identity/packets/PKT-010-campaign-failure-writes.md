# PKT-010 — A campaign_failure firing places the inserted id on payload.writes

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 13, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes  
**UI:** none

## Intended behavior

`escalateAttemptWindow` still reaches `campaign_failure` only in the `!toChannel` branch, after `recordCampaignFailure` returns. When that function’s caller has set `toChannel`, including when another attempt is queued, this branch does not run. One invocation of the branch inserts one row and dispatches once.

`recordCampaignFailure` is unchanged. It still inserts `campaign_failure` with `id` = `cfail-` plus a uuid, stores `firm_id`, `contact_id`, `campaign_id`, `sequence_id`, and `payload`, exhausts the open attempt, sets that enrollment’s `pursuit_state` to `exhausted`, and returns the id. It does not change `enrollment.campaign_id`. The jsonb stays `{ attemptId, criteriaId, setValue }` with `attemptId` equal to `attempt.id`.

The dispatch payload gains

`writes: [{ table: "campaign_failure", id: <the id recordCampaignFailure returned and stored>, contact_id: <the contact stored on the row> }]`

and `campaign_id` set to the `campaign_id` passed into `recordCampaignFailure`. That value is the second enrollment read (`SELECT sequence_id, campaign_id FROM enrollment`), or null when the attempt has no enrollment. It is not the earlier `campaignId` peek that decides whether another attempt is queued. The key is present when the column is null.

That pointer is the only element. `contact_id` on it is the contact column, the one contact in `contactIds`. `firm_id` stays off the pointer. `campaign_failure` stays out of `PERSON_WRITE_TABLES`. This firing places one pointer, and the pointer carries `contact_id`, so `personIdsFromWrites` already uses that field.

The keys already on the payload stay: `campaignFailureId` and `attemptId`. `campaignFailureId` is the same string as `writes[0].id`. The payload does not gain `firm_id`, `contact_id`, `sequence_id`, `criteriaId`, or `setValue` at the root. `sequence_id`, `criteriaId`, and `setValue` stay on the row the pointer loads.

`writesFromPayload` gains no reader for `campaignFailureId`. With `writes` present it returns that one pointer and does not add `contact_records`.

`localRefFromPayload("campaign_failure")` and `triggerLocalRefFromPayload` stay as they are. Both return `payload.campaign_id` or `payload.campaignId` when that value is a non-empty string, and null otherwise. `localAxesMatch` compares that string to `workflow_trigger.local_ref` only when `local_ref` is set. A null column does not match a selected campaign. A trigger that left the axis unset still matches. The firm compare still falls back to `opts.firmId`. The contact compare still falls back to `opts.contactIds`. This packet does not add those root keys.

`dispatchEventToWorkflows` still copies the payload and still sets `anyPass: true` on the walked trigger. The match reads the object passed into the dispatch, so `campaign_id` is on that object. Claim 7’s refusal of `anyPass` is not recut. This packet does not edit that function.

`loadWriteRow` gains a `campaign_failure` branch: `SELECT * FROM campaign_failure WHERE id = pointer.id`. No `firm_id`, no `contact_id`, no `ORDER BY`, no “latest”. No row with that id returns null. A miss does not try `contact_id`. That is the predicate claim 10 locked. This packet adds the branch. It does not change the predicate. A later node reads `sequence_id` and the jsonb fields from that row.

`event_write_set` version 1 already names `campaign_failure` alone, at ord 0. This packet does not write a migration and does not retune door 1. Door 1 for this event stays the newest ten `campaign_failure` rows for the firm.

The rows written before the branch stay off the array: the open-attempt update, the tick `workflow_run` labelled `window:` plus the criteria id, and the `window_fired` engagement. A forward channel’s `send_live` or `send_dry_run` is written when this dispatch does not run. Inside `recordCampaignFailure`, the attempt update and the enrollment update stay the spending stop. `writes` does not name `active_attempts`, `enrollment`, `engagement_records`, or `workflow_run`.

The idempotent return when `fired_criteria` already contains this criteria stays before the insert. The inbound-override return stays before the insert. A dispatch error still warns and does not roll back the failure row, which `recordCampaignFailure` already committed.

## Existing behavior

The branch reads the enrollment again, inserts, and dispatches without `writes` and without `campaign_id`:

```538:562:server/wire-service/cascade.ts
  if (!toChannel) {
    const enr = attempt.enrollment_id
      ? await pool.query<{ sequence_id: string | null; campaign_id: string | null }>(
          `SELECT sequence_id, campaign_id FROM enrollment WHERE id=$1`,
          [attempt.enrollment_id],
        )
      : { rows: [] as Array<{ sequence_id: string | null; campaign_id: string | null }> };
    const { recordCampaignFailure } = await import("./campaignHousing.ts");
    const failId = await recordCampaignFailure(pool, {
      firmId: attempt.firm_id,
      contactId: attempt.contact_id,
      sequenceId: enr.rows[0]?.sequence_id ?? null,
      campaignId: enr.rows[0]?.campaign_id ?? null,
      payload: { attemptId: attempt.id, criteriaId: criteria.id, setValue },
      attemptId: attempt.id,
      enrollmentId: attempt.enrollment_id,
    });
    try {
      const { dispatchEventToWorkflows } = await import("./workflowWalk.ts");
      await dispatchEventToWorkflows(pool, {
        firmId: attempt.firm_id,
        eventName: "campaign_failure",
        payload: { campaignFailureId: failId, attemptId: attempt.id },
        contactIds: [attempt.contact_id],
      });
```

`recordCampaignFailure` returns the id it stored:

```914:929:server/wire-service/campaignHousing.ts
): Promise<string> {
  const client = await pool.connect();
  const id = `cfail-${randomUUID()}`;
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO campaign_failure (id, firm_id, contact_id, campaign_id, sequence_id, payload)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
      [
        id,
        opts.firmId,
        opts.contactId,
        opts.campaignId,
        opts.sequenceId,
        JSON.stringify(opts.payload ?? {}),
      ],
```

`campaign_failure.id` is `TEXT PRIMARY KEY` (`supabase/migrations/010_sequence_campaign_housing.sql`). `event_write_set` version 1 names that table at ord 0 (`supabase/migrations/017_event_test_contract.sql`). `writesFromPayload` already returns when `payload.writes` is an array and never reads `campaignFailureId` (`server/wire-service/runWrites.ts`). `loadWriteRow` falls through to null (`server/wire-service/workflowWalk.ts`). `PERSON_WRITE_TABLES` does not contain `campaign_failure`. `localRefFromPayload` already reads `campaign_id` or `campaignId`. `dispatchEventToWorkflows` still sets `anyPass: true` on the walked payload. Door 1 still reads the newest ten rows for the firm (`server/wire-service/eventTest.ts`).

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof.

1. The `!toChannel` path inserts one `campaign_failure` row and dispatches once. `writes` has length 1. `writes[0].table` is `campaign_failure`. `writes[0].id` is the `cfail-` id stored on the row and the same string as `campaignFailureId`. `writes[0].contact_id` is the contact stored on the row.
2. `payload.campaign_id` equals the `campaign_id` column on that row. When the attempt has no enrollment, the column is null and the key is present and null. The value is the one passed into `recordCampaignFailure`, not the earlier peek.
3. The payload still has `campaignFailureId` and `attemptId`. It does not gain root `firm_id`, `contact_id`, `sequence_id`, `criteriaId`, or `setValue`.
4. `writesFromPayload` returns that one pointer and does not add `contact_records`. It has no `campaignFailureId` reader.
5. A path that sets `toChannel`, including a queued next attempt, does not insert `campaign_failure` and does not dispatch this event.
6. `loadWriteRow` for `campaign_failure` returns the row with `pointer.id`, or null when that id is absent. It does not select by firm, contact, or recency.
7. `PERSON_WRITE_TABLES` does not gain `campaign_failure`.
8. The stored jsonb is `{ attemptId, criteriaId, setValue }`. `sequence_id` stays a column.
9. `writes` does not name `engagement_records`, `workflow_run`, `active_attempts`, `enrollment`, `send_live`, or `send_dry_run`.
10. `localRefFromPayload("campaign_failure")` is unchanged. A trigger with `local_ref` set matches only when `campaign_id` is that non-empty string. A trigger with `local_ref` unset still matches. A null `campaign_id` does not match a selected campaign.
11. The walked trigger still receives `anyPass: true` from `dispatchEventToWorkflows`. This packet does not remove that copy.
12. The open attempt still becomes `exhausted`, and the enrollment’s `pursuit_state` still becomes `exhausted`, without a write to `enrollment.campaign_id`.
13. A criteria already in `fired_criteria`, and an inbound override, still return before the insert.

## Dependencies

Claim 10’s id predicate is the load. PKT-006 does not add this branch. A listener’s field read stays null until this branch is present. The array is still this firing’s handle.

PKT-004’s change specification says the current `campaign_failure` caller payload is unchanged apart from the forced `anyPass` copy. This packet adds `writes` and `campaign_id` to that payload. Implementing PKT-004 must not delete them. This packet does not edit `SCP-pkt-004-firing-handle.md`.

Packet 023’s spending stop is unchanged: exhaustion stops spending and keeps listening. This packet does not retune which attempts the tick picks.

Claim 17 specifies the empty-contact audience. This dispatch already passes one contact.

## Out of scope

Door 1’s newest ten. Enriching the jsonb with the specimen’s `attemptN`, `channel`, `to`, `subject`, `reason`, or `lastAttemptAt`. Adding `campaign_failure` to `PERSON_WRITE_TABLES`. Teaching `writesFromPayload` to read `campaignFailureId`. Stripping `anyPass`. A second root scalar for `sequence_id`. The `window_fired` engagement and the tick run. Launch Agent. Claim 14’s halt array. No plate.

## Plates

None.
