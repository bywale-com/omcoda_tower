import {
  LOGIN_EMAIL_FIELD_HOLON,
  LOGIN_FORM_BANNER_HOLON,
  LOGIN_FORM_HOLON,
  LOGIN_HOLON_ORDER,
  LOGIN_SUBMIT_CONTROL_HOLON,
  LOGIN_VERIFY_CODE_FIELD_HOLON,
  LOGIN_VERIFY_SUBMIT_CONTROL_HOLON,
} from "../loginHolons";
import type { RegisterHolonMeta } from "./types";

const LOGIN_SIGN_IN = "login-sign-in";
const LOGIN_VERIFY = "login-verify";

export const LOGIN_REGISTER_HOLONS: RegisterHolonMeta[] = [
  {
    ...LOGIN_FORM_HOLON,
    order: LOGIN_HOLON_ORDER["login-form"],
    parentId: null,
    views: [LOGIN_SIGN_IN, LOGIN_VERIFY],
    render: "login-form",
  },
  {
    ...LOGIN_FORM_BANNER_HOLON,
    order: LOGIN_HOLON_ORDER["login-form-banner"],
    parentId: LOGIN_FORM_HOLON.id,
    views: [LOGIN_SIGN_IN, LOGIN_VERIFY],
    render: "login-form-banner",
  },
  {
    ...LOGIN_EMAIL_FIELD_HOLON,
    order: LOGIN_HOLON_ORDER["login-email-field"],
    parentId: LOGIN_FORM_HOLON.id,
    views: [LOGIN_SIGN_IN],
    render: "login-email-field",
  },
  {
    ...LOGIN_SUBMIT_CONTROL_HOLON,
    order: LOGIN_HOLON_ORDER["login-submit-control"],
    parentId: LOGIN_FORM_HOLON.id,
    views: [LOGIN_SIGN_IN],
    render: "login-submit-control",
  },
  {
    ...LOGIN_VERIFY_CODE_FIELD_HOLON,
    order: LOGIN_HOLON_ORDER["login-verify-code-field"],
    parentId: LOGIN_FORM_HOLON.id,
    views: [LOGIN_VERIFY],
    render: "login-verify-code-field",
  },
  {
    ...LOGIN_VERIFY_SUBMIT_CONTROL_HOLON,
    order: LOGIN_HOLON_ORDER["login-verify-submit-control"],
    parentId: LOGIN_FORM_HOLON.id,
    views: [LOGIN_VERIFY],
    render: "login-verify-submit-control",
  },
];
