# UI-First Build Methodology

**Project:** Tower — Om Coda  
**As of:** July 2026  
**Audience:** Product, design, engineering — anyone authoring How Analysis trees or Register flows  
**Related:** [The Prototype Is Not the Product](https://www.omcoda.com/writing/notes/the-prototype-is-not-the-product) · [`systems-register.md`](./systems-register.md) · [`register-manager-prompt.md`](./register-manager-prompt.md) · **[`../build-foundation/05-register-augmented-build.md`](../build-foundation/05-register-augmented-build.md)** (strips · versions · approve → plant) · [`register-augmented-build-bridge.md`](./register-augmented-build-bridge.md)

---

## 1. The sequence

Tower is built **UI-first**, then **systems-mapped**, then **implemented**.

```text
UI prototype (product truth — what appears)
    →  How Analysis (consultant-visible decomposition)
    →  Register flow at flow anchor (crosses systems — not cosmetic)
    →  Leaf test cases + process assumptions (what the flow must prove)
    →  Implement + ship one flow at a time
```

**Register-augmented spine (serious surface identity changes):** when the *look / agency* of a beat must change — not just How text — follow the pack augmentation before planting durable UI:

```text
Block → lo-fi strip (versioned) → click-through → human approve → plant (tokens + dark + holons + shadcn) → flow when appearance isn’t enough
```

Full detail: [`05-register-augmented-build.md`](../build-foundation/05-register-augmented-build.md). This Tower doc remains the deep cut on **How DNA, visibility, flow anchors, and leaf test cases**.
| Layer | Question it answers | Executes? |
|-------|---------------------|-----------|
| **Running app + Console** | What does the consultant see and click? | Yes (prototype or prod) |
| **How Analysis** (`/register` How canvas) | *How* does the molecular outcome happen — consultant language first | No |
| **Register flows** (`src/app/register/flows/`) | Hops and wires for a **flow anchor** — crosses systems | No (map only) |
| **Live handlers + server** | Runtime behavior | Yes |

The prototype is cosmetic until a flow ships. **Console** documents what appears; **flows** document what happens behind it when systems must connect.

---

## 2. Start from the molecular outcome

Everything begins with **one honest paragraph** — the core outcome from start to finish. Not a feature list. Not tech. Simple enough to read aloud to a consultant; rich enough to carry the real promise.

**Example (Core Outcome epic):**

> Tower automatically detects eligible candidates and initiates a campaign to get them to book a meeting.

**Example (Consultant Gets On Tower epic):**

> A consultant signs in to Tower and lands in their firm workspace.

This node is the **molecular outcome** — a few “atoms” (eligible, campaign, meeting) bound into one statement. It is the root of a **How tree**.

---

## 3. How Analysis — decomposition rules

Each How tree is one epic. Many epics can exist; **`epicOrder`** sets universal priority (lower = first on the roadmap).

### 3.1 First How mirrors the outcome

The first child question restates the outcome as *How does…?* The **answer** (clarity) must **not paraphrase the outcome redundantly** — it must be structured so the next level can **cut the question into answerable parts**.

**Anti-pattern:** Outcome says *detect eligible candidates and initiate a campaign*; first answer says *Tower detects service-eligible candidates and initiates a launch, nudge, or reactivation campaign* — same sentence, no decomposition.

**Correct:** Break the **question** into its clauses, then answer each branch:

| Parent question (cut) | Child How |
|-----------------------|-----------|
| How does Tower **detect eligible candidates automatically**? | Detection branch |
| How does Tower **initiate a campaign to get them to book a meeting**? | Campaign branch |

The parent answer joins those branches in one sentence for the card display:

> Tower detects eligible candidates automatically, then initiates a launch, nudge, or reactivation campaign toward a booked meeting.

### 3.2 Cut the parent answer — preserve DNA

Descendant questions are formed by **cutting phrases from the parent answer**, not inventing new concepts.

| Parent answer (excerpt) | Natural child question |
|-------------------------|------------------------|
| *…show answers the contact provided **through engagement touchpoints*** | How are **engagement touchpoints** delivered to contacts? |
| *Consultant imports or adds contacts, then **sees them on the Board and in Contacts*** | How do contacts **appear on the Board and in Contacts**? |

**DNA rule:** Every child question must trace to a phrase in the parent answer. If you cannot trace it, the question is wrong.

**Anti-pattern:** Parent is *How does Tower detect eligible candidates automatically?*; child asks *How does a consultant know who is service-eligible?* — consultant framing with no phrase in the parent answer. That branch is untraceable.

**Anti-pattern:** Parent says *engagement touchpoints*; child asks *How does a nudge sequence deliver…?* — *nudge sequence* never appeared upstream. That term belongs in the **leaf answer**, not smuggled into the question.

### 3.3 Sibling order

Among siblings, **left-to-right on the canvas** (`position.x`) = **clause order in the parent answer**.

```text
Parent: "Client Data Q&A and forms show answers … through engagement touchpoints"
         └─ left:  show answers (Client Data Q&A and forms)
            right: engagement touchpoints delivered
```

### 3.4 C3 per node

Each node carries:

| Field | Role |
|-------|------|
| **Question** | The How? — absent on outcome root |
| **Clarity** | The answer sentence (what the node card displays) |
| **Criteria** | **When** (trigger/timing) + **Conditions** (what must be true) |
| **Components** | UI surfaces; at leaves also runtime, stores, external |

---

## 4. Visibility rule (strict)

Two layers of language exist: **consultant-visible** and **process / invisible**.

| Layer | Question | Clarity & criteria | Components |
|-------|----------|-------------------|------------|
| **Outcome + every node before a true leaf** | Consultant-visible only | Consultant-visible only | UI surfaces only |
| **True leaf only** | May name systems | May name systems | Stores, runtime, APIs allowed |

**Consultant-visible** = what a consultant would recognize in the product: Board, Contacts, Client Data, engagement chart, badges, import dialog, “consultant sees…”, “contact receives…”.

**Process / invisible** = implementation the consultant does not see: Auth Service, sequence runner, stores, API routes, enrollment records, rule engine internals.

### 4.1 When to stop — become a leaf

Stop decomposing and declare a **true leaf** when either:

1. The next How would **repeat the parent** (no new information), or  
2. The next How would require **process language before the leaf** (violates visibility).

**Exemplar leaf:** *How do contacts appear on the Board and in Contacts?*  
At this point you **must** go low-level — import → store → query → render — because there is nowhere else to put it without repeating the parent. That depth is correct **only because it is the last Q/A pair in the chain**.

### 4.2 Prefer components over process language

Before you reach a leaf, **components point at what appears** — Console holons the consultant already touches. Do not name Auth Service, stores, or APIs if the answer can stay on surfaces alone. The prototype exists for appearance; use it.

Process language is a signal: you have hit the **prototype boundary**. Something is no longer purely cosmetic — systems must connect. That is why a **Register flow** exists.

### 4.3 Leaf depth — assumptions, not full flows

A leaf may use process language in its **answer**, but it does not carry hops, wires, or payloads. The leaf answer is the **assumption the flow will test** — e.g. *Nudge sequences in Hub deliver touchpoints* or *Auth Service sends OTP via Resend*.

**Enough at the leaf:**

> Nudge sequences in Hub deliver Text, Email, and Form touchpoints to contacts.

**Belongs in the Register flow** (at the flow anchor):

> POST /auth/otp/send · wire to Auth Service · Resend · otp_challenges row · advance to verify view

---

## 5. Flow anchors, leaves, and test cases

Hows do **not** immediately become flows. They give you:

1. The **question a flow must answer** (flow anchor)
2. The **test cases** leaves define (acceptance boundaries)
3. The **process assumptions** leaf answers state (what the flow must prove)

### 5.1 Flow anchor — the node before the leaves

A **flow anchor** is the last answer node whose children are **all leaves**. The Register flow is born **here**, not on the leaves.

| Flow anchor holds | Role |
|-------------------|------|
| **Question** | What the flow must answer end-to-end |
| **Clarity** | Consultant-visible scope of the flow (one sentence — the whole journey) |
| **Components** | UI surfaces involved (LoginForm, Board, …) |
| **Criteria** | When the flow applies; conditions that must hold |

The flow crosses systems. It is the first artifact that is **not cosmetic** — the thing behind the pronoun once appearance alone is not enough.

### 5.2 Leaves — test cases + process assumptions

Each **leaf** under a flow anchor plays two roles:

| Leaf field | Role |
|------------|------|
| **Question** | **Test case** — consultant-visible acceptance boundary |
| **Clarity (answer)** | **Process assumption** — what we believe happens invisibly; the flow tests this |

Rephrase the leaf question as a test:

| Leaf question | Test case |
|---------------|-----------|
| How does a consultant open the login page and submit their work email? | A consultant can open the login page and submit their work email. |
| How does a consultant receive and enter a one-time code to complete sign-in? | A consultant can receive and enter a one-time code to complete sign-in. |

The leaf earns its place because you cannot go deeper without **repeating the parent** or **using process language** — but the leaf question itself stays consultant-framed. Process language lives in the leaf **answer**.

### 5.3 Naming — flows trace to flow anchors, not epics

A **tree is not a flow**. Epic labels like "Consultant Gets On Tower" or shorthand like "Login" are **not** flow names — they are not traceable to a flow-anchor node.

| Rule | Example |
|------|---------|
| Flow `id` + `label` derive from the **flow anchor** clarity | `n-verify` → *Submit email, receive code, and finish signing in* |
| Flow `howAnchorId` links back to the How node | `enter-email-verify-otp` ↔ `n-verify` |
| Sibling flow anchors = **sibling flows** | `n-verify` and `n-arrive-board` are two flows, not one "Login" flow |

**Why separate flows?** Each flow anchor has **distinct criteria** — one can be true while the other is irrelevant. Finishing OTP sign-in ≠ landing on Board with client rows. Different processes, different acceptance boundaries.

### 5.4 Consultant Gets On Tower — two flows

```text
n-signin-land (answer — splits; not a flow)
  A: Consultant enters work email, verifies a one-time code, and arrives at the Board…

  n-verify (FLOW ANCHOR 1)
    → ENTER_EMAIL_VERIFY_OTP_FLOW
    ├─ n-send-email (leaf — test case / step 1)
    └─ n-enter-code (leaf — test case / step 2)

  n-arrive-board (FLOW ANCHOR 2 — was missing)
    → ARRIVE_AT_BOARD_AFTER_SIGN_IN_FLOW
    └─ n-see-board (leaf — test case / single step)
```

Verify flow ends at *finish signing in* — not at Board. Board landing is a **sister flow** triggered after verification succeeds (`when: When verification succeeds`).

### 5.5 When a flow anchor has one leaf

If a flow anchor has a **single** leaf child, the flow still lives at the anchor. The leaf is the one test case + process assumption boundary.

Example: `n-arrive-board` → `n-see-board` — one flow (or one step) for post-auth Board landing; the leaf tests *consultant sees Board after sign-in*.

### 5.6 Flow crystallization — first leaf makes the parent the flow

**Rule:** The moment **one** child under a parent becomes a leaf, that parent **is** the flow anchor. Register flow scope locks to the parent's question + clarity.

**Sibling lock:** Every **other** child of that same parent must **also** be a leaf — immediately. No further How decomposition among siblings, even if a sibling could still split in UI-only terms without redundancy.

| Situation | Result |
|-----------|--------|
| First leaf appears under parent | Parent = flow anchor |
| Sibling could still go deeper in UI | Must still resolve as a leaf |
| Sub-leaf under a crystallized flow | Test case only — **cannot** become its own separate flow |

Flows do not nest inside flows at the How layer. One flow anchor, N sibling leaves (test cases + process assumptions).

**Core Outcome example:**

```text
n-trigger-agents (FLOW ANCHOR — crystallized when first leaf declared)
  A: Automations trigger the reactivation agent… composite channels and copy…

  ├─ n-automation-triggers-reactivation (leaf — process boundary)
  │    Q: How do Automations trigger the reactivation agent when criteria are met?
  │    Cannot go deeper without redundancy or process language → leaf.

  └─ n-reactivation-agent-composite (leaf — forced sibling)
       Q: How is the reactivation agent a composite sequencing of channels and copy?
       Could stretch further in UI — but sibling leaf already crystallized the flow → must resolve here.
```

### 5.7 When a flow anchor has multiple leaves

Multiple sibling leaves = multiple **test cases** within the **same flow scope** (usually one step per leaf, grouped under one `RegisterFlow`).

Do **not** create one Register flow per leaf — one flow per **crystallized flow anchor**, with steps driven by leaf test cases.

### 5.8 Open question — flow anchor vs leaf collapse (sibling trees)

*Under discussion for branches that have not yet crystallized.*

If a node cannot decompose without every child immediately being a leaf, that may signal collapse — but **flow crystallization** (§5.6) overrides once any sibling becomes a leaf.

---

## 6. Worked example — Core Outcome (detect + initiate)

```text
outcome
  Tower automatically detects eligible candidates and initiates a campaign…

n-core
  Q: How does Tower automatically detect eligible candidates and initiate a campaign…?
  A: Tower detects eligible candidates automatically, then initiates a launch,
     nudge, or reactivation campaign toward a booked meeting.
  (answer joins two branches — does NOT restate outcome word-for-word)

  ├─ n-detect-eligible (left — cut from question)
  │    Q: How does Tower detect eligible candidates automatically?
  │    A: Tower evaluates contacts in the firm clientbase against service eligibility criteria.
  │    └─ n-evaluate-eligibility (leaf)
  │         Q: How does Tower evaluate contacts against service eligibility criteria?
  │         A: Hub-defined rules and sequences… rule engine records outcomes.
  │
  └─ n-initiate-campaign (right — cut from question)
       Q: How does Tower initiate a campaign to get them to book a meeting?
       A: Tower enrolls eligible contacts in launch, nudge, or reactivation sequences…
       ├─ n-select-campaign-type (leaf)
       ├─ n-enroll (leaf)
       ├─ n-run-sequence (leaf)
       └─ n-booking-outcome (leaf)
```

**Removed:** *How does a consultant know who is service-eligible?* — no DNA from *Tower detects automatically*. Consultant-visible surfaces (Board badges, Client Data facts, import) belong in separate epics or deeper branches once traceability is established.

---

## 7. Worked example — immigration facts branch (archived pattern)

```text
n-keep-facts (answer — consultant only)
  Q: How does a consultant see up-to-date immigration facts for a contact?
  A: Client Data Q&A and forms show answers the contact provided
     through engagement touchpoints.

  ├─ n-record-responses (leaf — left clause)
  │    Q: How do Client Data Q&A and forms show answers the contact provided?
  │    A: Answers from engagement touchpoints appear in the Q&A feed and live form…

  └─ n-run-reengagement (leaf — right clause)
       Q: How are engagement touchpoints delivered to contacts?
       A: Nudge sequences in Hub deliver Text, Email, and Form touchpoints to contacts.
```

Note the DNA path: *engagement touchpoints* in the parent → same phrase in the child question → *Nudge sequences* and *Hub* appear only in the leaf answer.

---

## 7. Worked example — Board appearance branch

```text
n-hold (answer — consultant only)
  Q: How does a consultant add contacts to their clientbase in Tower?
  A: Consultant imports a CSV or adds contacts manually, then sees client rows
     on the Board and in Contacts.

  ├─ n-bring (leaf) — import/add mechanism
  └─ n-list (leaf) — perfect terminal pair
       Q: How do contacts appear on the Board and in Contacts?
       A: Board and Contacts query the firm clientbase… (process OK here)
```

**Anti-pattern:** Putting *How do contacts appear on the Board?* on `n-hold` while it still has children — that steals the leaf question and forces process language one level too high.

**Anti-pattern:** Putting *How do contacts appear on the Board?* on `n-hold` while it still has children — that steals the leaf question and forces process language one level too high.

`n-hold` is the **flow anchor** for import → appear. Leaves `n-bring` and `n-list` are test cases within that future flow.

---

## 8. Traceability summary

| How layer | Consultant vs process | Becomes |
|-----------|----------------------|---------|
| Outcome + answer nodes above leaves | Consultant-visible; components = what appears | Console holons |
| **Flow anchor** (last node before leaves) | Consultant-visible scope | **Register flow** (question + clarity = flow boundary) |
| **Leaves** | Question = test case; answer = process assumption | Flow **steps** + acceptance tests |
| Register flow canvas | Hops, wires, payloads | Implementation checklist |
| Live app + server | Executes | Production |

**Recursion:** Appearance is already prototyped (Console). Process language at a leaf means you have reached the boundary where appearance is not enough — a flow must cross systems and prove the leaf assumptions.

Merge edges in How Analysis (`mergeWithId`) when the same system phrase appears in two branches (e.g. enrollment ↔ nudge delivery).

---

## 9. Where it lives in the repo

| Artifact | Path |
|----------|------|
| How node types + rules (code comments) | `src/app/register/howAnalysis/types.ts` |
| Epic graphs | `src/app/register/howAnalysis/*.ts` (e.g. `consultantOnTower.ts`, `towerCoreOutcome.ts`) |
| Epic registry + sort | `src/app/register/howAnalysis/registry.ts` |
| How canvas UI | `src/app/register/components/RegisterHowCanvas.tsx` |
| Detail panel | `src/app/register/components/HowAnalysisDetailPanel.tsx` |
| Software flows | `src/app/register/flows/` |

---

## 10. Checklist before adding or editing a How node

1. **DNA:** Can I point to the exact phrase in the parent answer that this question cuts?
2. **Visibility:** Is question + clarity + criteria consultant-visible? (If not, this must be a leaf.)
3. **Leaf test:** Would the next child repeat the parent or need invisible language? If yes → stop here.
4. **Sibling order:** Does `position.x` match clause order in the parent answer?
5. **Components first:** Can this node point at what appears (Console holons) instead of process language?
6. **Flow anchor:** If this node's children are all leaves, does a Register flow answer this node's question?
7. **Leaf test cases:** Does each leaf question rephrase as a consultant acceptance test?
8. **Leaf assumptions:** Does each leaf answer state the process assumption the flow must prove?

---

## 11. Relationship to other Tower registers

| Register | Perspective |
|----------|-------------|
| **Console** | What is this UI region called? Where does it live? (appearance) |
| **How Analysis** | How does the outcome happen? (consultant → flow anchor → leaf tests) |
| **Register flows** | What hops and wires implement a **flow anchor**? |
| **Icepanel** | C4 boundaries for cross-cutting deploy slices |

Same product, different lenses. How Analysis is the **methodology layer** that keeps consultant language, flow scope, and systems language in the right order.
