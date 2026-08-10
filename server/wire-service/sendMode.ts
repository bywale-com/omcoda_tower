/**
 * Product send posture (SHIP): live only for allowlisted contacts.
 *
 * SEND_MODE=live|dry_run  (product default live)
 * SEND_TEST_COHORT= required allowlist under live — fail closed when empty.
 * Off-cohort contacts stay dry-run. Explicit SEND_MODE=dry_run forces pretend-send.
 */

export type SendMode = "dry_run" | "live";

export function getSendMode(): SendMode {
  const raw = (process.env.SEND_MODE ?? "live").trim().toLowerCase();
  if (raw === "dry_run") return "dry_run";
  return "live";
}

/** Allowlist — under live, empty means nobody is live-eligible (fail closed). */
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
 * Live when mode=live AND contact ∈ non-empty cohort.
 * dry_run mode → never live. Empty cohort → never live (fail closed).
 */
export function shouldLiveSend(contactId: string | undefined | null): boolean {
  if (!contactId) return false;
  if (getSendMode() !== "live") return false;
  const cohort = getSendTestCohort();
  if (cohort.size === 0) return false;
  return cohort.has(contactId);
}

export function sendGateSnapshot() {
  const cohort = getSendTestCohort();
  return {
    mode: getSendMode(),
    cohortSize: cohort.size,
    failClosed: getSendMode() !== "live" || cohort.size === 0,
    productDefault: "live",
    requireCohort: true,
  };
}
