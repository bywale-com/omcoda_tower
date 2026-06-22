const REGISTER_STORAGE_KEY = "tower.register.unlocked";
const REGISTER_PASSWORD = "123456";

export function isRegisterUnlocked(): boolean {
  return sessionStorage.getItem(REGISTER_STORAGE_KEY) === "1";
}

export function unlockRegister(password: string): boolean {
  if (password !== REGISTER_PASSWORD) return false;
  sessionStorage.setItem(REGISTER_STORAGE_KEY, "1");
  return true;
}

export function lockRegister(): void {
  sessionStorage.removeItem(REGISTER_STORAGE_KEY);
}
