/**
 * Live wake gate. Prints `authorized` or a refusal reason.
 * Ledger-only commits after the dispatch SHA stay authorized.
 * This script does not add a label and does not write the ledger.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { headMatchesDispatch } from "../.factory/controller/wake.ts";
import { workerMayRun, type DispatchRecord } from "../.factory/controller/machine.ts";
import type { FactoryLedger } from "../.factory/controller/dispatch.ts";

const label = process.argv[2] ?? "";
const allowed = new Set([
  "factory-wake-architect",
  "factory-wake-sa",
  "factory-wake-engineer",
  "factory-repair",
]);

function refuse(reason: string): never {
  console.error(reason);
  process.exit(1);
}

if (!allowed.has(label)) refuse("label_mismatch");

const ledger = JSON.parse(readFileSync(".factory/state/ledger.json", "utf8")) as FactoryLedger;
if (ledger.scope.status !== "active") refuse(ledger.scope.status === "suspended" ? "suspended" : ledger.scope.status === "complete" ? "scope_complete" : "scope_inactive");
if (ledger.authorizedDispatches == null || ledger.authorizedDispatches <= 0) refuse("dispatch_not_authorized");

let dispatch: DispatchRecord | null = null;
let wake: "hold" | "sa" = "hold";
if (label === "factory-wake-architect") {
  const initiative = Object.values(ledger.initiatives).find((item) => item.dispatch?.label === label);
  dispatch = initiative?.dispatch ?? null;
  if (initiative && dispatch && initiative.revision !== dispatch.revision) refuse("revision_mismatch");
  if (initiative && dispatch && initiative.id !== dispatch.packetId) refuse("packet_mismatch");
} else {
  const packet = Object.values(ledger.packets).find((item) => item.dispatch?.label === label);
  dispatch = packet?.dispatch ?? null;
  wake = packet?.wake ?? "hold";
}

if (!dispatch) refuse("no_dispatch_record");
const identity = workerMayRun({
  label: label as "factory-wake-architect",
  packetId: dispatch.packetId,
  revision: dispatch.revision,
  prHead: dispatch.prHead,
  wake,
  dispatch,
});
if (!identity.ok) refuse(identity.reason);

function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

const head = git(["rev-parse", "HEAD"]);
let isAncestor = head === dispatch.prHead;
let changedPaths: string[] = [];
if (head !== dispatch.prHead) {
  try {
    git(["merge-base", "--is-ancestor", dispatch.prHead, head]);
    isAncestor = true;
    changedPaths = git(["diff", "--name-only", dispatch.prHead, head]).split("\n").filter(Boolean);
  } catch {
    isAncestor = false;
  }
}

const matched = headMatchesDispatch({
  dispatchPrHead: dispatch.prHead,
  head,
  isAncestor,
  changedPaths,
});
if (!matched.ok) refuse(matched.reason);
console.log(matched.reason);
