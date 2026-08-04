# Wiring — how we build it (method notes)

## Preface

These notes come at a specific moment. We had already run the Register all the way down for Tower — Seed, World, personas, outcomes, How-trees, and both SME passes (the practice/compliance axis via the Engagement Manager, and the capability axis via the CTO). Implementations existed. What we did not yet have was the Wiring: the backend layer with no face. When we sat down to build it, we hit a wall — we assumed we'd gather everything that must exist, organize it, then draw the canvas. That order broke, because organizing-first forces you to declare what a "flow" and a "trigger" are, and trigger-ness turned out to be relational, not intrinsic: the same node triggers in one path and is an interim step in another. This doc is the inversion we arrived at — trace each implementation one at a time, the same way we build UI, and let the structure fall out of the graph rather than imposing it up front. It also carries the deeper thing that surfaced along the way: that anchoring wiring to events rather than UI arrangement is what finally lets the technical layer run without design breaking the click-path underneath it.

---

**What this is.** The method for producing Tower's Wiring: the CTO/technical layer that has no face.
It is the backend twin of how we build UI — we do not design the whole system top-down, we **trace
each implementation one at a time** and let the structure assemble itself. This doc is the formula;
the companion [`NODE-DEFINITION.md`](./NODE-DEFINITION.md) defines what a node is (referenced throughout);
[`WIRING-CRITICAL-INTERACTION.md`](./WIRING-CRITICAL-INTERACTION.md) defines which interactions count as origins that land on those nodes.

**Governing stance:** *connect first, classify later.* We never decide what a "flow," a "trigger," or
a "category" is before the graph exists. Those are labels you read *off* a finished graph, never
inputs to building it.

---

## 1. The failure node (why we don't organize first)

The instinct is: "look at everything that must exist, categorize it, then draw the canvas." That path
fails, and here is exactly where:

Organizing-first forces you to declare what a **flow** is, which forces you to declare what a
**trigger** is. But **trigger-ness is not a property of a node — it is a property of a node's role in
a particular path.** The same step is an interim step in one implementation and the trigger in
another. Any scheme that asks "is this a trigger?" globally breaks, because the honest answer is
"depends which path you're looking at." You cannot pre-classify something whose identity is
relational. So we invert: **trace, don't classify.**

---

## 2. The unit of work: the traced implementation

We go **one implementation at a time** — the same discipline as building a UI click-path, moved to
the backend. The unit is the *traced implementation*, not "the designed system."

For each implementation, walk it with one simple, repeating rule (the exact mirror of "where are we
starting from?" in UI):

1. **Where do we start from?** Is the first thing this implementation touches an **existing** node (a
   table/system already on the canvas) or a **new** one we must create? (Node = see [`NODE-DEFINITION.md`](./NODE-DEFINITION.md).)
2. **What's the next thing — for this specific use case?** Given this implementation, what does that
   first node's event touch next? Existing node or new node? Determine it.
3. **Connect them in event language:** *when X happens in system A, this happens in system B.* The
   edge is the event and its ripple, stated in plain language — not code, not the operating language.
4. **Hang the non-structural constraints on the edge:** *…within X ms · idempotent · encrypted ·
   under this jurisdiction.* These are the things the topology can't express (see §6).
5. **Next hop.** Repeat until the implementation's ripple is fully traced.

One implementation becomes one traced path of event-connected nodes. Nothing more is required of it.

---

## 3. Shared nodes accrete by fusion (structure emerges)

Because step 1/2 always asks **"does this already exist?"** first, shared infrastructure assembles
itself:

- Implementation 1 traces through and *creates* the suppression node.
- Implementation 7 traces through, asks "existing or new?", finds the suppression node **already on
  the canvas**, and connects to it.

You never sit down and design "the systems list." The shared nodes **fuse** as a byproduct of tracing
each implementation against what's already there. The canvas is the **union of all traced walks**,
with shared nodes merging where two walks hit the same state.

This is the same discipline as the UI surface catalog: existing / new resolved *per node*, shared
nodes accreting naturally. Same pattern, backend side.

---

## 4. Classification is downstream (defer the naming)

"Flow A / B / C," "category," "trigger," "the event registry" are all **interpretations of the
graph** — and you cannot interpret a graph you haven't drawn.

- **Trigger** = read off the graph after the fact ("these three edges all fan out from this one
  event; that event is the trigger *here*"). It's a per-path reading, never a global label.
- **Flow / category** = a slice or grouping you name once the topology is visible, if you even still
  need it.
- **Event identity / registry** = extractable from the drawn edges later if you want stable ids; not
  a precondition. The events *are* the edges you draw while tracing.

So classification becomes a **downstream read**, not a gate. You defer every naming decision until the
thing that would be named actually exists on the canvas.

---

## 5. The one thing you keep as you trace: the canonical node list

The single lightweight artifact that must stand *during* tracing is the **canonical node list** — the
tables/systems registry — because it is the **fusion key**. For shared infrastructure to accrete, two
implementations touching "the suppression list" must land on the *same node*, not two nodes both named
suppression. The registry is the canonical-name resolver so tracing implementation 7 fuses onto
implementation 1's node.

It is **written-as-discovered**, not designed up front: each trace adds any genuinely new node so the
next trace can fuse against it. (Same role the surface vocab plays as the addressing key for the UI
click-through.)

---

## 6. What the graph carries: structural vs non-structural constraints

The graph is a **complete delegation spec with no code**, because it carries constraints two ways:

- **Structural constraints are embedded in the topology, for free.** When the CTO decides "event A
  triggers B, not C" (because B is cheaper/safer — reasoned through the Think Stack), the *topology
  itself carries the constraint*. The specialist building B doesn't need the reasoning: "A→B exists
  and A→C doesn't" already excludes the alternative. The Think Stack is the reasoning that produces
  the topology; the topology is the compressed constraint.
- **Non-structural constraints are explicit, hung on nodes/edges.** "Under 200ms," "idempotent,"
  "encrypted at rest," "per-jurisdiction cap" don't show up as edges — they're annotations. This is
  the **Enrichment / Can'ts** layer: precisely the constraints the topology can't express.

Together: topology carries structure implicitly; Can'ts carry the rest explicitly. That's enough to
delegate to the builders — no code, ever, at this layer.

---

## 7. Why this ordering matters (design-invariance)

The deep payoff. The click-path is a spine that runs all the way down — UI arrangement →
implementation → wiring. Design's job is to consolidate and re-fit to a system, which **mutates
arrangement**. If wiring were anchored to UI arrangement, design would desync it every time, and no
ordering (CTO before or after design) would save you.

Tracing in **event/state language** breaks that dependency: the wiring anchors to *what the event acts
on* (a stable state identity), not *where the button lives* (arrangement). "Consultant authorizes the
book" is a stable event identity; whether that button sits on Board or a redesigned panel is
arrangement. Design may move arrangement freely; it must never rename the event.

Consequence: **the entire CTO/Wiring column can run before design**, safely, because the graph is
design-invariant. Design rearranges presentation; the event topology doesn't care.

---

## 8. The method in one line

> Trace each implementation one at a time: start from an existing-or-new node, hop to the next
> existing-or-new node in event language ("when X in A, then Y in B"), annotate non-structural
> constraints on the edge, fuse onto shared nodes via the canonical node list. The canvas is the
> union. Flow, trigger, and category are read off the finished graph — never declared before it.
