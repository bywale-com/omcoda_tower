# TECHNOLOGY-MAP — production competence, and which construction earns it

**Mutability:** Versioned with [`JOURNEY.md`](./JOURNEY.md) (currently **v3**). An agent must not add a library because it is fashionable, or omit a mandated bridge because the rudiment felt complete.  
**Companions:** JOURNEY = what constructions emerge. This file = what production technologies must be competent by graduation, and **which construction earns their arrival**.

---

## The two failures this file exists to prevent

```
bootcamp failure:
  Tailwind because "developers use Tailwind"

v1 curriculum failure:
  raw CSS forever because "we must understand the mechanism first"

v2 leftover:
  production engineering as a sequence of late logos
  (CI at TC-58, Compose at TC-57, first e2e after live sends)
```

Law (also in [`RULES.md`](./RULES.md) §2b):

> **Rudiment → mechanism → production bridge → production fluency.**

Practices become **permanent early** and grow. Late cycles deepen what the learner has lived with.

---

## Toolchain baseline (not “always current stable”)

For **this JOURNEY version / cohort**, pin at first bridge:

| Tool | Cohort baseline (v3, 2026-10) |
|---|---|
| React | 19.x |
| Vite | 8.x |
| Tailwind | 4.x |
| React Router | 7.x |
| TypeScript | current strict-capable |
| Node | current LTS at first toolchain cycle |
| Vitest / Playwright / Hono / Zod / TanStack Query / Drizzle / others | current stable **at first bridge**, then **pin in the Construction repo** |

Upgrades are **deliberate amendments** (and the TC-71 exam), not silent drift. TC-13 and TC-47 must not regenerate months apart on different majors because the internet moved. Tower’s historical pins (React 18.3, Vite 6.4) remain **not** the destination.

---

## Node is two constructions

```
Node as TOOLCHAIN HOST          ≠          Node as APPLICATION RUNTIME
(Vitest, Vite, CLIs, scripts)              (the process IS the product)
        TC-10, deepened TC-13                        TC-27
```

**Tailwind TC-4 explicit decision:** compile with the **standalone CLI**. Do not smuggle `package.json` / Vite into appearance. Name the Vite plugin as the usual production install; earn it at TC-13 when the toolchain host exists.

---

## How a generator uses this file

When generating TC-N:

1. Read the JOURNEY contract (construction, must-not, production bridge).
2. Read this map: is a bridge **due**? is a **spine** item forced?
3. Do not introduce a technology listed as “not yet.”
4. Do not skip a bridge this cycle names.
5. If the learner already rebuilt in the production tool, do not pretend they are still on the rudiment.
6. Grow CI / Compose / Playwright / deploy — do not “rediscover” them.

---

## Mandated spine

Arrival cycles match JOURNEY v3.

| Area | Require | Rudiment | Mechanism | Bridge arrives | Fluency |
|---|---|---|---|---|---|
| Styling | CSS → **Tailwind CSS 4** | TC-2 rule | TC-3 box/flex/grid/cascade/responsive | TC-4 **standalone CLI**; TC-13 Vite plugin (toolchain completion) | Production UI is Tailwind; drop to CSS when insufficient |
| UI primitives | **shadcn/ui + Base UI** | own components (TC-11) | headless accessible primitives | TC-15 | One primitive stack. **Radix = existing-system literacy** (read, don’t dual-master). **React Aria is not required.** |
| Vendor UI | **Ant Design literacy** | primitives owned | inheriting a comprehensive vendor system | TC-16 | Consume without forking blindly |
| Toolchain runtime | **Node as host** | JS in the browser | a process that runs tools | TC-10 (Vitest); TC-13 (Vite, lint, env, modules) | `package.json`, lockfile, scripts, `node_modules`, CLI, exit codes — causal, not encyclopedic |
| Application runtime | **Node as product** | toolchain Node | a process that *is* the software | TC-27 raw HTTP | PID, port, env, signals, stdio |
| Language | **JS → TS strict** | JS from TC-5 | types as constraints (TC-12) | strict from arrival; **spine continues** | Real domain shapes |
| Runtime validation | **Zod** | TS types | types erased; untrusted input | TC-29 | Parse; infer TS from schema |
| React | **React 19** (cohort) | manual render | renderer from information | TC-13 | Hooks; effects only where warranted (TC-14) |
| Build | **Vite 8+** (cohort) | file from disk | modules, HMR, env, build | TC-13 | Configure, env, plugin, read a build |
| Quality scripts | **ESLint + formatter + typecheck** | human nitpicks | mechanical standards as scripts | **TC-13** (not late ops) | Does not consume construction attention |
| Routing | **React Router 7** | two questions | location as information | TC-34 | Nested routes/loaders if earned |
| Forms | **React Hook Form + Zod** | field state pile | nontrivial form | TC-37 | Own a real form |
| Server state | **TanStack Query** | `fetch` in the component | client state ≠ server state | TC-30 | Why `useState` for the book is a lie |
| Backend | **Hono + Node** | raw `http` (TC-27) | HTTP conversation | TC-28 | Routes, middleware, context |
| App logs | **Pino** (or equivalent) | `console.log` | structured logs as data | **TC-28** with Hono | Request/job ids *before* tracing |
| API | **HTTP + REST + OpenAPI** | one GET | request/response | TC-31 | Publish and consume a contract |
| List query | filter / sort / pagination | `SELECT *` | one intention across layers | **TC-33** | SQL → API params → OpenAPI → Query keys → URL |
| Data | **PostgreSQL + SQL** | table, insert, select (TC-20) | constraints, tx, plans | TC-21–24 | Ledger without an ORM |
| Schema evolution | backfill / expand-contract | `CREATE TABLE` | existing rows change the construction | **TC-25** | Cannot just add `NOT NULL` |
| DB abstraction | **Drizzle** | SQL by hand | the SQL it emits | TC-26 | Drop to SQL |
| Files | **S3-compatible + signed URLs** | blob in memory | bytes that are not rows | TC-61 | No blobs in React state as the store |
| Time as data | timestamptz, zones | `Date` / strings | instant ≠ wall clock ≠ duration | **TC-40** | UTC in ledger; zone at edge |
| Jobs | tick → **Redis + BullMQ** | `setInterval` (TC-41) | work outside a request | TC-42 | Why the timer was insufficient |
| Local orchestration | **Docker Compose** | many processes | start the system consistently | **TC-42** with the worker | `docker compose up` is not magic |
| Production images | **Docker** image/layers/health | Compose bind mounts | the artifact you ship | **TC-64** | Build vs runtime |
| Messaging | **Twilio + Resend** | would-send row | live send, consent, halt | TC-55 | Send and forbid send |
| Webhooks | signed ingest | events you emit | events the outside emits | TC-56 | Verify, retry, not double-apply |
| Session auth | cookies/sessions | contact token | returning consultant | TC-53 | First-party; not a vendor |
| Federated auth | **OAuth 2 / OIDC** contrast | first-party session | external assertion mapped inward | **TC-54** | One provider; no vendor tourism |
| Unit tests | **Vitest** | “I know what this should do” | encoded invariant | TC-10 | Break the impl; test catches it |
| UI tests | **RTL** | Vitest on functions | rendered user behavior | TC-17 | Query by role/text |
| Network tests | **MSW** | live net in tests | handler is the network | TC-32 | |
| E2E smoke | **Playwright** small | unit/RTL/MSW | first real multi-face loop | **TC-38** | Close-the-loop in a real browser; stays |
| E2E full | **Playwright** serious | smoke | worker, failure paths, browsers | **TC-63** | |
| CI | **GitHub Actions** growing | local `pnpm test` | proofs on every push | **TC-18** phase 1; grows at API/e2e; **TC-65** full-system prove | TC-65 is not “discover CI” |
| Early deploy | hosted slice | localhost | program runs where I am not | **TC-39** | One web, one API, one DB, one env |
| Delivery | **Vercel** + managed DB + worker runtime | early slice | full system, staging, CD, rollback, DNS/TLS | **TC-66** | |
| Observability | Pino → **OpenTelemetry** (Sentry optional) | staring at a terminal | failure where you are not | TC-67 (logs already exist) | Correlate, don’t invent logs |
| Repo | npm fundamentals → **pnpm**; workspaces if earned | `package.json` at TC-10 | coordination | TC-13 pnpm; TC-70 workspaces if pressure | No cargo-cult monorepo |
| Framework contrast | **Next.js App Router** | Vite + Hono | what the framework hides | TC-62 **after** the explicit stack | One slice; book is not Next |
| Graph UI | **React Flow** | list editor (TC-50) | topology you already walk | TC-51 | Editor, not a second machine |
| Upgrade | one deliberate major/meaningful bump | pinned cohort | stack change without collapse | **TC-71** | Changelog, fix, prove |

---

## Continuing spines (not chapters)

### TypeScript (arrives TC-12; never finishes)

| When the construction does this | Force this |
|---|---|
| Name a shape | `type` / `interface`, annotations |
| Value may be missing | strict nullability |
| Exclusive variants | unions, literals, narrowing, discriminated unions |
| Same relationship across write/record shapes | generics (likely TC-45 or TC-47) |
| Take a shape and pick parts | `Pick` / `Omit` / `Partial` / `Record` |
| Untrusted input | `unknown`, type guards; then Zod (TC-29) |
| Impossible | `never` (walker kinds, TC-49) |
| Callbacks | function types (TC-14+) |
| Server calls | `Promise<T>`, `async` (TC-27) |
| Files as boundaries | modules, type-only imports, inference |

### JavaScript (from TC-5)

Modules, closures, arrays/objects, destructuring, spread, higher-order functions, `Promise` / `async`/`await`, errors — when needed, not assumed.

### SQL (from TC-20)

Constraints (TC-22), transactions (TC-23), indexes/EXPLAIN/N+1/pools (TC-24), **schema evolution** (TC-25), **pagination/filter/sort** as a vertical (TC-33), then Drizzle (TC-26).

### Accessibility (from TC-1; not TC-15’s side effect)

Semantic HTML; label/control; keyboard; focus; accessible name; roles only when semantics don’t exist; contrast at useful grain; forms/errors; dialog focus; announcements when required. RTL queries by role (TC-17).

### Git (envelope from TC-0; craft grows)

Assumed as envelope: clone, edit, commit, push. **Not** assumed as craft. Force: branch before an intentional break (TC-10+); read a diff before calling a cycle done; conflict when two representations touch one area; `bisect` when a regression is “three commits ago”; revert vs deploy-rollback (TC-68); tags at useful depth; history as diagnosis.

### Systems / tooling (when a process exists)

Terminal, PATH, env vars, processes, PIDs, exit codes, signals, ports, stdin/stdout/stderr, pipes, `curl`, filesystem paths, permissions at useful depth, “which process owns this port?”, “what environment is this process reading?”, “what did this command return?”. TC-10: runner process and exit codes. TC-13: dev server port, env. TC-27: the app process. TC-41–42: a worker dying. Compose isolates what you can already name.

### Networking (beneath HTTP)

Host, port, IP, DNS, origin, TCP at useful grain, TLS, certificate, reverse proxy, domain, localhost, CORS, HTTP caching headers, CDN at useful grain. TC-27: localhost/port. TC-34: origin/CORS. TC-39: first public URL, DNS/TLS as facts. TC-66: custom domain, certificate, edge — not “here is a URL” again.

### Security (attach)

| Construction | Threat |
|---|---|
| User-influenced HTML | XSS; later CSP |
| Cookie session (TC-53) | CSRF, cookie flags, theft |
| Other origin (TC-34+) | CORS |
| Concatenated SQL (TC-27–28) | injection |
| Secrets in client or git | secrets; CI/CD |
| Public send / login | rate limiting |
| Webhooks (TC-56) | signature, replay |

### DevTools

Standing. Elements TC-1. Console TC-5. Network TC-27. Storage persistence/session. Performance TC-69.

### Testing and CI (grow)

| Grain | When |
|---|---|
| Vitest local | TC-10 |
| Lint/format/typecheck scripts | TC-13 |
| RTL | TC-17 |
| **CI phase 1** (install → typecheck → lint → unit/UI) | **TC-18** |
| CI + DB / integration | TC-27 era |
| MSW | TC-32 |
| Playwright smoke + CI | TC-38 |
| Playwright full + worker | TC-63 |
| CI proves full system | TC-65 |
| CD | TC-66 |

### Time

Instant / zone / wall clock / duration / deadline: **TC-40**, before time as cause.

---

## Explicitly not mandatory

Do not start in **Next.js**. Do not rebuild Construction as a Next app.

Do not require equal fluency in Base UI + Radix + React Aria + Ant.

Do not add as mandatory: Kubernetes, Kafka, Terraform/OpenTofu, GraphQL, gRPC, three clouds, four state managers, six auth vendors.

That is logo tourism. The capability:

```
I can work below the abstraction.
I can work fluently at the abstraction.
I can tell when the abstraction is wrong.
I can debug the system around it.
I can replace it.
I can ship what I built.
I can prove it works.
I can see when it doesn't.
I can change it without fear.
```

---

## Explicitly not a first teacher

Tailwind before TC-3. Package.json at TC-4. Drizzle before SQL. Query before `fetch`. BullMQ before the tick fails. React Flow before the graph is data. OTel as the first logger. CI as a late-book surprise. Next as the first stack. Native `Temporal` as the sole time answer.

---

## Amendment log

| Version | Date | Change |
|---|---|---|
| 2 | 2026-10-05 | Initial map with JOURNEY v2 (TC-0–64). |
| 3 | 2026-10-05 | JOURNEY v3. Node split. Tailwind standalone CLI. Early CI/lint/Playwright/Compose/deploy. New spines. Cohort pin + TC-71 upgrade. Base UI default. Pino. Time/pagination/evolution/OIDC. |
