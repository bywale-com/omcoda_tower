# SME Pass — methodology (Engagement Manager → Pass1 → Pass2 → Handoff)

**Product:** Tower (Om Coda Register)  
**Status:** Law for this product’s SME pass. Aligns with omcoda-hq `register-manual` SME chapter; **extends** it with the Engagement Manager (roster selector) and the **Founder / PM / CTO residual** selection engine.  
**Worked roster:** [`SME-GRAPH.md`](./SME-GRAPH.md)  
**Two-axis doctrine:** This file is the **practice / regime** Engagement Manager. The orthogonal **capability** axis (CTO as technical EM), surface intent, Think Stack, and decision constitution live in [`DOCTRINE-sme-cto-implementation.md`](./DOCTRINE-sme-cto-implementation.md) and its splits.

---

## 0. Why this pass exists

Three seats ask three different questions:

| Seat | Asks |
|---|---|
| **PM** | What does the *user* need? (assemble & translate what’s been laid down) |
| **CTO** | What does the *system* need? (wires, stores, jobs, proof — given what was said) |
| **SME** | What does the *practice / domain* already require — whether or not anyone in the room knows it? |

**Enrichment** (later) surfaces design gaps from personas (“Right now I can’t…”). Enrichment does **not** surface external practice facts. Those enter only when someone looked them up and said so. SME is that seat.

Without SME, PM and CTO build on educated guesses wherever Seed already committed the product to a professional practice (consent regimes, eligibility liability, Meta ads survival, escrow release, CRM connect, desk license risk, …).

---

## 1. Pass shape (ordered, fail-closed)

```text
Engagement Manager (SME graph / roster)
    →  Pass 1 — sourced questions per seat (no answers)
    →  Pass 1 lock
    →  Pass 2 — sourced answers / mechanisms (no UI design)
    →  HANDOFF + CROSS-CUTTING
    →  Implementation writing (relative click-path) — optional bridge before deep PM/CTO absorb
    →  PM Function / Register absorb  ∥  CTO Wiring absorb
```

**Gates**

| Gate | Unlocks | Fail if |
|---|---|---|
| `sme-graph-ready` | Pass1 spawn | Roster lacks residual citations / Focus gaps; seats padded; selector wrote Pass1 answers |
| `sme-pass1-locked` | Pass2 | Questions interleaved with answers; missing external refs; Trim depth (~1/seat) |
| `sme-handoff-ready` | Deep Function ∥ Wiring | No HANDOFF; cross-cutting dual-hits unresolved; SME designed UI as “solution” |

Tower orchestration: [`../register/ORCHESTRATION.md`](../register/ORCHESTRATION.md).

**Order note.** Classic omcoda-hq spine places SME before Function. Tower’s Engagement Manager **reads product commitments** — including Personas, Outcomes, and How trees when they exist — because residual detection needs to see what the product already promised. Early Function writing is allowed as *commitment surfacing*; SME still lands facts **before** those commitments harden into unexamined “truth.” If Function ran ahead on guesses, Pass2 + Handoff **correct** Register — they do not rubber-stamp PM invention.

---

## 2. Engagement Manager (roster selector)

### 2.1 What this seat is

The **Engagement Manager** is the SME-scoping seat. It is **not** a domain SME.

- It does **not** answer what CASL, IRCC, Meta policy, or escrow practice require.
- It **does** look at what the product has already committed to on paper and produce the **SME graph**: which practice experts must sit in the build room, why, and what gap each is aimed at.

Naming: “Engagement Manager” = the agent/role that **convenes** the room. It must **never** appear on the domain roster as “engagement methodology SME” unless a true residual remains after CASL, desk ops, and Founder methodology dump are accounted for (Tower’s worked graph rejected that seat).

### 2.2 Selection engine — residual of Founder / PM / CTO

An SME seat exists wherever the product committed to a way of working that requires professional knowledge of **how that thing is done well**, and that knowledge is **not**:

| Seat | Territory (allowed to “know”) | Must **not** invent |
|---|---|---|
| **Founder** | The bet as dumped in Seed — hard stops, known unknowns, doctrine pins | Every professional practice the Seed brushes |
| **PM** | Assemble & translate — personas, outcomes, How trees, UI/click-path congruence; product-*structure* judgment | Domain/professional “how marketing / CASL / eligibility / escrow / desk practice actually works” |
| **CTO** | Given what was said — stack, wires, stores, jobs, integrations, proof | What the practice requires before wires exist |
| **SME (residual)** | Practice knowledge outside the three above | Product UI design, inventing product seats, Pass1 solutions |

**Species of residual** (not only legal):

- Legal / regulatory (CASL, licensure analogues — when in-world)
- Professional desk practice (how consultancies actually stand behind outreach)
- Ads / platform / feed-trust practice
- Payments / escrow commercial practice
- Public-reference / criteria-currency practice
- CRM / book-connection practice
- Pathway / service-eligibility ops practice
- …any other practice the product already crossed

**Secondary filter (Om Coda classic):** who does this work today, who regulates it, who gets sued if wrong — sharpens *failure if absent*; does **not** replace the residual test.

**Stop rule:** Do not pad. Merge seats that share one failure mode. Reject pure PM craft (Engine 2 already Seed-law, Hub re-home, module naming), pure CTO (OTP, cookies, job runners), and **platform-craft debt** (observability / analytics with no practice residual — see [`../register/OPERATOR-REVISIONS.md`](../register/OPERATOR-REVISIONS.md) §6) unless a true practice owner exists. Label craft debt as methodology debt — **not** an SME lane by default.

### 2.3 Required input shape (what the Engagement Manager reads)

| Input | Why |
|---|---|
| **Seed** | Bets, gates, money, known unknowns, never-invent, SME-critical flags, doctrine |
| **World** | Value-chain hops, justifying assumptions, hard human gates |
| **Personas** | Who owns which surface; folded vs referenced; house vs desk |
| **Outcomes** | Human-entity commitments; what was ruled *requirement* vs *outcome* |
| **How trees** (when present) | Where leaves already promised a way of working (Authorize book, Consent, Accept terms, Evaluation packs, …) |
| **Operator / craft notes** | To *exclude* platform-craft holes from false SME minting |

Seed §15 “likely chairs” (if present) are **hints to pressure-test**, not a list to rubber-stamp.

### 2.4 Detection move (per commitment)

For each product commitment / assumption:

1. **Cite it** (file + section / outcome / How leaf / KU #).
2. Ask: *To do this well, whose knowledge is required?*
3. Classify:
   - Founder already owns as dumped truth → no SME (or already closed)
   - Pure assembly / decomposition / click-path → **PM**
   - Pure “how do we run this on a stack?” → **CTO**
   - Else → product crossed a practice → **mint or merge an SME seat**
4. Write **failure if absent** (what wrong product ships if PM guesses).
5. Write **Focus gap for Pass1** — the aimed brief so the SME’s expertise stays on that gap (they may still surface surprises; the Focus gap is why they were called).

### 2.5 SME graph artifact

**Path:** `docs/sme/SME-GRAPH.md`  
**Producer line:** Engagement Manager (SME-scoping seat)  
**Status line:** roster for Pass1 — not Pass1 itself

**Required sections:**

0. How this graph was built (residual test + stop rule)  
1. Territory definitions used  
2. Commitment → residual map (citation → practice → seat or explicit non-seat)  
3. SME Graph (roster) — one subsection per seat:  
   - Domain lane  
   - Why called (residual)  
   - Anchors (citations)  
   - **Focus gap for Pass1** (“You are in the room because… Pressure these open commitments: …”)  
   - Failure if absent  
   - Handoff owners after Pass2 (`pm` \| `cto` \| `both`)  
   - Boundaries (what this seat must not do; overlaps)  
4. Explicit non-seats (considered & rejected with reason)  
5. Graph edges (adjacent seats that must sync before Pass2 deep work)  
6. Ready for Pass1 checklist  

**Quality bar:** Dense rationales with specific references. Every Focus gap must be usable as the opening brief when spawning that SME’s Pass1 agent. Under-claim. No Pass1 questions. No solutions.

**Worked example:** [`SME-GRAPH.md`](./SME-GRAPH.md) (Tower V1).

### 2.6 Prompt contract for the Engagement Manager agent

When spawning the selector, require:

1. Residual law table (Founder / PM / CTO / SME) as the selection engine  
2. Read list: Seed · World · Personas · Outcomes · How · craft notes  
3. Deliverable path + section shape above  
4. Seed §15 = pressure-test only  
5. Engagement Manager ≠ domain SME; do not roster yourself  
6. Platform-craft debt ≠ SME unless justified  
7. Return seat count, drops/adds vs §15, file path  

---

## 3. Pass 1 — sourced questions

### 3.1 Spawn rule

**One SME domain lane per agent.** Do not combine lanes.  
Brief seed = that seat’s **Focus gap** from the SME graph (plus Anchors).  
Style lock: [`templates` / seat `_STYLE.md` pattern from omcoda-hq](https://github.com/bywale-com/omcoda-hq) — adapted under `docs/sme/` as needed.

### 3.2 Job

Surface domain questions worth considering, each with an **external reference** (statute, regulator page, industry-org doc, documented risk, established practice source).  

**No solutions. No UI. No wireframes. No “we should build X.”**

A question without a traceable external reference does not belong — mark `NEEDS VERIFICATION` at most, do not promote to fact.

### 3.3 Quantities

| Artifact | Target |
|---|---|
| Questions per seat | Up to ~50 (quality > quota; empty padding fails) |
| Considerations depth later | ~20–50 per seat after Pass2 (Trim = ~1/seat → fail) |

### 3.4 Artifact layout

```text
docs/sme/
  SME-GRAPH.md
  METHODOLOGY.md          ← this file
  ROSTER.md               ← short index linking graph seats ↔ pass files
  pass1/{seat-id}.md
  pass2/{seat-id}.md      ← after lock only
  HANDOFF.md
  CROSS-CUTTING.md
```

Pass1 file header must restate **why this seat was called** (copy Focus gap + key Anchors) so the expert stays aimed.

### 3.5 Lock

Human (or room holder) locks Pass1 before any Pass2. **Never interleave** Q and A in one pass.

---

## 4. Pass 2 — sourced answers

### 4.1 Job

Answer Pass1 questions with sourced domain judgment.

**Solution pattern:** `<mechanism> so that <purpose>`

- Mechanism = domain judgment (not a UI design decision)  
- PM/CTO **translate** mechanism into Register and Wiring artifacts  

### 4.2 Rules

- External reference or `NEEDS VERIFICATION`  
- SME does not design product UI  
- SME does not invent product personas or World seats  
- SME answer ≠ automatic product decision — room holder adjudicates conflicts and World contradictions  
- Stay inside **Boundaries** from the SME graph; sync on **graph edges** before deep solo work on dual-hit topics  

### 4.3 Consideration shape (machine-twin ready)

Each item should be able to grow into:

- `consideration` / `thesisGap`  
- `solution` (`<mechanism> so that <purpose>`)  
- `references[]`  
- later: `implementation*` fields + `implementsSurfaceIds`  
- `handoffOwner`: `pm` | `cto` | both  
- `status`: implemented | partial | deferred | wiring  

---

## 5. Handoff & cross-cutting

### 5.1 HANDOFF.md

Every bullet traces to a specific Pass1/Pass2 item. Input for Register (PM) and Wiring (CTO).

**Absorb vs redesign**

- **Absorb** = translate each finding into *existing* Register / Wiring commitments: outcomes, How leaves, never-sees, states, gates — and **modules / modals / blocks / elements** as needed so the mechanism is honored.
- **Redesign** = reopen the product thesis. **New or changed personas / World seats are not forbidden**, but they are **unlikely** and require **strong rationale + explicit room sign-off**. They are not a normal Handoff side-effect.

- **For PM:** outcomes / states / never-sees / persona visibility / How corrections / surface commitments  
- **For CTO:** integrations / jobs / audit / gates / proof  
- **NEEDS VERIFICATION:** unsettled — do not silently close  

### 5.2 CROSS-CUTTING.md

A finding is cross-cutting when the same SME fact hits **product experience and system backend**. PM and CTO must reconcile before either goes deep — or you get two plausible halves that don’t connect.

Use SME graph **edges** as the starting watchlist (e.g. eligibility ↔ reference currency; CASL ↔ desk ↔ templates; ads ↔ first-text consent; escrow ↔ book-connect ↔ desk).

### 5.3 Implementation writing (bridge)

After Pass1+Pass2 lock, optional/required-per-room implementation writing:

- `implementationProblem` — context only (no click path)  
- `implementation` — relative click-path: `On {Surface}, you can now…` / `Starting from {Module}…`  
- `implementationAdds` — new enum/value tags, not module names as red tags  
- Hierarchy ask: which Module? existing Modal or new? Block / Submodal?  
- `implementationPlant: not_done` until CT planted  

This is **not** Pass1 solutioning. It is the bridge from SME fact → Register/Wiring absorb. Law: omcoda-hq click-path / Module · Modal · Block · Submodal.

---

## 6. What SME is explicitly NOT

- Not “help us build this” feature ideation  
- Not wireframe notes in Pass1  
- Not Enrichment Can’ts (persona adjacent gaps)  
- Not Furnish (supporting UI chrome)  
- Not CTO Wiring disguised as domain opinion  
- Not PM inventing desiderata under an SME badge  
- Not the Engagement Manager wearing a domain hat  
- Not a product persona in the admission matrix / persona switcher  

SME seats live in the **build room**. Product seats live in **World / Personas**.

---

## 7. Anti-patterns (instant fail)

| Fail | Looks like |
|---|---|
| Trim-depth SME | ~1 consideration per seat; source = “Seed §6” with no external URL |
| Interleaved Pass1/Pass2 | Answers launder under-verified questions |
| Rubber-stamp §15 | Likely chairs copied without residual citations |
| Selector as domain SME | “Engagement manager” on the roster to design sequences |
| Craft debt as SME | Analytics/observability minted without practice residual |
| SME designs UI in Pass1 | Wireframes, component lists as “questions” |
| Silent World contradiction | Pass2 overrides Founder hard stop without room adjudication |
| No Focus gap | SME free-roams; room forgets why they were called |
| No HANDOFF | Pass2 ends in a pile; PM/CTO don’t absorb |

---

## 8. Relationship to other passes

| Pass | Relation to SME |
|---|---|
| **Seed** | Names known unknowns & SME-critical flags; dumps Founder territory; does not run Pass1 |
| **World** | Ecosystem & gates; SME may force World corrections via Handoff — not via silent edit mid-Pass1 |
| **Personas / Outcomes / How** | Commitments the Engagement Manager reads; Function may be corrected after Handoff |
| **Enrichment** | After Function; persona Can’ts — may *cross-link* SME facts, must not replace SME |
| **Furnish** | Supporting UI; may implement SME-driven needs already translated by PM |
| **Wiring** | CTO absorb of same Handoff; cross-cutting sync mandatory |

---

## 9. Agent checklist (pasteable)

**Engagement Manager**

1. Residual test applied to each Seed/World/Outcomes/How commitment?  
2. Every roster seat has citations + Focus gap + failure if absent?  
3. Explicit non-seats include rejected §15 / craft debt / self-as-SME?  
4. No Pass1 questions or solutions in the graph?  

**Pass1 agent (per seat)**

1. Brief = Focus gap from SME graph?  
2. Every question has external reference or NEEDS VERIFICATION?  
3. No solutions / no UI?  
4. Single domain lane only?  

**Pass2 agent (per seat)**

1. Pass1 locked first?  
2. Solutions = `<mechanism> so that <purpose>`?  
3. Boundaries + graph edges respected?  
4. Handoff owners tagged?  

**Room holder**

1. Pass1 locked before Pass2?  
2. HANDOFF + CROSS-CUTTING written?  
3. Conflicts / World contradictions adjudicated?  
4. Trim depth avoided (~20–50/seat target)?  

---

## 10. Handoff line (pasteable)

> Follow `docs/sme/METHODOLOGY.md`. Engagement Manager produces `SME-GRAPH.md` via Founder/PM/CTO **residual** selection (not §15 rubber-stamp). Pass1 = sourced questions only, briefed by each seat’s Focus gap. Pass2 = `<mechanism> so that <purpose>`, no UI. Then HANDOFF + CROSS-CUTTING before deep PM/CTO absorb. SME seats ≠ product seats. Selector ≠ domain SME.
