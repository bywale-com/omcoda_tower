import { createPgPool } from "./pgConnect.ts";

const pool = createPgPool(process.env.DATABASE_URL as string);
try {
  const firms = await pool.query(
    `SELECT id, name, created_at FROM firms
     WHERE lower(name) LIKE '%apex%'
     ORDER BY created_at DESC LIMIT 10`,
  );
  console.log("firms", firms.rows);
  const ct = await pool.query(
    `SELECT id, name, posture, updated_at FROM ct_firms
     WHERE lower(name) LIKE '%apex%'
     ORDER BY updated_at DESC NULLS LAST LIMIT 10`,
  );
  console.log("ct_firms", ct.rows);
  const users = await pool.query(
    `SELECT u.id, u.email, u.firm_id, f.name AS firm_name
     FROM users u
     LEFT JOIN firms f ON f.id = u.firm_id
     WHERE lower(f.name) LIKE '%apex%' OR lower(u.email) LIKE '%apex%'
     ORDER BY u.created_at DESC LIMIT 20`,
  );
  console.log("users", users.rows);
  for (const f of firms.rows) {
    const contacts = await pool.query(
      `SELECT count(*)::int AS n FROM contact_records WHERE firm_id = $1`,
      [f.id],
    );
    const meetings = await pool.query(
      `SELECT count(*)::int AS n FROM meeting_booked WHERE firm_id = $1`,
      [f.id],
    );
    const eng = await pool.query(
      `SELECT count(*)::int AS n FROM engagement_records WHERE firm_id = $1`,
      [f.id],
    );
    console.log("counts", {
      firmId: f.id,
      name: f.name,
      contacts: contacts.rows[0]?.n,
      meetings: meetings.rows[0]?.n,
      engagement: eng.rows[0]?.n,
    });
  }
} finally {
  await pool.end();
}
