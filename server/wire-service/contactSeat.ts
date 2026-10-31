/**
 * Contact workspace seat — /c/<token>, no session.
 * Now / History / Upload projection. Upload INSERT is contact_uploaded.
 * Do not recut 015. Do not reuse access_links.
 */
import type { Context } from "hono";
import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { sha256 } from "../auth-service/crypto.ts";
import { isPlatformAdminEmail } from "../auth-service/platformAdmin.ts";
import { getPool } from "./db.ts";
import { runContactEligibilityCascade } from "./machine.ts";
import { FirmScopeError, requireSessionActor, requireSessionFirm } from "./sessionFirm.ts";
import { dispatchEventToWorkflows } from "./workflowWalk.ts";
import {
  campaignObjectiveIdForCampaign,
  onCompletionWrite,
  resolveFormStamp,
} from "./campaignHousing.ts";

export const SEED_CONTACT_TOKENS = {
  okonkwo: "c-harbor-okonkwo",
  cole: "c-harbor-cole",
  wei: "c-harbor-wei",
  haddad: "c-harbor-haddad",
  ana: "c-cedar-ana",
  jon: "c-cedar-jon",
  priya: "c-cedar-priya",
} as const;

type HistoryRow = {
  id: string;
  kind: "consent" | "form" | "meeting";
  title: string;
  outstanding: boolean;
  campaignId: string | null;
  body: string;
};

type FormField = {
  fieldKey: string;
  label: string;
};

type UploadRow = {
  id: string;
  kind: string | null;
  origin: string;
  fieldKey: string | null;
  bodyText: string | null;
  fileName: string | null;
  createdAt: string;
};

type SearchHit = {
  kind: "kind" | "question";
  value: string;
  label: string;
};

export type ContactSeatPayload = {
  ok: true;
  tokenValid: true;
  firm: { id: string; name: string };
  contact: { id: string; name: string | null };
  silenced: boolean;
  now: {
    state: "silenced" | "consent" | "form" | "meeting" | "empty";
    title: string;
    instruction: string;
    consentCopy?: string;
    formFields?: FormField[];
    meetingSlots?: string[];
  };
  history: HistoryRow[];
  files: UploadRow[];
  search: SearchHit[];
  kinds: string[];
};

type SeatRefuse = {
  ok: false;
  refuse: "missing" | "expired" | "invalidated" | "workspace_opted_out";
  message: string;
};

type LinkRow = {
  id: string;
  firm_id: string;
  contact_id: string;
  enrollment_id: string | null;
  campaign_id: string | null;
  expires_at: Date | string | null;
  invalidated_at: Date | string | null;
};

function json(c: Context, body: unknown, status = 200) {
  return c.json(body, status);
}

function jsonRefuse(c: Context, refused: SeatRefuse) {
  const status = refused.refuse === "workspace_opted_out" ? 200 : 404;
  return json(c, refused, status);
}

async function lookupLink(pool: Pool, raw: string): Promise<LinkRow | null> {
  const hash = sha256(raw);
  try {
    const found = await pool.query<LinkRow>(
      `SELECT id, firm_id, contact_id, enrollment_id, campaign_id, expires_at, invalidated_at
       FROM contact_access_links WHERE token_hash=$1 LIMIT 1`,
      [hash],
    );
    return found.rows[0] ?? null;
  } catch (err) {
    if (isUndefinedTable(err)) return null;
    throw err;
  }
}

function refuseOf(link: LinkRow | null): SeatRefuse | null {
  if (!link) {
    return {
      ok: false,
      refuse: "missing",
      message: "This link could not be opened. Ask the firm for a new one.",
    };
  }
  if (link.invalidated_at) {
    return {
      ok: false,
      refuse: "invalidated",
      message: "This link is no longer valid.",
    };
  }
  if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
    return {
      ok: false,
      refuse: "expired",
      message: "This link has expired.",
    };
  }
  return null;
}

function workspaceOutRefuse(): SeatRefuse {
  return {
    ok: false,
    refuse: "workspace_opted_out",
    message: "This workspace is no longer available.",
  };
}

async function isWorkspaceOut(pool: Pool, firmId: string, contactId: string): Promise<boolean> {
  try {
    const row = await pool.query<{ workspace_opted_out: boolean }>(
      `SELECT workspace_opted_out FROM consent_records
       WHERE contact_id=$1 AND firm_id=$2 LIMIT 1`,
      [contactId, firmId],
    );
    return Boolean(row.rows[0]?.workspace_opted_out);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "42703") return false;
    throw err;
  }
}

function isUndefinedTable(err: unknown): boolean {
  return (err as { code?: string }).code === "42P01";
}

async function rowsOrEmpty<T>(run: () => Promise<{ rows: T[] }>): Promise<T[]> {
  try {
    return (await run()).rows;
  } catch (err) {
    if (isUndefinedTable(err)) return [];
    throw err;
  }
}

function meetingSlots(): string[] {
  const out: string[] = [];
  const start = new Date();
  start.setHours(16, 30, 0, 0);
  for (let i = 1; i <= 3; i++) {
    const slot = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    out.push(slot.toISOString());
  }
  return out;
}

async function projectSeat(pool: Pool, link: LinkRow): Promise<ContactSeatPayload> {
  const firm = await pool.query<{ id: string; name: string }>(
    `SELECT id, name FROM ct_firms WHERE id=$1
     UNION ALL
     SELECT id::text, name FROM firms WHERE id::text=$1
     LIMIT 1`,
    [link.firm_id],
  );
  const contact = await pool.query<{ id: string; name: string | null }>(
    `SELECT id, name FROM contact_records WHERE id=$1 LIMIT 1`,
    [link.contact_id],
  );
  const consent = await pool.query<{
    basis: string;
    silenced: boolean;
    source: string | null;
  }>(
    `SELECT basis, silenced, source FROM consent_records
     WHERE contact_id=$1 AND firm_id=$2 LIMIT 1`,
    [link.contact_id, link.firm_id],
  );
  const consentRow = consent.rows[0];
  const silenced = Boolean(consentRow?.silenced);
  const firmName = firm.rows[0]?.name ?? "the firm";
  const contactName = contact.rows[0]?.name ?? null;

  const enr = await pool.query<{
    id: string;
    sequence_id: string | null;
    campaign_id: string | null;
  }>(
    `SELECT id, sequence_id, campaign_id FROM enrollment
     WHERE firm_id=$1 AND contact_id=$2
     ORDER BY enrolled_at DESC LIMIT 1`,
    [link.firm_id, link.contact_id],
  );
  const enrollment = enr.rows[0];
  const campaignId = enrollment?.campaign_id ?? link.campaign_id;
  const sequenceId = enrollment?.sequence_id ?? null;

  let objectiveKind: "click" | "form" | "meeting" | null = null;
  if (campaignId) {
    const obj = await pool.query<{ kind: string }>(
      `SELECT kind FROM campaign_objective WHERE campaign_id=$1 LIMIT 1`,
      [campaignId],
    );
    const kind = obj.rows[0]?.kind;
    if (kind === "click" || kind === "form" || kind === "meeting") objectiveKind = kind;
  }

  const formFields: FormField[] = [];
  if (!silenced) {
    const missing = await rowsOrEmpty<{ field_key: string; label: string }>(() =>
      pool.query(
        `SELECT m.field_key, c.label
         FROM missing_fact_signals m
         JOIN collectible_fields c ON c.field_key = m.field_key
         WHERE m.firm_id=$1 AND m.contact_id=$2
           AND c.capture = 'self_reportable'
         ORDER BY c.ord, m.field_key`,
        [link.firm_id, link.contact_id],
      ),
    );
    for (const row of missing) {
      formFields.push({ fieldKey: row.field_key, label: row.label });
    }
  }

  let nowState: ContactSeatPayload["now"]["state"] = "empty";
  let title = "Nothing needed right now";
  let instruction = `${firmName} will put the next ask here.`;
  if (!consentRow || (consentRow.basis === "none" && consentRow.source !== "ignored")) {
    nowState = "consent";
    title = `${firmName} would like to stay in touch`;
    instruction = "Agree or ignore before we ask for anything else.";
  } else if (objectiveKind === "form") {
    nowState = "form";
    title = "A few facts so we can continue";
    instruction = `${firmName} asked for these so we can keep going.`;
  } else if (objectiveKind === "meeting") {
    nowState = "meeting";
    title = "Book a time";
    instruction = `${firmName} is ready when you are.`;
  }

  const campaigns = sequenceId
    ? await pool.query<{
        id: string;
        name: string;
        ord: number;
        kind: string;
      }>(
        `SELECT c.id, c.name, c.ord, o.kind
         FROM campaign c
         JOIN campaign_objective o ON o.campaign_id = c.id
         WHERE c.sequence_id=$1 AND o.kind <> 'click'
         ORDER BY c.ord ASC`,
        [sequenceId],
      )
    : { rows: [] as Array<{ id: string; name: string; ord: number; kind: string }> };

  const cursorOrd =
    campaignId != null
      ? campaigns.rows.find((row) => row.id === campaignId)?.ord ?? null
      : null;

  const history: HistoryRow[] = [];
  const consentOutstanding = !consentRow || (consentRow.basis === "none" && consentRow.source !== "ignored");
  const consentDone = Boolean(
    consentRow && (consentRow.basis === "express" || consentRow.basis === "implied" || consentRow.source === "ignored"),
  );
  history.push({
    id: "ask-consent",
    kind: "consent",
    title: "Consent",
    outstanding: consentOutstanding,
    campaignId: null,
    body: `${firmName} would like to send you updates about your file when something is needed. You can opt out later.`,
  });
  if (consentDone && !consentOutstanding) {
    history[0].outstanding = false;
  }

  for (const camp of campaigns.rows) {
    const outstanding = campaignId != null && camp.id === campaignId;
    const past = cursorOrd != null && camp.ord < cursorOrd;
    if (!outstanding && !past) continue;
    history.push({
      id: `ask-${camp.id}`,
      kind: camp.kind === "meeting" ? "meeting" : "form",
      title: camp.name,
      outstanding,
      campaignId: camp.id,
      body:
        camp.kind === "meeting"
          ? `${firmName} asked you to book a meeting.`
          : `${firmName} asked for facts so the file can continue.`,
    });
  }

  const fileRows = await rowsOrEmpty<{
    id: string;
    kind: string | null;
    origin: string;
    field_key: string | null;
    body_text: string | null;
    file_name: string | null;
    created_at: Date;
  }>(() =>
    pool.query(
      `SELECT id, kind, origin, field_key, body_text, file_name, created_at
       FROM contact_uploads
       WHERE firm_id=$1 AND contact_id=$2
       ORDER BY created_at DESC`,
      [link.firm_id, link.contact_id],
    ),
  );

  const kindRows = await rowsOrEmpty<{ kind: string }>(() =>
    pool.query(
      `SELECT DISTINCT kind FROM contact_uploads
       WHERE firm_id=$1 AND contact_id=$2 AND kind IS NOT NULL
       ORDER BY kind`,
      [link.firm_id, link.contact_id],
    ),
  );

  const questions = await rowsOrEmpty<{ field_key: string; label: string }>(() =>
    pool.query(
      `SELECT DISTINCT q.field_key, COALESCE(c.label, q.field_key) AS label
       FROM (
         SELECT field_key FROM missing_fact_signals WHERE firm_id=$1 AND contact_id=$2
         UNION
         SELECT field_key FROM fact_writebacks WHERE firm_id=$1 AND contact_id=$2
       ) q
       LEFT JOIN collectible_fields c ON c.field_key = q.field_key
       ORDER BY label`,
      [link.firm_id, link.contact_id],
    ),
  );

  const search: SearchHit[] = [
    ...kindRows.map((row) => ({ kind: "kind" as const, value: row.kind, label: row.kind })),
    ...questions.map((row) => ({
      kind: "question" as const,
      value: row.field_key,
      label: row.label,
    })),
  ];

  return {
    ok: true,
    tokenValid: true,
    firm: { id: link.firm_id, name: firmName },
    contact: { id: link.contact_id, name: contactName },
    silenced,
    now: {
      state: nowState,
      title,
      instruction,
      consentCopy: `${firmName} would like to send you updates about your file when something is needed. You can opt out later.`,
      formFields: nowState === "form" ? formFields : undefined,
      meetingSlots: nowState === "meeting" ? meetingSlots() : undefined,
    },
    history,
    files: fileRows.map((row) => ({
      id: row.id,
      kind: row.kind,
      origin: row.origin,
      fieldKey: row.field_key,
      bodyText: row.body_text,
      fileName: row.file_name,
      createdAt: new Date(row.created_at).toISOString(),
    })),
    search,
    kinds: kindRows.map((row) => row.kind),
  };
}

async function seatFromToken(c: Context): Promise<{ pool: Pool; link: LinkRow } | SeatRefuse> {
  const raw = decodeURIComponent(c.req.param("token") ?? "").trim();
  if (!raw) {
    return {
      ok: false,
      refuse: "missing",
      message: "This link could not be opened. Ask the firm for a new one.",
    };
  }
  const pool = getPool();
  const link = await lookupLink(pool, raw);
  const refused = refuseOf(link);
  if (refused || !link) return refused ?? refuseOf(null)!;
  if (await isWorkspaceOut(pool, link.firm_id, link.contact_id)) return workspaceOutRefuse();
  return { pool, link };
}

async function seatFromAdminContact(c: Context): Promise<{ pool: Pool; link: LinkRow } | SeatRefuse> {
  const actor = await requireSessionActor(c);
  if (!isPlatformAdminEmail(actor.email)) {
    throw new FirmScopeError(403, "platform admin only");
  }
  const firmId = await requireSessionFirm(c);
  const contactId = decodeURIComponent(c.req.param("contactId") ?? "").trim();
  if (!contactId) {
    return {
      ok: false,
      refuse: "missing",
      message: "This link could not be opened. Ask the firm for a new one.",
    };
  }
  const pool = getPool();
  const person = await pool.query<{ id: string; firm_id: string }>(
    `SELECT id, firm_id FROM contact_records WHERE id=$1 AND firm_id=$2 LIMIT 1`,
    [contactId, firmId],
  );
  if (!person.rows[0]) return refuseOf(null)!;
  if (await isWorkspaceOut(pool, firmId, contactId)) return workspaceOutRefuse();
  try {
    const found = await pool.query<LinkRow>(
      `SELECT id, firm_id, contact_id, enrollment_id, campaign_id, expires_at, invalidated_at
       FROM contact_access_links
       WHERE firm_id=$1 AND contact_id=$2 AND invalidated_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
      [firmId, contactId],
    );
    if (found.rows[0]) return { pool, link: found.rows[0] };
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code !== "42P01") throw err;
  }
  const enr = await pool.query<{ id: string; campaign_id: string | null }>(
    `SELECT id, campaign_id FROM enrollment
     WHERE firm_id=$1 AND contact_id=$2
     ORDER BY enrolled_at DESC LIMIT 1`,
    [firmId, contactId],
  );
  return {
    pool,
    link: {
      id: `cal-view-${contactId}`,
      firm_id: firmId,
      contact_id: contactId,
      enrollment_id: enr.rows[0]?.id ?? null,
      campaign_id: enr.rows[0]?.campaign_id ?? null,
      expires_at: null,
      invalidated_at: null,
    },
  };
}

async function seatFromContext(c: Context): Promise<{ pool: Pool; link: LinkRow } | SeatRefuse> {
  if (c.req.param("contactId")) return seatFromAdminContact(c);
  return seatFromToken(c);
}

export async function handleContactWorkspacesList(c: Context) {
  const actor = await requireSessionActor(c);
  if (!isPlatformAdminEmail(actor.email)) {
    throw new FirmScopeError(403, "platform admin only");
  }
  const firmId = (c.req.query("firmId") ?? "").trim() || (await requireSessionFirm(c));
  const pool = getPool();
  try {
    const rows = await pool.query<{ id: string; name: string | null; email: string | null }>(
      `SELECT cr.id, cr.name, cr.email
         FROM contact_records cr
         LEFT JOIN consent_records cons
           ON cons.contact_id = cr.id AND cons.firm_id = cr.firm_id
        WHERE cr.firm_id = $1
          AND COALESCE(cons.workspace_opted_out, false) = false
        ORDER BY cr.name`,
      [firmId],
    );
    return json(c, { workspaces: rows.rows });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "42P01" || code === "42703") {
      const rows = await pool.query<{ id: string; name: string | null; email: string | null }>(
        `SELECT id, name, email FROM contact_records WHERE firm_id=$1 ORDER BY name`,
        [firmId],
      );
      return json(c, { workspaces: rows.rows });
    }
    throw err;
  }
}

export async function handleContactSeatGet(c: Context) {
  const resolved = await seatFromContext(c);
  if ("refuse" in resolved) return jsonRefuse(c, resolved);
  return json(c, await projectSeat(resolved.pool, resolved.link));
}

export async function handleContactSeatConsent(c: Context) {
  const resolved = await seatFromContext(c);
  if ("refuse" in resolved) return jsonRefuse(c, resolved);
  const body = await c.req.json<{ action?: "agree" | "ignore" }>().catch(() => ({}));
  const action = body.action === "ignore" ? "ignore" : "agree";
  const basis = action === "agree" ? "express" : "none";
  const source = action === "agree" ? "contact_workspace" : "ignored";
  await resolved.pool.query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, source, updated_at)
     VALUES ($1,$2,$3,false,$4,now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE
       SET basis = EXCLUDED.basis, silenced = false, source = EXCLUDED.source, updated_at = now()`,
    [resolved.link.contact_id, resolved.link.firm_id, basis, source],
  );
  return json(c, await projectSeat(resolved.pool, resolved.link));
}

export async function handleContactSeatSilence(c: Context) {
  const resolved = await seatFromContext(c);
  if ("refuse" in resolved) return jsonRefuse(c, resolved);
  await resolved.pool.query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, source, workspace_opted_out, updated_at)
     VALUES ($1,$2,'none',false,'contact_workspace.workspace_opt_out',true,now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE
       SET workspace_opted_out = true, updated_at = now()`,
    [resolved.link.contact_id, resolved.link.firm_id],
  );
  return json(c, workspaceOutRefuse());
}

export async function handleContactSeatFacts(c: Context) {
  const resolved = await seatFromContext(c);
  if ("refuse" in resolved) return jsonRefuse(c, resolved);
  const body = await c.req.json<{ answers?: Array<{ fieldKey: string; value: unknown }> }>().catch(() => ({}));
  const answers = Array.isArray(body.answers) ? body.answers : [];
  for (const answer of answers) {
    const fieldKey = String(answer.fieldKey ?? "").trim();
    if (!fieldKey) continue;
    const writeId = `fwb-${randomUUID()}`;
    const stamp = await resolveFormStamp(resolved.pool, {
      firmId: resolved.link.firm_id,
      contactId: resolved.link.contact_id,
    });
    await resolved.pool.query(
      `INSERT INTO fact_writebacks (id, firm_id, contact_id, field_key, value, form_ref, campaign_objective_id)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7)`,
      [
        writeId,
        resolved.link.firm_id,
        resolved.link.contact_id,
        fieldKey,
        JSON.stringify(answer.value ?? null),
        stamp.formRef,
        stamp.campaignObjectiveId,
      ],
    );
    await resolved.pool.query(
      `DELETE FROM missing_fact_signals WHERE firm_id=$1 AND contact_id=$2 AND field_key=$3`,
      [resolved.link.firm_id, resolved.link.contact_id, fieldKey],
    );
    await runContactEligibilityCascade({
      firm: resolved.link.firm_id,
      contactIds: [resolved.link.contact_id],
      triggerKind: "fact_writeback",
      resultPayload: { writebackId: writeId, fieldKey, source: "contact_workspace" },
      eventPayload: {
        writebackId: writeId,
        fieldKey,
        contactId: resolved.link.contact_id,
        form_ref: stamp.formRef,
        campaign_objective_id: stamp.campaignObjectiveId,
      },
    });
    await dispatchEventToWorkflows(resolved.pool, {
      firmId: resolved.link.firm_id,
      eventName: "fact_writebacks",
      payload: {
        writebackId: writeId,
        fieldKey,
        contactId: resolved.link.contact_id,
        firm_id: resolved.link.firm_id,
        form_ref: stamp.formRef,
        campaign_objective_id: stamp.campaignObjectiveId,
      },
      contactIds: [resolved.link.contact_id],
    });
    await onCompletionWrite(resolved.pool, {
      firmId: resolved.link.firm_id,
      contactId: resolved.link.contact_id,
      table: "fact_writebacks",
      rowId: writeId,
    });
  }
  return json(c, await projectSeat(resolved.pool, resolved.link));
}

export async function handleContactSeatMeeting(c: Context) {
  const resolved = await seatFromContext(c);
  if ("refuse" in resolved) return jsonRefuse(c, resolved);
  const body = await c.req.json<{ slot?: string }>().catch(() => ({}));
  const slot = String(body.slot ?? "").trim();
  if (!slot) return json(c, { error: "slot required" }, 400);
  const id = `mtg-${randomUUID()}`;
  const cursor = await resolved.pool.query<{ campaign_id: string | null }>(
    `SELECT campaign_id FROM enrollment
      WHERE firm_id=$1 AND contact_id=$2 AND campaign_id IS NOT NULL
      ORDER BY enrolled_at DESC LIMIT 1`,
    [resolved.link.firm_id, resolved.link.contact_id],
  );
  const campaignObjectiveId = await campaignObjectiveIdForCampaign(
    resolved.pool,
    cursor.rows[0]?.campaign_id ?? resolved.link.campaign_id,
  );
  await resolved.pool.query(
    `INSERT INTO meeting_booked
       (id, firm_id, contact_id, booked_at, source, slot, consultant_name, enrollment_id, campaign_objective_id, payload)
     VALUES ($1,$2,$3,now(),'contact_workspace',$4,NULL,$5,$6,$7::jsonb)`,
    [
      id,
      resolved.link.firm_id,
      resolved.link.contact_id,
      slot,
      resolved.link.enrollment_id,
      campaignObjectiveId,
      JSON.stringify({ slot, contactName: null }),
    ],
  );
  await dispatchEventToWorkflows(resolved.pool, {
    firmId: resolved.link.firm_id,
    eventName: "meeting_booked",
    payload: {
      meetingId: id,
      contactId: resolved.link.contact_id,
      firm_id: resolved.link.firm_id,
      slot,
      campaign_objective_id: campaignObjectiveId,
    },
    contactIds: [resolved.link.contact_id],
  });
  await onCompletionWrite(resolved.pool, {
    firmId: resolved.link.firm_id,
    contactId: resolved.link.contact_id,
    table: "meeting_booked",
    rowId: id,
  });
  await resolved.pool.query(
    `UPDATE active_attempts
     SET status='nullified', updated_at=now(),
         state = state || jsonb_build_object('meeting_booked', true, 'meeting_id', $3::text)
     WHERE firm_id=$1 AND contact_id=$2 AND status='open'`,
    [resolved.link.firm_id, resolved.link.contact_id, id],
  );
  return json(c, await projectSeat(resolved.pool, resolved.link));
}

export async function handleContactSeatUpload(c: Context) {
  const resolved = await seatFromContext(c);
  if ("refuse" in resolved) return jsonRefuse(c, resolved);
  const body = await c.req.json<{
    origin?: "kind" | "custom" | "question" | "any";
    kind?: string | null;
    fieldKey?: string | null;
    bodyText?: string | null;
    fileName?: string | null;
  }>().catch(() => ({}));
  const origin = body.origin;
  if (origin !== "kind" && origin !== "custom" && origin !== "question" && origin !== "any") {
    return json(c, { error: "origin required" }, 400);
  }
  const kind =
    origin === "any"
      ? null
      : origin === "question"
        ? String(body.fieldKey ?? body.kind ?? "").trim() || null
        : String(body.kind ?? "").trim() || null;
  const fieldKey = origin === "question" ? String(body.fieldKey ?? "").trim() || kind : null;
  if (origin === "custom" && !kind) return json(c, { error: "custom kind required" }, 400);
  if (origin === "question" && !fieldKey) return json(c, { error: "fieldKey required" }, 400);
  const id = `cup-${randomUUID()}`;
  const fileName = body.fileName?.trim() || null;
  const fileRef = fileName ? `standin:${id}` : null;
  try {
    await resolved.pool.query(
      `INSERT INTO contact_uploads
         (id, firm_id, contact_id, kind, origin, field_key, body_text, file_name, file_ref)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        id,
        resolved.link.firm_id,
        resolved.link.contact_id,
        kind,
        origin,
        fieldKey,
        body.bodyText?.trim() || null,
        fileName,
        fileRef,
      ],
    );
  } catch (err) {
    if (isUndefinedTable(err)) {
      return json(c, { error: "contact_uploads missing — apply 019_contact_seat.sql" }, 503);
    }
    throw err;
  }
  await dispatchEventToWorkflows(resolved.pool, {
    firmId: resolved.link.firm_id,
    eventName: "contact_uploaded",
    payload: {
      id,
      firm_id: resolved.link.firm_id,
      contact_id: resolved.link.contact_id,
      kind,
      writes: [{ table: "contact_uploads", id, contact_id: resolved.link.contact_id, kind }],
    },
    contactIds: [resolved.link.contact_id],
  });
  return json(c, await projectSeat(resolved.pool, resolved.link));
}

export async function handleContactUploadKinds(c: Context) {
  const firmId = (c.req.query("firmId") ?? "").trim();
  const pool = getPool();
  const rows = await rowsOrEmpty<{ kind: string }>(() =>
    firmId
      ? pool.query(
          `SELECT DISTINCT kind FROM contact_uploads WHERE firm_id=$1 AND kind IS NOT NULL ORDER BY kind`,
          [firmId],
        )
      : pool.query(
          `SELECT DISTINCT kind FROM contact_uploads WHERE kind IS NOT NULL ORDER BY kind LIMIT 200`,
        ),
  );
  return json(c, { kinds: rows.map((row) => row.kind) });
}
