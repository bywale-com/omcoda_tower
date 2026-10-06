# JOURNEY — cycle contracts

**Version:** 3  
**Assessment universe:** Chapters 1 and 2 of the PDFs in `source/` only. [`COVERAGE.md`](./COVERAGE.md) · [`EXAM-SURFACE.md`](./EXAM-SURFACE.md).  
**Explanatory universe:** [`FOUNDATION-MAP.md`](./FOUNDATION-MAP.md). The PDFs do **not** cap what you may understand.

Advance when **exit capability** is met (exam **and** no remaining magic for this cycle’s syntax) and **next pressure** is visible.

---

## How to read a contract

| Field | Meaning |
|---|---|
| **Destination** | Capability this cycle exists to cause |
| **Prerequisites** | Prior exits that must be stable |
| **Construction** | What is built |
| **Forces** | Why the previous program is not enough |
| **Concepts expected** | **EXAM** names, attached after the phenomenon |
| **Foundation** | **FOUNDATION** lane — owned this cycle; not mixed-exam |
| **Must produce** | Observable outcome |
| **Must NOT introduce (exam)** | Do not add to the test surface |
| **Exit capability** | Ready for the next cycle *and* that slice of the test; tokens of this cycle are not boilerplate |
| **Next pressure** | Why the following cycle exists |

---

## Epoch 0 — A first program (PDF 1)

### C0 — A program begins

**Destination:** The smallest causal chain from a `.cs` file to a line on the console — and no token in the slide program remains boilerplate.

**Prerequisites:** None.

**Construction:** The lab-shape program (PDF p.31). Then read file/source/program/compile/run; class; method; entry point; one statement. FOUNDATION experiments: rename class; omit `public` on class; non-static class + static `Main`; drop `static` from `Main`.

**Forces:** Nothing authored is being compiled into a running program.

**Concepts expected (EXAM):** computer program / software · source · `Main` · `void` · `WriteLine` · literal string · argument · console application · curiosity, patience, practice · face errors

**Foundation:** file vs source vs program vs compiled result vs process · class/type · `public` · `static` (class vs `Main`) · instance vs type · method/function · entry point · `void` · parameter list vs argument · braces · statement · semicolon · namespace · `.` · method call · compile vs run

**Must produce:** `constructions/c0/Program.cs` in the lab shape. Run it. Face a missing-semicolon syntax failure. Complete 0.6 D–F (or written predictions + compile results).

**Must NOT introduce (exam):** identifier convention tables, IL/JIT names, variables, `using` as a lesson, top-level statements as the course shape.

**Exit capability:** From a blank file, write the slide program, compile, run. Point at every token and say what it does (foundation). Know which words are load-bearing for starting (`static` on `Main`) vs slide clothing (`static` on the class).

**Next pressure:** The test will also ask identifier **rules**, comments, and `using`.

---

### C1 — Parts

**Destination:** Tokens, identifier **legality and convention**, comments, `using`.

**Prerequisites:** C0.

**Construction:** Same program rebuilt. Label: namespace, identifier, access modifier, argument, method, literal string. Conventional vs unconventional-but-legal vs illegal class names (Tables 1-2, 1-3, 1-4). Keyword table as recognize (Table 1-1). Line and block comments. `using System;`.

**Forces:** Running is not labeling; legal is not conventional.

**Concepts expected:** namespace · access modifier · keyword · identifier rules · conventional / unconventional / illegal · method header / body · whitespace · `//` `/* */` · comment out · using directive · System as root namespace, part of .NET · Console = standard in/out/error · `void` returns nothing · every console app has `Main()`

**Must produce:** labeled program + notes that classify at least two names from each of Tables 1-2, 1-3, 1-4.

**Must NOT introduce (exam):** “console host” as exam lore; variables as storage; Ch 2 types. (FOUNDATION entry point already C0.)

**Exit capability:** Given a printed program, label the p.11 tokens. Switch `System.Console` vs `using System`. Invent a conventional name; reject an illegal one; flag an unconventional-but-legal one.

**Next pressure:** How source became machine code; what programming is.

---

### C2 — Translation + errors

**Destination:** Exam language for programming, software, translation, errors.

**Prerequisites:** C1.

**Construction:** One syntax break; one logic break (wrong output that still compiles). Restore.

**Forces:** Running is not explaining the stack.

**Concepts expected:** solving problems / designing instructions / developing things · system vs application software · machine vs high-level · compiler / interpreter / assembler · programming logic · debugging · syntax vs logic error · IL · JIT · Visual Studio advantages · procedural + methods · C# as OO (slide’s claim) · sample bytes vs `int x = 5`

**Must produce:** notes naming one syntax failure and one logic failure you caused.

**Must NOT introduce:** Ch 2 data.

**Exit capability:** Source → IL → JIT → machine. Define debugging as removing syntax **and** logical errors. Course framing (why programming; curiosity/patience/practice already C0).

**Next pressure:** Output is still only literal strings.

---

## Epoch 1 — Using data (PDF 2)

### C3 — Named memory + display

**Destination:** A value lives in a named location; you can show it.

**Prerequisites:** C2.

**Construction:** Declare; `Write` / `WriteLine`; placeholder `{0}`; alignment `{0, 5}`.

**Forces:** Literal strings cannot hold a changing number.

**Concepts expected:** literal constant · variable · data type · declaration · format string · placeholder

**Foundation:** type vs identifier vs `=` vs literal vs `;` · declaration vs initialization vs assignment · expression vs statement · named location in memory

**Must produce:** number alone; sentence with `{0}`; three ints width 5.

**Must NOT introduce:** full Table 2-1, suffixes, arithmetic, Convert.

**Exit capability:** Two declaration styles. Placeholder purpose. `Write` vs `WriteLine`.

**Next pressure:** Kinds of numbers and how they print.

---

### C4 — Numeric kinds + numeric formatting

**Destination:** Table 2-1 and Table 2-2 are retrievable; suffixes and the F/E/C demo run.

**Prerequisites:** C3.

**Construction:** `int`, `float`+`F`, `double`, `decimal`+`M`. Format demo from p.17. Recall **all nine** format characters and Table 2-1 columns (system type, bytes, signed/unsigned, range, `object`).

**Forces:** `39.45` and `4` are not the same kind; `{0:F}` is not the whole format table.

**Concepts expected:** nine integral types · three floating types · Table 2-1 · suffixes F D M · scientific E · nine format characters C D E F G N P R X · form `X0`

**Must produce:** running format demo; notes that recopy Table 2-2 meanings without looking; Table 2-1 at least type / system type / bytes / signed vs unsigned for integrals.

**Must NOT introduce:** operator precedence as the lesson; implicit/explicit as the lesson.

**Exit capability:** List nine integrals and three floats. Why `float x = 54.7;` fails. What `P`, `X`, `R`, `N`, `G`, `D` mean on Table 2-2. `int` system type is Int32.

**Next pressure:** Combine numbers.

---

### C5 — Arithmetic

**Destination:** Binary, unary, Table 2-3, precedence, shortcuts. Prefix and postfix as **two writings of +1**, not expression-value semantics.

**Prerequisites:** C4.

**Construction:** Table 2-3 examples including **45 / 2 is 22 (not 22.5)**. Precedence. `+=` and kin. `++someValue` and `someValue++` each as `someValue = someValue + 1`. `--`.

**Must NOT introduce:** printing `n++` vs `++n` to show old vs new value (not on the PDF). Casts as the lesson.

**Exit capability:** Evaluate `3+4*2`. Recite Table 2-3 including integer division example. Write both increment forms as equivalent to `x = x + 1`.

**Next pressure:** `7 / 4` stored in a `double` is `1.0`.

---

### C6 — Conversion

**Destination:** Unifying type; implicit vs explicit; the 7/4 contrast from the PDF.

**Prerequisites:** C5.

**Construction:** `double truncated = 7 / 4;` and `7 / (double)4`. One implicit `int` into `double`.

**Concepts expected:** unifying type · higher type precedence · integrals widen to larger integral and floating; float→double · implicit cast · explicit cast

**Must NOT introduce:** bool/char/string catalog.

**Exit capability:** Predict `double r = 7 / 4;`. Write the explicit cast. State int can convert to long, float, double, or decimal.

**Next pressure:** Not every value is a number.

---

### C7 — Bool + comparisons

**Destination:** `true`/`false` and Table 2-4.

**Prerequisites:** C6.

**Construction:** `bool done = true;` plus each comparison operator from Table 2-4 (true example and false example, as the table).

**Must NOT introduce:** char escapes, string methods.

**Exit capability:** Recite Table 2-4 operators. A comparison expression has a Boolean value.

**Next pressure:** A single character is not a `bool` and not a `string`.

---

### C8 — Char + escape sequences

**Destination:** `char` in single quotes; **Table 2-5** complete.

**Prerequisites:** C7.

**Construction:** `char letter = 'r';` Print at least `\'` `\\` `\n` `\t`. Recite the rest of Table 2-5 (null, alert, backspace, form feed, carriage return, vertical tab, double quote).

**Must NOT introduce:** string Compare/Length/Substring as the lesson.

**Exit capability:** `'r'` vs a string. Full escape table from memory (sequence + character name).

**Next pressure:** A series of characters.

---

### C9 — String operations

**Destination:** string literals; `==` (slide: not recommended); Equals; Compare / CompareTo; Length; Substring figure.

**Prerequisites:** C8.

**Construction:** Amy/Matthew `==` program; Alaa/John CompareTo; `"water".Length`; Substring(0,1)/(0,2)/(1,2) as the figure. Note the figure’s last two lines are marked wrong on the slide.

**Must NOT introduce (exam):** ReadLine as typed input.

**Foundation:** static method vs instance method · property vs method (`Length` has no `()`) · zero-based position

**Exit capability:** Quote rules. Equals → bool. CompareTo negative/zero/positive. Length of water is 5. Substring(start, length) on the figure’s first three lines.

**Next pressure:** Values authored in source vs the keyboard.

---

### C10 — Console input + Convert

**Destination:** `ReadLine` is a string; Convert table; tax-shaped program.

**Prerequisites:** C9.

**Construction:** Name prompt; tax via string then `Convert.ToDouble`; nested `Convert.ToDouble(Console.ReadLine())`. Rate is an ordinary variable (`double taxRate = 0.06;`). Recite **Table 2-6**.

**Must NOT introduce (exam):** `const` / named constants. Inventing Convert methods not on the table.

**Foundation:** nested calls · return value as argument · `Convert` as a type with static methods

**Exit capability:** Why a `double` cannot be assigned `ReadLine()` directly. `ToDouble`, `ToInt32`, `ToBoolean`, `ToDecimal`, `ToSingle`, unsigned `ToUInt32`, `ToString`, `ToChar`, `ToByte`, `ToSByte`, `ToInt16`/`ToInt64`/`ToUInt16`/`ToUInt64` as the table names them.

**Next pressure:** `0.06` is a fact that must not change. An ordinary variable still can.

---

### C11 — Named constants + self-documenting

**Destination:** `const` cannot change; ALL_CAPS; self-documenting expression.

**Prerequisites:** C10.

**Construction:** Rebuild C10’s tax with `const double TAX_RATE = 0.06;` (pressure: this fact must not change). Also `const int INCHES_IN_A_FOOT = 12;`. Self-documenting multiply. Attempt to assign to the const; compile fails.

**Must NOT introduce (exam):** anything outside Ch 2.

**Foundation:** mutable binding vs `const` · compile-time enforcement

**Exit capability:** Knowledge check 1–4 from memory. Self-documenting example. `const` naming convention.

**Next pressure:** None. `EXAM-SURFACE.md` then mixed exams.
