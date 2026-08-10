# SCHEMA REPORT — machine tables materialization

**Migration:** `supabase/migrations/004_machine_tables.sql`  
**Seed:** `supabase/seeds/002_machine_tables.sql` (manifest id `002_machine_tables`)  
**Types:** `src/app/wire/machineTypes.ts`

## Tables created (NEW)

| Table | Kind | RLS | Notes |
|---|---|---|---|
| `workflow` | state | firm_isolation | Automations object |
| `workflow_state` | state | *(via workflow FK)* | draft \| active \| paused |
| `workflow_target` | state | *(via workflow FK)* | audit \| contact \| import \| client |
| `workflow_run` | state | firm_isolation | Run log + node_status/counts jsonb |
| `action` | state | via_workflow | v1 `call_agent` only (no firm_id; RLS via workflow join) |
| `enrollment` | state | firm_isolation | Sequence entry record |
| `sequence_template` | template | none (platform) | Cells jsonb |
| `firm_sequence_binding` | binding | firm_isolation | firm → template |
| `rule_attempt_criteria` | rule | none (platform defaults; firm_id nullable) | 30/24/24 + SMS non-reply |
| `rule_motion_precedence` | rule | none | Engine-2 mp-1…mp-5 |
| `rule_field_class_routing` | rule | none | Scaffold |
| `rule_reachability_checks` | rule | none | Audit checks |
| `rule_eligibility_pathway` | rule | none | any-pathway |
| `rule_cohort_scoring` | rule | none | Cohort tiers |
| `rule_metrics_thresholds` | rule | none | Metrics flags |
| `seq_channel_ownership_order` | sequence | none | `[text,email,form]` |
| `seq_phase_order` | sequence | none | optin → nudge → reactivation |
| `seq_eligibility_pipeline` | sequence | none | Pipeline stages |
| `contact_records` | state | firm_isolation | Living contact rows |
| `reachability_verdicts` | state | firm_isolation | Audit output |
| `sequence_ready` | state | firm_isolation | Ready for enroll |
| `campaign_states` | state | firm_isolation | armed / running |
| `cohort_tiers` | state | firm_isolation | |
| `metrics_flags` | state | firm_isolation | |
| `reference_versions` | state (versioned) | none (platform/firm nullable) | Faceless trigger source |
| `constants_packs` | state (versioned) | none | |
| `eligibility_evaluations` | state | firm_isolation | |
| `eligibility_results` | state | firm_isolation | Board detection source |
| `signals` | state | firm_isolation | |
| `motion_decisions` | state | firm_isolation | nudge \| reactivation \| none |
| `active_attempts` | state | firm_isolation | |
| `engagement_records` | state | firm_isolation | |
| `fact_writebacks` | state | firm_isolation | |
| `missing_fact_signals` | state | firm_isolation | |
| `audit_runs` | state | firm_isolation | Phase 1 append |
| `sequence_definitions` | state | firm_isolation | |
| `prepared_workspaces` | state | firm_isolation | Thin |
| `escrow_acceptances` | state | firm_isolation | Thin |

## Extended (not recreated)

| Table | Change |
|---|---|
| `consent_records` | `status` column: unsequenced \| **waitlisted** \| sequenced \| silenced |

## Already-in-Postgres (unchanged)

`firms`, `users`, `otp_*`, `sessions`, `applied_seeds`, `ct_firms`, `halt_records`, `crm_oauth_grants`, `audit_events`, `primary_store_rows`, `outbound_messages`, `messaging_events`, `provider_webhook_receipts`, `sending_domains`.

## RLS policy pattern

Firm-scoped tables enable RLS with policy `{table}_firm_isolation`:

```sql
USING (firm_id = COALESCE(
  current_setting('request.jwt.claims', true)::jsonb->>'firm_id',
  firm_id
))
WITH CHECK (true)
```

Service-role / direct `pg` pool from the wire service bypasses JWT; app-layer firm_id is still required on writes. Matches the intent of `001_auth_tables.sql` isolation without breaking the CT TEXT firm_id path (`firm-cedar`).

## Seed rows loaded (`002_machine_tables`)

| Domain | Rows |
|---|---|
| Channel order | text, email, form |
| Phase order | optin, reengagement, reactivation |
| Eligibility pipeline | trigger → constants → conditions → rules → output |
| Attempt criteria | 30 min text / 24h email / 24h form + SMS non-reply |
| Motion precedence | mp-1…mp-5 |
| Reachability checks | 7 Seed §5.2 checks |
| Eligibility pathway | any_pathway_pass |
| Cohort + metrics | guidelines-derived |
| Templates | optin_launch, launch_day, reactivation, reengagement |
| Bindings | `firm-cedar` → all four templates |
| Campaign | `firm-cedar` → `running` |
| Reference | `crs_cutoff` v1 payload `{cutoff:480}` |

## Wire mount

`/wire/machine/*` — see `server/wire-service/routes.ts` + `machine.ts`.
