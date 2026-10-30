# SCP-pkt-014 — A firing with no contact ids walks that automation’s audience inside the firing firm

**Packet:** PKT-014 `pkt-014-empty-firing-audience`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 17, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`. The revision under claim 18 leaves this audience branch unchanged.  
**Contract:** `docs/factory/components/firing-pointers/CONTRACT.md` — claim 17 is outside that contract. The audience list is not a write and does not add a person to the `ct_firms` pointer. `docs/factory/components/walk-handle/CONTRACT.md` — the run’s handle stays the firing’s pointers. This packet does not add a load and does not add `contact_records` beside those pointers.

## Intent

`dispatchEventToWorkflows` still matches triggers before it builds a person list. `localAxesMatch` still reads the firing’s own `contactIds` and `payload.contactId`. It does not read the list this branch is about to build. A trigger with `local_contact_ids` set does not match a firing that named no person. That workflow does not start, and it does not receive the audience.

For a workflow that matched, `audience_scope` still comes from `workflow`. `select_from` is still the only scope that narrows. Null and every other value stay `every_firm`. The dispatcher still does not read `workflow_trigger.scope` or `scope_contact_ids`. `materializeTriggersFromGraph` still stores `scope` `every_firm` and an empty `scope_contact_ids`.

No contact ids means the argument was omitted or the array is empty. `!contactIds?.length` is that test. `handleMachineProvision` omits the argument. `runContactEligibilityCascade` passes `opts.contactIds`, which is empty when the loop inserted nothing. `handleHaltCommit` omits it when a contact-scope body has no `contactId`. One branch covers all three. The branch does not read `opts.eventName`.

When the firing passed no contact ids:

- `select_from`. The people are the stored `audience_contact_ids` that are `contact_records` rows with `firm_id` equal to `opts.firmId`. The statement is `SELECT id FROM contact_records WHERE firm_id=$1 AND id = ANY($2::text[])`, bound to `opts.firmId` and that stored array. An id from another firm, and an id with no `contact_records` row, are not in the result. `contact_records.id` is the primary key, so an id listed twice in the array is one row. The statement has no `ORDER BY`. When the result is empty, including when the stored array is empty, the workflow does not start. There is no `workflow_run`. The `continue` stays before the run insert.
- `every_firm`. The people are every `contact_records.id` with `firm_id` equal to that same firing firm. The statement stays `SELECT id FROM contact_records WHERE firm_id=$1`. It has no `ORDER BY` and no `ANY`. This packet does not add either. An empty book is an empty list, and the run still starts. This arm does not `continue` on an empty result.

When the firing passed a non-empty list, both arms stay as they are. `every_firm` walks that list and does not query the book. `select_from` walks the intersection with `audience_contact_ids` and does not start when the intersection is empty. This packet does not add a firm predicate to that arm. The intersection stays `contactIds.filter((id) => audience.includes(id))`.

The list is the `contactIds` argument of `walkValidatedWorkflow`. A non-empty list becomes `ctx.contactIds` and is not replaced by `personIdsFromWrites`. It is not copied onto `triggerPayload`. It is not an element of `payload.writes`. The branch does not assign `opts.payload` and does not push onto `payload.writes`. `writesFromPayload` does not read the walk argument. With a `writes` array present, its contact fallback does not run. Claim 16’s `ct_firms` pointer stays one element, the firm id, with no `contact_id`. An empty eligibility `writes` stays empty. A contact-scope halt pointer stays the halt row. This packet does not add `contact_records` beside those writes.

`call_agent` still enrolls each id in `ctx.contactIds` under `opts.firmId` and still passes `fireFirstStep: true`. `ascribe_tag`, when it has no chip and no `pickTable`, still tags that same list. `contactsForAudit` still uses `ctx.contactIds` when the list is non-empty, and its query still requires the walk’s `firm_id`. `evalIfPick` is not edited. A firm-row If still takes one branch, because `ct_firms` is not in `PERSON_WRITE_TABLES`, and leaves `ctx.contactIds` as it was. The detail stays `branch → true` or `branch → false`.

`handleWorkflowCreate` still stores `audience_scope` and `audience_contact_ids` as given. This packet does not change that save. `handleSequenceEnrollContacts` still selects every `contact_records` row with no firm predicate and still enrolls each under `row.firm_id`. The in-memory fan-out in `src/app/wire/standins/machineApi.ts` still does not run the book query. For `select_from` it still uses the stored ids, unfiltered, and skips when that array is empty. For `every_firm` it still starts a run and does not pass a person list. `isHaltBlockingNew` is not edited. Claim 18 owns the contact arm’s firm predicate.

A later provision of the same firm id still dispatches. This branch runs again, on the contacts that firm has then. The audience rule does not distinguish the insert from the conflict.

## Must / must-not

- Replace the empty `select_from` arm. Keep the scope test, the non-empty intersection, the empty-list `continue` before the run insert, and the `every_firm` book query. `contactIds` stays a local. Do not write it back onto `opts`. Do not read `opts.eventName` in this block.

```ts
let contactIds = opts.contactIds;
const scope = row.audience_scope === "select_from" ? "select_from" : "every_firm";
if (scope === "select_from") {
  const audience = row.audience_contact_ids ?? [];
  if (contactIds?.length) {
    contactIds = contactIds.filter((id) => audience.includes(id));
  } else {
    const matched = await pool.query<{ id: string }>(
      `SELECT id FROM contact_records WHERE firm_id=$1 AND id = ANY($2::text[])`,
      [opts.firmId, audience],
    );
    contactIds = matched.rows.map((r) => r.id);
  }
  if (!contactIds.length) continue;
} else if (!contactIds?.length) {
  const book = await pool.query<{ id: string }>(
    `SELECT id FROM contact_records WHERE firm_id=$1`,
    [opts.firmId],
  );
  contactIds = book.rows.map((r) => r.id);
}
```

- The `select_from` statement binds `opts.firmId` and the stored audience. It does not bind `opts.eventName`. No `ORDER BY`, no `LIMIT`, no `DISTINCT`. Do not keep `(contactIds?.length ? contactIds : audience)` inside `dispatchEventToWorkflows`. That ternary is the unfiltered empty path.
- The `every_firm` statement stays `SELECT id FROM contact_records WHERE firm_id=$1` bound to `[opts.firmId]`. No `ANY`. No `ORDER BY`. An empty `book.rows` still falls through to the run insert. Do not `continue` on that arm.
- `localAxesMatch` stays before this block. The call still passes `contactIds: opts.contactIds`. Do not pass the filled list. Do not query `contact_records` inside `localAxesMatch`.
- The run insert stays after the block. The walk argument stays `contactIds`. The trigger payload stays a spread of `opts.payload` plus `eventName`. Do not set `contactIds` on that object. Do not assign `opts.payload`. This packet does not add or remove `anyPass` on that object.
- Do not edit `writesFromPayload`, `personIdsFromWrites`, `PERSON_WRITE_TABLES`, `evalIfPick`, `loadWriteRow`, `contactsForAudit`, or the `call_agent` enroll call. `fireFirstStep` stays `true`. `firmId` stays `opts.firmId`.
- Do not edit the empty-list fallback inside `walkValidatedWorkflow`:

```ts
let contactIds = opts.contactIds ?? [];
const triggerWrites = writesFromPayload(opts.triggerPayload);
if (!contactIds.length) {
  contactIds = personIdsFromWrites(triggerWrites);
}
```

- Do not edit `handleMachineProvision`, `runContactEligibilityCascade`, or `handleHaltCommit`. The first call still omits `contactIds`. The second still passes `contactIds: opts.contactIds`. The third still passes `contactIds: body.contactId ? [body.contactId] : undefined` and still dispatches only when `body.scope === "contact"`.
- Do not edit `handleWorkflowCreate`. The insert and the conflict update still store `audience_scope` and `audience_contact_ids` from the body.
- Do not edit `materializeTriggersFromGraph`. The insert values still include `'every_firm',ARRAY[]::text[]` for `scope` and `scope_contact_ids`.
- Do not edit `handleSequenceEnrollContacts`. The every-firm door stays `SELECT id, firm_id FROM contact_records` with no firm predicate.
- Do not edit the stand-in fan-out. The `select_from` expression stays `input.contactIds?.length ? input.contactIds.filter((id) => audience.includes(id)) : audience`. The `startRun` call stays `startRun(w.id, \`event:${input.eventName}\`)` with no person list. That file must not gain a `contact_records` query.
- Do not edit `isHaltBlockingNew` or `dispatchScheduleTriggers`. Do not add a migration.

## Stores and contracts

`workflow.audience_scope` is `TEXT NOT NULL` and defaults to `every_firm`. `workflow.audience_contact_ids` is `TEXT[] NOT NULL` and defaults to an empty array. The check allows only `every_firm` and `select_from`. The dispatcher reads these columns. A null `audience_scope` cannot be stored. The runtime still treats any value other than `select_from` as `every_firm`.

```55:67:supabase/migrations/012_grain_audience_one_timer.sql
ALTER TABLE workflow
  ADD COLUMN IF NOT EXISTS audience_scope TEXT NOT NULL DEFAULT 'every_firm',
  ADD COLUMN IF NOT EXISTS audience_contact_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'workflow_audience_scope_check'
  ) THEN
    ALTER TABLE workflow
      ADD CONSTRAINT workflow_audience_scope_check
      CHECK (audience_scope IN ('every_firm', 'select_from'));
  END IF;
END $$;
```

`workflow_trigger.scope` and `workflow_trigger.scope_contact_ids` are a different pair. `materializeTriggersFromGraph` writes `every_firm` and an empty array. The dispatcher’s select list does not read them.

```273:275:supabase/migrations/010_sequence_campaign_housing.sql
ALTER TABLE workflow_trigger ADD COLUMN IF NOT EXISTS grain TEXT NOT NULL DEFAULT 'global';
ALTER TABLE workflow_trigger ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'every_firm';
ALTER TABLE workflow_trigger ADD COLUMN IF NOT EXISTS scope_contact_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
```

`contact_records.id` is `TEXT` and is the primary key. `firm_id` is `TEXT NOT NULL`. There is no uniqueness on `(firm_id, id)` beyond the primary key. The new predicate is `firm_id` plus `id = ANY`.

```233:243:supabase/migrations/004_machine_tables.sql
CREATE TABLE IF NOT EXISTS contact_records (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  name TEXT,
  body JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_records_firm_idx ON contact_records (firm_id);
```

`workflow_run` is inserted by the dispatcher before the walk and updated by the walk. `counts` is JSON. `counts.contacts` is `ctx.contactIds.length` on a finished run. The person ids are not a column. `node_status` stores each node’s `writes`.

```45:56:supabase/migrations/004_machine_tables.sql
CREATE TABLE IF NOT EXISTS workflow_run (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
  firm_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'success', 'failed', 'stopped')),
  trigger_label TEXT,
  node_status JSONB NOT NULL DEFAULT '{}'::jsonb,
  counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
```

`contact_tag.contact_id` is `TEXT NOT NULL` and has no foreign key to `contact_records`. An `ascribe_tag` with no chip and no `pickTable` inserts one row per id in `ctx.contactIds`. That insert is how the verify reads the person list. It is not a new store.

```69:76:supabase/migrations/010_sequence_campaign_housing.sql
CREATE TABLE IF NOT EXISTS contact_tag (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  source_workflow_id TEXT REFERENCES workflow(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`workflow_trigger_local_ref` was dropped. A local row may store a null `local_ref` while `local_contact_ids` is set. The axis match does not require `local_ref`.

```4:5:supabase/migrations/016_trigger_local_cascade.sql
ALTER TABLE workflow_trigger
  DROP CONSTRAINT IF EXISTS workflow_trigger_local_ref;
```

The firing-pointers contract names this packet as the empty-contact audience and says it does not add a person to the `ct_firms` pointer. The walk-handle contract loads pointers. Those sentences are the contracts. This packet does not edit either file.

`RunWrite` is the pointer shape. This packet does not add a field and does not put the audience on an element.

```1:6:server/wire-service/runWrites.ts
/** This run’s writes — the next node’s input. Not an events table. */
export type RunWrite = {
  table: string;
  id: string;
  contact_id?: string | null;
};
```

## Runtime

The live branch fills `every_firm` from the firing firm and leaves `select_from` unfiltered when the firing passed no ids. The run insert is after that block. The change is the `select_from` arm only.

```1950:1976:server/wire-service/workflowWalk.ts
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

The trigger query reads the audience from `workflow`, not from `workflow_trigger.scope`.

```1922:1936:server/wire-service/workflowWalk.ts
  }>(
    `SELECT DISTINCT ON (t.workflow_id)
            t.workflow_id, t.grain, t.local_ref, t.local_firm_id, t.local_contact_ids,
            w.audience_scope, w.audience_contact_ids
     FROM workflow_trigger t
     JOIN workflow_state s ON s.workflow_id = t.workflow_id
     JOIN workflow w ON w.id = t.workflow_id
     WHERE (t.firm_id=$1 OR t.firm_id IS NULL)
       AND t.enabled=true
       AND t.type='event'
       AND t.event_name=$2
       AND s.status='active'
     ORDER BY t.workflow_id, t.updated_at DESC`,
    [opts.firmId, opts.eventName],
  );
```

`localAxesMatch` compares `local_contact_ids` to the payload contact key, then to `opts.contactIds`. It runs before the audience block. A firing that omitted `contactIds` and has no contact key does not satisfy a non-empty axis. The book that the branch is about to read is not an argument of this function.

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

The walk copies the argument, then replaces an empty list from the trigger writes. A non-empty audience list skips that replacement. An empty list does not. `ct_firms` is not in `PERSON_WRITE_TABLES`. A pointer with no `contact_id` contributes no person. An empty `writes` array contributes no person.

```1091:1110:server/wire-service/workflowWalk.ts
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

The trigger node stores `ctx.previousWrites`. That is the handle. The audience list is not those writes. A finished run stores `counts.contacts` from `ctx.contactIds.length`. The ids themselves are not in `counts`.

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

```1676:1680:server/wire-service/workflowWalk.ts
      JSON.stringify({
        nodes: Object.keys(nodeStatus).length,
        enrollments: enrollments.length,
        contacts: ctx.contactIds.length,
      }),
```

`writesFromPayload` returns when `payload.writes` is an array and then does not read `contactIds`. The audience list is a walk argument, not a payload key, so this function does not see it. The contact fallback runs only when `writes` is absent.

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

`ascribe_tag` with no chip and no `pickTable` tags `ctx.contactIds`. `uniqueIds` drops an empty string and collapses a repeated id. The firm-scoped query already returns one row per id. The action node’s `writes` carry `contact_id`. That is the person list the verify reads. A duration wait is the wrong probe: `waitPeople` on an empty `ctx.contactIds` returns `personIdsFromWrites(ctx.previousWrites)`, and a parked run stores `counts.contacts` from the parked list.

```1404:1416:server/wire-service/workflowWalk.ts
        if (actionType === "ascribe_tag") {
          const tag = String(data.tag ?? data.actionSummary ?? data.label ?? "tagged");
          const notesFromVerdict = data.notesFromVerdict === true;
          const fromContact = mappedSlotWrites(data, ctx, "contact");
          const chipPeople = fromContact ? personIdsFromWrites(fromContact) : [];
          const pickTable = String(data.pickTable ?? "").trim();
          const picked = pickWrites(ctx.previousWrites, pickTable || undefined);
          const contactIds = uniqueIds(
            (pickTable
              ? picked.map((w) => w.contact_id ?? (PERSON_WRITE_TABLES.has(w.table) ? w.id : null))
              : ctx.contactIds) as Array<string | null>,
          );
          const ids = chipPeople.length ? chipPeople : contactIds.length ? contactIds : ctx.contactIds;
```

```247:251:server/wire-service/workflowWalk.ts
function waitPeople(data: Record<string, unknown>, ctx: WalkContext): string[] {
  const mapped = mappedWrites(data, ctx);
  if (mapped) return personIdsFromWrites(mapped);
  if (ctx.contactIds.length) return uniqueIds(ctx.contactIds);
  return personIdsFromWrites(ctx.previousWrites);
}
```

`call_agent` enrolls `ctx.contactIds` and passes `fireFirstStep: true`. The verify does not take this path. `enrollAndActuate` sends when `fireFirstStep` is not false.

```1355:1371:server/wire-service/workflowWalk.ts
          for (const contactId of ctx.contactIds) {
            const result = await enrollAndActuate({
              firmId: opts.firmId,
              contactId,
              agentRef,
              sequenceId: agentRef,
              workflowRunId: opts.runId,
              purpose: sequenceClassForAgent(agentRef) === "optin" ? "opt-in" : "cem",
              payload: {
                workflowId: opts.workflowId,
                runId: opts.runId,
                constants: ctx.constants,
                trigger: opts.triggerPayload,
                dryRunBinding: true,
              },
              fireFirstStep: true,
            });
```

`contactsForAudit` prefers `ctx.contactIds` and still requires `firm_id`.

```740:750:server/wire-service/workflowWalk.ts
  const ids = ctx.contactIds.length ? ctx.contactIds : pickedContactIds;
  if (ids.length) {
    const { rows } = await pool.query<{
      id: string;
      email: string | null;
      phone: string | null;
      name: string | null;
    }>(
      `SELECT id, email, phone, name FROM contact_records WHERE firm_id=$1 AND id = ANY($2::text[])`,
      [ctx.firmId, ids],
    );
```

A firm-row If person-splits only when the table is in `PERSON_WRITE_TABLES`. `ct_firms` is not. The detail is `branch →` plus the branch. A detail that starts with `if pick ` means the table was added to the set. The non-split path does not replace `ctx.contactIds`.

```1173:1198:server/wire-service/workflowWalk.ts
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
        if (picked.personSplit) {
          const savedIds = ctx.contactIds;
          const savedWrites = ctx.previousWrites;
          ctx.contactIds = picked.thenIds;
          await goOn(nodeId, outgoingHandle(edges, nodeId, "true"));
          ctx.previousWrites = savedWrites;
          ctx.contactIds = picked.elseIds;
          await goOn(nodeId, outgoingHandle(edges, nodeId, "false"));
          ctx.contactIds = savedIds;
          ctx.previousWrites = savedWrites;
          return;
        }
        const handle = picked.pass ? "true" : "false";
        await goOn(nodeId, outgoingHandle(edges, nodeId, handle));
```

`materializeTriggersFromGraph` writes the trigger scope columns and does not write `workflow.audience_scope`.

```992:996:server/wire-service/workflowWalk.ts
    await pool.query(
      `INSERT INTO workflow_trigger
         (id, workflow_id, firm_id, node_id, type, event_name, condition, schedule, webhook_id,
          enabled, grain, scope, scope_contact_ids, local_ref, local_firm_id, local_contact_ids)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,true,$10,'every_firm',ARRAY[]::text[],$11,$12,$13::text[])
```

`handleWorkflowCreate` stores the operator’s audience.

```56:65:server/wire-service/machine.ts
  await pool.query(
    `INSERT INTO workflow (id, firm_id, name, target, graph, audience_scope, audience_contact_ids)
     VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7::text[])
     ON CONFLICT (id) DO UPDATE SET
       name=EXCLUDED.name,
       graph=EXCLUDED.graph,
       audience_scope=EXCLUDED.audience_scope,
       audience_contact_ids=EXCLUDED.audience_contact_ids,
       updated_at=now()`,
    [id, firm, body.name, target, JSON.stringify(body.graph ?? { nodes: [], edges: [] }), audienceScope, audienceIds],
```

`handleMachineProvision` dispatches `ct_firms` and omits `contactIds`. The live payload has no `writes` key. PKT-013’s pointer is a later plant. This call still enters the empty branch either way.

```1680:1684:server/wire-service/machine.ts
  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: firm,
    eventName: "ct_firms",
    payload: { firmId: firm, firmName, email },
  });
```

`runContactEligibilityCascade` passes the same array it looped. An empty array inserts no eligibility rows and still dispatches.

```333:338:server/wire-service/machine.ts
  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: opts.firm,
    eventName: "eligibility.changed",
    payload: { ...opts.eventPayload, anyPass: true, motion: "reactivation" },
    contactIds: opts.contactIds,
  });
```

`handleHaltCommit` passes `contactIds` only when `body.contactId` is set. A contact-scope body without that key enters the empty branch. A firm-book body does not dispatch.

```140:146:server/wire-service/stores.ts
  if (body.scope === "contact") {
    await dispatchEventToWorkflows(getPool(), {
      firmId: body.firmId,
      eventName: "halt_records",
      payload: { haltId, contactId: body.contactId ?? null },
      contactIds: body.contactId ? [body.contactId] : undefined,
    });
  }
```

The sequence enroll every-firm door has no firm predicate.

```2153:2157:server/wire-service/machine.ts
  } else {
    const all = await pool.query<{ id: string; firm_id: string }>(
      `SELECT id, firm_id FROM contact_records`,
    );
    contactRows = all.rows;
```

The stand-in decides `select_from` from the stored array and then starts a run without a person list. The computed `ids` are not an argument of `startRun`.

```1768:1775:src/app/wire/standins/machineApi.ts
      const audienceScope = w.audience_scope === "select_from" ? "select_from" : "every_firm";
      if (audienceScope === "select_from") {
        const audience = w.audience_contact_ids ?? [];
        const ids = input.contactIds?.length ? input.contactIds.filter((id) => audience.includes(id)) : audience;
        if (!ids.length) continue;
      }
      const started = await standInMachineApi.startRun(w.id, `event:${input.eventName}`);
```

`isHaltBlockingNew` is unchanged. The contact arm matches `contact_id` and does not match `firm_id`. Claim 18 owns that predicate.

```94:108:server/wire-service/dispatchSend.ts
export async function isHaltBlockingNew(
  firmId: string,
  contactId?: string,
): Promise<boolean> {
  const pool = getPool();
  const halted = await pool.query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL
       AND ((scope = 'firm-book' AND firm_id = $1)
         OR ($2::text IS NOT NULL AND scope = 'contact' AND contact_id = $2))
     LIMIT 1`,
    [firmId, contactId ?? null],
  );
  return Boolean(halted.rowCount && halted.rowCount > 0);
}
```

## Ports

No new port.

These stay on the same functions:

- `dispatchEventToWorkflows`. Same arguments. The empty `select_from` arm gains the firm-scoped id query. The `every_firm` query stays. `contactIds` passed to the walk is the list this packet names.
- `localAxesMatch`. Unchanged. It still sees the caller’s `contactIds`, before the fill.
- `walkValidatedWorkflow`. Unchanged. The dispatcher passes the filled list, including `[]` for an empty book.
- `writesFromPayload`, `personIdsFromWrites`, `evalIfPick`, `contactsForAudit`, `call_agent`. Unchanged readers and the unchanged enroll call.
- `POST /machine/provision` → `handleMachineProvision`. Same body. The dispatch still omits `contactIds`.
- `runContactEligibilityCascade`. Same arguments. `contactIds: opts.contactIds` stays.
- `handleHaltCommit`. Same body. The contact-scope dispatch still omits `contactIds` when `contactId` is absent.
- `handleWorkflowCreate`. Same audience fields.
- `materializeTriggersFromGraph`. Same `scope` and `scope_contact_ids` literals.
- `handleSequenceEnrollContacts`. Same unscoped every-firm select.
- The stand-in `dispatchEvent` fan-out. Unchanged.
- `isHaltBlockingNew`. Unchanged.
- `dispatchScheduleTriggers`. Unchanged. It does not use this branch.

```246:246:server/wire-service/routes.ts
  wire.post("/machine/provision", handleMachineProvision);
```

## Verify

`scripts/verify-empty-firing-audience.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` after migrate and seed, in the same job as `verify-click-attribution`. `npm run build` is not that proof.

The script uses `getPool()` the way `scripts/verify-click-attribution.ts` does. It exits 2 when `DATABASE_URL` is missing. It deletes `RESEND_API_KEY` and `RESEND_WEBHOOK_SECRET` for the process. It does not set send mode, does not call `tickOnce`, does not call `enrollAndActuate`, and does not put a `call_agent` node on a graph. It does not boot Vite. It does not import the stand-in.

Firm ids for the matrix are text, `firm-pkt014-` plus a run token, and a second text firm for the other book. Neither is the seeded Harbor firm. The provision case uses two uuids, because `firms.id` is `UUID` and `handleMachineProvision` casts `$1::uuid`. The script does not delete seed rows. It deletes the rows it inserts, in foreign-key order: `contact_tag`, `action`, `workflow_run`, `workflow_trigger`, `workflow_state`, `workflow_target`, `workflow`, `audit_events`, `halt_records`, `contact_records`, `ct_firms`, and, for the provision uuids, `access_links`, `users`, `campaign_states`, `firms`.

Listener graphs are a trigger node `trig`, an `ascribe_tag` node `tag`, and an `exit` node `exit`, with edges `trig` → `tag` → `exit`. `isValidatedPipeline` accepts that. Trigger `data.triggerKind` is `"event"`. `data.triggerEvent` is the case’s event name. `data.configured` is not `false`. The tag has `actionType` `"ascribe_tag"`, `tag` `"pkt014"`, no `mappedSlots`, and no `pickTable`. The script inserts `workflow` (`name` required, `target` `contact`, `graph` that listener, `audience_scope` and `audience_contact_ids` as the case states) and `workflow_state` (`active`), then calls `materializeTriggersFromGraph`. Assertions on runs use this script’s `workflow_id` values only.

The person list is the set of `contact_id` on `node_status.tag.writes`. `counts.contacts` is the length of `ctx.contactIds`. Compare sets. Do not compare order. The book query and the new audience query have no `ORDER BY`. The trigger node’s `writes` are the firing’s handle. A `contact_records` element that the caller payload did not already contain fails the case.

The If case adds an `if` node `iff` between `tag` and `exit`. The edge from `iff` to `exit` uses source handle `"true"`. If `data` uses the legacy pick: `pickTable` `"ct_firms"`, `pickField` `"name"`, `pickOp` `"exists"`. `configured` is not `false`. The tag still runs before the If, so a false branch does not hide the person list. The If detail is the proof of one branch. A person-split restores `ctx.contactIds` before the run finishes, so `counts.contacts` alone does not show the split.

1. Two direct `dispatchEventToWorkflows` calls, event `ct_firms`, `every_firm`, one book contact on the firing firm and one on the other firm. The first call omits `contactIds`. The second passes `contactIds: []`. Payload is `{ writes: [] }`. Both runs exist. Each tag set is the firing-firm contact and not the other firm’s contact. Each trigger `writes` is `[]`. `counts.contacts` is 1. A third call, event `halt_records`, omits `contactIds`, on a second `every_firm` workflow for the same firm and the same book. Its tag set equals the first run’s tag set. The branch did not read the event name.
2. `select_from` whose stored ids are the firing-firm contact, the other firm’s contact, and an id with no `contact_records` row. Omit `contactIds`, then pass `[]`, payload `{ writes: [] }`, event `ct_firms`. Both runs’ tag sets are exactly the firing-firm contact. A workflow whose stored ids are only the other firm’s contact and the missing id does not gain a `workflow_run` for either call.
3. `every_firm`, no `contact_records` for the firing firm, omit `contactIds`, payload `{ writes: [] }`. One `workflow_run` exists. The tag node’s `writes` are `[]`. `counts.contacts` is 0. The tag node’s status is `success`.
4. `every_firm`, the book has one firing-firm contact, the call passes `contactIds: [otherFirmContact]`. The tag set is that other-firm id. The book contact is absent. `select_from` stores the firing-firm contact and the other-firm contact. The call passes `contactIds: [otherFirmContact]`. The tag set is the other-firm contact. A `select_from` call that passes one firing-firm id that is not in the stored array does not insert a `workflow_run`.
5. One local workflow, `data.grain` `"local"`, `data.localContactIds` the firing-firm book contact, `data.localRef` unset, `audience_scope` `every_firm`. Omit `contactIds`. The payload has no `contactId` and no `contact_id`. No `workflow_run`. A second call passes `contactIds: [that contact]` while the book also has a second firing-firm contact. One run. The tag set is the passed contact and not the second book contact.
6. After `materializeTriggersFromGraph`, the trigger row’s `scope` is `every_firm` and `scope_contact_ids` is empty. `workflow.audience_contact_ids` is unchanged. Update that trigger row’s `scope` to `select_from` and `scope_contact_ids` to a one-element array that is not the whole book. `workflow.audience_scope` stays `every_firm`. Omit `contactIds`. The tag set is the whole firing-firm book. A reader of `workflow_trigger.scope` would have narrowed to that one id.
7. Omit `contactIds`. Payload `writes` is one element, `{ table: "ct_firms", id: <firing firm> }`, with no `contact_id`. The book has two firing-firm contacts. The trigger `writes` length is 1. `writes[0].table` is `ct_firms`. `writes[0].id` is the firing firm. `writes[0].contact_id` is null. No element has table `contact_records`. The tag set is the two book contacts. `counts.contacts` is 2. The same dispatch with an `if` node as specified above has If detail starting with `branch →`. A detail that starts with `if pick ` fails the case. The tag set is still the two book contacts.
8. Insert one `contact_records` row, then `handleMachineProvision` with a uuid `firmId`, `firmName` `"Pkt Fourteen"`, and `email` `"pkt014@example.com"`. The context’s `req.json` returns the body and its `json` returns `{ body, status }`. Status 200. The `every_firm` listener’s tag set is that one contact. Insert a second `contact_records` row for the same firm. Call `handleMachineProvision` again with the same `firmId`, `firmName` `"Pkt Fourteen Again"`, and the same email. Status 200. The newest run’s tag set is both contacts. The earlier run’s `counts.contacts` is still 1. Neither run’s trigger `writes` contain `contact_records`. The script does not require `writes` to be empty and does not require a `ct_firms` element. Those are PKT-013.
9. `runContactEligibilityCascade` with `contactIds: []`, `eventPayload: {}`, `triggerKind` `"pkt014"`, and `firm` the firing firm, whose book has one contact and whose listener is `eligibility.changed` and `every_firm`. The tag set is that contact. No `contact_records` element is on the trigger `writes`. The cascade loop inserted nothing, so the script does not delete eligibility rows for this call.
10. `handleHaltCommit` with `scope` `"contact"`, no `contactId`, `consultantId` `"pkt014-consultant"`, `firmId` the firing firm, and a `halt_records` `every_firm` listener. The tag set is the firm’s one book contact. The trigger `writes` contain no `contact_records` element. The script does not require the halt pointer to be present. That is PKT-011. One `halt_records` row and one `audit_events` row exist for this call, and the script deletes them.

`npm run factory:check` reads `dispatchEventToWorkflows` and fails if that function still contains the ternary `(contactIds?.length ? contactIds : audience)`. It fails unless the `select_from` arm contains `SELECT id FROM contact_records WHERE firm_id=$1 AND id = ANY($2::text[])`, ignoring whitespace, bound to `[opts.firmId, audience]`, and fails if that statement contains `ORDER BY`, `LIMIT`, or `DISTINCT`. It fails unless the `every_firm` arm still contains `SELECT id FROM contact_records WHERE firm_id=$1`, ignoring whitespace, bound to `[opts.firmId]`, and fails if that statement contains `ANY` or `ORDER BY`. It fails if the audience block, from `let contactIds = opts.contactIds` through the book query, contains `eventName`. It fails unless `localAxesMatch` is called with `contactIds: opts.contactIds` textually before that `let`. It reads `localAxesMatch` and fails if that function contains `contact_records`. It reads the `triggerPayload` passed to `walkValidatedWorkflow` inside `dispatchEventToWorkflows` and fails if that object literal contains `contactIds`. It does not require or forbid `anyPass` on that literal. It reads the dispatch SQL and fails unless it selects `w.audience_scope, w.audience_contact_ids`, and fails if that SQL contains `t.scope` or `scope_contact_ids`. It reads `materializeTriggersFromGraph` and fails unless the insert values still contain `'every_firm',ARRAY[]::text[]`. It reads `handleWorkflowCreate` and fails unless the insert and the conflict update still assign `audience_scope` and `audience_contact_ids`. It reads `handleMachineProvision` and fails if the `dispatchEventToWorkflows` call contains `contactIds`. It reads `runContactEligibilityCascade` and fails unless the dispatch passes `contactIds: opts.contactIds`, and fails if that function contains `contact_records`. It reads `handleHaltCommit` and fails unless it still contains `contactIds: body.contactId ? [body.contactId] : undefined` inside `if (body.scope === "contact")`, and fails if that function contains `contact_records`. It reads `handleSequenceEnrollContacts` and fails unless the every-firm query is `SELECT id, firm_id FROM contact_records` with no `WHERE`. It reads the stand-in fan-out and fails unless it still contains `input.contactIds?.length ? input.contactIds.filter((id) => audience.includes(id)) : audience` and `startRun(w.id, \`event:${input.eventName}\`)`, and fails if that fan-out contains `contact_records`. It reads `writesFromPayload` and fails if that function contains `audience_contact_ids` or `audience_scope`. It reads the `PERSON_WRITE_TABLES` initializer and fails if that initializer contains `ct_firms`. It reads the `call_agent` enroll and fails unless `fireFirstStep` is `true` and `firmId` is `opts.firmId`. It reads `contactsForAudit` and fails unless the id query still contains `firm_id=$1 AND id = ANY($2::text[])`. It does not read `isHaltBlockingNew` or `dispatchScheduleTriggers`. It reads `.github/workflows/ship.yml` and fails unless it invokes `scripts/verify-empty-firing-audience.ts`. Add `server/wire-service/workflowWalk.ts`, `server/wire-service/machine.ts`, `server/wire-service/stores.ts`, `server/wire-service/runWrites.ts`, `src/app/wire/standins/machineApi.ts`, `scripts/verify-empty-firing-audience.ts`, and `.github/workflows/ship.yml` to the path filter in `.github/workflows/factory-check.yml` if they are not already listed.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

Putting the filled ids on `payload.writes` or on `payload.contactIds`. Adding `contact_id` to the `ct_firms` pointer. Adding `ct_firms` to `PERSON_WRITE_TABLES`. An `ORDER BY` on the book query or on the new audience query. Preserving audience-array order or duplicate entries. Satisfying `local_contact_ids` with the filled audience. Reading `workflow_trigger.scope`. Changing the audience save. The Agents every-firm enroll. The stand-in fan-out. The halt firm predicate (claim 18). The schedule tick (claim 47). Stripping `anyPass`. Replacing an empty walk argument from `personIdsFromWrites` when the writes already name a person. Launch Agent. No plate.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| Empty `select_from` audience | Stored ids that are `contact_records` of `opts.firmId`. No row, no run | `dispatchEventToWorkflows`, `workflow_run`, tag `writes` | Modified |
| `every_firm` empty firing | Same book query. Empty book still inserts a run. No `ORDER BY` | `dispatchEventToWorkflows` | Only verified |
| Non-empty incoming list | `every_firm` keeps the list. `select_from` keeps the intersection and does not filter by `firm_id` | Both arms | Only verified |
| `localAxesMatch` | Unchanged. Still the caller’s `contactIds`, before the fill | Local contact axis | Only verified |
| `workflow.audience_scope`, `workflow.audience_contact_ids` | Unchanged columns. Still the dispatcher’s read | `handleWorkflowCreate`, the dispatch SQL | Only verified |
| `workflow_trigger.scope`, `scope_contact_ids` | Still written `every_firm` and `[]`. Still unread by the dispatcher | `materializeTriggersFromGraph` | Only verified |
| `triggerPayload` | Still the caller payload plus `eventName`. The audience list is not copied on | Walk, `writesFromPayload` | Only verified |
| `payload.writes` | The fill does not add `contact_records`. Claim 16, the empty eligibility array, and the halt pointer stay | Trigger `node_status.writes` | Only verified |
| `writesFromPayload` | Unchanged. A present `writes` array does not fall through to `contactIds` | Every trigger | Only verified |
| `walkValidatedWorkflow` empty fallback | Unchanged. A non-empty audience list skips it | Direct walks and an empty book | Only verified |
| `ctx.contactIds` | The walk argument. `ascribe_tag` with no chip and no `pickTable` tags it. `counts.contacts` is its length | Tag action, finished run | Only verified |
| `call_agent` | Unchanged. `firmId` is `opts.firmId`. `fireFirstStep` is `true` | Enroll | Only verified |
| `contactsForAudit` | Unchanged. Non-empty `ctx.contactIds`, query still has `firm_id` | Audit action | Only verified |
| `evalIfPick`, `PERSON_WRITE_TABLES` | Unchanged. `ct_firms` stays out. A firm-row If stays one branch | If detail | Only verified |
| `POST /machine/provision` | Same call. Still omits `contactIds`. A second provision reads the book again | Provision dispatch | Only verified |
| `runContactEligibilityCascade` | Same `contactIds: opts.contactIds`. `[]` enters the branch | Eligibility dispatch | Only verified |
| `handleHaltCommit` | Same omission when contact scope has no `contactId` | Halt dispatch | Only verified |
| `handleSequenceEnrollContacts` | Same unscoped `contact_records` select | Sequence enroll | Only verified |
| Stand-in fan-out | Same unfiltered `select_from` and the same `startRun` with no person list | In-memory dispatch | Only verified |
| `isHaltBlockingNew`, `dispatchScheduleTriggers` | Unchanged | Halt enroll, schedule tick | Only verified |
| `scripts/verify-empty-firing-audience.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases and the shape guard | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| The empty `select_from` arm treats the stored array as the person list. An id from another firm and an id with no row both survive the `audience.includes` filter. The people are the rows with `firm_id` equal to `opts.firmId`. `contact_records.id` is `TEXT` and the primary key. `audience_contact_ids` is `TEXT[]`. The statement is `WHERE firm_id=$1 AND id = ANY($2::text[])`, the same cast `contactsForAudit` already uses. No `ORDER BY`. The verify compares sets. A duplicate stored id is one row. An empty result, including an empty stored array, hits the existing `continue` before `INSERT INTO workflow_run`. | necessary |
| Omitted `contactIds` and `[]` are both `!contactIds?.length`. The three named callers already land on that test: provision omits the argument, the eligibility cascade passes the array it looped, and a contact-scope halt omits the argument when `body.contactId` is absent. The block does not read `opts.eventName`. One `select_from` query and one `every_firm` query serve every event. The handlers are not edited. | necessary |
| The `every_firm` query already selects `contact_records.id` for `opts.firmId` and has no `ORDER BY`. An empty result does not `continue`. The run insert is outside the arm, so an empty book still inserts `workflow_run` and the walk receives `[]`. This packet does not add `ANY` or `ORDER BY` to that statement. | necessary |
| A non-empty list skips both queries. `every_firm` walks that array. `select_from` walks `filter` against the stored ids and does not query `contact_records`. An other-firm id that is in both lists stays. An empty intersection still `continue`s. The old ternary `(contactIds?.length ? contactIds : audience)` would keep the unfiltered empty path, so it leaves `dispatchEventToWorkflows`. The stand-in keeps its own copy of that ternary. | necessary |
| `localAxesMatch` runs before the fill and compares `local_contact_ids` to `payload.contactId` or `opts.contactIds`. The filled book is not an argument. A local trigger whose axis names a book contact does not start when the firing named no person. A later call that passes that contact does start, and the non-empty `every_firm` arm does not expand the list to the rest of the book. | necessary |
| The dispatch SQL selects `w.audience_scope` and `w.audience_contact_ids`. `select_from` is the only narrowing value. `materializeTriggersFromGraph` writes `workflow_trigger.scope` `every_firm` and `scope_contact_ids` `ARRAY[]::text[]` and does not copy the workflow audience. A trigger row whose `scope` was updated to `select_from` after materialize is still ignored. `handleWorkflowCreate` still stores the operator’s audience. The columns are not retuned. No migration. | necessary |
| The walk argument is the filled list. The trigger payload literal does not gain `contactIds`. `writesFromPayload` reads `payload.writes` when that array is present and does not read the walk argument. A `ct_firms` element without `contact_id`, an empty `writes` array, and a halt payload that has not gained a `contact_records` element stay free of the audience. `counts.contacts` is the length. The ids are the `ascribe_tag` writes when the node has no chip and no `pickTable`. `contact_tag.contact_id` has no foreign key, so a non-book id on the non-empty arm can be tagged. A duration wait hides an empty list behind `waitPeople`’s write fallback and stores a different `counts.contacts`. The script uses the tag graph and does not call `call_agent`. | necessary |
| `call_agent` still loops `ctx.contactIds` with `firmId: opts.firmId` and `fireFirstStep: true`. `contactsForAudit` still prefers `ctx.contactIds` and still binds `firm_id`. `evalIfPick` is untouched. `ct_firms` stays out of `PERSON_WRITE_TABLES`, so the If detail stays `branch →` and the tag that already ran still holds the filled list. A missing `ct_firms` loader makes the exists check false. The detail is still one branch. PKT-013 owns that loader. | necessary |
| A second `handleMachineProvision` of the same firm id dispatches again. The branch reads `contact_records` at that moment. The first run’s `counts.contacts` stays the earlier length. The handler has no insert-versus-conflict test around the dispatch. The script uses a uuid because `firms.id` is `UUID`. The matrix uses text firm ids because `contact_records.firm_id` is `TEXT` and `dispatchEventToWorkflows` does not cast. | necessary |
| `walkValidatedWorkflow` replaces an empty `contactIds` from `personIdsFromWrites`. An empty book is passed as `[]`, so that fallback runs. The named payloads contribute no person: a `ct_firms` pointer has no `contact_id` and the table is outside the set, an empty `writes` array yields nothing, and a halt pointer with null `contact_id` yields nothing while `halt_records` stays outside the set. Acceptance 3 holds for those payloads. A firing that omits `contactIds`, has an empty book, and whose `writes` already name a person would put that person on `ctx.contactIds`. The packet says the people are the book. It does not name an edit to this fallback. Changing `!contactIds.length` into a null check would also change a direct walk that passes `[]`. This packet does not edit the fallback. | return to Architect |
| PKT-004’s change specification removes the forced `anyPass` copy inside `dispatchEventToWorkflows` and says a later plant must not delete `writes`. This packet edits the audience block and does not edit that copy. The shape guard does not require or forbid `anyPass`, so the two guards do not deadlock. This packet does not edit `SCP-pkt-004-firing-handle.md`. | adjacent |
| PKT-013 adds one `ct_firms` pointer to the provision payload and does not add `contact_records`. The live provision call still has no `writes` key. This packet’s verify accepts either shape and fails a `contact_records` element the caller did not send. It does not edit `SCP-pkt-013-firm-provision-writes.md`. PKT-009’s empty eligibility array and PKT-011’s halt pointer are the same rule. The live handlers may not have those arrays yet. This packet does not edit their change specifications. | adjacent |
| Claim 18 is PKT-015’s firm predicate on the contact arm of `isHaltBlockingNew`. The current statement matches `contact_id` only. This packet does not edit that function and does not shape-guard it, so a later plant of the predicate does not fight this guard. Claim 47 is the schedule tick. `dispatchScheduleTriggers` does not use this audience branch. This packet does not edit it and does not shape-guard it. | adjacent |
| `handleSequenceEnrollContacts` selects every `contact_records` row and enrolls each under `row.firm_id`. The stand-in `select_from` arm uses the stored array with no firm predicate, skips when that array is empty, and calls `startRun` without a person list. Those stays are acceptance 8. They are not the server fill. | adjacent |
| The packet file still says `**Release:** draft`. The ledger stage for this revision was `released` when this wake was authorized, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
