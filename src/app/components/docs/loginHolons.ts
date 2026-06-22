import type { NotionIconName } from "../../icons/notion-icon-urls";

/** Display order for auth holons in the Components tree */
export const LOGIN_HOLON_ORDER = {
  "login-form": 5,
  "login-form-banner": 0,
  "login-email-field": 1,
  "login-submit-control": 2,
  "login-verify-code-field": 3,
  "login-verify-submit-control": 4,
} as const;

/** Icepanel component name: Login Form */
export const LOGIN_FORM_HOLON = {
  id: "login-form",
  label: "Login Form",
  icon: "user" as NotionIconName,
  order: LOGIN_HOLON_ORDER["login-form"],
};

export const LOGIN_FORM_BANNER_HOLON = {
  id: "login-form-banner",
  label: "Login Form Banner",
  icon: "information-circle" as NotionIconName,
  order: LOGIN_HOLON_ORDER["login-form-banner"],
};

export const LOGIN_EMAIL_FIELD_HOLON = {
  id: "login-email-field",
  label: "Email Field",
  icon: "user" as NotionIconName,
  order: LOGIN_HOLON_ORDER["login-email-field"],
};

export const LOGIN_SUBMIT_CONTROL_HOLON = {
  id: "login-submit-control",
  label: "Log In",
  icon: "cursor-click" as NotionIconName,
  order: LOGIN_HOLON_ORDER["login-submit-control"],
};

export const LOGIN_VERIFY_CODE_FIELD_HOLON = {
  id: "login-verify-code-field",
  label: "Verification Code Field",
  icon: "checkmark-list" as NotionIconName,
  order: LOGIN_HOLON_ORDER["login-verify-code-field"],
};

export const LOGIN_VERIFY_SUBMIT_CONTROL_HOLON = {
  id: "login-verify-submit-control",
  label: "Verify Email Address",
  icon: "cursor-click" as NotionIconName,
  order: LOGIN_HOLON_ORDER["login-verify-submit-control"],
};

export const LOGIN_FORM_CHILD_HOLONS = [
  LOGIN_FORM_BANNER_HOLON,
  LOGIN_EMAIL_FIELD_HOLON,
  LOGIN_SUBMIT_CONTROL_HOLON,
  LOGIN_VERIFY_CODE_FIELD_HOLON,
  LOGIN_VERIFY_SUBMIT_CONTROL_HOLON,
];
