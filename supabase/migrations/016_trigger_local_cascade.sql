-- 016 — A26 Local cascade. Drop 012 CHECK that forced local_ref.
-- Fields, not a table. Do not recut 015. Flag 15:43.

ALTER TABLE workflow_trigger
  DROP CONSTRAINT IF EXISTS workflow_trigger_local_ref;

ALTER TABLE workflow_trigger
  ADD COLUMN IF NOT EXISTS local_firm_id TEXT,
  ADD COLUMN IF NOT EXISTS local_contact_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
