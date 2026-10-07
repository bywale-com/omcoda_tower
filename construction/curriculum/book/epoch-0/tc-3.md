# TC-3 — Layout

Generated from your TC-2 work. Work this chapter alone. Push when you are done.

You already attach **rules**. HTML names the occupant; CSS is the second construction. You already have several occupants. This chapter does not teach tags, `<style>`, or “CSS exists.”

You already said you would not use HTML-only to design. That wall is behind you. Do not spend this cycle proving it again.

Do not start a server. Do not write JavaScript. Do not install npm. Do not use Tailwind. Raw CSS, still in `<style>` in the head.

---

## Leftover (one)

In `page.html` you wrote `flex: auto` on `div` without `display: flex`.

In `my-work/tc-3/notes.md`, before 3.1: what did you think that declaration would do? What actually had to be true of the **box** for a `flex-*` property to mean anything? If you don’t know, say that — then 3.2 will force it.

---

## 3.1 A color rule is not a page

Copy `docs/construction/curriculum/constructions/tc-2/page.html` into `docs/construction/curriculum/constructions/tc-3/page.html` (your occupants, your rules — fix the stray `</div>` if you want the tree to match what you intend; if you leave it, say in notes whether the `h1` is *inside* the `div` or not).

Form this intention:

> These occupants must be **arranged** — not merely recolored. A row. A stack. Something that wraps when the window is narrow.

Predict, in notes, **before you add new rules**: can `color` and `font-size` cause arrangement? If yes, how? If no, what kind of rule is missing?

Then try with only the kind of rules you already have (color, font-size, a single margin). Write what happened.

### After you have felt that

Color paints. Font-size scales text. **Layout** is a different family of rules: it controls the **box**, the **flow**, alignment, wrapping.

Sequence in the source is still a sequence. It is no longer the *only* arrangement once layout rules exist.

---

## 3.2 The box

Every occupant is a box. Content sits inside. **Padding** is space inside the edge. **Border** is the edge. **Margin** is space outside the edge. You already used `margin-top`. That was one side of one box.

On **one** occupant, set padding, a border you can see, and a margin. Predict which space is which. Open from disk. Write whether the prediction held.

Remove the border. What space remains? That is the relationship, not the decoration.

---

## 3.3 Flex — make `flex: auto` earn its keep

`display: flex` on a **parent** makes that parent a flex container. Its **children** become flex items. Properties like `flex: auto` talk about items. Without the container, they are mostly idle. That is why TC-2’s `flex: auto` on a lonely `div` did not arrange a page.

Intention: a **row** of at least two occupants (for example the heading and the paragraph, or two copies of a block you add). The parent’s rule causes the row. The children’s tags stay what they are.

Syntax you must produce:

```css
.parent {
  display: flex;
}
```

Plus whatever alignment or `gap` the row actually needs — not a flex encyclopedia. `flex-direction: column` is how you get a **stack** from the same mechanism. Build a stack too, or turn the row into a stack by changing **one** property. Predict first.

`flex: auto` may now sit on an *item* whose parent is `display: flex`. If you use it, write what it bought.

---

## 3.4 Grid — wrapping is not a flex footnote

Intention: several occupants (three or more) that form a **wrapping grid** — not one forever-row, not a vertical list of everything. `display: grid` on the parent. Columns you can count. If the window is too narrow, they wrap or collapse because of the grid (or because of a **media query** — one breakpoint, if you need two widths).

Do not fake the grid with empty spacer elements.

Write: which parent, which rule, how many columns you intended, what happened when you narrowed the window.

---

## 3.5 Two rules compete

Put two rules that both could apply to the same occupant (same property, different values). Predict which wins. Open from disk.

If the “wrong” one won, do not add `!important`. Change **specificity** or **order** (cascade). Write which relationship actually decided it. Names: **cascade**, **specificity** — attached after you see the fight, not before.

---

## Names this cycle must leave you with

| Phenomenon | Name |
|---|---|
| Occupants inside occupants | **tree** · **parent / child** · **sibling** |
| Content + padding + border + margin | **box model** |
| Parent arranges children in a line / stack | **flex** |
| Parent arranges children in rows and columns | **grid** |
| Two rules, one occupant, one winner | **cascade** / **specificity** |
| Layout that depends on width | **media query** / responsive constraint (as CSS) |

---

## Syntax you must be able to produce

Without looking at this chapter:

- `padding` / `border` / `margin` on a box you can point at
- `display: flex` on a parent; a row; a stack by changing direction
- `display: grid` with a column definition that wraps
- one `@media` rule if you used two widths
- two competing rules, and a change that makes the other one win

If you can say “flexbox” and cannot write `display: flex` on the parent, the cycle is not done.

---

## Proofs

**Predict.** You remove every `display:` declaration and leave color/font rules. What arrangement remains? What is gone?

**Explain.** What does `display: flex` do that `color` cannot? Where does the layout rule sit — on the parent, on the child, or both, for *your* row?

**Transform — before changing files.** What construction must change, what can remain, and why?

1. The row should become a stack without deleting occupants.
2. Only the *middle* item in the grid should have extra padding. Kind-selectors will hit every item — say what must exist that a `div` selector does not give you (a class, a more specific selector — not a library).
3. The same arrangement at a narrow width should be a stack, at a wide width a row.

**Break.** Remove `display: flex` but leave `flex: auto` / `gap` / `justify-content`. What still does something? What becomes idle?

**Diagnose.** You set `display: grid` and nothing became columns. Which relationship failed: the selector isn’t the parent, the column definition is empty, or children aren’t actually children in the tree (stray `</div>`)?

**Reconstruct.** New file. Three boxes. A row, then a wrapping grid. Not this chapter’s sentences.

**Transfer.** “A desk with a list on the left and a detail on the right, stacked on a phone.” What must exist before you write? Do not name React.

---

## Door (do not walk through it)

You can arrange in CSS. Production UI is not a lifetime of hand-authored selectors once those mechanisms are understood. There is a vocabulary for *this same* box/flex/grid/responsive. That vocabulary is the next cycle. Do not look it up to finish this one.

Do not write JavaScript. Do not `npm install`.

---

## What you push

1. `docs/construction/curriculum/constructions/tc-3/page.html` — arranged occupants, rules you can point at. Optional: `new_construct.html` for reconstruct.
2. `docs/construction/curriculum/my-work/tc-3/notes.md` — leftover, 3.1–3.5, proofs, door.

TC-4 is generated when you can build a row, a stack, and a wrapping grid from CSS and name which mechanism did the work — not when the page is merely “using flex.”
