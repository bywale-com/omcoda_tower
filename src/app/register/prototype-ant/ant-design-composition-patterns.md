/**
 * Ant Design composition patterns — Tower Design-stage translate (Phase 2).
 *
 * Evidence basis: Ant Design Layout / Menu / Table / Modal / Drawer / Form / Tabs /
 * Steps / Result docs (ant.design). Confidence labels: high = documented demo/API;
 * medium = consistent across ≥3 product patterns in Ant docs; low = inferred.
 *
 * Complements ant-design-semantic-tokens (paint). This file constrains structure.
 */

# Ant Design composition patterns (Tower)

## Core philosophy

1. **Layout is the product frame.** Prefer `Layout` with fixed `Header` + collapsible `Sider` + `Content` for connected multi-persona desks. Confidence: **high** — Layout demos (Sider / Fixed Sider / Header-Sider).
2. **One denser work surface.** Living entity indexes → `Table` (+ toolbar `Space` / `Input.Search` / filters). Avoid card grids as the primary index. Confidence: **high** — Table as Ant’s default dense data pattern.
3. **Layering via tokens, not card stacks.** Page = `colorBgLayout`; work surface = `colorBgContainer`; overlays = `Modal` / `Drawer` / `Dropdown` on `colorBgElevated`. Confidence: **high** — token archaeology + Layout bodyBg.
4. **Progressive disclosure.** Row → `Drawer` (medium detail) or `Modal` (short confirm / small form) or full content page under shell (heavy multi-section). Prefer one primary work surface. Confidence: **medium** — Modal/Drawer usage + Form page demos.
5. **Workflows stay object-centric.** Index → object / focused flow → return. Multi-step short flows → `Steps` inside `Modal` or page; do not invent parallel board chrome unless Register requires it. Confidence: **medium**.
6. **Empty / Result are first-class.** Honest empties → `Empty`; terminal outcomes → `Result`. Confidence: **high**.
7. **Navigation levels.** Product nav in `Sider` `Menu` (grouped); peer tabs inside a module → `Tabs`; persona switch is shell-level (`Segmented` in Header), not buried in content. Confidence: **high** for Menu/Tabs; **medium** for Segmented as persona switch (product choice).
8. **Content inset is mandatory.** ModulePage owns ≥16px inset; primary table identity columns (Contact/Client) stay flexible + ellipsis; status Tags get their own column; index|detail uses `Splitter`. See [SPACING.md](./SPACING.md). Confidence: **high** — product law from CT review.

## Decision table (Tower jobs → Ant)

| Job | Prefer | Avoid |
| --- | --- | --- |
| Whole-product frame | `Layout` Header + Sider + Content | Per-persona one-off chrome that breaks congruence |
| Persona switch | Header `Segmented` (Consultant / Operator / Contact) | Separate apps without shared shell |
| Living entity index | `Table` + toolbar | Card grid as primary index |
| Status on a row | `Tag` / `Badge` | Advertising admission gates as decision chrome |
| Object detail (medium) | `Drawer` | Always-on dual pane fighting the index |
| Object detail (heavy) | Content page + `Tabs` | Modal for long enrich tables |
| Short create / confirm | `Modal` (incl. `Modal.confirm` for destructive) | Full page for name-only create |
| Multi-step hard inputs | `Steps` + `Modal` or inline Form | Nested modals |
| Filters | `Select` / `Space` toolbar + Table filters | Ad-hoc chip piles without Table coupling |
| Kill / halt / silence | Danger `Modal` + required reason | Inline destructive without confirm |
| Theme | `ConfigProvider` + `theme.algorithm` (own storage key) | Shared theme key with source plant |

## Do not fabricate

- Do not invent Function during composition — rearrange Register leaves only.
- Do not invent Ant tokens flagged as gaps in archaeology (e.g. enumerated dark hex tables).
- Do not import Ant CSS into the source Register SPA entry.

## Ambiguities (escalate)

1. **Tower brand vs Ant `colorPrimary` default `#1677ff`** — queued; remake uses Ant seed until human picks brand.
2. **Contact portal as light Sider vs top Tabs** — Contact has few surfaces; Sider keeps shell congruence with Operator density. Confidence medium.
3. **Hub Automations canvas** — full React Flow canvas is Function; Ant remake keeps canvas affordance as content region + Ant chrome around it, or Table+Drawer summary if canvas package stays shared. Prefer preserving canvas door over dropping it.
4. **wireframe: false** (default) — Modal chrome uses margin, not bordered wireframe.

## Orchestrator handoff

Resolve each screen’s components via `omcoda-design-orchestrator` + `ant-design-semantic-tokens`.
