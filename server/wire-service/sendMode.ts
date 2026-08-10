/**
 * Live-send cutover gate. Fail closed: anything unclear → dry-run.
 *
 * SEND_MODE=dry_run|live  (default dry_run)
 * SEND_TEST_COHORT=comma-separated contact ids (required for any live send)
 */

export type SendMode = "dry_run" | "live";

export function getSendMode(): SendMode {
  const raw = (process.env.SEND_MODE ?? "dry_run").trim().toLowerCase();
  if (raw === "live") return "live";
  return "dry_run";
}

/** Explicit allowlist — empty means nobody is live-eligible. */
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
 * Live send only when mode=live AND contact is on the allowlist.
 * Misconfiguration → dry-run (never blast the book).
 */
export function shouldLiveSend(contactId: string | undefined | null): boolean {
  if (!contactId) return false;
  if (getSendMode() !== "live") return false;
  const cohort = getSendTestCohort();
  if (cohort.size === 0) return false;
  return cohort.has(contactId);
}

export function sendGateSnapshot() {
  return {
    mode: getSendMode(),
    cohortSize: getSendTestCohort().size,
    failClosed: true,
  };
}
