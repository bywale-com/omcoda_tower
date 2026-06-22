import type { RegisterViewManifest } from "./types";

/** Login form — verification code step (after email OTP sent). */
export const LOGIN_VERIFY_VIEW: RegisterViewManifest = {
  id: "login-verify",
  title: "Login · Verify",
  subtitle: "Verification code step",
  width: 360,
  region: "login-page",
  contains: [
    {
      holonId: "login-form",
      children: [
        { holonId: "login-form-banner" },
        { holonId: "login-verify-code-field" },
        { holonId: "login-verify-submit-control" },
      ],
    },
  ],
};
