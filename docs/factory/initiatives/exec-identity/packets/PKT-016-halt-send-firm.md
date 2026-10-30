# PKT-016 — A contact halt denies a send, and answers the contact check, only in the firm on that row

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 19, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes  
**UI:** none

## Intended behavior

`consentAndHaltGate` still runs the firm-book arm first. That arm stays `scope = 'firm-book' AND firm_id = $1` with `lifted_at` null, bound to `[firmId]`, and it still runs when the send names no contact. A deny is still `{ allow: false, deny: "policy", detail: "halt active" }`.

When `contactId` is present, the consent select still runs before the contact arm, and a consent deny still returns before that arm. The contact arm becomes an existence check on an active `halt_records` row whose `scope` is `contact`, whose `contact_id` is that contact, and whose `firm_id` is the `firmId` argument:

```sql
SELECT 1 FROM halt_records
 WHERE lifted_at IS NULL AND scope = 'contact' AND contact_id = $1 AND firm_id = $2
 LIMIT 1
```

The binds are `[contactId, firmId]`. `LIMIT 1` stays. There is no `ORDER BY`. The arm does not read `purpose`. Two active contact halts in this firm for this contact are one deny. A lifted row does not deny. A contact halt whose `firm_id` is some other firm does not deny. The function keeps its three arguments.

`dispatchEmail` and `dispatchSms` still return that deny before the cohort short-circuit. `dispatchEmailLive` and `dispatchSmsLive` still call the same gate and still return before Resend or Twilio. `actuateChannelSend` still passes `input.firmId`. `handleCemSend` and `handleSmsSend` still pass the session firm and still ignore `body.firmId`. `call_agent` still passes `firmId: opts.firmId` and `fireFirstStep: true`. The tick’s escalation, cell advance, and wait-until send still pass `attempt.firm_id`. This packet does not edit those callers. The gate they already call inherits the contact arm.

`handleHaltIsContact` is the same contact match. The route stays `GET /halt/contact/:contactId`. The firm is the `firmId` query, the same query name `handleHaltList` already reads. The handler does not call `requireSessionFirm`. The statement uses the same contact predicate, bound to `[contactId, firmId ?? null]`. A missing query does not match, because `firm_id` is `NOT NULL` and `firm_id = NULL` is not true. The response stays `{ halted: boolean }`. A firm-book row is not a contact halt.

`HaltStorePort.isContactHalted` takes `(contactId: string, firmId: string)`. The real client requests `/halt/contact/${contactId}?firmId=${firmId}` with both values encoded. The stand-in returns true only for an active row with `scope === "contact"`, that `contactId`, and that `firmId`. `standInSendGate` passes `input.firmId` when `contactId` is set. `createEnrollment` passes `standInFirm()`. `sendGate` stays the stand-in. The real `handleEnrollmentCreate` stays on `enrollAndActuate`.

`isHaltBlockingNew` stays the enroll predicate PKT-015 specified. This packet does not edit that function.

## Existing behavior

The contact arm matches `contact_id` and does not constrain `firm_id`. The consent select in front of it is also by `contact_id` alone:

```81:86:server/wire-service/dispatchSend.ts
  const contactHalted = await pool.query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL AND scope = 'contact' AND contact_id = $1
     LIMIT 1`,
    [contactId],
  );
```

`handleHaltIsContact` uses that same contact predicate and has no firm (`server/wire-service/stores.ts`). The route is `GET /halt/contact/:contactId` (`server/wire-service/routes.ts`). The real client requests that path and passes no firm:

```24:29:src/app/wire/reals/haltStore.ts
  async isContactHalted(contactId) {
    const res = await wireFetch<{ halted: boolean }>(
      `/halt/contact/${encodeURIComponent(contactId)}`,
    );
    return res.halted;
  },
```

The stand-in returns true on `contactId` alone. The port is `isContactHalted(contactId: string)` (`src/app/wire/ports.ts`). `standInSendGate` calls `isContactHalted(input.contactId)`. `createEnrollment` calls `isContactHalted(input.contactId)` beside `isFirmBookHalted(standInFirm())`. `sendGate` is `standInSendGate` (`src/app/wire/registry.ts`). `halt_records.firm_id` is `NOT NULL`. The contact partial index is on `contact_id` alone.

`isHaltBlockingNew` in the planted tree still matches a contact halt by `contact_id` with no `firm_id` predicate (`server/wire-service/dispatchSend.ts`). PKT-015 specifies the enroll change. This packet does not retune that statement.

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof.

1. With a consent row that does not itself deny, `dispatchEmail` returns `{ ok: false, deny: "policy", detail: "halt active" }` when an active `scope = 'contact'` row has that `contact_id` and that `firmId`. It does not return that deny when the only active contact halt for that contact has a different `firm_id`. A row with `lifted_at` set does not deny. The same three results hold for `dispatchSms`.
2. An active `scope = 'firm-book'` row for the send’s firm still denies, including when the send names no contact. A firm-book row for another firm does not. The firm-book statement stays `scope = 'firm-book' AND firm_id = $1`.
3. The contact arm does not read `purpose`. An `opt-in` send with no consent row still reaches the arm and still denies when this firm holds the contact halt. Two active contact halts in this firm for this contact are one deny. The query stays `LIMIT 1` with no `ORDER BY`. No unique constraint is added.
4. `dispatchEmail` and `dispatchSms` still return the halt deny before `shouldLiveSend`. The live dispatchers still call the gate before the provider call. The check does not call Resend or Twilio.
5. `GET /halt/contact/:contactId?firmId=` returns `halted: true` only for an active contact-scope row with that contact and that firm. Another firm, a missing `firmId`, a lifted row, and a firm-book row return `halted: false`. The path stays `/halt/contact/:contactId`. The handler does not call `requireSessionFirm`.
6. The real `isContactHalted(contactId, firmId)` requests that path with the `firmId` query. The stand-in returns true only for that contact and that firm, and it does not treat a firm-book row as a contact halt. `standInSendGate` passes `input.firmId`. `createEnrollment` passes `standInFirm()`.
7. `isHaltBlockingNew` is unchanged. `call_agent` still passes the walk’s firm and `fireFirstStep: true`. `actuateChannelSend` still returns the no-address dry-run without calling the gate. No migration is added.

## Dependencies

PKT-015 specifies the contact arm of `isHaltBlockingNew`. This packet does not implement that predicate and does not edit `PKT-015-halt-enroll-firm.md` or `SCP-pkt-015-halt-enroll-firm.md`. PKT-015’s acceptance item 7, and the change specification that freezes `consentAndHaltGate`, `handleHaltIsContact`, and both `isContactHalted` readers without `firm_id`, kept that plant off this read. This packet replaces that freeze for these readers. The `isHaltBlockingNew` clause stays. If that forbidding clause is already in `scripts/factory-check.ts`, remove it only for these readers.

Claim 20 classifies the tick’s escalation, cell advance, and wait-until send. Those calls already pass `attempt.firm_id`. This packet does not edit them and does not decide the classification. Claim 21 and claim 22 own the engagement kind stored when a deny comes back. Claim 23 owns the consent select in this function. The select stays `WHERE contact_id = $1 LIMIT 1`.

The contact partial index follows the old query. It is not a second key. This packet does not drop it and does not add a firm to it.

## Out of scope

The enroll predicate (PKT-015). The consent select. The tick classification (claim 20). The engagement row for a deny (claims 21 and 22). Aborting an in-flight attempt. A unique constraint on an active contact halt. Rewriting `halt_records_contact_active_idx`. Joining another firm’s contact by email or phone. Matching `contact_records.firm_id`. Reading the session firm inside `handleHaltIsContact`. Switching `sendGate` off the stand-in. The board list. Launch Agent. No plate.

## Plates

None.
