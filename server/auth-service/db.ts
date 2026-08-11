import dns from "node:dns";
import pg from "pg";
import { logError } from "./logger.ts";

dns.setDefaultResultOrder("ipv4first");

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required");
    }
    // Session pooler caps clients (~15). Vercel/serverless must stay tiny or OTP/send
    // dies with EMAXCONNSESSION and the login UI never advances.
    const max = Number(process.env.PG_POOL_MAX ?? "1");
    pool = new Pool({
      connectionString,
      max: Number.isFinite(max) && max > 0 ? max : 1,
      idleTimeoutMillis: 5_000,
      connectionTimeoutMillis: 10_000,
      ssl: connectionString.includes("supabase")
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }
  return pool;
}

export async function withTransaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    logError("auth.db.error", error, { phase: "transaction" });
    throw error;
  } finally {
    client.release();
  }
}

export type UserRow = {
  id: string;
  firm_id: string;
  email: string;
};

export async function resolveUserByEmail(
  client: pg.Pool | pg.PoolClient,
  email: string,
): Promise<UserRow | null> {
  const result = await client.query<UserRow>(
    `SELECT u.id, u.firm_id, u.email
     FROM users u
     INNER JOIN firms f ON f.id = u.firm_id
     WHERE lower(u.email) = lower($1)
     LIMIT 1`,
    [email],
  );
  return result.rows[0] ?? null;
}
