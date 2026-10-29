# PKT-003 — A resumed wait keeps the writes of that run

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 6, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. Claim 5 is the established in-memory handle this resume restores.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes

## Intended behavior

A Wait parks the walk. Process memory, including `chainWrites`, is gone. The pointers are already stored on `workflow_run.node_status[nodeId].writes` for this `workflow_run.id`.

Resume rebuilds `chainWrites` from that object before it walks the outgoing edges of the waited node. `previousWrites` for the resumed node are that node’s own stored writes. A chip that names an earlier node reads that node’s stored writes. It does not fall through to the wait’s writes.

No new table. The rows stay in the module tables. `workflow_run.id` is the run.

A node that stored no `writes` array contributes no invented handle. The resumed walk does not substitute occupancy rows or `counts.waitWrites` when the stored array is missing or different.

Who the run is for stays the contact ids resume already passes. This packet does not retune that list.

## Existing behavior

The walk starts with an empty chain. On resume it does not visit the trigger, so earlier nodes are never committed again:

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

The park already saved each node’s writes, and it also copied the wait’s writes onto `counts.waitWrites`:

```1654:1659:server/wire-service/workflowWalk.ts
        JSON.stringify({
          nodes: Object.keys(nodeStatus).length,
          enrollments: enrollments.length,
          contacts: parked.contactIds.length,
          waitContactIds: parked.contactIds,
          waitWrites: parked.writes,
        }),
```

Due resume builds a different set and passes it in as the new walk’s previous writes:

```1793:1804:server/wire-service/workflowWalk.ts
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

A chip then falls through to those writes when the earlier node is absent from the chain:

```296:297:server/wire-service/workflowWalk.ts
    const fromNode = typeof rec.fromNodeId === "string" ? rec.fromNodeId : "";
    const source = (fromNode && ctx.chainWrites[fromNode]) || ctx.previousWrites;
```

`NodeRunStatus.writes` is the stored array (`workflowWalk.ts`). `waiting_node_id` and `resume_at` are the park columns (`supabase/migrations/024_wait_occupancy.sql`).

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof.

1. A run parks at a Wait after node N stored pointers P and the Wait stored pointers W, on this `workflow_run.id`.
2. Resume of that id sets `chainWrites[N]` to P and `chainWrites[Wait]` to W before the Wait’s outgoing edges are walked.
3. `previousWrites` at that moment is W. It is not the occupancy rows returned by the due tick, and it is not `counts.waitWrites`, when those differ from W.
4. A chip with `fromNodeId` N resolves to P.
5. A second run’s `node_status` is not read.
6. No new table is created. `loadWriteRow` is unchanged.

Marking due occupancy `approved` may stay. That update is not the handle.

## Dependencies

Claim 5: inside one invocation the handle is `previousWrites` and `chainWrites`, pointers `{ table, id, contact_id }`. This packet restores that handle across the park. It does not re-specify the handle.

Claim 10 loads `wait_occupancy` by id. This packet does not. A later node that reads a field of a `wait_occupancy` pointer still follows today’s loader until that claim is packeted. Acceptance here is the chain contents, not that field read.

## Out of scope

`payload.writes` on a new listening run (PKT-004). Audit-row grain (PKT-005). Schedule ticks. A new run-writes table. Claim 46’s title is indexed only; this packet does not reopen it. No plate.

## Plates

None.
