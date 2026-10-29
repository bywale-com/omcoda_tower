/**
 * Acceptance oracle for packet PKT-001.
 *
 * This is the click rule locked in PR #135 claim 3. The production click
 * path in `server/wire-service` must agree with it. Postgres proof is
 * `scripts/verify-click-attribution.ts`. This module stays free of the database.
 *
 * Rule:
 * - The click loads the outbound message and names that message's enrollment.
 * - A stamped message matches enrollment E only when message.enrollmentId = E
 *   and message.campaignObjectiveId is E's current objective.
 * - A null objective id keeps packet 022's fallback: enrollment id = E and
 *   createdAt >= E.enrolledAt.
 * - After E's cursor has left a campaign, the same stamp does not advance E.
 */

export interface PursuitMessage {
  enrollmentId: string | null;
  campaignObjectiveId: string | null;
  createdAt: string;
}

export interface PursuitEnrollment {
  id: string;
  enrolledAt: string;
  campaignId: string | null;
  currentObjectiveId: string | null;
}

/** The enrollment the click may advance. Never "newest open enrollment". */
export function enrollmentForClick(message: PursuitMessage): string | null {
  return message.enrollmentId;
}

export function clickMatchesEnrollment(
  message: PursuitMessage,
  enrollment: PursuitEnrollment,
): boolean {
  if (!message.enrollmentId || message.enrollmentId !== enrollment.id) return false;
  if (!enrollment.campaignId) return false;
  if (message.campaignObjectiveId == null) {
    return message.createdAt >= enrollment.enrolledAt;
  }
  return message.campaignObjectiveId === enrollment.currentObjectiveId;
}
