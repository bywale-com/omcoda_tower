# RULES — how teaching and generation must operate

**Mutability:** Hard. An agent must not amend this file to make a chapter easier, faster, or more like a tutorial. A change here requires explicit founder acceptance, written as a dated amendment at the bottom — not a silent edit.

**Companion:** [`JOURNEY.md`](./JOURNEY.md) is versioned and may split or merge cycles. [`TECHNOLOGY-MAP.md`](./TECHNOLOGY-MAP.md) is versioned with JOURNEY. This file may not spontaneously change the teaching law.

---

## 1. What this curriculum is

A book and a repository in one. It trains:

> intention → computational construction

Current Tower (`omcoda_tower`) is the **convergence test** for that class of system, not the answer key. Reproduction of Tower is not graduation. Matching Tower’s historical dependency pins is not graduation. See [`DESTINATION.md`](./DESTINATION.md) and [`MASTERY.md`](./MASTERY.md).

The pedagogical engine (construction-first, phenomenon before name, syntax as representation) stands. Encountering a mechanism is **not** the same as knowing how a competent product engineer works with that mechanism.

Production engineering is a set of **practices that become permanent early** (tests, CI, lint, Git craft, processes, networking, accessibility, compose, deploy) and then **grow**. It is not a late sequence of technologies.

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

Not merely: rudiment → mechanism → next concept.

**Feel the primitive. Build it once. Then graduate into the production representation. Point back at the mechanism so the tool is not magic. Then use the tool fluently until the next construction fails.**

This prevents:

```
bootcamp failure:
  Tailwind because "developers use Tailwind"

v1 curriculum failure:
  raw CSS forever because "we must understand the mechanism first"

v2 leftover:
  CI, Compose, e2e, lint, deploy discovered as late logos
```

Consequences:

- A named **Production bridge** requires rebuild (or first production use) and a **bridge proof**.
- **Not this cycle** means do not introduce that tool.
- Skipping a due bridge because the rudiment “worked” is a RULES break.
- Staying on the rudiment after the bridge was due is a RULES break.
- Teaching the tool before the mechanism is a RULES break.
- **Do not rebuild Tower Construction in Next.js.**

Thirty-six (or seventy-three) cycles was never the product. Competence is.

---

## 2c. Node toolchain ≠ Node application (immutable)

```
Node as TOOLCHAIN HOST    ≠    Node as APPLICATION RUNTIME
```

The first external build/test tool that genuinely requires Node makes the **host** visible (Vitest, TC-10). Vite/pnpm/lint deepen it (TC-13). **TC-27** is when the Node process *is* the product.

**Tailwind TC-4** uses the **standalone CLI**. Do not smuggle `package.json`, `node_modules`, or Vite into appearance. Name the Vite plugin path; earn it at TC-13.

---

## 2d. Toolchain pin (immutable)

**Current stable at first bridge for that JOURNEY version/cohort; then pinned for the active Construction repository. Upgrades are deliberate amendments, not silent drift.**

Do not inherit Tower’s historical pins unless a specific Tower *behavior* depends on the older version.

Do not silently regenerate later chapters on a new major because the internet moved.

One late-book cycle **performs** a meaningful upgrade (JOURNEY: TC-71). That exam is part of “when the stack changes, I do not collapse.”

---

## 2e. Practices grow; they are not rediscovered (immutable)

If a practice has arrived, later cycles **extend** it:

- Vitest (TC-10) is not replaced by RTL or Playwright; they join it.
- CI phase 1 (TC-18) grows until it proves the full system (TC-65). TC-65 must not be “what is GitHub Actions?”
- Playwright smoke (TC-38) stays; TC-63 deepens it.
- Compose as local start (TC-42) stays; TC-64 is the production image.
- Early deploy (TC-39) is not full delivery (TC-66).

---

## 3. Assumed literacy

The learner is a **software-construction beginner**, not a computer-literacy beginner.

**Assumed:** editor, browser, files and folders, that configs exist, GitHub as the **envelope** (clone, commit, push as the unit-boundary ritual).

**Not assumed:** TypeScript, JavaScript, HTML, CSS, React, frontend boot, state / routing / APIs / databases / auth / packages / tests / deploy / observability as constructions.

**Not assumed as Git craft** (the Git spine teaches these): branch strategy, rebase, conflict resolution as a skill, restore, revert vs rollback, cherry-pick, bisect, tags, reading history as diagnosis.

**Not assumed as systems craft:** PATH, PIDs, signals, who owns a port, what env a process reads, what an exit code is. `localhost:3000` must not remain an incantation.

A checkpoint that teaches “what is a folder?” is a RULES violation.

---

## 4. Syntax

Construction gives syntax meaning. Then that syntax is practiced to fluency.

- Do not begin a chapter by listing syntax.
- The moment the construction needs a representation, teach that syntax completely enough that the learner can **produce** it without looking.
- Required syntax is a mastery target. Unused syntax “for completeness” is forbidden.
- If the learner can explain the construction and cannot write the required syntax, the cycle is not done.

**Continuing spines.** TypeScript, JavaScript, SQL, tests, CI, DevTools, security, **accessibility, Git, systems/tooling, networking, time-as-data**. Do not generate “TC-12B — today’s lesson is generics / bash / Git.” Force the construct when the construction needs it. Do not assume `async`/`await`, `bisect`, or DNS because a later mechanism would like them known.

---

## 5. Names

Experience the phenomenon → describe it → understand the construction → **immediately** give the industry name.

No private vocabulary that later needs translation. No delayed naming to feel “pure.”

---

## 6. The chapter is the tutor

A generated chapter must be self-contained: intention, enough explanation, construction, syntax, experiments, names, proofs. If a production bridge is due, include pointing-back. If a spine item is due, it is in the chapter, not “later.”

The learner works **alone** for the stretch of the cycle.

The agent does not sit beside keystrokes. The agent moves at the **unit boundary**.

If the chapter cannot be worked without live tutoring, the chapter failed. Rewrite it. Do not pair-program the cycle.

---

## 7. Causal necessity, not ceremonial failure

Mechanisms arise from problems the previous construction cannot satisfy.

Do not require substantial time implementing an obviously inadequate construction merely so it can fail. If the learner accurately predicts the failure and explains why, the problem has been felt.

The production bridge is not ceremonial failure. Building the layout once in CSS so Tailwind has something to mean is **causal**. Months of hand-authored selectors after that is **ceremonial**. Manually running tests for forty cycles after Vitest exists is **ceremonial**.

---

## 7b. Software that verifies software

```
Predict → Explain → Transform → Break → Diagnose → Reconstruct → Transfer
```

is how **the learner** knows. It is not a substitute for **software that verifies software**, nor for a machine that runs those proofs.

```
I know what this should do
        → I can state the invariant
        → I can encode that invariant as a test
        → I can break the implementation
        → the test catches me
        → CI runs that without me
```

Vitest after functions. RTL after React. CI phase 1 as soon as those scripts exist. MSW when the net is a test dependency. Playwright smoke at the first real multi-face loop. Playwright full when the worker is part of the thing being protected.

A product engineer who can create a workflow engine but cannot confidently change it because nothing verifies it is not finished.

---

## 8. Generation law (how a chapter is made)

The agent generating **TC-N** must read, in this order:

1. This file (`RULES.md`)
2. [`MASTERY.md`](./MASTERY.md)
3. [`DESTINATION.md`](./DESTINATION.md)
4. [`TECHNOLOGY-MAP.md`](./TECHNOLOGY-MAP.md)
5. The **TC-N contract** in [`JOURNEY.md`](./JOURNEY.md)
6. The learner’s **validated TC-(N−1) work**

**JOURNEY + TECHNOLOGY-MAP prevent local arbitrariness.** No fashionable `async/await`, Tailwind, Next, Kubernetes, or Clerk.

**Previous work prevents rigidity.** Thin where mastery exists; thicken holes; **flag** split/merge. Do not silently rewrite JOURNEY or TECHNOLOGY-MAP, change RULES, skip a named bridge, copy `omcoda_tower` as the lesson, or drift the cohort pins.

**Do not regenerate TC-0, TC-1, or TC-2.**

---

## 9. What a chapter must not contain

- Finished code the learner is meant to copy as the construction.
- Current Tower files as the exercise.
- A second walker, a painted book, a Hub plant.
- Technologies listed in **Must NOT introduce**.
- A production tool listed as “not this cycle.”
- Package/build toolchain smuggled into TC-4.
- A promise of later cycles as reading homework (a one-line “door to next” is allowed).
- Mandatory Kubernetes, Kafka, Terraform, GraphQL, gRPC, multi-cloud, multi-state-manager, or multi-auth-vendor tourism.

---

## 10. Advance

Never advance because JOURNEY’s next heading exists.

Advance when:

1. Exit capability is demonstrated, including bridge proof if due, and spine items due this cycle, and
2. **Next pressure** is visible.

If not, do not generate TC-(N+1).

---

## 11. JOURNEY amendments

JOURNEY and TECHNOLOGY-MAP are versioned together. Splits and merges are legal when evidence shows smuggling or artificial separation.

An amendment must increment the JOURNEY version, stamp TECHNOLOGY-MAP if arrivals moved, state the reason, and leave RULES untouched.

---

## 12. Forbidden agent moves

- Generate more than one unvalidated chapter ahead.
- Type the learner’s construction.
- Optimize for finishing Tower quickly, or for a cycle count.
- Optimize for syntax without construction, or construction without required syntax.
- Treat Hub as the destination.
- Recut `workflowWalk.ts` in `omcoda_tower` as a teaching fork.
- Rebuild the Construction book as a Next.js app.
- Treat “we encountered the mechanism” as “we are fluent in the production tool.”
- Treat “we added a library” as “this is now an engineering practice.”
- Require equal fluency in Base UI + Radix + React Aria + Ant.
- Discover CI / Compose / e2e / lint in the last epoch as if they were new.

---

## Amendments

| Date | Change | Acceptance |
|---|---|---|
| 2026-10-05 | §2b Production Bridge law. TECHNOLOGY-MAP. Spines. Tests ≠ learner-proofs. TC-0–2 do not regenerate. Next.js is contrast. | Founder: *“Rudiment → mechanism → production bridge → production fluency.”* |
| 2026-10-05 | §2c Node host ≠ Node app; Tailwind TC-4 standalone CLI. §2d cohort pin + upgrade exam. §2e practices grow. Git/systems/network/a11y spines. Early CI/Playwright/Compose/deploy. No logo tourism. | Founder review of PR #123: practices permanent early; requested changes 1–12. |
