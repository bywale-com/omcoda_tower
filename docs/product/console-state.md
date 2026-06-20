# Console — State Document

**Project:** Tower  
**Surface:** Console / Visual Register  
**Status:** Foundation shipped (June 2026)  
**Audience:** Product, design, engineering — anyone extending the shell or domain holons

---

## 1. What it is

Console is a **live visual register** embedded in Tower. It sits beside the consultant’s working shell (board, workspace, status bar) and answers two questions at once:

1. **What is this region called?** — functional names (Client Brief, Board Body, Client Data Header), not React component filenames.
2. **Where does it live?** — hover a tree row and the matching surface in the live app receives an accent inset ring.

The mental model is **holons**: bounded UI regions that map to real surfaces. Console is not a separate wiki or Storybook; it is an index that **grounds names in the running product**.

Console opens from the **document icon** in the primary navigation strip. A resizable left column (`DocsPanel`, default 280px, 200–480px) shows:

- **Home** — conceptual branches (Learning, Softwares, Tools, Inspiration, Brain Dump). Placeholder today; not wired to holons.
- **Panels** — runtime tree of registered UI holons, built from what is mounted in the app.

Row actions (⋯) on outline rows open **View Details** → resizable **holon detail panel** on the right (`HolonDetailPanel`, content from `holonDetailContent.ts`).

---

## 2. How we got here

### 2.1 Starting point

Tower is function-first: consultants work clients through a VS Code–like shell (activity bar, board sidebar, tabbed workspace, bottom status bar, collapsible client data panel). Domain richness lives underneath — sequences, touchpoints, engagement charts — but the **spatial** layout needed a map first.

Early iteration hand-maintained a flat `panelsRegistry.ts`: each holon required three edits (TypeScript id union, registry row, `useIsDocsTarget` in the component). That proved the hover link viscerally but did not scale and could not express **parent/child** relationships (e.g. Client Data Header → Information → Profile Table).

### 2.2 Design decisions

| Decision | Rationale |
|----------|-----------|
| **Panels vs Home** | Panels = *where* in the shell; Home = *why/concepts* (future cross-links to domain holons). |
| **Functional names** | “Client Brief” not `ClientView`; names describe role in the workflow. |
| **Hover highlight** | Immediate proof of mapping without a separate diagram tool. |
| **Notion icons in tree** | Sidebar and Console tree share Notion SVG set; tint via mask + theme tokens. |
| **Notion in nav & data chrome** | Primary nav, Client Data tab chips, and client header property rows use Notion; Lucide remains for controls (chevrons, menus, close). |
| **Self-reference** | Console Header and Console Registry are holons in the tree — Console documents itself. |
| **Contacts ≠ Clients** | Contacts nav swaps board sidebar content; unsequenced contacts vs sequenced clients; detail in workspace tabs. |

### 2.3 Architecture shift: runtime registry

The current system replaces static registry files with **registration at container boundaries**:

- **`HolonBoundary`** — wrap a region once; registers `{ id, label, icon, parentId, order, inView }`, applies highlight, provides parent context to descendants.
- **`DocsRegistryContext`** — collects registrations, builds nested tree for `DocsPanel`.
- **`DocsHighlightContext`** — `hoveredComponentId` drives inset ring on the matching holon.
- **`HolonDetailContext`** — selected holon for the detail panel (View Details).
- **Parent-owned children** — e.g. `PANEL_CHIPS` + `CLIENT_DATA_TAB_HOLONS` in `clientDataHolons.ts` drive both UI labels and Console tree children; adding a tab updates the tree without editing `DocsPanel`.
- **Pattern holons** — one id for repeating rows (client row, contact row); `registerOnly` in container + `useIsDocsTarget` highlight in live row components.

**Do not** add static panel lists. Cursor rules in `.cursor/rules/` encode this (holon registry, icons, theme tokens).

### 2.4 Visibility and reveal

Not every registered holon is on screen:

- **`inView: true`** — live `HolonBoundary` DOM wrapper (surface rendered).
- **`inView: false`** — `registerOnly` (e.g. inactive tab body still listed under its tab).

On hover, Panels rows show a right-aligned eye:

- **Blue open eye** — in view (indicator only).
- **Gray eye-slash** — not in view; **clickable** to reveal.

**Reveal** calls `focusHolon(id)` → holon’s `onFocus` handler (e.g. switch Client Data tab, `openPanel()` if collapsed, open Activity tab for “Open in Tab”).

---

## 3. Current inventory (Panels tree)

Holons appear when their React subtree is mounted (e.g. client holons only when a details tab is open and data panel expanded).

### Shell chrome

| Holon | Notes |
|-------|--------|
| Primary Navigation | Activity bar strip |
| Console Header / Console Registry | Self-referential Console column |
| Clients Section / Board Body | Sidebar header + scroll list |
| Contacts Section / Contacts Body / Imports Section | Contacts nav view |
| Tab Bar / Workspace Tab / Breadcrumb / Workspace Empty | Workspace chrome |
| Client Header / Client Brief | Client details surface |
| Contact Header / Contact Record | Contact workspace tab |
| Holon Detail Header / Body | Right detail panel when View Details open |
| Status Bar | White inset ring on accent background |

### Client Data (nested proof case)

Under **Client Data Header**:

- **Open in Tab** — Lucide `external-link`; opens Activity workspace tab.
- **Information** → Profile Table  
- **History** → CRS History  
- **Activity** → Engagement Chart (+ engagement list/timeline holons)

Tab chips are always `inView` when the panel is open; tab bodies use `registerOnly` when inactive.

---

## 4. Key files

| Path | Role |
|------|------|
| `src/app/components/DocsPanel.tsx` | Home + Panels UI, recursive holon tree, eye/reveal, View Details |
| `src/app/components/HolonDetailPanel.tsx` | Resizable holon detail column |
| `src/app/components/docs/HolonBoundary.tsx` | Registration + highlight wrapper |
| `src/app/components/docs/holonDetailContent.ts` | Holon article copy (partial — grows per module) |
| `src/app/components/docs/clientDataHolons.ts` | Single source for Client Data tabs + children |
| `src/app/components/docs/contactsBodyHolons.ts` | Contacts/Imports holon metadata |
| `src/app/components/docs/shellHolonOrder.ts` | Top-level holon sort order |
| `src/app/context/DocsRegistryContext.tsx` | Runtime tree + `focusHolon` |
| `src/app/context/HolonDetailContext.tsx` | Detail panel selection |
| `src/app/icons/notion-icon-urls.ts` | Notion slug → URL registry |
| `src/app/components/docs/HolonTreeIcon.tsx` | Notion or Lucide icon in tree rows |
| `.cursor/rules/tower-holon-registry.mdc` | Build conventions |

---

## 5. Typography and tree styling

Console tree reuses scaled constants (`treeLayout.ts`, `treeTypography.ts`) aligned with board sidebar rows: register profile weight, underline offsets on child labels, chevron-after-label on branches. Panel header “Console” uses a fixed 13px label (not tree-scaled).

---

## 6. Extension plans

### Near term (shell completion)

- **Group Panels tree** — Shell / Board / Workspace / Client / Data section headers without flattening 20+ rows.
- **Persist branch expand/collapse** — remember which subtrees are open in Console.
- **More holon detail copy** — fill `holonDetailContent.ts` as modules ship.
- **Contacts holons in Console tree** — register Contacts directory when nav active.
- **Import row click** → workspace tab.

### Medium term (domain register)

- **Home cross-links** — Home entries link to Panels holons and domain concepts (Client, Sequence, Touchpoint).
- **Bidirectional inspect** — modifier + hover live UI → jump to tree row (inverse of today’s hover).

### Longer term

- **Holon schemas** — optional metadata: data sources, projection type, empty states.
- **Instance vs pattern** — document whether a row is a UI pattern or a specific client instance.
- **Codegen guard** — lint rule: new shell container must wrap `HolonBoundary` or declare children in parent config.

---

## 7. Adding a new holon (checklist)

1. Wrap region root in `<HolonBoundary id label icon|lucideIcon order t>`.
2. If it has configurable children, add co-located config (like `PANEL_CHIPS`) and map children in the **parent** — not in each leaf file.
3. Use `parentId` when tree parent ≠ DOM parent.
4. Use `registerOnly` + `onFocus` for off-screen but listed holons.
5. Add Notion slug to `notion-icon-urls.ts` if needed; or `lucideIcon` in `holonIcons.ts` if matching live Lucide.
6. Assign `order` among siblings; use `shellHolonOrder.ts` for top-level shell.
7. For holon articles, add entry to `holonDetailContent.ts`.

---

## 8. Known limitations

- Tree contents **depend on mount state** — holons unregister when unmounted (no tabs → no client holons; collapsed data panel → no Client Data subtree).
- **Holon detail copy is partial** — only holons with `holonDetailContent` entries show full articles; others show placeholder.
- **Viewport scroll** — `inView` means “rendered in React,” not IntersectionObserver visibility in the viewport.
- **Home branch** — placeholder only.

---

## 9. Summary

Console is a **spatial register with hover, reveal, and detail**: names holons, nests them from parent declarations, shows whether each is currently rendered, can focus the UI to off-screen holons, and opens holon articles on demand. Client Data Header is the reference implementation for parent-driven children. Next layers are grouping, fuller holon articles, and domain depth — without returning to manual per-component registry wiring.
