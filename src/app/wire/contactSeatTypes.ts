/** Contact workspace projection. Rows come from tables, not painted SPA catalogs. */

export type ContactSeatNowState = "silenced" | "consent" | "form" | "meeting" | "empty";

export type ContactSeatHistoryRow = {
  id: string;
  kind: "consent" | "form" | "meeting";
  title: string;
  outstanding: boolean;
  campaignId: string | null;
  body: string;
};

export type ContactSeatUploadRow = {
  id: string;
  kind: string | null;
  origin: string;
  fieldKey: string | null;
  bodyText: string | null;
  fileName: string | null;
  createdAt: string;
};

export type ContactSeatPayload = {
  ok: true;
  tokenValid: true;
  firm: { id: string; name: string };
  contact: { id: string; name: string | null };
  silenced: boolean;
  now: {
    state: ContactSeatNowState;
    title: string;
    instruction: string;
    consentCopy?: string;
    formFields?: Array<{ fieldKey: string; label: string }>;
    meetingSlots?: string[];
  };
  history: ContactSeatHistoryRow[];
  files: ContactSeatUploadRow[];
  search: Array<{ kind: "kind" | "question"; value: string; label: string }>;
  kinds: string[];
};

export type ContactSeatRefuse = {
  ok: false;
  refuse: "missing" | "expired" | "invalidated" | "workspace_opted_out";
  message: string;
};

export const SEED_CONTACT_TOKEN = "c-harbor-okonkwo";
