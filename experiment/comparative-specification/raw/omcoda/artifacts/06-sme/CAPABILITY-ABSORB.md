# Pass 6b — Capability SME absorb (adds product that practice could not see)

**Method:** `docs/sme/DOCTRINE-sme-cto-implementation.md` §1–§3 · `docs/sme/capability/00-ROSTER.md` · `docs/sme/capability/CAPABILITY-CONSIDERATIONS.md`  
**In-repo status:** Capability paper done; **Register absorb not started** (`capability/00-ROSTER.md` last line).  
**This experiment’s job:** fold the revealed surfaces into the intended-product specification as **additions**, tagged exists / partial / new, without pretending they were in Seed as modules.

Capability *adds*. Compliance *modifies*. A proficient generalist CTO does not own these depths by default — they are not “CTO handles it.”

## Revealed homes (must appear in the intended product)

| Id | Capability | Revealed home | Status vs register |
|---|---|---|---|
| C1 | Email/SMS deliverability | Operator house-global **Sending infrastructure** + suppression model consulted by send gates | **new** (from-address strategy partial) |
| C2 | Agentic engagement runtime | Attempt/channel state machine (partial, documented) + **Conversations / reply-triage** + human-in-loop escalation into support | **new** / runtime **partial** |
| C3 | Eligibility + reference pipeline | Ingestion + version-diff + re-eval on write-back + freshness flags | pipeline **new**; module shell exists |
| C4 | Book ingestion / identity | Field→Q-ID mapping, dedup, validation-class checks | **partial** / incremental CRM **deferred** (KU #7) |
| C5 | Forward-deploy generation | Public-facts enrichment + template hydration + no-login token + branding extraction | generator **new**; Prepared Workspace surface **partial** |
| C6 | Escrow mechanics | Escrow ledger + outcome-verified release | ledger **new**; release **partial**; money-transmitter **BLOCKED (counsel)** |
| C7 | Instrumentation | Event ingestion + metrics store + deliverability telemetry | **new** (dashboards as shells) |

## Highest-leverage connective tissue (C1 ∩ C2 ∩ C7)

A send fires → deliverability telemetry → reply capture → runtime decision → metric. That **messaging event stream** is named as not existing yet in the capability roster. Intended product requires it. Surface intent for the stream itself is `none` until Oversight / Firm health / Conversations **view** it.

## How this folds without minting World parties

| Addition | Lands on existing World/Persona surface |
|---|---|
| Sending infrastructure | House-global (operator) — personas already folded deliverability into bind + health; capability says that collapse **under-specified the specialty**. Fold as its own module under house-global, not a new persona. |
| Conversations / reply-triage | Operator — distinct from read-only Engagement record (World §3.2 still holds: record is not the brain). |
| Reference ingestion | Operator · Reference data (shell exists). |
| Forward-deploy generator | Operator · Activation & forward-deploy (surface exists; generator does not). |
| Escrow ledger | Operator · Commercial (surface exists). |
| Event/metrics pipeline | Feeds Oversight / Firm health / Acquisition instrumentation (shells exist). |
| Suppression model | Consulted by Firm operations bind · Send gates (no new persona). |

## Agent-codeable vs human residue (`AGENT-VS-HUMAN-PROVISIONING.md`)

Every technical handoff splits:

- **Agent-codeable:** wire Resend/Twilio, consult suppression, enqueue re-eval, hydrate templates from stored public facts.
- **Human-provisioning residue (true per-firm onboarding cost):** DNS for branded sending domains, escrow account setup, CRM OAuth grant at a real practice, Meta ad account, counsel on transmitter boundary.

Residue must not vanish into “CTO handles it.” It is activation/ops cost, not a Seed click-budget item.

## Register absorb status (honest)

This specification **does** fold the additions into the intended product (method: fold before build). The in-repo How trees / Outcomes files at this SHA have **not** all been rewritten to name Sending infrastructure / Conversations. That is a named remaining Register-absorb job, not a reason to omit the additions from “intended.”

Capability Pass1 depth (warmup schedules, DMARC alignment numbers, dedup thresholds) is **not** required to specify that those homes exist. Unfilled numeric practice is KU / specialist paper, not a founder-only gate — except C6 counsel block.
