-- Meeting booked: durable machine outcome that closes the chase loop.
CREATE TABLE IF NOT EXISTS meeting_booked (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  booked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'contact_portal',
  slot TEXT,
  consultant_name TEXT,
  enrollment_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meeting_booked_firm_idx
  ON meeting_booked (firm_id, booked_at DESC);

CREATE INDEX IF NOT EXISTS meeting_booked_contact_idx
  ON meeting_booked (firm_id, contact_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ct_collections') THEN
    INSERT INTO ct_collections (name) VALUES ('meeting_booked')
    ON CONFLICT (name) DO NOTHING;
  END IF;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;
