# SCP-pkt-015 — A contact halt blocks a new enroll only in the firm stored on that halt row

**Packet:** PKT-015 `pkt-015-halt-enroll-firm`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 18, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`. The revision under claim 19 leaves this enroll predicate unchanged.  
**Contract:** The packet names no component contract. `docs/factory/components/firing-pointers/CONTRACT.md`, `docs/factory/components/walk-handle/CONTRACT.md`, and `docs/factory/components/pursuit-identity/CONTRACT.md` do not list claim 18. This packet does not edit those files.

## Intent

`isHaltBlockingNew` still answers whether `enrollAndActuate` may insert. One statement stays an existence check. `LIMIT 1` stays. There is no `ORDER BY`. The bind list stays `[firmId, contactId ?? null]`.

The firm-book arm stays `scope = 'firm-book' AND firm_id = $1`, and `lifted_at` is still null for the whole statement. An active firm-book row for the enroll firm blocks. A firm-book row for another firm does not. The firm-book arm has no contact predicate. A null `contact_id` on that row does not change the block.

The contact arm becomes `scope = 'contact' AND contact_id = $2 AND firm_id = $1`. The `$2::text IS NOT NULL` guard stays, so the arm still runs only when the contact argument is not null. A contact halt whose `firm_id` is the enroll firm blocks. A contact halt whose `firm_id` is some other firm does not. A row with `lifted_at` set does not block. Two active contact halts in this firm for this contact are one block. The function returns a boolean. It does not delete a row and it does not choose between the two. This packet does not add a unique constraint.

`enrollAndActuate` still calls `isHaltBlockingNew(input.firmId, input.contactId)` and still returns `blocked: "halt"` before the enrollment insert when the check is true. That return still sets `enrollmentId` and `attemptId` to empty strings and still does not update an enrollment or an attempt that already exists. When the check is false, the insert still runs. `fireFirstStep` stays as the caller passed it. `call_agent` still passes `firmId: opts.firmId` and `fireFirstStep: true`, so an enroll this predicate allows still enters `actuateChannelSend`. This packet does not retune `fireFirstStep`.

The predicate is the function, so every `enrollAndActuate` caller inherits the firm-scoped contact arm. This packet does not change the `firmId` those callers pass. `call_agent` still passes the walk’s firm. `handleSequenceEnrollContacts` still passes `row.firm_id`. `handleEnrollmentCreate` still passes the request firm. The onboarding fallback and the eligibility fallback still pass their firm arguments. `EnrollActuateInput.contactId` stays `string`. The null-contact case is the predicate’s optional argument. This packet does not widen the enroll input.

`consentAndHaltGate` still selects a contact halt by `contact_id` alone. `handleHaltIsContact` still does the same. The stand-in `isContactHalted` still returns true on `contactId` alone. The real `isContactHalted` still calls `GET /halt/contact/:contactId`. Claim 19 owns the contact arm of the send. This packet does not edit those readers. A send that `consentAndHaltGate` denies is not `blocked: "halt"`. The enrollment row from an allowed enroll remains.

`dispatchEventToWorkflows` is not edited. Claim 17’s audience branch stays as PKT-014 specified it. The audience is not this predicate. No migration is added. The contact partial index stays on `contact_id` alone.

## Must / must-not

- Replace the contact arm inside `isHaltBlockingNew`. Keep one statement, the firm-book arm, the null guard, `LIMIT 1`, and the same two binds. Do not add a third parameter. Do not split the arms into two queries. Do not add `ORDER BY`.

```ts
const halted = await pool.query(
  `SELECT 1 FROM halt_records
   WHERE lifted_at IS NULL
     AND ((scope = 'firm-book' AND firm_id = $1)
       OR ($2::text IS NOT NULL AND scope = 'contact' AND contact_id = $2 AND firm_id = $1))
   LIMIT 1`,
  [firmId, contactId ?? null],
);
return Boolean(halted.rowCount && halted.rowCount > 0);
```

- Leave the early return in `enrollAndActuate` before `INSERT INTO enrollment`. The call stays `isHaltBlockingNew(input.firmId, input.contactId)`. The returned `blocked` value stays `"halt"`. Do not update `enrollment` or `active_attempts` on that branch. Do not close, exhaust, or lift an attempt that already exists.
- Do not edit the `call_agent` enroll. `firmId` stays `opts.firmId`. `fireFirstStep` stays `true`. The `blocked === "halt"` continue stays.
- Do not edit `handleSequenceEnrollContacts`. The every-firm door stays `SELECT id, firm_id FROM contact_records` with no `WHERE`. The enroll argument stays `firmId: row.firm_id`.
- Do not edit `handleEnrollmentCreate`, `handleOnboardingFire`, or `runContactEligibilityCascade`. Their `firmId` arguments stay `firm`, `firm`, and `opts.firm`.
- Do not edit `consentAndHaltGate`. The contact statement stays `scope = 'contact' AND contact_id = $1` bound to `[contactId]`. The firm-book statement in that function stays `scope = 'firm-book' AND firm_id = $1`. The consent select `WHERE contact_id = $1 LIMIT 1` stays.
- Do not edit `handleHaltIsContact` or `handleHaltIsFirmBook`. Do not edit `routes.ts`. `GET /halt/contact/:contactId` stays.
- Do not edit `standInHaltStore.isContactHalted` or `realHaltStore.isContactHalted`. Do not add a `firmId` argument to `HaltStorePort.isContactHalted`. Do not edit `createEnrollment` in `src/app/wire/standins/machineApi.ts` or `collectReasons` in `src/app/wire/standins/sendGate.ts`.
- Do not edit `dispatchEventToWorkflows`, `walkValidatedWorkflow`, or `tickOnce`. Do not add a migration. Do not rewrite `halt_records_contact_active_idx`. Do not add a unique constraint on an active contact halt. Do not join another firm’s contact by email or phone. `actuateChannelSend` still loads `contact_records` with `id=$1 AND firm_id=$2`.

## Stores and contracts

No new table and no new column. No migration. `halt_records.id` is `TEXT PRIMARY KEY`. `consultant_id` and `firm_id` are `NOT NULL`. `contact_id` is nullable. `scope` is `contact` or `firm-book`. `lifted_at` is nullable. There is no foreign key from `halt_records.contact_id` to `contact_records`, and no foreign key from `halt_records.firm_id` to `ct_firms`. A halt row may name a firm that is not the firm on the contact row.

```19:36:supabase/migrations/003_ct_wire_stores.sql
CREATE TABLE IF NOT EXISTS halt_records (
  id TEXT PRIMARY KEY,
  consultant_id TEXT NOT NULL,
  contact_id TEXT,
  firm_id TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('contact', 'firm-book')),
  reason TEXT,
  halted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lifted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS halt_records_firm_active_idx
  ON halt_records (firm_id)
  WHERE lifted_at IS NULL;

CREATE INDEX IF NOT EXISTS halt_records_contact_active_idx
  ON halt_records (contact_id)
  WHERE lifted_at IS NULL AND scope = 'contact';
```

The contact partial index is the active-contact scan. It is not a second key. It does not include `firm_id`. It is not unique. Two active contact rows for one contact in one firm both insert. This packet does not drop the index and does not add `firm_id` to it.

`enrollment.id` is `TEXT PRIMARY KEY`. `firm_id`, `contact_id`, and `agent_ref` are required. `sequence_id` references `sequence_template` and is not null once migration 011 has run. `campaign_id` is nullable. `pursuit_state` defaults to `pursuing`. The enroll insert writes those columns and does not write `pursuit_state`, so the default stands. `active_attempts.enrollment_id` references `enrollment` and is set null on delete. `status` defaults to `open`. `window_started_at` and `fired_criteria` default. The blocked return does not insert either row and does not update an existing attempt.

The packet names no component contract. The firing-pointers contract ends at claim 16 and names claim 17 as the audience. The walk-handle contract loads pointers. The pursuit-identity contract decides which enrollment a completion advances. None of those sentences is this predicate. This packet does not edit the three contract files.

`HaltStorePort.isContactHalted` takes `contactId` only. That signature is the stand-in and the real reader. It is not `isHaltBlockingNew`.

```71:78:src/app/wire/ports.ts
export type HaltStorePort = {
  tag: StandInTag | "real";
  commit(input: HaltCommitInput): Promise<HaltRecord>;
  lift(haltId: string): Promise<HaltRecord | null>;
  listActive(firmId?: string): Promise<HaltRecord[]>;
  isContactHalted(contactId: string): Promise<boolean>;
  isFirmBookHalted(firmId: string): Promise<boolean>;
};
```

## Runtime

The live contact arm matches `contact_id` and does not constrain `firm_id`. The firm-book arm already requires `firm_id`. The change is the contact arm only.

```94:108:server/wire-service/dispatchSend.ts
export async function isHaltBlockingNew(
  firmId: string,
  contactId?: string,
): Promise<boolean> {
  const pool = getPool();
  const halted = await pool.query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL
       AND ((scope = 'firm-book' AND firm_id = $1)
         OR ($2::text IS NOT NULL AND scope = 'contact' AND contact_id = $2))
     LIMIT 1`,
    [firmId, contactId ?? null],
  );
  return Boolean(halted.rowCount && halted.rowCount > 0);
}
```

`enrollAndActuate` returns before the insert when that check is true. The comment above the call is not the predicate. The return object is.

```686:702:server/wire-service/cascade.ts
export async function enrollAndActuate(input: EnrollActuateInput) {
  const pool = getPool();

  // H1: firm-book or contact halt blocks NEW enrollments (does not abort in-flight attempts).
  if (await isHaltBlockingNew(input.firmId, input.contactId)) {
    return {
      enrollmentId: "",
      attemptId: "",
      dryRun: true,
      send: {
        ok: false as const,
        deny: "policy",
        detail: "halt active",
      },
      blocked: "halt" as const,
    };
  }
```

`EnrollActuateInput.contactId` is `string`. `fireFirstStep` is optional. The first-step send runs when `input.fireFirstStep !== false`.

```672:684:server/wire-service/cascade.ts
export type EnrollActuateInput = {
  firmId: string;
  contactId: string;
  agentRef: string;
  sequenceId?: string;
  workflowRunId?: string;
  payload?: Record<string, unknown>;
  /** First owner channel; default = head of channel order */
  ownerChannel?: string;
  purpose?: string;
  /** When true, also fire the first-step send for the owner channel */
  fireFirstStep?: boolean;
};
```

`call_agent` passes the walk firm and fires the first step. A halt return skips that contact and does not push an enrollment write. The next contact in `ctx.contactIds` still enrolls.

```1356:1372:server/wire-service/workflowWalk.ts
            const result = await enrollAndActuate({
              firmId: opts.firmId,
              contactId,
              agentRef,
              sequenceId: agentRef,
              workflowRunId: opts.runId,
              purpose: sequenceClassForAgent(agentRef) === "optin" ? "opt-in" : "cem",
              payload: {
                workflowId: opts.workflowId,
                runId: opts.runId,
                constants: ctx.constants,
                trigger: opts.triggerPayload,
                dryRunBinding: true,
              },
              fireFirstStep: true,
            });
            if (result.blocked === "halt") continue;
```

`handleSequenceEnrollContacts` enrolls each selected row under that row’s firm. The every-firm door has no firm predicate. This packet leaves both.

```2154:2171:server/wire-service/machine.ts
    const all = await pool.query<{ id: string; firm_id: string }>(
      `SELECT id, firm_id FROM contact_records`,
    );
    contactRows = all.rows;
  }

  const agentRef = body.agentRef ?? sequenceId;
  const enrolled: string[] = [];
  const blocked: string[] = [];
  for (const row of contactRows) {
    const result = await enrollAndActuate({
      firmId: row.firm_id,
      contactId: row.id,
      agentRef,
      sequenceId,
      payload: { source: "c8_add_contact", scope },
      purpose: "opt-in",
    });
```

`handleEnrollmentCreate` passes the request firm. The eligibility fallback passes `opts.firm` and omits `fireFirstStep`, so the first step still runs. The onboarding fallback passes the request firm and also omits `fireFirstStep`.

```248:257:server/wire-service/machine.ts
  const result = await enrollAndActuate({
    firmId: firm,
    contactId: body.contactId,
    agentRef: body.agentRef,
    sequenceId: body.sequenceId,
    workflowRunId: body.workflowRunId,
    payload: body.payload,
    purpose: body.purpose ?? "opt-in",
    fireFirstStep: body.fireFirstStep,
  });
```

```342:349:server/wire-service/machine.ts
      const enrolled = await enrollAndActuate({
        firmId: opts.firm,
        contactId,
        agentRef: "tpl.reactivation.v1",
        sequenceId: "tpl.reactivation.v1",
        payload: { faceless: true, fallback: true, trigger: opts.triggerKind },
        purpose: "reactivation",
      });
```

```827:834:server/wire-service/machine.ts
    const result = await enrollAndActuate({
      firmId: firm,
      contactId: row.contact_id,
      agentRef,
      sequenceId: agentRef,
      payload: { trigger: "campaign_state=running" },
      purpose: "opt-in",
    });
```

The send gate’s contact arm is a different statement. It binds the contact only. An enroll this predicate allows can still receive `detail: "halt active"` from this gate when some other firm holds an active contact halt for that contact. That result has no `blocked: "halt"`. The enrollment insert has already run.

```81:86:server/wire-service/dispatchSend.ts
  const contactHalted = await pool.query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL AND scope = 'contact' AND contact_id = $1
     LIMIT 1`,
    [contactId],
  );
```

`handleHaltIsContact` uses that same predicate. The route is `GET /halt/contact/:contactId`.

```201:209:server/wire-service/stores.ts
export async function handleHaltIsContact(c: Context) {
  const contactId = c.req.param("contactId");
  const result = await getPool().query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL AND scope = 'contact' AND contact_id = $1
     LIMIT 1`,
    [contactId],
  );
  return c.json({ halted: result.rowCount! > 0 });
}
```

```154:154:server/wire-service/routes.ts
  wire.get("/halt/contact/:contactId", handleHaltIsContact);
```

The stand-in matches `contactId` and does not read `firmId`. The real reader calls that route and does not pass a firm.

```61:67:src/app/wire/standins/haltStore.ts
  async isContactHalted(contactId: string): Promise<boolean> {
    for (const h of halts.values()) {
      if (h.liftedAt) continue;
      if (h.scope === "contact" && h.contactId === contactId) return true;
      // firm-book halt covers all contacts of that firm — callers pass firm separately
    }
    return false;
  },
```

```24:28:src/app/wire/reals/haltStore.ts
  async isContactHalted(contactId) {
    const res = await wireFetch<{ halted: boolean }>(
      `/halt/contact/${encodeURIComponent(contactId)}`,
    );
    return res.halted;
  },
```

`dispatchEmail` and `dispatchSms` call `consentAndHaltGate` before the cohort check. `shouldLiveSend` is false unless `SEND_MODE` is `live` and the contact is in `SEND_TEST_COHORT`. A gate denial returns before a provider call. A cohort denial returns `{ ok: true, dryRun: true }` after the gate has allowed. `actuateChannelSend` reaches `dispatchEmail` for `ownerChannel: "email"` when the contact row on that firm has an email.

## Ports

No new port.

These stay on the same functions:

- `isHaltBlockingNew(firmId, contactId?)`. Same export, same two arguments, same boolean. The contact arm gains `firm_id = $1`.
- `enrollAndActuate`. Same input type. The halt return stays `blocked: "halt"`.
- `call_agent`. Same enroll object. `firmId` is `opts.firmId`. `fireFirstStep` is `true`.
- `POST /machine/enrollments` → `handleEnrollmentCreate`. Same body. `firmId` is the request firm. `fireFirstStep` is still `body.fireFirstStep`.
- `POST /machine/sequences/:id/enroll` → `handleSequenceEnrollContacts`. Same body. `firmId` is `row.firm_id`.
- `runContactEligibilityCascade` and `handleOnboardingFire`. Same fallback objects. Both still omit `fireFirstStep`.
- `consentAndHaltGate`. Unchanged. Still not exported.
- `GET /halt/contact/:contactId` → `handleHaltIsContact`. Unchanged.
- `GET /halt/firm-book/:firmId` → `handleHaltIsFirmBook`. Unchanged.
- `HaltStorePort.isContactHalted(contactId)`. Unchanged on the stand-in and on the real.
- `dispatchEventToWorkflows`. Unchanged. This packet does not edit `workflowWalk.ts`.

## Verify

`scripts/verify-halt-enroll-firm.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` after migrate and seed, in the same job as `verify-click-attribution`. `npm run build` is not that proof.

The script uses `getPool()` the way `scripts/verify-click-attribution.ts` does. It imports `isHaltBlockingNew` from `server/wire-service/dispatchSend.ts` and `enrollAndActuate` from `server/wire-service/cascade.ts`. It exits 2 when `DATABASE_URL` is missing. It deletes `RESEND_API_KEY` and `RESEND_WEBHOOK_SECRET` for the process. It does not set `SEND_MODE` or `SEND_TEST_COHORT`. It does not call `tickOnce`, `dispatchEventToWorkflows`, `consentAndHaltGate`, or a route handler. It does not boot Vite. It does not import the stand-in. It does not build a workflow graph.

Firm ids are `firm-pkt015-a-` and `firm-pkt015-b-` plus a run token. The contact id is `cr-pkt015-` plus that token. Neither firm is the seeded Harbor firm. The script inserts one `contact_records` row on firm A with email `pkt015@example.com`. Halt inserts use `consultant_id` `pkt015`. The enroll calls use `agentRef` and `sequenceId` `tpl.optin_launch.v1`, `purpose` `opt-in`, `ownerChannel` `email`, and `fireFirstStep: true`. That template id is the seeded sequence. The script does not insert a sequence. It does not delete seed rows. It deletes the rows it inserts, in foreign-key order: `engagement_records`, `active_attempts`, `enrollment`, `halt_records`, `contact_records`, by these two firm ids and this contact id.

1. An active `scope = 'contact'` row with this `contact_id` and firm A makes `isHaltBlockingNew(firmA, contact)` true. The same contact with the only active contact halt on firm B makes `isHaltBlockingNew(firmA, contact)` false and `isHaltBlockingNew(firmB, contact)` true. After `lifted_at` is set on the firm A row, `isHaltBlockingNew(firmA, contact)` is false while that row remains.
2. An active `scope = 'firm-book'` row for firm A, with `contact_id` null, makes `isHaltBlockingNew(firmA, contact)` true and `isHaltBlockingNew(firmA, "cr-pkt015-other")` true. An active firm-book row only on firm B makes `isHaltBlockingNew(firmA, contact)` false. The firm-book arm has no contact predicate.
3. `isHaltBlockingNew(firmA)` with one argument, while the only active row is a contact halt on firm A for this contact, is false. The same call is true when an active firm-book row for firm A is also present. The script passes `undefined` by omitting the argument. It does not pass the string `"null"`.
4. Two active contact halts on firm A for this contact: `isHaltBlockingNew(firmA, contact)` is true. Both rows still have `lifted_at` null. `pg_constraint` for `halt_records` and `contype = 'u'` returns no row. The primary key is not that constraint.
5. Insert one `enrollment` for firm A and this contact, `sequence_id` `tpl.optin_launch.v1`, and one `active_attempts` row with `status` `open` pointing at it. Then insert an active contact halt on firm A. `enrollAndActuate` returns `blocked` `"halt"` and `enrollmentId` `""`. The enrollment count for this contact is still 1. The attempt’s `status` is still `open` and its `enrollment_id` is unchanged. Clear that halt. Insert an active contact halt only on firm B. The next `enrollAndActuate` does not return `blocked` `"halt"`. A new `enrollment` row exists for firm A and this contact. `send` is present, `send.ok` is false, and `send.detail` is `"halt active"`. That deny is the unscoped send gate. It is not the enroll block. The new enrollment row remains. Clear every halt. The next `enrollAndActuate` does not return `blocked` `"halt"`. Another enrollment row exists. `send.dryRun` is true and `send.reason` contains `SEND_MODE/cohort gate`. The script does not require a provider accept.
6. `call_agent` is not executed. The shape guard below is acceptance 6.
7. The firm B enroll in case 5 is the runtime proof that `consentAndHaltGate` still matches `contact_id` with no `firm_id`. The script does not call `handleHaltIsContact` or the stand-in. The shape guard is the proof those readers still omit `firm_id`.
8. The script does not call `dispatchEventToWorkflows` and does not read `supabase/migrations`. No migration file is added by this packet.

`npm run factory:check` reads the body of `isHaltBlockingNew` and fails unless that body contains `scope = 'firm-book' AND firm_id = $1`, `$2::text IS NOT NULL`, `scope = 'contact' AND contact_id = $2 AND firm_id = $1`, `LIMIT 1`, and `[firmId, contactId ?? null]`, ignoring whitespace. It fails if that body contains `ORDER BY`. It reads `consentAndHaltGate` and fails unless its contact statement is still `scope = 'contact' AND contact_id = $1` bound to `[contactId]`, and fails if that contact statement contains `firm_id`. The firm-book statement in the same function still contains `firm_id`. It reads `handleHaltIsContact` and fails unless its statement is still `scope = 'contact' AND contact_id = $1` bound to `[contactId]`, and fails if that statement contains `firm_id`. It reads `standInHaltStore.isContactHalted` and fails unless it still contains `h.scope === "contact" && h.contactId === contactId`, and fails if that function contains `firmId`. It reads `realHaltStore.isContactHalted` and fails unless the path still contains `` `/halt/contact/${encodeURIComponent(contactId)}` ``. It reads the `call_agent` enroll and fails unless `fireFirstStep` is `true` and `firmId` is `opts.firmId`. It reads `enrollAndActuate` and fails unless `isHaltBlockingNew(input.firmId, input.contactId)` appears before `INSERT INTO enrollment`, and fails if the halt return is removed. It reads `handleSequenceEnrollContacts` and fails unless the every-firm query is `SELECT id, firm_id FROM contact_records` with no `WHERE`, and fails unless the enroll object contains `firmId: row.firm_id`. It reads `003_ct_wire_stores.sql` and fails unless `halt_records_contact_active_idx` is still `ON halt_records (contact_id) WHERE lifted_at IS NULL AND scope = 'contact'`. It fails if that index, or `isHaltBlockingNew`, contains `UNIQUE`. It does not hash `dispatchEventToWorkflows` and does not fail because that function contains the audience SQL. It reads `.github/workflows/ship.yml` and fails unless it invokes `scripts/verify-halt-enroll-firm.ts`. Add `server/wire-service/dispatchSend.ts`, `server/wire-service/cascade.ts`, `server/wire-service/machine.ts`, `server/wire-service/stores.ts`, `server/wire-service/workflowWalk.ts`, `src/app/wire/standins/haltStore.ts`, `src/app/wire/reals/haltStore.ts`, `scripts/verify-halt-enroll-firm.ts`, and `.github/workflows/ship.yml` to the path filter in `.github/workflows/factory-check.yml` if they are not already listed.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

The send gate’s contact select. `handleHaltIsContact`. The stand-in `isContactHalted` and the real route it calls. `HaltStorePort`’s signature. The stand-in `createEnrollment` and the stand-in send gate. Aborting an in-flight attempt. `tickOnce`. A unique constraint on an active contact halt. Rewriting `halt_records_contact_active_idx`. Joining another firm’s contact by email or phone. Changing `handleSequenceEnrollContacts`’s book query. The `firmId` arguments of `call_agent`, `handleEnrollmentCreate`, the onboarding fallback, and the eligibility fallback. The audience fill (PKT-014). `dispatchEventToWorkflows`. The consent select inside `consentAndHaltGate`. Launch Agent. No plate.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `isHaltBlockingNew` contact arm | Also requires `firm_id = $1`. The null guard, `LIMIT 1`, and the two binds stay | `enrollAndActuate` | Modified |
| `isHaltBlockingNew` firm-book arm | Still `scope = 'firm-book' AND firm_id = $1`. No contact predicate | `enrollAndActuate` | Only verified |
| `enrollAndActuate` | Same call and the same return before the insert. An allowed enroll still enters the first-step send when `fireFirstStep` is not false | Direct enroll, `call_agent`, sequence enroll, onboarding, eligibility fallback | Only verified |
| Existing `enrollment` and `active_attempts` | The halt return does not update them | An open attempt beside a new block | Only verified |
| `call_agent` | Unchanged. `firmId` is `opts.firmId`. `fireFirstStep` is `true`. A halt return still continues | Walk enroll | Only verified |
| `handleEnrollmentCreate` | Unchanged. `firmId` is the request firm. `fireFirstStep` is the body field | `POST /machine/enrollments` | Only verified |
| `handleSequenceEnrollContacts` | Unchanged. `firmId` is `row.firm_id`. The book query stays unscoped | `POST /machine/sequences/:id/enroll` | Only verified |
| Eligibility fallback, onboarding fallback | Unchanged firm arguments. `fireFirstStep` stays omitted | Cascade and onboarding | Only verified |
| `consentAndHaltGate` contact arm | Unchanged. `contact_id` only | `dispatchEmail`, `dispatchSms` | Only verified |
| `handleHaltIsContact`, `GET /halt/contact/:contactId` | Unchanged | Real `isContactHalted` | Only verified |
| `HaltStorePort.isContactHalted` | Unchanged. Contact id only, on the stand-in and the real | Stand-in enroll, stand-in send gate | Only verified |
| `halt_records` indexes | Unchanged. The contact partial index stays on `contact_id`. No unique constraint is added | The new predicate | Only verified |
| `dispatchEventToWorkflows` | Unchanged | Audience fill | Only verified |
| `scripts/verify-halt-enroll-firm.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases and the shape guard | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| The contact arm matches `contact_id` and ignores `firm_id`, so a halt stored on another firm blocks an enroll in this firm. `firm_id` is `NOT NULL` and is already bound as `$1` for the firm-book arm. The contact arm adds `firm_id = $1` beside `contact_id = $2`. The `$2::text IS NOT NULL` guard stays, so a missing contact argument does not match that arm. `LIMIT 1` stays an existence check. Two active rows are one true result. The statement has no `ORDER BY` and no unique constraint. | necessary |
| `enrollAndActuate` already returns `blocked: "halt"` before `INSERT INTO enrollment` and does not update an existing attempt. The call already passes `input.firmId` and `input.contactId`. The function text stays. The boolean changes because the predicate changes. `EnrollActuateInput.contactId` is `string`. Acceptance 3 calls `isHaltBlockingNew` with the argument omitted. It does not call `enrollAndActuate` with a null contact. | necessary |
| An enroll the predicate allows still executes the `fireFirstStep !== false` path. `call_agent` passes `true`. The verify passes `true`, `ownerChannel` `email`, and a contact email, so `actuateChannelSend` enters `dispatchEmail`. With no halt, `shouldLiveSend` is false and the send is the cohort dry-run. With a contact halt only on the other firm, `consentAndHaltGate` still denies `halt active` after the enrollment insert. The verify accepts that deny and requires the enrollment row. It uses `blocked === "halt"` and an empty `enrollmentId` as the enroll block. | necessary |
| PKT-011’s change specification tells `factory-check` to fail if the contact arm of `isHaltBlockingNew` contains `firm_id`, and to fail the same way for `consentAndHaltGate` and `handleHaltIsContact`. That freeze kept PKT-011 from planting claim 18. This packet is the enroll predicate. The `isHaltBlockingNew` clause of that guard is replaced by the requirement above. The `consentAndHaltGate` and `handleHaltIsContact` clauses stay, and they match this packet. This packet does not edit `SCP-pkt-011-halt-records-writes.md`. If the forbidding clause is already in `scripts/factory-check.ts`, remove it only for `isHaltBlockingNew`. | necessary |
| `consentAndHaltGate`’s contact arm, `handleHaltIsContact`, and both `isContactHalted` readers still match `contact_id` alone. Claim 19 owns that read. The revision under claim 19 leaves this enroll predicate as it is. This packet does not implement that read. The stand-in `createEnrollment` and the stand-in send gate call `isContactHalted(contactId)` and stay on that reader. | adjacent |
| The contact partial index is `(contact_id) WHERE lifted_at IS NULL AND scope = 'contact'`. It is not unique and it does not include `firm_id`. The packet says the index is not a second key. The existence check does not require a new index. This packet does not add a migration. | adjacent |
| PKT-014 decides who is on the walk. `call_agent` still enrolls each id under `opts.firmId`. A halt blocks that enroll when the halt row’s `firm_id` is that walk firm. This packet does not edit the audience branch and does not change the firm argument. SCP-014 does not shape-guard `isHaltBlockingNew`, so the new contact arm does not fight that guard. This packet does not hash `dispatchEventToWorkflows`. | adjacent |
| `handleSequenceEnrollContacts` still selects every `contact_records` row and enrolls each under `row.firm_id`. The eligibility fallback and the onboarding fallback still pass their own firm and still omit `fireFirstStep`. `tickOnce` does not call `isHaltBlockingNew`. An open attempt keeps running. Aborting it is out of scope. | adjacent |
| The consent select inside `consentAndHaltGate` is `WHERE contact_id = $1 LIMIT 1`. It is not the halt contact arm. This packet does not add `firm_id` to it. | adjacent |
| The three component contracts do not list claim 18. This packet does not edit them. | adjacent |
| The packet file still says `**Release:** draft`. The ledger stage for this revision was `released` when this wake was authorized, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
