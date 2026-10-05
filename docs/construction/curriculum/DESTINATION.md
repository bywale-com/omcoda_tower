# DESTINATION — the class of system, and the Tower test

**Mutability:** Versioned with [`JOURNEY.md`](./JOURNEY.md) if the destination spine of current Tower changes. Not a lesson.

This file specifies **behavioral and architectural convergence**, not dependency-version convergence.

Tower’s current pins (React 18.3.1, Vite 6.4.3, …) are **historical**. Construction uses **current stable** tooling unless a specific Tower *behavior* depends on an older version. As of the v2 stamp (2026-10): React 19.x, Vite 8.x, Tailwind 4, React Router 7, and the rest of [`TECHNOLOGY-MAP.md`](./TECHNOLOGY-MAP.md).

Rebuilding Tower’s Git history is not becoming capable of building Tower.

---

## The capability (graduation)

Not: reproduce `omcoda_tower`.  
Not: someone who understands why React Flow exists.  
Not: someone who can only work in Tower’s particular versions.

Yes:

> Become capable of constructing the **class of system** current Tower represents, with current Tower serving as the **convergence test** of that class — and of sitting down with an intended product, choosing and wielding a modern production stack, constructing it across browser / server / data / workers / integrations, verifying it, shipping it, observing it, and changing it safely, with enough underneath those tools that a stack change is not a collapse.

The class: a multi-desk, table-backed, firm-scoped engagement machine. An operator authors when-then operations and start-now missions as data the house can change without a code deploy. A runtime walks those graphs, accumulates writes, enrolls pursuit, owns one attempt at a time, and treats a goal as a binary event pointed at a real table. A consultant sees the book those rows produced. A contact writes back on a different face. The desk shows what the query returns.

That class is **not** the whole of product engineering. The late book (Epoch 11) is the rest: another machine can run it; every commit can prove it; it can ship; it can be observed; it can recover; it can survive load; another engineer can work in it.

---

## Two audits (TC-64)

1. **Convergence.** Can the learner account for and reconstruct the important **mechanisms** represented by current Tower (below)? Versions need not match. Leftovers stay leftovers.
2. **Transfer.** A small product requirement that does **not** exist in Tower. Without Tower as a template: information, state, relationships, behavior, boundaries, mechanisms — then **choose a stack** from the map for a reason, construct it, verify it, and name how it ships and is observed.

Transfer is graduation. Convergence without transfer is fluency in one building. Transfer without the underneath is a bootcamp.

---

## Convergence spine (what “account for Tower” means)

These are the constructions JOURNEY aims at. They are not a stack list and not a lockfile.

- Product face `/prototype-ant`: Operator, Consultant, Contact.
- Configuration libraries: Evaluation, Automations, Agents.
- Click the node = configure. `⋯` Switch changes kind. Palette Switch is the many-path node.
- After a node: the write-set is the shape. The next step picks. It does not guess.
- Save · Run · Launch. Test data on the trigger. Run walks now. Launch arms and must not walk.
- Sequence ⊃ campaigns ⊃ binary objectives. Channel rules escalate the medium. Attempt rules sit at their grain. Goal is an escalation point. Teaching copy is not a node.
- Enrollment, one active attempt, a time-path, consent/halt on send.
- Contact seat as a different question on the same records.
- Session + firm scoping.
- Records from tables; seeds so a module is not empty.
- Live send behind gates (Twilio / Resend as *ports*, not as personality).
- A walker that is data, not a second machine in the client.

Causal ring:

```
author → ignite a walk → a module writes → maybe enroll
      → worker may send → contact/consultant writes back
      → objective met or it ends → that write may be heard
```

---

## Production competence spine (what “account for a product engineer” means)

By TC-64 the learner must also have *used*, not merely named:

| Band | Competence |
|---|---|
| UI | CSS mechanisms, then Tailwind 4; primitives (shadcn/Radix-style); Ant literacy |
| App | React 19, Vite 8+, React Router 7, RHF + Zod, TanStack Query |
| Types | TypeScript strict, continuing; Zod at untrusted boundaries |
| Server | Node, raw HTTP, then Hono; OpenAPI |
| Data | PostgreSQL in depth, then Drizzle; S3-compatible uploads |
| Work | in-process tick, then Redis + BullMQ; webhooks |
| Verify | Vitest, RTL, MSW, Playwright |
| Operate | Docker, GitHub Actions, Vercel + env/secrets, OTel (Sentry optional), recover, load, repo standards |
| Contrast | one Next.js App Router slice **after** the explicit stack — the Construction book is not a Next app |

Exact arrival cycles: [`TECHNOLOGY-MAP.md`](./TECHNOLOGY-MAP.md).

---

## Not the spine

Exist in the repo; do not steer JOURNEY; name them at convergence as leftover or stand-in:

- Hub / holon inspector / planted people in components
- Meta ads, escrow fulfillment, warmup, enrich crawl (stand-ins)
- In-browser stand-in walker (`VITE_WIRE_REAL=false`)
- System Map as a product screen
- Dual tenancy leftover (UUID login firms vs TEXT CT `firm_id`)
- Tower’s historical React 18 / Vite 6 pins

---

## Honesty at convergence

If live Tower and a product law disagree, Construction follows the **law** and names the leftover. Example: handle = writes that run made (`PRIMITIVES.md`); do not teach Hub `lastOutput` as the live path.

Specified-and-clear gaps: keep constructing.  
Specified-but-not-clear (no SA store, incomplete packet): name why; do not invent a teaching table.

---

## Reference (inspect; do not copy as the lesson)

`omcoda_tower`: `src/app/register/prototype-ant/`, `server/wire-service/workflowWalk.ts`, `cascade.ts`, `worker.ts`, `runWrites.ts`, `supabase/migrations/`, `docs/register/DATA-IN-TABLES.md`, `PRIMITIVES.md`, `AGENTS-FACE.md`, `AUTOMATIONS-FACE.md`, `SYSTEMS-STORY.md`.
