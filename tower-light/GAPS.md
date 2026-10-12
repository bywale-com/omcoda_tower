# GAPS

Honesty about completeness. **Do not treat an undetected pattern as proof of absence** outside a successfully scanned bucket.

## Completeness (separate claims)

| Claim | Result |
|---|---|
| File-scan completeness | **1081** listed on `origin/main` @ `48d4511`. **730** scanned. **351** excluded (docs + assets + lockfile). **0** parse failures. |
| Syntax-inventory coverage | AST on **666** JS/TS/TSX/MJS files. Catalogue maps pedagogical IDs, not every `SyntaxKind`. Trivia (`Identifier`, `StringLiteral`) is not a construction. |
| Third-party API coverage | Import graph + usage. **111** non-relative modules. Dynamic `import("twilio")` recorded as an import, not as a static call graph. |
| Configuration coverage | package.json, tsconfig, vite.config.ts, vercel.json, Docker/systemd, GitHub Actions, env examples, PostCSS, pnpm-workspace, .gitignore. |
| Teaching-app coverage | Proposed only (see APPLICATION.md). **Not implemented. Not measured.** |

This is **not 100%**.

## Recon vs product

Recon **does not contain** Tower `src/`, `server/`, `api/`, `scripts/`, `supabase/`. The scan used a worktree of `origin/main`. If `main` moves, re-run `tools/scan.mjs`. This folder can drift.

## Dynamic / unresolved

| Item | Why |
|---|---|
| `await import("twilio")` | Static import hits = 1; call graph of `twilio(sid,token)` is behind a Promise. Contract read by hand in `server/wire-service/twilioClient.ts`. |
| `computed-index` (`obj[expr]`) | **472** hits / 135 files. Cannot name the property from the AST. Includes wire `ports[name]`, JSON maps, array indexes. |
| `vite.config.ts` `figma:asset/` resolver | Custom plugin; stringly module ids. Asset aliases are not TS imports of the library. |
| `import.meta.env.*` keys | Vite `define` injects four flags; other `import.meta.env` reads exist. Not every key is in `.env.example`. |
| Process env keys | `.env.example` is the authored list; code may read others. A full `process.env.X` key inventory was not dumped as constructions (that would be names, not mechanisms). |
| String-built SQL | Parameterized `$n` is the house style; some scripts concatenate. Not every SQL string in `.ts` was parsed as SQL (only `.sql` files + `$n` regex). |
| JSX member tags `Foo.Bar` | Counted as JSX-component when the tag contains `.`. Fine-grained `Typography.Text` lives in the Ant family, not a separate language ID. |

## Deliberate non-claims

| Pattern | Status |
|---|---|
| `enum` | **0** `EnumDeclaration`. Claimed absent in scanned TS. |
| `interface` | **0** `InterfaceDeclaration`. House style is `type`. |
| `CREATE FUNCTION` / triggers | **0** in SQL files. |
| Generators / `yield` / `for await` | Not in the syntax rollup. Treated as unused in authored source. |
| `var` | Not in the rollup (const/let only). |
| Decorators | Not detected. |
| Vitest / Jest / Playwright / ESLint / `tsc` in scripts | Absent from package.json scripts. Verification is `tsx` scripts + `npm run build`. |
| Next.js | Not a dependency. `next-themes` is a leftover around sonner. |

## Unused declared packages

Declared in `package.json`, **zero authored imports** (scan):

`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `@popperjs/core`, `canvas-confetti`, `date-fns`, `motion`, `react-dnd`, `react-dnd-html5-backend`, `react-popper`, `react-responsive-masonry`, `react-slick`.

**False “unused” from import-only scan** (used via CLI/CSS/config, not `import`):

- `tsx` — CLI in scripts
- `tailwindcss` — `@import "tailwindcss"` and `@tailwindcss/vite`
- `tw-animate-css` — CSS `@import` in `src/styles/tailwind.css`
- `@types/*` — compile-time only

**Imported but dead on the product face:** `sonner` + `next-themes` (Toaster not mounted on CT); `react-hook-form` (only `ui/form.tsx`, no importers).

## Hub vs product face

Two UI stacks are real constructions:

- **Ant** + `@ant-design/icons` — `/prototype-ant` (product)
- **Radix / shadcn / lucide** — Hub (`/hub`)

ONE BIT takes Ant. Hub primitives are **EXCLUDE-*** so they do not silently disappear and do not force a second kit.

## Two identifier grains

Auth `firms.id` is **UUID**. CT/machine `firm_id` is often **TEXT** (`firm-cedar`). That is a Tower fact (`ARCH-two-id-grains` / `GAP-two-grains`). The teaching app should **not** copy it.

## Register theory / system-map data

Large `src/app/register/theory/**` TS files are data-as-TypeScript (prose graphs). They inflate `const` / `as const` / union counts. They are scanned (they are authored TS) but they are **not** extra mechanisms. Do not turn them into lessons.

## What would raise completeness later

1. Re-scan after `main` moves; diff `evidence/`.
2. Resolve Twilio (and any other `import()`) with a post-await call graph.
3. Parse SQL strings inside `.ts` (pg `query(\`...\`)`) as SQL, not only `.sql` files.
4. Extract every `process.env` / `import.meta.env` key into a named list (names, not new mechanisms).
5. Measure the teaching app against the matrix once it exists.

Until (5), teaching-app coverage is a **proposal**, not a pass.
