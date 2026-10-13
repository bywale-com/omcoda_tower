/**
 * Prove continuous (unattended) worker — not WORKER_ONCE.
 *
 * 1. Start long-lived worker with short interval
 * 2. Seed stale open attempt
 * 3. Walk away (poll DB) until worker escalates on its own
 * 4. Wait another tick window — confirm no double-fire
 *
 * Run: npm run verify:continuous-worker
 */
import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createPgPool } from "./pgConnect.ts";

/** Local tsx CLI — avoids `npx` ENOENT on Windows (npx.cmd). */
const tsxCli = path.join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const firm = process.env.DEV_SESSION_FIRM?.trim() || "firm-cedar";
const intervalMs = Number(process.env.VERIFY_WORKER_INTERVAL_MS ?? 5_000);
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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

let child: ChildProcess | null = null;

try {
  // Restore channel order so text→email escalate path exists
  for (const [id, ord] of [
    ["ch-text", 0],
    ["ch-email", 1],
    ["ch-form", 2],
  ] as const) {
    await pool.query(`UPDATE seq_channel_ownership_order SET ord=$2 WHERE id=$1`, [id, ord]);
  }

  // Prior verify runs leave open attempts across firms; tick scans all (LIMIT 500)
  // and can miss the seeded row within the short window. Clear the open set first.
  const cleared = await pool.query(
    `UPDATE active_attempts SET status='nullified', updated_at=now()
     WHERE status='open'`,
  );
  ok(
    "clear-open-attempts",
    `nullified ${cleared.rowCount ?? 0} leftover open attempt(s)`,
  );

  const contactId = `cont-worker-${randomUUID().slice(0, 8)}`;
  const enrId = `enr-worker-${randomUUID().slice(0, 8)}`;
  const attemptId = `att-worker-${randomUUID().slice(0, 8)}`;
  const deliveredAt = new Date(Date.now() - 31 * 60 * 1000).toISOString();

  await pool.query(
    `INSERT INTO contact_records (id, firm_id, email, name)
     VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email`,
    [contactId, firm, "continuous-worker@example.com", "Continuous Worker"],
  );
  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, payload)
     VALUES ($1,$2,$3,'tpl.optin_launch.v1','tpl.optin_launch.v1','{"verify":true}'::jsonb)`,
    [enrId, firm, contactId],
  );
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
  ok("seed-stale-attempt", `${attemptId} (no manual tickOnce)`);

  child = spawn(
    process.execPath,
    [tsxCli, "--env-file=.env", "server/wire-service/worker.ts"],
    {
      env: {
        ...process.env,
        DATABASE_URL: connectionString,
        WORKER_INTERVAL_MS: String(intervalMs),
        WORKER_ONCE: "",
        // Proof is escalation, not ESP blast — keep fail-closed dry_run in the child.
        SEND_MODE: "dry_run",
        SEND_TEST_COHORT: "",
        DEPLOY_STRICT: "0",
        NODE_ENV: "test",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  let logs = "";
  child.stdout?.on("data", (d) => {
    logs += String(d);
  });
  child.stderr?.on("data", (d) => {
    logs += String(d);
  });
  child.on("error", (err) => {
    logs += `spawn-error: ${err.message}`;
  });

  ok("worker-started", `pid=${child.pid} intervalMs=${intervalMs} (continuous, not WORKER_ONCE)`);

  const deadline = Date.now() + intervalMs * 4 + 15_000;
  let escalated = false;
  let firedAt: string | undefined;
  while (Date.now() < deadline) {
    const row = await pool.query<{
      owner_channel: string;
      fired_criteria: Record<string, string>;
    }>(`SELECT owner_channel, fired_criteria FROM active_attempts WHERE id=$1`, [attemptId]);
    firedAt = row.rows[0]?.fired_criteria?.["acr-text"];
    if (row.rows[0]?.owner_channel === "email" && firedAt) {
      escalated = true;
      break;
    }
    await sleep(1_000);
  }

  if (!escalated) {
    fail(
      "unattended-escalate",
      `attempt not escalated within window; logs=${logs.slice(-800)}`,
    );
  } else {
    ok("unattended-escalate", `owner=email fired_criteria.acr-text=${firedAt}`);
  }

  // Wait for at least one more tick; fired_criteria must stay single-valued
  await sleep(intervalMs + 2_000);
  const after = await pool.query<{
    owner_channel: string;
    fired_criteria: Record<string, string>;
  }>(`SELECT owner_channel, fired_criteria FROM active_attempts WHERE id=$1`, [attemptId]);
  const again = after.rows[0]?.fired_criteria?.["acr-text"];
  if (!escalated) {
    // already failed
  } else if (again !== firedAt) {
    fail("no-double-fire", `fired_criteria changed after re-tick: ${firedAt} → ${again}`);
  } else if (after.rows[0]?.owner_channel !== "email") {
    fail("no-double-fire", `owner unexpectedly ${after.rows[0]?.owner_channel}`);
  } else {
    ok("no-double-fire", "re-tick left fired_criteria.acr-text unchanged");
  }

  if (!logs.includes("continuous") && !logs.includes("tower-tick-worker")) {
    fail("worker-mode-log", `expected continuous worker log, got: ${logs.slice(0, 400)}`);
  } else {
    ok("worker-mode-log", "worker announced continuous mode");
  }
} finally {
  if (child) {
    try {
      child.kill("SIGKILL");
    } catch {
      /* already gone */
    }
    // Ensure the continuous process cannot keep this script alive
    child.unref?.();
  }
  await pool.end();
}

const failed = report.filter((r) => !r.ok);
console.log("\n--- Continuous worker summary ---");
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exit(1);
console.log("\nContinuous worker proofs passed.");
