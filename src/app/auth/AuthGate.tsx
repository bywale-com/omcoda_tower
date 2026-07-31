import { Navigate } from "react-router";
import { isAuthDisabled } from "./authClient";
import { useAuth } from "./AuthContext";

type AuthGateProps = {
  children: React.ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading } = useAuth();

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
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
