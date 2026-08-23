/**
 * Ports the app calls. Stand-ins implement these; real providers swap in later.
 */

export type StandInTag = "stand-in";

export type MailerSendInput = {
  to: string;
  subject: string;
  bodyText: string;
  purpose: "otp" | "cem" | "system";
};

export type MailerSendResult = {
  messageId: string;
  acceptedAt: string;
};

export type MailerPort = {
  tag: StandInTag | "real";
  send(input: MailerSendInput): Promise<MailerSendResult>;
};

export type OtpIssueInput = {
  email: string;
};

export type OtpIssueResult = {
  challengeId: string;
  /** Dev/stand-in only — never present on real providers. */
  debugCode?: string;
  expiresAt: string;
};

export type OtpVerifyInput = {
  challengeId: string;
  code: string;
};

export type OtpVerifyResult =
  | { ok: true; sessionToken: string; firmId?: string; userId?: string; email?: string }
  | { ok: false; reason: "expired" | "mismatch" | "unknown-challenge" | "locked" };

export type OtpStorePort = {
  tag: StandInTag | "real";
  issue(input: OtpIssueInput): Promise<OtpIssueResult>;
  verify(input: OtpVerifyInput): Promise<OtpVerifyResult>;
};

export type HaltScope = "contact" | "firm-book";

export type HaltCommitInput = {
  consultantId: string;
  contactId?: string;
  firmId: string;
  scope: HaltScope;
  reason?: string;
};

export type HaltRecord = {
  id: string;
  consultantId: string;
  contactId?: string;
  firmId: string;
  scope: HaltScope;
  reason?: string;
  haltedAt: string;
  liftedAt?: string;
};

export type HaltStorePort = {
  tag: StandInTag | "real";
  commit(input: HaltCommitInput): Promise<HaltRecord>;
  lift(haltId: string): Promise<HaltRecord | null>;
  listActive(firmId?: string): Promise<HaltRecord[]>;
  isContactHalted(contactId: string): Promise<boolean>;
  isFirmBookHalted(firmId: string): Promise<boolean>;
};

export type AuditAppendInput = {
  actorId: string;
  kind: string;
  subjectType: string;
  subjectId: string;
  payload?: Record<string, unknown>;
};

export type AuditEvent = {
  id: string;
  at: string;
  actorId: string;
  kind: string;
  subjectType: string;
  subjectId: string;
  payload?: Record<string, unknown>;
};

export type AuditTrailPort = {
  tag: StandInTag | "real";
  append(input: AuditAppendInput): Promise<AuditEvent>;
  list(filter?: { subjectId?: string; kind?: string }): Promise<AuditEvent[]>;
};

/* ─── Pass B: pool-send + gates + CRM + Meta chips ─── */

export type SendDenyReason =
  | "auth"
  | "throttle"
  | "policy"
  | "consent"
  | "silence"
  | "suppression"
  | "halt"
  | "posture"
  | "sending-identity"
  | "warmup"
  | "quarantine"
  | "oauth-revoked"
  | "founder-esp-missing";

export type SendGateDecideInput = {
  firmId: string;
  contactId?: string;
  channel: "email" | "sms";
  purpose: "otp" | "cem" | "system" | "opt-in" | "nudge" | "reactivation";
  posture: "Armed" | "Active" | "Idle";
};

export type SendGateDecision =
  | { allow: true; reasons: [] }
  | { allow: false; reasons: SendDenyReason[] };

export type SendGatePort = {
  tag: StandInTag | "real";
  decide(input: SendGateDecideInput): Promise<SendGateDecision>;
  /** Snapshot of deny chips for CT Send gates panel. */
  chips(firmId: string): Promise<
    Array<{ reason: SendDenyReason; label: string; blocking: boolean; advisory?: boolean }>
  >;
};

export type PoolSubdomain = {
  firmId: string;
  subdomain: string;
  fullDomain: string;
  path: "pool";
  allocatedAt: string;
  identityId: string;
};

export type SendingPoolPort = {
  tag: StandInTag | "real";
  allocate(firmId: string, slug: string): Promise<PoolSubdomain>;
  get(firmId: string): Promise<PoolSubdomain | null>;
  list(): Promise<PoolSubdomain[]>;
  authChips(firmId: string): Promise<
    Array<{ id: string; label: string; present: boolean; fixture: string }>
  >;
  /** Platform-ops marks pool DNS fixtures for firm (explicit CT action). */
  markPlatformDnsPublished(firmId: string): Promise<void>;
};

export type WarmupStage = "cold" | "ramp" | "steady" | "hold" | "re-warmup";

export type WarmupState = {
  firmId: string;
  stage: WarmupStage;
  dailyCap: number;
  consumedToday: number;
  remaining: number;
};

export type WarmupPort = {
  tag: StandInTag | "real";
  get(firmId: string): Promise<WarmupState>;
  recordSend(firmId: string): Promise<WarmupState>;
  setStage(firmId: string, stage: WarmupStage): Promise<WarmupState>;
};

export type IpPoolTier = "shared" | "dedicated";

export type IpPoolPort = {
  tag: StandInTag | "real";
  getTier(firmId: string): Promise<{ tier: IpPoolTier; ptrReady: boolean }>;
  assignShared(firmId: string): Promise<void>;
};

export type EspDeny = "auth" | "throttle" | "policy";

export type EspSendInput = {
  to: string;
  from: string;
  subject: string;
  bodyText: string;
  firmId: string;
  sendingIdentityId: string;
  contactId?: string;
  purpose: "cem" | "opt-in" | "nudge" | "reactivation" | "system";
  /** Force a deny path for CT demos. */
  forceDeny?: EspDeny;
};

export type EspSendResult =
  | { ok: true; messageId: string; acceptedAt: string }
  | { ok: false; deny: EspDeny; detail?: string };

export type DeliveryEventClass =
  | "accepted"
  | "deferred"
  | "delivered"
  | "bounce_hard"
  | "bounce_soft"
  | "complaint"
  | "rejected";

export type MessagingEvent = {
  id: string;
  at: string;
  firmId: string;
  messageId: string;
  class: DeliveryEventClass;
  contactId?: string;
};

export type EspMailerPort = {
  tag: StandInTag | "real";
  send(input: EspSendInput): Promise<EspSendResult>;
  injectEvent(event: Omit<MessagingEvent, "id" | "at"> & { at?: string }): Promise<MessagingEvent>;
  listEvents(firmId?: string): Promise<MessagingEvent[]>;
};

export type ConsentBasis = "express" | "implied" | "none";

export type ConsentSilencePort = {
  tag: StandInTag | "real";
  setConsent(contactId: string, firmId: string, basis: ConsentBasis): Promise<void>;
  silence(contactId: string, firmId: string, source: string): Promise<void>;
  get(contactId: string): Promise<{
    basis: ConsentBasis;
    silenced: boolean;
  }>;
};

export type CrmGrantState = {
  firmId: string;
  granted: boolean;
  /** Gap fix: revoked flag beside grant. */
  revoked: boolean;
  scopes: string[];
  grantedAt?: string;
  revokedAt?: string;
};

export type CrmOAuthPort = {
  tag: StandInTag | "real";
  /** Records intentional firm grant — fixture oauth_granted. */
  grant(firmId: string, scopes?: string[]): Promise<CrmGrantState>;
  revoke(firmId: string): Promise<CrmGrantState>;
  get(firmId: string): Promise<CrmGrantState>;
};

export type MetaReviewState = "draft" | "in_review" | "approved" | "rejected";
export type MetaDeliveryState = "not_started" | "scheduled" | "active" | "paused" | "ended";

export type MetaCampaignState = {
  campaignId: string;
  firmId: string;
  review: MetaReviewState;
  delivery: MetaDeliveryState;
  outboundReady: boolean;
};

export type MetaAdsPort = {
  tag: StandInTag | "real";
  /** Chip contract only — go-live deferred. */
  getCampaign(firmId: string, campaignId?: string): Promise<MetaCampaignState>;
  setReview(firmId: string, review: MetaReviewState): Promise<MetaCampaignState>;
  setDelivery(firmId: string, delivery: MetaDeliveryState): Promise<MetaCampaignState>;
};

export type EscrowStatus = "none" | "pending_accept" | "held" | "failed_hold" | "released";

export type EscrowPort = {
  tag: StandInTag | "real";
  get(firmId: string): Promise<{ status: EscrowStatus; counselGate: "pending" | "cleared" | "blocked" }>;
  /** Founder-input path — requires payment_identity_provisioned fixture for held. */
  hold(firmId: string): Promise<{ status: EscrowStatus }>;
};

export type PrimaryStorePort = {
  tag: StandInTag | "real";
  get<T>(collection: string, id: string): Promise<T | null>;
  put<T extends { id: string }>(collection: string, row: T): Promise<T>;
  list<T>(collection: string): Promise<T[]>;
};

/* ─── Machine tables (System Map frozen set) ─── */

export type MachineApiPort = {
  tag: StandInTag | "real";
  health(): Promise<{ ok: boolean; machineTables: boolean }>;
  listWorkflows(): Promise<import("./machineTypes").WorkflowRow[]>;
  createWorkflow(input: {
    id?: string;
    name: string;
    target?: string;
    graph?: unknown;
    audienceScope?: "every_firm" | "select_from";
    audienceContactIds?: string[];
  }): Promise<{ id: string; status: string; name: string; target: string }>;
  activateWorkflow(
    workflowId: string,
  ): Promise<{
    workflowId: string;
    status: string;
    transition?: string;
    triggersMaterialized?: number;
  }>;
  pauseWorkflow(workflowId: string): Promise<{ workflowId: string; status: string }>;
  startRun(
    workflowId: string,
    triggerLabel?: string,
    opts?: { contactIds?: string[]; payload?: Record<string, unknown>; untilNodeId?: string },
  ): Promise<{
    id: string;
    workflowId: string;
    status: string;
    nodeStatus?: Record<string, unknown>;
    enrollments?: string[];
    error?: string;
  }>;
  completeRun(
    runId: string,
    body?: { status?: string; nodeStatus?: unknown; counts?: unknown },
  ): Promise<{ id: string; status: string }>;
  listRuns(workflowId: string): Promise<import("./machineTypes").WorkflowRunRow[]>;
  createEnrollment(input: {
    contactId: string;
    agentRef: string;
    sequenceId?: string;
    workflowRunId?: string;
    payload?: unknown;
  }): Promise<{ id: string; enrolledAt: string }>;
  upsertReference(input: {
    id?: string;
    key: string;
    payload: unknown;
    version?: number;
    contactIds?: string[];
  }): Promise<{ referenceId: string; cascade: unknown[]; workflowsFired?: unknown[] }>;
  createAuditRun(input: {
    importIds?: string[];
    contactIds?: Array<{ id: string; email?: string; phone?: string; name?: string }>;
  }): Promise<
    import("./machineTypes").AuditRunRow & {
      contacts: number;
      verdicts?: import("./machineTypes").AuditContactVerdict[];
    }
  >;
  listAuditRuns(): Promise<import("./machineTypes").AuditRunRow[]>;
  getAuditRun(id: string): Promise<{
    run: import("./machineTypes").AuditRunRow;
    verdicts: import("./machineTypes").AuditContactVerdict[];
  }>;
  importContactBook(input: {
    filename?: string;
    source?: "file" | "crm" | "assisted";
    contacts: Array<{ id?: string; email?: string; phone?: string; name?: string }>;
  }): Promise<{
    import_batch_id: string;
    imported: number;
    writes?: Array<{ table: string; id: string; contact_id?: string | null }>;
    workflowsFired?: unknown[];
  }>;
  getEventTestContract(eventName: string): Promise<import("../data/eventTestContract").EventTestHandle | null>;
  fireOnboarding(): Promise<{
    skipped?: boolean;
    enrollments?: number;
    agentRef?: string;
  }>;
  boardDetections(): Promise<{
    eligibilityResults: import("./machineTypes").EligibilityResultRow[];
    signals: import("./machineTypes").SignalRow[];
    motionDecisions: import("./machineTypes").MotionDecisionRow[];
    enrollments: import("./machineTypes").EnrollmentRow[];
  }>;
  listTemplates(): Promise<{
    templates: import("./machineTypes").SequenceTemplateRow[];
    bindings: import("./machineTypes").FirmSequenceBindingRow[];
  }>;
  upsertTemplate(input: {
    id: string;
    sequenceClass: string;
    label?: string;
    cells: unknown[];
    variant?: string;
  }): Promise<{ id: string; cells: number; table: string }>;
  upsertBinding(input: {
    sequenceClass: string;
    templateId: string;
    variableBindings?: Record<string, unknown>;
    isDefault?: boolean;
    overrideAttempt?: boolean;
    overrideChannel?: boolean;
    overrideContent?: boolean;
    overrideSequencing?: boolean;
  }): Promise<{ id: string; firmId?: string; table?: string; sequenceClass?: string; templateId?: string }>;
  listSequenceHousing(
    sequenceId: string,
  ): Promise<{ sequenceId: string; campaigns: import("./machineTypes").CampaignHousingRow[] }>;
  saveSequenceHousing(
    sequenceId: string,
    campaigns: import("./machineTypes").CampaignHousingDraft[],
  ): Promise<{ sequenceId: string; campaigns: import("./machineTypes").CampaignHousingRow[] }>;
  getAttemptCycle(sequenceId?: string | null): Promise<{
    cycle: import("./machineTypes").AttemptCycleRow;
  }>;
  saveAttemptCycle(input: {
    sequenceId?: string | null;
    attemptCount?: number;
    waitAfterLastFailedSeconds?: number;
    nthException?: Record<string, unknown>;
  }): Promise<{ cycle: import("./machineTypes").AttemptCycleRow }>;
  enrollSequenceContacts(
    sequenceId: string,
    input: {
      scope?: "every_firm" | "select_from";
      contactIds?: string[];
      agentRef?: string;
    },
  ): Promise<{ sequenceId: string; scope: string; enrolled: number; blocked: number; ids: string[] }>;
  upsertRulePack(input: {
    id?: string;
    workflowId?: string;
    name: string;
    families?: unknown;
    customJson?: unknown;
    namedCode?: string | null;
    namedCodeOn?: boolean;
    enabled?: boolean;
  }): Promise<{ id: string; table: string }>;
  listAttemptCriteria(): Promise<import("./machineTypes").AttemptCriteriaRow[]>;
  upsertAttemptCriteria(
    id: string,
    patch: {
      label?: string;
      enabled?: boolean;
      threshold?: number | null;
      thresholdUnit?: string | null;
      whenClause?: string | null;
      conditionClause?: string | null;
      setValue?: string | null;
      ord?: number;
      sequenceId?: string | null;
      channelToken?: "text" | "email" | "call" | "form" | null;
    },
  ): Promise<import("./machineTypes").AttemptCriteriaRow>;
  listSeqChannelRules(sequenceId?: string | null): Promise<import("./machineTypes").SeqChannelRulesRow[]>;
  saveSeqChannelRules(input: {
    sequenceId?: string | null;
    rules: Array<{ token: "text" | "email" | "call"; withinSeconds: number }>;
  }): Promise<import("./machineTypes").SeqChannelRulesRow[]>;
  listChannelOrder(): Promise<import("./machineTypes").ChannelOwnershipOrderRow[]>;
  upsertChannelOrder(
    order: Array<{ id: string; token?: string; label?: string; ord: number }>,
  ): Promise<import("./machineTypes").ChannelOwnershipOrderRow[]>;
  fireEvent(input: {
    eventName: string;
    payload?: Record<string, unknown>;
    contactIds?: string[];
  }): Promise<{ eventName: string; workflowsFired: unknown[] }>;
  /** Ordered stages from seq_eligibility_pipeline (Automations Settings). */
  listEligibilityPipeline(): Promise<import("./machineTypes").EligibilityPipelineRow[]>;
  upsertEligibilityPipeline(
    stages: Array<{ id: string; token?: string; label?: string; ord: number }>,
  ): Promise<import("./machineTypes").EligibilityPipelineRow[]>;
  listEligibilityPathways(): Promise<import("./machineTypes").EligibilityPathwayRow[]>;
  upsertEligibilityPathway(
    id: string,
    patch: { enabled?: boolean; label?: string; ord?: number },
  ): Promise<import("./machineTypes").EligibilityPathwayRow>;
  listMotionPrecedence(): Promise<import("./machineTypes").MotionPrecedenceRow[]>;
  upsertMotionPrecedence(
    id: string,
    patch: { enabled?: boolean; label?: string; ord?: number },
  ): Promise<import("./machineTypes").MotionPrecedenceRow>;
  listFieldClassRouting(): Promise<import("./machineTypes").FieldClassRoutingRow[]>;
  upsertFieldClassRouting(
    id: string,
    patch: {
      enabled?: boolean;
      label?: string;
      ord?: number;
      whenClause?: string | null;
      conditionClause?: string | null;
      setValue?: string | null;
    },
  ): Promise<import("./machineTypes").FieldClassRoutingRow>;
  listCohortScoring(): Promise<import("./machineTypes").CohortScoringRow[]>;
  upsertCohortScoring(
    id: string,
    patch: {
      enabled?: boolean;
      label?: string;
      ord?: number;
      setValue?: string | null;
      whenClause?: string | null;
      conditionClause?: string | null;
    },
  ): Promise<import("./machineTypes").CohortScoringRow>;
  listMetricsThresholds(): Promise<import("./machineTypes").MetricsThresholdRow[]>;
  upsertMetricsThreshold(
    id: string,
    patch: {
      enabled?: boolean;
      label?: string;
      ord?: number;
      threshold?: number | null;
      setValue?: string | null;
    },
  ): Promise<import("./machineTypes").MetricsThresholdRow>;
  listReachabilityChecks(): Promise<import("./machineTypes").ReachabilityCheckRow[]>;
  upsertReachabilityCheck(
    id: string,
    patch: {
      enabled?: boolean;
      label?: string;
      ord?: number;
      whenClause?: string | null;
      conditionClause?: string | null;
      setValue?: string | null;
    },
  ): Promise<import("./machineTypes").ReachabilityCheckRow>;
  listPhaseOrder(): Promise<import("./machineTypes").PhaseOrderRow[]>;
  upsertPhaseOrder(
    order: Array<{ id: string; token?: string; label?: string; ord: number }>,
  ): Promise<import("./machineTypes").PhaseOrderRow[]>;
  writeFact(input: {
    contactId: string;
    fieldKey: string;
    value: unknown;
    source?: string;
    missingFieldKeys?: string[];
    formRef?: string;
  }): Promise<import("./machineTypes").FactWritebackResult>;
  listFactWritebacks(contactId?: string): Promise<import("./machineTypes").FactWritebackRow[]>;
  listMissingFactSignals(contactId?: string): Promise<import("./machineTypes").MissingFactSignalRow[]>;
  signalMissingFact(input: {
    contactId: string;
    fieldKey: string;
  }): Promise<{ id: string; contactId: string; fieldKey: string }>;
  listPreparedWorkspaces(): Promise<import("./machineTypes").PreparedWorkspaceRow[]>;
  upsertPreparedWorkspace(input: {
    id?: string;
    status?: string;
    body?: Record<string, unknown>;
  }): Promise<import("./machineTypes").PreparedWorkspaceRow>;
  listActiveAttempts(): Promise<import("./machineTypes").ActiveAttemptRow[]>;
  listEngagementRecords(): Promise<import("./machineTypes").EngagementRecordRow[]>;
  listReferenceVersions(): Promise<import("./machineTypes").ReferenceVersionRow[]>;
  getEvaluationPin(packId: string): Promise<{
    packId: string;
    referenceVersionId: string | null;
    rulesetId: string | null;
    missing?: boolean;
  }>;
  putEvaluationPin(
    packId: string,
    pin: { referenceVersionId: string; rulesetId: string },
  ): Promise<import("./machineTypes").EvaluationPin & { table?: string; id?: string }>;
  getCampaignState(): Promise<{
    firmId: string;
    state: import("./machineTypes").CampaignState;
    missing?: boolean;
  }>;
  setCampaignState(
    state: import("./machineTypes").CampaignState,
  ): Promise<{ firmId: string; state: import("./machineTypes").CampaignState }>;
  provisionFirm(input: {
    firmId?: string;
    firmName: string;
    email: string;
    website?: string;
    role?: string;
  }): Promise<import("./machineTypes").ProvisionResult>;
  /** Mint (+ optional email) a one-time `/a/<token>` access link. */
  issueAccessInvite(input: {
    email: string;
    sendEmail?: boolean;
  }): Promise<{
    ok: boolean;
    accessPath: string;
    expiresAt: string;
    emailed: boolean;
  }>;
  listContactRecords(opts?: { scope?: "session" | "every_firm" }): Promise<
    Array<{
      id: string;
      firmId: string;
      email: string | null;
      phone: string | null;
      name: string | null;
      notes?: string | null;
      tags?: string[];
      firmName?: string | null;
      createdAt?: string | null;
      /** Latest reachability_verdicts.verdict. Null if Audit has not written. A34. */
      reachability?: "reachable" | "partial" | "unreachable" | null;
      /** sequence_ready.ready. Null if Audit has not written. A34. */
      sequenceReady?: boolean | null;
    }>
  >;
  /** Platform admin: consultants for Consultant ▾ view-as dropdown. */
  listConsultants(): Promise<
    Array<{
      userId: string;
      email: string;
      firmId: string;
      firmName: string;
    }>
  >;
  /** Platform admin: this firm's book minus workspace opt-out. Token is not required. */
  listContactWorkspaces(firmId?: string): Promise<
    Array<{ id: string; name: string | null; email: string | null }>
  >;
  loadContactWorkspace: (
    contactId: string,
    opts?: { campaignId?: string },
  ) => Promise<import("./contactSeatTypes").ContactSeatPayload | import("./contactSeatTypes").ContactSeatRefuse>;
  consentContactWorkspace: (
    contactId: string,
    action: "agree" | "ignore",
  ) => Promise<import("./contactSeatTypes").ContactSeatPayload | import("./contactSeatTypes").ContactSeatRefuse>;
  silenceContactWorkspace: (
    contactId: string,
  ) => Promise<import("./contactSeatTypes").ContactSeatPayload | import("./contactSeatTypes").ContactSeatRefuse>;
  submitContactWorkspaceFacts: (
    contactId: string,
    answers: Array<{ fieldKey: string; value: unknown }>,
  ) => Promise<import("./contactSeatTypes").ContactSeatPayload | import("./contactSeatTypes").ContactSeatRefuse>;
  bookContactWorkspace: (
    contactId: string,
    slot: string,
  ) => Promise<import("./contactSeatTypes").ContactSeatPayload | import("./contactSeatTypes").ContactSeatRefuse>;
  putContactWorkspaceUpload: (
    contactId: string,
    input: {
      origin: "kind" | "custom" | "question" | "any";
      kind?: string | null;
      fieldKey?: string | null;
      bodyText?: string | null;
      fileName?: string | null;
    },
  ) => Promise<import("./contactSeatTypes").ContactSeatPayload | import("./contactSeatTypes").ContactSeatRefuse>;
  bookMeeting(input: {
    contactId: string;
    slot?: string;
    consultantName?: string;
    source?: string;
    contactName?: string;
  }): Promise<{
    id: string;
    firmId: string;
    contactId: string;
    slot: string | null;
    attemptsStopped: number;
    table: string;
  }>;
  listMeetings(): Promise<{
    firmId: string;
    count: number;
    meetings: Array<{
      id: string;
      firmId: string;
      contactId: string;
      bookedAt: string;
      source: string;
      slot: string | null;
      consultantName: string | null;
    }>;
  }>;
  listContactUploadKinds: (firmId?: string) => Promise<{ kinds: string[] }>;
  loadContactSeat: (
    token: string,
    opts?: { campaignId?: string },
  ) => Promise<import("./contactSeatTypes").ContactSeatPayload | import("./contactSeatTypes").ContactSeatRefuse>;
  consentContactSeat: (
    token: string,
    action: "agree" | "ignore",
  ) => Promise<import("./contactSeatTypes").ContactSeatPayload | import("./contactSeatTypes").ContactSeatRefuse>;
  silenceContactSeat: (
    token: string,
  ) => Promise<import("./contactSeatTypes").ContactSeatPayload | import("./contactSeatTypes").ContactSeatRefuse>;
  submitContactSeatFacts: (
    token: string,
    answers: Array<{ fieldKey: string; value: unknown }>,
  ) => Promise<import("./contactSeatTypes").ContactSeatPayload | import("./contactSeatTypes").ContactSeatRefuse>;
  bookContactSeat: (
    token: string,
    slot: string,
  ) => Promise<import("./contactSeatTypes").ContactSeatPayload | import("./contactSeatTypes").ContactSeatRefuse>;
  putContactSeatUpload: (
    token: string,
    input: {
      origin: "kind" | "custom" | "question" | "any";
      kind?: string | null;
      fieldKey?: string | null;
      bodyText?: string | null;
      fileName?: string | null;
    },
  ) => Promise<import("./contactSeatTypes").ContactSeatPayload | import("./contactSeatTypes").ContactSeatRefuse>;
};
