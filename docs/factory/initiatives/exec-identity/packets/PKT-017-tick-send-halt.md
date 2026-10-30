# PKT-017 — A tick send on an open attempt is a new send the halt stops; the attempt is not aborted

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 20, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes  
**UI:** none

## Intended behavior

A message `tickOnce` is about to hand off for an `active_attempts` row that is already `open` is one of H1’s new sends. `consentAndHaltGate` denies it. The attempt is not aborted. `tickOnce` keeps selecting `status = 'open'` and keeps running the attempt engine for that row. Halt does not set `active_attempts.status`, does not take the inbound nullify path, and does not undo the attempt writes already made before the send.

The three sends stay the three calls that already exist. Each passes `firmId: attempt.firm_id`, `contactId: attempt.contact_id`, and `purpose: "cem"`:

- `escalateAttemptWindow`, after the attempt update, the tick `workflow_run`, and the `window_fired` engagement, when `toChannel` is `email` or `text` and the queued next attempt is not still waiting.
- `advanceTemplateCellIfDue`, after the cell cursor update, the tick `workflow_run`, and the `cell_advanced` engagement, when the next cell’s channel is `email` or `text`.
- The wait-until arm inside `tickOnce`, after `attempt_wait_until` has been removed from `state` and `window_started_at` has been moved, when the owner channel is `email` or `text`.

`actuateChannelSend` still calls `dispatchEmail` or `dispatchSms` when the contact has an address, or when a live send falls back to `TEST_EMAIL_TO` or `TEST_SMS_TO`. Those two functions still return the gate’s deny before `shouldLiveSend`. A halt deny is `{ ok: false, deny: "policy", detail: "halt active" }`. `dispatchEmailLive` and `dispatchSmsLive` still call the same gate and still return before Resend or Twilio. The message is not handed to the provider. The firm on these three calls is `attempt.firm_id`. The firm-book arm still denies an active firm-book row for that firm. The halt arm does not read `purpose`, so `cem` is not an exemption. This packet does not edit `consentAndHaltGate`. PKT-016 owns the contact arm’s `firm_id` predicate.

A channel that is neither `email` nor `text` does not call `actuateChannelSend`. A missing address with no live test fallback still returns the dry-run from `actuateChannelSend` and does not call the gate. This packet does not widen the gate to those returns. The attempt stays `open` on that dry-run as well.

The writes before the send stay taken. A deny does not restore them.

- The cell advance keeps the next cell, `delivered: true`, `delivered_at`, `fired_criteria` replaced with `{}`, the `workflow_run`, and the `cell_advanced` engagement.
- The escalation keeps `owner_channel`, `fired_criteria`, `state`, the `workflow_run`, and the `window_fired` engagement. When this fire stored `fired_criteria[criteria.id]`, the next call returns before firing that criteria again. On the waiting branch, `fired_criteria` for this fire stays `{}`, `attempt_wait_until` stays set, and this function does not send. The send is the later wait arm.
- The wait arm keeps `attempt_wait_until` cleared and `window_started_at` moved. It does not put the key back when the send returns.

`criteriaDue` still treats `state.delivered` as the delivered condition and `delivered_at` as a clock anchor. This packet does not retune that.

The only `status = 'nullified'` writes on this path stay inside `hasInboundOverride`. Halt does not call that function. `tickOnce` does not read `halt_records` and does not call `isHaltBlockingNew`. A deny does not `break` or `continue` out of the criteria loop. The attempt’s other endings stay the engine’s.

`enrollAndActuate`’s first `actuateChannelSend` is not one of the three sends. It still runs only after `isHaltBlockingNew` has passed. `dispatchScheduleTriggers` and `resumeDueWaitingRuns` stay after the attempt loop and are not these three sends.

The engagement kind stored when a deny comes back stays whatever those three writers already store. This packet does not add `send_denied` and does not retune those writers. Claim 21 owns that kind.

## Existing behavior

The three paths already call `actuateChannelSend` with `attempt.firm_id` and `purpose: "cem"`. The escalation sends only when the channel is email or text and the queued next attempt is not waiting:

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

That call sits after the `active_attempts` update, the `workflow_run` insert, and the `window_fired` engagement. `send.ok && !send.dryRun` writes `send_live`. `send.ok && send.dryRun` writes `send_dry_run`. An `ok: false` result writes neither row. The waiting branch does not enter this call. `fired_criteria[criteria.id]` returns at the top of the function on the next pass.

The cell advance writes the next cell, `delivered: true`, `delivered_at`, `fired_criteria = '{}'`, a `workflow_run`, and `cell_advanced` before this call:

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

The call is inside `if (toChannel === "email" || toChannel === "text")`. The engagement after it uses `shouldLiveSend` to choose `send_live` or `send_dry_run`, including when `send.ok` is false.

The wait arm clears `attempt_wait_until` before the send. The `DispatchResult` is discarded. The engagement that follows is always `send_dry_run`:

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

`tickOnce` loads open attempts and does not mention `halt_records`:

```982:991:server/wire-service/cascade.ts
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
```

The only `status = 'nullified'` writes in this file on the tick path are the two `hasInboundOverride` branches, in `escalateAttemptWindow` and at the start of each attempt in `tickOnce`. `hasInboundOverride` reads `inbound_reply`, `form_visit`, and `inbound_override`. It does not read `halt_records`.

`dispatchEmail` returns the gate deny before the cohort short-circuit. `dispatchSms` does the same.

```283:288:server/wire-service/dispatchSend.ts
/** Gated send for cascade/worker — fail closed to dry-run, but halt still denies (H1). */
export async function dispatchEmail(input: DispatchEmailInput): Promise<DispatchResult> {
  const halt = await consentAndHaltGate(input.contactId, input.firmId, input.purpose);
  if (!halt.allow) {
    return { ok: false, deny: halt.deny, detail: halt.detail };
  }
```

`actuateChannelSend` returns `no email on contact — dry-run intent only` or `no phone on contact — dry-run intent only` before either dispatcher when no address and no live fallback are present. Any other channel returns `channel ${channel} has no live dispatcher` without the gate.

`enrollAndActuate` returns `blocked: "halt"` before the insert when `isHaltBlockingNew` is true. Its first send uses `purpose: input.purpose ?? "opt-in"`, not the literal `cem`. After the attempt loop, `tickOnce` calls `dispatchScheduleTriggers` and `resumeDueWaitingRuns`.

The contact arm of `consentAndHaltGate` in the planted tree still matches `contact_id` with no `firm_id` predicate. PKT-016 specifies that change. This packet does not retune that statement. A halt row whose `firm_id` is `attempt.firm_id` denies under both the planted statement and the PKT-016 statement.

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof. The check does not call `tickOnce`. That function scans every open attempt.

1. With a consent row that does not itself deny purpose `cem`, `escalateAttemptWindow` returns `send` of `{ ok: false, deny: "policy", detail: "halt active" }` when the next channel is `email` or `text`, the criteria is due, the criteria id is not already in `fired_criteria`, no inbound override is present, the queued next attempt is not waiting, the contact has an address, and an active `scope = 'contact'` halt has that contact and `firm_id` equal to `attempt.firm_id`. After the return, `active_attempts.status` is `open`. `fired_criteria` contains that criteria id. `owner_channel` is the channel written before the send. A `window_fired` row exists for the attempt. No later update in that call sets `status` or removes the criteria id.
2. The same deny and the same open attempt hold when the only halt is an active `scope = 'firm-book'` row for `attempt.firm_id`. The escalation’s waiting branch does not call `actuateChannelSend`. On that branch `fired_criteria` for this fire stays `{}` and `attempt_wait_until` stays set.
3. `advanceTemplateCellIfDue` returns the same halt deny when the next cell’s channel is `email` or `text`, the cell is due, the contact has an address, and the consent row does not itself deny. After the return, `status` is `open`, `state.cellIndex` is the next index, `state.delivered` is true, `state.delivered_at` is set, and a `cell_advanced` row exists. A next channel that is neither `email` nor `text` does not call `actuateChannelSend`. The cell update still stands and `status` stays `open`.
4. A contact with no email and no live test fallback makes the email cell and the email escalation return the no-address dry-run. `status` stays `open`. The pre-send writes stay. The check does not require the gate to have run for that return.
5. The wait arm’s `UPDATE` that clears `attempt_wait_until` stays before `actuateChannelSend`. Nothing after that call writes `attempt_wait_until` back or sets `status` from the send result. `tickOnce`’s open-attempt statement stays `WHERE status = 'open'` and does not mention `halt_records`. `tickOnce` does not call `isHaltBlockingNew`. The two `status='nullified'` writes stay inside `hasInboundOverride`.
6. The three calls still pass `firmId: attempt.firm_id`, `contactId: attempt.contact_id`, and `purpose: "cem"`. They do not read `sequence_template.sequence_class`. `enrollAndActuate` and `isHaltBlockingNew` are unchanged. `consentAndHaltGate` is unchanged. The check does not call Resend or Twilio. No migration is added.

The check does not assert the `event_kind` of the engagement written after the send returns. `window_fired` and `cell_advanced` are the rows it requires, and they are the rows written before the send.

## Dependencies

PKT-016 specifies the contact arm of `consentAndHaltGate`. This packet does not implement that predicate and does not edit `PKT-016-halt-send-firm.md` or `SCP-pkt-016-halt-send-firm.md`. The verify inserts the halt with `firm_id` equal to `attempt.firm_id`, so the deny holds before that plant and after it. The other-firm case stays PKT-016.

PKT-015 specifies `isHaltBlockingNew`. This packet does not edit that function. The first step inside `enrollAndActuate` stays that packet’s caller. Claim 22 owns the engagement kind of a denied first step.

Claim 21 owns the engagement kind stored when one of these three sends returns `ok: false`. The escalation writes neither `send_live` nor `send_dry_run` for that result. The cell writes `send_dry_run` when its `shouldLiveSend` conjunction fails, including a deny. The wait arm discards the result and always writes `send_dry_run`. This packet leaves those writers. It does not add a factory-check clause that forbids a later kind. If a clause forbidding `send_denied` is added while this packet is planted, claim 21 removes only that clause.

Claim 45 owns the purpose string when `sequence_template.sequence_class` is `optin`. These three calls stay the literal `cem`. Claim 64 owns the campaign cursor’s `met` status. `recordCampaignFailure` stays the exhaustion path. `hasInboundOverride` stays the nullify path.

## Out of scope

The enroll predicate (PKT-015). The firm predicate on the send and the contact check (PKT-016). The consent select. The engagement kind of a deny (claim 21). The first step’s engagement (claim 22). The opt-in purpose on these three calls (claim 45). The `met` status (claim 64). Aborting an in-flight attempt. Rolling the cell, `fired_criteria`, `delivered`, or the cleared wait back when the gate denies. Skipping `actuateChannelSend` because the attempt is `open`. Reading `halt_records` inside `tickOnce`. Calling `isHaltBlockingNew` from the tick. `dispatchScheduleTriggers` and `resumeDueWaitingRuns`. Launch Agent. No plate.

## Plates

None.
