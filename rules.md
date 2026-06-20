# Tower — Component Styling Rules

No component in this codebase hardcodes a visual value.

## Colors

Every color must come from the `t: Tokens` object passed as a prop. No raw hex codes in `style` attributes.

The only exceptions are semantic status colors that are intentionally fixed across both themes — and even those should live in `tokens.ts`:

- `t.red` — destructive actions
- `t.amber` — warnings / attention
- `t.green` — confirmed / completed
- `t.accent` — teal accent / Tower read

## Font family

Never set `fontFamily` explicitly in a component. Use `fontFamily: "inherit"` or omit it entirely. The root font is set once in `App.tsx` and cascades everywhere.

**Exception:** `ClientIcon` SVG elements don't inherit CSS and need an explicit declaration.

## Font size and weight

These can be hardcoded (`12`, `13`, `500`, `600`) since they don't change between themes. Only color-bearing properties go through tokens.

## Shadows

Must be conditional on `isDark`:

- **Light mode:** soft `rgba(0,0,0,0.08–0.14)` shadow
- **Dark mode:** heavier `rgba(0,0,0,0.3–0.4)` shadow

## Borders

Always `t.border` or `t.borderLight`. Never a hardcoded hex.

## Required props

Every component accepts two props:

- `t: Tokens`
- `isDark: boolean`

If a new component is being added, these two props are non-negotiable. `t` covers color decisions. `isDark` covers anything that needs a conditional between the two modes that can't be expressed through a token alone (shadows, gradient fog colors, etc.).

## Token system

The token system lives in `src/app/components/tokens.ts` and exports two objects — `light` and `dark` — both of type `Tokens`.

`App.tsx` selects between them based on state and passes the result down.

**No component imports from `tokens.ts` directly or makes its own theme decision.**

## Sidebar & Console typography

Board sidebar rows, Contacts/Imports directory rows, and the Console tree share scaled dimensions from `treeLayout.ts` and label styling from `treeTypography.ts` (`docsLabelStyle`, `DOCS_FONT_PROFILE` — weight 500, 13px scaled).

Directory lists (Contacts, Imports) use `contacts/directoryRowStyles.ts` for ellipsized primary labels and a fixed-width trailing meta column (`DIRECTORY_ROW_META_WIDTH = 96`).

## shadcn popovers & dialogs

Flyouts beside the sidebar (row actions, Add audit, Add import) and centered dialogs must use **`src/app/components/ui/towerChrome.ts`** — not raw shadcn `text-sm` / `text-xs`. Typography is aligned to the tree via `tower-chrome-*` classes in `src/styles/theme.css`. See `.cursor/rules/tower-shadcn-chrome.mdc`.

## Icons

Notion icons for holon registry, primary nav, board sidebar, and Client Data tab chips. Lucide for interactive controls (chevrons, menus, close buttons). See `.cursor/rules/tower-icons.mdc`.

## Console (holon register)

UI surfaces register via `HolonBoundary` at container boundaries — not static registry files. Console opens from the document icon in the primary navigation strip. See `.cursor/rules/tower-holon-registry.mdc` and `docs/product/console-state.md`.
