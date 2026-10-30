# PKT-013 — A ct_firms firing places the current firm id on payload.writes

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 16, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`. The revision under claim 17 leaves this pointer unchanged.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes  
**UI:** none

## Intended behavior

`handleMachineProvision` still upserts one `ct_firms` row on `id` and then dispatches once. The statement stays:

`INSERT INTO ct_firms (id, name, posture, updated_at) VALUES (firm, firmName, 'Idle', now()) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = now()`.

`firm` is `body.firmId` trimmed, or `randomUUID()` when that trim is empty. The conflict clause assigns `name` and `updated_at`. It does not assign `posture`, `pool_slug`, `pool_domain`, or `sending_identity_id`. An insert stores `name` as this call’s `firmName` and `posture` `Idle`. The pool columns stay null. `created_at` takes the column default. A conflict replaces `name` and `updated_at` and leaves `posture` and the pool columns as they were. The statement still has no `RETURNING`. The id is the `firm` variable the handler already bound. This packet does not retune that `UPDATE`.

A blank `firmName` or a blank `email`, after trim, still returns 400 before any insert and before the dispatch. `email` is still trimmed and lowercased. `website` and `role` are still echoed on the HTTP body and are still not inserted.

The dispatch payload gains

`writes: [{ table: "ct_firms", id: <firm> }]`

That pointer is the only element. It does not carry `contact_id`. `writesFromPayload` drops an element whose `id` is not a string. When `contact_id` is absent it stores null. `ct_firms` stays out of `PERSON_WRITE_TABLES`. This firing’s pointer contributes no person. Adding the table to that set would make `personIdsFromWrites` treat the firm id as a contact whenever `contact_id` is null.

The keys already on the payload stay: `firmId`, `firmName`, and `email`. `firmId` is `firm`. The call still passes no `contactIds`. The payload does not gain `posture`, `website`, `role`, `consultant_name`, `consultant_email`, `id`, `contact_id`, or `anyPass`. `writesFromPayload` gains no reader for `firmId`, `firmName`, or `email`. With `writes` present it returns that one pointer and does not add `contact_records`.

`localRefFromPayload("ct_firms")` and `triggerLocalRefFromPayload` stay as they are. Both return `id`, `firm_id`, or `firmId` when that value is a non-empty string. This packet does not add a payload key and does not remove the case. `localAxesMatch` compares `local_firm_id` to `payload.firmId`, then falls back to `opts.firmId`. On this dispatch those two ids are the same string. `local_ref` is compared only when it is set. A stored `local_ref` matches when it equals this firm id. `WORKFLOW_EVENTS_WITH_LOCAL` still includes `ct_firms`. The A26 row stays firm only.

`dispatchEventToWorkflows` is not edited. It still copies the payload and still sets `anyPass: true` on the walked trigger. `writes` has to be on the object passed in. Claim 7’s refusal of `anyPass` is not recut. This packet does not put `anyPass` on the provision payload. PKT-004 removes the forced copy. Implementing PKT-004 must not delete `writes`. The function’s audience fill, when `contactIds` is omitted, stays the live branch. Claim 17 owns that fill. This packet does not add `contact_records` to the array and does not put a person on this pointer.

`loadWriteRow` gains a `ct_firms` branch: `SELECT * FROM ct_firms WHERE id = pointer.id`. No firm predicate. No contact predicate. No `ORDER BY`. No “latest”. No `posture` filter. A miss returns null. The loader does not substitute the walk’s firm and does not fall through to `firms`. On this firing `pointer.id` and the walk’s firm are the same string. The predicate uses the pointer. This is claim 10’s `WHERE id = pointer.id` applied to a table whose primary key is `id`. This packet does not change that predicate for the other tables, and it does not change claim 15’s `(contact_id, firm_id)` load.

A later node reads `name`, `posture`, `pool_slug`, `pool_domain`, `sending_identity_id`, `created_at`, and `updated_at` from that row. On an insert from this firing, `name` is `firmName`, `posture` is `Idle`, and the three pool columns are null. On a conflict, `name` is this call’s `firmName`, `updated_at` is now, and `posture` and the pool columns are whatever the row already held. Those columns are not copied onto the dispatch. A later update of the same id, including a later pool allocation, is visible on the re-read.

`event_write_set` version 1 already names `ct_firms` alone, at ord 0. This packet does not write a migration and does not retune door 1. Door 1 for this event stays `SELECT * FROM ct_firms WHERE id = $1 LIMIT 1` with the session firm. `writeId` still uses `body.id` when it is present. The specimen `etd-ct_firms-harbor` still carries `consultant_name`, `consultant_email`, and `posture` `Armed`. The upsert does not store the consultant keys. This packet does not enrich the row.

The same handler still writes `firms`, `campaign_states`, and `users` before the dispatch, and it may insert `access_links`. After the dispatch, `appendFirmAudit` still inserts `audit_events` with kind `firm.provisioned`. A failure in the auth-user block still reaches the `ct_firms` dispatch. None of those rows join `writes`. `handlePoolAllocate` still updates pool columns on the same id and does not dispatch. Seed inserts are not this dispatch. The HTTP body stays `firmId`, `firmName`, `email`, `website`, `role`, `ctFirm`, `authUser`, `campaignState`, `loginPath`, `accessPath`, `bound`, and `workflowsFired`.

`executeGet` for module `firms` still returns `{ table: "ct_firms", id }` and still does not set `contact_id`. `projectSeat` still unions `ct_firms` with `firms` by the same text. That union is not this load.

## Existing behavior

The provision route binds one id, upserts `ct_firms`, and dispatches without `writes`:

```1614:1627:server/wire-service/machine.ts
  const firm = body.firmId?.trim() || randomUUID();
  const pool = getPool();

  await pool.query(
    `INSERT INTO firms (id, name) VALUES ($1::uuid, $2)
     ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name`,
    [firm, firmName],
  );
  await pool.query(
    `INSERT INTO ct_firms (id, name, posture, updated_at)
     VALUES ($1,$2,'Idle',now())
     ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, updated_at=now()`,
    [firm, firmName],
  );
```

```1680:1684:server/wire-service/machine.ts
  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: firm,
    eventName: "ct_firms",
    payload: { firmId: firm, firmName, email },
  });
```

The primary key is `id` (`supabase/migrations/003_ct_wire_stores.sql`). There is no `contact_id` column. `posture` defaults to `Idle` and is checked to `Idle`, `Armed`, or `Active`. `event_write_set` version 1 names `ct_firms` at ord 0 (`supabase/migrations/017_event_test_contract.sql`). `writesFromPayload` already returns when `payload.writes` is an array (`server/wire-service/runWrites.ts`). `loadWriteRow` has no `ct_firms` branch and falls through to null (`server/wire-service/workflowWalk.ts`). `PERSON_WRITE_TABLES` does not contain `ct_firms`. `localRefFromPayload` already reads `id`, `firm_id`, or `firmId` for this event. `dispatchEventToWorkflows` still sets `anyPass: true` and, when `contactIds` is omitted, still fills the walk from the audience branch. Door 1 still reads one `ct_firms` row by the session firm (`server/wire-service/eventTest.ts`). `handlePoolAllocate` upserts pool columns and does not dispatch (`server/wire-service/pool.ts`). `appendFirmAudit` inserts `audit_events` and does not dispatch (`server/wire-service/stores.ts`). `executeGet` for `firms` emits `{ table: "ct_firms", id }` (`server/wire-service/workflowWalk.ts`).

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof.

1. `handleMachineProvision` upserts one `ct_firms` row and dispatches once. `writes` has length 1. `writes[0].table` is `ct_firms`. `writes[0].id` is the `firm` the upsert used. `writes[0].contact_id` is absent.
2. On an insert, the row’s `name` is `firmName`, `posture` is `Idle`, and `pool_slug`, `pool_domain`, and `sending_identity_id` are null. On a conflict, `name` is this call’s `firmName` and `posture` and the pool columns stay as they were.
3. A body that omits `firmId`, or sends it blank, mints one new id and inserts one row. A body that repeats an id updates that row and does not insert a second.
4. The payload still has `firmId`, `firmName`, and `email`. `firmId` equals `writes[0].id`. The call still passes no `contactIds`. The payload does not gain `posture`, `website`, `role`, `consultant_name`, `consultant_email`, `contact_id`, or `anyPass`.
5. `writesFromPayload` returns that one pointer and does not add `contact_records`. It has no reader that maps `firmId`, `firmName`, or `email` onto `ct_firms`.
6. `loadWriteRow` for `ct_firms` returns the row whose `id` is `pointer.id`, or null when that id is absent. It does not select by the walk’s firm, by `posture`, by recency, or from `firms`. A later update of that id, including pool columns written by `handlePoolAllocate`, is what the same load returns.
7. `PERSON_WRITE_TABLES` does not gain `ct_firms`. `personIdsFromWrites` does not treat this pointer’s id as a contact.
8. `firms`, `campaign_states`, `users`, `access_links`, and the `firm.provisioned` audit are not elements of `writes`. An auth-user failure still dispatches the firm pointer.
9. `handlePoolAllocate` does not dispatch `ct_firms`.
10. `localRefFromPayload("ct_firms")` is unchanged. A trigger with `local_ref` set matches when that value is this firm id. A trigger with `local_ref` unset still matches. The firm compare still reads `payload.firmId`.
11. `dispatchEventToWorkflows` is unchanged. The walked trigger still receives `anyPass: true` from that function. The audience fill, when `contactIds` is omitted, is still the live branch.
12. A blank `firmName` or a blank `email` still returns 400 and does not dispatch. The HTTP success body still includes `firmId`, `firmName`, `email`, `website`, `role`, `ctFirm`, `authUser`, `campaignState`, `loginPath`, `accessPath`, `bound`, and `workflowsFired`.
13. Door 1 is still one row by the session firm. No migration is added. The conflict clause still does not assign `posture` or the pool columns.

## Dependencies

The load is claim 10’s id predicate. The primary key is `id`. Claim 15’s pair does not apply. PKT-006, PKT-009, PKT-010, PKT-011, and PKT-012 do not add this branch. A listener’s field read stays null until this branch is present. The array is still this firing’s handle.

PKT-004’s change specification says the current `ct_firms` caller payload is unchanged apart from the forced `anyPass` copy. This packet adds `writes` to that payload. Implementing PKT-004 must not delete `writes`. This packet does not edit `SCP-pkt-004-firing-handle.md` and does not edit `dispatchEventToWorkflows`.

Claim 17 specifies the person list when this call omits `contactIds`. That revision leaves this pointer as it is. This packet does not implement the fill.

The seat projection and door 1 read a firm row by id. They do not need this listening run.

## Out of scope

Door 1’s session-firm read. Adding a firm-history table or a second `ct_firms` row per provision. Adding `ct_firms` to `PERSON_WRITE_TABLES`. Teaching `writesFromPayload` to map `firmId` onto this table. Putting the firm id in `contact_id`. Loading `WHERE id = <the walk’s firm>` instead of `pointer.id`. Falling through to `firms`. Stripping `anyPass`. Dispatching `handlePoolAllocate`, the auth user, the campaign state, the access link, or the provision audit. Retuning `posture` on the conflict clause. The audience fill when `contactIds` is omitted (claim 17). Launch Agent. No plate.

## Plates

None.
