import { FormEvent, useState } from "react";
import type { Tokens } from "../../components/tokens";
import { unlockRegister } from "../registerAuth";

type RegisterGateProps = {
  t: Tokens;
  onUnlock: () => void;
};

export function RegisterGate({ t, onUnlock }: RegisterGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (unlockRegister(password)) {
      onUnlock();
      return;
    }

    setError("Incorrect password.");
    setPassword("");
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: t.bgPrimary,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          border: `1px solid ${t.border}`,
          borderRadius: 8,
          background: t.cardBg,
          padding: "24px 22px 22px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <h1
          style={{
            margin: "0 0 6px",
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
            color: t.textPrimary,
          }}
        >
          Tower Register
        </h1>
        <p
          style={{
            margin: "0 0 20px",
            fontSize: 13,
            lineHeight: 1.45,
            color: t.textMuted,
          }}
        >
          Systems register — password required.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <label
            htmlFor="register-gate-password"
            style={{
              fontSize: 13,
              fontWeight: 500,
              lineHeight: 1.25,
              color: t.textPrimary,
            }}
          >
            Password
          </label>
          <input
            id="register-gate-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            style={{
              width: "100%",
              padding: "8px 10px",
              border: `1px solid ${t.border}`,
              borderRadius: 6,
              background: t.bgPrimary,
              fontSize: 13,
              fontFamily: "inherit",
              color: t.textPrimary,
              outline: "none",
            }}
          />

          {error && (
            <p role="alert" style={{ margin: 0, fontSize: 13, color: t.red }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              marginTop: 4,
              padding: "8px 14px",
              border: "none",
              borderRadius: 6,
              background: t.accent,
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
