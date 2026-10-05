# RULES — how this exam curriculum operates

**Mutability:** Hard. Do not amend to make a chapter easier or to add later C# the PDFs do not contain.

---

## 1. What this is

A book and a folder for **one test**. The PDFs in `source/` are the syllabus. Tower is a different project. Do not import Tower cycles, React, CSS, or “production fluency.”

The engine that *is* imported:

```
construction before mechanism
        → mechanism before terminology
        → terminology + syntax
        → independent construction
        → prediction
        → breaking
        → reconstruction
        → exam language
```

Never a vocabulary list before the phenomenon. Then **do** drill the names — the test will ask them.

---

## 2. Closed world

Allowed: only what Chapter 1 and Chapter 2 of these PDFs teach.

Forbidden to introduce (even “just a little”):

- `if` / `else` / `switch`
- loops
- arrays / lists
- methods you write besides `Main`
- Windows Forms / GUI
- file I/O
- object design, inheritance, `new` as OOP
- anything from a later COIS1020H chapter

If a chapter needs a fact not in the two PDFs, the chapter is wrong.

**Source purity.** Every assertion in the book is one of:

- **SOURCE** — explicitly on a slide in `source/`
- **EXPERIMENT** — directly observed from running code the PDFs require
- **removed**

No invisible general-C# augmentation (prefix/postfix *expression* semantics, “console host”, extra format characters you invented, extra Convert methods you invented).

**Coverage.** [`COVERAGE.md`](./COVERAGE.md) addresses every PDF page as CONSTRUCT, RECOGNIZE, MEMORIZE, or NON-TEST CONTENT with a reason. A slide with a table is not covered by naming three of the rows.

---

## 3. Exam language is not a skip

The test will ask “what is a placeholder,” “true or false: a constant can change after compile,” “name the integral types.”

Order still holds: **feel it, then name it, then say the name without the chapter.** Skipping the construction and memorizing `EXAM-SURFACE.md` is a fail of this folder. Skipping the names because “I built it” is a fail of the test.

---

## 4. Visual Studio is the course’s compiler face

The PDF compiles through Visual Studio: source → intermediate language (IL) → JIT → machine code.

Do not teach Linux command-line C# as the course path. If the learner compiles with `dotnet` because that is what they have, the **chain** is the same; Visual Studio is still the name the test may use.

---

## 5. Notes are for predictions, not essays

Empty notes are acceptable only if the files and a spoken recap prove the cycle. One leftover per cycle is enough. Do not turn this folder into a notes-compliance course.

---

## 6. One leftover, then advance

Each chapter names **one** leftover that the next chapter uses. Do not fail a cycle for a later PDF’s mechanism. Do not reopen a passed cycle as a third fail.

---

## 7. Mixed retrieval after C11

Isolated chapters are not the sitting. After C11: `EXAM-SURFACE.md` → `MIXED-EXAM-1.md` (closed book, no cycle labels) → review misses only → `MIXED-EXAM-2.md`. Do not skip the mix.
