/**
 * Direct access entry — redeem one-time token, land in the app (not the login portal).
 * URL shape: /a/<token>
 */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AuthRequestError, redeemAccessLink } from "./authClient";
import { useAuth } from "./AuthContext";

export function AccessEntry() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const raw = (token ?? "").trim();
    if (!raw) {
      setError("Missing access token.");
      return;
    }

    (async () => {
      try {
        await redeemAccessLink(raw);
        await refresh();
        if (!cancelled) {
          // Product face — not /login.
          window.location.replace("/prototype-ant");
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof AuthRequestError
            ? err.message
            : "This access link could not be opened. Ask your operator for a new one.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, refresh]);

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          fontFamily: "system-ui, sans-serif",
          background: "linear-gradient(160deg, #f7f4ef 0%, #e8eef5 100%)",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <p style={{ fontSize: 18, marginBottom: 12 }}>{error}</p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#f8fafc",
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Use email code instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "system-ui, sans-serif",
        background: "linear-gradient(160deg, #f7f4ef 0%, #e8eef5 100%)",
      }}
    >
      <p style={{ fontSize: 16, color: "#334155" }}>Opening your workspace…</p>
    </div>
  );
}
