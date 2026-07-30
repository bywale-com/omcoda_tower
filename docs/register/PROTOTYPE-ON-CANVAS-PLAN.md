# Plan — Real prototype on the Register canvas (no lo-fi CT)

**Status:** Plan only — awaiting room go before any surface edits  
**Decision:** Do **not** build a separate lo-fi click-through. Bring the existing hi-fi Tower prototype to spec and embed it as the Register canvas. Build missing surfaces at the same fidelity in Tower tokens.  
**Linkage that must survive:** click a highlighted click-path chip in Theory → that surface focuses on the canvas.

**Spec sources:** `personas.md` · `OUTCOMES.md` · `how/*` · `sme/implementation/*` + `00-SURFACE-VOCAB.md` · `HANDOFF.md`

---

## 0. Decision restated (build with this, not around it)

| Reject | Adopt |
|---|---|
| Separate gray lo-fi CT desks | Real prototype on Register canvas |
| Re-drawing Board/Contacts/Hub at lower fidelity | Reassemble / revise / re-seat existing components |
| “Mostly reassembly” as the whole story | **Desk = reassembly-heavy; Operator = construction-heavy** |
| HQ lo-fi chrome / purple plant | Tower `tokens.ts` + existing shadcn / shell patterns |

---

## 1. Surface inventory (from SURFACE-VOCAB)

Tags:
- **exists (reassemble)** — hi-fi component already in product shell; bring to vocab / spec
- **exists-wrong-seat (re-home)** — hi-fi exists under consultant Hub; move authorship to operator Configuration libraries (do not duplicate)
- **new (construct)** — no product surface today; build at prototype fidelity in Tower tokens

Component paths are under `src/app/` unless noted.

### 1.1 Consultant desk

| Vocab surface | Tag | Today | To-spec note |
|---|---|---|---|
| **Board** | exists | `components/BoardPanel.tsx` (+ clients/tasks) | Relabel to vocab; inhabit / phase / halt — no authorship |
| **Client row** | exists | Board client rows in `BoardPanel.tsx` | Keep; join Phase signal / halt affordances per desk-ops |
| **Phase signal** | exists | Phase icons on Board rows | Spec: enough for refusal judgment without rule editors |
| **Contacts** | exists | `components/contacts/*` → `ContactView.tsx` | ContactView still stub-ish (“record sections coming soon”) — densify to inhabit |
| **Imports** | exists | `contacts/*` + `imports/CsvImportFlow.tsx` | Keep as book-connect path; no eligibility authorship |
| **Client Brief** | exists | `ClientView.tsx` narrative + brief | Align language to live-brief / service-eligible (HANDOFF) |
| **Live brief** | exists (partial) | Client Brief / Client Data overlap | Vocab: meeting-grade brief; may promote as Meetings detail block |
| **Engagement record** | exists (partial) | `JourneyTab.tsx` / engagement chronology | Surface as read-only inhabit; not authorship |
| **Client Data** *(pane, not Module in vocab)* | exists | `DataPanel.tsx`, `ClientDataPage.tsx` | Forms vs Manage split per elig/casl handoff; no pack editors |
| **Halt outreach** | new (construct) | No dedicated control | Add contact-scope + book-scope halt (desk-ops); never opens Configuration libraries |
| **Meetings** | new (construct) | **None** | New Module + **Meeting row**; take meeting → Live brief |
| **Meeting row** | new (construct) | — | Under Meetings |
| **Login** | exists | `marketing/pages/LoginPage.tsx`, `LoginForm.tsx` | Already OTP path; plant on canvas for Access leaves |
| **Prepared Workspace** | new (construct) | Narrative only | Activation Module (consultant acts) |
| **Authorize book** | new (construct) | — | Modal on Prepared Workspace |
| **Accept terms** | new (construct) | — | Modal — license + escrow door |
| **License acknowledgement** | new (construct) | — | Block inside Accept terms |
| **Escrow terms** | new (construct) | — | Block inside Accept terms / Commercial mirror |

### 1.2 Engagement contact (firm-branded)

| Vocab surface | Tag | Today | To-spec note |
|---|---|---|---|
| **Opt-in message** | exists (partial) | Journey / touchpoint / portal patterns | Firm-branded CEM; not cold outreach |
| **Consent request** | exists (partial) | Touchpoint / inspector form patterns | Affirmative Agree; CASL triad |
| **Nudge message** / **Nudge form** | exists (partial) | `JourneyTab`, `FormOutputPreview`, touchpoints | Self-reportable only |
| **Silence / Opt out** | new / thin | No first-class silence UI | Construct; honor ≤10bd; enrollment inhibitor |
| **Meeting invitation** / **Booking** | new (construct) | Calendar data exists; no booking surface | Construct at portal fidelity |
| **Loop-closer form** / **Update facts** | new (construct) | — | Meeting-booked capture |
| **Client portal shell** | exists | `client-portal/ClientPortalPage.tsx` | Reassemble as canvas host for contact-facing surfaces |

### 1.3 Operator — house-global (**mostly new**)

| Vocab surface | Tag | Today | To-spec note |
|---|---|---|---|
| **Acquisition & ads** (+ Approach campaigns, Capture strip, Approach instrumentation) | new | How graphs only | Construct house-global Module tree |
| **Activation & forward-deploy** (+ In-flight activations, Forward-deploy, Readiness walkthrough) | new | — | Stages Prepared Workspace for firms |
| **Reference data** (+ Reference tables, Import criteria, Publish version) | new | Constants table fragment under Hub (`ConstantsIndustryTableView`) is a wrong-seat scrap | Construct proper versioned console; absorb constants UI carefully |
| **Configuration libraries** | new (shell) | — | **Authorship home** |
| **Evaluation packs** / **Evaluation pack editor** | new + wrong-seat fragment | Rule outcomes / analysis panes inside Hub Automations | Re-home rule/analysis authorship here |
| **Automation workflows** / **Workflow canvas** | **exists-wrong-seat** | `hub/automation/AutomationWorkflowEditor` (+ canvas, nodes, configs) | **Re-home** into Configuration libraries — do not leave under firm Hub |
| **Engagement templates** / **Agent / sequence editor** | **exists-wrong-seat** | `hub/agent/AgentEditor`, `AgentSequenceEditor` | **Re-home** same way |
| **Oversight** (+ Fleet health, Firm row) | new | — | Cross-firm health |
| **Audit trail** (+ Change event, filters) | new | — | House change accountability |
| **Register & evolution** | new | Register itself is methodology tooling | Canvas may deep-link Theory; product ship has no firm Register |
| **Founder & agency controls** | new | — | Bounds / kill-switch / policy |
| **Customer support** (+ Ticket queue, Ticket, Support context) | new | — | Queue + per-tenancy context |

### 1.4 Operator — per-tenancy (**mostly new**)

| Vocab surface | Tag | Today | To-spec note |
|---|---|---|---|
| **Provision** / **New firm** | new | Seed manifests / auth only | Assisted door |
| **Commercial** / **Escrow status** / **Release control** | new | — | Firm↔Om Coda escrow ops |
| **Firm operations bind** / **Bind packs** / **Armed / Active** | new | — | Bind house packs; arm/active; **Send gates** (consent) live here — not consultant desk |
| **Book readiness** / **Audits** / **Audit run** / **Verdict list** | exists-wrong-seat (partial) | Hub `AuditDetailView` / `AddAuditFlow` | Reachability audits → per-tenancy Book readiness (**re-home** or dual-open; How marks existing-wrong-seat) |
| **Firm health** / sequence & engagement health | new | — | Tenancy slice of Oversight |
| **Activation state** / **Progress** | new | — | Per-firm forward-deploy progress |

### 1.5 Explicit removals / never-sees on consultant desk

After re-home, consultant **Hub must not** host:
- Automation workflow authoring
- Agent / sequence authoring
- Evaluation pack / rule authorship
- Reference-table publishing
- Consent ledger / send-gate configuration (→ Firm operations bind · Send gates)

Consultant Hub either shrinks to inhabit-only remnants or is retired once Meetings + Board + Contacts + activation cover Access/Core/Governance.

---

## 2. Canvas embedding approach

### 2.1 Where it mounts (current reality)

| Piece | Path | Live today? |
|---|---|---|
| Register shell | `register/pages/RegisterPage.tsx` — rail \| Theory \| CT | **Yes** |
| CT panel | `RegisterClickThroughPanel.tsx` | **Yes** — lo-fi stub (+ wiring flow canvas) |
| Artboard stack | `RegisterArtboardCanvas` / `RegisterArtboardFrame` / placeholders | **Present but unmounted** (orphan `RegisterWorkspace`) |
| Holon plant registry | `composer/surfaceRegistry.ts` | Login + board-sidebar plants only — **not** full desk |

**Recommendation:** Make **`RegisterClickThroughPanel` the hi-fi canvas host.** Do not revive the horizontal holon artboard as the primary CT. Optionally reuse `RegisterArtboardFrame` chrome (header, skeleton) as a frame around a scene, but the body is the **real prototype**, not `REGISTER_SURFACE_REGISTRY` lo-fi plants.

### 2.2 Canvas model

Introduce a **Register Prototype Canvas** inside CT:

```
RegisterClickThroughPanel
  header: Click-through · [Consultant desk | Operator] · Hide
  body: RegisterPrototypeCanvas
          ├── ConsultantDeskScene   // AppShell-shaped: BoardPanel + Workspace (Tower tokens)
          ├── OperatorShellScene    // NEW: house-global nav + per-tenancy nav + support
          └── ContactTouchpointScene // portal / CEM surfaces when leaf desk = contact
```

- **Desk switch** already exists (`ctDesk`: consultant | operator). Extend with optional `contact` inhabit when a contact-facing leaf opens (or nest contact scenes under consultant “view as client” — open question §5).
- **Addressing:** each vocab label maps to a `RegisterSurfaceId` + `{ desk, module, modal?, block?, highlightSelector? }`.
- **Mount strategy for exists surfaces:** import real components (`BoardPanel`, `Workspace`, `HubToolDetailView` pieces, `ClientPortalPage`, `LoginForm`) behind a thin **RegisterScene adapter** that:
  - supplies mock/demo data already used by App,
  - accepts `focusedSurfaceId` / `focusSeq` to navigate module + scroll/highlight,
  - disables product-only chrome that fights Register (e.g. full-viewport marketing nav on Login).
- **Mount strategy for new surfaces:** build new modules in `src/app/components/operator/*` and `.../meetings/*`, `.../activation/*` using the same tokens/shell patterns as Board/Hub — then register them in the scene router.

### 2.3 Addressing on the canvas

New catalog (Tower-native — not HQ `SURFACES` copy):

`src/app/register/trace/surfaceCatalog.ts` (name flexible)

```
label: "Board" | "Authorize book" | "Firm operations bind" | …
desk: consultant | operator | contact
scene: consultant-desk | operator-house | operator-tenancy | contact-portal | login
route: { module, modal?, block? }   // scene-local navigation
component?: React component key     // for highlight / mount
status: exists | wrong-seat | new
```

**Law:** every SURFACE-VOCAB label gets a catalog row. If a leaf names something outside vocab → **flag gap**, do not invent silent aliases.

Wrong-seat rows point at the **destination** seat after re-home (e.g. Workflow canvas → Configuration libraries), with a migration note that the component file still lives under `hub/` until moved.

---

## 3. Click-path wiring approach

### 3.1 What happens today

| Mechanism | Behavior |
|---|---|
| How leaf click (Theory / left tree) | Selects node + `revealCt(desk)` — CT shows **stub**, not a surface |
| `TextWithUiRefs` / `UiRefChip` | **Display-only** highlight by UiKind — not clickable |
| SME `ImplementationBlock` | Collapsed text — no navigate |
| `HowUiRef.surfaceId` | Typed, unused |
| HQ pattern (`focusAndOpenCt`) | **Not in Tower** |

### 3.2 What we change

1. **Surface catalog** keyed by vocab Title Case (`On Board` → label `Board`).
2. **`focusSurface(label | surfaceId)`** in a Register Trace/Focus context:
   - resolve catalog row → set `focusedSurfaceId` + bump `focusSeq`
   - `revealCt(row.desk)`
   - scene router navigates module/modal
   - target DOM/`data-register-surface` scrolls into view + accent ring (Tower accent, not HQ purple)
3. **Make chips clickable** in:
   - How leaf drawer (`TextWithUiRefs` when ref has catalog match)
   - SME Implementation body (parse Title Case labels / `implementationAdds` → chips)
4. **Leaf open default:** focus **first** catalog-resolved UI named on the leaf (HQ leaf→first surface), not merely reveal stub.
5. **Hover (optional v1.1):** hover chip → wash/ring without desk switch; click → navigate.

### 3.3 Parsing click-paths

Implementation strings use `On {Surface}, you can now…` and `Starting from {Module}`. Resolver:

1. Exact match against SURFACE-VOCAB labels (longest-first).
2. Else match catalog aliases (explicit list only — e.g. historical “Hub Automations” → Workflow canvas wrong-seat alias during migration).
3. Else render as non-clickable text + gap counter for the plan/build log.

---

## 4. Sequencing (shippable steps)

Honest split: **Steps 1–4 desk reassembly / re-home**; **Steps 5–7 operator construction**; Step 0 is wiring scaffolding so every later step is demonstrable via leaf→canvas.

### Step 0 — Canvas host + catalog + chip wiring (foundation)
- Replace CT stub with `RegisterPrototypeCanvas` skeleton (consultant scene can initially mount existing `App`/`BoardPanel`+`Workspace` read-only).
- Land `surfaceCatalog` for all vocab labels (new ones → “unbuilt” empty scene with Title Case chrome — **hi-fi empty module**, not gray lo-fi).
- Wire `focusSurface` + clickable chips from How leaves + Implementation.
- **Exit:** click `On Board` in a leaf → Board focuses on canvas.

### Step 1 — Consultant desk revision (exists)
- Board / Contacts / Client Brief / Client Data / Engagement record → vocab + HANDOFF inhabit rules.
- Strip or hide authorship entry points from firm shell (deep links to Hub editors gated/removed).
- Add **Halt outreach** (contact + book).
- **Exit:** Core/Governance leaves that name Board / Halt / Brief resolve to real UI.

### Step 2 — Hub → Configuration libraries re-home (wrong-seat)
- Move mount of `AutomationWorkflowEditor` / `AgentEditor` (and rule/analysis fragments) under Operator → Configuration libraries scenes.
- Consultant Hub no longer opens those editors.
- Audits → Book readiness (per-tenancy) per How `existing-wrong-seat`.
- **Exit:** leaf `On Workflow canvas` opens operator desk, not firm Hub.

### Step 3 — New consultant surfaces
- **Meetings** + Meeting row + Live brief attach.
- **Prepared Workspace** + Authorize book + Accept terms (+ License acknowledgement, Escrow terms).
- Login scene on canvas for Access leaves.
- **Exit:** consultant-core / access / governance How leaves all resolve.

### Step 4 — Contact-facing touchpoints
- Reassemble portal + CEM surfaces to vocab (Consent request, Nudge form, Silence, Booking, Loop-closer).
- **Exit:** contact-* How leaves resolve on canvas.

### Step 5 — Operator house-global (construct)
- Shell nav: Acquisition · Activation · Reference data · Configuration libraries · Oversight · Audit trail · Register & evolution · Founder controls · Support.
- Priority build order inside this step: **Configuration libraries** (already partially fed by Step 2) → Reference data → Activation & forward-deploy → Acquisition & ads → Oversight / Audit / Support / Founder.
- **Exit:** operator house-global How leaves resolve to real modules (even if some blocks are thin).

### Step 6 — Operator per-tenancy (construct)
- Provision · Commercial · Firm operations bind (**Send gates**) · Book readiness · Firm health · Activation state.
- **Exit:** bind / readiness / commercial leaves resolve; consent gates demonstrably not on consultant desk.

### Step 7 — Spec corrections pass (HANDOFF absorb in UI)
- Walk HANDOFF PM bullets against mounted surfaces; fix copy, never-sees, confidence tiers, CASL triad, service-eligible language.
- Gap report: any vocab label still unbuilt or any leaf chip still unresolved.
- **Exit:** leaf→canvas coverage report; room sign-off.

---

## 5. Risks and open questions

### Risks

1. **Operator scope is large.** Calling this “reassembly” would lie — Steps 5–6 are net-new product UI. Mitigation: ship hi-fi module shells early (nav + empty states + Title Case), then densify by How-leaf priority.
2. **Hub re-home fights App IA.** Today `PRIMARY_NAV` is board/contacts/hub. Removing authorship from Hub will feel like deleting the product’s densest editors unless Operator scene is ready the same milestone (Step 2 depends on Step 5 shell existing — **sequence tweak:** land Operator shell chrome at start of Step 2 before moving editors).
3. **Embedding AppShell inside CT** risks double-providers, auth, and layout height bugs. Prefer scene adapters over nesting full `App.tsx`.
4. **Vocab vs Hub names.** Leaves and old UI still say “Hub Automations.” Alias table required during migration; delete aliases when re-home done.
5. **Contact desk host.** Portal is an overlay today, not a nav desk. Need a clear canvas scene so contact leaves don’t hijack consultant Board.
6. **Register & evolution on canvas** is meta (Register inside Register). Likely deep-link Theory / Gaps panel rather than a second Register app — confirm.
7. **Wiring flows** currently steal CT for React Flow. Keep a temporary mode or move wiring visualization so it doesn’t displace the prototype canvas.

### Open questions (need room decisions before build)

| # | Question | Suggestion |
|---|---|---|
| Q1 | Does consultant nav keep a Hub icon after re-home, or only Board / Contacts / Meetings? | Drop Hub from firm primary nav; Audits inhabit via Book readiness on operator; firm sees verdicts on Board/Contacts only |
| Q2 | Operator canvas: one shell with house-global \| per-tenancy \| support switchers, or three top-level CT desks? | One Operator desk with internal IA matching personas.md split |
| Q3 | Contact-facing: third CT desk tab vs “View as client” inside consultant scene? | Third mode or explicit scene switch from contact leaves — avoid burying CEM behind Board overlay only |
| Q4 | Unbuilt surfaces during Steps 0–4: hi-fi empty module vs block chip until built? | Hi-fi empty module with vocab title + “Constructing” — still addressable |
| Q5 | Do we mount Login/marketing chrome on canvas or a stripped LoginForm scene? | Stripped LoginForm scene in Tower tokens |
| Q6 | Should Step 2 (re-home) block on Operator shell (Q2), or temporarily mount editors under CT Operator tab without full IA? | Minimal Operator shell first, then move editors — don’t leave a week where authorship lives nowhere |
| Q7 | Artboard holon plants (`REGISTER_SURFACE_REGISTRY`) — delete, keep for Components pass, or ignore? | Ignore for CT; keep for Components/Console mirror until separately decided |

---

## 6. What we will not do in the build phase

- No new lo-fi gray CT design system
- No HQ palette / `ctPalette` adoption
- No inventing surface names outside SURFACE-VOCAB without flagging a gap
- No putting pack/sequence/automation editors back on the consultant desk “for convenience”
- No surface edits until this plan is approved

---

## 7. Immediate next step after approval

Start **Step 0** (canvas host + catalog + chip→focus wiring) with Board as the first resolved surface, and land a minimal Operator shell chrome so Step 2 re-home has a destination.

**Stop here — awaiting go.**
