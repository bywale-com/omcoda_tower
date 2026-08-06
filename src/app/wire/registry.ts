/**
 * Active ports for Register CT wire pass.
 * All tagged stand-in until cutover swap.
 */
import type { AuditTrailPort, HaltStorePort, MailerPort, OtpStorePort } from "./ports";
import {
  standInAuditTrail,
  standInHaltStore,
  standInMailer,
  standInOtpStore,
} from "./standins";

export type WirePorts = {
  mailer: MailerPort;
  otpStore: OtpStorePort;
  haltStore: HaltStorePort;
  auditTrail: AuditTrailPort;
};

export const wirePorts: WirePorts = {
  mailer: standInMailer,
  otpStore: standInOtpStore,
  haltStore: standInHaltStore,
  auditTrail: standInAuditTrail,
};

export const STANDIN_REGISTRY = [
  { id: "mailer", tag: "stand-in" as const, module: "src/app/wire/standins/mailer.ts" },
  { id: "otpStore", tag: "stand-in" as const, module: "src/app/wire/standins/otpStore.ts" },
  { id: "haltStore", tag: "stand-in" as const, module: "src/app/wire/standins/haltStore.ts" },
  { id: "auditTrail", tag: "stand-in" as const, module: "src/app/wire/standins/auditTrail.ts" },
];
