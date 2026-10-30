# PKT-012 — A consent_records.opt_out firing places the current pair on payload.writes

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 15, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`. Revisions under claims 25, 26, and 27 leave this pointer unchanged.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes  
**UI:** none

## Intended behavior

`handleConsentSilence` still upserts one `consent_records` row on `(contact_id, firm_id)` and then dispatches once. The statement stays:

`INSERT … (contact_id, firm_id, basis, silenced, source, updated_at) VALUES (contactId, firmId, 'none', true, source, now()) ON CONFLICT (contact_id, firm_id) DO UPDATE SET silenced = true, source = EXCLUDED.source, updated_at = now()`.

The conflict clause still does not assign `basis` and does not assign `status`. An insert stores `basis` `none` and `silenced` true. `status` stays the column default `unsequenced`. `workspace_opted_out` stays the column default false. A conflict leaves the existing `basis`, `status`, and `workspace_opted_out`, and sets `silenced` true and `source` to this call’s source. This packet does not retune that `UPDATE`. Claim 25 owns a later status write. The call stays a direct await. The HTTP body stays `{ ok: true }`. The statement still has no `RETURNING`.

The dispatch payload gains

`writes: [{ table: "consent_records", id: <body.contactId>, contact_id: <body.contactId> }]`

That pointer is the only element. `id` and `contact_id` are the same string, the contact the upsert used. `writesFromPayload` drops an element whose `id` is not a string. This table has no `id` column. The person half of the primary key is `contact_id`. The firm half is the walk’s firm. `firmId` on the dispatch stays `body.firmId`, the firm the upsert wrote. `RunWrite` has no `firm_id` field. Firm stays off the pointer.

`consent_records` stays out of `PERSON_WRITE_TABLES`. This firing has one pointer and it carries `contact_id`, so `personIdsFromWrites` uses that field.

The keys already on the payload stay: `contactId` and `source`. `contactIds` stays that one contact. The payload does not gain `basis`, `status`, `firmId`, `firm_id`, `contact_name`, or `firm`. `writesFromPayload` gains no reader for `contactId` or `source`. With `writes` present it returns that one pointer and does not add `contact_records`.

`localRefFromPayload("consent_records.opt_out")` and `triggerLocalRefFromPayload` stay as they are. Both return `contact_id` or `contactId` when that value is a non-empty string. This packet does not add a payload key and does not remove the case. `localAxesMatch` compares `local_contact_ids` to `payload.contactId`, then falls back to `contactIds`, and compares the firm to `opts.firmId` when `local_firm_id` is set. `local_ref` is compared only when it is set. A stored `local_ref` matches when it equals this contact id. `WORKFLOW_EVENTS_WITH_LOCAL` still omits `consent_records.opt_out`. This packet does not add a `consent_records.sequenced` firing. Claim 27 owns that name.

`dispatchEventToWorkflows` is not edited. It still copies the payload and still sets `anyPass: true` on the walked trigger. `writes` has to be on the object passed in. Claim 7’s refusal of `anyPass` is not recut. This packet does not put `anyPass` on the silence payload. PKT-004 removes the forced copy. Implementing PKT-004 must not delete `writes`.

`loadWriteRow` gains a `consent_records` branch: `SELECT * FROM consent_records WHERE contact_id = pointer.contact_id AND firm_id = <the firmId already passed into loadWriteRow>`. No `ORDER BY`. No “latest”. No `silenced` filter. No `status` filter. A miss returns null. The predicate does not use `pointer.id` and does not look for a column named `id`. On this firing `pointer.contact_id` and `pointer.id` are the same contact, and the firm argument is the walk’s firm, which is `body.firmId`. That pair is the primary key. This is not claim 10’s `WHERE id = pointer.id`. This packet does not change that predicate for tables that have an `id` column. It does not change claim 8’s `(audit_run_id, contact_id)` load.

A later node reads `basis`, `silenced`, `source`, `status`, `workspace_opted_out`, and `updated_at` from that row. On an insert from this firing, `basis` is `none`, `silenced` is true, `source` is the body’s source, `status` is `unsequenced`, and `workspace_opted_out` is false. On a conflict, `silenced` is true, `source` is this call’s source, and `basis`, `status`, and `workspace_opted_out` are whatever the row already held. Those columns are not copied onto the dispatch. A later update of the same pair is visible on the re-read.

`event_write_set` version 1 already names `consent_records` alone, at ord 0. This packet does not write a migration and does not retune door 1. Door 1 for this event stays the newest ten `consent_records` rows for the firm with `silenced` true, ordered by `updated_at`. `writeId` still uses `body.contact_id` when `body.id` is absent.

`handleConsentSet` still upserts the same primary key and does not dispatch. A new row still stores the body’s `basis` and `silenced` false. On conflict it still updates `basis`, keeps `source` when the body omits it, updates `updated_at`, and leaves `silenced` as it was. `handleContactSeatConsent` still sets `basis` from Agree or Ignore, sets `silenced` false, and does not dispatch. `handleContactSeatSilence` still sets `workspace_opted_out` true on the same pair, does not set `silenced`, and does not dispatch. The hard-bounce upsert still sets `silenced` true and `source` `hard-bounce`, and it does not dispatch. The in-memory stand-in `silence` still does not call the dispatcher. This firing is `handleConsentSilence`.

`consentAndHaltGate` still selects `consent_records` by `contact_id` alone with `LIMIT 1`. That gate is not this pointer. This packet does not add `firm_id` to that query.

## Existing behavior

The silence route upserts and dispatches without `writes`:

```256:276:server/wire-service/stores.ts
export async function handleConsentSilence(c: Context) {
  const body = await c.req.json<{
    contactId: string;
    firmId: string;
    source: string;
  }>();
  await getPool().query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, source, updated_at)
     VALUES ($1,$2,'none',true,$3,now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE
       SET silenced = true, source = EXCLUDED.source, updated_at = now()`,
    [body.contactId, body.firmId, body.source],
  );
  await dispatchEventToWorkflows(getPool(), {
    firmId: body.firmId,
    eventName: "consent_records.opt_out",
    payload: { contactId: body.contactId, source: body.source },
    contactIds: [body.contactId],
  });
  return c.json({ ok: true });
}
```

`handleConsentSet` upserts the same pair and returns without a dispatch:

```236:254:server/wire-service/stores.ts
export async function handleConsentSet(c: Context) {
  const body = await c.req.json<{
    contactId: string;
    firmId: string;
    basis: "express" | "implied" | "none";
    source?: string;
  }>();
  const source = body.source ?? null;
  await getPool().query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, source, updated_at)
     VALUES ($1,$2,$3,false,$4,now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE
       SET basis = EXCLUDED.basis,
           source = COALESCE(EXCLUDED.source, consent_records.source),
           updated_at = now()`,
    [body.contactId, body.firmId, body.basis, source],
  );
  return c.json({ ok: true });
}
```

The primary key is `(contact_id, firm_id)`. There is no `id` column (`supabase/migrations/003_ct_wire_stores.sql`). `status` defaults to `unsequenced` (`supabase/migrations/004_machine_tables.sql`). `workspace_opted_out` defaults to false (`supabase/migrations/020_workspace_opt_out.sql`). `event_write_set` version 1 names `consent_records` at ord 0 (`supabase/migrations/017_event_test_contract.sql`). `writesFromPayload` already returns when `payload.writes` is an array (`server/wire-service/runWrites.ts`). `loadWriteRow` has no `consent_records` branch and falls through to null (`server/wire-service/workflowWalk.ts`). `PERSON_WRITE_TABLES` does not contain `consent_records`. `localRefFromPayload` already reads `contact_id` or `contactId` for this event. `dispatchEventToWorkflows` still sets `anyPass: true`. Door 1 still reads the newest ten silenced rows for the firm (`server/wire-service/eventTest.ts`). `handleContactSeatConsent` and `handleContactSeatSilence` do not dispatch (`server/wire-service/contactSeat.ts`). The hard-bounce upsert does not dispatch (`server/wire-service/webhooks.ts`). The stand-in `silence` does not dispatch (`src/app/wire/standins/consentSilence.ts`).

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof.

1. `handleConsentSilence` upserts one `consent_records` row and dispatches once. `writes` has length 1. `writes[0].table` is `consent_records`. `writes[0].id` and `writes[0].contact_id` are both `body.contactId`.
2. On an insert, the row’s `basis` is `none`, `silenced` is true, `source` is the body’s source, `status` is `unsequenced`, and `workspace_opted_out` is false. On a conflict, `silenced` is true, `source` is this call’s source, and `basis`, `status`, and `workspace_opted_out` stay as they were.
3. The payload still has `contactId` and `source`. `contactIds` is that one contact. The payload does not gain `basis`, `status`, `firmId`, `firm_id`, `contact_name`, `firm`, or `anyPass`.
4. `writesFromPayload` returns that one pointer and does not add `contact_records`. It has no reader that maps `contactId` or `source` onto `consent_records`.
5. `loadWriteRow` for `consent_records` returns the row whose `contact_id` is `pointer.contact_id` and whose `firm_id` is the walk firm, or null when that pair is absent. It does not select by a column named `id`, by `silenced`, by `status`, or by recency. A later update of that pair is what the same load returns.
6. `PERSON_WRITE_TABLES` does not gain `consent_records`.
7. `handleConsentSet`, `handleContactSeatConsent`, `handleContactSeatSilence`, and the hard-bounce upsert do not dispatch `consent_records.opt_out`.
8. `localRefFromPayload("consent_records.opt_out")` is unchanged. A trigger with `local_ref` set matches when that value is this contact id. A trigger with `local_ref` unset still matches. The contact compare still reads `payload.contactId`.
9. `dispatchEventToWorkflows` is unchanged. The walked trigger still receives `anyPass: true` from that function.
10. The HTTP response is still `{ ok: true }`. The stand-in `silence` still does not dispatch.
11. `consentAndHaltGate` still selects by `contact_id` alone. Door 1 is still the newest ten silenced rows for the firm. No migration is added.
12. The conflict clause of `handleConsentSilence` still does not assign `basis` or `status`.

## Dependencies

The load is the primary key: `contact_id` plus the walk’s firm. Claim 10’s `WHERE id = pointer.id` does not apply. PKT-006, PKT-009, PKT-010, and PKT-011 do not add this branch. A listener’s field read stays null until this branch is present. The array is still this firing’s handle.

PKT-004’s change specification says the current `consent_records.opt_out` caller payload is unchanged apart from the forced `anyPass` copy. This packet adds `writes` to that payload. Implementing PKT-004 must not delete `writes`. This packet does not edit `SCP-pkt-004-firing-handle.md` and does not edit `dispatchEventToWorkflows`.

Claim 25 specifies a status write on this statement. Claim 26 specifies the seat-consent conflict when `status` is `silenced`. Claim 27 specifies the absent `consent_records.sequenced` firing. Those revisions leave this pointer as it is. This packet does not implement them.

The send gate, the seat projection, and the silence leaf read the current row. They do not need this listening run.

## Out of scope

Door 1’s newest ten. Adding an `id` column or a decision-history table. Adding `consent_records` to `PERSON_WRITE_TABLES`. Teaching `writesFromPayload` to map `contactId` onto this table. Encoding the pair into one string. Putting `firm_id` on the pointer. Stripping `anyPass`. Dispatching basis writes, the workspace opt-out, or the hard bounce. Retuning `status` on the silence statement. Adding `firm_id` to `consentAndHaltGate`. A `consent_records.sequenced` firing. Launch Agent. Claim 16. No plate.

## Plates

None.
