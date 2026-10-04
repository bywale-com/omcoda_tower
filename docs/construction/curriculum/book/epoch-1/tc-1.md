# TC-1 — Occupant

Generated from your TC-0 work. Work this chapter alone. Push the construction and the notes when you are done.

You already have the chain: you author source → the browser interprets it → a page exists. Your empty `page.html` is still that chain. Do not start a server. Do not write CSS or JavaScript.

---

## What you already said

From your TC-0 door:

> The empty file is not enough. What’s in my head has to get into the file, for the browser to interpret and render.

That is the starting construction. This chapter does not teach it again. It asks you to do it, then finds what that construction still cannot do.

---

## 1.1 The intention enters the source

Decide one thing you want to exist on the page. A word. A short phrase. Something you chose — not a line copied from this chapter.

Put that, and only that, into `docs/construction/curriculum/constructions/tc-1/page.html`.

No tags. No `<html>`. No `<h1>`. Just the characters of the thing you intend.

Open the file from disk. Write in `my-work/tc-1/notes.md`, before reading further:

- What did you intend?
- What did you put in the source?
- What appeared on the page?
- Why, given the chain you already have?

### After you have written that

The page is no longer blank because the source is no longer empty. The characters you authored were interpreted as an **occupant** — something that exists on the page because the source said so.

You did not need a new chain. You put an intention into the same chain.

If nothing appeared, write what you actually see (some browsers show the characters; some show them in a way that looks like “the file itself”). The cause is still: the browser interpreted those characters. Stay here until you can say that without this paragraph.

---

## 1.2 This occupant has no kind, and no place that means “do not appear”

Naked characters can carry one intention onto the page. They cannot say two different things about two pieces of source.

Write a prediction first, then try, then write what happened.

**Intention:** In the same file, you want

1. a **title** for the tab / the document — it must **not** appear as a line on the page, and
2. the occupant you already chose — it **must** appear on the page.

Using only undifferentiated characters (the 1.1 construction), can the browser tell which characters are the title and which are the occupant? Why or why not?

Do the experiment with 1.1’s construction if you want. Do not look up a solution yet.

### After you have felt that

The source is a stream. The browser has no construction that means “this is a thing of this kind” or “this appears” versus “this does not.”

That is why a **tag** exists. A tag is the representation of “this is a thing.” The thing it names is an **element**.

Two places become necessary:

- **body** — the place whose occupants appear on the page
- **head** — the place whose occupants do not appear as lines on the page (a document **title** lives here)

The whole file, once it has that shape, is a **document**.

You do not need a catalog of tags. You need one occupant in the body, and a title in the head that does not appear as a line on the page.

### Syntax (only now)

A tag has a name. You open it and you close it. What sits between is the occupant’s contents.

The smallest document that can hold “appears” and “does not appear”:

```html
<!DOCTYPE html>
<html>
  <head>
    <title></title>
  </head>
  <body>
  </body>
</html>
```

`<!DOCTYPE html>` tells the browser this document is HTML. `<html>` is the document. `<head>` and `<body>` are the two places. `<title>` is an element that belongs in the head.

Put your title between the title tags. Put your occupant in the body as **one** text-bearing element. Pick the element. A heading is `<h1>…</h1>`. A paragraph is `<p>…</p>`. The chapter used those two names so you can type them. The exit is not typing the same occupant this paragraph described.

Open from disk. Confirm: the title is not a line on the page; the occupant is.

Then: remove only the occupant’s tags, leave the words. Predict what happens. Do it. Write which construction you removed.

---

## Leftover from TC-0 (one paragraph)

**Same emptiness; the browser must treat it as not a page.** What construction must change, what can remain, and why? Your TC-0 note restated the chain. Answer the transformation.

---

## Names this cycle must leave you with

| Phenomenon | Name |
|---|---|
| Something on the page because source said so | **occupant** |
| The mark that says “this is a thing” | **tag** |
| The thing the tags bound | **element** |
| The file as a shaped HTML whole | **document** |
| The place that appears | **body** |
| The place that does not appear as page lines | **head** |
| The document’s name that belongs in the head | **title** |

---

## Syntax you must be able to produce

Without looking at this chapter:

- an opening and closing tag around contents
- a document with `html`, `head` (with `title`), and `body`
- one text-bearing element in the body that you chose

If you can explain the two places and cannot write the tags, the cycle is not done.

---

## Proofs

Answer in `my-work/tc-1/notes.md`. Transform **before** you change files.

**Predict.** You delete the `<body>` tags but leave the occupant’s words in the file. What will appear? Why?

**Explain.** Why did undifferentiated characters fail the title-and-occupant intention? What does a tag actually do? Where does a title sit relative to an occupant?

**Transform.** What construction must change, what can remain, and why?

1. The occupant should be a different *kind* of thing than the one you used (heading ↔ paragraph, or another text-bearing element you can name).
2. I want two occupants on the page. (This cycle’s *point* is still one, but the transformation asks what would have to exist.)
3. I want the title to appear *on the page* as well as in the tab.

**Break.** Remove the occupant’s element entirely (tags and words). What is still true? What became impossible?

**Diagnose.** The title is showing as a line on the page. Which relationship is wrong — source, kind, place, or interpretation?

**Reconstruct.** Cause a visible occupant in a new file without this chapter open. Different words than 1.1. Then write the document from memory.

**Transfer.** “I want a page that shows my name, and I want the browser tab to say something else.” What must exist? Do not implement until you have named the places.

---

## Door (do not walk through it)

The occupant exists. You cannot yet control where it sits or how it looks without changing what it *is*.

Predict what kind of construction that will require. Do not write CSS.

---

## What you push

1. `docs/construction/curriculum/constructions/tc-1/page.html` — your document, your occupant, your title.
2. `docs/construction/curriculum/my-work/tc-1/notes.md` — 1.1 before the names, 1.2 prediction and result, leftover Transform 3, proofs, door, uncertainties.

TC-2 is not generated because the map’s next row exists. It is generated when you can cause a different occupant than this chapter named, and the appearance-pressure is visible.
