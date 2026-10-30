# PKT-011 — A contact-scope halt_records firing places the inserted id on payload.writes

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 14, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`. Revisions under claims 17, 18, and 19 leave this pointer unchanged.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes  
**UI:** none

## Intended behavior

`handleHaltCommit` still inserts one `halt_records` row. `id("halt")` is unchanged: `halt-` plus `Date.now()`, a hyphen, and `Math.random().toString(36).slice(2, 8)`. The stored columns stay `consultant_id`, `contact_id` (`body.contactId`, or null), `firm_id`, `scope`, `reason` (or null), and `halted_at`. `lifted_at` stays null on the insert. The same handler still inserts one `audit_events` row. When `scope` is `contact`, it still dispatches once. The call stays a direct await. This packet does not add a transaction and does not swallow a dispatch error.

The contact-scope payload gains

`writes: [{ table: "halt_records", id: <the haltId the insert stored>, contact_id: <the contact_id column> }]`

That pointer is the only element. `writes[0].id` is the same string as `haltId`. `contact_id` on the pointer is the column. When `body.contactId` is a non-empty string, the column is that string, `contactIds` is that one contact, and `personIdsFromWrites` uses `contact_id`. When `body.contactId` is omitted, the column is null, the pointer’s `contact_id` is null, and `contactIds` is omitted. `halt_records` stays out of `PERSON_WRITE_TABLES`. A null `contact_id` does not publish the `halt-` id as a person. `firm_id` stays off the pointer. `RunWrite` has no such field.

The keys already on the payload stay: `haltId` and `contactId`. `contactId` remains `body.contactId ?? null`. The payload does not gain `firm_id`, `scope`, `reason`, `consultant_id`, `consultant_name`, `contact_name`, or `firm` at the root. `writesFromPayload` gains no reader for `haltId`. With `writes` present it returns that one pointer and does not add `contact_records`.

`localRefFromPayload` and `triggerLocalRefFromPayload` gain no `halt_records` case. Both still return null for this event. `localAxesMatch` compares `local_ref` only when `local_ref` is set, so a trigger with no `local_ref` still matches, and a trigger with `local_ref` set does not. The firm compare still falls back to `opts.firmId`. The contact compare still reads `payload.contactId`, then `contactIds`. This packet does not add Halt to `TRIGGER_SELECT_EVENTS`. The comment on that list still says not to add halt. `WORKFLOW_EVENTS_WITH_LOCAL` still omits `halt_records`. The Hub catalog label is not the product face.

`dispatchEventToWorkflows` is not edited. It still copies the payload and still sets `anyPass: true` on the walked trigger. `writes` has to be on the object passed in, because the copy is what `writesFromPayload` reads. Claim 7’s refusal of `anyPass` is not recut. This packet does not put `anyPass` on the halt payload. PKT-004 removes the forced copy. Implementing PKT-004 must not delete `writes`.

`loadWriteRow` gains a `halt_records` branch: `SELECT * FROM halt_records WHERE id = pointer.id`. No `firm_id`, no `contact_id`, no `lifted_at`, no `ORDER BY`, no “latest”. No row with that id returns null. A miss does not try `contact_id`. That is the predicate claim 10 locked. This packet adds the branch. It does not change the predicate. A later node reads `consultant_id`, `scope`, `reason`, `halted_at`, and `lifted_at` from that row. On this firing `scope` is `contact` and `lifted_at` is null until a lift. Those columns are not copied onto the dispatch.

`event_write_set` version 1 already names `halt_records` alone, at ord 0. This packet does not write a migration and does not retune door 1. Door 1 for this event stays the newest ten `halt_records` rows for the firm with `lifted_at` null, both scopes. The two version-1 specimen bodies are not this firing’s cardinality.

When `scope` is `firm-book`, the handler still sets `lifted_at` on every other active firm-book row for that firm, inserts the new row with `contact_id` null, inserts `audit_events` kind `halt.firm-book`, and does not call `dispatchEventToWorkflows`. The founder kill-switch is that same scope. This packet does not add the call.

`handleHaltLift` still sets `lifted_at` on the row with this id and inserts `audit_events` kind `halt.lift`. It does not dispatch. A listening run that already holds this firing’s pointer re-reads the same id and sees `lifted_at`. The load does not require `lifted_at` null.

The contact-scope `audit_events` insert stays off `writes`. Its id is `id("aud")` and is not kept. The kind is `halt.contact`. The contact path does not update any other `halt_records` row.

The HTTP body returned by `handleHaltCommit` stays the halt record. The in-memory stand-in commit does not call the dispatcher. This firing is the server handler. `confirmHalt` still returns before the commit when the scope is this contact and there is no active client. A contact-scope body that omits `contactId` still inserts and still dispatches. The audience fill that runs when `contactIds` is omitted is claim 17. This packet does not specify it and does not edit that fill. The pointer on that body is still this insert’s id.

`consentAndHaltGate`’s contact arm, `isHaltBlockingNew`’s contact arm, and `handleHaltIsContact` still omit `firm_id`. Claims 18 and 19 decide those readers. This packet does not edit them.

## Existing behavior

The contact branch inserts, audits, and dispatches without `writes`:

```94:157:server/wire-service/stores.ts
export async function handleHaltCommit(c: Context) {
  const body = await c.req.json<{
    consultantId: string;
    contactId?: string;
    firmId: string;
    scope: "contact" | "firm-book";
    reason?: string;
  }>();
  const pool = getPool();
  const haltId = id("halt");
  const haltedAt = new Date().toISOString();
  if (body.scope === "firm-book") {
    await pool.query(
      `UPDATE halt_records SET lifted_at = $1
       WHERE firm_id = $2 AND scope = 'firm-book' AND lifted_at IS NULL`,
      [haltedAt, body.firmId],
    );
  }
  await pool.query(
    `INSERT INTO halt_records
      (id, consultant_id, contact_id, firm_id, scope, reason, halted_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      haltId,
      body.consultantId,
      body.contactId ?? null,
      body.firmId,
      body.scope,
      body.reason ?? null,
      haltedAt,
    ],
  );
  await pool.query(
    `INSERT INTO audit_events (id, at, actor_id, kind, subject_type, subject_id, firm_id, payload)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      id("aud"),
      haltedAt,
      body.consultantId,
      body.scope === "firm-book" ? "halt.firm-book" : "halt.contact",
      body.scope === "firm-book" ? "firm" : "contact",
      body.scope === "firm-book" ? body.firmId : (body.contactId ?? body.firmId),
      body.firmId,
      JSON.stringify({ haltId, reason: body.reason }),
    ],
  );
  if (body.scope === "contact") {
    await dispatchEventToWorkflows(getPool(), {
      firmId: body.firmId,
      eventName: "halt_records",
      payload: { haltId, contactId: body.contactId ?? null },
      contactIds: body.contactId ? [body.contactId] : undefined,
    });
  }
  return c.json({
    id: haltId,
    consultantId: body.consultantId,
    contactId: body.contactId,
    firmId: body.firmId,
    scope: body.scope,
    reason: body.reason,
    haltedAt,
  });
}
```

`id` is `halt-` plus the clock and a short random tail:

```5:7:server/wire-service/stores.ts
function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
```

`handleHaltLift` updates the same row and does not dispatch:

```159:188:server/wire-service/stores.ts
export async function handleHaltLift(c: Context) {
  const haltId = c.req.param("haltId");
  const pool = getPool();
  const existing = await pool.query(`SELECT * FROM halt_records WHERE id = $1`, [haltId]);
  const row = existing.rows[0];
  if (!row) return c.json({ record: null });
  if (row.lifted_at) {
    return c.json({
      record: mapHalt(row),
    });
  }
  const liftedAt = new Date().toISOString();
  await pool.query(`UPDATE halt_records SET lifted_at = $1 WHERE id = $2`, [liftedAt, haltId]);
  await pool.query(
    `INSERT INTO audit_events (id, at, actor_id, kind, subject_type, subject_id, firm_id, payload)
     VALUES ($1,$2,$3,'halt.lift',$4,$5,$6,$7)`,
    [
      id("aud"),
      liftedAt,
      row.consultant_id,
      row.scope === "firm-book" ? "firm" : "contact",
      row.scope === "firm-book" ? row.firm_id : (row.contact_id ?? row.firm_id),
      row.firm_id,
      JSON.stringify({ haltId }),
    ],
  );
  return c.json({
    record: { ...mapHalt(row), liftedAt },
  });
}
```

`halt_records.id` is `TEXT PRIMARY KEY`. `contact_id` is nullable. `scope` is `contact` or `firm-book` (`supabase/migrations/003_ct_wire_stores.sql`). `event_write_set` version 1 names `halt_records` at ord 0 (`supabase/migrations/017_event_test_contract.sql`). `writesFromPayload` already returns when `payload.writes` is an array and never reads `haltId` (`server/wire-service/runWrites.ts`). `loadWriteRow` has no `halt_records` branch and falls through to null (`server/wire-service/workflowWalk.ts`). `PERSON_WRITE_TABLES` does not contain `halt_records`. `localRefFromPayload` has no `halt_records` case and returns null. `dispatchEventToWorkflows` still sets `anyPass: true` on the walked payload. Door 1 still reads the newest ten active rows for the firm (`server/wire-service/eventTest.ts`). `TRIGGER_SELECT_EVENTS` says not to add halt (`src/app/data/automationTriggerSelect.ts`). The stand-in commit in `src/app/wire/standins/haltStore.ts` does not dispatch. `confirmHalt` returns before the commit when the contact scope has no active client (`src/app/register/prototype-ant/consultant/ConsultantAntScene.tsx`).

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof.

1. The contact-scope path inserts one `halt_records` row and dispatches once. `writes` has length 1. `writes[0].table` is `halt_records`. `writes[0].id` is the `halt-` id stored on the row and the same string as `haltId`. `writes[0].contact_id` is the contact stored on the row.
2. When `contactId` is a non-empty string, `contactIds` is that one contact and the pointer’s `contact_id` is that string. When `contactId` is omitted, the column is null, the pointer’s `contact_id` is null, and `contactIds` is omitted.
3. The payload still has `haltId` and `contactId`. It does not gain root `firm_id`, `scope`, `reason`, `consultant_id`, `consultant_name`, `contact_name`, or `firm`.
4. `writesFromPayload` returns that one pointer and does not add `contact_records`. It has no `haltId` reader.
5. A `firm-book` commit still lifts other active firm-book rows for that firm, inserts one row with `contact_id` null, writes the `halt.firm-book` audit, and does not dispatch `halt_records`.
6. `loadWriteRow` for `halt_records` returns the row with `pointer.id`, or null when that id is absent. It does not select by firm, contact, `lifted_at`, or recency. After a lift of that id, the same load returns the row with `lifted_at` set.
7. `PERSON_WRITE_TABLES` does not gain `halt_records`. A pointer with null `contact_id` does not publish the `halt-` id as a person.
8. `handleHaltLift` does not dispatch. The contact-scope path does not update any other `halt_records` row. `writes` does not name `audit_events`.
9. `localRefFromPayload("halt_records")` is null. A trigger with `local_ref` set does not match. A trigger with `local_ref` unset still matches.
10. `dispatchEventToWorkflows` is unchanged. The walked trigger still receives `anyPass: true` from that function. The halt payload does not gain `anyPass`.
11. The HTTP response is still `{ id, consultantId, contactId, firmId, scope, reason, haltedAt }`.
12. `confirmHalt` still returns before the commit when the scope is contact and there is no active client. The stand-in commit still does not dispatch.
13. `consentAndHaltGate`’s contact arm, `isHaltBlockingNew`’s contact arm, and `handleHaltIsContact` still omit `firm_id`.
14. Door 1 for `halt_records` is still the newest ten active rows for the firm. No migration is added.
15. Two contact commits for one person store two primary keys. The first firing’s listener loads the first id, including after the later commit.

## Dependencies

Claim 10’s id predicate is the load. PKT-006 does not add this branch. A listener’s field read stays null until this branch is present. The array is still this firing’s handle.

PKT-004’s change specification says the current `halt_records` caller payload is unchanged apart from the forced `anyPass` copy. This packet adds `writes` to that payload. Implementing PKT-004 must not delete `writes`. This packet does not edit `SCP-pkt-004-firing-handle.md` and does not edit `dispatchEventToWorkflows`.

Claim 17 specifies the empty-contact audience. This packet does not. A contact-scope body that omits `contactId` still reaches that existing fill. The pointer is this insert’s id.

Claims 18 and 19 decide the contact arm’s `firm_id` predicate on the enroll, the send, and `handleHaltIsContact`. The pointer is unchanged. Those queries stay as they are.

The firm-book gate and the kill-switch stay the readers already in `consentAndHaltGate`, `isHaltBlockingNew`, and `handleHaltIsFirmBook`. They do not need this listening run.

## Out of scope

Door 1’s newest ten. Adding `halt_records` to `PERSON_WRITE_TABLES`. Teaching `writesFromPayload` to read `haltId`. Adding a `localRefFromPayload` case. Adding Halt to `TRIGGER_SELECT_EVENTS`. Stripping `anyPass`. Dispatching the firm-book branch or the lift. Putting `audit_events` on `writes`. Enriching the row with `consultant_name`, `contact_name`, or `firm`. A transaction around the dispatch. The stand-in store. Claims 15 and 16. Claims 18–22’s gate predicates. Claim 17’s audience fill. Launch Agent. No plate.

## Plates

None.
