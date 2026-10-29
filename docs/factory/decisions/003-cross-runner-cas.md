# 003 — Cross-runner compare-and-swap, disarmed label spawn, PKT-001 plant

**Date:** 2026-10-29  
**Status:** accepted for this factory

## Decision

Live ledger writes compare-and-swap on the GitHub Contents API blob sha. Two runners that both read the same sha: the first PUT wins, the second gets 409 and retries or stops. A directory lock on one runner is not that lock.

`githubLabelActuator` spawns `gh pr edit` only when the controller is active, labels are armed, `WAKE_GITHUB_TOKEN` is set, `FACTORY_SPEND_LIMIT_CONFIRMED=yes`, and `FACTORY_AUTOMATIONS_SAVED=yes`. Otherwise it returns `actuator_disabled` and does not spawn. The apply script also refuses while `authorizedDispatches` is null. Those values stay unset.

PKT-001’s click path is planted in this session: the webhook advances the enrollment stamped on the message, and the click predicate requires that enrollment on both arms. Wake stays `hold`. The ledger stays `draft`. Acceptance waits for a real merge SHA. Cursor Automations were not booted. This session sat as Analyst and Engineer because those automations are not configured.

## Why

A repository file lock does not exclude two GitHub Actions runners. An actuator that cannot spawn is not connected. An actuator that spawns before a spend limit and saved automations exist can spend. Passing the click oracle without planting it does not answer whether the specification became software.

## Not decided

The provider spending limit. The fixed `authorizedDispatches` count. Saving the three Cursor Automations. Merging pull request 136. Those remain a person’s actions.
