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
| **Something happened in the app** | An event. You can say **all of that kind** (Global) or **this specific one** (Local). |
| **Not an in-app event** | **Schedule** (time). **Manual** (you pressed it). **Webhook** (the outside told us). |

Local example you just named: not “any form.” **This form we just created** was submitted.

Some events have no Local (an audit is one-time). That is still an event.

---

## Events we can hear (shape so far)

These are the in-app events. If a new “when X happens” is not this list, the shape does not support it yet — and maybe it shouldn’t.

| Event | Global | Local |
|-------|--------|-------|
| **A form was submitted** | All forms | **This form** |
| **A campaign failed** | All campaign failures | **This campaign** |
| **Someone opted out / unsubscribed** | All of those | — |
| **A firm was created / provisioned** | All new firms | — |
| **An audit finished** | All audits | (probably none — one-time) |
| **A contact file was imported** | All contact-file imports | This batch / this firm — later if we need it |
| **An objective was met** | Completions of that kind | **This** objective / campaign |

That is the list from the face we have already named. Not “any row changed.”

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

---

## After an action: say what the next step is about

It does **not** automatically know “per contact.”

An audit leaves **two** things:

- the **artifact** — the run that sits in Book readiness
- a **result on each person** — pass / fail next to that contact

The next step (the If, or the action after it) has to say which one it is about.

| This step is about | Example |
|--------------------|---------|
| **This person** | If this contact failed → tag them in Contacts |
| **This artifact** | Do something to that audit run in Book readiness |

Same idea as Global / Local on a trigger: you pick the grain. You do not guess.

This is not a UI-first question. If we say it in these words, the system already has two things to point at. The UI is how you pick. The pick is the product.

**How you pick:** you do not first turn on a “per contact” mode. You point the If at a **field of the previous result**. A person field (this contact’s verdict) splits the people. A run field (this audit’s email-valid check failed) is the artifact. The field **is** the grain.

### Mechanism: the previous result is the wire

The Audit **action** sends who we are auditing to the Audit module. Audit runs. When that node completes, its **output is the previous result** on the next edge. The If does not go find an audit. It reads **that**.

Hub already has the smell: the edge copies `lastOutput` into the next node’s `lastInput`. If the payload has a **list of people**, the If can run once per person and fork true / false. If you point at a **run** field, it evaluates once. Live walk does **not** do this for Audit (Audit is not an Automations action there). Preview is not the live path.

### What Audit actually produces (the previous result)

This is the list. Not a wish list. What you would see if you opened Book readiness after **this** run.

**On the run (the artifact)**

| Output | What it is |
|--------|------------|
| Run id | This audit, in the Audits list |
| Status | running / complete (wire also has failed) |
| Overall | pass / fail / pending — from the checks |
| Meta | Clear, or N open |
| Sequence-ready glance | yes / blocked / pending **for the run** |
| Which checks were on | the toggles |
| Each check, pass or fail **for the batch** | Email valid · Phone valid · Dedupe · Typo / garbage · Name present |
| Which imports this run was about | |
| Counts | how many people, how many ready (what the wire writes on `audit_runs.summary`) |
| Started / finished | |

**On each person (the rows in Records)**

| Output | What it is |
|--------|------------|
| Who | contact id, name, email, phone |
| Email valid / phone valid | painted on the row |
| Reachability | both / partial / none on the desk · reachable / partial / unreachable on the wire |
| Sequence-ready | yes / no **for that person** |
| This run | pointer back to the artifact (`auditRunId`) |

**Not an output of this module today** (named on the reachability rule table, not written by the Audit desk / wire): consent / silenced as a verdict; “≥1 channel matching the intended sequence” as its own stored result. Do not condition the If on those as if Audit had produced them.

**Also not the previous result:** hearing `audit.completed` as a **trigger**. That is the other door.

The If after Audit can only see this list. If a field is not here, the shape does not support that condition yet.

---

## Shape: when a node finishes, you have what the module produced

This is the whole question. Automations only works if this is true.

An action is not a fake step. It **sends the work to the real module** (Audit, Contacts, Agents — whatever that action is). That module does its job, same as if you had pressed it on that desk.

When that node **completes**, the next step has **everything that module produced** — every write, every result — **as if you had done it in the module.** Naturally. Not a special automation-only copy. Not a guess.

Example: Audit action.

1. The node hands Audit **who we are auditing**.
2. Audit runs. Book readiness gets the artifact. People get pass/fail.
3. After the node, you can use **that** — the artifact, and each person’s result — because that is what Audit produced.

### Two layers. That is the whole shape.

| Layer | What it is |
|-------|------------|
| **The writes** | Live in the module. Audit owns the run and the per-person results. Same records you would open on that desk. Not a shadow copy Automations invented. |
| **The handle** | After this node, the next step is pointing at **those** writes — the run this node just made — not “go find some audit.” Person vs artifact is picking **which part** of that handle. |

A wire that looks like an n8n **pipe** is one way to see the handle. A then-this list where the next node reads **this node’s output id** is the same product. **Pipe vs this-then-that is not the question.** The question is: when the node completes, do we have the module’s output. If the next step has to guess (latest audit for this firm), it is not this node.

“Everything it produces” means **what that run produced** — the artifact, each person’s result, the writes that exist because that completion happened. It does not mean the entire database. The If after Audit is calling from **that**.

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
- If it is **after a node** → the next step must be able to use what that module produced (the handle). Pipe vs then-this is not a new primitive.  
- If it is neither → the shape does not support it. Don’t “consider it” as a maybe. Say no, or name a new primitive on purpose.

Face: [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md). Visual: A7 (two kinds of action) · A14 (assign / template) · A18 (Global / Local) · A12 (form) · A17 (firm provisioned as an **event**). Provision as an **action** is this stamp.
