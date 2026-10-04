# RULES — how teaching and generation must operate

**Mutability:** Hard. An agent must not amend this file to make a chapter easier, faster, or more like a tutorial. A change here requires explicit founder acceptance, written as a dated amendment at the bottom — not a silent edit.

**Companion:** [`JOURNEY.md`](./JOURNEY.md) is versioned and may split or merge cycles. This file may not spontaneously change the teaching law.

---

## 1. What this curriculum is

A book and a repository in one. It trains:

> intention → computational construction

Current Tower (`omcoda_tower`) is the **convergence test** for that class of system, not the answer key. Reproduction of Tower is not graduation. See [`DESTINATION.md`](./DESTINATION.md) and [`MASTERY.md`](./MASTERY.md).

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

## 3. Assumed literacy

The learner is a **software-construction beginner**, not a computer-literacy beginner.

Assumed: repositories, `src/`, GitHub, editor, browser, files and folders, that configs exist.

Not assumed: TypeScript, JavaScript, HTML, CSS, React, how a frontend starts, how state / routing / APIs / databases / auth / packages work as constructions.

A checkpoint that teaches “what is a folder?” is a RULES violation.

---

## 4. Syntax

Construction gives syntax meaning. Then that syntax is practiced to fluency.

- Do not begin a chapter by listing syntax.
- The moment the construction needs a representation, teach that syntax completely enough that the learner can **produce** it without looking.
- Required syntax is a mastery target. Unused syntax “for completeness” is forbidden.
- If the learner can explain the construction and cannot write the required syntax, the cycle is not done.

---

## 5. Names

Experience the phenomenon → describe it → understand the construction → **immediately** give the industry name.

No private vocabulary that later needs translation. No delayed naming to feel “pure.”

---

## 6. The chapter is the tutor

A generated chapter must be self-contained: intention, enough explanation, construction, syntax, experiments, names, proofs.

The learner works **alone** for the stretch of the cycle: chapter, editor, browser (or later server / table), consequences.

The agent does not sit beside keystrokes. The agent moves at the **unit boundary**.

If the chapter cannot be worked without live tutoring, the chapter failed as a chapter. Rewrite it. Do not pair-program the cycle.

---

## 7. Causal necessity, not ceremonial failure

Mechanisms arise from problems the previous construction cannot satisfy.

Do not require substantial time implementing an obviously inadequate construction merely so it can fail. If the learner accurately predicts the failure and explains why, the problem has been felt.

---

## 8. Generation law (how a chapter is made)

The agent generating **TC-N** must read, in this order:

1. This file (`RULES.md`)
2. [`MASTERY.md`](./MASTERY.md)
3. [`DESTINATION.md`](./DESTINATION.md)
4. The **TC-N contract** in [`JOURNEY.md`](./JOURNEY.md) — destination, forces, must-not, exit
5. The learner’s **validated TC-(N−1) work** (`my-work/tc-(N-1)/` and the construction)

```
        JOURNEY                    RULES
           ↓                         ↓
    Where we're going        How teaching must operate
           ↓                         ↓
 previous work  →  NEXT CHAPTER  ←  MASTERY + DESTINATION
      ↑
 What the learner actually understands
```

**JOURNEY prevents local arbitrariness.** The agent must not invent “today we learn async/await” because it is fashionable. If it is not in the contract’s technologies / syntax families / concepts, it does not enter the chapter.

**Previous work prevents rigidity.** If the TC-(N−1) submission shows the learner already independently discovered half of TC-N, the chapter must not pretend they have not. If a prerequisite is unstable, the chapter must not paper over it. The agent may:

- thin the chapter where evidence shows mastery already,
- thicken practice where evidence shows a hole,
- **flag** that a JOURNEY boundary should split or merge,

and must **not**:

- silently rewrite JOURNEY,
- change RULES,
- introduce an off-map technology,
- copy `omcoda_tower` source as the lesson.

TC-0 has no previous work. Generate it from JOURNEY + RULES + MASTERY + DESTINATION + [`../TC-0-OPERATION.md`](../TC-0-OPERATION.md).

---

## 9. What a chapter must not contain

- Finished code the learner is meant to copy as the construction.
- Current Tower files as the exercise.
- A second walker, a painted book, a Hub plant.
- Technologies listed in that cycle’s **Must NOT introduce**.
- A promise of later cycles as reading homework (a one-line “door to next” is allowed).

---

## 10. Advance

Never advance because JOURNEY’s next heading exists.

Advance when:

1. Exit capability in the TC-N contract is demonstrated (see MASTERY), and
2. The contract’s **Next pressure** is visible to the learner.

If not, do not generate TC-(N+1).

---

## 11. JOURNEY amendments

JOURNEY is versioned. Splits (`TC-17` → `TC-17A` / `TC-17B`) and merges are legal when evidence shows smuggling or artificial separation.

An amendment must:

- increment the JOURNEY version,
- state the reason (usually: validated work showed X),
- leave RULES untouched.

An agent who “just teaches React this week” has violated this file.

---

## 12. Forbidden agent moves

- Generate more than one unvalidated chapter ahead.
- Type the learner’s construction.
- Optimize for finishing Tower quickly.
- Optimize for syntax without construction, or construction without required syntax.
- Treat Hub as the destination.
- Recut `workflowWalk.ts` in `omcoda_tower` as a teaching fork.

---

## Amendments

*(None. Founder-accepted changes only, dated, below this line.)*
