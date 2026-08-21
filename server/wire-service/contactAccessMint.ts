/**
 * Mint /c/<token> for a contact. Not access_links. Not single-use.
 */
import { randomBytes, randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { sha256 } from "../auth-service/crypto.ts";

export async function mintContactAccessLink(
  pool: Pool,
  opts: {
    firmId: string;
    contactId: string;
    enrollmentId?: string | null;
    campaignId?: string | null;
  },
): Promise<{ raw: string; path: string }> {
  const raw = randomBytes(18).toString("base64url");
  await pool.query(
    `INSERT INTO contact_access_links
       (id, firm_id, contact_id, token_hash, enrollment_id, campaign_id)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      `cal-${randomUUID()}`,
      opts.firmId,
      opts.contactId,
      sha256(raw),
      opts.enrollmentId ?? null,
      opts.campaignId ?? null,
    ],
  );
  return { raw, path: `/c/${encodeURIComponent(raw)}` };
}

export async function contactAccessUrlForSend(
  pool: Pool,
  opts: { firmId: string; contactId: string; origin?: string },
): Promise<string> {
  const enr = await pool.query<{ id: string; campaign_id: string | null }>(
    `SELECT id, campaign_id FROM enrollment
     WHERE firm_id=$1 AND contact_id=$2
     ORDER BY enrolled_at DESC LIMIT 1`,
    [opts.firmId, opts.contactId],
  );
  const minted = await mintContactAccessLink(pool, {
    firmId: opts.firmId,
    contactId: opts.contactId,
    enrollmentId: enr.rows[0]?.id ?? null,
    campaignId: enr.rows[0]?.campaign_id ?? null,
  });
  const origin = (opts.origin ?? process.env.PUBLIC_APP_URL ?? process.env.APP_ORIGIN ?? "http://localhost:5173")
    .trim()
    .replace(/\/$/, "");
  return `${origin}${minted.path}`;
}
