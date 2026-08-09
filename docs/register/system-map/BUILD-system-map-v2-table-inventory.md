# BUILD INSTRUCTION v2 — The System Map as the table inventory (everything modular is a table)

**To the PM.** You are given three things and nothing else: this instruction, `SYSTEMS-REQUIREMENTS-FILLED.md`
(the node skeleton), and the existing `/system-map` build (`src/app/system-map/*`). This instruction
**supersedes and deepens** the interactive-map build with one reframe that changes what the map *is*.

---

## 0. The reframe (this is the whole thing)

The machine is **tables + a dumb runtime.** Everything with content is a **table** (rows you can edit).
The runtime is a generic loop that reads rule-tables and edits state-tables when a trigger fires — it
holds **no content of its own.**

There are three kinds of table. Every node/rule/order in the map must be classified as exactly one:

1. **State table** — holds values/status the machine tracks. (e.g. `eligibility_result`, `consent_state`.)
2. **Rule table** — holds "when [trigger] + [condition] → change [target] to [value]" as **rows**.
   Thresholds, conditions, precedence ladders live here as **data**, never as prose or code.
   (e.g. the 30-min/24h windows; the Engine 2 precedence ladder.)
3. **Sequence / order table** — holds an **ordered, rearrangeable list**. Order is data you can permute.
   (e.g. the owning-channel ladder `[text, email, form]`; content order across days.)

**The map's job:** from the Systems Story / Requirements corpus, **declare every table that must exist,
classify each (state | rule | sequence), and define the relationships between them.** The map is the
**table inventory of the machine**, not a picture of it.

## 1. The modularity law (the acceptance test — apply to every node)

> **Anything that should be modifiable must be a table (an editable row/list). If something modifiable
> is instead frozen in prose or hard-coded, that is a BUG — unless there is a stated structural reason
> it cannot vary (a hard human gate, a law/must-not, an immutable Seed/World wall).**

For every node and every rule inside it, decide:
- **Modular?** → it must be a state/rule/sequence table with editable rows. Confirm it is.
- **Not modular?** → state the **structural reason** (hard-gate / must-not / immutable wall). If there is
  no such reason, it is a **bug** — flag it `frozen-should-be-table`.

**The worked example (fix it, and treat as the standard):** the owning-channel ladder is currently the
prose rule `r-forward-only` ("Text → Email → Form"). Order is not editable → **it fails the test.**
Convert it to a **sequence table** — an ordered list `["text","email","form"]` — that can be reordered,
and point the simulation at the list, not the sentence. After this, changing the order (e.g. Email-first)
re-drives the cascade. Do the same audit for every ordered/threshold/precedence rule in the map:
- `motion_decision` precedence ladder → rule table (rows, reorderable/toggleable).
- `active_attempt` thresholds → already values; confirm they are rule-table rows, and the **channel order**
  becomes a sequence table.
- `content_order` (7a) → sequence table.
- `field_class_routing` → rule table (class → route rows).
- `eligibility_evaluation` shape (Trigger→Constants→Conditions→Rules) → rule table(s).

## 2. Relationships are first-class

The map declares **relationships between tables** explicitly (foreign-key-style, but not a DB — just
declared references): which rule-table reads which state-table; which state-table a rule writes; which
sequence-table a runtime step consumes. The existing edge model is the start; make every edge say
**which table it connects to which, and in which direction (reads / writes / triggers).**

## 3. Runtime stays dumb and generic

The simulation engine must remain **content-free**: it fires a trigger, looks up the relevant rule-table
rows, and applies them to state-tables — walking edges. It must contain **no** hard-coded thresholds,
orders, or conditions — those all live in tables it reads. If a value or order is inside the engine code,
that is the same bug as prose-freezing: move it into a table.

## 4. Editability = structural editability, not just parameter tuning

The map must support **two** kinds of edit, both re-driving the simulation:
- **Parameter edit** — change a value in a rule row (30 → 15). *(Already works.)*
- **Structural edit** — reorder a sequence table (channel order), toggle a rule row on/off, or reroute a
  relationship. *(New — this is the point of v2.)*
Firing a trigger after either kind of edit shows the changed cascade.

## 5. Resolution + silence (unchanged, still enforced)

- Rules come from the corpus at full resolution — concrete where Seed/World/surrounding markdowns are
  concrete; **named-silent** where the corpus is silent (do not invent a rule to fill a silence).
- Faceless origins stay first-class and visibly distinct; the coverage check (every ★ has a non-UI
  origin) still runs.
- No component/control/pane language. No connection to Tower/prototype. Causation simulation only.

## 6. Definition of done

1. Every node/rule/order classified as **state | rule | sequence** table.
2. The **modularity law (§1)** applied to every one: modular things are editable tables; non-modular
   things carry a **stated structural reason**; anything frozen without a reason is flagged
   `frozen-should-be-table`.
3. The **channel-order** case (and every ordered/precedence rule) converted from prose to **editable
   sequence/rule tables**; simulation reads the tables.
4. **Structural edits** (reorder / toggle / reroute) supported and re-drive the cascade, alongside
   parameter edits.
5. Relationships declared with direction (reads / writes / triggers).
6. Runtime engine holds **no** content — all thresholds/orders/conditions live in tables.
7. Report: a table listing every node → its table-kind → modular?(y/n) → if n, structural reason; and a
   list of any `frozen-should-be-table` bugs found.

Deliver the **table classification + modularity report first** (the audit), then the structural-edit
canvas. The audit is the valuable artifact — it's the proof that everything that should be modular is,
and the named reason wherever it isn't.
