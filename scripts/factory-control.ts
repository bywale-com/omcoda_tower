/**
 * One controller pass.
 *
 * With no arming flags this process prints the proposal and exits.
 * It does not add a label and it does not spend a dispatch.
 * `--apply` reaches the label actuator only when every disarm gate is set
 * and the ledger scope is active. Those gates are unset in this repository.
 */
import { existsSync, readFileSync } from "node:fs";
import { githubContentsRemote, GitHubContentsStore } from "../.factory/controller/contents.ts";
import { githubLabelActuator, redeliverDispatch, type FactoryLedger } from "../.factory/controller/dispatch.ts";
import { cursorFollowUp, type FetchLike } from "../.factory/controller/cursor.ts";
import { commitLedgerEvent, controlStep, dispatchInitiative } from "../.factory/controller/queue.ts";
import { dispatchWake } from "../.factory/controller/dispatch.ts";
import { analystFileCountsAsThisDispatch, recoverExecutions } from "../.factory/controller/execution.ts";
import type { StateStore } from "../.factory/controller/dispatch.ts";
import type { World } from "../.factory/controller/machine.ts";

function armed(): boolean {
  return (
    process.env.FACTORY_CONTROLLER === "active" &&
    process.env.FACTORY_LABELS === "armed" &&
    Boolean(process.env.WAKE_GITHUB_TOKEN) &&
    process.env.FACTORY_SPEND_LIMIT_CONFIRMED === "yes" &&
    process.env.FACTORY_AUTOMATIONS_SAVED === "yes"
  );
}

function worldFrom(ledger: FactoryLedger) {
  return {
    activation: process.env.FACTORY_CONTROLLER === "active" ? ("active" as const) : ("inactive" as const),
    now: new Date().toISOString(),
    engineeringBusy: false,
    budgetUsd: null,
    authorizedDispatches: ledger.authorizedDispatches,
    usedDispatches: ledger.usedDispatches,
    scopeStatus: ledger.scope.status,
    resumeSupported: Boolean(process.env.CURSOR_API_KEY),
  };
}

const fetchImpl: FetchLike = async (url, init) => {
  const response = await fetch(url, init);
  return { status: response.status, body: await response.text() };
};

function resumeAgent(agentId: string, text: string): Promise<{ ok: boolean; reason: string }> {
  return cursorFollowUp({ env: process.env, fetchImpl }).send(agentId, text);
}

const apply = process.argv.includes("--apply");
if (apply && !armed()) {
  console.error("actuator disarmed");
  process.exit(1);
}

if (!apply) {
  const ledger = JSON.parse(readFileSync(".factory/state/ledger.json", "utf8")) as FactoryLedger;
  const step = controlStep(ledger, worldFrom(ledger));
  console.log(JSON.stringify({
    reason: step.reason,
    wakes: step.wakes.map((wake) => ({ id: wake.id, effect: wake.decision.effect, reason: wake.decision.reason })),
    redelivery: step.redelivery ?? null,
  }));
  process.exit(0);
}

const pr = Number(process.env.FACTORY_PR);
const prHead = process.env.FACTORY_PR_HEAD?.trim() ?? "";
const repository = process.env.FACTORY_REPOSITORY ?? "";
const slash = repository.indexOf("/");
const branch = process.env.FACTORY_LEDGER_BRANCH?.trim() ?? "";
if (!Number.isInteger(pr) || pr <= 0 || !prHead || slash <= 0 || !branch) {
  console.error("actuator_pr_unset");
  process.exit(1);
}

const store = new GitHubContentsStore(
  githubContentsRemote({
    owner: repository.slice(0, slash),
    repo: repository.slice(slash + 1),
    path: ".factory/state/ledger.json",
    branch,
    env: process.env,
  }),
);
const loadedBefore = await store.read();
const stale = recoverExecutions(loadedBefore, new Date().toISOString());
if (stale.changes.length) {
  const wrote = await commitLedgerEvent(store, { type: "recover_stale" }, worldFrom(loadedBefore));
  if (!wrote.ok && wrote.reason !== "nothing_stale") {
    console.error(wrote.reason);
    process.exit(1);
  }
}
const loaded = await store.read();
const now = new Date().toISOString();
const ledger = await archiveRanAnalystWork(store, loaded, worldFrom(loaded));
const step = controlStep(ledger, { ...worldFrom(ledger), now });
if (step.redelivery) {
  const actuator = githubLabelActuator({ env: process.env, pr });
  const delivered = await redeliverDispatch({
    store,
    actuator,
    packetId: step.redelivery.packetId,
    now,
  });
  if (!delivered.ok) {
    console.error(delivered.reason);
    process.exit(1);
  }
  console.log(delivered.reason);
  process.exit(0);
}
const wake = step.wakes[0];
if (!wake) {
  console.log(step.reason);
  process.exit(0);
}
if (step.ledger !== ledger && step.ledger.initiatives !== ledger.initiatives) {
  const selected = Object.values(step.ledger.initiatives).find((item) => item.queue === "active" && item.session === "continuation_due" && !item.dispatch);
  if (selected && !ledger.initiatives[selected.id]?.dispatch && ledger.initiatives[selected.id]?.queue !== "active") {
    const { commitLedgerEvent } = await import("../.factory/controller/queue.ts");
    const wrote = await commitLedgerEvent(store, { type: "select_next" }, worldFrom(ledger));
    if (!wrote.ok && wrote.reason !== "initiative_active") {
      console.error(wrote.reason);
      process.exit(1);
    }
  }
}
const actuator = githubLabelActuator({ env: process.env, pr });
const resumeSupported = Boolean(process.env.CURSOR_API_KEY);
const result = wake.kind === "initiative"
  ? await dispatchInitiative({
      store,
      actuator,
      initiativeId: wake.id,
      prHead,
      activation: "active",
      now: new Date().toISOString(),
      engineeringBusy: false,
      budgetUsd: null,
      resumeSupported,
      resume: resumeSupported ? resumeAgent : undefined,
    })
  : await dispatchWake({
      store,
      actuator,
      packetId: wake.id,
      packetIds: wake.packetIds,
      basis: wake.basis,
      prHead,
      activation: "active",
      now: new Date().toISOString(),
      engineeringBusy: false,
      budgetUsd: null,
      resumeSupported,
      resume: resumeSupported ? resumeAgent : undefined,
    });
if (!result.ok) {
  console.error(result.reason);
  process.exit(1);
}
console.log(result.reason);

function specificationPath(packet: { id: string; initiativeId: string }): string {
  return `docs/factory/initiatives/${packet.initiativeId}/systems/SCP-${packet.id}.md`;
}

/**
 * An open Analyst dispatch whose systems-change file is already in this checkout ran.
 * A missing file is not evidence that the worker was absent.
 */
async function archiveRanAnalystWork(
  store: StateStore,
  ledger: FactoryLedger,
  world: World,
): Promise<FactoryLedger> {
  let current = ledger;
  const open = Object.values(current.packets)
    .filter(
      (packet) =>
        packet.dispatch?.effect === "wake_sa" &&
        existsSync(specificationPath(packet)) &&
        analystFileCountsAsThisDispatch(current, packet),
    )
    .sort((a, b) => a.id.localeCompare(b.id));
  for (const packet of open) {
    const wrote = await commitLedgerEvent(
      store,
      { type: "reconcile_dispatch", packetId: packet.id, workerExecution: "ran" },
      world,
    );
    if (!wrote.ok) {
      if (wrote.reason === "no_dispatch") continue;
      console.error(wrote.reason);
      process.exit(1);
    }
    current = await store.read();
  }
  return current;
}
