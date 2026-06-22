const VIEW_POSITIONS_STORAGE_KEY = "tower.register.viewPositions";

export type RegisterViewPosition = {
  x: number;
  y: number;
};

export function loadRegisterViewPositions(): Record<string, RegisterViewPosition> {
  try {
    const raw = localStorage.getItem(VIEW_POSITIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, RegisterViewPosition>;
  } catch {
    return {};
  }
}

export function saveRegisterViewPosition(viewId: string, position: RegisterViewPosition): void {
  const saved = loadRegisterViewPositions();
  saved[viewId] = position;
  localStorage.setItem(VIEW_POSITIONS_STORAGE_KEY, JSON.stringify(saved));
}
