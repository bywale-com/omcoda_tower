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

const command = process.argv[2] ?? "";
const commands = new Set(["start", "lease", "candidate", "refuse", "block", "saturate", "specification-blocked"]);

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
const branch = process.env.FACTORY_LEDGER_BRANCH?.trim() || git(["rev-parse", "--abbrev-ref", "HEAD"]);
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

function assignmentPackets(current: FactoryLedger) {
  const matches = Object.values(current.packets)
    .filter((packet) => packet.dispatch?.label === label)
    .sort((a, b) => a.id.localeCompare(b.id));
  if (!matches.length) {
    const leased = Object.values(current.packets).find(
      (packet) => packet.lease?.workerId === workerId && packet.lease.role === "engineer",
    );
    return leased ? [leased] : [];
  }
  const executionIds = new Set(matches.map((packet) => packet.dispatch?.executionId ?? packet.id));
  if (executionIds.size > 1) fail("ambiguous_dispatch");
  return matches;
}

const packets = assignmentPackets(ledger);
const requested = flag("--packet");
const packet = requested
  ? packets.find((item) => item.id === requested) ?? null
  : packets.find((item) => !item.candidateSha) ?? packets[0] ?? null;
if (!packet) fail("no_dispatch_record");

let event;
if (command === "start") {
  event = { type: "acknowledge_start" as const, workerId, executionId: packet.dispatch?.executionId };
} else if (command === "refuse") {
  event = { type: "refuse_execution" as const, workerId, executionId: packet.dispatch?.executionId };
} else if (command === "lease") {
  event = {
    type: "acquire_lease" as const,
    workerId,
    role: "engineer" as const,
    until: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    revision: packet.revision,
  };
} else if (command === "candidate") {
  const sha = flag("--sha");
  if (!/^[0-9a-f]{7,64}$/i.test(sha)) fail("sha_mismatch");
  event = { type: "commit_candidate" as const, sha, revision: packet.revision, workerId };
} else if (command === "saturate") {
  event = { type: "saturate_context" as const, workerId };
} else if (command === "specification-blocked") {
  const note = flag("--note");
  if (!note.trim()) fail("note_missing");
  event = { type: "specification_blocked" as const, workerId, note };
} else {
  const blockerId = flag("--blocker");
  const failureClass = flag("--class");
  if (!blockerId) fail("blocker_missing");
  if (failureClass !== "infrastructure" && failureClass !== "external") fail("failure_class");
  event = { type: "blocker" as const, blockerId, failureClass };
}

const executionId = packet.dispatch?.executionId;
const wrote = await commitEvent(store, packet.id, event, world);
if (!wrote.ok) fail(wrote.reason);
if (command === "candidate" && executionId) {
  const again = await store.read();
  const execution = again.executions?.[executionId];
  const remaining = (execution?.packetIds ?? [])
    .map((id) => again.packets[id])
    .filter((item) => item && !item.candidateSha)
    .sort((a, b) => a.id.localeCompare(b.id));
  if (remaining.length) {
    console.log(`continue ${remaining[0].id}`);
    process.exit(0);
  }
}
console.log(wrote.reason);
