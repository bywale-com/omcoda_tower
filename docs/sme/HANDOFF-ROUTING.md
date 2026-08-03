# Handoff routing — `pm` | `both` | `cto`

**Parent doctrine:** [`DOCTRINE-sme-cto-implementation.md`](./DOCTRINE-sme-cto-implementation.md) §6  
**Audience:** Room holder · PM · CTO  
**Job:** Route each consideration between the face (PM) column and the no-face (CTO) column — act on the tag already in the data.

**Not this file:** Tower absorb packets live in [`HANDOFF.md`](./HANDOFF.md) (Pass2 → Register/Wiring content). This file is the **routing law**.

---

## Principle

| Tag | Route |
|---|---|
| **`pm`** | PM functional design only |
| **`both`** | Capability SME reveals it; PM decides [surface intent](./SURFACE-INTENT.md); Wiring builds the mechanism. Columns *cross* here |
| **`cto`** | Technical column (capability SME → Wiring). May still earn a PM **view-only** window, or no face |

The tag already exists in the passes; the discipline is to *route on it* rather than run every item through a PM/UI framing.

---

## Origin

The implementation pass wrote a UI line even for `cto` items — premature or invented surfaces. `Handoff` was populated but not acted on. The routing key was already in the data.

---

## Mechanics

Split the implementation write by handoff:

- `pm` / `both` faces → functional design (+ surface intent)
- `cto` → [CTO Think Stack](../wiring/CTO-THINK-STACK.md); round-trip to PM only if they earn a view surface

Cross-cuts reconcile before either column goes deep — see [`../method/TWO-COLUMN-SYNTHESIS.md`](../method/TWO-COLUMN-SYNTHESIS.md).
