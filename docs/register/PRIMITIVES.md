# Primitives — what can happen, what we can do

**Seat:** Product Manager. Plain language.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite.  
**Why:** Automations + Agents is most of the app. If a basic idea is hard, the foundation is wrong. You should be able to look at a new idea and say: **the shape supports it** or **it doesn’t, and it shouldn’t.**

We are **not** saying “write to any table.” The app is not a spreadsheet you poke.  
We **are** saying: something happens in the app → we hear it → we do a named thing the app already knows how to do. That named thing is often a write. That is still doing it **in the app.**

Webhook is a way **in** from outside. It is not an action.

---

## Two kinds of listen (trigger)

| Kind | What it is |
|------|------------|
| **Something happened in the app** | An event. **Global** = every firm + every permutation of this event. **Local** = nested dropdowns of that event’s existing shape (firm/contact primitive, plus this form / this campaign / this pack / this batch when the event has that identity). Sequential — not every dropdown at once. |
| **Not an in-app event** | **Schedule** (time). **Manual** (you pressed it). **Webhook** (the outside told us). |

Local is not implicit. The form example (all forms vs **this form**) is one **layer**, not the whole of Local. Firm/contact Select firm is another layer already named. Face: [`TRIGGER-SELECT-PACKET.md`](./TRIGGER-SELECT-PACKET.md) · **A26**.

Some events have no instance axis (an audit is one-time). That is still an event. SA maps. Do not invent a fake instance.

---

## Events we can hear (shape so far)

These are the in-app events. If a new “when X happens” is not this list, the shape does not support it yet — and maybe it shouldn’t.

| Event | Global | Local (instance layer) |
|-------|--------|------------------------|
| **A form was submitted** | All forms | **This form** |
| **A campaign failed** | All campaign failures | **This campaign** |
| **Someone opted out / unsubscribed** | All of those | — |
| **A firm was created / provisioned** | All new firms | — |
| **An audit finished** | All audits | (probably none — one-time) |
| **A contact file was imported** | All contact-file imports | **This batch** |
| **A new contact** | All new contacts | **This firm** — later if we need it |
| **A reference pack / eligibility criteria was updated** | All pack updates | **This pack** |

**Global** on every row also means **every firm**. The Local column is the **instance** layer only. Firm/contact Select firm is the other Local layer and is not restated per row. Nested; SA maps order. Do not treat a dash as “no Local at all” until SA says the firm axis is also empty.

That is the list from the face we have already named. Not “any row changed.”

**Contact import** and **new contact** are two events. Import is uploading a file into the book (`import_batch`). That is the event. Creating people is a path inside that process, not the identity of the event — rows upsert; existing contacts can be updated, not only created. **New contact** is that person (`contact_records` for that one), with or without an import.

**What contact import writes (live, this run):** `import_batch` (the batch) + one `contact_records` write per row in the file. That is the handle. Next node picks. Audit / tags are **later nodes**, not this event. Live fires **one** event (`contact_import`). It does not also fire new-contact per row — that is the gap we just named, not proof they are the same event.

---

## Actions we can do (shape so far)

Two kinds. That is the whole split.

**1. Agents** — send people to a goal  
- Assign an **existing** sequence  
- Create **from a template**  
- You do **not** author a new agent in Automations  

**2. In the application** — do a thing the app already does  

| Action | Plain |
|--------|--------|
| **Ascribe a tag** | Put a tag on the person (subscribed / not, valid / not, …) |
| **Run an audit** | Same audit the desk already runs. A node. Not hardcoded on upload. |
| **Who this applies to** | Contacts on the automation. Does **not** start a mission now. |
| **Make a form** | Automations owns the form. Questions are the required data. |
| **Provision a firm** | Later idea — see below. Canonical Automations **hears** that a firm was created (event). It does not have to **be** the desk that creates it. |

Not on the list: “write whatever into whatever table.” Not on the list: webhook-as-an-action.

If / condition is not an action. It is a fork after a result.

**Get** is not an action. It is a **node kind**. It **reads** records that already exist in a module. The writes it produces are those records. Same handle: every write that run made. Not Audit. **Input** (the left tree) is not Get-only — [`NODE-INTERIOR.md`](./NODE-INTERIOR.md). Get **Parameters**: Every firm is still a choice (dropdown). Select opens the next dropdowns, which are also input boxes — that is where left-side writes apply.

---

## After an action: the previous result is every write that run made

That is the primitive. It applies to every action. We do not specify a field list.

The action **passes the work to the real module**. When that module finishes, **every write that run made** is available to the next node. The next node **picks** which of those writes it is about.

Audit produces a lot of writes (the run, verdicts, sequence-ready, whatever else that run touched). All of that is available. Provision, given the form values, runs — every write from **that** run is available. Same shape.

“Two things” on Audit was a bad restatement. Two grains showed up because that module writes a batch row **and** per-person rows. That is the write-set. It is not a law that every action has two outputs.

**How you pick:** point the If at a write (or a field of a write) already on that handle. A person-row write splits people. A run-row write is the artifact.

**Not the previous result:** hearing the completion as a **trigger** on a different automation. That is the other door.

Hub `lastOutput` → `lastInput` is the smell, not the live path. Live is SA **015** (engineer). Do not recut it here.

---

## Test (why you press it)

The machine will run. Testing is not to prove that.

You test so **Input and Output show the parameters** — every write that node would produce — so you can map those into boxes in the next nodes. It is less about the values than about the **shape**.

Test does **not** touch live data. It **simulates** that event/node’s writes **completely**, from what the module actually writes (the handle above), not a hardcoded list. A trigger that writes a lot (contact import: `import_batch` + `contact_records`) must show **all** of that. No gap. When the module grows a write, Test shows it.

A **variable** is not a string you type. It is its own **colored chip**, placed from the left into any open box.

Face **law 39 · 40**. Plates **A30** · **A29**. Do not bolt a Test module.

---

## Shape: when a node finishes, you have what the module produced

This is the whole question. Automations only works if this is true.

An action is not a fake step. It **sends the work to the real module** (Audit, Contacts, Agents — whatever that action is). That module does its job, same as if you had pressed it on that desk.

When that node **completes**, the next step has **everything that module produced** — every write, every result — **as if you had done it in the module.** Naturally. Not a special automation-only copy. Not a guess.

Example: Audit action.

1. The node hands Audit **who we are auditing**.
2. Audit runs. It writes whatever that module writes.
3. After the node, **every write from that run** is the previous result. The next node picks. Not a short list we specified.

Same for Provision: this form submitted → pass the values → every write from that provision run.

### Two layers. That is the whole shape.

| Layer | What it is |
|-------|------------|
| **The writes** | Live in the module. **Every write that run made.** Same records you would open on that desk. Not a shadow copy Automations invented. |
| **The handle** | After this node, the next step is pointing at **those** writes — not “go find some audit.” The next node **picks** which write. |

A wire that looks like an n8n **pipe** is one way to see the handle. A then-this list where the next node reads **this node’s output id** is the same product. **Pipe vs this-then-that is not the question.** The question is: when the node completes, do we have the module’s output. If the next step has to guess (latest audit for this firm), it is not this node.

“Everything it produces” means **every write that run made**. Not a short list. Not the entire database from other runs. The If is calling from **that**.

### Two doors. Do not collapse them.

| Door | What it is |
|------|------------|
| **On this canvas** | Event → Audit action → If on that output → tag / agents. Needs the **handle**. |
| **A different automation** | Hear **audit finished** as an event (Global / Local). That is a listen. It is not a substitute for the handle on this canvas. |

### Right now we are not building it that way

- **Live walk** (`workflowWalk`): Trigger → … → Action. Action is enroll / call_agent. It does not send work to Audit. It does not hand the next node Audit’s run. Context is trigger payload + contact ids — not “what this node’s module just wrote.”
- **Hub editor** already passes `lastOutput` along the edge into `lastInput`. That is the **smell** of the handle. It is a preview. It does not call the Audit module. Do not treat it as the live path.

If the live walk cannot see the module’s output after the node, Automations does not work.

---

## Same shape. Different seat.

**Canonical (this is Automations):** something already happened **inside a firm that exists** — eligibility changed, a writeback, a form came back — **hear that** → run the operation → **then the agent**. A firm was created is the same pattern: the firm is already there; now do the inside (audit, agents).

**The first idea:** **this form** was submitted → **create the firm**. Same listen → do. Opposite seat. You are not hearing a world that exists. You are making it. That is a cascade. That is why it suddenly felt like fixture.

If adding “eligibility changed → operation → agent” is also fixture, the module is not built. If only **creating** the firm is fixture, that is expected — do not start there.

---

## Your provision example, in these primitives

1. Make a **form** (the four things).  
2. Listen: **this form** was submitted (Local).  
3. Do: **provision a firm**.  

That is Automations. That is why the module exists. If that path is hard, we did not stand the primitives up as a list you can pick from. The list is this file.

---

## How to use this when a new idea shows up

- If it is a **when** → it must be an event on the table, or schedule / manual / webhook.  
- If it is a **do** → it must be Agents (assign / from template) or an in-app action on the table.  
- If it is **after a node** → the next step uses **every write that run made**. Do not specify a field catalog.  
- If it is neither → the shape does not support it. Don’t “consider it” as a maybe. Say no, or name a new primitive on purpose.

Face: [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md). Visual: A7 (two kinds of action) · A14 (assign / template) · A18 (Global / Local) · A12 (form) · A17 (firm provisioned as an **event**). Provision as an **action** is this stamp.
