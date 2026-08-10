/**
 * Deploy-target boot gates — fail closed, never silent-degrade to fake live sends.
 *
 * - DATABASE_URL required for api/worker
 * - SEND_MODE missing/empty → dry_run (see sendMode.ts)
 * - SEND_MODE=live without ESP keys → hard fail at boot
 * - DEPLOY_STRICT=1 (or NODE_ENV=production): ESP keys required even in dry_run
 *   so missing secrets refuse boot instead of pretending the wire is configured
 */
import { getSendMode } from "./sendMode.ts";

export type BootRole = "api" | "worker";

function hasResend(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function hasTwilio(): boolean {
  const from =
    process.env.TWILIO_FROM_NUMBER?.trim() || process.env.TWILIO_PHONE_NUMBER?.trim();
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      from,
  );
}

function deployStrict(): boolean {
  const v = (process.env.DEPLOY_STRICT ?? "").toLowerCase();
  if (v === "true" || v === "1") return true;
  return (process.env.NODE_ENV ?? "").toLowerCase() === "production";
}

/** Call once at process start. Exits process on failure. */
export function assertBootEnv(role: BootRole): void {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error(`BOOT FAIL (${role}): DATABASE_URL required`);
    process.exit(1);
  }

  const mode = getSendMode();
  if (mode === "live" && !hasResend()) {
    console.error(
      `BOOT FAIL (${role}): SEND_MODE=live requires RESEND_API_KEY (refusing silent fake send)`,
    );
    process.exit(1);
  }

  if (deployStrict() && !hasResend()) {
    console.error(
      `BOOT FAIL (${role}): RESEND_API_KEY required under DEPLOY_STRICT/production`,
    );
    process.exit(1);
  }

  console.log(
    JSON.stringify({
      boot: role,
      sendMode: mode,
      resend: hasResend(),
      twilio: hasTwilio(),
      deployStrict: deployStrict(),
      cohortSize: (process.env.SEND_TEST_COHORT ?? "")
        .split(/[, \n\t]+/)
        .filter(Boolean).length,
    }),
  );
}
