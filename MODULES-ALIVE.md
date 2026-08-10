# MODULES-ALIVE — Automations + Agents

Proof that Automations and Agents bind to real machine tables and that the runtime **walks the saved graph** (validated shape), not a fixed cascade path.

**Branch:** `cursor/automations-agents-alive-6565`  
**Shape (v1):** `Trigger → Constants → Conditions/Branch → Rules → Action → Exit`  
**Engine:** `server/wire-service/workflowWalk.ts` reusing `enrollAndActuate` from `cascade.ts`  
**Send gate:** `SEND_MODE=dry_run` default

---

## Move 1 — Node config ↔ tables

| Node | Editable field | Backing | Status |
|------|----------------|---------|--------|
| Trigger (event) | `triggerEvent` (`eligibility.changed`, `audit.completed`, …) | `workflow_trigger` `{type:event, event_name, condition}` | ✓ |
| Trigger (schedule) | `scheduleCron` | `workflow_trigger` `{type:schedule, schedule}` | ✓ |
| Trigger (manual) | enrollment scopes | `workflow_trigger` `{type:manual}` + run payload | ✓ |
| Trigger (webhook) | `webhookId` | `workflow_trigger` `{type:webhook, webhook_id}` | ✓ |
| Constant | `constantsPackId` / `constantSummary` | `constants_packs` | ✓ |
| Branch / If | condition / `filterSummary` | graph JSON + walk branch handle | ✓ |
| Rule | `ruleConfig` / pathway pack | `rule.eligibility_pathway` (+ pack UI) | ✓ |
| Action | `agentRef` | `action` `{type:call_agent, agent_ref}` → `firm_sequence_binding` | ✓ |
| Exit | terminal | — | ✓ |
| Workflow save | full `nodes`+`edges`+per-node data | `workflow.graph` jsonb | ✓ |

Activate materializes `workflow_trigger` rows from the Trigger node(s) in the saved graph.

---

## Move 2 — Runtime walks saved graph

| Path | Mechanism | Status |
|------|-----------|--------|
| Event fire | Machine writes emit `eligibility.changed` / onboarding uses `audit.completed` → `dispatchEventToWorkflows` | ✓ |
| Webhook fire | `POST /wire/hook/:webhookId` | ✓ |
| Schedule fire | Worker `tickOnce` → `dispatchScheduleTriggers` | ✓ |
| Manual fire | Run button → `POST …/runs` → `walkValidatedWorkflow` (no client fake timer) | ✓ |
| Action | Resolves `agent_ref` via `firm_sequence_binding`, creates `enrollment` (dry-run send) | ✓ |
| Record | `workflow_run` + `node_status` per node | ✓ |

---

## Three canonical workflows

| Workflow | Id | Draws | Runs |
|----------|----|-------|------|
| New firm → opt-in launch | `wf-optin-launch` | ✓ Trigger(`audit.completed`) → Rule → Action(`tpl.optin_launch.v1`) → Exit | ✓ (manual / onboarding event) |
| Eligibility changed → reactivation | `wf-eligibility-reactivation` | ✓ Trigger(`eligibility.changed`) → Branch → Action(`tpl.reactivation.v1`) → Exit | ✓ (reference upsert / event bus) |
| External change (webhook) → re-evaluate | `wf-webhook-reeval` | ✓ Trigger(webhook `wh_crs_external_v1`) → Constant → Rule → Action → Exit | ✓ (`POST /wire/hook/wh_crs_external_v1`) |

Seed: `supabase/seeds/003_canonical_workflows.sql`  
Verify: `npx tsx --env-file=.env scripts/verify-automations-alive.ts`

---

## Agents module

| Surface | Table | Status |
|---------|-------|--------|
| Edit sequence steps + Save | `sequence_template.cells` (ordered) | ✓ |
| Assign template to firm (on Save) | `firm_sequence_binding` | ✓ |
| Hub Agents open (non-prototype) | `AgentDetailView` → `AgentEditor` | ✓ |
| Action calling agent | Walk uses edited template via binding | ✓ |

Agent map: `agent-intake`→`tpl.optin_launch.v1`, `agent-nudge`→`tpl.reengagement.v1`, `agent-reactivation`→`tpl.reactivation.v1`.

---

## Human proof (workflow #2)

1. `npm run db:migrate` (includes `006_workflow_trigger.sql`) + `npm run db:seed`
2. `npm run dev:auth` + `npm run dev` (`VITE_WIRE_REAL=true`)
3. Hub → Automations → **Eligibility changed → reactivation**
4. Edit Trigger / Branch / Action (`agentRef=tpl.reactivation.v1`) → graph persists to `workflow`
5. **Activate** → `workflow_trigger` row for `eligibility.changed`
6. Fire via reference edit (`POST /wire/machine/reference`) or Runs → Manual run
7. Runs tab shows `workflow_run` with per-node status; `enrollment` rows for the walked Action

Free-form arbitrary graph walk → see `V2-BACKLOG.md`.
