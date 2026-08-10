# LIVE PROOF (production)

**Date:** 2026-08-10  
**URL:** `https://omcoda-tower.vercel.app`  
**Recipient:** `truthist00@gmail.com` / `+14374557204`  
**Cohort contact:** `c-live-proof-6565`  
**Firm:** `86551b71-80f7-4143-80c0-ffb3cb07ab69`

## What was proven (not packaging — real messages)

| Proof | Result |
|-------|--------|
| **Human OTP email** | Live `POST /api/auth/otp/send` → Resend **delivered** “Your Tower verification code” → code read from Resend API → live `POST /api/auth/otp/verify` → **200** session `firmId=86551b71-…` |
| **Live email send** | `POST /api/wire/send/cem` → `ok:true`, `dryRun:false`, Resend `messageId=7c47d415-…` subject “Tower live-proof CEM” |
| **Live SMS send** | `POST /api/wire/send/sms` → `ok:true`, `dryRun:false`, Twilio `SM7fcf6cdb…` |
| **Unattended escalation** | Stale text attempt → live `GET /api/wire/machine/tick` (same host as `prod-tick.yml`) → `acr-text` fired → channel **text → email** → live follow-up email `messageId=a31253bf-…` / `3417c4df-…`, `engagement_records.event_kind=window_fired` |

## Production posture after this run

- `SEND_MODE=live`
- `SEND_TEST_COHORT=c-live-proof-6565` (only this contact is live-eligible)
- `acr-text` restored to **global** (`firm_id NULL`) — it had been stuck on `firm-cedar` only, so new firms never escalated

## Scripts

- `scripts/complete-live-proof.ts` — full walk (OTP via Resend)
- `scripts/run-live-send-escalation.ts` — live CEM/SMS + tick escalate
- `scripts/seed-text-criteria-and-escalate.ts` — ensure global `acr-text` + prove tick

Escrow · Meta still deferred.
