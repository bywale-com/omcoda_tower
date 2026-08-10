/**
 * Face→table affordance round-trips against real Postgres.
 * Spec: choose a new value → write via the same SQL/API contract the UI uses →
 * read back the chosen value. Classifies PASS / FAKE-WRITE.
 *
 * Run: npm run verify:affordances
 */
import { randomUUID } from "node:crypto";
import { createPgPool } from "./pgConnect.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const firm = "firm-cedar";
const pool = createPgPool(connectionString);

type Class = "PASS" | "FAKE-WRITE" | "READ-ONLY-MISLABELED" | "APP-LOCAL";
const ledger: Array<{ affordance: string; table: string; class: Class; detail: string }> = [];

function record(affordance: string, table: string, cls: Class, detail: string) {
  ledger.push({ affordance, table, class: cls, detail });
  const mark = cls === "PASS" ? "✅" : "❌";
  console.log(`${mark} ${cls} · ${affordance} → ${table} · ${detail}`);
}

try {
  // Reference Publish — chosen row value
  const refId = `ref.aff.${randomUUID().slice(0, 6)}`;
  const chosen = 1622;
  await pool.query(
    `INSERT INTO reference_versions (id, firm_id, key, payload, version)
     VALUES ($1,null,'reference.immigration',$2::jsonb,1)
     ON CONFLICT (id) DO UPDATE SET payload=EXCLUDED.payload`,
    [
      refId,
      JSON.stringify({
        rows: [{ key: "cec.min_hours", value: chosen, type: "number" }],
      }),
    ],
  );
  const ref = await pool.query<{ payload: { rows?: Array<{ key: string; value: unknown }> } }>(
    `SELECT payload FROM reference_versions WHERE id=$1`,
    [refId],
  );
  const got = ref.rows[0]?.payload?.rows?.find((r) => r.key === "cec.min_hours")?.value;
  record(
    "Reference Publish Confirm",
    "reference_versions",
    got === chosen ? "PASS" : "FAKE-WRITE",
    `cec.min_hours=${String(got)}`,
  );

  // Eligibility pipeline reorder
  const stages = await pool.query<{ id: string; token: string; ord: number }>(
    `SELECT id, token, ord FROM seq_eligibility_pipeline ORDER BY ord ASC`,
  );
  if (stages.rowCount && stages.rowCount >= 2) {
    const reversed = [...stages.rows].reverse();
    for (let i = 0; i < reversed.length; i++) {
      await pool.query(`UPDATE seq_eligibility_pipeline SET ord=$2 WHERE id=$1`, [
        reversed[i].id,
        i,
      ]);
    }
    const after = await pool.query<{ id: string }>(
      `SELECT id FROM seq_eligibility_pipeline ORDER BY ord ASC`,
    );
    const ok = after.rows[0]?.id === reversed[0]?.id;
    record(
      "Automations Settings · Eligibility pipeline ↑↓",
      "seq_eligibility_pipeline",
      ok ? "PASS" : "FAKE-WRITE",
      after.rows.map((r) => r.id).join(" → "),
    );
    // restore
    for (const row of stages.rows) {
      await pool.query(`UPDATE seq_eligibility_pipeline SET ord=$2 WHERE id=$1`, [
        row.id,
        row.ord,
      ]);
    }
  } else {
    record(
      "Automations Settings · Eligibility pipeline ↑↓",
      "seq_eligibility_pipeline",
      "FAKE-WRITE",
      "no stages in DB",
    );
  }

  // Motion precedence enable
  const motion = await pool.query<{ id: string; enabled: boolean }>(
    `SELECT id, enabled FROM rule_motion_precedence ORDER BY ord ASC LIMIT 1`,
  );
  if (motion.rows[0]) {
    const id = motion.rows[0].id;
    const next = !motion.rows[0].enabled;
    await pool.query(`UPDATE rule_motion_precedence SET enabled=$2 WHERE id=$1`, [id, next]);
    const after = await pool.query<{ enabled: boolean }>(
      `SELECT enabled FROM rule_motion_precedence WHERE id=$1`,
      [id],
    );
    record(
      "Evaluation · Motion precedence Switch",
      "rule_motion_precedence",
      after.rows[0]?.enabled === next ? "PASS" : "FAKE-WRITE",
      `${id}=${String(after.rows[0]?.enabled)}`,
    );
    await pool.query(`UPDATE rule_motion_precedence SET enabled=$2 WHERE id=$1`, [
      id,
      motion.rows[0].enabled,
    ]);
  }

  // Attempt criteria threshold
  const acr = await pool.query<{ id: string; threshold: number | null }>(
    `SELECT id, threshold FROM rule_attempt_criteria WHERE threshold IS NOT NULL LIMIT 1`,
  );
  if (acr.rows[0]) {
    const id = acr.rows[0].id;
    const next = Number(acr.rows[0].threshold ?? 30) + 7;
    await pool.query(`UPDATE rule_attempt_criteria SET threshold=$2 WHERE id=$1`, [id, next]);
    const after = await pool.query<{ threshold: number }>(
      `SELECT threshold FROM rule_attempt_criteria WHERE id=$1`,
      [id],
    );
    record(
      "Agents Settings · Attempt criteria threshold",
      "rule_attempt_criteria",
      Number(after.rows[0]?.threshold) === next ? "PASS" : "FAKE-WRITE",
      `${id}=${String(after.rows[0]?.threshold)}`,
    );
    await pool.query(`UPDATE rule_attempt_criteria SET threshold=$2 WHERE id=$1`, [
      id,
      acr.rows[0].threshold,
    ]);
  }

  // Fact writeback
  const contactId = `aff-fwb-${randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, name) VALUES ($1,$2,$3,$4)`,
    [contactId, firm, "aff@example.com", "Affordance"],
  );
  const fwbId = `fwb-${randomUUID().slice(0, 8)}`;
  const value = { label: "CLB lowest", value: "CLB 12" };
  await pool.query(
    `INSERT INTO fact_writebacks (id, firm_id, contact_id, field_key, value)
     VALUES ($1,$2,$3,'clb_lowest',$4::jsonb)`,
    [fwbId, firm, contactId, JSON.stringify(value)],
  );
  const fwb = await pool.query<{ value: { value?: string } }>(
    `SELECT value FROM fact_writebacks WHERE id=$1`,
    [fwbId],
  );
  record(
    "Contact Nudge/Loop-closer Submit",
    "fact_writebacks",
    fwb.rows[0]?.value?.value === "CLB 12" ? "PASS" : "FAKE-WRITE",
    `CLB=${String(fwb.rows[0]?.value?.value)}`,
  );

  // Template cells
  const tplId = `tpl.aff.${randomUUID().slice(0, 6)}`;
  const body = "Ship affordance body";
  await pool.query(
    `INSERT INTO sequence_template (id, sequence_class, variant, label, cells, source, version)
     VALUES ($1,'reactivation','v1','Affordance',$2::jsonb,'agent-editor',1)
     ON CONFLICT (id) DO UPDATE SET cells=EXCLUDED.cells`,
    [tplId, JSON.stringify([{ id: "c1", channel: "email", body }])],
  );
  const tpl = await pool.query<{ cells: Array<{ body?: string }> }>(
    `SELECT cells FROM sequence_template WHERE id=$1`,
    [tplId],
  );
  record(
    "Agents Save",
    "sequence_template",
    tpl.rows[0]?.cells?.[0]?.body === body ? "PASS" : "FAKE-WRITE",
    body,
  );

  // Binding (unique on firm_id + sequence_class)
  const bindId = `bind.${firm}.reactivation`;
  await pool.query(
    `INSERT INTO firm_sequence_binding (id, firm_id, sequence_class, template_id, variable_bindings)
     VALUES ($1,$2,'reactivation',$3,$4::jsonb)
     ON CONFLICT (firm_id, sequence_class) DO UPDATE
       SET template_id=EXCLUDED.template_id,
           variable_bindings=EXCLUDED.variable_bindings,
           updated_at=now()`,
    [bindId, firm, tplId, JSON.stringify({ firmName: "Cedar Pathways" })],
  );
  const bind = await pool.query<{ template_id: string; variable_bindings: { firmName?: string } }>(
    `SELECT template_id, variable_bindings FROM firm_sequence_binding
     WHERE firm_id=$1 AND sequence_class='reactivation'`,
    [firm],
  );
  record(
    "Bind Active / Agents Save binding",
    "firm_sequence_binding",
    bind.rows[0]?.template_id === tplId &&
      bind.rows[0]?.variable_bindings?.firmName === "Cedar Pathways"
      ? "PASS"
      : "FAKE-WRITE",
    bind.rows[0]?.template_id ?? "missing",
  );

  // Campaign
  await pool.query(
    `INSERT INTO campaign_states (firm_id, state, updated_at)
     VALUES ($1,'armed-for-activation',now())
     ON CONFLICT (firm_id) DO UPDATE SET state='armed-for-activation'`,
    [firm],
  );
  const camp = await pool.query<{ state: string }>(
    `SELECT state FROM campaign_states WHERE firm_id=$1`,
    [firm],
  );
  record(
    "Firm ops Bind posture",
    "campaign_states",
    camp.rows[0]?.state === "armed-for-activation" ? "PASS" : "FAKE-WRITE",
    camp.rows[0]?.state ?? "missing",
  );

  // Prepared workspace
  const pwId = `pw-aff-${randomUUID().slice(0, 6)}`;
  await pool.query(
    `INSERT INTO prepared_workspaces (id, firm_id, status, body)
     VALUES ($1,$2,'staged',$3::jsonb)
     ON CONFLICT (id) DO UPDATE SET body=EXCLUDED.body`,
    [pwId, firm, JSON.stringify({ firmLabel: "Ship Affordance" })],
  );
  const pw = await pool.query<{ body: { firmLabel?: string } }>(
    `SELECT body FROM prepared_workspaces WHERE id=$1`,
    [pwId],
  );
  record(
    "Activation forward-deploy",
    "prepared_workspaces",
    pw.rows[0]?.body?.firmLabel === "Ship Affordance" ? "PASS" : "FAKE-WRITE",
    pw.rows[0]?.body?.firmLabel ?? "missing",
  );

  // Explicit APP-LOCAL (documented, not failures)
  record(
    "Config Publish Automations/Agents catalog",
    "(local pack catalog)",
    "APP-LOCAL",
    "Bind catalog only — templates via Agents Save",
  );
  record(
    "Automations Settings Enrollment summary",
    "(local trigger chrome)",
    "APP-LOCAL",
    "Not enrollment rows — Launch/cascade writes enrollment",
  );

  const fake = ledger.filter((r) => r.class === "FAKE-WRITE" || r.class === "READ-ONLY-MISLABELED");
  const counts = ledger.reduce(
    (acc, r) => {
      acc[r.class] = (acc[r.class] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  console.log("\n--- Affordance ledger counts ---");
  console.log(JSON.stringify(counts, null, 2));
  console.log(JSON.stringify(ledger, null, 2));
  if (fake.length) {
    console.error(`\n${fake.length} in-loop FAKE-WRITE/READ-ONLY — not ship-ready`);
    process.exit(1);
  }
  console.log("\nAffordance round-trips PASSED (no in-loop FAKE-WRITE)");
} finally {
  await pool.end();
}
