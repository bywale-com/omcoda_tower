# SCP-pkt-013 — A ct_firms firing places the current firm id on payload.writes

**Packet:** PKT-013 `pkt-013-firm-provision-writes`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 16, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`. The revision under claim 17 leaves this pointer unchanged.  
**Contract:** `docs/factory/components/firing-pointers/CONTRACT.md` — claim 16’s one-element array. The load is `WHERE id = pointer.id`. The pointer has no `contact_id`. The audience fill is claim 17. `docs/factory/components/walk-handle/CONTRACT.md` — claim 10’s id predicate. PKT-013 loads `ct_firms` by `pointer.id`. That branch is not PKT-006, and it is not claim 15’s `(contact_id, firm_id)` load.

## Intent

`handleMachineProvision` still upserts one `ct_firms` row on `id` and then calls `dispatchEventToWorkflows` once. The statement stays:

`INSERT INTO ct_firms (id, name, posture, updated_at) VALUES (firm, firmName, 'Idle', now()) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = now()`.

`firm` is `body.firmId` trimmed, or `randomUUID()` when that trim is empty. One binding. The insert and the pointer use that same string. The conflict clause assigns `name` and `updated_at`. It does not assign `posture`, `pool_slug`, `pool_domain`, or `sending_identity_id`. An insert stores `name` as this call’s `firmName` and `posture` `Idle`. The pool columns stay null. `created_at` takes the column default. A conflict replaces `name` and `updated_at` and leaves `posture` and the pool columns as they were. The statement still has no `RETURNING`. The id is the `firm` variable the handler already bound. This packet does not retune that `UPDATE`.

A blank `firmName` or a blank `email`, after trim, still returns 400 before any insert and before the dispatch. `email` is still trimmed and lowercased. `website` and `role` are still echoed on the HTTP body and are still not inserted.

The dispatch payload gains

`writes: [{ table: "ct_firms", id: <firm> }]`

That pointer is the only element. It does not carry `contact_id`. `writesFromPayload` drops an element whose `id` is not a string, and the existing `!id` check also drops an empty string. This firing’s id is a non-empty string. When `contact_id` is absent the reader stores null. `ct_firms` stays out of `PERSON_WRITE_TABLES`. This firing’s pointer contributes no person. Adding the table to that set would make `personIdsFromWrites` treat the firm id as a contact whenever `contact_id` is null.

The keys already on the payload stay: `firmId`, `firmName`, and `email`. `firmId` is `firm`. The call still passes no `contactIds`. The payload does not gain `posture`, `website`, `role`, `consultant_name`, `consultant_email`, `id`, `contact_id`, or `anyPass`. `writesFromPayload` gains no reader for `firmId`, `firmName`, or `email`. With `writes` present it returns that one pointer and does not add `contact_records`.

`localRefFromPayload("ct_firms")` and `triggerLocalRefFromPayload` stay as they are. Both return `id`, `firm_id`, or `firmId` when that value is a non-empty string. This packet does not add a payload key and does not remove the case. `localAxesMatch` compares `local_firm_id` to `payload.firmId`, then falls back to `opts.firmId`. On this dispatch those two ids are the same string. `local_ref` is compared only when it is set. A stored `local_ref` matches when it equals this firm id. `WORKFLOW_EVENTS_WITH_LOCAL` still includes `ct_firms`. The A26 row stays firm only: `TRIGGER_SELECT_EVENTS` for `ct_firms` keeps `layers: [{ kind: "firm" }]`.

`dispatchEventToWorkflows` is not edited. It still copies the payload and still sets `anyPass: true` on the walked trigger. `writes` has to be on the object passed in, because the copy is what `writesFromPayload` reads. Claim 7’s refusal of `anyPass` is not recut. This packet does not put `anyPass` on the provision payload. PKT-004 removes the forced copy. Implementing PKT-004 must not delete `writes`. The function’s audience fill, when `contactIds` is omitted, stays the live branch. Claim 17 owns that fill. This packet does not add `contact_records` to the array and does not put a person on this pointer.

`loadWriteRow` gains a `ct_firms` branch: `SELECT * FROM ct_firms WHERE id = pointer.id`. No firm predicate. No contact predicate. No `ORDER BY`. No “latest”. No `posture` filter. A miss returns null. The loader does not substitute the walk’s firm and does not fall through to `firms`. On this firing `pointer.id` and the walk’s firm are the same string. The predicate uses the pointer. This is claim 10’s `WHERE id = pointer.id` applied to a table whose primary key is `id`. This packet does not change that predicate for the other tables, and it does not change claim 15’s `(contact_id, firm_id)` load.

A later node reads `name`, `posture`, `pool_slug`, `pool_domain`, `sending_identity_id`, `created_at`, and `updated_at` from that row. On an insert from this firing, `name` is `firmName`, `posture` is `Idle`, and the three pool columns are null. On a conflict, `name` is this call’s `firmName`, `updated_at` is now, and `posture` and the pool columns are whatever the row already held. Those columns are not copied onto the dispatch. A later update of the same id, including a later pool allocation, is visible on the re-read.

`event_write_set` version 1 already names `ct_firms` alone, at ord 0. This packet does not write a migration and does not retune door 1. Door 1 for this event stays `SELECT * FROM ct_firms WHERE id = $1 LIMIT 1` with the session firm. `writeId` still uses `body.id` when it is present. The specimen `etd-ct_firms-harbor` still carries `consultant_name`, `consultant_email`, and `posture` `Armed`. The upsert does not store the consultant keys. This packet does not enrich the row.

The same handler still writes `firms`, `campaign_states`, and `users` before the dispatch, and it may insert `access_links`. After the dispatch, `appendFirmAudit` still inserts `audit_events` with kind `firm.provisioned`. A failure in the auth-user block still reaches the `ct_firms` dispatch. None of those rows join `writes`. `handlePoolAllocate` still updates pool columns on the same id and does not dispatch. Seed inserts are not this dispatch. The HTTP body stays `firmId`, `firmName`, `email`, `website`, `role`, `ctFirm`, `authUser`, `campaignState`, `loginPath`, `accessPath`, `bound`, and `workflowsFired`.

`executeGet` for module `firms` still returns `{ table: "ct_firms", id }` and still does not set `contact_id`. `projectSeat` still unions `ct_firms` with `firms` by the same text. That union is not this load.

## Must / must-not

- Keep the `ct_firms` statement. The conflict clause still assigns `name` and `updated_at` only. The statement still has no `RETURNING`. Do not read the row back to build the pointer. `firm` stays one binding, `body.firmId?.trim() || randomUUID()`, used as the insert id and as `writes[0].id`. Do not mint a second id.

```ts
const firm = body.firmId?.trim() || randomUUID();
await pool.query(
  `INSERT INTO ct_firms (id, name, posture, updated_at)
   VALUES ($1,$2,'Idle',now())
   ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, updated_at=now()`,
  [firm, firmName],
);
```

- Keep the `firms` insert and the `campaign_states` insert ahead of that statement. Do not add either table to `writes`. The `firms` insert stays `$1::uuid`.

```ts
await pool.query(
  `INSERT INTO firms (id, name) VALUES ($1::uuid, $2)
   ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name`,
  [firm, firmName],
);
await pool.query(
  `INSERT INTO campaign_states (firm_id, state, updated_at)
   VALUES ($1,'armed-for-activation',now())
   ON CONFLICT (firm_id) DO UPDATE SET state='armed-for-activation', updated_at=now()`,
  [firm],
);
```

- Keep the auth-user block in its `try/catch`. A thrown select or insert still sets `authUser` false and does not return. The dispatch stays after that block, not inside it. Keep the access-link mint where it is: only when `authUser && userId`, and a mint failure still logs and continues. Do not put `users` or `access_links` on `writes`.

- The payload is the existing three keys plus `writes`. One call. No `contactIds` argument. The pointer’s `id` is `firm`. Do not set `contact_id` on the element.

```ts
const dispatched = await dispatchEventToWorkflows(pool, {
  firmId: firm,
  eventName: "ct_firms",
  payload: {
    firmId: firm,
    firmName,
    email,
    writes: [{ table: "ct_firms", id: firm }],
  },
});
```

- Keep that call a direct `await`. One call. Do not wrap it in `try/catch`. Do not add `BEGIN` or `COMMIT`. A dispatch error still propagates, and `appendFirmAudit` does not run, and the HTTP body is not returned. The `ct_firms` upsert above has already completed.
- `appendFirmAudit` stays after that await. Kind stays `firm.provisioned`. Payload stays `{ firmName, email }`. Do not put `audit_events` on `writes`.
- The HTTP body stays the current object. Do not add `writes` to it. `website` is `body.website ?? null`. `role` is `body.role ?? null`. `ctFirm` stays true. `campaignState` stays `"armed-for-activation"`. `bound` stays true. `workflowsFired` stays `dispatched`.

```ts
return json(c, {
  firmId: firm,
  firmName,
  email,
  website: body.website ?? null,
  role: body.role ?? null,
  ctFirm: true,
  authUser,
  campaignState: "armed-for-activation",
  loginPath,
  accessPath,
  bound: true,
  workflowsFired: dispatched,
});
```

- A blank `firmName` or a blank `email` still returns 400 with `{ error: "firmName and email required" }` before the pool is used. Do not dispatch on that path.
- Do not put `posture`, `website`, `role`, `consultant_name`, `consultant_email`, `id`, `contact_id`, `contactIds`, or `anyPass` on the caller payload. The array length is 1. The table string is `"ct_firms"`.
- Add one `loadWriteRow` branch, before the final `return null`:

```ts
if (w.table === "ct_firms") {
  const { rows } = await pool.query(`SELECT * FROM ct_firms WHERE id=$1`, [w.id]);
  return (rows[0] as Record<string, unknown> | undefined) ?? null;
}
```

  Bind `w.id`. Do not bind `firmId`. Do not bind `w.contact_id`. Do not use the local `contactId` from `w.contact_id ?? w.id`. Leave that local for the branches that already use it. No `ORDER BY`, no `LIMIT`, no `posture`, no `firm_id`, no `contact_id`. A missing id returns null. Do not query `firms`. Do not interpolate the table name. Leave every other branch, including a `fact_writebacks`, `meeting_booked`, `wait_occupancy`, `engagement_records`, `campaign_failure`, `halt_records`, `consent_records`, or eligibility branch another packet may already have added. Do not export `loadWriteRow`. If it is already exported, leave the export.
- Do not add `ct_firms` to `PERSON_WRITE_TABLES`. Do not remove a name that is already there. Do not edit `personTableOf`, `evalIfPick`, `personIdsFromWrites`, `pickWrites`, or either `find` in `resolveOperandText`.
- Do not edit `writesFromPayload`. Do not teach it to map `firmId`, `firmName`, or `email` onto `ct_firms`. Do not teach it to keep an empty-string `id`. Do not teach it to drop a null `contact_id` key. An absent `contact_id` stays stored as null.
- Do not edit `localRefFromPayload`, `triggerLocalRefFromPayload`, `localAxesMatch`, or `triggerLocalAxesMatch`. The `ct_firms` arm stays `payloadString(payload, ["id", "firm_id", "firmId"])` in both ref readers.
- Do not edit `dispatchEventToWorkflows`, including the `anyPass` copy and the empty-list book fill. Stripping `anyPass` is PKT-004. The book fill is claim 17.
- Do not remove `ct_firms` from `WORKFLOW_EVENTS_WITH_LOCAL`. Do not add a contact layer to the `ct_firms` row in `TRIGGER_SELECT_EVENTS`. Do not edit `WORKFLOW_EVENT_CATALOG`.
- Do not bump `event_write_set`. Do not read `event_write_set` or `event_test_data` to build this payload. Do not edit `eventTest.ts`. Door 1 for this event stays `SELECT * FROM ct_firms WHERE id=$1 LIMIT 1` with the session firm. `writeId` stays `body.id` when that string is present. Do not add a migration.
- Leave `handlePoolAllocate`. It still upserts `pool_slug`, `pool_domain`, and `sending_identity_id` on conflict and does not assign `posture` or `name`. It does not call `dispatchEventToWorkflows`.
- Leave `appendFirmAudit`’s insert. It does not call `dispatchEventToWorkflows`.
- Leave `executeGet` for module `firms`. Both arms still return `{ table: "ct_firms", id }` and still omit `contact_id`. Leave `projectSeat`’s `UNION ALL` of `ct_firms` and `firms`. That union is not this load.
- Leave the seed inserts in `supabase/migrations/013_operator_book_people.sql`. They are not this dispatch.

## Stores and contracts

`ct_firms.id` is `TEXT` and is the primary key. There is no `contact_id` column. `posture` defaults to `Idle` and is checked to `Idle`, `Armed`, or `Active`. The three pool columns are nullable. `created_at` and `updated_at` default to `now()`.

```7:17:supabase/migrations/003_ct_wire_stores.sql
CREATE TABLE IF NOT EXISTS ct_firms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  posture TEXT NOT NULL DEFAULT 'Idle'
    CHECK (posture IN ('Idle', 'Armed', 'Active')),
  pool_slug TEXT,
  pool_domain TEXT,
  sending_identity_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Auth `firms.id` is `UUID`. The provision insert casts the same `firm` string with `$1::uuid`. `randomUUID()` is a uuid. A repeated id has to be a uuid or that insert throws before `ct_firms`.

```7:11:supabase/migrations/001_auth_tables.sql
CREATE TABLE IF NOT EXISTS firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`users.firm_id` references `firms(id)`. `email` is unique. The auth block’s failure is a thrown query, which the handler already catches.

```13:19:supabase/migrations/001_auth_tables.sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_email_unique UNIQUE (email)
);
```

`campaign_states.firm_id` is `TEXT`. The provision insert stores `armed-for-activation`. That row is not a write-set element.

```262:267:supabase/migrations/004_machine_tables.sql
CREATE TABLE IF NOT EXISTS campaign_states (
  firm_id TEXT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'armed-for-activation'
    CHECK (state IN ('armed-for-activation', 'running')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`access_links` is the mint table. It is reached only after the auth block succeeds. It is not a write-set element.

```5:15:supabase/migrations/008_access_links.sql
CREATE TABLE IF NOT EXISTS access_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  invalidated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`event_write_set` version 1 already names this event’s only table at ord 0. The specimen body carries consultant keys and `posture` `Armed`. The live firing does not read this row and does not copy those keys.

```34:34:supabase/migrations/017_event_test_contract.sql
('ct_firms', 1, 'ct_firms', 0),
```

```76:76:supabase/migrations/017_event_test_contract.sql
('etd-ct_firms-harbor', 'ct_firms', 1, 'ct_firms', 0, '{"id":"firm-standin-harbor","name":"Harbor RCIC","posture":"Armed","pool_slug":"harbor","pool_domain":"harbor.try-tower.com","sending_identity_id":"sid-harbor-resend","consultant_name":"Amira Chen","consultant_email":"amira.chen@harbor-rcic.example","created_at":"2026-07-02T15:00:00.000Z","updated_at":"2026-08-10T12:00:00.000Z"}'::jsonb),
```

The firing-pointers contract names this packet as the one-element array, and the walk-handle contract names the id load. Those sentences are the contract. This packet does not edit either file.

`RunWrite` is the pointer shape. `contact_id` is optional. This firing does not set it.

```1:6:server/wire-service/runWrites.ts
/** This run’s writes — the next node’s input. Not an events table. */
export type RunWrite = {
  table: string;
  id: string;
  contact_id?: string | null;
};
```

## Runtime

The provision route binds one id, upserts `ct_firms`, and today dispatches without `writes`. The auth block is a separate `try`. The dispatch is not inside it.

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

```1635:1661:server/wire-service/machine.ts
  let authUser = false;
  let userId: string | null = null;
  try {
    const existing = await pool.query<{ id: string }>(
      `SELECT id FROM users WHERE lower(email)=lower($1) LIMIT 1`,
      [email],
    );
    if (existing.rowCount) {
      // Rebind consultant to the firm just provisioned (binding, not orphan CT row).
      await pool.query(`UPDATE users SET firm_id=$1::uuid WHERE id=$2`, [
        firm,
        existing.rows[0].id,
      ]);
      userId = existing.rows[0].id;
      authUser = true;
    } else {
      const inserted = await pool.query<{ id: string }>(
        `INSERT INTO users (firm_id, email) VALUES ($1::uuid, $2) RETURNING id`,
        [firm, email],
      );
      userId = inserted.rows[0]?.id ?? null;
      authUser = Boolean(userId);
    }
  } catch (err) {
    console.error("provision.authUser.failed", err);
    authUser = false;
  }
```

```1680:1705:server/wire-service/machine.ts
  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: firm,
    eventName: "ct_firms",
    payload: { firmId: firm, firmName, email },
  });

  await appendFirmAudit({
    firmId: firm,
    kind: "firm.provisioned",
    payload: { firmName, email },
  });

  return json(c, {
    firmId: firm,
    firmName,
    email,
    website: body.website ?? null,
    role: body.role ?? null,
    ctFirm: true,
    authUser,
    campaignState: "armed-for-activation",
    loginPath,
    accessPath,
    bound: true,
    workflowsFired: dispatched,
  });
```

`writesFromPayload` already returns when `payload.writes` is an array. A non-string `id` becomes `""`, and `!id` drops that element. An absent `contact_id` becomes null. The contact-records loop does not run once `writes` is an array. There is no reader for `firmId`, `firmName`, or `email`.

```8:42:server/wire-service/runWrites.ts
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

`loadWriteRow` has no `ct_firms` branch. After `missing_fact_signals` it returns null. The walk’s `firmId` is an argument and is not a substitute for `w.id`.

```655:700:server/wire-service/workflowWalk.ts
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
  if (w.table === "reachability_verdicts") {
    const { rows } = await pool.query(
      `SELECT * FROM reachability_verdicts WHERE contact_id=$1 AND firm_id=$2`,
      [contactId, firmId],
    );
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  if (w.table === "contact_records") {
    const { rows } = await pool.query(`SELECT * FROM contact_records WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  if (w.table === "contact_tag") {
    const { rows } = await pool.query(`SELECT * FROM contact_tag WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  if (w.table === "audit_runs") {
    const { rows } = await pool.query(`SELECT * FROM audit_runs WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  if (w.table === "import_batch") {
    const { rows } = await pool.query(`SELECT * FROM import_batch WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  if (w.table === "enrollment") {
    const { rows } = await pool.query(`SELECT * FROM enrollment WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  if (w.table === "missing_fact_signals") {
    const { rows } = await pool.query(`SELECT * FROM missing_fact_signals WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  return null;
}
```

`PERSON_WRITE_TABLES` does not contain `ct_firms`. `personIdsFromWrites` uses `contact_id` first, and uses `id` only when the table is in that set. A null `contact_id` on this table contributes no person.

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

The walk fills an empty contact list from that function. `dispatchEventToWorkflows` fills the book before the walk when the caller omitted `contactIds`, so a provision with a non-empty book does not reach this fallback. A direct walk that omits `contactIds` does.

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

The trigger visit stores `ctx.previousWrites`. That is the handle the verify reads. The walk does not store `triggerPayload`. `firmId`, `firmName`, `email`, and `anyPass` are not on `node_status`.

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

`counts.contacts` is `ctx.contactIds.length` on a finished run.

```1676:1680:server/wire-service/workflowWalk.ts
      JSON.stringify({
        nodes: Object.keys(nodeStatus).length,
        enrollments: enrollments.length,
        contacts: ctx.contactIds.length,
      }),
```

An If on a table outside `PERSON_WRITE_TABLES` does not person-split. The detail is `branch → true` or `branch → false`. A detail that starts with `if pick ` means the table was added to the set. `comparePasses` turns a null column into a failed `exists`, and stringifies a present value. `posture` compares as `"Idle"` or `"Armed"`.

```917:939:server/wire-service/workflowWalk.ts
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

```888:896:server/wire-service/workflowWalk.ts
async function comparePasses(
  pool: Pool,
  ctx: WalkContext,
  data: Record<string, unknown>,
  cmp: WalkCompare,
  contactId?: string,
): Promise<boolean> {
  const left = await resolveOperandText(pool, ctx, data, cmp.left, contactId);
  if (cmp.op === "exists") return left != null && left !== "";
  if (left == null || left === "") return false;
```

Both ref readers already return `firmId` for this event. The provision payload keeps `firmId` and does not gain `id`.

```1853:1860:server/wire-service/workflowWalk.ts
function localRefFromPayload(
  eventName: string,
  payload: Record<string, unknown> | undefined,
): string | null {
  if (eventName === "fact_writebacks") return payloadString(payload, ["form_ref", "formRef"]);
  if (eventName === "campaign_failure") return payloadString(payload, ["campaign_id", "campaignId"]);
  if (eventName === "ct_firms") return payloadString(payload, ["id", "firm_id", "firmId"]);
```

```145:152:src/app/data/automationTriggerSelect.ts
export function triggerLocalRefFromPayload(
  eventName: string,
  payload?: Record<string, unknown>,
): string | null {
  if (eventName === "fact_writebacks") return payloadString(payload, ["form_ref", "formRef"]);
  if (eventName === "campaign_failure") return payloadString(payload, ["campaign_id", "campaignId"]);
  if (eventName === "ct_firms") return payloadString(payload, ["id", "firm_id", "firmId"]);
```

`localAxesMatch` reads `firm_id` then `firmId`, then `opts.firmId`. It compares `local_ref` only when that column is set. It compares `local_contact_ids` to `payload.contactId` or `contact_id`, then to `opts.contactIds`. The provision call passes neither a contact key nor `contactIds`, and this match runs before the book fill. A trigger that names contacts does not match this firing.

```1873:1901:server/wire-service/workflowWalk.ts
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

The copy still sets `anyPass: true` after the spread. When `contactIds` is omitted, the live `every_firm` arm still selects every `contact_records.id` for `opts.firmId`. This packet does not edit either line.

```1950:1977:server/wire-service/workflowWalk.ts
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

    const runId = `run-${randomUUID()}`;
    await pool.query(
      `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label)
       VALUES ($1,$2,$3,'running',$4)`,
      [runId, row.workflow_id, opts.firmId, `event:${opts.eventName}`],
    );
    const walked = await walkValidatedWorkflow(pool, {
      workflowId: row.workflow_id,
      firmId: opts.firmId,
      runId,
      triggerLabel: `event:${opts.eventName}`,
      triggerPayload: { ...(opts.payload ?? {}), eventName: opts.eventName, anyPass: true },
      contactIds,
    });
```

Door 1 still reads one `ct_firms` row by the session firm. `writeId` still prefers `body.id`.

```97:99:server/wire-service/eventTest.ts
    if (eventName === "ct_firms") {
      const ok = await push(`ct_firms`, `SELECT * FROM ct_firms WHERE id=$1 LIMIT 1`, [firm]);
      return ok ? out : null;
    }
```

```15:18:server/wire-service/eventTest.ts
function writeId(table: string, body: Record<string, unknown>): string {
  if (typeof body.id === "string" && body.id) return body.id;
  if (typeof body.contact_id === "string" && body.contact_id) return body.contact_id;
  return `${table}-specimen`;
}
```

`handlePoolAllocate` updates the pool columns and does not dispatch. The conflict does not assign `name` or `posture`.

```66:75:server/wire-service/pool.ts
  await getPool().query(
    `INSERT INTO ct_firms (id, name, pool_slug, pool_domain, sending_identity_id, updated_at)
     VALUES ($1,$2,$3,$4,$5,now())
     ON CONFLICT (id) DO UPDATE
       SET pool_slug = EXCLUDED.pool_slug,
           pool_domain = EXCLUDED.pool_domain,
           sending_identity_id = EXCLUDED.sending_identity_id,
           updated_at = now()`,
    [body.firmId, body.name ?? body.firmId, sub, fullDomain, identityId],
  );
```

`appendFirmAudit` inserts `audit_events` and does not dispatch.

```10:30:server/wire-service/stores.ts
export async function appendFirmAudit(input: {
  firmId: string;
  kind: string;
  actorId?: string;
  payload?: Record<string, unknown>;
}): Promise<string> {
  const eventId = id("aud");
  const at = new Date().toISOString();
  await getPool().query(
    `INSERT INTO audit_events (id, at, actor_id, kind, subject_type, subject_id, firm_id, payload)
     VALUES ($1,$2,$3,$4,'firm',$5,$5,$6)`,
    [
      eventId,
      at,
      input.actorId ?? "operator",
      input.kind,
      input.firmId,
      input.payload ? JSON.stringify(input.payload) : null,
    ],
  );
  return eventId;
}
```

`executeGet` for `firms` emits firm pointers and does not set `contact_id`. `projectSeat` unions `ct_firms` with `firms`. Neither read is this firing’s load.

```358:364:server/wire-service/workflowWalk.ts
  if (module === "firms") {
    if (select === "every") {
      const { rows } = await pool.query<{ id: string }>(`SELECT id FROM ct_firms`);
      return { writes: rows.map((r) => ({ table: "ct_firms", id: r.id })) };
    }
    return class1 ? { writes: [{ table: "ct_firms", id: class1 }] } : { writes: [] };
  }
```

```193:200:server/wire-service/contactSeat.ts
async function projectSeat(pool: Pool, link: LinkRow): Promise<ContactSeatPayload> {
  const firm = await pool.query<{ id: string; name: string }>(
    `SELECT id, name FROM ct_firms WHERE id=$1
     UNION ALL
     SELECT id::text, name FROM firms WHERE id::text=$1
     LIMIT 1`,
    [link.firm_id],
  );
```

The A26 row is firm only. `WORKFLOW_EVENTS_WITH_LOCAL` already contains `ct_firms`.

```56:60:src/app/data/automationTriggerSelect.ts
    id: "ct_firms",
    label: "Firm created / provisioned",
    eventName: "ct_firms",
    layers: [{ kind: "firm" }],
  },
```

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

## Ports

No new port.

These stay on the same functions:

- `POST /machine/provision` → `handleMachineProvision`. The JSON body stays `firmId`, `firmName`, `email`, `website`, `role`. The dispatch gains `writes`. The success body stays the current keys. A blank name or email stays 400.
- `POST /pool/allocate` → `handlePoolAllocate`. Same body. Pool columns update. No `ct_firms` dispatch.
- `dispatchEventToWorkflows` for `ct_firms`. Same `firmId`. `contactIds` stays omitted. The payload gains `writes`.
- `loadWriteRow` gains one branch. It is not an HTTP route.
- `writesFromPayload`, `localRefFromPayload`, `triggerLocalRefFromPayload`, `localAxesMatch`, and `triggerLocalAxesMatch`. Unchanged readers.
- Door 1 in `eventTest.ts`. Unchanged.
- `executeGet` for module `firms`. Unchanged.
- `projectSeat`. Unchanged. The union is not this load.
- `appendFirmAudit`. Unchanged. The provision kind stays `firm.provisioned`.

```246:246:server/wire-service/routes.ts
  wire.post("/machine/provision", handleMachineProvision);
```

```139:139:server/wire-service/routes.ts
  wire.post("/pool/allocate", handlePoolAllocate);
```

## Verify

`scripts/verify-firm-provision-writes.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` after migrate and seed, in the same job as `verify-click-attribution`. `npm run build` is not this proof.

The script uses `getPool()` the way `scripts/verify-click-attribution.ts` does. It exits 2 when `DATABASE_URL` is missing. It deletes `RESEND_API_KEY` and `RESEND_WEBHOOK_SECRET` for the process, so `handlePoolAllocate` does not call Resend and this script is not a signature test. It does not set send mode, does not call `tickOnce`, and does not require `TEST_EMAIL_TO` or `TEST_SMS_TO`. It does not boot Vite.

Firm ids are uuids. `firms.id` is `UUID`, and the provision insert casts `$1::uuid`. A text slug never reaches the dispatch. The script generates two uuids: the provision firm, and an other firm. Neither is the seeded Harbor firm. It does not delete seed rows.

It inserts `firms` and `ct_firms` for the other firm (`name` required). It inserts two `contact_records` on the provision firm (`id`, `firm_id`, `name`) before the successful provision, so the live book fill is larger than one and is not the firm id. It inserts one `firms` row whose uuid is in neither `ct_firms` row, for the fallthrough case. It inserts `workflow` (`name` required, `target` `contact`, `graph` the listener or the load graph, `audience_scope` left at the default `every_firm`) and `workflow_state` (`active`) on the provision firm. It calls `materializeTriggersFromGraph`. It deletes the rows it inserts, in foreign-key order: `workflow_run`, `workflow_trigger`, `workflow_state`, `workflow`, `access_links`, `users`, `audit_events`, `sending_domains`, `campaign_states`, `contact_records`, `ct_firms`, `firms`, by these firm ids, these emails, these workflow ids, and the fallthrough firm uuid.

Calls to `handleMachineProvision` and `handlePoolAllocate` use a context whose `req.json` returns the body and whose `json` returns `{ body, status }`. Assertions on runs use this script’s `workflow_id` values only.

Listener graphs are a trigger plus an `exit`, with an edge from the trigger to the exit. `isValidatedPipeline` accepts that. Trigger `data.triggerKind` is `"event"`. `data.triggerEvent` is `"ct_firms"`. `data.configured` is not `false`. Seven listeners on the provision firm:

- global
- local, `data.grain` `"local"`, `data.localRef` unset, `data.localFirmId` unset, `data.localContactIds` unset
- local, `data.localRef` equal to the provision firm id
- local, `data.localRef` `"other-axis"`
- local, `data.localFirmId` the provision firm id, `data.localRef` unset
- local, `data.localFirmId` the other firm id, `data.localRef` unset
- local, `data.localContactIds` one of the two book contacts, `data.localRef` unset

The matching `localRef` is the proof `localRefFromPayload` still returns this firm id from `firmId`. A removed case returns null, and that listener does not run. The contact-axis listener does not run, because this firing names no person and the axis match happens before the book fill.

`workflow_trigger_local_ref` was dropped in `supabase/migrations/016_trigger_local_cascade.sql`, so a local row may store a null `local_ref`.

The load walks call `walkValidatedWorkflow` directly. Each one inserts its `workflow_run` (`status` `running`) before the call, because the walker only updates that row. `loadWriteRow` stays unexported. Each graph is a trigger plus an `if` plus an `exit`. The If uses the legacy pick: `pickTable` `"ct_firms"`, `pickField` the column, `pickOp` `"eq"` or `"exists"`, `pickValue` the passing text when the op is `eq`. `configured` is not `false`. `contactIds` on a field walk is a one-element list, the provision firm id, so a set change is visible. Trigger `payload.writes` is the one pointer the case states. The If detail is `branch → true` or `branch → false`. A detail that starts with `if pick ` means `ct_firms` was added to `PERSON_WRITE_TABLES`, and that case fails.

The walk does not store `triggerPayload`. `firmName`, `email`, and `anyPass` are not on `node_status`. The row, the matching local-ref listener, and the shape guard prove the payload. On this dispatch `payload.firmId` and `opts.firmId` are the same string, so a listener whose `local_firm_id` is this firm matches either way. That listener does not isolate the payload key from the fallback. The shape guard is the proof the compare still reads `firm_id` then `firmId` before `opts.firmId`. The other-firm listener does not match. `anyPass` is not on `node_status`. The shape guard is the proof the caller payload does not set it, and this packet does not require `anyPass` to remain inside `dispatchEventToWorkflows`.

1. Before `handleMachineProvision`, a load walk whose `firmId` is the other firm and whose pointer is `{ table: "ct_firms", id: <provision firm> }`, `pickField` `"name"`, `pickOp` `"exists"`. The detail is `branch → false`. The provision row does not exist yet. A loader that substituted the walk’s firm and found the other firm’s `ct_firms` row takes `true`.
2. `handleMachineProvision` with `firmId` the provision uuid, `firmName` `"Pkt Thirteen"`, `email` `"pkt013@example.com"`, `website` `"https://pkt013.example"`, `role` `"consultant"`. The HTTP status is 200. The body `firmId` is that uuid. `firmName`, `email`, `website`, and `role` are the body values. `ctFirm` is true. `campaignState` is `"armed-for-activation"`. `bound` is true. `authUser` is true. `accessPath` is a non-empty string. `loginPath` equals `accessPath`. `workflowsFired` has one entry per matching listener and no others. One `ct_firms` row has `name` `"Pkt Thirteen"`, `posture` `Idle`, and `pool_slug`, `pool_domain`, and `sending_identity_id` null. One `firms` row and one `campaign_states` row exist for that id. One `users` row exists for that email. One `access_links` row exists for that user. One `audit_events` row exists with kind `firm.provisioned`. Event runs exist for the global listener, the unset-`localRef` listener, the listener whose `localRef` is this firm id, and the listener whose `local_firm_id` is this firm. No event run exists for `other-axis`, for the other firm, or for the contact-axis listener. Each matching event run’s trigger `writes` has length 1. `writes[0].table` is `ct_firms`. `writes[0].id` is the provision firm. `writes[0].contact_id` is null. No element has table `firms`, `campaign_states`, `users`, `access_links`, `audit_events`, or `contact_records`. `counts.contacts` is 2 on each of those runs. The book has two contacts, so a fill that also published the firm id would have stored 3, and a fill that did not run would have stored 0.
3. `writesFromPayload` of `{ writes: [{ table: "ct_firms", id: <provision firm> }], firmId: <provision firm>, firmName: "Pkt Thirteen", email: "pkt013@example.com" }` returns that one pointer with `contact_id` null and does not add `contact_records`. `writesFromPayload` of the same object without `writes` returns no `ct_firms` pointer and no `contact_records` pointer.
4. Load walks of the inserted id. A pointer whose `id` is the provision firm, walked with `firmId` the other firm, is `branch → true` for `name` eq `"Pkt Thirteen"`, `posture` eq `"Idle"`, `created_at` op `"exists"`, and `updated_at` op `"exists"`, and `branch → false` for `pool_slug`, `pool_domain`, and `sending_identity_id` op `"exists"`. A pointer whose `id` is a uuid absent from `ct_firms`, `pickOp` `"exists"` on `name`, is `branch → false` while the other firm’s row exists. A pointer whose `id` is the fallthrough firm uuid, which exists in `firms` and not in `ct_firms`, is `branch → false`. A loader that selected `firms` or the walk’s firm fails one of these.
5. Insert a decoy `ct_firms` row at a third uuid with `name` `"decoy"` and `updated_at` later than the provision row. A load of the provision id’s `name` is still `branch → true` for `"Pkt Thirteen"`. A loader that took the newest row fails this walk.
6. `UPDATE` the provision row’s `name` to `"later-name"` and `posture` to `"Active"`. The same pointer, `pickField` `"name"`, `pickValue` `"later-name"`, is `branch → true`, and `posture` eq `"Active"` is `branch → true`. The case-2 run’s stored `writes[0].id` is still the provision firm. A loader that had copied the columns onto the dispatch at fire time fails this walk. Set `name` back is not required; the next provision conflict sets the name.
7. Set `posture` to `Armed` and the three pool columns to `"keep-slug"`, `"keep-domain"`, and `"keep-sid"` on the provision id. `handleMachineProvision` again with the same `firmId`, `firmName` `"Pkt Thirteen Again"`, and the same email. The row count for that id is still 1. `name` is `"Pkt Thirteen Again"`. `posture` is `Armed`. The three pool columns are still the keep values. The HTTP body is 200 and `firmId` is the same uuid. New matching runs have `writes[0].id` equal to that uuid and `contact_id` null. The case-2 runs still point at the same id. The `users` row for that email is still one row.
8. Omit `firmId`. `firmName` `"Pkt Thirteen Mint"`, `email` a fresh address. The HTTP `firmId` is a new uuid, different from the provision firm. One `ct_firms` row exists at that uuid with `name` `"Pkt Thirteen Mint"` and `posture` `Idle`. A second call is not made. Send `firmId` `""` on a further call with another fresh email and `firmName` `"Pkt Thirteen Blank"`. That response `firmId` is a different new uuid, and exactly one `ct_firms` row exists for it.
9. `firmName` `"   "` or `email` `"   "` returns status 400 and body `{ error: "firmName and email required" }`. No new `ct_firms` row is named with that blank, and the script’s listener run count does not grow.
10. Rename `users` to a scratch name for one call, inside `finally` that renames it back even when the assertion throws. `handleMachineProvision` with a fresh uuid, `firmName` `"Pkt Thirteen Auth"`, and a fresh email. The HTTP status is 200. `authUser` is false. `accessPath` is null. `loginPath` starts with `/login?tenancy=assisted`. One `ct_firms` row exists. Matching listeners have a new run whose `writes[0]` is that firm id and whose `contact_id` is null. No `access_links` row exists for that email. The scratch rename is restored before the script exits.
11. `handlePoolAllocate` for the provision firm, `slug` `"pkt013"`, after case 7’s keep values. `RESEND_API_KEY` is unset, so the domain mint is skipped. `pool_slug`, `pool_domain`, and `sending_identity_id` on that `ct_firms` row change. `posture` stays `Armed`. `name` stays `"Pkt Thirteen Again"`. Load walks of the same pointer are `branch → true` for those three new column values. The number of `event:ct_firms` runs for the script’s listeners does not grow.
12. A direct walk omits `contactIds`. `payload.writes` is one pointer whose `table` is `ct_firms`, whose `id` is the provision firm, and which omits `contact_id`. `counts.contacts` is 0. A second direct walk omits `contactIds` and sets `contact_id` to one book contact, with `id` still the provision firm. `counts.contacts` is 1. A count of 1 on the first walk means the firm id was published from set membership.

`npm run factory:check` reads the dispatch in `handleMachineProvision` and fails unless that payload object contains `firmId: firm`, `firmName`, `email`, and a `writes` element whose `table` is `"ct_firms"` and whose `id` is `firm`. It fails unless `eventName` is `"ct_firms"` and the call’s `firmId` is `firm`. It fails if that call contains `contactIds`. It fails if that payload object contains `posture`, `website`, `role`, `consultant_name`, `consultant_email`, `id`, `contact_id`, `contactIds`, or `anyPass`. It fails if that `writes` element contains `contact_id`. It fails unless `firm` is still `body.firmId?.trim() || randomUUID()` and that binding is the insert id. It fails unless the `ct_firms` statement is still `INSERT INTO ct_firms (id, name, posture, updated_at)` with values `'Idle', now()` and the conflict clause `SET name=EXCLUDED.name, updated_at=now()`. It fails if that conflict clause contains `posture`, `pool_slug`, `pool_domain`, or `sending_identity_id`. It fails if `handleMachineProvision` contains `RETURNING`, `BEGIN`, or `COMMIT`. It fails unless the dispatch `await` is outside the auth `try` and is textually before the `appendFirmAudit` call whose kind is `firm.provisioned`. It fails unless a blank `firmName` or `email` still returns 400 before `getPool()`. It reads `writesFromPayload` and fails if that function contains a `ct_firms` table literal or a `firmName` reader. It reads `loadWriteRow` and fails unless it contains `SELECT * FROM ct_firms WHERE id=$1` bound to `[w.id]`, ignoring whitespace, and fails if that statement contains `firm_id`, `contact_id`, `posture`, `ORDER BY`, `LIMIT`, or `firms`. It fails unless the function still ends at `return null`. It reads the `PERSON_WRITE_TABLES` initializer and fails if that initializer contains `ct_firms`. It reads `localRefFromPayload` and `triggerLocalRefFromPayload` and fails unless each `ct_firms` arm still returns `payloadString(payload, ["id", "firm_id", "firmId"])`. It reads `localAxesMatch` and fails unless the firm compare is still `payloadString(opts.payload, ["firm_id", "firmId"]) ?? opts.firmId`. It reads `eventTest.ts` and fails unless the `ct_firms` door is `SELECT * FROM ct_firms WHERE id=$1 LIMIT 1`. It reads the `WORKFLOW_EVENTS_WITH_LOCAL` initializer and fails unless it contains `ct_firms`. It reads the `ct_firms` entry in `TRIGGER_SELECT_EVENTS` and fails unless `layers` is exactly one `{ kind: "firm" }`. It reads `handlePoolAllocate` and fails if it contains `dispatchEventToWorkflows`, and fails unless its `ct_firms` conflict assigns `pool_slug`, `pool_domain`, and `sending_identity_id` and does not assign `posture`. It reads `appendFirmAudit` and fails if that function contains `dispatchEventToWorkflows`. It reads `executeGet` and fails unless the `firms` module still returns `table: "ct_firms"` and that object literal does not set `contact_id`. It reads `projectSeat` and fails unless the firm query still `UNION ALL` `ct_firms` with `firms`. It does not assert on `anyPass` inside `dispatchEventToWorkflows`. It does not require or forbid the book-fill query. It reads `.github/workflows/ship.yml` and fails unless it invokes `scripts/verify-firm-provision-writes.ts`. Add `server/wire-service/machine.ts`, `server/wire-service/workflowWalk.ts`, `server/wire-service/runWrites.ts`, `server/wire-service/eventTest.ts`, `server/wire-service/pool.ts`, `server/wire-service/stores.ts`, `server/wire-service/routes.ts`, `src/app/data/automationTriggerSelect.ts`, `src/app/data/automationWorkflows.ts`, `scripts/verify-firm-provision-writes.ts`, and `.github/workflows/ship.yml` to the path filter in `.github/workflows/factory-check.yml` if they are not already listed. `server/wire-service/contactSeat.ts` is already listed.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

Door 1’s session-firm read, beyond the shape guard that keeps the current statement. The `event_test_data` specimen, including `consultant_name`, `consultant_email`, and `posture` `Armed`, and `writeId`’s use of `body.id`. Adding a firm-history table or a second `ct_firms` row per provision. Adding `ct_firms` to `PERSON_WRITE_TABLES`. Teaching `writesFromPayload` to map `firmId` onto this table, and teaching it to keep an empty-string `id`. Putting the firm id in `contact_id`. Loading `WHERE id = <the walk’s firm>` instead of `pointer.id`. Falling through to `firms`. Stripping `anyPass` (PKT-004). Dispatching `handlePoolAllocate`, the auth user, the campaign state, the access link, or the provision audit. Retuning `posture` on the conflict clause. The audience fill when `contactIds` is omitted (claim 17), beyond leaving the live branch in place and proving its current cardinality. A non-uuid `firmId`, which the existing `$1::uuid` cast already rejects before `ct_firms`. `executeGet` and `projectSeat`, beyond the shape guard that they are not this load. Seed inserts. Launch Agent. No plate.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `ct_firms` dispatch payload | Gains one `writes` pointer. `firmId`, `firmName`, and `email` stay. `id` is `firm`. No `contact_id` | `dispatchEventToWorkflows`, `writesFromPayload`, `localAxesMatch`, trigger `node_status.writes` | Modified |
| `ct_firms` provision statement | Same upsert. Conflict still assigns `name` and `updated_at` only. No `RETURNING` | Insert, later `loadWriteRow` | Only verified |
| `ct_firms` row on insert | `name` is `firmName`, `posture` is `Idle`, pool columns null | Field reads after this firing | Only verified |
| `ct_firms` row on conflict | `name` is this call’s `firmName`. `posture` and the pool columns stay | Field reads after a second provision | Only verified |
| `loadWriteRow` | One branch, `WHERE id=$1` bound to `w.id`. Other branches stay | If field reads of this table | Modified |
| `PERSON_WRITE_TABLES` | Unchanged. `ct_firms` stays out | `personTableOf`, `evalIfPick`, `personIdsFromWrites` | Only verified |
| `personIdsFromWrites` | Unchanged. This pointer’s null `contact_id` contributes no person. `id` is not a person for this table | Trigger contact list when the caller list is empty | Only verified |
| `writesFromPayload` | Unchanged. `payload.writes` is the handle. No `firmId` reader. Absent `contact_id` stays null | Every trigger, including this event | Only verified |
| `RunWrite` | Unchanged. This firing omits `contact_id` | This pointer’s `id` | Only verified |
| `localRefFromPayload`, `triggerLocalRefFromPayload`, `localAxesMatch` | Unchanged. This event still returns `id`, `firm_id`, or `firmId`. Firm compare still reads the payload, then `opts.firmId` | Local `ct_firms` listeners | Only verified |
| `dispatchEventToWorkflows` | Unchanged. Still copies the payload and sets `eventName` and `anyPass`. The book fill stays | This event’s listeners | Only verified |
| `event_write_set` `ct_firms` v1 | Already ord 0 for this table. Not read at fire time | Live payload literal | Only verified |
| `eventTest.ts` door 1 | Still one row by the session firm | Test door | Only verified |
| `WORKFLOW_EVENTS_WITH_LOCAL`, `TRIGGER_SELECT_EVENTS` | Unchanged. `ct_firms` stays in the local set. The A26 row stays firm only | Local-axis catalog | Only verified |
| `POST /machine/provision` | Same handler. The response keys stay. The dispatch gains `writes` | Provision HTTP body | Modified |
| `POST /pool/allocate` | Same statement. It does not dispatch | Pool columns on the same id | Only verified |
| `firms`, `campaign_states`, `users`, `access_links`, `audit_events` | Still written by the handler. None join `writes` | Auth user, access mint, provision audit | Only verified |
| `executeGet` firms, `projectSeat` | Unchanged. Neither is this load | Get node, contact seat | Only verified |
| `scripts/verify-firm-provision-writes.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases and the shape guard | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| The provision dispatch omits `writes`, so `writesFromPayload` returns no pointer. The upsert has no `RETURNING`. `writes[0].id` is the `firm` variable the handler already bound, which is also `ct_firms.id` and `payload.firmId`. A second `randomUUID()` would publish a pointer that matches no row. The element does not carry `contact_id`. The reader stores null. `RunWrite.contact_id` stays optional. | necessary |
| `writesFromPayload` returns the array and then stops. It does not read `firmId`, `firmName`, or `email`. A reader for `firmId` would invent a `ct_firms` pointer when `writes` is absent, which case 3 forbids. The payload must not gain `contactIds`, or a missing `writes` array would publish `contact_records`. `contactIds` stays omitted. The existing `!id` drop also rejects `""`. This firing uses a non-empty id. This packet does not retune that drop. | necessary |
| `loadWriteRow` returns null for `ct_firms`. The primary key is `id`. The load binds `w.id` and does not bind the function’s `firmId`. On this firing those two strings are equal, and the predicate is still the pointer, which case 4 separates by walking the other firm. No `ORDER BY` and no `LIMIT`: the id is unique, and door 1’s session-firm read is a different statement. Case 5 is that difference. Case 6 is the re-read. `name`, `posture`, the pool columns, `created_at`, and `updated_at` stay columns. A miss does not query `firms`. Other branches in the function stay, including any PKT-006, PKT-009, PKT-010, PKT-011, or PKT-012 branch already present. Those packets do not add this branch. The function stays unexported unless an earlier packet exported it. | necessary |
| `PERSON_WRITE_TABLES` omits `ct_firms`. `personIdsFromWrites` then sees null `contact_id` and does not publish `id`. `evalIfPick` person-splits only when the set contains the table and `ctx.contactIds` is non-empty, so the field walks pass a one-element `contactIds` and expect `branch →`. An empty list would hide the set change. Case 12 is the empty caller list: `counts.contacts` 0 when `contact_id` is absent, and 1 when `contact_id` is set. Adding the name would fail both the detail and the first count. This packet does not add the name. | necessary |
| `localRefFromPayload` and `triggerLocalRefFromPayload` already return `id`, `firm_id`, or `firmId` for this event. The payload keeps `firmId` and does not gain `id`. A listener whose `localRef` is this firm runs, which fails if the arm is removed, because null does not equal the firm id. An unset `localRef` still matches. `other-axis` does not match. A listener whose `local_contact_ids` names a book contact does not match, because the payload has no contact key and the call passes no `contactIds`, and that compare runs before the book fill. | necessary |
| On this dispatch `payload.firmId` and `opts.firmId` are the same string. A listener for this firm matches either way, and a listener for the other firm does not. That pair does not prove which string was compared. The shape guard locks `payloadString(opts.payload, ["firm_id", "firmId"]) ?? opts.firmId`. | necessary |
| The upsert and the auth block complete before the await. The auth `try` does not contain the dispatch. There is no transaction around the dispatch and no `try/catch` on it. A dispatch error leaves the `ct_firms` row, skips `appendFirmAudit`, and does not return the HTTP body. Wrapping the await would change that. The columns a later node reads are not copied onto the payload. The migrated `users` table makes the auth block succeed, so case 10 renames that table for one call and restores it. The product code stays the existing catch. | necessary |
| The walk stores `writes` and does not store `triggerPayload`. `firmName`, `email`, and `anyPass` are not on `node_status`. The row and the matching local-ref listener prove the firm string is the value the ref reader sees. The object literal proves which keys are present. `comparePasses` leaves null columns as a failed `exists`, so the insert’s pool columns are proved with `exists` returning false, not a literal null. `updated_at` is proved with `exists`, not a literal timestamp. | necessary |
| `walkValidatedWorkflow` updates `workflow_run` and does not insert it. `dispatchEventToWorkflows` inserts before the walk. A direct load walk that skips the insert updates zero rows, and the case cannot read `node_status`. The script inserts the run first. `counts.contacts` is the stored length, not the id list. Through the provision call, two book contacts make `counts.contacts` 2 while `writes` stays the one firm pointer. That is the live fill. It is not a second element. | necessary |
| `firms.id` is `UUID` and the provision insert casts `$1::uuid`. The packet’s mint is `randomUUID()`, which is a uuid. A non-uuid `firmId` throws on `firms` before `ct_firms` and before the dispatch. The packet quotes that cast and does not add a 400 for it. The verify uses uuids. This packet does not retune the cast. | adjacent |
| Door 1 selects one `ct_firms` row by the session firm, with `LIMIT 1`. The handle is the pointer id, which case 5 separates from a newer decoy. The door stays. `event_write_set` version 1 already names this table at ord 0. The payload is a literal. It does not read that registry. The specimen keys `consultant_name` and `consultant_email`, and `posture` `Armed`, stay on `event_test_data`. The live insert does not copy them. `writeId` uses `body.id` when it is present. The live pointer does not call `writeId`. The specimen is not a second element of this firing’s array. | adjacent |
| PKT-004’s change specification says the current `ct_firms` caller payload is unchanged apart from the forced `anyPass` copy, and its shape guard fails if `dispatchEventToWorkflows` still contains `anyPass`. This packet adds `writes` to that caller and does not edit `dispatchEventToWorkflows`. Implementing PKT-004 must not delete `writes`. This packet’s shape guard does not require `anyPass` to remain on the walked copy, so the two guards do not deadlock. Acceptance that the walked trigger still receives `anyPass` holds because this packet does not edit that function. This packet does not edit `SCP-pkt-004-firing-handle.md`. | adjacent |
| PKT-006, PKT-009, PKT-010, PKT-011, and PKT-012 add other `loadWriteRow` branches and do not add this one. If those branches are already present, leave them. This packet does not edit their change specifications. Claim 10’s `WHERE id = pointer.id` is this branch. Claim 15’s pair does not apply. `ct_firms` has an `id` column and no `contact_id` column. | adjacent |
| Claim 17 specifies the person list when this call omits `contactIds`. The live branch already fills `every_firm` from `contact_records` for `opts.firmId`. Case 2 proves that current cardinality: two book contacts, `counts.contacts` 2, `writes` still one firm pointer with null `contact_id`. The shape guard does not lock the book-fill SQL. This packet does not implement the fill and does not edit `dispatchEventToWorkflows`. | adjacent |
| `executeGet` for module `firms` and `projectSeat` already read a firm row by id. They do not need this listening run. The shape guard locks the current `ct_firms` pointer shape and the `UNION ALL`. Seed inserts in `013_operator_book_people.sql` are not this dispatch. The verify does not use the Harbor firm and does not delete those rows. | adjacent |
| The packet file still says `**Release:** draft`. The ledger stage for this revision was `released` when this wake was authorized, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
