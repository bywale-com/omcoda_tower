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
