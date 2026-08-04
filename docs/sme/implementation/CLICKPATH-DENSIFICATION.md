# Click-path densification — affordance-grain Clarity (How-analysis refinement)

**What this is.** A refinement to how the PM writes **Clarity** and **Components** in How-analysis
([`../../build-foundation/01-ui-first-and-how.md`](../../build-foundation/01-ui-first-and-how.md); enforced by [`../../build-foundation/cursor-rules/how-analysis.mdc`](../../build-foundation/cursor-rules/how-analysis.mdc),
the `C3 per node` step). It is not a new pass — it is a depth requirement on the click-path the PM
already writes. Fold it into the How-analysis authoring rule.

**Companions:** short Register densify law [`DENSIFY-LAW.md`](./DENSIFY-LAW.md) · criticality label afterward [`../../wiring/WIRING-CRITICAL-INTERACTION.md`](../../wiring/WIRING-CRITICAL-INTERACTION.md)

**One-line rule:**
> A leaf's Clarity must be stated **down to the affordance grain** — every control named, what state
> each touches, and **what downstream reads it** — not "I use module X."

---

## 1. The rule (grain, not module-naming)

When the PM writes a leaf's Clarity, naming the module is insufficient. It must go **inside** the
module and state, in order, the specific affordances the leaf exercises, and for each affordance that
writes state, **name the downstream surface/node that reads it.** The Components table lists each
affordance with `UI · Kind · Status · Affordance`.

**Insufficient (old grain):**
> *"On Configuration libraries, the operator publishes an evaluation pack."*

**Sufficient (affordance grain — the shape to mirror):**
> **Clarity:** Starting from Configuration libraries, click **Evaluation packs** in the Libraries nav.
> On Evaluation packs catalog, click a pack row (or **New pack**). On Evaluation pack editor, edit
> open-box rules / analysis against Reference data. Click **Publish version** (primary button).
> Catalog row shows **Published** + version id; that version becomes selectable in **Firm operations
> bind → Bind packs → Evaluation pack dropdown**. Drafts stay **Draft** and do **not** appear in Bind
> dropdowns.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Configuration libraries | Module | new | House-global; Libraries nav |
| Evaluation packs | Block / list | new | Catalog list + **New pack** |
| Evaluation pack editor | Modal | new | Rule/analysis editor |
| Publish version | Block | new | **Primary button** |
| Published / Draft status | Block | new | **View** chip on catalog row |

The load-bearing clause is the last sentence of the Clarity: *"…becomes selectable in Firm operations
bind → Bind packs dropdown; Drafts do not appear."* That names the **downstream reader**. Every
state-writing affordance must name its reader (or state that nothing reads it).

---

## 2. Why we densify: relationships first, not criticality

Densification is **not** about deciding which interactions are critical. It is about making the
**relationships between modules visible.** The Config→Bind link only exists on paper because the
Clarity states "Publish → read by Bind." Do this for every affordance and the relationship graph
**falls out of the prose** — module-to-module, affordance-to-reader.

Criticality is then a **downstream label**, read off that graph, never a judgment made during
densification: an affordance is critical if its target is read elsewhere (see
[`../../wiring/WIRING-CRITICAL-INTERACTION.md`](../../wiring/WIRING-CRITICAL-INTERACTION.md)). So we densify **both** critical and cosmetic affordances — the
cosmetic ones establish "touches nothing downstream," which is itself information. Same discipline as
nodes: **connect first, classify later.**

---

## 3. The containment principle (silence = out of scope)

The implementations are the record of **how committed outcomes get achieved.** Therefore:

> **If an interaction is never stated in service of any committed outcome, it is out of scope.**

There is **no separate step** to hunt down every undocumented interaction in the existing app. Forcing
the PM to state — to the affordance grain — how each committed outcome is achieved *defines* the
in-scope set. Whatever surfaces is in scope; whatever never surfaces is not undocumented-and-worrying,
it is **demonstrably unnecessary**. Silence in the implementations is the signal, not a gap.

**Guardrail (the one thing this rests on):** "silence = irrelevant" holds **only if the outcome
roster is complete.** If an outcome we actually care about was never written down, its interactions
are silent *and* important, and the containment leaks. Everything *below* the outcomes self-scopes;
the **outcome roster itself cannot** — which is why roster completeness is a **founder-only** decision
(see [`../../method/DECISION-CONSTITUTION.md`](../../method/DECISION-CONSTITUTION.md)). Trust the boundary only as far as you trust the roster.

---

## 4. Why grain is also requirement-gathering (the two-birds motion)

Forcing grain does a second thing beyond scoping: it makes the PM **consume more of each module it
already touches.** "I use Configuration libraries" names the module. Going to grain — New pack → edit
→ Publish version → read by Bind — **exercises** it, and every affordance named is a **requirement
handed to the CTO** for that module.

So one forcing function does both jobs at once:
- **Coverage** — silence = out of scope (§3).
- **Requirement depth** — grain = the per-module requirements the wiring pass was starving for.

Depth on the *outcome* side automatically enriches the *requirement* side. The PM going deeper into a
module **is** the PM specifying what that module must do. This is why densification must precede
wiring: it is the pass that feeds the CTO richer per-module requirements.

---

## 5. Layer skew (context, not a densification step)

Criticality is not uniform across layers — noted here only so the PM isn't surprised, **not** as
something to tag during densification:
- **Function (outcome-oriented) click-paths** → nearly all affordances write depended-on state → mostly critical.
- **Furnish** → job health, cost glances, DLQ read state → mostly view → mostly cosmetic.

We still densify Furnish surfaces (they establish "reads X, writes nothing"), but expect them to be
the low-criticality, view-heavy entries.

---

## 6. The forcing function, in one line

> Make the PM state every committed outcome down to the affordance grain — each control, the state it
> touches, and its downstream reader. That single act draws the scope boundary (stated = in, silent =
> irrelevant) and fills the per-module requirement depth (grain = requirements) in one pass. Relationships
> fall out; criticality is read off afterward.
