import type { OtpStorePort, OtpVerifyResult } from "../ports";

/**
 * Real OTP via auth-service (/auth).
 * Auth contract uses email+code (no challengeId in responses). We use email as
 * the opaque challengeId so existing CT Login call sites stay unchanged.
 */
export const realOtpStore: OtpStorePort = {
  tag: "real",
  async issue(input) {
    const res = await fetch("/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: input.email }),
      credentials: "include",
    });
    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      message?: string;
    };
    if (!res.ok || data.ok === false) {
      throw new Error(data.message ?? data.error ?? `otp send failed (${res.status})`);
    }
    return {
      challengeId: input.email.toLowerCase(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };
  },
  async verify(input): Promise<OtpVerifyResult> {
    const res = await fetch("/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input.challengeId,
        code: input.code,
      }),
      credentials: "include",
    });
    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      message?: string;
    };
    if (res.ok && data.ok) {
      return { ok: true, sessionToken: "cookie" };
    }
    if (data.error === "rate_limited" || res.status === 429) {
      return { ok: false, reason: "locked" };
    }
    if (data.error === "expired" || data.message?.toLowerCase().includes("expir")) {
      return { ok: false, reason: "expired" };
    }
    return { ok: false, reason: "mismatch" };
  },
};
