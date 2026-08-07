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
  | { ok: true; sessionToken: string }
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
