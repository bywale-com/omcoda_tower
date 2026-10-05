# Drill answers

Do not open a section until you have attempted that chapter or mixed exam.

---

## C0

- Smallest chain: author `.cs` source → compile → running program → console output.
- Every console application must have `Main()`. `void` = returns nothing.
- Quoted text = literal string. `WriteLine` produced the line.
- Success factors: curiosity, patience, practice. Face errors.
- `ReadLine` at the end holds the output screen for Windows computers (commented program on the PDF).

## C1

- `public` = access modifier. Keywords vs identifiers.
- `Main` is required for a console app; do not add a “host” story.
- Rules: begin `_` `@` or letter; contain letters digits `_` `@`; not a keyword.
- Conventional: `Employee`, `FirstClass`, `PushButtonControl`, `Budget2012`.
- Unconventional-but-legal: `employee`, `First_Class`, `Pushbuttoncontrol`, `BUDGET2013`, `Public`.
- Illegal: spaces, `class`, `2011Budget`, `phone#`.
- `//` and `/* */`. Comments document or disable.
- `using System;` → `Console.WriteLine`. System = root namespace, .NET. Console = standard in/out/error.
- Whitespace does not change meaning except inside a string.

## C2

- Programming is about solving problems, designing instructions, developing new things.
- Syntax error: compiler refuses. Logic error: runs, result wrong. Debugging = both.
- Source → IL → JIT → machine. Linux CLI “not for us.”
- System vs application software. Machine 1s/0s vs high-level + syntax.

## C3

- Variable = named location that can change. Literal constant = written value; cannot change after compile.
- Placeholder `{0}` = first argument after the format string.
- `{0, 5}` = width 5.
- `Write` stays on the line. `WriteLine` then goes to the next line.

## C4

- Nine integrals: byte sbyte short ushort int uint long ulong char.
- `int` = Int32, 4 bytes, signed, 2,147,483,647 / −2,147,483,648.
- float Single 4; double Double 8 default; decimal Decimal 16 money.
- `object` = Object, any object, bytes NA.
- `54.7` is double; need `F` for float, `M` for decimal.
- Nine format letters: C D E F G N P R X.

## C5

- 45 / 2 = 22 (not 22.5). 45 % 2 = 1.
- `3 + 4 * 2` = 11. `(3 + 4) * 2` = 14.
- Prefix and postfix increment: both are `someValue = someValue + 1` on the slide.

## C6

- Implicit = automatic widening. Explicit = `(type)`.
- `double r = 7 / 4;` → 1.0. `7 / (double)4` → 1.75.
- `int` → long, float, double, or decimal. Only float automatically → double among floating types.

## C7

- `bool`: true or false.
- Table 2-4 operators `< > == <= >= !=`. `5 != 6` true; `3 != 3` false.

## C8

- `'r'` char, `"r"` string.
- Table 2-5: `\'` `\"` `\\` `\0` `\a` `\b` `\f` `\n` `\r` `\t` `\v`.

## C9

- `==` shown; caption not recommended.
- Equals → bool. CompareTo → int; Alaa vs John → −1.
- Length of water = 5. Substring(0,2) = "wa". The Length−1 lines are marked wrong on the slide.

## C10

- `ReadLine()` returns string. Convert before arithmetic.
- Table 2-6: ToBoolean ToByte ToChar ToDecimal ToDouble ToInt16 ToInt32 ToInt64 ToSByte ToSingle ToString ToUInt16 ToUInt32 ToUInt64.
- ToSingle → float. ToUInt32 → unsigned 32-bit.

## C11

- `const` cannot be assigned later. ALL_CAPS.
- Self-documenting: `lengthInches = lengthFeet * INCHES_IN_A_FOOT;`
- Knowledge check: (1) False (2) placeholder marks where a variable’s value is inserted (3) integral (4) True

---

## Mixed exam 1

1. False  
2. Solving problems; designing instructions; developing new things  
3. integral  
4. Illegal — cannot begin with a digit  
5. Legal; unconventional because it begins with lowercase  
6. `1` or `1.0`  
7. Cast one operand, e.g. `7 / (double)4`  
8. 22  
9. Marks where a variable value is inserted; number is the position in the following list  
10. Percent; hexadecimal; round trip  
11. Int32; 4; signed; 2,147,483,647  
12. Decimal literal is `double`; write `54.7F`  
13. (a) syntax (b) logic  
14. `Main`; returns nothing  
15. Any four of: `\'` single quote, `\"` double quote, `\\` backslash, `\0` null, `\a` alert, `\b` backspace, `\f` form feed, `\r` carriage return, `\v` vertical tab  
16. −1  
17. `"wa"`; marked **wrong**  
18. `ReadLine` returns a string  
19. `ToSingle`; `ToUInt32`  
20. `const int INCHES_IN_A_FOOT = 12;` and `lengthInches = lengthFeet * INCHES_IN_A_FOOT;`  
21. Legal (not the keyword `public`); unconventional / confusing  
22. True  
23. System administers resources / essential to run; application carries a user’s needs  
24. IL; machine code  
25. e.g. `bool ok = 5 != 6;`

---

## Mixed exam 2

1. Curiosity, patience, practice; face errors  
2. `_`, `@`, or letter; letters digits `_` `@`; not a reserved keyword  
3. Illegal; `#` not allowed  
4. Legal; unconventional — underscore not commonly used to mark words in class names  
5. One line: `The money is $39.45`  
6. Field width 5 (alignment)  
7. C D E F G N P R X; G general, N number, D decimal  
8. Decimal; 16; greater precision and smaller range; financial  
9. Any object  
10. 11 and 14  
11. Both are writings of `someValue = someValue + 1`  
12. Implicit: automatic to higher precedence. Explicit: desired type in parentheses, then the value  
13. All of those four; `double`  
14. `3 != 3`  
15. Invalid — double quotes make a string, not a char  
16. `\b` `\f` `\a` `\0`  
17. Boolean; integer; first follows second in sort order  
18. Not recommended  
19. string; `ToInt64`  
20. False  
21. `//` and `/* */`; disable statements when you test  
22. `System.Console`; root; .NET  
23. 1s and 0s; read/write/add; syntax  
24. `Console.Write("…"); string s = Console.ReadLine(); double x = Convert.ToDouble(s);`  
25. byte 255 and 0 unsigned; sbyte 127 and −128 signed
