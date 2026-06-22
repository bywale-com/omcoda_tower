import { Navigate } from "react-router";
import { useAuth } from "../../auth/AuthContext";
import { DocsHighlightProvider } from "../../context/DocsHighlightContext";
import { OmcodaNav } from "../components/OmcodaNav";
import { LoginForm } from "../components/LoginForm";
import { AuthHeroMedia } from "../components/AuthHeroMedia";

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <DocsHighlightProvider>
      <div className="marketing-page">
        <OmcodaNav />

        <main className="login-hero">
          <section className="login-hero__copy">
            <h1 className="t-hero">Client engagement for immigration consultants</h1>
            <p className="login-hero__subtitle">
              Tower brings contacts, automations, and audit-ready workflows into one workspace — built
              for firms that need clarity at every step.
            </p>
            <LoginForm />
          </section>

          <AuthHeroMedia />
        </main>
      </div>
    </DocsHighlightProvider>
  );
}
