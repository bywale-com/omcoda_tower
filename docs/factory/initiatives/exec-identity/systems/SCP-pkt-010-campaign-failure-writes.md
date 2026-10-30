# SCP-pkt-010 — A campaign_failure firing places the inserted id on payload.writes

**Packet:** PKT-010 `pkt-010-campaign-failure-writes`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 13, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`. Claim 10 is the id predicate.  
**Contract:** `docs/factory/components/firing-pointers/CONTRACT.md` — claim 13’s one-element array. `docs/factory/components/walk-handle/CONTRACT.md` — claim 10’s `WHERE id = pointer.id` load. PKT-006 loads `fact_writebacks`, `meeting_booked`, and `wait_occupancy`. This packet loads `campaign_failure` and leaves that table out of `PERSON_WRITE_TABLES`.

## Intent

`escalateAttemptWindow` still reaches `campaign_failure` only in the `!toChannel` branch, after `recordCampaignFailure` returns. When `toChannel` is set, including when another attempt is queued, this branch does not run. One invocation of the branch inserts one row and calls `dispatchEventToWorkflows` once.

`recordCampaignFailure` is unchanged. It still inserts `campaign_failure` with `id` = `cfail-` plus a uuid, stores `firm_id`, `contact_id`, `campaign_id`, `sequence_id`, and `payload`, exhausts the open attempt, sets that enrollment’s `pursuit_state` to `exhausted`, and returns the id. It does not change `enrollment.campaign_id`. The jsonb stays `{ attemptId, criteriaId, setValue }` with `attemptId` equal to `attempt.id`.

The dispatch payload gains

`writes: [{ table: "campaign_failure", id: <the id recordCampaignFailure returned and stored>, contact_id: <the contact stored on the row> }]`

and `campaign_id` set to the `campaign_id` passed into `recordCampaignFailure`. That value is the second enrollment read (`SELECT sequence_id, campaign_id FROM enrollment`), or null when that read has no row. It is the `campaignId` argument of that call. It is not the earlier `campaignId` peek that decides whether another attempt is queued. The key is present when the value is null.

That pointer is the only element. `contact_id` on it is the contact column, the one contact in `contactIds`. `firm_id` stays off the pointer. `campaign_failure` stays out of `PERSON_WRITE_TABLES`. This firing places one pointer, and the pointer carries `contact_id`, so `personIdsFromWrites` already uses that field.

The keys already on the payload stay: `campaignFailureId` and `attemptId`. `campaignFailureId` is the same string as `writes[0].id`. The payload does not gain `firm_id`, `contact_id`, `sequence_id`, `criteriaId`, or `setValue` at the root. `sequence_id`, `criteriaId`, and `setValue` stay on the row the pointer loads.

`writesFromPayload` gains no reader for `campaignFailureId`. With `writes` present it returns that one pointer and does not add `contact_records`.

`localRefFromPayload("campaign_failure")` and `triggerLocalRefFromPayload` stay as they are. Both return `payload.campaign_id` or `payload.campaignId` when that value is a non-empty string, and null otherwise. `localAxesMatch` compares that string to `workflow_trigger.local_ref` only when `local_ref` is set. A null column does not match a selected campaign. A trigger that left the axis unset still matches. The firm compare still falls back to `opts.firmId`. The contact compare still falls back to `opts.contactIds`. This packet does not add those root keys.

`dispatchEventToWorkflows` still copies the payload and still sets `anyPass: true` on the walked trigger. The match reads the object passed into the dispatch, so `campaign_id` is on that object. Claim 7’s refusal of `anyPass` is not recut. This packet does not edit that function.

`loadWriteRow` gains a `campaign_failure` branch: `SELECT * FROM campaign_failure WHERE id = pointer.id`. No `firm_id`, no `contact_id`, no `ORDER BY`, no “latest”. No row with that id returns null. A miss does not try `contact_id`. That is the predicate claim 10 locked. This packet adds the branch. It does not change the predicate. A later node reads `sequence_id` and the jsonb fields from that row.

`event_write_set` version 1 already names `campaign_failure` alone, at ord 0. This packet does not write a migration and does not retune door 1. Door 1 for this event stays the newest ten `campaign_failure` rows for the firm.

The rows written before the branch stay off the array: the open-attempt update, the tick `workflow_run` labelled `window:` plus the criteria id, and the `window_fired` engagement. A forward channel’s `send_live` or `send_dry_run` is written when this dispatch does not run. Inside `recordCampaignFailure`, the attempt update and the enrollment update stay the spending stop. `writes` does not name `active_attempts`, `enrollment`, `engagement_records`, or `workflow_run`.

The idempotent return when `fired_criteria` already contains this criteria stays before the insert. The inbound-override return stays before the insert. A dispatch error still warns and does not roll back the failure row, which `recordCampaignFailure` already committed.

## Must / must-not

- Keep one id. `recordCampaignFailure` still binds `const id = \`cfail-${randomUUID()}\``. That same string is the `INSERT` id, the return value, `campaignFailureId`, and `writes[0].id`. Do not mint a second id for the pointer.
- Keep the call in the `!toChannel` branch, after `recordCampaignFailure` returns. One invocation inserts one row and calls `dispatchEventToWorkflows` once. Do not loop the branch. Do not dispatch when `toChannel` is set.
- The payload is the existing pair plus `campaign_id` and `writes`. `contactIds` stays the argument, not a payload key:

```ts
payload: {
  campaignFailureId: failId,
  attemptId: attempt.id,
  campaign_id: enr.rows[0]?.campaign_id ?? null,
  writes: [
    {
      table: "campaign_failure",
      id: failId,
      contact_id: attempt.contact_id,
    },
  ],
},
contactIds: [attempt.contact_id],
```

- `campaign_id` on that object is the same expression already passed as `campaignId` into `recordCampaignFailure` (`enr.rows[0]?.campaign_id ?? null`). When `attempt.enrollment_id` is null, `enr.rows` is empty and the expression is null. The key is still on the object. Do not bind the payload field to the earlier `let campaignId` peek. Do not omit the key when the value is null.
- Do not put `firm_id` on the pointer. Do not put `campaignFailureId`, `attemptId`, `sequence_id`, `criteriaId`, or `setValue` on the pointer. Do not put `firm_id`, `contact_id`, `sequence_id`, `criteriaId`, `setValue`, or `anyPass` on the caller payload. The dispatcher’s `anyPass` copy stays where it is.
- Do not put `active_attempts`, `enrollment`, `engagement_records`, `workflow_run`, `send_live`, or `send_dry_run` on this array. The array length is 1.
- Leave `recordCampaignFailure`. The insert columns stay `id, firm_id, contact_id, campaign_id, sequence_id, payload`. The attempt update stays `status='exhausted'` where `status='open'`, and still stamps `campaign_failure_id` in `state`. The enrollment update stays `pursuit_state='exhausted', exhausted_at=now()` and does not assign `campaign_id`. `COMMIT` stays before the return. The jsonb argument stays `{ attemptId: attempt.id, criteriaId: criteria.id, setValue }`.
- Leave the writes that already happen before the branch: the `active_attempts` update of `owner_channel`, `fired_criteria`, and `state`; the `workflow_run` labelled `` `window:${criteria.id}` ``; the `window_fired` engagement. Leave the `send_live` / `send_dry_run` writes on the `toChannel` path. The queued-next-attempt block still sets `toChannel` from `channelOrder[0]` when the peek finds a campaign and `attempt_n` is below `attempt_count`.
- Leave the two returns that sit above the insert. `attempt.fired_criteria?.[criteria.id]` still returns null. `hasInboundOverride` still nullifies the attempt, writes `attempt_nullified`, and returns null.
- Leave the dispatch `try/catch`. The catch still `console.warn("[cascade] campaign_failure dispatch:", err)`. Do not move the dispatch inside `recordCampaignFailure`’s transaction. Do not delete the failure row from the catch.
- Add one `loadWriteRow` branch, as literal SQL, before the final `return null`:

```ts
if (w.table === "campaign_failure") {
  const { rows } = await pool.query(`SELECT * FROM campaign_failure WHERE id=$1`, [w.id]);
  return (rows[0] as Record<string, unknown> | undefined) ?? null;
}
```

  No `firm_id`, no `contact_id`, no `ORDER BY`, no `LIMIT`. No row returns null. Do not interpolate the table name. Do not query again by `contact_id` when `rows[0]` is missing. Do not use `w.contact_id ?? w.id` on this branch. Leave every other branch, including a `fact_writebacks`, `meeting_booked`, `wait_occupancy`, `engagement_records`, or eligibility branch another packet may already have added. Do not export `loadWriteRow`. If it is already exported, leave the export.
- Do not add `campaign_failure` to `PERSON_WRITE_TABLES`. Do not remove a name that is already there. Do not edit `personTableOf`, `evalIfPick`, `personIdsFromWrites`, `pickWrites`, or either `find` in `resolveOperandText`.
- Do not edit `writesFromPayload`. Do not teach it to read `campaignFailureId`.
- Do not edit `localRefFromPayload`, `triggerLocalRefFromPayload`, `localAxesMatch`, or `triggerLocalAxesMatch`. The `campaign_failure` arm in both ref readers stays `payloadString(payload, ["campaign_id", "campaignId"])`.
- Do not edit `dispatchEventToWorkflows`, including the `anyPass` copy and the empty-list book fill. Stripping `anyPass` is PKT-004. The empty-contact audience is claim 17. This dispatch already passes one contact.
- Do not bump `event_write_set`. Do not read `event_write_set` or `event_test_data` to build this payload. Do not edit `eventTest.ts`. Door 1 for this event stays `SELECT * FROM campaign_failure WHERE firm_id=$1 ORDER BY created_at DESC LIMIT 10`. Do not edit `tickOnce`’s `WHERE status = 'open'` or the in-tick `current.status !== "open"` break. Do not edit `scripts/verify-worker-actuation.ts` or `scripts/verify-author-runtime.ts`.

## Stores and contracts

No new table and no new column. No migration. No new `event_write_set` version.

`campaign_failure.id` is `TEXT PRIMARY KEY`. The row already stores `firm_id`, `contact_id`, `campaign_id`, `sequence_id`, and `payload`. `created_at` defaults to `now()`. The firm/contact index is the door-1 scan’s company. It is not the load.

```58:67:supabase/migrations/010_sequence_campaign_housing.sql
CREATE TABLE IF NOT EXISTS campaign_failure (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  campaign_id TEXT REFERENCES campaign(id) ON DELETE SET NULL,
  sequence_id TEXT REFERENCES sequence_template(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS campaign_failure_firm_idx ON campaign_failure (firm_id, contact_id);
```

The registered write-set is already this one table at ord 0. The array is that contract. It is not read at fire time.

```32:32:supabase/migrations/017_event_test_contract.sql
('campaign_failure', 1, 'campaign_failure', 0),
```

The handle type stays. `contact_id` is optional on the type and required on the pointer this firing publishes. The type has no `firm_id`.

```1:6:server/wire-service/runWrites.ts
/** This run’s writes — the next node’s input. Not an events table. */
export type RunWrite = {
  table: string;
  id: string;
  contact_id?: string | null;
};
```

`writesFromPayload` returns when `payload.writes` is an array. It does not continue into `contact_records`. There is no `campaignFailureId` branch. An element with no string `table` or no string `id` is dropped. Extra keys on the element, including `firm_id`, are not copied.

```8:26:server/wire-service/runWrites.ts
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

The lines after that array return push `import_batch` and then one `contact_records` pointer per id in `payload.contact_ids` or `payload.contactIds`. Today’s failure payload has neither array, so a missing `writes` key yields an empty handle. Adding `writes` is what publishes the pointer. Adding a `contactIds` array on the payload would feed that fallthrough whenever `writes` is absent. This packet does not add that array. `contactIds` stays the dispatch argument.

`loadWriteRow` returns null after the tables it already knows. `campaign_failure` is not among them. `const contactId = w.contact_id ?? w.id` stays for the branches that already use it. The new branch does not use `contactId`.

The function begins with the pair loads and continues through `contact_records`, `contact_tag`, `audit_runs`, `import_batch`, and `enrollment`. It ends at `missing_fact_signals`, then `return null`. `campaign_failure` is not in that list.

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

```695:699:server/wire-service/workflowWalk.ts
  if (w.table === "missing_fact_signals") {
    const { rows } = await pool.query(`SELECT * FROM missing_fact_signals WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  return null;
}
```

The enrollment update that exhausts the pursuit assigns `pursuit_state` and `exhausted_at`. `campaign_id` is not in that `SET`.

```940:946:server/wire-service/campaignHousing.ts
    if (opts.enrollmentId) {
      await client.query(
        `UPDATE enrollment
            SET pursuit_state='exhausted', exhausted_at=now()
          WHERE id=$1`,
        [opts.enrollmentId],
      );
    }
```

`enrollment.pursuit_state` accepts `exhausted` (`supabase/migrations/022_pursuit_exhausted.sql`). `enrollment.campaign_id` is the cursor column (`supabase/migrations/010_sequence_campaign_housing.sql`). This packet does not assign it.

## Runtime

The branch that must change reads the enrollment again, inserts, and dispatches without `writes` and without `campaign_id`:

```538:566:server/wire-service/cascade.ts
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
    } catch (err) {
      console.warn("[cascade] campaign_failure dispatch:", err);
    }
  }
```

The earlier peek is a different read. It decides the queue. It is not the payload value.

```369:376:server/wire-service/cascade.ts
  let campaignId: string | null = null;
  if (attempt.enrollment_id) {
    const enrPeek = await pool.query<{ campaign_id: string | null }>(
      `SELECT campaign_id FROM enrollment WHERE id=$1`,
      [attempt.enrollment_id],
    );
    campaignId = enrPeek.rows[0]?.campaign_id ?? null;
  }
```

`recordCampaignFailure` already returns the id it stored, and it commits that row before the caller dispatches:

```914:955:server/wire-service/campaignHousing.ts
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
    );
    if (opts.attemptId) {
      await client.query(
        `UPDATE active_attempts
            SET status='exhausted', updated_at=now(),
                state = state || jsonb_build_object('exhausted_at', now()::text, 'campaign_failure_id', $2::text)
          WHERE id=$1 AND status='open'`,
        [opts.attemptId, id],
      );
    }
    if (opts.enrollmentId) {
      await client.query(
        `UPDATE enrollment
            SET pursuit_state='exhausted', exhausted_at=now()
          WHERE id=$1`,
        [opts.enrollmentId],
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
  return id;
}
```

The two guards that skip the insert stay above it.

```333:349:server/wire-service/cascade.ts
  if (attempt.fired_criteria?.[criteria.id]) {
    return null; // idempotent — already fired
  }
  if (await hasInboundOverride(pool, attempt)) {
    await pool.query(
      `UPDATE active_attempts
       SET status='nullified', updated_at=now(),
           state = state || jsonb_build_object('inbound_override', true, 'nullified_at', $2::text)
       WHERE id=$1`,
      [attempt.id, now.toISOString()],
    );
    await writeEngagement(pool, attempt.firm_id, attempt.contact_id, "attempt_nullified", {
      attemptId: attempt.id,
      reason: "inbound_override",
      criteriaId: criteria.id,
    });
    return null;
  }
```

`hasInboundOverride` is true when `attempt.state.inbound_override` is set, or when an `engagement_records` row for the firm and contact has `event_kind` in `inbound_reply`, `form_visit`, or `inbound_override` and `created_at` at or after `window_started_at`.

`tickOnce` still selects `status = 'open'` and, inside the criteria loop, reloads the attempt and breaks when `status` is no longer `open`. An exhausted attempt is not passed to `escalateAttemptWindow` by that tick. This packet does not add a status check inside `escalateAttemptWindow`.

```982:991:server/wire-service/cascade.ts
  const attempts = await pool.query<ActiveAttemptRow>(
    `SELECT id, firm_id, contact_id, enrollment_id, owner_channel, status,
            COALESCE(state, '{}'::jsonb) AS state,
            COALESCE(window_started_at, created_at) AS window_started_at,
            COALESCE(fired_criteria, '{}'::jsonb) AS fired_criteria,
            created_at
     FROM active_attempts
     WHERE status = 'open'
     ORDER BY created_at ASC
     LIMIT 500`,
  );
```

```1113:1114:server/wire-service/cascade.ts
      const current = fresh.rows[0];
      if (!current || current.status !== "open") break;
```

`PERSON_WRITE_TABLES` does not contain `campaign_failure`. `personIdsFromWrites` uses `contact_id` on the pointer before it consults that set. The pointer’s `contact_id` is the person id. Adding the table name is what would person-split an If.

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

Both local-ref readers already name this event. They return null for a null or empty `campaign_id`. Putting the column on the payload is what lets a selected campaign match. The functions stay.

```1853:1858:server/wire-service/workflowWalk.ts
function localRefFromPayload(
  eventName: string,
  payload: Record<string, unknown> | undefined,
): string | null {
  if (eventName === "fact_writebacks") return payloadString(payload, ["form_ref", "formRef"]);
  if (eventName === "campaign_failure") return payloadString(payload, ["campaign_id", "campaignId"]);
```

```145:150:src/app/data/automationTriggerSelect.ts
export function triggerLocalRefFromPayload(
  eventName: string,
  payload?: Record<string, unknown>,
): string | null {
  if (eventName === "fact_writebacks") return payloadString(payload, ["form_ref", "formRef"]);
  if (eventName === "campaign_failure") return payloadString(payload, ["campaign_id", "campaignId"]);
```

`localAxesMatch` compares `local_ref` only when it is set. The firm compare uses a root `firm_id` / `firmId` when that string is present, and otherwise `opts.firmId`. The contact compare uses a root `contact_id` / `contactId` when that string is present, and otherwise `opts.contactIds`. This caller passes `firmId` and `contactIds` as arguments and does not put those keys on the payload.

```1888:1900:server/wire-service/workflowWalk.ts
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
```

The walked trigger still receives the forced copy. This packet leaves that line.

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

The walk does not store `triggerPayload`. It stores `writesFromPayload`’s output on the trigger node. That stored array is the handle this packet proves. `campaign_id`, `campaignFailureId`, and `attemptId` are not on `node_status`. The row and the shape guard are the proof of those keys.

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

`node_status` is written onto `workflow_run` at the end of the walk. The verify reads that column. `counts.contacts` is `ctx.contactIds.length`. This dispatch passes one contact, so that count is 1 on each matching event run.

Door 1 for this event still takes the newest ten `campaign_failure` rows for the firm. That reader is not the run handle.

```81:87:server/wire-service/eventTest.ts
    if (eventName === "campaign_failure") {
      const ok = await push(
        "campaign_failure",
        `SELECT * FROM campaign_failure WHERE firm_id=$1 ORDER BY created_at DESC LIMIT 10`,
        [firm],
      );
      return ok ? out : null;
    }
```

The If detail when this table is not in the set is `branch → ${ctx.branchTaken}`.

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

`nestedField` walks a dotted path, so `payload.criteriaId` reads the jsonb once `loadWriteRow` returns the row. node-pg already parses jsonb. This packet does not add a parser.

## Ports

No new port.

These stay on the same functions:

- `escalateAttemptWindow`. Same arguments. The `campaign_failure` payload gains `writes` and `campaign_id`. `contactIds` stays `[attempt.contact_id]`. `tickOnce` remains the caller, from `handleMachineTick` and from `server/wire-service/worker.ts`.
- `GET /machine/tick` and `POST /machine/tick` → `handleMachineTick`. The cron secret check stays. The body stays the tick result.
- `recordCampaignFailure`. Same arguments. Same return id.
- `dispatchEventToWorkflows` for `campaign_failure`. Same `firmId`. Same `contactIds`. The payload gains `writes` and `campaign_id`.
- `loadWriteRow` gains one branch. It is not an HTTP route.
- `writesFromPayload`, `localRefFromPayload`, `triggerLocalRefFromPayload`, `localAxesMatch`, and `triggerLocalAxesMatch`. Unchanged readers.
- Door 1 in `eventTest.ts`. Unchanged.

```172:173:server/wire-service/routes.ts
  wire.get("/machine/tick", handleMachineTick);
  wire.post("/machine/tick", handleMachineTick);
```

## Verify

`scripts/verify-campaign-failure-writes.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` after migrate and seed, beside `verify-click-attribution`. `npm run build` is not this proof.

The script uses `getPool()` the way `scripts/verify-click-attribution.ts` does. Firm id is `firm-pkt010-` plus a run token. It is not the seeded Harbor firm. The script does not set send mode to live. It does not call `tickOnce`. That function scans every open attempt.

It inserts its own `ct_firms` (`name` required), `contact_records`, `sequence_template` (`sequence_class` `optin_launch`, `label` required), `campaign` (`sequence_id`, `name`, `ord`), `enrollment` (`agent_ref` required, `sequence_id` required), `active_attempts` (`status` `open`), `workflow` (`target` `contact`), and `workflow_state` (`active`). It calls `materializeTriggersFromGraph`. It deletes the rows it inserts, by this firm id, in foreign-key order: `campaign_failure`, `engagement_records`, `active_attempts`, `enrollment`, `campaign`, `workflow_trigger`, `workflow_state`, `workflow`, `workflow_run`, `contact_records`, `sequence_template`, `ct_firms`.

Calls go to `escalateAttemptWindow` directly. The criteria object is due without a rules row: `enabled` true, `when_clause` null, `condition_clause` null, `threshold` 0, `threshold_unit` `"seconds"`, `channel_token` null, and the call passes `withinSeconds` 0. `window_started_at` is `now`. `owner_channel` is `"text"`. `fired_criteria` is `{}` unless the case says otherwise. `state` is `{ delivered: false, attempt_n: 1 }`.

The failure cases use `set_value` `"fail"`, which leaves `toChannel` null until the queue block. The campaign on those cases has `attempt_count` 1, so `attempt_n` 1 does not queue another attempt. The queued case uses the same `set_value` and sets `attempt_count` 3 and `wait_after_last_failed_seconds` 86400, so the queue sets `toChannel` and `waiting` and does not send. The forward case uses `set_value` `"return_to_sequence_head"` and `channelOrder` `["text"]`. Its contact has no email and no phone, so the send returns a dry run. The script does not require `TEST_EMAIL_TO` or `TEST_SMS_TO`.

Listener graphs are a trigger plus an `exit`, with an edge from the trigger to the exit. `isValidatedPipeline` accepts that. Trigger `data.triggerKind` is `"event"`. `data.triggerEvent` is `"campaign_failure"`. `data.configured` is not `false`. Four listeners on the failure firm:

- global
- local, `data.grain` `"local"`, `data.localRef` unset
- local, `data.localRef` the campaign id under test
- local, `data.localRef` `"camp-other"`

The load walks call `walkValidatedWorkflow` directly. `loadWriteRow` stays unexported. Each graph is a trigger plus an `if` plus an `exit`. The If uses the legacy pick: `pickTable` `"campaign_failure"`, `pickOp` `"eq"`, `pickValue` the passing text. `configured` is not `false`. `contactIds` on that walk is the pointer’s contact. Trigger `payload.writes` is the one pointer the case states. The If detail is `branch → true` or `branch → false`, because this table is not in `PERSON_WRITE_TABLES`. A detail of `if pick … then=` means the set was changed, and that case fails.

The walk does not store `triggerPayload`. `campaign_id`, `campaignFailureId`, and the root `attemptId` are proved by the shape guard plus the stored row. A local listener firing, or not firing, is the runtime proof that `localRefFromPayload` saw the payload value. An omitted key and an explicit null both return null from `payloadString`, so the listener cannot tell them apart. The object literal is the proof the key is present when the value is null.

1. One open attempt whose enrollment `campaign_id` is the campaign under test and whose `sequence_id` is that template. One `escalateAttemptWindow` call with `set_value` `"fail"`, `attempt_count` 1, and `channelOrder` `["text", "email"]`. One `campaign_failure` row. `id` starts with `cfail-`. `contact_id` is the attempt’s contact. `campaign_id` is the enrollment’s campaign. `sequence_id` is the enrollment’s sequence. `payload` is `{ attemptId, criteriaId, setValue }` with `attemptId` equal to `attempt.id`, `criteriaId` equal to the criteria id, and `setValue` equal to `"fail"`. The attempt `status` is `exhausted`. The enrollment `pursuit_state` is `exhausted`. The enrollment `campaign_id` is unchanged. `fired_criteria` contains this criteria id. One `workflow_run` has `trigger_label` `` `window:${criteria.id}` ``. One `engagement_records` row has `event_kind` `window_fired`. Event runs exist for the global listener, the unset-`localRef` listener, and the listener whose `local_ref` is this campaign. No event run exists for `camp-other`. Each event run’s trigger `writes` has length 1. `writes[0].table` is `campaign_failure`. `writes[0].id` is the row id. `writes[0].contact_id` is the contact column. No element has `firm_id`. No element has table `active_attempts`, `enrollment`, `engagement_records`, `workflow_run`, `contact_records`, `send_live`, or `send_dry_run`. `counts.contacts` is 1.
2. Reload that attempt from `active_attempts` and call `escalateAttemptWindow` again with the same criteria. The return is null. The firm still has one `campaign_failure` row. No new event run.
3. A second attempt on the same firm with `enrollment_id` null and `set_value` `"fail"`. One new `campaign_failure` row. `campaign_id` is null. `sequence_id` is null. `payload.attemptId` is that attempt’s id. The attempt `status` is `exhausted`. No enrollment row was updated. The campaign-specific listener does not gain a run. The global listener and the unset-`localRef` listener do. That event run’s `writes[0].id` is this new row. The shape guard is the proof `campaign_id` is present on the payload object when this value is null.
4. A third attempt, enrollment `campaign_id` set, `attempt_count` 3, `wait_after_last_failed_seconds` 86400, `state.attempt_n` 1, `set_value` `"fail"`. The return’s `toChannel` is `"text"`. No `campaign_failure` row for this attempt. No new `event:campaign_failure` run. The attempt `status` stays `open`.
5. A fourth attempt, `set_value` `"return_to_sequence_head"`, `channelOrder` `["text"]`, contact with no email and no phone. No `campaign_failure` row for this attempt. No new `event:campaign_failure` run. A `send_dry_run` engagement may exist. It is not an element of a `campaign_failure` handle, because this path does not dispatch.
6. A fifth attempt with an `engagement_records` row `event_kind` `inbound_reply` and `created_at` equal to `window_started_at`, criteria absent from `fired_criteria`. The return is null. No `campaign_failure` row. The attempt `status` is `nullified`. One `attempt_nullified` engagement exists.
7. `writesFromPayload` of `{ writes: [the one pointer], contactIds: [contact], campaignFailureId: the id }` returns that one pointer and does not add `contact_records`. `writesFromPayload` of `{ campaignFailureId: the id, attemptId: the attempt }` with no `writes` array returns no `campaign_failure` pointer and no `contact_records` pointer.
8. Hit walk: insert the row from case 1’s id, plus a decoy for the same contact with a different id, a different `sequence_id`, `payload.criteriaId` `"decoy"`, and `created_at` one day ahead. The walk’s pointer id is the case-1 id. `pickField` `"sequence_id"` and `pickValue` the stored sequence yield `branch → true`. A second walk with `pickField` `"payload.criteriaId"` and `pickValue` the criteria id yields `branch → true`. Miss walk: `writes[0].id` is `cfail-absent` while the decoy, with the passing `sequence_id`, still exists. The If detail is `branch → false`. A loader that selected by `contact_id`, or by latest `created_at`, fails the hit or the miss.

`npm run factory:check` reads the `!toChannel` branch in `escalateAttemptWindow` and fails unless the `campaign_failure` payload object contains `campaignFailureId: failId`, `attemptId: attempt.id`, `campaign_id: enr.rows[0]?.campaign_id ?? null`, and a `writes` element whose `table` is `"campaign_failure"`, whose `id` is `failId`, and whose `contact_id` is `attempt.contact_id`. It fails unless `contactIds: [attempt.contact_id]` is the dispatch argument. It fails if that payload object contains `firm_id`, `contact_id`, `sequence_id`, `criteriaId`, `setValue`, or `anyPass`. It fails if that payload object’s `campaign_id` expression is the peek binding `campaignId`. It fails if the `writes` element contains `firm_id`, `active_attempts`, `enrollment`, `engagement_records`, `workflow_run`, `send_live`, or `send_dry_run`. It fails unless `recordCampaignFailure` is still called with `campaignId: enr.rows[0]?.campaign_id ?? null` and `payload: { attemptId: attempt.id, criteriaId: criteria.id, setValue }`. It fails unless the dispatch stays inside `if (!toChannel)` and the catch still warns `"[cascade] campaign_failure dispatch:"`. It fails unless `if (attempt.fired_criteria?.[criteria.id])` and `hasInboundOverride` still return before that branch. It reads `recordCampaignFailure` and fails unless the id binding is `` `cfail-${randomUUID()}` ``, the insert lists `id, firm_id, contact_id, campaign_id, sequence_id, payload`, the attempt update sets `status='exhausted'` with `WHERE id=$1 AND status='open'`, the enrollment update sets `pursuit_state='exhausted'` and does not assign `campaign_id`, and `COMMIT` stays before `return id`. It reads `writesFromPayload` and fails if that function contains `campaignFailureId`. It reads `loadWriteRow` and fails unless it contains `SELECT * FROM campaign_failure WHERE id=$1`, and fails if that statement contains `firm_id`, `contact_id`, `ORDER BY`, or `LIMIT`. It fails unless the function still ends at `return null`. It reads `PERSON_WRITE_TABLES` and fails if the set contains `campaign_failure`. It reads `localRefFromPayload` and `triggerLocalRefFromPayload` and fails unless each `campaign_failure` arm is `payloadString(payload, ["campaign_id", "campaignId"])`. It reads `eventTest.ts` and fails unless the `campaign_failure` door is `SELECT * FROM campaign_failure WHERE firm_id=$1 ORDER BY created_at DESC LIMIT 10`. It reads `tickOnce` and fails unless `WHERE status = 'open'` remains on the attempt scan. It does not assert on `anyPass` inside `dispatchEventToWorkflows`. It does not require or forbid the book-fill query. It fails if a check already in this file fails because this payload contains `writes` or `campaign_id`: replace that refusal with this requirement. Add `server/wire-service/cascade.ts`, `server/wire-service/workflowWalk.ts`, `server/wire-service/runWrites.ts`, `server/wire-service/eventTest.ts`, `src/app/data/automationTriggerSelect.ts`, and `scripts/verify-campaign-failure-writes.ts` to the path filter in `.github/workflows/factory-check.yml`. `server/wire-service/campaignHousing.ts` is already listed.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

Door 1’s newest ten, beyond the shape guard that keeps the current statement. Enriching the jsonb with the specimen’s `attemptN`, `channel`, `to`, `subject`, `reason`, or `lastAttemptAt`. Adding `campaign_failure` to `PERSON_WRITE_TABLES`. Teaching `writesFromPayload` to read `campaignFailureId`. Stripping `anyPass` (PKT-004). A second root scalar for `sequence_id`. The `window_fired` engagement and the tick `workflow_run`, beyond leaving them off `writes`. The `tickOnce` open-attempt scan. Launch Agent. Claim 14’s halt array. Claim 17’s empty-contact audience. PKT-006’s other id loads. No plate. `src/` product UI, beyond leaving `triggerLocalRefFromPayload` as it is.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `campaign_failure` dispatch payload | Gains one `writes` pointer and `campaign_id`. `campaignFailureId` and `attemptId` stay | `dispatchEventToWorkflows`, `writesFromPayload`, `localAxesMatch`, trigger `node_status.writes` | Modified |
| `campaign_failure` id | Same `cfail-` binding. That string is the pointer id | Insert, payload, trigger `writes` | Modified |
| `campaign_failure` row | Same columns. jsonb stays `{ attemptId, criteriaId, setValue }`. `sequence_id` stays a column | `loadWriteRow`, door 1 | Only verified |
| `enrollment.campaign_id` | Unchanged by the exhaust update | Pursuit cursor | Only verified |
| `enrollment.pursuit_state`, `active_attempts.status` | Still `exhausted` on the failure path | Tick scan | Only verified |
| `loadWriteRow` | One branch, `WHERE id=$1` bound to `w.id`. Other branches stay | If field reads of this table | Modified |
| `PERSON_WRITE_TABLES` | Unchanged. `campaign_failure` stays out | `personTableOf`, `evalIfPick`, `personIdsFromWrites` | Only verified |
| `personIdsFromWrites` | Unchanged. The pointer’s `contact_id` is the person id | Trigger contact list when the caller list is empty | Only verified |
| `writesFromPayload` | Unchanged. `payload.writes` is the handle. No `campaignFailureId` reader | Every trigger, including this event | Only verified |
| `localRefFromPayload`, `triggerLocalRefFromPayload`, `localAxesMatch` | Unchanged. The new `campaign_id` key is the value they already read | Local `campaign_failure` listeners | Only verified |
| `dispatchEventToWorkflows` | Unchanged. Still copies the payload and sets `eventName` and `anyPass` | This event’s listeners | Only verified |
| `event_write_set` `campaign_failure` v1 | Already ord 0 for this table. Not read at fire time | Live payload literal | Only verified |
| `eventTest.ts` door 1 | Still the newest ten rows for the firm | Test door | Only verified |
| `tickOnce` | Still scans `status = 'open'` and breaks when a reload is no longer open | Worker tick, `POST /machine/tick` | Only verified |
| `recordCampaignFailure` | Unchanged. Commits before the caller dispatches | Failure row, exhaust | Only verified |
| `scripts/verify-campaign-failure-writes.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases and the shape guard | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| The `!toChannel` dispatch omits `writes` and `campaign_id`, so `writesFromPayload` returns no pointer and a local campaign axis cannot match. `recordCampaignFailure` already returns the `cfail-` id it stored, and the second enrollment read already holds `campaign_id`. That same string is `writes[0].id`. That same expression is `payload.campaign_id`. A second `randomUUID()` would publish a pointer that matches no row. The peek `let campaignId` still decides the queue. The payload does not read it. | necessary |
| `writesFromPayload` returns the array and then stops. It does not read `campaignFailureId`. A reader for that scalar would invent a pointer when `writes` is absent, which case 7 forbids. The payload must not gain `contactIds`, or a missing `writes` array would publish `contact_records`. `contactIds` stays the dispatch argument. | necessary |
| `loadWriteRow` returns null for `campaign_failure`. The primary key is already `id`. The load is `WHERE id=$1` on `w.id`. A second query by `contact_id`, or `firm_id` / `ORDER BY` on that statement, is a different predicate than claim 10. `sequence_id` and the jsonb fields stay columns. Other branches in the function stay, including any PKT-004, PKT-006, or PKT-009 branch already present. The function stays unexported unless an earlier packet exported it. | necessary |
| `PERSON_WRITE_TABLES` omits `campaign_failure`. `evalIfPick` then runs one compare. The detail is `branch → true` or `branch → false`. The pointer carries `contact_id`, so `personIdsFromWrites` already returns that contact. Adding the name would person-split this firing. This packet does not add the name. | necessary |
| `localRefFromPayload` and `triggerLocalRefFromPayload` already return `campaign_id` or `campaignId` for this event. The live payload does not send that key, so a trigger with `local_ref` set never matches this firing. Putting the second read on the payload makes the match true only for that non-empty string. A null value stays null through `payloadString`, so a selected campaign does not match. An unset `local_ref` still matches. The firm and contact compares still fall back to the dispatch arguments because those root keys stay off the payload. Editing either reader would recut the axis. | necessary |
| The failure row is committed inside `recordCampaignFailure` before `dispatchEventToWorkflows`. The catch warns and does not delete the row. Moving the dispatch into that transaction would roll the row back on a dispatch error, which the packet keeps. The `fired_criteria` update above the branch is its own statement. This packet does not join it to the failure transaction. | necessary |
| `fired_criteria` already containing this criteria, and an inbound override, return before the insert. The tick reloads `status` and does not call this function once the attempt is `exhausted`. Those three stops are how one exhaustion stays one row. This packet does not retune the tick scan and does not add a status check inside `escalateAttemptWindow`. | necessary |
| The open-attempt update, the `window:` run, and the `window_fired` engagement are written on the failure path before the branch. `send_live` and `send_dry_run` are written on the path that sets `toChannel`, which does not dispatch. `writes` names none of them. The queue block still sets `toChannel` from the peek and skips this branch. | necessary |
| The walk stores `writes` and does not store `triggerPayload`. `campaign_id`, `campaignFailureId`, and the root `attemptId` are not on `node_status`. The row, the local listeners, and the shape guard prove them. An If cannot prove a null `campaign_id`: `payloadString` treats null and a missing key the same, and `comparePasses` does not treat a null column as a match. Case 3 proves the column. The shape guard proves the key. | necessary |
| Door 1 selects the newest ten `campaign_failure` rows for the firm. A decoy with a later `created_at` is how the load walks show the handle is the pointer id. The door stays. `event_write_set` version 1 already names this table at ord 0. The payload is a literal. It does not read that registry. The specimen jsonb fields `attemptN`, `channel`, `to`, `subject`, `reason`, and `lastAttemptAt` stay on `event_test_data`. The live insert does not copy them. | adjacent |
| PKT-004’s change specification says the current `campaign_failure` caller payload is unchanged apart from the forced `anyPass` copy, and its shape guard fails if `dispatchEventToWorkflows` still contains `anyPass`. This packet adds `writes` and `campaign_id` to that caller and does not edit `dispatchEventToWorkflows`. Implementing PKT-004 must not delete `writes` or `campaign_id`. This packet’s shape guard does not require `anyPass` to remain on the walked copy, so the two guards do not deadlock. Acceptance 11 holds because this packet does not edit that function. This packet does not edit `SCP-pkt-004-firing-handle.md`. | adjacent |
| PKT-006 adds other `loadWriteRow` branches and does not add this one. If those branches are already present, leave them. This packet does not edit `SCP-pkt-006-id-keyed-loads.md`. | adjacent |
| Claim 17 specifies the empty-contact audience inside `dispatchEventToWorkflows`. This caller already passes one contact. The book fill does not run for this firing. This packet does not edit that function. | adjacent |
| Packet 023’s spending stop is the exhaust inside `recordCampaignFailure` plus the tick’s `status = 'open'` scan. Exhaustion stops spending and keeps listening. This packet does not retune which attempts the tick picks, and it does not enroll a next class. | adjacent |
| The packet file still says `**Release:** draft`. The ledger stage for this revision was `released` when this wake was authorized, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
