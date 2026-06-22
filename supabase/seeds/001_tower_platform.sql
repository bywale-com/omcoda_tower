-- Seed: 001_tower_platform
-- Manifest: supabase/seeds/manifest.json
-- Environments: development, staging
-- Do not edit ad hoc — add a new numbered seed file + manifest entry instead.

-- Retire legacy ad hoc demo row (superseded by this manifest seed).
DELETE FROM users WHERE email = 'consultant@demo.firm';
DELETE FROM firms
WHERE id = 'a0000000-0000-4000-8000-000000000001'
  AND NOT EXISTS (SELECT 1 FROM users WHERE firm_id = firms.id);

INSERT INTO firms (id, name, created_at)
VALUES (
  'a1000000-0000-4000-8000-000000000001',
  'Tower',
  now()
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO users (id, firm_id, email, created_at)
VALUES (
  'b1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000001',
  'admin@try-tower.com',
  now()
)
ON CONFLICT (email) DO UPDATE SET firm_id = EXCLUDED.firm_id;
