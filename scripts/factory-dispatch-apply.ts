/**
 * Armed label apply.
 *
 * `.github/workflows/factory-dispatch.yml` reaches this file only after the
 * disarm gates pass. `npm run factory:check` does not execute it. A ledger
 * whose `authorizedDispatches` is null or not positive refuses before any
 * label add and before any contents PUT.
 */
import { dispatchWake, githubLabelActuator } from "../.factory/controller/dispatch.ts";
import { GitHubContentsStore, githubContentsRemote } from "../.factory/controller/contents.ts";

function refuse(reason: string): never {
  console.error(reason);
  process.exit(1);
}

if (process.env.FACTORY_CONTROLLER !== "active") refuse("actuator_disabled");
if (process.env.FACTORY_LABELS !== "armed") refuse("actuator_disabled");
if (process.env.FACTORY_SPEND_LIMIT_CONFIRMED !== "yes") refuse("actuator_disabled");
if (process.env.FACTORY_AUTOMATIONS_SAVED !== "yes") refuse("actuator_disabled");
if (!process.env.WAKE_GITHUB_TOKEN) refuse("actuator_disabled");

const pr = Number(process.env.FACTORY_PR);
if (!Number.isInteger(pr) || pr <= 0) refuse("actuator_pr_unset");
const prHead = process.env.FACTORY_PR_HEAD?.trim() ?? "";
if (!prHead) refuse("actuator_pr_head_unset");

const repository = process.env.FACTORY_REPOSITORY ?? "";
const slash = repository.indexOf("/");
if (slash <= 0 || slash === repository.length - 1) refuse("repository_unset");
const branch = process.env.FACTORY_LEDGER_BRANCH?.trim() ?? "";
if (!branch) refuse("ledger_branch_unset");

const store = new GitHubContentsStore(
  githubContentsRemote({
    owner: repository.slice(0, slash),
    repo: repository.slice(slash + 1),
    path: ".factory/state/ledger.json",
    branch,
    env: process.env,
  }),
);

let ledger;
try {
  ledger = await store.read();
} catch {
  refuse("ledger_unreadable");
}
if (ledger.authorizedDispatches == null || ledger.authorizedDispatches <= 0) {
  refuse("dispatch_not_authorized");
}

const result = await dispatchWake({
  store,
  actuator: githubLabelActuator({ env: process.env, pr }),
  packetId: process.env.FACTORY_PACKET_ID ?? "pkt-001-click-attribution",
  prHead,
  activation: "active",
  now: new Date().toISOString(),
  engineeringBusy: false,
  budgetUsd: null,
});
if (!result.ok) refuse(result.reason);
console.log(result.reason, result.effect);
