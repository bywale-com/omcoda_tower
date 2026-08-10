/** Active firm for wire/machine calls — set from AuthProvider after login. */

let activeFirmId = "firm-cedar";

export function setActiveFirmId(firmId: string | null | undefined) {
  const next = (firmId ?? "").trim();
  activeFirmId = next || "firm-cedar";
}

export function getActiveFirmId(): string {
  return activeFirmId;
}
