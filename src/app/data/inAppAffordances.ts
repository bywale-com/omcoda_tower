/**
 * In-app Action inventory = persist-bound desk write-buttons, grouped by module.
 * SA 09:35 walk + A33 grouping. Automations consumes; it does not author a second Start Audit.
 * Agents Launch / Add contact stay on the Agents card (A14). Hub leftovers are not desks.
 * Paint (Commercial Save, Acquisition Save, tag chips) is not inventory.
 */
export type InAppAffordanceId =
  | "upload_book"
  | "start_audit"
  | "reaudit"
  | "confirm_book"
  | "authorize_book_file"
  | "authorize_book_crm"
  | "revoke_grant"
  | "provision"
  | "issue_invite"
  | "halt_outreach"
  | "lift_halt"
  | "bind_active"
  | "bind_armed"
  | "publish_reference"
  | "publish_eval_pack"
  | "eligibility_pathways"
  | "agents_save"
  | "agents_settings"
  | "automations_save"
  | "automations_audience"
  | "automations_launch"
  | "eligibility_pipeline"
  | "allocate_subdomain"
  | "confirm_booking"
  | "consent_agree"
  | "consent_silence";

export type InAppVerb = "set" | "person";

/** Parameters = that button's own inputs. Not Get's Module / Every / Select cascade. */
export type InAppParamKind =
  | "none"
  | "filename"
  | "book"
  | "provision"
  | "invite"
  | "firm"
  | "firm_contact";

export type InAppAffordance = {
  id: InAppAffordanceId;
  module: string;
  label: string;
  /** Walker token when one exists. Null = face may list; walk silent until wrap. */
  actionType: "run_audit" | null;
  verb: InAppVerb;
  params: InAppParamKind;
};

/** A33 module order, then remaining persist desks. */
export const IN_APP_MODULE_ORDER = [
  "Book readiness",
  "Contacts",
  "Prepared",
  "Provision",
  "Consultant workspace",
  "Firm operations bind",
  "Reference data",
  "Configuration libraries",
  "Agents",
  "Automations",
  "Sending infrastructure",
  "Contact portal",
] as const;

export const IN_APP_AFFORDANCES: InAppAffordance[] = [
  {
    id: "upload_book",
    module: "Book readiness",
    label: "Upload book CSV",
    actionType: null,
    verb: "set",
    params: "filename",
  },
  {
    id: "start_audit",
    module: "Book readiness",
    label: "Start Audit run",
    actionType: "run_audit",
    verb: "set",
    params: "book",
  },
  {
    id: "reaudit",
    module: "Book readiness",
    label: "Re-audit remainder",
    actionType: "run_audit",
    verb: "set",
    params: "book",
  },
  {
    id: "confirm_book",
    module: "Contacts",
    label: "Confirm book for Tower",
    actionType: null,
    verb: "set",
    params: "filename",
  },
  {
    id: "authorize_book_file",
    module: "Prepared",
    label: "Authorize book (file)",
    actionType: null,
    verb: "set",
    params: "filename",
  },
  {
    id: "authorize_book_crm",
    module: "Prepared",
    label: "Authorize book (CRM)",
    actionType: null,
    verb: "set",
    params: "firm",
  },
  {
    id: "revoke_grant",
    module: "Prepared",
    label: "Revoke",
    actionType: null,
    verb: "set",
    params: "firm",
  },
  {
    id: "provision",
    module: "Provision",
    label: "Provision",
    actionType: null,
    verb: "set",
    params: "provision",
  },
  {
    id: "issue_invite",
    module: "Provision",
    label: "Issue invite",
    actionType: null,
    verb: "set",
    params: "invite",
  },
  {
    id: "halt_outreach",
    module: "Consultant workspace",
    label: "Halt outreach",
    actionType: null,
    verb: "person",
    params: "firm_contact",
  },
  {
    id: "lift_halt",
    module: "Consultant workspace",
    label: "Lift",
    actionType: null,
    verb: "person",
    params: "firm_contact",
  },
  {
    id: "bind_active",
    module: "Firm operations bind",
    label: "Active",
    actionType: null,
    verb: "set",
    params: "firm",
  },
  {
    id: "bind_armed",
    module: "Firm operations bind",
    label: "Armed",
    actionType: null,
    verb: "set",
    params: "firm",
  },
  {
    id: "publish_reference",
    module: "Reference data",
    label: "Publish version",
    actionType: null,
    verb: "set",
    params: "none",
  },
  {
    id: "publish_eval_pack",
    module: "Configuration libraries",
    label: "Publish evaluation pack",
    actionType: null,
    verb: "set",
    params: "none",
  },
  {
    id: "eligibility_pathways",
    module: "Configuration libraries",
    label: "Eligibility pathways",
    actionType: null,
    verb: "set",
    params: "none",
  },
  {
    id: "agents_save",
    module: "Agents",
    label: "Save",
    actionType: null,
    verb: "set",
    params: "none",
  },
  {
    id: "agents_settings",
    module: "Agents",
    label: "Agents settings",
    actionType: null,
    verb: "set",
    params: "none",
  },
  {
    id: "automations_save",
    module: "Automations",
    label: "Save",
    actionType: null,
    verb: "set",
    params: "none",
  },
  {
    id: "automations_audience",
    module: "Automations",
    label: "Add contact",
    actionType: null,
    verb: "person",
    params: "firm_contact",
  },
  {
    id: "automations_launch",
    module: "Automations",
    label: "Launch workflow",
    actionType: null,
    verb: "set",
    params: "none",
  },
  {
    id: "eligibility_pipeline",
    module: "Automations",
    label: "Eligibility pipeline",
    actionType: null,
    verb: "set",
    params: "none",
  },
  {
    id: "allocate_subdomain",
    module: "Sending infrastructure",
    label: "Allocate subdomain",
    actionType: null,
    verb: "set",
    params: "firm",
  },
  {
    id: "confirm_booking",
    module: "Contact portal",
    label: "Confirm booking",
    actionType: null,
    verb: "person",
    params: "firm_contact",
  },
  {
    id: "consent_agree",
    module: "Contact portal",
    label: "Agree",
    actionType: null,
    verb: "person",
    params: "firm_contact",
  },
  {
    id: "consent_silence",
    module: "Contact portal",
    label: "Silence / Opt out",
    actionType: null,
    verb: "person",
    params: "firm_contact",
  },
];

export function inAppAffordance(id: string | undefined): InAppAffordance | undefined {
  return IN_APP_AFFORDANCES.find((row) => row.id === id);
}

export function inAppModules(): string[] {
  const present = new Set(IN_APP_AFFORDANCES.map((row) => row.module));
  return IN_APP_MODULE_ORDER.filter((module) => present.has(module));
}
