# Wiring — wire with stand-ins (build pass)

**Status:** Active method for the CT wire pass  
**Companions:** [`WIRING-METHOD.md`](./WIRING-METHOD.md) · [`WIRING-CRITICAL-INTERACTION.md`](./WIRING-CRITICAL-INTERACTION.md) · [`NODE-DEFINITION.md`](./NODE-DEFINITION.md)

---

## Stance

**Wire the app. Do not graph first.** Topology falls out of wired paths.

For every hop that would need an **external system** (mailer, DB, ESP, escrow rail, Meta, scrape host, …), do **not** call the real outside thing yet. Stand up an **in-app stand-in**: a fake system that accepts the same inputs and emits the same outputs the rest of the app depends on.

- Stand-ins are **fake systems**, not fake scattered rows.
- The rest of the app is **real** against those contracts.
- Later: swap stand-ins for real externals **one by one**.
- Human-provisioning residue (firm DNS, TCR, real money) stays named; mimic the in-app side of the contract only.

---

## Unit of work

One densified implementation at a time (event/state; critical interactions only).

1. Trace the click-path / implementation statement.  
2. Wire in-app → in-app for real.  
3. At each external need → create or reuse a named stand-in (`src/app/wire/standins/`).  
4. Point the CT control at the stand-in via a port.  
5. Record the wire: implementation id · nodes · stand-ins used · `codeRefs` for controls.  
6. Do **not** invent How leaves. Do **not** build real provider integrations in this pass.

---

## Naming

| Term | Meaning |
|---|---|
| **Port** | Interface the app calls (mailer, otpStore, haltStore, …) |
| **Stand-in** | Fake implementation of a port that runs in-app |
| **Real** | Later swap target (Resend, Postgres, …) — out of scope until cutover |

Tag stand-ins `stand-in` in the registry. Never pretend a stand-in is the production provider.

---

## First slice (this PR)

1. **Login OTP** — stand-in mailer + OTP store  
2. **Halt outreach** — stand-in halt/silence store + audit append  

Further implementations follow the same pattern.
