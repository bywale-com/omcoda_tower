# SCP-pkt-009 — An eligibility.changed firing places each inserted id on payload.writes

**Packet:** PKT-009 `pkt-009-eligibility-writes`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 12, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. Claim 10 is the id predicate. Claim 52 is the person split.  
**Contract:** `docs/factory/components/firing-pointers/CONTRACT.md` — claim 12’s eligibility array. `docs/factory/components/walk-handle/CONTRACT.md` — claim 10’s `WHERE id = pointer.id` load. PKT-006 loads `fact_writebacks`, `meeting_booked`, and `wait_occupancy`. This packet loads the four eligibility tables and leaves them out of `PERSON_WRITE_TABLES`.

## Intent

`runContactEligibilityCascade` still loops `opts.contactIds` and still inserts one row of `eligibility_evaluations`, `eligibility_results`, `signals`, and `motion_decisions` per contact, then dispatches `eligibility.changed` once. The dispatch payload gains `writes` for every row that loop inserted.

`event_write_set` version 1 names those four tables at ord 0 through 3. The array follows that table order. Inside one table the pointers follow `opts.contactIds`. One contact yields four pointers: evaluation, result, signal, motion. Two contacts yield both evaluation pointers, then both result pointers, then both signal pointers, then both motion pointers. Each `id` is the variable that insert already binds (`evalId`, `resultId`, `signalId`, `motionId`). Each `contact_id` is the contact of that iteration. `firm_id` stays off the pointer.

The keys already on the payload stay: `{ ...opts.eventPayload, anyPass: true, motion: "reactivation" }`, plus `writes`. `writesFromPayload` gains no reader for `evaluationId`, `resultId`, `signalId`, or `motionId`. With `writes` present it returns those pointers and does not add `contact_records`.

An empty `opts.contactIds` inserts nothing and dispatches `writes: []`. The dispatcher’s empty-list audience branch stays as it is.

The loop does not dedupe `opts.contactIds`. A repeated contact inserts a second quartet, and both ids are on the array. The existing `find` in `resolveOperandText` stays. These four tables stay out of `PERSON_WRITE_TABLES`, so `evalIfPick` does not split them, and a table pick with no contact still reads the first pointer of that table.

`loadWriteRow` gains four branches, each `SELECT * FROM <table> WHERE id = pointer.id`. No `firm_id`, no `contact_id`, no `ORDER BY`, no “latest”. No row with that id returns null. A miss does not try `contact_id`.

The inserted `any_pathway_pass` stays the constant `true`. The motion expression stays `anyPass ? "reactivation" : "nudge"` with `anyPass` fixed true. The payload still sets `anyPass: true` and `motion: "reactivation"`.

The value returned to the caller stays `{ contactId, evaluationId, resultId, signalId, motionId, motion }` per contact. That object is the response. The dispatch does not receive it.

When `dispatched.length === 0`, the reactivation enroll stays. `enrollment`, `active_attempts`, and `engagement_records` from that enroll are not elements of `writes`.

## Must / must-not

- Keep one id per insert. `evalId` is `` `eval-${randomUUID()}` ``, `resultId` is `` `eres-${randomUUID()}` ``, `signalId` is `` `sig-${randomUUID()}` ``, `motionId` is `` `mot-${randomUUID()}` ``. That same string is the `INSERT` id and the pointer `id`. Do not mint a second id for the pointer.
- Keep the loop `for (const contactId of opts.contactIds)`. Do not wrap it in `Set`, `uniqueIds`, or any other dedupe. Inside one iteration the insert order stays evaluation, result, signal, motion, then `cascade.push` of the response object.
- After the loop, and before `dispatchEventToWorkflows`, build `writes` by table, then by loop order inside the table:

```ts
writes: [
  ...evaluations, // { table: "eligibility_evaluations", id: evalId, contact_id: contactId }
  ...results,     // { table: "eligibility_results", id: resultId, contact_id: contactId }
  ...signals,     // { table: "signals", id: signalId, contact_id: contactId }
  ...motions,     // { table: "motion_decisions", id: motionId, contact_id: contactId }
]
```

- The dispatch payload is the existing object plus that array. `contactIds` stays the argument, not a payload key:

```ts
payload: { ...opts.eventPayload, anyPass: true, motion: "reactivation", writes },
contactIds: opts.contactIds,
```

- An empty `opts.contactIds` leaves all four arrays empty. `writes` is `[]`. The dispatch still runs.
- Do not put `firm_id` on a pointer. Do not put `evaluationId`, `resultId`, `signalId`, `motionId`, `evaluation_id`, or `payload.resultId` on a pointer. Do not spread the cascade response object into `writes`. Do not spread `opts.eventPayload` into a pointer.
- Do not put `enrollment`, `active_attempts`, `engagement_records`, `fact_writebacks`, `missing_fact_signals`, `reference_versions`, or `contact_records` on this array.
- Leave the column bindings. `any_pathway_pass` stays the variable `anyPass`, and that variable stays `const anyPass = true`. The motion column stays `const motion = anyPass ? "reactivation" : "nudge"`. The payload’s `motion` stays the string `"reactivation"`. The payload’s `anyPass` stays the boolean `true`.
- Leave the response object. It is still `{ contactId, evaluationId, resultId, signalId, motionId, motion }`. When `dispatched.length === 0`, the enroll loop stays, including the halt push `{ contactId, blocked: "halt", fallback: true }` and the success push `{ contactId, enrollmentId, fallback: true }`.
- Add four `loadWriteRow` branches, as literal SQL, before the final `return null`. Each is `SELECT * FROM <table> WHERE id=$1` bound to `[w.id]`, for `eligibility_evaluations`, `eligibility_results`, `signals`, and `motion_decisions`. No `firm_id`, no `contact_id`, no `ORDER BY`, no `LIMIT`. No row returns null. Do not interpolate the table name. Do not query again by `contact_id` when `rows[0]` is missing. Do not filter `signals` by `kind`. Leave every other branch, including a `fact_writebacks`, `meeting_booked`, `wait_occupancy`, or `engagement_records` branch PKT-006 or PKT-004 may already have added. Do not export `loadWriteRow`. If it is already exported, leave the export.
- Do not add these four names to `PERSON_WRITE_TABLES`. Do not remove a name that is already there. Do not edit `personTableOf`, `evalIfPick`, `personIdsFromWrites`, `pickWrites`, or either `find` in `resolveOperandText`. The find stays `row.contact_id === contactId || row.id === contactId`, then `[0]`. The no-contact arm stays `picked[0]`.
- Do not edit `writesFromPayload`. Do not teach it to read `evaluationId`, `resultId`, `signalId`, or `motionId`.
- Do not edit `localRefFromPayload`. Do not add an `eligibility.changed` case.
- Do not edit `dispatchEventToWorkflows`, including the `anyPass` copy and the empty-list book fill. Stripping `anyPass` is PKT-004. The empty-contact audience is claim 17.
- Do not edit `handleFactWriteback`’s `fact_writebacks` dispatch, `handleContactSeatFacts`’s `fact_writebacks` dispatch, or `handleReferenceUpsert`’s contact fill (`body.contactIds`, else `LIMIT 50`). Those callers already pass `eventPayload` into the cascade. The fact dispatch stays after the cascade returns. The seat cascade call stays inside the answer loop.
- Do not bump `event_write_set`. Do not read `event_write_set` or `event_test_data` to build this payload. Do not edit `eventTest.ts`. Do not edit `handleBoardDetections`. Do not edit `scripts/verify-automations-alive.ts`. Do not edit `enrollAndActuate` or `writeEngagement`.

## Stores and contracts

No new table and no new column. No migration. No new `event_write_set` version.

Each table’s primary key is `id TEXT`. The row already stores `firm_id` and `contact_id`. The result’s `evaluation_id` references the evaluation. That foreign key is a column, not the pointer id.

```306:343:supabase/migrations/004_machine_tables.sql
CREATE TABLE IF NOT EXISTS eligibility_evaluations (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  trigger_kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'done',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS eligibility_results (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT REFERENCES eligibility_evaluations(id) ON DELETE CASCADE,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  any_pathway_pass BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS eligibility_results_contact_idx
  ON eligibility_results (firm_id, contact_id, created_at DESC);

CREATE TABLE IF NOT EXISTS signals (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS motion_decisions (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  motion TEXT NOT NULL CHECK (motion IN ('nudge', 'reactivation', 'none')),
  reason JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

The contact index on `eligibility_results` is the Board scan. It is not the load. `motion` accepts `reactivation`, which is the value the fixed `anyPass` writes.

The registered write-set is already these four tables in this ord. The array is that contract. It is not read at fire time.

```39:42:supabase/migrations/017_event_test_contract.sql
('eligibility.changed', 1, 'eligibility_evaluations', 0),
('eligibility.changed', 1, 'eligibility_results', 1),
('eligibility.changed', 1, 'signals', 2),
('eligibility.changed', 1, 'motion_decisions', 3),
```

The handle type stays. `contact_id` is optional on the type and required on every pointer this firing publishes. The type has no `firm_id`.

```1:6:server/wire-service/runWrites.ts
/** This run’s writes — the next node’s input. Not an events table. */
export type RunWrite = {
  table: string;
  id: string;
  contact_id?: string | null;
};
```

`writesFromPayload` returns when `payload.writes` is an array. It does not continue into `contact_records`. There is no `evaluationId` branch. An element with no string `table` or no string `id` is dropped. Extra keys on the element, including `firm_id`, are not copied.

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

The lines after that array return push `import_batch` and then one `contact_records` pointer per id in `payload.contact_ids` or `payload.contactIds`. Today’s eligibility payload has neither array, so a missing `writes` key yields an empty handle. Adding `writes` is what publishes the quartet. Adding a `contactIds` array on the payload would feed that fallthrough whenever `writes` is absent. This packet does not add that array. The fact and seat callers already put a singular `contactId` on `eventPayload`. That string is not the array the fallthrough reads.

`loadWriteRow` returns null after the tables it already knows. The four eligibility tables are not among them. `const contactId = w.contact_id ?? w.id` stays for the branches that already use it. The new branches do not use `contactId`.

The function begins with the pair loads, continues through `contact_records`, `contact_tag`, `audit_runs`, `import_batch`, and `enrollment`, and ends at the signal branch. The four eligibility tables are not in that list.

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

```691:700:server/wire-service/workflowWalk.ts
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

`PERSON_WRITE_TABLES` does not contain the four names. `personIdsFromWrites` uses `contact_id` when the pointer sets it, so these row ids do not become people while the pointer carries `contact_id`. Membership is what `personTableOf` consults. Leaving the names out keeps `evalIfPick` on the single compare.

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

```848:856:server/wire-service/workflowWalk.ts
function personTableOf(data: Record<string, unknown>, compares: WalkCompare[]): string | null {
  for (const cmp of compares) {
    if (cmp.left.mode !== "chip") continue;
    const table =
      cmp.left.slot === "__legacy" ? String(data.pickTable ?? "") : chipTable(data, cmp.left.slot);
    if (PERSON_WRITE_TABLES.has(table)) return table;
  }
  return null;
}
```

When that table is unset, `evalIfPick` runs one compare with no contact id. A pass sends every `ctx.contactIds` down the true branch. The detail is `branch → true` or `branch → false`, not the person-split `then=` / `else=` string. Do not edit this function.

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

The no-contact arm of `resolveOperandText` reads `picked[0]`. The `find` runs only when a contact id is passed, which is the person-split path these four tables do not take. Both arms stay.

```866:880:server/wire-service/workflowWalk.ts
  if (operand.slot === "__legacy") {
    const pickTable = String(data.pickTable ?? "").trim();
    const pickField = String(data.pickField ?? "").trim();
    const picked = pickWrites(ctx.previousWrites, pickTable);
    const w = contactId
      ? picked.find((row) => row.contact_id === contactId || row.id === contactId) ?? picked[0]
      : picked[0];
    if (!w) return undefined;
    const val = await loadWriteField(pool, ctx.firmId, w, pickField);
    return val == null ? undefined : String(val);
  }
  const writes = mappedSlotWrites(data, ctx, operand.slot) ?? [];
  const w = contactId
    ? writes.find((row) => row.contact_id === contactId || row.id === contactId) ?? writes[0]
    : writes[0];
```

`pickWrites` by table does not depend on cross-table order. The array still follows the registered ord so one firing’s handle matches the write-set.

```254:258:server/wire-service/workflowWalk.ts
function pickWrites(writes: RunWrite[], pickTable?: string, pickId?: string): RunWrite[] {
  if (pickId) return writes.filter((w) => w.id === pickId);
  if (pickTable) return writes.filter((w) => w.table === pickTable);
  return writes;
}
```

`localRefFromPayload` has no `eligibility.changed` branch and returns null. `anyPass`, `motion`, `form_ref`, `campaign_objective_id`, and `referenceId` do not start a local trigger.

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

When no workflow fires, `enrollAndActuate` inserts `enrollment` and `active_attempts`, then `writeEngagement` inserts `engagement_records`, because the cascade omits `fireFirstStep`. A halt returns before those inserts. Those three tables stay off `writes`. This packet does not retune the enroll.

```720:733:server/wire-service/cascade.ts
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, workflow_run_id, payload, campaign_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)`,
    [
      id,
      input.firmId,
      input.contactId,
      input.agentRef,
      sequenceId,
      input.workflowRunId ?? null,
      JSON.stringify(payload),
      campaignId,
    ],
  );
```

```755:768:server/wire-service/cascade.ts
  await pool.query(
    `INSERT INTO active_attempts
       (id, firm_id, contact_id, enrollment_id, owner_channel, status, state, window_started_at, fired_criteria)
     VALUES ($1,$2,$3,$4,$5,'open',$6::jsonb,$7::timestamptz,'{}'::jsonb)`,
    [
      attemptId,
      input.firmId,
      input.contactId,
      id,
      owner,
      JSON.stringify(state),
      now,
    ],
  );
```

```223:237:server/wire-service/cascade.ts
export async function writeEngagement(
  pool: Pool,
  firmId: string,
  contactId: string,
  eventKind: string,
  payload: Record<string, unknown>,
): Promise<string> {
  const id = `eng-${randomUUID()}`;
  await pool.query(
    `INSERT INTO engagement_records (id, firm_id, contact_id, event_kind, payload)
     VALUES ($1,$2,$3,$4,$5::jsonb)`,
    [id, firmId, contactId, eventKind, JSON.stringify(payload)],
  );
  return id;
}
```

## Runtime

The cascade binds the four ids, pushes the response object, then dispatches without `writes`. The enroll runs only when that dispatch returns no rows.

```289:349:server/wire-service/machine.ts
  for (const contactId of opts.contactIds) {
    const evalId = `eval-${randomUUID()}`;
    await pool.query(
      `INSERT INTO eligibility_evaluations (id, firm_id, contact_id, trigger_kind, status)
       VALUES ($1,$2,$3,$4,'done')`,
      [evalId, opts.firm, contactId, opts.triggerKind],
    );
    const resultId = `eres-${randomUUID()}`;
    const anyPass = true;
    await pool.query(
      `INSERT INTO eligibility_results (id, evaluation_id, firm_id, contact_id, result, any_pathway_pass)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6)`,
      [
        resultId,
        evalId,
        opts.firm,
        contactId,
        JSON.stringify({ trigger: opts.triggerKind, ...opts.resultPayload }),
        anyPass,
      ],
    );
    const signalId = `sig-${randomUUID()}`;
    await pool.query(
      `INSERT INTO signals (id, firm_id, contact_id, kind, payload)
       VALUES ($1,$2,$3,'eligibility_determination',$4::jsonb)`,
      [signalId, opts.firm, contactId, JSON.stringify({ resultId, anyPass })],
    );
    const motion = anyPass ? "reactivation" : "nudge";
    const motionId = `mot-${randomUUID()}`;
    await pool.query(
      `INSERT INTO motion_decisions (id, firm_id, contact_id, motion, reason)
       VALUES ($1,$2,$3,$4,$5::jsonb)`,
      [motionId, opts.firm, contactId, motion, JSON.stringify({ signalId, precedence: "mp-1" })],
    );
    cascade.push({
      contactId,
      evaluationId: evalId,
      resultId,
      signalId,
      motionId,
      motion,
    });
  }

  const dispatched = await dispatchEventToWorkflows(pool, {
    firmId: opts.firm,
    eventName: "eligibility.changed",
    payload: { ...opts.eventPayload, anyPass: true, motion: "reactivation" },
    contactIds: opts.contactIds,
  });

  if (dispatched.length === 0) {
    for (const contactId of opts.contactIds) {
      const enrolled = await enrollAndActuate({
        firmId: opts.firm,
        contactId,
        agentRef: "tpl.reactivation.v1",
        sequenceId: "tpl.reactivation.v1",
        payload: { faceless: true, fallback: true, trigger: opts.triggerKind },
        purpose: "reactivation",
      });
```

Collect the four pointer lists during that same loop. Add `writes` on that one dispatch. Leave the inserts, the response push, the `contactIds` argument, and the enroll block in that order. One dispatch carries every contact. Do not dispatch inside the loop.

The fact caller passes the fact scalars, including `contactId`, and dispatches `fact_writebacks` only after the cascade returns. That second payload does not gain this quartet.

```475:500:server/wire-service/machine.ts
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

The seat caller does the same inside the answer loop. Its cascade `eventPayload` has `contactId` and no `firm_id`. Its later `fact_writebacks` payload has `firm_id`. Do not copy `firm_id` onto the cascade payload.

```586:611:server/wire-service/contactSeat.ts
    await runContactEligibilityCascade({
      firm: resolved.link.firm_id,
      contactIds: [resolved.link.contact_id],
      triggerKind: "fact_writeback",
      resultPayload: { writebackId: writeId, fieldKey, source: "contact_workspace" },
      eventPayload: {
        writebackId: writeId,
        fieldKey,
        contactId: resolved.link.contact_id,
        form_ref: stamp.formRef,
        campaign_objective_id: stamp.campaignObjectiveId,
      },
    });
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
```

The reference caller passes `{ referenceId: id }` and the body’s `contactIds`, or up to 50 contact ids when the body omits them. Do not change that fill. `reference_versions` stays off `writes`.

```387:402:server/wire-service/machine.ts
  const contacts =
    body.contactIds ??
    (
      await pool.query<{ id: string }>(
        `SELECT id FROM contact_records WHERE firm_id=$1 LIMIT 50`,
        [firm],
      )
    ).rows.map((r) => r.id);

  const { cascade, workflowsFired } = await runContactEligibilityCascade({
    firm,
    contactIds: contacts,
    triggerKind: "reference_version",
    resultPayload: { refId: id },
    eventPayload: { referenceId: id },
  });
```

`dispatchEventToWorkflows` copies the caller payload onto the walk and also sets `eventName` and `anyPass`. This packet does not change that copy. `writesFromPayload` reads `writes` and ignores those two keys. When `contactIds` is empty and the audience is the whole firm, the dispatcher loads every `contact_records` id for the firm onto the walk. That list is not `writes`. This packet does not change that branch.

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

The walk does not store `triggerPayload`. It stores `writesFromPayload`’s output on the trigger node. That stored array is the handle this packet proves.

```1091:1095:server/wire-service/workflowWalk.ts
  let contactIds = opts.contactIds ?? [];
  const triggerWrites = writesFromPayload(opts.triggerPayload);
  if (!contactIds.length) {
    contactIds = personIdsFromWrites(triggerWrites);
  }
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

`node_status` is written onto `workflow_run` at the end of the walk. The verify reads that column. `counts.contacts` is `ctx.contactIds.length`, which for an empty caller list is the book size, not the length of `writes`.

```1667:1682:server/wire-service/workflowWalk.ts
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

Door 1 for this event still takes the newest eight evaluations for the firm and the related result, signal, and motion rows. That reader is not the run handle.

```134:159:server/wire-service/eventTest.ts
    if (eventName === "eligibility.changed") {
      const evals = await pool.query(
        `SELECT * FROM eligibility_evaluations WHERE firm_id=$1 ORDER BY created_at DESC LIMIT 8`,
        [firm],
      );
      if (!evals.rowCount) return null;
      out.push(...toWrites("eligibility_evaluations", evals.rows as Record<string, unknown>[]));
      const evalIds = evals.rows.map((row) => row.id);
      const results = await pool.query(
        `SELECT * FROM eligibility_results WHERE firm_id=$1 AND evaluation_id = ANY($2::text[])`,
        [firm, evalIds],
      );
      out.push(...toWrites("eligibility_results", results.rows as Record<string, unknown>[]));
      const contactIds = [...new Set(evals.rows.map((row) => row.contact_id))];
      const signals = await pool.query(
        `SELECT * FROM signals WHERE firm_id=$1 AND contact_id = ANY($2::text[]) AND kind='eligibility_determination' ORDER BY created_at DESC`,
        [firm, contactIds],
      );
      out.push(...toWrites("signals", signals.rows as Record<string, unknown>[]));
      const motions = await pool.query(
        `SELECT * FROM motion_decisions WHERE firm_id=$1 AND contact_id = ANY($2::text[]) ORDER BY created_at DESC`,
        [firm, contactIds],
      );
      out.push(...toWrites("motion_decisions", motions.rows as Record<string, unknown>[]));
      return out;
    }
```

The Board still takes the newest row per contact. That reader is not this load.

```739:753:server/wire-service/machine.ts
      `SELECT DISTINCT ON (contact_id) *
       FROM eligibility_results WHERE firm_id=$1
       ORDER BY contact_id, created_at DESC`,
      [firm],
    ),
    pool.query(
      `SELECT DISTINCT ON (contact_id) *
       FROM signals WHERE firm_id=$1
       ORDER BY contact_id, created_at DESC`,
      [firm],
    ),
    pool.query(
      `SELECT DISTINCT ON (contact_id) *
       FROM motion_decisions WHERE firm_id=$1
       ORDER BY contact_id, created_at DESC`,
```

The If detail when these tables are not in the set is `branch → ${ctx.branchTaken}`.

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

## Ports

No new port.

These stay on the same functions:

- `runContactEligibilityCascade`. Same arguments. The `eligibility.changed` payload gains `writes`. `contactIds` stays `opts.contactIds`.
- `POST /machine/fact-writebacks` → `handleFactWriteback`. The body stays `contactId`, `fieldKey`, `value`, optional `source`, `missingFieldKeys`, and `formRef`. The cascade `eventPayload` stays the fact scalars. The `fact_writebacks` dispatch stays after the cascade and does not gain this quartet.
- `POST /contact-seat/:token/facts` and `POST /machine/contact-workspaces/:contactId/facts` → `handleContactSeatFacts`. The cascade call stays inside the answer loop, once per non-blank `fieldKey`.
- `POST /machine/reference` → `handleReferenceUpsert`. `eventPayload` stays `{ referenceId: id }`. The contact list stays the body list or the `LIMIT 50` fill.
- `dispatchEventToWorkflows` for `eligibility.changed`. Same `firmId`. Same `contactIds`. The payload gains `writes`.
- `loadWriteRow` gains four branches. It is not an HTTP route.
- `writesFromPayload` and `localRefFromPayload`. Unchanged readers.
- `enrollAndActuate` when the dispatch returns no workflows. Same `tpl.reactivation.v1` arguments.

```182:182:server/wire-service/routes.ts
  wire.post("/machine/reference", handleReferenceUpsert);
```

```221:222:server/wire-service/routes.ts
  wire.post("/machine/fact-writebacks", handleFactWriteback);
  wire.get("/machine/fact-writebacks", handleFactWritebacksList);
```

```241:241:server/wire-service/routes.ts
  wire.post("/machine/contact-workspaces/:contactId/facts", handleContactSeatFacts);
```

```262:262:server/wire-service/routes.ts
  wire.post("/contact-seat/:token/facts", handleContactSeatFacts);
```

The machine fact response still begins its `cascade` array with `{ table: "fact_writebacks", id: writeId }` and then the cascade return. The reference response still begins with `{ table: "reference_versions", id }`. Neither prefix is this firing’s `writes`. The seat response stays `projectSeat`.

## Verify

`scripts/verify-eligibility-writes.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` after migrate and seed, beside `verify-click-attribution`. `npm run build` is not this proof.

The script uses `getPool()` the way `scripts/verify-click-attribution.ts` does. Firm id is `firm-pkt009-` plus a run token. A second firm id, `firm-pkt009-enroll-` plus that token, is the no-listener enroll case. Neither firm is the seeded Harbor firm. The script sets `AUTH_DISABLED=true` and `DEV_SESSION_FIRM` to the first firm before the machine fact and reference calls, and it does not send `x-firm-id`. It does not set send mode to live. The Hono stub returns `{ body, status }` from `json`, returns the posted body from `req.json`, and returns empty strings from `req.query` and `req.header`. `getCookie` sees no session cookie (`req.raw.headers` is a `Headers` when the cookie helper needs it).

It inserts its own `ct_firms` (`name` required) and `contact_records` rows. It inserts `workflow` (`target` `contact`), `workflow_state` (`active`), and calls `materializeTriggersFromGraph`. It deletes the rows it inserts, by these firm ids: `workflow_run`, `engagement_records`, `active_attempts`, `enrollment`, `motion_decisions`, `signals`, `eligibility_results`, `eligibility_evaluations`, `reference_versions`, `fact_writebacks`, `missing_fact_signals`, `workflow_trigger`, `workflow_state`, `workflow`, `contact_records`, `ct_firms`. `reference_versions.firm_id` is null on the planted insert, so delete that row by the id the reference call returns, not by firm.

Graphs for the listener are a trigger plus an `exit`, with an edge from the trigger to the exit. `isValidatedPipeline` accepts that. Trigger `data.triggerKind` is `"event"`. `data.triggerEvent` is `"eligibility.changed"`. `data.configured` is not `false`. One listener is global. One listener on the same firm is local: `data.grain` is `"local"` and `data.localRef` is `"not-an-eligibility-axis"`. A payload with no `eligibility.changed` case in `localRefFromPayload` does not start that run.

The empty-list case runs before any `contact_records` row exists for the listener firm, so the dispatcher’s book fill has nothing to copy. Later cases insert the contacts.

The load walks call `walkValidatedWorkflow` directly. `loadWriteRow` stays unexported. Each graph is a trigger plus an `if` plus an `exit`. The If uses the legacy pick: `pickTable`, `pickField`, `pickOp` `"eq"`, `pickValue`. `configured` is not `false`. `contactIds` on that walk is one contact. Trigger `payload.writes` is the pointer list the case states. The If detail is `branch → true` or `branch → false`, because these tables are not in `PERSON_WRITE_TABLES`. A detail of `if pick … then=` means the set was changed, and that case fails.

Columns the load walks compare:

- `eligibility_evaluations.trigger_kind`, passing text `"keep"`, decoy `"decoy"`. `status` stays `"done"`.
- `eligibility_results.any_pathway_pass`. `String(true)` is `"true"`. The passing row is `true`. The decoy is `false`. Insert a parent `eligibility_evaluations` row first. The pointer `id` is the result id, not `evaluation_id`.
- `signals.kind`, passing text `"keep"`, decoy `"decoy"`.
- `motion_decisions.motion`, passing text `"reactivation"`, decoy `"nudge"`. The check constraint allows both.

1. One contact, direct `runContactEligibilityCascade`, `triggerKind` `"fact_writeback"`, `eventPayload` `{ writebackId, fieldKey, contactId, form_ref, campaign_objective_id }`. The global listener’s trigger `writes` has length 4, in the order evaluation, result, signal, motion. Each `id` equals the row with that id, and equals `cascade[0].evaluationId`, `resultId`, `signalId`, or `motionId`. Each `contact_id` is that contact. The evaluation `trigger_kind` is `fact_writeback` and `status` is `done`. The result `any_pathway_pass` is true and `evaluation_id` is the evaluation id. The signal `kind` is `eligibility_determination` and `payload.resultId` is the result id. The motion `motion` is `reactivation` and `reason.signalId` is the signal id. `counts.contacts` is 1. No element has table `enrollment`, `active_attempts`, `engagement_records`, `contact_records`, `fact_writebacks`, `missing_fact_signals`, or `reference_versions`. No element has `firm_id`. The local listener has no new run. This contact has no `enrollment` row. `workflowsFired` has length 1. `cascade[0]` has `contactId`, `evaluationId`, `resultId`, `signalId`, `motionId`, and `motion`, and has no `table` key.
2. Two contacts in order `[a, b]`. Eight pointers: both evaluations in that order, then both results, then both signals, then both motions. `counts.contacts` is 2. Each pointer’s `contact_id` is the contact of that slot. One dispatch, one new global run.
3. `contactIds: []` on the listener firm while that firm has no `contact_records`. No new row of the four tables. One new global run. Trigger `writes` is `[]`. `counts.contacts` is 0. `cascade` is `[]`. `workflowsFired` has length 1. The book fill ran and copied nobody. This case does not delete the listener and does not change the dispatcher.
4. The scalar keys are the shape guard below. The walk does not store `triggerPayload`. Case 1 passed the fact keys through `eventPayload`. A second direct call passes `eventPayload: { referenceId }` and one contact. That run’s `writes` is still the quartet for that contact. `referenceId` is not a pointer. The shape guard is the proof the spread, `anyPass: true`, and `motion: "reactivation"` remain on the one payload expression.
5. `writesFromPayload` of `{ writes: the four pointers, contactIds: [contact], evaluationId, resultId, signalId, motionId }` returns those four pointers in that order and does not add `contact_records`. `writesFromPayload` of `{ evaluationId, resultId, signalId, motionId, contactId }` with no `writes` array returns no eligibility pointer and no `contact_records` pointer.
6. Case 1’s returned object is the proof the caller still receives `evaluationId`, `resultId`, `signalId`, and `motionId`. The listener’s `writes` use `table` and `id`. The return object is not copied onto the dispatch.
7. On the enroll firm, no `workflow` and no `workflow_trigger`. One `contact_records` row with an email. No `halt_records`. One cascade call with that contact. The return includes the id object and `{ contactId, enrollmentId, fallback: true }`. `enrollmentId` starts with `enr-` and equals `SELECT id FROM enrollment` for that contact. One `active_attempts` row and one `engagement_records` row exist for that contact. The engagement `event_kind` is `send_dry_run` while send mode is not live. No `workflow_run` exists for that firm. The four eligibility rows exist. Their ids are not stored on a run. The shape guard is the proof `writes` does not name `enrollment`, `active_attempts`, or `engagement_records`.
8. Four hit walks and four miss walks, one table each. Hit: the pointer id exists and the column equals the passing text. A decoy for the same contact has a different id, the failing text, and `created_at` one day ahead. The If detail is `branch → true`. Miss: `writes[0].id` is absent. A row for that contact exists with the passing text and a different id. The If detail is `branch → false`. A loader that selected by `contact_id`, or by latest `created_at`, fails the hit or the miss.
9. Two pointers of one table, same contact, first column the passing text, second the failing text. A walk whose `pickValue` is the passing text has `branch → true`. A walk whose `pickValue` is the failing text has `branch → false`. That is `picked[0]`. `PERSON_WRITE_TABLES` does not contain the four names, so the detail is not `if pick … then=`.
10. `contactIds: [c, c]`. Eight rows, two per table. `writes` has length 8. Within each table the first pointer is the first iteration and the second pointer is the second. Both ids are present. The two evaluation ids differ. The `find` text in `resolveOperandText` stays. This case does not put the four tables in the set in order to exercise that `find`.

One `POST /machine/fact-writebacks` with `contactId` and `fieldKey` `"keep"`. The eligibility listener’s new run has `writes` length 4 for that contact. The `fact_writebacks` listener, if present on this firm, has a new run whose `writes` contain none of the four eligibility tables. If that run’s `writes` has length 1, the table is `fact_writebacks` and the id is `body.writebackId`. Length 0 is the tree before PKT-007. Do not require length 0. Do not require length 1. The fact response `cascade[0]` is still `{ table: "fact_writebacks", id: body.writebackId }`. No eligibility pointer on that response object is required. The eligibility rows are on the eligibility run.

One `POST /machine/reference` with `key`, `payload`, and `contactIds` of two contacts. One new global eligibility run. `writes` has length 8 in table order. No element has table `reference_versions`. The returned `referenceId` is the `reference_versions` row. The body’s contact list is the list the cascade received. This case does not omit `contactIds`, so the `LIMIT 50` fill does not run.

`npm run factory:check` reads `runContactEligibilityCascade` and fails unless the `eligibility.changed` payload expression contains `...opts.eventPayload`, `anyPass: true`, `motion: "reactivation"`, and `writes`. It fails unless `contactIds: opts.contactIds` is the dispatch argument. It fails unless `const anyPass = true` and `anyPass ? "reactivation" : "nudge"` remain. It fails unless the loop is `for (const contactId of opts.contactIds)`. It fails if that payload object contains `firm_id`, `contactIds`, `contact_ids`, `evaluationId`, `resultId`, `signalId`, or `motionId`. It fails if the `writes` construction contains `enrollment`, `active_attempts`, `engagement_records`, `fact_writebacks`, `missing_fact_signals`, `reference_versions`, or `contact_records`. It fails if the pointer `id` for a table is not the insert’s `evalId`, `resultId`, `signalId`, or `motionId`. It fails if a check already in this file fails because that payload expression contains `writes`: replace that refusal with this requirement. It reads `handleFactWriteback` and fails if the `fact_writebacks` payload object contains `eligibility_evaluations`, `eligibility_results`, `signals`, or `motion_decisions`, and fails if the cascade `eventPayload` loses `writebackId`, `fieldKey`, `contactId`, `form_ref`, or `campaign_objective_id`. It reads `handleContactSeatFacts` and fails unless `runContactEligibilityCascade` stays inside the answer loop, and fails if that cascade `eventPayload` loses those same keys or gains `firm_id`. It reads `handleReferenceUpsert` and fails if `eventPayload` loses `referenceId`, and fails if the `LIMIT 50` contact fill is removed. It reads `writesFromPayload` and fails if that function contains `evaluationId`, `resultId`, `signalId`, or `motionId`. It reads `localRefFromPayload` and fails if that function contains `eligibility.changed`. It reads `loadWriteRow` and fails unless it contains `SELECT * FROM eligibility_evaluations WHERE id=$1`, `SELECT * FROM eligibility_results WHERE id=$1`, `SELECT * FROM signals WHERE id=$1`, and `SELECT * FROM motion_decisions WHERE id=$1`, and fails if any of those four statements contains `firm_id`, `contact_id`, `ORDER BY`, or `LIMIT`. It fails unless the function still ends at `return null`. It reads `PERSON_WRITE_TABLES` and fails if the set contains `eligibility_evaluations`, `eligibility_results`, `signals`, or `motion_decisions`. It reads `resolveOperandText` and fails if either `find` drops `row.contact_id === contactId || row.id === contactId`. It does not assert on `anyPass` inside `dispatchEventToWorkflows`. It does not require or forbid the book-fill query. Add `server/wire-service/machine.ts`, `server/wire-service/workflowWalk.ts`, `server/wire-service/runWrites.ts`, and `scripts/verify-eligibility-writes.ts` to the path filter in `.github/workflows/factory-check.yml`. `server/wire-service/contactSeat.ts` is already listed.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

`handleBoardDetections`. Door 1’s newest-eight specimen in `eventTest.ts`. `scripts/verify-automations-alive.ts`. Stripping `anyPass` from `dispatchEventToWorkflows` (PKT-004). Adding `fact_writebacks`, `missing_fact_signals`, or `reference_versions` to this array. The fact array (PKT-007) and the meeting array (PKT-008). The id loads and the person-split membership for `fact_writebacks`, `meeting_booked`, and `wait_occupancy` (PKT-006). Claim 52’s membership for these four tables. Claim 17’s empty-contact audience. Claim 43’s enroll, beyond leaving the current call in place. Claim 60’s pathway boolean and `pathways` array. The `LIMIT 50` reference fill, beyond leaving it in place. Launch Agent. No plate. `src/`.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `eligibility.changed` payload | Gains `writes` in write-set order. Scalars stay. `anyPass: true` and `motion: "reactivation"` stay | `dispatchEventToWorkflows`, `writesFromPayload`, trigger `node_status.writes` | Modified |
| Four insert ids | Same `eval-`, `eres-`, `sig-`, `mot-` bindings. Those strings are the pointer ids | Inserts, cascade return, trigger `writes` | Modified |
| `eligibility_evaluations`, `eligibility_results`, `signals`, `motion_decisions` | Same primary key `id`. No new column. `any_pathway_pass` stays true. `motion` stays `reactivation` | `loadWriteRow`, Board, door 1 | Only verified |
| `loadWriteRow` | Four branches, `WHERE id=$1` bound to `w.id`. Other branches stay | If field reads of these tables | Modified |
| `PERSON_WRITE_TABLES` | Unchanged. These four names stay out | `personTableOf`, `evalIfPick`, `personIdsFromWrites` | Only verified |
| `evalIfPick`, `resolveOperandText` | Unchanged. No split. No-contact pick is `picked[0]`. The `find` stays | If detail `branch →` | Only verified |
| `writesFromPayload` | Unchanged. `payload.writes` is the handle. No scalar-id reader | Every trigger, including this event | Only verified |
| `localRefFromPayload` | Unchanged. No `eligibility.changed` case | Local eligibility listener | Only verified |
| `dispatchEventToWorkflows` | Unchanged. Still copies payload, sets `eventName` and `anyPass`, and fills an empty list from the firm book | Eligibility listener `node_status` | Only verified |
| Cascade return | Still `{ contactId, evaluationId, resultId, signalId, motionId, motion }` per contact | Fact and reference HTTP `cascade` | Only verified |
| Fact and seat `fact_writebacks` dispatch | Unchanged. The quartet is not on that payload. Seat call stays inside the answer loop | Fact listener | Only verified |
| Reference contact fill | Unchanged. Body `contactIds`, else `LIMIT 50` | `POST /machine/reference` | Only verified |
| Enroll fallback | Still runs when `dispatched.length === 0`. Those three tables stay off `writes` | `enrollment`, `active_attempts`, `engagement_records` | Only verified |
| `event_write_set` `eligibility.changed` v1 | Already ord 0–3 for the four tables. Not read at fire time | Live payload literal | Only verified |
| `eventTest.ts` door 1, `handleBoardDetections` | Still newest-by-contact readers | Test door, Board | Only verified |
| `scripts/verify-eligibility-writes.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases and the shape guard | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| The cascade dispatch omits `writes`, so `writesFromPayload` returns no pointer and the trigger handle is empty. The four ids are already bound on the inserts. Those same strings are the pointer ids. A second `randomUUID()` would publish a pointer that matches no row. The array is built after the loop, in table order, so two contacts group by table. Insert order inside one contact stays evaluation, result, signal, motion. | necessary |
| `writesFromPayload` returns the array and then stops. It does not read `evaluationId`, `resultId`, `signalId`, or `motionId`. A reader for those scalars would invent pointers when `writes` is absent, which case 5 forbids. The cascade return uses those key names and is not the dispatch argument. The payload must not gain `contactIds`, or a missing `writes` array would publish `contact_records`. The fact and seat `eventPayload` already carry singular `contactId`. That string does not feed the fallthrough. | necessary |
| `loadWriteRow` returns null for these four tables. Each primary key is already `id`. The load is `WHERE id=$1` on `w.id`. A second query by `contact_id`, or `firm_id` / `ORDER BY` on that statement, is a different predicate than claim 10. The result’s `evaluation_id` and the signal’s `payload.resultId` stay columns. They are not the pointer id. Other branches in the function stay, including any PKT-004 or PKT-006 branch already present. The function stays unexported unless an earlier packet exported it. | necessary |
| `PERSON_WRITE_TABLES` omits the four names. `evalIfPick` then runs one compare and, on a pass, sends every `ctx.contactIds` down the true branch. The detail is `branch → true` or `branch → false`. The no-contact arm reads `picked[0]`. Adding the names would person-split this firing. Claim 52 is that split. This packet does not add the names, and it does not retune the `find`. | necessary |
| The fact dispatch and the seat fact dispatch run after the cascade returns. Their payloads do not list these four tables. Putting the quartet on those payloads would make the fact firing carry rows that belong to `eligibility.changed`. The seat cascade call is inside the answer loop, so each answer is its own quartet. Moving that call outside the loop would collapse two answers onto one firing. | necessary |
| `dispatchEventToWorkflows` still forces `anyPass: true` after the spread, and on an empty `contactIds` it fills the walk from `contact_records` for the firm. `writesFromPayload` does not read `anyPass`. An empty `writes` array stays empty when the book fills the person list. Removing the flag is PKT-004. Specifying the audience branch is claim 17. This packet does not edit that function. The caller payload still sets `anyPass: true`, so the field remains if the forced copy is later removed. The empty-list verify uses a firm with no contacts, so `counts.contacts` is 0 and `writes` is `[]`. | necessary |
| When `dispatched.length === 0`, `enrollAndActuate` inserts `enrollment` and `active_attempts`, and `writeEngagement` inserts `engagement_records`, because `fireFirstStep` is omitted. Those rows exist only when no listener ran, so no trigger `writes` holds them. The `writes` array is assembled before that call and names only the four tables. A halt still returns before the inserts. The enroll call stays. Claim 43 specifies the enroll. This packet does not edit `enrollAndActuate`. | necessary |
| `localRefFromPayload` has no `eligibility.changed` branch and returns null. Keeping `form_ref`, `campaign_objective_id`, `referenceId`, `anyPass`, and `motion` does not start a local trigger. Adding a case would make the local listener in case 1 start. The scalars stay because the packet keeps them. The shape guard is the proof they remain. The walk does not store them. | necessary |
| Door 1 selects the newest eight evaluations and the signals and motions of those contacts, not the ids this loop bound. `handleBoardDetections` selects `DISTINCT ON (contact_id) … created_at DESC`. Both stay. A decoy with a later `created_at` is how the load walks show the handle is the pointer id. | adjacent |
| PKT-006 adds other `loadWriteRow` branches and other `PERSON_WRITE_TABLES` names, and its shape guard fails if these four names are in the set. It also says to leave these four branches if they are already present. This packet adds the branches and does not add the names. If PKT-006’s branches are already present, leave them. This packet does not edit `SCP-pkt-006-id-keyed-loads.md`. | adjacent |
| PKT-007’s change specification tells `factory-check` to fail if the `eligibility.changed` payload expression contains `writes`, and tells its verify to expect that listener’s `writes` to be `[]`. That freeze kept PKT-007 from planting this array. The Architect’s PKT-007 text says the quartet belongs on `eligibility.changed`. This packet is that array. A refusal of `writes` on this payload contradicts this packet and is replaced by the requirement above. `scripts/verify-fact-writes.ts` is not on this tree. Do not create it. If it is present and requires an empty eligibility handle, change that assertion to this quartet. Do not otherwise retune the fact cases. This packet does not edit `SCP-pkt-007-fact-writes.md`. The fact payload still must not contain the four table names. | necessary |
| PKT-004 removes the forced `anyPass` copy inside `dispatchEventToWorkflows` and leaves the caller’s `anyPass: true` in place. This packet does not edit that function and does not strip the caller field. Implementing PKT-004 must not delete this `writes` array. This packet does not edit `SCP-pkt-004-firing-handle.md`. | adjacent |
| Claim 52 adds these four tables to the set `evalIfPick` consults. Until that packet, a two-contact firing does not split, and the If reads the first pointer of the named table. This packet’s load proof expects `branch →`. A later packet that adds the names will change that detail. This packet does not implement that split. | adjacent |
| The reference route still selects up to 50 contacts when the body omits `contactIds`. The order proof passes an explicit list. The `LIMIT 50` fill stays. Claim 17 specifies the dispatcher’s empty audience. This packet’s empty `opts.contactIds` is a different input: the caller passed `[]`, and `writes` is `[]`. | adjacent |
| The packet file still says `**Release:** draft`. The ledger stage for this revision was `released` when this wake was authorized, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
