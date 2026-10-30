# SCP-pkt-007 — A fact firing places that write-back’s id on payload.writes

**Packet:** PKT-007 `pkt-007-fact-writes`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 11, the `fact_writebacks` array, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The `objective_met` array is PKT-004. The meeting array is PKT-008.  
**Contract:** `docs/factory/components/firing-pointers/CONTRACT.md` — claim 11’s fact array. `docs/factory/components/walk-handle/CONTRACT.md` names PKT-006 as the loader for `fact_writebacks`. This packet does not add that load.

## Intent

`handleFactWriteback` and `handleContactSeatFacts` each insert one `fact_writebacks` row, then dispatch `fact_writebacks` once for that insert. The seat handler stays inside the answer loop, so each answer is its own firing.

The dispatch payload gains one pointer: the `fwb-` id the insert already stored, and the contact stored on that row. The scalar keys already on each payload stay. The machine payload does not gain `firm_id`. The seat payload keeps `firm_id`. `contactIds` stays that one contact.

`writesFromPayload` already returns `payload.writes` and then stops. It gains no reader for `writebackId`. With `writes` present it returns that one pointer and does not add `contact_records`.

`missing_fact_signals` ids are not elements. The eligibility rows the cascade inserts are not elements. Those belong to `eligibility.changed` (PKT-009). The HTTP `cascade` array on the machine response still begins with `{ table: "fact_writebacks", id: writeId }`. That object is the response. The dispatch does not receive it.

A missing `contactId` or `fieldKey` on the machine route still returns before the insert and does not dispatch. A blank seat `fieldKey` still skips that iteration.

## Must / must-not

- Keep one `writeId` per insert, `` `fwb-${randomUUID()}` ``. That same string is the `INSERT` id and `writes[0].id`. Do not mint a second id for the pointer.
- On the machine dispatch, add `writes` and leave the scalars. Do not add `firm_id`. `contactIds` stays `[contactId]`, the trimmed body value, which is the `contact_id` on the row:

```ts
payload: {
  writebackId: writeId,
  fieldKey,
  contactId,
  form_ref: stamp.formRef,
  campaign_objective_id: stamp.campaignObjectiveId,
  writes: [
    { table: "fact_writebacks", id: writeId, contact_id: contactId },
  ],
},
contactIds: [contactId],
```

- On the seat dispatch, inside the answer loop, add `writes` and keep `firm_id`. `contact_id` on the pointer is `resolved.link.contact_id`. `contactIds` stays `[resolved.link.contact_id]`:

```ts
payload: {
  writebackId: writeId,
  fieldKey,
  contactId: resolved.link.contact_id,
  firm_id: resolved.link.firm_id,
  form_ref: stamp.formRef,
  campaign_objective_id: stamp.campaignObjectiveId,
  writes: [
    { table: "fact_writebacks", id: writeId, contact_id: resolved.link.contact_id },
  ],
},
contactIds: [resolved.link.contact_id],
```

- `writes` is a new one-element array. Do not spread `cascade`, `missingIds`, `workflowsFired`, or the eligibility ids into it. Do not put `eligibility_evaluations`, `eligibility_results`, `signals`, or `motion_decisions` on the fact payload.
- Do not put `contactIds` or `contact_ids` on either fact payload. `contactId` singular stays.
- Leave the machine return before the insert:

```426:428:server/wire-service/machine.ts
  if (!body.contactId?.trim() || !body.fieldKey?.trim()) {
    return json(c, { error: "contactId and fieldKey required" }, 400);
  }
```

- Leave the seat skip before the insert: `if (!fieldKey) continue`. A present `fieldKey` with a null `value` still inserts. Do not skip on `value`.
- Leave the machine HTTP body. `cascade[0]` stays `{ table: "fact_writebacks", id: writeId }` with no `contact_id`. The seat response stays `projectSeat`. Do not add a cascade to it.
- Do not edit `writesFromPayload`. Do not teach it to read `writebackId`.
- Do not edit `dispatchEventToWorkflows`, including the `anyPass` copy. That copy is PKT-004. Do not edit `loadWriteRow`. Do not add `fact_writebacks` to `PERSON_WRITE_TABLES`. PKT-006 owns that load and that name.
- Do not edit `runContactEligibilityCascade`. Its `eligibility.changed` payload stays `{ ...opts.eventPayload, anyPass: true, motion: "reactivation" }` with no `writes`. Both handlers still call it before the fact dispatch.
- Do not edit `onCompletionWrite` or `objectiveSatisfiedBy`. Both handlers still call `onCompletionWrite` with `table: "fact_writebacks"` and `rowId: writeId` after the fact dispatch.
- Do not bump `event_write_set`. Do not read `event_write_set` or `event_test_data` to build this payload. Do not edit `eventTest.ts`.

## Stores and contracts

No new table and no new column. No migration. No new `event_write_set` version.

`fact_writebacks.id` is `TEXT PRIMARY KEY`. The row already stores the contact.

```366:373:supabase/migrations/004_machine_tables.sql
CREATE TABLE IF NOT EXISTS fact_writebacks (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  field_key TEXT,
  value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`form_ref` and `campaign_objective_id` are already columns. They are not the dispatch handle. The handle is `id`.

```16:21:supabase/migrations/021_objective_local_axis.sql
ALTER TABLE fact_writebacks
  ADD COLUMN IF NOT EXISTS form_ref TEXT,
  ADD COLUMN IF NOT EXISTS campaign_objective_id TEXT;

CREATE INDEX IF NOT EXISTS fact_writebacks_objective_idx
  ON fact_writebacks (campaign_objective_id, contact_id);
```

The registered write-set for this event is already one table. The one-element array is that contract. It is not read at fire time.

```27:31:supabase/migrations/017_event_test_contract.sql
INSERT INTO event_write_set (event_name, version, table_name, ord) VALUES
('contact_import', 1, 'import_batch', 0),
('contact_import', 1, 'contact_records', 1),
('contact.created', 1, 'contact_records', 0),
('fact_writebacks', 1, 'fact_writebacks', 0),
```

The handle type stays. `contact_id` is optional on the type and required on the pointer this firing publishes.

```1:6:server/wire-service/runWrites.ts
/** This run’s writes — the next node’s input. Not an events table. */
export type RunWrite = {
  table: string;
  id: string;
  contact_id?: string | null;
};
```

`writesFromPayload` returns when `payload.writes` is an array. It does not continue into `contact_records`. There is no `writebackId` branch.

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

The lines after that array return push `import_batch` and then one `contact_records` pointer per id in `payload.contact_ids` or `payload.contactIds`. A fact payload that omits `writes` hits that path only when those keys are present. Today’s fact payloads have neither, so the trigger handle is empty. Adding `writes` is what stops the fallthrough. Adding a `contactIds` array on the payload would feed that fallthrough whenever `writes` is absent. This packet does not add that array.

`loadWriteRow` does not know `fact_writebacks`. A miss returns null. A listener’s field read stays null until PKT-006. The array is still this firing’s handle.

```695:699:server/wire-service/workflowWalk.ts
  if (w.table === "missing_fact_signals") {
    const { rows } = await pool.query(`SELECT * FROM missing_fact_signals WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  return null;
```

`PERSON_WRITE_TABLES` does not contain `fact_writebacks`. This packet does not add it. The walk’s person list for this firing is the `contactIds` argument, which is already one contact, so the missing membership does not empty the run.

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

A local `fact_writebacks` trigger matches `form_ref` on the payload. Keeping that scalar is what lets the local axis fire. `campaign_objective_id` is not that axis.

```1853:1857:server/wire-service/workflowWalk.ts
function localRefFromPayload(
  eventName: string,
  payload: Record<string, unknown> | undefined,
): string | null {
  if (eventName === "fact_writebacks") return payloadString(payload, ["form_ref", "formRef"]);
```

The completion match for a fact objective is still the newest stamped row. It does not bind `rowId`. `onCompletionWrite` still passes the inserted id as `completionId`. This packet does not retune that select.

```726:733:server/wire-service/campaignHousing.ts
  if (objective.completion_table === "fact_writebacks") {
    const r = await pool.query<{ id: string }>(
      `SELECT id FROM fact_writebacks
        WHERE firm_id=$1 AND contact_id=$2 AND campaign_objective_id = $3
        ORDER BY created_at DESC LIMIT 1`,
      [firmId, contactId, objective.id],
    );
    return { ok: Boolean(r.rowCount), completionId: r.rows[0]?.id ?? null };
  }
```

```779:802:server/wire-service/campaignHousing.ts
export async function onCompletionWrite(
  pool: Pool,
  opts: { firmId: string; contactId: string; table: CompletionTable; rowId: string },
): Promise<void> {
  if (!opts.firmId || opts.firmId === "unknown" || !opts.contactId) return;
  const enr = await pool.query<EnrollmentCursor>(
    `SELECT id, firm_id, contact_id, sequence_id, campaign_id, enrolled_at
       FROM enrollment
      WHERE firm_id=$1 AND contact_id=$2 AND campaign_id IS NOT NULL
      ORDER BY enrolled_at DESC LIMIT 1`,
    [opts.firmId, opts.contactId],
  );
  const row = enr.rows[0];
  if (!row?.campaign_id) return;
  const obj = await loadObjectiveForCampaign(pool, row.campaign_id);
  if (!obj) return;
  if (obj.completion_table !== opts.table) return;
  const sat = await objectiveSatisfiedBy(pool, row, obj);
  if (!sat.ok) return;
  await advanceEnrollmentCampaign(pool, row.id, {
    completionTable: opts.table,
    completionId: opts.rowId,
  });
}
```

## Runtime

The machine handler already holds `writeId`, inserts it, deletes or inserts `missing_fact_signals`, runs the cascade, then dispatches without `writes`:

```432:500:server/wire-service/machine.ts
  const writeId = `fwb-${randomUUID()}`;
  const stamp = await resolveFormStamp(pool, {
    firmId: firm,
    contactId,
    formRef: body.formRef,
  });
  await pool.query(
    `INSERT INTO fact_writebacks (id, firm_id, contact_id, field_key, value, form_ref, campaign_objective_id)
     VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7)`,
    [
      writeId,
      firm,
      contactId,
      fieldKey,
      JSON.stringify(body.value ?? null),
      stamp.formRef,
      stamp.campaignObjectiveId,
    ],
  );
  // ... missing_fact_signals delete and optional inserts ...
  const { cascade, workflowsFired } = await runContactEligibilityCascade({
    firm,
    contactIds: [contactId],
    triggerKind: "fact_writeback",
    resultPayload: { writebackId: writeId, fieldKey, source: body.source ?? "contact" },
    eventPayload: {
      writebackId: writeId,
      fieldKey,
      contactId,
      form_ref: stamp.formRef,
      campaign_objective_id: stamp.campaignObjectiveId,
    },
  });

  const factDispatched = await dispatchEventToWorkflows(pool, {
    firmId: firm,
    eventName: "fact_writebacks",
    payload: {
      writebackId: writeId,
      fieldKey,
      contactId,
      form_ref: stamp.formRef,
      campaign_objective_id: stamp.campaignObjectiveId,
    },
    contactIds: [contactId],
  });
```

Add `writes` on that payload only. Leave the cascade `eventPayload` without `writes`. Leave the insert. `missingIds` stay on the HTTP field `missingSignalIds`.

The response cascade is a different array. It is not the dispatch argument:

```509:517:server/wire-service/machine.ts
  return json(c, {
    writebackId: writeId,
    contactId,
    fieldKey,
    missingSignalIds: missingIds,
    cascade: [{ table: "fact_writebacks", id: writeId }, ...cascade],
    workflowsFired: [...factDispatched, ...workflowsFired],
    gate: sendGateSnapshot(),
    note: "fact_writebacks dispatched; eligibility.changed also emitted",
  });
```

The seat handler dispatches once per answer, with `firm_id` and still no `writes`. Add `writes` inside that same loop. Leave the insert, the missing-signal delete, the cascade call, and `onCompletionWrite` in that order.

```561:617:server/wire-service/contactSeat.ts
  for (const answer of answers) {
    const fieldKey = String(answer.fieldKey ?? "").trim();
    if (!fieldKey) continue;
    const writeId = `fwb-${randomUUID()}`;
    // ... resolveFormStamp, INSERT, DELETE missing_fact_signals ...
    await runContactEligibilityCascade({ /* unchanged; no writes */ });
    await dispatchEventToWorkflows(resolved.pool, {
      firmId: resolved.link.firm_id,
      eventName: "fact_writebacks",
      payload: {
        writebackId: writeId,
        fieldKey,
        contactId: resolved.link.contact_id,
        firm_id: resolved.link.firm_id,
        form_ref: stamp.formRef,
        campaign_objective_id: stamp.campaignObjectiveId,
      },
      contactIds: [resolved.link.contact_id],
    });
    await onCompletionWrite(resolved.pool, {
      firmId: resolved.link.firm_id,
      contactId: resolved.link.contact_id,
      table: "fact_writebacks",
      rowId: writeId,
    });
  }
```

The cascade’s own dispatch is the eligibility event. It is not this packet’s array:

```333:338:server/wire-service/machine.ts
  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: opts.firm,
    eventName: "eligibility.changed",
    payload: { ...opts.eventPayload, anyPass: true, motion: "reactivation" },
    contactIds: opts.contactIds,
  });
```

`dispatchEventToWorkflows` copies the caller payload onto the walk and also sets `eventName` and `anyPass`. This packet does not change that copy. `writesFromPayload` reads `writes` and ignores those two keys, so the trigger handle is still the one pointer.

```1970:1976:server/wire-service/workflowWalk.ts
    const walked = await walkValidatedWorkflow(pool, {
      workflowId: row.workflow_id,
      firmId: opts.firmId,
      runId,
      triggerLabel: `event:${opts.eventName}`,
      triggerPayload: { ...(opts.payload ?? {}), eventName: opts.eventName, anyPass: true },
      contactIds,
    });
```

The walk does not store `triggerPayload`. It stores `writesFromPayload`’s output on the trigger node. That stored array is the handle this packet proves. An element with no `table` and no `id` is dropped, so a spread of cascade objects would not show up there. The source literal is what forbids that spread.

```1091:1104:server/wire-service/workflowWalk.ts
  let contactIds = opts.contactIds ?? [];
  const triggerWrites = writesFromPayload(opts.triggerPayload);
  if (!contactIds.length) {
    contactIds = personIdsFromWrites(triggerWrites);
  }
```

```1145:1151:server/wire-service/workflowWalk.ts
      if (type === "trigger") {
        commitWrites(ctx, nodeId, ctx.previousWrites);
        nodeStatus[nodeId] = {
          status: "success",
          detail: `trigger ${triggerKind(data)}`,
          at: now(),
          writes: ctx.previousWrites,
        };
```

`node_status` is written onto `workflow_run` at the end of the walk. The verify reads that column. `counts.contacts` is `ctx.contactIds.length`.

Door 1 for this event still takes the newest twenty fact rows for the firm and copies their bodies. That reader is not the run handle.

```73:79:server/wire-service/eventTest.ts
    if (eventName === "fact_writebacks") {
      const ok = await push(
        "fact_writebacks",
        `SELECT * FROM fact_writebacks WHERE firm_id=$1 ORDER BY created_at DESC LIMIT 20`,
        [firm],
      );
      return ok ? out : null;
    }
```

## Ports

No new port.

These stay on the same functions:

- `POST /machine/fact-writebacks` → `handleFactWriteback`. The body stays `contactId`, `fieldKey`, `value`, optional `source`, `missingFieldKeys`, and `formRef`. The firm is still the session firm.
- `POST /contact-seat/:token/facts` and `POST /machine/contact-workspaces/:contactId/facts` → `handleContactSeatFacts`. The body stays `{ answers: [{ fieldKey, value }] }`.
- `dispatchEventToWorkflows` for `fact_writebacks`. Same `firmId`, same `contactIds` length 1. The payload gains `writes`.
- `runContactEligibilityCascade` for `eligibility.changed`. Same payload. No `writes`.
- `onCompletionWrite` after the fact dispatch. Same `rowId`.
- `writesFromPayload` and `loadWriteRow`. Unchanged readers.
- `GET /machine/fact-writebacks` (`handleFactWritebacksList`) is not this handle. Do not edit it.

## Verify

`scripts/verify-fact-writes.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` after migrate and seed, beside `verify-click-attribution`. `npm run build` is not this proof.

The script uses `getPool()` the way `scripts/verify-click-attribution.ts` does. Firm id is `firm-pkt007-` plus a run token. It does not use the seeded Harbor firm. It sets `AUTH_DISABLED=true` and `DEV_SESSION_FIRM` to that firm before the machine calls, and it does not send `x-firm-id`. The Hono stub returns `{ body, status }` from `json`, returns the posted body from `req.json`, and returns empty strings from `req.query` and `req.header`. `getCookie` sees no session cookie (`req.raw.headers` is a `Headers` when the cookie helper needs it).

It inserts its own `ct_firms`, `contact_records`, `sequence_template`, `campaign`, `campaign_objective`, `enrollment`, and `contact_access_links` rows. Token hash is `sha256` of the raw token (`server/auth-service/crypto.ts`). `expires_at` and `invalidated_at` are null. It inserts `workflow` (`target` `contact`), `workflow_state` (`active`), and calls `materializeTriggersFromGraph`. It deletes the rows it inserts, by this firm id: `workflow_run`, `engagement_records`, `eligibility_results`, `eligibility_evaluations`, `signals`, `motion_decisions`, `missing_fact_signals`, `fact_writebacks`, `contact_access_links`, `enrollment`, `campaign_objective`, `campaign`, `sequence_template`, `workflow_trigger`, `workflow_state`, `workflow`, `contact_records`, `ct_firms`.

Graphs are a trigger plus an `exit`. `isValidatedPipeline` accepts that. Trigger `data.triggerKind` is `"event"`. `data.triggerEvent` is the event name. `data.configured` is not `false`.

Listeners, all on this firm:

1. Global `fact_writebacks`. Grain `global`. This run’s trigger `writes` are the handle.
2. Local `fact_writebacks` for the machine enrollment. `data.grain` is `"local"` and `data.localRef` is `form.${enrollmentId}.${objectiveId}` (`derivedFormRef`). A payload without that `form_ref` does not start this run.
3. The same local shape for the seat enrollment, with that enrollment’s derived form ref.
4. Global `eligibility.changed`. Its trigger `writes` stay empty, and `dispatched.length > 0` skips the cascade’s `enrollAndActuate` fallback. The product cascade is not edited.

Objectives used for the pointer cases have `completion_table` `meeting_booked`, so a fact write does not advance the enrollment. `resolveFormStamp` still stamps `form_ref` and `campaign_objective_id` from that enrollment. One separate case uses `completion_table` `fact_writebacks` and a second campaign.

Before the machine write, insert one decoy `fact_writebacks` row for the machine contact: a different id, `field_key` `"decoy"`, `campaign_objective_id` null, `created_at` one day ahead. Also insert one `missing_fact_signals` row for the field key about to be answered, and remember its id.

1. Machine fact that commits. Body `contactId`, `fieldKey` `"keep"`, `value` `"yes"`, and `missingFieldKeys` of one new key. One new row’s `id` starts with `fwb-`, equals `body.writebackId`, and equals the global listener’s trigger `writes[0].id`. `writes` has length 1. `writes[0].table` is `fact_writebacks`. `writes[0].contact_id` equals the row’s `contact_id`. The id is not the decoy. The row’s `field_key` is `"keep"`. `counts.contacts` is 1. The pre-inserted missing-signal id and `body.missingSignalIds` are absent from `writes`. No `writes` element has table `eligibility_evaluations`, `eligibility_results`, `signals`, `motion_decisions`, `missing_fact_signals`, or `contact_records`. The eligibility listener’s trigger `writes` are `[]`. The machine local listener has a new run. `body.cascade[0]` is `{ table: "fact_writebacks", id: body.writebackId }` and has no `contact_id`.
2. The machine payload’s scalar keys are the shape guard below. The walk does not store `triggerPayload`. The local run in case 1 is the runtime proof of `form_ref`: `localRefFromPayload` reads that key, and a missing `form_ref` would not start the local workflow.
3. Two seat answers, `fieldKey` `"one"` and `"two"`. Two new `fwb-` rows. Two new global runs for that contact. Each run’s `writes` has length 1, and `writes[0].id` is that answer’s row id and not the other answer’s. The seat local listener has two new runs. `writesFromPayload` of `{ writes: that pointer, contactIds: [contact], writebackId: that id }` returns that one pointer and does not add `contact_records`. `writesFromPayload` of `{ writebackId: that id, contactId: contact }` with no `writes` array returns no `fact_writebacks` pointer.
4. Seat payload `firm_id` is the shape guard below.
5. One seat body whose `answers` are `{ fieldKey: "  " }` then `{ fieldKey: "keep", value: "yes" }`. One new row, one new global run. The blank `fieldKey` does not insert and does not dispatch.
6. Machine call with no `contactId`, then a call with `contactId` and no `fieldKey`. Each response status is 400 and `error` is `"contactId and fieldKey required"`. No new `fact_writebacks` row. No new run of the global fact listener.
7. A second machine contact, objective `completion_table` `fact_writebacks`, two campaigns, enrollment on the first. After one fact write, `SELECT campaign_id FROM enrollment` for that enrollment id is the second campaign. The fact listener’s `writes[0].id` is still the inserted `fwb-` id. This case proves `onCompletionWrite` still runs. It does not retune the newest-row select.

`npm run factory:check` reads `handleFactWriteback` and fails unless the `fact_writebacks` payload object contains `writebackId: writeId`, `fieldKey`, `contactId`, `form_ref: stamp.formRef`, `campaign_objective_id: stamp.campaignObjectiveId`, and `writes` whose single element is `table: "fact_writebacks"`, `id: writeId`, `contact_id: contactId`. It fails if that object contains `firm_id`, `contactIds`, `contact_ids`, `...cascade`, `missingIds`, `eligibility_evaluations`, `eligibility_results`, `signals`, or `motion_decisions`. It fails unless `contactIds: [contactId]` is the dispatch argument. It fails unless `"contactId and fieldKey required"` occurs before `INSERT INTO fact_writebacks` in that function. It reads `handleContactSeatFacts` and applies the same `writes` rules, and fails unless that payload contains `firm_id: resolved.link.firm_id` and `contact_id: resolved.link.contact_id`, and unless `if (!fieldKey) continue` occurs before the insert. It reads `runContactEligibilityCascade` and fails if the `eligibility.changed` payload expression contains `writes`. It reads `writesFromPayload` and fails if that function contains `writebackId`. It reads both `onCompletionWrite` call sites and fails unless each still passes `table: "fact_writebacks"` and `rowId: writeId`. It reads the fact branch of `objectiveSatisfiedBy` and fails unless that statement still has `campaign_objective_id = $3` and `ORDER BY created_at DESC LIMIT 1`. It does not assert on `anyPass` inside `dispatchEventToWorkflows`. It does not require or forbid `SELECT * FROM fact_writebacks WHERE id=$1` in `loadWriteRow`. Add `server/wire-service/machine.ts`, `server/wire-service/runWrites.ts`, and `scripts/verify-fact-writes.ts` to the path filter in `.github/workflows/factory-check.yml`. `server/wire-service/contactSeat.ts` and `server/wire-service/campaignHousing.ts` are already listed.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

The meeting array (PKT-008). The `objective_met` array (PKT-004). The eligibility array and stripping `anyPass` off `eligibility.changed` (PKT-009). The id load of `fact_writebacks` and adding that name to `PERSON_WRITE_TABLES` (PKT-006). Door 1 in `eventTest.ts`. `handleFactWritebacksList`. Launch Agent. No plate.

Also out of this packet: changing `dispatchEventToWorkflows`’s `anyPass` copy. Changing `objectiveSatisfiedBy` so the match uses `rowId` instead of the newest stamped fact. A `meeting_booked` case on `localRefFromPayload`. `src/`.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `fact_writebacks` | Same table. The inserted `fwb-` id is `writes[0].id` | Insert, trigger `writes`, completion `rowId` | Modified |
| `handleFactWriteback` payload | One `fact_writebacks` pointer. Scalars stay. No `firm_id` | `dispatchEventToWorkflows`, `writesFromPayload` | Modified |
| `handleContactSeatFacts` payload | Same pointer, per answer. `firm_id` stays | Seat loop, local `form_ref` match | Modified |
| `contactIds` argument | Still one contact. Not copied onto the payload | Walk person list, `counts.contacts` | Only verified |
| `writesFromPayload` | Unchanged. `payload.writes` is the handle. No `writebackId` reader | Every trigger, including this event | Only verified |
| `dispatchEventToWorkflows` | Unchanged. Still copies payload and sets `eventName` and `anyPass` | Fact listener `node_status.writes` | Only verified |
| `runContactEligibilityCascade` | Unchanged. `eligibility.changed` gains no `writes` | Eligibility listener | Only verified |
| HTTP `cascade` | Still begins with `{ table: "fact_writebacks", id: writeId }` | Machine response | Only verified |
| `missing_fact_signals` | Still deleted or inserted. Ids stay off `writes` | Machine `missingSignalIds` | Only verified |
| `onCompletionWrite` | Same `rowId`. Match stays the newest stamped fact | Enrollment cursor when the objective table is `fact_writebacks` | Only verified |
| `event_write_set` `fact_writebacks` v1 | Already ord 0 `fact_writebacks`. Not read at fire time | Live payload literal | Only verified |
| `loadWriteRow`, `PERSON_WRITE_TABLES` | Unchanged. Fact field read stays null until PKT-006 | If / Switch | Only verified |
| `eventTest.ts` door 1 | Still the newest twenty fact rows | Test door | Only verified |
| `scripts/verify-fact-writes.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases and the shape guard | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| Both fact dispatches omit `writes`, so `writesFromPayload` returns no pointer and the trigger handle is empty. The id is already `fwb-` plus a uuid on the row. That same string is `writes[0].id`. A second `randomUUID()` would publish a pointer that matches no row. | necessary |
| `writesFromPayload` returns the array and then stops. It does not read `writebackId`. A reader for that scalar would invent a pointer when `writes` is absent, which case 3 forbids. The function stays. | necessary |
| The cascade return and `missingIds` are not `{ table, id }` rows of this firing. Spreading them into `writes` can still look like one pointer after `writesFromPayload` drops elements with no `table`. The payload literal is a one-element array. The eligibility ids stay on `eligibility.changed` (PKT-009). | necessary |
| The machine payload has no `firm_id`. The seat payload has `firm_id`. `localAxesMatch` prefers `payload.firm_id` over the dispatch `firmId`. Adding `firm_id` to the machine payload, or removing it from the seat payload, changes which firm a local trigger sees. This packet does not unify them. | necessary |
| `localRefFromPayload` for `fact_writebacks` reads `form_ref`. The stamp already writes that column and that scalar. Dropping the scalar would silence a local trigger whose `local_ref` is the derived form ref. `campaign_objective_id` is not that axis. The walk does not store the scalar, so the shape guard is the proof that the key remains, and the local run is the proof that `form_ref` arrived. | necessary |
| The machine route returns 400 before `getPool` when `contactId` or `fieldKey` is blank after trim. The seat loop skips a blank `fieldKey` before the insert. Moving either check to after the insert would dispatch a firing the packet says does not happen. | necessary |
| The HTTP `cascade` array is the machine response. Its first object has no `contact_id`. The dispatch pointer does. Reusing the response object as `writes[0]` would drop `contact_id`. The seat response is `projectSeat` and has no cascade. | necessary |
| `dispatchEventToWorkflows` still forces `anyPass: true` after the spread. `writesFromPayload` does not read that key, so the handle is still `payload.writes`. Removing the flag is PKT-004. This packet does not edit that copy, and its shape guard does not require the flag to stay. | adjacent |
| `loadWriteRow` returns null for `fact_writebacks`, and `PERSON_WRITE_TABLES` omits that name. PKT-006 adds the id load and the name. A field read on the listener stays null until that branch exists. If the branch is already present, leave it. This packet does not add it. The published array is the handle either way. `contactIds` is already one contact, so the run’s person list does not depend on the set. | adjacent |
| `objectiveSatisfiedBy` for `fact_writebacks` selects the newest row with that objective, not `opts.rowId`. `onCompletionWrite` still passes the inserted id as `completionId`. The packet leaves that match. A newer decoy stamped with the same objective would still satisfy. This packet does not retune the select. | adjacent |
| `eventTest.ts` door 1 for `fact_writebacks` still selects the newest twenty rows for the firm. The listener started by `dispatchEventToWorkflows` is the handle. The Test door stays. A decoy with a later `created_at` is how the verify shows the handle is the inserted id. | adjacent |
| PKT-004’s change specification says the current `fact_writebacks` payload is unchanged apart from the forced `anyPass` copy. This packet adds `writes` to that payload. Implementing PKT-004 must not delete this array. This packet does not edit `SCP-pkt-004-firing-handle.md`. | adjacent |
| PKT-008 places the meeting array. PKT-009 places the eligibility quartet on `eligibility.changed`. This packet does not add `writes` to those dispatches. | adjacent |
| The packet file still says `**Release:** draft`. The ledger stage for this revision is `released`, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
