import { useEffect, useState, type FormEvent } from "react";
import { Alert, Button, Form, Input, Space, Steps, Typography } from "antd";
import { Hint, ModulePage, Surface } from "../chrome";
import { FIRM_NAME } from "./shared";

const { Text, Paragraph } = Typography;

type LoginModuleProps = {
  onVerified?: () => void;
};

type Step = "email" | "verify";
type VerifyFailure = "expired" | "wrong" | "unknown-email" | null;

const RESEND_SECONDS = 30;

const FAILURE_COPY: Record<Exclude<VerifyFailure, null>, string> = {
  expired: "That code expired — Resend code for a fresh OTP.",
  wrong: "That code doesn't match — check digits and try again.",
  "unknown-email": "This email isn't provisioned for the firm desk.",
};

export function LoginModule({ onVerified }: LoginModuleProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("lena@cedarpathways.ca");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [failure, setFailure] = useState<VerifyFailure>(null);

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

  return (
    <Surface label="Login" style={{ height: "100%", padding: 12 }}>
      <div
        style={{
          height: "100%",
          background: "var(--ant-color-bg-container)",
          border: "1px solid var(--ant-color-split)",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ModulePage
          title="Login"
          surface="Login"
          extra={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {FIRM_NAME} · {step === "email" ? "Work email · Send code" : "Verify OTP"}
            </Text>
          }
        >
          <div style={{ maxWidth: 400, margin: "0 auto", padding: "24px 0" }}>
            <Steps
              size="small"
              current={step === "email" ? 0 : 1}
              items={[{ title: "Email" }, { title: "Verify" }]}
              style={{ marginBottom: 24 }}
            />

            {step === "email" ? (
              <form onSubmit={onSendCode}>
                <Paragraph type="secondary">
                  Sign in with your provisioned work email. Tower sends a one-time code — no password.
                </Paragraph>
                <Surface label="Email field">
                  <Form layout="vertical">
                    <Form.Item label="Email field">
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="you@firm.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setFailure(null);
                        }}
                      />
                    </Form.Item>
                  </Form>
                </Surface>
                <Surface label="Send code">
                  <Button type="primary" htmlType="submit" disabled={!email.trim()}>
                    Send code
                  </Button>
                </Surface>
                {failure === "unknown-email" ? (
                  <Alert type="error" message={FAILURE_COPY["unknown-email"]} style={{ marginTop: 12 }} />
                ) : null}
              </form>
            ) : (
              <form onSubmit={onVerify}>
                <Text type="secondary">Code sent to</Text>
                <Paragraph strong style={{ marginBottom: 16 }}>{email}</Paragraph>
                <Surface label="Code field">
                  <Form layout="vertical">
                    <Form.Item label="Code field">
                      <Input
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="6-digit code"
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value);
                          setFailure(null);
                        }}
                      />
                    </Form.Item>
                  </Form>
                </Surface>
                <Hint>
                  Demo failures: 000000 expired · 111111 wrong · try any other 6 digits to land Board.
                </Hint>
                <Space wrap style={{ marginTop: 12 }}>
                  <Surface label="Verify">
                    <Button type="primary" htmlType="submit" disabled={!code.trim()}>
                      Verify
                    </Button>
                  </Surface>
                  <Surface label="Resend code">
                    <Button onClick={onResend} disabled={cooldown > 0}>
                      {cooldown > 0 ? `Resend code · ${cooldown}s` : "Resend code"}
                    </Button>
                  </Surface>
                  <Button
                    onClick={() => {
                      setStep("email");
                      setCode("");
                      setFailure(null);
                    }}
                  >
                    Change email
                  </Button>
                </Space>
                {failure && failure !== "unknown-email" ? (
                  <Alert type="error" message={FAILURE_COPY[failure]} style={{ marginTop: 12 }} />
                ) : null}
                {sent && !failure ? (
                  <Alert
                    type="success"
                    message="OTP challenge written — Verify lands Board as signed-in default."
                    style={{ marginTop: 12 }}
                  />
                ) : null}
              </form>
            )}
          </div>
        </ModulePage>
      </div>
    </Surface>
  );
}
