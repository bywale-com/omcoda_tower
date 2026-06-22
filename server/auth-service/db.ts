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
    pool = new Pool({ connectionString, ssl: connectionString.includes("supabase") ? { rejectUnauthorized: false } : undefined });
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
