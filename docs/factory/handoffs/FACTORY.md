# Factory handoff

**Established**

- The development architecture, three roles, release gates, and failure classes are written under `docs/factory/`.
- `.factory/controller/machine.ts` is the pure state machine. `.factory/controller/queue.ts` and `.factory/controller/execution.ts` schedule initiatives, packets, and assignments. `.factory/controller/dispatch.ts` commits a wake only after the label actuator reports success. One pass proposes at most one engineer or repair wake.
- An assignment may name several sibling packets. An execution is one Cursor run and moves `dispatched` → `started` → `running` → `completed`, `failed`, `refused`, or `interrupted`. A pending engineer dispatch does not hold the slot after its reservation ends.
- Live ledger compare-and-swap is the GitHub Contents API blob sha (`GitHubContentsStore`). `FileStore`’s directory lock is one machine and is not that guarantee.
- `githubLabelActuator` can spawn `gh pr edit`. It returns `actuator_disabled` without spawning unless `FACTORY_CONTROLLER=active`, `FACTORY_LABELS=armed`, `WAKE_GITHUB_TOKEN`, `FACTORY_SPEND_LIMIT_CONFIRMED=yes`, and `FACTORY_AUTOMATIONS_SAVED=yes` are all present.
- The committed ledger (`.factory/state/ledger.json`) authorizes scope `agents-and-automations` for module `Agents and Automations`. Status is `suspended`. `authorizedDispatches` is 50. `usedDispatches` is 31. The cap was not raised and no spend was refunded by the execution repair. `exec-identity` is `running` with the architect dispatch issued at 2026-10-30 10:11 AM America/Toronto. That dispatch is inside its reserve. Coverage is open. `launch-agent` stays discovered.
- PKT-001 is `accepted`, execution `manual`, Wake `hold`, dispatch null. `verifiedSha` is `19c47938d8aa8884b4874999a50667f5677205b3`. `integratedSha` is `9c45f19fa1ac9d909247d6be83c9263273b1bcbb`.
- PKT-002 is `candidate` at `3246a074efecd8adb98e4ca232d443b90821173f`. `verifiedSha` is null. No check run was found for that SHA, so none was recorded. The engineer execution is `completed` / `candidate_recorded`. It does not hold the slot.
- PKT-003 is `change_specified`. The engineer dispatch issued at 2026-10-30 06:38 AM America/Toronto never started. Recovery refused it (`reservation_expired`), cleared `dispatchedEngineerRevision`, and kept the dispatch history. It does not hold the slot.
- Manifests record `activation: inactive`, `dispatch: forbidden`, `labelActuator: connected_disarmed`, `integration: merge_sha_required`. Those manifest flags are not the ledger cap.
- PR #135 is indexed and not modified.
- `.github/workflows/factory-dispatch.yml` runs a dry control pass on pull request. It applies a label only when the five gates above are set. While the ledger scope is `suspended`, the control pass proposes no wake. There is no schedule.
- `projectFactory` is the Trigger read model. Trigger’s UI is not built.
- Cursor follow-up is `POST https://api.cursor.com/v1/agents/{id}/runs`. A GitHub label does not resume an agent id. The client sends a follow-up only when `CURSOR_API_KEY` is set and the five factory gates are set. This repair did not call that API.

**Verified**

- The suspend workflow on `cursor/factory-agents-scope-33ee` printed `suspended` (Actions run [41083216449](https://github.com/bywale-com/omcoda_tower/actions/runs/41083216449)). That is the stop. It does not kill a cloud agent that has already passed its gate.
- `npm run factory:check` is the controller proof. It does not call GitHub or Cursor. A green run is not a live Architect → Analyst → Engineer → verify → accept path.
- `scripts/verify-click-attribution.ts` against migrated Postgres passed before this autonomy change. Those checks passed on GitHub Actions for commit `19c47938d8aa8884b4874999a50667f5677205b3` at 8:32 AM America/Toronto. Factory check run [40873984441](https://github.com/bywale-com/omcoda_tower/actions/runs/40873984441). Ship run [40873984426](https://github.com/bywale-com/omcoda_tower/actions/runs/40873984426) printed `Click attribution PASSED`. That SHA is the plant. Later factory commits do not move the click path and do not replace those run ids.
- No provider usage dollar is stored. Cost per accepted packet is null.

**Remaining**

- The scope stays `suspended`. Do not unsuspend from an implementation seat. Do not raise `authorizedDispatches`. Do not change the four factory variables or Cursor Automation triggers.
- PKT-002 still needs a real check run against `3246a074efecd8adb98e4ca232d443b90821173f` before `verifiedSha` can be set. Do not attach another SHA’s green run.
- PKT-003 is eligible for an engineer when the scope is active again. This repair did not boot that worker.
- A live continuation follow-up was not sent. `CURSOR_API_KEY` is not used by this seat.
- `reopen` from `returned_architect` / `returned_analyst` is not an event.
- Claims 23–88 were not re-read. They must not be packeted from the title index. Claim 52 still owns the person split.
- Launch Agent is not opened.

**Next**

1. Leave the scope suspended until a real engineer path for the recovered packets has been watched, not simulated.
2. Leave PR #135 on its own branch.
3. Do not flip PKT-001 to `**Wake:** sa`. Do not boot a Cursor seat for it.
4. Do not record a verification, a merge SHA, or a dollar figure that did not happen.
