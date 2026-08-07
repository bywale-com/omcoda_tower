# Wire log — GO cutover (real ports)

**Status:** cut over  
**Branch intent:** Resend CEM + Twilio SMS + Postgres CT stores + Resend webhooks

## Went real

| Port / path | Implementation |
|---|---|
| `espMailer` | `POST /wire/send/cem` → Resend |
| `smsApi` | `POST /wire/send/sms` → Twilio (`TWILIO_FROM_NUMBER`) |
| `otpStore` | `/auth/otp/*` (existing auth-service) |
| `sendingPool` | allocate/verify/auth-chips via Resend Domains API + `sending_domains` table |
| `haltStore` · `consentSilence` · `crmOAuth` · `auditTrail` · `primaryStore` | Postgres (`003_ct_wire_stores.sql`) via `/wire/*` |
| Resend webhooks | `POST /wire/webhooks/resend` → `messaging_events` + hard-bounce silence |

## Stayed stand-in (deferred)

Meta ads · escrow · enrich crawl · Postmaster feed · warmup counters · list-unsubscribe ingress (thin)

## Env

`RESEND_API_KEY` · `RESEND_FROM_EMAIL` · `MAIL_ROOT_DOMAIN` · `TWILIO_*` · `DATABASE_URL` · `VITE_WIRE_REAL` (default true) · optional `RESEND_WEBHOOK_SECRET`

## Migrate

```bash
npm run db:migrate
```

Applies `supabase/migrations/003_ct_wire_stores.sql`.
