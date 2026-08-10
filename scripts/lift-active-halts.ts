import { createPgPool } from "./pgConnect.ts";

const pool = createPgPool(process.env.DATABASE_URL as string);
const r = await pool.query(
  `UPDATE halt_records SET lifted_at=now()
   WHERE firm_id='firm-cedar' AND lifted_at IS NULL
   RETURNING id, scope`,
);
console.log("lifted", r.rows);
await pool.end();
