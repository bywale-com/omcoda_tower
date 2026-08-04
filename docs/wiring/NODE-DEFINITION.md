# Wiring — what a node is (node definition)

## Preface

This doc is the companion the Wiring Method leans on. The moment we decided to trace implementations into a graph, one question had to be answered before anything else: what counts as a node? We nearly settled for "a table or a system," but "system" was too coarse and "table" too narrow on its own — so we pushed until we found the actual discriminator, which is altitude, not technology. The breakthrough was noticing what a table *is* relative to SQL — the named state one rung above the language that operates on it — and realizing that relationship generalizes to every system. We cemented it by running the same Postgres-on-Supabase stack through three events and watching the node land at three different rings (table, engine, platform) purely by what the event acted on. That test is what turned a rule of thumb into something load-bearing, and it's why this sits beside the method rather than inside it: the method connects nodes, but only if we agree, precisely, on what a node is.

---

**What this is.** The definition of a node on the Wiring graph — the thing the [`WIRING-METHOD.md`](./WIRING-METHOD.md)
formula connects. Getting this altitude right is what keeps the graph in plain event language and out
of code. Read this before tracing anything.

**Counterpart (origins):** [`WIRING-CRITICAL-INTERACTION.md`](./WIRING-CRITICAL-INTERACTION.md) — which user interactions count as writes that land on a node.

---

## 1. The rule

> **A node is the smallest *named unit of state* that an event can happen to, sitting exactly one
> layer above the language or mechanics that operate on it.**

It's the **noun that gets acted on**, never the **verb that does the acting**. You point at it, say
"this changed," and mean something — without writing a single line of the operating language.

**The reference instance — table vs SQL.** SQL is *how you operate on* a table; the table is the
*named unit of state* the operations act on. The table is the addressable noun; SQL is the verb layer
underneath. You work at the noun. That relationship — **state one rung above its operating
language** — is what we look for in every other system to find its node altitude.

---

## 2. The test (both directions)

The property that makes "table" right is that **you never have to get down into the operating
language** to name it. Use that as the test, both ways:

- **If you can only name the node in its operating language, go DOWN a rung.** ("Supabase" or "the
  system" is too coarse — many unrelated events touch it indistinctly and the ripples vanish inside
  it.)
- **If naming it requires descending into SQL / REST calls / SDK internals, go UP a rung.** (You've
  drifted into code; back up to the state those calls operate on.)

The sweet spot is the altitude at which the **event sentence stays true and stays plain**: "when X
happens to A, Y happens to B" only makes sense if A and B are *states*, not verbs and not whole
systems. **The node altitude and the edge language are the same choice** — you pick the rung at which
the graph can talk.

---

## 3. Table-equivalents across systems

Every system has a "table-equivalent" — its named unit of state. Find it; never drop to the API.

| System | Node (the state) | NOT the node (the verb layer) |
|---|---|---|
| Database | a **table** (`consent_records`, `client_record`) | Supabase, Postgres, the SQL |
| Email/SMS provider | the **sending domain**, the **suppression list**, the **reputation** | Resend, Twilio, the REST calls |
| Queue / jobs | the **queue** / a named **job type** | the worker code, the enqueue call |
| Payments / escrow | the **escrow ledger entry** / the **held balance** | Stripe, the API |
| Event stream | the **stream** / a named **event class** on it | the emit code |
| External data source | the **reference table** / the **versioned criteria set** | the scraper, IRCC's site |

Same altitude every time: a nameable unit of state an event can change, one rung above the mechanics.

---

## 4. System is the floor; state-unit is the grain

A **separate system is always at least one node** — a distinct system clearly earns nodehood. But a
big system holds **several** table-equivalents (a provider has a *domain* node *and* a *suppression*
node *and* a *reputation* node). So:

- **System = the outer boundary** (never fewer than one node per system).
- **State-unit = the grain inside it.**

They aren't rivals: system sets the floor, state-unit sets the resolution within. This maps straight
to **C4**: the system is the container boundary; the table-equivalents are the components inside it.

---

## 5. The cement — same stack, three altitudes

The same physical stack (a Postgres DB on Supabase) yields **three different nodes** depending on
*what the event acts on*. This is the proof the rule is about altitude, not technology.

**A table is the node** — the event acts on the *contents*.
> "When a consent form is submitted, a row is written to `consent_records`."
The thing acted on is the table's contents. Supabase and Postgres are invisible — they're the verb
layer. You'd never say "when consent is submitted, Supabase happens." **Altitude: state inside a store.**

**Postgres is the node** — the event acts on *the engine's own behavior*, not any table's contents.
> "When the OLTP store hits its connection limit, jobs back up."
> "When we enable Row Level Security, every table's read path changes."
No single table is the subject — the *engine itself* is. RLS isn't a row; connection exhaustion isn't
about one table. **Altitude: the engine as a stateful thing.**

**Supabase is the node** — the event acts on *the managed platform / tenant boundary*, above the engine.
> "When the Supabase project is paused for non-payment, all firms lose access."
> "When we rotate the Supabase service key, every server-side caller re-auths."
Postgres is running fine underneath; the thing acted on is the *managed wrapper* — project, auth
layer, API gateway, billing/tenancy envelope. **Altitude: the managed boundary around the engine.**

The rule picks correctly every time by asking only **"what is the event acting on?"** — never "what
technology is this":

- acts on **contents** → the table
- acts on **the engine's behavior** → Postgres
- acts on **the managed wrapper** → Supabase

---

## 6. Why this cements it: it's a nesting (C4)

Supabase (platform boundary) **contains** Postgres (engine/container) **contains** tables
(components). The node isn't fixed to a technology — it's fixed to **the altitude at which the event
lives.** A low event (row written) lands on the innermost node; a mid event (RLS, connection limit)
lands on the engine; a high event (project paused, key rotated) lands on the platform. The rule
auto-selects the ring the event belongs to.

So the real rule, underneath "table vs system," is:

> **A node is the tightest ring of state the event actually touches.**

Most events touch contents, so most nodes are tables. But when an event genuinely acts on the engine
or the platform, the same rule *promotes* the node up a ring — and that is exactly how you represent a
whole separate system without ever pretending it's a table.

---

## 7. The grammar test (fast, in practice)

You never decide the node in the abstract — **the event sentence names its own node.** Read the
sentence and look at the noun after "happens to":

- "…a row is written to **X**" → X is a **table**.
- "…**X** refuses new connections" → X is the **engine**.
- "…**X** is suspended" → X is the **platform**.

The grammar of the event tells you which ring it hit. If the sentence has no clean noun after the
verb — if you can only finish it in code — you're at the wrong altitude (§2).
