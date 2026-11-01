# MASTERY — what “learned” means

**Mutability:** Hard, with [`RULES.md`](./RULES.md). Founder acceptance to change.

A cycle is not learned when the screen matches. A cycle is learned when the **exit capability** in that cycle’s JOURNEY contract is demonstrated *and* the proofs below can be performed without the chapter open.

---

## Dual target

1. **Construction.** Given an intention, discover what must exist — information, state, relationships, behavior, boundaries, mechanisms — and produce it.
2. **Syntax.** Express that construction in the required syntax families for the cycle, and produce them again later.

Either alone is a fail.

Graduation is not “can write TypeScript without autocomplete.” Graduation is:

> Given an intended behavior or system, I can discover a computational construction capable of producing it, express that construction using the appropriate mechanisms and syntax, and deliberately modify it when the intention changes.

Current Tower is a **convergence test** of that ability. A **transfer audit** (TC-35) determines whether the ability left this building. See [`DESTINATION.md`](./DESTINATION.md).

---

## Proofs (every cycle)

Order:

**Predict → Explain → Transform → Break → Diagnose → Reconstruct → Transfer**

| Proof | Demand |
|---|---|
| **Predict** | Before running: what will appear, what will exist, what will not happen? |
| **Explain** | What were we constructing? What does the mechanism do? Where does it sit? The industry name is attached to this, not to a definition. |
| **Transform** | After it works, a mutation not in the chapter. **Before coding:** what construction must change, what can remain, and why? |
| **Break** | Remove the mechanism, or break one relationship. What becomes impossible? If “nothing,” it arrived too early. |
| **Diagnose** | Find the broken *relationship*, not the missing character — unless the character *is* the relationship. |
| **Reconstruct** | Cause the capability again without yesterday’s files or the chapter. Syntax must be producible. |
| **Transfer** | A near-neighbor intention. Name what must exist before writing. At TC-35: a product that is not in Tower, without Tower as a template. |

Transformation is the primary proof. Examples of the *kind* of mutation (not a list to memorize):

- make the vertical thing horizontal
- one selected entity becomes many
- immediate behavior becomes delayed
- one-to-many becomes many-to-many
- one channel becomes several
- local information becomes shared

---

## Cycle exit

The JOURNEY contract’s **Exit capability** is the bar. It is written so it cannot be passed by following “now make a function.”

Example (TC-8): *Can recognize a repeated construction and extract it without being instructed to “make a function.”*

The generated chapter must include proofs that test that bar. The evaluator (agent at the unit boundary) judges the pushed `my-work/` against that bar, not against prose similarity to the chapter.

---

## Fails

- The screen matches and the learner cannot say what caused it.
- Syntax was reproduced and the problem it solves cannot be stated.
- The construction is understood and the required syntax cannot be written.
- A library is requested because Tower uses it, not because this construction failed.
- A person is painted so a module is not empty.
- A second walker is built.
- A working construction cannot be deformed when the intention changes.
- The notes recap the chapter instead of stating the cause.

---

## Evidence the next chapter must read

Validated work for TC-N means all of:

1. The construction in `constructions/tc-N/`
2. Notes in `my-work/tc-N/` — model, proof answers (Transform written before file changes where required), uncertainties
3. An evaluator judgment: exit capability met / not met; next pressure visible / not visible; flags for JOURNEY split or merge

Without (3), TC-(N+1) must not be generated.
