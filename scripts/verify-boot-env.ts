/**
 * Prove fail-closed send/env defaults (no process blast on misconfig).
 *
 * - unset/empty SEND_MODE → dry_run
 * - empty SEND_TEST_COHORT → nobody live
 * - SEND_MODE=live without RESEND_API_KEY → assertBootEnv exits
 * - missing DATABASE_URL → assertBootEnv exits
 *
 * Run: npm run verify:boot-env
 */
import { spawnSync } from "node:child_process";
import { shouldLiveSend, getSendMode } from "../server/wire-service/sendMode.ts";

const report: Array<{ step: string; ok: boolean; detail: string }> = [];
function ok(step: string, detail: string) {
  report.push({ step, ok: true, detail });
  console.log(`✅ ${step}: ${detail}`);
}
function fail(step: string, detail: string) {
  report.push({ step, ok: false, detail });
  console.error(`❌ ${step}: ${detail}`);
}

const prevMode = process.env.SEND_MODE;
const prevCohort = process.env.SEND_TEST_COHORT;

delete process.env.SEND_MODE;
if (getSendMode() !== "dry_run" || shouldLiveSend("anyone")) {
  fail("unset-send-mode", `mode=${getSendMode()}`);
} else {
  ok("unset-send-mode", "missing SEND_MODE → dry_run; no live");
}

process.env.SEND_MODE = "";
if (getSendMode() !== "dry_run") {
  fail("empty-send-mode", `mode=${getSendMode()}`);
} else {
  ok("empty-send-mode", "empty SEND_MODE → dry_run");
}

process.env.SEND_MODE = "live";
process.env.SEND_TEST_COHORT = "";
if (shouldLiveSend("c1")) {
  fail("empty-cohort", "live+empty cohort allowed send");
} else {
  ok("empty-cohort", "live + empty SEND_TEST_COHORT → nobody live");
}

process.env.SEND_TEST_COHORT = "c1";
if (!shouldLiveSend("c1") || shouldLiveSend("c2")) {
  fail("cohort-allowlist", "allowlist broken");
} else {
  ok("cohort-allowlist", "only listed contact is live-eligible");
}

// Restore for subprocess tests
if (prevMode === undefined) delete process.env.SEND_MODE;
else process.env.SEND_MODE = prevMode;
if (prevCohort === undefined) delete process.env.SEND_TEST_COHORT;
else process.env.SEND_TEST_COHORT = prevCohort;

function bootProbe(env: Record<string, string | undefined>): {
  status: number | null;
  stderr: string;
  stdout: string;
} {
  const merged: NodeJS.ProcessEnv = { ...process.env, ...env };
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete merged[k];
  }
  const r = spawnSync(
    "npx",
    [
      "tsx",
      "-e",
      `import { assertBootEnv } from "./server/wire-service/bootEnv.ts"; assertBootEnv("api"); console.log("BOOT_OK");`,
    ],
    { env: merged, encoding: "utf8", cwd: process.cwd() },
  );
  return {
    status: r.status,
    stderr: (r.stderr || "") + (r.stdout || ""),
    stdout: r.stdout || "",
  };
}

const noDb = bootProbe({ DATABASE_URL: undefined, SEND_MODE: "dry_run", DEPLOY_STRICT: "0", NODE_ENV: "test" });
if (noDb.status === 0 || !noDb.stderr.includes("DATABASE_URL")) {
  fail("boot-no-db", `expected exit≠0 mentioning DATABASE_URL, got ${noDb.status} ${noDb.stderr.slice(0, 200)}`);
} else {
  ok("boot-no-db", "missing DATABASE_URL → boot refuse");
}

const liveNoKey = bootProbe({
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://u:p@localhost:5432/db",
  SEND_MODE: "live",
  RESEND_API_KEY: undefined,
  DEPLOY_STRICT: "0",
  NODE_ENV: "test",
});
if (liveNoKey.status === 0 || !/RESEND_API_KEY/.test(liveNoKey.stderr)) {
  fail(
    "boot-live-no-key",
    `expected exit≠0 mentioning RESEND_API_KEY, got ${liveNoKey.status} ${liveNoKey.stderr.slice(0, 300)}`,
  );
} else {
  ok("boot-live-no-key", "SEND_MODE=live without RESEND_API_KEY → boot refuse");
}

const dryOk = bootProbe({
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://u:p@localhost:5432/db",
  SEND_MODE: "dry_run",
  RESEND_API_KEY: undefined,
  DEPLOY_STRICT: "0",
  NODE_ENV: "test",
});
if (dryOk.status !== 0 || !dryOk.stdout.includes("BOOT_OK")) {
  fail("boot-dry-ok", `expected BOOT_OK, got ${dryOk.status} ${dryOk.stderr.slice(0, 300)}`);
} else {
  ok("boot-dry-ok", "dry_run without ESP keys boots (does not blast)");
}

const failed = report.filter((r) => !r.ok);
console.log("\n--- Boot env summary ---");
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exit(1);
console.log("\nBoot env proofs passed.");
