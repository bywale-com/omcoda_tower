# Factory handoff

**Established**

- The development architecture, three roles, release gates, and failure classes are written under `docs/factory/`.
- The controller in `.factory/controller/machine.ts` enforces leases, SHA binding, hold, blocker, inactive dispatch, duplicate fingerprints, and a single repair.
- Manifests record `activation: inactive`, `dispatch: forbidden`, `labelActuator: not_wired`.
- PR #135 is indexed and not modified. PKT-001 is a held draft for claim 3.
- Prompts exist and are not saved as Cursor Automations.
- `.github/workflows/factory-dispatch.yml` runs only on `workflow_dispatch` and does not add labels.

**Verified**

- `npm run factory:check` locally, then GitHub Actions run `40865661945` on pull request #136 (factory-check, passed in 36s). It covers transition ids T01–T30, the click oracle, the inactive manifests, the prompt gates, and the dispatch workflow’s lack of a pull-request or schedule trigger.
- The production click path was not executed. No product UI or server code moved, so `/prototype-ant` was not exercised.

**Remaining**

- Founder authorization to activate anything.
- `WAKE_GITHUB_TOKEN` and repository variable `FACTORY_CONTROLLER=active` are unset on purpose.
- The label actuator is not wired. `workflow_dispatch` mode `apply` still refuses to add labels.
- No systems-change packet. No production plant. Launch Agent is not opened.
- `reopen` from `returned_architect` / `returned_analyst` is not an event.
- Claims 12–88 were not re-read. They must not be packeted from the title index.

**Next**

1. Read this file and `docs/factory/README.md`.
2. Leave PR #135 on its own branch.
3. When a product plant is wanted, seat the Architect only to confirm PKT-001 still matches claim 3 at the current PR #135 SHA, then stop for founder authorization before any `**Wake:** sa` flip.
4. Do not Save + Activate the prompts until `docs/factory/SECRETS.md` is done by a person, and do not treat that page as already done.
