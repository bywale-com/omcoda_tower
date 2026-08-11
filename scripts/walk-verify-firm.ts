/**
 * Postgres checks for a provisioned firm during the computer-use walk.
 * Usage: npx tsx --env-file=.env scripts/walk-verify-firm.ts <firmId> [marker]
 */
import { readFileSync } from "node:fs";
import { createPgPool } from "./pgConnect.ts";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);
const firmId = process.argv[2];
const marker = process.argv[3] ?? "";
if (!firmId) {
  console.error("Usage: walk-verify-firm.ts <firmId> [marker]");
  process.exit(1);
}
const pool = createPgPool(env.DATABASE_URL || process.env.DATABASE_URL!);
const contacts = await pool.query(
  `SELECT id, name, email, firm_id FROM contact_records WHERE firm_id=$1 ORDER BY updated_at DESC NULLS LAST LIMIT 20`,
  [firmId],
);
const bind = await pool.query(
  `SELECT template_id, sequence_class FROM firm_sequence_binding WHERE firm_id=$1`,
  [firmId],
);
const camp = await pool.query(`SELECT state FROM campaign_states WHERE firm_id=$1`, [firmId]);
const enr = await pool.query(
  `SELECT id, contact_id, agent_ref FROM enrollment WHERE firm_id=$1 ORDER BY enrolled_at DESC LIMIT 10`,
  [firmId],
);
const attempts = await pool.query(
  `SELECT id, contact_id, state FROM active_attempts WHERE firm_id=$1 ORDER BY created_at DESC NULLS LAST LIMIT 10`,
  [firmId],
);
const meetings = await pool.query(
  `SELECT id, contact_id, booked_at, source FROM meeting_booked WHERE firm_id=$1 ORDER BY booked_at DESC LIMIT 10`,
  [firmId],
);
const cedarLeak = await pool.query(
  `SELECT count(*)::int AS n FROM contact_records WHERE firm_id=$1 AND id IN (
     SELECT id FROM contact_records WHERE firm_id='firm-cedar'
   )`,
  [firmId],
);
let tplCells: unknown = null;
if (bind.rows[0]?.template_id) {
  const t = await pool.query(`SELECT id, label, cells FROM sequence_template WHERE id=$1`, [
    bind.rows[0].template_id,
  ]);
  tplCells = t.rows[0] ?? null;
}
const out = {
  firmId,
  marker,
  contacts: contacts.rows,
  contactCount: contacts.rowCount,
  binding: bind.rows,
  campaign: camp.rows[0]?.state ?? null,
  enrollments: enr.rows,
  attempts: attempts.rows.map((a) => ({
    id: a.id,
    contact_id: a.contact_id,
    state: a.state,
  })),
  meetings: meetings.rows,
  meetingCount: meetings.rowCount,
  template: tplCells,
  cedarIdCollision: cedarLeak.rows[0]?.n ?? 0,
};
console.log(JSON.stringify(out, null, 2));
await pool.end();
