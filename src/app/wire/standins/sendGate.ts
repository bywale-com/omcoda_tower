import { isFixturePresent, isSendingIdentityReady } from "../fixtures/store";
import type { SendDenyReason, SendGateDecideInput, SendGatePort } from "../ports";
import { standInConsentSilence } from "./consentSilence";
import { standInCrmOAuth } from "./crmOAuth";
import { standInHaltStore } from "./haltStore";
import { standInWarmup } from "./warmup";

const LABELS: Record<SendDenyReason, string> = {
  auth: "Domain authentication not ready",
  throttle: "Warmup / throttle remaining",
  policy: "ESP policy reject",
  consent: "Consent basis missing",
  silence: "Silenced",
  suppression: "Suppressed",
  halt: "Halt active",
  posture: "Posture not Active",
  "sending-identity": "Sending identity not ready",
  warmup: "Warmup hold / cold blast blocked",
  quarantine: "Reputation quarantined",
  "oauth-revoked": "CRM grant revoked",
  "founder-esp-missing": "ESP account not provisioned (founder input)",
};

const quarantined = new Set<string>();
let policyForced = false;

export function setFirmQuarantined(firmId: string, on: boolean): void {
  if (on) quarantined.add(firmId);
  else quarantined.delete(firmId);
}

/** CT helper: surface ESP policy deny chip (gap fix for ext-esp-mailer Out). */
export function setPolicyDenyForced(on: boolean): void {
  policyForced = on;
}

async function collectReasons(input: SendGateDecideInput): Promise<SendDenyReason[]> {
  const reasons: SendDenyReason[] = [];

  if (policyForced) reasons.push("policy");

  if (!isSendingIdentityReady(input.firmId)) {
    reasons.push("sending-identity");
    reasons.push("auth");
  }

  const warmup = await standInWarmup.get(input.firmId);
  if (warmup.stage === "hold" || warmup.stage === "re-warmup") reasons.push("warmup");
  if (warmup.remaining <= 0) reasons.push("throttle");

  if (quarantined.has(input.firmId)) reasons.push("quarantine");

  if (input.posture !== "Active" && input.purpose !== "otp" && input.purpose !== "system") {
    reasons.push("posture");
  }

  if (await standInHaltStore.isFirmBookHalted(input.firmId)) reasons.push("halt");
  if (input.contactId && (await standInHaltStore.isContactHalted(input.contactId))) {
    reasons.push("halt");
  }

  if (
    input.contactId &&
    (input.purpose === "cem" ||
      input.purpose === "opt-in" ||
      input.purpose === "nudge" ||
      input.purpose === "reactivation")
  ) {
    const consent = await standInConsentSilence.get(input.contactId);
    if (consent.silenced) reasons.push("silence");
    if (consent.basis === "none" && input.purpose !== "opt-in") reasons.push("consent");
  }

  const grant = await standInCrmOAuth.get(input.firmId);
  if (grant.revoked) reasons.push("oauth-revoked");

  return [...new Set(reasons)];
}

export const standInSendGate: SendGatePort = {
  tag: "stand-in",
  async decide(input) {
    const reasons = await collectReasons(input);
    if (reasons.length === 0) return { allow: true, reasons: [] };
    return { allow: false, reasons };
  },
  async chips(firmId) {
    const decision = await collectReasons({
      firmId,
      channel: "email",
      purpose: "cem",
      posture: "Active",
    });
    const all: SendDenyReason[] = [
      "sending-identity",
      "auth",
      "warmup",
      "throttle",
      "policy",
      "consent",
      "silence",
      "halt",
      "posture",
      "quarantine",
      "oauth-revoked",
      "founder-esp-missing",
    ];
    const founderMissing = !isFixturePresent("esp_account_provisioned");
    return all.map((reason) => {
      if (reason === "founder-esp-missing") {
        return {
          reason,
          label: LABELS[reason],
          blocking: false,
          advisory: founderMissing,
        };
      }
      return {
        reason,
        label: LABELS[reason],
        blocking: decision.includes(reason),
      };
    });
  },
};
