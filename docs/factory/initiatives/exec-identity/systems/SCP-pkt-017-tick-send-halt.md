# SCP-pkt-017 — A tick send on an open attempt is a new send the halt stops; the attempt is not aborted

**Packet:** PKT-017 `pkt-017-tick-send-halt`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 20, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`.  
**Contract:** The packet names no component contract. `docs/factory/components/firing-pointers/CONTRACT.md` ends at claim 16. `docs/factory/components/walk-handle/CONTRACT.md` and `docs/factory/components/pursuit-identity/CONTRACT.md` do not list claim 20. This packet does not edit those files.

## Intent

A `tickOnce` handoff for an `active_attempts` row that is already `open` is one of H1’s new sends. `consentAndHaltGate` denies it. The attempt is not aborted. `tickOnce` keeps selecting `status = 'open'` and keeps running the attempt engine for that row. Halt does not set `active_attempts.status`, does not take the inbound nullify path, and does not undo the writes made before the send.

The three sends are the three `actuateChannelSend` calls that already exist. Each passes `firmId: attempt.firm_id`, `contactId: attempt.contact_id`, and `purpose: "cem"`. They sit in `escalateAttemptWindow`, in `advanceTemplateCellIfDue`, and in the wait-until arm inside `tickOnce`. The planted functions already do this. A deny already returns `{ ok: false, deny: "policy", detail: "halt active" }` from `dispatchEmail` and `dispatchSms` before `shouldLiveSend`, and neither function rolls the attempt back. This packet does not add a `halt_records` read to `tickOnce`, does not call `isHaltBlockingNew` from the tick, and does not edit `consentAndHaltGate`.

The change this packet plants is the proof that those statements stay true, and the shape guard that a later edit cannot abort the attempt, put the pre-send writes back, or move the three calls off `purpose: "cem"`.

## Must / must-not

- Do not edit `consentAndHaltGate`. Do not add `firm_id` to its contact arm in this packet. Do not remove `firm_id` from that arm if PKT-016 has already planted it. The firm-book arm stays first. A deny stays `{ allow: false, deny: "policy", detail: "halt active" }`. The function stays unexported. Its parameters stay `(contactId, firmId, purpose)`.
- Do not edit `isHaltBlockingNew` or the `enrollAndActuate` call that uses it. The first `actuateChannelSend` inside `enrollAndActuate` stays `purpose: input.purpose ?? "opt-in"`. It is not one of the three sends.
- Do not edit `actuateChannelSend`. `firmId` stays `input.firmId`. The `no email on contact — dry-run intent only` and `no phone on contact — dry-run intent only` returns stay before `dispatchEmail` and `dispatchSms`. A channel other than email or text still returns `channel ${channel} has no live dispatcher` without the gate.
- Do not edit `criteriaDue` or `hasInboundOverride`. `hasInboundOverride` still reads `inbound_reply`, `form_visit`, and `inbound_override`. It still does not read `halt_records` and still does not set `status`.
- Keep the three calls. Do not add a fourth send on this path. Do not give them another `firmId`, another `contactId`, or another `purpose`. Do not read `sequence_template.sequence_class` in `escalateAttemptWindow`, `advanceTemplateCellIfDue`, or `tickOnce`.

```501:512:server/wire-service/cascade.ts
    send = await actuateChannelSend({
      firmId: attempt.firm_id,
      contactId: attempt.contact_id,
      channel: toChannel,
      purpose: "cem",
      subject,
      bodyText,
      enrollmentId: stamp.enrollmentId,
      campaignId: stamp.campaignId,
      campaignObjectiveId: stamp.campaignObjectiveId,
      attemptId: stamp.attemptId,
    });
```

```921:932:server/wire-service/cascade.ts
    send = await actuateChannelSend({
      firmId: attempt.firm_id,
      contactId: attempt.contact_id,
      channel: toChannel,
      purpose: "cem",
      subject,
      bodyText,
      enrollmentId: stamp.enrollmentId,
      campaignId: stamp.campaignId,
      campaignObjectiveId: stamp.campaignObjectiveId,
      attemptId: stamp.attemptId,
    });
```

```1080:1091:server/wire-service/cascade.ts
        await actuateChannelSend({
          firmId: attempt.firm_id,
          contactId: attempt.contact_id,
          channel: owner,
          purpose: "cem",
          subject,
          bodyText,
          enrollmentId: stamp.enrollmentId,
          campaignId: stamp.campaignId,
          campaignObjectiveId: stamp.campaignObjectiveId,
          attemptId: stamp.attemptId,
        });
```

- The escalation send stays inside `toChannel && !waiting && (toChannel === "email" || toChannel === "text")`, after the `active_attempts` update, the `workflow_run` insert, and the `window_fired` engagement. The waiting branch does not call `actuateChannelSend`. On that branch `fired_criteria` is written as `{}` and `attempt_wait_until` stays set. Do not put the criteria id into `fired_criteria` on the waiting branch.
- The cell send stays inside `toChannel === "email" || toChannel === "text"`, after the cursor update, the `workflow_run` insert, and the `cell_advanced` engagement. The cursor update keeps `fired_criteria='{}'::jsonb`. Do not switch that assignment onto the unused local `fired`, which is a copy of the previous map and would keep the old keys.
- The wait arm’s `UPDATE` that clears `attempt_wait_until` stays before `actuateChannelSend`. The call’s return stays discarded. Nothing in that arm after the call writes `attempt_wait_until` back or sets `status` from the send result. Do not extract the arm into a new function so the check can call it.
- `tickOnce`’s open-attempt statement stays `WHERE status = 'open'` and does not mention `halt_records`. `tickOnce` does not call `isHaltBlockingNew`. A deny does not `break` or `continue` the criteria loop. The loop’s existing `break` when `current.status !== "open"` stays. The two `continue`s in the attempt loop stay the inbound-nullify continue and the still-future `attempt_wait_until` continue.
- The only `status='nullified'` writes in `cascade.ts` stay the two branches that run when `hasInboundOverride` returns true: one in `escalateAttemptWindow`, one at the start of each attempt in `tickOnce`. Do not move that SQL into `hasInboundOverride`. Do not add a third nullify. Halt does not call `hasInboundOverride`.
- Do not roll back `owner_channel`, `fired_criteria`, `state`, `window_started_at`, the `workflow_run`, `window_fired`, or `cell_advanced` when the send returns `ok: false`. Do not set `active_attempts.status` from a deny.
- Do not add `send_denied`. Do not retune the engagement written after the send returns. The escalation keeps `send_live` only for `send.ok && !send.dryRun` and `send_dry_run` only for `send.ok && send.dryRun`. The cell keeps its `shouldLiveSend` conjunction. The wait arm keeps an unconditional `send_dry_run`. Do not add a factory-check clause that forbids a later kind. If a clause forbidding `send_denied` is added while this packet is planted, claim 21 removes only that clause.
- `dispatchScheduleTriggers` and `resumeDueWaitingRuns` stay after the attempt loop. Do not move them into the loop and do not skip them because a send was denied.
- Do not add a migration. Do not add a table or a column. Do not edit `src/` or a route. `npm run build` is not the proof.

## Stores and contracts

No new table and no new column. No migration. The attempt the tick loads is `active_attempts`. `status` defaults to `open`. `state` is jsonb. `enrollment_id` references `enrollment` and is nullable. The tick clock and the idempotent marker are later columns on that same table. The open index is not a halt predicate.

```345:355:supabase/migrations/004_machine_tables.sql
CREATE TABLE IF NOT EXISTS active_attempts (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  enrollment_id TEXT REFERENCES enrollment(id) ON DELETE SET NULL,
  owner_channel TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

```4:18:supabase/migrations/005_actuation.sql
ALTER TABLE active_attempts
  ADD COLUMN IF NOT EXISTS window_started_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE active_attempts
  ADD COLUMN IF NOT EXISTS fired_criteria JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Backfill: keep original clock for existing rows
UPDATE active_attempts
SET window_started_at = created_at
WHERE window_started_at IS DISTINCT FROM created_at
  AND created_at < window_started_at;

CREATE INDEX IF NOT EXISTS active_attempts_open_idx
  ON active_attempts (firm_id, status)
  WHERE status = 'open';
```

`engagement_records.event_kind` is unconstrained text. `window_fired` and `cell_advanced` are the kinds written before the send. This packet does not add a kind. `workflow_run.workflow_id` references `workflow`. `ensureTickWorkflow` inserts `wf-tick-${firmId}` and a `workflow_state` row. Those rows are the pre-send run, not a new store.

`halt_records` is the store the gate already reads. `firm_id` is `NOT NULL`. `contact_id` is nullable. `scope` is `contact` or `firm-book`. There is no foreign key from `halt_records.firm_id` to `ct_firms`. This packet does not change the table. The contact partial index stays on `contact_id` and does not include `firm_id`.

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

`consent_records` is keyed by `(contact_id, firm_id)`. The select in front of the contact arm does not use `firm_id`. That select is claim 23. This packet does not add `firm_id` to it. The verify inserts one row with `basis` `express` and `silenced` false so purpose `cem` is not denied as `consent missing` or `silenced`.

`sequence_template.cells` is jsonb. `sequence_class` is `NOT NULL` and checked. `advanceTemplateCellIfDue` loads `id, label, cells` through `loadTemplateCells`. It does not read `sequence_class`. `campaign.sequence_id` references `sequence_template`. `enrollment.campaign_id` references `campaign`. The waiting-branch fixture needs those rows because `escalateAttemptWindow` reads `enrollment.campaign_id` and then `campaign.attempt_count` only when the ladder did not already choose a channel. The three send calls do not read `sequence_class`.

The packet names no component contract. The firing-pointers contract ends at claim 16. The walk-handle contract loads pointers. The pursuit-identity contract decides which enrollment a completion advances. None of those sentences is this tick send. This packet does not edit the three contract files.

`TickFire.send` stays optional. A skipped send leaves it undefined. A deny leaves it `{ ok: false, deny: "policy", detail: "halt active" }`. No new port type.

## Runtime

The open-attempt reader is this statement. It does not mention `halt_records`. The reload inside the criteria loop is a different statement, `WHERE id=$1`, and the loop breaks when that row’s `status` is not `open`.

```982:992:server/wire-service/cascade.ts
  const attempts = await pool.query<ActiveAttemptRow>(
    `SELECT id, firm_id, contact_id, enrollment_id, owner_channel, status,
            COALESCE(state, '{}'::jsonb) AS state,
            COALESCE(window_started_at, created_at) AS window_started_at,
            COALESCE(fired_criteria, '{}'::jsonb) AS fired_criteria,
            created_at
     FROM active_attempts
     WHERE status = 'open'
     ORDER BY created_at ASC
     LIMIT 500`,
  );
```

`hasInboundOverride` is the only nullify predicate on this path. The two status writes sit in the branches that call it. They are not inside the function body.

```239:254:server/wire-service/cascade.ts
async function hasInboundOverride(
  pool: Pool,
  attempt: ActiveAttemptRow,
): Promise<boolean> {
  if (attempt.state?.inbound_override) return true;
  const since = attempt.window_started_at;
  const inbound = await pool.query(
    `SELECT 1 FROM engagement_records
     WHERE firm_id=$1 AND contact_id=$2
       AND event_kind IN ('inbound_reply','form_visit','inbound_override')
       AND created_at >= $3::timestamptz
     LIMIT 1`,
    [attempt.firm_id, attempt.contact_id, since],
  );
  return Boolean(inbound.rowCount && inbound.rowCount > 0);
}
```

```336:342:server/wire-service/cascade.ts
  if (await hasInboundOverride(pool, attempt)) {
    await pool.query(
      `UPDATE active_attempts
       SET status='nullified', updated_at=now(),
           state = state || jsonb_build_object('inbound_override', true, 'nullified_at', $2::text)
       WHERE id=$1`,
      [attempt.id, now.toISOString()],
```

```1010:1018:server/wire-service/cascade.ts
    if (await hasInboundOverride(pool, attempt)) {
      await pool.query(
        `UPDATE active_attempts SET status='nullified', updated_at=now(),
           state = state || jsonb_build_object('inbound_override', true)
         WHERE id=$1 AND status='open'`,
        [attempt.id],
      );
      nullified += 1;
      continue;
```

`escalateAttemptWindow` returns null when `attempt.fired_criteria?.[criteria.id]` is already set. It does not reload that map itself. `tickOnce` reloads the row before each call. The pre-send update writes `owner_channel`, `fired_criteria`, and `state` and does not set `status`. On a non-waiting fire, `fired_criteria` gains the criteria id. On a waiting fire, `fired_criteria` is `{}`.

```429:437:server/wire-service/cascade.ts
  await pool.query(
    `UPDATE active_attempts
     SET owner_channel=$2,
         fired_criteria=$3::jsonb,
         state=$4::jsonb,
         updated_at=now()
     WHERE id=$1 AND status='open'`,
    [attempt.id, toChannel ?? fromChannel, JSON.stringify(fired), JSON.stringify(nextState)],
  );
```

The waiting flag is `queuedNextAttempt` plus a future `attempt_wait_until`. That timestamp is written onto `attempt.state` before `nextState` is built, and only if `attempt.state` is already an object. `tickOnce` coalesces `state` to `{}`, so the object is present on the tick path. The send is skipped while `waiting` is true.

```478:483:server/wire-service/cascade.ts
  let send: DispatchResult | undefined;
  const waiting =
    queuedNextAttempt &&
    typeof nextState.attempt_wait_until === "string" &&
    new Date(String(nextState.attempt_wait_until)).getTime() > now.getTime();
  if (toChannel && !waiting && (toChannel === "email" || toChannel === "text")) {
```

After that call, `send.ok && !send.dryRun` writes `send_live`. `send.ok && send.dryRun` writes `send_dry_run`. An `ok: false` result writes neither row. There is no later `UPDATE active_attempts` in the function. `recordCampaignFailure` runs only when `toChannel` is still null, which is not the send branch and not the waiting branch (the queue has already set `toChannel`).

`advanceTemplateCellIfDue` writes the next cell, `delivered: true`, `delivered_at`, `fired_criteria='{}'`, and `window_started_at` before the send. A channel other than `email` or `text` does not call `actuateChannelSend`. `send` stays undefined. The cell update still stands.

```864:873:server/wire-service/cascade.ts
  await pool.query(
    `UPDATE active_attempts
     SET owner_channel=$2,
         fired_criteria='{}'::jsonb,
         state=$3::jsonb,
         window_started_at=$4::timestamptz,
         updated_at=now()
     WHERE id=$1 AND status='open'`,
    [attempt.id, toChannel, JSON.stringify(nextState), now.toISOString()],
  );
```

```916:920:server/wire-service/cascade.ts
  let send: DispatchResult | undefined;
  if (toChannel === "email" || toChannel === "text") {
    const subject = next.subject;
    const bodyText = next.bodyText;
    const stamp = await pursuitForAttempt(pool, attempt);
```

The cell engagement after the send uses `shouldLiveSend` even when `send.ok` is false, so a deny stores `send_dry_run`. That writer stays. Claim 21 owns the kind.

The wait arm clears the key, moves `window_started_at`, then sends. The return is not bound. The engagement that follows is always `send_dry_run`.

```1046:1054:server/wire-service/cascade.ts
    if (typeof waitUntil === "string") {
      const cleared = { ...(attempt.state ?? {}) };
      delete cleared.attempt_wait_until;
      await pool.query(
        `UPDATE active_attempts
         SET state=$2::jsonb, window_started_at=$3::timestamptz, updated_at=now()
         WHERE id=$1 AND status='open'`,
        [attempt.id, JSON.stringify(cleared), now.toISOString()],
      );
```

The criteria loop does not read the send result. It breaks only when the reloaded row is missing or not `open`. A deny leaves `status` at `open`, so the loop continues to the next criteria row.

```1102:1128:server/wire-service/cascade.ts
    for (const row of criteria) {
      // Reload attempt after possible prior fire in this tick
      const fresh = await pool.query<ActiveAttemptRow>(
        `SELECT id, firm_id, contact_id, enrollment_id, owner_channel, status,
                COALESCE(state, '{}'::jsonb) AS state,
                COALESCE(window_started_at, created_at) AS window_started_at,
                COALESCE(fired_criteria, '{}'::jsonb) AS fired_criteria,
                created_at
         FROM active_attempts WHERE id=$1`,
        [attempt.id],
      );
      const current = fresh.rows[0];
      if (!current || current.status !== "open") break;
      if (typeof current.state === "string") current.state = JSON.parse(current.state);
      if (typeof current.fired_criteria === "string") {
        current.fired_criteria = JSON.parse(current.fired_criteria as unknown as string);
      }

      const result = await escalateAttemptWindow(
        pool,
        current,
        row,
        order,
        now,
        resolved.withinSeconds,
      );
      if (result) fired.push(result);
```

`actuateChannelSend` reaches the gate only when the contact has an address, or when a live send falls back to `TEST_EMAIL_TO` or `TEST_SMS_TO`. A missing address with no fallback returns the dry-run and does not call the gate.

```613:636:server/wire-service/cascade.ts
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
```

The gate the three sends already reach is unchanged by this packet. The firm-book arm denies an active firm-book row for `attempt.firm_id`. The contact arm does not read `purpose`, so `cem` is not an exemption. The planted contact arm matches `contact_id` only. PKT-016 adds `firm_id = $2`. A halt whose `firm_id` is `attempt.firm_id` denies under both statements. This packet does not retune either statement.

```50:90:server/wire-service/dispatchSend.ts
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
```

`dispatchEmail` and `dispatchSms` return that deny before `shouldLiveSend`. They do not write `outbound_messages` on that return.

```284:306:server/wire-service/dispatchSend.ts
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
```

`dispatchEmailLive` still calls the same gate before `emails.send`. `dispatchSmsLive` still calls it before `messages.create`. Each live function still returns its capability deny before the gate when Resend or Twilio is absent. This packet does not move the gate in front of that capability return, and the check does not call either live function.

`isHaltBlockingNew` stays the enroll predicate. The planted contact arm still has no `firm_id`. PKT-015 owns that statement. This packet does not implement it.

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

```785:790:server/wire-service/cascade.ts
    send = await actuateChannelSend({
      firmId: input.firmId,
      contactId: input.contactId,
      channel: owner,
      purpose: input.purpose ?? "opt-in",
      subject,
```

`enrollAndActuate` still returns `blocked: "halt"` before `INSERT INTO enrollment` when `isHaltBlockingNew` is true. Its first send still runs only after that predicate has passed.

## Ports

No new port. No route change. No stand-in change.

These stay on the same functions:

- `escalateAttemptWindow(pool, attempt, criteria, channelOrder, now?, withinSeconds?)`. Same export. `send` on `TickFire` stays optional. A waiting fire and a non-email, non-text fire leave `send` undefined. A halt deny sets `send` to `{ ok: false, deny: "policy", detail: "halt active" }`.
- `advanceTemplateCellIfDue(pool, attempt, now?)`. Same export. Same `TickFire`. A next channel other than `email` or `text` leaves `send` undefined.
- `tickOnce(now?)`. Same export. The open-attempt statement stays `WHERE status = 'open'`. The function does not gain a halt argument.
- `actuateChannelSend(input: ChannelSendInput)`. Same input. `firmId` is `input.firmId`. `purpose` is `input.purpose`. The no-address returns stay.
- `consentAndHaltGate(contactId, firmId, purpose)`. Still unexported. Unchanged by this packet.
- `dispatchEmail` and `dispatchSms`. Same input types. The halt deny still returns before `shouldLiveSend`.
- `dispatchEmailLive` and `dispatchSmsLive`. Same input types. The gate still runs before the provider call. The capability return in front of the gate stays.
- `isHaltBlockingNew(firmId, contactId?)`. Unchanged by this packet.
- `enrollAndActuate`. Same input. The first send stays `purpose: input.purpose ?? "opt-in"`. The halt return stays `blocked: "halt"`.
- `writeEngagement(pool, firmId, contactId, eventKind, payload)`. Same signature. This packet does not add an event kind.
- `machine.ts` and `worker.ts` still call `tickOnce()`. This packet does not edit those callers. The check does not call `tickOnce`.

## Verify

`scripts/verify-tick-send-halt.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` in job `verify-ship`, after migrate and seed, in the same job as `verify-click-attribution`, as its own step `npx tsx --env-file=.env scripts/verify-tick-send-halt.ts`. Do not fold it into `npm run verify:ship`. `npm run build` is not that proof.

The script uses `getPool()` the way `scripts/verify-click-attribution.ts` does. It imports `escalateAttemptWindow` and `advanceTemplateCellIfDue` from `server/wire-service/cascade.ts`. It exits 2 when `DATABASE_URL` is missing. It deletes `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `TWILIO_PHONE_NUMBER`, `SEND_MODE`, `SEND_TEST_COHORT`, `TEST_EMAIL_TO`, and `TEST_SMS_TO` for the process. It does not call `tickOnce`, `enrollAndActuate`, `isHaltBlockingNew`, `consentAndHaltGate`, `dispatchEmailLive`, `dispatchSmsLive`, `getResend`, or `getTwilio`. It does not boot Vite. It does not build a workflow graph. It does not read `supabase/migrations`.

The firm id is `firm-pkt017-` plus a run token. The contact id is `cr-pkt017-` plus that token. The firm is not the seeded Harbor firm. Halt inserts use `consultant_id` `pkt017` and an id unique to the run. The consent insert uses `basis` `express` and `silenced` false. The contact row starts with an email and a null phone. Neither firm id nor contact id is deleted from the seed. The script deletes the rows it inserts, in a `finally`, in foreign-key order: `engagement_records`, `workflow_run`, `workflow_state`, `workflow` (`wf-tick-` plus this firm id), `active_attempts`, `enrollment`, `campaign`, `sequence_template`, `halt_records`, `consent_records`, `contact_records`, `outbound_messages`, and `messaging_events`, by this firm id and this contact id. An open attempt left behind would be scanned by `verify:worker`, which calls `tickOnce`.

A halt deny is `{ ok: false, deny: "policy", detail: "halt active" }`. The no-address dry-run is `ok: true`, `dryRun: true`, and `reason` `no email on contact — dry-run intent only`. After every `escalateAttemptWindow` and `advanceTemplateCellIfDue` call, `outbound_messages` for this firm is empty.

Escalation criteria passed in memory: `enabled` true, `when_clause` null, `condition_clause` null, `channel_token` null, `threshold` null. `withinSeconds` is `0`. `window_started_at` is at or before `now`, so the elapsed check passes and the delivered and opened clauses do not. The non-waiting fires use `set_value` `return_to_sequence_head` and `channelOrder` `["email"]`, so `toChannel` is `email` and the campaign queue does not run. `enrollment_id` is null on those fires. `fired_criteria` starts as `{}`. `state` is an object. `state.inbound_override` is absent. The second call reloads the row and, if `fired_criteria` or `state` comes back as a string, parses it the way `tickOnce` does before passing the row in. `escalateAttemptWindow` reads the object it is given. It does not reload.

The cell templates are inserted before the first `advanceTemplateCellIfDue` call and are not updated after. `loadTemplateCells` caches by template id for the process. Each template has two cells. The first cell has `offsetMinutes` `0`. The second cell has `offsetMinutes` `0` and `channel` `email` or `form`. `state.cellIndex` is `0`. `state.templateId` is that template id. `state.enrolledAt` is before `now`, so the next cell is due. `sequence_class` is `optin_launch` because the column requires one of the checked values. The calls do not read it.

The waiting fire uses its own attempt. `set_value` is `hold`, which is not `return_to_sequence_head`, `escalate_forward`, `next_attempt_or_forward`, or `tier_signal_low_nonreply`. `state` is the object `{ attempt_n: 1 }`. The attempt’s `enrollment_id` points at an enrollment whose `campaign_id` points at a campaign with `attempt_count` `3` and `wait_after_last_failed_seconds` `3600`. That campaign’s `sequence_id` is a template this script inserts. `channelOrder` is `["email"]`. The queue sets `toChannel` and a future `attempt_wait_until`. `waiting` is then true, so the send is skipped.

1. With the consent row and an active `scope = 'contact'` halt for this contact and this firm, `escalateAttemptWindow` returns `send` of the halt deny. After the return, `active_attempts.status` is `open`. `fired_criteria` contains that criteria id. `owner_channel` is `email`. One `window_fired` row exists for this attempt id. `outbound_messages` for this firm is empty. The row reloaded from `active_attempts` is passed to a second call. That call returns null. The criteria id is still in `fired_criteria`. The `window_fired` count for this attempt is still 1. `status` is still `open`.
2. Clear contact halts. The only halt is an active `scope = 'firm-book'` row for this firm, with `contact_id` null. A new attempt, same criteria shape, returns the same halt deny. `status` is `open`. `fired_criteria` contains that criteria id. `owner_channel` is `email`. A `window_fired` row exists for that attempt. On a different attempt, the waiting fixture returns a `TickFire` whose `send` is undefined. `status` is `open`. `fired_criteria` is `{}`. `state.attempt_wait_until` is a string whose time is after the `now` passed into the call. A `window_fired` row exists for that attempt. The criteria id is not in `fired_criteria`.
3. Re-insert the contact halt. `advanceTemplateCellIfDue` on the email-next template returns the halt deny. `status` is `open`. `state.cellIndex` is `1`. `state.delivered` is true. `state.delivered_at` is set. `fired_criteria` is `{}`. A `cell_advanced` row exists for that attempt. The check does not assert the kind of any engagement written after that row. A new attempt on the form-next template returns `send` undefined. `status` is `open`. `state.cellIndex` is `1`. `state.delivered` is true. A `cell_advanced` row exists. The form result is not the halt deny.
4. Set the contact email to null and leave the phone null. Keep the contact halt. A new email escalation returns the no-address dry-run, not the halt deny. `status` is `open`. `fired_criteria` contains that criteria id. A `window_fired` row exists. A new attempt on the email-next template returns the same dry-run, not the halt deny. `status` is `open`. `state.cellIndex` is `1`. `state.delivered` is true. A `cell_advanced` row exists. The check does not require the gate to have run. The halt is present so a gate call would have returned the deny. The dry-run is the proof the gate did not run.
5. The script does not call `tickOnce`. The shape guard below is acceptance 5. The wait arm’s clear stays before `actuateChannelSend`. The open-attempt statement stays `WHERE status = 'open'` and does not mention `halt_records`. `tickOnce` does not call `isHaltBlockingNew`. The two `status='nullified'` writes stay the two `hasInboundOverride` branches.
6. The three calls still pass `firmId: attempt.firm_id`, `contactId: attempt.contact_id`, and `purpose: "cem"`. The script does not call Resend or Twilio. No migration file is added. `enrollAndActuate` is not called. The shape guard is the proof its first send is still `purpose: input.purpose ?? "opt-in"` and that `isHaltBlockingNew` is still the enroll predicate.

The check does not assert `event_kind` on the engagement written after the send returns. It does not fail when the cell path stores `send_dry_run` for a deny. It does not fail when the escalation path stores neither `send_live` nor `send_dry_run`. It does not require `send_denied` to be present or absent. It does not assert the other-firm contact halt. That case stays PKT-016.

`npm run factory:check` reads the body of `escalateAttemptWindow` and fails unless it contains `firmId: attempt.firm_id`, `contactId: attempt.contact_id`, `purpose: "cem"`, and `toChannel === "email" || toChannel === "text"`. It fails unless `window_fired` appears before that `actuateChannelSend`. It fails unless the pre-send `UPDATE active_attempts` appears before that call and that update does not assign `status`. It fails if `actuateChannelSend` appears inside the function before that update. It fails if any `UPDATE active_attempts` appears after that `actuateChannelSend`. It fails if the function contains `sequence_class`, `halt_records`, or `isHaltBlockingNew`. It fails if the waiting condition `!waiting` is removed from the send guard. It does not assert the `send_live` or `send_dry_run` branches and it does not fail if those branches later gain another kind.

It reads the body of `advanceTemplateCellIfDue` and fails unless `fired_criteria='{}'::jsonb` is the cursor update, `cell_advanced` appears before `actuateChannelSend`, and that call sits inside `toChannel === "email" || toChannel === "text"` with `firmId: attempt.firm_id`, `contactId: attempt.contact_id`, and `purpose: "cem"`. It fails if an `UPDATE active_attempts` appears after that call. It fails if the function contains `sequence_class`. It does not fail because of the unused local `fired`, and it fails if the cursor update writes that local instead of `'{}'::jsonb`.

It reads the body of `tickOnce`, from `export async function tickOnce` through the end of that function, and fails unless the open-attempt statement contains `WHERE status = 'open'` and does not contain `halt_records`. It fails if that body contains `isHaltBlockingNew` or `halt_records`. It fails unless `delete cleared.attempt_wait_until` and the `UPDATE active_attempts` that stores `cleared` appear before the wait arm’s `await actuateChannelSend`, and that call is not assigned. It fails if the source from that call until `for (const row of criteria)` contains `attempt_wait_until` or `UPDATE active_attempts`. The wait arm’s call contains `firmId: attempt.firm_id`, `contactId: attempt.contact_id`, and `purpose: "cem"`. It fails unless `dispatchScheduleTriggers` and `resumeDueWaitingRuns` appear after `for (const attempt of attempts.rows)`. It fails unless the file contains exactly two `status='nullified'` writes, one in `escalateAttemptWindow` and one in `tickOnce`, each in the branch that has just called `hasInboundOverride`. It reads `hasInboundOverride` and fails if that function contains `status='nullified'` or `halt_records`.

It reads `enrollAndActuate` and fails unless `isHaltBlockingNew(input.firmId, input.contactId)` appears before `INSERT INTO enrollment`, and fails unless that function’s `actuateChannelSend` still contains `purpose: input.purpose ?? "opt-in"`. It reads `actuateChannelSend` and fails unless `no email on contact` appears before `dispatchEmail` and `firmId: input.firmId` remains. It reads `dispatchEmail` and `dispatchSms` and fails unless `consentAndHaltGate` appears before `shouldLiveSend`. It does not read the body of `consentAndHaltGate` for a `firm_id` requirement or a `firm_id` forbid. It does not read the body of `isHaltBlockingNew` for either. If a clause already requires `firm_id = $2` on the contact arm of `consentAndHaltGate`, leave it. If a clause already requires `firm_id = $1` on the contact arm of `isHaltBlockingNew`, leave it. If a clause forbids `firm_id` on those arms, leave it for the packet that owns the arm. This packet does not add that forbid and does not remove it. It reads `.github/workflows/ship.yml` and fails unless it invokes `scripts/verify-tick-send-halt.ts`. It fails if this packet adds a file under `supabase/migrations`. Add `server/wire-service/cascade.ts`, `server/wire-service/dispatchSend.ts`, `scripts/verify-tick-send-halt.ts`, and `.github/workflows/ship.yml` to the path filter in `.github/workflows/factory-check.yml` if they are not already listed.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

The enroll predicate (PKT-015). The firm predicate on the send and the contact check (PKT-016). The consent select (claim 23). The engagement kind of a deny (claim 21). The first step’s engagement (claim 22). The opt-in purpose on these three calls (claim 45). The `met` status (claim 64). Aborting an in-flight attempt. Rolling the cell, `fired_criteria`, `delivered`, or the cleared wait back when the gate denies. Skipping `actuateChannelSend` because the attempt is `open`. Reading `halt_records` inside `tickOnce`. Calling `isHaltBlockingNew` from the tick. Extracting the wait arm. `dispatchScheduleTriggers` and `resumeDueWaitingRuns`. The capability return in front of the gate inside `dispatchEmailLive` and `dispatchSmsLive`. `criteriaDue`. Launch Agent. No plate.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `escalateAttemptWindow` send | Same call after the attempt update, the tick `workflow_run`, and `window_fired`. `firmId` is `attempt.firm_id`. `purpose` is `"cem"`. Waiting skips the call. A deny does not set `status` or clear the criteria id | `tickOnce` criteria loop | Only verified |
| `advanceTemplateCellIfDue` send | Same call after the cursor update, the tick `workflow_run`, and `cell_advanced`. Cursor write stays `fired_criteria='{}'::jsonb`. A non-email, non-text channel does not call | `tickOnce` | Only verified |
| Wait arm inside `tickOnce` | Clear of `attempt_wait_until` stays before the discarded `actuateChannelSend`. Nothing after that call in the arm writes the key back or sets `status` | The same tick iteration’s criteria loop | Only verified |
| `tickOnce` open reader | Stays `WHERE status = 'open'`. Does not mention `halt_records`. Does not call `isHaltBlockingNew` | `worker.ts`, `machine.ts` | Only verified |
| Nullify writes | Stay the two `hasInboundOverride` branches. Halt does not take them | Inbound reply, form visit, inbound override | Only verified |
| Criteria loop | Breaks only when the reloaded row is not `open`. A deny does not break or continue | Later criteria on the same attempt | Only verified |
| `actuateChannelSend` | Unchanged. No-address dry-run stays before the gate. `firmId` is `input.firmId` | The three sends and the enroll first step | Only verified |
| `consentAndHaltGate` | Unchanged by this packet. Firm-book arm still denies this firm. Contact arm still does not read `purpose` | `dispatchEmail`, `dispatchSms`, both live dispatchers | Only verified |
| `dispatchEmail`, `dispatchSms` | Same calls. The halt deny still returns before `shouldLiveSend`. No `outbound_messages` row on that return | The three sends | Only verified |
| `dispatchEmailLive`, `dispatchSmsLive` | Same gate, still before the provider call. Capability return in front of the gate stays | Not called by this check | Only verified |
| `isHaltBlockingNew` | Unchanged by this packet | `enrollAndActuate` | Only verified |
| `enrollAndActuate` first send | Unchanged. `purpose` stays `input.purpose ?? "opt-in"`. Still after `isHaltBlockingNew` | Direct enroll, `call_agent`, sequence enroll | Only verified |
| Post-send engagement kinds | Unchanged. Escalation writes neither kind on `ok: false`. Cell may write `send_dry_run`. Wait arm always writes `send_dry_run` | Claim 21 | Only verified |
| `dispatchScheduleTriggers`, `resumeDueWaitingRuns` | Stay after the attempt loop | Schedule walks, waiting runs | Only verified |
| `halt_records`, `active_attempts`, `engagement_records`, `sequence_template` | No new column. No migration. No index change | The existing readers | Only verified |
| Component contracts | None named. Claim 20 is not in the three contracts | Firing pointers, walk handle, pursuit identity | Only verified |
| `scripts/verify-tick-send-halt.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases for the two exported fires, and the shape guard for the wait arm and the non-edits | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| The three `actuateChannelSend` calls already pass `attempt.firm_id`, `attempt.contact_id`, and `purpose: "cem"`, and they already sit after the pre-send writes. `dispatchEmail` and `dispatchSms` already return the gate deny before `shouldLiveSend` and do not update `active_attempts`. A deny therefore leaves `status` at `open` and leaves `fired_criteria`, the cell cursor, and the cleared wait as written. No new predicate belongs in `tickOnce`. The plant is the check and the shape guard that keep those statements. | necessary |
| `escalateAttemptWindow` treats `fired_criteria` as already fired only on the object it was given. The pre-send update writes the database and does not assign the in-memory map. `tickOnce` reloads `WHERE id=$1` and parses a string map before the next call. The verify’s second call reloads and parses the same way. A second call with the original object would fire again. That reload is the engine’s idempotence. It is not a new write. | necessary |
| The cursor update in `advanceTemplateCellIfDue` hardcodes `fired_criteria='{}'::jsonb`. The local `fired` is a spread of the previous map and is not written. Wiring that local into the update would keep the old criteria ids and would miss the packet’s replacement with `{}`. The unused local stays. The SQL stays the empty object. | necessary |
| The wait arm is inside `tickOnce`, and `tickOnce` selects every open attempt. The packet forbids the check from calling it. Acceptance 5 is the source order: the clear `UPDATE` before the discarded send, no `attempt_wait_until` write and no `UPDATE active_attempts` between that send and the criteria loop, the open statement free of `halt_records`, and no `isHaltBlockingNew` in the function body. Do not extract the arm to make a runtime call. | necessary |
| PKT-016’s change specification replaces the contact arm of `consentAndHaltGate` with `contact_id = $1 AND firm_id = $2`. The planted arm on this commit is still `contact_id` only. A halt inserted with `firm_id` equal to `attempt.firm_id` denies under both statements. This packet does not edit the function, does not edit `PKT-016-halt-send-firm.md` or `SCP-pkt-016-halt-send-firm.md`, and does not add a factory-check clause that requires or forbids `firm_id` on that arm. The other-firm allow stays PKT-016. The verify does not assert it. | necessary |
| The two `status='nullified'` writes are the branches that run when `hasInboundOverride` returns true, not statements inside that function. The packet’s existing-behavior section places them there. They stay in those branches. `hasInboundOverride` still does not set `status` and still does not read `halt_records`. | necessary |
| `isHaltBlockingNew` in the planted tree still matches a contact halt by `contact_id` with no `firm_id` predicate. PKT-015 is `change_specified` and owns that statement. This packet does not implement that predicate and does not edit the function. `enrollAndActuate` stays its caller. The first send stays `purpose: input.purpose ?? "opt-in"`. The tick does not call the enroll predicate. | adjacent |
| The escalation writes neither `send_live` nor `send_dry_run` when `send.ok` is false. The cell writes `send_dry_run` when its `shouldLiveSend` conjunction fails, including a deny. The wait arm discards the result and always writes `send_dry_run`. Claim 21 owns those kinds. This packet does not retune the writers and does not add a clause that forbids `send_denied`. | adjacent |
| Claim 45 owns the purpose string when `sequence_template.sequence_class` is `optin`. The fixture sets `sequence_class` to `optin_launch` because the column is `NOT NULL` and checked. The three calls stay the literal `cem` and do not read the column. `loadTemplateCells` selects `id, label, cells`. | adjacent |
| Claim 64 owns the campaign cursor’s `met` status. `recordCampaignFailure` runs in `escalateAttemptWindow` only when `toChannel` is still null. The send branch and the waiting branch both have a channel by then, so this packet’s fires do not take the exhaustion path. The nullify path stays `hasInboundOverride`. This packet does not edit either. | adjacent |
| `criteriaDue` still treats `state.delivered` as the delivered condition and `delivered_at` as a clock anchor. The cell update sets `delivered: true` before `tickOnce` continues into the criteria loop on the same iteration. This packet does not retune `criteriaDue` and the check does not call `tickOnce`, so that same-tick meeting is not this proof. | adjacent |
| The waiting branch assigns `attempt_wait_until` onto `(attempt.state ?? {})`. When `state` is null or undefined, that assignment is discarded and `waiting` stays false, so the function can send instead of waiting. `tickOnce` coalesces `state` with `COALESCE(state, '{}'::jsonb)` before the call. The verify passes a state object. A null state on a direct caller is not a case this packet accepts. This packet does not change the assignment. | adjacent |
| The consent select is `WHERE contact_id = $1 LIMIT 1` on a table keyed by `(contact_id, firm_id)`. Claim 23 owns that select. The verify inserts one non-denying row so purpose `cem` reaches the halt arm. This packet does not add `firm_id` to the select. | adjacent |
| `dispatchEmailLive` returns `RESEND_API_KEY missing` before the gate when the Resend capability is false. `dispatchSmsLive` returns the Twilio-missing deny before the gate when the Twilio capability is false. The packet says those functions still call the gate and still return before the provider call. It does not move the gate in front of the capability return. The verify does not call the live functions. The shape guard requires the gate before `shouldLiveSend` on `dispatchEmail` and `dispatchSms`. | adjacent |
| `loadTemplateCells` caches by template id for the life of the process and does not export a clear. The verify inserts each template before the first load and does not update `cells` after that. This packet does not add cache invalidation. | adjacent |
| `scripts/verify-worker-actuation.ts` and `scripts/verify-author-runtime.ts` call `tickOnce` and therefore scan every open attempt. This packet’s check does not call `tickOnce` and does not edit those scripts. The `finally` delete is what keeps this script’s open attempt out of their scan. | adjacent |
| The three component contracts do not list claim 20. This packet does not edit them. | adjacent |
| The packet file still says `**Release:** draft`. The ledger stage for this revision was `released` when this wake was authorized, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
