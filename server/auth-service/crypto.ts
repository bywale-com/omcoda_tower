import { createHash, randomBytes, randomInt } from "node:crypto";

export const SESSION_COOKIE = "tower_session";
export const OTP_TTL_MS = 10 * 60 * 1000;
export const MAX_VERIFY_ATTEMPTS = 5;
export const MAX_SENDS_PER_WINDOW = 3;
export const SEND_RATE_WINDOW_MS = 15 * 60 * 1000;

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function generateOtpCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
