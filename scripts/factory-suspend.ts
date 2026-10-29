/**
 * Suspends the factory scope on the remote ledger.
 *
 * Without --apply this process prints the event and exits.
 * --apply requires WAKE_GITHUB_TOKEN and SUSPEND_REASON. It does not require
 * the spend or automation flags. It does not add a label and it does not
 * dispatch a worker. Unsetting FACTORY_CONTROLLER remains the stop that needs
 * no token: the next control job will not apply.
 */
import { GitHubContentsStore, githubContentsRemote } from "../.factory/controller/contents.ts";
import { commitLedgerEvent } from "../.factory/controller/queue.ts";

const reason = (process.env.SUSPEND_REASON ?? "").trim();
const apply = process.argv.includes("--apply");

if (!apply) {
  console.log(JSON.stringify({ type: "suspend", reason }));
  process.exit(0);
}

if (!process.env.WAKE_GITHUB_TOKEN) {
  console.error("wake_token_unset");
  process.exit(1);
}
if (!reason) {
  console.error("suspension_reason_missing");
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
  { type: "suspend", reason },
  {
    activation: "active",
    now: new Date().toISOString(),
    engineeringBusy: false,
    budgetUsd: null,
    authorizedDispatches: null,
    usedDispatches: 0,
    scopeStatus: "active",
  },
);
if (!result.ok) {
  console.error(result.reason);
  process.exit(1);
}
console.log(result.reason);
