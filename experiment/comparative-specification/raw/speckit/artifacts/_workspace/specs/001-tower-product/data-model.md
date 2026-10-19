# Data Model: Tower Intended Product

Derived from spec Key Entities and `supabase/migrations/` on SHA `c5bd617`. Classification follows table-first law: **state | rule | sequence**. Fields listed are conceptual (business), not a license to invent columns. Stood-up SQL is the column source of truth.

## Tenancy and admission (state)

| Entity | Role | Relationships |
|--------|------|----------------|
| Firm | Tenancy boundary | Has users, contacts, bindings, campaigns |
| User | Consultant or house operator login | Belongs to firm |
| Session / OTP challenge | Passwordless admission | User; unprovisioned email issues no code |
| Access link | Direct invite URL | User; single-use; TTL; re-issue invalidates prior |
| CT firm / sending domain | Wire/send identity | Firm |

Validation: session `firm_id` is the provisioned firm. Dual UUID/TEXT tenancy appears in backlog as a conservative split — do not invent a third id.

## Book and suppression (state)

| Entity | Role |
|--------|------|
| Contact record | Private book person |
| Import batch | Upload instance; Local axis for import events |
| Consent record | Opt-in / silenced / waitlisted |
| Halt record | Firm or contact suppress new enroll+send |
| Contact tag | In-app ascribed tag (e.g. subscribed/not) |
| Contact upload / contact access link | Contact-seat artifacts (later migrations) |

Validation: silenced when not opted in; halt and silence gate send; firm DB auth ≠ consent.

## Reachability (state + rule)

| Entity | Kind | Role |
|--------|------|------|
| Audit run | state | Batch of checks |
| Reachability verdict | state | reachable / partial / unreachable |
| Sequence-ready | state | Enrollment precondition |
| Rule reachability checks | rule | What the audit evaluates |

Must-not: pathway/ROI/sales ceremony as verdict.

## Agents authorship (sequence + rule + state)

| Entity | Kind | Role |
|--------|------|------|
| Sequence template | sequence | Blank canvas of campaigns |
| Firm sequence binding | state | Per-firm template + overrides |
| Campaign | sequence | One objective container |
| Campaign objective | state | Binary completion pursued |
| Campaign channel | sequence | Medium + order |
| Channel variation | state | Attempt-N content |
| Seq channel rules / ownership order / phase order | rule/sequence | Escalation and order as data |
| Seq attempt cycle | rule | Attempt distance / cycles |
| Rule attempt criteria / motion precedence / field class / eligibility / cohort / metrics | rule | Nested like CSS: global / sequence / campaign |
| Rule pack | rule | Versioned evaluation pack |
| Collectible fields | rule | Required-data listing / field class |

Validation: two objectives → two campaigns. Attempt rules not on channel node. Empty world allowed.

## Runtime engagement (state)

| Entity | Role | Transitions |
|--------|------|-------------|
| Enrollment | Contact on a sequence/campaign | cursor = campaign_id |
| Active attempt | In-flight ownership | open → exhausted (stop spend) / inbound-nullified; do not reuse nullified for exhaustion |
| Engagement record | Fired chronology | Append-only; does not author |
| Outbound message | Send in pursuit of objective | Must carry enrollment/campaign/objective/attempt when in sequence |
| Messaging event | Provider open/click/bounce | Feeds criteria and click objectives |
| Campaign failure | Exhaustion event | Global/Local; one event per exhaustion, not tick-spam |
| Campaign state | Armed vs active vs bind | Armed = nothing sending |

## Automations (state + sequence)

| Entity | Kind | Role |
|--------|------|------|
| Workflow | sequence | Blank DAG graph |
| Workflow trigger | state | Event/schedule/manual/webhook; Global vs Local axes |
| Workflow state / target / run | state | Activation and instances |
| Action | state | Agents assign/template or in-app; payload_binding for Local return |
| Event write-set | rule/state | What an event writes (handle shape) |
| Event test data | state | Trigger specimen for Run (must not INSERT live on that control) |
| Wait occupancy | state | Wait node occupancy (migration 024) |

Validation: next node picks from write-set of **that** run. Launch arms; Run walks now.

## Eligibility loop (state + rule)

| Entity | Kind | Role |
|--------|------|------|
| Reference version | state | Versioned IRCC-shaped data |
| Constants pack | rule | Industry constants |
| Eligibility evaluation / result | state | Private to book |
| Signal | state | Every determination including missing |
| Motion decision | state | Engine 2 choice |
| Missing fact signal | state | Detection of gap |
| Fact writeback | state | Collection; Local form_ref / objective axis when pursuing |
| Meeting booked | state | Loop-closer; Local objective axis |

Validation: one client, one motion. Document-dependent never on forms. Immediate re-eval on write-back.

## Activation / commercial (state)

| Entity | Role | Honesty |
|--------|------|---------|
| Prepared workspace | No-login readiness | Capability stands |
| Escrow acceptance | Hard input | Fulfillment / release **unresolved** (U-003) |
| CRM OAuth grant | Book authorize | Shape per practice stack **unresolved** (U-004) |

## Operator panes (state)

| Entity | Role |
|--------|------|
| Register gaps | House evolution notes (not firm-facing product) |
| Audit events | Who/what/when/which firm |
| Primary store rows | Legacy CT bags; not a second catalog for machine objects |

## Relationships (causal, not only FK)

```text
Acquisition seed land → prepared workspace → hard inputs → running
Audit sequence-ready → enrollment
Eligibility / reference / writeback → signals → Engine 2 motion → engagement sequence
Attempt finishing / objective Local write → arm next or escalate (agent | workflow | end)
Exhaustion → campaign_failure (stop outbound, keep listen)
Automations: event/write-set → walk → action → module writes → handle
```
