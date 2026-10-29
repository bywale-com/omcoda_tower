# 005 — Scope authorization selects the next initiative

**Date:** 2026-10-29  
**Status:** accepted for this factory

## Decision

The founder authorizes a scope: an id, the module names inside it, and a positive `authorizedDispatches` count. The controller then selects the eligible initiative with the lowest priority, then the lowest id, whose dependencies are `completed`.

An ordinary Architect session ending bumps the revision and proposes `factory-wake-architect` again. It does not complete the initiative. A released packet inside the active scope is eligible for `factory-wake-sa` without a per-packet Wake edit by the founder. `markReleased` still requires every release gate and refuses `execution: "manual"`.

When an initiative’s packets are `accepted` and `coverageComplete` is true, the next control pass selects the next eligible initiative. No second scope authorization is required. A module with no initiatives, or with coverage still open, is not complete.

`suspend`, a founder decision, an external blocker, a completed scope, and an exhausted dispatch count propose no wake.

## Why

PKT-001 showed specification-to-implementation with a person sitting both seats. The missing machine was the one that chooses the next initiative and continues the Architect without a pasted prompt.

## Not decided

Saving the Cursor Automations. Setting the GitHub secret and variables. The integer the founder puts in the first `authorize` run. Merging pull request 136. A provider spending limit, which is set in the Cursor dashboard and is not an API this factory calls.
