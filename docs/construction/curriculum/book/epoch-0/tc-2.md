# TC-2 — Appearance

Generated from your TC-1 work. Work this chapter alone. Push when you are done.

You already have a document, a title, and occupants (`h1`, `p`, `h2`, a `div`). You already know a tag names a kind. This chapter does not teach that again.

Do not start a server. Do not write JavaScript. Do not change an `h2` into something else in order to “move” it.

---

## Leftovers (short)

Answer these in `my-work/tc-2/notes.md` before 2.1. One paragraph each.

1. **TC-0, third ask.** Same emptiness; the browser must treat the file as *not* a page. What construction must change, what can remain, and why?
2. **Title on the page.** You want the title text to appear as a line on the page *and* still name the tab. What must exist? (Two constructions, or one?)

---

## 2.1 HTML cannot do this

Pick **one** occupant that already exists in `docs/construction/curriculum/constructions/tc-2/page.html`.

Copy your TC-1 document into that file first (your occupants, your words — not a new essay). Then form this intention:

> This occupant must look different, or sit somewhere different, **without** changing its tag and **without** changing its words.

Examples of the *kind* of intention (choose one, or write your own of the same grain):

- this heading should not sit on the left
- this paragraph should be a different color than the heading
- this occupant should have space above it that is not another empty element

Predict, in notes, **before you try**: can the TC-1 construction (tags, head, body, words) cause that? If you think yes, say how. If you think no, say what is missing.

Then try, using only HTML. No new tag whose job is “look.” No empty `<br>` spam as the solution. Write what happened.

### After you have felt that

HTML says **what the thing is**. It does not say **how it appears**.

A second construction has to attach to the occupant: **rules**.

That family of rules is called **CSS**.

A **rule** has two parts:

- a **selector** — which occupant the rule is about
- one or more **declarations** — each declaration is a **property** and a value (`color`, `margin-left`, `text-align`, …)

The occupant stays an `h2` (or whatever you picked). The words stay. The rule changes the rendering.

---

## 2.2 Attach a rule

Put the rules in the document, in the **head**, inside a `<style>` element. That is enough. A separate `.css` file is another source; we do not need it yet.

Syntax of one rule:

```html
<style>
  h2 {
    color: red;
  }
</style>
```

That says: occupants selected as `h2` — the property `color` has the value `red`.

`h2` here is a selector (kind), not a new heading. `color: red;` is a declaration.

Replace this example with **your** intention from 2.1. Use a selector that matches the occupant you picked. Use a property that could cause the place or look you intended. If the first property does nothing useful, try one other. Do not collect a catalog.

You may need to look up a property name once. That is allowed. What you may not do: change the tag to fake the result.

Open from disk. Write: which occupant, which rule, what changed, what stayed.

Then: change **one** value in that rule (not the selector, not the HTML). Predict what will move or recolor. Do it. Write whether the prediction held.

---

## Names this cycle must leave you with

| Phenomenon | Name |
|---|---|
| Rules for how occupants appear | **CSS** |
| Selector + declarations, together | **rule** |
| Which occupant the rule is about | **selector** |
| The aspect being set (`color`, `margin-left`, …) | **property** |
| Property plus value | **declaration** |

Appearance is a **second construction** attached to the first. Remove the rule: the occupant is still that occupant.

---

## Syntax you must be able to produce

Without looking at this chapter:

- a `<style>` block in the head
- one rule: selector, braces, a declaration ending in `;`
- a change to one value, on purpose

If you can say “appearance is attached” and cannot write a rule, the cycle is not done.

---

## Proofs

**Predict.** You delete the `<style>` block and leave the HTML. What still exists? What is gone?

**Explain.** Why could you not honor 2.1 with tags alone? What does a selector do that a tag does not? Where does the rule sit relative to the occupant?

**Transform — before changing files.** What construction must change, what can remain, and why?

1. The same look should apply to two different occupants of the same kind.
2. Only *one* of two headings should change; the other must stay. (If a kind-selector cannot do that, say what is missing — do not invent a library.)
3. Make the thing that was vertical *not* stacked the same way — without deleting an occupant.

**Break.** Remove only the selector, leave the declarations. What breaks?

**Diagnose.** You changed `color` and nothing on the page moved or recolored. Which relationship failed: selector match, property meaning, or the browser not interpreting CSS?

**Reconstruct.** In a small new file, one occupant and one rule, without this chapter open. Different occupant text than 2.1.

**Transfer.** “The tab title stays the same. The heading on the page should sit away from the left edge.” What constructions already exist? What must be added?

---

## Door (do not walk through it)

You can change how one thing appears. A desk is not one thing. Predict what must exist to have several things, in an order, that are still one page.

You already have more than one occupant in TC-1. The door is not “discover that several tags can exist.” It is: **order itself is a construction** — and a pile of tagged things is not yet a list you can treat as one book.

Do not write JavaScript.

---

## What you push

1. `docs/construction/curriculum/constructions/tc-2/page.html` — same occupants, new rules. Optional: `new_construct.html` if you reconstruct in a second file.
2. `docs/construction/curriculum/my-work/tc-2/notes.md` — leftovers, 2.1 prediction and result, 2.2 rule and the one-value change, proofs, door.

TC-3 is generated when you can change one rule, predict the rendering, and say appearance is attached — not when the heading is merely red.
