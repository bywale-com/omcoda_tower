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
  { token: "c-harbor-wei", firmId: "firm-harbor", contactId: "cr-harbor-3", campaignId: "camp.react.meeting" },
  { token: "c-harbor-haddad", firmId: "firm-harbor", contactId: "cr-harbor-4", campaignId: "camp.optin.day" },
  { token: "c-cedar-ana", firmId: "firm-cedar", contactId: "cr-cedar-1", campaignId: "camp.optin.day" },
  { token: "c-cedar-jon", firmId: "firm-cedar", contactId: "cr-cedar-2", campaignId: "camp.react.meeting" },
  { token: "c-cedar-priya", firmId: "firm-cedar", contactId: "cr-cedar-3", campaignId: "camp.optin.day" },
];

const consent = new Map<string, ConsentRow>([
  ["cr-harbor-1", { basis: "express", silenced: false, source: "contact_workspace", workspaceOptedOut: false }],
  ["cr-harbor-3", { basis: "express", silenced: false, source: "contact_workspace", workspaceOptedOut: false }],
  ["cr-harbor-4", { basis: "none", silenced: false, source: "ignored", workspaceOptedOut: false }],
  ["cr-cedar-1", { basis: "express", silenced: false, source: "contact_workspace", workspaceOptedOut: false }],
  ["cr-cedar-2", { basis: "express", silenced: false, source: "contact_workspace", workspaceOptedOut: false }],
]);

const missing = new Map<string, Array<{ fieldKey: string; label: string }>>([
  [
    "cr-harbor-1",
    [
      { fieldKey: "canadian_skilled_hours", label: "Canadian skilled hours" },
      { fieldKey: "language_clb", label: "Language CLB" },
      { fieldKey: "foreign_work_years", label: "Foreign work years" },
      { fieldKey: "ee_profile_last_updated", label: "EE profile last updated" },
      { fieldKey: "crs_score", label: "CRS score" },
      { fieldKey: "noc", label: "NOC" },
    ],
  ],
  [
    "cr-harbor-2",
    [
      { fieldKey: "canadian_skilled_hours", label: "Canadian skilled hours" },
      { fieldKey: "language_clb", label: "Language CLB" },
      { fieldKey: "ee_profile_exists", label: "Express Entry profile exists" },
    ],
  ],
  [
    "cr-harbor-4",
    [
      { fieldKey: "canadian_skilled_hours", label: "Canadian skilled hours" },
      { fieldKey: "language_clb", label: "Language CLB" },
      { fieldKey: "foreign_work_years", label: "Foreign work years" },
    ],
  ],
  [
    "cr-cedar-1",
    [
      { fieldKey: "canadian_skilled_hours", label: "Canadian skilled hours" },
      { fieldKey: "language_clb", label: "Language CLB" },
      { fieldKey: "crs_score", label: "CRS score" },
      { fieldKey: "noc", label: "NOC" },
    ],
  ],
  [
    "cr-cedar-3",
    [
      { fieldKey: "canadian_skilled_hours", label: "Canadian skilled hours" },
      { fieldKey: "language_clb", label: "Language CLB" },
      { fieldKey: "ee_profile_last_updated", label: "EE profile last updated" },
    ],
  ],
]);

function cup(
  id: string,
  firmId: string,
  contactId: string,
  kind: string | null,
  origin: Upload["origin"],
  fieldKey: string | null,
  bodyText: string | null,
  fileName: string | null,
  createdAt: string,
): Upload {
  return { id, firmId, contactId, kind, origin, fieldKey, bodyText, fileName, createdAt };
}

export const standInContactUploads: Upload[] = [
  cup("cup-harbor-1-hours", "firm-harbor", "cr-harbor-1", "skilled hours note", "custom", null, "1680 hours on the current permit.", null, "2026-08-20T15:10:00.000Z"),
  cup("cup-harbor-1-letter", "firm-harbor", "cr-harbor-1", "employer letter", "kind", null, null, "employer-letter.pdf", "2026-08-18T11:02:00.000Z"),
  cup("cup-harbor-1-pay", "firm-harbor", "cr-harbor-1", "pay stub", "kind", null, null, "june-pay.pdf", "2026-08-14T09:18:00.000Z"),
  cup("cup-harbor-1-passport", "firm-harbor", "cr-harbor-1", "passport", "kind", null, null, "passport-bio.pdf", "2026-08-12T16:40:00.000Z"),
  cup("cup-harbor-1-clb-q", "firm-harbor", "cr-harbor-1", "language_clb", "question", "language_clb", "CLB 9 from the last IELTS.", null, "2026-08-11T13:05:00.000Z"),
  cup("cup-harbor-2-clb", "firm-harbor", "cr-harbor-2", "language_clb", "question", "language_clb", "CLB 9 from the last IELTS.", null, "2026-08-19T09:40:00.000Z"),
  cup("cup-harbor-2-any", "firm-harbor", "cr-harbor-2", null, "any", null, "Extra note from the last consult.", "cole-note.txt", "2026-08-18T10:12:00.000Z"),
  cup("cup-harbor-2-letter", "firm-harbor", "cr-harbor-2", "employer letter", "kind", null, null, "cole-employer.pdf", "2026-08-16T15:33:00.000Z"),
  cup("cup-harbor-2-hours", "firm-harbor", "cr-harbor-2", "skilled hours note", "custom", null, "920 hours so far this year.", null, "2026-08-15T11:08:00.000Z"),
  cup("cup-harbor-3-any", "firm-harbor", "cr-harbor-3", null, "any", null, "Unspecified extra note.", "note.txt", "2026-08-17T16:22:00.000Z"),
  cup("cup-harbor-3-pay", "firm-harbor", "cr-harbor-3", "pay stub", "kind", null, null, "wei-july-pay.pdf", "2026-08-15T08:44:00.000Z"),
  cup("cup-harbor-3-eca", "firm-harbor", "cr-harbor-3", "ECA", "kind", null, null, "wei-eca.pdf", "2026-08-10T19:01:00.000Z"),
  cup("cup-harbor-3-offer", "firm-harbor", "cr-harbor-3", "job offer", "custom", null, "Offer letter is with the employer still.", null, "2026-08-09T12:20:00.000Z"),
  cup("cup-harbor-4-pay", "firm-harbor", "cr-harbor-4", "pay stub", "kind", null, null, "july-pay.pdf", "2026-08-16T08:11:00.000Z"),
  cup("cup-harbor-4-passport", "firm-harbor", "cr-harbor-4", "passport", "kind", null, null, "haddad-passport.pdf", "2026-08-13T17:55:00.000Z"),
  cup("cup-harbor-4-any", "firm-harbor", "cr-harbor-4", null, "any", null, "Called in; asked to hold the file.", null, "2026-08-12T14:02:00.000Z"),
  cup("cup-harbor-4-clb", "firm-harbor", "cr-harbor-4", "language_clb", "question", "language_clb", "Retaking IELTS in September.", null, "2026-08-08T10:30:00.000Z"),
  cup("cup-cedar-1-letter", "firm-cedar", "cr-cedar-1", "employer letter", "kind", null, null, "ana-employer.pdf", "2026-08-19T14:10:00.000Z"),
  cup("cup-cedar-1-pay", "firm-cedar", "cr-cedar-1", "pay stub", "kind", null, null, "ana-june-pay.pdf", "2026-08-17T09:00:00.000Z"),
  cup("cup-cedar-1-hours", "firm-cedar", "cr-cedar-1", "skilled hours note", "custom", null, "1440 hours on the open work permit.", null, "2026-08-16T11:45:00.000Z"),
  cup("cup-cedar-1-clb", "firm-cedar", "cr-cedar-1", "language_clb", "question", "language_clb", "CLB 8.", null, "2026-08-14T18:22:00.000Z"),
  cup("cup-cedar-2-any", "firm-cedar", "cr-cedar-2", null, "any", null, "Prefers a late-afternoon slot.", "jon-note.txt", "2026-08-18T13:40:00.000Z"),
  cup("cup-cedar-2-passport", "firm-cedar", "cr-cedar-2", "passport", "kind", null, null, "jon-passport.pdf", "2026-08-15T07:19:00.000Z"),
  cup("cup-cedar-2-letter", "firm-cedar", "cr-cedar-2", "employer letter", "kind", null, null, "jon-employer.pdf", "2026-08-13T16:05:00.000Z"),
  cup("cup-cedar-2-noc", "firm-cedar", "cr-cedar-2", "noc", "question", "noc", "NOC 21231 on the last NOA.", null, "2026-08-11T12:12:00.000Z"),
  cup("cup-cedar-3-pay", "firm-cedar", "cr-cedar-3", "pay stub", "kind", null, null, "priya-july-pay.pdf", "2026-08-19T08:50:00.000Z"),
  cup("cup-cedar-3-eca", "firm-cedar", "cr-cedar-3", "ECA", "kind", null, null, "priya-eca.pdf", "2026-08-17T15:27:00.000Z"),
  cup("cup-cedar-3-any", "firm-cedar", "cr-cedar-3", null, "any", null, "Has not Agreed yet; sent the docs ahead.", null, "2026-08-16T09:33:00.000Z"),
  cup("cup-cedar-3-hours", "firm-cedar", "cr-cedar-3", "skilled hours note", "custom", null, "1100 hours; still accumulating.", null, "2026-08-12T20:14:00.000Z"),
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

const STORAGE_KEY = "tower.standin.workspaceOptedOut";

function storageGet(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storageSet(value: string) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* private mode */
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* private mode */
  }
}

function readPersistedOut(): Set<string> {
  try {
    const raw = storageGet();
    const ids = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

function persistOut(contactId: string) {
  const ids = readPersistedOut();
  ids.add(contactId);
  storageSet(JSON.stringify([...ids]));
}

function isOut(contactId: string): boolean {
  return Boolean(consent.get(contactId)?.workspaceOptedOut) || readPersistedOut().has(contactId);
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
  } else if (link.campaignId === "camp.optin.day" || link.campaignId === "camp.reeng.nudge") {
    state = "form";
    title = "A few facts so we can continue";
    instruction = `${firmName} asked for these so we can keep going.`;
  } else if (link.campaignId === "camp.react.meeting") {
    state = "meeting";
    title = "Book a time";
    instruction = `${firmName} is ready when you are.`;
  }
  const files = standInContactUploads.filter((u) => u.contactId === link.contactId);
  const kinds = [...new Set(files.map((u) => u.kind).filter((k): k is string => Boolean(k)))];
  const questions = missing.get(link.contactId) ?? [];
  const history: ContactSeatPayload["history"] = [
    {
      id: "ask-consent",
      kind: "consent",
      title: "Consent",
      outstanding: needsConsent,
      campaignId: null,
      body: `${firmName} would like to send you updates about your file when something is needed. You can opt out later.`,
    },
  ];
  if (link.campaignId === "camp.optin.day" || link.campaignId === "camp.reeng.nudge") {
    history.push({
      id: "ask-form",
      kind: "form",
      title: "Launch day",
      outstanding: true,
      campaignId: link.campaignId,
      body: `${firmName} asked for facts so the file can continue.`,
    });
  }
  if (link.campaignId === "camp.react.meeting") {
    history.push({
      id: "ask-meeting",
      kind: "meeting",
      title: "Book a meeting",
      outstanding: true,
      campaignId: "camp.react.meeting",
      body: `${firmName} asked you to book a meeting.`,
    });
  }
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
      meetingSlots:
        state === "meeting"
          ? [1, 2, 3].map((i) => new Date(Date.now() + i * 86400000).toISOString())
          : undefined,
    },
    history,
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
  persistOut(contactId);
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
