# TC-2 evaluation

**Judgment:** Exit capability met. Next pressure visible. TC-3 may be generated.

**Evidence read:** `constructions/tc-2/page.html` · `page_frozen.html` · `new_small_file.html` · empty notes template (`8862410`) · learner follow-up: already knows some CSS; would not use HTML-only to design.

The HTML-only try is **not** a dealbreaker. RULES: if the failure is predicted and explained, it has been felt. They said tags cannot do look. That is 2.1. Ceremonial hours of “design with HTML” would be the thing the curriculum forbids.

---

## What is actually understood

- Appearance is a **second construction**. Occupants stayed `div` / `h1` / `p` / `h2`; look and place changed through **rules**.
- Representation is right for this cycle: `<style>` in `head`, `selector { property: value; }`.
- `p { color: blue; }` and `h2 { margin-top: 100px; }` are the chapter’s own intentions, caused by declarations.
- Reconstruct attempted (`new_small_file.html`, a second document, a rule on `h1`).
- No server, no JS, no Tailwind, no tag-swap to fake layout.

## What TC-3 must not pretend

- They already know CSS exists and that HTML is not for look. Do not reopen “what is a rule.”
- Several occupants already exist. Do not “discover that more than one tag can be on a page.” Order / tree / **arrangement** is the pressure, not occupancy.
- `flex: auto` is already in the file **without** `display: flex`. That is the opening of layout: a flex property does nothing useful until the box is a flex container. Do not scold it as a catalog; use it.
- Kind-selectors already match every `p` / every `h2`. Targeting *one* of two headings is still missing — cascade/specificity or a more specific selector, only as layout needs it, not as a selector encyclopedia.

## Holes (do not block)

1. **Notes were empty.** Proofs live in the files and in the follow-up, not in `notes.md`. Do not make TC-3 a notes-compliance chapter. One leftover is enough: what `flex: auto` did (or failed to do) without `display: flex`.
2. **Leftovers from TC-0/TC-1** still unanswered. Stop carrying them as a third/fourth fail. They are not this cycle.
3. **Broken tree.** TC-1’s `div` wrapped `h1` + `p`. `page.html` closes the `div` immediately and leaves a stray `</div>`. Parent/child is already a live bug. TC-3 uses it; it does not fail TC-2 for it.
4. **Inline `style=""`** on `page_frozen.html` is another place a rule can sit. Name it if it comes up; do not make it the lesson.

## Syntax

`<style>` in `head`, rules, declarations produced. Fluency for this cycle met. One unused `flex: auto` is not a syntax fail; it is the next mechanism.

## Advance

Generate TC-3 from this file + `page.html` + JOURNEY v3 TC-3 (layout: box, flex, grid, cascade, responsive as CSS) + RULES. Opening move: a color rule cannot be a page. Arrange the occupants they already have. Raw CSS once. Tailwind is TC-4.
