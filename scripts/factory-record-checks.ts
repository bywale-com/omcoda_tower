/**
 * Records check evidence for the packet's candidate SHA.
 * A failing outcome is refused and the stage stays. This process does not
 * invent a run id and does not add a label.
 */
import { execFileSync } from "node:child_process";
import { GitHubContentsStore, githubContentsRemote } from "../.factory/controller/contents.ts";
import { commitEvent } from "../.factory/controller/dispatch.ts";

function flag(name: string): string {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? "").trim() : "";
}

function fail(reason: string): never {
  console.error(reason);
  process.exit(1);
}

const packetId = flag("--packet");
const sha = flag("--sha");
const checks: Array<{ name: string; runId: string; outcome: "pass" }> = [];
for (let i = 0; i < process.argv.length; i += 1) {
  if (process.argv[i] !== "--check") continue;
  const raw = (process.argv[i + 1] ?? "").trim();
  const split = raw.indexOf("=");
  const name = split >= 0 ? raw.slice(0, split).trim() : "";
  const runId = split >= 0 ? raw.slice(split + 1).trim() : "";
  if (!name || !runId) fail("verification_evidence_missing");
  checks.push({ name, runId, outcome: "pass" });
}
if (!packetId || !/^[0-9a-f]{7,64}$/i.test(sha) || !checks.length) fail("usage");

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

const ledger = await store.read();
const wrote = await commitEvent(
  store,
  packetId,
  { type: "record_candidate_checks", sha, checks },
  {
    activation: "active",
    now: new Date().toISOString(),
    engineeringBusy: false,
    budgetUsd: null,
    authorizedDispatches: ledger.authorizedDispatches,
    usedDispatches: ledger.usedDispatches,
    scopeStatus: ledger.scope.status,
  },
);
if (!wrote.ok) fail(wrote.reason);
console.log(wrote.reason);
