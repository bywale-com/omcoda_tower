# SCP-pkt-006 — Three id-keyed tables load by primary key, and the generic action stores that key

**Packet:** PKT-006 `pkt-006-id-keyed-loads`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 10 at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The `engagement_records` load is PKT-004. The fact array is PKT-007. The meeting array is PKT-008. The four eligibility loads are PKT-009.  
**Contract:** `docs/factory/components/walk-handle/CONTRACT.md` — claim 10’s remaining loads, the three append tables on the person split, and the id `writeEngagement` returns. `docs/factory/components/firing-pointers/CONTRACT.md` names this packet as the loader for `fact_writebacks` and `meeting_booked`. It does not make this packet the writer of those arrays.

## Intent

`loadWriteRow` loads `fact_writebacks`, `meeting_booked`, and `wait_occupancy` by `pointer.id`. No row with that id returns null. A miss does not try `contact_id`.

`engagement_records`, `fact_writebacks`, and `meeting_booked` join `PERSON_WRITE_TABLES`. `wait_occupancy` is already a member and stays there. `personTableOf` already consults that set for the If and the Switch. Adding the three names is the split. There is no second split. The If tests each contact on the run against the pointer of that table whose `contact_id` is that contact, then this load reads that pointer’s id. The row id is not a person. When several pointers share one contact, the existing `find` still takes the first.

The action fallthrough that runs for `manage_lists`, `assign_task`, and `notify_consultant` keeps the `engagement_records` insert. The pointer’s `id` is the string `writeEngagement` returns. `contact_id` remains the contact. One contact, one insert, one pointer.

`call_agent`, `ascribe_tag`, and `run_audit` return before that fallthrough. An in-app affordance other than `run_audit` or `ascribe_tag` still commits an empty write list and does not call `writeEngagement`.

## Must / must-not

- Add three `loadWriteRow` branches, as literal SQL, before the final `return null`. Each is `SELECT * FROM <table> WHERE id=$1` bound to `[w.id]`, for `fact_writebacks`, `meeting_booked`, and `wait_occupancy`. No `firm_id`, no `contact_id`, no `ORDER BY`, no `LIMIT`. No row returns null. Do not interpolate the table name. Do not query again by `contact_id` when `rows[0]` is missing.
- Do not add the `engagement_records` branch. PKT-004 owns `SELECT * FROM engagement_records WHERE id=$1`. If that branch is already present, leave it. If it is absent, an engagement field read stays null. The person split still routes contacts.
- Leave the `sequence_ready`, `reachability_verdicts`, `contact_records`, `contact_tag`, `audit_runs`, `import_batch`, `enrollment`, and `missing_fact_signals` branches as they are on this tree, including a pair predicate PKT-005 may already have substituted for the two audit tables. Do not add `eligibility_evaluations`, `eligibility_results`, `signals`, or `motion_decisions`. If those four branches are already present, leave them.
- Add `"engagement_records"`, `"fact_writebacks"`, and `"meeting_booked"` to `PERSON_WRITE_TABLES`. Keep `"wait_occupancy"` and the five names already beside it. Do not add the four eligibility tables. Do not remove a name.
- Do not edit `personTableOf`, `evalIfPick`, the Switch visitor, `personIdsFromWrites`, or either `find` in `resolveOperandText`. The find stays `row.contact_id === contactId || row.id === contactId`, then `[0]`.
- In the action fallthrough, hold the string `writeEngagement` returns and push `{ table: "engagement_records", id: that string, contact_id: contactId }`. Do not push `contactId` as `id`. Do not mint a second id in the walker. Do not change the object passed into `writeEngagement`. One call per contact.
- Do not move the `call_agent`, `ascribe_tag`, or `run_audit` returns. Do not move the in-app return. Do not change the raw `data.actionType` test that lets `run_audit` and `ascribe_tag` pass that return. Do not change `normalizeActionType`, including `enroll_sequence` → `call_agent`.
- Do not change `resolveRuleOperand`’s latest-fact query. Do not change `writeEngagement`’s insert or its returned id. Do not change the approval wait’s `INSERT … RETURNING id` or the pointer it pushes. Do not export `loadWriteRow` for this packet. If it is already exported, leave the export.

## Stores and contracts

No new table and no new column. No migration.

`fact_writebacks.id` is `TEXT PRIMARY KEY`.

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

`meeting_booked.id` is `TEXT PRIMARY KEY`. The firm and contact indexes are not the load.

```2:19:supabase/migrations/007_meeting_booked.sql
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

CREATE INDEX IF NOT EXISTS meeting_booked_firm_idx
  ON meeting_booked (firm_id, booked_at DESC);

CREATE INDEX IF NOT EXISTS meeting_booked_contact_idx
  ON meeting_booked (firm_id, contact_id);
```

`wait_occupancy.id` is `TEXT PRIMARY KEY`. `UNIQUE (workflow_run_id, wait_node_id, contact_id)` is how the wait writers find a row. It is not the load predicate.

```18:32:supabase/migrations/024_wait_occupancy.sql
CREATE TABLE IF NOT EXISTS wait_occupancy (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  workflow_id TEXT NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
  wait_node_id TEXT NOT NULL,
  workflow_run_id TEXT NOT NULL REFERENCES workflow_run(id) ON DELETE CASCADE,
  contact_id TEXT NOT NULL,
  title TEXT NOT NULL,
  approver TEXT NOT NULL CHECK (approver IN ('consultant', 'operator')),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'scheduled', 'approved')),
  approve_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workflow_run_id, wait_node_id, contact_id)
);
```

`engagement_records.id` is `TEXT PRIMARY KEY` (`004_machine_tables.sql`). `writeEngagement` already inserts `eng-` plus a uuid and returns that string.

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

`action.type` already allows the three fallthrough kinds, and `agent_ref` may be null except for `call_agent` (`010_sequence_campaign_housing.sql`, `action_type_check` and `action_agent_ref_required`). `persistAction(null, …)` for those three kinds stays. Do not drop the constraint and do not skip the insert.

The handle type stays. `contact_id` is optional on the type and required on the engagement pointer this fallthrough publishes.

```1:6:server/wire-service/runWrites.ts
/** This run’s writes — the next node’s input. Not an events table. */
export type RunWrite = {
  table: string;
  id: string;
  contact_id?: string | null;
};
```

The person set today omits the three append tables. `wait_occupancy` is already a member:

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

`personIdsFromWrites` prefers `contact_id`, and otherwise uses `id` when the table is in that set. The row id is not a person. This function stays. The fallthrough sets `contact_id`, so the `eng-` id is not the person.

```264:268:server/wire-service/workflowWalk.ts
function personIdsFromWrites(writes: RunWrite[]): string[] {
  return uniqueIds(
    writes.map((w) => w.contact_id ?? (PERSON_WRITE_TABLES.has(w.table) ? w.id : null)),
  );
}
```

`loadWriteRow` returns null after the tables it already knows. The three tables are not among them. `const contactId = w.contact_id ?? w.id` stays for the branches that already use it. The new branches do not use `contactId`.

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

The rule operand’s latest fact, by firm, contact, and `field_key`, is a different reader. It stays, including `ORDER BY created_at DESC LIMIT 1`.

```578:584:server/wire-service/workflowWalk.ts
    const row = await pool.query<{ value: unknown }>(
      `SELECT value FROM fact_writebacks
        WHERE firm_id=$1 AND contact_id=$2 AND field_key=$3
        ORDER BY created_at DESC LIMIT 1`,
      [ctx.firmId, contactId, text],
    );
```

Walk-handle claim 10 is this packet plus PKT-004’s engagement load. Firing-pointers claim 11’s arrays stay PKT-007 and PKT-008. Claim 12’s four loads stay PKT-009, and those four tables stay out of `PERSON_WRITE_TABLES`.

## Runtime

`personTableOf` returns the first chip table that is already in the set. A legacy If uses `pickTable` for the `__legacy` slot. No edit.

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

When that table is set and the run has contacts, `evalIfPick` tests each contact. A pass for one contact does not put the others on the true branch. When the table is not in the set, one compare with no contact id sends every `ctx.contactIds` down the true branch on a pass. Do not edit this function. Membership is what turns the three tables onto the per-contact path.

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

The contact’s pointer is the first match, then the first row. Both the legacy pick and the chip slot use that find. Do not edit either.

```870:880:server/wire-service/workflowWalk.ts
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

The Switch already buckets contacts when `personTableOf` matches a path. After the three names join the set, a path whose chip table is one of those three splits the same way. Do not edit the visitor.

```1209:1236:server/wire-service/workflowWalk.ts
        const personSplit = paths.some(
          (path) => path.compare != null && personTableOf(data, [path.compare]),
        );
        nodeStatus[nodeId] = {
          status: "success",
          detail: personSplit ? `switch person-split paths=${paths.length}` : "switch",
          at: now(),
          writes: ctx.previousWrites,
        };

        const firstMatchHandle = async (contactId?: string): Promise<string> => {
          for (const path of paths) {
            const compares = path.compare ? [path.compare] : [];
            if (await allComparesPass(pool, ctx, data, compares, contactId)) {
              return path.sourceHandle;
            }
          }
          return fallbackHandle;
        };

        if (personSplit && ctx.contactIds.length) {
          const buckets = new Map<string, string[]>();
          for (const cid of ctx.contactIds) {
            const taken = await firstMatchHandle(cid);
            const list = buckets.get(taken) ?? [];
            list.push(cid);
            buckets.set(taken, list);
          }
```

The in-app return is already an empty write list, and it does not call `writeEngagement`. It stays in front of the three action branches. `inApp` is `String(data.inAppAffordance ?? "")`. The exceptions are the raw `actionType` strings `run_audit` and `ascribe_tag`, not the normalized type.

```1311:1322:server/wire-service/workflowWalk.ts
        const rawAction = String(data.actionType ?? "");
        if (inApp && rawAction !== "run_audit" && rawAction !== "ascribe_tag") {
          commitWrites(ctx, nodeId, []);
          ctx.lastOutput = { silent: true, inApp };
          nodeStatus[nodeId] = {
            status: "success",
            detail: `${inApp} silent until wrap`,
            at: now(),
            writes: [],
          };
          await goOn(nodeId, outgoing(edges, nodeId));
          return;
        }
```

`call_agent`, `ascribe_tag`, and `run_audit` each `return` inside the action visitor before the fallthrough. Leave those returns.

The fallthrough ignores the id `writeEngagement` returns and pushes the contact id:

```1502:1511:server/wire-service/workflowWalk.ts
        for (const contactId of ctx.contactIds) {
          await writeEngagement(pool, opts.firmId, contactId, actionType, {
            workflowId: opts.workflowId,
            runId: opts.runId,
            label: data.label ?? null,
            formQuestionIds: data.formQuestionIds ?? [],
          });
          writes.push({ table: "engagement_records", id: contactId, contact_id: contactId });
```

Replace that pair with one binding. `const engagementId = await writeEngagement(...)` using the same arguments, then `writes.push({ table: "engagement_records", id: engagementId, contact_id: contactId })`. `commitWrites` stays after `persistAction`. The detail string stays `${actionType}; contacts=${n}`.

The approval wait already pushes `wait_occupancy.id` from `RETURNING id`. This packet does not change that insert. The new load is what a later node reads.

```1561:1587:server/wire-service/workflowWalk.ts
        for (const contactId of people) {
          const occId = `wo-${randomUUID()}`;
          const inserted = await pool.query<{ id: string }>(
            `INSERT INTO wait_occupancy (
               id, firm_id, workflow_id, wait_node_id, workflow_run_id,
               contact_id, title, approver, status
             ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'open')
             ON CONFLICT (workflow_run_id, wait_node_id, contact_id) DO NOTHING
             RETURNING id`,
            [
              occId,
              opts.firmId,
              opts.workflowId,
              nodeId,
              opts.runId,
              contactId,
              title,
              approver,
            ],
          );
          if (inserted.rows[0]?.id) {
            writes.push({
              table: "wait_occupancy",
              id: inserted.rows[0].id,
              contact_id: contactId,
            });
          }
        }
```

`walkValidatedWorkflow` is already exported. The verify calls it. `loadWriteRow` stays unexported unless an earlier packet exported it.

## Ports

No new port.

These stay on the same functions:

- The action visitor inside `walkValidatedWorkflow` for `manage_lists`, `assign_task`, and `notify_consultant`. The committed `writes` use the engagement id `writeEngagement` returned.
- `call_agent`, `ascribe_tag`, and `run_audit` on that same visitor. They still return before the fallthrough.
- An action with a non-empty `inAppAffordance` whose raw `actionType` is neither `run_audit` nor `ascribe_tag`. Same empty `writes`, no `writeEngagement` call.
- `writeEngagement` in `cascade.ts`. Same arguments, same returned `eng-` id. The other callers in that file are not edited. They may keep ignoring the return.
- `loadWriteRow` gains three branches. It is not an HTTP route. `executeGet`, `handleFactWritebacksList`, `handleMeetingBook`, and `handleEngagementRecordsList` are not edited.

## Verify

`scripts/verify-id-keyed-loads.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` after migrate and seed, beside `verify-click-attribution`. `npm run build` is not this proof.

The script uses `getPool()` the way `scripts/verify-click-attribution.ts` does. Firm id is `firm-pkt006-` plus a run token. It does not use the seeded Harbor firm. It inserts its own `workflow` rows (`target` `contact`) and, where a `wait_occupancy` row needs a parent, its own `workflow_run`. It calls `walkValidatedWorkflow` and asserts on the returned `nodeStatus`. It deletes the rows it inserts: `engagement_records`, `fact_writebacks`, `meeting_booked`, `wait_occupancy`, `contact_tag`, `audit_runs`, `enrollment`, `action`, `workflow_run`, then `workflow`, for that firm.

Row ids in the fixtures are not contact ids, so the unchanged `find` matches `contact_id` and not `row.id === contactId`. Each graph is a trigger plus the nodes named below. `configured` is not `false`. `isValidatedPipeline` accepts trigger plus `if` or `action`.

The If graphs use the legacy pick: `pickTable` the table under test, `pickField` the text column below, `pickOp` `"eq"`, `pickValue` the passing text. The true edge is an `ascribe_tag` action with `tag` `"pkt006"`. The false edge is an `exit`. `contactIds` on the walk is the two contacts. Trigger `payload.writes` is the pointer list, in the order the case states. `writesFromPayload` already preserves that order.

1. For each of `fact_writebacks` (`field_key`), `meeting_booked` (`source`), and `wait_occupancy` (`title`): two contacts, A and B. A’s pointer id exists and the column equals `"keep"`. A decoy row for A has a different id, the same `contact_id`, column `"decoy"`, and a later `created_at` (for `wait_occupancy`, a later `created_at` is enough; the column compared is `title`). B’s only row has a different id and column `"other"`. The If detail is `if pick <table>.<field> then=1 else=1`. The true-edge `contact_tag` rows are A only. A loader that took the later decoy, or that sent both contacts down the true edge, fails this case.
2. Same three tables. The pointer id is absent. A row for that `contact_id` exists with the passing column, and its id is not the pointer id. Include a second contact the same way. The If detail is `if pick <table>.<field> then=0 else=2`. The true edge inserts no `contact_tag`. A loader that selected by `contact_id` would take `then=2`.
3. The detail strings in cases 1 and 2 are the person-split details. `npm run factory:check` reads `PERSON_WRITE_TABLES` and fails unless it contains `engagement_records`, `fact_writebacks`, `meeting_booked`, and `wait_occupancy`. It fails if the set contains `eligibility_evaluations`, `eligibility_results`, `signals`, or `motion_decisions`.
4. Case 1 is the two-contact split. A pass for A does not tag B.
5. Two `fact_writebacks` pointers, same `contact_id`, ids in list order. The first row’s `field_key` is `"first"`. The second is `"second"`. One contact on the run. A walk whose `pickValue` is `"first"` has `then=1`. A walk whose `pickValue` is `"second"` has `then=0`. `factory:check` fails if either `find` in `resolveOperandText` drops `row.contact_id === contactId || row.id === contactId`.
6. Three walks, one action each, types `manage_lists`, `assign_task`, and `notify_consultant`, no `inAppAffordance`, two `contactIds`. Each walk’s action `writes` has two `engagement_records` pointers. Each `id` equals `SELECT id FROM engagement_records` for that firm, that `contact_id`, and `event_kind` equal to the action type. Each `id` starts with `eng-` and is not the contact id. Each pointer’s `contact_id` is that contact. Two rows, not one.
7. Three walks, no `inAppAffordance`. `ascribe_tag` with one `contactId` succeeds, its `writes` are `contact_tag` only, and no `engagement_records` row has `event_kind` `ascribe_tag`. `run_audit` with one `contactId` and no `contact_records` row for it returns before the fallthrough: `contactsForAudit` yields no contacts, the node detail is not `run_audit; contacts=`, and no `engagement_records` row has `event_kind` `run_audit`. `call_agent` with one `contactId` may fail inside `enrollAndActuate` when no template is bound; the node detail is not `call_agent; contacts=`, and no `engagement_records` row has `event_kind` `call_agent`. `factory:check` fails unless each of those three branches `return`s before the `writeEngagement` loop.
8. One walk, `actionType` `manage_lists`, `inAppAffordance` a non-empty string, one `contactId`. The action status is success, `writes` is `[]`, the detail contains `silent until wrap`, and no `engagement_records` row exists for that firm. The early return is the raw `actionType` test quoted above. `factory:check` fails if that test loses `run_audit` or `ascribe_tag`.
9. `factory:check` reads `resolveRuleOperand` and fails unless that function still contains `SELECT value FROM fact_writebacks` with `firm_id=$1 AND contact_id=$2 AND field_key=$3` and `ORDER BY created_at DESC LIMIT 1`. The script does not walk a rule node.

`npm run factory:check` also reads `loadWriteRow` and fails unless it contains `SELECT * FROM fact_writebacks WHERE id=$1`, `SELECT * FROM meeting_booked WHERE id=$1`, and `SELECT * FROM wait_occupancy WHERE id=$1`, and fails if any of those three statements contains `firm_id`, `contact_id`, `ORDER BY`, or `LIMIT`. It fails unless the function still ends at `return null`. It does not fail when an `engagement_records` id branch is present or absent. It reads the fallthrough and fails unless the `id` pushed on `engagement_records` is the value returned by `writeEngagement` in that loop, and fails if that push uses `contactId` as `id`. It reads `writeEngagement` and fails unless the inserted id is `` `eng-${randomUUID()}` `` and that same binding is returned. It reads `evalIfPick` and the Switch visitor and fails unless each still iterates `for (const cid of ctx.contactIds)` and still calls `personTableOf`. Add `server/wire-service/workflowWalk.ts`, `server/wire-service/cascade.ts`, and `scripts/verify-id-keyed-loads.ts` to the path filter in `.github/workflows/factory-check.yml`.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

The desk list `handleEngagementRecordsList`. `objectiveSatisfiedBy`. Minting a list, a task, or a notify table. Removing the engagement insert. A `firm_id` predicate on these three loads. The audit pair (PKT-005). The chip filter that would choose among several rows for one contact. Launch Agent. No plate.

Also out of this packet: PKT-004’s `engagement_records` load and the `objective_met` payload. PKT-007’s fact `writes` array and PKT-008’s meeting `writes` array. PKT-009’s four eligibility loads and claim 52’s person split for those four tables. The approval wait insert. `resolveRuleOperand`. The Test door in `eventTest.ts`. The in-memory stand-in. `src/`.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `fact_writebacks`, `meeting_booked`, `wait_occupancy` | Same primary key `id`. No new column | `loadWriteRow` | Only verified |
| `loadWriteRow` | Three branches, `WHERE id=$1` bound to `w.id`. Other branches stay | If / Switch field reads | Modified |
| `PERSON_WRITE_TABLES` | Add `engagement_records`, `fact_writebacks`, `meeting_booked`. `wait_occupancy` stays | `personTableOf`, `personIdsFromWrites`, `ascribe_tag` pick | Modified |
| `personTableOf`, `evalIfPick`, Switch visitor | Unchanged. Membership turns those three tables onto the existing per-contact path | If true/false edges, Switch buckets | Only verified |
| `resolveOperandText` finds | Unchanged. First `contact_id` or `id` match, else `[0]` | If / Switch compares | Only verified |
| `personIdsFromWrites` | Unchanged. These pointers set `contact_id`, so the row id is not the person | Trigger contact list, action mapped slots | Only verified |
| Action fallthrough | Pointer `id` is the string `writeEngagement` returned. `contact_id` is the contact | `manage_lists`, `assign_task`, `notify_consultant` | Modified |
| `writeEngagement` | Same insert, same returned `eng-` id | Fallthrough and the other callers in `cascade.ts` | Only verified |
| `action` check constraint | Already allows the three kinds with a null `agent_ref` | `persistAction` | Only verified |
| In-app return, `call_agent`, `ascribe_tag`, `run_audit` | Still return before the fallthrough | Those action nodes | Only verified |
| Approval wait insert | Still pushes `RETURNING id` | `wait_occupancy` load | Only verified |
| `resolveRuleOperand` | Latest fact by firm, contact, and `field_key` stays | Rule node | Only verified |
| `scripts/verify-id-keyed-loads.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases and the shape guard | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| `loadWriteRow` returns null for these three tables. Each primary key is already `id`. The load is `WHERE id=$1` on `w.id`. A second query by `contact_id`, or `firm_id` / `ORDER BY` on that statement, is a different predicate than claim 10. | necessary |
| `PERSON_WRITE_TABLES` omits `engagement_records`, `fact_writebacks`, and `meeting_booked`. `evalIfPick` already tests each contact when `personTableOf` matches, and otherwise sends every contact down the true branch on one pass. Adding the three names is the split. `wait_occupancy` is already in the set. The four eligibility tables stay out. | necessary |
| The contact pick is `find` by `contact_id` or `id`, then the first row. Two pointers with the same `contact_id` already resolve to the first. The packet does not retune that find. Both copies in `resolveOperandText` stay. | necessary |
| The fallthrough inserts an `eng-` id and then pushes `contactId` as the pointer id, so the next node cannot load the row `writeEngagement` stored. The returned string is the pointer `id`. `contact_id` stays the contact. A second `randomUUID()` in the walker would publish an id that matches no row. | necessary |
| `call_agent`, `ascribe_tag`, and `run_audit` already return before that loop. The in-app return already commits `[]` and does not call `writeEngagement`. Those returns stay. `normalizeActionType` still maps `enroll_sequence` and unknown types to `call_agent`, so they do not reach the loop. | necessary |
| `personIdsFromWrites` uses `id` when `contact_id` is missing and the table is in the set. After the three names join, a pointer that omits `contact_id` would treat the row id as a person. The function stays. The fallthrough sets `contact_id`. PKT-004’s two pointers already set `contact_id`. | necessary |
| The approval wait already stores `wait_occupancy.id` from `RETURNING id` and pushes that id with `contact_id`. This packet only adds the load. `ON CONFLICT DO NOTHING` still publishes no pointer when the triple is already present. | necessary |
| `resolveRuleOperand` selects the latest `fact_writebacks.value` by firm, contact, and `field_key`. That reader is not `loadWriteRow`. The statement stays, so a rule compare does not become an id load. | necessary |
| `writeEngagement`’s other callers in `cascade.ts` ignore the return or already keep it. They do not push the generic-action pointer. This packet does not edit them. | adjacent |
| `handleFactWriteback` and `handleMeetingBook` dispatch without a `writes` array. The listening run therefore has no fact or meeting pointer until PKT-007 and PKT-008. This packet does not add those arrays. The id load is what a pointer already on the handle reads. | adjacent |
| PKT-009 adds the same id predicate for four other tables and leaves those tables out of `PERSON_WRITE_TABLES`. This packet does not add those branches and does not add those names. A branch that is already in the function stays. | adjacent |
| PKT-005 replaces the `sequence_ready` and `reachability_verdicts` loads and may export `loadWriteRow`. This packet does not edit those branches and does not add an export. An export already present stays. | adjacent |
| PKT-004’s change specification expects an `engagement_records` If to report `branch → true` because the table was not in the set. This packet puts the table in the set. A run that has `contactIds` then person-splits, and the passing contact still follows the true edge when the id load matches. This packet does not edit `SCP-pkt-004-firing-handle.md` or that verify. Do not remove `engagement_records` from the set to preserve the old detail string. | adjacent |
| The packet file still says `**Release:** draft`. The ledger stage for this revision was `released`, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
