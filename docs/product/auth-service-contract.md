# Auth Service — Contract (Login OTP)

**Status:** Implemented (v0.3.1)  
**Aligns with:** `login` flow · `loginSendOtpStep.ts` · `loginVerifyOtpStep.ts`  
**Session decision:** **O-10 resolved — HTTP-only cookie** (`tower_session`). No session token in response body.

---

## Endpoints

| Method | Path | Flow step | Purpose |
|--------|------|-----------|---------|
| `POST` | `/auth/otp/send` | 2–4, 9 | Issue OTP email |
| `POST` | `/auth/otp/verify` | 6–8 | Verify code, issue session cookie |
| `POST` | `/auth/otp/abandon` | — | Invalidate in-flight challenge (change email) |
| `GET` | `/auth/session` | — | Validate session for route guard |
| `POST` | `/auth/logout` | — | Clear session cookie + revoke row |
| `GET` | `/auth/register/status` | — | Register gate enabled + unlocked (internal) |
| `POST` | `/auth/register/unlock` | — | Verify `REGISTER_PASSWORD`, set gate cookie |
| `POST` | `/auth/register/lock` | — | Clear register gate cookie |

All paths are proxied from the Consultant Web App dev server (`/auth` → Auth Service on port 3001).  
On **Vercel**, the same paths are served by Serverless Functions via `vercel.json` rewrite (`/auth/*` → `/api/auth/*`).

---

## Session (O-10)

- Cookie name: `tower_session`
- Flags: `HttpOnly`, `SameSite=Lax`, `Path=/`
- `Secure` in production (`NODE_ENV=production`)
- Value: opaque random token (32 bytes, base64url)
- Storage: `sessions.token_hash` = SHA-256(cookie value)
- **Step 8 wire:** `Set-Cookie` only — client does not read a token from JSON

---

## `POST /auth/otp/send`

**Request:** `{ "email": string }`

**Success `200`:**

```json
{ "ok": true, "message": "If that address is registered, we sent a verification code." }
```

Returned for **both** provisioned and unprovisioned emails (anti-enumeration).

**Ordering (sequential implementation of logical steps 3a–3d):**

1. Validate email format → `400`
2. Rate limit → `429` (see § Rate limits)
3. Log send attempt (`otp_send_log`)
4. Resolve tenancy: `SELECT users JOIN firms ON firm_id WHERE email = $1` (single query)
5. If no user → `200` generic (stop; no challenge, no Resend)
6. Invalidate prior challenges for `(firm_id, email)`
7. `INSERT otp_challenges` (commit)
8. `POST` Resend — on failure: mark `delivery_failed = true`, return `503`
9. On Resend success → `200`

**`503`:** `{ "ok": false, "error": "delivery_failed", "message": "We could not send the email. Try again shortly." }`

**`429`:** `{ "ok": false, "error": "rate_limited", "message": "Too many codes requested. Wait a few minutes and try again." }`

---

## `POST /auth/otp/verify`

**Request:** `{ "email": string, "code": string }`

**Success `200`:** `{ "ok": true }` + `Set-Cookie: tower_session=…`

**Ordering (sequential implementation of logical steps 7a–7b, one transaction):**

1. Validate → `400`
2. Resolve user (firm_id)
3. Begin transaction
4. `UPDATE otp_challenges SET consumed_at = now() WHERE … AND consumed_at IS NULL AND invalidated_at IS NULL AND delivery_failed = false AND expires_at > now() AND code_hash = $hash RETURNING *`
5. If no row → increment `verify_attempts` on latest active challenge if applicable → `401`
6. `INSERT sessions` with new token_hash
7. Commit
8. Set cookie, return `200`

If session `INSERT` fails → transaction rolls back (challenge not consumed).

**`401` errors:**

| `error` | When |
|---------|------|
| `invalid_code` | Wrong code (attempts remaining in message when applicable) |
| `expired` | Challenge expired |
| `consumed` | Already used |
| `no_challenge` | No active challenge |

**`429`:** Max verify attempts (5) exceeded for current challenge.

---

## `POST /auth/otp/abandon`

**Request:** `{ "email": string }`

**`200`:** Invalidates unconsumed challenges for resolved `(firm_id, email)`. Used by **Change email address** before returning to sign-in view.

---

## Challenge invalidation

On **new send**, **resend**, and **abandon**:

```sql
UPDATE otp_challenges
SET invalidated_at = now()
WHERE firm_id = $1 AND email = $2
  AND consumed_at IS NULL AND invalidated_at IS NULL;
```

**One active challenge** enforced by partial unique index (see migrations).

---

## Rate limits

| Rule | Value |
|------|-------|
| OTP TTL | 10 minutes |
| Verify attempts per challenge | 5 |
| Send/resend per email | 3 per 15 minutes |

Send rate limit uses `otp_send_log` (counts all attempts, including unprovisioned emails).

---

## Observability

Structured JSON logs (stdout):

- `auth.otp.send` — outcome, email domain (not full email in prod optional), firm_id if known, resend_error
- `auth.otp.verify` — outcome, error code, firm_id
- `auth.session` — validate / logout
- `auth.db.error` — query failures

Never log plaintext OTP or session cookie values.

---

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Supabase Postgres — use **pooler** URI on Vercel (port `6543`, `?pgbouncer=true`) |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Sender address (verified domain in prod) |
| `AUTH_SERVICE_PORT` | Local dev only — default `3001` |
| `NODE_ENV` | `production` enables `Secure` cookie |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins (required in prod) |
| `REGISTER_ENABLED` | `true` to expose `/register` — default **`false` in prod** |
| `REGISTER_PASSWORD` | Server-only gate password when register enabled |

**Client (build-time, not secrets):**

| Variable | Purpose |
|----------|---------|
| `VITE_REGISTER_ENABLED` | `true` to include `/register` route in SPA build (dev only) |

Do **not** set `VITE_AUTH_BASE_URL` in production — same-origin `/auth` keeps `SameSite=Lax` cookies working.

See `.env.example`.

---

## Production deployment (Vercel)

| Piece | Location |
|-------|----------|
| Hono app (shared) | `server/auth-service/app.ts` |
| Local dev server | `npm run dev:auth` → `server/auth-service/index.ts` |
| Vercel entry | `api/auth/[[...path]].ts` → `hono/vercel` `handle(app)` |
| SPA + rewrites | `vercel.json` — `/auth/*` → Functions; other paths → `index.html` |
| CORS | `ALLOWED_ORIGINS` — rejects unknown origins (no `*` with credentials) |
| Register | `REGISTER_ENABLED=false` + no `VITE_REGISTER_ENABLED` in prod build |

**Follow-up ops:** [`tasks/login-production-follow-ups.md`](tasks/login-production-follow-ups.md) — prod DB, Resend domain, edge rate limits, 12-point verification.

---

## Wire cross-references

| Register step | Contract section |
|---------------|------------------|
| 3a–3d | Send ordering (logical decomposition; sequential in code) |
| 7a–7b | Verify transaction (logical decomposition; sequential in code) |
| 8 | Session cookie only |
| 9a–9b | Reuses send path (steps 3–4); abbreviated canvas slice |
