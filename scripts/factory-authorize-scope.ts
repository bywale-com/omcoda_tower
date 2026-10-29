/**
 * Authorizes one development scope on the remote ledger.
 *
 * Without --apply this process prints the event and exits. It does not read
 * GitHub and it does not add a label.
 * --apply writes `authorize_scope` through the Contents API. The next
 * factory-control apply selects an initiative. This script does not select one
 * and does not spawn gh.
 */
import { GitHubContentsStore, githubContentsRemote } from "../.factory/controller/contents.ts";
import { commitLedgerEvent } from "../.factory/controller/queue.ts";

function armed(): boolean {
  return (
    process.env.FACTORY_CONTROLLER === "active" &&
    process.env.FACTORY_LABELS === "armed" &&
    Boolean(process.env.WAKE_GITHUB_TOKEN) &&
    process.env.FACTORY_SPEND_LIMIT_CONFIRMED === "yes" &&
    process.env.FACTORY_AUTOMATIONS_SAVED === "yes"
  );
}

const id = (process.env.SCOPE_ID ?? "").trim();
const modules = (process.env.SCOPE_MODULES ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const authorizedDispatches = Number(process.env.AUTHORIZED_DISPATCHES);
const apply = process.argv.includes("--apply");

if (!apply) {
  console.log(JSON.stringify({ type: "authorize_scope", id, modules, authorizedDispatches }));
  process.exit(0);
}

if (!armed()) {
  console.error("actuator disarmed");
  process.exit(1);
}
if (!id || modules.length === 0) {
  console.error("scope_incomplete");
  process.exit(1);
}
if (!Number.isInteger(authorizedDispatches) || authorizedDispatches <= 0) {
  console.error("dispatch_not_authorized");
  process.exit(1);
}

const repository = process.env.FACTORY_REPOSITORY ?? "";
const slash = repository.indexOf("/");
const branch = process.env.FACTORY_LEDGER_BRANCH?.trim() ?? "";
if (slash <= 0 || slash === repository.length - 1 || !branch) {
  console.error("ledger_branch_unset");
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

const result = await commitLedgerEvent(
  store,
  { type: "authorize_scope", id, modules, authorizedDispatches },
  {
    activation: "active",
    now: new Date().toISOString(),
    engineeringBusy: false,
    budgetUsd: null,
    authorizedDispatches,
    usedDispatches: 0,
    scopeStatus: "inactive",
  },
);
if (!result.ok) {
  console.error(result.reason);
  process.exit(1);
}
console.log(result.reason);
