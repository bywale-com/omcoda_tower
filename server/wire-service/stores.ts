import type { Context } from "hono";
import { getPool } from "./db.ts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function handleAuditAppend(c: Context) {
  const body = await c.req.json<{
    actorId: string;
    kind: string;
    subjectType: string;
    subjectId: string;
    firmId?: string;
    payload?: Record<string, unknown>;
  }>();
  const eventId = id("aud");
  const at = new Date().toISOString();
  await getPool().query(
    `INSERT INTO audit_events (id, at, actor_id, kind, subject_type, subject_id, firm_id, payload)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      eventId,
      at,
      body.actorId,
      body.kind,
      body.subjectType,
      body.subjectId,
      body.firmId ?? null,
      body.payload ? JSON.stringify(body.payload) : null,
    ],
  );
  return c.json({
    id: eventId,
    at,
    actorId: body.actorId,
    kind: body.kind,
    subjectType: body.subjectType,
    subjectId: body.subjectId,
    payload: body.payload,
  });
}

export async function handleAuditList(c: Context) {
  const subjectId = c.req.query("subjectId");
  const kind = c.req.query("kind");
  const result = await getPool().query(
    `SELECT id, at, actor_id, kind, subject_type, subject_id, payload
     FROM audit_events
     WHERE ($1::text IS NULL OR subject_id = $1)
       AND ($2::text IS NULL OR kind = $2)
     ORDER BY at DESC
     LIMIT 200`,
    [subjectId ?? null, kind ?? null],
  );
  return c.json({
    events: result.rows.map((r) => ({
      id: r.id,
      at: r.at,
      actorId: r.actor_id,
      kind: r.kind,
      subjectType: r.subject_type,
      subjectId: r.subject_id,
      payload: r.payload ?? undefined,
    })),
  });
}

export async function handleHaltCommit(c: Context) {
  const body = await c.req.json<{
    consultantId: string;
    contactId?: string;
    firmId: string;
    scope: "contact" | "firm-book";
    reason?: string;
  }>();
  const pool = getPool();
  const haltId = id("halt");
  const haltedAt = new Date().toISOString();
  if (body.scope === "firm-book") {
    await pool.query(
      `UPDATE halt_records SET lifted_at = $1
       WHERE firm_id = $2 AND scope = 'firm-book' AND lifted_at IS NULL`,
      [haltedAt, body.firmId],
    );
  }
  await pool.query(
    `INSERT INTO halt_records
      (id, consultant_id, contact_id, firm_id, scope, reason, halted_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      haltId,
      body.consultantId,
      body.contactId ?? null,
      body.firmId,
      body.scope,
      body.reason ?? null,
      haltedAt,
    ],
  );
  await pool.query(
    `INSERT INTO audit_events (id, at, actor_id, kind, subject_type, subject_id, firm_id, payload)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      id("aud"),
      haltedAt,
      body.consultantId,
      body.scope === "firm-book" ? "halt.firm-book" : "halt.contact",
      body.scope === "firm-book" ? "firm" : "contact",
      body.scope === "firm-book" ? body.firmId : (body.contactId ?? body.firmId),
      body.firmId,
      JSON.stringify({ haltId, reason: body.reason }),
    ],
  );
  return c.json({
    id: haltId,
    consultantId: body.consultantId,
    contactId: body.contactId,
    firmId: body.firmId,
    scope: body.scope,
    reason: body.reason,
    haltedAt,
  });
}

export async function handleHaltLift(c: Context) {
  const haltId = c.req.param("haltId");
  const pool = getPool();
  const existing = await pool.query(`SELECT * FROM halt_records WHERE id = $1`, [haltId]);
  const row = existing.rows[0];
  if (!row) return c.json({ record: null });
  if (row.lifted_at) {
    return c.json({
      record: mapHalt(row),
    });
  }
  const liftedAt = new Date().toISOString();
  await pool.query(`UPDATE halt_records SET lifted_at = $1 WHERE id = $2`, [liftedAt, haltId]);
  await pool.query(
    `INSERT INTO audit_events (id, at, actor_id, kind, subject_type, subject_id, firm_id, payload)
     VALUES ($1,$2,$3,'halt.lift',$4,$5,$6,$7)`,
    [
      id("aud"),
      liftedAt,
      row.consultant_id,
      row.scope === "firm-book" ? "firm" : "contact",
      row.scope === "firm-book" ? row.firm_id : (row.contact_id ?? row.firm_id),
      row.firm_id,
      JSON.stringify({ haltId }),
    ],
  );
  return c.json({
    record: { ...mapHalt(row), liftedAt },
  });
}

export async function handleHaltList(c: Context) {
  const firmId = c.req.query("firmId");
  const result = await getPool().query(
    `SELECT * FROM halt_records
     WHERE lifted_at IS NULL AND ($1::text IS NULL OR firm_id = $1)
     ORDER BY halted_at DESC`,
    [firmId ?? null],
  );
  return c.json({ records: result.rows.map(mapHalt) });
}

export async function handleHaltIsContact(c: Context) {
  const contactId = c.req.param("contactId");
  const result = await getPool().query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL AND scope = 'contact' AND contact_id = $1
     LIMIT 1`,
    [contactId],
  );
  return c.json({ halted: result.rowCount! > 0 });
}

export async function handleHaltIsFirmBook(c: Context) {
  const firmId = c.req.param("firmId");
  const result = await getPool().query(
    `SELECT 1 FROM halt_records
     WHERE lifted_at IS NULL AND scope = 'firm-book' AND firm_id = $1
     LIMIT 1`,
    [firmId],
  );
  return c.json({ halted: result.rowCount! > 0 });
}

function mapHalt(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    consultantId: row.consultant_id as string,
    contactId: (row.contact_id as string | null) ?? undefined,
    firmId: row.firm_id as string,
    scope: row.scope as "contact" | "firm-book",
    reason: (row.reason as string | null) ?? undefined,
    haltedAt: new Date(row.halted_at as string).toISOString(),
    liftedAt: row.lifted_at ? new Date(row.lifted_at as string).toISOString() : undefined,
  };
}

export async function handleConsentSet(c: Context) {
  const body = await c.req.json<{
    contactId: string;
    firmId: string;
    basis: "express" | "implied" | "none";
  }>();
  await getPool().query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, updated_at)
     VALUES ($1,$2,$3,false,now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE
       SET basis = EXCLUDED.basis, updated_at = now()`,
    [body.contactId, body.firmId, body.basis],
  );
  return c.json({ ok: true });
}

export async function handleConsentSilence(c: Context) {
  const body = await c.req.json<{
    contactId: string;
    firmId: string;
    source: string;
  }>();
  await getPool().query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, source, updated_at)
     VALUES ($1,$2,'none',true,$3,now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE
       SET silenced = true, source = EXCLUDED.source, updated_at = now()`,
    [body.contactId, body.firmId, body.source],
  );
  return c.json({ ok: true });
}

export async function handleConsentGet(c: Context) {
  const contactId = c.req.param("contactId");
  const result = await getPool().query(
    `SELECT basis, silenced FROM consent_records WHERE contact_id = $1 LIMIT 1`,
    [contactId],
  );
  const row = result.rows[0];
  return c.json({
    basis: row?.basis ?? "none",
    silenced: row?.silenced ?? false,
  });
}

export async function handleOAuthGrant(c: Context) {
  const body = await c.req.json<{ firmId: string; scopes?: string[] }>();
  const scopes = body.scopes ?? ["contacts.read", "export"];
  const grantedAt = new Date().toISOString();
  await getPool().query(
    `INSERT INTO crm_oauth_grants (firm_id, granted, revoked, scopes, granted_at, revoked_at, updated_at)
     VALUES ($1,true,false,$2,$3,null,now())
     ON CONFLICT (firm_id) DO UPDATE
       SET granted = true, revoked = false, scopes = EXCLUDED.scopes,
           granted_at = EXCLUDED.granted_at, revoked_at = null, updated_at = now()`,
    [body.firmId, scopes, grantedAt],
  );
  return c.json({
    firmId: body.firmId,
    granted: true,
    revoked: false,
    scopes,
    grantedAt,
  });
}

export async function handleOAuthRevoke(c: Context) {
  const firmId = c.req.param("firmId");
  const revokedAt = new Date().toISOString();
  const existing = await getPool().query(
    `SELECT scopes FROM crm_oauth_grants WHERE firm_id = $1`,
    [firmId],
  );
  const scopes = (existing.rows[0]?.scopes as string[]) ?? [];
  await getPool().query(
    `INSERT INTO crm_oauth_grants (firm_id, granted, revoked, scopes, revoked_at, updated_at)
     VALUES ($1,false,true,$2,$3,now())
     ON CONFLICT (firm_id) DO UPDATE
       SET granted = false, revoked = true, revoked_at = EXCLUDED.revoked_at, updated_at = now()`,
    [firmId, scopes, revokedAt],
  );
  return c.json({
    firmId,
    granted: false,
    revoked: true,
    scopes,
    revokedAt,
  });
}

export async function handleOAuthGet(c: Context) {
  const firmId = c.req.param("firmId");
  const result = await getPool().query(
    `SELECT * FROM crm_oauth_grants WHERE firm_id = $1`,
    [firmId],
  );
  const row = result.rows[0];
  if (!row) {
    return c.json({ firmId, granted: false, revoked: false, scopes: [] });
  }
  return c.json({
    firmId,
    granted: row.granted,
    revoked: row.revoked,
    scopes: row.scopes ?? [],
    grantedAt: row.granted_at ? new Date(row.granted_at).toISOString() : undefined,
    revokedAt: row.revoked_at ? new Date(row.revoked_at).toISOString() : undefined,
  });
}

export async function handlePrimaryGet(c: Context) {
  const collection = c.req.param("collection");
  const rowId = c.req.param("id");
  const result = await getPool().query(
    `SELECT body FROM primary_store_rows WHERE collection = $1 AND id = $2`,
    [collection, rowId],
  );
  return c.json({ row: result.rows[0]?.body ?? null });
}

export async function handlePrimaryPut(c: Context) {
  const collection = c.req.param("collection");
  const body = await c.req.json<{ id: string } & Record<string, unknown>>();
  await getPool().query(
    `INSERT INTO primary_store_rows (collection, id, body, updated_at)
     VALUES ($1,$2,$3,now())
     ON CONFLICT (collection, id) DO UPDATE
       SET body = EXCLUDED.body, updated_at = now()`,
    [collection, body.id, JSON.stringify(body)],
  );
  return c.json({ row: body });
}

export async function handlePrimaryList(c: Context) {
  const collection = c.req.param("collection");
  const result = await getPool().query(
    `SELECT body FROM primary_store_rows WHERE collection = $1 ORDER BY updated_at DESC`,
    [collection],
  );
  return c.json({ rows: result.rows.map((r) => r.body) });
}
