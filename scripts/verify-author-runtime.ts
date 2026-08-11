/**
 * Prove Fix 1 (authored cells run) + Fix 2 (meeting_booked closes chase).
 * Run: npx tsx --env-file=.env scripts/verify-author-runtime.ts
 */
import { randomUUID } from "node:crypto";
import { createPgPool } from "./pgConnect.ts";
import { enrollAndActuate, tickOnce } from "../server/wire-service/cascade.ts";

const pool = createPgPool(process.env.DATABASE_URL as string);
const report: Array<{ step: string; ok: boolean; detail: string }> = [];

function ok(s: string, d: string) {
  report.push({ step: s, ok: true, detail: d });
  console.log(`✅ ${s}: ${d}`);
}
function fail(s: string, d: string) {
  report.push({ step: s, ok: false, detail: d });
  console.error(`❌ ${s}: ${d}`);
}

try {
  // Ensure meeting_booked exists
  await pool.query(`SELECT to_regclass('public.meeting_booked')`);

  const firm = "firm-cedar";
  const marker = `AUTH-RUNTIME-${randomUUID().slice(0, 8)}`;
  const tplId = `tpl.author-runtime.${marker}`;
  const contactId = `c-author-${randomUUID().slice(0, 8)}`;

  // Distinctive authored sequence — cell 0 immediate text, cell 1 email after 0 minutes (offsetMinutes)
  const cells = [
    {
      id: `${marker}-c0`,
      token: "day0_text_primer",
      label: `${marker} Cell0 Text`,
      channel: "text",
      day: 0,
      offsetMinutes: 0,
      subject: `${marker} SUBJECT CELL0`,
      bodyText: `${marker} BODY CELL0`,
    },
    {
      id: `${marker}-c1`,
      token: "day0_email",
      label: `${marker} Cell1 Email`,
      channel: "email",
      day: 0,
      offsetMinutes: 0,
      subject: `${marker} SUBJECT CELL1`,
      bodyText: `${marker} BODY CELL1`,
    },
  ];

  await pool.query(
    `INSERT INTO sequence_template (id, sequence_class, variant, label, cells)
     VALUES ($1,'optin_launch','v1',$2,$3::jsonb)
     ON CONFLICT (id) DO UPDATE SET cells=EXCLUDED.cells, label=EXCLUDED.label`,
    [tplId, `Author runtime ${marker}`, JSON.stringify(cells)],
  );
  await pool.query(
    `INSERT INTO firm_sequence_binding (id, firm_id, sequence_class, template_id, variable_bindings)
     VALUES ($1,$2,'optin_launch',$3,'{}'::jsonb)
     ON CONFLICT (firm_id, sequence_class) DO UPDATE SET template_id=EXCLUDED.template_id`,
    [`bind.${firm}.optin_launch`, firm, tplId],
  );
  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, phone, name)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email`,
    [
      contactId,
      firm,
      process.env.TEST_EMAIL_TO ?? "author-runtime@example.com",
      process.env.TEST_SMS_TO ?? "+15550001111",
      "Author Runtime",
    ],
  );
  await pool.query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, status, updated_at)
     VALUES ($1,$2,'express',false,'unsequenced',now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE SET silenced=false`,
    [contactId, firm],
  );

  process.env.SEND_MODE = "dry_run";

  const enrolled = await enrollAndActuate({
    firmId: firm,
    contactId,
    agentRef: tplId,
    fireFirstStep: true,
  });

  if (enrolled.cellId !== cells[0].id) {
    fail("enroll-cell0", JSON.stringify(enrolled));
  } else {
    ok("enroll-cell0", `cellId=${enrolled.cellId} templateId=${enrolled.templateId}`);
  }

  const att0 = await pool.query(
    `SELECT state, owner_channel FROM active_attempts WHERE id=$1`,
    [enrolled.attemptId],
  );
  const st0 = att0.rows[0]?.state ?? {};
  if (st0.cellIndex !== 0 || st0.templateId !== tplId) {
    fail("state-cursor", JSON.stringify(st0));
  } else ok("state-cursor", `cellIndex=0 template=${st0.templateId}`);

  // Backdate enrolledAt so cell1 (offsetMinutes:0) is due — also force past by setting enrolledAt in past
  await pool.query(
    `UPDATE active_attempts
     SET state = state || jsonb_build_object('enrolledAt', $2::text)
     WHERE id=$1`,
    [enrolled.attemptId, new Date(Date.now() - 60_000).toISOString()],
  );

  const tick = await tickOnce(new Date());
  const cellFire = tick.fired.find((f) => String(f.criteriaId).startsWith("cell:"));
  if (!cellFire || cellFire.criteriaId !== `cell:${cells[1].id}`) {
    fail("cell-advance", JSON.stringify(tick.fired));
  } else {
    ok("cell-advance", `advanced to ${cellFire.criteriaId} subject path used authored cell`);
  }

  const eng = await pool.query(
    `SELECT event_kind, payload FROM engagement_records
     WHERE contact_id=$1 AND event_kind='cell_advanced' ORDER BY created_at DESC LIMIT 1`,
    [contactId],
  );
  if (!eng.rowCount || eng.rows[0].payload?.cellId !== cells[1].id) {
    fail("cell-engagement", JSON.stringify(eng.rows[0]));
  } else ok("cell-engagement", `cellId=${eng.rows[0].payload.cellId}`);

  // Fix 2 — meeting_booked
  const mtgId = `mtg-${randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO meeting_booked (id, firm_id, contact_id, source, slot, consultant_name, enrollment_id, payload)
     VALUES ($1,$2,$3,'verify','Tomorrow 10:00','Agent',$4,'{}'::jsonb)`,
    [mtgId, firm, contactId, enrolled.enrollmentId],
  );
  await pool.query(
    `UPDATE active_attempts SET status='nullified',
       state = state || jsonb_build_object('meeting_booked', true, 'meeting_id', $2::text)
     WHERE firm_id=$3 AND contact_id=$1 AND status='open'`,
    [contactId, mtgId, firm],
  );

  const openLeft = await pool.query(
    `SELECT count(*)::int AS n FROM active_attempts
     WHERE firm_id=$1 AND contact_id=$2 AND status='open'`,
    [firm, contactId],
  );
  if (openLeft.rows[0].n !== 0) fail("chase-stopped", `open=${openLeft.rows[0].n}`);
  else ok("chase-stopped", "no open attempts after meeting_booked");

  const count = await pool.query(
    `SELECT count(*)::int AS n FROM meeting_booked WHERE firm_id=$1 AND contact_id=$2`,
    [firm, contactId],
  );
  if (count.rows[0].n < 1) fail("meeting-countable", "0 rows");
  else ok("meeting-countable", `n=${count.rows[0].n} id=${mtgId}`);

  console.log("\n--- AUTHOR-RUNTIME VERIFY ---");
  for (const r of report) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.step}: ${r.detail}`);
  process.exit(report.some((r) => !r.ok) ? 1 : 0);
} finally {
  await pool.end();
}
