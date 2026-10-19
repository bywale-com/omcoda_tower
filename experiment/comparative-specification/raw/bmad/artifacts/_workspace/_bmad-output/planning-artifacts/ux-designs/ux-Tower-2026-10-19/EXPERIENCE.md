---
name: Tower
status: final
created: 2026-10-19
updated: 2026-10-19
sources:
  - ../../prds/prd-Tower-2026-10-19/prd.md
  - docs/register/personas.md
  - docs/register/AGENTS-FACE.md
  - docs/register/AUTOMATIONS-FACE.md
  - docs/register/PRIMITIVES.md
  - docs/register/PLACEHOLDER-REAL-MAP.md
  - docs/register/PLATE-CHROME-RULE.md
  - docs/register/how/00-INDEX.md
headless: true
skill: bmad-ux
---

# Tower — Experience Spine

DESIGN.md is the visual identity reference. This spine owns behavior. Spines win on conflict with any mock, wireframe, or Hub screenshot.

## Foundation

**Form-factor:** desktop web application (Phase Two inhabit). Mobile/native not specified as V1 desk. `[ASSUMPTION]`

**UI system:** Ant Design 6 on `/prototype-ant` (product face). Older Hub/plant may use other kits; do not translate Hub chrome.

**Seats (named protagonists, not “the user”):**
- **Priya** — Consultant, firm desk.
- **Amira** — Operator, house-global + per-tenancy admin.
- **Jordan** — Engagement contact, firm-branded touchpoints / Contact seat.

## Information Architecture

| Surface | Seat | Purpose |
|---------|------|---------|
| Consultant Board | Priya | Detections / phase indicators keyed by `contact_records.id` |
| Client Details | Priya | Profile, eligibility/CRS-style panes as query results |
| Client Data: Information / History / Activity | Priya | Activity = engagement chronology (tree of outreach, not lineage to trigger) |
| Meetings / live brief | Priya | Booked meetings; facts as agenda |
| Contacts (consultant) | Priya | Book inhabit; authorize/import |
| Operator → Configuration libraries → Agents | Amira | Sequence canvas, Settings, Contacts/enroll |
| Operator → Configuration libraries → Automations | Amira | Blank DAG canvas, Runs, Settings (global/local is event grain, not a fake Settings-as-Agents-copy) |
| Evaluation packs / Reference / Bind | Amira | House authorship + per-tenancy bind |
| Provision, Book readiness, Firm health, Commercial, Activation state | Amira (per-tenancy) | Tenancy ops |
| Acquisition, Oversight, Audit trail, Founder controls, Support | Amira (house-global) | Agency ops |
| Register | House only | Not in shipped firm product |
| Contact workspace (Now / History) | Jordan | Seat until opt-out (PR #96 packets) |
| Access link / forms / booking | Jordan | Firm-branded, not Om Coda-branded stay |

Hub modules that exist in the repo are **plant**, not IA destinations for the product.

→ Companion plates: `docs/register/AGENTS-UI-BLUEPRINT.md`, `AUTOMATIONS-UI-BLUEPRINT.md`, PR #96 packets. Spine wins on conflict with Hub.

## Voice and Tone

| Do | Don't |
|----|-------|
| “No contacts in this book.” | “Sarah Jenkins is in opt-in.” when the query is empty |
| “Override this” / “Override content” as labeled on the node | “Open the nested graph wizard” |
| “Every write that run made” as the handle | “Audit output field 1 and 2” |
| Module names: Agents, Automations, Contacts | “Sequences,” “Workflows” as nav inventions |
| Empty, honest, specific | Hub-teaching captions as UI copy |

## Component Patterns (behavioral)

- **Node (Agents campaign/channel):** click = configure. Campaign: objective first. Override this reveals channels as wires. Override content expands composer inside the channel. Attempt rules at the grain that owns them (campaign visible; sequence/global in Settings modals).
- **Node (Automations):** click = configure. Kinds include trigger, rule, action, If/Switch, Get, Wait (intended). Adding a node then selecting kind is A27/A28/A26. `⋯` Switch changes **this** Trigger/Action kind — not the Switch node.
- **If / Switch:** paths are wires (IF-SWITCH-PACKET on #96).
- **Mapped box:** value in the box from write-set chips (A31–A32), not a client field catalog.
- **Enroll / Add contact:** header control; scope Every firm (default) or Select from (list opens all selected). Same look on Agents C8 and Automations A19.
- **Run vs Test:** Test provides data on the trigger; Run executes now vs arms the event.
- **Wait:** approval (title + Approver Consultant \| Operator + count + Approve now/later) or duration. Resume **this** run.
- **Lists/tables:** query-backed; empty real.

## State Patterns

| State | UI |
|-------|-----|
| Empty real | Honest empty; no demo rows |
| Copy stub | Named “will live here” only when there is no query yet — not a fake list |
| Armed | Template ready, nothing sending |
| Active | Sequence executing; Activity shows in-flight |
| Silenced | Opted out or never opted in; no new automatic outreach |
| Halt / Kill | Suppress new enroll+send (firm/house control) |
| Waiting (Wait node) | Run parked; occupancy count is this node in this workflow |
| Stand-in port | Must not read as live Meta/escrow fulfillment |

## Interaction Primitives

- Persistent left nav; no reveal-on-click module hunting.
- Click node → inspector/config. Do not require a separate “edit mode” unless a packet says so.
- Drag/wire on canvases for campaign channels and Automations DAG.
- Keyboard: not specified beyond ordinary form/canvas. `[NOTE FOR UX]`
- Confirm destructive halt/kill. Exact modal copy not locked in Seed.

## Accessibility Floor

No WCAG target found in register. Minimum implied by honesty and consent: text that states empty vs populated; opt-out must be possible from contact touchpoints; color is not the only status (armed/active/silenced should be readable as words/chips). **[NOTE FOR UX: no contrast audit packet.]**

Contrast for tokens: Light text `#1e1e1e` on `#ffffff` is fine; Dark `#d4d4d4` on `#000000` is fine. `textDim` `#aaaaaa` on white is a risk for body copy — do not use dim for primary status.

## Key Flows

**UJ-1. Priya inhabits the desk.** Entry: Consultant seat, session firm bound. Path: Board → contact (UUID) → Details/Activity → Meetings. Climax: live brief before the meeting. Resolution: book still query-backed.

**UJ-2. Amira authors and binds.** Entry: Operator → Configuration libraries. Path: Automations blank canvas (event → audit → If on write-set → Agents assign) ; Agents blank sequence (campaign objective → Override this → channels → Override content) ; Publish/Bind to firm. Climax: tenancy runs house packs. Resolution: consultant desk shows the record, not the authoring graph.

**UJ-3. Jordan consents then silences.** Entry: firm-branded SMS/email. Path: consent → form (data-request occupancy = required listing) → later unsubscribe. Climax: tag + halt. Resolution: Consultant Activity shows silenced; no new send.

**UJ-4. ALG stranger.** Entry: Meta feed (live deferred). Path: one tap → seed inputs → continue scroll → prepared workspace (no login) → authorize + escrow. Climax: running. Do not show a thank-you dashboard.

**UJ-5. Amira recovers a tenancy.** Entry: Oversight. Path: fleet health → firm slice → support context. Climax: halt or re-bind. Resolution: audit trail records the house action.

## Inspiration & Anti-patterns

**Inspiration (product-class, from personas.md — not visual clones):** Braze-style HQ-authored journeys tenants run; HubSpot/Salesforce Flow for open-box rules; agency CS with account-context side panel.

**Anti-patterns:** Hub-as-app; demo scenery; caption-as-node; qualify node between campaigns; Settings-copying between Agents and Automations (global/local is the Automations divide); planting Register on the firm desk.

## Responsive & Platform

Desktop web first. Marketing site has a 920px header breakpoint; that is not the desk contract. Contact forms must work on a phone because contacts receive them — **[ASSUMPTION]** form/access-link surfaces are mobile-capable even if the operator desk is not. No packet locks that.
