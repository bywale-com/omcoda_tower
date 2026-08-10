/**
 * Active firm for wire/machine calls — set only from Auth session.
 * No hardcoded demo tenant. Unset → writes fail closed.
 */

let activeFirmId: string | null = null;

export function setActiveFirmId(firmId: string | null): void {
  activeFirmId = firmId?.trim() || null;
}

export function getActiveFirmId(): string {
  if (!activeFirmId) {
    throw new Error("session firm required — no firm default");
  }
  return activeFirmId;
}

export function peekActiveFirmId(): string | null {
  return activeFirmId;
}
