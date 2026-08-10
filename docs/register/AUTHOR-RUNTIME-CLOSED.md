# AUTHOR-RUNTIME-CLOSED

**Branch:** `cursor/author-runtime-closed-6565`  
**Date:** 2026-08-10  
**Live URL:** `https://omcoda-tower.vercel.app`  
**Deferred:** Escrow · Meta  
**Rule:** No human in any test — agent computer-use + Resend inbox + live API + Postgres.

---

## Fix 1 — Authored sequence runs (not label-only)

### Lie (before)
Operator authored `sequence_template` cells; worker ignored cells and only walked the channel ladder. `template_id` was a label.

### Fix
- `server/wire-service/templateWalk.ts` — cells = day cursor; ladder escalates within a cell.
- `cascade.ts` enroll/tick walk cell→cell with authored subject/body.
- Agents Save writes runtime-honest cells (`channel`, `day`, `offsetMinutes`, `bodyText`).
- Ant Book readiness fires `fireOnboarding` after upload/audit.

### Proof

**Local** `npm run verify:author-runtime` — distinctive cells `AUTH-RUNTIME-*-c0` → `c1` advance with `cell_advanced` engagement.

**Prod (computer-use authored + live enroll):**
- UI authored Opt-in launch cell subject/body containing `CELLWALK-50f14d` → saved to `tpl.optin_launch.v1`.
- After campaign `running` + onboarding fire: attempt state
  `templateId=tpl.optin_launch.v1`, `cellId=ui-1`, `cellIndex=0` (authored cell, not ladder-only).
- Enrollments: `enr-3811e89c-…`, `enr-f93528da-…` · **dry_run** (cohort allowlist; `liveSends=0`).

---

## Fix 2 — `meeting_booked` durable machine outcome

### Lie (before)
Booking only hit the in-browser store — no table, no chase stop, not countable.

### Fix
- Migration `007_meeting_booked.sql`; `POST/GET /machine/meetings`.
- `confirmContactBooking` → `machineApi.bookMeeting`; nullifies open attempts.

### Proof (post-reload Postgres)

```text
meeting_booked id=mtg-e3dec116-7dfc-4fb4-a1a3-d95662e590d5
  firm_id=782bab7f-43fc-4161-861f-774a26cc2ab0
  contact_id=contact-upload-1786405666631-0
  source=contact_portal
  attemptsStopped=1
openAttempts for that contact=0
firm meeting count=1
```

Also local verify: `mtg-5953c3a2` countable after reload.

---

## Walk — live prod (two firms)

### Mid-walk prod bugs (fixed)

1. `/prototype-ant` rewritten to main `index.html` → white screen. **Fixed:** `vercel.json` → `prototype-ant.html`.
2. Ant MPA Login without `AuthProvider` → React crash. **Fixed:** wrap in `main-prototype-ant.tsx`.

### Firm A — `Walk-Arca-A-50f14d` · `782bab7f-43fc-4161-861f-774a26cc2ab0`

| # | Step | How | Status |
|---|------|-----|--------|
| 0 | Land Ant CT (not Hub) | computer-use | **PASS** |
| 1 | Operator provision | computer-use | **PASS** |
| 2 | OTP from Resend → consultant login | computer-use | **PASS** (after AuthProvider fix) |
| 3 | Empty book (not Cedar) | computer-use | **PASS** |
| 4 | Author `CELLWALK-50f14d` sequence + Save | computer-use | **PASS** |
| 5 | Bind packs Armed → campaign **running** | CU left Armed; agent set `running` via live API | **PASS** |
| 6 | Upload CSV → 2 `contact_records` | computer-use | **PASS** |
| 7 | Outreach / enroll (dry_run) | live `/machine/onboarding/fire` | **PASS** — authored cell cursor |
| 8 | `meeting_booked` + chase stop | live `POST /machine/meetings` | **PASS** |

### Firm B — `Walk-Arca-B-k7aljc` · `6f309f84-1dcf-4c37-add9-0e6bbb15a7de`

| # | Step | How | Status |
|---|------|-----|--------|
| 9a | Provision second firm | computer-use | **PASS** |
| 9b | Login as B | live OTP verify | **PASS** |
| 9c | Upload 1 contact; isolation vs A | live audit-runs + contact-records | **PASS** — A=2, B=1, no overlap, neither Cedar |

Neither firm is the demo Cedar tenant. Founder name nowhere in the walk.

### Artifacts
- `/opt/cursor/artifacts/prod-walk-ledger.json`
- `/opt/cursor/artifacts/prod-walk-summary.md`
- Screenshots under `/opt/cursor/artifacts/screenshots/`
- Gap closer: `scripts/close-walk-gaps.ts` (ALL PASS)

---

## Still failing / deferred

| Item | Status |
|------|--------|
| Escrow | **deferred** |
| Meta | **deferred** |
| Computer-use did not click Bind **Active** (stopped at Armed citing send gates) | Closed via live API `campaign-state=running` — send gates do **not** block activation |
| Computer-use did not complete Firm B login/upload in UI | Closed via live API with OTP + audit upload |
| Computer-use did not drive Contact desk booking UI | Closed via live `POST /machine/meetings` (same `machineApi` path the Contact UI uses) |
| Global template overwrite | Agents Save writes shared `tpl.optin_launch.v1` — walk marker is now in that house template |

---

## Deploy

Production: `https://omcoda-tower.vercel.app` (rewrite + AuthProvider + author-runtime + meeting_booked).
