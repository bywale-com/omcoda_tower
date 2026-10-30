# SCP-pkt-019 — A denied first step is the same refusal the tick already records

**Packet:** PKT-019 `pkt-019-first-step-send-denied`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 22, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`.  
**Contract:** The packet names no component contract. `halt-send` has no component contract. This packet does not open one. `docs/factory/components/firing-pointers/CONTRACT.md` ends at claim 16. `docs/factory/components/walk-handle/CONTRACT.md` and `docs/factory/components/pursuit-identity/CONTRACT.md` do not list claim 22. This packet does not edit those files.

## Intent

When `enrollAndActuate` runs its first `actuateChannelSend` and that call returns `ok: false`, it appends one `engagement_records` row of kind `send_denied`. That is the same refusal PKT-018 requires of a tick send. The call is the same dispatcher. The kind is the `DispatchResult`. `shouldLiveSend` is not the kind.

The writer is the `writeEngagement` that already follows the first `actuateChannelSend` inside `enrollAndActuate`, and only when `fireFirstStep` is not false. This packet edits that engagement. It does not edit the call. It does not edit `escalateAttemptWindow`, `advanceTemplateCellIfDue`, or the wait arm inside `tickOnce`.

`writeEngagement` stays the insert. `firm_id` is `input.firmId`. `contact_id` is `input.contactId`. The id is the `eng-` id that function already returns. `event_kind` stays unconstrained text. No migration. No new table.

`enrollment.payload.dryRun` stays `!shouldLiveSend`, written before the send returns. The return’s `dryRun` is that same boolean. A denied live-cohort enroll keeps `dryRun` false on the enrollment and on the return, and `send_denied` on the engagement. This packet does not rewrite either flag from `send.ok`.

## Must / must-not

- Replace the one first-step `writeEngagement` with three calls. `!send.ok` writes `send_denied`. `send.ok && !send.dryRun` writes `send_live`. `send.ok && send.dryRun` writes `send_dry_run`. One write per result. A deny is not also a `send_live` or a `send_dry_run`.
- Do not choose the kind with `live ? "send_live" : "send_dry_run"` or with `shouldLiveSend`. The `const live = shouldLiveSend(input.contactId)` binding stays. It still feeds `dryRun: !live` on the enrollment payload and on the return.
- Do not read `send.detail` or `send.deny` in `enrollAndActuate`. A halt deny, a silenced deny, a consent-missing deny, and a throughput deny are the same kind. A deny that also carries `dryRun: false` or `dryRun: true` is still `send_denied`.
- Do not edit the `actuateChannelSend` call. `purpose` stays `input.purpose ?? "opt-in"`. `subject` and `bodyText` still go into that call. They stay off the deny row.
- Do not edit `writeEngagement`, `isHaltBlockingNew`, `consentAndHaltGate`, `dispatchEmail`, `dispatchSms`, `dispatchEmailLive`, `dispatchSmsLive`, `actuateChannelSend`, `shouldLiveSend`, `escalateAttemptWindow`, `advanceTemplateCellIfDue`, or `tickOnce`.
- Do not edit `titleFor`, `kindOf`, `outcomeFrom`, `thoughtFrom`, `signalsFrom`, `eventKindProse`, or `ActivityInspectDrawer`. Do not add a `send_denied` case.
- Do not set `active_attempts.status` from the send. Do not change `state.delivered`. Do not add `send_denied` to the `event_kind IN` list inside `hasInboundOverride`. The deny does not nullify the attempt.
- Do not put this row on `payload.writes`. Do not add the engagement id to the return or to `call_agent`’s writes. `call_agent` still pushes `result.enrollmentId`.
- Do not rewrite `enrollment.payload.dryRun` or the return’s `dryRun` from `send.ok`. `fireFirstStep === false` still writes no engagement. The halt return before the inserts stays `blocked: "halt"`.
- Do not add a migration, a table, or a column. Do not edit a route. `npm run build` is not the proof. Do not fold the check into `npm run verify:ship`.

`DispatchResult` already has the deny shape. The writer stores that object. It does not narrow it.

```45:48:server/wire-service/dispatchSend.ts
export type DispatchResult =
  | { ok: true; dryRun: false; messageId: string; acceptedAt: string; channel: "email" | "sms" }
  | { ok: true; dryRun: true; reason: string; channel: "email" | "sms" }
  | { ok: false; deny: string; detail?: string; dryRun?: boolean };
```

The planted first step is one write. The kind is `live`. A deny for a live-cohort contact is `send_live` with the copy present and no `messageId`. A deny for any other contact is `send_dry_run` with the copy present and no `reason`.

```770:820:server/wire-service/cascade.ts
  let send: DispatchResult | undefined;
  if (input.fireFirstStep !== false) {
    const authoredContent = (authored?.content ?? {}) as Record<string, unknown>;
    const subject =
      (typeof authoredContent.subject === "string" && authoredContent.subject) ||
      firstCell?.subject ||
      `Tower — ${input.agentRef}`;
    const bodyText =
      (typeof authoredContent.body === "string" && authoredContent.body) ||
      (typeof authoredContent.body_text === "string" && authoredContent.body_text) ||
      (typeof authoredContent.bodyText === "string" && authoredContent.bodyText) ||
      firstCell?.bodyText ||
      `Sequence start via ${input.agentRef}`;
    const { campaignObjectiveIdForCampaign } = await import("./campaignHousing.ts");
    const campaignObjectiveId = await campaignObjectiveIdForCampaign(pool, campaignId);
    send = await actuateChannelSend({
      firmId: input.firmId,
      contactId: input.contactId,
      channel: owner,
      purpose: input.purpose ?? "opt-in",
      subject,
      bodyText,
      enrollmentId: id,
      campaignId,
      campaignObjectiveId,
      attemptId,
    });
    await writeEngagement(pool, input.firmId, input.contactId, live ? "send_live" : "send_dry_run", {
      enrollmentId: id,
      attemptId,
      channel: owner,
      templateId: state.templateId,
      cellId: state.cellId,
      cellIndex: 0,
      subject,
      bodyText,
      messageId: send.ok && !send.dryRun ? send.messageId : undefined,
      reason: send.ok && send.dryRun ? send.reason : undefined,
      send,
    });
  }

  return {
    enrollmentId: id,
    attemptId,
    dryRun: !live,
    send,
    templateId: state.templateId,
    cellId: state.cellId,
    cellIndex: 0,
  };
```

Keep the subject and body computation, the call, the `if (input.fireFirstStep !== false)` guard, and the return. Replace only the `writeEngagement` call with three calls inside that same guard.

When `actuateChannelSend` returns `ok: false`, the row is:

- `event_kind` is `send_denied`.
- The payload carries `enrollmentId` (the enrollment just inserted), `attemptId`, `channel` (the owner channel passed into `actuateChannelSend`), `templateId` (`state.templateId`), `cellId` (`state.cellId`), `cellIndex` (`0`), and `send` (that `DispatchResult`: `ok: false`, and `deny`, `detail`, and `dryRun` as the value already has them).
- `subject`, `bodyText`, `bodyHtml`, `messageId`, and `reason` are absent. They are not stored as null. `JSON.stringify` drops a key whose value is `undefined` and keeps a key whose value is `null`. Pass `cellId: state.cellId`. Do not coerce a missing cell to `null`. With no template cell, `state.cellId` is `undefined` and the stored payload has no `cellId` key. A first cell that exists stores that cell’s id.

An allowed result uses the result, not `shouldLiveSend`.

- `send.ok && !send.dryRun` is `send_live`. The payload carries `messageId: send.messageId`, `subject`, `bodyText`, and `send`, plus the same step keys.
- `send.ok && send.dryRun` is `send_dry_run`. The payload carries `reason: send.reason`, `subject`, `bodyText`, and `send`, plus the same step keys.

The step keys on every arm are `enrollmentId`, `attemptId`, `channel`, `templateId`, `cellId`, and `cellIndex`. `channel` is `owner`. `templateId` is `state.templateId`. `cellIndex` is `0`.

A missing address with no live test fallback, and a channel that is neither email nor text, stay `ok: true` and `dryRun: true`. They are `send_dry_run`. They are not this row. Do not edit those returns. The engagement `channel` is `owner`. The no-dispatcher `DispatchResult` still says `channel: "email"`. The check asserts the payload’s `channel`, not `send.channel`.

```613:624:server/wire-service/cascade.ts
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
```

```664:669:server/wire-service/cascade.ts
  return {
    ok: true,
    dryRun: true,
    reason: `channel ${channel} has no live dispatcher`,
    channel: "email",
  };
```

`fireFirstStep === false` does not enter the guard. `send` stays `undefined`. No engagement row is written. The enrollment insert and the attempt insert still run. The return’s `dryRun` is still `!live`.

When `isHaltBlockingNew` is already true, the function returns before either insert and writes no engagement row. A deny the gate returns after the insert, including a halt the enroll check did not see, is this row. This packet does not make that ordering a second rule.

```689:702:server/wire-service/cascade.ts
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

The attempt insert stays `status` `open` and `state.delivered` true. The deny does not nullify the attempt and does not enter `hasInboundOverride`.

The forbid in `SCP-pkt-018-send-denied-engagement.md` is removed by this specification. The tick writers, their payloads, and their `purpose: "cem"` calls in that file stay. Do not edit `PKT-018-send-denied-engagement.md`. On this commit `scripts/verify-send-denied-engagement.ts` is not planted, and `scripts/factory-check.ts` has no predicate that fails when `enrollAndActuate` contains `"send_denied"`. If that script is present when this packet is planted, the engineer removes only the `enrollAndActuate` kind guard. The rest of that script stays.

## Stores and contracts

No new table and no new column. No migration. `engagement_records.event_kind` is unconstrained text. `payload` is jsonb and defaults to `{}`. The deny row uses the columns this insert already fills.

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

```223:236:server/wire-service/cascade.ts
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

`enrollment` is the row inserted before the send. `payload` is jsonb. `campaign_id` is nullable. This packet does not change that insert. `dryRun: !live` is already inside the payload object, written before `actuateChannelSend` returns.

```70:79:supabase/migrations/004_machine_tables.sql
CREATE TABLE IF NOT EXISTS enrollment (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  agent_ref TEXT NOT NULL,
  sequence_id TEXT,
  workflow_run_id TEXT REFERENCES workflow_run(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`active_attempts.enrollment_id` references `enrollment`. The insert writes `status` `'open'`, `state` with `delivered: true`, and `fired_criteria` `'{}'`. `window_started_at` is the column migration 005 added. This packet does not change that insert.

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

`contact_records` has no foreign key to `firms` or `ct_firms`. The verify inserts a contact for a firm id that is not a seeded firm and does not insert a firm row.

```233:242:supabase/migrations/004_machine_tables.sql
CREATE TABLE IF NOT EXISTS contact_records (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  name TEXT,
  body JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`consent_records` is keyed by `(contact_id, firm_id)`. `basis` is `express`, `implied`, or `none`. `silenced` is boolean. Migration 004 adds `status` with `silenced` as an allowed value. The gate reads `silenced` and `status`. This packet does not change the table or the select.

```38:47:supabase/migrations/003_ct_wire_stores.sql
CREATE TABLE IF NOT EXISTS consent_records (
  contact_id TEXT NOT NULL,
  firm_id TEXT NOT NULL,
  basis TEXT NOT NULL DEFAULT 'none'
    CHECK (basis IN ('express', 'implied', 'none')),
  silenced BOOLEAN NOT NULL DEFAULT false,
  source TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, firm_id)
);
```

```8:10:supabase/migrations/004_machine_tables.sql
ALTER TABLE consent_records
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'unsequenced'
    CHECK (status IN ('unsequenced', 'waitlisted', 'sequenced', 'silenced'));
```

`halt_records.scope` is `contact` or `firm-book`. `consultant_id` and `firm_id` are required. `lifted_at` null means the halt is active. This packet does not change the table.

```19:28:supabase/migrations/003_ct_wire_stores.sql
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
```

The packet names no component contract. The firing-pointers contract ends at claim 16 and does not list claim 22. The walk-handle contract loads pointers. The pursuit-identity contract decides which enrollment a completion advances. None of those sentences is this engagement row. `payload.writes` is the listening handle in `server/wire-service/runWrites.ts`. This row is not a dispatch, so it is not an element of that array. This packet does not edit the three contract files and does not edit `runWrites.ts`.

`RunWrite` stays `table`, `id`, and optional `contact_id`. No new port type.

## Runtime

The enroll predicate is unchanged. A firm-book halt for this firm returns before the inserts. The contact arm matches `contact_id` with no `firm_id` predicate. PKT-015 owns that statement. Case 9 uses the firm-book arm, which already requires `firm_id = $1`.

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

The gate the first send already reaches is unchanged. A silenced row returns before the consent-missing check. Purpose `opt-in` does not require a consent row. Purpose `cem` with no row returns `consent missing`. The writer does not branch on `detail`.

```70:80:server/wire-service/dispatchSend.ts
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
```

`dispatchEmail` returns that deny before `shouldLiveSend`. It does not write `outbound_messages` on that return. `dispatchEmailLive` returns `dryRun: false` when Resend is missing, before its own gate and before any outbound insert. `getWireCapabilities` sets `resend` from a trimmed `RESEND_API_KEY`. Deleting that variable makes `caps.resend` false.

```114:116:server/wire-service/dispatchSend.ts
  if (!caps.resend) {
    return { ok: false, deny: "policy", detail: "RESEND_API_KEY missing", dryRun: false };
  }
```

```284:297:server/wire-service/dispatchSend.ts
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
```

`shouldLiveSend` is true only when `SEND_MODE` is `live` and the contact is in a non-empty `SEND_TEST_COHORT`. That boolean still labels the enrollment and the return. It does not label the engagement.

```33:38:server/wire-service/sendMode.ts
export function shouldLiveSend(contactId: string | undefined | null): boolean {
  if (!contactId) return false;
  if (getSendMode() !== "live") return false;
  const cohort = getSendTestCohort();
  if (cohort.size === 0) return false;
  return cohort.has(contactId);
}
```

With no `sequence_template` row, `resolveBoundTemplate` returns null because `loadTemplateCells` returns null when the id is missing. `templateId` on the attempt state and on the engagement is then `input.agentRef`. `firstCell` is null, so `state.cellId` is `undefined`. With no `campaign` row, `firstCampaignId` returns null, `firstAuthoredChannel` returns null, and `campaignObjectiveIdForCampaign` returns null. The subject falls through to `` `Tower — ${input.agentRef}` `` and the body to `` `Sequence start via ${input.agentRef}` ``. `ownerChannel` wins over `loadChannelOrder`. The platform ladder is not the channel when the case passes `ownerChannel`.

`hasInboundOverride` still does not list `send_denied`. A deny row does not nullify the attempt.

```245:249:server/wire-service/cascade.ts
    `SELECT 1 FROM engagement_records
     WHERE firm_id=$1 AND contact_id=$2
       AND event_kind IN ('inbound_reply','form_visit','inbound_override')
       AND created_at >= $3::timestamptz
     LIMIT 1`,
```

The readers stay. `kindOf` has no `send_denied` case, so that kind is `other`. `outcomeFrom` leaves the outcome line empty because the kind is not `send`. `titleFor` has no `send_denied` case, so the complaint-desk title is the kind with underscores turned into spaces. `thoughtFrom` still reads `payload.reason` and does not read `payload.send`. The deny payload has no top-level `reason`, so that reader does not surface `send.detail`. `eventKindProse` still returns `Sent` when the lowercased kind contains `send`. Claim 40 owns that column. `signalsFrom` and `ActivityInspectDrawer` still light Sent and Delivered from `kind === "send"` or from attempt state. The attempt insert sets `delivered: true` before the deny row, so those tags stay a reading of that state. This packet does not retune them. The inspector replays when `subject`, `bodyText`, or `bodyHtml` is on the projected row. Those keys are absent on the deny payload, so this row does not replay. The drawer is not edited.

```83:84:src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts
function kindOf(eventKind: string): ActivityRowKind {
  if (eventKind === "send_live" || eventKind === "send_dry_run") return "send";
```

```104:107:src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts
    case "send_live":
      return `Send · ${channel ?? "channel"} (live)`;
    case "send_dry_run":
      return `Send · ${channel ?? "channel"} (dry-run)`;
```

```122:123:src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts
    default:
      return eventKind.replace(/_/g, " ");
```

```165:169:src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts
function outcomeFrom(payload: Record<string, unknown>, kind: ActivityRowKind): string | null {
  if (kind === "send") {
    if (payload.reason) return `Outcome · dry-run (${str(payload.reason)})`;
    if (payload.messageId) return "Outcome · accepted";
  }
```

```138:143:src/app/register/prototype-ant/operator/channelRuleGrain.ts
export function eventKindProse(eventKind: string): string {
  const kind = eventKind.toLowerCase();
  if (kind.includes("open")) return "Opened";
  if (kind.includes("click")) return "Clicked";
  if (kind.includes("deliver")) return "Delivered";
  if (kind.includes("send") || kind === "sent") return "Sent";
```

```42:42:src/app/register/prototype-ant/consultant/clientData/ActivityInspectDrawer.tsx
  const hasReplay = Boolean(row?.subject || row?.bodyText || row?.bodyHtml);
```

`call_agent` still pushes the enrollment id and passes `fireFirstStep: true`. It does not push an engagement id. `handleEnrollmentCreate`, `handleOnboardingFire`, `handleSequenceEnrollContacts`, and `runContactEligibilityCascade` also call `enrollAndActuate` and omit `fireFirstStep`, so the first step runs. This packet does not edit those callers. The kind they store is the kind this function writes.

```1356:1378:server/wire-service/workflowWalk.ts
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
            enrollments.push(result.enrollmentId);
            writes.push({
              table: "enrollment",
              id: result.enrollmentId,
              contact_id: contactId,
            });
```

## Ports

No new port. No route change. No stand-in change.

These stay on the same functions:

- `enrollAndActuate(input: EnrollActuateInput)`. Same input. Same return keys: `enrollmentId`, `attemptId`, `dryRun`, `send`, `templateId`, `cellId`, `cellIndex`, and `blocked` on the halt return. No engagement id. The first-step engagement kind changes. The call’s `purpose` stays `input.purpose ?? "opt-in"`.
- `writeEngagement(pool, firmId, contactId, eventKind, payload)`. Same signature. `send_denied` is a value of `eventKind`.
- `actuateChannelSend(input: ChannelSendInput)`. Same input. Unchanged.
- `isHaltBlockingNew`, `consentAndHaltGate`, `dispatchEmail`, `dispatchSms`, `dispatchEmailLive`. Unchanged.
- `escalateAttemptWindow`, `advanceTemplateCellIfDue`, `tickOnce`. Unchanged by this packet. PKT-018 owns their post-send kinds.
- `call_agent` inside `workflowWalk.ts`. Same arguments. Still pushes `result.enrollmentId`.
- `handleEnrollmentCreate`, `handleOnboardingFire`, `handleSequenceEnrollContacts`, and `runContactEligibilityCascade`. Unchanged callers.

## Verify

`scripts/verify-first-step-send-denied.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` in job `verify-ship`, after migrate and seed, as its own step `npx tsx --env-file=.env scripts/verify-first-step-send-denied.ts`. On this commit `scripts/verify-send-denied-engagement.ts` is not a step. Place this step after `scripts/verify-click-attribution.ts`. If that send-denied step is already present, place this step after it. Do not fold it into `npm run verify:ship`. Do not remove a step. `npm run build` is not that proof.

The script uses `getPool()` the way `scripts/verify-click-attribution.ts` does. It imports `enrollAndActuate` from `server/wire-service/cascade.ts`. It exits 2 when `DATABASE_URL` is missing. It deletes `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `TWILIO_PHONE_NUMBER`, `SEND_MODE`, `SEND_TEST_COHORT`, `TEST_EMAIL_TO`, and `TEST_SMS_TO` for the process, and it restores that deletion after each case that sets `SEND_MODE` and `SEND_TEST_COHORT`. It does not call `tickOnce`, `escalateAttemptWindow`, `advanceTemplateCellIfDue`, `dispatchEmailLive`, `dispatchSmsLive`, `getResend`, or `getTwilio`. It does not boot Vite. It does not build a workflow graph. It does not read `supabase/migrations`. It reads the source files named in acceptance 10.

The firm id is `firm-pkt019-` plus a run token. The contact id for each enroll is `cr-pkt019-` plus that token plus a case suffix, so earlier rows do not leak into the count. The firm is not the seeded Harbor firm and not `firm-cedar`. The agent ref is `agt-pkt019-` plus that token, with no `sequence_template` row and no `campaign` row. `ownerChannel` is passed by the case. Halt inserts use `consultant_id` `pkt019` and an id unique to the run. The script deletes the rows it inserts, in a `finally`, in foreign-key order, including `engagement_records`, `active_attempts`, `enrollment`, `halt_records`, `consent_records`, `contact_records`, `messaging_events`, and `outbound_messages`, by this firm id and this contact id. An open attempt left behind would be scanned by a worker that calls `tickOnce`. A firm-book halt blocks every later contact of this firm. Run acceptance 9 after acceptances 1–8, and do not enroll again on this firm while that halt is active.

The stored payload is parsed from jsonb. A forbidden key fails when `key in payload`. A key stored as null fails that test. With no template and no campaign, an allowed row’s `subject` is `Tower — ${agentRef}` and its `bodyText` is `Sequence start via ${agentRef}`. `templateId` is the agent ref. `cellIndex` is `0`. `cellId` is absent. `outbound_messages` for this firm is empty after every case. The return has no engagement id: it has no `engagementId` key, and no property equal to the `eng-` id. `enrollmentId` on the return is the `enr-` id and stays.

1. `SEND_MODE` is unset. The contact has an email. Consent is `basis` `express`, `silenced` true, `status` `silenced`. No halt. `ownerChannel` is `email`. `purpose` is omitted. `fireFirstStep` is omitted. One `send_denied` row is written, and no `send_live` or `send_dry_run`. `send.ok` is false, `send.deny` is `policy`, and `send.detail` is `silenced`. The payload has `enrollmentId`, `attemptId`, `channel` `email`, `templateId`, `cellIndex` `0`, and `send`. It has no `subject`, `bodyText`, `bodyHtml`, `messageId`, `reason`, or `cellId`. The id starts with `eng-`. `firm_id` is the enroll firm and `contact_id` is this contact. The enrollment row exists. Its `payload.dryRun` is true. The return’s `dryRun` is true. The return has no engagement id. `active_attempts.status` is `open`. `state.delivered` is true. The attempt’s `owner_channel` is `email`. The silenced deny’s `send` object has no `dryRun` key. The check does not require one.
2. The same shape, with no consent row and `purpose` `cem`, is one `send_denied` row. `send.detail` is `consent missing`. No `send_live` and no `send_dry_run`. The payload keys match case 1. The writer does not branch on `detail`.
3. `SEND_MODE` is `live` and `SEND_TEST_COHORT` contains this contact only. Consent is silenced, as in case 1. The contact has an email. `ownerChannel` is `email`. `purpose` is `opt-in`. One `send_denied` row, and no `send_live` or `send_dry_run`. The enrollment `payload.dryRun` is false. The return’s `dryRun` is false. `send.ok` is false. The payload has no `subject` or `bodyText`. Delete `SEND_MODE` and `SEND_TEST_COHORT` again before the next case.
4. `SEND_MODE` is `live` and the contact is in the cohort. Consent is `basis` `express`, `silenced` false. The contact has an email. `ownerChannel` is `email`. `purpose` is `opt-in`. No Resend key is set. One `send_denied` row. `send.ok` is false, `send.deny` is `policy`, `send.detail` is `RESEND_API_KEY missing`, and `send.dryRun` is false. No `send_live` and no `send_dry_run`. The payload has no `subject`, `bodyText`, `bodyHtml`, `messageId`, or `reason`. The enrollment `payload.dryRun` is false. Delete `SEND_MODE` and `SEND_TEST_COHORT` again before the next case.
5. `SEND_MODE` is unset. Consent is `basis` `express` and `silenced` false. No consent row is also enough for purpose `opt-in`. The contact has an email. `ownerChannel` is `email`. One `send_dry_run` and no `send_denied`. `send.ok` is true and `send.dryRun` is true. The payload has `reason` `SEND_MODE/cohort gate — fail closed`, `subject`, `bodyText`, and `send`, plus `enrollmentId`, `attemptId`, `channel` `email`, `templateId`, and `cellIndex` `0`. It has no `messageId` and no `cellId`. The enrollment `payload.dryRun` is true.
6. `SEND_MODE` is `live` and the contact is in the cohort. Consent is `basis` `express` and `silenced` false. The contact email is null and the phone is null. `TEST_EMAIL_TO` is unset. `ownerChannel` is `email`. One `send_dry_run` and no `send_denied` and no `send_live`. `reason` is `no email on contact — dry-run intent only`. The payload has `subject`, `bodyText`, and `send`, plus the same step keys as case 5. The enrollment `payload.dryRun` is false. The return’s `dryRun` is false. Delete `SEND_MODE` and `SEND_TEST_COHORT` again before the next case.
7. `SEND_MODE` is unset. Consent is `basis` `express` and `silenced` false. `ownerChannel` is `call`. One `send_dry_run` and no `send_denied`. `send.ok` is true and `send.dryRun` is true. `reason` contains `no live dispatcher`. `channel` on the payload is `call`. The check does not require `send.channel` to be `call`.
8. `fireFirstStep` is false. `SEND_MODE` is unset. Consent is `basis` `express` and `silenced` false. `ownerChannel` is `email`. No engagement row is written. The enrollment row exists. The attempt `status` is `open`. The return’s `send` is undefined. The return’s `dryRun` is true, which is `!shouldLiveSend` for that contact.
9. An active `scope = 'firm-book'` halt has `firm_id` equal to the enroll firm. `enrollAndActuate` returns `blocked` `"halt"` and `enrollmentId` `""`. No enrollment row, no attempt row, and no engagement row are written for this contact.
10. The script reads the first-step writer inside `enrollAndActuate`, from `send = await actuateChannelSend` through the `return` that contains `dryRun: !live`. It fails unless that slice contains `"send_denied"`, `"send_live"`, `"send_dry_run"`, `send.ok && !send.dryRun`, and `send.ok && send.dryRun`. It fails if that slice contains `live ? "send_live" : "send_dry_run"`, `send.detail`, or `send.deny`. There are three `writeEngagement` calls in that slice. The object of the `"send_denied"` call contains `enrollmentId`, `attemptId`, `channel`, `templateId`, `cellId`, `cellIndex`, and `send`, and does not contain `subject`, `bodyText`, `bodyHtml`, `messageId`, or `reason`. The object of the `"send_live"` call contains `messageId`, `subject`, `bodyText`, `send`, and those step keys. The object of the `"send_dry_run"` call contains `reason`, `subject`, `bodyText`, `send`, and those step keys. The `actuateChannelSend` call in that function still contains `purpose: input.purpose ?? "opt-in"`, `subject`, and `bodyText`. The function still contains `const live = shouldLiveSend(input.contactId)`, `dryRun: !live`, and `if (input.fireFirstStep !== false)`. The early return still contains `blocked: "halt"`. `titleFor` has no `case "send_denied"`. `kindOf`’s send test stays `eventKind === "send_live" || eventKind === "send_dry_run"`. `eventKindProse` still returns `Sent` from `kind.includes("send")` and does not contain `send_denied`. `hasInboundOverride`’s `event_kind IN` list does not contain `send_denied`. `call_agent` still pushes `result.enrollmentId` and does not push an engagement id.

`npm run factory:check` reads the same source and fails on the same predicates as acceptance 10. It fails unless `.github/workflows/ship.yml` invokes `scripts/verify-first-step-send-denied.ts`. It fails if this packet adds a file under `supabase/migrations`. It does not fail when the tick writers gain `send_denied`. PKT-018’s check is the one that requires those writers. This packet’s check does not require `live ? "send_live" : "send_dry_run"` anywhere in `enrollAndActuate`. Add `server/wire-service/cascade.ts`, `server/wire-service/workflowWalk.ts`, `src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts`, `src/app/register/prototype-ant/operator/channelRuleGrain.ts`, `scripts/verify-first-step-send-denied.ts`, and `.github/workflows/ship.yml` to the path filter in `.github/workflows/factory-check.yml` if they are not already listed.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

The tick writers and their deny payloads (PKT-018). The open attempt and the pre-send writes (PKT-017). The enroll predicate (PKT-015). The firm predicate (PKT-016). The consent select (claim 23). The operator column (claim 40). A new `titleFor` case. Retuning `kindOf`, `outcomeFrom`, `thoughtFrom`, `signalsFrom`, or the Activity tags. The opt-in purpose (claim 45). Whether a caller invokes `enrollAndActuate` (claim 43 and claim 44). Rewriting `enrollment.payload.dryRun` or the return’s `dryRun` from `send.ok`. Adding the engagement id to the return or to `call_agent`’s writes. Aborting an in-flight attempt. Reading `detail` to split the kind. Adding this row to `payload.writes`. `dispatchScheduleTriggers` and `resumeDueWaitingRuns`. Launch Agent. No plate.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `enrollAndActuate` first-step engagement | `!send.ok` appends one `send_denied` with the step keys and `send`, and without subject or body. `send.ok && !send.dryRun` is `send_live`. `send.ok && send.dryRun` is `send_dry_run`. Both allowed rows keep subject, body, and `send` | `call_agent`, `handleEnrollmentCreate`, `handleOnboardingFire`, `handleSequenceEnrollContacts`, `runContactEligibilityCascade` | Modified |
| `enrollAndActuate` return and enrollment payload | `dryRun` stays `!shouldLiveSend`. No engagement id on the return. Halt return stays `blocked: "halt"` before the inserts | `scripts/verify-deny-gates.ts`, `scripts/verify-author-runtime.ts` | Only verified |
| `actuateChannelSend` call inside `enrollAndActuate` | Same arguments. `purpose` stays `input.purpose ?? "opt-in"`. Subject and body still go into the call | The gate it already reaches | Only verified |
| `actuateChannelSend` no-address and no-dispatcher returns | Stay `ok: true`, `dryRun: true`. Those results stay `send_dry_run`. Payload `channel` stays `owner` | The first-step writer | Only verified |
| `writeEngagement` | Same insert. `send_denied` is a value of unconstrained `event_kind` | The first-step writer and the tick writers | Only verified |
| `isHaltBlockingNew` | Unchanged. Firm-book arm still matches `firm_id = $1` | The early return | Only verified |
| `consentAndHaltGate`, `dispatchEmail`, `dispatchEmailLive` | Unchanged. Silence and missing consent return `ok: false` before `shouldLiveSend`. Missing Resend returns `ok: false` and `dryRun: false` | The first-step writer | Only verified |
| `shouldLiveSend` | Unchanged. Still labels the enrollment and the return. Does not label the engagement | `enrollAndActuate` | Only verified |
| Tick post-send writers | Not edited. PKT-018 owns `send_denied` on those three | `tickOnce` | Only verified |
| `hasInboundOverride` | The inbound list does not gain `send_denied`. A deny does not nullify | The nullify branches | Only verified |
| Attempt insert | Stays `open` with `state.delivered` true. The deny does not update it | Activity tags | Only verified |
| `titleFor`, `kindOf`, `outcomeFrom`, `thoughtFrom`, `signalsFrom` | Unchanged. `send_denied` titles as words, kinds as `other`, and leaves the outcome line empty | Complaint desk | Only verified |
| `eventKindProse` | Unchanged. A kind that contains `send` still reads `Sent` | `AntAgentWorkbench` | Only verified |
| `ActivityInspectDrawer` | Unchanged. Absent subject and body means this row does not replay | Complaint desk | Only verified |
| `call_agent` writes | Still the enrollment id. The engagement id is not pushed | Firing pointers, walk handle | Only verified |
| `payload.writes` | This row is not added | Firing pointers | Only verified |
| `engagement_records` | No new column. No migration | Existing readers | Only verified |
| Component contracts | None named. Claim 22 is not in the three contracts. `halt-send` is not opened | Firing pointers, walk handle, pursuit identity | Only verified |
| `SCP-pkt-018-send-denied-engagement.md` | The forbid on `send_denied` inside `enrollAndActuate`, the freeze of `live ? "send_live" : "send_dry_run"`, and the matching verify predicates are removed. Tick writers and `purpose: "cem"` stay | PKT-018’s plant | Modified |
| `scripts/verify-first-step-send-denied.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases for `enrollAndActuate`, and the source read for the three first-step objects and the non-edits | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| The planted first step is one `writeEngagement`. The kind is `live ? "send_live" : "send_dry_run"`, so a live-cohort deny is `send_live` and every other deny is `send_dry_run`, and both store `subject` and `bodyText`. The call, the enrollment `dryRun: !live`, the attempt insert, and the return already exist. The plant replaces that one write with three branches on `send.ok` and `send.dryRun` and leaves the call and the flags in place. | necessary |
| `SCP-pkt-018-send-denied-engagement.md` forbade `send_denied` from `enrollAndActuate` and its verify failed if that function contained `"send_denied"` or lost `live ? "send_live" : "send_dry_run"`. PKT-018 said claim 22 owns that row. This packet is that row. This specification removes those clauses and the matching verify predicates, including the factory-check predicate that would have failed on that kind. The tick writers, their payloads, and their `purpose: "cem"` calls stay. `PKT-018-send-denied-engagement.md` is not edited. On this commit `scripts/verify-send-denied-engagement.ts` does not exist and `scripts/factory-check.ts` does not contain that guard, so there is no planted guard to delete. If the script is present at plant time, the engineer removes only that guard. | necessary |
| The deny payload must omit `subject`, `bodyText`, `bodyHtml`, `messageId`, and `reason`. `JSON.stringify` drops `undefined` and stores `null`. The check fails when the key is present, including when the value is null. `cellId: state.cellId` is passed on every arm. With no template, the key is absent. The enrollment insert still stores `cellId: firstCell?.id ?? null` on its own payload. That null is not copied onto the engagement. | necessary |
| A silenced deny and a consent-missing deny return `{ ok: false, deny, detail }` with no `dryRun` key, before `shouldLiveSend`. A missing Resend key returns `{ ok: false, deny: "policy", detail: "RESEND_API_KEY missing", dryRun: false }` from `dispatchEmailLive` after the cohort gate has already allowed the contact. The kind expression does not read `deny`, `detail`, or `dryRun` on an `ok: false` result, so both are `send_denied`. The enrollment flag stays `!shouldLiveSend`, so case 3 and case 4 keep `dryRun` false while the engagement is `send_denied`. | necessary |
| The no-address return and the no-dispatcher return are `ok: true` and `dryRun: true` before the gate. They are `send_dry_run`. The no-dispatcher `DispatchResult.channel` stays `"email"`. The engagement `channel` is `owner`, so a `call` owner stores `channel` `call`. The check does not require `send.channel` to be `call` and does not edit the return. | necessary |
| `fireFirstStep === false` skips the guard. `let send` stays `undefined`. The enrollment and the attempt still insert. With `SEND_MODE` unset, the return’s `dryRun` is true. The firm-book halt returns `blocked: "halt"` and `enrollmentId` `""` before either insert. A firm-book row blocks later contacts of the same firm, so acceptance 9 runs after the other enrolls. | necessary |
| `hasInboundOverride` does not list `send_denied`. Adding it would nullify an open attempt this packet leaves `open`. The source guard keeps the existing `IN` list. The attempt insert sets `delivered: true` before the send. The Activity tags read that state. This packet does not retune them. | necessary |
| With no template and no campaign, `resolveBoundTemplate`, `firstCampaignId`, and `firstAuthoredChannel` return null. `templateId` is the agent ref. Subject and body are the agent-ref fallbacks. `contact_records` has no foreign key to a firm table. The fixture does not insert `ct_firms`, `sequence_template`, or `campaign`. `ownerChannel` is passed on every asserted channel so the platform ladder in `loadChannelOrder` is not the owner. | necessary |
| `scripts/verify-deny-gates.ts` asserts the firm-book return is `blocked: "halt"` and that `send.ok` is not true. `scripts/verify-author-runtime.ts` asserts the returned `cellId` and the attempt cursor. `scripts/verify-worker-actuation.ts` skips the live enroll when `VERIFY_LIVE_SEND` is `0`, which ship sets. Those scripts do not read `event_kind`. The early return and the return shape stay, so they keep passing. This packet does not edit them. The `finally` delete keeps this script’s open attempt out of `tickOnce`. | necessary |
| `eventKindProse` returns `Sent` for `send_denied` because the kind contains `send`. Claim 40 owns that column. `titleFor`, `kindOf`, `outcomeFrom`, `thoughtFrom`, and `signalsFrom` stay. `send_denied` is `other`, the outcome line stays empty, and `thoughtFrom` does not read `payload.send`. | adjacent |
| The consent select is `WHERE contact_id = $1 LIMIT 1` on a table keyed by `(contact_id, firm_id)`. Claim 23 owns that select. The verify inserts one row for this contact and this firm. This packet does not add `firm_id` to the select. | adjacent |
| Claim 45 owns the purpose string when `sequence_template.sequence_class` is `optin`. The call stays `input.purpose ?? "opt-in"`. `call_agent` still chooses `opt-in` or `cem` from `sequenceClassForAgent`. `runContactEligibilityCascade` still passes `purpose: "reactivation"`. This packet does not edit those callers. | adjacent |
| Claim 43 and claim 44 own whether `call_agent`, `handleEnrollmentCreate`, `handleOnboardingFire`, and `handleSequenceEnrollContacts` make this call. Each already calls `enrollAndActuate`. Omitting `fireFirstStep` means the first step runs. This packet does not add or remove a call. | adjacent |
| `isHaltBlockingNew` still matches a contact halt by `contact_id` with no `firm_id` predicate. PKT-015 owns that statement. The firm-book arm already matches `firm_id`. This packet does not edit the function. | adjacent |
| `dispatchSmsLive` can return `deny: "throughput"`. The kind expression does not read `deny`. That result is `send_denied` when this writer stores it. This check does not call the live SMS function. | adjacent |
| The three component contracts do not list claim 22. `halt-send` has no component contract. This packet does not edit the three files and does not open one. | adjacent |
| The packet file still says `**Release:** draft`. The ledger stage for this revision was `released` when this wake was authorized, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
