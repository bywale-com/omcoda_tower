# RULES — how this exam curriculum operates

**Mutability:** Hard. A change here requires founder acceptance.

---

## 1. What this is

A book and a folder for **one test**. The PDFs in `source/` are the **assessment** syllabus. Tower is a different project.

The engine:

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

Never a vocabulary list before the phenomenon. Then **do** drill the exam names — the test will ask them.

---

## 2. Closed assessment, open explanation

**The PDFs define the assessment universe. They do not define the explanatory universe.**

Those are not the same constraint.

| Lane | Job |
|---|---|
| **EXAM** | Directly supported by the PDFs. Can be tested. Must reproduce the professor’s terminology. Map: [`COVERAGE.md`](./COVERAGE.md) · [`EXAM-SURFACE.md`](./EXAM-SURFACE.md). |
| **FOUNDATION** | Outside explanation required to understand the EXAM material **from zero**. Constructed in the chapters. **Not** added to the test surface or mixed exams. Map: [`FOUNDATION-MAP.md`](./FOUNDATION-MAP.md). |
| **CONTEXT** | Useful orientation (e.g. modern C# top-level statements). Optional. Never required for this test. Marked **CONTEXT — not on this test.** |

Forbidden as **exam** content (do not drill, do not put on mixed exams):

- `if` / `else` / `switch`, loops, arrays, GUI, file I/O, inheritance, methods you write besides `Main`
- later COIS1020H chapters
- extra format letters or Convert methods **not** on the slide tables
- prefix vs postfix **expression-value** semantics (the PDF only shows both as `x = x + 1`)
- modern top-level statements as the course representation

Those bans do **not** forbid FOUNDATION answers to “what is a class / static / a property / a nested call?”

**Coverage (EXAM).** Every PDF page has an address in [`COVERAGE.md`](./COVERAGE.md). A slide table is not covered by naming three of the rows.

---

## 3. Magic is forbidden

If the learner is required to type or reproduce syntax, **every meaningful token and relationship in that syntax must eventually be owned.**

A token may be temporarily opaque for one sitting. It may not remain boilerplate across chapters.

```text
public static void Main()
```

is not “the shape you write.” Eventually:

```text
public      accessibility
static      belongs to the type rather than an instance
void        return type: returns no value
Main        method identifier; classic application entry point
( )         parameter list; empty here
{ }         method body
```

EXAM wording can still be the slide’s sentence (“every console application must have a `Main()` method”). FOUNDATION is why that sentence is not an incantation.

---

## 4. Exam language is not a skip

The test will ask “what is a placeholder,” “true or false: a constant can change after compile,” “name the integral types.”

Order still holds: **feel it, then name it, then say the exam name without the chapter.** Skipping construction and memorizing `EXAM-SURFACE.md` is a fail. Skipping exam names because “I understood the foundation” is a fail of the test. Skipping foundation because “the slide didn’t say static” is a fail of **magic is forbidden**.

---

## 5. Visual Studio is the course’s compiler face

The PDF compiles through Visual Studio: source → intermediate language (IL) → JIT → machine code.

Do not teach Linux command-line C# as the **course path**. If the learner compiles with `dotnet`, the chain is the same; Visual Studio is still the exam name.

---

## 6. Notes are for predictions, not essays

Empty notes are acceptable only if the files and a spoken recap prove the cycle. One leftover per cycle is enough.

---

## 7. One leftover, then advance

Each chapter names **one** leftover that the next chapter uses. Do not fail a cycle for a later PDF’s mechanism.

---

## 8. Mixed retrieval after C11

Isolated chapters are not the sitting. After C11: `EXAM-SURFACE.md` → `MIXED-EXAM-1.md` → review misses only → `MIXED-EXAM-2.md`.

Mixed exams are **EXAM lane only**. Do not ask FOUNDATION (property vs method, internal vs public, instance vs static) as if the professor will.
