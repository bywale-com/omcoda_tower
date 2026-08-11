import { createPgPool } from "./pgConnect.ts";

const pool = createPgPool(process.env.DATABASE_URL as string);
try {
  const r = await pool.query(`SELECT to_regclass('public.access_links') AS t`);
  console.log("table", r.rows[0]);
  const c = await pool.query(`SELECT count(*)::int AS n FROM access_links`);
  console.log("rows", c.rows[0]);
} finally {
  await pool.end();
}
