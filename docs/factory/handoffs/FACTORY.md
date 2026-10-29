# Factory handoff

**Established**

- The development architecture, three roles, release gates, and failure classes are written under `docs/factory/`.
- `.factory/controller/machine.ts` is the pure state machine. `.factory/controller/queue.ts` authorizes a scope, selects the next eligible initiative, dispatches the Architect, and prefers a ready packet wake over another architect session. One pass proposes at most one engineer or repair wake.
- Live ledger compare-and-swap is the GitHub Contents API blob sha (`GitHubContentsStore`). `FileStore`’s directory lock is one machine and is not that guarantee.
- `githubLabelActuator` can spawn `gh pr edit`. It returns `actuator_disabled` without spawning unless `FACTORY_CONTROLLER=active`, `FACTORY_LABELS=armed`, `WAKE_GITHUB_TOKEN`, `FACTORY_SPEND_LIMIT_CONFIRMED=yes`, and `FACTORY_AUTOMATIONS_SAVED=yes` are all present. The apply script then refuses while `authorizedDispatches` is null.
- The committed ledger (`.factory/state/ledger.json`) authorizes scope `agents-and-automations` for module `Agents and Automations` with `authorizedDispatches` 4. `usedDispatches` is 0. `exec-identity` is eligible and has no dispatch record. PKT-001 is `accepted`, execution `manual`, Wake `hold`, dispatch null. `verifiedSha` is `19c47938d8aa8884b4874999a50667f5677205b3`. `integratedSha` is `9c45f19fa1ac9d909247d6be83c9263273b1bcbb`. Coverage is open, so the initiative is not closed. `launch-agent` stays discovered.
- Manifests record `activation: inactive`, `dispatch: forbidden`, `labelActuator: connected_disarmed`, `integration: merge_sha_required`.
- PR #135 is indexed and not modified. PKT-001’s systems-change packet is signed and the click path is planted. This session sat as Analyst and Engineer because Cursor Automations are not configured. That record was not rewritten into an automatic dispatch.
- `.github/workflows/factory-dispatch.yml` runs a dry control pass on pull request. It applies a label only when the five gates above are set. `workflow_dispatch` mode `authorize` writes a scope and then applies once. Mode `suspend` writes a suspension and does not apply. There is no schedule.
- `projectFactory` is the Trigger read model. Trigger’s UI is not built.

**Verified**

- `npm run factory:check` locally: 36 checks. That includes the packet machine, the contents compare-and-swap, the disarmed actuator, the click-path agreement, T42/T43 manual evidence, and the authorized-scope cycle: selection, architect continuation, release, analyst, engineer, repair classification, integration, the next initiative, suspension, an exhausted dispatch count, a founder decision, a dependency, an incomplete module, and one engineering slot. It does not call GitHub or Cursor.
- `scripts/verify-click-attribution.ts` against migrated Postgres passed before this autonomy change. Those checks passed on GitHub Actions for commit `19c47938d8aa8884b4874999a50667f5677205b3` at 8:32 AM America/Toronto. Factory check run [40873984441](https://github.com/bywale-com/omcoda_tower/actions/runs/40873984441). Ship run [40873984426](https://github.com/bywale-com/omcoda_tower/actions/runs/40873984426) printed `Click attribution PASSED`. That SHA is the plant. Later factory commits do not move the click path and do not replace those run ids.
- No Cursor Automation was saved. No label was added. No scope was authorized on the committed ledger.

**Remaining**

- Founder steps in `docs/factory/ACTIVATION.md`.
- The four repository variables were set by the founder on 2026-10-29 at 11:01 AM America/Toronto. `WAKE_GITHUB_TOKEN` was not in the repository Actions secrets at inspection. Without that secret the control job prints `actuator disarmed` and does not add a label.
- `authorizedDispatches` on the ledger is 4. That is a dispatch count, not a measured dollar budget.
- PKT-001 is `accepted`. `integratedSha` is the merge of pull request 136. The controller still does not merge pull requests. `exec-identity` stays open because coverage is not complete.
- `reopen` from `returned_architect` / `returned_analyst` is not an event.
- Claims 12–88 were not re-read. They must not be packeted from the title index.
- Launch Agent is not opened. Form and meeting completion still use `onCompletionWrite`.

**Next**

1. Read `docs/factory/ACTIVATION.md`.
2. Leave PR #135 on its own branch.
3. Do not flip PKT-001 to `**Wake:** sa`, do not set `FACTORY_CONTROLLER` from an implementation seat, and do not Save + Activate the prompts from an implementation seat.
4. PKT-001 is accepted on merge `9c45f19fa1ac9d909247d6be83c9263273b1bcbb`. Do not reopen it. The Architect continues the open claims on `exec-identity`.
