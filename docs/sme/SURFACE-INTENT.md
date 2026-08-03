# Surface intent — initiation vs view

**Parent doctrine:** [`DOCTRINE-sme-cto-implementation.md`](./DOCTRINE-sme-cto-implementation.md) §5  
**Audience:** PM functional design (and CTO when a no-face item earns a view window)  
**Status:** Standing method — derived from Tower implementation-pass inspection

---

## Principle

Not every implementation is an action, and "backend vs UI" is the wrong cut. Every implementation that earns a face is one of two types:

- **Initiation** — the human *acts*: open, authorize, bind, halt, trigger, provision. The affordance *does* something.
- **View / attribution / record** — the human *sees*: a status, a metric, an attribution, a record of what the machine did. No action; it is the operator's legible window into a mechanism.

Neither is "no UI." A view-only surface is a real, deliberate deliverable — often the operator's window into a backend capability (the open-box doctrine: the machine runs itself, but nothing is a black box). Deciding which type each implementation earns — or that it earns none — is the PM's (and, for its own surfaces, the CTO's) product judgment.

---

## Origin (failure prevented)

The implementation passes expressed *every* item as "On {Surface}, you can now…", which looked like a UI bias. On inspection it wasn't naïve: the backend mechanism was carried in the `Solution` field and ownership in `Handoff`. What the format lacked was a *view-vs-initiation* distinction and a "no immediate face" state. The correction is not "PM stops writing UI for CTO items" — it is that the PM is making a real surface-intent judgment (some things you *do*, some you only *see*), which is exactly what a good PM should decide.

---

## Mechanics

In functional design, classify each faced implementation as:

| Tag | Meaning |
|---|---|
| `initiation` | Human acts; affordance does something |
| `view` | Human sees; window into a mechanism |
| `none` | No immediate face — hand to Wiring |

This axis is not SME-only — it applies to the **persona/function side too**, and already operates implicitly there:

| Surface | Intent |
|---|---|
| Board | view / inhabit |
| Halt outreach | initiation |
| Live brief | view |

Naming it makes the judgment deliberate and auditable.

---

## Worked examples (Tower)

- **Firm operations bind · Armed / Active** → `initiation` (operator arms the campaign under this identity).
- **Oversight / Firm health rates** → `view` (legible window into send/reply/booking machinery; no action required to "be" the metric).
- **Suppression list consultation on Send gates** → mechanism is Wiring; face may be `view` on Send gates (blocked reason) or `none` if only backend-enforced.
- **DKIM key material in ESP** → `none` (no Register face; CTO column).

---

## Cross-links

- [`DOCTRINE-sme-cto-implementation.md`](./DOCTRINE-sme-cto-implementation.md) §6 — `Handoff` is the routing token that decides whether this judgment runs
- [`../wiring/CTO-THINK-STACK.md`](../wiring/CTO-THINK-STACK.md) — no-face items land here
- [`../wiring/WIRING-METHOD.md`](../wiring/WIRING-METHOD.md) — event/state tracing stays design-invariant regardless of initiation vs view arrangement
