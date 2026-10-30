# PKT-018 — A denied tick send is its own engagement row

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 21, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes  
**UI:** none

## Intended behavior

A tick send that comes back `ok: false` appends one `engagement_records` row of kind `send_denied`. That row is how a later reader tells the refusal from a dry run and from a message that went out. `send_live` stays the provider accept: `send.ok && !send.dryRun`. `send_dry_run` stays the fail-closed stage: `send.ok && send.dryRun`. The attempt writes PKT-017 left in place stay in place. This packet does not abort the attempt, does not roll the cell, `fired_criteria`, or the cleared wait back, and does not retune `hasInboundOverride`.

The three writers are the three that already call `actuateChannelSend` for an open attempt. Each still passes `firmId: attempt.firm_id`, `contactId: attempt.contact_id`, and `purpose: "cem"`. This packet edits the engagement written after that call returns. It does not edit the call.

- `escalateAttemptWindow`, when the send ran.
- `advanceTemplateCellIfDue`, when the next cell’s channel is `email` or `text`.
- The wait-until arm inside `tickOnce`, when the owner channel is `email` or `text`.

`writeEngagement` stays the insert. `firm_id` is `attempt.firm_id`. `contact_id` is `attempt.contact_id`. The id is the `eng-` id that function already returns. `event_kind` stays unconstrained text. No migration. No new table.

When `actuateChannelSend` returns `ok: false`, the row is:

- `event_kind` is `send_denied`.
- The payload carries `attemptId` (`attempt.id`), `channel` (the channel passed into `actuateChannelSend`), and `send` (that `DispatchResult`, including `ok: false` and `deny`, `detail`, and `dryRun` as the value already has them).
- The escalation also keeps `runId`, `criteriaId`, and `criteriaLabel`. The cell advance also keeps `cellId`, `cellLabel`, and `runId`. The wait arm also keeps `attempt_n`.
- The stored payload does not contain `subject`, `bodyText`, `bodyHtml`, `messageId`, or `reason`. Those keys are absent. They are not stored as null. The inspector replays a body as a send or a staged dry run. The authored copy stays on the template and the campaign content the tick already read. The refusal is the kind and the `send` object.

The writers branch on `send.ok`. They do not read `detail` or `deny`. A halt deny, a silenced deny, a consent-missing deny, and a throughput deny are the same kind. A deny that also carries `dryRun: false` or `dryRun: true` is still `send_denied`. The flag does not make the result a live accept or a dry run.

An allowed result uses the escalation’s two kinds, from the result. `shouldLiveSend` is not the label.

- `send.ok && !send.dryRun` is `send_live`. The payload carries `messageId`, `subject`, and `bodyText`, plus the keys that writer already stores on an allowed row.
- `send.ok && send.dryRun` is `send_dry_run`. The payload carries `reason`, `subject`, and `bodyText`, plus those same keys.

The escalation’s allowed payloads stay the ones it already writes. They do not gain a `send` object. The cell’s allowed payload keeps the `send` object it already stores, and it keeps `cellId`, `cellLabel`, and `runId`. The wait arm’s allowed payload keeps `attemptId`, `channel`, `subject`, `bodyText`, and `attempt_n`, and it gains `messageId` on the live arm and `reason` on the dry-run arm. It does not gain a `send` object on those two arms. The wait arm keeps the `DispatchResult` and uses the same three branches. It does not write `send_dry_run` for a deny or for a live success.

A path that does not call `actuateChannelSend` writes no `send_denied` row. That is the escalation’s waiting branch, a cell whose channel is neither `email` nor `text`, and a wait arm whose owner is neither `email` nor `text`. A missing address with no live test fallback, and the no-dispatcher return inside `actuateChannelSend`, are `ok: true` and `dryRun: true`. They stay `send_dry_run`. They are not this row. These three writers do not call `actuateChannelSend` for a channel other than email or text, so the no-dispatcher return is not a row they add.

`window_fired` and `cell_advanced` stay the rows PKT-017 already required, written before the send. The deny row is a later append. It is not an update of those rows. One deny is one new row, not a second send row beside it. The tick send does not dispatch, so this row is not an element of `payload.writes` and it is not a listening pointer.

`enrollAndActuate` still labels its first step from `shouldLiveSend`. That write still stores `subject` and `bodyText` when `ok` is false. Claim 22 owns that row.

`titleFor`, `kindOf`, `outcomeFrom`, `thoughtFrom`, `signalsFrom`, and `eventKindProse` stay as they are. `titleFor` has no `send_denied` case, so the complaint-desk title is the kind with underscores turned into spaces. `kindOf` has no `send_denied` case, so that kind is `other` and `outcomeFrom` leaves the outcome line empty. `eventKindProse` still returns `Sent` for a kind that contains `send`. Claim 40 owns that column. The Activity Sent and Delivered tags stay a reading of attempt state. This packet does not retune them.

## Existing behavior

`DispatchResult` is three shapes. `ok: false` carries `deny`, an optional `detail`, and an optional `dryRun`.

```45:48:server/wire-service/dispatchSend.ts
export type DispatchResult =
  | { ok: true; dryRun: false; messageId: string; acceptedAt: string; channel: "email" | "sms" }
  | { ok: true; dryRun: true; reason: string; channel: "email" | "sms" }
  | { ok: false; deny: string; detail?: string; dryRun?: boolean };
```

`writeEngagement` inserts one row and returns `eng-` plus a uuid. `event_kind` is the string it is given.

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

The escalation writes `send_live` only when `send.ok && !send.dryRun`, and `send_dry_run` only when `send.ok && send.dryRun`. An `ok: false` result writes neither row. `window_fired` is the earlier insert. The allowed payloads carry `subject` and `bodyText`. They do not carry `send`.

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

The cell writes one row after every email or text send. The kind is `send_live` only when `shouldLiveSend` is true and the result is a live success. Every other result, including `ok: false`, is `send_dry_run`. The payload always carries `subject`, `bodyText`, and `send`.

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

The wait arm discards the `DispatchResult` and always writes `send_dry_run` with `subject` and `bodyText` and no `send` object. A deny, a dry run, and a live success are the same row.

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

A missing address with no live test fallback returns `ok: true`, `dryRun: true`, and a reason, before `dispatchEmail` or `dispatchSms`.

```617:623:server/wire-service/cascade.ts
    if (!to) {
      return {
        ok: true,
        dryRun: true,
        reason: "no email on contact — dry-run intent only",
        channel: "email",
      };
```

`enrollAndActuate` still chooses the kind from `shouldLiveSend` and still stores `subject`, `bodyText`, and `send` when `ok` is false. A live-cohort deny is `send_live` there. That is claim 22.

```797:809:server/wire-service/cascade.ts
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
```

`titleFor` returns `eventKind.replace(/_/g, " ")` for a kind it does not case. `kindOf` returns `"other"` unless the kind is `send_live` or `send_dry_run` among the send kinds. `eventKindProse` returns `Sent` when the lowercased kind contains `send`.

```122:123:src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts
    default:
      return eventKind.replace(/_/g, " ");
```

```83:84:src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts
function kindOf(eventKind: string): ActivityRowKind {
  if (eventKind === "send_live" || eventKind === "send_dry_run") return "send";
```

```138:143:src/app/register/prototype-ant/operator/channelRuleGrain.ts
export function eventKindProse(eventKind: string): string {
  const kind = eventKind.toLowerCase();
  if (kind.includes("open")) return "Opened";
  if (kind.includes("click")) return "Clicked";
  if (kind.includes("deliver")) return "Delivered";
  if (kind.includes("send") || kind === "sent") return "Sent";
```

## Acceptance

A deterministic check, named by the systems-change packet, must prove these cases. `npm run build` is not that proof. The check does not call `tickOnce`. That function scans every open attempt. The check does not call Resend or Twilio. No migration is added.

1. With a consent row that does not itself deny purpose `cem`, `escalateAttemptWindow` appends one `send_denied` row when the next channel is `email` or `text`, the criteria is due, the criteria id is not already in `fired_criteria`, no inbound override is present, the queued next attempt is not waiting, the contact has an address, and an active `scope = 'contact'` halt has that contact and `firm_id` equal to `attempt.firm_id`. The stored payload has `attemptId`, `channel`, `runId`, `criteriaId`, `criteriaLabel`, and `send`. `send.ok` is false, `send.deny` is `policy`, and `send.detail` is `halt active`. The payload has no `subject`, `bodyText`, `bodyHtml`, `messageId`, or `reason`. The same call writes no `send_live` and no `send_dry_run`. `window_fired` still exists. `active_attempts.status` stays `open`. `fired_criteria` still contains that criteria id. The id of the deny row starts with `eng-`. `firm_id` is `attempt.firm_id` and `contact_id` is `attempt.contact_id`.
2. The same `send_denied` row, and no `send_live` or `send_dry_run`, is written when the only difference is a deny whose `detail` is not `halt active`. A silenced consent row is enough. The writer does not branch on `detail`. The waiting branch still does not call `actuateChannelSend` and still writes no send engagement for that fire.
3. A contact with no email and no live test fallback makes the email escalation write `send_dry_run` with `reason`, `subject`, and `bodyText`, and no `send_denied`. `status` stays `open`.
4. `advanceTemplateCellIfDue` appends one `send_denied` row, and no `send_live` or `send_dry_run`, when the next cell’s channel is `email` or `text`, the cell is due, the contact has an address, the consent row does not itself deny, and the halt is the same contact halt. The payload has `attemptId`, `cellId`, `cellLabel`, `channel`, `runId`, and `send`, and it has no `subject`, `bodyText`, `bodyHtml`, `messageId`, or `reason`. This holds when `shouldLiveSend` is true for that contact and when it is false. `cell_advanced` still exists. `status` stays `open`. `state.delivered` stays true. A next channel that is neither `email` nor `text` writes no `send_denied`. The missing-address email cell writes `send_dry_run` with `subject`, `bodyText`, and `reason`, and no `send_denied`.
5. The cell’s kind expression does not call `shouldLiveSend`. `send.ok && !send.dryRun` is `send_live`. `send.ok && send.dryRun` is `send_dry_run`. The local `live` binding in `advanceTemplateCellIfDue` is removed. `enrollAndActuate` still chooses `live ? "send_live" : "send_dry_run"` and still stores `subject` and `bodyText` on that row. The three `actuateChannelSend` calls still pass `firmId: attempt.firm_id` and `purpose: "cem"`.
6. The wait arm keeps the `DispatchResult`. `ok: false` writes `send_denied` with `attemptId`, `channel`, `attempt_n`, and `send`, and without `subject`, `bodyText`, `bodyHtml`, `messageId`, or `reason`. `send.ok && !send.dryRun` writes `send_live` with `messageId`, `subject`, and `bodyText`. `send.ok && send.dryRun` writes `send_dry_run` with `reason`, `subject`, and `bodyText`. The check proves that branch by reading the arm. It does not extract the arm and it does not call `tickOnce`.
7. `titleFor`, `kindOf`, `outcomeFrom`, `signalsFrom`, and `eventKindProse` are unchanged. `consentAndHaltGate` is unchanged. `hasInboundOverride` is unchanged. `window_fired` and `cell_advanced` are not updated after the send returns.

## Dependencies

PKT-017 owns the open attempt and the writes made before the send. This packet does not edit `PKT-017-tick-send-halt.md`. `SCP-pkt-017-tick-send-halt.md` forbids `send_denied` and freezes the three post-send writers. PKT-017 said claim 21 removes only that clause. This packet is that removal. The Architect does not edit the systems file. The Analyst removes only that clause when this packet is specified. The open-attempt rules, the pre-send writes, and the three `purpose: "cem"` calls in that systems file stay.

PKT-016 owns the contact arm’s `firm_id` predicate. The verify inserts the halt with `firm_id` equal to `attempt.firm_id`. The other-firm case stays PKT-016. PKT-015 owns `isHaltBlockingNew`. This packet does not edit that function.

Claim 22 owns the first step inside `enrollAndActuate`. Claim 23 owns the consent select. Claim 40 owns `eventKindProse` for `send_denied` and `send_dry_run`. Claim 45 owns the purpose string when `sequence_template.sequence_class` is `optin`. These three calls stay the literal `cem`.

## Out of scope

The open attempt and the pre-send writes (PKT-017). The enroll predicate (PKT-015). The firm predicate (PKT-016). The consent select (claim 23). The first step’s engagement (claim 22). The operator column (claim 40). A new `titleFor` case. Retuning `kindOf`, `outcomeFrom`, `signalsFrom`, or the Activity tags. The opt-in purpose (claim 45). Aborting an in-flight attempt. Rolling the cell, `fired_criteria`, `delivered`, or the cleared wait back. Reading `detail` to split the kind. Adding this row to `payload.writes`. `dispatchScheduleTriggers` and `resumeDueWaitingRuns`. Launch Agent. No plate.

## Plates

None.
