import type { WorkflowTriggerEvent } from "./automationWorkflows";

export type TriggerSelectId =
  | "fact_writebacks"
  | "campaign_failure"
  | "consent_records.opt_out"
  | "ct_firms"
  | "audit.completed"
  | "contact_import"
  | "contact.created"
  | "contact_uploaded"
  | "objective_met"
  | "reference.pack";

export type TriggerLocalLayer =
  | { kind: "firm" }
  | { kind: "contact" }
  | { kind: "instance"; label: string; everyLabel: string; selectLabel: string };

export type TriggerSelectEvent = {
  id: TriggerSelectId;
  label: string;
  /** Dispatch token. Null = row may show, nothing fires. */
  eventName: WorkflowTriggerEvent | null;
  silent?: boolean;
  layers: TriggerLocalLayer[];
};

/** A26 named list. Do not add eligibility / halt / meeting. */
export const TRIGGER_SELECT_EVENTS: TriggerSelectEvent[] = [
  {
    id: "fact_writebacks",
    label: "Form submitted",
    eventName: "fact_writebacks",
    layers: [
      { kind: "firm" },
      { kind: "instance", label: "Form", everyLabel: "Every form", selectLabel: "Select form" },
    ],
  },
  {
    id: "campaign_failure",
    label: "Campaign failed",
    eventName: "campaign_failure",
    layers: [
      { kind: "firm" },
      { kind: "instance", label: "Campaign", everyLabel: "Every campaign", selectLabel: "Select campaign" },
    ],
  },
  {
    id: "consent_records.opt_out",
    label: "Opted out / unsubscribed",
    eventName: "consent_records.opt_out",
    layers: [{ kind: "firm" }, { kind: "contact" }],
  },
  {
    id: "ct_firms",
    label: "Firm created / provisioned",
    eventName: "ct_firms",
    layers: [{ kind: "firm" }],
  },
  {
    id: "audit.completed",
    label: "Audit finished",
    eventName: "audit.completed",
    layers: [{ kind: "firm" }],
  },
  {
    id: "contact_import",
    label: "Contact import",
    eventName: "contact_import",
    layers: [
      { kind: "firm" },
      { kind: "instance", label: "Import", everyLabel: "Every import", selectLabel: "Select import" },
    ],
  },
  {
    id: "contact.created",
    label: "New contact",
    eventName: "contact.created",
    layers: [{ kind: "firm" }, { kind: "contact" }],
  },
  {
    id: "contact_uploaded",
    label: "Contact uploaded information",
    eventName: "contact_uploaded",
    layers: [
      { kind: "firm" },
      { kind: "instance", label: "Kind", everyLabel: "Any kind", selectLabel: "Select kind" },
    ],
  },
  {
    id: "objective_met",
    label: "An objective was met",
    eventName: "objective_met",
    layers: [
      { kind: "firm" },
      {
        kind: "instance",
        label: "Objective",
        everyLabel: "Every objective",
        selectLabel: "Select objective",
      },
    ],
  },
  {
    id: "reference.pack",
    label: "Reference pack updated",
    eventName: null,
    silent: true,
    layers: [],
  },
];

export function triggerSelectEvent(
  id: string | undefined,
  eventName?: string | null,
): TriggerSelectEvent {
  return (
    TRIGGER_SELECT_EVENTS.find((row) => row.id === id) ??
    TRIGGER_SELECT_EVENTS.find((row) => row.eventName && row.eventName === eventName) ??
    TRIGGER_SELECT_EVENTS.find((row) => row.id === "contact_import")!
  );
}

export const WIRE_ADD_KINDS: { blockId: string; title: string; hint: string }[] = [
  { blockId: "get-records", title: "Get", hint: "Retrieve data" },
  { blockId: "rule-immigration-service-eligibility", title: "Rule", hint: "Branch logic" },
  { blockId: "action-sequence", title: "Action", hint: "Run a task or update" },
  { blockId: "condition-if", title: "If", hint: "Two wires — true / false" },
  { blockId: "condition-switch", title: "Switch", hint: "Many paths plus fallback" },
  { blockId: "wait-approval", title: "Wait", hint: "Park until approval or a duration" },
  { blockId: "operation-exit", title: "Exit", hint: "End the workflow" },
];

function payloadString(payload: Record<string, unknown> | undefined, keys: string[]): string | null {
  if (!payload) return null;
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/** Instance axis on the write. Null = that axis is unspecified on the payload. */
export function triggerLocalRefFromPayload(
  eventName: string,
  payload?: Record<string, unknown>,
): string | null {
  if (eventName === "fact_writebacks") return payloadString(payload, ["form_ref", "formRef"]);
  if (eventName === "campaign_failure") return payloadString(payload, ["campaign_id", "campaignId"]);
  if (eventName === "ct_firms") return payloadString(payload, ["id", "firm_id", "firmId"]);
  if (eventName === "consent_records.opt_out") return payloadString(payload, ["contact_id", "contactId"]);
  if (eventName === "contact_import") return payloadString(payload, ["import_batch_id", "importBatchId"]);
  if (eventName === "contact.created") return payloadString(payload, ["contact_id", "contactId", "id"]);
  if (eventName === "consent_records.sequenced") return payloadString(payload, ["sequence_id", "sequenceId"]);
  if (eventName === "contact_uploaded") return payloadString(payload, ["kind"]);
  if (eventName === "objective_met") {
    return payloadString(payload, [
      "campaign_objective_id",
      "campaignObjectiveId",
      "campaign_id",
      "campaignId",
    ]);
  }
  return null;
}

/** Dispatch: test only axes the operator specified. */
export function triggerLocalAxesMatch(
  data: {
    grain?: string | null;
    localRef?: string | null;
    localFirmId?: string | null;
    localContactIds?: string[] | null;
  },
  opts: {
    firmId?: string;
    eventName: string;
    payload?: Record<string, unknown>;
    contactIds?: string[];
  },
): boolean {
  if (String(data.grain ?? "global") !== "local") return true;
  const firmId = data.localFirmId?.trim();
  if (firmId) {
    const writeFirm =
      payloadString(opts.payload, ["firm_id", "firmId"]) ?? opts.firmId ?? null;
    if (writeFirm !== firmId) return false;
  }
  const contacts = (data.localContactIds ?? []).map(String).filter(Boolean);
  if (contacts.length) {
    const cid = payloadString(opts.payload, ["contact_id", "contactId"]);
    const incoming = cid ? [cid] : (opts.contactIds ?? []);
    if (!incoming.some((id) => contacts.includes(id))) return false;
  }
  const localRef = data.localRef?.trim();
  if (localRef && triggerLocalRefFromPayload(opts.eventName, opts.payload) !== localRef) {
    return false;
  }
  return true;
}
