# MODULES-ALIVE — Prototype cohesion

**Product face:** Register prototype / CT (Plant + Ant) — **not Hub**.  
**Initiative:** [`docs/register/PROTOTYPE-COHESION-PLAN.md`](docs/register/PROTOTYPE-COHESION-PLAN.md)  
**Branch:** `cursor/prototype-cohesion-wire-6565`  
**Send:** `SEND_MODE` default **live**  
**Done contract:** Full §Capabilities on one wire — except Meta / Register & evolution / Escrow.

---

## Config libraries (authorship)

| Face | Binding | Status |
|------|---------|--------|
| Automations canvas | `workflow.graph`, triggers, Action `agentRef` | ✓ CT Ant + Plant Hub canvas |
| Automations Runs | `workflow_run` | ✓ |
| Automations Settings | schedule / enrollment / eligibility pipeline | ✓ Ant |
| Agents Editor | `sequence_template.cells` | ✓ Save |
| Agents Settings | `rule_attempt_criteria`, `seq_channel_ownership_order` | ✓ Ant |
| Evaluation packs | pin `reference_version` + ruleset; pathway/motion/field-class | ✓ Ant editor; Plant Publish → pin |
| Publish → Bind | shared `packCatalogStore` (Plant + Ant) | ✓ |

## Spine

| Step | Status |
|------|--------|
| Provision → firm/user + OTP invite path | ✓ |
| Authorize book (single handover) | ✓ crmOAuth |
| Confirm book for Tower (= Authorize alias) | ✓ Ant Contacts |
| Bind Active → workflow activate + binding + campaign_states | ✓ Ant + Plant |
| Book readiness audit + CSV upload → verdicts | ✓ |
| Graph walk on event/webhook/manual | ✓ `workflowWalk.ts` |
| Live send on enroll/actuate | ✓ default live |
| Halt / Kill = suppress new enroll+send | ✓ H1 |
| Firm brand one name | ✓ Cedar Pathways (H3) |
| Reference Publish → upsertReference | ✓ |
| Jump to → real setModule | ✓ |
| Consent / Silence → consentSilence | ✓ |
| Booking → Meetings → Live brief | ✓ `meetingsStore` |
| Contact form write-backs → Live brief facts | ✓ |
| Board inhabit → boardDetections | ✓ Plant BoardPanel + Ant Board |
| Activation checklist ← forward_deploy + campaign | ✓ |
| Audit trail ← auditTrail | ✓ |
| Oversight / Firm health ← machine reads | ✓ |
| Acquisition campaigns ← primaryStore | ✓ (Meta go-live deferred) |
| Support Resolve ← primaryStore + auditTrail | ✓ |
| Forward-deploy staging ← primaryStore | ✓ |

## Deferred (by plan)

- Meta go-live  
- Register & evolution (house tooling)  
- Escrow (stays prototype)

## Prove

```bash
npm run db:migrate && npm run db:seed
npm run verify:automations
# CT: /prototype-ant → Configuration libraries / Provision / Bind / Book
# Plant: Operator → Bind Active / Config Publish / Support Resolve
```
