/**
 * Product send posture (prototype cohesion): default LIVE.
 *
 * SEND_MODE=live|dry_run  (default live — founder lock 2026-08-10)
 * SEND_TEST_COHORT= optional allowlist; when non-empty under live, only those
 * contact ids send live (ops safety). Empty cohort + live = all contacts eligible.
 * Explicit SEND_MODE=dry_run forces pretend-send for all.
 */

export type SendMode = "dry_run" | "live";

export function getSendMode(): SendMode {
  const raw = (process.env.SEND_MODE ?? "live").trim().toLowerCase();
  if (raw === "dry_run") return "dry_run";
  return "live";
}

/** Optional allowlist — empty under live means all contacts are live-eligible. */
export function getSendTestCohort(): Set<string> {
  const raw = process.env.SEND_TEST_COHORT ?? "";
  return new Set(
    raw
      .split(/[, \n\t]+/)
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

/**
 * Live when mode=live and (cohort empty OR contact ∈ cohort).
 * dry_run mode → never live.
 */
export function shouldLiveSend(contactId: string | undefined | null): boolean {
  if (!contactId) return false;
  if (getSendMode() !== "live") return false;
  const cohort = getSendTestCohort();
  if (cohort.size === 0) return true;
  return cohort.has(contactId);
}

export function sendGateSnapshot() {
  return {
    mode: getSendMode(),
    cohortSize: getSendTestCohort().size,
    failClosed: getSendMode() === "dry_run",
    productDefault: "live",
  };
}
