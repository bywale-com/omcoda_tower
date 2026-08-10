# MODULES-ALIVE — Prototype cohesion

**Product face:** Register prototype / CT (Plant + Ant) — **not Hub**.  
**Initiative:** [`docs/register/PROTOTYPE-COHESION-PLAN.md`](docs/register/PROTOTYPE-COHESION-PLAN.md)  
**Branch:** `cursor/prototype-cohesion-wire-6565`  
**Send:** `SEND_MODE` default **live**

---

## Config libraries (authorship)

| Face | Binding | Status |
|------|---------|--------|
| Automations canvas | `workflow.graph`, triggers, Action `agentRef` | ✓ CT `AntAutomationWorkbench` |
| Automations Runs | `workflow_run` | ✓ |
| Automations Settings | schedule / enrollment / eligibility pipeline | ✓ |
| Agents Editor | `sequence_template.cells` | ✓ Save |
| Agents Settings | `rule_attempt_criteria`, `seq_channel_ownership_order` | ✓ |
| Evaluation packs | pin `reference_version` + ruleset; pathway/motion/field-class enables | ✓ |
| Publish → Bind | shared `packCatalogStore` | ✓ |

## Spine

| Step | Status |
|------|--------|
| Provision → firm/user + OTP invite path | ✓ |
| Authorize book (single handover) | ✓ crmOAuth |
| Bind Active → workflow activate + binding + campaign_states | ✓ |
| Book readiness audit → verdicts / sequence_ready | ✓ |
| Graph walk on event/webhook/manual | ✓ `workflowWalk.ts` |
| Live send on enroll/actuate | ✓ default live |
| Halt / Kill = suppress new enroll+send | ✓ H1 |
| Firm brand one name | ✓ Cedar Pathways (H3) |
| Reference Publish → upsertReference | ✓ |
| Jump to → real setModule | ✓ |

## Deferred (by plan)

- Meta go-live  
- Register & evolution (house tooling)  
- Escrow (stays prototype)

## Prove

```bash
npm run db:migrate && npm run db:seed
npm run verify:automations
# CT: /prototype-ant → Configuration libraries / Provision / Bind / Book
```
