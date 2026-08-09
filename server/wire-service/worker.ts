/**
 * Scheduled tick worker — advances attempt windows from seeded rule_attempt_criteria.
 *
 *   npm run worker
 *
 * Interval: WORKER_INTERVAL_MS (default 60000). Single tick: WORKER_ONCE=1.
 */
import { tickOnce } from "./cascade.ts";

const intervalMs = Number(process.env.WORKER_INTERVAL_MS ?? 60_000);
const once = process.env.WORKER_ONCE === "1" || process.argv.includes("--once");

async function runTick() {
  const started = new Date();
  try {
    const result = await tickOnce(started);
    console.log(
      JSON.stringify({
        at: started.toISOString(),
        scanned: result.scanned,
        fired: result.fired.length,
        nullified: result.nullified,
        details: result.fired.map((f) => ({
          attemptId: f.attemptId,
          criteriaId: f.criteriaId,
          from: f.fromChannel,
          to: f.toChannel,
          runId: f.runId,
          dryRun: f.send && "dryRun" in f.send ? f.send.dryRun : undefined,
        })),
      }),
    );
  } catch (err) {
    console.error("worker.tick.failed", err);
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required for the tick worker");
  process.exit(1);
}

if (once) {
  await runTick();
  process.exit(0);
}

console.log(
  JSON.stringify({
    service: "tower-tick-worker",
    intervalMs,
    note: "Reads thresholds from rule_attempt_criteria; SEND_MODE defaults dry_run",
  }),
);
await runTick();
setInterval(() => {
  void runTick();
}, intervalMs);
