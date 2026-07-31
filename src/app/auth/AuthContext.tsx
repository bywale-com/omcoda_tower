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

const DEV_BYPASS_USER: AuthUser = {
  id: "auth-disabled",
  firmId: "dev-firm",
  email: "dev@localhost",
};

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
  const [user, setUser] = useState<AuthUser | null>(authDisabled ? DEV_BYPASS_USER : null);
  const [isLoading, setIsLoading] = useState(!authDisabled);

  const refresh = useCallback(async () => {
    if (isAuthDisabled()) {
      setUser(DEV_BYPASS_USER);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const session = await fetchSession();
      setUser(session?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (isAuthDisabled()) {
      setUser(DEV_BYPASS_USER);
      return;
    }
    await logoutRequest();
    setUser(null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: authDisabled || user !== null,
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
