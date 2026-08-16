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
- If it is neither → the shape does not support it. Don’t “consider it” as a maybe. Say no, or name a new primitive on purpose.

Face: [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md). Visual: A7 (two kinds of action) · A14 (assign / template) · A18 (Global / Local) · A12 (form) · A17 (firm provisioned as an **event**). Provision as an **action** is this stamp.
