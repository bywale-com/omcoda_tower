import { randomUUID } from "node:crypto";
import { createPgPool } from "./pgConnect.ts";

const pool = createPgPool(process.env.DATABASE_URL as string);
const firm = "86551b71-80f7-4143-80c0-ffb3cb07ab69";
const contact = "c-live-proof-6565";
const cron = (process.env.CRON_SECRET ?? "").trim();
const BASE = "https://omcoda-tower.vercel.app";

const all = await pool.query(
  `SELECT id, firm_id, when_clause, condition_clause, set_value, threshold, threshold_unit, enabled, ord
   FROM rule_attempt_criteria ORDER BY ord`,
);
console.log(
  "all criteria",
  all.rows.map((r) => ({
    id: r.id,
    firm_id: r.firm_id,
    when: r.when_clause,
    thr: r.threshold,
    set: r.set_value,
  })),
);

// Ensure global (firm_id NULL) text escalation rule exists — product default
await pool.query(
  `INSERT INTO rule_attempt_criteria
     (id, firm_id, label, enabled, when_clause, condition_clause, set_value, threshold, threshold_unit, ord)
   VALUES
     ('acr-text', NULL, 'Text non-open escalate', true,
      'channel=text AND delivered', 'not opened', 'escalate_forward', 30, 'minutes', 10)
   ON CONFLICT (id) DO UPDATE SET
     firm_id = NULL,
     enabled = true,
     when_clause = EXCLUDED.when_clause,
     condition_clause = EXCLUDED.condition_clause,
     set_value = EXCLUDED.set_value,
     threshold = EXCLUDED.threshold,
     threshold_unit = EXCLUDED.threshold_unit`,
);

// Fresh stale attempt
const enrId = `enr-esc-${randomUUID().slice(0, 8)}`;
await pool.query(
  `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, payload)
   VALUES ($1,$2,$3,'tpl.optin_launch.v1','tpl.optin_launch.v1','{}'::jsonb)`,
  [enrId, firm, contact],
);
const deliveredAt = new Date(Date.now() - 31 * 60 * 1000).toISOString();
const attemptId = `att-esc-${randomUUID().slice(0, 8)}`;
await pool.query(
  `INSERT INTO active_attempts
     (id, firm_id, contact_id, enrollment_id, owner_channel, status, state,
      window_started_at, fired_criteria)
   VALUES ($1,$2,$3,$4,'text','open',$5::jsonb,$6::timestamptz,'{}'::jsonb)`,
  [
    attemptId,
    firm,
    contact,
    enrId,
    JSON.stringify({ delivered: true, delivered_at: deliveredAt, opened: false }),
    deliveredAt,
  ],
);
console.log("seeded", attemptId);

const tick = await fetch(`${BASE}/api/wire/machine/tick`, {
  headers: {
    Authorization: `Bearer ${cron}`,
    "x-cron-secret": cron,
  },
});
const tickBody = await tick.json();
console.log("tick", tick.status, JSON.stringify(tickBody));

const att = await pool.query(
  `SELECT id, owner_channel, fired_criteria, status FROM active_attempts WHERE id=$1`,
  [attemptId],
);
console.log("attempt after", att.rows[0]);

const win = await pool.query(
  `SELECT id, event_kind, payload FROM engagement_records
   WHERE firm_id=$1 AND contact_id=$2 AND event_kind='window_fired'
   ORDER BY created_at DESC LIMIT 3`,
  [firm, contact],
);
console.log("window_fired", win.rows);

if (!Object.keys(att.rows[0]?.fired_criteria ?? {}).length) {
  process.exit(1);
}
console.log("ESCALATION PASS");
await pool.end();
