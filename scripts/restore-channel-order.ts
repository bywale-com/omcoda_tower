import { createPgPool } from "./pgConnect.ts";

const pool = createPgPool(process.env.DATABASE_URL!);
const order: Array<[string, number]> = [
  ["ch-text", 0],
  ["ch-email", 1],
  ["ch-form", 2],
];
for (const [id, ord] of order) {
  await pool.query(`UPDATE seq_channel_ownership_order SET ord=$2 WHERE id=$1`, [id, ord]);
}
const rows = await pool.query(
  `SELECT id, token, ord FROM seq_channel_ownership_order ORDER BY ord ASC`,
);
console.log(rows.rows);
await pool.end();
