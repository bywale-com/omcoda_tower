# Factory handoff

**Established**

- The development architecture, three roles, release gates, and failure classes are written under `docs/factory/`.
- `.factory/controller/machine.ts` is the pure state machine. It admits a lease only for the role that owns the stage, rejects an expired lease on sign and commit, and refuses `accept` until the packet is `reconciled`.
- Live ledger compare-and-swap is the GitHub Contents API blob sha (`GitHubContentsStore`). Two clients that observed the same sha: one PUT wins, the other gets a conflict. `FileStore`’s directory lock is one machine and is not that guarantee.
- `githubLabelActuator` can spawn `gh pr edit`. It returns `actuator_disabled` without spawning unless `FACTORY_CONTROLLER=active`, `FACTORY_LABELS=armed`, `WAKE_GITHUB_TOKEN`, `FACTORY_SPEND_LIMIT_CONFIRMED=yes`, and `FACTORY_AUTOMATIONS_SAVED=yes` are all present. The apply script then refuses while `authorizedDispatches` is null.
- The committed ledger (`.factory/state/ledger.json`) is PKT-001 in `draft` with `**Wake:** hold` and `authorizedDispatches: null`.
- Manifests record `activation: inactive`, `dispatch: forbidden`, `labelActuator: connected_disarmed`.
- PR #135 is indexed and not modified. PKT-001’s systems-change packet is signed and the click path is planted. Wake stays hold. This session sat as Analyst and Engineer because Cursor Automations are not configured.
- `.github/workflows/factory-dispatch.yml` runs only on `workflow_dispatch`. Apply exits before `gh` while the disarm gates are unset.

**Verified**

- `npm run factory:check` locally: 23 checks. The new checks are a two-client contents compare-and-swap (including two releases that both saw the same blob), a scripted Contents API PUT that sends the observed sha and rejects 409, a disarmed actuator that does not spawn, an armed actuator that calls `gh pr edit` only through an injected runner, and a source agreement between the click SQL, the webhook, and the systems-change packet.
- `scripts/verify-click-attribution.ts` against migrated Postgres: a click stamped for enrollment A advances A; newer enrollment B on the same objective stays, including a direct tick of B; a missing stamp advances nobody; a null objective id matches only at or after `enrolled_at`; a null `campaign_id` does not advance.
- The ship workflow runs that script. The GitHub Actions run id for this commit is recorded after the pull request check finishes.
- Checkpoint timing was not observed. No timer exists. No Cursor Automation booted. No label was added.

**Remaining**

- Founder authorization to activate anything.
- `WAKE_GITHUB_TOKEN`, `FACTORY_CONTROLLER`, `FACTORY_LABELS`, `FACTORY_SPEND_LIMIT_CONFIRMED`, and `FACTORY_AUTOMATIONS_SAVED` are unset on purpose.
- `authorizedDispatches` is null. That refuses wakes once activation is on. It is not a measured budget. A provider-side spending limit is not configured.
- The ledger is not `verified`, `integrated`, or `accepted`. Integration is a merge of pull request 136. There is no merge SHA.
- `reopen` from `returned_architect` / `returned_analyst` is not an event.
- Claims 12–88 were not re-read. They must not be packeted from the title index.
- Launch Agent is not opened. Form and meeting completion still use `onCompletionWrite`.

**Next**

1. Read this file and `docs/factory/README.md`.
2. Leave PR #135 on its own branch.
3. Do not flip PKT-001 to `**Wake:** sa`, do not set `FACTORY_CONTROLLER`, and do not Save + Activate the prompts.
4. After the ship check is green on this commit, the remaining production step is a person’s merge. That merge is the integration event. Do not mark the packet accepted before it.
