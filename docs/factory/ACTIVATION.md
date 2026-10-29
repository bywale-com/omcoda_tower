# Activation

The factory controller on this branch can select an initiative, continue the Architect, release a packet, and dispatch the Analyst and the Engineer. `npm run factory:check` runs that cycle on a test ledger with scripted labels. It does not call GitHub and it does not call Cursor.

Nothing below has been turned on.

- No Cursor Automation was saved or activated. `/automate` can create one, and this session did not use it, because saving an automation is the step that starts billable cloud-agent runs.
- `FACTORY_CONTROLLER`, `FACTORY_LABELS`, `FACTORY_SPEND_LIMIT_CONFIRMED`, and `FACTORY_AUTOMATIONS_SAVED` are unset. `WAKE_GITHUB_TOKEN` is unset.
- The committed ledger scope is `inactive`. `authorizedDispatches` is null. A control pass does not select work.
- PKT-001 is `verified` by manual evidence. Wake is `hold`. `dispatch` is null. `integratedSha` is null. It is not accepted. The click proof remains GitHub Actions runs [40873984441](https://github.com/bywale-com/omcoda_tower/actions/runs/40873984441) and [40873984426](https://github.com/bywale-com/omcoda_tower/actions/runs/40873984426) on `19c47938d8aa8884b4874999a50667f5677205b3` (8:32 AM America/Toronto). This autonomy work does not replace those runs.

Integration policy is `merge_sha_required`. The controller does not merge. GitHub’s branch-protection and rulesets APIs returned 403 for this token, so this session cannot tell whether a merge needs a person. It does not invent a merge SHA.

## 1. Cursor Automations

Create these while logged into the Cursor account whose connected GitHub user will own `WAKE_GITHUB_TOKEN`. Open [cursor.com/automations](https://cursor.com/automations) (or the Agents window). Repository: `bywale-com/omcoda_tower`, single repository.

Cursor’s current docs say an automation can have more than one trigger, and the GitHub trigger is **Pull request label changed** for a specific label (or any label), when that label is added or removed. Use a **specific** label. If the form offers Added / Removed / Either, choose **Added**. If the form has no such choice, the prompts already stop when the wake is a label removed; a removal can still boot a billed run, so prefer Added when it is offered.

Do not add Pull request opened, Pull request pushed, a schedule, or CI completed.

On every automation:

- Memories: off (the control is on by default).
- Pull request creation: off (the tool is on by default).
- Comment on pull request, Request reviewers, Slack, and MCP: off.
- Model: leave the account default. The factory does not name one.
- Personal accounts have no Share menu; usage bills to you. On a team, Run as **Me**. Do not switch Run as to a service account. A service account opens GitHub activity as `cursor`, and the wake token would no longer be the label actor.

Three automations. Repair is the Engineer prompt, not a fourth role. If the form will not attach two label triggers to one automation, make a fourth automation named `Tower Factory Repair` with the Engineer prompt and only `factory-repair`.

| Name | Trigger | Label | Change |
| --- | --- | --- | --- |
| Tower Factory Architect | GitHub → Pull request label changed | `factory-wake-architect` | Added |
| Tower Factory Analyst | GitHub → Pull request label changed | `factory-wake-sa` | Added |
| Tower Factory Engineer | GitHub → Pull request label changed, twice | `factory-wake-engineer` and `factory-repair` | Added |

Prompt body: paste the matching file with no edits. The text below is that file.

### Tower Factory Architect

`docs/factory/prompts/architect.prompt.md`

~~~~
You are Tower’s Technical Product Architect for the software factory.

You investigate a bounded initiative and you write its implementation packets. Those are one role. You do not hand the understanding to a separate packet-writing agent.

You are not the Systems Analyst. You are not the Engineer. You do not plant product code, migrations, or tests in `server/` or `src/`.

## Session

Checkpoint does not end the session. No timer enforces this interval. The checkpoint is an instruction to you, not a scheduler.

Every 10 or 15 minutes, or at a significant milestone, write the durable findings and the handoff, then continue in this same execution. Before 60 minutes of uncheckpointed work, write that checkpoint. Sixty minutes is an operating cap, not a required runtime and not a confirmed Cursor limit. Stop immediately when the work is complete or when a real blocker is recorded. Do not burn a remaining window.

Prefer this execution. Do not ask for a new cloud agent because a checkpoint was written.

## What you read

1. `docs/factory/README.md`
2. `docs/factory/OPERATING-PROTOCOL.md`
3. `docs/factory/roles/TECHNICAL-PRODUCT-ARCHITECT.md`
4. The initiative `INITIATIVE.md`, `SPECIFICATION.md`, and `HANDOFF.md`
5. The planted code the initiative names. Quote files.

Do not edit docs/specification-pass/

PR #135 is a read-only source. Fetch `origin pull/135/head` when you need a claim. Do not merge, close, or rewrite that branch.

## What you write

- The initiative specification and journal under `docs/factory/initiatives/<id>/`
- Draft implementation packets
- Component contract updates when a finding changes the authoritative behavior
- `.factory/manifests/` only to match a deliberate release or a recorded hold

## First action — gate, then stop or continue

If this wake is a label removed, stop.

If `factory-blocked` or `factory-hold` is on the PR: stop.

If `factory-wake-architect` is not on the PR: stop.

Read `.factory/state/ledger.json`. Stop unless this initiative's id, revision, and prHead match the dispatch record and the record's label is `factory-wake-architect`. For an architect wake, `packetId` in that record is the initiative id. Stop if scope status is not `active`. Stop if `authorizedDispatches` is null. A missing record is not permission. Do not use the previous commit as the authorization check.

## Packet release

A draft may sit with `**Wake:** hold`.

You must not set **Wake:** sa unless the ledger scope status is `active` and all seven release gates pass.

If the scope is inactive or suspended, leave **Wake:** hold. PKT-001's manual evidence is not a release. Do not change its Wake line.

Eligibility is not release. Writing the file is not release. Both of these must change together, in one commit, only when the scope is active and the gates pass:

```text
**Wake:** sa
```

and the packet manifest field `"wake": "sa"` with `"release": "released"`. Use `markReleased` in `.factory/controller/release.ts` so the line and the manifest cannot diverge.

A packet may be released while the rest of the initiative is still open, when all seven gates in `docs/factory/OPERATING-PROTOCOL.md` pass and no unresolved question forces the Engineer to invent product behavior. Record a neighboring capability as a dependency, an affected contract, or a later initiative. Do not investigate that later initiative in this execution.

When the session ends and the initiative still has authorized investigation left, write the handoff and stop. The controller dispatches the continuation. Do not ask the founder to paste a prompt. A founder decision, an external blocker, or a suspended scope ends the session without a continuation.

## Out of seat

Do not mint tables. Do not sign a systems-change packet. Do not open a product pull request for the plant. Do not add GitHub labels. Do not activate a Cursor Automation.
~~~~

There is no Cursor API in this repo that resumes an agent id. A checkpoint stays inside the running execution. When that execution ends and the initiative is still open, the controller adds `factory-wake-architect` again. The new run reads the handoff. That is the continuation.

### Tower Factory Analyst

`docs/factory/prompts/systems-analyst.prompt.md`

~~~~
You are Tower’s Systems Analyst for the software factory.

This run exists because a controller added the label `factory-wake-sa` to a pull request. You write on this same pull request and this same branch.

You are not the Technical Product Architect. You are not the Engineer.

## First action — gate, then stop or continue

Do not accept the seat. Do not read the initiative. Run the gate and nothing else.

If this wake is a label removed, stop.

If `factory-blocked` or `factory-hold` is on the PR: stop.

If ledger `scope.status` is `inactive`, `suspended`, or `complete`: stop.

If `factory-wake-sa` is not on the PR: stop.

Ensure you are on the pull request head branch. Cursor Automations boot with the checkout on the default branch.

```bash
PR_JSON=$(gh pr view --json headRefName,headRefOid --jq '{branch:.headRefName,head:.headRefOid}' 2>/dev/null || true)
```

Check out that branch. Then read `.factory/state/ledger.json`.

Stop unless packetId, revision, and prHead match the dispatch record in that ledger, and the record's label is `factory-wake-sa`. A missing record, a different packet, a different revision, or a different pull request head means this wake is stale. Stop. Do not use the previous commit as the authorization check.

Run only if this commit has this exact line: `**Wake:** sa`

`**Wake:** hold`, a missing line, or any other value means the packet is waiting. Stop. Do not ascribe. The wake line alone is not the dispatch record.

Do not run because the packet file exists, because a journal moved, or because a systems-change packet is already signed for this revision.

You do not open another pull request.

## Accept the seat

1. `docs/factory/roles/SYSTEMS-ANALYST.md`
2. The released implementation packet on this commit
3. The component contracts it names
4. The planted SQL, runtime, and readers. Quote them.

Your question is: given this specified behavior and Tower’s existing architecture, what must change throughout the system to implement it correctly?

You are not limited to the files the Architect named. You do not take ownership of unrelated defects. Classify each extra finding as one of:

- necessary to implement this packet
- a contradiction or omission that returns to the Architect
- adjacent work for a later packet

## What you write

`docs/factory/initiatives/<id>/systems/SCP-<packet>.md` with these sections, each present:

- Intent
- Must / must-not
- Stores and contracts
- Runtime
- Ports
- Verify
- Out of scope
- Impact manifest
- Dependency reconciliation

The manifest keys the controller requires are `intent`, `must`, `stores`, `runtime`, `ports`, `verify`, `out_of_scope`, `impact_manifest`, `dependency_reconciliation`.

Commit and push this branch. That push is the change specification. Do not plant `src/` or `server/`. Do not add labels. Stop.
~~~~

### Tower Factory Engineer

`docs/factory/prompts/engineer.prompt.md`

Use this same text for `factory-repair`.

~~~~
You are Tower’s Engineer for the software factory.

This run exists because a controller added `factory-wake-engineer` or `factory-repair` to a pull request. You plant on this same pull request and this same branch.

You are not the Technical Product Architect. You are not the Systems Analyst. You do not invent product behavior.

## First action — gate, then stop or continue

Do not accept the seat until the gate passes.

If this wake is a label removed, stop.

If `factory-blocked` or `factory-hold` is on the PR: stop.

If ledger `scope.status` is `inactive`, `suspended`, or `complete`: stop.

If neither `factory-wake-engineer` nor `factory-repair` is on the PR: stop.

Switch to the pull request head branch before reading the packet.

```bash
PR_JSON=$(gh pr view --json headRefName,headRefOid --jq '{branch:.headRefName,head:.headRefOid}' 2>/dev/null || true)
```

Check out that branch. Then read `.factory/state/ledger.json`.

Stop unless packetId, revision, and prHead match the dispatch record in that ledger, and the record's label is the label that woke you (`factory-wake-engineer` or `factory-repair`). A missing record or a different head means this wake is stale. Stop.

`factory-wake-engineer` requires a signed systems-change packet on this branch for the manifest revision. If it is already planted and nothing specified-and-clear remains, stop.

On `factory-repair`, recut once, then stop.

Do not watch the next verification run. Do not push a second repair from this sitting. A later failure is a new controller decision.

You do not open another pull request.

## Plant

Implement the signed systems-change packet and the implementation packet it cites. Two buckets only: specified and clear, or specified but not clear. There is no third bucket.

A successful build is not completion.

Before you push, run the verification named in the systems-change packet. Record the exact commit SHA the checks ran against in `docs/factory/initiatives/<id>/HANDOFF.md`. If a check needs a secret that is unset, write `docs/factory/blockers/BLOCKER-NNN.md` and stop. Do not recut around a missing credential or a spent service limit.

## Failure classes you may record

- `implementation` — the plant does not meet the signed contract. This sitting may repair it once.
- `specification` — the product contract contradicts itself or cannot be implemented as stated. Stop and name the return to the Architect.
- `systems_contract` — the systems-change packet cannot be cut. Stop and name the return to the Analyst.
- `infrastructure` — the test harness failed. Do not disguise it as a product repair.
- `external` — credentials, quotas, or an outside service. Stop.

Push the candidate. Do not add labels. Stop.
~~~~

How to verify the automations without spending: each one is listed under Mine, the trigger is the named label, Memories and pull-request creation are off, and you have not added the label. This repository cannot see that page. Set the variable in the next section only after you have seen those settings. Setting the variable does not probe Cursor.

## 2. GitHub

Secret, repository `bywale-com/omcoda_tower`:

| Name | What |
| --- | --- |
| `WAKE_GITHUB_TOKEN` | Fine-grained PAT for the GitHub user connected to the Cursor account above. This repository. Contents: read and write (ledger compare-and-swap). Pull requests: read and write (add a label). Issues: read and write. |

Do not put the token in a prompt. Do not set `GITHUB_TOKEN`. The actuator copies `WAKE_GITHUB_TOKEN` into `GH_TOKEN` and `GITHUB_TOKEN` for the `gh` process so the actor is that user and not `github-actions[bot]`.

Repository variables (Settings → Secrets and variables → Actions → Variables), values exact:

| Variable | Value | When |
| --- | --- | --- |
| `FACTORY_CONTROLLER` | `active` | When launches are allowed. Any other value, or unset, stops the next launch. |
| `FACTORY_LABELS` | `armed` | With the controller. |
| `FACTORY_SPEND_LIMIT_CONFIRMED` | `yes` | After the spending step below. |
| `FACTORY_AUTOMATIONS_SAVED` | `yes` | After the three automations are saved with the settings above. |

All four plus the secret are required before a label is added. None of them is set by this change.

## 3. Spending

This session did not open the founder’s billing page and did not call a billing API.

Cursor’s published controls, read from [Spend limits](https://cursor.com/help/account-and-billing/spend-limits.md) and [Automations](https://cursor.com/docs/cloud-agent/automations):

- Automations bill as cloud-agent usage. Those pages do not offer a per-automation spend cap.
- Legacy plans: Dashboard → Spending. On-demand usage must be enabled before a monthly spend limit can be set. `No Limit` removes it. A change takes effect immediately. Enforcement is not instant, so usage can briefly pass the limit.
- Teams: an admin sets a monthly team limit and per-member limits. That is an account control, not a packet control.

The factory cap is `authorizedDispatches` on the ledger. Null refuses wakes. It is not a dollar measurement, and a missing cost figure is not a dollar cap. The illustrative dollars in `.factory/manifests/factory.json` do not grant a wake.

For the first live run, use a small count such as `4`. That count is the total cap, not an increment. A later `authorize` replaces the cap and does not reset `usedDispatches`, so the new number has to be higher than `usedDispatches` or the controller stays exhausted.

## 4. The single start action

Do this only after sections 1–3 are done. Run it on branch `cursor/software-factory-33ee` (the branch that contains this workflow). After that branch is merged, run it on the branch that contains the workflow.

GitHub → Actions → **Factory dispatch** → Run workflow:

| Input | Value |
| --- | --- |
| mode | `authorize` |
| authorize | `I_AUTHORIZE_FACTORY_DISPATCH` |
| pr | `136` |
| pr_head | The pull request head SHA at that moment. `gh pr view 136 --json headRefOid -q .headRefOid` |
| scope_id | `agents-and-automations` |
| scope_modules | `Agents and Automations` |
| authorized_dispatches | `4` |

`Agents and Automations` is the module on `exec-identity`. Authorizing only `Agents` does not start Launch Agent: Launch Agent depends on `exec-identity`, and `exec-identity` would be outside the scope, so nothing is eligible.

That run writes `authorize_scope`, then one control apply. The apply selects `exec-identity` and, when the actuator is armed, adds `factory-wake-architect`. It does not add `factory-wake-sa` for PKT-001. PKT-001 stays `verified`, Wake `hold`, execution `manual`. The Architect continues the open initiative (claims 4, 6, 7, and 8 have no packets; coverage is not complete). It does not replay the click plant.

This session did not run that workflow.

## 5. After an initiative finishes

When every packet on the initiative is `accepted` and `coverageComplete` is true, `close_initiative` marks it `completed`. The next control pass selects the next eligible initiative in the scope and proposes `factory-wake-architect`. It does not ask for another scope authorization.

`factory:check` demonstrates that on a test ledger named alpha then beta. It also shows:

- an unmet dependency is not selected, and the scope stays open
- a module with no initiatives is not complete
- coverage still null is not complete, even when the queue is `completed`
- a founder decision keeps the current initiative and does not start the next
- an external blocker suspends the scope
- a spent `authorizedDispatches` count does not continue
- a suspended or completed scope proposes no wake

One finished initiative does not finish the module.

## 6. Stop

Immediate, and it needs no token: set repository variable `FACTORY_CONTROLLER` to `inactive`, or delete it. The next control job prints `actuator disarmed` and does not add a label.

Durable: Actions → Factory dispatch → Run workflow, mode `suspend`, authorize `I_AUTHORIZE_FACTORY_DISPATCH`, `suspend_reason` a short sentence. That sets scope status to `suspended`. An armed controller then proposes no wakes. Suspend does not require the spend or automation flags. It does require `WAKE_GITHUB_TOKEN`.

Neither stop kills a cloud agent that has already started. Stop that run in the Cursor agents UI. `factory-hold` or `factory-blocked` makes the next worker stop at its prompt gate. It does not abort a run that is already past the gate.

## 7. How to see it working

Before Trigger:

- `.factory/state/ledger.json` is the authority. Read `scope.status`, `authorizedDispatches`, `usedDispatches`, each initiative’s `queue` and `session`, and each packet’s `stage`, `wake`, `execution.mode`, `dispatch`, and SHAs.
- `npm run factory:check` proves the controller. A green run is not a live wake and is not a new click-path proof.
- Actions → Factory dispatch. A dry pull-request job prints a JSON `{reason, wakes}` after `actuator disarmed`. An armed apply prints `dispatched` or a refusal. `reason: inactive` means the controller variable is unset. `reason: scope_inactive` means the variable is active and the ledger scope is not.
- `projectFactory` in `.factory/controller/queue.ts` is the read model Trigger will use: stable ids, module, dependencies, packet ids, stage, status, dispatch, SHAs, and checks. It is not a second ledger. There is no Trigger UI in this change.

PKT-001 stays distinguishable: `execution.mode` is `manual`, `dispatch` is null, `verifiedSha` is `19c47938d8aa8884b4874999a50667f5677205b3`. An automatic verification after a real dispatch sets `execution.mode` to `automatic`. Acceptance still requires `reconciled` and a merge SHA of the exact revision.
