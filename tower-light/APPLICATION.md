# ONE BIT — proposed teaching application

**Not implemented.** This is the smallest coherent app that covers the catalogue in [`COVERAGE_MATRIX.md`](./COVERAGE_MATRIX.md).

## Domain

One light. It is ON or it is OFF.

That is the whole business. History, access, rules, jobs, mail, CI are **engineering surface** on the same bit — not new products.

If a construction cannot be shown on this bit without a fake extra domain, it is marked **artificial** below. Artificial is allowed when named; it is not allowed as silent complexity.

## Keep existing ONE BIT work

If a local React light already exists, **absorb it as BIT-0–BIT-2**. Do not restart from a blank Create-React-App to satisfy this document. The first committed tree under `tower-light/app/` (later) should be that work plus the next transformation.

This repository does not currently contain a ONE BIT implementation.

## Topology (grows; always runnable)

```
BIT-0   index.html + CSS          → a lamp that is painted, not stateful
BIT-1   React createRoot          → <Light /> function
BIT-2   useState                  → the bit
BIT-3   events                    → click flips
BIT-4   objects/arrays            → a flip is `{ on, at }`
BIT-5   TypeScript                → types on that shape (aliases, not enums)
BIT-6   form                      → a note on the flip (controlled input)
BIT-7   list                      → history; keys; map/filter
BIT-8   react-router              → `/` and `/history`
BIT-9   localStorage              → survive reload (then stop treating it as the book)
BIT-10  fetch                     → GET/POST `/light` (stand-in server first)
BIT-11  Hono on :3001 + Vite proxy
BIT-12  pg.Pool + lights table    → desk shows the query; empty table, empty desk
BIT-13  Vite + Tailwind plugin + scripts + env
BIT-14  cookie session            → two browsers, two rights
BIT-15  worker tick               → ON too long → auto-off
BIT-16  rule + write-set          → when flipped, record; later step reads the write
BIT-18  Resend/Twilio (dry_run)   → notify; CLI is optional native (dynamic import)
BIT-20  GitHub Actions + Postgres → migrate + verify-light + build
BIT-21  deploy topology           → one HTML until isolation is the lesson; then dual entry
```

There is no BIT-17. XYFlow is **BIT-16** when a rule is a node, not sooner.

## Stage details

### BIT-0 Document
HTML module script, `#root`, flex/grid, custom properties. **Observable:** a lamp and a button exist as boxes. No React required yet if the learner already has HTML+CSS from Tower Construction TC-0–4; wire React on top rather than throwing the page away.

### BIT-1 Component
`createRoot`, function component, JSX element / intrinsic / fragment / expression. **Observable:** the lamp is a component, not a static file of divs only.

### BIT-2 The bit
`useState`, ternary, `&&` for ON chrome. **Observable:** click is not needed yet if you seed `true`; a re-render changes the lamp. Then BIT-3 adds the click.

### BIT-3 Event
`onClick`, arrow callback, `useCallback` when a child would otherwise re-bind. **Observable:** click flips.

### BIT-4 Shape
Object/array literals, destructure, spread, Map/Set as needed. **Observable:** a flip is data, not a CSS class alone.

### BIT-5 Types
`type Light = { on: boolean }`, unions, `Promise<T>` when fetch arrives. **House style from Tower:** type aliases, not `interface`, not `enum`. `any` is an anti-pattern (4 hits in Tower).

### BIT-6 Form
Controlled `<input>` (Ant `Input` if the kit is already in). **Observable:** the note string is in state and in the event object. `react-hook-form` is **excluded** until a form library is actually required (Tower’s wrapper has no product importers).

### BIT-7 History
Array of events, `key=`, `map`/`filter`/`find`. Optional tiny recharts sparkline (artificial-but-honest: counts of ON). **Observable:** a list that is the history, not a second product.

### BIT-8 Route
`BrowserRouter`: `/` lamp, `/history` list. Product-face Tower uses **state** for Operator desks, not router — say that out loud. Router is still in Tower (Hub document). ONE BIT uses router when history is a URL.

### BIT-9 Persist-local
`localStorage` JSON. **Observable:** reload keeps the bit. Then a leftover: this is not the book. BIT-12 retires it as source of truth.

### BIT-10 Fetch
`fetch` + `JSON` + `try/catch` + `await`. Stand-in in-memory server or MSW is extra; prefer a real tiny Hono in BIT-11. **Observable:** Network panel shows POST.

### BIT-11 Server
`new Hono()`, `serve` on :3001, Vite proxy, `credentials: "include"` ready. Stand-in vs real: in-memory map first, same handler signature as pg. **Observable:** killing Vite does not kill the API; killing the API makes the button fail.

### BIT-12 Table
`lights(id uuid, on boolean, updated_at timestamptz)` + `light_events`. `pg.Pool`, parameterized `$1`, transaction for flip+event. Seed one row. **Observable:** `DELETE FROM lights` → desk empty. No painted React empty-state pretending to be data.

**Do not reproduce Tower’s two id grains** (UUID firms vs TEXT `firm-cedar`). One UUID grain.

RLS exists in Tower and is **named** here; the Node app uses a service connection, so RLS is not what empties the desk. Do not fake JWT RLS to tick a box.

### BIT-13 Toolchain
`package.json` `"type": "module"`, scripts, `tsx --env-file`, `vite` + `@vitejs/plugin-react` + `@tailwindcss/vite`. This is **production Tailwind** (plugin), not TC-4’s standalone CLI. Point utilities at `display` / color as in TC-4 leftover.

`assertBootEnv`: missing `DATABASE_URL` refuses boot.

### BIT-14 Access
`hono/cookie` `getCookie` / `setCookie`, `node:crypto` HMAC + `timingSafeEqual`, session row. Two browsers: only the session that owns the light can flip. **Observable:** 401 without cookie; 403 with the wrong principal.

OTP can be a 6-digit stand-in before Twilio/Resend. The `input-otp` widget is optional chrome.

### BIT-15 Job
`setInterval` → `tickOnce`. If ON longer than N seconds, auto-off and append an event. Same function exposed as `POST /tick` so CI can fire it. Docker worker and Vercel cron are **the same tick**, different hosts (BIT-21).

### BIT-16 Rule / write-set
Smallest walk: trigger `light.flipped` → action `record_event` whose input is **the write the trigger just made**, not a hard-coded field list. Optional: XYFlow with two nodes and a handle. If XYFlow is added, it is because the rule is a graph, not because a logo was due.

JSON graph in JSONB is Tower’s store for this. Use it when the walk exists; not as decoration.

### BIT-18 Notify (artificial, named)
Resend “light is ON” and/or Twilio SMS, **SEND_MODE=dry_run** until a cohort is set. Dynamic `import("twilio")` is the construction (optional native dep, auth bundle isolation). Skip live send in the teaching app unless a real number is the point.

### BIT-20 CI
GitHub Actions: Postgres 16 service, `npm ci`, migrate, `verify-light` (flip + assert row), `npm run build`. No Vitest required because Tower doesn’t use one. A later unit runner is a new construction — don’t add it for coverage.

### BIT-21 Ship
One HTML document until isolation is the lesson. Then: two HTML entries (Tower’s Hub vs `/prototype-ant` pattern) **without a second domain**. Vercel rewrites, esbuild API bundle, Docker worker — add when the tick must outlive the laptop.

## UI kit

**Ant Design** is the product-face kit (`/prototype-ant`). ONE BIT uses Ant `Button` / `Typography` / `Table` when a kit is needed — not Radix/shadcn, not MUI.

Radix compound primitives, lucide, CVA, vaul, cmdk, embla: **explicit exclusions**. They are real in Hub. A second kit is not a second mechanism worth a second install.

## Dependencies ONE BIT may add (only when the stage needs them)

`react`, `react-dom`, `react-router`, `antd`, `@ant-design/icons`, `hono`, `@hono/node-server`, `pg`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `tsx`.

Later, only if the stage exists: `@xyflow/react`, `resend`, `twilio`, `recharts`.

Never to raise coverage: `@mui/*`, `@emotion/*`, `react-dnd`, `react-slick`, `canvas-confetti`, `motion`, `date-fns`, `next-themes`, `sonner` (dead on the product face), `react-hook-form` (wrapper unused).

## What success looks like

A running light, at every stage. Each catalogue ID is either:

- exercised by a named transformation, with a coverage criterion, or
- **EXCLUDE-*** with a reason, or
- **GAP-*** with a reason.

Nothing silently drops off [`COVERAGE_MATRIX.md`](./COVERAGE_MATRIX.md).
