# COIS1020H — exam construction

Closed curriculum for **one test**: *Programming for Computing Systems* using Microsoft Visual C#, **Chapter 1** and **Chapter 2** only.

This is not Tower Construction. Same teaching engine (construction before names). Different destination (sit this test). Move this folder out of the Tower repo when you are done.

**Source (the test’s whole world):**

- [`source/P1ch01v3_Introduction.pdf`](./source/P1ch01v3_Introduction.pdf) — Ch 1, A First Program Using C#
- [`source/P2ch02v2_Variables.pdf`](./source/P2ch02v2_Variables.pdf) — Ch 2, Using Data

Nothing outside those PDFs is in scope. No `if`. No loops. No arrays. No GUI. No classes-as-design. No later chapters.

---

## How many

| | Count | Why |
|---|---|---|
| **Epochs** | **2** | One per PDF. |
| **Chapters** | **9** (C0–C8) | Split where the PDF introduces a new construction. Merge would smuggle two mechanisms into one sitting. |

| Epoch | Cycles | PDF | Destination fragment |
|---|---|---|---|
| 0 First program | C0–C2 | Ch 1 | A console program you can compile, name the parts of, and explain how it became machine code |
| 1 Using data | C3–C8 | Ch 2 | Named memory, numeric kinds, arithmetic, conversion, other types, input + `const` |

All chapters are generated. This is a **closed exam**, not an open journey. Work **in order**. Do not start on the exam sheet until you have constructed through C8 — then cram from [`EXAM-SURFACE.md`](./EXAM-SURFACE.md).

---

## Spec

| File | Job |
|---|---|
| [`JOURNEY.md`](./JOURNEY.md) | Cycle contracts |
| [`RULES.md`](./RULES.md) | Teaching law (hard) |
| [`MASTERY.md`](./MASTERY.md) | What “ready for the test” means |
| [`DESTINATION.md`](./DESTINATION.md) | Pass this test |
| [`EXAM-SURFACE.md`](./EXAM-SURFACE.md) | Every name and syntax the PDFs can ask |
| [`book/ANSWERS.md`](./book/ANSWERS.md) | Drill answers — attempt the chapter first |

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
