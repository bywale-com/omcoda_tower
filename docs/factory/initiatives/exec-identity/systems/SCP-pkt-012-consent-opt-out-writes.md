# SCP-pkt-012 — A consent_records.opt_out firing places the current pair on payload.writes

**Packet:** PKT-012 `pkt-012-consent-opt-out-writes`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 15, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`. Revisions under claims 25, 26, and 27 leave this pointer unchanged.  
**Contract:** `docs/factory/components/firing-pointers/CONTRACT.md` — claim 15’s one-element array. The load is `contact_id` plus the walk’s firm. The table has no `id` column. `docs/factory/components/walk-handle/CONTRACT.md` — PKT-012 loads `consent_records` by that pair. The branch is not PKT-006, and it is not claim 10’s `WHERE id = pointer.id`.

## Intent

`handleConsentSilence` still upserts one `consent_records` row on `(contact_id, firm_id)` and then calls `dispatchEventToWorkflows` once. The statement stays the current insert: `basis` `'none'`, `silenced` true, `source` the body’s source, `updated_at` `now()`, and on conflict `silenced` true, `source` this call’s source, `updated_at` `now()`. The conflict clause still assigns neither `basis` nor `status` nor `workspace_opted_out`. An insert stores `basis` `none` and `silenced` true. `status` stays the column default `unsequenced`. `workspace_opted_out` stays the column default false. A conflict leaves the existing `basis`, `status`, and `workspace_opted_out`. The call stays a direct await of `getPool()`. The HTTP body stays `{ ok: true }`. The statement still has no `RETURNING`. The pointer is not a column the statement returned.

The dispatch payload gains

`writes: [{ table: "consent_records", id: <body.contactId>, contact_id: <body.contactId> }]`

That pointer is the only element. `id` and `contact_id` are the same string, the contact the upsert used. `writesFromPayload` drops an element whose `id` is not a string, and the existing `!id` check also drops an empty string. This firing’s contact id is a non-empty string. This table has no `id` column. The person half of the primary key is `contact_id`. The firm half is the walk’s firm. `firmId` on the dispatch stays `body.firmId`. `RunWrite` has no `firm_id` field. Firm stays off the pointer.

`consent_records` stays out of `PERSON_WRITE_TABLES`. This firing has one pointer and it carries `contact_id`, so `personIdsFromWrites` uses that field. The `id` string is not a person by set membership.

The keys already on the payload stay: `contactId` and `source`. `contactIds` stays the dispatch argument, that one contact. The payload does not gain `basis`, `status`, `firmId`, `firm_id`, `contact_id`, `contactIds`, `contact_name`, `firm`, or `anyPass`. `writesFromPayload` gains no reader for `contactId` or `source`. With `writes` present it returns that one pointer and does not add `contact_records`.

`localRefFromPayload("consent_records.opt_out")` and `triggerLocalRefFromPayload` stay as they are. Both return `contact_id` or `contactId` when that value is a non-empty string. This packet does not add a payload key and does not remove the case. `localAxesMatch` compares `local_contact_ids` to `payload.contactId`, then falls back to `contactIds`, and compares the firm to `opts.firmId` when `local_firm_id` is set and the payload has no firm key. `local_ref` is compared only when it is set. A stored `local_ref` matches when it equals this contact id. `WORKFLOW_EVENTS_WITH_LOCAL` still omits `consent_records.opt_out`. This packet does not add a `consent_records.sequenced` firing. Claim 27 owns that name.

`dispatchEventToWorkflows` is not edited. It still copies the payload and still sets `anyPass: true` on the walked trigger. `writes` has to be on the object passed in, because the copy is what `writesFromPayload` reads. Claim 7’s refusal of `anyPass` is not recut. This packet does not put `anyPass` on the silence payload. PKT-004 removes the forced copy. Implementing PKT-004 must not delete `writes`.

`loadWriteRow` gains a `consent_records` branch: `SELECT * FROM consent_records WHERE contact_id=$1 AND firm_id=$2`, bound to `w.contact_id` and the `firmId` argument already passed into `loadWriteRow`. No `ORDER BY`. No “latest”. No `silenced` filter. No `status` filter. No `LIMIT`. A miss returns null. The predicate does not use `w.id` and does not look for a column named `id`. It does not use the `const contactId = w.contact_id ?? w.id` that the earlier branches already use. When `w.contact_id` is not a non-empty string, the branch returns null and does not query. On this firing `w.contact_id` and `w.id` are the same contact, and the firm argument is the walk’s firm, which is `body.firmId`. That pair is the primary key. This is not claim 10’s `WHERE id = pointer.id`. This packet does not change that predicate for tables that have an `id` column. It does not change claim 8’s `(audit_run_id, contact_id)` load.

A later node reads `basis`, `silenced`, `source`, `status`, `workspace_opted_out`, and `updated_at` from that row. On an insert from this firing, `basis` is `none`, `silenced` is true, `source` is the body’s source, `status` is `unsequenced`, and `workspace_opted_out` is false. On a conflict, `silenced` is true, `source` is this call’s source, and `basis`, `status`, and `workspace_opted_out` are whatever the row already held. Those columns are not copied onto the dispatch. A later update of the same pair is visible on the re-read.

`event_write_set` version 1 already names `consent_records` alone, at ord 0. This packet does not write a migration and does not retune door 1. Door 1 for this event stays the newest ten `consent_records` rows for the firm with `silenced` true, ordered by `updated_at`. `writeId` still uses `body.contact_id` when `body.id` is absent. The live pointer is the payload literal. It is not `writeId`.

`handleConsentSet` still upserts the same primary key and does not dispatch. A new row still stores the body’s `basis` and `silenced` false. On conflict it still updates `basis`, keeps `source` when the body omits it, updates `updated_at`, and leaves `silenced` as it was. `handleContactSeatConsent` still sets `basis` from Agree or Ignore, sets `silenced` false, and does not dispatch. `handleContactSeatSilence` still sets `workspace_opted_out` true on the same pair, does not set `silenced`, and does not dispatch. The hard-bounce upsert still sets `silenced` true and `source` `hard-bounce`, and it does not dispatch. The in-memory stand-in `silence` still does not call the dispatcher. This firing is `handleConsentSilence`.

`consentAndHaltGate` still selects `consent_records` by `contact_id` alone with `LIMIT 1`. That gate is not this pointer. This packet does not add `firm_id` to that query.

## Must / must-not

- Keep the silence statement. The conflict clause still assigns neither `basis` nor `status` nor `workspace_opted_out`. The statement still has no `RETURNING`. Do not read the row back to build the pointer.

```ts
await getPool().query(
  `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, source, updated_at)
   VALUES ($1,$2,'none',true,$3,now())
   ON CONFLICT (contact_id, firm_id) DO UPDATE
     SET silenced = true, source = EXCLUDED.source, updated_at = now()`,
  [body.contactId, body.firmId, body.source],
);
```

- The payload is the existing pair plus `writes`. `contactIds` stays the argument, not a payload key. `id` and `contact_id` are both `body.contactId`. One expression, used twice. Do not mint a second id. Do not encode the pair into one string. Do not put `firm_id` on the pointer.

```ts
await dispatchEventToWorkflows(getPool(), {
  firmId: body.firmId,
  eventName: "consent_records.opt_out",
  payload: {
    contactId: body.contactId,
    source: body.source,
    writes: [
      {
        table: "consent_records",
        id: body.contactId,
        contact_id: body.contactId,
      },
    ],
  },
  contactIds: [body.contactId],
});
```

- Keep that call a direct `await` of `dispatchEventToWorkflows(getPool(), …)`. One call. Do not wrap it in `try/catch`. Do not add `BEGIN` or `COMMIT`. A dispatch error still propagates, and the HTTP body is not returned. The upsert above has already completed.
- The HTTP body stays `c.json({ ok: true })`. Do not add `writes` to it.
- Do not put `basis`, `status`, `firmId`, `firm_id`, `contact_id`, `contactIds`, `contact_name`, `firm`, or `anyPass` on the caller payload. The array length is 1. The table string is `"consent_records"`.
- Add one `loadWriteRow` branch, before the final `return null`:

```ts
if (w.table === "consent_records") {
  if (typeof w.contact_id !== "string" || w.contact_id === "") return null;
  const { rows } = await pool.query(
    `SELECT * FROM consent_records WHERE contact_id=$1 AND firm_id=$2`,
    [w.contact_id, firmId],
  );
  return (rows[0] as Record<string, unknown> | undefined) ?? null;
}
```

  Bind `w.contact_id` and the function’s `firmId`. Do not bind `w.id`. Do not bind the local `contactId` from `w.contact_id ?? w.id`. Leave that local for the branches that already use it. No `ORDER BY`, no `LIMIT`, no `silenced`, no `status`. A missing pair returns null. Do not query again by `id`. Do not interpolate the table name. Leave every other branch, including a `fact_writebacks`, `meeting_booked`, `wait_occupancy`, `engagement_records`, `campaign_failure`, `halt_records`, or eligibility branch another packet may already have added. Do not export `loadWriteRow`. If it is already exported, leave the export.
- Do not add `consent_records` to `PERSON_WRITE_TABLES`. Do not remove a name that is already there. Do not edit `personTableOf`, `evalIfPick`, `personIdsFromWrites`, `pickWrites`, or either `find` in `resolveOperandText`.
- Do not edit `writesFromPayload`. Do not teach it to map `contactId` or `source` onto `consent_records`. Do not teach it to keep an empty-string `id`.
- Do not edit `localRefFromPayload`, `triggerLocalRefFromPayload`, `localAxesMatch`, or `triggerLocalAxesMatch`. The `consent_records.opt_out` arm stays `payloadString(payload, ["contact_id", "contactId"])` in both ref readers.
- Do not edit `dispatchEventToWorkflows`, including the `anyPass` copy and the empty-list book fill. Stripping `anyPass` is PKT-004.
- Do not add `consent_records.opt_out` to `WORKFLOW_EVENTS_WITH_LOCAL`. Do not add a `consent_records.sequenced` firing. Do not edit `TRIGGER_SELECT_EVENTS` or `WORKFLOW_EVENT_CATALOG`.
- Do not bump `event_write_set`. Do not read `event_write_set` or `event_test_data` to build this payload. Do not edit `eventTest.ts`. Door 1 for this event stays `SELECT * FROM consent_records WHERE firm_id=$1 AND silenced=true ORDER BY updated_at DESC LIMIT 10`. `writeId` stays `body.contact_id` when `body.id` is absent. Do not add a migration.
- Leave `handleConsentSet`, including the conflict clause that assigns `basis`, keeps `source` with `COALESCE(EXCLUDED.source, consent_records.source)`, and does not assign `silenced`. It does not call `dispatchEventToWorkflows`.
- Leave `handleContactSeatConsent`. Agree stores `basis` `express` and `source` `contact_workspace`. Ignore stores `basis` `none` and `source` `ignored`. Both store `silenced` false. The conflict still assigns `basis`, `silenced` false, `source`, and `updated_at`. It does not dispatch.
- Leave `handleContactSeatSilence`. The insert stores `workspace_opted_out` true, `silenced` false, `basis` `none`, and `source` `contact_workspace.workspace_opt_out`. The conflict assigns `workspace_opted_out` and `updated_at` only. It does not assign `silenced`. It does not dispatch. The response stays `workspaceOutRefuse()`.
- Leave the hard-bounce upsert in `handleResendWebhook`. It still sets `silenced` true and `source` `'hard-bounce'` and does not assign `basis` or `status`. `webhooks.ts` still has no `dispatchEventToWorkflows` call.
- Leave `standInConsentSilence.silence`. It still sets the in-memory `silenced` flag and does not call the dispatcher. Leave `realConsentSilence`. It still posts `{ contactId, firmId, source }` to `/consent/silence` and does not build `writes`.
- Leave `consentAndHaltGate`’s contact query: `SELECT basis, silenced, status FROM consent_records WHERE contact_id = $1 LIMIT 1`. Do not add `firm_id`. Leave `handleConsentGet` on the same contact-only predicate. Do not edit `routes.ts`.

## Stores and contracts

`consent_records` has no `id` column. The primary key is `(contact_id, firm_id)`.

```38:47:supabase/migrations/003_ct_wire_stores.sql
CREATE TABLE IF NOT EXISTS consent_records (
  contact_id TEXT NOT NULL,
  firm_id TEXT NOT NULL,
  basis TEXT NOT NULL DEFAULT 'none'
    CHECK (basis IN ('express', 'implied', 'none')),
  silenced BOOLEAN NOT NULL DEFAULT false,
  source TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, firm_id)
);
```

`status` is a later column. The default is `unsequenced`. The one-time `UPDATE` in that migration rewrote rows that already existed at migrate time. It is not the live insert. An insert from this firing that omits `status` stores `unsequenced` even when `silenced` is true. Claim 25 owns a later status write on the silence statement.

```8:10:supabase/migrations/004_machine_tables.sql
ALTER TABLE consent_records
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'unsequenced'
    CHECK (status IN ('unsequenced', 'waitlisted', 'sequenced', 'silenced'));
```

`workspace_opted_out` defaults to false. The silence insert omits it, so an insert stores false. A conflict does not assign it.

```5:6:supabase/migrations/020_workspace_opt_out.sql
ALTER TABLE consent_records
  ADD COLUMN IF NOT EXISTS workspace_opted_out BOOLEAN NOT NULL DEFAULT false;
```

`event_write_set` version 1 already names this event’s only table at ord 0. The specimen body has `contact_id` and no `id`. Door 1’s `writeId` therefore uses `contact_id`. The live firing does not read this row.

```33:33:supabase/migrations/017_event_test_contract.sql
('consent_records.opt_out', 1, 'consent_records', 0),
```

```75:75:supabase/migrations/017_event_test_contract.sql
('etd-consent-haddad', 'consent_records.opt_out', 1, 'consent_records', 0, '{"contact_id":"cr-harbor-haddad","firm_id":"firm-standin-harbor","firm":"Harbor RCIC","contact_name":"Samira Haddad","basis":"none","silenced":true,"source":"unsubscribe.email","updated_at":"2026-08-15T08:22:00.000Z"}'::jsonb),
```

The firing-pointers contract names this packet as the one-element array, and the walk-handle contract names the pair load. Those sentences are the contract. This packet does not edit either file.

`RunWrite` is the pointer shape. There is no `firm_id` field. `contact_id` is optional. This firing sets it.

```1:6:server/wire-service/runWrites.ts
/** This run’s writes — the next node’s input. Not an events table. */
export type RunWrite = {
  table: string;
  id: string;
  contact_id?: string | null;
};
```

## Runtime

The silence route upserts, then dispatches `{ contactId, source }` and no `writes`. That payload is the gap. The statement is the one this packet keeps.

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

`handleConsentSet` upserts the same pair and returns. The conflict assigns `basis` and keeps an omitted `source`. It does not assign `silenced`. It does not dispatch.

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

`writesFromPayload` already returns when `payload.writes` is an array. A non-string `id`, an empty `id`, or a missing `table` drops that element. `contact_id` is kept when it is a string. There is no arm for `contactId` or `source`. This packet leaves the function.

```8:27:server/wire-service/runWrites.ts
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
```

The fallthrough, used only when `writes` is absent, publishes `contact_records` from `contactIds` / `contact_ids`. A `contactIds` key on this payload would feed that fallthrough whenever `writes` is missing. The key stays off the payload. The dispatch argument is separate and is not copied into `triggerPayload`.

`PERSON_WRITE_TABLES` does not contain `consent_records`. `personIdsFromWrites` uses `contact_id` first, and uses `id` only for a table in the set. This firing’s person id is the pointer’s `contact_id`.

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

`loadWriteRow` has no `consent_records` branch. The function falls through to null. The local `contactId` is `w.contact_id ?? w.id`, and the `sequence_ready` and `reachability_verdicts` branches use it. The new branch does not.

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

The walker copies `opts.payload` and then sets `eventName` and `anyPass`. `writes` survives only when it is already on `opts.payload`. `firmId` passed into the walk is `opts.firmId`, which this caller sets from `body.firmId`.

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

The trigger node stores `writesFromPayload(triggerPayload)` on `node_status`. It does not store `triggerPayload`. `contactId`, `source`, and `anyPass` are not on that record. When the caller omits `contactIds`, the walk fills them from `personIdsFromWrites`. `counts.contacts` is that length.

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

`evalIfPick` person-splits only when `personTableOf` finds the table in `PERSON_WRITE_TABLES` and `ctx.contactIds` is non-empty. The detail is then `if pick <table>.<field> …`. Otherwise the detail is `branch → true` or `branch → false`. A field read goes through `loadWriteField` → `loadWriteRow`. `resolveOperandText` stringifies the value, so a boolean `true` compares as `"true"` and `false` as `"false"`. A null row fails `exists`. An If whose detail starts with `if pick ` means `consent_records` was added to the set.

Both local-ref readers already resolve this event from `contact_id` or `contactId`. The payload carries `contactId`. A stored `local_ref` equal to that contact matches. This packet leaves both functions.

```1853:1861:server/wire-service/workflowWalk.ts
function localRefFromPayload(
  eventName: string,
  payload: Record<string, unknown> | undefined,
): string | null {
  if (eventName === "fact_writebacks") return payloadString(payload, ["form_ref", "formRef"]);
  if (eventName === "campaign_failure") return payloadString(payload, ["campaign_id", "campaignId"]);
  if (eventName === "ct_firms") return payloadString(payload, ["id", "firm_id", "firmId"]);
  if (eventName === "consent_records.opt_out") return payloadString(payload, ["contact_id", "contactId"]);
  if (eventName === "contact_import") return payloadString(payload, ["import_batch_id", "importBatchId"]);
```

```145:153:src/app/data/automationTriggerSelect.ts
export function triggerLocalRefFromPayload(
  eventName: string,
  payload?: Record<string, unknown>,
): string | null {
  if (eventName === "fact_writebacks") return payloadString(payload, ["form_ref", "formRef"]);
  if (eventName === "campaign_failure") return payloadString(payload, ["campaign_id", "campaignId"]);
  if (eventName === "ct_firms") return payloadString(payload, ["id", "firm_id", "firmId"]);
  if (eventName === "consent_records.opt_out") return payloadString(payload, ["contact_id", "contactId"]);
  if (eventName === "contact_import") return payloadString(payload, ["import_batch_id", "importBatchId"]);
```

`localAxesMatch` compares `local_ref` only when it is set. The firm compare uses a root `firm_id` / `firmId` when that string is present, and otherwise `opts.firmId`. This caller passes `firmId` and does not put a firm key on the payload, so the compare sees `opts.firmId`. The contact compare uses a root `contact_id` / `contactId` when that string is present, and otherwise `opts.contactIds`.

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

`WORKFLOW_EVENTS_WITH_LOCAL` includes `consent_records.sequenced` and omits `consent_records.opt_out`.

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

Door 1 is the newest ten silenced rows for the firm. `writeId` uses `id` when that string is present, and otherwise `contact_id`. The specimen has no `id`, so door 1’s handle id is `contact_id`. The live pointer is still the literal `body.contactId`, not this function.

```15:19:server/wire-service/eventTest.ts
function writeId(table: string, body: Record<string, unknown>): string {
  if (typeof body.id === "string" && body.id) return body.id;
  if (typeof body.contact_id === "string" && body.contact_id) return body.contact_id;
  return `${table}-specimen`;
}
```

```89:96:server/wire-service/eventTest.ts
    if (eventName === "consent_records.opt_out") {
      const ok = await push(
        "consent_records",
        `SELECT * FROM consent_records WHERE firm_id=$1 AND silenced=true ORDER BY updated_at DESC LIMIT 10`,
        [firm],
      );
      return ok ? out : null;
    }
```

The seat writers do not dispatch. Agree and Ignore both store `silenced` false. The workspace opt-out sets `workspace_opted_out` and leaves `silenced` alone on conflict.

```526:554:server/wire-service/contactSeat.ts
export async function handleContactSeatConsent(c: Context) {
  const resolved = await seatFromContext(c);
  if ("refuse" in resolved) return jsonRefuse(c, resolved);
  const body = await c.req.json<{ action?: "agree" | "ignore" }>().catch(() => ({}));
  const action = body.action === "ignore" ? "ignore" : "agree";
  const basis = action === "agree" ? "express" : "none";
  const source = action === "agree" ? "contact_workspace" : "ignored";
  await resolved.pool.query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, source, updated_at)
     VALUES ($1,$2,$3,false,$4,now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE
       SET basis = EXCLUDED.basis, silenced = false, source = EXCLUDED.source, updated_at = now()`,
    [resolved.link.contact_id, resolved.link.firm_id, basis, source],
  );
  return json(c, await projectSeat(resolved.pool, resolved.link));
}

export async function handleContactSeatSilence(c: Context) {
  const resolved = await seatFromContext(c);
  if ("refuse" in resolved) return jsonRefuse(c, resolved);
  await resolved.pool.query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, source, workspace_opted_out, updated_at)
     VALUES ($1,$2,'none',false,'contact_workspace.workspace_opt_out',true,now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE
       SET workspace_opted_out = true, updated_at = now()`,
    [resolved.link.contact_id, resolved.link.firm_id],
  );
  return json(c, workspaceOutRefuse());
}
```

`contactSeat.ts` does call `dispatchEventToWorkflows` from the fact, meeting, and upload handlers. Those calls stay. The consent and workspace-silence handlers do not gain one.

The hard bounce upserts and does not dispatch. `webhooks.ts` does not import the dispatcher.

```140:148:server/wire-service/webhooks.ts
    if (eventClass === "bounce_hard" && contactId) {
      await pool.query(
        `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, source, updated_at)
         VALUES ($1,$2,'none',true,'hard-bounce',now())
         ON CONFLICT (contact_id, firm_id) DO UPDATE
           SET silenced = true, source = 'hard-bounce', updated_at = now()`,
        [contactId, firmId],
      );
    }
```

The stand-in writes a map and does not dispatch.

```16:23:src/app/wire/standins/consentSilence.ts
  async silence(contactId, firmId, _source) {
    const prev = byContact.get(contactId);
    byContact.set(contactId, {
      firmId,
      basis: prev?.basis ?? "none",
      silenced: true,
    });
  },
```

The send gate is not this pointer. It selects by `contact_id` alone.

```70:73:server/wire-service/dispatchSend.ts
  const consent = await pool.query<{ basis: string; silenced: boolean; status?: string }>(
    `SELECT basis, silenced, status FROM consent_records WHERE contact_id = $1 LIMIT 1`,
    [contactId],
  );
```

`handleConsentGet` is the same contact-only read, `LIMIT 1`, and it returns `basis`, `silenced`, and `source`. It is not the walk load.

## Ports

No new port.

These stay on the same functions:

- `POST /consent/silence` → `handleConsentSilence`. The JSON body stays `contactId`, `firmId`, `source`. The dispatch gains `writes`. The response stays `{ ok: true }`.
- `POST /consent` → `handleConsentSet`. Same body. No dispatch.
- `GET /consent/:contactId` → `handleConsentGet`. Still one row by `contact_id` alone.
- `POST /contact-seat/:token/consent` → `handleContactSeatConsent`. No dispatch.
- `POST /contact-seat/:token/silence` → `handleContactSeatSilence`. No dispatch.
- `POST /webhooks/resend` → `handleResendWebhook`. A hard bounce still upserts and does not dispatch.
- `realConsentSilence.silence` still posts `{ contactId, firmId, source }` to `/consent/silence`. The server builds `writes`. The client does not.
- `dispatchEventToWorkflows` for `consent_records.opt_out`. Same `firmId`. `contactIds` stays `[body.contactId]`. The payload gains `writes`.
- `loadWriteRow` gains one branch. It is not an HTTP route.
- `writesFromPayload`, `localRefFromPayload`, `triggerLocalRefFromPayload`, `localAxesMatch`, and `triggerLocalAxesMatch`. Unchanged readers.
- Door 1 in `eventTest.ts`. Unchanged.
- `standInConsentSilence.silence`. Unchanged. The stand-in is not this firing.

```157:159:server/wire-service/routes.ts
  wire.post("/consent", handleConsentSet);
  wire.post("/consent/silence", handleConsentSilence);
  wire.get("/consent/:contactId", handleConsentGet);
```

```12:17:src/app/wire/reals/consentSilence.ts
  async silence(contactId, firmId, source) {
    await wireFetch("/consent/silence", {
      method: "POST",
      body: JSON.stringify({ contactId, firmId, source }),
    });
  },
```

## Verify

`scripts/verify-consent-opt-out-writes.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` after migrate and seed, in the same job as `verify-click-attribution`. `npm run build` is not this proof.

The script uses `getPool()` the way `scripts/verify-click-attribution.ts` does. It exits 2 when `DATABASE_URL` is missing. Firm id is `firm-pkt012-` plus a run token, plus a second firm `firm-pkt012-` plus the token plus `-other`. Neither is the seeded Harbor firm. The script does not set send mode, does not call `tickOnce`, and does not require `TEST_EMAIL_TO` or `TEST_SMS_TO`. It does not boot Vite. It deletes `RESEND_WEBHOOK_SECRET` for the process the way `verify-click-attribution.ts` does, so the bounce call is not a signature test.

It inserts its own `ct_firms` (`name` required) and `contact_records` on the first firm (`id`, `firm_id`, `name`). The contacts are: the silence contact, a decoy contact, a conflict contact, a set-consent contact, a seat-agree contact, a seat-ignore contact, a seat-silence contact, a bounce contact, and one extra contact so a book fill is larger than one. It inserts one `consent_records` row for the silence contact at the other firm before any silence call: `basis` `express`, `silenced` false, `source` `other-firm`, `status` `sequenced`, `workspace_opted_out` true. It inserts `workflow` (`name` required, `target` `contact`, `graph` the listener or the load graph, `audience_scope` left at the default `every_firm`) and `workflow_state` (`active`). It calls `materializeTriggersFromGraph`. It deletes the rows it inserts, in foreign-key order: `workflow_run`, `workflow_trigger`, `workflow_state`, `workflow`, `messaging_events`, `provider_webhook_receipts`, `outbound_messages`, `contact_access_links`, `consent_records`, `contact_records`, `ct_firms`, by these two firm ids, these workflow ids, and these provider event ids.

Calls to `handleConsentSilence` and `handleConsentSet` use a context whose `req.json` returns the body and whose `json` returns `{ body, status }`. Seat calls use `req.param("token")` and `req.json`. The bounce call uses `req.text`, `req.raw.headers`, and `req.header` the way `verify-click-attribution.ts` builds a webhook context, with type `email.bounced` and `data.email_id` the outbound `provider_message_id`. Assertions on runs use this script’s `workflow_id` values only.

Listener graphs are a trigger plus an `exit`, with an edge from the trigger to the exit. `isValidatedPipeline` accepts that. Trigger `data.triggerKind` is `"event"`. `data.triggerEvent` is `"consent_records.opt_out"`. `data.configured` is not `false`. Seven listeners on the first firm:

- global
- local, `data.grain` `"local"`, `data.localRef` unset, `data.localFirmId` unset, `data.localContactIds` unset
- local, `data.localRef` equal to the silence contact id
- local, `data.localRef` `"other-axis"`
- local, `data.localFirmId` the first firm id, `data.localRef` unset
- local, `data.localFirmId` the other firm id, `data.localRef` unset
- local, `data.localContactIds` the silence contact, `data.localRef` unset

The matching `localRef` is the proof `localRefFromPayload` still returns this contact id. A removed case returns null, and that listener does not run.

`workflow_trigger_local_ref` was dropped in `supabase/migrations/016_trigger_local_cascade.sql`, so a local row may store a null `local_ref`.

The load walks call `walkValidatedWorkflow` directly. Each one inserts its `workflow_run` (`status` `running`) before the call, because the walker only updates that row. `loadWriteRow` stays unexported. Each graph is a trigger plus an `if` plus an `exit`. The If uses the legacy pick: `pickTable` `"consent_records"`, `pickField` the column, `pickOp` `"eq"` or `"exists"`, `pickValue` the passing text when the op is `eq`. Boolean columns compare as `"true"` and `"false"`. `configured` is not `false`. `contactIds` on a field walk is a one-element list, so a set change is visible. Trigger `payload.writes` is the one pointer the case states. The If detail is `branch → true` or `branch → false`. A detail that starts with `if pick ` means `consent_records` was added to `PERSON_WRITE_TABLES`, and that case fails.

The walk does not store `triggerPayload`. `contactId`, `source`, and `anyPass` are not on `node_status`. The row, the matching local-ref listener, and the shape guard prove the payload. A listener whose `local_contact_ids` is this contact matches from `payload.contactId` or from the `contactIds` argument, so that listener alone does not prove the payload key. The object literal is the proof the forbidden keys are absent. `anyPass` is not on `node_status`. The shape guard is the proof the caller payload does not set it, and this packet does not require `anyPass` to remain inside `dispatchEventToWorkflows`.

1. Before `handleConsentSilence`, a load walk for the first firm, pointer `{ table: "consent_records", id: <silence contact>, contact_id: <silence contact> }`, `contactIds` that one contact, `pickField` `"basis"`, `pickOp` `"exists"`. The detail is `branch → false`. The other firm’s row for the same contact must not satisfy this walk. A loader that omits `firm_id` returns that row and takes `true`.
2. `handleConsentSilence` for the silence contact, the first firm, source `"unsubscribe.email"`. The HTTP body is `{ ok: true }`. One `consent_records` row at that pair has `basis` `none`, `silenced` true, `source` `"unsubscribe.email"`, `status` `unsequenced`, and `workspace_opted_out` false. The other firm’s row is unchanged. Event runs exist for the global listener, the unset-`localRef` listener, the listener whose `localRef` is this contact, the listener whose `local_firm_id` is this firm, and the listener whose `local_contact_ids` is this contact. No event run exists for `other-axis`, for the other firm, or for a contact list that does not include this contact. Each matching event run’s trigger `writes` has length 1. `writes[0].table` is `consent_records`. `writes[0].id` and `writes[0].contact_id` are both the silence contact. No element has `firm_id`. No element has table `contact_records`. `counts.contacts` is 1 on each of those runs. The firm has more than one contact, so a book fill in place of the caller list would have stored more than 1.
3. `writesFromPayload` of `{ writes: [that pointer], contactId: the contact, source: "unsubscribe.email", contactIds: [the contact] }` returns that one pointer and does not add `contact_records`. `writesFromPayload` of `{ contactId: the contact, source: "unsubscribe.email" }` with no `writes` array returns no `consent_records` pointer and no `contact_records` pointer.
4. Load walks of the inserted pair, `contactIds` `[the silence contact]`. A pointer whose `id` is `"not-a-column"` and whose `contact_id` is the silence contact, `pickField` `"source"`, `pickValue` `"unsubscribe.email"`, is `branch → true`. A pointer whose `id` is the silence contact and whose `contact_id` is `""` or absent, `pickOp` `"exists"`, is `branch → false`. A walk whose `firmId` is the other firm and whose `contact_id` is the silence contact, `pickField` `"basis"`, `pickValue` `"express"`, is `branch → true`. Walks of the first firm and the real pointer are `branch → true` for `basis` eq `"none"`, `silenced` eq `"true"`, `source` eq `"unsubscribe.email"`, `status` eq `"unsequenced"`, `workspace_opted_out` eq `"false"`, and `updated_at` op `"exists"`.
5. Insert a silenced decoy for the decoy contact at the first firm with `source` `"decoy"` and `updated_at` later than the silence row. A load of the silence contact’s `source` is still `branch → true` for `"unsubscribe.email"`. A loader that took the newest silenced row for the firm fails this walk.
6. `UPDATE` the silence pair’s `source` to `"later-source"` and `basis` to `"implied"`. The same pointer, `pickField` `"source"`, `pickValue` `"later-source"`, is `branch → true`, and `basis` eq `"implied"` is `branch → true`. The case-2 run’s stored `writes[0].id` is still the silence contact. A loader that had copied the columns onto the dispatch at fire time fails this walk.
7. Pre-insert the conflict contact at the first firm: `basis` `express`, `silenced` false, `source` `"prior-source"`, `status` `sequenced`, `workspace_opted_out` true. `handleConsentSilence` for that contact, source `"this-call"`. The row’s `silenced` is true, `source` is `"this-call"`, `basis` is `express`, `status` is `sequenced`, and `workspace_opted_out` is true. The HTTP body is `{ ok: true }`. New matching runs have `writes[0].id` and `writes[0].contact_id` equal to the conflict contact. The case-2 runs still point at the silence contact. Load walks of the conflict pointer are `branch → true` for those five column values.
8. `handleConsentSet` for the set contact, `basis` `"implied"`, `source` `"set-source"`. No new `event:consent_records.opt_out` run exists. The row’s `basis` is `implied`, `silenced` is false, `source` is `"set-source"`, `status` is `unsequenced`, and `workspace_opted_out` is false. A second call that omits `source` and sends `basis` `"express"` leaves `source` `"set-source"`, sets `basis` `express`, and leaves `silenced` false. Still no opt-out run.
9. Insert `contact_access_links` for the agree contact and the ignore contact. `token_hash` is `sha256` of the raw token from `server/auth-service/crypto.ts`. `expires_at` and `invalidated_at` are null. `handleContactSeatConsent` with `req.param("token")` and `{ action: "agree" }` stores `basis` `express`, `silenced` false, `source` `contact_workspace`. `{ action: "ignore" }` on the other token stores `basis` `none`, `silenced` false, `source` `ignored`. Neither call adds an opt-out run.
10. Insert a link for the seat-silence contact. `handleContactSeatSilence` stores `workspace_opted_out` true, `silenced` false, `basis` `none`, and `source` `contact_workspace.workspace_opt_out`. The response `refuse` is `workspace_opted_out`. No opt-out run exists for that call. A second link, for the silence contact after case 2, calls `handleContactSeatSilence` again. `silenced` stays true, `workspace_opted_out` becomes true, and the number of opt-out runs for that contact’s listeners does not grow.
11. Insert `outbound_messages` for the bounce contact (`channel` `email`, `purpose` `cem`, `to_addr` a fixture address, `provider_message_id` a fresh id, `enrollment_id` null) and a prior `consent_records` row for that pair with `basis` `express`, `silenced` false, `source` `"prior-bounce"`, `status` `waitlisted`. `handleResendWebhook` for `email.bounced` sets `silenced` true and `source` `hard-bounce`, and leaves `basis` `express`, `status` `waitlisted`, and `workspace_opted_out` false. No opt-out run exists.
12. `standInConsentSilence.silence` of a contact id that has no `consent_records` row, then `get`, returns `silenced` true. No `consent_records` row and no opt-out run appear for that id.
13. A direct walk omits `contactIds`. `payload.writes` is one pointer whose `table` is `consent_records`, whose `id` is the silence contact, and whose `contact_id` is the silence contact. `counts.contacts` is 1. A second direct walk omits `contactIds` and sends `contact_id` null with `id` the silence contact. `counts.contacts` is 0. A count of 1 on the second walk means the contact id was published from set membership.

`npm run factory:check` reads the dispatch in `handleConsentSilence` and fails unless that payload object contains `contactId: body.contactId`, `source: body.source`, and a `writes` element whose `table` is `"consent_records"`, whose `id` is `body.contactId`, and whose `contact_id` is `body.contactId`. It fails unless `contactIds: [body.contactId]` and `firmId: body.firmId` and `eventName: "consent_records.opt_out"` are the dispatch arguments. It fails if that payload object contains `basis`, `status`, `firmId`, `firm_id`, `contact_id`, `contactIds`, `contact_name`, `firm`, or `anyPass`. It fails if that `writes` element contains `firm_id`. It fails unless the call stays `await dispatchEventToWorkflows(getPool(), …)`, stays one call, and is not inside `try`. It fails if `handleConsentSilence` contains `BEGIN`, `COMMIT`, or `RETURNING`. It fails unless the insert is still `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, source, updated_at)` with values `'none', true` and the conflict clause `SET silenced = true, source = EXCLUDED.source, updated_at = now()`. It fails if that conflict clause contains `basis` or `status` or `workspace_opted_out`. It reads `writesFromPayload` and fails if that function contains a `consent_records` table literal. It reads `loadWriteRow` and fails unless it contains `SELECT * FROM consent_records WHERE contact_id=$1 AND firm_id=$2` bound to `w.contact_id` and `firmId`, ignoring whitespace, and fails if that statement contains `ORDER BY`, `LIMIT`, `silenced`, or `w.id`. It fails unless a non-string or empty `w.contact_id` returns null on that branch before the query. It fails unless the function still ends at `return null`. It reads the `PERSON_WRITE_TABLES` initializer and fails if that initializer contains `consent_records`. It reads `localRefFromPayload` and `triggerLocalRefFromPayload` and fails unless each `consent_records.opt_out` arm still returns `payloadString(payload, ["contact_id", "contactId"])`. It reads `eventTest.ts` and fails unless the `consent_records.opt_out` door is `SELECT * FROM consent_records WHERE firm_id=$1 AND silenced=true ORDER BY updated_at DESC LIMIT 10`. It reads the `WORKFLOW_EVENTS_WITH_LOCAL` initializer and fails if it contains `consent_records.opt_out`. It reads `handleConsentSet` and fails if it contains `dispatchEventToWorkflows`, and fails unless its conflict clause still assigns `basis` and `COALESCE(EXCLUDED.source, consent_records.source)` and does not assign `silenced`. It reads `handleContactSeatConsent` and `handleContactSeatSilence` and fails if either contains `dispatchEventToWorkflows`. It fails unless the seat-consent conflict assigns `silenced = false`, and unless the seat-silence conflict assigns `workspace_opted_out` and does not assign `silenced`. It reads `webhooks.ts` and fails if the file contains `dispatchEventToWorkflows`, and fails unless the hard-bounce statement still sets `source` `'hard-bounce'` and `silenced` true. It reads `standInConsentSilence` and fails if that function contains `dispatchEventToWorkflows`. It reads `realConsentSilence.silence` and fails unless the posted path is `/consent/silence` and the body is `contactId`, `firmId`, and `source`. It reads the contact query in `consentAndHaltGate` and in `handleConsentGet` and fails if either predicate contains `firm_id`. It does not assert on `anyPass` inside `dispatchEventToWorkflows`. It does not require or forbid the book-fill query. It reads `.github/workflows/ship.yml` and fails unless it invokes `scripts/verify-consent-opt-out-writes.ts`. Add `server/wire-service/stores.ts`, `server/wire-service/workflowWalk.ts`, `server/wire-service/runWrites.ts`, `server/wire-service/eventTest.ts`, `server/wire-service/dispatchSend.ts`, `src/app/data/automationTriggerSelect.ts`, `src/app/data/automationWorkflows.ts`, `src/app/wire/standins/consentSilence.ts`, `src/app/wire/reals/consentSilence.ts`, `scripts/verify-consent-opt-out-writes.ts`, and `.github/workflows/ship.yml` to the path filter in `.github/workflows/factory-check.yml` if they are not already listed. `server/wire-service/contactSeat.ts` and `server/wire-service/webhooks.ts` are already listed.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

Door 1’s newest ten, beyond the shape guard that keeps the current statement. The `event_test_data` specimen, including `contact_name` and `firm`, and `writeId`’s use of `contact_id` when `id` is absent. Adding an `id` column or a decision-history table. Adding `consent_records` to `PERSON_WRITE_TABLES`. Teaching `writesFromPayload` to map `contactId` or `source` onto this table, and teaching it to keep an empty-string `id`. Encoding the pair into one string. Putting `firm_id` on the pointer. Stripping `anyPass` (PKT-004). Dispatching `handleConsentSet`, the seat writers, or the hard bounce. Retuning `status` on the silence statement (claim 25). The seat-consent conflict when `status` is `silenced` (claim 26). A `consent_records.sequenced` firing (claim 27). Adding `firm_id` to `consentAndHaltGate` or to `handleConsentGet`. The seat projection and the silence leaf, which read the current row and do not need this listening run. `TRIGGER_SELECT_EVENTS` and `WORKFLOW_EVENT_CATALOG`, which already name this event. Launch Agent. Claim 16. No plate.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `consent_records.opt_out` dispatch payload | Gains one `writes` pointer. `contactId` and `source` stay. `id` and `contact_id` are both `body.contactId` | `dispatchEventToWorkflows`, `writesFromPayload`, `localAxesMatch`, trigger `node_status.writes` | Modified |
| `consent_records` silence statement | Same upsert. Conflict still assigns `silenced`, `source`, and `updated_at` only. No `RETURNING` | Insert, later `loadWriteRow` | Only verified |
| `consent_records` row on insert | `basis` `none`, `silenced` true, `source` the body, `status` `unsequenced`, `workspace_opted_out` false | Field reads after this firing | Only verified |
| `consent_records` row on conflict | `silenced` true, `source` this call. `basis`, `status`, and `workspace_opted_out` stay | Field reads after a second silence | Only verified |
| `loadWriteRow` | One branch, `WHERE contact_id=$1 AND firm_id=$2` bound to `w.contact_id` and the walk firm. Other branches stay | If field reads of this table | Modified |
| `PERSON_WRITE_TABLES` | Unchanged. `consent_records` stays out | `personTableOf`, `evalIfPick`, `personIdsFromWrites` | Only verified |
| `personIdsFromWrites` | Unchanged. This pointer’s `contact_id` is the person. `id` is not, for this table | Trigger contact list when the caller list is empty | Only verified |
| `writesFromPayload` | Unchanged. `payload.writes` is the handle. No `contactId` or `source` reader | Every trigger, including this event | Only verified |
| `RunWrite` | Unchanged. No `firm_id` field | This pointer’s `id` and `contact_id` | Only verified |
| `localRefFromPayload`, `triggerLocalRefFromPayload`, `localAxesMatch` | Unchanged. This event still returns `contact_id` or `contactId`. Firm compare still falls back to `opts.firmId` | Local `consent_records.opt_out` listeners | Only verified |
| `dispatchEventToWorkflows` | Unchanged. Still copies the payload and sets `eventName` and `anyPass`. The book fill stays | This event’s listeners | Only verified |
| `event_write_set` `consent_records.opt_out` v1 | Already ord 0 for this table. Not read at fire time | Live payload literal | Only verified |
| `eventTest.ts` door 1 | Still the newest ten silenced rows for the firm | Test door | Only verified |
| `WORKFLOW_EVENTS_WITH_LOCAL` | Unchanged. `consent_records.opt_out` stays out. `consent_records.sequenced` stays in | Local-axis catalog | Only verified |
| `POST /consent/silence` | Same handler. The response stays `{ ok: true }` | `realConsentSilence.silence` | Modified |
| `POST /consent`, seat consent, seat silence, hard bounce | Same statements. None of them dispatch this event | Basis writes, workspace opt-out, bounce | Only verified |
| `standInConsentSilence` | Unchanged. In-memory silence. No dispatch | Stand-in desk | Only verified |
| `consentAndHaltGate`, `handleConsentGet` | Unchanged. Contact-only `LIMIT 1` | Send gate, consent Get | Only verified |
| `scripts/verify-consent-opt-out-writes.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases and the shape guard | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| The silence dispatch omits `writes`, so `writesFromPayload` returns no pointer. The upsert has no `RETURNING` and the table has no `id` column. `writes[0].id` and `writes[0].contact_id` are both `body.contactId`, the person half of the primary key the statement already bound. The firm half is `body.firmId` on the dispatch argument, which the walk passes into `loadWriteRow`. `RunWrite` has no `firm_id` field. A second id, or a pair encoded into one string, would not be the key the load uses. | necessary |
| `writesFromPayload` returns the array and then stops. It does not read `contactId` or `source`. A reader for either would invent a `consent_records` pointer when `writes` is absent, which case 3 forbids. The payload must not gain `contactIds`, or a missing `writes` array would publish `contact_records`. `contactIds` stays the dispatch argument `[body.contactId]`. The existing `!id` drop also rejects `""`. This firing uses a non-empty contact id. This packet does not retune that drop. | necessary |
| `loadWriteRow` returns null for `consent_records`. The primary key is `(contact_id, firm_id)`. The load binds `w.contact_id` and the function’s `firmId`. `w.id` is the same contact on this firing and is not the predicate. The local `contactId = w.contact_id ?? w.id` stays for `sequence_ready` and `reachability_verdicts`. Using it here would select by `w.id` when `contact_id` is absent, which case 4 forbids. An empty `contact_id` returns null before the query. No `ORDER BY` and no `LIMIT`: the pair is unique, and door 1’s newest-ten is a different read. Case 5 is that difference. Case 1 is the firm predicate: the other firm’s row exists first, and the first firm’s walk misses. Case 6 is the re-read. `basis`, `silenced`, `source`, `status`, and `workspace_opted_out` stay columns. Other branches in the function stay, including any PKT-006, PKT-009, PKT-010, or PKT-011 branch already present. Those packets do not add this branch. The function stays unexported unless an earlier packet exported it. | necessary |
| `PERSON_WRITE_TABLES` omits `consent_records`. `personIdsFromWrites` then uses `contact_id` and does not publish `id` for this table. `evalIfPick` person-splits only when the set contains the table and `ctx.contactIds` is non-empty, so the field walks pass a one-element `contactIds` and expect `branch →`. An empty list would hide the set change. Case 13 is the empty caller list: `counts.contacts` 1 when `contact_id` is set, and 0 when only `id` is set. Adding the name would fail both the detail and the second count. This packet does not add the name. | necessary |
| `localRefFromPayload` and `triggerLocalRefFromPayload` already return `contact_id` or `contactId` for this event. The payload keeps `contactId` and does not gain `contact_id`. A listener whose `localRef` is this contact runs, which fails if the arm is removed, because null does not equal the contact id. An unset `localRef` still matches. `other-axis` does not match. The firm compare falls back to `opts.firmId` because the payload has no firm key. A listener for this firm matches, and a listener for the other firm does not. That pair does not prove the key is absent. The shape guard proves the key is absent. `counts.contacts` 1 on a firm with more than one contact proves the caller list was that one contact and was not replaced by the book. | necessary |
| The upsert completes before the await. There is no transaction and no `try/catch`. A dispatch error leaves the row and does not return `{ ok: true }`. Wrapping the await, or rolling the row back, would change that. The columns a later node reads are not copied onto the payload. | necessary |
| The walk stores `writes` and does not store `triggerPayload`. `contactId`, `source`, and `anyPass` are not on `node_status`. The row and the matching local-ref listener prove the contact string is the value the ref reader sees. The object literal proves which keys are present. `comparePasses` stringifies booleans, so `silenced` and `workspace_opted_out` compare as `"true"` and `"false"`. `updated_at` is proved with `exists`, not a literal timestamp. | necessary |
| `walkValidatedWorkflow` updates `workflow_run` and does not insert it. `dispatchEventToWorkflows` inserts before the walk. A direct load walk that skips the insert updates zero rows, and the case cannot read `node_status`. The script inserts the run first. `counts.contacts` is the stored length, not the id list. | necessary |
| Door 1 selects the newest ten silenced `consent_records` rows for the firm. A decoy with a later `updated_at` is how case 5 shows the handle is the pointer pair. The door stays. `event_write_set` version 1 already names this table at ord 0. The payload is a literal. It does not read that registry. The specimen keys `contact_name` and `firm` stay on `event_test_data`. The live insert does not copy them. `writeId` uses `contact_id` when `body.id` is absent. The live pointer does not call `writeId`. The specimen is not a second element of this firing’s array. | adjacent |
| PKT-004’s change specification says the current `consent_records.opt_out` caller payload is unchanged apart from the forced `anyPass` copy, and its shape guard fails if `dispatchEventToWorkflows` still contains `anyPass`. This packet adds `writes` to that caller and does not edit `dispatchEventToWorkflows`. Implementing PKT-004 must not delete `writes`. This packet’s shape guard does not require `anyPass` to remain on the walked copy, so the two guards do not deadlock. Acceptance that the walked trigger still receives `anyPass` holds because this packet does not edit that function. This packet does not edit `SCP-pkt-004-firing-handle.md`. | adjacent |
| PKT-006, PKT-009, PKT-010, and PKT-011 add other `loadWriteRow` branches and do not add this one. If those branches are already present, leave them. This packet does not edit their change specifications. Claim 10’s `WHERE id = pointer.id` does not apply to a table with no `id` column. | adjacent |
| Claim 25 specifies a status write on the silence statement. The live insert leaves `status` at the column default `unsequenced`. The `UPDATE` in `004_machine_tables.sql` ran against rows that already existed at migrate time. Setting `status` to `silenced` on this insert would retune the statement. Claim 26 specifies the seat-consent conflict when `status` is `silenced`. Claim 27 specifies the absent `consent_records.sequenced` firing. `WORKFLOW_EVENTS_WITH_LOCAL` already contains that name and still omits `consent_records.opt_out`. Those revisions leave this pointer as it is. This packet does not implement them. | adjacent |
| `consentAndHaltGate` and `handleConsentGet` select by `contact_id` alone with `LIMIT 1`. A row for the same contact at another firm can be the row they return. The packet leaves that predicate. The shape guard locks the current SQL, which has no `firm_id`. This packet does not add a send behavior test. The seat projection and `isWorkspaceOut` already read the pair. They do not need this listening run. | adjacent |
| The stand-in `silence` does not insert `consent_records` and does not dispatch. `realConsentSilence.silence` posts the three body fields and does not build `writes`. The server handler is the firing. `TRIGGER_SELECT_EVENTS` already lists `consent_records.opt_out` with firm and contact layers. This packet does not edit that list. | adjacent |
| The packet file still says `**Release:** draft`. The ledger stage for this revision was `released` when this wake was authorized, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
