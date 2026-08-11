import { Navigate, useLocation } from "react-router";
import { isAuthDisabled } from "./authClient";
import { useAuth } from "./AuthContext";

type AuthGateProps = {
  children: React.ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Check on every render — never redirect to Login while auth is disabled.
  if (isAuthDisabled()) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="auth-gate-loading" style={{ padding: 24, textAlign: "center" }}>
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = `${location.pathname}${location.search}`;
    const loginTo =
      next && next !== "/" ? `/login?next=${encodeURIComponent(next)}` : "/login";
    return <Navigate to={loginTo} replace />;
  }

  return <>{children}</>;
}
