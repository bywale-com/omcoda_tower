import type { RegisterViewManifest } from "./types";

/** Login form — email step only (passwordless OTP send). */
export const LOGIN_SIGN_IN_VIEW: RegisterViewManifest = {
  id: "login-sign-in",
  title: "Login · Sign in",
  subtitle: "Email step",
  width: 360,
  region: "login-page",
  contains: [
    {
      holonId: "login-form",
      children: [
        { holonId: "login-form-banner" },
        { holonId: "login-email-field" },
        { holonId: "login-submit-control" },
      ],
    },
  ],
};
