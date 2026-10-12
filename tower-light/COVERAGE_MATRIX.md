# COVERAGE_MATRIX

Every catalogue ID appears exactly once. Stage `BIT-n` = proposed ONE BIT lesson. `EXCLUDE-*` = explicit exclusion (reason in the row). `GAP-*` = named gap, not silent.

No construction is allowed to vanish from this table.

| ID | Cat | Name | Lesson / exclusion | Tower evidence | Occ | Teaching-app use | Coverage criterion |
|---|---|---|---|---|---|---|---|
| `LANG-const` | language | const binding | BIT-2 | `scripts/bundle-vercel-api.mjs:7` | 7946 | Name the light's boolean; changing it requires a new binding or a setter, not `const light = !light` in place. | Source contains const binding; behaviour observable in the demo. |
| `LANG-let` | language | let binding | BIT-4 | `scripts/close-walk-gaps.ts:36` | 227 | Loop index or accumulating list before React state exists. | Source contains let binding; behaviour observable in the demo. |
| `LANG-arrow-function` | language | arrow function | BIT-3 | `scripts/close-walk-gaps.ts:14` | 4297 | Pass `() => setOn(!on)` to a click handler. | Source contains arrow function; behaviour observable in the demo. |
| `LANG-async-arrow` | language | async arrow | BIT-10 | `server/auth-service/routes.ts:137` | 86 | Click handler that `await fetch(...)`. | Source contains async arrow; behaviour observable in the demo. |
| `LANG-function-declaration` | language | function declaration | BIT-4 | `api/ping.ts:7` | 1891 | Extract `function isOn(row)` for a predicate. | Source contains function declaration; behaviour observable in the demo. |
| `LANG-async-function` | language | async function declaration | BIT-11 | `scripts/close-walk-gaps.ts:27` | 317 | Server route handler `async function toggle(c)`. | Source contains async function declaration; behaviour observable in the demo. |
| `LANG-function-expression` | language | function expression | BIT-3 | `scripts/vercel-entries/fetchBridge.ts:46` | 2 | Only if a library requires `function () {}`. | Source contains function expression; behaviour observable in the demo. |
| `LANG-await` | language | await | BIT-10 | `scripts/bundle-vercel-api.mjs:25` | 1456 | Await `pool.query` then return rows. | Source contains await; behaviour observable in the demo. |
| `LANG-try` | language | try | BIT-10 | `scripts/check-access-table.ts:4` | 193 | Wrap fetch; show error without crashing the light. | Source contains try; behaviour observable in the demo. |
| `LANG-catch-binding` | language | catch binding | BIT-10 | `scripts/run-migration.ts:26` | 90 | Log `err.message` when save fails. | Source contains catch binding; behaviour observable in the demo. |
| `LANG-optional-catch` | language | optional catch binding | BIT-9 | `scripts/close-walk-gaps.ts:39` | 79 | Ignore a JSON.parse failure on corrupt localStorage. | Source contains optional catch binding; behaviour observable in the demo. |
| `LANG-finally` | language | finally | BIT-12 | `scripts/check-access-table.ts:4` | 70 | Release a pg client after query. | Source contains finally; behaviour observable in the demo. |
| `LANG-throw` | language | throw | BIT-13 | `scripts/close-walk-gaps.ts:70` | 71 | Throw if `DATABASE_URL` missing at boot. | Source contains throw; behaviour observable in the demo. |
| `LANG-if` | language | if | BIT-16 | `scripts/close-walk-gaps.ts:29` | 2850 | If the light is on, record a flip. | Source contains if; behaviour observable in the demo. |
| `LANG-else` | language | else | BIT-16 | `scripts/close-walk-gaps.ts:94` | 206 | Else leave the light off. | Source contains else; behaviour observable in the demo. |
| `LANG-switch` | language | switch | BIT-16 | `server/wire-service/webhooks.ts:21` | 53 | Switch on event kind: `turn_on` / `turn_off`. | Source contains switch; behaviour observable in the demo. |
| `LANG-case` | language | case | BIT-16 | `server/wire-service/webhooks.ts:22` | 300 | See LANG-switch. | Source contains case; behaviour observable in the demo. |
| `LANG-default-clause` | language | default clause | BIT-16 | `server/wire-service/webhooks.ts:37` | 24 | Unknown event kind → ignore. | Source contains default clause; behaviour observable in the demo. |
| `LANG-ternary` | language | conditional expression | BIT-2 | `scripts/close-walk-gaps.ts:46` | 3165 | Button label `{on ? "ON" : "OFF"}`. | Source contains conditional expression; behaviour observable in the demo. |
| `LANG-for` | language | for loop | BIT-4 | `scripts/verify-affordance-roundtrip.ts:62` | 22 | Rare; prefer for-of. Use only when an index is the point. | Source contains for loop; behaviour observable in the demo. |
| `LANG-for-of` | language | for...of | BIT-7 | `scripts/bundle-vercel-api.mjs:24` | 270 | Walk query rows to build history. | Source contains for...of; behaviour observable in the demo. |
| `LANG-while` | language | while | BIT-15 | `scripts/verify-continuous-worker.ts:108` | 8 | Worker `while (running) await tick()`. Prefer `setInterval` in Tower's worker shape. | Source contains while; behaviour observable in the demo. |
| `LANG-break` | language | break | BIT-7 | `scripts/verify-continuous-worker.ts:116` | 69 | Stop scanning history at the first ON. | Source contains break; behaviour observable in the demo. |
| `LANG-continue` | language | continue | BIT-7 | `scripts/run-seed.ts:51` | 104 | Skip malformed history rows. | Source contains continue; behaviour observable in the demo. |
| `LANG-return` | language | return | BIT-1 | `scripts/close-walk-gaps.ts:17` | 4678 | Return JSX from the Light component. | Source contains return; behaviour observable in the demo. |
| `LANG-destructure-object` | language | object destructuring | BIT-4 | `scripts/pgConnect.ts:7` | 1009 | `const { on } = state`. | Source contains object destructuring; behaviour observable in the demo. |
| `LANG-destructure-array` | language | array destructuring | BIT-2 | `scripts/restore-channel-order.ts:9` | 821 | `const [on, setOn] = useState(false)`. | Source contains array destructuring; behaviour observable in the demo. |
| `LANG-spread` | language | spread (args/array) | BIT-4 | `scripts/copy-notion-icons.mjs:9` | 368 | `[...history, event]`. | Source contains spread (args/array); behaviour observable in the demo. |
| `LANG-spread-object` | language | object spread | BIT-4 | `scripts/close-walk-gaps.ts:11` | 681 | `{ ...row, on: true }`. | Source contains object spread; behaviour observable in the demo. |
| `LANG-rest-param` | language | rest parameter | BIT-4 | `src/app/components/ui/utils.ts:4` | 1 | Rare in Tower (1 hit). Demonstrate in a logger `log(kind, ...rest)`. | Source contains rest parameter; behaviour observable in the demo. |
| `LANG-default-param` | language | default parameter | BIT-4 | `scripts/close-walk-gaps.ts:27` | 82 | `function tick(now = new Date())`. | Source contains default parameter; behaviour observable in the demo. |
| `LANG-shorthand-property` | language | shorthand property | BIT-4 | `scripts/close-walk-gaps.ts:34` | 1455 | Return `{ on, at }` from an event. | Source contains shorthand property; behaviour observable in the demo. |
| `LANG-computed-property` | language | computed property | BIT-4 | `server/wire-service/cascade.ts:413` | 97 | Index events `{ [id]: row }`. | Source contains computed property; behaviour observable in the demo. |
| `LANG-template-literal` | language | template literal | BIT-2 | `scripts/bundle-vercel-api.mjs:35` | 2009 | Log `` `light ${on}` ``. | Source contains template literal; behaviour observable in the demo. |
| `LANG-template-literal-plain` | language | plain template (no subst.) | BIT-12 | `scripts/check-access-table.ts:5` | 578 | SQL query strings in pg. | Source contains plain template (no subst.); behaviour observable in the demo. |
| `LANG-optional-chain` | language | optional chaining | BIT-4 | `api/ping.ts:14` | 1224 | `event?.at` when history row may be missing. | Source contains optional chaining; behaviour observable in the demo. |
| `LANG-optional-call` | language | optional call | BIT-3 | `scripts/verify-continuous-worker.ts:160` | 50 | Optional callback `onFlip?.(next)`. | Source contains optional call; behaviour observable in the demo. |
| `LANG-optional-element` | language | optional element access | BIT-7 | `scripts/verify-affordance-roundtrip.ts:182` | 36 | `rows?.[0]`. | Source contains optional element access; behaviour observable in the demo. |
| `LANG-nullish-coalesce` | language | nullish coalescing | BIT-13 | `api/ping.ts:16` | 1899 | `process.env.PORT ?? 3001` — empty string is not defaulted (contrast \|\|). | Source contains nullish coalescing; behaviour observable in the demo. |
| `LANG-logical-and` | language | logical and | BIT-2 | `scripts/close-walk-gaps.ts:14` | 1286 | `{on && <span>lit</span>}`. | Source contains logical and; behaviour observable in the demo. |
| `LANG-logical-or` | language | logical or | BIT-13 | `api/ping.ts:16` | 1193 | Used in Tower; teaching app should contrast with ?? on env flags. | Source contains logical or; behaviour observable in the demo. |
| `LANG-strict-eq` | language | strict equality | BIT-2 | `scripts/close-walk-gaps.ts:111` | 3405 | `on === true`. | Source contains strict equality; behaviour observable in the demo. |
| `LANG-strict-neq` | language | strict inequality | BIT-10 | `scripts/close-walk-gaps.ts:69` | 467 | `status !== 200`. | Source contains strict inequality; behaviour observable in the demo. |
| `LANG-loose-eq` | language | loose equality | BIT-13 | `server/wire-service/cascade.ts:308` | 75 | Show `flag == true` vs `===` with string `'true'` from env. | Source contains loose equality; behaviour observable in the demo. |
| `LANG-loose-neq` | language | loose inequality | BIT-13 | `scripts/verify-modular-surfaces.ts:110` | 95 | Same demo as loose-eq. | Source contains loose inequality; behaviour observable in the demo. |
| `LANG-typeof` | language | typeof | BIT-5 | `scripts/vercel-entries/fetchBridge.ts:16` | 260 | Guard `typeof on === 'boolean'`. | Source contains typeof; behaviour observable in the demo. |
| `LANG-instanceof` | language | instanceof | BIT-10 | `scripts/verify-modular-surfaces.ts:407` | 35 | `err instanceof Error`. | Source contains instanceof; behaviour observable in the demo. |
| `LANG-in` | language | in operator | BIT-9 | `scripts/verify-deny-gates.ts:69` | 40 | Feature-detect localStorage in window. | Source contains in operator; behaviour observable in the demo. |
| `LANG-void` | language | void operator | BIT-15 | `server/wire-service/eventTest.ts:201` | 210 | Worker `void runTick()` in setInterval. | Source contains void operator; behaviour observable in the demo. |
| `LANG-delete` | language | delete | BIT-4 | `scripts/verify-boot-env.ts:27` | 27 | Prefer immutable spread in React; show once why delete fights React state. | Source contains delete; behaviour observable in the demo. |
| `LANG-new` | language | new | BIT-12 | `scripts/close-walk-gaps.ts:28` | 475 | `new Date()`, `new Pool()`. | Source contains new; behaviour observable in the demo. |
| `LANG-null` | language | null | BIT-12 | `api/ping.ts:17` | 3421 | SQL null vs JS null when a row is missing. | Source contains null; behaviour observable in the demo. |
| `LANG-undefined` | language | undefined | BIT-13 | `scripts/pgConnect.ts:14` | 400 | Missing env var. | Source contains undefined; behaviour observable in the demo. |
| `LANG-regex-literal` | language | RegExp literal | BIT-14 | `scripts/close-walk-gaps.ts:22` | 77 | Validate an access token shape. | Source contains RegExp literal; behaviour observable in the demo. |
| `LANG-import-named` | language | named import | BIT-1 | `scripts/check-access-table.ts:1` | 2051 | `import { useState } from "react"`. | Source contains named import; behaviour observable in the demo. |
| `LANG-import-default` | language | default import | BIT-12 | `scripts/bundle-vercel-api.mjs:4` | 59 | `import pg from "pg"`. | Source contains default import; behaviour observable in the demo. |
| `LANG-import-namespace` | language | namespace import | BIT-1 | `scripts/bundle-vercel-api.mjs:3` | 75 | Radix compound components. Teaching app: skip unless introducing Radix. | Source contains namespace import; behaviour observable in the demo. |
| `LANG-import-type-named` | language | type-only import | BIT-5 | `api/ping.ts:5` | 633 | Import a Row type without bundling a value. | Source contains type-only import; behaviour observable in the demo. |
| `LANG-import-inline-type` | language | inline type specifier | BIT-5 | `scripts/verify-continuous-worker.ts:11` | 394 | Same as type-only, mixed form. | Source contains inline type specifier; behaviour observable in the demo. |
| `LANG-import-side-effect` | language | side-effect import | BIT-0 | `src/app/components/hub/automation/AutomationWorkflowCanvas.tsx:14` | 10 | Load CSS from the entry. | Source contains side-effect import; behaviour observable in the demo. |
| `LANG-dynamic-import` | language | dynamic import() | BIT-15 | `scripts/verify-firm-binding.ts:267` | 21 | Tower: `await import("twilio")` so auth bundle can omit Twilio. Demo: lazy-load a History panel. | Source contains dynamic import(); behaviour observable in the demo. |
| `LANG-export-named` | language | named export | BIT-1 | `scripts/pgConnect.ts:9` | 2142 | Export the Light component. | Source contains named export; behaviour observable in the demo. |
| `LANG-export-default` | language | default export | BIT-1 | `api/ping.ts:7` | 7 | Rare in Tower (7). Prefer named in ONE BIT. | Source contains default export; behaviour observable in the demo. |
| `LANG-reexport-named` | language | re-export | BIT-11 | `api/auth.ts:3` | 98 | Barrel `wire/reals/index`. | Source contains re-export; behaviour observable in the demo. |
| `LANG-export-star` | language | export * | BIT-11 | `src/app/wire/index.ts:53` | 1 | One barrel. Don't hide graphs with barrels. | Source contains export *; behaviour observable in the demo. |
| `LANG-array.map` | language | Array.prototype.map | BIT-7 | `scripts/close-walk-gaps.ts:12` | 946 | Render `{history.map(row => <li key={row.id}>...`. | Source contains Array.prototype.map; behaviour observable in the demo. |
| `LANG-array.filter` | language | Array.prototype.filter | BIT-7 | `scripts/close-walk-gaps.ts:12` | 337 | History of ON events only. | Source contains Array.prototype.filter; behaviour observable in the demo. |
| `LANG-array.find` | language | Array.prototype.find | BIT-7 | `scripts/verify-affordance-roundtrip.ts:48` | 322 | Find the latest ON. | Source contains Array.prototype.find; behaviour observable in the demo. |
| `LANG-array.some` | language | Array.prototype.some | BIT-7 | `scripts/close-walk-gaps.ts:254` | 94 | Has the light ever been on? | Source contains Array.prototype.some; behaviour observable in the demo. |
| `LANG-array.every` | language | Array.prototype.every | BIT-7 | `src/app/components/JourneyTab.tsx:1869` | 18 | Are all events valid? | Source contains Array.prototype.every; behaviour observable in the demo. |
| `LANG-array.reduce` | language | Array.prototype.reduce | BIT-7 | `scripts/verify-affordance-roundtrip.ts:265` | 9 | Count ON events. | Source contains Array.prototype.reduce; behaviour observable in the demo. |
| `LANG-array.flatMap` | language | Array.prototype.flatMap | BIT-7 | `server/wire-service/workflowWalk.ts:288` | 23 | Expand an event into [from, to] chips. | Source contains Array.prototype.flatMap; behaviour observable in the demo. |
| `LANG-array.includes` | language | Array.prototype.includes | BIT-14 | `scripts/close-walk-gaps.ts:14` | 192 | `SEND_TEST_COHORT.split(",").includes(id)`. | Source contains Array.prototype.includes; behaviour observable in the demo. |
| `LANG-array.slice` | language | Array.prototype.slice | BIT-7 | `scripts/close-walk-gaps.ts:17` | 121 | Last 20 history rows. | Source contains Array.prototype.slice; behaviour observable in the demo. |
| `LANG-array.push` | language | Array.prototype.push | BIT-4 | `scripts/close-walk-gaps.ts:101` | 308 | Avoid on React state; show why spread is required. | Source contains Array.prototype.push; behaviour observable in the demo. |
| `LANG-array.sort` | language | Array.prototype.sort | BIT-7 | `scripts/run-migration.ts:16` | 73 | `[...rows].sort((a,b)=>...)`. | Source contains Array.prototype.sort; behaviour observable in the demo. |
| `LANG-array.join` | language | Array.prototype.join | BIT-4 | `scripts/bundle-vercel-api.mjs:8` | 82 | Join tags. | Source contains Array.prototype.join; behaviour observable in the demo. |
| `LANG-array.forEach` | language | Array.prototype.forEach | BIT-13 | `scripts/vercel-entries/fetchBridge.ts:81` | 12 | Prefer map in JSX; forEach in scripts. | Source contains Array.prototype.forEach; behaviour observable in the demo. |
| `LANG-promise.then` | language | Promise.then | BIT-10 | `scripts/verify-ship-spine.ts:179` | 67 | Tower still has it. Teaching: prefer await, show then as the same chain. | Source contains Promise.then; behaviour observable in the demo. |
| `LANG-promise.catch` | language | Promise.catch | BIT-10 | `scripts/verify-access-link.ts:46` | 66 | Show vs try/catch await. | Source contains Promise.catch; behaviour observable in the demo. |
| `LANG-promise.finally` | language | Promise.finally | BIT-10 | `src/app/register/prototype-ant/operator/AntAgentWorkbench.tsx:1239` | 3 | Clear a loading flag. | Source contains Promise.finally; behaviour observable in the demo. |
| `LANG-class-extends` | language | class extends | BIT-10 | `server/wire-service/sessionFirm.ts:14` | 3 | Custom `class WireError extends Error`. | Source contains class extends; behaviour observable in the demo. |
| `LANG-constructor` | language | constructor | BIT-10 | `server/wire-service/sessionFirm.ts:16` | 2 | See class extends. | Source contains constructor; behaviour observable in the demo. |
| `LANG-super` | language | super | BIT-10 | `server/wire-service/sessionFirm.ts:17` | 2 | See class extends. | Source contains super; behaviour observable in the demo. |
| `LANG-method` | language | class/object method | BIT-1 | `src/app/register/components/RegisterErrorBoundary.tsx:18` | 267 | Hono-adjacent objects; React class is not the product path. | Source contains class/object method; behaviour observable in the demo. |
| `LANG-this` | language | this | BIT-3 | `server/wire-service/sessionFirm.ts:18` | 5 | Show why arrows are used in handlers. | Source contains this; behaviour observable in the demo. |
| `LANG-computed-index` | language | computed index | BIT-11 | `scripts/verify-affordance-roundtrip.ts:64` | 472 | `ports[name]` in the wire registry. | Source contains computed index; behaviour observable in the demo. |
| `RT-fetch` | runtime | fetch | BIT-10 | `scripts/close-walk-gaps.ts:34` | 15 | POST /light/toggle with credentials include. | Call is in source and the demo observes the effect. |
| `RT-process-env` | runtime | process.env | BIT-13 | `api/ping.ts:14` | 402 | Read DATABASE_URL at boot. | Call is in source and the demo observes the effect. |
| `RT-import-meta-env` | runtime | import.meta.env | BIT-13 | `src/app/auth/AuthContext.tsx:46` | 14 | Read VITE_WIRE_REAL. | Call is in source and the demo observes the effect. |
| `RT-import-meta` | runtime | import.meta | BIT-13 | `scripts/copy-notion-icons.mjs:5` | 17 | Resolve files next to the module in scripts. | Call is in source and the demo observes the effect. |
| `RT-json-stringify` | runtime | JSON.stringify | BIT-9 | `api/ping.ts:11` | 255 | Body of fetch; localStorage payload. | Call is in source and the demo observes the effect. |
| `RT-json-parse` | runtime | JSON.parse | BIT-9 | `scripts/close-walk-gaps.ts:38` | 17 | Read localStorage; must try/catch. | Call is in source and the demo observes the effect. |
| `RT-map` | runtime | Map | BIT-4 | `server/wire-service/campaignHousing.ts:219` | 102 | Index rows by id without object prototype hazards. | Call is in source and the demo observes the effect. |
| `RT-set` | runtime | Set | BIT-4 | `server/wire-service/eventTest.ts:147` | 144 | Dedupe flipped-by users. | Call is in source and the demo observes the effect. |
| `RT-date` | runtime | Date | BIT-7 | `scripts/verify-author-runtime.ts:115` | 139 | Stamp a flip. | Call is in source and the demo observes the effect. |
| `RT-error` | runtime | Error | BIT-13 | `scripts/close-walk-gaps.ts:70` | 50 | Boot failure. | Call is in source and the demo observes the effect. |
| `RT-url` | runtime | URL | BIT-14 | `scripts/generate-holon-catalog-flat.mts:12` | 9 | PUBLIC_APP_URL join. | Call is in source and the demo observes the effect. |
| `RT-url-search-params` | runtime | URLSearchParams | BIT-8 | `src/app/wire/reals/auditTrail.ts:13` | 1 | Parse `?bit=1`. | Call is in source and the demo observes the effect. |
| `RT-headers` | runtime | Headers | BIT-10 | `scripts/close-walk-gaps.ts:28` | 3 | Set content-type + cookie. | Call is in source and the demo observes the effect. |
| `RT-request` | runtime | Request | BIT-11 | `scripts/vercel-entries/fetchBridge.ts:71` | 1 | Forward a request into Hono. | Call is in source and the demo observes the effect. |
| `RT-promise-new` | runtime | Promise constructor | BIT-10 | `scripts/vercel-entries/fetchBridge.ts:20` | 5 | Wrap a callback API. Prefer async function. | Call is in source and the demo observes the effect. |
| `RT-promise-all` | runtime | Promise.all | BIT-10 | `server/wire-service/machine.ts:737` | 25 | Parallel reads. | Call is in source and the demo observes the effect. |
| `RT-promise-resolve` | runtime | Promise.resolve | BIT-11 | `scripts/vercel-entries/fetchBridge.ts:15` | 28 | Stand-in ports returning resolved data. | Call is in source and the demo observes the effect. |
| `RT-localstorage-get` | runtime | localStorage.getItem | BIT-9 | `src/app/data/automationWorkflows.ts:1110` | 8 | Restore last light state. | Call is in source and the demo observes the effect. |
| `RT-localstorage-set` | runtime | localStorage.setItem | BIT-9 | `src/app/data/automationWorkflows.ts:1123` | 8 | Persist last light state. | Call is in source and the demo observes the effect. |
| `RT-sessionstorage-get` | runtime | sessionStorage.getItem | BIT-9 | `src/app/auth/AuthContext.tsx:22` | 3 | Tower: logged-out flag. Demo: 'don't restore this tab'. | Call is in source and the demo observes the effect. |
| `RT-sessionstorage-set` | runtime | sessionStorage.setItem | BIT-9 | `src/app/auth/AuthContext.tsx:30` | 3 | See get. | Call is in source and the demo observes the effect. |
| `RT-sessionstorage-remove` | runtime | sessionStorage.removeItem | BIT-9 | `src/app/auth/AuthContext.tsx:38` | 2 | Clear logged-out flag. | Call is in source and the demo observes the effect. |
| `RT-getelementbyid` | runtime | document.getElementById | BIT-1 | `src/app/components/JourneyTab.tsx:2747` | 3 | createRoot(document.getElementById("root")). | Call is in source and the demo observes the effect. |
| `RT-random-uuid` | runtime | crypto.randomUUID | BIT-7 | `src/app/wire/standins/machineApi.ts:2041` | 1 | Id for a history row. | Call is in source and the demo observes the effect. |
| `RT-structured-clone` | runtime | structuredClone | BIT-4 | `src/app/components/hub/automation/AutomationDetailView.tsx:75` | 17 | Copy a row before mutate. | Call is in source and the demo observes the effect. |
| `RT-is-array` | runtime | Array.isArray | BIT-5 | `scripts/vercel-entries/fetchBridge.ts:57` | 80 | Guard JSON payloads. | Call is in source and the demo observes the effect. |
| `RT-object-keys` | runtime | Object.keys | BIT-4 | `scripts/verify-automations-alive.ts:140` | 28 | Iterate a map-like object. | Call is in source and the demo observes the effect. |
| `RT-object-entries` | runtime | Object.entries | BIT-6 | `scripts/vercel-entries/fetchBridge.ts:55` | 17 | Build a Select from a record. | Call is in source and the demo observes the effect. |
| `RT-object-fromentries` | runtime | Object.fromEntries | BIT-6 | `scripts/close-walk-gaps.ts:11` | 9 | Parse form fields. | Call is in source and the demo observes the effect. |
| `RT-object-assign` | runtime | Object.assign | BIT-4 | `server/wire-service/workflowWalk.ts:1631` | 2 | Prefer object spread in React. | Call is in source and the demo observes the effect. |
| `RT-settimeout` | runtime | setTimeout | BIT-15 | `scripts/verify-continuous-worker.ts:36` | 1 | Debounce a save. | Call is in source and the demo observes the effect. |
| `RT-setinterval` | runtime | setInterval | BIT-15 | `server/wire-service/worker.ts:57` | 1 | Worker: interval → tickOnce. | Call is in source and the demo observes the effect. |
| `RT-console-log` | runtime | console.log | BIT-15 | `scripts/bundle-vercel-api.mjs:35` | 81 | Worker JSON log line. | Call is in source and the demo observes the effect. |
| `RT-add-event-listener` | runtime | window.addEventListener | BIT-9 | `src/app/App.tsx:228` | 16 | storage event to sync two tabs' light. | Call is in source and the demo observes the effect. |
| `RT-encode-uri` | runtime | encodeURIComponent | BIT-14 | `scripts/verify-session-firm.ts:53` | 121 | Encode $ in a password if shown in docs; encode token in /a/:token. | Call is in source and the demo observes the effect. |
| `TS-type-alias` | typescript | type alias | BIT-5 | `scripts/run-seed.ts:10` | 836 | Name `type LightState`. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-union` | typescript | union type | BIT-5 | `scripts/close-walk-gaps.ts:45` | 1871 | Event kind union. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-intersection` | typescript | intersection type | BIT-5 | `scripts/close-walk-gaps.ts:27` | 77 | Row & { on: boolean }. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-literal-type` | typescript | literal type | BIT-5 | `scripts/close-walk-gaps.ts:45` | 3185 | `as const` events. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-type-literal` | typescript | object type literal | BIT-5 | `scripts/close-walk-gaps.ts:25` | 1841 | Props of Light. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-optional-property` | typescript | optional property | BIT-5 | `scripts/close-walk-gaps.ts:25` | 1610 | Optional note on a flip. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-optional-param` | typescript | optional parameter | BIT-5 | `scripts/verify-modular-surfaces.ts:10` | 139 | Optional callback param. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-array-type` | typescript | T[] array type | BIT-5 | `scripts/read-latest-otp.ts:39` | 1486 | `Event[]`. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-Array-generic` | typescript | Array<T> | BIT-5 | `scripts/close-walk-gaps.ts:25` | 129 | When the generic form is clearer. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-type-arguments` | typescript | type arguments | BIT-5 | `scripts/close-walk-gaps.ts:25` | 1474 | useState<boolean>(false). | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-function-type` | typescript | function type | BIT-5 | `server/auth-service/db.ts:34` | 535 | onFlip: (next: boolean) => void. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-void` | typescript | void type | BIT-5 | `scripts/vercel-entries/fetchBridge.ts:30` | 559 | Click handler type. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-unknown` | typescript | unknown | BIT-5 | `scripts/close-walk-gaps.ts:25` | 531 | JSON.parse result as unknown. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-never` | typescript | never | BIT-16 | `scripts/verify-reference-persist.ts:51` | 12 | Default arm of event kind. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-any` | typescript | any | EXCLUDE-any | `scripts/close-walk-gaps.ts:42` | 4 | EXCLUDE from teaching app except as a warned anti-pattern. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-as-assertion` | typescript | as assertion | BIT-5 | `scripts/check-access-table.ts:3` | 558 | `as Light` after JSON.parse — pair with unknown + narrow. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-as-const` | typescript | as const | BIT-5 | `scripts/verify-continuous-worker.ts:43` | 243 | `["on","off"] as const`. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-satisfies` | typescript | satisfies | BIT-5 | `server/wire-service/campaignHousing.ts:359` | 3 | Config object satisfies LightConfig. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-non-null-assertion` | typescript | non-null assertion ! | BIT-1 | `scripts/restore-channel-order.ts:3` | 94 | `getElementById("root")!`. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-typeof-type` | typescript | typeof type query | BIT-5 | `scripts/verify-access-link.ts:36` | 213 | Derive props from a sample. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-keyof` | typescript | keyof | BIT-5 | `server/wire-service/machine.ts:1234` | 11 | Pick a field name. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-indexed-access` | typescript | indexed access type | BIT-5 | `server/wire-service/auditRun.ts:65` | 110 | `Light["on"]`. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-utility-Record` | typescript | Record<K,V> | BIT-5 | `scripts/read-latest-otp.ts:7` | 491 | `Record<Id, Light>`. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-utility-Partial` | typescript | Partial<T> | BIT-5 | `src/app/components/docs/holonDetailContent.ts:81` | 63 | Patch update. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-utility-Pick` | typescript | Pick<T,K> | BIT-5 | `src/app/components/docs/HolonBoundary.tsx:40` | 8 | List row vs detail row. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-utility-Omit` | typescript | Omit<T,K> | BIT-5 | `src/app/components/inspector/emailInspectorData.ts:254` | 10 | Insert without id. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-utility-Promise` | typescript | Promise<T> | BIT-10 | `scripts/vercel-entries/fetchBridge.ts:11` | 284 | query(): Promise<Light>. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-utility-Extract` | typescript | Extract<T,U> | BIT-5 | `src/app/components/EventsTab.tsx:379` | 13 | Extract event kinds. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-utility-Exclude` | typescript | Exclude<T,U> | BIT-5 | `src/app/register/components/RegisterWiringPaperTree.tsx:377` | 6 | Drop 'unknown' from union. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-utility-NonNullable` | typescript | NonNullable<T> | BIT-5 | `src/app/components/EventsTab.tsx:427` | 6 | After a find(). | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-utility-ReturnType` | typescript | ReturnType<T> | BIT-5 | `server/wire-service/cascade.ts:966` | 6 | Type the loader from the function. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-utility-Parameters` | typescript | Parameters<T> | BIT-5 | `src/app/components/ui/carousel.tsx:13` | 5 | Reuse a handler's args. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-utility-Awaited` | typescript | Awaited<T> | BIT-10 | `server/wire-service/cascade.ts:966` | 1 | Type of awaited query. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-type-predicate` | typescript | type predicate | BIT-5 | `server/wire-service/operatorPanes.ts:24` | 18 | isOnEvent(row): row is OnEvent. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-tuple` | typescript | tuple type | BIT-5 | `scripts/restore-channel-order.ts:4` | 6 | useState return type conceptually. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-mapped-type` | typescript | mapped type | BIT-5 | `src/app/components/ui/chart.tsx:11` | 1 | Show `{ [K in Kind]: number }`. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-index-signature` | typescript | index signature | BIT-5 | `server/wire-service/cascade.ts:32` | 1 | Dictionary of flags. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-generic-alias` | typescript | generic type alias | BIT-5 | `src/app/components/ui/form.tsx:21` | 2 | type Result<T> = { ok: T } \| { err: string }. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-readonly-type` | typescript | readonly type | BIT-5 | `server/wire-service/operatorPanes.ts:25` | 14 | Freeze event log type. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-export-type` | typescript | export type | BIT-5 | — | 0 | Share Light type from types.ts. | A type annotation using this form exists; tsc/bundler accepts it. |
| `TS-no-enum` | typescript | enum (absent) | EXCLUDE-enum | — | 0 | Do not introduce enum. Use union + as const. | Teaching app has zero enum. |
| `TS-no-interface` | typescript | interface (absent as a style) | EXCLUDE-interface | — | 0 | Follow house style: type alias. | Teaching app does not require interface. |
| `JSX-element` | jsx | JSX element | BIT-1 | `src/app/App.tsx:72` | 5222 | <button>Flip</button> | Element appears in the running page. |
| `JSX-self-closing` | jsx | JSX self-closing | BIT-1 | `src/app/App.tsx:78` | 1804 | <Light on={on} /> | Element appears in the running page. |
| `JSX-fragment` | jsx | JSX fragment | BIT-1 | `src/app/auth/AuthGate.tsx:15` | 122 | Return two children from Light. | Element appears in the running page. |
| `JSX-expression` | jsx | JSX expression | BIT-2 | `src/app/App.tsx:297` | 13743 | Label the bit. | Element appears in the running page. |
| `JSX-spread-props` | jsx | JSX spread props | BIT-1 | `src/app/components/BoardPanel.tsx:165` | 290 | Pass through to a Button. | Element appears in the running page. |
| `JSX-component` | jsx | JSX component | BIT-1 | `src/app/App.tsx:72` | 3324 | <Light /> | Element appears in the running page. |
| `JSX-intrinsic` | jsx | JSX intrinsic | BIT-1 | `src/app/App.tsx:311` | 3702 | <button type="button"> | Element appears in the running page. |
| `SQL-create-table` | sql | CREATE TABLE | BIT-12 | `supabase/migrations/001_auth_tables.sql:7` | 74 | lights(id, on, updated_at). | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-alter-table` | sql | ALTER TABLE | BIT-12 | `supabase/migrations/004_machine_tables.sql:8` | 61 | Add last_flipped_by. | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-create-index` | sql | CREATE INDEX | BIT-12 | `supabase/migrations/001_auth_tables.sql:21` | 45 | Index lights.updated_at. | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-insert` | sql | INSERT | BIT-12 | `supabase/migrations/007_meeting_booked.sql:24` | 81 | Insert a flip event. | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-update` | sql | UPDATE | BIT-12 | `supabase/migrations/004_machine_tables.sql:12` | 13 | SET on = NOT on. | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-delete` | sql | DELETE | BIT-12 | `supabase/migrations/010_sequence_campaign_housing.sql:174` | 5 | Clear history. | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-select` | sql | SELECT | BIT-12 | `supabase/migrations/004_machine_tables.sql:450` | 41 | SELECT on FROM lights. | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-join` | sql | JOIN | BIT-14 | — | 0 | Join events to users when Access exists. | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-cte` | sql | WITH (CTE) | BIT-12 | — | 0 | Optional; only if a query needs a name. | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-jsonb` | sql | JSONB | BIT-16 | `supabase/migrations/003_ct_wire_stores.sql:67` | 203 | Optional payload JSONB on events — only when a utility needs unstructured extra. | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-uuid` | sql | UUID | BIT-12 | `supabase/migrations/001_auth_tables.sql:8` | 14 | Use UUID for lights.id in teaching (one grain). | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-rls-enable` | sql | ENABLE ROW LEVEL SECURITY | BIT-12 | `supabase/migrations/004_machine_tables.sql:436` | 3 | Name it; do not pretend JWT RLS is how the desk is empty. Desk-empty = query returns no rows. | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-policy` | sql | CREATE POLICY | BIT-14 | `supabase/migrations/004_machine_tables.sql:439` | 3 | Document as future/JWT; teaching app stays session-firm in the API. | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-constraint` | sql | constraints | BIT-12 | `supabase/migrations/001_auth_tables.sql:8` | 144 | PK on lights; FK from events. | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-on-conflict` | sql | ON CONFLICT | BIT-12 | `supabase/migrations/007_meeting_booked.sql:25` | 78 | Ensure a single light row. | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-returning` | sql | RETURNING | BIT-12 | — | 0 | Return the new on flag. | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-transaction` | sql | BEGIN/COMMIT/ROLLBACK | BIT-12 | `supabase/migrations/004_machine_tables.sql:426` | 14 | Flip + insert event atomically. | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-parameter` | sql | $n parameters | BIT-12 | — | 0 | query(..., [id]). | SQL runs in migrate/seed or query; result visible on the desk. |
| `SQL-no-function` | sql | CREATE FUNCTION (absent) | EXCLUDE-sql-fn | — | 0 | Do not add PL/pgSQL to increase coverage. | Teaching app has no stored procedures unless a later need appears. |
| `CSS-at-import` | css | @import | BIT-13 | `src/styles/fonts.css:1` | 7 | Entry CSS imports Tailwind. | Visible on the page / DevTools. |
| `CSS-at-source` | css | @source | BIT-13 | `src/styles/tailwind.css:2` | 1 | Tell the compiler where classes live. | Visible on the page / DevTools. |
| `CSS-custom-prop` | css | custom properties | BIT-0 | `default_shadcn_theme.css:4` | 240 | Color the ON/OFF states. | Visible on the page / DevTools. |
| `CSS-var` | css | var() | BIT-0 | `default_shadcn_theme.css:82` | 181 | Bind the light color to a token. | Visible on the page / DevTools. |
| `CSS-at-media` | css | @media | BIT-0 | `src/styles/omcoda-marketing.css:526` | 2 | Stack controls on a narrow window. | Visible on the page / DevTools. |
| `CSS-flex` | css | display:flex | BIT-0 | `src/app/register/prototype-ant/antFill.css:3` | 8 | Row: lamp + button. | Visible on the page / DevTools. |
| `CSS-grid` | css | display:grid | BIT-7 | `src/styles/omcoda-marketing.css:290` | 1 | History table. | Visible on the page / DevTools. |
| `HTML-script-module` | html | HTML module script | BIT-0 | `index.html:19` | 2 | index.html mounts #root. | Page loads the app. |
| `HTML-root-div` | html | #root mount | BIT-0 | `index.html:18` | 2 | div#root in index.html | React paints into it. |
| `HTML-dual-document` | architecture | dual HTML documents (MPA isolation) | BIT-21 | `vite.config.ts:96` | 2 | ONE BIT stays one document. Teach the dual-entry as a later isolation lesson without adding a second domain. | Learner can point at vite.config build.rollupOptions.input. |
| `API-REACT-createRoot` | api | createRoot | BIT-1 | `src/main.tsx:7` | 4 | createRoot(#root).render(<Light />) | The named API is invoked and the demo shows its effect. |
| `API-REACT-createPortal` | api | createPortal | BIT-6 | `react-dom` | 2 | Optional modal for confirm flip. Skip if a simple dialog suffices. | The named API is invoked and the demo shows its effect. |
| `API-REACT-useState` | api | useState | BIT-2 | `react` | 2009 | const [on, setOn] = useState(false) | The named API is invoked and the demo shows its effect. |
| `API-REACT-useEffect` | api | useEffect | BIT-9 | `react` | 2009 | Subscribe to /light or persist. | The named API is invoked and the demo shows its effect. |
| `API-REACT-useMemo` | api | useMemo | BIT-7 | `react` | 2009 | Filter history. | The named API is invoked and the demo shows its effect. |
| `API-REACT-useCallback` | api | useCallback | BIT-3 | `react` | 2009 | Pass flip to a child. | The named API is invoked and the demo shows its effect. |
| `API-REACT-useRef` | api | useRef | BIT-15 | `react` | 2009 | Focus the button; hold interval id. | The named API is invoked and the demo shows its effect. |
| `API-REACT-useContext` | api | useContext | BIT-11 | `src/app/auth/AuthContext.tsx` | 2009 | Session / firm / light store. | The named API is invoked and the demo shows its effect. |
| `API-REACT-createContext` | api | createContext + Provider | BIT-11 | `react` | 1 | LightProvider wrapping the app. | The named API is invoked and the demo shows its effect. |
| `API-RR-BrowserRouter` | api | BrowserRouter | BIT-8 | `src/app/Router.tsx:27` | 40 | ONE BIT: introduce Router when History is a URL, not a tab. | The named API is invoked and the demo shows its effect. |
| `API-RR-Routes` | api | Routes / Route | BIT-8 | `src/app/Router.tsx` | 40 | `/` Light, `/history` list. | The named API is invoked and the demo shows its effect. |
| `API-RR-Navigate` | api | Navigate | BIT-8 | `src/app/Router.tsx` | 40 | Auth off → home. | The named API is invoked and the demo shows its effect. |
| `API-RR-useNavigate` | api | useNavigate | BIT-8 | `react-router` | 40 | After flip, go to /history. | The named API is invoked and the demo shows its effect. |
| `API-RR-useLocation` | api | useLocation | BIT-8 | `react-router` | 40 | Highlight the active path. | The named API is invoked and the demo shows its effect. |
| `API-ANTD-controls` | api | antd controls (Button, Input, Select, Modal, Tag, Space, Typography, Table) | BIT-1 | prototype-ant | 2664 | Use Button + Typography for the switch. Table for history. Do not import the whole catalog. | The named API is invoked and the demo shows its effect. |
| `API-ANTD-icons` | api | @ant-design/icons | BIT-1 | prototype-ant | 172 | One lamp icon. Not 58 icons. | The named API is invoked and the demo shows its effect. |
| `API-XYFLOW` | api | @xyflow/react canvas | BIT-16 | Hub + Ant workbench | 224 | A graph of flips is artificial until Automation. Introduce when a rule is a node, not a if-statement. | The named API is invoked and the demo shows its effect. |
| `API-LUCIDE` | api | lucide-react icons | EXCLUDE-lucide | Hub | 560 | EXCLUDE from ONE BIT if Ant icons are in use — second icon pack is not a new mechanism. | The named API is invoked and the demo shows its effect. |
| `API-RADIX-COMPOUND` | api | Radix compound primitives | EXCLUDE-radix | src/app/components/ui | 40 | Hub/shadcn. ONE BIT uses Ant. Contrast lesson: a primitive kit vs a painted kit — do not add Radix to raise coverage. | The named API is invoked and the demo shows its effect. |
| `API-CVA` | api | class-variance-authority | EXCLUDE-cva | ui/button | 13 | EXCLUDE unless not using Ant. | The named API is invoked and the demo shows its effect. |
| `API-CLS-MERGE` | api | clsx + tailwind-merge | BIT-13 | src/app/components/ui | 2 | Useful even on Ant? Only if className assembly is real. Optional BIT-13. | The named API is invoked and the demo shows its effect. |
| `API-RECHARTS` | api | recharts | BIT-7 | Hub + Ant client panel | 54 | Count of ON vs OFF over time — optional History polish, not a new domain. | The named API is invoked and the demo shows its effect. |
| `API-RHF` | api | react-hook-form | EXCLUDE-rhf | src/app/components/ui/form.tsx | 8 | EXCLUDE until a form is actually wired. Controlled inputs are enough first. | The named API is invoked and the demo shows its effect. |
| `API-SONNER` | api | sonner toaster | EXCLUDE-sonner | sonner.tsx | 3 | EXCLUDE (dead on product face). | The named API is invoked and the demo shows its effect. |
| `API-NEXT-THEMES` | api | next-themes | EXCLUDE-next-themes | sonner.tsx | 2 | EXCLUDE. Not Next.js; don't add a Next theme layer. | The named API is invoked and the demo shows its effect. |
| `API-VAUL` | api | vaul drawer | EXCLUDE-vaul | ui/drawer | 18 | EXCLUDE with Radix. | The named API is invoked and the demo shows its effect. |
| `API-CMDK` | api | cmdk | EXCLUDE-cmdk | ui/command | 15 | EXCLUDE. | The named API is invoked and the demo shows its effect. |
| `API-EMBLA` | api | embla-carousel-react | EXCLUDE-embla | ui/carousel | 5 | EXCLUDE. | The named API is invoked and the demo shows its effect. |
| `API-OTP` | api | input-otp | BIT-14 | ui/input-otp | 5 | BIT-14 if the login UI is built; else EXCLUDE-widget. | The named API is invoked and the demo shows its effect. |
| `API-DAY-PICKER` | api | react-day-picker | EXCLUDE-day-picker | ui/calendar | 3 | EXCLUDE unless History filters by day. | The named API is invoked and the demo shows its effect. |
| `API-RESIZABLE` | api | react-resizable-panels | EXCLUDE-resizable | ui/resizable | 8 | EXCLUDE. | The named API is invoked and the demo shows its effect. |
| `API-PAPAPARSE` | api | papaparse | EXCLUDE-csv | parseCsvPreview.ts | 4 | Artificial for a single light. EXCLUDE unless importing a list of switches. | The named API is invoked and the demo shows its effect. |
| `API-HONO-APP` | api | Hono app | BIT-11 | server/auth-service | 11 | POST /light/toggle. | The named API is invoked and the demo shows its effect. |
| `API-HONO-SERVE` | api | serve (Node adapter) | BIT-11 | `server/auth-service/index.ts:24` | 2 | Listen :3001. | The named API is invoked and the demo shows its effect. |
| `API-HONO-COOKIE` | api | getCookie / setCookie / deleteCookie | BIT-14 | `server/auth-service/routes.ts` | 16 | Set session after login; read on /light. | The named API is invoked and the demo shows its effect. |
| `API-HONO-CORS` | api | cors middleware | BIT-11 | hono/cors | 2 | Allow the Vite origin. | The named API is invoked and the demo shows its effect. |
| `API-PG-POOL` | api | pg.Pool | BIT-12 | `server/auth-service/db.ts:20` | 10 | One pool for the light DB. | The named API is invoked and the demo shows its effect. |
| `API-PG-QUERY` | api | client.query | BIT-12 | `server/auth-service/db.ts:61` | 10 | SELECT/UPDATE the light. | The named API is invoked and the demo shows its effect. |
| `API-PG-TX` | api | connect + BEGIN/COMMIT | BIT-12 | `server/auth-service/db.ts:33` | 10 | Flip + event insert. | The named API is invoked and the demo shows its effect. |
| `API-RESEND` | api | Resend emails | BIT-18 | server/wire-service/resendClient.ts | 4 | Email 'light turned ON' — artificial unless Access needs mail. Optional BIT-18. | The named API is invoked and the demo shows its effect. |
| `API-TWILIO` | api | Twilio SMS (dynamic import) | BIT-18 | `server/wire-service/twilioClient.ts:7` | 1 | SMS on flip — artificial. Same pattern as optional native dep. Teach the dynamic import even if SMS is dry-run. | The named API is invoked and the demo shows its effect. |
| `API-NODE-CRYPTO` | api | node:crypto | BIT-14 | server/auth-service/crypto.ts | 115 | Session token hash; CSRF-ish compare. | The named API is invoked and the demo shows its effect. |
| `API-NODE-FS` | api | node:fs | BIT-13 | scripts/run-migration.ts | 21 | Migration runner. | The named API is invoked and the demo shows its effect. |
| `API-NODE-PATH` | api | node:path | BIT-13 | scripts | 28 | Locate supabase/migrations. | The named API is invoked and the demo shows its effect. |
| `API-NODE-DNS` | api | node:dns ipv4first | BIT-12 | `server/auth-service/db.ts:5` | 4 | Keep on the pg helper. Observable as 'connection works on IPv4-only'. | The named API is invoked and the demo shows its effect. |
| `API-VITE-DEFINE-CONFIG` | api | defineConfig | BIT-13 | `vite.config.ts:19` | 2 | vite.config.ts for ONE BIT. | The named API is invoked and the demo shows its effect. |
| `API-VITE-REACT-PLUGIN` | api | @vitejs/plugin-react | BIT-13 | `vite.config.ts:24` | 2 | Enable JSX. | The named API is invoked and the demo shows its effect. |
| `API-VITE-TAILWIND-PLUGIN` | api | @tailwindcss/vite | BIT-13 | `vite.config.ts:25` | 2 | utilities on the Light. Point at compiled CSS. | The named API is invoked and the demo shows its effect. |
| `API-ESBUILD-BUNDLE` | api | esbuild.build | BIT-21 | scripts/bundle-vercel-api.mjs | 2 | Only when introducing Vercel split. Local ONE BIT can skip. | The named API is invoked and the demo shows its effect. |
| `EXCLUDE-mui` | api | MUI + Emotion (declared, zero imports) | EXCLUDE-mui | package.json | 0 | Do not install to raise coverage. | package.json in ONE BIT does not include this unless a real need appears. |
| `EXCLUDE-dnd` | api | react-dnd (declared, zero imports) | EXCLUDE-dnd | package.json | 0 | Do not install to raise coverage. | package.json in ONE BIT does not include this unless a real need appears. |
| `EXCLUDE-slick` | api | react-slick (declared, zero imports) | EXCLUDE-slick | package.json | 0 | Do not install to raise coverage. | package.json in ONE BIT does not include this unless a real need appears. |
| `EXCLUDE-masonry` | api | react-responsive-masonry (declared, zero imports) | EXCLUDE-masonry | package.json | 0 | Do not install to raise coverage. | package.json in ONE BIT does not include this unless a real need appears. |
| `EXCLUDE-popper` | api | react-popper / @popperjs/core (declared, zero imports) | EXCLUDE-popper | package.json | 0 | Do not install to raise coverage. | package.json in ONE BIT does not include this unless a real need appears. |
| `EXCLUDE-confetti` | api | canvas-confetti (declared, zero imports) | EXCLUDE-confetti | package.json | 0 | Do not install to raise coverage. | package.json in ONE BIT does not include this unless a real need appears. |
| `EXCLUDE-motion` | api | motion (declared, zero imports) | EXCLUDE-motion | package.json | 0 | Do not install to raise coverage. | package.json in ONE BIT does not include this unless a real need appears. |
| `EXCLUDE-date-fns` | api | date-fns (declared, zero TS imports) | EXCLUDE-date-fns | package.json | 0 | Do not install to raise coverage. | package.json in ONE BIT does not include this unless a real need appears. |
| `CFG-package-scripts` | config | package.json scripts as entry points | BIT-13 | package.json | 1 | scripts: dev, dev:api, db:migrate, worker. | Config exists and the named behaviour is observable. |
| `CFG-tsx-env-file` | config | tsx --env-file=.env | BIT-13 | package.json | 1 | Run the API with .env. | Config exists and the named behaviour is observable. |
| `CFG-type-module` | config | "type": "module" | BIT-13 | package.json | 1 | All local files ESM. | Config exists and the named behaviour is observable. |
| `CFG-tsconfig` | config | tsconfig strict ESM bundler | BIT-5 | tsconfig.json | 1 | Match Tower: strict, noEmit, isolatedModules. | Config exists and the named behaviour is observable. |
| `CFG-vite-proxy` | config | Vite proxy /auth /wire | BIT-11 | vite.config.ts:68 | 1 | fetch('/light') hits the API. | Config exists and the named behaviour is observable. |
| `CFG-vite-alias` | config | path alias @ → src | BIT-13 | vite.config.ts:85 | 1 | @/light — optional; relative is fine first. | Config exists and the named behaviour is observable. |
| `CFG-vite-define` | config | vite define client flags | BIT-13 | vite.config.ts:51 | 1 | Default AUTH_DISABLED in dev. | Config exists and the named behaviour is observable. |
| `CFG-vite-mpa` | config | Vite multi-page input | BIT-21 | vite.config.ts:96 | 1 | Isolation lesson BIT-21. ONE BIT uses one input until then. | Config exists and the named behaviour is observable. |
| `CFG-vercel-rewrites` | config | Vercel rewrites | BIT-21 | vercel.json | 1 | When deploying. | Config exists and the named behaviour is observable. |
| `CFG-vercel-cron` | config | Vercel cron tick | BIT-15 | vercel.json:20 | 1 | Prefer BIT-15 process first; cron is another trigger of the same tick. | Config exists and the named behaviour is observable. |
| `CFG-docker-worker` | config | Docker Compose worker | BIT-15 | Dockerfile.worker | 1 | Same tickOnce as `npm run worker`. | Config exists and the named behaviour is observable. |
| `CFG-ci-ship` | config | GitHub Actions + Postgres service | BIT-20 | .github/workflows/ship.yml | 1 | ONE BIT: migrate + a query test + npm run build. | Config exists and the named behaviour is observable. |
| `CFG-env-database-url` | config | DATABASE_URL | BIT-12 | .env.example | 1 | Required for BIT-12. | Config exists and the named behaviour is observable. |
| `CFG-env-send-mode` | config | SEND_MODE fail-closed | BIT-18 | .env.example | 1 | Mail/SMS lessons stay dry_run until a cohort is set. | Config exists and the named behaviour is observable. |
| `CFG-env-auth-disabled` | config | VITE_AUTH_DISABLED / AUTH_DISABLED | BIT-14 | vite.config.ts | 1 | Start true; turn false when Access is the lesson. | Config exists and the named behaviour is observable. |
| `CFG-gitignore-env` | config | .gitignore secrets | BIT-13 | .gitignore | 1 | Keep secrets out of git. | Config exists and the named behaviour is observable. |
| `CFG-pnpm-workspace` | config | pnpm-workspace (single package) | EXCLUDE-monorepo | pnpm-workspace.yaml | 1 | Don't invent packages to look like a monorepo. | Config exists and the named behaviour is observable. |
| `ARCH-standin-vs-real` | architecture | stand-in vs real ports | BIT-11 | src/app/wire/registry.ts | 1 | Fake light store, then swap to pg without changing the button. | Pattern is named in notes and exercised by a test or visible behaviour. |
| `ARCH-session-firm` | architecture | session cookie binds firm | BIT-14 | server/wire-service/sessionFirm.ts | 1 | A second user cannot flip your light. | Pattern is named in notes and exercised by a test or visible behaviour. |
| `ARCH-credentials-include` | architecture | fetch credentials: include | BIT-14 | src/app/wire/http.ts:12 | 1 | Login then toggle. | Pattern is named in notes and exercised by a test or visible behaviour. |
| `ARCH-write-set` | architecture | write-set after a step | BIT-16 | server/wire-service/workflowWalk.ts | 1 | After flip, history reads the write (on, at) rather than a global catalog. | Pattern is named in notes and exercised by a test or visible behaviour. |
| `ARCH-workflow-walk` | architecture | validated workflow walk | BIT-16 | server/wire-service/workflowWalk.ts | 1 | ONE BIT: a two-node graph (when flipped → record). Do not rewrite a second machine. | Pattern is named in notes and exercised by a test or visible behaviour. |
| `ARCH-worker-tick` | architecture | time path vs event path | BIT-15 | server/wire-service/cascade.ts | 1 | If ON for N seconds, auto-off. Same tick function from process and HTTP. | Pattern is named in notes and exercised by a test or visible behaviour. |
| `ARCH-two-id-grains` | architecture | UUID firms vs TEXT firm_id | GAP-two-grains | supabase/migrations/001 vs 003 | 1 | ONE BIT: pick UUID and stay there. Name the Tower split as a gap, don't reproduce it. | Pattern is named in notes and exercised by a test or visible behaviour. |
| `ARCH-data-in-tables` | architecture | desk shows the query | BIT-12 | supabase/seeds | 1 | Delete the light row; page is empty. | Pattern is named in notes and exercised by a test or visible behaviour. |
| `ARCH-boot-env` | architecture | boot assertions | BIT-13 | server/wire-service/bootEnv.ts | 1 | Start API without DATABASE_URL → crash with a named error. | Pattern is named in notes and exercised by a test or visible behaviour. |
| `ARCH-verify-scripts` | architecture | verify scripts instead of unit runner | BIT-20 | package.json | 1 | ONE BIT: one verify-light.ts that flips and asserts the row. | Pattern is named in notes and exercised by a test or visible behaviour. |
| `ARCH-wire-http-prefix` | architecture | same app, two prefixes | BIT-11 | server/auth-service/index.ts | 1 | Proxy both or pick one in ONE BIT and name the other. | Pattern is named in notes and exercised by a test or visible behaviour. |

## Counts by stage

| Stage | Count |
|---|---|
| BIT-0 | 7 |
| BIT-1 | 17 |
| BIT-10 | 18 |
| BIT-11 | 14 |
| BIT-12 | 26 |
| BIT-13 | 26 |
| BIT-14 | 12 |
| BIT-15 | 10 |
| BIT-16 | 10 |
| BIT-18 | 3 |
| BIT-2 | 8 |
| BIT-20 | 2 |
| BIT-21 | 4 |
| BIT-3 | 5 |
| BIT-4 | 19 |
| BIT-5 | 40 |
| BIT-6 | 3 |
| BIT-7 | 18 |
| BIT-8 | 6 |
| BIT-9 | 11 |
| EXCLUDE-any | 1 |
| EXCLUDE-cmdk | 1 |
| EXCLUDE-confetti | 1 |
| EXCLUDE-csv | 1 |
| EXCLUDE-cva | 1 |
| EXCLUDE-date-fns | 1 |
| EXCLUDE-day-picker | 1 |
| EXCLUDE-dnd | 1 |
| EXCLUDE-embla | 1 |
| EXCLUDE-enum | 1 |
| EXCLUDE-interface | 1 |
| EXCLUDE-lucide | 1 |
| EXCLUDE-masonry | 1 |
| EXCLUDE-monorepo | 1 |
| EXCLUDE-motion | 1 |
| EXCLUDE-mui | 1 |
| EXCLUDE-next-themes | 1 |
| EXCLUDE-popper | 1 |
| EXCLUDE-radix | 1 |
| EXCLUDE-resizable | 1 |
| EXCLUDE-rhf | 1 |
| EXCLUDE-slick | 1 |
| EXCLUDE-sonner | 1 |
| EXCLUDE-sql-fn | 1 |
| EXCLUDE-vaul | 1 |
| GAP-two-grains | 1 |

Catalogue size: **285**.
