# Doctrine — SME, CTO, and Implementation

**What this is.** Standing doctrine for how Om Coda runs the specialist (SME), technical (CTO), and
implementation layers of the Register method. It was *derived*, not invented — each principle below
came from a specific failure or discovery while building Tower (the SME pass skewing to compliance;
the capability pass; the CTO Think Stack reconciliation). Treat it as method, not product: it applies
to every Om Coda product, Tower being the first instance.

**How to use it.** Spine sections (§1–3) live here in full. Dense threads that grow on their own
were split so this file stays readable:

| Split | Full doc |
|---|---|
| §4 Agent-codeable vs human provisioning | [`AGENT-VS-HUMAN-PROVISIONING.md`](./AGENT-VS-HUMAN-PROVISIONING.md) |
| §5 Surface intent (initiation vs view) | [`SURFACE-INTENT.md`](./SURFACE-INTENT.md) |
| §6 Handoff routing (`pm` / `both` / `cto`) | [`HANDOFF-ROUTING.md`](./HANDOFF-ROUTING.md) |
| §7 CTO Think Stack | [`../wiring/CTO-THINK-STACK.md`](../wiring/CTO-THINK-STACK.md) |
| §8 Decision constitution (catch-all bottlenecks) | [`../method/DECISION-CONSTITUTION.md`](../method/DECISION-CONSTITUTION.md) |
| §9 Two-column synthesis | [`../method/TWO-COLUMN-SYNTHESIS.md`](../method/TWO-COLUMN-SYNTHESIS.md) |

**Vocabulary anchors:** Register passes = Seed → World → Personas & Function → SME → Enrichment →
Furnish → Wiring → CT Plant → Translation. "Face" = has a UI surface; "no face" = backend/Wiring.
Trim = the failure where a pass performs the ceremony and ships thin.

**Related:** [`METHODOLOGY.md`](./METHODOLOGY.md) (practice SME Engagement Manager) ·
[`capability/`](./capability/) (capability axis paper) · [`../wiring/`](../wiring/) (Wiring method + nodes).

---

## §1 — SME runs on two orthogonal axes, not one

**Principle.** Specialist selection has two independent cuts through the same product, and a single
question surfaces only one of them:
- **Practice / regime axis** — *who is responsible, regulated, or liable*, and how the practice is
  done lawfully. Routed by the **Engagement Manager**.
- **Capability axis** — *who knows how to actually make the thing work*. Routed by the **CTO** acting
  as the technical Engagement Manager.

Both routers *identify who does the work*; neither does the work. They are the same role pointed at
two different kinds of knowledge.

**Origin.** Tower's first SME pass came back overwhelmingly compliance-weighted. The post-mortem
found the prompt never said "compliance only" — the word "practice" in the methodology's species
list was populated almost entirely with *regimes* (CASL, licensure, Meta policy, escrow law, IRCC
currency), so "whose knowledge is required?" was silently scoped to regulatory knowledge. Capability
(deliverability, agent runtime, enrichment, telemetry) had no axis to appear on and got classified
out as "CTO." It wasn't lost — it was filed where nobody would look. Capability only surfaced when a
*second lattice* was run explicitly.

**Mechanics.** The Engagement Manager and the CTO each run their own selection pass over the same
inputs (personas, outcomes, How-leaves — especially leaves tagged `new` / `wrong-seat`). Run them as
two passes, not one, because one question cannot hold both readings. Proof: same product, same
inputs, and the capability axis surfaced six modules the practice axis structurally could not see.

**Cross-links.** §2 · [`../wiring/CTO-THINK-STACK.md`](../wiring/CTO-THINK-STACK.md) · §9.

---

## §2 — "CTO handles it" is not a valid terminal classification

**Principle.** A catch-all technical bucket is a **sink**: it silently swallows genuine specialist
capability under the label "just wiring." Every "the CTO handles it" must split into:
- **Generic wiring** — ordinary integration a proficient generalist owns. Truly CTO.
- **Specialist accomplishment** — a capability seat that must surface as its *own* consideration
  before it disappears.

Filing something as "CTO handles it" *feels* like a decision but is usually a deferral. The sink must
have a filter on it.

**Origin.** Deliverability sat in this sink for the entire first pass. It is not "wire up Resend" —
it is domain authentication, per-firm DKIM alignment, reputation, warmup economics, suppression: a
genuine specialty. The monolithic CTO bucket absorbed it as implementation detail, so it never became
a consideration.

**Mechanics.** When triaging a technical need, ask the follow-up the sink suppresses: *would a
proficient generalist CTO own the depth here, or does this need a named specialist?* If the latter,
it is a capability seat (§1), not wiring. Applied to sending infrastructure, the split is exactly §4:
agent-codeable integration vs human-provisioning residue.

**Cross-links.** §1 · §4 · [`../method/DECISION-CONSTITUTION.md`](../method/DECISION-CONSTITUTION.md).

---

## §3 — Capability *adds*; compliance *modifies*

**Principle.** The two SME axes produce structurally different outputs:
- **Compliance considerations mostly modify** — copy, gates, flags, silence clocks. They change how
  an existing surface behaves.
- **Capability considerations mostly add** — new modules, pipelines, syncs, state machines. "We will
  need this to work" reveals product that isn't in the register yet.

**Corollary (load-bearing).** Because capability output is additive, and Om Coda's build rarely
*removes* anything (design consolidation happens late and only tightens), **the technical/Wiring work
can run early without breaking later passes.** There is nothing to un-consolidate. This is why Wiring
does not have to wait at the end of the pass order.

**Origin.** The capability pass for Tower produced ~six new operator homes (Sending infrastructure,
Conversations/reply-triage, reference-data ingestion, forward-deploy generator, escrow ledger,
event/metrics pipeline) plus a suppression model — every item tagged `Revealed: new`, nothing
removed. The compliance pass, by contrast, mostly added gates and copy to surfaces that existed.

**Mechanics.** Expect a capability pass to expand the surface/module inventory; fold the additions
into personas/outcomes/how the same way the customer-support miss was folded. Treat additive Wiring
as schedulable early (see §9 reordering).

**Cross-links.** [`../wiring/CTO-THINK-STACK.md`](../wiring/CTO-THINK-STACK.md) · §9.

---

## §4 — Agent-codeable vs human provisioning → *split*

**Stub.** Every technical handoff splits into agent-codeable work vs human-provisioning residue
(the true per-firm onboarding cost). Never blur residue into "CTO handles it."

**Full doc:** [`AGENT-VS-HUMAN-PROVISIONING.md`](./AGENT-VS-HUMAN-PROVISIONING.md)

---

## §5 — Surface intent → *split*

**Stub.** Initiation vs view (vs `none`) is a first-class functional-design axis.

**Full doc:** [`SURFACE-INTENT.md`](./SURFACE-INTENT.md)

---

## §6 — Handoff routing → *split*

**Stub.** `Handoff: pm | both | cto` is the crossing token between PM (face) and CTO (no-face)
columns. Route on the tag; do not invent UI for every `cto` item.

**Full doc:** [`HANDOFF-ROUTING.md`](./HANDOFF-ROUTING.md)  
*(Absorb packets for Tower Pass2 stay in [`HANDOFF.md`](./HANDOFF.md).)*

---

## §7 — CTO Think Stack → *split*

**Stub.** Facet grid + Wiring Function → Can'ts → Furnish; fed by capability SME handoff. Tower
instance not yet run.

**Full doc:** [`../wiring/CTO-THINK-STACK.md`](../wiring/CTO-THINK-STACK.md)

---

## §8 — Decision constitution → *split*

**Stub.** Bottlenecks hide in catch-all buckets ("CTO handles it" ≡ "founder reviews it"). Name
classes; proceed autonomously except at named gates.

**Full doc:** [`../method/DECISION-CONSTITUTION.md`](../method/DECISION-CONSTITUTION.md)

---

## §9 — Two-column synthesis → *split*

**Stub.** SME handoff forks into practice (PM / face) and capability (CTO / Think Stack) columns;
they reconcile on Handoff, and capability-additive Wiring may run early / parallel.

**Full doc:** [`../method/TWO-COLUMN-SYNTHESIS.md`](../method/TWO-COLUMN-SYNTHESIS.md)
