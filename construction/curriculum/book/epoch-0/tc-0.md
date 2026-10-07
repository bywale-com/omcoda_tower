# TC-0 — The smallest causal chain

Work this chapter alone. When you are done, push the construction and your notes. That push is the conversation. Nothing after this cycle is generated until those notes are evaluated.

Do not start a development server. Open the file from disk in a browser.

Do not put a word, a heading, or a tag in the file. If something appears *on* the page that you intended to put there, you have left this cycle.

---

## The intention

Something you author should cause something a browser produces.

Not “learn HTML.” Not “make a website.” The question is smaller than that:

> What is the smallest possible causal chain from something I author to something a browser produces?

Write, in `my-work/tc-0/notes.md`, what you think that chain would have to be. Three lines is enough. Then do 0.1. Do not read past 0.1 until you have done it.

---

## 0.1 Cause the chain

Create an empty file named `page.html` here:

`docs/construction/curriculum/constructions/tc-0/page.html`

Empty means empty. No characters. No `<html>`. No `hello`.

Open that file in a browser from the filesystem (not through a local server). Look at what you get.

Then, still before reading further, write in your notes:

- What exists now that did not exist before you authored the file?
- What did you author, exactly?
- What did the browser do with it?
- Why is what you are looking at blank?

### After you have written that

A page exists. It is blank because you authored emptiness, and the browser treated that file as a page.

The file you authored is **source**.

This kind of file — the kind a browser will treat as a page — is an **HTML file**. HTML will later be a language for things *on* a page. Right now it is only a kind. You have an HTML file with nothing in it.

What the browser did is **interpret** the source. Another word for the same act: **render**. The result is a **page**.

The page is not the file. The page is what interpretation produced.

### Syntax

The syntax this construction required is small, and you must be able to produce it without looking:

```
page.html
```

An empty file whose name ends in `.html`. That ending is how you ask a browser to interpret the file as a page.

Create a second empty HTML file somewhere you will delete, open it, confirm the same chain, delete it. If you cannot do that without this chapter open, stay here.

---

## 0.2 The chain is interpretation, not display

The browser is not showing you the editor. It is interpreting a file of a certain kind, at a moment.

For each experiment: write the prediction in your notes, then do it, then write what happened.

### Experiment A — kind

Keep the contents empty. Change the name from `page.html` to `page.txt`. Open `page.txt` the same way you opened the page.

Predict first: what will be the same, and what will be different? Why?

After you have done it: the **extension** is a signal of kind. Same emptiness, different kind, different interpretation. Rename it back to `page.html` when you are done.

### Experiment B — the page is not stored in the tab

Close the tab. The file is still there. Open it again.

Predict first: where was the page while the tab was gone?

After you have done it: the page is produced when the browser interprets the source. Close the tab and you have not deleted the source. You have discarded one rendering.

### Experiment C — interpret again

With `page.html` open as a page, reload.

Predict first: will it still be blank? If it is, is that failure?

After you have done it: **refresh** / **reload** means interpret this source again. Empty source still renders empty. That is the chain working.

---

## Names this cycle must leave you with

| Phenomenon you already caused | Name |
|---|---|
| The file you authored | **source** |
| This kind of file | **HTML file** |
| What the browser did with it | **interpret** / **render** |
| What you looked at | **page** |
| The ending that changed the reading | **extension** (as a kind-signal) |
| Read the source again, produce the page again | **refresh** / **reload** |

File, editor, and browser are words you already use. What changed: the browser interprets source; it does not display the editor.

---

## Proofs

Answer in `my-work/tc-0/notes.md`. For Transform, write the answers **before** you change any files.

**Predict.** You rename `page.html` to `page.txt` and open it the same way. What will the browser produce, and why?

**Explain.** Why is the page blank? What is the difference between the file and the page? State the smallest causal chain you constructed, in your words.

**Transform.** What construction must change, what can remain, and why?

1. I want two blank pages at once.
2. I want this same blank page to exist on another computer.
3. Same emptiness; I want the browser to treat it as *not* a page.

**Break.** Delete the file and leave the tab. What is still true? What is no longer possible?

**Diagnose.** The editor shows `page.html`. The browser cannot find it. Which relationship in the chain broke?

**Reconstruct.** Cause the chain again without this chapter open. State the chain in one sentence.

**Transfer.** “I want a blank page I can show someone by sending them something.” What must exist? Do not implement a server. Do not open Tower. Name the constructions.

---

## Door (do not walk through it)

You have something in your head that you want to exist on this page.

Predict, without implementing, why this construction cannot cause that.

If that prediction is accurate, the cycle has done its job. Do not type a word into `page.html` to prove the page is empty.

---

## What you push

1. `docs/construction/curriculum/constructions/tc-0/page.html` — your empty source.
2. `docs/construction/curriculum/my-work/tc-0/notes.md` — the chain in your words, names attached to causes, proof answers (Transform before the file changes), the door prediction, and what you are uncertain about.

Push that. Do not wait for a live tutor. Evaluation happens on that evidence. TC-1 is not generated because this file’s next heading exists. It is generated when this chain is understood and the occupant-problem is visible.
