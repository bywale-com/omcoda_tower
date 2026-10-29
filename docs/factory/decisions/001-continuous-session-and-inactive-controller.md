# 001 — Continuous sessions, inactive controller

**Date:** 2026-10-29  
**Status:** accepted for this factory

## Decision

Investigation and packet writing stay with the Technical Product Architect. Checkpoints every 10–15 minutes do not end the execution. Sixty minutes is the maximum uncheckpointed interval and is an operating policy, not a measured Cursor limit.

The controller is deterministic code plus a GitHub workflow that cannot start from a pull request. Cursor Automations are workers and are not activated in this change. A wake label is a proposal until the label API succeeds. Prose that says “complete” is not a transition.

The first product packet is the email-click rule from PR #135 claim 3. It is eligible and held. Launch Agent waits until a packet has actually passed through an authorized production path.

## Why

Travis packet 009 spent 15 of 18 boots on pull-request no-ops. September blockers 001–004 showed repair loops against Cursor plan limits and missing secrets. Tower PR #135 showed that a specification can continue across sessions; it did not show that ten minutes is the right time to pay for a new agent.

## Not decided

The cheapest session length. The transactional store, if GitHub cannot serialize the actuator. Whether PKT-001 should be released. Those wait on measurement or on the founder.
