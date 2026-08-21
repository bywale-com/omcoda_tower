/**
 * Event Test contract (017). Write-set + specimen values for door-2 Test.
 * Ant does not hardcode field lists — trees come from these tables.
 * Never UPDATE a shipping version; bump both. Test reads max(version).
 */

export type EventWriteSetRow = {
  event_name: string;
  version: number;
  table_name: string;
  ord: number;
};

export type EventTestDataRow = {
  id: string;
  event_name: string;
  version: number;
  table_name: string;
  ord: number;
  body: Record<string, unknown>;
};

export type EventTestWrite = Record<string, unknown> & {
  table: string;
  id: string;
  contact_id?: string | null;
};

export type EventTestHandle = {
  eventName: string;
  version: number;
  door: 1 | 2;
  writeSet: Array<{ table_name: string; ord: number }>;
  writes: EventTestWrite[];
};

export const HARBOR_FIRM_ID = "firm-standin-harbor";
export const HARBOR_FIRM = "Harbor RCIC";
export const CEDAR_FIRM_ID = "firm-cedar";
export const CEDAR_FIRM = "Cedar Immigration";
export const HARBOR_CONSULTANT = "Amira Chen";
export const CONTRACT_VERSION = 1;

const STAMP = "2026-08-12T14:22:00.000Z";
const FORM_REF = "form.intake.express-entry.v1";
const IMPORT_ID = "imp-harbor-book-2026-08-12";
const AUDIT_ID = "arun-harbor-book-2026-08-12";
const MARITA_ID = "cr-01HZ8K4N7C2D9FQW3X8Y6M5P0R";

function harborContact(opts: {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  importBatchId?: string | null;
  createdAt?: string;
}): Record<string, unknown> {
  return {
    id: opts.id,
    firm_id: HARBOR_FIRM_ID,
    firm: HARBOR_FIRM,
    name: opts.name,
    email: opts.email ?? null,
    phone: opts.phone ?? null,
    import_batch_id: opts.importBatchId ?? null,
    created_at: opts.createdAt ?? STAMP,
  };
}

/** Harbor book.csv — sixteen people, mixed reachability. Values are the point. */
const HARBOR_BOOK: Array<{
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}> = [
  { id: "cr-harbor-okonkwo", name: "Daniel Okonkwo", email: "daniel.okonkwo@example.com", phone: "+1-604-555-0142" },
  { id: "cr-harbor-cole", name: "Amina Cole", email: "amina.cole@example.com", phone: "+1-604-555-0191" },
  { id: "cr-harbor-chen", name: "Wei Chen", email: "wei.chen@example.com", phone: "+1-778-555-0164" },
  { id: "cr-harbor-haddad", name: "Samira Haddad", email: "samira.haddad@example.com", phone: "+1-604-555-0177" },
  { id: "cr-harbor-vasquez", name: "Elena Vasquez", email: "elena.vasquez@example.com", phone: "+1-604-555-0183" },
  { id: "cr-harbor-okada", name: "Tomokazu Okada", email: "tom.okada@example.com", phone: "+1-416-555-0198" },
  { id: "cr-harbor-npatel", name: "Nina Patel", email: "nina.patel@example.com", phone: "+1-403-555-0167" },
  { id: "cr-harbor-hassan", name: "Omar Hassan", email: "omar.hassan@example.com", phone: "+1-780-555-0133" },
  { id: "cr-harbor-kim", name: "Rachel Kim", email: "rachel.kim@example.com", phone: "+1-236-555-0181" },
  { id: "cr-harbor-rahman", name: "Leila Rahman", email: "leila.rahman@example.com", phone: "+1-613-555-0129" },
  { id: "cr-harbor-alvarez", name: "Mateo Alvarez", email: "mateo.alvarez@example.com", phone: null },
  { id: "cr-harbor-tanaka", name: "Yuki Tanaka", email: null, phone: "+1-250-555-0144" },
  { id: "cr-harbor-mensah", name: "Grace Mensah", email: "grace.mensah@example.com", phone: "+1-514-555-0186" },
  { id: "cr-harbor-nasser", name: "Farid Nasser", email: "farid.nasser@example.com", phone: "+1-647-555-0112" },
  { id: "cr-harbor-bergstrom", name: "Sofia Bergstrom", email: "sofia.bergstrom@example.com", phone: "+1-604-555-0155" },
  { id: "cr-harbor-moreau", name: "Hanae Moreau", email: null, phone: null },
];

function verdictOf(email: string | null, phone: string | null): {
  verdict: "reachable" | "partial" | "unreachable";
  ready: boolean;
  rationale: string;
} {
  const hasEmail = Boolean(email);
  const hasPhone = Boolean(phone);
  if (hasEmail && hasPhone) return { verdict: "reachable", ready: true, rationale: "reachable" };
  if (!hasEmail && !hasPhone) {
    return { verdict: "unreachable", ready: false, rationale: "missing email and phone" };
  }
  return {
    verdict: "partial",
    ready: true,
    rationale: hasEmail ? "missing phone" : "missing email",
  };
}

export const EVENT_WRITE_SET: EventWriteSetRow[] = [
  { event_name: "contact_import", version: 1, table_name: "import_batch", ord: 0 },
  { event_name: "contact_import", version: 1, table_name: "contact_records", ord: 1 },
  { event_name: "contact.created", version: 1, table_name: "contact_records", ord: 0 },
  { event_name: "fact_writebacks", version: 1, table_name: "fact_writebacks", ord: 0 },
  { event_name: "campaign_failure", version: 1, table_name: "campaign_failure", ord: 0 },
  { event_name: "consent_records.opt_out", version: 1, table_name: "consent_records", ord: 0 },
  { event_name: "ct_firms", version: 1, table_name: "ct_firms", ord: 0 },
  { event_name: "audit.completed", version: 1, table_name: "audit_runs", ord: 0 },
  { event_name: "audit.completed", version: 1, table_name: "contact_records", ord: 1 },
  { event_name: "audit.completed", version: 1, table_name: "reachability_verdicts", ord: 2 },
  { event_name: "audit.completed", version: 1, table_name: "sequence_ready", ord: 3 },
  { event_name: "eligibility.changed", version: 1, table_name: "eligibility_evaluations", ord: 0 },
  { event_name: "eligibility.changed", version: 1, table_name: "eligibility_results", ord: 1 },
  { event_name: "eligibility.changed", version: 1, table_name: "signals", ord: 2 },
  { event_name: "eligibility.changed", version: 1, table_name: "motion_decisions", ord: 3 },
  { event_name: "halt_records", version: 1, table_name: "halt_records", ord: 0 },
  { event_name: "meeting_booked", version: 1, table_name: "meeting_booked", ord: 0 },
];

const IMPORT_CONTACTS: EventTestDataRow[] = HARBOR_BOOK.map((row, index) => ({
  id: `etd-contact_import-cr-${index + 1}`,
  event_name: "contact_import",
  version: 1,
  table_name: "contact_records",
  ord: index + 1,
  body: harborContact({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    importBatchId: IMPORT_ID,
    createdAt: `2026-08-12T14:${String(22 + index).padStart(2, "0")}:00.000Z`,
  }),
}));

const AUDIT_SLICE = HARBOR_BOOK.filter((row) =>
  [
    "cr-harbor-okonkwo",
    "cr-harbor-cole",
    "cr-harbor-alvarez",
    "cr-harbor-tanaka",
    "cr-harbor-moreau",
    "cr-harbor-mensah",
    "cr-harbor-haddad",
    "cr-harbor-nasser",
  ].includes(row.id),
);

const FACT_FIELDS: Array<{ key: string; value: unknown }> = [
  { key: "language_clb", value: 9 },
  { key: "crs_score", value: 512 },
  { key: "noc", value: "21231" },
  { key: "teer_category", value: 1 },
  { key: "foreign_work_years", value: 6 },
  { key: "canadian_skilled_hours", value: 1680 },
  { key: "ee_profile_exists", value: true },
  { key: "ee_profile_last_updated", value: "2026-07-28" },
];

export const EVENT_TEST_DATA: EventTestDataRow[] = [
  {
    id: "etd-contact_import-batch-1",
    event_name: "contact_import",
    version: 1,
    table_name: "import_batch",
    ord: 0,
    body: {
      id: IMPORT_ID,
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      kind: "contact",
      source: "file",
      filename: "book.csv",
      row_count: HARBOR_BOOK.length,
      created_at: STAMP,
    },
  },
  ...IMPORT_CONTACTS,
  {
    id: "etd-contact.created-marita",
    event_name: "contact.created",
    version: 1,
    table_name: "contact_records",
    ord: 0,
    body: harborContact({
      id: MARITA_ID,
      name: "Marita Patel",
      email: "marita.patel@example.com",
      phone: "+1-604-555-0188",
      importBatchId: null,
      createdAt: "2026-08-13T09:14:00.000Z",
    }),
  },
  ...FACT_FIELDS.map((field, index) => ({
    id: `etd-fact_writebacks-${field.key}`,
    event_name: "fact_writebacks",
    version: 1,
    table_name: "fact_writebacks",
    ord: index,
    body: {
      id: `fwb-harbor-okonkwo-${field.key}`,
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      contact_id: "cr-harbor-okonkwo",
      contact_name: "Daniel Okonkwo",
      field_key: field.key,
      value: field.value,
      form_ref: FORM_REF,
      created_at: `2026-08-13T16:${String(4 + index).padStart(2, "0")}:00.000Z`,
    },
  })),
  {
    id: "etd-campaign_failure-alvarez",
    event_name: "campaign_failure",
    version: 1,
    table_name: "campaign_failure",
    ord: 0,
    body: {
      id: "cfail-harbor-alvarez-email-3",
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      contact_id: "cr-harbor-alvarez",
      contact_name: "Mateo Alvarez",
      campaign_id: "camp.optin.harbor.v1",
      sequence_id: "tpl.optin_launch.v1",
      payload: {
        attemptId: "aa-harbor-alvarez-3",
        attemptN: 3,
        channel: "email",
        to: "mateo.alvarez@example.com",
        subject: "Harbor RCIC — a next step on your file",
        reason: "mailbox rejected (550 5.1.1)",
        criteriaId: "ac-no-reply-window",
        setValue: "fail",
        lastAttemptAt: "2026-08-14T11:40:00.000Z",
      },
      created_at: "2026-08-14T11:40:12.000Z",
    },
  },
  {
    id: "etd-campaign_failure-tanaka",
    event_name: "campaign_failure",
    version: 1,
    table_name: "campaign_failure",
    ord: 1,
    body: {
      id: "cfail-harbor-tanaka-sms-2",
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      contact_id: "cr-harbor-tanaka",
      contact_name: "Yuki Tanaka",
      campaign_id: "camp.optin.harbor.v1",
      sequence_id: "tpl.optin_launch.v1",
      payload: {
        attemptId: "aa-harbor-tanaka-2",
        attemptN: 2,
        channel: "text",
        to: "+1-250-555-0144",
        reason: "undeliverable — carrier rejected",
        criteriaId: "ac-sms-window",
        setValue: "fail",
        lastAttemptAt: "2026-08-14T18:05:00.000Z",
      },
      created_at: "2026-08-14T18:05:08.000Z",
    },
  },
  {
    id: "etd-consent-haddad",
    event_name: "consent_records.opt_out",
    version: 1,
    table_name: "consent_records",
    ord: 0,
    body: {
      contact_id: "cr-harbor-haddad",
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      contact_name: "Samira Haddad",
      basis: "none",
      silenced: true,
      source: "unsubscribe.email",
      updated_at: "2026-08-15T08:22:00.000Z",
    },
  },
  {
    id: "etd-ct_firms-harbor",
    event_name: "ct_firms",
    version: 1,
    table_name: "ct_firms",
    ord: 0,
    body: {
      id: HARBOR_FIRM_ID,
      name: HARBOR_FIRM,
      posture: "Armed",
      pool_slug: "harbor",
      pool_domain: "harbor.try-tower.com",
      sending_identity_id: "sid-harbor-resend",
      consultant_name: HARBOR_CONSULTANT,
      consultant_email: "amira.chen@harbor-rcic.example",
      created_at: "2026-07-02T15:00:00.000Z",
      updated_at: "2026-08-10T12:00:00.000Z",
    },
  },
  {
    id: "etd-audit-run",
    event_name: "audit.completed",
    version: 1,
    table_name: "audit_runs",
    ord: 0,
    body: {
      id: AUDIT_ID,
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      status: "complete",
      enabled_checks: [],
      import_ids: [IMPORT_ID],
      summary: {
        contacts: AUDIT_SLICE.length,
        ready: AUDIT_SLICE.filter((row) => verdictOf(row.email, row.phone).ready).length,
      },
      started_at: "2026-08-12T14:40:00.000Z",
      finished_at: "2026-08-12T14:40:04.000Z",
    },
  },
  ...AUDIT_SLICE.map((row, index) => ({
    id: `etd-audit-cr-${row.id}`,
    event_name: "audit.completed",
    version: 1,
    table_name: "contact_records",
    ord: index + 1,
    body: harborContact({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      importBatchId: IMPORT_ID,
    }),
  })),
  ...AUDIT_SLICE.map((row, index) => {
    const v = verdictOf(row.email, row.phone);
    return {
      id: `etd-audit-verdict-${row.id}`,
      event_name: "audit.completed",
      version: 1,
      table_name: "reachability_verdicts",
      ord: index,
      body: {
        contact_id: row.id,
        firm_id: HARBOR_FIRM_ID,
        firm: HARBOR_FIRM,
        name: row.name,
        verdict: v.verdict,
        details: { auditRunId: AUDIT_ID, rationale: v.rationale },
        updated_at: "2026-08-12T14:40:03.000Z",
      },
    };
  }),
  ...AUDIT_SLICE.map((row, index) => {
    const v = verdictOf(row.email, row.phone);
    return {
      id: `etd-audit-ready-${row.id}`,
      event_name: "audit.completed",
      version: 1,
      table_name: "sequence_ready",
      ord: index,
      body: {
        contact_id: row.id,
        firm_id: HARBOR_FIRM_ID,
        firm: HARBOR_FIRM,
        name: row.name,
        ready: v.ready,
        updated_at: "2026-08-12T14:40:03.000Z",
      },
    };
  }),
  {
    id: "etd-elig-eval-okonkwo",
    event_name: "eligibility.changed",
    version: 1,
    table_name: "eligibility_evaluations",
    ord: 0,
    body: {
      id: "eval-harbor-okonkwo-fwb",
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      contact_id: "cr-harbor-okonkwo",
      contact_name: "Daniel Okonkwo",
      trigger_kind: "fact_writeback",
      status: "done",
      created_at: "2026-08-13T16:12:00.000Z",
    },
  },
  {
    id: "etd-elig-eval-alvarez",
    event_name: "eligibility.changed",
    version: 1,
    table_name: "eligibility_evaluations",
    ord: 1,
    body: {
      id: "eval-harbor-alvarez-fwb",
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      contact_id: "cr-harbor-alvarez",
      contact_name: "Mateo Alvarez",
      trigger_kind: "fact_writeback",
      status: "done",
      created_at: "2026-08-13T16:12:01.000Z",
    },
  },
  {
    id: "etd-elig-result-okonkwo",
    event_name: "eligibility.changed",
    version: 1,
    table_name: "eligibility_results",
    ord: 0,
    body: {
      id: "eres-harbor-okonkwo-fwb",
      evaluation_id: "eval-harbor-okonkwo-fwb",
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      contact_id: "cr-harbor-okonkwo",
      contact_name: "Daniel Okonkwo",
      any_pathway_pass: true,
      result: {
        trigger: "fact_writeback",
        writebackId: "fwb-harbor-okonkwo-crs_score",
        fieldKey: "crs_score",
        source: "contact",
        pathways: [
          { id: "cec", label: "Canadian Experience Class", pass: true, hours: 1680 },
          { id: "fsw", label: "Federal Skilled Worker", pass: true, crs: 512, clb: 9 },
          { id: "pnp", label: "Provincial Nominee", pass: false, reason: "no nomination" },
        ],
      },
      created_at: "2026-08-13T16:12:00.000Z",
    },
  },
  {
    id: "etd-elig-result-alvarez",
    event_name: "eligibility.changed",
    version: 1,
    table_name: "eligibility_results",
    ord: 1,
    body: {
      id: "eres-harbor-alvarez-fwb",
      evaluation_id: "eval-harbor-alvarez-fwb",
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      contact_id: "cr-harbor-alvarez",
      contact_name: "Mateo Alvarez",
      any_pathway_pass: false,
      result: {
        trigger: "fact_writeback",
        fieldKey: "language_clb",
        source: "contact",
        pathways: [
          { id: "cec", label: "Canadian Experience Class", pass: false, reason: "Canadian hours not established" },
          { id: "fsw", label: "Federal Skilled Worker", pass: false, reason: "CLB below 7" },
        ],
      },
      created_at: "2026-08-13T16:12:01.000Z",
    },
  },
  {
    id: "etd-elig-sig-okonkwo",
    event_name: "eligibility.changed",
    version: 1,
    table_name: "signals",
    ord: 0,
    body: {
      id: "sig-harbor-okonkwo-elig",
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      contact_id: "cr-harbor-okonkwo",
      contact_name: "Daniel Okonkwo",
      kind: "eligibility_determination",
      payload: { resultId: "eres-harbor-okonkwo-fwb", anyPass: true },
      created_at: "2026-08-13T16:12:00.000Z",
    },
  },
  {
    id: "etd-elig-sig-alvarez",
    event_name: "eligibility.changed",
    version: 1,
    table_name: "signals",
    ord: 1,
    body: {
      id: "sig-harbor-alvarez-elig",
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      contact_id: "cr-harbor-alvarez",
      contact_name: "Mateo Alvarez",
      kind: "eligibility_determination",
      payload: { resultId: "eres-harbor-alvarez-fwb", anyPass: false },
      created_at: "2026-08-13T16:12:01.000Z",
    },
  },
  {
    id: "etd-elig-mot-okonkwo",
    event_name: "eligibility.changed",
    version: 1,
    table_name: "motion_decisions",
    ord: 0,
    body: {
      id: "mot-harbor-okonkwo-elig",
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      contact_id: "cr-harbor-okonkwo",
      contact_name: "Daniel Okonkwo",
      motion: "reactivation",
      reason: { signalId: "sig-harbor-okonkwo-elig", precedence: "mp-1" },
      created_at: "2026-08-13T16:12:00.000Z",
    },
  },
  {
    id: "etd-elig-mot-alvarez",
    event_name: "eligibility.changed",
    version: 1,
    table_name: "motion_decisions",
    ord: 1,
    body: {
      id: "mot-harbor-alvarez-elig",
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      contact_id: "cr-harbor-alvarez",
      contact_name: "Mateo Alvarez",
      motion: "nudge",
      reason: { signalId: "sig-harbor-alvarez-elig", precedence: "mp-1" },
      created_at: "2026-08-13T16:12:01.000Z",
    },
  },
  {
    id: "etd-halt-moreau",
    event_name: "halt_records",
    version: 1,
    table_name: "halt_records",
    ord: 0,
    body: {
      id: "halt-harbor-moreau-contact",
      consultant_id: "standin-u-1",
      consultant_name: HARBOR_CONSULTANT,
      contact_id: "cr-harbor-moreau",
      contact_name: "Hanae Moreau",
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      scope: "contact",
      reason: "No reachable channel — pause outreach until email or phone is on file",
      halted_at: "2026-08-12T15:10:00.000Z",
      lifted_at: null,
    },
  },
  {
    id: "etd-halt-book",
    event_name: "halt_records",
    version: 1,
    table_name: "halt_records",
    ord: 1,
    body: {
      id: "halt-harbor-book-ircc-outage",
      consultant_id: "standin-u-1",
      consultant_name: HARBOR_CONSULTANT,
      contact_id: null,
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      scope: "firm-book",
      reason: "IRCC portal outage — hold the Harbor book until Monday",
      halted_at: "2026-08-16T02:15:00.000Z",
      lifted_at: null,
    },
  },
  {
    id: "etd-meeting-cole",
    event_name: "meeting_booked",
    version: 1,
    table_name: "meeting_booked",
    ord: 0,
    body: {
      id: "mtg-harbor-cole-2026-08-21",
      firm_id: HARBOR_FIRM_ID,
      firm: HARBOR_FIRM,
      contact_id: "cr-harbor-cole",
      contact_name: "Amina Cole",
      booked_at: "2026-08-15T19:02:00.000Z",
      source: "contact_portal",
      slot: "2026-08-21T16:30:00-07:00",
      consultant_name: HARBOR_CONSULTANT,
      enrollment_id: "enr-harbor-cole-optin",
      payload: { contactName: "Amina Cole", slot: "2026-08-21T16:30:00-07:00", timezone: "America/Vancouver" },
      created_at: "2026-08-15T19:02:00.000Z",
    },
  },
];

export function maxContractVersion(eventName: string): number | null {
  const versions = EVENT_WRITE_SET.filter((row) => row.event_name === eventName).map((row) => row.version);
  if (!versions.length) return null;
  return Math.max(...versions);
}

export function writeSetFor(eventName: string, version?: number): EventWriteSetRow[] {
  const ver = version ?? maxContractVersion(eventName);
  if (ver == null) return [];
  return EVENT_WRITE_SET.filter((row) => row.event_name === eventName && row.version === ver).sort(
    (a, b) => a.ord - b.ord,
  );
}

export function testDataFor(eventName: string, version?: number): EventTestDataRow[] {
  const ver = version ?? maxContractVersion(eventName);
  if (ver == null) return [];
  return EVENT_TEST_DATA.filter((row) => row.event_name === eventName && row.version === ver).sort(
    (a, b) => a.ord - b.ord || a.table_name.localeCompare(b.table_name),
  );
}

function writeIdFromBody(table: string, body: Record<string, unknown>): string {
  if (typeof body.id === "string" && body.id) return body.id;
  if (typeof body.contact_id === "string" && body.contact_id) return body.contact_id;
  return `${table}-specimen`;
}

export function handleFromContract(eventName: string, door: 1 | 2 = 2): EventTestHandle | null {
  const version = maxContractVersion(eventName);
  if (version == null) return null;
  const writeSet = writeSetFor(eventName, version);
  if (!writeSet.length) return null;
  const rows = testDataFor(eventName, version);
  const writes: EventTestWrite[] = rows.map((row) => {
    const id = writeIdFromBody(row.table_name, row.body);
    const contact_id =
      typeof row.body.contact_id === "string"
        ? row.body.contact_id
        : row.table_name === "contact_records"
          ? id
          : null;
    return {
      ...row.body,
      table: row.table_name,
      id,
      contact_id,
    };
  });
  return {
    eventName,
    version,
    door,
    writeSet: writeSet.map((row) => ({ table_name: row.table_name, ord: row.ord })),
    writes,
  };
}

export function groupedWrites(writes: EventTestWrite[]): Array<{ table: string; rows: EventTestWrite[] }> {
  const map = new Map<string, EventTestWrite[]>();
  for (const row of writes) {
    const list = map.get(row.table) ?? [];
    list.push(row);
    map.set(row.table, list);
  }
  return [...map.entries()].map(([table, rows]) => ({ table, rows }));
}

export function writesFromHandle(payload: unknown): EventTestWrite[] {
  if (!payload || typeof payload !== "object") return [];
  const raw = (payload as { writes?: unknown }).writes;
  if (!Array.isArray(raw)) return [];
  return raw.filter((row): row is EventTestWrite => {
    if (!row || typeof row !== "object") return false;
    const rec = row as Record<string, unknown>;
    return typeof rec.table === "string" && typeof rec.id === "string";
  });
}

export function handleTreeTables(payload: unknown): Array<{ table: string; rows: EventTestWrite[] }> {
  return groupedWrites(writesFromHandle(payload));
}

/** Input / Output folder name. Chip table stays missing_fact_signals. */
export function writeFolderLabel(table: string): string {
  return table === "missing_fact_signals" ? "Required data" : table;
}

/** Rule listing keys on the handle — not COLLECTIBLE_FIELDS. */
export function requiredDataKeys(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [];
  const rec = payload as Record<string, unknown>;
  const listing = rec.listing ?? rec.requiredData;
  if (!Array.isArray(listing)) return [];
  return [...new Set(listing.map((row) => String(row).trim()).filter(Boolean))];
}

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export function sqlSeedStatements(): string {
  const writeRows = EVENT_WRITE_SET.map(
    (row) =>
      `(${sqlString(row.event_name)}, ${row.version}, ${sqlString(row.table_name)}, ${row.ord})`,
  );
  const dataRows = EVENT_TEST_DATA.map((row) => {
    const body = JSON.stringify(row.body).replace(/'/g, "''");
    return `(${sqlString(row.id)}, ${sqlString(row.event_name)}, ${row.version}, ${sqlString(row.table_name)}, ${row.ord}, '${body}'::jsonb)`;
  });
  return [
    `INSERT INTO event_write_set (event_name, version, table_name, ord) VALUES`,
    `${writeRows.join(",\n")};`,
    ``,
    `INSERT INTO event_test_data (id, event_name, version, table_name, ord, body) VALUES`,
    `${dataRows.join(",\n")};`,
  ].join("\n");
}

