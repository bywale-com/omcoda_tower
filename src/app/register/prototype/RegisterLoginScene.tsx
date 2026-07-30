/**
 * Login scene — stripped LoginForm in a Tower panel (not full marketing page).
 */
import type { Tokens } from "../../components/tokens";
import { LoginForm } from "../../marketing/components/LoginForm";

type RegisterLoginSceneProps = {
  t: Tokens;
};

export function RegisterLoginScene({ t }: RegisterLoginSceneProps) {
  return (
    <div
      data-register-surface="Login"
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: t.bgPrimary,
        border: `1px solid ${t.border}`,
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <header
        style={{
          height: 35,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "0 14px",
          borderBottom: `1px solid ${t.border}`,
          background: t.bgSecondary,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, letterSpacing: "-0.01em" }}>
          Login
        </span>
        <span style={{ fontSize: 11, color: t.textMuted }}>Access · OTP</span>
      </header>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: `linear-gradient(165deg, ${t.bgPrimary} 0%, ${t.hoverBg} 55%, ${t.bgSecondary} 100%)`,
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 380 }}>
          <LoginForm onSuccess={() => {}} />
        </div>
      </div>
    </div>
  );
}
