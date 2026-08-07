# Wiring — wire with stand-ins (build pass)

**Status:** Active method for the CT wire pass (Pass B)  
**Companions:** [`WIRING-METHOD.md`](./WIRING-METHOD.md) · [`WIRING-CRITICAL-INTERACTION.md`](./WIRING-CRITICAL-INTERACTION.md) · [`NODE-DEFINITION.md`](./NODE-DEFINITION.md) · [`external-models/00-INDEX.md`](./external-models/00-INDEX.md)

---

## Stance

**Wire the app. Do not graph first.** Topology falls out of wired paths.

For every hop that would need an **external system** (mailer, DB, ESP, escrow rail, Meta, scrape host, …), do **not** call the real outside thing yet. Stand up an **in-app stand-in**: a fake system that accepts the same inputs and emits the same outputs the rest of the app depends on.

- Stand-ins are **fake systems**, not fake scattered rows.
- The rest of the app is **real** against those contracts.
- Later: swap stand-ins for real externals **one by one**.
- Human residue stays named; mimic the in-app side of the contract only — see **Fixture honesty** below.

---

## Upstream (Pass A)

CTO external inventory + model tags: [`external-models/00-INDEX.md`](./external-models/00-INDEX.md)  
Human-only fixtures + runbook: [`external-models/HUMAN-ONLY.md`](./external-models/HUMAN-ONLY.md)  
Control reconciliation: [`external-models/04-CONTROL-RECONCILIATION.md`](./external-models/04-CONTROL-RECONCILIATION.md)

---

## Fixture honesty (Pass B doctrine)

> **A stand-in may simulate everything downstream of a human act, but the human act itself must be represented by an explicit human-provided fixture — never auto-satisfied. An app that reports "sending" while no sending identity is provisioned is a false green.**

| Rule | Meaning |
|---|---|
| Fixture required | Every `human-only` external has a named `fixture` (see `HUMAN-ONLY.md`) |
| Fail closed | Readiness / Armed / Active / CEM leave stay denied until the fixture is marked human-provided |
| No inventing the act | Stand-ins must not invent real TCR approval, Meta verification, firm-zone DNS publish, OAuth grant, or counsel clearance |
| Downstream OK | After fixture is set, stand-ins may emit feed samples, gate chips, webhook-shaped events, etc. |

`humanKind`:

- **`by-design`** — governance (halt refusal, counsel, OAuth grant). Never automate the act; fixture records that a person did it.
- **`by-provisioning`** — logistics backlog (sending-identity runbook, payment identity). Fixture records that provisioning happened; still never auto-green.

---

## Unit of work

One densified implementation at a time (event/state; critical interactions only).

1. Trace the click-path / implementation statement.  
2. Wire in-app → in-app for real.  
3. At each external need → create or reuse a named stand-in (`src/app/wire/standins/`) using Pass A `modelContract`.  
4. If the path depends on a `human-only` boundary → key gates off the named **fixture**; do not auto-satisfy.  
5. Point the CT control at the stand-in via a port.  
6. Record the wire: implementation id · nodes · stand-ins · fixtures · `codeRefs`.  
7. Do **not** invent How leaves. Do **not** build real provider integrations in this pass.

---

## Naming

| Term | Meaning |
|---|---|
| **Port** | Interface the app calls (mailer, otpStore, haltStore, …) |
| **Stand-in** | Fake implementation of a port that runs in-app |
| **Fixture** | Named marker that a human performed a real act (`dns_spf_published`, `tcr_filed`, …) |
| **Real** | Later swap target (Resend, Postgres, …) — out of scope until cutover |

Tag stand-ins `stand-in` in the registry. Never pretend a stand-in is the production provider.

---

## First wire slice (done)

1. **Login OTP** — stand-in mailer + OTP store  
2. **Halt outreach** — stand-in halt/silence store + audit append (Confirm halt is `by-design`; fixture `halt_confirmed` after human Confirm)

Further builds follow Pass A `modelable` contracts + fixture honesty.
