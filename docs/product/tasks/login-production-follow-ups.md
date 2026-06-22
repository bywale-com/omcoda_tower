# Login production — follow-up tasks

**Status:** Not started (ops + hardening after Vercel wiring)  
**Prerequisite:** Items 1–4 + `vercel.json` merged (Vercel Functions, CORS, register security)  
**Gate:** [Production verification checklist](#verification) — all 12 tests on live production URL

Login **business logic** is done. These tasks complete **production deployment** and **post-login** platform work.

---

## Ops — required before production sign-off

### 5. Production environment variables (Vercel dashboard)

| Variable | Scope | Required |
|----------|-------|----------|
| `DATABASE_URL` | Server (Functions) | Yes — Supabase **pooler** URI (port **6543**, `?pgbouncer=true`) |
| `RESEND_API_KEY` | Server | Yes |
| `RESEND_FROM_EMAIL` | Server | Yes — verified domain |
| `NODE_ENV` | Server | `production` |
| `ALLOWED_ORIGINS` | Server | Yes — e.g. `https://app.yourdomain.com` |
| `REGISTER_ENABLED` | Server | `false` for prod (default) |
| `REGISTER_PASSWORD` | Server | Only if `REGISTER_ENABLED=true` |

**Never** put `DATABASE_URL` or `RESEND_API_KEY` in any `VITE_*` variable.

**Done when:** Vercel Production deploy succeeds with all vars set.

---

### 6. Production database

| Task | Detail |
|------|--------|
| Create prod Supabase project | Separate from dev |
| Run `npm run db:migrate` | Against prod `DATABASE_URL` once |
| **Do not** run demo seed in prod | Use manifest seeds per [`database-seeding-protocol.md`](../database-seeding-protocol.md) |
| Firm provisioning | New numbered seed file + `manifest.json` entry — never ad hoc SQL |

**Done when:** Each paying customer has a `users` row before they hit `/login`.

---

### 7. Resend production setup

| Task | Detail |
|------|--------|
| Verify sending domain | DNS in Resend |
| Set `RESEND_FROM_EMAIL` | e.g. `Tower <auth@yourdomain.com>` |
| Test delivery | Real inbox on production domain |

**Done when:** OTP email delivers from your domain in production.

---

### 8. Rate limiting at the edge

App-level email rate limits are not enough for public URLs.

| Task | Detail |
|------|--------|
| Vercel Firewall / rate limit | `/auth/otp/send` and `/auth/otp/verify` — per IP, e.g. 20 req/min |
| Or | Cloudflare in front of Vercel with same rules |

**Done when:** Burst script against `/auth/otp/send` is blocked before Postgres.

---

### 9. Observability

| Task | Detail |
|------|--------|
| Vercel Function logs | Confirm structured `auth.*` JSON events appear |
| Alert | `delivery_failed`, 5xx spike — log drain or external alert |
| Never log | Plaintext OTP, session cookie, full email in prod |

**Done when:** Test login visible in Vercel logs.

---

## Verification

Run against **deployed Vercel production URL** (not localhost).

| # | Test | Expected |
|---|------|----------|
| 1 | Visit `/` logged out | Redirect to `/login` |
| 2 | Visit `/login` logged in | Redirect to `/` |
| 3 | Send OTP — provisioned email | 200, email received, verify step |
| 4 | Send OTP — unknown email | 200 generic, no email |
| 5 | Verify wrong code 5× | 429 / lockout |
| 6 | Verify correct code | 200, `tower_session` (`HttpOnly`, `Secure`) |
| 7 | Refresh `/` | Still authenticated |
| 8 | Logout | Cookie cleared, `/` → `/login` |
| 9 | Resend failure | 503, stay on sign-in if send never succeeded |
| 10 | Change email | Challenge abandoned, new send works |
| 11 | `/register` | Disabled or not unlockable with repo password |
| 12 | `npm run build` | Exits 0 on Vercel |

---

## Post-login — next flows (not login blockers)

Document as separate flow work when business APIs ship:

| Item | Why it matters later |
|------|----------------------|
| Server-side authorization on business APIs | Seed data still client-side; APIs need firm scoping |
| Session cleanup cron | Expired `sessions` rows accumulate |
| Longer OTP / MFA | Security upgrade beyond v1 email OTP |
| Multi-firm per user | Data model change (O-01) |

---

## Deploy sequence (remaining)

1. Set Vercel env vars (**5**)
2. Migrate + provision prod DB (**6**)
3. Resend domain (**7**)
4. Edge rate limits (**8**)
5. Production deploy
6. Run verification table
7. Commit: *"Production-ready login on Vercel"* when all 12 pass
