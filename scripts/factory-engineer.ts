/**
 * Engineer lease and candidate record.
 *
 * Planting the code is not the candidate. `candidate` sends `commit_candidate`
 * for the packet this worker's live lease holds. This process does not add a
 * label and does not spend a dispatch.
 */
import { execFileSync } from "node:child_process";
import { GitHubContentsStore, githubContentsRemote } from "../.factory/controller/contents.ts";
import { commitEvent, type FactoryLedger } from "../.factory/controller/dispatch.ts";
import { selectLabeledDispatch } from "../.factory/controller/wake.ts";

const command = process.argv[2] ?? "";
const commands = new Set(["lease", "candidate", "block"]);

function flag(name: string): string {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? "").trim() : "";
}

function fail(reason: string): never {
  console.error(reason);
  process.exit(1);
}

if (!commands.has(command)) fail("usage");

const workerId = flag("--worker");
if (!/^bc-[0-9a-f-]{8,}$/i.test(workerId)) fail("worker_id_missing");
const label = flag("--label") || "factory-wake-engineer";
if (label !== "factory-wake-engineer" && label !== "factory-repair") fail("label_mismatch");

if (process.env.GITHUB_ACTIONS && !process.env.WAKE_GITHUB_TOKEN) fail("actuator disarmed");

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
const now = new Date();
const world = {
  activation: "active" as const,
  now: now.toISOString(),
  engineeringBusy: false,
  budgetUsd: null,
  authorizedDispatches: ledger.authorizedDispatches,
  usedDispatches: ledger.usedDispatches,
  scopeStatus: ledger.scope.status,
};

function packetFor(current: FactoryLedger) {
  const selected = selectLabeledDispatch(Object.values(current.packets), label);
  if (!selected.ok && selected.reason === "ambiguous_dispatch") fail("ambiguous_dispatch");
  if (selected.ok) return selected.row;
  const leased = Object.values(current.packets).find(
    (packet) => packet.lease?.workerId === workerId && packet.lease.role === "engineer",
  );
  return leased ?? null;
}

const packet = packetFor(ledger);
if (!packet) fail("no_dispatch_record");

let event;
if (command === "lease") {
  event = {
    type: "acquire_lease" as const,
    workerId,
    role: "engineer" as const,
    until: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
    revision: packet.revision,
  };
} else if (command === "candidate") {
  const sha = flag("--sha");
  if (!/^[0-9a-f]{7,64}$/i.test(sha)) fail("sha_mismatch");
  event = { type: "commit_candidate" as const, sha, revision: packet.revision, workerId };
} else {
  const blockerId = flag("--blocker");
  const failureClass = flag("--class");
  if (!blockerId) fail("blocker_missing");
  if (failureClass !== "infrastructure" && failureClass !== "external") fail("failure_class");
  event = { type: "blocker" as const, blockerId, failureClass };
}

const wrote = await commitEvent(store, packet.id, event, world);
if (!wrote.ok) fail(wrote.reason);
console.log(wrote.reason);
