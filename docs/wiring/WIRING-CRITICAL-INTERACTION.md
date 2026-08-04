# Wiring — what a critical interaction is (definition)

**What this is.** The definition of a **critical interaction** — the user-originated counterpart to a
node. Where [`NODE-DEFINITION.md`](./NODE-DEFINITION.md) defines the smallest unit of *state* the wiring graph tracks, this
defines which *interactions* actually count as origins on that graph. Getting this right is what lets
us map interactions the same way we mapped nodes: **connect what matters, ignore what doesn't, and
never try to enumerate every interaction the app has.**

**Companion:** densify How / implementation Clarity first ([`../sme/implementation/CLICKPATH-DENSIFICATION.md`](../sme/implementation/CLICKPATH-DENSIFICATION.md)); criticality is read off the relationship graph afterward, not judged during densify.

---

## 1. The rule

> **A critical interaction is any add / remove / change to state that another node, path, or system
> depends on.**

Two parts, and both are load-bearing:
- **The verb** — add / remove / change / modify. (Reading alone is not it; mutation is.)
- **The object** — *depended-on state*. The mutation only qualifies if what it changed is state that
  something *else* reads: it writes to a node, fires an event, or moves a state machine another path
  consumes.

If the add/change/remove touches only **view state** — selection, sort order, expand/collapse,
filter, pagination, unsaved input, hover — that nothing downstream reads, it is **cosmetic** and does
**not** qualify.

**This is the same object as a node.** A critical interaction is an add/change/remove that **lands on
a node.** Verb from this rule, object from the node rule — the two definitions are the two ends of the
same edge. That is not a coincidence; it is what makes the coverage check possible (§5).

---

## 2. The verb is not enough — the object decides (the sorting proof)

The trap is to rule on the verb alone. "Sorting is a change, so it's critical." Wrong — because the
verb passes but the object may not. **Sorting is the canonical proof that the object decides**, because
the *same gesture* lands on both sides of the line depending only on what it writes.

**Sorting that is cosmetic (does NOT qualify):**
> An operator sorts the firm list by CRS *to look at it*. The order changes on screen. Nothing is
> written. Refresh the page and the order is gone.
Only **view state** changed. Nothing downstream reads it. → **not a critical interaction.**

**Sorting that is critical (DOES qualify):**
> An operator drags to reorder a **priority queue** of firms, and that order *is* the dispatch order
> the sending engine pulls from. The sort writes `queue_position` to the backend; the runtime reads
> `queue_position` to decide who gets contacted first. Refresh the page and the order holds.
The sort wrote **depended-on state** (`queue_position`, consumed by the runtime). → **critical
interaction.**

**Same gesture. Opposite verdict.** What flipped it was not the sorting — it was whether the order
*became a node something downstream reads*. This is the whole definition in one example: the
interaction is never inherently critical or cosmetic; **the dependency is what decides.**

---

## 3. Two tests (use either)

**Dependency test (exact, this is the real one).**
Does any *other* node, path, or system read what you just changed?
- Yes → critical.
- No → cosmetic.
(This is identical to "is what I changed a node.")

**Persistence test (fast proxy, ~90%).**
If you refreshed the page right after the interaction, would the change survive?
- Survives (booked meeting, published version, `queue_position`) → almost always critical.
- Evaporates (sort-to-look, selected row, open tab, typed-but-unsubmitted) → almost always cosmetic.

Use persistence for a quick read; fall back to dependency when persistence is ambiguous (§4).

---

## 4. The edges that catch people

- **Row selection / `selectedId`** (e.g. the ActivationState master-detail): you *changed* selection
  state — a real change. But nothing downstream reads it; it only decides which detail the panel
  paints. → **cosmetic.**
- **Unsaved form input:** typing adds characters every keystroke (mutation) and doesn't survive
  refresh (looks cosmetic) — and the keystrokes *are* cosmetic. The **submit/save** is the critical
  interaction, because submit is the add/change that writes depended-on state. Editing a draft is
  cosmetic until the save. So the rule lands correctly: typing isn't critical, *committing* is.
- **Filter / search / paginate:** change view state, read nothing downstream. → cosmetic.
- **Sort:** cosmetic *unless* the order is persisted and read downstream (§2).

The pattern across all of them: **presentation mutations are cosmetic; commits to depended-on state
are critical.** When in doubt, run the dependency test, not the verb.

---

## 5. Why this exists — the coverage check

The two primitives now match, both ends of the wiring graph:
- **Node** = smallest depended-on unit of state (the tightest ring an event touches).
- **Critical interaction** = an add/change/remove that lands on a node.

That symmetry is the point. It gives a coverage test the wiring pass never had, stated as two
questions:
- Every **critical interaction** should terminate in a **node**.
- Every **node that gets written** should have a **critical interaction** (or a non-UI system event)
  feeding it.

A mismatch either way is a **hole**: a node written by nothing means a missing origin; a critical
interaction landing nowhere means a missing node. Cosmetic interactions are correctly excluded from
this check — they touch no node, so they owe the graph nothing.

---

## 6. And critical origins with no interaction at all

Same caveat as the node graph being bigger than the click-path: some critical origins have **no user
interaction** — a webhook lands, a scheduled re-score fires, a reference table publishes. These aren't
*interactions*, but they *do* originate/mutate nodes, so they belong in the same manifest. The full
set is **critical origins**, of which critical interactions are the UI-originated subset and system
events are the rest. Map both; the coverage check in §5 covers a node fed by either.

---

## 7. The rule, in one line

> **A critical interaction is an add / remove / change that lands on a node — that writes state
> something else depends on. If it only rearranges the view (sort-to-look, select, expand, filter,
> type-without-submit), it's cosmetic. The dependency decides, never the gesture.**
