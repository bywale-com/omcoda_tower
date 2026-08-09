# BUILD INSTRUCTION — The Interactive System Map (corpus-complete, rule-bearing, fractal, simulable)

**To the PM.** You are given exactly two files: this instruction, and `SYSTEMS-REQUIREMENTS-FILLED.md`
(hereafter **the skeleton**). Everything you need is in these two. Build what this document specifies,
using the skeleton as the starting node set to deepen — not as the finished artifact. The skeleton is
correct in *shape* and *under-resolved* in *detail*; your job is to raise it to full corpus resolution
and make it interactive.

---

## 0. What this artifact is (and what it is NOT)

**Is:** a **System Map** — the machine of Tower represented as nodes (state-units) and edges (causation:
what changes what, what fires with no face), carrying **the actual rules** the corpus specifies for each
node, rendered on an interactive canvas where changing a rule changes the map's simulated behavior.

**Is NOT:**
- Not components. No control/pane/module/workspace language. This is the machine the faces will later
  extrude onto — it must exist *before* and *independent of* any face.
- Not connected to Tower or the prototype. It simulates its own mechanism; it touches no live app.
- Not tables/schema. Nodes are state-units and their rules, not columns.
- Not a summary of one document. It is the **fusion of every "must exist" in the entire corpus.**

**Why it exists / sequencing law:** this map is the artifact that must precede components. Components
were built before it; that is the error being corrected. A control changes a node *on this map*; a pane
displays a node *on this map*. If a node here has no face, that is fine — faceless machinery is still
machine. If a face exists with no node here, that face is an orphan. This map is the ground truth faces
bind to.

---

## 1. The resolution rule (the core correction — read twice)

**The map's detail ceiling is set by the CORPUS, not by the Story, and not by the skeleton.**

For every node, pull in **every rule, threshold, window, ordering, precedence, condition, and
constraint** that Seed, World, and every surrounding markdown already specify for it. Be **concrete
wherever the corpus is concrete.** Be **silent only where the corpus is silent** — and when silent,
name the silence (do not invent, do not flatten).

The skeleton under-resolved this. The clearest example — fix it and treat it as the standard for all
nodes:

- Skeleton's `active_attempt` (7b) says "criteria are met" and holds the timing rules at arm's length as
  "OPERATOR-REVISIONS." **Wrong resolution.** The corpus specifies the actual mechanism:
  - Text delivered, not opened in **30 min** → escalate to Email.
  - Email opened, link not clicked in **24 h** → next attempt.
  - Form started, not submitted in **24 h** → back to Text; re-entries **do not reset the clock**.
  - Attempts are **local retries under the failed owning channel** (fresh Text→Email→Form), **not** a
    top-level attempt spanning all channels.
  - Live **form visit** is a named inbound override that can open the next step.
  - Form submitted **closes** the nudge and can **arm** the next (e.g. reactivation scheduled).
  - Owning channel moves **forward-only** along Text → Email → Form.
  These rules are **the node's mechanism** — they live **inside** `active_attempt`, not as metadata about
  it. Every rule-bearing node must be resolved to this depth from the corpus.

Apply the same treatment everywhere the corpus is concrete, including at least:
- **Engine 2 precedence (node `motion_decision`)** — the full fixed precedence ladder: reactivation-first;
  nudge-only-when-nothing-reactivation-worthy; one consolidated form for all self-reportable needs;
  reactivation attaches secondary signals as pre-meeting **agenda**, never parallel outreach; **one
  client, one motion, ever.** These are the node's rules.
- **Eligibility automation shape (node `eligibility_evaluation`)** — Trigger (scoped pull: manual rich /
  event thinner) → Constants → Conditions → Rules → structured output → downstream resolution; pathway
  pass = **any** pathway (CEC|FSW|FST|PNP-*), not one favoured; **every** determination incl. missing-data
  emits a signal; inspectable/changeable **without code deploy**.
- **Reference-currency (node `reference_version`)** — a reference move (draw threshold/cutoff shift,
  category added, trade/provincial identifier change) is a **faceless first-class trigger** that
  re-evaluates eligibility for **every affected contact**; versioned data; **no code deploy**.
- **Reachability checks (node `reachability_verdict`)** — the full check set (email valid, phone valid,
  ≥1 channel matching the intended sequence, typo/garbage, dedupe, already-in-Tower, consent/silenced,
  name present); verdicts reachable|partial|unreachable; sets sequence-ready.
- **Consent (node `consent_state`)** — sequenced|silenced|unsequenced; silenced when not opted-in and when
  opted-out; gates Engagement and Fact-refresh; gates deep data collection.
- **Field-class routing (node `field_class_routing`)** — self-reportable→forms/pre-meeting;
  document-dependent→**never a form**, tracked work item; employer-directed→ask the **firm**.
- **Commercial (nodes `campaign_state`, `escrow_acceptance`)** — escrow is the **only** peer door at
  activation; running requires database-authorization + escrow-acceptance; after running the campaign
  performs with no further required activation inputs; Tower holds no settlement funds; end-clients pay
  nothing.
- **Meeting loop-closer (nodes `meeting_booked`, `pending_capture`, `live_brief`)** — on meeting_booked
  with outstanding self-reportable fields open capture; any write-back → immediate re-eval; brief is
  **recomputed/live**, never a snapshot.
- **Tenancy (nodes `firm_tenancy`, `otp_challenge`, `session`)** — provision via versioned seed manifests
  only (no ad hoc SQL); OTP send→verify→session; **unprovisioned email → generic success, no code**
  (anti-enumeration); assisted/OLG and self-serve/ALG land in the **same** application/session matrix.

If a node's rules are not in the corpus, the node is **named-silent** for those rules — carry the silence
explicitly (from the skeleton's silence lists and the Story's Silences master list). **Do not invent a
rule to fill a silence. Do not flatten a specified rule into vagueness.**

---

## 2. Faceless origins are mandatory and must be visibly distinct

The whole reason this map exists is that faceless machinery (state that changes with **no control and no
pane**) is invisible to a component-derived view. Every node the skeleton marks ★ (and any you discover)
must be rendered as a **first-class, visibly-distinguished** origin on the map — a different node/edge
treatment so a human can see at a glance which parts of the machine run with no one present.

The archetypes to never lose: `reference_version` move (★★), `fact_writeback` / `missing_fact_signal`,
the time/threshold criteria inside `active_attempt`, `inbound_override`, `finishing_event`, `signal`,
`motion_decision`, `eligibility_evaluation`, `live_brief` recompute. These are the machine's autonomous
heartbeat. If any renders identically to a control-fed node, the map has failed its main job.

---

## 3. Fractal — it is a SERIES of maps, not one flat graph

A single flat graph cannot hold a rule-bearing node like `active_attempt`, because that node's mechanism
*is itself a rule system*. So the map is **fractal**:

- **Top map:** the twelve-system ring (skeleton §14 is the edge skeleton — the self-feeding
  detect→engage→collect→re-detect loop with the faceless injectors). Nodes and causation edges.
- **Sub-maps:** any node that contains a rule-mechanism **opens into** a sub-map of that mechanism.
  `active_attempt` opens into the Text→Email→Form ladder with its timing thresholds as internal
  transitions. `motion_decision` opens into the precedence ladder. `eligibility_evaluation` opens into
  Trigger→Constants→Conditions→Rules→output.
- The map is navigable up/down these levels. Same node identity at every level; the sub-map is the node's
  interior, not a new node.

---

## 4. Interactive + simulable — the point, not decoration

The map must be **data-driven and simulable**, so a human can verify the mechanism by operating it —
without any connection to Tower.

- **Build from data, never hand-drawn.** Nodes/edges/rules are data (id, contained-rules, transitions,
  faceless-origin flag, sub-map). The canvas **renders and simulates from that data.** (Same discipline
  as the register canvas — registered from metadata, not hand-placed frames.) Hand-drawing makes toggles
  fake; data-driving makes them real.
- **Toggle a rule → the map reflects it.** Change `active_attempt`'s "30 min" to "15 min," or toggle a
  precedence branch in `motion_decision`, and the map's simulated behavior changes accordingly. The rule
  is data; editing it re-drives the simulation.
- **Fire a faceless trigger → watch the cascade.** Simulate a `reference_version` move and watch the ring
  light up which nodes re-fire (every affected contact → `eligibility_evaluation` → `eligibility_result`
  → `signal` → `motion_decision` → `active_attempt`). This is how the mechanism is *verified*: make the
  autonomous machinery run and confirm the causation is correct.
- It simulates **causation**, not live data. No real sends, no real DB — the map is the machine's logic
  made operable so errors in the causation surface as wrong simulated behavior.

---

## 5. Coverage checks the map must support (from the skeleton §16)

- **Every ★ (faceless) node must have a non-UI origin** in its transitions (job/webhook/schedule/event).
  A ★ node whose only inbound transition is a control is a **bug** — a faceless origin left unmodeled.
  Surface these.
- **Every node must be either changeable (has ≥1 inbound transition) or a pure source.** A node nothing
  can change is dead or missing an origin.
- (Face reconciliation comes later, off-map: every future control lands on a node here; every future pane
  displays a node here. The map is what makes that check possible — but do not add faces now.)

---

## 6. Definition of done

1. Every node from the skeleton is present, **raised to full corpus resolution** — rules/thresholds/
   precedence/conditions carried **inside** the node wherever Seed/World/surrounding markdowns specify
   them; silences named where the corpus is silent; nothing invented, nothing flattened.
2. Any "must exist" stated anywhere in the corpus that the skeleton missed is **added** as a node or a
   rule inside a node. The map is the fusion of the whole corpus's machine-claims, not the Story alone.
3. Faceless origins render as first-class, visibly distinct.
4. The map is **fractal** — rule-bearing nodes open into sub-maps of their mechanism.
5. The map is **data-driven and simulable** — toggling a rule re-drives the simulation; firing a faceless
   trigger shows the cascade — with **zero** connection to Tower/prototype and **zero** component
   language.
6. The coverage checks in §5 are runnable against the map's data.

Deliver the map's **data model first** (nodes, edges, contained-rules, faceless flags, sub-maps) derived
from the corpus, then the canvas that renders and simulates it. Report which nodes reached full corpus
resolution and which remain named-silent (corpus-silent), so the founder sees exactly where the machine
is specified vs. where the corpus itself leaves a gap.
