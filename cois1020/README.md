# COIS1020H — exam construction

Closed **assessment** for **one test**: *Programming for Computing Systems* using Microsoft Visual C#, **Chapter 1** and **Chapter 2** only.

**The PDFs define the assessment universe. They do not define the explanatory universe.**

This is not Tower Construction. Same teaching engine (construction before names). Move this folder out of the Tower repo when you are done.

**Source (what the test can ask):**

- [`source/P1ch01v3_Introduction.pdf`](./source/P1ch01v3_Introduction.pdf) — Ch 1
- [`source/P2ch02v2_Variables.pdf`](./source/P2ch02v2_Variables.pdf) — Ch 2

**Maps:** [`COVERAGE.md`](./COVERAGE.md) (every slide) · [`FOUNDATION-MAP.md`](./FOUNDATION-MAP.md) (no token stays magic)

Exam lane still has no `if`, loops, arrays, GUI, later chapters. Foundation lane **may** explain class, `static`, property vs method, nested calls — and **must**, if you have to type them.

---

## How many

Still **2 epochs**, **12 chapters (C0–C11)**. Not more exam chapters. Depth sits **under** them.

| Epoch | Cycles | PDF |
|---|---|---|
| 0 First program | C0–C2 | Ch 1 |
| 1 Using data | C3–C11 | Ch 2 |

Work **in order**. After C11:

`EXAM-SURFACE.md` → `MIXED-EXAM-1.md` → misses only → `MIXED-EXAM-2.md`

Mixed exams are EXAM only.

---

## Spec

| File | Job |
|---|---|
| [`COVERAGE.md`](./COVERAGE.md) | Every PDF page → EXAM bucket |
| [`FOUNDATION-MAP.md`](./FOUNDATION-MAP.md) | Explanatory spine so syntax is not incantation |
| [`JOURNEY.md`](./JOURNEY.md) | Cycle contracts (exam + foundation) |
| [`RULES.md`](./RULES.md) | Three lanes; **magic is forbidden** |
| [`MASTERY.md`](./MASTERY.md) | Ready for the test **and** no leftover boilerplate |
| [`DESTINATION.md`](./DESTINATION.md) | Pass this test |
| [`EXAM-SURFACE.md`](./EXAM-SURFACE.md) | **EXAM** retrieval only |
| [`book/MIXED-EXAM-1.md`](./book/MIXED-EXAM-1.md) · [`MIXED-EXAM-2.md`](./book/MIXED-EXAM-2.md) | Closed-book mixes (exam lane) |
| [`book/ANSWERS.md`](./book/ANSWERS.md) | Chapter drills + mixed exams |

---

## Cadence

1. Open `book/epoch-<k>/c<n>.md`
2. Predict in `my-work/c<n>/notes.md` **before** you run
3. Build in `constructions/c<n>/`
4. Do the FOUNDATION experiments the chapter names (not mixed-exam)
5. Reconstruct. No token you typed is “just the shape.”
6. Exam language from memory
7. Next chapter

**Reached:** C0. Start at [`book/epoch-0/c0.md`](./book/epoch-0/c0.md).
