import {
  fetchRegisterStatus,
  isRegisterRouteEnabled,
  lockRegister as lockRegisterRequest,
  unlockRegister as unlockRegisterRequest,
} from "../auth/authClient";

export { isRegisterRouteEnabled };

export async function isRegisterUnlocked(): Promise<boolean> {
  if (!isRegisterRouteEnabled()) {
    return false;
  }

  try {
    const status = await fetchRegisterStatus();
    return status.enabled && status.unlocked;
  } catch {
    return false;
  }
}

export async function unlockRegister(password: string): Promise<boolean> {
  try {
    await unlockRegisterRequest(password);
    return true;
  } catch {
    return false;
  }
}

export async function lockRegister(): Promise<void> {
  try {
    await lockRegisterRequest();
  } catch {
    // Best-effort lock.
  }
}
