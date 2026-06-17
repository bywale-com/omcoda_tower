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
