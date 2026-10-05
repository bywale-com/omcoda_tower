# RULES — how teaching and generation must operate

**Mutability:** Hard. An agent must not amend this file to make a chapter easier, faster, or more like a tutorial. A change here requires explicit founder acceptance, written as a dated amendment at the bottom — not a silent edit.

**Companion:** [`JOURNEY.md`](./JOURNEY.md) is versioned and may split or merge cycles. [`TECHNOLOGY-MAP.md`](./TECHNOLOGY-MAP.md) is versioned with JOURNEY. This file may not spontaneously change the teaching law.

---

## 1. What this curriculum is

A book and a repository in one. It trains:

> intention → computational construction

Current Tower (`omcoda_tower`) is the **convergence test** for that class of system, not the answer key. Reproduction of Tower is not graduation. Matching Tower’s historical dependency pins is not graduation. See [`DESTINATION.md`](./DESTINATION.md) and [`MASTERY.md`](./MASTERY.md).

The pedagogical engine (construction-first, phenomenon before name, syntax as representation) stands. Encountering a mechanism is **not** the same as knowing how a competent product engineer works with that mechanism.

---

## 2. Order of a cycle (immutable)

```
construction before mechanism
        → mechanism before terminology
        → terminology + syntax
        → independent construction
        → prediction
        → transformation
        → breaking
        → diagnosis
        → reconstruction
        → transfer
        → evaluation
```

Never the reverse. Never “here is a React tutorial.” Never a vocabulary list before the phenomenon.

---

## 2b. Production Bridge law (immutable)

```
rudiment → mechanism → production bridge → production fluency
```

Not merely:

```
rudiment → mechanism → next concept
```

**Feel the primitive. Build it once. Then graduate into the production representation. Point back at the mechanism so the tool is not magic. Then use the tool fluently until the next construction fails.**

This prevents both failures:

```
bootcamp failure:
  Tailwind because "developers use Tailwind"

v1 curriculum failure:
  raw CSS forever because "we must understand the mechanism first"
```

Consequences:

- A cycle whose JOURNEY contract names a **Production bridge** must include the rebuild (or first production use) and a **bridge proof** that points each important tool surface back at the mechanism.
- A cycle whose contract says **not this cycle** must not introduce that tool. Introducing it because Tower uses it, or because it is fashionable, is a RULES break.
- Skipping a due bridge because the rudiment “already worked” is a RULES break.
- Staying on the rudiment for epochs after the bridge was due is a RULES break.
- Teaching the production tool before the mechanism has been constructed is a RULES break.
- **Do not rebuild Tower Construction in Next.js.** Next.js is a late contrast slice after Vite + Hono + an explicit client/server boundary. See TECHNOLOGY-MAP.

Construction uses **current stable** tooling (DESTINATION + TECHNOLOGY-MAP). Do not inherit Tower’s historical pins (React 18.3, Vite 6.4, …) unless a specific Tower *behavior* depends on the older version.

Thirty-six cycles was never the product. Competence is.

---

## 3. Assumed literacy

The learner is a **software-construction beginner**, not a computer-literacy beginner.

Assumed: repositories, `src/`, GitHub, editor, browser, files and folders, that configs exist.

Not assumed: TypeScript, JavaScript, HTML, CSS, React, how a frontend starts, how state / routing / APIs / databases / auth / packages / tests / deploy / observability work as constructions.

A checkpoint that teaches “what is a folder?” is a RULES violation.

---

## 4. Syntax

Construction gives syntax meaning. Then that syntax is practiced to fluency.

- Do not begin a chapter by listing syntax.
- The moment the construction needs a representation, teach that syntax completely enough that the learner can **produce** it without looking.
- Required syntax is a mastery target. Unused syntax “for completeness” is forbidden.
- If the learner can explain the construction and cannot write the required syntax, the cycle is not done.

**Continuing spines.** TypeScript may **arrive** at one cycle. It must not be treated as finished there. The same for JavaScript, SQL, tests, DevTools, and security. Do not generate “TC-12B — today’s lesson is generics.” Force the construct when the construction repeats a shape that needs it (TECHNOLOGY-MAP spines). Do not assume `async`/`await`, modules, or `map` because a later Tower mechanism would like them already known.

---

## 5. Names

Experience the phenomenon → describe it → understand the construction → **immediately** give the industry name.

No private vocabulary that later needs translation. No delayed naming to feel “pure.”

---

## 6. The chapter is the tutor

A generated chapter must be self-contained: intention, enough explanation, construction, syntax, experiments, names, proofs. If a production bridge is due, the chapter includes rudiment-already-felt (or a short reconstruct), the rebuild in the production tool, and the pointing-back.

The learner works **alone** for the stretch of the cycle: chapter, editor, browser (or later server / table / worker / browser-test), consequences.

The agent does not sit beside keystrokes. The agent moves at the **unit boundary**.

If the chapter cannot be worked without live tutoring, the chapter failed as a chapter. Rewrite it. Do not pair-program the cycle.

---

## 7. Causal necessity, not ceremonial failure

Mechanisms arise from problems the previous construction cannot satisfy.

Do not require substantial time implementing an obviously inadequate construction merely so it can fail. If the learner accurately predicts the failure and explains why, the problem has been felt.

The production bridge is not ceremonial failure. Building the layout once in CSS so Tailwind has something to mean is **causal**. Months of hand-authored selectors after that is **ceremonial**.

---

## 7b. Software that verifies software

```
Predict → Explain → Transform → Break → Diagnose → Reconstruct → Transfer
```

is how **the learner** knows. It is not a substitute for learning to write **software that verifies software**.

After functions exist, some constructions acquire tests. The progression is:

```
I know what this should do
        → I can state the invariant
        → I can encode that invariant as a test
        → I can break the implementation
        → the test catches me
```

Then Vitest. When React appears, Testing Library. When APIs create test-dependency problems, MSW. When several real pieces must work together in a real browser, Playwright.

A product engineer who can create a workflow engine but cannot confidently change it because there are no automated tests is not finished. Do not graduate a cycle that was due a test spine item with only prose proofs.

---

## 8. Generation law (how a chapter is made)

The agent generating **TC-N** must read, in this order:

1. This file (`RULES.md`)
2. [`MASTERY.md`](./MASTERY.md)
3. [`DESTINATION.md`](./DESTINATION.md)
4. [`TECHNOLOGY-MAP.md`](./TECHNOLOGY-MAP.md) — is a bridge **due**? is a **spine** item forced?
5. The **TC-N contract** in [`JOURNEY.md`](./JOURNEY.md) — destination, forces, must-not, production bridge, exit
6. The learner’s **validated TC-(N−1) work** (`my-work/tc-(N-1)/` and the construction)

```
   JOURNEY + TECHNOLOGY-MAP              RULES
           ↓                               ↓
 What constructions + which tools    How teaching must operate
           ↓                               ↓
 previous work  →  NEXT CHAPTER  ←  MASTERY + DESTINATION
      ↑
 What the learner actually understands
```

**JOURNEY + TECHNOLOGY-MAP prevent local arbitrariness.** The agent must not invent “today we learn async/await” or “today we add Tailwind” because it is fashionable. If it is not in the contract’s technologies / syntax families / concepts / production bridge, and not a spine item the construction now forces, it does not enter the chapter.

**Previous work prevents rigidity.** If the TC-(N−1) submission shows the learner already independently discovered half of TC-N, the chapter must not pretend they have not. If a prerequisite is unstable, the chapter must not paper over it. If they already rebuilt in the production tool, do not pretend they are still on the rudiment. The agent may:

- thin the chapter where evidence shows mastery already,
- thicken practice where evidence shows a hole,
- **flag** that a JOURNEY boundary should split or merge,

and must **not**:

- silently rewrite JOURNEY or TECHNOLOGY-MAP,
- change RULES,
- introduce an off-map technology,
- skip a named production bridge,
- copy `omcoda_tower` source as the lesson,
- pin Construction to Tower’s historical versions as if that were fidelity.

TC-0 has no previous work. Generate it from JOURNEY + RULES + MASTERY + DESTINATION + TECHNOLOGY-MAP + [`../TC-0-OPERATION.md`](../TC-0-OPERATION.md).

**Do not regenerate TC-0, TC-1, or TC-2.** They are already generated under v1 contracts that v2 preserved.

---

## 9. What a chapter must not contain

- Finished code the learner is meant to copy as the construction.
- Current Tower files as the exercise.
- A second walker, a painted book, a Hub plant.
- Technologies listed in that cycle’s **Must NOT introduce**.
- A production tool listed as “not this cycle” / “not yet” in JOURNEY or TECHNOLOGY-MAP.
- A promise of later cycles as reading homework (a one-line “door to next” is allowed).

---

## 10. Advance

Never advance because JOURNEY’s next heading exists.

Advance when:

1. Exit capability in the TC-N contract is demonstrated (see MASTERY), including bridge proof if a production bridge was due, and
2. The contract’s **Next pressure** is visible to the learner.

If not, do not generate TC-(N+1).

---

## 11. JOURNEY amendments

JOURNEY and TECHNOLOGY-MAP are versioned together. Splits (`TC-17` → `TC-17A` / `TC-17B`) and merges are legal when evidence shows smuggling or artificial separation.

An amendment must:

- increment the JOURNEY version,
- stamp TECHNOLOGY-MAP if arrival cycles moved,
- state the reason (usually: validated work showed X),
- leave RULES untouched.

An agent who “just teaches React this week” or “just adds Next because hiring managers like it” has violated this file.

---

## 12. Forbidden agent moves

- Generate more than one unvalidated chapter ahead.
- Type the learner’s construction.
- Optimize for finishing Tower quickly.
- Optimize for a cycle count (36, 50, 65 — the number is not the product).
- Optimize for syntax without construction, or construction without required syntax.
- Treat Hub as the destination.
- Recut `workflowWalk.ts` in `omcoda_tower` as a teaching fork.
- Rebuild the Construction book as a Next.js app.
- Treat “we encountered the mechanism” as “we are fluent in the production tool.”

---

## Amendments

| Date | Change | Acceptance |
|---|---|---|
| 2026-10-05 | §2b Production Bridge law. Generation must read TECHNOLOGY-MAP. Continuing spines (TS/JS/SQL/tests/security). Tests are not replaced by learner-proofs. Current-stable tooling. TC-0–2 do not regenerate. Next.js is contrast, not the first stack. | Founder recut, 2026-10-05: *“Rudiment → mechanism → production bridge → production fluency.”* |
