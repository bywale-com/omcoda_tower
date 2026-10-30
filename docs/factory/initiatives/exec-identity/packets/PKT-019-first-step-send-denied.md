# PKT-019 — A denied first step is the same refusal the tick already records

**Initiative:** `exec-identity`  
**Claims:** PR #135 claim 22, at `1f6f43ab2dbe8b0e32b0a344990795bb998c8be3`. The claim text is the same at `807e1ca21735b764d77132602e8b9f5942c00c0d`.  
**Wake:** sa
**Release:** draft  
**Release eligible:** yes  
**UI:** none

## Intended behavior

When `enrollAndActuate` runs its first `actuateChannelSend` and that call returns `ok: false`, it appends one `engagement_records` row of kind `send_denied`. That is the refusal PKT-018 already required of a tick send. The call is the same dispatcher. The kind is the `DispatchResult`. `shouldLiveSend` is not the kind.

The writer is the `writeEngagement` that already follows the first `actuateChannelSend` inside `enrollAndActuate`, and only when `fireFirstStep` is not false. This packet edits that engagement. It does not edit the call. It does not edit `escalateAttemptWindow`, `advanceTemplateCellIfDue`, or the wait arm inside `tickOnce`.

`writeEngagement` stays the insert. `firm_id` is `input.firmId`. `contact_id` is `input.contactId`. The id is the `eng-` id that function already returns. `event_kind` stays unconstrained text. No migration. No new table.

When that first step runs and `actuateChannelSend` returns `ok: false`, the row is:

- `event_kind` is `send_denied`.
- The payload carries `enrollmentId` (the enrollment just inserted), `attemptId`, `channel` (the owner channel passed into `actuateChannelSend`), `templateId` (`state.templateId`), `cellId` (`state.cellId`), `cellIndex` (`0`), and `send` (that `DispatchResult`: `ok: false`, and `deny`, `detail`, and `dryRun` as the value already has them).
- `subject`, `bodyText`, `bodyHtml`, `messageId`, and `reason` are absent. They are not stored as null. This writer does not store `bodyHtml` today. Subject and body come off so the inspector does not replay a withheld message. The authored copy stays on the template and the campaign content the function already read, and it still goes into `actuateChannelSend`.

`cellId` stays the value the attempt state already has. `JSON.stringify` already drops an undefined `state.cellId`, so a first step with no template cell stores no `cellId` key. A first cell that exists stores that cell’s id. This packet does not coerce the key to null.

The writer branches on `send.ok`. It does not read `detail` or `deny`. A halt deny, a silenced deny, a consent-missing deny, and a throughput deny are the same kind. A deny that also carries `dryRun: false` or `dryRun: true` is still `send_denied`. The flag does not make the result a live accept or a dry run.

An allowed result uses PKT-018’s two kinds, from the result. `shouldLiveSend` is not the label.

- `send.ok && !send.dryRun` is `send_live`. The payload carries `messageId`, `subject`, `bodyText`, and `send`, plus the same step keys.
- `send.ok && send.dryRun` is `send_dry_run`. The payload carries `reason`, `subject`, `bodyText`, and `send`, plus the same step keys.

A missing address with no live test fallback, and a channel that is neither email nor text, are that dry run. `actuateChannelSend` already returns `ok: true` and `dryRun: true` for both. A live-cohort contact whose result is that dry run is `send_dry_run`. The cohort flag is not the label.

`enrollment.payload.dryRun` stays `!shouldLiveSend`, written before the send returns. The return’s `dryRun` is that same boolean. A denied live-cohort enroll keeps `dryRun` false on the enrollment and on the return, and `send_denied` on the engagement. Rewriting either flag from `send.ok` would store the refusal as a dry run. This packet does not rewrite them.

`fireFirstStep === false` writes no engagement row. The enrollment insert and the attempt insert still run. When `isHaltBlockingNew` is already true, the function returns `blocked: "halt"` before the insert and writes no engagement row. A deny the gate returns after the insert, including a halt the enroll check did not see, is this row. This packet does not make that ordering a second rule.

The attempt stays `open`. `state.delivered` stays as the insert wrote it. The deny does not nullify the attempt and does not enter `hasInboundOverride`. The Activity tags stay a reading of attempt state. `eventKindProse`, `titleFor`, `outcomeFrom`, `thoughtFrom`, `signalsFrom`, and `kindOf` stay as they are. `titleFor` has no `send_denied` case, so the complaint-desk title is the kind with underscores turned into spaces. `kindOf` has no `send_denied` case, so that kind is `other` and `outcomeFrom` leaves the outcome line empty. `eventKindProse` still returns `Sent` for a kind that contains `send`. Claim 40 owns that column.

This row is not a dispatch, so it is not an element of `payload.writes`. `writeEngagement`’s id is not added to the function’s return. `call_agent` still pushes the enrollment id. This packet does not add the engagement id to that array.

The `actuateChannelSend` call stays `purpose: input.purpose ?? "opt-in"`, with the same `firmId`, `contactId`, `channel`, `subject`, `bodyText`, and pursuit ids. Claim 45 owns the purpose string when `sequence_template.sequence_class` is `optin`. Claim 23 owns the consent select inside the gate. Claim 43 and claim 44 own whether a caller makes this call. A first step that does run is this row.

## Existing behavior

`enrollAndActuate` sets `live` from `shouldLiveSend(input.contactId)` before it sends. The enrollment insert stores `dryRun: !live` in that payload. The attempt insert stores `status` `open` and `state.delivered` true. A halt that `isHaltBlockingNew` already sees returns before either insert.

```689:718:server/wire-service/cascade.ts
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

  const live = shouldLiveSend(input.contactId);
  const id = `enr-${randomUUID()}`;
  const tpl = await resolveBoundTemplate(pool, input.firmId, input.agentRef);
  const sequenceId = input.sequenceId ?? tpl?.templateId ?? input.agentRef;
  const { firstCampaignId, firstAuthoredChannel } = await import("./campaignHousing.ts");
  const campaignId = await firstCampaignId(pool, sequenceId);
  const authored = await firstAuthoredChannel(pool, campaignId);
  const firstCell: NormalizedCell | null = tpl?.cells[0] ?? null;
  const payload = {
    ...(input.payload ?? {}),
    dryRun: !live,
    templateId: tpl?.templateId ?? input.agentRef,
    cellId: firstCell?.id ?? null,
    campaignId,
  };
```

When `fireFirstStep` is not false, the function calls `actuateChannelSend` with `purpose: input.purpose ?? "opt-in"` and then `writeEngagement` with kind `live ? "send_live" : "send_dry_run"`. The payload always carries `subject`, `bodyText`, and `send`. `messageId` is set only when `send.ok && !send.dryRun`. `reason` is set only when `send.ok && send.dryRun`. A live-cohort deny is `send_live` with no `messageId`, with the copy present, and with `send.ok` false. A deny for any other contact is `send_dry_run` with the copy present, with no `reason`, and with `send.ok` false. The return is `dryRun: !live` whether or not the send was denied.

```771:820:server/wire-service/cascade.ts
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

`DispatchResult` is three shapes. `ok: false` carries `deny`, an optional `detail`, and an optional `dryRun`. `dispatchEmail` and `dispatchSms` return the gate’s deny before `shouldLiveSend`. `dispatchEmailLive` returns `dryRun: false` when Resend is missing.

```45:48:server/wire-service/dispatchSend.ts
export type DispatchResult =
  | { ok: true; dryRun: false; messageId: string; acceptedAt: string; channel: "email" | "sms" }
  | { ok: true; dryRun: true; reason: string; channel: "email" | "sms" }
  | { ok: false; deny: string; detail?: string; dryRun?: boolean };
```

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

A missing address with no live test fallback, and a channel with no dispatcher, return `ok: true` and `dryRun: true` before that gate.

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

`shouldLiveSend` is true only when `SEND_MODE` is `live` and the contact is in a non-empty `SEND_TEST_COHORT`.

```33:38:server/wire-service/sendMode.ts
export function shouldLiveSend(contactId: string | undefined | null): boolean {
  if (!contactId) return false;
  if (getSendMode() !== "live") return false;
  const cohort = getSendTestCohort();
  if (cohort.size === 0) return false;
  return cohort.has(contactId);
}
```

`writeEngagement` inserts one row and returns `eng-` plus a uuid.

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

`titleFor` has no `send_denied` case. `kindOf` returns `"other"` unless the kind is `send_live` or `send_dry_run` among the send kinds. `outcomeFrom` reads `payload.reason` and `payload.messageId` only when the kind is `send`. `eventKindProse` returns `Sent` when the lowercased kind contains `send`. The inspector replays when `subject`, `bodyText`, or `bodyHtml` is on the projected row.

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

```83:84:src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts
function kindOf(eventKind: string): ActivityRowKind {
  if (eventKind === "send_live" || eventKind === "send_dry_run") return "send";
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

`call_agent` still pushes the enrollment id and passes `fireFirstStep: true`.

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

## Acceptance

A deterministic check, `scripts/verify-first-step-send-denied.ts`, must prove these cases. `npm run build` is not that proof. The check calls `enrollAndActuate`. It does not call `tickOnce`, `escalateAttemptWindow`, `advanceTemplateCellIfDue`, Resend, or Twilio. No migration is added.

The script uses `getPool()` the way `scripts/verify-click-attribution.ts` does. It exits 2 when `DATABASE_URL` is missing. It deletes `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `TWILIO_PHONE_NUMBER`, `SEND_MODE`, `SEND_TEST_COHORT`, `TEST_EMAIL_TO`, and `TEST_SMS_TO` for the process, and it restores that deletion after each case that sets `SEND_MODE` and `SEND_TEST_COHORT`. It does not boot Vite. It does not build a workflow graph.

On `.github/workflows/ship.yml`, in job `verify-ship`, the step is `npx tsx --env-file=.env scripts/verify-first-step-send-denied.ts`. Place it after `scripts/verify-send-denied-engagement.ts` when that step exists, and after `scripts/verify-click-attribution.ts` when it does not. Do not fold it into `npm run verify:ship`. Do not remove a step.

The firm id is `firm-pkt019-` plus a run token. The contact id is `cr-pkt019-` plus that token. The firm is not the seeded Harbor firm. The agent ref is `agt-pkt019-` plus that token, with no `sequence_template` row and no `campaign` row. `ownerChannel` is passed by the case. Halt inserts use `consultant_id` `pkt019` and an id unique to the run. The script deletes the rows it inserts, in a `finally`, in foreign-key order, including `engagement_records`, `active_attempts`, `enrollment`, `halt_records`, `consent_records`, `contact_records`, `messaging_events`, and `outbound_messages`, by this firm id and this contact id. An open attempt left behind would be scanned by a worker that calls `tickOnce`.

Each enroll uses a fresh contact id under the same firm, so earlier rows do not leak into the count. The stored payload is parsed from jsonb. A forbidden key fails when `key in payload`. A key stored as null fails that test. With no template and no campaign, an allowed row’s `subject` is `Tower — ${agentRef}` and its `bodyText` is `Sequence start via ${agentRef}`. `templateId` is the agent ref. `cellIndex` is `0`. `cellId` is absent. `outbound_messages` for this firm is empty after every case.

1. `SEND_MODE` is unset. The contact has an email. Consent is `basis` `express`, `silenced` true, `status` `silenced`. No halt. `ownerChannel` is `email`. `purpose` is omitted. `fireFirstStep` is omitted. One `send_denied` row is written, and no `send_live` or `send_dry_run`. `send.ok` is false, `send.deny` is `policy`, and `send.detail` is `silenced`. The payload has `enrollmentId`, `attemptId`, `channel` `email`, `templateId`, `cellIndex` `0`, and `send`. It has no `subject`, `bodyText`, `bodyHtml`, `messageId`, `reason`, or `cellId`. The id starts with `eng-`. `firm_id` is the enroll firm and `contact_id` is this contact. The enrollment row exists. Its `payload.dryRun` is true. The return’s `dryRun` is true. The return has no engagement id. `active_attempts.status` is `open`. `state.delivered` is true. The attempt’s `owner_channel` is `email`.
2. The same shape, with no consent row and `purpose` `cem`, is one `send_denied` row. `send.detail` is `consent missing`. No `send_live` and no `send_dry_run`. The payload keys match case 1. The writer does not branch on `detail`.
3. `SEND_MODE` is `live` and `SEND_TEST_COHORT` contains the contact. Consent is silenced, as in case 1. The contact has an email. `ownerChannel` is `email`. `purpose` is `opt-in`. One `send_denied` row, and no `send_live` or `send_dry_run`. The enrollment `payload.dryRun` is false. The return’s `dryRun` is false. `send.ok` is false. The payload has no `subject` or `bodyText`.
4. `SEND_MODE` is `live` and the contact is in the cohort. Consent is `basis` `express`, `silenced` false. The contact has an email. `ownerChannel` is `email`. `purpose` is `opt-in`. No Resend key is set. One `send_denied` row. `send.ok` is false, `send.deny` is `policy`, `send.detail` is `RESEND_API_KEY missing`, and `send.dryRun` is false. No `send_live` and no `send_dry_run`. The payload has no `subject`, `bodyText`, `bodyHtml`, `messageId`, or `reason`. The enrollment `payload.dryRun` is false.
5. `SEND_MODE` is unset. Consent is `basis` `express` and `silenced` false. No consent row is also enough for purpose `opt-in`. The contact has an email. `ownerChannel` is `email`. One `send_dry_run` and no `send_denied`. `send.ok` is true and `send.dryRun` is true. The payload has `reason` `SEND_MODE/cohort gate — fail closed`, `subject`, `bodyText`, and `send`. It has no `messageId`. The enrollment `payload.dryRun` is true.
6. `SEND_MODE` is `live` and the contact is in the cohort. Consent is `basis` `express` and `silenced` false. The contact email is null and the phone is null. `TEST_EMAIL_TO` is unset. `ownerChannel` is `email`. One `send_dry_run` and no `send_denied` and no `send_live`. `reason` is `no email on contact — dry-run intent only`. The payload has `subject`, `bodyText`, and `send`. The enrollment `payload.dryRun` is false. The return’s `dryRun` is false.
7. `SEND_MODE` is unset. Consent is `basis` `express` and `silenced` false. `ownerChannel` is `call`. One `send_dry_run` and no `send_denied`. `send.ok` is true and `send.dryRun` is true. `reason` contains `no live dispatcher`. `channel` on the payload is `call`.
8. `fireFirstStep` is false. Consent is `basis` `express` and `silenced` false. No engagement row is written. The enrollment row exists. The attempt `status` is `open`. The return’s `send` is undefined. The return’s `dryRun` follows `shouldLiveSend` for that contact.
9. An active `scope = 'firm-book'` halt has `firm_id` equal to the enroll firm. `enrollAndActuate` returns `blocked` `"halt"` and `enrollmentId` `""`. No enrollment row, no attempt row, and no engagement row are written for this contact.
10. The script reads the first-step writer inside `enrollAndActuate`, from `send = await actuateChannelSend` through the `return`. It fails unless that slice contains `"send_denied"`, `"send_live"`, `"send_dry_run"`, `send.ok && !send.dryRun`, and `send.ok && send.dryRun`. It fails if that slice contains `live ? "send_live" : "send_dry_run"`, `send.detail`, or `send.deny`. The text of the `send_denied` object contains `send` and the step keys, and does not contain `subject`, `bodyText`, `bodyHtml`, `messageId`, or `reason`. The `send_live` object contains `messageId`, `subject`, `bodyText`, and `send`. The `send_dry_run` object contains `reason`, `subject`, `bodyText`, and `send`. The `actuateChannelSend` call in that function still contains `purpose: input.purpose ?? "opt-in"`, `subject`, and `bodyText`. The function still contains `const live = shouldLiveSend(input.contactId)`, `dryRun: !live`, and `if (input.fireFirstStep !== false)`. The early return still contains `blocked: "halt"`. `titleFor` has no `case "send_denied"`. `kindOf`’s send test stays `eventKind === "send_live" || eventKind === "send_dry_run"`. `eventKindProse` still returns `Sent` from `kind.includes("send")` and does not contain `send_denied`. `hasInboundOverride`’s `event_kind IN` list does not contain `send_denied`. `call_agent` still pushes `result.enrollmentId` and does not push an engagement id.

A pass is evidence only for the candidate SHA that ran. A pass on an older SHA does not verify a newer commit.

## Dependencies

PKT-018 owns the tick’s `send_denied` row. This packet does not edit `PKT-018-send-denied-engagement.md`. `SCP-pkt-018-send-denied-engagement.md` forbids `send_denied` from `enrollAndActuate` and its verify fails if that function contains `"send_denied"` or loses `live ? "send_live" : "send_dry_run"`. PKT-018 said claim 22 owns that row. This packet is that row. The Architect does not edit the systems file. The Analyst removes only those clauses and the matching verify predicates, including a `factory:check` predicate if the PKT-018 plant added one. The tick writers, their payloads, and their `purpose: "cem"` calls stay. If `scripts/verify-send-denied-engagement.ts` is already planted with the `enrollAndActuate` guard, the engineer removes only that guard. The rest of that script stays.

PKT-015 owns the early return. The firm-book halt in acceptance 9 is that return. This packet does not edit `isHaltBlockingNew`. PKT-016 owns the contact arm’s `firm_id` predicate on the send. This packet does not edit `consentAndHaltGate`. PKT-017 owns the open attempt and the writes made before a tick send.

Claim 23 owns the consent select. Claim 40 owns `eventKindProse` for `send_denied` and `send_dry_run`. Claim 43 and claim 44 own whether `call_agent`, `handleEnrollmentCreate`, `handleOnboardingFire`, and `handleSequenceEnrollContacts` make this call. Claim 45 owns the purpose string when `sequence_template.sequence_class` is `optin`. The call stays `input.purpose ?? "opt-in"`.

`halt-send` has no component contract. This packet does not open one.

## Out of scope

The tick writers and their deny payloads (PKT-018). The open attempt and the pre-send writes (PKT-017). The enroll predicate (PKT-015). The firm predicate (PKT-016). The consent select (claim 23). The operator column (claim 40). A new `titleFor` case. Retuning `kindOf`, `outcomeFrom`, `thoughtFrom`, `signalsFrom`, or the Activity tags. The opt-in purpose (claim 45). Whether a caller invokes `enrollAndActuate` (claim 43 and claim 44). Rewriting `enrollment.payload.dryRun` or the return’s `dryRun` from `send.ok`. Adding the engagement id to the return or to `call_agent`’s writes. Aborting an in-flight attempt. Reading `detail` to split the kind. Adding this row to `payload.writes`. `dispatchScheduleTriggers` and `resumeDueWaitingRuns`. Launch Agent. No plate.

## Plates

None.
