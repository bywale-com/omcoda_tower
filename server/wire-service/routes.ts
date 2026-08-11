import { Hono } from "hono";
import { getWireCapabilities } from "./capabilities.ts";
import { FirmScopeError } from "./sessionFirm.ts";
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
  handleActiveAttemptsList,
  handleAuditRunCreate,
  handleAttemptCriteriaList,
  handleAttemptCriteriaUpsert,
  handleBoardDetections,
  handleBindingUpsert,
  handleCampaignStateGet,
  handleCampaignStatePost,
  handleConsultantsList,
  handleContactRecordsList,
  handleChannelOrderList,
  handleChannelOrderUpsert,
  handleCohortScoringList,
  handleCohortScoringUpsert,
  handleEligibilityPathwayUpsert,
  handleEligibilityPathwaysList,
  handleEligibilityPipelineList,
  handleEligibilityPipelineUpsert,
  handleEngagementRecordsList,
  handleEnrollmentCreate,
  handleEvaluationPinGet,
  handleEvaluationPinPut,
  handleFactWriteback,
  handleFactWritebacksList,
  handleFieldClassRoutingList,
  handleFieldClassRoutingUpsert,
  handleMachineEvent,
  handleMachineHealth,
  handleMachineProvision,
  handleMachineTick,
  handleMeetingBook,
  handleMeetingsList,
  handleMetricsThresholdsList,
  handleMetricsThresholdsUpsert,
  handleMissingFactSignalCreate,
  handleMissingFactSignalsList,
  handleMotionPrecedenceList,
  handleMotionPrecedenceUpsert,
  handleOnboardingFire,
  handlePauseWorkflow,
  handlePhaseOrderList,
  handlePhaseOrderUpsert,
  handlePreparedWorkspaceUpsert,
  handlePreparedWorkspacesList,
  handleReachabilityChecksList,
  handleReachabilityChecksUpsert,
  handleReferenceUpsert,
  handleReferenceVersionsList,
  handleTemplateUpsert,
  handleTemplatesList,
  handleWebhookTrigger,
  handleWorkflowActivate,
  handleWorkflowCreate,
  handleWorkflowList,
  handleWorkflowRunComplete,
  handleWorkflowRunStart,
  handleWorkflowRunsList,
} from "./machine.ts";

export function createWireRoutes(): Hono {
  const wire = new Hono();

  wire.onError((err, c) => {
    if (err instanceof FirmScopeError) {
      return c.json({ ok: false, error: err.message }, err.status as 401 | 403);
    }
    console.error("wire.error", err);
    return c.json({ ok: false, error: String(err) }, 500);
  });

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
  // GET for Vercel Cron; POST for manual/ops
  wire.get("/machine/tick", handleMachineTick);
  wire.post("/machine/tick", handleMachineTick);
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
  wire.put("/machine/templates/:id", handleTemplateUpsert);
  wire.post("/machine/bindings", handleBindingUpsert);
  wire.get("/machine/rules/attempt-criteria", handleAttemptCriteriaList);
  wire.put("/machine/rules/attempt-criteria/:id", handleAttemptCriteriaUpsert);
  wire.get("/machine/seq/channel-order", handleChannelOrderList);
  wire.put("/machine/seq/channel-order", handleChannelOrderUpsert);
  wire.get("/machine/eligibility-pipeline", handleEligibilityPipelineList);
  wire.put("/machine/eligibility-pipeline", handleEligibilityPipelineUpsert);
  wire.get("/machine/rules/eligibility-pathways", handleEligibilityPathwaysList);
  wire.put("/machine/rules/eligibility-pathways/:id", handleEligibilityPathwayUpsert);
  wire.get("/machine/rules/motion-precedence", handleMotionPrecedenceList);
  wire.put("/machine/rules/motion-precedence/:id", handleMotionPrecedenceUpsert);
  wire.get("/machine/rules/field-class-routing", handleFieldClassRoutingList);
  wire.put("/machine/rules/field-class-routing/:id", handleFieldClassRoutingUpsert);
  wire.get("/machine/rules/cohort-scoring", handleCohortScoringList);
  wire.put("/machine/rules/cohort-scoring/:id", handleCohortScoringUpsert);
  wire.get("/machine/rules/metrics-thresholds", handleMetricsThresholdsList);
  wire.put("/machine/rules/metrics-thresholds/:id", handleMetricsThresholdsUpsert);
  wire.get("/machine/rules/reachability-checks", handleReachabilityChecksList);
  wire.put("/machine/rules/reachability-checks/:id", handleReachabilityChecksUpsert);
  wire.get("/machine/seq/phase-order", handlePhaseOrderList);
  wire.put("/machine/seq/phase-order", handlePhaseOrderUpsert);
  wire.post("/machine/fact-writebacks", handleFactWriteback);
  wire.get("/machine/fact-writebacks", handleFactWritebacksList);
  wire.get("/machine/missing-fact-signals", handleMissingFactSignalsList);
  wire.post("/machine/missing-fact-signals", handleMissingFactSignalCreate);
  wire.get("/machine/prepared-workspaces", handlePreparedWorkspacesList);
  wire.put("/machine/prepared-workspaces/:id", handlePreparedWorkspaceUpsert);
  wire.post("/machine/prepared-workspaces", handlePreparedWorkspaceUpsert);
  wire.get("/machine/active-attempts", handleActiveAttemptsList);
  wire.get("/machine/engagement-records", handleEngagementRecordsList);
  wire.get("/machine/reference-versions", handleReferenceVersionsList);
  wire.get("/machine/evaluation-pins/:packId", handleEvaluationPinGet);
  wire.put("/machine/evaluation-pins/:packId", handleEvaluationPinPut);
  wire.get("/machine/campaign-state", handleCampaignStateGet);
  wire.post("/machine/campaign-state", handleCampaignStatePost);
  wire.get("/machine/contact-records", handleContactRecordsList);
  wire.get("/machine/consultants", handleConsultantsList);
  wire.post("/machine/meetings", handleMeetingBook);
  wire.get("/machine/meetings", handleMeetingsList);
  wire.post("/machine/provision", handleMachineProvision);
  wire.post("/machine/events", handleMachineEvent);
  wire.post("/hook/:webhookId", handleWebhookTrigger);

  return wire;
}
