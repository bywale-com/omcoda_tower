# FACELESS GAPS CLOSED — connect existing UI to machine tables

**Branch:** `cursor/prototype-cohesion-wire-6565` (PR #65)  
**Product face:** CT prototype (Plant + Ant)  
**Rule:** connect-before-build — no new modules; extend named surfaces  
**Deferred (unchanged):** Escrow · Meta go-live  

---

## Per-table outcome

| Table | Existing UI connected | New-built? | Proof |
|-------|----------------------|------------|-------|
| `fact_writebacks` | Contact forms → `writeBackContactFacts` → `machineApi.writeFact`; Live brief / Meetings hydrate via `hydrateFactsFromMachine` | No | Submit Nudge/Loop-closer/Update facts → row in `fact_writebacks` → cascade re-eval → Board `eligibility_results` / motion; Live brief prefers machine facts |
| `missing_fact_signals` | Same contact submit path (`signalMissingFact` / `missingFieldKeys` on writeFact) | No | Outstanding keys recorded; cleared when answered |
| `eligibility_*` / `signals` / `motion_decisions` | Cascade reused from reference upsert (`runContactEligibilityCascade`) | No | `writeFact` returns cascade; Board `boardDetections` updates |
| `rule_cohort_scoring` | Agents → Settings (`AntAgentWorkbench` AgentSettingsPanel) | No | Toggle/edit `set_value` → `upsertCohortScoring` |
| `rule_metrics_thresholds` | Agents → Settings | No | Toggle + threshold → `upsertMetricsThreshold` |
| `rule_reachability_checks` | Evaluation pack editor (`ConfigurationLibrariesModule`) | No | Enable + params → `upsertReachabilityCheck` |
| `seq_phase_order` | Agents → Settings (reorder like channel order) | No | Up/Down → `upsertPhaseOrder` |
| `rule_field_class_routing` | Evaluation editor (was enable-only) | No | Enable + `setValue` param edit |
| `prepared_workspaces` | Activation & forward-deploy (Plant + Ant) | No | Stage/hydrate → `upsertPreparedWorkspace`; hydrate from `listPreparedWorkspaces` (not `primary_store`) |
| `active_attempts` | Firm health (read-only) | No | In-flight attempts section from `listActiveAttempts` |
| `engagement_records` | Firm health (read-only) | No | Engagement strip from `listEngagementRecords` |

---

## Priority checklist

### P1 — Fact-writeback loop
- **Done.** Contact answer → `fact_writebacks` → immediate re-eval (same cascade as `reference_version`) → Board / Live brief reflect new eligibility. Meetings UI remains the face; data lands on machine tables.

### P2 — Rule-editor faces
- **Done.** Cohort / metrics / phase on Agents Settings; reachability + field-class params on Evaluation editor. Pattern copied from `listAttemptCriteria` / upsert.

### P3 — prepared_workspaces
- **Done.** Forward-deploy persist/hydrate uses `prepared_workspaces` via `machineApi` (Prepared Authorize path stays `crmOAuth`).

### P4 — Firm Health in-flight read
- **Done.** Read-only `active_attempts` + `engagement_records` on Firm Health.

---

## API surface added (this pass)

`POST /machine/fact-writebacks`, `GET` writebacks / missing signals,  
`GET/PUT` cohort-scoring · metrics-thresholds · reachability-checks · phase-order,  
`GET/PUT` prepared-workspaces, `GET` active-attempts · engagement-records.

---

## Explicitly still deferred

- Escrow (`escrow_acceptances` / Commercial)  
- Meta go-live (Acquisition chips only)
