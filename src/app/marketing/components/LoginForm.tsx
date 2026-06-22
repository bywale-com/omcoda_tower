import { FormEvent, useState } from "react";
import { Cloud } from "lucide-react";
import { useNavigate } from "react-router";
import { abandonOtp, AuthRequestError, sendOtp, verifyOtp } from "../../auth/authClient";
import { useAuth } from "../../auth/AuthContext";
import { HolonBoundary } from "../../components/docs/HolonBoundary";
import {
  LOGIN_EMAIL_FIELD_HOLON,
  LOGIN_FORM_BANNER_HOLON,
  LOGIN_FORM_HOLON,
  LOGIN_SUBMIT_CONTROL_HOLON,
  LOGIN_VERIFY_CODE_FIELD_HOLON,
  LOGIN_VERIFY_SUBMIT_CONTROL_HOLON,
} from "../../components/docs/loginHolons";
import { light } from "../../components/tokens";

type LoginStep = "email" | "verify";

type LoginFormProps = {
  onSuccess?: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const t = light;
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter your email to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      await sendOtp(trimmedEmail);
      setEmail(trimmedEmail);
      setStep("verify");
      setVerificationCode("");
    } catch (err) {
      setError(
        err instanceof AuthRequestError
          ? err.message
          : "We could not send a code. Try again shortly.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!verificationCode.trim()) {
      setError("Enter the verification code from your email.");
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyOtp(email, verificationCode.trim());
      await refresh();
      onSuccess?.();
      navigate("/");
    } catch (err) {
      setError(
        err instanceof AuthRequestError
          ? err.message
          : "Verification failed. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    setError(null);
    setIsSubmitting(true);

    try {
      await sendOtp(email);
    } catch (err) {
      setError(
        err instanceof AuthRequestError
          ? err.message
          : "We could not resend the code. Try again shortly.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChangeEmail() {
    setIsSubmitting(true);
    try {
      if (email.trim()) {
        await abandonOtp(email.trim());
      }
    } catch {
      // Abandon is best-effort; user can still change email in UI.
    } finally {
      setStep("email");
      setVerificationCode("");
      setError(null);
      setIsSubmitting(false);
    }
  }

  return (
    <HolonBoundary
      id={LOGIN_FORM_HOLON.id}
      label={LOGIN_FORM_HOLON.label}
      icon={LOGIN_FORM_HOLON.icon}
      order={LOGIN_FORM_HOLON.order}
      t={t}
    >
      <div className="login-card">
        <HolonBoundary
          id={LOGIN_FORM_BANNER_HOLON.id}
          label={LOGIN_FORM_BANNER_HOLON.label}
          icon={LOGIN_FORM_BANNER_HOLON.icon}
          order={LOGIN_FORM_BANNER_HOLON.order}
          t={t}
          style={{ display: "block" }}
        >
          <div className="login-card__banner">
            <span className="login-card__banner-icon" aria-hidden>
              <Cloud strokeWidth={1.75} />
            </span>
            Sign in to your consultant workspace
          </div>
        </HolonBoundary>

        <div className="login-card__body">
          {step === "email" ? (
            <form className="login-form" onSubmit={handleEmailSubmit} noValidate>
              <HolonBoundary
                id={LOGIN_EMAIL_FIELD_HOLON.id}
                label={LOGIN_EMAIL_FIELD_HOLON.label}
                icon={LOGIN_EMAIL_FIELD_HOLON.icon}
                order={LOGIN_EMAIL_FIELD_HOLON.order}
                registerOnly
                inView
                t={t}
              >
                <div>
                  <label htmlFor="tower-login-email">Email</label>
                  <input
                    id="tower-login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@firm.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </HolonBoundary>

              {error && (
                <p className="login-form__error" role="alert">
                  {error}
                </p>
              )}

              <HolonBoundary
                id={LOGIN_SUBMIT_CONTROL_HOLON.id}
                label={LOGIN_SUBMIT_CONTROL_HOLON.label}
                icon={LOGIN_SUBMIT_CONTROL_HOLON.icon}
                order={LOGIN_SUBMIT_CONTROL_HOLON.order}
                registerOnly
                inView
                t={t}
              >
                <button className="login-form__submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending code…" : "Log In"}
                </button>
              </HolonBoundary>
            </form>
          ) : (
            <form className="login-form login-form--verify" onSubmit={handleVerifySubmit} noValidate>
              <p className="login-form__verify-lead">Enter the verification code sent to</p>
              <p className="login-form__verify-email">{email}</p>

              <HolonBoundary
                id={LOGIN_VERIFY_CODE_FIELD_HOLON.id}
                label={LOGIN_VERIFY_CODE_FIELD_HOLON.label}
                icon={LOGIN_VERIFY_CODE_FIELD_HOLON.icon}
                order={LOGIN_VERIFY_CODE_FIELD_HOLON.order}
                registerOnly
                inView
                t={t}
              >
                <input
                  id="tower-login-code"
                  className="login-form__verify-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  disabled={isSubmitting}
                  aria-label="Verification code"
                />
              </HolonBoundary>

              {error && (
                <p className="login-form__error" role="alert">
                  {error}
                </p>
              )}

              <HolonBoundary
                id={LOGIN_VERIFY_SUBMIT_CONTROL_HOLON.id}
                label={LOGIN_VERIFY_SUBMIT_CONTROL_HOLON.label}
                icon={LOGIN_VERIFY_SUBMIT_CONTROL_HOLON.icon}
                order={LOGIN_VERIFY_SUBMIT_CONTROL_HOLON.order}
                registerOnly
                inView
                t={t}
              >
                <button className="login-form__verify-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Verifying…" : "Verify Email Address"}
                </button>
              </HolonBoundary>

              <p className="login-form__verify-help">
                Not seeing the email in your inbox?{" "}
                <button
                  type="button"
                  className="login-form__verify-link"
                  onClick={handleResendCode}
                  disabled={isSubmitting}
                >
                  Try sending again.
                </button>
              </p>

              <p className="login-form__verify-help">
                Wrong email?{" "}
                <button
                  type="button"
                  className="login-form__verify-link"
                  onClick={handleChangeEmail}
                  disabled={isSubmitting}
                >
                  Change email address
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </HolonBoundary>
  );
}

