/**
 * Product send posture (DEPLOY):
 *
 * SEND_MODE=live|dry_run — missing/empty → dry_run (fail-closed default)
 * SEND_TEST_COHORT= required allowlist under live — empty → nobody live-sends
 * Live posture is explicit: SEND_MODE=live + non-empty allowlist, set deliberately.
 */

export type SendMode = "dry_run" | "live";

export function getSendMode(): SendMode {
  const raw = (process.env.SEND_MODE ?? "").trim().toLowerCase();
  if (raw === "live") return "live";
  // missing, empty, or any other value → dry_run (fail closed)
  return "dry_run";
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
    productDefault: "dry_run",
    requireCohort: true,
  };
}
