/**
 * Prove Part A (tick worker auto-escalation) + Part B (gated live send).
 *
 * Env:
 *   DATABASE_URL (required)
 *   For live-send proof: SEND_MODE=live, SEND_TEST_COHORT=<contact>, TEST_EMAIL_TO
 *   VERIFY_LIVE_SEND=1 to actually send one Resend message (default on when SEND_MODE=live)
 */
import { randomUUID } from "node:crypto";
import { createPgPool } from "./pgConnect.ts";
import { tickOnce, enrollAndActuate, loadAttemptCriteria } from "../server/wire-service/cascade.ts";
import { getSendMode, getSendTestCohort, shouldLiveSend } from "../server/wire-service/sendMode.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const firm = "firm-cedar";
const pool = createPgPool(connectionString);
const report: Array<{ step: string; ok: boolean; detail: string }> = [];

function ok(step: string, detail: string) {
  report.push({ step, ok: true, detail });
  console.log(`✅ ${step}: ${detail}`);
}
function fail(step: string, detail: string) {
  report.push({ step, ok: false, detail });
  console.error(`❌ ${step}: ${detail}`);
}

try {
  // ── A1: thresholds come from DB (dumb-runtime) ───────────────────────────
  const criteria = await loadAttemptCriteria(pool as never, firm);
  const acrText = criteria.find((c) => c.id === "acr-text");
  if (!acrText || Number(acrText.threshold) !== 30 || acrText.threshold_unit !== "minutes") {
    fail(
      "criteria-from-table",
      `expected acr-text 30 minutes from rule_attempt_criteria, got ${JSON.stringify(acrText)}`,
    );
  } else {
    ok("criteria-from-table", `acr-text threshold=${acrText.threshold} ${acrText.threshold_unit}`);
  }

  // ── A2: seed stale open attempt (text delivered, not opened, 31 min ago) ─
  const contactId = `actuate-contact-${randomUUID().slice(0, 8)}`;
  const email = process.env.TEST_EMAIL_TO ?? "verify-actuation@example.com";
  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, name)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email`,
    [contactId, firm, email, "Actuation Verify"],
  );

  const enrId = `enr-actuate-${randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, payload)
     VALUES ($1,$2,$3,'tpl.optin_launch.v1','tpl.optin_launch.v1',$4::jsonb)`,
    [enrId, firm, contactId, JSON.stringify({ verify: true, dryRun: true })],
  );

  const deliveredAt = new Date(Date.now() - 31 * 60 * 1000).toISOString();
  const attemptId = `att-actuate-${randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO active_attempts
       (id, firm_id, contact_id, enrollment_id, owner_channel, status, state,
        window_started_at, fired_criteria)
     VALUES ($1,$2,$3,$4,'text','open',$5::jsonb,$6::timestamptz,'{}'::jsonb)`,
    [
      attemptId,
      firm,
      contactId,
      enrId,
      JSON.stringify({ delivered: true, delivered_at: deliveredAt, opened: false }),
      deliveredAt,
    ],
  );
  ok("seed-stale-attempt", `${attemptId} text delivered @ ${deliveredAt}`);

  // ── A3: tick → escalate text→email, write run ────────────────────────────
  const tick1 = await tickOnce(new Date());
  const fire = tick1.fired.find((f) => f.attemptId === attemptId && f.criteriaId === "acr-text");
  if (!fire) {
    fail("auto-escalate", `no acr-text fire for ${attemptId}; fired=${JSON.stringify(tick1.fired)}`);
  } else if (fire.toChannel !== "email") {
    fail("auto-escalate", `expected toChannel=email, got ${fire.toChannel}`);
  } else {
    ok("auto-escalate", `text→email run=${fire.runId} engagement=${fire.engagementId}`);
  }

  const after = await pool.query<{ owner_channel: string; fired_criteria: Record<string, string> }>(
    `SELECT owner_channel, fired_criteria FROM active_attempts WHERE id=$1`,
    [attemptId],
  );
  const firedAt = after.rows[0]?.fired_criteria?.["acr-text"];
  if (after.rows[0]?.owner_channel !== "email" || !firedAt) {
    fail("attempt-state", JSON.stringify(after.rows[0]));
  } else {
    ok("attempt-state", `owner=email fired_criteria.acr-text=${firedAt}`);
  }

  // ── A4: re-tick must not double-fire ─────────────────────────────────────
  const tick2 = await tickOnce(new Date());
  const dup = tick2.fired.filter((f) => f.attemptId === attemptId && f.criteriaId === "acr-text");
  if (dup.length > 0) {
    fail("idempotent", `acr-text fired again on re-tick (${dup.length})`);
  } else {
    ok("idempotent", "re-tick did not double-fire acr-text");
  }

  // ── A5: inbound override nullifies before escalate ───────────────────────
  const contact2 = `actuate-inbound-${randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, name) VALUES ($1,$2,$3,$4)`,
    [contact2, firm, "inbound@example.com", "Inbound Override"],
  );
  const enr2 = `enr-inbound-${randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, payload)
     VALUES ($1,$2,$3,'tpl.optin_launch.v1','tpl.optin_launch.v1','{}'::jsonb)`,
    [enr2, firm, contact2],
  );
  const stale2 = new Date(Date.now() - 40 * 60 * 1000).toISOString();
  const att2 = `att-inbound-${randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO active_attempts
       (id, firm_id, contact_id, enrollment_id, owner_channel, status, state, window_started_at)
     VALUES ($1,$2,$3,$4,'text','open',$5::jsonb,$6::timestamptz)`,
    [
      att2,
      firm,
      contact2,
      enr2,
      JSON.stringify({ delivered: true, delivered_at: stale2 }),
      stale2,
    ],
  );
  await pool.query(
    `INSERT INTO engagement_records (id, firm_id, contact_id, event_kind, payload)
     VALUES ($1,$2,$3,'inbound_reply','{"verify":true}'::jsonb)`,
    [`eng-${randomUUID()}`, firm, contact2],
  );
  const tick3 = await tickOnce(new Date());
  const status2 = await pool.query<{ status: string }>(
    `SELECT status FROM active_attempts WHERE id=$1`,
    [att2],
  );
  const firedInbound = tick3.fired.some((f) => f.attemptId === att2);
  if (status2.rows[0]?.status === "nullified" && !firedInbound) {
    ok("inbound-override", `${att2} nullified; no escalate`);
  } else {
    fail(
      "inbound-override",
      `status=${status2.rows[0]?.status} fired=${firedInbound} nullified_count=${tick3.nullified}`,
    );
  }

  // ── B: gated live send ───────────────────────────────────────────────────
  const liveContact = `actuate-live-${randomUUID().slice(0, 8)}`;
  // Fail-closed when mode dry_run
  process.env.SEND_MODE = "dry_run";
  process.env.SEND_TEST_COHORT = liveContact;
  if (shouldLiveSend(liveContact)) {
    fail("fail-closed-dry-run", "shouldLiveSend true under dry_run");
  } else {
    ok("fail-closed-dry-run", "SEND_MODE=dry_run → no live");
  }

  // Empty cohort fail-closed even if live
  process.env.SEND_MODE = "live";
  process.env.SEND_TEST_COHORT = "";
  if (shouldLiveSend(liveContact)) {
    fail("fail-closed-empty-cohort", "empty cohort allowed live");
  } else {
    ok("fail-closed-empty-cohort", "live + empty cohort → dry-run");
  }

  // Live path for one allowlisted contact
  process.env.SEND_MODE = "live";
  process.env.SEND_TEST_COHORT = liveContact;
  if (!shouldLiveSend(liveContact) || shouldLiveSend("someone-else")) {
    fail("cohort-gate", `cohort broken mode=${getSendMode()} size=${getSendTestCohort().size}`);
  } else {
    ok("cohort-gate", `only ${liveContact} is live-eligible`);
  }

  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, phone, name)
     VALUES ($1,$2,$3,$4,$5)`,
    [
      liveContact,
      firm,
      process.env.TEST_EMAIL_TO ?? email,
      process.env.TEST_SMS_TO ?? null,
      "Live Cohort Contact",
    ],
  );
  // opt-in purpose skips consent; still set express for hygiene
  await pool.query(
    `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, status, updated_at)
     VALUES ($1,$2,'express',false,'unsequenced',now())
     ON CONFLICT (contact_id, firm_id) DO UPDATE SET basis='express', silenced=false`,
    [liveContact, firm],
  );

  const wantLive =
    process.env.VERIFY_LIVE_SEND !== "0" &&
    Boolean(process.env.TEST_EMAIL_TO) &&
    Boolean(process.env.RESEND_API_KEY);

  if (wantLive) {
    const actuated = await enrollAndActuate({
      firmId: firm,
      contactId: liveContact,
      agentRef: "tpl.optin_launch.v1",
      sequenceId: "tpl.optin_launch.v1",
      purpose: "opt-in",
      ownerChannel: "email",
      payload: { verifyLive: true },
      fireFirstStep: true,
    });
    if (actuated.dryRun) {
      fail("live-send", `expected live, got dryRun send=${JSON.stringify(actuated.send)}`);
    } else if (!actuated.send || !actuated.send.ok || actuated.send.dryRun) {
      fail("live-send", `send failed: ${JSON.stringify(actuated.send)}`);
    } else {
      const events = await pool.query(
        `SELECT id, message_id, event_class FROM messaging_events
         WHERE contact_id=$1 ORDER BY at DESC LIMIT 1`,
        [liveContact],
      );
      if (!events.rowCount) {
        fail("live-send-record", "no messaging_events row");
      } else {
        ok(
          "live-send",
          `Resend messageId=${actuated.send.messageId} messaging_events=${events.rows[0].id}`,
        );
      }
    }

    // Non-cohort contact stays dry-run even in live mode
    const other = `actuate-other-${randomUUID().slice(0, 8)}`;
    await pool.query(
      `INSERT INTO contact_records (id, firm_id, email, name) VALUES ($1,$2,$3,$4)`,
      [other, firm, "other@example.com", "Other"],
    );
    const otherEnroll = await enrollAndActuate({
      firmId: firm,
      contactId: other,
      agentRef: "tpl.optin_launch.v1",
      purpose: "opt-in",
      ownerChannel: "email",
      fireFirstStep: true,
    });
    if (otherEnroll.dryRun && otherEnroll.send && "dryRun" in otherEnroll.send && otherEnroll.send.dryRun) {
      ok("non-cohort-dry-run", `${other} stayed dry-run under SEND_MODE=live`);
    } else {
      fail("non-cohort-dry-run", JSON.stringify(otherEnroll));
    }
  } else {
    ok("live-send", "skipped (set TEST_EMAIL_TO + RESEND_API_KEY; VERIFY_LIVE_SEND≠0)");
  }

  const failed = report.filter((r) => !r.ok);
  console.log("\n--- Actuation summary ---");
  console.log(JSON.stringify(report, null, 2));
  if (failed.length) process.exit(1);
  console.log("\nPart A + Part B proofs passed.");
} finally {
  await pool.end();
}
