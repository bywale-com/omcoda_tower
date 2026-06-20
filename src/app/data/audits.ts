import { getImport, type ContactImport } from "./imports";

export const AUDIT_NUDGE_YELLOW = "#eab308";

export type AuditStatus = "running" | "complete";

export type AuditCheckId =
  | "email_valid"
  | "phone_valid"
  | "dedupe"
  | "typo_garbage"
  | "name_present";

export type AuditGateStatus = "pending" | "running" | "pass" | "fail";

export const AUDIT_CHECKS: { id: AuditCheckId; label: string }[] = [
  { id: "email_valid", label: "Email valid" },
  { id: "phone_valid", label: "Phone valid" },
  { id: "dedupe", label: "Dedupe within batch" },
  { id: "typo_garbage", label: "Typo / garbage detection" },
  { id: "name_present", label: "Name present" },
];

export const DEFAULT_AUDIT_CHECKS: AuditCheckId[] = AUDIT_CHECKS.map((c) => c.id);

export type AuditGateStep = {
  checkId: AuditCheckId;
  label: string;
  status: AuditGateStatus;
  durationMs?: number;
};

export type AuditRecord = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export type Audit = {
  id: string;
  label: string;
  meta: string;
  status: AuditStatus;
  importIds: string[];
  records: AuditRecord[];
  enabledChecks: AuditCheckId[];
  gateSteps: AuditGateStep[];
};

function buildGateSteps(
  checkIds: AuditCheckId[],
  resolved?: Partial<Record<AuditCheckId, { status: "pass" | "fail"; durationMs: number }>>,
): AuditGateStep[] {
  return checkIds.map((checkId) => {
    const def = AUDIT_CHECKS.find((c) => c.id === checkId)!;
    const outcome = resolved?.[checkId];
    if (!outcome) {
      return { checkId, label: def.label, status: "pending" as const };
    }
    return {
      checkId,
      label: def.label,
      status: outcome.status,
      durationMs: outcome.durationMs,
    };
  });
}

const SEED_AUDITS: Audit[] = [
  {
    id: "audit-crs-drift",
    label: "CRS score drift check",
    meta: "3 open",
    status: "complete",
    importIds: ["imp-2026-06-12-01"],
    records: [],
    enabledChecks: DEFAULT_AUDIT_CHECKS,
    gateSteps: buildGateSteps(DEFAULT_AUDIT_CHECKS, {
      email_valid: { status: "pass", durationMs: 142 },
      phone_valid: { status: "pass", durationMs: 98 },
      dedupe: { status: "pass", durationMs: 210 },
      typo_garbage: { status: "fail", durationMs: 176 },
      name_present: { status: "pass", durationMs: 64 },
    }),
  },
  {
    id: "audit-doc-expiry",
    label: "Document expiry sweep",
    meta: "1 open",
    status: "complete",
    importIds: ["imp-2026-05-28-01"],
    records: [],
    enabledChecks: DEFAULT_AUDIT_CHECKS,
    gateSteps: buildGateSteps(DEFAULT_AUDIT_CHECKS, {
      email_valid: { status: "pass", durationMs: 120 },
      phone_valid: { status: "fail", durationMs: 88 },
      dedupe: { status: "pass", durationMs: 195 },
      typo_garbage: { status: "pass", durationMs: 154 },
      name_present: { status: "pass", durationMs: 72 },
    }),
  },
  {
    id: "audit-sequence-gaps",
    label: "Sequence coverage review",
    meta: "Clear",
    status: "complete",
    importIds: ["imp-2026-04-03-01"],
    records: [],
    enabledChecks: DEFAULT_AUDIT_CHECKS,
    gateSteps: buildGateSteps(DEFAULT_AUDIT_CHECKS, {
      email_valid: { status: "pass", durationMs: 130 },
      phone_valid: { status: "pass", durationMs: 91 },
      dedupe: { status: "pass", durationMs: 188 },
      typo_garbage: { status: "pass", durationMs: 160 },
      name_present: { status: "pass", durationMs: 58 },
    }),
  },
];

const MOCK_FIRST_NAMES = [
  "Elena",
  "Tom",
  "Nina",
  "Omar",
  "Rachel",
  "James",
  "Priya",
  "Daniel",
  "Aisha",
  "Lin",
  "Marcus",
  "Fatima",
];

const MOCK_LAST_NAMES = [
  "Vasquez",
  "Okada",
  "Patel",
  "Hassan",
  "Kim",
  "Webb",
  "Nair",
  "Osei",
  "Khan",
  "Wei",
  "Jenkins",
  "Al-Hassan",
];

function formatAuditLabel(importIds: string[], seq: number): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const importPart =
    importIds.length === 1
      ? (getImport(importIds[0])?.label.split(" · ")[1] ?? "1 import")
      : `${importIds.length} imports`;
  return `AUD-${y}-${m}-${d}-${String(seq).padStart(2, "0")} · ${importPart}`;
}

function mockPhone(index: number): string {
  const area = ["604", "416", "403", "780", "236"][index % 5];
  return `(${area}) 555-${String(100 + index).slice(-4)}`;
}

function mockEmail(first: string, last: string, index: number): string {
  const domain = index % 7 === 0 ? "gmial.com" : "example.com";
  return `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`;
}

export function buildConsolidatedRecords(importIds: string[]): AuditRecord[] {
  const records: AuditRecord[] = [];
  let index = 0;

  for (const importId of importIds) {
    const batchSize = 4 + (importId.length % 3);

    for (let i = 0; i < batchSize; i++) {
      const first = MOCK_FIRST_NAMES[(index + i) % MOCK_FIRST_NAMES.length];
      const last = MOCK_LAST_NAMES[(index + i) % MOCK_LAST_NAMES.length];
      records.push({
        id: `${importId}-row-${i}`,
        name: `${first} ${last}`,
        phone: mockPhone(index + i),
        email: mockEmail(first, last, index + i),
      });
    }
    index += batchSize;
  }

  return records;
}

export function resolveGateOutcome(
  checkId: AuditCheckId,
  records: AuditRecord[],
): "pass" | "fail" {
  switch (checkId) {
    case "typo_garbage":
      return records.some((r) => r.email.includes("gmial") || r.phone.includes("000-0000"))
        ? "fail"
        : "pass";
    case "email_valid":
      return records.every((r) => r.email.includes("@") && !r.email.endsWith("@"))
        ? "pass"
        : "fail";
    case "phone_valid":
      return records.every((r) => r.phone.length >= 10) ? "pass" : "fail";
    case "name_present":
      return records.every((r) => r.name.trim().length > 1) ? "pass" : "fail";
    case "dedupe":
      return "pass";
  }
}

export function finalizeAudit(audit: Audit): Audit {
  const failCount = audit.gateSteps.filter((step) => step.status === "fail").length;
  return {
    ...audit,
    status: "complete",
    meta: failCount === 0 ? "Clear" : `${failCount} open`,
  };
}

export function createAuditFromImports(importIds: string[], existingAuditCount: number): Audit {
  const seq = existingAuditCount + 1;
  const enabledChecks = [...DEFAULT_AUDIT_CHECKS];
  return {
    id: `audit-${Date.now()}`,
    label: formatAuditLabel(importIds, seq),
    meta: "Running",
    status: "running",
    importIds,
    records: buildConsolidatedRecords(importIds),
    enabledChecks,
    gateSteps: buildGateSteps(enabledChecks),
  };
}

export function importLabelsForAudit(importIds: string[]): ContactImport[] {
  return importIds
    .map((id) => getImport(id))
    .filter((item): item is ContactImport => item != null);
}

export function getInitialAudits(): Audit[] {
  return SEED_AUDITS.map((audit) => ({
    ...audit,
    records:
      audit.records.length > 0
        ? audit.records
        : buildConsolidatedRecords(audit.importIds),
  }));
}

export function getAudit(audits: Audit[], id: string): Audit | undefined {
  return audits.find((audit) => audit.id === id);
}

export function isAuditOpenable(audit: Audit): boolean {
  return audit.status === "complete";
}
