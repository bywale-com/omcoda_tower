# MASTERY — what “learned” means

**Mutability:** Hard, with [`RULES.md`](./RULES.md). Founder acceptance to change.

A cycle is not learned when the screen matches. A cycle is learned when the **exit capability** in that cycle’s JOURNEY contract is demonstrated *and* the proofs below can be performed without the chapter open. If the contract named a **production bridge**, the bridge proof is part of mastery. If a **spine** item was due (Git, CI, a11y, time, pagination, …), skipping it is a fail.

---

## Triple target

1. **Construction.** Given an intention, discover what must exist — information, state, relationships, behavior, boundaries, mechanisms — and produce it.
2. **Syntax.** Express that construction in the required syntax families, and produce them again later.
3. **Production fluency.** When a bridge is due: rebuild in the production tool, point back at the mechanism, and drop to the rudiment when the abstraction is insufficient. When a **practice** is due: it becomes permanent (tests run, CI runs, compose starts the system, the form is labeled). Encountering the mechanism is not this target. Adding a library is not this target.

Any two without the third (when the third was due) is a fail.

Graduation is not “understands why React Flow exists.” Graduation is:

```
I can work below the abstraction.
I can work fluently at the abstraction.
I can tell when the abstraction is wrong.
I can debug the system around it.
I can replace it.
I can ship what I built.
I can prove it works.
I can see when it doesn't.
I can change it without fear.
```

And: sit down with an intended product, choose and wield a modern production stack, construct it across browser / server / data / workers / integrations, verify it, ship it, observe it, and change it safely — with enough underneath that a stack change is not a collapse (including the TC-71 upgrade).

Current Tower is a **convergence test** of the *class of system*. A **transfer audit** (TC-72) determines whether the ability left this building. See [`DESTINATION.md`](./DESTINATION.md).

---

## Proofs (every cycle)

**Predict → Explain → Transform → Break → Diagnose → Reconstruct → Transfer**

| Proof | Demand |
|---|---|
| **Predict** | Before running: what will appear, exist, not happen? |
| **Explain** | What were we constructing? Mechanism? If a bridge was due: what is the tool buying? If Node was involved: host or product? |
| **Transform** | A mutation not in the chapter. **Before coding:** what must change, what can remain, why? |
| **Break** | Remove the mechanism. If a bridge was due: drop to the rudiment and still cause the capability. |
| **Diagnose** | Broken *relationship*, not missing character — unless the character *is* the relationship. Exit codes, ports, and CI red are relationships. |
| **Reconstruct** | Cause it again without yesterday’s files. Production syntax too, if the bridge has been crossed. |
| **Transfer** | Near-neighbor intention. At TC-72: a product not in Tower, choosing a stack on purpose, **CI green, actually deployed off localhost**, one operational signal. |

Transformation is the primary proof.

---

## Tests and CI as mastery

Learner-proofs do not replace encoded invariants. Encoded invariants do not replace a machine that runs them.

A cycle due Vitest / RTL / MSW / Playwright is not mastered with only `notes.md`.

A cycle after TC-18 is not mastered if the learner “meant to run the tests.” CI is part of the proof.

Playwright smoke (TC-38) is not optional once the first multi-face loop exists. TC-63 deepens it; it does not introduce it.

---

## Continuing spines

A later cycle can fail because a spine item was due and skipped:

- **TypeScript** (TC-12+), **JavaScript**, **SQL** (including pagination and evolution when those cycles have passed)
- **Security**, **DevTools**, **accessibility**
- **Git craft** (branch, diff, conflict, bisect, revert vs rollback) — not merely push
- **Systems / tooling** (process, port, env, exit code)
- **Networking** (host, origin, DNS/TLS as they appear)
- **Time as data** after TC-40 (no more naive `Date` as civil time)
- **CI** after TC-18 (grow; don’t rediscover)

---

## Cycle exit

The JOURNEY **Exit capability** is the bar. It cannot be passed by following “now make a function” or “now add these Tailwind classes” or “now paste a workflow YAML.”

Example (TC-8): extract a repeated construction without being instructed to “make a function.”

Example (TC-4): construct the layout in Tailwind without guessing, drop to CSS when needed, **without a Node project**.

Example (TC-18): a broken unit test turns CI red.

Example (TC-27): kill the app process; the book is gone; killing Vitest is a different death.

The evaluator judges pushed `my-work/` against that bar.

---

## Fails

- The screen matches and the learner cannot say what caused it.
- Syntax reproduced; the problem cannot be stated.
- Construction understood; required syntax cannot be written.
- A library requested because Tower uses it, or omitted after its bridge was due.
- A production tool used as magic.
- A person painted so a module is not empty.
- A second walker.
- A working construction cannot be deformed.
- Notes recap the chapter instead of stating the cause.
- Types “done” at TC-12 while write shapes are copy-pasted.
- Walker exists; no test would catch the lie.
- Tests exist; only the laptop ever runs them (after TC-18).
- `SELECT *` is still the book after TC-33.
- `setInterval` is still “what time is” after TC-40.
- `localhost:3000` is still an incantation after TC-27.
- Convergence claimed by matching Tower’s React 18 / Vite 6 pins.
- Transfer claimed by naming a deploy path without deploying.
- Wiring the SPA to Postgres before an HTTP process exists.
- Equal fluency claimed in every primitive vendor.
- Logo tourism (K8s, Kafka, GraphQL, six auth vendors) offered as competence.

---

## Evidence the next chapter must read

Validated work for TC-N means all of:

1. Construction in `constructions/tc-N/`
2. Notes in `my-work/tc-N/` — model, proofs, bridge proof if due, spine notes if due, uncertainties
3. Tests the cycle was due, if any; CI green if CI already exists
4. Evaluator judgment: exit met / not; next pressure visible / not; flags for split or merge; spine items forced next

Without (4), TC-(N+1) must not be generated.
