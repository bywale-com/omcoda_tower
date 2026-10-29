# Factory handoff

**Established**

- The development architecture, three roles, release gates, and failure classes are written under `docs/factory/`.
- `.factory/controller/machine.ts` is the pure state machine. `.factory/controller/queue.ts` authorizes a scope, selects the next eligible initiative, dispatches the Architect, and prefers a ready packet wake over another architect session. One pass proposes at most one engineer or repair wake.
- Live ledger compare-and-swap is the GitHub Contents API blob sha (`GitHubContentsStore`). `FileStore`’s directory lock is one machine and is not that guarantee.
- `githubLabelActuator` can spawn `gh pr edit`. It returns `actuator_disabled` without spawning unless `FACTORY_CONTROLLER=active`, `FACTORY_LABELS=armed`, `WAKE_GITHUB_TOKEN`, `FACTORY_SPEND_LIMIT_CONFIRMED=yes`, and `FACTORY_AUTOMATIONS_SAVED=yes` are all present. The apply script then refuses while `authorizedDispatches` is null.
- The committed ledger (`.factory/state/ledger.json`) records PKT-001 as `verified` by `record_manual_evidence`. Execution mode is `manual`. Wake stays `hold`. `dispatch` is null. `authorizedDispatches` is null. `usedDispatches` is 0. `candidateSha` and `verifiedSha` are `19c47938d8aa8884b4874999a50667f5677205b3`. `integratedSha` is null. Scope status is `inactive`. `exec-identity` is eligible. `launch-agent` is discovered and depends on `exec-identity`. Neither has been selected.
- Manifests record `activation: inactive`, `dispatch: forbidden`, `labelActuator: connected_disarmed`, `integration: merge_sha_required`.
- PR #135 is indexed and not modified. PKT-001’s systems-change packet is signed and the click path is planted. This session sat as Analyst and Engineer because Cursor Automations are not configured. That record was not rewritten into an automatic dispatch.
- `.github/workflows/factory-dispatch.yml` runs a dry control pass on pull request. It applies a label only when the five gates above are set. `workflow_dispatch` mode `authorize` writes a scope and then applies once. Mode `suspend` writes a suspension and does not apply. There is no schedule.
- `projectFactory` is the Trigger read model. Trigger’s UI is not built.

**Verified**

- `npm run factory:check` locally: 35 checks. That includes the packet machine, the contents compare-and-swap, the disarmed actuator, the click-path agreement, T42/T43 manual evidence, and the authorized-scope cycle: selection, architect continuation, release, analyst, engineer, repair classification, integration, the next initiative, suspension, an exhausted dispatch count, a founder decision, a dependency, an incomplete module, and one engineering slot. It does not call GitHub or Cursor.
- `scripts/verify-click-attribution.ts` against migrated Postgres passed before this autonomy change. Those checks passed on GitHub Actions for commit `19c47938d8aa8884b4874999a50667f5677205b3` at 8:32 AM America/Toronto. Factory check run [40873984441](https://github.com/bywale-com/omcoda_tower/actions/runs/40873984441). Ship run [40873984426](https://github.com/bywale-com/omcoda_tower/actions/runs/40873984426) printed `Click attribution PASSED`. That SHA is the plant. Later factory commits do not move the click path and do not replace those run ids.
- No Cursor Automation was saved. No label was added. No scope was authorized on the committed ledger.

**Remaining**

- Founder steps in `docs/factory/ACTIVATION.md`.
- `WAKE_GITHUB_TOKEN`, `FACTORY_CONTROLLER`, `FACTORY_LABELS`, `FACTORY_SPEND_LIMIT_CONFIRMED`, and `FACTORY_AUTOMATIONS_SAVED` are unset on purpose.
- `authorizedDispatches` is null. That refuses wakes once activation is on. It is not a measured dollar budget.
- The ledger is `verified` and not `integrated` or `accepted`. Integration is a merge of pull request 136. Branch protection could not be read (HTTP 403). The controller does not merge. There is no merge SHA.
- `reopen` from `returned_architect` / `returned_analyst` is not an event.
- Claims 12–88 were not re-read. They must not be packeted from the title index.
- Launch Agent is not opened. Form and meeting completion still use `onCompletionWrite`.

**Next**

1. Read `docs/factory/ACTIVATION.md`.
2. Leave PR #135 on its own branch.
3. Do not flip PKT-001 to `**Wake:** sa`, do not set `FACTORY_CONTROLLER` from an implementation seat, and do not Save + Activate the prompts from an implementation seat.
4. A person’s review and merge of pull request 136 is the integration event for PKT-001. Record that merge SHA with `integrate`, then `reconcile`, and only then `accept`.
