/**
 * Plans exact-SHA verification for candidate packets.
 *
 * --plan prints a JSON array of { sha, proofs } to start. It also records a
 * finished successful job whose packet is still `candidate`.
 * --record writes the current workflow run against VERIFY_SHA.
 * Without a flag, this process prints the candidate SHAs in the local ledger
 * and does not call GitHub.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { GitHubContentsStore, githubContentsRemote } from "../.factory/controller/contents.ts";
import { commitEvent } from "../.factory/controller/dispatch.ts";
import type { FactoryLedger } from "../.factory/controller/dispatch.ts";
import {
  planVerifications,
  proofScript,
  checkName,
  type ObservedJob,
  type ShaCandidate,
} from "../.factory/controller/verify.ts";

const plan = process.argv.includes("--plan");
const record = process.argv.includes("--record");

function fail(reason: string): never {
  console.error(reason);
  process.exit(1);
}

function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function gh(args: string[]): string {
  const repo = process.env.FACTORY_REPOSITORY || process.env.GITHUB_REPOSITORY || "";
  const full = repo ? [...args, "--repo", repo] : args;
  return execFileSync("gh", full, { encoding: "utf8" }).trim();
}

function candidatesFrom(ledger: FactoryLedger): ShaCandidate[] {
  return Object.values(ledger.packets)
    .filter((packet) => (packet.stage === "candidate" || packet.stage === "verifying") && packet.candidateSha)
    .map((packet) => ({ packetId: packet.id, sha: packet.candidateSha as string }));
}

function remoteStore(): GitHubContentsStore {
  const remote = git(["remote", "get-url", "origin"]);
  const slug = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
  if (!slug) fail("ledger_branch_unset");
  const branch = process.env.FACTORY_LEDGER_BRANCH?.trim() || "";
  if (!branch) fail("ledger_branch_unset");
  return new GitHubContentsStore(
    githubContentsRemote({
      owner: slug[1],
      repo: slug[2],
      path: ".factory/state/ledger.json",
      branch,
      env: process.env,
      credential: process.env.WAKE_GITHUB_TOKEN ? "wake" : "ambient",
    }),
  );
}

function worldFrom(ledger: FactoryLedger) {
  return {
    activation: "active" as const,
    now: new Date().toISOString(),
    engineeringBusy: false,
    budgetUsd: null,
    authorizedDispatches: ledger.authorizedDispatches,
    usedDispatches: ledger.usedDispatches,
    scopeStatus: ledger.scope.status,
  };
}

async function recordSha(store: GitHubContentsStore, sha: string, runId: string): Promise<void> {
  const ledger = await store.read();
  const packets = Object.values(ledger.packets).filter(
    (packet) => packet.candidateSha === sha && (packet.stage === "candidate" || packet.stage === "verifying"),
  );
  if (!packets.length) {
    console.error("nothing_to_record");
    return;
  }
  for (const packet of packets) {
    const script = proofScript(packet.id);
    if (!script) fail("proof_missing");
    const wrote = await commitEvent(
      store,
      packet.id,
      { type: "record_candidate_checks", sha, checks: [{ name: checkName(script), runId, outcome: "pass" }] },
      worldFrom(ledger),
    );
    if (wrote.ok) {
      console.error(`verified ${packet.id} ${sha}`);
      continue;
    }
    if (wrote.reason === "wrong_stage") {
      const again = await store.read();
      const current = again.packets[packet.id];
      if (current?.stage === "verified" && current.verifiedSha === sha) {
        console.error(`already_verified ${packet.id}`);
        continue;
      }
    }
    fail(wrote.reason);
  }
}

function observedJobs(): ObservedJob[] {
  const listed = JSON.parse(
    gh(["run", "list", "--workflow", "factory-verify.yml", "--limit", "20", "--json", "databaseId,status"]),
  ) as Array<{ databaseId: number; status: string }>;
  const jobs: ObservedJob[] = [];
  for (const run of listed) {
    const detail = JSON.parse(gh(["run", "view", String(run.databaseId), "--json", "jobs"])) as {
      jobs: Array<{ name: string; status: string; conclusion: string | null }>;
    };
    for (const job of detail.jobs) {
      jobs.push({
        name: job.name,
        status: job.status,
        conclusion: job.conclusion,
        runId: String(run.databaseId),
      });
    }
  }
  return jobs;
}

if (record) {
  const sha = (process.env.VERIFY_SHA ?? "").trim();
  const runId = (process.env.VERIFY_RUN ?? "").trim();
  if (!/^[0-9a-f]{40}$/.test(sha) || !runId) fail("usage");
  if (!process.env.WAKE_GITHUB_TOKEN) fail("verify_token_missing");
  await recordSha(remoteStore(), sha, runId);
  process.exit(0);
}

if (!plan) {
  const ledger = JSON.parse(readFileSync(".factory/state/ledger.json", "utf8")) as FactoryLedger;
  const shas = [...new Set(candidatesFrom(ledger).map((candidate) => candidate.sha))].sort();
  console.log(JSON.stringify(shas));
  process.exit(0);
}

if (process.env.FACTORY_CONTROLLER !== "active") {
  console.error("verify_inactive");
  console.log("[]");
  process.exit(0);
}

const store = remoteStore();
const ledger = await store.read();
if (ledger.scope.status !== "active") {
  console.error(ledger.scope.status);
  console.log("[]");
  process.exit(0);
}

const decision = planVerifications(candidatesFrom(ledger), observedJobs());
const recorded = new Set<string>();
for (const item of decision.record) {
  if (recorded.has(item.sha)) continue;
  recorded.add(item.sha);
  await recordSha(store, item.sha, item.runId);
}
console.log(JSON.stringify(decision.start));
