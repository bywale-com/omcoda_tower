import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type AuthUser,
  fetchSession,
  isAuthDisabled,
  logout as logoutRequest,
} from "./authClient";
import { setActiveFirmId } from "../wire/sessionFirm";

const LOGGED_OUT_KEY = "tower.loggedOut";

function hasExplicitLogout(): boolean {
  try {
    return sessionStorage.getItem(LOGGED_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

function markExplicitLogout(): void {
  try {
    sessionStorage.setItem(LOGGED_OUT_KEY, "1");
  } catch {
    /* private mode */
  }
}

function clearExplicitLogout(): void {
  try {
    sessionStorage.removeItem(LOGGED_OUT_KEY);
  } catch {
    /* private mode */
  }
}

/** AUTH_DISABLED only — firm from explicit VITE_DEV_FIRM_ID, never a code default. */
function devBypassUser(): AuthUser | null {
  const firmId = String(import.meta.env.VITE_DEV_FIRM_ID ?? "").trim();
  if (!firmId) return null;
  return {
    id: "auth-disabled",
    firmId,
    email: "dev@localhost",
  };
}

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authDisabled = isAuthDisabled();
  const [user, setUser] = useState<AuthUser | null>(() =>
    authDisabled && !hasExplicitLogout() ? devBypassUser() : null,
  );
  const [isLoading, setIsLoading] = useState(!authDisabled);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // Prefer a real session cookie even when AUTH_DISABLED — OTP login binds the
      // provisioned firm. Fall back to VITE_DEV_FIRM_ID only when no session exists.
      const session = await fetchSession();
      if (session?.user) {
        clearExplicitLogout();
        setUser(session.user);
        return;
      }
      if (hasExplicitLogout()) {
        setUser(null);
        return;
      }
      if (isAuthDisabled()) {
        setUser(devBypassUser());
        return;
      }
      setUser(null);
    } catch {
      if (hasExplicitLogout()) {
        setUser(null);
      } else if (isAuthDisabled()) {
        setUser(devBypassUser());
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    markExplicitLogout();
    try {
      await logoutRequest();
    } catch {
      // Cookie already gone, or auth process not running.
    }
    setUser(null);
    setActiveFirmId(null);
    window.location.reload();
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setActiveFirmId(user?.firmId ?? null);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      // AUTH_DISABLED still requires VITE_DEV_FIRM_ID (user non-null) — fail closed.
      isAuthenticated: user !== null,
      refresh,
      logout,
    }),
    [user, isLoading, authDisabled, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
