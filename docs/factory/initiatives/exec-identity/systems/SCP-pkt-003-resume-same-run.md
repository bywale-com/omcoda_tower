# SCP-pkt-003 — A resumed wait keeps the writes of that run

**Packet:** PKT-003 `pkt-003-resume-same-run`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 6 at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. Claim 5 is the established in-memory handle this resume restores.  
**Contract:** `docs/factory/components/walk-handle/CONTRACT.md`

## Intent

A Wait parks the walk and process memory, including `chainWrites`, is gone. Resume of that same `workflow_run.id` rebuilds `chainWrites` from `workflow_run.node_status` before it walks the waited node’s outgoing edges. `previousWrites` at that moment are the waited node’s own stored writes. A chip that names a node with a stored `writes` array reads that array.

## Must / must-not

- On `resumeFromNodeId`, load `node_status` for this run only, then fill `ctx.chainWrites` and `ctx.previousWrites` from that object, then stamp the waited node success, then call `goOn`. The fill happens before the success stamp. The stamp writes `ctx.previousWrites` after the fill, so the caller’s array is not what gets stored.
- For each entry in the loaded object, when `writes` is an array, set `ctx.chainWrites[nodeId]` to the pointers parsed from that array. When `writes` is missing or not an array, leave that key unset.
- Parse an array with the same rules as `writesFromUnknown`: keep entries whose `table` and `id` are strings, and keep `contact_id` when it is a string, otherwise null. An array that parses empty is a stored empty handle. `ctx.chainWrites[nodeId]` is that empty array. A missing array is not stored as `[]`.
- `ctx.previousWrites` is the parsed `writes` array of `opts.resumeFromNodeId` when that value is an array. When that value is missing or not an array, `ctx.previousWrites` is `[]`.
- The arrays passed by `resumeWaitRun`, the occupancy rows returned by the due tick, and `counts.waitWrites` stay out of both maps when they differ from the stored array, and when the stored array is missing.
- A chip with `fromNodeId` N, where N’s stored `writes` is P, resolves to P. The fallthrough in `mappedWrites` stays as it is. A node with no stored `writes` array still has no chain key, so a chip that names it still falls through to `previousWrites`.
- `ctx.contactIds` at the resume boundary stay the ids `resumeWaitRun` already received. Do not replace that list with people taken from the restored writes, from occupancy rows, or from `counts.waitWrites`.
- Keep the resume skip of the trigger: `visited` already contains the waited node, and the walk does not call `visit` on the trigger.
- Do not add a table or a column. Do not edit `loadWriteRow`. Do not export it for the check. A `wait_occupancy` pointer still returns null from that function.
- Do not change `writesFromPayload` or the non-resume initial `chainWrites: {}`. A new run still starts from its trigger payload.
- The due tick may keep marking matching `wait_occupancy` rows `approved`. That update is not the handle. `resumeDueWaitingRuns` and `handleWaitOccupancyApprove` may keep passing a `previousWrites` argument. The resume branch ignores it.

## Stores and contracts

No new table and no new column.

`workflow_run` is the run. `id` is the primary key. `node_status` is the per-node record already written on park. `counts` holds the park’s copy of the wait’s writes and contact ids. `resume_at` and `waiting_node_id` are the park columns.

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

```4:12:supabase/migrations/024_wait_occupancy.sql
ALTER TABLE workflow_run
  DROP CONSTRAINT IF EXISTS workflow_run_status_check;
ALTER TABLE workflow_run
  ADD CONSTRAINT workflow_run_status_check
    CHECK (status IN ('running', 'waiting', 'success', 'failed', 'stopped'));
ALTER TABLE workflow_run
  ADD COLUMN IF NOT EXISTS resume_at TIMESTAMPTZ;
ALTER TABLE workflow_run
  ADD COLUMN IF NOT EXISTS waiting_node_id TEXT;
```

`wait_occupancy` is the approval desk (`024_wait_occupancy.sql`). Its rows are not the chain. Claim 10 still owns a field read of a `wait_occupancy` pointer. This packet does not load that table inside `loadWriteRow`.

The handle claim 5 already locked, and this packet restores, is `RunWrite`:

```1:7:server/wire-service/runWrites.ts
/** This run’s writes — the next node’s input. Not an events table. */
export type RunWrite = {
  table: string;
  id: string;
  contact_id?: string | null;
};
```

`NodeRunStatus.writes` is that array on each node. `chainWrites` is every completed node’s array. `previousWrites` is the last node’s array.

```60:63:server/wire-service/workflowWalk.ts
  /** Last node only. Cardinality default. 015. */
  previousWrites: RunWrite[];
  /** Every completed node’s writes this run. Input / chips. 017. */
  chainWrites: Record<string, RunWrite[]>;
```

```86:91:server/wire-service/workflowWalk.ts
export type NodeRunStatus = {
  status: "success" | "skipped" | "failed" | "waiting";
  detail?: string;
  at: string;
  writes?: RunWrite[];
};
```

Walk-handle claim 6 is this packet. Claim 5 stays established and unpacketed. The contract’s responsibility is which stored rows a run may read after a node, a park, or a firing. The contract does not replace the claim text.

The park already persists every visited node, and it copies the wait’s writes onto `counts.waitWrites`. A duration wait stores `writes: ctx.previousWrites` and does not call `commitWrites`. An approval wait calls `commitWrites` and stores the inserted occupancy pointers. Both shapes leave the array on `node_status[wait].writes`. The restore reads that object. It does not ask which shape called `commitWrites`.

```1643:1660:server/wire-service/workflowWalk.ts
  if (parked) {
    await pool.query(
      `UPDATE workflow_run
       SET status='waiting', waiting_node_id=$2, resume_at=$3::timestamptz,
           node_status=$4::jsonb, counts=$5::jsonb, finished_at=NULL
       WHERE id=$1`,
      [
        opts.runId,
        parked.nodeId,
        parked.resumeAt,
        JSON.stringify(nodeStatus),
        JSON.stringify({
          nodes: Object.keys(nodeStatus).length,
          enrollments: enrollments.length,
          contacts: parked.contactIds.length,
          waitContactIds: parked.contactIds,
          waitWrites: parked.writes,
        }),
```

`loadWriteRow` ends at `return null` after the tables it already knows. `wait_occupancy` is not one of them.

```695:699:server/wire-service/workflowWalk.ts
  if (w.table === "missing_fact_signals") {
    const { rows } = await pool.query(`SELECT * FROM missing_fact_signals WHERE id=$1`, [w.id]);
    return (rows[0] as Record<string, unknown> | undefined) ?? null;
  }
  return null;
```

## Runtime

`walkValidatedWorkflow` starts every invocation, including a resume, with an empty chain and with `previousWrites` taken from the trigger payload. `resumeWaitRun` puts its `previousWrites` argument into that payload.

```1097:1105:server/wire-service/workflowWalk.ts
  const ctx: WalkContext = {
    firmId: opts.firmId,
    workflowId: opts.workflowId,
    runId: opts.runId,
    triggerPayload: opts.triggerPayload ?? {},
    constants: {},
    contactIds,
    previousWrites: triggerWrites,
    chainWrites: {},
```

```1746:1754:server/wire-service/workflowWalk.ts
  return walkValidatedWorkflow(pool, {
    workflowId: opts.workflowId,
    firmId: opts.firmId,
    runId: opts.runId,
    triggerLabel: opts.triggerLabel ?? "wait-resume",
    triggerPayload: { writes: opts.previousWrites },
    contactIds: opts.contactIds,
    resumeFromNodeId: opts.waitNodeId,
  });
```

The resume branch loads this run’s `node_status`, then overwrites the waited node’s `writes` with `ctx.previousWrites`, then walks outgoing edges. `chainWrites` is still empty, so a chip misses the earlier node.

```1625:1638:server/wire-service/workflowWalk.ts
  if (opts.resumeFromNodeId) {
    visited.add(opts.resumeFromNodeId);
    const prior = await pool.query<{ node_status: Record<string, NodeRunStatus> }>(
      `SELECT node_status FROM workflow_run WHERE id=$1`,
      [opts.runId],
    );
    Object.assign(nodeStatus, prior.rows[0]?.node_status ?? {});
    nodeStatus[opts.resumeFromNodeId] = {
      status: "success",
      detail: "wait resumed",
      at: now(),
      writes: ctx.previousWrites,
    };
    await goOn(opts.resumeFromNodeId, outgoing(edges, opts.resumeFromNodeId));
```

That `SELECT` stays `WHERE id=$1` with `opts.runId`. `workflow_run.id` is the primary key. A second run is a different id and is not read.

The fill is new work in this same branch, after `Object.assign` and before the success stamp:

1. Read `writes` from the loaded `node_status` (the object just assigned, before the stamp replaces the waited node).
2. For each node id, assign `ctx.chainWrites[nodeId]` only when `writes` is an array, using `writesFromUnknown` on that array.
3. Set `ctx.previousWrites` from the waited node’s array, or to `[]` when that array is absent.
4. Stamp `status: "success"`, `detail: "wait resumed"`, `writes: ctx.previousWrites`.
5. `goOn` the waited node’s outgoing edges.

`resumeDueWaitingRuns` still prefers occupancy rows and otherwise reads `counts.waitWrites`. That value is still passed into `resumeWaitRun`. The walk no longer uses it as the handle.

```1774:1804:server/wire-service/workflowWalk.ts
    const occ = await pool.query<{ id: string; contact_id: string }>(
      `UPDATE wait_occupancy
       SET status='approved', approved_at=now()
       WHERE workflow_run_id=$1 AND wait_node_id=$2 AND status IN ('open','scheduled')
       RETURNING id, contact_id`,
      [row.id, waitNodeId],
    );
    const occWrites: RunWrite[] = occ.rows.map((r) => ({
      table: "wait_occupancy",
      id: r.id,
      contact_id: r.contact_id,
    }));
    const counts = row.counts ?? {};
    const fromCounts = Array.isArray(counts.waitContactIds)
      ? (counts.waitContactIds as unknown[]).map(String)
      : [];
    const contactIds = occ.rows.length
      ? uniqueIds(occ.rows.map((r) => r.contact_id))
      : fromCounts;
    const previousWrites = occWrites.length
      ? occWrites
      : writesFromUnknown(counts.waitWrites);
    await resumeWaitRun(pool, {
      runId: row.id,
      workflowId: row.workflow_id,
      firmId: row.firm_id,
      waitNodeId,
      contactIds,
      previousWrites,
      triggerLabel: row.trigger_label ?? "wait-resume",
    });
```

`handleWaitOccupancyApprove` (`POST /machine/wait-occupancy/approve`, mode `now`) builds the same kind of occupancy `previousWrites` and calls `resumeWaitRun`. One restore in the resume branch covers that call, the due tick, and a direct `resumeWaitRun`.

The chip reader is unchanged:

```293:297:server/wire-service/workflowWalk.ts
  for (const chip of chips) {
    if (!chip || typeof chip !== "object") continue;
    const rec = chip as Record<string, unknown>;
    const fromNode = typeof rec.fromNodeId === "string" ? rec.fromNodeId : "";
    const source = (fromNode && ctx.chainWrites[fromNode]) || ctx.previousWrites;
```

An empty array is truthy, so a stored `writes: []` blocks fallthrough. A missing key is not, so the chip uses `previousWrites`. Setting `[]` for a node that stored no array would change that rule. Omit the key.

A Get with `mappedSlots` commits `mappedWrites` onto that Get’s own `node_status.writes`. That is the observation the verify reads. `ascribe_tag` with no `mappedSlots` tags `ctx.contactIds`. With the tag edge first among the Wait’s outgoing edges, that tag records the contact ids the resume received, before a later Get replaces `ctx.contactIds` from a chip.

## Ports

No new port.

Existing callers of the same resume stay bound:

- The cascade tick calls `resumeDueWaitingRuns` (`server/wire-service/cascade.ts`).
- `POST /machine/wait-occupancy/approve` calls `resumeWaitRun` from `handleWaitOccupancyApprove`.
- `GET /machine/wait-occupancy` stays a list. It does not resume.

`resumeWaitRun` still sets the run to `running` and calls `walkValidatedWorkflow` with `resumeFromNodeId`. Its `previousWrites` argument remains on the function and is not the handle.

## Verify

`scripts/verify-resume-same-run.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` after migrate and seed, beside `verify-click-attribution`. `npm run build` is not this proof.

The script inserts its own `workflow`, `contact_records`, and `workflow_run` rows and calls `walkValidatedWorkflow`, `resumeWaitRun`, and `resumeDueWaitingRuns`. It does not require a session. Clean up the rows it inserts.

Approval graph, in edge order:

1. Trigger, configured.
2. Get N. `getModule: "contacts"`, `getSelect` other than `"every"`, `getClass1` the firm, `getClass2` one contact A, `getClass2All: false`. Its stored writes P are `{ table: "contact_records", id: A, contact_id: A }`.
3. Action E. `inAppAffordance` set, `actionType` neither `run_audit` nor `ascribe_tag`. Its stored writes are `[]`.
4. Constant C. The walker stores no `writes` key.
5. Wait, approval, with a title. Its stored writes W are the `wait_occupancy` pointers for A. W’s ids differ from P.
6. Outgoing from the Wait, in this order: `ascribe_tag` with no `mappedSlots`; Get chipN with `fromNodeId` N and `table: "contact_records"`; Get chipE with `fromNodeId` E and no `table`; Get chipC with `fromNodeId` C and no `table`; Get chipW with `fromNodeId` of the Wait and `table: "wait_occupancy"`.

Park by calling `walkValidatedWorkflow`. Read `node_status` and `counts`. Then resume. After resume, read `node_status` again.

1. Due tick, occupancy left in place. Set `resume_at` in the past. Set `counts.waitWrites` to a decoy D, a `contact_records` pointer for a different contact B. Call `resumeDueWaitingRuns`. The tick’s occupancy rows match W and differ from D. chipN’s `writes` equal P. The Wait’s stamped `writes` equal W. chipW’s `writes` equal W. chipE’s `writes` equal `[]`. chipC’s `writes` equal W. The tag row is for A. B has no tag from this run.
2. Due tick, occupancy removed. Park a second run of the same graph. Delete that run’s `wait_occupancy` rows. Leave `counts.waitContactIds` as the parked people. Set `counts.waitWrites` to D and `resume_at` in the past. Call `resumeDueWaitingRuns`. The tick passes D. The Wait’s stamped `writes` equal the pre-resume W, chipN’s `writes` equal P, and the tag is still A.
3. Direct `resumeWaitRun` after a third park. Pass `previousWrites: D` and `contactIds` equal to the parked people. The Wait’s stamped `writes` equal W. chipN’s `writes` equal P. chipE’s `writes` equal `[]`. chipC’s `writes` equal W. The tag is A.
4. Duration park on trigger → Get N → duration Wait (amount greater than 0, unit `minutes`) → chipN. Stored W equals P because a duration wait copies `previousWrites` and does not insert occupancy. Set `counts.waitWrites` to D and `resume_at` in the past. Call `resumeDueWaitingRuns`. The Wait’s stamped `writes` equal the pre-resume W and differ from D. This case proves the stamp. It does not prove the chain, because W’s pointers equal P, so a chip that fell through to a corrected `previousWrites` would also show P. Cases 1–3 prove the chain, because P and W differ and a missing `chainWrites[N]` falls through to W, which has no `contact_records` row.
5. Before case 1’s resume, insert another `workflow_run` whose `node_status` stores a `contact_records` pointer for contact C on a node id equal to N. After the resume, that row’s `node_status` is unchanged, and chipN’s `writes` are still A’s pointer.
6. Call nothing that creates a table. `loadWriteRow` is still the function that returns null for an unknown table. The script does not export it. The shape guard below reads the source.

`npm run factory:check` reads the `resumeFromNodeId` branch of `walkValidatedWorkflow`. It fails unless that branch assigns `ctx.chainWrites` from stored `writes` arrays, and assigns `ctx.previousWrites` from the waited node’s stored array, before `goOn(opts.resumeFromNodeId, ...)`. It fails if that branch contains `counts.waitWrites` or `wait_occupancy`. It fails unless the load is still `SELECT node_status FROM workflow_run WHERE id=$1`. It reads `loadWriteRow` and fails if that function contains `wait_occupancy` or no longer ends at `return null`. Add `server/wire-service/workflowWalk.ts` and `scripts/verify-resume-same-run.ts` to the path filter in `.github/workflows/factory-check.yml` so a later edit of the walker runs that shape check.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

`payload.writes` on a new listening run (PKT-004). Audit-row grain and the `loadWriteRow` branches for the two audit tables (PKT-005). Schedule ticks (`dispatchScheduleTriggers`). A new run-writes table. Claim 46’s title. Claim 10’s field read of `wait_occupancy`, `sequence_ready`, and `reachability_verdicts`. The `mappedWrites` fallthrough. The contact-id lists chosen by `resumeDueWaitingRuns` and by approve-now. Marking due occupancy `approved`. The in-memory stand-in `walkStandInGraph` / `resumeStandInWaitRun`. No plate.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `walkValidatedWorkflow` resume branch | Fill `chainWrites` and `previousWrites` from this run’s `node_status` before `goOn` | `resumeWaitRun`, due tick, approve-now | Modified |
| `workflow_run.node_status` | Source of the restored handle. Same column. Load stays `WHERE id=$1` | Resume branch, park update | Only verified |
| `counts.waitWrites` and due-tick occupancy rows | Remain on the tick. They are not the handle | `resumeDueWaitingRuns` | Only verified |
| `resumeWaitRun` | Still opens the same run and passes `resumeFromNodeId`. The `previousWrites` argument is not the handle | Due tick, `handleWaitOccupancyApprove` | Only verified |
| `mappedWrites` | Keep the fromNode chain lookup, then `previousWrites` | Get, action, wait people, rule operands | Only verified |
| `loadWriteRow` | Unchanged. Still returns null for `wait_occupancy` | Field reads inside the walk | Only verified |
| `POST /machine/wait-occupancy/approve`, cascade tick | Same functions. No new route | Approve now, worker tick | Only verified |
| `scripts/verify-resume-same-run.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases and the shape guard | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| The empty chain and the caller’s `previousWrites` are one defect. Restoring `chainWrites` while leaving `previousWrites` on the occupancy rows fails the stamp whenever those rows differ from W. Replacing only `resumeDueWaitingRuns` leaves approve-now, and leaves `chainWrites` empty on the path whose occupancy rows already equal W. The fill belongs in the resume branch before the success stamp, so every caller is covered. | necessary |
| The success stamp replaces `node_status[wait].writes` with `ctx.previousWrites`. Reading the chain from `nodeStatus` after that stamp would copy the caller’s array. The fill reads the loaded object first. | necessary |
| A missing `writes` array and a stored `writes: []` are different. `mappedWrites` treats `[]` as the source. Inventing `[]` for a constant, which stores no array, would stop the fallthrough claim 5 already specified. Omit the key. Keep a stored empty array. | necessary |
| Duration stores `writes` without `commitWrites`. Approval stores occupancy pointers and does call `commitWrites`. The restore walks the stored object, so both shapes re-enter the chain. The approval fixture is the one where P and W differ, which is what makes a missing chain key observable. | necessary |
| `workflow_run.id` is already the primary key, and the load is already `WHERE id=$1`. The rebuild uses that row only. Widening the read to the latest run for the workflow would take another run’s pointers. | necessary |
| `factory-check.yml` does not list `workflowWalk.ts`. The shape guard is part of this packet’s proof, so the path filter includes that file and the verify script. | necessary |
| The stand-in resume in `src/app/wire/standins/machineApi.ts` still starts from payload writes and has no `chainWrites`. The live walk is `server/wire-service/workflowWalk.ts`. Acceptance is `workflow_run.id`. | adjacent |
| `loadWriteRow` returns null for `wait_occupancy`. A later node that reads a field of that pointer stays claim 10. PKT-004 and PKT-005 change other branches of the same function. This packet leaves the function untouched so those packets can land on the current body. | adjacent |
| A new run still takes `previousWrites` from `writesFromPayload`. PKT-004 owns `payload.writes` on a listening run. This packet ignores that payload only when `resumeFromNodeId` is set. | adjacent |
| The packet markdown still says `**Release:** draft`. The manifest and the ledger stage for this revision are `released`, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
