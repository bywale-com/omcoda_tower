import type { Context } from "hono";
import { dispatchEmail, dispatchSms } from "./dispatchSend.ts";
import { getWireCapabilities } from "./capabilities.ts";
import { sendGateSnapshot, shouldLiveSend } from "./sendMode.ts";
import { FirmScopeError, requireSessionFirm } from "./sessionFirm.ts";

/**
 * HTTP /wire/send/* — same cohort/halt/consent gates as cascade/worker.
 * Firm scope from session only (body.firmId ignored for tenancy).
 * Live only when contactId ∈ SEND_TEST_COHORT under SEND_MODE=live.
 */
export async function handleCemSend(c: Context) {
  let firmId: string;
  try {
    firmId = await requireSessionFirm(c);
  } catch (e) {
    if (e instanceof FirmScopeError) {
      return c.json({ ok: false, deny: "auth", detail: e.message }, e.status as 401 | 403);
    }
    throw e;
  }

  const caps = getWireCapabilities();
  if (!caps.resend) {
    return c.json({ ok: false, deny: "policy", detail: "RESEND_API_KEY missing" }, 503);
  }

  const body = await c.req.json<{
    to: string;
    from?: string;
    subject: string;
    bodyText: string;
    html?: string;
    firmId?: string;
    sendingIdentityId?: string;
    contactId?: string;
    purpose: string;
    forceDeny?: "auth" | "throttle" | "policy";
  }>();

  if (body.forceDeny) {
    return c.json({ ok: false, deny: body.forceDeny, detail: `forced ${body.forceDeny}` });
  }

  if (!body.contactId?.trim()) {
    return c.json(
      {
        ok: false,
        deny: "policy",
        detail: "contactId required — live send is cohort-gated",
        gate: sendGateSnapshot(),
      },
      400,
    );
  }

  const result = await dispatchEmail({
    to: body.to,
    from: body.from,
    subject: body.subject,
    bodyText: body.bodyText,
    html: body.html,
    firmId,
    contactId: body.contactId,
    purpose: body.purpose,
  });

  if (!result.ok) {
    return c.json({ ok: false, deny: result.deny, detail: result.detail, gate: sendGateSnapshot() });
  }
  return c.json({
    ok: true,
    messageId: result.messageId,
    acceptedAt: result.acceptedAt,
    dryRun: result.dryRun ?? false,
    liveEligible: shouldLiveSend(body.contactId),
    gate: sendGateSnapshot(),
  });
}

export async function handleSmsSend(c: Context) {
  let firmId: string;
  try {
    firmId = await requireSessionFirm(c);
  } catch (e) {
    if (e instanceof FirmScopeError) {
      return c.json({ ok: false, deny: "auth", detail: e.message }, e.status as 401 | 403);
    }
    throw e;
  }

  const caps = getWireCapabilities();
  if (!caps.twilio) {
    return c.json({ ok: false, deny: "ca-number", detail: "Twilio secrets / FROM missing" }, 503);
  }

  const body = await c.req.json<{
    to: string;
    body: string;
    firmId?: string;
    contactId?: string;
  }>();

  if (!body.contactId?.trim()) {
    return c.json(
      {
        ok: false,
        deny: "policy",
        detail: "contactId required — live send is cohort-gated",
        gate: sendGateSnapshot(),
      },
      400,
    );
  }

  const result = await dispatchSms({
    to: body.to,
    body: body.body,
    firmId,
    contactId: body.contactId,
    purpose: "cem",
  });

  if (!result.ok) {
    return c.json({ ok: false, deny: result.deny, detail: result.detail, gate: sendGateSnapshot() });
  }
  return c.json({
    ok: true,
    messageSid: result.messageId,
    dryRun: result.dryRun ?? false,
    liveEligible: shouldLiveSend(body.contactId),
    gate: sendGateSnapshot(),
  });
}
