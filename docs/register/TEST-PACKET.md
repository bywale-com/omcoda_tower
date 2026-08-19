# Test packet — how Input/Output get filled

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**.  
**When:** 2026-08-18 22:56. A29 look locked. A30 only **where Test sits**. This file is **how Test fills** — not another field PNG.  
**Plates:** [`A30-test-on-canvas.png`](./automations-blueprint/A30-test-on-canvas.png) — **Save · Test · Launch only**. [`A29-variable-chip.png`](./automations-blueprint/A29-variable-chip.png) — what a filled Input looks like (look packet: [`INPUT-LOOK-PACKET.md`](./INPUT-LOOK-PACKET.md)).  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Face **law 33 · 39**. [`PRIMITIVES.md`](./PRIMITIVES.md).  
**Does not:** plant; recut 015; mint a test table; bolt a Test tab; touch live writes (INSERT / enroll / send); invent extra import fields.

---

## Paste — engineer

```text
Read docs/register/TEST-PACKET.md all the way through. Then INPUT-LOOK-PACKET.md and NODE-INTERIOR.md.

You are building Test on CT Ant Automations. Product face = /prototype-ant. Hub is not the app.

Test sits on the canvas: Save · Test · Launch workflow. Launch is the live run. Test is not Launch. There is no Test tab on the node.

Test fills the Input and Output panes we already have (A29 look / A20 Output). Fields and values. It does not commit. Two doors — write already exists vs does not exist yet — are in this file. Do not hardcode a field list in the client. The write-set is what the module actually writes (law 33).

Read docs/register/PLATE-READ.md. Do not recut 015. Do not overwrite 15:43.
```

## Paste — Systems Analyst

```text
You are Tower’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Log: docs/register/SYSTEMS-ANALYST-LOG.md. 15:43 stands. Test face is docs/register/TEST-PACKET.md plus law 33 and 39. Input look is a different packet.

Do not mint tables from A30. Do not recut 015.

The operator needs values they can trust, and to know where those values came from. Two doors. Short ascribe:

A. The write **already exists** (book row, past import_batch, past form submission, past workflow_run). Where do we already read those values without a new store? Get / enrollment / workflow_run / lastOutput — what is housed, what is silent? Test of Get is a read, not a write.

B. The write **does not exist yet** (trigger has not fired; Audit / Rule / Action has not run). We must not INSERT. What may we project from the module’s real write-set so Output is complete (contact import = import_batch + contact_records, not a toy subset)? Specimen values vs last similar event — map what already exists. If a module cannot be projected honestly (Audit scores?), say silent. Do not invent a fake results table.

Chain: each node’s Input is the previous Output handle (tested or live). This node’s Output is what it would write from that Input, without committing.

Do not recut 015. Stamp SYSTEMS-ANALYST-LOG.
```

---

## Founder comments (preserve)

- A30: purpose of the picture was unclear except **where Test sits**. Agreed: Test sits. Save · Test · Launch.
- Was looking for a field look — **A29 is that look.** Filling is the remaining question.
- Test fills those modules. Agreed.
- Values are **just as important** as the parameters. The whole purpose includes values.
- Need to know **how** it derives / sources those outputs. From data that **already exists**? What if the data **doesn’t exist yet**?
- Simulate perfectly, no gap, no hardcoded list (so it can update). Do not bolt. Do not touch live data as the run.

---

## Thesis (plain)

The machine will run. Test is not to prove that.

**Test fills Input and Output with that node’s writes — the fields and the values — so you can map them.** It does not Launch. It does not enroll, import, audit-for-real, or send. The left is still that write-shape (law 42), not n8n in-memory. Test does not INSERT.

Where the values come from is two doors. Do not collapse them.

---

## Two doors

| Door | When | Where values come from | What Test must not do |
|------|------|------------------------|------------------------|
| **1. Already exists** | The record is already in the app. A contact in the book. A past import batch. A past form submission. A past run of this workflow. **Get** is this door: it reads a module. | **Those records.** Pick which instance if there are many (cousin of Local / Select). Honest empty if the grain has no rows. | Must **not write**. A read is not a Launch. |
| **2. Does not exist yet** | This trigger has not fired. This Audit / Rule / Action has not run. There is no batch, no verdict, no rule output yet. | **The module’s real write-set** (law 33) — the same fields a live run would produce. Contact import still `import_batch` + `contact_records`. Values are a **specimen of those fields**, not a second schema, not a painted toy list. When the module grows a write, Test shows it. | Must **not INSERT**. Must not pretend a fake catalog of fields. If we cannot project that module honestly, SA says silent — do not fake an Audit score. |

**Get** already named the “write is not in this chain yet, read it from the module” primitive ([`NODE-INTERIOR.md`](./NODE-INTERIOR.md) Direct Input vs Get). Test of Get is door 1. Test of a trigger that has never fired is door 2. Test of a Rule after a filled Input is door 2 for the Rule’s **Output** (do not commit the evaluation) and door 1 for its **Input** if the previous handle is real records.

---

## How a canvas Test walks the chain

One control. Not a Test tab.

1. **Trigger Output** fills first (A20 shape). Door 1 if an instance of that event exists and you can point at it. Door 2 if none exists — same fields as a live fire of that event (A24 / A25 for those two), specimen values.
2. **Next node Input** is that handle. A29 tree. Fields and values. This is why you test.
3. **That node Output** is what **it** would write from that Input. Get → door 1 read. Rule / Audit / Action → door 2 project, no commit.
4. Repeat down the wire. Downstream Input always **picks** from the previous Output (law 33). Never “latest audit in the firm” as a guess.

Launch is the other button. Launch **is** the live run.

---

## A30 — 1. Copy (buttons only)

- Canvas header: **Save · Test · Launch workflow**.
- Launch is the primary live run.
- Test is not Launch. Test is not a node tab. Tabs stay Workflow · Runs · Settings.

## A30 — 2. Do not build

- The rest of [`A30-test-on-canvas.png`](./automations-blueprint/A30-test-on-canvas.png). **Stale chrome.** Trust the three buttons, not Harbor / icon sider / extra catalog rows.
- A Test **tab** on the node.
- Hardcoded field lists in the client.
- Commit on Test.

## A30 — 3. Implied

- Test is available on a draft. It fills whatever nodes are on **this** canvas.
- After Test, open a node → Input / Output are populated (A29 / A20).

## A30 — 4. Completes

- **Pick an existing instance** when door 1 applies (which batch, which form, which run). No extra PNG this stamp — cousin of Local / Select. SA ascribes the control; do not invent a third grain picker on A30.
- Empty Output when door 1 has nothing is honest.
- Specimen labeling so the operator can see door 2 is not a live commit — if a mark is needed, it is not a teaching paragraph on the glass.

## A30 — 5. Out of scope

Desk chrome. A29 look. Get Parameters. Launch’s live walk (015).

---

## Live vs this packet

| Live today | This packet |
|------------|-------------|
| Hub execute / lastOutput smell | Test fills Ant Input/Output; no commit |
| workflowWalk on Launch | Launch stays that path. Do not recut 015 into Test |
| Empty Input until something ran | Test is how authoring sees the handle |
| A23 mapping bolt | Chips — Input look packet |

---

## Do not

- Plant. Recut 015. Overwrite 15:43.
- Collapse door 1 and door 2.
- Ask the PM to restate this pocket. It is here.
