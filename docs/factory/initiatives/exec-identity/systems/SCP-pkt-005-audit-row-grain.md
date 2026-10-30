# SCP-pkt-005 — An audit result row belongs to the run that wrote it

**Packet:** PKT-005 `pkt-005-audit-row-grain`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 8 at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. Claim 48’s firm constraint on the contact Get is not this key.  
**Contract:** `docs/factory/components/walk-handle/CONTRACT.md` — claim 8 is this packet. Claim 48 stays on the contact Get. The contract does not add a second current-row store.

## Intent

On `reachability_verdicts` and `sequence_ready`, one stored row is one contact in one audit run. The primary key is `(audit_run_id, contact_id)`. `audit_run_id` is `audit_runs.id` of the run that wrote the row. `firm_id` stays required and is copied from that run. It does not separate two runs. `(contact_id, firm_id)` is not unique.

A later audit inserts a new pair of rows. It does not update an earlier run’s rows. There is no column named `id` on these tables, no current-row table, and no current-row column.

`RunWrite` stays `{ table, id, contact_id }`. For these two tables `id` is the `audit_run_id` and `contact_id` is the person. Both are required. The run id is not a person.

`loadWriteRow` loads that pair for the walk’s firm, or it loads nothing. Who is ready now, and which verdict the desk shows, is a separate read: the latest row of that same table for `(firm_id, contact_id)`. Latest is the greatest `updated_at`, then the later `audit_runs.started_at`, then `audit_run_id` descending so a double timestamp tie is one row. That third key does not change the winner when `started_at` differs. A contact with no row is not ready, and the verdict is null. A contact a later audit does not mention keeps the earlier row. The desk and the enroll gate do not wait for `audit_runs.status = 'complete'`.

## Must / must-not

- Add `supabase/migrations/025_audit_row_grain.sql`. Do not edit `004_machine_tables.sql`. The migrator runs one file as one query (`scripts/run-migration.ts`). Put no `COMMIT` in the file.
- On both tables add `audit_run_id TEXT NOT NULL REFERENCES audit_runs(id) ON DELETE RESTRICT`, drop the primary key `(contact_id, firm_id)`, and add primary key `(audit_run_id, contact_id)`. Do not add a column named `id`. Do not add a unique constraint on `(contact_id, firm_id)`. Do not add a current-flag column.
- Keep `firm_id TEXT NOT NULL`, the verdict check, `details JSONB NOT NULL DEFAULT '{}'` on verdicts, `ready BOOLEAN NOT NULL DEFAULT false` on ready, and `updated_at`. The row-level security policies stay; they already key off `firm_id`.
- Assign `audit_run_id` on rows that already exist without changing `verdict`, `ready`, `details`, or `updated_at`, and without deleting a row. The assignment below is the one that leaves today’s displayed flag as the latest row. Do not drop a contact because some later `audit_runs` header omits them. Today’s upsert does not do that, and neither does this migration.
- `executeAuditRun` inserts a new pair for this `audit_runs.id`. Conflict target is `(audit_run_id, contact_id)` only, so a repeated contact inside one run updates that run’s row and a later run inserts. The pointer is `{ id: runId, contact_id: contact.id }` for both tables. `contact_records` in the same loop stays one row per contact, upserted on `contact_records.id`.
- `loadWriteRow` for these two tables returns the row where `audit_run_id = pointer.id AND contact_id = pointer.contact_id AND firm_id = the walk’s firm`. A missing `contact_id`, or an `id` that matches no run, returns null. It does not substitute `pointer.id` as the person, and it does not return the latest row.
- The desk (`handleContactRecordsList`, both scopes) and the enroll gate (`handleOnboardingFire`) read the latest row per `(firm_id, contact_id)` with the order in Intent. A historical `ready = true` that is not latest does not enroll. Each contact is included once.
- `handleAuditRunGet` loads verdicts for `audit_run_id` equal to the path id and `firm_id` equal to the session firm. Ready joins on `audit_run_id` and `contact_id`. It does not read `details->>'auditRunId'`. It does not substitute the contact’s latest ready flag.
- `eventTest.ts` `door1` for `audit.completed` still takes the newest `audit_runs` row with `status = 'complete'` for the firm (`started_at` descending, limit 1). It then reads both person tables for that `audit_run_id` and that firm. The ready query is not “those contacts, whatever is ready now”. Each emitted write uses `id` equal to that run id and `contact_id` equal to the person.
- `writeId` for these two tables returns `body.audit_run_id` when that string is present, and otherwise `` `${table}-specimen` ``. It does not prefer `body.id`. It does not return `body.contact_id`. Other tables keep today’s `id`, then `contact_id`, then the specimen fallback.
- Verdict values are not retuned. `ready` is still true for `reachable` or `partial`. `details` still stores `{ auditRunId: runId, rationale }`. That JSON field is not the key.
- Do not change `personIdsFromWrites`, `RunWrite`, `writesFromPayload`, the `enrollment` or `engagement_records` branches of `loadWriteRow`, or `contact_records` grain. Every pointer this packet publishes sets `contact_id`, because `personIdsFromWrites` falls back to `id` for these tables when `contact_id` is absent, and that `id` is now the run.
- Do not wait on `audit_runs.status` in the desk or enroll queries. Door 1’s existing `status = 'complete'` filter stays.

## Stores and contracts

`audit_runs.id` is already the run primary key, and `started_at` already exists. This packet does not add a column there.

```383:393:supabase/migrations/004_machine_tables.sql
CREATE TABLE IF NOT EXISTS audit_runs (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'complete', 'failed')),
  enabled_checks JSONB NOT NULL DEFAULT '[]'::jsonb,
  import_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
```

The planted person tables are one row per contact per firm. The new migration replaces that key. No seed file inserts these tables.

```245:260:supabase/migrations/004_machine_tables.sql
CREATE TABLE IF NOT EXISTS reachability_verdicts (
  contact_id TEXT NOT NULL,
  firm_id TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('reachable', 'partial', 'unreachable')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, firm_id)
);

CREATE TABLE IF NOT EXISTS sequence_ready (
  contact_id TEXT NOT NULL,
  firm_id TEXT NOT NULL,
  ready BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, firm_id)
);
```

The handle type stays. `contact_id` is optional on the type and required on the two pointers this writer publishes.

```1:6:server/wire-service/runWrites.ts
/** This run’s writes — the next node’s input. Not an events table. */
export type RunWrite = {
  table: string;
  id: string;
  contact_id?: string | null;
};
```

`personIdsFromWrites` already prefers `contact_id`. These two tables are in `PERSON_WRITE_TABLES`, so a missing `contact_id` would treat `id` as a person. Leave the function. The writers set `contact_id`.

```264:268:server/wire-service/workflowWalk.ts
function personIdsFromWrites(writes: RunWrite[]): string[] {
  return uniqueIds(
    writes.map((w) => w.contact_id ?? (PERSON_WRITE_TABLES.has(w.table) ? w.id : null)),
  );
}
```

The registered write-set for `audit.completed` stays ord 0 `audit_runs`, ord 1 `contact_records`, ord 2 `reachability_verdicts`, ord 3 `sequence_ready` (`017_event_test_contract.sql`). The live handle is the `writes` array on the payload. Do not read `event_write_set` or `event_test_data` to build it. Do not rewrite the harbor specimen bodies in `017`.

Latest-row order, used by the desk and the enroll gate and by the contact Get’s one-pointer reduction. `ar.status` is not in the predicate.

```sql
ORDER BY rv.updated_at DESC, ar.started_at DESC, rv.audit_run_id DESC
```

`sequence_ready` uses the same three keys on `sr`.

Indexes for that read:

```sql
CREATE INDEX reachability_verdicts_latest_idx
  ON reachability_verdicts (firm_id, contact_id, updated_at DESC);
CREATE INDEX sequence_ready_latest_idx
  ON sequence_ready (firm_id, contact_id, updated_at DESC);
```

The primary key `(audit_run_id, contact_id)` is the pair load and the book read. No second index is required for those.

### Assignment for rows that already exist

1. Add `audit_run_id TEXT` nullable on both tables.
2. On `reachability_verdicts`, set `audit_run_id` from `details->>'auditRunId'` when that value equals `audit_runs.id` and `audit_runs.firm_id` equals the row’s `firm_id`.
3. On `sequence_ready`, copy `audit_run_id` from the verdict row with the same `(contact_id, firm_id)` when that verdict already has one.
4. For each `firm_id` that still has a null `audit_run_id` on either table, insert one `audit_runs` row when that id is absent: `id = 'arun-kept-' || md5(firm_id)`, `firm_id` that firm, `status = 'complete'`, `import_ids = '[]'`, `summary = '{}'`, `started_at` equal to the greatest `updated_at` among that firm’s still-unassigned rows (or `now()` when none). Point every remaining null row of that firm at that id. `md5(text)` is built into Postgres. Do not filter those rows by any other run’s contact list.
5. If any row is still null, the migration fails.
6. Set `NOT NULL`, swap the primary key, add the foreign key `ON DELETE RESTRICT`.

Steps 2 through 4 assign only `audit_run_id`. They do not `DELETE` from either table and do not `SET verdict` or `SET ready`. One row per contact per firm goes in, so that row is the latest until a later audit inserts. Two assignments that keep that same latest flag are the same product result; this is the assignment.

## Runtime

`executeAuditRun` today upserts the contact-and-firm pair and points the handle at the contact:

```76:91:server/wire-service/auditRun.ts
    await pool.query(
      `INSERT INTO reachability_verdicts (contact_id, firm_id, verdict, details)
       VALUES ($1,$2,$3,$4::jsonb)
       ON CONFLICT (contact_id, firm_id) DO UPDATE SET
         verdict=EXCLUDED.verdict, details=EXCLUDED.details, updated_at=now()`,
      [contact.id, opts.firmId, verdict, JSON.stringify({ auditRunId: runId, rationale })],
    );
    writes.push({ table: "reachability_verdicts", id: contact.id, contact_id: contact.id });

    await pool.query(
      `INSERT INTO sequence_ready (contact_id, firm_id, ready)
       VALUES ($1,$2,$3)
       ON CONFLICT (contact_id, firm_id) DO UPDATE SET ready=EXCLUDED.ready, updated_at=now()`,
      [contact.id, opts.firmId, ready],
    );
    writes.push({ table: "sequence_ready", id: contact.id, contact_id: contact.id });
```

Replace those two statements. Insert `audit_run_id` as `$1` (`runId`), then `contact_id`, `firm_id`, and the same verdict, details, and ready values. `ON CONFLICT (audit_run_id, contact_id) DO UPDATE` sets `verdict`, `details`, `ready`, `firm_id`, and `updated_at = now()` for that same pair only. Push `{ table, id: runId, contact_id: contact.id }` for each. Leave the `audit_runs` insert, the `audit_runs` pointer `{ table: "audit_runs", id: runId }`, the `contact_records` upsert, the verdict formula, and the final `status = 'complete'` update.

`handleAuditRunCreate` and the in-walk `run_audit` action already put `result.writes` on the `audit.completed` payload and pass `contactIds` as the person ids. Those call sites stay. Do not put the run id into `contactIds`.

The walk uses those `contactIds` when they are present, and only then `personIdsFromWrites`:

```1091:1094:server/wire-service/workflowWalk.ts
  let contactIds = opts.contactIds ?? [];
  const triggerWrites = writesFromPayload(opts.triggerPayload);
  if (!contactIds.length) {
    contactIds = personIdsFromWrites(triggerWrites);
```

`loadWriteRow` ignores the pointer id today and takes an arbitrary row for the contact and firm:

```660:673:server/wire-service/workflowWalk.ts
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
```

Replace those two branches with literal SQL, not an interpolated table name. If `w.contact_id` is absent, return null before querying. Otherwise:

```sql
SELECT * FROM sequence_ready
 WHERE audit_run_id=$1 AND contact_id=$2 AND firm_id=$3
```

and the same predicate on `reachability_verdicts`, with `[w.id, w.contact_id, firmId]`. No `ORDER BY`, no `LIMIT`, no `details->>'auditRunId'`. Leave `const contactId = w.contact_id ?? w.id` in place for any later branch that still uses it. Leave the `contact_records`, `audit_runs`, `enrollment`, and `engagement_records` branches. Export `loadWriteRow` so the check can call it. Do not export the rest of the walker.

`resolveOperandText` and `noteFromVerdict` already match `contact_id` or `id` to the person. With `contact_id` set, they find the person while `id` is the run. Do not edit them, and do not make them read the latest row.

The contact Get emits one row per contact today and uses the contact id as the pointer. It does not constrain firm on the unscoped contact select:

```324:352:server/wire-service/workflowWalk.ts
  if (module === "contacts") {
    let q = `SELECT id, firm_id FROM contact_records`;
    const params: unknown[] = [];
    if (select !== "every") {
      if (!class1) return { writes: [] };
      q += ` WHERE firm_id=$1`;
      params.push(class1);
      if (!class2All) {
        q += ` AND id = ANY($2::text[])`;
        params.push(class2);
      }
    }
    const { rows } = await pool.query<{ id: string }>(q, params);
    const ids = rows.map((r) => r.id);
    const writes: RunWrite[] = ids.map((id) => ({ table: "contact_records", id, contact_id: id }));
    if (ids.length) {
      const verdicts = await pool.query<{ contact_id: string }>(
        `SELECT contact_id FROM reachability_verdicts WHERE contact_id = ANY($1::text[])`,
        [ids],
      );
      for (const row of verdicts.rows) {
        writes.push({ table: "reachability_verdicts", id: row.contact_id, contact_id: row.contact_id });
      }
      const ready = await pool.query<{ contact_id: string }>(
        `SELECT contact_id FROM sequence_ready WHERE contact_id = ANY($1::text[])`,
        [ids],
      );
```

Leave the contact select, including the absence of `firm_id` when `select === "every"`. Replace the two person queries so each returns at most one row per `contact_id`: `DISTINCT ON (contact_id)` joined to `audit_runs`, ordered by `contact_id` and then the latest-row keys. The pointer `id` is that row’s `audit_run_id`. No row means omit the pointer. When `select !== "every"`, add `firm_id = class1` on those two queries, because the contact select already scoped to that firm. When `select === "every"`, do not add `firm_id`. Export `executeGet`. The `audits` module in the same function stays `SELECT id FROM audit_runs`.

The list joins one row per contact and firm today. After the key change that join repeats the contact. Both scopes (`session` and `every_firm`) keep one contact row by replacing each plain join with `LEFT JOIN LATERAL ( … ORDER BY updated_at DESC, started_at DESC, audit_run_id DESC LIMIT 1 )` on `contact_id` and `firm_id` equal to the contact’s. No row leaves `reachability` and `sequence_ready` null. The response mapper stays: null verdict stays null, and null ready stays null rather than false.

```1842:1855:server/wire-service/machine.ts
         LEFT JOIN reachability_verdicts rv ON rv.contact_id = c.id AND rv.firm_id = c.firm_id
         LEFT JOIN sequence_ready sr ON sr.contact_id = c.id AND sr.firm_id = c.firm_id
         ORDER BY f.name ASC NULLS LAST, c.name ASC NULLS LAST, c.id ASC`
      : `SELECT c.id, c.firm_id, c.email, c.phone, c.name, c.notes, f.name AS firm_name, c.created_at,
            COALESCE((
              SELECT json_agg(ct.tag ORDER BY ct.created_at)
              FROM contact_tag ct WHERE ct.contact_id = c.id AND ct.firm_id = c.firm_id
            ), '[]'::json) AS tags,
            rv.verdict AS reachability,
            sr.ready AS sequence_ready
         FROM contact_records c
         LEFT JOIN ct_firms f ON f.id = c.firm_id
         LEFT JOIN reachability_verdicts rv ON rv.contact_id = c.id AND rv.firm_id = c.firm_id
         LEFT JOIN sequence_ready sr ON sr.contact_id = c.id AND sr.firm_id = c.firm_id
```

The enroll gate today selects every ready row for the firm:

```802:805:server/wire-service/machine.ts
  const ready = await pool.query<{ contact_id: string }>(
    `SELECT contact_id FROM sequence_ready WHERE firm_id=$1 AND ready=true`,
    [firm],
  );
```

Replace it with the latest row per `contact_id` for that firm, then keep the contact only when that latest `ready` is true. The existing loop enrolls `ready.rows`. The query is what makes each contact appear once.

The book read filters the JSON key and joins ready on contact and firm:

```634:640:server/wire-service/machine.ts
    `SELECT rv.contact_id, rv.verdict, rv.details, cr.email, cr.phone, cr.name, sr.ready
     FROM reachability_verdicts rv
     LEFT JOIN contact_records cr ON cr.id = rv.contact_id
     LEFT JOIN sequence_ready sr ON sr.contact_id = rv.contact_id AND sr.firm_id = rv.firm_id
     WHERE rv.firm_id=$1 AND COALESCE(rv.details->>'auditRunId', '') = $2
     ORDER BY cr.name ASC NULLS LAST, rv.contact_id ASC`,
    [firm, runId],
```

Filter `rv.audit_run_id = $2 AND rv.firm_id = $1`. Join ready with `sr.audit_run_id = rv.audit_run_id AND sr.contact_id = rv.contact_id`. Keep the select list, the contact join, the order, and the response mapper `ready ?? row.verdict !== "unreachable"`. That mapper runs only when the join misses. Do not replace a miss with the contact’s latest ready row.

Door 1 selects verdicts by the JSON key and ready rows by those contact ids:

```101:131:server/wire-service/eventTest.ts
    if (eventName === "audit.completed") {
      const run = await pool.query(
        `SELECT * FROM audit_runs WHERE firm_id=$1 AND status='complete' ORDER BY started_at DESC LIMIT 1`,
        [firm],
      );
      if (!run.rowCount) return null;
      const runId = run.rows[0].id as string;
      out.push(...toWrites("audit_runs", run.rows as Record<string, unknown>[]));
      const verdicts = await pool.query(
        `SELECT rv.*, cr.name, cr.email, cr.phone
         FROM reachability_verdicts rv
         LEFT JOIN contact_records cr ON cr.id = rv.contact_id
         WHERE rv.firm_id=$1 AND COALESCE(rv.details->>'auditRunId','')=$2`,
        [firm, runId],
      );
      const ids = verdicts.rows.map((row) => row.contact_id);
      if (ids.length) {
        const contacts = await pool.query(
          `SELECT * FROM contact_records WHERE firm_id=$1 AND id = ANY($2::text[])`,
          [firm, ids],
        );
        out.push(...toWrites("contact_records", contacts.rows as Record<string, unknown>[]));
      }
      out.push(...toWrites("reachability_verdicts", verdicts.rows as Record<string, unknown>[]));
      if (ids.length) {
        const ready = await pool.query(
          `SELECT * FROM sequence_ready WHERE firm_id=$1 AND contact_id = ANY($2::text[])`,
          [firm, ids],
        );
        out.push(...toWrites("sequence_ready", ready.rows as Record<string, unknown>[]));
      }
      return out;
    }
```

Keep the run select and the `audit_runs` push. Load verdicts with `rv.audit_run_id = $runId AND rv.firm_id = $firm`. Load ready with `audit_run_id = $runId AND firm_id = $firm`, not with the verdict contact list. Keep the `contact_records` push for the verdict contact ids of this run. `writeId` today prefers a column named `id`, then `contact_id`:

```15:19:server/wire-service/eventTest.ts
function writeId(table: string, body: Record<string, unknown>): string {
  if (typeof body.id === "string" && body.id) return body.id;
  if (typeof body.contact_id === "string" && body.contact_id) return body.contact_id;
  return `${table}-specimen`;
}
```

Special-case the two tables first, as in Must. `SELECT *` after the migration includes `audit_run_id` and does not include `id`, so door 1’s emitted `id` is the complete run it selected.

These statements insert the old key and must insert `audit_run_id` of an `audit_runs` row they have just inserted for that firm. Remove `ON CONFLICT (contact_id, firm_id)`.

- `scripts/close-walk-gaps.ts` forces `sequence_ready.ready = true` for firm A’s contacts before onboarding fire. Insert one new `audit_runs` row for that firm, then one `sequence_ready` row per contact with that `audit_run_id`, `ready = true`, and `updated_at = now()`, so the forced flag is the latest. Do not update an earlier run’s row.
- `scripts/verify-automations-alive.ts` inserts one ready contact the same way, with its own new run id.
- `scripts/verify-machine-e2e.ts` and `scripts/verify-ship-spine.ts` already insert an `audit_runs` id. Pass that id as `audit_run_id` on both person inserts. Their existence checks for a fresh contact still see one row.

## Ports

No new port.

These stay on the same functions:

- `POST` audit-run create (`handleAuditRunCreate`) and the walk action `run_audit`. The response `writes` array gains the new pointer ids because it returns `executeAuditRun`’s writes.
- `GET` one audit run (`handleAuditRunGet`) and `GET` contact records (`handleContactRecordsList`, `scope` `session` and `every_firm`). Same JSON fields: `verdict` / `reachability`, `ready` / `sequenceReady`.
- `POST` onboarding fire (`handleOnboardingFire`). Same response. The ready set is the latest row.
- `handleEventTestContract` for `audit.completed`. Door 1’s write objects for the two person tables use the run id as `id`.
- `dispatchEventToWorkflows` is not edited. Callers that already pass `result.writes` and person `contactIds` keep doing that.

`loadWriteRow` and `executeGet` become exports. They are not HTTP routes.

## Verify

`scripts/verify-audit-row-grain.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` after migrate and seed, beside `verify-click-attribution`. `npm run build` is not this proof.

The script uses a firm id `firm-pkt005-` plus a run token, inserts its own `contact_records`, and calls `executeAuditRun`, `loadWriteRow`, `executeGet`, `handleContactRecordsList`, `handleAuditRunGet`, `handleOnboardingFire`, and `handleEventTestContract`. It sets `AUTH_DISABLED` and `DEV_SESSION_FIRM` to that fixture firm for the handler calls, the same way a session-scoped handler resolves the firm when auth is disabled. It does not use the seeded Harbor firm. It deletes the rows it inserts, including enrollments, audit runs, and the two person tables.

`executeAuditRun` is the writer. A contact with email and phone is `reachable` and ready. A contact with neither is `unreachable` and not ready. The script may `UPDATE` `updated_at` and `audit_runs.started_at` after the writer returns so the order is fixed. Do not add a timestamp argument to `executeAuditRun`.

1. Two `executeAuditRun` calls for one contact insert two verdict rows and two ready rows. The first run’s `verdict` and `ready` are still present after the second call.
2. Each call’s `writes` for the two tables use `id` equal to that call’s run id and `contact_id` equal to the person. `loadWriteRow` with the first run’s pointer and the fixture firm returns the first run’s verdict, not the second run’s.
3. `loadWriteRow` with no `contact_id`, and `loadWriteRow` whose `id` is not an `audit_run_id`, return null while a latest row for that contact exists.
4. Latest ready: same `updated_at` on two ready rows, the later `audit_runs.started_at` wins. A historical `ready = true` that is not latest does not enroll. Build that with run 1 writing A and B ready, and run 2 writing only A as unreachable. Set run 2’s `updated_at` later than run 1. Enroll, after `campaign_states.state = 'running'` for the fixture firm and with no active `audit.completed` workflow on that firm, inserts one enrollment for B and none for A. A third contact with no person row is absent from enroll, and the list returns null verdict and null `sequenceReady` for them. B remains ready from run 1.
5. `handleAuditRunGet` for run 1 returns A’s first verdict and B’s verdict, with ready joined on `(audit_run_id, contact_id)`, and does not return A’s later unreachable row. The handler source does not contain `details->>'auditRunId'`.
6. Door 1: two complete runs. Give run 1 the later `started_at` on `sequence_ready.updated_at` and the earlier `audit_runs.started_at`, and run 2 the opposite, so the newest complete run is run 2 while A’s latest ready flag is still run 1’s true. `handleEventTestContract` for `audit.completed` returns door 1. The verdict and ready writes use `id` equal to run 2, not the contact id, and A’s ready write is run 2’s false.
7. `executeGet` with `getModule: "contacts"`, `getSelect` other than `"every"`, and `getClass1` the fixture firm emits one verdict pointer and one ready pointer for A, `id` equal to A’s latest `audit_run_id`. The contact with no person row is in `contactIds` and has neither pointer. The contact select in source, when `select === "every"`, is still `SELECT id, firm_id FROM contact_records` with no `firm_id` predicate added in this packet.
8. The migration does not rewrite stored flags. `npm run factory:check` reads `025_audit_row_grain.sql` and fails if it contains `DELETE FROM reachability_verdicts`, `DELETE FROM sequence_ready`, `SET verdict`, or `SET ready`. It fails unless both tables gain `PRIMARY KEY (audit_run_id, contact_id)` and `audit_run_id TEXT`. It fails if the file adds a column named `id`. The script also inserts one verdict and one ready row for a fresh contact and reads them back from `handleContactRecordsList` unchanged. Ship CI runs after migrate, so this case does not rebuild the pre-migration database. The shape guard is the proof that existing values are assigned an `audit_run_id` and not replaced.

`npm run factory:check` also reads the planted writers and fails unless `executeAuditRun` inserts `audit_run_id` and pushes `id: runId` with `contact_id: contact.id`, and unless that file contains no `ON CONFLICT (contact_id, firm_id)`. It fails unless `loadWriteRow` contains `audit_run_id=$1 AND contact_id=$2 AND firm_id=$3` for both tables and those two statements have no `ORDER BY`. It fails unless `handleAuditRunGet` joins ready on `audit_run_id` and `contact_id`. It fails unless `writeId` checks `audit_run_id` for these two tables before `body.id` or `body.contact_id`. Add `server/wire-service/auditRun.ts`, `server/wire-service/workflowWalk.ts`, `server/wire-service/machine.ts`, `server/wire-service/eventTest.ts`, `scripts/verify-audit-row-grain.ts`, `supabase/migrations/025_audit_row_grain.sql`, `scripts/close-walk-gaps.ts`, `scripts/verify-automations-alive.ts`, `scripts/verify-machine-e2e.ts`, and `scripts/verify-ship-spine.ts` to the path filter in `.github/workflows/factory-check.yml`.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

A column named `id`. Encoding the pair into one string. Copying the verdict onto the pointer. `contact_records` grain. Claim 48’s `firm_id` constraint on the unscoped contact Get (`select === "every"`). Verdict classification, including claim 58’s silence arms. Launch Agent. No plate. The glass shows the latest mark through the list handler; this packet does not paint a new hole.

Also out of this packet: PKT-004’s `engagement_records` load and `objective_met` payload. PKT-003’s resume fill. Claim 10’s id load of the tables that already have a single-column primary key. The `audits` Get module. Rewriting `event_test_data` specimen JSON or the client projector in `src/app/data/testWalk.ts` and `src/app/data/eventTestContract.ts`. The in-memory stand-in maps in `src/app/wire/standins/machineApi.ts`. `verify-modular-surfaces.ts`, which reads that stand-in.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `reachability_verdicts`, `sequence_ready` | Primary key `(audit_run_id, contact_id)`. `firm_id` stays required. Latest is a query | Migration `025`, writer, loader, desk, enroll, book, door 1 | Modified |
| Existing rows | `audit_run_id` assigned. `verdict`, `ready`, `details`, `updated_at` unchanged. No deletes | Desk and enroll before the next audit | Modified |
| `executeAuditRun` | Insert the pair. Pointer `id` is `runId`, `contact_id` is the person | `handleAuditRunCreate`, `run_audit` | Modified |
| `RunWrite`, `personIdsFromWrites`, `writesFromPayload` | Unchanged. These pointers always set `contact_id` | Walk person split, If match | Only verified |
| `loadWriteRow` | The two audit branches load the pair and firm. Other branches stay | If / Switch, `noteFromVerdict`, verify script | Modified |
| `executeGet` contacts | One latest pointer per contact. Unscoped contact select stays without `firm_id` | Get node | Modified |
| `handleContactRecordsList` | Lateral latest join, both scopes. One row per contact | Contacts desk | Modified |
| `handleOnboardingFire` | Enroll only when the latest ready row is true | Onboarding fire | Modified |
| `handleAuditRunGet` | Rows for that run id and firm. Ready joins the pair. No JSON key | Book read | Modified |
| `door1` `audit.completed`, `writeId` | Person tables for the selected complete run. `id` is that run | `handleEventTestContract` | Modified |
| `event_write_set` `audit.completed` v1 | Ords unchanged. Not read at write time | Live `writes` array | Only verified |
| `close-walk-gaps.ts`, `verify-automations-alive.ts`, `verify-machine-e2e.ts`, `verify-ship-spine.ts` | Insert `audit_run_id`. Drop the old conflict target | Those scripts | Modified |
| `scripts/verify-audit-row-grain.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases and the shape guard | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| The planted primary key is `(contact_id, firm_id)` and the writer upserts it, so a second run replaces the first. The new key is `(audit_run_id, contact_id)` and the writer inserts. `ON CONFLICT` on that pair updates only the same run. | necessary |
| `loadWriteRow` selects by contact and firm and returns `rows[0]` with no order. After two rows exist, that load is not the run the pointer names. The pair predicate plus a null `contact_id` returning null is the load. It does not fall through to latest. | necessary |
| `personIdsFromWrites` uses `id` when `contact_id` is missing, and these tables are person tables. The run id must not become the person. The function stays. `executeAuditRun`, the contact Get, and door 1 set `contact_id` on every pointer they emit for these tables. `contactIds` on `audit.completed` stays the person list. | necessary |
| The desk join and the enroll `SELECT … ready=true` return every historical row once the key is no longer unique. Both readers take the latest row per `(firm_id, contact_id)` and do not filter on `audit_runs.status`. Enroll includes a contact once, and only when that latest flag is true. A contact omitted from a later run keeps the earlier row. | necessary |
| `handleAuditRunGet` and door 1 identify the run through `details->>'auditRunId'`. Door 1 then loads ready by contact id, which is the current flag, not the selected run. Both read `audit_run_id`. The JSON field remains inside `details` and is not the key. | necessary |
| `writeId` prefers `body.id`, then `contact_id`. These tables have no `id` column, and `contact_id` is the person, not the pointer id. The two-table branch returns `audit_run_id` or the specimen fallback. Other tables keep the old order. | necessary |
| Rows already stored have no `audit_run_id`. Assigning one from a matching `details.auditRunId` and the same firm, then from the sibling verdict, then from one kept run per firm (`arun-kept-` plus `md5(firm_id)`), leaves each current flag as the only row and therefore the latest. The migration does not delete and does not rewrite `verdict` or `ready`. A contact missing from a later header stays. | necessary |
| The contact select for `select === "every"` has no `firm_id` predicate. Acceptance case 7 forbids adding one. The firm-scoped Get (`select !== "every"`) already passes `class1` and the latest queries use it. The unscoped path still emits at most one pointer per `contact_id` and can point at another firm’s row. That is claim 48. | adjacent |
| PKT-004 replaces nothing in these two branches. It adds `loadWriteRow` for `engagement_records` by `id`. If that branch is already in the function, it stays. This packet exports `loadWriteRow` so the check can call the audit branches. PKT-003’s resume fill is a different write path. | adjacent |
| `resolveOperandText` and `noteFromVerdict` match `contact_id` as well as `id`. They keep finding the person once `contact_id` is set. They are not changed into a latest read. | necessary |
| `scripts/close-walk-gaps.ts`, `verify-automations-alive.ts`, `verify-machine-e2e.ts`, and `verify-ship-spine.ts` insert the old conflict target. After the primary key drops, those statements fail. Each inserts `audit_run_id` of a run row it created. `verify-modular-surfaces.ts` reads the in-memory stand-in, not these tables. | necessary |
| Door 2 specimen bodies in `017_event_test_contract.sql` and the client copies in `src/app/data/testWalk.ts` and `eventTestContract.ts` still have no `audit_run_id`. `writeId` will not promote their `contact_id` into the pointer id. The named reader is door 1. The stand-in maps in `machineApi.ts` are a second store keyed by contact. This packet does not plant `src/`. | adjacent |
| The packet file still says `**Release:** draft`. The ledger stage for this revision is `released`, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
