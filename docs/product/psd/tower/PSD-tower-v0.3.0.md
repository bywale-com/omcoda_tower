---
psd_id: PSD-tower-v0.3.0
scope: tower
version: 0.3.0
status: current
supersedes: PSD-tower-v0.2.0
as_of: 2026-06-18
authors:
  - Wale Omotayo
build: passing
related:
  - docs/product/PRODUCT-STATE-GUIDE.md
  - docs/product/psd/tower/PSD-tower-v0.2.0.md
  - docs/product/systems-register.md
  - docs/ideas/tower-product-vision.md
  - docs/product/console-state.md
  - docs/product/engagement-chart-gantt-decisions.md
---

# Tower — Product State v0.3.0

> Tower remains a **client-side immigration engagement prototype**, now with a **repo-native Systems Register** (`/register`) that maps holons, infrastructure nodes, and **behavioral flows** as data — starting with **Login (email OTP)** from UI trigger through Auth Service, Supabase tables, and Resend.

---

## 0. Document control

| Field | Value |
|-------|-------|
| **PSD ID** | `PSD-tower-v0.3.0` |
| **Scope** | Whole product (`tower`) |
| **Supersedes** | [`PSD-tower-v0.2.0`](./PSD-tower-v0.2.0.md) |
| **As of** | 2026-06-18 |
| **Build** | `npm run build` passing |
| **Guide** | [`PRODUCT-STATE-GUIDE.md`](../../PRODUCT-STATE-GUIDE.md) |

---

## 1. Executive snapshot

**Product:** Tower — proactive eligibility + engagement platform for immigration firms (prototype).  
**Primary user:** Immigration consultant / firm operator.  
**Core loop (today):** Partially demonstrated — **Contacts → Audit → Agent sequence → Automation enrollment → Client engagement chart**. No live rule engine or backend.

### 1.1 Maturity at a glance

| Surface | Maturity | One line |
|---------|----------|----------|
| Shell (nav, tabs, panels) | **High** | Four-column layout, resizable Console/detail, theme toggle |
| Board (clients + tasks) | **High** | 10 clients, phase tooltips, task → activity focus |
| Client details + Activity | **High** (Sarah/Marcus) | Brief + Client Data + Journey/engagement chart |
| Contacts directory | **Medium** | List wired; contact tab body stub |
| Hub → Audits | **High** (mock) | Create, run gates, open complete audit, reachability table |
| Hub → Agents | **Medium** | Sequence editor (email + task steps), holon registry |
| Hub → Automations | **Medium** | React Flow workflow editor, build palette, edge insert |
| Console / holon register | **High** registry | Hover highlight + reveal; agent + automation holon trees |
| **Systems Register** (`/register`) | **Medium–High** | Components tree + flow canvas + **Login flow map** (data-driven wires) |
| **Marketing Login** (`/login`) | **Low–Medium** | Passwordless OTP UI; handlers stubbed (no API) |
| CSV import UX | **Medium** | Full dialog; **does not** mutate import list |
| Backend / persistence | **None** | All seed + in-memory session state |

### 1.2 Top 3 truths right now

1. **Everything runs in the browser** — seed files + React context; refresh loses in-session edits.
2. **The Login behavioral map is repo-native data** — `src/app/register/flows/` is the source of truth the register canvas renders; shareable with agents as a systems map.
3. **Architecture is modeled before infra** — Consultant Web App (in-app) vs Auth Service (Tower-owned) vs Resend/Supabase (external/platform), with table schemas on canvas.

### 1.3 Top 3 limits right now

1. **No API, auth, or firm account model** — `LoginForm` stubs OTP send/verify; Auth Service is not implemented.
2. **Register flows are read-only maps** — wires document behavior; they do not execute or sync to Icepanel automatically.
3. **Agent/automation edits remain session-only** — unchanged from v0.2.0.

---

## 2. Product position

Unchanged strategic position — see [`tower-product-vision.md`](../../../ideas/tower-product-vision.md).

**New in v0.3.0 prototype:**

- **Systems Register flows panel** — tree like Components; hover/click drives canvas focus
- **Login flow** — parent flow + composite steps (Send OTP, Verify OTP) with numbered wires (`flowOrder`), metadata popovers, and infrastructure nodes
- **Marketing `/login`** — two-step email OTP card (sign-in → verify); no password
- **Icepanel-aligned objects** — Auth Service, Firm Data Store (Supabase), Email Provider (Resend) referenced in register + `icepanelLinks.ts`

**Still not claimed:**

- Live Auth Service, Supabase writes, Resend delivery, firm tenancy, production CRM sync

---

## 3. Shell & navigation

Unchanged from v0.2.0 §3 for consultant shell (`/`).

**New routes:**

| Route | Surface | Gate |
|-------|---------|------|
| `/login` | Marketing login card | Public |
| `/register` | Systems Register | Password (`registerAuth`) |

---

## 4. Surfaces (detailed)

Sections **4.1–4.6** unchanged from v0.2.0 (Board, Workspace, Client Data, Contacts, Hub, Console). See [`PSD-tower-v0.2.0`](./PSD-tower-v0.2.0.md) for full detail.

### 4.7 Systems Register — **Medium–High**

**Purpose:** Repo-native **systems map** — holons in view context, plus **behavioral flows** as data the canvas renders.

**Entry:** `/register` (password gate).

**Layout**

| Region | Content | Status |
|--------|---------|--------|
| Left — Components | Holon inventory tree (catalog + runtime) | **Implemented** |
| Left — Flows | Flow → step tree (e.g. Login → Send OTP, Verify OTP) | **Implemented** |
| Right — Canvas | React Flow: view artboards + system/table nodes + flow wires | **Implemented** |

**View artboards (composer)**

| View ID | Title | Status |
|---------|-------|--------|
| `board-clients` | Board · Clients | **Implemented** |
| `login-sign-in` | Login · Sign in | **Implemented** |
| `login-verify` | Login · Verify | **Implemented** |

**Infrastructure nodes (reusable on canvas)**

| Node | Kind | Logo | Status |
|------|------|------|--------|
| Consultant Web App | App | Tower | **Implemented** |
| Auth Service | Service | Tower | **Implemented** |
| Resend | Provider | Resend | **Implemented** |
| Supabase | Database | Supabase | **Implemented** |

**Table nodes (schema cards)**

| Table | Domain | Status |
|-------|--------|--------|
| `firms` | Tenancy (green header) | **Implemented** |
| `users` | Tenancy | **Implemented** |
| `otp_challenges` | Auth (orange header) | **Implemented** |
| `sessions` | Auth | **Implemented** |

**Flows panel behavior**

| Interaction | Canvas effect |
|-------------|---------------|
| Hover / click **Login** | Full flow — all wires from Send OTP + Verify OTP |
| Hover / click **Send OTP** | Composite slice — steps 1–4 (+ unnumbered Supabase host wire) |
| Hover / click **Verify OTP** | Composite slice — steps 5–9 (+ resend branch) |
| Click empty canvas | Clears pinned flow/step |

**Wire UX**

- **Numbered badges** above wires (`flowOrder`: step + optional suffix `a`, `b` for parallel sisters)
- **Badge or line hover** → solid accent wire + metadata popover
- Popover header: badge + **source → target** labels (not redundant “Step N” text)
- Popover body: Out / When / Via / In (when transformed)

**Login flow sequence (numbered, full flow)**

| Step | Hop |
|------|-----|
| 1 | Log In → Consultant Web App (in-app) |
| 2 | Consultant Web App → Auth Service (`POST /auth/otp/send`) |
| 3a–3d | Auth Service → firms / users / `otp_challenges` / Resend (parallel) |
| 4 | Auth Service → Consultant Web App (advance to verify view) |
| 5 | Verify Email Address → Consultant Web App (in-app) |
| 6 | Consultant Web App → Auth Service (`POST /auth/otp/verify`) |
| 7a–7b | Auth Service → `otp_challenges` / `sessions` (parallel) |
| 8 | Auth Service → Consultant Web App (session → Board) |
| 9a–9b | Resend branch (solid wires, alternate path during verify) |

Supabase → table “hosted by” wires are **unnumbered** (infrastructure context).

**Design rules (encoded in flow data + canvas)**

- **In-app logic** lives in wire metadata under **Consultant Web App** until the app crosses a boundary.
- **Auth Service** is Tower-owned backend — not inside the React app.
- **Table writes** document which columns cross each wire.

**Deep doc:** [`systems-register.md`](../../systems-register.md) (holon registration workflow; partially predates flows panel).

### 4.8 Marketing Login (`/login`) — **Low–Medium**

**Purpose:** Passwordless consultant sign-in UI — prototype for assisted onboarding (firm provisioned before first login).

**Entry:** `/login` → `LoginPage` → `LoginForm`.

| Step | UI | Handler | Backend |
|------|-----|---------|---------|
| Sign in | Email + Log In | `handleEmailSubmit` | **Stub** (400ms delay) |
| Verify | Code + Verify Email Address | `handleVerifySubmit` | **Stub** |
| Branches | Resend, Change email | `handleResendCode`, `handleChangeEmail` | In-app / stub |

On stub success, verify step shows in-card; verify success navigates to `/` (consultant shell).

**Holons:** `login-form`, email field, submit controls, verify field — registered via `HolonBoundary` + `loginRegisterMeta`.

**Not implemented:** Real Auth Service client, session cookie, firm scoping, error paths for unprovisioned email.

---

## 5. Domain modules

### 5.1–5.7

Unchanged from v0.2.0 (Audit, Sequence/engagement, Import, Rule engine, Agents, Automations).

### 5.8 Systems Register flows (new)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Behavioral systems map — what crosses which boundary, in what order |
| **Entry** | `/register` → Flows panel |
| **Source of truth** | `src/app/register/flows/` (+ `systems/registry.ts`, `tables/registry.ts`) |
| **Shareable bundle** | `flows/*`, `systems/registry.ts`, `tables/registry.ts` — sufficient for agents to read the map |
| **Execution** | **None** — documentation surface only |
| **Persistence** | Node positions in `localStorage`; flow definitions in repo |

### 5.9 Auth (planned, UI stub only)

| Aspect | Detail |
|--------|--------|
| **v1 model** | One firm, one login; email OTP only; consultant-only (no client portal) |
| **Auth Service** | Tower-hosted; OTP generate/verify, sessions; firm-scoped |
| **Firm Data Store** | Supabase/Postgres — `firms`, `users`, `otp_challenges`, `sessions` |
| **Email** | Resend (or equivalent) for OTP delivery |
| **Icepanel** | Objects + ADR-004 spec; MCP sync in `icepanelLinks.ts` |
| **Live implementation** | **Not started** |

---

## 6. Data & persistence

### 6.1 Persistence model

| Layer | Persists? |
|-------|-----------|
| Seed TS modules | Static in repo |
| **Register flow definitions** | **Repo** (TypeScript) |
| Register node positions | `localStorage` |
| `AuditContext` | Session |
| Agent / automation edits | Session |
| Login OTP state (`LoginForm`) | Session (React state) |
| API / DB | **None** |

### 6.3 Key files (additions since v0.2.0)

| File | Role |
|------|------|
| `register/flows/loginSendOtpStep.ts` | Send OTP canvas wires + graph |
| `register/flows/loginVerifyOtpStep.ts` | Verify OTP canvas wires + graph |
| `register/flows/index.ts` | `LOGIN_FLOW`, `REGISTER_FLOWS` |
| `register/flows/types.ts` | Wire schema, `flowOrder` |
| `register/systems/registry.ts` | App/service/provider nodes |
| `register/tables/registry.ts` | Table schema cards |
| `marketing/components/LoginForm.tsx` | Passwordless login UI (stub) |
| `marketing/pages/LoginPage.tsx` | `/login` route |

All v0.2.0 seed files remain — see v0.2.0 §6.3.

---

## 7. UX & visual system (product-relevant)

| Topic | Behavior |
|-------|----------|
| **Register flow wires** | Dashed default; solid + thicker + accent on focus |
| **Step badges** | Black circle, white number; blue border on hover |
| **Table cards** | Colored header (tenancy green, auth orange) + `field: Type` list |
| **System pills** | Tower / Resend / Supabase logos left of kind label |
| v0.2.0 topics | Soft buttons, agent rail, automation canvas — unchanged |

---

## 8. Known limitations & debt

| # | Limitation | Tag |
|---|------------|-----|
| 1 | No backend | `[Arch]` |
| 2 | Login handlers stubbed — no Auth Service | `[Arch]` |
| 3 | Register flows not synced to Icepanel flows UI automatically | `[Doc]` |
| 4 | CSV import does not append to `importList` | `[Data]` |
| 5 | Agent/automation Save/Launch not wired | `[UX]` |
| 6 | Register holon registration still multi-file (5-step workflow) | `[Arch]` |
| 7 | v0.2.0 debt items still open | see v0.2.0 §8 |

---

## 9. Open decisions

v0.2.0 decisions O-01–O-08 remain open.

| ID | Question | Options |
|----|----------|---------|
| O-09 | Auth Service implementation host | Vercel functions vs dedicated API service |
| O-10 | Session shape | HTTP-only cookie vs bearer token |
| O-11 | Register as agent input | Flow TS only vs generated JSON export |

---

## Δ. Changes since PSD-tower-v0.2.0

**Previous PSD:** [`PSD-tower-v0.2.0`](./PSD-tower-v0.2.0.md) (2026-06-18).

### Added

- **Systems Register flows panel** — Login parent + Send OTP / Verify OTP composite steps
- **Data-driven canvas wires** — `canvasWires[]` with `flowOrder`, Out/When/Via metadata
- **Infrastructure nodes** — Consultant Web App, Auth Service, Resend, Supabase
- **Table schema nodes** — `firms`, `users`, `otp_challenges`, `sessions`
- **Wire UX** — numbered badges, line/badge hover, popover with endpoint labels
- **Marketing `/login`** — passwordless two-step `LoginForm` (stubbed)
- **Flow label resolver** — `flowWireEndpointLabels.ts` for popover headers

### Changed

- Systems Register maturity: **in progress → Medium–High** (flows + login map shipped)
- `systems-register.md` remains holon-focused; flows documented in this PSD

### Unchanged (still accurate from v0.2.0)

- Board, Client Data, Contacts, Hub (Audits/Agents/Automations), Console, engagement chart

---

## 10. Next expected state (v0.4.0 candidates)

Likely **MINOR** bump when:

- Auth Service + Supabase tables implemented; `LoginForm` wired to real API
- Second register flow (e.g. CSV import) with same wire/metadata pattern
- Firm provisioning path documented end-to-end

Likely **PATCH** bump for:

- Register / Login screenshots in Appendix D
- Icepanel flow sequence created to match ADR-004
- Export flow definitions as JSON for external agents

---

## Appendix A. Technical inventory (additions)

### Systems Register / flows

| Piece | Path |
|-------|------|
| Flow registry | `register/flows/index.ts` |
| Send OTP step | `register/flows/loginSendOtpStep.ts` |
| Verify OTP step | `register/flows/loginVerifyOtpStep.ts` |
| Wire types | `register/flows/types.ts` |
| Focus + wire aggregation | `register/flows/flowFocus.ts` |
| Endpoint labels | `register/flows/flowWireEndpointLabels.ts` |
| System nodes | `register/systems/registry.ts` |
| Table nodes | `register/tables/registry.ts` |
| Canvas wires UI | `register/canvas/RegisterCanvasFlowWires.tsx` |
| Flows tree | `register/components/RegisterFlowsTree.tsx` |
| Selection context | `register/context/RegisterSelectionContext.tsx` |

### Marketing login

| Piece | Path |
|-------|------|
| Login page | `marketing/pages/LoginPage.tsx` |
| Login form | `marketing/components/LoginForm.tsx` |
| Holons | `components/docs/loginHolons.ts` |
| Register meta | `components/docs/registerMeta/loginRegisterMeta.ts` |

---

## Appendix B. Verification checklist

Author verified on **2026-06-18**:

- [x] `npm run build` exits 0
- [x] `/register` — password gate, Components tree, Flows tree
- [x] Hover **Login** — full numbered wire set on canvas
- [x] Hover **Send OTP** / **Verify OTP** — composite slices with correct step numbers
- [x] Badge hover — popover shows step badge + source → target + metadata
- [x] Line hover — solid accent wire + same popover
- [x] `/login` — email step → verify step (stub); no network
- [x] v0.2.0 Hub Agents/Automations flows (assumed unchanged)

---

## Appendix D. Screen captures

v0.1.0 gallery in [`screenshots/`](./screenshots/) — still valid for Board, Hub, Audits, Contacts, Console, Sarah engagement.

**Not yet captured:** Systems Register flow canvas, Login flow wires, Marketing `/login`. Target for v0.3.1 PATCH.
