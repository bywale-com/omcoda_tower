# COIS1020H — exam construction

Closed curriculum for **one test**: *Programming for Computing Systems* using Microsoft Visual C#, **Chapter 1** and **Chapter 2** only.

This is not Tower Construction. Same teaching engine (construction before names). Different destination (sit this test). Move this folder out of the Tower repo when you are done.

**Source (the test’s whole world):**

- [`source/P1ch01v3_Introduction.pdf`](./source/P1ch01v3_Introduction.pdf) — Ch 1, A First Program Using C#
- [`source/P2ch02v2_Variables.pdf`](./source/P2ch02v2_Variables.pdf) — Ch 2, Using Data

**Law:** if it is on a slide, it needs an address. Map: [`COVERAGE.md`](./COVERAGE.md).

Nothing outside those PDFs is in scope. No `if`. No loops. No arrays. No GUI. No classes-as-design. No later chapters. No general-C# facts the slides do not state.

---

## How many

| | Count | Why |
|---|---|---|
| **Epochs** | **2** | One per PDF. |
| **Chapters** | **12** (C0–C11) | Split where a sitting would smuggle two mechanisms. Not 9 (C7/C8 were overloaded). Not 15 (emergency study). |

| Epoch | Cycles | PDF | Destination fragment |
|---|---|---|---|
| 0 First program | C0–C2 | Ch 1 | A console program you can compile, name the parts of, and explain how it became machine code |
| 1 Using data | C3–C11 | Ch 2 | Named memory, numeric kinds + **full** format table, arithmetic, conversion, bool, char, string, input + Convert table, `const` |

All chapters are generated. This is a **closed exam**, not an open journey. Work **in order**. After C11:

`EXAM-SURFACE.md` → `MIXED-EXAM-1.md` → review misses only → `MIXED-EXAM-2.md`

---

## Spec

| File | Job |
|---|---|
| [`COVERAGE.md`](./COVERAGE.md) | Every PDF page → bucket + cycle |
| [`JOURNEY.md`](./JOURNEY.md) | Cycle contracts |
| [`RULES.md`](./RULES.md) | Teaching law (hard), including source purity |
| [`MASTERY.md`](./MASTERY.md) | Ready for the test |
| [`DESTINATION.md`](./DESTINATION.md) | Pass this test |
| [`EXAM-SURFACE.md`](./EXAM-SURFACE.md) | Full retrieval: words **and** slide tables |
| [`book/MIXED-EXAM-1.md`](./book/MIXED-EXAM-1.md) · [`MIXED-EXAM-2.md`](./book/MIXED-EXAM-2.md) | Closed-book mixes |
| [`book/ANSWERS.md`](./book/ANSWERS.md) | Chapter drills + mixed exams — attempt first |

---

## Cadence

1. Open the chapter: `book/epoch-<k>/c<n>.md`
2. Predict in `my-work/c<n>/notes.md` **before** you run
3. Build in `constructions/c<n>/`
4. Break it. Reconstruct a second file without the first open.
5. Close the chapter. Do the **exam language** questions from memory.
6. Next chapter.

Visual Studio is the course IDE (the PDF says command-line Linux is “not for us”). `dotnet` on a machine you already have is the same causal chain if Visual Studio is not in front of you.

**Reached:** C0. Start at [`book/epoch-0/c0.md`](./book/epoch-0/c0.md).
