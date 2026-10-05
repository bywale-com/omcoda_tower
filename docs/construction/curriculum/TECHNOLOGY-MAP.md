# TECHNOLOGY-MAP — production competence, and which construction earns it

**Mutability:** Versioned with [`JOURNEY.md`](./JOURNEY.md) (currently **v2**). An agent must not add a library because it is fashionable, or omit a mandated bridge because the rudiment felt complete.  
**Companions:** JOURNEY = what constructions emerge. This file = what production technologies must be competent by graduation, and **which construction earns their arrival**.

---

## The two failures this file exists to prevent

```
bootcamp failure:
  Tailwind because "developers use Tailwind"

v1 curriculum failure:
  raw CSS forever because "we must understand the mechanism first"
```

Law (also in [`RULES.md`](./RULES.md) §2b):

> **Rudiment → mechanism → production bridge → production fluency.**

Feel the primitive. Build it once. Then graduate into the production representation. Point back at the mechanism so the tool is not magic. Then use the tool fluently until the next construction fails.

Current Tower’s pins (React 18.3, Vite 6.4, …) are **historical**. Construction uses **current stable** tooling unless a specific Tower *behavior* depends on an older version. See [`DESTINATION.md`](./DESTINATION.md).

---

## How a generator uses this file

When generating TC-N:

1. Read the JOURNEY contract (construction, must-not, production bridge).
2. Read this map: is a bridge **due** at this cycle? Is a **continuing spine** item forced by this construction (e.g. three write shapes → generics)?
3. Do not introduce a technology listed as “not yet” for this cycle.
4. Do not skip a bridge that this cycle’s contract names.
5. If the learner already rebuilt in the production tool, do not pretend they are still on the rudiment.

---

## Mandated spine

Arrival cycles match JOURNEY v2. “After” means the named construction has been felt.

| Area | Require | Rudiment | Mechanism | Bridge arrives | Fluency |
|---|---|---|---|---|---|
| Styling | CSS → **Tailwind CSS 4** (current stable) | one rule, selector, declaration (TC-2) | box, flex, grid, positioning, cascade, responsive (TC-3) | TC-4 rebuild in Tailwind; point utilities at CSS | Production UI is Tailwind; drop to CSS when the utility is insufficient |
| UI system | **shadcn/ui + Radix/Base UI primitives**; **Ant Design literacy** | own components (TC-11) | composition, accessible behavior, slots (TC-14–15) | TC-15 shadcn/Radix; TC-16 consume Ant | Can compose primitives and consume a vendor system without forking it blindly |
| Runtime | **Node.js** | JS in the browser (TC-5) | a process that is not the browser | TC-25, explicit, raw HTTP | Can run, debug, and env-configure a Node process |
| Language | **JavaScript → TypeScript strict** | JS as needed from TC-5 | types as constraints (TC-12) | strict mode from arrival; **spine continues** (below) | Can express and narrow real domain shapes |
| Runtime validation | **Zod** | TypeScript types (TC-12) | types erased at runtime; untrusted input | TC-27, at HTTP/data boundary | Parse incoming values; infer TS from the schema |
| React | **React 19** (current stable) | manual render / functions-as-page (TC-7–11) | renderer from information | TC-13 | Hooks, composition; effects only where warranted (TC-14) |
| Build | **Vite 8+** (current stable) | opening a file from disk (TC-0) | modules, HMR, env, build output | TC-13 with React | Can configure, env, plugin, read a build |
| Routing | **React Router 7** | two questions as two faces | location as information | TC-31, when one React app has multiple faces | Nested routes, loaders if earned — not a tour |
| Forms | **React Hook Form + Zod** | uncontrolled/controlled fields | nontrivial form state, validation | TC-34 | Can own a real form without reinventing it |
| Server state | **TanStack Query** | `fetch` in the component (TC-25) | client state ≠ server state; cache, invalidate, mutate | TC-28, after HTTP | Can say why a `useState` for the book is a lie |
| Backend | **Hono + Node** | raw `http` / request / response (TC-25) | HTTP conversation | TC-26, after the raw server | Can write routes, middleware, context |
| API | **HTTP + REST + OpenAPI** | one GET (TC-25) | request/response, status, payload | TC-29 contract after routes exist | Can publish and consume a contract |
| Data | **PostgreSQL + SQL** | a table, insert, select (TC-19) | schema, constraints, FK, null, transactions | deepen TC-20–23 | Can reason about the ledger without an ORM |
| DB tooling | **migrations, transactions, indexes, EXPLAIN**, then **Drizzle** | SQL by hand (TC-19–23) | the SQL Drizzle will emit | TC-24 | Drizzle is not magic; can drop to SQL |
| Files | **S3-compatible + signed URLs** | local file / blob in memory | bytes that are not rows | TC-54, when a seat must upload | No blobs in React state as the store |
| Jobs | in-process tick → **Redis + BullMQ** (or equivalent durable queue) | `setInterval` / manual tick (TC-35) | work outside a request; retry, backoff, idempotency | TC-36 | Can explain why the timer was insufficient |
| Messaging | **Twilio + Resend** | a row that means “would send” (TC-37) | live send, consent, halt, idempotency | TC-48 | Can send and forbid send |
| Webhooks | signed ingest, retries, idempotency | events you emit | events the outside emits | TC-49 | Can verify, retry, not double-apply |
| Unit/integration | **Vitest** | “I know what this should do” (TC-9) | invariant encoded | TC-10, after functions | Break the impl; the test catches it |
| UI tests | **React Testing Library** | Vitest on functions | rendered user behavior | TC-17, after React | Query by role/text, not internals |
| Network tests | **MSW** | fetching against a live server in tests | tests must not depend on the real net | TC-30 | Handler as the network |
| E2E | **Playwright** | unit + RTL + MSW | several real pieces together in a real browser | TC-56 | One user-visible workflow, real browsers |
| Containers | **Docker + Compose** | “works on my machine” | runtime + DB + worker as a repeatable unit | TC-57 | Another machine can run it |
| CI/CD | **GitHub Actions** | manual verify | every commit proves itself; then deploy | TC-58 CI; TC-59 CD | Typecheck, test, deploy; secrets in the environment |
| Observability | structured logs → **OpenTelemetry**, optionally **Sentry** | staring at a terminal | failure where you are not | TC-60 | Traces, metrics, logs; a crash you can find |
| Deployment | **Vercel** + managed DB + worker-capable runtime | local `vite` + `node` | ship repeatedly | TC-59 | Environments, not a laptop |
| Repo | npm fundamentals → **pnpm**; workspaces when earned | `package.json` at React/Vite | coordination across packages | TC-13 npm/pnpm; TC-63 workspaces if pressure | Lockfile, scripts, no cargo-cult monorepo |
| Quality | **ESLint + formatter** | human nitpicks | mechanical standards | TC-63 | Does not consume construction attention |
| Framework contrast | **Next.js App Router** | Vite + Hono + explicit boundary | what the framework hides | TC-55, **after** the explicit stack | One vertical slice; compare decisions |
| Graph UI | **React Flow** | list editor of a graph (TC-44) | topology you already walk | TC-45 | Editor, not a second machine |
| Browser | **DevTools** (Elements, Network, Console, Storage, Performance) | looking at the page | seeing interpretation, network, state | **every cycle from TC-0** | Not a chapter; a standing practice |
| Security | cookies, sessions, CORS, CSRF, XSS, CSP, SQLi, secrets, rate limits | each threat when the construction creates it | — | attached to cycles (below) | Not a “security week” |

---

## Continuing spines (not chapters)

These must **not** be “TC-12B — today’s lesson is generics.” They enter when a construction repeats a shape that needs them.

### TypeScript (arrives TC-12; never finishes there)

| When the construction does this | Force this |
|---|---|
| Name a shape | `type` / `interface`, annotations |
| Value may be missing | strict nullability, `undefined` vs `null` |
| Several exclusive variants | unions, literal types, narrowing, discriminated unions |
| Same relationship across different write/record shapes | generics (likely TC-39 or TC-41 — write-set, not a lecture) |
| Take a shape and pick parts | `Pick` / `Omit` / `Partial` / `Record` |
| Untrusted input | `unknown`, type guards; then Zod (TC-27) |
| “This should be impossible” | `never` (likely walker node kinds, TC-43) |
| Callbacks, maps, walkers | function types (TC-14 onward) |
| Server calls | `Promise<T>`, `async` (TC-25) |
| Files as boundaries | modules, type-only imports, inference |
| Mapped types | only where genuinely useful — not a catalog |

### JavaScript (from first script, TC-5; do not assume later)

Forced when needed: modules, closures, `this` only if earned, arrays/objects (map/filter/reduce), destructuring, spread, rest, higher-order functions, `Promise` / `async`/`await`, `try`/`catch`, errors as values vs throws.

### SQL (from first table, TC-19; not done at SELECT)

Forced as the ledger grows: schema, constraints, foreign keys, unique, nullability (TC-21), transactions, atomicity (TC-22), indexes, `EXPLAIN`, N+1, pools, migration safety, useful isolation/locking (TC-23). Then Drizzle (TC-24).

### Security (attach, do not stockpile)

| Construction | Threat |
|---|---|
| HTML with user-influenced text | XSS; later CSP |
| Cookie session (TC-47) | CSRF, cookie flags, theft |
| Browser asks another origin (TC-31+) | CORS |
| SQL with concatenated input (TC-25–26) | injection |
| Secrets in the client or git | secrets handling; CI/CD (TC-59) |
| Public send / login (TC-47–48) | rate limiting |
| Webhooks (TC-49) | signature, replay |

### DevTools

Standing. Elements from TC-1. Console from first script (TC-5). Network from first HTTP (TC-25). Storage from persistence/session. Performance when something is slow on purpose (TC-62).

### Testing

| Grain | Tool | Arrives |
|---|---|---|
| Invariant on a function | Vitest | TC-10 |
| Rendered user behavior | React Testing Library | TC-17 |
| Network as a test double | MSW | TC-30 |
| Several real pieces, real browser | Playwright | TC-56 |
| Walker / fork / configured-break | Vitest on the walk | TC-42–43, TC-50–51 |

---

## Explicitly not a first teacher

Do not start the book in **Next.js**. Do not rebuild the whole of Tower Construction as a Next app. The contrast cycle (TC-55) is one vertical slice after the explicit stack is understood.

Do not teach Tailwind before box/flex/grid/cascade have been constructed (TC-3 before TC-4). TC-2 is the CSS **rudiment** only.

Do not teach Drizzle before the learner can read the SQL (TC-19–23 before TC-24).

Do not teach TanStack Query as “how you fetch” before `fetch` and the lie of putting the book in `useState` have been felt (TC-25 before TC-28).

Do not teach BullMQ before the in-process tick has failed in the learner’s hands (TC-35 before TC-36).

Do not teach React Flow before the graph exists as data and a list editor has failed to show a fork (TC-43–44 before TC-45).

---

## Amendment log

| Version | Date | Change |
|---|---|---|
| 2 | 2026-10-05 | Initial map, stamped with JOURNEY v2. Arrival cycles TC-0–64. |
