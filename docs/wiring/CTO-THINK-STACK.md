# CTO Think Stack — Wiring operating doc

**Parent doctrine:** [`../sme/DOCTRINE-sme-cto-implementation.md`](../sme/DOCTRINE-sme-cto-implementation.md) §7  
**Audience:** CTO / technical column  
**Status:** Method standing; **Tower instance not yet run** (outstanding artifact)  
**Exemplar (hq):** `omcoda-hq` `register-manual/templates/EXEMPLAR-cto-think-stack.md`  
**Companions:** [`WIRING-METHOD.md`](./WIRING-METHOD.md) · [`NODE-DEFINITION.md`](./NODE-DEFINITION.md)

---

## Principle

The **CTO Think Stack** is the CTO's standing facet checklist — the fixed technical domains swept so nothing backend is forgotten. It is the CTO's equivalent of "the personas": the list you decompose against.

**Facets:**

1. Core Application & Runtime  
2. Data Storage & Management  
3. External Systems  
4. Identity / Security / Compliance  
5. Infrastructure & Operations  
6. Cost / FinOps  

It runs the **same three-pass mechanic as Register**, mirrored onto Wiring:

| Pass | Ask |
|---|---|
| **Wiring Function** | For the Core outcomes to be true, what must exist across the facets (integrations, state machines, jobs, schemas)? |
| **Wiring Enrichment (Can'ts)** | Given that exists, what can it still *not* do under stress / failure / jurisdiction / audit? |
| **Wiring Furnishing** | What supporting ops modules make it inhabited (job health, dead-letter replay, cost glances) without changing Core Function? |

---

## Origin (failure prevented)

The Think Stack expects a handoff rich in **capability**. Tower's first SME pass handed it mostly compliance, so its facets had thin input — deliverability had nowhere to land but "we use Resend." The capability pass fills the handoff the Think Stack was always designed to consume. The Tower CTO Think Stack was never instantiated; running it for Tower is the outstanding artifact.

---

## Relation to the capability pass

The capability SME pass is the **input** to the Think Stack, not a competitor to it. Capability considerations land on the Think Stack's facets, for example:

| Capability (Tower) | Facet landing |
|---|---|
| Deliverability / sending infra | External Systems + Infra |
| Event / metrics stream | Data Storage |
| Escrow ledger / release | External Systems |
| Agentic engagement runtime | Core Application & Runtime |
| Reference-data ingestion | Data Storage + External Systems |

The Think Stack then runs Function → Can'ts → Furnish over those facets to produce the actual Wiring.

**Governing rule:** Wiring runs from the same SME handoff as PM work; cross-cutting findings are reconciled before either side goes deep (`Handoff: pm | both | cto`).

---

## How this pass is run (Tower)

1. **Inputs:** practice SME handoff + [`../sme/capability/`](../sme/capability/) capability considerations (when absorbed) · outcomes / How leaves tagged `new` / wrong-seat.  
2. **Router:** CTO as technical Engagement Manager (capability axis) — already papered in capability roster.  
3. **Builder:** Trace implementations per [`WIRING-METHOD.md`](./WIRING-METHOD.md); nodes per [`NODE-DEFINITION.md`](./NODE-DEFINITION.md).  
4. **Tag builds:** `agent-codeable` vs `human-provisioning` (doctrine §4).  
5. **Outputs:** Wiring Function graph · Can'ts on edges · Furnish ops modules · canonical node list (written-as-discovered).

**Empty for Tower:** instantiate this Think Stack (facet sheets + traced walks) — do not invent UI arrangement here; stay in event/state language.

---

## Cross-links

- [`../sme/DOCTRINE-sme-cto-implementation.md`](../sme/DOCTRINE-sme-cto-implementation.md) §1 (two axes), §3 (additive → early Wiring), §4 (agent vs human), §9 (two columns)
- [`WIRING-METHOD.md`](./WIRING-METHOD.md) — connect first, classify later
- [`NODE-DEFINITION.md`](./NODE-DEFINITION.md) — altitude of a node
- [`../sme/SURFACE-INTENT.md`](../sme/SURFACE-INTENT.md) — when a CTO item earns a view face, round-trip to PM
