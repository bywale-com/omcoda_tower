# Factory handoff

**Established**

- The development architecture, three roles, release gates, and failure classes are written under `docs/factory/`.
- `.factory/controller/machine.ts` is the pure state machine. It admits a lease only for the role that owns the stage, rejects an expired lease on sign and commit, and refuses `accept` until the packet is `reconciled`.
- `.factory/controller/dispatch.ts` locks a ledger and compare-and-swaps on `stateRevision`. A failed label add does not acknowledge the wake. A second wake for the same revision does not call the actuator again. Workers must match packet id, revision, and pull-request head on the dispatch record.
- The committed ledger (`.factory/state/ledger.json`) is PKT-001 in `draft` with `**Wake:** hold` and `authorizedDispatches: null`.
- Manifests record `activation: inactive`, `dispatch: forbidden`, `labelActuator: not_wired`.
- PR #135 is indexed and not modified. PKT-001 is a held draft for claim 3.
- Prompts exist and are not saved as Cursor Automations. They read the dispatch record. They do not authorize from the previous commit.
- `.github/workflows/factory-dispatch.yml` runs only on `workflow_dispatch` and does not add labels. `githubLabelActuator` does not spawn `gh`.

**Verified**

- `npm run factory:check` locally: 21 checks. They cover T01–T41, the click oracle, the inactive manifests, the prompt gates, a simulated PKT-001 path (release, analyst dispatch, signed change, engineer dispatch, candidate SHA, verify, integrate, reconcile, accept), a failed label add, a duplicate dispatch, a stale compare-and-swap, and the disabled GitHub actuator.
- The earlier GitHub Actions run `40865661945` passed the previous check. This hardening has not been observed on Actions until the next push.
- The production click path was not executed. No product UI or server code moved, so `/prototype-ant` was not exercised.
- Checkpoint timing was not observed. No timer exists.

**Remaining**

- Founder authorization to activate anything.
- `WAKE_GITHUB_TOKEN` and repository variable `FACTORY_CONTROLLER=active` are unset on purpose. `FACTORY_LABELS` is unset. Even if all three were set, this build returns `actuator_not_connected`.
- No systems-change packet. No production plant. Launch Agent is not opened.
- `reopen` from `returned_architect` / `returned_analyst` is not an event.
- Claims 12–88 were not re-read. They must not be packeted from the title index.
- A provider-side spending limit is not configured. `authorizedDispatches` is null, which refuses wakes once activation is on. It is not a measured budget.

**Next**

1. Read this file and `docs/factory/README.md`.
2. Leave PR #135 on its own branch.
3. Do not flip PKT-001 to `**Wake:** sa`, do not set `FACTORY_CONTROLLER`, and do not Save + Activate the prompts.
4. The next product step, after this hardening is reviewed, is a real Systems Analyst and Engineer pass on PKT-001. That step is not started. It needs the label spawn connected and a fixed `authorizedDispatches` count chosen by the founder, plus a provider spending limit.
