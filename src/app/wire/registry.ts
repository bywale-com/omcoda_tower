/**
 * Active ports for Register CT wire pass.
 * Real ports hit /wire API (Resend/Twilio/Postgres). Stand-ins used when VITE_WIRE_REAL=false
 * or for deferred externals (Meta, escrow, enrich, warmup counters).
 */
import type {
  AuditTrailPort,
  ConsentSilencePort,
  CrmOAuthPort,
  EscrowPort,
  EspMailerPort,
  HaltStorePort,
  IpPoolPort,
  MailerPort,
  MetaAdsPort,
  OtpStorePort,
  PrimaryStorePort,
  SendGatePort,
  SendingPoolPort,
  WarmupPort,
} from "./ports";
import { wireRealEnabled } from "./http";
import {
  standInAuditTrail,
  standInConsentSilence,
  standInCrmOAuth,
  standInEnrichCrawl,
  standInEscrow,
  standInEspMailer,
  standInHaltStore,
  standInIpPool,
  standInListUnsubscribe,
  standInMailer,
  standInMetaAds,
  standInOtpStore,
  standInPrimaryStore,
  standInSendGate,
  standInSendingPool,
  standInSmsApi,
  standInWarmup,
  type EnrichCrawlPort,
  type ListUnsubscribePort,
  type SmsApiPort,
} from "./standins";
import {
  realAuditTrail,
  realConsentSilence,
  realCrmOAuth,
  realEspMailer,
  realHaltStore,
  realPrimaryStore,
  realSendingPool,
  realSmsApi,
} from "./reals";
import { realOtpStore } from "./reals/otpStore";

const useReal = wireRealEnabled();

export type WirePorts = {
  mailer: MailerPort;
  otpStore: OtpStorePort;
  haltStore: HaltStorePort;
  auditTrail: AuditTrailPort;
  sendingPool: SendingPoolPort;
  warmup: WarmupPort;
  ipPool: IpPoolPort;
  sendGate: SendGatePort;
  espMailer: EspMailerPort;
  consentSilence: ConsentSilencePort;
  crmOAuth: CrmOAuthPort;
  metaAds: MetaAdsPort;
  escrow: EscrowPort;
  primaryStore: PrimaryStorePort;
  listUnsubscribe: ListUnsubscribePort;
  enrichCrawl: EnrichCrawlPort;
  smsApi: SmsApiPort;
};

export const wirePorts: WirePorts = {
  mailer: standInMailer, // OTP uses otpStore → /auth; CEM uses espMailer
  otpStore: useReal ? realOtpStore : standInOtpStore,
  haltStore: useReal ? realHaltStore : standInHaltStore,
  auditTrail: useReal ? realAuditTrail : standInAuditTrail,
  sendingPool: useReal ? realSendingPool : standInSendingPool,
  warmup: standInWarmup,
  ipPool: standInIpPool,
  sendGate: standInSendGate,
  espMailer: useReal ? realEspMailer : standInEspMailer,
  consentSilence: useReal ? realConsentSilence : standInConsentSilence,
  crmOAuth: useReal ? realCrmOAuth : standInCrmOAuth,
  metaAds: standInMetaAds,
  escrow: standInEscrow,
  primaryStore: useReal ? realPrimaryStore : standInPrimaryStore,
  listUnsubscribe: standInListUnsubscribe,
  enrichCrawl: standInEnrichCrawl,
  smsApi: useReal ? realSmsApi : standInSmsApi,
};

export const STANDIN_REGISTRY = [
  { id: "mailer", tag: "stand-in" as const, module: "src/app/wire/standins/mailer.ts" },
  {
    id: "otpStore",
    tag: useReal ? ("real" as const) : ("stand-in" as const),
    module: useReal ? "src/app/wire/reals/otpStore.ts" : "src/app/wire/standins/otpStore.ts",
  },
  {
    id: "haltStore",
    tag: useReal ? ("real" as const) : ("stand-in" as const),
    module: useReal ? "src/app/wire/reals/haltStore.ts" : "src/app/wire/standins/haltStore.ts",
  },
  {
    id: "auditTrail",
    tag: useReal ? ("real" as const) : ("stand-in" as const),
    module: useReal ? "src/app/wire/reals/auditTrail.ts" : "src/app/wire/standins/auditTrail.ts",
  },
  {
    id: "sendingPool",
    tag: useReal ? ("real" as const) : ("stand-in" as const),
    module: useReal ? "src/app/wire/reals/sendingPool.ts" : "src/app/wire/standins/sendingPool.ts",
  },
  { id: "warmup", tag: "stand-in" as const, module: "src/app/wire/standins/warmup.ts" },
  { id: "ipPool", tag: "stand-in" as const, module: "src/app/wire/standins/ipPool.ts" },
  { id: "sendGate", tag: "stand-in" as const, module: "src/app/wire/standins/sendGate.ts" },
  {
    id: "espMailer",
    tag: useReal ? ("real" as const) : ("stand-in" as const),
    module: useReal ? "src/app/wire/reals/espMailer.ts" : "src/app/wire/standins/espMailer.ts",
  },
  {
    id: "consentSilence",
    tag: useReal ? ("real" as const) : ("stand-in" as const),
    module: useReal
      ? "src/app/wire/reals/consentSilence.ts"
      : "src/app/wire/standins/consentSilence.ts",
  },
  {
    id: "crmOAuth",
    tag: useReal ? ("real" as const) : ("stand-in" as const),
    module: useReal ? "src/app/wire/reals/crmOAuth.ts" : "src/app/wire/standins/crmOAuth.ts",
  },
  { id: "metaAds", tag: "stand-in" as const, module: "src/app/wire/standins/metaAds.ts" },
  { id: "escrow", tag: "stand-in" as const, module: "src/app/wire/standins/escrow.ts" },
  {
    id: "primaryStore",
    tag: useReal ? ("real" as const) : ("stand-in" as const),
    module: useReal ? "src/app/wire/reals/primaryStore.ts" : "src/app/wire/standins/primaryStore.ts",
  },
  { id: "listUnsubscribe", tag: "stand-in" as const, module: "src/app/wire/standins/listUnsubscribe.ts" },
  { id: "enrichCrawl", tag: "stand-in" as const, module: "src/app/wire/standins/enrichCrawl.ts" },
  {
    id: "smsApi",
    tag: useReal ? ("real" as const) : ("stand-in" as const),
    module: useReal ? "src/app/wire/reals/smsApi.ts" : "src/app/wire/standins/smsApi.ts",
  },
];
