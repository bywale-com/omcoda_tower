/**
 * Audit module — same writes as Operator Start Audit.
 * Walker run_audit calls this. Do not recode verdict grain.
 */
import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import type { RunWrite } from "./runWrites.ts";

export type AuditContactInput = {
  id: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
};

export type AuditContactVerdict = {
  contactId: string;
  verdict: "reachable" | "partial" | "unreachable";
  ready: boolean;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
};

export async function executeAuditRun(
  pool: Pool,
  opts: {
    firmId: string;
    importIds?: string[];
    contacts: AuditContactInput[];
  },
): Promise<{
  id: string;
  verdicts: AuditContactVerdict[];
  summary: { contacts: number; ready: number };
  writes: RunWrite[];
}> {
  const runId = `arun-${randomUUID()}`;
  const importIds = opts.importIds ?? [];
  const writes: RunWrite[] = [];

  await pool.query(
    `INSERT INTO audit_runs (id, firm_id, status, import_ids)
     VALUES ($1,$2,'running',$3::jsonb)`,
    [runId, opts.firmId, JSON.stringify(importIds)],
  );
  writes.push({ table: "audit_runs", id: runId });

  const verdicts: AuditContactVerdict[] = [];
  for (const contact of opts.contacts) {
    await pool.query(
      `INSERT INTO contact_records (id, firm_id, email, phone, name)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE SET
         email=COALESCE(EXCLUDED.email, contact_records.email),
         phone=COALESCE(EXCLUDED.phone, contact_records.phone),
         name=COALESCE(EXCLUDED.name, contact_records.name),
         updated_at=now()`,
      [contact.id, opts.firmId, contact.email ?? null, contact.phone ?? null, contact.name ?? null],
    );
    writes.push({ table: "contact_records", id: contact.id, contact_id: contact.id });

    const hasEmail = Boolean(contact.email);
    const hasPhone = Boolean(contact.phone);
    const verdict: AuditContactVerdict["verdict"] =
      hasEmail && hasPhone ? "reachable" : hasEmail || hasPhone ? "partial" : "unreachable";
    const ready = verdict === "reachable" || verdict === "partial";
    const rationale = !hasEmail && !hasPhone
      ? "missing email and phone"
      : !hasEmail
        ? "missing email"
        : !hasPhone
          ? "missing phone"
          : verdict;

    await pool.query(
      `INSERT INTO reachability_verdicts (audit_run_id, contact_id, firm_id, verdict, details)
       VALUES ($1,$2,$3,$4,$5::jsonb)
       ON CONFLICT (audit_run_id, contact_id) DO UPDATE SET
         verdict=EXCLUDED.verdict, details=EXCLUDED.details, firm_id=EXCLUDED.firm_id, updated_at=now()`,
      [runId, contact.id, opts.firmId, verdict, JSON.stringify({ auditRunId: runId, rationale })],
    );
    writes.push({ table: "reachability_verdicts", id: runId, contact_id: contact.id });

    await pool.query(
      `INSERT INTO sequence_ready (audit_run_id, contact_id, firm_id, ready)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (audit_run_id, contact_id) DO UPDATE SET
         ready=EXCLUDED.ready, firm_id=EXCLUDED.firm_id, updated_at=now()`,
      [runId, contact.id, opts.firmId, ready],
    );
    writes.push({ table: "sequence_ready", id: runId, contact_id: contact.id });

    verdicts.push({
      contactId: contact.id,
      verdict,
      ready,
      email: contact.email ?? null,
      phone: contact.phone ?? null,
      name: contact.name ?? null,
    });
  }

  const summary = { contacts: opts.contacts.length, ready: verdicts.filter((v) => v.ready).length };
  await pool.query(
    `UPDATE audit_runs SET status='complete', finished_at=now(), summary=$2::jsonb WHERE id=$1`,
    [runId, JSON.stringify(summary)],
  );

  return { id: runId, verdicts, summary, writes };
}
