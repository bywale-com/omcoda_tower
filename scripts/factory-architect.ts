/**
 * Architect checkpoint and yield.
 *
 * A checkpoint keeps this execution. It does not spend a dispatch and it does
 * not ask for a new agent. `yield` ends the execution and records the agent id
 * so a later pass can resume it when Cursor follow-up is available.
 * `release-gate` only prints whether another packet may be released.
 */
import { execFileSync } from "node:child_process";
import { GitHubContentsStore, githubContentsRemote } from "../.factory/controller/contents.ts";
import { productionPressure } from "../.factory/controller/execution.ts";
import { commitLedgerEvent } from "../.factory/controller/queue.ts";

const command = process.argv[2] ?? "";
const commands = new Set(["checkpoint", "yield", "release-gate"]);

function flag(name: string): string {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? "").trim() : "";
}

function fail(reason: string): never {
  console.error(reason);
  process.exit(1);
}

if (!commands.has(command)) fail("usage");

function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

const remote = git(["remote", "get-url", "origin"]);
const slug = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
if (!slug) fail("ledger_branch_unset");
const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
if (!branch || branch === "HEAD") fail("ledger_branch_unset");

const store = new GitHubContentsStore(
  githubContentsRemote({
    owner: slug[1],
    repo: slug[2],
    path: ".factory/state/ledger.json",
    branch,
    env: process.env,
    credential: "ambient",
  }),
);

const ledger = await store.read();
if (command === "release-gate") {
  if (ledger.scope.status !== "active") {
    console.log(ledger.scope.status === "suspended" ? "suspended" : ledger.scope.status);
    process.exit(0);
  }
  const pressure = productionPressure(Object.values(ledger.packets));
  console.log(pressure.holdRelease ? "hold_release" : "release_clear");
  process.exit(0);
}

if (process.env.GITHUB_ACTIONS && !process.env.WAKE_GITHUB_TOKEN) fail("actuator disarmed");
const workerId = flag("--worker");
if (!/^bc-[0-9a-f-]{8,}$/i.test(workerId)) fail("worker_id_missing");
const initiativeId = flag("--initiative") || "exec-identity";
const world = {
  activation: "active" as const,
  now: new Date().toISOString(),
  engineeringBusy: false,
  budgetUsd: null,
  authorizedDispatches: ledger.authorizedDispatches,
  usedDispatches: ledger.usedDispatches,
  scopeStatus: ledger.scope.status,
};
const wrote = await commitLedgerEvent(
  store,
  {
    type: "architect_session",
    initiativeId,
    outcome: command === "checkpoint" ? "checkpoint" : "continue",
    agentId: workerId,
    contextSaturated: flag("--context") === "saturated",
  },
  world,
);
if (!wrote.ok) fail(wrote.reason);
console.log(wrote.reason);
