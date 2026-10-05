# Drill answers

Do not open this until you have attempted the questions in the chapter and in `EXAM-SURFACE.md`.

---

## C0

- Smallest chain: author `.cs` source → compiler → running program → console output.
- `Main` is required for a console application.
- `WriteLine` writes a line and then ends the line.
- `ReadLine` at the end holds the window on Windows so you can see the output (as the slides use it).

## C1

- `public` = access modifier. `static` / `void` / `class` / `using` = keywords.
- `Lab1` / `Main` = identifiers you (or the template) chose; `Main` is the required method name.
- `"Hello…"` = literal string, argument to `WriteLine`.
- `using System;` lets you write `Console` instead of `System.Console`.
- `//` line comment. `/* */` block comment. Comment-out disables a statement without deleting it.
- Whitespace does not change meaning (except inside a string).

## C2

- Syntax error: the compiler refuses (missing `;`, misspelled `WriteLine`).
- Logic error: it compiles and runs; the result is wrong (wrong string, wrong order).
- Debugging = removing syntax **and** logical errors.
- Source → IL (compile) → JIT → machine code.
- System software runs the machine; application software does a user’s job.
- Machine language = 1s and 0s. High-level = words with syntax.

## C3

- Variable = named location that can change. Literal constant = the `39.45` written in source.
- Placeholder `{0}` = first argument after the format string; `{1}` = second.
- `{0, 5}` = write that item in a field of width 5.
- `Write` stays on the line. `WriteLine` then goes to the next line.

## C4

- Integral = whole numbers. Nine names: `byte, sbyte, short, ushort, int, uint, long, ulong, char`.
- Floating: `float`, `double` (default), `decimal` (money, more precision, smaller range).
- `F` `D` `M` suffixes.
- `F` fixed, `E` scientific, `C` currency.

## C5

- `3 + 4 * 2` = 11. `(3 + 4) * 2` = 14.
- `* / %` before `+ -`.
- `++x` increments, then the expression uses the new value. `x++` uses the old value, then increments.

## C6

- Implicit = automatic widening. Explicit = you write `(type)`.
- `double r = 7 / 4;` → `1.0`.
- `7 / (double)4` → `1.75`.

## C7

- `bool` is only `true` or `false`.
- `'A'` char, `"A"` string.
- `Compare`/`CompareTo`: negative / zero / positive = precedes / same / follows.
- `"water".Length` is 5.

## C8

- `ReadLine()` returns `string`. `Convert.ToDouble(...)` before multiplying.
- `const double TAX_RATE = 0.06;` cannot be assigned later.
- Self-documenting: `lengthInches = lengthFeet * INCHES_IN_A_FOOT;`

## Ch 2 knowledge check

1. **False.** A constant **cannot** be changed after compile. (The statement in the PDF is false.)
2. A placeholder marks the place in a format string where a variable’s value is inserted; the number is the position in the list that follows.
3. **Integral**
4. **True**
