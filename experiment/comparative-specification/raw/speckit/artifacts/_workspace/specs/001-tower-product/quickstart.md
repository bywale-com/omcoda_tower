# Quickstart / validation guide — Tower intended product

This run **must not implement** application code. Use this guide to validate that the **specification** matches inhabited surfaces and to smoke the snapshot as-is.

## Prerequisites

- Node dependencies installed (`npm install` if needed).
- For SPA-only: `VITE_WIRE_REAL=false` (else `/wire` calls need backend).
- For real-data: `.env` from `.env.sandbox.example`; URL-encode `$` in `DATABASE_URL` as `%24`; `npm run dev:auth` on `3001` and `npm run dev` on `5173`.
- Optional DB: `npm run db:migrate` && `npm run db:seed`. Platform firm id in `supabase/seeds/manifest.json`.
- If login stuck with auth disabled: `sessionStorage.removeItem('tower.loggedOut')`.

## Build gate

```bash
npm run build
```

## Product face smoke (manual)

Open `/prototype-ant` (not Hub as the app).

| Story | Where | Expect |
|-------|--------|--------|
| US2 Access | Login / `/a/<token>` | Session into firm desk; unprovisioned OTP does not confirm existence |
| US2 Inhabit | Consultant Board, Contacts, Meetings | Records = query; empty if none; no painted demo people |
| US2 Activity | Client Activity | Chronology of outreach; not Agents canvas |
| US3 Agents | Operator → Configuration libraries → Agents | Blank sequence, campaigns, Override this, enroll header, Launch arms |
| US4 Automations | Configuration libraries → Automations | Trigger Global/Local; test data inside trigger; Run vs Launch split; If two wires / Switch many wires |
| US5 Bind/Audit | Firm operations bind, Book readiness, Firm health | Bind published packs; audit verdicts reachable/partial/unreachable |
| US6 Contact | Consent / form / silence | One form for outstanding self-reportable; silence stops send |
| US1 North-star | Meetings after bind | Meeting + live brief without consultant authoring libraries |

Do not treat Hub completeness as a pass.

## Wire probes (when secrets + DB)

- `GET /auth/health`, `GET /wire/health`
- `POST /wire/send/cem` and `/wire/send/sms` with platform `firmId` + `TEST_EMAIL_TO` / `TEST_SMS_TO` (no contactId skips consent/halt)

## Honesty checks

- Meta / escrow fulfillment / Register-as-firm-product: MUST still read as deferred or house-only.
- Objective-met: a historic meeting MUST NOT complete an unrelated campaign (Local axis).
- Exhaustion: no duplicate `campaign_failure` spam from a still-open attempt.

## Silences (do not fail the spec for these being unimplemented decisions)

CASL geography, reactivation-worthy definition, escrow release (U-001–U-003).
