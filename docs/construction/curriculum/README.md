# Tower Construction — curriculum specification

This folder is the **skeleton** of the Tower Construction repository. It is the specification, not the textbook.

| File | Mutability | Job |
|---|---|---|
| [`JOURNEY.md`](./JOURNEY.md) | Versioned. Amend deliberately (split/merge, version stamp). | Complete table of contents. One **contract** per planned cycle. Includes **Production bridge**. Not a lesson. |
| [`TECHNOLOGY-MAP.md`](./TECHNOLOGY-MAP.md) | Versioned with JOURNEY. | What production technologies must be competent by graduation, and **which construction earns their arrival**. |
| [`RULES.md`](./RULES.md) | Hard to change. Founder acceptance required. | How any agent turns a contract into a chapter, and how teaching must operate — including the Production Bridge law. |
| [`MASTERY.md`](./MASTERY.md) | Hard to change (with RULES). | What “learned” means. Proofs. Bridge proofs. Tests as invariants. Fails. |
| [`DESTINATION.md`](./DESTINATION.md) | Versioned with JOURNEY if Tower’s destination spine changes. | The class of system. Behavioral/architectural convergence — not lockfile pins. Transfer graduation. |

**Law:** rudiment → mechanism → production bridge → production fluency.

`book/epoch-<k>/` holds every **chapter in that epoch**, not one cycle per folder.

| Epoch | Cycles | Folder | Fragment |
|---|---|---|---|
| 0 Appearance | TC-0–4 | `book/epoch-0/` | chain → occupant → CSS rudiment → layout mechanisms → Tailwind |
| 1 Information | TC-5–8 | `book/epoch-1/` | behavior → state → list/selection |
| 2 Named constructions | TC-9–17 | `book/epoch-2/` | function → Vitest → component → TypeScript arrives → React 19 / Vite 8 → composition → shadcn/Radix → Ant literacy → RTL |
| 3 Book that outlives the page | TC-18–24 | `book/epoch-3/` | file → SQL → query-as-source → constraints → transactions → indexes/plans → Drizzle |
| 4 Ask / answer | TC-25–30 | `book/epoch-4/` | Node + raw HTTP → Hono → Zod → TanStack Query → OpenAPI → MSW |
| 5 Two faces | TC-31–34 | `book/epoch-5/` | RR7 two questions → token → close-the-loop → RHF + Zod |
| 6 Time, pursuit, goal | TC-35–39 | `book/epoch-6/` | tick → BullMQ → attempt → binary goal → sequence ⊃ campaigns |
| 7 When → do → handle | TC-40–43 | `book/epoch-7/` | event → write-set → fork → walker as data |
| 8 Authoring faces | TC-44–46 | `book/epoch-8/` | click = configure → React Flow → Agents |
| 9 Tenancy, gates, outside | TC-47–52 | `book/epoch-9/` | firm/session → Twilio/Resend → webhooks → Test/Run/Launch → Get/Rule/Wait → Local |
| 10 House, files, contrast | TC-53–55 | `book/epoch-10/` | house → S3 → one Next.js slice (not a rewrite) |
| 11 The software works | TC-56–64 | `book/epoch-11/` | Playwright → Docker → CI → CD → OTel → recover → load → repo standards → convergence + transfer |

`constructions/tc-N/` and `my-work/tc-N/` are keyed by **cycle**, not epoch.

**JOURNEY version:** 2. TC-0–2 are stable. Do not regenerate them. Work TC-2 (CSS rudiment) alone; Tailwind is TC-4.

**Reached:** [TC-2](./book/epoch-0/tc-2.md). Work it alone. Push `constructions/tc-2/page.html` and `my-work/tc-2/notes.md`.

**Validated:** [TC-0](./my-work/tc-0/evaluation.md) · [TC-1](./my-work/tc-1/evaluation.md).
