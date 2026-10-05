# MASTERY — what “learned” means

**Mutability:** Hard, with [`RULES.md`](./RULES.md). Founder acceptance to change.

A cycle is not learned when the screen matches. A cycle is learned when the **exit capability** in that cycle’s JOURNEY contract is demonstrated *and* the proofs below can be performed without the chapter open. If the contract named a **production bridge**, the bridge proof is part of mastery — not extra credit.

---

## Triple target

1. **Construction.** Given an intention, discover what must exist — information, state, relationships, behavior, boundaries, mechanisms — and produce it.
2. **Syntax.** Express that construction in the required syntax families for the cycle, and produce them again later.
3. **Production fluency.** When a bridge is due: rebuild in the production tool, point back at the mechanism, and drop to the rudiment when the abstraction is insufficient. Encountering the mechanism is not this target.

Any two without the third (when the third was due) is a fail.

Graduation is not “can write TypeScript without autocomplete.” Graduation is not “understands why React Flow exists.” Graduation is:

> Someone who can sit down with an intended product, choose and wield a modern production stack, construct the system across browser / server / data / workers / integrations, verify it, ship it, observe it, and change it safely — and who understands enough underneath those tools that when the stack changes, they do not collapse with it.

Current Tower is a **convergence test** of the *class of system*, not of Tower’s Git history or dependency pins. A **transfer audit** (TC-64) determines whether the ability left this building. See [`DESTINATION.md`](./DESTINATION.md).

---

## Proofs (every cycle)

Order:

**Predict → Explain → Transform → Break → Diagnose → Reconstruct → Transfer**

| Proof | Demand |
|---|---|
| **Predict** | Before running: what will appear, what will exist, what will not happen? |
| **Explain** | What were we constructing? What does the mechanism do? Where does it sit? The industry name is attached to this, not to a definition. If a bridge was due: what is the tool buying, and what mechanism does each important surface manipulate? |
| **Transform** | After it works, a mutation not in the chapter. **Before coding:** what construction must change, what can remain, and why? |
| **Break** | Remove the mechanism, or break one relationship. What becomes impossible? If “nothing,” it arrived too early. If a bridge was due: remove the tool *or* drop to the rudiment; the learner must still be able to cause the capability. |
| **Diagnose** | Find the broken *relationship*, not the missing character — unless the character *is* the relationship. |
| **Reconstruct** | Cause the capability again without yesterday’s files or the chapter. Syntax must be producible. Production syntax too, if the bridge has been crossed. |
| **Transfer** | A near-neighbor intention. Name what must exist before writing. At TC-64: a product that is not in Tower, without Tower as a template, choosing a stack on purpose. |

Transformation is the primary proof. Examples of the *kind* of mutation (not a list to memorize):

- make the vertical thing horizontal
- one selected entity becomes many
- immediate behavior becomes delayed
- one-to-many becomes many-to-many
- one channel becomes several
- local information becomes shared
- the same layout in utilities instead of selectors (or the reverse, when the utility is insufficient)

---

## Tests as mastery (from TC-10)

Learner-proofs do not replace encoded invariants.

When a cycle is on the testing spine:

```
I know what this should do
        → I can state the invariant
        → I can encode that invariant as a test
        → I can break the implementation
        → the test catches me
```

A cycle that was due Vitest / RTL / MSW / Playwright is not mastered if the only proof is prose in `notes.md`.

---

## Continuing spines

A later cycle can fail mastery because a spine item was due and skipped:

- **TypeScript:** arrived at TC-12; unions, narrowing, generics, utility types, `unknown`/`never`, `Promise<T>`, modules — when the construction gives them a reason.
- **JavaScript:** `async`/`await`, modules, closures, transforms, errors — when needed, not assumed.
- **SQL:** constraints, transactions, indexes, plans — not done at `SELECT`.
- **Security:** the threat the construction just created (XSS, CSRF, injection, secrets, rate limits, webhook signatures).
- **DevTools:** used, not described.

Do not wait for “the TypeScript chapter” that will not come.

---

## Cycle exit

The JOURNEY contract’s **Exit capability** is the bar. It is written so it cannot be passed by following “now make a function” or “now add these Tailwind classes.”

Example (TC-8): *Can recognize a repeated construction and extract it without being instructed to “make a function.”*

Example (TC-4): *Can construct the layout in Tailwind without guessing classes, and can drop to CSS when the utility abstraction is insufficient.*

The generated chapter must include proofs that test that bar. The evaluator (agent at the unit boundary) judges the pushed `my-work/` against that bar, not against prose similarity to the chapter.

---

## Fails

- The screen matches and the learner cannot say what caused it.
- Syntax was reproduced and the problem it solves cannot be stated.
- The construction is understood and the required syntax cannot be written.
- A library is requested because Tower uses it, not because this construction failed.
- A library is omitted after its bridge was due, because the rudiment still “worked.”
- A production tool is used as magic: utilities/hooks/ORM calls cannot be pointed at a mechanism.
- A person is painted so a module is not empty.
- A second walker is built.
- A working construction cannot be deformed when the intention changes.
- The notes recap the chapter instead of stating the cause.
- Types are “done” because TC-12 happened, while three write shapes are copy-pasted.
- The walker exists and cannot be changed because no test would catch the lie.
- Convergence is claimed by matching Tower’s React 18 / Vite 6 pins.

---

## Evidence the next chapter must read

Validated work for TC-N means all of:

1. The construction in `constructions/tc-N/`
2. Notes in `my-work/tc-N/` — model, proof answers (Transform written before file changes where required), bridge proof if due, uncertainties
3. Tests the cycle was due, if any
4. An evaluator judgment: exit capability met / not met; next pressure visible / not visible; flags for JOURNEY split or merge; spine items forced next

Without (4), TC-(N+1) must not be generated.
