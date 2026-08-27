/**
 * SYSTEMS-CHANGE-PACKET-020 — Operator panes: six-gate SELECT, escrow UPSERT,
 * register_gaps UPSERT. No firm_readiness. Percent / "next" stay chrome.
 */
import type { Context } from "hono";
import { getPool } from "./db.ts";
import { requireSessionFirm } from "./sessionFirm.ts";
import { appendFirmAudit } from "./stores.ts";

function json(c: Context, body: unknown, status = 200) {
  return c.json(body, status);
}

const ESCROW_STATUSES = [
  "held",
  "release_pending_window",
  "released",
  "returned",
  "disputed",
] as const;

type EscrowStatus = (typeof ESCROW_STATUSES)[number];

function isEscrowStatus(value: unknown): value is EscrowStatus {
  return typeof value === "string" && (ESCROW_STATUSES as readonly string[]).includes(value);
}

/** GET /machine/activation-gates — SELECT the six gate tables for the claimed firm. */
export async function handleActivationGatesGet(c: Context) {
  const firm = await requireSessionFirm(c);
  const pool = getPool();

  const [
    firmRow,
    workspaceRow,
    grantRow,
    domainRow,
    escrowRow,
    campaignRow,
  ] = await Promise.all([
    pool.query(`SELECT 1 FROM ct_firms WHERE id=$1 LIMIT 1`, [firm]),
    pool.query(
      `SELECT 1 FROM prepared_workspaces
       WHERE firm_id=$1
         AND (status = 'hydrated' OR COALESCE(body->>'staging','') = 'hydrated')
       LIMIT 1`,
      [firm],
    ),
    pool.query(
      `SELECT 1 FROM crm_oauth_grants
       WHERE firm_id=$1 AND granted = true AND revoked = false
       LIMIT 1`,
      [firm],
    ),
    pool.query(
      `SELECT 1 FROM sending_domains
       WHERE firm_id=$1 AND (status = 'verified' OR verified_at IS NOT NULL)
       LIMIT 1`,
      [firm],
    ),
    pool.query(
      `SELECT 1 FROM escrow_acceptances
       WHERE firm_id=$1 AND status IN ('held','release_pending_window')
       LIMIT 1`,
      [firm],
    ),
    pool.query(
      `SELECT 1 FROM campaign_states WHERE firm_id=$1 AND state = 'running' LIMIT 1`,
      [firm],
    ),
  ]);

  return json(c, {
    firmId: firm,
    firmExists: Boolean(firmRow.rowCount),
    forwardDeployed: Boolean(workspaceRow.rowCount),
    authorizeBook: Boolean(grantRow.rowCount),
    readyToSend: Boolean(domainRow.rowCount),
    escrowHeld: Boolean(escrowRow.rowCount),
    campaignRunning: Boolean(campaignRow.rowCount),
  });
}

/** GET /machine/escrow — one acceptance row. Missing = not held. */
export async function handleEscrowGet(c: Context) {
  const firm = await requireSessionFirm(c);
  const pool = getPool();
  const rows = await pool.query(
    `SELECT firm_id, accepted, terms, accepted_at, status, updated_at
     FROM escrow_acceptances WHERE firm_id=$1`,
    [firm],
  );
  if (!rows.rowCount) {
    return json(c, {
      firmId: firm,
      accepted: false,
      terms: {},
      acceptedAt: null,
      status: null,
      missing: true,
    });
  }
  const row = rows.rows[0];
  return json(c, {
    firmId: row.firm_id,
    accepted: Boolean(row.accepted),
    terms: row.terms ?? {},
    acceptedAt: row.accepted_at ?? null,
    status: row.status ?? null,
    updatedAt: row.updated_at,
    missing: false,
  });
}

/** PUT /machine/escrow — Save terms UPSERT; Release / Return / Dispute set status. */
export async function handleEscrowPut(c: Context) {
  const firm = await requireSessionFirm(c);
  const body = await c.req.json<{
    terms?: Record<string, unknown>;
    accepted?: boolean;
    status?: string;
  }>();
  if (body.status !== undefined && !isEscrowStatus(body.status)) {
    return json(c, { error: "status must be held | release_pending_window | released | returned | disputed" }, 400);
  }
  const pool = getPool();
  const existing = await pool.query(
    `SELECT accepted, terms, accepted_at, status FROM escrow_acceptances WHERE firm_id=$1`,
    [firm],
  );
  const prev = existing.rows[0];
  const terms =
    body.terms && typeof body.terms === "object"
      ? body.terms
      : ((prev?.terms as Record<string, unknown> | undefined) ?? {});
  const accepted = body.accepted ?? (prev ? Boolean(prev.accepted) : Boolean(body.terms));
  const status: EscrowStatus = body.status ?? (prev?.status as EscrowStatus | undefined) ?? "held";
  const acceptedAt = accepted
    ? (prev?.accepted_at ?? new Date().toISOString())
    : prev?.accepted_at ?? null;

  await pool.query(
    `INSERT INTO escrow_acceptances (firm_id, accepted, terms, accepted_at, updated_at, status)
     VALUES ($1,$2,$3::jsonb,$4,now(),$5)
     ON CONFLICT (firm_id) DO UPDATE SET
       accepted = EXCLUDED.accepted,
       terms = EXCLUDED.terms,
       accepted_at = COALESCE(escrow_acceptances.accepted_at, EXCLUDED.accepted_at),
       status = EXCLUDED.status,
       updated_at = now()`,
    [firm, accepted, JSON.stringify(terms), acceptedAt, status],
  );

  const kind = body.status ? "escrow.status" : "escrow.accepted";
  await appendFirmAudit({
    firmId: firm,
    kind,
    payload: { status, accepted, termsVersion: typeof terms.version === "string" ? terms.version : null },
  });

  return json(c, {
    firmId: firm,
    accepted,
    terms,
    acceptedAt,
    status,
    missing: false,
    table: "escrow_acceptances",
  });
}

/** GET /machine/register-gaps — list the operation's rows. */
export async function handleRegisterGapsList(c: Context) {
  await requireSessionFirm(c);
  const pool = getPool();
  const rows = await pool.query(
    `SELECT id, summary, ticket, firm_id, source, written, created_at, updated_at
     FROM register_gaps
     ORDER BY created_at DESC`,
  );
  return json(c, {
    gaps: rows.rows.map((row) => ({
      id: row.id,
      summary: row.summary,
      ticket: row.ticket ?? null,
      firmId: row.firm_id ?? null,
      source: row.source ?? null,
      written: Boolean(row.written),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  });
}

/** PUT /machine/register-gaps — New / Edit / Written UPSERT. */
export async function handleRegisterGapPut(c: Context) {
  await requireSessionFirm(c);
  const body = await c.req.json<{
    id?: string;
    summary: string;
    ticket?: string | null;
    firmId?: string | null;
    source?: string | null;
    written?: boolean;
  }>();
  const summary = (body.summary ?? "").trim();
  if (!summary) {
    return json(c, { error: "summary required" }, 400);
  }
  const id = (body.id ?? "").trim() || `gap-${Date.now()}`;
  const pool = getPool();
  await pool.query(
    `INSERT INTO register_gaps (id, summary, ticket, firm_id, source, written, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,now())
     ON CONFLICT (id) DO UPDATE SET
       summary = EXCLUDED.summary,
       ticket = EXCLUDED.ticket,
       firm_id = EXCLUDED.firm_id,
       source = EXCLUDED.source,
       written = EXCLUDED.written,
       updated_at = now()`,
    [
      id,
      summary,
      body.ticket?.trim() || null,
      body.firmId?.trim() || null,
      body.source?.trim() || null,
      Boolean(body.written),
    ],
  );
  const row = await pool.query(
    `SELECT id, summary, ticket, firm_id, source, written, created_at, updated_at
     FROM register_gaps WHERE id=$1`,
    [id],
  );
  const saved = row.rows[0];
  return json(c, {
    id: saved.id,
    summary: saved.summary,
    ticket: saved.ticket ?? null,
    firmId: saved.firm_id ?? null,
    source: saved.source ?? null,
    written: Boolean(saved.written),
    createdAt: saved.created_at,
    updatedAt: saved.updated_at,
    table: "register_gaps",
  });
}
