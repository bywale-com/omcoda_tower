/**
 * Analyst lease, signature, interruption, and blocker.
 *
 * The specification file is not the signature. `sign` sends `sign_change`
 * for the packet this worker's live lease holds. `interrupt` returns that
 * packet to `released` so a later wake can continue. This process does not
 * add a label and does not spend a dispatch.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { GitHubContentsStore, githubContentsRemote } from "../.factory/controller/contents.ts";
import { commitEvent, type FactoryLedger } from "../.factory/controller/dispatch.ts";
import { sectionsFromSpecification } from "../.factory/controller/specification.ts";

const command = process.argv[2] ?? "";
const commands = new Set(["lease", "sign", "interrupt", "block", "saturate", "requirements-blocked"]);

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

function assignmentPackets(current: FactoryLedger) {
  const matches = Object.values(current.packets)
    .filter((packet) => packet.dispatch?.label === "factory-wake-sa")
    .sort((a, b) => a.id.localeCompare(b.id));
  if (!matches.length) {
    const leased = Object.values(current.packets).find(
      (packet) => packet.lease?.workerId === workerId && packet.lease.role === "analyst",
    );
    return leased ? [leased] : [];
  }
  const executionIds = new Set(matches.map((packet) => packet.dispatch?.executionId ?? packet.id));
  if (executionIds.size > 1) fail("ambiguous_dispatch");
  return matches;
}

const packets = assignmentPackets(ledger);
const requested = flag("--packet");
const packet = requested ? packets.find((item) => item.id === requested) ?? null : packets.length === 1 ? packets[0] : null;
if (!packet) fail(packets.length > 1 ? "packet_required" : "no_dispatch_record");

let event;
if (command === "lease") {
  event = {
    type: "acquire_lease" as const,
    workerId,
    role: "analyst" as const,
    until: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    revision: packet.revision,
  };
} else if (command === "sign") {
  const path = `docs/factory/initiatives/${packet.initiativeId}/systems/SCP-${packet.id}.md`;
  let markdown = "";
  try {
    markdown = readFileSync(path, "utf8");
  } catch {
    fail("sections_incomplete");
  }
  event = {
    type: "sign_change" as const,
    revision: packet.revision,
    sections: sectionsFromSpecification(markdown),
    workerId,
  };
} else if (command === "interrupt") {
  event = { type: "interrupt_analysis" as const, workerId };
} else if (command === "saturate") {
  event = { type: "saturate_context" as const, workerId };
} else if (command === "requirements-blocked") {
  const note = flag("--note");
  if (!note.trim()) fail("note_missing");
  event = { type: "requirements_blocked" as const, workerId, note };
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
if (command === "sign" && executionId) {
  const again = await store.read();
  const execution = again.executions?.[executionId];
  const remaining = (execution?.packetIds ?? [])
    .map((id) => again.packets[id])
    .filter((item) => item && (item.stage === "released" || item.stage === "analysis"))
    .sort((a, b) => a.id.localeCompare(b.id));
  if (remaining.length) {
    console.log(`continue ${remaining[0].id}`);
    process.exit(0);
  }
}
console.log(wrote.reason);
