# JOURNEY — cycle contracts

**Version:** 1  
**Closed:** Chapters 1 and 2 of the PDFs in `source/` only. Do not add cycles from later lectures.

Advance when **exit capability** is met and **next pressure** is visible. All chapters already exist because the test is the whole two PDFs.

---

## How to read a contract

| Field | Meaning |
|---|---|
| **Destination** | Capability this cycle exists to cause |
| **Prerequisites** | Prior exits that must be stable |
| **Construction** | What is built |
| **Forces** | Why the previous program is not enough |
| **Concepts expected** | Slide names, attached **after** the phenomenon |
| **Must produce** | Observable outcome |
| **Must NOT introduce** | Hard boundary |
| **Exit capability** | Ready for the next cycle *and* that slice of the test |
| **Next pressure** | Why the following cycle exists |

---

## Epoch 0 — A first program (PDF Ch 1)

Destination fragment: a console program you caused, whose parts you can name, whose path to machine code you can say.

### C0 — The line appears

**Destination:** The smallest causal chain from a `.cs` file to a line on the console.

**Prerequisites:** None.

**Construction:** A public static class with `Main` that writes one literal string and waits.

**Forces:** Nothing authored is being compiled into a running program.

**Concepts expected:** computer program / software · source · compile · `Main` · `WriteLine` · literal string · console application

**Must produce:** `constructions/c0/Program.cs` that prints a line you chose (course shape: hello + your name). Run it. Output matches intention.

**Must NOT introduce:** variables, data types, `using` as a lesson, comments as a lesson, identifier rules, IL/JIT names.

**Exit capability:** From a blank file, write a program with `Main` and `System.Console.WriteLine`, compile, run, see the line. Face one error and fix it.

**Next pressure:** The file is made of parts you did not invent. The test will ask what those parts are called.

---

### C1 — The parts of the program

**Destination:** Every token in C0’s program has a slide name, and you can change the program by changing a named part.

**Prerequisites:** C0.

**Construction:** Same program, rebuilt: identifiers that follow the rules; line and block comments; `using System;` so `Console` is enough; whitespace that does not change behavior.

**Forces:** You can make it run. You cannot yet *point* at namespace, access modifier, keyword, method header vs body.

**Concepts expected:** namespace · access modifier · keyword · identifier (rules) · method header · method body · whitespace · line comment `//` · block comment `/* */` · `using` directive · `System` · `Console` class

**Must produce:** `constructions/c1/Program.cs` plus a labeled copy in notes (or comments) naming: namespace, class identifier, `public`/`static`/`void`, `Main`, argument, literal string.

**Must NOT introduce:** variables as storage, numeric types, ReadLine-as-input (holding the screen is already in C0).

**Exit capability:** Given a printed program, label the parts. Switch between `System.Console.WriteLine` and `using System;` + `Console.WriteLine`. Comment out a line and restore it. Invent a legal identifier; reject an illegal one (`#`, keyword, starting with a digit).

**Next pressure:** The test will ask what a compiler *is*, and how this is not machine language.

---

### C2 — What the machine did

**Destination:** Exam language for the translation stack and for kinds of error.

**Prerequisites:** C1.

**Construction:** Break C1 on purpose (syntax). Produce wrong output on purpose (logic). Comment-out to disable a statement. Restore.

**Forces:** Running is not the same as being able to say: program, system vs application software, machine language vs high-level, compiler / interpreter / assembler, IL, JIT, debugging, procedural vs object-oriented (as the slide states it).

**Concepts expected:** system software · application software · machine language · high-level language · syntax · compiler · interpreter · assembler · programming logic · debugging · syntax error · logic error · IL · JIT · Visual Studio IDE · procedural program · method · object-oriented (C#’s claim on the slide)

**Must produce:** notes that distinguish one syntax failure from one logic failure you caused. Rebuild still runs.

**Must NOT introduce:** variables / types from Ch 2.

**Exit capability:** Explain source → IL → JIT → machine without the PDF. Define debugging. Say why C# is called object-oriented *in this course’s words*. List Visual Studio’s claimed advantages from the slide (color, click error to line, scaffolding).

**Next pressure:** Output so far is only literal strings. The test’s second PDF is named memory.

---

## Epoch 1 — Using data (PDF Ch 2)

Destination fragment: values that live in named storage, have a type, can be computed, converted, compared, and read from the keyboard.

### C3 — Named memory

**Destination:** A value lives in a named location; you can show it.

**Prerequisites:** C2.

**Construction:** Declare at least one `int` and one `double`, assign, display with `Write`, `WriteLine`, and a format string with a placeholder.

**Forces:** Literal strings cannot change from run to run. You need a place that *holds* a value.

**Concepts expected:** literal constant · variable · data type · declaration · `Write` vs `WriteLine` · format string · placeholder `{0}` · alignment `{0, 5}`

**Must produce:** `constructions/c3/Program.cs` that prints a stored number alone, then in a sentence with a placeholder, then three integers right-aligned in width 5.

**Must NOT introduce:** the full integral/float catalog, suffixes, arithmetic, casts, `ReadLine` as input.

**Exit capability:** Declare two ways (two statements; one statement with commas). Explain placeholder vs ordinary text in the string. Predict `Write` vs `WriteLine`.

**Next pressure:** `39.45` and `4` are not the same *kind* of number; money and whole counts need different types.

---

### C4 — Numeric kinds and printed form

**Destination:** Choose integral vs floating types; control how a number is printed.

**Prerequisites:** C3.

**Construction:** Use `int`, `float` (with `F`), `double`, `decimal` (with `M`). Print one value with default, `F`/`F1`/`F3`, `E`, `C`/`C3`. Write one scientific-notation literal.

**Forces:** A type is format, size, and allowed operations — not just “a number.”

**Concepts expected:** integral types (`byte`, `sbyte`, `short`, `ushort`, `int`, `uint`, `long`, `ulong`, `char`) · `float` / `double` / `decimal` · significant digits · suffixes `F` `D` `M` · scientific notation · format specifier + precision (`F`, `E`, `C`)

**Must produce:** a program matching the slide’s format demo *in spirit* (same specifiers, your number). Notes: why `float x = 54.7;` fails and `54.7F` works.

**Must NOT introduce:** operator precedence as a lesson, casts as a lesson, `bool`/`string` methods.

**Exit capability:** List the nine integral types and three floating types. Pick `decimal` for money and say why. Read `{0:C2}` aloud.

**Next pressure:** Stored numbers must be combined.

---

### C5 — Arithmetic

**Destination:** Compute with binary and shortcut operators; precedence is a rule, not left-to-right hope.

**Prerequisites:** C4.

**Construction:** Expressions using `+ - * / %`, unary `-`, `+=` (and kin), prefix and postfix `++` / `--`. One expression where parentheses change the result.

**Forces:** Displaying two numbers is not combining them.

**Concepts expected:** binary operator · unary operator · operand · operator precedence (`* / %` above `+ -`) · add-and-assign · prefix vs postfix increment/decrement

**Must produce:** program that prints results you predicted in notes *before* running, including one prefix vs postfix pair.

**Must NOT introduce:** implicit/explicit cast as the lesson (integer division `7/4` may *appear* — name it as leftover for C6).

**Exit capability:** Evaluate `3 + 4 * 2` and `(3 + 4) * 2` without running. Rewrite `total = total + val` as `total += val`. Say whether `++x` and `x++` differ when the value is *used* in the same statement.

**Next pressure:** `7 / 4` stored in a `double` is `1.0`. Types do not forgive.

---

### C6 — Conversion

**Destination:** Same-type arithmetic keeps the type; mixed types unify; you can force a cast.

**Prerequisites:** C5.

**Construction:** Show `7 / 4` in a `double` (truncation). Fix with an explicit cast. Show one implicit widening (e.g. `int` into `double`).

**Forces:** Precedence does not explain lost fractions.

**Concepts expected:** unifying type · implicit cast · explicit cast · type precedence (integrals widen; `float` → `double`; `decimal` is special — as the slide)

**Must produce:** two lines of output: truncated division vs `7 / (double)4` (or equivalent). Notes: which conversion you did not write because C# did it.

**Must NOT introduce:** `bool`/`char`/`string` catalog.

**Exit capability:** Define implicit vs explicit. Predict `double r = 7 / 4;`. Write the cast that preserves the fraction.

**Next pressure:** Not every value is a number.

---

### C7 — Other values (bool, char, string)

**Destination:** True/false, a single character, a series of characters — each with the operations the slides give.

**Prerequisites:** C6.

**Construction:** `bool` from a comparison; `char` in single quotes; one escape; `string` in double quotes; `==` / `Equals` / `Compare` / `CompareTo`; `Length`; `Substring`.

**Forces:** Numeric types cannot hold “done,” `'A'`, or a name.

**Concepts expected:** `bool` · comparison operator · `char` · escape sequence · `string` · `Equals` · `Compare` · `CompareTo` (negative / zero / positive) · `Length` · `Substring`

**Must produce:** program that prints a comparison, a `CompareTo` integer, a length, and a substring. Notes: `'r'` vs `"r"`.

**Must NOT introduce:** `ReadLine` as typed input (C8). Named `const` as the lesson.

**Exit capability:** Declare `bool`, `char`, `string`. Explain why Compare of “Alaa” vs “John” is negative. Use `Length` and `Substring` on a word you chose.

**Next pressure:** Values so far are authored in the source. The slide’s programs ask the occupant.

---

### C8 — Input and named constants

**Destination:** Keyboard text becomes a typed value; some names must not change.

**Prerequisites:** C7.

**Construction:** Prompt; `ReadLine` into a `string`; `Convert.ToDouble` (nested or via a string variable); a `const` rate; print with placeholders and currency format. Second `const` that makes a conversion self-documenting (inches in a foot, or equivalent).

**Forces:** Literals in source cannot be the user’s price. Magic numbers in expressions cannot explain themselves.

**Concepts expected:** interactive program · `Console.ReadLine` (input is a string) · `Convert.ToDouble` (and kin) · named constant · `const` · ALL_CAPS with underscores · self-documenting

**Must produce:** `constructions/c8/Program.cs` in the shape of the tax example: enter a price, see tax money. A named constant, not a bare `0.06` in the multiply.

**Must NOT introduce:** anything outside Ch 2.

**Exit capability:** Explain why `ReadLine` cannot go straight into a `double` without conversion. Write `const double TAX_RATE = 0.06;`. Replace a magic number with a named constant and say why the statement is self-documenting. Answer Ch 2’s knowledge-check items from memory.

**Next pressure:** None. This is the closed syllabus. Drill [`EXAM-SURFACE.md`](./EXAM-SURFACE.md).
