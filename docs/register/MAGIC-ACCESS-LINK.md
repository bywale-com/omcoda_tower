# Magic / direct access link

**Date:** 2026-08-11  
**Status:** shipped on this branch — closes gap A in `APP-ELEVATION-GAP.md`

## Product intent

Invite is a **direct access URL**, not a login portal as the product.

- Open `/a/<token>` → one-time redeem → session cookie → `/prototype-ant`
- OTP `/login` remains as fallback

## Shape

| Piece | Path |
|-------|------|
| Table | `access_links` (`008_access_links.sql`) |
| Redeem | `POST /auth/access/redeem` `{ token }` → sets `tower_session` |
| Issue (auth) | `POST /auth/access/issue` — admin / self / `x-access-issue-secret` |
| Issue (wire) | `POST /wire/machine/access-invite` — mint + email from Provision |
| Provision | Returns `accessPath` (= `loginPath` when mint succeeds) |
| SPA entry | `/a/:token` → `AccessEntry` |

## TTL / consume

- 7 days (`ACCESS_LINK_TTL_MS`)
- One active link per user; re-issue invalidates prior
- Single-use: `consumed_at` on redeem

## Ops

```bash
npm run db:migrate   # applies 008_access_links.sql
npx tsx --env-file=.env scripts/issue-access-link.ts user@firm.com
npx tsx --env-file=.env scripts/verify-access-link.ts
```

Optional env:

- `PUBLIC_APP_URL` / `APP_ORIGIN` — absolute URL in invite emails
- `ACCESS_ISSUE_SECRET` — header `x-access-issue-secret` for scripted `POST /auth/access/issue`
