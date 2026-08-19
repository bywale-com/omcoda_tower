/**
 * Test contract reader. Door 1 = live instance. Door 2 = event_test_data at max(version).
 * Does not INSERT. Does not copy live fires into the contract tables.
 */
import type { Context } from "hono";
import { getPool } from "./db.ts";
import { requireSessionFirm } from "./sessionFirm.ts";

type WriteRow = Record<string, unknown> & {
  table: string;
  id: string;
  contact_id?: string | null;
};

function writeId(table: string, body: Record<string, unknown>): string {
  if (typeof body.id === "string" && body.id) return body.id;
  if (typeof body.contact_id === "string" && body.contact_id) return body.contact_id;
  return `${table}-specimen`;
}

function toWrites(table: string, rows: Record<string, unknown>[]): WriteRow[] {
  return rows.map((body) => {
    const id = writeId(table, body);
    const contact_id =
      typeof body.contact_id === "string"
        ? body.contact_id
        : table === "contact_records"
          ? id
          : null;
    return { ...body, table, id, contact_id };
  });
}

async function door1(
  firm: string,
  eventName: string,
  tables: string[],
): Promise<WriteRow[] | null> {
  const pool = getPool();
  const out: WriteRow[] = [];

  const push = async (table: string, sql: string, params: unknown[]) => {
    const { rows } = await pool.query(sql, params);
    if (!rows.length) return false;
    out.push(...toWrites(table, rows as Record<string, unknown>[]));
    return true;
  };

  try {
    if (eventName === "contact_import") {
      const batch = await pool.query(
        `SELECT * FROM import_batch WHERE firm_id=$1 ORDER BY created_at DESC LIMIT 1`,
        [firm],
      );
      if (!batch.rowCount) return null;
      const batchId = batch.rows[0].id as string;
      out.push(...toWrites("import_batch", batch.rows as Record<string, unknown>[]));
      await push(
        "contact_records",
        `SELECT * FROM contact_records WHERE firm_id=$1 AND import_batch_id=$2 ORDER BY created_at ASC`,
        [firm, batchId],
      );
      return out;
    }
    if (eventName === "contact.created") {
      const ok = await push(
        "contact_records",
        `SELECT * FROM contact_records WHERE firm_id=$1 ORDER BY created_at DESC LIMIT 1`,
        [firm],
      );
      return ok ? out : null;
    }
    if (eventName === "fact_writebacks") {
      const ok = await push(
        "fact_writebacks",
        `SELECT * FROM fact_writebacks WHERE firm_id=$1 ORDER BY created_at DESC LIMIT 20`,
        [firm],
      );
      return ok ? out : null;
    }
    if (eventName === "campaign_failure") {
      const ok = await push(
        "campaign_failure",
        `SELECT * FROM campaign_failure WHERE firm_id=$1 ORDER BY created_at DESC LIMIT 10`,
        [firm],
      );
      return ok ? out : null;
    }
    if (eventName === "consent_records.opt_out") {
      const ok = await push(
        "consent_records",
        `SELECT * FROM consent_records WHERE firm_id=$1 AND silenced=true ORDER BY updated_at DESC LIMIT 10`,
        [firm],
      );
      return ok ? out : null;
    }
    if (eventName === "ct_firms") {
      const ok = await push(`ct_firms`, `SELECT * FROM ct_firms WHERE id=$1 LIMIT 1`, [firm]);
      return ok ? out : null;
    }
    if (eventName === "audit.completed") {
      const run = await pool.query(
        `SELECT * FROM audit_runs WHERE firm_id=$1 AND status='complete' ORDER BY started_at DESC LIMIT 1`,
        [firm],
      );
      if (!run.rowCount) return null;
      const runId = run.rows[0].id as string;
      out.push(...toWrites("audit_runs", run.rows as Record<string, unknown>[]));
      const verdicts = await pool.query(
        `SELECT rv.*, cr.name, cr.email, cr.phone
         FROM reachability_verdicts rv
         LEFT JOIN contact_records cr ON cr.id = rv.contact_id
         WHERE rv.firm_id=$1 AND COALESCE(rv.details->>'auditRunId','')=$2`,
        [firm, runId],
      );
      const ids = verdicts.rows.map((row) => row.contact_id);
      if (ids.length) {
        const contacts = await pool.query(
          `SELECT * FROM contact_records WHERE firm_id=$1 AND id = ANY($2::text[])`,
          [firm, ids],
        );
        out.push(...toWrites("contact_records", contacts.rows as Record<string, unknown>[]));
      }
      out.push(...toWrites("reachability_verdicts", verdicts.rows as Record<string, unknown>[]));
      if (ids.length) {
        const ready = await pool.query(
          `SELECT * FROM sequence_ready WHERE firm_id=$1 AND contact_id = ANY($2::text[])`,
          [firm, ids],
        );
        out.push(...toWrites("sequence_ready", ready.rows as Record<string, unknown>[]));
      }
      return out;
    }
    if (eventName === "eligibility.changed") {
      const evals = await pool.query(
        `SELECT * FROM eligibility_evaluations WHERE firm_id=$1 ORDER BY created_at DESC LIMIT 8`,
        [firm],
      );
      if (!evals.rowCount) return null;
      out.push(...toWrites("eligibility_evaluations", evals.rows as Record<string, unknown>[]));
      const evalIds = evals.rows.map((row) => row.id);
      const results = await pool.query(
        `SELECT * FROM eligibility_results WHERE firm_id=$1 AND evaluation_id = ANY($2::text[])`,
        [firm, evalIds],
      );
      out.push(...toWrites("eligibility_results", results.rows as Record<string, unknown>[]));
      const contactIds = [...new Set(evals.rows.map((row) => row.contact_id))];
      const signals = await pool.query(
        `SELECT * FROM signals WHERE firm_id=$1 AND contact_id = ANY($2::text[]) AND kind='eligibility_determination' ORDER BY created_at DESC`,
        [firm, contactIds],
      );
      out.push(...toWrites("signals", signals.rows as Record<string, unknown>[]));
      const motions = await pool.query(
        `SELECT * FROM motion_decisions WHERE firm_id=$1 AND contact_id = ANY($2::text[]) ORDER BY created_at DESC`,
        [firm, contactIds],
      );
      out.push(...toWrites("motion_decisions", motions.rows as Record<string, unknown>[]));
      return out;
    }
    if (eventName === "halt_records") {
      const ok = await push(
        "halt_records",
        `SELECT * FROM halt_records WHERE firm_id=$1 AND lifted_at IS NULL ORDER BY halted_at DESC LIMIT 10`,
        [firm],
      );
      return ok ? out : null;
    }
    if (eventName === "meeting_booked") {
      const ok = await push(
        "meeting_booked",
        `SELECT * FROM meeting_booked WHERE firm_id=$1 ORDER BY booked_at DESC LIMIT 10`,
        [firm],
      );
      return ok ? out : null;
    }
  } catch {
    return null;
  }
  void tables;
  return out.length ? out : null;
}

export async function handleEventTestContract(c: Context) {
  const eventName = String(c.req.query("eventName") ?? "").trim();
  if (!eventName) return c.json({ error: "eventName required" }, 400);
  const firm = await requireSessionFirm(c);
  const pool = getPool();

  try {
    const ver = await pool.query<{ version: number }>(
      `SELECT MAX(version) AS version FROM event_write_set WHERE event_name=$1`,
      [eventName],
    );
    const version = ver.rows[0]?.version;
    if (version == null) return c.json({ error: "no contract" }, 404);

    const set = await pool.query<{ table_name: string; ord: number }>(
      `SELECT table_name, ord FROM event_write_set WHERE event_name=$1 AND version=$2 ORDER BY ord ASC`,
      [eventName, version],
    );
    const writeSet = set.rows;
    const tables = writeSet.map((row) => row.table_name);

    const live = await door1(firm, eventName, tables);
    if (live?.length) {
      return c.json({ eventName, version, door: 1, writeSet, writes: live });
    }

    const data = await pool.query<{ table_name: string; body: Record<string, unknown> }>(
      `SELECT table_name, body FROM event_test_data
       WHERE event_name=$1 AND version=$2
       ORDER BY table_name, ord ASC`,
      [eventName, version],
    );
    const writes: WriteRow[] = [];
    for (const row of data.rows) {
      writes.push(...toWrites(row.table_name, [row.body]));
    }
    return c.json({ eventName, version, door: 2, writeSet, writes });
  } catch (err) {
    return c.json({ error: String(err) }, 404);
  }
}
