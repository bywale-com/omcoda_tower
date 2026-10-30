# SCP-pkt-011 — A contact-scope halt_records firing places the inserted id on payload.writes

**Packet:** PKT-011 `pkt-011-halt-records-writes`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 14, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`. Revisions under claims 17, 18, and 19 leave this pointer unchanged. Claim 10 is the id predicate.  
**Contract:** `docs/factory/components/firing-pointers/CONTRACT.md` — claim 14’s one-element array. The firm-book branch and the lift do not dispatch. The table stays out of `PERSON_WRITE_TABLES`. `docs/factory/components/walk-handle/CONTRACT.md` — claim 10’s `WHERE id = pointer.id` load. PKT-011 loads `halt_records`. That branch is not PKT-006.

## Intent

`handleHaltCommit` still inserts one `halt_records` row. `id("halt")` is unchanged: `halt-` plus `Date.now()`, a hyphen, and `Math.random().toString(36).slice(2, 8)`. That binding, `haltId`, is the insert id, the payload `haltId`, `writes[0].id`, and the HTTP `id`. The stored columns stay `consultant_id`, `contact_id` (`body.contactId ?? null`), `firm_id`, `scope`, `reason` (`body.reason ?? null`), and `halted_at`. `lifted_at` stays null on the insert because the column is not in the insert list. The same handler still inserts one `audit_events` row. Its id is the inline `id("aud")` call and is not kept. When `scope` is `contact`, the handler still calls `dispatchEventToWorkflows` once. The call stays a direct await of `getPool()`. This packet does not add a transaction and does not swallow a dispatch error.

The contact-scope payload gains

`writes: [{ table: "halt_records", id: <haltId>, contact_id: <body.contactId ?? null> }]`

That pointer is the only element. `writes[0].id` is the same string as `haltId` and as the primary key stored on the row. `contact_id` on the pointer is the same expression as the insert’s `contact_id` bind. When `body.contactId` is a non-empty string, the column is that string, `contactIds` is that one contact, and `personIdsFromWrites` uses `contact_id`. When `body.contactId` is omitted, the column is null, the pointer’s `contact_id` is null, and `contactIds` is omitted. `halt_records` stays out of `PERSON_WRITE_TABLES`. A null `contact_id` does not publish the `halt-` id as a person. `firm_id` stays off the pointer. `RunWrite` has no such field.

The keys already on the payload stay: `haltId` and `contactId`. `contactId` remains `body.contactId ?? null`, so the key is present when the value is null. The payload does not gain `firm_id`, `scope`, `reason`, `consultant_id`, `consultant_name`, `contact_name`, or `firm` at the root, and it does not gain `anyPass`. `writesFromPayload` gains no reader for `haltId`. With `writes` present it returns that one pointer and does not add `contact_records`. The payload must not gain a `contactIds` array. That name is the dispatch argument. A `contactIds` array on the payload would feed the contact-records fallthrough whenever `writes` is absent.

`localRefFromPayload` and `triggerLocalRefFromPayload` gain no `halt_records` case. Both still return null for this event. `localAxesMatch` compares `local_ref` only when `local_ref` is set, so a trigger with no `local_ref` still matches, and a trigger with `local_ref` set does not. The firm compare still falls back to `opts.firmId` because the payload has no `firm_id`. The contact compare still reads `payload.contactId`, then `contactIds`. This packet does not add Halt to `TRIGGER_SELECT_EVENTS`. The comment on that list still says not to add halt. `WORKFLOW_EVENTS_WITH_LOCAL` still omits `halt_records`. The Hub catalog label is not the product face.

`dispatchEventToWorkflows` is not edited. It still copies the payload and still sets `anyPass: true` on the walked trigger. `writes` has to be on the object passed in, because the copy is what `writesFromPayload` reads. Claim 7’s refusal of `anyPass` is not recut. This packet does not put `anyPass` on the halt payload. PKT-004 removes the forced copy. Implementing PKT-004 must not delete `writes`.

`loadWriteRow` gains a `halt_records` branch: `SELECT * FROM halt_records WHERE id=$1` bound to `w.id`. No `firm_id`, no `contact_id`, no `lifted_at`, no `ORDER BY`, no “latest”. No row with that id returns null. A miss does not try `contact_id`. That is the predicate claim 10 locked. This packet adds the branch. It does not change the predicate. A later node reads `consultant_id`, `scope`, `reason`, `halted_at`, and `lifted_at` from that row. On this firing `scope` is `contact` and `lifted_at` is null until a lift. Those columns are not copied onto the dispatch.

`event_write_set` version 1 already names `halt_records` alone, at ord 0. This packet does not write a migration and does not retune door 1. Door 1 for this event stays the newest ten `halt_records` rows for the firm with `lifted_at` null, both scopes. The two version-1 specimen bodies are not this firing’s cardinality.

When `scope` is `firm-book`, the handler still sets `lifted_at` on every other active firm-book row for that firm, inserts the new row with `contact_id` null, inserts `audit_events` kind `halt.firm-book`, and does not call `dispatchEventToWorkflows`. The founder kill-switch is that same scope. This packet does not add the call.

`handleHaltLift` still sets `lifted_at` on the row with this id and inserts `audit_events` kind `halt.lift`. It does not dispatch. A listening run that already holds this firing’s pointer re-reads the same id and sees `lifted_at`. The load does not require `lifted_at` null.

The contact-scope `audit_events` insert stays off `writes`. The kind is `halt.contact`. The contact path does not update any other `halt_records` row.

The HTTP body returned by `handleHaltCommit` stays the halt record. The in-memory stand-in commit does not call the dispatcher. This firing is the server handler. `confirmHalt` in `ConsultantAntScene` still returns before the commit when the scope is contact and there is no active client. A contact-scope body that omits `contactId` still inserts and still dispatches. The audience fill that runs when `contactIds` is omitted is claim 17. This packet does not specify it and does not edit that fill. The pointer on that body is still this insert’s id.

`consentAndHaltGate`’s contact arm, `isHaltBlockingNew`’s contact arm, and `handleHaltIsContact` still omit `firm_id`. Claims 18 and 19 decide those readers. This packet does not edit them.

## Must / must-not

- Keep one halt id. `const haltId = id("halt")` stays the only `id("halt")` call in `handleHaltCommit`. That same binding is the insert’s `$1`, `payload.haltId`, `writes[0].id`, and the HTTP `id`. Do not mint a second id for the pointer. Do not build the halt id only inside the query parameter list.
- Leave `id`. It stays file-private. The formula stays `` `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` ``.
- The contact-scope payload is the existing pair plus `writes`. `contactIds` stays the argument, not a payload key:

```ts
await dispatchEventToWorkflows(getPool(), {
  firmId: body.firmId,
  eventName: "halt_records",
  payload: {
    haltId,
    contactId: body.contactId ?? null,
    writes: [
      {
        table: "halt_records",
        id: haltId,
        contact_id: body.contactId ?? null,
      },
    ],
  },
  contactIds: body.contactId ? [body.contactId] : undefined,
});
```

- `contact_id` on the pointer is the same expression as the insert bind `body.contactId ?? null`. When `body.contactId` is omitted, both are null and the `contactIds` argument is `undefined`, not `[]`. When `body.contactId` is a non-empty string, both are that string and `contactIds` is that one-element array. Do not bind the pointer’s `contact_id` to `haltId`. Do not omit the `contact_id` key.
- Keep the call inside `if (body.scope === "contact")`, after the audit insert, as a direct `await`. Do not wrap it in `try/catch`. Do not add `BEGIN` or `COMMIT`. A dispatch error still propagates. The halt row and the audit row are already written by the statements above and stay.
- Keep `dispatchEventToWorkflows(getPool(), …)`. Do not switch that call to the local `pool` variable as a cleanup.
- Do not put `firm_id`, `scope`, `reason`, `consultant_id`, `consultant_name`, `contact_name`, `firm`, `contactIds`, or `anyPass` on the caller payload. Do not put `firm_id` on the pointer. Do not put `audit_events` on the array. The array length is 1. The dispatcher’s `anyPass` copy stays where it is.
- Leave the insert column list: `id, consultant_id, contact_id, firm_id, scope, reason, halted_at`. Leave the firm-book `UPDATE` where it is, before the insert, and only inside `if (body.scope === "firm-book")`. The contact path does not run it. Leave the audit insert, including `id("aud")` inline, the kind `halt.firm-book` or `halt.contact`, and the subject id `body.firmId` or `body.contactId ?? body.firmId`. Do not keep the audit id. Do not dispatch on the firm-book branch.
- Leave `handleHaltLift`. It still loads `SELECT * FROM halt_records WHERE id = $1`, returns `{ record: null }` when the id is absent, returns the mapped row when `lifted_at` is already set, otherwise sets `lifted_at` and inserts kind `halt.lift`. It does not call `dispatchEventToWorkflows`.
- Leave the HTTP object: `{ id: haltId, consultantId, contactId: body.contactId, firmId, scope, reason, haltedAt }`. Do not add `writes` to it. Do not normalize an omitted `contactId` to `null` on this object. The payload’s `contactId` is the place that uses `?? null`.
- Add one `loadWriteRow` branch, as literal SQL, before the final `return null`:

```ts
if (w.table === "halt_records") {
  const { rows } = await pool.query(`SELECT * FROM halt_records WHERE id=$1`, [w.id]);
  return (rows[0] as Record<string, unknown> | undefined) ?? null;
}
```

  No `firm_id`, no `contact_id`, no `lifted_at`, no `ORDER BY`, no `LIMIT`. No row returns null. Do not interpolate the table name. Do not query again by `contact_id` when `rows[0]` is missing. Do not use `w.contact_id ?? w.id` on this branch. Leave the `const contactId = w.contact_id ?? w.id` that the earlier branches already use. Leave every other branch, including a `campaign_failure`, `fact_writebacks`, `meeting_booked`, `wait_occupancy`, `engagement_records`, `consent_records`, or eligibility branch another packet may already have added. PKT-012’s consent load is `contact_id` plus the walk’s firm. It is not this branch. Do not export `loadWriteRow`. If it is already exported, leave the export.
- Do not add `halt_records` to `PERSON_WRITE_TABLES`. Do not remove a name that is already there. Do not edit `personTableOf`, `evalIfPick`, `personIdsFromWrites`, `pickWrites`, or either `find` in `resolveOperandText`.
- Do not edit `writesFromPayload`. Do not teach it to read `haltId`. Do not teach it to read singular `contactId` as a `contact_records` id.
- Do not edit `localRefFromPayload`, `triggerLocalRefFromPayload`, `localAxesMatch`, or `triggerLocalAxesMatch`. Do not add a `halt_records` arm. Both ref readers still fall through to `return null`.
- Do not edit `dispatchEventToWorkflows`, including the `anyPass` copy and the empty-list book fill. Stripping `anyPass` is PKT-004. The empty-contact audience is claim 17.
- Do not edit `TRIGGER_SELECT_EVENTS` or its comment `Do not add eligibility / halt / meeting.` Do not add `halt_records` to `WORKFLOW_EVENTS_WITH_LOCAL`. Do not edit `WORKFLOW_EVENT_CATALOG`.
- Do not bump `event_write_set`. Do not read `event_write_set` or `event_test_data` to build this payload. Do not edit `eventTest.ts`. Door 1 for this event stays `SELECT * FROM halt_records WHERE firm_id=$1 AND lifted_at IS NULL ORDER BY halted_at DESC LIMIT 10`. Do not add a migration.
- Do not edit `consentAndHaltGate`, `isHaltBlockingNew`, `handleHaltIsContact`, or `handleHaltIsFirmBook`. Do not edit `confirmHalt` or `standInHaltStore`. Do not edit `routes.ts`.

## Stores and contracts

No new table and no new column. No migration. No new `event_write_set` version.

`halt_records.id` is `TEXT PRIMARY KEY`. `contact_id` is nullable. `consultant_id` and `firm_id` are required. `scope` is `contact` or `firm-book`. `lifted_at` is nullable and stays null when the insert omits it. The partial indexes are the active-book and active-contact scans. They are not the load.

```19:36:supabase/migrations/003_ct_wire_stores.sql
CREATE TABLE IF NOT EXISTS halt_records (
  id TEXT PRIMARY KEY,
  consultant_id TEXT NOT NULL,
  contact_id TEXT,
  firm_id TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('contact', 'firm-book')),
  reason TEXT,
  halted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lifted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS halt_records_firm_active_idx
  ON halt_records (firm_id)
  WHERE lifted_at IS NULL;

CREATE INDEX IF NOT EXISTS halt_records_contact_active_idx
  ON halt_records (contact_id)
  WHERE lifted_at IS NULL AND scope = 'contact';
```

The registered write-set is already this one table at ord 0. The array this firing publishes is that contract. It is not read at fire time. The two specimen bodies are door data. One is a contact halt and one is a firm-book halt, and the firm-book body carries `consultant_name`, `contact_name`, and `firm`. The live insert does not copy those keys, and this firing’s array length is 1, not 2.

```43:43:supabase/migrations/017_event_test_contract.sql
('halt_records', 1, 'halt_records', 0),
```

```110:111:supabase/migrations/017_event_test_contract.sql
('etd-halt-moreau', 'halt_records', 1, 'halt_records', 0, '{"id":"halt-harbor-moreau-contact","consultant_id":"standin-u-1","consultant_name":"Amira Chen","contact_id":"cr-harbor-moreau","contact_name":"Hanae Moreau","firm_id":"firm-standin-harbor","firm":"Harbor RCIC","scope":"contact","reason":"No reachable channel — pause outreach until email or phone is on file","halted_at":"2026-08-12T15:10:00.000Z","lifted_at":null}'::jsonb),
('etd-halt-book', 'halt_records', 1, 'halt_records', 1, '{"id":"halt-harbor-book-ircc-outage","consultant_id":"standin-u-1","consultant_name":"Amira Chen","contact_id":null,"firm_id":"firm-standin-harbor","firm":"Harbor RCIC","scope":"firm-book","reason":"IRCC portal outage — hold the Harbor book until Monday","halted_at":"2026-08-16T02:15:00.000Z","lifted_at":null}'::jsonb),
```

The handle type stays. `contact_id` is optional on the type. This firing sets it, including to null. The type has no `firm_id`.

```1:6:server/wire-service/runWrites.ts
/** This run’s writes — the next node’s input. Not an events table. */
export type RunWrite = {
  table: string;
  id: string;
  contact_id?: string | null;
};
```

`writesFromPayload` returns when `payload.writes` is an array. It does not continue into `contact_records`. There is no `haltId` branch. An element with no string `table` or no string `id` is dropped. A `contact_id` that is not a string, including `null`, is stored as `null`. Extra keys on the element, including `firm_id`, are not copied.

```8:43:server/wire-service/runWrites.ts
export function writesFromPayload(payload: Record<string, unknown> | undefined): RunWrite[] {
  const raw = payload?.writes;
  if (Array.isArray(raw)) {
    return raw
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const rec = row as Record<string, unknown>;
        const table = typeof rec.table === "string" ? rec.table : "";
        const id = typeof rec.id === "string" ? rec.id : "";
        if (!table || !id) return null;
        const contact_id =
          typeof rec.contact_id === "string"
            ? rec.contact_id
            : typeof rec.contactId === "string"
              ? rec.contactId
              : null;
        return { table, id, contact_id };
      })
      .filter((row): row is RunWrite => Boolean(row));
  }
  const batchId =
    typeof payload?.import_batch_id === "string"
      ? payload.import_batch_id
      : typeof payload?.importBatchId === "string"
        ? payload.importBatchId
        : "";
  const contactIds = Array.isArray(payload?.contact_ids)
    ? payload.contact_ids.map(String)
    : Array.isArray(payload?.contactIds)
      ? (payload.contactIds as unknown[]).map(String)
      : [];
  const out: RunWrite[] = [];
  if (batchId) out.push({ table: "import_batch", id: batchId });
  for (const id of contactIds) out.push({ table: "contact_records", id, contact_id: id });
  return out;
}
```

The lines after the array return push `import_batch` and then one `contact_records` pointer per id in `payload.contact_ids` or `payload.contactIds`. They never read `haltId` or singular `contactId`. Today’s halt payload has neither array, so a missing `writes` key yields an empty handle. Adding `writes` is what publishes the pointer.

`loadWriteRow` returns null after the tables it already knows. `halt_records` is not among them. The function begins with the pair loads and continues through `contact_records`, `contact_tag`, `audit_runs`, `import_batch`, and `enrollment`. It ends at `missing_fact_signals`, then `return null`.

```655:667:server/wire-service/workflowWalk.ts
async function loadWriteRow(
  pool: Pool,
  firmId: string,
  w: RunWrite,
): Promise<Record<string, unknown> | null> {
  const contactId = w.contact_id ?? w.id;
  if (w.table === "sequence_ready") {
    const { rows } = await pool.query(
      `SELECT * FROM sequence_ready WHERE contact_id=$1 AND firm_id=$2`,
      [contactId, firmId],
    );
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
```

```695:700:server/wire-service/workflowWalk.ts
  if (w.table === "missing_fact_signals") {
    const { rows } = await pool.query(`SELECT * FROM missing_fact_signals WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  return null;
}
```

`audit_events.id` is `TEXT PRIMARY KEY`. The halt insert already writes `kind`, `subject_type`, `subject_id`, `firm_id`, and a jsonb `{ haltId, reason }`. That row is not a write-set element.

```59:68:supabase/migrations/003_ct_wire_stores.sql
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  firm_id TEXT,
  payload JSONB
);
```

## Runtime

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

`id` is `halt-` plus the clock and a short random tail. The audit call uses the same function with prefix `aud` and discards the return.

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

`PERSON_WRITE_TABLES` does not contain `halt_records`. `personIdsFromWrites` uses `contact_id` before it consults that set. A null `contact_id` therefore becomes null, and `uniqueIds` drops it. The `halt-` id is not a person. Adding the table name is what would publish that id when `contact_id` is null, and what would person-split an If once `ctx.contactIds` is non-empty.

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

```264:268:server/wire-service/workflowWalk.ts
function personIdsFromWrites(writes: RunWrite[]): string[] {
  return uniqueIds(
    writes.map((w) => w.contact_id ?? (PERSON_WRITE_TABLES.has(w.table) ? w.id : null)),
  );
}
```

`evalIfPick` person-splits only when `personTableOf` finds the pick table in that set and `ctx.contactIds` is non-empty. An empty contact list hides a set change: the detail stays `branch →`. The load walks that prove the set pass a non-empty `contactIds`.

```917:940:server/wire-service/workflowWalk.ts
async function evalIfPick(
  pool: Pool,
  ctx: WalkContext,
  data: Record<string, unknown>,
): Promise<{ thenIds: string[]; elseIds: string[]; pass: boolean; personSplit: boolean }> {
  const compares = comparesForIf(data);
  const personTable = personTableOf(data, compares);
  if (personTable && ctx.contactIds.length) {
    const thenIds: string[] = [];
    const elseIds: string[] = [];
    for (const cid of ctx.contactIds) {
      if (await allComparesPass(pool, ctx, data, compares, cid)) thenIds.push(cid);
      else elseIds.push(cid);
    }
    return { thenIds, elseIds, pass: thenIds.length > 0, personSplit: true };
  }
  const pass = await allComparesPass(pool, ctx, data, compares);
  return {
    thenIds: pass ? ctx.contactIds : [],
    elseIds: pass ? [] : ctx.contactIds,
    pass,
    personSplit: false,
  };
}
```

Neither local-ref reader names this event. A set `local_ref` compares against null and fails. The functions stay.

```1853:1871:server/wire-service/workflowWalk.ts
function localRefFromPayload(
  eventName: string,
  payload: Record<string, unknown> | undefined,
): string | null {
  if (eventName === "fact_writebacks") return payloadString(payload, ["form_ref", "formRef"]);
  if (eventName === "campaign_failure") return payloadString(payload, ["campaign_id", "campaignId"]);
  if (eventName === "ct_firms") return payloadString(payload, ["id", "firm_id", "firmId"]);
  if (eventName === "consent_records.opt_out") return payloadString(payload, ["contact_id", "contactId"]);
  if (eventName === "contact_import") return payloadString(payload, ["import_batch_id", "importBatchId"]);
  if (eventName === "contact.created") return payloadString(payload, ["contact_id", "contactId", "id"]);
  if (eventName === "consent_records.sequenced") {
    return payloadString(payload, ["sequence_id", "sequenceId"]);
  }
  if (eventName === "contact_uploaded") return payloadString(payload, ["kind"]);
  if (eventName === "objective_met") {
    return payloadString(payload, ["campaign_objective_id", "campaignObjectiveId", "campaign_id", "campaignId"]);
  }
  return null;
}
```

```145:166:src/app/data/automationTriggerSelect.ts
export function triggerLocalRefFromPayload(
  eventName: string,
  payload?: Record<string, unknown>,
): string | null {
  if (eventName === "fact_writebacks") return payloadString(payload, ["form_ref", "formRef"]);
  if (eventName === "campaign_failure") return payloadString(payload, ["campaign_id", "campaignId"]);
  if (eventName === "ct_firms") return payloadString(payload, ["id", "firm_id", "firmId"]);
  if (eventName === "consent_records.opt_out") return payloadString(payload, ["contact_id", "contactId"]);
  if (eventName === "contact_import") return payloadString(payload, ["import_batch_id", "importBatchId"]);
  if (eventName === "contact.created") return payloadString(payload, ["contact_id", "contactId", "id"]);
  if (eventName === "consent_records.sequenced") return payloadString(payload, ["sequence_id", "sequenceId"]);
  if (eventName === "contact_uploaded") return payloadString(payload, ["kind"]);
  if (eventName === "objective_met") {
    return payloadString(payload, [
      "campaign_objective_id",
      "campaignObjectiveId",
      "campaign_id",
      "campaignId",
    ]);
  }
  return null;
}
```

`localAxesMatch` compares `local_ref` only when it is set. The firm compare uses a root `firm_id` / `firmId` when that string is present, and otherwise `opts.firmId`. The contact compare uses a root `contact_id` / `contactId` when that string is present, and otherwise `opts.contactIds`. `payloadString` returns null for a null or blank value. This caller passes `firmId` and `contactIds` as arguments. The payload’s `contactId` is what the contact compare sees first.

```1873:1902:server/wire-service/workflowWalk.ts
function localAxesMatch(
  row: {
    grain: string;
    local_ref: string | null;
    local_firm_id: string | null;
    local_contact_ids: string[] | null;
  },
  opts: {
    firmId: string;
    eventName: string;
    payload?: Record<string, unknown>;
    contactIds?: string[];
  },
): boolean {
  if (row.grain !== "local") return true;
  if (row.local_firm_id) {
    const writeFirm = payloadString(opts.payload, ["firm_id", "firmId"]) ?? opts.firmId;
    if (writeFirm !== row.local_firm_id) return false;
  }
  const specified = (row.local_contact_ids ?? []).filter(Boolean);
  if (specified.length) {
    const cid = payloadString(opts.payload, ["contact_id", "contactId"]);
    const incoming = cid ? [cid] : (opts.contactIds ?? []);
    if (!incoming.some((id) => specified.includes(id))) return false;
  }
  if (row.local_ref) {
    if (localRefFromPayload(opts.eventName, opts.payload) !== row.local_ref) return false;
  }
  return true;
}
```

The walked trigger still receives the forced copy. This packet leaves that line. The spread copies `writes` only when `writes` is already on `opts.payload`.

```1970:1977:server/wire-service/workflowWalk.ts
    const walked = await walkValidatedWorkflow(pool, {
      workflowId: row.workflow_id,
      firmId: opts.firmId,
      runId,
      triggerLabel: `event:${opts.eventName}`,
      triggerPayload: { ...(opts.payload ?? {}), eventName: opts.eventName, anyPass: true },
      contactIds,
    });
```

When the caller omits `contactIds`, the every-firm audience fills the book before that walk. This packet does not edit the fill. A `select_from` audience is a different branch of the same function. The fixture workflows leave `audience_scope` at its default `every_firm`.

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

The walk does not store `triggerPayload`. It stores `writesFromPayload`’s output on the trigger node. That stored array is the handle this packet proves. `haltId`, `contactId`, and `anyPass` are not on `node_status`. When the caller list is empty, the walk fills `contactIds` from `personIdsFromWrites`. A null pointer `contact_id` on a table outside the set leaves that list empty.

```1091:1104:server/wire-service/workflowWalk.ts
  let contactIds = opts.contactIds ?? [];
  const triggerWrites = writesFromPayload(opts.triggerPayload);
  if (!contactIds.length) {
    contactIds = personIdsFromWrites(triggerWrites);
  }

  const ctx: WalkContext = {
    firmId: opts.firmId,
    workflowId: opts.workflowId,
    runId: opts.runId,
    triggerPayload: opts.triggerPayload ?? {},
    constants: {},
    contactIds,
    previousWrites: triggerWrites,
```

```1145:1152:server/wire-service/workflowWalk.ts
      if (type === "trigger") {
        commitWrites(ctx, nodeId, ctx.previousWrites);
        nodeStatus[nodeId] = {
          status: "success",
          detail: `trigger ${triggerKind(data)}`,
          at: now(),
          writes: ctx.previousWrites,
        };
```

`node_status` and `counts.contacts` are written onto `workflow_run` at the end of the walk. `counts.contacts` is `ctx.contactIds.length`. The verify reads those columns. `walkValidatedWorkflow` updates the run. It does not insert it. `dispatchEventToWorkflows` inserts the run before the walk. A direct load walk inserts the run first.

```1666:1682:server/wire-service/workflowWalk.ts
  const failed = Object.values(nodeStatus).some((s) => s.status === "failed");
  await pool.query(
    `UPDATE workflow_run
     SET status=$2, waiting_node_id=NULL, resume_at=NULL,
         node_status=$3::jsonb, counts=$4::jsonb, finished_at=now()
     WHERE id=$1`,
    [
      opts.runId,
      failed ? "failed" : "success",
      JSON.stringify(nodeStatus),
      JSON.stringify({
        nodes: Object.keys(nodeStatus).length,
        enrollments: enrollments.length,
        contacts: ctx.contactIds.length,
      }),
    ],
  );
```

The If detail when this table is not in the set is `branch → ${ctx.branchTaken}`. A detail that starts with `if pick ` means the set was changed.

```1173:1184:server/wire-service/workflowWalk.ts
      if (type === "branch" || type === "if") {
        const picked = await evalIfPick(pool, ctx, data);
        ctx.branchTaken = picked.pass ? "true" : "false";
        ctx.chainWrites[nodeId] = ctx.previousWrites;
        nodeStatus[nodeId] = {
          status: "success",
          detail: picked.personSplit
            ? `if pick ${String(data.pickTable ?? "")}.${String(data.pickField ?? "")} then=${picked.thenIds.length} else=${picked.elseIds.length}`
            : `branch → ${ctx.branchTaken}`,
          at: now(),
          writes: ctx.previousWrites,
        };
```

The legacy pick becomes one compare. `resolveOperandText` takes `picked[0]` when no `contactId` is passed, and otherwise the pointer whose `contact_id` or `id` equals that contact, then `picked[0]`. `nestedField` walks a dotted path. node-pg returns `timestamptz` as a `Date`. `String` of that value is non-empty, so `exists` passes after a lift. A null column becomes `undefined`, and `exists` fails. This packet does not add a parser and does not change `comparePasses`.

```828:846:server/wire-service/workflowWalk.ts
function comparesForIf(data: Record<string, unknown>): WalkCompare[] {
  const main = parseCompare(data.compare);
  const extra = Array.isArray(data.and)
    ? (data.and.map(parseCompare).filter(Boolean) as WalkCompare[])
    : [];
  if (main) return [main, ...extra];
  const pickTable = String(data.pickTable ?? "").trim();
  const pickField = String(data.pickField ?? "").trim();
  if (pickTable && pickField) {
    return [
      {
        left: { mode: "chip", slot: "__legacy" },
        op: String(data.pickOp ?? "eq"),
        right: { mode: "text", value: String(data.pickValue ?? "") },
      },
    ];
  }
  return [];
}
```

Door 1 for this event still takes the newest ten active rows for the firm, both scopes. That reader is not the run handle. A later `halted_at` on a decoy is how the load walks show the handle is the pointer id.

```160:167:server/wire-service/eventTest.ts
    if (eventName === "halt_records") {
      const ok = await push(
        "halt_records",
        `SELECT * FROM halt_records WHERE firm_id=$1 AND lifted_at IS NULL ORDER BY halted_at DESC LIMIT 10`,
        [firm],
      );
      return ok ? out : null;
    }
```

`TRIGGER_SELECT_EVENTS` is the A26 list. Halt is not on it.

```29:30:src/app/data/automationTriggerSelect.ts
/** A26 named list. Do not add eligibility / halt / meeting. */
export const TRIGGER_SELECT_EVENTS: TriggerSelectEvent[] = [
```

`WORKFLOW_EVENTS_WITH_LOCAL` has no `halt_records` member. The catalog line `{ id: "halt_records", label: "Halt" }` is the Hub label. It is not the product face and it is not a listener.

```319:326:src/app/data/automationWorkflows.ts
export const WORKFLOW_EVENTS_WITH_LOCAL = new Set<WorkflowTriggerEvent>([
  "fact_writebacks",
  "campaign_failure",
  "ct_firms",
  "consent_records.sequenced",
  "contact_uploaded",
  "objective_met",
]);
```

The contact arms that claims 18 and 19 still own omit `firm_id`. The firm-book arms keep `firm_id`. This packet does not retune either.

```81:86:server/wire-service/dispatchSend.ts
  const contactHalted = await pool.query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL AND scope = 'contact' AND contact_id = $1
     LIMIT 1`,
    [contactId],
  );
```

```99:106:server/wire-service/dispatchSend.ts
  const halted = await pool.query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL
       AND ((scope = 'firm-book' AND firm_id = $1)
         OR ($2::text IS NOT NULL AND scope = 'contact' AND contact_id = $2))
     LIMIT 1`,
    [firmId, contactId ?? null],
  );
```

```201:210:server/wire-service/stores.ts
export async function handleHaltIsContact(c: Context) {
  const contactId = c.req.param("contactId");
  const result = await getPool().query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL AND scope = 'contact' AND contact_id = $1
     LIMIT 1`,
    [contactId],
  );
  return c.json({ halted: result.rowCount! > 0 });
}
```

`confirmHalt` on the Ant desk returns before the stand-in commit when the contact scope has no active client. The prototype scene’s `confirmHalt` is a different function. This packet does not edit it.

```128:138:src/app/register/prototype-ant/consultant/ConsultantAntScene.tsx
  async function confirmHalt() {
    const portScope = haltScope === "book" ? "firm-book" : "contact";
    if (portScope === "contact" && !activeClientId) return;
    const firmId = wireFirmId();
    const record = await wirePorts.haltStore.commit({
      consultantId: `consultant-${firmId}`,
      firmId,
      contactId: portScope === "contact" ? activeClientId! : undefined,
      scope: portScope,
      reason: haltReason.trim() || undefined,
    });
```

The stand-in commit stores the record in a `Map` and appends an audit. It does not call `dispatchEventToWorkflows` and it does not insert `halt_records`. Its id is `halt-` plus the clock plus the map size. That formula is not `id("halt")`. This firing is the server handler.

```6:40:src/app/wire/standins/haltStore.ts
export const standInHaltStore: HaltStorePort = {
  tag: "stand-in",
  async commit(input: HaltCommitInput): Promise<HaltRecord> {
    const id = `halt-${Date.now()}-${halts.size + 1}`;
    const record: HaltRecord = {
      id,
      consultantId: input.consultantId,
      contactId: input.contactId,
      firmId: input.firmId,
      scope: input.scope,
      reason: input.reason,
      haltedAt: new Date().toISOString(),
    };
    // Firm-book halt supersedes prior active firm-book for same firm.
    if (input.scope === "firm-book") {
      for (const [key, existing] of halts) {
        if (
          existing.firmId === input.firmId &&
          existing.scope === "firm-book" &&
          !existing.liftedAt
        ) {
          halts.set(key, { ...existing, liftedAt: record.haltedAt });
        }
      }
    }
    halts.set(id, record);
    await standInAuditTrail.append({
      actorId: input.consultantId,
      kind: input.scope === "firm-book" ? "halt.firm-book" : "halt.contact",
      subjectType: input.scope === "firm-book" ? "firm" : "contact",
      subjectId: input.scope === "firm-book" ? input.firmId : (input.contactId ?? input.firmId),
      payload: { haltId: id, reason: input.reason },
    });
    return record;
  },
```

## Ports

No new port.

These stay on the same functions:

- `POST /halt` → `handleHaltCommit`. The JSON body stays `consultantId`, optional `contactId`, `firmId`, `scope`, optional `reason`. The contact-scope dispatch gains `writes`. The response body stays the halt record.
- `POST /halt/:haltId/lift` → `handleHaltLift`. Same param. Same response. No dispatch.
- `GET /halt`, `GET /halt/contact/:contactId`, and `GET /halt/firm-book/:firmId` stay. `handleHaltList` is not door 1 and not the id load.
- `dispatchEventToWorkflows` for `halt_records`. Same `firmId`. `contactIds` stays `body.contactId ? [body.contactId] : undefined`. The payload gains `writes`.
- `loadWriteRow` gains one branch. It is not an HTTP route.
- `writesFromPayload`, `localRefFromPayload`, `triggerLocalRefFromPayload`, `localAxesMatch`, and `triggerLocalAxesMatch`. Unchanged readers.
- Door 1 in `eventTest.ts`. Unchanged.
- `confirmHalt` and `standInHaltStore.commit`. Unchanged. The stand-in is not this firing.

```151:155:server/wire-service/routes.ts
  wire.post("/halt", handleHaltCommit);
  wire.post("/halt/:haltId/lift", handleHaltLift);
  wire.get("/halt", handleHaltList);
  wire.get("/halt/contact/:contactId", handleHaltIsContact);
  wire.get("/halt/firm-book/:firmId", handleHaltIsFirmBook);
```

## Verify

`scripts/verify-halt-records-writes.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` after migrate and seed, beside `verify-click-attribution`. `npm run build` is not this proof.

The script uses `getPool()` the way `scripts/verify-click-attribution.ts` does. It exits 2 when `DATABASE_URL` is missing. Firm id is `firm-pkt011-` plus a run token, plus a second firm `firm-pkt011-` plus the token plus `-other`. Neither is the seeded Harbor firm. The script does not set send mode, does not call `tickOnce`, and does not require `TEST_EMAIL_TO` or `TEST_SMS_TO`. It does not boot Vite and does not call the stand-in.

It inserts its own `ct_firms` (`name` required) and two `contact_records` on the first firm (`id`, `firm_id`, `name`). One contact is the halt contact. The other is only there so a book fill is larger than one. It inserts one active `halt_records` firm-book row on the first firm and one active firm-book row on the other firm, each with its own `halt-` id, before any handler call. It inserts `workflow` (`name` required, `target` `contact`, `graph` the listener or the load graph, `audience_scope` left at the default `every_firm`) and `workflow_state` (`active`). It calls `materializeTriggersFromGraph`. It deletes the rows it inserts, in foreign-key order: `workflow_run`, `workflow_trigger`, `workflow_state`, `workflow`, `audit_events`, `halt_records`, `contact_records`, `ct_firms`, by these two firm ids and these workflow ids.

Calls go to `handleHaltCommit` and `handleHaltLift` with a context whose `req.json` returns the body, whose `req.param("haltId")` returns the id, and whose `json` returns `{ body, status }`. Assertions on runs use this script’s `workflow_id` values only.

Listener graphs are a trigger plus an `exit`, with an edge from the trigger to the exit. `isValidatedPipeline` accepts that. Trigger `data.triggerKind` is `"event"`. `data.triggerEvent` is `"halt_records"`. `data.configured` is not `false`. Six listeners on the first firm:

- global
- local, `data.grain` `"local"`, `data.localRef` unset, `data.localFirmId` unset, `data.localContactIds` unset
- local, `data.localRef` `"halt-axis"`
- local, `data.localFirmId` the first firm id, `data.localRef` unset
- local, `data.localFirmId` `"firm-other"`, `data.localRef` unset
- local, `data.localContactIds` the halt contact, `data.localRef` unset

`workflow_trigger_local_ref` was dropped in `supabase/migrations/016_trigger_local_cascade.sql`, so a local row may store a null `local_ref`.

The load walks call `walkValidatedWorkflow` directly. Each one inserts its `workflow_run` (`status` `running`) before the call, because the walker only updates that row. `loadWriteRow` stays unexported. Each graph is a trigger plus an `if` plus an `exit`. The If uses the legacy pick: `pickTable` `"halt_records"`, `pickOp` `"eq"` or `"exists"`, `pickValue` the passing text when the op is `eq`. `configured` is not `false`. `contactIds` on a field walk is a one-element list, so a set change is visible. Trigger `payload.writes` is the one pointer the case states. The If detail is `branch → true` or `branch → false`. A detail that starts with `if pick ` means `halt_records` was added to `PERSON_WRITE_TABLES`, and that case fails.

The walk does not store `triggerPayload`. `haltId` and the root `contactId` are proved by the HTTP body, the row, the local-contact listener, and the shape guard. A null `contactId` and a missing key both return null from `payloadString`, so the listener cannot tell them apart. The object literal is the proof the key is present when the value is null. `anyPass` is not on `node_status`. The shape guard is the proof the caller payload does not set it.

1. One contact-scope `handleHaltCommit` with `contactId` the halt contact, a reason `"first"`, and the consultant id. The HTTP body has `id`, `consultantId`, `contactId`, `firmId`, `scope` `"contact"`, `reason` `"first"`, and `haltedAt`. It has no `writes` and no `haltId`. `id` starts with `halt-`. One new `halt_records` row has that id, that contact, `scope` `"contact"`, `reason` `"first"`, `consultant_id` the consultant, `firm_id` the first firm, and `lifted_at` null. `halted_at` is the same instant as `haltedAt`. The pre-existing firm-book row on this firm still has `lifted_at` null. One `audit_events` row has kind `halt.contact`, `subject_type` `"contact"`, `subject_id` the halt contact, and payload `haltId` equal to this id. Event runs exist for the global listener, the unset-`localRef` listener, the listener whose `local_firm_id` is this firm, and the listener whose `local_contact_ids` is this contact. No event run exists for `halt-axis`, for `firm-other`, or for a contact list that does not include this contact. Each matching event run’s trigger `writes` has length 1. `writes[0].table` is `halt_records`. `writes[0].id` is the row id and the HTTP `id`. `writes[0].contact_id` is the contact column. No element has `firm_id`. No element has table `audit_events` or `contact_records`. `counts.contacts` is 1 on each of those runs. The firm has two contacts, so a book fill in place of the caller list would have stored 2.
2. `writesFromPayload` of `{ writes: [that pointer], contactIds: [the contact], haltId: the id, contactId: the contact }` returns that one pointer and does not add `contact_records`. `writesFromPayload` of `{ haltId: the id, contactId: the contact }` with no `writes` array returns no `halt_records` pointer and no `contact_records` pointer.
3. A second contact-scope commit that omits `contactId` and omits `reason`. One new row. `contact_id` is null. `reason` is null. `scope` is `contact`. The HTTP body omits `contactId` because the handler passes `body.contactId` and `JSON` drops `undefined`. The pre-existing firm-book row and the case-1 contact row still have `lifted_at` null. The contact listener does not gain a run. The global listener, the unset-`localRef` listener, and the matching-firm listener do. Each of those new runs has `writes[0].id` equal to this new row and `writes[0].contact_id` null. The script does not assert `counts.contacts` on these runs. That number is the book fill claim 17 already runs when `contactIds` is omitted.
4. A firm-book commit for the first firm, no `contactId`. The pre-existing firm-book row on the first firm now has `lifted_at` set. The other firm’s firm-book row still has `lifted_at` null. The contact rows from cases 1 and 3 still have `lifted_at` null. One new row has `scope` `"firm-book"`, `contact_id` null, and `lifted_at` null. One new audit row has kind `halt.firm-book`. No new `event:halt_records` run exists for any fixture listener. The HTTP `scope` is `"firm-book"`.
5. A third contact-scope commit for the case-1 contact, reason `"second"`. Two primary keys now exist for that contact with `lifted_at` null, plus the null-contact row from case 3. The case-1 row still has reason `"first"`. The case-1 run’s trigger `writes[0].id` is still the case-1 id. A load walk whose pointer id is the case-1 id, `pickField` `"reason"`, `pickValue` `"first"`, and `contactIds` `[the halt contact]` is `branch → true`. The case-5 row has a later `halted_at` and reason `"second"`. A loader that selected by `contact_id`, or by latest `halted_at`, fails this walk. Further walks of the same pointer are `branch → true` for `scope` eq `"contact"`, `consultant_id` eq the consultant, and `halted_at` op `"exists"`. `lifted_at` op `"exists"` is `branch → false`.
6. `handleHaltLift` of the case-1 id. The response record’s id is that id and `liftedAt` is set. The row’s `lifted_at` is set. The case-5 row and the case-3 row still have `lifted_at` null. No new `event:halt_records` run exists. One new audit row has kind `halt.lift`. A load walk of the same pointer with `lifted_at` op `"exists"` is now `branch → true`. A loader that required `lifted_at` null fails this walk. A load walk whose `writes[0].id` is `halt-absent`, while the case-5 row still has reason `"second"`, and whose If compares `reason` to `"second"`, is `branch → false`. A loader that ignored `id` and took the latest contact row would take `true`.
7. A direct walk inserts its own run. `contactIds` is omitted. `payload.writes` is one pointer whose `table` is `halt_records`, whose `id` is the case-3 id, and whose `contact_id` is null. `counts.contacts` is 0. A count of 1 means the `halt-` id was published as a person.

`npm run factory:check` reads the contact-scope dispatch in `handleHaltCommit` and fails unless that payload object contains `haltId`, `contactId: body.contactId ?? null`, and a `writes` element whose `table` is `"halt_records"`, whose `id` is `haltId`, and whose `contact_id` is `body.contactId ?? null`. It fails unless `contactIds: body.contactId ? [body.contactId] : undefined` is the dispatch argument. It fails if that payload object contains `firm_id`, `scope`, `reason`, `consultant_id`, `consultant_name`, `contact_name`, `firm`, `contactIds`, or `anyPass`. It fails if that `writes` element contains `firm_id` or `audit_events`. It fails unless the dispatch stays inside `if (body.scope === "contact")`, stays `await dispatchEventToWorkflows(getPool(), …)`, and is not inside `try`. It fails if `handleHaltCommit` contains `BEGIN` or `COMMIT`. It fails unless `const haltId = id("halt")` is the insert id and the pointer id, and unless `id` is still `` `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` ``. It fails unless the insert column list is still `id, consultant_id, contact_id, firm_id, scope, reason, halted_at` and the firm-book `UPDATE` remains only in the firm-book branch. It fails unless `handleHaltLift` still has no `dispatchEventToWorkflows` call. It reads `writesFromPayload` and fails if that function contains `haltId`. It reads `loadWriteRow` and fails unless it contains `SELECT * FROM halt_records WHERE id=$1` bound to `w.id`, ignoring whitespace, and fails if that statement contains `firm_id`, `contact_id`, `lifted_at`, `ORDER BY`, or `LIMIT`. It fails unless the function still ends at `return null`. It reads the `PERSON_WRITE_TABLES` initializer and fails if that initializer contains `halt_records`. It reads `localRefFromPayload` and `triggerLocalRefFromPayload` and fails if either function contains `halt_records`. It reads `eventTest.ts` and fails unless the `halt_records` door is `SELECT * FROM halt_records WHERE firm_id=$1 AND lifted_at IS NULL ORDER BY halted_at DESC LIMIT 10`. It reads `TRIGGER_SELECT_EVENTS` and fails if any entry’s `eventName` or `id` is `halt_records`, and fails if the comment `Do not add eligibility / halt / meeting.` is gone. It reads the `WORKFLOW_EVENTS_WITH_LOCAL` initializer and fails if it contains `halt_records`. It reads `ConsultantAntScene.tsx` and fails unless `if (portScope === "contact" && !activeClientId) return;` still precedes `haltStore.commit`. It reads `standInHaltStore.commit` and fails if that function contains `dispatchEventToWorkflows`. It reads the contact-scope query in `handleHaltIsContact`, the contact-scope query in `consentAndHaltGate`, and the contact arm of `isHaltBlockingNew`, and fails if those contact predicates contain `firm_id`. The firm-book arms still have `firm_id`. It does not assert on `anyPass` inside `dispatchEventToWorkflows`. It does not require or forbid the book-fill query. It reads `.github/workflows/ship.yml` and fails unless it invokes `scripts/verify-halt-records-writes.ts`. Add `server/wire-service/stores.ts`, `server/wire-service/workflowWalk.ts`, `server/wire-service/runWrites.ts`, `server/wire-service/eventTest.ts`, `server/wire-service/dispatchSend.ts`, `src/app/data/automationTriggerSelect.ts`, `src/app/data/automationWorkflows.ts`, `src/app/wire/standins/haltStore.ts`, `src/app/register/prototype-ant/consultant/ConsultantAntScene.tsx`, `scripts/verify-halt-records-writes.ts`, and `.github/workflows/ship.yml` to the path filter in `.github/workflows/factory-check.yml` if they are not already listed.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

Door 1’s newest ten, beyond the shape guard that keeps the current statement. The two `event_test_data` specimen bodies, including `consultant_name`, `contact_name`, and `firm`. Adding `halt_records` to `PERSON_WRITE_TABLES`. Teaching `writesFromPayload` to read `haltId`. Adding a `localRefFromPayload` or `triggerLocalRefFromPayload` case. Adding Halt to `TRIGGER_SELECT_EVENTS`. Editing `WORKFLOW_EVENT_CATALOG`. Stripping `anyPass` (PKT-004). Dispatching the firm-book branch or the lift. Putting `audit_events` on `writes`. Enriching the row or the payload with `consultant_name`, `contact_name`, or `firm`. A transaction around the dispatch. The stand-in store, beyond the shape guard that it still does not dispatch. `handleHaltList`. Claims 15 and 16. Claims 18–22’s gate predicates, beyond the shape guard that the contact arms still omit `firm_id`. Claim 17’s audience fill, beyond leaving it in place and not asserting its cardinality. `ConsultantPrototypeScene.tsx`. Launch Agent. No plate. `src/` product UI, beyond the two shape guards on `confirmHalt` and the A26 list.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `halt_records` contact-scope dispatch payload | Gains one `writes` pointer. `haltId` and `contactId` stay. `contactId` is `body.contactId ?? null` | `dispatchEventToWorkflows`, `writesFromPayload`, `localAxesMatch`, trigger `node_status.writes` | Modified |
| `halt_records` id | Same `id("halt")` binding. That string is the pointer id and the HTTP `id` | Insert, payload, trigger `writes`, HTTP body | Modified |
| `halt_records` row | Same columns. `lifted_at` stays null on the insert. `contact_id` stays `body.contactId ?? null` | `loadWriteRow`, door 1, lift | Only verified |
| `halt_records` firm-book branch | Still lifts other active firm-book rows for that firm, inserts `contact_id` null, audits `halt.firm-book`, and does not dispatch | Kill-switch, `handleHaltIsFirmBook` | Only verified |
| `handleHaltLift` | Still sets `lifted_at` on this id and does not dispatch | A listener that already holds the pointer | Only verified |
| `audit_events` halt kinds | Still `halt.contact`, `halt.firm-book`, and `halt.lift`. The audit id stays off `writes` | Audit list | Only verified |
| `loadWriteRow` | One branch, `WHERE id=$1` bound to `w.id`. Other branches stay | If field reads of this table | Modified |
| `PERSON_WRITE_TABLES` | Unchanged. `halt_records` stays out | `personTableOf`, `evalIfPick`, `personIdsFromWrites` | Only verified |
| `personIdsFromWrites` | Unchanged. A null `contact_id` does not publish the `halt-` id | Trigger contact list when the caller list is empty | Only verified |
| `writesFromPayload` | Unchanged. `payload.writes` is the handle. No `haltId` reader | Every trigger, including this event | Only verified |
| `RunWrite` | Unchanged. No `firm_id` field | This pointer’s `contact_id`, including null | Only verified |
| `localRefFromPayload`, `triggerLocalRefFromPayload`, `localAxesMatch` | Unchanged. This event still has no local-ref case. Firm compare still falls back to `opts.firmId`. Contact compare still reads `payload.contactId`, then `contactIds` | Local `halt_records` listeners | Only verified |
| `dispatchEventToWorkflows` | Unchanged. Still copies the payload and sets `eventName` and `anyPass`. The book fill stays | This event’s listeners | Only verified |
| `event_write_set` `halt_records` v1 | Already ord 0 for this table. Not read at fire time | Live payload literal | Only verified |
| `eventTest.ts` door 1 | Still the newest ten active rows for the firm, both scopes | Test door | Only verified |
| `TRIGGER_SELECT_EVENTS`, `WORKFLOW_EVENTS_WITH_LOCAL` | Unchanged. Halt stays off both | A26 list, local-axis catalog | Only verified |
| `POST /halt`, `POST /halt/:haltId/lift` | Same handlers. The commit response stays the halt record | Ant desk, wire client | Only verified |
| `confirmHalt`, `standInHaltStore` | Unchanged. The Ant contact scope with no active client returns before commit. The stand-in does not dispatch | Ant halt modal | Only verified |
| Contact halt gates | Unchanged. The contact arms still omit `firm_id` | Enroll, send, `GET /halt/contact/:contactId` | Only verified |
| `scripts/verify-halt-records-writes.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases and the shape guard | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| The contact-scope dispatch omits `writes`, so `writesFromPayload` returns no pointer. `haltId` is already the `id("halt")` string the insert stored. That same binding is `writes[0].id`. A second `id("halt")` would publish a pointer that matches no row. `contact_id` on the pointer is the insert bind `body.contactId ?? null`. The `contactIds` argument stays the existing ternary, `undefined` when `contactId` is omitted and one element when it is a non-empty string. | necessary |
| `writesFromPayload` returns the array and then stops. It does not read `haltId` or singular `contactId`. A reader for `haltId` would invent a pointer when `writes` is absent, which case 2 forbids. The payload must not gain `contactIds`, or a missing `writes` array would publish `contact_records`. `contactIds` stays the dispatch argument. A null `contact_id` is not a string, so the reader stores `null`. The source literal still has the key. The stored `RunWrite` cannot tell a missing key from null. | necessary |
| `loadWriteRow` returns null for `halt_records`. The primary key is already `id`. The load is `WHERE id=$1` on `w.id`. A second query by `contact_id`, or `firm_id`, `lifted_at`, or `ORDER BY` on that statement, is a different predicate than claim 10. `consultant_id`, `scope`, `reason`, `halted_at`, and `lifted_at` stay columns. The walk’s `firmId` argument stays unused on this branch. Other branches in the function stay, including any PKT-006, PKT-009, PKT-010, or PKT-012 branch already present. PKT-012 loads `consent_records` by `contact_id` and the walk’s firm. That predicate is not this id load. The function stays unexported unless an earlier packet exported it. | necessary |
| `PERSON_WRITE_TABLES` omits `halt_records`. `personIdsFromWrites` then drops a null `contact_id`, so the `halt-` id is not a person. `evalIfPick` person-splits only when the set contains the table and `ctx.contactIds` is non-empty, so the field walks pass a one-element `contactIds` and expect `branch →`. An empty list would hide the set change. Case 7 is the empty list, and `counts.contacts` 0 is the proof the id was not published. Adding the name would fail both. This packet does not add the name. | necessary |
| `localRefFromPayload` and `triggerLocalRefFromPayload` have no `halt_records` arm and return null. A trigger with `local_ref` set never matches this firing. An unset `local_ref` still matches. Putting a case on either reader would recut the axis. The firm compare falls back to `opts.firmId` because the payload has no `firm_id`. A listener for this firm matches, and a listener for another firm does not. That pair does not prove the key is absent. The shape guard proves the key is absent. The contact compare reads `payload.contactId` before `contactIds`, so a matching local-contact listener proves the payload string. `counts.contacts` 1 on a firm with two contacts proves the caller list was that one contact and was not replaced by the book. When `contactId` is omitted, `payloadString` returns null and the omitted argument makes the local-contact listener miss. That miss is the runtime proof for the omitted argument. | necessary |
| The halt insert and the audit insert are separate statements, already completed before the await. There is no transaction and no `try/catch`. A dispatch error leaves both rows and does not return the HTTP body. Wrapping the await, or rolling the row back, would change that. The firm-book `UPDATE` stays in its own branch, before the insert, so the new firm-book row is not lifted by its own commit, and a contact commit does not run it. | necessary |
| The walk stores `writes` and does not store `triggerPayload`. `haltId`, root `contactId`, and `anyPass` are not on `node_status`. The row, the HTTP `id`, the listeners, and the shape guard prove the first two. `payloadString` treats null and a missing key the same, so case 3’s listener cannot prove the payload key is present. The object literal proves it. `comparePasses` treats a null `lifted_at` as a failed `exists`, so case 5 proves the column is null and case 6 proves the same id shows the timestamp after the lift. | necessary |
| `walkValidatedWorkflow` updates `workflow_run` and does not insert it. `dispatchEventToWorkflows` inserts before the walk. A direct load walk that skips the insert updates zero rows, and the case cannot read `node_status`. The script inserts the run first. `counts.contacts` is the stored length, not the id list. Case 7 uses that length because the only candidate person id is the `halt-` id. | necessary |
| Door 1 selects the newest ten active `halt_records` rows for the firm, both scopes. A decoy with a later `halted_at` is how the load walks show the handle is the pointer id. The door stays. `event_write_set` version 1 already names this table at ord 0. The payload is a literal. It does not read that registry. The specimen keys `consultant_name`, `contact_name`, and `firm` stay on `event_test_data`. The live insert does not copy them. The second specimen is not a second element of this firing’s array. | adjacent |
| PKT-004’s change specification says the current `halt_records` caller payload is unchanged apart from the forced `anyPass` copy, and its shape guard fails if `dispatchEventToWorkflows` still contains `anyPass`. This packet adds `writes` to that caller and does not edit `dispatchEventToWorkflows`. Implementing PKT-004 must not delete `writes`. This packet’s shape guard does not require `anyPass` to remain on the walked copy, so the two guards do not deadlock. Acceptance that the walked trigger still receives `anyPass` holds because this packet does not edit that function. This packet does not edit `SCP-pkt-004-firing-handle.md`. | adjacent |
| PKT-006 adds other `loadWriteRow` branches and does not add this one. If those branches are already present, leave them. This packet does not edit `SCP-pkt-006-id-keyed-loads.md`. | adjacent |
| Claim 17 specifies the empty-contact audience inside `dispatchEventToWorkflows`. A contact-scope body that omits `contactId` still reaches that fill, because `contactIds` is `undefined` and the fixture audience is `every_firm`. The pointer is this insert’s id. Case 3 does not lock `counts.contacts`. This packet does not edit that function and does not use `select_from` in the fixture. | adjacent |
| Claims 18 and 19 decide the contact arm’s `firm_id` predicate on the enroll, the send, and `handleHaltIsContact`. The pointer is unchanged. The shape guard locks the current contact SQL, which has no `firm_id`. The firm-book arms stay. This packet does not add a send or enroll behavior test. | adjacent |
| The stand-in commit does not insert `halt_records` and does not dispatch. Its id tail is the map size, not `Math.random().toString(36).slice(2, 8)`. Aligning that formula with `id("halt")` is not this packet. `confirmHalt` in `ConsultantAntScene.tsx` is the early return the packet names. `ConsultantPrototypeScene.tsx` has a different `confirmHalt` and no early return. This packet does not add one. `handleHaltList` is a third reader, active rows for a firm with no limit of ten. It is not door 1 and not the id load. | adjacent |
| The packet file still says `**Release:** draft`. The ledger stage for this revision was `released` when this wake was authorized, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
