# TC-0 — how the first cycle operates

**Status:** Operating proposal. Not the chapter. Not a scaffold. Not a repo.  
**Depends on:** [`TOWER-CONSTRUCTION-PROPOSAL.md`](./TOWER-CONSTRUCTION-PROPOSAL.md) (architecture accepted, recuts applied).  
**Do not do yet:** create `tower-construction`, write `book/epoch-0/tc-0.md`, create `page.html`, or implement anything.

This is the spec for the first generated section. If you accept it, the next move is to create the Construction repo and write the TC-0 chapter — still leaving the working file for you to construct.

---

## Intention

Cause a blank page to exist in a browser, and understand that the page exists because a file exists and the browser is reading it.

Nothing else. No occupant on the page. No document skeleton. No “Hello world.”

TC-0 may barely qualify as software. That is correct.

---

## Starting world (absolute zero)

Assume no implementation knowledge. Do not read that as inability.

You do not need to know, before this cycle, what a file, a folder, a path, an extension, a browser, or an editor are *as constructions*. You may already use those words in ordinary life. TC-0 attaches them to cause and effect.

You do not write HTML tags in this cycle. You do not write JavaScript. You do not install a package. You do not start a server.

---

## Why this is the first construction

Current Tower’s product face is still this, under a great deal of later machinery: a browser reading files and producing a page.

If that relationship is not understood, every later cycle is decoration on a mystery.

The first limitation TC-0 must make visible:

> The blank page is caused and it is empty. It cannot hold a thing we intend to exist *on* it.

That limitation is TC-1. We do not start TC-1 because the map says so. We start it when this limitation is visible and this construction is understood.

---

## What is generated vs what you construct

When this operating proposal is accepted, I generate **only** this package, in a new repository called Tower Construction:

| I write | You construct |
|---|---|
| `JOURNEY.md` — epochs → cycles → checkpoints (provisional TOC) | Nothing in the journey. You may dispute a boundary later. |
| `RULES.md` — the laws from the proposal | Nothing. |
| `book/epoch-0/tc-0.md` — the chapter: intention, checkpoints, prompts, names, syntax, proofs | You *do* the checkpoints. You do not copy a finished page. |
| `constructions/tc-0/` — an empty slot (a folder, nothing that is a page) | The file that causes the blank page. |
| `my-work/tc-0/` — a notes template: what you think is happening, names, proof answers, uncertainties | Your notes. This is what you push back. |

I do **not** write `page.html`. I do not write `<html>`. I do not add a preview server. I do not open `prototype-ant.html` as a model.

The chapter tells you what to intend and what to notice. You cause the page.

---

## Envelope (how work travels) — not a cycle

The curriculum lives in GitHub so that “complete a subsection and share it back” has a place to happen. Git is the envelope, not the lesson.

Before checkpoint 0.1, the chapter will spend a short operational preface on:

- This folder is the book plus your constructions.
- You change files in an editor (Cursor is an editor).
- Sending the construction back is: save, commit, push.
- That push *is* the discussion. I evaluate what you pushed.

Names attached immediately, as envelope words: **repository**, **commit**, **push**.

We do not teach branching, pull requests, history, or merge in TC-0. If the envelope itself is the thing that is not understood, we stop and understand the envelope. We do not pretend the blank page is the problem.

Open the page from the **filesystem** (the browser reading the file on disk). Do not start a development server. A server is a later construction (map: TC-15).

---

## Checkpoints (subsections)

Work these in order. After each checkpoint, write in `my-work/tc-0/` what you think happened, in your words, before reading the next name. Then the chapter gives the industry name.

### 0.1 A place

**Intention:** This construction needs a location.

**You do:** Recognize `constructions/tc-0/` as that location. If you needed to make a folder by hand, you would. In the generated package the slot already exists so the book and the construction can sit next to each other — you still have to know what it is.

**Phenomenon:** A construction that is not “in the air.” It lives somewhere.

**Name, immediately after:** **folder** (also called a **directory**). **path** — the address of that place.

**Syntax you must be able to produce:** a path, written as `constructions/tc-0`.

### 0.2 A file

**Intention:** Something has to exist in that place for a program to read.

**You do:** Create a file in that folder. You choose the name. The chapter will require the name to end in `.html` and will not explain why until 0.3 — except to say: use that ending.

**Phenomenon:** A file is contents plus a name, in a folder. It can contain nothing.

**Name, immediately after:** **file**. **filename**. **contents** (here: empty).

**Syntax you must be able to produce:** a filename with an extension, e.g. `page.html`. Create a second empty file from memory in a scratch place, then delete it. Fluency is producing the name, not recognizing it in the chapter.

Do not put a word in the file. A word on the page is TC-1.

### 0.3 Kind

**Intention:** The browser has to decide what kind of reading this is.

**You do:** Open the `.html` file in the browser (blank page). Create a second file in the same folder with the same empty contents but named `.txt`. Open that in the browser.

**Phenomenon:** Same emptiness, different kind, different reading. The name’s ending changed what the browser did.

**Name, immediately after:** **extension**. This kind of file is called an **HTML file**. HTML will later be the language of things *on* the page. Right now you have an HTML file with nothing in it.

**Predict before you open the `.txt`:** what will be different, and what will be the same?

### 0.4 Two programs, one file

**Intention:** Understand that the editor and the browser are two readings of the same file.

**You do:** Open `page.html` in the editor. Open the same file in the browser. Look at both.

**Phenomenon:** The editor shows characters (none). The browser shows a page (blank). Neither *is* the file. Both are readings.

**Name, immediately after:** **editor**. **browser**. **source** (what the editor is showing). The blank view is **the page the browser produced**.

This relationship will still be true when the source is TypeScript and the page is `/prototype-ant`. We do not say that sentence in the chapter as a promise. We let it become true later.

### 0.5 The page is caused

**Intention:** Separate the file from the page.

**You do, in order:**

1. Close the browser tab. Confirm the file is still in the folder.
2. Open the page again from the file.
3. Rename the file. Try the old browser address / the old tab. Then open from the new name.

**Phenomenon:** Close the tab, the file remains. Lose the file’s name, that page-reading fails. The page is not stored in the browser. The page is produced when the browser reads the file.

**Name, immediately after:** the page is a **rendering** of the source — we can also say the browser **renders** the file. You do not need the word “DOM” yet.

### 0.6 Read again

**Intention:** The browser does not watch the file.

**You do:** With the page open, rename the file in the editor’s folder view (or move it). The open tab does not automatically fix itself. Open from the file again.

Then: change nothing in the contents (still empty), reload the tab that still points at a real file. Still blank.

**Phenomenon:** A page is a reading **at a moment**. **Refresh** (reload) means: read the file again and produce the page again. The page is still blank because the file is still empty. That is not a failure. That is the cause working.

**Name, immediately after:** **refresh** / **reload**.

---

## What must not arrive in TC-0

- Any tag (`<div>`, `<html>`, `<body>`, `<!DOCTYPE>`). The empty document skeleton is the first problem of TC-1: we need a *place in the document* to put a thing.
- Any visible occupant (`hello`, a heading, an image).
- CSS, JavaScript, TypeScript, React, Vite, npm, a dev server.
- Opening current Tower as the example.
- Git beyond the envelope (branch, PR, merge, history).

---

## Names TC-0 must leave you with

folder / directory · path · file · filename · contents · extension · HTML file · editor · browser · source · render · refresh / reload · repository · commit · push

Each name is attached after the phenomenon, not before.

---

## Syntax TC-0 must leave you able to write

| Construction | Syntax you can produce without looking |
|---|---|
| A location | `constructions/tc-0` |
| A page file | `page.html` (or another name you choose, same kind) |
| Empty contents | a file with nothing in it |
| Envelope | save, commit message in your words, push |

That is the entire syntax load. It is still a fluency target: tomorrow you can cause a second blank page in a new folder without the chapter open.

---

## Proofs (end of cycle, before TC-1 is generated)

**Predict.** If we rename `page.html` while a tab is open, what happens to that tab? If we then open the file from its new name, what happens?

**Explain.** Why is the page blank? What would make it not a page at all? What is the difference between the file and the page?

**Transform — before touching files.** Each one: what construction must change, what can remain, and why?

- This blank page lived in this folder. I want the same blank page in a different folder.
- I want two blank pages at once.
- I want this blank page to exist on another computer.
- Make the thing the browser is reading a different kind of file, without changing the emptiness.

**Break.** I change the extension to `.txt` and you open it as you opened the page. What reading fails? I delete the file and leave the tab. What is still true?

**Diagnose.** The editor shows the file. The browser says it cannot find it. Which relationship broke?

**Reconstruct.** Cause a blank page again without this chapter open. Then write, from memory, the names of the constructions you used.

**Transfer.** “I want a blank page I can show someone by sending them something.” What must exist? Do not implement a server, a host, or Tower. Name the constructions.

If you can predict the failure of “put a person’s name on this page so it looks like a desk” and explain why this construction cannot do that, the limitation has been felt. We do not spend hours decorating the blank page to prove it is empty.

---

## What you push back

A cycle is not complete when you have seen a blank page.

Push:

1. `constructions/tc-0/page.html` — your file (empty, your name if you chose a different valid one).
2. `my-work/tc-0/notes.md` — in your words:
   - What you think is happening (cause, not a recap of the chapter).
   - The names you now have, attached to those causes.
   - Answers to the proofs, especially **Transform**, written *before* you performed the file changes where the prompt says so.
   - What you are uncertain about. Attack-this is welcome.

That push is the validation conversation. I will not generate TC-1 because the map’s next row is TC-1. I will generate TC-1 when this construction is understood and the next limitation is visible: **the page has no occupant.**

---

## How I sit in TC-0 (early fade)

- I expose the intention. I ask what you think must exist before I explain the mechanism.
- I do not create the file.
- After you have the phenomenon, I give the industry name.
- After a filename is required, I teach that syntax until you can produce another.
- I review what you pushed. I may add one more transform if the notes recap the chapter instead of describing the cause.
- I do not advance you to tags because you are “doing well.”

---

## What TC-1 will be allowed to need (preview, not content)

Only so you can see why TC-0 stops here:

We will want **one thing on the page**. An empty file has no place that means “this appears” versus “this does not.” That is when a **tag**, an **element**, and the document’s empty **body** become necessary. Those names and that syntax are not in this cycle.

---

## Accept / recut this operating spec

If you accept, the next agent move is:

1. Create the Tower Construction repository.
2. Write `JOURNEY.md`, `RULES.md`, and the TC-0 chapter.
3. Leave `constructions/tc-0/` empty of any page file.

If you recut, recut *this* file. Do not start TC-1. Do not generate the chapter until this spec is the spec.
