/**
 * Named fixtures for human-only / founder-input acts.
 * Stand-ins never auto-green these — see STANDIN-WIRING fixture honesty.
 */

export type FixtureKind = "by-design" | "by-provisioning" | "founder-input";

export type FixtureId =
  | "dns_spf_published"
  | "dns_dkim_published"
  | "dns_dmarc_published"
  | "dns_return_path_published"
  | "dns_ptr_published"
  | "sending_identity_ready"
  | "postmaster_enrolled"
  | "tcr_filed"
  /** Canadian SMS path — provisioned CA sending number (replaces US TCR gate). */
  | "ca_sms_number_provisioned"
  | "meta_business_verified"
  | "oauth_granted"
  | "halt_confirmed"
  | "counsel_policy_authored"
  | "counsel_mt_msb_cleared"
  | "payment_identity_provisioned"
  | "ad_export_authorized"
  /** Founder must supply real ESP/API account before cutover — not inventable. */
  | "esp_account_provisioned"
  | "sms_account_provisioned"
  | "meta_ad_account_linked";

export type FixtureMeta = {
  id: FixtureId;
  kind: FixtureKind;
  /** Who marks it in CT: platform ops (pool path), firm, or founder. */
  provider: "platform-ops" | "firm" | "founder" | "consultant" | "counsel";
  label: string;
  notes?: string;
};

export const FIXTURE_CATALOG: Record<FixtureId, FixtureMeta> = {
  dns_spf_published: {
    id: "dns_spf_published",
    kind: "by-provisioning",
    provider: "platform-ops",
    label: "SPF published",
    notes: "Pool path: platform ops on house zone. Custom-domain: firm (deferred).",
  },
  dns_dkim_published: {
    id: "dns_dkim_published",
    kind: "by-provisioning",
    provider: "platform-ops",
    label: "DKIM published",
  },
  dns_dmarc_published: {
    id: "dns_dmarc_published",
    kind: "by-provisioning",
    provider: "platform-ops",
    label: "DMARC published",
  },
  dns_return_path_published: {
    id: "dns_return_path_published",
    kind: "by-provisioning",
    provider: "platform-ops",
    label: "Return-Path published",
  },
  dns_ptr_published: {
    id: "dns_ptr_published",
    kind: "by-provisioning",
    provider: "founder",
    label: "PTR / rDNS published",
    notes: "Needed only for dedicated IP volume. Shared pool default skips.",
  },
  sending_identity_ready: {
    id: "sending_identity_ready",
    kind: "by-provisioning",
    provider: "platform-ops",
    label: "Sending identity ready (composite)",
    notes: "Derived — do not set directly; computed from DNS fixtures.",
  },
  postmaster_enrolled: {
    id: "postmaster_enrolled",
    kind: "by-provisioning",
    provider: "founder",
    label: "Postmaster / FBL enrolled",
  },
  tcr_filed: {
    id: "tcr_filed",
    kind: "by-provisioning",
    provider: "founder",
    label: "TCR / A2P filed (N/A — Canadian path)",
    notes:
      "US-only A2P 10DLC. Tower SMS is Canadian firms → Canadian numbers — do not gate CA send on this fixture.",
  },
  ca_sms_number_provisioned: {
    id: "ca_sms_number_provisioned",
    kind: "by-provisioning",
    provider: "founder",
    label: "Canadian SMS sending number provisioned",
    notes: "Replaces tcr_filed for the Canadian SMS path. CASL consent is a separate send-gate check.",
  },
  meta_business_verified: {
    id: "meta_business_verified",
    kind: "by-provisioning",
    provider: "founder",
    label: "Meta Business verified",
    notes: "Ads go-live deferred; chip contract only.",
  },
  oauth_granted: {
    id: "oauth_granted",
    kind: "by-design",
    provider: "firm",
    label: "CRM OAuth granted",
  },
  halt_confirmed: {
    id: "halt_confirmed",
    kind: "by-design",
    provider: "consultant",
    label: "Halt confirmed",
  },
  counsel_policy_authored: {
    id: "counsel_policy_authored",
    kind: "by-design",
    provider: "counsel",
    label: "Counsel silence / CASL policy authored",
  },
  counsel_mt_msb_cleared: {
    id: "counsel_mt_msb_cleared",
    kind: "by-design",
    provider: "counsel",
    label: "Counsel MT/MSB cleared",
  },
  payment_identity_provisioned: {
    id: "payment_identity_provisioned",
    kind: "by-provisioning",
    provider: "founder",
    label: "Payment / KYB identity provisioned",
  },
  ad_export_authorized: {
    id: "ad_export_authorized",
    kind: "by-design",
    provider: "founder",
    label: "Ad-platform export authorized",
  },
  esp_account_provisioned: {
    id: "esp_account_provisioned",
    kind: "founder-input",
    provider: "founder",
    label: "ESP account provisioned (Resend-class)",
    notes: "Real API keys / domain on provider. Stand-in sinks CEMs until set; cutover still needs real account.",
  },
  sms_account_provisioned: {
    id: "sms_account_provisioned",
    kind: "founder-input",
    provider: "founder",
    label: "SMS account provisioned (Twilio-class)",
  },
  meta_ad_account_linked: {
    id: "meta_ad_account_linked",
    kind: "founder-input",
    provider: "founder",
    label: "Meta ad account linked",
    notes: "Deferred go-live; fixture for account edge only.",
  },
};

/** DNS members that compose sending_identity_ready on the pool path (shared IP — no PTR). */
export const POOL_DNS_FIXTURES: FixtureId[] = [
  "dns_spf_published",
  "dns_dkim_published",
  "dns_dmarc_published",
  "dns_return_path_published",
];

export const FOUNDER_INPUT_FIXTURES: FixtureId[] = [
  "esp_account_provisioned",
  "sms_account_provisioned",
  "ca_sms_number_provisioned",
  "meta_ad_account_linked",
  "dns_ptr_published",
  "postmaster_enrolled",
  // tcr_filed intentionally omitted — N/A for Canadian path
  "meta_business_verified",
  "payment_identity_provisioned",
  "ad_export_authorized",
];
