/**
 * Login scene — OTP leaf controls (Email field · Send code · Code field · Verify).
 * Furnish: Resend code cooldown · distinct OTP failure reasons.
 */
import { useEffect, useState, type FormEvent } from "react";
import type { Tokens } from "../../components/tokens";
import {
  LeafSurface,
  primaryControlStyle,
  secondaryControlStyle,
} from "./registerSurfaceChrome";

type RegisterLoginSceneProps = {
  t: Tokens;
  focusLabel?: string | null;
  focusSeq?: number;
  firmName?: string;
  onVerified?: () => void;
};

type Step = "email" | "verify";
type VerifyFailure = "expired" | "wrong" | "unknown-email" | null;

const RESEND_SECONDS = 30;

export function RegisterLoginScene({
  t,
  focusLabel = null,
  focusSeq = 0,
  firmName = "Cedar Pathways",
  onVerified,
}: RegisterLoginSceneProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("lena@cedarpathways.ca");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [failure, setFailure] = useState<VerifyFailure>(null);

  useEffect(() => {
    if (!focusLabel) return;
    if (
      focusLabel === "Code field" ||
      focusLabel === "Verify" ||
      focusLabel === "Verify code"
    ) {
      setStep("verify");
      setSent(true);
      setCooldown((c) => (c > 0 ? c : RESEND_SECONDS));
    } else if (
      focusLabel === "Email field" ||
      focusLabel === "Send code" ||
      focusLabel === "Email field / Send code" ||
      focusLabel === "Login"
    ) {
      setStep("email");
    }
  }, [focusLabel, focusSeq]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  function startCooldown() {
    setCooldown(RESEND_SECONDS);
  }

  function onSendCode(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes("@") || normalized.endsWith("@unknown.test")) {
      setFailure("unknown-email");
      return;
    }
    setFailure(null);
    setSent(true);
    setStep("verify");
    setCode("");
    startCooldown();
  }

  function onResend() {
    if (cooldown > 0) return;
    setFailure(null);
    setSent(true);
    setCode("");
    startCooldown();
  }

  function onVerify(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    const trimmed = code.trim();
    if (trimmed === "000000") {
      setFailure("expired");
      return;
    }
    if (trimmed.length < 6 || trimmed === "111111") {
      setFailure("wrong");
      return;
    }
    setFailure(null);
    onVerified?.();
  }

  const failureCopy: Record<Exclude<VerifyFailure, null>, string> = {
    expired: "That code expired — Resend code for a fresh OTP.",
    wrong: "That code doesn’t match — check digits and try again.",
    "unknown-email": "This email isn’t provisioned for the firm desk.",
  };

  const fieldStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    fontSize: 13,
    fontFamily: "inherit",
    color: t.textPrimary,
    background: t.bgPrimary,
    border: `1px solid ${t.border}`,
    borderRadius: 4,
    padding: "9px 11px",
    outline: "none",
  };

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
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: t.textPrimary,
            letterSpacing: "-0.01em",
          }}
        >
          Login
        </span>
        <span style={{ fontSize: 11, color: t.textMuted }} title="Firm identity">
          {firmName} · {step === "email" ? "Work email · Send code" : "Verify OTP"}
        </span>
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
        <div style={{ width: "100%", maxWidth: 360 }}>
          {step === "email" ? (
            <form onSubmit={onSendCode} noValidate>
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: t.textMuted,
                }}
              >
                Sign in with your provisioned work email. Tower sends a one-time code — no password.
              </p>
              <LeafSurface
                label="Email field"
                focused={focusLabel === "Email field"}
                hovered={false}
                t={t}
                style={{ marginBottom: 12 }}
              >
                <label
                  htmlFor="register-login-email"
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: t.textDim,
                    marginBottom: 5,
                  }}
                >
                  Email field
                </label>
                <input
                  id="register-login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@firm.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFailure(null);
                  }}
                  style={fieldStyle}
                />
              </LeafSurface>
              <LeafSurface
                label="Send code"
                focused={focusLabel === "Send code"}
                hovered={false}
                t={t}
              >
                <button type="submit" style={primaryControlStyle(t, !email.trim())}>
                  Send code
                </button>
              </LeafSurface>
              {failure === "unknown-email" ? (
                <p style={{ margin: "12px 0 0", fontSize: 11, color: t.red }} role="alert">
                  {failureCopy["unknown-email"]}
                </p>
              ) : null}
            </form>
          ) : (
            <form onSubmit={onVerify} noValidate>
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 12,
                  color: t.textMuted,
                }}
              >
                Code sent to
              </p>
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.textPrimary,
                }}
              >
                {email}
              </p>
              <LeafSurface
                label="Code field"
                focused={focusLabel === "Code field"}
                hovered={false}
                t={t}
                style={{ marginBottom: 12 }}
              >
                <label
                  htmlFor="register-login-code"
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: t.textDim,
                    marginBottom: 5,
                  }}
                >
                  Code field
                </label>
                <input
                  id="register-login-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setFailure(null);
                  }}
                  style={fieldStyle}
                />
                <p style={{ margin: "6px 0 0", fontSize: 10, color: t.textDim }}>
                  Demo failures: 000000 expired · 111111 wrong · try any other 6 digits to land Board.
                </p>
              </LeafSurface>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <LeafSurface
                  label="Verify"
                  focused={focusLabel === "Verify" || focusLabel === "Verify code"}
                  hovered={false}
                  t={t}
                >
                  <button
                    type="submit"
                    style={primaryControlStyle(t, !code.trim())}
                    disabled={!code.trim()}
                  >
                    Verify
                  </button>
                </LeafSurface>
                <button
                  type="button"
                  onClick={onResend}
                  disabled={cooldown > 0}
                  style={{
                    ...secondaryControlStyle(t),
                    opacity: cooldown > 0 ? 0.7 : 1,
                    cursor: cooldown > 0 ? "not-allowed" : "pointer",
                  }}
                  title="Resend code with cooldown"
                >
                  {cooldown > 0 ? `Resend code · ${cooldown}s` : "Resend code"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setFailure(null);
                  }}
                  style={secondaryControlStyle(t)}
                >
                  Change email
                </button>
              </div>
              {failure && failure !== "unknown-email" ? (
                <p style={{ margin: "12px 0 0", fontSize: 11, color: t.red }} role="alert">
                  {failureCopy[failure]}
                </p>
              ) : null}
              {sent && !failure ? (
                <p style={{ margin: "12px 0 0", fontSize: 11, color: t.accent }}>
                  OTP challenge written — Verify lands Board as signed-in default.
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
