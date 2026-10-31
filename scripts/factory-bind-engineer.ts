/**
 * Binds an already-running engineer to one change_specified packet.
 *
 * The label actuator is not called. Adding factory-wake-engineer would start
 * a second Cursor automation. This spend still counts against the cap.
 * When the scope is suspended, this process resumes it on the engineer lane
 * in the same compare-and-swap as the bind.
 */
import { execFileSync } from "node:child_process";
import { GitHubContentsStore, githubContentsRemote } from "../.factory/controller/contents.ts";
import { prepareBoundEngineer } from "../.factory/controller/execution.ts";
import { applyLedgerEvent } from "../.factory/controller/queue.ts";

function flag(name: string): string {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? "").trim() : "";
}

function fail(reason: string): never {
  console.error(reason);
  process.exit(1);
}

const packetId = flag("--packet");
const workerId = flag("--worker");
const prHead = flag("--pr-head");
const reason = (process.env.RESUME_REASON ?? "Engineer lane for a worker that is already running.").trim();
if (!packetId || !workerId || !prHead || !reason) fail("usage");

function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

const remote = git(["remote", "get-url", "origin"]);
const slug = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
if (!slug) fail("ledger_branch_unset");
const branch = process.env.FACTORY_LEDGER_BRANCH?.trim() || git(["rev-parse", "--abbrev-ref", "HEAD"]);
if (!branch || branch === "HEAD") fail("ledger_branch_unset");

const store = new GitHubContentsStore(
  githubContentsRemote({
    owner: slug[1],
    repo: slug[2],
    path: ".factory/state/ledger.json",
    branch,
    env: process.env,
    credential: process.env.WAKE_GITHUB_TOKEN ? "wake" : "ambient",
  }),
);

const wrote = await store.transact(async (ledger) => {
  const now = new Date().toISOString();
  const world = {
    activation: "active" as const,
    now,
    engineeringBusy: false,
    budgetUsd: null,
    authorizedDispatches: ledger.authorizedDispatches,
    usedDispatches: ledger.usedDispatches,
    scopeStatus: ledger.scope.status,
  };
  let next = ledger;
  if (next.scope.status === "suspended") {
    const resumed = applyLedgerEvent(
      next,
      { type: "resume_scope", reason, authorizedDispatches: next.authorizedDispatches ?? 0, lanes: ["engineer"] },
      world,
    );
    if (!resumed.ok) return { write: null, result: { ok: false as const, reason: resumed.reason } };
    next = resumed.ledger;
  }
  const bound = prepareBoundEngineer(next, { packetId, workerId, prHead, now });
  if (!bound.ok) return { write: null, result: bound };
  return {
    write: { ...bound.ledger, stateRevision: ledger.stateRevision + 1 },
    result: { ok: true as const, reason: "bound" as const },
  };
});

if (!wrote.ok) fail(wrote.reason);
console.log(wrote.reason);
