# COVERAGE — every PDF page has an address

**Law (EXAM):** if it is on a slide, it needs an address. This file is the **assessment** map. Explanation that is not on the slides lives in [`FOUNDATION-MAP.md`](./FOUNDATION-MAP.md).

**Buckets**

| Bucket | Meaning |
|---|---|
| **CONSTRUCT** | You cause it in a `.cs` file this cycle. |
| **RECOGNIZE** | You identify it on sight (table row, labeled token, illegal name). You are not required to recite the whole list from a blank mind unless the row also says MEMORIZE. |
| **MEMORIZE** | You can produce the slide’s fact without the PDF. |
| **NON-TEST CONTENT** | On the PDF, but not a testable surface. Reason required. |

**Source files:** `source/P1ch01v3_Introduction.pdf` (34 pages) · `source/P2ch02v2_Variables.pdf` (48 pages). Page numbers below are **PDF page indices**. Footer numbers on some slides differ; PDF page is the key.

**Source purity (with RULES):** every assertion in the book is **SOURCE** (on a slide), **EXPERIMENT** (observed from code the PDF requires), or **removed**.

---

## PDF 1 — A First Program Using C#

| PDF p. | Slide title / surface | Bucket | Cycle |
|---|---|---|---|
| 1 | Course + Chapter 1 title | RECOGNIZE | — (identity) |
| 2 | Why programming; everyday systems; who implemented them | MEMORIZE | C2 |
| 3 | Programming = solving problems, designing instructions, developing things; like a language; you talk with the computer | MEMORIZE | C2 |
| 4 | First program; face errors; curiosity, patience, practice; GET YOUR HANDS DIRTY | MEMORIZE | C0 |
| 5 | Computer program / software; system vs application software | MEMORIZE | C0 (program), C2 (categories) |
| 6 | Machine language (1s/0s) vs high-level (syntax, read/write/add) | MEMORIZE | C2 |
| 7 | `int x=5` vs sample machine bytes | RECOGNIZE | C2 |
| 8 | Compiler / interpreter / assembler; programming logic; debugging | MEMORIZE | C2 |
| 9 | Procedural: named memory + steps; procedures/methods invoked | MEMORIZE | C2 |
| 10 | C#: OO, Visual Studio GUI, after C++, similar to Java | MEMORIZE | C2 |
| 11 | First program; labels: literal string, argument, method, namespace, identifier, access modifier | CONSTRUCT + RECOGNIZE | C0 run, C1 labels |
| 12 | Namespace groups similar classes (toolbox graphic) | MEMORIZE | C1 |
| 13 | Access modifier; keywords | MEMORIZE | C1 |
| 14 | Whitespace | CONSTRUCT | C1 |
| 15 | Method header vs body | CONSTRUCT + MEMORIZE | C1 |
| 16 | Every console app has `Main()`; `void` returns nothing | CONSTRUCT + MEMORIZE | C0, C1 |
| 17 | Identifier requirements (begin / contain / not keyword) | MEMORIZE | C1 |
| 18 | **Table 1-1** C# reserved keywords | RECOGNIZE | C1 |
| 19 | **Table 1-2** valid and conventional class names + rules | MEMORIZE | C1 |
| 20 | **Table 1-3** unconventional-but-legal (overlay) + rules | MEMORIZE | C1 |
| 21 | **Table 1-3** unconventional-but-legal with reasons | MEMORIZE | C1 |
| 22 | Illegal class names (unlabeled column) | RECOGNIZE | C1 |
| 23 | **Table 1-4** illegal class names with reasons | MEMORIZE | C1 |
| 24 | Comments; comment out; `//` and `/* */` | CONSTRUCT + MEMORIZE | C1 |
| 25 | Line and block comment examples | CONSTRUCT | C1 |
| 26 | Fully commented program; ReadLine “holds the output screen for Windows computers” | CONSTRUCT | C0 (hold screen), C1 (comments) |
| 27 | `System.Console` form; System is root namespace, part of .NET; Console = stdin/stdout/stderr | CONSTRUCT + MEMORIZE | C1 |
| 28 | `using System;` (“using clause or using directive”); `Console.WriteLine` | CONSTRUCT + MEMORIZE | C1 |
| 29 | Source → IL → JIT → machine code; VS vs Linux CLI (“not for us”) | MEMORIZE | C2 |
| 30 | VS advantages; install mentioned | MEMORIZE (advantages) | C2 |
| 31 | Lab: Hello COIS1020H + name | CONSTRUCT | C0 |
| 32 | Summary: program; C# is OO; `WriteLine` | MEMORIZE | C2 |
| 33 | Summary: identifiers; comments document or disable; create in VS | MEMORIZE | C1, C2 |
| 34 | “Syllabus” title card, no items | NON-TEST CONTENT | Empty slide; no facts to retrieve |

---

## PDF 2 — Using Data

| PDF p. | Slide title / surface | Bucket | Cycle |
|---|---|---|---|
| 1 | Chapter 2 title | RECOGNIZE | — |
| 2 | Learning objectives | RECOGNIZE | map of C3–C11 |
| 3 | Literal constant vs variable vs data type | MEMORIZE | C3 |
| 4 | **Table 2-1** C# data types (system type, bytes, signed/unsigned, ranges, `object`) | MEMORIZE | C4 (full); rows reused C3, C7, C8, C9 |
| 5 | Declaration; multiple names; `int myAge = 25;` | CONSTRUCT | C3 |
| 6 | Display a `double` with `WriteLine` | CONSTRUCT | C3 |
| 7 | `Write` then `WriteLine` | CONSTRUCT | C3 |
| 8 | Format string; placeholder `{n}` | MEMORIZE | C3 |
| 9 | `"The money is ${0} exactly"` | CONSTRUCT | C3 |
| 10 | Alignment `{0, 5}` | CONSTRUCT | C3 |
| 11 | Nine integral types; `int` holds whole numbers; shorter integer types | MEMORIZE | C4 |
| 12 | `float` / `double` / `decimal` (digits, money) | MEMORIZE | C4 |
| 13 | Suffixes `F` `D` `M`; incorrect vs correct literals | CONSTRUCT | C4 |
| 14 | Scientific notation (`E`) | MEMORIZE | C4 |
| 15 | Standard numeric format strings form `X0`; **nine** built-in format characters | MEMORIZE | C4 |
| 16 | **Table 2-2** C D E F G N P R X | MEMORIZE | C4 |
| 17 | Format demo `{0}` `F` `F1` `F3` `E` `C` `C3` | CONSTRUCT | C4 |
| 18 | Binary vs unary; `z = x + y`; `z = -x` | CONSTRUCT | C5 |
| 19 | **Table 2-3** + − * / % ; **45 / 2 is 22 (not 22.5)** | CONSTRUCT + MEMORIZE | C5 |
| 20 | Precedence `* / %` over `+ -`; parentheses | CONSTRUCT | C5 |
| 21 | `+=` `-=` `*=` `/=`; prefix `++x` and postfix `x++` as two writings of `x = x + 1`; `--` | CONSTRUCT | C5 |
| 22 | Edition footer only, no teaching content | NON-TEST CONTENT | Decorative slide |
| 23 | Same-type keeps type; unifying type; implicit widening (int→long/float/double/decimal; float→double) | MEMORIZE | C6 |
| 24 | **Table 2-1** repeated | MEMORIZE | C4 (same table) |
| 25 | Implicit vs explicit; `7/4` → 1.0 vs `7/(double)4` → 1.75 | CONSTRUCT | C6 |
| 26 | `bool`; comparison yields Boolean | CONSTRUCT | C7 |
| 27 | **Table 2-4** `< > == <= >= !=` with true/false examples | CONSTRUCT + MEMORIZE | C7 |
| 28 | `char`; single quotes `letter = 'r'` | CONSTRUCT | C8 |
| 29 | **Table 2-5** escape sequences | MEMORIZE; CONSTRUCT a subset | C8 |
| 30 | `string`; double quotes; `==` `!=`; Equals, Compare, CompareTo | CONSTRUCT | C9 |
| 31 | Figure 2-11 `==` comparison; caption **(not recommended)**; Amy/Matthew output | CONSTRUCT + MEMORIZE | C9 |
| 32 | `Equals()` → Boolean | MEMORIZE | C9 |
| 33 | `Compare` / `CompareTo` → negative / zero / positive | MEMORIZE | C9 |
| 34 | Alaa vs John → −1, −1 | CONSTRUCT | C9 |
| 35 | `Length`; `"water"` is 5 | CONSTRUCT + MEMORIZE | C9 |
| 36 | **Figure 2-15** `Substring(start, length)` on `"water"`; last two lines marked wrong on the slide | CONSTRUCT + MEMORIZE | C9 |
| 37 | Interactive; `ReadLine` until Enter; **all input is a string**; convert to proper type | CONSTRUCT + MEMORIZE | C10 |
| 38 | Name prompt + `ReadLine` | CONSTRUCT | C10 |
| 39 | Tax: string then `Convert.ToDouble`, `{0}` `{1:C}` `{2:C}` (slide lists `const`; C10 reconstructs with an ordinary `taxRate`) | CONSTRUCT | C10 input/convert; C11 earns `const` |
| 40 | Nested `Convert.ToDouble(Console.ReadLine())` | CONSTRUCT | C10 |
| 41 | **Table 2-6** Convert methods | MEMORIZE | C10 |
| 42 | Named constant `const`; ALL_CAPS with underscores | CONSTRUCT + MEMORIZE | C11 |
| 43 | Self-documenting `lengthFeet * INCHES_IN_A_FOOT` | CONSTRUCT + MEMORIZE | C11 |
| 44 | Summary (types, operators, shortcuts) | MEMORIZE | C3–C5 |
| 45 | Summary (bool, casts, char, string, const, ReadLine) | MEMORIZE | C6–C11 |
| 46 | Knowledge check (4 items) | MEMORIZE | mixed exams |
| 47 | Discussion: always int/float? implicit vs explicit | RECOGNIZE (talk) | mixed exams |
| 48 | “Why is using the right data types important in coding?” | RECOGNIZE / TALK | Mixed exams. No canned SOURCE sentence — the PDF does not give one. Answer only from mechanisms already established (ranges, integer `/`, `decimal` for money, `ReadLine` as string, …). |
| 48 | “Easy for beginners?” / “What may be more challenging?” | NON-TEST CONTENT | Meta reflection; not a fact from Ch 1–2 |

---

## Exam-lane exclusions (do not drill / do not mix-exam)

True in C#, **not** on these PDFs as test items:

- Prefix vs postfix **expression value** (`WriteLine(n++)` vs `++n`). The PDF only shows both as `someValue = someValue + 1`.
- “Console host looks for `Main`.” **EXAM:** every console application must have `Main()`; `void` returns nothing. **FOUNDATION (C0):** static entry point — that is allowed explanation, not extra exam lore.
- `if`, loops, arrays, GUI, methods you write besides `Main`, later chapters, top-level statements as the course shape.

Foundation **may** explain class, `static`, property vs method, nested calls. It may **not** expand the mixed exams.

---

## After the chapters

| Artifact | Job |
|---|---|
| [`FOUNDATION-MAP.md`](./FOUNDATION-MAP.md) | Explanatory spine (not mixed-exam) |
| [`EXAM-SURFACE.md`](./EXAM-SURFACE.md) | Full retrieval lists and tables |
| [`book/MIXED-EXAM-1.md`](./book/MIXED-EXAM-1.md) | Closed-book, no cycle labels |
| Review misses only | |
| [`book/MIXED-EXAM-2.md`](./book/MIXED-EXAM-2.md) | Second mix |
| [`book/ANSWERS.md`](./book/ANSWERS.md) | Chapter drills + both mixed exams |
