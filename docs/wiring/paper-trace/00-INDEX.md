# Paper pass — capability → CTO Wiring trace (steps 1–4)

**Status:** Steps 1–4 complete on paper. **Stop here.** No canvas, no labels (5), no design (6), no CT plant/build (7).  
**Binding:** [`../WIRING-METHOD.md`](../WIRING-METHOD.md) · [`../NODE-DEFINITION.md`](../NODE-DEFINITION.md) · [`../../sme/DOCTRINE-sme-cto-implementation.md`](../../sme/DOCTRINE-sme-cto-implementation.md) · [`../CTO-THINK-STACK.md`](../CTO-THINK-STACK.md)  
**Inputs:** [`../../sme/capability/`](../../sme/capability/) C1–C7 (158 items)

| Step | Artifact | Result |
|---|---|---|
| 1 — Implementations | [`01-STEP1-STATUS.md`](./01-STEP1-STATUS.md) | Complete; deferred/blocked noted |
| 2 — Function traces | [`function/`](./function/) C1–C7 | Per-implementation event paths (paper graph) |
| 2 — Fusion key | [`CANONICAL-NODES.md`](./CANONICAL-NODES.md) | ~111 fused nodes + existence buckets |
| 3 — Can'ts + Furnish | [`CANTS-AND-FURNISH.md`](./CANTS-AND-FURNISH.md) | 36 Can'ts · 12 Furnish ops nodes |
| 4 — Human-provisioning set | [`HUMAN-PROVISIONING-SET.md`](./HUMAN-PROVISIONING-SET.md) | 19 human/mixed nodes = onboarding backlog |

**Grammar (Function edges):** `When {event} occurs at {Node A}, {change} occurs at {Node B}.` + optional `[non-structural · constraints]`.

## Two primary outputs

1. **Paper graph** — union of traced walks in [`function/`](./function/), fused via [`CANONICAL-NODES.md`](./CANONICAL-NODES.md).  
2. **Human-provisioning node set** — [`HUMAN-PROVISIONING-SET.md`](./HUMAN-PROVISIONING-SET.md) (dependency stated once per node; inherited wherever the node appears).

## Working-set caveats (do not block)

- `ingest-21`, `ingest-22` — DEFERRED (KU #7); not in V1 topology  
- `escmech-20` — BLOCKED (counsel); `counsel_gate` is stop, not clearance  
- Roster completeness deferred to founder; missing-seat one-liners in Can'ts file

**Draft only (intermediate):** [`_NODE-UNION-DRAFT.md`](./_NODE-UNION-DRAFT.md) — superseded by CANONICAL-NODES for authority.
