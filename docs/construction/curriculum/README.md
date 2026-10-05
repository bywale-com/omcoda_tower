# Tower Construction — curriculum specification

This folder is the **skeleton** of the Tower Construction repository. It is the specification, not the textbook.

| File | Mutability | Job |
|---|---|---|
| [`JOURNEY.md`](./JOURNEY.md) | Versioned. | Contracts per cycle, including **Production bridge**. |
| [`TECHNOLOGY-MAP.md`](./TECHNOLOGY-MAP.md) | Versioned with JOURNEY. | Production technologies and **which construction earns them**. Practices vs logos. |
| [`RULES.md`](./RULES.md) | Hard. Founder acceptance. | Teaching law, including Production Bridge, Node split, cohort pin. |
| [`MASTERY.md`](./MASTERY.md) | Hard (with RULES). | What “learned” means. Bridge proofs. Practices as mastery. |
| [`DESTINATION.md`](./DESTINATION.md) | Versioned with JOURNEY. | Class of system. Cohort pins, not Tower lockfile, not silent “current stable.” |

**Law:** rudiment → mechanism → production bridge → production fluency.  
**Node:** toolchain host ≠ application runtime.  
**Pin:** current stable at first bridge for this JOURNEY cohort; then pin; upgrades are deliberate.

`book/epoch-<k>/` holds every **chapter in that epoch**. `constructions/tc-N/` and `my-work/tc-N/` are keyed by **cycle**.

| Epoch | Cycles | Folder | Fragment |
|---|---|---|---|
| 0 Appearance | TC-0–4 | `book/epoch-0/` | chain → occupant → CSS rudiment → layout → Tailwind **standalone CLI** |
| 1 Information | TC-5–8 | `book/epoch-1/` | behavior → state → list/selection |
| 2 Named constructions | TC-9–18 | `book/epoch-2/` | function → Vitest + **Node host** → component → TS arrives → React/Vite/lint → composition → shadcn/**Base UI** → Ant → RTL → **CI phase 1** |
| 3 Book that outlives the page | TC-19–26 | `book/epoch-3/` | **localStorage** → SQL from the **terminal** → query-as-source (ledger) → constraints (**CI+Postgres**) → tx → plans → schema evolution → Drizzle script |
| 4 Ask / answer | TC-27–33 | `book/epoch-4/` | **Node as product** + desk-as-query + **Compose (Postgres+API)** → Hono + **Pino** → Zod → Query → OpenAPI → MSW → **filter/sort/page** |
| 5 Two faces, prove, ship a slice | TC-34–39 | `book/epoch-5/` | RR7 → token → close-the-loop → RHF → **Playwright smoke** → **early deploy** |
| 6 Time, pursuit, goal | TC-40–45 | `book/epoch-6/` | **time as data** → tick → BullMQ + **Compose grows Redis/worker** → attempt → goal → sequence |
| 7 When → do → handle | TC-46–49 | `book/epoch-7/` | event → write-set → fork → walker as data |
| 8 Authoring faces | TC-50–52 | `book/epoch-8/` | click = configure → React Flow → Agents |
| 9 Tenancy, gates, outside | TC-53–59 | `book/epoch-9/` | session → **OIDC contrast** → Twilio/Resend → webhooks → Test/Run/Launch → Get/Rule/Wait → Local |
| 10 House, files, contrast | TC-60–62 | `book/epoch-10/` | house → S3 → one Next.js slice |
| 11 The software works | TC-63–72 | `book/epoch-11/` | Playwright full → production image → **CI proves the system** → full delivery → OTel → recover → load (data+desk) → repo → **upgrade exam** → convergence + transfer |

**JOURNEY version:** 3. TC-0–2 are stable. Do not regenerate them. Tailwind is TC-4 via standalone CLI — no `package.json` in that chapter.

**Reached:** [TC-3](./book/epoch-0/tc-3.md). Work it alone. Push `constructions/tc-3/page.html` and `my-work/tc-3/notes.md`.

**Validated:** [TC-0](./my-work/tc-0/evaluation.md) · [TC-1](./my-work/tc-1/evaluation.md) · [TC-2](./my-work/tc-2/evaluation.md).
