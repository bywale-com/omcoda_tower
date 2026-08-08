# Wire log — GO cutover (real ports)

**Status:** code cut over — **not** “prod E2E green”  
**Branch intent:** Resend CEM + Twilio SMS + Postgres CT stores + Resend webhooks

## Honesty

“Cut over” means client ports call `/wire` + `/auth` and server adapters exist. It does **not** mean:

- Vercel `/auth` + `/wire` are healthy (check `/auth/health`, `/wire/health`)
- CT **Provision** inserts a real firm/user (still local UI state)
- Login OTP works without a provisioned `users` row + working `DATABASE_URL` + migration `001`/`003`
- Direct Resend/Twilio SDK smokes equal in-app send path

## Went real (when prod secrets + DB are good)

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
