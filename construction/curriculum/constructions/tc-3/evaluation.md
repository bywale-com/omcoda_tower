# TC-3 evaluation

**Judgment:** Exit capability met. Next pressure visible. TC-4 may be generated.

**Evidence read:** `constructions/tc-3/page.html` (`e128aec`) · `constructions/tc-3/notes.md` (leftover, 3.1, 3.2 filled; 3.3–3.5 and proofs blank) · follow-up: notes incomplete; code should show enough to go on.

Incomplete notes do **not** block. Same law as TC-2: if the construction shows the mechanism, ceremonial notes are not the cycle.

---

## What is actually understood

- **Layout is a different family from paint.** 3.1: color / font-size / one margin did not arrange. Then they stopped trying to fake a page with those.
- **Box model is felt.** `.box` has padding, a visible border, and margin. Notes: they could tell the three spaces apart on screen.
- **Arrangement sits on a parent that has children.** `.container { display: grid; grid-template-columns: auto 1fr; }` with three `.box` children. That is a wrapping grid (third box goes to the next row). Not spacers. Not a tag-swap.
- **Classes target.** Occupants are `.container` / `.box` / `.box-styling`, not only `div { }`. `.box:nth-child(2)` vs `.box` is two rules on the same kind of occupant — cascade is in the file even though 3.5 is blank in notes.
- No server, no JS, no Tailwind, no npm. Raw CSS in `<style>`. Correct boundary for this cycle.

## What TC-4 must not pretend

- Do not reopen “CSS exists,” tags, or HTML-as-design.
- Do not reopen color-as-layout. They already tried.
- Do not teach grid as if they have never seen a parent with `display: grid`. Rebuild *this* page in the production vocabulary.
- Do not scold unused class names `box-2` `box-3` as a catalog. Ignore them or use them.
- Flex was **attempted**, not landed as a container of siblings. Notes: `display: flex` on a class wrapping a lonely labeled div. Comments in CSS mention `flex-direction` on `.box`. The leftover from TC-2 (`flex: auto` without a flex parent) is still live: a flex property is idle unless the **parent of the items** is a flex container. TC-4’s Tailwind `flex` is that declaration. Point at it. Do not make TC-4 a second layout textbook.

## Holes (do not block)

1. **`display: flex` is not in the shipped CSS.** The chapter asked for a row and a stack from flex. Grid did the arrangement instead. Name it. Do not fail the cycle into a flex-compliance chapter. One leftover is enough: which node would have to be the flex **parent**.
2. **Notes 3.3–3.5 and proofs blank.** Proofs live in `page.html`. Do not make TC-4 a notes-compliance chapter.
3. **`constructions/tc-2/page.html` missing** after `bbf591e` (machine move). `page_frozen.html` remains. Do not fail TC-3 for a vanished prior file.
4. **Border “pushes in.”** Useful observation; `box-sizing` is not this cycle. Leave it.

## Syntax

`display: grid`, column template, padding / border / margin, class selectors, `:nth-child`. Fluency for **grid + box** met. Flex parent syntax is the hole, not a reason to withhold the due bridge.

## Advance

Generate TC-4 from this file + `page.html` + JOURNEY v3 TC-4 (Tailwind CSS 4 **standalone CLI**, no `package.json`) + RULES. Opening: their `.container` is the parent; a utility is a name for a CSS declaration they can already write. Rebuild the three-box grid. Drop to CSS once (the `:nth-child(2)` padding is a natural drop). Bridge proof: point utilities at mechanism; say the CLI is a compiler, not Node-as-product; name the Vite plugin as TC-13.
