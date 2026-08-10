/**
 * Product journey handlers: authorize → import contacts → detect → outreach.
 * Reuses cascade.enrollAndActuate + audit/reference primitives.
 */
import type { Context } from "hono";
import { randomUUID } from "node:crypto";
import { getPool } from "./db.ts";
import { enrollAndActuate } from "./cascade.ts";

function json(c: Context, body: unknown, status = 200) {
  return c.json(body, status);
}

function firmId(c: Context): string {
  return c.req.query("firmId") || c.req.header("x-firm-id") || "firm-cedar";
}

/** Ensure CT firm has campaign + sequence bindings (copy from firm-cedar / platform templates). */
export async function ensureFirmMachine(firm: string) {
  const pool = getPool();
  await pool.query(
    `INSERT INTO ct_firms (id, name, posture)
     VALUES ($1,$2,'Armed')
     ON CONFLICT (id) DO NOTHING`,
    [firm, firm],
  );
  await pool.query(
    `INSERT INTO campaign_states (firm_id, state)
     VALUES ($1,'running')
     ON CONFLICT (firm_id) DO UPDATE SET state='running', updated_at=now()`,
    [firm],
  );

  const classes = ["optin_launch", "launch_day", "reengagement", "reactivation"] as const;
  for (const seqClass of classes) {
    const existing = await pool.query(
      `SELECT 1 FROM firm_sequence_binding WHERE firm_id=$1 AND sequence_class=$2`,
      [firm, seqClass],
    );
    if (existing.rowCount && existing.rowCount > 0) continue;
    const tpl = await pool.query<{ id: string }>(
      `SELECT id FROM sequence_template WHERE sequence_class=$1 ORDER BY version DESC LIMIT 1`,
      [seqClass],
    );
    const templateId = tpl.rows[0]?.id;
    if (!templateId) continue;
    await pool.query(
      `INSERT INTO firm_sequence_binding (id, firm_id, sequence_class, template_id, variable_bindings)
       VALUES ($1,$2,$3,$4,'{}'::jsonb)
       ON CONFLICT (firm_id, sequence_class) DO NOTHING`,
      [`bind.${firm}.${seqClass}`, firm, seqClass, templateId],
    );
  }
}

export async function handleJourneyStatus(c: Context) {
  const firm = firmId(c);
  await ensureFirmMachine(firm);
  const pool = getPool();
  const [grant, contacts, verdicts, signals, enrollments] = await Promise.all([
    pool.query(`SELECT granted, revoked FROM crm_oauth_grants WHERE firm_id=$1`, [firm]),
    pool.query(`SELECT count(*)::int AS n FROM contact_records WHERE firm_id=$1`, [firm]),
    pool.query(
      `SELECT count(*)::int AS n FROM reachability_verdicts WHERE firm_id=$1 AND verdict='reachable'`,
      [firm],
    ),
    pool.query(`SELECT count(*)::int AS n FROM signals WHERE firm_id=$1`, [firm]),
    pool.query(`SELECT count(*)::int AS n FROM enrollment WHERE firm_id=$1`, [firm]),
  ]);
  const g = grant.rows[0];
  return json(c, {
    firmId: firm,
    authorized: Boolean(g?.granted && !g?.revoked),
    contactCount: contacts.rows[0]?.n ?? 0,
    reachableCount: verdicts.rows[0]?.n ?? 0,
    signalCount: signals.rows[0]?.n ?? 0,
    enrollmentCount: enrollments.rows[0]?.n ?? 0,
  });
}

export async function handleAuthorizeBook(c: Context) {
  const firm = firmId(c);
  await ensureFirmMachine(firm);
  const pool = getPool();
  await pool.query(
    `INSERT INTO crm_oauth_grants (firm_id, granted, revoked, scopes, granted_at, updated_at)
     VALUES ($1, true, false, ARRAY['book.read','book.write'], now(), now())
     ON CONFLICT (firm_id) DO UPDATE SET
       granted=true, revoked=false, granted_at=now(), revoked_at=NULL, updated_at=now()`,
    [firm],
  );
  await pool.query(
    `INSERT INTO prepared_workspaces (id, firm_id, status, body)
     VALUES ($1,$2,'authorized',$3::jsonb)
     ON CONFLICT (id) DO UPDATE SET status='authorized', body=EXCLUDED.body`,
    [`pw-${firm}`, firm, JSON.stringify({ authorizedAt: new Date().toISOString() })],
  );
  return json(c, { firmId: firm, authorized: true, table: "crm_oauth_grants" });
}

export async function handleListContacts(c: Context) {
  const firm = firmId(c);
  const pool = getPool();
  const rows = await pool.query(
    `SELECT c.id, c.firm_id, c.email, c.phone, c.name, c.body, c.created_at,
            r.verdict, sr.ready,
            (SELECT e.agent_ref FROM enrollment e
             WHERE e.firm_id=c.firm_id AND e.contact_id=c.id
             ORDER BY e.enrolled_at DESC LIMIT 1) AS latest_enrollment,
            (SELECT s.kind FROM signals s
             WHERE s.firm_id=c.firm_id AND s.contact_id=c.id
             ORDER BY s.created_at DESC LIMIT 1) AS latest_signal,
            (SELECT m.motion FROM motion_decisions m
             WHERE m.firm_id=c.firm_id AND m.contact_id=c.id
             ORDER BY m.created_at DESC LIMIT 1) AS latest_motion
     FROM contact_records c
     LEFT JOIN reachability_verdicts r ON r.contact_id=c.id AND r.firm_id=c.firm_id
     LEFT JOIN sequence_ready sr ON sr.contact_id=c.id AND sr.firm_id=c.firm_id
     WHERE c.firm_id=$1
     ORDER BY c.created_at DESC`,
    [firm],
  );
  return json(c, { contacts: rows.rows });
}

export async function handleImportContacts(c: Context) {
  const firm = firmId(c);
  await ensureFirmMachine(firm);
  const body = await c.req.json<{
    fileName?: string;
    contacts: Array<{ id?: string; name?: string; email?: string; phone?: string }>;
  }>();
  const pool = getPool();
  const importId = `imp-${randomUUID().slice(0, 8)}`;
  const written: string[] = [];

  for (const row of body.contacts ?? []) {
    const id =
      row.id ??
      `c-${(row.email || row.phone || row.name || randomUUID()).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}-${randomUUID().slice(0, 6)}`;
    await pool.query(
      `INSERT INTO contact_records (id, firm_id, email, phone, name, body)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb)
       ON CONFLICT (id) DO UPDATE SET
         email=COALESCE(EXCLUDED.email, contact_records.email),
         phone=COALESCE(EXCLUDED.phone, contact_records.phone),
         name=COALESCE(EXCLUDED.name, contact_records.name),
         body=contact_records.body || EXCLUDED.body,
         updated_at=now()`,
      [
        id,
        firm,
        row.email?.trim() || null,
        row.phone?.trim() || null,
        row.name?.trim() || null,
        JSON.stringify({ importId, fileName: body.fileName ?? null }),
      ],
    );
    written.push(id);
  }

  return json(c, {
    importId,
    firmId: firm,
    written: written.length,
    contactIds: written,
    table: "contact_records",
  });
}

/**
 * Detection pass: audit/reachability + eligibility cascade (reference trigger) for all firm contacts.
 */
export async function handleJourneyDetect(c: Context) {
  const firm = firmId(c);
  await ensureFirmMachine(firm);
  const pool = getPool();
  const contacts = await pool.query<{
    id: string;
    email: string | null;
    phone: string | null;
    name: string | null;
  }>(`SELECT id, email, phone, name FROM contact_records WHERE firm_id=$1`, [firm]);

  const runId = `arun-${randomUUID()}`;
  await pool.query(
    `INSERT INTO audit_runs (id, firm_id, status, import_ids)
     VALUES ($1,$2,'running','[]'::jsonb)`,
    [runId, firm],
  );

  for (const contact of contacts.rows) {
    const hasChannel = Boolean(contact.email || contact.phone);
    const verdict = hasChannel ? "reachable" : "unreachable";
    await pool.query(
      `INSERT INTO reachability_verdicts (contact_id, firm_id, verdict, details)
       VALUES ($1,$2,$3,$4::jsonb)
       ON CONFLICT (contact_id, firm_id) DO UPDATE SET verdict=EXCLUDED.verdict, details=EXCLUDED.details, updated_at=now()`,
      [contact.id, firm, verdict, JSON.stringify({ auditRunId: runId, source: "journey_detect" })],
    );
    await pool.query(
      `INSERT INTO sequence_ready (contact_id, firm_id, ready)
       VALUES ($1,$2,$3)
       ON CONFLICT (contact_id, firm_id) DO UPDATE SET ready=EXCLUDED.ready, updated_at=now()`,
      [contact.id, firm, verdict === "reachable"],
    );
  }

  await pool.query(
    `UPDATE audit_runs SET status='complete', finished_at=now(), summary=$2::jsonb WHERE id=$1`,
    [runId, JSON.stringify({ contacts: contacts.rowCount, source: "journey_detect" })],
  );

  // Eligibility → signal → motion (reuse reference cascade shape without requiring external API)
  const refId = `ref.journey.detect.${Date.now()}`;
  await pool.query(
    `INSERT INTO reference_versions (id, firm_id, key, payload, version)
     VALUES ($1,$2,'journey_detect',$3::jsonb,1)
     ON CONFLICT (id) DO NOTHING`,
    [refId, firm, JSON.stringify({ auditRunId: runId })],
  );

  let signals = 0;
  for (const contact of contacts.rows) {
    const hasChannel = Boolean(contact.email || contact.phone);
    if (!hasChannel) continue;
    const evalId = `eval-${randomUUID()}`;
    await pool.query(
      `INSERT INTO eligibility_evaluations (id, firm_id, contact_id, trigger_kind, status)
       VALUES ($1,$2,$3,'journey_detect','done')`,
      [evalId, firm, contact.id],
    );
    const resultId = `eres-${randomUUID()}`;
    await pool.query(
      `INSERT INTO eligibility_results (id, evaluation_id, firm_id, contact_id, result, any_pathway_pass)
       VALUES ($1,$2,$3,$4,$5::jsonb,true)`,
      [
        resultId,
        evalId,
        firm,
        contact.id,
        JSON.stringify({ auditRunId: runId, refId }),
      ],
    );
    const signalId = `sig-${randomUUID()}`;
    await pool.query(
      `INSERT INTO signals (id, firm_id, contact_id, kind, payload)
       VALUES ($1,$2,$3,'eligibility_determination',$4::jsonb)`,
      [signalId, firm, contact.id, JSON.stringify({ resultId, anyPass: true })],
    );
    const motionId = `mot-${randomUUID()}`;
    await pool.query(
      `INSERT INTO motion_decisions (id, firm_id, contact_id, motion, reason)
       VALUES ($1,$2,$3,'reactivation',$4::jsonb)`,
      [motionId, firm, contact.id, JSON.stringify({ signalId, source: "journey_detect" })],
    );
    signals += 1;
  }

  return json(c, {
    auditRunId: runId,
    contacts: contacts.rowCount,
    signals,
    table: "eligibility_results",
  });
}

/** Outreach: enroll ready/signaled contacts via proven enrollAndActuate (dry-run by default). */
export async function handleJourneyOutreach(c: Context) {
  const firm = firmId(c);
  await ensureFirmMachine(firm);
  const pool = getPool();
  const ready = await pool.query<{ contact_id: string }>(
    `SELECT contact_id FROM sequence_ready WHERE firm_id=$1 AND ready=true`,
    [firm],
  );

  const bind = await pool.query<{ template_id: string }>(
    `SELECT template_id FROM firm_sequence_binding
     WHERE firm_id=$1 AND sequence_class='optin_launch'`,
    [firm],
  );
  const agentRef = bind.rows[0]?.template_id ?? "tpl.optin_launch.v1";

  const results: Array<{ contactId: string; enrollmentId: string; dryRun: boolean }> = [];
  for (const row of ready.rows) {
    // Skip if already enrolled for this agent recently
    const prior = await pool.query(
      `SELECT 1 FROM enrollment WHERE firm_id=$1 AND contact_id=$2 AND agent_ref=$3 LIMIT 1`,
      [firm, row.contact_id, agentRef],
    );
    if (prior.rowCount && prior.rowCount > 0) continue;

    const enrolled = await enrollAndActuate({
      firmId: firm,
      contactId: row.contact_id,
      agentRef,
      sequenceId: agentRef,
      purpose: "opt-in",
      payload: { trigger: "journey_outreach" },
      fireFirstStep: true,
    });
    results.push({
      contactId: row.contact_id,
      enrollmentId: enrolled.enrollmentId,
      dryRun: enrolled.dryRun,
    });
  }

  return json(c, {
    firmId: firm,
    agentRef,
    enrollments: results.length,
    results,
    table: "enrollment",
  });
}
