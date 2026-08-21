/**
 * Stand-in contact seat. Mirrors 019 + 020 + seed 004 so Files is not empty.
 * Workspace-out is a consent flag, not email silence.
 */
import type { ContactSeatPayload, ContactSeatRefuse } from "../contactSeatTypes";

type Upload = {
  id: string;
  firmId: string;
  contactId: string;
  kind: string | null;
  origin: string;
  fieldKey: string | null;
  bodyText: string | null;
  fileName: string | null;
  createdAt: string;
};

type Link = {
  token: string;
  firmId: string;
  contactId: string;
  campaignId: string | null;
};

type ConsentRow = {
  basis: "express" | "implied" | "none";
  silenced: boolean;
  source: string | null;
  workspaceOptedOut: boolean;
};

export type StandInBookPerson = {
  id: string;
  firmId: string;
  name: string | null;
  email: string | null;
  firmName?: string | null;
};

const firms: Record<string, string> = {
  "firm-harbor": "Harbor RCIC",
  "firm-standin-harbor": "Harbor RCIC",
  "firm-cedar": "Cedar Immigration",
};
const contacts: Record<string, string> = {
  "cr-harbor-1": "Daniel Okonkwo",
  "cr-harbor-2": "Amina Cole",
  "cr-harbor-3": "Wei Chen",
  "cr-harbor-4": "Samira Haddad",
  "cr-cedar-1": "Ana Ruiz",
  "cr-cedar-2": "Jon Hale",
  "cr-cedar-3": "Priya Shah",
};

const links: Link[] = [
  { token: "c-harbor-okonkwo", firmId: "firm-harbor", contactId: "cr-harbor-1", campaignId: "camp.optin.day" },
  { token: "c-harbor-cole", firmId: "firm-harbor", contactId: "cr-harbor-2", campaignId: "camp.optin.day" },
];

const consent = new Map<string, ConsentRow>([
  ["cr-harbor-1", { basis: "express", silenced: false, source: "contact_workspace", workspaceOptedOut: false }],
]);

const missing = new Map<string, Array<{ fieldKey: string; label: string }>>([
  [
    "cr-harbor-1",
    [
      { fieldKey: "canadian_skilled_hours", label: "Canadian skilled hours" },
      { fieldKey: "language_clb", label: "Language CLB" },
      { fieldKey: "foreign_work_years", label: "Foreign work years" },
      { fieldKey: "ee_profile_last_updated", label: "EE profile last updated" },
    ],
  ],
  ["cr-harbor-2", [{ fieldKey: "canadian_skilled_hours", label: "Canadian skilled hours" }]],
]);

export const standInContactUploads: Upload[] = [
  {
    id: "cup-harbor-1-hours",
    firmId: "firm-harbor",
    contactId: "cr-harbor-1",
    kind: "skilled hours note",
    origin: "custom",
    fieldKey: null,
    bodyText: "1680 hours on the current permit.",
    fileName: null,
    createdAt: "2026-08-20T15:10:00.000Z",
  },
  {
    id: "cup-harbor-1-letter",
    firmId: "firm-harbor",
    contactId: "cr-harbor-1",
    kind: "employer letter",
    origin: "kind",
    fieldKey: null,
    bodyText: null,
    fileName: "employer-letter.pdf",
    createdAt: "2026-08-18T11:02:00.000Z",
  },
  {
    id: "cup-harbor-2-clb",
    firmId: "firm-harbor",
    contactId: "cr-harbor-2",
    kind: "language_clb",
    origin: "question",
    fieldKey: "language_clb",
    bodyText: "CLB 9 from the last IELTS.",
    fileName: null,
    createdAt: "2026-08-19T09:40:00.000Z",
  },
  {
    id: "cup-harbor-3-any",
    firmId: "firm-harbor",
    contactId: "cr-harbor-3",
    kind: null,
    origin: "any",
    fieldKey: null,
    bodyText: "Unspecified extra note.",
    fileName: "note.txt",
    createdAt: "2026-08-17T16:22:00.000Z",
  },
  {
    id: "cup-harbor-4-pay",
    firmId: "firm-harbor",
    contactId: "cr-harbor-4",
    kind: "pay stub",
    origin: "kind",
    fieldKey: null,
    bodyText: null,
    fileName: "july-pay.pdf",
    createdAt: "2026-08-16T08:11:00.000Z",
  },
];

function linkOf(token: string): Link | undefined {
  return links.find((row) => row.token === token);
}

function linkByContact(contactId: string): Link | undefined {
  return links.find((row) => row.contactId === contactId);
}

function missingRefuse(): ContactSeatRefuse {
  return { ok: false, refuse: "missing", message: "This link could not be opened. Ask the firm for a new one." };
}

function workspaceOutRefuse(): ContactSeatRefuse {
  return { ok: false, refuse: "workspace_opted_out", message: "This workspace is no longer available." };
}

function isOut(contactId: string): boolean {
  return Boolean(consent.get(contactId)?.workspaceOptedOut);
}

function rememberPerson(person: StandInBookPerson) {
  if (person.firmName) firms[person.firmId] = person.firmName;
  if (person.name) contacts[person.id] = person.name;
}

function linkForPerson(person: StandInBookPerson): Link {
  rememberPerson(person);
  return (
    linkByContact(person.id) ?? {
      token: `view-${person.id}`,
      firmId: person.firmId,
      contactId: person.id,
      campaignId: null,
    }
  );
}

function project(link: Link, campaignId?: string): ContactSeatPayload {
  if (campaignId) link.campaignId = campaignId;
  const firmName = firms[link.firmId] ?? "the firm";
  const row = consent.get(link.contactId);
  const silenced = Boolean(row?.silenced);
  const needsConsent = !row || (row.basis === "none" && row.source !== "ignored");
  let state: ContactSeatPayload["now"]["state"] = "empty";
  let title = "Nothing needed right now";
  let instruction = `${firmName} will put the next ask here.`;
  if (needsConsent) {
    state = "consent";
    title = `${firmName} would like to stay in touch`;
    instruction = "Agree or ignore before we ask for anything else.";
  } else if (link.campaignId === "camp.optin.day") {
    state = "form";
    title = "A few facts so we can continue";
    instruction = `${firmName} asked for these so we can keep going.`;
  }
  const files = standInContactUploads.filter((u) => u.contactId === link.contactId);
  const kinds = [...new Set(files.map((u) => u.kind).filter((k): k is string => Boolean(k)))];
  const questions = missing.get(link.contactId) ?? [];
  return {
    ok: true,
    tokenValid: true,
    firm: { id: link.firmId, name: firmName },
    contact: { id: link.contactId, name: contacts[link.contactId] ?? null },
    silenced,
    now: {
      state,
      title,
      instruction,
      consentCopy: `${firmName} would like to send you updates about your file when something is needed. You can opt out later.`,
      formFields: state === "form" ? questions : undefined,
      meetingSlots: state === "meeting" ? [new Date(Date.now() + 86400000).toISOString()] : undefined,
    },
    history: [
      {
        id: "ask-consent",
        kind: "consent",
        title: "Consent",
        outstanding: needsConsent,
        campaignId: null,
        body: `${firmName} would like to send you updates about your file when something is needed. You can opt out later.`,
      },
      {
        id: "ask-form",
        kind: "form",
        title: "Launch day",
        outstanding: !needsConsent && link.campaignId === "camp.optin.day",
        campaignId: "camp.optin.day",
        body: `${firmName} asked for facts so the file can continue.`,
      },
    ],
    files: files.map((u) => ({
      id: u.id,
      kind: u.kind,
      origin: u.origin,
      fieldKey: u.fieldKey,
      bodyText: u.bodyText,
      fileName: u.fileName,
      createdAt: u.createdAt,
    })),
    search: [
      ...kinds.map((kind) => ({ kind: "kind" as const, value: kind, label: kind })),
      ...questions.map((q) => ({ kind: "question" as const, value: q.fieldKey, label: q.label })),
    ],
    kinds,
  };
}

function asSeatFromLink(link: Link | undefined, campaignId?: string): ContactSeatPayload | ContactSeatRefuse {
  if (!link) return missingRefuse();
  if (isOut(link.contactId)) return workspaceOutRefuse();
  return project(link, campaignId);
}

function markWorkspaceOut(contactId: string): ContactSeatRefuse {
  const prev = consent.get(contactId);
  consent.set(contactId, {
    basis: prev?.basis ?? "none",
    silenced: prev?.silenced ?? false,
    source: "contact_workspace.workspace_opt_out",
    workspaceOptedOut: true,
  });
  return workspaceOutRefuse();
}

export const standInContactSeat = {
  isWorkspaceOut(contactId: string) {
    return isOut(contactId);
  },
  tokenForContact(contactId: string) {
    return linkByContact(contactId)?.token ?? null;
  },
  load(token: string, campaignId?: string) {
    return Promise.resolve(asSeatFromLink(linkOf(token), campaignId));
  },
  loadContact(person: StandInBookPerson, campaignId?: string) {
    return Promise.resolve(asSeatFromLink(linkForPerson(person), campaignId));
  },
  consent(token: string, action: "agree" | "ignore") {
    const link = linkOf(token);
    if (!link) return Promise.resolve(missingRefuse());
    if (isOut(link.contactId)) return Promise.resolve(workspaceOutRefuse());
    const prev = consent.get(link.contactId);
    consent.set(link.contactId, {
      basis: action === "agree" ? "express" : "none",
      silenced: prev?.silenced ?? false,
      source: action === "agree" ? "contact_workspace" : "ignored",
      workspaceOptedOut: prev?.workspaceOptedOut ?? false,
    });
    return Promise.resolve(project(link));
  },
  consentContact(person: StandInBookPerson, action: "agree" | "ignore") {
    const link = linkForPerson(person);
    if (isOut(link.contactId)) return Promise.resolve(workspaceOutRefuse());
    const prev = consent.get(link.contactId);
    consent.set(link.contactId, {
      basis: action === "agree" ? "express" : "none",
      silenced: prev?.silenced ?? false,
      source: action === "agree" ? "contact_workspace" : "ignored",
      workspaceOptedOut: prev?.workspaceOptedOut ?? false,
    });
    return Promise.resolve(project(link));
  },
  silence(token: string) {
    const link = linkOf(token);
    if (!link) return Promise.resolve(missingRefuse());
    if (isOut(link.contactId)) return Promise.resolve(workspaceOutRefuse());
    return Promise.resolve(markWorkspaceOut(link.contactId));
  },
  silenceContact(person: StandInBookPerson) {
    if (isOut(person.id)) return Promise.resolve(workspaceOutRefuse());
    return Promise.resolve(markWorkspaceOut(person.id));
  },
  facts(token: string, answers: Array<{ fieldKey: string; value: unknown }>) {
    const link = linkOf(token);
    if (!link) return Promise.resolve(missingRefuse());
    if (isOut(link.contactId)) return Promise.resolve(workspaceOutRefuse());
    const left = (missing.get(link.contactId) ?? []).filter(
      (row) => !answers.some((a) => a.fieldKey === row.fieldKey),
    );
    missing.set(link.contactId, left);
    return Promise.resolve(project(link));
  },
  factsContact(person: StandInBookPerson, answers: Array<{ fieldKey: string; value: unknown }>) {
    const link = linkForPerson(person);
    if (isOut(link.contactId)) return Promise.resolve(workspaceOutRefuse());
    const left = (missing.get(link.contactId) ?? []).filter(
      (row) => !answers.some((a) => a.fieldKey === row.fieldKey),
    );
    missing.set(link.contactId, left);
    return Promise.resolve(project(link));
  },
  book(token: string) {
    return Promise.resolve(asSeatFromLink(linkOf(token)));
  },
  bookContact(person: StandInBookPerson) {
    return Promise.resolve(asSeatFromLink(linkForPerson(person)));
  },
  upload(
    token: string,
    input: {
      origin: "kind" | "custom" | "question" | "any";
      kind?: string | null;
      fieldKey?: string | null;
      bodyText?: string | null;
      fileName?: string | null;
    },
  ) {
    const link = linkOf(token);
    if (!link) return Promise.resolve(missingRefuse());
    if (isOut(link.contactId)) return Promise.resolve(workspaceOutRefuse());
    const kind =
      input.origin === "any" ? null : input.origin === "question" ? input.fieldKey ?? input.kind ?? null : input.kind ?? null;
    standInContactUploads.unshift({
      id: `cup-standin-${Date.now()}`,
      firmId: link.firmId,
      contactId: link.contactId,
      kind,
      origin: input.origin,
      fieldKey: input.origin === "question" ? input.fieldKey ?? null : null,
      bodyText: input.bodyText ?? null,
      fileName: input.fileName ?? null,
      createdAt: new Date().toISOString(),
    });
    return Promise.resolve(project(link));
  },
  uploadContact(
    person: StandInBookPerson,
    input: {
      origin: "kind" | "custom" | "question" | "any";
      kind?: string | null;
      fieldKey?: string | null;
      bodyText?: string | null;
      fileName?: string | null;
    },
  ) {
    const link = linkForPerson(person);
    if (isOut(link.contactId)) return Promise.resolve(workspaceOutRefuse());
    const kind =
      input.origin === "any" ? null : input.origin === "question" ? input.fieldKey ?? input.kind ?? null : input.kind ?? null;
    standInContactUploads.unshift({
      id: `cup-standin-${Date.now()}`,
      firmId: link.firmId,
      contactId: link.contactId,
      kind,
      origin: input.origin,
      fieldKey: input.origin === "question" ? input.fieldKey ?? null : null,
      bodyText: input.bodyText ?? null,
      fileName: input.fileName ?? null,
      createdAt: new Date().toISOString(),
    });
    return Promise.resolve(project(link));
  },
};
