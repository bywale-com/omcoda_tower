/**
 * Returns a suspended scope to active without changing the dispatch cap
 * or the spend already recorded.
 *
 * Without --apply this process prints the event and exits.
 * --apply uses the ambient gh login, or WAKE_GITHUB_TOKEN when that is set.
 * It does not add a label. The next control pass proposes wakes.
 */
import { execFileSync } from "node:child_process";
import { GitHubContentsStore, githubContentsRemote } from "../.factory/controller/contents.ts";
import { commitLedgerEvent } from "../.factory/controller/queue.ts";

const reason = (process.env.RESUME_REASON ?? "").trim();
const lanes = (process.env.RESUME_LANES ?? "")
  .split(",")
  .map((lane) => lane.trim())
  .filter((lane) => lane === "engineer" || lane === "analyst" || lane === "architect");
const apply = process.argv.includes("--apply");

if (!apply) {
  console.log(JSON.stringify({ type: "resume_scope", reason }));
  process.exit(0);
}

if (!reason) {
  console.error("resume_reason_missing");
  process.exit(1);
}

function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

const remote = git(["remote", "get-url", "origin"]);
const slug = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
if (!slug) {
  console.error("ledger_branch_unset");
  process.exit(1);
}
const branch = process.env.FACTORY_LEDGER_BRANCH?.trim() || git(["rev-parse", "--abbrev-ref", "HEAD"]);
if (!branch || branch === "HEAD") {
  console.error("ledger_branch_unset");
  process.exit(1);
}

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

const current = await store.read();
const result = await commitLedgerEvent(
  store,
  {
    type: "resume_scope",
    reason,
    authorizedDispatches: current.authorizedDispatches,
    ...(lanes.length ? { lanes } : {}),
  },
  {
    activation: "active",
    now: new Date().toISOString(),
    engineeringBusy: false,
    budgetUsd: null,
    authorizedDispatches: current.authorizedDispatches,
    usedDispatches: current.usedDispatches,
    scopeStatus: current.scope.status,
  },
);
if (!result.ok) {
  console.error(result.reason);
  process.exit(1);
}
console.log(result.reason);
