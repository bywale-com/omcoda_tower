# AUTHOR-RUNTIME-CLOSED

**Branch:** `cursor/author-runtime-closed-6565`  
**Date:** 2026-08-10  
**Live URL:** `https://omcoda-tower.vercel.app`  
**Deferred:** Escrow · Meta  
**Rule:** No human in any test — agent computer-use + Resend inbox + Postgres.

---

## Fix 1 — Authored sequence runs (not label-only)

### Lie (before)
Operator authored `sequence_template` cells (day calendar); worker ignored cells and only walked `seq_channel_ownership_order` + `rule_attempt_criteria`. `template_id` was a label.

### Fix
- `server/wire-service/templateWalk.ts` — normalize cells (`day` / `offsetMinutes` / `waitMinutes` / `channel` / subject / `bodyText`).
- `cascade.ts` enroll fires **cell 0** with authored subject/body; attempt `state` stores `templateId`, `cellIndex`, `cellId`, `enrolledAt`.
- Tick advances cell→cell when offset due; channel ladder escalates **within** a cell.
- Agents Save (`AntAgentWorkbench`) writes runtime-honest cells (channel, day, offsetMinutes, bodyText) + email body editor.
- Ant Book readiness fires `fireOnboarding` after upload/audit (same as plant `AuditContext`).

### Proof (`npm run verify:author-runtime`)

Distinctive template `tpl.author-runtime.AUTH-RUNTIME-a57fab8d` with cells `…-c0` (text) → `…-c1` (email):

| Step | Result |
|------|--------|
| enroll-cell0 | PASS — `cellId=AUTH-RUNTIME-a57fab8d-c0` |
| state-cursor | PASS — `cellIndex=0` + template id in attempt state |
| cell-advance | PASS — tick advanced to `cell:AUTH-RUNTIME-a57fab8d-c1` (authored cell, not ladder-only) |
| cell-engagement | PASS — `engagement_records.event_kind=cell_advanced` for cell1 |

---

## Fix 2 — `meeting_booked` durable machine outcome

### Lie (before)
Booking landed only in the in-browser meetings store — no table, no chase stop, not countable.

### Fix
- Migration `supabase/migrations/007_meeting_booked.sql` (applied on Session-pooler).
- `POST/GET /machine/meetings` — firm-scoped write/list; nullifies open `active_attempts`; writes `engagement_records` `meeting_booked`.
- Client `confirmContactBooking` → `machineApi.bookMeeting` (Contact Ant + plant).

### Proof (post-reload Postgres query)

```text
meeting_booked id=mtg-5953c3a2
  firm_id=firm-cedar
  contact_id=c-author-1964ada1
  booked_at=2026-08-10T23:18:06.070Z
  source=verify
firmMeetingCount=3
openAttempts for that contact=0
```

`verify:author-runtime` also: chase-stopped PASS · meeting-countable PASS.

---

## Walk — agent computer-use on live prod (two firms)

**Driver:** Cursor computer-use agent (not founder).  
**OTP inbox:** Resend API for `truthist00+…@gmail.com` (`scripts/read-latest-otp.ts`).  
**DB checks:** `scripts/walk-verify-firm.ts`.

| # | Step | Status | Evidence |
|---|------|--------|----------|
| 0 | Land on Register CT (Ant), not Hub | *in progress* | computer-use ledger |
| 1 | Operator provision Firm A | *in progress* | |
| 2 | OTP from inbox → consultant login | *in progress* | |
| 3 | Empty book (not Cedar) | *in progress* | |
| 4 | Author CELLWALK sequence + Save | *in progress* | Fix 1 UI |
| 5 | Firm operations bind → Active | *in progress* | |
| 6 | Upload CSV → contact_records scoped | *in progress* | |
| 7 | Outreach ran (dry-run vs live noted) | *in progress* | |
| 8 | meeting_booked via UI + chase stop | *in progress* | Fix 2 UI |
| 9 | Firm B second world / isolation | *in progress* | |

Ledger artifact (when complete): `/opt/cursor/artifacts/prod-walk-ledger.json`  
Summary: `/opt/cursor/artifacts/prod-walk-summary.md`

---

## Still failing / deferred

| Item | Status |
|------|--------|
| Escrow | **deferred** |
| Meta | **deferred** |
| Computer-use live walk ledger | **in progress** (this doc updates when walk finishes) |
| Prod SEND_MODE | `live` with cohort allowlist — walk reports dry vs live per enrollment |

---

## Deploy

Production alias `https://omcoda-tower.vercel.app` ← `dpl_D2VRkNPjFcMRQ8f2uaigMiaYgsjz` (branch tip with Ant onboarding fire + honest Agents cells).
