# 006 — Assignments, continuation, and engineer-slot recovery

**Date:** 2026-10-30
**Status:** accepted for this factory. The scope stays suspended.

## Decision

An initiative is the capability. A packet is one accountable change. An assignment is what the controller schedules, and it may name several packets. An execution is one Cursor run of that assignment. The run is `dispatched`, then `started`, `running`, and then `completed`, `failed`, `refused`, or `interrupted`.

A checkpoint does not end an Architect execution and does not spend a dispatch. When the execution does end, the controller resumes that agent with `POST https://api.cursor.com/v1/agents/{id}/runs` only when the ledger has the agent id, `CURSOR_API_KEY` is set, the factory is armed, the context is not saturated, and that agent has fewer than four stored runs. A GitHub label starts a new Automation. It does not resume an agent id. The published run object reports `durationMs` after the run ends and can end `EXPIRED`. This repository does not treat that as a known minute cap. Sixty minutes without a checkpoint stays an operating policy.

An Analyst assignment batches packets the Architect linked by contract, dependency, component, runtime, or implementation boundary. Adjacent ids are not a link. One execution can sign several systems-change specifications. Each packet keeps its own revision, nine sections, and history. A packet whose sibling is not eligible is dispatched alone. The controller does not wait to fill a bundle.

An engineer dispatch reserves the slot until its reservation ends, the worker acknowledges a start, or a lease is live. A refused, expired, or abandoned engineer leaves the slot. History stays. The spend is not refunded for an engineer reservation that expired. An analyst reservation that expired before a start is refunded, which is the same rule as an absent analyst reconcile. A candidate SHA is kept. Verification of that SHA is a separate record and is not invented.

When the engineering queue is two or more packets in `change_specified`, `engineering`, `candidate`, or `verifying`, the controller does not launch another Architect and does not treat another release as clear. It still wakes an Analyst or an Engineer for work that is already released. Useful investigation that is already running is not stopped by that hold.

## Why

Architect journals 004–013 each released one packet and stopped. The prompt told the Architect to stop and wait for a new label. T46 treated that stop as the end of the execution. Each label pulse starts a new Cursor Automation. The sessions were ending because the factory asked them to end.

PKT-003 stayed in the engineer slot because `dispatchedEngineerRevision` was treated as occupancy with no clock. The dispatch was recorded at 2026-10-30 06:38 AM America/Toronto. No start and no lease followed. PKT-002 is `candidate` at `3246a074efecd8adb98e4ca232d443b90821173f`. Its engineer dispatch was still open. No GitHub check run exists for that SHA, so `verifiedSha` stays null. Recovery closes the engineer execution as `candidate_recorded` and refuses PKT-003 as `reservation_expired`. `usedDispatches` stays 31. `authorizedDispatches` stays 50.

Sibling links on the manifests and the ledger are taken from `firing-pointers`, `walk-handle`, and the dependency sentences already written in PKT-015 through PKT-019. They were not recorded as siblings while those sessions were stopping after each packet. The prompt now requires the Architect to record them at release.

## Not decided

A live Architect → Analyst → Engineer → verify → integrate → accept run after this repair. The scope stays suspended until that path is real. No usage dollar is stored. PKT-002 is not verified.
