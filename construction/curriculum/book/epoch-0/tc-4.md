# TC-4 — Production appearance

Generated from your TC-3 work. Work this chapter alone. Push when you are done.

You already arrange with CSS. `.container` is a **grid parent** of three `.box` children (`tc-3/page.html`). You also have a **flex parent** of four sibling boxes (`tc-3/flex.html`: `display: flex` + `flex-direction: row` on the parent). Padding, border, and margin are on the box. Color is not layout. Do not prove those again. Do not prove flex again.

This cycle is the **production vocabulary for the same mechanisms** — not a new kind of page.

**Do not** `npm install`. **Do not** create `package.json`. **Do not** start Vite. **Do not** write JavaScript. **Do not** use a component library to skip layout.

Tailwind’s usual install (Vite plugin, `node_modules`) is real. It is **TC-13**, when Node is the toolchain host. This cycle: a **standalone CLI** — a binary that reads source and writes CSS.

---

## Leftover (one)

You already wrote `.container { display: flex; flex-direction: row }` with four children. Arrangement sits on the **parent of the siblings**. Grid in `page.html` is the same shape with a different `display`.

This cycle does not ask you to discover flex. It asks you to **name the utility that compiles to that declaration**.

In `construction/curriculum/constructions/tc-4/notes.md`, before 4.1: in `flex.html`, which selector got `display: flex`? When a class name on that occupant *means* `display: flex`, what still has to happen before the browser sees CSS? If you don’t know, say that — then look at the tree, not at a catalog.

---

## 4.1 Same page, still CSS

Copy `construction/curriculum/constructions/tc-3/page.html` to:

`construction/curriculum/constructions/tc-4/page.html`

Open from disk. Confirm the three boxes still arrange. You are not designing a new desk. You are about to **rebuild this arrangement** so the declarations are not all hand-typed in `<style>`.

Predict, in notes: if a class name on an occupant could *mean* `display: grid`, what would still have to happen before the browser saw CSS?

Do not download anything until you have written that.

### After you have written that

A **utility class** is a name that stands for a CSS declaration (or a small bundle of them). `grid` is not a new mechanism. It is a name for `display: grid`. The browser still only understands CSS. Something has to **compile** the names into a stylesheet.

That something, this cycle, is the Tailwind **standalone CLI**: a program you run. Input: a CSS file (and it will look at your HTML). Output: CSS the browser can load. It is a **compiler**. It is not a website. It is not Node-as-the-product.

Production apps usually obtain this compiler through a package toolchain (Vite plugin). You will **name** that in notes. You will **not** do it here.

---

## 4.2 Cause the compiler

Get the **Tailwind CSS 4 standalone binary** for your OS from the project’s GitHub releases (names like `tailwindcss-macos-arm64`, `tailwindcss-linux-x64`, `tailwindcss-windows-x64.exe`). Not `npm`. Not `npx`. Not a global Node package.

Put it in `construction/curriculum/constructions/tc-4/` (or next to it). Do not commit the binary.

Create `construction/curriculum/constructions/tc-4/input.css`:

```css
@import "tailwindcss";
```

Run the CLI so it writes `output.css` (the binary’s `-i` / `-o` flags — read its help once if you need the exact letters).

Link `output.css` from `page.html` instead of (or before you empty) the big hand `<style>` block.

Rebuild after you change classes. If you change HTML and do not run the compiler, you are looking at yesterday’s CSS. That is the same chain as TC-0’s reload, with an extra step.

Write: what did you run, what file appeared, what is in `output.css` that you did not type as `display: grid`?

---

## 4.3 Rebuild *your* grid in utilities

Intention: the same three boxes, same parent arrangement, same padding / border / margin **idea**.

Translate **your** rules, not a tutorial’s navbar.

| Your CSS (TC-3) | You are looking for a utility that means this |
|---|---|
| `display: grid` | the name for that display |
| `display: flex` | the name for that display (you already wrote this on a parent) |
| `grid-template-columns: auto 1fr` | columns you can still count |
| `padding: 100px` | padding — a scale name **or** an arbitrary value if the scale has no 100px |
| `border: 15px solid black` | border |
| `background-color: blue` | background |
| `width: 100%` | width |
| `margin: auto` | margin |

Put the utilities on the **same occupants** (parent vs child). Predict whether `.container` still has to be the parent. Then compile, open from disk.

If a utility name does nothing, diagnose like TC-3: wrong element, compiler not re-run, or the name is not the declaration you think.

**Drop to CSS once.** Your `.box:nth-child(2)` padding is a good candidate — a utility catalog may not be the point. A small extra CSS file, or a `@layer` / ordinary rule next to the import, that still applies after compile. Point at it: this is when the abstraction is insufficient. Do not drown the page in hand CSS again.

One flex parent **in utilities**: put the class that means `display: flex` on a parent of siblings (your four boxes, or two). You already know which element that is. Point at the compiled CSS. Not a flex encyclopedia. If you also want the stack, the name your compile produced for column direction is enough.

---

## 4.4 Bridge proof (required)

In notes, chapter not open for the pointing:

1. Pick **three** utilities you used. For each: the class name, the CSS it compiled to (look in `output.css` or DevTools), the mechanism from TC-2/TC-3 (display, box, grid, flex).
2. Where you dropped to CSS: what the utility could not say.
3. In one sentence: the standalone CLI **is** a compiler. It **is not** Node-as-application. Production usually installs Tailwind via the package toolchain; that path is **TC-13**.

If you cannot point a utility at a declaration, you are guessing class names. Stay here.

---

## Syntax you must be able to produce

Without this chapter open:

- `input.css` with `@import "tailwindcss";`
- a CLI compile to `output.css`
- a link from the HTML to that file
- utilities that reproduce **your** grid parent and box spacing
- one drop-through CSS rule
- the utility that means `display: flex` on a parent of siblings (you already have the CSS)

If you can say “Tailwind” and cannot show `display: grid` (or `display: flex`) in the compiled CSS, the cycle is not done.

---

## Proofs

**Predict.** You skip the compile after adding a class. What will the page do? Why?

**Explain.** What is a utility buying? What is the CLI buying? What is still CSS?

**Transform — before changing files.** The three-box grid should become a **single column** without deleting occupants. Which utilities / which element?

**Break.** Remove `output.css` (or the link). What remains? What is gone?

**Diagnose.** A class you added does nothing. Compiler stale, wrong file linked, or the class is on a child when the mechanism belongs on the parent?

**Reconstruct.** New HTML + `input.css`. Compile. A row of two boxes in utilities. Not this chapter’s sentences.

**Transfer.** “A desk with a list on the left and a detail on the right.” Same layout intention as TC-3’s transfer — now in this vocabulary. Do not name React.

---

## Must not

- `package.json`, `npm`, `pnpm`, `npx`, `node_modules`, Vite, PostCSS-as-the-course
- React, a UI kit, “just use a Card component”
- A second invented page that abandons the three-box construction

---

## What you push

1. `construction/curriculum/constructions/tc-4/page.html`
2. `construction/curriculum/constructions/tc-4/input.css`
3. `construction/curriculum/constructions/tc-4/output.css` (compiled — so the page can be opened)
4. `construction/curriculum/constructions/tc-4/notes.md` — leftover, 4.1–4.4, proofs, bridge proof

Do not push the CLI binary.

TC-5 is generated when the layout is rebuilt in utilities, the CLI is a compiler you can point at, and you have dropped to CSS once — not when the page merely “has Tailwind classes.”
