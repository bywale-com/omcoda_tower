# TC-2 evaluation

**Judgment:** Exit capability **not met**. Next chapter **must not** be generated.

**Evidence read:** `constructions/tc-2/page.html` · `constructions/tc-2/page_frozen.html` · `constructions/tc-2/new_small_file.html` · `my-work/tc-2/notes.md` (`8862410` — notes file **not in the commit**; still the empty template)

The cycle is not done when the heading has a color. It is done when you can change one rule, predict the rendering, and say appearance is attached. The rules are in the file. The saying is not.

---

## What the files actually contain

`page.html` copied the TC-1 occupants and put a `<style>` block in the **head**. That is the right *place* for this cycle’s syntax.

Three rules:

- `div { font-size: xx-large; flex: auto; }`
- `p { color: blue; }`
- `h2 { margin-top: 100px; }`

Tags and words of the occupants were not swapped to fake look. `p` is still `p`. `h2` is still `h2`. Color and space-above are the chapter’s own example intentions, and they are caused by **declarations**, not by a different tag.

`new_small_file.html` is a second document with one real rule (`h1 { font-size: 40px; }`). Reconstruct was attempted.

So: the second construction (rules) was attached. That is not nothing.

---

## Why it does not pass

1. **Notes are empty.** Leftovers, 2.1 prediction, 2.1 HTML-only try, 2.2 one-value change, Predict / Explain / Transform / Break / Diagnose / Transfer / Door — all blank. Transform was required **before** changing files. There is no evidence of that. Without the notes, “appearance is a second construction attached to the first” is something the *files* hint and the *learner* has not stated.

2. **Leftovers, third skip.** TC-0 Transform 3 and “title also on the page” were carried from TC-0, then TC-1, then into this chapter as required answers *before 2.1*. Empty a third time is a fail **on those proofs**. It is not a rewrite of TC-0.

3. **The chapter asked for one occupant.** Three rules on three kinds is a catalog. Pick the intention you actually meant; the rest is noise until you can say which selector did which job.

4. **`flex: auto` on a `div` with no `display: flex`.** Flex is not this cycle (layout mechanisms are later). As written it is unlikely to be the cause of anything you can point at. If you cannot say what that declaration did, it should not be in the file.

5. **2.1 is not evidenced.** `page_frozen.html` already has CSS as **inline** `style="..."` attributes. That is still CSS, attached on the tag, not “HTML only.” The chapter asked you to try tags/words alone, feel the wall, *then* attach a rule in `<style>`. Inline style skips the wall or names a third place rules can sit — either way, it has to be in the notes.

6. **Broken tree.** TC-1’s `div` wrapped `h1` + `p`. `page.html` closes the `div` immediately (`<div>This is a div</div>`) and then has a stray `</div>`. The occupants still show; the parent/child relationship you already had is now a lie in the source.

7. **`new_small_file.html`** has `<head>>`, two empty `<h2>`s, and no notes saying what reconstruct was supposed to prove.

---

## What is *not* a fail

- Using `<style>` in the head (correct representation for this cycle).
- Not starting a server, not writing JavaScript, not Tailwind.
- Not changing `h2` into another tag in order to “move” it.
- Reconstruct attempted in a second file (weak, but it exists).

---

## Syntax

The form `selector { property: value; }` inside `<style>` in `head` was produced. Fluency is not met until you can produce **one** rule on purpose, change **one** value, and write what you predicted. That writing is missing.

---

## Advance

**Do not generate TC-3.**

Fill `my-work/tc-2/notes.md` in your words. Required:

- Both leftovers (third ask — this is the last carry).
- 2.1: which occupant, intention, HTML-only prediction, what you tried, what happened.
- 2.2: the one rule that is the point; one value change; prediction then result.
- Proofs, including Transform written as reasoning, not as a recap of the chapter.
- Door.

You do **not** need a new essay in the HTML. You may leave `page.html` as the construction if you also say, in notes, which **one** rule is the cycle and what `flex: auto` was doing (or delete it). Push notes + files again. That push is the next evaluation.
