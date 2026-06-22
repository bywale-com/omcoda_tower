const SYSTEM_POSITIONS_STORAGE_KEY = "tower.register.systemPositions";

export type RegisterSystemPosition = {
  x: number;
  y: number;
};

export function loadRegisterSystemPositions(): Record<string, RegisterSystemPosition> {
  try {
    const raw = localStorage.getItem(SYSTEM_POSITIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, RegisterSystemPosition>;
  } catch {
    return {};
  }
}

export function saveRegisterSystemPosition(systemId: string, position: RegisterSystemPosition): void {
  const saved = loadRegisterSystemPositions();
  saved[systemId] = position;
  localStorage.setItem(SYSTEM_POSITIONS_STORAGE_KEY, JSON.stringify(saved));
}
