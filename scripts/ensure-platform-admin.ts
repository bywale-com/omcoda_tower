/**
 * Ensure sole platform admin admin@try-tower.com exists (Tower House firm).
 * Run: npx tsx --env-file=.env scripts/ensure-platform-admin.ts
 */
import { createPgPool } from "./pgConnect.ts";

const ADMIN_EMAIL = "admin@try-tower.com";
const HOUSE_FIRM_ID = "a0000000-0000-4000-8000-0000000000ad";
const HOUSE_NAME = "Tower House";

const pool = createPgPool(process.env.DATABASE_URL as string);
try {
  await pool.query(
    `INSERT INTO firms (id, name) VALUES ($1::uuid, $2)
     ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name`,
    [HOUSE_FIRM_ID, HOUSE_NAME],
  );
  await pool.query(
    `INSERT INTO ct_firms (id, name, posture, updated_at)
     VALUES ($1, $2, 'Idle', now())
     ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, updated_at=now()`,
    [HOUSE_FIRM_ID, HOUSE_NAME],
  );
  const existing = await pool.query<{ id: string }>(
    `SELECT id FROM users WHERE lower(email)=lower($1)`,
    [ADMIN_EMAIL],
  );
  if (existing.rowCount) {
    await pool.query(`UPDATE users SET firm_id=$1::uuid WHERE id=$2`, [
      HOUSE_FIRM_ID,
      existing.rows[0].id,
    ]);
    console.log(`Updated admin user → ${HOUSE_FIRM_ID}`);
  } else {
    await pool.query(`INSERT INTO users (firm_id, email) VALUES ($1::uuid, $2)`, [
      HOUSE_FIRM_ID,
      ADMIN_EMAIL,
    ]);
    console.log(`Created admin user ${ADMIN_EMAIL} → ${HOUSE_FIRM_ID}`);
  }
  console.log(JSON.stringify({ ok: true, email: ADMIN_EMAIL, firmId: HOUSE_FIRM_ID, firmName: HOUSE_NAME }));
} finally {
  await pool.end();
}
