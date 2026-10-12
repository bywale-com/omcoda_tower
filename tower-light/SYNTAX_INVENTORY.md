# SYNTAX_INVENTORY

Deduplicated constructions (not every identifier). Evidence: TypeScript AST on 666 JS/TS files plus SQL/CSS/HTML scans of `origin/main` @ `48d4511`.

Repeated boilerplate (renamed variables, extra lucide icons, extra antd widgets) is **not** a new construction. Semantic variations (map vs reduce, `??` vs `||`, type-only import) **are**.

**Not claimed absent** unless that bucket scanned cleanly. See GAPS.md.

| Category | Count |
|---|---|
| language | 87 |
| runtime | 35 |
| typescript | 42 |
| jsx | 7 |
| sql | 19 |
| css | 7 |
| html | 2 |
| api | 57 |
| config | 17 |
| architecture | 12 |

Total catalogue IDs: **285**.

## language

| ID | Name | Exact form | Occ | Files | Location | Purpose | Mechanism | Min demo |
|---|---|---|---|---|---|---|---|---|
| `LANG-const` | const binding | `const root = process.cwd()` | 7946 | 565 | `scripts/bundle-vercel-api.mjs:7` | Name a value that is not reassigned. | Lexical binding; temporal dead zone; block scope. | Name the light's boolean; changing it requires a new binding or a setter, not `const light = !light` in place. |
| `LANG-let` | let binding | `let body: unknown = text` | 227 | 111 | `scripts/close-walk-gaps.ts:36` | Name a value that may be reassigned. | Block-scoped mutable binding. | Loop index or accumulating list before React state exists. |
| `LANG-arrow-function` | arrow function | `(l) => l && !l.startsWith("#") && l.includes("=")` | 4297 | 360 | `scripts/close-walk-gaps.ts:14` | Pass behaviour as a value. | Lexical `this`; concise or block body; first-class function. | Pass `() => setOn(!on)` to a click handler. |
| `LANG-async-arrow` | async arrow | `async (client) => { await invalidateChallenges(user.firm_id, email, client` | 86 | 36 | `server/auth-service/routes.ts:137` | A function value that returns a Promise. | Marks the function async; enables `await` inside. | Click handler that `await fetch(...)`. |
| `LANG-function-declaration` | function declaration | `export default function handler(_req: IncomingMessage, res: ServerResponse) { res.statusCode = 200` | 1891 | 506 | `api/ping.ts:7` | Hoisted named function. | Creates a binding in the enclosing scope; hoisted. | Extract `function isOn(row)` for a predicate. |
| `LANG-async-function` | async function declaration | `async function live(path: string, init: RequestInit & { cookie?: string } = {}) { const headers =` | 317 | 54 | `scripts/close-walk-gaps.ts:27` | Named async function. | Returns Promise; `await` inside. | Server route handler `async function toggle(c)`. |
| `LANG-function-expression` | function expression | `async function handler(req: IncomingMessage, res: ServerResponse): Promise<void>` | 2 | 2 | `scripts/vercel-entries/fetchBridge.ts:46` | Unhoisted function value (rare in Tower). | Expression position function. | Only if a library requires `function () {}`. |
| `LANG-await` | await | `await esbuild.build({ entryPoints: [t.entry], outfile: t.outfile, bu` | 1456 | 118 | `scripts/bundle-vercel-api.mjs:25` | Pause an async function until a Promise settles. | Unwraps fulfillment; throws on rejection into try/catch. | Await `pool.query` then return rows. |
| `LANG-try` | try | `try` | 193 | 85 | `scripts/check-access-table.ts:4` | Guard a region that may throw. | Transfers to catch/finally. | Wrap fetch; show error without crashing the light. |
| `LANG-catch-binding` | catch binding | `catch` | 90 | 44 | `scripts/run-migration.ts:26` | Name the thrown value. | `catch (err)` binds the rejection/throw. | Log `err.message` when save fails. |
| `LANG-optional-catch` | optional catch binding | `catch` | 79 | 43 | `scripts/close-walk-gaps.ts:39` | Catch without naming. | `catch { }` — ES2019. | Ignore a JSON.parse failure on corrupt localStorage. |
| `LANG-finally` | finally | `finally` | 70 | 45 | `scripts/check-access-table.ts:4` | Run cleanup whether throw or not. | Always runs on the way out of try. | Release a pg client after query. |
| `LANG-throw` | throw | `throw new Error(`login failed ${email}: ${JSON.stringify(v)}`);` | 71 | 44 | `scripts/close-walk-gaps.ts:70` | Abort with an exception. | Unwinds to nearest catch. | Throw if `DATABASE_URL` missing at boot. |
| `LANG-if` | if | `if` | 2850 | 326 | `scripts/close-walk-gaps.ts:29` | Conditional statement. | Evaluates test; executes one branch. | If the light is on, record a flip. |
| `LANG-else` | else | `else` | 206 | 85 | `scripts/close-walk-gaps.ts:94` | Alternate branch. | Runs when if-test is false. | Else leave the light off. |
| `LANG-switch` | switch | `switch` | 53 | 32 | `server/wire-service/webhooks.ts:21` | Multi-way dispatch on a value. | Strict equality against case labels; fall-through unless break/return. | Switch on event kind: `turn_on` / `turn_off`. |
| `LANG-case` | case | `case "email.sent":` | 300 | 32 | `server/wire-service/webhooks.ts:22` | A switch arm. | Label matched by ===. | See LANG-switch. |
| `LANG-default-clause` | default clause | `default:` | 24 | 15 | `server/wire-service/webhooks.ts:37` | Switch fallback. | Runs when no case matches. | Unknown event kind → ignore. |
| `LANG-ternary` | conditional expression | `sc ? (sc.split(";")[0] ?? "") : ""` | 3165 | 321 | `scripts/close-walk-gaps.ts:46` | Choose a value, not a statement. | `test ? a : b` yields a value. | Button label `{on ? "ON" : "OFF"}`. |
| `LANG-for` | for loop | `for` | 22 | 13 | `scripts/verify-affordance-roundtrip.ts:62` | Index-driven iteration. | Init / test / update. | Rare; prefer for-of. Use only when an index is the point. |
| `LANG-for-of` | for...of | `for (const t of targets) { await esbuild.build({ entry` | 270 | 95 | `scripts/bundle-vercel-api.mjs:24` | Iterate values of an iterable. | Calls iterator protocol. | Walk query rows to build history. |
| `LANG-while` | while | `while` | 8 | 8 | `scripts/verify-continuous-worker.ts:108` | Loop while a test holds. | Re-evaluates test each iteration. | Worker `while (running) await tick()`. Prefer `setInterval` in Tower's worker shape. |
| `LANG-break` | break | `break` | 69 | 11 | `scripts/verify-continuous-worker.ts:116` | Leave a loop or switch. | Transfers out of the innermost loop/switch. | Stop scanning history at the first ON. |
| `LANG-continue` | continue | `continue` | 104 | 31 | `scripts/run-seed.ts:51` | Skip to next iteration. | Transfers to loop increment/test. | Skip malformed history rows. |
| `LANG-return` | return | `return` | 4678 | 520 | `scripts/close-walk-gaps.ts:17` | Leave a function with a value. | Completes the call; async return wraps in Promise. | Return JSX from the Light component. |
| `LANG-destructure-object` | object destructuring | `{ Pool }` | 1009 | 323 | `scripts/pgConnect.ts:7` | Bind properties by name. | Pattern match on object keys; rename with `:` . | `const { on } = state`. |
| `LANG-destructure-array` | array destructuring | `[id, ord]` | 821 | 173 | `scripts/restore-channel-order.ts:9` | Bind by position. | Including tuple-shaped React hooks. | `const [on, setOn] = useState(false)`. |
| `LANG-spread` | spread (args/array) | `...text.matchAll(/@notion-icons\/([^"?]+)/g)` | 368 | 102 | `scripts/copy-notion-icons.mjs:9` | Copy or expand elements. | Iterator protocol into a new array or argument list. | `[...history, event]`. |
| `LANG-spread-object` | object spread | `...Object.fromEntries( readFileSync(".env", "utf8") .split("\n")` | 681 | 177 | `scripts/close-walk-gaps.ts:11` | Copy enumerable own properties into a new object. | Shallow copy; later keys win. | `{ ...row, on: true }`. |
| `LANG-rest-param` | rest parameter | `...inputs: ClassValue[]` | 1 | 1 | `src/app/components/ui/utils.ts:4` | Collect remaining arguments. | `(...args)` is an array. | Rare in Tower (1 hit). Demonstrate in a logger `log(kind, ...rest)`. |
| `LANG-default-param` | default parameter | `init: RequestInit & { cookie?: string } = {}` | 82 | 52 | `scripts/close-walk-gaps.ts:27` | Fill a missing argument. | Evaluated when argument is `undefined`. | `function tick(now = new Date())`. |
| `LANG-shorthand-property` | shorthand property | `headers` | 1455 | 255 | `scripts/close-walk-gaps.ts:34` | Object key from binding name. | `{ on }` ≡ `{ on: on }`. | Return `{ on, at }` from an event. |
| `LANG-computed-property` | computed property | `[criteria.id]: now.toISOString()` | 97 | 34 | `server/wire-service/cascade.ts:413` | Object key from an expression. | `{ [kind]: true }`. | Index events `{ [id]: row }`. |
| `LANG-template-literal` | template literal | ``bundled ${t.label} → ${path.relative(root, t.outfile)}`` | 2009 | 309 | `scripts/bundle-vercel-api.mjs:35` | String with interpolations. | Evaluates `${}` to string concat. | Log `` `light ${on}` ``. |
| `LANG-template-literal-plain` | plain template (no subst.) | ``SELECT to_regclass('public.access_links') AS t`` | 578 | 55 | `scripts/check-access-table.ts:5` | Equivalent to a string; often SQL. | No interpolation. | SQL query strings in pg. |
| `LANG-optional-chain` | optional chaining | `process.env.DATABASE_URL?.trim` | 1224 | 215 | `api/ping.ts:14` | Read a property if receiver is non-nullish. | Short-circuits to `undefined`. | `event?.at` when history row may be missing. |
| `LANG-optional-call` | optional call | `child.unref?.()` | 50 | 34 | `scripts/verify-continuous-worker.ts:160` | Call if callee is non-nullish. | `fn?.(x)`. | Optional callback `onFlip?.(next)`. |
| `LANG-optional-element` | optional element access | `tpl.rows[0]?.cells?.[0]` | 36 | 26 | `scripts/verify-affordance-roundtrip.ts:182` | Index if receiver non-nullish. | `arr?.[0]`. | `rows?.[0]`. |
| `LANG-nullish-coalesce` | nullish coalescing | `process.env.SEND_MODE ?? ""` | 1899 | 260 | `api/ping.ts:16` | Default only for null/undefined. | Does not trigger on `false`/`0`/`''`. | `process.env.PORT ?? 3001` — empty string is not defaulted (contrast \|\|). |
| `LANG-logical-and` | logical and | `l && !l.startsWith("#") && l.includes("=")` | 1286 | 235 | `scripts/close-walk-gaps.ts:14` | Short-circuit; JSX guard. | If left is falsy, skip right. | `{on && <span>lit</span>}`. |
| `LANG-logical-or` | logical or | `(process.env.SEND_MODE ?? "").trim() \|\| "(unset→dry_run)"` | 1193 | 239 | `api/ping.ts:16` | First truthy, or last. | Unlike ??, treats `''`/`0`/`false` as missing. | Used in Tower; teaching app should contrast with ?? on env flags. |
| `LANG-strict-eq` | strict equality | `camp.status === 200` | 3405 | 323 | `scripts/close-walk-gaps.ts:111` | Compare without coercion. | `===` / `!==`. | `on === true`. |
| `LANG-strict-neq` | strict inequality | `v.status !== 200` | 467 | 137 | `scripts/close-walk-gaps.ts:69` | Negation of ===. | `!==`. | `status !== 200`. |
| `LANG-loose-eq` | loose equality | `row.threshold == null` | 75 | 29 | `server/wire-service/cascade.ts:308` | Compare with coercion (Tower uses it). | `==` / `!=`. Teach that it is a different construction; prefer === in ONE BIT. | Show `flag == true` vs `===` with string `'true'` from env. |
| `LANG-loose-neq` | loose inequality | `r.threshold != null` | 95 | 42 | `scripts/verify-modular-surfaces.ts:110` | Negation of ==. | `!=`. | Same demo as loose-eq. |
| `LANG-typeof` | typeof | `typeof prefilled` | 260 | 57 | `scripts/vercel-entries/fetchBridge.ts:16` | Runtime type tag string. | Returns a string; `typeof null === 'object'` trap exists. | Guard `typeof on === 'boolean'`. |
| `LANG-instanceof` | instanceof | `err instanceof Error` | 35 | 26 | `scripts/verify-modular-surfaces.ts:407` | Prototype-chain test. | Walks [[Prototype]]. | `err instanceof Error`. |
| `LANG-in` | in operator | `"ok" in halted.send` | 40 | 15 | `scripts/verify-deny-gates.ts:69` | Property existence (including prototype). | `"key" in obj`. | Feature-detect localStorage in window. |
| `LANG-void` | void operator | `void tables` | 210 | 65 | `server/wire-service/eventTest.ts:201` | Evaluate and yield undefined. | Common: `void runTick()` to mark ignored Promise. | Worker `void runTick()` in setInterval. |
| `LANG-delete` | delete | `delete process.env.SEND_MODE` | 27 | 16 | `scripts/verify-boot-env.ts:27` | Remove an object property. | Mutates the object. | Prefer immutable spread in React; show once why delete fights React state. |
| `LANG-new` | new | `new Headers(init.headers)` | 475 | 179 | `scripts/close-walk-gaps.ts:28` | Construct an instance. | Calls [[Construct]]. | `new Date()`, `new Pool()`. |
| `LANG-null` | null | `null` | 3421 | 323 | `api/ping.ts:17` | Intentional empty object value. | A primitive. | SQL null vs JS null when a row is missing. |
| `LANG-undefined` | undefined | `undefined` | 400 | 132 | `scripts/pgConnect.ts:14` | Uninitialized / missing. | A primitive; default of missing args. | Missing env var. |
| `LANG-regex-literal` | RegExp literal | `/\/$/` | 77 | 50 | `scripts/close-walk-gaps.ts:22` | Pattern matching. | Compiled regex. | Validate an access token shape. |
| `LANG-import-named` | named import | `import { createPgPool } from "./pgConnect.ts";` | 2051 | 465 | `scripts/check-access-table.ts:1` | Bind exported names from a module. | Live bindings; ESM. | `import { useState } from "react"`. |
| `LANG-import-default` | default import | `import fs from "node:fs";` | 59 | 11 | `scripts/bundle-vercel-api.mjs:4` | Bind the default export. | ESM default slot. | `import pg from "pg"`. |
| `LANG-import-namespace` | namespace import | `import * as esbuild from "esbuild";` | 75 | 48 | `scripts/bundle-vercel-api.mjs:3` | Bind all exports as an object. | `import * as Dialog from "..."`. | Radix compound components. Teaching app: skip unless introducing Radix. |
| `LANG-import-type-named` | type-only import | `import type { IncomingMessage, ServerResponse } from "node:http";` | 633 | 404 | `api/ping.ts:5` | Import erased types. | `import type { X }` — no runtime. | Import a Row type without bundling a value. |
| `LANG-import-inline-type` | inline type specifier | `type ChildProcess` | 394 | 171 | `scripts/verify-continuous-worker.ts:11` | `import { type X, y }`. | Mixed type/value import. | Same as type-only, mixed form. |
| `LANG-import-side-effect` | side-effect import | `import "@xyflow/react/dist/style.css";` | 10 | 9 | `src/app/components/hub/automation/AutomationWorkflowCanvas.tsx:14` | Run a module for effects only. | `import "./styles.css"`. | Load CSS from the entry. |
| `LANG-dynamic-import` | dynamic import() | `import("node:fs")` | 21 | 13 | `scripts/verify-firm-binding.ts:267` | Load a module at runtime (Promise). | Code-split / optional native deps. | Tower: `await import("twilio")` so auth bundle can omit Twilio. Demo: lazy-load a History panel. |
| `LANG-export-named` | named export | `export function createPgPool(connectionString: string): pg.Pool { return new P` | 2142 | 612 | `scripts/pgConnect.ts:9` | Expose a binding. | `export function Light`. | Export the Light component. |
| `LANG-export-default` | default export | `export default function handler(_req: IncomingMessage, res: ServerResponse) {` | 7 | 7 | `api/ping.ts:7` | Expose the default slot. | `export default`. | Rare in Tower (7). Prefer named in ONE BIT. |
| `LANG-reexport-named` | re-export | `export { default, config } from "../dist-api/auth.js";` | 98 | 21 | `api/auth.ts:3` | Forward another module's exports. | `export { x } from "./x"`. | Barrel `wire/reals/index`. |
| `LANG-export-star` | export * | `export * from "./standins";` | 1 | 1 | `src/app/wire/index.ts:53` | Re-export all names. | `export * from`. | One barrel. Don't hide graphs with barrels. |
| `LANG-array.map` | Array.prototype.map | `readFileSync(".env", "utf8") .split("\n") .filter((l) => l && !l.sta` | 946 | 228 | `scripts/close-walk-gaps.ts:12` | Transform each element to a new array. | Does not mutate; returns same length. | Render `{history.map(row => <li key={row.id}>...`. |
| `LANG-array.filter` | Array.prototype.filter | `readFileSync(".env", "utf8") .split("\n") .filter((l) => l && !l.sta` | 337 | 124 | `scripts/close-walk-gaps.ts:12` | Keep elements that pass a predicate. | New array, possibly shorter. | History of ON events only. |
| `LANG-array.find` | Array.prototype.find | `ref.rows[0]?.payload?.rows?.find((r) => r.key === "cec.min_hours")` | 322 | 127 | `scripts/verify-affordance-roundtrip.ts:48` | First match or undefined. | Stops early. | Find the latest ON. |
| `LANG-array.some` | Array.prototype.some | `bookB.body.contacts.some((c: { id: string }) => (bookA.body.contacts \|\| []` | 94 | 58 | `scripts/close-walk-gaps.ts:254` | Whether any element matches. | Boolean; stops early. | Has the light ever been on? |
| `LANG-array.every` | Array.prototype.every | `criteria.checks.every((c) => c.met)` | 18 | 13 | `src/app/components/JourneyTab.tsx:1869` | Whether all match. | Boolean. | Are all events valid? |
| `LANG-array.reduce` | Array.prototype.reduce | `ledger.reduce( (acc, r) => { acc[r.class] = (acc[r.class] ?? 0) + 1;` | 9 | 8 | `scripts/verify-affordance-roundtrip.ts:265` | Fold to one value. | Accumulator. | Count ON events. |
| `LANG-array.flatMap` | Array.prototype.flatMap | `Object.values(slots as Record<string, unknown>).flatMap((row) => Array.isArr` | 23 | 12 | `server/wire-service/workflowWalk.ts:288` | Map then flatten one level. | Concat mapped arrays. | Expand an event into [from, to] chips. |
| `LANG-array.includes` | Array.prototype.includes | `l.includes("=")` | 192 | 72 | `scripts/close-walk-gaps.ts:14` | Membership. | SameValueZero. | `SEND_TEST_COHORT.split(",").includes(id)`. |
| `LANG-array.slice` | Array.prototype.slice | `l.slice(0, i)` | 121 | 68 | `scripts/close-walk-gaps.ts:17` | Copy a range (non-mutating). | New array. | Last 20 history rows. |
| `LANG-array.push` | Array.prototype.push | `report.push({ step: "A-login", ok: true })` | 308 | 65 | `scripts/close-walk-gaps.ts:101` | Mutate by appending. | Mutates; returns length. | Avoid on React state; show why spread is required. |
| `LANG-array.sort` | Array.prototype.sort | `readdirSync(migrationsDir) .filter((name) => name.endsWith(".sql")) .sort()` | 73 | 37 | `scripts/run-migration.ts:16` | Reorder (mutates!). | In-place unless copied first. | `[...rows].sort((a,b)=>...)`. |
| `LANG-array.join` | Array.prototype.join | `path.join(root, "dist-api")` | 82 | 38 | `scripts/bundle-vercel-api.mjs:8` | Concatenate to string. | Separator. | Join tags. |
| `LANG-array.forEach` | Array.prototype.forEach | `response.headers.forEach((value, key) => { // Node forbids setting some ho` | 12 | 6 | `scripts/vercel-entries/fetchBridge.ts:81` | Visit for side effects. | No return array. | Prefer map in JSX; forEach in scripts. |
| `LANG-promise.then` | Promise.then | `import("node:fs").then((fs) => fs.readFileSync(new URL("../src/app/Router.ts` | 67 | 46 | `scripts/verify-ship-spine.ts:179` | Register fulfillment (pre-await style). | Returns a new Promise. | Tower still has it. Teaching: prefer await, show then as the same chain. |
| `LANG-promise.catch` | Promise.catch | `session.json().catch(() => ({}))` | 66 | 34 | `scripts/verify-access-link.ts:46` | Register rejection. | Same as then(undefined, onRej). | Show vs try/catch await. |
| `LANG-promise.finally` | Promise.finally | `wirePorts.machineApi .enrollSequenceContacts(binding.templateId, {` | 3 | 3 | `src/app/register/prototype-ant/operator/AntAgentWorkbench.tsx:1239` | After settle, no value change. | Cleanup. | Clear a loading flag. |
| `LANG-class-extends` | class extends | `export class FirmScopeError extends Error { status: number; constructor(stat` | 3 | 3 | `server/wire-service/sessionFirm.ts:14` | Constructor + prototype inheritance. | Rare in Tower (Error subclasses / React leftovers). | Custom `class WireError extends Error`. |
| `LANG-constructor` | constructor | `constructor(status: number, message: string) { super(message); this.stat` | 2 | 2 | `server/wire-service/sessionFirm.ts:16` | Instance init. | Called by `new`. | See class extends. |
| `LANG-super` | super | `super` | 2 | 2 | `server/wire-service/sessionFirm.ts:17` | Call parent constructor/method. | Must before `this` in constructor. | See class extends. |
| `LANG-method` | class/object method | `static getDerivedStateFromError(error: Error): RegisterErrorBoundaryState {` | 267 | 31 | `src/app/register/components/RegisterErrorBoundary.tsx:18` | Function as a property. | Shorthand in class or object. | Hono-adjacent objects; React class is not the product path. |
| `LANG-this` | this | `this` | 5 | 3 | `server/wire-service/sessionFirm.ts:18` | Receiver of a method call. | Rare (5 hits). Arrow functions close over lexical this instead. | Show why arrows are used in handlers. |
| `LANG-computed-index` | computed index | `reversed[i]` | 472 | 135 | `scripts/verify-affordance-roundtrip.ts:64` | Read `obj[expr]`. | Dynamic key. Flagged as not-statically-resolvable. | `ports[name]` in the wire registry. |

## runtime

| ID | Name | Exact form | Occ | Files | Location | Purpose | Mechanism | Min demo |
|---|---|---|---|---|---|---|---|---|
| `RT-fetch` | fetch | `fetch(`${BASE}${path}`, { ...init, headers })` | 15 | 9 | `scripts/close-walk-gaps.ts:34` | HTTP from the browser (or Node 22). | Returns Promise<Response>; CORS + cookies via credentials. | POST /light/toggle with credentials include. |
| `RT-process-env` | process.env | `process.env.DATABASE_URL?.trim` | 402 | 46 | `api/ping.ts:14` | Node environment bindings. | Object of strings; missing keys are undefined. | Read DATABASE_URL at boot. |
| `RT-import-meta-env` | import.meta.env | `import.meta.env.VITE_DEV_FIRM_ID` | 14 | 3 | `src/app/auth/AuthContext.tsx:46` | Vite-injected client env. | Build-time define; only VITE_* reach the browser. | Read VITE_WIRE_REAL. |
| `RT-import-meta` | import.meta | `import.meta` | 17 | 10 | `scripts/copy-notion-icons.mjs:5` | Module metadata. | url, env, etc. | Resolve files next to the module in scripts. |
| `RT-json-stringify` | JSON.stringify | `JSON.stringify({ ok: true, service: "tower-ping", hasDatabaseUrl: Boolean(process.` | 255 | 62 | `api/ping.ts:11` | Value → JSON text. | Replacer/space optional; throws on cycles. | Body of fetch; localStorage payload. |
| `RT-json-parse` | JSON.parse | `JSON.parse(text)` | 17 | 14 | `scripts/close-walk-gaps.ts:38` | JSON text → value. | Throws SyntaxError. | Read localStorage; must try/catch. |
| `RT-map` | Map | `new Map(objs.rows.map((o) => [o.campaign_id, o]))` | 102 | 45 | `server/wire-service/campaignHousing.ts:219` | Keyed collection (any key). | Reference keys; insertion order. | Index rows by id without object prototype hazards. |
| `RT-set` | Set | `new Set(evals.rows.map((row) => row.contact_id))` | 144 | 67 | `server/wire-service/eventTest.ts:147` | Unique values. | SameValueZero uniqueness. | Dedupe flipped-by users. |
| `RT-date` | Date | `new Date(Date.now() - 60_000)` | 139 | 59 | `scripts/verify-author-runtime.ts:115` | Instant / calendar. | Mutable; ISO via toISOString. | Stamp a flip. |
| `RT-error` | Error | `new Error(`login failed ${email}: ${JSON.stringify(v)}`)` | 50 | 38 | `scripts/close-walk-gaps.ts:70` | Throwable with message/stack. | Construct + throw. | Boot failure. |
| `RT-url` | URL | `new URL("../src/app/components/docs/holonCatalogFlat.ts", import.meta.url)` | 9 | 5 | `scripts/generate-holon-catalog-flat.mts:12` | Parse/build URLs. | WHATWG URL. | PUBLIC_APP_URL join. |
| `RT-url-search-params` | URLSearchParams | `new URLSearchParams()` | 1 | 1 | `src/app/wire/reals/auditTrail.ts:13` | Query string map. | Iterable; toString. | Parse `?bit=1`. |
| `RT-headers` | Headers | `new Headers(init.headers)` | 3 | 3 | `scripts/close-walk-gaps.ts:28` | HTTP header map. | Used with fetch/Request. | Set content-type + cookie. |
| `RT-request` | Request | `new Request(url, { method, headers, body: body as BodyInit \| undefined, // @ts-expect-error dupl` | 1 | 1 | `scripts/vercel-entries/fetchBridge.ts:71` | Fetch input object. | WHATWG. | Forward a request into Hono. |
| `RT-promise-new` | Promise constructor | `new Promise((resolve, reject) => { const chunks: Buffer[] = []; req.on("data", (chunk: Buffer) => { chunks` | 5 | 5 | `scripts/vercel-entries/fetchBridge.ts:20` | Manual thenable. | executor (resolve,reject). | Wrap a callback API. Prefer async function. |
| `RT-promise-all` | Promise.all | `Promise.all([ pool.query( `SELECT DISTINCT ON (contact_id) * FROM eligibility_resul` | 25 | 17 | `server/wire-service/machine.ts:737` | Wait for all; fail fast. | Rejects on first rejection. | Parallel reads. |
| `RT-promise-resolve` | Promise.resolve | `Promise.resolve(prefilled)` | 28 | 3 | `scripts/vercel-entries/fetchBridge.ts:15` | Lift a value to a Promise. | Thenables assimilate. | Stand-in ports returning resolved data. |
| `RT-localstorage-get` | localStorage.getItem | `localStorage.getItem(WORKFLOWS_STORAGE_KEY)` | 8 | 8 | `src/app/data/automationWorkflows.ts:1110` | Read a origin-scoped string. | Sync; strings only. | Restore last light state. |
| `RT-localstorage-set` | localStorage.setItem | `localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(workflows))` | 8 | 8 | `src/app/data/automationWorkflows.ts:1123` | Write a origin-scoped string. | Quota errors possible. | Persist last light state. |
| `RT-sessionstorage-get` | sessionStorage.getItem | `sessionStorage.getItem(LOGGED_OUT_KEY)` | 3 | 3 | `src/app/auth/AuthContext.tsx:22` | Tab-scoped string read. | Cleared when tab ends. | Tower: logged-out flag. Demo: 'don't restore this tab'. |
| `RT-sessionstorage-set` | sessionStorage.setItem | `sessionStorage.setItem(LOGGED_OUT_KEY, "1")` | 3 | 3 | `src/app/auth/AuthContext.tsx:30` | Tab-scoped string write. | See get. | See get. |
| `RT-sessionstorage-remove` | sessionStorage.removeItem | `sessionStorage.removeItem(LOGGED_OUT_KEY)` | 2 | 2 | `src/app/auth/AuthContext.tsx:38` | Delete a tab-scoped key. | See get. | Clear logged-out flag. |
| `RT-getelementbyid` | document.getElementById | `document.getElementById(`activity-node-${nodeId}`)` | 3 | 3 | `src/app/components/JourneyTab.tsx:2747` | Find #root. | DOM lookup. | createRoot(document.getElementById("root")). |
| `RT-random-uuid` | crypto.randomUUID | `globalThis.crypto?.randomUUID?.()` | 1 | 1 | `src/app/wire/standins/machineApi.ts:2041` | Generate a UUID. | Web Crypto / Node crypto. | Id for a history row. |
| `RT-structured-clone` | structuredClone | `structuredClone(workflow.nodes)` | 17 | 6 | `src/app/components/hub/automation/AutomationDetailView.tsx:75` | Deep clone structured data. | Does not clone functions. | Copy a row before mutate. |
| `RT-is-array` | Array.isArray | `Array.isArray(value)` | 80 | 29 | `scripts/vercel-entries/fetchBridge.ts:57` | True iff Array. | Not typeof (typeof [] is object). | Guard JSON payloads. |
| `RT-object-keys` | Object.keys | `Object.keys(walked.nodeStatus)` | 28 | 20 | `scripts/verify-automations-alive.ts:140` | Enumerable own keys. | Array of strings. | Iterate a map-like object. |
| `RT-object-entries` | Object.entries | `Object.entries(req.headers)` | 17 | 10 | `scripts/vercel-entries/fetchBridge.ts:55` | Own [key,value] pairs. | Array of tuples. | Build a Select from a record. |
| `RT-object-fromentries` | Object.fromEntries | `Object.fromEntries( readFileSync(".env", "utf8") .split("\n") .filter((l) => l && !l` | 9 | 8 | `scripts/close-walk-gaps.ts:11` | Pairs → object. | Inverse of entries. | Parse form fields. |
| `RT-object-assign` | Object.assign | `Object.assign(nodeStatus, prior.rows[0]?.node_status ?? {})` | 2 | 2 | `server/wire-service/workflowWalk.ts:1631` | Mutating merge. | Target is mutated. | Prefer object spread in React. |
| `RT-settimeout` | setTimeout | `setTimeout(r, ms)` | 1 | 1 | `scripts/verify-continuous-worker.ts:36` | Run later on this event loop. | Returns a handle; delay ms. | Debounce a save. |
| `RT-setinterval` | setInterval | `setInterval(() => { void runTick(); }, intervalMs)` | 1 | 1 | `server/wire-service/worker.ts:57` | Repeat on this event loop. | Worker tick in Tower. | Worker: interval → tickOnce. |
| `RT-console-log` | console.log | `console.log(`bundled ${t.label} → ${path.relative(root, t.outfile)}`)` | 81 | 34 | `scripts/bundle-vercel-api.mjs:35` | Print for humans / logs. | stdio or browser console. | Worker JSON log line. |
| `RT-add-event-listener` | window.addEventListener | `window.addEventListener("mousemove", handleMove)` | 16 | 8 | `src/app/App.tsx:228` | Subscribe to a DOM/window event. | Capture/bubble. | storage event to sync two tabs' light. |
| `RT-encode-uri` | encodeURIComponent | `encodeURIComponent(headers["x-firm-id"])` | 121 | 12 | `scripts/verify-session-firm.ts:53` | Percent-encode a URI component. | For query/path pieces. | Encode $ in a password if shown in docs; encode token in /a/:token. |

## typescript

| ID | Name | Exact form | Occ | Files | Location | Purpose | Mechanism | Min demo |
|---|---|---|---|---|---|---|---|---|
| `TS-type-alias` | type alias | `type SeedManifestEntry = { id: string; file: string; environments: string[` | 836 | 317 | `scripts/run-seed.ts:10` | Name a type. | `type Light = { on: boolean }`. Interfaces are unused in Tower — aliases are the house style. | Name `type LightState`. |
| `TS-union` | union type | `string \| null` | 1871 | 319 | `scripts/close-walk-gaps.ts:45` | Value is one of several types. | `"on" \| "off"`. | Event kind union. |
| `TS-intersection` | intersection type | `RequestInit & { cookie?: string }` | 77 | 46 | `scripts/close-walk-gaps.ts:27` | Must satisfy all. | `A & B`. | Row & { on: boolean }. |
| `TS-literal-type` | literal type | `null` | 3185 | 308 | `scripts/close-walk-gaps.ts:45` | Exactly this value. | `true`, `"on"`. | `as const` events. |
| `TS-type-literal` | object type literal | `{ step: string; ok: boolean; detail?: unknown }` | 1841 | 421 | `scripts/close-walk-gaps.ts:25` | Inline shape. | `{ on: boolean }`. | Props of Light. |
| `TS-optional-property` | optional property | `detail?: unknown` | 1610 | 236 | `scripts/close-walk-gaps.ts:25` | Key may be absent. | `on?: boolean` vs `on: boolean \| undefined` (present-undefined). | Optional note on a flip. |
| `TS-optional-param` | optional parameter | `detail?: string` | 139 | 58 | `scripts/verify-modular-surfaces.ts:10` | Argument may be omitted. | `n?: number`. | Optional callback param. |
| `TS-array-type` | T[] array type | `string[]` | 1486 | 292 | `scripts/read-latest-otp.ts:39` | Array of T. | Sugar for Array<T>. | `Event[]`. |
| `TS-Array-generic` | Array<T> | `Array<{ step: string; ok: boolean; detail?: unknown }>` | 129 | 52 | `scripts/close-walk-gaps.ts:25` | Generic array type. | Same runtime as T[]. | When the generic form is clearer. |
| `TS-type-arguments` | type arguments | `Array<{ step: string; ok: boolean; detail?: unknown }>` | 1474 | 310 | `scripts/close-walk-gaps.ts:25` | Instantiate a generic. | `Promise<Light>`, `useState<boolean>`. | useState<boolean>(false). |
| `TS-function-type` | function type | `(client: pg.PoolClient) => Promise<T>` | 535 | 155 | `server/auth-service/db.ts:34` | Type of a callable. | `(next: boolean) => void`. | onFlip: (next: boolean) => void. |
| `TS-void` | void type | `void` | 559 | 185 | `scripts/vercel-entries/fetchBridge.ts:30` | Function returns nothing useful. | Not JS void operator. | Click handler type. |
| `TS-unknown` | unknown | `unknown` | 531 | 70 | `scripts/close-walk-gaps.ts:25` | Must narrow before use. | Safer any. | JSON.parse result as unknown. |
| `TS-never` | never | `never` | 12 | 7 | `scripts/verify-reference-persist.ts:51` | Should not happen. | Exhaustiveness in switch. | Default arm of event kind. |
| `TS-any` | any | `any` | 4 | 2 | `scripts/close-walk-gaps.ts:42` | Escape hatch (4 hits — almost unused). | Turns off checking. | EXCLUDE from teaching app except as a warned anti-pattern. |
| `TS-as-assertion` | as assertion | `process.env.DATABASE_URL as string` | 558 | 152 | `scripts/check-access-table.ts:3` | Tell the checker a type. | Erased; can be wrong. | `as Light` after JSON.parse — pair with unknown + narrow. |
| `TS-as-const` | as const | `[ ["ch-text", 0], ["ch-email", 1], ["ch-form", 2], ] as const` | 243 | 91 | `scripts/verify-continuous-worker.ts:43` | Widen-no: literal + readonly. | Makes unions of literals. | `["on","off"] as const`. |
| `TS-satisfies` | satisfies | `[ { token: "text", ord: 0 }, { token: "email", ord: 1 },` | 3 | 3 | `server/wire-service/campaignHousing.ts:359` | Check against a type, keep inferred literals. | Tower uses it on system-map data. | Config object satisfies LightConfig. |
| `TS-non-null-assertion` | non-null assertion ! | `process.env.DATABASE_URL!` | 94 | 42 | `scripts/restore-channel-order.ts:3` | Assert not nullish. | Erased; runtime still throws if wrong. | `getElementById("root")!`. |
| `TS-typeof-type` | typeof type query | `typeof redeemBody` | 213 | 69 | `scripts/verify-access-link.ts:36` | Type from a value. | `typeof initialLight`. | Derive props from a sample. |
| `TS-keyof` | keyof | `keyof typeof MODULAR_RULE_TABLES` | 11 | 4 | `server/wire-service/machine.ts:1234` | Union of keys. | `keyof Light`. | Pick a field name. |
| `TS-indexed-access` | indexed access type | `AuditContactVerdict["verdict"]` | 110 | 51 | `server/wire-service/auditRun.ts:65` | `T[K]`. | Type of a property. | `Light["on"]`. |
| `TS-utility-Record` | Record<K,V> | `Record<string, string>` | 491 | 147 | `scripts/read-latest-otp.ts:7` | Object of keys K to V. | Mapped object type. | `Record<Id, Light>`. |
| `TS-utility-Partial` | Partial<T> | `Partial<Record<HolonId, HolonDetailContent>>` | 63 | 39 | `src/app/components/docs/holonDetailContent.ts:81` | All properties optional. | Mapped. | Patch update. |
| `TS-utility-Pick` | Pick<T,K> | `Pick<HTMLAttributes<HTMLDivElement>, "onClick" \| "onMouseEnter" \| "onMouseLeave"` | 8 | 6 | `src/app/components/docs/HolonBoundary.tsx:40` | Subset of keys. | Mapped. | List row vs detail row. |
| `TS-utility-Omit` | Omit<T,K> | `Omit<NodeInspectorPayload, "touchpointId" \| "sequenceId">` | 10 | 5 | `src/app/components/inspector/emailInspectorData.ts:254` | All keys except K. | Mapped. | Insert without id. |
| `TS-utility-Promise` | Promise<T> | `Promise<Buffer>` | 284 | 42 | `scripts/vercel-entries/fetchBridge.ts:11` | Async value of T. | Generic of Promise. | query(): Promise<Light>. |
| `TS-utility-Extract` | Extract<T,U> | `Extract<CampaignEntry, { kind: "thought" }>` | 13 | 6 | `src/app/components/EventsTab.tsx:379` | Keep members assignable to U. | Distributive. | Extract event kinds. |
| `TS-utility-Exclude` | Exclude<T,U> | `Exclude<WiringPaperSection, "overview" \| "function">` | 6 | 5 | `src/app/register/components/RegisterWiringPaperTree.tsx:377` | Drop members assignable to U. | Distributive. | Drop 'unknown' from union. |
| `TS-utility-NonNullable` | NonNullable<T> | `NonNullable<Extract<CampaignEntry, { kind: "step" }>["card"]>` | 6 | 6 | `src/app/components/EventsTab.tsx:427` | Drop null\|undefined. | Exclude. | After a find(). |
| `TS-utility-ReturnType` | ReturnType<T> | `ReturnType<typeof loadTemplateCells>` | 6 | 5 | `server/wire-service/cascade.ts:966` | Function's return type. | infer. | Type the loader from the function. |
| `TS-utility-Parameters` | Parameters<T> | `Parameters<typeof useEmblaCarousel>` | 5 | 4 | `src/app/components/ui/carousel.tsx:13` | Tuple of args. | infer. | Reuse a handler's args. |
| `TS-utility-Awaited` | Awaited<T> | `Awaited<ReturnType<typeof loadTemplateCells>>` | 1 | 1 | `server/wire-service/cascade.ts:966` | Unwrap Promise. | Recursive. | Type of awaited query. |
| `TS-type-predicate` | type predicate | `value is EscrowStatus` | 18 | 14 | `server/wire-service/operatorPanes.ts:24` | Narrow a value. | `x is Light`. | isOnEvent(row): row is OnEvent. |
| `TS-tuple` | tuple type | `[string, number]` | 6 | 5 | `scripts/restore-channel-order.ts:4` | Fixed-length array types. | `[boolean, number]`. | useState return type conceptually. |
| `TS-mapped-type` | mapped type | `{ [k in string]: { label?: React.ReactNode; icon?: React.ComponentType` | 1 | 1 | `src/app/components/ui/chart.tsx:11` | Transform each property. | Tower has 1 hit. | Show `{ [K in Kind]: number }`. |
| `TS-index-signature` | index signature | `[key: string]: unknown;` | 1 | 1 | `server/wire-service/cascade.ts:32` | `{ [key: string]: V }`. | 1 hit. Prefer Record. | Dictionary of flags. |
| `TS-generic-alias` | generic type alias | `type FormFieldContextValue< TFieldValues extends FieldValues = FieldValues,` | 2 | 2 | `src/app/components/ui/form.tsx:21` | `type Box<T> = { value: T }`. | 2 hits. | type Result<T> = { ok: T } \| { err: string }. |
| `TS-readonly-type` | readonly type | `readonly string[]` | 14 | 8 | `server/wire-service/operatorPanes.ts:25` | Readonly<T> / readonly T[]. | Prevents assignment in checker. | Freeze event log type. |
| `TS-export-type` | export type | (not detected in scanned files) | 0 | 0 | — | Re-export a type. | Erased. | Share Light type from types.ts. |
| `TS-no-enum` | enum (absent) | (not found) | 0 | 0 | — | TS enums are a runtime object. Tower does not use them. | Absence confirmed in scanned TS (no EnumDeclaration). | Do not introduce enum. Use union + as const. |
| `TS-no-interface` | interface (absent as a style) | (not found) | 0 | 0 | — | Tower names shapes with `type`, not `interface`. | 0 InterfaceDeclaration in scan. | Follow house style: type alias. |

## jsx

| ID | Name | Exact form | Occ | Files | Location | Purpose | Mechanism | Min demo |
|---|---|---|---|---|---|---|---|---|
| `JSX-element` | JSX element | `<TouchpointFocusProvider> <TaskProvider> <DocsHighlightProvider>` | 5222 | 286 | `src/app/App.tsx:72` | Write UI as nested tags. | Compile to React.createElement / jsx(). | <button>Flip</button> |
| `JSX-self-closing` | JSX self-closing | `<AppShell />` | 1804 | 280 | `src/app/App.tsx:78` | No children. | <Light on={on} /> | <Light on={on} /> |
| `JSX-fragment` | JSX fragment | `<>{children}</>` | 122 | 72 | `src/app/auth/AuthGate.tsx:15` | Group without a DOM node. | <>...</> or <Fragment>. | Return two children from Light. |
| `JSX-expression` | JSX expression | `{isPanelOpen}` | 13743 | 311 | `src/app/App.tsx:297` | Embed JS in markup. | {on ? "ON" : "OFF"} | Label the bit. |
| `JSX-spread-props` | JSX spread props | `{...holonInspectTargetProps(PHASE_SIGNAL_HOLON.id)}` | 290 | 74 | `src/app/components/BoardPanel.tsx:165` | Forward a props object. | {...rest} | Pass through to a Button. |
| `JSX-component` | JSX component | `TouchpointFocusProvider` | 3324 | 289 | `src/app/App.tsx:72` | Capitalized tag → function. | Must start with uppercase. | <Light /> |
| `JSX-intrinsic` | JSX intrinsic | `div` | 3702 | 256 | `src/app/App.tsx:311` | Lowercase → HTML element. | div, button, input. | <button type="button"> |

## sql

| ID | Name | Exact form | Occ | Files | Location | Purpose | Mechanism | Min demo |
|---|---|---|---|---|---|---|---|---|
| `SQL-create-table` | CREATE TABLE | `CREATE TABLE IF NOT EXISTS firms (` | 74 | 16 | `supabase/migrations/001_auth_tables.sql:7` | Declare a relation. | Catalog change. | lights(id, on, updated_at). |
| `SQL-alter-table` | ALTER TABLE | `ALTER TABLE consent_records` | 61 | 15 | `supabase/migrations/004_machine_tables.sql:8` | Evolve a relation. | Later migration, not edit-in-place of old files. | Add last_flipped_by. |
| `SQL-create-index` | CREATE INDEX | `CREATE INDEX IF NOT EXISTS users_firm_id_idx ON users (firm_id);` | 45 | 17 | `supabase/migrations/001_auth_tables.sql:21` | Accelerate a lookup. | B-tree (default). | Index lights.updated_at. |
| `SQL-insert` | INSERT | `INSERT INTO ct_collections (name) VALUES ('meeting_booked')` | 81 | 19 | `supabase/migrations/007_meeting_booked.sql:24` | Add rows. | ON CONFLICT in Tower. | Insert a flip event. |
| `SQL-update` | UPDATE | `UPDATE consent_records` | 13 | 7 | `supabase/migrations/004_machine_tables.sql:12` | Change rows. | SET + WHERE. | SET on = NOT on. |
| `SQL-delete` | DELETE | `DELETE FROM firm_sequence_binding WHERE template_id = 'tpl.launch_day.v1';` | 5 | 3 | `supabase/migrations/010_sequence_campaign_housing.sql:174` | Remove rows. | WHERE required in teaching. | Clear history. |
| `SQL-select` | SELECT | `SELECT 1 FROM workflow w` | 41 | 11 | `supabase/migrations/004_machine_tables.sql:450` | Read rows. | Projection + filter. | SELECT on FROM lights. |
| `SQL-join` | JOIN | (not detected in scanned files) | 0 | 0 | — | Combine relations. | INNER/LEFT in Tower. | Join events to users when Access exists. |
| `SQL-cte` | WITH (CTE) | (not detected in scanned files) | 0 | 0 | — | Named subquery. | Readability / recursion. | Optional; only if a query needs a name. |
| `SQL-jsonb` | JSONB | `payload JSONB` | 203 | 19 | `supabase/migrations/003_ct_wire_stores.sql:67` | JSON as a column. | Queryable JSON. Tower stores workflow.graph this way. | Optional payload JSONB on events — only when a utility needs unstructured extra. |
| `SQL-uuid` | UUID | `id UUID PRIMARY KEY DEFAULT gen_random_uuid(),` | 14 | 4 | `supabase/migrations/001_auth_tables.sql:8` | Typed identifier. | gen_random_uuid() in auth tables; TEXT ids elsewhere (two grains!). | Use UUID for lights.id in teaching (one grain). |
| `SQL-rls-enable` | ENABLE ROW LEVEL SECURITY | `EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);` | 3 | 2 | `supabase/migrations/004_machine_tables.sql:436` | Per-row policies. | Tower enables RLS; the Node app uses a service connection, so policies are not what the SPA currently feels. | Name it; do not pretend JWT RLS is how the desk is empty. Desk-empty = query returns no rows. |
| `SQL-policy` | CREATE POLICY | `'CREATE POLICY %I ON %I FOR ALL USING (firm_id = COALESCE(current_setting(''request.jwt.claims'', true)::jsonb->>''firm_` | 3 | 2 | `supabase/migrations/004_machine_tables.sql:439` | RLS rule. | USING / WITH CHECK. | Document as future/JWT; teaching app stays session-firm in the API. |
| `SQL-constraint` | constraints | `id UUID PRIMARY KEY DEFAULT gen_random_uuid(),` | 144 | 20 | `supabase/migrations/001_auth_tables.sql:8` | PK/FK/UNIQUE/CHECK. | Rejects bad writes. | PK on lights; FK from events. |
| `SQL-on-conflict` | ON CONFLICT | `ON CONFLICT (name) DO NOTHING;` | 78 | 17 | `supabase/migrations/007_meeting_booked.sql:25` | Upsert. | INSERT ... ON CONFLICT DO UPDATE. | Ensure a single light row. |
| `SQL-returning` | RETURNING | (not detected in scanned files) | 0 | 0 | — | Give back written row. | INSERT/UPDATE ... RETURNING *. | Return the new on flag. |
| `SQL-transaction` | BEGIN/COMMIT/ROLLBACK | `BEGIN` | 14 | 7 | `supabase/migrations/004_machine_tables.sql:426` | Atomic unit. | Tower withTransaction. | Flip + insert event atomically. |
| `SQL-parameter` | $n parameters | (not detected in scanned files) | 0 | 0 | — | Bind values; no string concat. | pg query(text, [values]). | query(..., [id]). |
| `SQL-no-function` | CREATE FUNCTION (absent) | (not found) | 0 | 0 | — | No stored functions in Tower migrations. | Scan found 0 CREATE FUNCTION. | Do not add PL/pgSQL to increase coverage. |

## css

| ID | Name | Exact form | Occ | Files | Location | Purpose | Mechanism | Min demo |
|---|---|---|---|---|---|---|---|---|
| `CSS-at-import` | @import | `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');` | 7 | 4 | `src/styles/fonts.css:1` | Compose stylesheets / Tailwind. | `@import "tailwindcss"`. | Entry CSS imports Tailwind. |
| `CSS-at-source` | @source | `@source '../**/*.{js,ts,jsx,tsx}';` | 1 | 1 | `src/styles/tailwind.css:2` | Tailwind 4 content sources. | `@source '../**/*.{tsx}'`. | Tell the compiler where classes live. |
| `CSS-custom-prop` | custom properties | `--font-size: 16px;` | 240 | 3 | `default_shadcn_theme.css:4` | Theme tokens. | `--background:`. | Color the ON/OFF states. |
| `CSS-var` | var() | `--color-background: var(--background);` | 181 | 4 | `default_shadcn_theme.css:82` | Use a token. | `color: var(--foreground)`. | Bind the light color to a token. |
| `CSS-at-media` | @media | `@media (max-width: 920px) {` | 2 | 1 | `src/styles/omcoda-marketing.css:526` | Viewport conditions. | Match media. | Stack controls on a narrow window. |
| `CSS-flex` | display:flex | `display: flex;` | 8 | 2 | `src/app/register/prototype-ant/antFill.css:3` | Arrange siblings in a row/column. | Flex formatting context. | Row: lamp + button. |
| `CSS-grid` | display:grid | `display: grid;` | 1 | 1 | `src/styles/omcoda-marketing.css:290` | 2D arrangement. | Grid formatting context. | History table. |

## html

| ID | Name | Exact form | Occ | Files | Location | Purpose | Mechanism | Min demo |
|---|---|---|---|---|---|---|---|---|
| `HTML-script-module` | HTML module script | `<script type="module"` | 2 | 2 | `index.html:19` | Boot ESM into the document. | <script type="module" src="/src/main.tsx"> — Vite transforms. | index.html mounts #root. |
| `HTML-root-div` | #root mount | `id="root"` | 2 | 2 | `index.html:18` | Empty node React owns. | createRoot(node).render(...) | div#root in index.html |

