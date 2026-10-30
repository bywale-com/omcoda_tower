# SCP-pkt-018 — A denied tick send is its own engagement row

**Packet:** PKT-018 `pkt-018-send-denied-engagement`  
**Initiative:** `exec-identity`  
**Revision:** rev-1  
**Source:** PR #135 claim 21, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`.  
**Contract:** The packet names no component contract. `docs/factory/components/firing-pointers/CONTRACT.md` ends at claim 16. `docs/factory/components/walk-handle/CONTRACT.md` and `docs/factory/components/pursuit-identity/CONTRACT.md` do not list claim 21. This packet does not edit those files and does not open a contract.

## Intent

A tick send that returns `ok: false` appends one `engagement_records` row of kind `send_denied`. That row is how a later reader tells the refusal from a dry run and from a message that went out. `send_live` stays `send.ok && !send.dryRun`. `send_dry_run` stays `send.ok && send.dryRun`. The attempt writes PKT-017 left in place stay in place. This packet does not abort the attempt, does not roll the cell, `fired_criteria`, or the cleared wait back, and does not retune `hasInboundOverride`.

The three writers are the three that already call `actuateChannelSend` for an open attempt. Each still passes `firmId: attempt.firm_id`, `contactId: attempt.contact_id`, and `purpose: "cem"`. This packet edits the engagement written after that call returns. It does not edit the call.

- `escalateAttemptWindow`, when the send ran.
- `advanceTemplateCellIfDue`, when the next cell’s channel is `email` or `text`.
- The wait-until arm inside `tickOnce`, when the owner channel is `email` or `text`.

`writeEngagement` stays the insert. `firm_id` is `attempt.firm_id`. `contact_id` is `attempt.contact_id`. The id is the `eng-` id that function already returns. `event_kind` stays unconstrained text. No migration. No new table.

The writers branch on `send.ok`. They do not read `detail` or `deny`. A halt deny, a silenced deny, a consent-missing deny, and a throughput deny are the same kind. A deny that also carries `dryRun: false` or `dryRun: true` is still `send_denied`.

## Must / must-not

- Add the `send_denied` branch on the three writers. Do not add a fourth tick writer. Do not write `send_denied` on a tick path that does not call `actuateChannelSend`. The first step inside `enrollAndActuate` is claim 22. This file does not forbid `send_denied` there.
- Do not edit the three `actuateChannelSend` calls. `firmId` stays `attempt.firm_id`. `contactId` stays `attempt.contact_id`. `purpose` stays `"cem"`. Do not read `sequence_template.sequence_class` in those functions.
- Do not edit `writeEngagement`. The id stays `` `eng-${randomUUID()}` ``. The insert stays `engagement_records (id, firm_id, contact_id, event_kind, payload)`.
- Do not edit `consentAndHaltGate`, `isHaltBlockingNew`, `dispatchEmail`, `dispatchSms`, `dispatchEmailLive`, `dispatchSmsLive`, `actuateChannelSend`, `hasInboundOverride`, or `criteriaDue`. Do not edit `enrollAndActuate` in this packet’s plant. PKT-019 owns that function’s first-step engagement. This file does not forbid `send_denied` in that function and does not require `live ? "send_live" : "send_dry_run"`.
- Do not edit `titleFor`, `kindOf`, `outcomeFrom`, `thoughtFrom`, `signalsFrom`, or `eventKindProse`. Do not edit `ActivityInspectDrawer`. Do not add a `send_denied` case to any of them.
- Do not set `active_attempts.status` from the send result. Do not roll back `owner_channel`, `fired_criteria`, `state`, `window_started_at`, `delivered`, the `workflow_run`, `window_fired`, `cell_advanced`, or the cleared `attempt_wait_until`. The deny row is a later append. It is not an update of `window_fired` or `cell_advanced`.
- Do not put this row on `payload.writes`. Do not call `dispatchEventToWorkflows` for it. Do not add `send_denied` to the `event_kind IN (...)` list inside `hasInboundOverride`.
- Do not add a migration, a table, or a column. Do not edit a route. `npm run build` is not the proof.

`DispatchResult` already has the deny shape. The writers store that object. They do not narrow it.

```45:48:server/wire-service/dispatchSend.ts
export type DispatchResult =
  | { ok: true; dryRun: false; messageId: string; acceptedAt: string; channel: "email" | "sms" }
  | { ok: true; dryRun: true; reason: string; channel: "email" | "sms" }
  | { ok: false; deny: string; detail?: string; dryRun?: boolean };
```

When `actuateChannelSend` returns `ok: false`, the row is:

- `event_kind` is `send_denied`.
- The payload carries `attemptId` (`attempt.id`), `channel` (the channel passed into `actuateChannelSend`), and `send` (that `DispatchResult`, including `ok: false` and `deny`, `detail`, and `dryRun` as the value already has them).
- The escalation also keeps `runId`, `criteriaId`, and `criteriaLabel`. The cell advance also keeps `cellId`, `cellLabel`, and `runId`. The wait arm also keeps `attempt_n`.
- The stored payload does not contain `subject`, `bodyText`, `bodyHtml`, `messageId`, or `reason`. Those keys are absent. They are not stored as null. `JSON.stringify` drops a key whose value is `undefined` and keeps a key whose value is `null`. The check parses the stored jsonb and fails if any of those keys is present.

An allowed result uses `send.ok`, not `shouldLiveSend`.

- `send.ok && !send.dryRun` is `send_live`. The payload carries `messageId`, `subject`, and `bodyText`, plus the keys that writer already stores on an allowed row.
- `send.ok && send.dryRun` is `send_dry_run`. The payload carries `reason`, `subject`, and `bodyText`, plus those same keys.

The escalation’s allowed payloads stay the ones it already writes. They do not gain a `send` object. The cell’s allowed payload keeps the `send` object it already stores, and it keeps `cellId`, `cellLabel`, and `runId`. The wait arm’s allowed payload keeps `attemptId`, `channel`, `subject`, `bodyText`, and `attempt_n`, and it gains `messageId` on the live arm and `reason` on the dry-run arm. It does not gain a `send` object on those two arms.

The escalation today writes neither row when `ok` is false:

```513:535:server/wire-service/cascade.ts
    if (send.ok && !send.dryRun) {
      await writeEngagement(pool, attempt.firm_id, attempt.contact_id, "send_live", {
        attemptId: attempt.id,
        channel: toChannel,
        messageId: send.messageId,
        runId,
        criteriaId: criteria.id,
        criteriaLabel: criteria.label,
        subject,
        bodyText,
      });
    } else if (send.ok && send.dryRun) {
      await writeEngagement(pool, attempt.firm_id, attempt.contact_id, "send_dry_run", {
        attemptId: attempt.id,
        channel: toChannel,
        reason: send.reason,
        runId,
        criteriaId: criteria.id,
        criteriaLabel: criteria.label,
        subject,
        bodyText,
      });
    }
```

Add the `!send.ok` branch beside those two. The deny object is `attemptId`, `channel: toChannel`, `runId`, `criteriaId`, `criteriaLabel`, and `send`. Do not add `subject` or `bodyText` to it. Do not add `send` to the two allowed objects. Do not read `send.detail` or `send.deny` in this function.

The cell today folds every non-live result, including `ok: false`, into `send_dry_run`, and it always stores `subject`, `bodyText`, and `send`:

```933:951:server/wire-service/cascade.ts
    const live = shouldLiveSend(attempt.contact_id);
    await writeEngagement(
      pool,
      attempt.firm_id,
      attempt.contact_id,
      live && send.ok && !send.dryRun ? "send_live" : "send_dry_run",
      {
        attemptId: attempt.id,
        cellId: next.id,
        cellLabel: next.label,
        channel: toChannel,
        subject,
        bodyText,
        messageId: send.ok && !send.dryRun ? send.messageId : undefined,
        reason: send.ok && send.dryRun ? send.reason : undefined,
        send,
        runId,
      },
    );
```

Remove the local `live` binding. `advanceTemplateCellIfDue` must not call `shouldLiveSend`. The kind is `send_denied` when `!send.ok`, `send_live` when `send.ok && !send.dryRun`, and `send_dry_run` when `send.ok && send.dryRun`. The deny payload keeps `attemptId`, `cellId`, `cellLabel`, `channel: toChannel`, `runId`, and `send`, and omits `subject`, `bodyText`, `bodyHtml`, `messageId`, and `reason`. The two allowed payloads keep `subject`, `bodyText`, `send`, `cellId`, `cellLabel`, and `runId`. The live payload keeps `messageId`. The dry-run payload keeps `reason`. One write per result. A deny is not also a `send_dry_run`.

The wait arm discards the result and always writes `send_dry_run`:

```1080:1098:server/wire-service/cascade.ts
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
        await writeEngagement(pool, attempt.firm_id, attempt.contact_id, "send_dry_run", {
          attemptId: attempt.id,
          channel: owner,
          subject,
          bodyText,
          attempt_n: cleared.attempt_n,
        });
```

Bind that return. Do not extract the arm. The same three branches follow the call, still inside `owner === "email" || owner === "text"`. `channel` on each payload is `owner`. The deny payload is `attemptId`, `channel`, `attempt_n: cleared.attempt_n`, and `send`, without `subject`, `bodyText`, `bodyHtml`, `messageId`, or `reason`. The live payload adds `messageId: send.messageId` and keeps `subject` and `bodyText`. The dry-run payload adds `reason: send.reason` and keeps `subject` and `bodyText`. Neither allowed payload carries `send`. The arm does not write `send_dry_run` for a deny or for a live success. It does not read `send.detail` or `send.deny`.

`enrollAndActuate`’s first-step engagement is claim 22. PKT-019 owns that write. This file does not require `live ? "send_live" : "send_dry_run"` and does not forbid `"send_denied"` in that function. It does not freeze `subject` or `bodyText` on that row. The three tick writers stay the writes this packet specifies.

A missing address with no live test fallback, and the no-dispatcher return inside `actuateChannelSend`, stay `ok: true` and `dryRun: true`. They stay `send_dry_run`. They are not this row. These three writers do not call `actuateChannelSend` for a channel other than email or text, so the no-dispatcher return is not a row they add.

```617:623:server/wire-service/cascade.ts
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

The escalation’s waiting branch does not call `actuateChannelSend` and writes no send engagement. A cell whose channel is neither `email` nor `text` does not call it and writes no `send_denied`. A wait arm whose owner is neither `email` nor `text` does not call it and writes no `send_denied`.

`window_fired` and `cell_advanced` stay the rows written before the send. One deny is one new row.

The forbid in `SCP-pkt-017-tick-send-halt.md` is removed by this specification. The open-attempt rules, the pre-send writes, and the three `purpose: "cem"` calls in that file stay. Do not edit `PKT-017-tick-send-halt.md`.

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

`active_attempts` is the attempt the tick already updates before the send. This packet does not change that table. `halt_records` and `consent_records` are the stores the gate already reads. This packet does not change them. `consent_records` is keyed by `(contact_id, firm_id)`. `basis` is `express`, `implied`, or `none`. `silenced` is boolean. The contact halt arm on this commit matches `contact_id` only. PKT-016’s specification adds `firm_id = $2`. A halt inserted with `firm_id` equal to `attempt.firm_id` denies under both statements. The verify uses that insert. It does not assert the other-firm allow.

`sequence_template.sequence_class` is checked, after `supabase/migrations/010_sequence_campaign_housing.sql` drops the earlier check and adds this one, as `optin`, `reengagement`, or `reactivation`. The cell fixture inserts `optin`. `loadTemplateCells` selects `id, label, cells` and does not read `sequence_class`. The three calls do not read it.

```183:184:supabase/migrations/010_sequence_campaign_housing.sql
      ADD CONSTRAINT sequence_template_sequence_class_check
      CHECK (sequence_class IN ('optin', 'reengagement', 'reactivation'));
```

The packet names no component contract. The firing-pointers contract ends at claim 16 and does not list claim 21. The walk-handle contract loads pointers. The pursuit-identity contract decides which enrollment a completion advances. None of those sentences is this engagement row. `payload.writes` is the listening handle in `server/wire-service/runWrites.ts`. The tick send does not dispatch, so this row is not an element of that array and it is not a listening pointer. This packet does not edit the three contract files and does not edit `runWrites.ts`.

`TickFire.send` stays optional. No new port type.

## Runtime

The gate the three sends already reach is unchanged. A silenced row returns before the contact halt. A halt deny and a silenced deny are both `ok: false`. The writer does not branch on `detail`.

```75:88:server/wire-service/dispatchSend.ts
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
```

`dispatchEmail` and `dispatchSms` return that deny before `shouldLiveSend`. They do not write `outbound_messages` on that return. `dispatchSmsLive` returns `{ ok: false, deny: "throughput", detail }` from its catch. That function is not called by this check. The kind expression does not read `deny`, so a throughput deny is the same row when a later caller stores the result.

```277:279:server/wire-service/dispatchSend.ts
  } catch (err) {
    const detail = err instanceof Error ? err.message : "sms failed";
    return { ok: false, deny: "throughput", detail };
```

`shouldLiveSend` is live only when `SEND_MODE` is `live` and the contact is in a non-empty `SEND_TEST_COHORT`. The cell kind no longer calls it. `actuateChannelSend` still calls it for the test-address fallback. `enrollAndActuate` still calls it for `enrollment.payload.dryRun` and the return’s `dryRun`. PKT-019 owns the first-step engagement kind. The file-level import stays.

```33:39:server/wire-service/sendMode.ts
export function shouldLiveSend(contactId: string | undefined | null): boolean {
  if (!contactId) return false;
  if (getSendMode() !== "live") return false;
  const cohort = getSendTestCohort();
  if (cohort.size === 0) return false;
  return cohort.has(contactId);
}
```

The escalation send stays inside `toChannel && !waiting && (toChannel === "email" || toChannel === "text")`, after the attempt update, the tick `workflow_run`, and `window_fired`. On a non-waiting fire, `fired_criteria` gains the criteria id and `status` stays `open`. The waiting flag is `queuedNextAttempt` plus a future `attempt_wait_until`. That branch does not send. `recordCampaignFailure` still runs only when `toChannel` is null. The send branch and the waiting branch both have a channel by then.

The cell send stays inside `toChannel === "email" || toChannel === "text"`, after the cursor update, the tick `workflow_run`, and `cell_advanced`. The cursor update keeps `fired_criteria='{}'::jsonb` and sets `delivered: true`. A channel other than email or text leaves `send` undefined and writes no send engagement. The cursor update still stands.

The wait arm’s clear of `attempt_wait_until` stays before the send. Nothing after the call writes that key back or sets `status` from the result. The criteria loop still breaks only when the reloaded row is not `open`. A deny leaves `status` at `open`, so the loop continues.

`hasInboundOverride` still does not list `send_denied`. A deny row does not nullify the attempt.

```245:249:server/wire-service/cascade.ts
    `SELECT 1 FROM engagement_records
     WHERE firm_id=$1 AND contact_id=$2
       AND event_kind IN ('inbound_reply','form_visit','inbound_override')
       AND created_at >= $3::timestamptz
     LIMIT 1`,
```

The readers stay. `kindOf` has no `send_denied` case, so that kind is `other`. `outcomeFrom` leaves the outcome line empty because the kind is not `send`. `titleFor` has no `send_denied` case, so the complaint-desk title is the kind with underscores turned into spaces. `thoughtFrom` still reads `payload.reason` and does not read `payload.send`. The deny payload has no top-level `reason`, so that reader does not surface `send.detail`. `eventKindProse` still returns `Sent` when the lowercased kind contains `send`. Claim 40 owns that column. `signalsFrom` and `ActivityInspectDrawer` still light Sent and Delivered from `row.kind === "send"` or from attempt state. `kindOf` does not return `send` for `send_denied`, so those tags stay a reading of attempt state. The cell update sets `delivered` before the deny row. This packet does not retune the tags.

```83:84:src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts
function kindOf(eventKind: string): ActivityRowKind {
  if (eventKind === "send_live" || eventKind === "send_dry_run") return "send";
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

```144:153:src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts
function thoughtFrom(
  payload: Record<string, unknown>,
  attempt: ActiveAttemptRow | undefined,
): string | null {
  const direct =
    str(payload.thought) ??
    str(payload.reason) ??
    str(payload.setValue) ??
    str(payload.cellLabel);
```

```176:184:src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts
function signalsFrom(
  kind: ActivityRowKind,
  state: Record<string, unknown> | null | undefined,
): ActivitySignal[] {
  const s = state ?? {};
  const sent = kind === "send" || Boolean(s.delivered || s.delivered_at || s.opened || s.opened_at);
  return [
    { key: "sent", label: "Sent", on: sent },
    { key: "delivered", label: "Delivered", on: Boolean(s.delivered || s.delivered_at) },
```

```16:20:src/app/register/prototype-ant/consultant/clientData/ActivityInspectDrawer.tsx
function milestoneTags(row: ActivityRow) {
  const state = row.attemptState ?? {};
  const flags: Array<{ key: string; label: string; on: boolean }> = [
    { key: "sent", label: "Sent", on: row.kind === "send" || Boolean(state.delivered || state.delivered_at) },
    { key: "delivered", label: "Delivered", on: Boolean(state.delivered || state.delivered_at) },
```

```138:143:src/app/register/prototype-ant/operator/channelRuleGrain.ts
export function eventKindProse(eventKind: string): string {
  const kind = eventKind.toLowerCase();
  if (kind.includes("open")) return "Opened";
  if (kind.includes("click")) return "Clicked";
  if (kind.includes("deliver")) return "Delivered";
  if (kind.includes("send") || kind === "sent") return "Sent";
```

`AntAgentWorkbench` renders `eventKindProse(row.event_kind)`. This packet does not edit that caller. A `send_denied` row reads as Sent there until claim 40.

## Ports

No new port. No route change. No stand-in change.

These stay on the same functions:

- `escalateAttemptWindow(pool, attempt, criteria, channelOrder, now?, withinSeconds?)`. Same export. `TickFire.send` stays optional. The waiting fire and a non-email, non-text fire leave `send` undefined. A deny sets `send` to the `DispatchResult` and appends `send_denied`.
- `advanceTemplateCellIfDue(pool, attempt, now?)`. Same export. A next channel other than `email` or `text` leaves `send` undefined and writes no `send_denied`. An email or text deny appends `send_denied`.
- `tickOnce(now?)`. Same export. The open-attempt statement stays `WHERE status = 'open'`. The wait arm binds its `DispatchResult` and does not become a new function. The check does not call `tickOnce`.
- `actuateChannelSend(input: ChannelSendInput)`. Same input. Unchanged.
- `writeEngagement(pool, firmId, contactId, eventKind, payload)`. Same signature.
- `enrollAndActuate`. This packet does not change its input and does not edit the function. It does not set the first-step kind. PKT-019 owns that engagement.
- `consentAndHaltGate`, `dispatchEmail`, `dispatchSms`, `isHaltBlockingNew`. Unchanged.
- `machine.ts` and `worker.ts` still call `tickOnce()`. This packet does not edit those callers.

## Verify

`scripts/verify-send-denied-engagement.ts` on a migrated Postgres, invoked from `.github/workflows/ship.yml` in job `verify-ship`, after migrate and seed, as its own step `npx tsx --env-file=.env scripts/verify-send-denied-engagement.ts`. On this commit `verify-tick-send-halt` is not a step. Place this step after `verify-click-attribution`. If that halt step is already present, place this step after it. Do not fold it into `npm run verify:ship`. Do not remove a step. `npm run build` is not that proof.

The script uses `getPool()` the way `scripts/verify-click-attribution.ts` does. It imports `escalateAttemptWindow` and `advanceTemplateCellIfDue` from `server/wire-service/cascade.ts`. It exits 2 when `DATABASE_URL` is missing. It deletes `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `TWILIO_PHONE_NUMBER`, `SEND_MODE`, `SEND_TEST_COHORT`, `TEST_EMAIL_TO`, and `TEST_SMS_TO` for the process, and it restores that deletion after the one call that sets `SEND_MODE` and `SEND_TEST_COHORT`. It does not call `tickOnce`, `enrollAndActuate`, `isHaltBlockingNew`, `consentAndHaltGate`, `dispatchEmail`, `dispatchSms`, `dispatchEmailLive`, `dispatchSmsLive`, `getResend`, or `getTwilio`. It does not boot Vite. It does not build a workflow graph. It does not read `supabase/migrations`. It reads the source files named below for acceptances 5, 6, and 7.

The firm id is `firm-pkt018-` plus a run token. The contact id is `cr-pkt018-` plus that token. The firm is not the seeded Harbor firm. Halt inserts use `consultant_id` `pkt018` and an id unique to the run. Neither firm id nor contact id is deleted from the seed. The script deletes the rows it inserts, in a `finally`, in foreign-key order: `engagement_records`, `workflow_run`, `workflow_state`, `workflow` (`wf-tick-` plus this firm id), `active_attempts`, `enrollment`, `campaign`, `sequence_template`, `halt_records`, `consent_records`, `contact_records`, `messaging_events`, and `outbound_messages`, by this firm id and this contact id. An open attempt left behind would be scanned by `verify:worker`, which calls `tickOnce`.

A halt deny is `{ ok: false, deny: "policy", detail: "halt active" }`. A silenced deny is `{ ok: false, deny: "policy", detail: "silenced" }`. The no-address dry-run is `ok: true`, `dryRun: true`, and `reason` `no email on contact — dry-run intent only`. After every call, `outbound_messages` for this firm is empty. The stored payload is parsed from jsonb. A forbidden key fails when `key in payload`. A key stored as null fails that test.

Escalation criteria passed in memory: `enabled` true, `when_clause` null, `condition_clause` null, `channel_token` null, `threshold` null. `withinSeconds` is `0`. `window_started_at` is at or before `now`. The non-waiting fires use `set_value` `return_to_sequence_head` and `channelOrder` `["email"]`, so `toChannel` is `email` and the campaign queue does not run. `enrollment_id` is null on those fires. `fired_criteria` starts as `{}`. `state` is an object. `state.inbound_override` is absent. The contact row starts with an email and a null phone.

The cell templates are inserted before the first `advanceTemplateCellIfDue` call and are not updated after. `loadTemplateCellsCached` caches by template id for the process. Each template has two cells. `sequence_class` is `optin`. The first cell has `offsetMinutes` `0`. The second cell has `offsetMinutes` `0` and `channel` `email` or `form`. `state.cellIndex` is `0`. `state.templateId` is that template id. `state.enrolledAt` is before `now`. The calls do not read `sequence_class`.

The waiting fire uses its own attempt. `set_value` is `hold`. `state` is `{ attempt_n: 1 }`. The attempt’s `enrollment_id` points at an enrollment whose `campaign_id` points at a campaign with `attempt_count` `3` and `wait_after_last_failed_seconds` `3600`. That campaign’s `sequence_id` is a template this script inserts, with `sequence_class` `optin`. `channelOrder` is `["email"]`. Consent for that fire is `basis` `express` and `silenced` false, and no halt is present, so a send that ignored `waiting` would write `send_dry_run`.

1. With consent `basis` `express` and `silenced` false, and an active `scope = 'contact'` halt for this contact and `firm_id` equal to `attempt.firm_id`, `escalateAttemptWindow` appends one `send_denied` row. The stored payload has `attemptId`, `channel` `email`, `runId`, `criteriaId`, `criteriaLabel`, and `send`. `send.ok` is false, `send.deny` is `policy`, and `send.detail` is `halt active`. The payload has no `subject`, `bodyText`, `bodyHtml`, `messageId`, or `reason`. The same call writes no `send_live` and no `send_dry_run`. One `window_fired` row exists for this attempt. `active_attempts.status` is `open`. `fired_criteria` contains that criteria id. The deny id starts with `eng-`. `firm_id` is `attempt.firm_id` and `contact_id` is `attempt.contact_id`. `outbound_messages` for this firm is empty.
2. Clear contact halts and firm-book halts. Set the same consent row to `silenced` true. A new non-waiting email escalation appends one `send_denied` row and no `send_live` or `send_dry_run`. `send.detail` is `silenced`. The payload keys match case 1, with that detail. The writer does not branch on `detail`. On a different attempt, the waiting fixture writes one `window_fired` and no `send_denied`, no `send_live`, and no `send_dry_run`. `status` is `open`. `fired_criteria` is `{}`. `state.attempt_wait_until` is a string whose time is after the `now` passed into the call.
3. Set consent back to `silenced` false and `basis` `express`. Clear halts. Set the contact email to null and leave the phone null. A new email escalation writes one `send_dry_run` and no `send_denied`. The payload has `reason` `no email on contact — dry-run intent only`, `subject`, and `bodyText`, and it has no `send` object. `status` is `open`. `fired_criteria` contains that criteria id. One `window_fired` row exists.
4. Restore the email. Re-insert the contact halt with `firm_id` equal to `attempt.firm_id`. Consent stays non-denying. `advanceTemplateCellIfDue` on the email-next template appends one `send_denied` and no `send_live` or `send_dry_run`. The payload has `attemptId`, `cellId`, `cellLabel`, `channel` `email`, `runId`, and `send`, and it has no `subject`, `bodyText`, `bodyHtml`, `messageId`, or `reason`. `send.ok` is false, `send.deny` is `policy`, and `send.detail` is `halt active`. `cell_advanced` still exists as its own row. `status` is `open`. `state.cellIndex` is `1`. `state.delivered` is true. `fired_criteria` is `{}`. Repeat that call on a new attempt with `SEND_MODE` `live` and `SEND_TEST_COHORT` containing that contact id, then delete those two env values again. The row is again one `send_denied` and no `send_live` or `send_dry_run`. `outbound_messages` stays empty. A new attempt on the form-next template writes no `send_denied`, no `send_live`, and no `send_dry_run`. `cell_advanced` exists. `send` on the returned fire is undefined. Set the email to null and keep the phone null. A new attempt on the email-next template writes `send_dry_run` with `subject`, `bodyText`, `reason`, and `send`, and no `send_denied`. `send.ok` is true and `send.dryRun` is true.
5. The script reads `advanceTemplateCellIfDue` and fails if that function contains `shouldLiveSend` or `const live`. It fails unless the function contains `"send_denied"`, `send.ok && !send.dryRun`, and `send.ok && send.dryRun`. It does not read `enrollAndActuate` for a kind. It does not fail when that function contains `"send_denied"`, and it does not require `live ? "send_live" : "send_dry_run"`. PKT-019’s check is the one that requires the first-step kind. It reads the three `actuateChannelSend` calls in `escalateAttemptWindow`, `advanceTemplateCellIfDue`, and the wait arm, and fails unless each still contains `firmId: attempt.firm_id`, `contactId: attempt.contact_id`, and `purpose: "cem"`.
6. The script does not call `tickOnce` and does not extract the arm. It reads `tickOnce` from the wait arm’s `if (owner === "email" || owner === "text")` through the send that passes `channel: owner` until `for (const row of criteria)`. It fails unless that slice assigns the call (`send = await actuateChannelSend`). It fails unless the slice contains `"send_denied"`, `"send_live"`, `"send_dry_run"`, `send.ok && !send.dryRun`, `send.ok && send.dryRun`, `messageId: send.messageId`, `reason: send.reason`, and `attempt_n`. It fails if the slice contains `send.detail`, `send.deny`, or `shouldLiveSend`. The text after `"send_denied"` and before the next `writeEngagement` contains `send` and `attempt_n` and does not contain `subject`, `bodyText`, `bodyHtml`, `messageId`, or `reason`. The text after `"send_live"` and before `"send_dry_run"` contains `messageId`, `subject`, and `bodyText`, and does not contain `reason:` or a bare `send` property (`send,` or a line that is only `send`). The text after `"send_dry_run"` until the end of the slice contains `reason`, `subject`, and `bodyText`, and does not contain `messageId` or a bare `send` property. `send.messageId` and `send.reason` are not bare properties.
7. The script reads `engagementProjection.ts` and fails if `titleFor` contains `case "send_denied"`. The default stays `eventKind.replace(/_/g, " ")`. `kindOf`’s send test stays `eventKind === "send_live" || eventKind === "send_dry_run"` and does not contain `send_denied`. `outcomeFrom` still opens with `kind === "send"`. `thoughtFrom` still reads `payload.reason` and does not contain `send_denied`. `signalsFrom` still sets Sent from `kind === "send"` or attempt state. It reads `eventKindProse` and fails unless `kind.includes("send")` still returns `Sent`, and fails if that function contains `send_denied`. It reads `hasInboundOverride` and fails if the `event_kind IN` list contains `send_denied`. It reads `consentAndHaltGate` and fails if that function contains `send_denied`. It does not require or forbid `firm_id` on that function’s contact arm. `window_fired` and `cell_advanced` are counted as their own rows in cases 1 and 4. The check fails if a deny replaces either row.

`npm run factory:check` reads the same source and fails on the same predicates as acceptances 5, 6, and 7. It does not fail when `enrollAndActuate` contains `"send_denied"`, and it does not require `live ? "send_live" : "send_dry_run"`. It fails unless `.github/workflows/ship.yml` invokes `scripts/verify-send-denied-engagement.ts`. It fails if this packet adds a file under `supabase/migrations`. It does not fail PKT-017’s permissive kind check: that check does not assert `send_live` or `send_dry_run` and does not fail when those branches gain `send_denied`. This packet’s check is the one that requires the kind. Add `server/wire-service/cascade.ts`, `server/wire-service/dispatchSend.ts`, `src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts`, `src/app/register/prototype-ant/operator/channelRuleGrain.ts`, `scripts/verify-send-denied-engagement.ts`, and `.github/workflows/ship.yml` to the path filter in `.github/workflows/factory-check.yml` if they are not already listed.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Out of scope

The open attempt and the pre-send writes (PKT-017). The enroll predicate (PKT-015). The firm predicate (PKT-016). The consent select (claim 23). The first step’s engagement (claim 22). The operator column (claim 40). A new `titleFor` case. Retuning `kindOf`, `outcomeFrom`, `thoughtFrom`, `signalsFrom`, or the Activity tags. The opt-in purpose (claim 45). Aborting an in-flight attempt. Rolling the cell, `fired_criteria`, `delivered`, or the cleared wait back. Reading `detail` or `deny` to split the kind. Adding this row to `payload.writes`. `dispatchScheduleTriggers` and `resumeDueWaitingRuns`. Launch Agent. No plate.

## Impact manifest

| Contract | Change | Consumers to re-check | Modified or only verified |
| --- | --- | --- | --- |
| `escalateAttemptWindow` post-send engagement | `!send.ok` appends one `send_denied` with `attemptId`, `channel`, `runId`, `criteriaId`, `criteriaLabel`, and `send`, and without subject or body. Allowed rows stay `send_live` / `send_dry_run` and do not gain `send` | `tickOnce` criteria loop | Modified |
| `advanceTemplateCellIfDue` post-send engagement | Kind is `send.ok` and `send.dryRun`. The local `live` binding and the `shouldLiveSend` call in this function are removed. Deny omits subject and body. Allowed rows keep `send`, `cellId`, `cellLabel`, and `runId` | `tickOnce` | Modified |
| Wait arm inside `tickOnce` | The `DispatchResult` is bound. Three branches. Deny keeps `attempt_n` and `send` and omits subject and body. Allowed rows gain `messageId` or `reason` and do not gain `send` | The same tick iteration’s criteria loop | Modified |
| `writeEngagement` | Same insert. `send_denied` is a value of unconstrained `event_kind` | The three writers and `enrollAndActuate` | Only verified |
| `enrollAndActuate` first step | Not frozen. PKT-019 owns `send_denied` on that write. This packet does not edit the function | Direct enroll, `call_agent` | Only verified |
| Three `actuateChannelSend` calls | Same arguments. `firmId` is `attempt.firm_id`. `purpose` is `"cem"` | The gate they already reach | Only verified |
| `actuateChannelSend` no-address and no-dispatcher returns | Stay `ok: true`, `dryRun: true`. Those results stay `send_dry_run` | The three writers | Only verified |
| `consentAndHaltGate`, `dispatchEmail`, `dispatchSms` | Unchanged. Halt and silenced both return `ok: false` before `shouldLiveSend`. No `outbound_messages` row on that return | The three writers | Only verified |
| `hasInboundOverride` | The inbound list does not gain `send_denied`. A deny does not nullify | The two nullify branches | Only verified |
| `window_fired`, `cell_advanced`, attempt columns | Written before the send and not updated by the deny. `status` stays `open` | PKT-017’s check | Only verified |
| `titleFor`, `kindOf`, `outcomeFrom`, `thoughtFrom`, `signalsFrom` | Unchanged. `send_denied` titles as words, kinds as `other`, and leaves the outcome line empty | Complaint desk | Only verified |
| `eventKindProse` | Unchanged. A kind that contains `send` still reads `Sent` | `AntAgentWorkbench` | Only verified |
| Activity Sent and Delivered tags | Unchanged. They read `kind === "send"` or attempt state | `ActivityInspectDrawer`, `signalsFrom` | Only verified |
| `payload.writes` | This row is not added. The tick send does not dispatch | Firing pointers, walk handle | Only verified |
| `engagement_records` | No new column. No migration | Existing readers | Only verified |
| Component contracts | None named. Claim 21 is not in the three contracts | Firing pointers, walk handle, pursuit identity | Only verified |
| `SCP-pkt-017-tick-send-halt.md` | The forbid on `send_denied` and the freeze of the three post-send writers are removed. Open-attempt rules, pre-send writes, and the three `purpose: "cem"` calls stay | PKT-017’s plant | Modified |
| `scripts/verify-send-denied-engagement.ts`, `ship.yml`, `factory-check.ts`, `factory-check.yml` | Postgres cases for the two exported fires, and the source read for the wait arm and the non-edits | Ship CI, factory check | Modified |

## Dependency reconciliation

| Finding | Class |
| --- | --- |
| The three post-send writers are the change. Escalation has no row for `ok: false`. The cell uses `shouldLiveSend` and stores subject and body on a deny. The wait arm discards the result and always writes `send_dry_run`. Each already calls `actuateChannelSend` with `attempt.firm_id` and `purpose: "cem"` after the pre-send writes. The plant edits the engagement after the return and leaves the calls, the attempt updates, and `writeEngagement` in place. | necessary |
| `SCP-pkt-017-tick-send-halt.md` forbade `send_denied`, froze the three post-send writers, and required the wait-arm return to stay discarded. PKT-017 said claim 21 removes only that clause. This specification removes that forbid and the freeze, including the discarded-return sentence and the factory-check predicate that the wait-arm call is not assigned. The open-attempt rules, the pre-send writes, and the three `purpose: "cem"` calls in that file stay. `PKT-017-tick-send-halt.md` is not edited. PKT-017’s own check stays permissive about a later kind. This packet’s check is the one that requires `send_denied`. | necessary |
| The deny payload must omit `subject`, `bodyText`, `bodyHtml`, `messageId`, and `reason`. `JSON.stringify` drops `undefined` and stores `null`. The check fails when the key is present, including when the value is null. The stored `send` object is the `DispatchResult` as returned. A halt deny from `dispatchEmail` has `ok`, `deny`, and `detail`, and no `dryRun` key. The check does not require `dryRun` to be present on that object. | necessary |
| The cell kind must ignore `shouldLiveSend`. With a halt in place, `dispatchEmail` returns `ok: false` before `shouldLiveSend`, so both a dry-run cohort and a live cohort produce a deny. The old conjunction writes `send_dry_run` for both. The runtime repeats the cell deny with `SEND_MODE=live` and the contact in `SEND_TEST_COHORT`, and the source guard forbids `shouldLiveSend` inside `advanceTemplateCellIfDue`. Resend and Twilio stay uncalled because the gate returns first and their secrets are deleted. | necessary |
| The wait arm is inside `tickOnce`, and `tickOnce` selects every open attempt. The packet forbids the check from calling it and from extracting the arm. Acceptance 6 is the source read of the three branches and their payload keys. | necessary |
| PKT-016’s contact arm adds `firm_id = $2`. The planted arm on this commit is still `contact_id` only. A halt whose `firm_id` equals `attempt.firm_id` denies under both. This packet does not edit the gate and does not assert the other-firm allow. | necessary |
| A path that does not call `actuateChannelSend` writes no `send_denied`. The waiting fixture uses a non-denying consent and no halt, so a bug that ignored `waiting` would write `send_dry_run` and fail. The form-next cell leaves `send` undefined. The missing-address returns stay `send_dry_run` because they are `ok: true`. | necessary |
| `hasInboundOverride` does not list `send_denied`. Adding it would nullify an open attempt this packet leaves `open`. The source guard keeps the existing `IN` list. | necessary |
| The first-step kind inside `enrollAndActuate` is not this packet. PKT-019 specifies `send_denied` there. This file does not forbid that kind and does not require `live ? "send_live" : "send_dry_run"`. The tick source guards do not read that function for a kind. `PKT-018-send-denied-engagement.md` is not edited. | necessary |
| `eventKindProse` returns `Sent` for `send_denied` because the kind contains `send`. Claim 40 owns that column. `titleFor`, `kindOf`, `outcomeFrom`, `thoughtFrom`, and `signalsFrom` stay. `send_denied` is `other`, the outcome line stays empty, and `thoughtFrom` does not read `payload.send`, so `send.detail` does not become the thought line. The Activity tags stay a reading of attempt state. The cell sets `delivered` before the deny row. This packet does not retune those readers. | adjacent |
| The consent select is `WHERE contact_id = $1 LIMIT 1` on a table keyed by `(contact_id, firm_id)`. Claim 23 owns that select. The verify inserts one row for this contact and this firm. This packet does not add `firm_id` to the select. | adjacent |
| Claim 45 owns the purpose string when `sequence_template.sequence_class` is `optin`. The fixture sets `sequence_class` to `optin` because migration 010’s check allows `optin`, `reengagement`, and `reactivation`. The three calls stay the literal `cem` and do not read the column. `SCP-pkt-017-tick-send-halt.md` tells its own fixture to insert `optin_launch`. That value fails the planted check. This packet does not edit that fixture. | adjacent |
| `isHaltBlockingNew` still matches a contact halt by `contact_id` with no `firm_id` predicate. PKT-015 owns that statement. The tick does not call it. | adjacent |
| `dispatchEmailLive` can return `ok: false` with `dryRun: false` before the gate when Resend is absent. `dispatchSmsLive` can return `deny: "throughput"`. The kind expression does not read `deny`, `detail`, or `dryRun` on an `ok: false` result, so those results are `send_denied` when a writer stores them. This check does not call the live functions. | adjacent |
| `loadTemplateCellsCached` caches by template id for the life of the process and does not export a clear. The verify inserts each template before the first load and does not update `cells` after that. This packet does not add cache invalidation. | adjacent |
| `scripts/verify-worker-actuation.ts` calls `tickOnce` and therefore scans every open attempt. This packet’s check does not call `tickOnce` and does not edit that script. The `finally` delete keeps this script’s open attempt out of that scan. | adjacent |
| The three component contracts do not list claim 21. This packet does not edit them and does not open one. | adjacent |
| The packet file still says `**Release:** draft`. The ledger stage for this revision was `released` when this wake was authorized, and this wake is the dispatch record. The behavior text is the same either way. | adjacent |
