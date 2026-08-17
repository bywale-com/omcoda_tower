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

An audit leaves **two** things because the **system** writes two grains — not because we specified a picker:

- the **artifact** — the run (`audit_runs`)
- a **result on each person** — verdict + sequence-ready

The next step (the If, or the action after it) has to say which one it is about. That pick is which of those writes you are pointing at.

| This step is about | Example |
|--------------------|---------|
| **This person** | If this contact is unreachable → tag them |
| **This artifact** | If this run failed → do something to that run |

Same idea as Global / Local on a trigger. You do not guess.

This is not a UI-first question. If we describe exactly what we’re saying, the system already has two things to point at.

**How you pick:** you point the If at a **field of the previous result**. A person field (this contact’s verdict) splits the people. A run field (this audit’s status) is the artifact. The field **is** the grain.

### Mechanism: the previous result is the wire

The Audit **action** sends who we are auditing to the Audit module. Audit runs. When that node completes, its **output is those writes** — the previous result on the next edge. The If does not go find an audit. It reads **that**.

We do **not** specify a field catalog for the pipe. The pipe’s shape **is** the module’s primitive. If we listed checks we wanted to condition on, that would be retrofitting.

Hub smell: the edge copies `lastOutput` into `lastInput`. Live walk does **not** do this for Audit. Preview is not the live path.

### What Audit produces (the primitive)

Story §5: Audit answers only — **can we reach this contact, and can we start a sequence on them?**

**Out (this is the pipe):**

| Grain | What the system writes |
|-------|-------------------------|
| **The run** | `audit_runs` — this batch. Status running / complete / failed. Summary counts. Imports this run was about. Started / finished. |
| **Each person** | `reachability_verdicts` — **reachable / partial / unreachable** |
| **Each person** | `sequence_ready` — yes or no. Precondition for enrollment. |

That is the output. Three writes. Two grains (run vs person). The If after Audit sees **that**.

**In (not the output):** the checks that *make* the verdict — email valid, phone valid, channel match, typo/garbage, dedupe, already-in-Tower, consent/silenced, name present. Those are `rule.reachability_checks`. They run **inside** Audit. They are not what the action emits. Do not put them on the pipe as if we specified fields.

**Must not emit:** pathway / CRS / sales PASS-FAIL. That is not Audit.

**Also not the previous result:** hearing `audit.completed` as a **trigger**. That is the other door.

Live wire today is the same three writes, thinner inside: it derives verdict from has-email / has-phone. The desk’s gate-step animation is not a stored output. The primitive is still run + verdict + sequence-ready.

The If can only see this primitive. If a condition needs a check that was collapsed into the verdict, that check is not an output yet — it is still interior.

---

## Shape: when a node finishes, you have what the module produced

This is the whole question. Automations only works if this is true.

An action is not a fake step. It **sends the work to the real module** (Audit, Contacts, Agents — whatever that action is). That module does its job, same as if you had pressed it on that desk.

When that node **completes**, the next step has **everything that module produced** — every write, every result — **as if you had done it in the module.** Naturally. Not a special automation-only copy. Not a guess.

Example: Audit action.

1. The node hands Audit **who we are auditing**.
2. Audit runs. It writes the **run**, each person’s **verdict**, and **sequence-ready**.
3. After the node, you can use **those writes** — because that is what Audit produced. Not a field list we specified for the pipe.

### Two layers. That is the whole shape.

| Layer | What it is |
|-------|------------|
| **The writes** | Live in the module. Audit owns the run and the per-person results. Same records you would open on that desk. Not a shadow copy Automations invented. |
| **The handle** | After this node, the next step is pointing at **those** writes — the run this node just made — not “go find some audit.” Person vs artifact is picking **which part** of that handle. |

A wire that looks like an n8n **pipe** is one way to see the handle. A then-this list where the next node reads **this node’s output id** is the same product. **Pipe vs this-then-that is not the question.** The question is: when the node completes, do we have the module’s output. If the next step has to guess (latest audit for this firm), it is not this node.

“Everything it produces” means **those writes** — the run, each verdict, each sequence-ready. Not a catalog we invented. Not the entire database. The If after Audit is calling from **that**.

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
- If it is **after a node** → the next step uses what that **module already emits** (the primitive). Do not specify a field catalog for the pipe.  
- If it is neither → the shape does not support it. Don’t “consider it” as a maybe. Say no, or name a new primitive on purpose.

Face: [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md). Visual: A7 (two kinds of action) · A14 (assign / template) · A18 (Global / Local) · A12 (form) · A17 (firm provisioned as an **event**). Provision as an **action** is this stamp.
