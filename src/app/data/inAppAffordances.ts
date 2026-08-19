/**
 * In-app Action inventory = desk write-buttons, grouped by module.
 * Automations consumes. It does not author a second Start Audit.
 * Hub leftovers are not desks.
 */
export type InAppAffordanceId = "start_audit" | "confirm_book" | "provision";

export type InAppVerb = "set" | "person";

export type InAppAffordance = {
  id: InAppAffordanceId;
  module: string;
  label: string;
  /** Walker token when one exists. Null = face may list; walk silent until wrap. */
  actionType: "run_audit" | null;
  verb: InAppVerb;
};

export const IN_APP_AFFORDANCES: InAppAffordance[] = [
  {
    id: "start_audit",
    module: "Book readiness",
    label: "Start Audit run",
    actionType: "run_audit",
    verb: "set",
  },
  {
    id: "confirm_book",
    module: "Contacts",
    label: "Confirm book for Tower",
    actionType: null,
    verb: "set",
  },
  {
    id: "provision",
    module: "Firms",
    label: "Provision",
    actionType: null,
    verb: "set",
  },
];

export function inAppAffordance(id: string | undefined): InAppAffordance | undefined {
  return IN_APP_AFFORDANCES.find((row) => row.id === id);
}

export function inAppModules(): string[] {
  return [...new Set(IN_APP_AFFORDANCES.map((row) => row.module))];
}
