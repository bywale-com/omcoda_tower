# Database seeding protocol

**Scope:** `firms` + `users` rows required for login OTP (assisted onboarding).  
**Rule:** All tenancy data enters the database **only** via versioned manifest seeds — never ad hoc SQL in the dashboard.

---

## Layout

```
supabase/
  migrations/          # schema only
  seeds/
    manifest.json      # source of truth — id, file, environments, record audit
    001_*.sql          # one file per seed revision
scripts/
  run-migration.ts     # npm run db:migrate
  run-seed.ts          # npm run db:seed (reads manifest)
```

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run db:migrate` | Apply schema migrations (once per environment) |
| `npm run db:seed` | Apply manifest seeds for `SEED_ENV` (default `development`) |
| `SEED_ENV=staging npm run db:seed` | Apply seeds tagged for staging |

Requires `DATABASE_URL` in `.env` (Session pooler on Windows / IPv4).

---

## Adding a user or firm

1. Create `supabase/seeds/00N_short_name.sql` with fixed UUIDs and `ON CONFLICT` upserts.
2. Register it in `supabase/seeds/manifest.json` (`id`, `file`, `environments`, `description`, `records`).
3. Run `npm run db:migrate` if schema changed.
4. Run `npm run db:seed` — script records `applied_seeds` and **skips** already-applied ids.

**Do not:** hand-run `INSERT` in Supabase SQL Editor for login users.

---

## Environments

| `SEED_ENV` | Use |
|------------|-----|
| `development` | Local dev — includes platform admin |
| `staging` | Pre-prod verification |
| `production` | **No seeds in manifest yet** — customer rows added via future `production` seed files when onboarding protocol ships |

Prod customer onboarding will be new manifest entries (e.g. `010_firm_acme.sql`), not manual inserts.

---

## Audit trail

Table `applied_seeds` (migration `002_applied_seeds.sql`):

| Column | Meaning |
|--------|---------|
| `seed_id` | Manifest id (e.g. `001_tower_platform`) |
| `environment` | `SEED_ENV` when applied |
| `description` | From manifest |
| `applied_at` | Timestamp |

Query:

```sql
SELECT * FROM applied_seeds ORDER BY applied_at;
```

---

## Current seeds

| Id | Environment | Records |
|----|-------------|---------|
| `001_tower_platform` | development, staging | Firm **Tower** · user **admin@try-tower.com** |

Login test (dev): `admin@try-tower.com` at `/login`.

---

## Related

- Auth contract: [`auth-service-contract.md`](auth-service-contract.md)
- Prod follow-ups: [`tasks/login-production-follow-ups.md`](tasks/login-production-follow-ups.md)
