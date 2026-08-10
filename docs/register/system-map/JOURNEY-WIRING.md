# JOURNEY WIRING — face → machine (one walkable pass)

**Branch:** `cursor/journey-wire-product-6565`  
**Surface:** MAIN product at `/` (`App` + `BoardPanel`), not Register prototypes.

## Walk (browser, real tables)

Prereq: `DATABASE_URL`, `npm run db:migrate && npm run db:seed`, `npm run dev:auth`, `VITE_WIRE_REAL=true`, `npm run dev`.

| Step | Control | Wiring |
|---|---|---|
| 1 Login / entry | AuthGate / `VITE_AUTH_DISABLED` bypass | **wired** → session / seeded firm; bypass user `firmId=firm-cedar` (matches machine seed). Real OTP when auth on → `sessions` / `otp_challenges`. |
| 2 Board | Client list | **mock→real** → `GET /machine/contacts` → `contact_records` (empty until import). |
| 3 Authorize book | **Authorize book** button (Board strip) | **wired-to-`crm_oauth_grants`** (+ `prepared_workspaces`). Also `crmOAuth.grant`. |
| 4 Import CSV | Contacts → + Import | **wired-to-`contact_records`** via `POST /machine/contacts/import` (full file parse, not preview-only). |
| 5 Detection | Auto after import + **Run detection** | **wired-to-`audit_runs`**, `reachability_verdicts`, `sequence_ready`, `eligibility_evaluations`, `eligibility_results`, `signals`, `motion_decisions`. |
| 6 Outreach | **Start outreach** | **wired-to-`enrollment`** (+ `active_attempts`) via `enrollAndActuate` / dry-run send. Board strip shows enrollment count. |

## Per-screen checklist

### Login
| Control | Kind |
|---|---|
| OTP send/verify | wired-to-`otp_challenges` / `sessions` (existing) |
| Dev bypass (`VITE_AUTH_DISABLED`) | app-local session stand-in with **real firm id** `firm-cedar` for machine scope |
| Land on Board | wired (navigate `/`) |

### Board
| Control | Kind |
|---|---|
| Client list | wired-to-`contact_records` |
| Journey strip status | wired (status API) |
| Phase / filters | app-local |
| Halt (if shown) | already wired-to-`halt_records` (off this journey’s critical path) |

### Authorize
| Control | Kind |
|---|---|
| Authorize book | wired-to-`crm_oauth_grants` |

### Contacts / Import
| Control | Kind |
|---|---|
| CSV upload + map columns | app-local parse |
| Confirm import | wired-to-`contact_records` |
| Contact directory list | wired-to-`contact_records` |

### Detection / Outreach
| Control | Kind |
|---|---|
| Run detection | wired-to-`eligibility_results` / `signals` (etc.) |
| Start outreach | wired-to-`enrollment` |
| Signal badges on rows | wired (read join on list contacts) |

## New tables forced by walk

**None.** Used existing machine + CT tables.

## Code map

| Piece | Path |
|---|---|
| Journey API | `server/wire-service/journey.ts` |
| Routes | `/wire/machine/journey/*`, `/wire/machine/contacts*` |
| Firm scope | `src/app/wire/firmContext.ts` |
| Book state | `src/app/context/BookContext.tsx` |
| Board UI | `src/app/components/BoardPanel.tsx` journey strip |
| CSV full parse | `parseCsvAll` in `parseCsvPreview.ts` |

## Prove

```bash
npm run verify:journey   # DB path
# Browser: Authorize → Contacts import CSV → see Board fill → Run detection → Start outreach
# Supabase: contact_records, crm_oauth_grants, signals, enrollment
```

## Off-path (V2-BACKLOG — not this deliverable)

- Automations canvas DAG event-bus walk
- Agents module editor
- Real CRM OAuth (grant row is intentional authorization, not vendor OAuth)
- Provision UI minting firms (seed remains entry)
