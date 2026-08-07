import { Hono } from "hono";
import { getWireCapabilities } from "./capabilities.ts";
import {
  handleAuditAppend,
  handleAuditList,
  handleConsentGet,
  handleConsentSet,
  handleConsentSilence,
  handleHaltCommit,
  handleHaltIsContact,
  handleHaltIsFirmBook,
  handleHaltLift,
  handleHaltList,
  handleOAuthGet,
  handleOAuthGrant,
  handleOAuthRevoke,
  handlePrimaryGet,
  handlePrimaryList,
  handlePrimaryPut,
} from "./stores.ts";
import { handleCemSend, handleSmsSend } from "./send.ts";
import {
  handlePoolAllocate,
  handlePoolAuthChips,
  handlePoolGet,
  handlePoolList,
  handlePoolVerify,
} from "./pool.ts";
import { handleListEvents, handleResendWebhook } from "./webhooks.ts";

export function createWireRoutes(): Hono {
  const wire = new Hono();

  wire.get("/health", (c) => c.json({ ok: true, service: "tower-wire" }));
  wire.get("/capabilities", (c) => c.json(getWireCapabilities()));

  wire.post("/send/cem", handleCemSend);
  wire.post("/send/sms", handleSmsSend);

  wire.post("/pool/allocate", handlePoolAllocate);
  wire.get("/pool", handlePoolList);
  wire.get("/pool/:firmId", handlePoolGet);
  wire.get("/pool/:firmId/auth-chips", handlePoolAuthChips);
  wire.post("/pool/:firmId/verify", handlePoolVerify);

  wire.post("/webhooks/resend", handleResendWebhook);
  wire.get("/events", handleListEvents);

  wire.post("/audit", handleAuditAppend);
  wire.get("/audit", handleAuditList);

  wire.post("/halt", handleHaltCommit);
  wire.post("/halt/:haltId/lift", handleHaltLift);
  wire.get("/halt", handleHaltList);
  wire.get("/halt/contact/:contactId", handleHaltIsContact);
  wire.get("/halt/firm-book/:firmId", handleHaltIsFirmBook);

  wire.post("/consent", handleConsentSet);
  wire.post("/consent/silence", handleConsentSilence);
  wire.get("/consent/:contactId", handleConsentGet);

  wire.post("/oauth/grant", handleOAuthGrant);
  wire.post("/oauth/:firmId/revoke", handleOAuthRevoke);
  wire.get("/oauth/:firmId", handleOAuthGet);

  wire.get("/store/:collection", handlePrimaryList);
  wire.get("/store/:collection/:id", handlePrimaryGet);
  wire.put("/store/:collection/:id", handlePrimaryPut);

  return wire;
}
