-- 020 — Workspace opt-out is a field, not email silence.
-- Evolution of 024 foot / 025 Contact ▾. Do not recut 019.
-- Flag 15:43.

ALTER TABLE consent_records
  ADD COLUMN IF NOT EXISTS workspace_opted_out BOOLEAN NOT NULL DEFAULT false;
