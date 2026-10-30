# SCP-pkt-016 — A contact halt denies a send, and answers the contact check, only in the firm on that row

**Packet:** PKT-016 `pkt-016-halt-send-firm`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 19, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`.  
**Contract:** The packet names no component contract. `docs/factory/components/firing-pointers/CONTRACT.md` ends at claim 16. `docs/factory/components/walk-handle/CONTRACT.md` and `docs/factory/components/pursuit-identity/CONTRACT.md` do not list claim 19. This packet does not edit those files.

## Intent

`consentAndHaltGate` still runs the firm-book arm first. That arm stays `scope = 'firm-book' AND firm_id = $1` with `lifted_at` null, bound to `[firmId]`, and it still runs when the send names no contact. A deny is still `{ allow: false, deny: "policy", detail: "halt active" }`. `LIMIT 1` stays. There is no `ORDER BY`.

When `contactId` is present, the consent select still runs before the contact arm, and a consent deny still returns before that arm. The contact arm becomes an existence check on an active `halt_records` row whose `scope` is `contact`, whose `contact_id` is that contact, and whose `firm_id` is the `firmId` argument. The binds are `[contactId, firmId]`. The arm does not read `purpose`. Two active contact halts in this firm for this contact are one deny. A lifted row does not deny. A contact halt whose `firm_id` is some other firm does not deny. The function keeps its three arguments and stays unexported.

`dispatchEmail` and `dispatchSms` still return that deny before `shouldLiveSend`. `dispatchEmailLive` and `dispatchSmsLive` still call the same gate and still return before Resend or Twilio. `actuateChannelSend` still passes `input.firmId` and still returns the no-address dry-run before either dispatcher. `handleCemSend` and `handleSmsSend` still pass the session firm and still ignore `body.firmId`. `call_agent` still passes `firmId: opts.firmId` and `fireFirstStep: true`. `escalateAttemptWindow`, `advanceTemplateCellIfDue`, and the wait-until send inside `tickOnce` still pass `firmId: attempt.firm_id`. This packet does not edit those callers. The gate they already call inherits the contact arm.

`handleHaltIsContact` is the same contact match. The route stays `GET /halt/contact/:contactId`. The firm is the `firmId` query, the same query name `handleHaltList` already reads. The handler does not call `requireSessionFirm`. The statement uses the same contact predicate, bound to `[contactId, firmId ?? null]`. A missing query does not match, because `firm_id` is `NOT NULL` and `firm_id = NULL` is not true. The response stays `{ halted: boolean }`. A firm-book row is not a contact halt.

`HaltStorePort.isContactHalted` takes `(contactId: string, firmId: string)`. The real client requests `/halt/contact/${contactId}?firmId=${firmId}` with both values encoded. The stand-in returns true only for an active row with `scope === "contact"`, that `contactId`, and that `firmId`. `standInSendGate` passes `input.firmId` when `contactId` is set. `createEnrollment` passes `standInFirm()`. `sendGate` stays the stand-in. The real `handleEnrollmentCreate` stays on `enrollAndActuate`.

`isHaltBlockingNew` stays the enroll predicate PKT-015 specified. This packet does not edit that function.

## Must / must-not

- Replace the contact arm inside `consentAndHaltGate`. Keep the firm-book arm, the early allow when `contactId` is absent, the consent select, and the consent denies in front of the contact arm. Do not add a fourth parameter. Do not add `ORDER BY`. Do not read `purpose` in the contact statement.

```ts
const contactHalted = await pool.query(
  `SELECT 1 FROM halt_records
   WHERE lifted_at IS NULL AND scope = 'contact' AND contact_id = $1 AND firm_id = $2
   LIMIT 1`,
  [contactId, firmId],
);
```

- The firm-book statement stays this, bound to `[firmId]`:

```sql
SELECT 1 FROM halt_records
 WHERE lifted_at IS NULL AND scope = 'firm-book' AND firm_id = $1
 LIMIT 1
```

- The consent select stays `SELECT basis, silenced, status FROM consent_records WHERE contact_id = $1 LIMIT 1`, bound to `[contactId]`. A silenced row, and a non-`opt-in` purpose with no row or `basis === "none"`, still return before the contact arm. An `opt-in` send with no consent row still reaches the contact arm.
- Leave the calls in `dispatchEmail` and `dispatchSms`. Each still calls `consentAndHaltGate` and still returns `{ ok: false, deny, detail }` before `shouldLiveSend`. Leave the calls in `dispatchEmailLive` and `dispatchSmsLive`. Each still calls `consentAndHaltGate` before `getResend().emails.send` or `twilio.messages.create`. Do not delete the provider-key return that already sits in front of the gate inside the live functions.
- Do not edit `actuateChannelSend`. `firmId` stays `input.firmId`. The `no email on contact` and `no phone on contact` returns stay before `dispatchEmail` and `dispatchSms`.
- Do not edit `handleCemSend` or `handleSmsSend`. `firmId` stays the value from `requireSessionFirm`. Do not pass `body.firmId`.
- Do not edit `call_agent`. `firmId` stays `opts.firmId`. `fireFirstStep` stays `true`.
- Do not edit `escalateAttemptWindow`, `advanceTemplateCellIfDue`, or `tickOnce`. Each send stays `firmId: attempt.firm_id`.
- Do not edit `isHaltBlockingNew` or the `enrollAndActuate` call that uses it. Do not edit `handleEnrollmentCreate`.
- Change `handleHaltIsContact` to the same contact predicate. Read `firmId` with `c.req.query("firmId")`. Bind `[contactId, firmId ?? null]`. Do not call `requireSessionFirm`. Keep `LIMIT 1`. Do not add `ORDER BY`. The response stays `c.json({ halted: result.rowCount! > 0 })`.

```ts
export async function handleHaltIsContact(c: Context) {
  const contactId = c.req.param("contactId");
  const firmId = c.req.query("firmId");
  const result = await getPool().query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL AND scope = 'contact' AND contact_id = $1 AND firm_id = $2
     LIMIT 1`,
    [contactId, firmId ?? null],
  );
  return c.json({ halted: result.rowCount! > 0 });
}
```

- Do not edit `routes.ts`. `GET /halt/contact/:contactId` stays `handleHaltIsContact`. Do not edit `handleHaltList` or `handleHaltIsFirmBook`.
- Change the port and both readers. `isContactHalted(contactId: string, firmId: string)`. The real request is `` `/halt/contact/${encodeURIComponent(contactId)}?firmId=${encodeURIComponent(firmId)}` ``. The stand-in match is `h.scope === "contact" && h.contactId === contactId && h.firmId === firmId` on a row whose `liftedAt` is absent. Do not return true for `scope === "firm-book"`.
- `standInSendGate` calls `isContactHalted(input.contactId, input.firmId)` only when `input.contactId` is set. `createEnrollment` calls `isContactHalted(input.contactId, standInFirm())`. Do not change `standInFirm`. Do not switch `sendGate` off `standInSendGate`.
- Do not add a migration. Do not rewrite `halt_records_contact_active_idx`. Do not add a unique constraint on an active contact halt. Do not join another firm’s contact by email or phone. Do not match `contact_records.firm_id` inside the halt statements.

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

`consent_records` is keyed by `(contact_id, firm_id)`. The select in front of the contact arm does not use `firm_id`. That select is claim 23. This packet does not add `firm_id` to it.

The packet names no component contract. The firing-pointers contract ends at claim 16. The walk-handle contract loads pointers. The pursuit-identity contract decides which enrollment a completion advances. None of those sentences is this gate. This packet does not edit the three contract files.

`HaltStorePort.isContactHalted` today takes `contactId` only. That signature is the stand-in and the real reader. This packet adds `firmId` as the second argument. `isFirmBookHalted(firmId)` stays.

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

`SendGateDecideInput.firmId` is already required. `standInSendGate` already has the firm on `input` and does not pass it into `isContactHalted`. `createEnrollment` already calls `standInFirm()` for the firm-book check and does not pass that firm into `isContactHalted`.

```121:127:src/app/wire/ports.ts
export type SendGateDecideInput = {
  firmId: string;
  contactId?: string;
  channel: "email" | "sms";
  purpose: "otp" | "cem" | "system" | "opt-in" | "nudge" | "reactivation";
  posture: "Armed" | "Active" | "Idle";
};
```

## Runtime

The live contact arm matches `contact_id` and does not constrain `firm_id`. The firm-book arm already requires `firm_id`. The consent select in front of the contact arm is also by `contact_id` alone. The change is the contact arm only. The function is not exported. Its parameters stay `(contactId, firmId, purpose)`.

```50:91:server/wire-service/dispatchSend.ts
async function consentAndHaltGate(
  contactId: string | undefined,
  firmId: string,
  purpose: string,
): Promise<{ allow: true } | { allow: false; deny: string; detail: string }> {
  const pool = getPool();

  // H1: firm-book halt always blocks new sends (even without contactId).
  const firmHalted = await pool.query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL AND scope = 'firm-book' AND firm_id = $1
     LIMIT 1`,
    [firmId],
  );
  if (firmHalted.rowCount && firmHalted.rowCount > 0) {
    return { allow: false, deny: "policy", detail: "halt active" };
  }

  if (!contactId) return { allow: true };

  const consent = await pool.query<{ basis: string; silenced: boolean; status?: string }>(
    `SELECT basis, silenced, status FROM consent_records WHERE contact_id = $1 LIMIT 1`,
    [contactId],
  );
  const row = consent.rows[0];
  if (row?.silenced || row?.status === "silenced") {
    return { allow: false, deny: "policy", detail: "silenced" };
  }
  if (purpose !== "opt-in" && (!row || row.basis === "none")) {
    return { allow: false, deny: "policy", detail: "consent missing" };
  }
  const contactHalted = await pool.query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL AND scope = 'contact' AND contact_id = $1
     LIMIT 1`,
    [contactId],
  );
  if (contactHalted.rowCount && contactHalted.rowCount > 0) {
    return { allow: false, deny: "policy", detail: "halt active" };
  }
  return { allow: true };
}
```

`dispatchEmail` and `dispatchSms` call that gate before the cohort short-circuit. `shouldLiveSend` is false when `contactId` is missing, when `SEND_MODE` is not `live`, or when the contact is outside `SEND_TEST_COHORT`. A gate denial returns before a provider call. A cohort denial returns `{ ok: true, dryRun: true, reason: "SEND_MODE/cohort gate — fail closed" }` after the gate has allowed.

```283:315:server/wire-service/dispatchSend.ts
export async function dispatchEmail(input: DispatchEmailInput): Promise<DispatchResult> {
  const halt = await consentAndHaltGate(input.contactId, input.firmId, input.purpose);
  if (!halt.allow) {
    return { ok: false, deny: halt.deny, detail: halt.detail };
  }
  if (!shouldLiveSend(input.contactId)) {
    return {
      ok: true,
      dryRun: true,
      reason: "SEND_MODE/cohort gate — fail closed",
      channel: "email",
    };
  }
  return dispatchEmailLive(input);
}

export async function dispatchSms(input: DispatchSmsInput): Promise<DispatchResult> {
  const purpose = input.purpose ?? "cem";
  const halt = await consentAndHaltGate(input.contactId, input.firmId, purpose);
  if (!halt.allow) {
    return { ok: false, deny: halt.deny, detail: halt.detail };
  }
  if (!shouldLiveSend(input.contactId)) {
    return {
      ok: true,
      dryRun: true,
      reason: "SEND_MODE/cohort gate — fail closed",
      channel: "sms",
    };
  }
  return dispatchSmsLive(input);
}
```

`dispatchEmailLive` returns `RESEND_API_KEY missing` before the gate when `getWireCapabilities().resend` is false. When the key is present, the gate runs before `getResend().emails.send`. `dispatchSmsLive` returns the Twilio-missing deny before the gate when `caps.twilio` is false. When Twilio is configured, the gate runs before `twilio.messages.create`. This packet leaves that order. The verify script does not call either live function.

`actuateChannelSend` loads `contact_records` with `id=$1 AND firm_id=$2`. A missing email returns the dry-run before `dispatchEmail`. A missing phone returns the dry-run before `dispatchSms`. Both dispatchers receive `firmId: input.firmId`.

```613:637:server/wire-service/cascade.ts
  if (channel === "email") {
    const to =
      row?.email ||
      (shouldLiveSend(input.contactId) ? process.env.TEST_EMAIL_TO : undefined);
    if (!to) {
      return {
        ok: true,
        dryRun: true,
        reason: "no email on contact — dry-run intent only",
        channel: "email",
      };
    }
    return dispatchEmail({
      to,
      subject: input.subject ?? "Tower",
      bodyText: input.bodyText ?? "Tower sequence step",
      firmId: input.firmId,
      contactId: input.contactId,
      purpose: input.purpose,
      enrollmentId: input.enrollmentId,
      campaignId: input.campaignId,
      campaignObjectiveId: input.campaignObjectiveId,
      attemptId: input.attemptId,
    });
  }
```

`handleCemSend` and `handleSmsSend` take `firmId` from `requireSessionFirm` and pass that binding. `body.firmId` is on the parsed type and is not passed. Both handlers reject a missing `contactId` before `dispatchEmail` or `dispatchSms`. The no-contact firm-book arm is reached by calling `dispatchEmail` or `dispatchSms` directly. This packet does not add an HTTP caller for that arm.

`handleHaltIsContact` uses the same unscoped contact predicate. `handleHaltList` already reads `c.req.query("firmId")`. The route is `GET /halt/contact/:contactId`.

```190:209:server/wire-service/stores.ts
export async function handleHaltList(c: Context) {
  const firmId = c.req.query("firmId");
  const result = await getPool().query(
    `SELECT * FROM halt_records
     WHERE lifted_at IS NULL AND ($1::text IS NULL OR firm_id = $1)
     ORDER BY halted_at DESC`,
    [firmId ?? null],
  );
  return c.json({ records: result.rows.map(mapHalt) });
}

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

```154:155:server/wire-service/routes.ts
  wire.get("/halt/contact/:contactId", handleHaltIsContact);
  wire.get("/halt/firm-book/:firmId", handleHaltIsFirmBook);
```

The stand-in matches `contactId` and does not read `firmId`. The real reader calls that route and does not pass a firm. The only callers of `isContactHalted` are `standInSendGate` and `createEnrollment`.

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

```57:60:src/app/wire/standins/sendGate.ts
  if (await standInHaltStore.isFirmBookHalted(input.firmId)) reasons.push("halt");
  if (input.contactId && (await standInHaltStore.isContactHalted(input.contactId))) {
    reasons.push("halt");
  }
```

```1195:1200:src/app/wire/standins/machineApi.ts
  async createEnrollment(input) {
    if (
      (await standInHaltStore.isFirmBookHalted(standInFirm())) ||
      (await standInHaltStore.isContactHalted(input.contactId))
    ) {
```

```91:91:src/app/wire/registry.ts
  sendGate: standInSendGate,
```

`isHaltBlockingNew` in this tree still matches a contact halt by `contact_id` with no `firm_id` predicate. PKT-015 specifies the enroll change. This packet does not retune that statement.

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

`call_agent` passes the walk firm and fires the first step.

```1356:1371:server/wire-service/workflowWalk.ts
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
```

The tick sends already pass the attempt’s firm. Escalation is `escalateAttemptWindow`. Cell advance is `advanceTemplateCellIfDue`. The wait-until send is the `attempt_wait_until` branch inside `tickOnce`.

```501:504:server/wire-service/cascade.ts
    send = await actuateChannelSend({
      firmId: attempt.firm_id,
      contactId: attempt.contact_id,
      channel: toChannel,
```

```921:924:server/wire-service/cascade.ts
    send = await actuateChannelSend({
      firmId: attempt.firm_id,
      contactId: attempt.contact_id,
      channel: toChannel,
```

```1080:1083:server/wire-service/cascade.ts
        await actuateChannelSend({
          firmId: attempt.firm_id,
          contactId: attempt.contact_id,
          channel: owner,
```

`handleEnrollmentCreate` passes the request firm into `enrollAndActuate`. It does not call `isContactHalted`.

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

## Ports

`HaltStorePort.isContactHalted` gains a required `firmId`. Both implementations and both callers change with it. No new port.

These stay on the same functions, with the contact match changed where named:

- `consentAndHaltGate(contactId, firmId, purpose)`. Still unexported. The contact arm gains `firm_id = $2`.
- `dispatchEmail` and `dispatchSms`. Same input types. The halt deny still returns before `shouldLiveSend`.
- `dispatchEmailLive` and `dispatchSmsLive`. Same input types. The gate still runs before the provider call.
- `actuateChannelSend`. Same input. `firmId` is `input.firmId`. The no-address returns stay.
- `POST /send/cem` → `handleCemSend`. Same body. `firmId` is the session firm. `body.firmId` stays unused.
- `POST /send/sms` → `handleSmsSend`. Same body. `firmId` is the session firm. `body.firmId` stays unused.
- `call_agent`. Same enroll object. `firmId` is `opts.firmId`. `fireFirstStep` is `true`.
- `escalateAttemptWindow`, `advanceTemplateCellIfDue`, `tickOnce`. Same `firmId: attempt.firm_id`.
- `isHaltBlockingNew(firmId, contactId?)`. Unchanged by this packet.
- `enrollAndActuate` and `POST /machine/enrollments` → `handleEnrollmentCreate`. Unchanged.
- `GET /halt/contact/:contactId` → `handleHaltIsContact`. Same path. The handler reads the `firmId` query. The response stays `{ halted: boolean }`.
- `GET /halt` → `handleHaltList`. Unchanged. `GET /halt/firm-book/:firmId` → `handleHaltIsFirmBook`. Unchanged.
- `HaltStorePort.isContactHalted(contactId, firmId)`. Changed on the type, the stand-in, and the real.
- `standInSendGate`. Same `decide`. The contact check passes `input.firmId`.
- `createEnrollment` on the stand-in machine. The contact check passes `standInFirm()`.
- `wirePorts.sendGate`. Stays `standInSendGate`.

## Verify

`scripts/verify-halt-send-firm.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` in job `verify-ship`, after migrate and seed, in the same job as `verify-click-attribution`. `npm run build` is not that proof.

The script uses `getPool()` the way `scripts/verify-click-attribution.ts` does. It imports `dispatchEmail` and `dispatchSms` from `server/wire-service/dispatchSend.ts`, `actuateChannelSend` from `server/wire-service/cascade.ts`, and `handleHaltIsContact` from `server/wire-service/stores.ts`. It imports `standInHaltStore` and `clearStandInHalts` from `src/app/wire/standins/haltStore.ts`. It exits 2 when `DATABASE_URL` is missing. It deletes `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `TWILIO_PHONE_NUMBER`, `SEND_MODE`, `SEND_TEST_COHORT`, `TEST_EMAIL_TO`, and `TEST_SMS_TO` for the process. It does not call `dispatchEmailLive`, `dispatchSmsLive`, `getResend`, `getTwilio`, `tickOnce`, `enrollAndActuate`, `isHaltBlockingNew`, `handleCemSend`, or `handleSmsSend`. It does not boot Vite. It does not build a workflow graph.

Firm ids are `firm-pkt016-a-` and `firm-pkt016-b-` plus a run token. The contact id is `cr-pkt016-` plus that token. Neither firm is the seeded Harbor firm. Halt inserts use `consultant_id` `pkt016` and an id unique to the run. Consent inserts use `basis` `express` and `silenced` false. The script inserts one `contact_records` row on firm A with `email` and `phone` null for the no-address case. It does not delete seed rows. It deletes the rows it inserts, in foreign-key order: `outbound_messages`, `messaging_events`, `halt_records`, `consent_records`, `contact_records`, by these two firm ids and this contact id.

A halt deny is `{ ok: false, deny: "policy", detail: "halt active" }`. An allowed dry-run is `ok: true`, `dryRun: true`, and `reason` containing `SEND_MODE/cohort gate`. After every `dispatchEmail` and `dispatchSms` call, `outbound_messages` for these two firms is empty.

The handler probe builds a context the way `scripts/verify-open-ask-cursor.ts` builds one for a query. `req.param("contactId")` returns the contact id. `req.query("firmId")` returns the firm string or `undefined` when the case omits it. `json` returns `{ body, status }`. The script casts that object to `Context`. There is no session on the context.

1. Insert one consent row for this contact and firm A that does not deny. With an active `scope = 'contact'` row for this `contact_id` and firm A, `dispatchEmail` of `purpose` `cem` to firm A returns the halt deny. With that row lifted and the only active contact halt on firm B, `dispatchEmail` to firm A returns the cohort dry-run, and `dispatchEmail` to firm B returns the halt deny. After `lifted_at` is set on the firm A row, `dispatchEmail` to firm A returns the cohort dry-run while that row remains. The same three results hold for `dispatchSms` with `purpose` `cem`.
2. Clear contact halts. An active `scope = 'firm-book'` row for firm A, with `contact_id` null, makes `dispatchEmail` to firm A with no `contactId` return the halt deny. An active firm-book row only on firm B makes `dispatchEmail` to firm A with no `contactId` return the cohort dry-run. The same two results hold for `dispatchSms`.
3. Clear every halt and delete the consent row. An `opt-in` `dispatchEmail` to firm A with an active contact halt on firm A returns the halt deny. Two active contact halts on firm A for this contact: the same deny, both rows still have `lifted_at` null, and `pg_constraint` for `halt_records` and `contype = 'u'` returns no row. The primary key is not that constraint. Clear those halts. The next `opt-in` `dispatchEmail` with no consent row returns the cohort dry-run, not `consent missing`.
4. The denies in cases 1 and 3 are the proof that `dispatchEmail` and `dispatchSms` return before `shouldLiveSend`. The script does not call the live dispatchers. The shape guard below is the proof those functions call the gate before Resend or Twilio.
5. `handleHaltIsContact` returns `halted: true` only for an active contact-scope row with this contact and firm A. The same probe with firm B, with the query omitted, with `lifted_at` set, and with only a firm-book row for firm A, returns `halted: false`. The body is `{ halted: boolean }`. The fake context has no session, and the call still returns.
6. `clearStandInHalts()`, then `commit` a contact halt for this contact and firm A. `isContactHalted(contact, firmA)` is true. `isContactHalted(contact, firmB)` is false. `isContactHalted` of another contact and firm A is false. After `lift`, the firm A call is false. A firm-book `commit` for firm A does not make `isContactHalted(contact, firmA)` true. The real URL and the two call-site arguments are the shape guard below. The script does not call `standInSendGate` or `createEnrollment`.
7. With the contact row’s email and phone null, and an active contact halt on firm A, `actuateChannelSend` for `channel` `email` returns `ok: true`, `dryRun: true`, and a `reason` containing `no email on contact`. It does not return the halt deny. `isHaltBlockingNew` is not called. `call_agent` is not executed. The script does not read `supabase/migrations`. No migration file is added by this packet.

`npm run factory:check` reads `consentAndHaltGate` and fails unless the firm-book statement contains `scope = 'firm-book' AND firm_id = $1`, `LIMIT 1`, and `[firmId]`, and fails if that statement contains `ORDER BY`. It fails unless the consent statement contains `WHERE contact_id = $1 LIMIT 1` and `[contactId]`, and fails if that consent statement contains `firm_id`. It fails unless the contact statement contains `scope = 'contact' AND contact_id = $1 AND firm_id = $2`, `LIMIT 1`, and `[contactId, firmId]`, and fails if that contact statement contains `ORDER BY` or `purpose`. It reads `dispatchEmail` and `dispatchSms` and fails unless `consentAndHaltGate` appears before `shouldLiveSend`. It reads `dispatchEmailLive` and fails unless `consentAndHaltGate` appears before `emails.send`. It reads `dispatchSmsLive` and fails unless `consentAndHaltGate` appears before `messages.create`. It reads `handleHaltIsContact` and fails unless the statement contains `scope = 'contact' AND contact_id = $1 AND firm_id = $2`, `LIMIT 1`, and `[contactId, firmId ?? null]`, and fails if that function contains `requireSessionFirm` or `ORDER BY`. It reads `routes.ts` and fails unless `wire.get("/halt/contact/:contactId", handleHaltIsContact)` remains. It reads `HaltStorePort` and fails unless `isContactHalted(contactId: string, firmId: string)` is the signature. It reads `realHaltStore.isContactHalted` and fails unless the path contains `` `/halt/contact/${encodeURIComponent(contactId)}?firmId=${encodeURIComponent(firmId)}` ``. It reads `standInHaltStore.isContactHalted` and fails unless it contains `h.scope === "contact" && h.contactId === contactId && h.firmId === firmId`. It reads `standInSendGate` and fails unless it contains `isContactHalted(input.contactId, input.firmId)`. It reads `createEnrollment` and fails unless it contains `isContactHalted(input.contactId, standInFirm())`. It reads `registry.ts` and fails unless `sendGate: standInSendGate` remains. It reads `handleCemSend` and `handleSmsSend` and fails if either contains `firmId: body.firmId`. It reads `call_agent` and fails unless `fireFirstStep: true` and `firmId: opts.firmId` remain. It reads `actuateChannelSend` and fails unless `no email on contact` appears before `dispatchEmail` and `firmId: input.firmId` remains. It reads `escalateAttemptWindow`, `advanceTemplateCellIfDue`, and `tickOnce` and fails unless each contains `firmId: attempt.firm_id`. It reads `003_ct_wire_stores.sql` and fails unless `halt_records_contact_active_idx` is still `ON halt_records (contact_id) WHERE lifted_at IS NULL AND scope = 'contact'`. It fails if that index contains `UNIQUE`. It reads `.github/workflows/ship.yml` and fails unless it invokes `scripts/verify-halt-send-firm.ts`. It does not fail because `isHaltBlockingNew` contains `firm_id`, and it does not require this packet to edit that function. If a clause already fails when the contact statement of `consentAndHaltGate`, the statement of `handleHaltIsContact`, or either `isContactHalted` contains `firm_id`, remove that clause. Leave any clause that requires `scope = 'contact' AND contact_id = $2 AND firm_id = $1` inside `isHaltBlockingNew`. Add `server/wire-service/dispatchSend.ts`, `server/wire-service/stores.ts`, `server/wire-service/routes.ts`, `server/wire-service/send.ts`, `server/wire-service/cascade.ts`, `server/wire-service/workflowWalk.ts`, `server/wire-service/machine.ts`, `src/app/wire/ports.ts`, `src/app/wire/reals/haltStore.ts`, `src/app/wire/standins/haltStore.ts`, `src/app/wire/standins/sendGate.ts`, `src/app/wire/standins/machineApi.ts`, `src/app/wire/registry.ts`, `scripts/verify-halt-send-firm.ts`, and `.github/workflows/ship.yml` to the path filter in `.github/workflows/factory-check.yml` if they are not already listed.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

The enroll predicate (PKT-015). The consent select. The tick classification (claim 20). The engagement row for a deny (claims 21 and 22). Aborting an in-flight attempt. A unique constraint on an active contact halt. Rewriting `halt_records_contact_active_idx`. Joining another firm’s contact by email or phone. Matching `contact_records.firm_id` inside the halt statements. Reading the session firm inside `handleHaltIsContact`. Switching `sendGate` off the stand-in. The board list. `handleHaltList` and `handleHaltIsFirmBook`. The provider-key return that sits in front of the gate inside `dispatchEmailLive` and `dispatchSmsLive`. The HTTP handlers’ rejection of a missing `contactId`. Launch Agent. No plate.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `consentAndHaltGate` contact arm | Also requires `firm_id = $2`, bound to `[contactId, firmId]`. `LIMIT 1` stays. No `ORDER BY`. The statement does not read `purpose` | `dispatchEmail`, `dispatchSms`, `dispatchEmailLive`, `dispatchSmsLive` | Modified |
| `consentAndHaltGate` firm-book arm | Still `scope = 'firm-book' AND firm_id = $1`, bound to `[firmId]`, including a send with no contact | Those four dispatchers | Only verified |
| Consent select in that function | Still `WHERE contact_id = $1 LIMIT 1`. A deny still returns before the contact arm | `opt-in` still reaches the arm with no row | Only verified |
| `dispatchEmail`, `dispatchSms` | Same calls. The halt deny still returns before `shouldLiveSend` | Cascade and worker sends | Only verified |
| `dispatchEmailLive`, `dispatchSmsLive` | Same gate, still before the provider call | The cohort wrappers when the send is live | Only verified |
| `actuateChannelSend` | Unchanged. `firmId` is `input.firmId`. The no-address dry-run stays before the gate | Enroll first step, escalation, cell advance, wait-until | Only verified |
| `handleCemSend`, `handleSmsSend` | Unchanged. `firmId` is the session firm. `body.firmId` stays unused | `POST /send/cem`, `POST /send/sms` | Only verified |
| `call_agent` | Unchanged. `firmId` is `opts.firmId`. `fireFirstStep` is `true` | Walk enroll | Only verified |
| Tick sends | Unchanged. `firmId` is `attempt.firm_id` | `escalateAttemptWindow`, `advanceTemplateCellIfDue`, `tickOnce` | Only verified |
| `handleHaltIsContact` | Same predicate, bound to `[contactId, firmId ?? null]`. Query name `firmId`. No `requireSessionFirm` | `GET /halt/contact/:contactId` | Modified |
| `HaltStorePort.isContactHalted` | Second argument `firmId: string` | Stand-in, real client, `standInSendGate`, `createEnrollment` | Modified |
| Real `isContactHalted` | Requests `/halt/contact/:contactId?firmId=` with both values encoded | `realHaltStore` | Modified |
| Stand-in `isContactHalted` | True only for an active contact row with that contact and that firm | `standInSendGate`, `createEnrollment` | Modified |
| `standInSendGate` | Passes `input.firmId` when `contactId` is set | `wirePorts.sendGate` | Modified |
| `createEnrollment` | Passes `standInFirm()` | Stand-in machine enroll | Modified |
| `sendGate` registry | Stays `standInSendGate` | The desk send gate | Only verified |
| `isHaltBlockingNew` | Unchanged by this packet | `enrollAndActuate` | Only verified |
| `handleEnrollmentCreate` | Unchanged. Stays on `enrollAndActuate` | `POST /machine/enrollments` | Only verified |
| `halt_records` indexes | Unchanged. The contact partial index stays on `contact_id`. No unique constraint is added | The new predicate | Only verified |
| `scripts/verify-halt-send-firm.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases, the stand-in cases, and the shape guard | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| The contact arm matches `contact_id` and ignores `firm_id`, so a halt stored on another firm denies a send in this firm. `firm_id` is `NOT NULL` and is already the second argument of `consentAndHaltGate`. The contact arm adds `firm_id = $2` beside `contact_id = $1`, bound to `[contactId, firmId]`. The arm runs only after the `if (!contactId) return` allow, so the bind is a present contact id. `LIMIT 1` stays an existence check. Two active rows are one deny. The statement has no `ORDER BY` and no unique constraint. The firm-book arm already binds `[firmId]` and stays first. | necessary |
| `handleHaltIsContact` uses that same unscoped predicate and has no firm. `handleHaltList` already reads `c.req.query("firmId")`. The contact handler uses that query name and binds `[contactId, firmId ?? null]`. `firm_id = NULL` is not true, so a missing query does not match. The route path stays. The handler does not call `requireSessionFirm`. The response stays `{ halted: boolean }`. A firm-book row fails the `scope = 'contact'` predicate. | necessary |
| `HaltStorePort.isContactHalted` takes only `contactId`. The real client requests `/halt/contact/:contactId` with no query. The stand-in returns true on `contactId` alone. The only callers are `standInSendGate`, which already holds `input.firmId`, and `createEnrollment`, which already calls `standInFirm()` for the firm-book check. The signature gains `firmId`. Those two callers pass the firm they already have. `sendGate` stays `standInSendGate`. `isFirmBookHalted` stays. | necessary |
| `dispatchEmail` and `dispatchSms` already call the gate before `shouldLiveSend` and pass `input.firmId`. The live functions already call the gate before the provider call and pass `input.firmId`. `actuateChannelSend` already passes `input.firmId` and already returns the no-address dry-run before either dispatcher. `handleCemSend` and `handleSmsSend` already pass the session firm. `call_agent` already passes `opts.firmId` and `fireFirstStep: true`. The three tick sends already pass `attempt.firm_id`. This packet does not edit those callers. The contact arm they already call is the change. | necessary |
| PKT-015’s change specification tells `factory-check` to fail if the contact statement of `consentAndHaltGate`, the statement of `handleHaltIsContact`, or either `isContactHalted` contains `firm_id`. That freeze kept the enroll packet off this read. This packet replaces that freeze for these readers. The `isHaltBlockingNew` clause stays. `scripts/factory-check.ts` on this commit does not yet contain that forbid. If it is present when this packet is planted, remove it only for these readers. Do not remove a clause that requires `firm_id = $1` on the contact arm of `isHaltBlockingNew`. This packet does not edit `PKT-015-halt-enroll-firm.md` or `SCP-pkt-015-halt-enroll-firm.md`. | necessary |
| `isHaltBlockingNew` in the planted tree still matches a contact halt by `contact_id` with no `firm_id` predicate. PKT-015 is `change_specified` and owns that statement. A contact halt on another firm can still block a new enroll in this firm until that plant lands. This packet does not implement that predicate and does not edit the function. The send deny and the enroll block stay different results. | adjacent |
| The consent select is `WHERE contact_id = $1 LIMIT 1` on a table keyed by `(contact_id, firm_id)`. Claim 23 owns that select. Two consent rows for one contact make `LIMIT 1` without `ORDER BY` pick either row. This packet does not add `firm_id` to the select. The verify inserts one non-denying consent row when it needs the contact arm under `purpose` `cem`, and it deletes that row for the `opt-in` case. | adjacent |
| The contact partial index is `(contact_id) WHERE lifted_at IS NULL AND scope = 'contact'`. It is not unique and it does not include `firm_id`. The packet says the index is not a second key. The existence check does not require a new index. This packet does not add a migration. | adjacent |
| `dispatchEmailLive` returns `RESEND_API_KEY missing` before the gate when the Resend capability is false. `dispatchSmsLive` returns the Twilio-missing deny before the gate when the Twilio capability is false. The packet says those functions still call the gate and still return before the provider call. It does not move the gate in front of the capability return. The verify does not call the live functions. The shape guard requires the gate before `emails.send` and before `messages.create`. | adjacent |
| `handleCemSend` and `handleSmsSend` reject a missing `contactId` before `dispatchEmail` and `dispatchSms`. The no-contact firm-book arm is on the gate, and the planted HTTP callers do not reach it. The verify calls `dispatchEmail` and `dispatchSms` with no `contactId`. This packet does not add an HTTP caller and does not remove the contactId rejection. | adjacent |
| Claim 20 classifies the tick’s escalation, cell advance, and wait-until send. Those calls already pass `attempt.firm_id`. This packet does not edit them and does not decide the classification. Claims 21 and 22 own the engagement kind stored when a deny comes back. `actuateChannelSend`’s callers write that engagement after the send returns. This packet does not edit those writes. | adjacent |
| The three component contracts do not list claim 19. This packet does not edit them. `chips` on `standInSendGate` calls `collectReasons` without a `contactId`, so it does not call `isContactHalted`. `standInFirm` falls back to `firm-cedar` when no firm is active. This packet passes that function through and does not change it. | adjacent |
| The packet file still says `**Release:** draft`. The ledger stage for this revision was `released` when this wake was authorized, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
