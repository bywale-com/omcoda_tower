/**
 * Continuous tick worker — long-lived process for the deploy target.
 *
 *   npm run worker                 # continuous (default; ≤1 min interval)
 *   WORKER_ONCE=1 npm run worker   # single tick (CI / smoke only)
 *
 * Prod packaging: docker compose `worker` service, or systemd unit under deploy/.
 * Do not set WORKER_ONCE in production.
 */
import { assertBootEnv } from "./bootEnv.ts";
import { tickOnce } from "./cascade.ts";

assertBootEnv("worker");

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

if (once) {
  await runTick();
  process.exit(0);
}

console.log(
  JSON.stringify({
    service: "tower-tick-worker",
    mode: "continuous",
    intervalMs,
    note: "Unattended escalation; SEND_MODE missing → dry_run",
  }),
);
await runTick();
setInterval(() => {
  void runTick();
}, intervalMs);
