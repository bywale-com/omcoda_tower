# SCP-pkt-004 — An objective_met listener starts from this firing’s rows

**Packet:** PKT-004 `pkt-004-firing-handle`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 7 at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. Claim 11’s `objective_met` array is the two pointers this firing publishes. Claim 10’s id predicate applies to `engagement_records` only.  
**Contract:** `docs/factory/components/walk-handle/CONTRACT.md`

## Intent

Hearing `objective_met` creates a new `workflow_run`. That run’s trigger handle is this firing’s write-set: the `engagement_records` row just inserted, then the same `enrollment` row after `campaign_id` flips. Both pointers carry that enrollment’s `contact_id`. The engagement id is one `eng-` plus uuid, stored on the row and on `writes[0]`. A return before a committed flip does not dispatch. `dispatchEventToWorkflows` does not set `anyPass`. `loadWriteRow` loads `engagement_records` by `pointer.id`.

## Must / must-not

- Hold the new engagement id in one variable, `` `eng-${randomUUID()}` ``, and pass that same string to the `INSERT` and to `writes[0].id`. Do not build the id only inside the query parameter list.
- After the flip commits (`flipped.rowCount`), insert one `engagement_records` row and dispatch `objective_met` with this payload, in this order. The scalar keys stay. `writes` is new:

```ts
payload: {
  campaign_objective_id: obj.id,
  campaign_id: currentCampaignId,
  sequence_id: row.sequence_id,
  enrollment_id: row.id,
  contact_id: row.contact_id,
  kind: obj.kind,
  completion_table: completionTable,
  completion_id: completionId,
  writes: [
    { table: "engagement_records", id: engagementId, contact_id: row.contact_id },
    { table: "enrollment", id: row.id, contact_id: row.contact_id },
  ],
}
```

`contactIds` stays `[row.contact_id]`. `campaign_id` on the payload is the campaign that cleared. `next` is the enrollment cursor after the flip. It is not a third pointer.

- The engagement row’s `payload` jsonb stays the object already inserted: `enrollmentId`, `sequenceId`, `campaignId` (the campaign that cleared), `campaignObjectiveId`, `kind`, `completionTable`, `completionId`, `nextCampaignId`.
- The returns before the `UPDATE`, and the return when `flipped.rowCount` is 0, insert nothing and dispatch nothing.
- Do not insert an `enrollment` row. `writes[1].id` is the enrollment id already loaded.
- Do not add `firm_id`, the row body, or the completion row onto a pointer. The completion id stays the scalar `completion_id`.
- Do not put `contact_ids` or `contactIds` on this payload. `contact_id` singular stays.
- Do not teach `writesFromPayload` to read `enrollment_id`, `completion_id`, or `contact_id`. When `payload.writes` is an array, that function already returns those pointers and does not continue into the contact-id loop.
- In `dispatchEventToWorkflows`, the walk payload is the caller payload plus `eventName`. Do not set `anyPass`. Do not delete `anyPass`. A caller that already set the field keeps the value it set. A payload without the field does not gain it.
- Add one `loadWriteRow` branch: `SELECT * FROM engagement_records WHERE id=$1` with `[w.id]`. No `firm_id`, no `contact_id`, no `ORDER BY`, no `LIMIT`, no `event_kind`. No row returns null. Leave the `enrollment` branch as it is. Leave the final `return null`. Do not export `loadWriteRow`.
- Do not read `event_write_set` or `event_test_data` to build this payload. The planted ords are the contract the literal array satisfies. The harbor specimen rows are not this firing.
- Do not call `evalBranch` from the live `if` path, and do not change `evalIfPick`. The flag change is the copy in `dispatchEventToWorkflows`.

## Stores and contracts

No new table and no new column. No new `event_write_set` version.

`engagement_records.id` is `TEXT PRIMARY KEY`.

```357:364:supabase/migrations/004_machine_tables.sql
CREATE TABLE IF NOT EXISTS engagement_records (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  event_kind TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`enrollment.id` is `TEXT PRIMARY KEY` (`004_machine_tables.sql`). `campaign_id` is a nullable cursor (`010_sequence_campaign_housing.sql`: `ALTER TABLE enrollment ADD COLUMN IF NOT EXISTS campaign_id TEXT REFERENCES campaign(id) ON DELETE SET NULL`). The last campaign flips that column to NULL. `pursuit_state` stays the column `022_pursuit_exhausted.sql` already added. This packet does not change it.

The registered write-set for this event is already ord 0 then ord 1:

```26:28:supabase/migrations/021_objective_local_axis.sql
INSERT INTO event_write_set (event_name, version, table_name, ord) VALUES
('objective_met', 1, 'engagement_records', 0),
('objective_met', 1, 'enrollment', 1)
```

The handle is `RunWrite`. `contact_id` is optional on the type and required on both pointers this firing publishes.

```1:6:server/wire-service/runWrites.ts
/** This run’s writes — the next node’s input. Not an events table. */
export type RunWrite = {
  table: string;
  id: string;
  contact_id?: string | null;
};
```

`writesFromPayload` already prefers `payload.writes`. It does not read `enrollment_id`. It builds `contact_records` pointers only from `contact_ids` / `contactIds`, and only when `writes` is not an array. This payload has `contact_id` singular, so that loop does not run once `writes` is present.

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

The rest of the function, lines 28–42, runs only when `writes` is not an array. It pushes `import_batch` from `import_batch_id` / `importBatchId`, then one `contact_records` pointer per id in `contact_ids` or `contactIds`. It never reads `enrollment_id` or singular `contact_id`.

`loadWriteRow` already loads `enrollment` by primary key and returns null for a table it does not know. `engagement_records` falls through to that null.

```691:699:server/wire-service/workflowWalk.ts
  if (w.table === "enrollment") {
    const { rows } = await pool.query(`SELECT * FROM enrollment WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  if (w.table === "missing_fact_signals") {
    const { rows } = await pool.query(`SELECT * FROM missing_fact_signals WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  return null;
```

The new branch sits beside the enrollment branch and uses the same shape: `SELECT * FROM engagement_records WHERE id=$1` bound to `w.id`.

Walk-handle claim 7 is this packet. Claim 11’s fact and meeting arrays stay unpacketed. Claim 10’s loads of `fact_writebacks`, `meeting_booked`, and `wait_occupancy` stay unpacketed. Pursuit identity decides which enrollment a completion advances. This packet carries the enrollment id `advanceEnrollmentCampaign` was given. It does not change PKT-001’s click match.

`workflow_run` is the run `dispatchEventToWorkflows` inserts. `node_status[trigger].writes` is the trigger handle the verify reads. The trigger visit stores `ctx.previousWrites`, which the walk set from `writesFromPayload`.

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

## Runtime

`advanceEnrollmentCampaign` loads the enrollment by id. These returns happen before the flip. They already skip the insert and the dispatch. They stay that way:

```828:834:server/wire-service/campaignHousing.ts
  if (!row?.sequence_id || !row.campaign_id) {
    return { advanced: false, campaignId: row?.campaign_id ?? null };
  }
  const obj = await loadObjectiveForCampaign(pool, row.campaign_id);
  if (!obj) return { advanced: false, campaignId: row.campaign_id };
  const sat = await objectiveSatisfiedBy(pool, row, obj);
  if (!sat.ok) return { advanced: false, campaignId: row.campaign_id };
```

The flip is one `UPDATE` of that enrollment’s `campaign_id` to `next`, which is null on the last campaign. A compare-and-set that changes no row returns before the insert:

```845:847:server/wire-service/campaignHousing.ts
  if (!flipped.rowCount) {
    return { advanced: false, campaignId: next };
  }
```

Today the id is minted inside the parameter list, and the dispatch payload has no `writes`:

```851:895:server/wire-service/campaignHousing.ts
  await pool.query(
    `INSERT INTO engagement_records (id, firm_id, contact_id, event_kind, payload)
     VALUES ($1,$2,$3,'objective_met',$4::jsonb)`,
    [
      `eng-${randomUUID()}`,
      row.firm_id,
      row.contact_id,
      JSON.stringify({
        enrollmentId: row.id,
        sequenceId: row.sequence_id,
        campaignId: currentCampaignId,
        campaignObjectiveId: obj.id,
        kind: obj.kind,
        completionTable,
        completionId,
        nextCampaignId: next,
      }),
    ],
  );
  // active_attempts update stays here
  await dispatchEventToWorkflows(pool, {
    firmId: row.firm_id,
    eventName: "objective_met",
    payload: {
      campaign_objective_id: obj.id,
      campaign_id: currentCampaignId,
      sequence_id: row.sequence_id,
      enrollment_id: row.id,
      contact_id: row.contact_id,
      kind: obj.kind,
      completion_table: completionTable,
      completion_id: completionId,
    },
    contactIds: [row.contact_id],
  });
```

Bind `engagementId` before that insert. Use it as `$1` and as `writes[0].id`. Leave the `active_attempts` update between the insert and the dispatch. Leave the `try/catch` around the dispatch: a listener failure warns and the flip and the engagement row stay committed. Do not open a transaction that rolls the met row back when dispatch throws.

`dispatchEventToWorkflows` inserts `workflow_run` with `trigger_label` `event:${eventName}` and then walks. The copy currently forces a pass:

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

Replace that `triggerPayload` with `{ ...(opts.payload ?? {}), eventName: opts.eventName }`. The spread is first, so a caller field named `anyPass` survives, and this function does not add one.

The walk still derives the flag the same way. This packet does not edit that expression:

```1106:1110:server/wire-service/workflowWalk.ts
    eligibilityPass:
      opts.triggerPayload?.anyPass === true ||
      opts.triggerPayload?.eligibilityPass === true ||
      opts.triggerLabel.includes("eligibility") ||
      undefined,
```

`evalBranch` is the only function that reads `eligibilityPass`. Nothing calls `evalBranch`. The live `if` node uses `evalIfPick`, which loads a field through `loadWriteRow` and does not read `anyPass`. Removing the forced flag therefore does not change which If edge is taken. Acceptance case 6 is the copied field, proved by the shape guard below.

`eligibility.changed` already places `anyPass: true` on its own payload (`server/wire-service/machine.ts`). That field stays, and the new copy keeps it. `dispatchScheduleTriggers` and the webhook walk set `anyPass` on their own `triggerPayload` literals. Those literals stay.

`localRefFromPayload` for `objective_met` still reads `campaign_objective_id` first. Keeping that scalar is what lets a local trigger with that `local_ref` fire. Do not drop it.

`onCompletionWrite` still selects the newest enrollment for the contact and then calls `advanceEnrollmentCampaign` with that id. This packet does not change that select. The verify calls `advanceEnrollmentCampaign` with the enrollment id under test so each firing is that row.

The Test door’s live specimen for `objective_met` still takes the newest engagement rows for the firm (`server/wire-service/eventTest.ts`). That reader is not the run handle. Do not change it in this packet.

## Ports

No new port.

These callers stay on the same functions:

- `onCompletionWrite`, the click path in `server/wire-service/webhooks.ts`, and the cascade call `advanceEnrollmentCampaign`.
- `handleMachineEvent` and the other current callers of `dispatchEventToWorkflows` (`fact_writebacks`, `meeting_booked`, `audit.completed`, `contact_import`, `halt_records`, `consent_records.opt_out`, `campaign_failure`, `ct_firms`, `contact_uploaded`, the in-walk `audit.completed` dispatch). Their payloads are unchanged. They no longer receive a forced `anyPass` from this function. Callers that already set `anyPass` keep it.
- `POST` bodies are not extended. `handleMachineEvent` still forwards `body.payload` as the event payload.

## Verify

`scripts/verify-firing-handle.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` after migrate and seed, beside `verify-click-attribution`. `npm run build` is not this proof.

The script inserts its own `sequence_template`, `campaign`, `campaign_objective`, `contact_records`, `enrollment`, `fact_writebacks`, `workflow`, `workflow_state` (`active`), and `workflow_trigger` rows under a firm id used only by this run. It calls `advanceEnrollmentCampaign`, `writesFromPayload`, `dispatchEventToWorkflows`, and `walkValidatedWorkflow`. It does not require a session. It asserts on its own `workflow_id` values. It deletes the rows it inserts.

Objective satisfaction for these fixtures is a `fact_writebacks` row whose `campaign_objective_id` is the objective on that campaign. The click predicate is not this script.

Listener graph, in edge order:

1. Trigger, `configured: true`, event `objective_met`.
2. If `ifEng`. `pickTable: "engagement_records"`, `pickField: "payload.campaignId"`, `pickOp: "eq"`, `pickValue` the campaign that cleared. `engagement_records` is not in `PERSON_WRITE_TABLES`, so this If does not person-split.
3. If `ifEnr` on `ifEng`’s `true` edge. `pickTable: "enrollment"`, `pickField: "campaign_id"`, `pickOp: "eq"`, `pickValue` the next campaign id.

`isValidatedPipeline` accepts trigger plus `if`. Read `node_status` after the advance. The trigger’s `writes` are the handle. `ifEng`’s `detail` is `branch → true` or `branch → false`.

Before any successful fire, insert one decoy `engagement_records` row for the same contact, `event_kind` `objective_met`, `created_at` one day ahead, and a `payload.campaignId` that is not the campaign about to clear.

1. Flip with a next campaign. One new `eng-` id is stored on the engagement row and on the trigger `writes[0]`. `writes[1]` is that enrollment’s id. Both `contact_id` values are the enrollment’s `contact_id`. Order is engagement, then enrollment. No `contact_records` pointer. The engagement row’s id equals `writes[0].id` and differs from the decoy. `ifEng` is `branch → true`. `ifEnr` is `branch → true`. `SELECT campaign_id FROM enrollment WHERE id=` the pointer equals the next campaign. The payload scalars on the engagement jsonb still name the cleared campaign and `nextCampaignId`.
2. Return before the flip. Call `advanceEnrollmentCampaign` for an enrollment with `campaign_id` set and no satisfying fact row. `advanced` is false. No engagement row for that enrollment id, and no new run of the listener. Call it again with `campaign_id` null. Same result.
3. `writesFromPayload` of the payload from case 1 returns those two pointers and does not add `contact_records`. A second call with the same scalar keys and no `writes` array returns no `enrollment` pointer. `enrollment_id` is not a reader.
4. The trigger `writes` from case 1 are that two-pointer array. They are not empty. They are not the decoy, which is the newest `objective_met` row for the contact by `created_at`.
5. Two enrollments, one contact, two campaigns, two objectives, each satisfied. Advance them one after the other. Two engagement ids. The decoy remains the newest row for the contact. Each run’s trigger `writes[0]` is the id whose engagement `payload.enrollmentId` is the enrollment that advanced, and `ifEng` on that run is `branch → true` for that firing’s cleared campaign.
6. `dispatchEventToWorkflows` does not add `anyPass`. The shape guard is this case. The walk does not store `triggerPayload`, and the live If does not read the flag, so a branch edge is not the proof.
7. `loadWriteRow` for a present id is case 1’s `ifEng` (the field matches only when that id’s row is loaded). For an absent id, insert another listener whose If compares `event_kind` to `objective_met`, and call `dispatchEventToWorkflows` with `writes: [{ table: "engagement_records", id: "eng-absent", contact_id }]` while the decoy row exists. That run’s If is `branch → false`. A loader that ignored `id` and took the newest row would take `true`.
8. Last campaign in the sequence. `nextCampaignId` is null. After the advance, `SELECT campaign_id` for that enrollment id is null. The trigger `writes[1]` is still that enrollment id. Do not prove the null through `ifEnr`: `resolveOperandText` turns a null column into `undefined`, and `comparePasses` then fails the compare before `not_exists`. The non-null next campaign in case 1 is the walk-time enrollment load. The null case is the re-read of the flipped row. Do not change `comparePasses`.

`npm run factory:check` reads `advanceEnrollmentCampaign` and fails unless one `` `eng-${randomUUID()}` `` binding is the insert’s id and `writes[0].id`, the `writes` array is `engagement_records` then `enrollment`, and the dispatch object still contains `campaign_objective_id`, `enrollment_id`, and `completion_id`. It fails if that dispatch is not after the `flipped.rowCount` return, or if the function contains `INSERT INTO enrollment`. It reads the `triggerPayload` passed to `walkValidatedWorkflow` inside `dispatchEventToWorkflows` and fails if that expression contains `anyPass`. It reads `loadWriteRow` and fails unless it contains `SELECT * FROM engagement_records WHERE id=$1` and that statement has no `firm_id`, `contact_id`, `ORDER BY`, or `LIMIT`, and the function still ends at `return null`. It reads `writesFromPayload` and fails if that function contains `enrollment_id`. It does not require `dispatchScheduleTriggers` or the webhook walk to drop `anyPass`. Add `server/wire-service/workflowWalk.ts`, `server/wire-service/runWrites.ts`, and `scripts/verify-firing-handle.ts` to the path filter in `.github/workflows/factory-check.yml`. `server/wire-service/campaignHousing.ts` is already listed.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

Schedule’s own `anyPass` (`dispatchScheduleTriggers`). The webhook walk’s own `anyPass` (`machine.ts` webhook path). Stripping `anyPass` off `eligibility.changed`. A second channel from scalar keys. Copying the row body onto the pointer. `firm_id` on the pointer. Launch Agent. No plate.

Also out of this packet: claim 11’s fact and meeting `writes` arrays. Claim 10’s `loadWriteRow` branches for `fact_writebacks`, `meeting_booked`, and `wait_occupancy`. PKT-005’s audit-row key. PKT-003’s resume fill. `onCompletionWrite`’s newest-enrollment select. The Test door in `eventTest.ts`. `evalBranch`, `evalIfPick`, and `comparePasses`. The `active_attempts` update. The in-memory stand-in.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `advanceEnrollmentCampaign` | One `eng-` id on the insert and on `writes[0]`; `writes[1]` is the flipped enrollment; scalars stay; no dispatch before a committed flip | `onCompletionWrite`, click path, cascade | Modified |
| `engagement_records` | Same table. The new row’s id is the pointer id | Insert, `loadWriteRow`, trigger `writes` | Modified |
| `enrollment.campaign_id` | Same column. Re-read after the flip, including NULL on the last campaign | Flip `UPDATE`, `loadWriteRow` enrollment branch | Only verified |
| `event_write_set` `objective_met` v1 | Already ord 0 `engagement_records`, ord 1 `enrollment`. Not read at fire time | Live payload literal | Only verified |
| `writesFromPayload` | Unchanged. `payload.writes` is the handle. No `enrollment_id` reader | Every trigger, including this event | Only verified |
| `dispatchEventToWorkflows` | Copy payload and set `eventName`. Do not set or strip `anyPass` | Every event caller listed under Ports | Modified |
| `eligibility.changed` payload | Still sets `anyPass: true` before dispatch | `runContactEligibilityCascade` | Only verified |
| `dispatchScheduleTriggers`, webhook walk | Still set their own `anyPass` | Schedule tick, webhook | Only verified |
| `loadWriteRow` | New `engagement_records` branch by `id`. Other branches stay | If / Switch field reads, `noteFromVerdict` | Modified |
| `workflow_run` trigger `writes` | The new run’s `previousWrites` | Listener graph in the verify script | Only verified |
| `scripts/verify-firing-handle.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases and the shape guard | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| The id is built inside the `INSERT` parameter list, so the dispatch cannot point at the row it just wrote. One variable feeds the insert and `writes[0]`. A second `randomUUID()` would publish a pointer that matches no row. | necessary |
| `writesFromPayload` returns `payload.writes` and then stops. Putting the two pointers on the payload is the handle. Adding a reader for `enrollment_id` would also invent a pointer when `writes` is absent, which acceptance case 3 forbids. The completion row stays a scalar. | necessary |
| The `UPDATE … WHERE id AND campaign_id` can change zero rows. The insert and the dispatch stay after `flipped.rowCount`. Publishing the enrollment id when the flip did not commit would let a listener read the cursor from before this firing. The returns before the `UPDATE` already skip dispatch. | necessary |
| A decoy `objective_met` row with a later `created_at` for the same contact is the newest row. The run stores the id this firing inserted. `loadWriteRow` must use `pointer.id`, or the If that compares `payload.campaignId` loads the decoy and takes the false edge. Two enrollments on one contact are two ids. Claim 2 stays open: this packet does not close the other pursuit. | necessary |
| `engagement_records.id` is already the primary key. The new branch is `WHERE id=$1`. Adding `firm_id`, `contact_id`, or `ORDER BY` would be a different predicate than claim 10’s id load for this table. | necessary |
| `dispatchEventToWorkflows` is the only event walk that forces `anyPass: true` after the spread, which overwrites a caller value. The specified copy spreads first and does not set the key. `eligibility.changed` already sets `anyPass: true` on its payload, so that caller keeps the field. Schedule and the webhook walk set the flag on their own literals and are out of scope. | necessary |
| `evalBranch` quotes the flag as the branch pass, and nothing calls `evalBranch`. The live If is `evalIfPick`, which does not read `anyPass` or `eligibilityPass`. `evalBranch`’s last return for `if` / `true_false` is also `"true"` on both arms. Stopping the forced flag does not make a plain If fail, and it does not make an empty `writes` array a failed branch. Acceptance case 6 is the field on the copied payload, proved by the shape guard. This packet does not wire `evalBranch` into the If and does not recut `evalIfPick`. If a live If must fail when the event payload has no writes, that rule is not in the walker and is not specified as an edge. | return to Architect |
| `comparePasses` cannot observe a NULL `campaign_id`. The last-campaign proof is `SELECT` of the flipped row. The walk-time enrollment load is the non-null next campaign. Changing `comparePasses` would recut every compare. | necessary |
| `eventTest.ts` door 1 for `objective_met` still selects the newest engagement rows for the firm and copies row bodies into the test writes. The packet’s listener is the `workflow_run` started by `dispatchEventToWorkflows`. The Test door stays. | adjacent |
| `onCompletionWrite` still chooses the newest enrollment for the contact before it calls `advanceEnrollmentCampaign`. Two open pursuits are claim 2. The verify names the enrollment id. | adjacent |
| PKT-003 restores `chainWrites` on resume and does not change `writesFromPayload`. PKT-005 replaces the `reachability_verdicts` and `sequence_ready` loads and their keys. This packet adds one id branch and leaves those branches. A resume of a later wait is PKT-003. This packet only fills the trigger handle of the new run. | adjacent |
| The rule node still sets `eligibilityPass` from `result.writes.length === 0` when the flag is undefined. Nothing on the live path reads that assignment. This packet does not recut it. | adjacent |
| The packet file still says `**Release:** draft`. The ledger stage for this revision is `released`, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
