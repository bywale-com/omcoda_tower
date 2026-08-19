# Test packet — provide data on the trigger

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**.  
**When:** 2026-08-18 22:56 fill. **Revised 2026-08-19 12:04:** this is **not a canvas run**. It lives **inside the trigger**.  
**Plates:** none new. A30 canvas **Test** is **prior** — header is now Save · **Run** · Launch ([`RUN-PACKET.md`](./RUN-PACKET.md)). Trigger Output still **A24 / A25**. Filled look: [`A29-variable-chip.png`](./automations-blueprint/A29-variable-chip.png) ([`INPUT-LOOK-PACKET.md`](./INPUT-LOOK-PACKET.md)).  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Face **law 33 · 39**. [`PRIMITIVES.md`](./PRIMITIVES.md).  
**Does not:** plant; recut 015; mint a test table; bolt a Test tab; execute the canvas (that is **Run**); invent extra import fields.

---

## Paste — engineer

```text
Read docs/register/TEST-PACKET.md all the way through. Then INPUT-LOOK-PACKET.md and NODE-INTERIOR.md.

You are building trigger test-data on CT Ant Automations. Product face = /prototype-ant. Hub is not the app.

This is not a canvas Test button. Move that into the Trigger node. Any trigger you place. Rename it to what it does: provide the test data for that event.

It fills that trigger’s Output (A20 / A24 / A25). Fields and values. It does not Run the canvas. It does not Launch. There is no Test tab.

Two doors — write already exists vs does not exist yet — are in this file. Do not hardcode a field list in the client. The write-set is what the event actually writes (law 33). Run is a different packet (RUN-PACKET.md).

Read docs/register/PLATE-READ.md. Do not recut 015. Do not overwrite 15:43.
```

## Paste — Systems Analyst

```text
You are Tower’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Log: docs/register/SYSTEMS-ANALYST-LOG.md. 15:43 stands. Trigger test-data is docs/register/TEST-PACKET.md plus law 33 and 39 (revised 12:04). Run is a different packet (RUN-PACKET.md). Do not recut 015.

Do not mint tables. Short ascribe:

A. The write **already exists** (book row, past import_batch, past form submission, past workflow_run). Where do we already read those values onto the **trigger** without a new store? What is housed, what is silent?

B. The write **does not exist yet** (this event has not fired). We must not INSERT **on this control**. Contact import still `import_batch` + `contact_records`. Specimen vs last similar event — map what already exists.

This pocket stops at the trigger. The chain executing is Run. Do not ascribe walkTestGraph as the product.

Do not recut 015. Stamp SYSTEMS-ANALYST-LOG.
```

---

## Founder comments (preserve)

- A30: purpose of the picture was unclear except **where Test sits**. Agreed then: Test sits. Save · Test · Launch.
- Was looking for a field look — **A29 is that look.** Filling is the remaining question.
- Test fills those modules. Agreed.
- Values are **just as important** as the parameters. The whole purpose includes values.
- Need to know **how** it derives / sources those outputs. From data that **already exists**? What if the data **doesn’t exist yet**?
- Simulate perfectly, no gap, no hardcoded list (so it can update). Do not bolt. Do not touch live data as the run.
- **12:04:** using the software — that canvas Test is **not testing**. It is populating the trigger with test data. Move it **into the trigger**. Rename it to what it does. Run is the other button ([`RUN-PACKET.md`](./RUN-PACKET.md)).

---

## Thesis (plain)

The machine will run. **Providing trigger data is not that run.**

**This pocket fills the trigger’s Output — the fields and the values — so you can map them, and so Run has something to use.** It does not execute Get / Rule / Action / If. It does not Launch. It does not enroll, import, audit-for-real, or send. The left on the trigger is that event’s write-shape (law 42). This fill does not INSERT. **Run** is what writes ([`RUN-PACKET.md`](./RUN-PACKET.md)).

Where the values come from is two doors. Do not collapse them.

---

## Two doors

| Door | When | Where values come from | What this control must not do |
|------|------|------------------------|------------------------|
| **1. Already exists** | An instance of **this event** already happened. A past import batch. A past form submission. A past new-contact. | **Those records.** Pick which instance if there are many (cousin of Local / Select). Honest empty if the grain has no rows. | Must **not write**. This is not Run. |
| **2. Does not exist yet** | This trigger has not fired. There is no batch, no contact row from this event yet. | **The event’s real write-set** (law 33). Contact import still `import_batch` + `contact_records`. Values are a **specimen of those fields**, not a second schema. | Must **not INSERT**. Must not pretend a fake catalog of fields. |

Get is a later node. Filling Get is not this pocket. Door 1 on Get is a **read** when you **Run** (or map from records already in a table). Do not project Audit scores here.

---

## Where it sits

**Inside the trigger.** Click the placed Trigger (configure, law 38). Not Switch (**A26**). Not a canvas header button.

1. **Trigger Output** fills (A20 shape). Door 1 if an instance of that event exists and you can point at it. Door 2 if none exists — same fields as a live fire (A24 / A25 for those two), specimen values.
2. You can open the next node and **map** from that handle (A29). Mapping is not a run.
3. **Run** is what walks the chain and writes ([`RUN-PACKET.md`](./RUN-PACKET.md)). Downstream Input then **is** previous Output (law 33 / 42). Never “latest audit in the firm” as a guess.

Live canvas Test (`walkTestGraph`) projected later nodes without persisting. That projection is **not** this pocket and **not** Run. Do not keep it as a header button.

Launch is the arm. Not this file.

---

## 1. Copy

- Control **on the trigger**: provide test data for **this** event.
- Output fills (A20 / A24 / A25). Fields and values.
- Two doors. No INSERT here.
- Canvas header: **Save · Run · Launch**. No Test. Run packet owns Run / Launch.

## 2. Do not build

- Canvas **Test** ([`A30-test-on-canvas.png`](./automations-blueprint/A30-test-on-canvas.png) header). **Prior.** Harbor chrome on that PNG.
- A Test **tab** on the node.
- Hardcoded field lists in the client.
- Commit on this control. Projecting the whole canvas (`walkTestGraph`) as if it were a run.

## 3. Implied

- Every trigger kind gets this. Contact import is the specimen, not the only event.
- After fill, the next node can map (A29) before anyone presses Run.

## 4. Completes

- **Pick an existing instance** when door 1 applies (which batch, which form, which run). No extra PNG this stamp — cousin of Local / Select. SA ascribes the control; do not invent a third grain picker on the canvas header.
- Empty Output when door 1 has nothing is honest.
- Specimen labeling so the operator can see door 2 is not a live commit — if a mark is needed, it is not a teaching paragraph on the glass.

## 5. Out of scope

Desk chrome. A29 look. Get Parameters. **Run** (writes, two grains). **Launch** (arm). 015.

---

## Live vs this packet

| Live today | This packet |
|------------|-------------|
| Header Test → event contract + `walkTestGraph` | That fill **on the trigger**. No canvas Test. No projected chain. |
| Hub execute / lastOutput smell | Trigger Output fills; no commit here |
| workflowWalk on Launch | **Run** is that walk, now. **Launch** arms. [`RUN-PACKET.md`](./RUN-PACKET.md). Do not recut 015 into this fill |
| Empty Input until something ran | Trigger data is how authoring sees the handle before Run |
| A23 mapping bolt | Chips — Input look packet |

---

## Do not

- Plant. Recut 015. Overwrite 15:43.
- Collapse door 1 and door 2.
- Keep a canvas Test. Collapse this fill with Run.
- Ask the PM to restate this pocket. It is here.
