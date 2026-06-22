import dns from "node:dns";
import pg from "pg";

// Supabase hostnames often resolve to IPv6 first; Windows frequently blocks that path.
dns.setDefaultResultOrder("ipv4first");

const { Pool } = pg;

export function createPgPool(connectionString: string): pg.Pool {
  return new Pool({
    connectionString,
    ssl: connectionString.includes("supabase")
      ? { rejectUnauthorized: false }
      : undefined,
  });
}
