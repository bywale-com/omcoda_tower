/**
 * Authored sequence cells → runtime cursor.
 * Template cells are the day/step cursor; channel ladder escalates within a cell.
 */
import type { Pool } from "pg";

export type NormalizedCell = {
  id: string;
  label: string;
  token: string;
  channel: "text" | "email" | "form";
  /** Milliseconds after enrollment when this cell becomes due */
  offsetMs: number;
  subject: string;
  bodyText: string;
};

type RawCell = {
  id?: string;
  token?: string;
  label?: string;
  channel?: string;
  day?: number;
  dayOffset?: number;
  offsetMinutes?: number;
  subject?: string;
  bodyText?: string;
  body?: string;
  mode?: string;
};

function channelFromToken(token: string, explicit?: string): "text" | "email" | "form" {
  const e = (explicit ?? "").toLowerCase();
  if (e === "text" || e === "sms" || e === "email" || e === "form") {
    return e === "sms" ? "text" : (e as "text" | "email" | "form");
  }
  const t = token.toLowerCase();
  if (t.includes("email") || t.includes("announce")) return "email";
  if (t.includes("form") || t.includes("social") || t.includes("landing") || t.includes("waitlist")) {
    return "form";
  }
  if (t.includes("sms") || t.includes("text") || t.includes("primer")) return "text";
  if (t.includes("nurture") || t.includes("nudge")) return "email";
  return "text";
}

function dayFromToken(token: string, cell: RawCell): number {
  if (typeof cell.day === "number" && Number.isFinite(cell.day)) return cell.day;
  if (typeof cell.dayOffset === "number" && Number.isFinite(cell.dayOffset)) return cell.dayOffset;
  const t = token.toLowerCase();
  const m = t.match(/day[s]?_?(\d+)/);
  if (m) return Number(m[1]);
  if (t.includes("day0") || t.includes("d0")) return 0;
  return 0;
}

export function normalizeTemplateCells(raw: unknown[]): NormalizedCell[] {
  const cells = (Array.isArray(raw) ? raw : []) as RawCell[];
  return cells.map((c, i) => {
    const token = c.token ?? c.id ?? `cell-${i}`;
    const id = c.id ?? token;
    const label = c.label ?? token;
    const channel = channelFromToken(token, c.channel);
    let offsetMs: number;
    if (typeof c.offsetMinutes === "number" && Number.isFinite(c.offsetMinutes)) {
      offsetMs = Math.max(0, c.offsetMinutes) * 60 * 1000;
    } else {
      const day = dayFromToken(token, c);
      offsetMs = Math.max(0, day) * 24 * 60 * 60 * 1000;
    }
    const subject = c.subject ?? `Tower — ${label}`;
    const bodyText = c.bodyText ?? c.body ?? `${label} (${token})`;
    return { id, label, token, channel, offsetMs, subject, bodyText };
  });
}

export async function loadTemplateCells(
  pool: Pool,
  templateId: string,
): Promise<{ templateId: string; label: string; cells: NormalizedCell[] } | null> {
  const r = await pool.query<{ id: string; label: string; cells: unknown }>(
    `SELECT id, label, cells FROM sequence_template WHERE id=$1 LIMIT 1`,
    [templateId],
  );
  if (!r.rowCount) return null;
  const row = r.rows[0];
  const raw = Array.isArray(row.cells) ? row.cells : [];
  return {
    templateId: row.id,
    label: row.label,
    cells: normalizeTemplateCells(raw),
  };
}

/** Resolve bound template for firm+class, else treat agentRef as template id. */
export async function resolveBoundTemplate(
  pool: Pool,
  firmId: string,
  agentRef: string,
): Promise<{ templateId: string; label: string; cells: NormalizedCell[] } | null> {
  const bind = await pool.query<{ template_id: string }>(
    `SELECT template_id FROM firm_sequence_binding
     WHERE firm_id=$1 AND template_id=$2
     LIMIT 1`,
    [firmId, agentRef],
  );
  const templateId = bind.rows[0]?.template_id ?? agentRef;
  return loadTemplateCells(pool, templateId);
}
