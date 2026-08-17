# Systems — Automations: output after the node

**Seat:** Product Manager, for the Systems Analyst.  
**When:** 2026-08-17 00:40 UTC.  
**What this is:** the one question the last SA chat circled for hours. That chat is deprecated. Do not circle it again.  
**Law:** Agents flagship **15:43** untouched. Product: [`PRIMITIVES.md`](./PRIMITIVES.md) · Automations face **law 33**.  
**Does not:** mint tables; plant the workbench; treat Hub editor preview as the live path; put triggers on the Agents canvas; overwrite 15:43.

---

## The question (founder)

When you run an Audit **action**, it transmits who we are auditing **to the Audit module**. Audit does its thing (same wiring as Book readiness). When that node is **done**, we should have access to everything it produced — every write, every result from that completion — **as if it had been done in the module.** Naturally. After the node.

Are we building that?

**Answer:** That is the requirement. **We are not building it that way yet.**

---

## What “working” is (two layers)

Do not argue pipe vs this-then-that. Both are implementations. The product is this:

1. **The writes live in the module.** Audit action calls the real Audit. Same `audit_runs` / per-person results you would see if the operator had pressed Run audit on that desk. Not an automation-only shadow JSON unless that JSON is only a pointer.
2. **The next node has a handle to those writes.** Not “done.” Not “latest audit for this firm.” **This node’s run.** Person vs artifact is picking which **field** of that handle (already in primitives).

A wire that looks like an n8n pipe makes the handle visible. A then-this list that reads **this node’s output id** is the same product. If the next step has to guess, it is not this node.

“Everything it produces” = what **that run** produced (artifact + each person’s result + writes that exist because that completion happened). Not the entire database.

---

## Mechanism (founder 00:40): how the If sees it

The Audit node’s **output is the previous result** on the next edge. The If reads fields of **that**. It does not look up “an audit.”

Hub smell (preview only): `lastOutput` → `lastInput` along the edge. If the payload has `items[]`, the If splits people true/false (`splitInputByIfConditions`). A run-level field evaluates once.

Live: `workflowWalk` does not call Audit. `createAuditRun` writes `audit_runs` + per-contact `reachability_verdicts` / `sequence_ready` / `contact_records` and returns `{ id, summary, verdicts }` — **nothing in Automations consumes that as the next node’s input.**

Grain is not a separate mode. Point the If at a **person field** → splits people. Point it at a **run field** → the artifact.

## Audit output inventory (what the module actually produces)

Ascribe against this list. Do not invent If fields that are not here.

**Run (artifact)** — Book readiness Audits list + gate checks + `audit_runs`:

id · status (running / complete; wire also failed) · overall pass/fail/pending · meta (Clear / N open) · sequence-ready glance for the run · enabled checks · each batch check pass/fail (`email_valid` · `phone_valid` · `dedupe` · `typo_garbage` · `name_present`) · import ids · summary counts (contacts, ready) · started/finished.

**Person (Records rows)** — desk overlays + wire verdicts:

contact id, name, email, phone · email/phone valid on the row · reachability (desk: both/partial/none · wire: reachable/partial/unreachable) · `sequence_ready` for that person · `details.auditRunId` back to this run.

**Silent in this module today** (on `rule.reachability_checks`, not written by Audit desk / `createAuditRun`): consent/silenced verdict; “≥1 channel matching intended sequence” as its own stored result. Do not treat those as previous-result fields.

**Not the previous result:** trigger `audit.completed` / `audit.failed` — other door.

Honesty: desk **gate steps are batch** (the check is on the set). Records table is **per person**. Wire persist is thinner per person (has email / has phone → verdict). Do not pretend those three are the same row.

---

## Two doors. Do not collapse them.

| Door | Needs |
|------|--------|
| **Same canvas:** import / who this applies to → Audit action → If → tag | The **handle** after the Audit node |
| **Another automation:** hear **audit finished** (Global / Local) | An **event**. Not a substitute for the handle on this canvas |

Completion can also be an event (Automations face law 28). That does not replace the pipe/handle on the chain you just ran.

---

## What is stood up today (so you do not re-discover it)

Quote these. Do not re-litigate them as product.

| Surface | What it actually does |
|---------|------------------------|
| `server/wire-service/workflowWalk.ts` | v1 linear walk: Trigger → Constants → Conditions → Rules → Action → Exit. **Does not** walk free-form graphs. Action that is not `enroll_sequence` / `call_agent` resolves to **no in-app effect**. `WalkContext` is `triggerPayload` + `contactIds`. **Does not** call Audit. **Does not** pass “what this node’s module wrote” to the next node. |
| Hub `AutomationWorkflowEditor` | Edges copy `lastOutput` → downstream `lastInput`. **Smell of the handle.** Preview / mock. Does **not** call `AuditContext.runAudit` / wire `audit_runs`. |
| Audit as a desk | `audit_runs` exists. Book readiness run is real-ish on that desk. **Not** wired as an Automations action whose completion is the next node’s input. |
| SQL `action` | `CHECK (type = 'call_agent')` — enroll only. |

Gaps you already named (ascribe A7, walker v2): in-app actions, free-form walk. **This packet is the missing product constraint on those gaps:** when those actions exist, their completion must expose the module’s output as a handle. Do not ship then-this that only means “order.”

---

## What you are asked to do

Ascribe. Short.

1. For **Audit as an Automations action**: what already houses “send who we’re auditing to Audit”? What would have to change so the **next** node can bind person vs artifact **of that run**? Quote tables / walker / ports. Do not mint from this sentence.
2. Same two-line ascribe for **ascribe a tag** and **assign agent** after that handle (they consume it; they do not invent a second copy of the people).
3. Say whether the handle is: node output id the next step reads, payload on the edge, or both — **only if** the live walk can see the module’s writes. Do not spend the chat on the metaphor.
4. Stamp [`SYSTEMS-ANALYST-LOG.md`](./SYSTEMS-ANALYST-LOG.md). Do not overwrite 15:43. Do not plant UI.

**Stop when:** you can say, for the teaching walk (contacts in → Audit → If this contact failed → tag), whether the machine can hand the If **that run’s** per-person results, or what is silent.

---

## Do not

- Circle “then-this is enough because results sit as writes.” Writes without a handle to **this** run is a guess.
- Invent a packet-on-the-wire that **replaces** Audit’s records. The module owns the records. The graph owns the handle.
- Treat Hub preview as live.
- Start at provision-as-action.
- Guess per-contact after Audit (person vs artifact is already law).
- Mint tables from the teaching walk picture.
