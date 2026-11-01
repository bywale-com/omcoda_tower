# TC-0 — how the first cycle operates

**Status:** Operating grain for the TC-0 **contract** in [`curriculum/JOURNEY.md`](./curriculum/JOURNEY.md). Not the chapter.  
**Depends on:** [`curriculum/RULES.md`](./curriculum/RULES.md), [`curriculum/MASTERY.md`](./curriculum/MASTERY.md), [`curriculum/DESTINATION.md`](./curriculum/DESTINATION.md).  
**Do not do yet:** write `book/epoch-0/tc-0.md`, create `page.html`, or implement anything. The skeleton already exists under [`curriculum/`](./curriculum/).

This is the spec for the first generated section. If you accept it, the next move is to create the Construction repo and write the TC-0 chapter — still leaving the working file for you to construct.

---

## Intention

Discover the smallest causal chain from something you author to something a browser produces.

```
you author a file
        ↓
the browser interprets it
        ↓
a page exists
```

In this cycle the page is blank. That is not a missing step. Blank is what this chain produces when the file has no occupant.

No document skeleton. No “Hello world.” No occupant. HTML as a *language of things on a page* is TC-1.

---

## Actual zero (do not confuse the two)

**Zero means:** no software-construction knowledge — not TypeScript, not HTML, not “how a frontend starts,” not how a page is caused.

**Zero does not mean:** no computer literacy. You already navigate repositories, inspect `src/`, recognize project boundaries, use GitHub, open files in an editor, and reason about configs (including Vite) as artifacts. This cycle does not spend bandwidth proving that a file lives in a folder, that an editor can save, or that a browser is a program.

If a checkpoint could be titled “what is a folder?” it does not belong here.

---

## Why this is the first construction

Current Tower’s product face is still this chain, under later machinery: authored source, interpreted by a browser, producing a page.

If that relationship is not understood, every later cycle is decoration on a mystery.

The limitation this cycle must make visible — the door to TC-1:

> Blank page. I have something in my head that I want to exist on it. How do I cause that?

This chain cannot answer that yet. An empty file has no construction that means “this appears.” That is when HTML starts becoming necessary.

---

## The chapter is the tutor

The generated `book/epoch-0/tc-0.md` must contain enough intention, explanation, construction, syntax, experiments, names, and proofs that you can work the cycle **alone**.

Long stretch: you, the chapter, the editor, the browser, and the consequences of what you write.

I do not sit beside keystrokes. I move at the **unit boundary**: you push completed work; I evaluate that evidence; that evaluation decides whether TC-1 is generated.

GitHub remains the envelope you already know how to use. The chapter will not teach commit or push.

Open the page from the **filesystem**. Do not start a development server. A server is a later construction (map: TC-15).

---

## What is generated vs what you construct

When this operating proposal is accepted, I generate **only** this package, in a new repository called Tower Construction:

| I write | You construct |
|---|---|
| `JOURNEY.md` — epochs → cycles (provisional TOC) | Nothing in the journey. You may dispute a boundary later. |
| `RULES.md` — the laws from the proposal | Nothing. |
| `book/epoch-0/tc-0.md` — a self-contained chapter | You do the construction and the experiments. You do not copy a finished page. |
| `constructions/tc-0/` — an empty slot | The file that the browser interprets. |
| `my-work/tc-0/` — a notes template | Your model, proof answers, uncertainties. |

I do **not** write `page.html`. I do not write `<html>`. I do not add a preview server. I do not open `prototype-ant.html` as a model.

---

## Checkpoints (compressed)

Two, not six. Both serve the same construction. Work them from the chapter, independently. Write in `my-work/tc-0/` what you think the cause is, in your words, before the chapter gives the industry name.

### 0.1 Cause the chain

**Question:** What is the smallest thing you can author that a browser will interpret as a page?

**You do:** Create an empty file named `page.html` in `constructions/tc-0/`. Open it in the browser from disk.

**Phenomenon:** A page exists. It is blank because you authored emptiness, and the browser interpreted that file as a page.

**Name, immediately after:** this file is **source**. This kind of file is an **HTML file**. What the browser did is **interpret** / **render** the source into a **page**. The page is not the file. The page is the product of interpretation.

**Syntax you must be able to produce:** an empty `*.html` file, by your own hand, in the construction slot. Fluency here is tiny and still required: you can cause this chain again without the chapter open.

Do not put a word in the file. A word on the page is TC-1.

### 0.2 The chain is interpretation, not display

**Question:** What has to be true for that page to exist — and what breaks it?

**You do, as experiments in the chapter (predict first, then do):**

1. Same empty contents, rename to `.txt`, open that. What did the browser do differently? Why?
2. Close the tab. The file is still there. Open it again. Where was the page while the tab was gone?
3. With the page open, reload. Still blank. Why is that success, not failure?

**Phenomenon:** The browser is not showing you the editor. It is interpreting a file of a certain kind, at a moment. Change the kind, the interpretation changes. Reload is another interpretation of the same source. Empty source still renders empty.

**Name, immediately after:** **extension** as a signal of kind (only as it affects interpretation — not as a files-and-folders lesson). **Refresh** / **reload** as “interpret this source again.”

That is the whole cycle.

---

## What must not arrive in TC-0

- Literacy drills: folder, path, save, what an editor is, what a browser is, how to commit.
- Any tag (`<div>`, `<html>`, `<body>`, `<!DOCTYPE>`). The document skeleton is the first problem of TC-1: a place that means “this appears.”
- Any visible occupant (`hello`, a heading, an image).
- CSS, JavaScript, TypeScript, React, Vite, npm, a dev server.
- Opening current Tower as the example.

---

## Names TC-0 must leave you with

source · HTML file (as a kind the browser knows how to interpret) · interpret / render · page · extension (as kind-signal) · refresh / reload

Each name is attached after the phenomenon, not before. Words you already use (file, browser, editor) are not curriculum objects unless this cycle changes what they mean. Here, the change is: the browser **interprets source**; it does not display the editor.

---

## Syntax TC-0 must leave you able to write

| Construction | Syntax you can produce without looking |
|---|---|
| The smallest authored page | an empty `page.html` (or another `*.html` name you choose) |

That is the entire syntax load. Construction gives it meaning: this ending is how you ask a browser to interpret the file as a page.

---

## Proofs (end of cycle, before TC-1 is generated)

Written in the chapter. You answer in `my-work/tc-0/notes.md`. Transform answers are written **before** you change files.

**Predict.** You rename `page.html` to `page.txt` and open it the same way. What will the browser produce, and why?

**Explain.** Why is the page blank? What is the difference between the file and the page? What is the smallest causal chain you just constructed?

**Transform — before touching files.** What construction must change, what can remain, and why?

- I want two blank pages at once.
- I want this same blank page to exist on another computer.
- Same emptiness; I want the browser to treat it as *not* a page.

**Break.** Delete the file and leave the tab. What is still true? What is no longer possible?

**Diagnose.** The editor shows `page.html`. The browser cannot find it. Which relationship in the chain broke?

**Reconstruct.** Cause the chain again without the chapter open. State the chain in one sentence.

**Transfer.** “I want a blank page I can show someone by sending them something.” What must exist? Do not implement a server or Tower. Name the constructions.

**Door to TC-1 (the limitation).** You have something in your head that you want to exist on this page. Predict, without implementing, why this construction cannot cause that.

If that prediction is accurate, the problem has been felt. We do not decorate the blank page to prove it is empty.

---

## What you push back

1. `constructions/tc-0/page.html` — your empty source.
2. `my-work/tc-0/notes.md` — the chain in your words, names attached to causes, proof answers (Transform before experiments), the TC-1 door prediction, and what you are uncertain about.

That push is the only conversation this cycle needs. I evaluate the evidence. I generate TC-1 only if this chain is understood and the occupant-problem is visible.

---

## How I sit in TC-0

- I write a chapter you can work without me.
- I do not create the file.
- I do not tutor the checkpoints live.
- I review what you pushed. I may add one transform if the notes recap the chapter instead of stating the cause.
- I do not advance you to tags because you are “doing well.”

---

## What TC-1 will be allowed to need (preview, not content)

The chapter will end on this intention, unanswered:

> Okay. Blank page. I have something in my head that I want to exist on it. How do I cause that?

An empty file has no place that means “this appears” versus “this does not.” That is when a **tag**, an **element**, and a document **body** become necessary. Those names and that syntax are not in this cycle.

---

## Accept / recut this operating spec

The skeleton (JOURNEY / RULES / MASTERY / DESTINATION) is already written. If you accept **generation**, the next agent move is:

1. Copy [`curriculum/`](./curriculum/) into a standalone Tower Construction repository.
2. Generate **only** `book/epoch-0/tc-0.md` from the TC-0 contract + these operating notes + RULES, reading no previous work.
3. Leave `constructions/tc-0/` empty of any page file.

Do not generate TC-1. Do not write flesh for later cycles.
