-- 022 — Failure mode = stop spending, keep listening (packet 023).
-- Depends on 021 (packet 022). Do not recut 015 / 019 / 020.
-- Do not reuse active_attempts.status='nullified' (that is a win).
-- Do not null enrollment.campaign_id on exhaustion. Flag 15:43.

ALTER TABLE enrollment
  ADD COLUMN IF NOT EXISTS pursuit_state TEXT NOT NULL DEFAULT 'pursuing',
  ADD COLUMN IF NOT EXISTS exhausted_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'enrollment_pursuit_state_check'
  ) THEN
    ALTER TABLE enrollment
      ADD CONSTRAINT enrollment_pursuit_state_check
      CHECK (pursuit_state IN ('pursuing', 'exhausted'));
  END IF;
END $$;
