const TABLE_POSITIONS_STORAGE_KEY = "tower.register.tablePositions";

export type RegisterTablePosition = {
  x: number;
  y: number;
};

export function loadRegisterTablePositions(): Record<string, RegisterTablePosition> {
  try {
    const raw = localStorage.getItem(TABLE_POSITIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, RegisterTablePosition>;
  } catch {
    return {};
  }
}

export function saveRegisterTablePosition(tableId: string, position: RegisterTablePosition): void {
  const saved = loadRegisterTablePositions();
  saved[tableId] = position;
  localStorage.setItem(TABLE_POSITIONS_STORAGE_KEY, JSON.stringify(saved));
}
