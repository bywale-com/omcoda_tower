import type { Context } from "hono";
import { dispatchEmailLive, dispatchSmsLive } from "./dispatchSend.ts";
import { getWireCapabilities } from "./capabilities.ts";

export async function handleCemSend(c: Context) {
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
    firmId: string;
    sendingIdentityId?: string;
    contactId?: string;
    purpose: string;
    forceDeny?: "auth" | "throttle" | "policy";
  }>();

  if (body.forceDeny) {
    return c.json({ ok: false, deny: body.forceDeny, detail: `forced ${body.forceDeny}` });
  }

  const result = await dispatchEmailLive({
    to: body.to,
    from: body.from,
    subject: body.subject,
    bodyText: body.bodyText,
    html: body.html,
    firmId: body.firmId,
    contactId: body.contactId,
    purpose: body.purpose,
  });

  if (!result.ok) {
    return c.json({ ok: false, deny: result.deny, detail: result.detail });
  }
  return c.json({
    ok: true,
    messageId: result.messageId,
    acceptedAt: result.acceptedAt,
  });
}

export async function handleSmsSend(c: Context) {
  const caps = getWireCapabilities();
  if (!caps.twilio) {
    return c.json({ ok: false, deny: "ca-number", detail: "Twilio secrets / FROM missing" }, 503);
  }

  const body = await c.req.json<{
    to: string;
    body: string;
    firmId: string;
    contactId?: string;
  }>();

  const result = await dispatchSmsLive({
    to: body.to,
    body: body.body,
    firmId: body.firmId,
    contactId: body.contactId,
    purpose: "cem",
  });

  if (!result.ok) {
    return c.json({ ok: false, deny: result.deny, detail: result.detail });
  }
  return c.json({ ok: true, messageSid: result.messageId });
}
