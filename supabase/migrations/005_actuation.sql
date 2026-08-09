-- Actuation: window clock + idempotent fired markers on active_attempts
-- Supports scheduled tick worker (Part A) without hard-coded thresholds.

ALTER TABLE active_attempts
  ADD COLUMN IF NOT EXISTS window_started_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE active_attempts
  ADD COLUMN IF NOT EXISTS fired_criteria JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Backfill: keep original clock for existing rows
UPDATE active_attempts
SET window_started_at = created_at
WHERE window_started_at IS DISTINCT FROM created_at
  AND created_at < window_started_at;

CREATE INDEX IF NOT EXISTS active_attempts_open_idx
  ON active_attempts (firm_id, status)
  WHERE status = 'open';

CREATE INDEX IF NOT EXISTS engagement_records_inbound_idx
  ON engagement_records (firm_id, contact_id, created_at DESC)
  WHERE event_kind IN ('inbound_reply', 'form_visit', 'inbound_override');
