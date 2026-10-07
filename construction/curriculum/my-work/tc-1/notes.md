# TC-1 notes

Write in your words. Do not paste the chapter.

## Leftover — TC-0 Transform 3

Same emptiness; the browser must treat it as not a page. What must change, what can remain, and why?

## 1.1 before reading further

What I intended:
- I intended to see what just typing as I normally do would render in the page.

What I put in the source:

- I put a very short sentence, without any tags.
What appeared:

Why:
- I wanted to the see relationship between what I type and how it appears in the page, before any syntax. And I discovered some critical things.
## 1.2 prediction, then result

Can undifferentiated characters do title-that-does-not-appear + occupant-that-does? Why or why not?

What I tried: Interestingly, my first thought was to write something like 'Title - ...' and see what happens, but as I wrote 'Title..' I saw an autosuggested syntax for title. So I went ahead and used it. Btw, it's the first time this entire time I've seen any syntax suggested which is kind of cool. And yes, that did change the title. BTW, I wasn't exactly sure if the page.html being displayed on the face of the tab was the title. I wasn't totally sure where the title would appear anyway. Yes, page.html on the tab face was acting as the title, even though it was never specified in the file, which must mean, in absence of <title>x</title>, the browser *may* use the name of the file as the tabs title.

What happened:
Just as I stated in the prediction section.
## After the tags

What I put in `head`:

What I put in `body`:

Remove only the occupant’s tags, leave the words. Prediction, then result:

## Proofs

### Predict

- The occupants word will remain. <body> is a tag that informs the interpreter of what type a thing is. So are the other tags. Otherwise, they are simply occupants, limited occupants.


### Explain

- Anything in the file that is intended to be off the page, but still present in the metadata or title e.t.c must be differentiated in a very specific way. Things that live off the page are typically declared inside of a larger tag called <head>. For differentiated things intended for the page, they must live in the <body> tag.
<title> is an example of something that lives in <head>
- Otherwise, they remain undifferntiated occupants subject to the rules of undifferentiated occuptants in the way the browser classifies them.


### Transform (written before changing files)

1. Different kind of occupant:
- The tag must change. The choice of tag depends on what you're intending.Fo r another text-bearing type, you can try <p> for paragraph text or another heading size i.e <h3> e.t.c

2. Two occupants:
- For two occupants, I'll intepret this to mean two occupants of any kind across differentiated or undifferntiated origins. Simple, write a word, phrase or sentence on the page. That will the first occupant. For the second you can use a differntiated occupant like <title>. Note. <title> *should* live inside of the <head> tag. However, it's not required for it to appear.

Although from some tests I've run, it does appear that the page priorities the title elements that come first. 
First come, first serve -no pun intended.
3. Title also on the page:

### Break

### Diagnose

### Reconstruct: []

### Transfer

## Door

The occupant exists but I cannot control place / look without changing what it is. What kind of construction will that require?

## Uncertain
