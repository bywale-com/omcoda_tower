# 004 — Manual evidence is a stage, not a dispatch

**Date:** 2026-10-29  
**Status:** accepted for this factory

## Decision

`record_manual_evidence` may move a `draft` packet whose Wake is `hold` and whose dispatch record is empty to `verified`.

It requires the implementation SHA, all nine systems-change sections, and at least one passing check that names a run id. It sets `execution.mode` to `manual`, copies that SHA into `candidateSha` and `verifiedSha`, and leaves `dispatch` null. It does not increment `usedDispatches` and does not propose a wake.

`accept` still requires `reconciled` and a merge SHA. A failed check, a missing section, an empty SHA, a packet that is not `draft`, Wake `sa`, or an existing dispatch record refuses the event and leaves the stage unchanged.

A verification that passes after an acknowledged dispatch sets `execution.mode` to `automatic`. That path is not this event.

## Why

PKT-001 was implemented and verified in a seated session. The ledger still said `draft`, which described the packet as if the plant had not happened. Recording the stage without writing a dispatch record keeps the manual run and the automatic run distinct, and keeps integration for a real merge.

## Not decided

Merging pull request 136. The fixed `authorizedDispatches` count. Saving the Cursor Automations. A provider spending limit.
