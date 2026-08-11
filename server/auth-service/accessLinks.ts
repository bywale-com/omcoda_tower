/**
 * Direct access links — mint + redeem into the same sessions cookie as OTP.
 */
import type { Pool, PoolClient } from "pg";
import {
  ACCESS_LINK_TTL_MS,
  generateSessionToken,
  sha256,
} from "./crypto.ts";

export type AccessLinkMint = {
  rawToken: string;
  accessPath: string;
  expiresAt: Date;
};

export function accessPathForToken(rawToken: string): string {
  return `/a/${encodeURIComponent(rawToken)}`;
}

export async function invalidateActiveAccessLinks(
  client: Pool | PoolClient,
  userId: string,
): Promise<void> {
  await client.query(
    `UPDATE access_links
     SET invalidated_at = now()
     WHERE user_id = $1::uuid
       AND consumed_at IS NULL
       AND invalidated_at IS NULL`,
    [userId],
  );
}

/** Mint a one-time access link for a provisioned user. Returns raw token once. */
export async function mintAccessLink(
  client: Pool | PoolClient,
  user: { id: string; firm_id: string; email: string },
  ttlMs: number = ACCESS_LINK_TTL_MS,
): Promise<AccessLinkMint> {
  const rawToken = generateSessionToken();
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + ttlMs);

  await invalidateActiveAccessLinks(client, user.id);
  await client.query(
    `INSERT INTO access_links (user_id, firm_id, email, token_hash, expires_at)
     VALUES ($1::uuid, $2::uuid, $3, $4, $5)`,
    [user.id, user.firm_id, user.email, tokenHash, expiresAt.toISOString()],
  );

  return {
    rawToken,
    accessPath: accessPathForToken(rawToken),
    expiresAt,
  };
}
