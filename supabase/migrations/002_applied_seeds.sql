-- Tracks which manifest seeds have been applied (protocol audit trail).
CREATE TABLE IF NOT EXISTS applied_seeds (
  seed_id TEXT PRIMARY KEY,
  environment TEXT NOT NULL,
  description TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS applied_seeds_environment_idx ON applied_seeds (environment);
