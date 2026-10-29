# Secrets and external activation

Nothing in this change stores a credential. Nothing in this change sets a GitHub Actions secret or a repository variable.

## Required before any worker can be booted

These are identified from Travis’s working chain (`.github/workflows/wake-packet-seats.yml` and `docs/register/AUTOMATION-PACKET-CHAIN.md`) and from the failures in blockers 001–004. They are not configured here.

| Name | Kind | Why | What it is not |
| --- | --- | --- | --- |
| `WAKE_GITHUB_TOKEN` | Actions secret. Fine-grained PAT for the GitHub user connected to the Cursor automation. This repository. Issues read/write, Pull requests read/write. Contents read/write if the actuator commits. | Cursor’s label trigger does not treat `github-actions[bot]` as that user. Travis fell back to the bot and the seats did not wake. | Not `GITHUB_TOKEN`. Not a token pasted into chat or into a prompt. |
| `FACTORY_CONTROLLER` | Repository **variable**, value exactly `active` | The dispatch workflow checks it. Unset means inactive. | Not a secret. Not set by this change. |

## Explicitly not required for the factory

| Name | Why it stays unset |
| --- | --- |
| `CURSOR_API_KEY` | The controller does not call the Cursor API. Workers, when authorized, are Cursor Automations saved by a person at cursor.com/automations. There is no create API. Travis recorded that limit. |
| `DATABASE_URL` | The factory check does not touch Postgres. Product `verify:ship` already has its own ephemeral database in `.github/workflows/ship.yml`. |
| `RESEND_API_KEY`, `EMERGE_EMAIL`, `RESEND_FROM_EMAIL` | Emerge mail is a Travis human-test letter. This factory does not send mail. |
| `TRAVIS_TEST_OPERATOR_COOKIE` | Travis runtime-doors. Not a Tower check. |

## Human steps that remain, and that this change does not perform

1. Review the three prompts under `docs/factory/prompts/`.
2. At cursor.com/automations, create three automations only when you intend to spend cloud-agent budget: Architect is manual or absent (no label), Analyst triggers on label `factory-wake-sa` added, Engineer triggers on labels `factory-wake-engineer` and `factory-repair` added. Memories off. Pull request creation off. Repository `bywale-com/omcoda_tower`.
3. Add `WAKE_GITHUB_TOKEN` in GitHub Actions secrets for this repository.
4. Set the repository variable `FACTORY_CONTROLLER` to `active`.
5. Only then consider `workflow_dispatch` with mode `apply` and the phrase `I_AUTHORIZE_FACTORY_DISPATCH`.

Step 5 still does not add a label. `githubLabelActuator` returns `actuator_disabled` unless `FACTORY_CONTROLLER` is `active`, `FACTORY_LABELS` is `armed`, and `WAKE_GITHUB_TOKEN` is set. Even then this build returns `actuator_not_connected` and does not spawn `gh`. The command it would use is `gh pr edit <pr> --add-label <label>`, built by `labelEditArgs`. Connecting that spawn is a later change, after the simulated lifecycle has been reviewed.

## Travis failures this list is answering

- Blocker 001 (2026-09-12): Cloud Agents concurrent cap. Class `external`. Do not recut.
- Blocker 002 (2026-09-13): spend hard limit, Background Agent needs at least $2 remaining. Class `external`.
- Blocker 003 (2026-09-13): `POST /v1/agents` timed out. Class `external`.
- Blocker 004 (2026-09-15): `WAKE_GITHUB_TOKEN` unset on the Vercel preview, look walk returned 503. Class `infrastructure` for a missing secret. Tower’s factory does not put that token on a product preview.
