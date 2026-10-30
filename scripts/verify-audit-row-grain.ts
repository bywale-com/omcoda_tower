/**
 * PKT-005 against migrated Postgres.
 *
 * One row on reachability_verdicts and sequence_ready is one contact in one
 * audit run. loadWriteRow reads that pair. The desk and the enroll gate read
 * the latest row. The book and door 1 read the named run.
 *
 * Ship CI runs this after migrate and seed.
 */
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Hono } from "hono";
import { executeAuditRun } from "../server/wire-service/auditRun.ts";
import { getPool } from "../server/wire-service/db.ts";
import { executeGet, loadWriteRow } from "../server/wire-service/workflowWalk.ts";
import { createWireRoutes } from "../server/wire-service/routes.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

process.env.PG_POOL_MAX = process.env.PG_POOL_MAX || "4";
process.env.AUTH_DISABLED = "true";
process.env.SEND_MODE = process.env.SEND_MODE || "dry_run";

const pool = getPool();
const token = randomUUID().slice(0, 8);
const firm = `firm-pkt005-${token}`;
const contactA = `contact-pkt005-${token}-a`;
const contactB = `contact-pkt005-${token}-b`;
const contactC = `contact-pkt005-${token}-c`;
const contactF = `contact-pkt005-${token}-f`;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

type Write = { table: string; id: string; contact_id?: string | null };
type ContactRow = {
  id: string;
  reachability: string | null;
  sequenceReady: boolean | null;
};

function fail(name: string, detail: unknown): never {
  console.error(`fail ${name}`, detail);
  process.exitCode = 1;
  throw new Error(name);
}

function app() {
  const hono = new Hono();
  hono.route("/wire", createWireRoutes());
  return hono;
}

function session() {
  process.env.AUTH_DISABLED = "true";
  process.env.VITE_AUTH_DISABLED = "true";
  process.env.DEV_SESSION_FIRM = firm;
}

async function listContacts(): Promise<ContactRow[]> {
  session();
  const res = await app().request("/wire/machine/contact-records");
  const body = (await res.json()) as { contacts?: ContactRow[]; error?: string };
  if (res.status !== 200 || !body.contacts) fail("list", { status: res.status, body });
  return body.contacts;
}

function one(rows: ContactRow[], id: string): ContactRow {
  const found = rows.filter((row) => row.id === id);
  if (found.length !== 1) fail("list-row", { id, found });
  return found[0];
}

async function stamp(runId: string, contactId: string, updatedAt: string) {
  await pool.query(
    `UPDATE reachability_verdicts SET updated_at=$1 WHERE audit_run_id=$2 AND contact_id=$3`,
    [updatedAt, runId, contactId],
  );
  await pool.query(
    `UPDATE sequence_ready SET updated_at=$1 WHERE audit_run_id=$2 AND contact_id=$3`,
    [updatedAt, runId, contactId],
  );
}

async function cleanup() {
  await pool.query(`DELETE FROM engagement_records WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM active_attempts WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM enrollment WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM sequence_ready WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM reachability_verdicts WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM audit_runs WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM contact_records WHERE firm_id=$1`, [firm]);
  await pool.query(`DELETE FROM campaign_states WHERE firm_id=$1`, [firm]);
}

async function main() {
  const first = await executeAuditRun(pool, {
    firmId: firm,
    contacts: [
      { id: contactA, email: "ada@example.com", phone: "+15550000001", name: "Ada" },
      { id: contactB, email: "bea@example.com", phone: "+15550000002", name: "Bea" },
    ],
  });
  const second = await executeAuditRun(pool, {
    firmId: firm,
    contacts: [{ id: contactA, email: null, phone: null, name: "Ada" }],
  });
  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, name) VALUES ($1,$2,$3,$4)`,
    [contactC, firm, "cleo@example.com", "Cleo"],
  );

  const verdictsA = await pool.query<{ audit_run_id: string; verdict: string }>(
    `SELECT audit_run_id, verdict FROM reachability_verdicts WHERE contact_id=$1 AND firm_id=$2`,
    [contactA, firm],
  );
  const readyA = await pool.query<{ audit_run_id: string; ready: boolean }>(
    `SELECT audit_run_id, ready FROM sequence_ready WHERE contact_id=$1 AND firm_id=$2`,
    [contactA, firm],
  );
  if (verdictsA.rowCount !== 2 || readyA.rowCount !== 2) {
    fail("two-rows", { verdicts: verdictsA.rows, ready: readyA.rows });
  }
  const firstVerdict = verdictsA.rows.find((row) => row.audit_run_id === first.id);
  const firstReady = readyA.rows.find((row) => row.audit_run_id === first.id);
  if (firstVerdict?.verdict !== "reachable" || firstReady?.ready !== true) {
    fail("first-run-kept", { firstVerdict, firstReady, second: second.id });
  }
  const secondVerdict = verdictsA.rows.find((row) => row.audit_run_id === second.id);
  const secondReady = readyA.rows.find((row) => row.audit_run_id === second.id);
  if (secondVerdict?.verdict !== "unreachable" || secondReady?.ready !== false) {
    fail("second-run-unreachable", { secondVerdict, secondReady });
  }

  for (const result of [first, second]) {
    for (const table of ["reachability_verdicts", "sequence_ready"]) {
      const rows = result.writes.filter((row) => row.table === table && row.contact_id === contactA);
      if (rows.length !== 1 || rows[0].id !== result.id || rows[0].contact_id !== contactA) {
        fail("pointer", { table, result: result.id, rows });
      }
    }
  }
  const loaded = await loadWriteRow(pool, firm, {
    table: "reachability_verdicts",
    id: first.id,
    contact_id: contactA,
  });
  if (!loaded || loaded.verdict !== "reachable" || loaded.audit_run_id !== first.id) {
    fail("load-first", loaded);
  }

  const missingContact = await loadWriteRow(pool, firm, {
    table: "reachability_verdicts",
    id: first.id,
  });
  if (missingContact !== null) fail("missing-contact", missingContact);
  const missingRun = await loadWriteRow(pool, firm, {
    table: "sequence_ready",
    id: `not-a-run-${token}`,
    contact_id: contactA,
  });
  if (missingRun !== null) fail("missing-run", missingRun);

  await stamp(first.id, contactA, "2026-01-01T00:00:00Z");
  await stamp(first.id, contactB, "2026-01-01T00:00:00Z");
  await stamp(second.id, contactA, "2026-01-01T00:00:00Z");
  await pool.query(`UPDATE audit_runs SET started_at=$1 WHERE id=$2`, ["2026-01-01T00:00:00Z", first.id]);
  await pool.query(`UPDATE audit_runs SET started_at=$1 WHERE id=$2`, ["2026-01-02T00:00:00Z", second.id]);
  let listed = await listContacts();
  let ada = one(listed, contactA);
  if (ada.reachability !== "unreachable" || ada.sequenceReady !== false) {
    fail("tie-later-start", ada);
  }
  await pool.query(`UPDATE audit_runs SET started_at=$1 WHERE id=$2`, ["2026-01-03T00:00:00Z", first.id]);
  await pool.query(`UPDATE audit_runs SET started_at=$1 WHERE id=$2`, ["2026-01-01T00:00:00Z", second.id]);
  listed = await listContacts();
  ada = one(listed, contactA);
  if (ada.reachability !== "reachable" || ada.sequenceReady !== true) {
    fail("tie-earlier-start", ada);
  }

  await stamp(first.id, contactA, "2026-02-01T00:00:00Z");
  await stamp(first.id, contactB, "2026-02-01T00:00:00Z");
  await stamp(second.id, contactA, "2026-02-02T00:00:00Z");
  const open = await pool.query(
    `SELECT t.workflow_id
     FROM workflow_trigger t
     JOIN workflow_state s ON s.workflow_id = t.workflow_id
     WHERE (t.firm_id=$1 OR t.firm_id IS NULL)
       AND t.event_name='audit.completed'
       AND t.enabled=true
       AND s.status='active'`,
    [firm],
  );
  if (open.rowCount) fail("active-audit-workflow", open.rows);
  await pool.query(
    `INSERT INTO campaign_states (firm_id, state) VALUES ($1,'running')
     ON CONFLICT (firm_id) DO UPDATE SET state='running'`,
    [firm],
  );
  session();
  const fire = await app().request("/wire/machine/onboarding/fire", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  const fireBody = await fire.json();
  if (fire.status !== 200) fail("enroll-http", { status: fire.status, fireBody });
  const enrolled = await pool.query<{ contact_id: string }>(
    `SELECT contact_id FROM enrollment WHERE firm_id=$1`,
    [firm],
  );
  const enrolledIds = enrolled.rows.map((row) => row.contact_id);
  if (enrolledIds.filter((id) => id === contactB).length !== 1 || enrolledIds.includes(contactA) || enrolledIds.includes(contactC)) {
    fail("enroll-set", { enrolledIds, fireBody });
  }
  listed = await listContacts();
  const cleo = one(listed, contactC);
  const bea = one(listed, contactB);
  if (cleo.reachability !== null || cleo.sequenceReady !== null) fail("absent-contact", cleo);
  if (bea.sequenceReady !== true) fail("earlier-row-kept", bea);

  await stamp(first.id, contactA, "2026-03-02T00:00:00Z");
  await stamp(first.id, contactB, "2026-03-02T00:00:00Z");
  await stamp(second.id, contactA, "2026-03-01T00:00:00Z");
  await pool.query(`UPDATE audit_runs SET started_at=$1, status='complete' WHERE id=$2`, ["2026-03-01T00:00:00Z", first.id]);
  await pool.query(`UPDATE audit_runs SET started_at=$1, status='complete' WHERE id=$2`, ["2026-03-02T00:00:00Z", second.id]);

  session();
  const bookRes = await app().request(`/wire/machine/audit-runs/${encodeURIComponent(first.id)}`);
  const bookBody = (await bookRes.json()) as {
    verdicts?: Array<{ contactId: string; verdict: string; ready: boolean }>;
  };
  if (bookRes.status !== 200 || !bookBody.verdicts) fail("book-http", { status: bookRes.status, bookBody });
  const bookIds = bookBody.verdicts.map((row) => `${row.contactId}:${row.verdict}:${row.ready}`).sort();
  if (bookIds.join(",") !== `${contactA}:reachable:true,${contactB}:reachable:true`) {
    fail("book-rows", bookIds);
  }
  const bookSource = readFileSync(join(root, "server/wire-service/machine.ts"), "utf8");
  const bookFn = bookSource.slice(
    bookSource.indexOf("export async function handleAuditRunGet"),
    bookSource.indexOf("export async function handleContactImport"),
  );
  if (bookFn.includes("details->>'auditRunId'")) fail("book-json-key", "details->>'auditRunId'");

  session();
  const doorRes = await app().request("/wire/machine/event-test-contract?eventName=audit.completed");
  const doorBody = (await doorRes.json()) as { door?: number; writes?: Write[] };
  if (doorRes.status !== 200 || doorBody.door !== 1 || !doorBody.writes) {
    fail("door", { status: doorRes.status, doorBody });
  }
  const doorVerdicts = doorBody.writes.filter((row) => row.table === "reachability_verdicts");
  const doorReady = doorBody.writes.filter((row) => row.table === "sequence_ready");
  if (doorVerdicts.length !== 1 || doorVerdicts[0].id !== second.id || doorVerdicts[0].contact_id !== contactA) {
    fail("door-verdict", doorVerdicts);
  }
  const adaReady = doorReady.find((row) => row.contact_id === contactA);
  if (!adaReady || adaReady.id !== second.id || (adaReady as { ready?: boolean }).ready !== false) {
    fail("door-ready", doorReady);
  }
  if (doorVerdicts.some((row) => row.id === contactA) || doorReady.some((row) => row.id === contactA)) {
    fail("door-contact-id", { doorVerdicts, doorReady });
  }

  const got = await executeGet(pool, {
    getModule: "contacts",
    getSelect: "firm",
    getClass1: firm,
  });
  const verdictPointers = (got.writes ?? []).filter(
    (row) => row.table === "reachability_verdicts" && row.contact_id === contactA,
  );
  const readyPointers = (got.writes ?? []).filter(
    (row) => row.table === "sequence_ready" && row.contact_id === contactA,
  );
  if (verdictPointers.length !== 1 || verdictPointers[0].id !== first.id) fail("get-verdict", verdictPointers);
  if (readyPointers.length !== 1 || readyPointers[0].id !== first.id) fail("get-ready", readyPointers);
  if (!got.contactIds?.includes(contactC)) fail("get-contact", got.contactIds);
  const cleoMarks = (got.writes ?? []).filter(
    (row) =>
      row.contact_id === contactC &&
      (row.table === "reachability_verdicts" || row.table === "sequence_ready"),
  );
  if (cleoMarks.length !== 0) fail("get-omit", cleoMarks);
  const byContact = new Map<string, { verdict: number; ready: number }>();
  for (const row of got.writes ?? []) {
    if (row.table !== "reachability_verdicts" && row.table !== "sequence_ready") continue;
    const key = row.contact_id ?? "";
    const counts = byContact.get(key) ?? { verdict: 0, ready: 0 };
    if (row.table === "reachability_verdicts") counts.verdict += 1;
    if (row.table === "sequence_ready") counts.ready += 1;
    byContact.set(key, counts);
  }
  for (const [id, counts] of byContact) {
    if (counts.verdict > 1 || counts.ready > 1) fail("get-one", { id, counts });
  }
  const walkSource = readFileSync(join(root, "server/wire-service/workflowWalk.ts"), "utf8");
  const contactsFn = walkSource.slice(
    walkSource.indexOf('if (module === "contacts")'),
    walkSource.indexOf('if (module === "firms")'),
  );
  if (!contactsFn.includes("let q = `SELECT id, firm_id FROM contact_records`")) fail("get-select", contactsFn.slice(0, 240));
  const everyAt = contactsFn.indexOf('if (select !== "every")');
  const firmAt = contactsFn.indexOf("firm_id=$1");
  if (everyAt < 0 || firmAt < everyAt) fail("get-firm-predicate", { everyAt, firmAt });

  const freshRun = `arun-pkt005-${token}-fresh`;
  await pool.query(
    `INSERT INTO audit_runs (id, firm_id, status, import_ids, summary) VALUES ($1,$2,'complete','[]'::jsonb,'{}'::jsonb)`,
    [freshRun, firm],
  );
  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, name) VALUES ($1,$2,$3,$4)`,
    [contactF, firm, "fern@example.com", "Fern"],
  );
  await pool.query(
    `INSERT INTO reachability_verdicts (audit_run_id, contact_id, firm_id, verdict, details)
     VALUES ($1,$2,$3,'partial',$4::jsonb)`,
    [freshRun, contactF, firm, JSON.stringify({ auditRunId: freshRun, rationale: "missing phone" })],
  );
  await pool.query(
    `INSERT INTO sequence_ready (audit_run_id, contact_id, firm_id, ready) VALUES ($1,$2,$3,true)`,
    [freshRun, contactF, firm],
  );
  const stored = await pool.query<{ verdict: string; ready: boolean }>(
    `SELECT rv.verdict, sr.ready
     FROM reachability_verdicts rv
     JOIN sequence_ready sr ON sr.audit_run_id = rv.audit_run_id AND sr.contact_id = rv.contact_id
     WHERE rv.audit_run_id=$1 AND rv.contact_id=$2`,
    [freshRun, contactF],
  );
  listed = await listContacts();
  const fern = one(listed, contactF);
  if (stored.rows[0]?.verdict !== "partial" || stored.rows[0]?.ready !== true) fail("fresh-stored", stored.rows);
  if (fern.reachability !== stored.rows[0].verdict || fern.sequenceReady !== stored.rows[0].ready) {
    fail("fresh-list", { fern, stored: stored.rows[0] });
  }

  console.log("verify-audit-row-grain: pass");
}

try {
  await main();
} catch (error) {
  if (!process.exitCode) process.exitCode = 1;
  console.error(error);
} finally {
  try {
    await cleanup();
  } catch (error) {
    console.error("cleanup", error);
    process.exitCode = 1;
  }
  await pool.end();
}
