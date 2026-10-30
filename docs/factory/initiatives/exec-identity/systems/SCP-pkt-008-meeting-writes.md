# SCP-pkt-008 — A meeting firing places that booking’s id on payload.writes

**Packet:** PKT-008 `pkt-008-meeting-writes`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 11, the `meeting_booked` array, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The fact array is PKT-007. The `objective_met` array is PKT-004.  
**Contract:** `docs/factory/components/firing-pointers/CONTRACT.md` — claim 11’s meeting array. `docs/factory/components/walk-handle/CONTRACT.md` names PKT-006 as the loader for `meeting_booked`. This packet does not add that load.

## Intent

`handleMeetingBook` and `handleContactSeatMeeting` each insert one `meeting_booked` row, then dispatch `meeting_booked` once. The dispatch payload gains one pointer: the `mtg-` id the insert already stored, and the contact stored on that row.

The scalar keys already on each payload stay, including `meetingId`, `slot`, and `campaign_objective_id`. The seat payload keeps `firm_id` and `contactId`. The machine payload does not gain `firm_id`. `contactIds` stays that one contact. This packet does not unify the two payloads.

`writesFromPayload` already returns `payload.writes` and then stops. It gains no reader for `meetingId`. With `writes` present it returns that one pointer and does not add `contact_records` or `engagement_records`.

`localRefFromPayload` gains no case for `meeting_booked`. It still returns null for that event name.

`handleMeetingBook` still inserts one `engagement_records` row of kind `meeting_booked` after the dispatch. The id of that row stays the `` `eng-${randomUUID()}` `` binding the statement already passes as `$1`. `event_write_set` names `meeting_booked` only. The side row is not a pointer. This packet does not move the insert. `handleContactSeatMeeting` still does not insert that row.

The open-attempt nullify stays on both handlers. `onCompletionWrite` still receives the meeting row id.

A machine call without `contactId`, and a seat call without `slot`, still return before the insert and do not dispatch. A machine call that has a contact and omits `slot` still inserts and dispatches.

## Must / must-not

- Keep one `id` per insert, `` `mtg-${randomUUID()}` ``. That same string is the `INSERT` id, `meetingId`, and `writes[0].id`. Do not mint a second id for the pointer.
- On the machine dispatch, add `writes` and leave the scalars. Do not add `firm_id`. `contact_id` on the pointer is the trimmed `contactId` stored on the row. `contactIds` stays `[contactId]`:

```ts
payload: {
  meetingId: id,
  contactId,
  slot: body.slot ?? null,
  campaign_objective_id: campaignObjectiveId,
  writes: [
    { table: "meeting_booked", id, contact_id: contactId },
  ],
},
contactIds: [contactId],
```

- On the seat dispatch, add `writes` and keep `firm_id`. `contact_id` on the pointer is `resolved.link.contact_id`. `slot` stays the trimmed body value. `contactIds` stays `[resolved.link.contact_id]`:

```ts
payload: {
  meetingId: id,
  contactId: resolved.link.contact_id,
  firm_id: resolved.link.firm_id,
  slot,
  campaign_objective_id: campaignObjectiveId,
  writes: [
    { table: "meeting_booked", id, contact_id: resolved.link.contact_id },
  ],
},
contactIds: [resolved.link.contact_id],
```

- `writes` is a new one-element array. Do not put `engagement_records` on it. Do not put the `` `eng-${randomUUID()}` `` binding on it. Do not spread the machine HTTP body into it. Do not put `contactIds` or `contact_ids` on either payload. `contactId` singular stays.
- Do not add `source` to either payload. The machine row still stores `(body.source ?? "contact_portal").trim()`. The seat row still stores `'contact_workspace'`.
- Leave the machine return before the insert. A blank `contactId` after trim is that return. Do not add a slot guard on this handler:

```1889:1890:server/wire-service/machine.ts
  const contactId = (body.contactId ?? "").trim();
  if (!contactId) return json(c, { error: "contactId required" }, 400);
```

- Leave the seat return before the insert. A missing, empty, or whitespace `slot` is that return. Do not copy it onto `handleMeetingBook`:

```625:627:server/wire-service/contactSeat.ts
  const body = await c.req.json<{ slot?: string }>().catch(() => ({}));
  const slot = String(body.slot ?? "").trim();
  if (!slot) return json(c, { error: "slot required" }, 400);
```

- Leave the machine HTTP body. It still returns `id`, `firmId`, `contactId`, `slot`, `source`, `enrollmentId`, `attemptsStopped`, `table: "meeting_booked"`, and `workflowsFired`. It does not gain `writes`. The seat response stays `projectSeat`.
- Do not edit `writesFromPayload`. Do not teach it to read `meetingId`.
- Do not edit `localRefFromPayload`. Do not add a `meeting_booked` case. `slot` and `campaign_objective_id` are not a local axis for this event.
- Do not edit `dispatchEventToWorkflows`, including the `anyPass` copy. Stripping `anyPass` is out of scope. Do not edit `loadWriteRow`. Do not add `meeting_booked` to `PERSON_WRITE_TABLES`. PKT-006 owns that load and that name. If either is already present, leave it.
- Do not edit `onCompletionWrite` or `objectiveSatisfiedBy`. Both handlers still call `onCompletionWrite` with `table: "meeting_booked"` and `rowId: id` after the meeting dispatch.
- Do not move the machine engagement insert. It stays after the dispatch and the nullify. The id stays this binding, passed as `$1`. Do not replace it with `gen_random_uuid()`:

```1950:1964:server/wire-service/machine.ts
  await pool.query(
    `INSERT INTO engagement_records (id, firm_id, contact_id, event_kind, payload)
     VALUES ($1,$2,$3,'meeting_booked',$4::jsonb)`,
    [
      `eng-${randomUUID()}`,
      firm,
      contactId,
      JSON.stringify({
        meetingId: id,
        slot: body.slot ?? null,
        source,
        attemptsStopped: stopped.rows.map((r) => r.id),
      }),
    ],
  );
```

- `handleContactSeatMeeting` still has no `INSERT INTO engagement_records`.
- Leave both nullify statements. The machine statement still writes `nullified_at`. The seat statement does not. Do not unify them.

```1941:1948:server/wire-service/machine.ts
  const stopped = await pool.query(
    `UPDATE active_attempts
     SET status='nullified', updated_at=now(),
         state = state || jsonb_build_object('meeting_booked', true, 'meeting_id', $3::text, 'nullified_at', now()::text)
     WHERE firm_id=$1 AND contact_id=$2 AND status='open'
     RETURNING id`,
    [firm, contactId, id],
  );
```

```671:677:server/wire-service/contactSeat.ts
  await resolved.pool.query(
    `UPDATE active_attempts
     SET status='nullified', updated_at=now(),
         state = state || jsonb_build_object('meeting_booked', true, 'meeting_id', $3::text)
     WHERE firm_id=$1 AND contact_id=$2 AND status='open'`,
    [resolved.link.firm_id, resolved.link.contact_id, id],
  );
```

- Do not bump `event_write_set`. Do not read `event_write_set` or `event_test_data` to build this payload. Do not edit `eventTest.ts`. Do not add `writes` to the `objective_met` dispatch inside `advanceEnrollmentCampaign`.

## Stores and contracts

No new table and no new column. No migration. No new `event_write_set` version.

`meeting_booked.id` is `TEXT PRIMARY KEY`. The row already stores the contact.

```2:13:supabase/migrations/007_meeting_booked.sql
CREATE TABLE IF NOT EXISTS meeting_booked (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  booked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'contact_portal',
  slot TEXT,
  consultant_name TEXT,
  enrollment_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`campaign_objective_id` is already a column. It is not the dispatch handle. The handle is `id`.

```23:24:supabase/migrations/021_objective_local_axis.sql
ALTER TABLE meeting_booked
  ADD COLUMN IF NOT EXISTS campaign_objective_id TEXT;
```

The registered write-set for this event is already one table. The one-element array is that contract. It is not read at fire time. `engagement_records` is not in it.

```43:44:supabase/migrations/017_event_test_contract.sql
('halt_records', 1, 'halt_records', 0),
('meeting_booked', 1, 'meeting_booked', 0);
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

`writesFromPayload` returns when `payload.writes` is an array. It does not continue into `contact_records`. There is no `meetingId` branch.

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

The lines after that array return push `import_batch` and then one `contact_records` pointer per id in `payload.contact_ids` or `payload.contactIds`. A meeting payload that omits `writes` hits that path only when those keys are present. Today’s meeting payloads have neither, so the trigger handle is empty. Adding `writes` is what stops the fallthrough. Adding a `contactIds` array on the payload would feed that fallthrough whenever `writes` is absent. This packet does not add that array.

`loadWriteRow` does not know `meeting_booked`. A miss returns null. A listener’s field read stays null until PKT-006. The array is still this firing’s handle.

```695:699:server/wire-service/workflowWalk.ts
  if (w.table === "missing_fact_signals") {
    const { rows } = await pool.query(`SELECT * FROM missing_fact_signals WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  return null;
```

`PERSON_WRITE_TABLES` does not contain `meeting_booked`. This packet does not add it. The walk’s person list for this firing is the `contactIds` argument, which is already one contact, so the missing membership does not empty the run.

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

A local `meeting_booked` trigger has no payload axis. `localRefFromPayload` falls through to null. Keeping `slot` and `campaign_objective_id` does not start a local workflow whose `local_ref` is set.

```1853:1870:server/wire-service/workflowWalk.ts
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

`localAxesMatch` prefers `payload.firm_id` over the dispatch `firmId`. The machine payload has no `firm_id`, so a local firm axis uses the dispatch firm. The seat payload has `firm_id`. This packet does not unify them.

```1888:1891:server/wire-service/workflowWalk.ts
  if (row.local_firm_id) {
    const writeFirm = payloadString(opts.payload, ["firm_id", "firmId"]) ?? opts.firmId;
    if (writeFirm !== row.local_firm_id) return false;
  }
```

The completion match for a meeting objective is still the newest row that carries that objective, or a null-objective row tied to that enrollment. It does not bind `rowId`. `onCompletionWrite` still passes the inserted id as `completionId`. This packet does not retune that select. The planted meeting predicate does not use `campaign_objective_id = $3 AND enrollment_id = $4`. The click check in `scripts/factory-check.ts` already refuses that combined predicate. Leave the OR.

```708:724:server/wire-service/campaignHousing.ts
  if (objective.completion_table === "meeting_booked") {
    const r = await pool.query<{ id: string }>(
      `SELECT id FROM meeting_booked
        WHERE firm_id=$1 AND contact_id=$2
          AND (
            campaign_objective_id = $3
            OR (
              campaign_objective_id IS NULL
              AND enrollment_id = $4
              AND created_at >= $5
            )
          )
        ORDER BY created_at DESC LIMIT 1`,
      [firmId, contactId, objective.id, enrollment.id, enrolledAt],
    );
    return { ok: Boolean(r.rowCount), completionId: r.rows[0]?.id ?? null };
  }
```

```779:801:server/wire-service/campaignHousing.ts
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

The stamp both handlers already write is `campaignObjectiveIdForCampaign` of the newest enrollment’s campaign. One objective per campaign is the table’s unique key. This packet does not change that lookup.

```610:619:server/wire-service/campaignHousing.ts
export async function campaignObjectiveIdForCampaign(
  pool: Pool,
  campaignId: string | null | undefined,
): Promise<string | null> {
  if (!campaignId) return null;
  const row = await pool.query<{ id: string }>(
    `SELECT id FROM campaign_objective WHERE campaign_id=$1 LIMIT 1`,
    [campaignId],
  );
  return row.rows[0]?.id ?? null;
}
```

## Runtime

The machine handler already holds `id`, inserts it, then dispatches without `writes`. The engagement insert is later.

```1893:1938:server/wire-service/machine.ts
  const id = `mtg-${randomUUID()}`;
  const source = (body.source ?? "contact_portal").trim();
  const enr = await pool.query<{ id: string; campaign_id: string | null }>(
    `SELECT id, campaign_id FROM enrollment WHERE firm_id=$1 AND contact_id=$2
     ORDER BY enrolled_at DESC LIMIT 1`,
    [firm, contactId],
  );
  const enrollmentId = enr.rows[0]?.id ?? null;
  const campaignObjectiveId = await campaignObjectiveIdForCampaign(
    pool,
    enr.rows[0]?.campaign_id ?? null,
  );

  await pool.query(
    `INSERT INTO meeting_booked
       (id, firm_id, contact_id, booked_at, source, slot, consultant_name, enrollment_id, campaign_objective_id, payload)
     VALUES ($1,$2,$3,now(),$4,$5,$6,$7,$8,$9::jsonb)`,
    [
      id,
      firm,
      contactId,
      source,
      body.slot ?? null,
      body.consultantName ?? null,
      enrollmentId,
      campaignObjectiveId,
      JSON.stringify({
        contactName: body.contactName ?? null,
        slot: body.slot ?? null,
      }),
    ],
  );

  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: firm,
    eventName: "meeting_booked",
    payload: { meetingId: id, contactId, slot: body.slot ?? null, campaign_objective_id: campaignObjectiveId },
    contactIds: [contactId],
  });

  await onCompletionWrite(pool, {
    firmId: firm,
    contactId,
    table: "meeting_booked",
    rowId: id,
  });
```

Add `writes` on that dispatch payload only. Leave the insert, `onCompletionWrite`, the nullify, and the engagement insert in that order.

The seat handler dispatches with `firm_id` and still no `writes`. Add `writes` on that payload. Leave the insert, `onCompletionWrite`, and the nullify in that order. There is no engagement insert on this path.

```628:678:server/wire-service/contactSeat.ts
  const id = `mtg-${randomUUID()}`;
  const cursor = await resolved.pool.query<{ campaign_id: string | null }>(
    `SELECT campaign_id FROM enrollment
      WHERE firm_id=$1 AND contact_id=$2 AND campaign_id IS NOT NULL
      ORDER BY enrolled_at DESC LIMIT 1`,
    [resolved.link.firm_id, resolved.link.contact_id],
  );
  const campaignObjectiveId = await campaignObjectiveIdForCampaign(
    resolved.pool,
    cursor.rows[0]?.campaign_id ?? resolved.link.campaign_id,
  );
  await resolved.pool.query(
    `INSERT INTO meeting_booked
       (id, firm_id, contact_id, booked_at, source, slot, consultant_name, enrollment_id, campaign_objective_id, payload)
     VALUES ($1,$2,$3,now(),'contact_workspace',$4,NULL,$5,$6,$7::jsonb)`,
    [
      id,
      resolved.link.firm_id,
      resolved.link.contact_id,
      slot,
      resolved.link.enrollment_id,
      campaignObjectiveId,
      JSON.stringify({ slot, contactName: null }),
    ],
  );
  await dispatchEventToWorkflows(resolved.pool, {
    firmId: resolved.link.firm_id,
    eventName: "meeting_booked",
    payload: {
      meetingId: id,
      contactId: resolved.link.contact_id,
      firm_id: resolved.link.firm_id,
      slot,
      campaign_objective_id: campaignObjectiveId,
    },
    contactIds: [resolved.link.contact_id],
  });
  await onCompletionWrite(resolved.pool, {
    firmId: resolved.link.firm_id,
    contactId: resolved.link.contact_id,
    table: "meeting_booked",
    rowId: id,
  });
  await resolved.pool.query(
    `UPDATE active_attempts
     SET status='nullified', updated_at=now(),
         state = state || jsonb_build_object('meeting_booked', true, 'meeting_id', $3::text)
     WHERE firm_id=$1 AND contact_id=$2 AND status='open'`,
    [resolved.link.firm_id, resolved.link.contact_id, id],
  );
  return json(c, await projectSeat(resolved.pool, resolved.link));
```

`projectSeat` does not return the new `mtg-` id. The seat proof reads the row. The machine response `id` is that same row id.

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

The walk does not store `triggerPayload`. It stores `writesFromPayload`’s output on the trigger node. That stored array is the handle this packet proves.

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

```1667:1681:server/wire-service/workflowWalk.ts
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

Door 1 for this event still takes the newest ten meeting rows for the firm and copies their bodies. That reader is not the run handle.

```168:174:server/wire-service/eventTest.ts
    if (eventName === "meeting_booked") {
      const ok = await push(
        "meeting_booked",
        `SELECT * FROM meeting_booked WHERE firm_id=$1 ORDER BY booked_at DESC LIMIT 10`,
        [firm],
      );
      return ok ? out : null;
    }
```

## Ports

No new port.

These stay on the same functions:

- `POST /machine/meetings` → `handleMeetingBook`. The body stays `contactId`, optional `slot`, `consultantName`, `source`, and `contactName`. The firm is still the session firm.
- `POST /contact-seat/:token/meeting` and `POST /machine/contact-workspaces/:contactId/meeting` → `handleContactSeatMeeting`. The body stays `{ slot }`.
- `dispatchEventToWorkflows` for `meeting_booked`. Same `firmId`, same `contactIds` length 1. The payload gains `writes`.
- `onCompletionWrite` after the meeting dispatch. Same `rowId`.
- `writesFromPayload` and `localRefFromPayload`. Unchanged readers.
- `GET /machine/meetings` (`handleMeetingsList`) is not this handle. Do not edit it.

```242:244:server/wire-service/routes.ts
  wire.post("/machine/contact-workspaces/:contactId/meeting", handleContactSeatMeeting);
  wire.post("/machine/contact-workspaces/:contactId/uploads", handleContactSeatUpload);
  wire.post("/machine/meetings", handleMeetingBook);
```

```263:263:server/wire-service/routes.ts
  wire.post("/contact-seat/:token/meeting", handleContactSeatMeeting);
```

The workspace route resolves the seat through `requireSessionActor` and requires a platform admin. The token route resolves `contact_access_links` by `sha256` of the raw token. The verify uses the token route. Both routes stay on this handler.

## Verify

`scripts/verify-meeting-writes.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` after migrate and seed, beside `verify-click-attribution`. `npm run build` is not this proof.

The script uses `getPool()` the way `scripts/verify-click-attribution.ts` does. Firm id is `firm-pkt008-` plus a run token. It does not use the seeded Harbor firm. It sets `AUTH_DISABLED=true` and `DEV_SESSION_FIRM` to that firm before the machine calls, and it does not send `x-firm-id`. The Hono stub returns `{ body, status }` from `json`, returns the posted body from `req.json`, and returns empty strings from `req.query` and `req.header`. `getCookie` sees no session cookie (`req.raw.headers` is a `Headers` when the cookie helper needs it). For the seat call, `req.param("token")` returns the raw token and `req.param("contactId")` returns an empty string, so `seatFromToken` runs.

It inserts its own `ct_firms` (`name` required), `contact_records`, `sequence_template`, `campaign`, `campaign_objective`, `enrollment`, and `contact_access_links` rows. Token hash is `sha256` of the raw token (`server/auth-service/crypto.ts`). `expires_at` and `invalidated_at` are null. It inserts `workflow` (`target` `contact`), `workflow_state` (`active`), and calls `materializeTriggersFromGraph`. It deletes the rows it inserts, by this firm id: `workflow_run`, `engagement_records`, `meeting_booked`, `active_attempts`, `contact_access_links`, `enrollment`, `campaign_objective`, `campaign`, `sequence_template`, `workflow_trigger`, `workflow_state`, `workflow`, `contact_records`, `ct_firms`.

Graphs are a trigger plus an `exit`, with an edge from the trigger to the exit. `isValidatedPipeline` accepts that. Trigger `data.triggerKind` is `"event"`. `data.triggerEvent` is `"meeting_booked"`. `data.configured` is not `false`.

Listeners, all on this firm:

1. Global `meeting_booked`. Grain `global`. This run’s trigger `writes` are the handle.
2. Local `meeting_booked`. `data.grain` is `"local"` and `data.localRef` is the slot string the success calls send. A payload with no `meeting_booked` case in `localRefFromPayload` does not start this run.

Pointer-case objectives have `kind` `form` and `completion_table` `fact_writebacks`, so a meeting write does not advance the enrollment. `campaignObjectiveIdForCampaign` still stamps `campaign_objective_id` from that enrollment. One separate case uses `kind` `meeting`, `completion_table` `meeting_booked`, and a second campaign. `campaign_objective` is unique on `campaign_id`.

Before the machine write in case 1, insert one decoy `meeting_booked` row for the machine contact: a different id, `source` `"decoy"`, `slot` null, `campaign_objective_id` null, `enrollment_id` null, `booked_at` one day ahead.

The seat id is the new `meeting_booked` row, not a field of `projectSeat`. The machine id is `body.id` and the row.

1. Machine meeting that commits. Body `contactId` and `slot` `"2026-11-02T15:00:00-08:00"`, no `source`. One new row’s `id` starts with `mtg-`, equals `body.id`, and equals the global listener’s trigger `writes[0].id`. `writes` has length 1. `writes[0].table` is `meeting_booked`. `writes[0].contact_id` equals the row’s `contact_id` and the trimmed `contactId`. The id is not the decoy. The row’s `source` is `contact_portal` and its `slot` is that string. `counts.contacts` is 1. No `writes` element has table `engagement_records` or `contact_records`. The local listener has no new run.
2. The machine payload’s scalar keys are the shape guard below. The walk does not store `triggerPayload`. There is no local-ref reader for this event, so a local run is not the proof those keys arrived.
3. One seat call with that same slot string. One new `mtg-` row for the link contact. `source` is `contact_workspace`. One new global run for that contact. `writes` has length 1, and `writes[0].id` is that row’s id. `writes[0].contact_id` equals `contact_access_links.contact_id`. The seat local listener has no new run. `writesFromPayload` of `{ writes: that pointer, contactIds: [contact], meetingId: that id }` returns that one pointer and does not add `contact_records` or `engagement_records`. `writesFromPayload` of `{ meetingId: that id, contactId: contact }` with no `writes` array returns no `meeting_booked` pointer.
4. Seat payload `firm_id` is the shape guard below. The seat response is whatever `projectSeat` already returns. It is not required to contain `writes` or the `mtg-` id.
5. After case 1, one `engagement_records` row for that contact has `event_kind` `meeting_booked`. Its id starts with `eng-`. That id is not an element of the global run’s `writes`. The row’s `payload.meetingId` equals the `mtg-` id. The seat contact from case 3 has no `engagement_records` row.
6. The seat path’s lack of an engagement insert is case 5’s second count. A second seat call is not required.
7. `localRefFromPayload` still has no `meeting_booked` case. The local listener in cases 1 and 3 is the runtime proof. The shape guard below is the source proof.
8. Machine call with no `contactId`, then a call with `contactId` `"  "`. Each response status is 400 and `error` is `"contactId required"`. No new `meeting_booked` row. No new run of the global meeting listener. Seat call with no `slot`, then `{ slot: "  " }`. Each response status is 400 and `error` is `"slot required"`. No new row. No new run.
9. Machine call with `contactId` and no `slot`. One new row with `slot` null. One new global run. `writes` has length 1 and `writes[0].id` is that row. This case is the machine path’s lack of a slot guard.
10. A second machine contact, objective `completion_table` `meeting_booked`, two campaigns, enrollment on the first. After one meeting write with a slot, `SELECT campaign_id FROM enrollment` for that enrollment id is the second campaign. The meeting listener’s `writes[0].id` is still the inserted `mtg-` id. This case proves `onCompletionWrite` still runs. It does not retune the newest-row select, and it does not assert the `objective_met` payload. No decoy shares that objective.

`npm run factory:check` reads `handleMeetingBook` and fails unless the `meeting_booked` payload object contains `meetingId: id`, `contactId`, `slot: body.slot ?? null`, `campaign_objective_id: campaignObjectiveId`, and `writes` whose single element is `table: "meeting_booked"`, `id`, `contact_id: contactId`. It fails if that object contains `firm_id`, `contactIds`, `contact_ids`, `source`, `engagement_records`, or `` `eng-${randomUUID()}` ``. It fails unless `contactIds: [contactId]` is the dispatch argument. It fails unless `"contactId required"` occurs before `INSERT INTO meeting_booked` in that function. It fails if that function returns `"slot required"`. It fails unless `INSERT INTO engagement_records` occurs after that dispatch, the bound id is `` `eng-${randomUUID()}` ``, and `onCompletionWrite` still passes `table: "meeting_booked"` and `rowId: id`. It fails unless the `active_attempts` update in that function still contains `nullified_at`. It reads `handleContactSeatMeeting` and applies the same `writes` rules, and fails unless that payload contains `firm_id: resolved.link.firm_id`, `slot`, and `contact_id: resolved.link.contact_id`, and unless `if (!slot)` occurs before the insert. It fails if that function contains `INSERT INTO engagement_records`. It fails unless its `active_attempts` update does not contain `nullified_at`, and unless its `onCompletionWrite` still passes `table: "meeting_booked"` and `rowId: id`. It reads `writesFromPayload` and fails if that function contains `meetingId`. It reads `localRefFromPayload` and fails if that function contains `meeting_booked`. It reads the meeting branch of `objectiveSatisfiedBy` and fails unless that statement still has `campaign_objective_id = $3`, `enrollment_id = $4`, `created_at >= $5`, and `ORDER BY created_at DESC LIMIT 1`, and fails if it contains `campaign_objective_id = $3 AND enrollment_id = $4`. It does not assert on `anyPass` inside `dispatchEventToWorkflows`. It does not require or forbid `SELECT * FROM meeting_booked WHERE id=$1` in `loadWriteRow`. It does not require or forbid `meeting_booked` inside `PERSON_WRITE_TABLES`. Add `server/wire-service/machine.ts`, `server/wire-service/runWrites.ts`, `server/wire-service/workflowWalk.ts`, and `scripts/verify-meeting-writes.ts` to the path filter in `.github/workflows/factory-check.yml`. `server/wire-service/contactSeat.ts` and `server/wire-service/campaignHousing.ts` are already listed.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

The fact array (PKT-007). The `objective_met` array and stripping `anyPass` (PKT-004). The eligibility array (PKT-009). The id load of `meeting_booked` and adding that name to `PERSON_WRITE_TABLES` (PKT-006). Door 1 in `eventTest.ts`. `handleMeetingsList`. Moving or deleting the side engagement insert. The attempt-nullify statement. Launch Agent. No plate.

Also out of this packet: changing `dispatchEventToWorkflows`’s `anyPass` copy. Changing `objectiveSatisfiedBy` so the match uses `rowId` instead of the newest meeting row. A `meeting_booked` case on `localRefFromPayload`. Unifying machine and seat `firm_id`, `slot` guards, or `nullified_at`. `src/`.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `meeting_booked` | Same table. The inserted `mtg-` id is `writes[0].id` | Insert, trigger `writes`, completion `rowId` | Modified |
| `handleMeetingBook` payload | One `meeting_booked` pointer. Scalars stay. No `firm_id` | `dispatchEventToWorkflows`, `writesFromPayload` | Modified |
| `handleContactSeatMeeting` payload | Same pointer. `firm_id` stays | Seat dispatch, token route | Modified |
| `contactIds` argument | Still one contact. Not copied onto the payload | Walk person list, `counts.contacts` | Only verified |
| `writesFromPayload` | Unchanged. `payload.writes` is the handle. No `meetingId` reader | Every trigger, including this event | Only verified |
| `localRefFromPayload` | Unchanged. No `meeting_booked` case | Local meeting listener | Only verified |
| `dispatchEventToWorkflows` | Unchanged. Still copies payload and sets `eventName` and `anyPass` | Meeting listener `node_status.writes` | Only verified |
| Machine HTTP body | Still returns `id` and `table`. No `writes` | `POST /machine/meetings` | Only verified |
| Seat HTTP body | Still `projectSeat` | Token route and workspace route | Only verified |
| `engagement_records` side row | Still inserted after the machine dispatch. Id stays off `writes`. Seat still inserts none | Machine response path, write-set | Only verified |
| `active_attempts` nullify | Both handlers still nullify open rows. Machine still writes `nullified_at` | Open attempts | Only verified |
| `onCompletionWrite` | Same `rowId`. Match stays the newest meeting row | Enrollment cursor when the objective table is `meeting_booked` | Only verified |
| `event_write_set` `meeting_booked` v1 | Already ord 0 `meeting_booked`. Not read at fire time | Live payload literal | Only verified |
| `loadWriteRow`, `PERSON_WRITE_TABLES` | Unchanged by this packet. Meeting field read stays null until PKT-006 | If / Switch | Only verified |
| `eventTest.ts` door 1 | Still the newest ten meeting rows | Test door | Only verified |
| `scripts/verify-meeting-writes.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases and the shape guard | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| Both meeting dispatches omit `writes`, so `writesFromPayload` returns no pointer and the trigger handle is empty. The id is already `mtg-` plus a uuid on the row. That same string is `writes[0].id`. A second `randomUUID()` would publish a pointer that matches no row. | necessary |
| `writesFromPayload` returns the array and then stops. It does not read `meetingId`. A reader for that scalar would invent a pointer when `writes` is absent, which case 3 forbids. The function stays. The payload must not gain `contactIds`, or a missing `writes` array would publish `contact_records`. | necessary |
| The machine HTTP body has `id` and `table` and no `contact_id` on a pointer. Reusing that object as `writes[0]` would drop `contact_id`. The seat response is `projectSeat` and does not carry the new id. The seat proof reads the row. | necessary |
| The packet says the engagement id is still generated inside the SQL. The planted insert binds `` `eng-${randomUUID()}` `` as `$1`. The statement text has no `gen_random_uuid()`. Leaving that binding is the insert the packet quotes. Rewriting the id into the SQL text would move generation. The side row stays after the dispatch, and its id stays off `writes`. The seat handler still has no engagement insert. | necessary |
| The machine payload has no `firm_id`. The seat payload has `firm_id`. `localAxesMatch` prefers `payload.firm_id` over the dispatch `firmId`. Adding `firm_id` to the machine payload, or removing it from the seat payload, changes which firm a local trigger sees. This packet does not unify them. | necessary |
| `localRefFromPayload` has no `meeting_booked` branch and returns null. `slot` and `campaign_objective_id` do not start a local trigger. Adding a case would make case 7 fail. The scalars stay because the packet keeps them. The shape guard is the proof they remain. The walk does not store them. | necessary |
| The machine route returns 400 before `getPool` when `contactId` is blank after trim. It does not require `slot`. The seat route returns 400 when `slot` is blank after trim, after the link lookup and before the insert. Copying the seat guard onto the machine would refuse a booking the packet still dispatches. | necessary |
| The machine nullify writes `nullified_at` and returns the stopped ids into the engagement payload. The seat nullify does not. Unifying those statements changes a write this packet says stays. | necessary |
| `onCompletionWrite` still passes the inserted id as `completionId`. `objectiveSatisfiedBy` for `meeting_booked` selects the newest matching row, not `opts.rowId`. The packet leaves that match. A newer decoy stamped with the same objective would still satisfy. The verify’s completion case has no such decoy. The click check already refuses `campaign_objective_id = $3 AND enrollment_id = $4` in that statement. This packet does not edit it. | necessary |
| `dispatchEventToWorkflows` still forces `anyPass: true` after the spread. `writesFromPayload` does not read that key, so the handle is still `payload.writes`. Removing the flag is PKT-004. This packet does not edit that copy, and its shape guard does not require the flag to stay. | adjacent |
| `loadWriteRow` returns null for `meeting_booked`, and `PERSON_WRITE_TABLES` omits that name. PKT-006 adds the id load and the name. A field read on the listener stays null until that branch exists. If the branch is already present, leave it. This packet does not add it. The published array is the handle either way. `contactIds` is already one contact, so the run’s person list does not depend on the set. | adjacent |
| `eventTest.ts` door 1 for `meeting_booked` still selects the newest ten rows for the firm. The listener started by `dispatchEventToWorkflows` is the handle. The Test door stays. A decoy with a later `booked_at` is how the verify shows the handle is the inserted id. | adjacent |
| PKT-004’s change specification says the current `meeting_booked` caller payload is unchanged apart from the forced `anyPass` copy. This packet adds `writes` to that payload. Implementing PKT-004 must not delete this array. This packet does not edit `SCP-pkt-004-firing-handle.md` and does not add the enrollment pointer on `advanceEnrollmentCampaign`. | adjacent |
| PKT-007 places the fact array. PKT-009 places the eligibility quartet on `eligibility.changed`. This packet does not add `writes` to those dispatches. The meeting handlers do not call `runContactEligibilityCascade`. | adjacent |
| The packet file still says `**Release:** draft`. The ledger stage for this revision was `released` when this wake was authorized, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
