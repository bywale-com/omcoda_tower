# Contract: Events, actions, and the write-set handle

Canonical product primitives from `docs/register/PRIMITIVES.md` and Automations/Agents face law. Unsupported “when/do” MUST be refused or named as a new primitive on purpose.

## Listen (triggers)

| Kind | Grain |
|------|--------|
| In-app event | Global (all of that kind) or Local (this instance) when an axis exists |
| Schedule | Time; not an in-app event |
| Manual | Operator pressed; not an in-app event |
| Webhook | Outside told us; way **in**, never an action |

### In-app events named so far

| Event | Global | Local |
|-------|--------|-------|
| Form submitted | All forms | This form |
| Campaign failed | All failures | This campaign |
| Opted out / unsubscribed | All | — |
| Firm created / provisioned | All new firms | — |
| Audit finished | All audits | Usually none (one-time) |
| Contact file imported | All imports | This batch / firm — later if needed |
| Objective met | Completions of that kind | This objective / campaign |

Local matching requires an instance axis on the completion/write row (packet 022). Historical “any meeting ever” MUST NOT satisfy “this campaign’s meeting.”

## Do (actions)

**Agents:** assign existing sequence OR create from template. Do not author a new agent here.

**In-app (named):** ascribe a tag; run an audit; make a form (questions = required data listing); who-this-applies-to is audience, not mission-now. Provision-as-action is directionally in primitives; canonical listen is “firm was created.”

Not actions: If/Switch (forks); webhook; “write whatever.”

## Handle after a node

When a node completes, the next node’s input is **every write that run made**. Pick a write (or a field of a write). Person-row writes split people; run-row writes are artifacts.

Two doors MUST NOT collapse:

1. Same canvas: Event → Action → If on that handle.
2. Different automation: hear “audit finished” as a trigger.

## Rule output

Deterministic classes including required-data **listing**. GUI (field · operator · constant) and named-code outcomes that still toggle. After the rule, If/Switch calls from previous result — that is not the same grain as conditions inside the rule.

## Engine 2 vs attempt engine

Do not interchange:

- Engine 2: which motion (reactivation vs nudge); one client, one motion.
- 7b: channel ownership inside the chosen sequence.
