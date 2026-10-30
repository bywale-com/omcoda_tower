# PKT-005 — An audit result row belongs to the run that wrote it

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 8, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. Claim 48’s firm constraint on the contact Get is not this key.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes

## Intended behavior

On `reachability_verdicts` and on `sequence_ready`, one row is one contact in one audit run. The primary key is `(audit_run_id, contact_id)`. `audit_run_id` is `audit_runs.id` of the run that wrote the row. `firm_id` stays a required column, set from that run’s firm. It is not what separates two runs. `(contact_id, firm_id)` is no longer unique.

A later audit inserts a new row. It does not update the earlier run’s row. There is no column named `id` on these tables. No second current-row table and no current-row column.

`RunWrite` stays `{ table, id, contact_id }`. For these two tables the pointer’s `id` is the `audit_run_id` and `contact_id` is the person. Both are required. The run id is not a person. `personIdsFromWrites` uses `contact_id` when it is set, so these pointers always carry it.

`loadWriteRow` loads that pair for the walk’s firm:

`audit_run_id = pointer.id AND contact_id = pointer.contact_id AND firm_id = the walk’s firm`

It does not select by contact and firm and take an arbitrary row. It does not apply “latest”. A pointer missing either field loads nothing.

**Who is ready now** is the latest row of that same table for `(firm_id, contact_id)`. Latest means the greatest `updated_at`. When two rows share that timestamp, the row whose `audit_runs.started_at` is later wins. A contact with no row is not ready, and the verdict is null. A contact a later audit does not mention keeps the earlier row, which is still the latest. The desk and the enroll gate do not wait for `audit_runs.status = 'complete'`.

Verdict values are not retuned. `ready` is still true for reachable or partial. `details` on the verdict keeps the rationale. `details.auditRunId` is not the key. `sequence_ready` has no `details` column.

How each named reader follows that key:

- `handleContactRecordsList` shows one verdict and one ready flag per contact: the latest row of each table for that contact and firm. Both list scopes. A join on `(contact_id, firm_id)` alone would repeat the contact.
- `handleOnboardingFire` enrolls a contact when that contact’s latest `sequence_ready` row for the firm has `ready` true. A historical `ready = true` that is not the latest does not enroll them. The contact is included once.
- `executeGet`, module `contacts`, emits one pointer to that latest verdict row and one to that latest ready row. The pointer’s `id` is that row’s `audit_run_id`, and `contact_id` is the person. No row means omit. The select still does not constrain `firm_id`. That omission is claim 48.
- `handleAuditRunGet` loads verdicts and ready rows whose `audit_run_id` is the id on the path and whose `firm_id` is the session firm. Ready joins on `audit_run_id` and `contact_id`. It is not the contact’s current flag. It does not read `details->>'auditRunId'`.
- `eventTest.ts` `door1` for `audit.completed` still takes the newest `audit_runs` row with `status = 'complete'` for the firm (`started_at` descending, limit 1). It then reads both person tables for that `audit_run_id`. The ready query is not “those contacts, whatever is ready now”. Each emitted write uses `id` = that run id and `contact_id` = the person. `writeId` must not prefer a column named `id` on these tables, because they have none. It must not use `contact_id` as the pointer id.
- `executeAuditRun` inserts a new pair of rows for this `audit_runs.id` and pushes pointers `{ id: runId, contact_id: contact.id }`. `contact_records` in the same loop stays one row per contact.

Rows that already exist keep the verdict and the ready flag the desk and the enroll gate show today, until a later audit inserts a new row for that contact. Assigning `audit_run_id` on those existing rows is the systems change. The assignment must leave that current flag as the latest row. It must not drop a contact a later header happens to omit, because today’s upsert does not do that. The analyst chooses the assignment that makes this true. Two assignments that both keep the same latest flag are the same product result.

## Existing behavior

The primary key is the contact and the firm. The writer upserts that pair and points the handle at the contact id:

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

The loader ignores the pointer id:

```661:673:server/wire-service/workflowWalk.ts
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

The contact Get emits the contact id as the pointer id and does not constrain firm:

```340:352:server/wire-service/workflowWalk.ts
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

The list joins one row per contact and firm (`machine.ts` `handleContactRecordsList`, both scopes). The enroll gate is `SELECT contact_id FROM sequence_ready WHERE firm_id=$1 AND ready=true` (`handleOnboardingFire`). The book read filters `details->>'auditRunId'` (`handleAuditRunGet`). Door 1 reads verdicts by that same JSON key and ready rows by the contact ids it found (`eventTest.ts` `door1`). `writeId` prefers `body.id`, then `contact_id` (`eventTest.ts`).

`audit_runs.started_at` already exists (`004_machine_tables.sql`).

Other statements that insert the old key and must follow the new one: `scripts/close-walk-gaps.ts`, `scripts/verify-automations-alive.ts`, `scripts/verify-machine-e2e.ts`, `scripts/verify-ship-spine.ts`. No seed file inserts these tables.

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof.

1. Two audit runs for one contact insert two verdict rows and two ready rows. The first run’s verdict and ready flag are still present after the second run.
2. The handle each run returns uses `id` = that run’s id and `contact_id` = the person. `loadWriteRow` with the first run’s pointer returns the first run’s verdict, not the second run’s.
3. A pointer with no `contact_id`, or an id that is not an `audit_run_id`, loads nothing. It does not return the latest row.
4. Who is ready now: the latest ready row for `(firm_id, contact_id)` by greatest `updated_at`, then later `audit_runs.started_at`. A historical `ready = true` that is not latest does not enroll. A contact the later run does not mention stays on the earlier row. A contact with no row is not ready and has a null verdict.
5. `handleAuditRunGet` for run A returns A’s rows only, joined to ready on `(audit_run_id, contact_id)`, and does not read `details->>'auditRunId'`.
6. Door 1 for `audit.completed` emits pointers whose `id` is the complete run it selected, not the contact id.
7. `executeGet` for contacts emits at most one verdict pointer and one ready pointer per contact, aimed at those latest rows, and still does not add `firm_id` to the contact select.
8. After the migration, and before any new audit, each contact’s displayed verdict and ready flag match the values stored before the migration.

## Dependencies

The primitive forbids a shadow copy and forbids “latest for this firm” as the handle. Latest-per-contact is only the desk and enroll read of these two tables.

PKT-004 changes `loadWriteRow` for `engagement_records` only. This packet changes the two audit branches of the same function. The predicates do not overlap.

## Out of scope

A column named `id`. Encoding the pair into one string. Copying the verdict onto the pointer. `contact_records` grain. Claim 48’s `firm_id` constraint on the contact Get. Verdict classification. Launch Agent. No plate. The glass shows the latest mark; this packet does not paint a new hole.

## Plates

None.
