import { Cloud } from "lucide-react";
import type { ReactNode } from "react";
import type { RegisterSurfaceProps } from "../composer/surfaceTypes";

export function LoginFormSurface({ children }: RegisterSurfaceProps & { children?: ReactNode }) {
  return <div className="login-card">{children}</div>;
}

export function LoginFormBannerSurface(_props: RegisterSurfaceProps) {
  return (
    <div className="login-card__banner">
      <span className="login-card__banner-icon" aria-hidden>
        <Cloud strokeWidth={1.75} />
      </span>
      Sign in to your consultant workspace
    </div>
  );
}

export function LoginEmailFieldSurface(_props: RegisterSurfaceProps) {
  return (
    <div>
      <label htmlFor="register-cosmetic-login-email">Email</label>
      <input
        id="register-cosmetic-login-email"
        type="email"
        readOnly
        tabIndex={-1}
        placeholder="you@firm.com"
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
}

export function LoginSubmitControlSurface(_props: RegisterSurfaceProps) {
  return (
    <button type="button" className="login-form__submit" tabIndex={-1} style={{ pointerEvents: "none" }}>
      Log In
    </button>
  );
}

export function LoginVerifyCodeFieldSurface(_props: RegisterSurfaceProps) {
  return (
    <>
      <p className="login-form__verify-lead">Enter the verification code sent to</p>
      <p className="login-form__verify-email">you@firm.com</p>
      <input
        className="login-form__verify-input"
        type="text"
        readOnly
        tabIndex={-1}
        placeholder="Enter verification code"
        style={{ pointerEvents: "none" }}
      />
    </>
  );
}

export function LoginVerifySubmitControlSurface(_props: RegisterSurfaceProps) {
  return (
    <button type="button" className="login-form__verify-submit" tabIndex={-1} style={{ pointerEvents: "none" }}>
      Verify Email Address
    </button>
  );
}
