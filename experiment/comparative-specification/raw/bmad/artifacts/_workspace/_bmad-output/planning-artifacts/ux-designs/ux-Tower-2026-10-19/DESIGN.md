---
name: Tower
status: final
created: 2026-10-19
updated: 2026-10-19
sources:
  - src/app/components/tokens.ts
  - rules.md
  - docs/register/PLATE-CHROME-RULE.md
  - docs/register/AGENTS-UI-BLUEPRINT.md
  - docs/register/AUTOMATIONS-UI-BLUEPRINT.md
  - default_shadcn_theme.css
  - landingpage.md (marketing lockup tokens — not Ant desk)
headless: true
skill: bmad-ux
---

# Tower — Design Spine

## Brand & Style

Two visual worlds exist in the repo and **must not be mixed**:

1. **Product desk (CT Ant / `/prototype-ant`)** — inhabit environment. Neutral white/black surfaces, Inter-class UI (Ant Design 6 + existing token theme `light` / `dark` in `tokens.ts`). Chrome is the live Operator/Consultant/Contact shell. Plates lock that chrome (PLATE-CHROME-RULE): House-global / Per-tenancy / Support sider; libraries + catalog columns; top bar as the live app. Do not invent Home / Inbox / Sequences / BUILD / OPERATE nav.
2. **Marketing / lockup** — Garet + JetBrains Mono, paper `#FAFAF7`, ink `#0A0A0A` (`landingpage.md`). Used for public nav replication, **not** as a license to restyle the Ant desk.

Hub has its own plant aesthetic. Hub is not the app; do not copy Hub chrome onto Ant plates.

Voice of the desk: operational, exact, empty-or-personalized. No celebration empty-states, no Sarah scenery, no “Let’s get engaging!”.

## Colors

Token object `Tokens` (`src/app/components/tokens.ts`). Components must not hardcode visual values (`rules.md`). Semantic exceptions live on the token object.

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `bgPrimary` / `bgSecondary` / `bgTertiary` | `#ffffff` | `#000000` | Surfaces |
| `textPrimary` | `#1e1e1e` | `#d4d4d4` | Body |
| `textMuted` | `#6e6e6e` | `#8a8a8a` | Secondary |
| `textDim` | `#aaaaaa` | `#666666` | Tertiary |
| `textSidebar` | `#525252` | `#b0b0b0` | Nav labels |
| `border` | `#e0e0e0` | `rgba(255,255,255,0.22)` | Rules |
| `accent` | `#4A7BF7` | `#4A7BF7` | Tower read / selection |
| `accentBg` | `rgba(74,123,247,0.08)` | `rgba(74,123,247,0.18)` | Selection wash |
| `amber` | `#8B6CF6` | `#8B6CF6` | Attention (token name amber; value is violet) |
| `success` / `green` | `#16a34a` / `#4A7BF7` | `#16a34a` / `#4A7BF7` | Confirmed vs accent-aliased green |
| `red` | `#dc2626` | `#ef4444` | Destructive |
| `hoverBg` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.06)` | Hover |
| `activeRowBg` | `rgba(74,123,247,0.07)` | `rgba(74,123,247,0.18)` | Active row |

Do not introduce a third palette for Agents/Automations interiors. New ideas paint **inside** the existing workspace.

**[ASSUMPTION]** Light mode is the plate-lock mode (PLATE-CHROME-RULE: “Light mode”). Dark exists as a peer token set; inhabit screenshots are Light.

## Typography

Desk: inherit root font; never set `fontFamily` in components (`rules.md`). Font size/weight may be literal (`12`, `13`, `500`, `600`).

Marketing lockup (not desk): Garet 400/500–800, JetBrains Mono for mobile toggle only (`landingpage.md`).

## Layout & Spacing

Operator configuration: persistent left chrome (house-global / per-tenancy / support) → libraries column → catalog column → editor workspace. Consultant: board/list → client workspace tabs (Details vs Activity). Do not clunky-reveal modules; persistent left nav, modules revealed upfront (THREE-SURFACE-MODEL PM law).

Breakpoints for marketing header (≤920px hamburger) are **not** specified as the Ant desk breakpoint. [NOTE FOR UX: Ant desk responsive behavior is not a locked packet.]

## Elevation & Depth

Shadows conditional on `isDark` (`rules.md`): light `rgba(0,0,0,0.08–0.14)`; dark `rgba(0,0,0,0.3–0.4)`. Borders always `t.border` or `t.borderLight`.

## Shapes

Ant Design controls in the translate face; Radix primitives remain in older plant components. `[ASSUMPTION]` New Ant-face work follows Ant control radii, not a new radius scale. No founder radius token named for Ant.

## Components

Behavioral specs live in EXPERIENCE.md. Visual: Ant Design 6 (`antd` ^6.5.3) on the product face; token theme passed as `t: Tokens`. Canvas graphs use `@xyflow/react` inside the editor workspace, not as app chrome.

Plate interiors (Agents campaign/channel nodes, Automations trigger/rule/action/If/Get/Wait) are specified by UI blueprints and PM packets — **screenshots of live chrome + paint only in the workspace**. Teaching captions on images are not chrome.

## Do's and Don'ts

**Do**
- Lock live Ant chrome before generating a plate.
- Empty real: vacant query → vacant pane.
- Click the node to configure it.

**Don't**
- Copy Hub nav onto Ant.
- Paint demo people so a module looks full.
- Invent a different left nav (Home/Inbox/Sequences/BUILD/OPERATE).
- Treat `⋯` Switch (change kind) as the Switch node.
- Use Garet/paper marketing tokens inside the desk.
