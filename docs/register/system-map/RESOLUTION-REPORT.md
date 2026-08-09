# System Map — resolution report

**Artifact:** Interactive System Map at `/system-map`  
**Data:** `src/app/system-map/data/*`  
**Skeleton:** [`../SYSTEMS-REQUIREMENTS-FILLED.md`](../SYSTEMS-REQUIREMENTS-FILLED.md)  
**Build law:** [`BUILD-interactive-system-map.md`](./BUILD-interactive-system-map.md)

## Counts

| Metric | Value |
|---|---|
| Nodes | 43 |
| Edges | 34 |
| Sub-maps (fractal interiors) | 4 (`active_attempt`, `motion_decision`, `eligibility_evaluation`, `reachability_verdict`) |
| Faceless ★ | ~18 (incl. `reference_version` ★★) |

## Corpus-full (rules pulled inside the node)

Includes, as required by the build instruction:

- **`active_attempt`** — Text→Email→Form forward-only; 30 min / 24 h / 24 h thresholds; local retries; form-visit override; form-submit closes & arms next. Thresholds are **mechanism**, not metadata (OPERATOR-REVISIONS §5b treated as corpus-concrete surrounding markdown).
- **`motion_decision`** — full Engine 2 precedence ladder (5 rules), editable in sim.
- **`eligibility_evaluation`** — Trigger→Constants→Conditions→Rules shape; any-pathway; open-box; must-not public cold-detect.
- **`reference_version`** — faceless first-class move; no-deploy; re-eval every affected contact.
- **`reachability_verdict`** — full check set + must-nots.
- **`consent_state`**, **`field_class_routing`**, **`campaign_state` / escrow**, **`meeting_booked` / `pending_capture` / `live_brief`**, **tenancy/OTP** — as specified.

## Named-silent (corpus gap carried — not invented)

| Node | Why named-silent |
|---|---|
| `database_authorization` | Concrete shape of auth per practice stack open (Seed §13.2) |
| `escrow_terms` | Release trigger undefined (Seed §13.1) |
| `session` | Expiry as faceless trigger unspecified |
| `contact_record` | Import→living-list incomplete; CRM sync open |
| `consent_state` | CASL/SMS regimes by geography open (rules that *are* specified still carried) |
| `eligibility_evaluation` | Ops/Actions stubs; event-trigger set; Rules UI; persistence |
| `motion_decision` | **reactivation-worthy** criteria undefined; D-01/D-02 |
| `meeting_booked` | Escrow-release adjacency; D-01 placement |

## How to verify

1. `npm run dev` → open `/system-map`
2. Fire **reference_version move ★★** — cascade should light eligibility → result → signal → motion → attempt
3. Select `active_attempt` → open interior → change 30→15 on Text wait → edge labels update
4. Coverage panel should report **no bugs** (every ★ has a non-UI origin)

## What this is not

No component/control/pane language. No live Tower sends/DB. Causation simulation only.
