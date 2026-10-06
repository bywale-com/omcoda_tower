# EXAM-SURFACE — what the two PDFs can ask

Cram **after C11**, then sit the mixed exams. If a row is foggy, rebuild that cycle — do not only reread.

This file is **EXAM lane only**. Foundation (what is a class, static vs instance, property vs method) lives in [`FOUNDATION-MAP.md`](./FOUNDATION-MAP.md) and the chapters. Do not treat those as extra exam items.

Every **table** below is on a slide. Retrieve it. See [`COVERAGE.md`](./COVERAGE.md).

---

## Chapter 1 — words

| Word | Cycle | Slide one-line |
|---|---|---|
| Programming is about | C2 | Solving problems; designing instructions; developing new things |
| Like a language | C2 | You talk with the computer |
| Success factors | C0 | Curiosity, patience, practice; GET YOUR HANDS DIRTY; face errors |
| Computer program / software | C0 | Instructions that tell a computer what to do |
| System software | C2 | Administers system resources; essential to run the system |
| Application software | C2 | Carries specific user needs |
| Machine language | C2 | 1s and 0s (switches on/off) |
| High-level language | C2 | Reasonable terms (`read`, `write`, `add`); has syntax |
| Syntax | C2 | Rules of the language |
| Compiler / interpreter / assembler | C2 | Translates statements toward machine code |
| Programming logic | C2 | Executing statements in the correct order |
| Debugging | C2 | Removing syntax **and** logical errors |
| Procedural program | C2 | Named memory locations + steps that manipulate them |
| Method / procedure | C1–C2 | Logical unit grouping operations; invoked by others |
| C# | C2 | Object-oriented; Visual Studio (simple GUI); after C++; similar to Java |
| Namespace | C1 | Groups similar classes; `System` is root, part of .NET |
| Access modifier | C1 | Circumstances under which the method can be accessed (`public`) |
| Keyword | C1 | Reserved identifier with special meaning to the compiler |
| Identifier | C1 | Name you choose |
| Conventional vs unconventional vs illegal | C1 | Tables 1-2, 1-3, 1-4 |
| Whitespace | C1 | Spaces, tabs, blank lines — organizes reading |
| Method header | C1 | Name + how information is shared (`public static void Main()`) |
| Method body | C1 | Statements in `{ }` |
| `Main()` | C0–C1 | Every console application must have it |
| `void` | C0–C1 | The method returns nothing |
| Literal string | C0 | Text in `"double quotes"` |
| Argument | C1 | The string passed to `WriteLine` |
| Line comment | C1 | `//` |
| Block comment | C1 | `/* … */` |
| Comment out | C1–C2 | Turn a statement into a comment (document **or** disable when testing) |
| using directive | C1 | `using System;` so `Console` is enough |
| `Console` | C1 | Standard input, output, and error streams |
| IL | C2 | Intermediate language from compiling source |
| JIT | C2 | Just-in-time: IL → machine code |
| Visual Studio | C2 | Scaffolding; colour; double-click error → line; debugging tools |
| Linux CLI | C2 | Named on the slide as **not for us** |

### Identifier rules (PDF p.17)

- Must **begin** with `_`, `@`, or a letter (including foreign-alphabet letters)
- Can **contain** only letters, digits, `_`, `@` — not `#`, `$`, `&`
- Cannot be a C# **reserved keyword**

### Table 1-2 — conventional (legal **and** conventional)

| Class name | Why conventional |
|---|---|
| `Employee` | Begins with an uppercase letter |
| `FirstClass` | Uppercase start; uppercase marks the second word; no spaces |
| `PushButtonControl` | Uppercase start; uppercase marks each subsequent word; no spaces |
| `Budget2012` | Uppercase start; no spaces |

### Table 1-3 — unconventional (though legal)

| Class name | Why unconventional |
|---|---|
| `employee` | Begins with a lowercase letter |
| `First_Class` | Underscore not commonly used to mark new words in class names |
| `Pushbuttoncontrol` | No uppercase to mark new words; hard to read |
| `BUDGET2013` | All uppercase |
| `Public` | Legal (not the keyword `public`) but confusingly similar |

### Table 1-4 — illegal

| Class name | Why illegal |
|---|---|
| `an employee` | Space is illegal |
| `Push Button Control` | Spaces are illegal |
| `class` | Reserved word |
| `2011Budget` | Cannot begin with a digit |
| `phone#` | `#` not allowed |

### Table 1-1 — reserved keywords (RECOGNIZE)

You need not chant seventy words. You must **recognize** that these are keywords (illegal as identifiers) and that `Public` ≠ `public`.

abstract, as, base, bool, break, byte, case, catch, char, checked, class, const, continue, decimal, default, delegate, do, double, else, enum, event, explicit, extern, false, finally, fixed, float, for, foreach, goto, if, implicit, in, int, interface, internal, is, lock, long, namespace, new, null, object, operator, out, override, params, private, protected, public, readonly, ref, return, sbyte, sealed, short, sizeof, stackalloc, static, string, struct, switch, this, throw, true, try, typeof, uint, ulong, unchecked, unsafe, ushort, using, virtual, void, volatile, while

---

## Chapter 1 — syntax you must write

```csharp
using System;
public static class Lab1
{
    public static void Main()
    {
        Console.WriteLine("Hello COIS1020H, my name is xxx");
        Console.ReadLine();
    }
}
```

Equivalent without `using`: `System.Console.WriteLine(...)`.  
`ReadLine` on the slide “holds the output screen for Windows computers.”

---

## Chapter 2 — words

| Word | Cycle | Slide one-line |
|---|---|---|
| Literal constant | C3 | Cannot change after compile; value taken literally at each use |
| Variable | C3 | Named memory that can hold different values at different times |
| Data type | C3–C4 | Format, size, and allowed operations |
| Declaration | C3 | Names a variable and reserves storage |
| `Write` vs `WriteLine` | C3 | `WriteLine` then advances to the next line |
| Format string | C3 | Fixed text + placeholders |
| Placeholder | C3 | `{n}` = position in the list after the string |
| Alignment | C3 | `{0, 5}` = width 5 |
| Integral | C4 | Whole numbers — nine types including `char` |
| Floating-point | C4 | Contains decimal positions |
| Suffix `F` `D` `M` | C4 | float / double / decimal literals |
| Scientific notation | C4 | `-123.78` = `-1.2378E2`; `0.000382` = `3.82E-4` |
| Format form `X0` | C4 | X = specifier, 0 = precision; **nine** built-in characters |
| Binary operator | C5 | Two operands |
| Unary operator | C5 | One operand (`-x`) |
| Precedence | C5 | `* / %` before `+ -`; parentheses override |
| `+=` `-=` `*=` `/=` | C5 | Operate and assign |
| Prefix `++x` / postfix `x++` | C5 | Both are `x = x + 1` on the slide. Do not invent extra semantics. |
| `--` | C5 | Decrement |
| Unifying type | C6 | Type C# chooses for mixed arithmetic |
| Implicit cast | C6 | Automatic to a higher-precedence type |
| Explicit cast | C6 | `(double) 4` |
| `bool` | C7 | `true` or `false` |
| Comparison | C7 | Expression has a Boolean value |
| `char` | C8 | One character in `'single quotes'` |
| Escape sequence | C8 | `\` pair that is **one** character |
| `string` | C9 | Series of characters in `"double quotes"` |
| `==` on strings | C9 | Shown; figure caption **not recommended** |
| `Equals` | C9 | Same value? → Boolean |
| `Compare` / `CompareTo` | C9 | Negative / zero / positive |
| `Length` | C9 | `"water"` → 5 |
| `Substring` | C9 | From a starting point for a specific length |
| Interactive | C10 | Allows user input |
| `ReadLine` | C10 | Until Enter; result is a **string** |
| `Convert` | C10 | Table 2-6 |
| Named constant | C11 | `const`; cannot change; `ALL_CAPS` |
| Self-documenting | C11 | Understandable without comments |

---

## Table 2-1 — C# data types (MEMORIZE)

| Type | System type | Bytes | Description | Largest | Smallest |
|---|---|---|---|---|---|
| `byte` | Byte | 1 | Unsigned byte | 255 | 0 |
| `sbyte` | SByte | 1 | Signed byte | 127 | −128 |
| `short` | Int16 | 2 | Signed short | 32,767 | −32,768 |
| `ushort` | UInt16 | 2 | Unsigned short | 65,535 | 0 |
| `int` | Int32 | 4 | Signed integer | 2,147,483,647 | −2,147,483,648 |
| `uint` | UInt32 | 4 | Unsigned integer | 4,294,967,295 | 0 |
| `long` | Int64 | 8 | Signed long integer | ≈ 9×10¹⁸ | ≈ −9×10¹⁸ |
| `ulong` | UInt64 | 8 | Unsigned long integer | ≈ 18×10¹⁸ | 0 |
| `float` | Single | 4 | Floating-point | ≈ 3.4×10³⁸ | ≈ −3.4×10³⁸ |
| `double` | Double | 8 | Double-precision floating-point | ≈ 1.8×10³⁰⁸ | ≈ −1.8×10³⁰⁸ |
| `decimal` | Decimal | 16 | Fixed-precision number | ≈ 7.9×10²⁸ | ≈ −7.9×10²⁸ |
| `char` | Char | 2 | Unicode character | 0xFFFF | 0x0000 |
| `bool` | Boolean | 1 | Boolean (`true` or `false`) | NA | NA |
| `string` | String | NA | Unicode string | NA | NA |
| `object` | Object | NA | Any object | NA | NA |

`float` ≈ 7 significant digits; `double` is default, 15 or 16; `decimal` for money.

---

## Table 2-2 — nine format specifiers (MEMORIZE)

| Character | Description | Default format (slide) |
|---|---|---|
| `C` or `c` | Currency | `$XX,XXX.XX` |
| `D` or `d` | Decimal | `[±]XXXXXXX` |
| `E` or `e` | Scientific (exponential) | `[±]X.XXXXXXE±xxx` |
| `F` or `f` | Fixed-point | `[±]XXXXXXX.XX` |
| `G` or `g` | General | Decimal places **or** scientific |
| `N` or `n` | Number | `[±]XX,XXX.XX` |
| `P` or `p` | Percent | Numeric value as a percentage |
| `R` or `r` | Round trip | Same value when converted back to a number |
| `X` or `x` | Hexadecimal | Minimum hex (base 16) representation |

The running demo on the slide uses `{0}`, `F`, `F1`, `F3`, `E`, `C`, `C3` on `34.456` / `23456.78`. You still memorize the other letters.

---

## Table 2-3 — binary arithmetic (MEMORIZE)

| Operator | Description | Example on the slide |
|---|---|---|
| `+` | Addition | 45 + 2 → 47 |
| `−` | Subtraction | 45 − 2 → 43 |
| `*` | Multiplication | 45 * 2 → 90 |
| `/` | Division | **45 / 2 → 22 (not 22.5)** |
| `%` | Remainder (modulus) | 45 % 2 → 1 |

---

## Table 2-4 — comparison operators (MEMORIZE)

| Operator | Description | true example | false example |
|---|---|---|---|
| `<` | Less than | `3 < 8` | `8 < 3` |
| `>` | Greater than | `4 > 2` | `2 > 4` |
| `==` | Equal to | `7 == 7` | `3 == 9` |
| `<=` | Less than or equal to | `5 <= 5` | `8 <= 6` |
| `>=` | Greater than or equal to | `7 >= 3` | `1 >= 2` |
| `!=` | Not equal to | `5 != 6` | `3 != 3` |

---

## Table 2-5 — escape sequences (MEMORIZE)

| Sequence | Character name |
|---|---|
| `\'` | Single quotation mark |
| `\"` | Double quotation mark |
| `\\` | Backslash |
| `\0` | Null |
| `\a` | Alert |
| `\b` | Backspace |
| `\f` | Form feed |
| `\n` | Newline |
| `\r` | Carriage return |
| `\t` | Horizontal tab |
| `\v` | Vertical tab |

---

## Table 2-6 — Convert methods (MEMORIZE)

| Method | Description (slide) |
|---|---|
| `ToBoolean()` | Equivalent Boolean |
| `ToByte()` | 8-bit unsigned integer |
| `ToChar()` | Unicode character |
| `ToDecimal()` | Decimal number |
| `ToDouble()` | Double-precision floating-point |
| `ToInt16()` | 16-bit signed integer |
| `ToInt32()` | 32-bit signed integer |
| `ToInt64()` | 64-bit signed integer |
| `ToSByte()` | 8-bit signed integer |
| `ToSingle()` | Single-precision floating-point |
| `ToString()` | Equivalent String |
| `ToUInt16()` | 16-bit unsigned integer |
| `ToUInt32()` | 32-bit unsigned integer |
| `ToUInt64()` | 64-bit unsigned integer |

---

## Conversion rules (PDF p.23, p.25)

- Same types → result stays that type.
- Dissimilar → unifying type; implicit convert of the other operand.
- Integrals widen to larger integrals and to floating types. Example: `int` → `long`, `float`, `double`, or `decimal`.
- Among floating types, only `float` automatically converts to `double`.
- Implicit = automatic to higher precedence. Explicit = `(type)` then the value.
- `double result = 7 / 4;` → **1.0**
- `double result = 7 / (double) 4;` → **1.75**

---

## Substring figure (PDF p.36) — `"water"` positions 0–4

```
word.Substring(0, 1)  → "w"
word.Substring(0, 2)  → "wa"
word.Substring(1, 2)  → "at"
```

The slide marks these two **wrong** (red X):

```
word.Substring(2, word.Length - 1)  is "ter"    ✗
word.Substring(0, word.Length - 1)  is "water"  ✗
```

---

## Traps the slides themselves set

- A constant **cannot** be changed after compile.
- `float val = 54.7;` incorrect; `54.7F` correct.
- `decimal wage = 12.55;` incorrect; `12.55M` correct.
- Integer `/` truncates (Table 2-3 and 7/4).
- All `ReadLine` input is a string.
- `'r'` is `char`. `"r"` is `string`.
- `==` on strings is shown and captioned **not recommended**.
- `Public` is legal; `public` is a keyword.

---

## Knowledge check (PDF p.46) — attempt before [`book/ANSWERS.md`](./book/ANSWERS.md)

1. True or False: A data item is constant when it can be changed after a program is compiled.
2. What is the purpose of a placeholder?
3. A(n) _____ data type is a type that stores whole numbers.
4. True or False: A floating-point number is one that contains decimal positions.

Discussion (PDF p.47): Should numeric variables always be integer or floating-point? Implicit vs explicit.
