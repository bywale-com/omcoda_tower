# EXAM-SURFACE — what the two PDFs can ask

Cram **after** C8. If a word below is foggy, go back to that cycle’s construction, not to rereading this list first.

---

## Chapter 1 — words

| Word | Cycle | One-line |
|---|---|---|
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
| C# | C2 | Object-oriented; Visual Studio; modeled after C++; similar to Java |
| Namespace | C1 | Groups similar classes (`System`) |
| Access modifier | C1 | Circumstances under which a method can be accessed (`public`) |
| Keyword | C1 | Reserved identifier with special meaning |
| Identifier | C1 | Name you choose for a class/method/variable |
| Whitespace | C1 | Spaces, tabs, blank lines — for reading, not for the machine’s meaning |
| Method header | C1 | Name + how information is shared (`public static void Main()`) |
| Method body | C1 | Statements in `{ }` |
| `Main()` | C0–C1 | Every console application must have it; `void` = returns nothing |
| Literal string | C0 | Text in `"double quotes"` passed to `WriteLine` |
| Line comment | C1 | `//` |
| Block comment | C1 | `/* … */` |
| Comment out | C1–C2 | Turn a statement into a comment to disable it |
| `using` directive | C1 | `using System;` so `Console` is enough |
| `Console` | C1 | Standard input, output, error streams |
| IL | C2 | Intermediate language from compiling source |
| JIT | C2 | Just-in-time compiler: IL → machine code |
| Visual Studio | C2 | IDE: scaffolding, color, click error → line, debugging tools |

### Identifier rules (memorize)

- Starts with `_`, `@`, or a letter
- Contains letters, digits, `_`, `@` only
- Not a reserved keyword
- Not special characters `# $ &`

Legal: `num2`, `_ok`, `Lab1`. Illegal: `2num`, `my-age`, `class`, `x#`.

---

## Chapter 1 — syntax you must be able to write

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

---

## Chapter 2 — words

| Word | Cycle | One-line |
|---|---|---|
| Literal constant | C3 | Value taken literally at each use; cannot change after compile |
| Variable | C3 | Named memory that can hold different values at different times |
| Data type | C3–C4 | Format, size, and allowed operations |
| Declaration | C3 | Names a variable and reserves storage |
| `Write` vs `WriteLine` | C3 | Same output; `WriteLine` then advances to the next line |
| Format string | C3 | Fixed text + placeholders |
| Placeholder | C3 | `{n}` = position in the argument list after the string |
| Alignment | C3 | `{0, 5}` = width 5 |
| Integral type | C4 | Whole numbers: `byte sbyte short ushort int uint long ulong char` |
| Floating-point | C4 | Has decimal positions: `float` (7 digits), `double` (15–16, default), `decimal` (money) |
| Suffix `F` `D` `M` | C4 | `float` / `double` / `decimal` literals |
| Scientific notation | C4 | `-123.78` = `-1.2378E2`; `0.000382` = `3.82E-4` |
| Format `F` `E` `C` | C4 | Fixed / scientific / currency; precision like `F1`, `C3` |
| Binary operator | C5 | Two operands (`x + y`) |
| Unary operator | C5 | One operand (`-x`) |
| Precedence | C5 | `* / %` before `+ -`; parentheses override |
| `+=` `-=` `*=` `/=` | C5 | Operate and assign |
| `++` `--` | C5 | Prefix vs postfix when the value is *used* |
| Implicit cast | C6 | Automatic to a higher-precedence type |
| Explicit cast | C6 | `(double)4` |
| Unifying type | C6 | Type C# chooses for mixed arithmetic |
| `bool` | C7 | `true` or `false` |
| Comparison | C7 | Expression has a Boolean value |
| `char` | C7 | One character in `'single quotes'` |
| Escape sequence | C7 | `\` + symbol = one character (`\n`, `\t`, `\\`, `\'`, `\"`) |
| `string` | C7 | Series of characters in `"double quotes"` |
| `Equals` | C7 | Same value? → `bool` |
| `Compare` / `CompareTo` | C7 | Negative = first precedes; 0 = same; positive = first follows |
| `Length` | C7 | Number of characters (`"water"` → 5) |
| `Substring` | C7 | Extract from a start for a length |
| Interactive | C8 | Allows user input |
| `ReadLine` | C8 | Keyboard until Enter; result is a **string** |
| `Convert.ToDouble` | C8 | String → `double` (and kin) |
| Named constant | C8 | `const`; cannot change; usually `ALL_CAPS` |
| Self-documenting | C8 | Understandable without a comment (`lengthFeet * INCHES_IN_A_FOOT`) |

---

## Chapter 2 — traps the test likes

- A constant **cannot** be changed after compile. (Knowledge check #1 is a false statement if they say it can.)
- `float val = 54.7;` is **incorrect**; need `54.7F`.
- `decimal wage = 12.55;` is **incorrect**; need `12.55M`.
- `double result = 7 / 4;` → `1.0` (integer division first).
- `double result = 7 / (double)4;` → `1.75`.
- All `ReadLine` input is a string. Convert before arithmetic.
- `'r'` is `char`. `"r"` is `string`.
- Placeholder purpose: mark where a variable’s value is inserted in a format string.

---

## Knowledge check (PDF Ch 2) — attempt before [`book/ANSWERS.md`](./book/ANSWERS.md)

1. True or False: A data item is constant when it can be changed after a program is compiled.
2. What is the purpose of a placeholder?
3. A(n) _____ data type is a type that stores whole numbers.
4. True or False: A floating-point number is one that contains decimal positions.

Discussion (be able to talk, not recite a sentence):

- Should numeric variables always be `int` or floating-point? Why not? Examples.
- Implicit vs explicit cast.
- Why the right data type matters.
