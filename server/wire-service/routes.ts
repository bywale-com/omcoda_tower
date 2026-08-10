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
import {
  handleAuditRunCreate,
  handleBoardDetections,
  handleEnrollmentCreate,
  handleMachineHealth,
  handleMachineTick,
  handleOnboardingFire,
  handlePauseWorkflow,
  handleReferenceUpsert,
  handleTemplatesList,
  handleWorkflowActivate,
  handleWorkflowCreate,
  handleWorkflowList,
  handleWorkflowRunComplete,
  handleWorkflowRunStart,
  handleWorkflowRunsList,
} from "./machine.ts";
import {
  handleAuthorizeBook,
  handleImportContacts,
  handleJourneyDetect,
  handleJourneyOutreach,
  handleJourneyStatus,
  handleListContacts,
} from "./journey.ts";

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

  // Machine tables (frozen System Map + automations objects)
  wire.get("/machine/health", handleMachineHealth);
  wire.post("/machine/tick", handleMachineTick);
  // Product journey (authorize → import → detect → outreach)
  wire.get("/machine/journey/status", handleJourneyStatus);
  wire.post("/machine/journey/authorize", handleAuthorizeBook);
  wire.get("/machine/contacts", handleListContacts);
  wire.post("/machine/contacts/import", handleImportContacts);
  wire.post("/machine/journey/detect", handleJourneyDetect);
  wire.post("/machine/journey/outreach", handleJourneyOutreach);
  wire.get("/machine/workflows", handleWorkflowList);
  wire.post("/machine/workflows", handleWorkflowCreate);
  wire.post("/machine/workflows/:id/activate", handleWorkflowActivate);
  wire.post("/machine/workflows/:id/pause", handlePauseWorkflow);
  wire.post("/machine/workflows/:id/runs", handleWorkflowRunStart);
  wire.get("/machine/workflows/:id/runs", handleWorkflowRunsList);
  wire.post("/machine/runs/:runId/complete", handleWorkflowRunComplete);
  wire.post("/machine/enrollments", handleEnrollmentCreate);
  wire.post("/machine/reference", handleReferenceUpsert);
  wire.post("/machine/audit-runs", handleAuditRunCreate);
  wire.post("/machine/onboarding/fire", handleOnboardingFire);
  wire.get("/machine/board", handleBoardDetections);
  wire.get("/machine/templates", handleTemplatesList);

  return wire;
}
