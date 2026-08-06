import type { OtpIssueInput, OtpIssueResult, OtpStorePort, OtpVerifyInput, OtpVerifyResult } from "../ports";
import { standInMailer } from "./mailer";

type Challenge = {
  challengeId: string;
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
};

const challenges = new Map<string, Challenge>();

function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const standInOtpStore: OtpStorePort = {
  tag: "stand-in",
  async issue(input: OtpIssueInput): Promise<OtpIssueResult> {
    const email = input.email.trim().toLowerCase();
    const code = randomCode();
    const challengeId = `otp-${Date.now()}-${challenges.size + 1}`;
    const expiresAtMs = Date.now() + 10 * 60 * 1000;
    challenges.set(challengeId, {
      challengeId,
      email,
      code,
      expiresAt: expiresAtMs,
      attempts: 0,
    });
    await standInMailer.send({
      to: email,
      subject: "Your Om Coda sign-in code",
      bodyText: `Your code is ${code}. It expires in 10 minutes.`,
      purpose: "otp",
    });
    return {
      challengeId,
      debugCode: code,
      expiresAt: new Date(expiresAtMs).toISOString(),
    };
  },
  async verify(input: OtpVerifyInput): Promise<OtpVerifyResult> {
    const challenge = challenges.get(input.challengeId);
    if (!challenge) return { ok: false, reason: "unknown-challenge" };
    if (Date.now() > challenge.expiresAt) {
      challenges.delete(input.challengeId);
      return { ok: false, reason: "expired" };
    }
    challenge.attempts += 1;
    if (challenge.attempts > 5) {
      challenges.delete(input.challengeId);
      return { ok: false, reason: "locked" };
    }
    if (input.code.trim() !== challenge.code) {
      return { ok: false, reason: "mismatch" };
    }
    challenges.delete(input.challengeId);
    return {
      ok: true,
      sessionToken: `standin-session-${challenge.email}-${Date.now()}`,
    };
  },
};
