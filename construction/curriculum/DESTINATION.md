# DESTINATION — the class of system, and the Tower test

**Mutability:** Versioned with [`JOURNEY.md`](./JOURNEY.md) if the destination spine of current Tower changes. Not a lesson.

This file specifies **behavioral and architectural convergence**, not dependency-version convergence with live Tower, and not “whatever is newest on the internet this week.”

---

## Toolchain law

Tower’s pins (React 18.3.1, Vite 6.4.3, …) are **historical**. Construction does **not** inherit them unless a specific Tower *behavior* depends on the older version.

Construction also does **not** silently track “current stable” forever.

> **Current stable at first bridge for this JOURNEY version/cohort; then pinned in the Construction repository. Upgrades are deliberate amendments, not silent drift.**

**JOURNEY v3 cohort (stamped 2026-10):** React 19.x, Vite 8.x, Tailwind 4.x, React Router 7.x, Node current LTS at first toolchain cycle. Other tools: current stable **at their first bridge**, then pin. Exact names: [`TECHNOLOGY-MAP.md`](./TECHNOLOGY-MAP.md).

TC-71 is the exam: upgrade one meaningful dependency on purpose. “The stack changed and I didn’t collapse” is part of graduation.

Rebuilding Tower’s Git history is not becoming capable of building Tower.

---

## The capability (graduation)

Not: reproduce `omcoda_tower`.  
Not: someone who understands why React Flow exists.  
Not: someone who has touched many logos.

Yes:

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

And: construct the **class of system** current Tower represents (Tower = convergence test), while owning ordinary product-engineering practices — Git, processes, networking, tests, CI from early on, timezones, pagination, incremental deployment — not only libraries.

The class: a multi-desk, table-backed, firm-scoped engagement machine. An operator authors when-then operations and start-now missions as data the house can change without a code deploy. A runtime walks those graphs, accumulates writes, enrolls pursuit, owns one attempt at a time, and treats a goal as a binary event pointed at a real table. A consultant sees the book those rows produced. A contact writes back on a different face. The desk shows what the query returns.

That class is not the whole of product engineering. Practices start in the middle of the book and the last epoch **deepens** them: the image, full-system CI, delivery, traces, recover, load (data *and* desk), repo, upgrade, then audits.

---

## Two audits (TC-72)

1. **Convergence.** Account for and reconstruct the important **mechanisms** represented by current Tower. Versions need not match Tower. Cohort pins need not match “today’s latest.” Leftovers stay leftovers.
2. **Transfer.** A small product that does **not** exist in Tower. Without Tower as a template: information, state, relationships, behavior, boundaries, mechanisms — then **choose a stack** from the map for a reason, construct it, encode important invariants, **run them in CI**, **deploy at least one working environment that is not localhost**, and demonstrate one operational signal appropriate to its scope. “I know how I would deploy this” does not pass. Do not invent Tower’s whole infrastructure for a product that does not need it.

Transfer is graduation. Convergence without transfer is fluency in one building. Transfer without the underneath is a bootcamp.

---

## Convergence spine (what “account for Tower” means)

- Product face `/prototype-ant`: Operator, Consultant, Contact.
- Configuration libraries: Evaluation, Automations, Agents.
- Click the node = configure. `⋯` Switch changes kind. Palette Switch is the many-path node.
- After a node: the write-set is the shape. The next step picks. It does not guess.
- Save · Run · Launch. Test data on the trigger. Run walks now. Launch arms and must not walk.
- Sequence ⊃ campaigns ⊃ binary objectives. Channel rules escalate the medium. Attempt rules sit at their grain. Goal is an escalation point. Teaching copy is not a node.
- Enrollment, one active attempt, a time-path **with timezone-correct instants**, consent/halt on send.
- Contact seat as a different question on the same records.
- Session + firm scoping (first-party). Federated identity recognized as a class, not the first teacher.
- Records from tables; seeds so a module is not empty; lists are queried (filter/sort/page), not `SELECT *`.
- Live send behind gates (Twilio / Resend as *ports*).
- A walker that is data, not a second machine in the client.

Causal ring:

```
author → ignite a walk → a module writes → maybe enroll
      → worker may send → contact/consultant writes back
      → objective met or it ends → that write may be heard
```

---

## Production competence spine

By TC-72 the learner must have *used*, not merely named:

| Band | Competence |
|---|---|
| UI | CSS mechanisms → Tailwind 4 (standalone, then Vite plugin); shadcn + **Base UI**; Radix literacy; Ant literacy |
| App | React 19, Vite 8+, RR7, RHF + Zod, TanStack Query |
| Types | TypeScript strict, continuing; Zod at boundaries |
| Server | Node host then Node product; raw HTTP then Hono; **Pino**; OpenAPI |
| Data | PostgreSQL in depth, evolution/backfill, pagination vertical, then Drizzle; S3-compatible uploads |
| Time | timestamptz / zone / duration before ticks and queues |
| Work | in-process tick, then Redis + BullMQ; webhooks |
| Verify | Vitest, RTL, MSW, Playwright smoke then full; **CI from TC-18**, grown to full-system |
| Operate | Compose locally from first API+Postgres; images later; early **synthetic** slice deploy then full delivery; OTel over existing logs; recover; load (query *and* desk); repo standards; one upgrade |
| Contrast | one Next.js slice after the explicit stack; one OIDC mapping after first-party sessions |
| Craft | Git, systems/tooling, networking, accessibility as spines |

Exact arrivals: [`TECHNOLOGY-MAP.md`](./TECHNOLOGY-MAP.md).

**Not mandatory:** Kubernetes, Kafka, Terraform/OpenTofu, GraphQL, gRPC, three clouds, four state managers, six auth vendors, React Aria as a second primitive stack.

---

## Not the spine

Name at convergence as leftover or stand-in:

- Hub / holon inspector / planted people in components
- Meta ads, escrow fulfillment, warmup, enrich crawl (stand-ins)
- In-browser stand-in walker (`VITE_WIRE_REAL=false`)
- System Map as a product screen
- Dual tenancy leftover
- Tower’s historical React 18 / Vite 6 pins

---

## Honesty at convergence

If live Tower and a product law disagree, Construction follows the **law** and names the leftover. Example: handle = writes that run made (`PRIMITIVES.md`); do not teach Hub `lastOutput` as the live path.

Specified-and-clear gaps: keep constructing.  
Specified-but-not-clear: name why; do not invent a teaching table.

---

## Reference (inspect; do not copy as the lesson)

`omcoda_tower`: `src/app/register/prototype-ant/`, `server/wire-service/workflowWalk.ts`, `cascade.ts`, `worker.ts`, `runWrites.ts`, `supabase/migrations/`, `docs/register/DATA-IN-TABLES.md`, `PRIMITIVES.md`, `AGENTS-FACE.md`, `AUTOMATIONS-FACE.md`, `SYSTEMS-STORY.md`.
