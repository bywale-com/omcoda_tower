# External systems — CTO Think Stack Pass A

**Status:** Pass A filed (inventory + model tags — no app build)  
**Brief:** [`00-PASS-BRIEF.md`](./00-PASS-BRIEF.md)  
**Human-only framing (hand-back):** [`HUMAN-ONLY.md`](./HUMAN-ONLY.md) — `humanKind` · `fixture` · sending-identity runbook  
**Method:** CTO Think Stack against densified implementations / How / CT / paper traces. Densify stops at the app; this pass derives externals from **accomplishment**.

**Downstream (Pass B):** build modelable stand-ins → wire CT against those contracts (see stand-in wiring method when active).

## Totals (deduped)

| Tag | Count | Meaning |
|---|---|---|
| `modelable` | **47** | In-app stand-in can fake the I/O before the real external exists |
| `human-only` | **15** | Irreducible human / real-world residue — model in-app contract side only; each has a named **fixture** and `humanKind` (`by-design` \| `by-provisioning`) — see [`HUMAN-ONLY.md`](./HUMAN-ONLY.md) |
| `defer` | **5** | Not V1 / not densified enough yet |
| **Total** | **67** | |

### Human-only split (framing — does not change Pass A tags)

| humanKind | Count | Meaning |
|---|---|---|
| `by-design` | **5** | Governance; never automate (halt, counsel, OAuth grant, …) |
| `by-provisioning` | **10** | One-time logistics backlog (DNS cluster, TCR, Postmaster, Meta Business, payment identity, …) |

**Sending-identity onboarding runbook** (one per-firm sequence): DNS auth (SPF→DKIM→DMARC) → return-path/PTR → reputation enrollment (Postmaster/FBL) → registration/verification (TCR, Meta Business). Members + fixtures in [`HUMAN-ONLY.md`](./HUMAN-ONLY.md).

## Files

| File | Scope | Count |
|---|---|---|
| [`01-runtime-and-engagement.md`](./01-runtime-and-engagement.md) | Core runtime, send gates, Automations/Agents, halt/suppression, escalation | 20 |
| [`02-send-enrich-ads.md`](./02-send-enrich-ads.md) | ESP/DNS/warmup, crawl/enrich, Meta ads | 23 |
| [`03-data-identity-money.md`](./03-data-identity-money.md) | Durable store, imports, validators, escrow, auth, reference, metrics | 24 |
| [`HUMAN-ONLY.md`](./HUMAN-ONLY.md) | All human-only rows: fixture · humanKind · sending-identity runbook | 15 |

Each row: `id` · system · facet · why · sources · `modelTag` · `modelContract`. Human-only rows also carry `humanKind` + `fixture` (annotations in zone files; canonical table in `HUMAN-ONLY.md`).

## Already stand-in-wired (from prior slice)

| Port | Maps toward |
|---|---|
| `mailer` / `otpStore` | ESP/mailer + OTP challenge adjacency |
| `haltStore` | Halt/suppression in-app side |
| `auditTrail` | Audit log store |

## Next (Pass B — not this pass)

1. Prioritize modelable systems needed by CT-critical paths (runtime, ESP events, durable store, escrow rail, enrich crawl, …).  
2. Hand-build stand-ins with the filed `modelContract`.  
3. Wire CT against those models.  
4. Leave human-only as readiness chips / gates until real world is ready — green only when the named **fixture** is human-provided (`HUMAN-ONLY.md`).
