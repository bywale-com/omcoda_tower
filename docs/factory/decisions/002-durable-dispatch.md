# 002 — Durable dispatch, before any worker

**Date:** 2026-10-29  
**Status:** accepted for this factory

## Decision

The pure state machine stays pure. A dispatch adapter loads the ledger, holds an exclusive lock, and compare-and-swaps on `stateRevision`.

A worker lease is admitted only for the stage that role owns. An expired lease cannot sign a change or commit a candidate.

A wake is stored only after the label actuator succeeds, and the stored record names the packet id, revision, and pull-request head. Workers match that record. They do not treat the previous commit as authorization.

`verified` is not `accepted`. The path is `integration_authorized`, then `integrated` with a merge SHA, then `reconciled`, then `accepted`.

`authorizedDispatches: null` does not mean unlimited. Illustrative dollars do not grant a wake. `FACTORY_CONTROLLER` stays unset. Decision 003 connects the label command and keeps it disarmed, and moves live compare-and-swap onto the Contents API blob sha.

Checkpoint intervals remain worker instructions. No timer enforces them.

## Why

The first cut could decide a transition and could not commit one. A lease could be taken by the wrong role. A passing SHA could be called acceptance. A worker gate that looked at `HEAD~1` could miss a valid release or accept a stale one.

## Not decided

Saving the Cursor Automations. The fixed run count for a live worker pilot. A provider spending limit. Those wait for a person. The label spawn itself is decision 003.
