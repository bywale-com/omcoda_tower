# Brownfield notes (spec companion)

Ratified from SHA `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`. Architecture spine AD-1–AD-12 bind; this file is the code-shaped seed.

## Runtimes

| Unit | Path | Job |
|------|------|-----|
| Automations walk | `server/wire-service/workflowWalk.ts` | Live walk; 015 handle; do not recut |
| Shared enroll/send | `server/wire-service/cascade.ts` | Enroll / escalate / send; attempt criteria + channel order |
| Time path | `server/wire-service/worker.ts` | Tick |
| HTTP machine | `server/wire-service/machine.ts`, `routes.ts` | `/wire/*`, webhook hook |
| Send gates | `server/wire-service/dispatchSend.ts` | Consent / halt / silence / SEND_MODE |
| Auth | `server/auth-service/` | OTP, sessions, access redeem |

## Stood-up SQL on this SHA

`supabase/migrations/001` … `024_wait_occupancy.sql` (see extracts/migrations-index.md). Quote filenames, not stale docs/README remap (`001`–`018` only).

## Client law

- Product face: vite `prototype-ant-mpa` → `/prototype-ant`, `/c/`.
- Wire client: `src/app/wire/` ports, registry, reals vs standins.
- Types mirror: `src/app/wire/machineTypes.ts`.
- Tokens: `src/app/components/tokens.ts` + `rules.md`.
- Flags: `VITE_AUTH_DISABLED` default true locally; `VITE_WIRE_REAL` default true; no demo `VITE_DEV_FIRM_ID`.

## Verify (repo scripts; no ESLint/Vitest/tsc gate)

`npm run build`; `db:migrate` / `db:seed`; `verify:*` scripts in package.json; manual smoke on `/prototype-ant`.

## Do not

- Treat `src/app/data/` mock journeys as product truth where wire+tables exist.
- Treat root README “prototype only” as current machine law.
- Implement inside this specification experiment.
