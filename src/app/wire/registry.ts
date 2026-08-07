/**
 * Active ports for Register CT wire pass.
 * All tagged stand-in until cutover swap.
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
import {
  standInAuditTrail,
  standInConsentSilence,
  standInCrmOAuth,
  standInEscrow,
  standInEspMailer,
  standInHaltStore,
  standInIpPool,
  standInMailer,
  standInMetaAds,
  standInOtpStore,
  standInPrimaryStore,
  standInSendGate,
  standInSendingPool,
  standInWarmup,
} from "./standins";

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
};

export const wirePorts: WirePorts = {
  mailer: standInMailer,
  otpStore: standInOtpStore,
  haltStore: standInHaltStore,
  auditTrail: standInAuditTrail,
  sendingPool: standInSendingPool,
  warmup: standInWarmup,
  ipPool: standInIpPool,
  sendGate: standInSendGate,
  espMailer: standInEspMailer,
  consentSilence: standInConsentSilence,
  crmOAuth: standInCrmOAuth,
  metaAds: standInMetaAds,
  escrow: standInEscrow,
  primaryStore: standInPrimaryStore,
};

export const STANDIN_REGISTRY = [
  { id: "mailer", tag: "stand-in" as const, module: "src/app/wire/standins/mailer.ts" },
  { id: "otpStore", tag: "stand-in" as const, module: "src/app/wire/standins/otpStore.ts" },
  { id: "haltStore", tag: "stand-in" as const, module: "src/app/wire/standins/haltStore.ts" },
  { id: "auditTrail", tag: "stand-in" as const, module: "src/app/wire/standins/auditTrail.ts" },
  { id: "sendingPool", tag: "stand-in" as const, module: "src/app/wire/standins/sendingPool.ts" },
  { id: "warmup", tag: "stand-in" as const, module: "src/app/wire/standins/warmup.ts" },
  { id: "ipPool", tag: "stand-in" as const, module: "src/app/wire/standins/ipPool.ts" },
  { id: "sendGate", tag: "stand-in" as const, module: "src/app/wire/standins/sendGate.ts" },
  { id: "espMailer", tag: "stand-in" as const, module: "src/app/wire/standins/espMailer.ts" },
  { id: "consentSilence", tag: "stand-in" as const, module: "src/app/wire/standins/consentSilence.ts" },
  { id: "crmOAuth", tag: "stand-in" as const, module: "src/app/wire/standins/crmOAuth.ts" },
  { id: "metaAds", tag: "stand-in" as const, module: "src/app/wire/standins/metaAds.ts" },
  { id: "escrow", tag: "stand-in" as const, module: "src/app/wire/standins/escrow.ts" },
  { id: "primaryStore", tag: "stand-in" as const, module: "src/app/wire/standins/primaryStore.ts" },
];
