# Tower Construction — curriculum specification

This folder is the **skeleton** of the Tower Construction repository. It is the specification, not the textbook.

| File | Mutability | Job |
|---|---|---|
| [`JOURNEY.md`](./JOURNEY.md) | Versioned. Amend deliberately (split/merge, version stamp). | Complete table of contents. One **contract** per planned cycle. Not a lesson. |
| [`RULES.md`](./RULES.md) | Hard to change. Founder acceptance required. | How any agent turns a contract into a chapter, and how teaching must operate. |
| [`MASTERY.md`](./MASTERY.md) | Hard to change (with RULES). | What “learned” means. Proofs. Fails. |
| [`DESTINATION.md`](./DESTINATION.md) | Versioned with JOURNEY if Tower’s destination spine changes. | The class of system. Convergence test. Transfer graduation. |

`book/epoch-N/` exists as a slot. **No chapter is generated until that cycle is reached.**  
`constructions/` and `my-work/` are empty slots until you construct.

**Reached:** [TC-1](./book/epoch-1/tc-1.md). Work it alone. Push `constructions/tc-1/page.html` and `my-work/tc-1/notes.md`.

**Validated:** [TC-0](./book/epoch-0/tc-0.md) — see `my-work/tc-0/evaluation.md`.

When TC-0 is accepted for generation, this tree is copied into a standalone **Tower Construction** repository. Until then it lives here, next to the inspection notes in `docs/construction/`.

Do not write `book/epoch-0/tc-0.md` from this folder as a side effect of editing the skeleton.
