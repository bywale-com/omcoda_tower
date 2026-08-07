# CTO pass — External systems from Think Stack (Pass A)

**Audience:** CTO  
**Status:** Active  
**Not PM densify work.** Densify stops at the app edge by law. This pass is CTO accomplishment reasoning.

## Job

Using the **Think Stack**, determine how every densified implementation / How leaf / CT-critical commit gets accomplished. From those accomplishment paths, derive the **external systems** required. Then mark each as:

| Tag | Meaning |
|---|---|
| `modelable` | Can build an in-app stand-in (fake system) with the right I/O before the real external exists |
| `human-only` | Irreducible human / real-world residue (firm DNS, TCR filing, real money, counsel) — model only the in-app side of the contract. Each row gets a named **fixture** (marker that a human performed the real act) and a **`humanKind`**: `by-design` (governance; never automate) or `by-provisioning` (one-time logistics backlog). See [`HUMAN-ONLY.md`](./HUMAN-ONLY.md). |
| `defer` | Not in V1 CT / not named enough yet (e.g. SMS send if undensified) |

**Do not wire the app in this pass.** Inventory + model contracts only. Build comes after.

**Hand-back framing (does not contradict Pass A):** [`HUMAN-ONLY.md`](./HUMAN-ONLY.md) — full human-only table, fixture catalog, and the per-firm **sending-identity onboarding runbook** (DNS auth → return-path/PTR → Postmaster/FBL → TCR / Meta Business).

## Inputs

- Think Stack facets: [`../CTO-THINK-STACK.md`](../CTO-THINK-STACK.md)
- Capability + practice densified implementations: `docs/sme/implementation/`, `docs/sme/capability/`, theory twins
- How leaves: `docs/register/how/`
- Paper Function traces: `docs/wiring/paper-trace/`
- CT plant + Ant: `src/app/register/prototype/`, `prototype-ant/`
- Human-provisioning set: `docs/wiring/paper-trace/HUMAN-PROVISIONING-SET.md`
- Stand-in method (downstream): [`../STANDIN-WIRING.md`](../STANDIN-WIRING.md)

## Method (CTO)

1. Sweep Think Stack facets against what must be true for Core outcomes.  
2. For each accomplishment path that leaves Tower process / needs a non-Tower system → name the **external system**.  
3. Deduplicate into a canonical externals list.  
4. For each external: state **why** (which accomplishments), **facet**, **model tag**, **model contract** (inputs / outputs / state readers) if modelable or human-only in-app side.  
5. Do not invent How leaves. Do not build stand-in code here.

## Outputs

- [`00-INDEX.md`](./00-INDEX.md) — canonical external systems + counts by tag  
- Zone/facet files as needed  
- [`HUMAN-ONLY.md`](./HUMAN-ONLY.md) — human-only duality: `humanKind` · `fixture` · sending-identity runbook  
- Optional: proposed stand-in module names for Pass B
